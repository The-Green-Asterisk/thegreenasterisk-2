import { BaseArmorDefinition, BaseWeaponDefinition, WeaponMasteryProperty } from "./types";

export const WEAPON_MASTERIES: WeaponMasteryProperty[] = [
    {
        name: "Cleave",
        description: "If you hit a creature, you can make a melee attack roll against a second creature within 5 feet of the first that is also within reach. On a hit, the second creature takes the weapon's damage die (no ability modifier)."
    },
    {
        name: "Graze",
        description: "If your attack roll misses a creature, that creature still takes damage equal to the ability modifier you used for the attack roll (minimum 0 damage)."
    },
    {
        name: "Nick",
        description: "When you make the extra attack granted by the Light weapon property, you can make that attack as part of the Attack action instead of using a Bonus Action. (Once per turn)."
    },
    {
        name: "Push",
        description: "If you hit a creature, you can push it up to 10 feet straight away from you if it is Large or smaller."
    },
    {
        name: "Sap",
        description: "If you hit a creature, that creature has Disadvantage on its next attack roll before the start of your next turn."
    },
    {
        name: "Slow",
        description: "If you hit a creature and deal damage, you can reduce its Speed by 10 feet until the start of your next turn. If you hit it again, the reduction doesn't stack."
    },
    {
        name: "Topple",
        description: "If you hit a creature, you can force it to make a Constitution saving throw (DC = 8 + your Proficiency Bonus + the ability modifier used for the attack). On a failed save, the creature is knocked Prone."
    },
    {
        name: "Vex",
        description: "If you hit a creature and deal damage to it, you gain Advantage on your next attack roll against that creature before the end of your next turn."
    }
];

export const BASE_WEAPONS_2024: BaseWeaponDefinition[] = [
    // Simple Melee
    { name: "Club", category: "Simple Melee", damageDie: "1d4", damageType: "Bludgeoning", mastery: "Slow", properties: ["Light"], cost: "1 SP", weight: "2 lb." },
    { name: "Dagger", category: "Simple Melee", damageDie: "1d4", damageType: "Piercing", mastery: "Nick", properties: ["Finesse", "Light", "Thrown (20/60)"], range: "20/60 ft.", cost: "2 GP", weight: "1 lb." },
    { name: "Greatclub", category: "Simple Melee", damageDie: "1d8", damageType: "Bludgeoning", mastery: "Push", properties: ["Two-Handed"], cost: "2 SP", weight: "10 lb." },
    { name: "Handaxe", category: "Simple Melee", damageDie: "1d6", damageType: "Slashing", mastery: "Vex", properties: ["Light", "Thrown (20/60)"], range: "20/60 ft.", cost: "5 GP", weight: "2 lb." },
    { name: "Javelin", category: "Simple Melee", damageDie: "1d6", damageType: "Piercing", mastery: "Slow", properties: ["Thrown (30/120)"], range: "30/120 ft.", cost: "5 SP", weight: "2 lb." },
    { name: "Light Hammer", category: "Simple Melee", damageDie: "1d4", damageType: "Bludgeoning", mastery: "Nick", properties: ["Light", "Thrown (20/60)"], range: "20/60 ft.", cost: "2 GP", weight: "2 lb." },
    { name: "Mace", category: "Simple Melee", damageDie: "1d6", damageType: "Bludgeoning", mastery: "Sap", properties: [], cost: "5 GP", weight: "4 lb." },
    { name: "Quarterstaff", category: "Simple Melee", damageDie: "1d6", damageType: "Bludgeoning", mastery: "Topple", properties: ["Versatile (1d8)"], cost: "2 SP", weight: "4 lb." },
    { name: "Sickle", category: "Simple Melee", damageDie: "1d4", damageType: "Slashing", mastery: "Nick", properties: ["Light"], cost: "1 GP", weight: "2 lb." },
    { name: "Spear", category: "Simple Melee", damageDie: "1d6", damageType: "Piercing", mastery: "Sap", properties: ["Thrown (20/60)", "Versatile (1d8)"], range: "20/60 ft.", cost: "1 GP", weight: "3 lb." },

    // Simple Ranged
    { name: "Dart", category: "Simple Ranged", damageDie: "1d4", damageType: "Piercing", mastery: "Vex", properties: ["Finesse", "Thrown (20/60)"], range: "20/60 ft.", cost: "5 CP", weight: "1/4 lb." },
    { name: "Shortbow", category: "Simple Ranged", damageDie: "1d6", damageType: "Piercing", mastery: "Vex", properties: ["Ammunition (80/320)", "Two-Handed"], range: "80/320 ft.", cost: "25 GP", weight: "2 lb." },
    { name: "Sling", category: "Simple Ranged", damageDie: "1d4", damageType: "Bludgeoning", mastery: "Slow", properties: ["Ammunition (30/120)"], range: "30/120 ft.", cost: "1 SP", weight: "0 lb." },

    // Martial Melee
    { name: "Battleaxe", category: "Martial Melee", damageDie: "1d8", damageType: "Slashing", mastery: "Topple", properties: ["Versatile (1d10)"], cost: "10 GP", weight: "4 lb." },
    { name: "Flail", category: "Martial Melee", damageDie: "1d8", damageType: "Bludgeoning", mastery: "Sap", properties: [], cost: "10 GP", weight: "2 lb." },
    { name: "Glaive", category: "Martial Melee", damageDie: "1d10", damageType: "Slashing", mastery: "Graze", properties: ["Heavy", "Reach", "Two-Handed"], range: "Reach 10 ft.", cost: "20 GP", weight: "6 lb." },
    { name: "Greataxe", category: "Martial Melee", damageDie: "1d12", damageType: "Slashing", mastery: "Cleave", properties: ["Heavy", "Two-Handed"], cost: "30 GP", weight: "7 lb." },
    { name: "Greatsword", category: "Martial Melee", damageDie: "2d6", damageType: "Slashing", mastery: "Graze", properties: ["Heavy", "Two-Handed"], cost: "50 GP", weight: "6 lb." },
    { name: "Halberd", category: "Martial Melee", damageDie: "1d10", damageType: "Slashing", mastery: "Cleave", properties: ["Heavy", "Reach", "Two-Handed"], range: "Reach 10 ft.", cost: "20 GP", weight: "6 lb." },
    { name: "Lance", category: "Martial Melee", damageDie: "1d10", damageType: "Piercing", mastery: "Topple", properties: ["Heavy", "Reach", "Two-Handed"], range: "Reach 10 ft.", cost: "10 GP", weight: "6 lb." },
    { name: "Longsword", category: "Martial Melee", damageDie: "1d8", damageType: "Slashing", mastery: "Sap", properties: ["Versatile (1d10)"], cost: "15 GP", weight: "3 lb." },
    { name: "Maul", category: "Martial Melee", damageDie: "2d6", damageType: "Bludgeoning", mastery: "Topple", properties: ["Heavy", "Two-Handed"], cost: "10 GP", weight: "10 lb." },
    { name: "Morningstar", category: "Martial Melee", damageDie: "1d8", damageType: "Piercing", mastery: "Sap", properties: [], cost: "15 GP", weight: "4 lb." },
    { name: "Pike", category: "Martial Melee", damageDie: "1d10", damageType: "Piercing", mastery: "Push", properties: ["Heavy", "Reach", "Two-Handed"], range: "Reach 10 ft.", cost: "5 GP", weight: "18 lb." },
    { name: "Rapier", category: "Martial Melee", damageDie: "1d8", damageType: "Piercing", mastery: "Vex", properties: ["Finesse"], cost: "25 GP", weight: "2 lb." },
    { name: "Scimitar", category: "Martial Melee", damageDie: "1d6", damageType: "Slashing", mastery: "Nick", properties: ["Finesse", "Light"], cost: "25 GP", weight: "3 lb." },
    { name: "Shortsword", category: "Martial Melee", damageDie: "1d6", damageType: "Piercing", mastery: "Vex", properties: ["Finesse", "Light"], cost: "10 GP", weight: "2 lb." },
    { name: "Trident", category: "Martial Melee", damageDie: "1d8", damageType: "Piercing", mastery: "Topple", properties: ["Thrown (20/60)", "Versatile (1d10)"], range: "20/60 ft.", cost: "5 GP", weight: "4 lb." },
    { name: "Warhammer", category: "Martial Melee", damageDie: "1d8", damageType: "Bludgeoning", mastery: "Push", properties: ["Versatile (1d10)"], cost: "15 GP", weight: "5 lb." },
    { name: "War Pick", category: "Martial Melee", damageDie: "1d8", damageType: "Piercing", mastery: "Sap", properties: ["Versatile (1d10)"], cost: "5 GP", weight: "2 lb." },
    { name: "Whip", category: "Martial Melee", damageDie: "1d4", damageType: "Slashing", mastery: "Slow", properties: ["Finesse", "Reach"], range: "Reach 10 ft.", cost: "2 GP", weight: "3 lb." },

    // Martial Ranged
    { name: "Heavy Crossbow", category: "Martial Ranged", damageDie: "1d10", damageType: "Piercing", mastery: "Push", properties: ["Ammunition (100/400)", "Heavy", "Loading", "Two-Handed"], range: "100/400 ft.", cost: "50 GP", weight: "18 lb." },
    { name: "Hand Crossbow", category: "Martial Ranged", damageDie: "1d6", damageType: "Piercing", mastery: "Vex", properties: ["Ammunition (30/120)", "Light", "Loading"], range: "30/120 ft.", cost: "75 GP", weight: "3 lb." },
    { name: "Longbow", category: "Martial Ranged", damageDie: "1d8", damageType: "Piercing", mastery: "Slow", properties: ["Ammunition (150/600)", "Heavy", "Two-Handed"], range: "150/600 ft.", cost: "50 GP", weight: "2 lb." },
    { name: "Musket", category: "Martial Ranged", damageDie: "1d12", damageType: "Piercing", mastery: "Slow", properties: ["Ammunition (40/120)", "Loading", "Two-Handed"], range: "40/120 ft.", cost: "500 GP", weight: "10 lb." },
    { name: "Pistol", category: "Martial Ranged", damageDie: "1d10", damageType: "Piercing", mastery: "Vex", properties: ["Ammunition (30/90)", "Loading"], range: "30/90 ft.", cost: "250 GP", weight: "3 lb." }
];

export const BASE_ARMOR_2024: BaseArmorDefinition[] = [
    // Light Armor
    { name: "Padded Armor", category: "Light", baseAc: 11, dexBonus: "full", stealthDisadvantage: true, cost: "5 GP", weight: "8 lb." },
    { name: "Leather Armor", category: "Light", baseAc: 11, dexBonus: "full", cost: "10 GP", weight: "10 lb." },
    { name: "Studded Leather Armor", category: "Light", baseAc: 12, dexBonus: "full", cost: "45 GP", weight: "13 lb." },

    // Medium Armor
    { name: "Hide Armor", category: "Medium", baseAc: 12, dexBonus: "max2", cost: "10 GP", weight: "12 lb." },
    { name: "Chain Shirt", category: "Medium", baseAc: 13, dexBonus: "max2", cost: "50 GP", weight: "20 lb." },
    { name: "Scale Mail", category: "Medium", baseAc: 14, dexBonus: "max2", stealthDisadvantage: true, cost: "50 GP", weight: "45 lb." },
    { name: "Breastplate", category: "Medium", baseAc: 14, dexBonus: "max2", cost: "400 GP", weight: "20 lb." },
    { name: "Half Plate Armor", category: "Medium", baseAc: 15, dexBonus: "max2", stealthDisadvantage: true, cost: "750 GP", weight: "40 lb." },

    // Heavy Armor
    { name: "Ring Mail", category: "Heavy", baseAc: 14, dexBonus: "none", stealthDisadvantage: true, cost: "30 GP", weight: "40 lb." },
    { name: "Chain Mail", category: "Heavy", baseAc: 16, dexBonus: "none", strengthRequired: 13, stealthDisadvantage: true, cost: "75 GP", weight: "55 lb." },
    { name: "Splint Armor", category: "Heavy", baseAc: 17, dexBonus: "none", strengthRequired: 15, stealthDisadvantage: true, cost: "200 GP", weight: "60 lb." },
    { name: "Plate Armor", category: "Heavy", baseAc: 18, dexBonus: "none", strengthRequired: 15, stealthDisadvantage: true, cost: "1500 GP", weight: "65 lb." },

    // Shield
    { name: "Shield", category: "Shield", baseAc: 2, dexBonus: "none", cost: "10 GP", weight: "6 lb." }
];

export const STANDARD_PACKS = [
    {
        name: "Explorer's Pack",
        description: "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days of rations, waterskin, 50 ft hempen rope."
    },
    {
        name: "Dungeoneer's Pack",
        description: "Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days of rations, waterskin, 50 ft hempen rope."
    },
    {
        name: "Priest's Pack",
        description: "Backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks of incense, censer, vestments, 2 days of rations, waterskin."
    },
    {
        name: "Scholar's Pack",
        description: "Backpack, book of lore, bottle of ink, ink pen, 10 sheets of parchment, little bag of sand, small knife."
    },
    {
        name: "Burglar's Pack",
        description: "Backpack, bag of 1,000 ball bearings, 10 ft of string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks of oil, 5 days rations, tinderbox, waterskin."
    }
];
