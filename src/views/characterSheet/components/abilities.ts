import { abilityKey, cardText, effectsForAbility } from "../../../rules/dnd5e_2024/saveEffects";
import { CharacterData } from "../characterData";
import { escapeText } from "./details";
import { abilityScoreBreakdown, saveBreakdown } from "../services/breakdown";
import { renderBreakdownButton } from "./breakdownButton";

/** An ability's save effects ("Advantage: Concentration", with what grants it), or its older note. */
function renderSaveEffects(data: CharacterData, abbr: string, legacyNote?: string): string {
    const ability = abilityKey(abbr);
    if (data.saveEffects && ability) {
        return effectsForAbility(data.saveEffects, ability).map((e) => `
                <div class="ability-note">
                    <span aria-hidden="true">★</span> ${escapeText(cardText(e))}
                    ${e.sources.length ? `<span class="ability-note-source">${escapeText(e.sources.join(", "))}</span>` : ""}
                </div>`).join("");
    }
    return legacyNote ? `<div class="ability-note"><span aria-hidden="true">★</span> ${escapeText(legacyNote)}</div>` : "";
}

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
                <div class="ability-score">${renderBreakdownButton("ability", ability.abbr, String(ability.score), `${ability.name} score ${ability.score}`, abilityScoreBreakdown(data, ability))}</div>
                <div class="ability-save">
                    <span class="save-label">SAVE</span>
                    <span class="save-val">${renderBreakdownButton("save", ability.abbr, saveSign, `${ability.name} saving throw ${saveSign}`, saveBreakdown(data, ability))}</span>
                    ${profBadge}
                </div>
                ${renderSaveEffects(data, ability.abbr, ability.notes)}
            </div>
        `;
    }).join('');
}
