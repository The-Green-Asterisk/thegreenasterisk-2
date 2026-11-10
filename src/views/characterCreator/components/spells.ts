import { SPELLS_2024 } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";
import { getProgressionGrantedSpellNames, getSpellFeat, getSpellFeatAbility } from "../services/spellReconciliation";

const ABILITY_LABELS: Record<string, string> = {
    str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma"
};

/** A select for the spellcasting ability of the origin feat's spells, when the feat lets the player choose. */
function renderFeatSpellAbility(ctx: CharacterCreatorContext): string {
    const feat = getSpellFeat(ctx);
    const options = feat?.spellcastingAbilityOptions || [];
    if (!feat || options.length < 2) return "";
    const current = getSpellFeatAbility(ctx);
    return `
            <div class="creator-detail-box">
                <div class="creator-form-group">
                    <label class="creator-label" for="feat-spell-ability-select">${feat.name} Spellcasting Ability</label>
                    <select id="feat-spell-ability-select" class="creator-select">
                        ${options.map((ab) => `<option value="${ab}" ${ab === current ? "selected" : ""}>${ABILITY_LABELS[ab] || ab.toUpperCase()}</option>`).join("")}
                    </select>
                </div>
            </div>`;
}

export function renderStep8Spells(ctx: CharacterCreatorContext): string {
    ctx.sanitizeSpellSelections();
    const grantedNames = getProgressionGrantedSpellNames(ctx);
    const grantedPill = `<span class="stat-req-pill met" title="Granted by class/subclass progression — does not count against your allotment"><i class="fa-solid fa-gift" aria-hidden="true"></i> Granted</span>`;

    const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
    const maxCantrips = ctx.getMaxCantrips();
    const maxPrepared = ctx.getMaxPreparedSpells();
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

    const slotsSummary = ctx.getSpellSlotsSummary();
    const buckets = ctx.getSpellBuckets();
    const isMulticlass = buckets.filter((b) => b.kind === "class").length > 1;
    const showBucketTabs = buckets.length > 1;
    const bucket = buckets.find((b) => b.key === ctx.activeSpellClassFilter) || buckets[0];
    const selection = bucket ? (ctx.state.classSpellSelections?.[bucket.key] || { cantrips: [], prepared: [] }) : { cantrips: [], prepared: [] };
    const bucketMaxCantrips = bucket?.maxCantrips || 0;
    const bucketMaxPrepared = bucket?.maxPrepared || 0;
    const bucketMaxSpellLevel = bucket?.maxSpellLevel || 0;

    const cantripsChosen = selection.cantrips.length;
    const spellsChosen = selection.prepared.length;
    const isCantripsOver = bucketMaxCantrips > 0 && cantripsChosen > bucketMaxCantrips;
    const isSpellsOver = bucketMaxPrepared > 0 && spellsChosen > bucketMaxPrepared;

    const otherBucketOf = (name: string, field: "cantrips" | "prepared"): string[] => buckets
        .filter((b) => b.key !== bucket?.key && (ctx.state.classSpellSelections?.[b.key]?.[field] || []).includes(name))
        .map((b) => b.label);

    const displayedCantrips = bucket?.cantripPool || [];
    const leveledByClass = bucket?.preparedPool || [];
    const displayedLeveled = ctx.activeSpellLevelFilter === "all"
        ? leveledByClass
        : leveledByClass.filter((s) => s.level === ctx.activeSpellLevelFilter);

    const viaPill = (name: string): string => {
        const feature = bucket?.via[name];
        return feature
            ? `<span class="stat-req-pill met" title="Not on the ${bucket?.baseList} spell list; available through ${feature}"><i class="fa-solid fa-key" aria-hidden="true"></i> ${feature}</span>`
            : "";
    };

    const countBadge = (chosen: number, max: number, over: boolean, unit: string, icon: string) => `
        <span class="spell-count-badge ${over ? "over-limit" : chosen === max ? "maxed" : "info"}">
            <i class="fa-solid ${over ? "fa-triangle-exclamation" : chosen === max ? "fa-check" : icon}" aria-hidden="true"></i>
            ${chosen} / ${max} ${unit}
        </span>
    `;

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <div class="spells-header-row">
                    <div>
                        <h3 class="panel-title">${isMulticlass ? `Spells & Magic (${casterStats.map((c: any) => `${c.className} ${c.level}`).join(" / ")})` : `Spells (${casterStats[0]?.className || bucket?.label || cls?.name || "Class"})`}</h3>
                        <p class="panel-desc">${isMulticlass ? "Multiclass spellcasting: each class prepares its own spells from its own list, using its own class level for how many spells and how high a level it can prepare. Spell slots are shared." : `Select cantrips, prepared spells, and class or subclass progression spells according to your limits at Level ${ctx.state.level}.`}</p>
                    </div>
                    <div class="spells-actions-row">
                        <button type="button" class="creator-nav-btn secondary-btn auto-spells-btn">
                            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Auto-Fill
                        </button>
                        <button type="button" class="creator-nav-btn secondary-btn clear-spells-btn">
                            <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset
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

            ${renderFeatSpellAbility(ctx)}

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

            ${showBucketTabs ? `
                <div class="spell-class-tabs" role="group" aria-label="Choose which class's spells to prepare" style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                    ${buckets.map((b) => {
        const sel = ctx.state.classSpellSelections?.[b.key] || { cantrips: [], prepared: [] };
        const over = (b.maxCantrips > 0 && sel.cantrips.length > b.maxCantrips) || (b.maxPrepared > 0 && sel.prepared.length > b.maxPrepared);
        const counts = [
            b.maxCantrips > 0 ? `${sel.cantrips.length}/${b.maxCantrips} cantrips` : "",
            b.maxPrepared > 0 ? `${sel.prepared.length}/${b.maxPrepared} prepared` : ""
        ].filter(Boolean).join(" • ");
        return `
                            <button type="button" class="creator-nav-btn secondary-btn spell-class-tab-btn ${b.key === bucket?.key ? "active" : ""} ${over ? "over-limit" : ""}" data-class="${b.key}" aria-pressed="${b.key === bucket?.key}" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">
                                ${over ? '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>' : ""}
                                ${b.label}${b.kind === "class" ? ` ${b.level}` : ""} (${counts}${over ? ", over limit" : ""})
                            </button>
                        `;
    }).join("")}
                </div>
            ` : ""}

            <div class="creator-detail-box">
                <div class="box-header-with-badge">
                    <h4>${showBucketTabs ? `${bucket?.label} ` : ""}Cantrips (Level 0)</h4>
                    ${bucketMaxCantrips > 0
        ? countBadge(cantripsChosen, bucketMaxCantrips, isCantripsOver, "Chosen", "fa-sparkles")
        : `<span class="spell-count-badge zero"><i class="fa-solid fa-ban" aria-hidden="true"></i> 0 Cantrips</span>`}
                </div>

                ${bucketMaxCantrips === 0 ? `
                    <p class="creator-empty-notice">
                        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                        ${showBucketTabs ? `${bucket?.label} does not grant cantrips at this level.` : "Your class features do not grant cantrips at current level."}
                    </p>
                ` : `
                    <div class="item-select-list" role="group" aria-label="${bucket?.label} cantrips">
                        ${displayedCantrips.map((sp) => {
        const isGranted = grantedNames.has(sp.name.toLowerCase());
        const isSelected = isGranted || selection.cantrips.includes(sp.name);
        const elsewhere = otherBucketOf(sp.name, "cantrips");
        return `
                                <div class="item-check-row cantrip-row ${isSelected ? "selected" : ""} ${isGranted ? "progression-granted" : ""}"
                                     role="checkbox" tabindex="0" aria-checked="${isSelected}"
                                     data-spell-name="${sp.name}"${isGranted ? ' data-granted="true" aria-disabled="true"' : ""}>
                                    <div class="item-row-left">
                                        <div class="item-row-title">
                                            <span>${sp.name} (${sp.school})</span>
                                            ${isGranted ? grantedPill : ""}
                                            ${viaPill(sp.name)}
                                            ${elsewhere.map((c) => `<span class="stat-req-pill">Also known as ${c}</span>`).join(" ")}
                                        </div>
                                        <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                        <div class="item-row-desc">${sp.description}</div>
                                    </div>
                                    <span class="card-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
    }).join("")}
                    </div>
                `}
            </div>

            <div class="creator-detail-box" style="margin-top: 1rem;">
                <div class="box-header-with-badge">
                    <h4>${showBucketTabs ? `${bucket?.label} ` : ""}Prepared Spells ${bucketMaxSpellLevel > 1 ? `(Levels 1–${bucketMaxSpellLevel})` : "(Level 1)"}</h4>
                    ${bucketMaxPrepared > 0
        ? countBadge(spellsChosen, bucketMaxPrepared, isSpellsOver, "Prepared", "fa-book")
        : `<span class="spell-count-badge zero"><i class="fa-solid fa-ban" aria-hidden="true"></i> 0 Spells</span>`}
                </div>

                ${bucketMaxPrepared === 0 ? `
                    <p class="creator-empty-notice">
                        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                        ${showBucketTabs ? `${bucket?.label} does not prepare spells at this level.` : "Your class features do not prepare spells at current level."}
                    </p>
                ` : `
                    <div class="spells-filter-bar">
                        <div class="spell-search-box">
                            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                            <input type="text" id="spell-search-input" class="creator-input" aria-label="Search spells" placeholder="Search spells by name or school..." value="${ctx.spellSearchQuery}" />
                        </div>
                        ${bucketMaxSpellLevel > 1 ? `
                            <div class="spell-level-tabs" role="group" aria-label="Filter by spell level">
                                <button type="button" class="spell-tab-btn ${ctx.activeSpellLevelFilter === "all" ? "active" : ""}" data-level="all" aria-pressed="${ctx.activeSpellLevelFilter === "all"}">
                                    All Levels (${leveledByClass.length})
                                </button>
                                ${Array.from({ length: bucketMaxSpellLevel }, (_, i) => i + 1).map((lvl) => {
        const count = leveledByClass.filter((s) => s.level === lvl).length;
        if (count === 0) return "";
        const prepCount = selection.prepared.filter((name) => {
            const s = (ctx.getSpell ? ctx.getSpell(name) : undefined) || SPELLS_2024.find((sp) => sp.name === name);
            return s?.level === lvl;
        }).length;
        return `
                                        <button type="button" class="spell-tab-btn ${ctx.activeSpellLevelFilter === lvl ? "active" : ""}" data-level="${lvl}" aria-pressed="${ctx.activeSpellLevelFilter === lvl}">
                                            Lvl ${lvl} (${prepCount > 0 ? `${prepCount}/` : ""}${count})
                                        </button>
                                    `;
    }).join("")}
                            </div>
                        ` : ""}
                    </div>

                    <div class="item-select-list" role="group" aria-label="${bucket?.label} prepared spells">
                        ${displayedLeveled.map((sp) => {
        const isGranted = grantedNames.has(sp.name.toLowerCase());
        const isSelected = isGranted || selection.prepared.includes(sp.name);
        const elsewhere = otherBucketOf(sp.name, "prepared");
        return `
                                <div class="item-check-row spell1-row ${isSelected ? "selected" : ""} ${isGranted ? "progression-granted" : ""}"
                                     role="checkbox" tabindex="0" aria-checked="${isSelected}"
                                     data-spell-name="${sp.name}"
                                     data-spell-school="${sp.school}"
                                     data-spell-level="${sp.level}"${isGranted ? ' data-granted="true" aria-disabled="true"' : ""}>
                                    <div class="item-row-left">
                                        <div class="item-row-title">
                                            <span>${sp.name}</span>
                                            ${isGranted ? grantedPill : ""}
                                            <span class="stat-req-pill met">Lvl ${sp.level}</span>
                                            <span class="stat-req-pill">${sp.school}</span>
                                            ${viaPill(sp.name)}
                                            ${elsewhere.map((c) => `<span class="stat-req-pill">Also prepared as ${c}</span>`).join(" ")}
                                            ${sp.ritual ? '<span class="stat-req-pill met"><i class="fa-solid fa-scroll" aria-hidden="true"></i> Ritual</span>' : ""}
                                            ${sp.concentration ? '<span class="stat-req-pill unmet"><i class="fa-solid fa-brain" aria-hidden="true"></i> Conc.</span>' : ""}
                                        </div>
                                        <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                        <div class="item-row-desc">${sp.description}</div>
                                    </div>
                                    <span class="card-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
    }).join("")}
                    </div>
                `}
            </div>
        </div>
    `;
}
