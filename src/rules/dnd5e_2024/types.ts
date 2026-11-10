export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityScoreIncreaseOption {
    stats: AbilityName[];
    description: string;
}

export interface LineageDefinition {
    id: string;
    name: string;
    description: string;
    traits: Array<{
        name: string;
        description: string;
    }>;
    spellsGranted?: Array<{
        level: number;
        spellName: string;
    }>;
    speedBonus?: number;
    darkvision?: string;
}

export interface SpeciesDefinition {
    id: string;
    name: string;
    description: string;
    size: 'Small' | 'Medium' | 'Small or Medium' | 'Medium or Small';
    speed: number;
    darkvision?: string;
    traits: Array<{
        name: string;
        description: string;
    }>;
    lineages?: LineageDefinition[];
    extraSkillCount?: number;
    extraFeatCount?: number;
}

export interface OriginFeatDefinition {
    id: string;
    name: string;
    description: string;
    benefits: string[];
    spellsGranted?: string[];
    spellcastingAbilityOptions?: AbilityName[];
}

export interface GeneralFeatDefinition {
    id: string;
    name: string;
    description: string;
    allowedStats: AbilityName[];
    isEpicBoon?: boolean;
    category?: 'general' | 'fighting-style' | 'epic-boon';
    prerequisite?: string;
    benefits: string[];
}

export interface BackgroundDefinition {
    id: string;
    name: string;
    description: string;
    allowedAbilities: AbilityName[];
    skills: string[];
    tool: string;
    originFeatId: string;
    equipmentSummary: string;
}

export interface ClassSubclassDefinition {
    id: string;
    name: string;
    description: string;
    features: Array<{
        name: string;
        level: number;
        description: string;
    }>;
    classSlug?: string;
    progression?: ProgressionLevel[];
    /** Other classes' spell lists this subclass can prepare from, at or above a class level (like a class's own). */
    expandedSpellLists?: ExpandedSpellListDefinition[];
    /** Spellcasting this subclass grants a class that has none of its own (e.g. Eldritch Knight, Arcane Trickster) */
    spellcastingOverride?: {
        ability: AbilityName;
        type: 'full' | 'half' | 'third' | 'pact';
        /** Class spell list the subclass prepares from (e.g. "Wizard"); defaults to the class's own */
        spellList?: string;
        cantripsKnownByLevel: number[];
        preparedSpellsByLevel?: number[];
        spellSlotsByLevel: number[][];
    };
}

export interface ClassLevelFeature {
    name: string;
    level: number;
    description: string;
}

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
    | "proficiencies.armor"
    | "proficiencies.weapons"
    | "proficiencies.tools"
    | "proficiencies.languages"
    | "weaponMasteryCount"
    | "resources.pool"
    | "spells.grant"
    | "spells.alwaysPrepared"
    | "spells.atWill"
    | "features.grant";

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
    target: ModifierTarget | string;
    type: ModifierType;
    value?: number | string;
    abilitySource?: AbilityName;
    minimum?: number;              // floor for ability_mod (e.g. Thaumaturge: Wisdom modifier, minimum +1)
    valueByLevel?: number[];       // value by the granting class's level (index = level), e.g. Unarmored Movement
    perClassLevel?: number;        // value × the granting class's level, e.g. Draconic Resilience HP
    abilities?: AbilityName[];     // unarmored_ac: abilities whose modifiers add to 10
    allowsShield?: boolean;        // unarmored_ac: still applies while holding a shield
    requires?: "no-armor" | "no-heavy-armor" | "no-armor-or-shield"; // only applies in this armor state
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
    /** Ids older saves may hold for this option */
    legacyIds?: string[];
    /** Class level the option requires (e.g. Eldritch Invocation prerequisites) */
    minLevel?: number;
    /** Spells the player picks when this option is chosen */
    spellPicks?: SpellPick[];
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
    prompt?: string;
    description?: string;
    chooseCount: number;
    /** Creator storage keys older saves may hold this choice under */
    legacyKeys?: string[];
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

export interface ClassScalingTraits {
    weaponMasteriesByLevel?: number[];
    invocationsByLevel?: number[];
    metamagicByLevel?: number[];
    maneuversByLevel?: number[];
    expertiseByLevel?: number[];          // total Expertise picks granted by each class level (index = level)
    asiLevels?: number[];                 // class levels that grant an Ability Score Improvement
    epicBoonLevel?: number;               // class level that grants an Epic Boon feat
    martialArtsDieByLevel?: string[];     // Martial Arts die by class level (index = level); its weapons can use it
    [key: string]: any;
}

export interface ExpandedSpellListDefinition {
    level: number;
    feature: string;
    classes: string[];
    allowCantrips?: boolean;
}

export interface ClassDefinition {
    id: string;
    slug?: string;
    name: string;
    description: string;
    hitDie: number; // 6, 8, 10, 12
    primaryAbilities: AbilityName[];
    savingThrows: AbilityName[];
    armorProficiencies: string[];
    weaponProficiencies: string[];
    weaponMasteryCount: number;
    weaponMasteryByLevel?: number[];
    skillChoices: {
        count: number;
        from: string[];
    };
    multiclassing?: MulticlassDefinition;
    scalingTraits?: ClassScalingTraits;
    spellcasting?: {
        ability: AbilityName;
        type: 'full' | 'half' | 'third' | 'pact';
        /** Class spell list prepared from; defaults to the class's own name */
        spellList?: string;
        cantripsKnownByLevel: number[];
        preparedSpellsByLevel?: number[];
        spellsKnownByLevel?: number[];
        spellSlotsByLevel: number[][]; // 20 rows, 9 cols
        expandedSpellLists?: ExpandedSpellListDefinition[];
    };
    subclasses: ClassSubclassDefinition[];
    features: ClassLevelFeature[];
    progression?: ProgressionLevel[];
    startingEquipmentOptions: Array<{
        name: string;
        items: string[];
    }>;
}

export interface WeaponMasteryProperty {
    name: 'Cleave' | 'Graze' | 'Nick' | 'Push' | 'Sap' | 'Slow' | 'Topple' | 'Vex';
    description: string;
}

export interface BaseWeaponDefinition {
    name: string;
    category: 'Simple Melee' | 'Simple Ranged' | 'Martial Melee' | 'Martial Ranged';
    damageDie: string;
    damageType: string;
    mastery: 'Cleave' | 'Graze' | 'Nick' | 'Push' | 'Sap' | 'Slow' | 'Topple' | 'Vex';
    properties: string[];
    range?: string;
    cost: string;
    weight: string;
}

export interface BaseArmorDefinition {
    name: string;
    category: 'Light' | 'Medium' | 'Heavy' | 'Shield';
    baseAc: number;
    dexBonus: 'full' | 'max2' | 'none';
    strengthRequired?: number;
    stealthDisadvantage?: boolean;
    cost: string;
    weight: string;
}

export interface RuleSpellDefinition {
    id: string;
    name: string;
    level: number;
    school: string;
    classes: string[];
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    concentration: boolean;
    ritual: boolean;
    description: string;
}
