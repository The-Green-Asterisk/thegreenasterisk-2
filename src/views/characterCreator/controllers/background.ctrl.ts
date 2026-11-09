import { AbilityName } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "./context";

export function initBackgroundController(ctx: CharacterCreatorContext): void {
    document.querySelectorAll(".background-card").forEach((card) => {
        card.addEventListener("click", () => {
            const bgId = card.getAttribute("data-background-id") || "";
            ctx.state.backgroundId = bgId;
            const bg = ctx.backgrounds.find((b) => b.id === bgId);
            if (bg) {
                ctx.state.originFeatId = bg.originFeatId;
                ctx.state.bgStatA = bg.allowedAbilities[0];
                ctx.state.bgStatB = bg.allowedAbilities[1];
                ctx.state.bgStatC = bg.allowedAbilities[2] || bg.allowedAbilities[0];
            }
            ctx.sanitizeSpellSelections();
            ctx.renderStep(4);
            ctx.updateLiveSummary();
        });
    });

    document.querySelectorAll("input[name='bg-option']").forEach((radio) => {
        radio.addEventListener("change", (e) => {
            ctx.state.backgroundOption = (e.target as HTMLInputElement).value as any;
            ctx.renderStep(4);
            ctx.updateLiveSummary();
        });
    });

    const statA = document.getElementById("bg-stat-a") as HTMLSelectElement;
    statA?.addEventListener("change", (e) => {
        ctx.state.bgStatA = (e.target as HTMLSelectElement).value as AbilityName;
        ctx.renderStep(4);
        ctx.updateLiveSummary();
    });

    const statB = document.getElementById("bg-stat-b") as HTMLSelectElement;
    statB?.addEventListener("change", (e) => {
        ctx.state.bgStatB = (e.target as HTMLSelectElement).value as AbilityName;
        ctx.renderStep(4);
        ctx.updateLiveSummary();
    });
}
