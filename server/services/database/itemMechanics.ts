/**
 * Magic items' rules modifiers, by item name, for the effects the sheet reads from data. They apply while the item is
 * equipped (and attuned, when it needs attunement). An item's own modifiersJson (custom items) wins over this list.
 * A "+1"/"+2"/"+3" variant ("Rod of the Pact Keeper, +2") uses its base name's entry; value "{{plus}}" is that number.
 *
 * Targets and types:
 *   abilities.<str..cha>  set (score becomes at least N) | bonus (+N)
 *   vitals.ac             bonus (+N; `requires` limits it to an armor state, e.g. "no-armor-or-shield")
 *   saves.all             bonus (+N to every saving throw)
 *   checks.all            bonus (+N to every ability check, so skills and passives)
 *   spells.attack / spells.dc  bonus (+N; the best item counts, they don't stack)
 *   vitals.speed          bonus (+N ft.)
 *   vitals.initiative     bonus (+N) | advantage (shown as a note)
 *   skills.<skill> / saves.<ab>  advantage | disadvantage (shown as a note)
 *   item.plus             set (the item's own +N: weapon attack and damage, armor or shield AC)
 *   senses.<key> / vitals.<sense>  set | bonus (special senses; see senses.ts)
 */
export const SEED_ITEM_MECHANICS: Array<{ name: string; modifiers: any[] }> = [
    // Ability scores
    { name: "Gauntlets of Ogre Power", modifiers: [{ target: "abilities.str", type: "set", value: 19 }] },
    { name: "Belt of Hill Giant Strength", modifiers: [{ target: "abilities.str", type: "set", value: 21 }] },
    { name: "Belt of Frost Giant Strength", modifiers: [{ target: "abilities.str", type: "set", value: 23 }] },
    { name: "Belt of Stone Giant Strength", modifiers: [{ target: "abilities.str", type: "set", value: 23 }] },
    { name: "Belt of Fire Giant Strength", modifiers: [{ target: "abilities.str", type: "set", value: 25 }] },
    { name: "Belt of Cloud Giant Strength", modifiers: [{ target: "abilities.str", type: "set", value: 27 }] },
    { name: "Belt of Storm Giant Strength", modifiers: [{ target: "abilities.str", type: "set", value: 29 }] },
    { name: "Headband of Intellect", modifiers: [{ target: "abilities.int", type: "set", value: 19 }] },
    { name: "Amulet of Health", modifiers: [{ target: "abilities.con", type: "set", value: 19 }] },
    { name: "Ioun Stone of Strength", modifiers: [{ target: "abilities.str", type: "bonus", value: 2 }] },
    { name: "Ioun Stone of Agility", modifiers: [{ target: "abilities.dex", type: "bonus", value: 2 }] },
    { name: "Ioun Stone of Fortitude", modifiers: [{ target: "abilities.con", type: "bonus", value: 2 }] },
    { name: "Ioun Stone of Intellect", modifiers: [{ target: "abilities.int", type: "bonus", value: 2 }] },
    { name: "Ioun Stone of Insight", modifiers: [{ target: "abilities.wis", type: "bonus", value: 2 }] },
    { name: "Ioun Stone of Leadership", modifiers: [{ target: "abilities.cha", type: "bonus", value: 2 }] },

    // Armor Class and saving throws
    { name: "Cloak of Protection", modifiers: [{ target: "vitals.ac", type: "bonus", value: 1 }, { target: "saves.all", type: "bonus", value: 1 }] },
    { name: "Ring of Protection", modifiers: [{ target: "vitals.ac", type: "bonus", value: 1 }, { target: "saves.all", type: "bonus", value: 1 }] },
    { name: "Ioun Stone of Protection", modifiers: [{ target: "vitals.ac", type: "bonus", value: 1 }] },
    { name: "Bracers of Defense", modifiers: [{ target: "vitals.ac", type: "bonus", value: 2, requires: "no-armor-or-shield" }] },
    ...["Stone of Good Luck (Luckstone)", "Stone of Good Luck", "Luckstone"].map((name) => ({
        name,
        modifiers: [{ target: "saves.all", type: "bonus", value: 1 }, { target: "checks.all", type: "bonus", value: 1 }]
    })),
    {
        name: "Staff of Power",
        modifiers: [
            { target: "item.plus", type: "set", value: 2 },
            { target: "vitals.ac", type: "bonus", value: 2 },
            { target: "saves.all", type: "bonus", value: 2 },
            { target: "spells.attack", type: "bonus", value: 2 },
            { target: "spells.dc", type: "bonus", value: 2 }
        ]
    },
    {
        name: "Staff of the Magi",
        modifiers: [{ target: "item.plus", type: "set", value: 2 }, { target: "spells.attack", type: "bonus", value: 2 }, { target: "spells.dc", type: "bonus", value: 2 }]
    },
    { name: "Robe of the Archmagi", modifiers: [{ target: "spells.attack", type: "bonus", value: 2 }, { target: "spells.dc", type: "bonus", value: 2 }] },

    // Spellcasting foci (+1, +2, or +3 by variant)
    ...["Rod of the Pact Keeper", "Amulet of the Devout", "Bloodwell Vial", "Moon Sickle", "All-Purpose Tool", "Rhythm-Maker's Drum"].map((name) => ({
        name,
        modifiers: [{ target: "spells.attack", type: "bonus", value: "{{plus}}" }, { target: "spells.dc", type: "bonus", value: "{{plus}}" }]
    })),
    { name: "Wand of the War Mage", modifiers: [{ target: "spells.attack", type: "bonus", value: "{{plus}}" }] },

    // Weapons with a fixed bonus their name doesn't show
    { name: "Holy Avenger", modifiers: [{ target: "item.plus", type: "set", value: 3 }] },
    { name: "Sun Blade", modifiers: [{ target: "item.plus", type: "set", value: 2 }] },

    // Initiative and checks
    { name: "Weapon of Warning", modifiers: [{ target: "vitals.initiative", type: "advantage" }] },
    { name: "Sentinel Shield", modifiers: [{ target: "vitals.initiative", type: "advantage" }, { target: "skills.perception", type: "advantage" }] },

    // Special senses
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

/**
 * Every item with rules modifiers: items' own modifiersJson, then the seed list for items without their own.
 * An item's own empty list ("[]", saved from the Edit dialog) means no effects, so the seed doesn't fill it in;
 * a null modifiersJson means "use the seed".
 */
export function itemMechanicsRules(rows: Array<{ name: string; modifiersJson?: string | null }>): Array<{ name: string; modifiers: any[] }> {
    const out = new Map<string, { name: string; modifiers: any[] }>();
    for (const row of rows) {
        if (!row?.modifiersJson) continue;
        try {
            const modifiers = JSON.parse(row.modifiersJson);
            if (Array.isArray(modifiers)) out.set(norm(row.name), { name: row.name, modifiers });
        } catch {
            // Malformed custom data: the item has no rules modifiers
        }
    }
    for (const seed of SEED_ITEM_MECHANICS) {
        if (!out.has(norm(seed.name))) out.set(norm(seed.name), seed);
    }
    return [...out.values()];
}

/** The seed list's modifiers for an item name, matching "+1"/"+2"/"+3" variants to their base name like the sheet does */
export function seedItemModifiers(name: string): any[] | undefined {
    const key = norm(name);
    if (!key) return undefined;
    const exact = SEED_ITEM_MECHANICS.find((s) => norm(s.name) === key);
    if (exact) return exact.modifiers;
    const base = key.replace(/,?\s*\+\s*[1-3]\b/g, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    return base && base !== key ? SEED_ITEM_MECHANICS.find((s) => norm(s.name) === base)?.modifiers : undefined;
}

const MODIFIER_TYPES = new Set([
    "bonus", "penalty", "advantage", "disadvantage", "set", "proficiency_tier", "ability_mod", "resource_pool",
    "grant_action", "grant_spell", "grant_feature", "multiplier", "half_proficiency", "unarmored_ac"
]);
const ABILITIES = new Set(["str", "dex", "con", "int", "wis", "cha"]);
const REQUIRES = new Set(["no-armor", "no-heavy-armor", "no-armor-or-shield", "armor"]);

/**
 * What to store as an item's modifiersJson from the Edit dialog's effects: well-formed StatModifiers only (target
 * and type, a number or short template value, and the optional fields items use), at most 30. An empty list is
 * stored as "[]" (no effects); anything that isn't a list stores nothing.
 */
export function sanitizeItemModifiers(input: unknown): string | null {
    if (!Array.isArray(input)) return null;
    const out: any[] = [];
    for (const raw of input.slice(0, 30)) {
        if (!raw || typeof raw !== "object") continue;
        const target = typeof raw.target === "string" ? raw.target.trim().slice(0, 100) : "";
        const type = typeof raw.type === "string" ? raw.type.trim() : "";
        if (!target || !MODIFIER_TYPES.has(type)) continue;
        const mod: any = { target, type };
        if (typeof raw.value === "number" && Number.isFinite(raw.value)) mod.value = raw.value;
        else if (typeof raw.value === "string" && raw.value.trim()) mod.value = raw.value.trim().slice(0, 40);
        if (ABILITIES.has(raw.abilitySource)) mod.abilitySource = raw.abilitySource;
        if (typeof raw.minimum === "number" && Number.isFinite(raw.minimum)) mod.minimum = raw.minimum;
        if (REQUIRES.has(raw.requires)) mod.requires = raw.requires;
        for (const key of ["condition", "label", "description"]) {
            if (typeof raw[key] === "string" && raw[key].trim()) mod[key] = raw[key].trim().slice(0, 255);
        }
        out.push(mod);
    }
    return JSON.stringify(out);
}
