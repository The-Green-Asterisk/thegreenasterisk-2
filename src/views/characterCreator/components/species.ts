import { ALL_SKILLS } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

export function renderStep2Species(ctx: CharacterCreatorContext): string {
    const currentSpecies = ctx.species.find((s) => s.id === ctx.state.speciesId) || ctx.species[0];
    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Choose Species</h3>
                <p class="panel-desc">Select your species from the 10 core options in 5.5e. In the 2024 revision, ability score increases are tied to your background.</p>
            </div>
            <div class="card-select-grid">
                ${ctx.species.map((sp) => `
                    <div class="select-card species-card ${ctx.state.speciesId === sp.id ? "selected" : ""}" data-species-id="${sp.id}">
                        <div class="card-title-row">
                            <h4 class="card-title">${sp.name}</h4>
                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                        </div>
                        <span class="card-tag">${sp.size} • ${sp.speed} ft. ${sp.darkvision ? `• ${sp.darkvision}` : ""}</span>
                        <p class="card-body">${sp.description}</p>
                    </div>
                `).join("")}
            </div>

            ${currentSpecies.lineages && currentSpecies.lineages.length > 0 ? `
                <div class="creator-detail-box">
                    <h4>${currentSpecies.name} Lineage / Heritage</h4>
                    <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                        ${currentSpecies.lineages.map((lin) => `
                            <div class="select-card lineage-card ${ctx.state.lineageId === lin.id ? "selected" : ""}" data-lineage-id="${lin.id}">
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

            ${currentSpecies.id === "human" ? `
                <div class="creator-detail-box">
                    <h4>Human Versatility</h4>
                    <div class="creator-form-grid">
                        <div class="creator-form-group">
                            <label class="creator-label">Skillful (Choose 1 Extra Skill)</label>
                            <select id="human-skill-select" class="creator-select">
                                ${ALL_SKILLS.map((sk) => `<option value="${sk.name}" ${ctx.state.humanExtraSkill === sk.name ? "selected" : ""}>${sk.name} (${sk.stat.toUpperCase()})</option>`).join("")}
                            </select>
                        </div>
                        <div class="creator-form-group">
                            <label class="creator-label">Versatile (Choose 1 Extra Origin Feat)</label>
                            <select id="human-feat-select" class="creator-select">
                                ${ctx.originFeats.map((f) => `<option value="${f.id}" ${ctx.state.humanExtraFeatId === f.id ? "selected" : ""}>${f.name}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                </div>
            ` : ""}

            ${currentSpecies.id === "elf" ? `
                <div class="creator-detail-box">
                    <h4>Elf Keen Senses</h4>
                    <div class="creator-form-grid">
                        <div class="creator-form-group">
                            <label class="creator-label">Keen Senses (Choose 1 Skill Proficiency)</label>
                            <select id="elf-skill-select" class="creator-select">
                                <option value="Perception" ${ctx.state.elfKeenSkill === "Perception" ? "selected" : ""}>Perception (WIS)</option>
                                <option value="Insight" ${ctx.state.elfKeenSkill === "Insight" ? "selected" : ""}>Insight (WIS)</option>
                                <option value="Survival" ${ctx.state.elfKeenSkill === "Survival" ? "selected" : ""}>Survival (WIS)</option>
                            </select>
                        </div>
                    </div>
                </div>
            ` : ""}
        </div>
    `;
}
