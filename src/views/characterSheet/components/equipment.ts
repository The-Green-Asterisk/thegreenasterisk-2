import { CharacterData } from "../characterData";

export function renderEquipment(data: CharacterData): string {
    return data.equipment.map(item => {
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
        const attunedBadge = item.attuned ? '<span class="item-badge attuned">Attuned</span>' : '';
        const magicBadge = item.isMagic ? '<span class="item-badge magic"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>' : '';
        const rarityBadge = item.rarity && item.rarity !== 'Common' ? `<span class="item-badge rarity-${item.rarity.toLowerCase().replace(/\s+/g, '-')}">${item.rarity}</span>` : '';
        return `
            <div class="equipment-row clickable-item-card" data-item-name="${encodeURIComponent(item.name)}" data-item-id="${item.definitionId || item.id || ''}" data-item-type="${item.type || ''}" tabindex="0" role="button" title="Click to view details and tiered info">
                <div class="item-info">
                    <span class="item-name"><i class="fa-solid fa-box-open item-lead-icon"></i> ${item.name} ${item.quantity > 1 ? `(${item.quantity})` : ''}</span>
                    <span class="item-type">${item.type}</span>
                </div>
                <div class="item-badges">
                    ${equippedBadge}
                    ${attunedBadge}
                    ${magicBadge}
                    ${rarityBadge}
                </div>
                ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}
