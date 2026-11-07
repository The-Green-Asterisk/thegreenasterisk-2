export function renderModals(): string {
    return `
        <!-- SPELL DETAILS MODAL -->
        <div id="spell-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true">
            <div class="spell-modal-dialog" id="spell-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips" id="modal-badges"></div>
                        <h2 id="modal-spell-name" class="modal-spell-title">Spell Name</h2>
                        <div id="modal-spell-type" class="modal-spell-sub">Level • School</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="spell-modal-close-btn" aria-label="Close spell details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-meta-grid">
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-regular fa-clock"></i> CASTING TIME</span>
                        <span class="meta-box-val" id="modal-casting-time">1 Action</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-bullseye"></i> RANGE / AREA</span>
                        <span class="meta-box-val" id="modal-range">60 ft.</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-regular fa-hourglass-half"></i> DURATION</span>
                        <span class="meta-box-val" id="modal-duration">Instantaneous</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-hand-sparkles"></i> COMPONENTS</span>
                        <span class="meta-box-val" id="modal-components">V, S</span>
                    </div>
                </div>

                <div class="spell-modal-body">
                    <div class="modal-image-container hidden" id="modal-spell-image-wrap">
                        <img id="modal-spell-image" class="modal-detail-img" src="" alt="Spell Illustration" />
                    </div>
                    <div id="modal-spell-description">
                    </div>
                </div>

                <footer class="spell-modal-footer">
                    <span id="modal-spell-source" class="modal-footer-source">Source: Bard</span>
                    <button type="button" class="modal-action-btn" id="modal-close-action-btn">Close</button>
                </footer>
            </div>
        </div>

        <!-- ADD CUSTOM SPELL MODAL -->
        <div id="custom-spell-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true">
            <div class="spell-modal-dialog custom-spell-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <h2 class="modal-spell-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Add Custom Spell</h2>
                        <div class="modal-spell-sub">Saves into local database and attaches to active character sheet</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="custom-spell-close-btn" aria-label="Close custom spell modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <form id="custom-spell-form" class="custom-spell-form">
                    <div class="form-grid">
                        <label class="form-field full-width">
                            <span>Spell Name *</span>
                            <input type="text" id="custom-spell-name" required placeholder="e.g. Eldritch Flash" />
                        </label>
                        <label class="form-field">
                            <span>Level (0 for Cantrip) *</span>
                            <input type="number" id="custom-spell-level" min="0" max="9" value="1" required />
                        </label>
                        <label class="form-field">
                            <span>School *</span>
                            <select id="custom-spell-school" required>
                                <option value="Abjuration">Abjuration</option>
                                <option value="Conjuration">Conjuration</option>
                                <option value="Divination">Divination</option>
                                <option value="Enchantment">Enchantment</option>
                                <option value="Evocation" selected>Evocation</option>
                                <option value="Illusion">Illusion</option>
                                <option value="Necromancy">Necromancy</option>
                                <option value="Transmutation">Transmutation</option>
                            </select>
                        </label>
                        <label class="form-field">
                            <span>Casting Time *</span>
                            <input type="text" id="custom-spell-casting-time" value="1 action" required />
                        </label>
                        <label class="form-field">
                            <span>Range *</span>
                            <input type="text" id="custom-spell-range" value="60 feet" required />
                        </label>
                        <label class="form-field">
                            <span>Duration *</span>
                            <input type="text" id="custom-spell-duration" value="Instantaneous" required />
                        </label>
                        <label class="form-field">
                            <span>Components</span>
                            <input type="text" id="custom-spell-components" value="V, S" />
                        </label>
                        <div class="form-checkboxes full-width">
                            <label class="form-inline-checkbox">
                                <input type="checkbox" id="custom-spell-ritual" />
                                <span>Ritual</span>
                            </label>
                            <label class="form-inline-checkbox">
                                <input type="checkbox" id="custom-spell-concentration" />
                                <span>Concentration</span>
                            </label>
                        </div>
                        <label class="form-field full-width">
                            <span>Description *</span>
                            <textarea id="custom-spell-description" rows="5" required placeholder="Describe what the spell does..."></textarea>
                        </label>
                        <label class="form-field full-width">
                            <span>Illustration Image URL</span>
                            <input type="url" id="custom-spell-image" placeholder="https://..." />
                        </label>
                    </div>
                    <footer class="spell-modal-footer form-footer">
                        <button type="button" class="modal-action-btn secondary" id="custom-spell-cancel-btn">Cancel</button>
                        <button type="submit" class="modal-action-btn primary" id="custom-spell-submit-btn">Save Spell</button>
                    </footer>
                </form>
            </div>
        </div>

        <!-- ITEM / EQUIPMENT DETAILS MODAL -->
        <div id="item-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-item-name">
            <div class="spell-modal-dialog item-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips" id="modal-item-badges"></div>
                        <h2 class="modal-spell-title" id="modal-item-name">Item Name</h2>
                        <div class="modal-spell-sub" id="modal-item-type">Item Type</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="item-modal-close-btn" aria-label="Close item details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-meta-grid item-modal-meta-grid">
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-weight-hanging"></i> WEIGHT</span>
                        <span class="meta-box-val" id="modal-item-weight">—</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-coins"></i> COST</span>
                        <span class="meta-box-val" id="modal-item-cost">—</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-boxes-stacked"></i> QUANTITY</span>
                        <span class="meta-box-val" id="modal-item-quantity">1</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-sparkles"></i> RARITY</span>
                        <span class="meta-box-val" id="modal-item-rarity">—</span>
                    </div>
                </div>

                <div class="spell-modal-body item-modal-body">
                    <div class="modal-image-container hidden" id="modal-item-image-wrap">
                        <img id="modal-item-image" class="modal-detail-img" src="" alt="Item Illustration" />
                    </div>
                    <div id="modal-item-description"></div>
                </div>

                <footer class="spell-modal-footer">
                    <span id="modal-item-source" class="modal-footer-source">Source: Database</span>
                    <button type="button" class="modal-action-btn" id="modal-item-close-action-btn">Close</button>
                </footer>
            </div>
        </div>

        <!-- ACTION DETAILS MODAL -->
        <div id="action-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-action-name">
            <div class="spell-modal-dialog action-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <h2 class="modal-spell-title" id="modal-action-name">Action</h2>
                        <div class="modal-spell-sub" id="modal-action-type">Action</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="action-modal-close-btn" aria-label="Close action details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-meta-grid action-modal-meta-grid">
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-arrows-left-right"></i> RANGE / REACH</span>
                        <span class="meta-box-val" id="modal-action-range">—</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-dice-d20"></i> HIT / DC</span>
                        <span class="meta-box-val" id="modal-action-hit-dc">—</span>
                    </div>
                    <div class="meta-box meta-box-damage">
                        <span class="meta-box-label"><i class="fa-solid fa-burst"></i> DAMAGE / EFFECT</span>
                        <span class="meta-box-val" id="modal-action-damage">—</span>
                    </div>
                </div>

                <div class="spell-modal-body action-modal-body">
                    <div id="modal-action-notes"></div>
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">Action Details</span>
                    <button type="button" class="modal-action-btn" id="modal-action-close-action-btn">Close</button>
                </footer>
            </div>
        </div>

        <!-- CONDITIONS & EXHAUSTION MODAL -->
        <div id="conditions-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-conditions-title">
            <div class="spell-modal-dialog conditions-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-book-skull"></i> D&D 5.5 (2024 Rules)</span>
                            <span class="modal-badge source-badge" id="conditions-active-count-badge">0 Active</span>
                        </div>
                        <h2 class="modal-spell-title" id="modal-conditions-title">Conditions &amp; Exhaustion</h2>
                        <div class="modal-spell-sub">Toggle active conditions affecting your character and track Exhaustion levels</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="conditions-modal-close-btn" aria-label="Close conditions modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-body conditions-modal-body">
                    <div class="exhaustion-tracker-panel" id="exhaustion-tracker-panel">
                        <div class="exhaustion-tracker-top">
                            <div class="exhaustion-title-wrap">
                                <span class="exhaustion-title">
                                    <i class="fa-solid fa-battery-quarter"></i> Exhaustion Tracker (Levels 1–6)
                                </span>
                                <span class="exhaustion-subtitle">
                                    D&amp;D 5.5: Each level applies <strong>-2 to all D20 Tests</strong> and <strong>-5 ft. Speed</strong>. Level 6 causes <strong>Death</strong>.
                                </span>
                            </div>
                            <button type="button" class="clear-conditions-btn" id="clear-all-conditions-btn" title="Clear all active conditions and reset Exhaustion to 0">
                                <i class="fa-solid fa-rotate-left"></i> Clear All
                            </button>
                        </div>

                        <div class="exhaustion-levels-row" id="exhaustion-levels-row" role="group" aria-label="Exhaustion Level Selector">
                            <button type="button" class="exhaustion-lvl-btn active" data-exhaustion-level="0">
                                <span class="lvl-num">0</span>
                                <span class="lvl-label">None</span>
                            </button>
                            <button type="button" class="exhaustion-lvl-btn" data-exhaustion-level="1">
                                <span class="lvl-num">1</span>
                                <span class="lvl-label">-2 D20 / -5 ft.</span>
                            </button>
                            <button type="button" class="exhaustion-lvl-btn" data-exhaustion-level="2">
                                <span class="lvl-num">2</span>
                                <span class="lvl-label">-4 D20 / -10 ft.</span>
                            </button>
                            <button type="button" class="exhaustion-lvl-btn" data-exhaustion-level="3">
                                <span class="lvl-num">3</span>
                                <span class="lvl-label">-6 D20 / -15 ft.</span>
                            </button>
                            <button type="button" class="exhaustion-lvl-btn" data-exhaustion-level="4">
                                <span class="lvl-num">4</span>
                                <span class="lvl-label">-8 D20 / -20 ft.</span>
                            </button>
                            <button type="button" class="exhaustion-lvl-btn" data-exhaustion-level="5">
                                <span class="lvl-num">5</span>
                                <span class="lvl-label">-10 D20 / -25 ft.</span>
                            </button>
                            <button type="button" class="exhaustion-lvl-btn deadly" data-exhaustion-level="6">
                                <span class="lvl-num">6</span>
                                <span class="lvl-label"><i class="fa-solid fa-skull"></i> Death</span>
                            </button>
                        </div>

                        <div class="exhaustion-effects-banner" id="exhaustion-effects-banner">
                            No Exhaustion penalties currently active.
                        </div>
                    </div>

                    <div class="conditions-toolbar">
                        <div class="conditions-search-wrap">
                            <i class="fa-solid fa-magnifying-glass conditions-search-icon"></i>
                            <input
                                type="search"
                                id="conditions-search-input"
                                class="conditions-search-input"
                                placeholder="Filter conditions..."
                                aria-label="Filter conditions"
                            />
                        </div>
                    </div>

                    <div class="conditions-grid-list" id="conditions-modal-list">
                    </div>
                </div>

                <footer class="spell-modal-footer">
                    <span id="modal-conditions-source" class="modal-footer-source">Source: D&amp;D 5.5 (2024) Conditions Database</span>
                    <button type="button" class="modal-action-btn" id="modal-conditions-close-action-btn">Done</button>
                </footer>
            </div>
        </div>

        <!-- MANAGE SPELLS MODAL -->
        <div id="manage-spells-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-manage-spells-title">
            <div class="spell-modal-dialog manage-spells-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-database"></i> Spell Database</span>
                            <span class="modal-badge source-badge" id="manage-spells-total-badge">0 Spells</span>
                        </div>
                        <h2 class="modal-spell-title" id="modal-manage-spells-title">Manage Spells</h2>
                        <div class="modal-spell-sub">Search spells in the database to add to your sheet, and review your current spells by level</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="manage-spells-close-btn" aria-label="Close manage spells modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-body manage-spells-modal-body">
                    <div class="manage-spells-layout">
                        <!-- Left Panel: Search Database Spells -->
                        <div class="manage-spells-search-panel">
                            <div class="manage-panel-header">
                                <h3><i class="fa-solid fa-magnifying-glass"></i> Search Database Spells</h3>
                                <span class="manage-db-count" id="manage-db-results-count">0 found</span>
                            </div>
                            <div class="manage-search-controls">
                                <input
                                    type="text"
                                    id="manage-spells-search-input"
                                    class="manage-spells-search-input"
                                    placeholder="Search database by spell name, school, or effect..."
                                    autocomplete="off"
                                />
                                <select id="manage-spells-level-select" class="manage-spells-level-select" aria-label="Filter database spells by level">
                                    <option value="all">All Levels</option>
                                    <option value="0">Cantrip (0)</option>
                                    <option value="1">1st Level</option>
                                    <option value="2">2nd Level</option>
                                    <option value="3">3rd Level</option>
                                    <option value="4">4th Level</option>
                                    <option value="5">5th Level</option>
                                    <option value="6">6th Level</option>
                                    <option value="7">7th Level</option>
                                    <option value="8">8th Level</option>
                                    <option value="9">9th Level</option>
                                </select>
                            </div>
                            <div class="manage-db-results-list" id="manage-spells-db-results">
                            </div>
                        </div>

                        <!-- Right Panel: Character's Abbreviated Spell List by Available Level -->
                        <div class="manage-spells-current-panel">
                            <div class="manage-panel-header">
                                <h3><i class="fa-solid fa-list-check"></i> Character's Current Spells</h3>
                                <span class="manage-panel-hint">Current / Allowed per level</span>
                            </div>
                            <div class="manage-current-levels-list" id="manage-spells-current-levels">
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">Changes automatically update your character sheet</span>
                    <button type="button" class="modal-action-btn" id="manage-spells-done-btn">Done</button>
                </footer>
            </div>
        </div>

        <!-- MANAGE WEAPONS & ITEMS MODAL -->
        <div id="manage-items-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-manage-items-title">
            <div class="spell-modal-dialog manage-spells-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-database"></i> Items &amp; Weapons Database</span>
                            <span class="modal-badge source-badge" id="manage-items-total-badge">0 Items</span>
                        </div>
                        <h2 class="modal-spell-title" id="modal-manage-items-title">Manage Weapons &amp; Magic Items</h2>
                        <div class="modal-spell-sub">Search weapons, armor, and magic items in the database to add to your sheet, and manage carried gear</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="manage-items-close-btn" aria-label="Close manage items modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-body manage-spells-modal-body">
                    <div class="manage-spells-layout">
                        <!-- Left Panel: Search Database Items -->
                        <div class="manage-spells-search-panel">
                            <div class="manage-panel-header">
                                <h3><i class="fa-solid fa-magnifying-glass"></i> Search Weapons &amp; Items</h3>
                                <span class="manage-db-count" id="manage-items-results-count">0 found</span>
                            </div>
                            <div class="manage-search-controls">
                                <input
                                    type="text"
                                    id="manage-items-search-input"
                                    class="manage-spells-search-input"
                                    placeholder="Search weapons, magic items, armor, gear..."
                                    autocomplete="off"
                                />
                                <select id="manage-items-type-select" class="manage-spells-level-select" aria-label="Filter database items by type">
                                    <option value="all">All Types</option>
                                    <option value="weapon">Weapons</option>
                                    <option value="magic-item">Magic Items</option>
                                    <option value="armor">Armor &amp; Shields</option>
                                    <option value="potion">Potions &amp; Consumables</option>
                                    <option value="wondrous">Wondrous Items</option>
                                    <option value="gear">Adventuring Gear</option>
                                </select>
                            </div>
                            <div class="manage-db-results-list" id="manage-items-db-results">
                            </div>
                        </div>

                        <!-- Right Panel: Character's Current Weapons & Equipment -->
                        <div class="manage-spells-current-panel">
                            <div class="manage-panel-header">
                                <h3><i class="fa-solid fa-shield"></i> Character's Inventory</h3>
                                <span class="manage-panel-hint">Current weapons &amp; equipment</span>
                            </div>
                            <div class="manage-current-levels-list" id="manage-items-current-list">
                            </div>
                        </div>
                    </div>
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">Changes automatically update your character sheet</span>
                    <button type="button" class="modal-action-btn" id="manage-items-done-btn">Done</button>
                </footer>
            </div>
        </div>

        <!-- SINGLE CONDITION DEFINITION MODAL -->
        <div id="condition-detail-modal-container" class="spell-modal-backdrop condition-detail-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-condition-detail-name">
            <div class="spell-modal-dialog condition-detail-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-book-skull"></i> Condition</span>
                            <span class="modal-badge source-badge" id="modal-condition-detail-status">Inactive</span>
                        </div>
                        <h2 class="modal-spell-title" id="modal-condition-detail-name">Condition</h2>
                        <div class="modal-spell-sub" id="modal-condition-detail-summary">D&amp;D 5.5 (2024 Rules)</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="condition-detail-close-btn" aria-label="Close condition details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-body condition-detail-modal-body" id="modal-condition-detail-description">
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">Source: D&amp;D 5.5 (2024 Rules)</span>
                    <div class="condition-detail-footer-actions">
                        <button type="button" class="modal-action-btn secondary" id="condition-detail-toggle-active-btn">Toggle Active on Character</button>
                        <button type="button" class="modal-action-btn" id="condition-detail-done-btn">Close</button>
                    </div>
                </footer>
            </div>
        </div>

        <!-- EXPORT PDF FORMAT SELECTION MODAL -->
        <div id="export-pdf-modal-container" class="spell-modal-backdrop export-pdf-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-export-pdf-title">
            <div class="spell-modal-dialog export-pdf-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-file-pdf"></i> Black &amp; White PDF</span>
                            <span class="modal-badge source-badge">Printable Outline</span>
                        </div>
                        <h2 class="modal-spell-title" id="modal-export-pdf-title">Export Character Sheet</h2>
                        <div class="modal-spell-sub">Select your preferred page format and layout</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="export-pdf-close-btn" aria-label="Close export modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-body export-pdf-modal-body">
                    <p class="export-pdf-intro">
                        Exports an ink-friendly, high-contrast black &amp; white character sheet with outline borders and fillable tabletop boxes for HP and spell slots.
                    </p>

                    <fieldset class="pdf-format-fieldset">
                        <legend class="pdf-format-legend">Page Format</legend>
                        <div class="pdf-format-options-grid">
                            <label class="pdf-format-card" for="pdf-format-letter">
                                <input type="radio" name="pdf-format-choice" id="pdf-format-letter" value="letter" checked />
                                <div class="pdf-format-card-content">
                                    <div class="pdf-format-header">
                                        <i class="fa-regular fa-file-lines pdf-format-icon"></i>
                                        <div class="pdf-format-title-wrap">
                                            <span class="pdf-format-name">Standard Letter</span>
                                            <span class="pdf-format-dims">8.5" × 11" (612 × 792 pt)</span>
                                        </div>
                                    </div>
                                    <p class="pdf-format-desc">
                                        Standard North American paper size. Perfect for home printers, binders, and tabletop clipboards.
                                    </p>
                                </div>
                            </label>

                            <label class="pdf-format-card" for="pdf-format-remarkable">
                                <input type="radio" name="pdf-format-choice" id="pdf-format-remarkable" value="remarkable" />
                                <div class="pdf-format-card-content">
                                    <div class="pdf-format-header">
                                        <i class="fa-solid fa-tablet-screen-button pdf-format-icon"></i>
                                        <div class="pdf-format-title-wrap">
                                            <span class="pdf-format-name">reMarkable / E-Reader</span>
                                            <span class="pdf-format-dims">3:4 Aspect Ratio (1404 × 1872)</span>
                                        </div>
                                    </div>
                                    <p class="pdf-format-desc">
                                        Precision-fitted for reMarkable 2 &amp; Paper Pro e-ink tablets. Zero letterboxing with margins tailored for stylus writing.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </fieldset>
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">Choice is remembered for future exports</span>
                    <div class="export-pdf-footer-actions">
                        <button type="button" class="modal-action-btn secondary" id="export-pdf-cancel-btn">Cancel</button>
                        <button type="button" class="modal-action-btn" id="export-pdf-confirm-btn">
                            <i class="fa-solid fa-download"></i> Download PDF
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    `;
}
