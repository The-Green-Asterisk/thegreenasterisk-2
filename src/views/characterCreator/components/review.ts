import { escapeHtml } from "@services/escape";
import { SPELLS_2024 } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";
import { getProgressionChoices, getProgressionPools } from "../services/progressionModifiers";

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
                    <div class="review-row"><span class="label">Name:</span><strong>${escapeHtml(ctx.state.name)}</strong></div>
                    <div class="review-row"><span class="label">Class & Level:</span><strong>${cls} (Level ${ctx.state.level})</strong></div>
                    ${ctx.state.subclassId ? `<div class="review-row"><span class="label">Subclass:</span><strong>${escapeHtml(currentClsDef?.subclasses.find((s) => s.id === ctx.state.subclassId)?.name || ctx.state.subclassId)}</strong></div>` : ""}
                    <div class="review-row"><span class="label">Species:</span><strong>${escapeHtml(species)}</strong></div>
                    <div class="review-row"><span class="label">Background:</span><strong>${bg}</strong></div>
                    <div class="review-row"><span class="label">Origin Feat:</span><strong>${feat}</strong></div>
                    <div class="review-row"><span class="label">Alignment:</span><strong>${escapeHtml(ctx.state.alignment)}</strong></div>
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
                    ${getProgressionChoices(ctx).filter((e) => e.unlocked && e.selectedOptions.length > 0).map((e) =>
                        `<div class="review-row"><span class="label">${escapeHtml(e.choice.name)}${e.isSubclass ? ` (${e.sourceName})` : ""}:</span><strong>${e.selectedOptions.map((o) => escapeHtml(o.name)).join(", ")}</strong></div>`
                    ).join("")}
                    ${getProgressionPools(ctx).map((p) => {
                        const picked = ((ctx.state as any)[p.pool] as string[] | undefined) || [];
                        if (picked.length === 0) return "";
                        const names = picked.map((id) => p.options.find((o) => o.id === id)?.name || id);
                        return `<div class="review-row"><span class="label">${escapeHtml(p.name)}${p.isSubclass ? ` (${p.sourceName})` : ""}:</span><strong>${names.join(", ")}</strong></div>`;
                    }).join("")}
                    ${ctx.state.expertiseSkills.length > 0 ? `<div class="review-row"><span class="label">Expertise Skills:</span><strong>${ctx.state.expertiseSkills.join(", ")}</strong></div>` : ""}
                    ${ctx.getAsiSlots().length > 0 ? `
                        <div class="review-row" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                            <span class="label">Ability Improvements & Feats:</span>
                            ${ctx.getAsiSlots().map((slot) => {
                                const ch = ctx.state.asiChoices[slot.key];
                                const where = ctx.state.classes.length > 1 ? `${slot.className} ${slot.classLevel}` : `Level ${slot.classLevel}`;
                                if (!ch) return `<div>• ${where}: Standard Increase</div>`;
                                if (ch.type === "single") return `<div>• ${where}: ${ch.statA ? `+2 ${ch.statA.toUpperCase()}` : "Not chosen"}</div>`;
                                if (ch.type === "dual") return `<div>• ${where}: +1 ${ch.statA?.toUpperCase()}, +1 ${ch.statB?.toUpperCase()}</div>`;
                                const fDef = ctx.generalFeats.find((f) => f.id === ch.featId);
                                return `<div>• ${where}: Feat (${escapeHtml(fDef?.name || ch.featId)})${ch.statA ? ` [+1 ${ch.statA.toUpperCase()}]` : ""}</div>`;
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
                            return `<div class="review-row"><span class="label">${prefix}Cantrips (${sel.cantrips.length}/${b.maxCantrips}):</span><strong>${sel.cantrips.map((n) => escapeHtml(n + note(n))).join(", ") || "None"}</strong></div>
                    <div class="review-row"><span class="label">${prefix}Prepared Spells (${sel.prepared.length}/${b.maxPrepared}):</span><strong>${sel.prepared.map((n) => escapeHtml(withLevel(n) + note(n))).join(", ") || "None"}</strong></div>`;
                        }).join("");
                    })()}
                    ${ctx.getFeatureSpellChoiceSections().map((sec) => {
                        const chosen = ctx.state.featureSpellChoices[sec.id] || [];
                        return `<div class="review-row"><span class="label">${escapeHtml(sec.title)} (${chosen.length}/${sec.chooseCount}):</span><strong>${chosen.join(", ") || "None"}</strong></div>`;
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
                            return `<div class="review-row"><span class="label">Spellcasting:</span><strong>${casterStats.map((c: any) => `${escapeHtml(c.className)}: ${c.ability.toUpperCase()} (Save DC: ${c.saveDc}, Atk: +${c.attackMod}, Max Spell Lvl: ${c.maxSpellLevel})`).join(" | ")} • Slots: ${ctx.getSpellSlotsSummary()}</strong></div>`;
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
