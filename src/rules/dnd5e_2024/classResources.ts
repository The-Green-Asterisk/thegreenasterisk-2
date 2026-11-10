import { AbilityName, ClassDefinition, ClassSubclassDefinition, ProgressionLevel, StatModifier } from "./types";

export interface ResolvedClassResource {
    name: string;
    total: number;
    resetOn: "short" | "long";
    dieOrType?: string;
    classId: string;
    /** Other feature names that use this resource (e.g. Cutting Words uses Bardic Inspiration) */
    aliases?: string[];
}

const ABILITIES: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];

/**
 * Class and subclass resources (progression resourceUpdates) as of each class's own level. Totals and dice can use
 * templates: "{{level}}" (class level), "{{pb}}", "{{cha}}" etc. (ability modifier, minimum 1). Dice-valued entries
 * such as Sneak Attack aren't uses to track and are left out. A resource two classes share keeps the larger total.
 */
export function resolveClassResources(
    classes: Array<{ def?: ClassDefinition; subclass?: ClassSubclassDefinition; level: number }>,
    abilityMod: (ability: AbilityName) => number,
    pb: number
): ResolvedClassResource[] {
    const result: ResolvedClassResource[] = [];
    for (const { def, subclass, level } of classes) {
        if (!def) continue;
        const resolve = (value: string): string => value.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
            const k = key.toLowerCase();
            if (k === "level") return String(level);
            if (k === "pb") return String(pb);
            if ((ABILITIES as string[]).includes(k)) return String(Math.max(1, abilityMod(k as AbilityName)));
            return "";
        });
        const latest = new Map<string, NonNullable<ProgressionLevel["resourceUpdates"]>[number]>();
        const levels = [...(def.progression || []), ...((subclass?.progression || []) as ProgressionLevel[])]
            .filter((pl) => pl.level <= level)
            .sort((a, b) => a.level - b.level);
        for (const pl of levels) {
            for (const r of pl.resourceUpdates || []) latest.set(r.name, r);
        }
        for (const r of latest.values()) {
            const total = typeof r.total === "number" ? r.total : Number(resolve(String(r.total)));
            if (!Number.isFinite(total) || total <= 0) continue;
            const existing = result.find((x) => x.name === r.name);
            if (existing) {
                existing.total = Math.max(existing.total, total);
                continue;
            }
            result.push({ name: r.name, total, resetOn: r.resetOn, dieOrType: r.die ? resolve(r.die) : undefined, classId: def.id, aliases: r.aliases });
        }
    }
    return result;
}

export interface ClassScaleValue {
    /** The feature, resource, or level badge name, plus other names that use it (resource aliases) */
    names: string[];
    value: string;
    classId: string;
}

/** "d8" → "1d8"; other values as they are. */
const asDice = (v: string) => (/^d\d+$/i.test(v.trim()) ? `1${v.trim()}` : v.trim());

/** Sums a resolved template like "3+5" (no other operators); anything else is returned as is. */
const sumIfNumeric = (v: string) => (/^[\d\s+-]+$/.test(v) ? String(v.split(/(?=[+-])/).reduce((t, p) => t + (Number(p) || 0), 0)) : v);

/**
 * The scaling numbers the character's unlocked class data gives, for filling in a feature's text: resource dice or
 * dice totals (Bardic Inspiration 1d8, Sneak Attack 3d6), level badges ("Martial Arts 1d8", "Rage Damage +2"),
 * feature scaleValue templates (Dark One's Blessing), and single-number feature modifiers (Unarmored Movement +15
 * ft., Aura of Protection +3).
 */
export function resolveClassScaleValues(
    classes: Array<{ def?: ClassDefinition; subclass?: ClassSubclassDefinition; level: number }>,
    abilityMod: (ability: AbilityName) => number,
    pb: number
): ClassScaleValue[] {
    const out: ClassScaleValue[] = [];
    for (const { def, subclass, level } of classes) {
        if (!def) continue;
        const resolve = (value: string): string => value.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
            const k = key.toLowerCase();
            if (k === "level") return String(level);
            if (k === "pb") return String(pb);
            if ((ABILITIES as string[]).includes(k)) return String(Math.max(1, abilityMod(k as AbilityName)));
            return "";
        });
        const levels = [...(def.progression || []), ...((subclass?.progression || []) as ProgressionLevel[])]
            .filter((pl) => pl.level <= level)
            .sort((a, b) => a.level - b.level);

        const latestResource = new Map<string, NonNullable<ProgressionLevel["resourceUpdates"]>[number]>();
        const latestBadge = new Map<string, string>();
        for (const pl of levels) {
            for (const r of pl.resourceUpdates || []) latestResource.set(r.name, r);
            for (const b of pl.badges || []) {
                const m = /^(.*?)\s+([+-]?\d+(?:d\d+)?(?:\s*[+-]\s*\d+)?(?:\s*ft\.?)?)$/i.exec(b.trim());
                if (m && m[1]) latestBadge.set(m[1], m[2]);
            }
            for (const f of pl.features || []) {
                if (f.scaleValue) out.push({ names: [f.name], value: sumIfNumeric(resolve(f.scaleValue)), classId: def.id });
                const nums = (f.modifiers || []).filter((m: StatModifier) => Array.isArray(m.valueByLevel) || (m.type === "ability_mod" && m.abilitySource));
                if (nums.length !== 1) continue;
                const m = nums[0];
                if (Array.isArray(m.valueByLevel)) {
                    const n = Number(m.valueByLevel[Math.min(level, m.valueByLevel.length - 1)]) || 0;
                    out.push({ names: [f.name], value: `+${n}${String(m.target).startsWith("vitals.speed") ? " ft." : ""}`, classId: def.id });
                } else {
                    const raw = abilityMod(m.abilitySource as AbilityName);
                    const n = typeof m.minimum === "number" ? Math.max(m.minimum, raw) : raw;
                    out.push({ names: [f.name], value: n >= 0 ? `+${n}` : String(n), classId: def.id });
                }
            }
        }
        for (const r of latestResource.values()) {
            const names = [r.name, ...(r.aliases || [])];
            if (r.die) out.push({ names, value: asDice(resolve(r.die)), classId: def.id });
            else if (typeof r.total === "string" && /d\d/i.test(r.total)) out.push({ names, value: resolve(r.total), classId: def.id });
        }
        for (const [name, value] of latestBadge) out.push({ names: [name], value, classId: def.id });
    }
    return out;
}
