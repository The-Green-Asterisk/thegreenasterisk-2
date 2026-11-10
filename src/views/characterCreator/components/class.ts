import {
    SpellPick,
    ProgressionLevel,
    BASE_WEAPONS_2024,
    CLASSES_2024,
    ClassDefinition,
    ClassLevelFeature
} from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";
import { ProgressionChoiceEntry, ProgressionPool, optionAvailableAt, progressionChoicesForClass, progressionPoolsForClass } from "../services/progressionModifiers";

export function renderStep3Class(ctx: CharacterCreatorContext): string {
    ctx.syncStateClassProperties();

    const classSectionsHtml = ctx.state.classes.map((classChoice, classIdx) => {
        const cls = ctx.classes.find((c) => c.id === classChoice.classId) || ctx.classes[0];
        const isPrimary = classIdx === 0;

        return `
                <div class="multiclass-section" id="class-section-${classIdx}" data-class-index="${classIdx}">
                    <div class="panel-header multiclass-section-header">
                        <div class="multiclass-title-row">
                            <h3 class="panel-title">
                                ${isPrimary ? `Primary Class: ${cls.name}` : `Multiclass ${classIdx + 1}: ${cls.name}`}
                                <span class="multiclass-lvl-pill">Level ${classChoice.level}</span>
                            </h3>
                            ${!isPrimary ? `
                                <button type="button" class="creator-btn danger-btn remove-class-btn" data-class-index="${classIdx}" title="Remove this class">
                                    <i class="fa-solid fa-trash-can"></i> Remove Class
                                </button>
                            ` : `
                                <button type="button" class="creator-btn secondary-btn scroll-to-bottom-btn" id="primary-class-scroll-bottom-btn" title="Scroll all the way to the bottom">
                                    <i class="fa-solid fa-arrow-down"></i> Scroll to Bottom
                                </button>
                            `}
                        </div>
                        <p class="panel-desc">
                            ${isPrimary
                ? "Select your character's primary class. Primary classes grant starting Hit Dice, saving throws, weapon masteries, proficiencies, and starting features."
                : `Select your additional class. Progression and abilities for ${cls.name} are tracked below.`}
                        </p>
                    </div>

                    <div class="card-select-grid" role="radiogroup" aria-label="${isPrimary ? "Primary class" : `Class ${classIdx + 1}`}">
                        ${ctx.classes.map((c) => {
                    const isSelected = classChoice.classId === c.id;
                    let isDisabled = false;
                    let badgeHtml = "";
                    let reasonTitle = "";

                    if (!isPrimary) {
                        const check = ctx.canMulticlassInto(c.id, classIdx);
                        if (!check.allowed) {
                            isDisabled = true;
                            reasonTitle = check.reason || "Prerequisites not met";
                            badgeHtml = `<div class="class-prereq-badge locked" title="${reasonTitle}"><i class="fa-solid fa-lock"></i> ${check.reason}</div>`;
                        } else {
                            badgeHtml = `<div class="class-prereq-badge met"><i class="fa-solid fa-circle-check"></i> Prereq Met: ${check.prereqLabel}</div>`;
                        }
                    } else {
                        const prereq = c.multiclassing?.prerequisites;
                        if (prereq) {
                            badgeHtml = `<div class="class-prereq-badge info"><i class="fa-solid fa-circle-info"></i> Multiclass: ${prereq.label}</div>`;
                        }
                    }

                    return `
                                <div class="select-card class-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}" 
                                     data-class-index="${classIdx}" 
                                     data-class-id="${c.id}"
                                     role="radio" aria-checked="${isSelected}" tabindex="${isDisabled ? "-1" : "0"}" data-kbd-activate
                                     ${isDisabled ? `aria-disabled="true" title="${reasonTitle}"` : ""}>
                                    <div class="card-title-row">
                                        <h4 class="card-title">${c.name}</h4>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <span class="card-tag">Hit Die: d${c.hitDie} • Saves: ${c.savingThrows.map((s) => s.toUpperCase()).join(", ")}</span>
                                    <p class="card-body">${c.description}</p>
                                    ${badgeHtml}
                                </div>
                            `;
                }).join("")}
                    </div>

                    ${!isPrimary && !ctx.canMulticlassInto(classChoice.classId, classIdx).allowed ? `
                        <div class="equipment-stat-alert danger" style="margin-top: 1rem;">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <div>
                                <strong>Multiclass Prerequisite Not Met:</strong>
                                ${ctx.canMulticlassInto(classChoice.classId, classIdx).reason}. Increase ability score or choose an eligible class.
                            </div>
                        </div>
                    ` : ""}

                    ${renderClassProgression(ctx, cls, classChoice.level, classIdx, classChoice.subclassId)}
                </div>
            `;
    }).join("");

    const nextIdx = ctx.state.classes.length;
    const canAddAnyClass = ctx.classes.some((c) => ctx.canMulticlassInto(c.id, nextIdx).allowed);

    return `
            <div class="step-panel active multiclass-step-panel">
                <!-- Sticky Top Bar for scrolling up to earlier classes -->
                <div class="multiclass-top-bar hidden" id="multiclass-top-bar">
                    <span class="multiclass-bar-label"><i class="fa-solid fa-arrow-up"></i> Jump to:</span>
                    <div class="multiclass-nav-buttons" id="multiclass-top-nav-buttons"></div>
                    <button type="button" class="creator-btn nav-to-class-btn top-nav-btn scroll-to-bottom-btn" id="top-bar-scroll-bottom-btn" title="Scroll all the way to the bottom">
                        <i class="fa-solid fa-arrow-down"></i> Bottom
                    </button>
                </div>

                ${classSectionsHtml}

                <!-- Sticky Bottom Bar for adding class and scrolling down to later classes -->
                <div class="multiclass-bottom-bar" id="multiclass-bottom-bar">
                    <button type="button" class="creator-btn primary-btn add-class-btn ${!canAddAnyClass ? "disabled" : ""}" id="add-class-btn" ${!canAddAnyClass ? "disabled title='Prerequisites not met to add another class'" : ""}>
                        <i class="fa-solid fa-plus"></i> Add Class
                    </button>
                    <div class="multiclass-bottom-nav" id="multiclass-bottom-nav"></div>
                </div>

                <!-- Floating Quick Scroll to Bottom Button -->
                <button type="button" class="floating-scroll-bottom-btn scroll-to-bottom-btn" id="floating-scroll-bottom-btn" title="Scroll all the way to the bottom" aria-label="Scroll all the way to the bottom">
                    <i class="fa-solid fa-arrow-down"></i>
                </button>
            </div>
        `;
}

/**
 * A level's summary from the class rules: resources as of that level ("Rage: 3", "Sneak Attack: 2d6"), the level's
 * badges ("Rage Damage +2"), Weapon Mastery count, speed bonuses from features, and spell slots.
 */
export function getClassLevelStatBadge(cls: ClassDefinition, lvl: number): string {
    const parts: string[] = [];
    const levels = (cls.progression || []).filter((pl) => pl.level <= lvl).sort((a, b) => a.level - b.level);
    const resources = new Map<string, { total: number | string; die?: string }>();
    for (const pl of levels) {
        for (const r of pl.resourceUpdates || []) resources.set(r.name, { total: r.total, die: r.die });
    }
    const resourceText = Array.from(resources.entries()).map(([name, r]) => {
        const total = typeof r.total === "string" && r.total.includes("{{") ? "" : String(r.total);
        return `${name}: ${[total, total ? (r.die ? `(${r.die})` : "") : r.die].filter(Boolean).join(" ")}`;
    });
    const atLevel = (cls.progression || []).find((pl) => pl.level === lvl);
    const masteries = cls.scalingTraits?.weaponMasteriesByLevel?.[lvl];
    const speed = levels.flatMap((pl) => pl.features || []).flatMap((f) => f.modifiers || [])
        .filter((m) => m.target === "vitals.speed" && m.type === "bonus")
        .reduce((sum, m) => sum + (Array.isArray(m.valueByLevel) ? (m.valueByLevel[Math.min(lvl, m.valueByLevel.length - 1)] || 0) : (Number(m.value) || 0)), 0);
    const summary = [
        ...resourceText,
        ...(atLevel?.badges || []),
        ...(masteries ? [`${masteries} Masteries`] : []),
        ...(speed ? [`Speed +${speed} ft`] : [])
    ];
    if (summary.length > 0) parts.push(summary.join(" • "));

    if (cls.spellcasting) {
        const slots = cls.spellcasting.spellSlotsByLevel[lvl - 1];
        if (cls.spellcasting.type === "pact") {
            const totalSlots = slots ? slots.find((s: number) => s > 0) || 0 : 0;
            const slotLvl = slots ? slots.findIndex((s: number) => s > 0) + 1 : 0;
            if (totalSlots > 0) {
                parts.push(`${totalSlots} × ${slotLvl}${getOrdinalSuffix(slotLvl)}-Level Slot${totalSlots > 1 ? "s" : ""}`);
            }
        } else if (slots) {
            const nonZero = slots
                .map((count: number, idx: number) => (count > 0 ? `${count} × ${idx + 1}${getOrdinalSuffix(idx + 1)}` : null))
                .filter(Boolean);
            if (nonZero.length > 0) {
                parts.push(`Slots: ${nonZero.join(", ")}`);
            }
        }
    }

    return parts.length > 0 ? parts.join(" | ") : "";
}

export function getOrdinalSuffix(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

export function getFeatureTagHtml(featureName: string, level: number, isSubclassFeature = false, isGrantedSpell = false): string {
    if (isGrantedSpell) {
        return `<span class="progression-feature-tag magic"><i class="fa-solid fa-wand-magic-sparkles"></i> Always Prepared</span>`;
    }
    const lower = featureName.toLowerCase();
    if (lower.includes("ability score improvement")) {
        return `<span class="progression-feature-tag asi"><i class="fa-solid fa-arrow-up-right-dots"></i> ASI / Feat</span>`;
    }
    if (isSubclassFeature || lower.includes("subclass")) {
        return `<span class="progression-feature-tag subclass"><i class="fa-solid fa-shield-halved"></i> Subclass</span>`;
    }
    if (lower.includes("epic boon")) {
        return `<span class="progression-feature-tag epic"><i class="fa-solid fa-crown"></i> Epic Boon</span>`;
    }
    if (level === 20 || lower.includes("capstone")) {
        return `<span class="progression-feature-tag capstone"><i class="fa-solid fa-star"></i> Capstone</span>`;
    }
    if (lower.includes("spell") || lower.includes("secrets") || lower.includes("arcanum")) {
        return `<span class="progression-feature-tag magic"><i class="fa-solid fa-wand-magic-sparkles"></i> Magic</span>`;
    }
    return "";
}

/** A pick list: checkbox cards limited by the class's scalingTraits table, kept in state[pool]. */
function renderPoolBox(ctx: CharacterCreatorContext, pool: ProgressionPool, description: string): string {
    const selected: string[] = Array.isArray((ctx.state as any)[pool.pool]) ? (ctx.state as any)[pool.pool] : [];
    const titleId = `pool-title-${pool.classIndex}-${pool.pool}`;
    const pickOptions = pool.options.filter((o) => (o.spellPicks || []).length > 0);
    return `
        <div class="level-choice-box" role="group" aria-labelledby="${titleId}">
            <h5 class="level-choice-title" id="${titleId}"><i class="fa-solid fa-list-check" aria-hidden="true"></i> ${pool.name}${pool.isSubclass ? ` (${pool.sourceName})` : ""} (Chosen: ${selected.length} of ${pool.max})</h5>
            ${description ? `<p class="card-body">${description}</p>` : ""}
            ${pickOptions.length > 0 ? `
                <div class="level-info-note choice-spells-referral-note">
                    <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Options that grant spell choices (such as <strong>${pickOptions.map((o) => o.name).join(", ")}</strong>) have a dedicated selection section in <strong>Class &amp; Subclass Progression Spells</strong> on <strong>Step 8: Spells</strong>.
                </div>
            ` : ""}
            <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                ${pool.options.filter((o) => optionAvailableAt(o, pool.classLevel)).map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    const minLevel = Number((opt as any).minLevel) || 0;
                    return `
                    <div class="select-card pool-card ${isSelected ? "selected" : ""}" role="checkbox" aria-checked="${isSelected}" tabindex="0"
                         data-pool="${pool.pool}" data-option-id="${opt.id}" data-class-index="${pool.classIndex}">
                        <div class="card-title-row">
                            <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                            <span class="card-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                        </div>
                        ${minLevel ? `<span class="card-tag">Min Level: ${minLevel}</span>` : ""}
                        <p class="card-body">${opt.description}</p>
                    </div>
                `;
                }).join("")}
            </div>
        </div>
    `;
}

/** "Pick these spells on Step 8" note for a feature or chosen option with spell picks. */
function spellPickNote(grantedBy: string, picks: SpellPick[]): string {
    if (picks.length === 0) return "";
    return `
        <div class="level-info-note choice-spells-referral-note">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Select your <strong>${grantedBy}</strong> spells in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
        </div>
    `;
}

/** One progression choice: radio cards for a single pick, checkboxes when the choice takes several. */
function renderProgressionChoiceBox(entry: ProgressionChoiceEntry, description: string): string {
    const count = entry.choice.chooseCount || 1;
    const multi = count > 1;
    const titleId = `choice-title-${entry.classIndex}-${entry.key}`;
    return `
        <div class="level-choice-box" role="${multi ? "group" : "radiogroup"}" aria-labelledby="${titleId}">
            <h5 class="level-choice-title" id="${titleId}"><i class="fa-solid fa-code-branch" aria-hidden="true"></i> ${entry.choice.name}${entry.isSubclass ? ` (${entry.sourceName})` : ""}${multi ? ` (Choose ${count})` : ""}</h5>
            ${description ? `<p class="card-body">${description}</p>` : ""}
            ${entry.selectedOptions.map((o) => spellPickNote(o.name, o.spellPicks || [])).join("")}
            <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                ${(entry.choice.options || []).map((opt) => {
                    const selected = entry.selectedIds.includes(opt.id);
                    return `
                    <div class="select-card subclass-feature-card progression-choice-card ${selected ? "selected" : ""}"
                         role="${multi ? "checkbox" : "radio"}" aria-checked="${selected}" tabindex="0"
                         data-class-index="${entry.classIndex}" data-feature-key="${entry.key}" data-feature-choice="${opt.id}">
                        <div class="card-title-row">
                            <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                            <span class="card-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                        </div>
                        <p class="card-body">${opt.description}</p>
                    </div>
                `;
                }).join("")}
            </div>
        </div>
    `;
}

export function renderLevelChoices(ctx: CharacterCreatorContext, cls: ClassDefinition, lvl: number, classIdx: number = 0, activeSubId?: string, isUnlocked: boolean = true): string {
    const choices: string[] = [];
    const fallbackCls = CLASSES_2024.find((c) => c.id === cls.id);
    const rawSubId = activeSubId || ctx.state.classes[classIdx]?.subclassId || (classIdx === 0 ? ctx.state.subclassId : "") || "";
    const currentSubId = ctx.resolveCanonicalSubclassId(cls.id, rawSubId);
    const deduplicatedSubclasses = ctx.deduplicateClassSubclasses(cls.id, cls.subclasses || fallbackCls?.subclasses || []);
    const subObj = currentSubId
        ? (deduplicatedSubclasses.find((s: any) => s.id === currentSubId) || fallbackCls?.subclasses?.find((s) => s.id === currentSubId))
        : undefined;
    const fallbackSubObj = currentSubId ? fallbackCls?.subclasses?.find((s) => s.id === currentSubId) : undefined;
    const resolvedClsFeatures = (cls.features && cls.features.length > 0) ? cls.features : (fallbackCls?.features || []);
    const resolvedSubFeatures = (subObj?.features && subObj.features.length > 0) ? subObj.features : (fallbackSubObj?.features || []);
    const subLabel = subObj?.name ? ` (${subObj.name})` : "";

    const getClsFeatureDesc = (featureNamePrefix: string, fallbackDesc: string, targetLvl?: number): string => {
        const lowerPrefix = featureNamePrefix.toLowerCase();
        const match = resolvedClsFeatures.find((f: ClassLevelFeature) =>
            (targetLvl === undefined || f.level === targetLvl) &&
            f.name.toLowerCase().startsWith(lowerPrefix)
        ) || (fallbackCls?.features || []).find((f: ClassLevelFeature) =>
            (targetLvl === undefined || f.level === targetLvl) &&
            f.name.toLowerCase().startsWith(lowerPrefix)
        );
        return match?.description || fallbackDesc;
    };

    const getSubFeatureDesc = (featureNamePrefix: string, fallbackDesc: string): string => {
        const lowerPrefix = featureNamePrefix.toLowerCase();
        const match = resolvedSubFeatures.find((f: any) =>
            String(f.name || "").toLowerCase().startsWith(lowerPrefix)
        ) || (fallbackSubObj?.features || []).find((f: any) =>
            String(f.name || "").toLowerCase().startsWith(lowerPrefix)
        );
        return match?.description || fallbackDesc;
    };

    // Level 1 choices
    if (lvl === 1) {
        // Weapon Masteries
        if (cls.weaponMasteryCount > 0) {
            choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-crosshairs"></i> Weapon Masteries (Chosen: ${ctx.state.weaponMasteries.length} of ${ctx.getMaxWeaponMasteriesCount()})</h5>
                        <p class="card-body">${getClsFeatureDesc("Weapon Mastery", "Your martial training unlocks tactical weapon mastery properties (Push, Vex, Nick, Topple, Cleave, Graze, Sap, Slow).")}</p>
                        <div class="skills-select-grid">
                            ${BASE_WEAPONS_2024.filter((w) => cls.weaponProficiencies.some((p) => p.includes("Martial") || w.category.includes("Simple"))).map((w) => {
                const isSelected = ctx.state.weaponMasteries.includes(w.name);
                return `
                                    <div class="skill-checkbox-card mastery-card ${isSelected ? "selected" : ""}" data-weapon-name="${w.name}" data-class-index="${classIdx}" role="checkbox" aria-checked="${isSelected}" tabindex="0" data-kbd-activate>
                                        <div class="skill-info">
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                            <span class="skill-name">${w.name}</span>
                                        </div>
                                        <span class="skill-stat-badge" style="color: var(--ui-text);">${w.mastery}</span>
                                    </div>
                                `;
            }).join("")}
                        </div>
                    </div>
                `);
        }




    }


    // Level 3 choices
    if (lvl === 3) {
        // Subclass Selection
        if (deduplicatedSubclasses.length > 0) {
            choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-halved"></i> Subclass Selection (Level 3)</h5>
                        <p class="card-body">${getClsFeatureDesc(`${cls.name} Subclass`, `Choose a ${cls.name} specialization that grants you features at certain ${cls.name} levels.`, 3)}</p>
                        <div class="card-select-grid" role="radiogroup" aria-label="${cls.name} subclass" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                            ${deduplicatedSubclasses.map((sub) => `
                                <div class="select-card subclass-card ${currentSubId === sub.id ? "selected" : ""}" data-class-index="${classIdx}" data-subclass-id="${sub.id}" role="radio" aria-checked="${currentSubId === sub.id}" tabindex="0" data-kbd-activate>
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sub.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sub.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
        }














    }












    // ASI / Feat note, at the class rules' asiLevels and epicBoonLevel
    const asiLevels: number[] = [
        ...(cls.scalingTraits?.asiLevels || []),
        ...(cls.scalingTraits?.epicBoonLevel ? [cls.scalingTraits.epicBoonLevel] : [])
    ];
    if (asiLevels.includes(lvl)) {
        choices.push(`
                <div class="level-info-note">
                    <i class="fa-solid fa-circle-info" aria-hidden="true"></i> Ability Score Improvements and Feats for Level ${lvl} are customized on <strong>Step 5: Ability Scores</strong>.
                </div>
            `);
    }

    // Pick lists (e.g. Eldritch Invocations, Metamagic, Maneuvers) appear at the first level their class offers them
    const poolClassLevel = ctx.state.classes[classIdx]?.classId === cls.id ? (ctx.state.classes[classIdx]?.level || lvl) : lvl;
    for (const pool of progressionPoolsForClass(cls, subObj as any, classIdx, poolClassLevel).filter((p) => p.level === lvl)) {
        const desc = (pool.isSubclass ? getSubFeatureDesc(pool.name, "") : getClsFeatureDesc(pool.name, ""))
            || pool.prompt || `Choose up to ${pool.max} ${pool.name}.`;
        choices.push(renderPoolBox(ctx, pool, desc));
    }

    // Features at this level that let the player pick spells (e.g. Mystic Arcanum): picked on the Spells step
    const pickFeatures = ([[cls.progression || [], ""], [(subObj?.progression || []) as ProgressionLevel[], subObj?.name ? ` (${subObj.name})` : ""]] as Array<[ProgressionLevel[], string]>)
        .flatMap(([levels, suffix]) => levels.filter((pl) => pl.level === lvl).flatMap((pl) => (pl.features || []).map((f) => ({ f, suffix }))))
        .filter(({ f }) => (f.spellPicks || []).length > 0);
    for (const { f, suffix } of pickFeatures) {
        choices.push(`
                <div class="level-choice-box">
                    <h5 class="level-choice-title"><i class="fa-solid fa-scroll" aria-hidden="true"></i> ${f.name}${suffix}</h5>
                    <p class="card-body">${f.description}</p>
                    ${spellPickNote(`${f.name}${suffix}`, f.spellPicks || [])}
                </div>
            `);
    }

    // Every choice the class's and subclass's progression offers at this level (pick lists like invocations aside)
    const classLevel = ctx.state.classes[classIdx]?.classId === cls.id ? (ctx.state.classes[classIdx]?.level || lvl) : lvl;
    for (const entry of progressionChoicesForClass(ctx, cls, currentSubId, classIdx, classLevel).filter((e) => e.level === lvl)) {
        const desc = entry.choice.description || entry.choice.prompt
            || (entry.isSubclass ? getSubFeatureDesc(entry.choice.name, "") : getClsFeatureDesc(entry.choice.name, "", lvl))
            || `Choose ${entry.choice.chooseCount || 1} ${entry.choice.name} option${(entry.choice.chooseCount || 1) > 1 ? "s" : ""}.`;
        choices.push(renderProgressionChoiceBox(entry, desc));
    }

    if (!isUnlocked) {
        return choices.map((c) =>
            c.replace(
                '<div class="level-choice-box">',
                '<div class="level-choice-box locked-choice" aria-disabled="true">'
            )
        ).join("");
    }

    return choices.join("");
}

export function renderClassProgression(ctx: CharacterCreatorContext, cls: ClassDefinition, classLevel: number = 1, classIdx: number = 0, activeSubId?: string): string {
    const charLevel = classLevel;
    const boxes: string[] = [];

    const fallbackCls = CLASSES_2024.find((c) => c.id === cls.id);
    const deduplicatedSubclasses = ctx.deduplicateClassSubclasses(cls.id, cls.subclasses || fallbackCls?.subclasses || []);
    const rawSubId = activeSubId || ctx.state.classes[classIdx]?.subclassId || (classIdx === 0 ? ctx.state.subclassId : "") || deduplicatedSubclasses[0]?.id || fallbackCls?.subclasses?.[0]?.id || "";
    const resolvedSubId = ctx.resolveCanonicalSubclassId(cls.id, rawSubId);
    const sub = resolvedSubId
        ? (deduplicatedSubclasses.find((s: any) => s.id === resolvedSubId) || fallbackCls?.subclasses?.find((s) => s.id === resolvedSubId))
        : undefined;
    const fallbackSub = resolvedSubId ? fallbackCls?.subclasses?.find((s) => s.id === resolvedSubId) : undefined;
    const resolvedSubFeatures = (sub?.features && sub.features.length > 0) ? sub.features : (fallbackSub?.features || []);
    const resolvedClsFeatures = (cls.features && cls.features.length > 0) ? cls.features : (fallbackCls?.features || []);

    const isSubclassPlaceholder = (f: ClassLevelFeature): boolean => {
        const lowerName = f.name.toLowerCase();
        const lowerDesc = (f.description || "").toLowerCase();
        return (
            lowerName === "subclass feature" ||
            lowerName === "subclass capstone" ||
            lowerName.endsWith(" subclass") ||
            lowerDesc.startsWith("gain a feature granted by") ||
            lowerDesc.startsWith("gain a subclass") ||
            lowerDesc.startsWith("gain your sacred oath")
        );
    };

    // A feature is covered by a choice box when a class/subclass progression choice at its level (or a pick list such as
    // Eldritch Invocations, at any level) carries its name
    const choiceSets: ProgressionLevel[][] = [cls.progression || [], (sub?.progression || []) as ProgressionLevel[]];
    const choiceNamesAt = (lvl: number): string[] => choiceSets
        .flatMap((levels) => levels.filter((pl) => pl.level === lvl).flatMap((pl) => pl.choices || []))
        .map((ch) => ch.name.toLowerCase());
    const poolNames = choiceSets
        .flatMap((levels) => levels.flatMap((pl) => pl.choices || []))
        .filter((ch) => ch.pool)
        .map((ch) => ch.name.toLowerCase());
    const namesMatch = (featureName: string, choiceName: string) => featureName === choiceName;
    const poolMatch = (featureName: string, poolName: string) => featureName === poolName || featureName.startsWith(poolName);

    const isFeatureCoveredByChoiceBox = (f: ClassLevelFeature & { isSubclassFeature?: boolean }, lvl: number): boolean => {
        const rawName = String(f.name || "").trim();
        const suffix = sub?.name ? ` (${sub.name})` : "";
        const strippedSub = suffix && rawName.endsWith(suffix)
            ? rawName.slice(0, -suffix.length).trim()
            : rawName;
        const baseLower = strippedSub.toLowerCase();
        const normLower = baseLower.replace(/\s*\([^)]+\)\s*$/, "").trim();

        if (cls.weaponMasteryCount > 0 && (baseLower.startsWith("weapon mastery") || normLower === "weapon mastery")) return true;
        if (cls.subclasses && cls.subclasses.length > 0 && normLower.endsWith(" subclass")) return true;
        if (poolNames.some((n) => poolMatch(normLower, n))) return true;
        // Features that let the player pick spells get their own box (with the Step 8 note)
        if (choiceSets.some((levels) => levels.some((pl) => pl.level === lvl && (pl.features || []).some((pf) =>
            (pf.spellPicks || []).length > 0 && pf.name.toLowerCase() === baseLower)))) return true;
        return choiceNamesAt(lvl).some((n) => namesMatch(normLower, n));
    };

    for (let lvl = 1; lvl <= 20; lvl++) {
        if (ctx.progressionFilter === "unlocked" && lvl > charLevel) {
            continue;
        }

        const isUnlocked = lvl <= charLevel;
        let featuresAtLvl: Array<ClassLevelFeature & { isSubclassFeature?: boolean }> = resolvedClsFeatures
            .filter((f: ClassLevelFeature) => f.level === lvl)
            .map((f: ClassLevelFeature) => ({ ...f }));
        const pb = Math.floor((lvl - 1) / 4) + 2;
        const statBadge = getClassLevelStatBadge(cls, lvl);

        let subAnnotation = "";
        if (sub && featuresAtLvl.some((f) => f.name.toLowerCase().includes("subclass"))) {
            subAnnotation = ` (${sub.name})`;
        }

        const subFeaturesAtLvl = resolvedSubFeatures.filter((f: any) => f.level === lvl);
        if (subFeaturesAtLvl.length > 0) {
            const subFeatureCards = subFeaturesAtLvl.map((sf: any) => ({
                level: sf.level,
                name: sub ? `${sf.name} (${sub.name})` : sf.name,
                description: sf.description,
                isSubclassFeature: true
            }));
            featuresAtLvl = [
                ...featuresAtLvl.filter((f) => !isSubclassPlaceholder(f)),
                ...subFeatureCards
            ];
        }

        // Filter out features that are rendered as a .level-choice-box (with their description under .level-choice-title)
        featuresAtLvl = featuresAtLvl.filter((f) => !isFeatureCoveredByChoiceBox(f, lvl));

        // Progression-granted spells for this level (from cls.progression and sub.progression)
        const clsProgLvl = cls.progression?.find((p) => p.level === lvl);
        const subProgLvl = sub?.progression?.find((p: any) => p.level === lvl);
        const grantedSpellsAtLvl = [
            ...((clsProgLvl?.grantedSpells || []).map((sp: any) => ({
                name: typeof sp === "string" ? sp : (sp.name || sp.spellId),
                source: cls.name
            }))),
            ...((subProgLvl?.grantedSpells || []).map((sp: any) => ({
                name: typeof sp === "string" ? sp : (sp.name || sp.spellId),
                source: sub ? sub.name : "Subclass"
            })))
        ].filter((s) => Boolean(s.name));

        if (grantedSpellsAtLvl.length > 0) {
            const spellCards = grantedSpellsAtLvl.map((sp) => ({
                level: lvl,
                name: `${sp.name} (Granted Spell)`,
                description: `Automatically granted and always prepared by ${sp.source}.`,
                isSubclassFeature: sp.source !== cls.name,
                isGrantedSpell: true
            }));
            featuresAtLvl.push(...(spellCards as any));
        }

        const choicesHtml = renderLevelChoices(ctx, cls, lvl, classIdx, resolvedSubId, isUnlocked);
        const isCollapsed = ctx.collapsedProgressionLevels?.has(`${classIdx}-${lvl}`);

        const boxHtml = `
                <div class="creator-detail-box level-progression-box progression-row ${isUnlocked ? "unlocked" : "locked"}${isCollapsed ? " is-collapsed" : ""}" data-class-index="${classIdx}" data-level="${lvl}">
                    <div class="level-card-header" title="Click to ${isCollapsed ? "expand" : "collapse"} Level ${lvl} details">
                        <div class="level-header-title">
                            <button type="button" class="progression-lvl-badge ${isUnlocked ? "badge-unlocked" : "badge-locked"}" title="${isUnlocked ? (lvl === charLevel ? `Click to lock ${cls.name} Level ${lvl}` : `Click to set ${cls.name} to Level ${lvl}`) : `Click to unlock ${cls.name} Level ${lvl}`}" data-class-index="${classIdx}" data-level="${lvl}">
                                ${isUnlocked ? `<i class="fa-solid fa-check" aria-hidden="true"></i>` : `<i class="fa-solid fa-lock" aria-hidden="true"></i>`} Level ${lvl}<span class="visually-hidden">: ${isUnlocked ? (lvl === charLevel ? `lock ${cls.name} Level ${lvl}` : `set ${cls.name} to Level ${lvl}`) : `unlock ${cls.name} Level ${lvl}`}</span>
                            </button>
                            <h4 class="level-title-text">${cls.name} Level ${lvl} Abilities</h4>
                        </div>
                        <div class="level-header-meta">
                            <span class="progression-pb-tag">PB +${pb}</span>
                            ${statBadge ? `<span class="progression-stat-badge"><i class="fa-solid fa-bolt"></i> ${statBadge}</span>` : ""}
                            <span class="progression-status-pill ${isUnlocked ? "status-unlocked" : "status-locked"}">
                                ${isUnlocked ? `<i class="fa-solid fa-circle-check"></i> Active` : `<i class="fa-solid fa-lock"></i> Click badge to unlock`}
                            </span>
                            <button type="button" class="level-collapse-btn" aria-label="${isCollapsed ? "Expand" : "Collapse"} Level ${lvl}" aria-expanded="${!isCollapsed}" data-class-index="${classIdx}" data-level="${lvl}">
                                <i class="fa-solid fa-chevron-down level-collapse-icon"></i>
                            </button>
                        </div>
                    </div>

                    <div class="level-progression-body${isCollapsed ? " is-collapsed" : ""}"${isCollapsed ? ' style="display: none;"' : ""}>
                        ${featuresAtLvl.length > 0 ? `
                            <div class="level-abilities-grid">
                                ${featuresAtLvl.map((f) => `
                                    <div class="select-card ability-feature-card ${isUnlocked ? "active" : "locked"}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${f.name}${!f.isSubclassFeature && f.name.toLowerCase().includes("subclass") ? subAnnotation : ""}</h5>
                                            ${getFeatureTagHtml(f.name, lvl, Boolean(f.isSubclassFeature), Boolean((f as any).isGrantedSpell))}
                                        </div>
                                        <p class="card-body">${f.description}</p>
                                    </div>
                                `).join("")}
                            </div>
                        ` : ""}

                        ${choicesHtml}
                    </div>
                </div>
            `;

        boxes.push(boxHtml);
    }

    return `
            <div class="creator-detail-box class-progression-box progression-main-header">
                <div class="progression-box-header" style="margin: 0;">
                    <div class="progression-header-text">
                        <h4 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text);">
                            <i class="fa-solid fa-layer-group"></i> ${cls.name} Level Progression (Levels 1–20)
                        </h4>
                        <p class="card-body" style="margin: 0.25rem 0 0;">
                            New abilities, features, and choices gained at each level for the ${cls.name} class. Click a level badge to unlock or set your level in this class. Currently Level ${charLevel}. Click any level header to collapse or expand it.
                        </p>
                    </div>
                    <div class="progression-header-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                        <button type="button" class="btn btn-secondary btn-sm progression-toggle-all-btn" data-action="collapse-all" data-class-index="${classIdx}">
                            <i class="fa-solid fa-compress"></i> Collapse All
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm progression-toggle-all-btn" data-action="expand-all" data-class-index="${classIdx}">
                            <i class="fa-solid fa-expand"></i> Expand All
                        </button>
                    </div>
                </div>
            </div>

            ${boxes.join("")}
        `;
}

