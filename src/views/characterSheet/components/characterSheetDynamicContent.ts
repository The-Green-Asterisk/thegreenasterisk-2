import { CharacterData } from "../characterData";
import { renderAbilityCards } from "./abilities";
import { renderActions } from "./actions";
import { renderEquipment } from "./equipment";
import { renderFeatures } from "./features";
import { renderHeroSection } from "./hero";
import { renderSpellSlotsAndResources } from "./resources";
import { renderSkills } from "./skills";
import { renderSpellsByLevel } from "./spells";
import { renderVitalsSection } from "./vitals";
import { renderWeapons } from "./weapons";

export function renderSheetContent(data: CharacterData): string {
    const cantripsCount = data.spells.filter(s => s.level === 0).length;
    const lvl1Count = data.spells.filter(s => s.level === 1).length;
    const lvl2Count = data.spells.filter(s => s.level === 2).length;
    const lvl3Count = data.spells.filter(s => s.level === 3).length;
    const highLevelCount = data.spells.filter(s => s.level >= 4).length;

    return `
        ${renderHeroSection(data)}

        <section class="vitals-section" aria-label="Core Combat Statistics">
            <div class="abilities-container" aria-label="Ability Scores & Saving Throws">
                ${renderAbilityCards(data)}
            </div>
            ${renderVitalsSection(data)}
        </section>

        <section class="resources-section" aria-label="Spell Slots & Combat Resources">
            <div class="section-title-bar">
                <h3><i class="fa-solid fa-sparkles"></i> Spell Slots & Resources</h3>
                <div class="resource-actions">
                    <button class="rest-btn" id="short-rest-btn" title="Reset Short Rest slots and features">
                        <i class="fa-solid fa-mug-hot"></i> Short Rest
                    </button>
                    <button class="rest-btn" id="long-rest-btn" title="Reset all spell slots, features, and Hit Points">
                        <i class="fa-solid fa-bed"></i> Long Rest
                    </button>
                </div>
            </div>

            <div class="slots-grid" id="slots-and-resources-grid">
                ${renderSpellSlotsAndResources(data)}
            </div>
        </section>

        <section class="tabs-section">
            <div class="tab-nav" role="tablist" aria-label="Character Sheet Views">
                <button class="tab-btn active" role="tab" aria-selected="true" data-tab-target="tab-weapons" id="btn-tab-weapons">
                    <i class="fa-solid fa-khanda"></i> Weapons <span class="tab-count" id="tab-weapons-count">(${data.weapons?.length || 0})</span>
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-spells" id="btn-tab-spells">
                    <i class="fa-solid fa-wand-sparkles"></i> Spells <span class="tab-count" id="tab-spells-count">(${data.spells.length})</span>
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-actions" id="btn-tab-actions">
                    <i class="fa-solid fa-bolt"></i> Actions & Attacks
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-features" id="btn-tab-features">
                    <i class="fa-solid fa-scroll"></i> Features & Traits
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-skills" id="btn-tab-skills">
                    <i class="fa-solid fa-bullseye"></i> Skills & Saves
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-equipment" id="btn-tab-equipment">
                    <i class="fa-solid fa-shield"></i> Equipment & Proficiencies
                </button>
            </div>

            <div class="tab-pane active" id="tab-weapons" role="tabpanel" aria-labelledby="btn-tab-weapons">
                <div class="weapons-container">
                    <div class="weapons-header-banner">
                        <div class="weapons-header-info">
                            <h3><i class="fa-solid fa-khanda"></i> Weapons & Attack Mastery</h3>
                            <p class="tab-lead-note">Equipped and carried weapons, attack bonuses, damage formulas, weapon properties, and 2024 Weapon Masteries. Click any weapon for full tiered details.</p>
                        </div>
                    </div>
                    <div class="weapons-grid">
                        ${renderWeapons(data)}
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-spells" role="tabpanel" aria-labelledby="btn-tab-spells">
                <div class="spell-filters-bar">
                    <div class="search-box">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" id="spell-search" placeholder="Search spells by name, school, source, tags..." autocomplete="off" />
                        <button id="spell-search-clear" class="clear-search-btn" title="Clear search" style="display: none;">&times;</button>
                    </div>
                    <div class="filter-chips" id="spell-filter-chips">
                        <button class="filter-chip active" data-filter="all">All (${data.spells.length})</button>
                        ${cantripsCount > 0 ? `<button class="filter-chip" data-filter="cantrip">Cantrips (${cantripsCount})</button>` : ''}
                        ${lvl1Count > 0 ? `<button class="filter-chip" data-filter="lvl-1">1st Level (${lvl1Count})</button>` : ''}
                        ${lvl2Count > 0 ? `<button class="filter-chip" data-filter="lvl-2">2nd Level (${lvl2Count})</button>` : ''}
                        ${lvl3Count > 0 ? `<button class="filter-chip" data-filter="lvl-3">3rd Level (${lvl3Count})</button>` : ''}
                        ${highLevelCount > 0 ? `<button class="filter-chip" data-filter="lvl-high">4th+ Level (${highLevelCount})</button>` : ''}
                        <button class="filter-chip" data-filter="conc">Concentration</button>
                        <button class="filter-chip" data-filter="ritual">Rituals</button>
                    </div>
                    <button class="add-custom-spell-btn" id="open-custom-spell-btn" title="Add a custom spell to this character and database">
                        <i class="fa-solid fa-plus"></i> Add Custom Spell
                    </button>
                </div>

                <div class="spells-click-prompt">
                    <i class="fa-solid fa-circle-info"></i> <em>Click any spell below to load its full description independently (Database &rarr; D&D Beyond &rarr; Open5e).</em>
                </div>

                <div id="spells-grid">
                    ${renderSpellsByLevel(data.spells, data.spellSlots)}
                </div>
                <div id="no-spells-found" class="no-results" style="display: none;">
                    <i class="fa-solid fa-ghost"></i>
                    <p>No spells matched your search filter.</p>
                </div>
            </div>

            <div class="tab-pane" id="tab-actions" role="tabpanel" aria-labelledby="btn-tab-actions">
                <div class="actions-container">
                    ${(data.weapons && data.weapons.length > 0) ? `
                        <div class="actions-weapons-highlight">
                            <h4><i class="fa-solid fa-khanda"></i> Weapon Attacks</h4>
                            <div class="weapons-grid">
                                ${renderWeapons(data)}
                            </div>
                        </div>
                    ` : ''}
                    <h4><i class="fa-solid fa-bolt"></i> Actions & Special Abilities</h4>
                    <p class="tab-lead-note">Common actions, bonus actions, reactions, and offensive cantrips. Spells can be clicked to view their full card.</p>
                    <div class="actions-grid">
                        ${renderActions(data)}
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-features" role="tabpanel" aria-labelledby="btn-tab-features">
                <div class="features-container">
                    <div class="features-grid">
                        ${renderFeatures(data)}
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-skills" role="tabpanel" aria-labelledby="btn-tab-skills">
                <div class="skills-container">
                    <div class="skills-grid">
                        <div class="skills-list">
                            <h3>All Skills</h3>
                            ${renderSkills(data)}
                        </div>
                        <div class="senses-and-training">
                            <h3>Senses & Proficiencies</h3>
                            <div class="sense-card">
                                <h4>Passive Senses</h4>
                                <ul>
                                    <li><strong>Passive Perception:</strong> ${data.vitals.passivePerception}</li>
                                    <li><strong>Passive Investigation:</strong> ${data.vitals.passiveInvestigation}</li>
                                    <li><strong>Passive Insight:</strong> ${data.vitals.passiveInsight}</li>
                                    <li><strong>Blindsight:</strong> ${data.vitals.blindsight || '—'}</li>
                                    <li><strong>Darkvision:</strong> ${data.vitals.darkvision}</li>
                                    <li><strong>Tremorsense:</strong> ${data.vitals.tremorsense || '—'}</li>
                                    <li><strong>Truesight:</strong> ${data.vitals.truesight || '—'}</li>
                                </ul>
                            </div>
                            <div class="sense-card">
                                <h4>Training & Languages</h4>
                                <p><strong>Armor:</strong> ${data.proficiencies.armor.length ? data.proficiencies.armor.join(', ') : 'None'}</p>
                                <p><strong>Weapons:</strong> ${data.proficiencies.weapons.length ? data.proficiencies.weapons.join(', ') : 'None'}</p>
                                <p><strong>Tools & Instruments:</strong> ${data.proficiencies.tools.length ? data.proficiencies.tools.join(', ') : 'None'}</p>
                                <p><strong>Languages:</strong> ${data.proficiencies.languages.length ? data.proficiencies.languages.join(', ') : 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-equipment" role="tabpanel" aria-labelledby="btn-tab-equipment">
                <div class="equipment-container">
                    <div class="equipment-header-banner">
                        <p class="tab-lead-note">Equipment, inventory items, and magical gear. Click any magic item or equipment to view full tiered details.</p>
                    </div>
                    <div class="equipment-grid">
                        ${renderEquipment(data)}
                    </div>
                </div>
            </div>
        </section>
    `;
}
