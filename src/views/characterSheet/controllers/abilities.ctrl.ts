import { CharacterSheetContext } from "./context";

export function initAbilitiesController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // Ability cards are rendered with scores and modifiers.
    // In normal mode, cards can be hovered/interacted with.
    // Card inline editing in edit mode is handled via editModeController.
}
