import { CharacterData } from "../characterData";
import { renderAbilityCards } from "./abilities";
import { renderActions } from "./actions";
import { renderDetailsAndNotes, renderSpeciesSpellcasting } from "./details";
import { renderEquipment } from "./equipment";
import { renderFeatures } from "./features";
import { renderHeroSection } from "./hero";
import { renderSpellSlotsAndResources } from "./resources";
import { renderSkills } from "./skills";
import { describePreparedByClass, getCharacterSpellLevelLimits, renderSpellsByLevel } from "./spells";
import { renderSavingThrowNotes, renderStickyVitalsBar, renderVitalsSection } from "./vitals";
import { SheetTab, sheetTabOrder } from "./tabOrder";
import { renderWeapons } from "./weapons";

export function renderSheetContent(data: CharacterData): string {
    const limits = getCharacterSpellLevelLimits(data);
    const spellsList = data.spells || [];
    const cantripsCount = spellsList.filter(s => s.level === 0).length;
    const lvl1Count = spellsList.filter(s => s.level === 1).length;
    const lvl2Count = spellsList.filter(s => s.level === 2).length;
    const lvl3Count = spellsList.filter(s => s.level === 3).length;
    const highLevelCount = spellsList.filter(s => s.level >= 4).length;

    const tabOrder = sheetTabOrder(data);
    const tabButton = (tab: SheetTab, icon: string, label: string) => {
        const active = tab === tabOrder[0];
        return `
                <button class="tab-btn${active ? " active" : ""}" role="tab" aria-selected="${active}" data-tab-target="tab-${tab}" id="btn-tab-${tab}">
                    <i class="fa-solid ${icon}" aria-hidden="true"></i> ${label}
                </button>`;
    };
    const tabButtons: Record<SheetTab, string> = {
        weapons: tabButton("weapons", "fa-khanda", `Weapons <span class="tab-count" id="tab-weapons-count">(${data.weapons?.length || 0})</span>`),
        spells: tabButton("spells", "fa-wand-sparkles", `Spells <span class="tab-count" id="tab-spells-count">(${data.spells.length})</span>`),
        actions: tabButton("actions", "fa-bolt", "Actions & Attacks"),
        skills: tabButton("skills", "fa-bullseye", "Skills, Saves & Proficiencies"),
        equipment: tabButton("equipment", "fa-shield", "Equipment"),
        features: tabButton("features", "fa-scroll", "Features & Traits"),
        details: tabButton("details", "fa-book-open", "Details & Notes")
    };
    const paneClass = (tab: SheetTab) => `tab-pane${tab === tabOrder[0] ? " active" : ""}`;

    return `
        ${renderStickyVitalsBar(data)}
        ${renderHeroSection(data)}
        <p class="breakdown-hint"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Hover over, press and hold, or rest keyboard focus on any underlined number to see where it comes from.</p>

        <section class="vitals-section" aria-label="Core Combat Statistics">
            <div class="abilities-container" aria-label="Ability Scores & Saving Throws">
                ${renderAbilityCards(data)}
            </div>
            ${renderSavingThrowNotes(data)}
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
                ${tabOrder.map((tab) => tabButtons[tab]).join("")}
            </div>

            <div class="${paneClass("weapons")}" id="tab-weapons" role="tabpanel" aria-labelledby="btn-tab-weapons">
                <div class="weapons-container">
                    <div class="weapons-header-banner">
                        <div class="weapons-header-info">
                            <h3><i class="fa-solid fa-khanda"></i> Weapons & Attack Mastery</h3>
                            <p class="tab-lead-note">Equipped and carried weapons, attack bonuses, damage formulas, weapon properties, and 2024 Weapon Masteries. Click any weapon for full tiered details.</p>
                        </div>
                        <div class="weapons-header-actions">
                            <button class="manage-weapons-btn" id="open-manage-weapons-btn" title="Search database items and manage weapons inventory">
                                <i class="fa-solid fa-khanda"></i> Manage Weapons/Items
                            </button>
                            <button type="button" class="add-custom-item-btn" id="open-custom-weapon-btn" aria-haspopup="dialog" title="Add a custom weapon to this character and the database">
                                <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Custom Weapon
                            </button>
                        </div>
                    </div>
                    <div class="weapons-grid">
                        ${renderWeapons(data)}
                    </div>
                </div>
            </div>

            <div class="${paneClass("spells")}" id="tab-spells" role="tabpanel" aria-labelledby="btn-tab-spells">
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
                    <div class="spell-header-actions">
                        ${limits.maxPrepared > 0 ? `
                            <div class="spell-pool-badge ${limits.isPreparedOverLimit ? 'over-limit' : ''}" title="Prepared Spells (Levels 1+): ${limits.currentPrepared} prepared / ${limits.maxPrepared} allowed across all spell levels${limits.byClass.length > 1 ? `. Each class prepares its own spells: ${describePreparedByClass(limits)}` : ''}">
                                <i class="fa-solid fa-book-bookmark" aria-hidden="true"></i> Prepared: <strong>${limits.currentPrepared}/${limits.maxPrepared}</strong>
                                ${limits.byClass.length > 1 ? `<span class="spell-pool-by-class">(${describePreparedByClass(limits)})</span>` : ''}
                            </div>
                        ` : ''}
                        <button class="manage-spells-btn" id="open-manage-spells-btn" title="Search database spells and manage character spell list by level">
                            <i class="fa-solid fa-book-bookmark"></i> Manage Spells
                        </button>
                        <button class="add-custom-spell-btn" id="open-custom-spell-btn" title="Add a custom spell to this character and database">
                            <i class="fa-solid fa-plus"></i> Add Custom Spell
                        </button>
                    </div>
                </div>

                <div class="spells-click-prompt">
                    <i class="fa-solid fa-circle-info"></i> <em>Click any spell below to view its full description (prefers Character Pull definition &rarr; Database &rarr; D&amp;D Beyond &rarr; Open5e).</em>
                </div>

                ${renderSpeciesSpellcasting(data)}
                <div id="spells-grid">
                    ${renderSpellsByLevel(data.spells, data.spellSlots, data)}
                </div>
                <div id="no-spells-found" class="no-results" style="display: none;">
                    <i class="fa-solid fa-ghost"></i>
                    <p>No spells matched your search filter.</p>
                </div>
            </div>

            <div class="${paneClass("actions")}" id="tab-actions" role="tabpanel" aria-labelledby="btn-tab-actions">
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

            <div class="${paneClass("features")}" id="tab-features" role="tabpanel" aria-labelledby="btn-tab-features">
                <div class="features-container">
                    <div class="features-grid">
                        ${renderFeatures(data)}
                    </div>
                </div>
            </div>

            <div class="${paneClass("skills")}" id="tab-skills" role="tabpanel" aria-labelledby="btn-tab-skills">
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
                                    <li><strong>Darkvision:</strong> ${data.vitals.darkvision}</li>
                                    ${data.vitals.devilsSight && data.vitals.devilsSight !== 'None' ? `<li><strong>Devil's Sight:</strong> ${data.vitals.devilsSight}</li>` : ''}
                                    <li><strong>Blindsight:</strong> ${data.vitals.blindsight || '—'}</li>
                                    <li><strong>Tremorsense:</strong> ${data.vitals.tremorsense || '—'}</li>
                                    <li><strong>Truesight:</strong> ${data.vitals.truesight || '—'}</li>
                                </ul>
                            </div>
                            <div class="sense-card">
                                <h4>Training & Languages</h4>
                                <p><strong>Armor:</strong> ${data.proficiencies?.armor?.length ? data.proficiencies.armor.join(', ') : 'None'}</p>
                                <p><strong>Weapons:</strong> ${data.proficiencies?.weapons?.length ? data.proficiencies.weapons.join(', ') : 'None'}</p>
                                <p><strong>Tools & Instruments:</strong> ${data.proficiencies?.tools?.length ? data.proficiencies.tools.join(', ') : 'None'}</p>
                                <p><strong>Languages:</strong> ${data.proficiencies?.languages?.length ? data.proficiencies.languages.join(', ') : 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="${paneClass("equipment")}" id="tab-equipment" role="tabpanel" aria-labelledby="btn-tab-equipment">
                <div class="equipment-container">
                    <div class="equipment-header-banner">
                        <div class="equipment-header-info">
                            <p class="tab-lead-note">Equipment, inventory items, and magical gear. Click any magic item or equipment to view full tiered details.</p>
                        </div>
                        <div class="equipment-header-actions">
                            <button class="manage-equipment-btn" id="open-manage-equipment-btn" title="Search database items and manage equipment inventory">
                                <i class="fa-solid fa-shield"></i> Manage Weapons/Items
                            </button>
                            <button type="button" class="add-custom-item-btn" id="open-custom-magic-item-btn" aria-haspopup="dialog" title="Add a custom magic item to this character and the database">
                                <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Custom Magic Item
                            </button>
                        </div>
                    </div>
                    <div class="equipment-grid">
                        ${renderEquipment(data)}
                    </div>
                </div>
            </div>

            <div class="${paneClass("details")}" id="tab-details" role="tabpanel" aria-labelledby="btn-tab-details">
                ${renderDetailsAndNotes(data)}
            </div>
        </section>
    `;
}
