export type AbilityName = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type ModifierTarget =
    | "vitals.ac"
    | "vitals.maxHp"
    | "vitals.initiative"
    | "vitals.speed"
    | "vitals.blindsight"
    | "vitals.darkvision"
    | "abilities.str"
    | "abilities.dex"
    | "abilities.con"
    | "abilities.int"
    | "abilities.wis"
    | "abilities.cha"
    | "saves.all"
    | `saves.${AbilityName}`
    | `skills.${string}`
    | `defenses.resistance`
    | `defenses.immunity`
    | "attacks.melee"
    | "attacks.ranged"
    | "attacks.spell"
    | "damage.melee"
    | "damage.ranged"
    | "spells.saveDc"
    | "spells.attackBonus"
    | "spells.grant"
    | "spells.alwaysPrepared"
    | "spells.atWill"
    | "features.grant"
    | "proficiencies.armor"
    | "proficiencies.weapons"
    | "proficiencies.tools"
    | "proficiencies.languages"
    | "weaponMasteryCount"
    | "resources.pool"
    | string;

export type ModifierType =
    | "bonus"            // +[number] (e.g. +1 AC, +2 attack)
    | "penalty"          // -[number]
    | "advantage"        // Grants Advantage
    | "disadvantage"     // Grants/imposes Disadvantage
    | "set"              // Sets an absolute value (e.g. blindsight = "10 ft.")
    | "proficiency_tier" // "proficient" | "expertise"
    | "ability_mod"      // Adds another ability modifier (e.g. add WIS to Arcana)
    | "resource_pool"    // Adds/modifies a class resource pool
    | "grant_action"     // Injects an action/bonus action/reaction
    | "grant_spell"      // Grants a specific spell or cantrip
    | "grant_feature";   // Grants a specific feature or trait

export interface StatModifier {
    target: ModifierTarget;
    type: ModifierType;
    value?: number | string;
    abilitySource?: AbilityName;
    condition?: string;
    description?: string;
}

export interface ProgressionGrantedSpell {
    id?: string;
    name: string;
    level?: number;                    // 0 for cantrip, 1-9 for leveled spells
    alwaysPrepared?: boolean;          // Always prepared, does not count against prepared spell limits
    atWill?: boolean;                  // Cast at will without expending a spell slot
    usage?: {
        count?: number;
        resetOn?: "short" | "long" | "at_will";
    };
    ability?: AbilityName;             // Fixed casting ability if specified
    notes?: string;                    // Usage notes or restrictions
    source?: string;                   // E.g. "Warlock (Great Old One Patron)"
}

export interface ProgressionGrantedFeature {
    id: string;
    name: string;
    description: string;
    source?: string;
    type?: "Class" | "Subclass" | "Invocation" | "Feat" | "Species";
    level?: number;
    modifiers?: StatModifier[];
    actionGrant?: {
        name: string;
        type: "Action" | "Bonus Action" | "Reaction" | "Special";
        range?: string;
        cost?: string;
        notes?: string;
    };
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
}

export interface ProgressionFeature {
    id: string;
    name: string;
    description: string;
    modifiers?: StatModifier[];
    actionGrant?: {
        name: string;
        type: "Action" | "Bonus Action" | "Reaction";
        range?: string;
        cost?: string;
        notes?: string;
    };
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
    grantedFeatures?: Array<ProgressionGrantedFeature | string>;
}

export interface ProgressionChoiceOption {
    id: string;
    name: string;
    description: string;
    prerequisite?: string;
    modifiers?: StatModifier[];
    actionGrant?: {
        name: string;
        type: "Action" | "Bonus Action" | "Reaction";
        range?: string;
        cost?: string;
        notes?: string;
    };
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
    grantedFeatures?: Array<ProgressionGrantedFeature | string>;
}

export interface ProgressionChoice {
    id: string;
    name: string;
    prompt: string;
    chooseCount: number;
    choiceType?: "feature" | "spell" | "proficiency" | "custom";
    options: ProgressionChoiceOption[];
}

export interface ProgressionResourceUpdate {
    name: string;
    total: number | string; // e.g. 2, or "{{level}}", or "{{pb}}"
    die?: string;           // e.g. "d6", "d8", "d10"
    resetOn: "short" | "long";
}

export interface ProgressionLevel {
    level: number;
    features: ProgressionFeature[];
    choices?: ProgressionChoice[];
    resourceUpdates?: ProgressionResourceUpdate[];
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
    grantedFeatures?: Array<ProgressionGrantedFeature | string>;
}

export interface SubclassSeedDefinition {
    classSlug: string;
    slug: string;
    name: string;
    description: string;
    progression: ProgressionLevel[];
    spellcastingOverride?: {
        ability: AbilityName;
        type: "full" | "half" | "third" | "pact";
        cantripsKnownByLevel: number[];
        preparedSpellsByLevel?: number[];
        spellSlotsByLevel: number[][];
    };
}

// --------------------------------------------------------------------------
// Standard Choice Definitions with concrete StatModifiers
// --------------------------------------------------------------------------

export const FIGHTING_STYLE_OPTIONS: ProgressionChoiceOption[] = [
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
        description: "While wearing armor, you gain a +1 bonus to Armor Class.",
        modifiers: [
            {
                target: "vitals.ac",
                type: "bonus",
                value: 1,
                condition: "wearing armor",
                description: "+1 bonus to Armor Class while wearing armor"
            }
        ]
    },
    {
        id: "dueling",
        name: "Dueling",
        description: "+2 bonus to damage rolls when wielding a melee weapon in one hand and no other weapons.",
        modifiers: [
            {
                target: "damage.melee_one_handed",
                type: "bonus",
                value: 2,
                condition: "wielding one-handed melee weapon alone",
                description: "+2 bonus to damage rolls with one-handed melee weapons"
            }
        ]
    },
    {
        id: "great-weapon-fighting",
        name: "Great Weapon Fighting",
        description: "When you roll a 1 or 2 on a damage die for an attack with a two-handed melee weapon, you can treat it as a 3.",
        modifiers: [
            {
                target: "attacks.two_handed_damage_floor",
                type: "set",
                value: 3,
                description: "Damage die roll of 1 or 2 is treated as a 3"
            }
        ]
    },
    {
        id: "protection",
        name: "Protection",
        description: "Use your reaction to impose Disadvantage on an attack against an ally within 5 feet while wielding a shield.",
        modifiers: [
            {
                target: "reactions.protection",
                type: "grant_action",
                description: "Impose Disadvantage on attack against adjacent ally using shield reaction"
            }
        ],
        actionGrant: {
            name: "Protection",
            type: "Reaction",
            range: "5 ft.",
            notes: "Requires shield; imposes Disadvantage on enemy attack against adjacent ally"
        }
    },
    {
        id: "two-weapon-fighting",
        name: "Two-Weapon Fighting",
        description: "Add your ability modifier to the damage of the bonus attack from dual wielding.",
        modifiers: [
            {
                target: "damage.offhand_ability_mod",
                type: "bonus",
                value: "ability_mod",
                description: "Add ability modifier to off-hand attack damage"
            }
        ]
    },
    {
        id: "blessed-warrior",
        name: "Blessed Warrior",
        description: "Learn two Cleric cantrips of your choice.",
        modifiers: [
            {
                target: "spells.cantrips_known",
                type: "bonus",
                value: 2,
                description: "Learn two Cleric cantrips"
            }
        ]
    },
    {
        id: "blind-fighting",
        name: "Blind Fighting",
        description: "You have blindsight with a range of 10 feet.",
        modifiers: [
            {
                target: "vitals.blindsight",
                type: "set",
                value: "10 ft.",
                description: "Blindsight out to 10 feet"
            }
        ]
    },
    {
        id: "interception",
        name: "Interception",
        description: "When an ally within 5 feet takes damage from an attack, reduce damage by 1d10 + PB.",
        modifiers: [
            {
                target: "reactions.interception",
                type: "grant_action",
                description: "Reduce damage to ally by 1d10 + PB using reaction"
            }
        ],
        actionGrant: {
            name: "Interception",
            type: "Reaction",
            range: "5 ft.",
            notes: "Reduce attack damage taken by adjacent ally by 1d10 + Proficiency Bonus"
        }
    },
    {
        id: "thrown",
        name: "Thrown Weapon Fighting",
        description: "+2 bonus to damage rolls with thrown weapons.",
        modifiers: [
            {
                target: "damage.thrown",
                type: "bonus",
                value: 2,
                description: "+2 damage on thrown weapon attacks"
            }
        ]
    },
    {
        id: "unarmed",
        name: "Unarmed Fighting",
        description: "Unarmed strikes deal 1d6 (or 1d8 if two hands free) bludgeoning damage.",
        modifiers: [
            {
                target: "attacks.unarmed_damage",
                type: "set",
                value: "1d6",
                description: "Unarmed strike deals 1d6 bludgeoning (or 1d8 versatile)"
            }
        ]
    }
];

export const DIVINE_ORDER_OPTIONS: ProgressionChoiceOption[] = [
    {
        id: "protector",
        name: "Protector",
        description: "Gain training with Heavy armor and proficiency with Martial weapons.",
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
        description: "Know one extra Cleric cantrip, and add your Wisdom modifier to Intelligence (Arcana or Religion) checks.",
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

export const PRIMAL_ORDER_OPTIONS: ProgressionChoiceOption[] = [
    {
        id: "magician",
        name: "Magician",
        description: "Know one extra Druid cantrip, and add your Wisdom modifier to Intelligence (Arcana or Nature) checks.",
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
        description: "Gain training with Medium armor and proficiency with Martial weapons.",
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

export const BLESSED_STRIKES_OPTIONS: ProgressionChoiceOption[] = [
    {
        id: "divine-strike",
        name: "Divine Strike",
        description: "Once per turn when you hit with a weapon attack, deal an extra 1d8 Radiant or Necrotic damage.",
        modifiers: [
            {
                target: "damage.weapon_once_per_turn",
                type: "bonus",
                value: "1d8",
                description: "+1d8 Radiant or Necrotic weapon damage once per turn"
            }
        ]
    },
    {
        id: "potent-spellcasting",
        name: "Potent Spellcasting",
        description: "Add your Wisdom modifier to the damage dealt with any Cleric cantrip.",
        modifiers: [
            {
                target: "damage.cantrips",
                type: "ability_mod",
                abilitySource: "wis",
                description: "Add Wisdom modifier to Cleric cantrip damage"
            }
        ]
    }
];

export const ELEMENTAL_FURY_OPTIONS: ProgressionChoiceOption[] = [
    {
        id: "primal-strike",
        name: "Primal Strike",
        description: "Once on each of your turns when you hit with a weapon attack or a Beast attack in Wild Shape, deal an extra 1d8 Cold, Fire, Lightning, or Thunder damage.",
        modifiers: [
            {
                target: "damage.weapon_once_per_turn",
                type: "bonus",
                value: "1d8",
                description: "+1d8 Cold, Fire, Lightning, or Thunder damage once per turn"
            }
        ]
    },
    {
        id: "potent-spellcasting",
        name: "Potent Spellcasting",
        description: "Add your Wisdom modifier to the damage dealt with any Druid cantrip.",
        modifiers: [
            {
                target: "damage.cantrips",
                type: "ability_mod",
                abilitySource: "wis",
                description: "Add Wisdom modifier to Druid cantrip damage"
            }
        ]
    }
];

export const METAMAGIC_OPTIONS: ProgressionChoiceOption[] = [
    { id: "careful-spell", name: "Careful Spell", description: "Cost: 1 Sorcery Point. Chosen creatures automatically succeed on saving throws against your spell." },
    { id: "distant-spell", name: "Distant Spell", description: "Cost: 1 Sorcery Point. Double spell range (or 30 ft. for Touch)." },
    { id: "empowered-spell", name: "Empowered Spell", description: "Cost: 1 Sorcery Point. Reroll up to CHA mod damage dice on a spell." },
    { id: "extended-spell", name: "Extended Spell", description: "Cost: 1 Sorcery Point. Double the duration of a spell up to 24 hours." },
    { id: "heightened-spell", name: "Heightened Spell", description: "Cost: 2 Sorcery Points. One target has Disadvantage on the first saving throw against your spell.", modifiers: [{ target: "spells.target_save", type: "disadvantage", description: "Target has Disadvantage on save vs spell" }] },
    { id: "quickened-spell", name: "Quickened Spell", description: "Cost: 2 Sorcery Points. Cast a 1-Action spell as a Bonus Action." },
    { id: "seeking-spell", name: "Seeking Spell", description: "Cost: 1 Sorcery Point. Reroll a missed spell attack roll." },
    { id: "subtle-spell", name: "Subtle Spell", description: "Cost: 1 Sorcery Point. Cast without verbal, somatic, or non-costly material components." },
    { id: "transmuted-spell", name: "Transmuted Spell", description: "Cost: 1 Sorcery Point. Change elemental damage type (acid, cold, fire, lightning, poison, thunder)." },
    { id: "twinned-spell", name: "Twinned Spell", description: "Cost: 1-5 Sorcery Points. Target a second creature with a single-target spell." }
];

export const ELDRITCH_INVOCATIONS: ProgressionChoiceOption[] = [
    {
        id: "pact-of-the-blade",
        name: "Pact of the Blade",
        description: "Conjure a pact melee weapon or bond with a weapon. Use Charisma for attack and damage rolls.",
        modifiers: [
            {
                target: "attacks.pact_weapon_ability",
                type: "set",
                value: "cha",
                description: "Use Charisma modifier for attack and damage rolls with pact weapon"
            }
        ]
    },
    {
        id: "pact-of-the-tome",
        name: "Pact of the Tome",
        description: "Book of Shadows grants three cantrips and two 1st-level ritual spells from any class list.",
        modifiers: [
            { target: "spells.cantrips_known", type: "bonus", value: 3, description: "+3 cantrips from any list" }
        ]
    },
    {
        id: "pact-of-the-chain",
        name: "Pact of the Chain",
        description: "Cast Find Familiar as a ritual to summon an enhanced familiar.",
        grantedSpells: [
            {
                name: "Find Familiar",
                level: 1,
                alwaysPrepared: true,
                notes: "Can cast as a ritual to summon an enhanced familiar"
            }
        ]
    },
    {
        id: "agonizing-blast",
        name: "Agonizing Blast",
        description: "Add Charisma modifier to the damage dealt by Eldritch Blast.",
        modifiers: [
            {
                target: "damage.eldritch_blast",
                type: "ability_mod",
                abilitySource: "cha",
                description: "Add Charisma modifier to Eldritch Blast damage"
            }
        ]
    },
    {
        id: "armor-of-shadows",
        name: "Armor of Shadows",
        description: "Cast Mage Armor on yourself at will without expending a spell slot.",
        grantedSpells: [
            {
                name: "Mage Armor",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast at will without expending a spell slot"
            }
        ]
    },
    {
        id: "devils-sight",
        name: "Devil's Sight",
        description: "See normally in magical and nonmagical darkness to 120 feet.",
        modifiers: [
            {
                target: "vitals.darkvision",
                type: "bonus",
                value: 120,
                description: "See in magical and nonmagical darkness out to 120 feet"
            }
        ]
    },
    {
        id: "eldritch-mind",
        name: "Eldritch Mind",
        description: "Advantage on Constitution saving throws to maintain concentration.",
        modifiers: [
            {
                target: "saves.con",
                type: "advantage",
                condition: "concentration",
                description: "Advantage on CON saving throws to maintain concentration"
            }
        ]
    },
    {
        id: "eldritch-spear",
        name: "Eldritch Spear",
        description: "The range of Eldritch Blast increases to 300 feet."
    },
    {
        id: "fiendish-vigor",
        name: "Fiendish Vigor",
        description: "Cast False Life on yourself at will as a 1st-level spell.",
        grantedSpells: [
            {
                name: "False Life",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast at will as a 1st-level spell without expending a spell slot"
            }
        ]
    },
    {
        id: "mask-of-many-faces",
        name: "Mask of Many Faces",
        description: "Cast Disguise Self at will without expending a spell slot.",
        grantedSpells: [
            {
                name: "Disguise Self",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast at will without expending a spell slot"
            }
        ]
    },
    {
        id: "misty-visions",
        name: "Misty Visions",
        description: "Cast Silent Image at will without expending a spell slot.",
        grantedSpells: [
            {
                name: "Silent Image",
                level: 1,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast at will without expending a spell slot"
            }
        ]
    },
    {
        id: "repelling-blast",
        name: "Repelling Blast",
        description: "Push a creature hit by Eldritch Blast up to 10 feet away."
    },
    {
        id: "thirsting-blade",
        name: "Thirsting Blade",
        description: "Attack twice with your pact weapon whenever you take the Attack action.",
        prerequisite: "Level 5, Pact of the Blade"
    },
    {
        id: "lifedrinker",
        name: "Lifedrinker",
        description: "Hit with pact weapon deals 1d6 extra Necrotic, Psychic, or Radiant damage.",
        prerequisite: "Level 9, Pact of the Blade"
    },
    {
        id: "whispers-of-the-grave",
        name: "Whispers of the Grave",
        description: "Cast Speak with Dead at will without expending a spell slot.",
        prerequisite: "Level 9",
        grantedSpells: [
            {
                name: "Speak with Dead",
                level: 3,
                atWill: true,
                alwaysPrepared: true,
                notes: "Cast at will without expending a spell slot"
            }
        ]
    }
];

export const BATTLE_MASTER_MANEUVERS: ProgressionChoiceOption[] = [
    { id: "riposte", name: "Riposte", description: "When a creature misses you with a melee attack, spend a superiority die as a reaction to make a melee weapon attack; add die to damage on hit." },
    { id: "precision-attack", name: "Precision Attack", description: "Spend a superiority die and add it to a weapon attack roll." },
    { id: "menacing-attack", name: "Menacing Attack", description: "Spend a superiority die to add damage and force a Wisdom save; on failure, target is Frightened until end of next turn." },
    { id: "trip-attack", name: "Trip Attack", description: "Spend a superiority die to add damage and knock target Prone on failed Strength save." },
    { id: "disarming-attack", name: "Disarming Attack", description: "Spend a superiority die to add damage and force target to drop held item on failed Strength save." },
    { id: "rally", name: "Rally", description: "As a Bonus Action, grant an ally temp HP equal to superiority die + Charisma mod." },
    { id: "ambush", name: "Ambush", description: "Add a superiority die to a Dexterity (Stealth) check or Initiative roll.", modifiers: [{ target: "vitals.initiative", type: "bonus", value: "die", description: "Can add superiority die to initiative" }] },
    { id: "bait-and-switch", name: "Bait and Switch", description: "Swap places with adjacent ally; both gain AC bonus equal to superiority die roll." }
];

export const STUDENT_OF_WAR_SKILLS: ProgressionChoiceOption[] = [
    { id: "History", name: "History", description: "Proficiency in the History skill.", modifiers: [{ target: "skills.history", type: "proficiency_tier", value: "proficient" }] },
    { id: "Insight", name: "Insight", description: "Proficiency in the Insight skill.", modifiers: [{ target: "skills.insight", type: "proficiency_tier", value: "proficient" }] },
    { id: "Medicine", name: "Medicine", description: "Proficiency in the Medicine skill.", modifiers: [{ target: "skills.medicine", type: "proficiency_tier", value: "proficient" }] },
    { id: "Performance", name: "Performance", description: "Proficiency in the Performance skill.", modifiers: [{ target: "skills.performance", type: "proficiency_tier", value: "proficient" }] },
    { id: "Persuasion", name: "Persuasion", description: "Proficiency in the Persuasion skill.", modifiers: [{ target: "skills.persuasion", type: "proficiency_tier", value: "proficient" }] }
];

export const WIZARD_SCHOLAR_SKILLS: ProgressionChoiceOption[] = [
    { id: "arcana", name: "Arcana", description: "Gain Expertise in Arcana.", modifiers: [{ target: "skills.arcana", type: "proficiency_tier", value: "expertise" }] },
    { id: "history", name: "History", description: "Gain Expertise in History.", modifiers: [{ target: "skills.history", type: "proficiency_tier", value: "expertise" }] },
    { id: "investigation", name: "Investigation", description: "Gain Expertise in Investigation.", modifiers: [{ target: "skills.investigation", type: "proficiency_tier", value: "expertise" }] },
    { id: "nature", name: "Nature", description: "Gain Expertise in Nature.", modifiers: [{ target: "skills.nature", type: "proficiency_tier", value: "expertise" }] },
    { id: "religion", name: "Religion", description: "Gain Expertise in Religion.", modifiers: [{ target: "skills.religion", type: "proficiency_tier", value: "expertise" }] }
];

export const DRACONIC_ANCESTOR_ELEMENTS: ProgressionChoiceOption[] = [
    { id: "black", name: "Black (Acid)", description: "Resistance to Acid damage at level 6 and bonus damage on acid spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid", description: "Resistance to Acid" }] },
    { id: "blue", name: "Blue (Lightning)", description: "Resistance to Lightning damage at level 6 and bonus damage on lightning spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Resistance to Lightning" }] },
    { id: "brass", name: "Brass (Fire)", description: "Resistance to Fire damage at level 6 and bonus damage on fire spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Resistance to Fire" }] },
    { id: "bronze", name: "Bronze (Lightning)", description: "Resistance to Lightning damage at level 6 and bonus damage on lightning spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Resistance to Lightning" }] },
    { id: "copper", name: "Copper (Acid)", description: "Resistance to Acid damage at level 6 and bonus damage on acid spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid", description: "Resistance to Acid" }] },
    { id: "gold", name: "Gold (Fire)", description: "Resistance to Fire damage at level 6 and bonus damage on fire spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Resistance to Fire" }] },
    { id: "green", name: "Green (Poison)", description: "Resistance to Poison damage at level 6 and bonus damage on poison spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "poison", description: "Resistance to Poison" }] },
    { id: "red", name: "Red (Fire)", description: "Resistance to Fire damage at level 6 and bonus damage on fire spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Resistance to Fire" }] },
    { id: "silver", name: "Silver (Cold)", description: "Resistance to Cold damage at level 6 and bonus damage on cold spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Resistance to Cold" }] },
    { id: "white", name: "White (Cold)", description: "Resistance to Cold damage at level 6 and bonus damage on cold spells.", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Resistance to Cold" }] }
];

export const DRUID_LAND_BIOMES: ProgressionChoiceOption[] = [
    {
        id: "arid",
        name: "Arid (Desert / Plains)",
        description: "Gain Fire Resistance and Land's Aid spells Blur and Fireball.",
        grantedSpells: [
            { name: "Blur", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Arid)" },
            { name: "Fireball", level: 3, alwaysPrepared: true, notes: "Circle of the Land (Arid)" }
        ],
        modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Resistance to Fire" }]
    },
    {
        id: "polar",
        name: "Polar (Tundra / Ice)",
        description: "Gain Cold Resistance and Land's Aid spells Hold Person and Ice Storm.",
        grantedSpells: [
            { name: "Hold Person", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Polar)" },
            { name: "Ice Storm", level: 4, alwaysPrepared: true, notes: "Circle of the Land (Polar)" }
        ],
        modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Resistance to Cold" }]
    },
    {
        id: "temperate",
        name: "Temperate (Forest / Grassland)",
        description: "Gain Lightning affinity and Land's Aid spells Misty Step and Lightning Bolt.",
        grantedSpells: [
            { name: "Misty Step", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Temperate)" },
            { name: "Lightning Bolt", level: 3, alwaysPrepared: true, notes: "Circle of the Land (Temperate)" }
        ],
        modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Resistance to Lightning" }]
    },
    {
        id: "tropical",
        name: "Tropical (Rainforest / Swamp)",
        description: "Gain Poison Resistance and Land's Aid spells Web and Polymorph.",
        grantedSpells: [
            { name: "Web", level: 2, alwaysPrepared: true, notes: "Circle of the Land (Tropical)" },
            { name: "Polymorph", level: 4, alwaysPrepared: true, notes: "Circle of the Land (Tropical)" }
        ],
        modifiers: [{ target: "defenses.resistance", type: "set", value: "poison", description: "Resistance to Poison" }]
    }
];

export const BARBARIAN_ASPECTS: ProgressionChoiceOption[] = [
    { id: "elephant", name: "Aspect of the Elephant", description: "Advantage on Athletics checks and carrying capacity doubled.", modifiers: [{ target: "skills.athletics", type: "advantage", description: "Advantage on Athletics checks" }] },
    { id: "owl", name: "Aspect of the Owl", description: "Gain Darkvision 60 ft. and Advantage on Perception checks.", modifiers: [{ target: "vitals.darkvision", type: "bonus", value: 60, description: "Gain Darkvision 60 ft." }, { target: "skills.perception", type: "advantage", description: "Advantage on Perception checks" }] },
    { id: "spider", name: "Aspect of the Spider", description: "Gain climbing speed equal to walking speed.", modifiers: [{ target: "vitals.speed", type: "bonus", value: 0, description: "Climbing speed equals walking speed" }] },
    { id: "wolf", name: "Aspect of the Wolf", description: "Track creatures at fast pace and move stealthily at normal pace.", modifiers: [{ target: "skills.stealth", type: "advantage", description: "Stealth advantage at normal travel pace" }] }
];

export const HUNTER_PREY_OPTIONS: ProgressionChoiceOption[] = [
    { id: "colossus-slayer", name: "Colossus Slayer", description: "Once per turn deal an extra 1d8 damage to a wounded creature.", modifiers: [{ target: "damage.weapon_once_per_turn", type: "bonus", value: "1d8", description: "+1d8 weapon damage to wounded target" }] },
    { id: "horde-breaker", name: "Horde Breaker", description: "Once per turn make an extra weapon attack against a different adjacent creature." }
];

export const ROGUE_CUNNING_STRIKES: ProgressionChoiceOption[] = [
    { id: "poison", name: "Poison (Cost: 1d6)", description: "Target must make Con save or be Poisoned for 1 minute." },
    { id: "trip", name: "Trip (Cost: 1d6)", description: "Target must make Dex save or fall Prone." },
    { id: "withdraw", name: "Withdraw (Cost: 1d6)", description: "Move up to half speed without provoking opportunity attacks." }
];

// --------------------------------------------------------------------------
// Class Progression Generator (Levels 1 to 20)
// --------------------------------------------------------------------------

export function buildClassProgression(classSlug: string, baseFeatures: Array<{ name: string; level: number; description: string }> = []): ProgressionLevel[] {
    const levels: ProgressionLevel[] = [];

    for (let lvl = 1; lvl <= 20; lvl++) {
        // Collect features at this level
        const levelFeatures = baseFeatures.filter(f => f.level === lvl).map(f => {
            const featSlug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const modifiers: StatModifier[] = [];

            // Add inherent modifiers for well-known features
            if (featSlug === "fast-movement") {
                modifiers.push({ target: "vitals.speed", type: "bonus", value: 10, condition: "not wearing heavy armor", description: "+10 ft. Walking Speed" });
            } else if (featSlug === "feral-instinct") {
                modifiers.push({ target: "vitals.initiative", type: "advantage", description: "Advantage on Initiative rolls" });
            } else if (featSlug === "primal-champion") {
                modifiers.push({ target: "abilities.str", type: "bonus", value: 4, description: "+4 Strength (max 25)" });
                modifiers.push({ target: "abilities.con", type: "bonus", value: 4, description: "+4 Constitution (max 25)" });
            } else if (featSlug === "aura-of-protection") {
                modifiers.push({ target: "saves.all", type: "ability_mod", abilitySource: "cha", condition: "not incapacitated", description: "Add Charisma modifier to all saving throws" });
            } else if (featSlug === "unarmored-defense") {
                modifiers.push({ target: "vitals.ac", type: "bonus", value: "con_or_wis", description: "Add ability modifier to unarmored AC" });
            }

            return {
                id: `${classSlug}-${lvl}-${featSlug}`,
                name: f.name,
                description: f.description,
                modifiers: modifiers.length > 0 ? modifiers : undefined
            };
        });

        const choices: ProgressionChoice[] = [];
        const resourceUpdates: ProgressionResourceUpdate[] = [];

        // Build class-specific progression choices and resources per level
        switch (classSlug) {
            case "barbarian":
                // Rages scaling: 2 (1-2), 3 (3-5), 4 (6-11), 5 (12-16), 6 (17-20)
                const rages = lvl >= 17 ? 6 : lvl >= 12 ? 5 : lvl >= 6 ? 4 : lvl >= 3 ? 3 : 2;
                resourceUpdates.push({ name: "Rage", total: rages, resetOn: "long" });
                if (lvl === 9) {
                    choices.push({
                        id: "brutal-strike",
                        name: "Brutal Strike",
                        prompt: "Choose your primary Brutal Strike technique.",
                        chooseCount: 1,
                        options: [
                            { id: "forceful-blow", name: "Forceful Blow", description: "Push target 15 ft. away and move up to half speed toward it without provoking opportunity attacks." },
                            { id: "hamstring-blow", name: "Hamstring Blow", description: "Reduce target's speed by 15 ft. until start of next turn." }
                        ]
                    });
                }
                break;

            case "bard":
                // Bardic Inspiration: uses = CHA mod, die size scales
                const bDie = lvl >= 15 ? "d12" : lvl >= 10 ? "d10" : lvl >= 5 ? "d8" : "d6";
                resourceUpdates.push({ name: "Bardic Inspiration", total: "{{cha}}", die: bDie, resetOn: lvl >= 5 ? "short" : "long" });
                break;

            case "cleric":
                if (lvl === 1) {
                    choices.push({
                        id: "divine-order",
                        name: "Divine Order",
                        prompt: "Choose your Cleric Divine Order.",
                        chooseCount: 1,
                        options: DIVINE_ORDER_OPTIONS
                    });
                }
                if (lvl === 7) {
                    choices.push({
                        id: "blessed-strikes",
                        name: "Blessed Strikes",
                        prompt: "Choose Divine Strike or Potent Spellcasting.",
                        chooseCount: 1,
                        options: BLESSED_STRIKES_OPTIONS
                    });
                }
                const chUses = lvl >= 18 ? 4 : lvl >= 11 ? 3 : lvl >= 2 ? 2 : 0;
                if (chUses > 0) {
                    resourceUpdates.push({ name: "Channel Divinity", total: chUses, resetOn: "short" });
                }
                break;

            case "druid":
                if (lvl === 1) {
                    choices.push({
                        id: "primal-order",
                        name: "Primal Order",
                        prompt: "Choose your Druid Primal Order.",
                        chooseCount: 1,
                        options: PRIMAL_ORDER_OPTIONS
                    });
                }
                if (lvl === 7) {
                    choices.push({
                        id: "elemental-fury",
                        name: "Elemental Fury",
                        prompt: "Choose Primal Strike or Potent Spellcasting.",
                        chooseCount: 1,
                        options: ELEMENTAL_FURY_OPTIONS
                    });
                }
                if (lvl >= 2) {
                    const wsUses = lvl >= 17 ? 4 : lvl >= 6 ? 3 : 2;
                    resourceUpdates.push({ name: "Wild Shape", total: wsUses, resetOn: "short" });
                }
                break;

            case "fighter":
                if (lvl === 1) {
                    choices.push({
                        id: "fighting-style",
                        name: "Fighting Style",
                        prompt: "Select a Fighting Style feat.",
                        chooseCount: 1,
                        options: FIGHTING_STYLE_OPTIONS
                    });
                }
                if (lvl >= 2) {
                    resourceUpdates.push({ name: "Action Surge", total: lvl >= 17 ? 2 : 1, resetOn: "short" });
                }
                resourceUpdates.push({ name: "Second Wind", total: lvl >= 10 ? 4 : lvl >= 4 ? 3 : 2, resetOn: "short" });
                break;

            case "monk":
                if (lvl >= 2) {
                    resourceUpdates.push({ name: "Focus Points", total: lvl, resetOn: "short" });
                }
                break;

            case "paladin":
                resourceUpdates.push({ name: "Lay on Hands Pool", total: lvl * 5, resetOn: "long" });
                if (lvl === 2) {
                    choices.push({
                        id: "fighting-style",
                        name: "Fighting Style",
                        prompt: "Select a Fighting Style feat.",
                        chooseCount: 1,
                        options: FIGHTING_STYLE_OPTIONS
                    });
                }
                if (lvl >= 3) {
                    resourceUpdates.push({ name: "Channel Divinity", total: lvl >= 11 ? 3 : 2, resetOn: "short" });
                }
                break;

            case "ranger":
                if (lvl === 2) {
                    choices.push({
                        id: "fighting-style",
                        name: "Fighting Style",
                        prompt: "Select a Fighting Style feat.",
                        chooseCount: 1,
                        options: FIGHTING_STYLE_OPTIONS
                    });
                }
                break;

            case "rogue":
                const sDice = Math.ceil(lvl / 2);
                resourceUpdates.push({ name: "Sneak Attack", total: `${sDice}d6`, resetOn: "short" });
                if (lvl === 5) {
                    choices.push({
                        id: "cunning-strike",
                        name: "Cunning Strike",
                        prompt: "Choose your primary Cunning Strike options.",
                        chooseCount: 2,
                        options: ROGUE_CUNNING_STRIKES
                    });
                }
                break;

            case "sorcerer":
                if (lvl >= 2) {
                    resourceUpdates.push({ name: "Sorcery Points", total: lvl, resetOn: "long" });
                }
                if (lvl === 2) {
                    choices.push({
                        id: "metamagic",
                        name: "Metamagic",
                        prompt: "Select 2 Metamagic options.",
                        chooseCount: 2,
                        options: METAMAGIC_OPTIONS
                    });
                } else if (lvl === 10 || lvl === 17) {
                    choices.push({
                        id: `metamagic-${lvl}`,
                        name: "Metamagic",
                        prompt: "Select 1 additional Metamagic option.",
                        chooseCount: 1,
                        options: METAMAGIC_OPTIONS
                    });
                }
                break;

            case "warlock":
                if (lvl === 1) {
                    choices.push({
                        id: "eldritch-invocations-1",
                        name: "Eldritch Invocations",
                        prompt: "Choose 1 Eldritch Invocation.",
                        chooseCount: 1,
                        options: ELDRITCH_INVOCATIONS
                    });
                } else if (lvl === 2) {
                    choices.push({
                        id: "eldritch-invocations-2",
                        name: "Eldritch Invocations",
                        prompt: "Choose 2 additional Eldritch Invocations.",
                        chooseCount: 2,
                        options: ELDRITCH_INVOCATIONS
                    });
                }
                break;

            case "wizard":
                if (lvl === 2) {
                    choices.push({
                        id: "scholar",
                        name: "Scholar",
                        prompt: "Choose 1 academic skill to gain Expertise in.",
                        chooseCount: 1,
                        options: WIZARD_SCHOLAR_SKILLS
                    });
                }
                break;
        }

        levels.push({
            level: lvl,
            features: levelFeatures,
            choices: choices.length > 0 ? choices : undefined,
            resourceUpdates: resourceUpdates.length > 0 ? resourceUpdates : undefined
        });
    }

    return levels;
}

// --------------------------------------------------------------------------
// Subclass Progression Generator (for all 48 subclasses)
// --------------------------------------------------------------------------

export function buildSubclassProgression(classSlug: string, sub: { id: string; name: string; description: string; features?: Array<{ name: string; level: number; description: string }> }): ProgressionLevel[] {
    const subSlug = sub.id || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const subFeatures = Array.isArray(sub.features) ? sub.features : [];

    // Distinct levels where this subclass has features
    const featureLevels = Array.from(new Set(subFeatures.map(f => f.level || 3))).sort((a, b) => a - b);
    if (featureLevels.length === 0) {
        featureLevels.push(3);
    }

    const levels: ProgressionLevel[] = [];

    for (const lvl of featureLevels) {
        const featsAtLevel = subFeatures.filter(f => (f.level || 3) === lvl).map(f => {
            const featSlug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const modifiers: StatModifier[] = [];

            // Add inherent modifiers for concrete subclass features
            if (featSlug === "draconic-resilience") {
                modifiers.push({ target: "vitals.ac", type: "bonus", value: "cha", condition: "unarmored", description: "Base AC 10 + DEX + CHA mod" });
                modifiers.push({ target: "vitals.maxHp", type: "bonus", value: 1, description: "+1 HP per Sorcerer level" });
            } else if (featSlug === "umbral-sight") {
                modifiers.push({ target: "vitals.darkvision", type: "bonus", value: 60, description: "Darkvision +60 ft." });
            }

            const grantedSpells: ProgressionGrantedSpell[] = [];

            if (featSlug === "psychic-spells" || featSlug === "expanded-spell-list") {
                if (lvl === 3) {
                    grantedSpells.push(
                        { name: "Dissonant Whispers", level: 1, alwaysPrepared: true, source: sub.name },
                        { name: "Tasha's Hideous Laughter", level: 1, alwaysPrepared: true, source: sub.name },
                        { name: "Detect Thoughts", level: 2, alwaysPrepared: true, source: sub.name },
                        { name: "Phantasmal Force", level: 2, alwaysPrepared: true, source: sub.name }
                    );
                } else if (lvl === 6 || lvl === 5) {
                    grantedSpells.push(
                        { name: "Clairvoyance", level: 3, alwaysPrepared: true, source: sub.name },
                        { name: "Sending", level: 3, alwaysPrepared: true, source: sub.name }
                    );
                } else if (lvl === 10 || lvl === 7) {
                    grantedSpells.push(
                        { name: "Dominate Beast", level: 4, alwaysPrepared: true, source: sub.name },
                        { name: "Evard's Black Tentacles", level: 4, alwaysPrepared: true, source: sub.name }
                    );
                } else if (lvl === 14 || lvl === 9) {
                    grantedSpells.push(
                        { name: "Dominate Person", level: 5, alwaysPrepared: true, source: sub.name },
                        { name: "Telekinesis", level: 5, alwaysPrepared: true, source: sub.name }
                    );
                }
            } else if (featSlug === "beguiling-magic") {
                grantedSpells.push(
                    { name: "Charm Person", level: 1, alwaysPrepared: true, source: sub.name, notes: "College of Glamour" },
                    { name: "Mirror Image", level: 2, alwaysPrepared: true, source: sub.name, notes: "College of Glamour" }
                );
            } else if (featSlug === "mantle-of-majesty") {
                grantedSpells.push(
                    { name: "Command", level: 1, alwaysPrepared: true, atWill: true, source: sub.name, notes: "Cast as Bonus Action without spell slot" }
                );
            }

            return {
                id: `${subSlug}-${lvl}-${featSlug}`,
                name: f.name,
                description: f.description,
                modifiers: modifiers.length > 0 ? modifiers : undefined,
                grantedSpells: grantedSpells.length > 0 ? grantedSpells : (f as any).grantedSpells,
                grantedFeatures: (f as any).grantedFeatures
            };
        });

        const choices: ProgressionChoice[] = [];

        // Check for specific subclass feature choices at this level
        if (subSlug === "battle-master" && lvl === 3) {
            choices.push({
                id: "maneuvers-3",
                name: "Maneuvers",
                prompt: "Choose 3 Battle Master Maneuvers.",
                chooseCount: 3,
                options: BATTLE_MASTER_MANEUVERS
            });
            choices.push({
                id: "student-of-war",
                name: "Student of War",
                prompt: "Choose 1 skill proficiency.",
                chooseCount: 1,
                options: STUDENT_OF_WAR_SKILLS
            });
        } else if (subSlug === "wild-heart" && lvl === 6) {
            choices.push({
                id: "aspect-of-the-beast",
                name: "Aspect of the Beast",
                prompt: "Choose 1 primal animal aspect.",
                chooseCount: 1,
                options: BARBARIAN_ASPECTS
            });
        } else if (subSlug === "land" && lvl === 3) {
            choices.push({
                id: "land-biome",
                name: "Land Biome",
                prompt: "Choose your current land biome affinity.",
                chooseCount: 1,
                options: DRUID_LAND_BIOMES
            });
        } else if (subSlug === "draconic-sorcery" && lvl === 3) {
            choices.push({
                id: "draconic-ancestor",
                name: "Draconic Ancestor",
                prompt: "Choose your draconic ancestor dragon type.",
                chooseCount: 1,
                options: DRACONIC_ANCESTOR_ELEMENTS
            });
        } else if (subSlug === "hunter" && lvl === 3) {
            choices.push({
                id: "hunter-prey",
                name: "Hunter's Prey",
                prompt: "Choose your Hunter's Prey feature.",
                chooseCount: 1,
                options: HUNTER_PREY_OPTIONS
            });
        }

        levels.push({
            level: lvl,
            features: featsAtLevel,
            choices: choices.length > 0 ? choices : undefined
        });
    }

    return levels;
}
