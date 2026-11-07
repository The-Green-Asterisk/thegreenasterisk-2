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
            { level: 1, name: "Rage", description: "In battle, you fight with primal ferocity. Bonus Action to enter; bonus damage, Advantage on Str checks/saves, resistance to Bludgeoning/Piercing/Slashing damage." },
            { level: 1, name: "Unarmored Defense", description: "While not wearing armor, your AC equals 10 + Dex modifier + Con modifier + Shield." },
            { level: 1, name: "Weapon Mastery", description: "You gain mastery with 2 kinds of simple or martial melee weapons." },
            { level: 2, name: "Reckless Attack", description: "Gain Advantage on melee attack rolls using Strength, but attacks against you have Advantage until your next turn." },
            { level: 2, name: "Danger Sense", description: "Advantage on Dexterity saving throws against effects you can see." },
            { level: 3, name: "Barbarian Subclass", description: "Choose a subclass: Path of the Berserker, Path of the Wild Heart, Path of the World Tree, or Path of the Zealot." },
            { level: 3, name: "Primal Knowledge", description: "Gain proficiency in one additional barbarian skill. While raging, you can make Acrobatics, Intimidation, Perception, Stealth, or Survival checks using Strength." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action." },
            { level: 5, name: "Fast Movement", description: "Speed increases by 10 feet while not wearing Heavy armor." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Barbarian primal path." },
            { level: 7, name: "Feral Instinct", description: "Gain Advantage on Initiative rolls." },
            { level: 7, name: "Instinctive Pounce", description: "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Brutal Strike", description: "Forgo Advantage on a Reckless Attack to deal +1d10 damage and apply a Brutal Strike effect (Forceful Blow or Hamstring Blow)." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Barbarian primal path." },
            { level: 11, name: "Relentless Rage", description: "If you drop to 0 HP while raging, succeed on a DC 10 Con save to drop to HP equal to twice your Barbarian level instead." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "Improved Brutal Strike", description: "Brutal Strike damage increases to 2d10; gain Staggering Blow and Sundering Blow options." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Barbarian primal path." },
            { level: 15, name: "Persistent Rage", description: "Rage lasts until incapacitated or donning heavy armor; regain all expended Rage uses once per Long Rest." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Improved Brutal Strike (2)", description: "Brutal Strike damage increases to 3d10; you can apply two different Brutal Strike effects to the same strike." },
            { level: 18, name: "Indomitable Might", description: "If a Strength check or saving throw total is less than your Strength score, you can use that score instead." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Primal Champion", description: "Your Strength and Constitution scores increase by 4, up to a maximum of 25." }
        ],
        subclasses: [
            { id: "berserker", name: "Path of the Berserker", description: "Frenzy extra damage, Mindless Rage immune to Charmed/Frightened.", features: [] },
            { id: "wild-heart", name: "Path of the Wild Heart", description: "Aspects of Bear, Eagle, or Wolf augment your Rage.", features: [] },
            { id: "world-tree", name: "Path of the World Tree", description: "Vitality of the Tree gives temporary hit points and teleportation branches.", features: [] },
            { id: "zealot", name: "Path of the Zealot", description: "Divine fury infuses weapon strikes with radiant or necrotic energy.", features: [] }
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
            { level: 1, name: "Bardic Inspiration (d6)", description: "Bonus Action to inspire another creature within 60 ft with a d6 Inspiration die (Charisma modifier uses per Long Rest)." },
            { level: 1, name: "Spellcasting", description: "Cast bard spells using Charisma as your spellcasting ability." },
            { level: 2, name: "Expertise", description: "Double proficiency bonus on two chosen skills." },
            { level: 2, name: "Jack of All Trades", description: "Add half your proficiency bonus to any ability check that doesn't already include it." },
            { level: 3, name: "Bard Subclass", description: "Choose a subclass: College of Dance, College of Glamour, College of Lore, or College of Valor." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Font of Inspiration", description: "Regain all expended uses of Bardic Inspiration when you finish a Short or Long Rest." },
            { level: 5, name: "Bardic Inspiration (d8)", description: "Your Bardic Inspiration die increases to a d8." },
            { level: 6, name: "Countercharm", description: "Reaction to protect allies within 30 ft against Charmed or Frightened conditions, granting a reroll with Advantage." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Bard college." },
            { level: 7, name: "4th-Level Spells", description: "You gain access to 4th-level spell slots." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 10, name: "Magical Secrets", description: "You can prepare spells from the Cleric, Druid, and Wizard spell lists in addition to the Bard list." },
            { level: 10, name: "Bardic Inspiration (d10)", description: "Your Bardic Inspiration die increases to a d10." },
            { level: 10, name: "Expertise (2 Additional)", description: "Double proficiency bonus on two additional chosen skills." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level spell slots." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Bard college." },
            { level: 15, name: "Bardic Inspiration (d12)", description: "Your Bardic Inspiration die increases to a d12." },
            { level: 15, name: "8th-Level Spells", description: "You gain access to 8th-level spell slots." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level spell slots." },
            { level: 18, name: "Superior Inspiration", description: "When you roll Initiative and have fewer than two uses of Bardic Inspiration remaining, you regain uses until you have two." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Words of Creation", description: "Always have Power Word Heal and Power Word Kill prepared; can target two creatures with them simultaneously." }
        ],
        subclasses: [
            { id: "lore", name: "College of Lore", description: "Cutting Words, 3 bonus proficiencies, Magical Discoveries.", features: [] },
            { id: "dance", name: "College of Dance", description: "Unarmored Defense, Dazzling Footwork, Agile Strikes.", features: [] },
            { id: "glamour", name: "College of Glamour", description: "Mantle of Inspiration, Enthralling Performance, Mantle of Majesty.", features: [] },
            { id: "valor", name: "College of Valor", description: "Combat Inspiration, martial weapon proficiencies, Extra Attack.", features: [] }
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
            { level: 1, name: "Divine Order", description: "Choose Protector (Martial weapons and Heavy armor proficiency) or Thaumaturge (extra Sacred Flame cantrip and Arcana/Religion bonus)." },
            { level: 1, name: "Spellcasting", description: "Cast cleric spells using Wisdom as your spellcasting ability." },
            { level: 2, name: "Channel Divinity (2/Rest)", description: "Channel holy energy: Divine Spark or Turn Undead. Usable 2 times per Short or Long Rest." },
            { level: 3, name: "Cleric Subclass", description: "Choose a domain: Life Domain, Light Domain, Trickery Domain, or War Domain." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 5, name: "Smite Undead", description: "When you use Turn Undead, deal radiant damage equal to Wisdom modifier d8s to affected undead." },
            { level: 6, name: "Channel Divinity (3/Rest)", description: "You can now use Channel Divinity 3 times per Short or Long Rest." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Divine Domain." },
            { level: 7, name: "Blessed Strikes", description: "Choose Divine Strike (+1d8 radiant/necrotic weapon damage) or Potent Spellcasting (add Wis mod to cantrips)." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 10, name: "Divine Intervention", description: "Action to call upon your deity: automatically cast any Cleric spell of level 5 or lower without a spell slot. Recharges on Long Rest." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level spell slots." },
            { level: 14, name: "Improved Blessed Strikes", description: "Divine Strike damage increases to 2d8, or Potent Spellcasting grants temp HP equal to 2x Wis mod to yourself or an ally." },
            { level: 15, name: "8th-Level Spells", description: "You gain access to 8th-level spell slots." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Subclass Feature", description: "Gain a feature granted by your chosen Divine Domain." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level spell slots." },
            { level: 18, name: "Channel Divinity (4/Rest)", description: "You can now use Channel Divinity 4 times per Short or Long Rest." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Greater Divine Intervention", description: "Divine Intervention can now duplicate the Wish spell without risking losing the ability. Recharges in 2d4 Long Rests." }
        ],
        subclasses: [
            { id: "life", name: "Life Domain", description: "Disciple of Life boosts healing spells, Preserve Life Channel Divinity.", features: [] },
            { id: "light", name: "Light Domain", description: "Warding Flare imposes disadvantage, Radiance of the Dawn radiant blast.", features: [] },
            { id: "trickery", name: "Trickery Domain", description: "Invoke Duplicity illusion clone, Blessing of the Trickster stealth.", features: [] },
            { id: "war", name: "War Domain", description: "War Priest bonus action attack, Guided Strike +10 to hit.", features: [] }
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
            { level: 1, name: "Primal Order", description: "Choose Magician (bonus cantrip, Nature/Arcana checks) or Warden (Medium Armor and Martial Weapons)." },
            { level: 1, name: "Spellcasting", description: "Cast primal spells using Wisdom." },
            { level: 2, name: "Wild Shape", description: "Transform into Beast shapes as a Bonus Action. Gain temp HP equal to your Druid level and beast statistics." },
            { level: 2, name: "Wild Companion", description: "Cast Find Familiar without material components using Wild Shape." },
            { level: 3, name: "Druid Subclass", description: "Choose a circle: Circle of the Land, Circle of the Moon, Circle of the Sea, or Circle of the Stars." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 4, name: "Wild Shape (Swim Form)", description: "You can now transform into beasts that have a swimming speed." },
            { level: 5, name: "Wild Resurgence", description: "Once per turn, convert a spell slot to a use of Wild Shape, or expend a Wild Shape to regain a 1st-level spell slot." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Druid circle." },
            { level: 7, name: "Elemental Fury", description: "Choose Primal Strike (+1d8 cold, fire, lightning, or thunder damage to attacks) or Potent Spellcasting (add Wis mod to cantrips)." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 8, name: "Wild Shape (Fly Form)", description: "You can now transform into beasts that have a flying speed." },
            { level: 9, name: "5th-Level Spells", description: "You gain access to 5th-level spell slots." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Druid circle." },
            { level: 11, name: "6th-Level Spells", description: "You gain access to 6th-level spell slots." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "7th-Level Spells", description: "You gain access to 7th-level spell slots." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Druid circle." },
            { level: 15, name: "Improved Elemental Fury", description: "Primal Strike damage increases to 2d8, or Potent Spellcasting range increases by 300 ft." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "9th-Level Spells", description: "You gain access to 9th-level spell slots." },
            { level: 18, name: "Beast Spells", description: "Cast spells with verbal and somatic components while transformed in Wild Shape." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Archdruid", description: "Regain 1 expended Wild Shape on rolling Initiative; convert Wild Shape into spell slots with Wild Resurgence; age 10 times slower." }
        ],
        subclasses: [
            { id: "moon", name: "Circle of the Moon", description: "Combat Wild Shape, Circle Forms with enhanced armor and radiant strikes.", features: [] },
            { id: "land", name: "Circle of the Land", description: "Biome affinity (Arid, Polar, Temperate, Tropical), Natural Recovery.", features: [] },
            { id: "sea", name: "Circle of the Sea", description: "Wrath of the Sea tempest aura, aquatic affinity.", features: [] },
            { id: "stars", name: "Circle of the Stars", description: "Star Map, Starry Form (Archer, Chalice, Dragon), Cosmic Omen.", features: [] }
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
            { level: 1, name: "Fighting Style", description: "Choose a Fighting Style feat: Archery, Defense, Dueling, Great Weapon Fighting, Protection, Two-Weapon Fighting." },
            { level: 1, name: "Second Wind", description: "Bonus Action to regain 1d10 + Fighter level HP. Regain uses on short/long rests." },
            { level: 1, name: "Weapon Mastery (3 Weapons)", description: "Master 3 kinds of weapons of your choice." },
            { level: 2, name: "Action Surge", description: "Take one additional action on your turn once per Short or Long Rest." },
            { level: 2, name: "Tactical Mind", description: "Expend Second Wind to add 1d10 to a failed ability check." },
            { level: 3, name: "Fighter Subclass", description: "Choose an archetype: Battle Master, Champion, Eldritch Knight, or Psi Warrior." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 4, name: "Weapon Mastery (4 Weapons)", description: "Your weapon mastery capacity increases to 4 weapons." },
            { level: 5, name: "Extra Attack", description: "Attack twice whenever you take the Attack action." },
            { level: 5, name: "Tactical Shift", description: "Whenever you activate Second Wind, you can move up to half your speed without provoking opportunity attacks." },
            { level: 6, name: "Ability Score Improvement (Fighter Bonus)", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 7, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Indomitable (1/LR)", description: "Reroll a failed saving throw with a bonus equal to your Fighter level. Usable 1 time per Long Rest." },
            { level: 9, name: "Tactical Master", description: "When attacking with a mastery weapon, you can swap its mastery property for Push, Sap, or Slow." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 10, name: "Weapon Mastery (5 Weapons)", description: "Your weapon mastery capacity increases to 5 weapons." },
            { level: 11, name: "Two Extra Attacks", description: "You can attack three times whenever you take the Attack action." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "Indomitable (2/LR)", description: "You can now use Indomitable twice per Long Rest." },
            { level: 13, name: "Studied Attacks", description: "If you miss an attack roll, you have Advantage on your next attack roll against that target before the end of your next turn." },
            { level: 14, name: "Ability Score Improvement (Fighter Bonus)", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 15, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 16, name: "Weapon Mastery (6 Weapons)", description: "Your weapon mastery capacity increases to 6 weapons." },
            { level: 17, name: "Action Surge (2/Rest)", description: "You can use Action Surge twice per Short or Long Rest, though only once on a turn." },
            { level: 17, name: "Indomitable (3/LR)", description: "You can now use Indomitable three times per Long Rest." },
            { level: 18, name: "Subclass Feature", description: "Gain a feature granted by your chosen Fighter archetype." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Three Extra Attacks", description: "You can attack four times whenever you take the Attack action." }
        ],
        subclasses: [
            { id: "champion", name: "Champion", description: "Improved Critical (19-20), Remarkable Athlete, Heroic Warrior inspiration.", features: [] },
            { id: "battle-master", name: "Battle Master", description: "Maneuvers and Superiority Dice (d8s) to trip, disarm, or rally allies.", features: [] },
            { id: "eldritch-knight", name: "Eldritch Knight", description: "Arcane spellcasting (Wizard spells), Weapon Bond, War Magic.", features: [] },
            { id: "psi-warrior", name: "Psi Warrior", description: "Psionic Power energy dice for telekinetic strikes and protective barriers.", features: [] }
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
            { level: 1, name: "Martial Arts (d6)", description: "Use Dex instead of Str for unarmed strikes and monk weapons. Unarmed strike damage is 1d6. Bonus Action unarmed strike." },
            { level: 1, name: "Unarmored Defense", description: "AC equals 10 + Dex modifier + Wis modifier while not wearing armor or shield." },
            { level: 2, name: "Monk's Focus", description: "Focus Points equal to Monk level. Flurry of Blows (2 unarmed strikes), Patient Defense (Dodge + Disengage), Step of the Wind (Dash + jump)." },
            { level: 2, name: "Unarmored Movement (+10 ft)", description: "Speed increases by 10 ft while not wearing armor or carrying a shield." },
            { level: 2, name: "Uncanny Metabolism", description: "When rolling Initiative, regain all expended Focus Points and regain HP equal to your martial arts die + Monk level (1/LR)." },
            { level: 3, name: "Monk Subclass", description: "Choose a tradition: Warrior of the Open Hand, Warrior of Shadow, Warrior of Mercy, or Warrior of Elements." },
            { level: 3, name: "Deflect Attacks", description: "Reaction to reduce bludgeoning, piercing, or slashing damage by 1d10 + Dex mod + Monk level; redirect attack if reduced to 0." },
            { level: 4, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 4, name: "Slow Fall", description: "Reaction to reduce falling damage by five times your Monk level." },
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action." },
            { level: 5, name: "Stunning Strike", description: "Spend 1 Focus Point on hit to force a Con save: Stunned until start of next turn, or half speed on success." },
            { level: 5, name: "Martial Arts (d8)", description: "Your Martial Arts unarmed strike die increases to 1d8." },
            { level: 6, name: "Empowered Strikes", description: "Your unarmed strikes can deal force damage instead of bludgeoning damage." },
            { level: 6, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 6, name: "Unarmored Movement (+15 ft)", description: "Your Unarmored Movement speed bonus increases to +15 ft." },
            { level: 7, name: "Evasion", description: "Dex saves for half damage deal 0 damage on success and half damage on failure." },
            { level: 8, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 9, name: "Acrobatic Movement", description: "You can move along vertical surfaces and across liquids on your turn without falling." },
            { level: 10, name: "Heightened Focus", description: "Flurry of Blows grants 3 unarmed strikes; Patient Defense gives temp HP; Step of the Wind allows carrying a willing creature." },
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 10, name: "Unarmored Movement (+20 ft)", description: "Your Unarmored Movement speed bonus increases to +20 ft." },
            { level: 11, name: "Martial Arts (d10)", description: "Your Martial Arts unarmed strike die increases to 1d10." },
            { level: 12, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 13, name: "Self-Restoration", description: "At the end of your turn, end Charmed, Frightened, or Poisoned conditions on yourself; forgo food and water." },
            { level: 14, name: "Deflect Energy", description: "Deflect Attacks can now deflect any damage type, not just bludgeoning, piercing, or slashing." },
            { level: 14, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 15, name: "Perfect Focus", description: "When rolling Initiative with 3 or fewer Focus Points, regain Focus Points until you have 4." },
            { level: 16, name: "Ability Score Improvement", description: "Gain the Ability Score Improvement feat or another feat for which you qualify." },
            { level: 17, name: "Martial Arts (d12)", description: "Your Martial Arts unarmed strike die increases to 1d12." },
            { level: 17, name: "Subclass Feature", description: "Gain a feature granted by your chosen Monk tradition." },
            { level: 18, name: "Superior Defense", description: "Bonus Action and 3 Focus Points to gain resistance to all damage except Force for 1 minute." },
            { level: 18, name: "Unarmored Movement (+30 ft)", description: "Your Unarmored Movement speed bonus increases to +30 ft." },
            { level: 19, name: "Epic Boon / Ability Score Improvement", description: "Choose an Epic Boon feat or another feat of your choice." },
            { level: 20, name: "Body and Mind", description: "Your Dexterity and Wisdom scores increase by 4, up to a maximum of 25." }
        ],
        subclasses: [
            { id: "open-hand", name: "Warrior of the Open Hand", description: "Open Hand Technique (knock prone, push 15 ft, prevent reactions), Wholeness of Body.", features: [] },
            { id: "shadow", name: "Warrior of Shadow", description: "Shadow Arts (Darkness spell, darkvision), Shadow Step teleportation.", features: [] },
            { id: "mercy", name: "Warrior of Mercy", description: "Hands of Harm and Hands of Healing using Focus Points.", features: [] },
            { id: "elements", name: "Warrior of Elements", description: "Elemental attunement reach, elemental bursts of fire, thunder, acid, or cold.", features: [] }
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
            { id: "devotion", name: "Oath of Devotion", description: "Sacred Weapon illuminates blade with Charisma bonus to hit, Aura of Devotion.", features: [] },
            { id: "ancients", name: "Oath of the Ancients", description: "Nature's Wrath ensnares foes, Aura of Warding resists spell damage.", features: [] },
            { id: "vengeance", name: "Oath of Vengeance", description: "Vow of Enmity grants Advantage against a single foe, Relentless Avenger.", features: [] },
            { id: "glory", name: "Oath of Glory", description: "Peerless Athlete, Inspiring Smite grants temporary hit points to allies.", features: [] }
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
            { id: "gloom-stalker", name: "Gloom Stalker", description: "Dread Ambusher, Umbral Sight (extra darkvision and invisible to darkvision).", features: [] },
            { id: "hunter", name: "Hunter", description: "Hunter's Prey (Colossus Slayer), Defensive Tactics.", features: [] },
            { id: "beast-master", name: "Beast Master", description: "Primal Companion (Beast of the Land, Sea, or Sky).", features: [] },
            { id: "fey-wanderer", name: "Fey Wanderer", description: "Dreadful Strikes psychic damage, Otherworldly Glamour adds Wisdom to Charisma checks.", features: [] }
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
            { id: "thief", name: "Thief", description: "Fast Hands (Bonus Action use object or Sleight of Hand), Second-Story Work climbing speed.", features: [] },
            { id: "assassin", name: "Assassin", description: "Assassinate (Advantage on un-acted targets, bonus damage), Infiltration Expertise.", features: [] },
            { id: "soulknife", name: "Soulknife", description: "Psychic Blades, Psionic Power dice for skill checks and telepathic whispers.", features: [] },
            { id: "arcane-trickster", name: "Arcane Trickster", description: "Mage Hand Legerdemain, Illusion and Enchantment arcane spellcasting.", features: [] }
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
            { level: 10, name: "Subclass Feature", description: "Gain a feature granted by your chosen Sorcerer origin." },
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
            { id: "draconic", name: "Draconic Sorcery", description: "Draconic Resilience (AC 10 + Dex + Cha, +1 HP per level), Elemental Affinity.", features: [] },
            { id: "wild-magic", name: "Wild Magic Sorcery", description: "Wild Magic Surge, Tides of Chaos Advantage.", features: [] },
            { id: "aberrant", name: "Aberrant Sorcery", description: "Psionic Spells, Telepathic Speech, Psionic Sorcery.", features: [] },
            { id: "clockwork", name: "Clockwork Sorcery", description: "Clockwork Magic, Restore Balance cancels Advantage/Disadvantage.", features: [] }
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
            { id: "fiend", name: "Fiend Patron", description: "Dark One's Blessing (temporary HP on kill), Dark One's Own Luck (add 1d10 to ability check/save).", features: [] },
            { id: "archfey", name: "Archfey Patron", description: "Misty Escape (teleport when taking damage), Steps of the Fey enhancements.", features: [] },
            { id: "celestial", name: "Celestial Patron", description: "Healing Light (pool of d6 healing dice), Radiant Soul bonus radiant/fire damage.", features: [] },
            { id: "great-old-one", name: "Great Old One Patron", description: "Awakened Mind (telepathic communication), Psychic Spells, Thought Shield.", features: [] }
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
            { id: "evoker", name: "Evoker", description: "Sculpt Spells protects allies from area-of-effect spells, Potent Cantrip.", features: [] },
            { id: "abjurer", name: "Abjurer", description: "Arcane Ward absorbs damage equal to 2x Wizard level + Int modifier, Project Ward.", features: [] },
            { id: "diviner", name: "Diviner", description: "Portent rolls 2 d20s at the end of a Long Rest to replace any d20 roll.", features: [] },
            { id: "illusionist", name: "Illusionist", description: "Improved Minor Illusion, Malleable Illusions reshape active illusions.", features: [] }
        ],
        startingEquipmentOptions: [
            { name: "Quarterstaff, Spellbook & Scholar's Pack", items: ["Quarterstaff", "Spellbook", "Arcane Focus (Orb)", "Scholar's Pack", "5 GP"] },
            { name: "Gold Purchase (55 GP)", items: ["55 GP"] }
        ]
    }
];
