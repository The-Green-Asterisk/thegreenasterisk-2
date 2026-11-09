import { ProgressionChoiceOption } from "./types";

export interface FeatureOption extends ProgressionChoiceOption {
    minLevel?: number;
}

export const FIGHTING_STYLES: FeatureOption[] = [
    {
        id: "archery",
        name: "Archery",
        description: "You gain a +2 bonus to attack rolls you make with ranged weapons.",
        modifiers: [
            {
                target: "attacks.ranged",
                type: "bonus",
                value: 2,
                description: "+2 bonus to attack rolls with ranged weapons"
            }
        ]
    },
    {
        id: "defense",
        name: "Defense",
        description: "While you are wearing armor, you gain a +1 bonus to Armor Class.",
        modifiers: [
            {
                target: "vitals.ac",
                type: "bonus",
                value: 1,
                condition: "wearing armor",
                description: "+1 bonus to Armor Class"
            }
        ]
    },
    {
        id: "dueling",
        name: "Dueling",
        description: "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.",
        modifiers: [
            {
                target: "damage.melee_one_handed",
                type: "bonus",
                value: 2,
                description: "+2 bonus to damage rolls with one-handed melee weapon"
            }
        ]
    },
    {
        id: "great-weapon-fighting",
        name: "Great Weapon Fighting",
        description: "When you roll a 1 or 2 on a damage die for an attack with a two-handed or versatile melee weapon, you can treat it as a 3."
    },
    {
        id: "protection",
        name: "Protection",
        description: "When a creature you can see attacks a target other than you within 5 feet of you, you can use your reaction to impose Disadvantage on the attack roll if you are wielding a shield.",
        modifiers: [
            {
                target: "actions.reaction",
                type: "grant_action",
                value: "Protection",
                description: "Impose Disadvantage on attack against adjacent ally (requires shield)"
            }
        ]
    },
    {
        id: "two-weapon-fighting",
        name: "Two-Weapon Fighting",
        description: "When you make the extra attack from dual wielding, you can add your ability modifier to the damage of that attack."
    },
    {
        id: "blessed-warrior",
        name: "Blessed Warrior",
        description: "You learn two Cleric cantrips of your choice (such as Sacred Flame and Guidance). Wisdom/Charisma is your spellcasting ability for them.",
        grantedSpells: [
            { name: "Sacred Flame", level: 0, source: "Blessed Warrior" },
            { name: "Guidance", level: 0, source: "Blessed Warrior" }
        ]
    },
    {
        id: "druidic-warrior",
        name: "Druidic Warrior",
        description: "You learn two Druid cantrips of your choice (such as Guidance and Starry Wisp). Wisdom is your spellcasting ability for them.",
        grantedSpells: [
            { name: "Guidance", level: 0, source: "Druidic Warrior" },
            { name: "Starry Wisp", level: 0, source: "Druidic Warrior" }
        ]
    },
    {
        id: "blind-fighting",
        name: "Blind Fighting",
        description: "You have blindsight with a range of 10 feet. Within that range, you can effectively see anything that isn't behind total cover.",
        modifiers: [
            {
                target: "vitals.blindsight",
                type: "set",
                value: "10 ft.",
                description: "Blindsight 10 ft."
            }
        ]
    },
    {
        id: "interception",
        name: "Interception",
        description: "When a creature within 5 feet of you takes damage from an attack, you can use your Reaction to reduce the damage by 1d10 + your Proficiency Bonus (requires a shield or simple/martial weapon).",
        modifiers: [
            {
                target: "actions.reaction",
                type: "grant_action",
                value: "Interception",
                description: "Reduce damage to adjacent ally by 1d10 + PB"
            }
        ]
    }
];

export const DIVINE_ORDERS: FeatureOption[] = [
    {
        id: "protector",
        name: "Protector",
        description: "You gain proficiency with Martial weapons and training with Heavy armor.",
        modifiers: [
            {
                target: "proficiencies.armor.heavy",
                type: "bonus",
                value: 1,
                description: "Training with Heavy armor"
            },
            {
                target: "proficiencies.weapons.martial",
                type: "bonus",
                value: 1,
                description: "Proficiency with Martial weapons"
            }
        ]
    },
    {
        id: "thaumaturge",
        name: "Thaumaturge",
        description: "You know one extra cantrip from the Cleric spell list, and you add your Wisdom modifier to your Intelligence (Arcana or Religion) checks.",
        grantedSpells: [
            {
                name: "Sacred Flame",
                level: 0,
                alwaysPrepared: true,
                ability: "wis",
                notes: "Extra Cleric cantrip"
            }
        ],
        modifiers: [
            {
                target: "spells.cantrips_known",
                type: "bonus",
                value: 1,
                description: "One extra Cleric cantrip"
            },
            {
                target: "skills.arcana",
                type: "ability_mod",
                abilitySource: "wis",
                description: "Add Wisdom modifier to Arcana checks"
            },
            {
                target: "skills.religion",
                type: "ability_mod",
                abilitySource: "wis",
                description: "Add Wisdom modifier to Religion checks"
            }
        ]
    }
];

export const PRIMAL_ORDERS: FeatureOption[] = [
    {
        id: "magician",
        name: "Magician",
        description: "You know one extra cantrip from the Druid spell list, and you add your Wisdom modifier to your Intelligence (Arcana or Nature) checks.",
        grantedSpells: [
            {
                name: "Druidcraft",
                level: 0,
                alwaysPrepared: true,
                ability: "wis",
                notes: "Extra Druid cantrip"
            }
        ],
        modifiers: [
            {
                target: "spells.cantrips_known",
                type: "bonus",
                value: 1,
                description: "One extra Druid cantrip"
            },
            {
                target: "skills.arcana",
                type: "ability_mod",
                abilitySource: "wis",
                description: "Add Wisdom modifier to Arcana checks"
            },
            {
                target: "skills.nature",
                type: "ability_mod",
                abilitySource: "wis",
                description: "Add Wisdom modifier to Nature checks"
            }
        ]
    },
    {
        id: "warden",
        name: "Warden",
        description: "You gain proficiency with Martial weapons and training with Medium armor.",
        modifiers: [
            {
                target: "proficiencies.armor.medium",
                type: "bonus",
                value: 1,
                description: "Training with Medium armor"
            },
            {
                target: "proficiencies.weapons.martial",
                type: "bonus",
                value: 1,
                description: "Proficiency with Martial weapons"
            }
        ]
    }
];

export const METAMAGIC_OPTIONS: FeatureOption[] = [
    {
        id: "careful-spell",
        name: "Careful Spell",
        description: "Cost: 1 Sorcery Point. Protect allies from area-of-effect spells: chosen creatures automatically succeed on saving throws against the spell."
    },
    {
        id: "distant-spell",
        name: "Distant Spell",
        description: "Cost: 1 Sorcery Point. Double the range of a spell of 5 feet or greater, or make a Touch spell have a range of 30 feet."
    },
    {
        id: "empowered-spell",
        name: "Empowered Spell",
        description: "Cost: 1 Sorcery Point. Reroll up to your Charisma modifier of damage dice on a spell, and you must use the new rolls."
    },
    {
        id: "extended-spell",
        name: "Extended Spell",
        description: "Cost: 1 Sorcery Point. Double the duration of a spell with a duration of 1 minute or longer, up to a maximum of 24 hours."
    },
    {
        id: "heightened-spell",
        name: "Heightened Spell",
        description: "Cost: 2 Sorcery Points. One target of the spell has Disadvantage on the first saving throw made against the spell."
    },
    {
        id: "quickened-spell",
        name: "Quickened Spell",
        description: "Cost: 2 Sorcery Points. Change the casting time of a 1-Action spell to 1 Bonus Action."
    },
    {
        id: "seeking-spell",
        name: "Seeking Spell",
        description: "Cost: 1 Sorcery Point. Reroll a missed spell attack roll to try hitting again."
    },
    {
        id: "subtle-spell",
        name: "Subtle Spell",
        description: "Cost: 1 Sorcery Point. Cast a spell without any verbal, somatic, or non-costly material components."
    },
    {
        id: "transmuted-spell",
        name: "Transmuted Spell",
        description: "Cost: 1 Sorcery Point. Change the damage type of a spell from acid, cold, fire, lightning, poison, or thunder to another of those types."
    },
    {
        id: "twinned-spell",
        name: "Twinned Spell",
        description: "Cost: 1-5 Sorcery Points (equal to spell level). Upcast a single-target spell to affect two targets simultaneously."
    }
];

export const ELDRITCH_INVOCATIONS: FeatureOption[] = [
    {
        id: "pact-of-the-blade",
        name: "Pact of the Blade",
        description: "Bonus action to conjure a pact melee weapon or bond with a weapon. You can use your Charisma modifier for attack and damage rolls.",
        modifiers: [
            {
                target: "attacks.melee_pact",
                type: "set",
                value: "cha",
                description: "Use Charisma modifier for attack and damage rolls with pact weapon"
            }
        ],
        grantedFeatures: [
            {
                name: "Pact of the Blade",
                type: "Class",
                source: "Eldritch Invocations",
                description: "Bonus action to conjure a pact melee weapon or bond with a weapon. You can use your Charisma modifier for attack and damage rolls."
            }
        ]
    },
    {
        id: "pact-of-the-tome",
        name: "Pact of the Tome",
        description: "Conjure a Book of Shadows granting three cantrips from any class list and two 1st-level ritual spells.",
        modifiers: [
            {
                target: "spells.cantrips_known",
                type: "bonus",
                value: 3,
                description: "Three cantrips from any class list"
            }
        ],
        grantedFeatures: [
            {
                name: "Pact of the Tome",
                type: "Class",
                source: "Eldritch Invocations",
                description: "Conjure a Book of Shadows granting three cantrips from any class list and two 1st-level ritual spells."
            }
        ]
    },
    {
        id: "pact-of-the-chain",
        name: "Pact of the Chain",
        description: "Cast Find Familiar as a ritual to summon an enhanced familiar (Imp, Quasit, Sprite, Pseudodragon, or Skeleton).",
        grantedSpells: [
            {
                name: "Find Familiar",
                level: 1,
                ritual: true,
                alwaysPrepared: true,
                notes: "Cast as ritual to summon enhanced familiar"
            }
        ]
    },
    {
        id: "agonizing-blast",
        name: "Agonizing Blast",
        description: "Prerequisite: Eldritch Blast cantrip. Add your Charisma modifier to the damage dealt by Eldritch Blast.",
        modifiers: [
            {
                target: "damage.cantrip_eldritch_blast",
                type: "ability_mod",
                abilitySource: "cha",
                description: "Add Charisma modifier to Eldritch Blast damage"
            }
        ]
    },
    {
        id: "armor-of-shadows",
        name: "Armor of Shadows",
        description: "You can cast Mage Armor on yourself at will, without expending a spell slot or material components.",
        grantedSpells: [
            {
                name: "Mage Armor",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast on self at will without expending a spell slot"
            }
        ]
    },
    {
        id: "devils-sight",
        name: "Devil's Sight",
        description: "You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet.",
        modifiers: [
            {
                target: "vitals.darkvision",
                type: "set",
                value: 120,
                description: "See normally in darkness, magical and nonmagical, to 120 feet"
            }
        ]
    },
    {
        id: "eldritch-mind",
        name: "Eldritch Mind",
        description: "You have Advantage on Constitution saving throws that you make to maintain concentration on a spell.",
        modifiers: [
            {
                target: "saves.concentration",
                type: "advantage",
                description: "Advantage on Constitution saving throws to maintain concentration"
            }
        ]
    },
    {
        id: "eldritch-spear",
        name: "Eldritch Spear",
        description: "Prerequisite: Eldritch Blast. The range of your Eldritch Blast increases to 300 feet.",
        modifiers: [
            {
                target: "spells.eldritch_blast_range",
                type: "set",
                value: "300 ft.",
                description: "Range of Eldritch Blast increases to 300 feet"
            }
        ]
    },
    {
        id: "fiendish-vigor",
        name: "Fiendish Vigor",
        description: "You can cast False Life on yourself at will as a 1st-level spell without expending a spell slot.",
        grantedSpells: [
            {
                name: "False Life",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast False Life on yourself at will without a spell slot"
            }
        ]
    },
    {
        id: "mask-of-many-faces",
        name: "Mask of Many Faces",
        description: "You can cast Disguise Self at will, without expending a spell slot.",
        grantedSpells: [
            {
                name: "Disguise Self",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Disguise Self at will without a spell slot"
            }
        ]
    },
    {
        id: "misty-visions",
        name: "Misty Visions",
        description: "You can cast Silent Image at will, without expending a spell slot or material components.",
        grantedSpells: [
            {
                name: "Silent Image",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Silent Image at will without a spell slot"
            }
        ]
    },
    {
        id: "repelling-blast",
        name: "Repelling Blast",
        description: "Prerequisite: Eldritch Blast. When you hit a creature with Eldritch Blast, you can push it up to 10 feet away from you in a straight line.",
        modifiers: [
            {
                target: "attacks.eldritch_blast_push",
                type: "set",
                value: "10 ft.",
                description: "Push target up to 10 feet away on hit with Eldritch Blast"
            }
        ]
    },
    {
        id: "thirsting-blade",
        name: "Thirsting Blade",
        description: "Prerequisite: Level 5, Pact of the Blade. You can attack twice instead of once whenever you take the Attack action on your turn with your pact weapon.",
        minLevel: 5,
        modifiers: [
            {
                target: "attacks.extra_attack",
                type: "bonus",
                value: 1,
                description: "Attack twice with pact weapon"
            }
        ]
    },
    {
        id: "lifedrinker",
        name: "Lifedrinker",
        description: "Prerequisite: Level 9, Pact of the Blade. Hit with pact weapon deals 1d6 extra Necrotic, Psychic, or Radiant damage, and you can expend a hit die to heal.",
        minLevel: 9,
        modifiers: [
            {
                target: "damage.pact_weapon",
                type: "bonus",
                value: "1d6",
                description: "Pact weapon deals 1d6 extra damage"
            }
        ]
    },
    {
        id: "whispers-of-the-grave",
        name: "Whispers of the Grave",
        description: "Prerequisite: Level 9. You can cast Speak with Dead at will, without expending a spell slot.",
        minLevel: 9,
        grantedSpells: [
            {
                name: "Speak with Dead",
                level: 3,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Speak with Dead at will without a spell slot"
            }
        ]
    },
    {
        id: "beguiling-influence",
        name: "Beguiling Influence",
        description: "You gain proficiency in the Deception and Persuasion skills.",
        modifiers: [
            { target: "skills.deception", type: "proficiency_tier", value: "proficient", description: "Proficiency in Deception" },
            { target: "skills.persuasion", type: "proficiency_tier", value: "proficient", description: "Proficiency in Persuasion" }
        ]
    },
    {
        id: "eyes-of-the-rune-keeper",
        name: "Eyes of the Rune Keeper",
        description: "You can read all writing, regardless of the script or language."
    },
    {
        id: "gaze-of-two-minds",
        name: "Gaze of Two Minds",
        description: "Prerequisite: Level 5. Use a Bonus Action to touch a willing humanoid and perceive through its senses until the end of your next turn. While perceiving, you can cast spells as though you were in its space.",
        minLevel: 5
    },
    {
        id: "beast-speech",
        name: "Beast Speech",
        description: "You can cast Speak with Animals at will, without expending a spell slot.",
        grantedSpells: [
            {
                name: "Speak with Animals",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Speak with Animals at will without a spell slot"
            }
        ]
    },
    {
        id: "lessons-of-the-first-ones",
        name: "Lessons of the First Ones",
        description: "Prerequisite: Level 2. You gain one Origin feat of your choice.",
        minLevel: 2
    },
    {
        id: "otherworldly-leap",
        name: "Otherworldly Leap",
        description: "Prerequisite: Level 2. You can cast Jump on yourself at will, without expending a spell slot.",
        minLevel: 2,
        grantedSpells: [
            {
                name: "Jump",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Jump on yourself at will without a spell slot"
            }
        ]
    },
    {
        id: "ascendant-step",
        name: "Ascendant Step",
        description: "Prerequisite: Level 5. You can cast Levitate on yourself at will, without expending a spell slot or material components.",
        minLevel: 5,
        grantedSpells: [
            {
                name: "Levitate",
                level: 2,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Levitate on yourself at will without a spell slot"
            }
        ]
    },
    {
        id: "eldritch-smite",
        name: "Eldritch Smite",
        description: "Prerequisite: Level 5, Pact of the Blade. Once per turn when you hit with your pact weapon, spend a pact slot to deal 1d8 force damage plus 1d8 per slot level, and knock target prone if Huge or smaller.",
        minLevel: 5
    },
    {
        id: "master-of-myriad-forms",
        name: "Master of Myriad Forms",
        description: "Prerequisite: Level 5. You can cast Alter Self at will, without expending a spell slot.",
        minLevel: 5,
        grantedSpells: [
            {
                name: "Alter Self",
                level: 2,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast Alter Self at will without a spell slot"
            }
        ]
    },
    {
        id: "one-with-shadows",
        name: "One with Shadows",
        description: "Prerequisite: Level 5. When you are in dim light or darkness, you can take a Magic action to become Invisible until you move or take an action or reaction.",
        minLevel: 5
    },
    {
        id: "witch-sight",
        name: "Witch Sight",
        description: "Prerequisite: Level 15. You can see the true form of any shapechanger or creature concealed by illusion or transmutation magic within 30 feet.",
        minLevel: 15
    }
];

export const BATTLE_MASTER_MANEUVERS: FeatureOption[] = [
    {
        id: "riposte",
        name: "Riposte",
        description: "When a creature misses you with a melee attack, use your Reaction to spend a superiority die to make a melee weapon attack against it; on hit, add the die to damage."
    },
    {
        id: "precision-attack",
        name: "Precision Attack",
        description: "When you make a weapon attack roll, you can spend a superiority die and add it to the attack roll before or after rolling."
    },
    {
        id: "menacing-attack",
        name: "Menacing Attack",
        description: "When you hit with a weapon attack, spend a superiority die to add damage and force a Wisdom saving throw; on a failure, the target is Frightened of you until the end of your next turn."
    },
    {
        id: "trip-attack",
        name: "Trip Attack",
        description: "When you hit with a weapon attack, spend a superiority die to add damage and force a Strength saving throw; on a failure, you knock the target Prone if it is Large or smaller."
    },
    {
        id: "disarming-attack",
        name: "Disarming Attack",
        description: "When you hit with a weapon attack, spend a superiority die to add damage and force a Strength saving throw; on a failure, the target drops one object of your choice it is holding."
    },
    {
        id: "rally",
        name: "Rally",
        description: "As a Bonus Action, spend a superiority die to bolster a friendly creature with temporary hit points equal to the die roll + your Charisma modifier."
    },
    {
        id: "ambush",
        name: "Ambush",
        description: "When you make a Dexterity (Stealth) check or an Initiative roll, you can expend one superiority die and add it to the roll."
    },
    {
        id: "bait-and-switch",
        name: "Bait and Switch",
        description: "When within 5 feet of a willing ally, spend a superiority die to swap places; both of you gain an AC bonus equal to the die roll until your next turn."
    }
];

export const DRUID_LAND_BIOMES: FeatureOption[] = [
    {
        id: "arid",
        name: "Arid (Desert / Plains)",
        description: "Affinity with scorched sands and blistering heat. Gain Fire Resistance and Land's Aid spells Blur and Fireball.",
        modifiers: [
            {
                target: "defenses.resistance",
                type: "set",
                value: "fire",
                description: "Fire Resistance"
            }
        ],
        grantedSpells: [
            { name: "Blur", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Arid)" },
            { name: "Fireball", level: 3, alwaysPrepared: true, notes: "Circle of the Land (Arid)" }
        ]
    },
    {
        id: "polar",
        name: "Polar (Tundra / Ice)",
        description: "Affinity with biting frost and deep glaciers. Gain Cold Resistance and Land's Aid spells Hold Person and Ice Storm.",
        modifiers: [
            {
                target: "defenses.resistance",
                type: "set",
                value: "cold",
                description: "Cold Resistance"
            }
        ],
        grantedSpells: [
            { name: "Hold Person", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Polar)" },
            { name: "Ice Storm", level: 4, alwaysPrepared: true, notes: "Circle of the Land (Polar)" }
        ]
    },
    {
        id: "temperate",
        name: "Temperate (Forest / Grassland)",
        description: "Affinity with lush woodlands and rolling hills. Gain Lightning/Poison affinity and Land's Aid spells Misty Step and Lightning Bolt.",
        modifiers: [
            {
                target: "defenses.resistance",
                type: "set",
                value: "lightning",
                description: "Lightning Resistance"
            }
        ],
        grantedSpells: [
            { name: "Misty Step", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Temperate)" },
            { name: "Lightning Bolt", level: 3, alwaysPrepared: true, notes: "Circle of the Land (Temperate)" }
        ]
    },
    {
        id: "tropical",
        name: "Tropical (Rainforest / Swamp)",
        description: "Affinity with humid jungles and toxic fens. Gain Poison Resistance and Land's Aid spells Web and Polymorph.",
        modifiers: [
            {
                target: "defenses.resistance",
                type: "set",
                value: "poison",
                description: "Poison Resistance"
            }
        ],
        grantedSpells: [
            { name: "Web", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Tropical)" },
            { name: "Polymorph", level: 4, alwaysPrepared: true, notes: "Circle of the Land (Tropical)" }
        ]
    }
];

export const ELEMENTAL_FURY_OPTIONS: FeatureOption[] = [
    {
        id: "primal-strike",
        name: "Primal Strike",
        description: "Once on each of your turns when you hit with a weapon attack or a Beast attack in Wild Shape, deal an extra 1d8 Cold, Fire, Lightning, or Thunder damage."
    },
    {
        id: "potent-spellcasting",
        name: "Potent Spellcasting",
        description: "Add your Wisdom modifier to the damage you deal with any Druid cantrip."
    }
];

export const BLESSED_STRIKES_OPTIONS: FeatureOption[] = [
    {
        id: "divine-strike",
        name: "Divine Strike",
        description: "Once on each of your turns when you hit a creature with a weapon attack, cause the attack to deal an extra 1d8 Radiant or Necrotic damage."
    },
    {
        id: "potent-spellcasting",
        name: "Potent Spellcasting",
        description: "Add your Wisdom modifier to the damage you deal with any Cleric cantrip."
    }
];

export const BARBARIAN_ASPECTS: FeatureOption[] = [
    {
        id: "elephant",
        name: "Aspect of the Elephant",
        description: "You gain Advantage on Athletics checks and your carrying capacity is doubled.",
        modifiers: [
            {
                target: "skills.athletics",
                type: "advantage",
                description: "Advantage on Athletics checks"
            },
            {
                target: "vitals.carrying_capacity",
                type: "multiplier",
                value: 2,
                description: "Carrying capacity is doubled"
            }
        ]
    },
    {
        id: "owl",
        name: "Aspect of the Owl",
        description: "You gain Darkvision with a range of 60 feet (or extend it by 60 feet) and gain Advantage on Perception checks.",
        modifiers: [
            {
                target: "vitals.darkvision",
                type: "bonus",
                value: 60,
                description: "Darkvision +60 ft."
            },
            {
                target: "skills.perception",
                type: "advantage",
                description: "Advantage on Perception checks"
            }
        ]
    },
    {
        id: "spider",
        name: "Aspect of the Spider",
        description: "You gain a Climbing Speed equal to your Walking Speed, and can climb difficult surfaces without making an ability check.",
        modifiers: [
            {
                target: "speeds.climb",
                type: "set",
                value: "equal_walk",
                description: "Climbing speed equal to walking speed"
            }
        ]
    },
    {
        id: "wolf",
        name: "Aspect of the Wolf",
        description: "You can track other creatures while traveling at a fast pace, and you can move stealthily at a normal pace.",
        grantedFeatures: [
            {
                name: "Aspect of the Wolf",
                type: "Class",
                description: "Track at fast pace and move stealthily at normal pace"
            }
        ]
    }
];

export const HUNTER_DEFENSIVE_TACTICS: FeatureOption[] = [
    {
        id: "escape-the-horde",
        name: "Escape the Horde",
        description: "Opportunity attacks made against you have Disadvantage.",
        modifiers: [
            {
                target: "attacks.incoming_opportunity",
                type: "disadvantage",
                description: "Opportunity attacks against you have Disadvantage"
            }
        ]
    },
    {
        id: "multiattack-defense",
        name: "Multiattack Defense",
        description: "When a creature hits you with an attack roll, that creature has Disadvantage on all other attack rolls against you for the rest of the turn.",
        modifiers: [
            {
                target: "attacks.incoming_consecutive",
                type: "disadvantage",
                description: "Disadvantage on consecutive attack rolls against you this turn"
            }
        ]
    }
];

export const WILD_HEART_RAGES: FeatureOption[] = [
    {
        id: "bear",
        name: "Bear Heart",
        description: "While raging, you have resistance to all damage types except Psychic damage.",
        modifiers: [
            {
                target: "defenses.resistance",
                type: "set",
                value: "all-except-psychic",
                condition: "while raging",
                description: "Resistance to all damage types except psychic while raging"
            }
        ]
    },
    {
        id: "eagle",
        name: "Eagle Heart",
        description: "While raging, you can take the Dash and Disengage actions as a Bonus Action on your turn, and opportunity attacks against you have Disadvantage.",
        modifiers: [
            {
                target: "actions.bonus",
                type: "grant_action",
                value: "Dash / Disengage",
                condition: "while raging",
                description: "Dash and Disengage as Bonus Action while raging"
            }
        ]
    },
    {
        id: "wolf",
        name: "Wolf Heart",
        description: "While raging, your allies have Advantage on melee attack rolls against any enemy within 5 feet of you.",
        modifiers: [
            {
                target: "attacks.allies_melee",
                type: "advantage",
                condition: "while raging",
                description: "Allies have Advantage on melee attack rolls against adjacent enemies while raging"
            }
        ]
    }
];

export const WILD_HEART_TOTEMIC_ATTUNEMENTS: FeatureOption[] = [
    {
        id: "falcon",
        name: "Falcon",
        description: "While raging, you gain a Flying Speed equal to your Walking Speed if you aren't wearing armor."
    },
    {
        id: "lion",
        name: "Lion",
        description: "While raging, whenever an enemy within 5 feet of you makes an attack against a target other than you, you can use your Reaction to make a melee attack roll against that enemy."
    },
    {
        id: "ram",
        name: "Ram",
        description: "While raging, whenever you hit a Large or smaller creature with a melee weapon attack on your turn, you can knock the creature Prone."
    }
];

export const ZEALOT_DIVINE_FURIES: FeatureOption[] = [
    {
        id: "radiant",
        name: "Radiant Fury",
        description: "The first creature you hit on each of your turns with a weapon attack takes extra damage equal to 1d6 + half your Barbarian level as Radiant damage."
    },
    {
        id: "necrotic",
        name: "Necrotic Fury",
        description: "The first creature you hit on each of your turns with a weapon attack takes extra damage equal to 1d6 + half your Barbarian level as Necrotic damage."
    }
];

export const BRUTAL_STRIKE_OPTIONS: FeatureOption[] = [
    {
        id: "forceful-blow",
        name: "Forceful Blow",
        description: "The target is pushed up to 15 feet straight away from you, and you can move up to half your walking speed toward it without provoking opportunity attacks."
    },
    {
        id: "hamstring-blow",
        name: "Hamstring Blow",
        description: "The target's speed is reduced by 15 feet until the start of your next turn."
    }
];

export const TACTICAL_MASTER_PROPERTIES: FeatureOption[] = [
    {
        id: "push",
        name: "Push",
        description: "You can push a target you hit up to 10 feet away from you (substituting for weapon's mastery property)."
    },
    {
        id: "sap",
        name: "Sap",
        description: "The target has Disadvantage on its next attack roll before the start of your next turn."
    },
    {
        id: "slow",
        name: "Slow",
        description: "The target's speed is reduced by 10 feet until the start of your next turn."
    }
];

export const ELEMENTS_ATTUNEMENT_DAMAGE_TYPES: FeatureOption[] = [
    {
        id: "acid",
        name: "Acid Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Acid damage."
    },
    {
        id: "cold",
        name: "Cold Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Cold damage."
    },
    {
        id: "fire",
        name: "Fire Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Fire damage."
    },
    {
        id: "lightning",
        name: "Lightning Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Lightning damage."
    },
    {
        id: "thunder",
        name: "Thunder Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Thunder damage."
    }
];

export const HUNTER_PREY_OPTIONS: FeatureOption[] = [
    {
        id: "colossus-slayer",
        name: "Colossus Slayer",
        description: "Once per turn when you hit a creature with a weapon attack, it takes an extra 1d8 damage if it's below its maximum hit points."
    },
    {
        id: "horde-breaker",
        name: "Horde Breaker",
        description: "Once on each of your turns when you make a weapon attack, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target."
    }
];

export const PRIMAL_COMPANION_TYPES: FeatureOption[] = [
    {
        id: "land",
        name: "Beast of the Land",
        description: "A medium predatory beast with Maul (charge damage and knockdown prone) and 40 ft. walking + 40 ft. climbing speed."
    },
    {
        id: "sea",
        name: "Beast of the Sea",
        description: "An amphibious beast with Binding Strike (grapples on hit) and 60 ft. swimming speed + water breathing."
    },
    {
        id: "sky",
        name: "Beast of the Sky",
        description: "A small flying avian beast with Flyby and 60 ft. flying speed for scouting and aerial strikes."
    }
];

export const ROGUE_CUNNING_STRIKES: FeatureOption[] = [
    {
        id: "poison",
        name: "Poison (Cost: 1d6)",
        description: "The target must succeed on a Con saving throw or be Poisoned for 1 minute."
    },
    {
        id: "trip",
        name: "Trip (Cost: 1d6)",
        description: "If the target is Large or smaller, it must succeed on a Dex saving throw or fall Prone."
    },
    {
        id: "withdraw",
        name: "Withdraw (Cost: 1d6)",
        description: "Immediately after the attack, you can move up to half your walking speed without provoking opportunity attacks."
    }
];

export const ROGUE_DEVIOUS_STRIKES: FeatureOption[] = [
    {
        id: "daze",
        name: "Daze (Cost: 2d6)",
        description: "The target must succeed on a Con saving throw or can only take an action or bonus action on its next turn."
    },
    {
        id: "knock-out",
        name: "Knock Out (Cost: 6d6)",
        description: "The target must succeed on a Con saving throw or fall Unconscious for 1 minute or until it takes damage."
    },
    {
        id: "obscure",
        name: "Obscure (Cost: 3d6)",
        description: "The target is blinded until the end of its next turn unless it succeeds on a Dex saving throw."
    }
];

export const DRACONIC_ANCESTOR_ELEMENTS: FeatureOption[] = [
    { id: "black", name: "Black (Acid)", description: "Dragon ancestor attuned to Acid. Resistance to Acid at level 6 and bonus damage with acid spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid", description: "Acid Resistance" }] },
    { id: "blue", name: "Blue (Lightning)", description: "Dragon ancestor attuned to Lightning. Resistance to Lightning at level 6 and bonus damage with lightning spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Lightning Resistance" }] },
    { id: "brass", name: "Brass (Fire)", description: "Dragon ancestor attuned to Fire. Resistance to Fire at level 6 and bonus damage with fire spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Fire Resistance" }] },
    { id: "bronze", name: "Bronze (Lightning)", description: "Dragon ancestor attuned to Lightning. Resistance to Lightning at level 6 and bonus damage with lightning spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Lightning Resistance" }] },
    { id: "copper", name: "Copper (Acid)", description: "Dragon ancestor attuned to Acid. Resistance to Acid at level 6 and bonus damage with acid spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid", description: "Acid Resistance" }] },
    { id: "gold", name: "Gold (Fire)", description: "Dragon ancestor attuned to Fire. Resistance to Fire at level 6 and bonus damage with fire spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Fire Resistance" }] },
    { id: "green", name: "Green (Poison)", description: "Dragon ancestor attuned to Poison. Resistance to Poison at level 6 and bonus damage with poison spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "poison", description: "Poison Resistance" }] },
    { id: "red", name: "Red (Fire)", description: "Dragon ancestor attuned to Fire. Resistance to Fire at level 6 and bonus damage with fire spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Fire Resistance" }] },
    { id: "silver", name: "Silver (Cold)", description: "Dragon ancestor attuned to Cold. Resistance to Cold at level 6 and bonus damage with cold spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Cold Resistance" }] },
    { id: "white", name: "White (Cold)", description: "Dragon ancestor attuned to Cold. Resistance to Cold at level 6 and bonus damage with cold spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Cold Resistance" }] }
];

export const FIENDISH_RESILIENCE_DAMAGE_TYPES: FeatureOption[] = [
    { id: "acid", name: "Acid", description: "Gain resistance to Acid damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid", description: "Acid Resistance" }] },
    { id: "bludgeoning", name: "Bludgeoning", description: "Gain resistance to Bludgeoning damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "bludgeoning", description: "Bludgeoning Resistance" }] },
    { id: "cold", name: "Cold", description: "Gain resistance to Cold damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Cold Resistance" }] },
    { id: "fire", name: "Fire", description: "Gain resistance to Fire damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Fire Resistance" }] },
    { id: "force", name: "Force", description: "Gain resistance to Force damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "force", description: "Force Resistance" }] },
    { id: "lightning", name: "Lightning", description: "Gain resistance to Lightning damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Lightning Resistance" }] },
    { id: "necrotic", name: "Necrotic", description: "Gain resistance to Necrotic damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "necrotic", description: "Necrotic Resistance" }] },
    { id: "piercing", name: "Piercing", description: "Gain resistance to Piercing damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "piercing", description: "Piercing Resistance" }] },
    { id: "poison", name: "Poison", description: "Gain resistance to Poison damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "poison", description: "Poison Resistance" }] },
    { id: "psychic", name: "Psychic", description: "Gain resistance to Psychic damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "psychic", description: "Psychic Resistance" }] },
    { id: "radiant", name: "Radiant", description: "Gain resistance to Radiant damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "radiant", description: "Radiant Resistance" }] },
    { id: "slashing", name: "Slashing", description: "Gain resistance to Slashing damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "slashing", description: "Slashing Resistance" }] },
    { id: "thunder", name: "Thunder", description: "Gain resistance to Thunder damage until you finish a Short or Long Rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "thunder", description: "Thunder Resistance" }] }
];

export const WIZARD_SCHOLAR_SKILLS: FeatureOption[] = [
    { id: "arcana", name: "Arcana (Expertise)", description: "Double proficiency bonus on Intelligence (Arcana) checks.", modifiers: [{ target: "skills.arcana", type: "proficiency_tier", value: "expertise", description: "Expertise in Arcana" }] },
    { id: "history", name: "History (Expertise)", description: "Double proficiency bonus on Intelligence (History) checks.", modifiers: [{ target: "skills.history", type: "proficiency_tier", value: "expertise", description: "Expertise in History" }] },
    { id: "investigation", name: "Investigation (Expertise)", description: "Double proficiency bonus on Intelligence (Investigation) checks.", modifiers: [{ target: "skills.investigation", type: "proficiency_tier", value: "expertise", description: "Expertise in Investigation" }] },
    { id: "medicine", name: "Medicine (Expertise)", description: "Double proficiency bonus on Wisdom (Medicine) checks.", modifiers: [{ target: "skills.medicine", type: "proficiency_tier", value: "expertise", description: "Expertise in Medicine" }] },
    { id: "nature", name: "Nature (Expertise)", description: "Double proficiency bonus on Intelligence (Nature) checks.", modifiers: [{ target: "skills.nature", type: "proficiency_tier", value: "expertise", description: "Expertise in Nature" }] },
    { id: "religion", name: "Religion (Expertise)", description: "Double proficiency bonus on Intelligence (Religion) checks.", modifiers: [{ target: "skills.religion", type: "proficiency_tier", value: "expertise", description: "Expertise in Religion" }] }
];

export const STARRY_FORM_CONSTELLATIONS: FeatureOption[] = [
    {
        id: "archer",
        name: "Archer",
        description: "Bonus Action to make a ranged spell attack (60 ft.) dealing 1d8 + Wisdom modifier Radiant damage."
    },
    {
        id: "chalice",
        name: "Chalice",
        description: "Whenever you cast a spell that restores HP using a spell slot, you or another creature within 30 ft. regains 1d8 + Wisdom modifier HP."
    },
    {
        id: "dragon",
        name: "Dragon",
        description: "When you make an Intelligence or Wisdom check, or a Constitution save to maintain Concentration, treat a d20 roll of 9 or lower as a 10."
    }
];

export const SEA_WRATH_DAMAGE_TYPES: FeatureOption[] = [
    {
        id: "cold",
        name: "Cold Wrath",
        description: "Your Wrath of the Sea storm aura deals Cold damage to creatures in the tempest."
    },
    {
        id: "thunder",
        name: "Thunder Wrath",
        description: "Your Wrath of the Sea storm aura deals Thunder damage and repels enemies in the tempest."
    }
];

export const MOON_CIRCLE_FORMS_STRIKES: FeatureOption[] = [
    {
        id: "radiant",
        name: "Radiant Strike",
        description: "While transformed in Wild Shape, your beast natural attacks deal Radiant damage instead of normal physical damage."
    },
    {
        id: "physical",
        name: "Natural Physical Strike",
        description: "While transformed in Wild Shape, your beast natural attacks deal their standard Bludgeoning, Piercing, or Slashing damage."
    }
];

export const DIVINER_THIRD_EYE_OPTIONS: FeatureOption[] = [
    {
        id: "darkvision",
        name: "Darkvision",
        description: "You gain Darkvision out to a range of 60 feet until your next Short or Long Rest."
    },
    {
        id: "ethereal-sight",
        name: "Ethereal Sight",
        description: "You can see into the Ethereal Plane within 60 feet of you until your next Short or Long Rest."
    },
    {
        id: "greater-comprehension",
        name: "Greater Comprehension",
        description: "You can read any language until your next Short or Long Rest."
    },
    {
        id: "see-invisibility",
        name: "See Invisibility",
        description: "You can see invisible creatures and objects within 10 feet of you that are in line of sight until your next Short or Long Rest."
    }
];

export const CHAMPION_ADDITIONAL_FIGHTING_STYLES: FeatureOption[] = [
    {
        id: "archery",
        name: "Archery",
        description: "+2 bonus to attack rolls made with ranged weapons.",
        modifiers: [
            {
                target: "attacks.ranged",
                type: "bonus",
                value: 2,
                description: "+2 bonus to attack rolls with ranged weapons"
            }
        ]
    },
    {
        id: "defense",
        name: "Defense",
        description: "While wearing armor, gain a +1 bonus to Armor Class.",
        modifiers: [
            {
                target: "vitals.ac",
                type: "bonus",
                value: 1,
                condition: "wearing armor",
                description: "+1 bonus to Armor Class"
            }
        ]
    },
    {
        id: "dueling",
        name: "Dueling",
        description: "+2 bonus to damage rolls when wielding a melee weapon in one hand.",
        modifiers: [
            {
                target: "damage.melee_one_handed",
                type: "bonus",
                value: 2,
                description: "+2 bonus to damage rolls with one-handed melee weapon"
            }
        ]
    },
    {
        id: "great-weapon",
        name: "Great Weapon Fighting",
        description: "Treat rolls of 1 or 2 on damage dice for two-handed weapons as 3."
    },
    {
        id: "protection",
        name: "Protection",
        description: "Reaction with shield to impose disadvantage on an attack against an adjacent ally.",
        modifiers: [
            {
                target: "actions.reaction",
                type: "grant_action",
                value: "Protection",
                description: "Impose Disadvantage on attack against adjacent ally (requires shield)"
            }
        ]
    },
    {
        id: "two-weapon",
        name: "Two-Weapon Fighting",
        description: "Add ability modifier to the damage of off-hand attacks."
    },
    {
        id: "blessed-warrior",
        name: "Blessed Warrior",
        description: "Learn two Cleric cantrips. They count as Paladin spells for you, and Charisma is your spellcasting ability for them."
    },
    {
        id: "druidic-warrior",
        name: "Druidic Warrior",
        description: "Learn two Druid cantrips. They count as Ranger spells for you, and Wisdom is your spellcasting ability for them."
    }
];

export const STUDENT_OF_WAR_SKILLS: FeatureOption[] = [
    { id: "History", name: "History", description: "Gain proficiency in the Intelligence (History) skill.", modifiers: [{ target: "skills.history", type: "proficiency_tier", value: "proficient", description: "Proficiency in History" }] },
    { id: "Insight", name: "Insight", description: "Gain proficiency in the Wisdom (Insight) skill.", modifiers: [{ target: "skills.insight", type: "proficiency_tier", value: "proficient", description: "Proficiency in Insight" }] },
    { id: "Medicine", name: "Medicine", description: "Gain proficiency in the Wisdom (Medicine) skill.", modifiers: [{ target: "skills.medicine", type: "proficiency_tier", value: "proficient", description: "Proficiency in Medicine" }] },
    { id: "Performance", name: "Performance", description: "Gain proficiency in the Charisma (Performance) skill.", modifiers: [{ target: "skills.performance", type: "proficiency_tier", value: "proficient", description: "Proficiency in Performance" }] },
    { id: "Persuasion", name: "Persuasion", description: "Gain proficiency in the Charisma (Persuasion) skill.", modifiers: [{ target: "skills.persuasion", type: "proficiency_tier", value: "proficient", description: "Proficiency in Persuasion" }] }
];

export const PSI_WARRIOR_THRUST_OPTIONS: FeatureOption[] = [
    {
        id: "push",
        name: "Telekinetic Push",
        description: "Push the target up to 10 feet horizontally away from you on a failed Strength save."
    },
    {
        id: "topple",
        name: "Telekinetic Topple",
        description: "Knock the target Prone on a failed Strength save."
    }
];

export const BATTERING_ROOTS_OPTIONS: FeatureOption[] = [
    {
        id: "push",
        name: "Battering Push",
        description: "Push the target up to 10 feet away from you on hit."
    },
    {
        id: "topple",
        name: "Battering Topple",
        description: "Knock the target Prone on hit on a failed Strength save."
    }
];

export const IMPROVED_BRUTAL_STRIKE_OPTIONS: FeatureOption[] = [
    {
        id: "staggering-blow",
        name: "Staggering Blow",
        description: "Target has Disadvantage on saving throws and cannot make Opportunity Attacks until start of your next turn."
    },
    {
        id: "sundering-blow",
        name: "Sundering Blow",
        description: "The next attack roll made against the target by an ally has a +5 bonus."
    }
];

export const OPEN_HAND_TECHNIQUES: FeatureOption[] = [
    {
        id: "addle",
        name: "Addle",
        description: "Target cannot make Opportunity Attacks or take Reactions until the start of its next turn."
    },
    {
        id: "push",
        name: "Push",
        description: "Target must succeed on a Strength saving throw or be pushed up to 15 feet away from you."
    },
    {
        id: "topple",
        name: "Topple",
        description: "Target must succeed on a Dexterity saving throw or fall Prone."
    }
];

export const WAR_GOD_BLESSING_OPTIONS: FeatureOption[] = [
    {
        id: "shield-of-faith",
        name: "Shield of Faith",
        description: "Channel Divinity to cast Shield of Faith without expending a spell slot."
    },
    {
        id: "spiritual-weapon",
        name: "Spiritual Weapon",
        description: "Channel Divinity to cast Spiritual Weapon without expending a spell slot."
    }
];

export const STEPS_OF_THE_FEY_OPTIONS: FeatureOption[] = [
    {
        id: "taunting-step",
        name: "Taunting Step",
        description: "Creatures within 5 ft. of your origin space have Disadvantage on attack rolls against anyone but you."
    },
    {
        id: "refreshing-step",
        name: "Refreshing Step",
        description: "You or an ally within 10 ft. of your destination space gains temporary hit points equal to 1d10 + Charisma modifier."
    }
];

export const FEY_WANDERER_GLAMOUR_SKILLS: FeatureOption[] = [
    { id: "Deception", name: "Deception", description: "Gain proficiency in the Charisma (Deception) skill.", modifiers: [{ target: "skills.deception", type: "proficiency_tier", value: "proficient", description: "Proficiency in Deception" }] },
    { id: "Performance", name: "Performance", description: "Gain proficiency in the Charisma (Performance) skill.", modifiers: [{ target: "skills.performance", type: "proficiency_tier", value: "proficient", description: "Proficiency in Performance" }] },
    { id: "Persuasion", name: "Persuasion", description: "Gain proficiency in the Charisma (Persuasion) skill.", modifiers: [{ target: "skills.persuasion", type: "proficiency_tier", value: "proficient", description: "Proficiency in Persuasion" }] }
];

export const HUNTER_SUPERIOR_DEFENSE_OPTIONS: FeatureOption[] = [
    {
        id: "evasion",
        name: "Evasion",
        description: "When subjected to an effect that allows a Dexterity saving throw for half damage, take no damage on success and half on failure."
    },
    {
        id: "uncanny-dodge",
        name: "Uncanny Dodge",
        description: "Reaction when hit by an attacker you can see to halve the attack's damage against you."
    }
];

export const ABERRANT_REVELATION_OPTIONS: FeatureOption[] = [
    {
        id: "flight",
        name: "Aquatic / Aerial Flight",
        description: "Gain a flying speed and swimming speed equal to your walking speed and hover."
    },
    {
        id: "see-invis",
        name: "See Invisibility",
        description: "You can see invisible creatures within 60 feet that aren't in total cover."
    },
    {
        id: "viscous-body",
        name: "Viscous Body",
        description: "Escape grapples easily and squeeze through spaces as narrow as 1 inch without squeezing penalties."
    }
];

const OPTION_REGISTRY: Record<string, FeatureOption[]> = {
    "fighting-style": FIGHTING_STYLES,
    "fightingstyle": FIGHTING_STYLES,
    "divine-order": DIVINE_ORDERS,
    "divineorder": DIVINE_ORDERS,
    "primal-order": PRIMAL_ORDERS,
    "primalorder": PRIMAL_ORDERS,
    "invocation": ELDRITCH_INVOCATIONS,
    "invocations": ELDRITCH_INVOCATIONS,
    "eldritch-invocation": ELDRITCH_INVOCATIONS,
    "pact-boon": ELDRITCH_INVOCATIONS,
    "metamagic": METAMAGIC_OPTIONS,
    "maneuver": BATTLE_MASTER_MANEUVERS,
    "maneuvers": BATTLE_MASTER_MANEUVERS,
    "battle-master-maneuver": BATTLE_MASTER_MANEUVERS,
    "fighter-3-battle-master-maneuvers": BATTLE_MASTER_MANEUVERS,
    "fighter-3-battle-master-student": STUDENT_OF_WAR_SKILLS,
    "fighter-7-champion": CHAMPION_ADDITIONAL_FIGHTING_STYLES,
    "fighter-9-tactical-master": TACTICAL_MASTER_PROPERTIES,
    "land-biome": DRUID_LAND_BIOMES,
    "druid-3-circle-of-the-land-biome": DRUID_LAND_BIOMES,
    "druid-3-stars": STARRY_FORM_CONSTELLATIONS,
    "druid-3-sea": SEA_WRATH_DAMAGE_TYPES,
    "druid-3-moon": MOON_CIRCLE_FORMS_STRIKES,
    "elemental-fury": ELEMENTAL_FURY_OPTIONS,
    "druid-7": ELEMENTAL_FURY_OPTIONS,
    "blessed-strikes": BLESSED_STRIKES_OPTIONS,
    "cleric-7": BLESSED_STRIKES_OPTIONS,
    "cleric-8-blessed-strikes": BLESSED_STRIKES_OPTIONS,
    "cleric-6-war": WAR_GOD_BLESSING_OPTIONS,
    "aspect": BARBARIAN_ASPECTS,
    "barbarian-aspect": BARBARIAN_ASPECTS,
    "barbarian-3-wild-heart": WILD_HEART_RAGES,
    "barbarian-6-wild-heart": BARBARIAN_ASPECTS,
    "barbarian-14-wild-heart": WILD_HEART_TOTEMIC_ATTUNEMENTS,
    "barbarian-3-zealot": ZEALOT_DIVINE_FURIES,
    "barbarian-9-brutal-strike": BRUTAL_STRIKE_OPTIONS,
    "barbarian-13-brutal-strike": IMPROVED_BRUTAL_STRIKE_OPTIONS,
    "defensive-tactic": HUNTER_DEFENSIVE_TACTICS,
    "wild-heart-rage": WILD_HEART_RAGES,
    "totemic-attunement": WILD_HEART_TOTEMIC_ATTUNEMENTS,
    "divine-fury": ZEALOT_DIVINE_FURIES,
    "brutal-strike": BRUTAL_STRIKE_OPTIONS,
    "tactical-master": TACTICAL_MASTER_PROPERTIES,
    "elemental-attunement": ELEMENTS_ATTUNEMENT_DAMAGE_TYPES,
    "hunter-prey": HUNTER_PREY_OPTIONS,
    "ranger-3-hunter": HUNTER_PREY_OPTIONS,
    "ranger-3-beast-master": PRIMAL_COMPANION_TYPES,
    "ranger-3-fey-wanderer": FEY_WANDERER_GLAMOUR_SKILLS,
    "ranger-6-hunter": HUNTER_DEFENSIVE_TACTICS,
    "ranger-15-hunter": HUNTER_SUPERIOR_DEFENSE_OPTIONS,
    "primal-companion": PRIMAL_COMPANION_TYPES,
    "draconic-ancestor": DRACONIC_ANCESTOR_ELEMENTS,
    "sorcerer-3-draconic": DRACONIC_ANCESTOR_ELEMENTS,
    "sorcerer-14-aberrant": ABERRANT_REVELATION_OPTIONS,
    "fiendish-resilience": FIENDISH_RESILIENCE_DAMAGE_TYPES,
    "warlock-10-fiend": FIENDISH_RESILIENCE_DAMAGE_TYPES,
    "wizard-scholar": WIZARD_SCHOLAR_SKILLS,
    "wizard-2-scholar": WIZARD_SCHOLAR_SKILLS,
    "student-of-war": STUDENT_OF_WAR_SKILLS,
    "fey-wanderer-glamour": FEY_WANDERER_GLAMOUR_SKILLS,
    "starry-form": STARRY_FORM_CONSTELLATIONS,
    "open-hand-technique": OPEN_HAND_TECHNIQUES,
    "monk-3-open-hand": OPEN_HAND_TECHNIQUES,
    "monk-3-elements": ELEMENTS_ATTUNEMENT_DAMAGE_TYPES,
    "war-god-blessing": WAR_GOD_BLESSING_OPTIONS,
    "steps-of-the-fey": STEPS_OF_THE_FEY_OPTIONS,
    "hunter-superior-defense": HUNTER_SUPERIOR_DEFENSE_OPTIONS,
    "aberrant-revelation": ABERRANT_REVELATION_OPTIONS,
    "rogue-5-cunning-strike": ROGUE_CUNNING_STRIKES,
    "rogue-14-devious-strike": ROGUE_DEVIOUS_STRIKES
};

export function registerClassOption(kind: string, options: FeatureOption[]): void {
    if (!kind || !Array.isArray(options)) return;
    OPTION_REGISTRY[kind.toLowerCase().trim()] = options;
}

export function findClassOption(kind: string, optId: string, customOptions?: FeatureOption[]): FeatureOption | undefined {
    let targetKind = kind;
    let targetId = optId;

    if (!targetId && targetKind && targetKind.includes(":")) {
        const parts = targetKind.split(":");
        targetKind = parts[0];
        targetId = parts[1];
    } else if (targetId && targetId.includes(":")) {
        const parts = targetId.split(":");
        if (!targetKind) targetKind = parts[0];
        targetId = parts[1];
    }

    if (!targetId) return undefined;

    const normKind = (targetKind || "").toLowerCase().trim();
    const normId = targetId.toLowerCase().trim();

    if (Array.isArray(customOptions)) {
        const match = customOptions.find(o =>
            o.id.toLowerCase() === normId ||
            o.id.toLowerCase().endsWith(`-${normId}`) ||
            o.id.toLowerCase() === `pact-of-the-${normId}`
        );
        if (match) return match;
    }

    const list = OPTION_REGISTRY[normKind];
    if (list) {
        const found = list.find(o =>
            o.id.toLowerCase() === normId ||
            o.id.toLowerCase().endsWith(`-${normId}`) ||
            o.id.toLowerCase() === `pact-of-the-${normId}`
        );
        if (found) return found;
    }
    // Fallback: search all registries
    for (const options of Object.values(OPTION_REGISTRY)) {
        const match = options.find(o =>
            o.id.toLowerCase() === normId ||
            o.id.toLowerCase().endsWith(`-${normId}`) ||
            o.id.toLowerCase() === `pact-of-the-${normId}`
        );
        if (match) return match;
    }
    return undefined;
}
