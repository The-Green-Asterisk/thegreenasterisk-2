import el from "@elements";
import { renderSkills } from "../components/skills";
import { addCustomSkill, checkExtra, removeCustomSkill, trainingMultiplier } from "../services/customSkills";
import { CharacterSheetContext } from "./context";

export function initSkillsController(ctx: CharacterSheetContext) {
    if (!ctx.getCharacter()) return;

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
            const current = ctx.getCharacter();
            if (!current) return;
            const skillIndex = Number(select.getAttribute("data-skill-index"));
            if (Number.isNaN(skillIndex)) return;
            const skill = current.skills?.[skillIndex];
            if (!skill) return;

            const previous = skill.proficiency || "none";
            const next = (select.value as "none" | "proficient" | "expertise") || "none";

            // Only proficiency and what checks get at each training level (Jack of All Trades applies untrained) move;
            // every other bonus the skill has stays
            const profBonus = Number(current.vitals?.proficiencyBonus) || 0;
            const recomputedBonus = (Number(skill.bonus) || 0)
                + profBonus * (trainingMultiplier(next) - trainingMultiplier(previous))
                + checkExtra(current, skill.stat, next) - checkExtra(current, skill.stat, previous);

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
        const current = ctx.getCharacter();
        const container = ctx.sheet.querySelector<HTMLElement>("#tab-skills .skills-container");
        if (!current || !container) return;
        if (ctx.syncSheetStats) {
            // Layers items over the new skill like every other, re-renders the table, and binds it again
            ctx.syncSheetStats();
        } else {
            const skillsList = container.querySelector<HTMLElement>(".skills-list");
            if (skillsList) {
                skillsList.innerHTML = `<h3>All Skills</h3>${renderSkills(current)}`;
            } else {
                container.innerHTML = renderSkills(current);
            }
            initSkillsController(ctx);
        }
        const status = container.querySelector<HTMLElement>("#custom-skill-status");
        if (status) status.textContent = message;
        container.querySelector<HTMLElement>(focusSelector)?.focus();
        ctx.scheduleDebouncedAutoSave();
    };

    const toggleBtn = ctx.sheet.querySelector<HTMLButtonElement>("#tab-skills #custom-skill-toggle-btn");
    const form = ctx.sheet.querySelector<HTMLFormElement>("#tab-skills .custom-skill-form");
    const nameInput = form?.querySelector<HTMLInputElement>("#custom-skill-name") || null;

    toggleBtn?.addEventListener("click", () => {
        if (!form) return;
        form.hidden = !form.hidden;
        toggleBtn.setAttribute("aria-expanded", String(!form.hidden));
        if (!form.hidden) nameInput?.focus();
    }, { signal: el.signal });

    nameInput?.addEventListener("input", () => {
        nameInput.removeAttribute("aria-invalid");
    }, { signal: el.signal });

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const current = ctx.getCharacter();
        if (!current) return;
        const abilitySelect = form.querySelector<HTMLSelectElement>("#custom-skill-ability");
        const status = ctx.sheet.querySelector<HTMLElement>("#tab-skills #custom-skill-status");
        const result = addCustomSkill(current, nameInput?.value || "", abilitySelect?.value || "");
        if (typeof result === "string") {
            form.hidden = false;
            toggleBtn?.setAttribute("aria-expanded", "true");
            if (status) status.textContent = result;
            nameInput?.setAttribute("aria-invalid", "true");
            nameInput?.focus();
            return;
        }
        const index = current.skills.indexOf(result);
        rerender(`Added ${result.name} (${result.stat}).`, `.skill-training-select[data-skill-index="${index}"]`);
    }, { signal: el.signal });

    ctx.sheet.querySelectorAll<HTMLButtonElement>("#tab-skills .skill-remove-btn[data-remove-skill]").forEach(button => {
        button.addEventListener("click", () => {
            const current = ctx.getCharacter();
            if (!current) return;
            const name = button.getAttribute("data-remove-skill") || "";
            if (removeCustomSkill(current, name)) rerender(`Removed ${name}.`, "#custom-skill-toggle-btn");
        }, { signal: el.signal });
    });
}
