import { applyItemSenses } from "../../../rules/dnd5e_2024/senses";
import { StatModifier } from "../../../rules/dnd5e_2024/types";
import { findItemRule } from "../../../services/classRules";
import { CharacterData, EquipmentItem } from "../characterData";

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
    /** Advantage or disadvantage the item gives, as notes ("Advantage on Initiative (Weapon of Warning)") */
    rollNotes: string[];
}

export interface BaseWeaponDef {
    name: string;
    category: string;
    damageDie: string;
    damageType: string;
    damage: string;
    range: string;
    properties: string[];
    description?: string;
    mastery?: {
        name: string;
        description: string;
        unlocked?: boolean;
    };
}

export interface GrantedWeaponInfo {
    weaponName: string;
    magicBonus: number;
    baseDef: BaseWeaponDef;
}

export const BASE_5E_WEAPONS: Record<string, BaseWeaponDef> = {
    "club": {
        name: "Club",
        category: "Simple Weapon (Melee)",
        damageDie: "1d4",
        damageType: "Bludgeoning",
        damage: "1d4 Bludgeoning",
        range: "Reach 5 ft.",
        properties: ["Light"],
        mastery: { name: "Slow", description: "If you hit a creature with this weapon, you can reduce its Speed by 10 feet until the start of your next turn.", unlocked: false }
    },
    "dagger": {
        name: "Dagger",
        category: "Simple Weapon (Melee)",
        damageDie: "1d4",
        damageType: "Piercing",
        damage: "1d4 Piercing",
        range: "20/60 ft.",
        properties: ["Finesse", "Light", "Thrown"],
        mastery: { name: "Nick", description: "When you make the extra attack of the Light weapon property, you can make it as part of the Attack action instead of as a Bonus Action.", unlocked: false }
    },
    "greatclub": {
        name: "Greatclub",
        category: "Simple Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Bludgeoning",
        damage: "1d8 Bludgeoning",
        range: "Reach 5 ft.",
        properties: ["Two-Handed"],
        mastery: { name: "Push", description: "If you hit a creature with this weapon, you can push the creature up to 10 feet away from you if it is Large or smaller.", unlocked: false }
    },
    "handaxe": {
        name: "Handaxe",
        category: "Simple Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Slashing",
        damage: "1d6 Slashing",
        range: "20/60 ft.",
        properties: ["Light", "Thrown"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it with this weapon, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "javelin": {
        name: "Javelin",
        category: "Simple Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Piercing",
        damage: "1d6 Piercing",
        range: "30/120 ft.",
        properties: ["Thrown"],
        mastery: { name: "Slow", description: "If you hit a creature with this weapon, you can reduce its Speed by 10 feet until the start of your next turn.", unlocked: false }
    },
    "light hammer": {
        name: "Light Hammer",
        category: "Simple Weapon (Melee)",
        damageDie: "1d4",
        damageType: "Bludgeoning",
        damage: "1d4 Bludgeoning",
        range: "20/60 ft.",
        properties: ["Light", "Thrown"],
        mastery: { name: "Nick", description: "When you make the extra attack of the Light weapon property, you can make it as part of the Attack action instead of as a Bonus Action.", unlocked: false }
    },
    "mace": {
        name: "Mace",
        category: "Simple Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Bludgeoning",
        damage: "1d6 Bludgeoning",
        range: "Reach 5 ft.",
        properties: [],
        mastery: { name: "Sap", description: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.", unlocked: false }
    },
    "quarterstaff": {
        name: "Quarterstaff",
        category: "Simple Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Bludgeoning",
        damage: "1d6 Bludgeoning",
        range: "Reach 5 ft.",
        properties: ["Versatile (1d8)"],
        description: "<p>Proficiency with a Quarterstaff allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p><p><strong>Versatile:</strong> This weapon can be used with one or two hands. A damage value in parentheses appears with the property—the damage when the weapon is used with two hands to make a melee attack (1d8).</p>",
        mastery: { name: "Topple", description: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 + your Strength modifier + your Proficiency Bonus) or fall Prone.", unlocked: false }
    },
    "sickle": {
        name: "Sickle",
        category: "Simple Weapon (Melee)",
        damageDie: "1d4",
        damageType: "Slashing",
        damage: "1d4 Slashing",
        range: "Reach 5 ft.",
        properties: ["Light"],
        mastery: { name: "Nick", description: "When you make the extra attack of the Light weapon property, you can make it as part of the Attack action instead of as a Bonus Action.", unlocked: false }
    },
    "spear": {
        name: "Spear",
        category: "Simple Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Piercing",
        damage: "1d6 Piercing",
        range: "20/60 ft.",
        properties: ["Thrown", "Versatile (1d8)"],
        mastery: { name: "Sap", description: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.", unlocked: false }
    },
    "light crossbow": {
        name: "Light Crossbow",
        category: "Simple Weapon (Ranged)",
        damageDie: "1d8",
        damageType: "Piercing",
        damage: "1d8 Piercing",
        range: "80/320 ft.",
        properties: ["Ammunition", "Loading", "Two-Handed"],
        mastery: { name: "Slow", description: "If you hit a creature with this weapon, you can reduce its Speed by 10 feet until the start of your next turn.", unlocked: false }
    },
    "dart": {
        name: "Dart",
        category: "Simple Weapon (Ranged)",
        damageDie: "1d4",
        damageType: "Piercing",
        damage: "1d4 Piercing",
        range: "20/60 ft.",
        properties: ["Finesse", "Thrown"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "shortbow": {
        name: "Shortbow",
        category: "Simple Weapon (Ranged)",
        damageDie: "1d6",
        damageType: "Piercing",
        damage: "1d6 Piercing",
        range: "80/320 ft.",
        properties: ["Ammunition", "Two-Handed"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "sling": {
        name: "Sling",
        category: "Simple Weapon (Ranged)",
        damageDie: "1d4",
        damageType: "Bludgeoning",
        damage: "1d4 Bludgeoning",
        range: "30/120 ft.",
        properties: ["Ammunition"],
        mastery: { name: "Slow", description: "If you hit a creature with this weapon, you can reduce its Speed by 10 feet until the start of your next turn.", unlocked: false }
    },
    "battleaxe": {
        name: "Battleaxe",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Slashing",
        damage: "1d8 Slashing",
        range: "Reach 5 ft.",
        properties: ["Versatile (1d10)"],
        mastery: { name: "Topple", description: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw or fall Prone.", unlocked: false }
    },
    "flail": {
        name: "Flail",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Bludgeoning",
        damage: "1d8 Bludgeoning",
        range: "Reach 5 ft.",
        properties: [],
        mastery: { name: "Sap", description: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.", unlocked: false }
    },
    "glaive": {
        name: "Glaive",
        category: "Martial Weapon (Melee)",
        damageDie: "1d10",
        damageType: "Slashing",
        damage: "1d10 Slashing",
        range: "Reach 10 ft.",
        properties: ["Heavy", "Reach", "Two-Handed"],
        mastery: { name: "Graze", description: "If your attack roll misses a creature, that creature takes damage equal to your ability modifier.", unlocked: false }
    },
    "greataxe": {
        name: "Greataxe",
        category: "Martial Weapon (Melee)",
        damageDie: "1d12",
        damageType: "Slashing",
        damage: "1d12 Slashing",
        range: "Reach 5 ft.",
        properties: ["Heavy", "Two-Handed"],
        mastery: { name: "Cleave", description: "If you hit a creature with this weapon, you can make a melee attack roll against a second creature within 5 feet.", unlocked: false }
    },
    "greatsword": {
        name: "Greatsword",
        category: "Martial Weapon (Melee)",
        damageDie: "2d6",
        damageType: "Slashing",
        damage: "2d6 Slashing",
        range: "Reach 5 ft.",
        properties: ["Heavy", "Two-Handed"],
        mastery: { name: "Graze", description: "If your attack roll misses a creature, that creature takes damage equal to your ability modifier.", unlocked: false }
    },
    "halberd": {
        name: "Halberd",
        category: "Martial Weapon (Melee)",
        damageDie: "1d10",
        damageType: "Slashing",
        damage: "1d10 Slashing",
        range: "Reach 10 ft.",
        properties: ["Heavy", "Reach", "Two-Handed"],
        mastery: { name: "Cleave", description: "If you hit a creature with this weapon, you can make a melee attack roll against a second creature within 5 feet.", unlocked: false }
    },
    "lance": {
        name: "Lance",
        category: "Martial Weapon (Melee)",
        damageDie: "1d10",
        damageType: "Piercing",
        damage: "1d10 Piercing",
        range: "Reach 10 ft.",
        properties: ["Heavy", "Reach", "Two-Handed"],
        mastery: { name: "Topple", description: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw or fall Prone.", unlocked: false }
    },
    "longsword": {
        name: "Longsword",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Slashing",
        damage: "1d8 Slashing",
        range: "Reach 5 ft.",
        properties: ["Versatile (1d10)"],
        mastery: { name: "Sap", description: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.", unlocked: false }
    },
    "maul": {
        name: "Maul",
        category: "Martial Weapon (Melee)",
        damageDie: "2d6",
        damageType: "Bludgeoning",
        damage: "2d6 Bludgeoning",
        range: "Reach 5 ft.",
        properties: ["Heavy", "Two-Handed"],
        mastery: { name: "Topple", description: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw or fall Prone.", unlocked: false }
    },
    "morningstar": {
        name: "Morningstar",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Piercing",
        damage: "1d8 Piercing",
        range: "Reach 5 ft.",
        properties: [],
        mastery: { name: "Sap", description: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.", unlocked: false }
    },
    "pike": {
        name: "Pike",
        category: "Martial Weapon (Melee)",
        damageDie: "1d10",
        damageType: "Piercing",
        damage: "1d10 Piercing",
        range: "Reach 10 ft.",
        properties: ["Heavy", "Reach", "Two-Handed"],
        mastery: { name: "Push", description: "If you hit a creature with this weapon, you can push the creature up to 10 feet away from you.", unlocked: false }
    },
    "rapier": {
        name: "Rapier",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Piercing",
        damage: "1d8 Piercing",
        range: "Reach 5 ft.",
        properties: ["Finesse"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "scimitar": {
        name: "Scimitar",
        category: "Martial Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Slashing",
        damage: "1d6 Slashing",
        range: "Reach 5 ft.",
        properties: ["Finesse", "Light"],
        mastery: { name: "Nick", description: "When you make the extra attack of the Light weapon property, you can make it as part of the Attack action instead of as a Bonus Action.", unlocked: false }
    },
    "shortsword": {
        name: "Shortsword",
        category: "Martial Weapon (Melee)",
        damageDie: "1d6",
        damageType: "Piercing",
        damage: "1d6 Piercing",
        range: "Reach 5 ft.",
        properties: ["Finesse", "Light"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "trident": {
        name: "Trident",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Piercing",
        damage: "1d8 Piercing",
        range: "20/60 ft.",
        properties: ["Thrown", "Versatile (1d10)"],
        mastery: { name: "Topple", description: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw or fall Prone.", unlocked: false }
    },
    "war pick": {
        name: "War Pick",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Piercing",
        damage: "1d8 Piercing",
        range: "Reach 5 ft.",
        properties: ["Versatile (1d10)"],
        mastery: { name: "Sap", description: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.", unlocked: false }
    },
    "warhammer": {
        name: "Warhammer",
        category: "Martial Weapon (Melee)",
        damageDie: "1d8",
        damageType: "Bludgeoning",
        damage: "1d8 Bludgeoning",
        range: "Reach 5 ft.",
        properties: ["Versatile (1d10)"],
        mastery: { name: "Push", description: "If you hit a creature with this weapon, you can push the creature up to 10 feet away from you.", unlocked: false }
    },
    "whip": {
        name: "Whip",
        category: "Martial Weapon (Melee)",
        damageDie: "1d4",
        damageType: "Slashing",
        damage: "1d4 Slashing",
        range: "Reach 10 ft.",
        properties: ["Finesse", "Reach"],
        mastery: { name: "Slow", description: "If you hit a creature with this weapon, you can reduce its Speed by 10 feet until the start of your next turn.", unlocked: false }
    },
    "blowgun": {
        name: "Blowgun",
        category: "Martial Weapon (Ranged)",
        damageDie: "1",
        damageType: "Piercing",
        damage: "1 Piercing",
        range: "25/100 ft.",
        properties: ["Ammunition", "Loading"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "hand crossbow": {
        name: "Hand Crossbow",
        category: "Martial Weapon (Ranged)",
        damageDie: "1d6",
        damageType: "Piercing",
        damage: "1d6 Piercing",
        range: "30/120 ft.",
        properties: ["Ammunition", "Light", "Loading"],
        mastery: { name: "Vex", description: "If you hit a creature and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.", unlocked: false }
    },
    "heavy crossbow": {
        name: "Heavy Crossbow",
        category: "Martial Weapon (Ranged)",
        damageDie: "1d10",
        damageType: "Piercing",
        damage: "1d10 Piercing",
        range: "100/400 ft.",
        properties: ["Ammunition", "Heavy", "Loading", "Two-Handed"],
        mastery: { name: "Push", description: "If you hit a creature with this weapon, you can push the creature up to 10 feet away from you.", unlocked: false }
    },
    "longbow": {
        name: "Longbow",
        category: "Martial Weapon (Ranged)",
        damageDie: "1d8",
        damageType: "Piercing",
        damage: "1d8 Piercing",
        range: "150/600 ft.",
        properties: ["Ammunition", "Heavy", "Two-Handed"],
        mastery: { name: "Slow", description: "If you hit a creature with this weapon, you can reduce its Speed by 10 feet until the start of your next turn.", unlocked: false }
    },
    "net": {
        name: "Net",
        category: "Martial Weapon (Ranged)",
        damageDie: "—",
        damageType: "Special",
        damage: "—",
        range: "5/15 ft.",
        properties: ["Thrown"],
        mastery: undefined
    }
};

const BASE_WEAPON_ALIASES: Record<string, string> = {
    "quarter staff": "quarterstaff",
    "war hammer": "warhammer",
    "warpick": "war pick",
    "crossbow, light": "light crossbow",
    "crossbow, hand": "hand crossbow",
    "crossbow, heavy": "heavy crossbow",
    "short sword": "shortsword",
    "long sword": "longsword",
    "great sword": "greatsword",
    "great club": "greatclub",
    "great axe": "greataxe"
};

/**
 * Accurately analyzes an item description to detect if it can be wielded or used as a weapon,
 * returning the granted weapon details, magic bonuses, and base weapon definition.
 */
export function extractGrantedWeaponFromItem(item?: {
    name?: string;
    description?: string;
    notes?: string;
    type?: string;
    filterType?: string;
    rarity?: string;
}): GrantedWeaponInfo | null {
    if (!item || !item.name) return null;
    const itemName = item.name.trim();
    const itemDesc = `${item.description || ""} ${item.notes || ""}`;
    const cleanText = itemDesc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

    let matchedWeaponKey: string | null = null;
    let explicitPlusBonus = 0;

    // Pattern A: Match in HTML hrefs e.g. <a href="/equipment/18-quarterstaff">
    const hrefMatch = itemDesc.match(/(?:wielded as|used as|functions as|acts as|serves as|counts as)[^<]*<a\b[^>]*href=["'][^"']*\/(?:equipment|weapons)\/([^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (hrefMatch) {
        const slug = decodeURIComponent(hrefMatch[1]).replace(/^\d+-/, "").replace(/-/g, " ").toLowerCase().trim();
        const label = hrefMatch[2].replace(/<[^>]*>/g, "").toLowerCase().trim();
        const resolvedSlug = BASE_WEAPON_ALIASES[slug] || slug;
        const resolvedLabel = BASE_WEAPON_ALIASES[label] || label;
        if (BASE_5E_WEAPONS[resolvedSlug]) {
            matchedWeaponKey = resolvedSlug;
        } else if (BASE_5E_WEAPONS[resolvedLabel]) {
            matchedWeaponKey = resolvedLabel;
        }
    }

    // Pattern B: Regex against stripped text
    if (!matchedWeaponKey) {
        const allKeys = Array.from(new Set([...Object.keys(BASE_5E_WEAPONS), ...Object.keys(BASE_WEAPON_ALIASES)])).sort((a, b) => b.length - a.length);
        const weaponNamesPattern = allKeys.join("|");
        const phraseRegex = new RegExp(
            `(?:can be wielded as|can be used as|functions as|acts as|serves as|is wielded as|counts as)\\s+(?:an?|the)?\\s*(?:magic\\s+)?(?:(\\+[1-3])\\s+)?\\b(${weaponNamesPattern})\\b`,
            "i"
        );
        const match = cleanText.match(phraseRegex);
        if (match) {
            if (match[1]) explicitPlusBonus = Number(match[1].replace("+", "")) || 0;
            const rawWName = match[2].toLowerCase().trim();
            const resolvedWName = BASE_WEAPON_ALIASES[rawWName] || rawWName;
            if (BASE_5E_WEAPONS[resolvedWName]) {
                matchedWeaponKey = resolvedWName;
            }
        }
    }

    // Pattern C: 5e Rule: Staves default to Quarterstaff if no other weapon matched
    if (!matchedWeaponKey) {
        const isStaff =
            (item.type && item.type.toLowerCase() === "staff") ||
            (item.filterType && item.filterType.toLowerCase() === "staff") ||
            /\bstaff\b/i.test(itemName);
        if (isStaff && !cleanText.toLowerCase().includes("cannot be wielded as a weapon")) {
            matchedWeaponKey = "quarterstaff";
        }
    }

    if (!matchedWeaponKey) return null;

    const baseDef = BASE_5E_WEAPONS[matchedWeaponKey];
    if (!baseDef) return null;

    const magicBonus = explicitPlusBonus || extractPlusBonus(itemName, itemDesc);

    return {
        weaponName: baseDef.name,
        magicBonus,
        baseDef
    };
}

/**
 * Dynamically synchronizes weapons granted by active equipment (such as Staff of the Woodlands -> Quarterstaff).
 * When granting items are equipped & attuned, ensures granted weapons exist in character.weapons and character.actions.
 * When granting items are unequipped or unattuned, removes the granted weapons and actions.
 */
export function applyGrantedWeapons(character: CharacterData): void {
    if (!character.weapons) {
        character.weapons = [];
    }

    const abilityMods: Record<string, number> = {};
    (character.abilities || []).forEach(a => {
        abilityMods[a.abbr] = a.modifier;
    });
    const strMod = abilityMods.STR ?? 0;
    const dexMod = abilityMods.DEX ?? 0;
    const profBonus = Number(character.vitals?.proficiencyBonus) || 2;

    const activeGrantedWeapons = new Map<string, { item: EquipmentItem; grant: GrantedWeaponInfo }>();
    if (Array.isArray(character.equipment)) {
        character.equipment.forEach(item => {
            const reqAttune = checkItemRequiresAttunement(item);
            const isAttuned = !reqAttune || !!item.attuned;
            const isActive = !!item.equipped && isAttuned;
            if (!isActive) return;

            const grant = extractGrantedWeaponFromItem(item);
            if (grant) {
                activeGrantedWeapons.set(item.name.toLowerCase(), { item, grant });
            }
        });
    }

    // Remove or unequip any previously granted weapons whose granting item is no longer active
    character.weapons = character.weapons.filter(w => {
        if (!w.grantedBy) return true;
        const grantingItemNameLower = w.grantedBy.toLowerCase();
        const active = activeGrantedWeapons.get(grantingItemNameLower);
        if (!active) {
            if (Array.isArray(character.actions)) {
                character.actions = character.actions.filter(
                    a => !(a.name.toLowerCase() === w.name.toLowerCase() && ((a as any).grantedBy === w.grantedBy || a.notes?.includes("Granted by") || a.notes?.includes(w.grantedBy!)))
                );
            }
            return false;
        }
        return true;
    });

    const currentWeapons = character.weapons;

    // Add or update active granted weapons
    activeGrantedWeapons.forEach(({ item, grant }, grantingItemNameLower) => {
        let weapon = currentWeapons.find(
            w => w.grantedBy && w.grantedBy.toLowerCase() === grantingItemNameLower
        );

        if (!weapon) {
            weapon = {
                name: grant.baseDef.name,
                grantedBy: item.name,
                quantity: 1,
                equipped: true,
                attuned: item.attuned,
                requiresAttunement: item.requiresAttunement,
                category: grant.baseDef.category,
                damage: grant.baseDef.damage,
                damageType: grant.baseDef.damageType,
                damageDie: grant.baseDef.damageDie,
                attackBonus: "+0",
                toHitModifier: 0,
                range: grant.baseDef.range,
                properties: [...grant.baseDef.properties],
                isMagic: true,
                rarity: item.rarity || "Common",
                description: grant.baseDef.description || `<p>Proficiency with a ${grant.baseDef.name} allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p>`,
                imageUrl: item.imageUrl,
                mastery: grant.baseDef.mastery
                    ? {
                        name: grant.baseDef.mastery.name,
                        description: grant.baseDef.mastery.description,
                        unlocked: !!grant.baseDef.mastery.unlocked
                    }
                    : undefined,
                notes: `Granted by ${item.name}${grant.magicBonus > 0 ? ` (+${grant.magicBonus})` : ""}`
            };
            currentWeapons.push(weapon);
        } else {
            weapon.equipped = true;
            weapon.isMagic = true;
            weapon.rarity = item.rarity || "Common";
            weapon.notes = `Granted by ${item.name}${grant.magicBonus > 0 ? ` (+${grant.magicBonus})` : ""}`;
            weapon.description = grant.baseDef.description || weapon.description;
        }

        (weapon as any)._grantedMagicBonus = grant.magicBonus;

        // Calculate attack bonus & damage for granted weapon
        const props = Array.isArray(weapon.properties) ? weapon.properties : [];
        const isFinesse = props.some(p => p.toLowerCase().includes("finesse"));
        const isRanged = props.some(p => p.toLowerCase().includes("ranged") || p.toLowerCase().includes("ammunition"));
        const isThrown = props.some(p => p.toLowerCase().includes("thrown"));

        let chosenMod = strMod;
        if (isRanged) chosenMod = dexMod;
        else if (isFinesse || isThrown) chosenMod = Math.max(strMod, dexMod);

        const toHit = chosenMod + profBonus + grant.magicBonus;
        weapon.toHitModifier = toHit;
        weapon.attackBonus = toHit >= 0 ? `+${toHit}` : `${toHit}`;

        const totalDmgMod = chosenMod + grant.magicBonus;
        const dmgModStr = totalDmgMod >= 0 ? `+ ${totalDmgMod}` : `- ${Math.abs(totalDmgMod)}`;
        weapon.damage = `${grant.baseDef.damageDie} ${dmgModStr} ${grant.baseDef.damageType}`;

        // Ensure weapon attack exists in character.actions
        if (Array.isArray(character.actions)) {
            let actionMatch = character.actions.find(
                a => a.name.toLowerCase() === weapon!.name.toLowerCase() && ((a as any).grantedBy === item.name || a.notes?.includes(item.name))
            );
            if (!actionMatch) {
                actionMatch = {
                    name: weapon.name,
                    type: "Action",
                    rangeOrReach: weapon.range,
                    hitOrDc: `${toHit >= 0 ? `+${toHit}` : toHit} to hit`,
                    damageOrEffect: weapon.damage,
                    notes: (weapon.properties || []).join(", ") || `Granted by ${item.name}`
                };
                (actionMatch as any).grantedBy = item.name;
                character.actions.push(actionMatch);
            } else {
                actionMatch.hitOrDc = `${toHit >= 0 ? `+${toHit}` : toHit} to hit`;
                actionMatch.damageOrEffect = weapon.damage;
                (actionMatch as any).grantedBy = item.name;
            }
        }
    });
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

/**
 * Accurately determines if an item or weapon requires attunement.
 */
export function checkItemRequiresAttunement(item?: {
    name?: string;
    attuned?: boolean;
    requiresAttunement?: boolean;
    description?: string;
    notes?: string;
}): boolean {
    if (!item) return false;
    if (item.requiresAttunement === true) return true;
    if (item.attuned === true) return true;
    const text = `${item.name || ""} ${item.description || ""} ${item.notes || ""}`.toLowerCase();
    return text.includes("requires attunement") || text.includes("(requires attunement") || text.includes("require attunement");
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

    // An item whose bonus its name doesn't show (Holy Avenger, Sun Blade, staves): item.plus in its rules data
    const fromData = findItemRule(name)?.modifiers?.find((m) => m.target === "item.plus" && m.type === "set");
    if (fromData && Number(fromData.value) > 0) return Number(fromData.value);

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

/** An item's rules modifiers: its own (custom items, D&D Beyond), else the item rules' for its name. */
export function itemModifiers(item: { name?: string; modifiers?: StatModifier[] }): StatModifier[] {
    return item.modifiers ?? findItemRule(item.name || "")?.modifiers ?? [];
}

const emptyExtraction = (): MagicBonusExtraction => ({
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
    initiativeBonus: 0,
    rollNotes: []
});

/**
 * The bonuses an equipped item gives, from its rules modifiers (itemModifiers): ability scores, AC, saves, checks,
 * spell attack and DC, speed, initiative, and advantage notes. Magic armor and shields also add their own +N to AC
 * when their data doesn't set AC itself.
 */
export function extractItemMagicBonuses(
    item: { name: string; type?: string; filterType?: string; description?: string; notes?: string; isMagic?: boolean; modifiers?: StatModifier[] },
    isShieldEquipped: boolean,
    isBodyArmorEquipped: boolean
): MagicBonusExtraction {
    const result = emptyExtraction();
    const name = (item.name || "").trim();
    const plusVal = extractPlusBonus(name, `${item.description || ""} ${item.notes || ""}`);
    const mods = itemModifiers(item);
    const num = (m: StatModifier) => (m.value === "{{plus}}" ? plusVal || 1 : Number(m.value) || 0);
    const armorStateOk = (m: StatModifier) =>
        m.requires === "no-armor-or-shield" ? !isBodyArmorEquipped && !isShieldEquipped
            : m.requires === "no-armor" ? !isBodyArmorEquipped
                : m.requires === "armor" ? isBodyArmorEquipped
                    : true;

    for (const m of mods) {
        const target = String(m.target || "");
        if (!armorStateOk(m)) continue;
        if (target.startsWith("abilities.")) {
            const abbr = STAT_ABBRS[target.split(".")[1]];
            if (!abbr) continue;
            if (m.type === "set") result.statOverrides[abbr] = Math.max(result.statOverrides[abbr] || 0, num(m));
            else if (m.type === "bonus") result.statBonuses[abbr] = (result.statBonuses[abbr] || 0) + num(m);
        } else if (target === "vitals.ac" && m.type === "bonus") {
            result.acBonus += num(m);
        } else if (target === "saves.all" && m.type === "bonus") {
            result.globalSaveBonus += num(m);
        } else if (target === "checks.all" && m.type === "bonus") {
            result.globalCheckBonus += num(m);
        } else if (target === "spells.attack" && m.type === "bonus") {
            result.spellAtkBonus += num(m);
        } else if (target === "spells.dc" && m.type === "bonus") {
            result.spellDcBonus += num(m);
        } else if (target === "vitals.speed" && m.type === "bonus") {
            result.speedBonusFt += num(m);
        } else if (target === "vitals.initiative" && m.type === "bonus") {
            result.initiativeBonus += num(m);
        } else if (m.type === "advantage" || m.type === "disadvantage") {
            const what = target === "vitals.initiative" ? "Initiative"
                : target.startsWith("skills.") ? `${target.slice(7).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} checks`
                    : target.startsWith("saves.") ? `${target.slice(6) === "all" ? "saving throws" : `${(STAT_ABBRS[target.slice(6)] || target.slice(6)).toUpperCase()} saving throws`}`
                        : "";
            if (what) result.rollNotes.push(`${m.type === "advantage" ? "Advantage" : "Disadvantage"} on ${what} (${name})`);
        }
    }

    // Magic armor and shields: their +N is AC unless their data already gives AC
    const isShield = name.toLowerCase().includes("shield") || (item.filterType || "").toLowerCase() === "shield";
    const isArmor = (item.filterType || "").toLowerCase() === "armor" && !isShield;
    if ((isShield || isArmor) && plusVal > 0 && !mods.some((m) => m.target === "vitals.ac")) result.acBonus += plusVal;

    return result;
}

/**
 * Recalculates and applies all magical item and weapon bonuses to a CharacterData object.
 * This updates ability scores, modifiers, saving throws, armor class, spell save DC,
 * spell attack bonus, skill bonuses, passive senses, and weapon attack/damage bonuses.
 */
/** Whether an item's effects apply: equipped, and attuned when it needs attunement. */
function isItemActive(item: any): boolean {
    if (item.equipped === false) return false;
    if (checkItemRequiresAttunement(item) && !item.attuned) return false;
    return true;
}

/**
 * Re-applies the special senses of the character's active items, from each item's own modifiers or its item rules
 * (Goggles of Night, Robe of Eyes, custom items).
 */
export function applyItemSensesToCharacter(character: CharacterData): void {
    if (!character) return;
    const active = [...(character.equipment || []), ...(character.weapons || [])].filter(isItemActive);
    applyItemSenses(character, active.map((i: any) => ({ name: i.name, modifiers: i.modifiers ?? findItemRule(i.name)?.modifiers })));
}

export function applyMagicalItemBonuses(character: CharacterData): CharacterData {
    if (!character || !Array.isArray(character.abilities)) return character;
    applyItemSensesToCharacter(character);

    const equippedItems = (character.equipment || []).filter(isItemActive);
    const equippedWeapons = (character.weapons || []).filter(isItemActive);

    const isShieldEquipped = equippedItems.some(i => (i.name || "").toLowerCase().includes("shield") || (i.type || "").toLowerCase() === "shield");
    const isBodyArmorEquipped = equippedItems.some(i => {
        const type = (i.type || i.filterType || "").toLowerCase();
        const name = (i.name || "").toLowerCase();
        return (type === "armor" || name.includes("armor") || name.includes("mail") || name.includes("plate") || name.includes("leather")) && !name.includes("shield");
    });

    // Aggregate bonuses from all active items without double-counting mirrored items
    const aggregated = emptyExtraction();

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
        aggregated.rollNotes.push(...extracted.rollNotes);
    };

    equippedItems.forEach(processItem);
    equippedWeapons.forEach(processItem);
    character.itemRollNotes = aggregated.rollNotes.length > 0 ? aggregated.rollNotes : undefined;

    // D&D Beyond's numbers already count its items' effects, and changing equipment re-reads them, so imported
    // characters only get their items' senses and weapons here; adding item stats again would count them twice
    const itemStatsFromData = character.source !== "dndbeyond";

    const profBonus = character.vitals?.proficiencyBonus || Math.floor(((character.level || 1) - 1) / 4) + 2;

    // --- 1. RECALCULATE ABILITY SCORES ---
    const naturalMods: Record<string, number> = {};
    if (itemStatsFromData) character.abilities.forEach(ability => {
        const abbr = ability.abbr;
        // Natural score is baseScore + natural bonus (from racial, leveling, feats)
        const naturalBase = typeof ability.baseScore === "number" ? ability.baseScore : (ability.score - (ability.bonus || 0));
        const naturalBonus = typeof ability.bonus === "number" ? ability.bonus : 0;
        const naturalTotal = naturalBase + naturalBonus;
        naturalMods[abbr] = Math.floor((naturalTotal - 10) / 2);

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
    // Like Initiative below: skills keep what the creator and sheet choices put there (Jack of All Trades, bonuses to
    // one skill) and swap the items' part (ability check bonuses and ability score changes) for the current one
    const skillItemChanges: Record<string, number> = {};
    if (itemStatsFromData && Array.isArray(character.skills) && character.vitals) {
        const vitals = character.vitals as any;
        const lastApplied: Record<string, number> = vitals._itemSkillBonuses || {};
        const applied: Record<string, number> = {};
        character.skills.forEach(skill => {
            const statMod = abilityMods[skill.stat] ?? 0;
            const itemPart = (statMod - (naturalMods[skill.stat] ?? statMod)) + aggregated.globalCheckBonus;
            const change = itemPart - (Number(lastApplied[skill.name]) || 0);
            skill.bonus = (Number(skill.bonus) || 0) + change;
            skillItemChanges[skill.name.toLowerCase()] = change;
            applied[skill.name] = itemPart;
        });
        vitals._itemSkillBonuses = applied;
    }

    // --- 3. RECALCULATE VITALS ---
    if (itemStatsFromData && character.vitals) {
        // Base AC without magic item accessories:
        // If character.vitals.armorClass was previously computed, apply the net magic acBonus
        // If natural AC is tracked, start from natural AC:
        if ((character.vitals as any)._naturalArmorClass === undefined) {
            (character.vitals as any)._naturalArmorClass = character.vitals.armorClass;
        }
        const naturalAc = (character.vitals as any)._naturalArmorClass || 10;
        character.vitals.armorClass = naturalAc + aggregated.acBonus;

        // Initiative keeps what the creator and sheet choices put there (Alert, Dread Ambusher) and swaps the items'
        // part (their initiative and ability check bonuses, and any DEX change) for the current one. The last part
        // applied is saved with the character, so reloading doesn't count it twice
        const vitals = character.vitals as any;
        const itemInitiative = (dexMod - (naturalMods.DEX ?? dexMod)) + aggregated.initiativeBonus + aggregated.globalCheckBonus;
        character.vitals.initiative = (Number(character.vitals.initiative) || 0) - (Number(vitals._itemInitiative) || 0) + itemInitiative;
        vitals._itemInitiative = itemInitiative;

        // Spell Save DC & Attack Bonus
        const spellAbilityAbbr = character.vitals.spellcastingAbility
            ? character.vitals.spellcastingAbility.slice(0, 3).toUpperCase()
            : "CHA";
        const spellMod = abilityMods[spellAbilityAbbr] ?? chaMod;

        character.vitals.spellSaveDc = 8 + profBonus + spellMod + aggregated.spellDcBonus;
        character.vitals.spellAttackBonus = profBonus + spellMod + aggregated.spellAtkBonus;
        character.vitals.spellcastingAbility = `${STAT_ABBRS[spellAbilityAbbr.toLowerCase()] || spellAbilityAbbr} (${spellMod >= 0 ? `+${spellMod}` : spellMod})`;

        // Passive scores move with their skill, keeping their own bonuses (advantage's +5)
        character.vitals.passivePerception = (Number(character.vitals.passivePerception) || 10) + (skillItemChanges.perception || 0);
        character.vitals.passiveInvestigation = (Number(character.vitals.passiveInvestigation) || 10) + (skillItemChanges.investigation || 0);
        character.vitals.passiveInsight = (Number(character.vitals.passiveInsight) || 10) + (skillItemChanges.insight || 0);

        // Speed
        const baseSpeedNum = parseInt(character.vitals.speed, 10) || 30;
        const adjustedSpeed = (baseSpeedNum + aggregated.speedBonusFt) * aggregated.speedMultiplier;
        const currentParen = String(character.vitals.speed || "").match(/\s*(\([^)]+\))/);
        character.vitals.speed = `${adjustedSpeed} ft.${currentParen ? currentParen[0] : ""}`;
    }

    // --- 3.5. PROCESS GRANTED WEAPONS FROM ACTIVE EQUIPMENT ---
    applyGrantedWeapons(character);

    // --- 4. RECALCULATE WEAPONS (Attack Bonus and Damage with Magic Bonuses) ---
    if (Array.isArray(character.weapons)) {
        character.weapons.forEach(weapon => {
            const wName = weapon.name || "";
            const wDesc = weapon.description || weapon.notes || "";
            const isMundane = !weapon.grantedBy && isMundaneEquipment(wName);
            const magicPlus = isMundane ? 0 : Math.max(extractPlusBonus(wName, wDesc), (weapon as any)._grantedMagicBonus || 0);
            if (magicPlus > 0 || weapon.grantedBy) {
                weapon.isMagic = true;
            } else if (isMundane) {
                weapon.isMagic = false;
                weapon.rarity = "Common";
            }

            const reqAttune = checkItemRequiresAttunement(weapon);
            const isAttuned = !reqAttune || !!weapon.attuned;
            const effectiveMagicPlus = (isAttuned && !isMundane) ? magicPlus : 0;

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

            const toHit = chosenMod + profBonus + effectiveMagicPlus;
            weapon.toHitModifier = toHit;
            weapon.attackBonus = toHit >= 0 ? `+${toHit}` : `${toHit}`;

            // Adjust damage formula to reflect weapon's magic bonus (+1/+2/+3)
            const dmgDie = weapon.damageDie || (weapon.damage ? weapon.damage.split(" ")[0] : "1d6");
            const dmgType = weapon.damageType || (weapon.damage ? weapon.damage.split(" ").slice(1).join(" ") : "Slashing");
            const totalDmgMod = chosenMod + effectiveMagicPlus;
            const dmgModStr = totalDmgMod >= 0 ? `+ ${totalDmgMod}` : `- ${Math.abs(totalDmgMod)}`;

            // Extract extra damage parts (e.g. + 2d6 Fire) if present
            const extraMatch = (weapon.damage || "").match(/\+\s*(\d+d\d+\s+[A-Za-z]+)/g);
            const extraStr = extraMatch ? ` ${extraMatch.join(" ")}` : "";

            weapon.damage = `${dmgDie} ${dmgModStr} ${dmgType}${extraStr}`;

            // Sync with matching weapon attack action in character.actions
            if (Array.isArray(character.actions)) {
                let actionMatch = character.actions.find(
                    a => a.name.toLowerCase() === wName.toLowerCase() || (a.spellName && a.spellName.toLowerCase() === wName.toLowerCase())
                );
                if (!actionMatch && weapon.equipped) {
                    actionMatch = {
                        name: weapon.name,
                        type: "Action",
                        rangeOrReach: weapon.range,
                        hitOrDc: `${toHit >= 0 ? `+${toHit}` : toHit} to hit`,
                        damageOrEffect: weapon.damage,
                        notes: (weapon.properties || []).join(", ") || (weapon.grantedBy ? `Granted by ${weapon.grantedBy}` : "Weapon")
                    };
                    character.actions.push(actionMatch);
                } else if (actionMatch) {
                    actionMatch.hitOrDc = toHit >= 0 ? `+${toHit} to hit` : `${toHit} to hit`;
                    actionMatch.damageOrEffect = weapon.damage;
                }
            }
        });
    }

    return character;
}
