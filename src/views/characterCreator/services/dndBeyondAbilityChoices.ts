import { currentSpeciesTraits, setSpeciesPick } from "./speciesChoices";
import { getData } from "@services/request";
import { AbilityName } from "../../../rules/dnd5e_2024";
import { ALL_SKILLS, AsiChoice } from "../characterCreator.types";

const SKILL_NAMES = ALL_SKILLS.map((s) => s.name);
import { CharacterCreatorContext } from "../controllers/context";
import { getAsiSlots } from "./rulesCalculations";

const SCORE_SUBTYPES: Record<string, AbilityName> = {
    "strength-score": "str",
    "dexterity-score": "dex",
    "constitution-score": "con",
    "intelligence-score": "int",
    "wisdom-score": "wis",
    "charisma-score": "cha"
};

const DDB_STAT_IDS: Record<number, AbilityName> = { 1: "str", 2: "dex", 3: "con", 4: "int", 5: "wis", 6: "cha" };

function slug(text: string): string {
    return text.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function categoriesOf(feat: any): string[] {
    return (feat?.definition?.categories || []).map((c: any) => String(c?.tagName || ""));
}

/**
 * Reads an imported character's base ability scores, background bonuses, origin feat(s), and the choice made in each
 * class's Ability Score Improvement / Epic Boon slot from D&D Beyond's raw character data. D&D Beyond ties each feat to
 * the class feature that granted it (feat.componentId = class feature id), which is what lets a multiclass character's
 * feats land in the right class's slot.
 */
export function applyDndBeyondAbilityChoices(ctx: CharacterCreatorContext, rawCharacter: any): void {
    const raw = rawCharacter?.data || rawCharacter;
    if (!raw || typeof raw !== "object") return;

    // Base scores before any bonuses, shown as entered (they needn't be a standard array or point buy)
    let readScores = false;
    for (const st of Array.isArray(raw.stats) ? raw.stats : []) {
        const ab = DDB_STAT_IDS[Number(st?.id)];
        if (ab && typeof st.value === "number") {
            ctx.state.baseAbilities[ab] = st.value;
            readScores = true;
        }
    }
    if (readScores) ctx.state.abilityMode = "manual";

    // Ability score bonuses by the feat (definition id) that grants them
    const bonusesByFeat = new Map<number, Array<{ stat: AbilityName; value: number }>>();
    for (const m of raw.modifiers?.feat || []) {
        const stat = SCORE_SUBTYPES[String(m?.subType || "")];
        if (m?.type !== "bonus" || !stat) continue;
        const list = bonusesByFeat.get(Number(m.componentId)) || [];
        list.push({ stat, value: Number(m.fixedValue ?? m.value) || 0 });
        bonusesByFeat.set(Number(m.componentId), list);
    }

    // D&D Beyond also lists campaign bookkeeping (renown, boons from adventures) as hidden "disguise" feats
    const feats: any[] = (raw.feats || []).filter((f: any) => f?.definition?.name && !categoriesOf(f).includes("__DISGUISE_FEAT"));
    const bonusesFor = (feat: any) => bonusesByFeat.get(Number(feat?.definition?.id)) || [];

    // Background ability score increases (+2/+1 or +1/+1/+1)
    const bgAsi = feats.find((f) => categoriesOf(f).includes("__INITIAL_ASI"));
    if (bgAsi) {
        const bonuses = bonusesFor(bgAsi).sort((a, b) => b.value - a.value);
        if (bonuses.length === 2 && bonuses[0].value === 2) {
            ctx.state.backgroundOption = "two-and-one";
            ctx.state.bgStatA = bonuses[0].stat;
            ctx.state.bgStatB = bonuses[1].stat;
        } else if (bonuses.length === 3) {
            ctx.state.backgroundOption = "three-ones";
            [ctx.state.bgStatA, ctx.state.bgStatB, ctx.state.bgStatC] = bonuses.map((b) => b.stat);
        }
    }

    // Origin feat(s): the background's, and any a species trait grants
    const findOriginFeat = (name: string) =>
        ctx.originFeats.find((f) => f.name.toLowerCase() === name.toLowerCase() || f.id === slug(name));
    const originIds = feats
        .filter((f) => categoriesOf(f).includes("Origin"))
        .map((f) => findOriginFeat(String(f.definition.name))?.id)
        .filter((id): id is string => !!id);
    if (originIds[0]) ctx.state.originFeatId = originIds[0];
    // Further origin feats go to the species' feat picks (e.g. a Human's Versatile), when it has one
    const featTrait = currentSpeciesTraits(ctx).find((t) => t.featPicks?.category === "origin");
    originIds.slice(1, 1 + (featTrait?.featPicks?.count || 0)).forEach((id, i) => featTrait && setSpeciesPick(ctx, featTrait, i, id));

    // Each class's ASI / Epic Boon slot → the feat D&D Beyond granted through that class feature
    const featureIdBySlot = new Map<string, number>();
    for (const c of raw.classes || []) {
        const className = String(c?.definition?.name || "").toLowerCase();
        for (const cf of c?.classFeatures || []) {
            const def = cf?.definition;
            const name = String(def?.name || "");
            if (!/ability score improvement|epic boon/i.test(name)) continue;
            featureIdBySlot.set(`${className}-${Number(def.requiredLevel)}`, Number(def.id));
        }
    }

    const choices: Record<string, AsiChoice> = {};
    for (const slot of getAsiSlots(ctx)) {
        const featureId = featureIdBySlot.get(`${slot.className.toLowerCase()}-${slot.classLevel}`)
            ?? featureIdBySlot.get(`${slot.classId}-${slot.classLevel}`);
        const feat = featureId !== undefined ? feats.find((f) => Number(f.componentId) === featureId) : undefined;
        if (!feat) {
            // Left empty on D&D Beyond: no bonus, shown as not chosen
            choices[slot.key] = { type: "single" };
            continue;
        }
        const bonuses = bonusesFor(feat);
        const featName = String(feat.definition.name);
        if (/^ability score improvement$/i.test(featName)) {
            const plusTwo = bonuses.find((b) => b.value >= 2);
            choices[slot.key] = plusTwo
                ? { type: "single", statA: plusTwo.stat }
                : { type: "dual", statA: bonuses[0]?.stat, statB: bonuses[1]?.stat };
            continue;
        }
        const featDef = ctx.generalFeats.find((f) => f.name.toLowerCase() === featName.toLowerCase() || f.id === slug(featName));
        choices[slot.key] = {
            type: "feat",
            featId: featDef?.id || slug(featName),
            statA: bonuses[0]?.stat
        };
    }
    ctx.state.asiChoices = choices;

    applyDndBeyondPicks(ctx, raw, feats);
}

/** D&D Beyond's choices for a category (feat, race, background): the component, the prompt, and the picked label. */
function picksFor(raw: any, category: string): Array<{ componentId: number; label: string; picked: string }> {
    const defs = new Map<string, Map<number, string>>();
    for (const cd of raw.choices?.choiceDefinitions || []) {
        if (cd?.id && Array.isArray(cd.options)) defs.set(String(cd.id), new Map(cd.options.map((o: any) => [Number(o.id), String(o.label || "")])));
    }
    return (raw.choices?.[category] || [])
        .map((c: any) => ({
            componentId: Number(c?.componentId),
            label: String(c?.label || ""),
            picked: defs.get(`${c?.componentTypeId}-${c?.type}`)?.get(Number(c?.optionValue)) || ""
        }))
        .filter((p: { picked: string }) => p.picked);
}

const ABILITY_WORDS: Record<AbilityName, string> = {
    str: "strength", dex: "dexterity", con: "constitution", int: "intelligence", wis: "wisdom", cha: "charisma"
};

/**
 * The other picks D&D Beyond records as choices: the origin feat's spellcasting ability (e.g. Magic Initiate), the
 * background's tool, and skills a species trait lets the player pick (e.g. Skillful, Keen Senses).
 */
function applyDndBeyondPicks(ctx: CharacterCreatorContext, raw: any, feats: any[]): void {
    // Spellcasting ability of a spell-granting origin feat (feat data spellcastingAbilityOptions)
    const originFeat = ctx.originFeats.find((f) => f.id === ctx.state.originFeatId);
    const abilityOptions = originFeat?.spellcastingAbilityOptions || [];
    if (originFeat && abilityOptions.length > 1) {
        const ddbFeat = feats.find((f) => slug(String(f.definition.name)) === originFeat.id || String(f.definition.name).toLowerCase() === originFeat.name.toLowerCase());
        const picked = picksFor(raw, "feat")
            .filter((p) => !ddbFeat || p.componentId === Number(ddbFeat.definition.id))
            .map((p) => abilityOptions.find((ab) => p.picked.toLowerCase().startsWith(ABILITY_WORDS[ab])))
            .find(Boolean);
        if (picked) ctx.state.featSpellAbility = picked;
    }

    // The background's tool, when D&D Beyond records which one the player picked
    const background = ctx.backgrounds.find((b) => b.id === ctx.state.backgroundId);
    const toolPick = picksFor(raw, "background").find((p) => /tool|instrument|gaming|kit|supplies/i.test(p.label));
    if (background && toolPick) ctx.state.bgTool = toolPick.picked;

    // Skills species traits let the player pick (species data skillPicks)
    const raceSkillPicks = picksFor(raw, "race").map((p) => p.picked);
    for (const trait of currentSpeciesTraits(ctx)) {
        const count = (trait.skillPicks || []).reduce((sum, p) => sum + p.count, 0);
        if (count === 0) continue;
        const allowed = (trait.skillPicks || []).flatMap((p) => p.from || []);
        const skills = raceSkillPicks.filter((name) => SKILL_NAMES.includes(name) && (allowed.length === 0 || allowed.includes(name)));
        skills.slice(0, count).forEach((skill, i) => setSpeciesPick(ctx, trait, i, skill));
    }
}

/**
 * Re-reads base scores, background bonuses, origin feats and ASI/feat choices from D&D Beyond for a character the
 * creator has already saved (which otherwise keeps its own choices). Bypasses the server's D&D Beyond cache, since
 * the point is to pick up changes just made there.
 */
export async function rereadDndBeyondAbilityChoices(ctx: CharacterCreatorContext): Promise<void> {
    const id = ctx.state.dndBeyondId;
    if (!id) throw new Error("This character isn't linked to D&D Beyond.");
    const raw = await getData<any>(`/get-dndbeyond-character?id=${encodeURIComponent(id)}&fresh=true`);
    if (!raw || !(raw.data || raw).stats) throw new Error("D&D Beyond didn't return this character. Make sure it's public.");
    applyDndBeyondAbilityChoices(ctx, raw);
}
