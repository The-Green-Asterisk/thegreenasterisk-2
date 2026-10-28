import { CharacterData } from "../characterData";

export function renderAbilityCards(data: CharacterData): string {
    return data.abilities.map(ability => {
        const modSign = ability.modifier >= 0 ? `+${ability.modifier}` : `${ability.modifier}`;
        const saveSign = ability.save >= 0 ? `+${ability.save}` : `${ability.save}`;
        const profBadge = ability.proficientSave ? '<span class="prof-dot" title="Proficient saving throw">● Prof</span>' : '';
        return `
            <div class="ability-card ${ability.proficientSave ? 'is-proficient' : ''}">
                <div class="ability-header">${ability.abbr}</div>
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
