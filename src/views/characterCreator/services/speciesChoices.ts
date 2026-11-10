import {
    LineageDefinition,
    SpeciesDefinition,
    SpeciesTrait,
    activeSpeciesTraits,
    traitBaseName,
    traitSlug
} from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";

export function currentSpecies(ctx: CharacterCreatorContext): SpeciesDefinition | undefined {
    return ctx.species.find((s) => s.id === ctx.state.speciesId);
}

export function currentLineage(ctx: CharacterCreatorContext): LineageDefinition | undefined {
    return currentSpecies(ctx)?.lineages?.find((l) => l.id === ctx.state.lineageId);
}

/** The species' and lineage's traits at the character's level. */
export function currentSpeciesTraits(ctx: CharacterCreatorContext): Array<SpeciesTrait & { fromLineage: boolean }> {
    return activeSpeciesTraits(currentSpecies(ctx), currentLineage(ctx), ctx.getTotalLevel() || 1);
}

/**
 * The picks saved for a trait's skill or feat choice: state.speciesChoices[<trait slug>], or for older saves the
 * state field the trait names in legacyStateKeys (e.g. humanExtraSkill).
 */
export function getSpeciesPicks(ctx: CharacterCreatorContext, trait: SpeciesTrait): string[] {
    const saved = ctx.state.speciesChoices?.[traitSlug(trait.name)];
    if (Array.isArray(saved)) return saved.filter(Boolean);
    for (const key of trait.legacyStateKeys || []) {
        const v = (ctx.state as any)[key];
        if (typeof v === "string" && v) return [v];
    }
    return [];
}

export function setSpeciesPick(ctx: CharacterCreatorContext, trait: SpeciesTrait, index: number, value: string): void {
    const key = traitSlug(trait.name);
    const picks = [...getSpeciesPicks(ctx, trait)];
    picks[index] = value;
    ctx.state.speciesChoices = { ...(ctx.state.speciesChoices || {}), [key]: picks.map((p) => p || "") };
}

/** Skills chosen through species traits (e.g. Skillful, Keen Senses), with the species name as their source. */
export function getSpeciesSkillPicks(ctx: CharacterCreatorContext): Array<{ skill: string; source: string }> {
    const species = currentSpecies(ctx);
    const out: Array<{ skill: string; source: string }> = [];
    for (const t of currentSpeciesTraits(ctx)) {
        if (!t.skillPicks?.length) continue;
        const allowed = t.skillPicks.flatMap((p) => p.from || []);
        const count = t.skillPicks.reduce((sum, p) => sum + p.count, 0);
        for (const skill of getSpeciesPicks(ctx, t).slice(0, count)) {
            if (allowed.length === 0 || allowed.includes(skill)) out.push({ skill, source: species?.name || "Species" });
        }
    }
    return out;
}

/** Feats chosen through species traits (e.g. Versatile), with the trait they came from. */
export function getSpeciesFeatPicks(ctx: CharacterCreatorContext): Array<{ featId: string; trait: SpeciesTrait }> {
    const out: Array<{ featId: string; trait: SpeciesTrait }> = [];
    for (const t of currentSpeciesTraits(ctx)) {
        if (!t.featPicks) continue;
        for (const featId of getSpeciesPicks(ctx, t).slice(0, t.featPicks.count)) out.push({ featId, trait: t });
    }
    return out;
}

/** Whether the character has this feat as their origin feat or through a species trait. */
export function hasOriginOrSpeciesFeat(ctx: CharacterCreatorContext, featId: string): boolean {
    return ctx.state.originFeatId === featId || getSpeciesFeatPicks(ctx).some((p) => p.featId === featId);
}

export { traitBaseName, traitSlug };
