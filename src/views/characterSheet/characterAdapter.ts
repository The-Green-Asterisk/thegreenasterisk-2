import { findClassOptionByName } from "../../rules/dnd5e_2024/classOptions";
import { resolveClassResources } from "../../rules/dnd5e_2024/classResources";
import { featBonus, featModifiers, resolveFeatResources } from "../../rules/dnd5e_2024/featRules";
import { calculateMulticlassSpellSlots } from "../../rules/dnd5e_2024/multiclass";
import { abilityKey, effectsFromLegacyNotes, mergeSaveEffects, normalizeAgainst, SaveEffect, saveEffectsFromRules } from "../../rules/dnd5e_2024/saveEffects";
import { rangeFeet, resolveSenses, senseGrantsFrom, writeSenses } from "../../rules/dnd5e_2024/senses";
import { detectLineage, resolveSpeciesResources, resolveSpeciesSpellAbility, speciesSenseGrants, speciesSpellAbilityOptions, traitBaseName } from "../../rules/dnd5e_2024/speciesRules";
import { AbilityName, ClassDefinition, FeatMechanics, LineageDefinition, ProgressionLevel, StatModifier } from "../../rules/dnd5e_2024/types";
import { findClassRule, findFeatRule, findSpeciesRule, getBackgroundRules, getClassRules, getSpeciesRules } from "../../services/classRules";
import { extractSpellDamageInfo, getSpellDamageDisplay } from "../../services/spellDamage";
import { armorRequirementMet, modifierNumber } from "../characterCreator/services/progressionModifiers";
import {
    AbilityScore,
    ActionItem,
    CharacterData,
    ClassResource,
    EquipmentItem,
    FeatureItem,
    SkillItem,
    SpellDefinition,
    WeaponItem
} from "./characterData";
import { readCampaign, readCompanions, readCurrency, readCustomActions, readCustomDefenses, readCustomItems, readCustomProficiencies, readDetails, readItemChargePips, readItemCharges, readNotes, readSpeciesSpellAbility, readTrackingState } from "./dndBeyondExtras";
import { extractFeaturesAndApplyDecisions } from "./featureDecisions";
import { applyGrantedWeapons, applyItemSensesToCharacter, applyMagicalItemBonuses, checkItemRequiresAttunement, isMundaneEquipment } from "./services/magicItemBonuses";

const ABILITY_NAMES: Record<number, { name: string; abbr: string; key: string }> = {
    1: { name: "Strength", abbr: "STR", key: "strength" },
    2: { name: "Dexterity", abbr: "DEX", key: "dexterity" },
    3: { name: "Constitution", abbr: "CON", key: "constitution" },
    4: { name: "Intelligence", abbr: "INT", key: "intelligence" },
    5: { name: "Wisdom", abbr: "WIS", key: "wisdom" },
    6: { name: "Charisma", abbr: "CHA", key: "charisma" }
};

const SKILL_DEFINITIONS: Array<{ name: string; stat: string; key: string }> = [
    { name: "Acrobatics", stat: "DEX", key: "acrobatics" },
    { name: "Animal Handling", stat: "WIS", key: "animal-handling" },
    { name: "Arcana", stat: "INT", key: "arcana" },
    { name: "Athletics", stat: "STR", key: "athletics" },
    { name: "Deception", stat: "CHA", key: "deception" },
    { name: "History", stat: "INT", key: "history" },
    { name: "Insight", stat: "WIS", key: "insight" },
    { name: "Intimidation", stat: "CHA", key: "intimidation" },
    { name: "Investigation", stat: "INT", key: "investigation" },
    { name: "Medicine", stat: "WIS", key: "medicine" },
    { name: "Nature", stat: "INT", key: "nature" },
    { name: "Perception", stat: "WIS", key: "perception" },
    { name: "Performance", stat: "CHA", key: "performance" },
    { name: "Persuasion", stat: "CHA", key: "persuasion" },
    { name: "Religion", stat: "INT", key: "religion" },
    { name: "Sleight of Hand", stat: "DEX", key: "sleight-of-hand" },
    { name: "Stealth", stat: "DEX", key: "stealth" },
    { name: "Survival", stat: "WIS", key: "survival" }
];

const SCHOOL_MAP: Record<string, string> = {
    1: "Abjuration",
    2: "Conjuration",
    3: "Divination",
    4: "Enchantment",
    5: "Evocation",
    6: "Illusion",
    7: "Necromancy",
    8: "Transmutation"
};

const ACTIVATION_MAP: Record<number, string> = {
    1: "1 Action",
    3: "1 Bonus Action",
    4: "1 Reaction",
    6: "1 Minute",
    7: "10 Minutes",
    8: "1 Hour",
    11: "Special"
};

const ALIGNMENT_NAMES: Record<number, string> = {
    1: "Lawful Good",
    2: "Neutral Good",
    3: "Chaotic Good",
    4: "Lawful Neutral",
    5: "True Neutral",
    6: "Chaotic Neutral",
    7: "Lawful Evil",
    8: "Neutral Evil",
    9: "Chaotic Evil"
};

function dieAverageSize(diceString?: string): number {
    if (!diceString) return 0;
    const m = diceString.match(/(\d+)d(\d+)/i);
    if (!m) return 0;
    return Number(m[1]) * Number(m[2]);
}

export function parseDndBeyondCharacter(
    payload: any,
    originalUrlOrId?: string,
    equipStateOverrides?: Array<{ scope: "item" | "weapon" | "weapon-mastery" | "attunement"; itemName: string; equipped: boolean }>,
    featureChoiceOverrides?: Record<string, string>
): CharacterData {
    const raw = payload?.data || payload;
    if (!raw || !raw.name) {
        throw new Error("Invalid character data received from D&D Beyond.");
    }

    // Apply any persisted equip state overrides to a shallow copy of inventory before computing modifiers
    const stateOverrideMap = new Map<string, boolean>();
    if (Array.isArray(equipStateOverrides)) {
        equipStateOverrides.forEach(s => {
            if (s && s.itemName) {
                stateOverrideMap.set(`${s.scope}:${s.itemName.toLowerCase()}`, !!s.equipped);
            }
        });
    }

    const rawInventory: any[] = (raw.inventory || []).map((item: any) => {
        const iName = (item.definition?.name || "").toLowerCase();
        const isWeapon = item.definition?.filterType === "Weapon";
        const itemKey = `item:${iName}`;
        const weaponKey = `weapon:${iName}`;
        const attuneKey = `attunement:${iName}`;
        let equipped = !!item.equipped;
        if (isWeapon && stateOverrideMap.has(weaponKey)) {
            equipped = !!stateOverrideMap.get(weaponKey);
        } else if (stateOverrideMap.has(itemKey)) {
            equipped = !!stateOverrideMap.get(itemKey);
        }
        let isAttuned = !!item.isAttuned;
        if (stateOverrideMap.has(attuneKey)) {
            isAttuned = !!stateOverrideMap.get(attuneKey);
        }
        return { ...item, equipped, isAttuned };
    });

    const characterValues: any[] = Array.isArray(raw.characterValues) ? raw.characterValues : [];

    // 1. Calculate Total Level & Classes
    const classes = (raw.classes || []).map((c: any) => ({
        name: c.definition?.name || "Adventurer",
        level: Number(c.level) || 1,
        subclass: c.subclassDefinition?.name
            ? c.subclassDefinition.name.replace(/\s*\([^)]+\)\s*$/, "").trim()
            : undefined
    }));
    const totalLevel = classes.reduce((sum: number, c: any) => sum + c.level, 0) || 1;

    // Build map of componentId -> class level and class source label for class-specific scaling and feature isolation
    const componentClassLevelMap = new Map<number, number>();
    const componentClassSourceMap = new Map<number, string>();
    // componentId -> base class name (never the subclass label), so class options can name the class that granted them
    const componentClassNameMap = new Map<number, string>();
    (raw.classes || []).forEach((c: any) => {
        const cLvl = Number(c.level) || 1;
        const cName = c.definition?.name || "Class";
        const subName = c.subclassDefinition?.name ? c.subclassDefinition.name.replace(/\s*\([^)]+\)\s*$/, "").trim() : undefined;
        const subLabel = subName || cName;

        if (c.definition?.id) {
            componentClassLevelMap.set(Number(c.definition.id), cLvl);
            componentClassSourceMap.set(Number(c.definition.id), cName);
            componentClassNameMap.set(Number(c.definition.id), cName);
        }
        if (c.subclassDefinition?.id) {
            componentClassLevelMap.set(Number(c.subclassDefinition.id), cLvl);
            componentClassSourceMap.set(Number(c.subclassDefinition.id), subLabel);
            componentClassNameMap.set(Number(c.subclassDefinition.id), cName);
        }
        (c.definition?.classFeatures || []).forEach((cf: any) => {
            if (cf?.id) {
                componentClassLevelMap.set(Number(cf.id), cLvl);
                componentClassSourceMap.set(Number(cf.id), cName);
                componentClassNameMap.set(Number(cf.id), cName);
            }
        });
        (c.subclassDefinition?.classFeatures || []).forEach((cf: any) => {
            if (cf?.id) {
                componentClassLevelMap.set(Number(cf.id), cLvl);
                componentClassSourceMap.set(Number(cf.id), subLabel);
                componentClassNameMap.set(Number(cf.id), cName);
            }
        });
        (c.classFeatures || []).forEach((cf: any) => {
            const id = cf?.definition?.id ?? cf?.id;
            if (id) {
                componentClassLevelMap.set(Number(id), cLvl);
                const isSub = (cf?.definition?.classId && cf.definition.classId === c.subclassDefinition?.id) ||
                    (cf?.subclassId && cf.subclassId === c.subclassDefinition?.id);
                componentClassSourceMap.set(Number(id), isSub ? subLabel : cName);
                componentClassNameMap.set(Number(id), cName);
            }
        });
    });

    (raw.options?.class || []).forEach((opt: any) => {
        const optName = opt.definition?.name || opt.name || "";
        const optId = opt.definition?.id || opt.id || opt.componentId;
        // D&D Beyond class options carry the granting feature's id in componentId, not a class id. Falling back to
        // the first class mislabeled a Bard/Warlock's Pact of the Tome spells as "Bard / Pact of the Tome".
        const cClass = (raw.classes || []).find((c: any) => opt.characterClassId && c.id === opt.characterClassId);
        const cName = cClass?.definition?.name
            || (opt.componentId ? componentClassNameMap.get(Number(opt.componentId)) : undefined)
            || ((raw.classes || []).length === 1 ? raw.classes[0].definition?.name : undefined)
            || "Class";
        if (optId && optName) {
            componentClassSourceMap.set(Number(optId), `${cName} / ${optName}`);
        }
    });

    // Helper: check if an inventory item's modifiers should be active
    const isInventoryItemActive = (item: any): boolean => {
        const def = item.definition;
        if (!def) return false;

        const nameLower = String(def.name || "").toLowerCase();
        const filterTypeLower = String(def.filterType || "").toLowerCase();
        // Consumables (potions, oils, scrolls) never grant passive ongoing modifiers from inventory
        if (
            filterTypeLower === "potion" ||
            filterTypeLower === "scroll" ||
            nameLower.includes("potion of") ||
            nameLower.includes("oil of") ||
            nameLower.startsWith("potion ") ||
            nameLower.startsWith("oil ")
        ) {
            return false;
        }

        const requiresAttunement = def.canAttune === true;
        if (requiresAttunement && !item.isAttuned) return false;

        const canEquip = def.canEquip !== false;
        if (canEquip && !item.equipped) return false;

        // If it cannot be equipped and does not require attunement (e.g. adventuring gear, mundane items), it is not an active magical equipment item
        if (!canEquip && !requiresAttunement) return false;

        return true;
    };

    // Map inventory definition IDs and item IDs to whether at least one copy is active
    const inventoryItemStatusById = new Map<number, boolean>();
    rawInventory.forEach((item: any) => {
        const active = isInventoryItemActive(item);
        const defId = Number(item.definition?.id);
        const itemId = Number(item.id);
        if (!Number.isNaN(defId) && defId > 0) {
            inventoryItemStatusById.set(defId, (inventoryItemStatusById.get(defId) || false) || active);
        }
        if (!Number.isNaN(itemId) && itemId > 0) {
            inventoryItemStatusById.set(itemId, (inventoryItemStatusById.get(itemId) || false) || active);
        }
    });

    // 2. Active Modifiers Collection & Filtering
    const allMods: any[] = [];
    const seenModKeys = new Set<string>();

    const pushModifier = (m: any, sourceKey: string) => {
        if (!m) return;
        if (sourceKey === "item") {
            const compId = Number(m.componentId);
            // If this modifier corresponds to an item present in inventory, require that item to be equipped/attuned
            if (!Number.isNaN(compId) && compId > 0 && inventoryItemStatusById.has(compId)) {
                if (!inventoryItemStatusById.get(compId)) return;
            }
            if (m.requiresAttunement === true && !Number.isNaN(compId) && compId > 0) {
                const matchingItem = rawInventory.find(
                    (i: any) => Number(i.definition?.id) === compId || Number(i.id) === compId
                );
                if (matchingItem && !matchingItem.isAttuned) return;
            }
        }
        const dedupeKey = m.id
            ? `id:${m.id}`
            : `${sourceKey}:${m.type}:${m.subType}:${m.componentId ?? ""}:${m.statId ?? ""}:${m.value ?? m.fixedValue ?? ""}:${m.restriction ?? ""}`;
        if (seenModKeys.has(dedupeKey)) return;
        seenModKeys.add(dedupeKey);
        allMods.push({ ...m, _sourceKey: sourceKey });
    };

    if (raw.modifiers && typeof raw.modifiers === "object") {
        for (const key of Object.keys(raw.modifiers)) {
            const list = raw.modifiers[key];
            if (Array.isArray(list)) {
                list.forEach((m: any) => pushModifier(m, key));
            }
        }
    }

    // Also include grantedModifiers directly embedded on active inventory items (if not already in raw.modifiers.item)
    rawInventory.forEach((item: any) => {
        if (!isInventoryItemActive(item)) return;
        const granted = item.definition?.grantedModifiers;
        if (Array.isArray(granted)) {
            granted.forEach((m: any) =>
                pushModifier({ ...m, componentId: m.componentId ?? item.definition?.id ?? item.id }, "item")
            );
        }
    });

    // componentId -> name of the feature, feat, trait, option, background, or item a modifier comes from
    const componentNameMap = new Map<number, string>();
    const nameComponent = (x: any) => {
        const id = Number(x?.definition?.id ?? x?.id);
        const name = String(x?.definition?.name ?? x?.name ?? "").trim();
        if (id && name && !componentNameMap.has(id)) componentNameMap.set(id, name);
    };
    (raw.classes || []).forEach((c: any) => {
        [...(c.classFeatures || []), ...(c.definition?.classFeatures || []), ...(c.subclassDefinition?.classFeatures || [])].forEach(nameComponent);
    });
    (raw.feats || []).forEach(nameComponent);
    (raw.race?.racialTraits || []).forEach(nameComponent);
    Object.values(raw.options || {}).forEach((list: any) => Array.isArray(list) && list.forEach(nameComponent));
    rawInventory.forEach((item: any) => {
        nameComponent(item);
        if (item?.definition?.id && item.definition.name) componentNameMap.set(Number(item.id), item.definition.name);
    });
    if (raw.background?.definition) nameComponent(raw.background);

    // Helper for raw flat value on a modifier (handles value vs fixedValue)
    const getModFlatValue = (m: any): number => {
        const v = m?.value !== null && m?.value !== undefined ? Number(m.value) : Number(m?.fixedValue);
        return Number.isFinite(v) ? v : 0;
    };

    // Helper to check if a modifier is unconditional (no restriction text)
    const isUnrestrictedMod = (m: any): boolean => {
        return !m?.restriction || String(m.restriction).trim() === "";
    };

    // Extract Features, Invocations, Feats, and Species Traits along with their interactive decisions,
    // and apply any user-selected feature choices directly onto `allMods` before computing stats
    const activeFeatureChoices: Record<string, string> = {
        ...(raw.trackingState?.featureChoices || {}),
        ...(raw.featureChoices || {}),
        ...(featureChoiceOverrides || {})
    };
    const extractedFeaturesResult = extractFeaturesAndApplyDecisions(raw, allMods, activeFeatureChoices);
    const features: FeatureItem[] = extractedFeaturesResult.features;

    // 3. Ability Scores (Base + Bonus + Modifiers + Set + Overrides)
    const statsArray = raw.stats || [];
    const bonusStats = raw.bonusStats || [];
    const overrideStats = raw.overrideStats || [];

    const abilityScoresMap: Record<number, number> = {};
    const baseAbilityScoresMap: Record<number, number> = {};
    for (let id = 1; id <= 6; id++) {
        const base = statsArray.find((s: any) => s.id === id)?.value ?? 10;
        baseAbilityScoresMap[id] = base;
        const bonus = bonusStats.find((s: any) => s.id === id)?.value ?? 0;
        const override = overrideStats.find((s: any) => s.id === id)?.value;

        // Check characterValues for ability score overrides/bonuses (typeId 1 = override, 2 = stacking bonus, 3 = set)
        const cvOverride = characterValues.find((cv: any) => Number(cv.typeId) === 1 && Number(cv.valueId) === id);
        const cvBonus = characterValues
            .filter((cv: any) => Number(cv.typeId) === 2 && Number(cv.valueId) === id)
            .reduce((sum: number, cv: any) => sum + (Number(cv.value) || 0), 0);
        const cvSet = characterValues.find((cv: any) => Number(cv.typeId) === 3 && Number(cv.valueId) === id);

        const statKey = ABILITY_NAMES[id]?.key;
        const modBonuses = allMods
            .filter(
                m =>
                    (m.type === "bonus" || m.type === "stacking-bonus") &&
                    (m.subType === `${statKey}-score` ||
                        m.subType === statKey ||
                        (m.subType === "ability-score-increases" &&
                            (Number(m.statId) === id || Number(m.entityId) === id)))
            )
            .reduce((sum, m) => sum + getModFlatValue(m), 0);

        let computedScore = base + bonus + cvBonus + modBonuses;

        // "set" modifiers (e.g. Gauntlets of Ogre Power = 19, Belt of Giant Strength = 21..29, Headband of Intellect = 19, Amulet of Health = 19)
        // raise the score if the set value is higher than the natural score
        const setMods = allMods.filter(
            m =>
                m.type === "set" &&
                (m.subType === `${statKey}-score` ||
                    m.subType === statKey ||
                    (m.subType === "ability-score-increases" &&
                        (Number(m.statId) === id || Number(m.entityId) === id)))
        );
        for (const sm of setMods) {
            const setVal = getModFlatValue(sm);
            if (setVal > computedScore) {
                computedScore = setVal;
            }
        }
        if (cvSet && Number.isFinite(Number(cvSet.value))) {
            computedScore = Math.max(computedScore, Number(cvSet.value));
        }

        const decisionDelta = extractedFeaturesResult.netAbilityDecisionDelta?.[id] || 0;
        if (override !== null && override !== undefined) {
            abilityScoresMap[id] = Number(override) + decisionDelta;
        } else if (cvOverride && Number.isFinite(Number(cvOverride.value))) {
            abilityScoresMap[id] = Number(cvOverride.value) + decisionDelta;
        } else {
            abilityScoresMap[id] = computedScore;
        }
    }

    const abilityModsById: Record<number, number> = {};
    for (let id = 1; id <= 6; id++) {
        abilityModsById[id] = Math.floor((abilityScoresMap[id] - 10) / 2);
    }

    // Helper for full modifier value including statId contribution (e.g. WIS on Monk AC, CHA on Paladin Aura)
    const resolveModValue = (m: any): number => {
        const flat = getModFlatValue(m);
        const statId = Number(m?.statId);
        const statBonus = !Number.isNaN(statId) && abilityModsById[statId] !== undefined ? abilityModsById[statId] : 0;
        return flat + statBonus;
    };

    // Proficiency Bonus (base + any proficiency-bonus modifiers like Ioun Stone of Mastery)
    const profBonusMod = allMods
        .filter(m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "proficiency-bonus")
        .reduce((sum, m) => sum + getModFlatValue(m), 0);
    const profBonus = Math.floor((totalLevel - 1) / 4) + 2 + profBonusMod;

    const strMod = abilityModsById[1] ?? 0;
    const dexMod = abilityModsById[2] ?? 0;
    const conMod = abilityModsById[3] ?? 0;
    const intMod = abilityModsById[4] ?? 0;
    const wisMod = abilityModsById[5] ?? 0;
    const chaMod = abilityModsById[6] ?? 0;

    // Each D&D Beyond class with its class rules (rule_classes, via /get-rules) and subclass
    const ABILITY_IDS: Record<AbilityName, number> = { str: 1, dex: 2, con: 3, int: 4, wis: 5, cha: 6 };
    const slugName = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const ruleClasses = (raw.classes || []).map((c: any) => {
        const def = findClassRule(String(c.definition?.name || ""));
        const subName = slugName(c.subclassDefinition?.name || "");
        const subclass = subName
            ? def?.subclasses?.find((s) => slugName(s.name) === subName || subName.includes(slugName(s.name)) || slugName(s.name).includes(subName) || s.id === subName)
            : undefined;
        return { def, subclass, level: Number(c.level) || 1 };
    });
    // The character's species in the species rules (rule_species, via /get-rules); its lineage is matched once the
    // resistances are known (getRuleLineage)
    const ruleSpecies = findSpeciesRule(String(raw.race?.baseName || raw.race?.baseRaceName || raw.species || raw.race?.fullName || ""));
    let ruleLineageMemo: LineageDefinition | undefined | null = null;
    const getRuleLineage = (): LineageDefinition | undefined => {
        if (ruleLineageMemo !== null) return ruleLineageMemo;
        const traitNames = [
            ...(raw.race?.racialTraits || []).map((rt: any) => String(rt?.definition?.name || rt?.name || "")),
            ...(raw.options?.race || []).map((o: any) => String(o?.definition?.name || o?.label || o?.name || ""))
        ];
        ruleLineageMemo = detectLineage(ruleSpecies, {
            texts: [raw.race?.subRaceShortName, raw.race?.subRaceName, raw.lineage, raw.race?.fullName].filter(Boolean),
            featureNames: traitNames,
            resistances: (raw.modifiers?.race || []).filter((m: any) => m?.type === "resistance").map((m: any) => String(m.subType || "")),
            spellNames: (raw.spells?.race || []).map((sp: any) => String(sp?.definition?.name || ""))
        });
        return ruleLineageMemo;
    };

    /** Modifiers from the class and subclass features the character's levels have unlocked (class rules data). */
    const ruleFeatureModifiers = ruleClasses.flatMap(({ def, subclass, level }: { def?: ClassDefinition; subclass?: any; level: number }) =>
        [...(def?.progression || []), ...((subclass?.progression || []) as ProgressionLevel[])]
            .filter((pl) => pl.level <= level)
            .flatMap((pl) => pl.features || [])
            .flatMap((f) => (f.modifiers || []).map((m) => ({ ...m, classLevel: level, _source: f.name })))
    );
    const ruleMods = (target: string, type: string) => ruleFeatureModifiers.filter((m: any) => m.target === target && m.type === type);
    const ruleAbilityMod = (m: StatModifier) => {
        const v = m.abilitySource ? abilityModsById[ABILITY_IDS[m.abilitySource]] ?? 0 : 0;
        return typeof m.minimum === "number" ? Math.max(m.minimum, v) : v;
    };
    /** Features with an action, bonus action, or reaction to list (class rules actionGrant). */
    const ruleActionGrants = ruleClasses.flatMap(({ def, subclass, level }: { def?: ClassDefinition; subclass?: any; level: number }) =>
        [...(def?.progression || []), ...((subclass?.progression || []) as ProgressionLevel[])]
            .filter((pl) => pl.level <= level)
            .flatMap((pl) => pl.features || [])
            .map((f: any) => f.actionGrant)
            .filter(Boolean)
    );
    // The class with a Martial Arts die (scalingTraits.martialArtsDieByLevel): its weapons and die
    const martialArtsClass = ruleClasses.find((c: any) => Array.isArray(c.def?.scalingTraits?.martialArtsDieByLevel));
    const martialArtsDie: string = martialArtsClass
        ? String(martialArtsClass.def.scalingTraits.martialArtsDieByLevel[Math.min(martialArtsClass.level, 20)] || "")
        : "";

    // The character's feats and class options (fighting styles, invocations) with their mechanics: feat rules, or the
    // class option of that name
    const featLikeNames: string[] = [
        ...(raw.feats || []).map((f: any) => f?.definition?.name),
        ...(raw.options?.feat || []).map((o: any) => o?.definition?.name),
        ...(raw.options?.class || []).map((o: any) => o?.definition?.name)
    ].filter(Boolean);
    // A class choice the player changed on the sheet (e.g. Fighting Style) swaps D&D Beyond's option for theirs
    const overridden = new Set<string>();
    const featMechanics: Array<FeatMechanics & { name: string }> = [];
    for (const sel of extractedFeaturesResult.classChoiceSelections) {
        if (!sel.selectedOptionName || sel.selectedOptionName === sel.defaultOptionName) continue;
        if (sel.defaultOptionName) overridden.add(sel.defaultOptionName.toLowerCase());
        featMechanics.push({ name: sel.selectedOptionName, modifiers: sel.selectedModifiers });
    }
    for (const n of featLikeNames) {
        if (overridden.has(String(n).toLowerCase())) continue;
        const feat = findFeatRule(n);
        const opt = feat ? undefined : findClassOptionByName(n);
        if (feat) featMechanics.push(feat);
        else if (opt) featMechanics.push({ name: opt.name, modifiers: opt.modifiers });
    }
    const featMods = (target: string, type?: string) => featModifiers(featMechanics, target, type);

    // Option action grants (e.g. Protection, Interception fighting styles)
    const ruleChoiceActionGrants = ruleClasses.flatMap(({ def, subclass, level }: { def?: ClassDefinition; subclass?: any; level: number }) =>
        [...(def?.progression || []), ...((subclass?.progression || []) as ProgressionLevel[])]
            .filter((pl) => pl.level <= level)
            .flatMap((pl) => pl.choices || [])
            .flatMap((c: any) => (c.options || []).filter((o: any) => featLikeNames.some(fn => fn.toLowerCase() === o.name.toLowerCase() || fn.toLowerCase() === (o.id || "").toLowerCase()) || featMechanics.some(fm => fm.name.toLowerCase() === o.name.toLowerCase())))
            .map((o: any) => o.actionGrant)
            .filter(Boolean)
    );
    ruleActionGrants.push(...ruleChoiceActionGrants);

    // Class levels & features lookup helpers
    const hasClassFeatureOrOption = (featureKeyword: string): boolean => {
        const kw = featureKeyword.toLowerCase();
        if ((raw.options?.class || []).some((o: any) => (o.definition?.name || "").toLowerCase().includes(kw))) {
            return true;
        }
        if ((raw.options?.feat || []).some((o: any) => (o.definition?.name || "").toLowerCase().includes(kw))) {
            return true;
        }
        return (raw.classes || []).some((c: any) => {
            const cLvl = Number(c.level) || 1;
            const inClass = (c.definition?.classFeatures || []).some(
                (cf: any) => (cf.requiredLevel ?? 1) <= cLvl && (cf.name || "").toLowerCase().includes(kw)
            );
            const inSub = (c.subclassDefinition?.classFeatures || []).some(
                (cf: any) => (cf.requiredLevel ?? 1) <= cLvl && (cf.name || "").toLowerCase().includes(kw)
            );
            return inClass || inSub;
        });
    };

    // Saving throws proficiency, expertise, half-proficiency, and bonuses
    const proficientSaveKeys = new Set<string>();
    const expertiseSaveKeys = new Set<string>();
    const halfProfSaveKeys = new Set<string>();
    const halfProfRoundUpSaveKeys = new Set<string>();


    allMods.forEach(m => {
        const sub = String(m.subType || "").toLowerCase();
        if (m.type === "proficiency") {
            if (sub.endsWith("-saving-throws")) {
                proficientSaveKeys.add(sub.replace("-saving-throws", ""));
            } else if (sub === "saving-throws") {
                Object.values(ABILITY_NAMES).forEach(a => proficientSaveKeys.add(a.key));
            }
        } else if (m.type === "expertise") {
            if (sub.endsWith("-saving-throws")) {
                expertiseSaveKeys.add(sub.replace("-saving-throws", ""));
            } else if (sub === "saving-throws") {
                Object.values(ABILITY_NAMES).forEach(a => expertiseSaveKeys.add(a.key));
            }
        } else if (m.type === "half-proficiency") {
            if (sub.endsWith("-saving-throws")) {
                halfProfSaveKeys.add(sub.replace("-saving-throws", ""));
            } else if (sub === "saving-throws") {
                Object.values(ABILITY_NAMES).forEach(a => halfProfSaveKeys.add(a.key));
            }
        } else if (m.type === "half-proficiency-round-up") {
            if (sub.endsWith("-saving-throws")) {
                halfProfRoundUpSaveKeys.add(sub.replace("-saving-throws", ""));
            } else if (sub === "saving-throws") {
                Object.values(ABILITY_NAMES).forEach(a => halfProfRoundUpSaveKeys.add(a.key));
            }
        }
    });

    // Class features granting proficiency in all saving throws (e.g. Monk Disciplined Survivor)
    if (ruleMods("saves.all", "proficiency_tier").length > 0) {
        Object.values(ABILITY_NAMES).forEach(a => proficientSaveKeys.add(a.key));
    }

    // Global unrestricted saving throw bonuses (e.g. Ring/Cloak of Protection, Stone of Good Luck, Staff of Power, Paladin Aura of Protection)
    const globalSaveBonusMods = allMods.filter(
        m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "saving-throws" && isUnrestrictedMod(m)
    );
    let globalSaveBonus = globalSaveBonusMods.reduce((sum, m) => sum + resolveModValue(m), 0);

    // Class features adding an ability modifier to all saves (e.g. Aura of Protection), unless D&D Beyond already emitted it
    for (const m of ruleMods("saves.all", "ability_mod")) {
        const statId = m.abilitySource ? ABILITY_IDS[m.abilitySource as AbilityName] : 0;
        if (globalSaveBonusMods.some(g => Number(g.statId) === statId)) continue;
        globalSaveBonus += ruleAbilityMod(m);
    }

    const abilities: AbilityScore[] = [];
    for (let id = 1; id <= 6; id++) {
        const meta = ABILITY_NAMES[id];
        const score = abilityScoresMap[id];
        const modifier = abilityModsById[id];
        const isExpert = expertiseSaveKeys.has(meta.key);
        const isProf = isExpert || proficientSaveKeys.has(meta.key);

        let profSaveContribution = 0;
        if (isExpert) {
            profSaveContribution = profBonus * 2;
        } else if (isProf) {
            profSaveContribution = profBonus;
        } else if (halfProfRoundUpSaveKeys.has(meta.key)) {
            profSaveContribution = Math.ceil(profBonus / 2);
        } else if (halfProfSaveKeys.has(meta.key)) {
            profSaveContribution = Math.floor(profBonus / 2);
        }

        // Ability-specific saving throw bonus modifiers
        const specificSaveBonus = allMods
            .filter(
                m =>
                    (m.type === "bonus" || m.type === "stacking-bonus") &&
                    m.subType === `${meta.key}-saving-throws` &&
                    isUnrestrictedMod(m)
            )
            .reduce((sum, m) => sum + resolveModValue(m), 0);

        // Custom save bonuses from characterValues (typeId 41 = custom bonus, 42 = magic bonus)
        const cvSaveBonus = characterValues
            .filter((cv: any) => (Number(cv.typeId) === 41 || Number(cv.typeId) === 42) && Number(cv.valueId) === id)
            .reduce((sum: number, cv: any) => sum + (Number(cv.value) || 0), 0);

        const save = modifier + profSaveContribution + globalSaveBonus + specificSaveBonus + cvSaveBonus;

        const baseVal = baseAbilityScoresMap[id] ?? score;
        abilities.push({
            name: meta.name,
            abbr: meta.abbr,
            score,
            modifier,
            save,
            proficientSave: isProf,
            baseScore: baseVal,
            bonus: score - baseVal
        });
    }

    // Saving throw advantage, disadvantage, and situational bonuses, merged with their sources: D&D Beyond's
    // modifiers (named by the feature, feat, trait, or item that grants each) and the feat and class rules data
    const savingThrowNotes: string[] = [];
    const saveEffectList: SaveEffect[] = [];
    allMods.forEach(m => {
        const sub = String(m.subType || "").toLowerCase();
        const isAllSaves = sub === "saving-throws";
        const ability = sub.endsWith("-saving-throws") ? abilityKey(sub.replace("-saving-throws", "")) : undefined;
        if (!isAllSaves && !ability) return;
        const source = componentNameMap.get(Number(m.componentId));
        const sources = source ? [source] : [];
        if (m.type === "advantage" || m.type === "disadvantage") {
            saveEffectList.push({ ability, effect: m.type, against: normalizeAgainst(m.restriction), sources });
        } else if ((m.type === "bonus" || m.type === "stacking-bonus") && isAllSaves && !isUnrestrictedMod(m)) {
            saveEffectList.push({ effect: "bonus", value: resolveModValue(m), against: normalizeAgainst(m.restriction), sources });
        }
    });
    saveEffectList.push(...saveEffectsFromRules([
        ...featMechanics.map((f: any) => ({ name: f.name, modifiers: f.modifiers })),
        ...ruleFeatureModifiers.map((m: any) => ({ name: m._source, modifiers: [m] }))
    ]));
    const saveEffects = mergeSaveEffects(saveEffectList);

    // Damage Resistances & Condition Immunities (from modifiers, species traits, or saved data)
    const damageResistances: string[] = [];
    allMods.forEach(m => {
        if (m.type === "resistance" && m.subType) {
            const rawSub = String(m.subType).toLowerCase();
            const dmgName = rawSub.charAt(0).toUpperCase() + rawSub.slice(1);
            if (!damageResistances.includes(dmgName)) {
                damageResistances.push(dmgName);
            }
        }
    });
    if (Array.isArray(raw.damageResistances)) {
        raw.damageResistances.forEach((r: string) => {
            if (r && !damageResistances.includes(r)) damageResistances.push(r);
        });
    }
    if (Array.isArray(raw.vitals?.damageResistances)) {
        raw.vitals.damageResistances.forEach((r: string) => {
            if (r && !damageResistances.includes(r)) damageResistances.push(r);
        });
    }

    const conditionImmunities: string[] = [];
    allMods.forEach(m => {
        if (m.type === "immunity" && m.subType) {
            const rawSub = String(m.subType).toLowerCase();
            const condName = rawSub.charAt(0).toUpperCase() + rawSub.slice(1);
            if (!conditionImmunities.includes(condName)) {
                conditionImmunities.push(condName);
            }
        }
    });
    if (Array.isArray(raw.conditionImmunities)) {
        raw.conditionImmunities.forEach((ci: string) => {
            if (ci && !conditionImmunities.includes(ci)) conditionImmunities.push(ci);
        });
    }
    if (Array.isArray(raw.vitals?.conditionImmunities)) {
        raw.vitals.conditionImmunities.forEach((ci: string) => {
            if (ci && !conditionImmunities.includes(ci)) conditionImmunities.push(ci);
        });
    }

    // 4. Hit Points (including hit-points-per-level from Tough, Dwarven Toughness, Draconic Resilience, etc.)
    const baseHp = Number(raw.baseHitPoints) || 10;
    const bonusHp = Number(raw.bonusHitPoints) || 0;
    const overrideHp = Number(raw.overrideHitPoints);
    const removedHp = Number(raw.removedHitPoints) || 0;
    const tempHp = Number(raw.temporaryHitPoints) || 0;

    const hpPerLevelMods = allMods.filter(
        m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "hit-points-per-level"
    );
    let hpPerLevelBonus = 0;
    for (const m of hpPerLevelMods) {
        const perLevelVal = getModFlatValue(m);
        if (perLevelVal === 0) continue;
        const compId = Number(m.componentId);
        const applicableLevels =
            m._sourceKey === "class" && !Number.isNaN(compId) && componentClassLevelMap.has(compId)
                ? componentClassLevelMap.get(compId)!
                : totalLevel;
        hpPerLevelBonus += perLevelVal * applicableLevels;
    }

    // Fallbacks if simplified payloads lack the raw modifier entries: feats (e.g. Tough) and class features (e.g.
    // Draconic Resilience)
    if (hpPerLevelMods.length === 0) {
        hpPerLevelBonus += featBonus(featMechanics, "vitals.maxHp", totalLevel, profBonus);
        for (const m of ruleMods("vitals.maxHp", "bonus")) {
            hpPerLevelBonus += modifierNumber(m);
        }
    }

    const flatHpBonus = allMods
        .filter(
            m =>
                (m.type === "bonus" || m.type === "stacking-bonus") &&
                (m.subType === "hit-points" || m.subType === "maximum-hit-points") &&
                // Exclude healing dice roll formulas (e.g. 4d4 + 4 on potions or healing spells)
                (!m.dice || (!m.dice.diceCount && !m.dice.diceString))
        )
        .reduce((sum, m) => sum + resolveModValue(m), 0);

    // In D&D Beyond baseHitPoints doesn't include CON modifier for each level in the raw field
    const calculatedMaxHp = overrideHp || baseHp + conMod * totalLevel + bonusHp + hpPerLevelBonus + flatHpBonus;
    const currentHp = Math.max(0, calculatedMaxHp - removedHp);

    // Hit Dice string dynamically computed per class
    const hitDiceStr =
        (raw.classes || [])
            .map((c: any) => {
                const hitDice = c.definition?.hitDice || 8;
                return `${c.level}d${hitDice}${c.definition?.name ? ` (${c.definition.name})` : ""}`;
            })
            .join(" + ") || `${totalLevel}d8`;

    // 5. Armor Class (Armored, Unarmored Defense, Natural Armor, Shields, Fighting Styles, Magic Bonuses, Overrides)
    const inventory = rawInventory;
    const equippedItems = inventory.filter((i: any) => i.equipped);

    let equippedBodyArmor: any = null;
    let shieldBonus = 0;
    let hasShield = false;

    const isShieldItem = (def: any): boolean => {
        if (!def) return false;
        return (
            def.filterType === "Shield" ||
            Number(def.armorTypeId) === 4 ||
            /\bshield\b/i.test(String(def.type || "")) ||
            (def.filterType === "Armor" && /\bshield\b/i.test(String(def.name || "")))
        );
    };

    const isBodyArmorItem = (def: any): boolean => {
        if (!def || isShieldItem(def)) return false;
        return (
            def.filterType === "Armor" &&
            (Number(def.armorClass) > 0 || [1, 2, 3].includes(Number(def.armorTypeId)))
        );
    };

    equippedItems.forEach((item: any) => {
        const def = item.definition;
        if (!def) return;
        if (isShieldItem(def)) {
            hasShield = true;
            shieldBonus += Number(def.armorClass) || 2;
        } else if (isBodyArmorItem(def)) {
            if (!equippedBodyArmor || (Number(def.armorClass) || 0) > (Number(equippedBodyArmor.definition?.armorClass) || 0)) {
                equippedBodyArmor = item;
            }
        }
    });

    const isArmored = !!equippedBodyArmor;
    const isWearingHeavyArmor = isArmored && Number(equippedBodyArmor.definition?.armorTypeId) === 3;

    // Helper: check if an unarmored modifier is blocked by equipping a shield
    const isBlockedByShield = (m: any): boolean => {
        if (!hasShield) return false;
        const rest = String(m.restriction || "").toLowerCase();
        if (rest.includes("not wielding a shield") || rest.includes("no shield") || rest.includes("without a shield")) {
            return true;
        }
        // A class Unarmored Defense using this ability that the class rules say doesn't allow a shield (e.g. Monk's WIS)
        const ability = (Object.keys(ABILITY_IDS) as AbilityName[]).find(a => ABILITY_IDS[a] === Number(m.statId));
        if (m._sourceKey === "class" && ability && ruleMods("vitals.ac", "unarmored_ac").some((r: any) => r.allowsShield === false && r.abilities?.includes(ability))) {
            return true;
        }
        return false;
    };

    let baseArmorClass = 10;

    if (isArmored) {
        const def = equippedBodyArmor.definition;
        const armorBase = Number(def.armorClass) || 10;
        const armorTypeId = Number(def.armorTypeId);
        let addDexToAc = true;
        let maxDexBonus = Infinity;

        if (armorTypeId === 1) {
            // Light Armor
            addDexToAc = true;
            maxDexBonus = Infinity;
        } else if (armorTypeId === 2) {
            // Medium Armor (base max +2, or what a feat raises it to, e.g. Medium Armor Master)
            addDexToAc = true;
            maxDexBonus = Number(featMods("vitals.ac.mediumArmorMaxDex", "set")[0]?.value) || 2;
        } else if (armorTypeId === 3) {
            // Heavy Armor
            addDexToAc = false;
            maxDexBonus = 0;
        }

        // Check modifiers that override max DEX bonus in armor (e.g. Medium Armor Master sets ac-max-dex-armored-modifier = 3)
        const maxDexMods = allMods.filter(
            m =>
                (m.type === "set" || m.type === "bonus") &&
                (m.subType === "ac-max-dex-armored-modifier" || m.subType === "ac-max-dex-modifier")
        );
        for (const mdm of maxDexMods) {
            const val = getModFlatValue(mdm);
            if (mdm.type === "set" && val >= 0) {
                maxDexBonus = Math.max(maxDexBonus === Infinity ? val : maxDexBonus, val);
                if (val === 0) addDexToAc = false;
            } else if (mdm.type === "bonus" && maxDexBonus !== Infinity) {
                maxDexBonus += val;
            }
        }

        const acDex = addDexToAc ? Math.min(dexMod, maxDexBonus) : 0;
        const armoredBonus = allMods
            .filter(m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "armored-armor-class")
            .reduce((sum, m) => sum + resolveModValue(m), 0);

        // Armor-only AC bonuses from feats and fighting styles (e.g. Defense) when D&D Beyond listed none
        const hasDefenseMod = allMods.some(m => m.subType === "armored-armor-class");
        const defenseStyleBonus = hasDefenseMod ? 0 : featMods("vitals.ac", "bonus")
            .filter(m => m.requires === "armor" || /armor/i.test(String(m.condition || "")))
            .reduce((sum, m) => sum + (Number(m.value) || 0), 0);

        baseArmorClass = armorBase + acDex + armoredBonus + defenseStyleBonus;
    } else {
        // Unarmored AC calculation
        const ignoreUnarmoredDex = allMods.some(
            m => m.type === "ignore" && m.subType === "unarmored-dex-ac-bonus"
        );
        let unarmoredMaxDex = Infinity;
        allMods
            .filter(
                m =>
                    m.type === "set" &&
                    (m.subType === "ac-max-dex-unarmored-modifier" || m.subType === "ac-max-dex-modifier")
            )
            .forEach(m => {
                const v = getModFlatValue(m);
                if (v >= 0) unarmoredMaxDex = Math.min(unarmoredMaxDex, v);
            });

        const unarmoredDex = ignoreUnarmoredDex ? 0 : Math.min(dexMod, unarmoredMaxDex);

        // Competing base unarmored AC formulas (5e rules: multiple base AC formulas don't stack; take the highest)
        interface UnarmoredCandidate {
            ac: number;
            statIdUsed?: number;
        }
        const candidates: UnarmoredCandidate[] = [{ ac: 10 + unarmoredDex }];

        // 1) "set" unarmored-armor-class modifiers from D&D Beyond
        // (e.g. Monk statId=5, Barbarian statId=3, Draconic/Mage Armor/Lizardfolk value=3, Tortle value=7 + ignore dex, Loxodon value=2 + statId=3 + ignore dex)
        const setUnarmoredMods = allMods.filter(
            m => m.type === "set" && m.subType === "unarmored-armor-class" && !isBlockedByShield(m)
        );
        for (const m of setUnarmoredMods) {
            const flatVal = getModFlatValue(m);
            const statId = Number(m.statId);
            const statMod = !Number.isNaN(statId) && abilityModsById[statId] !== undefined ? abilityModsById[statId] : 0;
            // DDB stores flat unarmored base offsets above 10 (e.g. 3 for 13+DEX, 7 for 17),
            // but also handle direct base values >= 10 (e.g. 13 or 17) gracefully
            const basePart = flatVal >= 10 ? flatVal : 10 + flatVal;
            const modIgnoresDex =
                ignoreUnarmoredDex ||
                String(m.restriction || "").toLowerCase().includes("no dexterity");
            const dexPart = modIgnoresDex ? 0 : unarmoredDex;
            candidates.push({
                ac: basePart + dexPart + statMod,
                statIdUsed: !Number.isNaN(statId) && statId > 0 ? statId : undefined
            });
        }

        // 2) Class and subclass Unarmored Defense formulas from the class rules (works even if the modifiers array is minimal)
        for (const m of ruleMods("vitals.ac", "unarmored_ac")) {
            if (!Array.isArray(m.abilities) || (hasShield && m.allowsShield === false)) continue;
            const others = (m.abilities as AbilityName[]).filter(a => a !== "dex");
            candidates.push({
                ac: 10 + (m.abilities.includes("dex") ? unarmoredDex : 0) + others.reduce((sum, a) => sum + (abilityModsById[ABILITY_IDS[a]] ?? 0), 0),
                statIdUsed: others.length === 1 ? ABILITY_IDS[others[0]] : undefined
            });
        }

        // Pick the winning unarmored base formula
        let bestCandidate = candidates[0];
        for (const c of candidates) {
            if (c.ac > bestCandidate.ac) {
                bestCandidate = c;
            }
        }

        // 3) Add "bonus" unarmored-armor-class modifiers (e.g. Bracers of Defense +2, or stat bonuses not already used by the base formula)
        const unarmoredBonusMods = allMods.filter(
            m =>
                (m.type === "bonus" || m.type === "stacking-bonus") &&
                m.subType === "unarmored-armor-class" &&
                !isBlockedByShield(m)
        );
        let unarmoredBonus = 0;
        for (const m of unarmoredBonusMods) {
            const flatVal = getModFlatValue(m);
            const statId = Number(m.statId);
            const statMod =
                !Number.isNaN(statId) &&
                    statId > 0 &&
                    abilityModsById[statId] !== undefined &&
                    bestCandidate.statIdUsed !== statId
                    ? abilityModsById[statId]
                    : 0;
            unarmoredBonus += flatVal + statMod;
        }

        baseArmorClass = bestCandidate.ac + unarmoredBonus;
    }

    // Global AC bonuses (magic armor/shield +1/+2/+3, Ring/Cloak of Protection, Staff of Power, Haste, Shield of Faith, Bladesong, etc.)
    const globalAcBonus = allMods
        .filter(
            m =>
                (m.type === "bonus" || m.type === "stacking-bonus") &&
                m.subType === "armor-class" &&
                !isBlockedByShield(m)
        )
        .reduce((sum, m) => sum + resolveModValue(m), 0);

    // Dual Wielder AC bonus (+1 AC when wielding two melee weapons)
    const equippedMeleeWeaponsCount = equippedItems
        .filter((i: any) => i.definition?.filterType === "Weapon" && Number(i.definition?.attackType) !== 2)
        .reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);
    const dualWieldAcBonus =
        equippedMeleeWeaponsCount >= 2
            ? allMods
                .filter(m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "dual-wield-armor-class")
                .reduce((sum, m) => sum + (getModFlatValue(m) || 1), 0)
            : 0;

    let armorClass = baseArmorClass + shieldBonus + globalAcBonus + dualWieldAcBonus;

    // Minimum / Hard-Set Armor Class modifiers (e.g. Barkskin sets minimum AC to 16 or 17)
    allMods
        .filter(m => m.type === "set" && (m.subType === "armor-class" || m.subType === "minimum-base-armor"))
        .forEach(m => {
            const setAc = getModFlatValue(m);
            if (setAc > armorClass) armorClass = setAc;
        });

    // Check characterValues for manual AC overrides or custom AC bonuses
    // In D&D Beyond characterValues: typeId 1 (with no ability valueId) = AC override, typeId 2 (no valueId) = AC magic bonus, typeId 3 (no valueId) = AC misc bonus
    const cvAcBonus = characterValues
        .filter((cv: any) => (Number(cv.typeId) === 2 || Number(cv.typeId) === 3) && !cv.valueId)
        .reduce((sum: number, cv: any) => sum + (Number(cv.value) || 0), 0);
    armorClass += cvAcBonus;

    const cvAcOverride = characterValues.find((cv: any) => Number(cv.typeId) === 1 && !cv.valueId && Number(cv.value) > 0);
    if (cvAcOverride) {
        armorClass = Number(cvAcOverride.value);
    }

    // 6. Speed & Senses (including innate-speed-walking, speed bonuses, and Monk/Barbarian Unarmored Movement)
    let walkSpeed = Number(raw.race?.weightSpeeds?.normal?.walk) || 30;

    // Set base walking speed modifiers (e.g. Wood Elf, Centaur, Boots of Striding and Springing)
    allMods
        .filter(
            m =>
                m.type === "set" &&
                (m.subType === "innate-speed-walking" || m.subType === "speed-walking" || m.subType === "speed")
        )
        .forEach(m => {
            const v = getModFlatValue(m);
            if (v > walkSpeed) walkSpeed = v;
        });

    // General speed bonuses (e.g. Mobile/Speedy feat +10, Longstrider +10)
    const speedBonus = allMods
        .filter(
            m =>
                (m.type === "bonus" || m.type === "stacking-bonus") &&
                (m.subType === "speed" || m.subType === "speed-walking")
        )
        .reduce((sum, m) => sum + resolveModValue(m), 0);

    // Unarmored Movement modifiers (Monk Unarmored Movement, Barbarian Fast Movement)
    const unarmoredMoveMods = allMods.filter(
        m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "unarmored-movement"
    );
    let unarmoredMoveBonus = 0;
    if (!isWearingHeavyArmor) {
        for (const m of unarmoredMoveMods) {
            if (isBlockedByShield(m)) continue;
            if (isArmored && m._sourceKey === "class" && ruleMods("vitals.speed", "bonus").some((r: any) => r.requires === "no-armor-or-shield" || r.requires === "no-armor")) continue;
            unarmoredMoveBonus += resolveModValue(m);
        }
        // Class rules fallback (Fast Movement, Unarmored Movement, Roving) if D&D Beyond listed no class speed modifiers
        const hasClassSpeedMods = allMods.some(
            m => m._sourceKey === "class" && ["unarmored-movement", "speed", "speed-walking"].includes(String(m.subType))
        );
        if (!hasClassSpeedMods) {
            const armorCategory = isWearingHeavyArmor ? "Heavy" : isArmored ? "Light" : null;
            for (const m of ruleMods("vitals.speed", "bonus")) {
                if (armorRequirementMet(m, armorCategory, hasShield)) unarmoredMoveBonus += modifierNumber(m);
            }
        }
    }

    walkSpeed += speedBonus + unarmoredMoveBonus;

    // Feat speed bonuses (e.g. Speedy, Boon of Speed) if D&D Beyond listed no feat speed modifiers
    const hasFeatSpeedMods = allMods.some(m => m._sourceKey === "feat" && ["speed", "speed-walking"].includes(String(m.subType)));
    if (!hasFeatSpeedMods) {
        walkSpeed += featBonus(featMechanics, "vitals.speed", totalLevel, profBonus);
    }

    // Custom walking speed override from customSpeeds (movementId 1 = Walk)
    if (Array.isArray(raw.customSpeeds)) {
        const customWalk = raw.customSpeeds.find((s: any) => Number(s.movementId) === 1 && Number(s.distance) > 0);
        if (customWalk) {
            walkSpeed = Number(customWalk.distance);
        }
    }

    // Climb / swim / fly / burrow special speeds
    const specialSpeedList: string[] = [];
    const speedLabels: Record<string, string> = { climb: "Climb", swim: "Swim", fly: "Fly", burrow: "Burrow" };
    for (const k of ["climb", "swim", "fly", "burrow"] as const) {
        let val = 0;
        const rawNorm = Number(raw.race?.weightSpeeds?.normal?.[k]);
        if (rawNorm > 0) val = Math.max(val, rawNorm);
        const customIdMap: Record<string, number> = { burrow: 2, climb: 3, fly: 4, swim: 5 };
        if (Array.isArray(raw.customSpeeds)) {
            const cs = raw.customSpeeds.find((s: any) => Number(s.movementId) === customIdMap[k] && Number(s.distance) > 0);
            if (cs) val = Math.max(val, Number(cs.distance));
        }
        const ruleSetMods = [
            ...ruleMods(`vitals.${k}`, "set"),
            ...ruleMods(`speeds.${k}`, "set"),
            ...featMods(`vitals.${k}`, "set"),
            ...featMods(`speeds.${k}`, "set")
        ];
        for (const rm of ruleSetMods) {
            const sVal = (rm.value === "walk" || rm.value === "equal_walk") ? walkSpeed : Number(rm.value) || 0;
            val = Math.max(val, sVal);
        }
        if (val > 0) specialSpeedList.push(`${speedLabels[k]} ${val} ft.`);
    }
    const fullSpeedDisplay = specialSpeedList.length > 0 ? `${walkSpeed} ft. (${specialSpeedList.join(", ")})` : `${walkSpeed} ft.`;

    // Sight in magical darkness: a D&D Beyond darkvision sense restricted to magical darkness
    const devilsSightMod = allMods.find(
        m =>
            (m.type === "sense" || m.type === "set-base") &&
            String(m.subType || "").toLowerCase().includes("darkvision") &&
            String(m.restriction || "").toLowerCase().includes("magical")
    );

    // Senses parser supporting "sense" and "set-base" modifiers, custom senses, and racial traits
    const getSenseRange = (senseName: string, fallback = "None") => {
        // 1. Check custom senses from character sheet overrides
        const customMap: Record<string, number> = { blindsight: 1, darkvision: 2, tremorsense: 3, truesight: 4 };
        const customId = customMap[senseName];
        if (customId && Array.isArray(raw.customSenses)) {
            const cs = raw.customSenses.find((s: any) => s.senseId === customId && Number(s.distance) > 0);
            if (cs) return `${cs.distance} ft.`;
        }

        // 2. Modifiers: filter matches by subType or friendlySubtypeName
        // Items' senses go on the items (applied while they're equipped), not into the character's base
        const senseMatches = allMods.filter(
            m =>
                m._sourceKey !== "item" &&
                (m.type === "sense" || m.type === "set-base" || m.type === "bonus") &&
                (String(m.subType || "").toLowerCase().includes(senseName) ||
                    String(m.friendlySubtypeName || "").toLowerCase().includes(senseName))
        );

        if (senseMatches.length > 0) {
            // Check all matching modifiers and take the maximum range (e.g. 120 ft overrides 60 ft)
            let maxRange = 0;
            for (const match of senseMatches) {
                const num = Number(match.value ?? match.fixedValue);
                if (Number.isFinite(num) && num > maxRange) {
                    maxRange = num;
                } else {
                    const text = `${match.snippet || ""} ${match.description || ""}`;
                    const textMatch = text.match(/(\d+)\s*(?:ft|feet)/i);
                    if (textMatch && Number(textMatch[1]) > maxRange) {
                        maxRange = Number(textMatch[1]);
                    }
                }
            }
            if (maxRange > 0) return `${maxRange} ft.`;
            if (senseName === "darkvision") return "60 ft.";
        }

        return fallback;
    };
    // D&D Beyond's senses are the base; the species, feats, and class options it gave no sense modifier for add theirs
    // from the rules data (species darkvision and traits, Boon of Truesight, Skulker, Blind Fighting, Devil's Sight,
    // and any senses.<key> added later)
    const ddbSenses: Record<string, number> = {};
    for (const key of ["darkvision", "blindsight", "tremorsense", "truesight"]) {
        const n = rangeFeet(getSenseRange(key));
        if (n > 0) ddbSenses[key] = n;
    }
    const ddbDevilsSight = rangeFeet(devilsSightMod?.value ?? devilsSightMod?.fixedValue) || (devilsSightMod ? 120 : 0);
    if (ddbDevilsSight > 0) ddbSenses["devils-sight"] = ddbDevilsSight;
    const senseGrants = [
        ...speciesSenseGrants(ruleSpecies, getRuleLineage(), totalLevel),
        ...senseGrantsFrom(featMechanics.map((f: any) => ({ name: f.name, modifiers: f.modifiers })))
    ].filter((g) => !ddbSenses[g.key]);
    const senseVitals: any = {};
    writeSenses(senseVitals, resolveSenses(ddbSenses, senseGrants), senseGrants);
    const darkvisionSense = senseVitals.darkvision;
    const blindsightSense = senseVitals.blindsight;
    const tremorsenseSense = senseVitals.tremorsense;
    const truesightSense = senseVitals.truesight;

    // 6b. Initiative (DEX mod + initiative bonuses + statId bonuses like Rakish Audacity/Dread Ambusher/Tactical Wit + Alert proficiency/half-proficiency)
    const initBonusMods = allMods.filter(
        m =>
            (m.type === "bonus" || m.type === "stacking-bonus") &&
            (m.subType === "initiative" ||
                m.subType === "ability-checks" ||
                m.subType === "dexterity-ability-checks") &&
            isUnrestrictedMod(m)
    );
    let initiativeBonus = initBonusMods.reduce((sum, m) => sum + resolveModValue(m), 0);

    // Check Initiative Proficiency / Expertise / Half-Proficiency (e.g. 2024 Alert feat, Harengon Hare-Trigger, Bard Jack of All Trades, Champion Remarkable Athlete)
    const isInitExpert = allMods.some(m => m.type === "expertise" && m.subType === "initiative");
    const isInitProficient =
        isInitExpert ||
        allMods.some(m => m.type === "proficiency" && m.subType === "initiative");
    const isInitHalfProfRoundUp = allMods.some(
        m =>
            m.type === "half-proficiency-round-up" &&
            (m.subType === "initiative" ||
                m.subType === "dexterity-ability-checks" ||
                m.subType === "ability-checks" ||
                m.subType === "round-up")
    );
    const isInitHalfProf = allMods.some(
        m =>
            m.type === "half-proficiency" &&
            (m.subType === "initiative" ||
                m.subType === "dexterity-ability-checks" ||
                m.subType === "ability-checks" ||
                m.subType === "round-down")
    );

    if (isInitExpert) {
        initiativeBonus += profBonus * 2;
    } else if (isInitProficient) {
        initiativeBonus += profBonus;
    } else if (isInitHalfProfRoundUp) {
        initiativeBonus += Math.ceil(profBonus / 2);
    } else if (isInitHalfProf) {
        initiativeBonus += Math.floor(profBonus / 2);
    }

    // Class rules Initiative bonuses (e.g. Dread Ambusher) if not already represented in raw.modifiers
    if (!initBonusMods.some(m => m.subType === "initiative")) {
        for (const m of ruleMods("vitals.initiative", "ability_mod")) {
            initiativeBonus += ruleAbilityMod(m);
        }
    }

    const initiative = dexMod + initiativeBonus;

    // 7. Skills & Passive Senses
    const proficientSkills = new Set<string>();
    const expertiseSkills = new Set<string>();
    const halfProfSkills = new Set<string>();
    const halfProfRoundUpSkills = new Set<string>();
    let globalHalfProfChecks = false;
    let globalHalfProfRoundUpChecks = false;

    allMods.forEach(m => {
        const sub = String(m.subType || "").toLowerCase();
        if (m.type === "proficiency") {
            proficientSkills.add(sub);
        } else if (m.type === "expertise") {
            expertiseSkills.add(sub);
        } else if (m.type === "half-proficiency") {
            if (sub === "ability-checks" || sub === "round-down") {
                globalHalfProfChecks = true;
            } else {
                halfProfSkills.add(sub);
            }
        } else if (m.type === "half-proficiency-round-up") {
            if (sub === "ability-checks" || sub === "round-up") {
                globalHalfProfRoundUpChecks = true;
            } else {
                halfProfRoundUpSkills.add(sub);
            }
        }
    });

    const globalAbilityCheckBonus = allMods
        .filter(
            m =>
                (m.type === "bonus" || m.type === "stacking-bonus") &&
                m.subType === "ability-checks" &&
                isUnrestrictedMod(m)
        )
        .reduce((sum, m) => sum + resolveModValue(m), 0);

    const skills: SkillItem[] = SKILL_DEFINITIONS.map(def => {
        const ability = abilities.find(a => a.abbr === def.stat);
        const abilityKey = ability ? ability.name.toLowerCase() : "";
        const mod = ability ? ability.modifier : 0;
        let proficiency: "none" | "proficient" | "expertise" = "none";
        let bonus = mod;

        if (expertiseSkills.has(def.key)) {
            proficiency = "expertise";
            bonus += profBonus * 2;
        } else if (proficientSkills.has(def.key)) {
            proficiency = "proficient";
            bonus += profBonus;
        } else if (
            globalHalfProfRoundUpChecks ||
            halfProfRoundUpSkills.has(def.key) ||
            halfProfRoundUpSkills.has(`${abilityKey}-ability-checks`)
        ) {
            bonus += Math.ceil(profBonus / 2);
        } else if (
            globalHalfProfChecks ||
            halfProfSkills.has(def.key) ||
            halfProfSkills.has(`${abilityKey}-ability-checks`)
        ) {
            bonus += Math.floor(profBonus / 2);
        }

        // Skill-specific and ability-check-specific bonus modifiers (e.g. Fey Wanderer Otherworldly Glamour, Thaumaturge, Magician, Stone of Good Luck)
        const skillSpecificBonus = allMods
            .filter(
                m =>
                    (m.type === "bonus" || m.type === "stacking-bonus") &&
                    (m.subType === def.key || (abilityKey && m.subType === `${abilityKey}-ability-checks`)) &&
                    isUnrestrictedMod(m)
            )
            .reduce((sum, m) => sum + resolveModValue(m), 0);

        bonus += globalAbilityCheckBonus + skillSpecificBonus;

        return {
            name: def.name,
            stat: def.stat,
            bonus,
            proficiency
        };
    });

    // Passive score helper (includes passive-<skill> modifiers like Observant feat +5, and +5/-5 from unrestricted skill advantage/disadvantage)
    const computePassiveScore = (skillName: string, skillKey: string, abilityKey: string, fallbackMod: number): number => {
        const skillObj = skills.find(s => s.name === skillName);
        const basePassive = 10 + (skillObj?.bonus ?? fallbackMod);

        const passiveModBonus = allMods
            .filter(
                m =>
                    (m.type === "bonus" || m.type === "stacking-bonus") &&
                    m.subType === `passive-${skillKey}` &&
                    isUnrestrictedMod(m)
            )
            .reduce((sum, m) => sum + resolveModValue(m), 0);

        const hasUnrestrictedAdv = allMods.some(
            m =>
                m.type === "advantage" &&
                (m.subType === skillKey ||
                    m.subType === `passive-${skillKey}` ||
                    m.subType === `${abilityKey}-ability-checks` ||
                    m.subType === "ability-checks") &&
                isUnrestrictedMod(m)
        );
        const hasUnrestrictedDisadv = allMods.some(
            m =>
                m.type === "disadvantage" &&
                (m.subType === skillKey ||
                    m.subType === `passive-${skillKey}` ||
                    m.subType === `${abilityKey}-ability-checks` ||
                    m.subType === "ability-checks") &&
                isUnrestrictedMod(m)
        );

        const advAdjustment = (hasUnrestrictedAdv ? 5 : 0) - (hasUnrestrictedDisadv ? 5 : 0);
        return basePassive + passiveModBonus + advAdjustment;
    };

    const passivePerception = computePassiveScore("Perception", "perception", "wisdom", wisMod);
    const passiveInvestigation = computePassiveScore("Investigation", "investigation", "intelligence", intMod);
    const passiveInsight = computePassiveScore("Insight", "insight", "wisdom", wisMod);

    // 8. Spellcasting ability, Spell Save DC, and Spell Attack Bonus (including Rod of the Pact Keeper, Wand of the War Mage, Amulet of the Devout, etc.)
    let spellcastingAbilityId = 6; // default CHA
    let bestCasterScore = -Infinity;
    for (const cl of raw.classes || []) {
        const canCast = cl.definition?.canCastSpells || cl.subclassDefinition?.canCastSpells;
        const abilityId = Number(cl.definition?.spellCastingAbilityId || cl.subclassDefinition?.spellCastingAbilityId);
        if (canCast && abilityId >= 1 && abilityId <= 6) {
            const cScore = (Number(cl.level) || 1) * 10 + (abilityModsById[abilityId] ?? 0);
            if (cScore > bestCasterScore) {
                bestCasterScore = cScore;
                spellcastingAbilityId = abilityId;
            }
        }
    }
    const spellAbbr = ABILITY_NAMES[spellcastingAbilityId]?.abbr || "CHA";
    const spellMod = abilities.find(a => a.abbr === spellAbbr)?.modifier || 0;

    const classNamesLower = (raw.classes || []).map((c: any) => String(c.definition?.name || "").toLowerCase()).filter(Boolean);
    const spellDcBonus = allMods
        .filter(m => {
            if (m.type !== "bonus" && m.type !== "stacking-bonus") return false;
            const sub = String(m.subType || "").toLowerCase();
            return (
                sub === "spell-save-dc" ||
                classNamesLower.some((cn: string) => sub === `${cn}-spell-save-dc`)
            );
        })
        .reduce((sum, m) => sum + resolveModValue(m), 0);

    const spellAttackModBonus = allMods
        .filter(m => {
            if (m.type !== "bonus" && m.type !== "stacking-bonus") return false;
            const sub = String(m.subType || "").toLowerCase();
            return (
                sub === "spell-attacks" ||
                sub === "ranged-spell-attacks" ||
                sub === "melee-spell-attacks" ||
                classNamesLower.some((cn: string) => sub === `${cn}-spell-attacks`)
            );
        })
        .reduce((sum, m) => sum + resolveModValue(m), 0);

    const spellSaveDc = 8 + profBonus + spellMod + spellDcBonus;
    const spellAttackBonus = profBonus + spellMod + spellAttackModBonus;

    // 9. Spells Collection
    const spellsMap = new Map<string, SpellDefinition>();
    type SpellCopy = { kind: "pick" | "always" | "granted"; source: string };
    const spellCopies = new Map<string, { name: string; copies: SpellCopy[] }>();

    function addSpell(s: any, sourceName: string, isFromClassSpells: boolean = false) {
        const def = s.definition;
        if (!def || !def.name) return;

        const school = typeof def.school === "string" ? def.school : SCHOOL_MAP[def.school] || "Universal";
        const activationType = ACTIVATION_MAP[def.activation?.activationType] || "1 Action";
        const castingTime =
            def.activation?.activationTime > 1
                ? `${def.activation.activationTime} ${activationType.replace(/^1\s+/, "")}s`
                : activationType;

        let rangeStr = "Self";
        if (def.range) {
            if (def.range.rangeValue) {
                rangeStr = `${def.range.rangeValue} ft.`;
            } else if (def.range.origin) {
                rangeStr = def.range.origin;
            }
        }

        let durationStr = "Instantaneous";
        if (def.duration) {
            if (def.duration.durationInterval) {
                durationStr = `${def.duration.durationInterval} ${def.duration.durationUnit || "Minute"}`;
            } else if (def.duration.durationType) {
                durationStr = def.duration.durationType;
            }
        }
        if (def.concentration && !durationStr.toLowerCase().includes("concentration")) {
            durationStr = `Concentration, up to ${durationStr}`;
        }

        const compList: string[] = [];
        if (Array.isArray(def.components)) {
            if (def.components.includes(1)) compList.push("V");
            if (def.components.includes(2)) compList.push("S");
            if (def.components.includes(3)) {
                compList.push(def.componentsDescription ? `M (${def.componentsDescription})` : "M");
            }
        }
        const componentsStr = compList.join(", ") || "None";

        const isLegacy = def.isLegacy === true ||
            (def.sourceId && def.sourceId !== 145 && !def.sources?.some((src: any) => src?.sourceId === 145)) ||
            /\b(?:2014|legacy)\b/i.test(def.name || "");
        const finalSource = isLegacy && !sourceName.includes("[Legacy]")
            ? `${sourceName} [Legacy]`
            : sourceName;

        const isAlwaysPrepared = s.alwaysPrepared === true ||
            (!isFromClassSpells && s.countsAsKnownSpell === false);

        const damageInfo = extractSpellDamageInfo({
            level: Number(def.level) || 0,
            description: def.description || def.snippet || "",
            damageDice: def.damageDice,
            damageType: def.damageType,
            damageModifier: def.damageModifier,
            damageScaling: def.damageScaling,
            modifiers: def.modifiers || s.modifiers
        });

        const spellDef: SpellDefinition = {
            id: def.id,
            name: def.name,
            level: Number(def.level) || 0,
            school,
            source: finalSource,
            castingTime,
            range: rangeStr,
            duration: durationStr,
            components: componentsStr,
            concentration: !!def.concentration,
            ritual: !!def.ritual,
            description: def.description || def.snippet || "<p>No description provided.</p>",
            imageUrl: def.avatarUrl || def.largeAvatarUrl || undefined,
            isLegacy: isLegacy || undefined,
            alwaysPrepared: isAlwaysPrepared ? true : undefined,
            damageDice: damageInfo.damageDice,
            damageType: damageInfo.damageType,
            damageModifier: damageInfo.damageModifier,
            damageScaling: damageInfo.damageScaling
        };

        // Track every copy D&D Beyond lists, by where it came from, to report duplicates on import; and whether any
        // copy is explicitly always prepared, so a regular pick of that spell never counts against prepared spells
        const nameKey = def.name.toLowerCase();
        const copies = spellCopies.get(nameKey) || { name: def.name, copies: [] as SpellCopy[] };
        copies.copies.push({
            kind: s.alwaysPrepared === true ? "always" : (isFromClassSpells && s.countsAsKnownSpell !== false ? "pick" : "granted"),
            source: sourceName
        });
        spellCopies.set(nameKey, copies);

        const existing = spellsMap.get(def.name.toLowerCase());
        if (existing) {
            if (isFromClassSpells) {
                spellsMap.set(def.name.toLowerCase(), spellDef);
            }
            return;
        }

        spellsMap.set(def.name.toLowerCase(), spellDef);
    }

    if (raw.classSpells) {
        raw.classSpells.forEach((cs: any) => {
            const classObj = raw.classes?.find((c: any) => c.id === cs.characterClassId);
            const className = classObj?.definition?.name || "Class";
            // spellListId is set when D&D Beyond added the spell from another class's list
            const classLevel = Number(classObj?.level) || 1;
            const clsRule = findClassRule(className);
            const subName = String(classObj?.subclassDefinition?.name || "").toLowerCase();
            const subRule = clsRule?.subclasses.find(sc => subName && (sc.name.toLowerCase() === subName || subName.includes(sc.name.toLowerCase())));
            const expandedFeature = [...(clsRule?.spellcasting?.expandedSpellLists || []), ...(subRule?.expandedSpellLists || [])]
                .find(exp => classLevel >= exp.level)?.feature;
            (cs.spells || []).forEach((s: any) => {
                addSpell(s, className, true);
                const added = spellsMap.get(String(s.definition?.name || "").toLowerCase());
                if (added && s.spellListId !== null && s.spellListId !== undefined) {
                    added.viaFeature = expandedFeature || "Another class's list";
                }
            });
        });
    }

    ["race", "class", "background", "item", "feat"].forEach(key => {
        (raw.spells?.[key] || []).forEach((s: any) => {
            let source = key.charAt(0).toUpperCase() + key.slice(1);
            if (key === "class" && s.componentId && componentClassSourceMap.has(Number(s.componentId))) {
                source = componentClassSourceMap.get(Number(s.componentId))!;
            }
            addSpell(s, source, false);
        });
    });

    // A spell any feature keeps always prepared never counts against prepared spells, even when the character also
    // picked it as a regular spell. Duplicates that include one of the player's picks are reported, to fix on D&D Beyond.
    const duplicateSpells: NonNullable<CharacterData["duplicateSpells"]> = [];
    spellCopies.forEach(({ name, copies }, nameKey) => {
        const hasAlways = copies.some(c => c.kind === "always");
        const kept = spellsMap.get(nameKey);
        if (kept && hasAlways) kept.alwaysPrepared = true;
        // Only duplicates the player can fix: at least one copy is a spell they picked. Extra copies D&D Beyond adds
        // for features (a free daily cast, Mantle of Majesty's Command) aren't reported.
        if (copies.length < 2 || !copies.some(c => c.kind === "pick")) return;

        const labelCounts = new Map<string, number>();
        copies.forEach(c => {
            const label = c.kind === "pick"
                ? `prepared as a ${c.source} spell`
                : c.kind === "always" ? `always prepared by ${c.source}` : `granted by ${c.source}`;
            labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        });
        duplicateSpells.push({
            name,
            copies: Array.from(labelCounts.entries()).map(([label, n]) => (n > 1 ? `${label} (${n} times)` : label)),
            wastedPicks: hasAlways ? copies.filter(c => c.kind === "pick").length : 0
        });
    });
    duplicateSpells.sort((a, b) => a.name.localeCompare(b.name));

    const spellsList = Array.from(spellsMap.values()).sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    // Check if character has Agonizing Blast invocation
    const hasAgonizingBlast = hasClassFeatureOrOption("Agonizing Blast");

    // 10. Actions & Attacks
    const actions: ActionItem[] = [];

    // Cantrip attack actions (like Eldritch Blast, Fire Bolt, etc.)
    const cantripMods = [
        ...featMods("damage.cantrips"),
        ...ruleMods("damage.cantrips", "ability_mod"),
        ...ruleMods("damage.cantrips", "bonus"),
        ...featMods("damage.eldritch_blast"),
        ...ruleMods("damage.eldritch_blast", "ability_mod"),
        ...ruleMods("damage.eldritch_blast", "bonus")
    ];

    spellsList.forEach(spell => {
        if (spell.level === 0) {
            let hitOrDc = `+${spellAttackBonus} to hit`;
            if (spell.description.includes("saving throw")) {
                hitOrDc = `DC ${spellSaveDc} Save`;
            }
            const isEb = spell.name.toLowerCase() === "eldritch blast";
            const dmgMatch = (spell.description || "").match(/(\d+d\d+)\s+([a-zA-Z]+)\s+damage/i);
            const baseDmgDie = isEb ? "1d10" : (dmgMatch ? dmgMatch[1] : "");
            const baseDmgType = isEb ? "Force" : (dmgMatch ? dmgMatch[2] : "");

            let cantripBonus = 0;
            for (const m of cantripMods) {
                if (m.target === "damage.cantrips" || (isEb && m.target === "damage.eldritch_blast")) {
                    if (m.type === "ability_mod" && m.abilitySource) {
                        cantripBonus += abilityModsById[ABILITY_IDS[m.abilitySource as AbilityName]] ?? 0;
                    } else if (typeof m.value === "number") {
                        cantripBonus += m.value;
                    }
                }
            }
            if (isEb && hasAgonizingBlast && cantripBonus === 0) {
                cantripBonus = chaMod;
            }

            let damageOrEffect = "Spell Effect";
            if (isEb) {
                const beamCount = totalLevel >= 17 ? 4 : totalLevel >= 11 ? 3 : totalLevel >= 5 ? 2 : 1;
                const bonusStr = cantripBonus !== 0 ? (cantripBonus >= 0 ? ` + ${cantripBonus}` : ` - ${Math.abs(cantripBonus)}`) : "";
                damageOrEffect = beamCount > 1
                    ? `${beamCount} beams • 1d10${bonusStr} Force each`
                    : `1d10${bonusStr} Force`.trim();
            } else {
                const scaledDamage = getSpellDamageDisplay(spell, 0, totalLevel, spellMod);
                if (scaledDamage) {
                    const scaledParts = scaledDamage.match(/^(\d+d\d+)(?:\s*([+-]\s*\d+))?(?:\s+([A-Za-z]+))?/);
                    const dice = scaledParts ? scaledParts[1] : (dmgMatch ? dmgMatch[1] : "");
                    const type = scaledParts && scaledParts[3] ? scaledParts[3] : (baseDmgType || "");
                    const existingMod = scaledParts && scaledParts[2] ? parseInt(scaledParts[2].replace(/\s+/g, ""), 10) : 0;
                    const totalBonus = existingMod + cantripBonus;
                    const bonusStr = totalBonus !== 0 ? (totalBonus >= 0 ? ` + ${totalBonus}` : ` - ${Math.abs(totalBonus)}`) : "";
                    damageOrEffect = `${dice}${bonusStr} ${type}`.trim();
                } else if (baseDmgDie) {
                    const bonusStr = cantripBonus !== 0 ? (cantripBonus >= 0 ? ` + ${cantripBonus}` : ` - ${Math.abs(cantripBonus)}`) : "";
                    damageOrEffect = `${baseDmgDie}${bonusStr} ${baseDmgType}`.trim();
                } else if (cantripBonus !== 0) {
                    damageOrEffect = `+${cantripBonus} Damage`;
                }
            }
            if (spell.name.toLowerCase() === "vicious mockery" && !damageOrEffect.includes("Disadvantage")) {
                damageOrEffect = `${damageOrEffect} + Disadvantage`;
            }

            actions.push({
                name: spell.name,
                type: spell.castingTime.toLowerCase().includes("bonus")
                    ? "Bonus Action"
                    : spell.castingTime.toLowerCase().includes("reaction")
                        ? "Reaction"
                        : "Action",
                rangeOrReach: spell.range,
                hitOrDc,
                damageOrEffect,
                notes: `${spell.school} cantrip. Click to view full details.`,
                spellName: spell.name
            });
        }
    });

    // Helper for computing complete weapon attack & damage with all modifiers (Magic +1/+2/+3, Monk Martial Arts, Pact of the Blade/Hexblade, Battlesmith, Archery, Dueling, etc.)
    const hasPactOfTheBladeOrHexWarrior =
        hasClassFeatureOrOption("Pact of the Blade") ||
        hasClassFeatureOrOption("Hex Warrior");
    const hasBattleReadyOrArmorer =
        hasClassFeatureOrOption("Battle Ready");
    const monkMartialArtsDie = martialArtsDie;

    // Check Dueling eligibility (wielding a single melee weapon in one hand and no other weapons)
    const totalEquippedWeaponsCount = equippedItems
        .filter((i: any) => i.definition?.filterType === "Weapon")
        .reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0);

    const computeWeaponStats = (item: any, isEquipped: boolean) => {
        const def = item.definition || {};
        const props: string[] = (def.properties || []).map((p: any) => String(p.name || ""));
        const propsLower = props.map(p => p.toLowerCase());
        const isFinesse = propsLower.includes("finesse");
        const isTwoHanded = propsLower.includes("two-handed");
        const isHeavy = propsLower.includes("heavy");
        const isLight = propsLower.includes("light");
        const isThrown = propsLower.includes("thrown");
        const isRanged = Number(def.attackType) === 2;
        const categoryId = Number(def.categoryId);

        // Determine if weapon qualifies as a Monk weapon (Simple melee without Two-Handed/Heavy, or Martial melee with Light property)
        const isMonkWeapon =
            !!martialArtsDie &&
            !isRanged &&
            !isTwoHanded &&
            !isHeavy &&
            (categoryId === 1 || isLight || /shortsword/i.test(String(def.name || def.type || "")));

        // Base ability modifier
        let atkAbilityMod = isRanged ? dexMod : isFinesse || isMonkWeapon ? Math.max(dexMod, strMod) : strMod;

        // Hexblade / Pact of the Blade (uses CHA if higher)
        const isHexOrPactBound =
            hasPactOfTheBladeOrHexWarrior ||
            characterValues.some(
                (cv: any) =>
                    (Number(cv.typeId) === 28 || Number(cv.typeId) === 29) &&
                    (Number(cv.valueId) === Number(item.id) || Number(cv.valueId) === Number(def.id)) &&
                    cv.value
            );
        if (isHexOrPactBound && chaMod > atkAbilityMod) {
            atkAbilityMod = chaMod;
        }

        // Artificer Battle Smith / Armorer (uses INT on magic weapons if higher)
        if (hasBattleReadyOrArmorer && (def.magic || isHexOrPactBound) && intMod > atkAbilityMod) {
            atkAbilityMod = intMod;
        }

        // Weapon Proficiency check
        const wTypeSlug = String(def.type || def.name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-");
        const wNameSlug = String(def.name || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-");
        const isProficient =
            profBonus > 0 &&
            ((categoryId === 1 && proficientSkills.has("simple-weapons")) ||
                (categoryId === 2 && proficientSkills.has("martial-weapons")) ||
                isMonkWeapon ||
                allMods.some(
                    m =>
                        m.type === "proficiency" &&
                        ((categoryId === 1 && m.subType === "simple-weapons") ||
                            (categoryId === 2 && m.subType === "martial-weapons") ||
                            (categoryId !== 1 && categoryId !== 2 && m.subType === "simple-weapons") ||
                            m.subType === wTypeSlug ||
                            m.subType === wNameSlug)
                ));

        // Magic bonus (+1/+2/+3) from item's grantedModifiers or item-scoped modifiers
        const itemMods: any[] = [];
        const seenItemModKeys = new Set<string>();
        const pushItemMod = (m: any) => {
            if (!m) return;
            const key = m.id
                ? `id:${m.id}`
                : `${m.type}:${m.subType}:${m.value ?? m.fixedValue ?? ""}:${m.dice?.diceString ?? ""}`;
            if (seenItemModKeys.has(key)) return;
            seenItemModKeys.add(key);
            itemMods.push(m);
        };
        if (Array.isArray(def.grantedModifiers)) {
            def.grantedModifiers.forEach(pushItemMod);
        }
        allMods
            .filter(
                m =>
                    m._sourceKey === "item" &&
                    (Number(m.componentId) === Number(def.id) || Number(m.componentId) === Number(item.id))
            )
            .forEach(pushItemMod);

        const magicBonus = itemMods
            .filter(m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "magic")
            .reduce((sum, m) => sum + getModFlatValue(m), 0);

        // Fighting Styles & Global Weapon Attack / Damage Modifiers
        const globalAtkBonus = allMods
            .filter(m => {
                if (m.type !== "bonus" && m.type !== "stacking-bonus") return false;
                const sub = String(m.subType || "").toLowerCase();
                if (sub === "weapon-attacks" || sub === "attack-rolls") return true;
                if (isRanged && (sub === "ranged-weapon-attacks" || sub === "ranged-attacks")) return true;
                if (!isRanged && (sub === "melee-weapon-attacks" || sub === "melee-attacks")) return true;
                if (!isRanged && !isTwoHanded && sub === "one-handed-melee-attacks" && m.statId) return true;
                return false;
            })
            .reduce((sum, m) => sum + resolveModValue(m), 0);

        // Archery Fighting Style fallback if not already emitted in globalAtkBonus
        const hasArcheryMod = allMods.some(
            m => m.subType === "ranged-weapon-attacks" || m.subType === "ranged-attacks"
        );
        const archeryFallback = isRanged && !hasArcheryMod ? featBonus(featMechanics, "attacks.ranged", totalLevel, profBonus) : 0;

        // Dueling Fighting Style bonus (+2 damage to one-handed melee weapons when no other weapons are equipped)
        const qualifiesForDueling = !isRanged && !isTwoHanded && (!isEquipped || totalEquippedWeaponsCount <= 1);
        const duelingModBonus = qualifiesForDueling
            ? allMods
                .filter(
                    m =>
                        (m.type === "bonus" || m.type === "damage") &&
                        (m.subType === "one-handed-melee-attacks" || m.subType === "melee-weapon-damage")
                )
                .reduce((sum, m) => sum + getModFlatValue(m), 0)
            : 0;
        const duelingFallback =
            qualifiesForDueling && duelingModBonus === 0 ? featBonus(featMechanics, "damage.melee_one_handed", totalLevel, profBonus) : 0;

        // Thrown Weapon Fighting bonus
        const thrownModBonus = isThrown
            ? allMods
                .filter(m => (m.type === "bonus" || m.type === "damage") && m.subType === "thrown-weapon-damage")
                .reduce((sum, m) => sum + getModFlatValue(m), 0)
            : 0;
        const thrownStyleFallback =
            isThrown && thrownModBonus === 0 ? featBonus(featMechanics, "damage.thrown", totalLevel, profBonus) : 0;

        // Great Weapon Fighting fallback (treat 1 or 2 on damage dice as 3 for two-handed melee weapons)
        const hasGwfMod = featMods("attacks.two_handed_damage_floor", "set").length > 0 ||
            ruleMods("attacks.two_handed_damage_floor", "set").length > 0;
        if (hasGwfMod && isTwoHanded && !isRanged && !props.some(p => p.includes("GWF"))) {
            props.push("GWF (min 3 on damage dice)");
        }

        // Two-Weapon Fighting fallback (add ability mod to off-hand attack damage)
        const hasTwfMod = featMods("damage.offhand_ability_mod", "bonus").length > 0 ||
            ruleMods("damage.offhand_ability_mod", "bonus").length > 0;
        if (hasTwfMod && props.some(p => p.toLowerCase().includes("light")) && !props.some(p => p.includes("TWF"))) {
            props.push("TWF (adds ability mod to off-hand damage)");
        }

        const globalDmgBonus = allMods
            .filter(m => {
                if (m.type !== "bonus" && m.type !== "stacking-bonus") return false;
                const sub = String(m.subType || "").toLowerCase();
                if (sub === "weapon-damage") return true;
                if (isRanged && sub === "ranged-weapon-damage") return true;
                return false;
            })
            .reduce((sum, m) => sum + resolveModValue(m), 0);

        // Custom weapon to-hit (typeId 12) and damage (typeId 10) overrides in characterValues
        const cvToHitBonus = characterValues
            .filter(
                (cv: any) =>
                    Number(cv.typeId) === 12 &&
                    (Number(cv.valueId) === Number(item.id) || Number(cv.valueId) === Number(def.id))
            )
            .reduce((sum: number, cv: any) => sum + (Number(cv.value) || 0), 0);
        const cvDamageBonus = characterValues
            .filter(
                (cv: any) =>
                    Number(cv.typeId) === 10 &&
                    (Number(cv.valueId) === Number(item.id) || Number(cv.valueId) === Number(def.id))
            )
            .reduce((sum: number, cv: any) => sum + (Number(cv.value) || 0), 0);

        const toHitModifier =
            atkAbilityMod +
            (isProficient ? profBonus : 0) +
            magicBonus +
            globalAtkBonus +
            archeryFallback +
            cvToHitBonus;

        const totalDmgMod =
            atkAbilityMod +
            magicBonus +
            duelingModBonus +
            duelingFallback +
            thrownModBonus +
            thrownStyleFallback +
            globalDmgBonus +
            cvDamageBonus;

        // Base damage die (upgraded by Monk Martial Arts die if applicable)
        let dmgDie = def.damage?.diceString || "1d4";
        if (isMonkWeapon && monkMartialArtsDie && dieAverageSize(monkMartialArtsDie) > dieAverageSize(dmgDie)) {
            dmgDie = monkMartialArtsDie;
        }

        const dmgType = def.damageType || "Piercing";
        const dmgModStr = totalDmgMod >= 0 ? `+ ${totalDmgMod}` : `- ${Math.abs(totalDmgMod)}`;

        // Extra elemental/magic damage dice on weapon (e.g. Flame Tongue + 2d6 Fire)
        const extraDmgParts = itemMods
            .filter(m => m.type === "damage" && (m.dice?.diceString || m.fixedValue || m.value))
            .map(m => {
                const dStr = m.dice?.diceString || `${getModFlatValue(m)}`;
                const dType = m.friendlySubtypeName || m.subType || "";
                return `${dStr}${dType ? ` ${dType}` : ""}`;
            });
        const extraDmgSuffix = extraDmgParts.length > 0 ? ` + ${extraDmgParts.join(" + ")}` : "";

        const damage = `${dmgDie} ${dmgModStr} ${dmgType}${extraDmgSuffix}`;
        return {
            props,
            isRanged,
            categoryId,
            toHitModifier,
            dmgDie,
            dmgType,
            damage
        };
    };

    // Weapon attacks in Actions tab
    equippedItems.forEach((item: any) => {
        const def = item.definition;
        if (def && def.filterType === "Weapon") {
            const wStats = computeWeaponStats(item, true);
            const hitStr =
                wStats.toHitModifier >= 0 ? `+${wStats.toHitModifier} to hit` : `${wStats.toHitModifier} to hit`;

            actions.push({
                name: def.name,
                type: "Action",
                rangeOrReach: def.range ? `${def.range} ft.` : "Reach 5 ft.",
                hitOrDc: hitStr,
                damageOrEffect: wStats.damage,
                notes: wStats.props.join(", ") || "Weapon"
            });
        }
    });

    // 10. Actions from Class, Species/Race, Feat, Item, and direct actions list
    const seenActionNames = new Set<string>(actions.map(a => a.name.toLowerCase()));

    if (Array.isArray(raw.actions)) {
        raw.actions.forEach((a: any) => {
            if (!a || !a.name) return;
            const nameLower = a.name.toLowerCase();
            if (seenActionNames.has(nameLower)) return;
            seenActionNames.add(nameLower);
            actions.push(a);
        });
    }

    const rawActionCategories: Array<{ list: any[]; defaultSource: string }> = [
        { list: raw.actions?.class || [], defaultSource: "Class Feature" },
        { list: raw.actions?.race || [], defaultSource: "Species Feature" },
        { list: raw.actions?.feat || [], defaultSource: "Feat" },
        { list: raw.actions?.item || [], defaultSource: "Item" }
    ];

    rawActionCategories.forEach(({ list, defaultSource }) => {
        list.forEach((a: any) => {
            if (!a || !a.name) return;
            const nameLower = a.name.toLowerCase();
            if (seenActionNames.has(nameLower)) return;
            seenActionNames.add(nameLower);

            const type: "Action" | "Bonus Action" | "Reaction" | "Special" =
                a.activation?.activationType === 3
                    ? "Bonus Action"
                    : a.activation?.activationType === 4
                        ? "Reaction"
                        : a.activation?.activationType === 1 || a.activation?.activationType === 8
                            ? "Action"
                            : "Action";
            const actionSource = (defaultSource === "Class Feature" && a.componentId && componentClassSourceMap.has(Number(a.componentId)))
                ? componentClassSourceMap.get(Number(a.componentId))!
                : defaultSource;

            actions.push({
                name: a.name,
                type,
                rangeOrReach: a.range?.rangeValue ? `${a.range.rangeValue} ft.` : "Special",
                hitOrDc: a.saveDcAbilityId ? `DC ${spellSaveDc}` : "Special",
                damageOrEffect: a.snippet || actionSource,
                notes: a.description || a.snippet || ""
            });
        });
    });

    // Class and subclass feature actions from the class rules (e.g. Cosmic Omen) that D&D Beyond didn't list
    for (const g of ruleActionGrants) {
        const key = String(g.name || "").toLowerCase();
        if (!key || seenActionNames.has(key)) continue;
        seenActionNames.add(key);
        actions.push({
            name: g.name,
            type: g.type,
            rangeOrReach: g.range || "Special",
            hitOrDc: "Special",
            damageOrEffect: g.effect || g.cost || "",
            notes: g.notes || ""
        });
    }

    // 11. Features & Invocations & Feats (already extracted with interactive decisions above)
    // 12. Equipment & Weapons
    const equipment: EquipmentItem[] = inventory.map((i: any) => {
        const def = i.definition;
        const requiresAttune = def?.canAttune === true || checkItemRequiresAttunement({
            name: def?.name,
            requiresAttunement: def?.canAttune === true,
            attuned: !!i.isAttuned,
            description: def?.description,
            notes: def?.snippet
        });
        const attuneKey = `attunement:${(def?.name || "").toLowerCase()}`;
        let isAttuned = !!i.isAttuned;
        if (stateOverrideMap.has(attuneKey)) {
            isAttuned = !!stateOverrideMap.get(attuneKey);
        }
        const defNameLower = String(def?.name || "").toLowerCase();
        const isPotion = defNameLower.includes("potion of") || defNameLower.includes("oil of") || defNameLower.startsWith("potion ") || defNameLower.startsWith("oil ");
        let rarity = isMundaneEquipment(def?.name) ? "Common" : (def?.rarity || "Common");
        if (isPotion) {
            if (defNameLower.includes("greater")) rarity = "Uncommon";
            else if (defNameLower.includes("superior")) rarity = "Rare";
            else if (defNameLower.includes("supreme")) rarity = "Very Rare";
        }
        return {
            ...itemSenseModifiers(def),
            id: i.id,
            definitionId: def?.id,
            name: def?.name || "Item",
            quantity: Number(i.quantity) || 1,
            equipped: !!i.equipped,
            attuned: isPotion ? false : isAttuned,
            requiresAttunement: isPotion ? false : requiresAttune,
            type: isPotion ? "Potion" : (def?.filterType || "Gear"),
            filterType: isPotion ? "Potion" : (def?.filterType || "Gear"),
            rarity,
            isMagic: isMundaneEquipment(def?.name) ? false : (isPotion ? true : !!def?.magic),
            description: def?.description || def?.snippet || undefined,
            imageUrl: def?.largeAvatarUrl || def?.avatarUrl || undefined,
            notes: def?.description || def?.snippet || undefined,
            charges: readItemCharges(i)
        };
    });

    // Weapon masteries set
    const masteredWeaponKeys = new Set<string>();
    allMods.forEach(m => {
        if (m.type === "weapon-mastery" && m.subType) {
            masteredWeaponKeys.add(m.subType.toLowerCase());
        }
    });

    // Parse weapons
    const rawWeapons = inventory.filter((i: any) => {
        if (i.definition?.filterType !== "Weapon") return false;
        const nameLower = (i.definition?.name || "").toLowerCase();
        if (nameLower.includes("potion of") || nameLower.includes("oil of") || nameLower.startsWith("potion ") || nameLower.startsWith("oil ")) {
            return false;
        }
        return true;
    });
    const aggregatedWeapons = new Map<string, { item: any; count: number; equipped: boolean }>();
    rawWeapons.forEach((w: any) => {
        const wName = w.definition.name;
        if (!aggregatedWeapons.has(wName)) {
            aggregatedWeapons.set(wName, { item: w, count: Number(w.quantity) || 1, equipped: !!w.equipped });
        } else {
            const entry = aggregatedWeapons.get(wName)!;
            entry.count += Number(w.quantity) || 1;
            if (w.equipped) entry.equipped = true;
        }
    });

    const weapons: WeaponItem[] = Array.from(aggregatedWeapons.values()).map(({ item, count, equipped }) => {
        const def = item.definition;
        const wStats = computeWeaponStats(item, equipped);
        const attackBonus = wStats.toHitModifier >= 0 ? `+${wStats.toHitModifier}` : `${wStats.toHitModifier}`;

        let rangeStr = "Reach 5 ft.";
        if (def.range) {
            rangeStr =
                def.longRange && def.longRange !== def.range ? `${def.range}/${def.longRange} ft.` : `${def.range} ft.`;
        }

        // Category label
        const categoryId = wStats.categoryId;
        let category = categoryId === 1 ? "Simple Weapon" : categoryId === 2 ? "Martial Weapon" : "Weapon";
        if (wStats.isRanged) category += " (Ranged)";
        else category += " (Melee)";

        // Weapon Mastery (2024 rules: Nick, Vex, Sap, Slow, Push, Topple, Cleave, Graze)
        const masteryProp = (def.properties || []).find((p: any) =>
            ["nick", "vex", "sap", "slow", "push", "topple", "cleave", "graze"].includes((p.name || "").toLowerCase())
        );

        let mastery: WeaponItem["mastery"] = undefined;
        if (masteryProp) {
            const mName = masteryProp.name;
            const wSlug = (def.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
            const wTypeLower = (def.type || def.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
            let hasMasteryUnlocked = Array.from(masteredWeaponKeys).some(
                k => k.includes(mName.toLowerCase()) && (k.includes(wSlug) || k.includes(wTypeLower))
            );
            const masteryOverrideKey = `weapon-mastery:${String(def.name || "").toLowerCase()}::${String(mName).toLowerCase()}`;
            if (stateOverrideMap.has(masteryOverrideKey)) {
                hasMasteryUnlocked = !!stateOverrideMap.get(masteryOverrideKey);
            }
            mastery = {
                name: mName,
                description: masteryProp.description
                    ? masteryProp.description.replace(/<[^>]*>/g, "").trim()
                    : undefined,
                unlocked: hasMasteryUnlocked
            };
        }

        const requiresAttune = def?.canAttune === true || checkItemRequiresAttunement({
            name: def?.name,
            requiresAttunement: def?.canAttune === true,
            attuned: !!item.isAttuned,
            description: def?.description,
            notes: def?.snippet
        });
        const attuneKey = `attunement:${(def?.name || "").toLowerCase()}`;
        let isAttuned = !!item.isAttuned;
        if (stateOverrideMap.has(attuneKey)) {
            isAttuned = !!stateOverrideMap.get(attuneKey);
        }

        return {
            ...itemSenseModifiers(def),
            charges: readItemCharges(item),
            id: item.id,
            definitionId: def.id,
            name: def.name,
            quantity: count,
            equipped,
            attuned: isAttuned,
            requiresAttunement: requiresAttune,
            category,
            damage: wStats.damage,
            damageType: wStats.dmgType,
            damageDie: wStats.dmgDie,
            attackBonus,
            toHitModifier: wStats.toHitModifier,
            range: rangeStr,
            properties: wStats.props,
            isMagic: isMundaneEquipment(def.name) ? false : !!def.magic,
            rarity: isMundaneEquipment(def.name) ? "Common" : (def.rarity || "Common"),
            description: def.description || def.snippet || undefined,
            imageUrl: def.largeAvatarUrl || def.avatarUrl || undefined,
            mastery,
            notes: def.description || def.snippet || undefined
        };
    });

    // 13. Spell slots from the class rules (each class's spellcasting, or its subclass's), multiclass table and Pact Magic
    const spellSlots: CharacterData["spellSlots"] = {};
    const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
    const computedSlots = computeSpellSlotsFromRules((raw.classes || []).map((c: any) => ({
        name: c.definition?.name || "",
        level: Number(c.level) || 0,
        subclass: c.subclassDefinition?.name || ""
    })));
    computedSlots.standard.forEach((total, idx) => {
        if (total > 0) {
            spellSlots[`level${idx + 1}`] = { total, level: idx + 1, label: `${ordinals[idx]} Level` };
        }
    });
    if (computedSlots.pact) {
        spellSlots.pact = {
            total: computedSlots.pact.count,
            level: computedSlots.pact.level,
            label: `Pact Magic (Lvl ${computedSlots.pact.level})`
        };
    }

    // 14. Class-Specific Resources across all classes
    const classResources: ClassResource[] = [];

    const getActionMaxUses = (actionName: string): number | undefined => {
        const actionCategories = Object.values(raw.actions || {});
        for (const list of actionCategories) {
            if (!Array.isArray(list)) continue;
            const match = list.find(
                (a: any) => a?.name?.toLowerCase() === actionName.toLowerCase() && a?.limitedUse?.maxUses != null
            );
            if (match && typeof match.limitedUse.maxUses === "number" && match.limitedUse.maxUses > 0) {
                return match.limitedUse.maxUses;
            }
        }
        return undefined;
    };

    // Class and subclass resources from the class rules, at each class's level; D&D Beyond's own count wins when the
    // character has an action of that name with limited uses
    for (const r of resolveClassResources(ruleClasses, (ab) => abilityModsById[ABILITY_IDS[ab]] ?? 0, profBonus)) {
        classResources.push({
            name: r.name,
            total: getActionMaxUses(r.name) ?? r.total,
            resetOn: r.resetOn,
            dieOrType: r.dieOrType
        });
    }

    // Species / Feat Resources (from actions with limitedUse or 2024 traits)
    const existingResourceNames = new Set(classResources.map(r => r.name.toLowerCase()));
    const addResourceIfMissing = (name: string, total: number, resetOn: "short" | "long", dieOrType?: string) => {
        const lower = name.toLowerCase();
        if (!existingResourceNames.has(lower) && total > 0) {
            existingResourceNames.add(lower);
            classResources.push({ name, total, resetOn, dieOrType });
        }
    };

    // Species and lineage limited uses (species data); D&D Beyond's own count wins when it lists the action
    const speciesAbilityMod = (ab: string) => abilityModsById[ABILITY_IDS[ab as AbilityName]] ?? 0;
    for (const r of resolveSpeciesResources(ruleSpecies, getRuleLineage(), totalLevel, profBonus, speciesAbilityMod)) {
        const ddbUses = [r.name, ...r.aliases].map(n => getActionMaxUses(n)).find(v => v != null);
        addResourceIfMissing(r.name, ddbUses ?? r.total, r.resetOn, r.dieOrType);
    }
    // Species uses D&D Beyond lists as limited-use actions, for species the rules don't match
    for (const sp of getSpeciesRules()) {
        for (const t of [...(sp.traits || []), ...(sp.lineages || []).flatMap(l => l.traits || [])]) {
            if (!t.resource) continue;
            const name = t.resource.name || traitBaseName(t.name);
            const uses = [name, traitBaseName(t.name), ...(t.aliases || [])].map(n => getActionMaxUses(n)).find(v => v != null);
            if (uses != null) addResourceIfMissing(name, uses, t.resource.resetOn);
        }
    }

    // Feat resources (e.g. Lucky's Luck Points); D&D Beyond's own count wins when it lists the action
    for (const r of resolveFeatResources(featMechanics, profBonus, totalLevel)) {
        const featName = featMechanics.find(f => (f.resource?.name || f.name) === r.name)?.name || r.name;
        addResourceIfMissing(r.name, getActionMaxUses(r.name) ?? getActionMaxUses(featName) ?? r.total, r.resetOn);
    }

    // Any other limited use D&D Beyond lists (e.g. Magical Cunning): maxUses, or uses from an ability modifier or the
    // Proficiency Bonus; resetType 1 = short rest, otherwise long. Skipped when already tracked under its own name or
    // the part after a colon ("Awakened Mind: Clairvoyant Combatant").
    for (const list of Object.values(raw.actions || {})) {
        for (const a of Array.isArray(list) ? list : []) {
            const lu = a?.limitedUse;
            if (!a?.name || !lu) continue;
            const total = Number(lu.maxUses) > 0
                ? Number(lu.maxUses)
                : lu.useProficiencyBonus
                    ? profBonus
                    : lu.statModifierUsesId
                        ? Math.max(1, abilityModsById[Number(lu.statModifierUsesId)] ?? 0)
                        : 0;
            const name = String(a.name);
            const afterColon = name.includes(":") ? name.split(":").slice(1).join(":").trim() : "";
            if (total <= 0 || existingResourceNames.has(name.toLowerCase()) || (afterColon && existingResourceNames.has(afterColon.toLowerCase()))) continue;
            addResourceIfMissing(name, total, Number(lu.resetType) === 1 ? "short" : "long");
        }
    }

    // Merge any resources already present in raw.classResources (e.g. from site character)
    if (Array.isArray(raw.classResources)) {
        raw.classResources.forEach((r: any) => {
            if (r?.name && !existingResourceNames.has(r.name.toLowerCase()) && Number(r.total) > 0) {
                existingResourceNames.add(r.name.toLowerCase());
                classResources.push(r);
            }
        });
    }

    const bardicCount = Math.max(1, chaMod);

    const characterId = raw.id || originalUrlOrId;
    const dndBeyondUrl = `https://www.dndbeyond.com/characters/${characterId}`;
    const avatarUrl = raw.decorations?.avatarUrl || "https://www.dndbeyond.com/avatars/10/92/636339382508535391.png";

    const classSubtitle = classes
        .map((c: any) => `${c.name} ${c.level}${c.subclass ? ` (${c.subclass})` : ""}`)
        .join(" / ");
    const subtitle = `${raw.race?.fullName || "Adventurer"} • ${classSubtitle} • Level ${totalLevel}`;

    const DND_CONDITION_ID_MAP: Record<number, string> = {
        1: "Blinded",
        2: "Charmed",
        3: "Deafened",
        4: "Exhaustion",
        5: "Frightened",
        6: "Grappled",
        7: "Incapacitated",
        8: "Invisible",
        9: "Paralyzed",
        10: "Petrified",
        11: "Poisoned",
        12: "Prone",
        13: "Restrained",
        14: "Stunned",
        15: "Unconscious"
    };

    const activeConditionsSet = new Set<string>();
    let exhaustionLevel = Math.max(0, Math.min(6, Number(raw.exhaustionLevel) || 0));

    if (Array.isArray(raw.conditions)) {
        raw.conditions.forEach((cond: any) => {
            const condId = Number(cond?.id);
            const condName = cond?.name || DND_CONDITION_ID_MAP[condId];
            if (condId === 4 || String(condName || "").toLowerCase() === "exhaustion") {
                const lvl = Math.max(1, Math.min(6, Number(cond?.level) || 1));
                exhaustionLevel = Math.max(exhaustionLevel, lvl);
                activeConditionsSet.add("Exhaustion");
            } else if (condName) {
                activeConditionsSet.add(String(condName));
            }
        });
    }
    if (exhaustionLevel > 0) {
        activeConditionsSet.add("Exhaustion");
    }
    const activeConditions = Array.from(activeConditionsSet);

    // Extract Species and Lineage / Heritage
    const rawRaceFullName = String(raw.race?.fullName || "").trim();
    const rawRaceBaseName = String(raw.race?.baseName || raw.race?.baseRaceName || raw.species || "").trim();
    let detectedSpecies = ruleSpecies?.name || rawRaceBaseName || rawRaceFullName || "Custom Species";
    let detectedLineage = String(raw.race?.subRaceShortName || raw.race?.subRaceName || raw.lineage || "").trim();

    if (!detectedLineage && Array.isArray(raw.options?.race)) {
        for (const opt of raw.options.race) {
            const optName = String(opt?.definition?.name || opt?.label || opt?.name || "").trim();
            if (optName) {
                detectedLineage = optName;
                break;
            }
        }
    }

    // The lineage the species data best fits (names, trait names, spells, resistances), without its "(...)" note
    if (!detectedLineage) {
        const lin = getRuleLineage();
        if (lin) detectedLineage = lin.name.replace(/\s*\(.*\)\s*$/, "");
    }

    const result: CharacterData = {
        id: characterId,
        source: "dndbeyond",
        name: raw.name || "Adventurer",
        subtitle,
        level: totalLevel,
        classes,
        race: raw.race?.fullName || "Custom Species",
        species: detectedSpecies,
        lineage: detectedLineage || undefined,
        background: raw.background?.definition?.name || "Custom Background",
        alignment: ALIGNMENT_NAMES[raw.alignmentId] || "Neutral",
        avatarUrl,
        dndBeyondUrl,
        activeConditions,
        exhaustionLevel,
        featureChoices: Object.keys(activeFeatureChoices).length > 0 ? { ...activeFeatureChoices } : undefined,
        vitals: {
            currentHp,
            maxHp: calculatedMaxHp,
            tempHp,
            armorClass,
            initiative,
            speed: fullSpeedDisplay,
            proficiencyBonus: profBonus,
            passivePerception,
            passiveInvestigation,
            passiveInsight,
            blindsight: blindsightSense,
            darkvision: darkvisionSense,
            tremorsense: tremorsenseSense,
            truesight: truesightSense,
            devilsSight: senseVitals.devilsSight,
            ...(senseVitals.otherSenses ? { otherSenses: senseVitals.otherSenses } : {}),
            hitDice: hitDiceStr,
            heroicInspiration: !!raw.inspiration,
            spellSaveDc,
            spellAttackBonus,
            spellcastingAbility: `${ABILITY_NAMES[spellcastingAbilityId]?.name || "Charisma"} (+${spellMod})`,
            savingThrowNotes,
            damageResistances,
            conditionImmunities
        },
        savingThrowNotes,
        saveEffects,
        baseSenses: ddbSenses,
        senseGrants,
        damageResistances,
        conditionImmunities,
        abilities,
        skills,
        spellSlots,
        classResources,
        bardicCount,
        actions,
        features,
        equipment,
        weapons,
        proficiencies: {
            armor: Array.from(
                new Set(
                    allMods
                        .filter(m => m.type === "proficiency" && m.subType?.includes("armor"))
                        .map(m => m.friendlySubtypeName || m.subType)
                )
            ),
            weapons: Array.from(
                new Set(
                    allMods
                        .filter(m => m.type === "proficiency" && m.subType?.includes("weapon"))
                        .map(m => m.friendlySubtypeName || m.subType)
                )
            ),
            tools: Array.from(
                new Set(
                    allMods
                        .filter(m => m.type === "proficiency" && m.subType?.includes("tool"))
                        .map(m => m.friendlySubtypeName || m.subType)
                )
            ),
            languages: Array.from(
                new Set(allMods.filter(m => m.type === "language").map(m => m.friendlySubtypeName || m.subType))
            )
        },
        spells: spellsList,
        duplicateSpells: duplicateSpells.length > 0 ? duplicateSpells : undefined
    };

    // Everything else D&D Beyond knows: details, notes, currency, campaign, companions, and the player's own
    // proficiencies, defenses, actions, and items
    result.details = readDetails(raw);
    // The species spells' ability: D&D Beyond's pick among the species data's options, else the first option
    {
        const lin = getRuleLineage();
        const options = speciesSpellAbilityOptions(ruleSpecies, lin, totalLevel);
        const picked = readSpeciesSpellAbility(raw, options);
        const ability = resolveSpeciesSpellAbility(ruleSpecies, lin, totalLevel, picked);
        if (ability) result.speciesSpellAbility = ability;
    }
    result.notes = readNotes(raw);
    result.currency = readCurrency(raw);
    result.campaign = readCampaign(raw);
    result.companions = readCompanions(raw);
    const customProfs = readCustomProficiencies(raw);
    (["armor", "weapons", "tools", "languages"] as const).forEach(list => {
        for (const name of customProfs[list] || []) {
            if (!result.proficiencies[list].includes(name)) result.proficiencies[list].push(name);
        }
    });
    const customDefenses = readCustomDefenses(raw);
    for (const r of customDefenses.resistances) if (!damageResistances.includes(r)) damageResistances.push(r);
    const defenseLabels = [
        ...customDefenses.immunities.map(n => `${n} (Immunity)`),
        ...customDefenses.vulnerabilities.map(n => `${n} (Vulnerability)`)
    ];
    if (defenseLabels.length > 0) result.proficiencies.defenses = [...(result.proficiencies.defenses || []), ...defenseLabels];
    for (const a of readCustomActions(raw)) {
        if (!result.actions.some(x => x.name.toLowerCase() === a.name.toLowerCase())) result.actions.push(a);
    }
    for (const item of readCustomItems(raw)) {
        if (!result.equipment.some(x => x.name.toLowerCase() === item.name.toLowerCase())) result.equipment.push(item);
    }

    // What the player has already used on D&D Beyond: slots, limited uses, death saves
    result.trackingState = readTrackingState(raw, spellSlots, classResources);
    result.trackingState.resourcePips = {
        ...result.trackingState.resourcePips,
        ...readItemChargePips([...result.equipment, ...(result.weapons || [])])
    };
    result.vitals.deathSaves = { ...result.trackingState.deathSaves! };

    applyGrantedWeapons(result);
    // Equipped items' senses (their D&D Beyond modifiers, else the item rules), on top of the base and other grants
    applyItemSensesToCharacter(result);
    return result;
}

/** A D&D Beyond item's sense modifiers (Goggles of Night: darkvision 60) as rules modifiers on the item, if any. */
function itemSenseModifiers(def: any): { modifiers?: StatModifier[] } {
    const modifiers: StatModifier[] = (Array.isArray(def?.grantedModifiers) ? def.grantedModifiers : [])
        .filter((m: any) => (m?.type === "sense" || m?.type === "set-base") && Number(m.value ?? m.fixedValue) > 0)
        .map((m: any) => ({
            target: `senses.${String(m.subType || "").toLowerCase()}`,
            type: "set" as const,
            value: Number(m.value ?? m.fixedValue),
            ...(m.friendlySubtypeName ? { label: String(m.friendlySubtypeName) } : {})
        }))
        .filter((m: StatModifier) => m.target !== "senses.");
    return modifiers.length > 0 ? { modifiers } : {};
}

/**
 * Standard and Pact Magic spell slots for a character's classes, from the class rules (each class's spellcasting or
 * its subclass's spellcastingOverride) and the multiclass spellcasting table.
 */
export function computeSpellSlotsFromRules(classes: Array<{ name: string; level: number; subclass?: string }>): {
    standard: number[];
    pact?: { count: number; level: number };
} {
    const inputs = classes
        .filter((c) => (Number(c.level) || 0) > 0)
        .map((c) => {
            const def = findClassRule(c.name || "");
            return { classId: def?.id || String(c.name || "").toLowerCase(), level: Number(c.level) || 1, subclassId: c.subclass || "" };
        });
    const result = calculateMulticlassSpellSlots(inputs, getClassRules());
    return {
        standard: result.standardSlots,
        pact: result.pactSlotCount > 0 ? { count: result.pactSlotCount, level: result.pactSlotLevel } : undefined
    };
}

const ABILITY_FULL_NAMES: Record<string, string> = {
    STR: "strength", DEX: "dexterity", CON: "constitution", INT: "intelligence", WIS: "wisdom", CHA: "charisma"
};

export function ensureBaseScoresOnCharacter(character: CharacterData, rawPayload?: any): void {
    if (!character || !Array.isArray(character.abilities)) return;

    const raw = rawPayload?.data || rawPayload;
    const statsArray = Array.isArray(raw?.stats) ? raw.stats : undefined;

    // Build known feature bonuses map from features list
    const featureBonuses: Record<string, number> = {
        STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0
    };

    if (Array.isArray(character.features)) {
        for (const feat of character.features) {
            const name = (feat.name || "").toLowerCase();
            const desc = (feat.description || "").toLowerCase();
            const text = `${name} ${desc}`;

            // A feat's +1 (feat data allowedStats): the ability the text names, else the highest of the allowed ones
            const featRule = findFeatRule(feat.name);
            const allowed = ((featRule as any)?.allowedStats || []).map((ab: string) => ab.toUpperCase());
            // A background's ability increases (background data allowedAbilities): +2 and +1 to the two highest
            const background = getBackgroundRules().find(bg => name.includes(bg.name.toLowerCase()) && text.includes("ability score"));
            const bgAllowed = (background?.allowedAbilities || []).map(ab => String(ab).toUpperCase());
            const byScore = (abbrs: string[]) => [...abbrs].sort((x, y) =>
                (character.abilities.find(a => a.abbr === y)?.score || 0) - (character.abilities.find(a => a.abbr === x)?.score || 0));
            if (featRule && allowed.length > 0) {
                const named = allowed.filter((abbr: string) => desc.includes(ABILITY_FULL_NAMES[abbr]));
                featureBonuses[named.length === 1 ? named[0] : byScore(allowed)[0]] += 1;
                continue;
            }
            if (background && bgAllowed.length >= 2) {
                const [first, second] = byScore(bgAllowed);
                featureBonuses[first] += 2;
                featureBonuses[second] += 1;
                continue;
            }

            // General regex matching: e.g. "Charisma score increases by 2", "+1 Charisma", "increase your Charisma score by 1"
            const statRegexes: Array<[string, RegExp]> = [
                ["STR", /(?:\+([1-4])\s+strength|strength\s+(?:score\s+)?(?:increases?|is\s+increased)\s+by\s+([1-4])|increase\s+(?:your\s+)?strength\s+(?:score\s+)?by\s+([1-4])|increase\s+[^.\n\r]*by\s+([1-4])[^.\n\r]*\(?\s*strength)/i],
                ["DEX", /(?:\+([1-4])\s+dexterity|dexterity\s+(?:score\s+)?(?:increases?|is\s+increased)\s+by\s+([1-4])|increase\s+(?:your\s+)?dexterity\s+(?:score\s+)?by\s+([1-4])|increase\s+[^.\n\r]*by\s+([1-4])[^.\n\r]*\(?\s*dexterity)/i],
                ["CON", /(?:\+([1-4])\s+constitution|constitution\s+(?:score\s+)?(?:increases?|is\s+increased)\s+by\s+([1-4])|increase\s+(?:your\s+)?constitution\s+(?:score\s+)?by\s+([1-4])|increase\s+[^.\n\r]*by\s+([1-4])[^.\n\r]*\(?\s*constitution)/i],
                ["INT", /(?:\+([1-4])\s+intelligence|intelligence\s+(?:score\s+)?(?:increases?|is\s+increased)\s+by\s+([1-4])|increase\s+(?:your\s+)?intelligence\s+(?:score\s+)?by\s+([1-4])|increase\s+[^.\n\r]*by\s+([1-4])[^.\n\r]*\(?\s*intelligence)/i],
                ["WIS", /(?:\+([1-4])\s+wisdom|wisdom\s+(?:score\s+)?(?:increases?|is\s+increased)\s+by\s+([1-4])|increase\s+(?:your\s+)?wisdom\s+(?:score\s+)?by\s+([1-4])|increase\s+[^.\n\r]*by\s+([1-4])[^.\n\r]*\(?\s*wisdom)/i],
                ["CHA", /(?:\+([1-4])\s+charisma|charisma\s+(?:score\s+)?(?:increases?|is\s+increased)\s+by\s+([1-4])|increase\s+(?:your\s+)?charisma\s+(?:score\s+)?by\s+([1-4])|increase\s+[^.\n\r]*by\s+([1-4])[^.\n\r]*\(?\s*charisma)/i]
            ];

            for (const [abbr, regex] of statRegexes) {
                const match = regex.exec(text);
                if (match) {
                    const val = Number(match[1] || match[2] || match[3] || match[4]) || 0;
                    featureBonuses[abbr] += val;
                }
            }
        }
    }

    character.abilities.forEach((ability, idx) => {
        const statId = idx + 1; // 1=STR, 2=DEX, 3=CON, 4=INT, 5=WIS, 6=CHA
        const abbr = ability.abbr;

        if (statsArray) {
            const rawStat = statsArray.find((s: any) => s.id === statId);
            if (rawStat && typeof rawStat.value === "number") {
                ability.baseScore = rawStat.value;
                ability.bonus = ability.score - rawStat.value;
                return;
            }
        }

        // If baseScore and bonus are already both valid numbers, keep them
        if (typeof ability.baseScore === "number" && typeof ability.bonus === "number") {
            return;
        }

        if (typeof ability.baseScore === "number" && typeof ability.bonus !== "number") {
            ability.bonus = ability.score - ability.baseScore;
            return;
        }

        if (typeof ability.bonus === "number" && typeof ability.baseScore !== "number") {
            ability.baseScore = ability.score - ability.bonus;
            return;
        }

        // Infer from known features if possible
        const inferredBonus = featureBonuses[abbr] || 0;
        if (inferredBonus > 0 && ability.score - inferredBonus >= 1) {
            ability.baseScore = ability.score - inferredBonus;
            ability.bonus = inferredBonus;
        } else {
            ability.baseScore = ability.score;
            ability.bonus = 0;
        }
    });

    if (!rawPayload) {
        applyMagicalItemBonuses(character);
    }
}

export function applyLockedFieldsToRefreshedCharacter(
    target: CharacterData,
    sourceWithLocks: CharacterData
): void {
    if (!target || !sourceWithLocks?.lockedFields) return;
    const locks = sourceWithLocks.lockedFields;
    target.lockedFields = { ...locks };

    if (locks["name"] && sourceWithLocks.name) {
        target.name = sourceWithLocks.name;
    }
    if (locks["race"] && sourceWithLocks.race) {
        target.race = sourceWithLocks.race;
        target.species = sourceWithLocks.species;
        target.lineage = sourceWithLocks.lineage;
    }
    if (locks["avatarUrl"] && sourceWithLocks.avatarUrl !== undefined) {
        target.avatarUrl = sourceWithLocks.avatarUrl;
    }
    // Identity details and notes, field by field ("details.age", "notes.backstory"; gender is "details.gender")
    for (const section of ["details", "notes"] as const) {
        for (const key of Object.keys(locks).filter((k) => locks[k] && k.startsWith(`${section}.`))) {
            const field = key.slice(section.length + 1);
            const value = (sourceWithLocks[section] as Record<string, unknown> | undefined)?.[field];
            const next = { ...((target[section] as Record<string, unknown> | undefined) || {}) };
            if (value === undefined || value === "") delete next[field];
            else next[field] = value;
            (target as any)[section] = next;
        }
    }
    if (locks["spells"] && Array.isArray(sourceWithLocks.spells)) {
        target.spells = JSON.parse(JSON.stringify(sourceWithLocks.spells));
    }
    if (locks["equipment"]) {
        if (Array.isArray(sourceWithLocks.weapons)) target.weapons = JSON.parse(JSON.stringify(sourceWithLocks.weapons));
        if (Array.isArray(sourceWithLocks.equipment)) target.equipment = JSON.parse(JSON.stringify(sourceWithLocks.equipment));
        if (typeof sourceWithLocks.vitals?.armorClass === "number") target.vitals.armorClass = sourceWithLocks.vitals.armorClass;
    }
    if (locks["feats"] && Array.isArray(sourceWithLocks.features)) {
        const feats = sourceWithLocks.features.filter((f) => f.type === "Feat");
        target.features = [...(target.features || []).filter((f) => f.type !== "Feat"), ...JSON.parse(JSON.stringify(feats))];
    }
    if (locks["skills"] && Array.isArray(sourceWithLocks.skills)) {
        target.skills?.forEach((s) => {
            const src = sourceWithLocks.skills.find((x) => x.name === s.name);
            if (src) s.proficiency = src.proficiency;
        });
    }
    if (locks["background"] && sourceWithLocks.background) {
        target.background = sourceWithLocks.background;
    }
    if (locks["alignment"] && sourceWithLocks.alignment) {
        target.alignment = sourceWithLocks.alignment;
    }
    if (locks["classes"] && Array.isArray(sourceWithLocks.classes) && sourceWithLocks.classes.length > 0) {
        target.classes = JSON.parse(JSON.stringify(sourceWithLocks.classes));
        target.level = sourceWithLocks.level || target.classes.reduce((sum, c) => sum + (c.level || 0), 0) || 1;
        target.subtitle = sourceWithLocks.subtitle || `${target.classes.map(c => `${c.name} ${c.level}`).join(" / ")} • Level ${target.level}`;
        const newPb = Math.floor((target.level - 1) / 4) + 2;
        target.vitals.proficiencyBonus = newPb;
    }
    if (locks["vitals.maxHp"] && typeof sourceWithLocks.vitals?.maxHp === "number") {
        target.vitals.maxHp = sourceWithLocks.vitals.maxHp;
    }

    const abilityKeys = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    let anyAbilityLocked = false;
    abilityKeys.forEach((abbr, idx) => {
        const lockKey = `abilities.${abbr}`;
        if (locks[lockKey] || locks[`abilities.${idx}`]) {
            anyAbilityLocked = true;
            const srcAbility = sourceWithLocks.abilities?.[idx] || sourceWithLocks.abilities?.find(a => a.abbr === abbr);
            const tgtAbility = target.abilities?.[idx] || target.abilities?.find(a => a.abbr === abbr);
            if (srcAbility && tgtAbility) {
                if (typeof srcAbility.baseScore === "number") {
                    tgtAbility.baseScore = srcAbility.baseScore;
                    tgtAbility.score = tgtAbility.baseScore + (tgtAbility.bonus || 0);
                    tgtAbility.modifier = Math.floor((tgtAbility.score - 10) / 2);
                    tgtAbility.save = tgtAbility.modifier + (tgtAbility.proficientSave ? target.vitals.proficiencyBonus : 0);
                }
            }
        }
    });

    if (anyAbilityLocked || locks["classes"] || locks["skills"]) {
        target.skills?.forEach(s => {
            const ab = target.abilities.find(a => a.abbr === s.stat);
            const mod = ab ? ab.modifier : 0;
            const pb = target.vitals.proficiencyBonus;
            if (s.proficiency === "expertise") s.bonus = mod + pb * 2;
            else if (s.proficiency === "proficient") s.bonus = mod + pb;
            else s.bonus = mod;
        });

        if (target.vitals?.spellcastingAbility) {
            const spellAb = target.abilities.find(
                a => a.name.toLowerCase() === target.vitals.spellcastingAbility.toLowerCase() ||
                    a.abbr.toLowerCase() === target.vitals.spellcastingAbility.toLowerCase()
            );
            if (spellAb) {
                target.vitals.spellSaveDc = 8 + target.vitals.proficiencyBonus + spellAb.modifier;
                target.vitals.spellAttackBonus = target.vitals.proficiencyBonus + spellAb.modifier;
            }
        }

        if (locks["abilities.DEX"] || locks["abilities.1"]) {
            const dexAb = target.abilities.find(a => a.abbr === "DEX");
            if (dexAb) {
                target.vitals.initiative = dexAb.modifier;
            }
        }
    }
}

export function ensureClassResourcesOnCharacter(character: CharacterData, raw?: any): void {
    if (!character) return;
    if (!Array.isArray(character.classResources)) {
        character.classResources = [];
    }

    // Auto-heal missing or truncated spellSlots based on character.classes and the class rules
    if (Array.isArray(character.classes) && character.classes.length > 0) {
        const getOrd = (n: number) => (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");
        const computed = computeSpellSlotsFromRules(character.classes);
        if (!character.spellSlots || typeof character.spellSlots !== "object") {
            character.spellSlots = {};
        }
        computed.standard.forEach((total, idx) => {
            if (total <= 0) return;
            const slotLvl = idx + 1;
            const key = `level${slotLvl}`;
            const existing = character.spellSlots[key];
            if (!existing || typeof existing.total !== "number" || existing.total < total) {
                character.spellSlots[key] = { total, label: `${slotLvl}${getOrd(slotLvl)} Level` };
            }
        });
        if (computed.pact) {
            const pact = computed.pact;
            const existingPact = character.spellSlots.pact;
            if (!existingPact || existingPact.total < pact.count || existingPact.level !== pact.level) {
                character.spellSlots.pact = {
                    level: pact.level,
                    total: pact.count,
                    label: `Pact Magic (${pact.level}${getOrd(pact.level)} Level)`
                };
            }
        }
    }

    // Auto-heal class and subclass resources (class rules data): add missing ones and raise totals that are too low.
    // D&D Beyond's own count wins when the character has an action of that name with limited uses.
    const rawActionUses = (name: string): number | undefined => {
        for (const list of Object.values(raw?.actions || {})) {
            if (!Array.isArray(list)) continue;
            const match = list.find((a: any) => a?.name?.toLowerCase() === name.toLowerCase() && a?.limitedUse?.maxUses != null);
            if (match && typeof match.limitedUse.maxUses === "number" && match.limitedUse.maxUses > 0) return match.limitedUse.maxUses;
        }
        return undefined;
    };
    const slugName = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const abilityMod = (ab: string) => character.abilities?.find((a) => a.abbr.toLowerCase() === ab)?.modifier ?? 0;
    const expected = resolveClassResources(
        (character.classes || []).map((c) => {
            const def = findClassRule(c.name || "");
            const subName = slugName((c as any).subclassDefinition?.name || c.subclass || "");
            const subclass = subName ? def?.subclasses?.find((s) => slugName(s.name) === subName || s.id === subName || subName.includes(slugName(s.name))) : undefined;
            return { def, subclass, level: Number(c.level) || 1 };
        }),
        abilityMod,
        character.vitals?.proficiencyBonus || 2
    );
    for (const r of expected) {
        const total = rawActionUses(r.name) ?? r.total;
        const existing = character.classResources.find((x) => x?.name?.toLowerCase() === r.name.toLowerCase());
        if (existing) {
            if (existing.total < total) existing.total = total;
        } else {
            character.classResources.push({ name: r.name, total, resetOn: r.resetOn, dieOrType: r.dieOrType });
        }
    }

    // Auto-heal species resources if missing
    if (!character.classResources) {
        character.classResources = [];
    }
    const pb = character.vitals?.proficiencyBonus || 2;
    const existingResNames = new Set(character.classResources.map(r => r.name.toLowerCase()));
    const addIfMissing = (name: string, total: number, resetOn: "short" | "long", dieOrType?: string) => {
        if (!existingResNames.has(name.toLowerCase()) && total > 0) {
            existingResNames.add(name.toLowerCase());
            character.classResources!.push({ name, total, resetOn, dieOrType });
        }
    };

    // The species and lineage in the species rules, and their limited uses at the character's level
    const species = findSpeciesRule(String(character.species || character.race || ""));
    const lineage = detectLineage(species, { texts: [character.lineage || "", character.race || ""] });
    for (const r of resolveSpeciesResources(species, lineage, character.level || 1, pb, abilityMod)) {
        addIfMissing(r.name, r.total, r.resetOn, r.dieOrType);
    }
}

export function ensureSavingThrowNotesOnCharacter(character: CharacterData, raw?: any): void {
    if (!character) return;
    if (!Array.isArray(character.savingThrowNotes)) {
        character.savingThrowNotes = [];
    }
    if (character.vitals && !Array.isArray(character.vitals.savingThrowNotes)) {
        character.vitals.savingThrowNotes = character.savingThrowNotes;
    }
    if (!Array.isArray(character.damageResistances)) {
        character.damageResistances = character.vitals?.damageResistances || [];
    }
    if (character.vitals && !Array.isArray(character.vitals.damageResistances)) {
        character.vitals.damageResistances = character.damageResistances;
    }
    if (!Array.isArray(character.conditionImmunities)) {
        character.conditionImmunities = character.vitals?.conditionImmunities || [];
    }
    if (character.vitals && !Array.isArray(character.vitals.conditionImmunities)) {
        character.vitals.conditionImmunities = character.conditionImmunities;
    }

    // Characters saved before save effects: read the effects out of the card and row sentences, keep other notes
    if (!Array.isArray(character.saveEffects) && Array.isArray(character.abilities)) {
        const { effects, otherNotes } = effectsFromLegacyNotes(character.abilities, character.savingThrowNotes);
        character.saveEffects = effects;
        character.savingThrowNotes = otherNotes;
        character.abilities.forEach(a => { delete a.notes; });
    }

    // Check if abilities have repeated saving throw notes from older saved payloads
    if (Array.isArray(character.abilities)) {
        const counts = new Map<string, number>();
        character.abilities.forEach(a => {
            if (a.notes) {
                counts.set(a.notes, (counts.get(a.notes) || 0) + 1);
            }
        });

        counts.forEach((count, note) => {
            if (count >= 2 || note.toLowerCase().includes("charmed") || note.toLowerCase().includes("saving throw") || note.toLowerCase().includes("saves")) {
                if (!character.savingThrowNotes!.includes(note)) {
                    character.savingThrowNotes!.push(note);
                }
                character.abilities.forEach(a => {
                    if (a.notes === note) {
                        delete a.notes;
                    }
                });
            }
        });
    }

    if (character.vitals) {
        character.vitals.savingThrowNotes = character.savingThrowNotes;
    }
}
