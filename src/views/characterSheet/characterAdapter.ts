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
import { extractFeaturesAndApplyDecisions } from "./featureDecisions";

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
    equipStateOverrides?: Array<{ scope: "item" | "weapon" | "weapon-mastery"; itemName: string; equipped: boolean }>,
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
        let equipped = !!item.equipped;
        if (isWeapon && stateOverrideMap.has(weaponKey)) {
            equipped = !!stateOverrideMap.get(weaponKey);
        } else if (stateOverrideMap.has(itemKey)) {
            equipped = !!stateOverrideMap.get(itemKey);
        }
        return { ...item, equipped };
    });

    const characterValues: any[] = Array.isArray(raw.characterValues) ? raw.characterValues : [];

    // 1. Calculate Total Level & Classes
    const classes = (raw.classes || []).map((c: any) => ({
        name: c.definition?.name || "Adventurer",
        level: Number(c.level) || 1,
        subclass: c.subclassDefinition?.name || undefined
    }));
    const totalLevel = classes.reduce((sum: number, c: any) => sum + c.level, 0) || 1;

    // Build map of componentId -> class level for class-specific scaling modifiers (e.g. Draconic Resilience)
    const componentClassLevelMap = new Map<number, number>();
    (raw.classes || []).forEach((c: any) => {
        const cLvl = Number(c.level) || 1;
        if (c.definition?.id) componentClassLevelMap.set(Number(c.definition.id), cLvl);
        if (c.subclassDefinition?.id) componentClassLevelMap.set(Number(c.subclassDefinition.id), cLvl);
        (c.definition?.classFeatures || []).forEach((cf: any) => {
            if (cf?.id) componentClassLevelMap.set(Number(cf.id), cLvl);
        });
        (c.subclassDefinition?.classFeatures || []).forEach((cf: any) => {
            if (cf?.id) componentClassLevelMap.set(Number(cf.id), cLvl);
        });
        (c.classFeatures || []).forEach((cf: any) => {
            const id = cf?.definition?.id ?? cf?.id;
            if (id) componentClassLevelMap.set(Number(id), cLvl);
        });
    });

    // Helper: check if an inventory item's modifiers should be active
    const isInventoryItemActive = (item: any): boolean => {
        const def = item.definition;
        const canEquip = def?.canEquip !== false; // default true unless explicitly false
        const isEquipped = canEquip ? !!item.equipped : true;
        if (!isEquipped) return false;
        const requiresAttunement = def?.canAttune === true;
        if (requiresAttunement && item.isAttuned === false) return false;
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
    for (let id = 1; id <= 6; id++) {
        const base = statsArray.find((s: any) => s.id === id)?.value ?? 10;
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

    // Class levels & features lookup helpers
    const getClassLevel = (className: string): number => {
        const match = (raw.classes || []).find(
            (c: any) => (c.definition?.name || "").toLowerCase() === className.toLowerCase()
        );
        return match ? Number(match.level) || 0 : 0;
    };
    const hasSubclass = (className: string, subKeyword: string): boolean => {
        return (raw.classes || []).some(
            (c: any) =>
                (c.definition?.name || "").toLowerCase() === className.toLowerCase() &&
                (c.subclassDefinition?.name || "").toLowerCase().includes(subKeyword.toLowerCase())
        );
    };
    const hasFeat = (featKeyword: string): boolean => {
        return (raw.feats || []).some((f: any) =>
            (f.definition?.name || "").toLowerCase().includes(featKeyword.toLowerCase())
        );
    };
    const hasClassFeatureOrOption = (featureKeyword: string): boolean => {
        const kw = featureKeyword.toLowerCase();
        if (extractedFeaturesResult.hasFightingStyleDecision) {
            if (kw === "archery") return extractedFeaturesResult.activeFightingStyleValues.has("fighting-style:archery");
            if (kw === "defense") return extractedFeaturesResult.activeFightingStyleValues.has("fighting-style:defense");
            if (kw === "dueling") return extractedFeaturesResult.activeFightingStyleValues.has("fighting-style:dueling");
            if (kw === "thrown weapon fighting") return extractedFeaturesResult.activeFightingStyleValues.has("fighting-style:thrown");
        }
        if (extractedFeaturesResult.hasPactBoonDecision && kw === "pact of the blade") {
            return extractedFeaturesResult.activePactBoonValue === "pact-boon:blade";
        }
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

    const monkLevel = getClassLevel("monk");
    const paladinLevel = getClassLevel("paladin");
    const bardLevel = getClassLevel("bard");

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

    // Monk Level 14+ Diamond Soul grants proficiency in all saving throws
    if (monkLevel >= 14) {
        Object.values(ABILITY_NAMES).forEach(a => proficientSaveKeys.add(a.key));
    }

    // Global unrestricted saving throw bonuses (e.g. Ring/Cloak of Protection, Stone of Good Luck, Staff of Power, Paladin Aura of Protection)
    const globalSaveBonusMods = allMods.filter(
        m => (m.type === "bonus" || m.type === "stacking-bonus") && m.subType === "saving-throws" && isUnrestrictedMod(m)
    );
    let globalSaveBonus = globalSaveBonusMods.reduce((sum, m) => sum + resolveModValue(m), 0);

    // Paladin Level 6+ Aura of Protection fallback if not already emitted as a statId=6 saving-throws modifier
    const hasAuraMod = globalSaveBonusMods.some(m => Number(m.statId) === 6);
    if (!hasAuraMod && (paladinLevel >= 6 || hasClassFeatureOrOption("Aura of Protection"))) {
        globalSaveBonus += Math.max(1, chaMod);
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

        const saveNotes: string[] = [];
        if (
            meta.abbr === "CON" &&
            (allMods.some(
                m =>
                    m.friendlySubtypeName?.toLowerCase().includes("concentration") ||
                    m.subType?.toLowerCase().includes("concentration")
            ) ||
                hasFeat("War Caster") ||
                hasClassFeatureOrOption("Eldritch Mind"))
        ) {
            saveNotes.push("Advantage on Concentration");
        }

        const advSaveMods = allMods.filter(
            m =>
                m.type === "advantage" &&
                (m.subType === `${meta.key}-saving-throws` || m.subType === "saving-throws")
        );
        advSaveMods.forEach(m => {
            const rest = String(m.restriction || "").trim();
            const label = rest ? `Advantage (${rest})` : "Advantage on saves";
            if (!saveNotes.includes(label)) saveNotes.push(label);
        });

        abilities.push({
            name: meta.name,
            abbr: meta.abbr,
            score,
            modifier,
            save,
            proficientSave: isProf,
            notes: saveNotes.length > 0 ? saveNotes.join("; ") : undefined
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

    // Fallbacks if simplified payloads include Tough feat or Draconic Sorcerer without raw modifier entries
    if (hpPerLevelMods.length === 0) {
        if (hasFeat("Tough")) {
            hpPerLevelBonus += 2 * totalLevel;
        }
        const sorcererLvl = getClassLevel("sorcerer");
        if (sorcererLvl > 0 && hasSubclass("sorcerer", "draconic")) {
            hpPerLevelBonus += 1 * sorcererLvl;
        }
    }

    const flatHpBonus = allMods
        .filter(
            m =>
                (m.type === "bonus" || m.type === "stacking-bonus") &&
                (m.subType === "hit-points" || m.subType === "maximum-hit-points")
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
        // Monk Unarmored Defense (statId 5 from class) requires no shield
        if (m._sourceKey === "class" && Number(m.statId) === 5 && monkLevel > 0) {
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
            // Medium Armor (base max +2, or +3 with Medium Armor Master)
            addDexToAc = true;
            maxDexBonus = hasFeat("Medium Armor Master") ? 3 : 2;
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

        // Fallback if Defense Fighting Style is present in options/features without an explicit armored-armor-class modifier
        const hasDefenseMod = allMods.some(m => m.subType === "armored-armor-class");
        const defenseStyleBonus = !hasDefenseMod && hasClassFeatureOrOption("Defense") ? 1 : 0;

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

        // 2) Intrinsic class Unarmored Defense formulas (ensures Monk, Barbarian, Draconic Sorcerer, Dance Bard work even if modifiers array is minimal)
        if (monkLevel > 0 && !hasShield) {
            candidates.push({ ac: 10 + unarmoredDex + wisMod, statIdUsed: 5 });
        }
        if (getClassLevel("barbarian") > 0) {
            candidates.push({ ac: 10 + unarmoredDex + conMod, statIdUsed: 3 });
        }
        if (getClassLevel("sorcerer") > 0 && hasSubclass("sorcerer", "draconic")) {
            candidates.push({ ac: 13 + unarmoredDex });
        }
        if (bardLevel >= 3 && hasSubclass("bard", "dance") && !hasShield) {
            candidates.push({ ac: 10 + unarmoredDex + chaMod, statIdUsed: 6 });
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
            if (isArmored && m._sourceKey === "class" && monkLevel > 0) continue;
            unarmoredMoveBonus += resolveModValue(m);
        }
        // Class fallback if unarmored-movement modifier wasn't explicitly listed in raw.modifiers
        if (unarmoredMoveMods.length === 0) {
            if (!isArmored && !hasShield && monkLevel >= 2) {
                unarmoredMoveBonus +=
                    monkLevel >= 18 ? 30 : monkLevel >= 14 ? 25 : monkLevel >= 10 ? 20 : monkLevel >= 6 ? 15 : 10;
            }
            if (!isWearingHeavyArmor && getClassLevel("barbarian") >= 5) {
                unarmoredMoveBonus += 10;
            }
        }
    }

    walkSpeed += speedBonus + unarmoredMoveBonus;

    // Custom walking speed override from customSpeeds (movementId 1 = Walk)
    if (Array.isArray(raw.customSpeeds)) {
        const customWalk = raw.customSpeeds.find((s: any) => Number(s.movementId) === 1 && Number(s.distance) > 0);
        if (customWalk) {
            walkSpeed = Number(customWalk.distance);
        }
    }

    // Detect Devil's Sight (Eldritch Invocation / magical darkness sight)
    const devilsSightMod = allMods.find(
        m =>
            (m.type === "sense" || m.type === "set-base") &&
            String(m.subType || "").toLowerCase().includes("darkvision") &&
            String(m.restriction || "").toLowerCase().includes("magical")
    );
    const hasDevilsSightFeature =
        !!devilsSightMod ||
        (raw.options?.class || []).some((o: any) => /devil[’']s sight/i.test(o.definition?.name || "")) ||
        allMods.some(m => /devil[’']s sight/i.test(m.friendlySubtypeName || ""));
    const devilsSightSense = hasDevilsSightFeature
        ? Number(devilsSightMod?.value ?? devilsSightMod?.fixedValue) > 0
            ? `${Number(devilsSightMod?.value ?? devilsSightMod?.fixedValue)} ft.`
            : "120 ft."
        : undefined;

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
        const senseMatches = allMods.filter(
            m =>
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

        // 3. Racial traits fallback (e.g. Tiefling, Elf, Dwarf, etc.)
        if (senseName === "darkvision" && raw.race?.racialTraits) {
            const darkvisionTrait = raw.race.racialTraits.find((rt: any) =>
                /darkvision/i.test(rt.definition?.name || "")
            );
            if (darkvisionTrait) {
                const text = `${darkvisionTrait.definition?.snippet || ""} ${darkvisionTrait.definition?.description || ""}`;
                if (text.includes("120")) return "120 ft.";
                return "60 ft.";
            }
        }

        return fallback;
    };
    const darkvisionSense = getSenseRange("darkvision");
    const blindsightSense = getSenseRange("blindsight");
    const tremorsenseSense = getSenseRange("tremorsense");
    const truesightSense = getSenseRange("truesight");

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

    // Subclass Initiative fallbacks if not already represented in raw.modifiers
    if (!initBonusMods.some(m => m.subType === "initiative")) {
        if (getClassLevel("rogue") >= 3 && hasSubclass("rogue", "swashbuckler")) {
            initiativeBonus += chaMod;
        }
        if (getClassLevel("ranger") >= 3 && hasSubclass("ranger", "gloom stalker")) {
            initiativeBonus += wisMod;
        }
        if (getClassLevel("wizard") >= 2 && (hasSubclass("wizard", "war magic") || hasSubclass("wizard", "chronurgy"))) {
            initiativeBonus += intMod;
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

    function addSpell(s: any, sourceName: string) {
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

        const spellDef: SpellDefinition = {
            id: def.id,
            name: def.name,
            level: Number(def.level) || 0,
            school,
            source: sourceName,
            castingTime,
            range: rangeStr,
            duration: durationStr,
            components: componentsStr,
            concentration: !!def.concentration,
            ritual: !!def.ritual,
            description: def.description || def.snippet || "<p>No description provided.</p>",
            imageUrl: def.avatarUrl || def.largeAvatarUrl || undefined
        };

        spellsMap.set(def.name.toLowerCase(), spellDef);
    }

    if (raw.classSpells) {
        raw.classSpells.forEach((cs: any) => {
            const classObj = raw.classes?.find((c: any) => c.id === cs.characterClassId);
            const className = classObj?.definition?.name || "Class";
            (cs.spells || []).forEach((s: any) => addSpell(s, className));
        });
    }

    ["race", "class", "background", "item", "feat"].forEach(key => {
        (raw.spells?.[key] || []).forEach((s: any) => {
            const source = key.charAt(0).toUpperCase() + key.slice(1);
            addSpell(s, source);
        });
    });

    const spellsList = Array.from(spellsMap.values()).sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    // Check if character has Agonizing Blast invocation
    const hasAgonizingBlast = hasClassFeatureOrOption("Agonizing Blast");

    // 10. Actions & Attacks
    const actions: ActionItem[] = [];

    // Cantrip attack actions (like Eldritch Blast, Fire Bolt, etc.)
    spellsList.forEach(spell => {
        if (spell.level === 0) {
            let hitOrDc = `+${spellAttackBonus} to hit`;
            if (spell.description.includes("saving throw")) {
                hitOrDc = `DC ${spellSaveDc} Save`;
            }
            let damageOrEffect = "Spell Effect";
            if (spell.name.toLowerCase() === "eldritch blast" && hasAgonizingBlast) {
                const modSign = chaMod >= 0 ? `+ ${chaMod}` : `- ${Math.abs(chaMod)}`;
                damageOrEffect = `1d10 ${modSign} Force`;
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
        hasClassFeatureOrOption("Hex Warrior") ||
        hasSubclass("warlock", "hexblade");
    const hasBattleReadyOrArmorer =
        hasClassFeatureOrOption("Battle Ready") ||
        hasSubclass("artificer", "battle smith") ||
        hasSubclass("artificer", "armorer");
    const monkMartialArtsDie =
        monkLevel >= 17 ? "1d12" : monkLevel >= 11 ? "1d10" : monkLevel >= 5 ? "1d8" : monkLevel >= 1 ? "1d6" : "";

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
            monkLevel > 0 &&
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
        const archeryFallback = isRanged && !hasArcheryMod && hasClassFeatureOrOption("Archery") ? 2 : 0;

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
            qualifiesForDueling && duelingModBonus === 0 && hasClassFeatureOrOption("Dueling") ? 2 : 0;

        // Thrown Weapon Fighting bonus
        const thrownModBonus = isThrown
            ? allMods
                  .filter(m => (m.type === "bonus" || m.type === "damage") && m.subType === "thrown-weapon-damage")
                  .reduce((sum, m) => sum + getModFlatValue(m), 0)
            : 0;
        const thrownStyleFallback =
            isThrown && thrownModBonus === 0 && hasClassFeatureOrOption("Thrown Weapon Fighting") ? 2 : 0;

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

    // Class specific actions
    const classActions = raw.actions?.class || [];
    classActions.forEach((a: any) => {
        const type: "Action" | "Bonus Action" | "Reaction" | "Special" =
            a.activation?.activationType === 3
                ? "Bonus Action"
                : a.activation?.activationType === 4
                  ? "Reaction"
                  : "Action";
        actions.push({
            name: a.name,
            type,
            rangeOrReach: a.range?.rangeValue ? `${a.range.rangeValue} ft.` : "Special",
            hitOrDc: a.saveDcAbilityId ? `DC ${spellSaveDc}` : "Special",
            damageOrEffect: a.snippet || "Class Feature",
            notes: a.description || a.snippet || ""
        });
    });

    // 11. Features & Invocations & Feats (already extracted with interactive decisions above)
    // 12. Equipment & Weapons
    const equipment: EquipmentItem[] = inventory.map((i: any) => {
        const def = i.definition;
        return {
            id: i.id,
            definitionId: def?.id,
            name: def?.name || "Item",
            quantity: Number(i.quantity) || 1,
            equipped: !!i.equipped,
            attuned: !!i.isAttuned,
            type: def?.filterType || "Gear",
            filterType: def?.filterType || "Gear",
            rarity: def?.rarity || "Common",
            isMagic: !!def?.magic,
            description: def?.description || def?.snippet || undefined,
            imageUrl: def?.largeAvatarUrl || def?.avatarUrl || undefined,
            notes: def?.snippet || def?.description ? def.snippet || "" : undefined
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
    const rawWeapons = inventory.filter((i: any) => i.definition?.filterType === "Weapon");
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

        return {
            id: item.id,
            definitionId: def.id,
            name: def.name,
            quantity: count,
            equipped,
            category,
            damage: wStats.damage,
            damageType: wStats.dmgType,
            damageDie: wStats.dmgDie,
            attackBonus,
            toHitModifier: wStats.toHitModifier,
            range: rangeStr,
            properties: wStats.props,
            isMagic: !!def.magic,
            rarity: def.rarity || "Common",
            description: def.description || def.snippet || undefined,
            imageUrl: def.largeAvatarUrl || def.avatarUrl || undefined,
            mastery,
            notes: def.snippet || def.description ? def.snippet : undefined
        };
    });

    // 13. Dynamic Spell Slots calculation across all classes (Levels 1-20, Full/Half/Third/Pact)
    const FULL_CASTER_SLOTS: Record<number, number[]> = {
        1: [2],
        2: [3],
        3: [4, 2],
        4: [4, 3],
        5: [4, 3, 2],
        6: [4, 3, 3],
        7: [4, 3, 3, 1],
        8: [4, 3, 3, 2],
        9: [4, 3, 3, 3, 1],
        10: [4, 3, 3, 3, 2],
        11: [4, 3, 3, 3, 2, 1],
        12: [4, 3, 3, 3, 2, 1],
        13: [4, 3, 3, 3, 2, 1, 1],
        14: [4, 3, 3, 3, 2, 1, 1],
        15: [4, 3, 3, 3, 2, 1, 1, 1],
        16: [4, 3, 3, 3, 2, 1, 1, 1],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
        18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
        19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
        20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    };

    const PACT_MAGIC_SLOTS: Record<number, { count: number; level: number }> = {
        1: { count: 1, level: 1 },
        2: { count: 2, level: 1 },
        3: { count: 2, level: 2 },
        4: { count: 2, level: 2 },
        5: { count: 2, level: 3 },
        6: { count: 2, level: 3 },
        7: { count: 2, level: 4 },
        8: { count: 2, level: 4 },
        9: { count: 2, level: 5 },
        10: { count: 2, level: 5 },
        11: { count: 3, level: 5 },
        12: { count: 3, level: 5 },
        13: { count: 3, level: 5 },
        14: { count: 3, level: 5 },
        15: { count: 3, level: 5 },
        16: { count: 3, level: 5 },
        17: { count: 4, level: 5 },
        18: { count: 4, level: 5 },
        19: { count: 4, level: 5 },
        20: { count: 4, level: 5 }
    };

    let effectiveCasterLevel = 0;
    let warlockLevel = 0;

    (raw.classes || []).forEach((c: any) => {
        const cName = (c.definition?.name || "").toLowerCase();
        const subName = (c.subclassDefinition?.name || "").toLowerCase();
        const lvl = Number(c.level) || 0;

        if (cName === "warlock") {
            warlockLevel += lvl;
        } else if (["bard", "cleric", "druid", "sorcerer", "wizard"].includes(cName)) {
            effectiveCasterLevel += lvl;
        } else if (["paladin", "ranger"].includes(cName)) {
            effectiveCasterLevel += Math.floor(lvl / 2);
        } else if (cName === "artificer") {
            effectiveCasterLevel += Math.ceil(lvl / 2);
        } else if (subName.includes("eldritch knight") || subName.includes("arcane trickster")) {
            effectiveCasterLevel += Math.floor(lvl / 3);
        }
    });

    const spellSlots: CharacterData["spellSlots"] = {};

    // Standard Spellcasting Slots
    if (effectiveCasterLevel > 0) {
        const boundedLvl = Math.min(20, Math.max(1, effectiveCasterLevel));
        const slotCounts = FULL_CASTER_SLOTS[boundedLvl] || [];
        const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
        slotCounts.forEach((total, idx) => {
            if (total > 0) {
                const lvlNum = idx + 1;
                spellSlots[`level${lvlNum}`] = {
                    total,
                    level: lvlNum,
                    label: `${ordinals[idx]} Level`
                };
            }
        });
    }

    // Warlock Pact Magic Slots
    if (warlockLevel > 0) {
        const boundedWarlock = Math.min(20, Math.max(1, warlockLevel));
        const pact = PACT_MAGIC_SLOTS[boundedWarlock] || { count: 2, level: 3 };
        spellSlots.pact = {
            total: pact.count,
            level: pact.level,
            label: `Pact Magic (Lvl ${pact.level})`
        };
    }

    // 14. Class-Specific Resources across all classes
    const classResources: ClassResource[] = [];

    // Check Barbarian Rage
    const barb = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "barbarian");
    if (barb) {
        const bLvl = barb.level || 1;
        const rages = bLvl >= 20 ? 99 : bLvl >= 17 ? 6 : bLvl >= 12 ? 5 : bLvl >= 6 ? 4 : bLvl >= 3 ? 3 : 2;
        classResources.push({
            name: "Rage",
            total: rages,
            resetOn: "long",
            dieOrType: bLvl >= 20 ? "Unlimited" : undefined
        });
    }

    // Check Bard Inspiration
    const bard = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "bard");
    if (bard) {
        const bLvl = bard.level || 1;
        const die = bLvl >= 15 ? "d12" : bLvl >= 10 ? "d10" : bLvl >= 5 ? "d8" : "d6";
        classResources.push({
            name: `Bardic Inspiration (${die})`,
            total: Math.max(1, chaMod),
            resetOn: bLvl >= 5 ? "short" : "long",
            dieOrType: die,
            key: "bardic"
        });
    }

    // Check Cleric / Paladin Channel Divinity
    const cleric = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "cleric");
    const paladin = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "paladin");
    if (cleric) {
        const cLvl = cleric.level || 1;
        const uses = cLvl >= 18 ? 3 : cLvl >= 6 ? 2 : 1;
        classResources.push({
            name: "Channel Divinity",
            total: uses,
            resetOn: "short"
        });
    } else if (paladin && paladin.level >= 3) {
        classResources.push({
            name: "Channel Divinity",
            total: paladin.level >= 11 ? 2 : 1,
            resetOn: "short"
        });
    }

    // Check Druid Wild Shape
    const druid = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "druid");
    if (druid && druid.level >= 2) {
        classResources.push({
            name: "Wild Shape",
            total: druid.level >= 20 ? 99 : 2,
            resetOn: "short"
        });
    }

    // Check Fighter Action Surge & Second Wind
    const fighter = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "fighter");
    if (fighter) {
        const fLvl = fighter.level || 1;
        classResources.push({
            name: "Second Wind",
            total: 1,
            resetOn: "short",
            dieOrType: `1d10+${fLvl}`
        });
        if (fLvl >= 2) {
            classResources.push({
                name: "Action Surge",
                total: fLvl >= 17 ? 2 : 1,
                resetOn: "short"
            });
        }
        if (fLvl >= 9) {
            classResources.push({
                name: "Indomitable",
                total: fLvl >= 17 ? 3 : fLvl >= 13 ? 2 : 1,
                resetOn: "long"
            });
        }
    }

    // Check Monk Ki / Focus Points
    const monk = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "monk");
    if (monk && monk.level >= 2) {
        classResources.push({
            name: "Ki / Focus Points",
            total: monk.level,
            resetOn: "short"
        });
    }

    // Check Paladin Lay on Hands
    if (paladin) {
        classResources.push({
            name: "Lay on Hands (Pool)",
            total: paladin.level * 5,
            resetOn: "long"
        });
    }

    // Check Sorcerer Sorcery Points
    const sorcerer = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "sorcerer");
    if (sorcerer && sorcerer.level >= 2) {
        classResources.push({
            name: "Sorcery Points",
            total: sorcerer.level,
            resetOn: "long"
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

    return {
        id: characterId,
        name: raw.name || "Adventurer",
        subtitle,
        level: totalLevel,
        classes,
        race: raw.race?.fullName || "Custom Species",
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
            speed: `${walkSpeed} ft.`,
            proficiencyBonus: profBonus,
            passivePerception,
            passiveInvestigation,
            passiveInsight,
            blindsight: blindsightSense,
            darkvision: darkvisionSense,
            tremorsense: tremorsenseSense,
            truesight: truesightSense,
            devilsSight: devilsSightSense,
            hitDice: hitDiceStr,
            heroicInspiration: !!raw.inspiration,
            spellSaveDc,
            spellAttackBonus,
            spellcastingAbility: `${ABILITY_NAMES[spellcastingAbilityId]?.name || "Charisma"} (+${spellMod})`
        },
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
        spells: spellsList
    };
}
