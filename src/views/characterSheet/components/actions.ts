import { resolveActionSpellDamage } from "../../../services/spellDamage";
import { CharacterData } from "../characterData";
import { linkifyConditionAndSpellTags } from "./markupLinks";
import { renderUsesTracker, resourceForAction } from "./usesTracker";

export function renderActions(data: CharacterData): string {
    return (data.actions || []).map((action, index) => {
        const spellBtn = action.spellName
            ? `<button class="action-spell-link" data-spell-name="${encodeURIComponent(action.spellName)}" title="Click to view spell details">
                <i class="fa-solid fa-wand-magic-sparkles"></i> View Spell
               </button>`
            : '';
        // Uses of the resource the action spends (mirrors that resource's pips), beside the card since it's a button
        const resource = resourceForAction(data, action);
        const uses = resource ? renderUsesTracker(action.name, resource.key, resource.total, resource.resetOn) : '';
        const resolved = resolveActionSpellDamage(action, data);
        const damageDisplay = resolved.damageOrEffect || action.damageOrEffect || "—";
        const scalingBadge = resolved.isScaled && resolved.scaledTierLabel
            ? ` <span class="action-scaling-badge" title="Scaled for ${resolved.scaledTierLabel}">(${resolved.scaledTierLabel})</span>`
            : '';
        const card = `
            <div
                class="action-card clickable-action-card ${action.spellName ? 'has-spell' : ''}"
                data-action-index="${index}"
                title="Click to view full action details"
            >
                <div class="action-header">
                    <div>
                        <h4 class="action-name"><button type="button" class="card-open-btn" aria-haspopup="dialog">${action.name}</button></h4>
                        <span class="action-badge ${action.type.toLowerCase().replace(/ /g, '-')}">${action.type}</span>
                    </div>
                    ${spellBtn}
                </div>
                <div class="action-stats">
                    <div class="action-stat"><span class="stat-lbl">Range/Reach:</span> <strong>${action.rangeOrReach}</strong></div>
                    <div class="action-stat"><span class="stat-lbl">Hit / DC:</span> <strong>${action.hitOrDc}</strong></div>
                    <div class="action-stat"><span class="stat-lbl">Damage / Effect:</span> <strong>${linkifyConditionAndSpellTags(damageDisplay, { character: data, entityName: action.name })}</strong>${scalingBadge}</div>
                </div>
                <div class="action-notes">${linkifyConditionAndSpellTags(action.notes, { character: data, entityName: action.name })}</div>
                <div class="action-card-footer-hint"><i class="fa-solid fa-expand"></i> Click for full details</div>
            </div>
        `;
        return uses ? `<div class="card-with-uses">${card}${uses}</div>` : card;
    }).join('');
}
