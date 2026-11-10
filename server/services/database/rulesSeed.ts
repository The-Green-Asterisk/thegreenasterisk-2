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
                "description": "You can imbue yourself with a primal power called Rage, a force that grants you extraordinary might and resilience. You can enter it as a Bonus Action if you aren't wearing Heavy armor. You can enter your Rage the number of times shown for your Barbarian level in the Rages column of the Barbarian Features table. You regain one expended use when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . While active, your Rage follows the rules below. Damage Resistance. You have Resistance to Bludgeoning, Piercing, and Slashing damage. Rage Damage. When you make an attack using Strength-with either a weapon or an Unarmed Strike -and deal damage to the target, you gain a bonus to the damage that increases as you gain levels as a Barbarian, as shown in the Rage Damage column of the Barbarian Features table. Strength Advantage. You have Advantage on Strength checks and Strength saving throws. No Concentration or Spells. You can't maintain Concentration , and you can't cast spells. Duration. The Rage lasts until the end of your next turn, and it ends early if you don Heavy armor or have the Incapacitated condition. If your Rage is still active on your next turn, you can extend the Rage for another round by doing one of the following: Make an attack roll against an enemy. Force an enemy to make a saving throw. Take a Bonus Action to extend your Rage. Each time the Rage is extended, it lasts until the end of your next turn. You can maintain a Rage for up to 10 minutes."
            },
            {
                "level": 1,
                "name": "Unarmored Defense",
                "description": "While you aren't wearing any armor, your base Armor Class equals 10 plus your Dexterity and Constitution modifiers. You can use a Shield and still gain this benefit."
            },
            {
                "level": 1,
                "name": "Weapon Mastery",
                "description": "Your training with weapons allows you to use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice, such as Greataxes and Handaxes. Whenever you finish a Long Rest , you can practice weapon drills and change one of those weapon choices. When you reach certain Barbarian levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Barbarian Features table ."
            },
            {
                "level": 2,
                "name": "Danger Sense",
                "description": "You gain an uncanny sense of when things aren't as they should be, giving you an edge when you dodge perils. You have Advantage on Dexterity saving throws unless you have the Incapacitated condition."
            },
            {
                "level": 2,
                "name": "Reckless Attack",
                "description": "You can throw aside all concern for defense to attack with increased ferocity. When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you Advantage on attack rolls using Strength until the start of your next turn, but attack rolls against you have Advantage during that time."
            },
            {
                "level": 3,
                "name": "Barbarian Subclass",
                "description": "You gain a Barbarian subclass of your choice. The Path of the Berserker subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Barbarian levels. For the rest of your career, you gain each of your subclass's features that are of your Barbarian level or lower."
            },
            {
                "level": 3,
                "name": "Primal Knowledge",
                "description": "You gain proficiency in another skill of your choice from the skill list available to Barbarians at level 1 . In addition, while your Rage is active, you can channel primal power when you attempt certain tasks; whenever you make an ability check using one of the following skills, you can make it as a Strength check even if it normally uses a different ability: Acrobatics , Intimidation , Perception , Stealth , or Survival . When you use this ability, your Strength represents primal power coursing through you, honing your agility, bearing, and senses."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Barbarian levels 8, 12, and 16."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action on your turn."
            },
            {
                "level": 5,
                "name": "Fast Movement",
                "description": "Your speed increases by 10 feet while you aren't wearing Heavy armor."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Barbarian primal path."
            },
            {
                "level": 7,
                "name": "Feral Instinct",
                "description": "Your instincts are so honed that you have Advantage on Initiative rolls."
            },
            {
                "level": 7,
                "name": "Instinctive Pounce",
                "description": "As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 9,
                "name": "Brutal Strike",
                "description": "If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. The chosen attack roll mustn't have Disadvantage . If the chosen attack roll hits, the target takes an extra 1d10 damage of the same type dealt by the weapon or Unarmed Strike , and you can cause one Brutal Strike effect of your choice. You have the following effect options. Forceful Blow. The target is pushed 15 feet straight away from you. You can then move up to half your Speed straight toward the target without provoking Opportunity Attacks . Hamstring Blow. The target's Speed is reduced by 15 feet until the start of your next turn. A target can be affected by only one Hamstring Blow at a time-the most recent one."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Barbarian primal path."
            },
            {
                "level": 11,
                "name": "Relentless Rage",
                "description": "Your Rage can keep you fighting despite grievous wounds. If you drop to 0 Hit Points while your Rage is active and don't die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level. Each time you use this feature after the first, the DC increases by 5. When you finish a Short or Long Rest , the DC resets to 10."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 13,
                "name": "Improved Brutal Strike",
                "description": "You have honed new ways to attack furiously. The following effects are now among your Brutal Strike options. Staggering Blow. The target has Disadvantage on the next saving throw it makes, and it can't make Opportunity Attacks until the start of your next turn. Sundering Blow. Before the start of your next turn, the next attack roll made by another creature against the target gains a +5 bonus to the roll. An attack roll can gain only one Sundering Blow bonus."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Barbarian primal path."
            },
            {
                "level": 15,
                "name": "Persistent Rage",
                "description": "When you roll Initiative , you can regain all expended uses of Rage. After you regain uses of Rage in this way, you can't do so again until you finish a Long Rest . In addition, your Rage is so fierce that it now lasts for 10 minutes without you needing to do anything to extend it from round to round. Your Rage ends early if you have the Unconscious condition (not just the Incapacitated condition) or don Heavy armor."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 17,
                "name": "Improved Brutal Strike",
                "description": "The extra damage of your Brutal Strike increases to 2d10. In addition, you can use two different Brutal Strike effects whenever you use your Brutal Strike feature."
            },
            {
                "level": 18,
                "name": "Indomitable Might",
                "description": "If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total."
            },
            {
                "level": 19,
                "name": "Epic Boon",
                "description": "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended."
            },
            {
                "level": 20,
                "name": "Primal Champion",
                "description": "You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25."
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
            ],
            "expandedSpellLists": [
                {
                    "level": 10,
                    "feature": "Magical Secrets",
                    "classes": ["Cleric", "Druid", "Wizard"],
                    "allowCantrips": true
                }
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Bardic Inspiration",
                "description": "You can supernaturally inspire others through words, music, or dance. This inspiration is represented by your Bardic Inspiration die, which is a d6. Using Bardic Inspiration. As a Bonus Action, you can inspire another creature within 60 feet of yourself who can see or hear you. That creature gains one of your Bardic Inspiration dice. A creature can have only one Bardic Inspiration die at a time. Once within the next hour when the creature fails a D20 Test , the creature can roll the Bardic Inspiration die and add the number rolled to the d20, potentially turning the failure into a success. A Bardic Inspiration die is expended when it's rolled. Number of Uses. You can confer a Bardic Inspiration die a number of times equal to your Charisma modifier (minimum of once), and you regain all expended uses when you finish a Long Rest . At Higher Levels. Your Bardic Inspiration die changes when you reach certain Bard levels, as shown in the Bardic Die column of the Bard Features table. The die becomes a d8 at level 5, a d10 at level 10, and a d12 at level 15."
            },
            {
                "level": 1,
                "name": "Spellcasting",
                "description": "You have learned to cast spells through your bardic arts. See \" Spells \" for the rules on spellcasting. The information below details how you use those rules with Bard spells, which appear in the Bard spell list later in the class's description. Cantrips. You know two cantrips of your choice from the Bard spell list. Dancing Lights and Vicious Mockery are recommended. Whenever you gain a Bard level, you can replace one of your cantrips with another cantrip of your choice from the Bard spell list. When you reach Bard levels 4 and 10, you learn another cantrip of your choice from the Bard spell list, as shown in the Cantrips column of the Bard Features table . Spell Slots. The Bard Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest . Prepared Spells of Level 1+. You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Bard spell list. Charm Person , Color Spray , Dissonant Whispers , and Healing Word are recommended. The number of spells on your list increases as you gain Bard levels, as shown in the Prepared Spells column of the Bard Features table . Whenever that number increases, choose additional spells from the Bard spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Bard, your list of prepared spells can include six spells of levels 1 and 2 in any combination. If another Bard feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Bard spells for you. Changing Your Prepared Spells. Whenever you gain a Bard level, you can replace one spell on your list with another Bard spell for which you have spell slots. Spellcasting Ability. Charisma is your spellcasting ability for your Bard spells. Spellcasting Focus. You can use a Musical Instrument as a Spellcasting Focus for your Bard spells."
            },
            {
                "level": 2,
                "name": "Expertise",
                "description": "You gain Expertise (see the rules glossary ) in two of your skill proficiencies of your choice. Performance and Persuasion are recommended if you have proficiency in them. At Bard level 9, you gain Expertise in two more of your skill proficiencies of your choice."
            },
            {
                "level": 2,
                "name": "Jack of All Trades",
                "description": "You can add half your Proficiency Bonus (round down) to any ability check you make that uses a skill proficiency you lack and that doesn't otherwise use your Proficiency Bonus. For example, if you make a Strength ( Athletics ) check and lack Athletics proficiency, you can add half your Proficiency Bonus to the check. A Bard's Repertoire Does your Bard beat a drum while chanting the deeds of ancient heroes? Strum a lute while crooning romantic tunes? Perform arias of stirring power? Recite dramatic monologues from classic tragedies? Use the rhythm of a folk dance to coordinate the movement of allies in battle? Compose naughty limericks? When you play a Bard, consider the style of artistic performance you favor, the moods you might invoke, and the themes that inspire your own creations. Are your poems inspired by moments of natural beauty, or are they brooding reflections on loss? Do you prefer lofty hymns or rowdy tavern songs? Are you drawn to laments for the fallen or celebrations of joy? Do you dance merry jigs or perform elaborate interpretive choreography? Do you focus on one style of performance or strive to master them all?"
            },
            {
                "level": 3,
                "name": "Bard Subclass",
                "description": "You gain a Bard subclass of your choice. The College of Lore subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Bard levels. For the rest of your career, you gain each of your subclass's features that are of your Bard level or lower."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Bard levels 8, 12, and 16."
            },
            {
                "level": 5,
                "name": "Font of Inspiration",
                "description": "You now regain all your expended uses of Bardic Inspiration when you finish a Short or Long Rest . In addition, you can expend a spell slot (no action required) to regain one expended use of Bardic Inspiration."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Bard college."
            },
            {
                "level": 7,
                "name": "Countercharm",
                "description": "You can use musical notes or words of power to disrupt mind-influencing effects. If you or a creature within 30 feet of you fails a saving throw against an effect that applies the Charmed or Frightened condition, you can take a Reaction to cause the save to be rerolled, and the new roll has Advantage ."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 9,
                "name": "Expertise",
                "description": "You gain Expertise in two more of your skill proficiencies of your choice."
            },
            {
                "level": 10,
                "name": "Magical Secrets",
                "description": "You've learned secrets from various magical traditions. Whenever you reach a Bard level (including this level) and the Prepared Spells number in the Bard Features table increases, you can choose any of your new prepared spells from the Bard , Cleric , Druid , and Wizard spell lists, and the chosen spells count as Bard spells for you (see a class's section for its spell list). In addition, whenever you replace a spell prepared for this class, you can replace it with a spell from those lists."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level Bard spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level Bard spell slots."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Bard college."
            },
            {
                "level": 15,
                "name": "8th-Level Spells",
                "description": "You gain access to 8th-level Bard spell slots."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level Bard spell slots."
            },
            {
                "level": 18,
                "name": "Superior Inspiration",
                "description": "When you roll Initiative, you regain expended uses of Bardic Inspiration until you have two if you have fewer than that."
            },
            {
                "level": 19,
                "name": "Epic Boon",
                "description": "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Spell Recall is recommended."
            },
            {
                "level": 20,
                "name": "Words of Creation",
                "description": "You have mastered two of the Words of Creation: the words of life and death. You therefore always have the Power Word Heal and Power Word Kill spells prepared. When you cast either spell, you can target a second creature with it if that creature is within 10 feet of the first target."
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
                "name": "Spellcasting",
                "description": "You have learned to cast spells through prayer and meditation. See \" Spells \" for the rules on spellcasting. The information below details how you use those rules with Cleric spells, which appear on the Cleric spell list later in the class's description. Cantrips. You know three cantrips of your choice from the Cleric spell list. Guidance , Sacred Flame , and Thaumaturgy are recommended. Whenever you gain a Cleric level, you can replace one of your cantrips with another cantrip of your choice from the Cleric spell list. When you reach Cleric levels 4 and 10, you learn another cantrip of your choice from the Cleric spell list, as shown in the Cantrips column of the Cleric Features table . Spell Slots. The Cleric Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest . Prepared Spells of Level 1+. You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Cleric spell list. Bless , Cure Wounds , Guiding Bolt , and Shield of Faith are recommended. The number of spells on your list increases as you gain Cleric levels, as shown in the Prepared Spells column of the Cleric Features table . Whenever that number increases, choose additional spells from the Cleric spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Cleric, your list of prepared spells can include six spells of levels 1 and 2 in any combination. If another Cleric feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Cleric spells for you. Changing Your Prepared Spells. Whenever you finish a Long Rest , you can change your list of prepared spells, replacing any of the spells there with other Cleric spells for which you have spell slots. Spellcasting Ability. Wisdom is your spellcasting ability for your Cleric spells. Spellcasting Focus. You can use a Holy Symbol as a Spellcasting Focus for your Cleric spells."
            },
            {
                "level": 1,
                "name": "Divine Order",
                "description": "You have dedicated yourself to one of the following sacred roles of your choice. Protector. Trained for battle, you gain proficiency with Martial weapons and training with Heavy armor. Thaumaturge. You know one extra cantrip from the Cleric spell list . In addition, your mystical connection to the divine gives you a bonus to your Intelligence ( Arcana or Religion ) checks. The bonus equals your Wisdom modifier (minimum of +1)."
            },
            {
                "level": 2,
                "name": "Channel Divinity",
                "description": "You can channel divine energy directly from the Outer Planes to fuel magical effects. You start with two such effects: Divine Spark and Turn Undead, each of which is described below. Each time you use this class's Channel Divinity, choose which Channel Divinity effect from this class to create. You gain additional effect options at higher Cleric levels. You can use this class's Channel Divinity twice. You regain one of its expended uses when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . You gain additional uses when you reach certain Cleric levels, as shown in the Channel Divinity column of the Cleric Features table . If a Channel Divinity effect requires a saving throw, the DC equals the spell save DC from this class's Spellcasting feature. Divine Spark. As a Magic action, you point your Holy Symbol at another creature you can see within 30 feet of yourself and focus divine energy at it. Roll 1d8 and add your Wisdom modifier. You either restore Hit Points to the creature equal to that total or force the creature to make a Constitution saving throw. On a failed save, the creature takes Necrotic or Radiant damage (your choice) equal to that total. On a successful save, the creature takes half as much damage (round down). You roll an additional d8 when you reach Cleric levels 7 (2d8), 13 (3d8), and 18 (4d8). Turn Undead. As a Magic action, you present your Holy Symbol and censure Undead creatures. Each Undead of your choice within 30 feet of you must make a Wisdom saving throw. If the creature fails its save, it has the Frightened and Incapacitated conditions for 1 minute. For that duration, it tries to move as far from you as it can on its turns. This effect ends early on the creature if it takes any damage, if you have the Incapacitated condition, or if you die."
            },
            {
                "level": 3,
                "name": "Cleric Subclass",
                "description": "You gain a Cleric subclass of your choice. The Life Domain subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Cleric levels. For the rest of your career, you gain each of your subclass's features that are of your Cleric level or lower."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Cleric levels 8, 12, and 16."
            },
            {
                "level": 5,
                "name": "Sear Undead",
                "description": "Whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier (minimum of 1d8) and add the rolls together. Each Undead that fails its saving throw against that use of Turn Undead takes Radiant damage equal to the roll's total. This damage doesn't end the turn effect."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Divine Domain."
            },
            {
                "level": 7,
                "name": "Blessed Strikes",
                "description": "Divine power infuses you in battle. You gain one of the following options of your choice (if you get either option from a Cleric subclass in an older book, use only the option you choose for this feature). Divine Strike. Once on each of your turns when you hit a creature with an attack roll using a weapon, you can cause the target to take an extra 1d8 Necrotic or Radiant damage (your choice). Potent Spellcasting. Add your Wisdom modifier to the damage you deal with any Cleric cantrip."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level Cleric spell slots."
            },
            {
                "level": 10,
                "name": "Divine Intervention",
                "description": "You can call on your deity or pantheon to intervene on your behalf. As a Magic action, choose any Cleric spell of level 5 or lower that doesn't require a Reaction to cast. As part of the same action, you cast that spell without expending a spell slot or needing Material components. You can't use this feature again until you finish a Long Rest ."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level Cleric spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level Cleric spell slots."
            },
            {
                "level": 14,
                "name": "Improved Blessed Strikes",
                "description": "The option you chose for Blessed Strikes grows more powerful. Divine Strike. The extra damage of your Divine Strike increases to 2d8. Potent Spellcasting. When you cast a Cleric cantrip and deal damage to a creature with it, you can give vitality to yourself or another creature within 60 feet of yourself, granting a number of Temporary Hit Points equal to twice your Wisdom modifier."
            },
            {
                "level": 15,
                "name": "8th-Level Spells",
                "description": "You gain access to 8th-level Cleric spell slots."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 17,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Divine Domain."
            },
            {
                "level": 18,
                "name": "Channel Divinity (4/Rest)",
                "description": "You can use your Channel Divinity four times between rests."
            },
            {
                "level": 19,
                "name": "Epic Boon",
                "description": "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Fate is recommended."
            },
            {
                "level": 20,
                "name": "Greater Divine Intervention",
                "description": "You can call on even more powerful divine intervention. When you use your Divine Intervention feature, you can choose Wish when you select a spell. If you do so, you can't use Divine Intervention again until you finish 2d4 Long Rests ."
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
                "name": "Spellcasting",
                "description": "You have learned to cast spells through studying the mystical forces of nature. See \" Spells \" for the rules on spellcasting. The information below details how you use those rules with Druid spells, which appear on the Druid spell list later in the class's description. Cantrips. You know two cantrips of your choice from the Druid spell list. Druidcraft and Produce Flame are recommended. Whenever you gain a Druid level, you can replace one of your cantrips with another cantrip of your choice from the Druid spell list. When you reach Druid levels 4 and 10, you learn another cantrip of your choice from the Druid spell list, as shown in the Cantrips column of the Druid Features table. Spell Slots. The Druid Features table shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots when you finish a Long Rest . Prepared Spells of Level 1+. You prepare the list of level 1+ spells that are available for you to cast with this feature. To start, choose four level 1 spells from the Druid spell list. Animal Friendship , Cure Wounds , Faerie Fire , and Thunderwave are recommended. The number of spells on your list increases as you gain Druid levels, as shown in the Prepared Spells column of the Druid Features table. Whenever that number increases, choose additional spells from the Druid spell list until the number of spells on your list matches the number on the table. The chosen spells must be of a level for which you have spell slots. For example, if you're a level 3 Druid, your list of prepared spells can include six spells of levels 1 and 2 in any combination. If another Druid feature gives you spells that you always have prepared, those spells don't count against the number of spells you can prepare with this feature, but those spells otherwise count as Druid spells for you. Changing Your Prepared Spells. Whenever you finish a Long Rest , you can change your list of prepared spells, replacing any of the spells with other Druid spells for which you have spell slots. Spellcasting Ability. Wisdom is your spellcasting ability for your Druid spells. Spellcasting Focus. You can use a Druidic Focus as a Spellcasting Focus for your Druid spells."
            },
            {
                "level": 1,
                "name": "Druidic",
                "description": "You know Druidic, the secret language of Druids. While learning this ancient tongue, you also unlocked the magic of communicating with animals; you always have the Speak with Animals spell prepared. You can use Druidic to leave hidden messages. You and others who know Druidic automatically spot such a message. Others spot the message's presence with a successful DC 15 Intelligence ( Investigation ) check but can't decipher it without magic."
            },
            {
                "level": 1,
                "name": "Primal Order",
                "description": "You have dedicated yourself to one of the following sacred roles of your choice. Magician. You know one extra cantrip from the Druid spell list . In addition, your mystical connection to nature gives you a bonus to your Intelligence ( Arcana or Nature ) checks. The bonus equals your Wisdom modifier (minimum bonus of +1). Warden. Trained for battle, you gain proficiency with Martial weapons and training with Medium armor."
            },
            {
                "level": 2,
                "name": "Wild Shape",
                "description": "The power of nature allows you to assume the form of an animal. As a Bonus Action, you shape-shift into a Beast form that you have learned for this feature (see \"Known Forms\" below). You stay in that form for a number of hours equal to half your Druid level or until you use Wild Shape again, have the Incapacitated condition, or die. You can also leave the form early as a Bonus Action. Number of Uses. You can use Wild Shape twice. You regain one expended use when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . You gain additional uses when you reach certain Druid levels, as shown in the Wild Shape column of the Druid Features table . Known Forms. You know four Beast forms for this feature, chosen from among Beast stat blocks that have a maximum Challenge Rating of 1/4 and that lack a Fly Speed (see appendix B for stat block options). The Rat , Riding Horse , Spider , and Wolf are recommended. Whenever you finish a Long Rest , you can replace one of your known forms with another eligible form. When you reach certain Druid levels, your number of known forms and the maximum Challenge Rating for those forms increases, as shown in the Beast Shapes table. In addition, starting at level 8, you can adopt a form that has a Fly Speed. When choosing known forms, you may look in the Monster Manual or elsewhere for eligible Beasts if the Dungeon Master permits you to do so. Beast Shapes Druid Level Known Forms Max CR Fly Speed 2 4 1/4 No 4 6 1/2 No 8 8 1 Yes Rules While Shape-Shifted. While in a form, you retain your personality, memories, and ability to speak, and the following rules apply: Temporary Hit Points. When you assume a Wild Shape form, you gain a number of Temporary Hit Points equal to your Druid level. Game Statistics. Your game statistics are replaced by the Beast's stat block, but you retain your creature type; Hit Points; Hit Point Dice; Intelligence, Wisdom, and Charisma scores; class features; languages; and feats. You also retain your skill and saving throw proficiencies and use your Proficiency Bonus for them, in addition to gaining the proficiencies of the creature. If a skill or saving throw modifier in the Beast's stat block is higher than yours, use the one in the stat block. No Spellcasting. You can't cast spells, but shape-shifting doesn't break your Concentration or otherwise interfere with a spell you've already cast. Objects. Your ability to handle objects is determined by the form's limbs rather than your own. In addition, you choose whether your equipment falls in your space, merges into your new form, or is worn by it. Worn equipment functions as normal, but the DM decides whether it's practical for the new form to wear a piece of equipment based on the creature's size and shape. Your equipment doesn't change size or shape to match the new form, and any equipment that the new form can't wear must either fall to the ground or merge with the form. Equipment that merges with the form has no effect while you're in that form."
            },
            {
                "level": 2,
                "name": "Wild Companion",
                "description": "You can summon a nature spirit that assumes an animal form to aid you. As a Magic action, you can expend a spell slot or a use of Wild Shape to cast the Find Familiar spell without Material components. When you cast the spell in this way, the familiar is Fey and disappears when you finish a Long Rest ."
            },
            {
                "level": 3,
                "name": "Druid Subclass",
                "description": "You gain a Druid subclass of your choice. The Circle of the Land subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Druid levels. For the rest of your career, you gain each of your subclass's features that are of your Druid level or lower."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Druid levels 8, 12, and 16."
            },
            {
                "level": 5,
                "name": "Wild Resurgence",
                "description": "Once on each of your turns, if you have no uses of Wild Shape left, you can give yourself one use by expending a spell slot (no action required). In addition, you can expend one use of Wild Shape (no action required) to give yourself a level 1 spell slot, but you can't do so again until you finish a Long Rest ."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Druid circle."
            },
            {
                "level": 7,
                "name": "Elemental Fury",
                "description": "The might of the elements flows through you. You gain one of the following options of your choice. Potent Spellcasting. Add your Wisdom modifier to the damage you deal with any Druid cantrip. Primal Strike. Once on each of your turns when you hit a creature with an attack roll using a weapon or a Beast form's attack in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage (choose when you hit)."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 9,
                "name": "5th-Level Spells",
                "description": "You gain access to 5th-level Druid spell slots."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Druid circle."
            },
            {
                "level": 11,
                "name": "6th-Level Spells",
                "description": "You gain access to 6th-level Druid spell slots."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 13,
                "name": "7th-Level Spells",
                "description": "You gain access to 7th-level Druid spell slots."
            },
            {
                "level": 14,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Druid circle."
            },
            {
                "level": 15,
                "name": "Improved Elemental Fury",
                "description": "The option you chose for Elemental Fury grows more powerful, as detailed below. Potent Spellcasting. When you cast a Druid cantrip with a range of 10 feet or greater, the spell's range increases by 300 feet. Primal Strike. The extra damage of your Primal Strike increases to 2d8."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 17,
                "name": "9th-Level Spells",
                "description": "You gain access to 9th-level Druid spell slots."
            },
            {
                "level": 18,
                "name": "Beast Spells",
                "description": "While using Wild Shape, you can cast spells in Beast form, except for any spell that has a Material component with a cost specified or that consumes its Material component."
            },
            {
                "level": 19,
                "name": "Epic Boon",
                "description": "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Dimensional Travel is recommended."
            },
            {
                "level": 20,
                "name": "Archdruid",
                "description": "The vitality of nature constantly blooms within you, granting you the following benefits. Evergreen Wild Shape. Whenever you roll Initiative and have no uses of Wild Shape left, you regain one expended use of it. Nature Magician. You can convert uses of Wild Shape into a spell slot (no action required). Choose a number of your unexpended uses of Wild Shape and convert them into a single spell slot, with each use contributing 2 spell levels. For example, if you convert two uses of Wild Shape, you produce a level 4 spell slot. Once you use this benefit, you can't do so again until you finish a Long Rest . Longevity. The primal magic that you wield causes you to age more slowly. For every ten years that pass, your body ages only one year."
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
                        "description": "Whenever you finish a Long Rest, you can consult your Star Map for omens and roll a die. Until you finish your next Long Rest, you gain access to a special Reaction based on whether you rolled an even or an odd number on the die:\n\nWeal (Even). Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a Reaction to roll 1d6 and add the number rolled to the total.\n\nWoe (Odd). Whenever a creature you can see within 30 feet of you is about to make a D20 Test, you can take a Reaction to roll 1d6 and subtract the number rolled from the total.\n\nYou can use this Reaction a number of times equal to your Wisdom modifier (minimum of once), and you regain all expended uses when you finish a Long Rest."
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
                "Persuasion",
                "Survival"
            ]
        },
        "features": [
            {
                "level": 1,
                "name": "Fighting Style",
                "description": "You have honed your martial prowess and gain a Fighting Style feat of your choice (see \" Feats \"). Defense is recommended. Whenever you gain a Fighter level, you can replace the feat you chose with a different Fighting Style feat."
            },
            {
                "level": 1,
                "name": "Second Wind",
                "description": "You have a limited well of physical and mental stamina that you can draw on. As a Bonus Action, you can use it to regain Hit Points equal to 1d10 plus your Fighter level. You can use this feature twice. You regain one expended use when you finish a Short Rest , and you regain all expended uses when you finish a Long Rest . When you reach certain Fighter levels, you gain more uses of this feature, as shown in the Second Wind column of the Fighter Features table ."
            },
            {
                "level": 1,
                "name": "Weapon Mastery",
                "description": "Your training with weapons allows you to use the mastery properties of three kinds of Simple or Martial weapons of your choice. Whenever you finish a Long Rest , you can practice weapon drills and change one of those weapon choices. When you reach certain Fighter levels, you gain the ability to use the mastery properties of more kinds of weapons, as shown in the Weapon Mastery column of the Fighter Features table ."
            },
            {
                "level": 2,
                "name": "Action Surge",
                "description": "You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action, except the Magic action. Once you use this feature, you can't do so again until you finish a Short or Long Rest . Starting at level 17, you can use it twice before a rest but only once on a turn."
            },
            {
                "level": 2,
                "name": "Tactical Mind",
                "description": "You have a mind for tactics on and off the battlefield. When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining Hit Points, you roll 1d10 and add the number rolled to the ability check, potentially turning it into a success. If the check still fails, this use of Second Wind isn't expended."
            },
            {
                "level": 3,
                "name": "Fighter Subclass",
                "description": "You gain a Fighter subclass of your choice. The Champion subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Fighter levels. For the rest of your career, you gain each of your subclass's features that are of your Fighter level or lower."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Fighter levels 6, 8, 12, 14, and 16."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action on your turn."
            },
            {
                "level": 5,
                "name": "Tactical Shift",
                "description": "Whenever you activate your Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks ."
            },
            {
                "level": 6,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 7,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 9,
                "name": "Indomitable",
                "description": "If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll, and you can't use this feature again until you finish a Long Rest . You can use this feature twice before a Long Rest starting at level 13 and three times before a Long Rest starting at level 17."
            },
            {
                "level": 9,
                "name": "Tactical Master",
                "description": "When you attack with a weapon whose mastery property you can use, you can replace that property with the Push , Sap , or Slow property for that attack."
            },
            {
                "level": 10,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 11,
                "name": "Two Extra Attacks",
                "description": "You can attack three times instead of once whenever you take the Attack action on your turn."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 13,
                "name": "Studied Attacks",
                "description": "You study your opponents and learn from each attack you make. If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn."
            },
            {
                "level": 14,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 15,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 17,
                "name": "Action Surge (2 uses) & Indomitable (3 uses)",
                "description": "You can use Action Surge twice before a rest, but only once on a turn. You can also use Indomitable three times between Long Rests."
            },
            {
                "level": 18,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Fighter archetype."
            },
            {
                "level": 19,
                "name": "Epic Boon",
                "description": "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Combat Prowess is recommended."
            },
            {
                "level": 20,
                "name": "Three Extra Attacks",
                "description": "You can attack four times instead of once whenever you take the Attack action on your turn."
            }
        ],
        "subclasses": [
            {
                "id": "battle-master",
                "name": "Battle Master",
                "description": "Maneuvers and Superiority Dice (d8s) to trip, disarm, or rally allies.",
                "scalingTraits": { "maneuversByLevel": [0, 0, 0, 3, 3, 3, 3, 5, 5, 5, 7, 7, 7, 7, 7, 9, 9, 9, 9, 9, 9] },
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
                "spellcastingOverride": {
                    "ability": "int",
                    "type": "third",
                    "spellList": "Wizard",
                    "cantripsKnownByLevel": [
                        0,
                        0,
                        2,
                        2,
                        2,
                        2,
                        2,
                        2,
                        2,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3,
                        3
                    ],
                    "preparedSpellsByLevel": [
                        0,
                        0,
                        3,
                        4,
                        4,
                        4,
                        5,
                        6,
                        6,
                        7,
                        8,
                        8,
                        9,
                        10,
                        10,
                        11,
                        11,
                        11,
                        12,
                        13
                    ],
                    "spellSlotsByLevel": [
                        [
                            0,
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
                        ]
                    ]
                },
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
                "name": "Martial Arts",
                "description": "Your practice of martial arts gives you mastery of combat styles that use your Unarmed Strike and Monk weapons, which are the following: Simple Melee weapons Martial Melee weapons that have the Light property You gain the following benefits while you are unarmed or wielding only Monk weapons and you aren't wearing armor or wielding a Shield. Bonus Unarmed Strike. You can make an Unarmed Strike as a Bonus Action. Martial Arts Die. You can roll 1d6 in place of the normal damage of your Unarmed Strike or Monk weapons. This die changes as you gain Monk levels, as shown in the Martial Arts column of the Monk Features table. Dexterous Attacks. You can use your Dexterity modifier instead of your Strength modifier for the attack and damage rolls of your Unarmed Strikes and Monk weapons. In addition, when you use the Grapple or Shove option of your Unarmed Strike, you can use your Dexterity modifier instead of your Strength modifier to determine the save DC."
            },
            {
                "level": 1,
                "name": "Unarmored Defense",
                "description": "While you aren't wearing armor or wielding a Shield, your base Armor Class equals 10 plus your Dexterity and Wisdom modifiers."
            },
            {
                "level": 2,
                "name": "Monk's Focus",
                "description": "Your focus and martial training allow you to harness a well of extraordinary energy within yourself. This energy is represented by Focus Points. Your Monk level determines the number of points you have, as shown in the Focus Points column of the Monk Features table . You can expend these points to enhance or fuel certain Monk features. You start knowing three such features: Flurry of Blows, Patient Defense, and Step of the Wind, each of which is detailed below. When you expend a Focus Point, it is unavailable until you finish a Short or Long Rest , at the end of which you regain all your expended points. Some features that use Focus Points require your target to make a saving throw. The save DC equals 8 plus your Wisdom modifier and Proficiency Bonus. Flurry of Blows. You can expend 1 Focus Point to make two Unarmed Strikes as a Bonus Action. Patient Defense. You can take the Disengage action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dodge actions as a Bonus Action. Step of the Wind. You can take the Dash action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and Dash actions as a Bonus Action, and your jump distance is doubled for the turn."
            },
            {
                "level": 2,
                "name": "Unarmored Movement",
                "description": "Your speed increases by 10 feet while you aren't wearing armor or wielding a Shield. This bonus increases when you reach certain Monk levels, as shown on the Monk Features table ."
            },
            {
                "level": 2,
                "name": "Uncanny Metabolism",
                "description": "When you roll Initiative , you can regain all expended Focus Points. When you do so, roll your Martial Arts die, and regain a number of Hit Points equal to your Monk level plus the number rolled. Once you use this feature, you can't use it again until you finish a Long Rest ."
            },
            {
                "level": 3,
                "name": "Deflect Attacks",
                "description": "When an attack roll hits you and its damage includes Bludgeoning, Piercing, or Slashing damage, you can take a Reaction to reduce the attack's total damage against you. The reduction equals 1d10 plus your Dexterity modifier and Monk level. If you reduce the damage to 0, you can expend 1 Focus Point to redirect some of the attack's force. If you do so, choose a creature you can see within 5 feet of yourself if the attack was a melee attack or a creature you can see within 60 feet of yourself that isn't behind Total Cover if the attack was a ranged attack. That creature must succeed on a Dexterity saving throw or take damage equal to two rolls of your Martial Arts die plus your Dexterity modifier. The damage is the same type dealt by the attack."
            },
            {
                "level": 3,
                "name": "Monk Subclass",
                "description": "You gain a Monk subclass of your choice. The Warrior of the Open Hand subclass is detailed after this class's description. A subclass is a specialization that grants you features at certain Monk levels. For the rest of your career, you gain each of your subclass's features that are of your Monk level or lower."
            },
            {
                "level": 4,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat (see \" Feats \") or another feat of your choice for which you qualify. You gain this feature again at Monk levels 8, 12, and 16."
            },
            {
                "level": 4,
                "name": "Slow Fall",
                "description": "You can take a Reaction when you fall to reduce any damage you take from the fall by an amount equal to five times your Monk level."
            },
            {
                "level": 5,
                "name": "Extra Attack",
                "description": "You can attack twice instead of once whenever you take the Attack action on your turn."
            },
            {
                "level": 5,
                "name": "Stunning Strike",
                "description": "Once per turn when you hit a creature with a Monk weapon or an Unarmed Strike , you can expend 1 Focus Point to attempt a stunning strike. The target must make a Constitution saving throw. On a failed save, the target has the Stunned condition until the start of your next turn. On a successful save, the target's Speed is halved until the start of your next turn, and the next attack roll made against the target before then has Advantage ."
            },
            {
                "level": 6,
                "name": "Empowered Strikes",
                "description": "Whenever you deal damage with your Unarmed Strike , it can deal your choice of Force damage or its normal damage type."
            },
            {
                "level": 6,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 7,
                "name": "Evasion",
                "description": "When you're subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail. You don't benefit from this feature if you have the Incapacitated condition."
            },
            {
                "level": 8,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 9,
                "name": "Acrobatic Movement",
                "description": "While you aren't wearing armor or wielding a Shield, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the movement."
            },
            {
                "level": 10,
                "name": "Heightened Focus",
                "description": "Your Flurry of Blows, Patient Defense, and Step of the Wind gain the following benefits. Flurry of Blows. You can expend 1 Focus Point to use Flurry of Blows and make three Unarmed Strikes with it instead of two. Patient Defense. When you expend a Focus Point to use Patient Defense, you gain a number of Temporary Hit Points equal to two rolls of your Martial Arts die. Step of the Wind. When you expend a Focus Point to use Step of the Wind, you can choose a willing creature within 5 feet of yourself that is Large or smaller. You move the creature with you until the end of your turn. The creature's movement doesn't provoke Opportunity Attacks ."
            },
            {
                "level": 10,
                "name": "Self-Restoration",
                "description": "Through sheer force of will, you can remove one of the following conditions from yourself at the end of each of your turns: Charmed , Frightened , or Poisoned . In addition, forgoing food and drink doesn't give you levels of Exhaustion ."
            },
            {
                "level": 11,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 12,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 13,
                "name": "Deflect Energy",
                "description": "You can now use your Deflect Attacks feature against attacks that deal any damage type, not just Bludgeoning, Piercing, or Slashing."
            },
            {
                "level": 14,
                "name": "Disciplined Survivor",
                "description": "Your physical and mental discipline grant you proficiency in all saving throws. Additionally, whenever you make a saving throw and fail, you can expend 1 Focus Point to reroll it, and you must use the new roll."
            },
            {
                "level": 15,
                "name": "Perfect Focus",
                "description": "When you roll Initiative and don't use Uncanny Metabolism, you regain expended Focus Points until you have 4 if you have 3 or fewer."
            },
            {
                "level": 16,
                "name": "Ability Score Improvement",
                "description": "You gain the Ability Score Improvement feat or another feat of your choice for which you qualify."
            },
            {
                "level": 17,
                "name": "Subclass Feature",
                "description": "Gain a feature granted by your chosen Monk tradition."
            },
            {
                "level": 18,
                "name": "Superior Defense",
                "description": "At the start of your turn, you can expend 3 Focus Points to bolster yourself against harm for 1 minute or until you have the Incapacitated condition. During that time, you have Resistance to all damage except Force damage."
            },
            {
                "level": 19,
                "name": "Epic Boon",
                "description": "You gain an Epic Boon feat (see \" Feats \") or another feat of your choice for which you qualify. Boon of Irresistible Offense is recommended."
            },
            {
                "level": 20,
                "name": "Body and Mind",
                "description": "You have developed your body and mind to new heights. Your Dexterity and Wisdom scores increase by 4, to a maximum of 25."
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
            },
            {
                "id": "way-of-the-drunken-master",
                "name": "Way of the Drunken Master",
                "description": "The Way of the Drunken Master teaches its students to move with the jerky, unpredictable movements of a drunkard.",
                "features": [
                    {
                        "level": 3,
                        "name": "Bonus Proficiencies",
                        "description": "You gain proficiency in the Performance skill if you don't already have it. You also gain proficiency with brewer's supplies."
                    },
                    {
                        "level": 3,
                        "name": "Drunken Technique",
                        "description": "Whenever you use Flurry of Blows, you gain the benefit of the Disengage action, and your walking speed increases by 10 feet until the end of the current turn."
                    },
                    {
                        "level": 6,
                        "name": "Tipsy Sway",
                        "description": "You can redirect attacks against you to other creatures, and you can stand up from prone with only 5 feet of movement."
                    },
                    {
                        "level": 11,
                        "name": "Drunkard’s Luck",
                        "description": "When you make an ability check, an attack roll, or a saving throw and have disadvantage, you can spend 1 focus point to cancel the disadvantage for that roll."
                    },
                    {
                        "level": 17,
                        "name": "Intoxicated Frenzy",
                        "description": "When you use Flurry of Blows, you can make up to three additional attacks with Flurry of Blows (up to a total of five attacks), provided that each target is a different creature."
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
                "spellcastingOverride": {
                    "ability": "int",
                    "type": "third",
                    "spellList": "Wizard",
                    "cantripsKnownByLevel": [
                        0,
                        0,
                        3,
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
                        0,
                        0,
                        3,
                        4,
                        4,
                        4,
                        5,
                        6,
                        6,
                        7,
                        8,
                        8,
                        9,
                        10,
                        10,
                        11,
                        11,
                        11,
                        12,
                        13
                    ],
                    "spellSlotsByLevel": [
                        [
                            0,
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
                        ]
                    ]
                },
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
                "description": "Because your magic flows from within, you can alter your spells to suit your needs; you gain two Metamagic options of your choice, and you learn additional Metamagic options at Sorcerer levels 10 and 17. You can use only one Metamagic option on a spell when you cast it, unless the option says otherwise."
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
        "retiredFeatures": [
            { "name": "Otherworldly Patron", "level": 1 },
            { "name": "Pact Boon", "level": 3 }
        ],
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
                "name": "Eldritch Invocations",
                "description": "You have unearthed Eldritch Invocations, pieces of forbidden knowledge that imbue you with an abiding magical ability or other lessons. You gain one invocation of your choice, such as Pact of the Tome. As you gain Warlock levels, you learn additional invocations of your choice (2 at level 2, 3 at level 5, 4 at level 7, 5 at level 9, 6 at level 12, 7 at level 15, and 8 at level 18). Whenever you gain a Warlock level, you can replace one of your invocations with another invocation for which you qualify."
            },
            {
                "level": 1,
                "name": "Pact Magic",
                "description": "Cast warlock spells using Charisma. All spell slots are of the highest unlocked level and recharge on a Short or Long Rest."
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
                "description": "Awakened Mind (telepathic connection), Psychic Spells, Clairvoyant Combatant, Eldritch Hex, Thought Shield, Create Thrall.",
                "features": [
                    {
                        "level": 3,
                        "name": "Awakened Mind",
                        "description": "You can form a telepathic connection between your mind and the mind of another. As a Bonus Action, choose one creature you can see within 30 feet of yourself. You and the chosen creature can communicate telepathically with each other while the two of you are within a number of miles of each other equal to your Charisma modifier (minimum of 1 mile). To understand each other, you each must mentally use a language the other knows. The connection lasts for a number of minutes equal to your Warlock level, ending early if you connect with a different creature."
                    },
                    {
                        "level": 3,
                        "name": "Great Old One Spells",
                        "description": "The magic of your patron ensures you always have certain spells ready; when you reach a Warlock level specified in the Great Old One Spells table, you thereafter always have that spell prepared: 3rd (Detect Thoughts, Dissonant Whispers, Phantasmal Force, Tasha's Hideous Laughter), 5th (Clairvoyance, Hunger of Hadar), 7th (Confusion, Summon Aberration), 9th (Modify Memory, Telekinesis)."
                    },
                    {
                        "level": 3,
                        "name": "Psychic Spells",
                        "description": "When you cast a Warlock spell that deals damage, you can change the damage type to Psychic. In addition, when you cast a Warlock spell that belongs to the Enchantment or Illusion school, you can cast it without Verbal or Somatic components."
                    },
                    {
                        "level": 6,
                        "name": "Clairvoyant Combatant",
                        "description": "You learn to read the attacks of minds you touch. When you form a telepathic bond with a creature using your Awakened Mind, you can force that creature to make a Wisdom saving throw against your spell save DC. On a failed save, the creature has Disadvantage on attack rolls against you, and you have Advantage on attack rolls against that creature for the duration of the bond. Once you use this feature, you can't use it again until you finish a Short or Long Rest unless you expend a Pact Magic spell slot (no action required) to restore your use of it."
                    },
                    {
                        "level": 10,
                        "name": "Eldritch Hex",
                        "description": "Your alien patron grants you a powerful curse. You always have the Hex spell prepared. When you cast Hex and choose an ability, the target also has Disadvantage on saving throws of the chosen ability for the duration of the spell."
                    },
                    {
                        "level": 10,
                        "name": "Thought Shield",
                        "description": "Your thoughts can't be read by telepathy or other means unless you allow it. You also have Resistance to Psychic damage, and whenever a creature deals Psychic damage to you, that creature takes the same amount of damage that you take."
                    },
                    {
                        "level": 14,
                        "name": "Create Thrall",
                        "description": "When you cast Summon Aberration, you can modify it so that it doesn't require Concentration. If you do so, the spell's duration becomes 1 minute for that casting, and when summoned, the Aberration has a number of Temporary Hit Points equal to your Warlock level plus your Charisma modifier. In addition, the first time each turn the Aberration hits a creature under the effect of your Hex, the Aberration deals extra Psychic damage to the target equal to the bonus damage of your Hex."
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
                "description": "Gain Expertise in one of your proficient skills from: Arcana, History, Investigation, Medicine, Nature, or Religion."
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
                "skillPicks": [{ "count": 1, "mode": "proficiency" }], "legacyStateKeys": ["humanExtraSkill"],
                "description": "You gain proficiency in one skill of your choice."
            },
            {
                "name": "Versatile",
                "featPicks": { "count": 1, "category": "origin" }, "legacyStateKeys": ["humanExtraFeatId"],
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
                "skillPicks": [{ "count": 1, "from": ["Insight", "Perception", "Survival"], "mode": "proficiency" }], "legacyStateKeys": ["elfKeenSkill"],
                "description": "You have proficiency in the Insight, Perception, or Survival skill."
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
                "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "poison" }],
                "description": "You have Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition."
            },
            {
                "name": "Dwarven Toughness",
                "modifiers": [{ "target": "vitals.maxHp", "type": "bonus", "perClassLevel": 1 }],
                "description": "Your Hit Point maximum increases by 1 for each level you possess."
            },
            {
                "name": "Stonecunning",
                "resource": { "total": "{{pb}}", "resetOn": "long" },
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
                "name": "Draconic Ancestry",
                "description": "Your lineage stems from a dragon progenitor. Choose the kind of dragon from the Draconic Ancestors table. Your choice affects your Breath Weapon and Damage Resistance traits as well as your appearance."
            },
            {
                "name": "Breath Weapon",
                "resource": { "total": "{{pb}}", "resetOn": "long" }, "scaleValues": [{ "minLevel": 1, "value": "1d10" }, { "minLevel": 5, "value": "2d10" }, { "minLevel": 11, "value": "3d10" }, { "minLevel": 17, "value": "4d10" }],
                "description": "When you take the Attack action, you can replace one of your attacks with an exhalation of magical energy in a 15-foot cone or 30-foot line (1d10 damage of your draconic ancestry type, scaling to 2d10 at 5th, 3d10 at 11th, and 4d10 at 17th level; Dex save DC 8 + Con mod + PB). Usable PB times per Long Rest."
            },
            {
                "name": "Damage Resistance",
                "description": "You have Resistance to the damage type associated with your Draconic Ancestry."
            },
            {
                "name": "Darkvision",
                "description": "You have Darkvision with a range of 60 feet."
            },
            {
                "name": "Draconic Flight (Level 5)",
                "minLevel": 5, "resource": { "name": "Draconic Flight", "total": 1, "resetOn": "long" },
                "description": "Starting at level 5, as a Bonus Action you can sprout spectral wings and gain a Fly Speed equal to your Speed for 10 minutes once per Long Rest."
            }
        ],
        "lineages": [
            {
                "id": "black", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "acid" }],
                "name": "Black Dragon (Acid)",
                "description": "Line 30 ft, Acid damage and Acid resistance.",
                "traits": []
            },
            {
                "id": "blue", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "lightning" }],
                "name": "Blue Dragon (Lightning)",
                "description": "Line 30 ft, Lightning damage and Lightning resistance.",
                "traits": []
            },
            {
                "id": "brass", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "fire" }],
                "name": "Brass Dragon (Fire)",
                "description": "Line 30 ft, Fire damage and Fire resistance.",
                "traits": []
            },
            {
                "id": "bronze", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "lightning" }],
                "name": "Bronze Dragon (Lightning)",
                "description": "Line 30 ft, Lightning damage and Lightning resistance.",
                "traits": []
            },
            {
                "id": "copper", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "acid" }],
                "name": "Copper Dragon (Acid)",
                "description": "Line 30 ft, Acid damage and Acid resistance.",
                "traits": []
            },
            {
                "id": "gold", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "fire" }],
                "name": "Gold Dragon (Fire)",
                "description": "Cone 15 ft, Fire damage and Fire resistance.",
                "traits": []
            },
            {
                "id": "green", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "poison" }],
                "name": "Green Dragon (Poison)",
                "description": "Cone 15 ft, Poison damage and Poison resistance.",
                "traits": []
            },
            {
                "id": "red", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "fire" }],
                "name": "Red Dragon (Fire)",
                "description": "Cone 15 ft, Fire damage and Fire resistance.",
                "traits": []
            },
            {
                "id": "silver", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "cold" }],
                "name": "Silver Dragon (Cold)",
                "description": "Cone 15 ft, Cold damage and Cold resistance.",
                "traits": []
            },
            {
                "id": "white", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "cold" }],
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
                "grantedSpells": [{ "spellName": "Thaumaturgy", "level": 1 }],
                "description": "You know the Thaumaturgy cantrip."
            }
        ],
        "lineages": [
            {
                "id": "abyssal", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "poison" }],
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
                "id": "chthonic", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "necrotic" }],
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
                "id": "infernal", "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "fire" }],
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
                "resource": { "total": "{{pb}}", "resetOn": "short" },
                "description": "You can take the Dash action as a Bonus Action a number of times equal to your Proficiency Bonus per Short or Long Rest. When you do so, you gain Temporary Hit Points equal to your Proficiency Bonus."
            },
            {
                "name": "Darkvision",
                "description": "You have Darkvision with a range of 120 feet."
            },
            {
                "name": "Powerful Build",
                "description": "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift."
            },
            {
                "name": "Relentless Endurance",
                "resource": { "total": 1, "resetOn": "long" },
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
                "resource": { "total": "{{pb}}", "resetOn": "long" }, "aliases": ["Cloud's Jaunt", "Fire's Burn", "Frost's Chill", "Hill's Tumble", "Stone's Endurance", "Storm's Thunder"],
                "description": "You inherit supernatural boons from your giant kin, usable a number of times equal to your Proficiency Bonus per Long Rest."
            },
            {
                "name": "Large Form (Level 5)",
                "minLevel": 5, "resource": { "name": "Large Form", "total": 1, "resetOn": "long" },
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
                "modifiers": [{ "target": "defenses.resistance", "type": "set", "value": "necrotic" }, { "target": "defenses.resistance", "type": "set", "value": "radiant" }],
                "description": "You have Resistance to Necrotic damage and Radiant damage."
            },
            {
                "name": "Darkvision",
                "description": "You have Darkvision with a range of 60 feet."
            },
            {
                "name": "Healing Hands",
                "resource": { "total": 1, "resetOn": "long" },
                "description": "As a Magic action, you can touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains Hit Points equal to the total rolled. Once per Long Rest."
            },
            {
                "name": "Light Bearer",
                "grantedSpells": [{ "spellName": "Light", "level": 1 }],
                "description": "You know the Light cantrip, using Charisma, Wisdom, or Intelligence as your spellcasting ability."
            },
            {
                "name": "Celestial Revelation (Level 3)",
                "minLevel": 3, "resource": { "name": "Celestial Revelation", "total": 1, "resetOn": "long" },
                "description": "At level 3, you can transform for 1 minute as a Bonus Action once per Long Rest, choosing Heavenly Wings (Fly Speed and radiant damage), Inner Radiance (radiant aura damage), or Necrotic Shroud (frighten foes and deal necrotic damage)."
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
        "description": "You called the open water your home, surviving some of the sea's harshest storms and learning to respect the power of nature.",
        "allowedAbilities": [
            "str",
            "dex",
            "wis"
        ],
        "skills": [
            "Acrobatics",
            "Perception"
        ],
        "tool": "Navigator's Tools",
        "originFeatId": "tavern-brawler",
        "equipmentSummary": "A dagger, navigator's tools, 50 feet of silk rope, traveler's clothes, and 10 GP; or 50 GP."
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
            "Spellcasting Ability: Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat)."
        ],
        "spellcastingAbilityOptions": [
            "int",
            "wis",
            "cha"
        ]
    },
    {
        "id": "magic-initiate-druid",
        "name": "Magic Initiate (Druid)",
        "description": "You learn the basics of primal druidic magic.",
        "benefits": [
            "Two Cantrips: You learn two cantrips of your choice from the Druid spell list (e.g. Druidcraft, Produce Flame, Shillelagh).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Druid spell list (e.g. Goodberry, Healing Word, Entangle). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat)."
        ],
        "spellcastingAbilityOptions": [
            "int",
            "wis",
            "cha"
        ]
    },
    {
        "id": "magic-initiate-wizard",
        "name": "Magic Initiate (Wizard)",
        "description": "You learn the basics of arcane wizardly magic.",
        "benefits": [
            "Two Cantrips: You learn two cantrips of your choice from the Wizard spell list (e.g. Fire Bolt, Mage Hand, Prestidigitation).",
            "One 1st-Level Spell: You choose one 1st-level spell from the Wizard spell list (e.g. Shield, Find Familiar, Magic Missile). You always have it prepared and can cast it once per Long Rest without a spell slot, or with spell slots you have.",
            "Spellcasting Ability: Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat's spells (choose when you select this feat)."
        ],
        "spellcastingAbilityOptions": [
            "int",
            "wis",
            "cha"
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
        "skillPicks": [{ "count": 3, "mode": "proficiency" }],
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
        "id": "ability-score-improvement",
        "name": "Ability Score Improvement",
        "description": "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can't increase an ability score above 20. Repeatable.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1.",
            "You cannot increase an ability score above 20 with this feat.",
            "Repeatable: You can take this feat more than once."
        ]
    },
    {
        "id": "actor",
        "name": "Actor",
        "description": "Skilled at mimicry and dramatics, you gain advantage on deception and performance to maintain a disguise.",
        "category": "general",
        "prerequisite": "Level 4+, Charisma 13+",
        "allowedStats": [
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Charisma score by 1, to a maximum of 20.",
            "Disguise Advantage: You have Advantage on Charisma (Deception) and Charisma (Performance) checks to pass yourself off as a different person.",
            "Mimicry: You can mimic the speech of another person or the sounds of other creatures you have heard for at least 1 minute. A listener determines success by an Insight check contested by your Deception or Performance check."
        ]
    },
    {
        "id": "athlete",
        "name": "Athlete",
        "description": "You have undergone extensive physical training to gain exceptional agility and endurance.",
        "category": "general",
        "prerequisite": "Level 4+, Strength or Dexterity 13+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Climb Speed: You gain a Climb Speed equal to your Speed.",
            "Quick Stand: Standing from Prone costs only 5 feet of movement.",
            "Running Jumps: You can make running high and long jumps after moving only 5 feet."
        ]
    },
    {
        "id": "charger",
        "name": "Charger",
        "description": "You can charge forward to slam into foes or push through defenses.",
        "category": "general",
        "prerequisite": "Level 4+, Strength or Dexterity 13+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Enhanced Dash: When you take the Dash action, your Speed increases by 10 feet for that action.",
            "Charge Attack: If you move at least 10 feet in a straight line toward a target and hit it with an attack roll, you can either deal 1d8 extra damage or push the target up to 10 feet away."
        ]
    },
    {
        "id": "chef",
        "name": "Chef",
        "description": "Time and effort spent crafting food and drink has granted you culinary expertise.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "con",
            "wis"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Constitution or Wisdom score by 1, to a maximum of 20.",
            "Cook's Utensils: You gain proficiency with Cook's Utensils.",
            "Restorative Food: During a Short Rest, you can cook special food that restores an extra 1d8 HP to creatures that spend Hit Point Dice.",
            "Treats: As part of a Long Rest, you can prepare treats equal to your Proficiency Bonus. A creature can eat a treat as a Bonus Action to gain Temporary Hit Points equal to your Proficiency Bonus."
        ]
    },
    {
        "id": "crossbow-expert",
        "name": "Crossbow Expert",
        "description": "Extensive training with crossbows grants supernatural firing rate and point-blank accuracy.",
        "category": "general",
        "prerequisite": "Level 4+, Dexterity 13+",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Ignore Loading: You ignore the Loading property of crossbows.",
            "Firing in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged attack rolls with crossbows.",
            "Dual Wielding Crossbows: When you make an attack with a one-handed weapon, you can use a Bonus Action to attack with a Hand Crossbow."
        ]
    },
    {
        "id": "crusher",
        "name": "Crusher",
        "description": "You are practiced in the art of crushing your enemies with bludgeoning weapons.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Constitution score by 1, to a maximum of 20.",
            "Push: Once per turn when you deal Bludgeoning damage to a creature, you can move it 5 feet to an unoccupied space (size Large or smaller).",
            "Critical Impact: When you score a Critical Hit with Bludgeoning damage, attack rolls against that target have Advantage until the start of your next turn."
        ]
    },
    {
        "id": "defensive-duelist",
        "name": "Defensive Duelist",
        "description": "When wielding a Finesse weapon, you can parry incoming strikes.",
        "category": "general",
        "prerequisite": "Level 4+, Dexterity 13+",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Parry: When you are wielding a Finesse weapon and hit by a melee attack, you can use your Reaction to add your Proficiency Bonus to your AC for that attack."
        ]
    },
    {
        "id": "dual-wielder",
        "name": "Dual Wielder",
        "description": "You master fighting with two weapons, even when neither weapon has the Light property.",
        "category": "general",
        "prerequisite": "Level 4+, Strength or Dexterity 13+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Enhanced Dual Wielding: When you take the Attack action and attack with a weapon that has the Light property, you can make one extra attack with a different weapon in your other hand as a Bonus Action even if that weapon isn't Light.",
            "Quick Stow/Draw: You can draw or stow two weapons when you would normally be able to draw or stow only one."
        ]
    },
    {
        "id": "dungeon-delver",
        "name": "Dungeon Delver",
        "description": "Alert to the hidden traps and secret doors found in dungeons.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "int",
            "wis"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
            "Advantage on Perception and Investigation checks to detect secret doors and traps.",
            "Advantage on saving throws made to avoid or resist traps.",
            "Resistance to the damage dealt by traps.",
            "Traveling at a fast pace doesn't impose the normal -5 penalty on your passive Perception."
        ]
    },
    {
        "id": "durable",
        "name": "Durable",
        "description": "Hardy and resilient, you regain hit points with greater vigor.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 20.",
            "Advantage on Death Saving Throws.",
            "Speedy Recovery: As a Bonus Action, you can expend one Hit Point Die to regain Hit Points equal to the roll plus your Constitution modifier."
        ]
    },
    {
        "id": "elemental-adept",
        "name": "Elemental Adept",
        "description": "Spells you cast ignore resistance to a chosen damage type (Acid, Cold, Fire, Lightning, or Thunder).",
        "category": "general",
        "prerequisite": "Level 4+, Spellcasting or Pact Magic Feature",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Ignore Resistance: Spells you cast ignore Resistance to your chosen damage type (Acid, Cold, Fire, Lightning, or Thunder).",
            "Minimum Damage: When you roll damage for a spell of that type, any roll of 1 on a damage die is treated as a 2."
        ]
    },
    {
        "id": "fey-touched",
        "name": "Fey Touched",
        "description": "Your exposure to the Feywild has granted you misty step and an additional spell.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Misty Step: You learn the Misty Step spell and can cast it once without a spell slot per Long Rest.",
            "1st-Level Spell: You learn one 1st-level Divination or Enchantment spell and can cast it once without a spell slot per Long Rest."
        ]
    },
    {
        "id": "grappler",
        "name": "Grappler",
        "description": "You have developed skills to wrestle and subdue enemies in close quarters.",
        "category": "general",
        "prerequisite": "Level 4+, Strength or Dexterity 13+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Punch and Grab: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage and grapple the target simultaneously (once per turn).",
            "Attack Advantage: You have Advantage on attack rolls against a creature Grappled by you.",
            "Fast Wrestler: Your Speed is not halved when moving a creature Grappled by you, provided the creature is your size or smaller."
        ]
    },
    {
        "id": "great-weapon-master",
        "name": "Great Weapon Master",
        "description": "You learn to put the tremendous weight of a heavy weapon to maximum lethal effect.",
        "category": "general",
        "prerequisite": "Level 4+, Strength 13+",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.",
            "Hew: Immediately after you score a Critical Hit with a melee weapon or reduce a creature to 0 HP, you can make one melee weapon attack as a Bonus Action.",
            "Heavy Weapon Mastery: When you hit a creature with a Heavy weapon as part of the Attack action on your turn, you can add your Proficiency Bonus to the damage roll."
        ]
    },
    {
        "id": "heavy-armor-master",
        "name": "Heavy Armor Master",
        "description": "You can use your heavy armor to deflect and absorb crushing blows.",
        "category": "general",
        "prerequisite": "Level 4+, Heavy Armor Training",
        "allowedStats": [
            "str",
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Constitution score by 1, to a maximum of 20.",
            "Damage Reduction: While wearing Heavy Armor, bludgeoning, piercing, and slashing damage that you take from nonmagical attacks is reduced by an amount equal to your Proficiency Bonus."
        ]
    },
    {
        "id": "heavily-armored",
        "name": "Heavily Armored",
        "description": "You have trained to master the use of heavy armor.",
        "category": "general",
        "prerequisite": "Level 4+, Medium Armor Training",
        "allowedStats": [
            "str",
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Constitution score by 1, to a maximum of 20.",
            "Heavy Armor Training: You gain proficiency with Heavy Armor."
        ]
    },
    {
        "id": "inspiring-leader",
        "name": "Inspiring Leader",
        "description": "You spend 10 minutes inspiring your companions, bolstering their resolve with temporary hit points.",
        "category": "general",
        "prerequisite": "Level 4+, Wisdom or Charisma 13+",
        "allowedStats": [
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Wisdom or Charisma score by 1, to a maximum of 20.",
            "Inspiring Speech: Over the course of 10 minutes, you can inspire up to six friendly creatures within 30 feet. Each creature gains Temporary Hit Points equal to your level + your Wisdom or Charisma modifier."
        ]
    },
    {
        "id": "keen-mind",
        "skillPicks": [{ "count": 1, "from": ["Arcana", "History", "Investigation", "Nature", "Religion"], "mode": "proficiency-or-expertise" }],
        "name": "Keen Mind",
        "description": "You have a mind that can track time, direction, and detail with pinpoint precision.",
        "category": "general",
        "prerequisite": "Level 4+, Intelligence 13+",
        "allowedStats": [
            "int"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence score by 1, to a maximum of 20.",
            "Study Bonus: You can take the Study action as a Bonus Action.",
            "Quick Lore: You gain proficiency in Arcana, History, Investigation, Nature, or Religion. If you are already proficient, you gain Expertise."
        ]
    },
    {
        "id": "lightly-armored",
        "name": "Lightly Armored",
        "description": "You train to master the protective arts of light armor and shields.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Light Armor Training: You gain proficiency with Light Armor and Shields."
        ]
    },
    {
        "id": "mage-slayer",
        "name": "Mage Slayer",
        "description": "Practiced in techniques to hunt and disrupt spellcasters in close combat.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Concentration Breaker: When you damage a creature concentrating on a spell, that creature has Disadvantage on the saving throw to maintain concentration.",
            "Guarded Mind: If you fail a saving throw against an effect that targets Intelligence, Wisdom, or Charisma, you can turn the failure into a success (once per Short or Long Rest)."
        ]
    },
    {
        "id": "medium-armor-master",
        "name": "Medium Armor Master",
        "description": "You have practiced moving stealthily and swiftly in medium armor.",
        "category": "general",
        "prerequisite": "Level 4+, Medium Armor Training",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Dexterity Bonus: When you wear Medium Armor, you can add 3, rather than 2, to your AC if you have a Dexterity of 16 or higher.",
            "No Stealth Disadvantage: Wearing Medium Armor doesn't impose Disadvantage on your Dexterity (Stealth) checks."
        ]
    },
    {
        "id": "moderately-armored",
        "name": "Moderately Armored",
        "description": "You have trained to use medium armor and shields for battlefield survival.",
        "category": "general",
        "prerequisite": "Level 4+, Light Armor Training",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Armor Proficiency: You gain proficiency with Medium Armor and Shields."
        ]
    },
    {
        "id": "mounted-combatant",
        "name": "Mounted Combatant",
        "description": "You are a dangerous foe to face while mounted.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex",
            "wis"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength, Dexterity, or Wisdom score by 1, to a maximum of 20.",
            "Mount Advantage: You have Advantage on melee attack rolls against unmounted creatures smaller than your mount.",
            "Mount Protection: You can force an attack aimed at your mount to target you instead.",
            "Evasion: If your mount is subjected to an effect that allows a Dexterity save for half damage, it takes no damage on success and half on failure."
        ]
    },
    {
        "id": "observant",
        "skillPicks": [{ "count": 1, "from": ["Insight", "Investigation", "Perception"], "mode": "proficiency-or-expertise" }],
        "name": "Observant",
        "description": "Quick to notice details in your environment, enhancing investigation and perception.",
        "category": "general",
        "prerequisite": "Level 4+, Intelligence or Wisdom 13+",
        "allowedStats": [
            "int",
            "wis"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
            "Quick Search: You can take the Search action as a Bonus Action.",
            "Keen Senses: You gain proficiency in Insight, Investigation, or Perception. If you are already proficient, you gain Expertise."
        ]
    },
    {
        "id": "piercer",
        "name": "Piercer",
        "description": "You have achieved deadly precision with piercing weapons.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Reroll Piercing Damage: Once per turn when you hit a creature with Piercing damage, you can reroll one of the damage dice and must use the new roll.",
            "Critical Puncture: When you score a Critical Hit with Piercing damage, you roll one additional damage die."
        ]
    },
    {
        "id": "poisoner",
        "name": "Poisoner",
        "description": "You master the preparation and application of lethal poisons.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "dex",
            "int"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity or Intelligence score by 1, to a maximum of 20.",
            "Ignore Resistance: When you make a damage roll, you ignore Resistance to Poison damage.",
            "Fast Application: You can apply poison to a weapon or piece of ammunition as a Bonus Action.",
            "Potent Brew: You can craft potent poisons using a Poisoner's Kit that impose the Poisoned condition."
        ]
    },
    {
        "id": "polearm-master",
        "name": "Polearm Master",
        "description": "You can keep your distance with pole weapons and strike with the haft.",
        "category": "general",
        "prerequisite": "Level 4+, Strength or Dexterity 13+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Haft Strike: Immediately after you take the Attack action and attack with a Glaive, Halberd, Pike, Quarterstaff, or Spear, you can use a Bonus Action to make a melee attack with the opposite end (1d4 bludgeoning).",
            "Reactive Strike: While wielding a Glaive, Halberd, Pike, Quarterstaff, or Spear, you can use your Reaction to make an Opportunity Attack against a creature that enters your reach."
        ]
    },
    {
        "id": "resilient-str",
        "name": "Resilient (Strength)",
        "description": "Gain saving throw proficiency in Strength and +1 Strength.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Strength saving throws."
        ]
    },
    {
        "id": "resilient-dex",
        "name": "Resilient (Dexterity)",
        "description": "Gain saving throw proficiency in Dexterity and +1 Dexterity.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Dexterity saving throws."
        ]
    },
    {
        "id": "resilient-con",
        "name": "Resilient (Constitution)",
        "description": "Gain saving throw proficiency in Constitution and +1 Constitution.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Constitution saving throws."
        ]
    },
    {
        "id": "resilient-int",
        "name": "Resilient (Intelligence)",
        "description": "Gain saving throw proficiency in Intelligence and +1 Intelligence.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "int"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Intelligence saving throws."
        ]
    },
    {
        "id": "resilient-wis",
        "name": "Resilient (Wisdom)",
        "description": "Gain saving throw proficiency in Wisdom and +1 Wisdom.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "wis"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Wisdom score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Wisdom saving throws."
        ]
    },
    {
        "id": "resilient-cha",
        "name": "Resilient (Charisma)",
        "description": "Gain saving throw proficiency in Charisma and +1 Charisma.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Charisma score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Charisma saving throws."
        ]
    },
    {
        "id": "ritual-caster",
        "name": "Ritual Caster",
        "description": "You have learned to cast useful spells as rituals, broadening your magical repertoire.",
        "category": "general",
        "prerequisite": "Level 4+, Intelligence, Wisdom, or Charisma 13+",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Ritual Spells: You acquire a ritual book holding two 1st-level spells with the ritual tag from a chosen class list.",
            "Quick Ritual: Once per Long Rest, you can cast one of your ritual spells using its normal casting time rather than adding 10 minutes."
        ]
    },
    {
        "id": "sentinel",
        "name": "Sentinel",
        "description": "You have mastered techniques to lock down enemies and protect your allies.",
        "category": "general",
        "prerequisite": "Level 4+, Strength or Dexterity 13+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Halt: When you hit a creature with an Opportunity Attack, its Speed becomes 0 for the rest of the current turn.",
            "Guardian: When a creature within 5 feet makes an attack against a target other than you, you can use your Reaction to make an Opportunity Attack against that attacking creature."
        ]
    },
    {
        "id": "shadow-touched",
        "name": "Shadow Touched",
        "description": "Your exposure to the Shadowfell has granted you invisibility and an additional spell.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Invisibility: You learn the Invisibility spell and can cast it once without a spell slot per Long Rest.",
            "1st-Level Spell: You learn one 1st-level Illusion or Necromancy spell and can cast it once without a spell slot per Long Rest."
        ]
    },
    {
        "id": "sharpshooter",
        "name": "Sharpshooter",
        "description": "You have mastered ranged weapons and can make shots that others find impossible.",
        "category": "general",
        "prerequisite": "Level 4+, Dexterity 13+",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Long Shots: Attacking at long range doesn't impose Disadvantage on your ranged weapon attack rolls.",
            "Bypass Cover: Your ranged weapon attacks ignore Half Cover and Three-Quarters Cover.",
            "Close-Quarters Shooting: Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged attack rolls."
        ]
    },
    {
        "id": "shield-master",
        "name": "Shield Master",
        "description": "You use your shield not just for protection, but as an aggressive offensive tool.",
        "category": "general",
        "prerequisite": "Level 4+, Shield Training",
        "allowedStats": [
            "str"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.",
            "Shield Bash: If you take the Attack action on your turn and hit with a melee weapon, you can use a Bonus Action to bash with your shield to push the target 5 feet or knock it Prone.",
            "Interpose Shield: If you are subjected to an effect that allows a Dexterity save for half damage, you can take a Reaction to take no damage instead if you succeed."
        ]
    },
    {
        "id": "skill-expert",
        "skillPicks": [{ "count": 1, "mode": "proficiency" }, { "count": 1, "mode": "expertise" }],
        "name": "Skill Expert",
        "description": "Your focused study grants you broad skill proficiency and peerless expertise.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 20.",
            "Skill Proficiency: You gain proficiency in one skill of your choice.",
            "Skill Expertise: Choose one skill in which you have proficiency; you gain Expertise in that skill."
        ]
    },
    {
        "id": "skulker",
        "name": "Skulker",
        "description": "You are expert at slinking through shadows and striking unseen.",
        "category": "general",
        "prerequisite": "Level 4+, Dexterity 13+",
        "allowedStats": [
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Fog of War: You can make a Hide action even when lightly obscured.",
            "Sniper: When you are hidden from a creature and miss with a ranged weapon attack, making the attack doesn't reveal your position.",
            "Blindsight: You have Blindsight with a range of 10 feet."
        ]
    },
    {
        "id": "slasher",
        "name": "Slasher",
        "description": "You have mastered techniques for slashing weapons to hamper enemy movement.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Hamstring: Once per turn when you deal Slashing damage to a creature, you can reduce its Speed by 10 feet until the start of your next turn.",
            "Grievous Wound: When you score a Critical Hit with Slashing damage, the target has Disadvantage on all attack rolls until the start of your next turn."
        ]
    },
    {
        "id": "speedy",
        "name": "Speedy",
        "description": "You are exceptionally swift and agile, dodging through enemy lines.",
        "category": "general",
        "prerequisite": "Level 4+, Dexterity or Constitution 13+",
        "allowedStats": [
            "dex",
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity or Constitution score by 1, to a maximum of 20.",
            "Speed Increase: Your Speed increases by 10 feet.",
            "Dash Through Difficult Terrain: When you take the Dash action, Difficult Terrain doesn't cost extra movement for that turn.",
            "Agile Movement: Opportunity Attacks made against you have Disadvantage."
        ]
    },
    {
        "id": "spell-sniper",
        "name": "Spell Sniper",
        "description": "You have learned techniques to enhance your ranged spell attacks.",
        "category": "general",
        "prerequisite": "Level 4+, Spellcasting or Pact Magic Feature",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Double Range: When you cast a spell that requires an attack roll and has a range of at least 10 feet, the range is doubled.",
            "Bypass Cover: Your ranged spell attacks ignore Half Cover and Three-Quarters Cover.",
            "Casting in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged spell attack rolls."
        ]
    },
    {
        "id": "telekinetic",
        "name": "Telekinetic",
        "description": "You learn to move things with your mind, manipulating foes and objects.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Mage Hand: You learn the Mage Hand cantrip and can cast it without verbal or somatic components; its range is increased by 30 feet.",
            "Telekinetic Shove: As a Bonus Action, you can attempt to telekinetically shove one creature within 30 feet 5 feet toward or away from you (Strength save vs. spell save DC)."
        ]
    },
    {
        "id": "telepathic",
        "name": "Telepathic",
        "description": "You awaken the ability to communicate with and read the minds of others.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Telepathy: You can speak telepathically to any creature within 60 feet that you can see.",
            "Detect Thoughts: You learn Detect Thoughts and can cast it once without a spell slot per Long Rest."
        ]
    },
    {
        "id": "war-caster",
        "name": "War Caster",
        "description": "You have practiced casting spells in the midst of combat.",
        "category": "general",
        "prerequisite": "Level 4+, Spellcasting or Pact Magic Feature",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Concentration Advantage: You have Advantage on Constitution saving throws made to maintain concentration on a spell when you take damage.",
            "Somatic Components: You can perform somatic components of spells even when holding weapons or a shield in both hands.",
            "Reactive Spell: When a hostile creature's movement provokes an Opportunity Attack from you, you can use your Reaction to cast a 1-Action spell at that creature."
        ]
    },
    {
        "id": "weapon-master",
        "name": "Weapon Master",
        "description": "You practice extensively with diverse weapons, unlocking their masteries.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Mastery Properties: You gain the Weapon Mastery property for one weapon of your choice in which you have proficiency."
        ]
    },
    {
        "id": "fighting-style-archery",
        "name": "Archery",
        "description": "You gain a +2 bonus to attack rolls you make with Ranged weapons.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "You gain a +2 bonus to attack rolls you make with Ranged weapons."
        ]
    },
    {
        "id": "fighting-style-blind-fighting",
        "name": "Blind Fighting",
        "description": "You have Blindsight with a range of 10 feet.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "You have Blindsight with a range of 10 feet. Within that range, you can effectively see anything that isn't behind total cover, even if you are blinded or in darkness."
        ]
    },
    {
        "id": "fighting-style-defense",
        "name": "Defense",
        "description": "While you are wearing armor, you gain a +1 bonus to Armor Class.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "While you are wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class."
        ]
    },
    {
        "id": "fighting-style-dueling",
        "name": "Dueling",
        "description": "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon."
        ]
    },
    {
        "id": "fighting-style-great-weapon-fighting",
        "name": "Great Weapon Fighting",
        "description": "When you roll damage for an attack with a two-handed melee weapon, you can treat any 1 or 2 on a damage die as a 3.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit."
        ]
    },
    {
        "id": "fighting-style-interception",
        "name": "Interception",
        "description": "When a creature you can see hits an ally within 5 feet with an attack roll, you can use your Reaction to reduce the damage.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "When a creature you can see hits a target within 5 feet of you with an attack roll, you can use your Reaction to reduce the damage the target takes by 1d10 + your Proficiency Bonus (must be wielding a Shield or Simple/Martial weapon)."
        ]
    },
    {
        "id": "fighting-style-protection",
        "name": "Protection",
        "description": "When a creature you can see attacks an ally within 5 feet, you can use your Reaction to impose Disadvantage.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "When a creature you can see attacks a target within 5 feet of you other than yourself, you can use your Reaction to impose Disadvantage on the attack roll (must be wielding a Shield)."
        ]
    },
    {
        "id": "fighting-style-superior-technique",
        "name": "Superior Technique",
        "description": "You learn one maneuver of your choice from the Battle Master archetype.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "You learn one maneuver of your choice from the Battle Master archetype and gain one Superiority Die (d6), which is expended when used and regained on a Short or Long Rest."
        ]
    },
    {
        "id": "fighting-style-thrown-weapon-fighting",
        "name": "Thrown Weapon Fighting",
        "description": "You can draw a weapon with the Thrown property as part of the attack and gain +2 to damage rolls.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "You can draw a weapon that has the Thrown property as part of the attack you make with the weapon.",
            "When you hit with a ranged attack using a thrown weapon, you gain a +2 bonus to the damage roll."
        ]
    },
    {
        "id": "fighting-style-two-weapon-fighting",
        "name": "Two-Weapon Fighting",
        "description": "When making an extra attack using a Light weapon, you can add your ability modifier to the damage.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren't already adding it."
        ]
    },
    {
        "id": "fighting-style-unarmed-fighting",
        "name": "Unarmed Fighting",
        "description": "Your Unarmed Strikes deal 1d6 (or 1d8) damage, and you deal extra damage to grappled targets.",
        "category": "fighting-style",
        "prerequisite": "Fighting Style Feature",
        "allowedStats": [],
        "benefits": [
            "Your Unarmed Strikes deal 1d6 + Strength modifier bludgeoning damage (or 1d8 + Strength modifier if you aren't wielding weapons or a shield).",
            "At the start of each of your turns, you can deal 1d4 bludgeoning damage to one creature grappled by you."
        ]
    },
    {
        "id": "boon-of-combat-prowess",
        "name": "Boon of Combat Prowess",
        "description": "Your combat prowess is peerless. When you miss with an attack roll, you can hit instead.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Peerless Aim: When you miss with an attack roll, you can hit instead. Once you use this benefit, you can't use it again until the start of your next turn."
        ]
    },
    {
        "id": "boon-of-dimensional-travel",
        "name": "Boon of Dimensional Travel",
        "description": "Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Blink Steps: Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see."
        ]
    },
    {
        "id": "boon-of-energy-evasion",
        "name": "Boon of Energy Evasion",
        "description": "You gain energy absorption and defense against elemental damage.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "dex",
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity or Constitution score by 1, to a maximum of 30.",
            "Energy Resistance: When you finish a Long Rest, choose two damage types from Acid, Cold, Fire, Lightning, Poison, or Thunder. You have Resistance to those damage types until your next Long Rest.",
            "Energy Redirection: When you take damage of either chosen type, you can use your Reaction to deal that amount of damage to a creature within 60 feet."
        ]
    },
    {
        "id": "boon-of-fate",
        "name": "Boon of Fate",
        "description": "When you or a creature within 60 feet succeeds or fails a D20 Test, you can add or subtract 2d4.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Improve Fate: When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll (usable once per Short/Long Rest or rolling Initiative)."
        ]
    },
    {
        "id": "boon-of-fortitude",
        "name": "Boon of Fortitude",
        "description": "Your Hit Point maximum increases by 40, and you gain rapid physical healing.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 30.",
            "Fortified Life: Your Hit Point maximum increases by 40.",
            "Health Recovery: Whenever you regain Hit Points, you regain additional Hit Points equal to your Constitution modifier."
        ]
    },
    {
        "id": "boon-of-irresistible-offense",
        "name": "Boon of Irresistible Offense",
        "description": "The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 30.",
            "Overcome Defenses: The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance.",
            "Overwhelming Strike: When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat."
        ]
    },
    {
        "id": "boon-of-recovery",
        "name": "Boon of Recovery",
        "description": "You have advantage on Death Saving Throws and can bounce back from death's door.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 30.",
            "Unfailing Vitality: You have Advantage on Death Saving Throws.",
            "Lasting Recovery: When you drop to 0 Hit Points, you can regain Hit Points equal to half your Hit Point maximum instead (once per Long Rest)."
        ]
    },
    {
        "id": "boon-of-skill-proficiency",
        "name": "Boon of Skill Proficiency",
        "description": "You gain proficiency in all skills and expertise in one skill.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Universal Knowledge: You gain proficiency in all skills.",
            "Master of Skills: Choose one skill in which you have proficiency; you gain Expertise in that skill."
        ]
    },
    {
        "id": "boon-of-speed",
        "name": "Boon of Speed",
        "description": "Your Speed increases by 30 feet, and you can Disengage as a Bonus Action.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "dex",
            "con"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Dexterity or Constitution score by 1, to a maximum of 30.",
            "Quickness: Your Speed increases by 30 feet.",
            "Escape Artist: As a Bonus Action, you can take the Disengage action, which also ends the Grappled condition on you."
        ]
    },
    {
        "id": "boon-of-spell-recall",
        "name": "Boon of Spell Recall",
        "description": "Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If matching the slot level, the slot isn't expended.",
        "category": "epic-boon",
        "prerequisite": "Level 19+, Spellcasting Feature",
        "isEpicBoon": true,
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30.",
            "Free Casting: Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If the number you roll is the same as the slot's level, the slot isn't expended."
        ]
    },
    {
        "id": "boon-of-the-night-spirit",
        "name": "Boon of the Night Spirit",
        "description": "While within Dim Light or Darkness, you can become Invisible as a Bonus Action and resist damage.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Merge with Shadows: While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action.",
            "Shadowy Form: While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant."
        ]
    },
    {
        "id": "boon-of-truesight",
        "name": "Boon of Truesight",
        "description": "You gain Truesight with a range of 60 feet.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
        "isEpicBoon": true,
        "allowedStats": [
            "str",
            "dex",
            "con",
            "int",
            "wis",
            "cha"
        ],
        "benefits": [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Truesight: You have Truesight with a range of 60 feet."
        ]
    },
    {
        "id": "alert-general",
        "name": "Alert",
        "description": "Always on the lookout for danger, gaining swift reflexes and awareness.",
        "category": "general",
        "prerequisite": "Level 4+",
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
        "id": "speedster",
        "name": "Speedster (Mobile)",
        "description": "You are exceptionally speedy and agile in combat.",
        "category": "general",
        "prerequisite": "Level 4+, Dexterity or Constitution 13+",
        "allowedStats": [
            "dex",
            "con"
        ],
        "benefits": [
            "Your speed increases by 10 feet.",
            "When you take the Dash action, difficult terrain doesn't cost extra movement.",
            "Opportunity Attacks against you have Disadvantage."
        ]
    },
    {
        "id": "tough-general",
        "name": "Tough",
        "description": "Your hit point maximum increases drastically.",
        "category": "general",
        "prerequisite": "Level 4+",
        "allowedStats": [
            "con"
        ],
        "benefits": [
            "Your Hit Point maximum increases by twice your character level, and +2 each level thereafter."
        ]
    },
    {
        "id": "epic-boon-combat-prowess",
        "name": "Epic Boon of Combat Prowess",
        "description": "Your combat prowess is legendary. Once per turn, when you miss with an attack, you can hit instead.",
        "category": "epic-boon",
        "prerequisite": "Level 19+",
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
        "category": "epic-boon",
        "prerequisite": "Level 19+",
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
        "category": "epic-boon",
        "prerequisite": "Level 19+",
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
        "category": "epic-boon",
        "prerequisite": "Level 19+",
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
        "category": "epic-boon",
        "prerequisite": "Level 19+, Spellcasting Feature",
        "allowedStats": [
            "int",
            "wis",
            "cha"
        ],
        "isEpicBoon": true,
        "benefits": [
            "Whenever you cast a spell of level 1 through 4 using a spell slot, roll a d4. If matching the slot level, the slot isn't expended."
        ]
    }
];
