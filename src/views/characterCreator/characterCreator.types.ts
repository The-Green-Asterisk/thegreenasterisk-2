import {
    AbilityName,
    BackgroundDefinition,
    ClassDefinition,
    GeneralFeatDefinition,
    OriginFeatDefinition,
    RuleSpellDefinition,
    SpeciesDefinition
} from "../../rules/dnd5e_2024";

export interface AsiChoice {
    type: "single" | "dual" | "feat";
    statA?: AbilityName;
    statB?: AbilityName;
    featId?: string;
}

export interface CharacterClassChoice {
    classId: string;
    level: number;
    subclassId?: string;
}

export interface FeatureSpellChoiceSection {
    id: string;
    title: string;
    sourceLabel: string;
    description: string;
    chooseCount: number;
    availableSpells: RuleSpellDefinition[];
    ability?: AbilityName;
}

export interface CreatorState {
    currentStep: number;
    savedId?: number;
    siteCharacterId?: string;
    name: string;
    level: number;
    alignment: string;
    gender: string;
    avatarUrl: string;
    speciesId: string;
    lineageId: string;
    humanExtraSkill: string;
    humanExtraFeatId: string;
    elfKeenSkill: string;
    classId: string;
    subclassId: string;
    classes: CharacterClassChoice[];
    weaponMasteries: string[];
    // Class-specific progression choices:
    fightingStyle?: string;
    divineOrder?: string;
    primalOrder?: string;
    metamagic: string[];
    invocations: string[];
    maneuvers: string[];
    subclassFeatureChoices: Record<string, string>;
    backgroundId: string;
    backgroundOption: "two-and-one" | "three-ones";
    bgStatA: AbilityName;
    bgStatB: AbilityName;
    bgStatC: AbilityName;
    bgTool: string;
    originFeatId: string;
    abilityMode: "standard" | "pointbuy" | "roll" | "manual";
    baseAbilities: Record<AbilityName, number>;
    asiChoices: Record<number, AsiChoice>;
    classSkills: string[];
    expertiseSkills: string[];
    selectedWeapons: string[];
    selectedArmor: string;
    hasShield: boolean;
    equippedKitIndex?: number;
    selectedCantrips: string[];
    selectedSpellsLevel1: string[];
    featureSpellChoices: Record<string, string[]>;
}

export const ALL_SKILLS: Array<{ name: string; stat: AbilityName }> = [
    { name: "Acrobatics", stat: "dex" },
    { name: "Animal Handling", stat: "wis" },
    { name: "Arcana", stat: "int" },
    { name: "Athletics", stat: "str" },
    { name: "Deception", stat: "cha" },
    { name: "History", stat: "int" },
    { name: "Insight", stat: "wis" },
    { name: "Intimidation", stat: "cha" },
    { name: "Investigation", stat: "int" },
    { name: "Medicine", stat: "wis" },
    { name: "Nature", stat: "int" },
    { name: "Perception", stat: "wis" },
    { name: "Performance", stat: "cha" },
    { name: "Persuasion", stat: "cha" },
    { name: "Religion", stat: "int" },
    { name: "Sleight of Hand", stat: "dex" },
    { name: "Stealth", stat: "dex" },
    { name: "Survival", stat: "wis" }
];
