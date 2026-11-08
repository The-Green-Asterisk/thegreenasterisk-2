import { AbilityName, ClassDefinition } from "./types";
import { FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, CLASSES_2024 } from "./classes";

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

export interface CharacterClassInput {
    classId: string;
    level: number;
    subclassId?: string;
}

export interface MulticlassCasterClassInfo {
    classId: string;
    className: string;
    level: number;
    subclassId?: string;
    ability: AbilityName;
    type: "full" | "half" | "third" | "pact";
    maxCantrips: number;
    maxPrepared: number;
    maxSpellLevel: number;
}

export interface MulticlassSpellSlotsResult {
    effectiveCasterLevel: number;
    standardSlots: number[]; // 9 elements
    warlockLevel: number;
    pactSlotCount: number;
    pactSlotLevel: number;
    isMulticlassTableUsed: boolean;
}

export const WARLOCK_PACT_SLOTS: Array<{ count: number; level: number }> = [
    { count: 1, level: 1 }, // 1
    { count: 2, level: 1 }, // 2
    { count: 2, level: 2 }, // 3
    { count: 2, level: 2 }, // 4
    { count: 2, level: 3 }, // 5
    { count: 2, level: 3 }, // 6
    { count: 2, level: 4 }, // 7
    { count: 2, level: 4 }, // 8
    { count: 2, level: 5 }, // 9
    { count: 2, level: 5 }, // 10
    { count: 3, level: 5 }, // 11
    { count: 3, level: 5 }, // 12
    { count: 3, level: 5 }, // 13
    { count: 3, level: 5 }, // 14
    { count: 3, level: 5 }, // 15
    { count: 3, level: 5 }, // 16
    { count: 4, level: 5 }, // 17
    { count: 4, level: 5 }, // 18
    { count: 4, level: 5 }, // 19
    { count: 4, level: 5 }  // 20
];

export const THIRD_CASTER_SLOTS: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 1
    [0, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 2
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 3
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 4
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 5
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 6
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 7
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 8
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 9
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // Lvl 10
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // Lvl 11
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // Lvl 12
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // Lvl 13
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // Lvl 14
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // Lvl 15
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // Lvl 16
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // Lvl 17
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // Lvl 18
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // Lvl 19
    [4, 3, 3, 1, 0, 0, 0, 0, 0]  // Lvl 20
];

export function getMulticlassCasterInfo(
    classChoice: CharacterClassInput,
    classDef?: ClassDefinition
): MulticlassCasterClassInfo | null {
    const cId = (classChoice.classId || "").toLowerCase();
    const subId = (classChoice.subclassId || "").toLowerCase();
    const lvl = Math.max(1, Math.min(20, Number(classChoice.level) || 1));
    const def = classDef || CLASSES_2024.find((c) => c.id === cId);
    const className = def?.name || cId.charAt(0).toUpperCase() + cId.slice(1);

    if (def?.spellcasting) {
        const lvlIdx = lvl - 1;
        const maxCantrips = def.spellcasting.cantripsKnownByLevel?.[lvlIdx] || 0;
        const maxPrepared = def.spellcasting.preparedSpellsByLevel?.[lvlIdx] || 0;
        const slotsRow = def.spellcasting.spellSlotsByLevel?.[lvlIdx] || [];
        let maxSpellLevel = 0;
        for (let i = slotsRow.length - 1; i >= 0; i--) {
            if (slotsRow[i] > 0) {
                maxSpellLevel = i + 1;
                break;
            }
        }
        return {
            classId: cId,
            className,
            level: lvl,
            subclassId: classChoice.subclassId,
            ability: def.spellcasting.ability,
            type: def.spellcasting.type,
            maxCantrips,
            maxPrepared,
            maxSpellLevel
        };
    }

    if (cId === "fighter" && subId === "eldritch-knight" && lvl >= 3) {
        const thirdCasterSpells = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
        const maxSpellLevel = lvl >= 19 ? 4 : lvl >= 13 ? 3 : lvl >= 7 ? 2 : 1;
        return {
            classId: cId,
            className,
            level: lvl,
            subclassId: classChoice.subclassId,
            ability: "int",
            type: "third",
            maxCantrips: lvl >= 10 ? 3 : 2,
            maxPrepared: thirdCasterSpells[lvl - 1] || 0,
            maxSpellLevel
        };
    }

    if (cId === "rogue" && subId === "arcane-trickster" && lvl >= 3) {
        const thirdCasterSpells = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
        const maxSpellLevel = lvl >= 19 ? 4 : lvl >= 13 ? 3 : lvl >= 7 ? 2 : 1;
        return {
            classId: cId,
            className,
            level: lvl,
            subclassId: classChoice.subclassId,
            ability: "int",
            type: "third",
            maxCantrips: lvl >= 10 ? 4 : 3,
            maxPrepared: thirdCasterSpells[lvl - 1] || 0,
            maxSpellLevel
        };
    }

    return null;
}

export function calculateMulticlassSpellSlots(
    classes: CharacterClassInput[],
    classDefs?: ClassDefinition[]
): MulticlassSpellSlotsResult {
    const casterInfos: MulticlassCasterClassInfo[] = [];
    for (const c of classes) {
        const info = getMulticlassCasterInfo(c, classDefs?.find((x) => x.id === c.classId.toLowerCase()));
        if (info) {
            casterInfos.push(info);
        }
    }

    const standardCasters = casterInfos.filter((c) => c.type !== "pact");
    const pactCaster = casterInfos.find((c) => c.type === "pact");

    let effectiveCasterLevel = 0;
    let standardSlots: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const isMulticlassTableUsed = standardCasters.length > 1;

    if (standardCasters.length === 1 && !isMulticlassTableUsed) {
        const single = standardCasters[0];
        const lvlIdx = single.level - 1;
        if (single.type === "full") {
            effectiveCasterLevel = single.level;
            standardSlots = [...(FULL_CASTER_SLOTS[lvlIdx] || [0, 0, 0, 0, 0, 0, 0, 0, 0])];
        } else if (single.type === "half") {
            effectiveCasterLevel = Math.ceil(single.level / 2);
            standardSlots = [...(HALF_CASTER_SLOTS[lvlIdx] || [0, 0, 0, 0, 0, 0, 0, 0, 0])];
        } else if (single.type === "third") {
            effectiveCasterLevel = Math.floor(single.level / 3);
            standardSlots = [...(THIRD_CASTER_SLOTS[lvlIdx] || [0, 0, 0, 0, 0, 0, 0, 0, 0])];
        }
    } else if (standardCasters.length > 1) {
        for (const sc of standardCasters) {
            if (sc.type === "full") {
                effectiveCasterLevel += sc.level;
            } else if (sc.type === "half") {
                // 2024 D&D rules: half your levels (rounded up) in Paladin and Ranger
                effectiveCasterLevel += Math.ceil(sc.level / 2);
            } else if (sc.type === "third") {
                // a third of your levels (rounded down) in Eldritch Knight and Arcane Trickster
                effectiveCasterLevel += Math.floor(sc.level / 3);
            }
        }
        if (effectiveCasterLevel > 0) {
            const boundedLvl = Math.max(1, Math.min(20, effectiveCasterLevel));
            standardSlots = [...(FULL_CASTER_SLOTS[boundedLvl - 1] || [0, 0, 0, 0, 0, 0, 0, 0, 0])];
        }
    }

    let warlockLevel = 0;
    let pactSlotCount = 0;
    let pactSlotLevel = 0;

    if (pactCaster) {
        warlockLevel = pactCaster.level;
        const boundedWarlock = Math.max(1, Math.min(20, warlockLevel));
        const pactData = WARLOCK_PACT_SLOTS[boundedWarlock - 1] || { count: 1, level: 1 };
        pactSlotCount = pactData.count;
        pactSlotLevel = pactData.level;
    }

    return {
        effectiveCasterLevel,
        standardSlots,
        warlockLevel,
        pactSlotCount,
        pactSlotLevel,
        isMulticlassTableUsed
    };
}
