import el from "@elements";
import { CharacterSheetContext } from "./context";

export function initActionsController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // Action cards click for full details modal
    const actionCards = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-action-card");
    actionCards.forEach(card => {
        const actionIndex = Number(card.getAttribute("data-action-index"));
        if (Number.isNaN(actionIndex)) return;

        card.addEventListener("click", () => {
            card.querySelector<HTMLElement>(".card-open-btn")?.focus({ preventScroll: true });
            ctx.openActionModal(actionIndex);
        }, { signal: el.signal });
    });

    // Action spell links
    ctx.sheet.querySelectorAll<HTMLElement>(".action-spell-link[data-spell-name]").forEach(elBtn => {
        const spellName = elBtn.getAttribute("data-spell-name");
        if (spellName) {
            elBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                void ctx.openSpellModal(spellName);
            }, { signal: el.signal });
        }
    });
}
