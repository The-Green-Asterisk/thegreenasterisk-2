/**
 * A loaded character's vitals: the vitals row's columns, over the saved payload's vitals for everything the row has
 * no column for (Devil's Sight, resistances, condition immunities, and whatever is added later).
 */
export function mergeVitals(rowVitals: Record<string, unknown> | undefined, payloadVitals: unknown): any {
    const fromPayload = payloadVitals && typeof payloadVitals === "object" ? payloadVitals as Record<string, unknown> : {};
    if (!rowVitals) return payloadVitals;
    return { ...fromPayload, ...rowVitals };
}
