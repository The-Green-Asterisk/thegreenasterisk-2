import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CharacterData } from "../characterData";

function escapeHtml(str: string | number | undefined | null): string {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderPips(count: number): string {
    if (count <= 0) return "";
    let html = '<div class="pdf-slot-bubbles">';
    for (let i = 0; i < count; i++) {
        html += '<span class="pdf-bubble" title="Fillable spell slot">◯</span>';
    }
    html += '</div>';
    return html;
}

export function generatePdfHtmlPages(data: CharacterData): string[] {
    const pages: string[] = [];
    const name = escapeHtml(data.name || "Hero");
    const race = escapeHtml(data.race || "");
    const background = escapeHtml(data.background || "");
    const alignment = escapeHtml(data.alignment || "");
    const classSummary = escapeHtml(
        data.classes?.map(c => `${c.name} ${c.level}${c.subclass ? ` (${c.subclass})` : ""}`).join(" / ") ||
        `Level ${data.level || 1}`
    );

    // ==========================================
    // PAGE 1: CORE CHARACTER SHEET
    // ==========================================
    let p1 = `
    <div class="pdf-page">
        <!-- HEADER BLOCK -->
        <div class="pdf-header-block">
            <div class="pdf-header-name-box">
                <div class="pdf-char-name">${name}</div>
                <div class="pdf-char-subtitle">Character Name</div>
            </div>
            <div class="pdf-header-details-grid">
                <div class="pdf-detail-cell">
                    <span class="pdf-detail-val">${classSummary}</span>
                    <span class="pdf-detail-lbl">Class &amp; Level</span>
                </div>
                <div class="pdf-detail-cell">
                    <span class="pdf-detail-val">${background}</span>
                    <span class="pdf-detail-lbl">Background</span>
                </div>
                <div class="pdf-detail-cell">
                    <span class="pdf-detail-val"></span>
                    <span class="pdf-detail-lbl">Player Name</span>
                </div>
                <div class="pdf-detail-cell">
                    <span class="pdf-detail-val">${race}</span>
                    <span class="pdf-detail-lbl">Species / Race</span>
                </div>
                <div class="pdf-detail-cell">
                    <span class="pdf-detail-val">${alignment}</span>
                    <span class="pdf-detail-lbl">Alignment</span>
                </div>
                <div class="pdf-detail-cell">
                    <span class="pdf-detail-val">Level ${data.level || 1}</span>
                    <span class="pdf-detail-lbl">Experience Points</span>
                </div>
            </div>
        </div>

        <!-- MAIN 3-COLUMN CONTENT -->
        <div class="pdf-main-grid">
            <!-- COLUMN 1: ABILITIES, SAVES, SKILLS -->
            <div class="pdf-col pdf-col-left">
                <!-- 6 ABILITIES -->
                <div class="pdf-abilities-block">
    `;

    data.abilities.forEach(ab => {
        const modSign = ab.modifier >= 0 ? `+${ab.modifier}` : `${ab.modifier}`;
        p1 += `
            <div class="pdf-ability-box">
                <div class="pdf-ability-name">${escapeHtml(ab.name.toUpperCase())}</div>
                <div class="pdf-ability-mod">${modSign}</div>
                <div class="pdf-ability-score">${ab.score}</div>
                <div class="pdf-ability-base">Base: ${ab.baseScore ?? ab.score}</div>
            </div>
        `;
    });

    p1 += `
                </div>

                <!-- INSPIRATION & PROFICIENCY -->
                <div class="pdf-side-toggles">
                    <div class="pdf-outline-box pdf-insp-box">
                        <span class="pdf-insp-bubble">◯</span>
                        <span class="pdf-insp-label">HEROIC INSPIRATION</span>
                    </div>
                    <div class="pdf-outline-box pdf-pb-box">
                        <span class="pdf-pb-val">+${data.vitals.proficiencyBonus}</span>
                        <span class="pdf-pb-label">PROFICIENCY BONUS</span>
                    </div>
                </div>

                <!-- SAVING THROWS -->
                <div class="pdf-outline-box pdf-saves-box">
                    <div class="pdf-box-title">SAVING THROWS</div>
                    <div class="pdf-saves-list">
    `;

    data.abilities.forEach(ab => {
        const sign = ab.save >= 0 ? `+${ab.save}` : `${ab.save}`;
        const marker = ab.proficientSave ? "●" : "◯";
        p1 += `
            <div class="pdf-save-row ${ab.proficientSave ? "proficient" : ""}">
                <span class="pdf-check-circle">${marker}</span>
                <span class="pdf-save-bonus">${sign}</span>
                <span class="pdf-save-name">${escapeHtml(ab.name)}</span>
            </div>
        `;
    });

    p1 += `
                    </div>
                </div>

                <!-- SKILLS -->
                <div class="pdf-outline-box pdf-skills-box">
                    <div class="pdf-box-title">SKILLS</div>
                    <div class="pdf-skills-list">
    `;

    (data.skills || []).forEach(sk => {
        const sign = sk.bonus >= 0 ? `+${sk.bonus}` : `${sk.bonus}`;
        let marker = "◯";
        if (sk.proficiency === "expertise") marker = "◎";
        else if (sk.proficiency === "proficient") marker = "●";

        p1 += `
            <div class="pdf-skill-row ${sk.proficiency ? "proficient" : ""}">
                <span class="pdf-check-circle">${marker}</span>
                <span class="pdf-skill-bonus">${sign}</span>
                <span class="pdf-skill-name">${escapeHtml(sk.name)}</span>
                <span class="pdf-skill-stat">(${escapeHtml(sk.stat)})</span>
            </div>
        `;
    });

    p1 += `
                    </div>
                </div>
            </div>

            <!-- COLUMN 2: VITALS, HP, ATTACKS -->
            <div class="pdf-col pdf-col-mid">
                <!-- TOP VITALS ROW -->
                <div class="pdf-vitals-row">
                    <div class="pdf-vital-badge pdf-ac-badge">
                        <div class="pdf-vital-val">${data.vitals.armorClass}</div>
                        <div class="pdf-vital-lbl">ARMOR CLASS</div>
                    </div>
                    <div class="pdf-vital-badge pdf-init-badge">
                        <div class="pdf-vital-val">${data.vitals.initiative >= 0 ? `+${data.vitals.initiative}` : data.vitals.initiative}</div>
                        <div class="pdf-vital-lbl">INITIATIVE</div>
                    </div>
                    <div class="pdf-vital-badge pdf-speed-badge">
                        <div class="pdf-vital-val">${escapeHtml(data.vitals.speed)}</div>
                        <div class="pdf-vital-lbl">SPEED</div>
                    </div>
                </div>

                <!-- HIT POINTS BLOCK (FILLABLE TABLETOP BOXES) -->
                <div class="pdf-outline-box pdf-hp-container">
                    <div class="pdf-hp-max-row">
                        <span class="pdf-hp-max-label">Hit Point Maximum:</span>
                        <span class="pdf-hp-max-val">${data.vitals.maxHp}</span>
                    </div>
                    <div class="pdf-fillable-hp-box">
                        <div class="pdf-fillable-title">CURRENT HIT POINTS</div>
                        <div class="pdf-fillable-blank-space"></div>
                    </div>
                    <div class="pdf-fillable-hp-box pdf-temp-hp-box">
                        <div class="pdf-fillable-title">TEMPORARY HIT POINTS</div>
                        <div class="pdf-fillable-blank-space"></div>
                    </div>
                </div>

                <!-- HIT DICE & DEATH SAVES -->
                <div class="pdf-hd-ds-row">
                    <div class="pdf-outline-box pdf-hd-box">
                        <div class="pdf-box-title">HIT DICE</div>
                        <div class="pdf-hd-total">Total: ${escapeHtml(data.vitals.hitDice || `${data.level}d8`)}</div>
                        <div class="pdf-hd-remaining-box">
                            <span class="pdf-hd-rem-lbl">REMAINING:</span>
                            <span class="pdf-hd-rem-blank"></span>
                        </div>
                    </div>
                    <div class="pdf-outline-box pdf-ds-box">
                        <div class="pdf-box-title">DEATH SAVES</div>
                        <div class="pdf-ds-row">
                            <span class="pdf-ds-lbl">SUCCESSES</span>
                            <span class="pdf-ds-bubbles">◯ ◯ ◯</span>
                        </div>
                        <div class="pdf-ds-row">
                            <span class="pdf-ds-lbl">FAILURES</span>
                            <span class="pdf-ds-bubbles">◯ ◯ ◯</span>
                        </div>
                    </div>
                </div>

                <!-- ATTACKS & SPELLCASTING TABLE -->
                <div class="pdf-outline-box pdf-attacks-box">
                    <div class="pdf-box-title">ATTACKS &amp; WEAPONS</div>
                    <table class="pdf-attacks-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>ATK</th>
                                <th>DAMAGE / TYPE</th>
                                <th>NOTES</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    const weaponsList = (data.weapons && data.weapons.length > 0) ? data.weapons : [];
    weaponsList.slice(0, 6).forEach(w => {
        p1 += `
            <tr>
                <td class="pdf-atk-name"><strong>${escapeHtml(w.name)}</strong></td>
                <td class="pdf-atk-bonus">${escapeHtml(w.attackBonus || "-")}</td>
                <td class="pdf-atk-dmg">${escapeHtml(w.damage || "-")} ${escapeHtml(w.damageType || "")}</td>
                <td class="pdf-atk-notes">${escapeHtml(w.properties?.join(", ") || "")}</td>
            </tr>
        `;
    });

    // Provide 2 blank fillable attack rows if table has room
    const blankRowsNeeded = Math.max(2, 6 - weaponsList.length);
    for (let i = 0; i < blankRowsNeeded; i++) {
        p1 += `
            <tr class="pdf-blank-row">
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `;
    }

    p1 += `
                        </tbody>
                    </table>
                </div>

                <!-- PASSIVE SENSES & PROFICIENCIES -->
                <div class="pdf-outline-box pdf-senses-box">
                    <div class="pdf-box-title">PASSIVE SENSES</div>
                    <div class="pdf-senses-grid">
                        <div><strong>${data.vitals.passivePerception}</strong> Passive Perception (Wisdom)</div>
                        <div><strong>${data.vitals.passiveInvestigation}</strong> Passive Investigation (Intelligence)</div>
                        <div><strong>${data.vitals.passiveInsight}</strong> Passive Insight (Wisdom)</div>
                        ${(() => {
                            const senses: string[] = [];
                            if (data.vitals.darkvision) senses.push(`Darkvision ${data.vitals.darkvision}`);
                            if (data.vitals.blindsight) senses.push(`Blindsight ${data.vitals.blindsight}`);
                            if (data.vitals.tremorsense) senses.push(`Tremorsense ${data.vitals.tremorsense}`);
                            if (data.vitals.truesight) senses.push(`Truesight ${data.vitals.truesight}`);
                            if (data.vitals.devilsSight) senses.push(`Devil's Sight ${data.vitals.devilsSight}`);
                            return senses.length ? `<div><strong>Senses:</strong> ${escapeHtml(senses.join(", "))}</div>` : "";
                        })()}
                    </div>
                </div>
            </div>
        </div>

        <div class="pdf-page-footer">Page 1 — Core Stats &amp; Vitals | The Green Asterisk</div>
    </div>
    `;
    pages.push(p1);

    // ==========================================
    // PAGE 2: FEATURES, TRAITS & EQUIPMENT
    // ==========================================
    let p2 = `
    <div class="pdf-page">
        <!-- MINI HEADER -->
        <div class="pdf-mini-header">
            <span class="pdf-mini-name">${name}</span>
            <span class="pdf-mini-class">${classSummary}</span>
            <span class="pdf-mini-title">Features, Traits &amp; Equipment</span>
        </div>

        <div class="pdf-page2-grid">
            <!-- FEATURES & TRAITS (LEFT) -->
            <div class="pdf-page2-col">
                <div class="pdf-outline-box pdf-features-container">
                    <div class="pdf-box-title">FEATURES &amp; TRAITS</div>
                    <div class="pdf-features-list">
    `;

    const featuresList = (data.features || []);
    featuresList.slice(0, 12).forEach(f => {
        p2 += `
            <div class="pdf-feature-item">
                <div class="pdf-feature-hdr">
                    <span class="pdf-feature-name">${escapeHtml(f.name)}</span>
                    <span class="pdf-feature-source">${escapeHtml(f.source || f.type || "")}</span>
                </div>
                <div class="pdf-feature-desc">${escapeHtml(f.description || "").slice(0, 180)}</div>
            </div>
        `;
    });

    p2 += `
                    </div>
                </div>
            </div>

            <!-- EQUIPMENT, PROFICIENCIES & NOTES (RIGHT) -->
            <div class="pdf-page2-col">
                <!-- PROFICIENCIES & LANGUAGES -->
                <div class="pdf-outline-box pdf-profs-box">
                    <div class="pdf-box-title">OTHER PROFICIENCIES &amp; LANGUAGES</div>
                    <div class="pdf-profs-content">
                        ${data.proficiencies?.armor?.length ? `<div><strong>Armor:</strong> ${escapeHtml(data.proficiencies.armor.join(", "))}</div>` : ""}
                        ${data.proficiencies?.weapons?.length ? `<div><strong>Weapons:</strong> ${escapeHtml(data.proficiencies.weapons.join(", "))}</div>` : ""}
                        ${data.proficiencies?.tools?.length ? `<div><strong>Tools:</strong> ${escapeHtml(data.proficiencies.tools.join(", "))}</div>` : ""}
                        ${data.proficiencies?.languages?.length ? `<div><strong>Languages:</strong> ${escapeHtml(data.proficiencies.languages.join(", "))}</div>` : ""}
                    </div>
                </div>

                <!-- EQUIPMENT & CURRENCY -->
                <div class="pdf-outline-box pdf-equip-container">
                    <div class="pdf-box-title">EQUIPMENT &amp; CURRENCY</div>
                    <!-- CURRENCY -->
                    <div class="pdf-currency-bar">
                        <div class="pdf-curr-cell"><span class="pdf-curr-lbl">CP</span><span class="pdf-curr-val">___</span></div>
                        <div class="pdf-curr-cell"><span class="pdf-curr-lbl">SP</span><span class="pdf-curr-val">___</span></div>
                        <div class="pdf-curr-cell"><span class="pdf-curr-lbl">EP</span><span class="pdf-curr-val">___</span></div>
                        <div class="pdf-curr-cell"><span class="pdf-curr-lbl">GP</span><span class="pdf-curr-val">___</span></div>
                        <div class="pdf-curr-cell"><span class="pdf-curr-lbl">PP</span><span class="pdf-curr-val">___</span></div>
                    </div>
                    <!-- EQUIPMENT LIST -->
                    <table class="pdf-equip-table">
                        <thead>
                            <tr>
                                <th>ITEM</th>
                                <th>QTY</th>
                                <th>TYPE</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    const equipmentList = (data.equipment || []);
    equipmentList.slice(0, 14).forEach(eq => {
        p2 += `
            <tr>
                <td>${escapeHtml(eq.name)}</td>
                <td>${eq.quantity || 1}</td>
                <td>${escapeHtml(eq.type || "Item")}</td>
            </tr>
        `;
    });

    const blankEquipRows = Math.max(2, 14 - equipmentList.length);
    for (let i = 0; i < blankEquipRows; i++) {
        p2 += `
            <tr class="pdf-blank-row">
                <td>&nbsp;</td>
                <td></td>
                <td></td>
            </tr>
        `;
    }

    p2 += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="pdf-page-footer">Page 2 — Features, Traits &amp; Equipment | The Green Asterisk</div>
    </div>
    `;
    pages.push(p2);

    // ==========================================
    // PAGE 3: SPELLCASTING & FILLABLE SLOTS
    // ==========================================
    // Render spell page if character has spell slots, spellcasting ability, or spells
    const hasSpells = (data.spells && data.spells.length > 0) || (data.spellSlots && Object.keys(data.spellSlots).length > 0) || !!data.vitals.spellcastingAbility;

    if (hasSpells) {
        let p3 = `
        <div class="pdf-page">
            <!-- MINI HEADER -->
            <div class="pdf-mini-header">
                <span class="pdf-mini-name">${name}</span>
                <span class="pdf-mini-class">${classSummary}</span>
                <span class="pdf-mini-title">Spellcasting &amp; Spell Slots</span>
            </div>

            <!-- SPELLCASTING STATS BAR -->
            <div class="pdf-spell-stats-bar">
                <div class="pdf-spell-stat-cell">
                    <span class="pdf-spell-stat-val">${escapeHtml(data.vitals.spellcastingAbility || "None")}</span>
                    <span class="pdf-spell-stat-lbl">SPELLCASTING ABILITY</span>
                </div>
                <div class="pdf-spell-stat-cell">
                    <span class="pdf-spell-stat-val">${data.vitals.spellSaveDc || 10}</span>
                    <span class="pdf-spell-stat-lbl">SPELL SAVE DC</span>
                </div>
                <div class="pdf-spell-stat-cell">
                    <span class="pdf-spell-stat-val">${(data.vitals.spellAttackBonus ?? 0) >= 0 ? `+${data.vitals.spellAttackBonus}` : data.vitals.spellAttackBonus}</span>
                    <span class="pdf-spell-stat-lbl">SPELL ATTACK BONUS</span>
                </div>
            </div>

            <!-- SPELL SECTIONS (CANTRIPS + LEVELS WITH FILLABLE SLOTS) -->
            <div class="pdf-spells-container">
        `;

        // Pact slots
        const pactSlots = data.spellSlots?.pact?.total ?? 0;
        const pactLevel = data.spellSlots?.pact?.level ?? 5;
        if (pactSlots > 0) {
            p3 += `
                <div class="pdf-spell-level-box">
                    <div class="pdf-spell-level-header">
                        <span class="pdf-lvl-title">PACT MAGIC (Level ${pactLevel}) — ${pactSlots} SLOTS</span>
                        ${renderPips(pactSlots)}
                    </div>
                    <div class="pdf-spell-items-grid">
            `;
            const pactSpells = (data.spells || []).filter(s => s.level === pactLevel && s.source?.toLowerCase().includes("warlock"));
            pactSpells.forEach(s => {
                p3 += `
                    <div class="pdf-spell-entry">
                        <span class="pdf-spell-bullet">◯</span>
                        <span class="pdf-spell-name">${escapeHtml(s.name)}</span>
                        <span class="pdf-spell-meta">${escapeHtml(s.castingTime || "")} • ${escapeHtml(s.range || "")}</span>
                    </div>
                `;
            });
            p3 += `
                    </div>
                </div>
            `;
        }

        // Cantrips
        const cantrips = (data.spells || []).filter(s => s.level === 0);
        if (cantrips.length > 0) {
            p3 += `
                <div class="pdf-spell-level-box">
                    <div class="pdf-spell-level-header">
                        <span class="pdf-lvl-title">CANTRIPS (0 LEVEL)</span>
                    </div>
                    <div class="pdf-spell-items-grid">
            `;
            cantrips.forEach(s => {
                p3 += `
                    <div class="pdf-spell-entry">
                        <span class="pdf-spell-bullet">◯</span>
                        <span class="pdf-spell-name">${escapeHtml(s.name)}</span>
                        <span class="pdf-spell-meta">${escapeHtml(s.castingTime || "")} • ${escapeHtml(s.range || "")}</span>
                    </div>
                `;
            });
            p3 += `
                    </div>
                </div>
            `;
        }

        // Spell Levels 1 through 9
        for (let lvl = 1; lvl <= 9; lvl++) {
            const slotKey = `level${lvl}` as keyof typeof data.spellSlots;
            const slotInfo = data.spellSlots?.[slotKey];
            const maxSlots = slotInfo?.total ?? 0;
            const lvlSpells = (data.spells || []).filter(s => s.level === lvl);

            if (maxSlots > 0 || lvlSpells.length > 0) {
                p3 += `
                    <div class="pdf-spell-level-box">
                        <div class="pdf-spell-level-header">
                            <span class="pdf-lvl-title">${lvl}${getOrdinalSuffix(lvl)} LEVEL ${maxSlots > 0 ? `— ${maxSlots} SLOTS` : ""}</span>
                            ${renderPips(maxSlots)}
                        </div>
                        <div class="pdf-spell-items-grid">
                `;
                lvlSpells.forEach(s => {
                    p3 += `
                        <div class="pdf-spell-entry">
                            <span class="pdf-spell-bullet">◯</span>
                            <span class="pdf-spell-name">${escapeHtml(s.name)}</span>
                            <span class="pdf-spell-meta">${escapeHtml(s.castingTime || "")} • ${escapeHtml(s.range || "")}</span>
                        </div>
                    `;
                });
                p3 += `
                        </div>
                    </div>
                `;
            }
        }

        p3 += `
            </div>
            <div class="pdf-page-footer">Page 3 — Spellcasting &amp; Spell Slots | The Green Asterisk</div>
        </div>
        `;
        pages.push(p3);
    }

    return pages;
}

function getOrdinalSuffix(n: number): string {
    if (n === 1) return "ST";
    if (n === 2) return "ND";
    if (n === 3) return "RD";
    return "TH";
}

export function getPdfStyles(): string {
    return `
        /* --- PDF PRINTABLE STYLES: BLACK & WHITE OUTLINE SHAPES --- */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .pdf-page {
            width: 816px;
            height: 1056px;
            max-height: 1056px;
            overflow: hidden;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 24px 28px;
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }

        .pdf-outline-box {
            border: 1.5px solid #000000;
            border-radius: 6px;
            background: #ffffff;
            padding: 6px 8px;
            position: relative;
        }

        .pdf-box-title {
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #000000;
            border-bottom: 1px solid #000000;
            padding-bottom: 2px;
            margin-bottom: 4px;
        }

        /* HEADER BLOCK */
        .pdf-header-block {
            display: flex;
            border: 2px solid #000000;
            border-radius: 6px;
            margin-bottom: 10px;
            height: 64px;
        }

        .pdf-header-name-box {
            width: 38%;
            border-right: 2px solid #000000;
            padding: 6px 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .pdf-char-name {
            font-size: 19px;
            font-weight: 900;
            letter-spacing: -0.5px;
            line-height: 1.1;
            text-transform: uppercase;
        }

        .pdf-char-subtitle {
            font-size: 7.5px;
            font-weight: 700;
            text-transform: uppercase;
            color: #444444;
            margin-top: 2px;
        }

        .pdf-header-details-grid {
            width: 62%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
        }

        .pdf-detail-cell {
            padding: 3px 6px;
            border-right: 1px solid #000000;
            border-bottom: 1px solid #000000;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .pdf-detail-cell:nth-child(3n) {
            border-right: none;
        }

        .pdf-detail-cell:nth-child(n+4) {
            border-bottom: none;
        }

        .pdf-detail-val {
            font-size: 9px;
            font-weight: 700;
            line-height: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-detail-lbl {
            font-size: 6.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #555555;
            margin-top: 2px;
        }

        /* MAIN GRID */
        .pdf-main-grid {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px;
            flex: 1;
        }

        .pdf-col-left {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        /* 6 ABILITIES ROW */
        .pdf-abilities-block {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 3px;
        }

        .pdf-ability-box {
            border: 1.5px solid #000000;
            border-radius: 4px;
            text-align: center;
            padding: 2px 1px;
            background: #ffffff;
        }

        .pdf-ability-name {
            font-size: 6.5px;
            font-weight: 900;
            letter-spacing: 0.3px;
        }

        .pdf-ability-mod {
            font-size: 12px;
            font-weight: 900;
            line-height: 1.1;
            margin: 1px 0;
        }

        .pdf-ability-score {
            font-size: 8px;
            font-weight: 700;
            border: 1px solid #000000;
            border-radius: 10px;
            display: inline-block;
            padding: 0 3px;
            line-height: 1.1;
        }

        .pdf-ability-base {
            font-size: 5.5px;
            color: #666666;
            margin-top: 1px;
        }

        /* SIDE TOGGLES */
        .pdf-side-toggles {
            display: flex;
            gap: 4px;
        }

        .pdf-insp-box {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 5px;
        }

        .pdf-insp-bubble {
            font-size: 11px;
            font-weight: 900;
        }

        .pdf-insp-label {
            font-size: 6.5px;
            font-weight: 800;
        }

        .pdf-pb-box {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 5px;
        }

        .pdf-pb-val {
            font-size: 11px;
            font-weight: 900;
        }

        .pdf-pb-label {
            font-size: 6.5px;
            font-weight: 800;
        }

        /* SAVES & SKILLS */
        .pdf-saves-box {
            padding: 4px 6px;
        }

        .pdf-saves-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1px 4px;
        }

        .pdf-save-row {
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 8px;
            line-height: 1.2;
        }

        .pdf-check-circle {
            font-size: 9px;
            line-height: 1;
        }

        .pdf-save-bonus {
            font-weight: 800;
            width: 14px;
            text-align: right;
        }

        .pdf-skills-box {
            padding: 4px 6px;
            flex: 1;
        }

        .pdf-skills-list {
            display: flex;
            flex-direction: column;
            gap: 1.5px;
        }

        .pdf-skill-row {
            display: flex;
            align-items: center;
            gap: 3px;
            font-size: 7.5px;
            line-height: 1.15;
        }

        .pdf-skill-bonus {
            font-weight: 800;
            width: 15px;
            text-align: right;
        }

        .pdf-skill-name {
            font-weight: 600;
        }

        .pdf-skill-stat {
            font-size: 6.5px;
            color: #666666;
            margin-left: auto;
        }

        /* COLUMN 2 (CENTER) */
        .pdf-col-mid {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .pdf-vitals-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .pdf-vital-badge {
            border: 2px solid #000000;
            border-radius: 6px;
            text-align: center;
            padding: 4px;
            background: #ffffff;
        }

        .pdf-vital-val {
            font-size: 18px;
            font-weight: 900;
            line-height: 1;
        }

        .pdf-vital-lbl {
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 0.3px;
            margin-top: 2px;
        }

        /* HIT POINTS (FILLABLE BOXES) */
        .pdf-hp-container {
            border: 2px solid #000000;
            padding: 6px 8px;
        }

        .pdf-hp-max-row {
            display: flex;
            justify-content: flex-end;
            gap: 6px;
            font-size: 8.5px;
            font-weight: 800;
            border-bottom: 1px dashed #000000;
            padding-bottom: 3px;
            margin-bottom: 4px;
        }

        .pdf-fillable-hp-box {
            border: 1.5px solid #000000;
            border-radius: 4px;
            padding: 3px 6px;
            margin-bottom: 4px;
        }

        .pdf-temp-hp-box {
            margin-bottom: 0;
        }

        .pdf-fillable-title {
            font-size: 7px;
            font-weight: 900;
            color: #444444;
            letter-spacing: 0.3px;
        }

        .pdf-fillable-blank-space {
            height: 28px;
            background: #ffffff;
        }

        /* HIT DICE & DEATH SAVES */
        .pdf-hd-ds-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .pdf-hd-total {
            font-size: 8.5px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .pdf-hd-remaining-box {
            border: 1px solid #000000;
            border-radius: 3px;
            height: 24px;
            padding: 2px 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .pdf-hd-rem-lbl {
            font-size: 6.5px;
            font-weight: 800;
            color: #555555;
        }

        .pdf-ds-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 7px;
            font-weight: 800;
            margin-top: 3px;
        }

        .pdf-ds-bubbles {
            font-size: 11px;
            letter-spacing: 2px;
        }

        /* ATTACKS TABLE */
        .pdf-attacks-box {
            flex: 1;
            padding: 4px 6px;
        }

        .pdf-attacks-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5px;
        }

        .pdf-attacks-table th {
            border-bottom: 1px solid #000000;
            text-align: left;
            padding: 2px 4px;
            font-size: 6.5px;
            font-weight: 800;
        }

        .pdf-attacks-table td {
            border-bottom: 1px dotted #888888;
            padding: 3px 4px;
            line-height: 1.1;
        }

        .pdf-atk-bonus {
            font-weight: 800;
            text-align: center;
            width: 32px;
        }

        .pdf-blank-row td {
            height: 18px;
        }

        /* PASSIVE SENSES */
        .pdf-senses-box {
            padding: 4px 6px;
        }

        .pdf-senses-grid {
            font-size: 7.5px;
            line-height: 1.3;
        }

        /* PAGE FOOTER */
        .pdf-page-footer {
            margin-top: auto;
            text-align: center;
            font-size: 7px;
            color: #666666;
            border-top: 1px solid #cccccc;
            padding-top: 4px;
        }

        /* MINI HEADER (PAGES 2 & 3) */
        .pdf-mini-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #000000;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }

        .pdf-mini-name {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .pdf-mini-class {
            font-size: 9px;
            font-weight: 700;
            color: #444444;
        }

        .pdf-mini-title {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid #000000;
            border-radius: 4px;
            padding: 2px 6px;
        }

        /* PAGE 2 LAYOUT */
        .pdf-page2-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 10px;
            flex: 1;
        }

        .pdf-page2-col {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .pdf-features-container {
            flex: 1;
            padding: 6px 8px;
        }

        .pdf-features-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .pdf-feature-item {
            border-bottom: 1px dotted #888888;
            padding-bottom: 4px;
        }

        .pdf-feature-hdr {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 1px;
        }

        .pdf-feature-name {
            font-size: 8.5px;
            font-weight: 800;
        }

        .pdf-feature-source {
            font-size: 6.5px;
            font-weight: 700;
            color: #666666;
            text-transform: uppercase;
        }

        .pdf-feature-desc {
            font-size: 7px;
            color: #222222;
            line-height: 1.2;
        }

        .pdf-profs-box {
            padding: 6px 8px;
            font-size: 7.5px;
            line-height: 1.35;
        }

        .pdf-equip-container {
            flex: 1;
            padding: 6px 8px;
            display: flex;
            flex-direction: column;
        }

        .pdf-currency-bar {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            margin-bottom: 6px;
        }

        .pdf-curr-cell {
            border: 1px solid #000000;
            border-radius: 3px;
            text-align: center;
            padding: 2px;
        }

        .pdf-curr-lbl {
            display: block;
            font-size: 6px;
            font-weight: 800;
        }

        .pdf-curr-val {
            font-size: 9px;
            font-weight: 800;
        }

        .pdf-equip-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5px;
            flex: 1;
        }

        .pdf-equip-table th {
            border-bottom: 1px solid #000000;
            text-align: left;
            padding: 2px 4px;
            font-size: 6.5px;
            font-weight: 800;
        }

        .pdf-equip-table td {
            border-bottom: 1px dotted #888888;
            padding: 2px 4px;
        }

        /* PAGE 3: SPELLCASTING */
        .pdf-spell-stats-bar {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            border: 1.5px solid #000000;
            border-radius: 6px;
            padding: 4px 8px;
            margin-bottom: 8px;
            text-align: center;
        }

        .pdf-spell-stat-val {
            display: block;
            font-size: 14px;
            font-weight: 900;
            line-height: 1.1;
        }

        .pdf-spell-stat-lbl {
            font-size: 6.5px;
            font-weight: 800;
            color: #444444;
        }

        .pdf-spells-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
        }

        .pdf-spell-level-box {
            border: 1.5px solid #000000;
            border-radius: 4px;
            padding: 4px 6px;
        }

        .pdf-spell-level-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #000000;
            padding-bottom: 2px;
            margin-bottom: 4px;
        }

        .pdf-lvl-title {
            font-size: 8px;
            font-weight: 900;
            letter-spacing: 0.3px;
        }

        .pdf-slot-bubbles {
            display: flex;
            gap: 4px;
            align-items: center;
        }

        .pdf-bubble {
            font-size: 13px;
            font-weight: 900;
            line-height: 1;
        }

        .pdf-spell-items-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2px 8px;
        }

        .pdf-spell-entry {
            display: flex;
            align-items: baseline;
            gap: 3px;
            font-size: 7.5px;
            line-height: 1.15;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-spell-bullet {
            font-size: 8px;
            font-weight: 900;
        }

        .pdf-spell-name {
            font-weight: 700;
        }

        .pdf-spell-meta {
            font-size: 6.5px;
            color: #666666;
            margin-left: auto;
        }
    `;
}

export async function exportPdfCharacterSheet(
    data: CharacterData,
    statusCallback?: (msg: string) => void
): Promise<void> {
    if (!data) return;

    statusCallback?.("Generating black & white printable PDF...");

    const pagesHtml = generatePdfHtmlPages(data);
    const styles = getPdfStyles();

    // Create off-screen rendering mount
    const mount = document.createElement("div");
    mount.id = "pdf-export-mount";
    mount.style.position = "fixed";
    mount.style.left = "-9999px";
    mount.style.top = "0";
    mount.style.width = "816px";
    mount.style.zIndex = "-9999";
    mount.style.background = "#ffffff";
    mount.style.color = "#000000";

    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    mount.appendChild(styleEl);

    const pageElements: HTMLElement[] = [];
    pagesHtml.forEach(html => {
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        const pageEl = wrap.firstElementChild as HTMLElement;
        if (pageEl) {
            mount.appendChild(pageEl);
            pageElements.push(pageEl);
        }
    });

    document.body.appendChild(mount);

    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "letter"
        });

        for (let i = 0; i < pageElements.length; i++) {
            statusCallback?.(`Rendering page ${i + 1} of ${pageElements.length}...`);
            if (i > 0) {
                doc.addPage("letter", "portrait");
            }

            const canvas = await html2canvas(pageElements[i], {
                scale: 2, // 2x resolution for clean outline print
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: 816,
                windowHeight: 1056
            });

            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 0, 0, 612, 792);
        }

        const safeName = (data.name || "Character").replace(/[^a-zA-Z0-9_-]/g, "_");
        doc.save(`${safeName}-Character-Sheet.pdf`);
        statusCallback?.(`Downloaded ${safeName}-Character-Sheet.pdf`);
    } catch (err) {
        console.error("PDF export error:", err);
        statusCallback?.("Failed to generate PDF. Check console for details.");
        throw err;
    } finally {
        mount.remove();
    }
}
