import { speciesSenseSummary } from "../../../rules/dnd5e_2024/speciesRules";
import { SpeciesDefinition } from "../../../rules/dnd5e_2024";
import { ALL_SKILLS } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";
import { currentLineage, currentSpecies, currentSpeciesTraits, getSpeciesPicks, traitBaseName, traitSlug } from "../services/speciesChoices";
import { resolveSpeciesSpellAbility, speciesSpellAbilityOptions } from "../../../rules/dnd5e_2024/speciesRules";

const ABILITY_NAMES: Record<string, string> = {
    str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma"
};

/** A select for the ability the species' spells use, when the species data offers a choice. */
function renderSpeciesSpellAbility(ctx: CharacterCreatorContext): string {
    const species = currentSpecies(ctx);
    const lineage = currentLineage(ctx);
    const options = speciesSpellAbilityOptions(species, lineage, ctx.getTotalLevel() || 1);
    if (options.length < 2) return "";
    const current = resolveSpeciesSpellAbility(species, lineage, ctx.getTotalLevel() || 1, ctx.state.speciesSpellAbility);
    return `
        <div class="creator-detail-box">
            <div class="creator-form-group">
                <label class="creator-label" for="species-spell-ability-select">${lineage?.name || species?.name || "Species"} Spellcasting Ability</label>
                <select id="species-spell-ability-select" class="creator-select">
                    ${options.map((ab) => `<option value="${ab}" ${ab === current ? "selected" : ""}>${ABILITY_NAMES[ab]}</option>`).join("")}
                </select>
            </div>
        </div>`;
}

/** A select for each skill or feat a species or lineage trait lets the player pick (species data). */
function renderSpeciesPicks(ctx: CharacterCreatorContext, species: SpeciesDefinition): string {
    const traits = currentSpeciesTraits(ctx).filter((t) => (t.skillPicks?.length || 0) > 0 || t.featPicks);
    if (traits.length === 0) return "";
    const groups = traits.map((t) => {
        const slug = traitSlug(t.name);
        const picks = getSpeciesPicks(ctx, t);
        const name = traitBaseName(t.name);
        const selects: string[] = [];
        if (t.skillPicks?.length) {
            const from = t.skillPicks.flatMap((p) => p.from || []);
            const skills = from.length > 0 ? ALL_SKILLS.filter((sk) => from.includes(sk.name)) : ALL_SKILLS;
            const count = t.skillPicks.reduce((sum, p) => sum + p.count, 0);
            for (let i = 0; i < count; i++) {
                const id = `species-pick-${slug}-${i}`;
                selects.push(`
                    <div class="creator-form-group">
                        <label class="creator-label" for="${id}">${name} (Choose ${count} Skill Proficienc${count === 1 ? "y" : "ies"})</label>
                        <select id="${id}" class="creator-select species-pick-select" data-trait="${slug}" data-index="${i}">
                            <option value="" ${picks[i] ? "" : "selected"}>— Choose a skill —</option>
                            ${skills.map((sk) => `<option value="${sk.name}" ${picks[i] === sk.name ? "selected" : ""}>${sk.name} (${sk.stat.toUpperCase()})</option>`).join("")}
                        </select>
                    </div>`);
            }
        }
        if (t.featPicks) {
            const feats = t.featPicks.category === "origin" ? ctx.originFeats : ctx.generalFeats;
            for (let i = 0; i < t.featPicks.count; i++) {
                const id = `species-pick-${slug}-${i}`;
                selects.push(`
                    <div class="creator-form-group">
                        <label class="creator-label" for="${id}">${name} (Choose ${t.featPicks.count} ${t.featPicks.category === "origin" ? "Origin " : ""}Feat${t.featPicks.count === 1 ? "" : "s"})</label>
                        <select id="${id}" class="creator-select species-pick-select" data-trait="${slug}" data-index="${i}">
                            <option value="" ${picks[i] ? "" : "selected"}>— Choose a feat —</option>
                            ${feats.map((f) => `<option value="${f.id}" ${picks[i] === f.id ? "selected" : ""}>${f.name}</option>`).join("")}
                        </select>
                    </div>`);
            }
        }
        return selects.join("");
    }).join("");
    return `
        <div class="creator-detail-box">
            <h4>${species.name} Trait Choices</h4>
            <div class="creator-form-grid">${groups}</div>
        </div>`;
}

export function renderStep2Species(ctx: CharacterCreatorContext): string {
    const currentSpecies = ctx.species.find((s) => s.id === ctx.state.speciesId) || ctx.species[0];
    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Choose Species</h3>
                <p class="panel-desc">Select your species from the 10 core options in 5.5e. In the 2024 revision, ability score increases are tied to your background.</p>
            </div>
            <div class="card-select-grid" role="radiogroup" aria-label="Species">
                ${ctx.species.map((sp) => `
                    <div class="select-card species-card ${ctx.state.speciesId === sp.id ? "selected" : ""}" data-species-id="${sp.id}" role="radio" aria-checked="${ctx.state.speciesId === sp.id}" tabindex="0">
                        <div class="card-title-row">
                            <h4 class="card-title">${sp.name}</h4>
                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                        </div>
                        <span class="card-tag">${[sp.size, `${sp.speed} ft.`, ...speciesSenseSummary(sp)].join(" • ")}</span>
                        <p class="card-body">${sp.description}</p>
                    </div>
                `).join("")}
            </div>

            ${currentSpecies.lineages && currentSpecies.lineages.length > 0 ? `
                <div class="creator-detail-box">
                    <h4>${currentSpecies.name} Lineage / Heritage</h4>
                    <div class="card-select-grid" role="radiogroup" aria-label="${currentSpecies.name} lineage" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                        ${currentSpecies.lineages.map((lin) => `
                            <div class="select-card lineage-card ${ctx.state.lineageId === lin.id ? "selected" : ""}" data-lineage-id="${lin.id}" role="radio" aria-checked="${ctx.state.lineageId === lin.id}" tabindex="0">
                                <div class="card-title-row">
                                    <h5 class="card-title" style="font-size: 0.95rem;">${lin.name}</h5>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                                <p class="card-body">${lin.description}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            ` : ""}

            ${renderSpeciesPicks(ctx, currentSpecies)}
            ${renderSpeciesSpellAbility(ctx)}
        </div>
    `;
}
