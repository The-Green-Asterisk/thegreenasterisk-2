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
        });
        row.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void ctx.openItemModal(itemName, itemId || undefined, itemType || undefined);
            }
        });
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
        });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        });
    });
}
