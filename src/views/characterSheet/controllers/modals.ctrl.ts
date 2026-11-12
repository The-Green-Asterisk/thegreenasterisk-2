import el from "@elements";
import FileService from "@services/fileService";
import { getData, postData, putData } from "@services/request";
import { getSpellcastingModifier, getSpellDamageDisplay, getSpellDamageType, getSpellEffectDisplay, isHealingSpell, replaceModInString, resolveActionSpellDamage } from "../../../services/spellDamage";
import { ConditionDefinition, darvellData, DEFAULT_DND55_CONDITIONS, SpellDefinition } from "../characterData";
import { renderEquipment } from "../components/equipment";
import {
    findStandardActionDefinition,
    linkifyConditionAndSpellTags,
    resolveDndBeyondActionUrl
} from "../components/markupLinks";
import { describePreparedByClass, getCharacterSpellLevelLimits, renderSpellsByLevel, spellLevelLabel } from "../components/spells";
import { restoreUsePips } from "../components/usesTracker";
import { renderWeapons } from "../components/weapons";
import { isMundaneEquipment } from "../services/magicItemBonuses";
import { CharacterSheetContext } from "./context";
import { applySpellEditToCopies, chargesFromDb, databaseId } from "../services/characterCopies";
import { canEditDbEntry, describePropagation, describeRequestError, releaseBodyScrollIfNoDialogOpen, restoreFocusAfterClose, setSelectValue } from "./customContentAccess";
import { customItemKindFor, initCustomItemModals } from "./customItemModals.ctrl";
import { customItemNoun } from "../components/customItemModal";
import { createLockPanel } from "./definitionLockPanel";
import { initDialogFocus } from "./dialogFocus";
import { initEquipmentController } from "./equipment.ctrl";
import { initSpellsController } from "./spells.ctrl";
import { initWeaponsController } from "./weapons.ctrl";

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function initModalsController(ctx: CharacterSheetContext) {
    // Tab stays in an open dialog, and focus returns to its opener when it closes
    initDialogFocus(ctx.sheet);

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
    const modalSpellEditBtn = sheet.querySelector<HTMLButtonElement>("#modal-spell-edit-btn");
    const modalSpellCopyLockBtn = sheet.querySelector<HTMLButtonElement>("#modal-spell-copy-lock-btn");
    let spellModalName = "";
    // The database row behind the open spell, once we know the viewer may edit it
    let spellModalDbSpell: any = null;
    // Bumped on every open, so a slow lookup for a spell that's no longer shown is ignored
    let spellModalToken = 0;

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
    const modalItemEditBtn = sheet.querySelector<HTMLButtonElement>("#modal-item-edit-btn");
    const modalItemCopyLockBtn = sheet.querySelector<HTMLButtonElement>("#modal-item-copy-lock-btn");
    const modalItemEditLabel = sheet.querySelector<HTMLElement>("#modal-item-edit-label");
    let itemModalDbItem: any = null;
    let itemModalToken = 0;

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
    const modalActionMeta = sheet.querySelector<HTMLElement>("#modal-action-meta");
    const modalActionFooterSource = sheet.querySelector<HTMLElement>("#modal-action-footer-source");
    // The control that opened the action/feature dialog, to return focus to when it closes
    let actionModalOpener: HTMLElement | null = null;

    // Custom spell modal elements
    const customSpellModal = sheet.querySelector<HTMLElement>("#custom-spell-modal-container");
    const customSpellCloseBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-close-btn");
    const customSpellCancelBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-cancel-btn");
    const customSpellForm = sheet.querySelector<HTMLFormElement>("#custom-spell-form");
    const customSpellStatus = sheet.querySelector<HTMLElement>("#custom-spell-status");
    const customSpellGuideBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-guide-btn");
    const customSpellImgInput = sheet.querySelector<HTMLInputElement>("#custom-spell-image");
    const customSpellFileInput = sheet.querySelector<HTMLInputElement>("#custom-spell-file-input");
    const customSpellUploadTriggerBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-upload-trigger-btn");
    const customSpellUploadStatus = sheet.querySelector<HTMLElement>("#custom-spell-upload-status");
    const customSpellPreviewWrap = sheet.querySelector<HTMLElement>("#custom-spell-image-preview-wrap");
    const customSpellPreviewImg = sheet.querySelector<HTMLImageElement>("#custom-spell-image-preview");
    const customSpellClearImgBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-image-clear-btn");
    const customSpellHasDamage = sheet.querySelector<HTMLInputElement>("#custom-spell-has-damage");
    const customSpellDamagePanel = sheet.querySelector<HTMLElement>("#custom-spell-damage-panel");
    const customSpellDamageDice = sheet.querySelector<HTMLInputElement>("#custom-spell-damage-dice");
    const customSpellDamageType = sheet.querySelector<HTMLSelectElement>("#custom-spell-damage-type");
    const customSpellDamageMod = sheet.querySelector<HTMLInputElement>("#custom-spell-damage-mod");
    const customSpellAutoscaleBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-autoscale-btn");
    const customSpellResetScalingBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-reset-scaling-btn");
    const customSpellScalingTbody = sheet.querySelector<HTMLElement>("#custom-spell-scaling-tbody");
    const customSpellScalingType = sheet.querySelector<HTMLSelectElement>("#custom-spell-scaling-type");
    const customSpellScalingColHeader = sheet.querySelector<HTMLElement>("#custom-spell-scaling-col-header");
    const customSpellScalingTitle = sheet.querySelector<HTMLElement>("#custom-spell-scaling-title");
    const customSpellScalingHint = sheet.querySelector<HTMLElement>("#custom-spell-scaling-hint");
    const customSpellLevelInput = sheet.querySelector<HTMLInputElement>("#custom-spell-level");
    const customSpellTitle = sheet.querySelector<HTMLElement>("#custom-spell-title");
    const customSpellSubtitle = sheet.querySelector<HTMLElement>("#custom-spell-subtitle");
    const customSpellSubmitBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-submit-btn");
    // The database spell being edited; null while adding a new one
    let editingSpell: any = null;
    let customSpellOpener: HTMLElement | null = null;
    const spellFieldValue = (id: string) => {
        const field = sheet.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#custom-spell-${id}`);
        if (!field) return "";
        return field instanceof HTMLInputElement && field.type === "checkbox" ? String(field.checked) : field.value.trim();
    };
    const spellLockPanel = createLockPanel(sheet.querySelector<HTMLElement>("#custom-spell-locks"), customSpellForm, [
        { key: "name", label: "Name", read: () => spellFieldValue("name") },
        { key: "level", label: "Level", read: () => spellFieldValue("level") },
        { key: "school", label: "School", read: () => spellFieldValue("school") },
        { key: "castingTime", label: "Casting Time", read: () => spellFieldValue("casting-time") },
        { key: "range", label: "Range / Area", read: () => spellFieldValue("range") },
        { key: "duration", label: "Duration", read: () => spellFieldValue("duration") },
        { key: "components", label: "Components", read: () => spellFieldValue("components") },
        { key: "ritual", label: "Ritual", read: () => spellFieldValue("ritual") },
        { key: "concentration", label: "Concentration", read: () => spellFieldValue("concentration") },
        {
            key: "damage", label: "Damage & Scaling", read: () => [
                spellFieldValue("has-damage"), spellFieldValue("damage-dice"), spellFieldValue("damage-type"), spellFieldValue("damage-mod"),
                ...Array.from(customSpellScalingTbody?.querySelectorAll<HTMLInputElement>("input") || []).map(i => i.value.trim())
            ].join("|")
        },
        { key: "description", label: "Description", read: () => spellFieldValue("description") },
        { key: "imageUrl", label: "Illustration", read: () => spellFieldValue("image") }
    ]);

    // Markup / Placeholder guide modal elements
    const markupGuideModal = sheet.querySelector<HTMLElement>("#markup-guide-modal-container");
    const markupGuideCloseBtn = sheet.querySelector<HTMLButtonElement>("#markup-guide-close-btn");
    const markupGuideDoneBtn = sheet.querySelector<HTMLButtonElement>("#markup-guide-done-btn");
    const markupGuideCopyBtn = sheet.querySelector<HTMLButtonElement>("#markup-guide-copy-example-btn");
    const markupGuideExampleText = sheet.querySelector<HTMLElement>("#markup-guide-example-text");

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
    // The database rows behind cachedDbSpells (same order), for editing; empty when the search fell back offline
    let cachedDbSpellRows: any[] = [];
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
                }, { signal: el.signal });
            });

            conditionsModalList.querySelectorAll<HTMLElement>(".condition-modal-card[data-condition-name]").forEach(card => {
                card.addEventListener("click", () => {
                    const condName = card.getAttribute("data-condition-name");
                    if (!condName) return;
                    toggleConditionByName(condName);
                }, { signal: el.signal });
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
                const byClass = limits.byClass.length > 1 ? ` [${describePreparedByClass(limits)}]` : "";
                manageSpellsTotalBadge.textContent = `Cantrips: ${limits.currentCantrips}/${limits.maxCantrips} • Prepared: ${limits.currentPrepared}/${limits.maxPrepared}${byClass} (${activeCharacter.spells.length} Spells on Sheet)`;
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
                                <button type="button" class="manage-abbrev-spell-main" aria-haspopup="dialog" data-preview-spell-name="${encodeURIComponent(s.name)}" title="Click to view spell description">
                                    <span class="manage-abbrev-spell-name">${s.name}</span>
                                    <span class="manage-abbrev-spell-meta">${s.school} • ${s.castingTime}</span>
                                    ${s.concentration ? '<span class="manage-mini-tag conc">C</span>' : ''}
                                    ${s.ritual ? '<span class="manage-mini-tag ritual">R</span>' : ''}
                                </button>
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
            }, { signal: el.signal });
        });

        // Wire preview click on spell name
        manageSpellsCurrentLevels.querySelectorAll<HTMLElement>(".manage-abbrev-spell-main[data-preview-spell-name]").forEach(row => {
            row.addEventListener("click", () => {
                const encoded = row.getAttribute("data-preview-spell-name");
                if (!encoded) return;
                void openSpellModal(encoded);
            }, { signal: el.signal });
        });

        // Wire allowed spell limit step buttons (- / +)
        manageSpellsCurrentLevels.querySelectorAll<HTMLButtonElement>(".manage-limit-step-btn[data-adjust-level]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const lvl = Number(btn.getAttribute("data-adjust-level") || "0");
                const delta = Number(btn.getAttribute("data-adjust-delta") || "0");
                adjustAllowedSpellsForLevel(lvl, delta);
            }, { signal: el.signal });
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
                spellId: spell.spellId,
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
                        ${canEditDbEntry(cachedDbSpellRows[idx]) ? `
                        <button type="button" class="manage-db-edit-btn" data-db-edit-idx="${idx}" aria-haspopup="dialog" aria-label="Edit ${escapeHtml(spell.name)}">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
                        </button>` : ''}
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
            }, { signal: el.signal });
        });

        manageSpellsDbResults.querySelectorAll<HTMLButtonElement>(".manage-db-edit-btn[data-db-edit-idx]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const row = cachedDbSpellRows[Number(btn.getAttribute("data-db-edit-idx") || "-1")];
                if (row) openCustomSpellModal(row);
            }, { signal: el.signal });
        });

        manageSpellsDbResults.querySelectorAll<HTMLElement>(".manage-db-spell-info[data-preview-db-idx]").forEach(info => {
            info.addEventListener("click", () => {
                const idx = Number(info.getAttribute("data-preview-db-idx") || "-1");
                const spell = cachedDbSpells[idx];
                if (!spell) return;
                ctx.spellMap.set(spell.name.toLowerCase(), spell);
                void openSpellModal(encodeURIComponent(spell.name), spell.id);
            }, { signal: el.signal });
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
        cachedDbSpellRows = [];
        let serverResponded = false;
        lastSearchFetchedOnline = false;
        try {
            const res = await getData<{ spells?: any[]; fetchedOnline?: boolean }>(`/search-spells?${params.toString()}`);
            if (Array.isArray(res?.spells)) {
                serverResponded = true;
                lastSearchFetchedOnline = !!res?.fetchedOnline;
                cachedDbSpellRows = res.spells;
                dbList = res.spells.map(s => ({
                    id: s.dndBeyondId || s.id,
                    spellId: databaseId(s.id),
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
        restoreUsePips(sheet, activeCharacter);
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
                        <button type="button" class="manage-abbrev-spell-main" aria-haspopup="dialog" data-preview-weapon-name="${encodeURIComponent(w.name)}" title="Click to view weapon details">
                            <span class="manage-abbrev-spell-name">${w.name}</span>
                            <span class="manage-abbrev-spell-meta">${w.category || 'Weapon'} • ${w.damage || '—'}</span>
                            ${isMagic ? '<span class="manage-mini-tag conc">Magic</span>' : ''}
                            ${w.mastery?.unlocked ? `<span class="manage-mini-tag ritual">${w.mastery.name}</span>` : ''}
                        </button>
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
                        <button type="button" class="manage-abbrev-spell-main" aria-haspopup="dialog" data-preview-equipment-name="${encodeURIComponent(e.name)}" data-preview-equipment-type="${encodeURIComponent(e.type || 'Equipment')}" title="Click to view item details">
                            <span class="manage-abbrev-spell-name">${e.name}</span>
                            <span class="manage-abbrev-spell-meta">${e.type || 'Item'}${isMagic && e.rarity && e.rarity !== 'Common' ? ` • ${e.rarity}` : ''}${e.quantity > 1 ? ` ×${e.quantity}` : ''}</span>
                            ${isMagic ? '<span class="manage-mini-tag conc">Magic</span>' : ''}
                            ${e.equipped ? '<span class="manage-mini-tag ritual">Equipped</span>' : ''}
                        </button>
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
            }, { signal: el.signal });
        });

        manageItemsCurrentList.querySelectorAll<HTMLButtonElement>(".manage-remove-spell-btn[data-remove-equipment-name]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const encoded = btn.getAttribute("data-remove-equipment-name");
                if (!encoded) return;
                removeItemFromCharacter(decodeURIComponent(encoded), "equipment");
            }, { signal: el.signal });
        });

        // Wire preview clicks
        manageItemsCurrentList.querySelectorAll<HTMLElement>(".manage-abbrev-spell-main[data-preview-weapon-name]").forEach(row => {
            row.addEventListener("click", () => {
                const encoded = row.getAttribute("data-preview-weapon-name");
                if (!encoded) return;
                void openItemModal(encoded, undefined, "Weapon");
            }, { signal: el.signal });
        });

        manageItemsCurrentList.querySelectorAll<HTMLElement>(".manage-abbrev-spell-main[data-preview-equipment-name]").forEach(row => {
            row.addEventListener("click", () => {
                const encodedName = row.getAttribute("data-preview-equipment-name");
                const encodedType = row.getAttribute("data-preview-equipment-type");
                if (!encodedName) return;
                void openItemModal(encodedName, undefined, encodedType ? decodeURIComponent(encodedType) : undefined);
            }, { signal: el.signal });
        });
    }

    /** A newly added item's charges, all unspent */
    function newItemCharges(item: any) {
        const charges = chargesFromDb(item.chargesJson);
        return charges ? { ...charges, used: 0 } : undefined;
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
                    itemId: databaseId(item.id),
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
                    charges: newItemCharges(item),
                    mastery: item.mastery ? { name: item.mastery, unlocked: true } : undefined
                });
            }
        }

        if (!activeCharacter.equipment) activeCharacter.equipment = [];
        const equipExists = activeCharacter.equipment.some(e => e.name.toLowerCase() === item.name.toLowerCase());
        if (!equipExists) {
            activeCharacter.equipment.push({
                id: item.dndBeyondId || item.id,
                itemId: databaseId(item.id),
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
                charges: isWeapon ? undefined : newItemCharges(item),
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
                        ${canEditDbEntry(item) ? `
                        <button type="button" class="manage-db-edit-btn" data-db-item-edit-idx="${idx}" aria-haspopup="dialog" aria-label="Edit ${escapeHtml(String(item.name))}">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
                        </button>` : ''}
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
            }, { signal: el.signal });
        });

        manageItemsDbResults.querySelectorAll<HTMLButtonElement>(".manage-db-edit-btn[data-db-item-edit-idx]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const item = cachedDbItems[Number(btn.getAttribute("data-db-item-edit-idx") || "-1")];
                if (item) customItemModals.open(customItemKindFor(item), item);
            }, { signal: el.signal });
        });

        manageItemsDbResults.querySelectorAll<HTMLElement>(".manage-db-spell-info[data-preview-db-item-idx]").forEach(info => {
            info.addEventListener("click", () => {
                const idx = Number(info.getAttribute("data-preview-db-item-idx") || "-1");
                const item = cachedDbItems[idx];
                if (!item) return;
                void openItemModal(encodeURIComponent(item.name), item.id, item.category || item.filterType);
            }, { signal: el.signal });
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

    function refreshManageSpellsIfOpen() {
        if (!manageSpellsBackdrop || manageSpellsBackdrop.classList.contains("hidden")) return;
        renderManageCurrentSpellsPanel();
        void fetchDatabaseSpellsForManageModal();
    }

    /** Copies an edit onto the active sheet's unlocked copies of the spell (the server does every other character) */
    function applySpellEditToCharacter(oldName: string, spell: any) {
        const character = ctx.getCharacter();
        const result = applySpellEditToCopies(character, oldName, spell);
        if (!character || result.updated === 0) return;
        const id = databaseId(spell.id);
        const updatedCopy = character.spells.find(sp => sp.spellId === id);
        ctx.spellMap.delete(oldName.toLowerCase());
        if (updatedCopy) ctx.spellMap.set(updatedCopy.name.toLowerCase(), updatedCopy);
        ctx.renderActiveCharacterView();
        ctx.scheduleDebouncedAutoSave();
    }

    function showCustomSpellStatus(message: string, isError = false) {
        if (!customSpellStatus) return;
        customSpellStatus.textContent = message;
        customSpellStatus.className = `status-msg ${isError ? 'error' : 'success'}`;
        customSpellStatus.classList.remove("hidden");
    }

    /** The open sheet's copies of a spell or item, by name (a spell can appear more than once, e.g. upcast) */
    function characterCopies(kind: "spell" | "item", name: string): Array<{ locked?: boolean }> {
        const character = ctx.getCharacter();
        const key = name.toLowerCase();
        if (!character || !key) return [];
        return kind === "spell"
            ? (character.spells || []).filter(sp => sp.name.toLowerCase() === key)
            : [...(character.weapons || []), ...(character.equipment || [])].filter(i => i.name.toLowerCase() === key);
    }

    function paintCopyLockButton(button: HTMLButtonElement | null, copies: Array<{ locked?: boolean }>) {
        if (!button) return;
        button.classList.toggle("hidden", copies.length === 0);
        const on = copies.length > 0 && copies.every(c => !!c.locked);
        button.setAttribute("aria-pressed", String(on));
        button.classList.toggle("is-locked", on);
        const icon = button.querySelector("i");
        if (icon) icon.className = `fa-solid ${on ? "fa-lock" : "fa-lock-open"}`;
    }

    function toggleCopyLock(kind: "spell" | "item", name: string, button: HTMLButtonElement | null) {
        const copies = characterCopies(kind, name);
        if (copies.length === 0) return;
        const lock = !copies.every(c => !!c.locked);
        copies.forEach(c => {
            if (lock) c.locked = true;
            else delete c.locked;
        });
        paintCopyLockButton(button, copies);
        if (kind === "spell") refreshSheetSpellsView();
        else refreshSheetItemsView();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    function setSpellEditTarget(spell: any) {
        spellModalDbSpell = canEditDbEntry(spell) ? spell : null;
        modalSpellEditBtn?.classList.toggle("hidden", !spellModalDbSpell);
    }

    /** Character-pull spells skip the database fetch, so look the row up separately to learn whether it's editable */
    async function resolveSpellEditTarget(spellName: string, token: number) {
        try {
            const query = new URLSearchParams({ name: spellName, preferRules2024: ctx.prefer2024Rules.value ? "1" : "0" });
            const response = await getData<any>(`/get-spell?${query.toString()}`);
            if (token === spellModalToken) setSpellEditTarget(response?.spell || response);
        } catch {
            // No database row means nothing to edit
        }
    }

    async function openSpellModal(spellName: string, spellId?: number | string) {
        const decodedName = decodeURIComponent(spellName).trim();
        const localSpell = ctx.spellMap.get(decodedName.toLowerCase());
        if (!modalBackdrop) return;
        const token = ++spellModalToken;
        setSpellEditTarget(null);
        spellModalName = localSpell?.name || decodedName;
        paintCopyLockButton(modalSpellCopyLockBtn, characterCopies("spell", spellModalName));

        const displayName = localSpell ? localSpell.name : decodedName;
        const displaySchool = localSpell?.school || "Universal";
        const displayLvl = localSpell ? (localSpell.level === 0 ? "Cantrip" : `Level ${localSpell.level}`) : "Spell";

        if (modalSpellName) modalSpellName.textContent = displayName;
        if (modalSpellType) modalSpellType.textContent = `${displayLvl} • ${displaySchool}`;

        const activeChar = ctx.getCharacter();
        const activeCharLevel = activeChar
            ? (Number(activeChar.level) || (activeChar.classes || []).reduce((sum, c) => sum + (Number(c.level) || 0), 0) || 1)
            : undefined;

        if (modalBadges) {
            let badgesHtml = `<span class="modal-badge school-badge">${displaySchool}</span>`;
            if (localSpell?.source) badgesHtml += `<span class="modal-badge source-badge">${localSpell.source}</span>`;
            const localDamage = localSpell ? getSpellDamageDisplay(localSpell, undefined, activeCharLevel, activeChar) : "";
            if (localDamage) {
                const dmgType = getSpellDamageType(localSpell, localDamage);
                const isHeal = isHealingSpell(localSpell, dmgType || localDamage);
                const typeCls = dmgType ? `damage-type-${dmgType.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : (isHeal ? 'damage-type-healing' : '');
                const icon = isHeal ? 'fa-heart' : 'fa-burst';
                badgesHtml += `<span class="modal-badge damage-badge${typeCls ? ' ' + typeCls : ''}"><i class="fa-solid ${icon}"></i> ${localDamage}</span>`;
            }
            const localEffect = localSpell ? getSpellEffectDisplay(localSpell, undefined, activeCharLevel) : "";
            if (localEffect) {
                badgesHtml += `<span class="modal-badge effect-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> ${localEffect}</span>`;
            }
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
            const syncing = postData("/sync-character-spells", { spells: [localSpell] }).catch(() => { });
            if (el.isAuth) void syncing.then(() => resolveSpellEditTarget(decodedName, token));
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
                    const indDamage = getSpellDamageDisplay(independentSpell, undefined, activeCharLevel, activeChar);
                    if (indDamage) {
                        const dmgType = getSpellDamageType(independentSpell, indDamage);
                        const isHeal = isHealingSpell(independentSpell, dmgType || indDamage);
                        const typeCls = dmgType ? `damage-type-${dmgType.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : (isHeal ? 'damage-type-healing' : '');
                        const icon = isHeal ? 'fa-heart' : 'fa-burst';
                        badges += `<span class="modal-badge damage-badge${typeCls ? ' ' + typeCls : ''}"><i class="fa-solid ${icon}"></i> ${indDamage}</span>`;
                    }
                    const indEffect = getSpellEffectDisplay(independentSpell, undefined, activeCharLevel);
                    if (indEffect) {
                        badges += `<span class="modal-badge effect-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> ${indEffect}</span>`;
                    }
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
                    modalSource.innerHTML = `<strong>Source Tier:</strong> ${escapeHtml(String(spellSourceTier || 'Local Database'))} • <em>${escapeHtml(String(independentSpell.source || 'SRD / Custom'))}</em>`;
                }

                if (token === spellModalToken) setSpellEditTarget(independentSpell);

                // A copy locked on this character keeps its own text
                if (localSpell && !localSpell.locked) {
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

    function updateCustomSpellImagePreview(url: string) {
        const cleanUrl = url.trim();
        if (cleanUrl && customSpellPreviewWrap && customSpellPreviewImg) {
            customSpellPreviewImg.src = cleanUrl;
            customSpellPreviewWrap.classList.remove("hidden");
        } else if (customSpellPreviewWrap && customSpellPreviewImg) {
            customSpellPreviewImg.src = "";
            customSpellPreviewWrap.classList.add("hidden");
        }
    }

    function resetCustomSpellImageState() {
        if (customSpellImgInput) customSpellImgInput.value = "";
        if (customSpellFileInput) customSpellFileInput.value = "";
        updateCustomSpellImagePreview("");
        if (customSpellUploadStatus) {
            customSpellUploadStatus.className = "custom-spell-upload-status hidden";
            customSpellUploadStatus.textContent = "";
        }
    }

    function resetCustomSpellDamageState() {
        if (customSpellHasDamage) customSpellHasDamage.checked = false;
        if (customSpellDamagePanel) customSpellDamagePanel.classList.add("hidden");
        if (customSpellDamageDice) customSpellDamageDice.value = "";
        if (customSpellDamageType) customSpellDamageType.value = "Fire";
        if (customSpellDamageMod) customSpellDamageMod.value = "";
        if (customSpellScalingType) customSpellScalingType.value = "auto";
        if (customSpellScalingTbody) customSpellScalingTbody.innerHTML = "";
    }

    function getOrdinalLevelLabel(n: number): string {
        if (n === 1) return "1st";
        if (n === 2) return "2nd";
        if (n === 3) return "3rd";
        return `${n}th`;
    }

    function computeDamageRowPreview(dice: string, mod: string, damageType: string): string {
        const cleanDice = dice.trim();
        let cleanMod = mod.trim();
        const activeChar = ctx.getCharacter();
        const scMod = activeChar ? getSpellcastingModifier(activeChar) : undefined;
        if (scMod !== undefined) {
            cleanMod = replaceModInString(cleanMod, scMod);
        }
        const formattedMod = cleanMod ? (cleanMod.startsWith("+") || cleanMod.startsWith("-") ? cleanMod : `+${cleanMod}`) : "";
        if (!cleanDice && !formattedMod) return "—";
        const parts = [cleanDice, formattedMod].filter(Boolean).join(" ");
        return `${parts} ${damageType}`.trim();
    }

    function renderCustomSpellScalingRows(options?: { autoScale?: boolean; resetToBase?: boolean }) {
        if (!customSpellScalingTbody) return;

        const level = Math.max(0, Math.min(9, Number(customSpellLevelInput?.value || "0")));
        const baseDice = customSpellDamageDice?.value.trim() || "";
        const baseMod = customSpellDamageMod?.value.trim() || "";
        const damageType = customSpellDamageType?.value || "Fire";
        const scalingMode = customSpellScalingType?.value || "auto";
        const isCharacterScaling = scalingMode === "character" || (scalingMode === "auto" && level === 0);

        if (customSpellScalingColHeader) {
            customSpellScalingColHeader.textContent = isCharacterScaling ? "Character Level" : "Casting Slot Level";
        }
        if (customSpellScalingHint) {
            customSpellScalingHint.textContent = isCharacterScaling
                ? "Damage dice and modifiers scale with total character level at 1st, 5th, 11th, and 17th level (e.g. Acid Splash, Fire Bolt)."
                : "Customize damage dice and modifiers for each slot level at which this spell can be cast.";
        }
        if (customSpellAutoscaleBtn) {
            customSpellAutoscaleBtn.title = isCharacterScaling
                ? "Add +1 die for each higher character level tier (5th, 11th, 17th level)"
                : "Add +1 die for each higher spell slot level";
        }

        const existingValues = new Map<number, { dice: string; mod: string; effect: string }>();
        if (!options?.resetToBase && !options?.autoScale) {
            customSpellScalingTbody.querySelectorAll<HTMLTableRowElement>("tr[data-level]").forEach(tr => {
                const lvl = Number(tr.getAttribute("data-level"));
                const d = tr.querySelector<HTMLInputElement>(".scaling-row-dice")?.value ?? "";
                const m = tr.querySelector<HTMLInputElement>(".scaling-row-mod")?.value ?? "";
                const eff = tr.querySelector<HTMLInputElement>(".scaling-row-effect")?.value ?? "";
                existingValues.set(lvl, { dice: d, mod: m, effect: eff });
            });
        }

        interface LevelTier {
            levelNumber: number;
            label: string;
            step: number;
        }

        const tiers: LevelTier[] = [];
        if (isCharacterScaling) {
            tiers.push({ levelNumber: 1, label: level === 0 ? "Cantrip (Level 1–4)" : "1st Level (Levels 1–4)", step: 0 });
            tiers.push({ levelNumber: 5, label: "5th Level (Levels 5–10)", step: 1 });
            tiers.push({ levelNumber: 11, label: "11th Level (Levels 11–16)", step: 2 });
            tiers.push({ levelNumber: 17, label: "17th Level (Levels 17–20)", step: 3 });
        } else {
            for (let lvl = level; lvl <= 9; lvl++) {
                const isBase = lvl === level;
                const label = isBase ? `${getOrdinalLevelLabel(lvl)} Level (Base)` : `${getOrdinalLevelLabel(lvl)} Level Slot`;
                tiers.push({ levelNumber: lvl, label, step: lvl - level });
            }
        }

        const diceMatch = baseDice.match(/^(\d*)d(\d+)(.*)$/i);
        const parsedBaseCount = diceMatch ? parseInt(diceMatch[1] || "1", 10) : 1;
        const parsedSides = diceMatch ? diceMatch[2] : "";
        const parsedExtra = diceMatch ? diceMatch[3] : "";

        customSpellScalingTbody.innerHTML = tiers.map(tier => {
            let rowDice = baseDice;
            let rowMod = baseMod;
            let rowEffect = "";

            if (options?.autoScale) {
                if (diceMatch && parsedSides) {
                    const scaledCount = parsedBaseCount + tier.step;
                    rowDice = `${scaledCount}d${parsedSides}${parsedExtra}`;
                } else {
                    rowDice = baseDice;
                }
                rowMod = baseMod;
            } else if (options?.resetToBase) {
                rowDice = baseDice;
                rowMod = baseMod;
            } else if (existingValues.has(tier.levelNumber)) {
                const prev = existingValues.get(tier.levelNumber)!;
                rowDice = prev.dice;
                rowMod = prev.mod;
                rowEffect = prev.effect;
            }

            const preview = computeDamageRowPreview(rowDice, rowMod, damageType);

            return `
                <tr data-level="${tier.levelNumber}">
                    <td>
                        <span class="scaling-level-pill">
                            <span class="scaling-level-label">${escapeHtml(tier.label)}</span>
                        </span>
                    </td>
                    <td>
                        <input
                            type="text"
                            class="scaling-table-input scaling-row-dice"
                            aria-label="${escapeHtml(tier.label)} damage dice"
                            data-level="${tier.levelNumber}"
                            placeholder="e.g. 2d8"
                            value="${escapeHtml(rowDice)}"
                            autocomplete="off"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            class="scaling-table-input scaling-row-mod"
                            aria-label="${escapeHtml(tier.label)} modifier"
                            data-level="${tier.levelNumber}"
                            placeholder="e.g. +3 or +MOD"
                            value="${escapeHtml(rowMod)}"
                            autocomplete="off"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            class="scaling-table-input scaling-row-effect"
                            aria-label="${escapeHtml(tier.label)} scaling effect"
                            data-level="${tier.levelNumber}"
                            placeholder="e.g. 2 targets or 15 ft. radius"
                            value="${escapeHtml(rowEffect)}"
                            autocomplete="off"
                        />
                    </td>
                    <td>
                        <span class="scaling-preview-pill">${escapeHtml(preview)}</span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function updateCustomSpellScalingPreviews() {
        if (!customSpellScalingTbody) return;
        const damageType = customSpellDamageType?.value || "Fire";
        customSpellScalingTbody.querySelectorAll<HTMLTableRowElement>("tr[data-level]").forEach(tr => {
            const dice = tr.querySelector<HTMLInputElement>(".scaling-row-dice")?.value || "";
            const mod = tr.querySelector<HTMLInputElement>(".scaling-row-mod")?.value || "";
            const previewEl = tr.querySelector<HTMLElement>(".scaling-preview-pill");
            if (previewEl) {
                previewEl.textContent = computeDamageRowPreview(dice, mod, damageType);
            }
        });
    }

    function setCustomSpellMode(spell: any) {
        if (customSpellTitle) customSpellTitle.textContent = spell ? "Edit Spell" : "Add Custom Spell";
        if (customSpellSubtitle) customSpellSubtitle.textContent = spell
            ? `Update ${spell.name} in the local database`
            : "Save a custom spell to your local database and attach it to your active sheet";
        if (customSpellSubmitBtn) {
            customSpellSubmitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> ${spell ? "Save Changes" : "Save Spell"}`;
        }
    }

    /** The dialog appends its damage table to the description on save; editing starts from the text before it */
    function stripGeneratedDamageBlock(description: string): string {
        const idx = description.indexOf('<div class="spell-damage-scaling-block">');
        return (idx === -1 ? description : description.slice(0, idx)).trim();
    }

    function parseDamageScalingRows(raw: unknown): Array<{ level: number; label: string; dice: string; modifier: string; effect?: string }> {
        let rows: any = raw;
        if (typeof raw === "string") {
            try {
                rows = JSON.parse(raw);
            } catch {
                rows = [];
            }
        }
        return Array.isArray(rows)
            ? rows.map(r => ({ level: Number(r?.level), label: String(r?.label || `Level ${r?.level}`), dice: String(r?.dice || ""), modifier: String(r?.modifier || ""), effect: r?.effect ? String(r.effect) : undefined }))
                .filter(r => Number.isFinite(r.level))
            : [];
    }

    function fillCustomSpellForm(spell: any) {
        const level = Number(spell.level) || 0;
        const setValue = (id: string, value: unknown) => {
            const field = sheet.querySelector<HTMLInputElement | HTMLTextAreaElement>(id);
            if (field) field.value = value === undefined || value === null ? "" : String(value);
        };
        const setChecked = (id: string, checked: boolean) => {
            const box = sheet.querySelector<HTMLInputElement>(id);
            if (box) box.checked = checked;
        };

        setValue("#custom-spell-name", spell.name);
        setValue("#custom-spell-level", level);
        setSelectValue(sheet.querySelector<HTMLSelectElement>("#custom-spell-school"), spell.school || "Evocation");
        setValue("#custom-spell-casting-time", spell.castingTime);
        setValue("#custom-spell-range", spell.range);
        setValue("#custom-spell-duration", spell.duration);
        setValue("#custom-spell-components", spell.components);
        setChecked("#custom-spell-ritual", !!spell.ritual);
        setChecked("#custom-spell-concentration", !!spell.concentration);
        setValue("#custom-spell-description", stripGeneratedDamageBlock(String(spell.description || "")));
        setValue("#custom-spell-image", spell.imageUrl);
        updateCustomSpellImagePreview(spell.imageUrl || "");

        const rows = parseDamageScalingRows(spell.damageScaling);
        const hasDamage = !!spell.damageDice || rows.length > 0;
        if (!hasDamage) return;

        if (customSpellHasDamage) customSpellHasDamage.checked = true;
        customSpellDamagePanel?.classList.remove("hidden");
        if (customSpellDamageDice) customSpellDamageDice.value = spell.damageDice || "";
        setSelectValue(customSpellDamageType, spell.damageType || "Fire");
        if (customSpellDamageMod) customSpellDamageMod.value = spell.damageModifier || "";
        const characterTiers = [1, 5, 11, 17];
        const looksCharacterScaled = level > 0 && rows.length > 0 && rows.every(r => characterTiers.includes(r.level));
        if (customSpellScalingType) customSpellScalingType.value = looksCharacterScaled ? "character" : "auto";

        renderCustomSpellScalingRows({ resetToBase: true });
        rows.forEach(r => {
            const tr = customSpellScalingTbody?.querySelector<HTMLTableRowElement>(`tr[data-level="${r.level}"]`);
            if (!tr) return;
            const dice = tr.querySelector<HTMLInputElement>(".scaling-row-dice");
            const mod = tr.querySelector<HTMLInputElement>(".scaling-row-mod");
            const effect = tr.querySelector<HTMLInputElement>(".scaling-row-effect");
            if (dice) dice.value = r.dice;
            if (mod) mod.value = r.modifier;
            if (effect) effect.value = r.effect || "";
        });
        updateCustomSpellScalingPreviews();
    }

    /** With a database spell, the dialog edits it; without one, it adds a new spell (keeping any unsaved draft) */
    function openCustomSpellModal(spell?: any) {
        if (!customSpellModal) return;
        if (customSpellStatus) {
            customSpellStatus.className = "status-msg hidden";
            customSpellStatus.textContent = "";
        }
        if (spell || editingSpell) {
            customSpellForm?.reset();
            resetCustomSpellImageState();
            resetCustomSpellDamageState();
        }
        customSpellOpener = document.activeElement as HTMLElement | null;
        editingSpell = spell ?? null;
        setCustomSpellMode(editingSpell);
        if (editingSpell) {
            fillCustomSpellForm(editingSpell);
            spellLockPanel.start(editingSpell.lockedFields, !editingSpell.isCustom);
        } else {
            spellLockPanel.stop();
        }
        if (!el.isAuth) showCustomSpellStatus("Log in to save custom spells.", true);
        customSpellModal.classList.remove("hidden");
        customSpellModal.classList.add("visible");
        customSpellModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        sheet.querySelector<HTMLInputElement>("#custom-spell-name")?.focus();
    }

    function closeCustomSpellModal() {
        if (!customSpellModal) return;
        if (markupGuideModal && !markupGuideModal.classList.contains("hidden")) {
            closeMarkupGuideModal();
        }
        resetCustomSpellImageState();
        resetCustomSpellDamageState();
        if (editingSpell) {
            customSpellForm?.reset();
            editingSpell = null;
            setCustomSpellMode(null);
        }
        spellLockPanel.stop();
        customSpellModal.classList.remove("visible");
        customSpellModal.classList.add("hidden");
        customSpellModal.setAttribute("aria-hidden", "true");
        restoreFocusAfterClose(customSpellOpener, sheet);
        customSpellOpener = null;
        const anyOtherModalOpen = [
            modalBackdrop,
            markupGuideModal,
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

    // The Placeholder & Tag Guide button that opened the guide (spell, weapon, or magic item dialog), for focus on close
    let markupGuideOpener: HTMLElement | null = null;

    function openMarkupGuideModal() {
        if (!markupGuideModal) return;
        markupGuideOpener = document.activeElement as HTMLElement | null;
        markupGuideModal.classList.remove("hidden");
        markupGuideModal.classList.add("visible");
        markupGuideModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        markupGuideCloseBtn?.focus();
    }

    function closeMarkupGuideModal() {
        if (!markupGuideModal) return;
        markupGuideModal.classList.remove("visible");
        markupGuideModal.classList.add("hidden");
        markupGuideModal.setAttribute("aria-hidden", "true");
        // The guide opens over the spell, weapon, and magic item dialogs; any of them keeps the page from scrolling
        releaseBodyScrollIfNoDialogOpen(sheet);
        const opener = markupGuideOpener && markupGuideOpener.isConnected ? markupGuideOpener : customSpellGuideBtn;
        markupGuideOpener = null;
        opener?.focus();
    }

    function setItemEditTarget(item: any) {
        itemModalDbItem = canEditDbEntry(item) ? item : null;
        if (itemModalDbItem && modalItemEditLabel) {
            modalItemEditLabel.textContent = `Edit ${customItemNoun(customItemKindFor(itemModalDbItem))}`;
        }
        modalItemEditBtn?.classList.toggle("hidden", !itemModalDbItem);
    }

    async function openItemModal(itemName: string, itemId?: number | string, itemType?: string) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;
        const decodedName = decodeURIComponent(itemName).trim();
        if (!itemModalBackdrop) return;
        const token = ++itemModalToken;
        setItemEditTarget(null);

        const localWeapon = activeCharacter.weapons?.find(w => w.name.toLowerCase() === decodedName.toLowerCase());
        const localEquipment = activeCharacter.equipment.find(e => e.name.toLowerCase() === decodedName.toLowerCase());

        const displayName = localWeapon?.name || localEquipment?.name || decodedName;
        currentItemModalName = displayName;
        paintCopyLockButton(modalItemCopyLockBtn, characterCopies("item", displayName));
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
                    modalItemSource.innerHTML = `<strong>Source Tier:</strong> ${escapeHtml(String(independentRes.sourceTier || 'Local Database'))} • <em>${escapeHtml(String(itemObj.source || 'Standard / SRD'))}</em>`;
                }

                if (token === itemModalToken) setItemEditTarget(itemObj);

                if (localWeapon && finalItemImg && !localWeapon.locked) localWeapon.imageUrl = finalItemImg;
                if (localEquipment && finalItemImg && !localEquipment.locked) localEquipment.imageUrl = finalItemImg;
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
            const resolved = resolveActionSpellDamage(action, activeCharacter);
            const badgeHtml = resolved.isScaled && resolved.scaledTierLabel
                ? ` <span class="action-scaling-badge" title="Scaled for ${resolved.scaledTierLabel}">(${resolved.scaledTierLabel})</span>`
                : "";
            modalActionDamage.innerHTML = linkifyConditionAndSpellTags(resolved.damageOrEffect || "—", {
                character: activeCharacter,
                entityName: action.name
            }) + badgeHtml;
        }
        if (modalActionNotes) {
            modalActionNotes.innerHTML = renderActionNotesHtml(action.notes || "");
        }
        if (modalActionMeta) modalActionMeta.hidden = false;
        if (modalActionFooterSource) modalActionFooterSource.textContent = "Action Details";

        actionModalOpener = document.activeElement as HTMLElement | null;
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

    /** A feature's full text in the details dialog (opened from "Click for more details" on a long feature). */
    function openFeatureModal(featureIndex: number) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !actionModalBackdrop) return;
        const feature = activeCharacter.features?.[featureIndex];
        if (!feature) return;
        if (modalActionName) modalActionName.textContent = feature.name || "Feature";
        if (modalActionType) modalActionType.textContent = [feature.type, feature.source].filter(Boolean).join(" • ") || "Feature";
        if (modalActionMeta) modalActionMeta.hidden = true;
        if (modalActionFooterSource) modalActionFooterSource.textContent = "Feature Details";
        if (modalActionNotes) {
            modalActionNotes.innerHTML = linkifyConditionAndSpellTags(feature.description || "<p>No additional details.</p>", {
                character: activeCharacter,
                entityName: feature.name,
                sourceName: feature.source,
                scaleValue: feature.scaleValue,
                limitedUse: feature.limitedUse
            });
        }
        actionModalOpener = document.activeElement as HTMLElement | null;
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
        if (actionModalOpener && document.contains(actionModalOpener)) actionModalOpener.focus();
        actionModalOpener = null;
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
    ctx.openMarkupGuideModal = openMarkupGuideModal;
    ctx.closeMarkupGuideModal = closeMarkupGuideModal;
    ctx.openManageSpellsModal = openManageSpellsModal;
    ctx.closeManageSpellsModal = closeManageSpellsModal;
    ctx.openManageItemsModal = openManageItemsModal;
    ctx.closeManageItemsModal = closeManageItemsModal;
    ctx.openItemModal = openItemModal;
    ctx.closeItemModal = closeItemModal;
    ctx.openActionModal = openActionModal;
    ctx.closeActionModal = closeActionModal;
    ctx.openFeatureModal = openFeatureModal;
    ctx.openConditionsModal = openConditionsModal;
    ctx.closeConditionsModal = closeConditionsModal;
    ctx.openConditionDetailModal = openConditionDetailModal;
    ctx.closeConditionDetailModal = closeConditionDetailModal;

    const customItemModals = initCustomItemModals(ctx, {
        addItemToCharacter,
        refreshSheetItemsView,
        onSaved: () => {
            if (!manageItemsBackdrop || manageItemsBackdrop.classList.contains("hidden")) return;
            renderManageCurrentItemsPanel();
            void fetchDatabaseItemsForManageModal();
        }
    });
    ctx.openCustomItemModal = customItemModals.open;

    modalSpellCopyLockBtn?.addEventListener("click", () => toggleCopyLock("spell", spellModalName, modalSpellCopyLockBtn), { signal: el.signal });
    modalItemCopyLockBtn?.addEventListener("click", () => toggleCopyLock("item", currentItemModalName, modalItemCopyLockBtn), { signal: el.signal });

    modalSpellEditBtn?.addEventListener("click", () => {
        const spell = spellModalDbSpell;
        if (!spell) return;
        closeSpellModal();
        openCustomSpellModal(spell);
    }, { signal: el.signal });

    modalItemEditBtn?.addEventListener("click", () => {
        const item = itemModalDbItem;
        if (!item) return;
        closeItemModal();
        customItemModals.open(customItemKindFor(item), item);
    }, { signal: el.signal });

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
    }, { signal: el.signal });

    conditionDetailCloseBtn?.addEventListener("click", closeConditionDetailModal, { signal: el.signal });
    conditionDetailDoneBtn?.addEventListener("click", closeConditionDetailModal, { signal: el.signal });
    conditionDetailBackdrop?.addEventListener("click", (event) => {
        if (event.target === conditionDetailBackdrop) {
            closeConditionDetailModal();
        }
    }, { signal: el.signal });
    conditionDetailToggleActiveBtn?.addEventListener("click", () => {
        if (!activeConditionDetailName) return;
        toggleConditionByName(activeConditionDetailName);
        renderConditionDetailModalContent(activeConditionDetailName);
    }, { signal: el.signal });

    // Listeners
    modalCloseBtn?.addEventListener("click", closeSpellModal, { signal: el.signal });
    modalActionCloseBtn?.addEventListener("click", closeSpellModal, { signal: el.signal });
    modalBackdrop?.addEventListener("click", (event) => {
        if (event.target === modalBackdrop) {
            closeSpellModal();
        }
    }, { signal: el.signal });

    itemModalCloseBtn?.addEventListener("click", closeItemModal, { signal: el.signal });
    itemModalCloseActionBtn?.addEventListener("click", closeItemModal, { signal: el.signal });
    itemModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === itemModalBackdrop) {
            closeItemModal();
        }
    }, { signal: el.signal });

    modalItemQtyDec?.addEventListener("click", (e) => {
        e.preventDefault();
        if (!currentItemModalName) return;
        const current = Number(modalItemQuantityInput?.value || "1");
        const next = Math.max(0, current - 1);
        if (modalItemQuantityInput) modalItemQuantityInput.value = String(next);
        if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, next);
        renderManageCurrentItemsPanel();
    }, { signal: el.signal });

    modalItemQtyInc?.addEventListener("click", (e) => {
        e.preventDefault();
        if (!currentItemModalName) return;
        const current = Number(modalItemQuantityInput?.value || "1");
        const next = current + 1;
        if (modalItemQuantityInput) modalItemQuantityInput.value = String(next);
        if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, next);
        renderManageCurrentItemsPanel();
    }, { signal: el.signal });

    modalItemQuantityInput?.addEventListener("input", () => {
        if (!currentItemModalName) return;
        const val = parseInt(modalItemQuantityInput.value, 10);
        if (!Number.isNaN(val) && val >= 0) {
            if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, val);
            renderManageCurrentItemsPanel();
        }
    }, { signal: el.signal });

    modalItemQuantityInput?.addEventListener("blur", () => {
        if (!currentItemModalName) return;
        if (modalItemQuantityInput.value === "" || isNaN(Number(modalItemQuantityInput.value)) || Number(modalItemQuantityInput.value) < 0) {
            modalItemQuantityInput.value = "0";
            if (ctx.setItemQuantity) ctx.setItemQuantity(currentItemModalName, 0);
            renderManageCurrentItemsPanel();
        }
    }, { signal: el.signal });

    actionModalCloseBtn?.addEventListener("click", closeActionModal, { signal: el.signal });
    actionModalCloseActionBtn?.addEventListener("click", closeActionModal, { signal: el.signal });
    actionModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === actionModalBackdrop) {
            closeActionModal();
        }
    }, { signal: el.signal });

    customSpellCloseBtn?.addEventListener("click", closeCustomSpellModal, { signal: el.signal });
    customSpellCancelBtn?.addEventListener("click", closeCustomSpellModal, { signal: el.signal });
    customSpellModal?.addEventListener("click", (event) => {
        if (event.target === customSpellModal) {
            closeCustomSpellModal();
        }
    }, { signal: el.signal });

    customSpellGuideBtn?.addEventListener("click", openMarkupGuideModal, { signal: el.signal });
    markupGuideCloseBtn?.addEventListener("click", closeMarkupGuideModal, { signal: el.signal });
    markupGuideDoneBtn?.addEventListener("click", closeMarkupGuideModal, { signal: el.signal });
    markupGuideModal?.addEventListener("click", (event) => {
        if (event.target === markupGuideModal) {
            closeMarkupGuideModal();
        }
    }, { signal: el.signal });

    markupGuideCopyBtn?.addEventListener("click", async () => {
        const textToCopy = markupGuideExampleText?.textContent || "";
        if (!textToCopy) return;
        try {
            await navigator.clipboard.writeText(textToCopy);
            const originalHtml = markupGuideCopyBtn.innerHTML;
            markupGuideCopyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            markupGuideCopyBtn.classList.add("copied");
            setTimeout(() => {
                markupGuideCopyBtn.innerHTML = originalHtml;
                markupGuideCopyBtn.classList.remove("copied");
            }, 1800);
        } catch {
            const descInput = sheet.querySelector<HTMLTextAreaElement>("#custom-spell-description");
            if (descInput && !descInput.value) {
                descInput.value = textToCopy;
            }
        }
    }, { signal: el.signal });

    customSpellUploadTriggerBtn?.addEventListener("click", () => {
        customSpellFileInput?.click();
    }, { signal: el.signal });

    customSpellFileInput?.addEventListener("change", async () => {
        const file = customSpellFileInput.files?.[0];
        if (!file) return;

        if (!el.isAuth) {
            if (customSpellUploadStatus) {
                customSpellUploadStatus.className = "custom-spell-upload-status is-error";
                customSpellUploadStatus.classList.remove("hidden");
                customSpellUploadStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Log in to upload files directly, or paste an external image URL.';
            }
            return;
        }

        if (customSpellUploadTriggerBtn) customSpellUploadTriggerBtn.disabled = true;
        if (customSpellUploadStatus) {
            customSpellUploadStatus.className = "custom-spell-upload-status is-loading";
            customSpellUploadStatus.classList.remove("hidden");
            customSpellUploadStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading image...';
        }

        try {
            const filePath = await FileService.uploadFile(file, "spells");
            if (customSpellImgInput) {
                customSpellImgInput.value = filePath;
            }
            updateCustomSpellImagePreview(filePath);
            if (customSpellUploadStatus) {
                customSpellUploadStatus.className = "custom-spell-upload-status is-success";
                customSpellUploadStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Image uploaded!';
            }
        } catch (err: any) {
            if (customSpellUploadStatus) {
                customSpellUploadStatus.className = "custom-spell-upload-status is-error";
                customSpellUploadStatus.textContent = err.message || "Failed to upload image.";
            }
        } finally {
            if (customSpellUploadTriggerBtn) customSpellUploadTriggerBtn.disabled = false;
            customSpellFileInput.value = "";
        }
    }, { signal: el.signal });

    customSpellImgInput?.addEventListener("input", () => {
        updateCustomSpellImagePreview(customSpellImgInput.value);
        if (customSpellUploadStatus) {
            customSpellUploadStatus.classList.add("hidden");
            customSpellUploadStatus.textContent = "";
        }
    }, { signal: el.signal });

    customSpellClearImgBtn?.addEventListener("click", () => {
        if (customSpellImgInput) customSpellImgInput.value = "";
        updateCustomSpellImagePreview("");
        if (customSpellUploadStatus) {
            customSpellUploadStatus.classList.add("hidden");
            customSpellUploadStatus.textContent = "";
        }
    }, { signal: el.signal });

    customSpellHasDamage?.addEventListener("change", () => {
        if (customSpellHasDamage.checked) {
            customSpellDamagePanel?.classList.remove("hidden");
            renderCustomSpellScalingRows();
        } else {
            customSpellDamagePanel?.classList.add("hidden");
        }
    }, { signal: el.signal });

    customSpellLevelInput?.addEventListener("change", () => {
        if (customSpellHasDamage?.checked) {
            renderCustomSpellScalingRows();
        }
    }, { signal: el.signal });

    customSpellScalingType?.addEventListener("change", () => {
        if (customSpellHasDamage?.checked) {
            renderCustomSpellScalingRows();
        }
    }, { signal: el.signal });

    customSpellDamageType?.addEventListener("change", () => {
        updateCustomSpellScalingPreviews();
    }, { signal: el.signal });

    customSpellDamageDice?.addEventListener("input", () => {
        const rows = customSpellScalingTbody?.querySelectorAll<HTMLTableRowElement>("tr[data-level]");
        let allEmpty = true;
        rows?.forEach(tr => {
            const d = tr.querySelector<HTMLInputElement>(".scaling-row-dice")?.value.trim();
            if (d) allEmpty = false;
        });
        if (allEmpty) {
            renderCustomSpellScalingRows({ resetToBase: true });
        } else {
            const firstRow = rows?.[0];
            const firstInput = firstRow?.querySelector<HTMLInputElement>(".scaling-row-dice");
            if (firstInput && !firstInput.hasAttribute("data-user-edited")) {
                firstInput.value = customSpellDamageDice.value;
            }
            updateCustomSpellScalingPreviews();
        }
    }, { signal: el.signal });

    customSpellDamageMod?.addEventListener("input", () => {
        const rows = customSpellScalingTbody?.querySelectorAll<HTMLTableRowElement>("tr[data-level]");
        let allEmpty = true;
        rows?.forEach(tr => {
            const m = tr.querySelector<HTMLInputElement>(".scaling-row-mod")?.value.trim();
            if (m) allEmpty = false;
        });
        if (allEmpty) {
            renderCustomSpellScalingRows({ resetToBase: true });
        } else {
            updateCustomSpellScalingPreviews();
        }
    }, { signal: el.signal });

    customSpellAutoscaleBtn?.addEventListener("click", () => {
        renderCustomSpellScalingRows({ autoScale: true });
    }, { signal: el.signal });

    customSpellResetScalingBtn?.addEventListener("click", () => {
        renderCustomSpellScalingRows({ resetToBase: true });
    }, { signal: el.signal });

    customSpellScalingTbody?.addEventListener("input", (e) => {
        const target = e.target as HTMLElement | null;
        if (target && (target.classList.contains("scaling-row-dice") || target.classList.contains("scaling-row-mod"))) {
            target.setAttribute("data-user-edited", "true");
            const tr = target.closest("tr");
            if (tr) {
                const dice = tr.querySelector<HTMLInputElement>(".scaling-row-dice")?.value || "";
                const mod = tr.querySelector<HTMLInputElement>(".scaling-row-mod")?.value || "";
                const previewEl = tr.querySelector<HTMLElement>(".scaling-preview-pill");
                const damageType = customSpellDamageType?.value || "Fire";
                if (previewEl) {
                    previewEl.textContent = computeDamageRowPreview(dice, mod, damageType);
                }
            }
        }
    }, { signal: el.signal });

    conditionsModalCloseBtn?.addEventListener("click", closeConditionsModal, { signal: el.signal });
    conditionsModalDoneBtn?.addEventListener("click", closeConditionsModal, { signal: el.signal });
    conditionsModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === conditionsModalBackdrop) {
            closeConditionsModal();
        }
    }, { signal: el.signal });

    conditionsSearchInput?.addEventListener("input", () => {
        renderConditionsModalContent();
    }, { signal: el.signal });

    manageSpellsCloseBtn?.addEventListener("click", closeManageSpellsModal, { signal: el.signal });
    manageSpellsDoneBtn?.addEventListener("click", closeManageSpellsModal, { signal: el.signal });
    manageSpellsBackdrop?.addEventListener("click", (event) => {
        if (event.target === manageSpellsBackdrop) {
            closeManageSpellsModal();
        }
    }, { signal: el.signal });

    manageSpellsSearchInput?.addEventListener("input", () => {
        if (manageSearchTimer) clearTimeout(manageSearchTimer);
        manageSearchTimer = setTimeout(() => {
            void fetchDatabaseSpellsForManageModal();
        }, 180);
    }, { signal: el.signal });

    manageSpellsLevelSelect?.addEventListener("change", () => {
        void fetchDatabaseSpellsForManageModal();
    }, { signal: el.signal });

    manageItemsCloseBtn?.addEventListener("click", closeManageItemsModal, { signal: el.signal });
    manageItemsDoneBtn?.addEventListener("click", closeManageItemsModal, { signal: el.signal });
    manageItemsBackdrop?.addEventListener("click", (event) => {
        if (event.target === manageItemsBackdrop) {
            closeManageItemsModal();
        }
    }, { signal: el.signal });

    manageItemsSearchInput?.addEventListener("input", () => {
        if (manageItemsSearchTimer) clearTimeout(manageItemsSearchTimer);
        manageItemsSearchTimer = setTimeout(() => {
            void fetchDatabaseItemsForManageModal();
        }, 180);
    }, { signal: el.signal });

    manageItemsTypeSelect?.addEventListener("change", () => {
        void fetchDatabaseItemsForManageModal();
    }, { signal: el.signal });

    exhaustionLevelsRow?.querySelectorAll<HTMLButtonElement>(".exhaustion-lvl-btn[data-exhaustion-level]").forEach(btn => {
        btn.addEventListener("click", () => {
            const lvl = Math.max(0, Math.min(6, Number(btn.getAttribute("data-exhaustion-level") || "0")));
            const { activeSet } = getActiveConditionsState();
            commitConditionsState(activeSet, lvl);
            renderConditionsModalContent();
        }, { signal: el.signal });
    });

    clearAllConditionsBtn?.addEventListener("click", () => {
        commitConditionsState(new Set<string>(), 0);
        renderConditionsModalContent();
    }, { signal: el.signal });

    // Custom spell form submission
    customSpellForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const activeCharacter = ctx.getCharacter();
        const originalSpell = editingSpell;
        if (!el.isAuth) {
            showCustomSpellStatus("Log in to save custom spells.", true);
            return;
        }
        if (!activeCharacter && !originalSpell) {
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

        const imageUrl = customSpellImgInput?.value.trim() || undefined;

        const hasDamage = !!customSpellHasDamage?.checked;
        const baseDamageDice = customSpellDamageDice?.value.trim() || "";
        const damageType = customSpellDamageType?.value || "Fire";
        const baseDamageMod = customSpellDamageMod?.value.trim() || "";

        interface ScalingRowData {
            level: number;
            label: string;
            dice: string;
            modifier: string;
            effect?: string;
        }

        const scalingRows: ScalingRowData[] = [];
        if (hasDamage && customSpellScalingTbody) {
            customSpellScalingTbody.querySelectorAll<HTMLTableRowElement>("tr[data-level]").forEach(tr => {
                const lvl = Number(tr.getAttribute("data-level"));
                const label = tr.querySelector(".scaling-level-label")?.textContent?.trim() || `Level ${lvl}`;
                const dice = tr.querySelector<HTMLInputElement>(".scaling-row-dice")?.value.trim() || "";
                const mod = tr.querySelector<HTMLInputElement>(".scaling-row-mod")?.value.trim() || "";
                const effect = tr.querySelector<HTMLInputElement>(".scaling-row-effect")?.value.trim() || "";
                if (dice || mod || effect) {
                    scalingRows.push({ level: lvl, label, dice, modifier: mod, effect: effect || undefined });
                }
            });
        }

        let combinedDescription = descInput.value.trim();

        const scalingMode = customSpellScalingType?.value || "auto";
        const isCharacterScaling = scalingMode === "character" || (scalingMode === "auto" && Number(levelSelect?.value || "0") === 0);

        // Official spells an admin edits keep their own text; only homebrew gets the generated damage table
        const appendDamageTable = !originalSpell || !!originalSpell.isCustom
            || String(originalSpell.description || "").includes('<div class="spell-damage-scaling-block">');

        if (appendDamageTable && hasDamage && (baseDamageDice || scalingRows.length > 0)) {
            const hasAnyEffects = scalingRows.some(r => !!r.effect);
            const baseModStr = baseDamageMod ? (baseDamageMod.startsWith("+") || baseDamageMod.startsWith("-") ? ` ${baseDamageMod}` : ` +${baseDamageMod}`) : "";
            const baseTotalStr = baseDamageDice ? `${baseDamageDice}${baseModStr} ${damageType}` : (hasAnyEffects ? 'Scaling Effect' : damageType);
            const colHeader = isCharacterScaling ? "Character Level" : "Casting Level";
            const isHeal = isHealingSpell({ damageType }, damageType);
            const typeCls = damageType ? `damage-type-${damageType.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : (isHeal ? 'damage-type-healing' : '');
            const icon = isHeal ? 'fa-heart' : (baseDamageDice ? 'fa-burst' : 'fa-wand-magic-sparkles');
            const label = isHeal ? 'Healing' : (baseDamageDice ? 'Damage' : 'Scaling');

            const tableRowsHtml = scalingRows.map(r => {
                const formattedMod = r.modifier ? (r.modifier.startsWith("+") || r.modifier.startsWith("-") ? r.modifier : `+${r.modifier}`) : "—";
                const totalText = r.dice ? `${r.dice}${r.modifier ? (r.modifier.startsWith("+") || r.modifier.startsWith("-") ? ` ${r.modifier}` : ` +${r.modifier}`) : ""} ${damageType}`.trim() : (r.effect ? r.effect : "—");
                const effectCell = hasAnyEffects ? `<td>${escapeHtml(r.effect || "—")}</td>` : "";
                return `<tr><td><strong>${escapeHtml(r.label)}</strong></td><td>${escapeHtml(r.dice || "—")}</td><td>${escapeHtml(formattedMod)}</td>${effectCell}<td><span class="damage-total-badge${typeCls ? ' ' + typeCls : ''}">${escapeHtml(totalText)}</span></td></tr>`;
            }).join("");

            const damageBlockHtml = `
<div class="spell-damage-scaling-block">
    <div class="spell-damage-summary-badge${typeCls ? ' ' + typeCls : ''}">
        <i class="fa-solid ${icon}"></i> <strong>${label}:</strong> ${escapeHtml(baseTotalStr)}
    </div>
    <div class="spell-scaling-table-container">
        <table class="spell-scaling-table">
            <thead>
                <tr>
                    <th>${escapeHtml(colHeader)}</th>
                    <th>${isHeal ? 'Healing Dice' : 'Damage Dice'}</th>
                    <th>Modifier</th>
                    ${hasAnyEffects ? '<th>Scaling Effect</th>' : ''}
                    <th>${isHeal ? 'Total Healing' : 'Total Damage'}</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHtml}
            </tbody>
        </table>
    </div>
</div>`.trim();

            combinedDescription = `${combinedDescription}\n\n${damageBlockHtml}`;
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
            description: combinedDescription,
            imageUrl,
            source: "Custom Homebrew",
            sourceTier: "Custom Database",
            damageDice: baseDamageDice || undefined,
            damageType: hasDamage ? damageType : undefined,
            damageModifier: baseDamageMod || undefined,
            damageScaling: scalingRows.length > 0 ? scalingRows : undefined
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
        }
        showCustomSpellStatus("Saving spell to local database...");

        try {
            if (originalSpell) {
                const updated = await putData<any>("/edit-custom-spell", { ...spellPayload, id: originalSpell.id, lockedFields: spellLockPanel.locks() });
                applySpellEditToCharacter(originalSpell.name, updated);
                refreshManageSpellsIfOpen();
                showCustomSpellStatus(`Spell "${updated.name}" updated.${describePropagation(updated.propagation)}`);
                setTimeout(() => closeCustomSpellModal(), 800);
                return;
            }

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
                imageUrl: spellPayload.imageUrl,
                source: "Custom Homebrew",
                id: savedSpell?.id,
                spellId: databaseId(savedSpell?.id),
                damageDice: baseDamageDice || undefined,
                damageType: hasDamage ? damageType : undefined,
                damageModifier: baseDamageMod || undefined,
                damageScaling: scalingRows.length > 0 ? scalingRows : undefined
            };

            activeCharacter!.spells.unshift(newSpellDef);
            ctx.spellMap.set(newSpellDef.name.toLowerCase(), newSpellDef);
            ctx.renderActiveCharacterView();

            setTimeout(() => {
                closeCustomSpellModal();
                customSpellForm.reset();
                resetCustomSpellImageState();
                resetCustomSpellDamageState();
            }, 800);
        } catch (error: any) {
            console.error("Failed to save custom spell:", error);
            showCustomSpellStatus(`Could not save spell: ${describeRequestError(error)}`, true);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            setCustomSpellMode(editingSpell);
        }
    }, { signal: el.signal });

    // Global escape key handler
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (markupGuideModal && !markupGuideModal.classList.contains("hidden")) {
                closeMarkupGuideModal();
                return;
            }
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
    }, { signal: el.signal });

    return {
        openSpellModal,
        closeSpellModal,
        openItemModal,
        closeItemModal,
        openActionModal,
        closeActionModal,
        openCustomSpellModal,
        closeCustomSpellModal,
        openMarkupGuideModal,
        closeMarkupGuideModal,
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
