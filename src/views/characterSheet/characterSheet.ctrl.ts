import el from "@elements";
import { getData, postData, putData } from "@services/request";
import { parseDndBeyondCharacter } from "./characterAdapter";
import { CharacterData, SpellDefinition } from "./characterData";
import { renderSheetContent } from "./characterSheet.template";

type SavedCharacterSummary = {
    id: number;
    siteCharacterId?: string;
    source?: "site" | "dndbeyond";
    name: string;
    externalCharacterId?: string;
    level?: number;
    subtitle?: string;
    avatarUrl?: string;
    updatedAt?: string;
};

export default function characterSheet(initialParams?: { id?: string | number; characterId?: string | number; url?: string } | string | number) {
    const baseEl = el.getElement<HTMLElement>("el-character-sheet");
    if (!baseEl) return;
    const sheet: HTMLElement = baseEl;

    // Resolve initial ID from argument, query parameters, or path
    let activeCharacterId = resolveInitialCharacterId(initialParams);

    // Dynamic state
    let activeCharacter: CharacterData | null = null;
    let currentHp = 0;
    let maxHp = 0;
    let tempHp = 0;
    let currentFilter = "all";
    let searchQuery = "";
    let isEditMode = false;
    const spellMap = new Map<string, SpellDefinition>();
    let savedCharacters: SavedCharacterSummary[] = [];
    let statusHideTimer: ReturnType<typeof setTimeout> | null = null;
    let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
    let autoSaveInFlight = false;
    let autoSaveQueued = false;

    // Modal elements
    const modalBackdrop = sheet.querySelector<HTMLElement>("#spell-modal-container");
    const modalCloseBtn = sheet.querySelector<HTMLButtonElement>("#spell-modal-close-btn");
    const modalActionCloseBtn = sheet.querySelector<HTMLButtonElement>("#modal-close-action-btn");
    const modalSpellName = sheet.querySelector<HTMLElement>("#modal-spell-name");
    const modalSpellType = sheet.querySelector<HTMLElement>("#modal-spell-type");
    const modalBadges = sheet.querySelector<HTMLElement>("#modal-badges");
    const modalCastingTime = sheet.querySelector<HTMLElement>("#modal-casting-time");
    const modalRange = sheet.querySelector<HTMLElement>("#modal-range");
    const modalDuration = sheet.querySelector<HTMLElement>("#modal-duration");
    const modalComponents = sheet.querySelector<HTMLElement>("#modal-components");
    const modalSpellImageWrap = sheet.querySelector<HTMLElement>("#modal-spell-image-wrap");
    const modalSpellImage = sheet.querySelector<HTMLImageElement>("#modal-spell-image");
    const modalDescription = sheet.querySelector<HTMLElement>("#modal-spell-description");
    const modalSource = sheet.querySelector<HTMLElement>("#modal-spell-source");

    // Custom Spell Modal elements
    const customSpellModal = sheet.querySelector<HTMLElement>("#custom-spell-modal-container");
    const customSpellCloseBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-close-btn");
    const customSpellCancelBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-cancel-btn");
    const customSpellForm = sheet.querySelector<HTMLFormElement>("#custom-spell-form");
    const customSpellStatus = sheet.querySelector<HTMLElement>("#custom-spell-status");

    // Loader elements
    const loadForm = sheet.querySelector<HTMLFormElement>("#dndbeyond-load-form");
    const loaderBar = sheet.querySelector<HTMLElement>(".character-loader-bar");
    const loaderToggleBtn = sheet.querySelector<HTMLButtonElement>("#character-loader-toggle-btn");
    const idInput = sheet.querySelector<HTMLInputElement>("#dndbeyond-id-input");
    const loadBtn = sheet.querySelector<HTMLButtonElement>("#load-character-btn");
    const createBtn = sheet.querySelector<HTMLButtonElement>("#create-character-btn");
    const saveBtn = sheet.querySelector<HTMLButtonElement>("#save-character-btn");
    const editFieldsBtn = sheet.querySelector<HTMLButtonElement>("#edit-character-fields-btn");
    const prefer2024RulesToggle = sheet.querySelector<HTMLInputElement>("#prefer-2024-rules-toggle");
    const statusMsg = sheet.querySelector<HTMLElement>("#character-status-message");
    const dynamicContainer = sheet.querySelector<HTMLElement>("#character-sheet-dynamic-content");

    // Item/Weapon Modal elements
    const itemModalBackdrop = sheet.querySelector<HTMLElement>("#item-modal-container");
    const itemModalCloseBtn = sheet.querySelector<HTMLButtonElement>("#item-modal-close-btn");
    const itemModalCloseActionBtn = sheet.querySelector<HTMLButtonElement>("#modal-item-close-action-btn");
    const modalItemName = sheet.querySelector<HTMLElement>("#modal-item-name");
    const modalItemType = sheet.querySelector<HTMLElement>("#modal-item-type");
    const modalItemBadges = sheet.querySelector<HTMLElement>("#modal-item-badges");
    const modalItemDamage = sheet.querySelector<HTMLElement>("#modal-item-damage");
    const modalItemRange = sheet.querySelector<HTMLElement>("#modal-item-range");
    const modalItemProps = sheet.querySelector<HTMLElement>("#modal-item-properties");
    const modalItemWeight = sheet.querySelector<HTMLElement>("#modal-item-weight");
    const modalItemImageWrap = sheet.querySelector<HTMLElement>("#modal-item-image-wrap");
    const modalItemImage = sheet.querySelector<HTMLImageElement>("#modal-item-image");
    const modalItemDescription = sheet.querySelector<HTMLElement>("#modal-item-description");
    const modalItemSource = sheet.querySelector<HTMLElement>("#modal-item-source");

    // Action modal elements
    const actionModalBackdrop = sheet.querySelector<HTMLElement>("#action-modal-container");
    const actionModalCloseBtn = sheet.querySelector<HTMLButtonElement>("#action-modal-close-btn");
    const actionModalCloseActionBtn = sheet.querySelector<HTMLButtonElement>("#modal-action-close-action-btn");
    const modalActionName = sheet.querySelector<HTMLElement>("#modal-action-name");
    const modalActionType = sheet.querySelector<HTMLElement>("#modal-action-type");
    const modalActionRange = sheet.querySelector<HTMLElement>("#modal-action-range");
    const modalActionHitDc = sheet.querySelector<HTMLElement>("#modal-action-hit-dc");
    const modalActionDamage = sheet.querySelector<HTMLElement>("#modal-action-damage");
    const modalActionNotes = sheet.querySelector<HTMLElement>("#modal-action-notes");

    const rulesPreferenceStorageKey = "character-sheet-prefer-2024-rules";
    const prefer2024Rules = {
        value: true
    };

    function setLoaderCollapsed(collapsed: boolean) {
        if (!loaderBar || !loaderToggleBtn) return;
        loaderBar.classList.toggle("is-collapsed", collapsed);
        sheet.classList.toggle("loader-collapsed", collapsed);
        loaderToggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        loaderToggleBtn.title = collapsed ? "Expand loader" : "Collapse loader";
    }

    function showStatus(message: string, isError = false) {
        if (!statusMsg) return;
        if (statusHideTimer) {
            clearTimeout(statusHideTimer);
            statusHideTimer = null;
        }
        statusMsg.textContent = message;
        statusMsg.className = `status-msg ${isError ? 'error' : 'success'}`;
        statusHideTimer = setTimeout(() => {
            if (!statusMsg) return;
            statusMsg.className = "status-msg hidden";
        }, 7000);
    }

    function showCustomSpellStatus(message: string, isError = false) {
        if (!customSpellStatus) return;
        customSpellStatus.textContent = message;
        customSpellStatus.className = `status-msg ${isError ? 'error' : 'success'}`;
        customSpellStatus.classList.remove("hidden");
    }

    function setCharacterActionsVisibility() {
        const hasCharacter = !!activeCharacter;
        const canSave = hasCharacter && el.isAuth;

        if (editFieldsBtn) {
            editFieldsBtn.classList.toggle("hidden", !hasCharacter);
            editFieldsBtn.innerHTML = isEditMode
                ? '<i class="fa-solid fa-check"></i> Done Editing'
                : '<i class="fa-solid fa-pen"></i> Edit Fields';
        }
        if (saveBtn) {
            saveBtn.classList.toggle("hidden", !hasCharacter);
            saveBtn.disabled = !canSave;
            saveBtn.title = canSave
                ? "Save this character to your account"
                : "Log in to save characters";
        }
        if (createBtn) {
            createBtn.classList.toggle("hidden", !el.isAuth);
            createBtn.disabled = !el.isAuth;
        }
    }

    function renderSavedCharacterList() {
        if (!dynamicContainer) return;
        if (!el.isAuth) {
            dynamicContainer.innerHTML = "";
            return;
        }

        if (!savedCharacters.length) {
            dynamicContainer.innerHTML = `
                <section class="saved-characters-panel">
                    <h3><i class="fa-solid fa-book-bookmark"></i> Your Saved Characters</h3>
                    <p class="saved-characters-empty">You don't have any saved characters yet. Create a New Character, or load by D&D Beyond ID and save it here.</p>
                </section>
            `;
            return;
        }

        dynamicContainer.innerHTML = `
            <section class="saved-characters-panel">
                <h3><i class="fa-solid fa-book-bookmark"></i> Your Saved Characters</h3>
                <div class="saved-characters-grid">
                    ${savedCharacters.map((character) => {
            const subtitle = character.subtitle || (character.level ? `Level ${character.level}` : "Saved character");
            const updatedText = character.updatedAt
                ? new Date(character.updatedAt).toLocaleString()
                : "Recently updated";
            return `
                            <button
                                type="button"
                                class="saved-character-card"
                                data-saved-character-id="${character.id}"
                                data-site-character-id="${character.siteCharacterId || ""}"
                                title="Load ${character.name}"
                            >
                                ${character.avatarUrl ? `<img src="${character.avatarUrl}" alt="${character.name}" class="saved-character-avatar" />` : '<div class="saved-character-avatar placeholder"><i class="fa-solid fa-user"></i></div>'}
                                <div class="saved-character-card-body">
                                    <strong>${character.name}</strong>
                                    <span>${subtitle}</span>
                                    ${character.siteCharacterId ? `<small>ID: ${character.siteCharacterId}</small>` : ''}
                                    <small>Updated: ${updatedText}</small>
                                </div>
                            </button>
                        `;
        }).join("")}
                </div>
            </section>
        `;

        dynamicContainer.querySelectorAll<HTMLButtonElement>(".saved-character-card").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.getAttribute("data-saved-character-id"));
                if (!Number.isNaN(id)) {
                    void loadSavedCharacter(id);
                }
            });
        });
    }

    function applyPersistedEquipStates(states: Array<{ scope: "item" | "weapon" | "weapon-mastery"; itemName: string; equipped: boolean }>) {
        if (!states?.length || !activeCharacter) return;

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
        });

        (activeCharacter.weapons || []).forEach(weapon => {
            const key = `weapon:${weapon.name.toLowerCase()}`;
            if (stateMap.has(key)) {
                weapon.equipped = !!stateMap.get(key);
            }

            if (weapon.mastery?.name) {
                const masteryKey = `weapon-mastery:${weapon.name.toLowerCase()}::${weapon.mastery.name.toLowerCase()}`;
                if (stateMap.has(masteryKey)) {
                    weapon.mastery.unlocked = !!stateMap.get(masteryKey);
                }
            }
        });
    }

    async function persistEquipState(scope: "item" | "weapon" | "weapon-mastery", encodedName: string, rawDefinitionId: string | null, equipped: boolean) {
        const characterId = String(activeCharacter?.id || activeCharacterId || "").trim();
        if (!characterId) return;

        const itemName = decodeURIComponent(encodedName).trim();
        const definitionId = rawDefinitionId && !Number.isNaN(Number(rawDefinitionId))
            ? Number(rawDefinitionId)
            : undefined;

        try {
            await putData('/set-character-equip-state', {
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

    async function loadSavedCharacter(savedCharacterId: number) {
        return loadSavedCharacterRequest(`id=${savedCharacterId}`);
    }

    async function loadSavedCharacterBySiteId(siteCharacterId: string) {
        return loadSavedCharacterRequest(`siteCharacterId=${encodeURIComponent(siteCharacterId)}`);
    }

    async function loadSavedCharacterRequest(query: string) {
        showStatus("Loading saved character...");
        try {
            const response = await getData<{ character?: CharacterData; savedCharacter?: { externalCharacterId?: string; siteCharacterId?: string; source?: "site" | "dndbeyond"; id?: number } }>(`/get-saved-character?${query}`);
            if (!response?.character) {
                throw new Error("Missing saved character payload.");
            }

            activeCharacter = response.character;
            isEditMode = false;
            activeCharacter.savedCharacterId = response.savedCharacter?.id || activeCharacter.savedCharacterId;
            activeCharacter.siteCharacterId = response.savedCharacter?.siteCharacterId || activeCharacter.siteCharacterId;
            activeCharacter.source = response.savedCharacter?.source || activeCharacter.source || "site";
            activeCharacterId = response.savedCharacter?.siteCharacterId || response.savedCharacter?.externalCharacterId || String(activeCharacter.id || "");
            currentHp = activeCharacter.vitals.currentHp;
            maxHp = activeCharacter.vitals.maxHp;
            tempHp = Number(activeCharacter.vitals.tempHp) || 0;

            if (idInput && activeCharacterId) {
                idInput.value = activeCharacterId;
            }
            renderActiveCharacterView();
            showStatus(`Loaded saved character \"${activeCharacter.name}\".`);
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
                externalCharacterId: response.savedCharacter.externalCharacterId
            };
        } catch {
            return undefined;
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
                { name: "Strength", abbr: "STR", score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: "Dexterity", abbr: "DEX", score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: "Constitution", abbr: "CON", score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: "Intelligence", abbr: "INT", score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: "Wisdom", abbr: "WIS", score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: "Charisma", abbr: "CHA", score: 10, modifier: 0, save: 0, proficientSave: false }
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
        if (!el.isAuth) {
            showStatus("You must be logged in to create a new character.", true);
            return;
        }
        activeCharacter = createEmptySiteCharacter();
        activeCharacterId = "";
        currentHp = activeCharacter.vitals.currentHp;
        maxHp = activeCharacter.vitals.maxHp;
        tempHp = Number(activeCharacter.vitals.tempHp) || 0;
        isEditMode = true;
        if (idInput) idInput.value = "";
        renderActiveCharacterView();
        showStatus("Started a new site character. Edit fields and click Save Character.");
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
            const response = await putData<{
                savedCharacter?: { id: number; name: string; siteCharacterId?: string; source?: "site" | "dndbeyond"; externalCharacterId?: string };
                character?: CharacterData;
            }>("/save-character", {
                savedId: activeCharacter.savedCharacterId,
                siteCharacterId: activeCharacter.siteCharacterId,
                source: activeCharacter.source || (activeCharacterId && /^\d+$/.test(activeCharacterId) ? "dndbeyond" : "site"),
                externalCharacterId: (activeCharacter.source === "dndbeyond" || /^\d+$/.test(String(activeCharacterId || ""))) ? (activeCharacterId || activeCharacter.id) : undefined,
                name: activeCharacter.name,
                character: activeCharacter
            });

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
            if (!silent) showStatus(`Saved \"${activeCharacter.name}\" to your account.`);
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
            setCharacterActionsVisibility();
        }
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

    // Modal controls
    async function openSpellModal(spellName: string, spellId?: number | string) {
        const decodedName = decodeURIComponent(spellName).trim();
        const localSpell = spellMap.get(decodedName.toLowerCase());
        if (!modalBackdrop) return;

        // Use local fallback initially for instant feedback
        const displayName = localSpell ? localSpell.name : decodedName;
        const displaySchool = localSpell?.school || "Universal";
        const displayLvl = localSpell ? (localSpell.level === 0 ? "Cantrip" : `Level ${localSpell.level}`) : "Spell";

        if (modalSpellName) modalSpellName.textContent = displayName;
        if (modalSpellType) modalSpellType.textContent = `${displayLvl} • ${displaySchool}`;

        if (modalBadges) {
            let badgesHtml = `<span class="modal-badge school-badge">${displaySchool}</span>`;
            if (localSpell?.source) badgesHtml += `<span class="modal-badge source-badge">${localSpell.source}</span>`;
            if (localSpell?.concentration) {
                badgesHtml += `<span class="modal-badge conc-badge"><i class="fa-solid fa-brain"></i> Concentration</span>`;
            }
            if (localSpell?.ritual) {
                badgesHtml += `<span class="modal-badge ritual-badge"><i class="fa-solid fa-book"></i> Ritual</span>`;
            }
            modalBadges.innerHTML = badgesHtml;
        }

        if (modalCastingTime) modalCastingTime.textContent = localSpell?.castingTime || "1 Action";
        if (modalRange) modalRange.textContent = localSpell?.range || "Self / Touch / Ranged";
        if (modalDuration) modalDuration.textContent = localSpell?.duration || "Instantaneous";
        if (modalComponents) modalComponents.textContent = localSpell?.components || "V, S";

        // Display image if available
        const initialSpellImg = localSpell?.imageUrl;
        if (modalSpellImage && modalSpellImageWrap) {
            if (initialSpellImg) {
                modalSpellImage.src = initialSpellImg;
                modalSpellImage.alt = displayName;
                modalSpellImageWrap.classList.remove("hidden");
            } else {
                modalSpellImage.src = "";
                modalSpellImageWrap.classList.add("hidden");
            }
        }

        if (modalSource) modalSource.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading independent spell info...`;
        if (modalDescription) modalDescription.innerHTML = localSpell ? localSpell.description : "<p><em>Loading spell details...</em></p>";

        modalBackdrop.classList.remove("hidden");
        modalBackdrop.classList.add("visible");
        modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        modalCloseBtn?.focus();

        // Independent lookup cascade: Database -> D&D Beyond -> Open5e
        try {
            const spellQuery = new URLSearchParams();
            spellQuery.set("name", decodedName);
            if (spellId !== undefined && spellId !== null && String(spellId).trim() !== "") {
                spellQuery.set("id", String(spellId));
            }
            spellQuery.set("preferRules2024", prefer2024Rules.value ? "1" : "0");

            const queryParam = spellQuery.toString();
            const independentResponse = await getData<any>(`/get-spell?${queryParam}`);
            const independentSpell = independentResponse?.spell || independentResponse;
            const spellSourceTier = independentResponse?.sourceTier || independentSpell?.sourceTier || "Database";

            if (independentSpell && independentSpell.name) {
                if (modalSpellName) modalSpellName.textContent = independentSpell.name;
                const levelStr = independentSpell.level === 0 ? "Cantrip" : `Level ${independentSpell.level}`;
                if (modalSpellType) modalSpellType.textContent = `${levelStr} • ${independentSpell.school || displaySchool}`;

                if (modalBadges) {
                    let badges = `<span class="modal-badge school-badge">${independentSpell.school || displaySchool}</span>`;
                    badges += `<span class="modal-badge tier-badge tier-${String(spellSourceTier).toLowerCase().replace(/[^a-z0-9]/g, '-')}"><i class="fa-solid fa-database"></i> Source: ${spellSourceTier}</span>`;
                    if (independentSpell.concentration) {
                        badges += `<span class="modal-badge conc-badge"><i class="fa-solid fa-brain"></i> Concentration</span>`;
                    }
                    if (independentSpell.ritual) {
                        badges += `<span class="modal-badge ritual-badge"><i class="fa-solid fa-book"></i> Ritual</span>`;
                    }
                    modalBadges.innerHTML = badges;
                }

                if (modalCastingTime) modalCastingTime.textContent = independentSpell.castingTime || localSpell?.castingTime || "1 Action";
                if (modalRange) modalRange.textContent = independentSpell.range || localSpell?.range || "60 ft.";
                if (modalDuration) modalDuration.textContent = independentSpell.duration || localSpell?.duration || "Instantaneous";
                if (modalComponents) modalComponents.textContent = independentSpell.components || localSpell?.components || "V, S";
                if (modalDescription && independentSpell.description) modalDescription.innerHTML = independentSpell.description;

                const finalImg = independentSpell.imageUrl || initialSpellImg;
                if (modalSpellImage && modalSpellImageWrap) {
                    if (finalImg) {
                        modalSpellImage.src = finalImg;
                        modalSpellImage.alt = independentSpell.name;
                        modalSpellImageWrap.classList.remove("hidden");
                    } else {
                        modalSpellImage.src = "";
                        modalSpellImageWrap.classList.add("hidden");
                    }
                }

                if (modalSource) {
                    modalSource.innerHTML = `<strong>Source Tier:</strong> ${spellSourceTier || 'Local Database'} • <em>${independentSpell.source || 'SRD / Custom'}</em>`;
                }

                // Also update our in-memory map
                if (localSpell) {
                    localSpell.description = independentSpell.description;
                    localSpell.castingTime = independentSpell.castingTime || localSpell.castingTime;
                    localSpell.range = independentSpell.range || localSpell.range;
                    localSpell.duration = independentSpell.duration || localSpell.duration;
                    localSpell.components = independentSpell.components || localSpell.components;
                    if (finalImg) localSpell.imageUrl = finalImg;
                }
            }
        } catch (err) {
            console.warn("Could not fetch independent spell payload, kept initial payload:", err);
            if (modalSource) modalSource.textContent = `Source: Initial Character Payload (${localSpell?.source || 'Character'})`;
        }
    }

    function closeSpellModal() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove("visible");
        modalBackdrop.classList.add("hidden");
        modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function openCustomSpellModal() {
        if (!customSpellModal) return;
        if (customSpellStatus) {
            customSpellStatus.className = "status-msg hidden";
            customSpellStatus.textContent = "";
        }
        customSpellModal.classList.remove("hidden");
        customSpellModal.classList.add("visible");
        customSpellModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        sheet.querySelector<HTMLInputElement>("#custom-spell-name")?.focus();
    }

    function closeCustomSpellModal() {
        if (!customSpellModal) return;
        customSpellModal.classList.remove("visible");
        customSpellModal.classList.add("hidden");
        customSpellModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function parsePathSegments(path: string): Array<string | number> {
        const segments: Array<string | number> = [];
        const matcher = /([^.[\]]+)|\[(\d+)\]/g;
        let match: RegExpExecArray | null;
        while ((match = matcher.exec(path)) !== null) {
            if (match[1]) {
                segments.push(match[1]);
            } else if (match[2]) {
                segments.push(Number(match[2]));
            }
        }
        return segments;
    }

    function setValueByPath(target: Record<string, unknown>, path: string, value: unknown) {
        const segments = parsePathSegments(path);
        if (!segments.length) return;

        let cursor: any = target;
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            if (cursor == null) return;
            cursor = cursor[segment as any];
        }
        const lastSegment = segments[segments.length - 1];
        if (cursor != null) {
            cursor[lastSegment as any] = value;
        }
    }

    function getValueByPath(source: Record<string, unknown>, path: string): unknown {
        const segments = parsePathSegments(path);
        let cursor: unknown = source;
        for (const segment of segments) {
            if (cursor === null || cursor === undefined) return undefined;
            cursor = (cursor as any)[segment as any];
        }
        return cursor;
    }

    function createInlineInput(path: string, value: unknown, numeric = false, textAlign: string = "left"): HTMLInputElement {
        const input = document.createElement("input");
        input.className = "card-inline-editor";
        input.type = numeric ? "number" : "text";
        input.value = value === null || value === undefined ? "" : String(value);
        input.style.textAlign = textAlign;
        input.addEventListener("input", () => {
            if (!activeCharacter) return;
            const nextValue = numeric ? Number(input.value || 0) : input.value;
            setValueByPath(activeCharacter as unknown as Record<string, unknown>, path, nextValue);
            if (path === "vitals.currentHp") {
                currentHp = Number(nextValue) || 0;
            }
            if (path === "vitals.maxHp") {
                maxHp = Number(nextValue) || 0;
            }
            if (path === "vitals.tempHp") {
                tempHp = Math.max(0, Number(nextValue) || 0);
            }
        });
        return input;
    }

    function swapElementWithInput(element: Element | null, path: string, numeric = false) {
        if (!activeCharacter || !element) return;
        const value = getValueByPath(activeCharacter as unknown as Record<string, unknown>, path);
        const textAlign = window.getComputedStyle(element as HTMLElement).textAlign || "left";
        const input = createInlineInput(path, value, numeric, textAlign);
        (element as HTMLElement).innerHTML = "";
        (element as HTMLElement).appendChild(input);
    }

    function swapTextWithInputKeepingIcon(element: Element | null, path: string, numeric = false) {
        if (!activeCharacter || !element) return;
        const htmlEl = element as HTMLElement;
        const icon = htmlEl.querySelector("i")?.outerHTML || "";
        htmlEl.innerHTML = `${icon} `;
        const value = getValueByPath(activeCharacter as unknown as Record<string, unknown>, path);
        const textAlign = window.getComputedStyle(htmlEl).textAlign || "left";
        const input = createInlineInput(path, value, numeric, textAlign);
        input.classList.add("inline-after-icon");
        htmlEl.appendChild(input);
    }

    function enableCardLayoutEditors() {
        if (!activeCharacter || !dynamicContainer) return;

        swapElementWithInput(dynamicContainer.querySelector(".character-name"), "name");
        swapTextWithInputKeepingIcon(dynamicContainer.querySelectorAll(".character-tags .tag")[0], "race");
        swapTextWithInputKeepingIcon(dynamicContainer.querySelectorAll(".character-tags .tag")[1], "background");
        swapTextWithInputKeepingIcon(dynamicContainer.querySelectorAll(".character-tags .tag")[2], "alignment");

        swapElementWithInput(dynamicContainer.querySelector(".vital-ac .vital-val"), "vitals.armorClass", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-init .vital-val"), "vitals.initiative", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-speed .vital-val"), "vitals.speed");
        swapElementWithInput(dynamicContainer.querySelector(".vital-dc .vital-val"), "vitals.spellSaveDc", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-attack .vital-val"), "vitals.spellAttackBonus", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-prof .vital-val"), "vitals.proficiencyBonus", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-passive-perception .vital-val"), "vitals.passivePerception", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-passive-investigation .vital-val"), "vitals.passiveInvestigation", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-passive-insight .vital-val"), "vitals.passiveInsight", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-blindsight-val"), "vitals.blindsight");
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-darkvision-val"), "vitals.darkvision");
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-tremorsense-val"), "vitals.tremorsense");
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-truesight-val"), "vitals.truesight");

        dynamicContainer.querySelectorAll(".ability-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".ability-header"), `abilities[${index}].abbr`);
            swapElementWithInput(card.querySelector(".ability-mod"), `abilities[${index}].modifier`, true);
            swapElementWithInput(card.querySelector(".ability-score"), `abilities[${index}].score`, true);
            swapElementWithInput(card.querySelector(".save-val"), `abilities[${index}].save`, true);
            const noteEl = card.querySelector(".ability-note");
            if (noteEl) {
                swapElementWithInput(noteEl, `abilities[${index}].notes`);
            }
        });

        dynamicContainer.querySelectorAll(".skill-row").forEach((row, index) => {
            swapElementWithInput(row.querySelector(".skill-name"), `skills[${index}].name`);
            swapElementWithInput(row.querySelector(".skill-stat"), `skills[${index}].stat`);
            swapElementWithInput(row.querySelector(".skill-bonus"), `skills[${index}].bonus`, true);
        });

        dynamicContainer.querySelectorAll(".action-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".action-name"), `actions[${index}].name`);
            swapElementWithInput(card.querySelector(".action-badge"), `actions[${index}].type`);
            const stats = card.querySelectorAll(".action-stat strong");
            swapElementWithInput(stats[0], `actions[${index}].rangeOrReach`);
            swapElementWithInput(stats[1], `actions[${index}].hitOrDc`);
            swapElementWithInput(stats[2], `actions[${index}].damageOrEffect`);
            swapElementWithInput(card.querySelector(".action-notes"), `actions[${index}].notes`);
        });

        dynamicContainer.querySelectorAll(".feature-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".feature-name"), `features[${index}].name`);
            swapElementWithInput(card.querySelector(".feature-badge"), `features[${index}].source`);
            swapElementWithInput(card.querySelector(".feature-desc"), `features[${index}].description`);
        });

        dynamicContainer.querySelectorAll(".spell-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".spell-title"), `spells[${index}].name`);
            swapElementWithInput(card.querySelector(".spell-school-level"), `spells[${index}].school`);
            const metaValues = card.querySelectorAll(".meta-value");
            swapElementWithInput(metaValues[0], `spells[${index}].castingTime`);
            swapElementWithInput(metaValues[1], `spells[${index}].range`);
            swapElementWithInput(metaValues[2], `spells[${index}].duration`);
        });

        dynamicContainer.querySelectorAll(".equipment-row").forEach((row, index) => {
            swapTextWithInputKeepingIcon(row.querySelector(".item-name"), `equipment[${index}].name`);
            swapElementWithInput(row.querySelector(".item-type"), `equipment[${index}].type`);
            const notes = row.querySelector(".item-notes");
            if (notes) swapElementWithInput(notes, `equipment[${index}].notes`);
        });

        dynamicContainer.querySelectorAll(".weapon-card").forEach((card, index) => {
            swapTextWithInputKeepingIcon(card.querySelector(".weapon-name"), `weapons[${index}].name`);
            swapElementWithInput(card.querySelector(".weapon-category"), `weapons[${index}].category`);
            const stats = card.querySelectorAll(".wstat-val");
            swapElementWithInput(stats[0], `weapons[${index}].attackBonus`);
            swapElementWithInput(stats[1], `weapons[${index}].damage`);
            swapElementWithInput(stats[2], `weapons[${index}].range`);
            const notes = card.querySelector(".weapon-notes");
            if (notes) swapElementWithInput(notes, `weapons[${index}].notes`);
        });

        const firstSenseList = dynamicContainer.querySelectorAll(".sense-card ul li");
        swapElementWithInput(firstSenseList[0]?.querySelector("strong")?.parentElement || null, "vitals.passivePerception", true);
        swapElementWithInput(firstSenseList[1]?.querySelector("strong")?.parentElement || null, "vitals.passiveInvestigation", true);
        swapElementWithInput(firstSenseList[2]?.querySelector("strong")?.parentElement || null, "vitals.passiveInsight", true);
        swapElementWithInput(firstSenseList[3]?.querySelector("strong")?.parentElement || null, "vitals.darkvision");
    }

    function renderActiveCharacterView() {
        if (!activeCharacter || !dynamicContainer) return;
        dynamicContainer.innerHTML = renderSheetContent(activeCharacter);
        sheet.classList.toggle("is-edit-mode", isEditMode);
        if (isEditMode) enableCardLayoutEditors();
        else bindCharacterEvents();
        setCharacterActionsVisibility();
    }

    function toggleEditMode() {
        if (!activeCharacter) return;
        isEditMode = !isEditMode;
        renderActiveCharacterView();
        if (!isEditMode) {
            currentHp = activeCharacter.vitals.currentHp;
            maxHp = activeCharacter.vitals.maxHp;
            tempHp = Number(activeCharacter.vitals.tempHp) || 0;
            showStatus(`Applied edits for \"${activeCharacter.name}\". Save to persist.`);
        }
    }

    // Item/Weapon Modal Controls
    async function openItemModal(itemName: string, itemId?: number | string, itemType?: string) {
        if (!activeCharacter) return;
        const decodedName = decodeURIComponent(itemName).trim();
        if (!itemModalBackdrop) return;

        // Find in active character weapons or equipment
        const localWeapon = activeCharacter.weapons?.find(w => w.name.toLowerCase() === decodedName.toLowerCase());
        const localEquipment = activeCharacter.equipment.find(e => e.name.toLowerCase() === decodedName.toLowerCase());

        const displayName = localWeapon?.name || localEquipment?.name || decodedName;
        const displayType = localWeapon ? localWeapon.category : (localEquipment?.type || itemType || "Equipment");
        const displayRarity = localWeapon?.rarity || localEquipment?.rarity || "Common";
        const isMagic = !!(localWeapon?.isMagic || localEquipment?.isMagic);

        if (modalItemName) modalItemName.textContent = displayName;
        if (modalItemType) modalItemType.textContent = displayType;

        if (modalItemBadges) {
            let badges = `<span class="modal-badge school-badge">${displayType}</span>`;
            if (displayRarity && displayRarity !== "Common") {
                badges += `<span class="modal-badge rarity-badge">${displayRarity}</span>`;
            }
            if (isMagic) {
                badges += `<span class="modal-badge magic-badge"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>`;
            }
            if (localWeapon?.mastery) {
                badges += `<span class="modal-badge mastery-badge ${localWeapon.mastery.unlocked ? 'unlocked' : ''}"><i class="fa-solid fa-burst"></i> Mastery: ${localWeapon.mastery.name}</span>`;
            }
            modalItemBadges.innerHTML = badges;
        }

        // Meta statistics
        if (modalItemDamage) {
            modalItemDamage.textContent = localWeapon?.damage || "—";
        }
        if (modalItemRange) {
            modalItemRange.textContent = localWeapon?.range || "—";
        }
        if (modalItemProps) {
            modalItemProps.textContent = localWeapon?.properties?.length ? localWeapon.properties.join(", ") : "—";
        }
        if (modalItemWeight) {
            modalItemWeight.textContent = localEquipment?.notes ? localEquipment.notes : "—";
        }

        // Display image if available initially
        const initialItemImg = localWeapon?.imageUrl || localEquipment?.imageUrl;
        if (modalItemImage && modalItemImageWrap) {
            if (initialItemImg) {
                modalItemImage.src = initialItemImg;
                modalItemImage.alt = displayName;
                modalItemImageWrap.classList.remove("hidden");
            } else {
                modalItemImage.src = "";
                modalItemImageWrap.classList.add("hidden");
            }
        }

        const localDesc = localWeapon?.description || localEquipment?.description || localWeapon?.notes || localEquipment?.notes;
        if (modalItemDescription) {
            modalItemDescription.innerHTML = localDesc
                ? (localDesc.startsWith("<") ? localDesc : `<p>${localDesc}</p>`)
                : "<p><em>Loading item details...</em></p>";
        }
        if (modalItemSource) {
            modalItemSource.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading independent item info...`;
        }

        itemModalBackdrop.classList.remove("hidden");
        itemModalBackdrop.classList.add("visible");
        itemModalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        itemModalCloseBtn?.focus();

        // Independent tiered lookup cascade: Database -> D&D Beyond -> Open5e / 5e API
        try {
            const queryParams = new URLSearchParams();
            queryParams.set("name", decodedName);
            if (itemId) queryParams.set("id", String(itemId));
            if (itemType) queryParams.set("type", itemType);
            queryParams.set("preferRules2024", prefer2024Rules.value ? "1" : "0");

            const independentRes = await getData<any>(`/get-item?${queryParams.toString()}`);
            const itemObj = independentRes?.item || independentRes;

            if (itemObj && itemObj.name) {
                if (modalItemName) modalItemName.textContent = itemObj.name;
                if (modalItemType) modalItemType.textContent = itemObj.category || itemObj.filterType || displayType;

                if (modalItemBadges) {
                    let badges = `<span class="modal-badge school-badge">${itemObj.category || itemObj.filterType || displayType}</span>`;
                    const sourceTier = independentRes.sourceTier || (itemObj.isCustom ? 'Custom Database' : 'Database');
                    badges += `<span class="modal-badge tier-badge tier-${sourceTier.toLowerCase().replace(/[^a-z0-9]/g, '-')}"><i class="fa-solid fa-database"></i> Source: ${sourceTier}</span>`;
                    if (itemObj.rarity && itemObj.rarity !== 'Common') {
                        badges += `<span class="modal-badge rarity-badge">${itemObj.rarity}</span>`;
                    }
                    if (itemObj.isMagic) {
                        badges += `<span class="modal-badge magic-badge"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>`;
                    }
                    if (itemObj.mastery) {
                        badges += `<span class="modal-badge mastery-badge unlocked"><i class="fa-solid fa-burst"></i> Mastery: ${itemObj.mastery}</span>`;
                    }
                    modalItemBadges.innerHTML = badges;
                }

                if (modalItemDamage && itemObj.damage) {
                    modalItemDamage.textContent = itemObj.damage;
                }
                if (modalItemRange && itemObj.range) {
                    modalItemRange.textContent = itemObj.range;
                }
                if (modalItemProps && itemObj.properties) {
                    modalItemProps.textContent = itemObj.properties;
                }
                if (modalItemWeight) {
                    const weightStr = itemObj.weight ? `${itemObj.weight} lb.` : '';
                    const costStr = itemObj.cost ? `${itemObj.cost} gp` : '';
                    modalItemWeight.textContent = [weightStr, costStr].filter(Boolean).join(" • ") || "—";
                }

                if (modalItemDescription && itemObj.description) {
                    modalItemDescription.innerHTML = itemObj.description.startsWith("<")
                        ? itemObj.description
                        : `<p>${itemObj.description}</p>`;
                }

                const finalItemImg = itemObj.imageUrl || initialItemImg;
                if (modalItemImage && modalItemImageWrap) {
                    if (finalItemImg) {
                        modalItemImage.src = finalItemImg;
                        modalItemImage.alt = itemObj.name;
                        modalItemImageWrap.classList.remove("hidden");
                    } else {
                        modalItemImage.src = "";
                        modalItemImageWrap.classList.add("hidden");
                    }
                }

                if (modalItemSource) {
                    modalItemSource.innerHTML = `<strong>Source Tier:</strong> ${independentRes.sourceTier || 'Local Database'} • <em>${itemObj.source || 'Standard / SRD'}</em>`;
                }

                if (localWeapon && finalItemImg) localWeapon.imageUrl = finalItemImg;
                if (localEquipment && finalItemImg) localEquipment.imageUrl = finalItemImg;
            }
        } catch (err) {
            console.warn("Could not fetch independent item payload, kept local data:", err);
            if (modalItemSource) {
                modalItemSource.textContent = `Source: Initial Character Payload (${localWeapon ? 'Weapon' : 'Inventory'})`;
            }
        }
    }

    function closeItemModal() {
        if (!itemModalBackdrop) return;
        itemModalBackdrop.classList.remove("visible");
        itemModalBackdrop.classList.add("hidden");
        itemModalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function openActionModal(actionIndex: number) {
        if (!activeCharacter || !actionModalBackdrop) return;
        const action = activeCharacter.actions?.[actionIndex];
        if (!action) return;

        const renderActionNotesHtml = (rawNotesInput: string): string => {
            const rawNotes = (rawNotesInput || "").trim();
            if (!rawNotes) return "<p>No additional details.</p>";

            const spellButtons: string[] = [];
            const tokenized = rawNotes.replace(/\[spells\]([\s\S]*?)\[\/spells\]/gi, (_match, spellNameRaw: string) => {
                const spellName = (spellNameRaw || "").trim();
                if (!spellName) return "";
                const encodedSpellName = encodeURIComponent(spellName);
                const escapedLabel = spellName
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&#39;");
                const buttonHtml = `<button type="button" class="action-spell-link inline-spell-link" data-spell-name="${encodedSpellName}" title="Click to view spell details"><i class="fa-solid fa-wand-magic-sparkles"></i> ${escapedLabel}</button>`;
                const token = `__SPELL_LINK_TOKEN_${spellButtons.length}__`;
                spellButtons.push(buttonHtml);
                return token;
            });

            const hasHtml = /<[a-z][\s\S]*>/i.test(tokenized);
            let html = hasHtml
                ? tokenized
                : `<p>${tokenized
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&#39;")
                    .replace(/\n/g, "<br />")}</p>`;

            spellButtons.forEach((buttonHtml, index) => {
                html = html.replaceAll(`__SPELL_LINK_TOKEN_${index}__`, buttonHtml);
            });

            return html;
        };

        if (modalActionName) modalActionName.textContent = action.name || "Action";
        if (modalActionType) modalActionType.textContent = action.type || "Action";
        if (modalActionRange) modalActionRange.textContent = action.rangeOrReach || "—";
        if (modalActionHitDc) modalActionHitDc.textContent = action.hitOrDc || "—";
        if (modalActionDamage) modalActionDamage.textContent = action.damageOrEffect || "—";
        if (modalActionNotes) {
            modalActionNotes.innerHTML = renderActionNotesHtml(action.notes || "");
            modalActionNotes.querySelectorAll<HTMLButtonElement>(".inline-spell-link[data-spell-name]").forEach(btn => {
                const spellName = btn.getAttribute("data-spell-name");
                if (!spellName) return;

                btn.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    closeActionModal();
                    openSpellModal(spellName);
                });

                btn.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        closeActionModal();
                        openSpellModal(spellName);
                    }
                });
            });
        }

        actionModalBackdrop.classList.remove("hidden");
        actionModalBackdrop.classList.add("visible");
        actionModalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        actionModalCloseBtn?.focus();
    }

    function closeActionModal() {
        if (!actionModalBackdrop) return;
        actionModalBackdrop.classList.remove("visible");
        actionModalBackdrop.classList.add("hidden");
        actionModalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    modalCloseBtn?.addEventListener("click", closeSpellModal);
    modalActionCloseBtn?.addEventListener("click", closeSpellModal);
    modalBackdrop?.addEventListener("click", (event) => {
        if (event.target === modalBackdrop) {
            closeSpellModal();
        }
    });

    itemModalCloseBtn?.addEventListener("click", closeItemModal);
    itemModalCloseActionBtn?.addEventListener("click", closeItemModal);
    itemModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === itemModalBackdrop) {
            closeItemModal();
        }
    });

    actionModalCloseBtn?.addEventListener("click", closeActionModal);
    actionModalCloseActionBtn?.addEventListener("click", closeActionModal);
    actionModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === actionModalBackdrop) {
            closeActionModal();
        }
    });

    customSpellCloseBtn?.addEventListener("click", closeCustomSpellModal);
    customSpellCancelBtn?.addEventListener("click", closeCustomSpellModal);
    customSpellModal?.addEventListener("click", (event) => {
        if (event.target === customSpellModal) {
            closeCustomSpellModal();
        }
    });

    const loaderStorageKey = "character-sheet-loader-collapsed";
    const initialLoaderCollapsed = typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(loaderStorageKey) === "true"
        : false;
    setLoaderCollapsed(initialLoaderCollapsed);

    const initialPrefer2024Rules = typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(rulesPreferenceStorageKey) !== "false"
        : true;
    prefer2024Rules.value = initialPrefer2024Rules;
    if (prefer2024RulesToggle) {
        prefer2024RulesToggle.checked = initialPrefer2024Rules;
    }

    loaderToggleBtn?.addEventListener("click", () => {
        const isCollapsed = loaderBar?.classList.contains("is-collapsed") ?? false;
        const next = !isCollapsed;
        setLoaderCollapsed(next);
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(loaderStorageKey, String(next));
        }
    });

    prefer2024RulesToggle?.addEventListener("change", () => {
        prefer2024Rules.value = !!prefer2024RulesToggle.checked;
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(rulesPreferenceStorageKey, prefer2024Rules.value ? "true" : "false");
        }
        showStatus(prefer2024Rules.value
            ? "Now preferring 2024-aligned sources for spell/item detail lookups."
            : "Using mixed source lookups (including SRD fallbacks) for spell/item details.");
    });

    editFieldsBtn?.addEventListener("click", () => {
        toggleEditMode();
    });
    createBtn?.addEventListener("click", beginNewSiteCharacter);
    saveBtn?.addEventListener("click", () => {
        void saveActiveCharacter();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalBackdrop && !modalBackdrop.classList.contains("hidden")) {
                closeSpellModal();
            }
            if (itemModalBackdrop && !itemModalBackdrop.classList.contains("hidden")) {
                closeItemModal();
            }
            if (customSpellModal && !customSpellModal.classList.contains("hidden")) {
                closeCustomSpellModal();
            }
            if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                closeActionModal();
            }
        }
    });

    // Binds dynamic content events whenever new character data is loaded
    function bindCharacterEvents() {
        if (!sheet || !activeCharacter) return;
        const currentCharacter = activeCharacter;
        const hasRenderedSheet = !!sheet.querySelector(".tab-btn");
        if (!hasRenderedSheet) return;

        // Rebuild spell map
        spellMap.clear();
        currentCharacter.spells.forEach(spell => {
            spellMap.set(spell.name.toLowerCase(), spell);
        });

        // Set document title
        try {
            el.title.textContent = `${currentCharacter.name} — Character Sheet | The Green Asterisk`;
        } catch { }

        // Tabs
        const tabButtons = sheet.querySelectorAll<HTMLButtonElement>(".tab-btn");
        const tabPanes = sheet.querySelectorAll<HTMLElement>(".tab-pane");

        tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetId = btn.getAttribute("data-tab-target");
                if (!targetId) return;

                tabButtons.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                tabPanes.forEach(p => {
                    p.classList.remove("active");
                });

                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");
                const targetPane = sheet.querySelector<HTMLElement>(`#${targetId}`);
                if (targetPane) {
                    targetPane.classList.add("active");
                }
            });
        });

        // Spell cards click
        const spellCards = sheet.querySelectorAll<HTMLElement>(".spell-card");
        spellCards.forEach(card => {
            const spellName = card.getAttribute("data-spell-name");
            const spellId = card.getAttribute("data-spell-id");
            if (!spellName) return;

            card.addEventListener("click", () => {
                openSpellModal(spellName, spellId || undefined);
            });
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openSpellModal(spellName, spellId || undefined);
                }
            });
        });

        // Open custom spell modal button
        const openCustomSpellBtn = sheet.querySelector<HTMLButtonElement>("#open-custom-spell-btn");
        openCustomSpellBtn?.addEventListener("click", () => {
            openCustomSpellModal();
        });

        // Weapon cards click
        const weaponCards = sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
        weaponCards.forEach(card => {
            const weaponName = card.getAttribute("data-weapon-name");
            const weaponId = card.getAttribute("data-weapon-id");
            const weaponType = card.getAttribute("data-weapon-type") || "Weapon";
            if (!weaponName) return;

            card.addEventListener("click", () => {
                openItemModal(weaponName, weaponId || undefined, weaponType);
            });
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openItemModal(weaponName, weaponId || undefined, weaponType);
                }
            });
        });

        // Equipment / Magic items click
        const itemRows = sheet.querySelectorAll<HTMLElement>(".clickable-item-card");
        itemRows.forEach(row => {
            const itemName = row.getAttribute("data-item-name");
            const itemId = row.getAttribute("data-item-id");
            const itemType = row.getAttribute("data-item-type");
            if (!itemName) return;

            row.addEventListener("click", () => {
                openItemModal(itemName, itemId || undefined, itemType || undefined);
            });
            row.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openItemModal(itemName, itemId || undefined, itemType || undefined);
                }
            });
        });

        // Equipment / Weapon equipped toggles
        const equipToggleButtons = sheet.querySelectorAll<HTMLButtonElement>(".equip-toggle-btn");
        equipToggleButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const scope = btn.getAttribute("data-equip-scope");
                if (scope === "weapon") {
                    const encodedWeaponName = btn.getAttribute("data-weapon-name") || "";
                    const rawWeaponId = btn.getAttribute("data-weapon-id");
                    if (!encodedWeaponName) return;
                    const weaponName = decodeURIComponent(encodedWeaponName).toLowerCase();
                    const nextState = btn.getAttribute("aria-pressed") !== "true";

                    (currentCharacter.weapons || []).forEach(w => {
                        if (w.name.toLowerCase() === weaponName) {
                            w.equipped = nextState;
                        }
                    });

                    const affectedWeaponCards = sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
                    affectedWeaponCards.forEach(card => {
                        const cardWeaponName = decodeURIComponent(card.getAttribute("data-weapon-name") || "").toLowerCase();
                        if (cardWeaponName !== weaponName) return;

                        card.classList.toggle("is-equipped", nextState);
                        const toggleBtn = card.querySelector<HTMLButtonElement>(".weapon-badge.equip-toggle-btn");
                        if (toggleBtn) {
                            toggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                            toggleBtn.classList.toggle("equipped", nextState);
                            toggleBtn.classList.toggle("unequipped", !nextState);
                            toggleBtn.innerHTML = `<i class="fa-solid ${nextState ? 'fa-check' : 'fa-minus'}"></i> ${nextState ? 'Equipped' : 'Unequipped'}`;
                        }
                    });

                    void persistEquipState("weapon", encodedWeaponName, rawWeaponId, nextState);
                } else if (scope === "item") {
                    const encodedItemName = btn.getAttribute("data-item-name") || "";
                    const rawItemId = btn.getAttribute("data-item-id");
                    if (!encodedItemName) return;
                    const itemName = decodeURIComponent(encodedItemName).toLowerCase();
                    const nextState = btn.getAttribute("aria-pressed") !== "true";

                    currentCharacter.equipment.forEach(item => {
                        if (item.name.toLowerCase() === itemName) {
                            item.equipped = nextState;
                        }
                    });

                    const affectedItemRows = sheet.querySelectorAll<HTMLElement>(".clickable-item-card");
                    affectedItemRows.forEach(row => {
                        const rowItemName = decodeURIComponent(row.getAttribute("data-item-name") || "").toLowerCase();
                        if (rowItemName !== itemName) return;

                        const toggleBtn = row.querySelector<HTMLButtonElement>(".item-badge.equip-toggle-btn");
                        if (toggleBtn) {
                            toggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                            toggleBtn.classList.toggle("equipped", nextState);
                            toggleBtn.classList.toggle("unequipped", !nextState);
                            toggleBtn.textContent = nextState ? "Equipped" : "Unequipped";
                        }
                    });

                    void persistEquipState("item", encodedItemName, rawItemId, nextState);
                } else if (scope === "weapon-mastery") {
                    const encodedWeaponName = btn.getAttribute("data-weapon-name") || "";
                    const encodedMasteryName = btn.getAttribute("data-mastery-name") || "";
                    const rawWeaponId = btn.getAttribute("data-weapon-id");
                    if (!encodedWeaponName || !encodedMasteryName) return;

                    const weaponName = decodeURIComponent(encodedWeaponName).toLowerCase();
                    const masteryName = decodeURIComponent(encodedMasteryName).toLowerCase();
                    const nextState = btn.getAttribute("aria-pressed") !== "true";

                    (currentCharacter.weapons || []).forEach(w => {
                        if (w.name.toLowerCase() === weaponName && w.mastery?.name?.toLowerCase() === masteryName) {
                            w.mastery.unlocked = nextState;
                        }
                    });

                    const affectedWeaponCards = sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
                    affectedWeaponCards.forEach(card => {
                        const cardWeaponName = decodeURIComponent(card.getAttribute("data-weapon-name") || "").toLowerCase();
                        if (cardWeaponName !== weaponName) return;

                        const masteryToggleBtn = card.querySelector<HTMLButtonElement>(`.weapon-mastery-badge.mastery-toggle-btn[data-mastery-name=\"${encodeURIComponent(decodeURIComponent(encodedMasteryName))}\"]`)
                            || card.querySelector<HTMLButtonElement>(".weapon-mastery-badge.mastery-toggle-btn");
                        if (masteryToggleBtn) {
                            masteryToggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                            masteryToggleBtn.classList.toggle("unlocked", nextState);
                            masteryToggleBtn.classList.toggle("locked", !nextState);
                            masteryToggleBtn.innerHTML = `<i class="fa-solid fa-burst"></i> Mastery: ${decodeURIComponent(encodedMasteryName)}${nextState ? ' (Active)' : ''}`;
                        }
                    });

                    const encodedPersistenceName = encodeURIComponent(`${decodeURIComponent(encodedWeaponName)}::${decodeURIComponent(encodedMasteryName)}`);
                    void persistEquipState("weapon-mastery", encodedPersistenceName, rawWeaponId, nextState);
                }
            });

            btn.addEventListener("keydown", (e) => {
                e.stopPropagation();
            });
        });

        // Action cards click for full details modal
        const actionCards = sheet.querySelectorAll<HTMLElement>(".clickable-action-card");
        actionCards.forEach(card => {
            const actionIndex = Number(card.getAttribute("data-action-index"));
            if (Number.isNaN(actionIndex)) return;

            card.addEventListener("click", () => {
                openActionModal(actionIndex);
            });
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openActionModal(actionIndex);
                }
            });
        });

        // Action spell links
        sheet.querySelectorAll<HTMLElement>(".action-spell-link[data-spell-name]").forEach(elBtn => {
            const spellName = elBtn.getAttribute("data-spell-name");
            if (spellName) {
                elBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openSpellModal(spellName);
                });
            }
        });

        // Spell filter & search
        const searchInput = sheet.querySelector<HTMLInputElement>("#spell-search");
        const searchClearBtn = sheet.querySelector<HTMLButtonElement>("#spell-search-clear");
        const filterChips = sheet.querySelectorAll<HTMLButtonElement>("#spell-filter-chips .filter-chip");
        const noSpellsNotice = sheet.querySelector<HTMLElement>("#no-spells-found");
        const spellLevelSections = sheet.querySelectorAll<HTMLElement>(".spells-level-section");

        function filterSpells() {
            let visibleCount = 0;
            const q = searchQuery.toLowerCase().trim();

            spellCards.forEach(card => {
                const rawName = card.getAttribute("data-spell-name");
                if (!rawName) return;
                const spell = spellMap.get(decodeURIComponent(rawName).toLowerCase());
                if (!spell) {
                    card.style.display = "none";
                    return;
                }

                // Level/type filter
                let matchesCategory = false;
                if (currentFilter === "all") {
                    matchesCategory = true;
                } else if (currentFilter === "cantrip") {
                    matchesCategory = spell.level === 0;
                } else if (currentFilter === "lvl-1") {
                    matchesCategory = spell.level === 1;
                } else if (currentFilter === "lvl-2") {
                    matchesCategory = spell.level === 2;
                } else if (currentFilter === "lvl-3") {
                    matchesCategory = spell.level === 3;
                } else if (currentFilter === "lvl-high") {
                    matchesCategory = spell.level >= 4;
                } else if (currentFilter === "conc") {
                    matchesCategory = !!spell.concentration;
                } else if (currentFilter === "ritual") {
                    matchesCategory = !!spell.ritual;
                }

                // Text search filter
                let matchesSearch = true;
                if (q) {
                    const haystack = `${spell.name} ${spell.school} ${spell.source} ${spell.description}`.toLowerCase();
                    matchesSearch = haystack.includes(q);
                }

                if (matchesCategory && matchesSearch) {
                    card.style.display = "";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            spellLevelSections.forEach(section => {
                const cardsInSection = section.querySelectorAll<HTMLElement>(".spell-card");
                const hasVisibleCards = Array.from(cardsInSection).some(c => c.style.display !== "none");
                section.style.display = hasVisibleCards ? "" : "none";
            });

            if (noSpellsNotice) {
                noSpellsNotice.style.display = visibleCount === 0 ? "flex" : "none";
            }
        }

        searchInput?.addEventListener("input", () => {
            searchQuery = searchInput.value;
            if (searchClearBtn) {
                searchClearBtn.style.display = searchQuery ? "block" : "none";
            }
            filterSpells();
        });

        searchClearBtn?.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
                searchQuery = "";
                searchInput.focus();
            }
            if (searchClearBtn) searchClearBtn.style.display = "none";
            filterSpells();
        });

        filterChips.forEach(chip => {
            chip.addEventListener("click", () => {
                filterChips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");
                currentFilter = chip.getAttribute("data-filter") || "all";
                filterSpells();
            });
        });

        // HP adjustments
        const hpDisplay = sheet.querySelector<HTMLInputElement>("#hp-display");
        const tempHpDisplay = sheet.querySelector<HTMLInputElement>("#temp-hp-display");
        const hpRatio = sheet.querySelector<HTMLElement>("#hp-ratio");
        const hpBarFill = sheet.querySelector<HTMLElement>("#hp-bar-fill");
        const inspirationToggle = sheet.querySelector<HTMLElement>("#inspiration-toggle");

        if (!currentCharacter.trackingState) {
            currentCharacter.trackingState = {};
        }
        if (!currentCharacter.trackingState.slotPips) {
            currentCharacter.trackingState.slotPips = {};
        }
        if (!currentCharacter.trackingState.resourcePips) {
            currentCharacter.trackingState.resourcePips = {};
        }

        const persistTrackerSnapshot = () => {
            if (!currentCharacter.trackingState) {
                currentCharacter.trackingState = {};
            }
            if (!currentCharacter.trackingState.slotPips) {
                currentCharacter.trackingState.slotPips = {};
            }
            if (!currentCharacter.trackingState.resourcePips) {
                currentCharacter.trackingState.resourcePips = {};
            }

            // Spell slots level 1-9
            for (let lvl = 1; lvl <= 9; lvl++) {
                const pips = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-${lvl} .pip`);
                if (pips.length) {
                    currentCharacter.trackingState.slotPips[`level${lvl}`] = Array.from(pips).map(p => p.classList.contains("active"));
                }
            }

            // Pact slots
            const pactPips = sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip");
            if (pactPips.length) {
                currentCharacter.trackingState.slotPips.pact = Array.from(pactPips).map(p => p.classList.contains("active"));
            }

            // Class resources
            sheet.querySelectorAll<HTMLElement>(".class-resource-tracker").forEach(tracker => {
                const resKey = tracker.getAttribute("data-resource-key");
                if (!resKey) return;
                const resourcePips = tracker.querySelectorAll<HTMLButtonElement>(".pip");
                if (!resourcePips.length) return;
                currentCharacter.trackingState!.resourcePips![resKey] = Array.from(resourcePips).map(p => p.classList.contains("active"));
            });

            currentCharacter.trackingState.heroicInspiration = inspirationToggle?.classList.contains("active") ?? currentCharacter.vitals.heroicInspiration;
            currentCharacter.vitals.heroicInspiration = !!currentCharacter.trackingState.heroicInspiration;
            currentCharacter.vitals.currentHp = currentHp;
            currentCharacter.vitals.tempHp = tempHp;
        };

        const applyTrackerSnapshot = () => {
            const slotState = currentCharacter.trackingState?.slotPips || {};
            Object.keys(slotState).forEach(key => {
                const selector = key === "pact" ? "#pips-lvl-pact .pip" : `#pips-lvl-${key.replace("level", "")} .pip`;
                const pips = sheet.querySelectorAll<HTMLButtonElement>(selector);
                const states = slotState[key] || [];
                pips.forEach((pip, index) => {
                    pip.classList.toggle("active", states[index] !== false);
                });
            });

            const resourceState = currentCharacter.trackingState?.resourcePips || {};
            Object.keys(resourceState).forEach(resKey => {
                const pips = sheet.querySelectorAll<HTMLButtonElement>(`.class-resource-tracker[data-resource-key="${resKey}"] .pip`);
                const states = resourceState[resKey] || [];
                pips.forEach((pip, index) => {
                    pip.classList.toggle("active", states[index] !== false);
                });
            });

            const inspiration = currentCharacter.trackingState?.heroicInspiration ?? currentCharacter.vitals.heroicInspiration;
            if (inspirationToggle) {
                inspirationToggle.classList.toggle("active", !!inspiration);
            }

            currentHp = Number(currentCharacter.vitals.currentHp) || 0;
            maxHp = Number(currentCharacter.vitals.maxHp) || 0;
            tempHp = Number(currentCharacter.vitals.tempHp) || 0;
        };

        function updateHpDisplay() {
            if (hpDisplay) {
                hpDisplay.value = currentHp.toString();
                hpDisplay.max = String(maxHp);
            }
            if (tempHpDisplay) tempHpDisplay.value = tempHp.toString();
            if (hpRatio) hpRatio.textContent = `${currentHp} / ${maxHp} Max`;
            if (hpBarFill) {
                const percentage = Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)));
                hpBarFill.style.width = `${percentage}%`;
                if (percentage <= 25) {
                    hpBarFill.style.backgroundColor = "#ef4444";
                } else if (percentage <= 50) {
                    hpBarFill.style.backgroundColor = "#f59e0b";
                } else {
                    hpBarFill.style.backgroundColor = "#10b981";
                }
            }
            currentCharacter.vitals.currentHp = currentHp;
            currentCharacter.vitals.tempHp = tempHp;
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
                    currentHp = Math.max(0, currentHp - incoming);
                }
            } else if (delta > 0) {
                currentHp = Math.min(maxHp, currentHp + delta);
            }
        }

        hpDisplay?.addEventListener("input", () => {
            const next = Number(hpDisplay.value);
            currentHp = Number.isFinite(next) ? Math.max(0, Math.min(maxHp, Math.round(next))) : 0;
            updateHpDisplay();
            persistTrackerSnapshot();
            scheduleDebouncedAutoSave();
        });

        tempHpDisplay?.addEventListener("input", () => {
            const next = Number(tempHpDisplay.value);
            tempHp = Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0;
            updateHpDisplay();
            persistTrackerSnapshot();
            scheduleDebouncedAutoSave();
        });

        sheet.querySelectorAll<HTMLButtonElement>("[data-hp-delta]").forEach(btn => {
            btn.addEventListener("click", () => {
                const delta = Number(btn.getAttribute("data-hp-delta"));
                if (isNaN(delta)) return;
                applyHpDelta(delta);
                updateHpDisplay();
                persistTrackerSnapshot();
                scheduleDebouncedAutoSave();
            });
        });

        // Heroic Inspiration toggle
        inspirationToggle?.addEventListener("click", () => {
            inspirationToggle.classList.toggle("active");
            currentCharacter.vitals.heroicInspiration = inspirationToggle.classList.contains("active");
            persistTrackerSnapshot();
        });

        // Resource Pips
        const allPips = sheet.querySelectorAll<HTMLButtonElement>(".pip");
        const headerSlotMarkers = sheet.querySelectorAll<HTMLButtonElement>(".header-slot-marker-btn");

        function syncHeaderSlotMarkers() {
            headerSlotMarkers.forEach(marker => {
                const level = marker.getAttribute("data-header-slot-level");
                const idx = Number(marker.getAttribute("data-header-slot-idx") || "0");
                const selector = level === "pact"
                    ? "#pips-lvl-pact .pip"
                    : `#pips-lvl-${level} .pip`;
                const matchingPips = sheet.querySelectorAll<HTMLButtonElement>(selector);
                const isActive = matchingPips[idx]?.classList.contains("active") ?? false;
                marker.classList.toggle("active", isActive);
                marker.setAttribute("aria-pressed", isActive ? "true" : "false");
            });
        }

        headerSlotMarkers.forEach(marker => {
            marker.addEventListener("click", () => {
                const level = marker.getAttribute("data-header-slot-level");
                const idx = Number(marker.getAttribute("data-header-slot-idx") || "0");
                const selector = level === "pact"
                    ? "#pips-lvl-pact .pip"
                    : `#pips-lvl-${level} .pip`;
                const matchingPips = sheet.querySelectorAll<HTMLButtonElement>(selector);
                const targetPip = matchingPips[idx];
                if (!targetPip) return;
                targetPip.classList.toggle("active");
                updateSlotCounters();
                persistTrackerSnapshot();
            });
        });

        allPips.forEach(pip => {
            pip.addEventListener("click", () => {
                pip.classList.toggle("active");
                updateSlotCounters();
                persistTrackerSnapshot();
            });
        });

        function updateSlotCounters() {
            // Update all level 1-9 spell slot counters
            for (let lvl = 1; lvl <= 9; lvl++) {
                const pips = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-${lvl} .pip`);
                const active = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-${lvl} .pip.active`).length;
                const count = sheet.querySelector<HTMLElement>(`#count-lvl-${lvl}`);
                if (count && pips.length) count.textContent = `${active} / ${pips.length}`;
            }

            // Update Pact Magic counter
            const pactPips = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-pact .pip`);
            const pactActive = sheet.querySelectorAll<HTMLButtonElement>(`#pips-lvl-pact .pip.active`).length;
            const pactCount = sheet.querySelector<HTMLElement>(`#count-lvl-pact`);
            if (pactCount && pactPips.length) pactCount.textContent = `${pactActive} / ${pactPips.length}`;

            // Update all dynamic class resource counters
            sheet.querySelectorAll<HTMLElement>(".class-resource-tracker").forEach(tracker => {
                const resKey = tracker.getAttribute("data-resource-key");
                if (!resKey) return;
                const resPips = tracker.querySelectorAll<HTMLButtonElement>(".pip");
                const resActive = tracker.querySelectorAll<HTMLButtonElement>(".pip.active").length;
                const countEl = tracker.querySelector<HTMLElement>(`#count-${resKey}`);
                if (countEl && resPips.length) {
                    countEl.textContent = `${resActive} / ${resPips.length}`;
                }
            });

            syncHeaderSlotMarkers();
        }

        // Short Rest - resets Pact Magic and all features marked resetOn = 'short'
        sheet.querySelector<HTMLButtonElement>("#short-rest-btn")?.addEventListener("click", () => {
            sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip").forEach(p => p.classList.add("active"));
            sheet.querySelectorAll<HTMLButtonElement>('.class-resource-tracker[data-reset-on="short"] .pip').forEach(p => p.classList.add("active"));
            updateSlotCounters();
            persistTrackerSnapshot();
        });

        // Long Rest - resets all spell slots, all class resources, hit points, and heroic inspiration
        sheet.querySelector<HTMLButtonElement>("#long-rest-btn")?.addEventListener("click", () => {
            allPips.forEach(p => p.classList.add("active"));
            sheet.querySelectorAll<HTMLButtonElement>(".class-resource-tracker .pip").forEach(p => p.classList.add("active"));
            currentHp = maxHp;
            tempHp = 0;
            updateHpDisplay();
            updateSlotCounters();
            inspirationToggle?.classList.add("active");
            currentCharacter.vitals.heroicInspiration = true;
            persistTrackerSnapshot();
            scheduleDebouncedAutoSave();
        });

        applyTrackerSnapshot();
        updateHpDisplay();
        updateSlotCounters();
        persistTrackerSnapshot();
    }

    async function loadCharacter(idOrUrl: string) {
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
            const agreed = window.confirm(
                `This D&D Beyond character is already saved as \"${existingSaved.name}\" on The Green Asterisk.\n\n` +
                `Press OK to overwrite your saved version with fresh D&D Beyond data, or Cancel to keep existing saved data.`
            );

            if (!agreed) {
                if (existingSaved.siteCharacterId) {
                    await loadSavedCharacterBySiteId(existingSaved.siteCharacterId);
                } else {
                    await loadSavedCharacter(existingSaved.id);
                }
                showStatus(`Kept existing saved data for \"${existingSaved.name}\".`);
                return;
            }
            shouldOverwriteSaved = true;
        }

        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        }
        showStatus(`Fetching D&D Beyond character #${extractedId}...`);

        try {
            const rawData = await getData<any>(`/get-dndbeyond-character?id=${extractedId}`);
            const parsed = parseDndBeyondCharacter(rawData, trimmed);
            activeCharacterId = extractedId;
            activeCharacter = parsed;
            activeCharacter.source = "dndbeyond";
            activeCharacter.siteCharacterId = undefined;
            isEditMode = false;
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

            // Apply persisted equipped/unequipped overrides from local database
            try {
                const persisted = await getData<{ states?: Array<{ scope: "item" | "weapon" | "weapon-mastery"; itemName: string; equipped: boolean }> }>(`/get-character-equip-states?id=${extractedId}`);
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
            showStatus(
                shouldOverwriteSaved
                    ? `Loaded and overwrote saved data for "${activeCharacter.name}" from D&D Beyond.`
                    : `Loaded "${activeCharacter.name}" (Level ${activeCharacter.level} ${activeCharacter.classes.map(c => c.name).join('/')}) successfully!`
            );

            // Update URL without reloading if window history exists
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

    // Bind form submission & button click
    const handleLoadSubmit = (e?: Event) => {
        if (e) e.preventDefault();
        const val = idInput?.value || "";
        loadCharacter(val);
    };

    loadForm?.addEventListener("submit", handleLoadSubmit);
    loadBtn?.addEventListener("click", handleLoadSubmit);

    // Custom spell form submission
    customSpellForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!activeCharacter) {
            showCustomSpellStatus("Load a character before adding custom spells.", true);
            return;
        }
        const nameInput = sheet.querySelector<HTMLInputElement>("#custom-spell-name");
        const levelSelect = sheet.querySelector<HTMLSelectElement>("#custom-spell-level");
        const schoolInput = sheet.querySelector<HTMLInputElement>("#custom-spell-school");
        const timeInput = sheet.querySelector<HTMLInputElement>("#custom-spell-time");
        const rangeInput = sheet.querySelector<HTMLInputElement>("#custom-spell-range");
        const durationInput = sheet.querySelector<HTMLInputElement>("#custom-spell-duration");
        const componentsInput = sheet.querySelector<HTMLInputElement>("#custom-spell-components");
        const concCheck = sheet.querySelector<HTMLInputElement>("#custom-spell-concentration");
        const ritualCheck = sheet.querySelector<HTMLInputElement>("#custom-spell-ritual");
        const descInput = sheet.querySelector<HTMLTextAreaElement>("#custom-spell-description");
        const submitBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-save-btn");

        if (!nameInput?.value.trim() || !descInput?.value.trim()) {
            showCustomSpellStatus("Spell Name and Description are required.", true);
            return;
        }

        const spellPayload = {
            name: nameInput.value.trim(),
            level: Number(levelSelect?.value || "0"),
            school: schoolInput?.value.trim() || "Universal",
            castingTime: timeInput?.value.trim() || "1 Action",
            range: rangeInput?.value.trim() || "60 ft.",
            duration: durationInput?.value.trim() || "Instantaneous",
            components: componentsInput?.value.trim() || "V, S",
            concentration: !!concCheck?.checked,
            ritual: !!ritualCheck?.checked,
            description: descInput.value.trim(),
            source: "Custom Homebrew",
            sourceTier: "Custom Database"
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
        }
        showCustomSpellStatus("Saving spell to local database...");

        try {
            const savedSpell = await postData<any>("/create-custom-spell", spellPayload);
            showCustomSpellStatus(`Spell "${spellPayload.name}" saved successfully to database!`);

            // Add to active character spells and update view
            const newSpellDef: SpellDefinition = {
                name: spellPayload.name,
                level: spellPayload.level,
                school: spellPayload.school,
                castingTime: spellPayload.castingTime,
                range: spellPayload.range,
                duration: spellPayload.duration,
                components: spellPayload.components,
                concentration: spellPayload.concentration,
                ritual: spellPayload.ritual,
                description: spellPayload.description,
                source: "Custom Homebrew",
                id: savedSpell?.id
            };

            // Prepend new spell
            activeCharacter.spells.unshift(newSpellDef);
            spellMap.set(newSpellDef.name.toLowerCase(), newSpellDef);

            // Re-render sheet content
            renderActiveCharacterView();

            setTimeout(() => {
                closeCustomSpellModal();
                // Reset form
                customSpellForm.reset();
            }, 800);
        } catch (error: any) {
            console.error("Failed to create custom spell:", error);
            showCustomSpellStatus(`Could not save custom spell: ${error?.message || error}`, true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Spell to Database';
            }
        }
    });

    setCharacterActionsVisibility();

    // Check if a specific ID was passed via initial parameters, query string, or path
    if (activeCharacterId) {
        if (idInput) idInput.value = activeCharacterId.toString();
        void loadCharacter(activeCharacterId.toString());
    } else {
        if (idInput) idInput.value = "";
        if (el.isAuth) {
            void fetchSavedCharacters().then(() => {
                renderSavedCharacterList();
            });
        }
    }
}

function resolveInitialCharacterId(params?: { id?: string | number; characterId?: string | number; url?: string } | string | number): string | undefined {
    const siteIdPattern = /tga-[a-z0-9]{8,20}/i;
    if (typeof params === "string" || typeof params === "number") {
        return params.toString();
    }
    if (params?.id) return params.id.toString();
    if (params?.characterId) return params.characterId.toString();
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
            return qId;
        }
    }

    // Check pathname (e.g. /character/138310322 or /character-sheet/138310322)
    if (typeof window !== "undefined" && window.location?.pathname) {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        if (last && siteIdPattern.test(last)) {
            return last.toLowerCase();
        }
        if (last && /^\d{6,}$/.test(last)) {
            return last;
        }
    }

    return undefined;
}
