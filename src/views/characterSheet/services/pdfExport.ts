import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { CharacterData } from "../characterData";

export type PdfFormat = "letter" | "remarkable";

export interface PdfExportOptions {
    format?: PdfFormat;
    statusCallback?: (msg: string) => void;
}

function escapeHtml(str: string | number | undefined | null): string {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function stripHtml(html: string | undefined | null): string {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function renderPips(count: number): string {
    if (count <= 0) return "";
    let html = '<div class="pdf-slot-bubbles">';
    html += `<span class="pdf-slots-label">${count} ${count === 1 ? "SLOT" : "SLOTS"}</span>`;
    for (let i = 0; i < count; i++) {
        html += '<span class="pdf-bubble" title="Fillable slot">◯</span>';
    }
    html += '</div>';
    return html;
}

export function generatePdfHtmlPages(data: CharacterData, format: PdfFormat = "letter"): string[] {
    const pages: string[] = [];
    const isRemarkable = format === "remarkable";
    const formatLabel = isRemarkable ? "reMarkable (3:4 — 1404 × 1872)" : "Letter (8.5\" × 11\")";
    const pageClass = `pdf-page ${isRemarkable ? "pdf-format-remarkable" : "pdf-format-letter"}`;

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
    <div class="${pageClass}">
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
            <!-- COLUMN 1: ABILITY SCORES & SAVING THROWS (135px) -->
            <div class="pdf-col pdf-col-abilities">
                <!-- 6 ABILITIES VERTICALLY STACKED -->
                <div class="pdf-abilities-col">
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

                <!-- INSPIRATION & PROFICIENCY BONUS -->
                <div class="pdf-side-toggles">
                    <div class="pdf-outline-box pdf-insp-box">
                        <span class="pdf-insp-bubble">◯</span>
                        <span class="pdf-insp-label">HEROIC INSPIRATION</span>
                    </div>
                    <div class="pdf-outline-box pdf-pb-box">
                        <span class="pdf-pb-val">+${data.vitals.proficiencyBonus}</span>
                        <span class="pdf-pb-label">PROFICIENCY</span>
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
                <span class="pdf-check-col">${marker}</span>
                <span class="pdf-bonus-col">${sign}</span>
                <span class="pdf-save-name">${escapeHtml(ab.name)}</span>
            </div>
        `;
    });

    p1 += `
                    </div>
                </div>
            </div>

            <!-- COLUMN 2: SKILLS, SENSES, PROFICIENCIES (190px) -->
            <div class="pdf-col pdf-col-skills">
                <!-- SKILLS (ALL 18 IN TABULAR GRID) -->
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
                <span class="pdf-check-col">${marker}</span>
                <span class="pdf-bonus-col">${sign}</span>
                <span class="pdf-skill-name">${escapeHtml(sk.name)}</span>
                <span class="pdf-stat-col">${escapeHtml(sk.stat)}</span>
            </div>
        `;
    });

    p1 += `
                    </div>
                </div>

                <!-- PASSIVE SENSES -->
                <div class="pdf-outline-box pdf-senses-box">
                    <div class="pdf-box-title">PASSIVE SENSES</div>
                    <div class="pdf-senses-grid">
                        <div class="pdf-sense-item"><strong>${data.vitals.passivePerception}</strong> Passive Perception</div>
                        <div class="pdf-sense-item"><strong>${data.vitals.passiveInvestigation}</strong> Passive Investigation</div>
                        <div class="pdf-sense-item"><strong>${data.vitals.passiveInsight}</strong> Passive Insight</div>
                        ${(() => {
                            const senses: string[] = [];
                            if (data.vitals.darkvision) senses.push(`Darkvision ${data.vitals.darkvision}`);
                            if (data.vitals.blindsight) senses.push(`Blindsight ${data.vitals.blindsight}`);
                            if (data.vitals.tremorsense) senses.push(`Tremorsense ${data.vitals.tremorsense}`);
                            if (data.vitals.truesight) senses.push(`Truesight ${data.vitals.truesight}`);
                            if (data.vitals.devilsSight) senses.push(`Devil's Sight ${data.vitals.devilsSight}`);
                            return senses.length ? `<div class="pdf-sense-item"><strong>Senses:</strong> ${escapeHtml(senses.join(", "))}</div>` : "";
                        })()}
                    </div>
                </div>

                <!-- OTHER PROFICIENCIES & LANGUAGES -->
                <div class="pdf-outline-box pdf-profs-box-col2">
                    <div class="pdf-box-title">PROFICIENCIES &amp; LANGUAGES</div>
                    <div class="pdf-profs-content">
                        ${data.proficiencies?.armor?.length ? `<div><strong>Armor:</strong> ${escapeHtml(data.proficiencies.armor.join(", "))}</div>` : ""}
                        ${data.proficiencies?.weapons?.length ? `<div><strong>Weapons:</strong> ${escapeHtml(data.proficiencies.weapons.join(", "))}</div>` : ""}
                        ${data.proficiencies?.tools?.length ? `<div><strong>Tools:</strong> ${escapeHtml(data.proficiencies.tools.join(", "))}</div>` : ""}
                        ${data.proficiencies?.languages?.length ? `<div><strong>Languages:</strong> ${escapeHtml(data.proficiencies.languages.join(", "))}</div>` : ""}
                    </div>
                </div>
            </div>

            <!-- COLUMN 3: VITALS, COMPACT HP, ATTACKS & WEAPONS (FLEX 1) -->
            <div class="pdf-col pdf-col-vitals">
                <!-- TOP VITALS ROW (AC, INITIATIVE, SPEED) -->
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

                <!-- COMPACT HIT POINTS CONTAINER -->
                <div class="pdf-outline-box pdf-hp-container">
                    <div class="pdf-hp-max-row">
                        <span>Hit Point Maximum: <strong>${data.vitals.maxHp}</strong></span>
                    </div>
                    <div class="pdf-hp-boxes-row">
                        <div class="pdf-hp-box-half">
                            <div class="pdf-hp-box-title">CURRENT HIT POINTS</div>
                            <div class="pdf-hp-box-blank"></div>
                        </div>
                        <div class="pdf-hp-box-half">
                            <div class="pdf-hp-box-title">TEMPORARY HIT POINTS</div>
                            <div class="pdf-hp-box-blank"></div>
                        </div>
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

                <!-- ATTACKS & WEAPONS TABLE -->
                <div class="pdf-outline-box pdf-attacks-box">
                    <div class="pdf-box-title">ATTACKS &amp; WEAPONS</div>
                    <table class="pdf-attacks-table">
                        <thead>
                            <tr>
                                <th style="width: 28%;">NAME</th>
                                <th style="width: 14%;">ATK</th>
                                <th style="width: 28%;">DAMAGE / TYPE</th>
                                <th>NOTES</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    const weaponsList = (data.weapons && data.weapons.length > 0) ? data.weapons : [];
    weaponsList.slice(0, 5).forEach(w => {
        p1 += `
            <tr>
                <td class="pdf-atk-name"><strong>${escapeHtml(w.name)}</strong></td>
                <td class="pdf-atk-bonus">${escapeHtml(w.attackBonus || "-")}</td>
                <td class="pdf-atk-dmg">${escapeHtml(w.damage || "-")} ${escapeHtml(w.damageType || "")}</td>
                <td class="pdf-atk-notes">${escapeHtml(w.properties?.join(", ") || "")}</td>
            </tr>
        `;
    });

    const blankAtkRows = Math.max(3, 5 - weaponsList.length);
    for (let i = 0; i < blankAtkRows; i++) {
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
            </div>
        </div>

        <div class="pdf-page-footer">Page 1 — Core Stats &amp; Vitals | ${formatLabel} | The Green Asterisk</div>
    </div>
    `;
    pages.push(p1);

    // ==========================================
    // PAGE 2: FEATURES, TRAITS & EQUIPMENT
    // ==========================================
    let p2 = `
    <div class="${pageClass}">
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
    featuresList.slice(0, 14).forEach(f => {
        const cleanDesc = stripHtml(f.description);
        p2 += `
            <div class="pdf-feature-item">
                <div class="pdf-feature-hdr">
                    <span class="pdf-feature-name">${escapeHtml(f.name)}</span>
                    <span class="pdf-feature-source">${escapeHtml(f.source || f.type || "")}</span>
                </div>
                <div class="pdf-feature-desc">${escapeHtml(cleanDesc.slice(0, 200))}</div>
            </div>
        `;
    });

    p2 += `
                    </div>
                </div>
            </div>

            <!-- EQUIPMENT & CURRENCY (RIGHT) -->
            <div class="pdf-page2-col">
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
                                <th style="width: 60%;">ITEM</th>
                                <th style="width: 15%; text-align: center;">QTY</th>
                                <th style="width: 25%;">TYPE</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    const equipmentList = (data.equipment || []);
    equipmentList.slice(0, 18).forEach(eq => {
        p2 += `
            <tr>
                <td class="pdf-equip-name">${escapeHtml(eq.name)}</td>
                <td class="pdf-equip-qty">${eq.quantity || 1}</td>
                <td class="pdf-equip-type">${escapeHtml(eq.type || "Item")}</td>
            </tr>
        `;
    });

    const blankEquipRows = Math.max(3, 18 - equipmentList.length);
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

        <div class="pdf-page-footer">Page 2 — Features, Traits &amp; Equipment | ${formatLabel} | The Green Asterisk</div>
    </div>
    `;
    pages.push(p2);

    // ==========================================
    // PAGE 3: SPELLCASTING & FILLABLE SLOTS
    // ==========================================
    const hasSpells = (data.spells && data.spells.length > 0) || (data.spellSlots && Object.keys(data.spellSlots).length > 0) || !!data.vitals.spellcastingAbility;

    if (hasSpells) {
        let p3 = `
        <div class="${pageClass}">
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
                        <span class="pdf-lvl-title">PACT MAGIC (Level ${pactLevel})</span>
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
                            <span class="pdf-lvl-title">${lvl}${getOrdinalSuffix(lvl)} LEVEL</span>
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
            <div class="pdf-page-footer">Page 3 — Spellcasting &amp; Spell Slots | ${formatLabel} | The Green Asterisk</div>
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

export function getPdfStyles(format: PdfFormat = "letter"): string {
    const isRemarkable = format === "remarkable";
    const pageWidth = isRemarkable ? 792 : 816;
    const pagePadding = isRemarkable ? "24px 26px" : "22px 24px";
    const col1Width = isRemarkable ? "130px" : "135px";
    const col2Width = isRemarkable ? "185px" : "190px";
    const gridGap = isRemarkable ? "7px" : "8px";

    return `
        /* --- PDF PRINTABLE STYLES: TABLETOP BLACK & WHITE OUTLINES (${isRemarkable ? "reMarkable 3:4" : "Letter"}) --- */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .pdf-page {
            width: ${pageWidth}px;
            height: 1056px;
            max-height: 1056px;
            overflow: hidden;
            background: #ffffff !important;
            color: #000000 !important;
            padding: ${pagePadding};
            position: relative;
            display: flex;
            flex-direction: column;
            border: 1px solid #e2e8f0;
            margin-bottom: 20px;
        }

        .pdf-outline-box {
            border: 1.5px solid #000000;
            border-radius: 5px;
            background: #ffffff;
            padding: 5px 7px;
            position: relative;
        }

        .pdf-box-title {
            font-size: 7.5px;
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
            margin-bottom: 8px;
            height: 60px;
        }

        .pdf-header-name-box {
            width: 36%;
            border-right: 2px solid #000000;
            padding: 6px 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .pdf-char-name {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: -0.5px;
            line-height: 1.1;
            text-transform: uppercase;
        }

        .pdf-char-subtitle {
            font-size: 7px;
            font-weight: 700;
            text-transform: uppercase;
            color: #444444;
            margin-top: 2px;
        }

        .pdf-header-details-grid {
            width: 64%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
        }

        .pdf-detail-cell {
            padding: 2px 6px;
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
            font-size: 8.5px;
            font-weight: 700;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-detail-lbl {
            font-size: 6.5px;
            font-weight: 800;
            text-transform: uppercase;
            color: #555555;
            margin-top: 1px;
        }

        /* MAIN 3-COLUMN GRID */
        .pdf-main-grid {
            display: grid;
            grid-template-columns: ${col1Width} ${col2Width} 1fr;
            gap: ${gridGap};
            flex: 1;
        }

        .pdf-col {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        /* COLUMN 1: ABILITIES VERTICAL */
        .pdf-abilities-col {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .pdf-ability-box {
            border: 1.5px solid #000000;
            border-radius: 4px;
            text-align: center;
            padding: 3px 2px;
            height: 54px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
        }

        .pdf-ability-name {
            font-size: 6.5px;
            font-weight: 900;
            letter-spacing: 0.3px;
        }

        .pdf-ability-mod {
            font-size: 16px;
            font-weight: 900;
            line-height: 1;
        }

        .pdf-ability-score {
            font-size: 8px;
            font-weight: 700;
            border: 1px solid #000000;
            border-radius: 8px;
            padding: 0 5px;
            line-height: 1.1;
        }

        .pdf-ability-base {
            font-size: 5.5px;
            color: #555555;
        }

        /* SIDE TOGGLES (INSPIRATION & PB) */
        .pdf-side-toggles {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .pdf-insp-box, .pdf-pb-box {
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
            font-size: 6px;
            font-weight: 800;
        }

        .pdf-pb-val {
            font-size: 11px;
            font-weight: 900;
        }

        .pdf-pb-label {
            font-size: 6px;
            font-weight: 800;
        }

        /* SAVES (COLUMN 1) */
        .pdf-saves-box {
            padding: 4px 6px;
        }

        .pdf-saves-list {
            display: flex;
            flex-direction: column;
            gap: 1.5px;
        }

        .pdf-save-row {
            display: grid;
            grid-template-columns: 14px 20px 1fr;
            align-items: center;
            font-size: 7.5px;
            height: 14px;
            line-height: 1;
        }

        .pdf-save-name {
            font-weight: 600;
            margin-left: 2px;
        }

        /* COLUMN 2: SKILLS (TABULAR ALIGNED) */
        .pdf-skills-box {
            padding: 4px 6px;
        }

        .pdf-skills-list {
            display: flex;
            flex-direction: column;
            gap: 1px;
        }

        .pdf-skill-row {
            display: grid;
            grid-template-columns: 14px 20px 1fr 24px;
            align-items: center;
            font-size: 7.5px;
            height: 15px;
            line-height: 1;
        }

        .pdf-check-col {
            text-align: center;
            font-size: 9px;
            line-height: 1;
        }

        .pdf-bonus-col {
            text-align: right;
            font-weight: 800;
            padding-right: 3px;
        }

        .pdf-skill-name {
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-stat-col {
            text-align: right;
            font-size: 6.5px;
            color: #666666;
            font-weight: 600;
        }

        /* SENSES & PROFICIENCIES IN COL 2 */
        .pdf-senses-box {
            padding: 4px 6px;
        }

        .pdf-senses-grid {
            font-size: 7px;
            line-height: 1.35;
        }

        .pdf-sense-item {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-profs-box-col2 {
            padding: 4px 6px;
            font-size: 7px;
            line-height: 1.3;
            flex: 1;
        }

        .pdf-profs-content div {
            margin-bottom: 2px;
        }

        /* COLUMN 3: VITALS, COMPACT HP, ATTACKS */
        .pdf-vitals-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }

        .pdf-vital-badge {
            border: 2px solid #000000;
            border-radius: 6px;
            text-align: center;
            padding: 4px;
            height: 52px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #ffffff;
        }

        .pdf-vital-val {
            font-size: 18px;
            font-weight: 900;
            line-height: 1;
        }

        .pdf-vital-lbl {
            font-size: 6.5px;
            font-weight: 800;
            letter-spacing: 0.3px;
            margin-top: 2px;
        }

        /* COMPACT HIT POINTS */
        .pdf-hp-container {
            border: 2px solid #000000;
            padding: 4px 6px;
        }

        .pdf-hp-max-row {
            font-size: 8px;
            border-bottom: 1px dashed #000000;
            padding-bottom: 2px;
            margin-bottom: 4px;
            display: flex;
            justify-content: flex-end;
        }

        .pdf-hp-boxes-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }

        .pdf-hp-box-half {
            border: 1.5px solid #000000;
            border-radius: 4px;
            padding: 3px 4px;
        }

        .pdf-hp-box-title {
            font-size: 6.5px;
            font-weight: 900;
            color: #444444;
            text-align: center;
        }

        .pdf-hp-box-blank {
            height: 38px;
        }

        /* HIT DICE & DEATH SAVES */
        .pdf-hd-ds-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }

        .pdf-hd-total {
            font-size: 7.5px;
            font-weight: 700;
            margin-bottom: 3px;
        }

        .pdf-hd-remaining-box {
            border: 1px solid #000000;
            border-radius: 3px;
            height: 20px;
            padding: 2px 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .pdf-hd-rem-lbl {
            font-size: 6px;
            font-weight: 800;
            color: #555555;
        }

        .pdf-ds-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 6.5px;
            font-weight: 800;
            margin-top: 2px;
        }

        .pdf-ds-bubbles {
            font-size: 10px;
            letter-spacing: 2px;
        }

        /* ATTACKS & WEAPONS TABLE */
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
            padding: 2px 4px;
            line-height: 1.1;
        }

        .pdf-atk-bonus {
            font-weight: 800;
            text-align: center;
        }

        .pdf-blank-row td {
            height: 16px;
        }

        /* PAGE FOOTER */
        .pdf-page-footer {
            margin-top: auto;
            text-align: center;
            font-size: 6.5px;
            color: #666666;
            border-top: 1px solid #cccccc;
            padding-top: 3px;
        }

        /* MINI HEADER (PAGES 2 & 3) */
        .pdf-mini-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #000000;
            padding-bottom: 3px;
            margin-bottom: 6px;
        }

        .pdf-mini-name {
            font-size: 14px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .pdf-mini-class {
            font-size: 8.5px;
            font-weight: 700;
            color: #444444;
        }

        .pdf-mini-title {
            font-size: 8.5px;
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
            gap: 6px;
        }

        .pdf-features-container {
            flex: 1;
            padding: 5px 7px;
        }

        .pdf-features-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .pdf-feature-item {
            border-bottom: 1px dotted #888888;
            padding-bottom: 3px;
        }

        .pdf-feature-hdr {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 1px;
        }

        .pdf-feature-name {
            font-size: 8px;
            font-weight: 800;
        }

        .pdf-feature-source {
            font-size: 6px;
            font-weight: 700;
            color: #666666;
            text-transform: uppercase;
        }

        .pdf-feature-desc {
            font-size: 6.8px;
            color: #222222;
            line-height: 1.25;
        }

        .pdf-equip-container {
            flex: 1;
            padding: 5px 7px;
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
            font-size: 5.5px;
            font-weight: 800;
        }

        .pdf-curr-val {
            font-size: 8.5px;
            font-weight: 800;
        }

        .pdf-equip-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5px;
        }

        .pdf-equip-table th {
            border-bottom: 1px solid #000000;
            text-align: left;
            padding: 2px 4px;
            font-size: 6.5px;
            font-weight: 800;
        }

        .pdf-equip-table td {
            border-bottom: 1px dotted #cccccc;
            padding: 2px 4px;
            height: 18px;
            line-height: 1.15;
        }

        .pdf-equip-qty {
            text-align: center;
        }

        .pdf-equip-type {
            font-size: 6.5px;
            color: #555555;
        }

        /* PAGE 3: SPELLCASTING */
        .pdf-spell-stats-bar {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            border: 1.5px solid #000000;
            border-radius: 6px;
            padding: 3px 8px;
            margin-bottom: 6px;
            text-align: center;
        }

        .pdf-spell-stat-val {
            display: block;
            font-size: 13px;
            font-weight: 900;
            line-height: 1.1;
        }

        .pdf-spell-stat-lbl {
            font-size: 6px;
            font-weight: 800;
            color: #444444;
        }

        .pdf-spells-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
        }

        .pdf-spell-level-box {
            border: 1.5px solid #000000;
            border-radius: 4px;
            padding: 3px 5px;
        }

        .pdf-spell-level-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #000000;
            padding-bottom: 2px;
            margin-bottom: 3px;
            height: 18px;
        }

        .pdf-lvl-title {
            font-size: 7.5px;
            font-weight: 900;
            letter-spacing: 0.3px;
        }

        .pdf-slot-bubbles {
            display: inline-flex;
            gap: 5px;
            align-items: center;
        }

        .pdf-slots-label {
            font-size: 6.5px;
            font-weight: 800;
            margin-right: 2px;
        }

        .pdf-bubble {
            font-size: 14px;
            font-weight: 900;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
        }

        .pdf-spell-items-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1px 8px;
        }

        .pdf-spell-entry {
            display: grid;
            grid-template-columns: 12px 1fr auto;
            align-items: center;
            gap: 2px;
            font-size: 7.2px;
            height: 15px;
            line-height: 1;
        }

        .pdf-spell-bullet {
            font-size: 9px;
            font-weight: 900;
            text-align: center;
        }

        .pdf-spell-name {
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-spell-meta {
            font-size: 6.2px;
            color: #666666;
            white-space: nowrap;
            margin-left: 2px;
        }
    `;
}

export async function exportPdfCharacterSheet(
    data: CharacterData,
    optionsOrCb?: PdfExportOptions | ((msg: string) => void)
): Promise<void> {
    if (!data) return;

    const options: PdfExportOptions = typeof optionsOrCb === "function"
        ? { statusCallback: optionsOrCb }
        : (optionsOrCb || {});

    const format: PdfFormat = options.format || "letter";
    const statusCallback = options.statusCallback;
    const isRemarkable = format === "remarkable";

    statusCallback?.(`Generating black & white ${isRemarkable ? "reMarkable" : "Letter"} PDF...`);

    const pagesHtml = generatePdfHtmlPages(data, format);
    const styles = getPdfStyles(format);

    const pageWidth = isRemarkable ? 792 : 816;
    const pageHeight = 1056;

    // Create off-screen rendering mount
    const mount = document.createElement("div");
    mount.id = "pdf-export-mount";
    mount.style.position = "fixed";
    mount.style.left = "-9999px";
    mount.style.top = "0";
    mount.style.width = `${pageWidth}px`;
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
        // Dimensions in points:
        // Letter: 612 x 792 pt
        // reMarkable (3:4 aspect ratio, native 1404 x 1872 px): 594 x 792 pt (594/792 = 0.75 = 3/4)
        const pdfPageWidthPt = isRemarkable ? 594 : 612;
        const pdfPageHeightPt = 792;

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: isRemarkable ? [594, 792] : "letter"
        });

        for (let i = 0; i < pageElements.length; i++) {
            statusCallback?.(`Rendering page ${i + 1} of ${pageElements.length}...`);
            if (i > 0) {
                doc.addPage(isRemarkable ? [594, 792] : "letter", "portrait");
            }

            const canvas = await html2canvas(pageElements[i], {
                scale: 2, // 2x resolution for clean outline print
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: pageWidth,
                windowHeight: pageHeight
            });

            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", 0, 0, pdfPageWidthPt, pdfPageHeightPt);
        }

        const safeName = (data.name || "Character").replace(/[^a-zA-Z0-9_-]/g, "_");
        const formatSuffix = isRemarkable ? "reMarkable" : "Letter";
        const filename = `${safeName}-Character-Sheet-${formatSuffix}.pdf`;
        doc.save(filename);
        statusCallback?.(`Downloaded ${filename}`);
    } catch (err) {
        console.error("PDF export error:", err);
        statusCallback?.("Failed to generate PDF. Check console for details.");
        throw err;
    } finally {
        mount.remove();
    }
}

