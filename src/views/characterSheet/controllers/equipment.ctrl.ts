import el from "@elements";
import { CharacterSheetContext } from "./context";

export function initEquipmentController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // Equipment / Magic items click to open modal
    const itemRows = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-item-card");
    itemRows.forEach(row => {
        const itemName = row.getAttribute("data-item-name");
        const itemId = row.getAttribute("data-item-id");
        const itemType = row.getAttribute("data-item-type");
        if (!itemName) return;

        row.addEventListener("click", () => {
            void ctx.openItemModal(itemName, itemId || undefined, itemType || undefined);
        }, { signal: el.signal });
    });

    // Item equip toggle buttons
    const itemEquipButtons = ctx.sheet.querySelectorAll<HTMLButtonElement>('.equip-toggle-btn[data-equip-scope="item"]');
    itemEquipButtons.forEach(btn => {
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
                    item.equipped = nextState;
                }
            });

            const affectedItemRows = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-item-card");
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

            void ctx.persistEquipState("item", encodedItemName, rawItemId, nextState);
            ctx.syncSheetStats();
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Item attune toggle buttons
    const itemAttuneButtons = ctx.sheet.querySelectorAll<HTMLButtonElement>('.attune-toggle-btn[data-attune-scope="item"]');
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

            const affectedItemRows = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-item-card");
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

    // Open Manage Weapons/Items modal
    const openManageEquipmentBtn = ctx.sheet.querySelector<HTMLButtonElement>("#open-manage-equipment-btn");
    openManageEquipmentBtn?.addEventListener("click", () => {
        void ctx.openManageItemsModal("all");
    }, { signal: el.signal });

    ctx.sheet.querySelector<HTMLButtonElement>("#open-custom-magic-item-btn")?.addEventListener("click", () => {
        ctx.openCustomItemModal("magic-item");
    }, { signal: el.signal });

    // Equipment quantity steppers & inputs
    const equipQtySteppers = ctx.sheet.querySelectorAll<HTMLElement>('.equipment-row .item-qty-stepper');
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
        }, { signal: el.signal });

        incBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = Number(input?.value || "1");
            const next = current + 1;
            if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, next, "equipment");
        }, { signal: el.signal });

        input?.addEventListener("click", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        input?.addEventListener("input", (e) => {
            e.stopPropagation();
            const val = parseInt(input.value, 10);
            if (!Number.isNaN(val) && val >= 0) {
                if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, val, "equipment");
            }
        }, { signal: el.signal });

        input?.addEventListener("blur", () => {
            if (input.value === "" || isNaN(Number(input.value)) || Number(input.value) < 0) {
                input.value = "0";
                if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, 0, "equipment");
            }
        }, { signal: el.signal });
    });
}
