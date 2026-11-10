import { LineageDefinition, SpeciesDefinition, SpeciesTrait, StatModifier } from "./types";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];

export const traitSlug = (name: string) =>
    String(name || "").toLowerCase().replace(/\s*\(level \d+\)\s*$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** A trait's display name without a "(Level N)" note. */
export const traitBaseName = (name: string) => String(name || "").replace(/\s*\(Level \d+\)\s*$/i, "").trim();

/** The species' and lineage's traits that apply at this character level, each with where it comes from. */
export function activeSpeciesTraits(
    species: SpeciesDefinition | undefined,
    lineage: LineageDefinition | undefined,
    level: number
): Array<SpeciesTrait & { fromLineage: boolean }> {
    return [
        ...(species?.traits || []).map((t) => ({ ...t, fromLineage: false })),
        ...(lineage?.traits || []).map((t) => ({ ...t, fromLineage: true }))
    ].filter((t) => (t.minLevel || 1) <= level);
}

/** Stat modifiers from the species, lineage, and their active traits; classLevel is the character level. */
export function speciesModifiers(
    species: SpeciesDefinition | undefined,
    lineage: LineageDefinition | undefined,
    level: number
): Array<StatModifier & { classLevel: number }> {
    return [
        ...(lineage?.modifiers || []),
        ...activeSpeciesTraits(species, lineage, level).flatMap((t) => t.modifiers || [])
    ].map((m) => ({ ...m, classLevel: level }));
}

/** Damage types the species and lineage resist, capitalized ("Fire"). */
export function speciesResistances(species: SpeciesDefinition | undefined, lineage: LineageDefinition | undefined, level: number): string[] {
    const out: string[] = [];
    for (const m of speciesModifiers(species, lineage, level)) {
        if (m.target !== "defenses.resistance" || typeof m.value !== "string") continue;
        const v = m.value.charAt(0).toUpperCase() + m.value.slice(1).toLowerCase();
        if (!out.includes(v)) out.push(v);
    }
    return out;
}

/** Hit point maximum bonus from species modifiers (e.g. Dwarven Toughness: +1 per level). */
export function speciesMaxHpBonus(species: SpeciesDefinition | undefined, lineage: LineageDefinition | undefined, level: number): number {
    return speciesModifiers(species, lineage, level)
        .filter((m) => m.target === "vitals.maxHp" && m.type === "bonus")
        .reduce((sum, m) => sum + (typeof m.perClassLevel === "number" ? m.perClassLevel * level : Number(m.value) || 0), 0);
}

export interface ResolvedSpeciesResource {
    name: string;
    total: number;
    resetOn: "short" | "long";
    dieOrType?: string;
    aliases: string[];
}

/** Limited-use species and lineage traits at this character level, with templates resolved. */
export function resolveSpeciesResources(
    species: SpeciesDefinition | undefined,
    lineage: LineageDefinition | undefined,
    level: number,
    pb: number,
    abilityMod: (ability: string) => number
): ResolvedSpeciesResource[] {
    const resolve = (v: string) => v.replace(/\{\{(\w+)\}\}/g, (_, k: string) => {
        const key = k.toLowerCase();
        if (key === "pb") return String(pb);
        if (key === "level") return String(level);
        if (ABILITIES.includes(key)) return String(Math.max(1, abilityMod(key)));
        return "";
    });
    const out: ResolvedSpeciesResource[] = [];
    for (const t of activeSpeciesTraits(species, lineage, level)) {
        if (!t.resource) continue;
        const total = typeof t.resource.total === "number" ? t.resource.total : Number(resolve(String(t.resource.total)));
        if (!Number.isFinite(total) || total <= 0) continue;
        const name = t.resource.name || traitBaseName(t.name);
        if (out.some((r) => r.name === name)) continue;
        out.push({
            name,
            total,
            resetOn: t.resource.resetOn,
            dieOrType: t.resource.die ? resolve(t.resource.die) : undefined,
            aliases: [traitBaseName(t.name), ...(t.aliases || [])].filter((n) => n !== name)
        });
    }
    return out;
}

/** Spells the species and lineage grant by this character level. */
export function speciesGrantedSpells(
    species: SpeciesDefinition | undefined,
    lineage: LineageDefinition | undefined,
    level: number
): Array<{ spellName: string; level: number }> {
    const out: Array<{ spellName: string; level: number }> = [];
    for (const t of activeSpeciesTraits(species, lineage, level)) {
        for (const g of t.grantedSpells || []) if (g.level <= level) out.push(g);
    }
    for (const g of lineage?.spellsGranted || []) if (g.level <= level) out.push(g);
    return out.filter((g, i) => out.findIndex((x) => x.spellName.toLowerCase() === g.spellName.toLowerCase()) === i);
}

/** A trait's scaling value at this character level (e.g. Breath Weapon "2d10" at level 5). */
export function speciesScaleValue(trait: SpeciesTrait, level: number): string | undefined {
    const applicable = (trait.scaleValues || []).filter((v) => v.minLevel <= level).sort((a, b) => b.minLevel - a.minLevel);
    return applicable[0]?.value;
}

/** Every name a species' traits (and their resources and aliases) go by, lower-case, for every lineage. */
export function speciesTraitNames(species: SpeciesDefinition): string[] {
    const traits = [...(species.traits || []), ...(species.lineages || []).flatMap((l) => l.traits || [])];
    return traits.flatMap((t) => [traitBaseName(t.name), t.resource?.name || "", ...(t.aliases || [])])
        .filter(Boolean)
        .map((n) => n.toLowerCase());
}

/** Finds a species by id or name, including names that carry a lineage ("Wood Elf", "Infernal Tiefling"). */
export function findSpecies(all: SpeciesDefinition[], text: string): SpeciesDefinition | undefined {
    const t = String(text || "").toLowerCase().trim();
    if (!t) return undefined;
    return all.find((s) => s.id === t || s.name.toLowerCase() === t) ||
        all.find((s) => new RegExp(`\\b${s.name.toLowerCase()}\\b`).test(t) || new RegExp(`\\b${s.id}\\b`).test(t)) ||
        all.find((s) => (s.lineages || []).some((l) => t.includes(l.name.toLowerCase().split(/[ (]/)[0]) && t.includes(l.name.toLowerCase())));
}

export interface LineageEvidence {
    /** Lineage, subrace, or race text ("Wood Elf", "Infernal", "Red Dragonborn") */
    texts?: string[];
    featureNames?: string[];
    featureDescriptions?: string[];
    resistances?: string[];
    spellNames?: string[];
}

/**
 * The lineage the evidence best fits, scored from the lineage data alone: its id or name in the text, its trait
 * names among the features, its granted spells among the spells, and the damage types it resists.
 */
export function detectLineage(species: SpeciesDefinition | undefined, ev: LineageEvidence): LineageDefinition | undefined {
    const lineages = species?.lineages || [];
    if (lineages.length === 0) return undefined;
    const lower = (a?: string[]) => (a || []).map((x) => String(x || "").toLowerCase()).filter(Boolean);
    const texts = lower(ev.texts);
    const feats = lower(ev.featureNames);
    const descs = lower(ev.featureDescriptions);
    const resist = lower(ev.resistances);
    const spells = lower(ev.spellNames);
    const word = (w: string) => new RegExp(`\\b${w.replace(/[^a-z0-9 ]/g, "")}\\b`);

    let best: LineageDefinition | undefined;
    let bestScore = 0;
    for (const l of lineages) {
        const name = l.name.toLowerCase();
        const key = name.split(/[ (]/)[0];
        const idWords = l.id.replace(/-/g, " ");
        let score = 0;
        if (texts.some((t) => t === l.id || t === name || word(idWords).test(t) || word(key).test(t))) score += 5;
        if (feats.some((f) => f === name || word(key).test(f))) score += 3;
        const traitNames = (l.traits || []).map((t) => traitBaseName(t.name).toLowerCase());
        if (feats.some((f) => traitNames.some((tn) => tn.length >= 4 && (f.includes(tn) || tn.includes(f))))) score += 3;
        const lSpells = [
            ...(l.spellsGranted || []).map((g) => g.spellName.toLowerCase()),
            ...(l.traits || []).flatMap((t) => (t.grantedSpells || []).map((g) => g.spellName.toLowerCase()))
        ];
        score += 2 * lSpells.filter((sp) => spells.includes(sp)).length;
        const lRes = (l.modifiers || []).concat((l.traits || []).flatMap((t) => t.modifiers || []))
            .filter((m) => m.target === "defenses.resistance" && typeof m.value === "string")
            .map((m) => String(m.value).toLowerCase());
        if (lRes.some((r) => resist.includes(r))) score += 2;
        if (lRes.some((r) => descs.some((d) => d.includes(`resistance to ${r}`)))) score += 1;
        if (score > bestScore) {
            best = l;
            bestScore = score;
        }
    }
    return best;
}
