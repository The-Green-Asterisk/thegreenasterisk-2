import {
    CharacterData,
    FeatureChoiceOption,
    FeatureDecision,
    FeatureItem
} from "./characterData";
import { applyProgressionChoiceOption } from "../../rules/dnd5e_2024/statModifierEvaluator";
import { findClassOption } from "../../rules/dnd5e_2024/classOptions";
import { classChoiceDecisionIds, classChoiceModifiers, classChoiceOptions, findChoiceOption, matchClassChoice, unlockedClassChoices } from "./classChoiceDecisions";
import { GeneralFeatDefinition, SpeciesDefinition, SpeciesTrait } from "../../rules/dnd5e_2024/types";
import { detectLineage, traitBaseName } from "../../rules/dnd5e_2024/speciesRules";
import { findFeatRule, getSpeciesRules, getCanonicalClassesForFeature, getCanonicalSubclassesForFeature } from "../../services/classRules";

export const ABILITY_META: Record<number, { id: number; name: string; abbr: string; key: string }> = {
    1: { id: 1, name: "Strength", abbr: "STR", key: "strength" },
    2: { id: 2, name: "Dexterity", abbr: "DEX", key: "dexterity" },
    3: { id: 3, name: "Constitution", abbr: "CON", key: "constitution" },
    4: { id: 4, name: "Intelligence", abbr: "INT", key: "intelligence" },
    5: { id: 5, name: "Wisdom", abbr: "WIS", key: "wisdom" },
    6: { id: 6, name: "Charisma", abbr: "CHA", key: "charisma" }
};

export const ABILITY_KEY_TO_ID: Record<string, number> = {
    strength: 1,
    str: 1,
    dexterity: 2,
    dex: 2,
    constitution: 3,
    con: 3,
    intelligence: 4,
    int: 4,
    wisdom: 5,
    wis: 5,
    charisma: 6,
    cha: 6
};

export const SKILL_META: Array<{ name: string; stat: string; statId: number; key: string }> = [
    { name: "Acrobatics", stat: "DEX", statId: 2, key: "acrobatics" },
    { name: "Animal Handling", stat: "WIS", statId: 5, key: "animal-handling" },
    { name: "Arcana", stat: "INT", statId: 4, key: "arcana" },
    { name: "Athletics", stat: "STR", statId: 1, key: "athletics" },
    { name: "Deception", stat: "CHA", statId: 6, key: "deception" },
    { name: "History", stat: "INT", statId: 4, key: "history" },
    { name: "Insight", stat: "WIS", statId: 5, key: "insight" },
    { name: "Intimidation", stat: "CHA", statId: 6, key: "intimidation" },
    { name: "Investigation", stat: "INT", statId: 4, key: "investigation" },
    { name: "Medicine", stat: "WIS", statId: 5, key: "medicine" },
    { name: "Nature", stat: "INT", statId: 4, key: "nature" },
    { name: "Perception", stat: "WIS", statId: 5, key: "perception" },
    { name: "Performance", stat: "CHA", statId: 6, key: "performance" },
    { name: "Persuasion", stat: "CHA", statId: 6, key: "persuasion" },
    { name: "Religion", stat: "INT", statId: 4, key: "religion" },
    { name: "Sleight of Hand", stat: "DEX", statId: 2, key: "sleight-of-hand" },
    { name: "Stealth", stat: "DEX", statId: 2, key: "stealth" },
    { name: "Survival", stat: "WIS", statId: 5, key: "survival" }
];

const SKILL_KEY_SET = new Set(SKILL_META.map(s => s.key));

export const DAMAGE_RESISTANCE_TYPES: Array<{ key: string; label: string }> = [
    { key: "acid", label: "Acid" },
    { key: "cold", label: "Cold" },
    { key: "fire", label: "Fire" },
    { key: "force", label: "Force" },
    { key: "lightning", label: "Lightning" },
    { key: "necrotic", label: "Necrotic" },
    { key: "poison", label: "Poison" },
    { key: "psychic", label: "Psychic" },
    { key: "radiant", label: "Radiant" },
    { key: "thunder", label: "Thunder" }
];

export const FIGHTING_STYLE_OPTIONS: FeatureChoiceOption[] = [
    { value: "fighting-style:archery", label: "Archery (+2 Ranged Weapon Attacks)" },
    { value: "fighting-style:defense", label: "Defense (+1 Armor Class)" },
    { value: "fighting-style:dueling", label: "Dueling (+2 One-Handed Melee Damage)" },
    { value: "fighting-style:great-weapon", label: "Great Weapon Fighting (2H Damage Floor)" },
    { value: "fighting-style:protection", label: "Protection (Shield Reaction Disadvantage)" },
    { value: "fighting-style:two-weapon", label: "Two-Weapon Fighting (Off-Hand Ability Mod)" },
    { value: "fighting-style:thrown", label: "Thrown Weapon Fighting (+2 Thrown Damage)" },
    { value: "fighting-style:blind-fighting", label: "Blind Fighting (10 ft. Blindsight)" },
    { value: "fighting-style:interception", label: "Interception (Reduce Damage by 1d10 + PB)" },
    { value: "fighting-style:unarmed", label: "Unarmed Fighting (1d6/1d8 Unarmed Strikes)" }
];

function slugifyKey(input: string): string {
    return String(input || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function stripHtml(input: string): string {
    return String(input || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildAbilityChoiceOptions(statIds: number[], bonus = 1): FeatureChoiceOption[] {
    const uniqueIds = Array.from(new Set(statIds)).filter(id => ABILITY_META[id]);
    const finalIds = uniqueIds.length > 0 ? uniqueIds : [1, 2, 3, 4, 5, 6];
    return finalIds.map(id => ({
        value: `ability:${id}:${bonus}`,
        label: `${ABILITY_META[id].name} (+${bonus} ${ABILITY_META[id].abbr})`
    }));
}

export function buildResilientChoiceOptions(): FeatureChoiceOption[] {
    return [1, 2, 3, 4, 5, 6].map(id => ({
        value: `resilient:${id}`,
        label: `${ABILITY_META[id].name} (+1 ${ABILITY_META[id].abbr} & ${ABILITY_META[id].abbr} Save Proficiency)`
    }));
}

export function buildSkillChoiceOptions(mode: "prof" | "exp", allowedSkillKeys?: string[]): FeatureChoiceOption[] {
    const prefix = mode === "exp" ? "skill-exp" : "skill-prof";
    const suffix = mode === "exp" ? "Expertise" : "Proficiency";
    const list = allowedSkillKeys?.length
        ? SKILL_META.filter(s => allowedSkillKeys.includes(s.key))
        : SKILL_META;
    return list.map(s => ({
        value: `${prefix}:${s.key}`,
        label: `${s.name} (${s.stat} ${suffix})`
    }));
}

export function buildResistanceChoiceOptions(): FeatureChoiceOption[] {
    return DAMAGE_RESISTANCE_TYPES.map(d => ({
        value: `resistance:${d.key}`,
        label: `${d.label} Resistance`
    }));
}

/**
 * Infers which ability score IDs (1..6) a feat or feature allows the user to choose between
 * based on its name and description text.
 */
const FEAT_ABILITY_IDS: Record<string, number> = { str: 1, dex: 2, con: 3, int: 4, wis: 5, cha: 6 };

/** The species (or lineage) trait a feature is, by name or the part before a colon ("Fiendish Legacy: Infernal"). */
function findSpeciesTrait(featureName: string): { species: SpeciesDefinition; trait: SpeciesTrait } | undefined {
    const name = String(featureName || "").toLowerCase().trim();
    const prefix = name.split(":")[0].trim();
    for (const species of getSpeciesRules()) {
        const traits = [...(species.traits || []), ...(species.lineages || []).flatMap(l => l.traits || [])];
        const trait = traits.find(t => {
            const tn = traitBaseName(t.name).toLowerCase();
            return tn === name || tn === prefix || tn.split(":")[0].trim() === prefix;
        });
        if (trait) return { species, trait };
    }
    return undefined;
}

export function inferAllowedAbilityIdsFromFeature(featureName: string, description: string): number[] | null {
    const nameLower = String(featureName || "").toLowerCase();
    const cleanDesc = stripHtml(description).toLowerCase();

    // A feat's allowed abilities (feat data allowedStats), by its whole name or the part before a colon
    const feat = findFeatRule(featureName) || findFeatRule(String(featureName || "").split(":")[0]);
    const featStats = (feat as GeneralFeatDefinition | undefined)?.allowedStats;
    if (Array.isArray(featStats) && featStats.length > 0) {
        const ids = featStats.map(ab => FEAT_ABILITY_IDS[ab]).filter(Boolean);
        if (ids.length > 0) return ids;
    }
    if (feat) return null;

    // The Ability Score Improvement class feature (any ability)
    if (nameLower.includes("ability score improvement") || nameLower.includes("ability score increase")) {
        return [1, 2, 3, 4, 5, 6];
    }

    // Parse "Increase your X, Y, or Z score by 1" or "Increase one ability score of your choice"
    if (/increase (?:one|an) ability score of your choice/i.test(cleanDesc)) {
        return [1, 2, 3, 4, 5, 6];
    }

    const clauseMatch = cleanDesc.match(
        /increase your ([a-z,\s]+?)\s+score by\s+(\d+)/i
    );
    if (clauseMatch) {
        const clause = clauseMatch[1];
        const matchedIds: number[] = [];
        for (const [idStr, meta] of Object.entries(ABILITY_META)) {
            if (clause.includes(meta.key)) {
                matchedIds.push(Number(idStr));
            }
        }
        if (matchedIds.length >= 2) {
            return matchedIds;
        }
    }

    return null;
}

/**
 * Converts a canonical decision option value (e.g. "ability:6:1", "skill-exp:perception",
 * "fighting-style:defense", "resilient:5") into D&D Beyond modifier objects for `allMods`.
 */
export function decisionValueToModifiers(selectedValue: string, sourceKey = "feat"): any[] {
    if (!selectedValue) return [];
    const parts = selectedValue.split(":");
    const kind = parts[0];

    if (kind === "ability") {
        const statId = Number(parts[1]) || 6;
        const bonus = Number(parts[2]) || 1;
        const statMeta = ABILITY_META[statId];
        if (!statMeta) return [];
        return [
            {
                type: "bonus",
                subType: `${statMeta.key}-score`,
                statId,
                value: bonus,
                fixedValue: bonus,
                isGranted: true,
                _sourceKey: sourceKey
            }
        ];
    }

    if (kind === "resilient") {
        const statId = Number(parts[1]) || 3;
        const statMeta = ABILITY_META[statId];
        if (!statMeta) return [];
        return [
            {
                type: "bonus",
                subType: `${statMeta.key}-score`,
                statId,
                value: 1,
                fixedValue: 1,
                isGranted: true,
                _sourceKey: sourceKey
            },
            {
                type: "proficiency",
                subType: `${statMeta.key}-saving-throws`,
                isGranted: true,
                _sourceKey: sourceKey
            }
        ];
    }

    if (kind === "skill-prof") {
        const skillKey = parts[1];
        if (!skillKey) return [];
        return [
            {
                type: "proficiency",
                subType: skillKey,
                isGranted: true,
                _sourceKey: sourceKey
            }
        ];
    }

    if (kind === "skill-exp") {
        const skillKey = parts[1];
        if (!skillKey) return [];
        return [
            {
                type: "expertise",
                subType: skillKey,
                isGranted: true,
                _sourceKey: sourceKey
            }
        ];
    }

    if (kind === "save-prof") {
        const statKey = parts[1];
        if (!statKey) return [];
        return [
            {
                type: "proficiency",
                subType: `${statKey}-saving-throws`,
                isGranted: true,
                _sourceKey: sourceKey
            }
        ];
    }

    if (kind === "fighting-style") {
        const style = parts[1];
        if (style === "archery") {
            return [{ type: "bonus", subType: "ranged-weapon-attacks", value: 2, fixedValue: 2, isGranted: true, _sourceKey: sourceKey }];
        }
        if (style === "defense") {
            return [{ type: "bonus", subType: "armor-class", value: 1, fixedValue: 1, isGranted: true, _sourceKey: sourceKey }];
        }
        if (style === "dueling") {
            return [{ type: "bonus", subType: "one-handed-melee-attacks", value: 2, fixedValue: 2, isGranted: true, _sourceKey: sourceKey }];
        }
        if (style === "thrown") {
            return [{ type: "bonus", subType: "thrown-weapon-damage", value: 2, fixedValue: 2, isGranted: true, _sourceKey: sourceKey }];
        }
        if (style === "blind-fighting") {
            return [{ type: "set-base", subType: "blindsight", value: 10, fixedValue: 10, isGranted: true, _sourceKey: sourceKey }];
        }
        return [];
    }

    if (kind === "resistance") {
        const dmgKey = parts[1];
        const dmgMeta = DAMAGE_RESISTANCE_TYPES.find(d => d.key === dmgKey);
        if (!dmgMeta) return [];
        return [
            {
                type: "resistance",
                subType: dmgMeta.key,
                friendlySubtypeName: dmgMeta.label,
                isGranted: true,
                _sourceKey: sourceKey
            }
        ];
    }

    return [];
}

function mapLabelToCanonicalDecisionValue(
    rawLabel: string,
    contextHint: string
): { value: string; label: string } | null {
    const cleaned = stripHtml(rawLabel).replace(/\s+/g, " ").trim();
    const lower = cleaned.toLowerCase();
    const hintLower = contextHint.toLowerCase();

    // Check Resilient
    if (hintLower.includes("resilient")) {
        for (const [idStr, meta] of Object.entries(ABILITY_META)) {
            const abbrRegex = new RegExp(`\\b${meta.abbr.toLowerCase()}\\b`, "i");
            if (lower.includes(meta.key) || abbrRegex.test(lower)) {
                return {
                    value: `resilient:${idStr}`,
                    label: `${meta.name} (+1 ${meta.abbr} & ${meta.abbr} Save Proficiency)`
                };
            }
        }
    }

    // Check Ability Score
    const isAbilityContext =
        hintLower.includes("ability") ||
        hintLower.includes("score") ||
        hintLower.includes("increase") ||
        hintLower.includes("improvement") ||
        hintLower.includes("stat") ||
        hintLower.includes("bonus") ||
        inferAllowedAbilityIdsFromFeature(contextHint, contextHint) !== null;

    for (const [idStr, meta] of Object.entries(ABILITY_META)) {
        const abbrLower = meta.abbr.toLowerCase();
        const hasFullKey = lower.includes(meta.key);
        const hasAbbrWord = new RegExp(`\\b${abbrLower}\\b`, "i").test(lower);
        const isSaveMention = lower.includes("saving throw") || lower.includes(" save");

        if (!isSaveMention && (hasFullKey || (isAbilityContext && hasAbbrWord))) {
            const isPlusTwo = /(?:\+\s*2\b|\bby\s+2\b)/i.test(lower);
            const bonus = isPlusTwo ? 2 : 1;
            return {
                value: `ability:${idStr}:${bonus}`,
                label: `${meta.name} (+${bonus} ${meta.abbr})`
            };
        }
    }

    // Check Skill
    for (const skill of SKILL_META) {
        const skillNameLower = skill.name.toLowerCase();
        if (lower === skillNameLower || lower === skill.key || lower.includes(skillNameLower)) {
            const isExp =
                hintLower.includes("expertise") ||
                lower.includes("expertise");
            return {
                value: `${isExp ? "skill-exp" : "skill-prof"}:${skill.key}`,
                label: `${skill.name} (${skill.stat} ${isExp ? "Expertise" : "Proficiency"})`
            };
        }
    }

    // Check Fighting Style
    for (const fsOpt of FIGHTING_STYLE_OPTIONS) {
        const styleName = fsOpt.label.split("(")[0].trim().toLowerCase();
        if (lower === styleName || lower.startsWith(styleName) || (hintLower.includes("fighting") && lower.includes(styleName))) {
            return fsOpt;
        }
    }

    // Check Damage Resistance
    for (const dmg of DAMAGE_RESISTANCE_TYPES) {
        if (
            lower === dmg.key ||
            lower === `${dmg.key} damage` ||
            lower === `${dmg.key} resistance` ||
            ((hintLower.includes("resistance") || hintLower.includes("legacy") || hintLower.includes("ancestry") || hintLower.includes("elemental")) &&
                lower.includes(dmg.key))
        ) {
            return {
                value: `resistance:${dmg.key}`,
                label: `${dmg.label} Resistance`
            };
        }
    }

    return null;
}

function detectFightingStyleValue(nameOrSubType: string): string | null {
    const lower = String(nameOrSubType || "").toLowerCase();
    if (lower.includes("archery") || lower === "ranged-weapon-attacks") return "fighting-style:archery";
    if (lower.includes("defense") || lower === "armored-armor-class" || lower === "armor-class") return "fighting-style:defense";
    if (lower.includes("dueling") || lower === "one-handed-melee-attacks") return "fighting-style:dueling";
    if (lower.includes("great weapon")) return "fighting-style:great-weapon";
    if (lower.includes("protection")) return "fighting-style:protection";
    if (lower.includes("two-weapon")) return "fighting-style:two-weapon";
    if (lower.includes("thrown") || lower === "thrown-weapon-damage") return "fighting-style:thrown";
    if (lower.includes("blind fighting") || lower === "blindsight") return "fighting-style:blind-fighting";
    if (lower.includes("interception")) return "fighting-style:interception";
    if (lower.includes("unarmed fighting")) return "fighting-style:unarmed";
    return null;
}

export interface ExtractedFeaturesResult {
    features: FeatureItem[];
    hasFightingStyleDecision: boolean;
    activeFightingStyleValues: Set<string>;
    netAbilityDecisionDelta: Record<number, number>;
}

const BOILERPLATE_CLASS_FEATURES = new Set(["hit points", "proficiencies", "equipment"]);
/** Boilerplate class features: the fixed set, plus every class's "Core <Class> Traits". */
const isBoilerplateClassFeature = (nameLower: string) => BOILERPLATE_CLASS_FEATURES.has(nameLower) || /^core .+ traits$/.test(nameLower);

function parseAbilityDeltaFromDecisionValue(val: string): { statId: number; bonus: number } | null {
    if (!val || val === "none") return null;
    const parts = val.split(":");
    if (parts[0] === "ability") {
        const statId = Number(parts[1]);
        const bonus = Number(parts[2]) || 1;
        if (statId >= 1 && statId <= 6) return { statId, bonus };
    } else if (parts[0] === "resilient") {
        const statId = Number(parts[1]);
        if (statId >= 1 && statId <= 6) return { statId, bonus: 1 };
    }
    return null;
}

/**
 * Extracts all Feats, Class/Subclass Features, Invocations, and Species Traits,
 * builds their interactive `FeatureDecision[]` dropdowns, and mutates `allMods`
 * in-place to reflect any user-selected `activeFeatureChoices`.
 */
export function extractFeaturesAndApplyDecisions(
    raw: any,
    allMods: any[],
    activeFeatureChoices: Record<string, string> = {}
): ExtractedFeaturesResult {
    // Assign a stable internal UID to each modifier in allMods so we can replace controlled modifiers
    allMods.forEach((m, idx) => {
        if (!m._modUid) {
            m._modUid = `mod-${idx}`;
        }
    });

    // Shared set across all features so two features (e.g. multiple ASIs) never claim or delete the same modifier
    const consumedModUids = new Set<string>();
    const netAbilityDecisionDelta: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    // Index choiceDefinitions by id for fast lookup
    const choiceDefsMap = new Map<string, Array<{ id: number; label: string; description?: string }>>();
    if (Array.isArray(raw.choices?.choiceDefinitions)) {
        raw.choices.choiceDefinitions.forEach((cd: any) => {
            if (cd && cd.id && Array.isArray(cd.options)) {
                choiceDefsMap.set(String(cd.id), cd.options);
            }
        });
    }

    const getComponentIdsForFeature = (
        baseIds: Array<number | undefined>,
        category: "feat" | "class" | "race" | "background"
    ): Set<number> => {
        const ids = new Set<number>();
        for (const bId of baseIds) {
            if (bId !== undefined && bId !== null && !Number.isNaN(Number(bId))) {
                ids.add(Number(bId));
            }
        }
        const catOptions = raw.options?.[category] || [];
        const catChoices = raw.choices?.[category] || [];

        // Transitively expand linked option definition IDs and choice optionValue IDs
        let added = true;
        let guard = 0;
        while (added && guard < 4) {
            added = false;
            guard++;
            catOptions.forEach((o: any) => {
                const compId = Number(o.componentId);
                const defId = Number(o.definition?.id);
                if (ids.has(compId) && !Number.isNaN(defId) && defId > 0 && !ids.has(defId)) {
                    ids.add(defId);
                    added = true;
                }
            });
            catChoices.forEach((c: any) => {
                const compId = Number(c.componentId);
                const optVal = Number(c.optionValue);
                if (ids.has(compId) && !Number.isNaN(optVal) && optVal > 0 && !ids.has(optVal)) {
                    ids.add(optVal);
                    added = true;
                }
            });
        }
        return ids;
    };

    const getModifiersForComponentIds = (compIds: Set<number>, sourceKey: string): any[] => {
        if (compIds.size === 0) return [];
        return allMods.filter(
            m => !consumedModUids.has(m._modUid) && m._sourceKey === sourceKey && compIds.has(Number(m.componentId))
        );
    };

    const getChoicesForComponentIds = (compIds: Set<number>, category: "feat" | "class" | "race" | "background"): any[] => {
        if (compIds.size === 0) return [];
        return (raw.choices?.[category] || []).filter((c: any) => compIds.has(Number(c.componentId)));
    };

    const removeModifiersByUids = (uidsToRemove: Set<string>) => {
        if (uidsToRemove.size === 0) return;
        for (let i = allMods.length - 1; i >= 0; i--) {
            if (uidsToRemove.has(allMods[i]._modUid)) {
                allMods.splice(i, 1);
            }
        }
    };

    // Helper: find an unconsumed ability score modifier in `allMods` for `category` matching one of `allowedIds`
    const findUnconsumedCategoryAsiMods = (
        category: string,
        allowedIds: number[],
        maxCount: number
    ): any[] => {
        const allowedSet = new Set(allowedIds);
        const matches: any[] = [];
        for (const m of allMods) {
            if (matches.length >= maxCount) break;
            if (consumedModUids.has(m._modUid)) continue;
            if (m._sourceKey !== category) continue;
            if (m.type !== "bonus" && m.type !== "stacking-bonus") continue;
            const sub = String(m.subType || "");
            if (!sub.endsWith("-score") && sub !== "ability-score-increases") continue;
            const statPrefix = sub.replace("-score", "");
            const statId = ABILITY_KEY_TO_ID[statPrefix] || Number(m.statId);
            if (statId && allowedSet.has(statId)) {
                matches.push(m);
            }
        }
        return matches;
    };

    let hasFightingStyleDecision = false;
    const activeFightingStyleValues = new Set<string>();
    // Class and subclass choices the character's levels have unlocked (class rules), and every class feature name
    const classChoices = unlockedClassChoices(
        (raw.classes || []).map((c: any) => ({ name: c.definition?.name, level: Number(c.level) || 1, subclass: c.subclassDefinition?.name }))
    );
    const allClassFeatureNames: string[] = [
        ...(raw.classes || []).flatMap((c: any) => [
            ...(c.classFeatures || []).map((cf: any) => cf?.definition?.name || cf?.name),
            ...(c.definition?.classFeatures || []).map((cf: any) => cf?.name),
            ...(c.subclassDefinition?.classFeatures || []).map((cf: any) => cf?.name)
        ]),
        ...(raw.options?.class || []).map((o: any) => o.definition?.name)
    ].filter(Boolean);

    // Collect all action entries across class, race, feat, background, item so we can look up limitedUse & scaleValue metadata for features
    const allRawActions: any[] = [];
    if (raw.actions && typeof raw.actions === "object") {
        Object.values(raw.actions).forEach((arr: any) => {
            if (Array.isArray(arr)) {
                arr.forEach(a => {
                    if (a) allRawActions.push(a);
                });
            }
        });
    }

    // Also index runtime classFeature wrapper objects by definition id (they hold levelScale and limitedUse at the character's current level)
    const runtimeClassFeatureById = new Map<number, any>();
    (raw.classes || []).forEach((cl: any) => {
        (cl.classFeatures || []).forEach((cfWrap: any) => {
            const id = Number(cfWrap?.definition?.id ?? cfWrap?.id);
            if (!Number.isNaN(id) && id > 0) {
                runtimeClassFeatureById.set(id, cfWrap);
            }
        });
    });

    const formatScaleObject = (ls: any): string | undefined => {
        if (!ls) return undefined;
        if (ls.dice?.diceString) return String(ls.dice.diceString);
        if (ls.fixedValue !== undefined && ls.fixedValue !== null) return String(ls.fixedValue);
        if (ls.value !== undefined && ls.value !== null) return String(ls.value);
        if (ls.description) return String(ls.description);
        return undefined;
    };

    const resolveFeatureTemplateMeta = (
        entityObj: any,
        defObj: any,
        compIds: Set<number>,
        levelContext: number
    ): { scaleValue?: string; limitedUse?: string } => {
        let scaleValue: string | undefined = undefined;
        let limitedUse: string | undefined = undefined;

        // 1. Check direct levelScale on entityObj or runtimeClassFeature wrapper
        const directId = Number(defObj?.id ?? entityObj?.id);
        const runtimeWrap = !Number.isNaN(directId) ? runtimeClassFeatureById.get(directId) : undefined;
        scaleValue =
            formatScaleObject(entityObj?.levelScale) ||
            formatScaleObject(runtimeWrap?.levelScale) ||
            formatScaleObject(defObj?.levelScale);

        // 2. Check levelScales array on definition (pick highest level <= levelContext)
        const levelScales: any[] =
            defObj?.levelScales ||
            runtimeWrap?.definition?.levelScales ||
            entityObj?.levelScales ||
            [];
        if (!scaleValue && Array.isArray(levelScales) && levelScales.length > 0) {
            const applicable = levelScales
                .filter((s: any) => (Number(s?.level) || 1) <= levelContext)
                .sort((a: any, b: any) => (Number(b.level) || 0) - (Number(a.level) || 0));
            const best = applicable[0] || levelScales[0];
            scaleValue = formatScaleObject(best);
        }

        // 3. Check matching action in raw.actions for dice/value or limitedUse
        const fNameLower = String(defObj?.name || entityObj?.name || "").toLowerCase();
        const matchingAction = allRawActions.find(
            a =>
                compIds.has(Number(a.componentId)) ||
                compIds.has(Number(a.id)) ||
                (fNameLower && String(a.name || "").toLowerCase() === fNameLower)
        );
        if (!scaleValue && matchingAction) {
            scaleValue =
                matchingAction.dice?.diceString ||
                (matchingAction.value !== undefined && matchingAction.value !== null ? String(matchingAction.value) : undefined) ||
                (matchingAction.fixedValue !== undefined && matchingAction.fixedValue !== null
                    ? String(matchingAction.fixedValue)
                    : undefined);
        }

        // 4. Resolve limitedUse maxUses (flat maxUses or operator-based statId / proficiency bonus)
        const luSource =
            entityObj?.limitedUse ||
            runtimeWrap?.limitedUse ||
            defObj?.limitedUse ||
            matchingAction?.limitedUse;
        const luObj = Array.isArray(luSource) ? luSource[0] : luSource;
        if (luObj) {
            if (typeof luObj === "number" || typeof luObj === "string") {
                limitedUse = String(luObj);
            } else if (luObj.maxUses !== undefined && luObj.maxUses !== null && Number(luObj.maxUses) > 0) {
                limitedUse = String(luObj.maxUses);
            } else if (luObj.statModifierUsesId) {
                limitedUse = `stat:${luObj.statModifierUsesId}:${Number(luObj.maxUses) || 0}`;
            } else if (luObj.useProficiencyBonus) {
                limitedUse = "proficiency";
            }
        }

        return { scaleValue, limitedUse };
    };

    const buildDecisionsForFeature = (
        featureKeyPrefix: string,
        featureName: string,
        featureDesc: string,
        compIds: Set<number>,
        category: "feat" | "class" | "race" | "background"
    ): FeatureDecision[] => {
        const decisions: FeatureDecision[] = [];
        const featureMods = getModifiersForComponentIds(compIds, category);
        const featureChoices = getChoicesForComponentIds(compIds, category);
        const nameLower = featureName.toLowerCase();

        const registerDecision = (
            idSuffix: string,
            label: string,
            defaultValue: string,
            baseOptions: FeatureChoiceOption[],
            controlledMods: any[],
            extra?: { toModifiers?: (value: string) => any[]; savedValue?: string }
        ) => {
            if (baseOptions.length < 2) return;
            const decisionId = `${featureKeyPrefix}:${idSuffix}`;
            const valueToMods = extra?.toModifiers || ((v: string) => decisionValueToModifiers(v, category));
            const options = [...baseOptions];

            if (defaultValue === "none" && !options.some(o => o.value === "none")) {
                options.unshift({ value: "none", label: "— Select Choice —" });
            }

            let effectiveDefault = defaultValue;
            if (!options.some(o => o.value === effectiveDefault)) {
                effectiveDefault = options[0].value;
            }
            const userChosen = activeFeatureChoices[decisionId] ?? extra?.savedValue;
            const selectedValue = userChosen && options.some(o => o.value === userChosen)
                ? userChosen
                : effectiveDefault;

            decisions.push({
                id: decisionId,
                label,
                selectedValue,
                options
            });

            controlledMods.forEach(m => consumedModUids.add(m._modUid));

            // If user overrode the choice, replace controlledMods with the modifiers for selectedValue
            if (selectedValue !== effectiveDefault) {
                if (controlledMods.length > 0) {
                    removeModifiersByUids(new Set(controlledMods.map(m => m._modUid)));
                } else if (effectiveDefault !== "none") {
                    const defaultMods = valueToMods(effectiveDefault);
                    for (const dm of defaultMods) {
                        const matchIdx = allMods.findIndex(
                            m =>
                                !consumedModUids.has(m._modUid) &&
                                m._sourceKey === category &&
                                m.type === dm.type &&
                                m.subType === dm.subType
                        );
                        if (matchIdx !== -1) {
                            allMods.splice(matchIdx, 1);
                        }
                    }
                }
                const replacementMods = valueToMods(selectedValue);
                replacementMods.forEach((rm, idx) => {
                    const uid = `decision-${decisionId}-${idx}`;
                    consumedModUids.add(uid);
                    allMods.push({
                        ...rm,
                        _modUid: uid
                    });
                });

                const oldAb = parseAbilityDeltaFromDecisionValue(effectiveDefault);
                const newAb = parseAbilityDeltaFromDecisionValue(selectedValue);
                if (oldAb) {
                    netAbilityDecisionDelta[oldAb.statId] = (netAbilityDecisionDelta[oldAb.statId] || 0) - oldAb.bonus;
                }
                if (newAb) {
                    netAbilityDecisionDelta[newAb.statId] = (netAbilityDecisionDelta[newAb.statId] || 0) + newAb.bonus;
                }
            }
        };

        // 0. Class and subclass choices from the class rules (Divine Order, Aspect of the Beast, Scholar, ...); Fighting
        // Style features are feat picks, handled in step 5
        const handledDdbChoiceIds = new Set<string>();
        const isFightingStyleName =
            nameLower.includes("fighting style") ||
            nameLower.includes("fighting initiate") ||
            FIGHTING_STYLE_OPTIONS.some(o => nameLower === o.label.split("(")[0].trim().toLowerCase());
        const classMatch = isFightingStyleName ? undefined : matchClassChoice(featureName, classChoices, allClassFeatureNames);
        if (classMatch) {
            const { choice } = classMatch;
            // D&D Beyond's own pick for this feature: a chosen option definition or a choice's selected label
            const ddbPicks: string[] = (raw.options?.[category] || [])
                .filter((o: any) => compIds.has(Number(o.componentId)))
                .map((o: any) => String(o.definition?.name || ""));
            featureChoices.forEach((c: any) => {
                const rawOpts = Array.isArray(c.options) ? c.options : choiceDefsMap.get(`${c.componentTypeId}-${c.type}`) || [];
                const labels = rawOpts.map((ro: any) => stripHtml(ro.label || ro.name || ""));
                if (!labels.some((l: string) => findChoiceOption(choice, l))) return;
                handledDdbChoiceIds.add(String(c.id));
                const picked = rawOpts.find((ro: any) => Number(ro.id) === Number(c.optionValue));
                if (picked) ddbPicks.push(stripHtml(picked.label || picked.name || ""));
            });
            // ...or the option whose effects D&D Beyond already applied to this feature (e.g. Scholar's Expertise)
            const appliedOption = (choice.options || []).find(o => {
                const expected = classChoiceModifiers(o, category);
                return expected.length > 0 && expected.every(em => featureMods.some(
                    m => !consumedModUids.has(m._modUid) && m.type === em.type && m.subType === em.subType
                ));
            });
            const defaultOption = ddbPicks.map((l) => findChoiceOption(choice, l)).find(Boolean) || classMatch.option || appliedOption;
            const defaultValue = defaultOption ? `${choice.id}:${defaultOption.id}` : "none";
            const toModifiers = (v: string) => classChoiceModifiers(findChoiceOption(choice, v), category);
            const controlled = toModifiers(defaultValue)
                .map(em => featureMods.find(
                    m => !consumedModUids.has(m._modUid) && m.type === em.type && m.subType === em.subType
                ))
                .filter(Boolean);
            // Saved under this choice's id, or an older key (choice.legacyKeys) with an older value
            const savedKey = classChoiceDecisionIds(featureKeyPrefix, choice).find(k => activeFeatureChoices[k]);
            const savedOption = savedKey ? findChoiceOption(choice, activeFeatureChoices[savedKey]) : undefined;
            registerDecision(
                `${choice.id}:0`,
                choice.name,
                defaultValue,
                classChoiceOptions(choice),
                controlled,
                { toModifiers, savedValue: savedOption ? `${choice.id}:${savedOption.id}` : undefined }
            );
        }

        // 1. Special Case: Resilient Feat (+1 Ability & Saving Throw Proficiency)
        const isResilient = nameLower.includes("resilient");
        if (isResilient) {
            const asiMod = featureMods.find(
                m =>
                    !consumedModUids.has(m._modUid) &&
                    (m.type === "bonus" || m.type === "stacking-bonus") &&
                    (String(m.subType || "").endsWith("-score") || m.subType === "ability-score-increases")
            );
            const saveMod = featureMods.find(
                m =>
                    !consumedModUids.has(m._modUid) &&
                    m.type === "proficiency" &&
                    String(m.subType || "").endsWith("-saving-throws")
            );
            let defaultVal = "none";
            if (asiMod) {
                const statPrefix = String(asiMod.subType || "").replace("-score", "");
                const defaultStatId = ABILITY_KEY_TO_ID[statPrefix] || Number(asiMod.statId) || 3;
                defaultVal = `resilient:${defaultStatId}`;
            } else if (saveMod) {
                const statPrefix = String(saveMod.subType || "").replace("-saving-throws", "");
                const defaultStatId = ABILITY_KEY_TO_ID[statPrefix] || 3;
                defaultVal = `resilient:${defaultStatId}`;
            }
            const controlled = [asiMod, saveMod].filter(Boolean);
            registerDecision(
                "resilient:0",
                "Chosen Ability & Save",
                defaultVal,
                buildResilientChoiceOptions(),
                controlled
            );
        }

        // 2. Ability Score Increase Modifiers on this Feature
        const isFullAsi =
            nameLower.includes("ability score improvement") ||
            nameLower.includes("ability score increase");
        const maxAsiDecisions = isFullAsi ? 2 : 1;

        let asiMods = featureMods
            .filter(
                m =>
                    !consumedModUids.has(m._modUid) &&
                    (m.type === "bonus" || m.type === "stacking-bonus") &&
                    (String(m.subType || "").endsWith("-score") || m.subType === "ability-score-increases")
            )
            .slice(0, maxAsiDecisions);

        const inferredAllowedStats = inferAllowedAbilityIdsFromFeature(featureName, featureDesc);

        if (!isResilient && asiMods.length === 0 && inferredAllowedStats && inferredAllowedStats.length >= 2) {
            // Try matching unconsumed ASI modifiers in the same category (e.g. when D&D Beyond attaches a sub-entity componentId)
            asiMods = findUnconsumedCategoryAsiMods(category, inferredAllowedStats, maxAsiDecisions);
        }

        if (!isResilient && asiMods.length > 0) {
            asiMods.forEach((m, idx) => {
                const statPrefix = String(m.subType || "").replace("-score", "");
                const statId = ABILITY_KEY_TO_ID[statPrefix] || Number(m.statId) || 6;
                const val = Number(m.value ?? m.fixedValue) || 1;
                const allowedIds = inferredAllowedStats
                    ? Array.from(new Set([...inferredAllowedStats, statId])).sort((a, b) => a - b)
                    : [1, 2, 3, 4, 5, 6];
                const label =
                    asiMods.length > 1 || isFullAsi
                        ? `Ability Score Increase #${idx + 1} (+${val})`
                        : `Ability Score Increase (+${val})`;
                registerDecision(
                    `asi:${idx}`,
                    label,
                    `ability:${statId}:${val}`,
                    buildAbilityChoiceOptions(allowedIds, val),
                    [m]
                );
            });
            // If this is a full ASI feat/feature and only 1 +1 modifier was matched, offer the 2nd +1 slot as selectable
            if (isFullAsi && asiMods.length === 1 && (Number(asiMods[0].value ?? asiMods[0].fixedValue) || 1) === 1) {
                registerDecision(
                    "asi:1",
                    "Ability Score Increase #2 (+1)",
                    "none",
                    buildAbilityChoiceOptions(inferredAllowedStats || [1, 2, 3, 4, 5, 6], 1),
                    []
                );
            }
        } else if (!isResilient && inferredAllowedStats && inferredAllowedStats.length >= 2) {
            // Feature has a known multi-ability ASI decision, and no existing modifier was consumed for it yet.
            // Default to "none" ("— Select Choice —") so selecting any ability score adds +1 to that score!
            if (isFullAsi) {
                registerDecision(
                    "asi:0",
                    "Ability Score Increase #1 (+1)",
                    "none",
                    buildAbilityChoiceOptions(inferredAllowedStats, 1),
                    []
                );
                registerDecision(
                    "asi:1",
                    "Ability Score Increase #2 (+1)",
                    "none",
                    buildAbilityChoiceOptions(inferredAllowedStats, 1),
                    []
                );
            } else {
                registerDecision(
                    "asi:0",
                    "Ability Score Increase (+1)",
                    "none",
                    buildAbilityChoiceOptions(inferredAllowedStats, 1),
                    []
                );
            }
        }

        // Skills a feat lets the player choose (feat data skillPicks, e.g. Skilled, Skill Expert, Keen Mind)
        // ...or a species trait does (species data skillPicks, e.g. Skillful, Keen Senses)
        const speciesTraitMatch = category === "race" ? findSpeciesTrait(featureName) : undefined;
        const featPicks = category === "feat"
            ? findFeatRule(featureName)?.skillPicks || []
            : speciesTraitMatch?.trait.skillPicks || [];
        const toSkillKeys = (names?: string[]) => (names && names.length > 0 ? names.map(n => n.toLowerCase().replace(/\s+/g, "-")) : undefined);
        const featExpertisePicks = featPicks.filter(p => p.mode === "expertise");
        const featExpertiseCount = featExpertisePicks.reduce((sum, p) => sum + p.count, 0);
        const featProfPicks = featPicks.filter(p => p.mode !== "expertise");
        const featProfCount = featProfPicks.reduce((sum, p) => sum + p.count, 0);
        // Expertise can come from an Expertise pick or a "proficiency-or-expertise" pick (Keen Mind, Observant)
        const featExpertiseSources = featPicks.filter(p => p.mode !== "proficiency");
        const featExpertiseAllowed = featExpertiseSources.length > 0 && featExpertiseSources.every(p => p.from && p.from.length > 0)
            ? toSkillKeys(featExpertiseSources.flatMap(p => p.from || []))
            : undefined;
        const featProfAllowed = featProfPicks.every(p => p.from && p.from.length > 0)
            ? toSkillKeys(featProfPicks.flatMap(p => p.from || []))
            : undefined;

        // 3. Skill Expertise Modifiers on this Feature
        const skillExpMods = featureMods.filter(
            m =>
                !consumedModUids.has(m._modUid) &&
                m.type === "expertise" &&
                SKILL_KEY_SET.has(String(m.subType || "").toLowerCase())
        );
        if (skillExpMods.length > 0) {
            skillExpMods.forEach((m, idx) => {
                const skKey = String(m.subType || "").toLowerCase();
                const label = skillExpMods.length > 1 ? `Skill Expertise #${idx + 1}` : "Skill Expertise";
                registerDecision(
                    `skill-exp:${idx}`,
                    label,
                    `skill-exp:${skKey}`,
                    buildSkillChoiceOptions("exp", featExpertiseAllowed),
                    [m]
                );
            });
        } else if (!classMatch && (nameLower === "expertise" || featExpertiseCount > 0)) {
            const count = featExpertiseCount > 0 ? featExpertiseCount : 2;
            const defaults = ["perception", "stealth"];
            for (let idx = 0; idx < count; idx++) {
                registerDecision(
                    `skill-exp:${idx}`,
                    count > 1 ? `Skill Expertise #${idx + 1}` : "Skill Expertise",
                    `skill-exp:${defaults[idx] || "perception"}`,
                    buildSkillChoiceOptions("exp", featExpertiseAllowed),
                    []
                );
            }
        }

        // 4. Skill Proficiency Modifiers on this Feature
        const skillProfMods = featureMods.filter(
            m =>
                !consumedModUids.has(m._modUid) &&
                m.type === "proficiency" &&
                SKILL_KEY_SET.has(String(m.subType || "").toLowerCase())
        );

        if (skillProfMods.length > 0) {
            skillProfMods.forEach((m, idx) => {
                const skKey = String(m.subType || "").toLowerCase();
                const label = skillProfMods.length > 1 ? `Skill Proficiency #${idx + 1}` : "Skill Proficiency";
                registerDecision(
                    `skill-prof:${idx}`,
                    label,
                    `skill-prof:${skKey}`,
                    buildSkillChoiceOptions("prof", featProfAllowed),
                    [m]
                );
            });
        } else if (featProfCount > 0) {
            const count = featProfCount;
            const defaults = ["perception", "investigation", "insight"];
            for (let idx = 0; idx < count; idx++) {
                registerDecision(
                    `skill-prof:${idx}`,
                    count > 1 ? `Skill Proficiency #${idx + 1}` : "Skill Proficiency",
                    `skill-prof:${defaults[idx] || "perception"}`,
                    buildSkillChoiceOptions("prof", featProfAllowed),
                    []
                );
            }
        }

        // 5. Fighting Style Feature or Feat
        const fsDetectedFromName = detectFightingStyleValue(featureName);
        const isFightingStyleFeature =
            nameLower.includes("fighting style") ||
            nameLower.includes("fighting initiate") ||
            !!fsDetectedFromName;

        if (isFightingStyleFeature && !classMatch) {
            const fsMods = featureMods.filter(
                m =>
                    !consumedModUids.has(m._modUid) &&
                    ["ranged-weapon-attacks", "armored-armor-class", "armor-class", "one-handed-melee-attacks", "thrown-weapon-damage", "blindsight"].includes(
                        String(m.subType || "").toLowerCase()
                    )
            );
            let defaultFs = fsDetectedFromName || "fighting-style:defense";
            if (!fsDetectedFromName && fsMods.length > 0) {
                defaultFs = detectFightingStyleValue(fsMods[0].subType) || defaultFs;
            }
            registerDecision(
                "fighting-style:0",
                "Fighting Style",
                defaultFs,
                FIGHTING_STYLE_OPTIONS,
                fsMods
            );
            const activeDec = decisions[decisions.length - 1];
            if (activeDec) {
                hasFightingStyleDecision = true;
                activeFightingStyleValues.add(activeDec.selectedValue);
            }
        }

        // 7. Damage Resistance / Elemental / Lineage Traits
        const resMods = featureMods.filter(
            m => !consumedModUids.has(m._modUid) && m.type === "resistance"
        );
        // A species trait whose species' lineages each grant a resistance (e.g. Draconic Ancestry, Fiendish Legacy)
        const lineageResistance = (speciesTraitMatch?.species.lineages || []).some(l => (l.modifiers || []).some(m => m.target === "defenses.resistance"));
        if (resMods.length > 0 || lineageResistance || nameLower.includes("elemental adept")) {
            if (resMods.length > 0) {
                resMods.forEach((m, idx) => {
                    const dmgKey = String(m.subType || "fire").toLowerCase();
                    registerDecision(
                        `resistance:${idx}`,
                        "Damage Resistance",
                        `resistance:${dmgKey}`,
                        buildResistanceChoiceOptions(),
                        [m]
                    );
                });
            } else {
                // The resistance of the lineage the feature names, if any
                const named = speciesTraitMatch ? detectLineage(speciesTraitMatch.species, { texts: [featureName] }) : undefined;
                const namedRes = (named?.modifiers || []).find(m => m.target === "defenses.resistance")?.value;
                const defaultRes = namedRes ? `resistance:${String(namedRes).toLowerCase()}` : "none";
                registerDecision(
                    "resistance:0",
                    "Damage Resistance",
                    defaultRes,
                    buildResistanceChoiceOptions(),
                    []
                );
            }
        }

        // 8. Any remaining explicit choices in raw.choices[category] with choiceDefinitions
        const hadPriorDecisions = decisions.length > 0;
        featureChoices.forEach((c: any, cIdx: number) => {
            if (handledDdbChoiceIds.has(String(c.id))) return;
            const defKey = `${c.componentTypeId}-${c.type}`;
            const rawOpts = Array.isArray(c.options)
                ? c.options
                : choiceDefsMap.get(defKey) || [];
            if (!rawOpts.length) return;

            const validRawOpts = Array.isArray(c.optionIds) && c.optionIds.length > 0
                ? rawOpts.filter((o: any) => c.optionIds.includes(o.id))
                : rawOpts;
            if (validRawOpts.length < 2) return;

            const mappedOpts: FeatureChoiceOption[] = [];
            let defaultVal = "none";
            for (const ro of validRawOpts) {
                const canonical = mapLabelToCanonicalDecisionValue(ro.label || ro.name || "", `${featureName} ${c.label || ""}`);
                const optVal = canonical ? canonical.value : `choice-opt:${ro.id}`;
                const optLabel = canonical ? canonical.label : stripHtml(ro.label || ro.name || `Option ${ro.id}`);
                mappedOpts.push({ value: optVal, label: optLabel });
                if (Number(ro.id) === Number(c.optionValue)) {
                    defaultVal = optVal;
                }
            }

            if (mappedOpts.length >= 2) {
                const firstKind = mappedOpts[0].value.split(":")[0];
                // Skip if Step 1-7 already built decisions of this kind for this feature
                if (hadPriorDecisions && decisions.some(d => d.options.some(o => o.value.startsWith(`${firstKind}:`)))) {
                    return;
                }
                const controlled: any[] = [];
                if (defaultVal !== "none") {
                    const expectedMods = decisionValueToModifiers(defaultVal, category);
                    for (const em of expectedMods) {
                        const matchMod = allMods.find(
                            m =>
                                !consumedModUids.has(m._modUid) &&
                                m._sourceKey === category &&
                                m.type === em.type &&
                                m.subType === em.subType
                        );
                        if (matchMod) controlled.push(matchMod);
                    }
                }
                registerDecision(
                    `choice:${c.id || cIdx}`,
                    c.label || "Feature Choice",
                    defaultVal,
                    mappedOpts,
                    controlled
                );
            }
        });

        return decisions;
    };

    const features: FeatureItem[] = [];

    const totalCharLevel =
        (raw.classes || []).reduce((sum: number, c: any) => sum + (Number(c.level) || 0), 0) || 1;

    // 1. Feats — process specific multi-ability feats (e.g. War Caster, Fey Touched) before full ASIs
    // so restricted feats claim their matching ability modifiers first
    const rawFeats: any[] = Array.isArray(raw.feats) ? raw.feats : [];
    const featEntries = rawFeats.map((f, idx) => ({ f, idx }));
    featEntries.sort((a, b) => {
        const aIsAsi = String(a.f.definition?.name || "").toLowerCase().includes("ability score improvement") ? 1 : 0;
        const bIsAsi = String(b.f.definition?.name || "").toLowerCase().includes("ability score improvement") ? 1 : 0;
        return aIsAsi - bIsAsi || a.idx - b.idx;
    });

    const processedFeatsByIdx = new Map<number, FeatureItem>();
    featEntries.forEach(({ f, idx }) => {
        const def = f.definition;
        if (!def?.name) return;
        const subFeatureIds = Array.isArray(def.features) ? def.features.map((sf: any) => sf?.id) : [];
        const compIds = getComponentIdsForFeature([def.id, f.componentId, f.id, ...subFeatureIds], "feat");
        const prefix = `feat:${slugifyKey(def.name)}:${idx}`;
        const decisions = buildDecisionsForFeature(
            prefix,
            def.name,
            def.description || def.snippet || "",
            compIds,
            "feat"
        );
        const meta = resolveFeatureTemplateMeta(f, def, compIds, totalCharLevel);
        processedFeatsByIdx.set(idx, {
            name: def.name,
            source: "Feat",
            type: "Feat",
            description: def.description || def.snippet || "",
            decisions: decisions.length > 0 ? decisions : undefined,
            scaleValue: meta.scaleValue,
            limitedUse: meta.limitedUse
        });
    });
    for (let idx = 0; idx < rawFeats.length; idx++) {
        const item = processedFeatsByIdx.get(idx);
        if (item) features.push(item);
    }

    // 2. Class Options / Invocations
    (raw.options?.class || []).forEach((o: any, idx: number) => {
        const def = o.definition;
        if (!def?.name) return;
        const compIds = getComponentIdsForFeature([def.id, o.componentId, o.id], "class");
        const prefix = `option:${slugifyKey(def.name)}:${idx}`;
        const decisions = buildDecisionsForFeature(
            prefix,
            def.name,
            def.description || def.snippet || "",
            compIds,
            "class"
        );
        const meta = resolveFeatureTemplateMeta(o, def, compIds, totalCharLevel);
        features.push({
            name: def.name,
            source: "Class Option / Invocation",
            type: "Invocation",
            description: def.description || def.snippet || "",
            decisions: decisions.length > 0 ? decisions : undefined,
            scaleValue: meta.scaleValue,
            limitedUse: meta.limitedUse
        });
    });

    // 3. Base Class and Subclass Features
    (raw.classes || []).forEach((cl: any) => {
        const cLevel = Number(cl.level) || 1;
        const cName = cl.definition?.name || "Class";

        if (Array.isArray(cl.definition?.classFeatures)) {
            cl.definition.classFeatures.forEach((cf: any) => {
                if ((cf.requiredLevel ?? 1) > cLevel || !cf.name) return;
                const cfNameLower = String(cf.name).toLowerCase();
                if (isBoilerplateClassFeature(cfNameLower)) return;

                const compIds = getComponentIdsForFeature([cf.id, cf.definition?.id], "class");
                // Skip "Ability Score Improvement" class feature ONLY if it has no class modifiers attached
                // (because 2024 feats appear in raw.feats, whereas 2014/class ASIs may attach modifiers to cf.id)
                if (cfNameLower === "ability score improvement") {
                    const cfMods = getModifiersForComponentIds(compIds, "class");
                    if (cfMods.length === 0) return;
                }

                const prefix = `class:${slugifyKey(cName)}:${slugifyKey(cf.name)}:${cf.requiredLevel || 1}`;
                const decisions = buildDecisionsForFeature(
                    prefix,
                    cf.name,
                    cf.description || cf.snippet || "",
                    compIds,
                    "class"
                );
                const meta = resolveFeatureTemplateMeta(cf, cf.definition || cf, compIds, cLevel);
                features.push({
                    name: cf.name,
                    source: cName,
                    type: "Class",
                    description: cf.description || cf.snippet || "",
                    decisions: decisions.length > 0 ? decisions : undefined,
                    scaleValue: meta.scaleValue,
                    limitedUse: meta.limitedUse,
                    level: Number(cf.requiredLevel || cf.level || 1)
                });
            });
        }

        if (Array.isArray(cl.subclassDefinition?.classFeatures)) {
            const subName = cl.subclassDefinition.name || "Subclass";
            const baseFeatureNames = new Set<string>();
            const baseFeatureIds = new Set<any>();
            if (Array.isArray(cl.definition?.classFeatures)) {
                cl.definition.classFeatures.forEach((cf: any) => {
                    const name = (cf.definition?.name || cf.name || "").trim().toLowerCase();
                    if (name) baseFeatureNames.add(name);
                    const id = cf.definition?.id || cf.id;
                    if (id) baseFeatureIds.add(id);
                });
            }

            cl.subclassDefinition.classFeatures.forEach((cf: any) => {
                if ((cf.requiredLevel ?? 1) > cLevel || !cf.name) return;
                const cfNameLower = String(cf.name).trim().toLowerCase();
                const cfId = cf.id || cf.definition?.id;
                // Exclude base class features that D&D Beyond bundles into subclassDefinition.classFeatures
                if (baseFeatureNames.has(cfNameLower) || (cfId && baseFeatureIds.has(cfId)) || isBoilerplateClassFeature(cfNameLower)) {
                    return;
                }

                const compIds = getComponentIdsForFeature([cf.id, cf.definition?.id], "class");
                const prefix = `subclass:${slugifyKey(subName)}:${slugifyKey(cf.name)}:${cf.requiredLevel || 1}`;
                const decisions = buildDecisionsForFeature(
                    prefix,
                    cf.name,
                    cf.description || cf.snippet || "",
                    compIds,
                    "class"
                );
                const meta = resolveFeatureTemplateMeta(cf, cf.definition || cf, compIds, cLevel);
                features.push({
                    name: cf.name,
                    source: subName,
                    type: "Subclass",
                    description: cf.description || cf.snippet || "",
                    decisions: decisions.length > 0 ? decisions : undefined,
                    scaleValue: meta.scaleValue,
                    limitedUse: meta.limitedUse,
                    level: Number(cf.requiredLevel || cf.level || 3)
                });
            });
        }

        // Check cl.classFeatures for any class or subclass features not already captured
        if (Array.isArray(cl.classFeatures)) {
            const subId = cl.subclassDefinition?.id;
            const subName = cl.subclassDefinition?.name || "Subclass";
            const baseFeatureNames = new Set<string>();
            const baseFeatureIds = new Set<any>();
            if (Array.isArray(cl.definition?.classFeatures)) {
                cl.definition.classFeatures.forEach((cf: any) => {
                    const name = (cf.definition?.name || cf.name || "").trim().toLowerCase();
                    if (name) baseFeatureNames.add(name);
                    const id = cf.definition?.id || cf.id;
                    if (id) baseFeatureIds.add(id);
                });
            }

            const otherClasses = (raw.classes || []).filter((otherCl: any) => otherCl !== cl);
            const otherClassIds = new Set<any>(otherClasses.map((oc: any) => oc.definition?.id).filter(Boolean));
            const otherSubclassIds = new Set<any>(otherClasses.map((oc: any) => oc.subclassDefinition?.id).filter(Boolean));
            const otherClassNames = new Set<string>(otherClasses.map((oc: any) => String(oc.definition?.name || "").toLowerCase()).filter(Boolean));
            const otherSubclassNames = new Set<string>(otherClasses.map((oc: any) => String(oc.subclassDefinition?.name || "").toLowerCase()).filter(Boolean));

            cl.classFeatures.forEach((cf: any) => {
                const def = cf.definition || cf;
                if (!def?.name) return;
                const reqLevel = Number(def.requiredLevel ?? cf.requiredLevel ?? 1);
                if (reqLevel > cLevel) return;
                const cfNameLower = String(def.name).toLowerCase();
                if (isBoilerplateClassFeature(cfNameLower)) return;

                const cfClassId = def.classId || def.subclassId || cf.classId || cf.subclassId;
                const cfSourceLower = String(def.source || cf.source || "").toLowerCase().trim();

                const canonCls = getCanonicalClassesForFeature(def.name);
                const canonSub = getCanonicalSubclassesForFeature(def.name);
                const classSlug = slugifyKey(cName);
                const subSlug = slugifyKey(subName);

                // Reject features that, in the class rules, belong only to other classes or other subclasses
                if (canonCls.length > 0 && !canonCls.includes(classSlug)) return;
                if (canonSub.length > 0 && !canonSub.some(cs => cs.classSlug === classSlug && (cs.subSlug === subSlug || cs.subName.toLowerCase() === subName.toLowerCase()))) return;

                // Reject features explicitly belonging to other classes or subclasses on this character
                if (cfClassId && (otherClassIds.has(cfClassId) || otherSubclassIds.has(cfClassId))) return;
                if (cfSourceLower && (otherClassNames.has(cfSourceLower) || otherSubclassNames.has(cfSourceLower))) return;

                const isBase = canonCls.includes(classSlug) || baseFeatureNames.has(cfNameLower) || (def.id && baseFeatureIds.has(def.id));
                const subFeaturesList = Array.isArray(cl.subclassDefinition?.classFeatures) ? cl.subclassDefinition.classFeatures : [];
                const isSubFeatureByName = subFeaturesList.some((scf: any) => (scf.definition?.name || scf.name || "").trim().toLowerCase() === cfNameLower);
                const isSub = !isBase && (
                    canonSub.some(cs => cs.classSlug === classSlug) ||
                    (subId && (cfClassId === subId)) ||
                    (subName && cfSourceLower === subName.toLowerCase()) ||
                    isSubFeatureByName
                );

                if (!isBase && !isSub) {
                    if (cfClassId && cfClassId !== cl.definition?.id && cfClassId !== subId) {
                        return;
                    }
                    if (raw.classes && raw.classes.length > 1 && !canonCls) {
                        return;
                    }
                }

                const targetName = isSub ? subName : cName;
                const targetType = isSub ? "Subclass" : "Class";

                if (features.some(f => f.name.toLowerCase() === def.name.toLowerCase() && f.source.toLowerCase() === targetName.toLowerCase())) {
                    return;
                }

                const compIds = getComponentIdsForFeature([cf.id, def.id], "class");
                const prefix = `${isSub ? "subclass" : "class"}:${slugifyKey(targetName)}:${slugifyKey(def.name)}:${reqLevel}`;
                const decisions = buildDecisionsForFeature(
                    prefix,
                    def.name,
                    def.description || def.snippet || "",
                    compIds,
                    "class"
                );
                const meta = resolveFeatureTemplateMeta(cf, def, compIds, cLevel);
                features.push({
                    name: def.name,
                    source: targetName,
                    type: targetType,
                    description: def.description || def.snippet || "",
                    decisions: decisions.length > 0 ? decisions : undefined,
                    scaleValue: meta.scaleValue,
                    limitedUse: meta.limitedUse,
                    level: reqLevel
                });
            });
        }
    });

    // 4. Species / Racial Traits
    if (Array.isArray(raw.race?.racialTraits)) {
        const raceName = raw.race.fullName || "Species";
        raw.race.racialTraits.forEach((rt: any, idx: number) => {
            const def = rt.definition;
            if (!def?.name) return;
            const compIds = getComponentIdsForFeature([def.id, rt.componentId, rt.id], "race");
            const prefix = `species:${slugifyKey(def.name)}:${idx}`;
            const decisions = buildDecisionsForFeature(
                prefix,
                def.name,
                def.description || def.snippet || "",
                compIds,
                "race"
            );
            const meta = resolveFeatureTemplateMeta(rt, def, compIds, totalCharLevel);
            features.push({
                name: def.name,
                source: raceName,
                type: "Species",
                description: def.description || def.snippet || "",
                decisions: decisions.length > 0 ? decisions : undefined,
                scaleValue: meta.scaleValue,
                limitedUse: meta.limitedUse
            });
        });
    }

    return {
        features,
        hasFightingStyleDecision,
        activeFightingStyleValues,
        netAbilityDecisionDelta
    };
}

/**
 * Ensures that an already-saved `CharacterData` object loaded from the database
 * has canonical decision option values (upgrading any legacy `choice-opt:...` values)
 * and attaches interactive decision dropdowns to any known features that lack them.
 */
export function ensureFeatureDecisionsOnCharacterData(character: CharacterData): void {
    if (!character || !Array.isArray(character.features)) return;

    const savedClassChoices = unlockedClassChoices(character.classes || []);
    const savedFeatureNames = character.features.map(f => String(f.name || ""));

    character.features.forEach((feat, fIdx) => {
        if (Array.isArray(feat.decisions) && feat.decisions.length > 0) {
            feat.decisions.forEach(dec => {
                dec.options.forEach(opt => {
                    if (opt.value.startsWith("choice-opt:")) {
                        const canonical = mapLabelToCanonicalDecisionValue(opt.label, `${feat.name} ${dec.label}`);
                        if (canonical) {
                            if (dec.selectedValue === opt.value) {
                                dec.selectedValue = canonical.value;
                            }
                            opt.value = canonical.value;
                            opt.label = canonical.label;
                        }
                    }
                });
            });
            return;
        }

        // Attach decisions to saved features that were persisted before feature decisions existed
        const nameLower = String(feat.name || "").toLowerCase();
        const desc = String(feat.description || "");
        const prefix = `${slugifyKey(feat.type || "feat")}:${slugifyKey(feat.name)}:${fIdx}`;
        const decisions: FeatureDecision[] = [];

        if (nameLower.includes("resilient")) {
            decisions.push({
                id: `${prefix}:resilient:0`,
                label: "Chosen Ability & Save",
                selectedValue: "none",
                options: [{ value: "none", label: "— Select Choice —" }, ...buildResilientChoiceOptions()]
            });
        } else if (nameLower.includes("fighting style")) {
            let selectedVal = character.featureChoices?.[`${prefix}:fighting-style:0`] || character.creatorState?.fightingStyle;
            if (!selectedVal || !FIGHTING_STYLE_OPTIONS.some(o => o.value === selectedVal)) {
                const matched = FIGHTING_STYLE_OPTIONS.find(o => nameLower.includes(o.label.toLowerCase().split(" ")[0]));
                selectedVal = matched ? matched.value : FIGHTING_STYLE_OPTIONS[0].value;
            }
            decisions.push({
                id: `${prefix}:fighting-style:0`,
                label: "Fighting Style",
                selectedValue: selectedVal,
                options: FIGHTING_STYLE_OPTIONS
            });
        } else {
            // Class and subclass choices from the class rules
            let dynamicChoiceFound = false;
            const match = matchClassChoice(feat.name, savedClassChoices, savedFeatureNames);
            if (match) {
                const { choice } = match;
                const keys = [choice.id, ...(choice.legacyKeys || [])];
                const camel = (k: string) => k.replace(/-([a-z])/g, (_m, ch) => ch.toUpperCase());
                const savedVal = [
                    ...classChoiceDecisionIds(prefix, choice).map(k => character.featureChoices?.[k]),
                    ...keys.map(k => character.featureChoices?.[k]),
                    ...keys.map(k => character.subclassFeatureChoices?.[k]),
                    ...keys.map(k => character.creatorState?.subclassFeatureChoices?.[k]),
                    ...keys.map(k => (character.creatorState as any)?.[camel(k)])
                ].find(v => typeof v === "string" && findChoiceOption(choice, v));
                const option = findChoiceOption(choice, savedVal) || match.option;
                decisions.push({
                    id: `${prefix}:${choice.id}:0`,
                    label: choice.name,
                    selectedValue: option ? `${choice.id}:${option.id}` : "none",
                    options: option ? classChoiceOptions(choice) : [{ value: "none", label: "— Select Choice —" }, ...classChoiceOptions(choice)]
                });
                dynamicChoiceFound = true;
            }

            if (!dynamicChoiceFound) {
                const allowedStats = inferAllowedAbilityIdsFromFeature(feat.name, desc);
                if (allowedStats && allowedStats.length >= 2) {
                    const isFullAsi =
                        nameLower.includes("ability score improvement") ||
                        nameLower.includes("ability score increase");
                    if (isFullAsi) {
                        decisions.push({
                            id: `${prefix}:asi:0`,
                            label: "Ability Score Increase #1 (+1)",
                            selectedValue: "none",
                            options: [{ value: "none", label: "— Select Choice —" }, ...buildAbilityChoiceOptions(allowedStats, 1)]
                        });
                        decisions.push({
                            id: `${prefix}:asi:1`,
                            label: "Ability Score Increase #2 (+1)",
                            selectedValue: "none",
                            options: [{ value: "none", label: "— Select Choice —" }, ...buildAbilityChoiceOptions(allowedStats, 1)]
                        });
                    } else {
                        decisions.push({
                            id: `${prefix}:asi:0`,
                            label: "Ability Score Increase (+1)",
                            selectedValue: "none",
                            options: [{ value: "none", label: "— Select Choice —" }, ...buildAbilityChoiceOptions(allowedStats, 1)]
                        });
                    }
                }
            }
        }

        if (decisions.length > 0) {
            feat.decisions = decisions;
        }
    });
}

/**
 * Directly applies a feature decision change to an already-parsed `CharacterData` object
 * (both on live D&D Beyond characters and on saved characters).
 */
export function applyFeatureDecisionOnCharacterData(
    character: CharacterData,
    decisionId: string,
    newValue: string
): { featureName: string; decisionLabel: string; optionLabel: string } | null {
    let targetFeature: FeatureItem | undefined;
    let targetDecision: FeatureDecision | undefined;

    for (const feat of character.features || []) {
        const dec = (feat.decisions || []).find(d => d.id === decisionId);
        if (dec) {
            targetFeature = feat;
            targetDecision = dec;
            break;
        }
    }

    if (!targetFeature || !targetDecision) return null;
    const chosenOpt = targetDecision.options.find(o => o.value === newValue);
    if (!chosenOpt) return null;

    const oldRawValue = targetDecision.selectedValue;
    const oldOpt = targetDecision.options.find(o => o.value === oldRawValue);

    const resolveCanonical = (val: string, optLabel?: string): string => {
        if (!val || val === "none") return "none";
        if (val.startsWith("choice-opt:") && optLabel) {
            const mapped = mapLabelToCanonicalDecisionValue(optLabel, `${targetFeature!.name} ${targetDecision!.label}`);
            if (mapped) return mapped.value;
        }
        return val;
    };

    const oldValue = resolveCanonical(oldRawValue, oldOpt?.label);
    const resolvedNewValue = resolveCanonical(newValue, chosenOpt.label);

    targetDecision.selectedValue = newValue;

    if (!character.featureChoices) character.featureChoices = {};
    character.featureChoices[decisionId] = newValue;
    if (!character.trackingState) character.trackingState = {};
    if (!character.trackingState.featureChoices) character.trackingState.featureChoices = {};
    character.trackingState.featureChoices[decisionId] = newValue;

    if (oldValue === resolvedNewValue) {
        return {
            featureName: targetFeature.name,
            decisionLabel: targetDecision.label,
            optionLabel: chosenOpt.label
        };
    }

    const profBonus = Number(character.vitals.proficiencyBonus) || 2;
    const oldAbilityMods: Record<string, number> = {};
    character.abilities.forEach(a => {
        oldAbilityMods[a.abbr] = a.modifier;
    });

    const adjustAbilityScore = (statId: number, delta: number) => {
        const meta = ABILITY_META[statId];
        if (!meta) return;
        const ability = character.abilities.find(a => a.abbr === meta.abbr || a.name === meta.name);
        if (!ability) return;
        ability.score = Math.max(1, ability.score + delta);
        ability.modifier = Math.floor((ability.score - 10) / 2);
        ability.save = ability.modifier + (ability.proficientSave ? profBonus : 0);
    };

    const adjustSaveProficiency = (statId: number, proficient: boolean) => {
        const meta = ABILITY_META[statId];
        if (!meta) return;
        const ability = character.abilities.find(a => a.abbr === meta.abbr || a.name === meta.name);
        if (!ability) return;
        ability.proficientSave = proficient;
        ability.save = ability.modifier + (ability.proficientSave ? profBonus : 0);
    };

    const adjustSkillTier = (skillKey: string, mode: "prof" | "exp", add: boolean) => {
        const skillMeta = SKILL_META.find(s => s.key === skillKey);
        if (!skillMeta) return;
        const skillItem = character.skills.find(s => s.name.toLowerCase() === skillMeta.name.toLowerCase());
        if (!skillItem) return;

        if (add) {
            skillItem.proficiency = mode === "exp" ? "expertise" : "proficient";
        } else {
            skillItem.proficiency = mode === "exp" ? "proficient" : "none";
        }
    };

    const applyValueEffect = (val: string, sign: 1 | -1) => {
        if (!val || val === "none") return;
        const parts = val.split(":");
        const kind = parts[0];
        const optId = parts[1];

        if (kind === "ability") {
            const statId = Number(parts[1]) || 6;
            const bonus = Number(parts[2]) || 1;
            adjustAbilityScore(statId, sign * bonus);
            return;
        } else if (kind === "resilient") {
            const statId = Number(parts[1]) || 3;
            adjustAbilityScore(statId, sign * 1);
            adjustSaveProficiency(statId, sign === 1);
            return;
        } else if (kind === "skill-prof") {
            adjustSkillTier(parts[1], "prof", sign === 1);
            return;
        } else if (kind === "skill-exp") {
            adjustSkillTier(parts[1], "exp", sign === 1);
            return;
        } else if (kind === "resistance") {
            const dmgKey = parts[1];
            const dmgMeta = DAMAGE_RESISTANCE_TYPES.find(d => d.key === dmgKey);
            if (dmgMeta && character.proficiencies) {
                const label = `${dmgMeta.label} (Resistance)`;
                const currentDefs = Array.isArray(character.proficiencies.defenses)
                    ? [...character.proficiencies.defenses]
                    : [];
                if (sign === 1 && !currentDefs.includes(label)) {
                    currentDefs.push(label);
                } else if (sign === -1) {
                    const idx = currentDefs.indexOf(label);
                    if (idx !== -1) currentDefs.splice(idx, 1);
                }
                character.proficiencies.defenses = currentDefs;
            }
            return;
        }

        // Progression-driven option lookup and application
        const classOption = findClassOption(kind, optId);
        if (classOption) {
            applyProgressionChoiceOption(character, classOption, sign);
            return;
        }

        // Progression choices carried on the character (e.g. custom classes saved with their own rules)
        const classesToSearch = [
            ...(character.creatorState?.classes || []),
            ...(character.classes || [])
        ];
        for (const c of classesToSearch) {
            const allProgressions = [
                ...(c.progression || []),
                ...((c.subclasses || []).flatMap((s: any) => s.progression || []))
            ];
            for (const pl of allProgressions) {
                for (const ch of pl.choices || []) {
                    if (ch.choiceId === kind || ch.id === kind || ch.featureName?.toLowerCase() === kind.toLowerCase()) {
                        const opt = ch.options?.find((o: any) => o.id === optId || o.id === val);
                        if (opt) {
                            applyProgressionChoiceOption(character, opt, sign);
                            return;
                        }
                    }
                }
            }
        }

        // Fallbacks for any unregistered edge cases
        if (kind === "fighting-style") {
            const style = parts[1];
            if (style === "defense") {
                character.vitals.armorClass += sign * 1;
            } else if (style === "blind-fighting") {
                character.vitals.blindsight = sign === 1 ? "10 ft." : "None";
            }
        }
    };

    // Revert old effect and apply new effect
    applyValueEffect(oldValue, -1);
    applyValueEffect(resolvedNewValue, 1);

    // Recompute derived stats from updated ability modifiers
    const getMod = (abbr: string) => character.abilities.find(a => a.abbr === abbr)?.modifier ?? 0;
    const dexDelta = getMod("DEX") - (oldAbilityMods["DEX"] ?? 0);
    const conDelta = getMod("CON") - (oldAbilityMods["CON"] ?? 0);

    if (dexDelta !== 0) {
        character.vitals.initiative += dexDelta;
        character.vitals.armorClass += dexDelta;
    }

    if (conDelta !== 0) {
        const hpDelta = conDelta * (Number(character.level) || 1);
        character.vitals.maxHp = Math.max(1, character.vitals.maxHp + hpDelta);
        character.vitals.currentHp = Math.max(0, Math.min(character.vitals.maxHp, character.vitals.currentHp + hpDelta));
    }

    // Recompute skill bonuses when ability modifiers change
    for (const ability of character.abilities) {
        const oldMod = oldAbilityMods[ability.abbr] ?? ability.modifier;
        const delta = ability.modifier - oldMod;
        if (delta !== 0) {
            character.skills.forEach(skill => {
                if (skill.stat.toUpperCase() === ability.abbr.toUpperCase()) {
                    skill.bonus += delta;
                }
            });
        }
    }

    const getSkillBonus = (name: string) =>
        character.skills.find(s => s.name.toLowerCase() === name.toLowerCase())?.bonus ?? 0;

    character.vitals.passivePerception = 10 + getSkillBonus("Perception");
    character.vitals.passiveInvestigation = 10 + getSkillBonus("Investigation");
    character.vitals.passiveInsight = 10 + getSkillBonus("Insight");

    // Recompute spellcasting DC & attack if spellcasting ability changed
    const spellAbilityStr = String(character.vitals.spellcastingAbility || "");
    for (const meta of Object.values(ABILITY_META)) {
        if (spellAbilityStr.toLowerCase().includes(meta.key) || spellAbilityStr.toUpperCase().includes(meta.abbr)) {
            const mod = getMod(meta.abbr);
            character.vitals.spellSaveDc = 8 + profBonus + mod;
            character.vitals.spellAttackBonus = profBonus + mod;
            character.vitals.spellcastingAbility = `${meta.name} (${mod >= 0 ? `+${mod}` : mod})`;
            break;
        }
    }

    return {
        featureName: targetFeature.name,
        decisionLabel: targetDecision.label,
        optionLabel: chosenOpt.label
    };
}
