import { renderLockPanel } from "../controllers/definitionLockPanel";
import { renderCustomItemModal } from "./customItemModal";

export function renderModals(): string {
    return `
        <!-- SPELL DETAILS MODAL -->
        <div id="spell-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-spell-name">
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
                    <div class="modal-footer-actions">
                        <button type="button" class="modal-action-btn secondary copy-lock-btn hidden" id="modal-spell-copy-lock-btn" aria-pressed="false" title="Keeps this character's copy exactly as it is when the spell is edited or the character is refreshed from D&amp;D Beyond">
                            <i class="fa-solid fa-lock-open" aria-hidden="true"></i> Lock on This Character
                        </button>
                        <button type="button" class="modal-action-btn secondary hidden" id="modal-spell-edit-btn">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit Spell
                        </button>
                        <button type="button" class="modal-action-btn" id="modal-close-action-btn">Close</button>
                    </div>
                </footer>
            </div>
        </div>

        <!-- ADD CUSTOM SPELL MODAL -->
        <div id="custom-spell-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="custom-spell-title">
            <div class="spell-modal-dialog custom-spell-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Homebrew</span>
                            <span class="modal-badge source-badge">Local Database</span>
                        </div>
                        <h2 class="modal-spell-title" id="custom-spell-title">Add Custom Spell</h2>
                        <div class="modal-spell-sub" id="custom-spell-subtitle">Save a custom spell to your local database and attach it to your active sheet</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="custom-spell-close-btn" aria-label="Close custom spell modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div id="custom-spell-status" class="status-msg hidden" role="status" aria-live="polite"></div>

                <form id="custom-spell-form" class="custom-spell-form">
                    <div class="custom-spell-form-body">
                        ${renderLockPanel("custom-spell-locks")}
                        <!-- Basic Info Section -->
                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-sparkles"></i> Basic Information</span>
                            </div>
                            <div class="form-grid">
                                <label class="form-field full-width">
                                    <span class="form-label">Spell Name <span class="required-star">*</span></span>
                                    <input type="text" id="custom-spell-name" required placeholder="e.g. Eldritch Flash" autocomplete="off" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Level (0 for Cantrip) <span class="required-star">*</span></span>
                                    <input type="number" id="custom-spell-level" min="0" max="9" value="1" required />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Magic School <span class="required-star">*</span></span>
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
                            </div>
                        </div>

                        <!-- Casting Properties Section -->
                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-stopwatch"></i> Casting &amp; Range</span>
                            </div>
                            <div class="form-grid">
                                <label class="form-field">
                                    <span class="form-label">Casting Time <span class="required-star">*</span></span>
                                    <input type="text" id="custom-spell-casting-time" value="1 action" required placeholder="e.g. 1 action, 1 bonus action" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Range / Area <span class="required-star">*</span></span>
                                    <input type="text" id="custom-spell-range" value="60 feet" required placeholder="e.g. Self, 60 feet, Touch" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Duration <span class="required-star">*</span></span>
                                    <input type="text" id="custom-spell-duration" value="Instantaneous" required placeholder="e.g. Instantaneous, 1 minute" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Components</span>
                                    <input type="text" id="custom-spell-components" value="V, S" placeholder="e.g. V, S, M (a pinch of sulfur)" />
                                </label>
                                <div class="form-checkboxes full-width">
                                    <label class="form-toggle-pill" for="custom-spell-ritual">
                                        <input type="checkbox" id="custom-spell-ritual" />
                                        <span class="toggle-pill-ui">
                                            <i class="fa-solid fa-book-skull"></i>
                                            <span>Ritual Spell</span>
                                        </span>
                                    </label>
                                    <label class="form-toggle-pill" for="custom-spell-concentration">
                                        <input type="checkbox" id="custom-spell-concentration" />
                                        <span class="toggle-pill-ui">
                                            <i class="fa-solid fa-brain"></i>
                                            <span>Requires Concentration</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Damage & Level Scaling Section -->
                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-burst"></i> Damage &amp; Effect Scaling (Optional)</span>
                            </div>
                            <div class="form-checkboxes full-width">
                                <label class="form-toggle-pill" for="custom-spell-has-damage">
                                    <input type="checkbox" id="custom-spell-has-damage" />
                                    <span class="toggle-pill-ui">
                                        <i class="fa-solid fa-dice-d20"></i>
                                        <span>Record Damage, Healing, and/or Scaling Effects</span>
                                    </span>
                                </label>
                            </div>
                            <div id="custom-spell-damage-panel" class="custom-spell-damage-panel hidden">
                                <div class="form-grid">
                                    <label class="form-field">
                                        <span class="form-label">Base Damage / Healing Dice</span>
                                        <input type="text" id="custom-spell-damage-dice" placeholder="e.g. 2d8, 3d6, 1d10" autocomplete="off" />
                                    </label>
                                    <label class="form-field">
                                        <span class="form-label">Damage Type</span>
                                        <select id="custom-spell-damage-type">
                                            <option value="Fire" selected>Fire</option>
                                            <option value="Acid">Acid</option>
                                            <option value="Bludgeoning">Bludgeoning</option>
                                            <option value="Cold">Cold</option>
                                            <option value="Force">Force</option>
                                            <option value="Lightning">Lightning</option>
                                            <option value="Necrotic">Necrotic</option>
                                            <option value="Piercing">Piercing</option>
                                            <option value="Poison">Poison</option>
                                            <option value="Psychic">Psychic</option>
                                            <option value="Radiant">Radiant</option>
                                            <option value="Slashing">Slashing</option>
                                            <option value="Thunder">Thunder</option>
                                            <option value="Healing">Healing</option>
                                            <option value="None">None / Effect Only</option>
                                            <option value="Typeless">Typeless / Other</option>
                                        </select>
                                    </label>
                                    <label class="form-field">
                                        <span class="form-label">Base Modifier (Optional)</span>
                                        <input type="text" id="custom-spell-damage-mod" placeholder="e.g. +3 or {{modifier:cha}}" autocomplete="off" />
                                    </label>
                                    <label class="form-field full-width">
                                        <span class="form-label">Damage Scaling Mode</span>
                                        <select id="custom-spell-scaling-type">
                                            <option value="auto" selected>Auto (Character Level for Cantrips, Slot Level for Leveled)</option>
                                            <option value="character">Character Level (Cantrips &amp; Level Scaling: 1st, 5th, 11th, 17th)</option>
                                            <option value="slot">Spell Slot Level (1st–9th Level Slot Upcasting)</option>
                                        </select>
                                    </label>
                                </div>

                                <div class="scaling-subhead">
                                    <div class="scaling-subhead-info">
                                        <span class="scaling-subhead-title" id="custom-spell-scaling-title"><i class="fa-solid fa-layer-group"></i> Modifiers &amp; Dice per Level</span>
                                        <span class="form-field-hint" id="custom-spell-scaling-hint">Customize damage dice, modifiers, and effects for each level at which this spell scales.</span>
                                    </div>
                                    <div class="scaling-subhead-actions">
                                        <button type="button" class="scaling-action-btn" id="custom-spell-autoscale-btn" title="Add +1 die for each higher level based on your base dice">
                                            <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-scale (+1 die / tier)
                                        </button>
                                        <button type="button" class="scaling-action-btn secondary" id="custom-spell-reset-scaling-btn" title="Reset all levels to base damage dice and modifier">
                                            <i class="fa-solid fa-rotate-left"></i> Reset to Base
                                        </button>
                                    </div>
                                </div>

                                <div class="scaling-table-wrap">
                                    <table class="custom-spell-scaling-table">
                                        <thead>
                                            <tr>
                                                <th class="col-level" id="custom-spell-scaling-col-header">Scaling Level</th>
                                                <th class="col-dice">Damage Dice</th>
                                                <th class="col-mod">Modifier</th>
                                                <th class="col-effect">Scaling Effect</th>
                                                <th class="col-preview">Total Damage</th>
                                            </tr>
                                        </thead>
                                        <tbody id="custom-spell-scaling-tbody">
                                            <!-- Dynamically generated rows -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <!-- Description Section -->
                        <div class="form-section">
                            <div class="form-section-header description-header">
                                <span class="form-section-title"><i class="fa-solid fa-feather-pointed"></i> Spell Description <span class="required-star">*</span></span>
                                <button type="button" class="markup-guide-btn" id="custom-spell-guide-btn" title="View D&amp;D Beyond description placeholders and rule tags guide">
                                    <i class="fa-solid fa-circle-question"></i> Placeholder &amp; Tag Guide
                                </button>
                            </div>
                            <p class="form-field-hint">
                                Dynamic placeholders (like <code>{{savedc:cha}}</code> or <code>{{modifier:int}}</code>) and tags (like <code>[condition]Prone[/condition]</code> or <code>[rule]Advantage[/rule]</code>) are supported.
                            </p>
                            <label class="form-field full-width">
                                <textarea id="custom-spell-description" rows="6" required placeholder="Describe what the spell does, saving throws, damage formulas, and upcasting benefits..."></textarea>
                            </label>
                        </div>

                        <!-- Media / Extras Section -->
                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-image"></i> Illustration (Optional)</span>
                            </div>
                            <div class="form-field full-width">
                                <span class="form-label">Spell Artwork</span>
                                <p class="form-field-hint">Upload an image file from your device or paste an external image URL.</p>
                                <div class="custom-spell-image-controls">
                                    <div class="custom-spell-image-input-wrap">
                                        <input type="url" id="custom-spell-image" placeholder="Paste image URL (https://...)" autocomplete="off" />
                                        <button type="button" class="custom-spell-upload-btn" id="custom-spell-upload-trigger-btn" title="Choose an image file from your device">
                                            <i class="fa-solid fa-upload"></i> Upload Image
                                        </button>
                                        <input type="file" id="custom-spell-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" class="hidden" />
                                    </div>
                                    <div id="custom-spell-upload-status" class="custom-spell-upload-status hidden" role="status"></div>
                                    <div id="custom-spell-image-preview-wrap" class="custom-spell-image-preview-wrap hidden">
                                        <img id="custom-spell-image-preview" src="" alt="Spell illustration preview" />
                                        <button type="button" id="custom-spell-image-clear-btn" class="custom-spell-image-clear-btn" title="Remove image">
                                            <i class="fa-solid fa-xmark"></i> Clear Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer class="spell-modal-footer form-footer">
                        <button type="button" class="modal-action-btn secondary" id="custom-spell-cancel-btn">Cancel</button>
                        <button type="submit" class="modal-action-btn primary" id="custom-spell-submit-btn">
                            <i class="fa-solid fa-floppy-disk"></i> Save Spell
                        </button>
                    </footer>
                </form>
            </div>
        </div>

        <!-- D&D BEYOND DESCRIPTION PLACEHOLDERS & TAGS GUIDE MODAL -->
        <div id="markup-guide-modal-container" class="spell-modal-backdrop markup-guide-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="markup-guide-title">
            <div class="spell-modal-dialog markup-guide-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid fa-code"></i> D&amp;D Beyond Markup</span>
                            <span class="modal-badge source-badge">Syntax Reference</span>
                        </div>
                        <h2 class="modal-spell-title" id="markup-guide-title"><i class="fa-solid fa-book-bookmark"></i> Placeholders &amp; Rule Tags Guide</h2>
                        <div class="modal-spell-sub">Dynamic character calculations and interactive pop-up links for your descriptions</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="markup-guide-close-btn" aria-label="Close syntax guide">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-body markup-guide-body">
                    <!-- Intro banner -->
                    <div class="guide-callout info">
                        <i class="fa-solid fa-circle-info guide-callout-icon"></i>
                        <div>
                            <strong>Live Dynamic Evaluation:</strong> Text wrapped in double curly braces <code>{{...}}</code> automatically pulls from the active character's stats (scores, modifiers, DC, level, proficiency bonus). Bracketed tags <code>[...]...[/...]</code> automatically render interactive buttons (for conditions, spells, items) or official rules glossary links.
                        </div>
                    </div>

                    <!-- Category 1: Dynamic Placeholders -->
                    <section class="guide-section">
                        <h3 class="guide-section-title"><i class="fa-solid fa-calculator"></i> Dynamic Value Placeholders</h3>
                        <p class="guide-section-desc">Replaced with live calculated values based on the character sheet.</p>
                        
                        <div class="guide-table-wrap">
                            <table class="guide-table">
                                <thead>
                                    <tr>
                                        <th>Placeholder</th>
                                        <th>What It Calculates</th>
                                        <th>Example Output</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>{{savedc:cha}}</code></td>
                                        <td>Spell Save DC using specified stat (8 + PB + Mod). Use multiple stats like <code>{{savedc:wis,int}}</code> to pick the highest.</td>
                                        <td><span class="guide-sample-val">15</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{spellattack:int}}</code></td>
                                        <td>Spell Attack modifier (PB + Mod). Pre-pends <code>+</code> or <code>-</code>.</td>
                                        <td><span class="guide-sample-val">+7</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{modifier:cha}}</code></td>
                                        <td>Ability modifier for <code>str</code>, <code>dex</code>, <code>con</code>, <code>int</code>, <code>wis</code>, or <code>cha</code>.</td>
                                        <td><span class="guide-sample-val">+4</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{score:con}}</code></td>
                                        <td>Raw ability score (e.g. 10, 14, 18).</td>
                                        <td><span class="guide-sample-val">16</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{proficiency}}</code> or <code>{{pb}}</code></td>
                                        <td>Character's Proficiency Bonus.</td>
                                        <td><span class="guide-sample-val">+3</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{classlevel}}</code></td>
                                        <td>Level in the spellcasting or feature source class.</td>
                                        <td><span class="guide-sample-val">5</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{characterlevel}}</code></td>
                                        <td>Total character level across all classes.</td>
                                        <td><span class="guide-sample-val">7</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{scalevalue}}</code></td>
                                        <td>Scale die/value for the feature (e.g. Sneak Attack, Bardic Inspiration).</td>
                                        <td><span class="guide-sample-val">1d8</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{limiteduse}}</code></td>
                                        <td>Max resource uses (or spellcasting mod, min 1).</td>
                                        <td><span class="guide-sample-val">4</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>{{maxhp}}</code>, <code>{{speed}}</code></td>
                                        <td>Character vitals (Maximum Hit Points, Walk Speed in feet).</td>
                                        <td><span class="guide-sample-val">42</span>, <span class="guide-sample-val">30</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Formatting & Math Flags -->
                        <div class="guide-subsection">
                            <h4 class="guide-subsection-title"><i class="fa-solid fa-square-root-variable"></i> Math Formulas &amp; Formatting Modifiers</h4>
                            <div class="guide-cards-grid">
                                <div class="guide-card">
                                    <div class="guide-card-header">
                                        <code>{{(classlevel/2)@rounddown}}</code>
                                    </div>
                                    <div class="guide-card-body">
                                        Calculates half level rounded down (e.g. Level 5 becomes 2). Supports <code>@rounddown</code>, <code>@roundup</code>, or <code>@round</code>.
                                    </div>
                                </div>
                                <div class="guide-card">
                                    <div class="guide-card-header">
                                        <code>{{((classlevel-1)/7)@rounddown,min:1}}</code>
                                    </div>
                                    <div class="guide-card-body">
                                        Nested arithmetic with minimum or maximum bounds using <code>,min:N</code> or <code>,max:N</code>.
                                    </div>
                                </div>
                                <div class="guide-card">
                                    <div class="guide-card-header">
                                        <code>{{(13+modifier:dex)#unsigned}}</code>
                                    </div>
                                    <div class="guide-card-body">
                                        Calculates armor/save formula without a leading plus sign using the <code>#unsigned</code> flag.
                                    </div>
                                </div>
                                <div class="guide-card">
                                    <div class="guide-card-header">
                                        <code>{{modifier:str+proficiency}}</code>
                                    </div>
                                    <div class="guide-card-body">
                                        Adds multiple dynamic stats together with signed formatting.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Category 2: Interactive Tags -->
                    <section class="guide-section">
                        <h3 class="guide-section-title"><i class="fa-solid fa-tags"></i> Interactive Rule &amp; Content Tags</h3>
                        <p class="guide-section-desc">Wrap keywords in bracketed tags to turn them into clickable pop-ups or rules links.</p>

                        <div class="guide-table-wrap">
                            <table class="guide-table">
                                <thead>
                                    <tr>
                                        <th>Tag Syntax</th>
                                        <th>Action &amp; Target</th>
                                        <th>Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>[condition]Prone[/condition]</code></td>
                                        <td>Opens the interactive condition details dialog for any 5e condition.</td>
                                        <td><span class="guide-badge-sample condition"><i class="fa-solid fa-circle-exclamation"></i> Prone</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[spell]Fireball[/spell]</code></td>
                                        <td>Opens the spell details card from the database.</td>
                                        <td><span class="guide-badge-sample spell"><i class="fa-solid fa-wand-magic-sparkles"></i> Fireball</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[item]Potion of Healing[/item]</code></td>
                                        <td>Opens the item/equipment detail modal. Also supports <code>[weapon]</code> and <code>[armor]</code>.</td>
                                        <td><span class="guide-badge-sample item"><i class="fa-solid fa-shield-halved"></i> Potion of Healing</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[rule]Advantage[/rule]</code></td>
                                        <td>Links to the 2024 D&amp;D Rules Glossary for rules, cover, combat, etc.</td>
                                        <td><span class="guide-badge-sample rule"><i class="fa-solid fa-book"></i> Advantage</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[action]Disengage[/action]</code></td>
                                        <td>Links to the action definition (Dash, Disengage, Dodge, Help, Hide, Ready, etc.).</td>
                                        <td><span class="guide-badge-sample action"><i class="fa-solid fa-bolt"></i> Disengage</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[skill]Stealth[/skill]</code></td>
                                        <td>Links to skill checks, senses (<code>[sense]Darkvision[/sense]</code>), or masteries (<code>[mastery]Push[/mastery]</code>).</td>
                                        <td><span class="guide-badge-sample rule"><i class="fa-solid fa-book"></i> Stealth</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[feat]War Caster[/feat]</code></td>
                                        <td>Links directly to the D&amp;D Beyond Feats glossary.</td>
                                        <td><span class="guide-badge-sample feat"><i class="fa-solid fa-medal"></i> War Caster</span></td>
                                    </tr>
                                    <tr>
                                        <td><code>[condition]incapacitated;stunned[/condition]</code></td>
                                        <td><strong>Custom label:</strong> Use a semicolon <code>[tag]target;display_label[/tag]</code> to link to a rule while displaying custom wording.</td>
                                        <td><span class="guide-badge-sample condition"><i class="fa-solid fa-circle-exclamation"></i> stunned</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <!-- Category 3: Live Example -->
                    <section class="guide-section">
                        <div class="guide-example-header">
                            <h3 class="guide-section-title"><i class="fa-solid fa-flask"></i> Complete Example</h3>
                            <button type="button" class="guide-copy-btn" id="markup-guide-copy-example-btn" title="Copy snippet to clipboard">
                                <i class="fa-regular fa-copy"></i> Copy Example
                            </button>
                        </div>
                        <div class="guide-code-box" id="markup-guide-example-text">You unleash a flash of twilight energy. Each creature in a 15-foot cube must make a Dexterity saving throw (DC {{savedc:cha}}). On a failed save, a target takes 2d8 + {{modifier:cha#unsigned}} Radiant damage and has the [condition]Blinded[/condition] condition until the start of your next turn. On a successful save, it takes half as much damage and isn't blinded.

If you take the [action]Disengage[/action] action before casting this spell, your [skill]Stealth[/skill] checks have [rule]Advantage[/rule] for 1 minute.</div>
                    </section>
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">D&amp;D 5.5 / 2024 Rules Compatible</span>
                    <button type="button" class="modal-action-btn primary" id="markup-guide-done-btn">
                        <i class="fa-solid fa-check"></i> Got It
                    </button>
                </footer>
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
                    <div class="meta-box meta-box-quantity">
                        <span class="meta-box-label"><i class="fa-solid fa-boxes-stacked"></i> QUANTITY</span>
                        <div class="modal-qty-stepper" id="modal-item-qty-stepper">
                            <button type="button" class="modal-qty-btn" id="modal-item-qty-dec" aria-label="Decrease quantity" title="Decrease quantity">&minus;</button>
                            <input type="number" id="modal-item-quantity-input" class="modal-qty-input" min="0" max="9999" value="1" aria-label="Item quantity" />
                            <button type="button" class="modal-qty-btn" id="modal-item-qty-inc" aria-label="Increase quantity" title="Increase quantity">&plus;</button>
                        </div>
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
                    <div class="modal-footer-actions">
                        <button type="button" class="modal-action-btn secondary copy-lock-btn hidden" id="modal-item-copy-lock-btn" aria-pressed="false" title="Keeps this character's copy exactly as it is when the item is edited or the character is refreshed from D&amp;D Beyond">
                            <i class="fa-solid fa-lock-open" aria-hidden="true"></i> Lock on This Character
                        </button>
                        <button type="button" class="modal-action-btn secondary hidden" id="modal-item-edit-btn">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i> <span id="modal-item-edit-label">Edit Item</span>
                        </button>
                        <button type="button" class="modal-action-btn" id="modal-item-close-action-btn">Close</button>
                    </div>
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

                <div class="spell-modal-meta-grid action-modal-meta-grid" id="modal-action-meta">
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
                    <span class="modal-footer-source" id="modal-action-footer-source">Action Details</span>
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

        ${renderCustomItemModal("weapon")}
        ${renderCustomItemModal("magic-item")}
    `;
}
