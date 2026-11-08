/**
 * Helper to identify whether an entity imported from D&D Beyond or a character pull
 * is pre-2024 (legacy) material.
 */
export function isLegacyDndBeyondEntity(entity: any): boolean {
    if (!entity) return false;
    const def = entity.definition || entity;

    // 1. Explicit isLegacy flag on entity or definition
    if (
        def.isLegacy === true ||
        def.isLegacy === "true" ||
        def.isLegacy === 1 ||
        entity.isLegacy === true ||
        entity.isLegacy === "true" ||
        entity.isLegacy === 1
    ) {
        return true;
    }

    // 2. Check sourceId and sources array
    const sourceId = def.sourceId ?? entity.sourceId;
    const sources = def.sources ?? entity.sources;

    if (Array.isArray(sources) && sources.some((s: any) => s?.sourceId === 145 || s?.sourceId === 146 || s?.sourceId === 147)) {
        return false;
    }
    if (sourceId === 145 || sourceId === 146 || sourceId === 147) {
        return false;
    }
    if (sourceId !== undefined && sourceId !== null && Number(sourceId) > 0 && Number(sourceId) < 145) {
        return true;
    }

    // 3. Name or source string containing (2014) or legacy indicators
    const name = String(def.name || entity.name || "").toLowerCase();
    if (/\b(?:2014|legacy)\b/i.test(name) || name.includes("(2014)") || name.includes("[legacy]")) {
        return true;
    }

    const sourceStr = String(def.source || entity.source || "").toLowerCase();
    if (
        /\b(?:2014|legacy|srd\s*5\.1|open5e|basic rules)\b/i.test(sourceStr) ||
        sourceStr.includes("(2014)") ||
        sourceStr.includes("[legacy]")
    ) {
        return true;
    }

    return false;
}
