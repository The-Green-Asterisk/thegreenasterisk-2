// Automatically generated from 2024 rules definitions
export const SEED_CLASSES = [
    {
        "id": "barbarian",
        "name": "Barbarian",
        "description": "A fierce warrior driven by primal fury, entering battle in a battle rage.",
        "hitDie": 12,
        "primaryAbilities": [
            "str",
            "con"
        ],
        "savingThrows": [
            "str",
            "con"
        ],
        "armorProficiencies": [
            "Light Armor",
            "Medium Armor",
            "Shields"
        ],
        "weaponProficiencies": [
            "Simple Weapons",
            "Martial Weapons"
        ],
        "weaponMasteryCount": 2,
        "skillChoices": {
            "count": 2,
            "from": [
                "Animal Handling",
                "Athletics",
                "Intimidation",
                "Nature",
                "Perception",
                "Survival"
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Rage",
                "description": "In battle, you fight with primal ferocity. Bonus Action to enter; bonus damage, Advantage on Str checks/saves, resistance to Bludgeoning/Piercing/Slashing damage."
            },
            {
                "level": 1,
                "name": "Unarmored Defense",
                "description": "While not wearing armor, your AC equals 10 + Dex modifier + Con modifier + Shield."
            },
            {
                "level": 1,
                "name": "Weapon Mastery",
                "description": "You gain mastery with 2 kinds of simple or martial melee weapons."
            },
            {
                "level": 2,
                "name": "Reckless Attack",
                "description": "Gain Advantage on melee attack rolls using Strength, but attacks against you have Advantage until your next turn."
            },
            {
                "level": 2,
                "name": "Danger Sense",
                "description": "Advantage on Dexterity saving throws against effects you can see."
            },
            {
                "level": 3,
                "name": "Barbarian Subclass",
                "description": "Choose a subclass: Path of the Berserker, Path of the Wild Heart, Path of the World Tree, or Path of the Zealot."
            },
            {
                "level": 3,
                "name": "Primal Knowledge",
                "description": "Gain proficiency in one additional barbarian skill. While raging, you can make Acrobatics, Intimidation, Perception, Stealth, or Survival checks using Strength."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action."
            },
            {
                "level": 5,
                "name": "Fast Movement",
                "description": "Speed increases by 10 feet while not wearing Heavy armor."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Barbarian primal path."
            },
            {
                "level": 7,
                "name": "Feral Instinct",
                "description": "Gain Advantage on Initiative rolls."
            },
            {
                "level": 7,
                "name": "Instinctive Pounce",
                "description": "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Brutal Strike",
                "description": "Forgo Advantage on a Reckless Attack to deal +1d10 damage and apply a Brutal Strike effect (Forceful Blow or Hamstring Blow)."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Barbarian primal path."
            },
            {
                "level": 11,
                "name": "Relentless Rage",
                "description": "If you drop to 0 HP while raging, succeed on a DC 10 Con save to drop to HP equal to twice your Barbarian level instead."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "Improved Brutal Strike",
                "description": "Brutal Strike damage increases to 2d10; gain Staggering Blow and Sundering Blow options."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Barbarian primal path."
            },
            {
                "level": 15,
                "name": "Persistent Rage",
                "description": "Rage lasts until incapacitated or donning heavy armor; regain all expended Rage uses once per Long Rest."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Improved Brutal Strike (2)",
                "description": "Brutal Strike damage increases to 3d10; you can apply two different Brutal Strike effects to the same strike."
            },
            {
                "level": 18,
                "name": "Indomitable Might",
                "description": "If a Strength check or saving throw total is less than your Strength score, you can use that score instead."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Primal Champion",
                "description": "Your Strength and Constitution scores increase by 4, up to a maximum of 25."
            }
        ],
        "subclasses": [
            {
                "id": "berserker",
                "name": "Path of the Berserker",
                "description": "Frenzy extra damage, Mindless Rage immune to Charmed/Frightened.",
                "features": [
                    {
                        "level": 3,
                        "name": "Frenzy",
                        "description": "While raging, make an attack as a Bonus Action and deal extra Frenzy damage (1d6, scaling with level) on hit."
                    },
                    {
                        "level": 6,
                        "name": "Mindless Rage",
                        "description": "You are immune to Charmed and Frightened while raging, and entering Rage immediately suspends both conditions."
                    },
                    {
                        "level": 10,
                        "name": "Retaliation",
                        "description": "When you take damage from a creature within 5 feet of you, you can use a Reaction to make a melee attack against that creature."
                    },
                    {
                        "level": 14,
                        "name": "Intimidating Presence",
                        "description": "Bonus Action to unleash a terrifying roar; creatures within 30 feet become Frightened on a failed Wisdom saving throw."
                    }
                ]
            },
            {
                "id": "wild-heart",
                "name": "Path of the Wild Heart",
                "description": "Aspects of Bear, Eagle, or Wolf augment your Rage.",
                "features": [
                    {
                        "level": 3,
                        "name": "Rage of the Wilds",
                        "description": "Choose Bear (resistance to all damage except Force), Eagle (Dash and Disengage as Bonus Action), or Wolf (allies have Advantage on melee attacks against enemies within 5 ft) when entering Rage."
                    },
                    {
                        "level": 6,
                        "name": "Aspect of the Beast",
                        "description": "Choose an animal aspect: Elephant (Athletics Advantage, doubled carrying capacity), Owl (Darkvision 60 ft, Perception Advantage), Panther (Climb speed equal to Speed), Pike (Swim speed equal to Speed), or Spider (Climb speed equal to Speed with spider climb)."
                    },
                    {
                        "level": 10,
                        "name": "Nature Speaker",
                        "description": "You can cast Commune with Nature as a ritual without expending a spell slot."
                    },
                    {
                        "level": 14,
                        "name": "Totemic Attunement",
                        "description": "Choose Falcon (gain a flying speed equal to your walking speed while raging), Lion (enemies within 5 ft have Disadvantage on attacks against targets other than you), or Ram (melee attacks knock Large or smaller creatures prone)."
                    }
                ]
            },
            {
                "id": "world-tree",
                "name": "Path of the World Tree",
                "description": "Vitality of the Tree gives temporary hit points and teleportation branches.",
                "features": [
                    {
                        "level": 3,
                        "name": "Vitality of the Tree",
                        "description": "When you enter Rage and at the start of each of your turns while raging, grant temporary hit points equal to your Barbarian level to yourself or an ally within 10 feet."
                    },
                    {
                        "level": 6,
                        "name": "Branches of the Tree",
                        "description": "Reaction when a creature ends its turn within 30 feet to teleport it to an unoccupied space within 5 feet of you and reduce its speed to 0 until the end of the turn."
                    },
                    {
                        "level": 10,
                        "name": "Battering Roots",
                        "description": "Tendrils of the World Tree extend your melee reach by 10 feet when using Heavy or Versatile weapons, and you can apply Push or Topple on hit."
                    },
                    {
                        "level": 14,
                        "name": "Travel Along the Tree",
                        "description": "As a Bonus Action while raging, teleport up to 60 feet to an unoccupied space you can see, bringing along up to 6 willing creatures within 10 feet."
                    }
                ]
            },
            {
                "id": "zealot",
                "name": "Path of the Zealot",
                "description": "Divine fury infuses weapon strikes with radiant or necrotic energy.",
                "features": [
                    {
                        "level": 3,
                        "name": "Divine Fury",
                        "description": "The first creature you hit on each of your turns with a weapon attack while raging takes extra 1d6 + half Barbarian level Radiant or Necrotic damage."
                    },
                    {
                        "level": 3,
                        "name": "Warrior of the Gods",
                        "description": "Spells that restore you to life (such as Revivify or Raise Dead) do not consume material components."
                    },
                    {
                        "level": 6,
                        "name": "Fanatical Focus",
                        "description": "If you fail a saving throw while raging, you can reroll it and must use the new roll. Usable once per Rage."
                    },
                    {
                        "level": 10,
                        "name": "Zealous Presence",
                        "description": "Bonus Action to inspire up to 10 allies within 60 feet, granting them Advantage on attack rolls and saving throws until the start of your next turn."
                    },
                    {
                        "level": 14,
                        "name": "Rage of the Gods",
                        "description": "When reduced to 0 HP while raging, you do not drop unconscious and can continue fighting until your Rage ends."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Greataxe & Handaxes",
                "items": [
                    "Greataxe",
                    "Handaxe (2)",
                    "Explorer's Pack",
                    "15 GP"
                ]
            },
            {
                "name": "Gold Purchase (75 GP)",
                "items": [
                    "75 GP"
                ]
            }
        ]
    },
    {
        "id": "bard",
        "name": "Bard",
        "description": "An inspiring magician whose power echoes the music of creation.",
        "hitDie": 8,
        "primaryAbilities": [
            "cha",
            "dex"
        ],
        "savingThrows": [
            "dex",
            "cha"
        ],
        "armorProficiencies": [
            "Light Armor"
        ],
        "weaponProficiencies": [
            "Simple Weapons"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 3,
            "from": [
                "Acrobatics",
                "Animal Handling",
                "Arcana",
                "Athletics",
                "Deception",
                "History",
                "Insight",
                "Intimidation",
                "Investigation",
                "Medicine",
                "Nature",
                "Perception",
                "Performance",
                "Persuasion",
                "Religion",
                "Sleight of Hand",
                "Stealth",
                "Survival"
            ]
        },
        "spellcasting": {
            "ability": "cha",
            "type": "full",
            "cantripsKnownByLevel": [
                2,
                2,
                2,
                3,
                3,
                3,
                3,
                3,
                3,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4
            ],
            "preparedSpellsByLevel": [
                4,
                5,
                6,
                7,
                9,
                10,
                11,
                12,
                14,
                15,
                16,
                16,
                17,
                17,
                18,
                18,
                19,
                20,
                21,
                22
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    2,
                    1,
                    1
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Bardic Inspiration (d6)",
                "description": "Bonus Action to inspire another creature within 60 ft with a d6 Inspiration die (Charisma modifier uses per Long Rest)."
            },
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "Cast bard spells using Charisma as your spellcasting ability."
            },
            {
                "level": 2,
                "name": "Expertise",
                "description": "Double proficiency bonus on two chosen skills."
            },
            {
                "level": 2,
                "name": "Jack of All Trades",
                "description": "Add half your proficiency bonus to any ability check that doesn't already include it."
            },
            {
                "level": 3,
                "name": "Bard Subclass",
                "description": "Choose a subclass: College of Dance, College of Glamour, College of Lore, or College of Valor."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Font of Inspiration",
                "description": "Regain all expended uses of Bardic Inspiration when you finish a Short or Long Rest."
            },
            {
                "level": 5,
                "name": "Bardic Inspiration (d8)",
                "description": "Your Bardic Inspiration die increases to a d8."
            },
            {
                "level": 6,
                "name": "Countercharm",
                "description": "Reaction to protect allies within 30 ft against Charmed or Frightened conditions, granting a reroll with Advantage."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Bard college."
            },
            {
                "level": 7,
                "name": "4th-Level Spells",
                "description": "You gain access to 4th-level spell slots."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 10,
                "name": "Magical Secrets",
                "description": "You can prepare spells from the Cleric, Druid, and Wizard spell lists in addition to the Bard list."
            },
            {
                "level": 10,
                "name": "Bardic Inspiration (d10)",
                "description": "Your Bardic Inspiration die increases to a d10."
            },
            {
                "level": 10,
                "name": "Expertise (2 Additional)",
                "description": "Double proficiency bonus on two additional chosen skills."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level spell slots."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Bard college."
            },
            {
                "level": 15,
                "name": "Bardic Inspiration (d12)",
                "description": "Your Bardic Inspiration die increases to a d12."
            },
            {
                "level": 15,
                "name": "8th-Level Spells",
                "description": "You gain access to 8th-level spell slots."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level spell slots."
            },
            {
                "level": 18,
                "name": "Superior Inspiration",
                "description": "When you roll Initiative and have fewer than two uses of Bardic Inspiration remaining, you regain uses until you have two."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Words of Creation",
                "description": "Always have Power Word Heal and Power Word Kill prepared; can target two creatures with them simultaneously."
            }
        ],
        "subclasses": [
            {
                "id": "dance",
                "name": "College of Dance",
                "description": "Unarmored Defense, Dazzling Footwork, Agile Strikes.",
                "features": [
                    {
                        "level": 3,
                        "name": "Dazzling Footwork",
                        "description": "While not wearing armor or wielding a shield, your AC equals 10 + Dex modifier + Cha modifier. Unarmed strikes use your Bardic Inspiration die for damage, and granting Bardic Inspiration allows you to Dash and make an unarmed strike."
                    },
                    {
                        "level": 6,
                        "name": "Inspiring Movement",
                        "description": "Reaction when an enemy ends its turn within 5 feet to move up to half your Speed without provoking opportunity attacks and allow an ally within 30 feet to move half their Speed."
                    },
                    {
                        "level": 6,
                        "name": "Tandem Footwork",
                        "description": "When rolling Initiative, expend one use of Bardic Inspiration to add the die roll to your Initiative and the Initiative of allies within 60 feet."
                    },
                    {
                        "level": 14,
                        "name": "Leading Escape",
                        "description": "Reaction when you or an ally within 5 feet must make a Dexterity saving throw to expend Bardic Inspiration and gain the benefits of Evasion."
                    }
                ]
            },
            {
                "id": "glamour",
                "name": "College of Glamour",
                "description": "Mantle of Inspiration, Enthralling Performance, Mantle of Majesty.",
                "features": [
                    {
                        "level": 3,
                        "name": "Beguiling Magic",
                        "description": "Whenever you cast an Enchantment or Illusion spell, you can immediately cast Charm Person or Command without expending a spell slot."
                    },
                    {
                        "level": 3,
                        "name": "Mantle of Inspiration",
                        "description": "Bonus Action to expend one Bardic Inspiration die and grant temporary hit points equal to 2x the die roll to allies within 60 feet, who can then move without opportunity attacks."
                    },
                    {
                        "level": 6,
                        "name": "Mantle of Majesty",
                        "description": "Bonus Action to cast Command without expending a spell slot once per turn for 1 minute; charmed creatures automatically fail the saving throw."
                    },
                    {
                        "level": 14,
                        "name": "Unbreakable Majesty",
                        "description": "Bonus Action to radiate majestic presence: attackers must make a Charisma saving throw or miss their attack, and target has Disadvantage on saving throws against your spells."
                    }
                ]
            },
            {
                "id": "lore",
                "name": "College of Lore",
                "description": "Cutting Words, 3 bonus proficiencies, Magical Discoveries.",
                "features": [
                    {
                        "level": 3,
                        "name": "Bonus Proficiencies",
                        "description": "You gain proficiency in three skills of your choice."
                    },
                    {
                        "level": 3,
                        "name": "Cutting Words",
                        "description": "Reaction when an enemy within 60 feet makes an attack roll, ability check, or damage roll to expend one Bardic Inspiration die and subtract the result from the roll."
                    },
                    {
                        "level": 6,
                        "name": "Magical Discoveries",
                        "description": "Learn two spells of any class of a level you can cast. They count as prepared Bard spells and use Charisma."
                    },
                    {
                        "level": 14,
                        "name": "Peerless Skill",
                        "description": "When you make an ability check or attack roll and fail, expend one Bardic Inspiration die and add the number rolled to the total."
                    }
                ]
            },
            {
                "id": "valor",
                "name": "College of Valor",
                "description": "Combat Inspiration, martial weapon proficiencies, Extra Attack.",
                "features": [
                    {
                        "level": 3,
                        "name": "Combat Inspiration",
                        "description": "Allies can add your Bardic Inspiration die to weapon damage rolls or to Armor Class against an incoming attack."
                    },
                    {
                        "level": 3,
                        "name": "Martial Training",
                        "description": "You gain proficiency with Martial weapons, Medium armor, and Shields. You can use a simple or martial weapon as a spellcasting focus for Bard spells."
                    },
                    {
                        "level": 6,
                        "name": "Extra Attack",
                        "description": "You can attack twice instead of once whenever you take the Attack action. You can replace one attack with a cantrip that has a casting time of 1 action."
                    },
                    {
                        "level": 14,
                        "name": "Battle Magic",
                        "description": "When you use an action to cast a spell, you can make one weapon attack as a Bonus Action."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Rapier & Entertainer's Pack",
                "items": [
                    "Rapier",
                    "Leather Armor",
                    "Dagger",
                    "Entertainer's Pack",
                    "Musical Instrument",
                    "18 GP"
                ]
            },
            {
                "name": "Gold Purchase (90 GP)",
                "items": [
                    "90 GP"
                ]
            }
        ]
    },
    {
        "id": "cleric",
        "name": "Cleric",
        "description": "A miraculous priest wielding divine magic in service of a deity or sacred cause.",
        "hitDie": 8,
        "primaryAbilities": [
            "wis",
            "str"
        ],
        "savingThrows": [
            "wis",
            "cha"
        ],
        "armorProficiencies": [
            "Light Armor",
            "Medium Armor",
            "Shields"
        ],
        "weaponProficiencies": [
            "Simple Weapons"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 2,
            "from": [
                "History",
                "Insight",
                "Medicine",
                "Persuasion",
                "Religion"
            ]
        },
        "spellcasting": {
            "ability": "wis",
            "type": "full",
            "cantripsKnownByLevel": [
                3,
                3,
                3,
                4,
                4,
                4,
                4,
                4,
                4,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5
            ],
            "preparedSpellsByLevel": [
                4,
                5,
                6,
                7,
                9,
                10,
                11,
                12,
                14,
                15,
                16,
                16,
                17,
                17,
                18,
                18,
                19,
                20,
                21,
                22
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    2,
                    1,
                    1
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Divine Order",
                "description": "Choose Protector (Martial weapons and Heavy armor proficiency) or Thaumaturge (extra Sacred Flame cantrip and Arcana/Religion bonus)."
            },
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "Cast cleric spells using Wisdom as your spellcasting ability."
            },
            {
                "level": 2,
                "name": "Channel Divinity (2/Rest)",
                "description": "Channel holy energy: Divine Spark or Turn Undead. Usable 2 times per Short or Long Rest."
            },
            {
                "level": 3,
                "name": "Cleric Subclass",
                "description": "Choose a domain: Life Domain, Light Domain, Trickery Domain, or War Domain."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Smite Undead",
                "description": "When you use Turn Undead, deal radiant damage equal to Wisdom modifier d8s to affected undead."
            },
            {
                "level": 6,
                "name": "Channel Divinity (3/Rest)",
                "description": "You can now use Channel Divinity 3 times per Short or Long Rest."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Divine Domain."
            },
            {
                "level": 7,
                "name": "Blessed Strikes",
                "description": "Choose Divine Strike (+1d8 radiant/necrotic weapon damage) or Potent Spellcasting (add Wis mod to cantrips)."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 10,
                "name": "Divine Intervention",
                "description": "Action to call upon your deity: automatically cast any Cleric spell of level 5 or lower without a spell slot. Recharges on Long Rest."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level spell slots."
            },
            {
                "level": 14,
                "name": "Improved Blessed Strikes",
                "description": "Divine Strike damage increases to 2d8, or Potent Spellcasting grants temp HP equal to 2x Wis mod to yourself or an ally."
            },
            {
                "level": 15,
                "name": "8th-Level Spells",
                "description": "You gain access to 8th-level spell slots."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Divine Domain."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level spell slots."
            },
            {
                "level": 18,
                "name": "Channel Divinity (4/Rest)",
                "description": "You can now use Channel Divinity 4 times per Short or Long Rest."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Greater Divine Intervention",
                "description": "Divine Intervention can now duplicate the Wish spell without risking losing the ability. Recharges in 2d4 Long Rests."
            }
        ],
        "subclasses": [
            {
                "id": "life",
                "name": "Life Domain",
                "description": "Disciple of Life boosts healing spells, Preserve Life Channel Divinity.",
                "features": [
                    {
                        "level": 3,
                        "name": "Disciple of Life",
                        "description": "Whenever you cast a spell that restores hit points, the target regains additional hit points equal to 2 + the spell's level."
                    },
                    {
                        "level": 3,
                        "name": "Preserve Life",
                        "description": "Channel Divinity to restore hit points equal to 5 times your Cleric level, divided among injured allies within 30 feet, restoring up to half their maximum HP."
                    },
                    {
                        "level": 6,
                        "name": "Blessed Healer",
                        "description": "Whenever you cast a spell of level 1 or higher that restores hit points to another creature, you regain hit points equal to 2 + the spell's level."
                    },
                    {
                        "level": 17,
                        "name": "Supreme Healing",
                        "description": "When you would normally roll one or more dice to restore hit points with a spell, you instead use the highest number possible for each die."
                    }
                ]
            },
            {
                "id": "light",
                "name": "Light Domain",
                "description": "Warding Flare imposes disadvantage, Radiance of the Dawn radiant blast.",
                "features": [
                    {
                        "level": 3,
                        "name": "Radiance of the Dawn",
                        "description": "Channel Divinity to dispel magical darkness within 30 feet and deal 2d10 + Cleric level radiant damage to hostiles in the area (Con save halves)."
                    },
                    {
                        "level": 3,
                        "name": "Warding Flare",
                        "description": "Reaction when attacked by a creature within 30 feet to impose Disadvantage on the attack roll with a flash of light."
                    },
                    {
                        "level": 6,
                        "name": "Improved Warding Flare",
                        "description": "You can use your Warding Flare feature when a creature within 30 feet attacks an ally you can see."
                    },
                    {
                        "level": 17,
                        "name": "Corona of Light",
                        "description": "Action to emit an aura of sunlight for 1 minute: enemies within 60 feet have Disadvantage on saving throws against spells that deal radiant or fire damage."
                    }
                ]
            },
            {
                "id": "trickery",
                "name": "Trickery Domain",
                "description": "Invoke Duplicity illusion clone, Blessing of the Trickster stealth.",
                "features": [
                    {
                        "level": 3,
                        "name": "Blessing of the Trickster",
                        "description": "Action to touch a willing creature and grant it Advantage on Dexterity (Stealth) checks for 1 hour."
                    },
                    {
                        "level": 3,
                        "name": "Invoke Duplicity",
                        "description": "Bonus Action to expend Channel Divinity and create an illusionary duplicate of yourself within 30 feet. You can cast spells through it and gain Advantage on attack rolls against creatures within 5 feet of it."
                    },
                    {
                        "level": 6,
                        "name": "Trickster's Transposition",
                        "description": "Bonus Action to magically swap places with your illusionary duplicate, teleporting up to 30 feet."
                    },
                    {
                        "level": 17,
                        "name": "Improved Duplicity",
                        "description": "You can create up to four illusionary duplicates, and allies gain Advantage on attack rolls while near any duplicate."
                    }
                ]
            },
            {
                "id": "war",
                "name": "War Domain",
                "description": "War Priest bonus action attack, Guided Strike +10 to hit.",
                "features": [
                    {
                        "level": 3,
                        "name": "Guided Strike",
                        "description": "Channel Divinity to gain a +10 bonus to an attack roll made by you or an ally within 30 feet."
                    },
                    {
                        "level": 3,
                        "name": "War Priest",
                        "description": "Whenever you take the Attack action, you can make an additional weapon attack as a Bonus Action Wisdom modifier times per Long Rest."
                    },
                    {
                        "level": 6,
                        "name": "War God's Blessing",
                        "description": "You can expend a use of Channel Divinity to cast Shield of Faith or Spiritual Weapon without expending a spell slot."
                    },
                    {
                        "level": 17,
                        "name": "Avatar of Battle",
                        "description": "You gain resistance to Bludgeoning, Piercing, and Slashing damage from nonmagical attacks."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Mace, Chain Shirt & Shield",
                "items": [
                    "Mace",
                    "Chain Shirt",
                    "Shield",
                    "Holy Symbol",
                    "Priest's Pack",
                    "7 GP"
                ]
            },
            {
                "name": "Gold Purchase (110 GP)",
                "items": [
                    "110 GP"
                ]
            }
        ]
    },
    {
        "id": "druid",
        "name": "Druid",
        "description": "A priest of the Old Faith, wielding the elemental forces of nature and beast forms.",
        "hitDie": 8,
        "primaryAbilities": [
            "wis",
            "con"
        ],
        "savingThrows": [
            "int",
            "wis"
        ],
        "armorProficiencies": [
            "Light Armor",
            "Shields"
        ],
        "weaponProficiencies": [
            "Simple Weapons"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 2,
            "from": [
                "Arcana",
                "Animal Handling",
                "Insight",
                "Medicine",
                "Nature",
                "Perception",
                "Religion",
                "Survival"
            ]
        },
        "spellcasting": {
            "ability": "wis",
            "type": "full",
            "cantripsKnownByLevel": [
                2,
                2,
                2,
                3,
                3,
                3,
                3,
                3,
                3,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4
            ],
            "preparedSpellsByLevel": [
                4,
                5,
                6,
                7,
                9,
                10,
                11,
                12,
                14,
                15,
                16,
                16,
                17,
                17,
                18,
                18,
                19,
                20,
                21,
                22
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    2,
                    1,
                    1
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Primal Order",
                "description": "Choose Magician (bonus cantrip, Nature/Arcana checks) or Warden (Medium Armor and Martial Weapons)."
            },
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "Cast primal spells using Wisdom."
            },
            {
                "level": 2,
                "name": "Wild Shape",
                "description": "Transform into Beast shapes as a Bonus Action. Gain temp HP equal to your Druid level and beast statistics."
            },
            {
                "level": 2,
                "name": "Wild Companion",
                "description": "Cast Find Familiar without material components using Wild Shape."
            },
            {
                "level": 3,
                "name": "Druid Subclass",
                "description": "Choose a circle: Circle of the Land, Circle of the Moon, Circle of the Sea, or Circle of the Stars."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 4,
                "name": "Wild Shape (Swim Form)",
                "description": "You can now transform into beasts that have a swimming speed."
            },
            {
                "level": 5,
                "name": "Wild Resurgence",
                "description": "Once per turn, convert a spell slot to a use of Wild Shape, or expend a Wild Shape to regain a 1st-level spell slot."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Druid circle."
            },
            {
                "level": 7,
                "name": "Elemental Fury",
                "description": "Choose Primal Strike (+1d8 cold, fire, lightning, or thunder damage to attacks) or Potent Spellcasting (add Wis mod to cantrips)."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 8,
                "name": "Wild Shape (Fly Form)",
                "description": "You can now transform into beasts that have a flying speed."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Druid circle."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level spell slots."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Druid circle."
            },
            {
                "level": 15,
                "name": "Improved Elemental Fury",
                "description": "Primal Strike damage increases to 2d8, or Potent Spellcasting range increases by 300 ft."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level spell slots."
            },
            {
                "level": 18,
                "name": "Beast Spells",
                "description": "Cast spells with verbal and somatic components while transformed in Wild Shape."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Archdruid",
                "description": "Regain 1 expended Wild Shape on rolling Initiative; convert Wild Shape into spell slots with Wild Resurgence; age 10 times slower."
            }
        ],
        "subclasses": [
            {
                "id": "moon",
                "name": "Circle of the Moon",
                "description": "Combat Wild Shape, Circle Forms with enhanced armor and radiant strikes.",
                "features": [
                    {
                        "level": 3,
                        "name": "Combat Wild Shape",
                        "description": "You can transform as a Bonus Action and gain temporary hit points equal to 3x your Druid level. While transformed, your Armor Class equals 13 + your Wisdom modifier if higher than the beast's normal AC."
                    },
                    {
                        "level": 3,
                        "name": "Circle Forms",
                        "description": "You can transform into beasts with a Challenge Rating as high as your Druid level divided by 3 (rounded down). Your beast attacks can deal Radiant damage instead of normal damage."
                    },
                    {
                        "level": 6,
                        "name": "Improved Circle Forms",
                        "description": "While in Wild Shape, your Armor Class equals 13 + your Wisdom modifier if that is higher than the beast's AC, and you add your Wisdom modifier to Constitution saving throws."
                    },
                    {
                        "level": 6,
                        "name": "Moonlight Step",
                        "description": "As a Bonus Action, you magically teleport up to 30 feet to an unoccupied space you can see. You gain Advantage on the next attack roll you make before the end of this turn. You can use this feature a number of times equal to your Wisdom modifier per Long Rest."
                    },
                    {
                        "level": 10,
                        "name": "Moonlight Strike",
                        "description": "While in Wild Shape, the radiant damage of your attacks increases by 1d8, and you can cast Moonbeam without spell components."
                    },
                    {
                        "level": 14,
                        "name": "Lunar Form",
                        "description": "Once per turn when you teleport with Moonlight Step, you can choose to make one ally within 10 feet teleport with you."
                    }
                ]
            },
            {
                "id": "land",
                "name": "Circle of the Land",
                "description": "Biome affinity (Arid, Polar, Temperate, Tropical), Natural Recovery.",
                "features": [
                    {
                        "level": 3,
                        "name": "Circle of the Land Spells",
                        "description": "Choose a biome affinity (Arid, Polar, Temperate, or Tropical) whenever you finish a Long Rest, gaining prepared spells associated with that land."
                    },
                    {
                        "level": 6,
                        "name": "Land's Aid",
                        "description": "As a Magic action, expend a use of Wild Shape to make flowers and thorny vines erupt in a 10-foot-radius sphere within 60 feet. Enemies take 2d6 Necrotic damage (Con save halves), and one ally regains 2d6 HP."
                    },
                    {
                        "level": 6,
                        "name": "Natural Recovery",
                        "description": "During a Short Rest, you can recover expended spell slots with a combined level up to half your Druid level (rounded up)."
                    },
                    {
                        "level": 10,
                        "name": "Natural Sanctuary",
                        "description": "Creatures of the beast and plant types have difficulty attacking you, and you are immune to poison damage."
                    },
                    {
                        "level": 14,
                        "name": "Nature's Sanctuary",
                        "description": "You can call forth a spectral tree that shelters you and your allies with half cover and resistance to selected damage types."
                    }
                ]
            },
            {
                "id": "sea",
                "name": "Circle of the Sea",
                "description": "Wrath of the Sea tempest aura, aquatic affinity.",
                "features": [
                    {
                        "level": 3,
                        "name": "Wrath of the Sea",
                        "description": "As a Bonus Action, expend a use of Wild Shape to manifest a 10-foot aura of ocean spray and thunder for 10 minutes. Once per turn when a creature ends its turn in the aura, you can deal Thunder/Cold damage."
                    },
                    {
                        "level": 6,
                        "name": "Aquatic Affinity",
                        "description": "You gain a Swimming Speed equal to your Walking Speed, and you can breathe underwater. While your Wrath of the Sea is active, you gain a Flying Speed equal to your Walking Speed."
                    },
                    {
                        "level": 10,
                        "name": "Stormborn",
                        "description": "Your Wrath of the Sea aura increases to 20 feet, and you gain resistance to Cold, Lightning, and Thunder damage."
                    },
                    {
                        "level": 14,
                        "name": "Oceanic Tempest",
                        "description": "You can manifest your Wrath of the Sea twice as powerful or grant its benefits to an ally within 60 feet."
                    }
                ]
            },
            {
                "id": "stars",
                "name": "Circle of the Stars",
                "description": "Star Map, Starry Form (Archer, Chalice, Dragon), Cosmic Omen.",
                "features": [
                    {
                        "level": 3,
                        "name": "Star Map",
                        "description": "You create a celestial map that serves as your spellcasting focus and grants you the Guidance cantrip and free castings of Guiding Bolt."
                    },
                    {
                        "level": 3,
                        "name": "Starry Form",
                        "description": "As a Bonus Action, expend a use of Wild Shape to assume a constellation form: Archer (Bonus Action radiant ranged attack), Chalice (bonus healing to another target), or Dragon (minimum 10 on Int/Wis checks and Con saves)."
                    },
                    {
                        "level": 6,
                        "name": "Cosmic Omen",
                        "description": "Whenever you finish a Long Rest, consult the stars to gain Weal (add 1d6 to an ally's d20 roll) or Woe (subtract 1d6 from an enemy's d20 roll) as a Reaction a number of times equal to your Wisdom modifier."
                    },
                    {
                        "level": 10,
                        "name": "Twinkling Constellations",
                        "description": "The Archer and Chalice dice increase to 2d8. At the start of each of your turns in Starry Form, you can switch which constellation form is active."
                    },
                    {
                        "level": 14,
                        "name": "Full of Stars",
                        "description": "While in Starry Form, your body becomes partially incorporeal, granting you resistance to Bludgeoning, Piercing, and Slashing damage."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Scimitar, Leather & Shield",
                "items": [
                    "Scimitar",
                    "Leather Armor",
                    "Shield",
                    "Druidic Focus",
                    "Explorer's Pack",
                    "9 GP"
                ]
            },
            {
                "name": "Gold Purchase (50 GP)",
                "items": [
                    "50 GP"
                ]
            }
        ]
    },
    {
        "id": "fighter",
        "name": "Fighter",
        "description": "A master of martial combat, skilled with an unmatched variety of armor and weapons.",
        "hitDie": 10,
        "primaryAbilities": [
            "str",
            "dex",
            "con"
        ],
        "savingThrows": [
            "str",
            "con"
        ],
        "armorProficiencies": [
            "Light Armor",
            "Medium Armor",
            "Heavy Armor",
            "Shields"
        ],
        "weaponProficiencies": [
            "Simple Weapons",
            "Martial Weapons"
        ],
        "weaponMasteryCount": 3,
        "skillChoices": {
            "count": 2,
            "from": [
                "Acrobatics",
                "Animal Handling",
                "Athletics",
                "History",
                "Insight",
                "Intimidation",
                "Perception",
                "Survival"
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Fighting Style",
                "description": "Choose a Fighting Style feat: Archery, Defense, Dueling, Great Weapon Fighting, Protection, Two-Weapon Fighting."
            },
            {
                "level": 1,
                "name": "Second Wind",
                "description": "Bonus Action to regain 1d10 + Fighter level HP. Regain uses on short/long rests."
            },
            {
                "level": 1,
                "name": "Weapon Mastery (3 Weapons)",
                "description": "Master 3 kinds of weapons of your choice."
            },
            {
                "level": 2,
                "name": "Action Surge",
                "description": "Take one additional action on your turn once per Short or Long Rest."
            },
            {
                "level": 2,
                "name": "Tactical Mind",
                "description": "Expend Second Wind to add 1d10 to a failed ability check."
            },
            {
                "level": 3,
                "name": "Fighter Subclass",
                "description": "Choose an archetype: Battle Master, Champion, Eldritch Knight, or Psi Warrior."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 4,
                "name": "Weapon Mastery (4 Weapons)",
                "description": "Your weapon mastery capacity increases to 4 weapons."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "Attack twice whenever you take the Attack action."
            },
            {
                "level": 5,
                "name": "Tactical Shift",
                "description": "Whenever you activate Second Wind, you can move up to half your speed without provoking opportunity attacks."
            },
            {
                "level": 6,
                "name": "Ability Score Improvement (Fighter Bonus)",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 7,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Indomitable (1/LR)",
                "description": "Reroll a failed saving throw with a bonus equal to your Fighter level. Usable 1 time per Long Rest."
            },
            {
                "level": 9,
                "name": "Tactical Master",
                "description": "When attacking with a mastery weapon, you can swap its mastery property for Push, Sap, or Slow."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 10,
                "name": "Weapon Mastery (5 Weapons)",
                "description": "Your weapon mastery capacity increases to 5 weapons."
            },
            {
                "level": 11,
                "name": "Two Extra Attacks",
                "description": "You can attack three times whenever you take the Attack action."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "Indomitable (2/LR)",
                "description": "You can now use Indomitable twice per Long Rest."
            },
            {
                "level": 13,
                "name": "Studied Attacks",
                "description": "If you miss an attack roll, you have Advantage on your next attack roll against that target before the end of your next turn."
            },
            {
                "level": 14,
                "name": "Ability Score Improvement (Fighter Bonus)",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 15,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 16,
                "name": "Weapon Mastery (6 Weapons)",
                "description": "Your weapon mastery capacity increases to 6 weapons."
            },
            {
                "level": 17,
                "name": "Action Surge (2/Rest)",
                "description": "You can use Action Surge twice per Short or Long Rest, though only once on a turn."
            },
            {
                "level": 17,
                "name": "Indomitable (3/LR)",
                "description": "You can now use Indomitable three times per Long Rest."
            },
            {
                "level": 18,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Three Extra Attacks",
                "description": "You can attack four times whenever you take the Attack action."
            }
        ],
        "subclasses": [
            {
                "id": "battle-master",
                "name": "Battle Master",
                "description": "Maneuvers and Superiority Dice (d8s) to trip, disarm, or rally allies.",
                "features": [
                    {
                        "level": 3,
                        "name": "Combat Superiority",
                        "description": "You learn 3 tactical Maneuvers fueled by four Superiority Dice (d8s). Maneuvers add tactical effects to attacks and checks and recharge on a Short or Long Rest."
                    },
                    {
                        "level": 3,
                        "name": "Student of War",
                        "description": "You gain proficiency with one type of artisan's tools and one skill of your choice."
                    },
                    {
                        "level": 7,
                        "name": "Know Your Enemy",
                        "description": "Bonus Action to discern an enemy's damage resistances, damage immunities, damage vulnerabilities, or Armor Class."
                    },
                    {
                        "level": 10,
                        "name": "Improved Combat Superiority",
                        "description": "Your Superiority Dice turn into d10s."
                    },
                    {
                        "level": 15,
                        "name": "Relentless",
                        "description": "When you roll Initiative and have no Superiority Dice remaining, you regain one Superiority Die."
                    },
                    {
                        "level": 18,
                        "name": "Ultimate Combat Superiority",
                        "description": "Your Superiority Dice turn into d12s."
                    }
                ]
            },
            {
                "id": "champion",
                "name": "Champion",
                "description": "Improved Critical (19-20), Remarkable Athlete, Heroic Warrior inspiration.",
                "features": [
                    {
                        "level": 3,
                        "name": "Improved Critical",
                        "description": "Your weapon attacks score a critical hit on a roll of 19 or 20 on the d20."
                    },
                    {
                        "level": 3,
                        "name": "Remarkable Athlete",
                        "description": "You gain Advantage on Initiative rolls and Strength (Athletics) checks, and your running jump distance increases."
                    },
                    {
                        "level": 7,
                        "name": "Additional Fighting Style",
                        "description": "You gain a second Fighting Style feat of your choice."
                    },
                    {
                        "level": 10,
                        "name": "Heroic Warrior",
                        "description": "Whenever you start your turn in combat without Heroic Inspiration, you gain Heroic Inspiration."
                    },
                    {
                        "level": 15,
                        "name": "Superior Critical",
                        "description": "Your weapon attacks score a critical hit on a roll of 18, 19, or 20 on the d20."
                    },
                    {
                        "level": 18,
                        "name": "Survivor",
                        "description": "At the start of each of your turns, you regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left."
                    }
                ]
            },
            {
                "id": "eldritch-knight",
                "name": "Eldritch Knight",
                "description": "Arcane spellcasting (Wizard spells), Weapon Bond, War Magic.",
                "features": [
                    {
                        "level": 3,
                        "name": "Spellcasting",
                        "description": "Cast wizard spells using Intelligence. Prepare spells from any school of magic and cast cantrips."
                    },
                    {
                        "level": 3,
                        "name": "Weapon Bond",
                        "description": "Bond with up to two weapons. You cannot be disarmed of them, and you can summon them to your hand as a Bonus Action."
                    },
                    {
                        "level": 7,
                        "name": "War Magic",
                        "description": "When you take the Attack action, you can replace one of your attacks with a wizard cantrip."
                    },
                    {
                        "level": 10,
                        "name": "Eldritch Strike",
                        "description": "When you hit a creature with a weapon attack, that creature has Disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn."
                    },
                    {
                        "level": 15,
                        "name": "Arcane Charge",
                        "description": "When you use your Action Surge, you can teleport up to 30 feet to an unoccupied space you can see before or after the extra action."
                    },
                    {
                        "level": 18,
                        "name": "Improved War Magic",
                        "description": "When you take the Attack action, you can replace two of your attacks with a 1st- or 2nd-level wizard spell."
                    }
                ]
            },
            {
                "id": "psi-warrior",
                "name": "Psi Warrior",
                "description": "Psionic Power energy dice for telekinetic strikes and protective barriers.",
                "features": [
                    {
                        "level": 3,
                        "name": "Psionic Power",
                        "description": "Harbor a pool of Psionic Energy dice (equal to 2x your PB) to power Protective Field (reduce damage), Psionic Strike (deal extra force damage), and Telekinetic Movement (move objects/allies)."
                    },
                    {
                        "level": 7,
                        "name": "Telekinetic Adept",
                        "description": "Psi-Powered Leap grants a flying speed equal to twice your walking speed; Telekinetic Thrust knocks prone or shoves enemies up to 10 feet on hit."
                    },
                    {
                        "level": 10,
                        "name": "Guarded Mind",
                        "description": "You gain resistance to Psychic damage, and you can expend a Psionic Energy die to end the Charmed or Frightened condition on yourself."
                    },
                    {
                        "level": 15,
                        "name": "Bulwark of Force",
                        "description": "Bonus Action to shield yourself and allies within 30 feet with half cover for 1 minute."
                    },
                    {
                        "level": 18,
                        "name": "Telekinetic Master",
                        "description": "Cast Telekinesis once per Long Rest without expending a spell slot, and make a weapon attack as a Bonus Action while concentrating on it."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Chain Mail, Longsword & Shield",
                "items": [
                    "Chain Mail",
                    "Longsword",
                    "Shield",
                    "Crossbow, Light",
                    "Crossbow Bolts (20)",
                    "Dungeoneer's Pack",
                    "9 GP"
                ]
            },
            {
                "name": "Leather Armor, Longbow & Two Shortswords",
                "items": [
                    "Leather Armor",
                    "Longbow",
                    "Arrows (20)",
                    "Shortsword (2)",
                    "Explorer's Pack",
                    "11 GP"
                ]
            },
            {
                "name": "Gold Purchase (155 GP)",
                "items": [
                    "155 GP"
                ]
            }
        ]
    },
    {
        "id": "monk",
        "name": "Monk",
        "description": "A martial artist who harnesses inner ki/focus to achieve supernatural speed and strikes.",
        "hitDie": 8,
        "primaryAbilities": [
            "dex",
            "wis"
        ],
        "savingThrows": [
            "str",
            "dex"
        ],
        "armorProficiencies": [],
        "weaponProficiencies": [
            "Simple Weapons",
            "Martial Weapons with Light property"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 2,
            "from": [
                "Acrobatics",
                "Athletics",
                "History",
                "Insight",
                "Religion",
                "Stealth"
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Martial Arts (d6)",
                "description": "Use Dex instead of Str for unarmed strikes and monk weapons. Unarmed strike damage is 1d6. Bonus Action unarmed strike."
            },
            {
                "level": 1,
                "name": "Unarmored Defense",
                "description": "AC equals 10 + Dex modifier + Wis modifier while not wearing armor or shield."
            },
            {
                "level": 2,
                "name": "Monk's Focus",
                "description": "Focus Points equal to Monk level. Flurry of Blows (2 unarmed strikes), Patient Defense (Dodge + Disengage), Step of the Wind (Dash + jump)."
            },
            {
                "level": 2,
                "name": "Unarmored Movement (+10 ft)",
                "description": "Speed increases by 10 ft while not wearing armor or carrying a shield."
            },
            {
                "level": 2,
                "name": "Uncanny Metabolism",
                "description": "When rolling Initiative, regain all expended Focus Points and regain HP equal to your martial arts die + Monk level (1/LR)."
            },
            {
                "level": 3,
                "name": "Monk Subclass",
                "description": "Choose a tradition: Warrior of the Open Hand, Warrior of Shadow, Warrior of Mercy, or Warrior of Elements."
            },
            {
                "level": 3,
                "name": "Deflect Attacks",
                "description": "Reaction to reduce bludgeoning, piercing, or slashing damage by 1d10 + Dex mod + Monk level; redirect attack if reduced to 0."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 4,
                "name": "Slow Fall",
                "description": "Reaction to reduce falling damage by five times your Monk level."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action."
            },
            {
                "level": 5,
                "name": "Stunning Strike",
                "description": "Spend 1 Focus Point on hit to force a Con save: Stunned until start of next turn, or half speed on success."
            },
            {
                "level": 5,
                "name": "Martial Arts (d8)",
                "description": "Your Martial Arts unarmed strike die increases to 1d8."
            },
            {
                "level": 6,
                "name": "Empowered Strikes",
                "description": "Your unarmed strikes can deal force damage instead of bludgeoning damage."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 6,
                "name": "Unarmored Movement (+15 ft)",
                "description": "Your Unarmored Movement speed bonus increases to +15 ft."
            },
            {
                "level": 7,
                "name": "Evasion",
                "description": "Dex saves for half damage deal 0 damage on success and half damage on failure."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Acrobatic Movement",
                "description": "You can move along vertical surfaces and across liquids on your turn without falling."
            },
            {
                "level": 10,
                "name": "Heightened Focus",
                "description": "Flurry of Blows grants 3 unarmed strikes; Patient Defense gives temp HP; Step of the Wind allows carrying a willing creature."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 10,
                "name": "Unarmored Movement (+20 ft)",
                "description": "Your Unarmored Movement speed bonus increases to +20 ft."
            },
            {
                "level": 11,
                "name": "Martial Arts (d10)",
                "description": "Your Martial Arts unarmed strike die increases to 1d10."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "Self-Restoration",
                "description": "At the end of your turn, end Charmed, Frightened, or Poisoned conditions on yourself; forgo food and water."
            },
            {
                "level": 14,
                "name": "Deflect Energy",
                "description": "Deflect Attacks can now deflect any damage type, not just bludgeoning, piercing, or slashing."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 15,
                "name": "Perfect Focus",
                "description": "When rolling Initiative with 3 or fewer Focus Points, regain Focus Points until you have 4."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Martial Arts (d12)",
                "description": "Your Martial Arts unarmed strike die increases to 1d12."
            },
            {
                "level": 17,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 18,
                "name": "Superior Defense",
                "description": "Bonus Action and 3 Focus Points to gain resistance to all damage except Force for 1 minute."
            },
            {
                "level": 18,
                "name": "Unarmored Movement (+30 ft)",
                "description": "Your Unarmored Movement speed bonus increases to +30 ft."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Body and Mind",
                "description": "Your Dexterity and Wisdom scores increase by 4, up to a maximum of 25."
            }
        ],
        "subclasses": [
            {
                "id": "open-hand",
                "name": "Warrior of the Open Hand",
                "description": "Open Hand Technique (knock prone, push 15 ft, prevent reactions), Wholeness of Body.",
                "features": [
                    {
                        "level": 3,
                        "name": "Open Hand Technique",
                        "description": "Whenever you hit a creature with an attack granted by Flurry of Blows, you can impose Addle (cannot take Reactions), Push (push 15 feet away), or Topple (knock Prone)."
                    },
                    {
                        "level": 6,
                        "name": "Wholeness of Body",
                        "description": "Bonus Action to regain hit points equal to your Martial Arts die + Wisdom modifier. You can use this a number of times equal to your Wisdom modifier per Long Rest."
                    },
                    {
                        "level": 11,
                        "name": "Fleet Step",
                        "description": "Whenever you take a Bonus Action other than Step of the Wind, you can immediately use Step of the Wind as part of that same Bonus Action."
                    },
                    {
                        "level": 17,
                        "name": "Quivering Palm",
                        "description": "Spend 4 Focus Points when hitting with an unarmed strike to set up lethal vibrations. Use an action to force a Constitution saving throw: takes 10d12 force damage or drops to 0 HP on failure."
                    }
                ]
            },
            {
                "id": "shadow",
                "name": "Warrior of Shadow",
                "description": "Shadow Arts (Darkness spell, darkvision), Shadow Step teleportation.",
                "features": [
                    {
                        "level": 3,
                        "name": "Shadow Arts",
                        "description": "You gain Darkvision out to 60 feet (or extend it by 60 feet) and can cast Darkness by spending 1 Focus Point, which you can see through."
                    },
                    {
                        "level": 6,
                        "name": "Shadow Step",
                        "description": "While in dim light or darkness, Bonus Action to teleport up to 60 feet to an unoccupied space also in dim light or darkness. You gain Advantage on the next melee attack roll you make before the end of your turn."
                    },
                    {
                        "level": 11,
                        "name": "Improved Shadow Step",
                        "description": "When you use Shadow Step, you can make an unarmed strike immediately after teleporting without expending an action."
                    },
                    {
                        "level": 17,
                        "name": "Cloak of Shadows",
                        "description": "Action while in dim light or darkness to become invisible and partially incorporeal, gaining resistance to all damage types except Force damage."
                    }
                ]
            },
            {
                "id": "mercy",
                "name": "Warrior of Mercy",
                "description": "Hands of Harm and Hands of Healing using Focus Points.",
                "features": [
                    {
                        "level": 3,
                        "name": "Hand of Healing",
                        "description": "Spend 1 Focus Point to touch a creature and restore HP equal to your Martial Arts die + Wisdom modifier. Can replace one attack in Flurry of Blows without spending an extra point."
                    },
                    {
                        "level": 3,
                        "name": "Hand of Harm",
                        "description": "Spend 1 Focus Point when hitting with an unarmed strike to deal extra Necrotic damage equal to your Martial Arts die + Wisdom modifier."
                    },
                    {
                        "level": 3,
                        "name": "Implements of Mercy",
                        "description": "Gain proficiency in Insight, Medicine, and Herbalism kit."
                    },
                    {
                        "level": 6,
                        "name": "Physician's Touch",
                        "description": "Hand of Healing also cures Blinded, Deafened, Paralyzed, Poisoned, or Stunned conditions. Hand of Harm inflicts the Poisoned condition until end of next turn."
                    },
                    {
                        "level": 11,
                        "name": "Flurry of Healing and Harm",
                        "description": "You can use Hand of Healing and Hand of Harm without spending Focus Points when using Flurry of Blows."
                    },
                    {
                        "level": 17,
                        "name": "Hand of Ultimate Mercy",
                        "description": "Action and 5 Focus Points to touch a creature that died within 24 hours and return it to life with HP equal to 4d10 + Wisdom modifier."
                    }
                ]
            },
            {
                "id": "elements",
                "name": "Warrior of Elements",
                "description": "Elemental attunement reach, elemental bursts of fire, thunder, acid, or cold.",
                "features": [
                    {
                        "level": 3,
                        "name": "Elemental Attunement",
                        "description": "Spend 1 Focus Point as a Bonus Action to manifest elemental energy for 10 minutes: reach increases by 10 feet, and your unarmed strikes can deal Acid, Cold, Fire, Lightning, or Thunder damage."
                    },
                    {
                        "level": 6,
                        "name": "Manipulate Elements",
                        "description": "Action to unleash an Elemental Burst in a 20-foot sphere within 120 feet dealing damage equal to 3 rolls of your Martial Arts die (Dex save halves)."
                    },
                    {
                        "level": 11,
                        "name": "Elemental Stride",
                        "description": "While Elemental Attunement is active, you gain a flying speed and swimming speed equal to your walking speed."
                    },
                    {
                        "level": 17,
                        "name": "Soul of Elements",
                        "description": "While Elemental Attunement is active, you gain resistance to Acid, Cold, Fire, Lightning, or Thunder damage, and your Elemental Burst deals extra damage."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Spear, 5 Daggers & Explorer's Pack",
                "items": [
                    "Spear",
                    "Dagger (5)",
                    "Explorer's Pack",
                    "11 GP"
                ]
            },
            {
                "name": "Gold Purchase (65 GP)",
                "items": [
                    "65 GP"
                ]
            }
        ]
    },
    {
        "id": "paladin",
        "name": "Paladin",
        "description": "A holy warrior bound by a sacred oath to uphold justice and combat evil.",
        "hitDie": 10,
        "primaryAbilities": [
            "str",
            "cha"
        ],
        "savingThrows": [
            "wis",
            "cha"
        ],
        "armorProficiencies": [
            "Light Armor",
            "Medium Armor",
            "Heavy Armor",
            "Shields"
        ],
        "weaponProficiencies": [
            "Simple Weapons",
            "Martial Weapons"
        ],
        "weaponMasteryCount": 2,
        "skillChoices": {
            "count": 2,
            "from": [
                "Athletics",
                "Insight",
                "Intimidation",
                "Medicine",
                "Persuasion",
                "Religion"
            ]
        },
        "spellcasting": {
            "ability": "cha",
            "type": "half",
            "cantripsKnownByLevel": [],
            "preparedSpellsByLevel": [
                2,
                3,
                4,
                5,
                6,
                6,
                7,
                7,
                9,
                9,
                10,
                10,
                11,
                11,
                12,
                12,
                14,
                14,
                15,
                15
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Lay on Hands",
                "description": "Pool of healing power equal to 5 * Paladin level. Action or Bonus Action to restore HP or cure Poisoned."
            },
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "Cast divine paladin spells starting at level 1 using Charisma."
            },
            {
                "level": 1,
                "name": "Weapon Mastery",
                "description": "Master 2 kinds of weapons of your choice."
            },
            {
                "level": 2,
                "name": "Fighting Style",
                "description": "Choose Defense, Dueling, Great Weapon Fighting, Protection, or Blessed Warrior."
            },
            {
                "level": 2,
                "name": "Paladin's Smite",
                "description": "Always have Divine Smite prepared; cast it once per Long Rest without expending a spell slot."
            },
            {
                "level": 3,
                "name": "Channel Divinity",
                "description": "Sacred power options depending on your chosen sacred oath."
            },
            {
                "level": 3,
                "name": "Paladin Subclass",
                "description": "Choose an Oath: Oath of Devotion, Oath of Glory, Oath of the Ancients, or Oath of Vengeance."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action."
            },
            {
                "level": 5,
                "name": "Faithful Steed",
                "description": "Always have Find Steed prepared; cast it once per Long Rest without expending a spell slot."
            },
            {
                "level": 6,
                "name": "Aura of Protection",
                "description": "Add your Charisma modifier (minimum +1) to all saving throws for yourself and allies within 10 ft."
            },
            {
                "level": 7,
                "name": "Subclass Feature",
                "description": "Gain a subclass aura granted by your chosen Sacred Oath."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Abjure Foes",
                "description": "Channel Divinity to Frighten and Daze multiple enemies within 60 ft on a failed Wisdom saving throw."
            },
            {
                "level": 10,
                "name": "Aura of Courage",
                "description": "You and allies within 10 ft of you cannot be Frightened while you are conscious."
            },
            {
                "level": 11,
                "name": "Radiant Strikes",
                "description": "Your melee attacks deal an extra 1d8 radiant damage on hit."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "4th-Level Spells",
                "description": "You gain access to 4th-level spell slots."
            },
            {
                "level": 14,
                "name": "Restoring Touch",
                "description": "Expend 5 HP from your Lay on Hands pool to remove Blinded, Charmed, Deafened, Frightened, Paralyzed, Poisoned, or Stunned conditions."
            },
            {
                "level": 15,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Sacred Oath."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 18,
                "name": "Aura Expansion",
                "description": "The range of your Aura of Protection and Aura of Courage increases from 10 ft to 30 ft."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Subclass Capstone",
                "description": "Gain your Sacred Oath's avatar transformation feature."
            }
        ],
        "subclasses": [
            {
                "id": "devotion",
                "name": "Oath of Devotion",
                "description": "Sacred Weapon illuminates blade with Charisma bonus to hit, Aura of Devotion.",
                "features": [
                    {
                        "level": 3,
                        "name": "Sacred Weapon",
                        "description": "Channel Divinity as a Bonus Action to imbue one weapon you hold with positive energy: add your Charisma modifier to attack rolls and emit bright light."
                    },
                    {
                        "level": 3,
                        "name": "Turn the Unholy",
                        "description": "Channel Divinity to force each fiend or undead within 30 feet that can see or hear you to make a Wisdom saving throw or be Turned."
                    },
                    {
                        "level": 7,
                        "name": "Aura of Devotion",
                        "description": "You and allies within 10 feet of you cannot be Charmed while you are conscious."
                    },
                    {
                        "level": 15,
                        "name": "Smite of Protection",
                        "description": "Whenever you cast a Smite spell, you and your allies within 30 feet gain half cover until the start of your next turn."
                    },
                    {
                        "level": 20,
                        "name": "Holy Nimbus",
                        "description": "Action to emit an aura of sunlight for 10 minutes: fiends and undead take 10 radiant damage at start of their turns, and you have Advantage on saving throws against their spells and abilities."
                    }
                ]
            },
            {
                "id": "ancients",
                "name": "Oath of the Ancients",
                "description": "Nature's Wrath ensnares foes, Aura of Warding resists spell damage.",
                "features": [
                    {
                        "level": 3,
                        "name": "Nature's Wrath",
                        "description": "Channel Divinity as an Action to cause spectral vines to reach out and Restrain a creature within 30 feet on a failed Strength saving throw."
                    },
                    {
                        "level": 3,
                        "name": "Turn the Faithless",
                        "description": "Channel Divinity to force each fey or fiend within 30 feet to make a Wisdom saving throw or be Turned."
                    },
                    {
                        "level": 7,
                        "name": "Aura of Warding",
                        "description": "You and allies within 10 feet of you have resistance to damage from spells."
                    },
                    {
                        "level": 15,
                        "name": "Undying Sentinel",
                        "description": "When reduced to 0 HP and not killed outright, drop to 1 HP instead once per Long Rest; you suffer none of the drawbacks of old age."
                    },
                    {
                        "level": 20,
                        "name": "Elder Champion",
                        "description": "Action to assume the form of an ancient force of primeval nature: regenerate 10 HP at start of turn, cast paladin spells with 1 action as Bonus Actions, and enemies within 10 ft have Disadvantage on saves against your spells."
                    }
                ]
            },
            {
                "id": "vengeance",
                "name": "Oath of Vengeance",
                "description": "Vow of Enmity grants Advantage against a single foe, Relentless Avenger.",
                "features": [
                    {
                        "level": 3,
                        "name": "Vow of Enmity",
                        "description": "Channel Divinity as a Bonus Action to utter a vow of enmity against a creature within 30 feet, gaining Advantage on attack rolls against it for 1 minute or until it dies."
                    },
                    {
                        "level": 7,
                        "name": "Relentless Avenger",
                        "description": "When you hit a creature with an Opportunity Attack, your speed increases and you can move up to half your Speed as part of the same reaction without provoking opportunity attacks."
                    },
                    {
                        "level": 15,
                        "name": "Soul of Vengeance",
                        "description": "When the creature marked by your Vow of Enmity makes an attack, you can use your Reaction to make a melee weapon attack against that creature if it is within range."
                    },
                    {
                        "level": 20,
                        "name": "Avenging Angel",
                        "description": "Action to transform into an angelic avenger for 10 minutes: sprout wings gaining a flying speed of 60 feet, and radiate a terrifying aura causing enemies within 30 feet to become Frightened on a failed Wisdom save."
                    }
                ]
            },
            {
                "id": "glory",
                "name": "Oath of Glory",
                "description": "Peerless Athlete, Inspiring Smite grants temporary hit points to allies.",
                "features": [
                    {
                        "level": 3,
                        "name": "Peerless Athlete",
                        "description": "Channel Divinity as a Bonus Action to gain Advantage on Athletics and Acrobatics checks, increase carrying capacity, and add 10 feet to jump distance for 10 minutes."
                    },
                    {
                        "level": 3,
                        "name": "Inspiring Smite",
                        "description": "Whenever you hit a creature with Divine Smite, Channel Divinity to grant temporary hit points equal to 2d8 + Paladin level distributed among allies within 30 feet."
                    },
                    {
                        "level": 7,
                        "name": "Aura of Alacrity",
                        "description": "Your speed increases by 10 feet. In addition, allies who start their turn within 10 feet of you gain a +10 foot bonus to speed until the end of that turn."
                    },
                    {
                        "level": 15,
                        "name": "Glorious Defense",
                        "description": "Reaction when you or an ally is attacked to grant a bonus to AC equal to your Charisma modifier. If the attack misses, you can immediately make a weapon attack against the attacker."
                    },
                    {
                        "level": 20,
                        "name": "Living Legend",
                        "description": "Action to transform for 1 minute: gain Advantage on all Charisma checks, turn one missed attack into a hit once per turn, and reroll a failed saving throw."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Chain Mail, Longsword & Shield",
                "items": [
                    "Chain Mail",
                    "Longsword",
                    "Shield",
                    "Javelin (6)",
                    "Holy Symbol",
                    "Priest's Pack",
                    "9 GP"
                ]
            },
            {
                "name": "Gold Purchase (150 GP)",
                "items": [
                    "150 GP"
                ]
            }
        ]
    },
    {
        "id": "ranger",
        "name": "Ranger",
        "description": "A master scout and survivalist who uses martial prowess and nature magic.",
        "hitDie": 10,
        "primaryAbilities": [
            "dex",
            "wis"
        ],
        "savingThrows": [
            "str",
            "dex"
        ],
        "armorProficiencies": [
            "Light Armor",
            "Medium Armor",
            "Shields"
        ],
        "weaponProficiencies": [
            "Simple Weapons",
            "Martial Weapons"
        ],
        "weaponMasteryCount": 2,
        "skillChoices": {
            "count": 3,
            "from": [
                "Animal Handling",
                "Athletics",
                "Insight",
                "Investigation",
                "Nature",
                "Perception",
                "Stealth",
                "Survival"
            ]
        },
        "spellcasting": {
            "ability": "wis",
            "type": "half",
            "cantripsKnownByLevel": [],
            "preparedSpellsByLevel": [
                2,
                3,
                4,
                5,
                6,
                6,
                7,
                7,
                9,
                9,
                10,
                10,
                11,
                11,
                12,
                12,
                14,
                14,
                15,
                15
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "Cast primal ranger spells starting at level 1 using Wisdom."
            },
            {
                "level": 1,
                "name": "Favored Enemy",
                "description": "Always have Hunter's Mark prepared; cast it PB times per Long Rest without expending a spell slot."
            },
            {
                "level": 1,
                "name": "Weapon Mastery",
                "description": "Master 2 kinds of weapons of your choice."
            },
            {
                "level": 2,
                "name": "Deft Explorer",
                "description": "Gain Expertise in one skill and gain swimming & climbing speed equal to walking speed at lvl 6."
            },
            {
                "level": 2,
                "name": "Fighting Style",
                "description": "Choose Archery, Defense, Dueling, or Two-Weapon Fighting."
            },
            {
                "level": 3,
                "name": "Ranger Subclass",
                "description": "Choose an archetype: Beast Master, Fey Wanderer, Gloom Stalker, or Hunter."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action."
            },
            {
                "level": 6,
                "name": "Roving",
                "description": "Your walking speed increases by 10 ft, and you gain a climbing speed and swimming speed equal to your walking speed."
            },
            {
                "level": 7,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Ranger archetype."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Expert Explorer",
                "description": "Gain Expertise in one additional skill."
            },
            {
                "level": 10,
                "name": "Tireless",
                "description": "Action to gain temporary HP (1d8 + Wis mod) PB times per Long Rest. In addition, decrease exhaustion level by 1 on a Short Rest."
            },
            {
                "level": 11,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Ranger archetype."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "Relentless Hunter",
                "description": "Taking damage can't break your concentration on Hunter's Mark."
            },
            {
                "level": 13,
                "name": "4th-Level Spells",
                "description": "You gain access to 4th-level spell slots."
            },
            {
                "level": 14,
                "name": "Nature's Veil",
                "description": "Bonus Action to become Invisible until the end of your next turn PB times per Long Rest."
            },
            {
                "level": 15,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Ranger archetype."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Precise Hunter",
                "description": "You have Advantage on attack rolls against the creature marked by your Hunter's Mark."
            },
            {
                "level": 17,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 18,
                "name": "Feral Senses",
                "description": "Gain Blindsight out to 30 ft; attacks against you don't gain Advantage from being unseen."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Foe Slayer",
                "description": "The damage die of your Hunter's Mark increases from 1d6 to 1d10."
            }
        ],
        "subclasses": [
            {
                "id": "beast-master",
                "name": "Beast Master",
                "description": "Primal Companion (Beast of the Land, Sea, or Sky).",
                "features": [
                    {
                        "level": 3,
                        "name": "Primal Companion",
                        "description": "You magically summon a primal beast (Beast of the Land, Sea, or Sky) that accompanies you on your adventures and fights alongside you."
                    },
                    {
                        "level": 7,
                        "name": "Exceptional Training",
                        "description": "Whenever you take a Bonus Action, you can command your beast to take the Dash, Disengage, Dodge, or Help action. Its attacks count as magical."
                    },
                    {
                        "level": 11,
                        "name": "Bestial Fury",
                        "description": "When you command your beast to take the Beast's Strike action, the beast can attack twice instead of once, and benefits from your Hunter's Mark."
                    },
                    {
                        "level": 15,
                        "name": "Share Spells",
                        "description": "When you cast a spell targeting yourself, you can also affect your beast companion if it is within 30 feet of you."
                    }
                ]
            },
            {
                "id": "fey-wanderer",
                "name": "Fey Wanderer",
                "description": "Dreadful Strikes psychic damage, Otherworldly Glamour adds Wisdom to Charisma checks.",
                "features": [
                    {
                        "level": 3,
                        "name": "Dreadful Strikes",
                        "description": "Once per turn when you hit a creature with a weapon attack, you can deal an extra 1d4 psychic damage to that creature."
                    },
                    {
                        "level": 3,
                        "name": "Otherworldly Glamour",
                        "description": "Whenever you make a Charisma check, add your Wisdom modifier (minimum +1). Gain proficiency in Deception, Performance, or Persuasion."
                    },
                    {
                        "level": 7,
                        "name": "Beguiling Twist",
                        "description": "Advantage on saving throws against Charmed and Frightened conditions. Whenever an enemy or ally succeeds on such a save, use a Reaction to force a different enemy within 120 feet to make a Wisdom save against Charm or Fear."
                    },
                    {
                        "level": 11,
                        "name": "Fey Reinforcements",
                        "description": "Always have Summon Fey prepared; cast it once per Long Rest without expending a spell slot, and you can summon the fey without concentrating on it for 1 minute."
                    },
                    {
                        "level": 15,
                        "name": "Misty Wanderer",
                        "description": "Cast Misty Step without expending a spell slot a number of times equal to your Wisdom modifier per Long Rest, and you can bring along one willing creature within 5 feet."
                    }
                ]
            },
            {
                "id": "gloom-stalker",
                "name": "Gloom Stalker",
                "description": "Dread Ambusher, Umbral Sight (extra darkvision and invisible to darkvision).",
                "features": [
                    {
                        "level": 3,
                        "name": "Dread Ambusher",
                        "description": "Add your Wisdom modifier to Initiative rolls. On the first turn of combat, your speed increases by 10 feet and you can make an extra attack dealing 2d6 psychic damage."
                    },
                    {
                        "level": 3,
                        "name": "Umbral Sight",
                        "description": "Gain Darkvision out to 60 feet (or extend it by 60 feet). While in darkness, you are invisible to any creature that relies on darkvision to see you."
                    },
                    {
                        "level": 7,
                        "name": "Iron Mind",
                        "description": "You gain proficiency in Wisdom saving throws. If you already have this proficiency, you instead gain proficiency in Intelligence or Charisma saving throws."
                    },
                    {
                        "level": 11,
                        "name": "Stalker's Flurry",
                        "description": "Once on each of your turns when you make a weapon attack, you can make an additional attack, or deal an extra 2d8 damage on hit."
                    },
                    {
                        "level": 15,
                        "name": "Shadowy Dodge",
                        "description": "Reaction when a creature attacks you to impose Disadvantage on the attack roll. If the attack misses, you can teleport up to 30 feet to an unoccupied space you can see."
                    }
                ]
            },
            {
                "id": "hunter",
                "name": "Hunter",
                "description": "Hunter's Prey (Colossus Slayer), Defensive Tactics.",
                "features": [
                    {
                        "level": 3,
                        "name": "Hunter's Prey",
                        "description": "Choose Colossus Slayer (deal an extra 1d8 damage to an injured creature once per turn) or Horde Breaker (make an additional attack against a creature within 5 feet of your target)."
                    },
                    {
                        "level": 3,
                        "name": "Hunter's Lore",
                        "description": "When a creature is marked by your Hunter's Mark, you immediately learn that creature's damage immunities, damage resistances, and damage vulnerabilities."
                    },
                    {
                        "level": 7,
                        "name": "Defensive Tactics",
                        "description": "Choose Escape the Horde (opportunity attacks against you have Disadvantage) or Multiattack Defense (when hit by a creature, subsequent attacks from that creature have Disadvantage)."
                    },
                    {
                        "level": 11,
                        "name": "Superior Hunter's Prey",
                        "description": "Colossus Slayer now triggers on any hit against an injured creature, or Horde Breaker can target two additional creatures within 5 feet."
                    },
                    {
                        "level": 15,
                        "name": "Superior Hunter's Defense",
                        "description": "Gain Evasion (take no damage on successful Dex saves and half on failure) or Uncanny Dodge (halve damage from an incoming attack as a Reaction)."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Scale Mail, Shortswords & Longbow",
                "items": [
                    "Scale Mail",
                    "Shortsword (2)",
                    "Longbow",
                    "Arrows (20)",
                    "Explorer's Pack",
                    "7 GP"
                ]
            },
            {
                "name": "Gold Purchase (150 GP)",
                "items": [
                    "150 GP"
                ]
            }
        ]
    },
    {
        "id": "rogue",
        "name": "Rogue",
        "description": "A scoundrel who uses stealth, precision, and trickery to exploit enemy vulnerabilities.",
        "hitDie": 8,
        "primaryAbilities": [
            "dex"
        ],
        "savingThrows": [
            "dex",
            "int"
        ],
        "armorProficiencies": [
            "Light Armor"
        ],
        "weaponProficiencies": [
            "Simple Weapons",
            "Martial Weapons with Finesse or Light"
        ],
        "weaponMasteryCount": 2,
        "skillChoices": {
            "count": 4,
            "from": [
                "Acrobatics",
                "Athletics",
                "Deception",
                "Insight",
                "Intimidation",
                "Investigation",
                "Perception",
                "Performance",
                "Persuasion",
                "Sleight of Hand",
                "Stealth"
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Sneak Attack (1d6)",
                "description": "Once per turn, deal an extra 1d6 damage (scales +1d6 every 2 levels) to one creature you hit with an attack if you have Advantage or an active ally within 5 ft."
            },
            {
                "level": 1,
                "name": "Expertise",
                "description": "Double proficiency bonus on two chosen skills or thieves' tools."
            },
            {
                "level": 1,
                "name": "Thieves' Cant",
                "description": "You know Thieves' Cant and one other language of your choice."
            },
            {
                "level": 1,
                "name": "Weapon Mastery",
                "description": "Master 2 kinds of weapons of your choice."
            },
            {
                "level": 2,
                "name": "Cunning Action",
                "description": "Bonus Action to take Dash, Disengage, or Hide."
            },
            {
                "level": 3,
                "name": "Rogue Subclass",
                "description": "Choose a roguish archetype: Arcane Trickster, Assassin, Soulknife, or Thief."
            },
            {
                "level": 3,
                "name": "Steady Aim",
                "description": "Bonus Action to give yourself Advantage on your next attack roll this turn, provided you haven't moved yet (reduces your speed to 0)."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Cunning Strike",
                "description": "Forgo Sneak Attack damage dice to apply tactical effects on hit: Poison (Con save or Poisoned), Trip (Dex save or Prone), or Withdraw (move half speed without opportunity attacks)."
            },
            {
                "level": 5,
                "name": "Uncanny Dodge",
                "description": "Reaction to halve the damage taken from an attack you can see."
            },
            {
                "level": 6,
                "name": "Expertise (2 Additional)",
                "description": "Double proficiency bonus on two additional chosen skills or thieves' tools."
            },
            {
                "level": 7,
                "name": "Evasion",
                "description": "Dex saves for half damage deal 0 damage on success and half damage on failure."
            },
            {
                "level": 7,
                "name": "Reliable Talent",
                "description": "Whenever you make an ability check with a skill or tool you are proficient in, treat a d20 roll of 9 or lower as a 10."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Roguish Archetype."
            },
            {
                "level": 10,
                "name": "Ability Score Improvement (Rogue Bonus)",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 11,
                "name": "Improved Cunning Strike",
                "description": "You can apply up to two different Cunning Strike effects to a single Sneak Attack."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Roguish Archetype."
            },
            {
                "level": 14,
                "name": "Devious Strikes",
                "description": "New Cunning Strike options: Daze (Con save or Dazed), Knock Out (Con save or Unconscious), and Obscure (Dex save or Blinded)."
            },
            {
                "level": 15,
                "name": "Slippery Mind",
                "description": "Gain proficiency in Wisdom and Charisma saving throws."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Roguish Archetype."
            },
            {
                "level": 18,
                "name": "Elusive",
                "description": "No attack roll can have Advantage against you while you aren't Incapacitated."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Stroke of Luck",
                "description": "Turn a missed attack roll into a hit, or treat a failed d20 ability check as a 20 (once per Short or Long Rest)."
            }
        ],
        "subclasses": [
            {
                "id": "arcane-trickster",
                "name": "Arcane Trickster",
                "description": "Mage Hand Legerdemain, Illusion and Enchantment arcane spellcasting.",
                "features": [
                    {
                        "level": 3,
                        "name": "Spellcasting",
                        "description": "Cast wizard spells using Intelligence. Prepare spells from enchantment, illusion, and other schools of magic, and cast cantrips including Mage Hand."
                    },
                    {
                        "level": 3,
                        "name": "Mage Hand Legerdemain",
                        "description": "Control an invisible Mage Hand as a Bonus Action: stow and retrieve objects from containers worn or carried by others, pick locks, and disarm traps at a range of 30 feet."
                    },
                    {
                        "level": 9,
                        "name": "Magical Ambush",
                        "description": "If you are hidden from a creature when you cast a spell on it, the creature has Disadvantage on any saving throw it makes against the spell this turn."
                    },
                    {
                        "level": 13,
                        "name": "Versatile Trickster",
                        "description": "Bonus Action to designate a creature within 5 feet of your Mage Hand; you gain Advantage on attack rolls against that creature until the end of the turn."
                    },
                    {
                        "level": 17,
                        "name": "Spell Thief",
                        "description": "Reaction when a creature casts a spell that targets you to force the caster to make a saving throw; on failure, you negate the spell's effect and can cast it yourself for 8 hours."
                    }
                ]
            },
            {
                "id": "assassin",
                "name": "Assassin",
                "description": "Assassinate (Advantage on un-acted targets, bonus damage), Infiltration Expertise.",
                "features": [
                    {
                        "level": 3,
                        "name": "Assassinate",
                        "description": "You have Advantage on attack rolls against any creature that hasn't taken a turn in combat yet. If you hit a surprised creature, your Sneak Attack deals extra damage equal to your Rogue level."
                    },
                    {
                        "level": 3,
                        "name": "Assassin's Tools",
                        "description": "You gain proficiency with the Disguise Kit and the Poisoner's Kit."
                    },
                    {
                        "level": 9,
                        "name": "Infiltration Expertise",
                        "description": "You can flawlessly adopt a disguise and false identity, and mimic speech patterns and handwriting after 3 hours of observation."
                    },
                    {
                        "level": 13,
                        "name": "Envenomed Weapons",
                        "description": "When you use the Poison option of your Cunning Strike, you ignore the creature's resistance to poison damage, and it takes an extra 2d6 poison damage."
                    },
                    {
                        "level": 17,
                        "name": "Death Strike",
                        "description": "When you hit a creature that hasn't taken a turn in the combat yet with Sneak Attack, it must make a Constitution saving throw (DC 8 + Dex mod + PB) or the attack's damage is doubled."
                    }
                ]
            },
            {
                "id": "soulknife",
                "name": "Soulknife",
                "description": "Psychic Blades, Psionic Power dice for skill checks and telepathic whispers.",
                "features": [
                    {
                        "level": 3,
                        "name": "Psychic Blades",
                        "description": "Manifest shimmering blades of psychic energy dealing 1d6 psychic damage + Dex modifier with the Finesse and Thrown properties. Make an additional attack with a second psychic blade for 1d4 damage as a Bonus Action."
                    },
                    {
                        "level": 3,
                        "name": "Psionic Power",
                        "description": "Harbor a pool of Psionic Energy dice (equal to 2x PB) to fuel Psi-Bolstered Knack (add die to failed skill checks) and Psychic Whispers (telepathic communication)."
                    },
                    {
                        "level": 9,
                        "name": "Soul Blades",
                        "description": "Homing Strikes: spend a Psionic Energy die to turn a missed attack into a hit. Psychic Teleportation: throw a psychic blade up to 10x the die roll and teleport to that space."
                    },
                    {
                        "level": 13,
                        "name": "Psychic Veil",
                        "description": "Action to cloak yourself in psychic energy, becoming Invisible for 1 hour once per Long Rest or by expending a Psionic Energy die."
                    },
                    {
                        "level": 17,
                        "name": "Mind Rend",
                        "description": "When you hit a creature with Sneak Attack using a Psychic Blade, spend 3 Sneak Attack dice to force a Wisdom saving throw or stun the target for 1 minute."
                    }
                ]
            },
            {
                "id": "thief",
                "name": "Thief",
                "description": "Fast Hands (Bonus Action use object or Sleight of Hand), Second-Story Work climbing speed.",
                "features": [
                    {
                        "level": 3,
                        "name": "Fast Hands",
                        "description": "Bonus Action to make a Dexterity (Sleight of Hand) check, use Thieves' Tools to disarm a trap or open a lock, or take the Utilize action."
                    },
                    {
                        "level": 3,
                        "name": "Second-Story Work",
                        "description": "Climbing no longer costs you extra movement, and your jump distance increases by a number of feet equal to your Dexterity modifier."
                    },
                    {
                        "level": 9,
                        "name": "Supreme Sneak",
                        "description": "You have Advantage on Dexterity (Stealth) checks if you move no more than half your speed on the same turn."
                    },
                    {
                        "level": 13,
                        "name": "Use Magic Device",
                        "description": "You can attune to up to four magic items at once, and you ignore all class, race, and spell requirements on the use of magic items."
                    },
                    {
                        "level": 17,
                        "name": "Thief's Reflexes",
                        "description": "You can take two turns during the first round of any combat (one on your normal initiative and another at initiative minus 10)."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Leather Armor, 2 Daggers, Shortsword & Thieves' Tools",
                "items": [
                    "Leather Armor",
                    "Shortsword",
                    "Dagger (2)",
                    "Thieves' Tools",
                    "Burglar's Pack",
                    "18 GP"
                ]
            },
            {
                "name": "Leather Armor, Shortbow & Rapier",
                "items": [
                    "Leather Armor",
                    "Rapier",
                    "Shortbow",
                    "Arrows (20)",
                    "Thieves' Tools",
                    "Dungeoneer's Pack",
                    "10 GP"
                ]
            },
            {
                "name": "Gold Purchase (110 GP)",
                "items": [
                    "110 GP"
                ]
            }
        ]
    },
    {
        "id": "sorcerer",
        "name": "Sorcerer",
        "description": "A spellcaster who draws on inherent magic from a gift, bloodline, or cosmic anomaly.",
        "hitDie": 6,
        "primaryAbilities": [
            "cha",
            "con"
        ],
        "savingThrows": [
            "con",
            "cha"
        ],
        "armorProficiencies": [],
        "weaponProficiencies": [
            "Simple Weapons"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 2,
            "from": [
                "Arcana",
                "Deception",
                "Insight",
                "Intimidation",
                "Persuasion",
                "Religion"
            ]
        },
        "spellcasting": {
            "ability": "cha",
            "type": "full",
            "cantripsKnownByLevel": [
                4,
                4,
                4,
                5,
                5,
                5,
                5,
                5,
                5,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6,
                6
            ],
            "preparedSpellsByLevel": [
                2,
                4,
                6,
                7,
                9,
                10,
                11,
                12,
                14,
                15,
                16,
                16,
                17,
                17,
                18,
                18,
                19,
                20,
                21,
                22
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    2,
                    1,
                    1
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Innate Sorcery",
                "description": "Bonus Action to unleash sorcerous power for 1 minute: Advantage on spell attack rolls and your spell save DC increases by 1. Usable twice per Long Rest."
            },
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "Cast sorcerer spells using Charisma."
            },
            {
                "level": 2,
                "name": "Font of Magic",
                "description": "Sorcery Points equal to your Sorcerer level. Convert spell slots to points and vice versa."
            },
            {
                "level": 2,
                "name": "Metamagic",
                "description": "Choose 2 Metamagic options: Quickened Spell, Twinned Spell, Subtle Spell, Heightened Spell, Empowered Spell, etc."
            },
            {
                "level": 3,
                "name": "Sorcerer Subclass",
                "description": "Choose an origin: Draconic Sorcery, Wild Magic Sorcery, Aberrant Sorcery, or Clockwork Sorcery."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Sorcerous Restoration",
                "description": "Regain expended Sorcery Points equal to half your Sorcerer level on a Short Rest once per Long Rest."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Sorcerer origin."
            },
            {
                "level": 7,
                "name": "Sorcery Incarnate",
                "description": "While Innate Sorcery is active, use up to two Metamagic options on a spell; spend 2 Sorcery Points to regain a use of Innate Sorcery."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 10,
                "name": "Metamagic (Additional Option)",
                "description": "Gain 1 additional Metamagic option of your choice."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Sorcerer origin."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level spell slots."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Sorcerer origin."
            },
            {
                "level": 15,
                "name": "8th-Level Spells",
                "description": "You gain access to 8th-level spell slots."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Metamagic (Additional Option)",
                "description": "Gain 1 additional Metamagic option of your choice."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level spell slots."
            },
            {
                "level": 18,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Sorcerer origin."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Arcane Apotheosis",
                "description": "While Innate Sorcery is active, you can use one Metamagic option on each of your turns without spending Sorcery Points."
            }
        ],
        "subclasses": [
            {
                "id": "aberrant",
                "name": "Aberrant Sorcery",
                "description": "Psionic Spells, Telepathic Speech, Psionic Sorcery.",
                "features": [
                    {
                        "level": 3,
                        "name": "Psionic Spells",
                        "description": "You learn bonus psionic spells (such as Mind Sliver, Dissonant Whispers, Arms of Hadar). You can swap them for Divination or Enchantment spells from Sorcerer, Warlock, or Wizard."
                    },
                    {
                        "level": 3,
                        "name": "Telepathic Speech",
                        "description": "Bonus Action to form a telepathic link with a creature within 30 feet for miles equal to your Charisma modifier."
                    },
                    {
                        "level": 6,
                        "name": "Psionic Sorcery",
                        "description": "Cast any spell from your Psionic Spells feature by expending a number of Sorcery Points equal to the spell's level without verbal, somatic, or material components."
                    },
                    {
                        "level": 6,
                        "name": "Psychic Defenses",
                        "description": "You gain resistance to Psychic damage, and you have Advantage on saving throws against being Charmed or Frightened."
                    },
                    {
                        "level": 14,
                        "name": "Revelation in Flesh",
                        "description": "Bonus Action and 1 or more Sorcery Points to alter your form: gain a flying speed, swimming speed, squeeze through narrow spaces, or see invisible creatures."
                    },
                    {
                        "level": 18,
                        "name": "Warping Implosion",
                        "description": "Action and 5 Sorcery Points to teleport up to 120 feet and leave behind a gravitational vortex dealing 3d10 force damage and pulling enemies toward the center."
                    }
                ]
            },
            {
                "id": "clockwork",
                "name": "Clockwork Sorcery",
                "description": "Clockwork Magic, Restore Balance cancels Advantage/Disadvantage.",
                "features": [
                    {
                        "level": 3,
                        "name": "Clockwork Spells",
                        "description": "You learn bonus spells of cosmic order (such as Aid, Lesser Restoration, Protection from Evil and Good). You can swap them for Abjuration or Transmutation spells."
                    },
                    {
                        "level": 3,
                        "name": "Restore Balance",
                        "description": "Reaction when a creature within 60 feet rolls with Advantage or Disadvantage to cancel that roll's modifier PB times per Long Rest."
                    },
                    {
                        "level": 6,
                        "name": "Bastion of Law",
                        "description": "Action to spend 1 to 5 Sorcery Points to create a protective ward of d8s around yourself or an ally that reduces incoming damage."
                    },
                    {
                        "level": 14,
                        "name": "Trance of Order",
                        "description": "Bonus Action and 5 Sorcery Points to enter a state of clockwork perfection: attack rolls against you cannot have Advantage, and d20 rolls of 9 or lower count as a 10."
                    },
                    {
                        "level": 18,
                        "name": "Clockwork Cavalcade",
                        "description": "Action and 7 Sorcery Points to summon spirits of order in a 30-foot cube: restore up to 100 hit points divided among creatures, repair objects, and end spells of 6th level or lower."
                    }
                ]
            },
            {
                "id": "draconic",
                "name": "Draconic Sorcery",
                "description": "Draconic Resilience (AC 10 + Dex + Cha, +1 HP per level), Elemental Affinity.",
                "features": [
                    {
                        "level": 3,
                        "name": "Draconic Resilience",
                        "description": "Parts of your skin are covered by dragon scales. Your AC equals 10 + Dex modifier + Cha modifier while unarmored, and your HP maximum increases by 1 for each Sorcerer level."
                    },
                    {
                        "level": 3,
                        "name": "Draconic Ancestor",
                        "description": "Choose a dragon ancestor (Black/Copper: Acid, Blue/Bronze: Lightning, Brass/Gold/Red: Fire, Green: Poison, Silver/White: Cold) which determines your elemental affinity."
                    },
                    {
                        "level": 6,
                        "name": "Elemental Affinity",
                        "description": "Add your Charisma modifier to one damage roll of any spell that deals damage associated with your dragon ancestor. In addition, spend 1 Sorcery Point to gain 1 hour resistance to that damage type."
                    },
                    {
                        "level": 14,
                        "name": "Dragon Wings",
                        "description": "Bonus Action to sprout draconic wings from your back, gaining a flying speed equal to your walking speed."
                    },
                    {
                        "level": 18,
                        "name": "Dragon Companion",
                        "description": "Action and 5 Sorcery Points to summon a draconic avatar that fights alongside you and unleashes breath attacks."
                    }
                ]
            },
            {
                "id": "wild-magic",
                "name": "Wild Magic Sorcery",
                "description": "Wild Magic Surge, Tides of Chaos Advantage.",
                "features": [
                    {
                        "level": 3,
                        "name": "Wild Magic Surge",
                        "description": "Whenever you cast a Sorcerer spell of level 1 or higher, the DM can have you roll a d20. On a 1, roll on the Wild Magic Surge table to create a random magical effect."
                    },
                    {
                        "level": 3,
                        "name": "Tides of Chaos",
                        "description": "Gain Advantage on one attack roll, ability check, or saving throw. Recharges on a Long Rest or after triggering a Wild Magic Surge."
                    },
                    {
                        "level": 6,
                        "name": "Bend Luck",
                        "description": "Reaction and 2 Sorcery Points to add or subtract 1d4 from another creature's attack roll, ability check, or saving throw."
                    },
                    {
                        "level": 14,
                        "name": "Controlled Chaos",
                        "description": "Whenever you roll on the Wild Magic Surge table, you can roll twice and use either number."
                    },
                    {
                        "level": 18,
                        "name": "Spell Bombardment",
                        "description": "When you roll the maximum damage on a spell die, roll one of the dice again and add its damage to the total."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Light Crossbow, 2 Daggers & Arcane Focus",
                "items": [
                    "Crossbow, Light",
                    "Crossbow Bolts (20)",
                    "Dagger (2)",
                    "Arcane Focus (Orb)",
                    "Dungeoneer's Pack",
                    "28 GP"
                ]
            },
            {
                "name": "Gold Purchase (50 GP)",
                "items": [
                    "50 GP"
                ]
            }
        ]
    },
    {
        "id": "warlock",
        "name": "Warlock",
        "description": "A wielder of magic derived from a bargain with an otherworldly patron.",
        "hitDie": 8,
        "primaryAbilities": [
            "cha",
            "con"
        ],
        "savingThrows": [
            "wis",
            "cha"
        ],
        "armorProficiencies": [
            "Light Armor"
        ],
        "weaponProficiencies": [
            "Simple Weapons"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 2,
            "from": [
                "Arcana",
                "Deception",
                "History",
                "Intimidation",
                "Investigation",
                "Nature",
                "Religion"
            ]
        },
        "spellcasting": {
            "ability": "cha",
            "type": "pact",
            "cantripsKnownByLevel": [
                2,
                2,
                2,
                3,
                3,
                3,
                3,
                3,
                3,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4,
                4
            ],
            "preparedSpellsByLevel": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                10,
                11,
                11,
                12,
                12,
                13,
                13,
                14,
                14,
                15,
                15
            ],
            "spellSlotsByLevel": [
                [
                    1,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    3,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    3,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    3,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    3,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    3,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    3,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    0,
                    0,
                    4,
                    0,
                    0,
                    0,
                    0
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Eldritch Invocations (1 Invocation)",
                "description": "Gain 1 Eldritch Invocation at level 1 (e.g. Pact of the Blade, Pact of the Tome, Pact of the Chain, Agonizing Blast, Armor of Shadows)."
            },
            {
                "level": 1,
                "name": "Pact Magic",
                "description": "Cast warlock spells using Charisma. All spell slots are of the highest unlocked level and recharge on a Short or Long Rest."
            },
            {
                "level": 2,
                "name": "Eldritch Invocations (2 Invocations)",
                "description": "You gain a second Eldritch Invocation."
            },
            {
                "level": 2,
                "name": "Magical Cunning",
                "description": "Regain half your pact spell slots once per Long Rest with a 1-minute ritual."
            },
            {
                "level": 3,
                "name": "Warlock Subclass",
                "description": "Choose a patron: Fiend Patron, Archfey Patron, Celestial Patron, or Great Old One Patron."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Eldritch Invocations (3 Invocations)",
                "description": "You gain a third Eldritch Invocation."
            },
            {
                "level": 5,
                "name": "3rd-Level Pact Slots",
                "description": "Your pact spell slots upgrade to 3rd level."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Otherworldly Patron."
            },
            {
                "level": 7,
                "name": "Eldritch Invocations (4 Invocations)",
                "description": "You gain a fourth Eldritch Invocation."
            },
            {
                "level": 7,
                "name": "4th-Level Pact Slots",
                "description": "Your pact spell slots upgrade to 4th level."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "Contact Patron",
                "description": "Cast Contact Other Plane without expending a spell slot or failing the Intelligence saving throw once per Long Rest."
            },
            {
                "level": 9,
                "name": "Eldritch Invocations (5 Invocations)",
                "description": "You gain a fifth Eldritch Invocation."
            },
            {
                "level": 9,
                "name": "5th-Level Pact Slots",
                "description": "Your pact spell slots upgrade to 5th level."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Otherworldly Patron."
            },
            {
                "level": 11,
                "name": "Mystic Arcanum (6th Level)",
                "description": "Choose one 6th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot."
            },
            {
                "level": 11,
                "name": "3rd Pact Spell Slot",
                "description": "You gain a third pact magic spell slot."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 12,
                "name": "Eldritch Invocations (6 Invocations)",
                "description": "You gain a sixth Eldritch Invocation."
            },
            {
                "level": 13,
                "name": "Mystic Arcanum (7th Level)",
                "description": "Choose one 7th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Otherworldly Patron."
            },
            {
                "level": 15,
                "name": "Mystic Arcanum (8th Level)",
                "description": "Choose one 8th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot."
            },
            {
                "level": 15,
                "name": "Eldritch Invocations (7 Invocations)",
                "description": "You gain a seventh Eldritch Invocation."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "Mystic Arcanum (9th Level)",
                "description": "Choose one 9th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot."
            },
            {
                "level": 17,
                "name": "4th Pact Spell Slot",
                "description": "You gain a fourth pact magic spell slot."
            },
            {
                "level": 18,
                "name": "Eldritch Invocations (8 Invocations)",
                "description": "You gain an eighth Eldritch Invocation."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Eldritch Master",
                "description": "Spend 1 minute entreating your patron to regain all expended pact magic spell slots once per Long Rest."
            }
        ],
        "subclasses": [
            {
                "id": "archfey",
                "name": "Archfey Patron",
                "description": "Misty Escape (teleport when taking damage), Steps of the Fey enhancements.",
                "features": [
                    {
                        "level": 3,
                        "name": "Steps of the Fey",
                        "description": "You always have Misty Step prepared, and you can cast it without expending a spell slot PB times per Long Rest with enhanced effects (Taunting Step or Refreshing Step)."
                    },
                    {
                        "level": 6,
                        "name": "Misty Escape",
                        "description": "Reaction upon taking damage to cast Misty Step and turn Invisible until the start of your next turn."
                    },
                    {
                        "level": 10,
                        "name": "Beguiling Defenses",
                        "description": "You are immune to the Charmed condition. In addition, when a creature attempts to charm you, you can turn the charm back upon that creature."
                    },
                    {
                        "level": 14,
                        "name": "Bewitching Cast",
                        "description": "Whenever you cast an Enchantment or Illusion spell with a casting time of 1 action, you can cast Misty Step as part of that same action without expending a spell slot."
                    }
                ]
            },
            {
                "id": "celestial",
                "name": "Celestial Patron",
                "description": "Healing Light (pool of d6 healing dice), Radiant Soul bonus radiant/fire damage.",
                "features": [
                    {
                        "level": 3,
                        "name": "Healing Light",
                        "description": "Harbor a pool of d6 healing dice equal to 1 + your Warlock level. Bonus Action to heal a creature within 60 feet by expending dice (up to your Charisma modifier at once)."
                    },
                    {
                        "level": 6,
                        "name": "Radiant Soul",
                        "description": "You gain resistance to Radiant damage. In addition, add your Charisma modifier to one radiant or fire damage roll of any spell you cast."
                    },
                    {
                        "level": 10,
                        "name": "Celestial Resilience",
                        "description": "Whenever you finish a Short or Long Rest, you gain temporary hit points equal to your Warlock level + Charisma modifier, and up to five allies gain temp HP."
                    },
                    {
                        "level": 14,
                        "name": "Searing Vengeance",
                        "description": "When you would drop to 0 HP, burst with radiant light: regain half your hit points, stand up, and deal 2d8 + Charisma modifier radiant damage and Blind hostiles within 30 feet."
                    }
                ]
            },
            {
                "id": "fiend",
                "name": "Fiend Patron",
                "description": "Dark One's Blessing (temporary HP on kill), Dark One's Own Luck (add 1d10 to ability check/save).",
                "features": [
                    {
                        "level": 3,
                        "name": "Dark One's Blessing",
                        "description": "When you reduce an enemy to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your Warlock level (minimum 1)."
                    },
                    {
                        "level": 6,
                        "name": "Dark One's Own Luck",
                        "description": "When you make an ability check or a saving throw, you can add 1d10 to your roll once per Short or Long Rest."
                    },
                    {
                        "level": 10,
                        "name": "Fiendish Resilience",
                        "description": "Choose one damage type whenever you finish a Short or Long Rest. You gain resistance to that damage type until you choose a different one."
                    },
                    {
                        "level": 14,
                        "name": "Hurl Through Hell",
                        "description": "When you hit a creature with an attack, you can banish it through the Lower Planes. At the end of your next turn, it returns and takes 10d10 psychic damage."
                    }
                ]
            },
            {
                "id": "great-old-one",
                "name": "Great Old One Patron",
                "description": "Awakened Mind (telepathic communication), Psychic Spells, Thought Shield.",
                "features": [
                    {
                        "level": 3,
                        "name": "Awakened Mind",
                        "description": "You can telepathically speak to any creature you can see within 30 feet, and the creature can respond telepathically in a language it knows."
                    },
                    {
                        "level": 3,
                        "name": "Psychic Spells",
                        "description": "Whenever you cast a warlock spell that deals damage, you can change the damage type to Psychic, and you can cast enchantment or illusion spells without verbal or somatic components."
                    },
                    {
                        "level": 6,
                        "name": "Clairvoyant Combat",
                        "description": "Gain Advantage on attack rolls against a creature you have telepathic contact with, and it has Disadvantage on attack rolls against you."
                    },
                    {
                        "level": 10,
                        "name": "Thought Shield",
                        "description": "Your thoughts cannot be read, and you gain resistance to Psychic damage. When an enemy deals psychic damage to you, it takes the same amount of damage."
                    },
                    {
                        "level": 14,
                        "name": "Create Thrall",
                        "description": "Action to touch an Incapacitated humanoid to charm it indefinitely. You communicate telepathically across any distance while on the same plane."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Leather Armor, Sickle & Arcane Focus",
                "items": [
                    "Leather Armor",
                    "Sickle",
                    "Dagger (2)",
                    "Arcane Focus (Wand)",
                    "Scholar's Pack",
                    "15 GP"
                ]
            },
            {
                "name": "Gold Purchase (100 GP)",
                "items": [
                    "100 GP"
                ]
            }
        ]
    },
    {
        "id": "wizard",
        "name": "Wizard",
        "description": "A scholarly magic-user capable of manipulating the fundamental fabric of reality.",
        "hitDie": 6,
        "primaryAbilities": [
            "int"
        ],
        "savingThrows": [
            "int",
            "wis"
        ],
        "armorProficiencies": [],
        "weaponProficiencies": [
            "Simple Weapons"
        ],
        "weaponMasteryCount": 0,
        "skillChoices": {
            "count": 2,
            "from": [
                "Arcana",
                "History",
                "Insight",
                "Investigation",
                "Medicine",
                "Religion"
            ]
        },
        "spellcasting": {
            "ability": "int",
            "type": "full",
            "cantripsKnownByLevel": [
                3,
                3,
                3,
                4,
                4,
                4,
                4,
                4,
                4,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5,
                5
            ],
            "preparedSpellsByLevel": [
                4,
                5,
                6,
                7,
                9,
                10,
                11,
                12,
                14,
                15,
                16,
                16,
                17,
                17,
                18,
                18,
                19,
                20,
                21,
                22
            ],
            "spellSlotsByLevel": [
                [
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    1,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    0,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    0,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    0,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    0
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    1,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    1,
                    1,
                    1
                ],
                [
                    4,
                    3,
                    3,
                    3,
                    3,
                    2,
                    2,
                    1,
                    1
                ]
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Spellbook",
                "description": "Your book contains six 1st-level spells of your choice. You add two wizard spells of your choice to it whenever you gain a Wizard level."
            },
            {
                "level": 1,
                "name": "Spellcasting & Ritual Casting",
                "description": "Cast prepared wizard spells using Intelligence. You can cast any wizard spell in your spellbook as a ritual if it has the ritual tag."
            },
            {
                "level": 1,
                "name": "Arcane Recovery",
                "description": "Once per day when you finish a Short Rest, recover expended spell slots with a combined level equal to up to half your Wizard level (rounded up)."
            },
            {
                "level": 2,
                "name": "Scholar",
                "description": "Gain Expertise in one of your proficient skills from: Arcana, History, Nature, Medicine, or Religion."
            },
            {
                "level": 3,
                "name": "Wizard Subclass",
                "description": "Choose an arcane tradition: Abjurer, Diviner, Evoker, or Illusionist."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 5,
                "name": "Memorize Spell",
                "description": "Whenever you finish a Short Rest, you can study your spellbook and replace one prepared spell with another from your book."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Arcane Tradition."
            },
            {
                "level": 7,
                "name": "4th-Level Spells",
                "description": "You gain access to 4th-level spell slots."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level spell slots."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Arcane Tradition."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level spell slots."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Arcane Tradition."
            },
            {
                "level": 15,
                "name": "8th-Level Spells",
                "description": "You gain access to 8th-level spell slots."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "Gain the Ability Score Improvement feat or another feat for which you qualify."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level spell slots."
            },
            {
                "level": 18,
                "name": "Spell Mastery",
                "description": "Choose one 1st-level and one 2nd-level wizard spell from your spellbook. Cast each at its lowest level at will without expending a spell slot."
            },
            {
                "level": 19,
                "name": "Epic Boon / Ability Score Improvement",
                "description": "Choose an Epic Boon feat or another feat of your choice."
            },
            {
                "level": 20,
                "name": "Signature Spells",
                "description": "Choose two 3rd-level wizard spells as signature spells. They are always prepared, and you can cast each once per Short or Long Rest without a spell slot."
            }
        ],
        "subclasses": [
            {
                "id": "abjurer",
                "name": "Abjurer",
                "description": "Arcane Ward absorbs damage equal to 2x Wizard level + Int modifier, Project Ward.",
                "features": [
                    {
                        "level": 3,
                        "name": "Arcane Ward",
                        "description": "Whenever you cast an Abjuration spell with a spell slot, you create a protective ward that has HP equal to twice your Wizard level + your Intelligence modifier, absorbing damage taken."
                    },
                    {
                        "level": 6,
                        "name": "Projected Ward",
                        "description": "When a creature that you can see within 30 feet takes damage, you can use your Reaction to intercept that damage with your Arcane Ward."
                    },
                    {
                        "level": 10,
                        "name": "Spell Breaker",
                        "description": "You always have Counterspell and Dispel Magic prepared. In addition, you can cast Counterspell or Dispel Magic as a Bonus Action."
                    },
                    {
                        "level": 14,
                        "name": "Spell Resistance",
                        "description": "You have Advantage on saving throws against spells, and you have resistance against damage from spells."
                    }
                ]
            },
            {
                "id": "diviner",
                "name": "Diviner",
                "description": "Portent rolls 2 d20s at the end of a Long Rest to replace any d20 roll.",
                "features": [
                    {
                        "level": 3,
                        "name": "Portent",
                        "description": "When you finish a Long Rest, roll two d20s and record the numbers. You can replace any attack roll, saving throw, or ability check made by you or a creature you can see with one of the foretold rolls."
                    },
                    {
                        "level": 6,
                        "name": "Expert Divination",
                        "description": "Casting a Divination spell of 2nd level or higher regains an expended spell slot of a lower level."
                    },
                    {
                        "level": 10,
                        "name": "The Third Eye",
                        "description": "Action to gain one magical sight benefit until incapacitated or taking a rest: Darkvision 60 ft, Ethereal Sight, Greater Comprehension, or See Invisibility."
                    },
                    {
                        "level": 14,
                        "name": "Greater Portent",
                        "description": "The visions in your dreams intensify. You roll three d20s for your Portent feature instead of two."
                    }
                ]
            },
            {
                "id": "evoker",
                "name": "Evoker",
                "description": "Sculpt Spells protects allies from area-of-effect spells, Potent Cantrip.",
                "features": [
                    {
                        "level": 3,
                        "name": "Sculpt Spells",
                        "description": "When you cast an Evocation spell that affects other creatures you can see, you can choose a number of them equal to 1 + the spell's level. The chosen creatures automatically succeed on their saving throws and take no damage."
                    },
                    {
                        "level": 6,
                        "name": "Potent Cantrip",
                        "description": "Your damaging cantrips affect even creatures that avoid the brunt of the effect: creature takes half damage on a successful save or missed attack."
                    },
                    {
                        "level": 10,
                        "name": "Empowered Evocation",
                        "description": "You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast."
                    },
                    {
                        "level": 14,
                        "name": "Overchannel",
                        "description": "When you cast a wizard spell of 1st through 5th level that deals damage, you can maximize the damage dice of the spell. Subsequent uses before a Long Rest deal necrotic damage to you."
                    }
                ]
            },
            {
                "id": "illusionist",
                "name": "Illusionist",
                "description": "Improved Minor Illusion, Malleable Illusions reshape active illusions.",
                "features": [
                    {
                        "level": 3,
                        "name": "Improved Minor Illusion",
                        "description": "You learn the Minor Illusion cantrip. You can cast it as a Bonus Action and can create both a sound and an image with a single casting."
                    },
                    {
                        "level": 6,
                        "name": "Malleable Illusions",
                        "description": "When you cast an illusion spell with a duration of 1 minute or longer, you can use your action to change the nature of that illusion."
                    },
                    {
                        "level": 10,
                        "name": "Illusory Self",
                        "description": "Reaction when a creature makes an attack roll against you to interpose an illusory duplicate, causing the attack to miss automatically once per Short or Long Rest."
                    },
                    {
                        "level": 14,
                        "name": "Illusory Reality",
                        "description": "Bonus Action to make one inanimate, nonmagical object that is part of an illusion you cast real for 1 minute."
                    }
                ]
            }
        ],
        "startingEquipmentOptions": [
            {
                "name": "Quarterstaff, Spellbook & Scholar's Pack",
                "items": [
                    "Quarterstaff",
                    "Spellbook",
                    "Arcane Focus (Orb)",
                    "Scholar's Pack",
                    "5 GP"
                ]
            },
            {
                "name": "Gold Purchase (55 GP)",
                "items": [
                    "55 GP"
                ]
            }
        ]
    }
];

export const SEED_SPECIES = [
    {
        "id": "human",
        "name": "Human",
        "description": "Versatile, ambitious, and adaptable, humans thrive across every realm and culture.",
        "size": "Medium or Small",
        "speed": 30,
        "extraSkillCount": 1,
        "extraFeatCount": 1,
        "traits": [
            {
                "name": "Resourceful",
                "description": "You gain Heroic Inspiration whenever you finish a Long Rest."
            },
            {
                "name": "Skillful",
                "description": "You gain proficiency in one skill of your choice."
            },
            {
                "name": "Versatile",
                "description": "You gain one Origin Feat of your choice."
            }
        ]
    },
    {
        "id": "elf",
        "name": "Elf",
        "description": "Graceful inheritors of magic, elves possess keen senses and deep connection to the Feywild.",
        "size": "Medium",
        "speed": 30,
        "darkvision": "Darkvision 60 ft.",
        "traits": [
            {
                "name": "Fey Ancestry",
                "description": "You have Advantage on saving throws you make to avoid or end the Charmed condition on yourself, and magic can't put you to sleep."
            },
            {
                "name": "Keen Senses",
                "description": "You have proficiency in the Perception skill."
            },
            {
                "name": "Trance",
                "description": "You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation."
            }
        ],
        "lineages": [
            {
                "id": "high-elf",
                "name": "High Elf",
                "description": "Steeped in arcane tradition, you inherit spells from the Wizard list and can change cantrips on a Long Rest.",
                "traits": [
                    {
                        "name": "High Elf Magic",
                        "description": "You know the Prestidigitation cantrip (or another Wizard cantrip). At level 3 you can cast Detect Magic, and at level 5 Misty Step (once per Long Rest or with spell slots)."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Prestidigitation"
                    },
                    {
                        "level": 3,
                        "spellName": "Detect Magic"
                    },
                    {
                        "level": 5,
                        "spellName": "Misty Step"
                    }
                ]
            },
            {
                "id": "wood-elf",
                "name": "Wood Elf",
                "description": "Swift guardians of ancient forests, wood elves move with extraordinary quickness and druidic stealth.",
                "speedBonus": 5,
                "traits": [
                    {
                        "name": "Fleet of Foot",
                        "description": "Your base speed increases to 35 feet."
                    },
                    {
                        "name": "Wood Elf Magic",
                        "description": "You know the Druidcraft cantrip. At level 3 you can cast Longstrider, and at level 5 Pass Without Trace."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Druidcraft"
                    },
                    {
                        "level": 3,
                        "spellName": "Longstrider"
                    },
                    {
                        "level": 5,
                        "spellName": "Pass Without Trace"
                    }
                ]
            },
            {
                "id": "drow",
                "name": "Drow",
                "description": "Children of the Underdark blessed with superior darkvision and shadowy magic.",
                "darkvision": "Darkvision 120 ft.",
                "traits": [
                    {
                        "name": "Superior Darkvision",
                        "description": "Your Darkvision extends to 120 feet."
                    },
                    {
                        "name": "Drow Magic",
                        "description": "You know the Dancing Lights cantrip. At level 3 you can cast Faerie Fire, and at level 5 Darkness."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Dancing Lights"
                    },
                    {
                        "level": 3,
                        "spellName": "Faerie Fire"
                    },
                    {
                        "level": 5,
                        "spellName": "Darkness"
                    }
                ]
            }
        ]
    },
    {
        "id": "dwarf",
        "name": "Dwarf",
        "description": "Stalwart defenders forged in stone and mountain caverns, famed for endurance and master craftsmanship.",
        "size": "Medium",
        "speed": 30,
        "darkvision": "Darkvision 120 ft.",
        "traits": [
            {
                "name": "Dwarven Resilience",
                "description": "You have Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition."
            },
            {
                "name": "Dwarven Toughness",
                "description": "Your Hit Point maximum increases by 1 for each level you possess."
            },
            {
                "name": "Stonecunning",
                "description": "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes while on stone surfaces. You can use this a number of times equal to your Proficiency Bonus per Long Rest."
            }
        ]
    },
    {
        "id": "halfling",
        "name": "Halfling",
        "description": "Small folk of immense courage, luck, and community spirit who can slip past danger unseen.",
        "size": "Small",
        "speed": 30,
        "traits": [
            {
                "name": "Brave",
                "description": "You have Advantage on saving throws you make to avoid or end the Frightened condition."
            },
            {
                "name": "Halfling Nimbleness",
                "description": "You can move through the space of any creature that is of a size larger than yours."
            },
            {
                "name": "Luck",
                "description": "When you roll a 1 on the d20 of a D20 Test (attack roll, ability check, or saving throw), you can reroll the die and must use the new roll."
            },
            {
                "name": "Naturally Stealthy",
                "description": "You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you."
            }
        ]
    },
    {
        "id": "gnome",
        "name": "Gnome",
        "description": "Inventive, curious, and sharp-minded folk who excel at magical craft and trickery.",
        "size": "Small",
        "speed": 30,
        "darkvision": "Darkvision 60 ft.",
        "traits": [
            {
                "name": "Gnomish Cunning",
                "description": "You have Advantage on Intelligence, Wisdom, and Charisma saving throws."
            }
        ],
        "lineages": [
            {
                "id": "forest-gnome",
                "name": "Forest Gnome",
                "description": "Attuned to woodcraft and illusion, forest gnomes can communicate with small forest creatures.",
                "traits": [
                    {
                        "name": "Forest Gnome Magic",
                        "description": "You know the Minor Illusion cantrip and can cast Speak with Animals a number of times equal to your Proficiency Bonus per Long Rest."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Minor Illusion"
                    },
                    {
                        "level": 1,
                        "spellName": "Speak with Animals"
                    }
                ]
            },
            {
                "id": "rock-gnome",
                "name": "Rock Gnome",
                "description": "Master tinkers and ingenious inventors who construct tiny mechanical marvels.",
                "traits": [
                    {
                        "name": "Tinker & Artificer's Lore",
                        "description": "You know the Mending and Prestidigitation cantrips and can use tinker's tools to build clockwork devices (clockwork toy, fire starter, music box)."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Mending"
                    },
                    {
                        "level": 1,
                        "spellName": "Prestidigitation"
                    }
                ]
            }
        ]
    },
    {
        "id": "dragonborn",
        "name": "Dragonborn",
        "description": "Proud scions of ancient dragons, channeling elemental breath and draconian wings.",
        "size": "Medium",
        "speed": 30,
        "darkvision": "Darkvision 60 ft.",
        "traits": [
            {
                "name": "Breath Weapon",
                "description": "When you take the Attack action, you can replace one of your attacks with an exhalation of magical energy in a 15-foot cone or 30-foot line (1d10 damage of your draconic ancestry type, scaling to 2d10 at 5th, 3d10 at 11th, 4d10 at 17th level). Usable PB times per Long Rest."
            },
            {
                "name": "Damage Resistance",
                "description": "You have Resistance to the damage type associated with your Draconic Ancestry."
            },
            {
                "name": "Draconic Flight (Level 5)",
                "description": "Starting at level 5, as a Bonus Action you can sprout spectral wings and gain a Fly Speed equal to your Speed for 10 minutes once per Long Rest."
            }
        ],
        "lineages": [
            {
                "id": "black",
                "name": "Black Dragon (Acid)",
                "description": "Line 30 ft, Acid damage and Acid resistance.",
                "traits": []
            },
            {
                "id": "blue",
                "name": "Blue Dragon (Lightning)",
                "description": "Line 30 ft, Lightning damage and Lightning resistance.",
                "traits": []
            },
            {
                "id": "brass",
                "name": "Brass Dragon (Fire)",
                "description": "Line 30 ft, Fire damage and Fire resistance.",
                "traits": []
            },
            {
                "id": "bronze",
                "name": "Bronze Dragon (Lightning)",
                "description": "Line 30 ft, Lightning damage and Lightning resistance.",
                "traits": []
            },
            {
                "id": "copper",
                "name": "Copper Dragon (Acid)",
                "description": "Line 30 ft, Acid damage and Acid resistance.",
                "traits": []
            },
            {
                "id": "gold",
                "name": "Gold Dragon (Fire)",
                "description": "Cone 15 ft, Fire damage and Fire resistance.",
                "traits": []
            },
            {
                "id": "green",
                "name": "Green Dragon (Poison)",
                "description": "Cone 15 ft, Poison damage and Poison resistance.",
                "traits": []
            },
            {
                "id": "red",
                "name": "Red Dragon (Fire)",
                "description": "Cone 15 ft, Fire damage and Fire resistance.",
                "traits": []
            },
            {
                "id": "silver",
                "name": "Silver Dragon (Cold)",
                "description": "Cone 15 ft, Cold damage and Cold resistance.",
                "traits": []
            },
            {
                "id": "white",
                "name": "White Dragon (Cold)",
                "description": "Cone 15 ft, Cold damage and Cold resistance.",
                "traits": []
            }
        ]
    },
    {
        "id": "tiefling",
        "name": "Tiefling",
        "description": "Bearing the mark of fiendish planes, tieflings wield fiery magic and dark vision.",
        "size": "Medium or Small",
        "speed": 30,
        "darkvision": "Darkvision 60 ft.",
        "traits": [
            {
                "name": "Otherworldly Presence",
                "description": "You know the Thaumaturgy cantrip."
            }
        ],
        "lineages": [
            {
                "id": "abyssal",
                "name": "Abyssal (Chaotic Evil)",
                "description": "Poison resistance, Poison Spray cantrip, Ray of Sickness at level 3, Hold Person at level 5.",
                "traits": [
                    {
                        "name": "Fiendish Legacy: Abyssal",
                        "description": "Resistance to Poison damage."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Poison Spray"
                    },
                    {
                        "level": 3,
                        "spellName": "Ray of Sickness"
                    },
                    {
                        "level": 5,
                        "spellName": "Hold Person"
                    }
                ]
            },
            {
                "id": "chthonic",
                "name": "Chthonic (Neutral Evil)",
                "description": "Necrotic resistance, Chill Touch cantrip, False Life at level 3, Ray of Enfeeblement at level 5.",
                "traits": [
                    {
                        "name": "Fiendish Legacy: Chthonic",
                        "description": "Resistance to Necrotic damage."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Chill Touch"
                    },
                    {
                        "level": 3,
                        "spellName": "False Life"
                    },
                    {
                        "level": 5,
                        "spellName": "Ray of Enfeeblement"
                    }
                ]
            },
            {
                "id": "infernal",
                "name": "Infernal (Lawful Evil)",
                "description": "Fire resistance, Fire Bolt cantrip, Hellish Rebuke at level 3, Darkness at level 5.",
                "traits": [
                    {
                        "name": "Fiendish Legacy: Infernal",
                        "description": "Resistance to Fire damage."
                    }
                ],
                "spellsGranted": [
                    {
                        "level": 1,
                        "spellName": "Fire Bolt"
                    },
                    {
                        "level": 3,
                        "spellName": "Hellish Rebuke"
                    },
                    {
                        "level": 5,
                        "spellName": "Darkness"
                    }
                ]
            }
        ]
    },
    {
        "id": "orc",
        "name": "Orc",
        "description": "Fierce and unstoppable, orcs rely on relentless stamina and adrenaline in the heat of battle.",
        "size": "Medium",
        "speed": 30,
        "darkvision": "Darkvision 120 ft.",
        "traits": [
            {
                "name": "Adrenaline Rush",
                "description": "You can take the Dash action as a Bonus Action a number of times equal to your Proficiency Bonus per Long Rest. When you do, you gain Temporary Hit Points equal to your Proficiency Bonus."
            },
            {
                "name": "Relentless Endurance",
                "description": "When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can't do so again until you finish a Long Rest."
            }
        ]
    },
    {
        "id": "goliath",
        "name": "Goliath",
        "description": "Towering descendants of ancient giants who conquer peaks and withstand colossal punishment.",
        "size": "Medium",
        "speed": 35,
        "traits": [
            {
                "name": "Giant Ancestry",
                "description": "You inherit supernatural boons from your giant kin, usable a number of times equal to your Proficiency Bonus per Long Rest."
            },
            {
                "name": "Large Form (Level 5)",
                "description": "Starting at level 5, as a Bonus Action you can transform into Large size for 10 minutes. During this transformation, you gain Advantage on Strength checks and your speed increases by 10 feet. Usable once per Long Rest."
            },
            {
                "name": "Powerful Build",
                "description": "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift. You also have Advantage on saving throws to end the Grappled condition."
            }
        ],
        "lineages": [
            {
                "id": "cloud",
                "name": "Cloud Giant",
                "description": "Cloud's Jaunt: Teleport up to 30 feet as a Bonus Action PB times per Long Rest.",
                "traits": []
            },
            {
                "id": "fire",
                "name": "Fire Giant",
                "description": "Fire's Burn: Deal an extra 1d10 Fire damage when you hit a target with an attack PB times per Long Rest.",
                "traits": []
            },
            {
                "id": "frost",
                "name": "Frost Giant",
                "description": "Frost's Chill: Deal an extra 1d6 Cold damage and reduce target speed by 10 feet when you hit PB times per Long Rest.",
                "traits": []
            },
            {
                "id": "hill",
                "name": "Hill Giant",
                "description": "Hill's Tumble: Knock a Large or smaller creature Prone on a weapon hit PB times per Long Rest.",
                "traits": []
            },
            {
                "id": "stone",
                "name": "Stone Giant",
                "description": "Stone's Endurance: As a Reaction when taking damage, roll 1d12 + Con modifier and reduce damage taken PB times per Long Rest.",
                "traits": []
            },
            {
                "id": "storm",
                "name": "Storm Giant",
                "description": "Storm's Thunder: As a Reaction when taking damage, deal 1d8 Thunder damage to attacker PB times per Long Rest.",
                "traits": []
            }
        ]
    },
    {
        "id": "aasimar",
        "name": "Aasimar",
        "description": "Mortals carrying the spark of the Upper Planes, blessed with healing radiance and wings of light.",
        "size": "Medium or Small",
        "speed": 30,
        "darkvision": "Darkvision 60 ft.",
        "traits": [
            {
                "name": "Celestial Resistance",
                "description": "You have Resistance to Necrotic damage and Radiant damage."
            },
            {
                "name": "Healing Hands",
                "description": "As an Action, you can touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains Hit Points equal to the total rolled. Once per Long Rest."
            },
            {
                "name": "Light Bearer",
                "description": "You know the Light cantrip, using Charisma, Wisdom, or Intelligence as your spellcasting ability."
            },
            {
                "name": "Celestial Revelation (Level 3)",
                "description": "At level 3, you can transform for 1 minute as a Bonus Action once per Long Rest, choosing Heavenly Wings (Fly Speed), Inner Radiance (radiant aura damage), or Necrotic Shroud (frighten foes and deal necrotic damage)."
            }
        ]
    }
];

export const SEED_BACKGROUNDS = [
    {
        "id": "acolyte",
        "name": "Acolyte",
        "description": "You devoted yourself to service in a temple, learning sacred rites and holy mysteries.",
        "allowedAbilities": [
            "int",
            "wis",
            "cha"
        ],
        "skills": [
            "Insight",
            "Religion"
        ],
        "tool": "Calligrapher's Supplies",
        "originFeatId": "magic-initiate-cleric",
        "equipmentSummary": "A holy symbol, a prayer book, 5 sticks of incense, vestments, and 8 GP."
    },
    {
        "id": "artisan",
        "name": "Artisan",
        "description": "You began as an apprentice to a master crafter, learning a trade and the value of hard work.",
        "allowedAbilities": [
            "str",
            "dex",
            "int"
        ],
        "skills": [
            "Investigation",
            "Persuasion"
        ],
        "tool": "Artisan's Tools (one of choice)",
        "originFeatId": "crafter",
        "equipmentSummary": "Artisan's tools, a letter of introduction from your guild, traveler's clothes, and 25 GP."
    },
    {
        "id": "charlatan",
        "name": "Charlatan",
        "description": "You learned early how people work and how to leverage their desires for your own gain.",
        "allowedAbilities": [
            "dex",
            "con",
            "cha"
        ],
        "skills": [
            "Deception",
            "Sleight of Hand"
        ],
        "tool": "Forgery Kit",
        "originFeatId": "skilled",
        "equipmentSummary": "Fine clothes, a disguise kit, tools of the con (weighted dice/marked cards), and 15 GP."
    },
    {
        "id": "criminal",
        "name": "Criminal",
        "description": "You operated on the other side of the law, surviving through cunning and quick reflexes.",
        "allowedAbilities": [
            "dex",
            "con",
            "int"
        ],
        "skills": [
            "Sleight of Hand",
            "Stealth"
        ],
        "tool": "Thieves' Tools",
        "originFeatId": "alert",
        "equipmentSummary": "A crowbar, dark common clothes with a hood, a set of thieves' tools, and 16 GP."
    },
    {
        "id": "entertainer",
        "name": "Entertainer",
        "description": "You thrive in front of an audience, captivating crowds with song, dance, or drama.",
        "allowedAbilities": [
            "str",
            "dex",
            "cha"
        ],
        "skills": [
            "Acrobatics",
            "Performance"
        ],
        "tool": "Musical Instrument (one of choice)",
        "originFeatId": "musician",
        "equipmentSummary": "A musical instrument, a costume, a token from an admirer, and 8 GP."
    },
    {
        "id": "farmer",
        "name": "Farmer",
        "description": "You grew up tilling soil and tending animals, fostering a deep endurance and practical mindset.",
        "allowedAbilities": [
            "str",
            "con",
            "wis"
        ],
        "skills": [
            "Animal Handling",
            "Nature"
        ],
        "tool": "Carpenter's Tools",
        "originFeatId": "tough",
        "equipmentSummary": "Carpenter's tools, iron pot, shovel, common clothes, and 23 GP."
    },
    {
        "id": "guard",
        "name": "Guard",
        "description": "You served as a city watch officer, sentinel, or bodyguard, staying ever vigilant.",
        "allowedAbilities": [
            "str",
            "int",
            "wis"
        ],
        "skills": [
            "Athletics",
            "Perception"
        ],
        "tool": "Gaming Set (one of choice)",
        "originFeatId": "alert",
        "equipmentSummary": "A spear, a horn to sound alarms, manacles, traveler's clothes, and 12 GP."
    },
    {
        "id": "guide",
        "name": "Guide",
        "description": "You led travelers and expeditions through hazardous wilderness trails and rugged terrain.",
        "allowedAbilities": [
            "dex",
            "con",
            "wis"
        ],
        "skills": [
            "Stealth",
            "Survival"
        ],
        "tool": "Cartographer's Tools",
        "originFeatId": "magic-initiate-druid",
        "equipmentSummary": "A staff, cartographer's tools, a tent, traveler's clothes, and 3 GP."
    },
    {
        "id": "hermit",
        "name": "Hermit",
        "description": "You lived in seclusion in a monastery or the deep wild, contemplating cosmic truths.",
        "allowedAbilities": [
            "con",
            "wis",
            "cha"
        ],
        "skills": [
            "Medicine",
            "Religion"
        ],
        "tool": "Herbalism Kit",
        "originFeatId": "healer",
        "equipmentSummary": "An herbalism kit, a scroll case full of notes, winter blanket, common clothes, and 16 GP."
    },
    {
        "id": "merchant",
        "name": "Merchant",
        "description": "You bought and sold goods across towns and trade routes, developing a keen eye for fortune.",
        "allowedAbilities": [
            "con",
            "int",
            "cha"
        ],
        "skills": [
            "Animal Handling",
            "Persuasion"
        ],
        "tool": "Navigator's Tools",
        "originFeatId": "lucky",
        "equipmentSummary": "Navigator's tools, a mule or pack cart, fine clothes, and 22 GP."
    },
    {
        "id": "noble",
        "name": "Noble",
        "description": "You were born into privilege and high society, educated in statecraft, etiquette, and family lineage.",
        "allowedAbilities": [
            "str",
            "int",
            "cha"
        ],
        "skills": [
            "History",
            "Persuasion"
        ],
        "tool": "Gaming Set (one of choice)",
        "originFeatId": "skilled",
        "equipmentSummary": "Fine clothes, a signet ring, a scroll of pedigree, and 29 GP."
    },
    {
        "id": "sage",
        "name": "Sage",
        "description": "You spent years studying manuscripts and seeking arcane knowledge in grand archives.",
        "allowedAbilities": [
            "con",
            "int",
            "wis"
        ],
        "skills": [
            "Arcana",
            "History"
        ],
        "tool": "Calligrapher's Supplies",
        "originFeatId": "magic-initiate-wizard",
        "equipmentSummary": "A bottle of ink, a quill, small knife, letters of research, common clothes, and 8 GP."
    },
    {
        "id": "sailor",
        "name": "Sailor",
        "description": "You spent years serving aboard seagoing vessels, battling wind, tides, and tavern brawls.",
        "allowedAbilities": [
            "str",
            "dex",
            "wis"
        ],
        "skills": [
            "Athletics",
            "Perception"
        ],
        "tool": "Navigator's Tools",
        "originFeatId": "tavern-brawler",
        "equipmentSummary": "A belaying pin (club), 50 feet of silk rope, a lucky charm, common clothes, and 10 GP."
    },
    {
        "id": "scribe",
        "name": "Scribe",
        "description": "You recorded deeds, contracts, histories, and ledgers for nobles, clergy, or universities.",
        "allowedAbilities": [
            "dex",
            "int",
            "wis"
        ],
        "skills": [
            "Investigation",
            "Perception"
        ],
        "tool": "Calligrapher's Supplies",
        "originFeatId": "skilled",
        "equipmentSummary": "Calligrapher's supplies, ink, fine parchment, a lamp, common clothes, and 23 GP."
    },
    {
        "id": "soldier",
        "name": "Soldier",
        "description": "You trained in the discipline of war, marching under banner and fighting in unit formation.",
        "allowedAbilities": [
            "str",
            "dex",
            "con"
        ],
        "skills": [
            "Athletics",
            "Intimidation"
        ],
        "tool": "Gaming Set (one of choice)",
        "originFeatId": "savage-attacker",
        "equipmentSummary": "An insignia of rank, a trophy from a fallen enemy, gaming set, traveler's clothes, and 14 GP."
    },
    {
        "id": "wayfarer",
        "name": "Wayfarer",
        "description": "You grew up on city streets, wandering gutters and alleys with keen senses and opportunistic luck.",
        "allowedAbilities": [
            "dex",
            "wis",
            "cha"
        ],
        "skills": [
            "Insight",
            "Stealth"
        ],
        "tool": "Thieves' Tools",
        "originFeatId": "lucky",
        "equipmentSummary": "Thieves' tools, 2 daggers, a small pouch of curios, traveler's clothes, and 16 GP."
    },
    {
        "id": "custom",
        "name": "Custom Background",
        "description": "Design your own custom background tailored to your character's unique backstory.",
        "allowedAbilities": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "skills": [
            "Any 2 skills"
        ],
        "tool": "Any 1 tool or gaming set",
        "originFeatId": "skilled",
        "equipmentSummary": "50 GP to purchase starting equipment of your choice."
    }
];

export const SEED_ORIGIN_FEATS = [
    {
        "id": "alert",
        "name": "Alert",
        "description": "Always on the lookout for danger, you gain a bonus to initiative and can swap initiative rolls with willing allies.",
        "benefits": [
            "Initiative Proficiency: You add your Proficiency Bonus to your Initiative rolls.",
            "Initiative Swap: Immediately after you roll initiative, you can swap your initiative with the initiative of one willing ally in the same combat who isn't Incapacitated."
        ]
    },
    {
        "id": "crafter",
        "name": "Crafter",
        "description": "You are adept at crafting goods and negotiating trade discounts.",
        "benefits": [
            "Tool Proficiency: You gain proficiency with three different Artisan's Tools of your choice.",
            "Discount: Whenever you buy a nonmagical item, you receive a 20 percent discount on it.",
            "Fast Crafting: When you craft an item using Artisan's Tools in which you have proficiency, the crafting time is reduced by 20 percent."
        ]
    },
    {
        "id": "healer",
        "name": "Healer",
        "description": "You have the training and intuition to administer emergency medical aid.",
        "benefits": [
            "Battle Medic: If you have a Healer's Kit, you can expend one use of it as an Action to tend to a creature within 5 feet. That creature can expend one of its Hit Point Dice, and you roll that die plus your Proficiency Bonus; the creature regains that number of Hit Points.",
            "Healing Rerolls: Whenever you roll a die to determine the number of Hit Points you restore with a spell or with Battle Medic, you can reroll the die if it rolls a 1, and you must use the new roll."
        ]
    },
    {
        "id": "lucky",
        "name": "Lucky",
        "description": "You have an inexplicable streak of luck that seems to kick in at just the right moment.",
        "benefits": [
            "Luck Points: You have a number of Luck Points equal to your Proficiency Bonus. You regain all spent Luck Points when you finish a Long Rest.",
            "Advantage: When you make a D20 Test, you can spend 1 Luck Point to give yourself Advantage on the roll.",
            "Disadvantage: When a creature rolls an attack roll against you, you can spend 1 Luck Point to give that attack roll Disadvantage."
        ]
    },
    {
        "id": "magic-initiate-cleric",
        "name": "Magic Initiate (Cleric)",
        "description": "You learn the basics of clerical divine magic.",
        "benefits": [
            "Two Cantrips: You learn two cantrips of your choice from the Cleric spell list (e.g. Guidance, Sacred Flame, Thaumaturgy).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Cleric spell list (e.g. Bless, Cure Wounds, Healing Word). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Wisdom is your spellcasting ability for these spells."
        ],
        "spellcastingAbilityOptions": [
            "wis"
        ]
    },
    {
        "id": "magic-initiate-druid",
        "name": "Magic Initiate (Druid)",
        "description": "You learn the basics of primal druidic magic.",
        "benefits": [
            "Two Cantrips: You learn two cantrips of your choice from the Druid spell list (e.g. Druidcraft, Produce Flame, Shillelagh).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Druid spell list (e.g. Goodberry, Healing Word, Entangle). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Wisdom is your spellcasting ability for these spells."
        ],
        "spellcastingAbilityOptions": [
            "wis"
        ]
    },
    {
        "id": "magic-initiate-wizard",
        "name": "Magic Initiate (Wizard)",
        "description": "You learn the basics of arcane wizardly magic.",
        "benefits": [
            "Two Cantrips: You learn two cantrips of your choice from the Wizard spell list (e.g. Fire Bolt, Mage Hand, Prestidigitation).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Wizard spell list (e.g. Shield, Find Familiar, Magic Missile). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Intelligence is your spellcasting ability for these spells."
        ],
        "spellcastingAbilityOptions": [
            "int"
        ]
    },
    {
        "id": "musician",
        "name": "Musician",
        "description": "You are an inspiring performer whose music encourages your adventuring companions.",
        "benefits": [
            "Instrument Proficiency: You gain proficiency with three Musical Instruments of your choice.",
            "Inspiring Song: As you finish a Short or Long Rest, you can play a song on a musical instrument with which you have proficiency and give Heroic Inspiration to a number of willing allies within 30 feet of you equal to your Proficiency Bonus."
        ]
    },
    {
        "id": "savage-attacker",
        "name": "Savage Attacker",
        "description": "You know how to strike where it hurts most.",
        "benefits": [
            "Reroll Weapon Damage: Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either result."
        ]
    },
    {
        "id": "skilled",
        "name": "Skilled",
        "description": "You have exceptionally broad training across various disciplines.",
        "benefits": [
            "Broad Training: You gain proficiency in any combination of three skills or tools of your choice."
        ]
    },
    {
        "id": "tavern-brawler",
        "name": "Tavern Brawler",
        "description": "Accustomed to rough-and-tumble fighting using whatever is at hand.",
        "benefits": [
            "Enhanced Unarmed Strike: When you hit with your Unarmed Strike, you deal 1d4 + your Strength modifier bludgeoning damage instead of 1.",
            "Damage Rerolls: Whenever you roll a 1 on a damage die for an Unarmed Strike, you can reroll the die and must use the new roll.",
            "Push: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage and also push the target 5 feet away from you.",
            "Furniture as Weapons: You have proficiency with Improvised Weapons."
        ]
    },
    {
        "id": "tough",
        "name": "Tough",
        "description": "Your Hit Point maximum increases, making you resilient against lethal blows.",
        "benefits": [
            "Increased Hit Points: Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a level thereafter, your Hit Point maximum increases by an additional 2 Hit Points."
        ]
    }
];

export const SEED_GENERAL_FEATS = [
    {
        "id": "alert-general",
        "name": "Alert",
        "description": "Always on the lookout for danger, gaining swift reflexes and awareness.",
        "allowedStats": [
            "dex",
            "int",
            "wis"
        ],
        "benefits": [
            "Add Proficiency Bonus to Initiative rolls.",
            "Swap Initiative with a willing ally in combat."
        ]
    },
    {
        "id": "athlete",
        "name": "Athlete",
        "description": "You have undergone extensive physical training to gain exceptional agility and endurance.",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Climbing doesn't cost extra movement.",
            "Standing from prone costs only 5 feet of movement.",
            "Make running jumps after moving only 5 feet."
        ]
    },
    {
        "id": "charger",
        "name": "Charger",
        "description": "You can charge forward to slam into foes or push through defenses.",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Dash as a Bonus Action.",
            "Moving 10+ feet in a straight line before an attack deals +1d8 damage or pushes target 10 feet."
        ]
    },
    {
        "id": "crossbow-expert",
        "name": "Crossbow Expert",
        "description": "Extensive training with crossbows grants supernatural firing rate and point-blank accuracy.",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Ignore the Loading property of crossbows.",
            "Being within 5 feet of a hostile creature doesn't impose Disadvantage on ranged attack rolls.",
            "Bonus Action attack with a Hand Crossbow after attacking with a one-handed weapon."
        ]
    },
    {
        "id": "crusher",
        "name": "Crusher",
        "description": "You are practiced in the art of crushing your enemies with bludgeoning weapons.",
        "allowedStats": [
            "str",
            "con"
        ],
        "benefits": [
            "Once per turn on bludgeoning hit, move target 5 feet to an unoccupied space.",
            "Critical hits grant Advantage on all attack rolls against the target until your next turn."
        ]
    },
    {
        "id": "defensive-duelist",
        "name": "Defensive Duelist",
        "description": "When wielding a Finesse weapon, you can parry incoming strikes.",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Reaction when hit by a melee attack: add your Proficiency Bonus to your AC for that attack."
        ]
    },
    {
        "id": "dual-wielder",
        "name": "Dual Wielder",
        "description": "You master fighting with two weapons, even when neither weapon has the Light property.",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "+1 bonus to AC while wielding separate melee weapons in each hand.",
            "Use two-weapon fighting even when your one-handed melee weapons aren't Light.",
            "Draw or stow two weapons at once."
        ]
    },
    {
        "id": "great-weapon-master",
        "name": "Great Weapon Master",
        "description": "You learn to put the tremendous weight of a heavy weapon to maximum lethal effect.",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "Bonus Action attack after scoring a critical hit or reducing a creature to 0 HP.",
            "Add your Proficiency Bonus to damage rolls made with Heavy weapons on your turn."
        ]
    },
    {
        "id": "heavy-armor-master",
        "name": "Heavy Armor Master",
        "description": "You can use your heavy armor to deflect and absorb crushing blows.",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "While wearing heavy armor, reduce bludgeoning, piercing, and slashing damage taken by your Proficiency Bonus."
        ]
    },
    {
        "id": "mage-slayer",
        "name": "Mage Slayer",
        "description": "Practiced in techniques to hunt and disrupt spellcasters in close combat.",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Reaction attack when a creature within 5 feet casts a spell.",
            "Damaging a concentrating caster imposes Disadvantage on the concentration check.",
            "Once per rest, automatically succeed on a failed Intelligence, Wisdom, or Charisma saving throw."
        ]
    },
    {
        "id": "polearm-master",
        "name": "Polearm Master",
        "description": "You can keep your distance with pole weapons and strike with the haft.",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Bonus Action strike with the haft dealing 1d4 bludgeoning damage (Glaive, Halberd, Pike, Quarterstaff, Spear).",
            "Opportunity attack when a creature enters your reach."
        ]
    },
    {
        "id": "resilient-str",
        "name": "Resilient (Strength)",
        "description": "Gain saving throw proficiency in Strength and +1 Strength.",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "You gain proficiency in Strength saving throws."
        ]
    },
    {
        "id": "resilient-dex",
        "name": "Resilient (Dexterity)",
        "description": "Gain saving throw proficiency in Dexterity and +1 Dexterity.",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "You gain proficiency in Dexterity saving throws."
        ]
    },
    {
        "id": "resilient-con",
        "name": "Resilient (Constitution)",
        "description": "Gain saving throw proficiency in Constitution and +1 Constitution.",
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "You gain proficiency in Constitution saving throws."
        ]
    },
    {
        "id": "resilient-wis",
        "name": "Resilient (Wisdom)",
        "description": "Gain saving throw proficiency in Wisdom and +1 Wisdom.",
        "allowedStats": [
            "wis"
        ],
        "benefits": [
            "You gain proficiency in Wisdom saving throws."
        ]
    },
    {
        "id": "sentinel",
        "name": "Sentinel",
        "description": "You have mastered techniques to lock down enemies and protect your allies.",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Opportunity attack hits reduce target's speed to 0 for the rest of the turn.",
            "Creatures within 5 feet provoke opportunity attacks even if they take Disengage.",
            "Reaction attack against an enemy within 5 feet that attacks someone else."
        ]
    },
    {
        "id": "sharpshooter",
        "name": "Sharpshooter",
        "description": "You have mastered ranged weapons and can make shots that others find impossible.",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Attacking at long range doesn't impose Disadvantage on ranged weapon attack rolls.",
            "Your ranged weapon attacks ignore Half Cover and Three-Quarters Cover.",
            "Being within 5 feet of an enemy doesn't impose Disadvantage on ranged attacks."
        ]
    },
    {
        "id": "shield-master",
        "name": "Shield Master",
        "description": "You use your shield not just for protection, but as an aggressive offensive tool.",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "Bonus Action shield bash to push a creature 5 feet or knock it Prone.",
            "Add shield's AC bonus to Dexterity saving throws against effects targeting only you.",
            "Reaction to take no damage on a successful Dexterity save that normally deals half damage."
        ]
    },
    {
        "id": "speedster",
        "name": "Speedster (Mobile)",
        "description": "You are exceptionally speedy and agile in combat.",
        "allowedStats": [
            "dex",
            "con"
        ],
        "benefits": [
            "Your speed increases by 10 feet.",
            "When you take the Dash action, difficult terrain doesn't cost extra movement.",
            "Attacking a creature prevents it from making opportunity attacks against you for the rest of your turn."
        ]
    },
    {
        "id": "tough-general",
        "name": "Tough",
        "description": "Your hit point maximum increases drastically.",
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "Your Hit Point maximum increases by twice your character level, and +2 each level thereafter."
        ]
    },
    {
        "id": "war-caster",
        "name": "War Caster",
        "description": "You have practiced casting spells in the midst of combat.",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Advantage on Constitution saving throws made to maintain concentration on a spell.",
            "Perform somatic components even when holding weapons or a shield in both hands.",
            "Cast a 1-Action spell targeting only the provoking creature as an opportunity attack."
        ]
    },
    {
        "id": "epic-boon-combat-prowess",
        "name": "Epic Boon of Combat Prowess",
        "description": "Your combat prowess is legendary. Once per turn, when you miss with an attack, you can hit instead.",
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "isEpicBoon": true,
        "benefits": [
            "Once on each of your turns when you miss with an attack roll, you can choose to hit instead."
        ]
    },
    {
        "id": "epic-boon-dimensional-travel",
        "name": "Epic Boon of Dimensional Travel",
        "description": "You can slip through the planes at a moment's notice.",
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "isEpicBoon": true,
        "benefits": [
            "Immediately after you take the Attack action or cast a spell, you can teleport up to 30 feet to an unoccupied space you can see."
        ]
    },
    {
        "id": "epic-boon-fortitude",
        "name": "Epic Boon of Fortitude",
        "description": "Your health and vitality rival demigods.",
        "allowedStats": [
            "con"
        ],
        "isEpicBoon": true,
        "benefits": [
            "Your Hit Point maximum increases by 40.",
            "Whenever you receive healing, you regain additional hit points equal to your Constitution modifier."
        ]
    },
    {
        "id": "epic-boon-recovery",
        "name": "Epic Boon of Recovery",
        "description": "You are extraordinarily difficult to kill.",
        "allowedStats": [
            "con"
        ],
        "isEpicBoon": true,
        "benefits": [
            "When reduced to 0 Hit Points, you can drop to half your Hit Point maximum instead once per Long Rest."
        ]
    },
    {
        "id": "epic-boon-spell-recall",
        "name": "Epic Boon of Spell Recall",
        "description": "You retain magical energy after casting spells.",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "isEpicBoon": true,
        "benefits": [
            "Whenever you cast a spell of level 1 through 4 using a spell slot, roll a d4. On a 4, the slot isn't expended."
        ]
    }
];
