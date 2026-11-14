import el from "@elements";
import { CharacterSheetContext } from "./context";
import { renderEquipment } from "../components/equipment";
import { formatWeightLb, roundWeightLb } from "../../../rules/dnd5e_2024/itemWeightsAndContainers";
import {
    ensureInventoryItemsSynced,
    getCharacterWeightSummary,
    getContainerSummary,
    getInventoryKey,
    setItemEquippedWithContainerUnstow,
    stowItem
} from "../services/inventoryContainers";

function updateInventoryWeightsInPlace(ctx: CharacterSheetContext): void {
    const character = ctx.getCharacter();
    if (!character) return;
    ensureInventoryItemsSynced(character);
    const weightSummary = getCharacterWeightSummary(character);

    const banner = ctx.sheet.querySelector<HTMLElement>(".inventory-weight-banner");
    if (banner) {
        banner.classList.toggle("is-encumbered", weightSummary.isEncumbered);
        const carriedEl = banner.querySelector<HTMLElement>(".carried-weight-value");
        if (carriedEl) carriedEl.textContent = weightSummary.carriedFormatted;
        const existingWarn = banner.querySelector<HTMLElement>(".weight-warning-badge");
        if (weightSummary.isEncumbered) {
            const over = formatWeightLb(roundWeightLb(Math.max(0, weightSummary.carriedWeight - weightSummary.carryingCapacity)));
            const text = ` Over Carrying Capacity (+${over})`;
            if (existingWarn) {
                existingWarn.innerHTML = `<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>${text}`;
            } else {
                const warn = document.createElement("span");
                warn.className = "weight-warning-badge";
                warn.setAttribute("role", "status");
                warn.innerHTML = `<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>${text}`;
                banner.appendChild(warn);
            }
        } else {
            existingWarn?.remove();
        }
    }

    const equipment = character.equipment || [];
    ctx.sheet.querySelectorAll<HTMLElement>(".equipment-grid .equipment-row[data-item-key]").forEach(row => {
        const key = row.getAttribute("data-item-key") || "";
        const item = equipment.find((eq, idx) => getInventoryKey(eq, equipment, idx) === key);
        if (!item) return;

        const weightBadge = row.querySelector<HTMLElement>(".item-weight-badge");
        if (item.isContainer) {
            const summary = getContainerSummary(character, key);
            if (!summary) return;
            row.classList.toggle("is-over-capacity", summary.isOverCapacity);
            row.closest(".equipment-container-group")?.classList.toggle("is-over-capacity", summary.isOverCapacity);
            const capacityBadge = row.querySelector<HTMLElement>(".container-capacity-badge");
            if (summary.extradimensional) {
                if (weightBadge) {
                    weightBadge.classList.remove("over-capacity");
                    weightBadge.textContent = formatWeightLb(summary.ownWeight);
                }
                if (capacityBadge) {
                    capacityBadge.classList.toggle("over-capacity", summary.isOverCapacity);
                    capacityBadge.textContent = summary.capacityWeight !== null
                        ? `${formatWeightLb(summary.contentsWeight)} / ${formatWeightLb(summary.capacityWeight)}`
                        : `${formatWeightLb(summary.contentsWeight)} inside`;
                }
            } else if (weightBadge) {
                weightBadge.classList.toggle("over-capacity", summary.isOverCapacity);
                weightBadge.textContent = summary.capacityWeight !== null
                    ? `${formatWeightLb(summary.totalWeight)} / ${formatWeightLb(summary.capacityWeight)}`
                    : formatWeightLb(summary.totalWeight);
            }
            const countBadge = row.querySelector<HTMLElement>(".container-count-badge");
            if (countBadge) {
                countBadge.textContent = `${summary.totalQuantity} ${summary.totalQuantity === 1 ? "item" : "items"}`;
            }
            const existingRowWarn = row.querySelector<HTMLElement>(".weight-warning-badge");
            if (summary.isOverCapacity && !existingRowWarn) {
                const warn = document.createElement("span");
                warn.className = "item-badge weight-warning-badge";
                warn.setAttribute("role", "status");
                warn.setAttribute("title", "Container exceeds its weight capacity");
                warn.innerHTML = `<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Over capacity`;
                (capacityBadge ?? weightBadge)?.after(warn);
            } else if (!summary.isOverCapacity && existingRowWarn) {
                existingRowWarn.remove();
            }
        } else if (weightBadge) {
            const qty = typeof item.quantity === "number" && Number.isFinite(item.quantity) ? item.quantity : 1;
            const unitW = typeof item.weight === "number" && Number.isFinite(item.weight) ? roundWeightLb(item.weight) : 0;
            weightBadge.textContent = formatWeightLb(roundWeightLb(unitW * qty));
        }
    });
}

export function refreshEquipmentGrid(ctx: CharacterSheetContext): void {
    const character = ctx.getCharacter();
    if (!character) return;
    const grid = ctx.sheet.querySelector<HTMLElement>(".equipment-grid");
    if (!grid) return;
    grid.innerHTML = renderEquipment(character);
    bindEquipmentGridHandlers(ctx);
}

export function initEquipmentController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // Open Manage Weapons/Items modal (header buttons live outside .equipment-grid)
    const openManageEquipmentBtn = ctx.sheet.querySelector<HTMLButtonElement>("#open-manage-equipment-btn");
    if (openManageEquipmentBtn && openManageEquipmentBtn.dataset.bound !== "1") {
        openManageEquipmentBtn.dataset.bound = "1";
        openManageEquipmentBtn.addEventListener("click", () => {
            void ctx.openManageItemsModal("all");
        }, { signal: el.signal });
    }

    const openCustomMagicItemBtn = ctx.sheet.querySelector<HTMLButtonElement>("#open-custom-magic-item-btn");
    if (openCustomMagicItemBtn && openCustomMagicItemBtn.dataset.bound !== "1") {
        openCustomMagicItemBtn.dataset.bound = "1";
        openCustomMagicItemBtn.addEventListener("click", () => {
            ctx.openCustomItemModal("magic-item");
        }, { signal: el.signal });
    }

    bindEquipmentGridHandlers(ctx);
}

export function bindEquipmentGridHandlers(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;
    const gridScope = ctx.sheet.querySelector<HTMLElement>(".equipment-grid") || ctx.sheet;

    // Equipment / Magic items click to open modal
    const itemRows = gridScope.querySelectorAll<HTMLElement>(".clickable-item-card");
    itemRows.forEach(row => {
        const itemName = row.getAttribute("data-item-name");
        const itemId = row.getAttribute("data-item-id");
        const itemType = row.getAttribute("data-item-type");
        if (!itemName) return;

        row.addEventListener("click", () => {
            row.querySelector<HTMLElement>(".card-open-btn")?.focus({ preventScroll: true });
            void ctx.openItemModal(itemName, itemId || undefined, itemType || undefined);
        }, { signal: el.signal });
    });

    // Container collapse/expand toggle buttons
    const collapseButtons = gridScope.querySelectorAll<HTMLButtonElement>(".container-collapse-btn");
    collapseButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const containerKey = btn.getAttribute("data-container-key");
            if (!containerKey) return;

            if (!character.trackingState) character.trackingState = {};
            if (!character.trackingState.collapsedContainers) character.trackingState.collapsedContainers = {};
            const nextCollapsed = !character.trackingState.collapsedContainers[containerKey];
            if (nextCollapsed) {
                character.trackingState.collapsedContainers[containerKey] = true;
            } else {
                delete character.trackingState.collapsedContainers[containerKey];
            }

            refreshEquipmentGrid(ctx);
            const restored = Array.from(ctx.sheet.querySelectorAll<HTMLButtonElement>(".container-collapse-btn"))
                .find(candidate => candidate.getAttribute("data-container-key") === containerKey);
            restored?.focus({ preventScroll: true });
            ctx.sheet.dispatchEvent(new CustomEvent("tga:inventory-changed"));
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Container stow/unstow selects
    const containerSelects = gridScope.querySelectorAll<HTMLSelectElement>(".item-container-select");
    containerSelects.forEach(select => {
        select.addEventListener("click", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        select.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        select.addEventListener("change", (e) => {
            e.stopPropagation();
            const itemKey = select.getAttribute("data-item-key") || "";
            const encodedItemName = select.getAttribute("data-item-name") || "";
            if (!itemKey) return;

            const equipment = character.equipment || [];
            const targetItem = equipment.find((eq, idx) => getInventoryKey(eq, equipment, idx) === itemKey);
            const wasEquipped = Boolean(targetItem?.equipped);
            const isWeaponTwin = Boolean(targetItem && String(targetItem.filterType || targetItem.type || "").toLowerCase() === "weapon");
            const rawItemId = targetItem ? String(targetItem.definitionId || targetItem.id || "") : "";
            const targetContainerKey = select.value || null;

            if (!stowItem(character, itemKey, targetContainerKey)) return;

            if (targetContainerKey && wasEquipped && encodedItemName) {
                void ctx.persistEquipState("item", encodedItemName, rawItemId || null, false);
                if (isWeaponTwin) {
                    void ctx.persistEquipState("weapon", encodedItemName, rawItemId || null, false);
                }
            }

            refreshEquipmentGrid(ctx);
            ctx.syncSheetStats();
            const restored = Array.from(ctx.sheet.querySelectorAll<HTMLSelectElement>(".item-container-select"))
                .find(candidate => candidate.getAttribute("data-item-key") === itemKey);
            restored?.focus({ preventScroll: true });
            ctx.sheet.dispatchEvent(new CustomEvent("tga:inventory-changed"));
        }, { signal: el.signal });
    });

    // Item equip toggle buttons
    const itemEquipButtons = gridScope.querySelectorAll<HTMLButtonElement>('.equip-toggle-btn[data-equip-scope="item"]');
    itemEquipButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const encodedItemName = btn.getAttribute("data-item-name") || "";
            const rawItemId = btn.getAttribute("data-item-id");
            const itemKey = btn.getAttribute("data-item-key") || "";
            if (!encodedItemName) return;
            const itemName = decodeURIComponent(encodedItemName).toLowerCase();
            const nextState = btn.getAttribute("aria-pressed") !== "true";

            const equipment = character.equipment || [];
            let matchedByKey = false;
            let wasStowed = false;
            let isWeaponTwin = false;

            if (itemKey) {
                const exact = equipment.find((eq, idx) => getInventoryKey(eq, equipment, idx) === itemKey);
                if (exact) {
                    matchedByKey = true;
                    if (exact.containerId) wasStowed = true;
                    if (String(exact.filterType || exact.type || "").toLowerCase() === "weapon") isWeaponTwin = true;
                    setItemEquippedWithContainerUnstow(character, exact, nextState);
                }
            }
            if (!matchedByKey) {
                equipment.forEach(item => {
                    if (item.name.toLowerCase() === itemName) {
                        if (item.containerId) wasStowed = true;
                        if (String(item.filterType || item.type || "").toLowerCase() === "weapon") isWeaponTwin = true;
                        setItemEquippedWithContainerUnstow(character, item, nextState);
                    }
                });
            }

            if (wasStowed && nextState) {
                refreshEquipmentGrid(ctx);
                ctx.sheet.dispatchEvent(new CustomEvent("tga:inventory-changed"));
            } else {
                const affectedItemRows = gridScope.querySelectorAll<HTMLElement>(".clickable-item-card");
                affectedItemRows.forEach(row => {
                    const rowKey = row.getAttribute("data-item-key") || "";
                    const rowItemName = decodeURIComponent(row.getAttribute("data-item-name") || "").toLowerCase();
                    if (matchedByKey ? rowKey !== itemKey : rowItemName !== itemName) return;

                    const toggleBtn = row.querySelector<HTMLButtonElement>(".item-badge.equip-toggle-btn");
                    if (toggleBtn) {
                        toggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                        toggleBtn.classList.toggle("equipped", nextState);
                        toggleBtn.classList.toggle("unequipped", !nextState);
                        toggleBtn.textContent = nextState ? "Equipped" : "Unequipped";
                    }
                });
            }

            void ctx.persistEquipState("item", encodedItemName, rawItemId, nextState);
            if (isWeaponTwin) {
                void ctx.persistEquipState("weapon", encodedItemName, rawItemId, nextState);
            }
            ctx.syncSheetStats();
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Item attune toggle buttons
    const itemAttuneButtons = gridScope.querySelectorAll<HTMLButtonElement>('.attune-toggle-btn[data-attune-scope="item"]');
    itemAttuneButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const encodedItemName = btn.getAttribute("data-item-name") || "";
            const rawItemId = btn.getAttribute("data-item-id");
            if (!encodedItemName) return;
            const itemName = decodeURIComponent(encodedItemName).toLowerCase();
            const nextState = btn.getAttribute("aria-pressed") !== "true";

            character.equipment.forEach(item => {
                if (item.name.toLowerCase() === itemName) {
                    item.attuned = nextState;
                }
            });

            const affectedItemRows = gridScope.querySelectorAll<HTMLElement>(".clickable-item-card");
            affectedItemRows.forEach(row => {
                const rowItemName = decodeURIComponent(row.getAttribute("data-item-name") || "").toLowerCase();
                if (rowItemName !== itemName) return;

                const toggleBtn = row.querySelector<HTMLButtonElement>(".item-badge.attune-toggle-btn");
                if (toggleBtn) {
                    toggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                    toggleBtn.classList.toggle("attuned", nextState);
                    toggleBtn.classList.toggle("unattuned", !nextState);
                    toggleBtn.setAttribute("title", `Toggle attunement (Click to ${nextState ? 'unattune' : 'attune'})`);
                    toggleBtn.innerHTML = `<i class="fa-solid ${nextState ? 'fa-link' : 'fa-link-slash'}"></i> ${nextState ? "Attuned" : "Unattuned"}`;
                }
            });

            void ctx.persistEquipState("attunement", encodedItemName, rawItemId, nextState);
            ctx.syncSheetStats();
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Equipment quantity steppers & inputs
    const equipQtySteppers = gridScope.querySelectorAll<HTMLElement>('.equipment-row .item-qty-stepper');
    equipQtySteppers.forEach(stepper => {
        const encodedName = stepper.getAttribute("data-item-name");
        if (!encodedName) return;
        const decodedName = decodeURIComponent(encodedName);

        const input = stepper.querySelector<HTMLInputElement>(".item-qty-input");
        const decBtn = stepper.querySelector<HTMLButtonElement>(".qty-dec");
        const incBtn = stepper.querySelector<HTMLButtonElement>(".qty-inc");

        stepper.addEventListener("click", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        decBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = Number(input?.value || "1");
            const next = Math.max(0, current - 1);
            if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, next, "equipment");
            refreshEquipmentGrid(ctx);
        }, { signal: el.signal });

        incBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = Number(input?.value || "1");
            const next = current + 1;
            if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, next, "equipment");
            refreshEquipmentGrid(ctx);
        }, { signal: el.signal });

        input?.addEventListener("click", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        input?.addEventListener("input", (e) => {
            e.stopPropagation();
            const val = parseInt(input.value, 10);
            if (!Number.isNaN(val) && val >= 0) {
                if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, val, "equipment");
                updateInventoryWeightsInPlace(ctx);
            }
        }, { signal: el.signal });

        input?.addEventListener("change", () => {
            const val = parseInt(input.value, 10);
            if (!Number.isNaN(val) && val >= 0) {
                updateInventoryWeightsInPlace(ctx);
            }
        }, { signal: el.signal });

        input?.addEventListener("blur", () => {
            if (input.value === "" || isNaN(Number(input.value)) || Number(input.value) < 0) {
                input.value = "0";
                if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, 0, "equipment");
            }
            refreshEquipmentGrid(ctx);
        }, { signal: el.signal });
    });
}
