import { CharacterSheetContext } from "./context";

export function initFeaturesController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // Feature cards can be inspected or interacted with
    const featureCards = ctx.sheet.querySelectorAll<HTMLElement>(".feature-card");
    featureCards.forEach(card => {
        card.addEventListener("click", () => {
            // Optional expanded view or card highlight if needed
        });
    });
}
