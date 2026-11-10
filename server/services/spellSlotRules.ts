import cache from "../cache";
import AppDataSource from "./database";
import RuleClass from "./database/entity/RuleClass";
import RuleSubclass from "./database/entity/RuleSubclass";

interface SpellcastingRule {
    type: "full" | "half" | "third" | "pact";
    cantripsKnownByLevel?: number[];
    preparedSpellsByLevel?: number[];
    spellSlotsByLevel?: number[][];
}

interface ClassSpellcastingRules {
    slug: string;
    name: string;
    spellcasting?: SpellcastingRule;
    subclasses: Array<{ slug: string; name: string; spellcasting?: SpellcastingRule }>;
}

// The multiclass spellcaster table (2024 rules): slots by combined caster level. A general rule, not class data.
const MULTICLASS_SPELL_SLOTS: number[][] = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0, 0, 0, 0], [4, 2, 0, 0, 0, 0, 0, 0, 0], [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0], [4, 3, 3, 0, 0, 0, 0, 0, 0], [4, 3, 3, 1, 0, 0, 0, 0, 0], [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0], [4, 3, 3, 3, 2, 0, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0], [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 0, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0], [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]
];

const CACHE_KEY = "class_spellcasting_rules";
let lastLoaded: ClassSpellcastingRules[] = [];

const slugify = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function parse<T>(json: string | null | undefined): T | undefined {
    if (!json) return undefined;
    try {
        return JSON.parse(json) as T;
    } catch {
        return undefined;
    }
}

/**
 * Loads each class's spellcasting (rule_classes.spellcastingJson) and its subclasses' (rule_subclasses /
 * subclassesJson spellcastingOverride), cached for 10 minutes. Call before computeSpellSlotsFromRules.
 */
export async function loadClassSpellcastingRules(): Promise<ClassSpellcastingRules[]> {
    const cached = cache.get<ClassSpellcastingRules[]>(CACHE_KEY);
    if (cached) return (lastLoaded = cached);
    if (!AppDataSource.isInitialized) return lastLoaded;
    try {
        const [classes, subclasses] = await Promise.all([
            AppDataSource.getRepository(RuleClass).find(),
            AppDataSource.getRepository(RuleSubclass).find()
        ]);
        const rules: ClassSpellcastingRules[] = classes.map((rc) => {
            const embedded = parse<any[]>(rc.subclassesJson) || [];
            const subs = new Map<string, { slug: string; name: string; spellcasting?: SpellcastingRule }>();
            for (const s of embedded) {
                if (!s?.name) continue;
                subs.set(slugify(s.id || s.name), { slug: slugify(s.id || s.name), name: s.name, spellcasting: s.spellcastingOverride });
            }
            for (const rs of subclasses.filter((x) => x.classSlug === rc.slug)) {
                const override = parse<SpellcastingRule>(rs.spellcastingOverrideJson);
                const key = slugify(rs.slug || rs.name);
                const existing = subs.get(key);
                subs.set(key, { slug: key, name: rs.name, spellcasting: override || existing?.spellcasting });
            }
            return { slug: rc.slug, name: rc.name, spellcasting: parse<SpellcastingRule>(rc.spellcastingJson), subclasses: Array.from(subs.values()) };
        });
        cache.set(CACHE_KEY, rules, 600);
        lastLoaded = rules;
    } catch (err) {
        console.warn("Could not load class spellcasting rules:", err);
    }
    return lastLoaded;
}

/**
 * Standard and Pact Magic spell slots for a character's classes, from the most recently loaded class rules: a single
 * spellcasting class uses its own slot table; several use the multiclass table (full levels + half rounded up +
 * third rounded down); Pact Magic comes from the pact caster's own table.
 */
export function computeSpellSlotsFromRules(classes: Array<{ name?: string; level?: number; subclass?: string }>): {
    standard: number[];
    pact?: { count: number; level: number };
} {
    const casters: Array<{ type: SpellcastingRule["type"]; level: number; table?: number[][] }> = [];
    for (const c of classes || []) {
        const level = Math.max(1, Math.min(20, Number(c?.level) || 1));
        const key = slugify(c?.name || "");
        const rule = lastLoaded.find((r) => r.slug === key || slugify(r.name) === key);
        if (!rule) continue;
        const subKey = slugify(c?.subclass || "");
        const sub = subKey ? rule.subclasses.find((s) => s.slug === subKey || slugify(s.name) === subKey) : undefined;
        const sc = rule.spellcasting || sub?.spellcasting;
        if (!sc) continue;
        const idx = level - 1;
        const hasAny = (sc.spellSlotsByLevel?.[idx] || []).some((v) => v > 0) ||
            (sc.cantripsKnownByLevel?.[idx] || 0) > 0 || (sc.preparedSpellsByLevel?.[idx] || 0) > 0;
        if (hasAny) casters.push({ type: sc.type, level, table: sc.spellSlotsByLevel });
    }

    if (casters.length === 0) {
        const FULL_CASTERS = new Set(["bard", "cleric", "druid", "sorcerer", "wizard"]);
        const HALF_CASTERS = new Set(["paladin", "ranger"]);
        for (const c of classes || []) {
            const key = slugify(c?.name || "");
            const level = Math.max(1, Math.min(20, Number(c?.level) || 1));
            if (FULL_CASTERS.has(key)) {
                casters.push({ type: "full", level, table: MULTICLASS_SPELL_SLOTS });
            } else if (HALF_CASTERS.has(key)) {
                casters.push({ type: "half", level, table: MULTICLASS_SPELL_SLOTS });
            } else if (key === "warlock") {
                casters.push({ type: "pact", level });
            }
        }
    }

    let standard = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const standardCasters = casters.filter((c) => c.type !== "pact");
    if (standardCasters.length === 1) {
        const only = standardCasters[0];
        const row = only.table?.[only.level - 1] || [];
        standard = standard.map((_, i) => Number(row[i]) || 0);
    } else if (standardCasters.length > 1) {
        const casterLevel = standardCasters.reduce((sum, c) =>
            sum + (c.type === "full" ? c.level : c.type === "half" ? Math.ceil(c.level / 2) : Math.floor(c.level / 3)), 0);
        if (casterLevel > 0) standard = [...MULTICLASS_SPELL_SLOTS[Math.min(20, casterLevel) - 1]];
    }

    let pact: { count: number; level: number } | undefined;
    const pactCaster = casters.find((c) => c.type === "pact");
    if (pactCaster) {
        (pactCaster.table?.[pactCaster.level - 1] || []).forEach((count, i) => {
            if (count > 0) pact = { count, level: i + 1 };
        });
    }
    return { standard, pact };
}
