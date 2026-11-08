import { CharacterData } from "../characterData";

export function renderAbilityCards(data: CharacterData): string {
    return data.abilities.map((ability, index) => {
        const modSign = ability.modifier >= 0 ? `+${ability.modifier}` : `${ability.modifier}`;
        const saveSign = ability.save >= 0 ? `+${ability.save}` : `${ability.save}`;
        const profBadge = ability.proficientSave ? '<span class="prof-dot" title="Proficient saving throw">● Prof</span>' : '';
        const isLocked = data.source === "dndbeyond" && (!!data.lockedFields?.[`abilities.${ability.abbr}`] || !!data.lockedFields?.[`abilities.${index}`]);
        const lockBadge = isLocked ? '<span class="ability-locked-indicator" title="Base score locked from D&D Beyond refresh"><i class="fa-solid fa-lock"></i></span>' : '';
        return `
            <div class="ability-card ${ability.proficientSave ? 'is-proficient' : ''}">
                <div class="ability-header">${ability.abbr}${lockBadge}</div>
                <div class="ability-mod">${modSign}</div>
                <div class="ability-score">${ability.score}</div>
                <div class="ability-save">
                    <span class="save-label">SAVE</span>
                    <span class="save-val">${saveSign}</span>
                    ${profBadge}
                </div>
                ${ability.notes ? `<div class="ability-note" title="${ability.notes}">★ ${ability.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}
