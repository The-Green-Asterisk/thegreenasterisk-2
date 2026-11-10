import Helpers from "@services/helpers";

const html = Helpers.html;

export const characterCreatorTemplate = () => html`
    <el-character-creator class="character-creator-view" role="main">
        <div class="creator-container content-slate">
            <nav class="creator-stepper" aria-label="Creation steps">
                <ol class="stepper-list" id="creator-stepper-list">
                    <li>
                        <button type="button" class="stepper-item active" data-step="1" aria-current="step">
                            <span class="stepper-circle" aria-hidden="true">1</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 1: </span>Identity</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="2">
                            <span class="stepper-circle" aria-hidden="true">2</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 2: </span>Species</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="3">
                            <span class="stepper-circle" aria-hidden="true">3</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 3: </span>Class</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="4">
                            <span class="stepper-circle" aria-hidden="true">4</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 4: </span>Background</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="5">
                            <span class="stepper-circle" aria-hidden="true">5</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 5: </span>Abilities</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="6">
                            <span class="stepper-circle" aria-hidden="true">6</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 6: </span>Skills</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="7">
                            <span class="stepper-circle" aria-hidden="true">7</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 7: </span>Equipment</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="8">
                            <span class="stepper-circle" aria-hidden="true">8</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 8: </span>Spells</span>
                        </button>
                    </li>
                    <li>
                        <button type="button" class="stepper-item" data-step="9">
                            <span class="stepper-circle" aria-hidden="true">9</span>
                            <span class="stepper-label"><span class="visually-hidden">Step 9: </span>Review</span>
                        </button>
                    </li>
                </ol>
            </nav>

            <header class="creator-header">
                <div class="creator-header-main">
                    <div class="creator-badge">D&D 5.5e (2024 Revision)</div>
                    <h1 class="creator-title">Character Creator</h1>
                    <p class="creator-subtitle">Craft a fully-featured hero with D&D's complete 2024 5.5e ruleset.</p>
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
