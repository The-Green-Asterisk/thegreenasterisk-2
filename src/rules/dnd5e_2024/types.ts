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
}

export interface ClassLevelFeature {
    name: string;
    level: number;
    description: string;
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
        type: 'full' | 'half' | 'pact';
        cantripsKnownByLevel: number[];
        preparedSpellsByLevel?: number[];
        spellSlotsByLevel: number[][]; // 20 rows, 9 cols
    };
    subclasses: ClassSubclassDefinition[];
    features: ClassLevelFeature[];
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
