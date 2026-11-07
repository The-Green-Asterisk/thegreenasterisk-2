import Helpers from "@services/helpers";

const html = Helpers.html;

export const characterCreatorTemplate = () => html`
    <el-character-creator class="character-creator-view">
        <div class="creator-container content-slate">
            <!-- Stepper Progress Bar (resting just below the site nav) -->
            <div class="creator-stepper" role="tablist" aria-label="Creation Steps">
                <ol class="stepper-list" id="creator-stepper-list">
                    <li class="stepper-item active" data-step="1">
                        <span class="stepper-circle">1</span>
                        <span class="stepper-label">Identity</span>
                    </li>
                    <li class="stepper-item" data-step="2">
                        <span class="stepper-circle">2</span>
                        <span class="stepper-label">Species</span>
                    </li>
                    <li class="stepper-item" data-step="3">
                        <span class="stepper-circle">3</span>
                        <span class="stepper-label">Class</span>
                    </li>
                    <li class="stepper-item" data-step="4">
                        <span class="stepper-circle">4</span>
                        <span class="stepper-label">Background</span>
                    </li>
                    <li class="stepper-item" data-step="5">
                        <span class="stepper-circle">5</span>
                        <span class="stepper-label">Abilities</span>
                    </li>
                    <li class="stepper-item" data-step="6">
                        <span class="stepper-circle">6</span>
                        <span class="stepper-label">Skills</span>
                    </li>
                    <li class="stepper-item" data-step="7">
                        <span class="stepper-circle">7</span>
                        <span class="stepper-label">Equipment</span>
                    </li>
                    <li class="stepper-item" data-step="8">
                        <span class="stepper-circle">8</span>
                        <span class="stepper-label">Spells</span>
                    </li>
                    <li class="stepper-item" data-step="9">
                        <span class="stepper-circle">9</span>
                        <span class="stepper-label">Review</span>
                    </li>
                </ol>
            </div>

            <header class="creator-header">
                <div class="creator-header-main">
                    <div class="creator-badge">D&D 5.5e (2024 Revision)</div>
                    <h1 class="creator-title">Character Creator</h1>
                    <p class="creator-subtitle">Craft a fully-featured hero with complete 2024 rules, weapon masteries, origin feats, and normalized site storage.</p>
                </div>
                <div class="creator-header-actions">
                    <a href="/character-sheet" class="creator-cancel-btn" title="Back to Character Sheet">
                        <i class="fa-solid fa-arrow-left"></i> Exit to Sheet
                    </a>
                </div>
            </header>

            <!-- Live Summary Strip -->
            <div class="creator-summary-strip" id="creator-summary-strip">
                <div class="summary-avatar-thumb">
                    <img id="summary-avatar-img" src="/storage/images/default-avatar.png" alt="Character Avatar" />
                </div>
                <div class="summary-details">
                    <div class="summary-name" id="summary-name">Unnamed Hero</div>
                    <div class="summary-meta" id="summary-meta">Level 1 • Select Species • Select Class</div>
                </div>
                <div class="summary-vitals-pills">
                    <div class="summary-pill"><span class="pill-label">HP</span><strong id="summary-hp">10</strong></div>
                    <div class="summary-pill"><span class="pill-label">AC</span><strong id="summary-ac">10</strong></div>
                    <div class="summary-pill"><span class="pill-label">INIT</span><strong id="summary-init">+0</strong></div>
                    <div class="summary-pill"><span class="pill-label">SPEED</span><strong id="summary-speed">30 ft.</strong></div>
                </div>
            </div>

            <!-- Validation Notice -->
            <div id="creator-validation-alert" class="creator-alert hidden" role="alert"></div>

            <!-- Step Panels Container -->
            <div class="creator-step-panels" id="creator-step-panels">
                <!-- Dynamically populated by characterCreator.ctrl.ts -->
            </div>

            <p>Report bugs/feedback on our <a href="https://discord.gg/PwYVb5R7BF" target="_blank" rel="noopener noreferrer">Discord server</a> channel #help-desk.</p>

            <!-- Navigation Controls -->
            <footer class="creator-footer">
                <button type="button" id="creator-prev-btn" class="creator-nav-btn secondary-btn" disabled>
                    <i class="fa-solid fa-chevron-left"></i> Previous
                </button>
                <div class="creator-footer-center">
                    <span id="creator-step-indicator" class="step-counter">Step 1 of 9</span>
                </div>
                <button type="button" id="creator-next-btn" class="creator-nav-btn primary-btn">
                    Next <i class="fa-solid fa-chevron-right"></i>
                </button>
                <button type="button" id="creator-submit-btn" class="creator-nav-btn submit-btn hidden">
                    <i class="fa-solid fa-check"></i> Create Character
                </button>
            </footer>
        </div>
    </el-character-creator>
`;

export default characterCreatorTemplate;
