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
    spellcastingOverride?: {
        ability: AbilityName;
        type: 'full' | 'half' | 'third' | 'pact';
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
    | "multiplier";      // Multiplies a value (e.g. 2x carrying capacity)

export interface StatModifier {
    target: ModifierTarget | string;
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

export interface ClassDefinition {
    id: string;
    name: string;
    description: string;
    hitDie: number; // 6, 8, 10, 12
    primaryAbilities: AbilityName[];
    savingThrows: AbilityName[];
    armorProficiencies: string[];
    weaponProficiencies: string[];
    weaponMasteryCount: number;
    skillChoices: {
        count: number;
        from: string[];
    };
    spellcasting?: {
        ability: AbilityName;
        type: 'full' | 'half' | 'third' | 'pact';
        cantripsKnownByLevel: number[];
        preparedSpellsByLevel?: number[];
        spellSlotsByLevel: number[][]; // 20 rows, 9 cols
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
