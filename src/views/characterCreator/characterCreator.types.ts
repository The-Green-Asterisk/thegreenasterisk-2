import {
    AbilityName,
    BackgroundDefinition,
    ClassDefinition,
    GeneralFeatDefinition,
    OriginFeatDefinition,
    RuleSpellDefinition,
    SpeciesDefinition
} from "../../rules/dnd5e_2024";
import { SKILLS } from "../../rules/dnd5e_2024/skills";

export interface AsiChoice {
    type: "single" | "dual" | "feat";
    statA?: AbilityName;
    statB?: AbilityName;
    featId?: string;
}

export interface AsiSlot {
    /** `${classId}-${classLevel}`, e.g. "bard-4" */
    key: string;
    classId: string;
    className: string;
    classLevel: number;
    isEpicBoon: boolean;
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
    /** Lower-case source text older saves used for these spells */
    sourceAliases?: string[];
}

export interface CreatorState {
    currentStep: number;
    savedId?: number;
    siteCharacterId?: string;
    /** D&D Beyond character id, for characters imported from D&D Beyond */
    dndBeyondId?: string;
    name: string;
    level: number;
    alignment: string;
    gender: string;
    avatarUrl: string;
    speciesId: string;
    lineageId: string;
    /** Details besides gender (faith, age, height, ...), personality and notes, and coins */
    details?: { faith?: string; age?: string; height?: string; weight?: string; hair?: string; eyes?: string; skin?: string; lifestyle?: string; experiencePoints?: number };
    notes?: Record<string, string>;
    currency?: { cp: number; sp: number; ep: number; gp: number; pp: number };
    /** Ability the species' spells are cast with (e.g. a Tiefling's legacy: Int, Wis, or Cha) */
    speciesSpellAbility?: AbilityName;
    /** Skills or feats picked through species traits (Skillful, Versatile, Keen Senses), by trait slug */
    speciesChoices: Record<string, string[]>;
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
    /** Spellcasting ability chosen for the origin feat's spells (e.g. Magic Initiate: Int, Wis, or Cha) */
    featSpellAbility?: AbilityName;
    abilityMode: "standard" | "pointbuy" | "roll" | "manual";
    baseAbilities: Record<AbilityName, number>;
    /** Keyed by AsiSlot.key ("bard-4"); older saves used total character level and are normalized on use. */
    asiChoices: Record<string, AsiChoice>;
    classSkills: string[];
    expertiseSkills: string[];
    /** Skills chosen through feats (Skilled, Skill Expert, Keen Mind, Observant), keyed by FeatSkillSection.key */
    featSkillChoices?: Record<string, string[]>;
    selectedWeapons: string[];
    selectedArmor: string;
    hasShield: boolean;
    equippedKitIndex?: number;
    selectedCantrips: string[];
    selectedSpellsLevel1: string[];
    classSpellSelections?: Record<string, SpellBucketSelection>;
    /** Spells D&D Beyond put on a class (by class key), kept even when the spell database doesn't list them for it. */
    importedClassSpells?: Record<string, string[]>;
    featureSpellChoices: Record<string, string[]>;
    /** The player's own lock choices for an imported character's fields (importLocks), by lock key */
    lockChoices?: Record<string, boolean>;
}

export interface SpellBucketSelection {
    cantrips: string[];
    prepared: string[];
}

export interface SpellBucket {
    key: string;
    kind: "class" | "feat";
    label: string;
    sourceLabel: string;
    level: number;
    ability: AbilityName;
    maxCantrips: number;
    maxPrepared: number;
    maxSpellLevel: number;
    priorityKey: string;
    baseList: string;
    cantripPool: RuleSpellDefinition[];
    preparedPool: RuleSpellDefinition[];
    /** Spell name → the feature that makes it available (e.g. "Magical Secrets"); absent when on the class's own list. */
    via: Record<string, string>;
}

export const ALL_SKILLS: Array<{ name: string; stat: AbilityName }> = SKILLS.map((s) => ({ name: s.name, stat: s.ability }));
