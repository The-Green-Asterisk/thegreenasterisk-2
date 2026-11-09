import {
    AbilityName,
    BackgroundDefinition,
    ClassDefinition,
    GeneralFeatDefinition,
    MulticlassCasterClassInfo,
    OriginFeatDefinition,
    RuleSpellDefinition,
    SpeciesDefinition
} from "../../../rules/dnd5e_2024";
import { AsiSlot, CreatorState, FeatureSpellChoiceSection, SpellBucket, SpellBucketSelection } from "../characterCreator.types";

export interface CharacterCreatorContext {
    state: CreatorState;
    classes: ClassDefinition[];
    species: SpeciesDefinition[];
    backgrounds: BackgroundDefinition[];
    originFeats: OriginFeatDefinition[];
    generalFeats: GeneralFeatDefinition[];
    spells: RuleSpellDefinition[];
    getSpell: (nameOrId: string) => RuleSpellDefinition | undefined;

    activeSpellLevelFilter: number | "all";
    activeSpellClassFilter: string;
    spellSearchQuery: string;
    progressionExpanded: boolean;
    collapsedProgressionLevels: Set<string>;
    progressionFilter: "all" | "unlocked";
    spellsWarningDismissed: boolean;

    // View & Navigation
    renderStep: (step: number, preserveScroll?: boolean) => void;
    renderClassProgression?: (cls: ClassDefinition, classLevel?: number, classIdx?: number, activeSubId?: string) => string;
    renderLevelChoices?: (cls: ClassDefinition, lvl: number, classIndex?: number) => string;
    attachStepEvents: (step: number) => void;
    updateLiveSummary: () => void;
    updateMulticlassBarPositions: () => void;
    updateMulticlassNavBars: () => void;
    goToStep: (step: number) => void;
    showAlert: (msg: string, type?: "error" | "warning") => void;
    hideAlert: () => void;
    validateCurrentStep: () => boolean;

    // Rules & Stat Calculations
    getProficiencyBonus: () => number;
    getEffectiveAbilityScore: (stat: AbilityName) => number;
    getAbilityModifier: (stat: AbilityName) => number;
    getMaxHp: () => number;
    getArmorClass: () => number;
    getInitiative: () => number;
    getSpeed: () => number;
    getSpecialSpeeds: () => string[];
    getSpeedDisplay: () => string;
    getTotalLevel: () => number;
    getNavBottom: () => number;
    canMulticlassInto: (candidateClassId: string, classIndex: number) => {
        allowed: boolean;
        reason?: string;
        prereqLabel?: string;
        currentScoreText?: string;
    };
    getAllArmorProficiencies: () => string[];
    getAllWeaponProficiencies: () => string[];
    getAllToolProficiencies: () => string[];
    getMaxClassSkillCount: () => number;
    getAllowedClassSkills: () => string[];
    isProficientWithArmor: (armorName: string) => boolean;
    isProficientWithShield: () => boolean;
    isProficientWithWeapon: (weaponName: string) => boolean;
    getWeaponStatRequirement: (weaponName: string) => { stat: "str" | "dex"; required: number; current: number; met: boolean } | null;
    getArmorStatRequirement: (armorName: string) => { required: number; current: number; met: boolean } | null;
    initClassDefaultEquipment: (cls: any) => void;
    isKitEquipped: (idx: number) => boolean;

    // Ability Score Methods & Choices
    getPointBuyCost: (score: number) => number;
    getSpentPoints: () => number;
    getAvailablePoints: () => number;
    canIncrementPointBuy: (stat: AbilityName) => boolean;
    canDecrementPointBuy: (stat: AbilityName) => boolean;
    incrementPointBuy: (stat: AbilityName) => boolean;
    decrementPointBuy: (stat: AbilityName) => boolean;
    setStandardArrayScore: (targetStat: AbilityName, newValue: number) => void;
    getAsiSlots: () => AsiSlot[];
    ensureAsiChoices: () => void;
    getMaxWeaponMasteriesCount: () => number;
    getMaxMetamagicCount: () => number;
    getMaxInvocationsCount: () => number;
    getMaxManeuversCount: () => number;
    getMaxExpertiseCount: () => number;

    // Spellcasting & Progression Spells
    getSpellcasterInfos: () => MulticlassCasterClassInfo[];
    getMaxCantrips: () => number;
    getMaxPreparedSpells: () => number;
    getAllowedSpellClasses: () => string[];
    getMaxSpellLevel: () => number;
    getAvailableSpells: () => { cantrips: RuleSpellDefinition[]; leveledSpells: RuleSpellDefinition[]; spellsLvl1: RuleSpellDefinition[] };
    getFeatureSpellChoiceSections: () => FeatureSpellChoiceSection[];
    sanitizeSpellSelections: () => void;
    getSmartAutoFillSpells: () => { cantrips: string[]; prepared: string[]; byBucket: Record<string, SpellBucketSelection> };
    getSpellBuckets: () => SpellBucket[];
    getSpellcastingAbility: () => AbilityName | null;
    getSpellSaveDc: (abilityOverride?: AbilityName) => number | null;
    getSpellAttackModifier: (abilityOverride?: AbilityName) => number | null;
    getSpellSlotsSummary: () => string;
    getSpellcasterStatsList: () => Array<{
        classId: string;
        className: string;
        level: number;
        ability: AbilityName;
        abilityMod: number;
        saveDc: number;
        attackMod: number;
        maxCantrips: number;
        maxPrepared: number;
        maxSpellLevel: number;
    }>;

    // Subclass and Class Progression Deduplication & Sync
    deduplicateClassSubclasses: (classId: string, rawSubs: any[]) => any[];
    resolveCanonicalSubclassId: (classId: string, subIdOrName?: string) => string;
    sanitizeClassProgressionSelections: () => void;
    syncStateClassProperties: () => void;

    // Persistence & Payload
    buildPayload: () => any;
    submitCharacter: () => Promise<void>;
    loadCharacter: (targetId: string | number) => Promise<void>;
}
