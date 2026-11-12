import { escapeHtml } from "@services/escape";
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
            <div class="card-select-grid" role="radiogroup" aria-label="Backgrounds">
                ${ctx.backgrounds.map((bg) => `
                    <div class="select-card background-card ${ctx.state.backgroundId === bg.id ? "selected" : ""}" data-background-id="${bg.id}" role="radio" aria-checked="${ctx.state.backgroundId === bg.id}" tabindex="0" data-kbd-activate>
                        <div class="card-title-row">
                            <h4 class="card-title">${escapeHtml(bg.name)}</h4>
                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                        </div>
                        <span class="card-tag">Abilities: ${bg.allowedAbilities.map((a) => a.toUpperCase()).join(", ")}</span>
                        <p class="card-body">${bg.description}</p>
                    </div>
                `).join("")}
            </div>

            <div class="creator-detail-box">
                <h4>${escapeHtml(currentBg.name)} Configuration</h4>
                <div class="creator-form-grid">
                    <fieldset class="creator-form-group creator-fieldset">
                        <legend class="creator-label">Ability Score Distribution</legend>
                        <div style="display: flex; gap: 1rem; margin-top: 0.25rem;">
                            <label><input type="radio" name="bg-option" value="two-and-one" ${ctx.state.backgroundOption === "two-and-one" ? "checked" : ""} /> +2 to one, +1 to another</label>
                            <label><input type="radio" name="bg-option" value="three-ones" ${ctx.state.backgroundOption === "three-ones" ? "checked" : ""} /> +1 to all three stats</label>
                        </div>
                    </fieldset>

                    ${ctx.state.backgroundOption === "two-and-one" ? `
                        <div class="creator-form-group">
                            <label class="creator-label" for="bg-stat-a">+2 Ability Score</label>
                            <select id="bg-stat-a" class="creator-select">
                                ${allowed.map((s) => `<option value="${s}" ${ctx.state.bgStatA === s ? "selected" : ""}>${s.toUpperCase()}</option>`).join("")}
                            </select>
                        </div>
                        <div class="creator-form-group">
                            <label class="creator-label" for="bg-stat-b">+1 Ability Score</label>
                            <select id="bg-stat-b" class="creator-select">
                                ${allowed.filter((s) => s !== ctx.state.bgStatA).map((s) => `<option value="${s}" ${ctx.state.bgStatB === s ? "selected" : ""}>${s.toUpperCase()}</option>`).join("")}
                            </select>
                        </div>
                    ` : `
                        <div class="creator-form-group">
                            <span class="creator-label">+1 to Three Stats</span>
                            <p class="card-body" style="margin-top: 0.4rem;"><strong>${allowed.map((s) => s.toUpperCase()).join(", ")}</strong> all receive +1.</p>
                        </div>
                    `}

                    <div class="creator-form-group">
                        <label class="creator-label" for="bg-tool-granted">Tool Proficiency Granted</label>
                        <input type="text" id="bg-tool-granted" class="creator-input" value="${String(ctx.state.bgTool || currentBg.tool || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")}" readonly />
                    </div>
                    <div class="creator-form-group">
                        <label class="creator-label" for="bg-feat-granted">Origin Feat Granted</label>
                        <input type="text" id="bg-feat-granted" class="creator-input" value="${escapeHtml(feat.name)}" readonly />
                    </div>
                </div>

                <div style="margin-top: 0.5rem; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius);">
                    <strong style="color: var(--ui-text); font-size: 0.95rem;">${escapeHtml(feat.name)}:</strong>
                    <p style="font-size: 0.85rem; margin: 0.25rem 0 0 0; color: var(--text-muted);">${feat.description}</p>
                    <ul style="margin: 0.35rem 0 0 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--text);">
                        ${feat.benefits.map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                </div>
            </div>
        </div>
    `;
}
