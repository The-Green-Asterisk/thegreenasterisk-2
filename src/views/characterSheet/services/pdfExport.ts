import el from "@elements";
import { listSenses } from "../../../rules/dnd5e_2024/senses";
import { getSpellDamageDisplay, getSpellEffectDisplay, getSpellcastingModifier } from "../../../services/spellDamage";
import { CharacterData, SpellDefinition } from "../characterData";
import { speciesSpellcastingSummary } from "../components/details";
import { isCharacterSpeciesSpell } from "../components/spells";

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
    let str = html;
    for (let i = 0; i < 2; i++) {
        str = str
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&amp;/gi, "&")
            .replace(/&quot;/gi, '"')
            .replace(/&#039;/gi, "'")
            .replace(/&nbsp;/gi, " ");
    }
    return str
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]*>/g, "")
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
            <div class="pdf-header-details-block">
                <div class="pdf-header-row pdf-header-row-top">
                    <div class="pdf-detail-cell pdf-cell-class">
                        <span class="pdf-detail-val" style="${classSummary.length > 40 ? `font-size: ${isRemarkable ? "12px" : "8.5px"};` : ""}">${classSummary}</span>
                        <span class="pdf-detail-lbl">Class &amp; Level</span>
                    </div>
                    <div class="pdf-detail-cell pdf-cell-race">
                        <span class="pdf-detail-val">${race}</span>
                        <span class="pdf-detail-lbl">Species / Race</span>
                    </div>
                </div>
                <div class="pdf-header-row pdf-header-row-bottom">
                    <div class="pdf-detail-cell">
                        <span class="pdf-detail-val">${background}</span>
                        <span class="pdf-detail-lbl">Background</span>
                    </div>
                    <div class="pdf-detail-cell">
                        <span class="pdf-detail-val">${alignment}</span>
                        <span class="pdf-detail-lbl">Alignment</span>
                    </div>
                    <div class="pdf-detail-cell">
                        <span class="pdf-detail-val"></span>
                        <span class="pdf-detail-lbl">Player Name</span>
                    </div>
                    <div class="pdf-detail-cell">
                        <span class="pdf-detail-val">Level ${data.level || 1}</span>
                        <span class="pdf-detail-lbl">Experience Points</span>
                    </div>
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
            // Every sense the character has (none listed as "None"), including senses added by rules data
            const senses = listSenses(data.vitals).map((s) => `${s.label} ${s.range}`);
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
    const featuresLimit = isRemarkable ? 7 : 14;
    featuresList.slice(0, featuresLimit).forEach(f => {
        const cleanDesc = stripHtml(f.description);
        p2 += `
            <div class="pdf-feature-item">
                <div class="pdf-feature-hdr">
                    <span class="pdf-feature-name">${escapeHtml(f.name)}</span>
                    <span class="pdf-feature-source">${escapeHtml(f.source || f.type || "")}</span>
                </div>
                <div class="pdf-feature-desc">${escapeHtml(cleanDesc.slice(0, isRemarkable ? 240 : 200))}</div>
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
                        ${(["cp", "sp", "ep", "gp", "pp"] as const).map(c => `<div class="pdf-curr-cell"><span class="pdf-curr-lbl">${c.toUpperCase()}</span><span class="pdf-curr-val">${data.currency ? Math.max(0, Number(data.currency[c]) || 0) : "___"}</span></div>`).join("")}
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
    const equipLimit = isRemarkable ? 12 : 18;
    equipmentList.slice(0, equipLimit).forEach(eq => {
        p2 += `
            <tr>
                <td class="pdf-equip-name">${escapeHtml(eq.name)}${eq.charges ? ` <span class="pdf-equip-charges">(${eq.charges.max} charges)</span>` : ""}</td>
                <td class="pdf-equip-qty">${eq.quantity || 1}</td>
                <td class="pdf-equip-type">${escapeHtml(eq.type || "Item")}</td>
            </tr>
        `;
    });

    const blankEquipRows = Math.max(2, equipLimit - equipmentList.length);
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
    // PAGE 3 (and optional PAGE 4): SPELLCASTING & FILLABLE SLOTS
    // ==========================================
    const hasSpells = (data.spells && data.spells.length > 0) || (data.spellSlots && Object.keys(data.spellSlots).length > 0) || !!data.vitals.spellcastingAbility;

    if (hasSpells) {
        const sections = buildSpellSections(data);
        const maxPage1Height = isRemarkable ? 830 : 860;

        const page1Sections: SpellSection[] = [];
        const page2Sections: SpellSection[] = [];
        let currentP1Height = 0;

        for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            const secHeight = estimateSpellSectionHeight(sec, isRemarkable);

            if (page2Sections.length > 0) {
                page2Sections.push(sec);
                continue;
            }

            if (currentP1Height + secHeight <= maxPage1Height) {
                page1Sections.push(sec);
                currentP1Height += secHeight;
            } else {
                const remainingP1 = maxPage1Height - currentP1Height;
                const baseHeight = isRemarkable ? 44 : 38;
                const rowHeight = isRemarkable ? 28 : 18;
                const availableRows = Math.floor((remainingP1 - baseHeight) / rowHeight);

                if (availableRows >= 3 && sec.spells.length > availableRows * 2) {
                    const splitIndex = availableRows * 2;
                    page1Sections.push({
                        title: sec.title,
                        slotsCount: sec.slotsCount,
                        spells: sec.spells.slice(0, splitIndex)
                    });
                    currentP1Height += baseHeight + availableRows * rowHeight;

                    page2Sections.push({
                        title: `${sec.title} (CONT.)`,
                        slotsCount: 0,
                        spells: sec.spells.slice(splitIndex)
                    });
                } else if (page1Sections.length === 0) {
                    const maxRows = Math.max(1, Math.floor((maxPage1Height - baseHeight) / rowHeight));
                    const splitIndex = maxRows * 2;
                    page1Sections.push({
                        title: sec.title,
                        slotsCount: sec.slotsCount,
                        spells: sec.spells.slice(0, splitIndex)
                    });
                    page2Sections.push({
                        title: `${sec.title} (CONT.)`,
                        slotsCount: 0,
                        spells: sec.spells.slice(splitIndex)
                    });
                } else {
                    page2Sections.push(sec);
                }
            }
        }

        const isMultiPageSpells = page2Sections.length > 0;
        const page3HeaderTitle = isMultiPageSpells ? "Spellcasting &amp; Spell Slots (Page 1 of 2)" : "Spellcasting &amp; Spell Slots";
        const page3FooterTitle = isMultiPageSpells ? "Page 3 — Spellcasting &amp; Spell Slots (Part 1)" : "Page 3 — Spellcasting &amp; Spell Slots";

        let p3 = `
        <div class="${pageClass}">
            <!-- MINI HEADER -->
            <div class="pdf-mini-header">
                <span class="pdf-mini-name">${name}</span>
                <span class="pdf-mini-class">${classSummary}</span>
                <span class="pdf-mini-title">${page3HeaderTitle}</span>
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
                ${page1Sections.map(sec => renderSpellSectionBox(sec, data)).join("")}
            </div>
            <div class="pdf-page-footer">${page3FooterTitle} | ${formatLabel} | The Green Asterisk</div>
        </div>
        `;
        pages.push(p3);

        if (isMultiPageSpells) {
            let p3b = `
            <div class="${pageClass}">
                <!-- MINI HEADER -->
                <div class="pdf-mini-header">
                    <span class="pdf-mini-name">${name}</span>
                    <span class="pdf-mini-class">${classSummary}</span>
                    <span class="pdf-mini-title">Spellcasting &amp; Spell Slots (Page 2 of 2)</span>
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
                    ${page2Sections.map(sec => renderSpellSectionBox(sec, data)).join("")}
                </div>
                <div class="pdf-page-footer">Page 4 — Spellcasting &amp; Spell Slots (Part 2) | ${formatLabel} | The Green Asterisk</div>
            </div>
            `;
            pages.push(p3b);
        }
    }

    // ==========================================
    // DETAILS & NOTES PAGE
    // ==========================================
    const detailsPageNum = pages.length + 1;
    const p4 = renderDetailsPage(data, pageClass, name, classSummary, formatLabel, isRemarkable, detailsPageNum);
    if (p4) pages.push(p4);

    return pages;
}

interface SpellSection {
    title: string;
    slotsCount: number;
    spells: SpellDefinition[];
}

function renderPdfSpellEntry(s: SpellDefinition, data: CharacterData): string {
    const currentLevel = s.castAtLevel ?? s.level;
    const charLevel = data.level || 1;
    const spellcastingMod = getSpellcastingModifier(data, s);
    const damageText = getSpellDamageDisplay(s, currentLevel, charLevel, spellcastingMod);
    const effectText = getSpellEffectDisplay(s, currentLevel, charLevel);

    const metaParts: string[] = [];
    if (s.castingTime) metaParts.push(escapeHtml(s.castingTime));
    if (s.range) metaParts.push(escapeHtml(s.range));
    if (damageText) metaParts.push(`<span class="pdf-spell-damage">${escapeHtml(damageText)}</span>`);
    if (effectText && effectText !== damageText) metaParts.push(`<span class="pdf-spell-effect">${escapeHtml(effectText)}</span>`);

    return `
        <div class="pdf-spell-entry">
            <span class="pdf-spell-bullet">◯</span>
            <span class="pdf-spell-name">${escapeHtml(s.name)}</span>
            <span class="pdf-spell-meta">${metaParts.join(" • ")}</span>
        </div>
    `;
}

function buildSpellSections(data: CharacterData): SpellSection[] {
    const sections: SpellSection[] = [];

    // Pact slots
    const pactSlots = data.spellSlots?.pact?.total ?? 0;
    const pactLevel = data.spellSlots?.pact?.level ?? 5;
    if (pactSlots > 0) {
        const pactSpells = (data.spells || []).filter(s => s.level === pactLevel && s.source?.toLowerCase().includes("warlock"));
        sections.push({
            title: `PACT MAGIC (Level ${pactLevel})`,
            slotsCount: pactSlots,
            spells: pactSpells
        });
    }

    // Cantrips
    const cantrips = (data.spells || []).filter(s => s.level === 0);
    if (cantrips.length > 0) {
        sections.push({
            title: "CANTRIPS (0 LEVEL)",
            slotsCount: 0,
            spells: cantrips
        });
    }

    // Spell Levels 1 through 9
    for (let lvl = 1; lvl <= 9; lvl++) {
        const slotKey = `level${lvl}` as keyof typeof data.spellSlots;
        const slotInfo = data.spellSlots?.[slotKey];
        const maxSlots = slotInfo?.total ?? 0;
        const lvlSpells = (data.spells || []).filter(s => s.level === lvl);

        if (maxSlots > 0 || lvlSpells.length > 0) {
            sections.push({
                title: `${lvl}${getOrdinalSuffix(lvl)} LEVEL`,
                slotsCount: maxSlots,
                spells: lvlSpells
            });
        }
    }

    return sections;
}

function estimateSpellSectionHeight(sec: SpellSection, isRemarkable: boolean): number {
    const baseHeight = isRemarkable ? 44 : 38;
    const rowHeight = isRemarkable ? 28 : 18;
    const rows = Math.ceil(sec.spells.length / 2);
    return baseHeight + rows * rowHeight;
}

function renderSpellSectionBox(sec: SpellSection, data: CharacterData): string {
    return `
        <div class="pdf-spell-level-box">
            <div class="pdf-spell-level-header">
                <span class="pdf-lvl-title">${escapeHtml(sec.title)}</span>
                ${sec.slotsCount > 0 ? renderPips(sec.slotsCount) : ""}
            </div>
            <div class="pdf-spell-items-grid">
                ${sec.spells.map(s => renderPdfSpellEntry(s, data)).join("")}
            </div>
        </div>
    `;
}

/** Text the player wrote, cut to fit a printed box, line breaks kept. */
function printableText(value: string | undefined, limit: number): string {
    // Player notes are plain text: printed as written (escaped), not parsed as HTML
    const clean = String(value || "").replace(/\r\n/g, "\n").trim();
    const cut = clean.length > limit ? `${clean.slice(0, limit).trimEnd()}… (continued on the character sheet)` : clean;
    return escapeHtml(cut).replace(/\r?\n/g, "<br>");
}

/**
 * The Details & Notes page: limited uses with fill-in bubbles (class and species resources, item charges), defenses,
 * character details, personality, backstory and notes, and companions. Left out when there's nothing to print.
 */
function renderDetailsPage(data: CharacterData, pageClass: string, name: string, classSummary: string, formatLabel: string, isRemarkable: boolean, pageNum: number = 4): string | undefined {
    const uses = [
        ...(data.classResources || []).filter(r => r.total > 0).map(r => ({ name: r.name, total: r.total, reset: r.resetOn === "short" ? "Short Rest" : "Long Rest" })),
        ...[...(data.equipment || []), ...(data.weapons || [])].filter(i => i.charges).map(i => ({
            name: i.name, total: i.charges!.max, reset: i.charges!.resetLabel || (i.charges!.resetOn === "dawn" ? "Dawn" : i.charges!.resetOn === "short" ? "Short Rest" : i.charges!.resetOn === "long" ? "Long Rest" : "")
        }))
    ];
    const defenses = [
        ...(data.damageResistances || data.vitals?.damageResistances || []).map(r => `${r} (Resistance)`),
        ...(data.proficiencies?.defenses || []).filter(d => !/\(resistance\)/i.test(d)),
        ...(data.conditionImmunities || data.vitals?.conditionImmunities || []).map(c => `${c} (Condition Immunity)`)
    ];
    const details = data.details || {};
    const detailPairs: Array<[string, unknown]> = [
        ["Gender", details.gender], ["Age", details.age], ["Height", details.height], ["Weight", details.weight],
        ["Hair", details.hair], ["Eyes", details.eyes], ["Skin", details.skin], ["Faith", details.faith],
        ["Lifestyle", details.lifestyle], ["XP", details.experiencePoints]
    ].filter(([, v]) => v !== undefined && String(v).trim() !== "") as Array<[string, unknown]>;
    const notes = data.notes || {};
    const personality: Array<[string, string | undefined]> = [
        ["Personality Traits", notes.personalityTraits], ["Ideals", notes.ideals], ["Bonds", notes.bonds], ["Flaws", notes.flaws], ["Appearance", notes.appearance]
    ];
    const otherNotes: Array<[string, string | undefined]> = [
        ["Backstory", notes.backstory], ["Allies", notes.allies], ["Organizations", notes.organizations], ["Enemies", notes.enemies],
        ["Personal Possessions", notes.personalPossessions], ["Other Holdings", notes.otherHoldings], ["Other Notes", notes.otherNotes]
    ];
    const hasText = [...personality, ...otherNotes].some(([, v]) => v && v.trim());
    const companions = data.companions || [];
    const speciesCasting = (data.spells || []).some(s => isCharacterSpeciesSpell(s)) ? speciesSpellcastingSummary(data) : undefined;
    if (uses.length === 0 && defenses.length === 0 && detailPairs.length === 0 && !hasText && companions.length === 0 && !speciesCasting) return undefined;

    const limit = isRemarkable ? 500 : 700;
    const textBox = (title: string, entries: Array<[string, string | undefined]>) => {
        const filled = entries.filter(([, v]) => v && v.trim());
        if (filled.length === 0) return "";
        return `
            <div class="pdf-outline-box">
                <div class="pdf-box-title">${title}</div>
                ${filled.map(([label, v]) => `<div class="pdf-note-entry"><div class="pdf-note-label">${escapeHtml(label)}</div><div class="pdf-note-text">${printableText(v, label === "Backstory" ? limit * 2 : limit)}</div></div>`).join("")}
            </div>`;
    };

    return `
    <div class="${pageClass} pdf-details-page">
        <div class="pdf-mini-header">
            <span class="pdf-mini-name">${name}</span>
            <span class="pdf-mini-class">${classSummary}</span>
            <span class="pdf-mini-title">Details, Notes &amp; Limited Uses</span>
        </div>

        <div class="pdf-page2-grid">
            <div class="pdf-page2-col">
                ${uses.length > 0 ? `
                <div class="pdf-outline-box">
                    <div class="pdf-box-title">LIMITED USES</div>
                    ${uses.map(u => `
                        <div class="pdf-use-row">
                            <span class="pdf-use-name">${escapeHtml(u.name)}${u.reset ? ` <span class="pdf-use-reset">(${escapeHtml(u.reset)})</span>` : ""}</span>
                            <span class="pdf-use-bubbles">${u.total <= 12 ? "◯".repeat(u.total) : `___ / ${u.total}`}</span>
                        </div>`).join("")}
                </div>` : ""}
                ${speciesCasting ? `
                <div class="pdf-outline-box">
                    <div class="pdf-box-title">SPECIES SPELLCASTING</div>
                    <div class="pdf-note-text">${escapeHtml(data.lineage || data.species || "Species")} spells use ${speciesCasting.ability}: save DC ${speciesCasting.dc}, spell attack ${speciesCasting.attack >= 0 ? "+" : ""}${speciesCasting.attack}</div>
                </div>` : ""}
                ${defenses.length > 0 ? `
                <div class="pdf-outline-box">
                    <div class="pdf-box-title">DEFENSES</div>
                    <div class="pdf-note-text">${escapeHtml(defenses.join(", "))}</div>
                </div>` : ""}
                ${detailPairs.length > 0 ? `
                <div class="pdf-outline-box">
                    <div class="pdf-box-title">CHARACTER DETAILS</div>
                    <div class="pdf-details-grid">
                        ${detailPairs.map(([label, v]) => `<div class="pdf-detail-pair"><span class="pdf-note-label">${label}</span> ${escapeHtml(String(v))}</div>`).join("")}
                    </div>
                </div>` : ""}
                ${companions.length > 0 ? `
                <div class="pdf-outline-box">
                    <div class="pdf-box-title">COMPANIONS</div>
                    ${companions.map(c => `
                        <div class="pdf-note-entry">
                            <div class="pdf-note-label">${escapeHtml(c.name)}${c.type && c.type !== c.name ? ` (${escapeHtml(c.type)})` : ""}</div>
                            <div class="pdf-note-text">${c.armorClass !== undefined ? `AC ${c.armorClass}` : ""}${c.maxHp !== undefined ? ` • HP ___ / ${c.maxHp}` : ""}</div>
                        </div>`).join("")}
                </div>` : ""}
                ${textBox("PERSONALITY", personality)}
            </div>
            <div class="pdf-page2-col">
                ${textBox("BACKSTORY &amp; NOTES", otherNotes)}
            </div>
        </div>

        <div class="pdf-page-footer">Page ${pageNum} — Details, Notes &amp; Limited Uses | ${formatLabel} | The Green Asterisk</div>
    </div>
    `;
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
    const pagePadding = isRemarkable ? "16px 18px" : "20px 22px";
    const col1Width = isRemarkable ? "150px" : "135px";
    const col2Width = isRemarkable ? "250px" : "195px";
    const gridGap = isRemarkable ? "8px" : "8px";

    // Dynamic typography scaling: LARGE, BOLD, TABLET-OPTIMIZED on e-ink
    const titleSize = isRemarkable ? "30px" : "20px";
    const subTitleSize = isRemarkable ? "11px" : "7.5px";
    const detailValSize = isRemarkable ? "14px" : "9.5px";
    const detailLblSize = isRemarkable ? "9.5px" : "7px";
    const headerHeight = isRemarkable ? "78px" : "64px";

    const boxTitleSize = isRemarkable ? "13.5px" : "8.5px";
    const abilityNameSize = isRemarkable ? "12px" : "7.5px";
    const abilityModSize = isRemarkable ? "32px" : "18px";
    const abilityScoreSize = isRemarkable ? "14px" : "9px";
    const abilityBaseSize = isRemarkable ? "9.5px" : "6px";
    const abilityBoxHeight = isRemarkable ? "72px" : "56px";

    const toggleBubbleSize = isRemarkable ? "18px" : "12px";
    const toggleLabelSize = isRemarkable ? "10.5px" : "7px";
    const toggleValSize = isRemarkable ? "18px" : "12px";

    const saveFontSize = isRemarkable ? "14px" : "8.5px";
    const saveRowHeight = isRemarkable ? "22px" : "15px";

    const skillFontSize = isRemarkable ? "13.5px" : "8.5px";
    const skillCheckSize = isRemarkable ? "15px" : "10px";
    const skillBonusSize = isRemarkable ? "14px" : "9px";
    const skillRowHeight = isRemarkable ? "23px" : "16px";
    const skillStatSize = isRemarkable ? "11px" : "7.5px";

    const sensesFontSize = isRemarkable ? "12.5px" : "8px";
    const profsFontSize = isRemarkable ? "12.5px" : "8px";

    const vitalValSize = isRemarkable ? "36px" : "20px";
    const vitalLblSize = isRemarkable ? "11.5px" : "7.5px";
    const vitalBadgeHeight = isRemarkable ? "74px" : "54px";

    const hpMaxFontSize = isRemarkable ? "14px" : "9px";
    const hpBoxTitleSize = isRemarkable ? "11.5px" : "7.5px";
    const hpBlankHeight = isRemarkable ? "54px" : "40px";

    const hdTotalSize = isRemarkable ? "13px" : "8.5px";
    const hdRemLblSize = isRemarkable ? "10.5px" : "7px";
    const dsRowSize = isRemarkable ? "12px" : "7.5px";
    const dsBubbleSize = isRemarkable ? "18px" : "11px";

    const atkThSize = isRemarkable ? "12px" : "8px";
    const atkTdSize = isRemarkable ? "13.5px" : "8.5px";
    const atkBlankHeight = isRemarkable ? "28px" : "18px";

    const footerFontSize = isRemarkable ? "10.5px" : "7.5px";

    const miniNameSize = isRemarkable ? "22px" : "15px";
    const miniSubSize = isRemarkable ? "13.5px" : "9px";

    const featureNameSize = isRemarkable ? "15.5px" : "9.5px";
    const featureSrcSize = isRemarkable ? "11.5px" : "7px";
    const featureDescSize = isRemarkable ? "13px" : "8px";

    const currLblSize = isRemarkable ? "10px" : "6.5px";
    const currValSize = isRemarkable ? "15px" : "9.5px";
    const equipThSize = isRemarkable ? "12px" : "7.5px";
    const equipTdSize = isRemarkable ? "13.5px" : "8.5px";
    const equipRowHeight = isRemarkable ? "28px" : "19px";
    const equipTypeSize = isRemarkable ? "11.5px" : "7.5px";

    const spellStatValSize = isRemarkable ? "28px" : "15px";
    const spellStatLblSize = isRemarkable ? "11.5px" : "7px";
    const spellLvlTitleSize = isRemarkable ? "14.5px" : "8.5px";
    const spellSlotsLblSize = isRemarkable ? "12px" : "7.5px";
    const spellBubbleSize = isRemarkable ? "22px" : "14px";
    const spellEntrySize = isRemarkable ? "14px" : "8px";
    const spellBulletSize = isRemarkable ? "15px" : "10px";
    const spellMetaSize = isRemarkable ? "11.5px" : "7px";
    const spellEntryHeight = isRemarkable ? "26px" : "16px";
    const spellGridCols = "repeat(2, 1fr)";

    const noteTextSize = isRemarkable ? "14px" : "9.5px";
    const noteLabelSize = isRemarkable ? "12px" : "8.5px";
    const noteLineHeight = isRemarkable ? "1.55" : "1.35";
    const noteEntrySpacing = isRemarkable ? "8px" : "4px";
    const noteFontFamily = isRemarkable ? 'Georgia, "Palatino Linotype", "Book Antiqua", Palatino, serif' : 'inherit';
    const useRowSize = isRemarkable ? "13.5px" : "9px";
    const useResetSize = isRemarkable ? "11.5px" : "8px";
    const useBubbleSize = isRemarkable ? "15px" : "10px";
    const detailsGridSize = isRemarkable ? "13px" : "9px";

    return `
        /* --- PDF PRINTABLE STYLES: TABLETOP BLACK & WHITE OUTLINES (${isRemarkable ? "reMarkable 3:4" : "Letter"}) --- */
        :where(.pdf-page, .pdf-page *) {
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
            font-size: ${boxTitleSize};
            font-weight: 900;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #000000;
            border-bottom: 1.5px solid #000000;
            padding-bottom: 2px;
            margin-bottom: 4px;
        }

        /* HEADER BLOCK */
        .pdf-header-block {
            display: flex;
            border: 2px solid #000000;
            border-radius: 6px;
            margin-bottom: 8px;
            height: ${headerHeight};
            overflow: hidden;
        }

        .pdf-header-name-box {
            flex: 0 0 auto;
            min-width: ${isRemarkable ? "140px" : "120px"};
            max-width: ${isRemarkable ? "240px" : "210px"};
            border-right: 2px solid #000000;
            padding: 6px 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .pdf-char-name {
            font-size: ${titleSize};
            font-weight: 900;
            letter-spacing: -0.5px;
            line-height: 1.1;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-char-subtitle {
            font-size: ${subTitleSize};
            font-weight: 700;
            text-transform: uppercase;
            color: #333333;
            margin-top: 2px;
        }

        .pdf-header-details-block {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
            overflow: hidden;
        }

        .pdf-header-row {
            display: flex;
            height: 50%;
            min-width: 0;
        }

        .pdf-header-row-top {
            border-bottom: 1.5px solid #000000;
        }

        .pdf-cell-class {
            flex: 2.2;
            min-width: 0;
        }

        .pdf-cell-race {
            flex: 1;
            min-width: 0;
        }

        .pdf-header-row-bottom .pdf-detail-cell {
            flex: 1;
            min-width: 0;
        }

        .pdf-detail-cell {
            padding: 2px 6px;
            border-right: 1px solid #000000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
        }

        .pdf-detail-cell:last-child {
            border-right: none;
        }

        .pdf-detail-val {
            font-size: ${detailValSize};
            font-weight: 700;
            line-height: 1.15;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-detail-lbl {
            font-size: ${detailLblSize};
            font-weight: 800;
            text-transform: uppercase;
            color: #333333;
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
            height: ${abilityBoxHeight};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
        }

        .pdf-ability-name {
            font-size: ${abilityNameSize};
            font-weight: 900;
            letter-spacing: 0.3px;
        }

        .pdf-ability-mod {
            font-size: ${abilityModSize};
            font-weight: 900;
            line-height: 1;
        }

        .pdf-ability-score {
            font-size: ${abilityScoreSize};
            font-weight: 700;
            border: 1px solid #000000;
            border-radius: 8px;
            padding: 0 5px;
            line-height: 1.1;
        }

        .pdf-ability-base {
            font-size: ${abilityBaseSize};
            color: #444444;
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
            font-size: ${toggleBubbleSize};
            font-weight: 900;
        }

        .pdf-insp-label {
            font-size: ${toggleLabelSize};
            font-weight: 800;
        }

        .pdf-pb-val {
            font-size: ${toggleValSize};
            font-weight: 900;
        }

        .pdf-pb-label {
            font-size: ${toggleLabelSize};
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
            grid-template-columns: ${isRemarkable ? "18px 30px 1fr" : "16px 26px 1fr"};
            align-items: center;
            font-size: ${saveFontSize};
            height: ${saveRowHeight};
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
            grid-template-columns: ${isRemarkable ? "18px 32px 1fr 34px" : "16px 26px 1fr 30px"};
            align-items: center;
            font-size: ${skillFontSize};
            height: ${skillRowHeight};
            line-height: 1;
        }

        .pdf-check-col {
            text-align: center;
            font-size: ${skillCheckSize};
            line-height: 1;
        }

        .pdf-bonus-col {
            text-align: right;
            font-weight: 800;
            font-size: ${skillBonusSize};
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
            font-size: ${skillStatSize};
            color: #444444;
            font-weight: 600;
        }

        /* SENSES & PROFICIENCIES IN COL 2 */
        .pdf-senses-box {
            padding: 4px 6px;
        }

        .pdf-senses-grid {
            font-size: ${sensesFontSize};
            line-height: 1.35;
        }

        .pdf-sense-item {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-profs-box-col2 {
            padding: 4px 6px;
            font-size: ${profsFontSize};
            line-height: 1.35;
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
            height: ${vitalBadgeHeight};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #ffffff;
        }

        .pdf-vital-val {
            font-size: ${vitalValSize};
            font-weight: 900;
            line-height: 1;
        }

        .pdf-vital-lbl {
            font-size: ${vitalLblSize};
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
            font-size: ${hpMaxFontSize};
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
            font-size: ${hpBoxTitleSize};
            font-weight: 900;
            color: #333333;
            text-align: center;
        }

        .pdf-hp-box-blank {
            height: ${hpBlankHeight};
        }

        /* HIT DICE & DEATH SAVES */
        .pdf-hd-ds-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }

        .pdf-hd-total {
            font-size: ${hdTotalSize};
            font-weight: 700;
            margin-bottom: 3px;
        }

        .pdf-hd-remaining-box {
            border: 1px solid #000000;
            border-radius: 3px;
            height: 22px;
            padding: 2px 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .pdf-hd-rem-lbl {
            font-size: ${hdRemLblSize};
            font-weight: 800;
            color: #444444;
        }

        .pdf-ds-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: ${dsRowSize};
            font-weight: 800;
            margin-top: 2px;
        }

        .pdf-ds-bubbles {
            font-size: ${dsBubbleSize};
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
            font-size: ${atkTdSize};
        }

        .pdf-attacks-table th {
            border-bottom: 1.5px solid #000000;
            text-align: left;
            padding: ${isRemarkable ? "4px 5px" : "2px 4px"};
            font-size: ${atkThSize};
            font-weight: 800;
        }

        .pdf-attacks-table td {
            border-bottom: 1px dotted #888888;
            padding: ${isRemarkable ? "4px 5px" : "3px 4px"};
            line-height: 1.15;
        }

        .pdf-atk-bonus {
            font-weight: 800;
            text-align: center;
        }

        .pdf-blank-row td {
            height: ${atkBlankHeight};
        }

        /* PAGE FOOTER */
        .pdf-page-footer {
            margin-top: auto;
            text-align: center;
            font-size: ${footerFontSize};
            color: #444444;
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
            font-size: ${miniNameSize};
            font-weight: 900;
            text-transform: uppercase;
        }

        .pdf-mini-class {
            font-size: ${miniSubSize};
            font-weight: 700;
            color: #333333;
        }

        .pdf-mini-title {
            font-size: ${miniSubSize};
            font-weight: 800;
            text-transform: uppercase;
            border: 1px solid #000000;
            border-radius: 4px;
            padding: 2px 6px;
        }

        /* DETAILS, NOTES & LIMITED USES PAGE */
        .pdf-details-page .pdf-outline-box {
            padding: ${isRemarkable ? "6px 9px" : "5px 7px"};
        }

        .pdf-details-page .pdf-page2-grid {
            gap: ${isRemarkable ? "12px" : "10px"};
        }

        .pdf-details-page .pdf-page2-col {
            gap: ${isRemarkable ? "8px" : "6px"};
        }

        .pdf-use-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: ${isRemarkable ? "8px" : "6px"};
            padding: ${isRemarkable ? "3.5px 0" : "2px 0"};
            border-bottom: 0.5px dotted #64748b;
            font-size: ${useRowSize};
        }

        .pdf-use-name {
            font-weight: 700;
        }

        .pdf-use-reset {
            font-weight: 400;
            font-size: ${useResetSize};
            color: #444444;
        }

        .pdf-use-bubbles {
            letter-spacing: ${isRemarkable ? "3px" : "2px"};
            white-space: nowrap;
            font-size: ${useBubbleSize};
        }

        .pdf-note-entry + .pdf-note-entry {
            margin-top: ${noteEntrySpacing};
        }

        .pdf-note-label {
            font-weight: 800;
            font-size: ${noteLabelSize};
            text-transform: uppercase;
            letter-spacing: ${isRemarkable ? "0.4px" : "0.2px"};
            margin-bottom: ${isRemarkable ? "2px" : "1px"};
            color: #222222;
        }

        .pdf-note-text {
            font-family: ${noteFontFamily};
            font-size: ${noteTextSize};
            line-height: ${noteLineHeight};
            color: #111111;
            overflow-wrap: break-word;
            ${isRemarkable ? "letter-spacing: 0.1px;" : ""}
        }

        .pdf-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: ${isRemarkable ? "4px 10px" : "2px 8px"};
            font-size: ${detailsGridSize};
            line-height: ${isRemarkable ? "1.4" : "1.25"};
        }

        .pdf-detail-pair {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-detail-pair .pdf-note-label {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: ${isRemarkable ? "11px" : "8px"};
        }

        .pdf-equip-charges {
            font-weight: 400;
            font-size: 0.9em;
        }

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
            gap: 5px;
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
            font-size: ${featureNameSize};
            font-weight: 900;
        }

        .pdf-feature-source {
            font-size: ${featureSrcSize};
            font-weight: 700;
            color: #444444;
            text-transform: uppercase;
        }

        .pdf-feature-desc {
            font-size: ${featureDescSize};
            color: #111111;
            line-height: 1.35;
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
            font-size: ${currLblSize};
            font-weight: 800;
        }

        .pdf-curr-val {
            font-size: ${currValSize};
            font-weight: 800;
        }

        .pdf-equip-table {
            width: 100%;
            border-collapse: collapse;
            font-size: ${equipTdSize};
        }

        .pdf-equip-table th {
            border-bottom: 1.5px solid #000000;
            text-align: left;
            padding: 2px 4px;
            font-size: ${equipThSize};
            font-weight: 800;
        }

        .pdf-equip-table td {
            border-bottom: 1px dotted #cccccc;
            padding: 2px 4px;
            height: ${equipRowHeight};
            line-height: 1.15;
        }

        .pdf-equip-qty {
            text-align: center;
            font-weight: 700;
        }

        .pdf-equip-type {
            font-size: ${equipTypeSize};
            color: #444444;
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
            font-size: ${spellStatValSize};
            font-weight: 900;
            line-height: 1.1;
        }

        .pdf-spell-stat-lbl {
            font-size: ${spellStatLblSize};
            font-weight: 800;
            color: #333333;
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
            border-bottom: 1.5px solid #000000;
            padding-bottom: 2px;
            margin-bottom: 3px;
            height: ${isRemarkable ? "26px" : "20px"};
        }

        .pdf-lvl-title {
            font-size: ${spellLvlTitleSize};
            font-weight: 900;
            letter-spacing: 0.3px;
        }

        .pdf-slot-bubbles {
            display: inline-flex;
            gap: ${isRemarkable ? "7px" : "5px"};
            align-items: center;
        }

        .pdf-slots-label {
            font-size: ${spellSlotsLblSize};
            font-weight: 800;
            margin-right: 2px;
        }

        .pdf-bubble {
            font-size: ${spellBubbleSize};
            font-weight: 900;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${spellBubbleSize};
            height: ${spellBubbleSize};
        }

        .pdf-spell-items-grid {
            display: grid;
            grid-template-columns: ${spellGridCols};
            gap: 2px 8px;
        }

        .pdf-spell-entry {
            display: grid;
            grid-template-columns: ${isRemarkable ? "18px 1fr auto" : "14px 1fr auto"};
            align-items: center;
            gap: ${isRemarkable ? "4px" : "2px"};
            font-size: ${spellEntrySize};
            height: ${spellEntryHeight};
            line-height: 1;
            min-width: 0;
        }

        .pdf-spell-bullet {
            font-size: ${spellBulletSize};
            font-weight: 900;
            text-align: center;
        }

        .pdf-spell-name {
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
        }

        .pdf-spell-meta {
            font-size: ${spellMetaSize};
            color: #444444;
            white-space: nowrap;
            margin-left: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pdf-spell-damage {
            font-weight: 800;
            color: #000000;
        }

        .pdf-spell-effect {
            font-style: italic;
            color: #222222;
        }
    `;
}

const PRINT_MOUNT_ID = "pdf-print-mount";

/**
 * Print-only rules: the page size, and hiding everything but the sheet pages while printing. On screen the mount
 * stays hidden. CSS pixels print at 96 per inch, so the 816 × 1056 px Letter page is exactly 8.5 × 11 in, and the
 * 792 px reMarkable page is 8.25 in wide (3:4).
 */
export function getPrintStyles(format: PdfFormat = "letter"): string {
    const pageSize = format === "remarkable" ? "8.25in 11in" : "8.5in 11in";
    return `
        #${PRINT_MOUNT_ID} { display: none; }
        @page { size: ${pageSize}; margin: 0; }
        @media print {
            html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
            body > *:not(#${PRINT_MOUNT_ID}) { display: none !important; }
            #${PRINT_MOUNT_ID} { display: block; }
            #${PRINT_MOUNT_ID} .pdf-page {
                border: none;
                margin: 0;
                break-after: page;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            #${PRINT_MOUNT_ID} .pdf-page:last-child { break-after: auto; }
        }
    `;
}

/** Builds the hidden print mount: the sheet's styles, the print rules, and one element per page. */
export function buildPrintMount(data: CharacterData, format: PdfFormat = "letter"): HTMLElement {
    const mount = document.createElement("div");
    mount.id = PRINT_MOUNT_ID;

    const styleEl = document.createElement("style");
    styleEl.textContent = getPdfStyles(format) + getPrintStyles(format);
    mount.appendChild(styleEl);

    for (const html of generatePdfHtmlPages(data, format)) {
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        const pageEl = wrap.firstElementChild;
        if (pageEl) mount.appendChild(pageEl);
    }
    return mount;
}

/**
 * Lays the sheet out as print pages and opens the browser's print dialog, where "Save as PDF" makes the file.
 * The suggested file name comes from the page title, so the title is swapped until printing ends.
 */
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

    statusCallback?.(`Laying out the black & white ${isRemarkable ? "reMarkable" : "Letter"} sheet...`);

    // A dialog closed without afterprint firing (some mobile browsers) leaves the last mount behind
    document.getElementById(PRINT_MOUNT_ID)?.remove();
    const mount = buildPrintMount(data, format);
    document.body.appendChild(mount);

    await Promise.all(Array.from(mount.querySelectorAll("img")).map(img => img.decode().catch(() => undefined)));

    const previousTitle = document.title;
    const safeName = (data.name || "Character").replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `${safeName}-Character-Sheet-${isRemarkable ? "reMarkable" : "Letter"}`;

    const cleanUp = () => {
        mount.remove();
        document.title = previousTitle;
    };
    window.addEventListener("afterprint", cleanUp, { once: true, signal: el.signal });

    statusCallback?.('Choose "Save as PDF" in the print dialog to save the sheet.');
    try {
        window.print();
    } catch (err) {
        cleanUp();
        throw err;
    }
}
