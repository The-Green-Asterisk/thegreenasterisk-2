import { CharacterSheetContext } from "./context";

export function initHeroController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    const inspirationToggle = ctx.sheet.querySelector<HTMLElement>("#inspiration-toggle");
    if (!inspirationToggle) return;

    inspirationToggle.addEventListener("click", () => {
        const nextActive = !inspirationToggle.classList.contains("active");
        inspirationToggle.classList.toggle("active", nextActive);

        character.vitals.heroicInspiration = nextActive;
        if (!character.trackingState) {
            character.trackingState = {};
        }
        character.trackingState.heroicInspiration = nextActive;

        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });
}
