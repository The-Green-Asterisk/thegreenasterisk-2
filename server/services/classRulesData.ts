import cache from "../cache";
import AppDataSource from "./database";
import RuleClass from "./database/entity/RuleClass";
import RuleFeat from "./database/entity/RuleFeat";
import RuleSpecies from "./database/entity/RuleSpecies";
import RuleSubclass from "./database/entity/RuleSubclass";
import { buildClassProgression, buildSubclassProgression } from "./database/rulesProgressionBuilder";
import { SEED_CLASSES } from "./database/rulesSeed";

interface ProgressionLevelData {
    level: number;
    features?: Array<{ name: string; modifiers?: unknown[]; actionGrant?: { name: string; type?: string } }>;
    choices?: Array<{ name: string; pool?: string }>;
    resourceUpdates?: Array<{ name: string; total: number | string; aliases?: string[] }>;
}

export interface ServerClassRule {
    slug: string;
    name: string;
    featureNames: string[];
    features: Array<{ name: string; level: number }>;
    progression: ProgressionLevelData[];
    subclasses: Array<{ slug: string; name: string; progression: ProgressionLevelData[] }>;
}

interface SpeciesTraitData {
    name: string;
    resource?: { name?: string };
    aliases?: string[];
    grantedSpells?: unknown[];
    scaleValues?: unknown[];
}

const CACHE_KEY = "class_rules_data";
const SPECIES_CACHE_KEY = "species_traits_data";
let lastLoaded: ServerClassRule[] = [];
let lastSpeciesTraits: SpeciesTraitData[] = [];
let lastFeatMechanics: Array<{ name: string; modifiers?: unknown[]; resource?: unknown; limitedUse?: unknown }> = [];

const slugify = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function parse<T>(json: string | null | undefined, fallback: T): T {
    if (!json) return fallback;
    try {
        return (JSON.parse(json) as T) ?? fallback;
    } catch {
        return fallback;
    }
}

/** Loads class and subclass features and progression (rule_classes, rule_subclasses), cached for 10 minutes. */
export async function loadClassRulesData(): Promise<ServerClassRule[]> {
    const cached = cache.get<ServerClassRule[]>(CACHE_KEY);
    if (cached) {
        lastSpeciesTraits = cache.get<SpeciesTraitData[]>(SPECIES_CACHE_KEY) || lastSpeciesTraits;
        lastFeatMechanics = cache.get<typeof lastFeatMechanics>("feat_mechanics_data") || lastFeatMechanics;
        return (lastLoaded = cached);
    }
    if (!AppDataSource.isInitialized) return lastLoaded;
    try {
        const [classes, subclasses] = await Promise.all([
            AppDataSource.getRepository(RuleClass).find(),
            AppDataSource.getRepository(RuleSubclass).find()
        ]);
        if (classes.length > 0) {
            const rules: ServerClassRule[] = classes.map((rc) => ({
                slug: rc.slug,
                name: rc.name,
                featureNames: parse<Array<{ name: string }>>(rc.featuresJson, []).map((f) => f?.name).filter(Boolean),
                features: parse<Array<{ name: string; level?: number }>>(rc.featuresJson, [])
                    .filter((f) => f?.name)
                    .map((f) => ({ name: f.name, level: Number(f.level) || 1 })),
                progression: parse<ProgressionLevelData[]>(rc.progressionJson, []),
                subclasses: subclasses
                    .filter((s) => s.classSlug === rc.slug)
                    .map((s) => ({ slug: slugify(s.slug || s.name), name: s.name, progression: parse<ProgressionLevelData[]>(s.progressionJson, []) }))
            }));
            cache.set(CACHE_KEY, rules, 600);
            lastLoaded = rules;
        }
        const species = await AppDataSource.getRepository(RuleSpecies).find();
        if (species.length > 0) {
            lastSpeciesTraits = species.flatMap((sp) => [
                ...parse<SpeciesTraitData[]>(sp.traitsJson, []),
                ...parse<Array<{ traits?: SpeciesTraitData[] }>>(sp.lineagesJson, []).flatMap((l) => l?.traits || [])
            ]).filter((t) => t?.name);
            cache.set(SPECIES_CACHE_KEY, lastSpeciesTraits, 600);
        }
        const feats = await AppDataSource.getRepository(RuleFeat).find();
        if (feats.length > 0) {
            lastFeatMechanics = feats.map((f) => ({ name: f.name, ...parse<Record<string, unknown>>(f.mechanicsJson, {}) }));
            cache.set("feat_mechanics_data", lastFeatMechanics, 600);
        }
    } catch (err) {
        console.warn("Could not load class rules:", err);
    }
    return lastLoaded;
}

function getFallbackClassRules(): ServerClassRule[] {
    return (SEED_CLASSES as any[]).map((c) => ({
        slug: c.id,
        name: c.name,
        featureNames: (c.features || []).map((f: any) => f?.name).filter(Boolean),
        features: (c.features || []).filter((f: any) => f?.name).map((f: any) => ({ name: f.name, level: Number(f.level) || 1 })),
        progression: buildClassProgression(c.id, c.features || []),
        subclasses: (c.subclasses || []).map((s: any) => ({
            slug: slugify(s.id || s.name),
            name: s.name,
            progression: buildSubclassProgression(c.id, s)
        }))
    }));
}

/** The most recently loaded class rules (empty until loadClassRulesData has run). */
export function getLoadedClassRules(): ServerClassRule[] {
    return lastLoaded.length > 0 ? lastLoaded : getFallbackClassRules();
}

export function findServerClassRule(nameOrSlug: string): ServerClassRule | undefined {
    const key = slugify(nameOrSlug);
    const list = lastLoaded.length > 0 ? lastLoaded : getFallbackClassRules();
    return list.find((r) => r.slug === key || slugify(r.name) === key);
}

function allLevels(rule: ServerClassRule): ProgressionLevelData[] {
    return [...rule.progression, ...rule.subclasses.flatMap((s) => s.progression)];
}

/**
 * Feature names the class rules say are used actively (resources and what else uses them, granted actions, with the
 * granted action's type) and ones that are picks or passive effects (choices, features that only change stats),
 * lower-case.
 */
export function classFeatureUsage(): { active: Set<string>; passive: Set<string>; grantTypes: Map<string, string> } {
    const active = new Set<string>();
    const passive = new Set<string>();
    const grantTypes = new Map<string, string>();
    for (const rule of lastLoaded) {
        for (const pl of allLevels(rule)) {
            for (const r of pl.resourceUpdates || []) [r.name, ...(r.aliases || [])].forEach((n) => active.add(n.toLowerCase()));
            for (const f of pl.features || []) {
                if (f.actionGrant?.name) {
                    active.add(f.actionGrant.name.toLowerCase());
                    if (f.actionGrant.type) grantTypes.set(f.actionGrant.name.toLowerCase(), f.actionGrant.type);
                }
            }
            for (const c of pl.choices || []) if (!c.pool) passive.add(c.name.toLowerCase());
        }
    }
    for (const rule of lastLoaded) {
        for (const pl of allLevels(rule)) {
            for (const f of pl.features || []) {
                const n = f.name.toLowerCase();
                if (Array.isArray(f.modifiers) && f.modifiers.length > 0 && !f.actionGrant && !active.has(n)) passive.add(n);
            }
        }
    }
    // Species traits: limited-use ones are active; ones that only change stats or senses are passive
    for (const t of lastSpeciesTraits) {
        const name = String(t.name).replace(/\s*\(Level \d+\)\s*$/i, "").toLowerCase();
        if (t.resource) {
            [name, String(t.resource.name || "").toLowerCase(), ...(t.aliases || []).map((a) => a.toLowerCase())].filter(Boolean).forEach((n) => active.add(n));
        } else if (!t.grantedSpells?.length && !t.scaleValues?.length) {
            passive.add(name);
        }
    }
    // Feats: ones with uses are active; ones that only change stats are passive (e.g. Alert)
    for (const f of lastFeatMechanics) {
        const name = String(f.name).toLowerCase();
        if (f.resource || f.limitedUse !== undefined) active.add(name);
        else if (Array.isArray(f.modifiers) && f.modifiers.length > 0) passive.add(name);
    }
    return { active, passive, grantTypes };
}

/**
 * Each class's and subclass's resource totals at the character's class levels (numeric, or "{{ability}}"/"{{level}}"/
 * "{{pb}}" templates), for raising totals saved under older formulas.
 */
export function expectedClassResourceTotals(
    classes: Array<{ name?: string; level?: number; subclass?: string }>,
    abilityMod: (ability: string) => number,
    pb: number
): Map<string, number> {
    const totals = new Map<string, number>();
    for (const c of classes || []) {
        const rule = findServerClassRule(String(c?.name || ""));
        if (!rule) continue;
        const level = Number(c?.level) || 1;
        const subKey = slugify(c?.subclass || "");
        const sub = subKey ? rule.subclasses.find((s) => s.slug === subKey || subKey.includes(s.slug) || slugify(s.name) === subKey) : undefined;
        const latest = new Map<string, number | string>();
        [...rule.progression, ...(sub?.progression || [])]
            .filter((pl) => pl.level <= level)
            .sort((a, b) => a.level - b.level)
            .forEach((pl) => (pl.resourceUpdates || []).forEach((r) => latest.set(r.name, r.total)));
        for (const [name, total] of latest) {
            const value = typeof total === "number"
                ? total
                : Number(String(total).replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
                    k === "level" ? String(level) : k === "pb" ? String(pb) : String(Math.max(1, abilityMod(k)))
                ));
            if (Number.isFinite(value) && value > 0) totals.set(name.toLowerCase(), Math.max(totals.get(name.toLowerCase()) || 0, value));
        }
    }
    return totals;
}
