import { escapeHtml } from "@services/escape";
import el from "@elements";
import { CharacterSheetContext } from "./context";
import { exportPdfCharacterSheet, PdfFormat } from "../services/pdfExport";

const loaderStorageKey = "character-sheet-loader-collapsed";
const rulesPreferenceStorageKey = "character-sheet-prefer-2024-rules";
const pdfFormatStorageKey = "character-sheet-pdf-format-preference";

export function initLoaderBarController(ctx: CharacterSheetContext) {
    const sheet = ctx.sheet;

    const loadForm = sheet.querySelector<HTMLFormElement>("#dndbeyond-load-form");
    const loaderBar = sheet.querySelector<HTMLElement>(".character-loader-bar");
    const loaderToggleBtn = sheet.querySelector<HTMLButtonElement>("#character-loader-toggle-btn");
    const idInput = sheet.querySelector<HTMLInputElement>("#dndbeyond-id-input");
    const loadBtn = sheet.querySelector<HTMLButtonElement>("#load-character-btn");
    const saveBtn = sheet.querySelector<HTMLButtonElement>("#save-character-btn");
    const refreshDndBeyondBtn = sheet.querySelector<HTMLButtonElement>("#refresh-dndbeyond-btn");
    const exportPdfBtn = sheet.querySelector<HTMLButtonElement>("#export-pdf-sheet-btn");
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
    }, { signal: el.signal });

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
    }, { signal: el.signal });

    const handleLoadSubmit = (e?: Event) => {
        if (e) e.preventDefault();
        const val = idInput?.value || "";
        void ctx.loadCharacter(val);
    };

    loadForm?.addEventListener("submit", handleLoadSubmit, { signal: el.signal });
    loadBtn?.addEventListener("click", handleLoadSubmit, { signal: el.signal });

    saveBtn?.addEventListener("click", () => {
        void ctx.saveActiveCharacter();
    }, { signal: el.signal });

    refreshDndBeyondBtn?.addEventListener("click", () => {
        void ctx.refreshFromDndBeyondAndOverride();
    }, { signal: el.signal });

    const exportPdfModal = sheet.querySelector<HTMLElement>("#export-pdf-modal-container");
    const exportPdfCloseBtn = sheet.querySelector<HTMLButtonElement>("#export-pdf-close-btn");
    const exportPdfCancelBtn = sheet.querySelector<HTMLButtonElement>("#export-pdf-cancel-btn");
    const exportPdfConfirmBtn = sheet.querySelector<HTMLButtonElement>("#export-pdf-confirm-btn");
    const formatRadios = sheet.querySelectorAll<HTMLInputElement>('input[name="pdf-format-choice"]');
    const formatCards = sheet.querySelectorAll<HTMLElement>(".pdf-format-card");

    function updateSelectedFormatCard() {
        formatCards.forEach(card => {
            const radio = card.querySelector<HTMLInputElement>('input[type="radio"]');
            card.classList.toggle("selected", !!radio?.checked);
        });
    }

    function getExportPdfModal(): HTMLElement | null {
        return exportPdfModal || sheet.querySelector<HTMLElement>("#export-pdf-modal-container") || el.exportPdfModal;
    }

    function openPdfExportModal() {
        const modal = getExportPdfModal();
        if (!modal) {
            console.error("Export PDF modal not found");
            return;
        }
        const savedFormat = (typeof window !== "undefined" && window.localStorage?.getItem(pdfFormatStorageKey)) as PdfFormat || "letter";
        const radios = modal.querySelectorAll<HTMLInputElement>('input[name="pdf-format-choice"]');
        radios.forEach(radio => {
            radio.checked = radio.value === savedFormat;
        });
        updateSelectedFormatCard();
        modal.classList.remove("hidden");
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
    }

    function closePdfExportModal() {
        const modal = getExportPdfModal();
        if (!modal) return;
        modal.classList.remove("visible");
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = getExportPdfModal();
            if (modal && !modal.classList.contains("hidden")) {
                closePdfExportModal();
            }
        }
    }, { signal: el.signal });

    formatRadios.forEach(radio => {
        radio.addEventListener("change", updateSelectedFormatCard, { signal: el.signal });
    });

    formatCards.forEach(card => {
        card.addEventListener("click", (e) => {
            const radio = card.querySelector<HTMLInputElement>('input[type="radio"]');
            if (radio && e.target !== radio) {
                radio.checked = true;
                updateSelectedFormatCard();
            }
        }, { signal: el.signal });
    });

    const handleConfirmExport = async () => {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) {
            closePdfExportModal();
            ctx.showStatus("Please load a character first before exporting a PDF.");
            return;
        }

        const modal = getExportPdfModal();
        let chosenFormat: PdfFormat = "letter";
        const currentRadios = modal ? modal.querySelectorAll<HTMLInputElement>('input[name="pdf-format-choice"]') : formatRadios;
        currentRadios.forEach(radio => {
            if (radio.checked && (radio.value === "letter" || radio.value === "remarkable")) {
                chosenFormat = radio.value as PdfFormat;
            }
        });

        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(pdfFormatStorageKey, chosenFormat);
        }

        closePdfExportModal();

        if (exportPdfBtn) {
            exportPdfBtn.disabled = true;
        }
        const origHtml = exportPdfBtn ? exportPdfBtn.innerHTML : "";
        if (exportPdfBtn) {
            exportPdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Opening print dialog...';
        }

        try {
            await exportPdfCharacterSheet(activeCharacter, {
                format: chosenFormat,
                statusCallback: (msg) => ctx.showStatus(msg)
            });
        } catch (err) {
            console.error("PDF export failed:", err);
            ctx.showStatus("Failed to generate PDF. Check console for details.");
        } finally {
            if (exportPdfBtn) {
                exportPdfBtn.disabled = false;
                exportPdfBtn.innerHTML = origHtml;
            }
        }
    };

    exportPdfCloseBtn?.addEventListener("click", closePdfExportModal, { signal: el.signal });
    exportPdfCancelBtn?.addEventListener("click", closePdfExportModal, { signal: el.signal });
    const modalEl = getExportPdfModal();
    modalEl?.querySelector("#export-pdf-close-btn")?.addEventListener("click", closePdfExportModal, { signal: el.signal });
    modalEl?.querySelector("#export-pdf-cancel-btn")?.addEventListener("click", closePdfExportModal, { signal: el.signal });
    modalEl?.querySelector("#export-pdf-confirm-btn")?.addEventListener("click", handleConfirmExport, { signal: el.signal });

    exportPdfModal?.addEventListener("click", (e) => {
        if (e.target === exportPdfModal) {
            closePdfExportModal();
        }
    }, { signal: el.signal });
    if (modalEl && modalEl !== exportPdfModal) {
        modalEl.addEventListener("click", (e) => {
            if (e.target === modalEl) {
                closePdfExportModal();
            }
        }, { signal: el.signal });
    }

    exportPdfBtn?.addEventListener("click", () => {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) {
            ctx.showStatus("Please load a character first before exporting a PDF.");
            return;
        }
        openPdfExportModal();
    }, { signal: el.signal });

    exportPdfConfirmBtn?.addEventListener("click", handleConfirmExport, { signal: el.signal });

    function setCharacterActionsVisibility() {
        const activeCharacter = ctx.getCharacter();
        const hasCharacter = !!activeCharacter;
        const canSave = hasCharacter && el.isAuth;
        const canRefreshFromDndBeyond = hasCharacter && activeCharacter?.source === "dndbeyond";

        const editInWizardBtn = sheet.querySelector<HTMLAnchorElement>("#edit-in-wizard-btn");
        if (editInWizardBtn) {
            editInWizardBtn.classList.toggle("hidden", !hasCharacter);
            const charId = activeCharacter?.siteCharacterId || activeCharacter?.savedCharacterId || ctx.getActiveCharacterId() || "";
            editInWizardBtn.href = `/character-sheet/creator?id=${encodeURIComponent(charId)}`;
        }
        if (exportPdfBtn) {
            exportPdfBtn.classList.toggle("hidden", !hasCharacter);
        }
        if (saveBtn) {
            saveBtn.classList.toggle("hidden", !canSave);
            saveBtn.disabled = !canSave;
            saveBtn.title = canSave ? "Save this character to your account" : "Log in to save characters";
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
                            <div class="saved-character-card-wrapper">
                                <button
                                    type="button"
                                    class="saved-character-card"
                                    data-saved-character-id="${character.id}"
                                    data-site-character-id="${character.siteCharacterId || ""}"
                                    title="Load ${escapeHtml(character.name)}"
                                >
                                    ${character.avatarUrl ? `<img src="${character.avatarUrl}" alt="${escapeHtml(character.name)}" class="saved-character-avatar" />` : '<div class="saved-character-avatar placeholder"><i class="fa-solid fa-user"></i></div>'}
                                    <div class="saved-character-card-body">
                                        <strong>${escapeHtml(character.name)}</strong>
                                        <span>${subtitle}</span>
                                        ${character.siteCharacterId ? `<small>ID: ${character.siteCharacterId}</small>` : ''}
                                        <small>Updated: ${updatedText}</small>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    class="saved-character-delete-btn"
                                    data-delete-character-id="${character.id}"
                                    data-character-name="${escapeHtml(character.name)}"
                                    title="Delete ${escapeHtml(character.name)}"
                                    aria-label="Delete ${escapeHtml(character.name)}"
                                >
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
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
            }, { signal: el.signal });
        });

        dynamicContainer.querySelectorAll<HTMLButtonElement>(".saved-character-delete-btn").forEach(delBtn => {
            delBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                e.preventDefault();
                const id = Number(delBtn.getAttribute("data-delete-character-id"));
                const name = delBtn.getAttribute("data-character-name") || "this character";
                if (!Number.isNaN(id) && ctx.deleteSavedCharacter) {
                    const confirmed = window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
                    if (confirmed) {
                        delBtn.disabled = true;
                        delBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                        await ctx.deleteSavedCharacter(id);
                    }
                }
            }, { signal: el.signal });
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
