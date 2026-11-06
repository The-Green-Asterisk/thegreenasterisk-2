import { renderActiveConditionsListHtml } from "../components/hero";
import { CharacterSheetContext } from "./context";

export function initHeroController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    const inspirationToggle = ctx.sheet.querySelector<HTMLElement>("#inspiration-toggle");
    if (inspirationToggle) {
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

    const activeConditionsBox = ctx.sheet.querySelector<HTMLElement>("#active-conditions-box");
    const heroConditionsList = ctx.sheet.querySelector<HTMLElement>("#hero-active-conditions-list");

    ctx.updateHeroConditionsDisplay = () => {
        const currentChar = ctx.getCharacter();
        if (!currentChar) return;
        const box = ctx.sheet.querySelector<HTMLElement>("#active-conditions-box");
        const listEl = ctx.sheet.querySelector<HTMLElement>("#hero-active-conditions-list");
        if (!listEl) return;
        const html = renderActiveConditionsListHtml(currentChar);
        listEl.innerHTML = html;
        if (box) {
            box.classList.toggle("has-conditions", !html.includes("no-conditions-placeholder"));
        }
    };

    if (activeConditionsBox) {
        activeConditionsBox.addEventListener("click", () => {
            void ctx.openConditionsModal();
        });
        activeConditionsBox.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void ctx.openConditionsModal();
            }
        });
    }

    if (heroConditionsList) {
        ctx.updateHeroConditionsDisplay();
    }
}
