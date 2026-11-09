import { CharacterCreatorContext } from "../controllers/context";

function escape(str: string): string {
    return (str || "").replace(/"/g, "&quot;");
}

export function renderStep1Identity(ctx: CharacterCreatorContext): string {
    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Character Identity & Basics</h3>
                <p class="panel-desc">Give your hero a name, alignment, and appearance.</p>
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
                    <label class="creator-label">Character Avatar</label>
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
                                <input type="text" id="char-avatar-input" class="creator-input" placeholder="https://example.com/character-portrait.png" value="${escape(ctx.state.avatarUrl)}" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
