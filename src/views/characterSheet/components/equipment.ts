import { renderUsesTracker } from "./usesTracker";
import { itemChargesKey } from "../dndBeyondExtras";
import { CharacterData } from "../characterData";
import { linkifyConditionAndSpellTags } from "./markupLinks";
import { checkItemRequiresAttunement, isMundaneEquipment } from "../services/magicItemBonuses";

export function renderEquipment(data: CharacterData): string {
    return (data.equipment || []).map(item => {
        const equippedBadge = `
            <button
                type="button"
                class="item-badge equip-toggle-btn ${item.equipped ? 'equipped' : 'unequipped'}"
                data-equip-scope="item"
                data-item-name="${encodeURIComponent(item.name)}"
                data-item-id="${item.definitionId || item.id || ''}"
                aria-pressed="${item.equipped ? 'true' : 'false'}"
                title="Toggle equipped state"
            >
                ${item.equipped ? 'Equipped' : 'Unequipped'}
            </button>
        `;
        const requiresAttune = checkItemRequiresAttunement(item);
        const attunedBadge = requiresAttune
            ? `
            <button
                type="button"
                class="item-badge attune-toggle-btn ${item.attuned ? 'attuned' : 'unattuned'}"
                data-attune-scope="item"
                data-item-name="${encodeURIComponent(item.name)}"
                data-item-id="${item.definitionId || item.id || ''}"
                aria-pressed="${item.attuned ? 'true' : 'false'}"
                title="Toggle attunement (Click to ${item.attuned ? 'unattune' : 'attune'})"
            >
                <i class="fa-solid ${item.attuned ? 'fa-link' : 'fa-link-slash'}"></i> ${item.attuned ? 'Attuned' : 'Unattuned'}
            </button>
            `
            : '';
        const isMagic = isMundaneEquipment(item.name) ? false : !!item.isMagic;
        const magicBadge = isMagic ? '<span class="item-badge magic"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>' : '';
        const rarityBadge = !isMagic ? '' : (item.rarity && item.rarity !== 'Common' ? `<span class="item-badge rarity-${item.rarity.toLowerCase().replace(/\s+/g, '-')}">${item.rarity}</span>` : '');
        const charges = item.charges ? renderUsesTracker(item.name, itemChargesKey(item), item.charges.max, item.charges.resetOn, item.charges.resetLabel) : '';
        const card = `
            <div class="equipment-row clickable-item-card" data-item-name="${encodeURIComponent(item.name)}" data-item-id="${item.definitionId || item.id || ''}" data-item-type="${item.type || ''}" tabindex="0" role="button" title="Click to view details and tiered info">
                <div class="item-info">
                    <span class="item-name"><i class="fa-solid fa-box-open item-lead-icon"></i> ${item.name}</span>
                    <span class="item-type">${item.type}</span>
                </div>
                <div class="item-badges">
                    <div class="item-qty-stepper" data-item-name="${encodeURIComponent(item.name)}" title="Quantity: Click - / + or type a number">
                        <button type="button" class="item-qty-btn qty-dec" data-qty-delta="-1" aria-label="Decrease quantity" title="Decrease quantity">&minus;</button>
                        <input type="number" class="item-qty-input" min="0" max="9999" value="${item.quantity}" data-item-name="${encodeURIComponent(item.name)}" aria-label="Quantity for ${item.name}" />
                        <button type="button" class="item-qty-btn qty-inc" data-qty-delta="1" aria-label="Increase quantity" title="Increase quantity">&plus;</button>
                    </div>
                    ${equippedBadge}
                    ${attunedBadge}
                    ${magicBadge}
                    ${rarityBadge}
                </div>
                ${item.notes ? `<div class="item-notes">${linkifyConditionAndSpellTags(item.notes, { character: data, entityName: item.name, sourceName: item.type })}</div>` : ''}
            </div>
        `;
        // Charges sit beside the card, not inside it, since the card itself is a button
        return charges ? `<div class="card-with-uses">${card}${charges}</div>` : card;
    }).join('');
}
