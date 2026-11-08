import { ClassDefinition } from "./types";

// Standard Full Caster spell slots by level (1 to 20), columns = spell levels 1 to 9
export const FULL_CASTER_SLOTS: number[][] = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 1
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 2
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 3
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // Lvl 4
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // Lvl 5
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // Lvl 6
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // Lvl 7
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // Lvl 8
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // Lvl 9
    [4, 3, 3, 3, 2, 0, 0, 0, 0], // Lvl 10
    [4, 3, 3, 3, 2, 1, 0, 0, 0], // Lvl 11
    [4, 3, 3, 3, 2, 1, 0, 0, 0], // Lvl 12
    [4, 3, 3, 3, 2, 1, 1, 0, 0], // Lvl 13
    [4, 3, 3, 3, 2, 1, 1, 0, 0], // Lvl 14
    [4, 3, 3, 3, 2, 1, 1, 1, 0], // Lvl 15
    [4, 3, 3, 3, 2, 1, 1, 1, 0], // Lvl 16
    [4, 3, 3, 3, 2, 1, 1, 1, 1], // Lvl 17
    [4, 3, 3, 3, 3, 1, 1, 1, 1], // Lvl 18
    [4, 3, 3, 3, 3, 2, 1, 1, 1], // Lvl 19
    [4, 3, 3, 3, 3, 2, 2, 1, 1]  // Lvl 20
];

// 2024 Half Caster spell slots (Paladin & Ranger get slots at level 1!)
export const HALF_CASTER_SLOTS: number[][] = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 1
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 2
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 3
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 4
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 5
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 6
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // Lvl 7
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // Lvl 8
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // Lvl 9
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // Lvl 10
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // Lvl 11
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // Lvl 12
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // Lvl 13
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // Lvl 14
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // Lvl 15
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // Lvl 16
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // Lvl 17
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // Lvl 18
    [4, 3, 3, 3, 2, 0, 0, 0, 0], // Lvl 19
    [4, 3, 3, 3, 2, 0, 0, 0, 0]  // Lvl 20
];

export const CLASSES_2024: ClassDefinition[] = [
    {
        id: "barbarian",
        name: "Barbarian",
        description: "A fierce warrior driven by primal fury, entering battle in a battle rage.",
        hitDie: 12,
        primaryAbilities: ["str", "con"],
        savingThrows: ["str", "con"],
        armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
        weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
        weaponMasteryCount: 2,
        skillChoices: {
            count: 2,
            from: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"]
        },
        features: [
            { level: 1, name: "Rage", description: "You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor. You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . While active, your Rage follows the rules below. Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage. Rage Damage. When you make an attack using Strength-with either a weapon or an Unarmed Strike -and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table. Strength Advantage. You have Advantage on Strength checks and Strength saving throws. No Concentration or Spells. You can't maintain Concentration , and you can't cast spells. Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following: Make an attack roll against an enemy. Force an enemy to make a saving throw. Take a Bonus Action to extend your Rage. Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes." },
            { level: 1, name: "Unarmored Defense", description: "While you aren't wearing any armor, your base Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit." },
            { level: 1, name: "Weapon Mastery", description: "Your training with weapons allows you to use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Greataxes and Handaxes. Whenever you finish a Long Rest , you can practice weapon drills and change one of those weapon choices. When you reach certain Barbarian levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Barbarian Features table ." },
            { level: 2, name: "Danger Sense", description: "You gain an uncanny sense of when things aren't as they should be, giving you an edge when you dodge perils. You have Advantage on Dexterity saving throws unless you have the Incapacitated condition." },
            { level: 2, name: "Reckless Attack", description: "You can throw aside all concern for defense to attack with increased ferocity. When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you Advantage on attack rolls using Strength until the start of your next turn, but attack rolls against you have Advantage during that time." },
            { level: 3, name: "Barbarian Subclass", description: "You gain a Barbarian subclass of your choice. The Path of the Berserker subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Barbarian levels. For the rest of your career, you gain each of your subclass's features that are of your Barbarian level or lower." },
            { level: 3, name: "Primal Knowledge", description: "You gain proficiency in another skill of your choice from the skill list available to Barbarians at level 1 . In addition, while your Rage is active, you can channel primal power when you attempt certain tasks; whenever you make an ability check using one of the following skills, you can make it as a Strength check even if it normally uses a different ability: Acrobatics , Intimidation , Perception , Stealth , or Survival . When you use this ability, your Strength represents primal power coursing through you, honing your agility, bearing, and senses." },
            { level: 4, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Barbarian levels 8, 12, and 16." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action on your turn." },
            { level: 5, name: "Fast Movement", description: "Your speed increases by 10 feet while you aren't wearing Heavy armor." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Barbarian primal path." },
            { level: 7, name: "Feral Instinct", description: "Your instincts are so honed that you have Advantage on Initiative rolls." },
            { level: 7, name: "Instinctive Pounce", description: "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed." },
            { level: 8, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 9, name: "Brutal Strike", description: "If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn't have Disadvantage . If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike , and you can cause one Brutal Strike effect of your choice. You have the following effect options. Forceful Blow. The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks . Hamstring Blow. The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time-the most recent one." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Barbarian primal path." },
            { level: 11, name: "Relentless Rage", description: "Your Rage can keep you fighting despite grievous wounds. If you drop to 0 Hit Points while your Rage is active and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level. Each time you use this feature after the first, the DC increases by 5. When you finish a Short or Long Rest , the DC resets to 10." },
            { level: 12, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 13, name: "Improved Brutal Strike", description: "You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options. Staggering Blow. The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks until the start of your next turn. Sundering Blow. Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Barbarian primal path." },
            { level: 15, name: "Persistent Rage", description: "When you roll Initiative , you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can't do so again until you finish a Long Rest . In addition, your Rage is so fierce that it now lasts for 10 minutes without you needing to do anything to extend it from round to round. Your Rage ends early if you have the Unconscious condition (not just the Incapacitated condition) or don Heavy armor." },
            { level: 16, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 17, name: "Improved Brutal Strike", description: "The extra damage of your Brutal Strike increases to 2d10. In addition, you can use two different Brutal Strike effects whenever you use your Brutal Strike feature." },
            { level: 18, name: "Indomitable Might", description: "If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total." },
            { level: 19, name: "Epic Boon", description: "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended." },
            { level: 20, name: "Primal Champion", description: "You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25." }
        ],
        subclasses: [
            {
                id: "berserker",
                name: "Path of the Berserker",
                description: "Frenzy extra damage, Mindless Rage immune to Charmed/Frightened.",
                features: [
                    { level: 3, name: "Frenzy", description: "While raging, make an attack as a Bonus Action and deal extra Frenzy damage (1d6, scaling with level) on hit." },
                    { level: 6, name: "Mindless Rage", description: "You are immune to Charmed and Frightened while raging, and entering Rage immediately suspends both conditions." },
                    { level: 10, name: "Retaliation", description: "When you take damage from a creature within 5 feet of you, you can use a Reaction to make a melee attack against that creature." },
                    { level: 14, name: "Intimidating Presence", description: "Bonus Action to unleash a terrifying roar; creatures within 30 feet become Frightened on a failed Wisdom saving throw." }
                ]
            },
            {
                id: "wild-heart",
                name: "Path of the Wild Heart",
                description: "Aspects of Bear, Eagle, or Wolf augment your Rage.",
                features: [
                    { level: 3, name: "Rage of the Wilds", description: "Choose Bear (resistance to all damage except Force), Eagle (Dash and Disengage as Bonus Action), or Wolf (allies have Advantage on melee attacks against enemies within 5 ft) when entering Rage." },
                    { level: 6, name: "Aspect of the Beast", description: "Choose an animal aspect: Elephant (Athletics Advantage, doubled carrying capacity), Owl (Darkvision 60 ft, Perception Advantage), Panther (Climb speed equal to Speed), Pike (Swim speed equal to Speed), or Spider (Climb speed equal to Speed with spider climb)." },
                    { level: 10, name: "Nature Speaker", description: "You can cast Commune with Nature as a ritual without expending a spell slot." },
                    { level: 14, name: "Totemic Attunement", description: "Choose Falcon (gain a flying speed equal to your walking speed while raging), Lion (enemies within 5 ft have Disadvantage on attacks against targets other than you), or Ram (melee attacks knock Large or smaller creatures prone)." }
                ]
            },
            {
                id: "world-tree",
                name: "Path of the World Tree",
                description: "Vitality of the Tree gives temporary hit points and teleportation branches.",
                features: [
                    { level: 3, name: "Vitality of the Tree", description: "When you enter Rage and at the start of each of your turns while raging, grant temporary hit points equal to your Barbarian level to yourself or an ally within 10 feet." },
                    { level: 6, name: "Branches of the Tree", description: "Reaction when a creature ends its turn within 30 feet to teleport it to an unoccupied space within 5 feet of you and reduce its speed to 0 until the end of the turn." },
                    { level: 10, name: "Battering Roots", description: "Tendrils of the World Tree extend your melee reach by 10 feet when using Heavy or Versatile weapons, and you can apply Push or Topple on hit." },
                    { level: 14, name: "Travel Along the Tree", description: "As a Bonus Action while raging, teleport up to 60 feet to an unoccupied space you can see, bringing along up to 6 willing creatures within 10 feet." }
                ]
            },
            {
                id: "zealot",
                name: "Path of the Zealot",
                description: "Divine fury infuses weapon strikes with radiant or necrotic energy.",
                features: [
                    { level: 3, name: "Divine Fury", description: "The first creature you hit on each of your turns with a weapon attack while raging takes extra 1d6 + half Barbarian level Radiant or Necrotic damage." },
                    { level: 3, name: "Warrior of the Gods", description: "Spells that restore you to life (such as Revivify or Raise Dead) do not consume material components." },
                    { level: 6, name: "Fanatical Focus", description: "If you fail a saving throw while raging, you can reroll it and must use the new roll. Usable once per Rage." },
                    { level: 10, name: "Zealous Presence", description: "Bonus Action to inspire up to 10 allies within 60 feet, granting them Advantage on attack rolls and saving throws until the start of your next turn." },
                    { level: 14, name: "Rage of the Gods", description: "When reduced to 0 HP while raging, you do not drop unconscious and can continue fighting until your Rage ends." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Greataxe & Handaxes", items: ["Greataxe", "Handaxe (2)", "Explorer's Pack", "15 GP"] },
            { name: "Gold Purchase (75 GP)", items: ["75 GP"] }
        ]
    },
    {
        id: "bard",
        name: "Bard",
        description: "An inspiring magician whose power echoes the music of creation.",
        hitDie: 8,
        primaryAbilities: ["cha", "dex"],
        savingThrows: ["dex", "cha"],
        armorProficiencies: ["Light Armor"],
        weaponProficiencies: ["Simple Weapons"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 3,
            from: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"]
        },
        spellcasting: {
            ability: "cha",
            type: "full",
            cantripsKnownByLevel: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            preparedSpellsByLevel: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
            spellSlotsByLevel: FULL_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Bardic Inspiration", description: "You can supernaturally inspire others through words, music, or dance. This inspiration is represented by your Bardic Inspiration die, which is a d6. Using Bardic Inspiration. As a Bonus Action, you can inspire another creature within 60 feet of yourself who can see or hear you. That creature gains one of your Bardic Inspiration dice. A creature can have only one Bardic Inspiration die at a time. Once within the next hour when the creature fails a D20 Test , the creature can roll the Bardic Inspiration die and add the number rolled to the d20, potentially turning the failure into a success. A Bardic Inspiration die is expended when it's rolled. Number of Uses. You can confer a Bardic Inspiration die a number of times equal to your Charisma modifier (minimum of once), and you regain all expended uses when you finish a Long Rest . At Higher Levels. Your Bardic Inspiration die changes when you reach certain Bard levels, as shown in the Bardic Die column of the Bard Features table. The die becomes a d8 at level 5, a d10 at level 10, and a d12 at level 15." },
            { level: 1, name: "Spellcasting", description: "You have learned to cast spells through your bardic arts. See \" Spells \" for the rules on spellcasting. The information below details how you use those rules with Bard spells, which appear in the Bard spell list later in the class's description. Cantrips. You know two cantrips of your choice from the Bard spell list. Dancing Lights and Vicious Mockery are recommended. Whenever you gain a Bard level, you can replace one of your cantrips with another cantrip of your choice from the Bard spell list. When you reach Bard levels 4 and 10, you learn another cantrip of your choice from the Bard spell list, as shown in the Cantrips column of the Bard Features table . Spell Slots. The Bard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest . Prepared Spells of Level 1+. You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Bard spell list. Charm Person , Color Spray , Dissonant Whispers , and Healing Word are recommended. The number of spells on your list increases as you gain Bard levels, as shown in the Prepared Spells column of the Bard Features table . Whenever that number increases, choose additional spells from the Bard spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Bard, your list of prepared spells can include six spells of levels 1 and 2 in any combination. If another Bard feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Bard spells for you. Changing Your Prepared Spells. Whenever you gain a Bard level, you can replace one spell on your list with another Bard spell for which you have spell slots. Spellcasting Ability. Charisma is your spellcasting ability for your Bard spells. Spellcasting Focus. You can use a Musical Instrument as a Spellcasting Focus for your Bard spells." },
            { level: 2, name: "Expertise", description: "You gain Expertise (see the rules glossary ) in two of your skill proficiencies of your choice. Performance and Persuasion are recommended if you have proficiency in them. At Bard level 9, you gain Expertise in two more of your skill proficiencies of your choice." },
            { level: 2, name: "Jack of All Trades", description: "You can add half your Proficiency Bonus (round down) to any ability check you make that uses a skill proficiency you lack and that doesn't otherwise use your Proficiency Bonus. For example, if you make a Strength ( Athletics ) check and lack Athletics proficiency, you can add half your Proficiency Bonus to the check. A Bard's Repertoire Does your Bard beat a drum while chanting the deeds of ancient heroes? Strum a lute while crooning romantic tunes? Perform arias of stirring power? Recite dramatic monologues from classic tragedies? Use the rhythm of a folk dance to coordinate the movement of allies in battle? Compose naughty limericks? When you play a Bard, consider the style of artistic performance you favor, the moods you might invoke, and the themes that inspire your own creations. Are your poems inspired by moments of natural beauty, or are they brooding reflections on loss? Do you prefer lofty hymns or rowdy tavern songs? Are you drawn to laments for the fallen or celebrations of joy? Do you dance merry jigs or perform elaborate interpretive choreography? Do you focus on one style of performance or strive to master them all?" },
            { level: 3, name: "Bard Subclass", description: "You gain a Bard subclass of your choice. The College of Lore subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Bard levels. For the rest of your career, you gain each of your subclass's features that are of your Bard level or lower." },
            { level: 4, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Bard levels 8, 12, and 16." },
            { level: 5, name: "Font of Inspiration", description: "You now regain all your expended uses of Bardic Inspiration when you finish a Short or Long Rest . In addition, you can expend a spell slot (no action required) to regain one expended use of Bardic Inspiration." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Bard college." },
            { level: 7, name: "Countercharm", description: "You can use musical notes or words of power to disrupt mind-influencing effects. If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage ." },
            { level: 8, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 9, name: "Expertise", description: "You gain Expertise in two more of your skill proficiencies of your choice." },
            { level: 10, name: "Magical Secrets", description: "You've learned secrets from various magical traditions. Whenever you reach a Bard level (including this level) and the Prepared Spells number in the Bard Features table increases, you can choose any of your new prepared spells from the Bard , Cleric , Druid , and Wizard spell lists, and the chosen spells count as Bard spells for you (see a class's section for its spell list). In addition, whenever you replace a spell prepared for this class, you can replace it with a spell from those lists." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level Bard spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level Bard spell slots." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Bard college." },
            { level: 15, name: "8th-Level Spells", description: "You gain access to 8th-level Bard spell slots." },
            { level: 16, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level Bard spell slots." },
            { level: 18, name: "Superior Inspiration", description: "When you roll Initiative, you regain expended uses of Bardic Inspiration until you have two if you have fewer than that." },
            { level: 19, name: "Epic Boon", description: "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Spell Recall is recommended." },
            { level: 20, name: "Words of Creation", description: "You have mastered two of the Words of Creation: the words of life and death. You therefore always have the Power Word Heal and Power Word Kill spells prepared. When you cast either spell, you can target a second creature with it if that creature is within 10 feet of the first target." }
        ],
        subclasses: [
            {
                id: "dance",
                name: "College of Dance",
                description: "Unarmored Defense, Dazzling Footwork, Agile Strikes.",
                features: [
                    { level: 3, name: "Dazzling Footwork", description: "While not wearing armor or wielding a shield, your AC equals 10 + Dex modifier + Cha modifier. Unarmed strikes use your Bardic Inspiration die for damage, and granting Bardic Inspiration allows you to Dash and make an unarmed strike." },
                    { level: 6, name: "Inspiring Movement", description: "Reaction when an enemy ends its turn within 5 feet to move up to half your Speed without provoking opportunity attacks and allow an ally within 30 feet to move half their Speed." },
                    { level: 6, name: "Tandem Footwork", description: "When rolling Initiative, expend one use of Bardic Inspiration to add the die roll to your Initiative and the Initiative of allies within 60 feet." },
                    { level: 14, name: "Leading Escape", description: "Reaction when you or an ally within 5 feet must make a Dexterity saving throw to expend Bardic Inspiration and gain the benefits of Evasion." }
                ]
            },
            {
                id: "glamour",
                name: "College of Glamour",
                description: "Mantle of Inspiration, Enthralling Performance, Mantle of Majesty.",
                features: [
                    { level: 3, name: "Beguiling Magic", description: "Whenever you cast an Enchantment or Illusion spell, you can immediately cast Charm Person or Command without expending a spell slot." },
                    { level: 3, name: "Mantle of Inspiration", description: "Bonus Action to expend one Bardic Inspiration die and grant temporary hit points equal to 2x the die roll to allies within 60 feet, who can then move without opportunity attacks." },
                    { level: 6, name: "Mantle of Majesty", description: "Bonus Action to cast Command without expending a spell slot once per turn for 1 minute; charmed creatures automatically fail the saving throw." },
                    { level: 14, name: "Unbreakable Majesty", description: "Bonus Action to radiate majestic presence: attackers must make a Charisma saving throw or miss their attack, and target has Disadvantage on saving throws against your spells." }
                ]
            },
            {
                id: "lore",
                name: "College of Lore",
                description: "Cutting Words, 3 bonus proficiencies, Magical Discoveries.",
                features: [
                    { level: 3, name: "Bonus Proficiencies", description: "You gain proficiency in three skills of your choice." },
                    { level: 3, name: "Cutting Words", description: "Reaction when an enemy within 60 feet makes an attack roll, ability check, or damage roll to expend one Bardic Inspiration die and subtract the result from the roll." },
                    { level: 6, name: "Magical Discoveries", description: "Learn two spells of any class of a level you can cast. They count as prepared Bard spells and use Charisma." },
                    { level: 14, name: "Peerless Skill", description: "When you make an ability check or attack roll and fail, expend one Bardic Inspiration die and add the number rolled to the total." }
                ]
            },
            {
                id: "valor",
                name: "College of Valor",
                description: "Combat Inspiration, martial weapon proficiencies, Extra Attack.",
                features: [
                    { level: 3, name: "Combat Inspiration", description: "Allies can add your Bardic Inspiration die to weapon damage rolls or to Armor Class against an incoming attack." },
                    { level: 3, name: "Martial Training", description: "You gain proficiency with Martial weapons, Medium armor, and Shields. You can use a simple or martial weapon as a spellcasting focus for Bard spells." },
                    { level: 6, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action. You can replace one attack with a cantrip that has a casting time of 1 action." },
                    { level: 14, name: "Battle Magic", description: "When you use an action to cast a spell, you can make one weapon attack as a Bonus Action." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Rapier & Entertainer's Pack", items: ["Rapier", "Leather Armor", "Dagger", "Entertainer's Pack", "Musical Instrument", "18 GP"] },
            { name: "Gold Purchase (90 GP)", items: ["90 GP"] }
        ]
    },
    {
        id: "cleric",
        name: "Cleric",
        description: "A miraculous priest wielding divine magic in service of a deity or sacred cause.",
        hitDie: 8,
        primaryAbilities: ["wis", "str"],
        savingThrows: ["wis", "cha"],
        armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
        weaponProficiencies: ["Simple Weapons"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 2,
            from: ["History", "Insight", "Medicine", "Persuasion", "Religion"]
        },
        spellcasting: {
            ability: "wis",
            type: "full",
            cantripsKnownByLevel: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            preparedSpellsByLevel: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
            spellSlotsByLevel: FULL_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Spellcasting", description: "You have learned to cast spells through prayer and meditation. See \" Spells \" for the rules on spellcasting. The information below details how you use those rules with Cleric spells, which appear on the Cleric spell list later in the class's description. Cantrips. You know three cantrips of your choice from the Cleric spell list. Guidance , Sacred Flame , and Thaumaturgy are recommended. Whenever you gain a Cleric level, you can replace one of your cantrips with another cantrip of your choice from the Cleric spell list. When you reach Cleric levels 4 and 10, you learn another cantrip of your choice from the Cleric spell list, as shown in the Cantrips column of the Cleric Features table . Spell Slots. The Cleric Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest . Prepared Spells of Level 1+. You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Cleric spell list. Bless , Cure Wounds , Guiding Bolt , and Shield of Faith are recommended. The number of spells on your list increases as you gain Cleric levels, as shown in the Prepared Spells column of the Cleric Features table . Whenever that number increases, choose additional spells from the Cleric spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Cleric, your list of prepared spells can include six spells of levels 1 and 2 in any combination. If another Cleric feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Cleric spells for you. Changing Your Prepared Spells. Whenever you finish a Long Rest , you can change your list of prepared spells, replacing any of the spells there with other Cleric spells for which you have spell slots. Spellcasting Ability. Wisdom is your spellcasting ability for your Cleric spells. Spellcasting Focus. You can use a Holy Symbol as a Spellcasting Focus for your Cleric spells." },
            { level: 1, name: "Divine Order", description: "You have dedicated yourself to one of the following sacred roles of your choice. Protector. Trained for battle, you gain proficiency with Martial weapons and training with Heavy armor. Thaumaturge. You know one extra cantrip from the Cleric spell list . In addition, your mystical connection to the divine gives you a bonus to your Intelligence ( Arcana or Religion ) checks. The bonus equals your Wisdom modifier (minimum of +1)." },
            { level: 2, name: "Channel Divinity", description: "You can channel divine energy directly from the Outer Planes to fuel magical effects. You start with two such effects: Divine Spark and Turn Undead, each of which is described below. Each time you use this class's Channel Divinity, choose which Channel Divinity effect from this class to create. You gain additional effect options at higher Cleric levels. You can use this class's Channel Divinity twice. You regain one of its expended uses when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . You gain additional uses when you reach certain Cleric levels, as shown in the Channel Divinity column of the Cleric Features table . If a Channel Divinity effect requires a saving throw, the DC equals the spell save DC from this class's Spellcasting feature. Divine Spark. As a Magic action, you point your Holy Symbol at another creature you can see within 30 feet of yourself and focus divine energy at it. Roll 1d8 and add your Wisdom modifier. You either restore Hit Points to the creature equal to that total or force the creature to make a Constitution saving throw. On a failed save, the creature takes Necrotic or Radiant damage (your choice) equal to that total. On a successful save, the creature takes half as much damage (round down). You roll an additional d8 when you reach Cleric levels 7 (2d8), 13 (3d8), and 18 (4d8). Turn Undead. As a Magic action, you present your Holy Symbol and censure Undead creatures. Each Undead of your choice within 30 feet of you must make a Wisdom saving throw. If the creature fails its save, it has the Frightened and Incapacitated conditions for 1 minute. For that duration, it tries to move as far from you as it can on its turns. This effect ends early on the creature if it takes any damage, if you have the Incapacitated condition, or if you die." },
            { level: 3, name: "Cleric Subclass", description: "You gain a Cleric subclass of your choice. The Life Domain subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Cleric levels. For the rest of your career, you gain each of your subclass's features that are of your Cleric level or lower." },
            { level: 4, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Cleric levels 8, 12, and 16." },
            { level: 5, name: "Sear Undead", description: "Whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier (minimum of 1d8) and add the rolls together. Each Undead that fails its saving throw against that use of Turn Undead takes Radiant damage equal to the roll's total. This damage doesn't end the turn effect." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Divine Domain." },
            { level: 7, name: "Blessed Strikes", description: "Divine power infuses you in battle. You gain one of the following options of your choice (if you get either option from a Cleric subclass in an older book, use only the option you choose for this feature). Divine Strike. Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to take an extra 1d8 Necrotic or Radiant damage (your choice). Potent Spellcasting. Add your Wisdom modifier to the damage you deal with any Cleric cantrip." },
            { level: 8, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level Cleric spell slots." },
            { level: 10, name: "Divine Intervention", description: "You can call on your deity or pantheon to intervene on your behalf. As a Magic action, choose any Cleric spell of level 5 or lower that doesn't require a Reaction to cast. As part of the same action, you cast that spell without expending a spell slot or needing Material components. You can't use this feature again until you finish a Long Rest ." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level Cleric spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level Cleric spell slots." },
            { level: 14, name: "Improved Blessed Strikes", description: "The option you chose for Blessed Strikes grows more powerful. Divine Strike. The extra damage of your Divine Strike increases to 2d8. Potent Spellcasting. When you cast a Cleric cantrip and deal damage to a creature with it, you can give vitality to yourself or another creature within 60 feet of yourself, granting a number of Temporary Hit Points equal to twice your Wisdom modifier." },
            { level: 15, name: "8th-Level Spells", description: "You gain access to 8th-level Cleric spell slots." },
            { level: 16, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 17, name: "Subclass Feature", description: "Gain a feature granted by your chosen Divine Domain." },
            { level: 18, name: "Channel Divinity (4/Rest)", description: "You can use your Channel Divinity four times between rests." },
            { level: 19, name: "Epic Boon", description: "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Fate is recommended." },
            { level: 20, name: "Greater Divine Intervention", description: "You can call on even more powerful divine intervention. When you use your Divine Intervention feature, you can choose Wish when you select a spell. If you do so, you can't use Divine Intervention again until you finish 2d4 Long Rests ." }
        ],
        subclasses: [
            {
                id: "life",
                name: "Life Domain",
                description: "Disciple of Life boosts healing spells, Preserve Life Channel Divinity.",
                features: [
                    { level: 3, name: "Disciple of Life", description: "Whenever you cast a spell that restores hit points, the target regains additional hit points equal to 2 + the spell's level." },
                    { level: 3, name: "Preserve Life", description: "Channel Divinity to restore hit points equal to 5 times your Cleric level, divided among injured allies within 30 feet, restoring up to half their maximum HP." },
                    { level: 6, name: "Blessed Healer", description: "Whenever you cast a spell of level 1 or higher that restores hit points to another creature, you regain hit points equal to 2 + the spell's level." },
                    { level: 17, name: "Supreme Healing", description: "When you would normally roll one or more dice to restore hit points with a spell, you instead use the highest number possible for each die." }
                ]
            },
            {
                id: "light",
                name: "Light Domain",
                description: "Warding Flare imposes disadvantage, Radiance of the Dawn radiant blast.",
                features: [
                    { level: 3, name: "Radiance of the Dawn", description: "Channel Divinity to dispel magical darkness within 30 feet and deal 2d10 + Cleric level radiant damage to hostiles in the area (Con save halves)." },
                    { level: 3, name: "Warding Flare", description: "Reaction when attacked by a creature within 30 feet to impose Disadvantage on the attack roll with a flash of light." },
                    { level: 6, name: "Improved Warding Flare", description: "You can use your Warding Flare feature when a creature within 30 feet attacks an ally you can see." },
                    { level: 17, name: "Corona of Light", description: "Action to emit an aura of sunlight for 1 minute: enemies within 60 feet have Disadvantage on saving throws against spells that deal radiant or fire damage." }
                ]
            },
            {
                id: "trickery",
                name: "Trickery Domain",
                description: "Invoke Duplicity illusion clone, Blessing of the Trickster stealth.",
                features: [
                    { level: 3, name: "Blessing of the Trickster", description: "Action to touch a willing creature and grant it Advantage on Dexterity (Stealth) checks for 1 hour." },
                    { level: 3, name: "Invoke Duplicity", description: "Bonus Action to expend Channel Divinity and create an illusionary duplicate of yourself within 30 feet. You can cast spells through it and gain Advantage on attack rolls against creatures within 5 feet of it." },
                    { level: 6, name: "Trickster's Transposition", description: "Bonus Action to magically swap places with your illusionary duplicate, teleporting up to 30 feet." },
                    { level: 17, name: "Improved Duplicity", description: "You can create up to four illusionary duplicates, and allies gain Advantage on attack rolls while near any duplicate." }
                ]
            },
            {
                id: "war",
                name: "War Domain",
                description: "War Priest bonus action attack, Guided Strike +10 to hit.",
                features: [
                    { level: 3, name: "Guided Strike", description: "Channel Divinity to gain a +10 bonus to an attack roll made by you or an ally within 30 feet." },
                    { level: 3, name: "War Priest", description: "Whenever you take the Attack action, you can make an additional weapon attack as a Bonus Action Wisdom modifier times per Long Rest." },
                    { level: 6, name: "War God's Blessing", description: "You can expend a use of Channel Divinity to cast Shield of Faith or Spiritual Weapon without expending a spell slot." },
                    { level: 17, name: "Avatar of Battle", description: "You gain resistance to Bludgeoning, Piercing, and Slashing damage from nonmagical attacks." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Mace, Chain Shirt & Shield", items: ["Mace", "Chain Shirt", "Shield", "Holy Symbol", "Priest's Pack", "7 GP"] },
            { name: "Gold Purchase (110 GP)", items: ["110 GP"] }
        ]
    },
    {
        id: "druid",
        name: "Druid",
        description: "A priest of the Old Faith, wielding the elemental forces of nature and beast forms.",
        hitDie: 8,
        primaryAbilities: ["wis", "con"],
        savingThrows: ["int", "wis"],
        armorProficiencies: ["Light Armor", "Shields"],
        weaponProficiencies: ["Simple Weapons"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 2,
            from: ["Arcana", "Animal Handling", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"]
        },
        spellcasting: {
            ability: "wis",
            type: "full",
            cantripsKnownByLevel: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            preparedSpellsByLevel: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
            spellSlotsByLevel: FULL_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Spellcasting", description: "You have learned to cast spells through studying the mystical forces of nature. See \" Spells \" for the rules on spellcasting. The information below details how you use those rules with Druid spells, which appear on the Druid spell list later in the class's description. Cantrips. You know two cantrips of your choice from the Druid spell list. Druidcraft and Produce Flame are recommended. Whenever you gain a Druid level, you can replace one of your cantrips with another cantrip of your choice from the Druid spell list. When you reach Druid levels 4 and 10, you learn another cantrip of your choice from the Druid spell list, as shown in the Cantrips column of the Druid Features table. Spell Slots. The Druid Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest . Prepared Spells of Level 1+. You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Druid spell list. Animal Friendship , Cure Wounds , Faerie Fire , and Thunderwave are recommended. The number of spells on your list increases as you gain Druid levels, as shown in the Prepared Spells column of the Druid Features table. Whenever that number increases, choose additional spells from the Druid spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Druid, your list of prepared spells can include six spells of levels 1 and 2 in any combination. If another Druid feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Druid spells for you. Changing Your Prepared Spells. Whenever you finish a Long Rest , you can change your list of prepared spells, replacing any of the spells with other Druid spells for which you have spell slots. Spellcasting Ability. Wisdom is your spellcasting ability for your Druid spells. Spellcasting Focus. You can use a Druidic Focus as a Spellcasting Focus for your Druid spells." },
            { level: 1, name: "Druidic", description: "You know Druidic, the secret language of Druids. While learning this ancient tongue, you also unlocked the magic of communicating with animals; you always have the Speak with Animals spell prepared. You can use Druidic to leave hidden messages. You and others who know Druidic automatically spot such a message. Others spot the message's presence with a successful DC 15 Intelligence ( Investigation ) check but can't decipher it without magic." },
            { level: 1, name: "Primal Order", description: "You have dedicated yourself to one of the following sacred roles of your choice. Magician. You know one extra cantrip from the Druid spell list . In addition, your mystical connection to nature gives you a bonus to your Intelligence ( Arcana or Nature ) checks. The bonus equals your Wisdom modifier (minimum bonus of +1). Warden. Trained for battle, you gain proficiency with Martial weapons and training with Medium armor." },
            { level: 2, name: "Wild Shape", description: "The power of nature allows you to assume the form of an animal. As a Bonus Action, you shape-shift into a Beast form that you have learned for this feature (see \"Known Forms\" below). You stay in that form for a number of hours equal to half your Druid level or until you use Wild Shape again, have the Incapacitated condition, or die. You can also leave the form early as a Bonus Action. Number of Uses. You can use Wild Shape twice. You regain one expended use when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . You gain additional uses when you reach certain Druid levels, as shown in the Wild Shape column of the Druid Features table . Known Forms. You know four Beast forms for this feature, chosen from among Beast stat blocks that have a maximum Challenge Rating of 1/4 and that lack a Fly Speed (see appendix B for stat block options). The Rat , Riding Horse , Spider , and Wolf are recommended. Whenever you finish a Long Rest , you can replace one of your known forms with another eligible form. When you reach certain Druid levels, your number of known forms and the maximum Challenge Rating for those forms increases, as shown in the Beast Shapes table. In addition, starting at level 8, you can adopt a form that has a Fly Speed. When choosing known forms, you may look in the Monster Manual or elsewhere for eligible Beasts if the Dungeon Master permits you to do so. Beast Shapes Druid Level Known Forms Max CR Fly Speed 2 4 1/4 No 4 6 1/2 No 8 8 1 Yes Rules While Shape-Shifted. While in a form, you retain your personality, memories, and ability to speak, and the following rules apply: Temporary Hit Points. When you assume a Wild Shape form, you gain a number of Temporary Hit Points equal to your Druid level. Game Statistics. Your game statistics are replaced by the Beast's stat block, but you retain your creature type; Hit Points; Hit Point Dice; Intelligence, Wisdom, and Charisma scores; class features; languages; and feats. You also retain your skill and saving throw proficiencies and use your Proficiency Bonus for them, in addition to gaining the proficiencies of the creature. If a skill or saving throw modifier in the Beast's stat block is higher than yours, use the one in the stat block. No Spellcasting. You can't cast spells, but shape-shifting doesn't break your Concentration or otherwise interfere with a spell you've already cast. Objects. Your ability to handle objects is determined by the form's limbs rather than your own. In addition, you choose whether your equipment falls in your space, merges into your new form, or is worn by it. Worn equipment functions as normal, but the DM decides whether it's practical for the new form to wear a piece of equipment based on the creature's size and shape. Your equipment doesn't change size or shape to match the new form, and any equipment that the new form can't wear must either fall to the ground or merge with the form. Equipment that merges with the form has no effect while you're in that form." },
            { level: 2, name: "Wild Companion", description: "You can summon a nature spirit that assumes an animal form to aid you. As a Magic action, you can expend a spell slot or a use of Wild Shape to cast the Find Familiar spell without Material components. When you cast the spell in this way, the familiar is Fey and disappears when you finish a Long Rest ." },
            { level: 3, name: "Druid Subclass", description: "You gain a Druid subclass of your choice. The Circle of the Land subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Druid levels. For the rest of your career, you gain each of your subclass's features that are of your Druid level or lower." },
            { level: 4, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Druid levels 8, 12, and 16." },
            { level: 5, name: "Wild Resurgence", description: "Once on each of your turns, if you have no uses of Wild Shape left, you can give yourself one use by expending a spell slot (no action required). In addition, you can expend one use of Wild Shape (no action required) to give yourself a level 1 spell slot, but you can't do so again until you finish a Long Rest ." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Druid circle." },
            { level: 7, name: "Elemental Fury", description: "The might of the elements flows through you. You gain one of the following options of your choice. Potent Spellcasting. Add your Wisdom modifier to the damage you deal with any Druid cantrip. Primal Strike. Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form's attack in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage (choose when you hit)." },
            { level: 8, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level Druid spell slots." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Druid circle." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level Druid spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level Druid spell slots." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Druid circle." },
            { level: 15, name: "Improved Elemental Fury", description: "The option you chose for Elemental Fury grows more powerful, as detailed below. Potent Spellcasting. When you cast a Druid cantrip with a range of 10 feet or greater, the spell's range increases by 300 feet. Primal Strike. The extra damage of your Primal Strike increases to 2d8." },
            { level: 16, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level Druid spell slots." },
            { level: 18, name: "Beast Spells", description: "While using Wild Shape, you can cast spells in Beast form, except for any spell that has a Material component with a cost specified or that consumes its Material component." },
            { level: 19, name: "Epic Boon", description: "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Dimensional Travel is recommended." },
            { level: 20, name: "Archdruid", description: "The vitality of nature constantly blooms within you, granting you the following benefits. Evergreen Wild Shape. Whenever you roll Initiative and have no uses of Wild Shape left, you regain one expended use of it. Nature Magician. You can convert uses of Wild Shape into a spell slot (no action required). Choose a number of your unexpended uses of Wild Shape and convert them into a single spell slot, with each use contributing 2 spell levels. For example, if you convert two uses of Wild Shape, you produce a level 4 spell slot. Once you use this benefit, you can't do so again until you finish a Long Rest . Longevity. The primal magic that you wield causes you to age more slowly. For every ten years that pass, your body ages only one year." }
        ],
        subclasses: [
            {
                id: "moon",
                name: "Circle of the Moon",
                description: "Combat Wild Shape, Circle Forms with enhanced armor and radiant strikes.",
                features: [
                    { level: 3, name: "Combat Wild Shape", description: "You can transform as a Bonus Action and gain temporary hit points equal to 3x your Druid level. While transformed, your Armor Class equals 13 + your Wisdom modifier if higher than the beast's normal AC." },
                    { level: 3, name: "Circle Forms", description: "You can transform into beasts with a Challenge Rating as high as your Druid level divided by 3 (rounded down). Your beast attacks can deal Radiant damage instead of normal damage." },
                    { level: 6, name: "Improved Circle Forms", description: "While in Wild Shape, your Armor Class equals 13 + your Wisdom modifier if that is higher than the beast's AC, and you add your Wisdom modifier to Constitution saving throws." },
                    { level: 6, name: "Moonlight Step", description: "As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see. You gain Advantage on the next attack roll you make before the end of this turn. You can use this feature a number of times equal to your Wisdom modifier per Long Rest." },
                    { level: 10, name: "Moonlight Strike", description: "While in Wild Shape, the radiant damage of your attacks increases by 1d8, and you can cast Moonbeam without spell components." },
                    { level: 14, name: "Lunar Form", description: "Once per turn when you teleport with Moonlight Step, you can choose to make one ally within 10 feet teleport with you." }
                ]
            },
            {
                id: "land",
                name: "Circle of the Land",
                description: "Biome affinity (Arid, Polar, Temperate, Tropical), Natural Recovery.",
                features: [
                    { level: 3, name: "Circle of the Land Spells", description: "Choose a biome affinity (Arid, Polar, Temperate, or Tropical) whenever you finish a Long Rest, gaining prepared spells associated with that land." },
                    { level: 6, name: "Land's Aid", description: "As a Magic action, expend a use of Wild Shape to make flowers and thorny vines erupt in a 10-foot-radius sphere within 60 feet. Enemies take 2d6 Necrotic damage (Con save halves), and one ally regains 2d6 HP." },
                    { level: 6, name: "Natural Recovery", description: "During a Short Rest, you can recover expended spell slots with a combined level up to half your Druid level (rounded up)." },
                    { level: 10, name: "Natural Sanctuary", description: "Creatures of the beast and plant types have difficulty attacking you, and you are immune to poison damage." },
                    { level: 14, name: "Nature's Sanctuary", description: "You can call forth a spectral tree that shelters you and your allies with half cover and resistance to selected damage types." }
                ]
            },
            {
                id: "sea",
                name: "Circle of the Sea",
                description: "Wrath of the Sea tempest aura, aquatic affinity.",
                features: [
                    { level: 3, name: "Wrath of the Sea", description: "As a Bonus Action, expend a use of Wild Shape to manifest a 10-foot aura of ocean spray and thunder for 10 minutes. Once per turn when a creature ends its turn in the aura, you can deal Thunder/Cold damage." },
                    { level: 6, name: "Aquatic Affinity", description: "You gain a Swimming Speed equal to your Walking Speed, and you can breathe underwater. While your Wrath of the Sea is active, you gain a Flying Speed equal to your Walking Speed." },
                    { level: 10, name: "Stormborn", description: "Your Wrath of the Sea aura increases to 20 feet, and you gain resistance to Cold, Lightning, and Thunder damage." },
                    { level: 14, name: "Oceanic Tempest", description: "You can manifest your Wrath of the Sea twice as powerful or grant its benefits to an ally within 60 feet." }
                ]
            },
            {
                id: "stars",
                name: "Circle of the Stars",
                description: "Star Map, Starry Form (Archer, Chalice, Dragon), Cosmic Omen.",
                features: [
                    { level: 3, name: "Star Map", description: "You create a celestial map that serves as your spellcasting focus and grants you the Guidance cantrip and free castings of Guiding Bolt." },
                    { level: 3, name: "Starry Form", description: "As a Bonus Action, expend a use of Wild Shape to assume a constellation form: Archer (Bonus Action radiant ranged attack), Chalice (bonus healing to another target), or Dragon (minimum 10 on Int/Wis checks and Con saves)." },
                    {
                        level: 6,
                        name: "Cosmic Omen",
                        description: "Whenever you finish a Long Rest, you can consult your Star Map for omens and roll a die. Until you finish your next Long Rest, you gain access to a special Reaction based on whether you rolled an even or an odd number on the die:\n\nWeal (Even). Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a Reaction to roll 1d6 and add the number rolled to the total.\n\nWoe (Odd). Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a Reaction to roll 1d6 and subtract the number rolled from the total.\n\nYou can use this Reaction a number of times equal to your Wisdom modifier (minimum of once), and you regain all expended uses when you finish a Long Rest."
                    },
                    { level: 10, name: "Twinkling Constellations", description: "The Archer and Chalice dice increase to 2d8. At the start of each of your turns in Starry Form, you can switch which constellation form is active." },
                    { level: 14, name: "Full of Stars", description: "While in Starry Form, your body becomes partially incorporeal, granting you resistance to Bludgeoning, Piercing, and Slashing damage." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Scimitar, Leather & Shield", items: ["Scimitar", "Leather Armor", "Shield", "Druidic Focus", "Explorer's Pack", "9 GP"] },
            { name: "Gold Purchase (50 GP)", items: ["50 GP"] }
        ]
    },
    {
        id: "fighter",
        name: "Fighter",
        description: "A master of martial combat, skilled with an unmatched variety of armor and weapons.",
        hitDie: 10,
        primaryAbilities: ["str", "dex", "con"],
        savingThrows: ["str", "con"],
        armorProficiencies: ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"],
        weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
        weaponMasteryCount: 3,
        skillChoices: {
            count: 2,
            from: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"]
        },
        features: [
            { level: 1, name: "Fighting Style", description: "You have honed your martial prowess and gain a Fighting Style feat of your choice (see \" Feats \"). Defense is recommended. Whenever you gain a Fighter level, you can replace the feat you chose with a different Fighting Style feat." },
            { level: 1, name: "Second Wind", description: "You have a limited well of physical and mental stamina that you can draw on. As a Bonus Action, you can use it to regain Hit Points equal to 1d10 plus your Fighter level. You can use this feature twice. You regain one expended use when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . When you reach certain Fighter levels, you gain more uses of this feature, as shown in the Second Wind column of the Fighter Features table ." },
            { level: 1, name: "Weapon Mastery", description: "Your training with weapons allows you to use the mastery properties of three kinds of Simple or Martial weapons of your choice. Whenever you finish a Long Rest , you can practice weapon drills and change one of those weapon choices. When you reach certain Fighter levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Fighter Features table ." },
            { level: 2, name: "Action Surge", description: "You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action, except the Magic action. Once you use this feature, you can't do so again until you finish a Short or Long Rest . Starting at level 17, you can use it twice before a rest but only once on a turn." },
            { level: 2, name: "Tactical Mind", description: "You have a mind for tactics on and off the battlefield. When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining Hit Points, you roll 1d10 and add the number rolled to the ability check, potentially turning it into a success. If the check still fails, this use of Second Wind isn't expended." },
            { level: 3, name: "Fighter Subclass", description: "You gain a Fighter subclass of your choice. The Champion subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Fighter levels. For the rest of your career, you gain each of your subclass's features that are of your Fighter level or lower." },
            { level: 4, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Fighter levels 6, 8, 12, 14, and 16." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action on your turn." },
            { level: 5, name: "Tactical Shift", description: "Whenever you activate your Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks ." },
            { level: 6, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 7, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 8, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 9, name: "Indomitable", description: "If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll, and you can't use this feature again until you finish a Long Rest . You can use this feature twice before a Long Rest starting at level 13 and three times before a Long Rest starting at level 17." },
            { level: 9, name: "Tactical Master", description: "When you attack with a weapon whose mastery property you can use, you can replace that property with the Push , Sap , or Slow property for that attack." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 11, name: "Two Extra Attacks", description: "You can attack three times instead of once whenever you take the Attack action on your turn." },
            { level: 12, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 13, name: "Studied Attacks", description: "You study your opponents and learn from each attack you make. If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn." },
            { level: 14, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 15, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 16, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 17, name: "Action Surge (2 uses) & Indomitable (3 uses)", description: "You can use Action Surge twice before a rest, but only once on a turn. You can also use Indomitable three times between Long Rests." },
            { level: 18, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 19, name: "Epic Boon", description: "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Combat Prowess is recommended." },
            { level: 20, name: "Three Extra Attacks", description: "You can attack four times instead of once whenever you take the Attack action on your turn." }
        ],
        subclasses: [
            {
                id: "battle-master",
                name: "Battle Master",
                description: "Maneuvers and Superiority Dice (d8s) to trip, disarm, or rally allies.",
                features: [
                    { level: 3, name: "Combat Superiority", description: "You learn 3 tactical Maneuvers fueled by four Superiority Dice (d8s). Maneuvers add tactical effects to attacks and checks and recharge on a Short or Long Rest." },
                    { level: 3, name: "Student of War", description: "You gain proficiency with one type of artisan's tools and one skill of your choice." },
                    { level: 7, name: "Know Your Enemy", description: "Bonus Action to discern an enemy's damage resistances, damage immunities, damage vulnerabilities, or Armor Class." },
                    { level: 10, name: "Improved Combat Superiority", description: "Your Superiority Dice turn into d10s." },
                    { level: 15, name: "Relentless", description: "When you roll Initiative and have no Superiority Dice remaining, you regain one Superiority Die." },
                    { level: 18, name: "Ultimate Combat Superiority", description: "Your Superiority Dice turn into d12s." }
                ]
            },
            {
                id: "champion",
                name: "Champion",
                description: "Improved Critical (19-20), Remarkable Athlete, Heroic Warrior inspiration.",
                features: [
                    { level: 3, name: "Improved Critical", description: "Your weapon attacks score a critical hit on a roll of 19 or 20 on the d20." },
                    { level: 3, name: "Remarkable Athlete", description: "You gain Advantage on Initiative rolls and Strength (Athletics) checks, and your running jump distance increases." },
                    { level: 7, name: "Additional Fighting Style", description: "You gain a second Fighting Style feat of your choice." },
                    { level: 10, name: "Heroic Warrior", description: "Whenever you start your turn in combat without Heroic Inspiration, you gain Heroic Inspiration." },
                    { level: 15, name: "Superior Critical", description: "Your weapon attacks score a critical hit on a roll of 18, 19, or 20 on the d20." },
                    { level: 18, name: "Survivor", description: "At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left." }
                ]
            },
            {
                id: "eldritch-knight",
                name: "Eldritch Knight",
                description: "Arcane spellcasting (Wizard spells), Weapon Bond, War Magic.",
                features: [
                    { level: 3, name: "Spellcasting", description: "Cast wizard spells using Intelligence. Prepare spells from any school of magic and cast cantrips." },
                    { level: 3, name: "Weapon Bond", description: "Bond with up to two weapons. You cannot be disarmed of them, and you can summon them to your hand as a Bonus Action." },
                    { level: 7, name: "War Magic", description: "When you take the Attack action, you can replace one of your attacks with a wizard cantrip." },
                    { level: 10, name: "Eldritch Strike", description: "When you hit a creature with a weapon attack, that creature has Disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn." },
                    { level: 15, name: "Arcane Charge", description: "When you use your Action Surge, you can teleport up to 30 feet to an unoccupied space you can see before or after the extra action." },
                    { level: 18, name: "Improved War Magic", description: "When you take the Attack action, you can replace two of your attacks with a 1st- or 2nd-level wizard spell." }
                ]
            },
            {
                id: "psi-warrior",
                name: "Psi Warrior",
                description: "Psionic Power energy dice for telekinetic strikes and protective barriers.",
                features: [
                    { level: 3, name: "Psionic Power", description: "Harbor a pool of Psionic Energy dice (equal to 2x your PB) to power Protective Field (reduce damage), Psionic Strike (deal extra force damage), and Telekinetic Movement (move objects/allies)." },
                    { level: 7, name: "Telekinetic Adept", description: "Psi-Powered Leap grants a flying speed equal to twice your walking speed; Telekinetic Thrust knocks prone or shoves enemies up to 10 feet on hit." },
                    { level: 10, name: "Guarded Mind", description: "You gain resistance to Psychic damage, and you can expend a Psionic Energy die to end the Charmed or Frightened condition on yourself." },
                    { level: 15, name: "Bulwark of Force", description: "Bonus Action to shield yourself and allies within 30 feet with half cover for 1 minute." },
                    { level: 18, name: "Telekinetic Master", description: "Cast Telekinesis once per Long Rest without expending a spell slot, and make a weapon attack as a Bonus Action while concentrating on it." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Chain Mail, Longsword & Shield", items: ["Chain Mail", "Longsword", "Shield", "Crossbow, Light", "Crossbow Bolts (20)", "Dungeoneer's Pack", "9 GP"] },
            { name: "Leather Armor, Longbow & Two Shortswords", items: ["Leather Armor", "Longbow", "Arrows (20)", "Shortsword (2)", "Explorer's Pack", "11 GP"] },
            { name: "Gold Purchase (155 GP)", items: ["155 GP"] }
        ]
    },
    {
        id: "monk",
        name: "Monk",
        description: "A martial artist who harnesses inner ki/focus to achieve supernatural speed and strikes.",
        hitDie: 8,
        primaryAbilities: ["dex", "wis"],
        savingThrows: ["str", "dex"],
        armorProficiencies: [],
        weaponProficiencies: ["Simple Weapons", "Martial Weapons with Light property"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 2,
            from: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"]
        },
        features: [
            { level: 1, name: "Martial Arts", description: "Your practice of martial arts gives you mastery of combat styles that use your Unarmed Strike and Monk weapons, which are the following: Simple Melee weapons Martial Melee weapons that have the Light property You gain the following benefits while you are unarmed or wielding only Monk weapons and you aren't wearing armor or wielding a Shield. Bonus Unarmed Strike. You can make an Unarmed Strike as a Bonus Action. Martial Arts Die. You can roll 1d6 in place of the normal damage of your Unarmed Strike or Monk weapons. This die changes as you gain Monk levels, as shown in the Martial Arts column of the Monk Features table. Dexterous Attacks. You can use your Dexterity modifier instead of your Strength modifier for the attack and damage rolls of your Unarmed Strikes and Monk weapons. In addition, when you use the Grapple or Shove option of your Unarmed Strike, you can use your Dexterity modifier instead of your Strength modifier to determine the save DC." },
            { level: 1, name: "Unarmored Defense", description: "While you aren't wearing armor or wielding a Shield, your base Armor Class equals 10 plus your Dexterity and Wisdom modifiers." },
            { level: 2, name: "Monk's Focus", description: "Your focus and martial training allow you to harness a well of extraordinary energy within yourself. This energy is represented by Focus Points. Your Monk level determines the number of points you have, as shown in the Focus Points column of the Monk Features table . You can expend these points to enhance or fuel certain Monk features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind, each of which is detailed below. When you expend a Focus Point, it is unavailable until you finish a Short or Long Rest , at the end of which you regain all your expended points. Some features that use Focus Points require your target to make a saving throw. The save DC equals 8 plus your Wisdom modifier and Proficiency Bonus. Flurry of Blows. You can expend 1 Focus Point to make two Unarmed Strikes as a Bonus Action. Patient Defense. You can take the Disengage action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dodge actions as a Bonus Action. Step of the Wind. You can take the Dash action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and Dash actions as a Bonus Action, and your jump distance is doubled for the turn." },
            { level: 2, name: "Unarmored Movement", description: "Your speed increases by 10 feet while you aren't wearing armor or wielding a Shield. This bonus increases when you reach certain Monk levels, as shown on the Monk Features table ." },
            { level: 2, name: "Uncanny Metabolism", description: "When you roll Initiative , you can regain all expended Focus Points. When you do so, roll your Martial Arts die, and regain a number of Hit Points equal to your Monk level plus the number rolled. Once you use this feature, you can't use it again until you finish a Long Rest ." },
            { level: 3, name: "Deflect Attacks", description: "When an attack roll hits you and its damage includes Bludgeoning, Piercing, or Slashing damage, you can take a Reaction to reduce the attack's total damage against you. The reduction equals 1d10 plus your Dexterity modifier and Monk level. If you reduce the damage to 0, you can expend 1 Focus Point to redirect some of the attack's force. If you do so, choose a creature you can see within 5 feet of yourself if the attack was a melee attack or a creature you can see within 60 feet of yourself that isn't behind Total Cover if the attack was a ranged attack. That creature must succeed on a Dexterity saving throw or take damage equal to two rolls of your Martial Arts die plus your Dexterity modifier. The damage is the same type dealt by the attack." },
            { level: 3, name: "Monk Subclass", description: "You gain a Monk subclass of your choice. The Warrior of the Open Hand subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Monk levels. For the rest of your career, you gain each of your subclass's features that are of your Monk level or lower." },
            { level: 4, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Monk levels 8, 12, and 16." },
            { level: 4, name: "Slow Fall", description: "You can take a Reaction when you fall to reduce any damage you take from the fall by an amount equal to five times your Monk level." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action on your turn." },
            { level: 5, name: "Stunning Strike", description: "Once per turn when you hit a creature with a Monk weapon or an Unarmed Strike , you can expend 1 Focus Point to attempt a stunning strike. The target must make a Constitution saving throw. On a failed save, the target has the Stunned condition until the start of your next turn. On a successful save, the target's Speed is halved until the start of your next turn, and the next attack roll made against the target before then has Advantage ." },
            { level: 6, name: "Empowered Strikes", description: "Whenever you deal damage with your Unarmed Strike , it can deal your choice of Force damage or its normal damage type." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 7, name: "Evasion", description: "When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail. You don't benefit from this feature if you have the Incapacitated condition." },
            { level: 8, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 9, name: "Acrobatic Movement", description: "While you aren't wearing armor or wielding a Shield, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the movement." },
            { level: 10, name: "Heightened Focus", description: "Your Flurry of Blows, Patient Defense, and Step of the Wind gain the following benefits. Flurry of Blows. You can expend 1 Focus Point to use Flurry of Blows and make three Unarmed Strikes with it instead of two. Patient Defense. When you expend a Focus Point to use Patient Defense, you gain a number of Temporary Hit Points equal to two rolls of your Martial Arts die. Step of the Wind. When you expend a Focus Point to use Step of the Wind, you can choose a willing creature within 5 feet of yourself that is Large or smaller. You move the creature with you until the end of your turn. The creature's movement doesn't provoke Opportunity Attacks ." },
            { level: 10, name: "Self-Restoration", description: "Through sheer force of will, you can remove one of the following conditions from yourself at the end of each of your turns: Charmed , Frightened , or Poisoned . In addition, forgoing food and drink doesn't give you levels of Exhaustion ." },
            { level: 11, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 12, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 13, name: "Deflect Energy", description: "You can now use your Deflect Attacks feature against attacks that deal any damage type, not just Bludgeoning, Piercing, or Slashing." },
            { level: 14, name: "Disciplined Survivor", description: "Your physical and mental discipline grant you proficiency in all saving throws. Additionally, whenever you make a saving throw and fail, you can expend 1 Focus Point to reroll it, and you must use the new roll." },
            { level: 15, name: "Perfect Focus", description: "When you roll Initiative and don't use Uncanny Metabolism, you regain expended Focus Points until you have 4 if you have 3 or fewer." },
            { level: 16, name: "Ability Score Improvement", description: "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify." },
            { level: 17, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 18, name: "Superior Defense", description: "At the start of your turn, you can expend 3 Focus Points to bolster yourself against harm for 1 minute or until you have the Incapacitated condition. During that time, you have Resistance to all damage except Force damage." },
            { level: 19, name: "Epic Boon", description: "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended." },
            { level: 20, name: "Body and Mind", description: "You have developed your body and mind to new heights. Your Dexterity and Wisdom scores increase by 4, to a maximum of 25." }
        ],
        subclasses: [
            {
                id: "open-hand",
                name: "Warrior of the Open Hand",
                description: "Open Hand Technique (knock prone, push 15 ft, prevent reactions), Wholeness of Body.",
                features: [
                    { level: 3, name: "Open Hand Technique", description: "Whenever you hit a creature with an attack granted by Flurry of Blows, you can impose Addle (cannot take Reactions), Push (push 15 feet away), or Topple (knock Prone)." },
                    { level: 6, name: "Wholeness of Body", description: "Bonus Action to regain hit points equal to your Martial Arts die + Wisdom modifier. You can use this a number of times equal to your Wisdom modifier per Long Rest." },
                    { level: 11, name: "Fleet Step", description: "Whenever you take a Bonus Action other than Step of the Wind, you can immediately use Step of the Wind as part of that same Bonus Action." },
                    { level: 17, name: "Quivering Palm", description: "Spend 4 Focus Points when hitting with an unarmed strike to set up lethal vibrations. Use an action to force a Constitution saving throw: takes 10d12 force damage or drops to 0 HP on failure." }
                ]
            },
            {
                id: "shadow",
                name: "Warrior of Shadow",
                description: "Shadow Arts (Darkness spell, darkvision), Shadow Step teleportation.",
                features: [
                    { level: 3, name: "Shadow Arts", description: "You gain Darkvision out to 60 feet (or extend it by 60 feet) and can cast Darkness by spending 1 Focus Point, which you can see through." },
                    { level: 6, name: "Shadow Step", description: "While in dim light or darkness, Bonus Action to teleport up to 60 feet to an unoccupied space also in dim light or darkness. You gain Advantage on the next melee attack roll you make before the end of your turn." },
                    { level: 11, name: "Improved Shadow Step", description: "When you use Shadow Step, you can make an unarmed strike immediately after teleporting without expending an action." },
                    { level: 17, name: "Cloak of Shadows", description: "Action while in dim light or darkness to become invisible and partially incorporeal, gaining resistance to all damage types except Force damage." }
                ]
            },
            {
                id: "mercy",
                name: "Warrior of Mercy",
                description: "Hands of Harm and Hands of Healing using Focus Points.",
                features: [
                    { level: 3, name: "Hand of Healing", description: "Spend 1 Focus Point to touch a creature and restore HP equal to your Martial Arts die + Wisdom modifier. Can replace one attack in Flurry of Blows without spending an extra point." },
                    { level: 3, name: "Hand of Harm", description: "Spend 1 Focus Point when hitting with an unarmed strike to deal extra Necrotic damage equal to your Martial Arts die + Wisdom modifier." },
                    { level: 3, name: "Implements of Mercy", description: "Gain proficiency in Insight, Medicine, and Herbalism kit." },
                    { level: 6, name: "Physician's Touch", description: "Hand of Healing also cures Blinded, Deafened, Paralyzed, Poisoned, or Stunned conditions. Hand of Harm inflicts the Poisoned condition until end of next turn." },
                    { level: 11, name: "Flurry of Healing and Harm", description: "You can use Hand of Healing and Hand of Harm without spending Focus Points when using Flurry of Blows." },
                    { level: 17, name: "Hand of Ultimate Mercy", description: "Action and 5 Focus Points to touch a creature that died within 24 hours and return it to life with HP equal to 4d10 + Wisdom modifier." }
                ]
            },
            {
                id: "elements",
                name: "Warrior of Elements",
                description: "Elemental attunement reach, elemental bursts of fire, thunder, acid, or cold.",
                features: [
                    { level: 3, name: "Elemental Attunement", description: "Spend 1 Focus Point as a Bonus Action to manifest elemental energy for 10 minutes: reach increases by 10 feet, and your unarmed strikes can deal Acid, Cold, Fire, Lightning, or Thunder damage." },
                    { level: 6, name: "Manipulate Elements", description: "Action to unleash an Elemental Burst in a 20-foot sphere within 120 feet dealing damage equal to 3 rolls of your Martial Arts die (Dex save halves)." },
                    { level: 11, name: "Elemental Stride", description: "While Elemental Attunement is active, you gain a flying speed and swimming speed equal to your walking speed." },
                    { level: 17, name: "Soul of Elements", description: "While Elemental Attunement is active, you gain resistance to Acid, Cold, Fire, Lightning, or Thunder damage, and your Elemental Burst deals extra damage." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Spear, 5 Daggers & Explorer's Pack", items: ["Spear", "Dagger (5)", "Explorer's Pack", "11 GP"] },
            { name: "Gold Purchase (65 GP)", items: ["65 GP"] }
        ]
    },
    {
        id: "paladin",
        name: "Paladin",
        description: "A holy warrior bound by a sacred oath to uphold justice and combat evil.",
        hitDie: 10,
        primaryAbilities: ["str", "cha"],
        savingThrows: ["wis", "cha"],
        armorProficiencies: ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"],
        weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
        weaponMasteryCount: 2,
        skillChoices: {
            count: 2,
            from: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"]
        },
        spellcasting: {
            ability: "cha",
            type: "half",
            cantripsKnownByLevel: [],
            preparedSpellsByLevel: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
            spellSlotsByLevel: HALF_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Lay on Hands", description: "Pool of healing power equal to 5 * Paladin level. Action or Bonus Action to restore HP or cure Poisoned." },
            { level: 1, name: "Spellcasting", description: "Cast divine paladin spells starting at level 1 using Charisma." },
            { level: 1, name: "Weapon Mastery", description: "Master 2 kinds of weapons of your choice." },
            { level: 2, name: "Fighting Style", description: "Choose Defense, Dueling, Great Weapon Fighting, Protection, or Blessed Warrior." },
            { level: 2, name: "Paladin's Smite", description: "Always have Divine Smite prepared; cast it once per Long Rest without expending a spell slot." },
            { level: 3, name: "Channel Divinity", description: "Sacred power options depending on your chosen sacred oath." },
            { level: 3, name: "Paladin Subclass", description: "Choose an Oath: Oath of Devotion, Oath of Glory, Oath of the Ancients, or Oath of Vengeance." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action." },
            { level: 5, name: "Faithful Steed", description: "Always have Find Steed prepared; cast it once per Long Rest without expending a spell slot." },
            { level: 6, name: "Aura of Protection", description: "Add your Charisma modifier (minimum +1) to all saving throws for yourself and allies within 10 ft." },
            { level: 7, name: "Subclass Feature", description: "Gain a subclass aura granted by your chosen Sacred Oath." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Abjure Foes", description: "Channel Divinity to Frighten and Daze multiple enemies within 60 ft on a failed Wisdom saving throw." },
            { level: 10, name: "Aura of Courage", description: "You and allies within 10 ft of you cannot be Frightened while you are conscious." },
            { level: 11, name: "Radiant Strikes", description: "Your melee attacks deal an extra 1d8 radiant damage on hit." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "4th-Level Spells", description: "You gain access to 4th-level spell slots." },
            { level: 14, name: "Restoring Touch", description: "Expend 5 HP from your Lay on Hands pool to remove Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned, or Stunned conditions." },
            { level: 15, name: "Subclass Feature", description: "Gain a feature granted by your chosen Sacred Oath." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 18, name: "Aura Expansion", description: "The range of your Aura of Protection and Aura of Courage increases from 10 ft to 30 ft." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Subclass Capstone", description: "Gain your Sacred Oath's avatar transformation feature." }
        ],
        subclasses: [
            {
                id: "devotion",
                name: "Oath of Devotion",
                description: "Sacred Weapon illuminates blade with Charisma bonus to hit, Aura of Devotion.",
                features: [
                    { level: 3, name: "Sacred Weapon", description: "Channel Divinity as a Bonus Action to imbue one weapon you hold with positive energy: add your Charisma modifier to attack rolls and emit bright light." },
                    { level: 3, name: "Turn the Unholy", description: "Channel Divinity to force each fiend or undead within 30 feet that can see or hear you to make a Wisdom saving throw or be Turned." },
                    { level: 7, name: "Aura of Devotion", description: "You and allies within 10 feet of you cannot be Charmed while you are conscious." },
                    { level: 15, name: "Smite of Protection", description: "Whenever you cast a Smite spell, you and your allies within 30 feet gain half cover until the start of your next turn." },
                    { level: 20, name: "Holy Nimbus", description: "Action to emit an aura of sunlight for 10 minutes: fiends and undead take 10 radiant damage at start of their turns, and you have Advantage on saving throws against their spells and abilities." }
                ]
            },
            {
                id: "ancients",
                name: "Oath of the Ancients",
                description: "Nature's Wrath ensnares foes, Aura of Warding resists spell damage.",
                features: [
                    { level: 3, name: "Nature's Wrath", description: "Channel Divinity as an Action to cause spectral vines to reach out and Restrain a creature within 30 feet on a failed Strength saving throw." },
                    { level: 3, name: "Turn the Faithless", description: "Channel Divinity to force each fey or fiend within 30 feet to make a Wisdom saving throw or be Turned." },
                    { level: 7, name: "Aura of Warding", description: "You and allies within 10 feet of you have resistance to damage from spells." },
                    { level: 15, name: "Undying Sentinel", description: "When reduced to 0 HP and not killed outright, drop to 1 HP instead once per Long Rest; you suffer none of the drawbacks of old age." },
                    { level: 20, name: "Elder Champion", description: "Action to assume the form of an ancient force of primeval nature: regenerate 10 HP at start of turn, cast paladin spells with 1 action as Bonus Actions, and enemies within 10 ft have Disadvantage on saves against your spells." }
                ]
            },
            {
                id: "vengeance",
                name: "Oath of Vengeance",
                description: "Vow of Enmity grants Advantage against a single foe, Relentless Avenger.",
                features: [
                    { level: 3, name: "Vow of Enmity", description: "Channel Divinity as a Bonus Action to utter a vow of enmity against a creature within 30 feet, gaining Advantage on attack rolls against it for 1 minute or until it dies." },
                    { level: 7, name: "Relentless Avenger", description: "When you hit a creature with an Opportunity Attack, your speed increases and you can move up to half your Speed as part of the same reaction without provoking opportunity attacks." },
                    { level: 15, name: "Soul of Vengeance", description: "When the creature marked by your Vow of Enmity makes an attack, you can use your Reaction to make a melee weapon attack against that creature if it is within range." },
                    { level: 20, name: "Avenging Angel", description: "Action to transform into an angelic avenger for 10 minutes: sprout wings gaining a flying speed of 60 feet, and radiate a terrifying aura causing enemies within 30 feet to become Frightened on a failed Wisdom save." }
                ]
            },
            {
                id: "glory",
                name: "Oath of Glory",
                description: "Peerless Athlete, Inspiring Smite grants temporary hit points to allies.",
                features: [
                    { level: 3, name: "Peerless Athlete", description: "Channel Divinity as a Bonus Action to gain Advantage on Athletics and Acrobatics checks, increase carrying capacity, and add 10 feet to jump distance for 10 minutes." },
                    { level: 3, name: "Inspiring Smite", description: "Whenever you hit a creature with Divine Smite, Channel Divinity to grant temporary hit points equal to 2d8 + Paladin level distributed among allies within 30 feet." },
                    { level: 7, name: "Aura of Alacrity", description: "Your speed increases by 10 feet. In addition, allies who start their turn within 10 feet of you gain a +10 foot bonus to speed until the end of that turn." },
                    { level: 15, name: "Glorious Defense", description: "Reaction when you or an ally is attacked to grant a bonus to AC equal to your Charisma modifier. If the attack misses, you can immediately make a weapon attack against the attacker." },
                    { level: 20, name: "Living Legend", description: "Action to transform for 1 minute: gain Advantage on all Charisma checks, turn one missed attack into a hit once per turn, and reroll a failed saving throw." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Chain Mail, Longsword & Shield", items: ["Chain Mail", "Longsword", "Shield", "Javelin (6)", "Holy Symbol", "Priest's Pack", "9 GP"] },
            { name: "Gold Purchase (150 GP)", items: ["150 GP"] }
        ]
    },
    {
        id: "ranger",
        name: "Ranger",
        description: "A master scout and survivalist who uses martial prowess and nature magic.",
        hitDie: 10,
        primaryAbilities: ["dex", "wis"],
        savingThrows: ["str", "dex"],
        armorProficiencies: ["Light Armor", "Medium Armor", "Shields"],
        weaponProficiencies: ["Simple Weapons", "Martial Weapons"],
        weaponMasteryCount: 2,
        skillChoices: {
            count: 3,
            from: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"]
        },
        spellcasting: {
            ability: "wis",
            type: "half",
            cantripsKnownByLevel: [],
            preparedSpellsByLevel: [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
            spellSlotsByLevel: HALF_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Spellcasting", description: "Cast primal ranger spells starting at level 1 using Wisdom." },
            { level: 1, name: "Favored Enemy", description: "Always have Hunter's Mark prepared; cast it PB times per Long Rest without expending a spell slot." },
            { level: 1, name: "Weapon Mastery", description: "Master 2 kinds of weapons of your choice." },
            { level: 2, name: "Deft Explorer", description: "Gain Expertise in one skill and gain swimming & climbing speed equal to walking speed at lvl 6." },
            { level: 2, name: "Fighting Style", description: "Choose Archery, Defense, Dueling, or Two-Weapon Fighting." },
            { level: 3, name: "Ranger Subclass", description: "Choose an archetype: Beast Master, Fey Wanderer, Gloom Stalker, or Hunter." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action." },
            { level: 6, name: "Roving", description: "Your walking speed increases by 10 ft, and you gain a climbing speed and swimming speed equal to your walking speed." },
            { level: 7, name: "Subclass Feature", description: "Gain a feature granted by your chosen Ranger archetype." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Expert Explorer", description: "Gain Expertise in one additional skill." },
            { level: 10, name: "Tireless", description: "Action to gain temporary HP (1d8 + Wis mod) PB times per Long Rest. In addition, decrease exhaustion level by 1 on a Short Rest." },
            { level: 11, name: "Subclass Feature", description: "Gain a feature granted by your chosen Ranger archetype." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "Relentless Hunter", description: "Taking damage can't break your concentration on Hunter's Mark." },
            { level: 13, name: "4th-Level Spells", description: "You gain access to 4th-level spell slots." },
            { level: 14, name: "Nature's Veil", description: "Bonus Action to become Invisible until the end of your next turn PB times per Long Rest." },
            { level: 15, name: "Subclass Feature", description: "Gain a feature granted by your chosen Ranger archetype." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Precise Hunter", description: "You have Advantage on attack rolls against the creature marked by your Hunter's Mark." },
            { level: 17, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 18, name: "Feral Senses", description: "Gain Blindsight out to 30 ft; attacks against you don't gain Advantage from being unseen." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Foe Slayer", description: "The damage die of your Hunter's Mark increases from 1d6 to 1d10." }
        ],
        subclasses: [
            {
                id: "beast-master",
                name: "Beast Master",
                description: "Primal Companion (Beast of the Land, Sea, or Sky).",
                features: [
                    { level: 3, name: "Primal Companion", description: "You magically summon a primal beast (Beast of the Land, Sea, or Sky) that accompanies you on your adventures and fights alongside you." },
                    { level: 7, name: "Exceptional Training", description: "Whenever you take a Bonus Action, you can command your beast to take the Dash, Disengage, Dodge, or Help action. Its attacks count as magical." },
                    { level: 11, name: "Bestial Fury", description: "When you command your beast to take the Beast's Strike action, the beast can attack twice instead of once, and benefits from your Hunter's Mark." },
                    { level: 15, name: "Share Spells", description: "When you cast a spell targeting yourself, you can also affect your beast companion if it is within 30 feet of you." }
                ]
            },
            {
                id: "fey-wanderer",
                name: "Fey Wanderer",
                description: "Dreadful Strikes psychic damage, Otherworldly Glamour adds Wisdom to Charisma checks.",
                features: [
                    { level: 3, name: "Dreadful Strikes", description: "Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d4 psychic damage to that creature." },
                    { level: 3, name: "Otherworldly Glamour", description: "Whenever you make a Charisma check, add your Wisdom modifier (minimum +1). Gain proficiency in Deception, Performance, or Persuasion." },
                    { level: 7, name: "Beguiling Twist", description: "Advantage on saving throws against Charmed and Frightened conditions. Whenever an enemy or ally succeeds on such a save, use a Reaction to force a different enemy within 120 feet to make a Wisdom save against Charm or Fear." },
                    { level: 11, name: "Fey Reinforcements", description: "Always have Summon Fey prepared; cast it once per Long Rest without expending a spell slot, and you can summon the fey without concentrating on it for 1 minute." },
                    { level: 15, name: "Misty Wanderer", description: "Cast Misty Step without expending a spell slot a number of times equal to your Wisdom modifier per Long Rest, and you can bring along one willing creature within 5 feet." }
                ]
            },
            {
                id: "gloom-stalker",
                name: "Gloom Stalker",
                description: "Dread Ambusher, Umbral Sight (extra darkvision and invisible to darkvision).",
                features: [
                    { level: 3, name: "Dread Ambusher", description: "Add your Wisdom modifier to Initiative rolls. On the first turn of combat, your speed increases by 10 feet and you can make an extra attack dealing 2d6 psychic damage." },
                    { level: 3, name: "Umbral Sight", description: "Gain Darkvision out to 60 feet (or extend it by 60 feet). While in darkness, you are invisible to any creature that relies on darkvision to see you." },
                    { level: 7, name: "Iron Mind", description: "You gain proficiency in Wisdom saving throws. If you already have this proficiency, you instead gain proficiency in Intelligence or Charisma saving throws." },
                    { level: 11, name: "Stalker's Flurry", description: "Once on each of your turns when you make a weapon attack, you can make an additional attack, or deal an extra 2d8 damage on hit." },
                    { level: 15, name: "Shadowy Dodge", description: "Reaction when a creature attacks you to impose Disadvantage on the attack roll. If the attack misses, you can teleport up to 30 feet to an unoccupied space you can see." }
                ]
            },
            {
                id: "hunter",
                name: "Hunter",
                description: "Hunter's Prey (Colossus Slayer), Defensive Tactics.",
                features: [
                    { level: 3, name: "Hunter's Prey", description: "Choose Colossus Slayer (deal an extra 1d8 damage to an injured creature once per turn) or Horde Breaker (make an additional attack against a creature within 5 feet of your target)." },
                    { level: 3, name: "Hunter's Lore", description: "When a creature is marked by your Hunter's Mark, you immediately learn that creature's damage immunities, damage resistances, and damage vulnerabilities." },
                    { level: 7, name: "Defensive Tactics", description: "Choose Escape the Horde (opportunity attacks against you have Disadvantage) or Multiattack Defense (when hit by a creature, subsequent attacks from that creature have Disadvantage)." },
                    { level: 11, name: "Superior Hunter's Prey", description: "Colossus Slayer now triggers on any hit against an injured creature, or Horde Breaker can target two additional creatures within 5 feet." },
                    { level: 15, name: "Superior Hunter's Defense", description: "Gain Evasion (take no damage on successful Dex saves and half on failure) or Uncanny Dodge (halve damage from an incoming attack as a Reaction)." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Scale Mail, Shortswords & Longbow", items: ["Scale Mail", "Shortsword (2)", "Longbow", "Arrows (20)", "Explorer's Pack", "7 GP"] },
            { name: "Gold Purchase (150 GP)", items: ["150 GP"] }
        ]
    },
    {
        id: "rogue",
        name: "Rogue",
        description: "A scoundrel who uses stealth, precision, and trickery to exploit enemy vulnerabilities.",
        hitDie: 8,
        primaryAbilities: ["dex"],
        savingThrows: ["dex", "int"],
        armorProficiencies: ["Light Armor"],
        weaponProficiencies: ["Simple Weapons", "Martial Weapons with Finesse or Light"],
        weaponMasteryCount: 2,
        skillChoices: {
            count: 4,
            from: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"]
        },
        features: [
            { level: 1, name: "Sneak Attack (1d6)", description: "Once per turn, deal an extra 1d6 damage (scales +1d6 every 2 levels) to one creature you hit with an attack if you have Advantage or an active ally within 5 ft." },
            { level: 1, name: "Expertise", description: "Double proficiency bonus on two chosen skills or thieves' tools." },
            { level: 1, name: "Thieves' Cant", description: "You know Thieves' Cant and one other language of your choice." },
            { level: 1, name: "Weapon Mastery", description: "Master 2 kinds of weapons of your choice." },
            { level: 2, name: "Cunning Action", description: "Bonus Action to take Dash, Disengage, or Hide." },
            { level: 3, name: "Rogue Subclass", description: "Choose a roguish archetype: Arcane Trickster, Assassin, Soulknife, or Thief." },
            { level: 3, name: "Steady Aim", description: "Bonus Action to give yourself Advantage on your next attack roll this turn, provided you haven't moved yet (reduces your speed to 0)." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Cunning Strike", description: "Forgo Sneak Attack damage dice to apply tactical effects on hit: Poison (Con save or Poisoned), Trip (Dex save or Prone), or Withdraw (move half speed without opportunity attacks)." },
            { level: 5, name: "Uncanny Dodge", description: "Reaction to halve the damage taken from an attack you can see." },
            { level: 6, name: "Expertise (2 Additional)", description: "Double proficiency bonus on two additional chosen skills or thieves' tools." },
            { level: 7, name: "Evasion", description: "Dex saves for half damage deal 0 damage on success and half damage on failure." },
            { level: 7, name: "Reliable Talent", description: "Whenever you make an ability check with a skill or tool you are proficient in, treat a d20 roll of 9 or lower as a 10." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Subclass Feature", description: "Gain a feature granted by your chosen Roguish Archetype." },
            { level: 10, name: "Ability Score Improvement (Rogue Bonus)", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 11, name: "Improved Cunning Strike", description: "You can apply up to two different Cunning Strike effects to a single Sneak Attack." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "Subclass Feature", description: "Gain a feature granted by your chosen Roguish Archetype." },
            { level: 14, name: "Devious Strikes", description: "New Cunning Strike options: Daze (Con save or Dazed), Knock Out (Con save or Unconscious), and Obscure (Dex save or Blinded)." },
            { level: 15, name: "Slippery Mind", description: "Gain proficiency in Wisdom and Charisma saving throws." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Subclass Feature", description: "Gain a feature granted by your chosen Roguish Archetype." },
            { level: 18, name: "Elusive", description: "No attack roll can have Advantage against you while you aren't Incapacitated." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Stroke of Luck", description: "Turn a missed attack roll into a hit, or treat a failed d20 ability check as a 20 (once per Short or Long Rest)." }
        ],
        subclasses: [
            {
                id: "arcane-trickster",
                name: "Arcane Trickster",
                description: "Mage Hand Legerdemain, Illusion and Enchantment arcane spellcasting.",
                features: [
                    { level: 3, name: "Spellcasting", description: "Cast wizard spells using Intelligence. Prepare spells from enchantment, illusion, and other schools of magic, and cast cantrips including Mage Hand." },
                    { level: 3, name: "Mage Hand Legerdemain", description: "Control an invisible Mage Hand as a Bonus Action: stow and retrieve objects from containers worn or carried by others, pick locks, and disarm traps at a range of 30 feet." },
                    { level: 9, name: "Magical Ambush", description: "If you are hidden from a creature when you cast a spell on it, the creature has Disadvantage on any saving throw it makes against the spell this turn." },
                    { level: 13, name: "Versatile Trickster", description: "Bonus Action to designate a creature within 5 feet of your Mage Hand; you gain Advantage on attack rolls against that creature until the end of the turn." },
                    { level: 17, name: "Spell Thief", description: "Reaction when a creature casts a spell that targets you to force the caster to make a saving throw; on failure, you negate the spell's effect and can cast it yourself for 8 hours." }
                ]
            },
            {
                id: "assassin",
                name: "Assassin",
                description: "Assassinate (Advantage on un-acted targets, bonus damage), Infiltration Expertise.",
                features: [
                    { level: 3, name: "Assassinate", description: "You have Advantage on attack rolls against any creature that hasn't taken a turn in combat yet. If you hit a surprised creature, your Sneak Attack deals extra damage equal to your Rogue level." },
                    { level: 3, name: "Assassin's Tools", description: "You gain proficiency with the Disguise Kit and the Poisoner's Kit." },
                    { level: 9, name: "Infiltration Expertise", description: "You can flawlessly adopt a disguise and false identity, and mimic speech patterns and handwriting after 3 hours of observation." },
                    { level: 13, name: "Envenomed Weapons", description: "When you use the Poison option of your Cunning Strike, you ignore the creature's resistance to poison damage, and it takes an extra 2d6 poison damage." },
                    { level: 17, name: "Death Strike", description: "When you hit a creature that hasn't taken a turn in the combat yet with Sneak Attack, it must make a Constitution saving throw (DC 8 + Dex mod + PB) or the attack's damage is doubled." }
                ]
            },
            {
                id: "soulknife",
                name: "Soulknife",
                description: "Psychic Blades, Psionic Power dice for skill checks and telepathic whispers.",
                features: [
                    { level: 3, name: "Psychic Blades", description: "Manifest shimmering blades of psychic energy dealing 1d6 psychic damage + Dex modifier with the Finesse and Thrown properties. Make an additional attack with a second psychic blade for 1d4 damage as a Bonus Action." },
                    { level: 3, name: "Psionic Power", description: "Harbor a pool of Psionic Energy dice (equal to 2x PB) to fuel Psi-Bolstered Knack (add die to failed skill checks) and Psychic Whispers (telepathic communication)." },
                    { level: 9, name: "Soul Blades", description: "Homing Strikes: spend a Psionic Energy die to turn a missed attack into a hit. Psychic Teleportation: throw a psychic blade up to 10x the die roll and teleport to that space." },
                    { level: 13, name: "Psychic Veil", description: "Action to cloak yourself in psychic energy, becoming Invisible for 1 hour once per Long Rest or by expending a Psionic Energy die." },
                    { level: 17, name: "Mind Rend", description: "When you hit a creature with Sneak Attack using a Psychic Blade, spend 3 Sneak Attack dice to force a Wisdom saving throw or stun the target for 1 minute." }
                ]
            },
            {
                id: "thief",
                name: "Thief",
                description: "Fast Hands (Bonus Action use object or Sleight of Hand), Second-Story Work climbing speed.",
                features: [
                    { level: 3, name: "Fast Hands", description: "Bonus Action to make a Dexterity (Sleight of Hand) check, use Thieves' Tools to disarm a trap or open a lock, or take the Utilize action." },
                    { level: 3, name: "Second-Story Work", description: "Climbing no longer costs you extra movement, and your jump distance increases by a number of feet equal to your Dexterity modifier." },
                    { level: 9, name: "Supreme Sneak", description: "You have Advantage on Dexterity (Stealth) checks if you move no more than half your speed on the same turn." },
                    { level: 13, name: "Use Magic Device", description: "You can attune to up to four magic items at once, and you ignore all class, race, and spell requirements on the use of magic items." },
                    { level: 17, name: "Thief's Reflexes", description: "You can take two turns during the first round of any combat (one on your normal initiative and another at initiative minus 10)." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Leather Armor, 2 Daggers, Shortsword & Thieves' Tools", items: ["Leather Armor", "Shortsword", "Dagger (2)", "Thieves' Tools", "Burglar's Pack", "18 GP"] },
            { name: "Leather Armor, Shortbow & Rapier", items: ["Leather Armor", "Rapier", "Shortbow", "Arrows (20)", "Thieves' Tools", "Dungeoneer's Pack", "10 GP"] },
            { name: "Gold Purchase (110 GP)", items: ["110 GP"] }
        ]
    },
    {
        id: "sorcerer",
        name: "Sorcerer",
        description: "A spellcaster who draws on inherent magic from a gift, bloodline, or cosmic anomaly.",
        hitDie: 6,
        primaryAbilities: ["cha", "con"],
        savingThrows: ["con", "cha"],
        armorProficiencies: [],
        weaponProficiencies: ["Simple Weapons"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 2,
            from: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"]
        },
        spellcasting: {
            ability: "cha",
            type: "full",
            cantripsKnownByLevel: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
            preparedSpellsByLevel: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
            spellSlotsByLevel: FULL_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Innate Sorcery", description: "Bonus Action to unleash sorcerous power for 1 minute: Advantage on spell attack rolls and your spell save DC increases by 1. Usable twice per Long Rest." },
            { level: 1, name: "Spellcasting", description: "Cast sorcerer spells using Charisma." },
            { level: 2, name: "Font of Magic", description: "Sorcery Points equal to your Sorcerer level. Convert spell slots to points and vice versa." },
            { level: 2, name: "Metamagic", description: "Choose 2 Metamagic options: Quickened Spell, Twinned Spell, Subtle Spell, Heightened Spell, Empowered Spell, etc." },
            { level: 3, name: "Sorcerer Subclass", description: "Choose an origin: Draconic Sorcery, Wild Magic Sorcery, Aberrant Sorcery, or Clockwork Sorcery." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Sorcerous Restoration", description: "Regain expended Sorcery Points equal to half your Sorcerer level on a Short Rest once per Long Rest." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Sorcerer origin." },
            { level: 7, name: "Sorcery Incarnate", description: "While Innate Sorcery is active, use up to two Metamagic options on a spell; spend 2 Sorcery Points to regain a use of Innate Sorcery." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 10, name: "Metamagic (Additional Option)", description: "Gain 1 additional Metamagic option of your choice." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level spell slots." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Sorcerer origin." },
            { level: 15, name: "8th-Level Spells", description: "You gain access to 8th-level spell slots." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Metamagic (Additional Option)", description: "Gain 1 additional Metamagic option of your choice." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level spell slots." },
            { level: 18, name: "Subclass Feature", description: "Gain a feature granted by your chosen Sorcerer origin." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Arcane Apotheosis", description: "While Innate Sorcery is active, you can use one Metamagic option on each of your turns without spending Sorcery Points." }
        ],
        subclasses: [
            {
                id: "aberrant",
                name: "Aberrant Sorcery",
                description: "Psionic Spells, Telepathic Speech, Psionic Sorcery.",
                features: [
                    { level: 3, name: "Psionic Spells", description: "You learn bonus psionic spells (such as Mind Sliver, Dissonant Whispers, Arms of Hadar). You can swap them for Divination or Enchantment spells from Sorcerer, Warlock, or Wizard." },
                    { level: 3, name: "Telepathic Speech", description: "Bonus Action to form a telepathic link with a creature within 30 feet for miles equal to your Charisma modifier." },
                    { level: 6, name: "Psionic Sorcery", description: "Cast any spell from your Psionic Spells feature by expending a number of Sorcery Points equal to the spell's level without verbal, somatic, or material components." },
                    { level: 6, name: "Psychic Defenses", description: "You gain resistance to Psychic damage, and you have Advantage on saving throws against being Charmed or Frightened." },
                    { level: 14, name: "Revelation in Flesh", description: "Bonus Action and 1 or more Sorcery Points to alter your form: gain a flying speed, swimming speed, squeeze through narrow spaces, or see invisible creatures." },
                    { level: 18, name: "Warping Implosion", description: "Action and 5 Sorcery Points to teleport up to 120 feet and leave behind a gravitational vortex dealing 3d10 force damage and pulling enemies toward the center." }
                ]
            },
            {
                id: "clockwork",
                name: "Clockwork Sorcery",
                description: "Clockwork Magic, Restore Balance cancels Advantage/Disadvantage.",
                features: [
                    { level: 3, name: "Clockwork Spells", description: "You learn bonus spells of cosmic order (such as Aid, Lesser Restoration, Protection from Evil and Good). You can swap them for Abjuration or Transmutation spells." },
                    { level: 3, name: "Restore Balance", description: "Reaction when a creature within 60 feet rolls with Advantage or Disadvantage to cancel that roll's modifier PB times per Long Rest." },
                    { level: 6, name: "Bastion of Law", description: "Action to spend 1 to 5 Sorcery Points to create a protective ward of d8s around yourself or an ally that reduces incoming damage." },
                    { level: 14, name: "Trance of Order", description: "Bonus Action and 5 Sorcery Points to enter a state of clockwork perfection: attack rolls against you cannot have Advantage, and d20 rolls of 9 or lower count as a 10." },
                    { level: 18, name: "Clockwork Cavalcade", description: "Action and 7 Sorcery Points to summon spirits of order in a 30-foot cube: restore up to 100 hit points divided among creatures, repair objects, and end spells of 6th level or lower." }
                ]
            },
            {
                id: "draconic",
                name: "Draconic Sorcery",
                description: "Draconic Resilience (AC 10 + Dex + Cha, +1 HP per level), Elemental Affinity.",
                features: [
                    { level: 3, name: "Draconic Resilience", description: "Parts of your skin are covered by dragon scales. Your AC equals 10 + Dex modifier + Cha modifier while unarmored, and your HP maximum increases by 1 for each Sorcerer level." },
                    { level: 3, name: "Draconic Ancestor", description: "Choose a dragon ancestor (Black/Copper: Acid, Blue/Bronze: Lightning, Brass/Gold/Red: Fire, Green: Poison, Silver/White: Cold) which determines your elemental affinity." },
                    { level: 6, name: "Elemental Affinity", description: "Add your Charisma modifier to one damage roll of any spell that deals damage associated with your dragon ancestor. In addition, spend 1 Sorcery Point to gain 1 hour resistance to that damage type." },
                    { level: 14, name: "Dragon Wings", description: "Bonus Action to sprout draconic wings from your back, gaining a flying speed equal to your walking speed." },
                    { level: 18, name: "Dragon Companion", description: "Action and 5 Sorcery Points to summon a draconic avatar that fights alongside you and unleashes breath attacks." }
                ]
            },
            {
                id: "wild-magic",
                name: "Wild Magic Sorcery",
                description: "Wild Magic Surge, Tides of Chaos Advantage.",
                features: [
                    { level: 3, name: "Wild Magic Surge", description: "Whenever you cast a Sorcerer spell of level 1 or higher, the DM can have you roll a d20. On a 1, roll on the Wild Magic Surge table to create a random magical effect." },
                    { level: 3, name: "Tides of Chaos", description: "Gain Advantage on one attack roll, ability check, or saving throw. Recharges on a Long Rest or after triggering a Wild Magic Surge." },
                    { level: 6, name: "Bend Luck", description: "Reaction and 2 Sorcery Points to add or subtract 1d4 from another creature's attack roll, ability check, or saving throw." },
                    { level: 14, name: "Controlled Chaos", description: "Whenever you roll on the Wild Magic Surge table, you can roll twice and use either number." },
                    { level: 18, name: "Spell Bombardment", description: "When you roll the maximum damage on a spell die, roll one of the dice again and add its damage to the total." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Light Crossbow, 2 Daggers & Arcane Focus", items: ["Crossbow, Light", "Crossbow Bolts (20)", "Dagger (2)", "Arcane Focus (Orb)", "Dungeoneer's Pack", "28 GP"] },
            { name: "Gold Purchase (50 GP)", items: ["50 GP"] }
        ]
    },
    {
        id: "warlock",
        name: "Warlock",
        description: "A wielder of magic derived from a bargain with an otherworldly patron.",
        hitDie: 8,
        primaryAbilities: ["cha", "con"],
        savingThrows: ["wis", "cha"],
        armorProficiencies: ["Light Armor"],
        weaponProficiencies: ["Simple Weapons"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 2,
            from: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"]
        },
        spellcasting: {
            ability: "cha",
            type: "pact",
            cantripsKnownByLevel: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            preparedSpellsByLevel: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
            spellSlotsByLevel: [
                // [total pact slots, slot level]
                [1, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 1 (1 slot, 1st)
                [2, 0, 0, 0, 0, 0, 0, 0, 0], // Lvl 2 (2 slots, 1st)
                [0, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 3 (2 slots, 2nd)
                [0, 2, 0, 0, 0, 0, 0, 0, 0], // Lvl 4
                [0, 0, 2, 0, 0, 0, 0, 0, 0], // Lvl 5 (2 slots, 3rd)
                [0, 0, 2, 0, 0, 0, 0, 0, 0], // Lvl 6
                [0, 0, 0, 2, 0, 0, 0, 0, 0], // Lvl 7 (2 slots, 4th)
                [0, 0, 0, 2, 0, 0, 0, 0, 0], // Lvl 8
                [0, 0, 0, 0, 2, 0, 0, 0, 0], // Lvl 9 (2 slots, 5th)
                [0, 0, 0, 0, 2, 0, 0, 0, 0], // Lvl 10
                [0, 0, 0, 0, 3, 0, 0, 0, 0], // Lvl 11 (3 slots, 5th)
                [0, 0, 0, 0, 3, 0, 0, 0, 0], // Lvl 12
                [0, 0, 0, 0, 3, 0, 0, 0, 0], // Lvl 13
                [0, 0, 0, 0, 3, 0, 0, 0, 0], // Lvl 14
                [0, 0, 0, 0, 3, 0, 0, 0, 0], // Lvl 15
                [0, 0, 0, 0, 3, 0, 0, 0, 0], // Lvl 16
                [0, 0, 0, 0, 4, 0, 0, 0, 0], // Lvl 17 (4 slots, 5th)
                [0, 0, 0, 0, 4, 0, 0, 0, 0], // Lvl 18
                [0, 0, 0, 0, 4, 0, 0, 0, 0], // Lvl 19
                [0, 0, 0, 0, 4, 0, 0, 0, 0]  // Lvl 20
            ]
        },
        features: [
            { level: 1, name: "Eldritch Invocations (1 Invocation)", description: "Gain 1 Eldritch Invocation at level 1 (e.g. Pact of the Blade, Pact of the Tome, Pact of the Chain, Agonizing Blast, Armor of Shadows)." },
            { level: 1, name: "Pact Magic", description: "Cast warlock spells using Charisma. All spell slots are of the highest unlocked level and recharge on a Short or Long Rest." },
            { level: 2, name: "Eldritch Invocations (2 Invocations)", description: "You gain a second Eldritch Invocation." },
            { level: 2, name: "Magical Cunning", description: "Regain half your pact spell slots once per Long Rest with a 1-minute ritual." },
            { level: 3, name: "Warlock Subclass", description: "Choose a patron: Fiend Patron, Archfey Patron, Celestial Patron, or Great Old One Patron." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Eldritch Invocations (3 Invocations)", description: "You gain a third Eldritch Invocation." },
            { level: 5, name: "3rd-Level Pact Slots", description: "Your pact spell slots upgrade to 3rd level." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Otherworldly Patron." },
            { level: 7, name: "Eldritch Invocations (4 Invocations)", description: "You gain a fourth Eldritch Invocation." },
            { level: 7, name: "4th-Level Pact Slots", description: "Your pact spell slots upgrade to 4th level." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Contact Patron", description: "Cast Contact Other Plane without expending a spell slot or failing the Intelligence saving throw once per Long Rest." },
            { level: 9, name: "Eldritch Invocations (5 Invocations)", description: "You gain a fifth Eldritch Invocation." },
            { level: 9, name: "5th-Level Pact Slots", description: "Your pact spell slots upgrade to 5th level." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Otherworldly Patron." },
            { level: 11, name: "Mystic Arcanum (6th Level)", description: "Choose one 6th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot." },
            { level: 11, name: "3rd Pact Spell Slot", description: "You gain a third pact magic spell slot." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 12, name: "Eldritch Invocations (6 Invocations)", description: "You gain a sixth Eldritch Invocation." },
            { level: 13, name: "Mystic Arcanum (7th Level)", description: "Choose one 7th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Otherworldly Patron." },
            { level: 15, name: "Mystic Arcanum (8th Level)", description: "Choose one 8th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot." },
            { level: 15, name: "Eldritch Invocations (7 Invocations)", description: "You gain a seventh Eldritch Invocation." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Mystic Arcanum (9th Level)", description: "Choose one 9th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot." },
            { level: 17, name: "4th Pact Spell Slot", description: "You gain a fourth pact magic spell slot." },
            { level: 18, name: "Eldritch Invocations (8 Invocations)", description: "You gain an eighth Eldritch Invocation." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Eldritch Master", description: "Spend 1 minute entreating your patron to regain all expended pact magic spell slots once per Long Rest." }
        ],
        subclasses: [
            {
                id: "archfey",
                name: "Archfey Patron",
                description: "Misty Escape (teleport when taking damage), Steps of the Fey enhancements.",
                features: [
                    { level: 3, name: "Steps of the Fey", description: "You always have Misty Step prepared, and you can cast it without expending a spell slot PB times per Long Rest with enhanced effects (Taunting Step or Refreshing Step)." },
                    { level: 6, name: "Misty Escape", description: "Reaction upon taking damage to cast Misty Step and turn Invisible until the start of your next turn." },
                    { level: 10, name: "Beguiling Defenses", description: "You are immune to the Charmed condition. In addition, when a creature attempts to charm you, you can turn the charm back upon that creature." },
                    { level: 14, name: "Bewitching Cast", description: "Whenever you cast an Enchantment or Illusion spell with a casting time of 1 action, you can cast Misty Step as part of that same action without expending a spell slot." }
                ]
            },
            {
                id: "celestial",
                name: "Celestial Patron",
                description: "Healing Light (pool of d6 healing dice), Radiant Soul bonus radiant/fire damage.",
                features: [
                    { level: 3, name: "Healing Light", description: "Harbor a pool of d6 healing dice equal to 1 + your Warlock level. Bonus Action to heal a creature within 60 feet by expending dice (up to your Charisma modifier at once)." },
                    { level: 6, name: "Radiant Soul", description: "You gain resistance to Radiant damage. In addition, add your Charisma modifier to one radiant or fire damage roll of any spell you cast." },
                    { level: 10, name: "Celestial Resilience", description: "Whenever you finish a Short or Long Rest, you gain temporary hit points equal to your Warlock level + Charisma modifier, and up to five allies gain temp HP." },
                    { level: 14, name: "Searing Vengeance", description: "When you would drop to 0 HP, burst with radiant light: regain half your hit points, stand up, and deal 2d8 + Charisma modifier radiant damage and Blind hostiles within 30 feet." }
                ]
            },
            {
                id: "fiend",
                name: "Fiend Patron",
                description: "Dark One's Blessing (temporary HP on kill), Dark One's Own Luck (add 1d10 to ability check/save).",
                features: [
                    { level: 3, name: "Dark One's Blessing", description: "When you reduce an enemy to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your Warlock level (minimum 1)." },
                    { level: 6, name: "Dark One's Own Luck", description: "When you make an ability check or a saving throw, you can add 1d10 to your roll once per Short or Long Rest." },
                    { level: 10, name: "Fiendish Resilience", description: "Choose one damage type whenever you finish a Short or Long Rest. You gain resistance to that damage type until you choose a different one." },
                    { level: 14, name: "Hurl Through Hell", description: "When you hit a creature with an attack, you can banish it through the Lower Planes. At the end of your next turn, it returns and takes 10d10 psychic damage." }
                ]
            },
            {
                id: "great-old-one",
                name: "Great Old One Patron",
                description: "Awakened Mind (telepathic communication), Psychic Spells, Thought Shield.",
                features: [
                    { level: 3, name: "Awakened Mind", description: "You can telepathically speak to any creature you can see within 30 feet, and the creature can respond telepathically in a language it knows." },
                    { level: 3, name: "Psychic Spells", description: "Whenever you cast a warlock spell that deals damage, you can change the damage type to Psychic, and you can cast enchantment or illusion spells without verbal or somatic components." },
                    { level: 6, name: "Clairvoyant Combat", description: "Gain Advantage on attack rolls against a creature you have telepathic contact with, and it has Disadvantage on attack rolls against you." },
                    { level: 10, name: "Thought Shield", description: "Your thoughts cannot be read, and you gain resistance to Psychic damage. When an enemy deals psychic damage to you, it takes the same amount of damage." },
                    { level: 14, name: "Create Thrall", description: "Action to touch an Incapacitated humanoid to charm it indefinitely. You communicate telepathically across any distance while on the same plane." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Leather Armor, Sickle & Arcane Focus", items: ["Leather Armor", "Sickle", "Dagger (2)", "Arcane Focus (Wand)", "Scholar's Pack", "15 GP"] },
            { name: "Gold Purchase (100 GP)", items: ["100 GP"] }
        ]
    },
    {
        id: "wizard",
        name: "Wizard",
        description: "A scholarly magic-user capable of manipulating the fundamental fabric of reality.",
        hitDie: 6,
        primaryAbilities: ["int"],
        savingThrows: ["int", "wis"],
        armorProficiencies: [],
        weaponProficiencies: ["Simple Weapons"],
        weaponMasteryCount: 0,
        skillChoices: {
            count: 2,
            from: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"]
        },
        spellcasting: {
            ability: "int",
            type: "full",
            cantripsKnownByLevel: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            preparedSpellsByLevel: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
            spellSlotsByLevel: FULL_CASTER_SLOTS
        },
        features: [
            { level: 1, name: "Spellbook", description: "Your book contains six 1st-level spells of your choice. You add two wizard spells of your choice to it whenever you gain a Wizard level." },
            { level: 1, name: "Spellcasting & Ritual Casting", description: "Cast prepared wizard spells using Intelligence. You can cast any wizard spell in your spellbook as a ritual if it has the ritual tag." },
            { level: 1, name: "Arcane Recovery", description: "Once per day when you finish a Short Rest, recover expended spell slots with a combined level equal to up to half your Wizard level (rounded up)." },
            { level: 2, name: "Scholar", description: "Gain Expertise in one of your proficient skills from: Arcana, History, Nature, Medicine, or Religion." },
            { level: 3, name: "Wizard Subclass", description: "Choose an arcane tradition: Abjurer, Diviner, Evoker, or Illusionist." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Memorize Spell", description: "Whenever you finish a Short Rest, you can study your spellbook and replace one prepared spell with another from your book." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Arcane Tradition." },
            { level: 7, name: "4th-Level Spells", description: "You gain access to 4th-level spell slots." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Arcane Tradition." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level spell slots." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Arcane Tradition." },
            { level: 15, name: "8th-Level Spells", description: "You gain access to 8th-level spell slots." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level spell slots." },
            { level: 18, name: "Spell Mastery", description: "Choose one 1st-level and one 2nd-level wizard spell from your spellbook. Cast each at its lowest level at will without expending a spell slot." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Signature Spells", description: "Choose two 3rd-level wizard spells as signature spells. They are always prepared, and you can cast each once per Short or Long Rest without a spell slot." }
        ],
        subclasses: [
            {
                id: "abjurer",
                name: "Abjurer",
                description: "Arcane Ward absorbs damage equal to 2x Wizard level + Int modifier, Project Ward.",
                features: [
                    { level: 3, name: "Arcane Ward", description: "Whenever you cast an Abjuration spell with a spell slot, you create a protective ward that has HP equal to twice your Wizard level + your Intelligence modifier, absorbing damage taken." },
                    { level: 6, name: "Projected Ward", description: "When a creature that you can see within 30 feet takes damage, you can use your Reaction to intercept that damage with your Arcane Ward." },
                    { level: 10, name: "Spell Breaker", description: "You always have Counterspell and Dispel Magic prepared. In addition, you can cast Counterspell or Dispel Magic as a Bonus Action." },
                    { level: 14, name: "Spell Resistance", description: "You have Advantage on saving throws against spells, and you have resistance against damage from spells." }
                ]
            },
            {
                id: "diviner",
                name: "Diviner",
                description: "Portent rolls 2 d20s at the end of a Long Rest to replace any d20 roll.",
                features: [
                    { level: 3, name: "Portent", description: "When you finish a Long Rest, roll two d20s and record the numbers. You can replace any attack roll, saving throw, or ability check made by you or a creature you can see with one of the foretold rolls." },
                    { level: 6, name: "Expert Divination", description: "Casting a Divination spell of 2nd level or higher regains an expended spell slot of a lower level." },
                    { level: 10, name: "The Third Eye", description: "Action to gain one magical sight benefit until incapacitated or taking a rest: Darkvision 60 ft, Ethereal Sight, Greater Comprehension, or See Invisibility." },
                    { level: 14, name: "Greater Portent", description: "The visions in your dreams intensify. You roll three d20s for your Portent feature instead of two." }
                ]
            },
            {
                id: "evoker",
                name: "Evoker",
                description: "Sculpt Spells protects allies from area-of-effect spells, Potent Cantrip.",
                features: [
                    { level: 3, name: "Sculpt Spells", description: "When you cast an Evocation spell that affects other creatures you can see, you can choose a number of them equal to 1 + the spell's level. The chosen creatures automatically succeed on their saving throws and take no damage." },
                    { level: 6, name: "Potent Cantrip", description: "Your damaging cantrips affect even creatures that avoid the brunt of the effect: creature takes half damage on a successful save or missed attack." },
                    { level: 10, name: "Empowered Evocation", description: "You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast." },
                    { level: 14, name: "Overchannel", description: "When you cast a wizard spell of 1st through 5th level that deals damage, you can maximize the damage dice of the spell. Subsequent uses before a Long Rest deal necrotic damage to you." }
                ]
            },
            {
                id: "illusionist",
                name: "Illusionist",
                description: "Improved Minor Illusion, Malleable Illusions reshape active illusions.",
                features: [
                    { level: 3, name: "Improved Minor Illusion", description: "You learn the Minor Illusion cantrip. You can cast it as a Bonus Action and can create both a sound and an image with a single casting." },
                    { level: 6, name: "Malleable Illusions", description: "When you cast an illusion spell with a duration of 1 minute or longer, you can use your action to change the nature of that illusion." },
                    { level: 10, name: "Illusory Self", description: "Reaction when a creature makes an attack roll against you to interpose an illusory duplicate, causing the attack to miss automatically once per Short or Long Rest." },
                    { level: 14, name: "Illusory Reality", description: "Bonus Action to make one inanimate, nonmagical object that is part of an illusion you cast real for 1 minute." }
                ]
            }
        ],
        startingEquipmentOptions: [
            { name: "Quarterstaff, Spellbook & Scholar's Pack", items: ["Quarterstaff", "Spellbook", "Arcane Focus (Orb)", "Scholar's Pack", "5 GP"] },
            { name: "Gold Purchase (55 GP)", items: ["55 GP"] }
        ]
    }
];
