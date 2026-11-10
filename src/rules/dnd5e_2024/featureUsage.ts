import { traitBaseName } from "./speciesRules";
import { ClassDefinition, ProgressionLevel, SpeciesDefinition } from "./types";

export interface FeatureUsage {
    /** Features that spend a resource or grant an action */
    active: Set<string>;
    /** Picks and stat-only features */
    passive: Set<string>;
    /** Granted action types by feature name ("Reaction" for Cosmic Omen) */
    grantTypes: Map<string, string>;
}

/**
 * Which class, subclass, and species features are used actively and which are passive, lower-case, from the rules
 * data: class resources (and their aliases), granted actions, choices, and stat-only features; species traits with
 * limited uses, and those that only change stats or senses.
 */
export function featureUsage(classes: ClassDefinition[], species: SpeciesDefinition[]): FeatureUsage {
    const active = new Set<string>();
    const passive = new Set<string>();
    const grantTypes = new Map<string, string>();
    const levels: ProgressionLevel[] = classes.flatMap((c) => [
        ...(c.progression || []),
        ...(c.subclasses || []).flatMap((s) => ((s as any).progression || []) as ProgressionLevel[])
    ]);
    for (const pl of levels) {
        for (const r of pl.resourceUpdates || []) [r.name, ...(r.aliases || [])].forEach((n) => active.add(n.toLowerCase()));
        for (const f of pl.features || []) {
            if (f.actionGrant?.name) {
                active.add(f.actionGrant.name.toLowerCase());
                grantTypes.set(f.actionGrant.name.toLowerCase(), f.actionGrant.type);
            }
        }
        for (const c of pl.choices || []) if (!c.pool) passive.add(c.name.toLowerCase());
    }
    for (const pl of levels) {
        for (const f of pl.features || []) {
            const n = f.name.toLowerCase();
            if ((f.modifiers || []).length > 0 && !f.actionGrant && !active.has(n)) passive.add(n);
        }
    }
    for (const sp of species) {
        const traits = [...(sp.traits || []), ...(sp.lineages || []).flatMap((l) => l.traits || [])];
        for (const t of traits) {
            const name = traitBaseName(t.name).toLowerCase();
            if (t.resource) {
                [name, (t.resource.name || "").toLowerCase(), ...(t.aliases || []).map((a) => a.toLowerCase())].filter(Boolean).forEach((n) => active.add(n));
            } else if (!t.grantedSpells?.length && !t.scaleValues?.length) {
                passive.add(name);
            }
        }
    }
    return { active, passive, grantTypes };
}
