export function renderLoaderBar(): string {
    return `
        <section class="character-loader-bar" aria-label="Load D&D Beyond Character">
            <div class="character-loader-header">
                <h3 class="character-loader-title"><i class="fa-solid fa-dragon"></i> Character Loader</h3>
                <button type="button" id="character-loader-toggle-btn" class="loader-collapse-btn" aria-expanded="true" aria-controls="character-loader-content" title="Collapse loader">
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
            </div>
            <div id="character-loader-content" class="character-loader-content">
                <form id="dndbeyond-load-form" class="load-form">
                    <div class="load-input-wrap">
                        <i class="fa-solid fa-dragon load-icon"></i>
                        <input
                            type="text"
                            id="dndbeyond-id-input"
                            placeholder="Enter D&D Beyond ID/URL or site ID (e.g. tga-abc12345)"
                            value=""
                            autocomplete="off"
                        />
                    </div>
                    <button type="button" id="load-character-btn" class="load-btn">
                        <i class="fa-solid fa-bolt"></i> Load Character
                    </button>
                    <button type="button" id="create-character-btn" class="load-btn secondary hidden" title="Create a brand new site character sheet">
                        <i class="fa-solid fa-user-plus"></i> New Character
                    </button>
                    <button type="button" id="edit-character-fields-btn" class="load-btn secondary hidden" title="Edit character fields in-place">
                        <i class="fa-solid fa-pen"></i> Edit Fields
                    </button>
                    <button type="button" id="save-character-btn" class="load-btn hidden" title="Save this character to your account">
                        <i class="fa-solid fa-floppy-disk"></i> Save Character
                    </button>
                    <button type="button" id="refresh-dndbeyond-btn" class="load-btn secondary hidden" title="Re-pull from D&D Beyond and overwrite saved data">
                        <i class="fa-solid fa-rotate-right"></i> Refresh from D&D Beyond
                    </button>
                </form>
                <label class="rules-preference-toggle" title="Prefer 2024-aligned sources where possible (D&D Beyond and local data before SRD fallbacks)">
                    <input type="checkbox" id="prefer-2024-rules-toggle" checked />
                    <span>Prefer 2024 rules sources</span>
                </label>
                <div id="character-status-message" class="status-msg hidden" role="alert"></div>
            </div>
        </section>
    `;
}
