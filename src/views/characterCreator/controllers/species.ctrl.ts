import { CharacterCreatorContext } from "./context";

export function initSpeciesController(ctx: CharacterCreatorContext): void {
    document.querySelectorAll(".species-card").forEach((card) => {
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
        card.addEventListener("click", () => {
            ctx.state.lineageId = card.getAttribute("data-lineage-id") || "";
            ctx.renderStep(2);
            ctx.updateLiveSummary();
        });
    });

    const humanSkill = document.getElementById("human-skill-select") as HTMLSelectElement;
    humanSkill?.addEventListener("change", (e) => {
        ctx.state.humanExtraSkill = (e.target as HTMLSelectElement).value;
    });

    const humanFeat = document.getElementById("human-feat-select") as HTMLSelectElement;
    humanFeat?.addEventListener("change", (e) => {
        ctx.state.humanExtraFeatId = (e.target as HTMLSelectElement).value;
        ctx.updateLiveSummary();
    });

    const elfSkill = document.getElementById("elf-skill-select") as HTMLSelectElement;
    elfSkill?.addEventListener("change", (e) => {
        ctx.state.elfKeenSkill = (e.target as HTMLSelectElement).value;
        ctx.updateLiveSummary();
    });
}
