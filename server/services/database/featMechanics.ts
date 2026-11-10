const MECHANICS_KEYS = ["modifiers", "resource", "limitedUse", "spellList", "defaultSpellAbility", "spellCantrips", "spellLevel1"];

/** A seed feat's mechanics (modifiers, resource, limitedUse, spellList, defaultSpellAbility) as stored JSON. */
export function featMechanicsJson(feat: any): string | undefined {
    const mechanics = Object.fromEntries(MECHANICS_KEYS.filter((k) => feat?.[k] !== undefined).map((k) => [k, feat[k]]));
    return Object.keys(mechanics).length > 0 ? JSON.stringify(mechanics) : undefined;
}
