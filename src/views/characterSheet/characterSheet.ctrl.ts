import el from "@elements";
import { delData, getData, postData, putData } from "@services/request";
import { loadClassRules } from "../../services/classRules";
import { carryLockedCopiesAndLinks } from "./services/characterCopies";
import { applyLockedFieldsToRefreshedCharacter, ensureBaseScoresOnCharacter, ensureClassResourcesOnCharacter, ensureSavingThrowNotesOnCharacter, parseDndBeyondCharacter } from "./characterAdapter";
import { CharacterData, SpellDefinition } from "./characterData";
import { renderSheetContent } from "./characterSheet.template";
import { renderAbilityCards } from "./components/abilities";
import { renderActions } from "./components/actions";
import { renderSkills } from "./components/skills";
import { describeDuplicateSpells } from "./components/spells";
import { restoreUsePips } from "./components/usesTracker";
import { renderSpecialSensesList } from "./components/vitals";
import { renderWeapons } from "./components/weapons";
import {
    CharacterSheetContext,
    SavedCharacterSummary,
    initAbilitiesController,
    initActionsController,
    initDetailsController,
    initEquipmentController,
    initFeaturesController,
    initFullscreenController,
    initHeroController,
    initLoaderBarController,
    initModalsController,
    initResourcesController,
    initSkillsController,
    initSpellsController,
    initTabsController,
    initVitalsController,
    initWeaponsController
} from "./controllers/index";
import { applyFeatureDecisionOnCharacterData, ensureFeatureDecisionsOnCharacterData } from "./featureDecisions";
import { applyMagicalItemBonuses } from "./services/magicItemBonuses";

export default function characterSheet(initialParams?: { id?: string | number; characterId?: string | number; url?: string } | string | number) {
    const baseEl = el.getElement<HTMLElement>("el-character-sheet");
    if (!baseEl) return;
    const sheet: HTMLElement = baseEl;

    // Resolve initial ID from argument, query parameters, or path
    let activeCharacterId = resolveInitialCharacterId(initialParams);

    /**
     * The page title (WCAG 2.4.2): the character's name once one is loaded; the plain sheet
     * title before one loads or after it's cleared.
     */
    function updateSheetTitle() {
        const name = activeCharacter?.name?.trim();
        try {
            el.title.textContent = name
                ? `${name} — Character Sheet | The Green Asterisk`
                : "Character Sheet | The Green Asterisk";
        } catch { }
    }

    // Dynamic state
    let activeCharacter: CharacterData | null = null;
    let activeRawDndBeyondPayload: any = null;
    let currentEquipOverrides: Array<{ scope: "item" | "weapon" | "weapon-mastery" | "attunement"; itemName: string; equipped: boolean }> = [];
    let currentHp = 0;
    let maxHp = 0;
    let tempHp = 0;
    const spellMap = new Map<string, SpellDefinition>();
    let savedCharacters: SavedCharacterSummary[] = [];
    let statusHideTimer: ReturnType<typeof setTimeout> | null = null;
    let dndBeyondNoteTimer: ReturnType<typeof setTimeout> | null = null;
    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
    let autoSaveInFlight = false;
    let autoSaveQueued = false;

    const dynamicContainer = sheet.querySelector<HTMLElement>("#character-sheet-dynamic-content");
    updateSheetTitle();
    const statusMsg = sheet.querySelector<HTMLElement>("#character-status-message");
    const importWarning = sheet.querySelector<HTMLElement>("#character-import-warning");
    const importWarningText = sheet.querySelector<HTMLElement>("#character-import-warning-text");
    sheet.querySelector<HTMLButtonElement>("#character-import-warning-dismiss")?.addEventListener("click", () => clearImportWarning());
    const dndBeyondNote = sheet.querySelector<HTMLElement>("#dnd-beyond-note");
    const idInput = sheet.querySelector<HTMLInputElement>("#dndbeyond-id-input");
    const loadBtn = sheet.querySelector<HTMLButtonElement>("#load-character-btn");
    const saveBtn = sheet.querySelector<HTMLButtonElement>("#save-character-btn");

    const prefer2024Rules = {
        value: true
    };

    function showDndBeyondNoteTemporarily(durationMs = 15000) {
        if (!dndBeyondNote) return;
        if (dndBeyondNoteTimer) {
            clearTimeout(dndBeyondNoteTimer);
            dndBeyondNoteTimer = null;
        }
        dndBeyondNote.classList.remove("hidden");
        dndBeyondNoteTimer = setTimeout(() => {
            dndBeyondNote.classList.add("hidden");
            dndBeyondNoteTimer = null;
        }, durationMs);
    }

    function hideDndBeyondNote() {
        if (dndBeyondNoteTimer) {
            clearTimeout(dndBeyondNoteTimer);
            dndBeyondNoteTimer = null;
        }
        dndBeyondNote?.classList.add("hidden");
    }

    function showStatus(message: string, isError = false) {
        if (!statusMsg) return;
        if (statusHideTimer) {
            clearTimeout(statusHideTimer);
            statusHideTimer = null;
        }
        statusMsg.textContent = message;
        statusMsg.className = `status-msg ${isError ? "error" : "success"}`;
        statusHideTimer = setTimeout(() => {
            if (!statusMsg) return;
            statusMsg.className = "status-msg hidden";
        }, 7000);
    }

    function clearImportWarning() {
        importWarning?.classList.add("hidden");
        if (importWarningText) importWarningText.textContent = "";
    }

    /**
     * Stays up until dismissed or the next load: names spells the player picked that D&D Beyond also lists elsewhere, so the extra
     * copies can be fixed there.
     */
    function showImportWarning(character: CharacterData) {
        const message = describeDuplicateSpells(character);
        if (!message || !importWarning || !importWarningText) {
            clearImportWarning();
            return;
        }
        importWarningText.textContent = message;
        importWarning.classList.remove("hidden");
    }

    function syncDeathSavesDisplay() {
        const hpDeathSavesMode = sheet.querySelector<HTMLElement>("#hp-death-saves-mode");
        if (!hpDeathSavesMode || !activeCharacter) return;

        if (!activeCharacter.vitals.deathSaves) {
            activeCharacter.vitals.deathSaves = { successes: 0, failures: 0, isStable: false };
        }
        const ds = activeCharacter.vitals.deathSaves;
        const succ = ds.successes || 0;
        const fail = ds.failures || 0;
        const isDead = fail >= 3;
        const isStable = !isDead && (!!ds.isStable || succ >= 3);

        const statusBadge = sheet.querySelector<HTMLElement>("#death-status-badge");
        if (statusBadge) {
            if (isDead) {
                statusBadge.className = "death-status-badge dead";
                statusBadge.textContent = "DEAD";
            } else if (isStable) {
                statusBadge.className = "death-status-badge stable";
                statusBadge.textContent = "STABILIZED";
            } else {
                statusBadge.className = "death-status-badge dying";
                statusBadge.textContent = "DYING (0 HP)";
            }
        }

        const succPips = sheet.querySelectorAll<HTMLButtonElement>("#death-success-pips .death-pip");
        succPips.forEach((pip, idx) => {
            pip.classList.toggle("active", idx < succ);
        });

        const failPips = sheet.querySelectorAll<HTMLButtonElement>("#death-failure-pips .death-pip");
        failPips.forEach((pip, idx) => {
            pip.classList.toggle("active", idx < fail);
        });

        const rollBtn = sheet.querySelector<HTMLButtonElement>("#death-save-roll-btn");
        if (rollBtn) {
            rollBtn.disabled = isDead || isStable;
        }

        const log = sheet.querySelector<HTMLElement>("#death-save-log");
        if (log && !log.dataset.customMessage) {
            if (isDead) {
                log.textContent = "Character has suffered 3 failures and is dead.";
            } else if (isStable) {
                log.textContent = "Character is stabilized at 0 HP.";
            } else {
                log.textContent = `Successes: ${succ}/3 • Failures: ${fail}/3. Roll d20 on your turn.`;
            }
        }
    }

    function updateHpDisplay() {
        const hpDisplay = sheet.querySelector<HTMLInputElement>("#hp-display");
        const tempHpDisplay = sheet.querySelector<HTMLInputElement>("#temp-hp-display");
        const hpRatio = sheet.querySelector<HTMLElement>("#hp-ratio");
        const hpBarFill = sheet.querySelector<HTMLElement>("#hp-bar-fill");
        const hpNormalMode = sheet.querySelector<HTMLElement>("#hp-normal-mode");
        const hpDeathSavesMode = sheet.querySelector<HTMLElement>("#hp-death-saves-mode");
        const hpCard = sheet.querySelector<HTMLElement>(".vital-card.vital-hp");

        const isDying = currentHp === 0;

        if (hpNormalMode && hpDeathSavesMode) {
            hpNormalMode.classList.toggle("hidden", isDying);
            hpDeathSavesMode.classList.toggle("hidden", !isDying);
        }
        if (hpCard) {
            hpCard.classList.toggle("is-dying", isDying);
        }

        if (hpDisplay) {
            hpDisplay.value = currentHp.toString();
            hpDisplay.max = String(maxHp);
        }
        if (tempHpDisplay) tempHpDisplay.value = tempHp.toString();
        if (hpRatio) hpRatio.textContent = `${currentHp} / ${maxHp} Max`;
        if (hpBarFill) {
            const percentage = Math.max(0, Math.min(100, Math.round((currentHp / Math.max(1, maxHp)) * 100)));
            hpBarFill.style.width = `${percentage}%`;
            if (percentage <= 25) {
                hpBarFill.style.backgroundColor = "#ef4444";
            } else if (percentage <= 50) {
                hpBarFill.style.backgroundColor = "#f59e0b";
            } else {
                hpBarFill.style.backgroundColor = "#10b981";
            }
        }

        const stickyHpDisplay = sheet.querySelector<HTMLInputElement>("#sticky-hp-display");
        const stickyTempHpDisplay = sheet.querySelector<HTMLInputElement>("#sticky-temp-hp-display");
        const stickyHpRatio = sheet.querySelector<HTMLElement>("#sticky-hp-ratio");
        const stickyHpBarFill = sheet.querySelector<HTMLElement>("#sticky-hp-bar-fill");
        const stickyBar = sheet.querySelector<HTMLElement>("#sticky-vitals-bar");
        const stickyHpModule = sheet.querySelector<HTMLElement>(".sticky-vital-hp");
        const stickyDyingBadge = sheet.querySelector<HTMLElement>("#sticky-hp-dying-badge");

        if (stickyBar) {
            stickyBar.classList.toggle("is-dying", isDying);
        }
        if (stickyHpModule) {
            stickyHpModule.classList.toggle("is-dying", isDying);
        }
        if (stickyDyingBadge) {
            stickyDyingBadge.classList.toggle("hidden", !isDying);
            stickyDyingBadge.style.display = isDying ? "" : "none";
        }
        if (stickyHpDisplay) {
            stickyHpDisplay.value = currentHp.toString();
            stickyHpDisplay.max = String(maxHp);
        }
        if (stickyTempHpDisplay) {
            stickyTempHpDisplay.value = tempHp.toString();
        }
        if (stickyHpRatio) {
            stickyHpRatio.textContent = `${currentHp} / ${maxHp} Max${tempHp > 0 ? ` (+${tempHp} Temp)` : ''}`;
        }
        if (stickyHpBarFill) {
            const percentage = Math.max(0, Math.min(100, Math.round((currentHp / Math.max(1, maxHp)) * 100)));
            stickyHpBarFill.style.width = `${percentage}%`;
            if (percentage <= 25) {
                stickyHpBarFill.style.backgroundColor = "#ef4444";
            } else if (percentage <= 50) {
                stickyHpBarFill.style.backgroundColor = "#f59e0b";
            } else {
                stickyHpBarFill.style.backgroundColor = "#10b981";
            }
        }

        if (activeCharacter) {
            activeCharacter.vitals.currentHp = currentHp;
            activeCharacter.vitals.tempHp = tempHp;
            if (currentHp > 0 && activeCharacter.vitals.deathSaves) {
                activeCharacter.vitals.deathSaves.successes = 0;
                activeCharacter.vitals.deathSaves.failures = 0;
                activeCharacter.vitals.deathSaves.isStable = false;
            }
        }
        syncDeathSavesDisplay();
    }

    function applyHpDelta(delta: number) {
        if (delta < 0) {
            let incoming = Math.abs(delta);
            if (tempHp > 0) {
                const absorbed = Math.min(tempHp, incoming);
                tempHp -= absorbed;
                incoming -= absorbed;
            }
            if (incoming > 0) {
                if (currentHp === 0) {
                    if (!activeCharacter) return;
                    if (!activeCharacter.vitals.deathSaves) {
                        activeCharacter.vitals.deathSaves = { successes: 0, failures: 0, isStable: false };
                    }
                    const ds = activeCharacter.vitals.deathSaves;
                    ds.failures = Math.min(3, (ds.failures || 0) + 1);
                    ds.isStable = false;
                    if (ds.failures >= 3) {
                        showStatus("Took damage at 0 HP: 3rd Death Save Failure — Character has died!", true);
                    } else {
                        showStatus(`Took damage at 0 HP: Suffered a Death Save Failure (${ds.failures}/3)!`, true);
                    }
                    syncDeathSavesDisplay();
                } else {
                    currentHp = Math.max(0, currentHp - incoming);
                    if (currentHp === 0) {
                        showStatus("HP reduced to 0! You are unconscious and dying — Make Death Saving Throws!", true);
                    }
                }
            }
        } else if (delta > 0) {
            currentHp = Math.min(maxHp, currentHp + delta);
        }
    }

    function persistTrackerSnapshot() {
        if (!activeCharacter) return;
        if (!activeCharacter.trackingState) {
            activeCharacter.trackingState = {};
        }
        if (!activeCharacter.trackingState.slotPips) {
            activeCharacter.trackingState.slotPips = {};
        }
        if (!activeCharacter.trackingState.resourcePips) {
            activeCharacter.trackingState.resourcePips = {};
        }

        // Spell slots level 1-9
        for (let lvl = 1; lvl <= 9; lvl++) {
            const pips = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-${lvl} .pip`);
            if (pips.length) {
                activeCharacter.trackingState.slotPips[`level${lvl}`] = Array.from(pips).map(p =>
                    p.classList.contains("active")
                );
            }
        }

        // Pact slots
        const pactPips = sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip");
        if (pactPips.length) {
            activeCharacter.trackingState.slotPips.pact = Array.from(pactPips).map(p =>
                p.classList.contains("active")
            );
        }

        // Class resources
        sheet.querySelectorAll<HTMLElement>(".class-resource-tracker").forEach(tracker => {
            const resKey = tracker.getAttribute("data-resource-key");
            if (!resKey) return;
            const resourcePips = tracker.querySelectorAll<HTMLButtonElement>(".pip");
            if (!resourcePips.length) return;
            activeCharacter!.trackingState!.resourcePips![resKey] = Array.from(resourcePips).map(p =>
                p.classList.contains("active")
            );
        });

        const inspirationToggle = sheet.querySelector<HTMLElement>("#inspiration-toggle");
        activeCharacter.trackingState.heroicInspiration =
            inspirationToggle?.classList.contains("active") ?? activeCharacter.vitals.heroicInspiration;
        activeCharacter.vitals.heroicInspiration = !!activeCharacter.trackingState.heroicInspiration;
        activeCharacter.vitals.currentHp = currentHp;
        activeCharacter.vitals.tempHp = tempHp;
        if (Array.isArray(activeCharacter.activeConditions)) {
            activeCharacter.trackingState.activeConditions = [...activeCharacter.activeConditions];
        }
        if (typeof activeCharacter.exhaustionLevel === "number") {
            activeCharacter.trackingState.exhaustionLevel = activeCharacter.exhaustionLevel;
        }
        if (activeCharacter.allowedSpellsByLevel) {
            activeCharacter.trackingState.allowedSpellsByLevel = { ...activeCharacter.allowedSpellsByLevel };
        }
        if (activeCharacter.featureChoices) {
            activeCharacter.trackingState.featureChoices = { ...activeCharacter.featureChoices };
        }
        if (activeCharacter.vitals.deathSaves) {
            activeCharacter.trackingState.deathSaves = { ...activeCharacter.vitals.deathSaves };
        }
        if (!activeCharacter.trackingState.itemQuantities) {
            activeCharacter.trackingState.itemQuantities = {};
        }
        activeCharacter.equipment.forEach(item => {
            if (typeof item.quantity === "number") {
                activeCharacter!.trackingState!.itemQuantities![item.name.toLowerCase().trim()] = item.quantity;
            }
        });
        (activeCharacter.weapons || []).forEach(w => {
            if (typeof w.quantity === "number") {
                activeCharacter!.trackingState!.itemQuantities![`weapon:${w.name.toLowerCase().trim()}`] = w.quantity;
            }
        });
    }

    function applyTrackerSnapshot() {
        if (!activeCharacter) return;
        if (activeCharacter.trackingState?.deathSaves) {
            activeCharacter.vitals.deathSaves = { ...activeCharacter.trackingState.deathSaves };
        }
        if (Array.isArray(activeCharacter.trackingState?.activeConditions)) {
            activeCharacter.activeConditions = [...activeCharacter.trackingState.activeConditions];
        }
        if (typeof activeCharacter.trackingState?.exhaustionLevel === "number") {
            activeCharacter.exhaustionLevel = activeCharacter.trackingState.exhaustionLevel;
        }
        if (activeCharacter.trackingState?.allowedSpellsByLevel) {
            activeCharacter.allowedSpellsByLevel = { ...activeCharacter.trackingState.allowedSpellsByLevel };
        }
        if (activeCharacter.trackingState?.featureChoices) {
            activeCharacter.featureChoices = {
                ...activeCharacter.trackingState.featureChoices,
                ...(activeCharacter.featureChoices || {})
            };
        }
        if (activeCharacter.trackingState?.itemQuantities) {
            const quantities = activeCharacter.trackingState.itemQuantities;
            activeCharacter.equipment.forEach(item => {
                const k = item.name.toLowerCase().trim();
                if (typeof quantities[k] === "number") {
                    item.quantity = quantities[k];
                }
            });
            (activeCharacter.weapons || []).forEach(w => {
                const wk = `weapon:${w.name.toLowerCase().trim()}`;
                const k = w.name.toLowerCase().trim();
                if (typeof quantities[wk] === "number") {
                    w.quantity = quantities[wk];
                } else if (typeof quantities[k] === "number") {
                    w.quantity = quantities[k];
                }
            });
        }
        const slotState = activeCharacter.trackingState?.slotPips || {};
        Object.keys(slotState).forEach(key => {
            const selector = key === "pact" ? "#pips-lvl-pact .pip" : `#pips-lvl-${key.replace("level", "")} .pip`;
            const pips = sheet.querySelectorAll<HTMLButtonElement>(selector);
            const states = slotState[key] || [];
            pips.forEach((pip, index) => {
                pip.classList.toggle("active", states[index] !== false);
            });
        });

        const resourceState = activeCharacter.trackingState?.resourcePips || {};
        Object.keys(resourceState).forEach(resKey => {
            const pips = sheet.querySelectorAll<HTMLButtonElement>(
                `.class-resource-tracker[data-resource-key="${resKey}"] .pip`
            );
            const states = resourceState[resKey] || [];
            pips.forEach((pip, index) => {
                pip.classList.toggle("active", states[index] !== false);
            });
        });

        const inspiration =
            activeCharacter.trackingState?.heroicInspiration ?? activeCharacter.vitals.heroicInspiration;
        const inspirationToggle = sheet.querySelector<HTMLElement>("#inspiration-toggle");
        if (inspirationToggle) {
            inspirationToggle.classList.toggle("active", !!inspiration);
            inspirationToggle.setAttribute("aria-pressed", String(!!inspiration));
        }

        currentHp = Number(activeCharacter.vitals.currentHp) || 0;
        maxHp = Number(activeCharacter.vitals.maxHp) || 0;
        tempHp = Number(activeCharacter.vitals.tempHp) || 0;
    }

    function syncHeaderSlotMarkers() {
        const headerSlotMarkers = sheet.querySelectorAll<HTMLButtonElement>(".header-slot-marker-btn");
        headerSlotMarkers.forEach(marker => {
            const level = marker.getAttribute("data-header-slot-level");
            const idx = Number(marker.getAttribute("data-header-slot-idx") || "0");
            const selector = level === "pact" ? "#pips-lvl-pact .pip" : `#pips-lvl-${level} .pip`;
            const matchingPips = sheet.querySelectorAll<HTMLButtonElement>(selector);
            const isActive = matchingPips[idx]?.classList.contains("active") ?? false;
            marker.classList.toggle("active", isActive);
            marker.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

    function updateSlotCounters() {
        for (let lvl = 1; lvl <= 9; lvl++) {
            const pips = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-${lvl} .pip`);
            const active = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-${lvl} .pip.active`).length;
            const count = sheet.querySelector<HTMLElement>(`#count-lvl-${lvl}`);
            if (count && pips.length) count.textContent = `${active} / ${pips.length}`;
        }

        const pactPips = sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip");
        const pactActive = sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip.active").length;
        const pactCount = sheet.querySelector<HTMLElement>("#count-lvl-pact");
        if (pactCount && pactPips.length) pactCount.textContent = `${pactActive} / ${pactPips.length}`;

        sheet.querySelectorAll<HTMLElement>(".class-resource-tracker").forEach(tracker => {
            const resKey = tracker.getAttribute("data-resource-key");
            if (!resKey) return;
            const resPips = tracker.querySelectorAll<HTMLButtonElement>(".pip");
            const resActive = tracker.querySelectorAll<HTMLButtonElement>(".pip.active").length;
            const countEl = tracker.querySelector<HTMLElement>(".slot-count");
            if (countEl && resPips.length) {
                countEl.textContent = `${resActive} / ${resPips.length}`;
            }
        });

        syncHeaderSlotMarkers();
    }

    function scheduleDebouncedAutoSave(delayMs = 700) {
        if (!el.isAuth || !activeCharacter) return;
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = null;
        }

        autoSaveTimer = setTimeout(async () => {
            if (!el.isAuth || !activeCharacter) return;

            if (autoSaveInFlight) {
                autoSaveQueued = true;
                return;
            }

            autoSaveInFlight = true;
            try {
                await saveActiveCharacter({ silent: true, background: true });
            } finally {
                autoSaveInFlight = false;
                if (autoSaveQueued) {
                    autoSaveQueued = false;
                    scheduleDebouncedAutoSave(150);
                }
            }
        }, delayMs);
    }

    async function saveActiveCharacter(options?: { silent?: boolean; background?: boolean }) {
        const silent = !!options?.silent;
        const background = !!options?.background;

        if (!el.isAuth) {
            if (!silent) showStatus("You must be logged in to save a character.", true);
            return;
        }
        if (!activeCharacter) {
            if (!silent) showStatus("Load or create a character before saving.", true);
            return;
        }

        if (saveBtn && !background) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        }

        try {
            const isUpdatingExisting = Boolean(activeCharacter.savedCharacterId || activeCharacter.siteCharacterId);
            const savePayload = {
                savedId: activeCharacter.savedCharacterId,
                siteCharacterId: activeCharacter.siteCharacterId,
                source: activeCharacter.source || (activeCharacterId && /^\d+$/.test(activeCharacterId) ? "dndbeyond" : "site"),
                externalCharacterId:
                    activeCharacter.source === "dndbeyond" || /^\d+$/.test(String(activeCharacterId || ""))
                        ? activeCharacterId || activeCharacter.id
                        : undefined,
                name: activeCharacter.name,
                character: activeCharacter
            };
            const response = isUpdatingExisting
                ? await putData<{
                    savedCharacter?: { id: number; name: string; siteCharacterId?: string; source?: "site" | "dndbeyond"; externalCharacterId?: string };
                    character?: CharacterData;
                }>("/save-character", savePayload)
                : await postData<{
                    savedCharacter?: { id: number; name: string; siteCharacterId?: string; source?: "site" | "dndbeyond"; externalCharacterId?: string };
                    character?: CharacterData;
                }>("/create-character", savePayload);

            if (response?.savedCharacter?.id) {
                activeCharacter.savedCharacterId = response.savedCharacter.id;
            }
            if (response?.savedCharacter?.siteCharacterId) {
                activeCharacter.siteCharacterId = response.savedCharacter.siteCharacterId;
                activeCharacterId = response.savedCharacter.siteCharacterId;
                if (idInput) idInput.value = response.savedCharacter.siteCharacterId;
            }
            if (response?.savedCharacter?.source) {
                activeCharacter.source = response.savedCharacter.source;
            }
            if (response?.character) {
                activeCharacter = response.character;
            }

            await fetchSavedCharacters();
            if (!silent) showStatus(`Saved "${activeCharacter.name}" to your account.`);
            if (typeof window !== "undefined" && window.history?.replaceState && activeCharacterId) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("id", String(activeCharacterId));
                window.history.replaceState({}, "", currentUrl.toString());
            }
        } catch (error) {
            console.error("Failed to save character:", error);
            if (!silent) showStatus("Could not save character. Make sure you are logged in.", true);
        } finally {
            if (saveBtn && !background) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Character';
            }
            ctx.setCharacterActionsVisibility();
        }
    }

    async function fetchSavedCharacters() {
        if (!el.isAuth) {
            savedCharacters = [];
            return;
        }
        try {
            const response = await getData<{ characters?: SavedCharacterSummary[] }>("/get-saved-characters");
            savedCharacters = response?.characters || [];
        } catch (error) {
            savedCharacters = [];
            console.warn("Failed to fetch saved characters:", error);
        }
    }

    async function findSavedCharacterByDndId(dndCharacterId: string): Promise<SavedCharacterSummary | undefined> {
        if (!el.isAuth) return undefined;
        try {
            const response = await getData<{
                savedCharacter?: {
                    id?: number;
                    siteCharacterId?: string;
                    source?: "site" | "dndbeyond";
                    name?: string;
                    externalCharacterId?: string;
                };
                character?: CharacterData;
            }>(`/get-saved-character?externalCharacterId=${encodeURIComponent(dndCharacterId)}`);

            if (!response?.savedCharacter?.id) return undefined;

            return {
                id: response.savedCharacter.id,
                siteCharacterId: response.savedCharacter.siteCharacterId,
                source: response.savedCharacter.source,
                name: response.savedCharacter.name || response.character?.name || "Saved Character",
                externalCharacterId: response.savedCharacter.externalCharacterId,
                savedPayload: response.character
            };
        } catch {
            return undefined;
        }
    }

    async function loadSavedCharacter(savedCharacterId: number) {
        return loadSavedCharacterRequest(`id=${savedCharacterId}`);
    }

    async function loadSavedCharacterBySiteId(siteCharacterId: string) {
        return loadSavedCharacterRequest(`siteCharacterId=${encodeURIComponent(siteCharacterId)}`);
    }

    async function deleteSavedCharacter(savedCharacterId: number): Promise<boolean> {
        showStatus("Deleting character...");
        try {
            const result = await delData<{ success?: boolean; error?: string }>(`/delete-saved-character?id=${savedCharacterId}`);
            if (result && (result as any).error) {
                throw new Error((result as any).error);
            }
            await fetchSavedCharacters();
            if (activeCharacter?.savedCharacterId === savedCharacterId) {
                activeCharacter = null;
                activeCharacterId = undefined;
                if (idInput) idInput.value = "";
                renderActiveCharacterView();
            } else if (ctx.renderSavedCharacterList) {
                ctx.renderSavedCharacterList();
            }
            showStatus("Character deleted.", false);
            return true;
        } catch (error: any) {
            console.error("Failed to delete character:", error);
            showStatus(error?.message || "Failed to delete character.", true);
            return false;
        }
    }

    async function loadSavedCharacterRequest(query: string) {
        clearImportWarning();
        showStatus("Loading saved character...");
        try {
            const response = await getData<{
                character?: CharacterData;
                savedCharacter?: {
                    externalCharacterId?: string;
                    siteCharacterId?: string;
                    source?: "site" | "dndbeyond";
                    id?: number;
                };
            }>(`/get-saved-character?${query}`);
            if (!response?.character) {
                throw new Error("Missing saved character payload.");
            }

            activeRawDndBeyondPayload = undefined;
            currentEquipOverrides = [];
            activeCharacter = response.character;
            if (!Array.isArray(activeCharacter.actions)) activeCharacter.actions = [];
            if (!Array.isArray(activeCharacter.spells)) activeCharacter.spells = [];
            if (!Array.isArray(activeCharacter.weapons)) activeCharacter.weapons = [];
            if (!Array.isArray(activeCharacter.equipment)) activeCharacter.equipment = [];
            if (!Array.isArray(activeCharacter.features)) activeCharacter.features = [];
            if (!Array.isArray(activeCharacter.skills)) activeCharacter.skills = [];
            if (!Array.isArray(activeCharacter.abilities)) activeCharacter.abilities = [];
            if (!activeCharacter.spellSlots || typeof activeCharacter.spellSlots !== "object") activeCharacter.spellSlots = {};
            if (!activeCharacter.proficiencies || typeof activeCharacter.proficiencies !== "object") {
                activeCharacter.proficiencies = { armor: [], weapons: [], tools: [], languages: ["Common"] };
            }
            ensureClassResourcesOnCharacter(activeCharacter);
            ensureSavingThrowNotesOnCharacter(activeCharacter);
            ensureFeatureDecisionsOnCharacterData(activeCharacter);
            ensureBaseScoresOnCharacter(activeCharacter, undefined);
            activeCharacter.savedCharacterId = response.savedCharacter?.id || activeCharacter.savedCharacterId;
            activeCharacter.siteCharacterId = response.savedCharacter?.siteCharacterId || activeCharacter.siteCharacterId;
            activeCharacter.source = response.savedCharacter?.source || activeCharacter.source || "site";
            activeCharacterId =
                response.savedCharacter?.siteCharacterId ||
                response.savedCharacter?.externalCharacterId ||
                String(activeCharacter.id || "");
            currentHp = activeCharacter.vitals.currentHp;
            maxHp = activeCharacter.vitals.maxHp;
            tempHp = Number(activeCharacter.vitals.tempHp) || 0;

            if (idInput && activeCharacterId) {
                idInput.value = activeCharacterId;
            }
            renderActiveCharacterView();

            if (activeCharacter.spells?.length) {
                void postData("/sync-character-spells", { spells: activeCharacter.spells }).catch(() => { });
            }
            if (activeCharacter.weapons?.length || activeCharacter.equipment?.length) {
                void postData("/sync-character-items", { weapons: activeCharacter.weapons, equipment: activeCharacter.equipment }).catch(() => { });
            }
            void postData("/sync-character-rules", { character: activeCharacter }).catch(() => { });

            if (activeCharacter.source === "dndbeyond") {
                const externalId =
                    response.savedCharacter?.externalCharacterId ||
                    (activeCharacter.id && /^\d+$/.test(String(activeCharacter.id)) ? String(activeCharacter.id) : undefined) ||
                    activeCharacterId;
                if (externalId && /^\d+$/.test(String(externalId))) {
                    void getData<any>(`/get-dndbeyond-character?id=${externalId}`).then(raw => {
                        if (raw) {
                            activeRawDndBeyondPayload = raw;
                            if (activeCharacter) {
                                ensureClassResourcesOnCharacter(activeCharacter, raw);
                                ensureSavingThrowNotesOnCharacter(activeCharacter, raw);
                                ensureBaseScoresOnCharacter(activeCharacter, raw);
                            }
                        }
                    }).catch(() => { });
                }
            }
            if (activeCharacter.source === "dndbeyond") {
                showDndBeyondNoteTemporarily(15000);
            } else {
                hideDndBeyondNote();
            }
            showStatus(`Loaded saved character "${activeCharacter.name}".`);
            if (typeof window !== "undefined" && window.history?.replaceState && activeCharacterId) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("id", activeCharacterId);
                window.history.replaceState({}, "", currentUrl.toString());
            }
        } catch (error) {
            console.error("Failed to load saved character:", error);
            showStatus("Could not load saved character.", true);
        }
    }

    function createEmptySiteCharacter(): CharacterData {
        return {
            source: "site",
            name: "New Adventurer",
            subtitle: "Custom Character • Level 1",
            level: 1,
            classes: [{ name: "Adventurer", level: 1 }],
            race: "Unknown",
            background: "Custom",
            alignment: "Unaligned",
            avatarUrl: "",
            dndBeyondUrl: "",
            vitals: {
                currentHp: 10,
                maxHp: 10,
                tempHp: 0,
                armorClass: 10,
                initiative: 0,
                speed: "30 ft.",
                proficiencyBonus: 2,
                passivePerception: 10,
                passiveInvestigation: 10,
                passiveInsight: 10,
                blindsight: "None",
                darkvision: "None",
                tremorsense: "None",
                truesight: "None",
                hitDice: "1d8",
                heroicInspiration: false,
                spellSaveDc: 10,
                spellAttackBonus: 2,
                spellcastingAbility: "None"
            },
            abilities: [
                { name: "Strength", abbr: "STR", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 },
                { name: "Dexterity", abbr: "DEX", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 },
                { name: "Constitution", abbr: "CON", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 },
                { name: "Intelligence", abbr: "INT", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 },
                { name: "Wisdom", abbr: "WIS", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 },
                { name: "Charisma", abbr: "CHA", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 }
            ],
            skills: [],
            spellSlots: {},
            actions: [],
            features: [],
            equipment: [],
            weapons: [],
            proficiencies: {
                armor: [],
                weapons: [],
                tools: [],
                languages: []
            },
            spells: []
        };
    }

    function beginNewSiteCharacter() {
        window.location.href = "/character-sheet/creator";
    }

    function syncSheetVitalsAndStatsToDom() {
        const char = activeCharacter;
        if (!char) return;

        // Apply all magical item and weapon bonuses to activeCharacter
        applyMagicalItemBonuses(char);

        // Update Ability cards in DOM
        const abilitiesContainer = sheet.querySelector<HTMLElement>(".abilities-container");
        if (abilitiesContainer) {
            abilitiesContainer.innerHTML = renderAbilityCards(char);
        }

        // Update Vitals cards in DOM if already rendered
        const acEl = sheet.querySelector<HTMLElement>(".vital-ac .vital-val");
        if (acEl) acEl.textContent = String(char.vitals.armorClass);
        const initEl = sheet.querySelector<HTMLElement>(".vital-init .vital-val");
        if (initEl) {
            initEl.textContent =
                char.vitals.initiative >= 0
                    ? `+${char.vitals.initiative}`
                    : String(char.vitals.initiative);
        }
        const speedEl = sheet.querySelector<HTMLElement>(".vital-speed .vital-val");
        if (speedEl) speedEl.textContent = char.vitals.speed;
        const dcEl = sheet.querySelector<HTMLElement>(".vital-dc .vital-val");
        if (dcEl) dcEl.textContent = String(char.vitals.spellSaveDc);
        const atkEl = sheet.querySelector<HTMLElement>(".vital-attack .vital-val");
        if (atkEl) atkEl.textContent = `+${char.vitals.spellAttackBonus}`;
        // Special senses change with equipped items (Goggles of Night)
        const sensesList = sheet.querySelector<HTMLElement>(".vital-special-senses .special-senses-list");
        if (sensesList) sensesList.innerHTML = renderSpecialSensesList(char);
        const percEl = sheet.querySelector<HTMLElement>(".vital-passive-perception .vital-val, .sense-passive-perception-val");
        if (percEl) percEl.textContent = String(char.vitals.passivePerception);
        const invEl = sheet.querySelector<HTMLElement>(".vital-passive-investigation .vital-val, .sense-passive-investigation-val");
        if (invEl) invEl.textContent = String(char.vitals.passiveInvestigation);
        const insEl = sheet.querySelector<HTMLElement>(".vital-passive-insight .vital-val, .sense-passive-insight-val");
        if (insEl) insEl.textContent = String(char.vitals.passiveInsight);

        // Update sticky vitals bar stats if rendered
        const stickyAcEl = sheet.querySelector<HTMLElement>("#sticky-vital-ac-val");
        if (stickyAcEl) stickyAcEl.textContent = String(char.vitals.armorClass);
        const stickyDcEl = sheet.querySelector<HTMLElement>("#sticky-vital-dc-val");
        if (stickyDcEl) stickyDcEl.textContent = String(char.vitals.spellSaveDc);
        const stickyAtkEl = sheet.querySelector<HTMLElement>("#sticky-vital-attack-val");
        if (stickyAtkEl) stickyAtkEl.textContent = `+${char.vitals.spellAttackBonus}`;

        updateHpDisplay();

        // Update Skills table if rendered
        const skillsContainer = sheet.querySelector<HTMLElement>("#tab-skills .skills-container");
        if (skillsContainer) {
            skillsContainer.innerHTML = renderSkills(char);
            initSkillsController(ctx);
        }

        // Update Weapons grids
        sheet.querySelectorAll<HTMLElement>(".weapons-grid").forEach(grid => {
            grid.innerHTML = renderWeapons(char);
        });
        initWeaponsController(ctx);

        // Update the Actions tab's action cards (the weapon attacks above it are a .weapons-grid)
        const actionsGrid = sheet.querySelector<HTMLElement>("#tab-actions .actions-grid");
        if (actionsGrid) {
            actionsGrid.innerHTML = renderActions(char);
            initActionsController(ctx);
        }
        restoreUsePips(sheet, char);
    }

    function recalculateFromRawPayload() {
        if (!activeCharacter) return;
        if (activeRawDndBeyondPayload) {
            try {
                const oldMaxHp = Number(activeCharacter.vitals.maxHp) || 0;
                const recomputed = parseDndBeyondCharacter(
                    activeRawDndBeyondPayload,
                    String(activeCharacter.id || activeCharacterId || ""),
                    currentEquipOverrides,
                    activeCharacter.featureChoices
                );
                ensureBaseScoresOnCharacter(recomputed, activeRawDndBeyondPayload);
                if (activeCharacter.lockedFields) {
                    applyLockedFieldsToRefreshedCharacter(recomputed, activeCharacter);
                }
                const maxHpDelta = (Number(recomputed.vitals.maxHp) || 0) - oldMaxHp;
                activeCharacter.vitals.maxHp = recomputed.vitals.maxHp;
                maxHp = recomputed.vitals.maxHp;
                if (maxHpDelta !== 0) {
                    currentHp = Math.max(0, Math.min(maxHp, currentHp + maxHpDelta));
                    activeCharacter.vitals.currentHp = currentHp;
                }
                activeCharacter.vitals.armorClass = recomputed.vitals.armorClass;
                activeCharacter.vitals.initiative = recomputed.vitals.initiative;
                activeCharacter.vitals.speed = recomputed.vitals.speed;
                activeCharacter.vitals.proficiencyBonus = recomputed.vitals.proficiencyBonus;
                activeCharacter.vitals.passivePerception = recomputed.vitals.passivePerception;
                activeCharacter.vitals.passiveInvestigation = recomputed.vitals.passiveInvestigation;
                activeCharacter.vitals.passiveInsight = recomputed.vitals.passiveInsight;
                activeCharacter.vitals.blindsight = recomputed.vitals.blindsight;
                activeCharacter.vitals.darkvision = recomputed.vitals.darkvision;
                activeCharacter.vitals.spellSaveDc = recomputed.vitals.spellSaveDc;
                activeCharacter.vitals.spellAttackBonus = recomputed.vitals.spellAttackBonus;
                activeCharacter.vitals.spellcastingAbility = recomputed.vitals.spellcastingAbility;
                activeCharacter.abilities = recomputed.abilities;
                activeCharacter.skills = recomputed.skills;
                // Weapons locked on this character stay as they are, and the rest keep their database links
                carryLockedCopiesAndLinks(recomputed, activeCharacter);
                activeCharacter.weapons = recomputed.weapons;
                if (activeCharacter.trackingState?.itemQuantities) {
                    const quantities = activeCharacter.trackingState.itemQuantities;
                    activeCharacter.equipment.forEach(item => {
                        const k = item.name.toLowerCase().trim();
                        if (typeof quantities[k] === "number") {
                            item.quantity = quantities[k];
                        }
                    });
                    (activeCharacter.weapons || []).forEach(w => {
                        const wk = `weapon:${w.name.toLowerCase().trim()}`;
                        const k = w.name.toLowerCase().trim();
                        if (typeof quantities[wk] === "number") {
                            w.quantity = quantities[wk];
                        } else if (typeof quantities[k] === "number") {
                            w.quantity = quantities[k];
                        }
                    });
                }
                activeCharacter.actions = recomputed.actions;
                activeCharacter.features = recomputed.features;
                activeCharacter.proficiencies = recomputed.proficiencies;
            } catch (err) {
                console.warn("Could not recalculate character stats from raw payload:", err);
            }
        }
        syncSheetVitalsAndStatsToDom();
    }

    function setItemQuantity(itemName: string, newQuantity: number, scope?: "equipment" | "weapon") {
        if (!activeCharacter) return;
        const cleanName = itemName.toLowerCase().trim();
        const qty = Math.max(0, Math.round(newQuantity));

        if (!activeCharacter.trackingState) {
            activeCharacter.trackingState = {};
        }
        if (!activeCharacter.trackingState.itemQuantities) {
            activeCharacter.trackingState.itemQuantities = {};
        }
        activeCharacter.trackingState.itemQuantities[cleanName] = qty;
        activeCharacter.trackingState.itemQuantities[`weapon:${cleanName}`] = qty;

        activeCharacter.equipment.forEach(item => {
            if (item.name.toLowerCase().trim() === cleanName) {
                item.quantity = qty;
            }
        });

        (activeCharacter.weapons || []).forEach(weapon => {
            if (weapon.name.toLowerCase().trim() === cleanName) {
                weapon.quantity = qty;
            }
        });

        if (activeRawDndBeyondPayload) {
            const rawInv = (activeRawDndBeyondPayload.data || activeRawDndBeyondPayload).inventory;
            if (Array.isArray(rawInv)) {
                rawInv.forEach((rawItem: any) => {
                    if ((rawItem.definition?.name || "").toLowerCase().trim() === cleanName) {
                        rawItem.quantity = qty;
                    }
                });
            }
        }

        sheet.querySelectorAll<HTMLInputElement>(`.item-qty-input`).forEach(input => {
            const encodedItemName = input.getAttribute("data-item-name");
            const encodedWeaponName = input.getAttribute("data-weapon-name");
            if (encodedItemName && decodeURIComponent(encodedItemName).toLowerCase().trim() === cleanName) {
                input.value = String(qty);
            }
            if (encodedWeaponName && decodeURIComponent(encodedWeaponName).toLowerCase().trim() === cleanName) {
                input.value = String(qty);
            }
        });

        const modalInput = sheet.querySelector<HTMLInputElement>("#modal-item-quantity-input");
        const modalTitle = sheet.querySelector<HTMLElement>("#modal-item-name")?.textContent?.toLowerCase().trim();
        if (modalInput && modalTitle === cleanName) {
            modalInput.value = String(qty);
        }

        persistTrackerSnapshot();
        scheduleDebouncedAutoSave();
    }

    function applyPersistedEquipStates(
        states: Array<{ scope: "item" | "weapon" | "weapon-mastery" | "attunement"; itemName: string; equipped: boolean }>
    ) {
        if (!states?.length || !activeCharacter) return;

        currentEquipOverrides = [...states];

        const stateMap = new Map<string, boolean>();
        states.forEach(state => {
            const key = `${state.scope}:${state.itemName.toLowerCase()}`;
            stateMap.set(key, !!state.equipped);
        });

        activeCharacter.equipment.forEach(item => {
            const key = `item:${item.name.toLowerCase()}`;
            if (stateMap.has(key)) {
                item.equipped = !!stateMap.get(key);
            }
            const attuneKey = `attunement:${item.name.toLowerCase()}`;
            if (stateMap.has(attuneKey)) {
                item.attuned = !!stateMap.get(attuneKey);
            }
        });

        (activeCharacter.weapons || []).forEach(weapon => {
            const key = `weapon:${weapon.name.toLowerCase()}`;
            if (stateMap.has(key)) {
                weapon.equipped = !!stateMap.get(key);
            }
            const attuneKey = `attunement:${weapon.name.toLowerCase()}`;
            if (stateMap.has(attuneKey)) {
                weapon.attuned = !!stateMap.get(attuneKey);
            }

            if (weapon.mastery?.name) {
                const masteryKey = `weapon-mastery:${weapon.name.toLowerCase()}::${weapon.mastery.name.toLowerCase()}`;
                if (stateMap.has(masteryKey)) {
                    weapon.mastery.unlocked = !!stateMap.get(masteryKey);
                }
            }
        });

        recalculateFromRawPayload();
    }

    async function persistEquipState(
        scope: "item" | "weapon" | "weapon-mastery" | "attunement",
        encodedName: string,
        rawDefinitionId: string | null,
        equipped: boolean
    ) {
        const characterId = String(activeCharacter?.id || activeCharacterId || "").trim();
        if (!characterId) return;

        const itemName = decodeURIComponent(encodedName).trim();
        const definitionId =
            rawDefinitionId && !Number.isNaN(Number(rawDefinitionId)) ? Number(rawDefinitionId) : undefined;

        const existingIdx = currentEquipOverrides.findIndex(
            s => s.scope === scope && s.itemName.toLowerCase() === itemName.toLowerCase()
        );
        if (existingIdx >= 0) {
            currentEquipOverrides[existingIdx].equipped = equipped;
        } else {
            currentEquipOverrides.push({ scope, itemName, equipped });
        }
        recalculateFromRawPayload();

        try {
            await putData("/set-character-equip-state", {
                characterId,
                scope,
                itemName,
                definitionId,
                equipped
            });
        } catch (error) {
            console.warn(`Failed to persist ${scope} equipped state for ${itemName}:`, error);
        }
    }

    function applyFeatureDecisionChange(decisionId: string, newValue: string) {
        if (!activeCharacter) return;
        persistTrackerSnapshot();

        const beforeScores = new Map<string, number>();
        activeCharacter.abilities.forEach(a => beforeScores.set(a.abbr, a.score));

        const applied = applyFeatureDecisionOnCharacterData(activeCharacter, decisionId, newValue);
        const inPlaceAbilities = activeCharacter.abilities.map(a => ({ ...a }));
        const inPlaceVitals = { ...activeCharacter.vitals };
        const inPlaceSkills = activeCharacter.skills.map(s => ({ ...s }));

        if (activeRawDndBeyondPayload) {
            recalculateFromRawPayload();
            // Ensure that if applyFeatureDecisionOnCharacterData changed an ability score
            // (e.g. from an unlinked or saved decision), recalculateFromRawPayload did not revert it
            const abilityChangedInPlace = inPlaceAbilities.some(
                a => (beforeScores.get(a.abbr) ?? a.score) !== a.score
            );
            const abilityChangedInRaw = activeCharacter.abilities.some(
                a => (beforeScores.get(a.abbr) ?? a.score) !== a.score
            );
            if (abilityChangedInPlace && !abilityChangedInRaw) {
                activeCharacter.abilities = inPlaceAbilities;
                activeCharacter.vitals = inPlaceVitals;
                activeCharacter.skills = inPlaceSkills;
            }
        }
        currentHp = Number(activeCharacter.vitals.currentHp) || 0;
        maxHp = Number(activeCharacter.vitals.maxHp) || 0;

        renderActiveCharacterView();
        persistTrackerSnapshot();
        scheduleDebouncedAutoSave();

        if (applied) {
            showStatus(`Updated ${applied.featureName} (${applied.decisionLabel}: ${applied.optionLabel}) — character stats recalculated.`);
        }
    }

    function resolveActiveDndBeyondId(): string | undefined {
        const candidates = [
            String(activeCharacter?.id || "").trim(),
            String(activeCharacterId || "").trim(),
            String(idInput?.value || "").trim()
        ];

        for (const candidate of candidates) {
            const match = candidate.match(/\d{3,}/);
            if (match) return match[0];
        }
        return undefined;
    }

    async function refreshFromDndBeyondAndOverride() {
        if (!activeCharacter || activeCharacter.source !== "dndbeyond") {
            showStatus("Load a D&D Beyond character first.", true);
            return;
        }

        const dndId = resolveActiveDndBeyondId();
        if (!dndId) {
            showStatus("Could not determine D&D Beyond character ID for refresh.", true);
            return;
        }

        await loadCharacter(dndId, { forceOverwrite: true, refreshed: true });
    }

    async function loadCharacter(idOrUrl: string, options?: { forceOverwrite?: boolean; refreshed?: boolean }) {
        const trimmed = idOrUrl.trim();
        if (/^tga-[a-z0-9]{8,20}$/i.test(trimmed)) {
            if (!el.isAuth) {
                showStatus("Site character IDs require login.", true);
                return;
            }
            await loadSavedCharacterBySiteId(trimmed.toLowerCase());
            return;
        }
        const extractedId = trimmed.match(/\d{6,}/)?.[0] || trimmed;
        if (!extractedId || !/^\d+$/.test(extractedId)) {
            showStatus("Use a D&D Beyond numeric ID/URL or a site ID like tga-abc12345.", true);
            return;
        }

        const existingSaved = await findSavedCharacterByDndId(extractedId);
        let shouldOverwriteSaved = false;
        if (existingSaved && el.isAuth) {
            if (options?.forceOverwrite) {
                shouldOverwriteSaved = true;
            } else {
                const agreed = window.confirm(
                    `This D&D Beyond character is already saved as "${existingSaved.name}" on The Green Asterisk.\n\n` +
                    `Press OK to overwrite your saved version with fresh D&D Beyond data, or Cancel to keep existing saved data.`
                );

                if (!agreed) {
                    if (existingSaved.siteCharacterId) {
                        await loadSavedCharacterBySiteId(existingSaved.siteCharacterId);
                    } else {
                        await loadSavedCharacter(existingSaved.id);
                    }
                    showStatus(`Kept existing saved data for "${existingSaved.name}".`);
                    return;
                }
                shouldOverwriteSaved = true;
            }
        }

        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        }
        clearImportWarning();
        showStatus(`Fetching D&D Beyond character #${extractedId}...`);

        const currentActiveId = activeCharacter
            ? ((activeCharacter as any).externalCharacterId ||
                (activeCharacter.id && /^\d+$/.test(String(activeCharacter.id)) ? String(activeCharacter.id) : undefined) ||
                activeCharacter.siteCharacterId ||
                activeCharacterId)
            : undefined;

        const isSameCharacter = !!(
            activeCharacter &&
            (options?.refreshed ||
                (currentActiveId && String(currentActiveId) === String(extractedId)) ||
                (activeCharacter.id && String(activeCharacter.id) === String(extractedId)) ||
                ((activeCharacter as any).externalCharacterId && String((activeCharacter as any).externalCharacterId) === String(extractedId)) ||
                (activeCharacter.siteCharacterId && String(activeCharacter.siteCharacterId).toLowerCase() === String(extractedId).toLowerCase()))
        );

        try {
            const freshParam = options?.refreshed ? "&fresh=true" : "";
            const rawData = await getData<any>(`/get-dndbeyond-character?id=${extractedId}${freshParam}`);
            activeRawDndBeyondPayload = rawData;
            currentEquipOverrides = [];
            const parsed = parseDndBeyondCharacter(rawData, trimmed);
            ensureBaseScoresOnCharacter(parsed, rawData);
            showImportWarning(parsed);

            if (isSameCharacter && activeCharacter?.lockedFields) {
                applyLockedFieldsToRefreshedCharacter(parsed, activeCharacter);
            } else {
                delete parsed.lockedFields;
            }
            // Spells and items locked on this character stay as they are, and every copy keeps its database link
            if (isSameCharacter && activeCharacter) {
                carryLockedCopiesAndLinks(parsed, activeCharacter);
            }
            if (parsed.spells?.length) {
                void postData("/sync-character-spells", { spells: parsed.spells }).catch(() => { });
            }
            if (parsed.weapons?.length || parsed.equipment?.length) {
                void postData("/sync-character-items", { weapons: parsed.weapons, equipment: parsed.equipment }).catch(() => { });
            }
            void postData("/sync-character-rules", {
                character: parsed,
                rawCharacter: (rawData as any)?.data || rawData
            }).catch(() => { });
            activeCharacterId = extractedId;
            activeCharacter = parsed;
            activeCharacter.source = "dndbeyond";
            activeCharacter.siteCharacterId = undefined;
            activeCharacter.savedCharacterId = undefined;

            if (shouldOverwriteSaved && existingSaved) {
                try {
                    const overwriteRes = await putData<{
                        savedCharacter?: { id: number; siteCharacterId?: string; source?: "site" | "dndbeyond" };
                        character?: CharacterData;
                    }>("/save-character", {
                        savedId: existingSaved.id,
                        siteCharacterId: existingSaved.siteCharacterId,
                        source: "dndbeyond",
                        externalCharacterId: extractedId,
                        name: activeCharacter.name,
                        character: activeCharacter
                    });

                    if (overwriteRes?.character) {
                        activeCharacter = overwriteRes.character;
                    }
                    if (overwriteRes?.savedCharacter?.id) {
                        activeCharacter.savedCharacterId = overwriteRes.savedCharacter.id;
                    }
                    if (overwriteRes?.savedCharacter?.siteCharacterId) {
                        activeCharacter.siteCharacterId = overwriteRes.savedCharacter.siteCharacterId;
                        activeCharacterId = overwriteRes.savedCharacter.siteCharacterId;
                    }
                    activeCharacter.source = overwriteRes?.savedCharacter?.source || "dndbeyond";
                    await fetchSavedCharacters();
                } catch (overwriteError) {
                    console.error("Failed to overwrite existing saved character:", overwriteError);
                    showStatus("Loaded D&D Beyond character, but failed to overwrite saved data.", true);
                }
            }

            try {
                const persisted = await getData<{
                    states?: Array<{ scope: "item" | "weapon" | "weapon-mastery"; itemName: string; equipped: boolean }>;
                }>(`/get-character-equip-states?id=${extractedId}`);
                if (persisted?.states?.length) {
                    applyPersistedEquipStates(persisted.states);
                }
            } catch (stateError) {
                console.warn(`Could not load persisted equip states for character ${extractedId}:`, stateError);
            }

            currentHp = activeCharacter.vitals.currentHp;
            maxHp = activeCharacter.vitals.maxHp;
            tempHp = Number(activeCharacter.vitals.tempHp) || 0;

            renderActiveCharacterView();
            showDndBeyondNoteTemporarily(15000);
            showStatus(
                shouldOverwriteSaved
                    ? (options?.refreshed
                        ? `Refreshed and overwrote saved data for "${activeCharacter.name}" from D&D Beyond.`
                        : `Loaded and overwrote saved data for "${activeCharacter.name}" from D&D Beyond.`)
                    : `Loaded "${activeCharacter.name}" (Level ${activeCharacter.level} ${activeCharacter.classes.map(c => c.name).join("/")}) successfully!`
            );

            if (typeof window !== "undefined" && window.history?.replaceState) {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set("id", activeCharacter.siteCharacterId || extractedId);
                window.history.replaceState({}, "", currentUrl.toString());
            }
        } catch (error: any) {
            console.error("Failed to load D&D Beyond character:", error);
            showStatus(`Could not load character #${extractedId}. Ensure the character is public on D&D Beyond.`, true);
        } finally {
            if (loadBtn) {
                loadBtn.disabled = false;
                loadBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Load Character';
            }
        }
    }

    // Context object that each separate controller uses
    const ctx: CharacterSheetContext = {
        sheet,
        dynamicContainer,
        getCharacter: () => activeCharacter,
        setCharacter: (char) => {
            activeCharacter = char;
        },
        getActiveCharacterId: () => activeCharacterId,
        setActiveCharacterId: (id) => {
            activeCharacterId = id;
        },
        prefer2024Rules,
        spellMap,
        getSavedCharacters: () => savedCharacters,
        setSavedCharacters: (list) => {
            savedCharacters = list;
        },
        showStatus,
        renderActiveCharacterView,
        renderSavedCharacterList: () => { },
        setCharacterActionsVisibility: () => { },
        setItemQuantity,
        syncSheetStats: syncSheetVitalsAndStatsToDom,
        recalculateFromRawPayload,
        saveActiveCharacter,
        scheduleDebouncedAutoSave,
        loadCharacter,
        loadSavedCharacter,
        loadSavedCharacterBySiteId,
        deleteSavedCharacter,
        fetchSavedCharacters,
        beginNewSiteCharacter,
        refreshFromDndBeyondAndOverride,
        persistEquipState,
        applyFeatureDecisionChange,
        openSpellModal: async () => { },
        closeSpellModal: () => { },
        openItemModal: async () => { },
        closeItemModal: () => { },
        openActionModal: () => { },
        closeActionModal: () => { },
        openFeatureModal: () => { },
        openCustomSpellModal: () => { },
        openCustomItemModal: () => { },
        closeCustomSpellModal: () => { },
        openMarkupGuideModal: () => { },
        closeMarkupGuideModal: () => { },
        openManageSpellsModal: async () => { },
        closeManageSpellsModal: () => { },
        openManageItemsModal: async () => { },
        closeManageItemsModal: () => { },
        openConditionsModal: async () => { },
        closeConditionsModal: () => { },
        openConditionDetailModal: async () => { },
        closeConditionDetailModal: () => { },
        updateHeroConditionsDisplay: () => { },
        getCurrentHp: () => currentHp,
        setCurrentHp: (hp) => {
            currentHp = hp;
        },
        getMaxHp: () => maxHp,
        setMaxHp: (hp) => {
            maxHp = hp;
        },
        getTempHp: () => tempHp,
        setTempHp: (hp) => {
            tempHp = hp;
        },
        updateHpDisplay,
        applyHpDelta,
        syncDeathSavesDisplay,
        persistTrackerSnapshot,
        applyTrackerSnapshot,
        updateSlotCounters,
        syncHeaderSlotMarkers
    };

    // Initialize root controllers (Modals, Loader Bar, Fullscreen, Edit Mode)
    initModalsController(ctx);
    initLoaderBarController(ctx);
    initFullscreenController(sheet);

    function renderActiveCharacterView() {
        updateSheetTitle();
        if (!activeCharacter || !dynamicContainer) return;
        const previousActiveTabTarget = sheet
            .querySelector<HTMLButtonElement>(".tab-btn.active")
            ?.getAttribute("data-tab-target");

        dynamicContainer.innerHTML = renderSheetContent(activeCharacter);
        // Rebuild in-memory spell map
        spellMap.clear();
        activeCharacter.spells.forEach(spell => {
            spellMap.set(spell.name.toLowerCase(), spell);
        });

        // Run each component's dedicated controller
        initTabsController(ctx);
        if (previousActiveTabTarget) {
            const targetBtn = sheet.querySelector<HTMLButtonElement>(
                `.tab-btn[data-tab-target="${previousActiveTabTarget}"]`
            );
            const targetPane = sheet.querySelector<HTMLElement>(`#${previousActiveTabTarget}`);
            if (targetBtn && targetPane) {
                sheet.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                sheet.querySelectorAll<HTMLElement>(".tab-pane").forEach(p => {
                    p.classList.remove("active");
                });
                targetBtn.classList.add("active");
                targetBtn.setAttribute("aria-selected", "true");
                targetPane.classList.add("active");
            }
        }
        initHeroController(ctx);
        initVitalsController(ctx);
        initAbilitiesController(ctx);
        initSkillsController(ctx);
        initActionsController(ctx);
        initSpellsController(ctx);
        initWeaponsController(ctx);
        initEquipmentController(ctx);
        initFeaturesController(ctx);
        initResourcesController(ctx);
        initDetailsController(ctx);

        applyTrackerSnapshot();
        updateHpDisplay();
        updateSlotCounters();
        persistTrackerSnapshot();

        ctx.setCharacterActionsVisibility();
    }

    ctx.renderActiveCharacterView = renderActiveCharacterView;
    ctx.setCharacterActionsVisibility();

    // Class rules (spellcasting, expanded spell lists) come from the server; load them before the first character
    const classRulesReady = loadClassRules();

    // Check if a specific ID was passed via initial parameters, query string, or path
    if (activeCharacterId) {
        if (idInput) idInput.value = activeCharacterId.toString();
        const initialId = activeCharacterId.toString();
        void classRulesReady.then(() => loadCharacter(initialId));
    } else {
        if (idInput) idInput.value = "";
        if (el.isAuth) {
            void fetchSavedCharacters().then(() => {
                ctx.renderSavedCharacterList();
            });
        }
    }
}

function resolveInitialCharacterId(
    params?: { id?: string | number; characterId?: string | number; url?: string } | string | number
): string | undefined {
    const siteIdPattern = /tga-[a-z0-9]{8,20}/i;
    if (typeof params === "string" || typeof params === "number") {
        if (params.toString().toLowerCase() === "darvell") return "138310322";
        return params.toString();
    }
    if (params?.id) {
        if (params.id.toString().toLowerCase() === "darvell") return "138310322";
        return params.id.toString();
    }
    if (params?.characterId) {
        if (params.characterId.toString().toLowerCase() === "darvell") return "138310322";
        return params.characterId.toString();
    }
    if (params?.url) {
        const siteMatch = params.url.match(siteIdPattern);
        if (siteMatch) return siteMatch[0].toLowerCase();
        const m = params.url.match(/\d{6,}/);
        if (m) return m[0];
    }

    // Check search params
    if (typeof window !== "undefined" && window.location?.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const qId = urlParams.get("id") || urlParams.get("characterId");
        if (qId) {
            const siteMatch = qId.match(siteIdPattern);
            if (siteMatch) return siteMatch[0].toLowerCase();
            if (qId.toLowerCase() === "darvell") return "138310322";
            return qId;
        }
    }

    // Check pathname (e.g. /character/138310322 or /character-sheet/138310322 or /darvell)
    if (typeof window !== "undefined" && window.location?.pathname) {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        if (last && siteIdPattern.test(last)) {
            return last.toLowerCase();
        }
        if (last && /^\d{6,}$/.test(last)) {
            return last;
        }
        if (parts.some(p => p.toLowerCase() === "darvell")) {
            return "138310322";
        }
    }

    return undefined;
}
