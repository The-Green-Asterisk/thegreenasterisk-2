import el from "@elements";
import { canAddPick, getClassSkillSources, getExpertiseSources, getFeatSkillSections } from "../services/skillRules";
import { CharacterCreatorContext } from "./context";

function bindToggle(selector: string, ctx: CharacterCreatorContext, onToggle: (name: string, section: string) => void): void {
    el.list<HTMLElement>(selector).forEach((card) => {
        if (card.classList.contains("locked")) return;
        const toggle = () => {
            // Disabled cards can still be unticked if they're already chosen
            if (card.getAttribute("aria-disabled") === "true" && card.getAttribute("aria-checked") !== "true") return;
            const name = card.getAttribute("data-skill-name") || "";
            const section = card.getAttribute("data-feat-section") || "";
            onToggle(name, section);
            ctx.skillsWarningDismissed = false;
            ctx.hideAlert();
            ctx.renderStep(6);
            // Keep keyboard focus on the same card after re-rendering
            Array.from(el.list<HTMLElement>(selector))
                .find((c) => c.getAttribute("data-skill-name") === name && (c.getAttribute("data-feat-section") || "") === section)
                ?.focus();
        };
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle();
            }
        });
    });
}

export function initSkillsController(ctx: CharacterCreatorContext): void {
    bindToggle(".class-skill-card", ctx, (name) => {
        if (ctx.state.classSkills.includes(name)) {
            ctx.state.classSkills = ctx.state.classSkills.filter((s) => s !== name);
        } else if (canAddPick(ctx.state.classSkills, name, getClassSkillSources(ctx))) {
            ctx.state.classSkills = [...ctx.state.classSkills, name];
        }
    });

    bindToggle(".feat-skill-card", ctx, (name, key) => {
        const sec = getFeatSkillSections(ctx).find((s) => s.key === key);
        if (!sec) return;
        ctx.state.featSkillChoices = ctx.state.featSkillChoices || {};
        const chosen = ctx.state.featSkillChoices[key] || [];
        if (chosen.includes(name)) {
            ctx.state.featSkillChoices[key] = chosen.filter((s) => s !== name);
        } else if (chosen.length < sec.count) {
            ctx.state.featSkillChoices[key] = [...chosen, name];
        } else if (sec.count === 1) {
            ctx.state.featSkillChoices[key] = [name];
        }
    });

    bindToggle(".expertise-skill-card", ctx, (name) => {
        if (ctx.state.expertiseSkills.includes(name)) {
            ctx.state.expertiseSkills = ctx.state.expertiseSkills.filter((s) => s !== name);
        } else if (canAddPick(ctx.state.expertiseSkills, name, getExpertiseSources(ctx))) {
            ctx.state.expertiseSkills = [...ctx.state.expertiseSkills, name];
        }
    });
}
