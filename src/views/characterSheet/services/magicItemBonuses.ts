import { AbilityScore, CharacterData, EquipmentItem, WeaponItem } from "../characterData";

export interface MagicBonusExtraction {
    statOverrides: Partial<Record<string, number>>;
    statBonuses: Partial<Record<string, number>>;
    acBonus: number;
    globalSaveBonus: number;
    specificSaveBonuses: Partial<Record<string, number>>;
    spellDcBonus: number;
    spellAtkBonus: number;
    globalCheckBonus: number;
    speedBonusFt: number;
    speedMultiplier: number;
    initiativeBonus: number;
}

export const MUNDANE_WEAPON_NAMES = new Set([
    "club", "dagger", "greatclub", "handaxe", "javelin", "light hammer", "mace", "quarterstaff", "sickle", "spear",
    "light crossbow", "dart", "shortbow", "sling",
    "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", "lance", "longsword", "maul", "morningstar",
    "pike", "rapier", "scimitar", "shortsword", "trident", "war pick", "warhammer", "whip",
    "blowgun", "heavy crossbow", "hand crossbow", "longbow", "net"
]);

export const MUNDANE_ARMOR_NAMES = new Set([
    "padded armor", "padded", "leather armor", "leather", "studded leather armor", "studded leather",
    "hide armor", "hide", "chain shirt", "scale mail", "breastplate", "half plate armor", "half plate",
    "ring mail", "chain mail", "splint armor", "splint", "plate armor", "plate", "shield"
]);

export const MUNDANE_EQUIPMENT_NAMES = new Set([
    ...MUNDANE_WEAPON_NAMES,
    ...MUNDANE_ARMOR_NAMES,
    "backpack", "bedroll", "bell", "blanket", "block and tackle", "book", "bottle, glass", "bucket", "caltrops",
    "candle", "case, crossbow bolt", "case, map or scroll", "chain", "chalk", "chest", "climber's kit",
    "clothes, common", "clothes, costume", "clothes, fine", "clothes, traveler's", "component pouch", "crowbar",
    "druidic focus", "emblem", "flask or tankard", "grappling hook", "hammer", "hammer, sledge", "healer's kit",
    "holy symbol", "holy water", "hourglass", "hunting trap", "ink", "ink pen", "jug or pitcher", "ladder",
    "lantern, bullseye", "lantern, hooded", "lock", "magnifying glass", "manacles", "mess kit", "mirror, steel",
    "oil", "paper", "parchment", "perfume", "pick, miner's", "piton", "poison, basic", "pole", "pot, iron",
    "pouch", "quiver", "ram, portable", "rations", "robes", "rope, hempen", "rope, silk", "sack", "scale, merchant's",
    "sealing wax", "shovel", "signal whistle", "signet ring", "soap", "spellbook", "spikes, iron", "spyglass",
    "tent, two-person", "tinderbox", "torch", "vial", "waterskin", "whetstone", "lyre", "lute", "flute", "drum",
    "horn", "pan flute", "shawm", "viol", "bagpipes", "dulcimer"
]);

/**
 * Accurately determines if an item is standard non-magical/mundane equipment.
 */
export function isMundaneEquipment(name?: string): boolean {
    if (!name) return false;
    const clean = name.trim().toLowerCase();
    // If it has +1, +2, +3 or plus bonus, it's magical
    if (/(?:\+|\bplus\s*)[1-3]\b|\b[1-3]\s*\+/i.test(clean)) return false;
    // Known magical qualifiers
    if (/\b(of|flame tongue|frost brand|vicious|sun blade|moonblade|vorpal|luck blade|dragon slayer|giant slayer|defender)\b/i.test(clean)) {
        return false;
    }
    // Check base name without quantity/parenthetical remarks like "(Melee/Ranged)" or "×2"
    const baseClean = clean.replace(/\s*\([^)]*\)/g, "").replace(/\s*[×x]\d+/g, "").trim();
    return MUNDANE_EQUIPMENT_NAMES.has(baseClean) || MUNDANE_WEAPON_NAMES.has(baseClean) || MUNDANE_ARMOR_NAMES.has(baseClean);
}

const STAT_ABBRS: Record<string, string> = {
    strength: "STR",
    dexterity: "DEX",
    constitution: "CON",
    intelligence: "INT",
    wisdom: "WIS",
    charisma: "CHA",
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA"
};

/**
 * Extracts inherent magical plus bonus (+1, +2, +3) from an item's name or text.
 */
export function extractPlusBonus(name: string, description?: string): number {
    const combined = `${name || ""} ${description || ""}`;

    // Specific named weapon bonuses
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("holy avenger")) return 3;
    if (lowerName.includes("sun blade")) return 2;
    if (lowerName.includes("staff of power") || lowerName.includes("staff of the magi")) return 2;

    // Matches "+1", "+2", "+3", ", +1", "+ 1", "plus 1", etc.
    const nameMatch = name.match(/(?:\+|\bplus\s*)([1-3])\b|\b([1-3])\s*\+/i);
    if (nameMatch) {
        return Number(nameMatch[1] || nameMatch[2]) || 0;
    }

    const descMatch = (description || "").match(/(?:\+|\bplus\s*)([1-3])\s+bonus\s+to\s+(?:attack\s+and\s+damage\s+rolls|attack\s+rolls|AC|Armor Class)/i);
    if (descMatch) {
        return Number(descMatch[1]) || 0;
    }

    return 0;
}

/**
 * Analyzes an equipped item or weapon and returns any magical bonuses it confers.
 */
export function extractItemMagicBonuses(
    item: { name: string; type?: string; filterType?: string; description?: string; notes?: string; isMagic?: boolean },
    isShieldEquipped: boolean,
    isBodyArmorEquipped: boolean
): MagicBonusExtraction {
    const result: MagicBonusExtraction = {
        statOverrides: {},
        statBonuses: {},
        acBonus: 0,
        globalSaveBonus: 0,
        specificSaveBonuses: {},
        spellDcBonus: 0,
        spellAtkBonus: 0,
        globalCheckBonus: 0,
        speedBonusFt: 0,
        speedMultiplier: 1,
        initiativeBonus: 0
    };

    const name = (item.name || "").trim();
    const lowerName = name.toLowerCase();
    const desc = `${item.description || ""} ${item.notes || ""}`;
    const lowerDesc = desc.toLowerCase();
    const plusVal = extractPlusBonus(name, desc);

    // --- 1. STAT OVERRIDES (Belt of Giant Strength, Gauntlets of Ogre Power, Headband of Intellect, Amulet of Health) ---
    if (lowerName.includes("gauntlets of ogre power") || lowerDesc.includes("strength score is 19")) {
        result.statOverrides.STR = 19;
    }
    if (lowerName.includes("belt of") && lowerName.includes("giant strength")) {
        if (lowerName.includes("storm")) result.statOverrides.STR = 29;
        else if (lowerName.includes("cloud")) result.statOverrides.STR = 27;
        else if (lowerName.includes("fire")) result.statOverrides.STR = 25;
        else if (lowerName.includes("frost") || lowerName.includes("stone")) result.statOverrides.STR = 23;
        else result.statOverrides.STR = 21; // Hill or unspecified
    } else if (lowerDesc.includes("belt of") && lowerDesc.includes("giant strength")) {
        if (lowerDesc.includes("storm")) result.statOverrides.STR = 29;
        else if (lowerDesc.includes("cloud")) result.statOverrides.STR = 27;
        else if (lowerDesc.includes("fire")) result.statOverrides.STR = 25;
        else if (lowerDesc.includes("frost") || lowerDesc.includes("stone")) result.statOverrides.STR = 23;
        else result.statOverrides.STR = 21;
    }

    if (lowerName.includes("headband of intellect") || lowerDesc.includes("intelligence score is 19")) {
        result.statOverrides.INT = 19;
    }

    if (lowerName.includes("amulet of health") || lowerDesc.includes("constitution score is 19")) {
        result.statOverrides.CON = 19;
    }

    // Generic set score regex: e.g. "Your Strength score is 21 while you wear"
    const scoreIsRegex = /your\s+(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+score\s+is\s+(\d+)/gi;
    let mScore: RegExpExecArray | null;
    while ((mScore = scoreIsRegex.exec(lowerDesc)) !== null) {
        const statKey = STAT_ABBRS[mScore[1].toLowerCase()];
        const val = Number(mScore[2]);
        if (statKey && val > 0) {
            result.statOverrides[statKey] = Math.max(result.statOverrides[statKey] || 0, val);
        }
    }

    // --- 2. STAT FLAT BONUSES (Tomes, Manuals, Ioun Stones, Hammer of Thunderbolts) ---
    if (lowerName.includes("manual of gainful exercise")) result.statBonuses.STR = 2;
    if (lowerName.includes("manual of quickness of action")) result.statBonuses.DEX = 2;
    if (lowerName.includes("manual of bodily health")) result.statBonuses.CON = 2;
    if (lowerName.includes("tome of clear thought")) result.statBonuses.INT = 2;
    if (lowerName.includes("tome of understanding")) result.statBonuses.WIS = 2;
    if (lowerName.includes("tome of leadership and influence")) result.statBonuses.CHA = 2;

    if (lowerName.includes("ioun stone of strength")) result.statBonuses.STR = 2;
    if (lowerName.includes("ioun stone of agility")) result.statBonuses.DEX = 2;
    if (lowerName.includes("ioun stone of fortitude")) result.statBonuses.CON = 2;
    if (lowerName.includes("ioun stone of intellect")) result.statBonuses.INT = 2;
    if (lowerName.includes("ioun stone of insight")) result.statBonuses.WIS = 2;
    if (lowerName.includes("ioun stone of leadership")) result.statBonuses.CHA = 2;

    if (lowerName.includes("hammer of thunderbolts")) result.statBonuses.STR = 4;

    const statIncRegex = /(?:increases? your|your)\s+(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+score\s+(?:increases?\s+)?by\s+(\d+)/gi;
    let mInc: RegExpExecArray | null;
    while ((mInc = statIncRegex.exec(lowerDesc)) !== null) {
        const statKey = STAT_ABBRS[mInc[1].toLowerCase()];
        const val = Number(mInc[2]);
        if (statKey && val > 0) {
            result.statBonuses[statKey] = (result.statBonuses[statKey] || 0) + val;
        }
    }

    // --- 3. ARMOR CLASS (AC) BONUSES ---
    const isShield = lowerName.includes("shield") || (item.filterType || "").toLowerCase() === "shield";
    const isArmor = (item.filterType || "").toLowerCase() === "armor" && !isShield;

    if (isShield && plusVal > 0) {
        result.acBonus += plusVal;
    } else if (isArmor && plusVal > 0) {
        result.acBonus += plusVal;
    } else if (lowerName.includes("cloak of protection")) {
        result.acBonus += 1;
    } else if (lowerName.includes("ring of protection")) {
        result.acBonus += 1;
    } else if (lowerName.includes("staff of power")) {
        result.acBonus += 2;
    } else if (lowerName.includes("ioun stone of protection")) {
        result.acBonus += 1;
    } else if (lowerName.includes("defender")) {
        result.acBonus += 3;
    } else if (lowerName.includes("bracers of defense")) {
        // Bracers of Defense only apply if not wearing armor and not using a shield
        if (!isBodyArmorEquipped && !isShieldEquipped) {
            result.acBonus += 2;
        }
    } else if (!isShield && !isArmor) {
        const acBonusMatch = desc.match(/(?:\+|\bplus\s*)([1-3])\s+bonus\s+to\s+(?:your\s+)?(?:AC|Armor Class)\b/i);
        if (acBonusMatch) {
            result.acBonus += Number(acBonusMatch[1]) || 0;
        }
    }

    // --- 4. SAVING THROW BONUSES ---
    if (lowerName.includes("cloak of protection")) {
        result.globalSaveBonus += 1;
    } else if (lowerName.includes("ring of protection")) {
        result.globalSaveBonus += 1;
    } else if (lowerName.includes("stone of good luck") || lowerName.includes("luckstone")) {
        result.globalSaveBonus += 1;
        result.globalCheckBonus += 1;
    } else if (lowerName.includes("staff of power")) {
        result.globalSaveBonus += 2;
    } else {
        const saveBonusMatch = desc.match(/(?:\+|\bplus\s*)([1-3])\s+bonus\s+to\s+(?:all\s+)?saving throws\b/i);
        if (saveBonusMatch) {
            result.globalSaveBonus += Number(saveBonusMatch[1]) || 0;
        }
    }

    // --- 5. SPELL ATTACK & SPELL SAVE DC BONUSES ---
    const isSpellFocusItem =
        lowerName.includes("rod of the pact keeper") ||
        lowerName.includes("amulet of the devout") ||
        lowerName.includes("bloodwell vial") ||
        lowerName.includes("moon sickle") ||
        lowerName.includes("all-purpose tool") ||
        lowerName.includes("rhythm-maker's drum") ||
        lowerName.includes("wand of the war mage") ||
        lowerName.includes("robe of the archmagi");

    if (isSpellFocusItem) {
        const bonus = plusVal > 0 ? plusVal : (lowerName.includes("robe of the archmagi") ? 2 : 1);
        result.spellAtkBonus += bonus;
        if (!lowerName.includes("wand of the war mage")) {
            result.spellDcBonus += bonus;
        }
    } else if (lowerName.includes("staff of power") || lowerName.includes("staff of the magi")) {
        result.spellAtkBonus += 2;
        result.spellDcBonus += 2;
    } else {
        const spellAtkMatch = desc.match(/(?:\+|\bplus\s*)([1-3])\s+bonus\s+to\s+(?:your\s+)?spell attack rolls\b/i);
        if (spellAtkMatch) {
            result.spellAtkBonus += Number(spellAtkMatch[1]) || 0;
        }
        const spellDcMatch = desc.match(/(?:\+|\bplus\s*)([1-3])\s+bonus\s+to\s+(?:the\s+)?saving throw DCs of your spells\b/i);
        if (spellDcMatch) {
            result.spellDcBonus += Number(spellDcMatch[1]) || 0;
        }
    }

    // --- 6. SPEED & INITIATIVE ---
    if (lowerName.includes("boots of speed")) {
        result.speedMultiplier = 2;
    }
    if (lowerName.includes("boots of striding and springing")) {
        result.speedBonusFt = Math.max(result.speedBonusFt, 0);
    }
    if (lowerName.includes("weapon of warning") || lowerName.includes("sentinel shield")) {
        result.initiativeBonus += 2; // Represent advantage on initiative as +2 effective bonus
    }

    return result;
}

/**
 * Recalculates and applies all magical item and weapon bonuses to a CharacterData object.
 * This updates ability scores, modifiers, saving throws, armor class, spell save DC,
 * spell attack bonus, skill bonuses, passive senses, and weapon attack/damage bonuses.
 */
export function applyMagicalItemBonuses(character: CharacterData): CharacterData {
    if (!character || !Array.isArray(character.abilities)) return character;

    const equippedItems = (character.equipment || []).filter(e => e.equipped !== false);
    const equippedWeapons = (character.weapons || []).filter(w => w.equipped !== false);

    const isShieldEquipped = equippedItems.some(i => (i.name || "").toLowerCase().includes("shield") || (i.type || "").toLowerCase() === "shield");
    const isBodyArmorEquipped = equippedItems.some(i => {
        const type = (i.type || i.filterType || "").toLowerCase();
        const name = (i.name || "").toLowerCase();
        return (type === "armor" || name.includes("armor") || name.includes("mail") || name.includes("plate") || name.includes("leather")) && !name.includes("shield");
    });

    // Aggregate bonuses from all active items without double-counting mirrored items
    const aggregated: MagicBonusExtraction = {
        statOverrides: {},
        statBonuses: {},
        acBonus: 0,
        globalSaveBonus: 0,
        specificSaveBonuses: {},
        spellDcBonus: 0,
        spellAtkBonus: 0,
        globalCheckBonus: 0,
        speedBonusFt: 0,
        speedMultiplier: 1,
        initiativeBonus: 0
    };

    const seenItemKeys = new Set<string>();
    const processItem = (item: any) => {
        const key = (item.name || "").trim().toLowerCase();
        if (!key || seenItemKeys.has(key)) return;
        seenItemKeys.add(key);

        const extracted = extractItemMagicBonuses(item, isShieldEquipped, isBodyArmorEquipped);

        // Merge stat overrides (highest override wins)
        Object.keys(extracted.statOverrides).forEach(stat => {
            const val = extracted.statOverrides[stat]!;
            aggregated.statOverrides[stat] = Math.max(aggregated.statOverrides[stat] || 0, val);
        });

        // Merge stat flat bonuses
        Object.keys(extracted.statBonuses).forEach(stat => {
            const val = extracted.statBonuses[stat]!;
            aggregated.statBonuses[stat] = (aggregated.statBonuses[stat] || 0) + val;
        });

        aggregated.acBonus += extracted.acBonus;
        aggregated.globalSaveBonus += extracted.globalSaveBonus;
        aggregated.spellDcBonus = Math.max(aggregated.spellDcBonus, extracted.spellDcBonus);
        aggregated.spellAtkBonus = Math.max(aggregated.spellAtkBonus, extracted.spellAtkBonus);
        aggregated.globalCheckBonus += extracted.globalCheckBonus;
        aggregated.speedBonusFt += extracted.speedBonusFt;
        aggregated.speedMultiplier = Math.max(aggregated.speedMultiplier, extracted.speedMultiplier);
        aggregated.initiativeBonus += extracted.initiativeBonus;
    };

    equippedItems.forEach(processItem);
    equippedWeapons.forEach(processItem);

    const profBonus = character.vitals?.proficiencyBonus || Math.floor(((character.level || 1) - 1) / 4) + 2;

    // --- 1. RECALCULATE ABILITY SCORES ---
    character.abilities.forEach(ability => {
        const abbr = ability.abbr;
        // Natural score is baseScore + natural bonus (from racial, leveling, feats)
        const naturalBase = typeof ability.baseScore === "number" ? ability.baseScore : (ability.score - (ability.bonus || 0));
        const naturalBonus = typeof ability.bonus === "number" ? ability.bonus : 0;
        const naturalTotal = naturalBase + naturalBonus;

        const magicFlat = aggregated.statBonuses[abbr] || 0;
        let score = naturalTotal + magicFlat;

        // Apply stat override if override is higher than the natural score
        const override = aggregated.statOverrides[abbr];
        if (override && override > score) {
            score = override;
        }

        ability.baseScore = naturalBase;
        ability.bonus = naturalBonus;
        ability.score = score;
        ability.modifier = Math.floor((score - 10) / 2);

        // Saving throw: modifier + (proficient ? profBonus : 0) + globalSaveBonus
        const profPart = ability.proficientSave ? profBonus : 0;
        ability.save = ability.modifier + profPart + aggregated.globalSaveBonus;
    });

    const abilityMods: Record<string, number> = {};
    character.abilities.forEach(a => {
        abilityMods[a.abbr] = a.modifier;
    });

    const strMod = abilityMods.STR ?? 0;
    const dexMod = abilityMods.DEX ?? 0;
    const conMod = abilityMods.CON ?? 0;
    const intMod = abilityMods.INT ?? 0;
    const wisMod = abilityMods.WIS ?? 0;
    const chaMod = abilityMods.CHA ?? 0;

    // --- 2. RECALCULATE SKILLS ---
    if (Array.isArray(character.skills)) {
        character.skills.forEach(skill => {
            const statMod = abilityMods[skill.stat] ?? 0;
            let b = statMod;
            if (skill.proficiency === "expertise") {
                b += profBonus * 2;
            } else if (skill.proficiency === "proficient") {
                b += profBonus;
            }
            skill.bonus = b + aggregated.globalCheckBonus;
        });
    }

    // --- 3. RECALCULATE VITALS ---
    if (character.vitals) {
        // Base AC without magic item accessories:
        // If character.vitals.armorClass was previously computed, apply the net magic acBonus
        // If natural AC is tracked, start from natural AC:
        if ((character.vitals as any)._naturalArmorClass === undefined) {
            (character.vitals as any)._naturalArmorClass = character.vitals.armorClass;
        }
        const naturalAc = (character.vitals as any)._naturalArmorClass || 10;
        character.vitals.armorClass = naturalAc + aggregated.acBonus;

        // Initiative: DEX modifier + initiative bonuses
        character.vitals.initiative = dexMod + aggregated.initiativeBonus;

        // Spell Save DC & Attack Bonus
        const spellAbilityAbbr = character.vitals.spellcastingAbility
            ? character.vitals.spellcastingAbility.slice(0, 3).toUpperCase()
            : "CHA";
        const spellMod = abilityMods[spellAbilityAbbr] ?? chaMod;

        character.vitals.spellSaveDc = 8 + profBonus + spellMod + aggregated.spellDcBonus;
        character.vitals.spellAttackBonus = profBonus + spellMod + aggregated.spellAtkBonus;
        character.vitals.spellcastingAbility = `${STAT_ABBRS[spellAbilityAbbr.toLowerCase()] || spellAbilityAbbr} (${spellMod >= 0 ? `+${spellMod}` : spellMod})`;

        // Passive Senses
        const getSkillBonus = (skillName: string): number => {
            const s = character.skills?.find(sk => sk.name.toLowerCase() === skillName.toLowerCase());
            return s ? s.bonus : 0;
        };
        character.vitals.passivePerception = 10 + getSkillBonus("Perception");
        character.vitals.passiveInvestigation = 10 + getSkillBonus("Investigation");
        character.vitals.passiveInsight = 10 + getSkillBonus("Insight");

        // Speed
        const baseSpeedNum = parseInt(character.vitals.speed, 10) || 30;
        const adjustedSpeed = (baseSpeedNum + aggregated.speedBonusFt) * aggregated.speedMultiplier;
        character.vitals.speed = `${adjustedSpeed} ft.`;
    }

    // --- 4. RECALCULATE WEAPONS (Attack Bonus and Damage with Magic Bonuses) ---
    if (Array.isArray(character.weapons)) {
        character.weapons.forEach(weapon => {
            const wName = weapon.name || "";
            const wDesc = weapon.description || weapon.notes || "";
            const isMundane = isMundaneEquipment(wName);
            const magicPlus = isMundane ? 0 : extractPlusBonus(wName, wDesc);
            if (magicPlus > 0) {
                weapon.isMagic = true;
            } else if (isMundane) {
                weapon.isMagic = false;
                weapon.rarity = "Common";
            }

            const props = Array.isArray(weapon.properties) ? weapon.properties : [];
            const isFinesse = props.some(p => p.toLowerCase().includes("finesse"));
            const isRanged = props.some(p => p.toLowerCase().includes("ranged") || p.toLowerCase().includes("ammunition"));
            const isThrown = props.some(p => p.toLowerCase().includes("thrown"));

            let chosenMod = strMod;
            if (isRanged) {
                chosenMod = dexMod;
            } else if (isFinesse) {
                chosenMod = Math.max(strMod, dexMod);
            } else if (isThrown) {
                chosenMod = Math.max(strMod, dexMod);
            }

            const toHit = chosenMod + profBonus + magicPlus;
            weapon.toHitModifier = toHit;
            weapon.attackBonus = toHit >= 0 ? `+${toHit}` : `${toHit}`;

            // Adjust damage formula to reflect weapon's magic bonus (+1/+2/+3)
            const dmgDie = weapon.damageDie || (weapon.damage ? weapon.damage.split(" ")[0] : "1d6");
            const dmgType = weapon.damageType || (weapon.damage ? weapon.damage.split(" ").slice(1).join(" ") : "Slashing");
            const totalDmgMod = chosenMod + magicPlus;
            const dmgModStr = totalDmgMod >= 0 ? `+ ${totalDmgMod}` : `- ${Math.abs(totalDmgMod)}`;

            // Extract extra damage parts (e.g. + 2d6 Fire) if present
            const extraMatch = (weapon.damage || "").match(/\+\s*(\d+d\d+\s+[A-Za-z]+)/g);
            const extraStr = extraMatch ? ` ${extraMatch.join(" ")}` : "";

            weapon.damage = `${dmgDie} ${dmgModStr} ${dmgType}${extraStr}`;

            // Sync with matching weapon attack action in character.actions
            if (Array.isArray(character.actions)) {
                const actionMatch = character.actions.find(
                    a => a.name.toLowerCase() === wName.toLowerCase() || (a.spellName && a.spellName.toLowerCase() === wName.toLowerCase())
                );
                if (actionMatch) {
                    actionMatch.hitOrDc = toHit >= 0 ? `+${toHit} to hit` : `${toHit} to hit`;
                    actionMatch.damageOrEffect = weapon.damage;
                }
            }
        });
    }

    return character;
}
