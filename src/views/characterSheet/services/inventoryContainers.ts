import {
    formatWeightLb,
    isExtradimensionalContainerName,
    lookupContainerDefaults,
    lookupItemWeightLb,
    parseWeightLb,
    roundWeightLb
} from "../../../rules/dnd5e_2024/itemWeightsAndContainers";
import { CharacterData, EquipmentItem, WeaponItem } from "../characterData";
import { computeCarryingCapacity } from "./breakdown";

export interface ContainerSummary {
    key: string;
    container: EquipmentItem;
    ownWeight: number;
    contentsWeight: number;
    totalWeight: number;
    capacityWeight: number | null;
    isOverCapacity: boolean;
    totalQuantity: number;
    extradimensional: boolean;
}

export interface CharacterWeightSummary {
    carriedWeight: number;
    carriedFormatted: string;
    carryingCapacity: number;
    capacityFormatted: string;
    isEncumbered: boolean;
    breakdown: ReturnType<typeof computeCarryingCapacity>;
}

/**
 * Stable per-item key in the character's inventory.
 * Prefers the item's persistent id (`id:<id>`), falling back to an occurrence-indexed normalized name (`name:<lower>#<occ>`).
 */
export function getInventoryKey(
    item: Pick<EquipmentItem, "id" | "name">,
    indexOrItems: number | Array<Pick<EquipmentItem, "id" | "name">> = 0,
    maybeIndex?: number
): string {
    if (item.id !== undefined && item.id !== null && String(item.id).trim() !== "") {
        return `id:${String(item.id).trim()}`;
    }
    const lowerName = String(item.name || "").trim().toLowerCase();
    if (Array.isArray(indexOrItems)) {
        const list = indexOrItems;
        const limitIdx = maybeIndex ?? list.indexOf(item);
        let occ = 0;
        for (let i = 0; i < limitIdx && i < list.length; i++) {
            const candidate = list[i];
            if ((candidate.id === undefined || candidate.id === null || String(candidate.id).trim() === "")
                && String(candidate.name || "").trim().toLowerCase() === lowerName) {
                occ++;
            }
        }
        return lowerName ? `name:${lowerName}#${occ}` : `idx:${Math.max(0, limitIdx)}`;
    }
    const idx = Math.max(0, Number(indexOrItems) || 0);
    return lowerName ? `name:${lowerName}#0` : `idx:${idx}`;
}

function buildKeyIndexMap(equipment: EquipmentItem[]): Map<string, { item: EquipmentItem; index: number; key: string }> {
    const map = new Map<string, { item: EquipmentItem; index: number; key: string }>();
    const plainNameCounts = new Map<string, number>();

    equipment.forEach((item, index) => {
        const key = getInventoryKey(item, equipment, index);
        const entry = { item, index, key };
        map.set(key, entry);
        if (item.id !== undefined && item.id !== null && String(item.id).trim() !== "") {
            map.set(String(item.id).trim(), entry);
        }
        const lower = String(item.name || "").trim().toLowerCase();
        if (lower) {
            const occ = plainNameCounts.get(lower) ?? 0;
            plainNameCounts.set(lower, occ + 1);
            const indexedKey = `name:${lower}#${occ}`;
            if (!map.has(indexedKey)) map.set(indexedKey, entry);
        }
    });

    // Allow unambiguous plain "name:<lower>" lookup when only one item shares that name.
    plainNameCounts.forEach((count, lower) => {
        if (count !== 1) return;
        const matchIdx = equipment.findIndex((e) => String(e.name || "").trim().toLowerCase() === lower);
        if (matchIdx >= 0) {
            const item = equipment[matchIdx];
            const key = getInventoryKey(item, equipment, matchIdx);
            if (!map.has(`name:${lower}`)) {
                map.set(`name:${lower}`, { item, index: matchIdx, key });
            }
        }
    });

    return map;
}

/**
 * Resolve a stored `containerId` onto the canonical key of a container present in `character.equipment`.
 * Returns `null` if missing or not pointing to a valid container.
 */
export function resolveContainerKey(
    character: Pick<CharacterData, "equipment">,
    containerId: string | null | undefined
): string | null {
    if (!containerId || !String(containerId).trim()) return null;
    const raw = String(containerId).trim();
    const equipment = character.equipment || [];
    const map = buildKeyIndexMap(equipment);
    const hit = map.get(raw) || map.get(raw.toLowerCase());
    if (!hit || !hit.item.isContainer) return null;
    return hit.key;
}

function pairWeaponTwinIndex(weapon: WeaponItem, equipment: EquipmentItem[], claimed: Set<number>): number {
    const wName = String(weapon.name || "").trim().toLowerCase();
    if (!wName) return -1;
    if (weapon.id !== undefined && weapon.id !== null) {
        const byId = equipment.findIndex((e, idx) =>
            !claimed.has(idx)
            && e.id === weapon.id
            && String(e.name || "").trim().toLowerCase() === wName
        );
        if (byId >= 0) return byId;
    }
    const byWeaponTag = equipment.findIndex((e, idx) =>
        !claimed.has(idx)
        && String(e.name || "").trim().toLowerCase() === wName
        && String(e.filterType || e.type || "").toLowerCase() === "weapon"
    );
    if (byWeaponTag >= 0) return byWeaponTag;
    return equipment.findIndex((e, idx) =>
        !claimed.has(idx)
        && String(e.name || "").trim().toLowerCase() === wName
    );
}

function normalizeEntryWeightAndContainer(
    item: Pick<EquipmentItem, "name" | "weight" | "isContainer" | "capacityWeight" | "filterType" | "locked"> & { type?: string; category?: string }
): void {
    const parsed = parseWeightLb(item.weight);
    if (typeof item.weight !== "number" && parsed !== null) {
        item.weight = parsed;
    } else if (typeof item.weight === "number" && Number.isFinite(item.weight)) {
        item.weight = roundWeightLb(item.weight);
    }
    const currentWeight = typeof item.weight === "number" && Number.isFinite(item.weight) ? item.weight : 0;
    if (!item.locked && currentWeight <= 0) {
        const lookedUp = lookupItemWeightLb(item.name, item.category || item.filterType || item.type);
        if (lookedUp !== null && lookedUp > 0) {
            item.weight = roundWeightLb(lookedUp);
        } else if (item.weight === undefined || item.weight === null || !Number.isFinite(item.weight)) {
            item.weight = 0;
        }
    } else if (item.weight === undefined || item.weight === null || !Number.isFinite(item.weight)) {
        item.weight = 0;
    }

    const defaults = lookupContainerDefaults(item.name);
    if (!item.locked && item.isContainer === undefined && defaults?.isContainer) {
        item.isContainer = true;
    }
    if (item.isContainer && (item.capacityWeight === undefined || item.capacityWeight === null) && defaults?.capacityWeight != null) {
        item.capacityWeight = defaults.capacityWeight;
    }
}

/**
 * Ensures item weights and container defaults are populated, mirrors every weapon into `character.equipment`
 * so weapons appear in Inventory and can be stowed, keeps weapon/equipment twins in sync, and enforces
 * `equipped = false` for any item stowed inside a container.
 */
export function ensureInventoryItemsSynced(character: CharacterData | null | undefined): void {
    if (!character) return;
    if (!Array.isArray(character.equipment)) character.equipment = [];
    if (!Array.isArray(character.weapons)) character.weapons = [];

    for (const eq of character.equipment) {
        normalizeEntryWeightAndContainer(eq);
    }
    for (const wep of character.weapons) {
        normalizeEntryWeightAndContainer({
            name: wep.name,
            weight: wep.weight,
            isContainer: wep.isContainer,
            capacityWeight: wep.capacityWeight,
            category: wep.category,
            filterType: "Weapon",
            locked: wep.locked
        });
        if (wep.weight === undefined || wep.weight === null || !Number.isFinite(wep.weight)) {
            const w = lookupItemWeightLb(wep.name, wep.category);
            wep.weight = w !== null ? roundWeightLb(w) : 0;
        }
    }

    const claimedEq = new Set<number>();
    const twinPairs: Array<{ weapon: WeaponItem; equip: EquipmentItem }> = [];

    for (const wep of character.weapons) {
        const twinIdx = pairWeaponTwinIndex(wep, character.equipment, claimedEq);
        if (twinIdx >= 0) {
            claimedEq.add(twinIdx);
            const eq = character.equipment[twinIdx];
            if ((eq.weight === undefined || eq.weight === 0) && (wep.weight ?? 0) > 0) {
                eq.weight = wep.weight;
            } else if ((wep.weight === undefined || wep.weight === 0) && (eq.weight ?? 0) > 0) {
                wep.weight = eq.weight;
            }
            if (wep.isContainer && !eq.isContainer) eq.isContainer = true;
            if (eq.isContainer && !wep.isContainer) wep.isContainer = true;
            if (eq.capacityWeight == null && wep.capacityWeight != null) eq.capacityWeight = wep.capacityWeight;
            if (wep.containerId && !eq.containerId) eq.containerId = wep.containerId;
            if (eq.containerId && !wep.containerId) wep.containerId = eq.containerId;
            eq.quantity = wep.quantity ?? eq.quantity ?? 1;
            eq.attuned = Boolean(wep.attuned);
            if (eq.containerId || wep.containerId) {
                wep.equipped = false;
                eq.equipped = false;
            } else {
                eq.equipped = Boolean(wep.equipped);
            }
            twinPairs.push({ weapon: wep, equip: eq });
        } else {
            const twin: EquipmentItem = {
                id: wep.id,
                itemId: wep.itemId,
                definitionId: wep.definitionId,
                locked: wep.locked,
                name: wep.name,
                quantity: wep.quantity ?? 1,
                equipped: wep.containerId ? false : Boolean(wep.equipped),
                attuned: Boolean(wep.attuned),
                requiresAttunement: Boolean(wep.requiresAttunement),
                type: wep.category || "Weapon",
                filterType: "Weapon",
                isMagic: Boolean(wep.isMagic),
                rarity: wep.rarity,
                weight: wep.weight ?? lookupItemWeightLb(wep.name, wep.category) ?? 0,
                isContainer: wep.isContainer,
                capacityWeight: wep.capacityWeight,
                containerId: wep.containerId || undefined,
                description: wep.description,
                notes: wep.notes,
                imageUrl: wep.imageUrl,
                modifiers: wep.modifiers
            };
            character.equipment.push(twin);
            claimedEq.add(character.equipment.length - 1);
            twinPairs.push({ weapon: wep, equip: twin });
        }
    }

    // Normalize containerId references, break self/cyclic links, and enforce unequipped when stowed.
    character.equipment.forEach((eq, idx) => {
        if (!eq.containerId) return;
        const selfKey = getInventoryKey(eq, character.equipment, idx);
        const resolved = resolveContainerKey(character, eq.containerId);
        if (!resolved || resolved === selfKey || !canPutInContainer(character, selfKey, resolved)) {
            delete eq.containerId;
        } else {
            eq.containerId = resolved;
            eq.equipped = false;
        }
    });

    for (const { weapon, equip } of twinPairs) {
        weapon.containerId = equip.containerId;
        if (equip.containerId) {
            weapon.equipped = false;
            equip.equipped = false;
        }
    }
}

/** Checks whether placing `itemKey` inside `targetContainerKey` is valid (must be a container and not create a cycle). */
export function canPutInContainer(
    character: Pick<CharacterData, "equipment">,
    itemKey: string,
    targetContainerKey: string
): boolean {
    if (!targetContainerKey || itemKey === targetContainerKey) return false;
    const equipment = character.equipment || [];
    const map = buildKeyIndexMap(equipment);
    const target = map.get(targetContainerKey);
    if (!target || !target.item.isContainer) return false;

    const visited = new Set<string>([itemKey]);
    let cursor: { item: EquipmentItem; index: number; key: string } | undefined = target;
    while (cursor) {
        if (visited.has(cursor.key)) return false;
        visited.add(cursor.key);
        const parentKey: string | null = cursor.item.containerId
            ? (map.get(cursor.item.containerId)?.key ?? null)
            : null;
        cursor = parentKey ? map.get(parentKey) : undefined;
    }
    return true;
}

function itemUnitWeight(item: Pick<EquipmentItem, "weight">): number {
    const num = Number(item.weight);
    return Number.isFinite(num) && num > 0 ? num : 0;
}

function itemQuantity(item: Pick<EquipmentItem, "quantity">): number {
    const q = Number(item.quantity);
    if (!Number.isFinite(q) || q < 0) return 1;
    return q;
}

function computeRecursiveContents(
    equipment: EquipmentItem[],
    childrenByParent: Map<string, Array<{ item: EquipmentItem; key: string }>>,
    containerKey: string,
    respectNestedExtradimensional: boolean,
    visited: Set<string>
): { weight: number; quantity: number } {
    const children = childrenByParent.get(containerKey) || [];
    let totalWeight = 0;
    let totalQuantity = 0;

    for (const child of children) {
        if (visited.has(child.key)) continue;
        visited.add(child.key);

        const qty = itemQuantity(child.item);
        const ownWeight = roundWeightLb(itemUnitWeight(child.item) * qty);
        totalQuantity += qty;

        if (child.item.isContainer) {
            const childExt = isExtradimensionalContainerName(child.item.name, child.item.description);
            totalWeight = roundWeightLb(totalWeight + ownWeight);
            const nested = computeRecursiveContents(
                equipment,
                childrenByParent,
                child.key,
                respectNestedExtradimensional,
                visited
            );
            totalQuantity += nested.quantity;
            if (!respectNestedExtradimensional || !childExt) {
                totalWeight = roundWeightLb(totalWeight + nested.weight);
            }
        } else {
            totalWeight = roundWeightLb(totalWeight + ownWeight);
        }
    }

    return { weight: totalWeight, quantity: totalQuantity };
}

function buildChildrenMap(equipment: EquipmentItem[]): {
    byKey: Map<string, { item: EquipmentItem; index: number; key: string }>;
    childrenByParent: Map<string, Array<{ item: EquipmentItem; key: string }>>;
} {
    const byKey = buildKeyIndexMap(equipment);
    const childrenByParent = new Map<string, Array<{ item: EquipmentItem; key: string }>>();

    equipment.forEach((item, index) => {
        const key = getInventoryKey(item, equipment, index);
        if (!item.containerId) return;
        const parentEntry = byKey.get(item.containerId) || byKey.get(item.containerId.toLowerCase());
        if (!parentEntry || !parentEntry.item.isContainer || parentEntry.key === key) return;
        const arr = childrenByParent.get(parentEntry.key) || [];
        arr.push({ item, key });
        childrenByParent.set(parentEntry.key, arr);
    });

    return { byKey, childrenByParent };
}

/**
 * Computes recursive weight (including container's own weight, all contained items, and nested containers
 * even for extradimensional containers) and total item quantity inside a container.
 */
export function getContainerSummary(
    character: Pick<CharacterData, "equipment">,
    containerKey: string
): ContainerSummary | null {
    const equipment = character.equipment || [];
    const { byKey, childrenByParent } = buildChildrenMap(equipment);
    const entry = byKey.get(containerKey);
    if (!entry || !entry.item.isContainer) return null;

    const ownWeight = roundWeightLb(itemUnitWeight(entry.item) * itemQuantity(entry.item));
    const visited = new Set<string>([entry.key]);
    const contents = computeRecursiveContents(equipment, childrenByParent, entry.key, false, visited);
    const totalWeight = roundWeightLb(ownWeight + contents.weight);
    const capRaw = entry.item.capacityWeight;
    const capacityWeight = capRaw !== undefined && capRaw !== null && Number.isFinite(Number(capRaw)) && Number(capRaw) > 0
        ? Number(capRaw)
        : null;

    return {
        key: entry.key,
        container: entry.item,
        ownWeight,
        contentsWeight: contents.weight,
        totalWeight,
        capacityWeight,
        isOverCapacity: capacityWeight !== null && totalWeight > capacityWeight,
        totalQuantity: contents.quantity,
        extradimensional: isExtradimensionalContainerName(entry.item.name, entry.item.description)
    };
}

/**
 * Computes total carried weight across the character's equipment (stopping content recursion at
 * extradimensional containers so only their own weight counts toward character load) alongside derived carrying capacity.
 */
export function getCharacterWeightSummary(character: CharacterData): CharacterWeightSummary {
    const equipment = character.equipment || [];
    const { byKey, childrenByParent } = buildChildrenMap(equipment);
    const visited = new Set<string>();
    let carriedWeight = 0;

    equipment.forEach((item, index) => {
        const key = getInventoryKey(item, equipment, index);
        const parentEntry = item.containerId ? byKey.get(item.containerId) : undefined;
        if (parentEntry && parentEntry.item.isContainer && parentEntry.key !== key) {
            return; // Counted under its ancestor container
        }

        if (visited.has(key)) return;
        visited.add(key);

        const ownWeight = roundWeightLb(itemUnitWeight(item) * itemQuantity(item));
        carriedWeight = roundWeightLb(carriedWeight + ownWeight);

        if (item.isContainer) {
            const ext = isExtradimensionalContainerName(item.name, item.description);
            if (!ext) {
                const contents = computeRecursiveContents(equipment, childrenByParent, key, true, visited);
                carriedWeight = roundWeightLb(carriedWeight + contents.weight);
            }
        }
    });

    const breakdown = computeCarryingCapacity(character);
    const carryingCapacity = Math.max(0, breakdown.total);
    return {
        carriedWeight,
        carriedFormatted: formatWeightLb(carriedWeight),
        carryingCapacity,
        capacityFormatted: formatWeightLb(carryingCapacity),
        isEncumbered: carriedWeight > carryingCapacity,
        breakdown
    };
}

/** Stows an item inside `targetContainerKey` (auto-unequipping it and any weapon twin), or unstows when `null`. */
export function stowItem(
    character: CharacterData,
    itemKey: string,
    targetContainerKey: string | null
): boolean {
    ensureInventoryItemsSynced(character);
    const equipment = character.equipment || [];
    const equipIdx = equipment.findIndex((e, idx) => getInventoryKey(e, equipment, idx) === itemKey);
    if (equipIdx < 0) return false;
    const eqItem = equipment[equipIdx];

    const claimed = new Set<number>();
    const pairedWeapon = (character.weapons || []).find((w) => {
        const idx = pairWeaponTwinIndex(w, equipment, claimed);
        if (idx >= 0) claimed.add(idx);
        return idx === equipIdx;
    });

    if (!targetContainerKey) {
        delete eqItem.containerId;
        if (pairedWeapon) delete pairedWeapon.containerId;
        return true;
    }

    const resolved = resolveContainerKey(character, targetContainerKey);
    if (!resolved || !canPutInContainer(character, itemKey, resolved)) return false;

    eqItem.containerId = resolved;
    eqItem.equipped = false;
    if (pairedWeapon) {
        pairedWeapon.containerId = resolved;
        pairedWeapon.equipped = false;
    }
    return true;
}

/** Toggles equipped state on a weapon or equipment item (and its twin), automatically unstowing when equipped. */
export function setItemEquippedWithContainerUnstow(
    character: CharacterData,
    item: EquipmentItem | WeaponItem,
    equipped: boolean
): void {
    ensureInventoryItemsSynced(character);
    item.equipped = equipped;
    if (equipped && item.containerId) {
        delete item.containerId;
    }

    const equipment = character.equipment || [];
    const weapons = character.weapons || [];

    const eqIndex = equipment.indexOf(item as EquipmentItem);
    if (eqIndex >= 0) {
        const claimed = new Set<number>();
        const twinWep = weapons.find((w) => {
            const idx = pairWeaponTwinIndex(w, equipment, claimed);
            if (idx >= 0) claimed.add(idx);
            return idx === eqIndex;
        });
        if (twinWep) {
            twinWep.equipped = equipped;
            if (equipped) delete twinWep.containerId;
        }
        return;
    }

    const wepIndex = weapons.indexOf(item as WeaponItem);
    if (wepIndex >= 0) {
        const claimed = new Set<number>();
        for (let i = 0; i <= wepIndex; i++) {
            const idx = pairWeaponTwinIndex(weapons[i], equipment, claimed);
            if (idx >= 0) {
                claimed.add(idx);
                if (i === wepIndex) {
                    equipment[idx].equipped = equipped;
                    if (equipped) delete equipment[idx].containerId;
                }
            }
        }
    }
}
