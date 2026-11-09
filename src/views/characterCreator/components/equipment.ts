import { BASE_ARMOR_2024, BASE_WEAPONS_2024 } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";

export function renderStep7Equipment(ctx: CharacterCreatorContext): string {
    const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
    const effectiveStr = ctx.getEffectiveAbilityScore("str");
    const selectedArmorDef = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor);
    const armorStatReq = ctx.getArmorStatRequirement(ctx.state.selectedArmor);
    const isArmorProficient = ctx.isProficientWithArmor(ctx.state.selectedArmor);
    const isShieldProficient = ctx.isProficientWithShield();

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Starting Equipment & Armor</h3>
                <p class="panel-desc">Select starting weapons, armor, and gear. Stat requirements and class proficiencies are evaluated live.</p>
            </div>

            ${cls && cls.startingEquipmentOptions && cls.startingEquipmentOptions.length > 0 ? `
                <div class="starting-packages-section">
                    <div class="starting-packages-header-row">
                        <h4 class="starting-packages-title"><i class="fa-solid fa-box-open"></i> ${cls.name} Starting Equipment Kits</h4>
                        ${(() => {
                            const eqIdx = cls.startingEquipmentOptions.findIndex((_, i) => ctx.isKitEquipped(i));
                            if (eqIdx >= 0) {
                                const eqOpt = cls.startingEquipmentOptions[eqIdx];
                                return `
                                    <div class="kit-equipped-banner">
                                        <i class="fa-solid fa-circle-check"></i>
                                        <span><strong>Option ${String.fromCharCode(65 + eqIdx)}: ${eqOpt.name}</strong> is equipped</span>
                                    </div>
                                `;
                            }
                            return "";
                        })()}
                    </div>
                    <div class="starting-packages-grid">
                        ${cls.startingEquipmentOptions.map((opt, idx) => {
                            const isEquipped = ctx.isKitEquipped(idx);
                            return `
                                <div class="starting-package-card ${isEquipped ? "equipped" : ""}" data-package-index="${idx}">
                                    <div class="package-card-header">
                                        <div class="package-card-title-group">
                                            <strong>Option ${String.fromCharCode(65 + idx)}: ${opt.name}</strong>
                                            ${isEquipped ? `<span class="package-equipped-badge"><i class="fa-solid fa-check"></i> Equipped</span>` : ""}
                                        </div>
                                        <button type="button" class="creator-nav-btn secondary-btn equip-package-btn ${isEquipped ? "equipped" : ""}" data-package-index="${idx}">
                                            ${isEquipped ? `<i class="fa-solid fa-circle-check"></i> Equipped` : `<i class="fa-solid fa-wand-magic-sparkles"></i> Equip Kit`}
                                        </button>
                                    </div>
                                    <ul class="package-items-list">
                                        ${opt.items.map((it) => `<li>${it}</li>`).join("")}
                                    </ul>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            ` : ""}

            <div class="creator-form-grid">
                <div class="creator-form-group">
                    <label class="creator-label" for="char-armor-select">Armor</label>
                    <select id="char-armor-select" class="creator-select">
                        <option value="None" ${ctx.state.selectedArmor === "None" ? "selected" : ""}>None (Unarmored: 10 + Dex)</option>
                        ${BASE_ARMOR_2024.map((a) => {
                            const reqStr = a.strengthRequired ? ` • Req STR ${a.strengthRequired}` : "";
                            const reqWarning = a.strengthRequired && effectiveStr < a.strengthRequired ? " [⚠️ -10ft Speed]" : "";
                            const profWarning = !ctx.isProficientWithArmor(a.name) ? " [⚠️ Non-Proficient]" : "";
                            return `
                                <option value="${a.name}" ${ctx.state.selectedArmor === a.name ? "selected" : ""}>
                                    ${a.name} (${a.category}, AC ${a.baseAc}${reqStr})${reqWarning}${profWarning}
                                </option>
                            `;
                        }).join("")}
                    </select>
                    ${armorStatReq && !armorStatReq.met ? `
                        <div class="equipment-stat-alert warning">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <div>
                                <strong>Strength Requirement Not Met:</strong> ${ctx.state.selectedArmor} requires <strong>Strength ${armorStatReq.required}</strong>, but your Strength is <strong>${armorStatReq.current}</strong>. Your movement speed is reduced by 10 ft (current Speed: <strong>${ctx.getSpeed()} ft.</strong>).
                            </div>
                        </div>
                    ` : armorStatReq && armorStatReq.met ? `
                        <div class="equipment-stat-alert success">
                            <i class="fa-solid fa-circle-check"></i>
                            <div>Meets Strength requirement (STR ${armorStatReq.current} ≥ ${armorStatReq.required}).</div>
                        </div>
                    ` : ""}
                    ${!isArmorProficient ? `
                        <div class="equipment-stat-alert danger">
                            <i class="fa-solid fa-shield-halved"></i>
                            <div><strong>Non-Proficient Armor:</strong> ${cls?.name || "Class"} lacks proficiency with ${selectedArmorDef?.category} armor. (Imposes Disadvantage on STR/DEX rolls and blocks spellcasting).</div>
                        </div>
                    ` : ""}
                </div>

                <div class="creator-form-group" style="justify-content: flex-start;">
                    <label class="creator-label">Shield</label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding-top: 0.5rem;">
                        <input type="checkbox" id="char-shield-checkbox" ${ctx.state.hasShield ? "checked" : ""} />
                        <strong>Equip Shield (+2 AC)</strong>
                    </label>
                    ${ctx.state.hasShield && !isShieldProficient ? `
                        <div class="equipment-stat-alert danger">
                            <i class="fa-solid fa-shield"></i>
                            <div><strong>Non-Proficient Shield:</strong> ${cls?.name || "Class"} lacks shield proficiency.</div>
                        </div>
                    ` : ""}
                </div>
            </div>

            <div class="creator-detail-box" style="margin-top: 1rem;">
                <h4>Select Weapons</h4>
                <p style="margin: 0.25rem 0 0.85rem 0; font-size: 0.84rem; color: var(--text-muted);">
                    In 2024 D&D rules, Heavy melee weapons require STR 13 and Heavy ranged weapons require DEX 13; lacking the required score imposes Disadvantage on attack rolls.
                </p>
                <div class="item-select-list">
                    ${BASE_WEAPONS_2024.map((w) => {
                        const isSelected = ctx.state.selectedWeapons.includes(w.name);
                        const statReq = ctx.getWeaponStatRequirement(w.name);
                        const isProf = ctx.isProficientWithWeapon(w.name);

                        return `
                            <div class="item-check-row weapon-row ${isSelected ? "selected" : ""}" data-weapon-name="${w.name}">
                                <div class="item-row-left">
                                    <div class="item-row-title">
                                        ${w.name} (${w.category})
                                        ${statReq ? (
                                            statReq.met
                                                ? `<span class="stat-req-pill met"><i class="fa-solid fa-check"></i> Req: ${statReq.stat.toUpperCase()} 13 ✓</span>`
                                                : `<span class="stat-req-pill unmet" title="Attacks made with Disadvantage without ${statReq.stat.toUpperCase()} 13"><i class="fa-solid fa-triangle-exclamation"></i> Req: ${statReq.stat.toUpperCase()} 13 (Disadvantage: you have ${statReq.current})</span>`
                                        ) : ""}
                                        ${!isProf ? `<span class="stat-req-pill non-prof"><i class="fa-solid fa-ban"></i> Non-Proficient</span>` : ""}
                                    </div>
                                    <div class="item-row-meta">Damage: ${w.damageDie} ${w.damageType} • Mastery: ${w.mastery}</div>
                                    <div class="item-row-desc">${w.properties.join(", ") || "None"}</div>
                                </div>
                                <span class="card-check"><i class="fa-solid fa-check"></i></span>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        </div>
    `;
}
