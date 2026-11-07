import { CharacterData, SpellDefinition } from "../characterData";

export type SavedCharacterSummary = {
    id: number;
    siteCharacterId?: string;
    source?: "site" | "dndbeyond";
    name: string;
    externalCharacterId?: string;
    level?: number;
    subtitle?: string;
    avatarUrl?: string;
    updatedAt?: string;
    savedPayload?: CharacterData;
};

export interface CharacterSheetContext {
    sheet: HTMLElement;
    dynamicContainer: HTMLElement | null;

    // Character State
    getCharacter: () => CharacterData | null;
    setCharacter: (char: CharacterData | null) => void;
    getActiveCharacterId: () => string | undefined;
    setActiveCharacterId: (id: string | undefined) => void;
    getIsEditMode: () => boolean;
    setIsEditMode: (val: boolean) => void;
    prefer2024Rules: { value: boolean };
    spellMap: Map<string, SpellDefinition>;
    getSavedCharacters: () => SavedCharacterSummary[];
    setSavedCharacters: (list: SavedCharacterSummary[]) => void;

    // View Rendering & Controls
    showStatus: (message: string, isError?: boolean) => void;
    renderActiveCharacterView: () => void;
    renderSavedCharacterList: () => void;
    setCharacterActionsVisibility: () => void;
    updateAbilityBaseScore: (abilityIndex: number, newBaseScore: number) => void;
    setItemQuantity: (itemName: string, quantity: number, scope?: "equipment" | "weapon") => void;
    syncSheetStats: () => void;
    recalculateFromRawPayload?: () => void;
    toggleFieldLock?: (fieldKey: string) => boolean;
    isFieldLocked?: (fieldKey: string) => boolean;

    // Persistence & API
    saveActiveCharacter: (options?: { silent?: boolean; background?: boolean }) => Promise<void>;
    scheduleDebouncedAutoSave: (delayMs?: number) => void;
    loadCharacter: (idOrUrl: string, options?: { forceOverwrite?: boolean; refreshed?: boolean }) => Promise<void>;
    loadSavedCharacter: (savedCharacterId: number) => Promise<void>;
    loadSavedCharacterBySiteId: (siteCharacterId: string) => Promise<void>;
    deleteSavedCharacter: (savedCharacterId: number) => Promise<boolean>;
    fetchSavedCharacters: () => Promise<void>;
    beginNewSiteCharacter: () => void;
    refreshFromDndBeyondAndOverride: () => Promise<void>;
    persistEquipState: (
        scope: "item" | "weapon" | "weapon-mastery" | "attunement",
        encodedName: string,
        rawDefinitionId: string | null,
        equipped: boolean
    ) => Promise<void>;
    applyFeatureDecisionChange: (decisionId: string, newValue: string) => void;

    // Modals
    openSpellModal: (spellName: string, spellId?: number | string) => Promise<void>;
    closeSpellModal: () => void;
    openItemModal: (itemName: string, itemId?: number | string, itemType?: string) => Promise<void>;
    closeItemModal: () => void;
    openActionModal: (actionIndex: number) => void;
    closeActionModal: () => void;
    openCustomSpellModal: () => void;
    closeCustomSpellModal: () => void;
    openManageSpellsModal: () => Promise<void>;
    closeManageSpellsModal: () => void;
    openManageItemsModal: (initialType?: string) => Promise<void>;
    closeManageItemsModal: () => void;
    openConditionsModal: () => Promise<void>;
    closeConditionsModal: () => void;
    openConditionDetailModal: (conditionName: string) => Promise<void>;
    closeConditionDetailModal: () => void;
    updateHeroConditionsDisplay: () => void;

    // HP & Vitals
    getCurrentHp: () => number;
    setCurrentHp: (hp: number) => void;
    getMaxHp: () => number;
    setMaxHp: (hp: number) => void;
    getTempHp: () => number;
    setTempHp: (hp: number) => void;
    updateHpDisplay: () => void;
    applyHpDelta: (delta: number) => void;
    syncDeathSavesDisplay?: () => void;

    // Trackers & Resources
    persistTrackerSnapshot: () => void;
    applyTrackerSnapshot: () => void;
    updateSlotCounters: () => void;
    syncHeaderSlotMarkers: () => void;
}
