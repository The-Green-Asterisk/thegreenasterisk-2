import {
    BARBARIAN_ASPECTS,
    BASE_WEAPONS_2024,
    BATTLE_MASTER_MANEUVERS,
    BLESSED_STRIKES_OPTIONS,
    BRUTAL_STRIKE_OPTIONS,
    CLASSES_2024,
    ClassDefinition,
    ClassLevelFeature,
    DIVINE_ORDERS,
    DRACONIC_ANCESTOR_ELEMENTS,
    DRUID_LAND_BIOMES,
    ELDRITCH_INVOCATIONS,
    ELEMENTAL_FURY_OPTIONS,
    ELEMENTS_ATTUNEMENT_DAMAGE_TYPES,
    FIENDISH_RESILIENCE_DAMAGE_TYPES,
    FIGHTING_STYLES,
    HUNTER_DEFENSIVE_TACTICS,
    HUNTER_PREY_OPTIONS,
    METAMAGIC_OPTIONS,
    PRIMAL_COMPANION_TYPES,
    PRIMAL_ORDERS,
    ROGUE_CUNNING_STRIKES,
    ROGUE_DEVIOUS_STRIKES,
    TACTICAL_MASTER_PROPERTIES,
    WILD_HEART_RAGES,
    WILD_HEART_TOTEMIC_ATTUNEMENTS,
    WIZARD_SCHOLAR_SKILLS,
    ZEALOT_DIVINE_FURIES,
    STARRY_FORM_CONSTELLATIONS,
    SEA_WRATH_DAMAGE_TYPES,
    MOON_CIRCLE_FORMS_STRIKES,
    DIVINER_THIRD_EYE_OPTIONS,
    CHAMPION_ADDITIONAL_FIGHTING_STYLES,
    STUDENT_OF_WAR_SKILLS,
    PSI_WARRIOR_THRUST_OPTIONS,
    BATTERING_ROOTS_OPTIONS,
    IMPROVED_BRUTAL_STRIKE_OPTIONS,
    OPEN_HAND_TECHNIQUES,
    WAR_GOD_BLESSING_OPTIONS,
    STEPS_OF_THE_FEY_OPTIONS,
    FEY_WANDERER_GLAMOUR_SKILLS,
    HUNTER_SUPERIOR_DEFENSE_OPTIONS,
    ABERRANT_REVELATION_OPTIONS,
    MULTICLASS_PREREQUISITES_2024
} from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";

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

                    <div class="card-select-grid">
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
                                const prereq = MULTICLASS_PREREQUISITES_2024[c.id.toLowerCase()];
                                if (prereq) {
                                    badgeHtml = `<div class="class-prereq-badge info"><i class="fa-solid fa-circle-info"></i> Multiclass: ${prereq.label}</div>`;
                                }
                            }

                            return `
                                <div class="select-card class-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}" 
                                     data-class-index="${classIdx}" 
                                     data-class-id="${c.id}"
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

    export function getClassLevelStatBadge(cls: ClassDefinition, lvl: number): string {
        const parts: string[] = [];
        if (cls.id === "barbarian") {
            const rages = lvl >= 17 ? "6 Rages" : lvl >= 12 ? "5 Rages" : lvl >= 6 ? "4 Rages" : lvl >= 3 ? "3 Rages" : "2 Rages";
            const rageDmg = lvl >= 16 ? "+4" : lvl >= 9 ? "+3" : "+2";
            parts.push(`${rages} • Rage Dmg ${rageDmg}`);
        } else if (cls.id === "fighter") {
            const attacks = lvl >= 20 ? "4 Attacks" : lvl >= 11 ? "3 Attacks" : lvl >= 5 ? "2 Attacks" : "1 Attack";
            const masteries = lvl >= 16 ? "6 Masteries" : lvl >= 10 ? "5 Masteries" : lvl >= 4 ? "4 Masteries" : "3 Masteries";
            parts.push(`${attacks} • ${masteries}`);
        } else if (cls.id === "rogue") {
            const sneakDice = Math.ceil(lvl / 2);
            parts.push(`Sneak Attack ${sneakDice}d6`);
        } else if (cls.id === "monk") {
            const artsDie = lvl >= 17 ? "1d12" : lvl >= 11 ? "1d10" : lvl >= 5 ? "1d8" : "1d6";
            const speed = lvl >= 18 ? "+30 ft" : lvl >= 14 ? "+25 ft" : lvl >= 10 ? "+20 ft" : lvl >= 6 ? "+15 ft" : lvl >= 2 ? "+10 ft" : "+0 ft";
            parts.push(`${lvl} Focus Pts • Martial Arts ${artsDie} • Speed ${speed}`);
        }

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
                                    <div class="skill-checkbox-card mastery-card ${isSelected ? "selected" : ""}" data-weapon-name="${w.name}" data-class-index="${classIdx}">
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

            // Fighting Style for Fighter
            if (cls.id === "fighter") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Fighting Style (Choose 1)</h5>
                        <p class="card-body">${getClsFeatureDesc("Fighting Style", "You have honed your martial prowess and gain a Fighting Style feat of your choice.", 1)}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> If you choose <strong>Blessed Warrior</strong> or <strong>Druidic Warrior</strong>, you can select your granted cantrips in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                        </div>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FIGHTING_STYLES.map((fs) => `
                                <div class="select-card fighting-style-card ${ctx.state.fightingStyle === fs.id ? "selected" : ""}" data-fighting-style-id="${fs.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${fs.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${fs.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Divine Order for Cleric
            if (cls.id === "cleric") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Divine Order</h5>
                        <p class="card-body">${getClsFeatureDesc("Divine Order", "You have dedicated yourself to one of the following sacred roles of your choice.", 1)}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> If you choose <strong>Thaumaturge</strong>, you can select your bonus Cleric cantrip in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                        </div>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${DIVINE_ORDERS.map((ord) => `
                                <div class="select-card divine-order-card ${ctx.state.divineOrder === ord.id ? "selected" : ""}" data-divine-order-id="${ord.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${ord.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${ord.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Primal Order for Druid
            if (cls.id === "druid") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-leaf"></i> Primal Order</h5>
                        <p class="card-body">${getClsFeatureDesc("Primal Order", "You have dedicated yourself to one of the following sacred roles of your choice.", 1)}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> If you choose <strong>Magician</strong>, you can select your bonus Druid cantrip in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                        </div>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${PRIMAL_ORDERS.map((ord) => `
                                <div class="select-card primal-order-card ${ctx.state.primalOrder === ord.id ? "selected" : ""}" data-primal-order-id="${ord.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${ord.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${ord.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Eldritch Invocations for Warlock (gained at Level 1 in 2024 rules)
            if (cls.id === "warlock") {
                const warlockLvl = ctx.state.classes?.find((c) => c.classId === "warlock")?.level || (ctx.state.classId === "warlock" ? ctx.state.level : 1);
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-eye"></i> Eldritch Invocations (Choose up to ${ctx.getMaxInvocationsCount()})</h5>
                        <p class="card-body">${getClsFeatureDesc("Eldritch Invocations", "You have unearthed Eldritch Invocations, pieces of forbidden knowledge that imbue you with an abiding magical ability or other lessons.")}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Invocations that grant spell choices (such as <strong>Pact of the Tome</strong>) have a dedicated selection section in <strong>Class &amp; Subclass Progression Spells</strong> on <strong>Step 8: Spells</strong>.
                        </div>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ELDRITCH_INVOCATIONS.filter((inv) => !inv.minLevel || warlockLvl >= inv.minLevel).map((inv) => {
                                const isSelected = ctx.state.invocations.includes(inv.id);
                                return `
                                    <div class="select-card invocation-card ${isSelected ? "selected" : ""}" data-invocation-id="${inv.id}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${inv.name}</h5>
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        </div>
                                        ${inv.minLevel ? `<span class="card-tag">Min Level: ${inv.minLevel}</span>` : ""}
                                        <p class="card-body">${inv.description}</p>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 2 choices
        if (lvl === 2) {
            // Fighting Style for Paladin & Ranger
            if (cls.id === "paladin" || cls.id === "ranger") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Fighting Style (Choose 1)</h5>
                        <p class="card-body">${getClsFeatureDesc("Fighting Style", "Choose a Fighting Style feat for which you qualify.", 2)}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> If you choose <strong>Blessed Warrior</strong> or <strong>Druidic Warrior</strong>, you can select your granted cantrips in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                        </div>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FIGHTING_STYLES.map((fs) => `
                                <div class="select-card fighting-style-card ${ctx.state.fightingStyle === fs.id ? "selected" : ""}" data-fighting-style-id="${fs.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${fs.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${fs.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Metamagic for Sorcerer
            if (cls.id === "sorcerer") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-wand-sparkles"></i> Metamagic (Choose up to ${ctx.getMaxMetamagicCount()})</h5>
                        <p class="card-body">${getClsFeatureDesc("Metamagic", "Because your magic flows from within, you can alter your spells to suit your needs; you gain two Metamagic options of your choice, and you learn additional Metamagic options at Sorcerer levels 10 and 17.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${METAMAGIC_OPTIONS.map((meta) => {
                                const isSelected = ctx.state.metamagic.includes(meta.id);
                                return `
                                    <div class="select-card metamagic-card ${isSelected ? "selected" : ""}" data-metamagic-id="${meta.id}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${meta.name}</h5>
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        </div>
                                        <p class="card-body">${meta.description}</p>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `);
            }

            // Wizard Scholar (Level 2)
            if (cls.id === "wizard") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["wizard-2-scholar"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-graduation-cap"></i> Scholar Academic Skill</h5>
                        <p class="card-body">${getClsFeatureDesc("Scholar", "Gain Expertise in one of your proficient skills from: Arcana, History, Nature, Medicine, or Religion.", 2)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WIZARD_SCHOLAR_SKILLS.map((sk) => `
                                <div class="select-card subclass-feature-card ${currentChoice === sk.id ? "selected" : ""}" data-feature-key="wizard-2-scholar" data-feature-choice="${sk.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sk.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sk.description}</p>
                                </div>
                            `).join("")}
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
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                            ${deduplicatedSubclasses.map((sub) => `
                                <div class="select-card subclass-card ${currentSubId === sub.id ? "selected" : ""}" data-class-index="${classIdx}" data-subclass-id="${sub.id}">
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

            // Battle Master Maneuvers (Combat Superiority)
            if (cls.id === "fighter" && currentSubId === "battle-master") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-dice-d20"></i> Combat Superiority${subLabel} — Battle Master Maneuvers (Choose up to ${ctx.getMaxManeuversCount()})</h5>
                        <p class="card-body">${getSubFeatureDesc("Combat Superiority", "You learn 3 tactical Maneuvers fueled by four Superiority Dice (d8s). Maneuvers add tactical effects to attacks and checks and recharge on a Short or Long Rest.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${BATTLE_MASTER_MANEUVERS.map((man) => {
                                const isSelected = ctx.state.maneuvers.includes(man.id);
                                return `
                                    <div class="select-card maneuver-card ${isSelected ? "selected" : ""}" data-maneuver-id="${man.id}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${man.name}</h5>
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        </div>
                                        <p class="card-body">${man.description}</p>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Wild Heart: Rage of the Wilds
            if (cls.id === "barbarian" && currentSubId === "wild-heart") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-3-wild-heart"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-paw"></i> Rage of the Wilds${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Rage of the Wilds", "Choose Bear (resistance to all damage except Force), Eagle (Dash and Disengage as Bonus Action), or Wolf (allies have Advantage on melee attacks against enemies within 5 ft) when entering Rage.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WILD_HEART_RAGES.map((r) => `
                                <div class="select-card subclass-feature-card ${currentChoice === r.id ? "selected" : ""}" data-feature-key="barbarian-3-wild-heart" data-feature-choice="${r.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${r.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${r.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Zealot: Divine Fury
            if (cls.id === "barbarian" && currentSubId === "zealot") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-3-zealot"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Divine Fury${subLabel} — Divine Fury Energy</h5>
                        <p class="card-body">${getSubFeatureDesc("Divine Fury", "The first creature you hit on each of your turns with a weapon attack while raging takes extra 1d6 + half Barbarian level Radiant or Necrotic damage.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ZEALOT_DIVINE_FURIES.map((z) => `
                                <div class="select-card subclass-feature-card ${currentChoice === z.id ? "selected" : ""}" data-feature-key="barbarian-3-zealot" data-feature-choice="${z.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${z.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${z.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Monk Warrior of Elements: Elemental Attunement
            if (cls.id === "monk" && currentSubId === "elements") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["monk-3-elements"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-fire"></i> Elemental Attunement${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Elemental Attunement", "Spend 1 Focus Point as a Bonus Action to manifest elemental energy for 10 minutes: reach increases by 10 feet, and your unarmed strikes can deal Acid, Cold, Fire, Lightning, or Thunder damage.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ELEMENTS_ATTUNEMENT_DAMAGE_TYPES.map((e) => `
                                <div class="select-card subclass-feature-card ${currentChoice === e.id ? "selected" : ""}" data-feature-key="monk-3-elements" data-feature-choice="${e.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${e.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${e.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Beast Master: Primal Companion
            if (cls.id === "ranger" && currentSubId === "beast-master") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["ranger-3-beast-master"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-paw"></i> Primal Companion${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Primal Companion", "You magically summon a primal beast (Beast of the Land, Sea, or Sky) that accompanies you on your adventures and fights alongside you.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${PRIMAL_COMPANION_TYPES.map((p) => `
                                <div class="select-card subclass-feature-card ${currentChoice === p.id ? "selected" : ""}" data-feature-key="ranger-3-beast-master" data-feature-choice="${p.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${p.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${p.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Hunter: Hunter's Prey
            if (cls.id === "ranger" && currentSubId === "hunter") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["ranger-3-hunter"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-crosshairs"></i> Hunter's Prey${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Hunter's Prey", "Choose Colossus Slayer (deal an extra 1d8 damage to an injured creature once per turn) or Horde Breaker (make an additional attack against a creature within 5 feet of your target).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${HUNTER_PREY_OPTIONS.map((h) => `
                                <div class="select-card subclass-feature-card ${currentChoice === h.id ? "selected" : ""}" data-feature-key="ranger-3-hunter" data-feature-choice="${h.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${h.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${h.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Sorcerer Draconic: Draconic Ancestor
            if (cls.id === "sorcerer" && currentSubId === "draconic") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["sorcerer-3-draconic"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-dragon"></i> Draconic Ancestor${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Draconic Ancestor", "Choose a dragon ancestor (Black/Copper: Acid, Blue/Bronze: Lightning, Brass/Gold/Red: Fire, Green: Poison, Silver/White: Cold) which determines your elemental affinity.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${DRACONIC_ANCESTOR_ELEMENTS.map((d) => `
                                <div class="select-card subclass-feature-card ${currentChoice === d.id ? "selected" : ""}" data-feature-key="sorcerer-3-draconic" data-feature-choice="${d.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${d.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${d.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Battle Master: Student of War
            if (cls.id === "fighter" && currentSubId === "battle-master") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["fighter-3-battle-master-student"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-graduation-cap"></i> Student of War${subLabel} — Bonus Skill</h5>
                        <p class="card-body">${getSubFeatureDesc("Student of War", "You gain proficiency with one type of artisan's tools and one skill of your choice.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${STUDENT_OF_WAR_SKILLS.map((sk) => `
                                <div class="select-card subclass-feature-card ${currentChoice === sk.id ? "selected" : ""}" data-feature-key="fighter-3-battle-master-student" data-feature-choice="${sk.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sk.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sk.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Monk Open Hand: Open Hand Technique
            if (cls.id === "monk" && currentSubId === "open-hand") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["monk-3-open-hand"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-hand-fist"></i> Open Hand Technique${subLabel} — Primary Tactic</h5>
                        <p class="card-body">${getSubFeatureDesc("Open Hand Technique", "Whenever you hit a creature with an attack granted by Flurry of Blows, you can impose Addle (cannot take Reactions), Push (push 15 feet away), or Topple (knock Prone).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${OPEN_HAND_TECHNIQUES.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="monk-3-open-hand" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Fey Wanderer: Otherworldly Glamour
            if (cls.id === "ranger" && currentSubId === "fey-wanderer") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["ranger-3-fey-wanderer"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Otherworldly Glamour${subLabel} — Skill</h5>
                        <p class="card-body">${getSubFeatureDesc("Otherworldly Glamour", "Whenever you make a Charisma check, add your Wisdom modifier (minimum +1). Gain proficiency in Deception, Performance, or Persuasion.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FEY_WANDERER_GLAMOUR_SKILLS.map((sk) => `
                                <div class="select-card subclass-feature-card ${currentChoice === sk.id ? "selected" : ""}" data-feature-key="ranger-3-fey-wanderer" data-feature-choice="${sk.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sk.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sk.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Warlock Archfey: Steps of the Fey
            if (cls.id === "warlock" && currentSubId === "archfey") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["warlock-3-archfey"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shoe-prints"></i> Steps of the Fey${subLabel} — Teleport Effect</h5>
                        <p class="card-body">${getSubFeatureDesc("Steps of the Fey", "You always have Misty Step prepared, and you can cast it without expending a spell slot PB times per Long Rest with enhanced effects (Taunting Step or Refreshing Step).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${STEPS_OF_THE_FEY_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="warlock-3-archfey" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Stars: Starry Form
            if (cls.id === "druid" && currentSubId === "stars") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["druid-3-stars"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-star"></i> Starry Form${subLabel} — Primary Constellation</h5>
                        <p class="card-body">${getSubFeatureDesc("Starry Form", "As a Bonus Action, expend a use of Wild Shape to assume a constellation form: Archer (Bonus Action radiant ranged attack), Chalice (bonus healing to another target), or Dragon (minimum 10 on Int/Wis checks and Con saves).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${STARRY_FORM_CONSTELLATIONS.map((c) => `
                                <div class="select-card subclass-feature-card ${currentChoice === c.id ? "selected" : ""}" data-feature-key="druid-3-stars" data-feature-choice="${c.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${c.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${c.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Sea: Wrath of the Sea
            if (cls.id === "druid" && currentSubId === "sea") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["druid-3-sea"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-water"></i> Wrath of the Sea${subLabel} — Damage Manifestation</h5>
                        <p class="card-body">${getSubFeatureDesc("Wrath of the Sea", "As a Bonus Action, expend a use of Wild Shape to manifest a 10-foot aura of ocean spray and thunder for 10 minutes. Once per turn when a creature ends its turn in the aura, you can deal Thunder/Cold damage.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${SEA_WRATH_DAMAGE_TYPES.map((w) => `
                                <div class="select-card subclass-feature-card ${currentChoice === w.id ? "selected" : ""}" data-feature-key="druid-3-sea" data-feature-choice="${w.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${w.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${w.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Moon: Circle Forms Strike
            if (cls.id === "druid" && currentSubId === "moon") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["druid-3-moon"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-moon"></i> Circle Forms${subLabel} — Natural Attack Damage</h5>
                        <p class="card-body">${getSubFeatureDesc("Circle Forms", "You can transform into beasts with a Challenge Rating as high as your Druid level divided by 3 (rounded down). Your beast attacks can deal Radiant damage instead of normal damage.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${MOON_CIRCLE_FORMS_STRIKES.map((m) => `
                                <div class="select-card subclass-feature-card ${currentChoice === m.id ? "selected" : ""}" data-feature-key="druid-3-moon" data-feature-choice="${m.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${m.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${m.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 5 choices
        if (lvl === 5) {
            // Rogue Cunning Strike
            if (cls.id === "rogue") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["rogue-5-cunning-strike"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-bolt"></i> Cunning Strike Primary Focus</h5>
                        <p class="card-body">${getClsFeatureDesc("Cunning Strike", "Forgo Sneak Attack damage dice to apply tactical effects on hit: Poison (Con save or Poisoned), Trip (Dex save or Prone), or Withdraw (move half speed without opportunity attacks).", 5)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ROGUE_CUNNING_STRIKES.map((c) => `
                                <div class="select-card subclass-feature-card ${currentChoice === c.id ? "selected" : ""}" data-feature-key="rogue-5-cunning-strike" data-feature-choice="${c.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${c.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${c.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 6 choices
        if (lvl === 6) {
            // Druid Circle of the Land: Biome Affinity
            if (cls.id === "druid" && currentSubId === "land") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["druid-6-land"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-tree"></i> Circle of the Land Biome Affinity</h5>
                        <p class="card-body">${getSubFeatureDesc("Circle of the Land Spells", "Choose a biome affinity (Arid, Polar, Temperate, or Tropical) whenever you finish a Long Rest, gaining prepared spells associated with that land.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${DRUID_LAND_BIOMES.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="druid-6-land" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Path of the Wild Heart: Aspect of the Beast
            if (cls.id === "barbarian" && currentSubId === "wild-heart") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-6-wild-heart"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-paw"></i> Aspect of the Beast${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Aspect of the Beast", "Choose an animal aspect: Elephant (Athletics Advantage, doubled carrying capacity), Owl (Darkvision 60 ft, Perception Advantage), Panther (Climb speed equal to Speed), Pike (Swim speed equal to Speed), or Spider (Climb speed equal to Speed with spider climb).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${BARBARIAN_ASPECTS.map((a) => `
                                <div class="select-card subclass-feature-card ${currentChoice === a.id ? "selected" : ""}" data-feature-key="barbarian-6-wild-heart" data-feature-choice="${a.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${a.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${a.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Cleric War Domain: War God's Blessing
            if (cls.id === "cleric" && currentSubId === "war") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["cleric-6-war"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-halved"></i> War God's Blessing${subLabel} — Preferred Spell</h5>
                        <p class="card-body">${getSubFeatureDesc("War God's Blessing", "You can expend a use of Channel Divinity to cast Shield of Faith or Spiritual Weapon without expending a spell slot.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WAR_GOD_BLESSING_OPTIONS.map((w) => `
                                <div class="select-card subclass-feature-card ${currentChoice === w.id ? "selected" : ""}" data-feature-key="cleric-6-war" data-feature-choice="${w.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${w.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${w.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Bard College of Lore: Magical Discoveries (Level 6)
            if (cls.id === "bard" && currentSubId === "lore") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-book-sparkles"></i> Magical Discoveries${subLabel} (Choose 2 Spells)</h5>
                        <p class="card-body">${getSubFeatureDesc("Magical Discoveries", "Learn two spells of your choice from the Cleric, Druid, or Wizard spell list (cantrip or a spell of a level you can cast). You always have the chosen spells prepared.")}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Select your two <strong>Magical Discoveries</strong> spells in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                        </div>
                    </div>
                `);
            }
        }

        // Ranger Hunter: Defensive Tactics (Level 7 in 2024 Ranger progression, also supported on direct Level 6 call)
        if ((lvl === 7 || (lvl === 6 && activeSubId === undefined)) && cls.id === "ranger" && currentSubId === "hunter") {
            const currentChoice = ctx.state.subclassFeatureChoices?.["ranger-6-hunter"] || "";
            choices.push(`
                <div class="level-choice-box">
                    <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Defensive Tactics${subLabel}</h5>
                    <p class="card-body">${getSubFeatureDesc("Defensive Tactics", "Choose Escape the Horde (opportunity attacks against you have Disadvantage) or Multiattack Defense (when hit by a creature, subsequent attacks from that creature have Disadvantage).")}</p>
                    <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                        ${HUNTER_DEFENSIVE_TACTICS.map((t) => `
                            <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="ranger-6-hunter" data-feature-choice="${t.id}">
                                <div class="card-title-row">
                                    <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                                <p class="card-body">${t.description}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `);
        }

        // Level 7 choices
        if (lvl === 7) {
            // Druid Elemental Fury
            if (cls.id === "druid") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["druid-7"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-bolt"></i> Elemental Fury</h5>
                        <p class="card-body">${getClsFeatureDesc("Elemental Fury", "The might of the elements flows through you. You gain one of the following options of your choice: Potent Spellcasting or Primal Strike.", 7)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${ELEMENTAL_FURY_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="druid-7" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Cleric Blessed Strikes
            if (cls.id === "cleric") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["cleric-7"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Blessed Strikes</h5>
                        <p class="card-body">${getClsFeatureDesc("Blessed Strikes", "Divine power infuses you in battle. You gain one of the following options of your choice: Divine Strike or Potent Spellcasting.", 7)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${BLESSED_STRIKES_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="cleric-7" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Champion: Additional Fighting Style
            if (cls.id === "fighter" && currentSubId === "champion") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["fighter-7-champion"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-heart"></i> Additional Fighting Style${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Additional Fighting Style", "You gain a second Fighting Style feat of your choice.")}</p>
                        <div class="level-info-note choice-spells-referral-note">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> If you choose <strong>Blessed Warrior</strong> or <strong>Druidic Warrior</strong>, you can select your granted cantrips in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                        </div>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${CHAMPION_ADDITIONAL_FIGHTING_STYLES.map((s) => `
                                <div class="select-card subclass-feature-card ${currentChoice === s.id ? "selected" : ""}" data-feature-key="fighter-7-champion" data-feature-choice="${s.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${s.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${s.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Psi Warrior: Telekinetic Thrust
            if (cls.id === "fighter" && currentSubId === "psi-warrior") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["fighter-7-psi-warrior"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-hand"></i> Telekinetic Adept${subLabel} — Telekinetic Thrust Preferred Maneuver</h5>
                        <p class="card-body">${getSubFeatureDesc("Telekinetic Adept", "Psi-Powered Leap grants a flying speed equal to twice your walking speed; Telekinetic Thrust knocks prone or shoves enemies up to 10 feet on hit.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${PSI_WARRIOR_THRUST_OPTIONS.map((p) => `
                                <div class="select-card subclass-feature-card ${currentChoice === p.id ? "selected" : ""}" data-feature-key="fighter-7-psi-warrior" data-feature-choice="${p.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${p.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${p.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 9 choices
        if (lvl === 9) {
            // Barbarian Brutal Strike
            if (cls.id === "barbarian") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-9-brutal-strike"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-gavel"></i> Brutal Strike Primary Tactic</h5>
                        <p class="card-body">${getClsFeatureDesc("Brutal Strike", "If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn to deal an extra 1d10 damage and apply a Brutal Strike effect.", 9)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${BRUTAL_STRIKE_OPTIONS.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="barbarian-9-brutal-strike" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Tactical Master
            if (cls.id === "fighter") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["fighter-9-tactical-master"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-crosshairs"></i> Tactical Master Primary Swap</h5>
                        <p class="card-body">${getClsFeatureDesc("Tactical Master", "When you attack with a weapon whose mastery property you can use, you can replace that property with the Push, Sap, or Slow property for that attack.", 9)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${TACTICAL_MASTER_PROPERTIES.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="fighter-9-tactical-master" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 10 choices
        if (lvl === 10) {
            // Warlock Fiend Patron: Fiendish Resilience
            if (cls.id === "warlock" && currentSubId === "fiend") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["warlock-10-fiend"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-virus"></i> Fiendish Resilience${subLabel} — Damage Resistance</h5>
                        <p class="card-body">${getSubFeatureDesc("Fiendish Resilience", "Choose one damage type whenever you finish a Short or Long Rest. You gain resistance to that damage type until you choose a different one.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FIENDISH_RESILIENCE_DAMAGE_TYPES.map((f) => `
                                <div class="select-card subclass-feature-card ${currentChoice === f.id ? "selected" : ""}" data-feature-key="warlock-10-fiend" data-feature-choice="${f.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${f.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${f.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Path of the World Tree: Battering Roots
            if (cls.id === "barbarian" && currentSubId === "world-tree") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-10-world-tree"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-tree"></i> Battering Roots${subLabel} — Mastery Option</h5>
                        <p class="card-body">${getSubFeatureDesc("Battering Roots", "Tendrils of the World Tree extend your melee reach by 10 feet when using Heavy or Versatile weapons, and you can apply Push or Topple on hit.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${BATTERING_ROOTS_OPTIONS.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="barbarian-10-world-tree" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Wizard Diviner: The Third Eye
            if (cls.id === "wizard" && currentSubId === "diviner") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["wizard-10-diviner"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-eye"></i> The Third Eye${subLabel} — Primary Benefit</h5>
                        <p class="card-body">${getSubFeatureDesc("The Third Eye", "Action to gain one magical sight benefit until incapacitated or taking a rest: Darkvision 60 ft, Ethereal Sight, Greater Comprehension, or See Invisibility.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${DIVINER_THIRD_EYE_OPTIONS.map((o) => `
                                <div class="select-card subclass-feature-card ${currentChoice === o.id ? "selected" : ""}" data-feature-key="wizard-10-diviner" data-feature-choice="${o.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${o.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${o.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Warlock Mystic Arcanum choices (Levels 11, 13, 15, 17)
        if (cls.id === "warlock" && (lvl === 11 || lvl === 13 || lvl === 15 || lvl === 17)) {
            const arcanumLvlMap: Record<number, string> = { 11: "6th", 13: "7th", 15: "8th", 17: "9th" };
            const sLvlLabel = arcanumLvlMap[lvl];
            choices.push(`
                <div class="level-choice-box">
                    <h5 class="level-choice-title"><i class="fa-solid fa-scroll"></i> Mystic Arcanum (${sLvlLabel} Level)</h5>
                    <p class="card-body">${getClsFeatureDesc(`Mystic Arcanum (${sLvlLabel} Level)`, `Choose one ${sLvlLabel}-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.`, lvl)}</p>
                    <div class="level-info-note choice-spells-referral-note">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Select your ${sLvlLabel}-level <strong>Mystic Arcanum</strong> spell in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                    </div>
                </div>
            `);
        }

        // Wizard Spell Mastery (Level 18) & Signature Spells (Level 20)
        if (cls.id === "wizard" && lvl === 18) {
            choices.push(`
                <div class="level-choice-box">
                    <h5 class="level-choice-title"><i class="fa-solid fa-hat-wizard"></i> Spell Mastery (Choose 1st &amp; 2nd-Level Spells)</h5>
                    <p class="card-body">${getClsFeatureDesc("Spell Mastery", "Choose one 1st-level and one 2nd-level Wizard spell in your spellbook that have a casting time of an action. You can cast them at their lowest level without expending a spell slot.", 18)}</p>
                    <div class="level-info-note choice-spells-referral-note">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Select your <strong>Spell Mastery</strong> spells in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                    </div>
                </div>
            `);
        }
        if (cls.id === "wizard" && lvl === 20) {
            choices.push(`
                <div class="level-choice-box">
                    <h5 class="level-choice-title"><i class="fa-solid fa-signature"></i> Signature Spells (Choose Two 3rd-Level Spells)</h5>
                    <p class="card-body">${getClsFeatureDesc("Signature Spells", "Choose two 3rd-level Wizard spells in your spellbook. You always have them prepared and can cast each once at 3rd level without a slot per Short or Long Rest.", 20)}</p>
                    <div class="level-info-note choice-spells-referral-note">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Select your <strong>Signature Spells</strong> in the <strong>Class &amp; Subclass Progression Spells</strong> section on <strong>Step 8: Spells</strong>.
                    </div>
                </div>
            `);
        }

        // Level 13 choices
        if (lvl === 13) {
            // Barbarian Improved Brutal Strike
            if (cls.id === "barbarian") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-13-brutal-strike"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-hammer"></i> Improved Brutal Strike Mastery</h5>
                        <p class="card-body">${getClsFeatureDesc("Improved Brutal Strike", "You have honed new ways to attack furiously. Staggering Blow and Sundering Blow are now among your Brutal Strike options.", 13)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${IMPROVED_BRUTAL_STRIKE_OPTIONS.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="barbarian-13-brutal-strike" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 14 choices
        if (lvl === 14) {
            // Barbarian Wild Heart: Totemic Attunement
            if (cls.id === "barbarian" && currentSubId === "wild-heart") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["barbarian-14-wild-heart"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-feather"></i> Totemic Attunement${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Totemic Attunement", "Choose Falcon (gain a flying speed equal to your walking speed while raging), Lion (enemies within 5 ft have Disadvantage on attacks against targets other than you), or Ram (melee attacks knock Large or smaller creatures prone).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WILD_HEART_TOTEMIC_ATTUNEMENTS.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="barbarian-14-wild-heart" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Rogue Devious Strikes
            if (cls.id === "rogue") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["rogue-14-devious-strike"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-skull"></i> Devious Strike Primary Focus</h5>
                        <p class="card-body">${getClsFeatureDesc("Devious Strikes", "New Cunning Strike options: Daze (Con save or Dazed), Knock Out (Con save or Unconscious), and Obscure (Dex save or Blinded).", 14)}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ROGUE_DEVIOUS_STRIKES.map((d) => `
                                <div class="select-card subclass-feature-card ${currentChoice === d.id ? "selected" : ""}" data-feature-key="rogue-14-devious-strike" data-feature-choice="${d.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${d.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${d.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Sorcerer Aberrant: Revelation in Flesh
            if (cls.id === "sorcerer" && currentSubId === "aberrant") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["sorcerer-14-aberrant"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-dna"></i> Revelation in Flesh${subLabel} — Primary Adaptation</h5>
                        <p class="card-body">${getSubFeatureDesc("Revelation in Flesh", "Bonus Action and 1 or more Sorcery Points to alter your form: gain a flying speed, swimming speed, squeeze through narrow spaces, or see invisible creatures.")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ABERRANT_REVELATION_OPTIONS.map((a) => `
                                <div class="select-card subclass-feature-card ${currentChoice === a.id ? "selected" : ""}" data-feature-key="sorcerer-14-aberrant" data-feature-choice="${a.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${a.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${a.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 15 choices
        if (lvl === 15) {
            // Ranger Hunter: Superior Hunter's Defense
            if (cls.id === "ranger" && currentSubId === "hunter") {
                const currentChoice = ctx.state.subclassFeatureChoices?.["ranger-15-hunter"] || "";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Superior Hunter's Defense${subLabel}</h5>
                        <p class="card-body">${getSubFeatureDesc("Superior Hunter's Defense", "Gain Evasion (take no damage on successful Dex saves and half on failure) or Uncanny Dodge (halve damage from an incoming attack as a Reaction).")}</p>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${HUNTER_SUPERIOR_DEFENSE_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="ranger-15-hunter" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // ASI / Feat levels note
        const asiLevels = [4, 8, 12, 16, 19];
        if (cls.id === "fighter") asiLevels.push(6, 14);
        if (cls.id === "rogue") asiLevels.push(10);
        if (asiLevels.includes(lvl)) {
            choices.push(`
                <div class="level-info-note">
                    <i class="fa-solid fa-circle-info"></i> Ability Score Improvements and Feats for Level ${lvl} are customized on <strong>Step 5: Ability Scores</strong>.
                </div>
            `);
        }

        // Dynamic choices from class or subclass progression JSON
        const subForChoices = subObj;
        const clsProgLvl = cls.progression?.find((p) => p.level === lvl);
        const subProgLvl = subForChoices?.progression?.find((p: any) => p.level === lvl);
        const dynamicChoices = [
            ...(clsProgLvl?.choices || []),
            ...(subProgLvl?.choices || [])
        ];

        const handledChoiceKeys = new Set<string>([
            "fighting-style",
            "divine-order",
            "primal-order",
            "metamagic",
            "invocation",
            "wizard-2-scholar",
            "battle-master-maneuvers",
            "barbarian-3-wild-heart",
            "wild-heart-rage",
            "barbarian-3-zealot",
            "divine-fury",
            "monk-3-elements",
            "elements-attunement",
            "ranger-3-beast-master",
            "beast-master-companion",
            "ranger-3-hunter",
            "hunter-prey",
            "sorcerer-3-draconic",
            "draconic-ancestor",
            "fighter-3-battle-master-student",
            "battle-master-student",
            "monk-3-open-hand",
            "open-hand-technique",
            "ranger-3-fey-wanderer",
            "fey-wanderer-glamour",
            "warlock-3-archfey",
            "archfey-steps",
            "druid-3-stars",
            "starry-form",
            "druid-3-sea",
            "sea-wrath",
            "druid-3-moon",
            "moon-forms",
            "rogue-5-cunning-strike",
            "cunning-strike",
            "druid-6-land",
            "land-biome",
            "barbarian-6-wild-heart",
            "wild-heart-aspect",
            "ranger-6-hunter",
            "hunter-defense",
            "cleric-6-war",
            "war-god-blessing",
            "druid-7",
            "elemental-fury",
            "cleric-7",
            "blessed-strikes",
            "fighter-7-champion",
            "champion-fighting-style",
            "fighter-7-psi-warrior",
            "psi-warrior-thrust",
            "barbarian-9-brutal-strike",
            "brutal-strike",
            "fighter-9-tactical-master",
            "tactical-master",
            "warlock-10-fiend",
            "fiend-resilience",
            "barbarian-10-world-tree",
            "world-tree-roots",
            "wizard-10-diviner",
            "diviner-third-eye",
            "barbarian-13-brutal-strike",
            "improved-brutal-strike",
            "barbarian-14-wild-heart",
            "wild-heart-totem",
            "rogue-14-devious-strike",
            "devious-strike",
            "sorcerer-14-aberrant",
            "aberrant-revelation",
            "ranger-15-hunter",
            "hunter-superior-defense"
        ]);

        for (const ch of dynamicChoices) {
            const chId = ch.choiceId || ch.id || "";
            if (
                handledChoiceKeys.has(chId) ||
                (ch.id && handledChoiceKeys.has(ch.id)) ||
                chId.startsWith("eldritch-invocation") ||
                chId.startsWith("metamagic-") ||
                ch.name === "Eldritch Invocations"
            ) continue;
            const currentChoice = ctx.state.subclassFeatureChoices?.[chId] || "";
            const dynDesc = ch.description || ch.prompt || getClsFeatureDesc(ch.name || "", "", lvl) || getSubFeatureDesc(ch.name || "", "");
            choices.push(`
                <div class="level-choice-box">
                    <h5 class="level-choice-title"><i class="fa-solid fa-code-branch"></i> ${ch.name} (Choose ${ch.chooseCount || 1})</h5>
                    ${dynDesc ? `<p class="card-body">${dynDesc}</p>` : ""}
                    <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                        ${(ch.options || []).map((opt: any) => `
                            <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="${chId}" data-feature-choice="${opt.id}">
                                <div class="card-title-row">
                                    <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                                <p class="card-body">${opt.description}</p>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `);
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

        const isFeatureCoveredByChoiceBox = (f: ClassLevelFeature & { isSubclassFeature?: boolean }, lvl: number): boolean => {
            const rawName = String(f.name || "").trim();
            const suffix = sub?.name ? ` (${sub.name})` : "";
            const strippedSub = suffix && rawName.endsWith(suffix)
                ? rawName.slice(0, -suffix.length).trim()
                : rawName;
            const baseLower = strippedSub.toLowerCase();
            const normLower = baseLower.replace(/\s*\([^)]+\)\s*$/, "").trim();

            // Multi-level / scaling choice pools (rendered as a single .level-choice-box)
            if (cls.id === "warlock" && (baseLower.startsWith("eldritch invocation") || normLower === "eldritch invocations")) {
                return true;
            }
            if (cls.id === "sorcerer" && (baseLower.startsWith("metamagic") || normLower === "metamagic")) {
                return true;
            }
            if (cls.weaponMasteryCount > 0 && (baseLower.startsWith("weapon mastery") || normLower === "weapon mastery")) {
                return true;
            }
            if (cls.id === "fighter" && resolvedSubId === "battle-master" && (normLower === "combat superiority" || baseLower.startsWith("additional maneuvers"))) {
                return true;
            }

            // Level-specific class feature choice boxes
            if (lvl === 1) {
                if (cls.id === "fighter" && normLower === "fighting style") return true;
                if (cls.id === "cleric" && normLower === "divine order") return true;
                if (cls.id === "druid" && normLower === "primal order") return true;
            }
            if (lvl === 2) {
                if ((cls.id === "paladin" || cls.id === "ranger") && normLower === "fighting style") return true;
                if (cls.id === "wizard" && normLower === "scholar") return true;
            }
            if (lvl === 3) {
                if (cls.subclasses && cls.subclasses.length > 0 && normLower.endsWith(" subclass")) return true;
                if (cls.id === "fighter" && resolvedSubId === "battle-master" && normLower === "student of war") return true;
                if (cls.id === "barbarian" && resolvedSubId === "wild-heart" && normLower === "rage of the wilds") return true;
                if (cls.id === "barbarian" && resolvedSubId === "zealot" && normLower === "divine fury") return true;
                if (cls.id === "monk" && resolvedSubId === "elements" && normLower === "elemental attunement") return true;
                if (cls.id === "monk" && resolvedSubId === "open-hand" && normLower === "open hand technique") return true;
                if (cls.id === "ranger" && resolvedSubId === "beast-master" && normLower === "primal companion") return true;
                if (cls.id === "ranger" && resolvedSubId === "hunter" && normLower === "hunter's prey") return true;
                if (cls.id === "ranger" && resolvedSubId === "fey-wanderer" && normLower === "otherworldly glamour") return true;
                if (cls.id === "sorcerer" && resolvedSubId === "draconic" && normLower === "draconic ancestor") return true;
                if (cls.id === "warlock" && resolvedSubId === "archfey" && normLower === "steps of the fey") return true;
                if (cls.id === "druid" && resolvedSubId === "stars" && normLower === "starry form") return true;
                if (cls.id === "druid" && resolvedSubId === "sea" && normLower === "wrath of the sea") return true;
                if (cls.id === "druid" && resolvedSubId === "moon" && normLower === "circle forms") return true;
            }
            if (lvl === 5) {
                if (cls.id === "rogue" && normLower === "cunning strike") return true;
            }
            if (lvl === 6) {
                if (cls.id === "barbarian" && resolvedSubId === "wild-heart" && normLower === "aspect of the beast") return true;
                if (cls.id === "cleric" && resolvedSubId === "war" && normLower === "war god's blessing") return true;
                if (cls.id === "bard" && resolvedSubId === "lore" && normLower === "magical discoveries") return true;
            }
            if (lvl === 7) {
                if (cls.id === "druid" && normLower === "elemental fury") return true;
                if (cls.id === "cleric" && normLower === "blessed strikes") return true;
                if (cls.id === "ranger" && resolvedSubId === "hunter" && normLower === "defensive tactics") return true;
                if (cls.id === "fighter" && resolvedSubId === "champion" && normLower === "additional fighting style") return true;
                if (cls.id === "fighter" && resolvedSubId === "psi-warrior" && (normLower === "telekinetic adept" || normLower === "telekinetic thrust")) return true;
            }
            if (lvl === 9) {
                if (cls.id === "barbarian" && normLower === "brutal strike") return true;
                if (cls.id === "fighter" && normLower === "tactical master") return true;
            }
            if (lvl === 10) {
                if (cls.id === "warlock" && resolvedSubId === "fiend" && normLower === "fiendish resilience") return true;
                if (cls.id === "barbarian" && resolvedSubId === "world-tree" && normLower === "battering roots") return true;
                if (cls.id === "wizard" && resolvedSubId === "diviner" && normLower === "the third eye") return true;
            }
            if (lvl === 11 || lvl === 13 || lvl === 15 || lvl === 17) {
                if (cls.id === "warlock" && (baseLower.startsWith("mystic arcanum") || normLower === "mystic arcanum")) return true;
            }
            if (lvl === 13) {
                if (cls.id === "barbarian" && normLower === "improved brutal strike") return true;
            }
            if (lvl === 14) {
                if (cls.id === "barbarian" && resolvedSubId === "wild-heart" && normLower === "totemic attunement") return true;
                if (cls.id === "rogue" && (normLower === "devious strikes" || normLower === "devious strike")) return true;
                if (cls.id === "sorcerer" && resolvedSubId === "aberrant" && normLower === "revelation in flesh") return true;
            }
            if (lvl === 15) {
                if (cls.id === "ranger" && resolvedSubId === "hunter" && normLower === "superior hunter's defense") return true;
            }
            if (lvl === 18) {
                if (cls.id === "wizard" && normLower === "spell mastery") return true;
            }
            if (lvl === 20) {
                if (cls.id === "wizard" && normLower === "signature spells") return true;
            }

            return false;
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
                    <div class="level-card-header" role="button" tabindex="0" title="Click to ${isCollapsed ? "expand" : "collapse"} Level ${lvl} details">
                        <div class="level-header-title">
                            <span class="progression-lvl-badge ${isUnlocked ? "badge-unlocked" : "badge-locked"}" role="button" tabindex="0" title="${isUnlocked ? (lvl === charLevel ? `Click to lock ${cls.name} Level ${lvl}` : `Click to set ${cls.name} to Level ${lvl}`) : `Click to unlock ${cls.name} Level ${lvl}`}" data-class-index="${classIdx}" data-level="${lvl}">
                                ${isUnlocked ? `<i class="fa-solid fa-check"></i>` : `<i class="fa-solid fa-lock"></i>`} Level ${lvl}
                            </span>
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
