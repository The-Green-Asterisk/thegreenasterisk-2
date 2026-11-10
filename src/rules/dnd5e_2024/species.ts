import { SpeciesDefinition } from "./types";

export const SPECIES_2024: SpeciesDefinition[] = [
    {
        id: "human",
        name: "Human",
        description: "Versatile, ambitious, and adaptable, humans thrive across every realm and culture.",
        size: "Medium or Small",
        speed: 30,
        extraSkillCount: 1,
        extraFeatCount: 1,
        traits: [
            {
                name: "Resourceful",
                description: "You gain Heroic Inspiration whenever you finish a Long Rest."
            },
            {
                name: "Skillful",
                skillPicks: [{ count: 1, mode: "proficiency" }], legacyStateKeys: ["humanExtraSkill"],
                description: "You gain proficiency in one skill of your choice."
            },
            {
                name: "Versatile",
                featPicks: { count: 1, category: "origin" }, legacyStateKeys: ["humanExtraFeatId"],
                description: "You gain one Origin Feat of your choice."
            }
        ]
    },
    {
        id: "elf",
        name: "Elf",
        description: "Graceful inheritors of magic, elves possess keen senses and deep connection to the Feywild.",
        size: "Medium",
        speed: 30,
        darkvision: "Darkvision 60 ft.",
        traits: [
            {
                name: "Fey Ancestry",
                description: "You have Advantage on saving throws you make to avoid or end the Charmed condition on yourself, and magic can't put you to sleep."
            },
            {
                name: "Keen Senses",
                skillPicks: [{ count: 1, from: ["Insight", "Perception", "Survival"], mode: "proficiency" }], legacyStateKeys: ["elfKeenSkill"],
                description: "You have proficiency in the Insight, Perception, or Survival skill."
            },
            {
                name: "Trance",
                description: "You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation."
            }
        ],
        lineages: [
            {
                id: "high-elf", spellcastingAbilityOptions: ["int", "wis", "cha"],
                name: "High Elf",
                description: "Steeped in arcane tradition, you inherit spells from the Wizard list and can change cantrips on a Long Rest.",
                traits: [
                    {
                        name: "High Elf Magic",
                        description: "You know the Prestidigitation cantrip (or another Wizard cantrip). At level 3 you can cast Detect Magic, and at level 5 Misty Step (once per Long Rest or with spell slots)."
                    }
                ],
                spellsGranted: [
                    { level: 1, spellName: "Prestidigitation" },
                    { level: 3, spellName: "Detect Magic" },
                    { level: 5, spellName: "Misty Step" }
                ]
            },
            {
                id: "wood-elf", spellcastingAbilityOptions: ["int", "wis", "cha"],
                name: "Wood Elf",
                description: "Swift guardians of ancient forests, wood elves move with extraordinary quickness and druidic stealth.",
                speedBonus: 5,
                traits: [
                    {
                        name: "Fleet of Foot",
                        description: "Your base speed increases to 35 feet."
                    },
                    {
                        name: "Wood Elf Magic",
                        description: "You know the Druidcraft cantrip. At level 3 you can cast Longstrider, and at level 5 Pass Without Trace."
                    }
                ],
                spellsGranted: [
                    { level: 1, spellName: "Druidcraft" },
                    { level: 3, spellName: "Longstrider" },
                    { level: 5, spellName: "Pass Without Trace" }
                ]
            },
            {
                id: "drow", spellcastingAbilityOptions: ["int", "wis", "cha"],
                name: "Drow",
                description: "Children of the Underdark blessed with superior darkvision and shadowy magic.",
                darkvision: "Darkvision 120 ft.",
                traits: [
                    {
                        name: "Superior Darkvision",
                        description: "Your Darkvision extends to 120 feet."
                    },
                    {
                        name: "Drow Magic",
                        description: "You know the Dancing Lights cantrip. At level 3 you can cast Faerie Fire, and at level 5 Darkness."
                    }
                ],
                spellsGranted: [
                    { level: 1, spellName: "Dancing Lights" },
                    { level: 3, spellName: "Faerie Fire" },
                    { level: 5, spellName: "Darkness" }
                ]
            }
        ]
    },
    {
        id: "dwarf",
        name: "Dwarf",
        description: "Stalwart defenders forged in stone and mountain caverns, famed for endurance and master craftsmanship.",
        size: "Medium",
        speed: 30,
        darkvision: "Darkvision 120 ft.",
        traits: [
            {
                name: "Dwarven Resilience",
                modifiers: [{ target: "defenses.resistance", type: "set", value: "poison" }],
                description: "You have Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition."
            },
            {
                name: "Dwarven Toughness",
                modifiers: [{ target: "vitals.maxHp", type: "bonus", perClassLevel: 1 }],
                description: "Your Hit Point maximum increases by 1 for each level you possess."
            },
            {
                name: "Stonecunning",
                resource: { total: "{{pb}}", resetOn: "long" },
                description: "As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes while on stone surfaces. You can use this a number of times equal to your Proficiency Bonus per Long Rest."
            }
        ]
    },
    {
        id: "halfling",
        name: "Halfling",
        description: "Small folk of immense courage, luck, and community spirit who can slip past danger unseen.",
        size: "Small",
        speed: 30,
        traits: [
            {
                name: "Brave",
                description: "You have Advantage on saving throws you make to avoid or end the Frightened condition."
            },
            {
                name: "Halfling Nimbleness",
                description: "You can move through the space of any creature that is of a size larger than yours."
            },
            {
                name: "Luck",
                description: "When you roll a 1 on the d20 of a D20 Test (attack roll, ability check, or saving throw), you can reroll the die and must use the new roll."
            },
            {
                name: "Naturally Stealthy",
                description: "You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you."
            }
        ]
    },
    {
        id: "gnome",
        name: "Gnome",
        description: "Inventive, curious, and sharp-minded folk who excel at magical craft and trickery.",
        size: "Small",
        speed: 30,
        darkvision: "Darkvision 60 ft.",
        traits: [
            {
                name: "Gnomish Cunning",
                description: "You have Advantage on Intelligence, Wisdom, and Charisma saving throws."
            }
        ],
        lineages: [
            {
                id: "forest-gnome", spellcastingAbilityOptions: ["int", "wis", "cha"],
                name: "Forest Gnome",
                description: "Attuned to woodcraft and illusion, forest gnomes can communicate with small forest creatures.",
                traits: [
                    {
                        name: "Forest Gnome Magic",
                        description: "You know the Minor Illusion cantrip and can cast Speak with Animals a number of times equal to your Proficiency Bonus per Long Rest."
                    }
                ],
                spellsGranted: [
                    { level: 1, spellName: "Minor Illusion" },
                    { level: 1, spellName: "Speak with Animals" }
                ]
            },
            {
                id: "rock-gnome", spellcastingAbilityOptions: ["int", "wis", "cha"],
                name: "Rock Gnome",
                description: "Master tinkers and ingenious inventors who construct tiny mechanical marvels.",
                traits: [
                    {
                        name: "Tinker & Artificer's Lore",
                        description: "You know the Mending and Prestidigitation cantrips and can use tinker's tools to build clockwork devices (clockwork toy, fire starter, music box)."
                    }
                ],
                spellsGranted: [
                    { level: 1, spellName: "Mending" },
                    { level: 1, spellName: "Prestidigitation" }
                ]
            }
        ]
    },
    {
        id: "dragonborn",
        name: "Dragonborn",
        description: "Proud scions of ancient dragons, channeling elemental breath and draconian wings.",
        size: "Medium",
        speed: 30,
        darkvision: "Darkvision 60 ft.",
        traits: [
            {
                name: "Draconic Ancestry",
                description: "Your lineage stems from a dragon progenitor. Choose the kind of dragon from the Draconic Ancestors table. Your choice affects your Breath Weapon and Damage Resistance traits as well as your appearance."
            },
            {
                name: "Breath Weapon",
                resource: { total: "{{pb}}", resetOn: "long" }, scaleValues: [{ minLevel: 1, value: "1d10" }, { minLevel: 5, value: "2d10" }, { minLevel: 11, value: "3d10" }, { minLevel: 17, value: "4d10" }],
                description: "When you take the Attack action, you can replace one of your attacks with an exhalation of magical energy in a 15-foot cone or 30-foot line (1d10 damage of your draconic ancestry type, scaling to 2d10 at 5th, 3d10 at 11th, and 4d10 at 17th level; Dex save DC 8 + Con mod + PB). Usable PB times per Long Rest."
            },
            {
                name: "Damage Resistance",
                description: "You have Resistance to the damage type associated with your Draconic Ancestry."
            },
            {
                name: "Darkvision",
                description: "You have Darkvision with a range of 60 feet."
            },
            {
                name: "Draconic Flight (Level 5)",
                minLevel: 5, resource: { name: "Draconic Flight", total: 1, resetOn: "long" },
                description: "Starting at level 5, as a Bonus Action you can sprout spectral wings and gain a Fly Speed equal to your Speed for 10 minutes once per Long Rest."
            }
        ],
        lineages: [
            { id: "black", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid" }], name: "Black Dragon (Acid)", description: "Line 30 ft, Acid damage and Acid resistance.", traits: [] },
            { id: "blue", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning" }], name: "Blue Dragon (Lightning)", description: "Line 30 ft, Lightning damage and Lightning resistance.", traits: [] },
            { id: "brass", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire" }], name: "Brass Dragon (Fire)", description: "Line 30 ft, Fire damage and Fire resistance.", traits: [] },
            { id: "bronze", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning" }], name: "Bronze Dragon (Lightning)", description: "Line 30 ft, Lightning damage and Lightning resistance.", traits: [] },
            { id: "copper", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid" }], name: "Copper Dragon (Acid)", description: "Line 30 ft, Acid damage and Acid resistance.", traits: [] },
            { id: "gold", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire" }], name: "Gold Dragon (Fire)", description: "Cone 15 ft, Fire damage and Fire resistance.", traits: [] },
            { id: "green", modifiers: [{ target: "defenses.resistance", type: "set", value: "poison" }], name: "Green Dragon (Poison)", description: "Cone 15 ft, Poison damage and Poison resistance.", traits: [] },
            { id: "red", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire" }], name: "Red Dragon (Fire)", description: "Cone 15 ft, Fire damage and Fire resistance.", traits: [] },
            { id: "silver", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold" }], name: "Silver Dragon (Cold)", description: "Cone 15 ft, Cold damage and Cold resistance.", traits: [] },
            { id: "white", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold" }], name: "White Dragon (Cold)", description: "Cone 15 ft, Cold damage and Cold resistance.", traits: [] }
        ]
    },
    {
        id: "tiefling",
        name: "Tiefling",
        description: "Bearing the mark of fiendish planes, tieflings wield fiery magic and dark vision.",
        size: "Medium or Small",
        speed: 30,
        darkvision: "Darkvision 60 ft.",
        traits: [
            {
                name: "Otherworldly Presence", spellcastingAbilityOptions: ["int", "wis", "cha"],
                grantedSpells: [{ spellName: "Thaumaturgy", level: 1 }],
                description: "You know the Thaumaturgy cantrip."
            }
        ],
        lineages: [
            {
                id: "abyssal", spellcastingAbilityOptions: ["int", "wis", "cha"], modifiers: [{ target: "defenses.resistance", type: "set", value: "poison" }],
                name: "Abyssal (Chaotic Evil)",
                description: "Poison resistance, Poison Spray cantrip, Ray of Sickness at level 3, Hold Person at level 5.",
                traits: [{ name: "Fiendish Legacy: Abyssal", description: "Resistance to Poison damage." }],
                spellsGranted: [
                    { level: 1, spellName: "Poison Spray" },
                    { level: 3, spellName: "Ray of Sickness" },
                    { level: 5, spellName: "Hold Person" }
                ]
            },
            {
                id: "chthonic", spellcastingAbilityOptions: ["int", "wis", "cha"], modifiers: [{ target: "defenses.resistance", type: "set", value: "necrotic" }],
                name: "Chthonic (Neutral Evil)",
                description: "Necrotic resistance, Chill Touch cantrip, False Life at level 3, Ray of Enfeeblement at level 5.",
                traits: [{ name: "Fiendish Legacy: Chthonic", description: "Resistance to Necrotic damage." }],
                spellsGranted: [
                    { level: 1, spellName: "Chill Touch" },
                    { level: 3, spellName: "False Life" },
                    { level: 5, spellName: "Ray of Enfeeblement" }
                ]
            },
            {
                id: "infernal", spellcastingAbilityOptions: ["int", "wis", "cha"], modifiers: [{ target: "defenses.resistance", type: "set", value: "fire" }],
                name: "Infernal (Lawful Evil)",
                description: "Fire resistance, Fire Bolt cantrip, Hellish Rebuke at level 3, Darkness at level 5.",
                traits: [{ name: "Fiendish Legacy: Infernal", description: "Resistance to Fire damage." }],
                spellsGranted: [
                    { level: 1, spellName: "Fire Bolt" },
                    { level: 3, spellName: "Hellish Rebuke" },
                    { level: 5, spellName: "Darkness" }
                ]
            }
        ]
    },
    {
        id: "orc",
        name: "Orc",
        description: "Fierce and unstoppable, orcs rely on relentless stamina and adrenaline in the heat of battle.",
        size: "Medium",
        speed: 30,
        darkvision: "Darkvision 120 ft.",
        traits: [
            {
                name: "Adrenaline Rush",
                resource: { total: "{{pb}}", resetOn: "short" },
                description: "You can take the Dash action as a Bonus Action a number of times equal to your Proficiency Bonus per Short or Long Rest. When you do so, you gain Temporary Hit Points equal to your Proficiency Bonus."
            },
            {
                name: "Darkvision",
                description: "You have Darkvision with a range of 120 feet."
            },
            {
                name: "Powerful Build",
                description: "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift."
            },
            {
                name: "Relentless Endurance",
                resource: { total: 1, resetOn: "long" },
                description: "When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can't do so again until you finish a Long Rest."
            }
        ]
    },
    {
        id: "goliath",
        name: "Goliath",
        description: "Towering descendants of ancient giants who conquer peaks and withstand colossal punishment.",
        size: "Medium",
        speed: 35,
        traits: [
            {
                name: "Giant Ancestry",
                resource: { total: "{{pb}}", resetOn: "long" }, aliases: ["Cloud's Jaunt", "Fire's Burn", "Frost's Chill", "Hill's Tumble", "Stone's Endurance", "Storm's Thunder"],
                description: "You inherit supernatural boons from your giant kin, usable a number of times equal to your Proficiency Bonus per Long Rest."
            },
            {
                name: "Large Form (Level 5)",
                minLevel: 5, resource: { name: "Large Form", total: 1, resetOn: "long" },
                description: "Starting at level 5, as a Bonus Action you can transform into Large size for 10 minutes. During this transformation, you gain Advantage on Strength checks and your speed increases by 10 feet. Usable once per Long Rest."
            },
            {
                name: "Powerful Build",
                description: "You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift. You also have Advantage on saving throws to end the Grappled condition."
            }
        ],
        lineages: [
            { id: "cloud", name: "Cloud Giant", description: "Cloud's Jaunt: Teleport up to 30 feet as a Bonus Action PB times per Long Rest.", traits: [] },
            { id: "fire", name: "Fire Giant", description: "Fire's Burn: Deal an extra 1d10 Fire damage when you hit a target with an attack PB times per Long Rest.", traits: [] },
            { id: "frost", name: "Frost Giant", description: "Frost's Chill: Deal an extra 1d6 Cold damage and reduce target speed by 10 feet when you hit PB times per Long Rest.", traits: [] },
            { id: "hill", name: "Hill Giant", description: "Hill's Tumble: Knock a Large or smaller creature Prone on a weapon hit PB times per Long Rest.", traits: [] },
            { id: "stone", name: "Stone Giant", description: "Stone's Endurance: As a Reaction when taking damage, roll 1d12 + Con modifier and reduce damage taken PB times per Long Rest.", traits: [] },
            { id: "storm", name: "Storm Giant", description: "Storm's Thunder: As a Reaction when taking damage, deal 1d8 Thunder damage to attacker PB times per Long Rest.", traits: [] }
        ]
    },
    {
        id: "aasimar",
        name: "Aasimar",
        description: "Mortals carrying the spark of the Upper Planes, blessed with healing radiance and wings of light.",
        size: "Medium or Small",
        speed: 30,
        darkvision: "Darkvision 60 ft.",
        traits: [
            {
                name: "Celestial Resistance",
                modifiers: [{ target: "defenses.resistance", type: "set", value: "necrotic" }, { target: "defenses.resistance", type: "set", value: "radiant" }],
                description: "You have Resistance to Necrotic damage and Radiant damage."
            },
            {
                name: "Darkvision",
                description: "You have Darkvision with a range of 60 feet."
            },
            {
                name: "Healing Hands",
                resource: { total: 1, resetOn: "long" },
                description: "As a Magic action, you can touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains Hit Points equal to the total rolled. Once per Long Rest."
            },
            {
                name: "Light Bearer", spellcastingAbilityOptions: ["cha"],
                grantedSpells: [{ spellName: "Light", level: 1 }],
                description: "You know the Light cantrip, using Charisma, Wisdom, or Intelligence as your spellcasting ability."
            },
            {
                name: "Celestial Revelation (Level 3)",
                minLevel: 3, resource: { name: "Celestial Revelation", total: 1, resetOn: "long" },
                description: "At level 3, you can transform for 1 minute as a Bonus Action once per Long Rest, choosing Heavenly Wings (Fly Speed and radiant damage), Inner Radiance (radiant aura damage), or Necrotic Shroud (frighten foes and deal necrotic damage)."
            }
        ]
    }
];
