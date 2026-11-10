/**
 * Magic items' rules modifiers, by item name, for items whose effects the sheet reads from data. They apply while the
 * item is equipped (and attuned, when it needs attunement). An item's own modifiersJson (custom items) wins over this.
 * Special senses use senses.<key> / vitals.<sense> targets: "set" = at least N ft., "bonus" = N ft. farther (or N ft.).
 */
export const SEED_ITEM_MECHANICS: Array<{ name: string; modifiers: any[] }> = [
    {
        name: "Goggles of Night",
        modifiers: [{ target: "vitals.darkvision", type: "bonus", value: 60, description: "Darkvision 60 ft., or 60 ft. farther if you already have it" }]
    },
    {
        name: "Robe of Eyes",
        modifiers: [{ target: "vitals.darkvision", type: "set", value: 120, description: "Darkvision 120 ft." }]
    }
];

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase().replace(/[’‘`]/g, "'");

/** Every item with rules modifiers: items' own modifiersJson, then the seed list for items without their own. */
export function itemMechanicsRules(rows: Array<{ name: string; modifiersJson?: string | null }>): Array<{ name: string; modifiers: any[] }> {
    const out = new Map<string, { name: string; modifiers: any[] }>();
    for (const row of rows) {
        if (!row?.modifiersJson) continue;
        try {
            const modifiers = JSON.parse(row.modifiersJson);
            if (Array.isArray(modifiers) && modifiers.length > 0) out.set(norm(row.name), { name: row.name, modifiers });
        } catch {
            // Malformed custom data: the item has no rules modifiers
        }
    }
    for (const seed of SEED_ITEM_MECHANICS) {
        if (!out.has(norm(seed.name))) out.set(norm(seed.name), seed);
    }
    return [...out.values()];
}
