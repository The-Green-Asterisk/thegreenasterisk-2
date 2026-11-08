import { AbilityName } from "./types";

export interface MulticlassPrerequisite {
    stats: AbilityName[];
    mode: "and" | "or";
    label: string;
}

export const MULTICLASS_PREREQUISITES_2024: Record<string, MulticlassPrerequisite> = {
    barbarian: { stats: ["str"], mode: "and", label: "Str 13+" },
    bard: { stats: ["cha"], mode: "and", label: "Cha 13+" },
    cleric: { stats: ["wis"], mode: "and", label: "Wis 13+" },
    druid: { stats: ["wis"], mode: "and", label: "Wis 13+" },
    fighter: { stats: ["str", "dex"], mode: "or", label: "Str 13+ or Dex 13+" },
    monk: { stats: ["dex", "wis"], mode: "and", label: "Dex 13+ & Wis 13+" },
    paladin: { stats: ["str", "cha"], mode: "and", label: "Str 13+ & Cha 13+" },
    ranger: { stats: ["dex", "wis"], mode: "and", label: "Dex 13+ & Wis 13+" },
    rogue: { stats: ["dex"], mode: "and", label: "Dex 13+" },
    sorcerer: { stats: ["cha"], mode: "and", label: "Cha 13+" },
    warlock: { stats: ["cha"], mode: "and", label: "Cha 13+" },
    wizard: { stats: ["int"], mode: "and", label: "Int 13+" }
};

export interface MulticlassProficiencies {
    armor: string[];
    weapons: string[];
    tools: string[];
    skills?: {
        count: number;
        from?: string[]; // undefined means any skill
    };
}

export const MULTICLASS_PROFICIENCIES_2024: Record<string, MulticlassProficiencies> = {
    barbarian: {
        armor: ["Shields"],
        weapons: ["Martial Weapons"],
        tools: []
    },
    bard: {
        armor: ["Light Armor"],
        weapons: [],
        tools: ["Musical Instrument"],
        skills: { count: 1 }
    },
    cleric: {
        armor: ["Light Armor", "Medium Armor", "Shields"],
        weapons: [],
        tools: []
    },
    druid: {
        armor: ["Light Armor", "Medium Armor", "Shields"],
        weapons: [],
        tools: []
    },
    fighter: {
        armor: ["Light Armor", "Medium Armor", "Shields"],
        weapons: ["Martial Weapons"],
        tools: []
    },
    monk: {
        armor: [],
        weapons: [],
        tools: []
    },
    paladin: {
        armor: ["Light Armor", "Medium Armor", "Shields"],
        weapons: ["Martial Weapons"],
        tools: []
    },
    ranger: {
        armor: ["Light Armor", "Medium Armor", "Shields"],
        weapons: ["Martial Weapons"],
        tools: [],
        skills: {
            count: 1,
            from: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"]
        }
    },
    rogue: {
        armor: ["Light Armor"],
        weapons: [],
        tools: ["Thieves' Tools"],
        skills: {
            count: 1,
            from: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]
        }
    },
    sorcerer: {
        armor: [],
        weapons: [],
        tools: []
    },
    warlock: {
        armor: ["Light Armor"],
        weapons: ["Simple Weapons"],
        tools: []
    },
    wizard: {
        armor: [],
        weapons: [],
        tools: []
    }
};

/**
 * Checks if a specific class meets its ability score prerequisite (13+ in required stat(s)).
 */
export function checkClassPrerequisite(
    classId: string,
    getStatScore: (stat: AbilityName) => number
): { met: boolean; label: string; currentScoreText: string } {
    const prereq = MULTICLASS_PREREQUISITES_2024[classId.toLowerCase()];
    if (!prereq) {
        return { met: true, label: "None", currentScoreText: "" };
    }
    const scores = prereq.stats.map((s) => ({ stat: s, score: getStatScore(s) }));
    const currentScoreText = scores.map((s) => `${s.stat.toUpperCase()} ${s.score}`).join(prereq.mode === "and" ? " & " : " or ");
    const met = prereq.mode === "and"
        ? scores.every((s) => s.score >= 13)
        : scores.some((s) => s.score >= 13);

    return { met, label: prereq.label, currentScoreText };
}
