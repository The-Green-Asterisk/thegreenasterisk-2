import { CharacterSheetContext } from "./context";

export function initFeaturesController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // "Click for more details" on long features opens the full text
    ctx.sheet.querySelectorAll<HTMLButtonElement>(".feature-more-btn[data-feature-index]").forEach(btn => {
        btn.addEventListener("click", () => ctx.openFeatureModal(Number(btn.getAttribute("data-feature-index"))));
    });

    // Wire feature decision dropdowns
    const decisionSelects = ctx.sheet.querySelectorAll<HTMLSelectElement>(
        ".feature-decision-select[data-feature-decision-id]"
    );
    decisionSelects.forEach(selectEl => {
        selectEl.addEventListener("click", e => {
            e.stopPropagation();
        });

        selectEl.addEventListener("change", e => {
            e.stopPropagation();
            const decisionId = selectEl.getAttribute("data-feature-decision-id");
            if (!decisionId) return;
            ctx.applyFeatureDecisionChange(decisionId, selectEl.value);
        });
    });
}
