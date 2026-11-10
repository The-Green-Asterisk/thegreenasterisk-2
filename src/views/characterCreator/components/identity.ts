import { CharacterCreatorContext } from "../controllers/context";

function escape(str: string): string {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DETAIL_FIELDS: Array<{ key: string; label: string; placeholder: string }> = [
    { key: "age", label: "Age", placeholder: "e.g. 27" },
    { key: "height", label: "Height", placeholder: "e.g. 5' 10\"" },
    { key: "weight", label: "Weight", placeholder: "e.g. 160 lb." },
    { key: "hair", label: "Hair", placeholder: "e.g. Black, braided" },
    { key: "eyes", label: "Eyes", placeholder: "e.g. Amber" },
    { key: "skin", label: "Skin", placeholder: "e.g. Olive" },
    { key: "faith", label: "Faith", placeholder: "e.g. Tymora" }
];

const LIFESTYLES = ["Wretched", "Squalid", "Poor", "Modest", "Comfortable", "Wealthy", "Aristocratic"];

const NOTE_FIELDS: Array<{ key: string; label: string }> = [
    { key: "personalityTraits", label: "Personality Traits" },
    { key: "ideals", label: "Ideals" },
    { key: "bonds", label: "Bonds" },
    { key: "flaws", label: "Flaws" },
    { key: "appearance", label: "Appearance" },
    { key: "backstory", label: "Backstory" },
    { key: "allies", label: "Allies" },
    { key: "organizations", label: "Organizations" },
    { key: "enemies", label: "Enemies" },
    { key: "personalPossessions", label: "Personal Possessions" },
    { key: "otherHoldings", label: "Other Holdings" },
    { key: "otherNotes", label: "Other Notes" }
];

/** Physical details and personality, all optional. */
function renderDetailsAndPersonality(ctx: CharacterCreatorContext): string {
    const details = (ctx.state.details || {}) as Record<string, unknown>;
    const notes = ctx.state.notes || {};
    return `
            <fieldset class="creator-detail-box creator-fieldset">
                <legend><h4>Details (optional)</h4></legend>
                <div class="creator-form-grid">
                    ${DETAIL_FIELDS.map((f) => `
                        <div class="creator-form-group">
                            <label class="creator-label" for="char-detail-${f.key}">${f.label}</label>
                            <input type="text" id="char-detail-${f.key}" class="creator-input char-detail-input" data-detail="${f.key}" placeholder="${escape(f.placeholder)}" value="${escape(String(details[f.key] ?? ""))}" />
                        </div>`).join("")}
                    <div class="creator-form-group">
                        <label class="creator-label" for="char-detail-lifestyle">Lifestyle</label>
                        <select id="char-detail-lifestyle" class="creator-select char-detail-input" data-detail="lifestyle">
                            <option value="" ${details.lifestyle ? "" : "selected"}>— Not set —</option>
                            ${LIFESTYLES.map((l) => `<option value="${l}" ${details.lifestyle === l ? "selected" : ""}>${l}</option>`).join("")}
                        </select>
                    </div>
                </div>
            </fieldset>
            <fieldset class="creator-detail-box creator-fieldset">
                <legend><h4>Personality & Backstory (optional)</h4></legend>
                <div class="creator-form-grid">
                    ${NOTE_FIELDS.map((f) => `
                        <div class="creator-form-group" ${f.key === "backstory" ? 'style="grid-column: 1 / -1;"' : ""}>
                            <label class="creator-label" for="char-note-${f.key}">${f.label}</label>
                            <textarea id="char-note-${f.key}" class="creator-input char-note-input" data-note="${f.key}" rows="${f.key === "backstory" ? 6 : 3}">${escape(notes[f.key] || "")}</textarea>
                        </div>`).join("")}
                </div>
            </fieldset>`;
}

export function renderStep1Identity(ctx: CharacterCreatorContext): string {
    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Character Identity & Basics</h3>
                <p class="panel-desc">Give your hero a name, alignment, appearance, and (optionally) personality and backstory.</p>
            </div>
            <div class="creator-form-grid">
                <div class="creator-form-group">
                    <label class="creator-label" for="char-name-input">Character Name *</label>
                    <input type="text" id="char-name-input" class="creator-input" placeholder="e.g. San Te, Lyra Silverleaf" value="${escape(ctx.state.name)}" required />
                </div>
                <div class="creator-form-group">
                    <label class="creator-label" for="char-alignment-select">Alignment</label>
                    <select id="char-alignment-select" class="creator-select">
                        ${[
                            "Lawful Good", "Neutral Good", "Chaotic Good",
                            "Lawful Neutral", "True Neutral", "Chaotic Neutral",
                            "Lawful Evil", "Neutral Evil", "Chaotic Evil", "Unaligned"
                        ].map((a) => `<option value="${a}" ${ctx.state.alignment === a ? "selected" : ""}>${a}</option>`).join("")}
                    </select>
                </div>
                <div class="creator-form-group">
                    <label class="creator-label" for="char-gender-input">Gender / Pronouns</label>
                    <input type="text" id="char-gender-input" class="creator-input" placeholder="e.g. Female (She/Her)" value="${escape(ctx.state.gender)}" />
                </div>
                <div class="creator-form-group" style="grid-column: 1 / -1;">
                    <span class="creator-label" id="char-avatar-heading">Character Avatar</span>
                    <div class="creator-avatar-picker">
                        <div class="creator-avatar-preview">
                            <img id="char-avatar-preview-img" src="${escape(ctx.state.avatarUrl || '/storage/images/default-avatar.png')}" alt="Avatar Preview" />
                        </div>
                        <div class="creator-avatar-controls">
                            <div class="creator-avatar-upload-row">
                                <input type="file" id="char-avatar-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" style="display: none;" />
                                <button type="button" id="char-avatar-upload-btn" class="creator-nav-btn secondary-btn">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Upload Image File
                                </button>
                                <span id="char-avatar-upload-status" class="creator-upload-status">PNG, JPG, WebP, GIF (Max 10MB)</span>
                            </div>
                            <div class="creator-avatar-divider"><span>OR PROVIDE IMAGE URL</span></div>
                            <div class="creator-avatar-url-row">
                                <input type="text" id="char-avatar-input" class="creator-input" aria-label="Avatar image URL" placeholder="https://example.com/character-portrait.png" value="${escape(ctx.state.avatarUrl)}" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${renderDetailsAndPersonality(ctx)}
        </div>
    `;
}
