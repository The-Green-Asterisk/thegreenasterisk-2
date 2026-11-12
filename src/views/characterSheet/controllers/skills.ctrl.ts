import el from "@elements";
import { renderSkills } from "../components/skills";
import { addCustomSkill, removeCustomSkill } from "../services/customSkills";
import { CharacterSheetContext } from "./context";

export function initSkillsController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    const proficiencyToMultiplier = (value: string): number => {
        if (value === "expertise") return 2;
        if (value === "proficient") return 1;
        return 0;
    };

    const getAbilityModForSkill = (stat: string): number => {
        const normalized = (stat || "").trim().toUpperCase();
        const ability = character.abilities.find(a => {
            const abbr = (a.abbr || "").trim().toUpperCase();
            const namePrefix = (a.name || "").trim().slice(0, 3).toUpperCase();
            return normalized === abbr || normalized === namePrefix;
        });
        return ability?.modifier ?? 0;
    };

    const formatBonus = (bonus: number): string => (bonus >= 0 ? `+${bonus}` : `${bonus}`);

    const applySkillRowClass = (row: HTMLElement, proficiency: string) => {
        row.classList.remove("prof-none", "prof-proficient", "prof-expertise");
        if (proficiency === "expertise") row.classList.add("prof-expertise");
        else if (proficiency === "proficient") row.classList.add("prof-proficient");
        else row.classList.add("prof-none");
    };

    ctx.sheet.querySelectorAll<HTMLSelectElement>(".skill-training-select[data-skill-index]").forEach(select => {
        select.addEventListener("click", (event) => {
            event.stopPropagation();
        }, { signal: el.signal });

        select.addEventListener("change", () => {
            const skillIndex = Number(select.getAttribute("data-skill-index"));
            if (Number.isNaN(skillIndex)) return;
            const skill = character.skills?.[skillIndex];
            if (!skill) return;

            const previous = skill.proficiency || "none";
            const next = (select.value as "none" | "proficient" | "expertise") || "none";

            const profBonus = Number(character.vitals?.proficiencyBonus) || 0;
            const abilityMod = getAbilityModForSkill(skill.stat);
            const oldBaseline = abilityMod + (profBonus * proficiencyToMultiplier(previous));
            const customOffset = (Number(skill.bonus) || 0) - oldBaseline;
            const recomputedBonus = abilityMod + (profBonus * proficiencyToMultiplier(next)) + customOffset;

            skill.proficiency = next;
            skill.bonus = recomputedBonus;

            const row = select.closest<HTMLElement>(".skill-row");
            if (row) {
                applySkillRowClass(row, next);
                const bonusCell = row.querySelector<HTMLElement>(".skill-bonus");
                if (bonusCell) {
                    bonusCell.textContent = formatBonus(recomputedBonus);
                }
            }

            ctx.scheduleDebouncedAutoSave();
        }, { signal: el.signal });
    });

    // Re-renders the table after adding or removing a skill, then puts focus and a message where the player is
    const rerender = (message: string, focusSelector: string) => {
        const container = ctx.sheet.querySelector<HTMLElement>("#tab-skills .skills-container");
        if (!container) return;
        container.innerHTML = renderSkills(character);
        initSkillsController(ctx);
        const status = container.querySelector<HTMLElement>("#custom-skill-status");
        if (status) status.textContent = message;
        container.querySelector<HTMLElement>(focusSelector)?.focus();
        ctx.scheduleDebouncedAutoSave();
    };

    const form = ctx.sheet.querySelector<HTMLFormElement>("#tab-skills .custom-skill-form");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const nameInput = form.querySelector<HTMLInputElement>("#custom-skill-name");
        const abilitySelect = form.querySelector<HTMLSelectElement>("#custom-skill-ability");
        const status = form.querySelector<HTMLElement>("#custom-skill-status");
        const result = addCustomSkill(character, nameInput?.value || "", abilitySelect?.value || "");
        if (typeof result === "string") {
            if (status) status.textContent = result;
            nameInput?.setAttribute("aria-invalid", "true");
            nameInput?.focus();
            return;
        }
        const index = character.skills.indexOf(result);
        rerender(`Added ${result.name} (${result.stat}).`, `.skill-training-select[data-skill-index="${index}"]`);
    }, { signal: el.signal });

    ctx.sheet.querySelectorAll<HTMLButtonElement>("#tab-skills .skill-remove-btn[data-remove-skill]").forEach(button => {
        button.addEventListener("click", () => {
            const name = button.getAttribute("data-remove-skill") || "";
            if (removeCustomSkill(character, name)) rerender(`Removed ${name}.`, "#custom-skill-name");
        }, { signal: el.signal });
    });
}
