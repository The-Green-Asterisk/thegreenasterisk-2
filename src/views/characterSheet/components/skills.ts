import { CharacterData } from "../characterData";

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
                aria-label="Training level for ${skill.name}"
                title="Adjust training level for ${skill.name}"
            >
                <option value="none" ${skill.proficiency === 'none' ? 'selected' : ''}>○ Not Proficient</option>
                <option value="proficient" ${skill.proficiency === 'proficient' ? 'selected' : ''}>● Proficient</option>
                <option value="expertise" ${skill.proficiency === 'expertise' ? 'selected' : ''}>★ Expertise</option>
            </select>
        `;

        return `
            <tr class="skill-row ${profClass}">
                <td class="skill-stat-name">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-stat">(${skill.stat})</span>
                </td>
                <td class="skill-status">${trainingSelect}</td>
                <td class="skill-bonus">${bonusStr}</td>
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
    `;
}
