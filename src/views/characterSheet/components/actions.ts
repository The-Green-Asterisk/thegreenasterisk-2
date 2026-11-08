import { CharacterData } from "../characterData";
import { linkifyConditionAndSpellTags } from "./markupLinks";

export function renderActions(data: CharacterData): string {
    return (data.actions || []).map((action, index) => {
        const spellBtn = action.spellName
            ? `<button class="action-spell-link" data-spell-name="${encodeURIComponent(action.spellName)}" title="Click to view spell details">
                <i class="fa-solid fa-wand-magic-sparkles"></i> View Spell
               </button>`
            : '';
        return `
            <div
                class="action-card clickable-action-card ${action.spellName ? 'has-spell' : ''}"
                data-action-index="${index}"
                role="button"
                tabindex="0"
                aria-haspopup="dialog"
                title="Click to view full action details"
            >
                <div class="action-header">
                    <div>
                        <h4 class="action-name">${action.name}</h4>
                        <span class="action-badge ${action.type.toLowerCase().replace(/ /g, '-')}">${action.type}</span>
                    </div>
                    ${spellBtn}
                </div>
                <div class="action-stats">
                    <div class="action-stat"><span class="stat-lbl">Range/Reach:</span> <strong>${action.rangeOrReach}</strong></div>
                    <div class="action-stat"><span class="stat-lbl">Hit / DC:</span> <strong>${action.hitOrDc}</strong></div>
                    <div class="action-stat"><span class="stat-lbl">Damage / Effect:</span> <strong>${linkifyConditionAndSpellTags(action.damageOrEffect, { character: data, entityName: action.name })}</strong></div>
                </div>
                <div class="action-notes">${linkifyConditionAndSpellTags(action.notes, { character: data, entityName: action.name })}</div>
                <div class="action-card-footer-hint"><i class="fa-solid fa-expand"></i> Click for full details</div>
            </div>
        `;
    }).join('');
}
