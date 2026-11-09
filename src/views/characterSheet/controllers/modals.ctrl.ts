import { getData, postData } from "@services/request";
import { ConditionDefinition, darvellData, DEFAULT_DND55_CONDITIONS, SpellDefinition } from "../characterData";
import { renderEquipment } from "../components/equipment";
import {
    findStandardActionDefinition,
    linkifyConditionAndSpellTags,
    resolveDndBeyondActionUrl
} from "../components/markupLinks";
import { getCharacterSpellLevelLimits, renderSpellsByLevel, spellLevelLabel } from "../components/spells";
import { renderWeapons } from "../components/weapons";
import { isMundaneEquipment } from "../services/magicItemBonuses";
import { CharacterSheetContext } from "./context";
import { initEquipmentController } from "./equipment.ctrl";
import { initSpellsController } from "./spells.ctrl";
import { initWeaponsController } from "./weapons.ctrl";

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
    const modalItemQtyDec = sheet.querySelector<HTMLButtonElement>("#modal-item-qty-dec");
    const modalItemQtyInc = sheet.querySelector<HTMLButtonElement>("#modal-item-qty-inc");
    const modalItemQuantityInput = sheet.querySelector<HTMLInputElement>("#modal-item-quantity-input");
    let currentItemModalName = "";

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
    const conditionsSearchInput = sheet.querySelector<HTMLInputElement>("#conditions-search-input");
    const conditionsActiveCountBadge = sheet.querySelector<HTMLElement>("#conditions-active-count-badge");
    const exhaustionLevelsRow = sheet.querySelector<HTMLElement>("#exhaustion-levels-row");
    const exhaustionEffectsBanner = sheet.querySelector<HTMLElement>("#exhaustion-effects-banner");
    const clearAllConditionsBtn = sheet.querySelector<HTMLButtonElement>("#clear-all-conditions-btn");
    const conditionsSourceLabel = sheet.querySelector<HTMLElement>("#modal-conditions-source");

    // Single Condition Detail modal elements
    const conditionDetailBackdrop = sheet.querySelector<HTMLElement>("#condition-detail-modal-container");
    const conditionDetailCloseBtn = sheet.querySelector<HTMLButtonElement>("#condition-detail-close-btn");
    const conditionDetailDoneBtn = sheet.querySelector<HTMLButtonElement>("#condition-detail-done-btn");
    const conditionDetailToggleActiveBtn = sheet.querySelector<HTMLButtonElement>("#condition-detail-toggle-active-btn");
    const modalConditionDetailName = sheet.querySelector<HTMLElement>("#modal-condition-detail-name");
    const modalConditionDetailSummary = sheet.querySelector<HTMLElement>("#modal-condition-detail-summary");
    const modalConditionDetailStatus = sheet.querySelector<HTMLElement>("#modal-condition-detail-status");
    const modalConditionDetailDescription = sheet.querySelector<HTMLElement>("#modal-condition-detail-description");

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

    // Manage Items modal elements
    const manageItemsBackdrop = sheet.querySelector<HTMLElement>("#manage-items-modal-container");
    const manageItemsCloseBtn = sheet.querySelector<HTMLButtonElement>("#manage-items-close-btn");
    const manageItemsDoneBtn = sheet.querySelector<HTMLButtonElement>("#manage-items-done-btn");
    const manageItemsSearchInput = sheet.querySelector<HTMLInputElement>("#manage-items-search-input");
    const manageItemsTypeSelect = sheet.querySelector<HTMLSelectElement>("#manage-items-type-select");
    const manageItemsDbResults = sheet.querySelector<HTMLElement>("#manage-items-db-results");
    const manageItemsCurrentList = sheet.querySelector<HTMLElement>("#manage-items-current-list");
    const manageItemsTotalBadge = sheet.querySelector<HTMLElement>("#manage-items-total-badge");
    const manageItemsResultsCount = sheet.querySelector<HTMLElement>("#manage-items-results-count");

    let cachedDbItems: any[] = [];
    let manageItemsSearchTimer: ReturnType<typeof setTimeout> | null = null;
    let lastItemSearchFetchedOnline = false;

    let cachedConditions: ConditionDefinition[] = [...DEFAULT_DND55_CONDITIONS];
    let hasFetchedDbConditions = false;
    let activeConditionDetailName = "";

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
            const searchQuery = (conditionsSearchInput?.value || "").trim().toLowerCase();
            const filteredConditions = searchQuery
                ? cachedConditions.filter(cond => {
                    const plainDesc = (cond.description || "").replace(/<[^>]*>/g, " ");
                    const haystack = `${cond.name} ${cond.summary} ${plainDesc}`.toLowerCase();
                    return haystack.includes(searchQuery);
                })
                : cachedConditions;

            if (filteredConditions.length === 0) {
                conditionsModalList.innerHTML = `
                    <div class="conditions-empty-search">
                        No conditions match "${(conditionsSearchInput?.value || "").trim()}".
                    </div>
                `;
                return;
            }

            conditionsModalList.innerHTML = filteredConditions
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
                                ${linkifyConditionAndSpellTags(cond.description)}
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

        if (conditionsSearchInput) {
            conditionsSearchInput.value = "";
        }
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
        const anyOtherModalOpen = [
            modalBackdrop,
            itemModalBackdrop,
            actionModalBackdrop,
            customSpellModal,
            conditionDetailBackdrop,
            manageSpellsBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
    }

    function findConditionDefinition(nameOrSlug: string): ConditionDefinition | undefined {
        const needle = decodeURIComponent(nameOrSlug || "")
            .trim()
            .toLowerCase();
        if (!needle) return undefined;
        const slugNeedle = needle.replace(/[^a-z0-9]+/g, "-");
        return (
            cachedConditions.find(
                c => c.name.toLowerCase() === needle || c.slug.toLowerCase() === slugNeedle
            ) ||
            cachedConditions.find(
                c => c.name.toLowerCase().includes(needle) || needle.includes(c.name.toLowerCase())
            )
        );
    }

    function renderConditionDetailModalContent(conditionNameInput: string) {
        const decoded = decodeURIComponent(conditionNameInput || "").trim();
        const cond = findConditionDefinition(decoded);
        const displayName = cond?.name || decoded || "Condition";
        activeConditionDetailName = displayName;

        const { activeSet, exhaustionLevel } = getActiveConditionsState();
        const activeLowerSet = new Set(Array.from(activeSet).map(c => c.toLowerCase()));
        const isExhaustion = displayName.toLowerCase() === "exhaustion" || cond?.slug === "exhaustion";
        const isActive = isExhaustion ? exhaustionLevel > 0 : activeLowerSet.has(displayName.toLowerCase());

        if (modalConditionDetailName) {
            modalConditionDetailName.innerHTML = `<i class="${cond?.icon || "fa-solid fa-circle-exclamation"}"></i> ${displayName}`;
        }
        if (modalConditionDetailSummary) {
            modalConditionDetailSummary.textContent = cond?.summary || "D&D 5.5 (2024 Rules) Condition";
        }
        if (modalConditionDetailStatus) {
            modalConditionDetailStatus.textContent = isExhaustion
                ? (exhaustionLevel > 0 ? `Active (Level ${exhaustionLevel})` : "Inactive")
                : (isActive ? "Active on Character" : "Inactive");
            modalConditionDetailStatus.classList.toggle("active-status", isActive);
        }
        if (conditionDetailToggleActiveBtn) {
            conditionDetailToggleActiveBtn.innerHTML = isActive
                ? `<i class="fa-solid fa-toggle-on"></i> Active on Character (Click to Remove)`
                : `<i class="fa-solid fa-toggle-off"></i> Mark Active on Character`;
            conditionDetailToggleActiveBtn.classList.toggle("is-active", isActive);
        }
        if (modalConditionDetailDescription) {
            modalConditionDetailDescription.innerHTML = cond?.description
                ? linkifyConditionAndSpellTags(cond.description)
                : `<p>No detailed definition found for <strong>${displayName}</strong>.</p>`;
        }
    }

    async function openConditionDetailModal(conditionName: string) {
        if (!conditionDetailBackdrop) return;
        renderConditionDetailModalContent(conditionName);
        conditionDetailBackdrop.classList.remove("hidden");
        conditionDetailBackdrop.classList.add("visible");
        conditionDetailBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        conditionDetailCloseBtn?.focus();

        if (!hasFetchedDbConditions) {
            try {
                const res = await getData<{ conditions?: ConditionDefinition[] }>("/get-conditions");
                if (Array.isArray(res?.conditions) && res.conditions.length > 0) {
                    cachedConditions = res.conditions;
                    hasFetchedDbConditions = true;
                    renderConditionDetailModalContent(conditionName);
                }
            } catch {
                // Keep DEFAULT_DND55_CONDITIONS fallback
            }
        }
    }

    function closeConditionDetailModal() {
        if (!conditionDetailBackdrop) return;
        conditionDetailBackdrop.classList.remove("visible");
        conditionDetailBackdrop.classList.add("hidden");
        conditionDetailBackdrop.setAttribute("aria-hidden", "true");
        const anyOtherModalOpen = [
            modalBackdrop,
            itemModalBackdrop,
            actionModalBackdrop,
            customSpellModal,
            conditionsModalBackdrop,
            manageSpellsBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
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

        const limits = getCharacterSpellLevelLimits(activeCharacter);
        const { availableLevels, allowedByLevel, currentByLevel } = limits;

        if (manageSpellsTotalBadge) {
            if (limits.maxPrepared > 0) {
                manageSpellsTotalBadge.textContent = `Cantrips: ${limits.currentCantrips}/${limits.maxCantrips} • Prepared: ${limits.currentPrepared}/${limits.maxPrepared} (${activeCharacter.spells.length} Spells on Sheet)`;
            } else {
                manageSpellsTotalBadge.textContent = `${activeCharacter.spells.length} Spells on Sheet`;
            }
        }

        manageSpellsCurrentLevels.innerHTML = availableLevels
            .map(lvl => {
                const levelSpells = currentByLevel[lvl] || [];
                const isCantrip = lvl === 0;
                const hasExplicitLimit =
                    activeCharacter.allowedSpellsByLevel?.[lvl] !== undefined ||
                    (activeCharacter.trackingState as any)?.allowedSpellsByLevel?.[lvl] !== undefined;
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

                const controlsHtml = isCantrip || hasExplicitLimit
                    ? `<div class="manage-level-allowance-controls">
                        <button type="button" class="manage-limit-step-btn" data-adjust-level="${lvl}" data-adjust-delta="-1" title="Decrease allowed spells for ${spellLevelLabel(lvl)}" aria-label="Decrease allowed spells for ${spellLevelLabel(lvl)}">&minus;</button>
                        <span class="manage-level-ratio ${isOverLimit ? 'over-limit' : isAtLimit ? 'at-limit' : ''}" data-level-ratio="${lvl}" title="${levelSpells.length} spells currently on sheet / ${allowed} spells allowed for ${spellLevelLabel(lvl)}">
                            ${levelSpells.length}/${allowed}
                        </span>
                        <button type="button" class="manage-limit-step-btn" data-adjust-level="${lvl}" data-adjust-delta="1" title="Increase allowed spells for ${spellLevelLabel(lvl)}" aria-label="Increase allowed spells for ${spellLevelLabel(lvl)}">+</button>
                    </div>`
                    : `<span class="manage-level-count-badge" data-level-ratio="${lvl}" title="${levelSpells.length} spells on sheet for ${spellLevelLabel(lvl)}">
                        ${levelSpells.length} Spells
                    </span>`;

                return `
                    <div class="manage-level-group" data-manage-spell-level="${lvl}">
                        <div class="manage-level-header">
                            <span class="manage-level-title">${spellLevelLabel(lvl)}</span>
                            ${controlsHtml}
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

    let lastSearchFetchedOnline = false;

    function renderManageDbSearchResults() {
        const activeCharacter = ctx.getCharacter();
        if (!manageSpellsDbResults) return;

        const currentNames = new Set(
            (activeCharacter?.spells || []).map(s => s.name.toLowerCase())
        );

        if (manageDbResultsCount) {
            manageDbResultsCount.textContent = lastSearchFetchedOnline
                ? `${cachedDbSpells.length} found online & saved`
                : `${cachedDbSpells.length} found`;
        }

        if (cachedDbSpells.length === 0) {
            manageSpellsDbResults.innerHTML = `
                <div class="manage-db-empty">
                    <i class="fa-solid fa-book-open"></i>
                    <p>No matching spells found in database or free online sources.</p>
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

        if (q.length >= 2 && manageDbResultsCount) {
            manageDbResultsCount.textContent = "Searching...";
        }

        let dbList: SpellDefinition[] = [];
        let serverResponded = false;
        lastSearchFetchedOnline = false;
        try {
            const res = await getData<{ spells?: any[]; fetchedOnline?: boolean }>(`/search-spells?${params.toString()}`);
            if (Array.isArray(res?.spells)) {
                serverResponded = true;
                lastSearchFetchedOnline = !!res?.fetchedOnline;
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

        // Merge with character's current pull spells and default Darvell spells only if server was unreachable
        if (!serverResponded && dbList.length === 0) {
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
        const anyOtherModalOpen = [
            modalBackdrop,
            itemModalBackdrop,
            actionModalBackdrop,
            customSpellModal,
            conditionsModalBackdrop,
            conditionDetailBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
    }

    // Manage Weapons & Items Modal Logic
    function refreshSheetItemsView() {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        sheet.querySelectorAll<HTMLElement>(".weapons-grid").forEach(grid => {
            grid.innerHTML = renderWeapons(activeCharacter);
        });

        const tabWeaponsCount = sheet.querySelector<HTMLElement>("#tab-weapons-count");
        if (tabWeaponsCount) {
            tabWeaponsCount.textContent = `(${activeCharacter.weapons?.length || 0})`;
        }

        const equipmentGrid = sheet.querySelector<HTMLElement>(".equipment-grid");
        if (equipmentGrid) {
            equipmentGrid.innerHTML = renderEquipment(activeCharacter);
        }

        initWeaponsController(ctx);
        initEquipmentController(ctx);
    }

    function renderManageCurrentItemsPanel() {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !manageItemsCurrentList) return;

        const weapons = activeCharacter.weapons || [];
        const equipment = activeCharacter.equipment || [];
        const totalCount = weapons.length + equipment.length;

        if (manageItemsTotalBadge) {
            manageItemsTotalBadge.textContent = `${totalCount} Items on Sheet`;
        }

        const weaponsHtml = weapons.length > 0
            ? `<ul class="manage-abbrev-spell-list">
                ${weapons.map((w, idx) => {
                const isMagic = isMundaneEquipment(w.name) ? false : !!w.isMagic;
                return `
                    <li class="manage-abbrev-spell-row" data-current-weapon-idx="${idx}">
                        <div class="manage-abbrev-spell-main" data-preview-weapon-name="${encodeURIComponent(w.name)}" title="Click to view weapon details">
                            <span class="manage-abbrev-spell-name">${w.name}</span>
                            <span class="manage-abbrev-spell-meta">${w.category || 'Weapon'} • ${w.damage || '—'}</span>
                            ${isMagic ? '<span class="manage-mini-tag conc">Magic</span>' : ''}
                            ${w.mastery?.unlocked ? `<span class="manage-mini-tag ritual">${w.mastery.name}</span>` : ''}
                        </div>
                        <button type="button" class="manage-remove-spell-btn" data-remove-weapon-name="${encodeURIComponent(w.name)}" title="Remove ${w.name} from character sheet" aria-label="Remove ${w.name}">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </li>
                `;
            }).join("")}
            </ul>`
            : `<div class="manage-empty-level-note">No weapons added yet.</div>`;

        const equipmentHtml = equipment.length > 0
            ? `<ul class="manage-abbrev-spell-list">
                ${equipment.map((e, idx) => {
                const isMagic = isMundaneEquipment(e.name) ? false : !!e.isMagic;
                return `
                    <li class="manage-abbrev-spell-row" data-current-equipment-idx="${idx}">
                        <div class="manage-abbrev-spell-main" data-preview-equipment-name="${encodeURIComponent(e.name)}" data-preview-equipment-type="${encodeURIComponent(e.type || 'Equipment')}" title="Click to view item details">
                            <span class="manage-abbrev-spell-name">${e.name}</span>
                            <span class="manage-abbrev-spell-meta">${e.type || 'Item'}${isMagic && e.rarity && e.rarity !== 'Common' ? ` • ${e.rarity}` : ''}${e.quantity > 1 ? ` ×${e.quantity}` : ''}</span>
                            ${isMagic ? '<span class="manage-mini-tag conc">Magic</span>' : ''}
                            ${e.equipped ? '<span class="manage-mini-tag ritual">Equipped</span>' : ''}
                        </div>
                        <button type="button" class="manage-remove-spell-btn" data-remove-equipment-name="${encodeURIComponent(e.name)}" title="Remove ${e.name} from character sheet" aria-label="Remove ${e.name}">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </li>
                `;
            }).join("")}
            </ul>`
            : `<div class="manage-empty-level-note">No equipment added yet.</div>`;

        manageItemsCurrentList.innerHTML = `
            <div class="manage-level-group">
                <div class="manage-level-header">
                    <span class="manage-level-title"><i class="fa-solid fa-khanda"></i> Weapons (${weapons.length})</span>
                </div>
                ${weaponsHtml}
            </div>
            <div class="manage-level-group">
                <div class="manage-level-header">
                    <span class="manage-level-title"><i class="fa-solid fa-shield"></i> Equipment &amp; Magic Items (${equipment.length})</span>
                </div>
                ${equipmentHtml}
            </div>
        `;

        // Wire remove buttons
        manageItemsCurrentList.querySelectorAll<HTMLButtonElement>(".manage-remove-spell-btn[data-remove-weapon-name]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const encoded = btn.getAttribute("data-remove-weapon-name");
                if (!encoded) return;
                removeItemFromCharacter(decodeURIComponent(encoded), "weapon");
            });
        });

        manageItemsCurrentList.querySelectorAll<HTMLButtonElement>(".manage-remove-spell-btn[data-remove-equipment-name]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const encoded = btn.getAttribute("data-remove-equipment-name");
                if (!encoded) return;
                removeItemFromCharacter(decodeURIComponent(encoded), "equipment");
            });
        });

        // Wire preview clicks
        manageItemsCurrentList.querySelectorAll<HTMLElement>(".manage-abbrev-spell-main[data-preview-weapon-name]").forEach(row => {
            row.addEventListener("click", () => {
                const encoded = row.getAttribute("data-preview-weapon-name");
                if (!encoded) return;
                void openItemModal(encoded, undefined, "Weapon");
            });
        });

        manageItemsCurrentList.querySelectorAll<HTMLElement>(".manage-abbrev-spell-main[data-preview-equipment-name]").forEach(row => {
            row.addEventListener("click", () => {
                const encodedName = row.getAttribute("data-preview-equipment-name");
                const encodedType = row.getAttribute("data-preview-equipment-type");
                if (!encodedName) return;
                void openItemModal(encodedName, undefined, encodedType ? decodeURIComponent(encodedType) : undefined);
            });
        });
    }

    function addItemToCharacter(item: any) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        const itemNameLower = String(item.name || "").toLowerCase();
        const itemCatLower = String(item.category || "").toLowerCase();
        const itemFilterLower = String(item.filterType || "").toLowerCase();
        const isPotionOrOil =
            itemNameLower.includes("potion of") ||
            itemNameLower.includes("oil of") ||
            itemNameLower.startsWith("potion ") ||
            itemNameLower.startsWith("oil ") ||
            itemCatLower.includes("potion") ||
            itemCatLower.includes("oil") ||
            itemFilterLower.includes("potion") ||
            itemFilterLower.includes("oil");

        const isWeapon =
            !isPotionOrOil &&
            (itemFilterLower === "weapon" ||
                itemCatLower.includes("weapon") ||
                (item.damage && item.damage !== "—" && !item.filterType));

        if (isWeapon) {
            if (!activeCharacter.weapons) activeCharacter.weapons = [];
            const exists = activeCharacter.weapons.some(w => w.name.toLowerCase() === item.name.toLowerCase());
            if (!exists) {
                const strScore = activeCharacter.abilities?.find(a => a.abbr === "STR")?.modifier ?? 0;
                const dexScore = activeCharacter.abilities?.find(a => a.abbr === "DEX")?.modifier ?? 0;
                const profBonus = activeCharacter.vitals?.proficiencyBonus ?? 2;
                const props: string[] = Array.isArray(item.properties)
                    ? item.properties
                    : (item.properties ? String(item.properties).split(",").map(p => p.trim()).filter(Boolean) : []);
                const isFinesseOrRanged = props.some(p => p.toLowerCase().includes("finesse") || p.toLowerCase().includes("ranged") || p.toLowerCase().includes("ammunition"));
                const mod = isFinesseOrRanged && dexScore > strScore ? dexScore : strScore;
                const toHit = mod + profBonus;
                const attackBonusStr = toHit >= 0 ? `+${toHit}` : `${toHit}`;

                activeCharacter.weapons.push({
                    id: item.dndBeyondId || item.id,
                    definitionId: item.id,
                    name: item.name,
                    quantity: 1,
                    equipped: true,
                    category: item.category || "Simple Melee",
                    damage: item.damage || "1d6",
                    damageType: item.damageType || (item.damage?.split(" ")?.slice(1)?.join(" ") || "Slashing"),
                    damageDie: item.damageDie || (item.damage?.split(" ")?.[0] || "1d6"),
                    attackBonus: attackBonusStr,
                    toHitModifier: toHit,
                    range: item.range || "Reach 5 ft.",
                    properties: props,
                    isMagic: !!item.isMagic,
                    rarity: item.rarity || "Common",
                    description: item.description,
                    imageUrl: item.imageUrl,
                    mastery: item.mastery ? { name: item.mastery, unlocked: true } : undefined
                });
            }
        }

        if (!activeCharacter.equipment) activeCharacter.equipment = [];
        const equipExists = activeCharacter.equipment.some(e => e.name.toLowerCase() === item.name.toLowerCase());
        if (!equipExists) {
            activeCharacter.equipment.push({
                id: item.dndBeyondId || item.id,
                definitionId: item.id,
                name: item.name,
                quantity: 1,
                equipped: true,
                type: item.category || item.filterType || "Equipment",
                filterType: item.filterType || (isWeapon ? "weapon" : "gear"),
                rarity: item.rarity || "Common",
                isMagic: !!item.isMagic,
                description: item.description,
                imageUrl: item.imageUrl,
                notes: item.notes || (item.weight ? `${item.weight} lb.` : undefined)
            });
        }

        renderManageCurrentItemsPanel();
        renderManageDbItemSearchResults();
        refreshSheetItemsView();
        ctx.syncSheetStats();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function removeItemFromCharacter(itemName: string, preferredType?: "weapon" | "equipment") {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;

        const nameLower = itemName.toLowerCase();
        if (preferredType === "weapon") {
            activeCharacter.weapons = (activeCharacter.weapons || []).filter(w => w.name.toLowerCase() !== nameLower);
            activeCharacter.equipment = (activeCharacter.equipment || []).filter(e => e.name.toLowerCase() !== nameLower || e.filterType !== "weapon");
        } else if (preferredType === "equipment") {
            activeCharacter.equipment = (activeCharacter.equipment || []).filter(e => e.name.toLowerCase() !== nameLower);
            activeCharacter.weapons = (activeCharacter.weapons || []).filter(w => w.name.toLowerCase() !== nameLower);
        } else {
            activeCharacter.weapons = (activeCharacter.weapons || []).filter(w => w.name.toLowerCase() !== nameLower);
            activeCharacter.equipment = (activeCharacter.equipment || []).filter(e => e.name.toLowerCase() !== nameLower);
        }

        renderManageCurrentItemsPanel();
        renderManageDbItemSearchResults();
        refreshSheetItemsView();
        ctx.syncSheetStats();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function renderManageDbItemSearchResults() {
        const activeCharacter = ctx.getCharacter();
        if (!manageItemsDbResults) return;

        const currentNames = new Set([
            ...(activeCharacter?.weapons || []).map(w => w.name.toLowerCase()),
            ...(activeCharacter?.equipment || []).map(e => e.name.toLowerCase())
        ]);

        if (manageItemsResultsCount) {
            manageItemsResultsCount.textContent = lastItemSearchFetchedOnline
                ? `${cachedDbItems.length} found online & saved`
                : `${cachedDbItems.length} found`;
        }

        if (cachedDbItems.length === 0) {
            manageItemsDbResults.innerHTML = `
                <div class="manage-db-empty">
                    <i class="fa-solid fa-box-open"></i>
                    <p>No matching weapons or items found in database or free online sources.</p>
                </div>
            `;
            return;
        }

        manageItemsDbResults.innerHTML = cachedDbItems
            .map((item, idx) => {
                const isAdded = currentNames.has(item.name.toLowerCase());
                const categoryLabel = item.category || item.filterType || "Item";
                const rarityBadge = item.rarity && item.rarity !== "Common" ? item.rarity : "";
                return `
                    <div class="manage-db-spell-card ${isAdded ? 'is-added' : ''}" data-db-item-idx="${idx}">
                        <div class="manage-db-spell-info" data-preview-db-item-idx="${idx}" title="Click to preview item description">
                            <div class="manage-db-spell-title-row">
                                <span class="manage-db-spell-name">${item.name}</span>
                                <span class="manage-db-lvl-pill">${categoryLabel}</span>
                                ${rarityBadge ? `<span class="manage-db-school">${rarityBadge}</span>` : ''}
                            </div>
                            <div class="manage-db-spell-sub">
                                ${item.damage ? `<span><i class="fa-solid fa-khanda"></i> ${item.damage}</span>` : ''}
                                ${item.range ? `<span><i class="fa-solid fa-bullseye"></i> ${item.range}</span>` : ''}
                                ${item.weight ? `<span><i class="fa-solid fa-weight-hanging"></i> ${item.weight} lb.</span>` : ''}
                                ${(!isMundaneEquipment(item.name) && item.isMagic) ? '<span class="manage-mini-tag conc">Magic</span>' : ''}
                                ${item.mastery ? `<span class="manage-mini-tag ritual">${item.mastery}</span>` : ''}
                                ${item.source ? `<span class="manage-db-source">${item.source}</span>` : ''}
                            </div>
                        </div>
                        <button
                            type="button"
                            class="manage-db-action-btn ${isAdded ? 'added' : 'add'}"
                            data-db-item-action-idx="${idx}"
                            title="${isAdded ? 'Click to remove from character' : 'Add item to character sheet'}"
                        >
                            ${isAdded ? '<i class="fa-solid fa-check"></i> Added' : '<i class="fa-solid fa-plus"></i> Add'}
                        </button>
                    </div>
                `;
            })
            .join("");

        manageItemsDbResults.querySelectorAll<HTMLButtonElement>(".manage-db-action-btn[data-db-item-action-idx]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const idx = Number(btn.getAttribute("data-db-item-action-idx") || "-1");
                const item = cachedDbItems[idx];
                if (!item) return;
                const activeChar = ctx.getCharacter();
                const alreadyAdded = (activeChar?.weapons || []).some(w => w.name.toLowerCase() === item.name.toLowerCase()) ||
                    (activeChar?.equipment || []).some(eq => eq.name.toLowerCase() === item.name.toLowerCase());
                if (alreadyAdded) {
                    removeItemFromCharacter(item.name);
                } else {
                    addItemToCharacter(item);
                }
            });
        });

        manageItemsDbResults.querySelectorAll<HTMLElement>(".manage-db-spell-info[data-preview-db-item-idx]").forEach(info => {
            info.addEventListener("click", () => {
                const idx = Number(info.getAttribute("data-preview-db-item-idx") || "-1");
                const item = cachedDbItems[idx];
                if (!item) return;
                void openItemModal(encodeURIComponent(item.name), item.id, item.category || item.filterType);
            });
        });
    }

    async function fetchDatabaseItemsForManageModal() {
        const q = (manageItemsSearchInput?.value || "").trim();
        const typeVal = manageItemsTypeSelect?.value || "all";

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (typeVal && typeVal !== "all") params.set("type", typeVal);

        if (q.length >= 2 && manageItemsResultsCount) {
            manageItemsResultsCount.textContent = "Searching...";
        }

        let dbList: any[] = [];
        let serverResponded = false;
        lastItemSearchFetchedOnline = false;

        try {
            const res = await getData<{ items?: any[]; fetchedOnline?: boolean }>(`/search-items?${params.toString()}`);
            if (Array.isArray(res?.items)) {
                serverResponded = true;
                lastItemSearchFetchedOnline = !!res?.fetchedOnline;
                dbList = res.items;
            }
        } catch {
            // Fallback to in-memory items if offline / uninitialized DB
        }

        // Fallback to active character's current items if server was unreachable
        if (!serverResponded && dbList.length === 0) {
            const activeCharacter = ctx.getCharacter();
            const fallbackMap = new Map<string, any>();
            (activeCharacter?.weapons || []).forEach(w => {
                fallbackMap.set(w.name.toLowerCase(), {
                    name: w.name,
                    category: w.category,
                    damage: w.damage,
                    range: w.range,
                    properties: Array.isArray(w.properties) ? w.properties.join(", ") : w.properties,
                    filterType: "weapon",
                    rarity: w.rarity,
                    isMagic: w.isMagic,
                    mastery: w.mastery?.name,
                    source: "Character Inventory",
                    description: w.description
                });
            });
            (activeCharacter?.equipment || []).forEach(e => {
                if (!fallbackMap.has(e.name.toLowerCase())) {
                    fallbackMap.set(e.name.toLowerCase(), {
                        name: e.name,
                        category: e.type,
                        filterType: e.filterType || "gear",
                        rarity: e.rarity,
                        isMagic: e.isMagic,
                        source: "Character Inventory",
                        description: e.description
                    });
                }
            });
            dbList = Array.from(fallbackMap.values()).filter(item => {
                if (typeVal !== "all" && item.filterType !== typeVal) return false;
                if (!q) return true;
                const haystack = `${item.name} ${item.category || ''} ${item.source || ''} ${item.description || ''}`.toLowerCase();
                return haystack.includes(q.toLowerCase());
            });
            dbList.sort((a, b) => a.name.localeCompare(b.name));
        }

        cachedDbItems = dbList;
        renderManageDbItemSearchResults();
    }

    async function openManageItemsModal(initialType?: string) {
        if (!manageItemsBackdrop) return;

        if (initialType && manageItemsTypeSelect) {
            manageItemsTypeSelect.value = initialType;
        }

        renderManageCurrentItemsPanel();
        manageItemsBackdrop.classList.remove("hidden");
        manageItemsBackdrop.classList.add("visible");
        manageItemsBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        manageItemsSearchInput?.focus();

        // Ensure current character's weapons and equipment are synced to the database first
        const activeCharacter = ctx.getCharacter();
        if (activeCharacter && ((activeCharacter.weapons?.length || 0) > 0 || (activeCharacter.equipment?.length || 0) > 0)) {
            try {
                await postData("/sync-character-items", {
                    weapons: activeCharacter.weapons,
                    equipment: activeCharacter.equipment
                });
            } catch {
                // Ignore sync errors in offline mode
            }
        }

        await fetchDatabaseItemsForManageModal();
    }

    function closeManageItemsModal() {
        if (!manageItemsBackdrop) return;
        manageItemsBackdrop.classList.remove("visible");
        manageItemsBackdrop.classList.add("hidden");
        manageItemsBackdrop.setAttribute("aria-hidden", "true");
        const anyOtherModalOpen = [
            modalBackdrop,
            itemModalBackdrop,
            actionModalBackdrop,
            customSpellModal,
            conditionsModalBackdrop,
            conditionDetailBackdrop,
            manageSpellsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
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
                ? linkifyConditionAndSpellTags(localSpell!.description, {
                    character: ctx.getCharacter(),
                    entityName: localSpell!.name,
                    sourceName: localSpell!.source
                })
                : "<p><em>Loading spell details...</em></p>";
        }

        if (modalSource) {
            const isDndBeyond = ctx.getCharacter()?.source === "dndbeyond";
            modalSource.innerHTML = hasCharacterPullDefinition
                ? `<strong>Source:</strong> Character Pull (${localSpell?.source || (isDndBeyond ? "D&D Beyond" : "Class")})`
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
                if (modalDescription && independentSpell.description) {
                    modalDescription.innerHTML = linkifyConditionAndSpellTags(independentSpell.description, {
                        character: ctx.getCharacter(),
                        entityName: independentSpell.name,
                        sourceName: independentSpell.source
                    });
                }

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
        const anyOtherModalOpen = [
            itemModalBackdrop,
            actionModalBackdrop,
            customSpellModal,
            conditionsModalBackdrop,
            conditionDetailBackdrop,
            manageSpellsBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
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
        const anyOtherModalOpen = [
            modalBackdrop,
            itemModalBackdrop,
            actionModalBackdrop,
            conditionsModalBackdrop,
            conditionDetailBackdrop,
            manageSpellsBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
    }

    async function openItemModal(itemName: string, itemId?: number | string, itemType?: string) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;
        const decodedName = decodeURIComponent(itemName).trim();
        if (!itemModalBackdrop) return;

        const localWeapon = activeCharacter.weapons?.find(w => w.name.toLowerCase() === decodedName.toLowerCase());
        const localEquipment = activeCharacter.equipment.find(e => e.name.toLowerCase() === decodedName.toLowerCase());

        const displayName = localWeapon?.name || localEquipment?.name || decodedName;
        currentItemModalName = displayName;
        const currentQty = localWeapon ? (localWeapon.quantity ?? 1) : localEquipment ? (localEquipment.quantity ?? 1) : 1;
        if (modalItemQuantityInput) modalItemQuantityInput.value = String(currentQty);
        const isMundane = isMundaneEquipment(displayName);
        const displayType = localWeapon ? localWeapon.category : (localEquipment?.type || itemType || "Equipment");
        const displayRarity = isMundane ? "Common" : (localWeapon?.rarity || localEquipment?.rarity || "Common");
        const isMagic = isMundane ? false : !!(localWeapon?.isMagic || localEquipment?.isMagic);

        if (modalItemName) modalItemName.textContent = displayName;
        if (modalItemType) modalItemType.textContent = displayType;

        if (modalItemBadges) {
            let badges = `<span class="modal-badge school-badge">${displayType}</span>`;
            if (displayRarity && displayRarity !== "Common" && !isMundane) {
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
            const rawLocalHtml = localDesc
                ? (localDesc.startsWith("<") ? localDesc : `<p>${localDesc}</p>`)
                : "<p><em>Loading item details...</em></p>";
            modalItemDescription.innerHTML = linkifyConditionAndSpellTags(rawLocalHtml, {
                character: activeCharacter,
                entityName: displayName,
                sourceName: displayType
            });
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
                    const itemIsMundane = isMundaneEquipment(itemObj.name);
                    const itemIsMagic = itemIsMundane ? false : !!itemObj.isMagic;
                    if (itemObj.rarity && itemObj.rarity !== 'Common' && !itemIsMundane) {
                        badges += `<span class="modal-badge rarity-badge">${itemObj.rarity}</span>`;
                    }
                    if (itemIsMagic) {
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
                    const localIsRich = localDesc && (localDesc.includes("<a ") || localDesc.includes("<button") || localDesc.includes("inline-item-link") || localDesc.length > 50);
                    const sourceTier = String(independentRes.sourceTier || "").toLowerCase();
                    const isGenericFallback = sourceTier.includes("srd") || sourceTier.includes("legacy") || sourceTier.includes("open5e");
                    if (!localIsRich || !isGenericFallback) {
                        const rawItemHtml = itemObj.description.startsWith("<")
                            ? itemObj.description
                            : `<p>${itemObj.description}</p>`;
                        modalItemDescription.innerHTML = linkifyConditionAndSpellTags(rawItemHtml, {
                            character: activeCharacter,
                            entityName: itemObj.name,
                            sourceName: itemObj.category || displayType
                        });
                    }
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
        const anyOtherModalOpen = [
            modalBackdrop,
            actionModalBackdrop,
            customSpellModal,
            conditionsModalBackdrop,
            conditionDetailBackdrop,
            manageSpellsBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
    }

    function openActionModal(actionIndex: number) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !actionModalBackdrop) return;
        const action = activeCharacter.actions?.[actionIndex];
        if (!action) return;

        const renderActionNotesHtml = (rawNotesInput: string): string => {
            const rawNotes = (rawNotesInput || "").trim();
            if (!rawNotes) return "<p>No additional details.</p>";

            const hasHtml = /<[a-z][\s\S]*>/i.test(rawNotes);
            const baseHtml = hasHtml
                ? rawNotes
                : `<p>${rawNotes
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&#39;")
                    .replace(/\n/g, "<br />")}</p>`;

            return linkifyConditionAndSpellTags(baseHtml, {
                character: activeCharacter,
                entityName: action.name
            });
        };

        if (modalActionName) modalActionName.textContent = action.name || "Action";
        if (modalActionType) modalActionType.textContent = action.type || "Action";
        if (modalActionRange) modalActionRange.textContent = action.rangeOrReach || "—";
        if (modalActionHitDc) modalActionHitDc.textContent = action.hitOrDc || "—";
        if (modalActionDamage) {
            modalActionDamage.innerHTML = linkifyConditionAndSpellTags(action.damageOrEffect || "—", {
                character: activeCharacter,
                entityName: action.name
            });
        }
        if (modalActionNotes) {
            modalActionNotes.innerHTML = renderActionNotesHtml(action.notes || "");
        }

        actionModalBackdrop.classList.remove("hidden");
        actionModalBackdrop.classList.add("visible");
        actionModalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        actionModalCloseBtn?.focus();
    }

    function openActionByNameModal(actionNameInput: string) {
        if (!actionModalBackdrop) return;
        const decoded = decodeURIComponent(actionNameInput || "").trim();
        const targetName = decoded.includes(";") ? decoded.split(";")[0].trim() : decoded;
        const activeCharacter = ctx.getCharacter();

        // 1. Check if character has a matching sheet action first
        if (activeCharacter && Array.isArray(activeCharacter.actions)) {
            const needle = targetName.toLowerCase();
            const singularNeedle = needle.endsWith("s") ? needle.slice(0, -1) : needle;
            const matchedIdx = activeCharacter.actions.findIndex(a => {
                const aName = a.name.toLowerCase();
                return (
                    aName === needle ||
                    aName === singularNeedle ||
                    aName === `${needle} action` ||
                    aName === `${singularNeedle} action`
                );
            });
            if (matchedIdx >= 0) {
                openActionModal(matchedIdx);
                return;
            }
        }

        // 2. Otherwise resolve from D&D 5.5 (2024) standard Actions glossary
        const stdAction = findStandardActionDefinition(targetName);
        let displayName = targetName || "Action";
        if (stdAction) {
            const isReactionOrOption =
                stdAction.type.includes("Reaction") ||
                stdAction.type.includes("Option") ||
                stdAction.name.toLowerCase().includes("strike") ||
                (stdAction.name.toLowerCase().includes("attack") && stdAction.name !== "Attack");
            displayName = isReactionOrOption ? stdAction.name : `${stdAction.name} Action`;
        }
        const dndBeyondUrl = stdAction?.url || resolveDndBeyondActionUrl(targetName);

        if (modalActionName) modalActionName.textContent = displayName;
        if (modalActionType) modalActionType.textContent = stdAction?.type || "Action • D&D 5.5 (2024 Rules)";
        if (modalActionRange) modalActionRange.textContent = stdAction?.rangeOrReach || "—";
        if (modalActionHitDc) modalActionHitDc.textContent = stdAction?.hitOrDc || "—";
        if (modalActionDamage) {
            modalActionDamage.innerHTML = linkifyConditionAndSpellTags(stdAction?.damageOrEffect || "—", {
                character: activeCharacter,
                entityName: displayName
            });
        }
        if (modalActionNotes) {
            const descHtml = stdAction?.description
                ? linkifyConditionAndSpellTags(stdAction.description, {
                    character: activeCharacter,
                    entityName: displayName
                })
                : `<p>Standard D&amp;D 5.5 (2024) action rule for <strong>${displayName}</strong>.</p>`;
            const isDndBeyond = activeCharacter?.source === "dndbeyond";
            const externalLinkHtml = isDndBeyond
                ? `<p class="action-modal-external-link-row"><a href="${dndBeyondUrl}" class="inline-rule-link" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-book"></i> View ${displayName} on D&amp;D Beyond</a></p>`
                : "";
            modalActionNotes.innerHTML = `${descHtml}${externalLinkHtml}`;
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
        const anyOtherModalOpen = [
            modalBackdrop,
            itemModalBackdrop,
            conditionDetailBackdrop,
            customSpellModal,
            conditionsModalBackdrop,
            manageSpellsBackdrop,
            manageItemsBackdrop
        ].some(m => m && !m.classList.contains("hidden"));
        if (!anyOtherModalOpen) {
            document.body.style.overflow = "";
        }
    }

    // Attach open/close functions to ctx
    ctx.openSpellModal = openSpellModal;
    ctx.closeSpellModal = closeSpellModal;
    ctx.openCustomSpellModal = openCustomSpellModal;
    ctx.closeCustomSpellModal = closeCustomSpellModal;
    ctx.openManageSpellsModal = openManageSpellsModal;
    ctx.closeManageSpellsModal = closeManageSpellsModal;
    ctx.openManageItemsModal = openManageItemsModal;
    ctx.closeManageItemsModal = closeManageItemsModal;
    ctx.openItemModal = openItemModal;
    ctx.closeItemModal = closeItemModal;
    ctx.openActionModal = openActionModal;
    ctx.closeActionModal = closeActionModal;
    ctx.openConditionsModal = openConditionsModal;
    ctx.closeConditionsModal = closeConditionsModal;
    ctx.openConditionDetailModal = openConditionDetailModal;
    ctx.closeConditionDetailModal = closeConditionDetailModal;

    // Delegated click listener across sheet for [condition], [action], [rules], and [spell] links
    sheet.addEventListener("click", (event) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const ruleLink = target.closest<HTMLAnchorElement>(".inline-rule-link");
        if (ruleLink) {
            event.stopPropagation();
            return;
        }

        const actionBtn = target.closest<HTMLElement>(".inline-action-link[data-action-link]");
        if (actionBtn) {
            event.preventDefault();
            event.stopPropagation();
            const encodedAction = actionBtn.getAttribute("data-action-link");
            if (encodedAction) {
                openActionByNameModal(encodedAction);
            }
            return;
        }

        const conditionBtn = target.closest<HTMLElement>(".inline-condition-link[data-condition-link]");
        if (conditionBtn) {
            event.preventDefault();
            event.stopPropagation();
            const encodedCond = conditionBtn.getAttribute("data-condition-link");
            if (encodedCond) {
                void openConditionDetailModal(encodedCond);
            }
            return;
        }

        const inlineSpellBtn = target.closest<HTMLElement>(".inline-spell-link[data-spell-name]");
        if (inlineSpellBtn) {
            event.preventDefault();
            event.stopPropagation();
            const encodedSpell = inlineSpellBtn.getAttribute("data-spell-name");
            if (encodedSpell) {
                if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                    closeActionModal();
                }
                void openSpellModal(encodedSpell);
            }
            return;
        }

        const inlineItemBtn = target.closest<HTMLElement>(".inline-item-link[data-item-name]");
        if (inlineItemBtn) {
            event.preventDefault();
            event.stopPropagation();
            const encodedItem = inlineItemBtn.getAttribute("data-item-name");
            if (encodedItem) {
                if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                    closeActionModal();
                }
                void openItemModal(encodedItem);
            }
            return;
        }

        // Fallback interceptor for any standard <a> tags with relative D&D Beyond links
        const anchor = target.closest<HTMLAnchorElement>("a[href]");
        if (anchor) {
            const href = anchor.getAttribute("href") || "";
            const itemMatch = href.match(/(?:https?:\/\/(?:www\.)?dndbeyond\.com)?\/(?:equipment|magic-items|weapons|items)\/([^/?#]+)/i);
            if (itemMatch) {
                event.preventDefault();
                event.stopPropagation();
                const slug = itemMatch[1];
                const cleanName = anchor.textContent?.trim() || decodeURIComponent(slug).replace(/^\d+-/, "").replace(/-/g, " ");
                if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                    closeActionModal();
                }
                void openItemModal(cleanName);
                return;
            }
            const spellMatch = href.match(/(?:https?:\/\/(?:www\.)?dndbeyond\.com)?\/spells\/([^/?#]+)/i);
            if (spellMatch) {
                event.preventDefault();
                event.stopPropagation();
                const slug = spellMatch[1];
                const cleanSpell = anchor.textContent?.trim() || decodeURIComponent(slug).replace(/^\d+-/, "").replace(/-/g, " ");
                if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                    closeActionModal();
                }
                void openSpellModal(cleanSpell);
                return;
            }
        }
    });

    conditionDetailCloseBtn?.addEventListener("click", closeConditionDetailModal);
    conditionDetailDoneBtn?.addEventListener("click", closeConditionDetailModal);
    conditionDetailBackdrop?.addEventListener("click", (event) => {
        if (event.target === conditionDetailBackdrop) {
            closeConditionDetailModal();
        }
    });
    conditionDetailToggleActiveBtn?.addEventListener("click", () => {
        if (!activeConditionDetailName) return;
        toggleConditionByName(activeConditionDetailName);
        renderConditionDetailModalContent(activeConditionDetailName);
    });

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

    modalItemQtyDec?.addEventListener("click", (e) => {
        e.preventDefault();
        if (!currentItemModalName) return;
        const current = Number(modalItemQuantityInput?.value || "1");
        const next = Math.max(0, current - 1);
        if (modalItemQuantityInput) modalItemQuantityInput.value = String(next);
        if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, next);
        renderManageCurrentItemsPanel();
    });

    modalItemQtyInc?.addEventListener("click", (e) => {
        e.preventDefault();
        if (!currentItemModalName) return;
        const current = Number(modalItemQuantityInput?.value || "1");
        const next = current + 1;
        if (modalItemQuantityInput) modalItemQuantityInput.value = String(next);
        if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, next);
        renderManageCurrentItemsPanel();
    });

    modalItemQuantityInput?.addEventListener("input", () => {
        if (!currentItemModalName) return;
        const val = parseInt(modalItemQuantityInput.value, 10);
        if (!Number.isNaN(val) && val >= 0) {
            if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, val);
            renderManageCurrentItemsPanel();
        }
    });

    modalItemQuantityInput?.addEventListener("blur", () => {
        if (!currentItemModalName) return;
        if (modalItemQuantityInput.value === "" || isNaN(Number(modalItemQuantityInput.value)) || Number(modalItemQuantityInput.value) < 0) {
            modalItemQuantityInput.value = "0";
            if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, 0);
            renderManageCurrentItemsPanel();
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

    conditionsSearchInput?.addEventListener("input", () => {
        renderConditionsModalContent();
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

    manageItemsCloseBtn?.addEventListener("click", closeManageItemsModal);
    manageItemsDoneBtn?.addEventListener("click", closeManageItemsModal);
    manageItemsBackdrop?.addEventListener("click", (event) => {
        if (event.target === manageItemsBackdrop) {
            closeManageItemsModal();
        }
    });

    manageItemsSearchInput?.addEventListener("input", () => {
        if (manageItemsSearchTimer) clearTimeout(manageItemsSearchTimer);
        manageItemsSearchTimer = setTimeout(() => {
            void fetchDatabaseItemsForManageModal();
        }, 180);
    });

    manageItemsTypeSelect?.addEventListener("change", () => {
        void fetchDatabaseItemsForManageModal();
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
            if (conditionDetailBackdrop && !conditionDetailBackdrop.classList.contains("hidden")) {
                closeConditionDetailModal();
                return;
            }
            if (itemModalBackdrop && !itemModalBackdrop.classList.contains("hidden")) {
                closeItemModal();
                return;
            }
            if (modalBackdrop && !modalBackdrop.classList.contains("hidden")) {
                closeSpellModal();
                return;
            }
            if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                closeActionModal();
                return;
            }
            if (customSpellModal && !customSpellModal.classList.contains("hidden")) {
                closeCustomSpellModal();
                return;
            }
            if (manageItemsBackdrop && !manageItemsBackdrop.classList.contains("hidden")) {
                closeManageItemsModal();
                return;
            }
            if (manageSpellsBackdrop && !manageSpellsBackdrop.classList.contains("hidden")) {
                closeManageSpellsModal();
                return;
            }
            if (conditionsModalBackdrop && !conditionsModalBackdrop.classList.contains("hidden")) {
                closeConditionsModal();
                return;
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
        openManageItemsModal,
        closeManageItemsModal,
        openConditionsModal,
        closeConditionsModal,
        openConditionDetailModal,
        closeConditionDetailModal
    };
}
