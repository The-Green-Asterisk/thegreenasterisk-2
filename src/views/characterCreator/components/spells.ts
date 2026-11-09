import { SPELLS_2024 } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";
import { getProgressionGrantedSpellNames } from "../services/spellReconciliation";

export function renderStep8Spells(ctx: CharacterCreatorContext): string {
    ctx.sanitizeSpellSelections();
    const grantedNames = getProgressionGrantedSpellNames(ctx);
    const grantedPill = `<span class="stat-req-pill met" title="Granted by class/subclass progression — does not count against your allotment"><i class="fa-solid fa-gift"></i> Granted</span>`;

    const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
    const maxCantrips = ctx.getMaxCantrips();
    const maxPrepared = ctx.getMaxPreparedSpells();
    const maxSpellLevel = ctx.getMaxSpellLevel();
    const featureSpellSections = ctx.getFeatureSpellChoiceSections();
    const hasSpellcasting = maxCantrips > 0 || maxPrepared > 0 || featureSpellSections.length > 0;
    const casterStats = ctx.getSpellcasterStatsList();

    if (!hasSpellcasting) {
        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Spells & Magic (${cls?.name || "Class"})</h3>
                    <p class="panel-desc">Your class does not have spellcasting features at Level ${ctx.state.level}.</p>
                </div>
                <div class="equipment-stat-alert warning">
                    <i class="fa-solid fa-circle-info"></i>
                    <div>
                        <strong>No Spellcasting:</strong> As a Level ${ctx.state.level} ${cls?.name || "character"}, your character does not learn cantrips or prepare spell slots.
                        <div style="margin-top: 0.35rem; font-size: 0.8rem; color: var(--text-muted);">
                            You may proceed to Step 9 (Review), or choose an Origin Feat like <em>Magic Initiate</em> in Step 4 to gain bonus spells.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    const available = ctx.getAvailableSpells();
    const slotsSummary = ctx.getSpellSlotsSummary();

    const cantripsChosen = ctx.state.selectedCantrips.length;
    const spellsChosen = ctx.state.selectedSpellsLevel1.length;
    const isCantripsOver = maxCantrips > 0 && cantripsChosen > maxCantrips;
    const isSpellsOver = maxPrepared > 0 && spellsChosen > maxPrepared;
    const isMulticlass = casterStats.length > 1;

    const displayedCantrips = ctx.activeSpellClassFilter === "all"
        ? available.cantrips
        : available.cantrips.filter((s) => s.classes.includes(ctx.activeSpellClassFilter));

    const leveledByClass = ctx.activeSpellClassFilter === "all"
        ? available.leveledSpells
        : available.leveledSpells.filter((s) => s.classes.includes(ctx.activeSpellClassFilter));

    const displayedLeveled = ctx.activeSpellLevelFilter === "all"
        ? leveledByClass
        : leveledByClass.filter((s) => s.level === ctx.activeSpellLevelFilter);

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <div class="spells-header-row">
                    <div>
                        <h3 class="panel-title">${isMulticlass ? `Spells & Magic (${casterStats.map((c: any) => `${c.className} ${c.level}`).join(" / ")})` : `Spells (${casterStats[0]?.className || cls?.name || "Class"})`}</h3>
                        <p class="panel-desc">${isMulticlass ? "Multiclass spellcasting: prepare spells individually per class at your class levels, sharing your multiclass spell slots." : `Select cantrips, prepared spells, and class or subclass progression spells according to your limits at Level ${ctx.state.level}.`}</p>
                    </div>
                    <div class="spells-actions-row">
                        <button type="button" class="creator-nav-btn secondary-btn auto-spells-btn">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Fill
                        </button>
                        <button type="button" class="creator-nav-btn secondary-btn clear-spells-btn">
                            <i class="fa-solid fa-rotate-left"></i> Reset
                        </button>
                    </div>
                </div>
            </div>

            <div class="spellcaster-stats-banner">
                ${casterStats.map((c: any) => `
                    <div class="stat-badge">
                        <span class="label">${isMulticlass ? `${c.className} (Lvl ${c.level})` : "Spell Ability"}</span>
                        <strong>${c.ability.toUpperCase()} (${c.abilityMod >= 0 ? "+" : ""}${c.abilityMod}) • DC ${c.saveDc} • Atk ${c.attackMod >= 0 ? `+${c.attackMod}` : c.attackMod}</strong>
                    </div>
                `).join("")}
                <div class="stat-badge">
                    <span class="label">${isMulticlass ? "Multiclass Slots" : "Spell Slots"}</span>
                    <strong>${slotsSummary}</strong>
                </div>
            </div>

            ${featureSpellSections.length > 0 ? `
                <div id="feature-spell-choices-section" class="feature-spell-choices-container" style="margin-bottom: 1.25rem;">
                    <div class="panel-header" style="margin-bottom: 0.75rem;">
                        <h4 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fa-solid fa-book-sparkles"></i> Class & Subclass Progression Spells
                        </h4>
                        <p class="panel-desc" style="margin-top: 0.25rem;">
                            Spells granted by your selected class or subclass progression choices (such as Pact of the Tome, Divine Order, or Magical Secrets). These count as bonus spells and do not consume your standard class cantrip or prepared spell limits.
                        </p>
                    </div>
                    ${featureSpellSections.map((sec) => {
                        const chosen = ctx.state.featureSpellChoices[sec.id] || [];
                        const isOver = chosen.length > sec.chooseCount;
                        const isMaxed = chosen.length === sec.chooseCount;
                        return `
                            <div class="creator-detail-box feature-spell-choice-box" data-feature-section-id="${sec.id}" style="margin-bottom: 1rem;">
                                <div class="box-header-with-badge">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                        <h4 style="margin: 0;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${sec.title}</h4>
                                        <span class="stat-req-pill met">${sec.sourceLabel}</span>
                                    </div>
                                    <span class="spell-count-badge ${isOver ? "over-limit" : isMaxed ? "maxed" : "info"}">
                                        <i class="fa-solid ${isOver ? "fa-triangle-exclamation" : isMaxed ? "fa-check" : "fa-sparkles"}"></i>
                                        ${chosen.length} / ${sec.chooseCount} Chosen
                                    </span>
                                </div>
                                <p class="panel-desc" style="margin: 0.35rem 0 0.75rem;">${sec.description}</p>
                                <div class="item-select-list">
                                    ${sec.availableSpells.map((sp) => {
                                        const isSelected = chosen.includes(sp.name);
                                        return `
                                            <div class="item-check-row feature-spell-row ${isSelected ? "selected" : ""}"
                                                 data-feature-section-id="${sec.id}"
                                                 data-spell-name="${sp.name}"
                                                 data-spell-school="${sp.school}"
                                                 data-spell-level="${sp.level}">
                                                <div class="item-row-left">
                                                    <div class="item-row-title">
                                                        <span>${sp.name}</span>
                                                        <span class="stat-req-pill met">${sp.level === 0 ? "Cantrip" : `Lvl ${sp.level}`}</span>
                                                        <span class="stat-req-pill">${sp.school}</span>
                                                        ${sp.classes.map((c) => `<span class="stat-req-pill">${c}</span>`).join(" ")}
                                                        ${sp.ritual ? '<span class="stat-req-pill met"><i class="fa-solid fa-scroll"></i> Ritual</span>' : ""}
                                                        ${sp.concentration ? '<span class="stat-req-pill unmet"><i class="fa-solid fa-brain"></i> Conc.</span>' : ""}
                                                    </div>
                                                    <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                                    <div class="item-row-desc">${sp.description}</div>
                                                </div>
                                                <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                            </div>
                                        `;
                                    }).join("")}
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            ` : ""}

            <div class="creator-detail-box">
                <div class="box-header-with-badge">
                    <h4>Cantrips (Level 0)</h4>
                    ${maxCantrips > 0 ? `
                        <span class="spell-count-badge ${isCantripsOver ? "over-limit" : cantripsChosen === maxCantrips ? "maxed" : "info"}">
                            <i class="fa-solid ${isCantripsOver ? "fa-triangle-exclamation" : cantripsChosen === maxCantrips ? "fa-check" : "fa-sparkles"}"></i>
                            ${cantripsChosen} / ${maxCantrips} Chosen
                        </span>
                    ` : `
                        <span class="spell-count-badge zero">
                            <i class="fa-solid fa-ban"></i> 0 Cantrips
                        </span>
                    `}
                </div>

                ${maxCantrips === 0 ? `
                    <p class="creator-empty-notice">
                        <i class="fa-solid fa-circle-info"></i>
                        Your class features do not grant cantrips at current level.
                    </p>
                ` : `
                    <div class="item-select-list">
                        ${displayedCantrips.map((sp) => {
                            const isGranted = grantedNames.has(sp.name.toLowerCase());
                            const isSelected = isGranted || ctx.state.selectedCantrips.includes(sp.name);
                            const sourceBadges = sp.classes.filter((c) => casterStats.some((cs: any) => cs.className === c));
                            return `
                                <div class="item-check-row cantrip-row ${isSelected ? "selected" : ""} ${isGranted ? "progression-granted" : ""}" 
                                     data-spell-name="${sp.name}"${isGranted ? ' data-granted="true" aria-disabled="true"' : ""}>
                                    <div class="item-row-left">
                                        <div class="item-row-title">
                                            <span>${sp.name} (${sp.school})</span>
                                            ${isGranted ? grantedPill : ""}
                                            ${isMulticlass && sourceBadges.length > 0 ? sourceBadges.map((c) => `<span class="stat-req-pill met">${c}</span>`).join(" ") : ""}
                                        </div>
                                        <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                        <div class="item-row-desc">${sp.description}</div>
                                    </div>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                `}
            </div>

            <div class="creator-detail-box" style="margin-top: 1rem;">
                <div class="box-header-with-badge">
                    <h4>Prepared Spells ${maxSpellLevel > 1 ? `(Levels 1–${maxSpellLevel})` : "(Level 1)"}</h4>
                    ${maxPrepared > 0 ? `
                        <span class="spell-count-badge ${isSpellsOver ? "over-limit" : spellsChosen === maxPrepared ? "maxed" : "info"}">
                            <i class="fa-solid ${isSpellsOver ? "fa-triangle-exclamation" : spellsChosen === maxPrepared ? "fa-check" : "fa-book"}"></i>
                            ${spellsChosen} / ${maxPrepared} Prepared
                        </span>
                    ` : `
                        <span class="spell-count-badge zero">
                            <i class="fa-solid fa-ban"></i> 0 Spells
                        </span>
                    `}
                </div>

                ${maxPrepared === 0 ? `
                    <p class="creator-empty-notice">
                        <i class="fa-solid fa-circle-info"></i>
                        Your class features do not prepare spells at current level.
                    </p>
                ` : `
                    <div class="spells-filter-bar">
                        <div class="spell-search-box">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="spell-search-input" class="creator-input" placeholder="Search spells by name or school..." value="${ctx.spellSearchQuery}" />
                        </div>
                        ${isMulticlass ? `
                            <div class="spell-class-tabs" style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                                <button type="button" class="creator-nav-btn secondary-btn spell-class-tab-btn ${ctx.activeSpellClassFilter === "all" ? "active" : ""}" data-class="all" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
                                    All Classes (${available.leveledSpells.length})
                                </button>
                                ${casterStats.map((cs: any) => {
                                    const classCount = available.leveledSpells.filter((s) => s.classes.includes(cs.className)).length;
                                    return `
                                        <button type="button" class="creator-nav-btn secondary-btn spell-class-tab-btn ${ctx.activeSpellClassFilter === cs.className ? "active" : ""}" data-class="${cs.className}" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
                                            ${cs.className} (Lvl ${cs.level} • Max Lvl ${cs.maxSpellLevel}) [${classCount}]
                                        </button>
                                    `;
                                }).join("")}
                            </div>
                        ` : ""}
                        ${maxSpellLevel > 1 ? `
                            <div class="spell-level-tabs">
                                <button type="button" class="spell-tab-btn ${ctx.activeSpellLevelFilter === "all" ? "active" : ""}" data-level="all">
                                    All Levels (${leveledByClass.length})
                                </button>
                                ${Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map((lvl) => {
                                    const count = leveledByClass.filter((s) => s.level === lvl).length;
                                    if (count === 0) return "";
                                    const prepCount = ctx.state.selectedSpellsLevel1.filter((name) => {
                                        const s = SPELLS_2024.find((sp) => sp.name === name);
                                        return s?.level === lvl;
                                    }).length;
                                    return `
                                        <button type="button" class="spell-tab-btn ${ctx.activeSpellLevelFilter === lvl ? "active" : ""}" data-level="${lvl}">
                                            Lvl ${lvl} (${prepCount > 0 ? `${prepCount}/` : ""}${count})
                                        </button>
                                    `;
                                }).join("")}
                            </div>
                        ` : ""}
                    </div>

                    <div class="item-select-list">
                        ${displayedLeveled.map((sp) => {
                            const isGranted = grantedNames.has(sp.name.toLowerCase());
                            const isSelected = isGranted || ctx.state.selectedSpellsLevel1.includes(sp.name);
                            const sourceBadges = sp.classes.filter((c) => casterStats.some((cs: any) => cs.className === c));
                            return `
                                <div class="item-check-row spell1-row ${isSelected ? "selected" : ""} ${isGranted ? "progression-granted" : ""}" 
                                     data-spell-name="${sp.name}"
                                     data-spell-school="${sp.school}"
                                     data-spell-level="${sp.level}"${isGranted ? ' data-granted="true" aria-disabled="true"' : ""}>
                                    <div class="item-row-left">
                                        <div class="item-row-title">
                                            <span>${sp.name}</span>
                                            ${isGranted ? grantedPill : ""}
                                            <span class="stat-req-pill met">Lvl ${sp.level}</span>
                                            <span class="stat-req-pill">${sp.school}</span>
                                            ${isMulticlass && sourceBadges.length > 0 ? sourceBadges.map((c) => `<span class="stat-req-pill met">${c}</span>`).join(" ") : ""}
                                            ${sp.ritual ? '<span class="stat-req-pill met"><i class="fa-solid fa-scroll"></i> Ritual</span>' : ""}
                                            ${sp.concentration ? '<span class="stat-req-pill unmet"><i class="fa-solid fa-brain"></i> Conc.</span>' : ""}
                                        </div>
                                        <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                        <div class="item-row-desc">${sp.description}</div>
                                    </div>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                `}
            </div>
        </div>
    `;
}
