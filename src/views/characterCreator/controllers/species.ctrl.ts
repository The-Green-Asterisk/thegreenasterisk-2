import { currentSpeciesTraits, setSpeciesPick, traitSlug } from "../services/speciesChoices";
import { CharacterCreatorContext } from "./context";

/** Enter or Space activates a card, like a click. */
function activateOnKey(card: Element): void {
    card.addEventListener("keydown", (e) => {
        const key = (e as KeyboardEvent).key;
        if (key === "Enter" || key === " ") {
            e.preventDefault();
            (card as HTMLElement).click();
        }
    });
}

export function initSpeciesController(ctx: CharacterCreatorContext): void {
    document.querySelectorAll(".species-card").forEach((card) => {
        activateOnKey(card);
        card.addEventListener("click", () => {
            const spId = card.getAttribute("data-species-id") || "";
            ctx.state.speciesId = spId;
            const sp = ctx.species.find((s) => s.id === spId);
            ctx.state.lineageId = sp?.lineages?.[0]?.id || "";
            ctx.renderStep(2);
            ctx.updateLiveSummary();
        });
    });

    document.querySelectorAll(".lineage-card").forEach((card) => {
        activateOnKey(card);
        card.addEventListener("click", () => {
            ctx.state.lineageId = card.getAttribute("data-lineage-id") || "";
            ctx.renderStep(2);
            ctx.updateLiveSummary();
        });
    });

    document.querySelectorAll<HTMLSelectElement>(".species-pick-select").forEach((select) => {
        select.addEventListener("change", () => {
            const trait = currentSpeciesTraits(ctx).find((t) => traitSlug(t.name) === select.getAttribute("data-trait"));
            if (!trait) return;
            setSpeciesPick(ctx, trait, Number(select.getAttribute("data-index")) || 0, select.value);
            ctx.updateLiveSummary();
        });
    });
}
