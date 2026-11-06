import { getData, postData } from "@services/request";
import { ConditionDefinition, DEFAULT_DND55_CONDITIONS, darvellData, SpellDefinition } from "../characterData";
import { getCharacterSpellLevelLimits, renderSpellsByLevel, spellLevelLabel } from "../components/spells";
import { CharacterSheetContext } from "./context";
import { initSpellsController } from "./spells.ctrl";

export function initModalsController(ctx: CharacterSheetContext) {
    const sheet = ctx.sheet;

    // Spell modal elements
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

    // Item modal elements
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

    // Custom spell modal elements
    const customSpellModal = sheet.querySelector<HTMLElement>("#custom-spell-modal-container");
    const customSpellCloseBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-close-btn");
    const customSpellCancelBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-cancel-btn");
    const customSpellForm = sheet.querySelector<HTMLFormElement>("#custom-spell-form");
    const customSpellStatus = sheet.querySelector<HTMLElement>("#custom-spell-status");

    // Conditions modal elements
    const conditionsModalBackdrop = sheet.querySelector<HTMLElement>("#conditions-modal-container");
    const conditionsModalCloseBtn = sheet.querySelector<HTMLButtonElement>("#conditions-modal-close-btn");
    const conditionsModalDoneBtn = sheet.querySelector<HTMLButtonElement>("#modal-conditions-close-action-btn");
    const conditionsModalList = sheet.querySelector<HTMLElement>("#conditions-modal-list");
    const conditionsActiveCountBadge = sheet.querySelector<HTMLElement>("#conditions-active-count-badge");
    const exhaustionLevelsRow = sheet.querySelector<HTMLElement>("#exhaustion-levels-row");
    const exhaustionEffectsBanner = sheet.querySelector<HTMLElement>("#exhaustion-effects-banner");
    const clearAllConditionsBtn = sheet.querySelector<HTMLButtonElement>("#clear-all-conditions-btn");
    const conditionsSourceLabel = sheet.querySelector<HTMLElement>("#modal-conditions-source");

    // Manage Spells modal elements
    const manageSpellsBackdrop = sheet.querySelector<HTMLElement>("#manage-spells-modal-container");
    const manageSpellsCloseBtn = sheet.querySelector<HTMLButtonElement>("#manage-spells-close-btn");
    const manageSpellsDoneBtn = sheet.querySelector<HTMLButtonElement>("#manage-spells-done-btn");
    const manageSpellsSearchInput = sheet.querySelector<HTMLInputElement>("#manage-spells-search-input");
    const manageSpellsLevelSelect = sheet.querySelector<HTMLSelectElement>("#manage-spells-level-select");
    const manageSpellsDbResults = sheet.querySelector<HTMLElement>("#manage-spells-db-results");
    const manageSpellsCurrentLevels = sheet.querySelector<HTMLElement>("#manage-spells-current-levels");
    const manageSpellsTotalBadge = sheet.querySelector<HTMLElement>("#manage-spells-total-badge");
    const manageDbResultsCount = sheet.querySelector<HTMLElement>("#manage-db-results-count");

    let cachedConditions: ConditionDefinition[] = [...DEFAULT_DND55_CONDITIONS];
    let hasFetchedDbConditions = false;

    let cachedDbSpells: SpellDefinition[] = [];
    let manageSearchTimer: ReturnType<typeof setTimeout> | null = null;

    function getActiveConditionsState(): { activeSet: Set<string>; exhaustionLevel: number } {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) {
            return { activeSet: new Set<string>(), exhaustionLevel: 0 };
        }
        const rawList = activeCharacter.trackingState?.activeConditions ?? activeCharacter.activeConditions ?? [];
        const exhaustionLevel = Math.max(
            0,
            Math.min(6, Number(activeCharacter.trackingState?.exhaustionLevel ?? activeCharacter.exhaustionLevel ?? 0) || 0)
        );
        const activeSet = new Set<string>(rawList.map(c => String(c || "").trim()).filter(Boolean));
        if (exhaustionLevel > 0) {
            activeSet.add("Exhaustion");
        } else {
            Array.from(activeSet).forEach(c => {
                if (c.toLowerCase() === "exhaustion") activeSet.delete(c);
            });
        }
        return { activeSet, exhaustionLevel };
    }

    function commitConditionsState(activeSet: Set<string>, exhaustionLevel: number) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        const clampedExhaustion = Math.max(0, Math.min(6, Number(exhaustionLevel) || 0));
        if (clampedExhaustion > 0) {
            activeSet.add("Exhaustion");
        } else {
            Array.from(activeSet).forEach(c => {
                if (c.toLowerCase() === "exhaustion") activeSet.delete(c);
            });
        }

        const list = Array.from(activeSet);
        activeCharacter.activeConditions = list;
        activeCharacter.exhaustionLevel = clampedExhaustion;

        if (!activeCharacter.trackingState) {
            activeCharacter.trackingState = {};
        }
        activeCharacter.trackingState.activeConditions = list;
        activeCharacter.trackingState.exhaustionLevel = clampedExhaustion;

        ctx.updateHeroConditionsDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function renderConditionsModalContent() {
        const { activeSet, exhaustionLevel } = getActiveConditionsState();
        const activeLowerSet = new Set(Array.from(activeSet).map(c => c.toLowerCase()));

        // Update active count badge
        if (conditionsActiveCountBadge) {
            const count = activeLowerSet.size;
            conditionsActiveCountBadge.textContent = `${count} Active`;
            conditionsActiveCountBadge.classList.toggle("has-active", count > 0);
        }

        // Update Exhaustion level buttons
        if (exhaustionLevelsRow) {
            exhaustionLevelsRow.querySelectorAll<HTMLButtonElement>(".exhaustion-lvl-btn").forEach(btn => {
                const lvl = Number(btn.getAttribute("data-exhaustion-level") || "0");
                const isSelected = lvl === exhaustionLevel;
                const isReached = exhaustionLevel > 0 && lvl > 0 && lvl <= exhaustionLevel;
                btn.classList.toggle("active", isSelected);
                btn.classList.toggle("reached", isReached);
                btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
            });
        }

        // Update Exhaustion effects banner
        if (exhaustionEffectsBanner) {
            if (exhaustionLevel <= 0) {
                exhaustionEffectsBanner.className = "exhaustion-effects-banner";
                exhaustionEffectsBanner.innerHTML = `<i class="fa-solid fa-circle-check"></i> No Exhaustion penalties currently active.`;
            } else if (exhaustionLevel >= 6) {
                exhaustionEffectsBanner.className = "exhaustion-effects-banner active deadly";
                exhaustionEffectsBanner.innerHTML = `<i class="fa-solid fa-skull"></i> <strong>Exhaustion Level 6:</strong> Roll penalty <strong>-12</strong> to all D20 Tests • Speed reduced by <strong>30 ft.</strong> • <strong>You Die.</strong>`;
            } else {
                const d20Penalty = exhaustionLevel * 2;
                const speedPenalty = exhaustionLevel * 5;
                exhaustionEffectsBanner.className = "exhaustion-effects-banner active";
                exhaustionEffectsBanner.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>Exhaustion Level ${exhaustionLevel}:</strong> <strong>-${d20Penalty}</strong> to all D20 Tests (attack rolls, ability checks, saving throws) • <strong>-${speedPenalty} ft.</strong> to Speed.`;
            }
        }

        // Render condition cards
        if (conditionsModalList) {
            conditionsModalList.innerHTML = cachedConditions
                .map(cond => {
                    const isExhaustion = cond.slug === "exhaustion" || cond.name.toLowerCase() === "exhaustion";
                    const isActive = isExhaustion ? exhaustionLevel > 0 : activeLowerSet.has(cond.name.toLowerCase());
                    const statusBadge = isExhaustion
                        ? (exhaustionLevel > 0 ? `Active (Lvl ${exhaustionLevel})` : "Inactive")
                        : (isActive ? "Active" : "Inactive");

                    return `
                        <article class="condition-modal-card ${isActive ? 'is-active' : ''}" data-condition-name="${cond.name}" data-condition-slug="${cond.slug}">
                            <div class="condition-card-header">
                                <div class="condition-card-title-group">
                                    <span class="condition-card-icon"><i class="${cond.icon || 'fa-solid fa-circle-exclamation'}"></i></span>
                                    <div>
                                        <h3 class="condition-card-name">${cond.name}</h3>
                                        <p class="condition-card-summary">${cond.summary}</p>
                                    </div>
                                </div>
                                <button type="button" class="condition-toggle-btn ${isActive ? 'active' : ''}" data-toggle-condition="${cond.name}" aria-pressed="${isActive ? 'true' : 'false'}">
                                    <i class="fa-solid ${isActive ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                                    <span>${statusBadge}</span>
                                </button>
                            </div>
                            <div class="condition-card-body">
                                ${cond.description}
                            </div>
                        </article>
                    `;
                })
                .join("");

            conditionsModalList.querySelectorAll<HTMLButtonElement>(".condition-toggle-btn[data-toggle-condition]").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const condName = btn.getAttribute("data-toggle-condition");
                    if (!condName) return;
                    toggleConditionByName(condName);
                });
            });

            conditionsModalList.querySelectorAll<HTMLElement>(".condition-modal-card[data-condition-name]").forEach(card => {
                card.addEventListener("click", () => {
                    const condName = card.getAttribute("data-condition-name");
                    if (!condName) return;
                    toggleConditionByName(condName);
                });
            });
        }
    }

    function toggleConditionByName(condName: string) {
        const { activeSet, exhaustionLevel } = getActiveConditionsState();
        const isExhaustion = condName.toLowerCase() === "exhaustion";

        if (isExhaustion) {
            const nextExhaustion = exhaustionLevel > 0 ? 0 : 1;
            commitConditionsState(activeSet, nextExhaustion);
        } else {
            const existing = Array.from(activeSet).find(c => c.toLowerCase() === condName.toLowerCase());
            if (existing) {
                activeSet.delete(existing);
            } else {
                activeSet.add(condName);
            }
            commitConditionsState(activeSet, exhaustionLevel);
        }
        renderConditionsModalContent();
    }

    async function openConditionsModal() {
        if (!conditionsModalBackdrop) return;

        renderConditionsModalContent();
        conditionsModalBackdrop.classList.remove("hidden");
        conditionsModalBackdrop.classList.add("visible");
        conditionsModalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        conditionsModalCloseBtn?.focus();

        if (!hasFetchedDbConditions) {
            try {
                const res = await getData<{ conditions?: ConditionDefinition[] }>("/get-conditions");
                if (Array.isArray(res?.conditions) && res.conditions.length > 0) {
                    cachedConditions = res.conditions;
                    hasFetchedDbConditions = true;
                    if (conditionsSourceLabel) {
                        conditionsSourceLabel.textContent = "Source: Database (conditions table • D&D 5.5 2024 Rules)";
                    }
                    renderConditionsModalContent();
                }
            } catch {
                // Keep DEFAULT_DND55_CONDITIONS fallback
            }
        }
    }

    function closeConditionsModal() {
        if (!conditionsModalBackdrop) return;
        conditionsModalBackdrop.classList.remove("visible");
        conditionsModalBackdrop.classList.add("hidden");
        conditionsModalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    // Manage Spells Modal Logic
    function refreshSheetSpellsView() {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        ctx.spellMap.clear();
        activeCharacter.spells.forEach(s => {
            ctx.spellMap.set(s.name.toLowerCase(), s);
        });

        const spellsGrid = sheet.querySelector<HTMLElement>("#spells-grid");
        if (spellsGrid) {
            spellsGrid.innerHTML = renderSpellsByLevel(activeCharacter.spells, activeCharacter.spellSlots, activeCharacter);
        }

        const tabSpellsCount = sheet.querySelector<HTMLElement>("#tab-spells-count");
        if (tabSpellsCount) {
            tabSpellsCount.textContent = `(${activeCharacter.spells.length})`;
        }

        const allChip = sheet.querySelector<HTMLButtonElement>('#spell-filter-chips .filter-chip[data-filter="all"]');
        if (allChip) {
            allChip.textContent = `All (${activeCharacter.spells.length})`;
        }

        initSpellsController(ctx);
        ctx.syncHeaderSlotMarkers();
    }

    function renderManageCurrentSpellsPanel() {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !manageSpellsCurrentLevels) return;

        const { availableLevels, allowedByLevel, currentByLevel } = getCharacterSpellLevelLimits(activeCharacter);

        if (manageSpellsTotalBadge) {
            manageSpellsTotalBadge.textContent = `${activeCharacter.spells.length} Spells on Sheet`;
        }

        manageSpellsCurrentLevels.innerHTML = availableLevels
            .map(lvl => {
                const levelSpells = currentByLevel[lvl] || [];
                const allowed = allowedByLevel[lvl] ?? levelSpells.length;
                const isOverLimit = levelSpells.length > allowed;
                const isAtLimit = levelSpells.length === allowed && allowed > 0;

                const spellsListHtml = levelSpells.length > 0
                    ? `<ul class="manage-abbrev-spell-list">
                        ${levelSpells.map(s => `
                            <li class="manage-abbrev-spell-row" data-current-spell-name="${encodeURIComponent(s.name)}">
                                <div class="manage-abbrev-spell-main" data-preview-spell-name="${encodeURIComponent(s.name)}" title="Click to view spell description">
                                    <span class="manage-abbrev-spell-name">${s.name}</span>
                                    <span class="manage-abbrev-spell-meta">${s.school} • ${s.castingTime}</span>
                                    ${s.concentration ? '<span class="manage-mini-tag conc">C</span>' : ''}
                                    ${s.ritual ? '<span class="manage-mini-tag ritual">R</span>' : ''}
                                </div>
                                <button type="button" class="manage-remove-spell-btn" data-remove-spell-name="${encodeURIComponent(s.name)}" title="Remove ${s.name} from character spell list" aria-label="Remove ${s.name}">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </li>
                        `).join("")}
                    </ul>`
                    : `<div class="manage-empty-level-note">No ${spellLevelLabel(lvl).toLowerCase()} added yet.</div>`;

                return `
                    <div class="manage-level-group" data-manage-spell-level="${lvl}">
                        <div class="manage-level-header">
                            <span class="manage-level-title">${spellLevelLabel(lvl)}</span>
                            <div class="manage-level-allowance-controls">
                                <button type="button" class="manage-limit-step-btn" data-adjust-level="${lvl}" data-adjust-delta="-1" title="Decrease allowed spells for ${spellLevelLabel(lvl)}" aria-label="Decrease allowed spells for ${spellLevelLabel(lvl)}">&minus;</button>
                                <span class="manage-level-ratio ${isOverLimit ? 'over-limit' : isAtLimit ? 'at-limit' : ''}" data-level-ratio="${lvl}" title="${levelSpells.length} spells currently on sheet / ${allowed} spells allowed for ${spellLevelLabel(lvl)}">
                                    ${levelSpells.length}/${allowed}
                                </span>
                                <button type="button" class="manage-limit-step-btn" data-adjust-level="${lvl}" data-adjust-delta="1" title="Increase allowed spells for ${spellLevelLabel(lvl)}" aria-label="Increase allowed spells for ${spellLevelLabel(lvl)}">+</button>
                            </div>
                        </div>
                        ${spellsListHtml}
                    </div>
                `;
            })
            .join("");

        // Wire remove buttons
        manageSpellsCurrentLevels.querySelectorAll<HTMLButtonElement>(".manage-remove-spell-btn[data-remove-spell-name]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const encoded = btn.getAttribute("data-remove-spell-name");
                if (!encoded) return;
                removeSpellFromCharacter(decodeURIComponent(encoded));
            });
        });

        // Wire preview click on spell name
        manageSpellsCurrentLevels.querySelectorAll<HTMLElement>(".manage-abbrev-spell-main[data-preview-spell-name]").forEach(row => {
            row.addEventListener("click", () => {
                const encoded = row.getAttribute("data-preview-spell-name");
                if (!encoded) return;
                void openSpellModal(encoded);
            });
        });

        // Wire allowed spell limit step buttons (- / +)
        manageSpellsCurrentLevels.querySelectorAll<HTMLButtonElement>(".manage-limit-step-btn[data-adjust-level]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const lvl = Number(btn.getAttribute("data-adjust-level") || "0");
                const delta = Number(btn.getAttribute("data-adjust-delta") || "0");
                adjustAllowedSpellsForLevel(lvl, delta);
            });
        });
    }

    function adjustAllowedSpellsForLevel(level: number, delta: number) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        const { allowedByLevel } = getCharacterSpellLevelLimits(activeCharacter);
        const currentAllowed = allowedByLevel[level] ?? 0;
        const nextAllowed = Math.max(0, currentAllowed + delta);

        if (!activeCharacter.allowedSpellsByLevel) {
            activeCharacter.allowedSpellsByLevel = { ...allowedByLevel };
        }
        activeCharacter.allowedSpellsByLevel[level] = nextAllowed;

        if (!activeCharacter.trackingState) {
            activeCharacter.trackingState = {};
        }
        if (!activeCharacter.trackingState.allowedSpellsByLevel) {
            activeCharacter.trackingState.allowedSpellsByLevel = { ...allowedByLevel };
        }
        activeCharacter.trackingState.allowedSpellsByLevel[level] = nextAllowed;

        renderManageCurrentSpellsPanel();
        refreshSheetSpellsView();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function addSpellToCharacter(spell: SpellDefinition) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        const exists = activeCharacter.spells.some(s => s.name.toLowerCase() === spell.name.toLowerCase());
        if (!exists) {
            activeCharacter.spells.push({
                id: spell.id,
                name: spell.name,
                level: Number(spell.level) || 0,
                school: spell.school || "Universal",
                source: spell.source || "Database",
                castingTime: spell.castingTime || "1 Action",
                range: spell.range || "Self",
                duration: spell.duration || "Instantaneous",
                components: spell.components || "V, S",
                concentration: !!spell.concentration,
                ritual: !!spell.ritual,
                description: spell.description || "<p>No description provided.</p>",
                imageUrl: spell.imageUrl
            });
            activeCharacter.spells.sort((a, b) => {
                if (a.level !== b.level) return a.level - b.level;
                return a.name.localeCompare(b.name);
            });
        }

        renderManageCurrentSpellsPanel();
        renderManageDbSearchResults();
        refreshSheetSpellsView();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function removeSpellFromCharacter(spellName: string) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        activeCharacter.spells = activeCharacter.spells.filter(
            s => s.name.toLowerCase() !== spellName.toLowerCase()
        );

        renderManageCurrentSpellsPanel();
        renderManageDbSearchResults();
        refreshSheetSpellsView();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function renderManageDbSearchResults() {
        const activeCharacter = ctx.getCharacter();
        if (!manageSpellsDbResults) return;

        const currentNames = new Set(
            (activeCharacter?.spells || []).map(s => s.name.toLowerCase())
        );

        if (manageDbResultsCount) {
            manageDbResultsCount.textContent = `${cachedDbSpells.length} found`;
        }

        if (cachedDbSpells.length === 0) {
            manageSpellsDbResults.innerHTML = `
                <div class="manage-db-empty">
                    <i class="fa-solid fa-book-open"></i>
                    <p>No matching spells found in database.</p>
                </div>
            `;
            return;
        }

        manageSpellsDbResults.innerHTML = cachedDbSpells
            .map((spell, idx) => {
                const isAdded = currentNames.has(spell.name.toLowerCase());
                const lvlBadge = Number(spell.level) === 0 ? "Cantrip" : `Lvl ${spell.level}`;
                return `
                    <div class="manage-db-spell-card ${isAdded ? 'is-added' : ''}" data-db-spell-idx="${idx}">
                        <div class="manage-db-spell-info" data-preview-db-idx="${idx}" title="Click to preview full description">
                            <div class="manage-db-spell-title-row">
                                <span class="manage-db-spell-name">${spell.name}</span>
                                <span class="manage-db-lvl-pill">${lvlBadge}</span>
                                <span class="manage-db-school">${spell.school || 'Universal'}</span>
                            </div>
                            <div class="manage-db-spell-sub">
                                <span><i class="fa-regular fa-clock"></i> ${spell.castingTime || '1 Action'}</span>
                                <span><i class="fa-solid fa-bullseye"></i> ${spell.range || 'Self'}</span>
                                ${spell.concentration ? '<span class="manage-mini-tag conc">Conc</span>' : ''}
                                ${spell.ritual ? '<span class="manage-mini-tag ritual">Ritual</span>' : ''}
                                ${spell.source ? `<span class="manage-db-source">${spell.source}</span>` : ''}
                            </div>
                        </div>
                        <button
                            type="button"
                            class="manage-db-action-btn ${isAdded ? 'added' : 'add'}"
                            data-db-action-idx="${idx}"
                            title="${isAdded ? 'Click to remove from character' : 'Add spell to character sheet'}"
                        >
                            ${isAdded ? '<i class="fa-solid fa-check"></i> Added' : '<i class="fa-solid fa-plus"></i> Add'}
                        </button>
                    </div>
                `;
            })
            .join("");

        manageSpellsDbResults.querySelectorAll<HTMLButtonElement>(".manage-db-action-btn[data-db-action-idx]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = Number(btn.getAttribute("data-db-action-idx") || "-1");
                const spell = cachedDbSpells[idx];
                if (!spell) return;
                const activeChar = ctx.getCharacter();
                const alreadyAdded = activeChar?.spells.some(s => s.name.toLowerCase() === spell.name.toLowerCase());
                if (alreadyAdded) {
                    removeSpellFromCharacter(spell.name);
                } else {
                    addSpellToCharacter(spell);
                }
            });
        });

        manageSpellsDbResults.querySelectorAll<HTMLElement>(".manage-db-spell-info[data-preview-db-idx]").forEach(info => {
            info.addEventListener("click", () => {
                const idx = Number(info.getAttribute("data-preview-db-idx") || "-1");
                const spell = cachedDbSpells[idx];
                if (!spell) return;
                ctx.spellMap.set(spell.name.toLowerCase(), spell);
                void openSpellModal(encodeURIComponent(spell.name), spell.id);
            });
        });
    }

    async function fetchDatabaseSpellsForManageModal() {
        const q = (manageSpellsSearchInput?.value || "").trim();
        const levelVal = manageSpellsLevelSelect?.value || "all";

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (levelVal && levelVal !== "all") params.set("level", levelVal);

        let dbList: SpellDefinition[] = [];
        try {
            const res = await getData<{ spells?: any[] }>(`/search-spells?${params.toString()}`);
            if (Array.isArray(res?.spells)) {
                dbList = res.spells.map(s => ({
                    id: s.dndBeyondId || s.id,
                    name: s.name,
                    level: Number(s.level) || 0,
                    school: s.school || "Universal",
                    source: s.source || "Database",
                    castingTime: s.castingTime || "1 Action",
                    range: s.range || "Self",
                    duration: s.duration || "Instantaneous",
                    components: s.components || "V, S",
                    concentration: !!s.concentration,
                    ritual: !!s.ritual,
                    description: s.description || "<p>No description provided.</p>",
                    imageUrl: s.imageUrl
                }));
            }
        } catch {
            // Fallback to in-memory spells if offline / uninitialized DB
        }

        // Merge with character's current pull spells and default Darvell spells if DB was empty (offline/test fallback)
        if (dbList.length === 0) {
            const activeCharacter = ctx.getCharacter();
            const fallbackMap = new Map<string, SpellDefinition>();
            [...(activeCharacter?.spells || []), ...(darvellData.spells || [])].forEach(s => {
                fallbackMap.set(s.name.toLowerCase(), s);
            });
            dbList = Array.from(fallbackMap.values()).filter(spell => {
                if (levelVal !== "all" && Number(spell.level) !== Number(levelVal)) return false;
                if (!q) return true;
                const haystack = `${spell.name} ${spell.school} ${spell.source} ${spell.description}`.toLowerCase();
                return haystack.includes(q.toLowerCase());
            });
            dbList.sort((a, b) => (a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name)));
        }

        cachedDbSpells = dbList;
        renderManageDbSearchResults();
    }

    async function openManageSpellsModal() {
        if (!manageSpellsBackdrop) return;

        renderManageCurrentSpellsPanel();
        manageSpellsBackdrop.classList.remove("hidden");
        manageSpellsBackdrop.classList.add("visible");
        manageSpellsBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        manageSpellsSearchInput?.focus();

        // Ensure current character's pull spells are synced to the database first
        const activeCharacter = ctx.getCharacter();
        if (activeCharacter?.spells?.length) {
            try {
                await postData("/sync-character-spells", { spells: activeCharacter.spells });
            } catch {
                // Ignore sync errors in offline mode
            }
        }

        await fetchDatabaseSpellsForManageModal();
    }

    function closeManageSpellsModal() {
        if (!manageSpellsBackdrop) return;
        manageSpellsBackdrop.classList.remove("visible");
        manageSpellsBackdrop.classList.add("hidden");
        manageSpellsBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function showCustomSpellStatus(message: string, isError = false) {
        if (!customSpellStatus) return;
        customSpellStatus.textContent = message;
        customSpellStatus.className = `status-msg ${isError ? 'error' : 'success'}`;
        customSpellStatus.classList.remove("hidden");
    }

    async function openSpellModal(spellName: string, spellId?: number | string) {
        const decodedName = decodeURIComponent(spellName).trim();
        const localSpell = ctx.spellMap.get(decodedName.toLowerCase());
        if (!modalBackdrop) return;

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

        const hasCharacterPullDefinition = Boolean(
            localSpell &&
            localSpell.description &&
            localSpell.description.trim() !== "" &&
            localSpell.description.trim() !== "<p>No description provided.</p>"
        );

        if (modalDescription) {
            modalDescription.innerHTML = hasCharacterPullDefinition
                ? localSpell!.description
                : "<p><em>Loading spell details...</em></p>";
        }

        if (modalSource) {
            modalSource.innerHTML = hasCharacterPullDefinition
                ? `<strong>Source:</strong> Character Pull (${localSpell?.source || "D&D Beyond"})`
                : `<i class="fa-solid fa-spinner fa-spin"></i> Loading spell info from database...`;
        }

        modalBackdrop.classList.remove("hidden");
        modalBackdrop.classList.add("visible");
        modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        modalCloseBtn?.focus();

        // Prefer the spell definition that came in with the character pull, and persist it into the database
        if (hasCharacterPullDefinition && localSpell) {
            void postData("/sync-character-spells", { spells: [localSpell] }).catch(() => { });
            return;
        }

        try {
            const spellQuery = new URLSearchParams();
            spellQuery.set("name", decodedName);
            if (spellId !== undefined && spellId !== null && String(spellId).trim() !== "") {
                spellQuery.set("id", String(spellId));
            }
            spellQuery.set("preferRules2024", ctx.prefer2024Rules.value ? "1" : "0");

            const independentResponse = await getData<any>(`/get-spell?${spellQuery.toString()}`);
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

    async function openItemModal(itemName: string, itemId?: number | string, itemType?: string) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;
        const decodedName = decodeURIComponent(itemName).trim();
        if (!itemModalBackdrop) return;

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

        if (modalItemDamage) modalItemDamage.textContent = localWeapon?.damage || "—";
        if (modalItemRange) modalItemRange.textContent = localWeapon?.range || "—";
        if (modalItemProps) modalItemProps.textContent = localWeapon?.properties?.length ? localWeapon.properties.join(", ") : "—";
        if (modalItemWeight) modalItemWeight.textContent = localEquipment?.notes ? localEquipment.notes : "—";

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

        try {
            const queryParams = new URLSearchParams();
            queryParams.set("name", decodedName);
            if (itemId) queryParams.set("id", String(itemId));
            if (itemType) queryParams.set("type", itemType);
            queryParams.set("preferRules2024", ctx.prefer2024Rules.value ? "1" : "0");

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

                if (modalItemDamage && itemObj.damage) modalItemDamage.textContent = itemObj.damage;
                if (modalItemRange && itemObj.range) modalItemRange.textContent = itemObj.range;
                if (modalItemProps && itemObj.properties) modalItemProps.textContent = itemObj.properties;
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
        const activeCharacter = ctx.getCharacter();
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
                    void openSpellModal(spellName);
                });

                btn.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        closeActionModal();
                        void openSpellModal(spellName);
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

    // Attach open/close functions to ctx
    ctx.openSpellModal = openSpellModal;
    ctx.closeSpellModal = closeSpellModal;
    ctx.openCustomSpellModal = openCustomSpellModal;
    ctx.closeCustomSpellModal = closeCustomSpellModal;
    ctx.openManageSpellsModal = openManageSpellsModal;
    ctx.closeManageSpellsModal = closeManageSpellsModal;
    ctx.openItemModal = openItemModal;
    ctx.closeItemModal = closeItemModal;
    ctx.openActionModal = openActionModal;
    ctx.closeActionModal = closeActionModal;
    ctx.openConditionsModal = openConditionsModal;
    ctx.closeConditionsModal = closeConditionsModal;

    // Listeners
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

    conditionsModalCloseBtn?.addEventListener("click", closeConditionsModal);
    conditionsModalDoneBtn?.addEventListener("click", closeConditionsModal);
    conditionsModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === conditionsModalBackdrop) {
            closeConditionsModal();
        }
    });

    manageSpellsCloseBtn?.addEventListener("click", closeManageSpellsModal);
    manageSpellsDoneBtn?.addEventListener("click", closeManageSpellsModal);
    manageSpellsBackdrop?.addEventListener("click", (event) => {
        if (event.target === manageSpellsBackdrop) {
            closeManageSpellsModal();
        }
    });

    manageSpellsSearchInput?.addEventListener("input", () => {
        if (manageSearchTimer) clearTimeout(manageSearchTimer);
        manageSearchTimer = setTimeout(() => {
            void fetchDatabaseSpellsForManageModal();
        }, 180);
    });

    manageSpellsLevelSelect?.addEventListener("change", () => {
        void fetchDatabaseSpellsForManageModal();
    });

    exhaustionLevelsRow?.querySelectorAll<HTMLButtonElement>(".exhaustion-lvl-btn[data-exhaustion-level]").forEach(btn => {
        btn.addEventListener("click", () => {
            const lvl = Math.max(0, Math.min(6, Number(btn.getAttribute("data-exhaustion-level") || "0")));
            const { activeSet } = getActiveConditionsState();
            commitConditionsState(activeSet, lvl);
            renderConditionsModalContent();
        });
    });

    clearAllConditionsBtn?.addEventListener("click", () => {
        commitConditionsState(new Set<string>(), 0);
        renderConditionsModalContent();
    });

    // Custom spell form submission
    customSpellForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) {
            showCustomSpellStatus("Load a character before adding custom spells.", true);
            return;
        }
        const nameInput = sheet.querySelector<HTMLInputElement>("#custom-spell-name");
        const levelSelect = sheet.querySelector<HTMLSelectElement>("#custom-spell-level");
        const schoolInput = sheet.querySelector<HTMLInputElement>("#custom-spell-school");
        const timeInput = sheet.querySelector<HTMLInputElement>("#custom-spell-casting-time");
        const rangeInput = sheet.querySelector<HTMLInputElement>("#custom-spell-range");
        const durationInput = sheet.querySelector<HTMLInputElement>("#custom-spell-duration");
        const componentsInput = sheet.querySelector<HTMLInputElement>("#custom-spell-components");
        const concCheck = sheet.querySelector<HTMLInputElement>("#custom-spell-concentration");
        const ritualCheck = sheet.querySelector<HTMLInputElement>("#custom-spell-ritual");
        const descInput = sheet.querySelector<HTMLTextAreaElement>("#custom-spell-description");
        const submitBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-submit-btn");

        if (!nameInput?.value.trim() || !descInput?.value.trim()) {
            showCustomSpellStatus("Spell Name and Description are required.", true);
            return;
        }

        const spellPayload = {
            name: nameInput.value.trim(),
            level: Number(levelSelect?.value || "0"),
            school: schoolInput?.value.trim() || "Universal",
            castingTime: timeInput?.value.trim() || "1 action",
            range: rangeInput?.value.trim() || "60 feet",
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

            activeCharacter.spells.unshift(newSpellDef);
            ctx.spellMap.set(newSpellDef.name.toLowerCase(), newSpellDef);
            ctx.renderActiveCharacterView();

            setTimeout(() => {
                closeCustomSpellModal();
                customSpellForm.reset();
            }, 800);
        } catch (error: any) {
            console.error("Failed to create custom spell:", error);
            showCustomSpellStatus(`Could not save custom spell: ${error?.message || error}`, true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Save Spell';
            }
        }
    });

    // Global escape key handler
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
            if (conditionsModalBackdrop && !conditionsModalBackdrop.classList.contains("hidden")) {
                closeConditionsModal();
            }
            if (manageSpellsBackdrop && !manageSpellsBackdrop.classList.contains("hidden")) {
                closeManageSpellsModal();
            }
        }
    });

    return {
        openSpellModal,
        closeSpellModal,
        openItemModal,
        closeItemModal,
        openActionModal,
        closeActionModal,
        openCustomSpellModal,
        closeCustomSpellModal,
        openManageSpellsModal,
        closeManageSpellsModal,
        openConditionsModal,
        closeConditionsModal
    };
}
