import { AbilityName, ClassDefinition, MulticlassProficiencies } from "./types";
import { FULL_CASTER_SLOTS, CLASSES_2024 } from "./classes";

export interface MulticlassPrerequisite {
    stats: AbilityName[];
    mode: "and" | "or";
    label: string;
}

export type { MulticlassProficiencies };

/**
 * Checks if a specific class meets its ability score prerequisite (13+ in required stat(s)).
 */
export function checkClassPrerequisite(
    classDefOrId: string | ClassDefinition,
    getStatScore: (stat: AbilityName) => number
): { met: boolean; label: string; currentScoreText: string } {
    // Prerequisites come from the class rules (multiclassing.prerequisites)
    let prereq: MulticlassPrerequisite | undefined;
    if (typeof classDefOrId === "object" && classDefOrId !== null) {
        prereq = classDefOrId.multiclassing?.prerequisites;
    } else if (typeof classDefOrId === "string") {
        const found = CLASSES_2024.find((c) => c.id.toLowerCase() === classDefOrId.toLowerCase());
        prereq = found?.multiclassing?.prerequisites;
    }
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
    /** Class spell list this caster prepares from (e.g. "Wizard" for an Eldritch Knight) */
    spellList: string;
    /** This caster's own slot table (by class level), used when it's the only standard caster */
    spellSlotsByLevel?: number[][];
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

/**
 * A class's spellcasting at a class level: its own spellcasting rules, or the spellcastingOverride of its subclass
 * (e.g. Eldritch Knight, Arcane Trickster). Null when the class has no spellcasting at that level.
 */
export function getMulticlassCasterInfo(
    classChoice: CharacterClassInput,
    classDef?: ClassDefinition
): MulticlassCasterClassInfo | null {
    const cId = (classChoice.classId || "").toLowerCase();
    const subId = (classChoice.subclassId || "").toLowerCase();
    const lvl = Math.max(1, Math.min(20, Number(classChoice.level) || 1));
    const def = classDef || CLASSES_2024.find((c) => c.id === cId);
    const className = def?.name || cId.charAt(0).toUpperCase() + cId.slice(1);
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const sub = subId
        ? def?.subclasses?.find((s) => s.id === subId || slug(s.name) === slug(subId) || s.name.toLowerCase() === subId)
        : undefined;
    const sc = def?.spellcasting || sub?.spellcastingOverride;
    if (!sc) return null;

    const lvlIdx = lvl - 1;
    const maxCantrips = sc.cantripsKnownByLevel?.[lvlIdx] || 0;
    const maxPrepared = sc.preparedSpellsByLevel?.[lvlIdx] || 0;
    const slotsRow = sc.spellSlotsByLevel?.[lvlIdx] || [];
    let maxSpellLevel = 0;
    for (let i = slotsRow.length - 1; i >= 0; i--) {
        if (slotsRow[i] > 0) {
            maxSpellLevel = i + 1;
            break;
        }
    }
    if (maxCantrips === 0 && maxPrepared === 0 && maxSpellLevel === 0) return null;

    return {
        classId: cId,
        className,
        level: lvl,
        subclassId: classChoice.subclassId,
        ability: sc.ability,
        type: sc.type,
        spellList: sc.spellList || className,
        spellSlotsByLevel: sc.spellSlotsByLevel,
        maxCantrips,
        maxPrepared,
        maxSpellLevel
    };
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
        // A single spellcasting class uses its own slot table (its rules data)
        const single = standardCasters[0];
        const lvlIdx = single.level - 1;
        effectiveCasterLevel = single.type === "full"
            ? single.level
            : single.type === "half" ? Math.ceil(single.level / 2) : Math.floor(single.level / 3);
        const row = single.spellSlotsByLevel?.[lvlIdx] || [];
        standardSlots = Array.from({ length: 9 }, (_, i) => Number(row[i]) || 0);
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
        // Pact Magic: the pact caster's own slot table row gives the slot count at its single slot level
        warlockLevel = pactCaster.level;
        const row = pactCaster.spellSlotsByLevel?.[Math.max(1, Math.min(20, warlockLevel)) - 1] || [];
        row.forEach((count, i) => {
            if (count > 0) {
                pactSlotCount = count;
                pactSlotLevel = i + 1;
            }
        });
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
