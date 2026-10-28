import { CharacterData } from "../characterData";

export function renderWeapons(data: CharacterData): string {
    const weps = data.weapons || [];
    if (weps.length === 0) {
        return `
            <div class="no-results">
                <i class="fa-solid fa-shield"></i>
                <p>No weapons in inventory.</p>
            </div>
        `;
    }

    return weps.map(w => {
        const equippedBadge = `
            <button
                type="button"
                class="weapon-badge equip-toggle-btn ${w.equipped ? 'equipped' : 'unequipped'}"
                data-equip-scope="weapon"
                data-weapon-name="${encodeURIComponent(w.name)}"
                data-weapon-id="${w.definitionId || w.id || ''}"
                aria-pressed="${w.equipped ? 'true' : 'false'}"
                title="Toggle equipped state"
            >
                <i class="fa-solid ${w.equipped ? 'fa-check' : 'fa-minus'}"></i> ${w.equipped ? 'Equipped' : 'Unequipped'}
            </button>
        `;
        const propBadges = w.properties.map(p => `<span class="weapon-prop-badge">${p}</span>`).join('');
        const magicBadge = w.isMagic ? '<span class="weapon-badge magic"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>' : '';
        const masteryBadge = w.mastery
            ? `<button
                type="button"
                class="weapon-mastery-badge mastery-toggle-btn ${w.mastery.unlocked ? 'unlocked' : 'locked'}"
                data-equip-scope="weapon-mastery"
                data-weapon-name="${encodeURIComponent(w.name)}"
                data-weapon-id="${w.definitionId || w.id || ''}"
                data-mastery-name="${encodeURIComponent(w.mastery.name)}"
                aria-pressed="${w.mastery.unlocked ? 'true' : 'false'}"
                title="${w.mastery.description || w.mastery.name} (Click to toggle)"
            >
                <i class="fa-solid fa-burst"></i> Mastery: ${w.mastery.name}${w.mastery.unlocked ? ' (Active)' : ''}
               </button>`
            : '';

        return `
            <div class="weapon-card ${w.equipped ? 'is-equipped' : ''} clickable-weapon-card" data-weapon-name="${encodeURIComponent(w.name)}" data-weapon-id="${w.definitionId || w.id || ''}" data-weapon-type="Weapon" tabindex="0" role="button" title="Click to view details and tiered info">
                <div class="weapon-card-header">
                    <div class="weapon-title-group">
                        <h4 class="weapon-name">
                            <i class="fa-solid fa-khanda weapon-icon"></i> ${w.name} ${w.quantity > 1 ? `<span class="weapon-qty">(&times;${w.quantity})</span>` : ''}
                        </h4>
                        <span class="weapon-category">${w.category}</span>
                    </div>
                    <div class="weapon-status-badges">
                        ${equippedBadge}
                        ${magicBadge}
                        ${masteryBadge}
                    </div>
                </div>

                <div class="weapon-combat-stats">
                    <div class="wstat-box atk-stat">
                        <span class="wstat-label"><i class="fa-solid fa-crosshairs"></i> ATTACK</span>
                        <span class="wstat-val">${w.attackBonus}</span>
                    </div>
                    <div class="wstat-box dmg-stat">
                        <span class="wstat-label"><i class="fa-solid fa-burst"></i> DAMAGE</span>
                        <span class="wstat-val">${w.damage}</span>
                    </div>
                    <div class="wstat-box range-stat">
                        <span class="wstat-label"><i class="fa-solid fa-arrows-left-right"></i> RANGE</span>
                        <span class="wstat-val">${w.range}</span>
                    </div>
                </div>

                <div class="weapon-properties-list">
                    ${propBadges}
                </div>

                ${w.notes ? `<div class="weapon-notes">${w.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}
