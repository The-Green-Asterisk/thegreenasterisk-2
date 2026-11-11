/**
 * Field locks on spells and items: an edit can lock fields so D&D Beyond reloads and the auto-fixes that rewrite
 * rows (legacy upgrades, potion and mundane-gear reclassification) leave them as edited. Each lock key covers the
 * columns one dialog field writes. The edit dialogs offer the same keys.
 */
export const SPELL_LOCK_COLUMNS: Record<string, string[]> = {
    name: ["name"],
    level: ["level"],
    school: ["school"],
    castingTime: ["castingTime"],
    range: ["range"],
    duration: ["duration"],
    components: ["components"],
    ritual: ["ritual"],
    concentration: ["concentration"],
    damage: ["damageDice", "damageType", "damageModifier", "damageScaling"],
    description: ["description"],
    imageUrl: ["imageUrl"]
};

export const ITEM_LOCK_COLUMNS: Record<string, string[]> = {
    name: ["name"],
    filterType: ["filterType"],
    category: ["category"],
    rarity: ["rarity"],
    isMagic: ["isMagic"],
    requiresAttunement: ["requiresAttunement"],
    damage: ["damage"],
    range: ["range"],
    properties: ["properties"],
    mastery: ["mastery"],
    weight: ["weight"],
    cost: ["cost"],
    description: ["description"],
    imageUrl: ["imageUrl"]
};

/** The lock keys turned on in a row's stored lockedFields (bad JSON reads as none) */
export function parseLockedFields(raw: unknown): Record<string, boolean> {
    let parsed: unknown = raw;
    if (typeof raw === "string") {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return {};
        }
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([, v]) => v === true).map(([k]) => [k, true]));
}

/** What to store from the locks an edit sent: known keys only, null when none are on */
export function normalizeLockedFields(input: unknown, columns: Record<string, string[]>): string | null {
    const on = Object.keys(parseLockedFields(input)).filter((key) => key in columns).sort();
    return on.length > 0 ? JSON.stringify(Object.fromEntries(on.map((key) => [key, true]))) : null;
}

/**
 * Puts the locked columns back the way they were before something rewrote the row, so call it after the rewrite
 * and before saving. `before` is a copy of the row taken first.
 */
export function keepLockedFields<T extends object>(row: T & { lockedFields?: string | null }, before: Partial<T>, columns: Record<string, string[]>): void {
    const locks = parseLockedFields(row.lockedFields);
    for (const key of Object.keys(locks)) {
        for (const column of columns[key] || []) {
            (row as any)[column] = (before as any)[column];
        }
    }
}

/** Whether any column differs from the copy taken before a rewrite (after keepLockedFields, a rewrite of only locked columns isn't one) */
export function differsFrom<T extends object>(row: T, before: Partial<T>): boolean {
    return Object.keys(before).some((key) => (row as any)[key] !== (before as any)[key]);
}
