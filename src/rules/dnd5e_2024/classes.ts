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
            { level: 5, name: "Extra Attack", description: "You can attack twice instead of once whenever you take the Attack action." },
            { level: 5, name: "Fast Movement", description: "Speed increases by 10 feet while not wearing Heavy armor." }
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
            { level: 1, name: "Bardic Inspiration", description: "Bonus Action to inspire another creature within 60 ft with a d6 Inspiration die (Charisma modifier uses per Long Rest, short rest at lvl 5)." },
            { level: 1, name: "Spellcasting", description: "Cast bard spells using Charisma as your spellcasting ability." },
            { level: 2, name: "Expertise", description: "Double proficiency bonus on two chosen skills." },
            { level: 2, name: "Jack of All Trades", description: "Add half your proficiency bonus to any ability check that doesn't already include it." },
            { level: 3, name: "Bard Subclass", description: "Choose a subclass: College of Dance, College of Glamour, College of Lore, or College of Valor." }
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
            { level: 1, name: "Divine Order", description: "Choose Protector (Martial weapons and Heavy armor proficiency) or Thaumaturge (extra Sacred Flame / cantrip and Arcana/Religion bonus)." },
            { level: 1, name: "Spellcasting", description: "Cast cleric spells using Wisdom as your spellcasting ability." },
            { level: 2, name: "Channel Divinity", description: "Channel holy energy: Divine Spark or Turn Undead. Usable 2/Short or Long Rest." },
            { level: 3, name: "Cleric Subclass", description: "Choose a domain: Life Domain, Light Domain, Trickery Domain, or War Domain." }
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
            { level: 3, name: "Druid Subclass", description: "Choose a circle: Circle of the Land, Circle of the Moon, Circle of the Sea, or Circle of the Stars." }
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
            { level: 1, name: "Weapon Mastery", description: "Master 3 kinds of weapons of your choice." },
            { level: 2, name: "Action Surge", description: "Take one additional action on your turn once per Short or Long Rest." },
            { level: 2, name: "Tactical Mind", description: "Expend Second Wind to add 1d10 to a failed ability check." },
            { level: 3, name: "Fighter Subclass", description: "Choose an archetype: Battle Master, Champion, Eldritch Knight, or Psi Warrior." },
            { level: 5, name: "Extra Attack", description: "Attack twice whenever you take the Attack action." }
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
            { level: 1, name: "Martial Arts", description: "Use Dex instead of Str for unarmed strikes and monk weapons. Unarmed strike damage is 1d6 (scales to d8/d10/d12). Bonus Action unarmed strike." },
            { level: 1, name: "Unarmored Defense", description: "AC equals 10 + Dex modifier + Wis modifier while not wearing armor or shield." },
            { level: 2, name: "Monk's Focus", description: "Focus Points equal to Monk level. Flurry of Blows (2 unarmed strikes), Patient Defense (Dodge + Disengage), Step of the Wind (Dash + jump)." },
            { level: 2, name: "Unarmored Movement", description: "Speed increases by 10 ft while not wearing armor." },
            { level: 3, name: "Monk Subclass", description: "Choose a tradition: Warrior of the Open Hand, Warrior of Shadow, Warrior of Mercy, or Warrior of Elements." },
            { level: 3, name: "Deflect Attacks", description: "Reaction to reduce bludgeoning, piercing, or slashing damage by 1d10 + Dex mod + Monk level; redirect attack if reduced to 0." }
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
            { level: 3, name: "Channel Divinity", description: "Sacred power options depending on sacred oath." },
            { level: 3, name: "Paladin Subclass", description: "Choose an Oath: Oath of Devotion, Oath of Glory, Oath of the Ancients, or Oath of Vengeance." }
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
            { level: 2, name: "Deft Explorer", description: "Expertise in one skill, and gain swimming & climbing speed equal to walking speed at lvl 6." },
            { level: 2, name: "Fighting Style", description: "Choose Archery, Defense, Dueling, or Two-Weapon Fighting." },
            { level: 3, name: "Ranger Subclass", description: "Choose an archetype: Beast Master, Fey Wanderer, Gloom Stalker, or Hunter." }
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
            { level: 1, name: "Sneak Attack", description: "Once per turn, deal an extra 1d6 damage (scales +1d6 every 2 levels) to one creature you hit with an attack if you have Advantage or an active ally within 5 ft." },
            { level: 1, name: "Expertise", description: "Double proficiency bonus on two chosen skills or thieves' tools." },
            { level: 1, name: "Thieves' Cant", description: "You know Thieves' Cant and one other language of your choice." },
            { level: 1, name: "Weapon Mastery", description: "Master 2 kinds of weapons of your choice." },
            { level: 2, name: "Cunning Action", description: "Bonus Action to take Dash, Disengage, or Hide." },
            { level: 3, name: "Rogue Subclass", description: "Choose a roguish archetype: Arcane Trickster, Assassin, Soulknife, or Thief." },
            { level: 5, name: "Uncanny Dodge", description: "Reaction to halve the damage taken from an attack you can see." }
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
            { level: 3, name: "Sorcerer Subclass", description: "Choose an origin: Draconic Sorcery, Wild Magic Sorcery, Aberrant Sorcery, or Clockwork Sorcery." }
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
            { level: 1, name: "Eldritch Invocations", description: "Gain 1 Eldritch Invocation at level 1 (e.g. Pact of the Blade, Pact of the Tome, Pact of the Chain, Agonizing Blast, Armor of Shadows)." },
            { level: 1, name: "Pact Magic", description: "Cast warlock spells using Charisma. All spell slots are of the highest unlocked level and recharge on a Short or Long Rest." },
            { level: 2, name: "Magical Cunning", description: "Regain half your pact spell slots once per Long Rest with a 1-minute ritual." },
            { level: 3, name: "Warlock Subclass", description: "Choose a patron: Fiend Patron, Archfey Patron, Celestial Patron, or Great Old One Patron." }
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
            { level: 3, name: "Wizard Subclass", description: "Choose an arcane tradition: Abjurer, Diviner, Evoker, or Illusionist." }
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
