import { currentSpecies, getSpeciesFeatPicks, getSpeciesSkillPicks, traitBaseName } from "./speciesChoices";
import { GeneralFeatDefinition, OriginFeatDefinition, StatModifier } from "../../../rules/dnd5e_2024";
import { BonusPart } from "../../characterSheet/characterData";
import { ALL_SKILLS } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";
import { getProgressionModifiers } from "./progressionModifiers";
import { getAsiSlots } from "./rulesCalculations";

const ALL_SKILL_NAMES = ALL_SKILLS.map((s) => s.name);

/** A pool of skill (or Expertise) picks: how many, and from which skills (null = any). */
export interface SkillSource {
    key: string;
    label: string;
    count: number;
    from: string[] | null;
}

/** Skills a feat lets the player choose. "proficiency-or-expertise" grants Expertise if already proficient. */
export interface FeatSkillSection extends SkillSource {
    mode: "proficiency" | "proficiency-or-expertise";
}

/** A skill modifier from a class or subclass progression feature or chosen option, with what granted it. */
export interface ProgressionSkillModifier extends StatModifier {
    /** Skill name, or "unproficient" for modifiers that apply to every skill without proficiency */
    skill: string;
    source: string;
}

function classLevel(ctx: CharacterCreatorContext, classId: string): number {
    return (ctx.state.classes || []).filter((c) => c.classId === classId).reduce((sum, c) => sum + (c.level || 0), 0);
}

/**
 * The class's skill choices, from the class rules: the starting class gives its full skillChoices; each other class
 * adds its multiclassing.proficiencies.skills (if any).
 */
export function getClassSkillSources(ctx: CharacterCreatorContext): SkillSource[] {
    ctx.syncStateClassProperties();
    const sources: SkillSource[] = [];
    (ctx.state.classes || []).forEach((cc, i) => {
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        const name = cls?.name || cc.classId;
        if (i === 0) {
            sources.push({ key: cc.classId, label: name, count: cls?.skillChoices?.count || 0, from: cls?.skillChoices?.from || null });
            return;
        }
        const skills = cls?.multiclassing?.proficiencies?.skills;
        if (skills?.count) {
            sources.push({ key: cc.classId, label: `${name} (multiclass)`, count: skills.count, from: skills.from || null });
        }
    });
    return sources;
}

/**
 * Skill modifiers (targets "skills.<name>" or "skills.unproficient") from the character's class and subclass
 * progressions, with what granted each.
 */
export function getProgressionSkillModifiers(ctx: CharacterCreatorContext): ProgressionSkillModifier[] {
    const result: ProgressionSkillModifier[] = [];
    for (const m of getProgressionModifiers(ctx)) {
        const target = String(m.target || "");
        if (!target.startsWith("skills.")) continue;
        const key = target.slice("skills.".length).toLowerCase().replace(/[-_]/g, " ");
        const skill = key === "unproficient" ? "unproficient" : ALL_SKILL_NAMES.find((n) => n.toLowerCase() === key);
        if (skill) result.push({ ...m, skill, source: m.source });
    }
    return result;
}

/** A feat the character has taken, the key its skill picks are saved under, and where it came from. */
interface TakenFeat {
    key: string;
    label: string;
    feat: OriginFeatDefinition | GeneralFeatDefinition;
}

function findFeat(ctx: CharacterCreatorContext, featId: string): OriginFeatDefinition | GeneralFeatDefinition | undefined {
    if (!featId) return undefined;
    return ctx.originFeats.find((f) => f.id === featId) || ctx.generalFeats.find((f) => f.id === featId);
}

/** Every feat the character has: the origin feat, feats from species traits (e.g. Versatile), and ASI-slot feats. */
export function getCharacterFeats(ctx: CharacterCreatorContext): Array<OriginFeatDefinition | GeneralFeatDefinition> {
    return getTakenFeats(ctx).map((t) => t.feat);
}

/** The origin feat, feats from species traits (e.g. Versatile), and feats taken in Ability Score Improvement slots. */
function getTakenFeats(ctx: CharacterCreatorContext): TakenFeat[] {
    const taken: TakenFeat[] = [];
    const origin = findFeat(ctx, ctx.state.originFeatId);
    if (origin) taken.push({ key: `origin:${origin.id}`, label: `${origin.name} (origin feat)`, feat: origin });
    // Feats picked through species traits (e.g. a Human's Versatile); saved under "<species id>-origin:<feat id>"
    const species = currentSpecies(ctx);
    for (const { featId, trait } of getSpeciesFeatPicks(ctx)) {
        if (featId === ctx.state.originFeatId) continue;
        const feat = findFeat(ctx, featId);
        if (feat) taken.push({ key: `${species?.id || "species"}-origin:${feat.id}`, label: `${feat.name} (${species?.name || "Species"} ${traitBaseName(trait.name)} feat)`, feat });
    }
    const isMulticlass = (ctx.state.classes || []).length > 1;
    for (const slot of getAsiSlots(ctx)) {
        const choice = ctx.state.asiChoices?.[slot.key];
        if (choice?.type !== "feat" || !choice.featId) continue;
        const feat = findFeat(ctx, choice.featId);
        if (!feat) continue;
        const where = isMulticlass ? `${slot.className} ${slot.classLevel}` : `Level ${slot.classLevel}`;
        taken.push({ key: `asi:${slot.key}:${feat.id}`, label: `${feat.name} (${where})`, feat });
    }
    return taken;
}

/**
 * Skill picks offered by the character's feats (feat data skillPicks), e.g. Skilled, Skill Expert, Keen Mind, and
 * Observant. A feat's first pick is saved under its key; any further ones under "<key>:<n>".
 */
export function getFeatSkillSections(ctx: CharacterCreatorContext): FeatSkillSection[] {
    const sections: FeatSkillSection[] = [];
    for (const { key, label, feat } of getTakenFeats(ctx)) {
        (feat.skillPicks || [])
            .filter((p) => p.mode !== "expertise" && p.count > 0)
            .forEach((p, i) => sections.push({
                key: i === 0 ? key : `${key}:${i}`,
                label,
                count: p.count,
                from: p.from && p.from.length > 0 ? p.from : null,
                mode: p.mode as FeatSkillSection["mode"]
            }));
    }
    return sections;
}

/** Skills granted outright (background, species, class/subclass progression), with the label to show for each. */
export function getGrantedSkills(ctx: CharacterCreatorContext): Map<string, string> {
    const granted = new Map<string, string>();
    const bg = ctx.backgrounds.find((b) => b.id === ctx.state.backgroundId);
    for (const s of bg?.skills || []) granted.set(s, "Background");
    for (const { skill, source } of getSpeciesSkillPicks(ctx)) granted.set(skill, source);
    for (const m of getProgressionSkillModifiers(ctx)) {
        if (m.type === "proficiency_tier" && m.value !== "expertise" && m.skill !== "unproficient" && !granted.has(m.skill)) {
            granted.set(m.skill, m.source);
        }
    }
    return granted;
}

function featChoicesFor(ctx: CharacterCreatorContext, key: string): string[] {
    return ctx.state.featSkillChoices?.[key] || [];
}

/** Every skill the character is proficient in, from any source. */
export function getProficientSkills(ctx: CharacterCreatorContext): Set<string> {
    const set = new Set<string>(getGrantedSkills(ctx).keys());
    ctx.state.classSkills.forEach((s) => set.add(s));
    for (const sec of getFeatSkillSections(ctx)) featChoicesFor(ctx, sec.key).forEach((s) => set.add(s));
    return set;
}

/**
 * Expertise granted by class/subclass progression (e.g. Wizard Scholar) for skills the character isn't proficient in.
 * Expertise needs proficiency, so these give nothing until the skill is picked some other way.
 */
export function getUnmetProgressionExpertise(ctx: CharacterCreatorContext): Array<{ skill: string; source: string }> {
    const proficient = getProficientSkills(ctx);
    return getProgressionSkillModifiers(ctx)
        .filter((m) => m.type === "proficiency_tier" && m.value === "expertise" && m.skill !== "unproficient" && !proficient.has(m.skill))
        .map((m) => ({ skill: m.skill, source: m.source }));
}

/**
 * Expertise that isn't picked on the Skills step: from class/subclass progression (e.g. Wizard Scholar), for
 * proficient skills; and from Keen Mind / Observant, when the chosen skill is already proficient another way.
 */
export function getGrantedExpertiseSkills(ctx: CharacterCreatorContext): Map<string, string> {
    const result = new Map<string, string>();
    const proficient = getProficientSkills(ctx);
    for (const m of getProgressionSkillModifiers(ctx)) {
        if (m.type === "proficiency_tier" && m.value === "expertise" && proficient.has(m.skill)) result.set(m.skill, m.source);
    }
    const sections = getFeatSkillSections(ctx);
    for (const sec of sections.filter((s) => s.mode === "proficiency-or-expertise")) {
        for (const skill of featChoicesFor(ctx, sec.key)) {
            const otherwise = new Set<string>(getGrantedSkills(ctx).keys());
            ctx.state.classSkills.forEach((s) => otherwise.add(s));
            for (const other of sections) {
                if (other.key !== sec.key) featChoicesFor(ctx, other.key).forEach((s) => otherwise.add(s));
            }
            if (otherwise.has(skill)) result.set(skill, sec.label.replace(/ \(.*\)$/, ""));
        }
    }
    return result;
}

/**
 * Expertise picks: each class's scalingTraits.expertiseByLevel at its class level, plus feats' Expertise picks
 * (feat data skillPicks, e.g. Skill Expert).
 */
export function getExpertiseSources(ctx: CharacterCreatorContext): SkillSource[] {
    ctx.syncStateClassProperties();
    const sources: SkillSource[] = [];
    const seen = new Set<string>();
    for (const cc of ctx.state.classes || []) {
        if (seen.has(cc.classId)) continue;
        seen.add(cc.classId);
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        const table: number[] | undefined = cls?.scalingTraits?.expertiseByLevel;
        const count = table?.[Math.min(classLevel(ctx, cc.classId), table.length - 1)] || 0;
        if (count > 0) sources.push({ key: cc.classId, label: cls?.name || cc.classId, count, from: null });
    }
    for (const { key, label, feat } of getTakenFeats(ctx)) {
        (feat.skillPicks || [])
            .filter((p) => p.mode === "expertise" && p.count > 0)
            .forEach((p, i) => sources.push({ key: i === 0 ? `${key}:expertise` : `${key}:expertise:${i}`, label, count: p.count, from: p.from && p.from.length > 0 ? p.from : null }));
    }
    return sources;
}

export function getMaxExpertiseCount(ctx: CharacterCreatorContext): number {
    return getExpertiseSources(ctx).reduce((sum, s) => sum + s.count, 0);
}

/**
 * Assigns picks to sources (each source takes up to `count` picks from its `from` list) so that as many picks as
 * possible fit — an exact bipartite matching, so a skill several sources could take never blocks another.
 */
export function matchSkillsToSources(picks: string[], sources: SkillSource[]): { assigned: Map<string, string>; unassigned: string[] } {
    const slots: SkillSource[] = sources.flatMap((s) => Array.from({ length: Math.max(0, s.count) }, () => s));
    const slotOwner: Array<string | null> = slots.map(() => null);
    const fits = (skill: string, slot: SkillSource) => !slot.from || slot.from.includes(skill);
    const tryAssign = (skill: string, seen: Set<number>): boolean => {
        for (let i = 0; i < slots.length; i++) {
            if (seen.has(i) || !fits(skill, slots[i])) continue;
            seen.add(i);
            if (slotOwner[i] === null || tryAssign(slotOwner[i]!, seen)) {
                slotOwner[i] = skill;
                return true;
            }
        }
        return false;
    };
    const unassigned: string[] = [];
    for (const skill of picks) {
        if (!tryAssign(skill, new Set())) unassigned.push(skill);
    }
    const assigned = new Map<string, string>();
    slotOwner.forEach((skill, i) => {
        if (skill) assigned.set(skill, slots[i].key);
    });
    return { assigned, unassigned };
}

/** Whether one more pick still fits every pick into a source. */
export function canAddPick(picks: string[], skill: string, sources: SkillSource[]): boolean {
    return matchSkillsToSources([...picks, skill], sources).unassigned.length === 0;
}

export function getClassSkillMatch(ctx: CharacterCreatorContext) {
    return matchSkillsToSources(ctx.state.classSkills, getClassSkillSources(ctx));
}

export function getExpertiseMatch(ctx: CharacterCreatorContext) {
    return matchSkillsToSources(ctx.state.expertiseSkills, getExpertiseSources(ctx));
}

/**
 * Keeps skill choices consistent without throwing away a player's picks: drops class and feat picks of skills already
 * granted (background, species, class features), class picks a feat also gives, feat picks for feats no longer taken
 * or outside the feat's list, and Expertise in skills the character isn't proficient in or already has Expertise in.
 * Over-limit picks are kept and warned about when leaving the step.
 */
export function sanitizeSkillSelections(ctx: CharacterCreatorContext): void {
    ctx.state.featSkillChoices = ctx.state.featSkillChoices || {};
    const granted = getGrantedSkills(ctx);
    const sections = getFeatSkillSections(ctx);
    const activeKeys = new Set(sections.map((s) => s.key));
    for (const key of Object.keys(ctx.state.featSkillChoices)) {
        if (!activeKeys.has(key)) delete ctx.state.featSkillChoices[key];
    }
    const featPicked = new Set<string>();
    for (const sec of sections) {
        const list = (ctx.state.featSkillChoices[sec.key] || [])
            .filter((s) => ALL_SKILL_NAMES.includes(s) && (!sec.from || sec.from.includes(s)))
            .filter((s) => sec.mode === "proficiency-or-expertise" || (!granted.has(s) && !featPicked.has(s)));
        ctx.state.featSkillChoices[sec.key] = Array.from(new Set(list));
        if (sec.mode === "proficiency") list.forEach((s) => featPicked.add(s));
    }
    ctx.state.classSkills = Array.from(new Set(ctx.state.classSkills))
        .filter((s) => ALL_SKILL_NAMES.includes(s) && !granted.has(s) && !featPicked.has(s));
    const proficient = getProficientSkills(ctx);
    const grantedExpertise = getGrantedExpertiseSkills(ctx);
    ctx.state.expertiseSkills = Array.from(new Set(ctx.state.expertiseSkills))
        .filter((s) => proficient.has(s) && !grantedExpertise.has(s));
}

/**
 * Splits an imported character's proficient skills (everything not granted by background, species or class
 * features) between its class picks and its feats' picks, filling class sources first.
 */
export function distributeImportedSkills(ctx: CharacterCreatorContext, proficient: string[]): void {
    const granted = getGrantedSkills(ctx);
    const chosen = proficient.filter((s) => !granted.has(s));
    const { assigned, unassigned } = matchSkillsToSources(chosen, getClassSkillSources(ctx));
    const classPicks = chosen.filter((s) => assigned.has(s));
    let leftovers = [...unassigned];
    ctx.state.featSkillChoices = {};
    for (const sec of getFeatSkillSections(ctx).filter((s) => s.mode === "proficiency")) {
        const take = leftovers.filter((s) => !sec.from || sec.from.includes(s)).slice(0, sec.count);
        ctx.state.featSkillChoices[sec.key] = take;
        leftovers = leftovers.filter((s) => !take.includes(s));
    }
    // Anything that fits nowhere stays as a class pick, flagged as over the limit, rather than being dropped
    ctx.state.classSkills = [...classPicks, ...leftovers];
}

/**
 * Added to a skill's bonus beyond ability + proficiency, from class/subclass progression modifiers: ability_mod
 * (e.g. Thaumaturge: Wisdom modifier, minimum +1) and half_proficiency on skills without proficiency (e.g. Jack of
 * All Trades).
 */
/** What every skill check gets from class features, named: half proficiency when untrained (Jack of All Trades). */
export function getGeneralCheckParts(ctx: CharacterCreatorContext, pb: number): BonusPart[] {
    const parts: BonusPart[] = [];
    for (const m of getProgressionSkillModifiers(ctx)) {
        if (m.skill === "unproficient" && m.type === "half_proficiency") {
            parts.push({ label: m.source, value: Math.floor(pb / 2), untrainedOnly: true });
        }
    }
    return parts;
}

/** What one skill gets from class features beyond ability and proficiency, named. */
export function getSkillExtraParts(ctx: CharacterCreatorContext, skill: string, pb: number): BonusPart[] {
    const parts: BonusPart[] = [];
    for (const m of getProgressionSkillModifiers(ctx)) {
        if (m.skill !== skill) continue;
        if (m.type === "ability_mod" && m.abilitySource) {
            parts.push({ label: m.source, value: Math.max(m.minimum ?? -Infinity, ctx.getAbilityModifier(m.abilitySource)) });
        } else if (m.type === "half_proficiency") {
            parts.push({ label: m.source, value: Math.floor(pb / 2) });
        } else if ((m.type === "bonus" || m.type === "penalty") && typeof m.value === "number") {
            parts.push({ label: m.source, value: m.type === "penalty" ? -m.value : m.value });
        }
    }
    return parts;
}

export function getSkillBonusExtras(ctx: CharacterCreatorContext, skill: string, proficient: boolean, pb: number): number {
    let extra = 0;
    for (const p of getGeneralCheckParts(ctx, pb)) {
        if (!p.untrainedOnly || !proficient) extra += p.value;
    }
    for (const p of getSkillExtraParts(ctx, skill, pb)) extra += p.value;
    return extra;
}
