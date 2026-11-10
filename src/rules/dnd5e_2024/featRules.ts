import { FeatMechanics, StatModifier } from "./types";

/** A feat modifier's number: "{{pb}}" is the Proficiency Bonus, perClassLevel counts character levels. */
export function featModifierNumber(m: StatModifier, level: number, pb: number): number {
    if (typeof m.perClassLevel === "number") return m.perClassLevel * level;
    if (typeof m.value === "string" && /\{\{pb\}\}/i.test(m.value)) return pb;
    return typeof m.value === "number" ? m.value : Number(m.value) || 0;
}

/** The modifiers the given feats have for a target (and type), e.g. "vitals.maxHp" bonuses. */
export function featModifiers(feats: FeatMechanics[], target: string, type?: string): StatModifier[] {
    return feats.flatMap((f) => f.modifiers || []).filter((m) => m.target === target && (!type || m.type === type));
}

/** Sum of the feats' bonuses to a target at this character level. */
export function featBonus(feats: FeatMechanics[], target: string, level: number, pb: number): number {
    return featModifiers(feats, target, "bonus").reduce((sum, m) => sum + featModifierNumber(m, level, pb), 0);
}

/** Resources the feats give to track (e.g. Lucky's Luck Points), with "{{pb}}" totals resolved. */
export function resolveFeatResources(
    feats: Array<FeatMechanics & { name: string }>,
    pb: number,
    level: number
): Array<{ name: string; total: number; resetOn: "short" | "long" }> {
    const out: Array<{ name: string; total: number; resetOn: "short" | "long" }> = [];
    for (const f of feats) {
        if (!f.resource) continue;
        const raw = String(f.resource.total).replace(/\{\{pb\}\}/gi, String(pb)).replace(/\{\{level\}\}/gi, String(level));
        const total = Number(raw);
        const name = f.resource.name || f.name;
        if (Number.isFinite(total) && total > 0 && !out.some((r) => r.name === name)) out.push({ name, total, resetOn: f.resource.resetOn });
    }
    return out;
}
