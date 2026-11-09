import {
    ABERRANT_REVELATION_OPTIONS,
    BARBARIAN_ASPECTS,
    BATTERING_ROOTS_OPTIONS,
    BATTLE_MASTER_MANEUVERS,
    BLESSED_STRIKES_OPTIONS,
    BRUTAL_STRIKE_OPTIONS,
    CHAMPION_ADDITIONAL_FIGHTING_STYLES,
    DIVINE_ORDERS,
    DIVINER_THIRD_EYE_OPTIONS,
    DRACONIC_ANCESTOR_ELEMENTS,
    DRUID_LAND_BIOMES,
    ELEMENTAL_FURY_OPTIONS,
    ELEMENTS_ATTUNEMENT_DAMAGE_TYPES,
    ELDRITCH_INVOCATIONS,
    FEY_WANDERER_GLAMOUR_SKILLS,
    FIENDISH_RESILIENCE_DAMAGE_TYPES,
    FIGHTING_STYLES,
    HUNTER_DEFENSIVE_TACTICS,
    HUNTER_PREY_OPTIONS,
    HUNTER_SUPERIOR_DEFENSE_OPTIONS,
    IMPROVED_BRUTAL_STRIKE_OPTIONS,
    METAMAGIC_OPTIONS,
    MOON_CIRCLE_FORMS_STRIKES,
    OPEN_HAND_TECHNIQUES,
    PRIMAL_COMPANION_TYPES,
    PRIMAL_ORDERS,
    PSI_WARRIOR_THRUST_OPTIONS,
    ROGUE_CUNNING_STRIKES,
    ROGUE_DEVIOUS_STRIKES,
    SEA_WRATH_DAMAGE_TYPES,
    SPELLS_2024,
    STARRY_FORM_CONSTELLATIONS,
    STEPS_OF_THE_FEY_OPTIONS,
    STUDENT_OF_WAR_SKILLS,
    TACTICAL_MASTER_PROPERTIES,
    WAR_GOD_BLESSING_OPTIONS,
    WILD_HEART_RAGES,
    WILD_HEART_TOTEMIC_ATTUNEMENTS,
    WIZARD_SCHOLAR_SKILLS,
    ZEALOT_DIVINE_FURIES,
    findClassOption
} from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";

export function renderStep9Review(ctx: CharacterCreatorContext): string {
    ctx.sanitizeSpellSelections();
    const species = ctx.species.find((s) => s.id === ctx.state.speciesId)?.name || "";
    const currentClsDef = ctx.classes.find((c) => c.id === ctx.state.classId);
    const cls = currentClsDef?.name || "";
    const bg = ctx.backgrounds.find((b) => b.id === ctx.state.backgroundId)?.name || "";
    const feat = ctx.originFeats.find((f) => f.id === ctx.state.originFeatId)?.name || "";
    const spellAbility = ctx.getSpellcastingAbility();

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">${ctx.state.savedId ? "Review & Save Character Changes" : "Review & Finalize Character"}</h3>
                <p class="panel-desc">Inspect your completed character profile before saving to the database.</p>
            </div>

            <div class="review-card-layout">
                <div class="review-section">
                    <h4>Hero Overview</h4>
                    <div class="review-row"><span class="label">Name:</span><strong>${ctx.state.name}</strong></div>
                    <div class="review-row"><span class="label">Class & Level:</span><strong>${cls} (Level ${ctx.state.level})</strong></div>
                    ${ctx.state.subclassId ? `<div class="review-row"><span class="label">Subclass:</span><strong>${currentClsDef?.subclasses.find((s) => s.id === ctx.state.subclassId)?.name || ctx.state.subclassId}</strong></div>` : ""}
                    <div class="review-row"><span class="label">Species:</span><strong>${species}</strong></div>
                    <div class="review-row"><span class="label">Background:</span><strong>${bg}</strong></div>
                    <div class="review-row"><span class="label">Origin Feat:</span><strong>${feat}</strong></div>
                    <div class="review-row"><span class="label">Alignment:</span><strong>${ctx.state.alignment}</strong></div>
                    <div class="review-row"><span class="label">Armor & Shield:</span><strong>${ctx.state.selectedArmor} ${ctx.state.hasShield ? "+ Shield" : ""}</strong></div>
                    <div class="review-row"><span class="label">Mastered Weapons:</span><strong>${ctx.state.weaponMasteries.join(", ") || "None"}</strong></div>
                </div>

                <div class="review-section">
                    <h4>Combat Vitals</h4>
                    <div class="review-row"><span class="label">Hit Points:</span><strong>${ctx.getMaxHp()} Max HP</strong></div>
                    <div class="review-row"><span class="label">Armor Class:</span><strong>${ctx.getArmorClass()} AC</strong></div>
                    <div class="review-row"><span class="label">Initiative:</span><strong>${(ctx.getInitiative() >= 0 ? "+" : "") + ctx.getInitiative()}</strong></div>
                    <div class="review-row"><span class="label">Speed:</span><strong>${ctx.getSpeedDisplay()}</strong></div>
                    <div class="review-row"><span class="label">Proficiency Bonus:</span><strong>+${ctx.getProficiencyBonus()}</strong></div>
                </div>

                <div class="review-section">
                    <h4>Class & Progression Features</h4>
                    ${ctx.state.fightingStyle ? `<div class="review-row"><span class="label">Fighting Style:</span><strong>${FIGHTING_STYLES.find((f) => f.id === ctx.state.fightingStyle)?.name || ctx.state.fightingStyle}</strong></div>` : ""}
                    ${ctx.state.divineOrder ? `<div class="review-row"><span class="label">Divine Order:</span><strong>${DIVINE_ORDERS.find((o) => o.id === ctx.state.divineOrder)?.name || ctx.state.divineOrder}</strong></div>` : ""}
                    ${ctx.state.primalOrder ? `<div class="review-row"><span class="label">Primal Order:</span><strong>${PRIMAL_ORDERS.find((o) => o.id === ctx.state.primalOrder)?.name || ctx.state.primalOrder}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["wizard-2-scholar"] && ctx.state.classId === "wizard" && ctx.state.level >= 2 ? `<div class="review-row"><span class="label">Scholar:</span><strong>${WIZARD_SCHOLAR_SKILLS.find((s) => s.id === ctx.state.subclassFeatureChoices["wizard-2-scholar"])?.name || ctx.state.subclassFeatureChoices["wizard-2-scholar"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-3-wild-heart"] && ctx.state.classId === "barbarian" && ctx.state.subclassId === "wild-heart" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Rage of the Wilds:</span><strong>${WILD_HEART_RAGES.find((r) => r.id === ctx.state.subclassFeatureChoices["barbarian-3-wild-heart"])?.name || ctx.state.subclassFeatureChoices["barbarian-3-wild-heart"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-3-zealot"] && ctx.state.classId === "barbarian" && ctx.state.subclassId === "zealot" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Divine Fury:</span><strong>${ZEALOT_DIVINE_FURIES.find((z) => z.id === ctx.state.subclassFeatureChoices["barbarian-3-zealot"])?.name || ctx.state.subclassFeatureChoices["barbarian-3-zealot"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["monk-3-elements"] && ctx.state.classId === "monk" && ctx.state.subclassId === "warrior-of-elements" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Elemental Attunement:</span><strong>${ELEMENTS_ATTUNEMENT_DAMAGE_TYPES.find((d) => d.id === ctx.state.subclassFeatureChoices["monk-3-elements"])?.name || ctx.state.subclassFeatureChoices["monk-3-elements"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["ranger-3-beast-master"] && ctx.state.classId === "ranger" && ctx.state.subclassId === "beast-master" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Primal Companion:</span><strong>${PRIMAL_COMPANION_TYPES.find((p) => p.id === ctx.state.subclassFeatureChoices["ranger-3-beast-master"])?.name || ctx.state.subclassFeatureChoices["ranger-3-beast-master"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["ranger-3-hunter"] && ctx.state.classId === "ranger" && ctx.state.subclassId === "hunter" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Hunter's Prey:</span><strong>${HUNTER_PREY_OPTIONS.find((h) => h.id === ctx.state.subclassFeatureChoices["ranger-3-hunter"])?.name || ctx.state.subclassFeatureChoices["ranger-3-hunter"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["fighter-3-battle-master-student"] && ctx.state.classId === "fighter" && ctx.state.subclassId === "battle-master" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Student of War:</span><strong>${STUDENT_OF_WAR_SKILLS.find((s) => s.id === ctx.state.subclassFeatureChoices["fighter-3-battle-master-student"])?.name || ctx.state.subclassFeatureChoices["fighter-3-battle-master-student"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["monk-3-open-hand"] && ctx.state.classId === "monk" && ctx.state.subclassId === "open-hand" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Open Hand Technique:</span><strong>${OPEN_HAND_TECHNIQUES.find((t) => t.id === ctx.state.subclassFeatureChoices["monk-3-open-hand"])?.name || ctx.state.subclassFeatureChoices["monk-3-open-hand"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["ranger-3-fey-wanderer"] && ctx.state.classId === "ranger" && ctx.state.subclassId === "fey-wanderer" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Otherworldly Glamour:</span><strong>${FEY_WANDERER_GLAMOUR_SKILLS.find((f) => f.id === ctx.state.subclassFeatureChoices["ranger-3-fey-wanderer"])?.name || ctx.state.subclassFeatureChoices["ranger-3-fey-wanderer"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["warlock-3-archfey"] && ctx.state.classId === "warlock" && ctx.state.subclassId === "archfey" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Steps of the Fey:</span><strong>${STEPS_OF_THE_FEY_OPTIONS.find((s) => s.id === ctx.state.subclassFeatureChoices["warlock-3-archfey"])?.name || ctx.state.subclassFeatureChoices["warlock-3-archfey"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["druid-3-stars"] && ctx.state.classId === "druid" && ctx.state.subclassId === "circle-of-stars" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Starry Form:</span><strong>${STARRY_FORM_CONSTELLATIONS.find((c) => c.id === ctx.state.subclassFeatureChoices["druid-3-stars"])?.name || ctx.state.subclassFeatureChoices["druid-3-stars"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["druid-3-sea"] && ctx.state.classId === "druid" && ctx.state.subclassId === "circle-of-the-sea" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Wrath of the Sea:</span><strong>${SEA_WRATH_DAMAGE_TYPES.find((d) => d.id === ctx.state.subclassFeatureChoices["druid-3-sea"])?.name || ctx.state.subclassFeatureChoices["druid-3-sea"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["druid-3-moon"] && ctx.state.classId === "druid" && ctx.state.subclassId === "circle-of-the-moon" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Circle Forms:</span><strong>${MOON_CIRCLE_FORMS_STRIKES.find((m) => m.id === ctx.state.subclassFeatureChoices["druid-3-moon"])?.name || ctx.state.subclassFeatureChoices["druid-3-moon"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["sorcerer-3-draconic"] && ctx.state.classId === "sorcerer" && ctx.state.subclassId === "draconic" && ctx.state.level >= 3 ? `<div class="review-row"><span class="label">Draconic Ancestor:</span><strong>${DRACONIC_ANCESTOR_ELEMENTS.find((e) => e.id === ctx.state.subclassFeatureChoices["sorcerer-3-draconic"])?.name || ctx.state.subclassFeatureChoices["sorcerer-3-draconic"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["rogue-5-cunning-strike"] && ctx.state.classId === "rogue" && ctx.state.level >= 5 ? `<div class="review-row"><span class="label">Cunning Strike:</span><strong>${ROGUE_CUNNING_STRIKES.find((c) => c.id === ctx.state.subclassFeatureChoices["rogue-5-cunning-strike"])?.name || ctx.state.subclassFeatureChoices["rogue-5-cunning-strike"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["druid-6-land"] && ctx.state.classId === "druid" && ctx.state.subclassId === "circle-of-the-land" && ctx.state.level >= 6 ? `<div class="review-row"><span class="label">Land's Aid Biome:</span><strong>${DRUID_LAND_BIOMES.find((b) => b.id === ctx.state.subclassFeatureChoices["druid-6-land"])?.name || ctx.state.subclassFeatureChoices["druid-6-land"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["cleric-6-war"] && ctx.state.classId === "cleric" && ctx.state.subclassId === "war-domain" && ctx.state.level >= 6 ? `<div class="review-row"><span class="label">War God's Blessing:</span><strong>${WAR_GOD_BLESSING_OPTIONS.find((w) => w.id === ctx.state.subclassFeatureChoices["cleric-6-war"])?.name || ctx.state.subclassFeatureChoices["cleric-6-war"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-6-wild-heart"] && ctx.state.classId === "barbarian" && ctx.state.subclassId === "wild-heart" && ctx.state.level >= 6 ? `<div class="review-row"><span class="label">Aspect of the Wilds:</span><strong>${BARBARIAN_ASPECTS.find((a) => a.id === ctx.state.subclassFeatureChoices["barbarian-6-wild-heart"])?.name || ctx.state.subclassFeatureChoices["barbarian-6-wild-heart"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["ranger-6-hunter"] && ctx.state.classId === "ranger" && ctx.state.subclassId === "hunter" && ctx.state.level >= 6 ? `<div class="review-row"><span class="label">Defensive Tactics:</span><strong>${HUNTER_DEFENSIVE_TACTICS.find((h) => h.id === ctx.state.subclassFeatureChoices["ranger-6-hunter"])?.name || ctx.state.subclassFeatureChoices["ranger-6-hunter"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["druid-7"] && ctx.state.classId === "druid" && ctx.state.level >= 7 ? `<div class="review-row"><span class="label">Elemental Fury:</span><strong>${ELEMENTAL_FURY_OPTIONS.find((e) => e.id === ctx.state.subclassFeatureChoices["druid-7"])?.name || ctx.state.subclassFeatureChoices["druid-7"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["cleric-7"] && ctx.state.classId === "cleric" && ctx.state.level >= 7 ? `<div class="review-row"><span class="label">Blessed Strikes:</span><strong>${BLESSED_STRIKES_OPTIONS.find((b) => b.id === ctx.state.subclassFeatureChoices["cleric-7"])?.name || ctx.state.subclassFeatureChoices["cleric-7"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["fighter-7-champion"] && ctx.state.classId === "fighter" && ctx.state.subclassId === "champion" && ctx.state.level >= 7 ? `<div class="review-row"><span class="label">Additional Fighting Style:</span><strong>${CHAMPION_ADDITIONAL_FIGHTING_STYLES.find((c) => c.id === ctx.state.subclassFeatureChoices["fighter-7-champion"])?.name || ctx.state.subclassFeatureChoices["fighter-7-champion"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["fighter-7-psi-warrior"] && ctx.state.classId === "fighter" && ctx.state.subclassId === "psi-warrior" && ctx.state.level >= 7 ? `<div class="review-row"><span class="label">Psi-Powered Leap/Thrust:</span><strong>${PSI_WARRIOR_THRUST_OPTIONS.find((p) => p.id === ctx.state.subclassFeatureChoices["fighter-7-psi-warrior"])?.name || ctx.state.subclassFeatureChoices["fighter-7-psi-warrior"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-9-brutal-strike"] && ctx.state.classId === "barbarian" && ctx.state.level >= 9 ? `<div class="review-row"><span class="label">Brutal Strike:</span><strong>${BRUTAL_STRIKE_OPTIONS.find((b) => b.id === ctx.state.subclassFeatureChoices["barbarian-9-brutal-strike"])?.name || ctx.state.subclassFeatureChoices["barbarian-9-brutal-strike"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["fighter-9-tactical-master"] && ctx.state.classId === "fighter" && ctx.state.level >= 9 ? `<div class="review-row"><span class="label">Tactical Master:</span><strong>${TACTICAL_MASTER_PROPERTIES.find((t) => t.id === ctx.state.subclassFeatureChoices["fighter-9-tactical-master"])?.name || ctx.state.subclassFeatureChoices["fighter-9-tactical-master"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-10-world-tree"] && ctx.state.classId === "barbarian" && ctx.state.subclassId === "world-tree" && ctx.state.level >= 10 ? `<div class="review-row"><span class="label">Battering Roots:</span><strong>${BATTERING_ROOTS_OPTIONS.find((b) => b.id === ctx.state.subclassFeatureChoices["barbarian-10-world-tree"])?.name || ctx.state.subclassFeatureChoices["barbarian-10-world-tree"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["warlock-10-fiend"] && ctx.state.classId === "warlock" && ctx.state.subclassId === "fiend" && ctx.state.level >= 10 ? `<div class="review-row"><span class="label">Fiendish Resilience:</span><strong>${FIENDISH_RESILIENCE_DAMAGE_TYPES.find((f) => f.id === ctx.state.subclassFeatureChoices["warlock-10-fiend"])?.name || ctx.state.subclassFeatureChoices["warlock-10-fiend"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["wizard-10-diviner"] && ctx.state.classId === "wizard" && ctx.state.subclassId === "diviner" && ctx.state.level >= 10 ? `<div class="review-row"><span class="label">The Third Eye:</span><strong>${DIVINER_THIRD_EYE_OPTIONS.find((d) => d.id === ctx.state.subclassFeatureChoices["wizard-10-diviner"])?.name || ctx.state.subclassFeatureChoices["wizard-10-diviner"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-13-brutal-strike"] && ctx.state.classId === "barbarian" && ctx.state.level >= 13 ? `<div class="review-row"><span class="label">Improved Brutal Strike:</span><strong>${IMPROVED_BRUTAL_STRIKE_OPTIONS.find((b) => b.id === ctx.state.subclassFeatureChoices["barbarian-13-brutal-strike"])?.name || ctx.state.subclassFeatureChoices["barbarian-13-brutal-strike"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["barbarian-14-wild-heart"] && ctx.state.classId === "barbarian" && ctx.state.subclassId === "wild-heart" && ctx.state.level >= 14 ? `<div class="review-row"><span class="label">Totemic Attunement:</span><strong>${WILD_HEART_TOTEMIC_ATTUNEMENTS.find((t) => t.id === ctx.state.subclassFeatureChoices["barbarian-14-wild-heart"])?.name || ctx.state.subclassFeatureChoices["barbarian-14-wild-heart"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["rogue-14-devious-strike"] && ctx.state.classId === "rogue" && ctx.state.level >= 14 ? `<div class="review-row"><span class="label">Devious Strike:</span><strong>${ROGUE_DEVIOUS_STRIKES.find((d) => d.id === ctx.state.subclassFeatureChoices["rogue-14-devious-strike"])?.name || ctx.state.subclassFeatureChoices["rogue-14-devious-strike"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["sorcerer-14-aberrant"] && ctx.state.classId === "sorcerer" && ctx.state.subclassId === "aberrant" && ctx.state.level >= 14 ? `<div class="review-row"><span class="label">Revelation in Flesh:</span><strong>${ABERRANT_REVELATION_OPTIONS.find((a) => a.id === ctx.state.subclassFeatureChoices["sorcerer-14-aberrant"])?.name || ctx.state.subclassFeatureChoices["sorcerer-14-aberrant"]}</strong></div>` : ""}
                    ${ctx.state.subclassFeatureChoices?.["ranger-15-hunter"] && ctx.state.classId === "ranger" && ctx.state.subclassId === "hunter" && ctx.state.level >= 15 ? `<div class="review-row"><span class="label">Superior Hunter's Defense:</span><strong>${HUNTER_SUPERIOR_DEFENSE_OPTIONS.find((o) => o.id === ctx.state.subclassFeatureChoices["ranger-15-hunter"])?.name || ctx.state.subclassFeatureChoices["ranger-15-hunter"]}</strong></div>` : ""}
                    ${ctx.state.metamagic.length > 0 ? `<div class="review-row"><span class="label">Metamagic:</span><strong>${ctx.state.metamagic.map((m) => METAMAGIC_OPTIONS.find((o) => o.id === m)?.name || m).join(", ")}</strong></div>` : ""}
                    ${ctx.state.invocations.length > 0 ? `<div class="review-row"><span class="label">Invocations:</span><strong>${ctx.state.invocations.map((i) => ELDRITCH_INVOCATIONS.find((o) => o.id === i)?.name || i).join(", ")}</strong></div>` : ""}
                    ${ctx.state.maneuvers.length > 0 ? `<div class="review-row"><span class="label">Maneuvers:</span><strong>${ctx.state.maneuvers.map((m) => BATTLE_MASTER_MANEUVERS.find((o) => o.id === m)?.name || m).join(", ")}</strong></div>` : ""}
                    ${(() => {
                        const handledReviewKeys = new Set([
                            "wizard-2-scholar", "barbarian-3-wild-heart", "barbarian-3-zealot", "monk-3-elements",
                            "ranger-3-beast-master", "ranger-3-hunter", "fighter-3-battle-master-student", "monk-3-open-hand",
                            "ranger-3-fey-wanderer", "warlock-3-archfey", "druid-3-stars", "druid-3-sea", "druid-3-moon",
                            "sorcerer-3-draconic", "rogue-5-cunning-strike", "druid-6-land", "cleric-6-war", "barbarian-6-wild-heart",
                            "ranger-6-hunter", "druid-7", "cleric-7", "fighter-7-champion", "fighter-7-psi-warrior",
                            "barbarian-9-brutal-strike", "fighter-9-tactical-master", "barbarian-10-world-tree", "warlock-10-fiend",
                            "wizard-10-diviner", "barbarian-13-brutal-strike", "barbarian-14-wild-heart", "rogue-14-devious-strike",
                            "sorcerer-14-aberrant", "ranger-15-hunter"
                        ]);
                        const rows: string[] = [];
                        if (ctx.state.subclassFeatureChoices) {
                            for (const [key, val] of Object.entries(ctx.state.subclassFeatureChoices)) {
                                if (handledReviewKeys.has(key)) continue;
                                const opt = findClassOption(key, val);
                                if (opt) {
                                    rows.push(`<div class="review-row"><span class="label">${opt.name}:</span><strong>Selected</strong></div>`);
                                }
                            }
                        }
                        return rows.join("");
                    })()}
                    ${ctx.state.expertiseSkills.length > 0 ? `<div class="review-row"><span class="label">Expertise Skills:</span><strong>${ctx.state.expertiseSkills.join(", ")}</strong></div>` : ""}
                    ${ctx.getAsiLevels().length > 0 ? `
                        <div class="review-row" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                            <span class="label">Ability Improvements & Feats:</span>
                            ${ctx.getAsiLevels().map((lvl) => {
                                const ch = ctx.state.asiChoices[lvl];
                                if (!ch) return `<div>• Level ${lvl}: Standard Increase</div>`;
                                if (ch.type === "single") return `<div>• Level ${lvl}: +2 ${ch.statA?.toUpperCase()}</div>`;
                                if (ch.type === "dual") return `<div>• Level ${lvl}: +1 ${ch.statA?.toUpperCase()}, +1 ${ch.statB?.toUpperCase()}</div>`;
                                const fDef = ctx.generalFeats.find((f) => f.id === ch.featId);
                                return `<div>• Level ${lvl}: Feat (${fDef?.name || ch.featId}) [+1 ${ch.statA?.toUpperCase()}]</div>`;
                            }).join("")}
                        </div>
                    ` : ""}
                </div>

                <div class="review-section" style="grid-column: 1 / -1;">
                    <h4>Magic & Spells</h4>
                    ${(() => {
                        const buckets = ctx.getSpellBuckets();
                        const withLevel = (name: string) => {
                            const sp = SPELLS_2024.find((s) => s.name === name);
                            return sp ? `${name} (Lvl ${sp.level})` : name;
                        };
                        if (buckets.length === 0) {
                            return `<div class="review-row"><span class="label">Cantrips (0/0):</span><strong>None</strong></div>
                    <div class="review-row"><span class="label">Prepared Spells (0/0):</span><strong>None</strong></div>`;
                        }
                        return buckets.map((b) => {
                            const sel = ctx.state.classSpellSelections?.[b.key] || { cantrips: [], prepared: [] };
                            const prefix = buckets.length > 1 ? `${b.label} ` : "";
                            const note = (name: string) => (b.via[name] ? ` [${b.via[name]}]` : "");
                            return `<div class="review-row"><span class="label">${prefix}Cantrips (${sel.cantrips.length}/${b.maxCantrips}):</span><strong>${sel.cantrips.map((n) => n + note(n)).join(", ") || "None"}</strong></div>
                    <div class="review-row"><span class="label">${prefix}Prepared Spells (${sel.prepared.length}/${b.maxPrepared}):</span><strong>${sel.prepared.map((n) => withLevel(n) + note(n)).join(", ") || "None"}</strong></div>`;
                        }).join("");
                    })()}
                    ${ctx.getFeatureSpellChoiceSections().map((sec) => {
                        const chosen = ctx.state.featureSpellChoices[sec.id] || [];
                        return `<div class="review-row"><span class="label">${sec.title} (${chosen.length}/${sec.chooseCount}):</span><strong>${chosen.join(", ") || "None"}</strong></div>`;
                    }).join("")}
                    ${(() => {
                        const grantedList: string[] = [];
                        for (const c of ctx.state.classes) {
                            const clsDef = ctx.classes.find((x) => x.id === c.classId);
                            const subDef = clsDef?.subclasses?.find((s) => s.id === c.subclassId);
                            for (const pl of clsDef?.progression || []) {
                                if (pl.level <= c.level) {
                                    for (const sp of pl.grantedSpells || []) {
                                        const name = typeof sp === "string" ? sp : (sp.name || sp.spellId);
                                        if (name && !grantedList.includes(name)) grantedList.push(name);
                                    }
                                }
                            }
                            for (const pl of subDef?.progression || []) {
                                if (pl.level <= c.level) {
                                    for (const sp of pl.grantedSpells || []) {
                                        const name = typeof sp === "string" ? sp : (sp.name || sp.spellId);
                                        if (name && !grantedList.includes(name)) grantedList.push(name);
                                    }
                                }
                            }
                        }
                        if (grantedList.length > 0) {
                            return `<div class="review-row"><span class="label">Granted Spells (Always Prepared):</span><strong>${grantedList.join(", ")}</strong></div>`;
                        }
                        return "";
                    })()}
                    ${(() => {
                        const casterStats = ctx.getSpellcasterStatsList();
                        if (casterStats.length > 0) {
                            return `<div class="review-row"><span class="label">Spellcasting:</span><strong>${casterStats.map((c: any) => `${c.className}: ${c.ability.toUpperCase()} (Save DC: ${c.saveDc}, Atk: +${c.attackMod}, Max Spell Lvl: ${c.maxSpellLevel})`).join(" | ")} • Slots: ${ctx.getSpellSlotsSummary()}</strong></div>`;
                        }
                        if (spellAbility) {
                            return `<div class="review-row"><span class="label">Spellcasting:</span><strong>${spellAbility.toUpperCase()} (Save DC: ${ctx.getSpellSaveDc()}, Attack: +${ctx.getSpellAttackModifier()}, Max Slot Level: ${ctx.getMaxSpellLevel()}, Slots: ${ctx.getSpellSlotsSummary()})</strong></div>`;
                        }
                        return "";
                    })()}
                </div>
            </div>
        </div>
    `;
}
