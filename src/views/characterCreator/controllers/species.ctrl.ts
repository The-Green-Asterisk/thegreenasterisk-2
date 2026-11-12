import el from "@elements";
import { AbilityName } from "../../../rules/dnd5e_2024";
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
    el.creatorSpeciesCards.forEach((card) => {
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

    el.creatorLineageCards.forEach((card) => {
        activateOnKey(card);
        card.addEventListener("click", () => {
            ctx.state.lineageId = card.getAttribute("data-lineage-id") || "";
            ctx.renderStep(2);
            ctx.updateLiveSummary();
        });
    });

    const abilitySelect = el.creatorSpeciesSpellAbilitySelect as HTMLSelectElement | null;
    abilitySelect?.addEventListener("change", () => {
        ctx.state.speciesSpellAbility = abilitySelect.value as AbilityName;
        ctx.updateLiveSummary();
    });

    el.creatorSpeciesPickSelects.forEach((select) => {
        select.addEventListener("change", () => {
            const trait = currentSpeciesTraits(ctx).find((t) => traitSlug(t.name) === select.getAttribute("data-trait"));
            if (!trait) return;
            setSpeciesPick(ctx, trait, Number(select.getAttribute("data-index")) || 0, select.value);
            ctx.updateLiveSummary();
        });
    });
}
