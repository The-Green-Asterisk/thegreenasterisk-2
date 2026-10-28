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
                    <div class="meta-box">
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
    `;
}
