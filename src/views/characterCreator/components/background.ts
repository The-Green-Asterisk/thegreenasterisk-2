import { CharacterCreatorContext } from "../controllers/context";

export function renderStep4Background(ctx: CharacterCreatorContext): string {
    const currentBg = ctx.backgrounds.find((b) => b.id === ctx.state.backgroundId) || ctx.backgrounds[0];
    const feat = ctx.originFeats.find((f) => f.id === currentBg.originFeatId) || ctx.originFeats[0];
    const allowed = currentBg.allowedAbilities;

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Choose Background & Origin Feat</h3>
                <p class="panel-desc">In 5.5e, your background determines your Ability Score Increases (+2/+1 or +1/+1/+1), 2 skill proficiencies, 1 tool, and 1 Origin Feat.</p>
            </div>
            <div class="card-select-grid">
                ${ctx.backgrounds.map((bg) => `
                    <div class="select-card background-card ${ctx.state.backgroundId === bg.id ? "selected" : ""}" data-background-id="${bg.id}">
                        <div class="card-title-row">
                            <h4 class="card-title">${bg.name}</h4>
                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                        </div>
                        <span class="card-tag">Abilities: ${bg.allowedAbilities.map((a) => a.toUpperCase()).join(", ")}</span>
                        <p class="card-body">${bg.description}</p>
                    </div>
                `).join("")}
            </div>

            <div class="creator-detail-box">
                <h4>${currentBg.name} Configuration</h4>
                <div class="creator-form-grid">
                    <div class="creator-form-group">
                        <label class="creator-label">Ability Score Distribution</label>
                        <div style="display: flex; gap: 1rem; margin-top: 0.25rem;">
                            <label><input type="radio" name="bg-option" value="two-and-one" ${ctx.state.backgroundOption === "two-and-one" ? "checked" : ""} /> +2 to one, +1 to another</label>
                            <label><input type="radio" name="bg-option" value="three-ones" ${ctx.state.backgroundOption === "three-ones" ? "checked" : ""} /> +1 to all three stats</label>
                        </div>
                    </div>

                    ${ctx.state.backgroundOption === "two-and-one" ? `
                        <div class="creator-form-group">
                            <label class="creator-label">+2 Ability Score</label>
                            <select id="bg-stat-a" class="creator-select">
                                ${allowed.map((s) => `<option value="${s}" ${ctx.state.bgStatA === s ? "selected" : ""}>${s.toUpperCase()}</option>`).join("")}
                            </select>
                        </div>
                        <div class="creator-form-group">
                            <label class="creator-label">+1 Ability Score</label>
                            <select id="bg-stat-b" class="creator-select">
                                ${allowed.filter((s) => s !== ctx.state.bgStatA).map((s) => `<option value="${s}" ${ctx.state.bgStatB === s ? "selected" : ""}>${s.toUpperCase()}</option>`).join("")}
                            </select>
                        </div>
                    ` : `
                        <div class="creator-form-group">
                            <label class="creator-label">+1 to Three Stats</label>
                            <p class="card-body" style="margin-top: 0.4rem;"><strong>${allowed.map((s) => s.toUpperCase()).join(", ")}</strong> all receive +1.</p>
                        </div>
                    `}

                    <div class="creator-form-group">
                        <label class="creator-label">Tool Proficiency Granted</label>
                        <input type="text" class="creator-input" value="${currentBg.tool}" readonly />
                    </div>
                    <div class="creator-form-group">
                        <label class="creator-label">Origin Feat Granted</label>
                        <input type="text" class="creator-input" value="${feat.name}" readonly />
                    </div>
                </div>

                <div style="margin-top: 0.5rem; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius);">
                    <strong style="color: var(--ui-text); font-size: 0.95rem;">${feat.name}:</strong>
                    <p style="font-size: 0.85rem; margin: 0.25rem 0 0 0; color: var(--text-muted);">${feat.description}</p>
                    <ul style="margin: 0.35rem 0 0 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--text);">
                        ${feat.benefits.map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                </div>
            </div>
        </div>
    `;
}
