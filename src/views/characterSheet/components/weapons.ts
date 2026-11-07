import { CharacterData } from "../characterData";
import { linkifyConditionAndSpellTags } from "./markupLinks";
import { checkItemRequiresAttunement, isMundaneEquipment } from "../services/magicItemBonuses";

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
        const requiresAttune = checkItemRequiresAttunement(w);
        const attunedBadge = requiresAttune
            ? `<button
                type="button"
                class="weapon-badge attune-toggle-btn ${w.attuned ? 'attuned' : 'unattuned'}"
                data-attune-scope="weapon"
                data-weapon-name="${encodeURIComponent(w.name)}"
                data-weapon-id="${w.definitionId || w.id || ''}"
                aria-pressed="${w.attuned ? 'true' : 'false'}"
                title="Toggle attunement (Click to ${w.attuned ? 'unattune' : 'attune'})"
            >
                <i class="fa-solid ${w.attuned ? 'fa-link' : 'fa-link-slash'}"></i> ${w.attuned ? 'Attuned' : 'Unattuned'}
            </button>`
            : '';
        const isMagic = isMundaneEquipment(w.name) ? false : !!w.isMagic;
        const magicBadge = isMagic ? '<span class="weapon-badge magic"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>' : '';
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
                            <i class="fa-solid fa-khanda weapon-icon"></i> ${w.name}
                        </h4>
                        <span class="weapon-category">${w.category}</span>
                    </div>
                    <div class="weapon-status-badges">
                        <div class="item-qty-stepper weapon-qty-stepper" data-weapon-name="${encodeURIComponent(w.name)}" title="Quantity: Click - / + or type a number">
                            <button type="button" class="item-qty-btn qty-dec" data-qty-delta="-1" aria-label="Decrease quantity" title="Decrease quantity">&minus;</button>
                            <input type="number" class="item-qty-input" min="0" max="9999" value="${w.quantity}" data-weapon-name="${encodeURIComponent(w.name)}" aria-label="Quantity for ${w.name}" />
                            <button type="button" class="item-qty-btn qty-inc" data-qty-delta="1" aria-label="Increase quantity" title="Increase quantity">&plus;</button>
                        </div>
                        ${equippedBadge}
                        ${attunedBadge}
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

                ${w.notes ? `<div class="weapon-notes">${linkifyConditionAndSpellTags(w.notes, { character: data, entityName: w.name, sourceName: w.category })}</div>` : ''}
            </div>
        `;
    }).join('');
}
