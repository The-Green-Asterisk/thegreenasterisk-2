import { currentSpeciesTraits, setSpeciesPick } from "./speciesChoices";
import { getData } from "@services/request";
import { AbilityName } from "../../../rules/dnd5e_2024";
import { AsiChoice } from "../characterCreator.types";
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
