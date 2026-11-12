import { AbilityName } from "./types";

/**
 * The 2024 rules' skills, each with the ability it uses. Everything that lists skills (the creator, the sheet, D&D
 * Beyond imports, item effects, feature decisions) reads this list. `key` is the slug used in modifier targets
 * ("skills.<key>"). A character can also have skills of its own (`custom` on the sheet); those aren't listed here.
 */
export interface SkillDefinition {
    key: string;
    name: string;
    ability: AbilityName;
}

export const SKILLS: SkillDefinition[] = [
    { key: "acrobatics", name: "Acrobatics", ability: "dex" },
    { key: "animal-handling", name: "Animal Handling", ability: "wis" },
    { key: "arcana", name: "Arcana", ability: "int" },
    { key: "athletics", name: "Athletics", ability: "str" },
    { key: "deception", name: "Deception", ability: "cha" },
    { key: "history", name: "History", ability: "int" },
    { key: "insight", name: "Insight", ability: "wis" },
    { key: "intimidation", name: "Intimidation", ability: "cha" },
    { key: "investigation", name: "Investigation", ability: "int" },
    { key: "medicine", name: "Medicine", ability: "wis" },
    { key: "nature", name: "Nature", ability: "int" },
    { key: "perception", name: "Perception", ability: "wis" },
    { key: "performance", name: "Performance", ability: "cha" },
    { key: "persuasion", name: "Persuasion", ability: "cha" },
    { key: "religion", name: "Religion", ability: "int" },
    { key: "sleight-of-hand", name: "Sleight of Hand", ability: "dex" },
    { key: "stealth", name: "Stealth", ability: "dex" },
    { key: "survival", name: "Survival", ability: "wis" }
];

/** D&D Beyond's ability ids (stats[].id in its character JSON). */
export const DND_BEYOND_ABILITY_ID: Record<AbilityName, number> = { str: 1, dex: 2, con: 3, int: 4, wis: 5, cha: 6 };

/** The rules skill with this name, ignoring case and spacing; undefined for a character's own skill. */
export function findSkill(name: string): SkillDefinition | undefined {
    const wanted = String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
    return SKILLS.find((s) => s.name.toLowerCase() === wanted);
}
