import { CharacterSheetContext } from "./context";

export function initSpellsController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    let currentFilter = "all";
    let searchQuery = "";

    const searchInput = ctx.sheet.querySelector<HTMLInputElement>("#spell-search");
    const searchClearBtn = ctx.sheet.querySelector<HTMLButtonElement>("#spell-search-clear");
    const filterChips = ctx.sheet.querySelectorAll<HTMLButtonElement>("#spell-filter-chips .filter-chip");
    const noSpellsNotice = ctx.sheet.querySelector<HTMLElement>("#no-spells-found");
    const spellLevelSections = ctx.sheet.querySelectorAll<HTMLElement>(".spells-level-section");
    const spellCards = ctx.sheet.querySelectorAll<HTMLElement>(".spell-card");

    // Click to open details
    spellCards.forEach(card => {
        const spellName = card.getAttribute("data-spell-name");
        const spellId = card.getAttribute("data-spell-id");
        if (!spellName) return;

        card.addEventListener("click", () => {
            void ctx.openSpellModal(spellName, spellId || undefined);
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void ctx.openSpellModal(spellName, spellId || undefined);
            }
        });
    });

    // Custom spell modal open button
    const openCustomSpellBtn = ctx.sheet.querySelector<HTMLButtonElement>("#open-custom-spell-btn");
    openCustomSpellBtn?.addEventListener("click", () => {
        ctx.openCustomSpellModal();
    });

    function filterSpells() {
        let visibleCount = 0;
        const q = searchQuery.toLowerCase().trim();

        spellCards.forEach(card => {
            const rawName = card.getAttribute("data-spell-name");
            if (!rawName) return;
            const spell = ctx.spellMap.get(decodeURIComponent(rawName).toLowerCase());
            if (!spell) {
                card.style.display = "none";
                return;
            }

            // Level / type filter
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
}
