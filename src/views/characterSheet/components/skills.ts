import { escapeHtml } from "@services/escape";
import { CharacterData } from "../characterData";
import { skillBreakdown } from "../services/breakdown";
import { CUSTOM_SKILL_NAME_MAX, SKILL_ABILITIES } from "../services/customSkills";
import { renderBreakdownButton } from "./breakdownButton";

export function renderSkills(data: CharacterData): string {
    const rows = data.skills.map((skill, index) => {
        const bonusStr = skill.bonus >= 0 ? `+${skill.bonus}` : `${skill.bonus}`;
        let profClass = 'prof-none';
        if (skill.proficiency === 'expertise') {
            profClass = 'prof-expertise';
        } else if (skill.proficiency === 'proficient') {
            profClass = 'prof-proficient';
        }

        const trainingSelect = `
            <select
                class="skill-training-select"
                data-skill-index="${index}"
                aria-label="Training level for ${escapeHtml(skill.name)}"
                title="Adjust training level for ${escapeHtml(skill.name)}"
            >
                <option value="none" ${skill.proficiency === 'none' ? 'selected' : ''}>○ Not Proficient</option>
                <option value="proficient" ${skill.proficiency === 'proficient' ? 'selected' : ''}>● Proficient</option>
                <option value="expertise" ${skill.proficiency === 'expertise' ? 'selected' : ''}>★ Expertise</option>
            </select>
        `;

        const customTag = skill.custom
            ? `<span class="skill-custom-tag">Custom</span>
               <button type="button" class="skill-remove-btn" data-remove-skill="${escapeHtml(skill.name)}" aria-label="Remove ${escapeHtml(skill.name)}" title="Remove ${escapeHtml(skill.name)}">
                   <i class="fa-solid fa-xmark" aria-hidden="true"></i>
               </button>`
            : "";

        return `
            <tr class="skill-row ${profClass}${skill.custom ? " skill-row-custom" : ""}">
                <td class="skill-stat-name">
                    <span class="skill-name">${escapeHtml(skill.name)}</span>
                    <span class="skill-stat">(${escapeHtml(skill.stat)})</span>
                    ${customTag}
                </td>
                <td class="skill-status">${trainingSelect}</td>
                <td class="skill-bonus">${renderBreakdownButton("skill", skill.name, bonusStr, `${skill.name} bonus ${bonusStr}`, skillBreakdown(data, skill))}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="skills-table" aria-label="Skill list">
            <thead>
                <tr>
                    <th scope="col">Skill</th>
                    <th scope="col">Training</th>
                    <th scope="col" class="skill-bonus-col">Bonus</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <form class="custom-skill-form" aria-labelledby="custom-skill-heading" novalidate>
            <h4 id="custom-skill-heading" class="custom-skill-heading">Add a skill</h4>
            <div class="custom-skill-fields">
                <label class="custom-skill-field">
                    <span>Skill name</span>
                    <input type="text" name="_custom-skill-name" id="custom-skill-name" maxlength="${CUSTOM_SKILL_NAME_MAX}" autocomplete="off" />
                </label>
                <label class="custom-skill-field">
                    <span>Ability</span>
                    <select name="_custom-skill-ability" id="custom-skill-ability">
                        ${SKILL_ABILITIES.map((ab) => `<option value="${ab}">${ab}</option>`).join("")}
                    </select>
                </label>
                <button type="submit" class="custom-skill-add-btn">
                    <i class="fa-solid fa-plus" aria-hidden="true"></i> Add skill
                </button>
            </div>
            <p class="custom-skill-status" id="custom-skill-status" role="status" aria-live="polite"></p>
        </form>
    `;
}
