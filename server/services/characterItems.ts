/**
 * A loaded character's weapons or equipment: each inventory row's columns over the same item in the saved payload
 * (matched by name, in order, so two daggers pair with two daggers), keeping what the rows have no column for
 * (item modifiers such as Goggles of Night's darkvision, charges, D&D Beyond definition ids).
 */
export function mergeRowItems(rowItems: any[], payloadItems: unknown): any[] {
    const pool = Array.isArray(payloadItems) ? [...payloadItems] : [];
    const key = (x: any) => String(x?.name ?? "").trim().toLowerCase();
    return rowItems.map((row) => {
        const i = pool.findIndex((p) => key(p) === key(row));
        const fromPayload = i >= 0 ? pool.splice(i, 1)[0] : undefined;
        const defined = Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
        return fromPayload && typeof fromPayload === "object" ? { ...fromPayload, ...defined } : row;
    });
}
