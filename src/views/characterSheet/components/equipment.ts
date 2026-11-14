import { escapeHtml } from "@services/escape";
import { renderUsesTracker } from "./usesTracker";
import { itemChargesKey } from "../dndBeyondExtras";
import { CharacterData, EquipmentItem } from "../characterData";
import { linkifyConditionAndSpellTags } from "./markupLinks";
import { checkItemRequiresAttunement, isMundaneEquipment } from "../services/magicItemBonuses";
import { renderBreakdownButton } from "./breakdownButton";
import { vitalBreakdown } from "../services/breakdown";
import { formatWeightLb, roundWeightLb } from "../../../rules/dnd5e_2024/itemWeightsAndContainers";
import {
    canPutInContainer,
    ContainerSummary,
    ensureInventoryItemsSynced,
    getCharacterWeightSummary,
    getContainerSummary,
    getInventoryKey,
    resolveContainerKey
} from "../services/inventoryContainers";

interface InventoryRenderEntry {
    item: EquipmentItem;
    index: number;
    key: string;
    parentKey: string | null;
}

export function renderEquipment(data: CharacterData): string {
    ensureInventoryItemsSynced(data);
    const weightSummary = getCharacterWeightSummary(data);
    const encumberedOver = roundWeightLb(Math.max(0, weightSummary.carriedWeight - weightSummary.carryingCapacity));
    const weightBanner = `
        <div class="inventory-weight-banner ${weightSummary.isEncumbered ? 'is-encumbered' : ''}">
            <div class="inventory-weight-main">
                <span class="inventory-weight-label"><i class="fa-solid fa-weight-hanging" aria-hidden="true"></i> Carried Weight</span>
                <span class="inventory-weight-values">
                    <strong class="carried-weight-value">${escapeHtml(weightSummary.carriedFormatted)}</strong>
                    <span class="weight-sep" aria-hidden="true">/</span>
                    ${renderBreakdownButton("vital", "carryingCapacity", weightSummary.capacityFormatted, "Carrying Capacity", vitalBreakdown(data, "carryingCapacity"))}
                </span>
            </div>
            ${weightSummary.isEncumbered ? `<span class="weight-warning-badge" role="status"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Over Carrying Capacity (+${escapeHtml(formatWeightLb(encumberedOver))})</span>` : ''}
        </div>
    `;

    const equipment = data.equipment || [];
    const entries: InventoryRenderEntry[] = equipment.map((item, index) => ({
        item,
        index,
        key: getInventoryKey(item, equipment, index),
        parentKey: item.containerId ? resolveContainerKey(data, item.containerId) : null
    }));

    const childrenByParent = new Map<string, InventoryRenderEntry[]>();
    const topLevel: InventoryRenderEntry[] = [];
    for (const entry of entries) {
        if (entry.parentKey && entry.parentKey !== entry.key) {
            const list = childrenByParent.get(entry.parentKey) || [];
            list.push(entry);
            childrenByParent.set(entry.parentKey, list);
        } else {
            topLevel.push(entry);
        }
    }

    const containerEntries = entries.filter(e => Boolean(e.item.isContainer));
    const containerNameCounts = new Map<string, number>();
    containerEntries.forEach(c => {
        const lower = String(c.item.name || "").trim().toLowerCase();
        containerNameCounts.set(lower, (containerNameCounts.get(lower) ?? 0) + 1);
    });
    const containerSeen = new Map<string, number>();
    const containerLabels = new Map<string, string>();
    containerEntries.forEach(c => {
        const lower = String(c.item.name || "").trim().toLowerCase();
        const occ = (containerSeen.get(lower) ?? 0) + 1;
        containerSeen.set(lower, occ);
        const totalWithSameName = containerNameCounts.get(lower) ?? 1;
        containerLabels.set(c.key, totalWithSameName > 1 ? `${c.item.name} #${occ}` : c.item.name);
    });

    const renderEntryTree = (entry: InventoryRenderEntry, visited: Set<string>): string => {
        if (visited.has(entry.key)) return '';
        const nextVisited = new Set(visited);
        nextVisited.add(entry.key);

        const isContainer = Boolean(entry.item.isContainer);
        const summary = isContainer ? getContainerSummary(data, entry.key) : null;
        const isCollapsed = isContainer && Boolean(data.trackingState?.collapsedContainers?.[entry.key]);
        const cardHtml = renderEquipmentEntry(data, entry, summary, isCollapsed, containerEntries, containerLabels);
        if (!isContainer) return cardHtml;

        const children = childrenByParent.get(entry.key) || [];
        const contentsHtml = isCollapsed ? '' : `
            <div class="container-contents" data-parent-key="${escapeHtml(entry.key)}">
                ${children.length > 0
                    ? children.map(child => renderEntryTree(child, nextVisited)).join('')
                    : '<div class="container-empty-note">Empty container</div>'}
            </div>
        `;
        return `
            <div class="equipment-container-group ${isCollapsed ? 'is-collapsed' : ''} ${summary?.isOverCapacity ? 'is-over-capacity' : ''}" data-container-key="${escapeHtml(entry.key)}">
                ${cardHtml}
                ${contentsHtml}
            </div>
        `;
    };

    const listHtml = topLevel.length > 0
        ? topLevel.map(entry => renderEntryTree(entry, new Set())).join('')
        : '<div class="inventory-empty-note">No items in inventory.</div>';

    return `${weightBanner}<div class="inventory-items-list">${listHtml}</div>`;
}

function renderEquipmentEntry(
    data: CharacterData,
    entry: InventoryRenderEntry,
    containerSummary: ContainerSummary | null,
    isCollapsed: boolean,
    containerEntries: InventoryRenderEntry[],
    containerLabels: Map<string, string>
): string {
    const item = entry.item;
        const equippedBadge = `
            <button
                type="button"
                class="item-badge equip-toggle-btn ${item.equipped ? 'equipped' : 'unequipped'}"
                data-equip-scope="item"
                data-item-name="${encodeURIComponent(item.name)}"
                data-item-id="${item.definitionId || item.id || ''}"
                data-item-key="${escapeHtml(entry.key)}"
                aria-pressed="${item.equipped ? 'true' : 'false'}"
                title="${entry.parentKey ? 'Stowed in container — clicking Equip removes it from its container' : 'Toggle equipped state'}"
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
        const rarityBadge = !isMagic ? '' : (item.rarity && item.rarity !== 'Common' ? `<span class="item-badge rarity-${escapeHtml(item.rarity.toLowerCase().replace(/\s+/g, '-'))}">${escapeHtml(item.rarity)}</span>` : '');
        const charges = item.charges ? renderUsesTracker(item.name, itemChargesKey(item), item.charges.max, item.charges.resetOn, item.charges.resetLabel) : '';
        const qty = typeof item.quantity === 'number' && Number.isFinite(item.quantity) ? item.quantity : 1;
        const unitWeight = typeof item.weight === 'number' && Number.isFinite(item.weight) ? roundWeightLb(item.weight) : 0;
        const stackWeight = roundWeightLb(unitWeight * qty);
        const isWeaponEntry = String(item.filterType || item.type || '').toLowerCase() === 'weapon';

        let leadIconClass = 'fa-box-open';
        if (containerSummary) {
            leadIconClass = isCollapsed ? 'fa-box' : 'fa-box-open';
        } else if (isWeaponEntry) {
            leadIconClass = 'fa-khanda';
        }

        const collapseBtn = containerSummary ? `
            <button
                type="button"
                class="container-collapse-btn"
                data-container-key="${escapeHtml(entry.key)}"
                aria-expanded="${isCollapsed ? 'false' : 'true'}"
                title="${isCollapsed ? 'Expand container' : 'Collapse container'}"
            >
                <i class="fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-down'}" aria-hidden="true"></i>
                <span class="visually-hidden">${isCollapsed ? 'Expand' : 'Collapse'} ${escapeHtml(item.name)}</span>
            </button>
        ` : '';

        const weightBadge = containerSummary
            ? `<span class="item-badge item-weight-badge ${containerSummary.isOverCapacity ? 'over-capacity' : ''}" title="Container total weight (includes container${containerSummary.extradimensional ? ', extradimensional contents do not count toward character carry load' : ''})">${escapeHtml(containerSummary.capacityWeight !== null ? `${formatWeightLb(containerSummary.totalWeight)} / ${formatWeightLb(containerSummary.capacityWeight)}` : formatWeightLb(containerSummary.totalWeight))}</span>`
            : `<span class="item-badge item-weight-badge" title="${qty !== 1 ? `${formatWeightLb(unitWeight)} each` : 'Item weight'}">${escapeHtml(formatWeightLb(stackWeight))}</span>`;

        const containerCountBadge = containerSummary
            ? `<span class="item-badge container-count-badge" title="Total quantity of items inside">${containerSummary.totalQuantity} ${containerSummary.totalQuantity === 1 ? 'item' : 'items'}</span>`
            : '';

        const overCapacityBadge = containerSummary?.isOverCapacity
            ? `<span class="item-badge weight-warning-badge" role="status" title="Container exceeds its weight capacity"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Over capacity</span>`
            : '';

        const validTargets = containerEntries.filter(c => c.key !== entry.key && canPutInContainer(data, entry.key, c.key));
        const containerSelect = (validTargets.length > 0 || entry.parentKey) ? `
            <select
                class="item-container-select"
                data-item-key="${escapeHtml(entry.key)}"
                data-item-name="${encodeURIComponent(item.name)}"
                aria-label="Container for ${escapeHtml(item.name)}"
                title="Stow in container"
            >
                <option value="">${entry.parentKey ? 'Take out of container' : 'Stow in\u2026'}</option>
                ${validTargets.map(c => {
                    const label = containerLabels.get(c.key) || c.item.name;
                    return `<option value="${escapeHtml(c.key)}" ${entry.parentKey === c.key ? 'selected' : ''}>${escapeHtml(label)}</option>`;
                }).join('')}
            </select>
        ` : '';

        const rowClasses = [
            'equipment-row',
            'clickable-item-card',
            containerSummary ? 'is-container' : '',
            containerSummary?.isOverCapacity ? 'is-over-capacity' : '',
            entry.parentKey ? 'is-stowed-child' : '',
            isWeaponEntry ? 'is-weapon-inventory-item' : ''
        ].filter(Boolean).join(' ');

        const card = `
            <div class="${rowClasses}" data-item-name="${encodeURIComponent(item.name)}" data-item-id="${item.definitionId || item.id || ''}" data-item-type="${escapeHtml(item.type || '')}" data-item-key="${escapeHtml(entry.key)}" title="Click to view details and tiered info">
                <div class="item-info">
                    <span class="item-name">${collapseBtn}<i class="fa-solid ${leadIconClass} item-lead-icon" aria-hidden="true"></i> <button type="button" class="card-open-btn" aria-haspopup="dialog">${escapeHtml(item.name)}</button>${item.locked ? ' <span class="copy-locked-indicator" title="Locked on this character"><i class="fa-solid fa-lock" aria-hidden="true"></i><span class="visually-hidden">(locked on this character)</span></span>' : ''}</span>
                    <span class="item-type">${escapeHtml(item.type || '')}${containerSummary ? ' · Container' : ''}</span>
                </div>
                <div class="item-badges">
                    <div class="item-qty-stepper" data-item-name="${encodeURIComponent(item.name)}" data-item-key="${escapeHtml(entry.key)}" title="Quantity: Click - / + or type a number">
                        <button type="button" class="item-qty-btn qty-dec" data-qty-delta="-1" aria-label="Decrease quantity" title="Decrease quantity">&minus;</button>
                        <input type="number" class="item-qty-input" min="0" max="9999" value="${qty}" data-item-name="${encodeURIComponent(item.name)}" aria-label="Quantity for ${escapeHtml(item.name)}" />
                        <button type="button" class="item-qty-btn qty-inc" data-qty-delta="1" aria-label="Increase quantity" title="Increase quantity">&plus;</button>
                    </div>
                    ${weightBadge}
                    ${containerCountBadge}
                    ${overCapacityBadge}
                    ${containerSelect}
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
}
