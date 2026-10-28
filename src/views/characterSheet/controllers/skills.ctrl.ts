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
        });

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
        });
    });
}
