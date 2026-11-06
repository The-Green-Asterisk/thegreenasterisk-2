import {
    CharacterData,
    FeatureChoiceOption,
    FeatureDecision,
    FeatureItem
} from "./characterData";

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

export const DIVINE_ORDER_OPTIONS: FeatureChoiceOption[] = [
    { value: "divine-order:protector", label: "Protector (Heavy Armor & Martial Weapons)" },
    { value: "divine-order:thaumaturge", label: "Thaumaturge (+WIS Mod to Arcana & Religion)" }
];

export const PRIMAL_ORDER_OPTIONS: FeatureChoiceOption[] = [
    { value: "primal-order:magician", label: "Magician (+WIS Mod to Arcana & Nature)" },
    { value: "primal-order:warden", label: "Warden (Medium Armor & Martial Weapons)" }
];

export const PACT_BOON_OPTIONS: FeatureChoiceOption[] = [
    { value: "pact-boon:blade", label: "Pact of the Blade (Use CHA for Bound Weapon)" },
    { value: "pact-boon:chain", label: "Pact of the Chain (Familiar Invocation)" },
    { value: "pact-boon:tome", label: "Pact of the Tome (Book of Shadows)" }
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
export function inferAllowedAbilityIdsFromFeature(featureName: string, description: string): number[] | null {
    const nameLower = String(featureName || "").toLowerCase();
    const cleanDesc = stripHtml(description).toLowerCase();

    if (
        nameLower.includes("ability score improvement") ||
        nameLower.includes("ability score increase") ||
        nameLower.includes("resilient") ||
        nameLower.includes("skill expert")
    ) {
        return [1, 2, 3, 4, 5, 6];
    }

    if (nameLower.includes("elven accuracy")) {
        return [2, 4, 5, 6];
    }

    if (
        nameLower.includes("war caster") ||
        nameLower.includes("fey touched") ||
        nameLower.includes("shadow touched") ||
        nameLower.includes("telekinetic") ||
        nameLower.includes("telepathic") ||
        nameLower.includes("spell sniper") ||
        nameLower.includes("ritual caster") ||
        nameLower.includes("inspiring leader")
    ) {
        return [4, 5, 6];
    }

    if (nameLower.includes("observant")) {
        return [4, 5];
    }

    if (
        nameLower.includes("crusher") ||
        nameLower.includes("piercer") ||
        nameLower.includes("slasher") ||
        nameLower.includes("tavern brawler")
    ) {
        return [1, 2, 3];
    }

    if (
        nameLower.includes("athlete") ||
        nameLower.includes("light") && nameLower.includes("armor") ||
        nameLower.includes("moderately armored") ||
        nameLower.includes("weapon master") ||
        nameLower.includes("defensive duelist") ||
        nameLower.includes("dual wielder") ||
        nameLower.includes("grappler") ||
        nameLower.includes("mage slayer") ||
        nameLower.includes("medium armor master") ||
        nameLower.includes("mounted combatant") ||
        nameLower.includes("polearm master") ||
        nameLower.includes("sentinel") ||
        nameLower.includes("shield master") ||
        nameLower.includes("skulker") ||
        nameLower.includes("charger")
    ) {
        return [1, 2];
    }

    if (nameLower.includes("heavy armor master") || nameLower.includes("heavily armored")) {
        return [1, 3];
    }

    if (nameLower.includes("speedy")) {
        return [2, 3];
    }

    if (nameLower.includes("poisoner")) {
        return [2, 4];
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

    if (kind === "divine-order") {
        const order = parts[1];
        if (order === "thaumaturge") {
            return [
                { type: "bonus", subType: "arcana", statId: 5, value: 0, isGranted: true, _sourceKey: sourceKey },
                { type: "bonus", subType: "religion", statId: 5, value: 0, isGranted: true, _sourceKey: sourceKey }
            ];
        }
        return [];
    }

    if (kind === "primal-order") {
        const order = parts[1];
        if (order === "magician") {
            return [
                { type: "bonus", subType: "arcana", statId: 5, value: 0, isGranted: true, _sourceKey: sourceKey },
                { type: "bonus", subType: "nature", statId: 5, value: 0, isGranted: true, _sourceKey: sourceKey }
            ];
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
                hintLower.includes("scholar") ||
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
    hasPactBoonDecision: boolean;
    activePactBoonValue?: string;
    netAbilityDecisionDelta: Record<number, number>;
}

const BOILERPLATE_CLASS_FEATURES = new Set([
    "hit points",
    "proficiencies",
    "equipment",
    "core barbarian traits",
    "core bard traits",
    "core cleric traits",
    "core druid traits",
    "core fighter traits",
    "core monk traits",
    "core paladin traits",
    "core ranger traits",
    "core rogue traits",
    "core sorcerer traits",
    "core warlock traits",
    "core wizard traits"
]);

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
    let hasPactBoonDecision = false;
    let activePactBoonValue: string | undefined = undefined;

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
            controlledMods: any[]
        ) => {
            if (baseOptions.length < 2) return;
            const decisionId = `${featureKeyPrefix}:${idSuffix}`;
            const options = [...baseOptions];

            if (defaultValue === "none" && !options.some(o => o.value === "none")) {
                options.unshift({ value: "none", label: "— Select Choice —" });
            }

            let effectiveDefault = defaultValue;
            if (!options.some(o => o.value === effectiveDefault)) {
                effectiveDefault = options[0].value;
            }
            const userChosen = activeFeatureChoices[decisionId];
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
                    const defaultMods = decisionValueToModifiers(effectiveDefault, category);
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
                const replacementMods = decisionValueToModifiers(selectedValue, category);
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

        // 3. Skill Expertise Modifiers on this Feature
        const skillExpMods = featureMods.filter(
            m =>
                !consumedModUids.has(m._modUid) &&
                m.type === "expertise" &&
                SKILL_KEY_SET.has(String(m.subType || "").toLowerCase())
        );
        const isScholar = nameLower.includes("scholar");
        const scholarAllowedSkills = isScholar
            ? ["arcana", "history", "investigation", "medicine", "nature", "religion"]
            : undefined;

        if (skillExpMods.length > 0) {
            skillExpMods.forEach((m, idx) => {
                const skKey = String(m.subType || "").toLowerCase();
                const label = skillExpMods.length > 1 ? `Skill Expertise #${idx + 1}` : "Skill Expertise";
                registerDecision(
                    `skill-exp:${idx}`,
                    label,
                    `skill-exp:${skKey}`,
                    buildSkillChoiceOptions("exp", scholarAllowedSkills),
                    [m]
                );
            });
        } else if (nameLower === "expertise" || nameLower.includes("skill expert") || isScholar) {
            const count = nameLower === "expertise" ? 2 : 1;
            const defaults = ["perception", "stealth"];
            for (let idx = 0; idx < count; idx++) {
                registerDecision(
                    `skill-exp:${idx}`,
                    count > 1 ? `Skill Expertise #${idx + 1}` : "Skill Expertise",
                    `skill-exp:${scholarAllowedSkills ? scholarAllowedSkills[0] : defaults[idx] || "perception"}`,
                    buildSkillChoiceOptions("exp", scholarAllowedSkills),
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
        const isKeenSenses = nameLower.includes("keen senses");
        const keenSensesAllowed = isKeenSenses ? ["insight", "perception", "survival"] : undefined;

        if (skillProfMods.length > 0) {
            skillProfMods.forEach((m, idx) => {
                const skKey = String(m.subType || "").toLowerCase();
                const label = skillProfMods.length > 1 ? `Skill Proficiency #${idx + 1}` : "Skill Proficiency";
                registerDecision(
                    `skill-prof:${idx}`,
                    label,
                    `skill-prof:${skKey}`,
                    buildSkillChoiceOptions("prof", keenSensesAllowed),
                    [m]
                );
            });
        } else if (nameLower === "skilled" || nameLower.includes("skill expert") || isKeenSenses || nameLower === "skillful") {
            const count = nameLower === "skilled" ? 3 : 1;
            const defaults = ["perception", "investigation", "insight"];
            for (let idx = 0; idx < count; idx++) {
                registerDecision(
                    `skill-prof:${idx}`,
                    count > 1 ? `Skill Proficiency #${idx + 1}` : "Skill Proficiency",
                    `skill-prof:${defaults[idx] || "perception"}`,
                    buildSkillChoiceOptions("prof", keenSensesAllowed),
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

        if (isFightingStyleFeature) {
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

        // 6. Cleric Divine Order & Druid Primal Order & Warlock Pact Boon
        if (nameLower.includes("divine order") || nameLower === "protector" || nameLower === "thaumaturge") {
            const orderMods = featureMods.filter(
                m => !consumedModUids.has(m._modUid) && (m.subType === "arcana" || m.subType === "religion")
            );
            const defaultOrder = nameLower.includes("thaumaturge") || orderMods.length > 0
                ? "divine-order:thaumaturge"
                : "divine-order:protector";
            registerDecision(
                "divine-order:0",
                "Divine Order",
                defaultOrder,
                DIVINE_ORDER_OPTIONS,
                orderMods
            );
        }

        if (nameLower.includes("primal order") || nameLower === "magician" || nameLower === "warden") {
            const orderMods = featureMods.filter(
                m => !consumedModUids.has(m._modUid) && (m.subType === "arcana" || m.subType === "nature")
            );
            const defaultOrder = nameLower.includes("magician") || orderMods.length > 0
                ? "primal-order:magician"
                : "primal-order:warden";
            registerDecision(
                "primal-order:0",
                "Primal Order",
                defaultOrder,
                PRIMAL_ORDER_OPTIONS,
                orderMods
            );
        }

        if (
            nameLower.includes("pact boon") ||
            nameLower === "pact of the blade" ||
            nameLower === "pact of the chain" ||
            nameLower === "pact of the tome"
        ) {
            const defaultPact = nameLower.includes("blade")
                ? "pact-boon:blade"
                : nameLower.includes("chain")
                  ? "pact-boon:chain"
                  : "pact-boon:tome";
            registerDecision(
                "pact-boon:0",
                "Pact Boon",
                defaultPact,
                PACT_BOON_OPTIONS,
                []
            );
            const activeDec = decisions[decisions.length - 1];
            if (activeDec) {
                hasPactBoonDecision = true;
                activePactBoonValue = activeDec.selectedValue;
            }
        }

        // 7. Damage Resistance / Elemental / Lineage Traits
        const resMods = featureMods.filter(
            m => !consumedModUids.has(m._modUid) && m.type === "resistance"
        );
        if (
            resMods.length > 0 ||
            nameLower.includes("fiendish legacy") ||
            nameLower.includes("hellish resistance") ||
            nameLower.includes("draconic ancestry") ||
            nameLower.includes("elemental adept")
        ) {
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
                const defaultRes = nameLower.includes("poison")
                    ? "resistance:poison"
                    : nameLower.includes("necrotic")
                      ? "resistance:necrotic"
                      : "resistance:fire";
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
        processedFeatsByIdx.set(idx, {
            name: def.name,
            source: "Feat",
            type: "Feat",
            description: def.description || def.snippet || "",
            decisions: decisions.length > 0 ? decisions : undefined
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
        features.push({
            name: def.name,
            source: "Class Option / Invocation",
            type: "Invocation",
            description: def.description || def.snippet || "",
            decisions: decisions.length > 0 ? decisions : undefined
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
                if (BOILERPLATE_CLASS_FEATURES.has(cfNameLower)) return;

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
                features.push({
                    name: cf.name,
                    source: cName,
                    type: "Class",
                    description: cf.description || cf.snippet || "",
                    decisions: decisions.length > 0 ? decisions : undefined
                });
            });
        }

        if (Array.isArray(cl.subclassDefinition?.classFeatures)) {
            const subName = cl.subclassDefinition.name || "Subclass";
            cl.subclassDefinition.classFeatures.forEach((cf: any) => {
                if ((cf.requiredLevel ?? 1) > cLevel || !cf.name) return;
                const compIds = getComponentIdsForFeature([cf.id, cf.definition?.id], "class");
                const prefix = `subclass:${slugifyKey(subName)}:${slugifyKey(cf.name)}:${cf.requiredLevel || 1}`;
                const decisions = buildDecisionsForFeature(
                    prefix,
                    cf.name,
                    cf.description || cf.snippet || "",
                    compIds,
                    "class"
                );
                features.push({
                    name: cf.name,
                    source: subName,
                    type: "Subclass",
                    description: cf.description || cf.snippet || "",
                    decisions: decisions.length > 0 ? decisions : undefined
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
            features.push({
                name: def.name,
                source: raceName,
                type: "Species",
                description: def.description || def.snippet || "",
                decisions: decisions.length > 0 ? decisions : undefined
            });
        });
    }

    return {
        features,
        hasFightingStyleDecision,
        activeFightingStyleValues,
        hasPactBoonDecision,
        activePactBoonValue,
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
        } else {
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

        if (kind === "ability") {
            const statId = Number(parts[1]) || 6;
            const bonus = Number(parts[2]) || 1;
            adjustAbilityScore(statId, sign * bonus);
        } else if (kind === "resilient") {
            const statId = Number(parts[1]) || 3;
            adjustAbilityScore(statId, sign * 1);
            adjustSaveProficiency(statId, sign === 1);
        } else if (kind === "skill-prof") {
            adjustSkillTier(parts[1], "prof", sign === 1);
        } else if (kind === "skill-exp") {
            adjustSkillTier(parts[1], "exp", sign === 1);
        } else if (kind === "fighting-style") {
            const style = parts[1];
            if (style === "defense") {
                character.vitals.armorClass += sign * 1;
            } else if (style === "blind-fighting") {
                character.vitals.blindsight = sign === 1 ? "10 ft." : "None";
            }
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

    // Recompute all skill bonuses and passive senses
    character.skills.forEach(skill => {
        const abMod = getMod(skill.stat);
        const mult = skill.proficiency === "expertise" ? 2 : skill.proficiency === "proficient" ? 1 : 0;
        skill.bonus = abMod + mult * profBonus;
    });

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
