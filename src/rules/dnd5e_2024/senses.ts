/**
 * Special senses from rules data. Any class or subclass feature, option, feat, or species trait can give a sense with a
 * modifier on "senses.<key>" (or the older "vitals.darkvision", "vitals.blindsight", ... targets):
 *   - type "set": the sense reaches at least `value` feet (senses from several sources don't add up)
 *   - type "bonus": the sense reaches `value` feet farther, or `value` feet if the character didn't have it
 * A sense the sheet doesn't know yet takes its name from the modifier's `label` (default: the key, capitalized).
 * Each grant keeps its source so taking a feature away takes away exactly what it gave.
 */

export interface SenseGrant {
    key: string;
    type: "set" | "bonus";
    value: number;
    label?: string;
    source?: string;
}

export interface OtherSense {
    key: string;
    label: string;
    range: string;
}

/** Senses with their own vitals field (and database column), by key. */
const VITALS_FIELDS: Record<string, { field: "darkvision" | "blindsight" | "tremorsense" | "truesight" | "devilsSight"; label: string }> = {
    darkvision: { field: "darkvision", label: "Darkvision" },
    blindsight: { field: "blindsight", label: "Blindsight" },
    tremorsense: { field: "tremorsense", label: "Tremorsense" },
    truesight: { field: "truesight", label: "Truesight" },
    "devils-sight": { field: "devilsSight", label: "Devil's Sight" }
};

const slug = (s: string) => String(s || "").trim().replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** The sense a modifier target is about ("senses.echolocation", "vitals.darkvision", "vitals.devilsSight"), if any. */
export function senseKeyOfTarget(target: unknown): string | undefined {
    const t = String(target || "");
    if (t.startsWith("senses.")) return slug(t.slice("senses.".length)) || undefined;
    if (t.startsWith("vitals.")) {
        const key = slug(t.slice("vitals.".length));
        return VITALS_FIELDS[key] ? key : undefined;
    }
    return undefined;
}

/** Feet in a range ("60 ft.", 60, "None" → 0). */
export function rangeFeet(v: unknown): number {
    const n = typeof v === "number" ? v : Number(String(v ?? "").match(/\d+/)?.[0]);
    return Number.isFinite(n) && n > 0 ? n : 0;
}

const feet = (n: number) => `${n} ft.`;

export function senseLabel(key: string, fallback?: string): string {
    return VITALS_FIELDS[key]?.label || fallback || key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/** The sense grants in rules modifiers, each named by what grants it. */
export function senseGrantsFrom(sources: Array<{ name?: string; modifiers?: Array<{ target?: string; type?: string; value?: unknown; label?: string; description?: string }> }>): SenseGrant[] {
    const out: SenseGrant[] = [];
    for (const src of sources) {
        for (const m of src.modifiers || []) {
            const key = senseKeyOfTarget(m.target);
            if (!key || (m.type !== "set" && m.type !== "bonus")) continue;
            const value = rangeFeet(m.value);
            if (value <= 0) continue;
            out.push({ key, type: m.type, value, ...(m.label ? { label: m.label } : {}), ...(src.name ? { source: src.name } : {}) });
        }
    }
    return out;
}

/** Senses (feet by key) after the grants: the base, raised by "set" grants, then extended by "bonus" grants. */
export function resolveSenses(base: Record<string, number>, grants: SenseGrant[]): Record<string, number> {
    const out: Record<string, number> = { ...base };
    for (const g of grants.filter((x) => x.type === "set")) out[g.key] = Math.max(out[g.key] || 0, g.value);
    for (const g of grants.filter((x) => x.type === "bonus")) out[g.key] = (out[g.key] || 0) + g.value;
    return out;
}

type VitalsWithSenses = { darkvision?: string; blindsight?: string; tremorsense?: string; truesight?: string; devilsSight?: string; otherSenses?: OtherSense[] };

/** A character's senses as stored in its vitals, feet by key. */
export function readSenses(vitals: VitalsWithSenses | undefined): Record<string, number> {
    const out: Record<string, number> = {};
    if (!vitals) return out;
    for (const [key, { field }] of Object.entries(VITALS_FIELDS)) {
        const n = rangeFeet(vitals[field]);
        if (n > 0) out[key] = n;
    }
    for (const s of vitals.otherSenses || []) {
        const n = rangeFeet(s.range);
        if (n > 0) out[s.key] = n;
    }
    return out;
}

/** Writes senses into vitals: the senses with their own field there ("None" when absent), the rest as otherSenses. */
export function writeSenses(vitals: VitalsWithSenses, senses: Record<string, number>, grants: SenseGrant[] = [], previous: OtherSense[] = []): void {
    for (const [key, { field }] of Object.entries(VITALS_FIELDS)) {
        const n = senses[key] || 0;
        if (field === "devilsSight") vitals.devilsSight = n > 0 ? feet(n) : undefined;
        else vitals[field] = n > 0 ? feet(n) : "None";
    }
    const others = Object.entries(senses)
        .filter(([key, n]) => !VITALS_FIELDS[key] && n > 0)
        .map(([key, n]) => ({
            key,
            label: senseLabel(key, grants.find((g) => g.key === key && g.label)?.label || previous.find((p) => p.key === key)?.label),
            range: feet(n)
        }));
    if (others.length > 0) vitals.otherSenses = others;
    else delete vitals.otherSenses;
}

/** Every sense the character has, in sheet order, for display ("Darkvision", "60 ft."). */
export function listSenses(vitals: VitalsWithSenses | undefined): Array<{ key: string; label: string; range: string }> {
    const senses = readSenses(vitals);
    const known = Object.keys(VITALS_FIELDS).filter((k) => senses[k]).map((k) => ({ key: k, label: VITALS_FIELDS[k].label, range: feet(senses[k]) }));
    return [...known, ...(vitals?.otherSenses || []).filter((s) => rangeFeet(s.range) > 0)];
}

/**
 * Adds (or with `remove`, takes back) one source's sense grants on a character and recomputes its senses from the
 * senses it had without any rules grants (baseSenses, recorded the first time; for an imported character, what D&D
 * Beyond gave).
 */
export function applySenseGrants(
    character: { vitals: VitalsWithSenses; baseSenses?: Record<string, number>; senseGrants?: SenseGrant[] },
    grants: SenseGrant[],
    remove = false
): void {
    if (!character?.vitals || grants.length === 0) return;
    // A character saved before senses were recorded: what it has now is the best base there is
    if (!character.baseSenses) character.baseSenses = readSenses(character.vitals);
    let list = character.senseGrants || [];
    for (const g of grants) {
        const same = (x: SenseGrant) => x.key === g.key && x.type === g.type && x.value === g.value && (x.source || "") === (g.source || "");
        if (remove) {
            const i = list.findIndex(same);
            if (i >= 0) list = [...list.slice(0, i), ...list.slice(i + 1)];
        } else {
            list = [...list, g];
        }
    }
    character.senseGrants = list;
    writeSenses(character.vitals, resolveSenses(character.baseSenses, list), list, character.vitals.otherSenses);
}
