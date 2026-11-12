import el from "@elements";
import { AbilityName } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "./context";

export function initBackgroundController(ctx: CharacterCreatorContext): void {
    el.creatorBackgroundCards.forEach((card) => {
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
        }, { signal: el.signal });
    });

    el.creatorBackgroundOptionInputs.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            ctx.state.backgroundOption = (e.target as HTMLInputElement).value as any;
            ctx.renderStep(4);
            ctx.updateLiveSummary();
        }, { signal: el.signal });
    });

    const statA = el.creatorBackgroundStatA as HTMLSelectElement;
    statA?.addEventListener("change", (e) => {
        ctx.state.bgStatA = (e.target as HTMLSelectElement).value as AbilityName;
        ctx.renderStep(4);
        ctx.updateLiveSummary();
    }, { signal: el.signal });

    const statB = el.creatorBackgroundStatB as HTMLSelectElement;
    statB?.addEventListener("change", (e) => {
        ctx.state.bgStatB = (e.target as HTMLSelectElement).value as AbilityName;
        ctx.renderStep(4);
        ctx.updateLiveSummary();
    }, { signal: el.signal });
}
