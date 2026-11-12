import { findSkill } from "../../../rules/dnd5e_2024/skills";
import { CharacterData, SkillItem } from "../characterData";

export const CUSTOM_SKILL_NAME_MAX = 60;
export const SKILL_ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

const TRAINING_MULTIPLIER: Record<SkillItem["proficiency"], number> = { none: 0, proficient: 1, expertise: 2 };

function abilityModifier(character: Pick<CharacterData, "abilities">, stat: string): number {
    const wanted = String(stat || "").trim().toUpperCase();
    return character.abilities?.find((a) => String(a.abbr || "").toUpperCase() === wanted)?.modifier ?? 0;
}

/** A custom skill's bonus: its ability modifier plus the proficiency bonus once (proficient) or twice (expertise). */
export function customSkillBonus(character: Pick<CharacterData, "abilities" | "vitals">, stat: string, proficiency: SkillItem["proficiency"]): number {
    const pb = Number(character.vitals?.proficiencyBonus) || 0;
    return abilityModifier(character, stat) + pb * TRAINING_MULTIPLIER[proficiency];
}

/**
 * Adds a skill of the character's own. Returns the new skill, or a message saying why it can't be added: no name,
 * a name that's too long, an ability that isn't one of the six, or a name the character's skills already use.
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
    character.skills.push(skill);
    return skill;
}

/** Removes one of the character's own skills by name. The rules' skills can't be removed. */
export function removeCustomSkill(character: CharacterData, name: string): boolean {
    const index = (character.skills || []).findIndex((s) => s.custom && s.name === name);
    if (index < 0) return false;
    character.skills.splice(index, 1);
    return true;
}

/**
 * Copies the source character's own skills onto a rebuilt character (a D&D Beyond reload, the creator), which only
 * knows the rules' skills. Each keeps its training and gets its bonus again from the rebuilt abilities.
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
