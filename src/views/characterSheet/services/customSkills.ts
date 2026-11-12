import { findSkill } from "../../../rules/dnd5e_2024/skills";
import { CharacterData, SkillItem } from "../characterData";

export const CUSTOM_SKILL_NAME_MAX = 60;
export const SKILL_ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

type CheckExtras = NonNullable<CharacterData["checkExtras"]>;
type BonusSource = Pick<CharacterData, "abilities" | "vitals" | "skills"> & Partial<Pick<CharacterData, "source" | "checkExtras">>;

const TRAINING_MULTIPLIER: Record<SkillItem["proficiency"], number> = { none: 0, proficient: 1, expertise: 2 };

export function trainingMultiplier(proficiency: string | undefined): number {
    return TRAINING_MULTIPLIER[(proficiency || "none") as SkillItem["proficiency"]] ?? 0;
}

/**
 * Item stats on characters made on the site are layered over each skill by applyMagicalItemBonuses
 * (vitals._itemSkillBonuses); D&D Beyond's numbers already include them.
 */
function itemsLayeredOnSheet(character: Partial<Pick<CharacterData, "source">>): boolean {
    return character.source !== "dndbeyond";
}

/** The ability modifier a skill's own bonus starts from: before items where the sheet adds items afterwards. */
function baseAbilityModifier(character: BonusSource, stat: string): number {
    const wanted = String(stat || "").trim().toUpperCase();
    const ability = character.abilities?.find((a) => String(a.abbr || "").toUpperCase() === wanted);
    if (!ability) return 0;
    if (!itemsLayeredOnSheet(character)) return ability.modifier;
    const natural = typeof ability.baseScore === "number"
        ? ability.baseScore + (typeof ability.bonus === "number" ? ability.bonus : 0)
        : ability.score;
    return typeof natural === "number" && Number.isFinite(natural) ? Math.floor((natural - 10) / 2) : (Number(ability.modifier) || 0);
}

/**
 * The character's check extras, or for characters saved before they were recorded, the smallest extra its rules
 * skills show at each training level (their bonus less ability, proficiency, and items). Effects on one skill only
 * raise that skill, so the smallest is what every check gets.
 */
export function checkExtrasFor(character: BonusSource): CheckExtras {
    if (character.checkExtras) return character.checkExtras;
    const pb = Number(character.vitals?.proficiencyBonus) || 0;
    const itemParts: Record<string, number> = (character.vitals as any)?._itemSkillBonuses || {};
    const leftovers = { trained: [] as number[], untrained: [] as number[] };
    for (const skill of character.skills || []) {
        if (skill.custom || !findSkill(skill.name)) continue;
        const mult = trainingMultiplier(skill.proficiency);
        const items = itemsLayeredOnSheet(character) ? Number(itemParts[skill.name]) || 0 : 0;
        const leftover = (Number(skill.bonus) || 0) - baseAbilityModifier(character, skill.stat) - pb * mult - items;
        leftovers[mult > 0 ? "trained" : "untrained"].push(leftover);
    }
    // Nothing grants a general penalty to checks here (item penalties are in the item share), so never below zero
    const least = (values: number[]) => (values.length > 0 ? Math.max(0, Math.min(...values)) : 0);
    const general = { trained: least(leftovers.trained), untrained: least(leftovers.untrained) };
    return Object.fromEntries(SKILL_ABILITIES.map((ab) => [ab, { ...general }]));
}

/** What a check with this ability gets besides modifier and proficiency, for the given training. */
export function checkExtra(character: BonusSource, stat: string, proficiency: string | undefined): number {
    const extras = checkExtrasFor(character)[String(stat || "").toUpperCase()];
    return (trainingMultiplier(proficiency) > 0 ? extras?.trained : extras?.untrained) ?? 0;
}

/**
 * A custom skill's bonus before items the sheet layers on: its ability modifier, the proficiency bonus once
 * (proficient) or twice (expertise), and what checks with that ability get (Jack of All Trades, check bonuses).
 */
export function customSkillBonus(character: BonusSource, stat: string, proficiency: SkillItem["proficiency"]): number {
    const pb = Number(character.vitals?.proficiencyBonus) || 0;
    return baseAbilityModifier(character, stat) + pb * trainingMultiplier(proficiency) + checkExtra(character, stat, proficiency);
}

/**
 * Adds a skill of the character's own. Returns the new skill, or a message saying why it can't be added: no name,
 * a name that's too long, an ability that isn't one of the six, or a name the character's skills already use.
 * Run the sheet's stat sync afterwards so items reach it like any other skill.
 */
export function addCustomSkill(
    character: CharacterData,
    rawName: string,
    stat: string,
    proficiency: SkillItem["proficiency"] = "none"
): SkillItem | string {
    const name = String(rawName || "").trim().replace(/\s+/g, " ");
    const ability = String(stat || "").trim().toUpperCase();
    if (!name) return "Enter a name for the skill.";
    if (name.length > CUSTOM_SKILL_NAME_MAX) return `Skill names can be up to ${CUSTOM_SKILL_NAME_MAX} characters.`;
    if (!(SKILL_ABILITIES as readonly string[]).includes(ability)) return "Choose the ability the skill uses.";
    if (!Array.isArray(character.skills)) character.skills = [];
    if (findSkill(name) || character.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        return `${name} is already on this sheet.`;
    }
    const skill: SkillItem = { name, stat: ability, proficiency, bonus: customSkillBonus(character, ability, proficiency), custom: true };
    const itemParts = (character.vitals as any)?._itemSkillBonuses;
    if (itemParts) delete itemParts[name];
    character.skills.push(skill);
    return skill;
}

/** Removes one of the character's own skills by name. The rules' skills can't be removed. */
export function removeCustomSkill(character: CharacterData, name: string): boolean {
    const index = (character.skills || []).findIndex((s) => s.custom && s.name === name);
    if (index < 0) return false;
    character.skills.splice(index, 1);
    const itemParts = (character.vitals as any)?._itemSkillBonuses;
    if (itemParts) delete itemParts[name];
    return true;
}

/**
 * Copies the source character's own skills onto a rebuilt character (a D&D Beyond reload), which only knows the
 * rules' skills. Each keeps its training and gets its bonus again from the rebuilt abilities and check extras.
 */
export function carryCustomSkills(target: CharacterData, source: Pick<CharacterData, "skills"> | null | undefined): void {
    const own = (source?.skills || []).filter((s) => s.custom);
    if (own.length === 0) return;
    if (!Array.isArray(target.skills)) target.skills = [];
    for (const skill of own) {
        if (target.skills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase())) continue;
        const proficiency = skill.proficiency || "none";
        target.skills.push({ name: skill.name, stat: skill.stat, proficiency, bonus: customSkillBonus(target, skill.stat, proficiency), custom: true });
    }
}
