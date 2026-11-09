import { CharacterCreatorContext } from "./context";

export function initSkillsController(ctx: CharacterCreatorContext): void {
    document.querySelectorAll(".skill-checkbox-card:not(.locked)").forEach((card) => {
        card.addEventListener("click", () => {
            const skName = card.getAttribute("data-skill-name") || "";
            const maxCount = ctx.getMaxClassSkillCount();
            if (ctx.state.classSkills.includes(skName)) {
                ctx.state.classSkills = ctx.state.classSkills.filter((s) => s !== skName);
            } else if (ctx.state.classSkills.length < maxCount) {
                ctx.state.classSkills.push(skName);
            }
            ctx.renderStep(6);
        });
    });

    document.querySelectorAll(".expertise-skill-card").forEach((card) => {
        card.addEventListener("click", () => {
            const skName = card.getAttribute("data-skill-name") || "";
            const maxCount = ctx.getMaxExpertiseCount();
            if (ctx.state.expertiseSkills.includes(skName)) {
                ctx.state.expertiseSkills = ctx.state.expertiseSkills.filter((s) => s !== skName);
            } else if (ctx.state.expertiseSkills.length < maxCount) {
                ctx.state.expertiseSkills.push(skName);
            }
            ctx.renderStep(6);
        });
    });
}
