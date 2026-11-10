export type AbilityName = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface MulticlassPrerequisites {
    stats: AbilityName[];
    mode: "and" | "or";
    label: string;
}

export interface MulticlassProficiencies {
    armor: string[];
    weapons: string[];
    tools: string[];
    skills?: {
        count: number;
        from?: string[];
    };
}

export interface MulticlassDefinition {
    prerequisites: MulticlassPrerequisites;
    proficiencies: MulticlassProficiencies;
}

export const MULTICLASS_DATA_2024: Record<string, MulticlassDefinition> = {
    barbarian: {
        prerequisites: { stats: ["str"], mode: "and", label: "Str 13+" },
        proficiencies: { armor: ["Shields"], weapons: ["Martial Weapons"], tools: [] }
    },
    bard: {
        prerequisites: { stats: ["cha"], mode: "and", label: "Cha 13+" },
        proficiencies: { armor: ["Light Armor"], weapons: [], tools: ["Musical Instrument"], skills: { count: 1 } }
    },
    cleric: {
        prerequisites: { stats: ["wis"], mode: "and", label: "Wis 13+" },
        proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: [], tools: [] }
    },
    druid: {
        prerequisites: { stats: ["wis"], mode: "and", label: "Wis 13+" },
        proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: [], tools: [] }
    },
    fighter: {
        prerequisites: { stats: ["str", "dex"], mode: "or", label: "Str 13+ or Dex 13+" },
        proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: ["Martial Weapons"], tools: [] }
    },
    monk: {
        prerequisites: { stats: ["dex", "wis"], mode: "and", label: "Dex 13+ & Wis 13+" },
        proficiencies: { armor: [], weapons: [], tools: [] }
    },
    paladin: {
        prerequisites: { stats: ["str", "cha"], mode: "and", label: "Str 13+ & Cha 13+" },
        proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: ["Martial Weapons"], tools: [] }
    },
    ranger: {
        prerequisites: { stats: ["dex", "wis"], mode: "and", label: "Dex 13+ & Wis 13+" },
        proficiencies: { armor: ["Light Armor", "Medium Armor", "Shields"], weapons: ["Martial Weapons"], tools: [], skills: { count: 1 } }
    },
    rogue: {
        prerequisites: { stats: ["dex"], mode: "and", label: "Dex 13+" },
        proficiencies: { armor: ["Light Armor"], weapons: [], tools: ["Thieves' Tools"], skills: { count: 1 } }
    },
    sorcerer: {
        prerequisites: { stats: ["cha"], mode: "and", label: "Cha 13+" },
        proficiencies: { armor: [], weapons: [], tools: [] }
    },
    warlock: {
        prerequisites: { stats: ["cha"], mode: "and", label: "Cha 13+" },
        proficiencies: { armor: ["Light Armor"], weapons: [], tools: [] }
    },
    wizard: {
        prerequisites: { stats: ["int"], mode: "and", label: "Int 13+" },
        proficiencies: { armor: [], weapons: [], tools: [] }
    }
};

// Class level -> value tables are indexed by class level (index 0 unused), like weaponMasteriesByLevel.
const STANDARD_ASI_LEVELS = [4, 8, 12, 16];
const EPIC_BOON_LEVEL = 19;

/**
 * Per-class tables and level lists stored in rule_classes.scalingTraitsJson:
 *  - asiLevels / epicBoonLevel: class levels that grant an Ability Score Improvement / Epic Boon feat
 *  - expertiseByLevel: total Expertise picks the class has granted by each class level
 */
export const CLASS_SCALING_TRAITS_2024: Record<string, any> = {
    barbarian: {
        weaponMasteriesByLevel: [0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    bard: {
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL,
        // Expertise: 2 at level 2, 2 more at level 9
        expertiseByLevel: [0, 0, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
    },
    cleric: {
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    druid: {
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    fighter: {
        weaponMasteriesByLevel: [0, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6],
        asiLevels: [4, 6, 8, 12, 14, 16],
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    monk: {
        // Martial Arts die by Monk level; also marks the class whose weapons use it
        martialArtsDieByLevel: ["", "1d6", "1d6", "1d6", "1d6", "1d8", "1d8", "1d8", "1d8", "1d8", "1d8", "1d10", "1d10", "1d10", "1d10", "1d10", "1d10", "1d12", "1d12", "1d12", "1d12"],
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    paladin: {
        weaponMasteriesByLevel: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    ranger: {
        weaponMasteriesByLevel: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL,
        // Deft Explorer: 1 at level 2; Expertise: 2 more at level 9
        expertiseByLevel: [0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    },
    rogue: {
        weaponMasteriesByLevel: [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        asiLevels: [4, 8, 10, 12, 16],
        epicBoonLevel: EPIC_BOON_LEVEL,
        // Expertise: 2 at level 1, 2 more at level 6
        expertiseByLevel: [0, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
    },
    sorcerer: {
        metamagicByLevel: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 6, 6, 6, 6],
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    warlock: {
        invocationsByLevel: [0, 1, 3, 3, 3, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10],
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    },
    wizard: {
        asiLevels: STANDARD_ASI_LEVELS,
        epicBoonLevel: EPIC_BOON_LEVEL
    }
};

// D&D Beyond's ids for the 2024 classes (stored in rule_classes.dndBeyondId; used to fetch class spell lists)
export const DND_BEYOND_2024_CLASS_IDS: Record<string, number> = {
    barbarian: 2190875,
    bard: 2190876,
    cleric: 2190877,
    druid: 2190878,
    fighter: 2190879,
    monk: 2190880,
    paladin: 2190881,
    ranger: 2190882,
    rogue: 2190883,
    sorcerer: 2190884,
    warlock: 2190885,
    wizard: 2190886
};

export type ModifierTarget =
    | "vitals.ac"
    | "vitals.maxHp"
    | "vitals.initiative"
    | "vitals.speed"
    | "vitals.blindsight"
    | "vitals.darkvision"
    | "vitals.devilsSight"
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
    | "attacks.two_handed_damage_floor"
    | "damage.melee"
    | "damage.ranged"
    | "damage.melee_one_handed"
    | "damage.thrown"
    | "damage.cantrips"
    | "damage.eldritch_blast"
    | "damage.offhand_ability_mod"
    | "spells.dc"
    | "spells.attack"
    | "spells.saveDc"
    | "spells.attackBonus"
    | "vitals.swim"
    | "vitals.climb"
    | "vitals.fly"
    | "speeds.fly"
    | "speeds.swim"
    | "speeds.climb"
    | `reactions.${string}`
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
    | "grant_feature"    // Grants a specific feature or trait
    | "multiplier"       // Multiplies a value (e.g. 2x carrying capacity)
    | "half_proficiency" // Adds half the Proficiency Bonus, rounded down (e.g. Jack of All Trades)
    | "unarmored_ac";    // Base AC 10 + the listed abilities' modifiers while not wearing armor

export interface StatModifier {
    target: ModifierTarget;
    type: ModifierType;
    value?: number | string;
    abilitySource?: AbilityName;
    minimum?: number;              // floor for ability_mod (e.g. Thaumaturge: Wisdom modifier, minimum +1)
    valueByLevel?: number[];       // value by the granting class's level (index = level), e.g. Unarmored Movement
    perClassLevel?: number;        // value × the granting class's level, e.g. Draconic Resilience HP
    abilities?: AbilityName[];     // unarmored_ac: abilities whose modifiers add to 10
    allowsShield?: boolean;        // unarmored_ac: still applies while holding a shield
    requires?: "no-armor" | "no-heavy-armor" | "no-armor-or-shield" | "armor"; // only applies in this armor state
    condition?: string;
    description?: string;
}

export interface ProgressionGrantedSpell {
    id?: string;
    spellId?: string;
    name: string;
    level?: number;                    // 0 for cantrip, 1-9 for leveled spells
    alwaysPrepared?: boolean;          // Always prepared, does not count against prepared spell limits
    atWill?: boolean;                  // Cast at will without expending a spell slot
    ritual?: boolean;                  // Can be cast as a ritual
    usage?: {
        count?: number;
        resetOn?: "short" | "long" | "at_will";
    };
    ability?: AbilityName;             // Fixed casting ability if specified
    notes?: string;                    // Usage notes or restrictions
    source?: string;                   // E.g. "Warlock (Great Old One Patron)"
}

export interface ProgressionGrantedFeature {
    id?: string;
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
        effect?: string;
        notes?: string;
    };
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
}

/**
 * Spells a feature or option lets the player pick (e.g. Mystic Arcanum, a Thaumaturge's extra cantrip). The creator
 * shows one section per pick on the Spells step; picked spells are always prepared and don't count as class picks.
 */
export interface SpellPick {
    id: string;                    // section id; also the key saved picks are stored under
    title: string;
    sourceLabel: string;           // saved spell source
    description: string;
    count: number;
    ability?: AbilityName;
    lists?: string[];              // class spell lists to pick from; omitted = any list
    levels?: number[];             // spell levels allowed (0 = cantrip)
    maxLevel?: "castable";         // or: up to the highest level the granting class can cast (plus cantrips if 0 is in levels)
    orRitual?: boolean;            // also allow ritual spells of any level
    sourceAliases?: string[];      // lower-case source text older saves used for these spells
    countsAgainstLimit?: boolean;  // true when the picks use the class's cantrip/prepared numbers (default: they don't)
}

export interface ProgressionFeature {
    id: string;
    name: string;
    description: string;
    modifiers?: StatModifier[];
    scaleValue?: string;           // the feature's scaling number, e.g. "{{cha}}+{{level}}" (templates as in resources)
    spellPicks?: SpellPick[];
    actionGrant?: {
        name: string;
        type: "Action" | "Bonus Action" | "Reaction";
        range?: string;
        cost?: string;
        effect?: string;
        notes?: string;
    };
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
    grantedFeatures?: Array<ProgressionGrantedFeature | string>;
}

export interface ProgressionChoiceOption {
    id: string;
    name: string;
    description: string;
    legacyIds?: string[];          // ids older saves may hold for this option
    minLevel?: number;             // class level the option requires (e.g. Eldritch Invocation prerequisites)
    spellPicks?: SpellPick[];      // spells the player picks when this option is chosen
    prerequisite?: string;
    modifiers?: StatModifier[];
    actionGrant?: {
        name: string;
        type: "Action" | "Bonus Action" | "Reaction";
        range?: string;
        cost?: string;
        effect?: string;
        notes?: string;
    };
    grantedSpells?: Array<ProgressionGrantedSpell | string>;
    grantedFeatures?: Array<ProgressionGrantedFeature | string>;
}

export interface ProgressionChoice {
    id: string;
    choiceId?: string;
    name: string;
    prompt: string;
    chooseCount: number;
    legacyKeys?: string[];         // creator storage keys older saves may hold this choice under
    /** A pick list counted by a scalingTraits table rather than chooseCount (e.g. "invocations", "metamagic") */
    pool?: string;
    choiceType?: "feature" | "spell" | "proficiency" | "custom";
    options: ProgressionChoiceOption[];
}

export interface ProgressionResourceUpdate {
    name: string;
    total: number | string; // e.g. 2, or "{{level}}", or "{{pb}}"
    die?: string;           // e.g. "d6", "d8", "d10"
    resetOn: "short" | "long";
    aliases?: string[];     // other feature names that use this resource or its die (e.g. "Cutting Words")
}

export interface ProgressionLevel {
    level: number;
    features: ProgressionFeature[];
    choices?: ProgressionChoice[];
    resourceUpdates?: ProgressionResourceUpdate[];
    /** Short level summaries shown on the creator's progression (e.g. "Rage Damage +2", "2 Attacks") */
    badges?: string[];
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
                requires: "armor",
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
        legacyIds: ["great-weapon"],
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
        legacyIds: ["two-weapon"],
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
        spellPicks: [{
            id: "fighting-style-blessed-warrior",
            title: "Fighting Style: Blessed Warrior — Cleric Cantrips",
            sourceLabel: "Fighting Style (Blessed Warrior)",
            description: "You learn two Cleric cantrips of your choice. They count as class spells for you, and Charisma is your spellcasting ability for them.",
            count: 2, lists: ["Cleric"], levels: [0], ability: "cha",
            sourceAliases: ["blessed warrior"]
        }],
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

// 2024 Fighting Style feats every class with the feature can take; Blessed Warrior is Paladin-only, Druidic Warrior
// Ranger-only
const BASE_FIGHTING_STYLES = FIGHTING_STYLE_OPTIONS.filter((o) => o.id !== "blessed-warrior" && o.id !== "druidic-warrior");
const DRUIDIC_WARRIOR_OPTION: ProgressionChoiceOption = {
    id: "druidic-warrior",
    name: "Druidic Warrior",
    description: "You learn two Druid cantrips of your choice (Guidance and Starry Wisp are recommended). Wisdom is your spellcasting ability for them.",
    spellPicks: [{
        id: "fighting-style-druidic-warrior",
        title: "Fighting Style: Druidic Warrior — Druid Cantrips",
        sourceLabel: "Fighting Style (Druidic Warrior)",
        description: "You learn two Druid cantrips of your choice. They count as class spells for you, and Wisdom is your spellcasting ability for them.",
        count: 2, lists: ["Druid"], levels: [0], ability: "wis",
        sourceAliases: ["druidic warrior"]
    }]
};
export const FIGHTER_FIGHTING_STYLES: ProgressionChoiceOption[] = BASE_FIGHTING_STYLES;
export const PALADIN_FIGHTING_STYLES: ProgressionChoiceOption[] = [
    ...BASE_FIGHTING_STYLES,
    ...FIGHTING_STYLE_OPTIONS.filter((o) => o.id === "blessed-warrior")
];
export const RANGER_FIGHTING_STYLES: ProgressionChoiceOption[] = [...BASE_FIGHTING_STYLES, DRUIDIC_WARRIOR_OPTION];

export const BATTERING_ROOTS_OPTIONS: ProgressionChoiceOption[] = [
    { id: "push", name: "Battering Push", description: "Push the target up to 10 feet away from you on hit." },
    { id: "topple", name: "Battering Topple", description: "Knock the target Prone on hit on a failed Strength save." }
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
        spellPicks: [{
            id: "divine-order-thaumaturge",
            title: "Divine Order: Thaumaturge — Bonus Cleric Cantrip",
            sourceLabel: "Cleric / Divine Order (Thaumaturge)",
            description: "You know one extra cantrip of your choice from the Cleric spell list.",
            count: 1, lists: ["Cleric"], levels: [0], ability: "wis",
            sourceAliases: ["thaumaturge", "divine order"]
        }],
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
                minimum: 1,
                description: "Add Wisdom modifier to Arcana checks"
            },
            {
                target: "skills.religion",
                type: "ability_mod",
                abilitySource: "wis",
                minimum: 1,
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
        spellPicks: [{
            id: "primal-order-magician",
            title: "Primal Order: Magician — Bonus Druid Cantrip",
            sourceLabel: "Druid / Primal Order (Magician)",
            description: "You know one extra cantrip of your choice from the Druid spell list.",
            count: 1, lists: ["Druid"], levels: [0], ability: "wis",
            sourceAliases: ["magician", "primal order"]
        }],
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
                minimum: 1,
                description: "Add Wisdom modifier to Arcana checks"
            },
            {
                target: "skills.nature",
                type: "ability_mod",
                abilitySource: "wis",
                minimum: 1,
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
        spellPicks: [
            {
                id: "pact-of-the-tome-cantrips",
                title: "Pact of the Tome: Book of Shadows — Cantrips",
                sourceLabel: "Warlock / Pact of the Tome",
                description: "While the Book of Shadows is on your person, you have three chosen cantrips prepared from any class's spell list, and they function as Warlock spells for you.",
                count: 3, levels: [0], ability: "cha",
                sourceAliases: ["pact of the tome"]
            },
            {
                id: "pact-of-the-tome-rituals",
                title: "Pact of the Tome: Book of Shadows — 1st-Level Rituals & Bonus Spells",
                sourceLabel: "Warlock / Pact of the Tome",
                description: "Choose two 1st-level spells that have the Ritual tag from any class's spell list. While the book is on your person, you have the chosen spells prepared, and they function as Warlock spells for you.",
                count: 2, levels: [1], orRitual: true, ability: "cha",
                sourceAliases: ["pact of the tome"]
            }
        ],
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
                target: "vitals.devilsSight",
                type: "set",
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
        minLevel: 5,
        name: "Thirsting Blade",
        description: "Attack twice with your pact weapon whenever you take the Attack action.",
        prerequisite: "Level 5, Pact of the Blade"
    },
    {
        id: "lifedrinker",
        minLevel: 9,
        name: "Lifedrinker",
        description: "Hit with pact weapon deals 1d6 extra Necrotic, Psychic, or Radiant damage.",
        prerequisite: "Level 9, Pact of the Blade"
    },
    {
        id: "whispers-of-the-grave",
        minLevel: 9,
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
        minLevel: 5,
        name: "Gaze of Two Minds",
        description: "Use a Bonus Action to touch a willing humanoid and perceive through its senses until the end of your next turn. While perceiving, you can cast spells as though you were in its space.",
        prerequisite: "Level 5"
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
        minLevel: 2,
        name: "Lessons of the First Ones",
        description: "You gain one Origin feat of your choice.",
        prerequisite: "Level 2"
    },
    {
        id: "otherworldly-leap",
        minLevel: 2,
        name: "Otherworldly Leap",
        description: "You can cast Jump on yourself at will, without expending a spell slot.",
        prerequisite: "Level 2",
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
        minLevel: 5,
        name: "Ascendant Step",
        description: "You can cast Levitate on yourself at will, without expending a spell slot or material components.",
        prerequisite: "Level 5",
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
        minLevel: 5,
        name: "Eldritch Smite",
        description: "Once per turn when you hit with your pact weapon, spend a pact slot to deal 1d8 force damage plus 1d8 per slot level, and knock target prone if Huge or smaller.",
        prerequisite: "Level 5, Pact of the Blade"
    },
    {
        id: "master-of-myriad-forms",
        minLevel: 5,
        name: "Master of Myriad Forms",
        description: "You can cast Alter Self at will, without expending a spell slot.",
        prerequisite: "Level 5",
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
        minLevel: 5,
        name: "One with Shadows",
        description: "When you are in dim light or darkness, you can take a Magic action to become Invisible until you move or take an action or reaction.",
        prerequisite: "Level 5"
    },
    {
        id: "witch-sight",
        minLevel: 15,
        name: "Witch Sight",
        description: "You can see the true form of any shapechanger or creature concealed by illusion or transmutation magic within 30 feet.",
        prerequisite: "Level 15"
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
    { id: "medicine", name: "Medicine", description: "Gain Expertise in Medicine.", modifiers: [{ target: "skills.medicine", type: "proficiency_tier", value: "expertise" }] },
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
    { id: "panther", name: "Aspect of the Panther", description: "Gain climbing speed equal to walking speed.", modifiers: [{ target: "vitals.climb", type: "set", value: "walk", description: "Climbing speed equals walking speed" }] },
    { id: "pike", name: "Aspect of the Pike", description: "Gain swimming speed equal to walking speed.", modifiers: [{ target: "vitals.swim", type: "set", value: "walk", description: "Swimming speed equals walking speed" }] },
    { id: "spider", name: "Aspect of the Spider", description: "Gain climbing speed equal to walking speed.", modifiers: [{ target: "vitals.climb", type: "set", value: "walk", description: "Climbing speed equals walking speed" }] },
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

export const WILD_HEART_RAGES: ProgressionChoiceOption[] = [
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

export const WILD_HEART_TOTEMIC_ATTUNEMENTS: ProgressionChoiceOption[] = [
    {
        id: "falcon",
        name: "Falcon",
        description: "While raging, you gain a Flying Speed equal to your Walking Speed if you aren't wearing armor.",
        modifiers: [
            {
                target: "speeds.fly",
                type: "set",
                value: "equal_walk",
                condition: "while raging, not wearing armor",
                description: "Flying speed equal to walking speed"
            }
        ]
    },
    {
        id: "lion",
        name: "Lion",
        description: "While raging, whenever an enemy within 5 feet makes an attack against an ally, you can use your Reaction to make a melee attack roll against that enemy."
    },
    {
        id: "ram",
        name: "Ram",
        description: "While raging, whenever you hit a Large or smaller creature with a melee weapon attack on your turn, you can knock it Prone."
    }
];

export const ZEALOT_DIVINE_FURIES: ProgressionChoiceOption[] = [
    {
        id: "radiant",
        name: "Radiant Fury",
        description: "The first creature you hit on each of your turns with a weapon attack takes extra 1d6 + half Barbarian level Radiant damage.",
        modifiers: [
            {
                target: "damage.weapon_once_per_turn",
                type: "bonus",
                value: "1d6+lvl/2",
                description: "+1d6 + half level Radiant damage on first hit each turn"
            }
        ]
    },
    {
        id: "necrotic",
        name: "Necrotic Fury",
        description: "The first creature you hit on each of your turns with a weapon attack takes extra 1d6 + half Barbarian level Necrotic damage.",
        modifiers: [
            {
                target: "damage.weapon_once_per_turn",
                type: "bonus",
                value: "1d6+lvl/2",
                description: "+1d6 + half level Necrotic damage on first hit each turn"
            }
        ]
    }
];

export const HUNTER_DEFENSIVE_TACTICS: ProgressionChoiceOption[] = [
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

export const HUNTER_SUPERIOR_DEFENSE_OPTIONS: ProgressionChoiceOption[] = [
    {
        id: "evasion",
        name: "Evasion",
        description: "When subjected to an effect that allows a Dexterity saving throw for half damage, take no damage on success and half on failure.",
        modifiers: [
            {
                target: "saves.dex_evasion",
                type: "set",
                value: 1,
                description: "Take no damage on successful Dex save, half on failure"
            }
        ]
    },
    {
        id: "uncanny-dodge",
        name: "Uncanny Dodge",
        description: "Reaction when hit by an attacker you can see to halve the attack's damage against you.",
        modifiers: [
            {
                target: "actions.reaction",
                type: "grant_action",
                value: "Uncanny Dodge",
                description: "Halve attack damage as a reaction"
            }
        ]
    }
];

export const ELEMENTS_ATTUNEMENT_DAMAGE_TYPES: ProgressionChoiceOption[] = [
    { id: "acid", name: "Acid Attunement", description: "Unarmed strikes reach +10 ft. and can deal Acid damage.", modifiers: [{ target: "attacks.unarmed_reach", type: "bonus", value: 10, description: "+10 ft. reach" }] },
    { id: "cold", name: "Cold Attunement", description: "Unarmed strikes reach +10 ft. and can deal Cold damage.", modifiers: [{ target: "attacks.unarmed_reach", type: "bonus", value: 10, description: "+10 ft. reach" }] },
    { id: "fire", name: "Fire Attunement", description: "Unarmed strikes reach +10 ft. and can deal Fire damage.", modifiers: [{ target: "attacks.unarmed_reach", type: "bonus", value: 10, description: "+10 ft. reach" }] },
    { id: "lightning", name: "Lightning Attunement", description: "Unarmed strikes reach +10 ft. and can deal Lightning damage.", modifiers: [{ target: "attacks.unarmed_reach", type: "bonus", value: 10, description: "+10 ft. reach" }] },
    { id: "thunder", name: "Thunder Attunement", description: "Unarmed strikes reach +10 ft. and can deal Thunder damage.", modifiers: [{ target: "attacks.unarmed_reach", type: "bonus", value: 10, description: "+10 ft. reach" }] }
];

export const PRIMAL_COMPANION_TYPES: ProgressionChoiceOption[] = [
    { id: "land", name: "Beast of the Land", description: "A medium predatory beast with Maul (charge damage and knockdown prone) and 40 ft. walking + 40 ft. climbing speed." },
    { id: "sea", name: "Beast of the Sea", description: "An amphibious beast with Binding Strike (grapples on hit) and 60 ft. swimming speed + water breathing." },
    { id: "sky", name: "Beast of the Sky", description: "A small flying avian beast with Flyby and 60 ft. flying speed for scouting and aerial strikes." }
];

export const FIENDISH_RESILIENCE_DAMAGE_TYPES: ProgressionChoiceOption[] = [
    { id: "acid", name: "Acid", description: "Resistance to Acid damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "acid", description: "Acid Resistance" }] },
    { id: "bludgeoning", name: "Bludgeoning", description: "Resistance to Bludgeoning damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "bludgeoning", description: "Bludgeoning Resistance" }] },
    { id: "cold", name: "Cold", description: "Resistance to Cold damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "cold", description: "Cold Resistance" }] },
    { id: "fire", name: "Fire", description: "Resistance to Fire damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "fire", description: "Fire Resistance" }] },
    { id: "force", name: "Force", description: "Resistance to Force damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "force", description: "Force Resistance" }] },
    { id: "lightning", name: "Lightning", description: "Resistance to Lightning damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "lightning", description: "Lightning Resistance" }] },
    { id: "necrotic", name: "Necrotic", description: "Resistance to Necrotic damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "necrotic", description: "Necrotic Resistance" }] },
    { id: "piercing", name: "Piercing", description: "Resistance to Piercing damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "piercing", description: "Piercing Resistance" }] },
    { id: "poison", name: "Poison", description: "Resistance to Poison damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "poison", description: "Poison Resistance" }] },
    { id: "psychic", name: "Psychic", description: "Resistance to Psychic damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "psychic", description: "Psychic Resistance" }] },
    { id: "radiant", name: "Radiant", description: "Resistance to Radiant damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "radiant", description: "Radiant Resistance" }] },
    { id: "slashing", name: "Slashing", description: "Resistance to Slashing damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "slashing", description: "Slashing Resistance" }] },
    { id: "thunder", name: "Thunder", description: "Resistance to Thunder damage until next rest.", modifiers: [{ target: "defenses.resistance", type: "set", value: "thunder", description: "Thunder Resistance" }] }
];

export const OPEN_HAND_TECHNIQUES: ProgressionChoiceOption[] = [
    { id: "addle", name: "Addle", description: "Target cannot make Opportunity Attacks or take Reactions until the start of its next turn." },
    { id: "push", name: "Push", description: "Target must succeed on a Strength saving throw or be pushed up to 15 feet away." },
    { id: "topple", name: "Topple", description: "Target must succeed on a Dexterity saving throw or fall Prone." }
];

export const FEY_WANDERER_GLAMOUR_SKILLS: ProgressionChoiceOption[] = [
    { id: "Deception", name: "Deception", description: "Proficiency in Charisma (Deception).", modifiers: [{ target: "skills.deception", type: "proficiency_tier", value: "proficient" }] },
    { id: "Performance", name: "Performance", description: "Proficiency in Charisma (Performance).", modifiers: [{ target: "skills.performance", type: "proficiency_tier", value: "proficient" }] },
    { id: "Persuasion", name: "Persuasion", description: "Proficiency in Charisma (Persuasion).", modifiers: [{ target: "skills.persuasion", type: "proficiency_tier", value: "proficient" }] }
];

export const STEPS_OF_THE_FEY_OPTIONS: ProgressionChoiceOption[] = [
    { id: "taunting-step", name: "Taunting Step", description: "Creatures within 5 ft. of your origin space have Disadvantage on attack rolls against anyone but you." },
    { id: "refreshing-step", name: "Refreshing Step", description: "You or an ally within 10 ft. of destination gains temporary HP equal to 1d10 + Charisma modifier." }
];

export const STARRY_FORM_CONSTELLATIONS: ProgressionChoiceOption[] = [
    { id: "archer", name: "Archer", description: "Bonus Action ranged spell attack (60 ft.) dealing 1d8 + Wisdom modifier Radiant damage." },
    { id: "chalice", name: "Chalice", description: "Healing spell slot triggers 1d8 + Wisdom modifier additional HP to self or ally within 30 ft." },
    { id: "dragon", name: "Dragon", description: "Treat d20 rolls of 9 or lower as 10 on Int/Wis checks and Constitution concentration saves." }
];

export const SEA_WRATH_DAMAGE_TYPES: ProgressionChoiceOption[] = [
    { id: "cold", name: "Cold Wrath", description: "Wrath of the Sea tempest aura deals Cold damage." },
    { id: "thunder", name: "Thunder Wrath", description: "Wrath of the Sea tempest aura deals Thunder damage and repels enemies." }
];

export const MOON_CIRCLE_FORMS_STRIKES: ProgressionChoiceOption[] = [
    { id: "radiant", name: "Radiant Strike", description: "Beast natural attacks deal Radiant damage." },
    { id: "physical", name: "Natural Physical Strike", description: "Beast natural attacks deal standard physical damage." }
];

export const WAR_GOD_BLESSING_OPTIONS: ProgressionChoiceOption[] = [
    {
        id: "shield-of-faith",
        name: "Shield of Faith",
        description: "Cast Shield of Faith via Channel Divinity without expending a spell slot.",
        grantedSpells: [{ name: "Shield of Faith", level: 1, alwaysPrepared: true, notes: "Cast via Channel Divinity" }]
    },
    {
        id: "spiritual-weapon",
        name: "Spiritual Weapon",
        description: "Cast Spiritual Weapon via Channel Divinity without expending a spell slot.",
        grantedSpells: [{ name: "Spiritual Weapon", level: 2, alwaysPrepared: true, notes: "Cast via Channel Divinity" }]
    }
];

// Champion's Additional Fighting Style: any Fighting Style feat a Fighter can take
export const CHAMPION_ADDITIONAL_FIGHTING_STYLES: ProgressionChoiceOption[] = BASE_FIGHTING_STYLES;

export const PSI_WARRIOR_THRUST_OPTIONS: ProgressionChoiceOption[] = [
    { id: "push", name: "Telekinetic Push", description: "Push target up to 10 feet horizontally away on a failed Strength save." },
    { id: "topple", name: "Telekinetic Topple", description: "Knock target Prone on a failed Strength save." }
];

export const DIVINER_THIRD_EYE_OPTIONS: ProgressionChoiceOption[] = [
    { id: "darkvision", name: "Darkvision", description: "Gain Darkvision with a range of 120 feet until your next rest.", modifiers: [{ target: "vitals.darkvision", type: "set", value: 120, description: "Darkvision 120 ft." }] },
    { id: "ethereal-sight", name: "Ethereal Sight", description: "See into the Ethereal Plane within 60 feet." },
    { id: "greater-comprehension", name: "Greater Comprehension", description: "Read any language." },
    { id: "see-invisibility", name: "See Invisibility", description: "See invisible creatures within 10 feet." }
];

export const ABERRANT_REVELATION_OPTIONS: ProgressionChoiceOption[] = [
    { id: "flight", name: "Aquatic / Aerial Flight", description: "Gain flying speed and swimming speed equal to walking speed and hover." },
    { id: "see-invis", legacyIds: ["see-invisibility"], name: "See Invisibility", description: "See invisible creatures within 60 feet." },
    { id: "viscous-body", name: "Viscous Body", description: "Escape grapples easily and squeeze through 1-inch spaces." }
];

export const ROGUE_DEVIOUS_STRIKES: ProgressionChoiceOption[] = [
    { id: "daze", name: "Daze (Cost: 2d6)", description: "Target must make Con save or can only take an action or bonus action on its next turn." },
    { id: "knock-out", name: "Knock Out (Cost: 6d6)", description: "Target must make Con save or fall Unconscious for 1 minute or until damaged." },
    { id: "obscure", name: "Obscure (Cost: 3d6)", description: "Target is Blinded until end of its next turn on failed Dex save." }
];

export const TACTICAL_MASTER_PROPERTIES: ProgressionChoiceOption[] = [
    { id: "push", name: "Push", description: "Push a target you hit up to 10 feet away." },
    { id: "sap", name: "Sap", description: "Target has Disadvantage on its next attack roll before start of your next turn." },
    { id: "slow", name: "Slow", description: "Target speed reduced by 10 feet until start of your next turn." }
];

export const BRUTAL_STRIKE_OPTIONS: ProgressionChoiceOption[] = [
    { id: "forceful-blow", name: "Forceful Blow", description: "Push target 15 ft. away and move toward it without provoking opportunity attacks." },
    { id: "hamstring-blow", name: "Hamstring Blow", description: "Reduce target speed by 15 ft. until start of next turn." }
];

export const IMPROVED_BRUTAL_STRIKE_OPTIONS: ProgressionChoiceOption[] = [
    { id: "staggering-blow", name: "Staggering Blow", description: "Target has Disadvantage on saving throws and cannot make Opportunity Attacks until next turn." },
    { id: "sundering-blow", name: "Sundering Blow", description: "Next attack roll against target by an ally has +5 bonus." }
];

// --------------------------------------------------------------------------
// Class Progression Generator (Levels 1 to 20)
// --------------------------------------------------------------------------

/** Spell picks a class feature grants (Mystic Arcanum, Spell Mastery, Signature Spells). */
function classFeatureSpellPicks(classSlug: string, lvl: number, featSlug: string): SpellPick[] | undefined {
    if (classSlug === "warlock" && featSlug.startsWith("mystic-arcanum")) {
        const spellLevel = ({ 11: 6, 13: 7, 15: 8, 17: 9 } as Record<number, number>)[lvl];
        if (!spellLevel) return undefined;
        const label = `${spellLevel}th`;
        return [{
            id: `warlock-${lvl}-mystic-arcanum`,
            title: `Mystic Arcanum (${label} Level)`,
            sourceLabel: `Warlock / Mystic Arcanum (${label} Level)`,
            description: `Your patron grants you a magical secret called an arcanum. Choose one ${label}-level Warlock spell as this arcanum. You can cast it once without expending a spell slot per Long Rest.`,
            count: 1, lists: ["Warlock"], levels: [spellLevel], ability: "cha",
            sourceAliases: ["mystic arcanum"]
        }];
    }
    if (classSlug === "wizard" && featSlug === "spell-mastery") {
        return [1, 2].map((spellLevel) => ({
            id: `wizard-18-spell-mastery-${spellLevel}`,
            title: `Spell Mastery — Level ${spellLevel} Wizard Spell`,
            sourceLabel: "Wizard / Spell Mastery",
            description: `Choose one Level ${spellLevel} Wizard spell that has a casting time of an action. You always have it prepared and can cast it at its lowest level without expending a spell slot.`,
            count: 1, lists: ["Wizard"], levels: [spellLevel], ability: "int" as AbilityName,
            sourceAliases: ["spell mastery"]
        }));
    }
    if (classSlug === "wizard" && featSlug === "signature-spells") {
        return [{
            id: "wizard-20-signature-spells",
            title: "Signature Spells — Level 3 Wizard Spells",
            sourceLabel: "Wizard / Signature Spells",
            description: "Choose two Level 3 Wizard spells in your spellbook as your signature spells. You always have these spells prepared and can cast each of them once at 3rd level without expending a spell slot per Short or Long Rest.",
            count: 2, lists: ["Wizard"], levels: [3], ability: "int",
            sourceAliases: ["signature spell"]
        }];
    }
    return undefined;
}

export function buildClassProgression(classSlug: string, baseFeatures: Array<{ name: string; level: number; description: string }> = []): ProgressionLevel[] {
    const levels: ProgressionLevel[] = [];

    for (let lvl = 1; lvl <= 20; lvl++) {
        // Collect features at this level
        const levelFeatures = baseFeatures.filter(f => f.level === lvl).map(f => {
            const featSlug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const modifiers: StatModifier[] = [];

            // Add inherent modifiers for well-known features
            if (featSlug === "fast-movement") {
                modifiers.push({ target: "vitals.speed", type: "bonus", value: 10, requires: "no-heavy-armor", condition: "not wearing heavy armor", description: "+10 ft. Walking Speed" });
            } else if (featSlug === "unarmored-movement") {
                modifiers.push({
                    target: "vitals.speed", type: "bonus", requires: "no-armor-or-shield",
                    valueByLevel: [0, 0, 10, 10, 10, 10, 15, 15, 15, 15, 20, 20, 20, 20, 25, 25, 25, 25, 30, 30, 30],
                    condition: "not wearing armor or wielding a shield", description: "Speed increase while unarmored"
                });
            } else if (featSlug === "roving") {
                modifiers.push({ target: "vitals.speed", type: "bonus", value: 10, requires: "no-heavy-armor", condition: "not wearing heavy armor", description: "+10 ft. Speed" });
                modifiers.push({ target: "vitals.climb", type: "set", value: "walk", description: "Climb Speed equal to Speed" });
                modifiers.push({ target: "vitals.swim", type: "set", value: "walk", description: "Swim Speed equal to Speed" });
            } else if (featSlug === "feral-instinct") {
                modifiers.push({ target: "vitals.initiative", type: "advantage", description: "Advantage on Initiative rolls" });
            } else if (featSlug === "primal-champion") {
                modifiers.push({ target: "abilities.str", type: "bonus", value: 4, description: "+4 Strength (max 25)" });
                modifiers.push({ target: "abilities.con", type: "bonus", value: 4, description: "+4 Constitution (max 25)" });
            } else if (featSlug === "aura-of-protection") {
                modifiers.push({ target: "saves.all", type: "ability_mod", abilitySource: "cha", minimum: 1, condition: "not incapacitated", description: "Add Charisma modifier (minimum +1) to all saving throws" });
            } else if (featSlug === "unarmored-defense") {
                // Barbarian: 10 + DEX + CON, shield allowed; Monk: 10 + DEX + WIS, no shield
                const isMonk = classSlug === "monk";
                modifiers.push({
                    target: "vitals.ac", type: "unarmored_ac",
                    abilities: isMonk ? ["dex", "wis"] : ["dex", "con"],
                    allowsShield: !isMonk,
                    description: isMonk ? "AC 10 + DEX + WIS while wearing no armor and no shield" : "AC 10 + DEX + CON while wearing no armor"
                });
            } else if (featSlug === "disciplined-survivor") {
                modifiers.push({ target: "saves.all", type: "proficiency_tier", value: "proficient", description: "Proficiency in all saving throws" });
            } else if (featSlug === "jack-of-all-trades") {
                modifiers.push({ target: "skills.unproficient", type: "half_proficiency", description: "Add half your Proficiency Bonus to skill checks you aren't proficient in" });
            }

            const spellPicks = classFeatureSpellPicks(classSlug, lvl, featSlug);
            return {
                id: `${classSlug}-${lvl}-${featSlug}`,
                name: f.name,
                description: f.description,
                modifiers: modifiers.length > 0 ? modifiers : undefined,
                spellPicks
            };
        });

        const choices: ProgressionChoice[] = [];
        const resourceUpdates: ProgressionResourceUpdate[] = [];
        const badges: string[] = [];

        // Build class-specific progression choices and resources per level
        switch (classSlug) {
            case "barbarian":
                // Rages scaling: 2 (1-2), 3 (3-5), 4 (6-11), 5 (12-16), 6 (17-20)
                const rages = lvl >= 17 ? 6 : lvl >= 12 ? 5 : lvl >= 6 ? 4 : lvl >= 3 ? 3 : 2;
                resourceUpdates.push({ name: "Rage", total: rages, resetOn: "long" });
                badges.push(`Rage Damage ${lvl >= 16 ? "+4" : lvl >= 9 ? "+3" : "+2"}`);
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
                if (lvl === 13) {
                    choices.push({
                        id: "brutal-strike",
                        legacyKeys: ["improved-brutal-strike"],
                        name: "Improved Brutal Strike",
                        prompt: "Choose your primary Improved Brutal Strike technique.",
                        chooseCount: 1,
                        options: IMPROVED_BRUTAL_STRIKE_OPTIONS
                    });
                }
                break;

            case "bard":
                // Bardic Inspiration: uses = CHA mod, die size scales
                const bDie = lvl >= 15 ? "d12" : lvl >= 10 ? "d10" : lvl >= 5 ? "d8" : "d6";
                resourceUpdates.push({
                    name: "Bardic Inspiration", total: "{{cha}}", die: bDie, resetOn: lvl >= 5 ? "short" : "long",
                    aliases: ["Cutting Words", "Combat Inspiration", "Mantle of Inspiration"]
                });
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
                // 2024: 2 at level 2, 3 at 6, 4 at 18
                const chUses = lvl >= 18 ? 4 : lvl >= 6 ? 3 : lvl >= 2 ? 2 : 0;
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
                        options: FIGHTER_FIGHTING_STYLES
                    });
                }
                if (lvl === 9) {
                    choices.push({
                        id: "tactical-master",
                        name: "Tactical Master",
                        prompt: "Choose the mastery property you most often swap in.",
                        chooseCount: 1,
                        options: TACTICAL_MASTER_PROPERTIES
                    });
                }
                if (lvl >= 2) {
                    resourceUpdates.push({ name: "Action Surge", total: lvl >= 17 ? 2 : 1, resetOn: "short" });
                }
                resourceUpdates.push({ name: "Second Wind", total: lvl >= 10 ? 4 : lvl >= 4 ? 3 : 2, die: "1d10+{{level}}", resetOn: "short" });
                if (lvl >= 9) {
                    resourceUpdates.push({ name: "Indomitable", total: lvl >= 17 ? 3 : lvl >= 13 ? 2 : 1, resetOn: "long" });
                }
                badges.push(lvl >= 20 ? "4 Attacks" : lvl >= 11 ? "3 Attacks" : lvl >= 5 ? "2 Attacks" : "1 Attack");
                break;

            case "monk":
                if (lvl >= 2) {
                    resourceUpdates.push({ name: "Focus Points", total: lvl, resetOn: "short" });
                }
                badges.push(`Martial Arts ${lvl >= 17 ? "1d12" : lvl >= 11 ? "1d10" : lvl >= 5 ? "1d8" : "1d6"}`);
                break;

            case "paladin":
                resourceUpdates.push({ name: "Lay on Hands", total: lvl * 5, resetOn: "long" });
                if (lvl === 2) {
                    choices.push({
                        id: "fighting-style",
                        name: "Fighting Style",
                        prompt: "Select a Fighting Style feat.",
                        chooseCount: 1,
                        options: PALADIN_FIGHTING_STYLES
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
                        options: RANGER_FIGHTING_STYLES
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
                if (lvl === 14) {
                    choices.push({
                        id: "devious-strike",
                        name: "Devious Strike",
                        prompt: "Choose your primary Devious Strike option.",
                        chooseCount: 1,
                        options: ROGUE_DEVIOUS_STRIKES
                    });
                }
                break;

            case "sorcerer":
                resourceUpdates.push({ name: "Innate Sorcery", total: 2, resetOn: "long" });
                if (lvl >= 2) {
                    resourceUpdates.push({ name: "Sorcery Points", total: lvl, resetOn: "long" });
                }
                if (lvl === 2) {
                    choices.push({
                        id: "metamagic",
                        pool: "metamagic",
                        name: "Metamagic",
                        prompt: "Select 2 Metamagic options.",
                        chooseCount: 2,
                        options: METAMAGIC_OPTIONS
                    });
                } else if (lvl === 10 || lvl === 17) {
                    choices.push({
                        id: `metamagic-${lvl}`,
                        pool: "metamagic",
                        name: "Metamagic",
                        prompt: "Select 1 additional Metamagic option.",
                        chooseCount: 1,
                        options: METAMAGIC_OPTIONS
                    });
                }
                break;

            case "warlock":
                const invCount = lvl >= 18 ? 10 : lvl >= 15 ? 9 : lvl >= 12 ? 8 : lvl >= 9 ? 7 : lvl >= 7 ? 6 : lvl >= 5 ? 5 : lvl >= 2 ? 3 : 1;
                choices.push({
                    id: "eldritch-invocations",
                    pool: "invocations",
                    choiceId: "eldritch-invocations",
                    name: "Eldritch Invocations",
                    prompt: `Select Eldritch Invocations (choose up to ${invCount}).`,
                    chooseCount: invCount,
                    options: ELDRITCH_INVOCATIONS
                });
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
            resourceUpdates: resourceUpdates.length > 0 ? resourceUpdates : undefined,
            badges: badges.length > 0 ? badges : undefined
        });
    }

    return levels;
}

// --------------------------------------------------------------------------
// Subclass Progression Generator (for all 48 subclasses)
// --------------------------------------------------------------------------

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function makeGrantedSpell(name: string, level: number, source: string, extra?: Partial<ProgressionGrantedSpell>): ProgressionGrantedSpell {
    const slug = slugify(name);
    return {
        id: slug,
        spellId: slug,
        name,
        level,
        alwaysPrepared: true,
        source,
        ...extra
    };
}

export function getSubclassGrantedSpells(classSlug: string, normSub: string, lvl: number, subName: string): ProgressionGrantedSpell[] {
    const spells: ProgressionGrantedSpell[] = [];

    // Warlock Patrons
    if (normSub.includes("great-old-one")) {
        if (lvl === 3) {
            spells.push(
                makeGrantedSpell("Detect Thoughts", 2, subName),
                makeGrantedSpell("Dissonant Whispers", 1, subName),
                makeGrantedSpell("Phantasmal Force", 2, subName),
                makeGrantedSpell("Tasha's Hideous Laughter", 1, subName)
            );
        } else if (lvl === 5) {
            spells.push(
                makeGrantedSpell("Clairvoyance", 3, subName),
                makeGrantedSpell("Hunger of Hadar", 3, subName)
            );
        } else if (lvl === 7) {
            spells.push(
                makeGrantedSpell("Confusion", 4, subName),
                makeGrantedSpell("Summon Aberration", 4, subName)
            );
        } else if (lvl === 9) {
            spells.push(
                makeGrantedSpell("Modify Memory", 5, subName),
                makeGrantedSpell("Telekinesis", 5, subName)
            );
        } else if (lvl === 10) {
            spells.push(
                makeGrantedSpell("Hex", 1, subName, { notes: "Eldritch Hex: always prepared; target has Disadvantage on saves of the chosen ability" })
            );
        }
    } else if (normSub.includes("archfey")) {
        if (lvl === 3) {
            spells.push(
                makeGrantedSpell("Faerie Fire", 1, subName),
                makeGrantedSpell("Sleep", 1, subName),
                makeGrantedSpell("Calm Emotions", 2, subName),
                makeGrantedSpell("Phantasmal Force", 2, subName),
                makeGrantedSpell("Misty Step", 2, subName, { notes: "Steps of the Fey free casts per rest" })
            );
        } else if (lvl === 5) {
            spells.push(
                makeGrantedSpell("Blink", 3, subName),
                makeGrantedSpell("Plant Growth", 3, subName)
            );
        } else if (lvl === 7) {
            spells.push(
                makeGrantedSpell("Dominate Beast", 4, subName),
                makeGrantedSpell("Greater Invisibility", 4, subName)
            );
        } else if (lvl === 9) {
            spells.push(
                makeGrantedSpell("Dominate Person", 5, subName),
                makeGrantedSpell("Seeming", 5, subName)
            );
        }
    } else if (normSub.includes("fiend")) {
        if (lvl === 3) {
            spells.push(
                makeGrantedSpell("Burning Hands", 1, subName),
                makeGrantedSpell("Command", 1, subName),
                makeGrantedSpell("Scorching Ray", 2, subName),
                makeGrantedSpell("Suggestion", 2, subName)
            );
        } else if (lvl === 5) {
            spells.push(
                makeGrantedSpell("Fireball", 3, subName),
                makeGrantedSpell("Stinking Cloud", 3, subName)
            );
        } else if (lvl === 7) {
            spells.push(
                makeGrantedSpell("Fire Shield", 4, subName),
                makeGrantedSpell("Wall of Fire", 4, subName)
            );
        } else if (lvl === 9) {
            spells.push(
                makeGrantedSpell("Geas", 5, subName),
                makeGrantedSpell("Insect Plague", 5, subName)
            );
        }
    } else if (normSub.includes("celestial")) {
        if (lvl === 3) {
            spells.push(
                makeGrantedSpell("Light", 0, subName, { notes: "Bonus Cantrip" }),
                makeGrantedSpell("Sacred Flame", 0, subName, { notes: "Bonus Cantrip" }),
                makeGrantedSpell("Aid", 2, subName),
                makeGrantedSpell("Cure Wounds", 1, subName),
                makeGrantedSpell("Guiding Bolt", 1, subName),
                makeGrantedSpell("Lesser Restoration", 2, subName)
            );
        } else if (lvl === 5) {
            spells.push(
                makeGrantedSpell("Daylight", 3, subName),
                makeGrantedSpell("Revivify", 3, subName)
            );
        } else if (lvl === 7) {
            spells.push(
                makeGrantedSpell("Guardian of Faith", 4, subName),
                makeGrantedSpell("Wall of Fire", 4, subName)
            );
        } else if (lvl === 9) {
            spells.push(
                makeGrantedSpell("Greater Restoration", 5, subName),
                makeGrantedSpell("Summon Celestial", 5, subName)
            );
        }
    }

    // Cleric Domains
    if (classSlug === "cleric" || normSub.includes("domain")) {
        if (normSub.includes("life")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Bless", 1, subName),
                    makeGrantedSpell("Cure Wounds", 1, subName),
                    makeGrantedSpell("Aid", 2, subName),
                    makeGrantedSpell("Lesser Restoration", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Beacon of Hope", 3, subName),
                    makeGrantedSpell("Revivify", 3, subName)
                );
            } else if (lvl === 7) {
                spells.push(
                    makeGrantedSpell("Death Ward", 4, subName),
                    makeGrantedSpell("Guardian of Faith", 4, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Mass Cure Wounds", 5, subName),
                    makeGrantedSpell("Raise Dead", 5, subName)
                );
            }
        } else if (normSub.includes("light")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Burning Hands", 1, subName),
                    makeGrantedSpell("Faerie Fire", 1, subName),
                    makeGrantedSpell("Flaming Sphere", 2, subName),
                    makeGrantedSpell("Scorching Ray", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Daylight", 3, subName),
                    makeGrantedSpell("Fireball", 3, subName)
                );
            } else if (lvl === 7) {
                spells.push(
                    makeGrantedSpell("Guardian of Faith", 4, subName),
                    makeGrantedSpell("Wall of Fire", 4, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Flame Strike", 5, subName),
                    makeGrantedSpell("Scrying", 5, subName)
                );
            }
        } else if (normSub.includes("trickery")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Charm Person", 1, subName),
                    makeGrantedSpell("Disguise Self", 1, subName),
                    makeGrantedSpell("Invisibility", 2, subName),
                    makeGrantedSpell("Pass without Trace", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Hypnotic Pattern", 3, subName),
                    makeGrantedSpell("Nondetection", 3, subName)
                );
            } else if (lvl === 7) {
                spells.push(
                    makeGrantedSpell("Confusion", 4, subName),
                    makeGrantedSpell("Dimension Door", 4, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Dominate Person", 5, subName),
                    makeGrantedSpell("Modify Memory", 5, subName)
                );
            }
        } else if (normSub.includes("war")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Divine Favor", 1, subName),
                    makeGrantedSpell("Shield of Faith", 1, subName),
                    makeGrantedSpell("Magic Weapon", 2, subName),
                    makeGrantedSpell("Spiritual Weapon", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Crusader's Mantle", 3, subName),
                    makeGrantedSpell("Spirit Guardians", 3, subName)
                );
            } else if (lvl === 7) {
                spells.push(
                    makeGrantedSpell("Fire Shield", 4, subName),
                    makeGrantedSpell("Freedom of Movement", 4, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Hold Monster", 5, subName),
                    makeGrantedSpell("Steel Wind Strike", 5, subName)
                );
            }
        }
    }

    // Paladin Oaths
    if (classSlug === "paladin" || normSub.includes("oath")) {
        if (normSub.includes("devotion")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Protection from Evil and Good", 1, subName),
                    makeGrantedSpell("Sanctuary", 1, subName),
                    makeGrantedSpell("Aid", 2, subName),
                    makeGrantedSpell("Zone of Truth", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Beacon of Hope", 3, subName),
                    makeGrantedSpell("Dispel Magic", 3, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Freedom of Movement", 4, subName),
                    makeGrantedSpell("Guardian of Faith", 4, subName)
                );
            } else if (lvl === 13) {
                spells.push(
                    makeGrantedSpell("Commune", 5, subName),
                    makeGrantedSpell("Flame Strike", 5, subName)
                );
            }
        } else if (normSub.includes("glory")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Guiding Bolt", 1, subName),
                    makeGrantedSpell("Heroism", 1, subName),
                    makeGrantedSpell("Enhance Ability", 2, subName),
                    makeGrantedSpell("Magic Weapon", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Haste", 3, subName),
                    makeGrantedSpell("Protection from Energy", 3, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Compulsion", 4, subName),
                    makeGrantedSpell("Freedom of Movement", 4, subName)
                );
            } else if (lvl === 13) {
                spells.push(
                    makeGrantedSpell("Commune with Nature", 5, subName),
                    makeGrantedSpell("Flame Strike", 5, subName)
                );
            }
        } else if (normSub.includes("ancients")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Ensnaring Strike", 1, subName),
                    makeGrantedSpell("Speak with Animals", 1, subName),
                    makeGrantedSpell("Misty Step", 2, subName),
                    makeGrantedSpell("Moonbeam", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Plant Growth", 3, subName),
                    makeGrantedSpell("Protection from Energy", 3, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Ice Storm", 4, subName),
                    makeGrantedSpell("Stoneskin", 4, subName)
                );
            } else if (lvl === 13) {
                spells.push(
                    makeGrantedSpell("Commune with Nature", 5, subName),
                    makeGrantedSpell("Tree Stride", 5, subName)
                );
            }
        } else if (normSub.includes("vengeance")) {
            if (lvl === 3) {
                spells.push(
                    makeGrantedSpell("Bane", 1, subName),
                    makeGrantedSpell("Hunter's Mark", 1, subName),
                    makeGrantedSpell("Hold Person", 2, subName),
                    makeGrantedSpell("Misty Step", 2, subName)
                );
            } else if (lvl === 5) {
                spells.push(
                    makeGrantedSpell("Haste", 3, subName),
                    makeGrantedSpell("Protection from Energy", 3, subName)
                );
            } else if (lvl === 9) {
                spells.push(
                    makeGrantedSpell("Banishment", 4, subName),
                    makeGrantedSpell("Dimension Door", 4, subName)
                );
            } else if (lvl === 13) {
                spells.push(
                    makeGrantedSpell("Hold Monster", 5, subName),
                    makeGrantedSpell("Scrying", 5, subName)
                );
            }
        }
    }

    // Ranger Archetypes
    if (classSlug === "ranger") {
        if (normSub.includes("gloom")) {
            if (lvl === 3) spells.push(makeGrantedSpell("Disguise Self", 1, subName));
            else if (lvl === 5) spells.push(makeGrantedSpell("Rope Trick", 2, subName));
            else if (lvl === 9) spells.push(makeGrantedSpell("Fear", 3, subName));
            else if (lvl === 13) spells.push(makeGrantedSpell("Greater Invisibility", 4, subName));
            else if (lvl === 17) spells.push(makeGrantedSpell("Seeming", 5, subName));
        } else if (normSub.includes("fey-wanderer") || normSub.includes("fey")) {
            if (lvl === 3) spells.push(makeGrantedSpell("Charm Person", 1, subName));
            else if (lvl === 5) spells.push(makeGrantedSpell("Misty Step", 2, subName));
            else if (lvl === 9) spells.push(makeGrantedSpell("Dispel Magic", 3, subName));
            else if (lvl === 13) spells.push(makeGrantedSpell("Dimension Door", 4, subName));
            else if (lvl === 17) spells.push(makeGrantedSpell("Mislead", 5, subName));
        }
    }

    // Druid Circles
    if (normSub.includes("stars") && lvl === 3) {
        spells.push(makeGrantedSpell("Guiding Bolt", 1, subName, { notes: "Star Map always prepared, free casts equal to PB" }));
    } else if (normSub.includes("sea")) {
        if (lvl === 3) {
            spells.push(
                makeGrantedSpell("Fog Cloud", 1, subName),
                makeGrantedSpell("Thunderwave", 1, subName),
                makeGrantedSpell("Gust of Wind", 2, subName),
                makeGrantedSpell("Shatter", 2, subName)
            );
        } else if (lvl === 5) {
            spells.push(
                makeGrantedSpell("Lightning Bolt", 3, subName),
                makeGrantedSpell("Water Breathing", 3, subName)
            );
        } else if (lvl === 7) {
            spells.push(
                makeGrantedSpell("Control Water", 4, subName),
                makeGrantedSpell("Ice Storm", 4, subName)
            );
        } else if (lvl === 9) {
            spells.push(
                makeGrantedSpell("Conjure Elemental", 5, subName),
                makeGrantedSpell("Maelstrom", 5, subName)
            );
        }
    }

    // Bard Colleges
    if (normSub.includes("glamour")) {
        if (lvl === 3) {
            spells.push(
                makeGrantedSpell("Charm Person", 1, subName, { notes: "Beguiling Magic" }),
                makeGrantedSpell("Mirror Image", 2, subName, { notes: "Beguiling Magic" })
            );
        } else if (lvl === 6) {
            spells.push(
                makeGrantedSpell("Command", 1, subName, { atWill: true, notes: "Mantle of Majesty: cast as Bonus Action without spell slot" })
            );
        }
    }

    return spells;
}

export function getSubclassChoices(normSub: string, lvl: number): ProgressionChoice[] {
    const choices: ProgressionChoice[] = [];

    // 1. Barbarian Subclasses
    if (normSub.includes("wild-heart")) {
        if (lvl === 3) {
            choices.push({
                id: "wild-heart-rage",
                choiceId: "wild-heart-rage",
                name: "Rage of the Wilds",
                prompt: "Choose your primary animal aspect for Rage.",
                chooseCount: 1,
                options: WILD_HEART_RAGES
            });
        } else if (lvl === 6) {
            choices.push({
                id: "aspect-of-the-beast",
                choiceId: "aspect-of-the-beast",
                legacyKeys: ["aspect"],
                name: "Aspect of the Beast",
                prompt: "Choose 1 primal animal aspect.",
                chooseCount: 1,
                options: BARBARIAN_ASPECTS
            });
        } else if (lvl === 14) {
            choices.push({
                id: "totemic-attunement",
                choiceId: "totemic-attunement",
                name: "Totemic Attunement",
                prompt: "Choose your Totemic Attunement benefit.",
                chooseCount: 1,
                options: WILD_HEART_TOTEMIC_ATTUNEMENTS
            });
        }
    } else if (normSub.includes("world-tree") && lvl === 10) {
        choices.push({
            id: "battering-roots",
            choiceId: "battering-roots",
            name: "Battering Roots",
            prompt: "Choose the mastery property Battering Roots adds most often.",
            chooseCount: 1,
            options: BATTERING_ROOTS_OPTIONS
        });
    } else if (normSub.includes("zealot") && lvl === 3) {
        choices.push({
            id: "divine-fury",
            choiceId: "divine-fury",
            name: "Divine Fury",
            prompt: "Choose Radiant or Necrotic damage for Divine Fury.",
            chooseCount: 1,
            options: ZEALOT_DIVINE_FURIES
        });
    }

    // 2. Fighter Subclasses
    if (normSub.includes("battle-master") && lvl === 3) {
        choices.push({
            id: "maneuvers-3",
            pool: "maneuvers",
            choiceId: "maneuvers-3",
            name: "Maneuvers",
            prompt: "Choose 3 Battle Master Maneuvers.",
            chooseCount: 3,
            options: BATTLE_MASTER_MANEUVERS
        });
        choices.push({
            id: "student-of-war",
            choiceId: "student-of-war",
            legacyKeys: ["fighter-3-battle-master-student"],
            name: "Student of War",
            prompt: "Choose 1 skill proficiency.",
            chooseCount: 1,
            options: STUDENT_OF_WAR_SKILLS
        });
    } else if (normSub.includes("champion") && lvl === 7) {
        choices.push({
            id: "additional-fighting-style",
            choiceId: "additional-fighting-style",
            legacyKeys: ["champion-style"],
            name: "Additional Fighting Style",
            prompt: "Choose a second Fighting Style feat.",
            chooseCount: 1,
            options: CHAMPION_ADDITIONAL_FIGHTING_STYLES
        });
    } else if (normSub.includes("psi-warrior") && lvl === 7) {
        choices.push({
            id: "telekinetic-thrust",
            choiceId: "telekinetic-thrust",
            legacyKeys: ["psi-thrust"],
            name: "Telekinetic Thrust",
            prompt: "Choose Telekinetic Push or Topple.",
            chooseCount: 1,
            options: PSI_WARRIOR_THRUST_OPTIONS
        });
    }

    // 3. Druid Subclasses
    if (normSub.includes("land") && lvl === 3) {
        choices.push({
            id: "land-biome",
            choiceId: "land-biome",
            legacyKeys: ["druid-6-land"],
            name: "Land Biome",
            prompt: "Choose your current land biome affinity.",
            chooseCount: 1,
            options: DRUID_LAND_BIOMES
        });
    } else if (normSub.includes("stars") && lvl === 3) {
        choices.push({
            id: "starry-form",
            choiceId: "starry-form",
            name: "Starry Form",
            prompt: "Choose a Starry Form constellation.",
            chooseCount: 1,
            options: STARRY_FORM_CONSTELLATIONS
        });
    } else if (normSub.includes("sea") && lvl === 3) {
        choices.push({
            id: "wrath-of-the-sea",
            choiceId: "wrath-of-the-sea",
            legacyKeys: ["sea-wrath"],
            name: "Wrath of the Sea",
            prompt: "Choose Cold or Thunder wrath damage.",
            chooseCount: 1,
            options: SEA_WRATH_DAMAGE_TYPES
        });
    } else if (normSub.includes("moon") && lvl === 3) {
        choices.push({
            id: "circle-forms-strike",
            choiceId: "circle-forms-strike",
            legacyKeys: ["moon-circle-strike"],
            name: "Circle Forms Strike",
            prompt: "Choose Radiant or Natural Physical beast strike damage.",
            chooseCount: 1,
            options: MOON_CIRCLE_FORMS_STRIKES
        });
    }

    // 4. Cleric Subclasses (War Domain; not Psi Warrior, whose id also contains "war")
    if ((normSub === "war" || normSub === "war-domain") && lvl === 6) {
        choices.push({
            id: "war-god-blessing",
            choiceId: "war-god-blessing",
            legacyKeys: ["war-god"],
            name: "War God's Blessing",
            prompt: "Choose a spell to cast via War God's Blessing.",
            chooseCount: 1,
            options: WAR_GOD_BLESSING_OPTIONS
        });
    }

    // 5. Monk Subclasses
    if (normSub.includes("open-hand") && lvl === 3) {
        choices.push({
            id: "open-hand-technique",
            choiceId: "open-hand-technique",
            legacyKeys: ["open-hand"],
            name: "Open Hand Technique",
            prompt: "Choose your preferred Open Hand Technique effect.",
            chooseCount: 1,
            options: OPEN_HAND_TECHNIQUES
        });
    } else if (normSub.includes("elements") && lvl === 3) {
        choices.push({
            id: "elemental-attunement",
            choiceId: "elemental-attunement",
            name: "Elemental Attunement",
            prompt: "Choose an elemental damage type for unarmed strikes.",
            chooseCount: 1,
            options: ELEMENTS_ATTUNEMENT_DAMAGE_TYPES
        });
    }

    // 6. Ranger Subclasses
    if (normSub.includes("hunter")) {
        if (lvl === 3) {
            choices.push({
                id: "hunter-prey",
                choiceId: "hunter-prey",
                name: "Hunter's Prey",
                prompt: "Choose your Hunter's Prey feature.",
                chooseCount: 1,
                options: HUNTER_PREY_OPTIONS
            });
        } else if (lvl === 7) {
            // 2024 Hunter: Defensive Tactics at level 7
            choices.push({
                id: "defensive-tactics",
                choiceId: "defensive-tactics",
                legacyKeys: ["ranger-6-hunter", "defensive-tactic"],
                name: "Defensive Tactics",
                prompt: "Choose a Defensive Tactics feature.",
                chooseCount: 1,
                options: HUNTER_DEFENSIVE_TACTICS
            });
        } else if (lvl === 15) {
            choices.push({
                id: "superior-hunter-defense",
                choiceId: "superior-hunter-defense",
                legacyKeys: ["superior-defense"],
                name: "Superior Hunter's Defense",
                prompt: "Choose Evasion or Uncanny Dodge.",
                chooseCount: 1,
                options: HUNTER_SUPERIOR_DEFENSE_OPTIONS
            });
        }
    } else if (normSub.includes("fey-wanderer") && lvl === 3) {
        choices.push({
            id: "otherworldly-glamour",
            choiceId: "otherworldly-glamour",
            legacyKeys: ["fey-glamour"],
            name: "Otherworldly Glamour",
            prompt: "Choose 1 skill proficiency (Deception, Performance, or Persuasion).",
            chooseCount: 1,
            options: FEY_WANDERER_GLAMOUR_SKILLS
        });
    } else if (normSub.includes("beast-master") && lvl === 3) {
        choices.push({
            id: "primal-companion",
            choiceId: "primal-companion",
            name: "Primal Companion",
            prompt: "Choose your Primal Companion beast type.",
            chooseCount: 1,
            options: PRIMAL_COMPANION_TYPES
        });
    }

    // 7. Sorcerer Subclasses
    if (normSub.includes("draconic") && lvl === 3) {
        choices.push({
            id: "draconic-ancestor",
            choiceId: "draconic-ancestor",
            name: "Draconic Ancestor",
            prompt: "Choose your draconic ancestor dragon type.",
            chooseCount: 1,
            options: DRACONIC_ANCESTOR_ELEMENTS
        });
    } else if (normSub.includes("aberrant") && lvl === 14) {
        choices.push({
            id: "revelation-in-flesh",
            choiceId: "revelation-in-flesh",
            legacyKeys: ["aberrant-revelation"],
            name: "Revelation in Flesh",
            prompt: "Choose a Revelation in Flesh transformation.",
            chooseCount: 1,
            options: ABERRANT_REVELATION_OPTIONS
        });
    }

    // 8. Warlock Subclasses
    if (normSub.includes("archfey") && lvl === 3) {
        choices.push({
            id: "steps-of-the-fey",
            choiceId: "steps-of-the-fey",
            name: "Steps of the Fey",
            prompt: "Choose Taunting Step or Refreshing Step.",
            chooseCount: 1,
            options: STEPS_OF_THE_FEY_OPTIONS
        });
    } else if (normSub.includes("fiend") && lvl === 10) {
        choices.push({
            id: "fiendish-resilience",
            choiceId: "fiendish-resilience",
            name: "Fiendish Resilience",
            prompt: "Choose damage resistance type until next rest.",
            chooseCount: 1,
            options: FIENDISH_RESILIENCE_DAMAGE_TYPES
        });
    }

    // 9. Wizard Subclasses
    if (normSub.includes("divin") && lvl === 10) {
        choices.push({
            id: "the-third-eye",
            choiceId: "the-third-eye",
            legacyKeys: ["third-eye"],
            name: "The Third Eye",
            prompt: "Choose a Third Eye sensory benefit.",
            chooseCount: 1,
            options: DIVINER_THIRD_EYE_OPTIONS
        });
    }

    return choices;
}

/** Expendable resources a subclass adds, as of a subclass level (e.g. Circle of the Stars' Cosmic Omen). */
function getSubclassResources(normSub: string, lvl: number): ProgressionResourceUpdate[] {
    const res: ProgressionResourceUpdate[] = [];
    if (normSub === "stars" && lvl >= 6) {
        res.push({ name: "Cosmic Omen", total: "{{wis}}", die: "1d6", resetOn: "long" });
    }
    if (normSub === "battle-master" && lvl >= 3) {
        res.push({
            name: "Superiority Dice", total: lvl >= 15 ? 6 : lvl >= 7 ? 5 : 4, die: lvl >= 18 ? "d12" : lvl >= 10 ? "d10" : "d8", resetOn: "short",
            aliases: ["Combat Superiority", "Improved Combat Superiority", "Ultimate Combat Superiority", "Maneuvers"]
        });
    }
    if (normSub === "glamour") {
        if (lvl >= 3) res.push({ name: "Beguiling Magic", total: 1, resetOn: "long" });
        if (lvl >= 6) res.push({ name: "Mantle of Majesty", total: 1, resetOn: "long" });
        if (lvl >= 14) res.push({ name: "Unbreakable Majesty", total: 1, resetOn: "short" });
    }
    if (normSub === "great-old-one" && lvl >= 6) {
        res.push({ name: "Clairvoyant Combatant", total: 1, resetOn: "short" });
    }
    return res;
}

export function buildSubclassProgression(classSlug: string, sub: { id: string; name: string; description: string; features?: Array<{ name: string; level: number; description: string }> }): ProgressionLevel[] {
    const subSlug = sub.id || slugify(sub.name || "");
    const subFeatures = Array.isArray(sub.features) ? sub.features : [];
    const normSub = subSlug.toLowerCase();

    // Distinct levels where this subclass has features, choices, or granted spells
    const knownCheckLevels = [1, 2, 3, 5, 6, 7, 9, 10, 13, 14, 15, 17, 20];
    const candidateLevels = new Set<number>([
        ...subFeatures.map(f => f.level || 3),
        ...knownCheckLevels.filter(lvl => {
            const sps = getSubclassGrantedSpells(classSlug, normSub, lvl, sub.name);
            const chs = getSubclassChoices(normSub, lvl);
            return sps.length > 0 || chs.length > 0;
        })
    ]);
    if (candidateLevels.size === 0) {
        candidateLevels.add(3);
    }
    const featureLevels = Array.from(candidateLevels).sort((a, b) => a - b);

    const levels: ProgressionLevel[] = [];

    for (const lvl of featureLevels) {
        const spellsAtLevel = getSubclassGrantedSpells(classSlug, normSub, lvl, sub.name);
        const choicesAtLevel = getSubclassChoices(normSub, lvl);

        const featsAtLevel = subFeatures.filter(f => (f.level || 3) === lvl).map(f => {
            const featSlug = slugify(f.name);
            const modifiers: StatModifier[] = [];
            let subSpellPicks: SpellPick[] | undefined;
            let featScaleValue: string | undefined;

            // Add inherent modifiers for concrete subclass features
            if (featSlug === "draconic-resilience") {
                modifiers.push({ target: "vitals.ac", type: "unarmored_ac", abilities: ["dex", "cha"], allowsShield: true, description: "AC 10 + DEX + CHA while wearing no armor" });
                modifiers.push({ target: "vitals.maxHp", type: "bonus", perClassLevel: 1, description: "+1 HP per Sorcerer level" });
            } else if (featSlug === "aquatic-affinity") {
                modifiers.push({ target: "vitals.swim", type: "set", value: "walk", description: "Swim Speed equal to Speed" });
            } else if (featSlug === "magical-discoveries") {
                subSpellPicks = [{
                    id: "bard-6-magical-discoveries",
                    title: "Magical Discoveries (College of Lore) — Bonus Spells",
                    sourceLabel: "Bard / Magical Discoveries",
                    description: "You learn two spells of your choice from the Cleric, Druid, or Wizard spell list (cantrip or a spell of a level you can cast). You always have the chosen spells prepared.",
                    count: 2, lists: ["Cleric", "Druid", "Wizard"], levels: [0], maxLevel: "castable", ability: "cha",
                    sourceAliases: ["magical discoveries"]
                }];
            } else if (featSlug === "dazzling-footwork") {
                modifiers.push({ target: "vitals.ac", type: "unarmored_ac", abilities: ["dex", "cha"], allowsShield: false, description: "AC 10 + DEX + CHA while wearing no armor and no shield" });
            } else if (featSlug === "dread-ambusher") {
                modifiers.push({ target: "vitals.initiative", type: "ability_mod", abilitySource: "wis", description: "Add Wisdom modifier to Initiative rolls" });
            } else if (featSlug === "dark-ones-blessing") {
                featScaleValue = "{{cha}}+{{level}}";
            } else if (featSlug === "umbral-sight") {
                modifiers.push({ target: "vitals.darkvision", type: "bonus", value: 60, description: "Darkvision +60 ft." });
            }

            let actionGrant: any = undefined;
            if (featSlug === "awakened-mind") {
                actionGrant = {
                    name: "Awakened Mind",
                    type: "Bonus Action",
                    range: "30 ft.",
                    notes: "Form telepathic connection with a creature within 30 ft. Lasts minutes equal to Warlock level."
                };
            } else if (featSlug === "clairvoyant-combatant" || featSlug === "clairvoyant-combat") {
                actionGrant = {
                    name: "Clairvoyant Combatant",
                    type: "Special",
                    notes: "When forming Awakened Mind link, target makes WIS save or has Disadvantage on attacks against you, and you have Advantage against it. Recharges on Short/Long Rest or 1 Pact slot."
                };
            } else if (featSlug === "cosmic-omen") {
                actionGrant = {
                    name: "Cosmic Omen",
                    type: "Reaction",
                    range: "30 ft.",
                    effect: "Roll 1d6: Add (Weal) or Subtract (Woe) from d20 Test",
                    notes: "Whenever you finish a Long Rest, consult your Star Map for omens and roll a die. Until your next Long Rest, you gain a special Reaction: Weal (Even) - roll 1d6 and add to creature's D20 Test; Woe (Odd) - roll 1d6 and subtract from creature's D20 Test. Uses: Wisdom modifier (min 1), regained on Long Rest."
                };
            } else if (featSlug === "thought-shield") {
                actionGrant = {
                    name: "Thought Shield (Reflect)",
                    type: "Reaction",
                    notes: "When an attacker deals psychic damage to you, that attacker takes the same amount of damage."
                };
            }

            return {
                id: `${subSlug}-${lvl}-${featSlug}`,
                name: f.name,
                description: f.description,
                modifiers: modifiers.length > 0 ? modifiers : undefined,
                scaleValue: featScaleValue,
                spellPicks: subSpellPicks,
                actionGrant,
                grantedSpells: (f as any).grantedSpells,
                grantedFeatures: (f as any).grantedFeatures
            };
        });

        if (featsAtLevel.length === 0 && spellsAtLevel.length > 0) {
            featsAtLevel.push({
                id: `${subSlug}-spells-${lvl}`,
                name: `${sub.name} Spells`,
                description: `Spells granted by ${sub.name} at level ${lvl}.`,
                modifiers: undefined,
                scaleValue: undefined,
                spellPicks: undefined,
                actionGrant: undefined,
                grantedSpells: spellsAtLevel,
                grantedFeatures: undefined
            });
        } else if (featsAtLevel.length > 0 && spellsAtLevel.length > 0) {
            const spellFeat = featsAtLevel.find(f => /spell|domain|oath|patron|expanded/i.test(f.name)) || featsAtLevel[0];
            spellFeat.grantedSpells = [
                ...((spellFeat.grantedSpells || []) as ProgressionGrantedSpell[]),
                ...spellsAtLevel
            ];
        }

        const levelGrantedSpells = [
            ...spellsAtLevel,
            ...featsAtLevel.flatMap(f => (f.grantedSpells || []) as ProgressionGrantedSpell[])
        ];

        const uniqueSpells = Array.from(
            new Map(levelGrantedSpells.map(s => [s.spellId || s.id || s.name, s])).values()
        );

        const subResources = getSubclassResources(normSub, lvl);
        levels.push({
            level: lvl,
            features: featsAtLevel,
            choices: choicesAtLevel.length > 0 ? choicesAtLevel : undefined,
            resourceUpdates: subResources.length > 0 ? subResources : undefined,
            grantedSpells: uniqueSpells.length > 0 ? uniqueSpells : undefined
        });
    }

    return levels;
}
