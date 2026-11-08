import { OriginFeatDefinition } from "./types";

export const ORIGIN_FEATS_2024: OriginFeatDefinition[] = [
    {
        id: "alert",
        name: "Alert",
        description: "Always on the lookout for danger, you gain a bonus to initiative and can swap initiative rolls with willing allies.",
        benefits: [
            "Initiative Proficiency: You add your Proficiency Bonus to your Initiative rolls.",
            "Initiative Swap: Immediately after you roll initiative, you can swap your initiative with the initiative of one willing ally in the same combat who isn't Incapacitated."
        ]
    },
    {
        id: "crafter",
        name: "Crafter",
        description: "You are adept at crafting goods and negotiating trade discounts.",
        benefits: [
            "Tool Proficiency: You gain proficiency with three different Artisan's Tools of your choice.",
            "Discount: Whenever you buy a nonmagical item, you receive a 20 percent discount on it.",
            "Fast Crafting: When you craft an item using Artisan's Tools in which you have proficiency, the crafting time is reduced by 20 percent."
        ]
    },
    {
        id: "healer",
        name: "Healer",
        description: "You have the training and intuition to administer emergency medical aid.",
        benefits: [
            "Battle Medic: If you have a Healer's Kit, you can expend one use of it as an Action to tend to a creature within 5 feet. That creature can expend one of its Hit Point Dice, and you roll that die plus your Proficiency Bonus; the creature regains that number of Hit Points.",
            "Healing Rerolls: Whenever you roll a die to determine the number of Hit Points you restore with a spell or with Battle Medic, you can reroll the die if it rolls a 1, and you must use the new roll."
        ]
    },
    {
        id: "lucky",
        name: "Lucky",
        description: "You have an inexplicable streak of luck that seems to kick in at just the right moment.",
        benefits: [
            "Luck Points: You have a number of Luck Points equal to your Proficiency Bonus. You regain all spent Luck Points when you finish a Long Rest.",
            "Advantage: When you make a D20 Test, you can spend 1 Luck Point to give yourself Advantage on the roll.",
            "Disadvantage: When a creature rolls an attack roll against you, you can spend 1 Luck Point to give that attack roll Disadvantage."
        ]
    },
    {
        id: "magic-initiate-cleric",
        name: "Magic Initiate (Cleric)",
        description: "You learn the basics of clerical divine magic.",
        benefits: [
            "Two Cantrips: You learn two cantrips of your choice from the Cleric spell list (e.g. Guidance, Sacred Flame, Thaumaturgy).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Cleric spell list (e.g. Bless, Cure Wounds, Healing Word). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat)."
        ],
        spellcastingAbilityOptions: ["int", "wis", "cha"]
    },
    {
        id: "magic-initiate-druid",
        name: "Magic Initiate (Druid)",
        description: "You learn the basics of primal druidic magic.",
        benefits: [
            "Two Cantrips: You learn two cantrips of your choice from the Druid spell list (e.g. Druidcraft, Produce Flame, Shillelagh).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Druid spell list (e.g. Goodberry, Healing Word, Entangle). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat)."
        ],
        spellcastingAbilityOptions: ["int", "wis", "cha"]
    },
    {
        id: "magic-initiate-wizard",
        name: "Magic Initiate (Wizard)",
        description: "You learn the basics of arcane wizardly magic.",
        benefits: [
            "Two Cantrips: You learn two cantrips of your choice from the Wizard spell list (e.g. Fire Bolt, Mage Hand, Prestidigitation).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Wizard spell list (e.g. Shield, Find Familiar, Magic Missile). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat)."
        ],
        spellcastingAbilityOptions: ["int", "wis", "cha"]
    },
    {
        id: "musician",
        name: "Musician",
        description: "You are an inspiring performer whose music encourages your adventuring companions.",
        benefits: [
            "Instrument Proficiency: You gain proficiency with three Musical Instruments of your choice.",
            "Inspiring Song: As you finish a Short or Long Rest, you can play a song on a musical instrument with which you have proficiency and give Heroic Inspiration to a number of willing allies within 30 feet of you equal to your Proficiency Bonus."
        ]
    },
    {
        id: "savage-attacker",
        name: "Savage Attacker",
        description: "You know how to strike where it hurts most.",
        benefits: [
            "Reroll Weapon Damage: Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either result."
        ]
    },
    {
        id: "skilled",
        name: "Skilled",
        description: "You have exceptionally broad training across various disciplines.",
        benefits: [
            "Broad Training: You gain proficiency in any combination of three skills or tools of your choice."
        ]
    },
    {
        id: "tavern-brawler",
        name: "Tavern Brawler",
        description: "Accustomed to rough-and-tumble fighting using whatever is at hand.",
        benefits: [
            "Enhanced Unarmed Strike: When you hit with your Unarmed Strike, you deal 1d4 + your Strength modifier bludgeoning damage instead of 1.",
            "Damage Rerolls: Whenever you roll a 1 on a damage die for an Unarmed Strike, you can reroll the die and must use the new roll.",
            "Push: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage and also push the target 5 feet away from you.",
            "Furniture as Weapons: You have proficiency with Improvised Weapons."
        ]
    },
    {
        id: "tough",
        name: "Tough",
        description: "Your Hit Point maximum increases, making you resilient against lethal blows.",
        benefits: [
            "Increased Hit Points: Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a level thereafter, your Hit Point maximum increases by an additional 2 Hit Points."
        ]
    }
];
