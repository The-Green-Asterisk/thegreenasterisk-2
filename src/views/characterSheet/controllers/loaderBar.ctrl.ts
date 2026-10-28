import el from "@elements";
import { CharacterSheetContext } from "./context";

const loaderStorageKey = "character-sheet-loader-collapsed";
const rulesPreferenceStorageKey = "character-sheet-prefer-2024-rules";

export function initLoaderBarController(ctx: CharacterSheetContext) {
    const sheet = ctx.sheet;

    const loadForm = sheet.querySelector<HTMLFormElement>("#dndbeyond-load-form");
    const loaderBar = sheet.querySelector<HTMLElement>(".character-loader-bar");
    const loaderToggleBtn = sheet.querySelector<HTMLButtonElement>("#character-loader-toggle-btn");
    const idInput = sheet.querySelector<HTMLInputElement>("#dndbeyond-id-input");
    const loadBtn = sheet.querySelector<HTMLButtonElement>("#load-character-btn");
    const createBtn = sheet.querySelector<HTMLButtonElement>("#create-character-btn");
    const saveBtn = sheet.querySelector<HTMLButtonElement>("#save-character-btn");
    const refreshDndBeyondBtn = sheet.querySelector<HTMLButtonElement>("#refresh-dndbeyond-btn");
    const editFieldsBtn = sheet.querySelector<HTMLButtonElement>("#edit-character-fields-btn");
    const prefer2024RulesToggle = sheet.querySelector<HTMLInputElement>("#prefer-2024-rules-toggle");

    function setLoaderCollapsed(collapsed: boolean) {
        if (!loaderBar || !loaderToggleBtn) return;
        loaderBar.classList.toggle("is-collapsed", collapsed);
        sheet.classList.toggle("loader-collapsed", collapsed);
        loaderToggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        loaderToggleBtn.title = collapsed ? "Expand loader" : "Collapse loader";
    }

    const initialLoaderCollapsed =
        typeof window !== "undefined" && window.localStorage
            ? window.localStorage.getItem(loaderStorageKey) === "true"
            : false;
    setLoaderCollapsed(initialLoaderCollapsed);

    const initialPrefer2024Rules =
        typeof window !== "undefined" && window.localStorage
            ? window.localStorage.getItem(rulesPreferenceStorageKey) !== "false"
            : true;
    ctx.prefer2024Rules.value = initialPrefer2024Rules;
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
        ctx.prefer2024Rules.value = !!prefer2024RulesToggle.checked;
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(rulesPreferenceStorageKey, ctx.prefer2024Rules.value ? "true" : "false");
        }
        ctx.showStatus(
            ctx.prefer2024Rules.value
                ? "Now preferring 2024-aligned sources for spell/item detail lookups."
                : "Using mixed source lookups (including SRD fallbacks) for spell/item details."
        );
    });

    const handleLoadSubmit = (e?: Event) => {
        if (e) e.preventDefault();
        const val = idInput?.value || "";
        void ctx.loadCharacter(val);
    };

    loadForm?.addEventListener("submit", handleLoadSubmit);
    loadBtn?.addEventListener("click", handleLoadSubmit);

    createBtn?.addEventListener("click", () => {
        ctx.beginNewSiteCharacter();
    });

    saveBtn?.addEventListener("click", () => {
        void ctx.saveActiveCharacter();
    });

    refreshDndBeyondBtn?.addEventListener("click", () => {
        void ctx.refreshFromDndBeyondAndOverride();
    });

    editFieldsBtn?.addEventListener("click", () => {
        const nextEditMode = !ctx.getIsEditMode();
        ctx.setIsEditMode(nextEditMode);
        ctx.renderActiveCharacterView();
        if (!nextEditMode) {
            const activeCharacter = ctx.getCharacter();
            if (activeCharacter) {
                ctx.setCurrentHp(activeCharacter.vitals.currentHp);
                ctx.setMaxHp(activeCharacter.vitals.maxHp);
                ctx.setTempHp(Number(activeCharacter.vitals.tempHp) || 0);
                ctx.showStatus(`Applied edits for "${activeCharacter.name}". Save to persist.`);
            }
        }
    });

    function setCharacterActionsVisibility() {
        const activeCharacter = ctx.getCharacter();
        const isEditMode = ctx.getIsEditMode();
        const hasCharacter = !!activeCharacter;
        const canSave = hasCharacter && el.isAuth;
        const canRefreshFromDndBeyond = hasCharacter && activeCharacter?.source === "dndbeyond";

        if (editFieldsBtn) {
            editFieldsBtn.classList.toggle("hidden", !hasCharacter);
            editFieldsBtn.innerHTML = isEditMode
                ? '<i class="fa-solid fa-check"></i> Done Editing'
                : '<i class="fa-solid fa-pen"></i> Edit Fields';
        }
        if (saveBtn) {
            saveBtn.classList.toggle("hidden", !hasCharacter);
            saveBtn.disabled = !canSave;
            saveBtn.title = canSave ? "Save this character to your account" : "Log in to save characters";
        }
        if (createBtn) {
            createBtn.classList.toggle("hidden", !el.isAuth);
            createBtn.disabled = !el.isAuth;
        }
        if (refreshDndBeyondBtn) {
            refreshDndBeyondBtn.classList.toggle("hidden", !canRefreshFromDndBeyond);
            refreshDndBeyondBtn.disabled = !el.isAuth;
            refreshDndBeyondBtn.title = el.isAuth
                ? "Re-pull this character from D&D Beyond and overwrite saved data"
                : "Log in to overwrite saved data from D&D Beyond";
        }
    }

    function renderSavedCharacterList() {
        const dynamicContainer = ctx.dynamicContainer;
        if (!dynamicContainer) return;
        if (!el.isAuth) {
            dynamicContainer.innerHTML = "";
            return;
        }

        const savedCharacters = ctx.getSavedCharacters();
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
                    void ctx.loadSavedCharacter(id);
                }
            });
        });
    }

    ctx.setCharacterActionsVisibility = setCharacterActionsVisibility;
    ctx.renderSavedCharacterList = renderSavedCharacterList;

    return {
        setCharacterActionsVisibility,
        renderSavedCharacterList,
        setLoaderCollapsed
    };
}
