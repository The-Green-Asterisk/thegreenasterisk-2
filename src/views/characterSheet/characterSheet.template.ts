import Helpers from "@services/helpers";
import { CharacterData, SpellDefinition } from "./characterData";

const html = Helpers.html;

type EditableField = {
    path: string;
    label: string;
    type: "text" | "number" | "checkbox";
    value: string | number | boolean;
};

function collectEditableFields(value: unknown, path = "", fields: EditableField[] = []): EditableField[] {
    if (value === null || value === undefined) {
        return fields;
    }

    if (typeof value === "string") {
        fields.push({ path, label: path || "value", type: "text", value });
        return fields;
    }
    if (typeof value === "number") {
        fields.push({ path, label: path || "value", type: "number", value });
        return fields;
    }
    if (typeof value === "boolean") {
        fields.push({ path, label: path || "value", type: "checkbox", value });
        return fields;
    }

    if (Array.isArray(value)) {
        value.forEach((entry, index) => {
            const entryPath = path ? `${path}[${index}]` : `[${index}]`;
            collectEditableFields(entry, entryPath, fields);
        });
        return fields;
    }

    if (typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
            const entryPath = path ? `${path}.${key}` : key;
            collectEditableFields(entry, entryPath, fields);
        });
    }
    return fields;
}

export function renderEditableSheetContent(data: CharacterData): string {
    const fields = collectEditableFields(data)
        .filter(field => field.path !== "savedCharacterId")
        .sort((a, b) => a.path.localeCompare(b.path));

    const rows = fields.map(field => {
        const label = field.label
            .replace(/\.(\w+)/g, " › $1")
            .replace(/\[(\d+)\]/g, " #$1");

        if (field.type === "checkbox") {
            return `
                <label class="inline-edit-row checkbox-row">
                    <span class="inline-edit-label">${label}</span>
                    <input type="checkbox" class="inline-edit-input" data-field-path="${field.path}" ${field.value ? "checked" : ""} />
                </label>
            `;
        }

        const asText = String(field.value ?? "");
        const isLongText = field.type === "text" && (asText.length > 120 || asText.includes("\n"));
        return `
            <label class="inline-edit-row">
                <span class="inline-edit-label">${label}</span>
                ${isLongText
                ? `<textarea class="inline-edit-input inline-edit-textarea" data-field-path="${field.path}">${asText}</textarea>`
                : `<input type="${field.type}" class="inline-edit-input" data-field-path="${field.path}" value="${asText.replace(/"/g, '&quot;')}" />`}
            </label>
        `;
    }).join("");

    return `
        <section class="sheet-edit-mode">
            <div class="sheet-edit-mode-header">
                <h3><i class="fa-solid fa-pen-to-square"></i> Edit Character Fields</h3>
                <p>All text and numeric fields are editable below. Click <strong>Done Editing</strong> when finished.</p>
            </div>
            <div class="inline-edit-grid">
                ${rows}
            </div>
        </section>
    `;
}

export function renderAbilityCards(data: CharacterData): string {
    return data.abilities.map(ability => {
        const modSign = ability.modifier >= 0 ? `+${ability.modifier}` : `${ability.modifier}`;
        const saveSign = ability.save >= 0 ? `+${ability.save}` : `${ability.save}`;
        const profBadge = ability.proficientSave ? '<span class="prof-dot" title="Proficient saving throw">● Prof</span>' : '';
        return `
            <div class="ability-card ${ability.proficientSave ? 'is-proficient' : ''}">
                <div class="ability-header">${ability.abbr}</div>
                <div class="ability-mod">${modSign}</div>
                <div class="ability-score">${ability.score}</div>
                <div class="ability-save">
                    <span class="save-label">SAVE</span>
                    <span class="save-val">${saveSign}</span>
                    ${profBadge}
                </div>
                ${ability.notes ? `<div class="ability-note" title="${ability.notes}">★ ${ability.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}

export function renderSpellCard(spell: SpellDefinition): string {
    const levelText = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
    const concBadge = spell.concentration ? '<span class="badge badge-conc" title="Concentration">Conc</span>' : '';
    const ritBadge = spell.ritual ? '<span class="badge badge-ritual" title="Ritual">Ritual</span>' : '';
    return `
        <div class="spell-card" data-spell-name="${encodeURIComponent(spell.name)}" tabindex="0" role="button" aria-haspopup="dialog" title="Click to view full spell description">
            <div class="spell-card-top">
                <div class="spell-title-wrap">
                    <h4 class="spell-title">${spell.name}</h4>
                    <span class="spell-school-level">${levelText} • ${spell.school}</span>
                </div>
                <div class="spell-badges">
                    <span class="badge badge-source">${spell.source}</span>
                    ${concBadge}
                    ${ritBadge}
                </div>
            </div>
            <div class="spell-card-meta">
                <div class="meta-item"><span class="meta-label">Time:</span> <span class="meta-value">${spell.castingTime}</span></div>
                <div class="meta-item"><span class="meta-label">Range:</span> <span class="meta-value">${spell.range}</span></div>
                <div class="meta-item"><span class="meta-label">Duration:</span> <span class="meta-value">${spell.duration}</span></div>
            </div>
            <div class="spell-card-footer">
                <span class="view-details-hint"><i class="fa-solid fa-book-open"></i> Full Description</span>
            </div>
        </div>
    `;
}

function spellLevelLabel(level: number): string {
    if (level === 0) return "Cantrips";
    const suffix = level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th";
    return `${level}${suffix}-Level Spells`;
}

function renderLevelSlotMarkers(level: number, spellSlots: CharacterData["spellSlots"]): string {
    if (level === 0) return "";

    const standard = spellSlots[`level${level}`];
    const pact = spellSlots.pact && spellSlots.pact.level === level ? spellSlots.pact : undefined;

    if (!standard && !pact) return "";

    const standardPips = standard
        ? `<span class="header-slot-marker-group" title="${standard.label}">${Array.from({ length: standard.total }).map((_, i) => `
            <button
                type="button"
                class="header-slot-marker-btn active"
                data-header-slot-scope="standard"
                data-header-slot-level="${level}"
                data-header-slot-idx="${i}"
                aria-pressed="true"
                title="Toggle ${spellLevelLabel(level)} slot ${i + 1}"
            ></button>
        `).join("")}</span>`
        : "";

    const pactPips = pact
        ? `<span class="header-slot-marker-group pact" title="${pact.label}">${Array.from({ length: pact.total }).map((_, i) => `
            <button
                type="button"
                class="header-slot-marker-btn pact active"
                data-header-slot-scope="pact"
                data-header-slot-level="pact"
                data-header-slot-idx="${i}"
                aria-pressed="true"
                title="Toggle Pact slot ${i + 1}"
            ></button>
        `).join("")}</span>`
        : "";

    return `<span class="header-slot-markers" aria-label="Available spell slots">${standardPips}${pactPips}</span>`;
}

export function renderSpellsByLevel(spells: SpellDefinition[], spellSlots: CharacterData["spellSlots"]): string {
    const sorted = [...spells].sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    const grouped = new Map<number, SpellDefinition[]>();
    sorted.forEach(spell => {
        const list = grouped.get(spell.level) || [];
        list.push(spell);
        grouped.set(spell.level, list);
    });

    return Array.from(grouped.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([level, levelSpells]) => `
            <section class="spells-level-section" data-spell-level="${level}">
                <header class="spells-level-header">
                    <div class="spells-level-title-row">
                        <h4>${spellLevelLabel(level)}</h4>
                        ${renderLevelSlotMarkers(level, spellSlots)}
                    </div>
                    <span class="spells-level-count">${levelSpells.length}</span>
                </header>
                <div class="spells-grid level-spells-grid">
                    ${levelSpells.map(renderSpellCard).join('')}
                </div>
            </section>
        `)
        .join('');
}

export function renderSkills(data: CharacterData): string {
    return data.skills.map(skill => {
        const bonusStr = skill.bonus >= 0 ? `+${skill.bonus}` : `${skill.bonus}`;
        let profIcon = '<span class="skill-indicator none" title="Not proficient">○</span>';
        let profClass = 'prof-none';
        if (skill.proficiency === 'expertise') {
            profIcon = '<span class="skill-indicator expertise" title="Expertise (Double Proficiency)">★ Expertise</span>';
            profClass = 'prof-expertise';
        } else if (skill.proficiency === 'proficient') {
            profIcon = '<span class="skill-indicator prof" title="Proficient">● Proficient</span>';
            profClass = 'prof-proficient';
        }
        return `
            <div class="skill-row ${profClass}">
                <div class="skill-stat-name">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-stat">(${skill.stat})</span>
                </div>
                <div class="skill-status">${profIcon}</div>
                <div class="skill-bonus">${bonusStr}</div>
            </div>
        `;
    }).join('');
}

export function renderActions(data: CharacterData): string {
    const linkifySpellTags = (value: string) => (value || "").replace(/\[spell\]([\s\S]*?)\[\/spell\]/gi, (_match, spellNameRaw: string) => {
        const spellName = (spellNameRaw || "").trim();
        if (!spellName) return "";
        const encodedSpellName = encodeURIComponent(spellName);
        return `<button type="button" class="action-spell-link inline-spell-link" data-spell-name="${encodedSpellName}" title="Click to view spell details"><i class="fa-solid fa-wand-magic-sparkles"></i> ${spellName}</button>`;
    });

    return data.actions.map((action, index) => {
        const spellBtn = action.spellName
            ? `<button class="action-spell-link" data-spell-name="${encodeURIComponent(action.spellName)}" title="Click to view spell details">
                <i class="fa-solid fa-wand-magic-sparkles"></i> View Spell
               </button>`
            : '';
        return `
            <div
                class="action-card clickable-action-card ${action.spellName ? 'has-spell' : ''}"
                data-action-index="${index}"
                role="button"
                tabindex="0"
                aria-haspopup="dialog"
                title="Click to view full action details"
            >
                <div class="action-header">
                    <div>
                        <h4 class="action-name">${action.name}</h4>
                        <span class="action-badge ${action.type.toLowerCase().replace(/ /g, '-')}">${action.type}</span>
                    </div>
                    ${spellBtn}
                </div>
                <div class="action-stats">
                    <div class="action-stat"><span class="stat-lbl">Range/Reach:</span> <strong>${action.rangeOrReach}</strong></div>
                    <div class="action-stat"><span class="stat-lbl">Hit / DC:</span> <strong>${action.hitOrDc}</strong></div>
                    <div class="action-stat"><span class="stat-lbl">Damage / Effect:</span> <strong>${action.damageOrEffect}</strong></div>
                </div>
                <div class="action-notes">${linkifySpellTags(action.notes)}</div>
                <div class="action-card-footer-hint"><i class="fa-solid fa-expand"></i> Click for full details</div>
            </div>
        `;
    }).join('');
}

export function renderFeatures(data: CharacterData): string {
    return data.features.map(f => {
        return `
            <div class="feature-card">
                <div class="feature-top">
                    <h4 class="feature-name">${f.name}</h4>
                    <span class="feature-badge ${f.type.toLowerCase()}">${f.source}</span>
                </div>
                <p class="feature-desc">${f.description}</p>
            </div>
        `;
    }).join('');
}

export function renderEquipment(data: CharacterData): string {
    return data.equipment.map(item => {
        const equippedBadge = `
            <button
                type="button"
                class="item-badge equip-toggle-btn ${item.equipped ? 'equipped' : 'unequipped'}"
                data-equip-scope="item"
                data-item-name="${encodeURIComponent(item.name)}"
                data-item-id="${item.definitionId || item.id || ''}"
                aria-pressed="${item.equipped ? 'true' : 'false'}"
                title="Toggle equipped state"
            >
                ${item.equipped ? 'Equipped' : 'Unequipped'}
            </button>
        `;
        const attunedBadge = item.attuned ? '<span class="item-badge attuned">Attuned</span>' : '';
        const magicBadge = item.isMagic ? '<span class="item-badge magic"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>' : '';
        const rarityBadge = item.rarity && item.rarity !== 'Common' ? `<span class="item-badge rarity-${item.rarity.toLowerCase().replace(/\s+/g, '-')}">${item.rarity}</span>` : '';
        return `
            <div class="equipment-row clickable-item-card" data-item-name="${encodeURIComponent(item.name)}" data-item-id="${item.definitionId || item.id || ''}" data-item-type="${item.type || ''}" tabindex="0" role="button" title="Click to view details and tiered info">
                <div class="item-info">
                    <span class="item-name"><i class="fa-solid fa-box-open item-lead-icon"></i> ${item.name} ${item.quantity > 1 ? `(${item.quantity})` : ''}</span>
                    <span class="item-type">${item.type}</span>
                </div>
                <div class="item-badges">
                    ${equippedBadge}
                    ${attunedBadge}
                    ${magicBadge}
                    ${rarityBadge}
                </div>
                ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}

export function renderWeapons(data: CharacterData): string {
    const weps = data.weapons || [];
    if (weps.length === 0) {
        return `
            <div class="no-results">
                <i class="fa-solid fa-shield"></i>
                <p>No weapons in inventory.</p>
            </div>
        `;
    }

    return weps.map(w => {
        const equippedBadge = `
            <button
                type="button"
                class="weapon-badge equip-toggle-btn ${w.equipped ? 'equipped' : 'unequipped'}"
                data-equip-scope="weapon"
                data-weapon-name="${encodeURIComponent(w.name)}"
                data-weapon-id="${w.definitionId || w.id || ''}"
                aria-pressed="${w.equipped ? 'true' : 'false'}"
                title="Toggle equipped state"
            >
                <i class="fa-solid ${w.equipped ? 'fa-check' : 'fa-minus'}"></i> ${w.equipped ? 'Equipped' : 'Unequipped'}
            </button>
        `;
        const propBadges = w.properties.map(p => `<span class="weapon-prop-badge">${p}</span>`).join('');
        const magicBadge = w.isMagic ? '<span class="weapon-badge magic"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>' : '';
        const masteryBadge = w.mastery
            ? `<button
                type="button"
                class="weapon-mastery-badge mastery-toggle-btn ${w.mastery.unlocked ? 'unlocked' : 'locked'}"
                data-equip-scope="weapon-mastery"
                data-weapon-name="${encodeURIComponent(w.name)}"
                data-weapon-id="${w.definitionId || w.id || ''}"
                data-mastery-name="${encodeURIComponent(w.mastery.name)}"
                aria-pressed="${w.mastery.unlocked ? 'true' : 'false'}"
                title="${w.mastery.description || w.mastery.name} (Click to toggle)"
            >
                <i class="fa-solid fa-burst"></i> Mastery: ${w.mastery.name}${w.mastery.unlocked ? ' (Active)' : ''}
               </button>`
            : '';

        return `
            <div class="weapon-card ${w.equipped ? 'is-equipped' : ''} clickable-weapon-card" data-weapon-name="${encodeURIComponent(w.name)}" data-weapon-id="${w.definitionId || w.id || ''}" data-weapon-type="Weapon" tabindex="0" role="button" title="Click to view details and tiered info">
                <div class="weapon-card-header">
                    <div class="weapon-title-group">
                        <h4 class="weapon-name">
                            <i class="fa-solid fa-khanda weapon-icon"></i> ${w.name} ${w.quantity > 1 ? `<span class="weapon-qty">(&times;${w.quantity})</span>` : ''}
                        </h4>
                        <span class="weapon-category">${w.category}</span>
                    </div>
                    <div class="weapon-status-badges">
                        ${equippedBadge}
                        ${magicBadge}
                        ${masteryBadge}
                    </div>
                </div>

                <div class="weapon-combat-stats">
                    <div class="wstat-box atk-stat">
                        <span class="wstat-label"><i class="fa-solid fa-crosshairs"></i> ATTACK</span>
                        <span class="wstat-val">${w.attackBonus}</span>
                    </div>
                    <div class="wstat-box dmg-stat">
                        <span class="wstat-label"><i class="fa-solid fa-burst"></i> DAMAGE</span>
                        <span class="wstat-val">${w.damage}</span>
                    </div>
                    <div class="wstat-box range-stat">
                        <span class="wstat-label"><i class="fa-solid fa-arrows-left-right"></i> RANGE</span>
                        <span class="wstat-val">${w.range}</span>
                    </div>
                </div>

                <div class="weapon-properties-list">
                    ${propBadges}
                </div>

                ${w.notes ? `<div class="weapon-notes">${w.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}

export function renderSpellSlotsAndResources(data: CharacterData): string {
    const slotTrackers: string[] = [];

    // 1. Standard Level 1-9 Spell Slots
    for (let lvl = 1; lvl <= 9; lvl++) {
        const slot = data.spellSlots[`level${lvl}`];
        if (slot && slot.total > 0) {
            const pips = Array.from({ length: slot.total })
                .map((_, i) => `<button class="pip active" data-pip-lvl="${lvl}" data-pip-idx="${i}" aria-label="Level ${lvl} slot ${i + 1}"></button>`)
                .join('');
            slotTrackers.push(`
                <div class="slot-tracker" data-slot-level="${lvl}">
                    <div class="slot-header">
                        <span class="slot-name">${slot.label || `Level ${lvl}`}</span>
                        <span class="slot-count" id="count-lvl-${lvl}">${slot.total} / ${slot.total}</span>
                    </div>
                    <div class="slot-pips" id="pips-lvl-${lvl}">
                        ${pips}
                    </div>
                </div>
            `);
        }
    }

    // 2. Warlock Pact Magic
    if (data.spellSlots.pact && data.spellSlots.pact.total > 0) {
        const pact = data.spellSlots.pact;
        const pips = Array.from({ length: pact.total })
            .map((_, i) => `<button class="pip active pact-pip" data-pip-lvl="pact" data-pip-idx="${i}" aria-label="Pact slot ${i + 1}"></button>`)
            .join('');
        slotTrackers.push(`
            <div class="slot-tracker pact-magic" data-slot-level="pact">
                <div class="slot-header">
                    <span class="slot-name">${pact.label || 'Pact Magic'}</span>
                    <span class="slot-count" id="count-lvl-pact">${pact.total} / ${pact.total}</span>
                </div>
                <div class="slot-pips" id="pips-lvl-pact">
                    ${pips}
                </div>
            </div>
        `);
    }

    // 3. Class Specific Resources (Rages, Ki, Channel Divinity, Wild Shape, Action Surge, etc.)
    const resources = data.classResources && data.classResources.length > 0
        ? data.classResources
        : (data.bardicCount ? [{
            name: "Bardic Inspiration (d8)",
            total: data.bardicCount,
            resetOn: "short" as const,
            dieOrType: "d8",
            key: "bardic"
        }] : []);

    resources.forEach((res, resIdx) => {
        const resKey = res.key || `res-${resIdx}`;
        // Cap visual pips at 20 if pool is larger (e.g. Lay on Hands 60 pool)
        const isCounterOnly = res.total > 12;
        let pipsHtml = "";
        if (!isCounterOnly) {
            pipsHtml = Array.from({ length: res.total })
                .map((_, i) => `<button class="pip active bardic-pip" data-resource-key="${resKey}" data-reset-on="${res.resetOn}" data-pip-idx="${i}" aria-label="${res.name} ${i + 1}"></button>`)
                .join('');
        } else {
            pipsHtml = `<div class="resource-counter-pill"><span class="res-pool-value">${res.total} Points Available</span> <span class="res-reset-badge">Resets on ${res.resetOn} rest</span></div>`;
        }

        slotTrackers.push(`
            <div class="slot-tracker class-resource-tracker" data-resource-key="${resKey}" data-reset-on="${res.resetOn}">
                <div class="slot-header">
                    <span class="slot-name">${res.name}</span>
                    <span class="slot-count" id="count-${resKey}">${res.total} / ${res.total}</span>
                </div>
                <div class="slot-pips" id="pips-${resKey}">
                    ${pipsHtml}
                </div>
            </div>
        `);
    });

    if (slotTrackers.length === 0) {
        return `
            <div class="no-resources-note">
                <p><i class="fa-solid fa-feather"></i> This adventurer has no tracked spell slots or expendable daily resources.</p>
            </div>
        `;
    }

    return slotTrackers.join('');
}

export function renderSheetContent(data: CharacterData): string {
    const classText = data.classes
        .map(c => `<strong>${c.name} ${c.level}</strong>${c.subclass ? ` (${c.subclass})` : ''}`)
        .join(' / ');

    const cantripsCount = data.spells.filter(s => s.level === 0).length;
    const lvl1Count = data.spells.filter(s => s.level === 1).length;
    const lvl2Count = data.spells.filter(s => s.level === 2).length;
    const lvl3Count = data.spells.filter(s => s.level === 3).length;
    const highLevelCount = data.spells.filter(s => s.level >= 4).length;

    return `
        <section class="sheet-hero">
            <div class="sheet-identity">
                <div class="avatar-wrap">
                    <img src="${data.avatarUrl}" alt="${data.name}" class="character-avatar" />
                    <span class="level-pill">LVL ${data.level}</span>
                </div>
                <div class="identity-info">
                    <div class="title-row">
                        <h1 class="character-name">${data.name}</h1>
                        <div class="inspiration-badge ${data.vitals.heroicInspiration ? 'active' : ''}" id="inspiration-toggle" title="Heroic Inspiration (Click to toggle)">
                            <i class="fa-solid fa-star"></i>
                            <span>Heroic Inspiration</span>
                        </div>
                    </div>
                    <p class="character-classes">
                        ${classText}
                    </p>
                    <div class="character-tags">
                        <span class="tag"><i class="fa-solid fa-dna"></i> ${data.race}</span>
                        <span class="tag"><i class="fa-solid fa-masks-theater"></i> ${data.background}</span>
                        <span class="tag"><i class="fa-solid fa-scale-balanced"></i> ${data.alignment}</span>
                        <a href="${data.dndBeyondUrl}" target="_blank" rel="noopener noreferrer" class="tag tag-link">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> D&D Beyond
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section class="vitals-section" aria-label="Core Combat Statistics">
        
            <div class="abilities-container" aria-label="Ability Scores & Saving Throws">
                ${renderAbilityCards(data)}
            </div>

            <div class="vitals-grid">
                <div class="vital-card vital-hp">
                    <div class="vital-header">
                        <span class="vital-title"><i class="fa-solid fa-heart-pulse"></i> HIT POINTS</span>
                        <span class="vital-sub" id="hp-ratio">${data.vitals.currentHp} / ${data.vitals.maxHp} Max</span>
                    </div>
                    <div class="hp-gauge">
                        <div class="hp-bar-fill" id="hp-bar-fill" style="width: ${Math.round((data.vitals.currentHp / data.vitals.maxHp) * 100)}%;"></div>
                    </div>
                    <div class="hp-controls">
                        <button class="hp-btn" data-hp-delta="-5">-5</button>
                        <button class="hp-btn" data-hp-delta="-1">-1</button>
                        <span class="hp-current-display" id="hp-display">${data.vitals.currentHp}</span>
                        <button class="hp-btn" data-hp-delta="1">+1</button>
                        <button class="hp-btn" data-hp-delta="5">+5</button>
                    </div>
                    <div class="vital-footer-note">Hit Dice: ${data.vitals.hitDice}</div>
                </div>

                <div class="vital-card vital-ac">
                    <div class="vital-icon"><i class="fa-solid fa-shield-halved"></i></div>
                    <div class="vital-val">${data.vitals.armorClass}</div>
                    <div class="vital-label">ARMOR CLASS</div>
                    <div class="vital-subnote">Armor & DEX</div>
                </div>

                <div class="vital-card vital-init">
                    <div class="vital-icon"><i class="fa-solid fa-bolt"></i></div>
                    <div class="vital-val">${data.vitals.initiative >= 0 ? `+${data.vitals.initiative}` : data.vitals.initiative}</div>
                    <div class="vital-label">INITIATIVE</div>
                    <div class="vital-subnote">DEX Modifier</div>
                </div>

                <div class="vital-card vital-speed">
                    <div class="vital-icon"><i class="fa-solid fa-person-running"></i></div>
                    <div class="vital-val">${data.vitals.speed}</div>
                    <div class="vital-label">WALKING SPEED</div>
                    <div class="vital-subnote">Base Speed</div>
                </div>

                <div class="vital-card vital-dc">
                    <div class="vital-icon"><i class="fa-solid fa-wand-magic"></i></div>
                    <div class="vital-val">${data.vitals.spellSaveDc}</div>
                    <div class="vital-label">SPELL SAVE DC</div>
                    <div class="vital-subnote">${data.vitals.spellcastingAbility}</div>
                </div>

                <div class="vital-card vital-attack">
                    <div class="vital-icon"><i class="fa-solid fa-crosshairs"></i></div>
                    <div class="vital-val">+${data.vitals.spellAttackBonus}</div>
                    <div class="vital-label">SPELL ATTACK</div>
                    <div class="vital-subnote">Prof + Ability</div>
                </div>

                <div class="vital-card vital-prof">
                    <div class="vital-icon"><i class="fa-solid fa-award"></i></div>
                    <div class="vital-val">+${data.vitals.proficiencyBonus}</div>
                    <div class="vital-label">PROFICIENCY</div>
                    <div class="vital-subnote">Level ${data.level} Tier</div>
                </div>

                <div class="vital-card vital-passive-perception">
                    <div class="vital-icon"><i class="fa-solid fa-eye"></i></div>
                    <div class="vital-val">${data.vitals.passivePerception}</div>
                    <div class="vital-label">PASSIVE PERCEPTION</div>
                    <div class="vital-subnote">Awareness</div>
                </div>

                <div class="vital-card vital-passive-investigation">
                    <div class="vital-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <div class="vital-val">${data.vitals.passiveInvestigation}</div>
                    <div class="vital-label">PASSIVE INVESTIGATION</div>
                    <div class="vital-subnote">Clues & details</div>
                </div>

                <div class="vital-card vital-passive-insight">
                    <div class="vital-icon"><i class="fa-solid fa-brain"></i></div>
                    <div class="vital-val">${data.vitals.passiveInsight}</div>
                    <div class="vital-label">PASSIVE INSIGHT</div>
                    <div class="vital-subnote">Read people</div>
                </div>

                <div class="vital-card vital-special-senses">
                    <div class="vital-icon"><i class="fa-solid fa-eye"></i></div>
                    <div class="vital-label">SPECIAL SENSES</div>
                    <div class="special-senses-list">
                        <div class="special-sense-row"><span>Blindsight</span><strong class="sense-blindsight-val">${data.vitals.blindsight || '—'}</strong></div>
                        <div class="special-sense-row"><span>Darkvision</span><strong class="sense-darkvision-val">${data.vitals.darkvision || '—'}</strong></div>
                        <div class="special-sense-row"><span>Tremorsense</span><strong class="sense-tremorsense-val">${data.vitals.tremorsense || '—'}</strong></div>
                        <div class="special-sense-row"><span>Truesight</span><strong class="sense-truesight-val">${data.vitals.truesight || '—'}</strong></div>
                    </div>
                </div>
            </div>

        </section>

        <section class="resources-section" aria-label="Spell Slots & Combat Resources">
            <div class="section-title-bar">
                <h3><i class="fa-solid fa-sparkles"></i> Spell Slots & Resources</h3>
                <div class="resource-actions">
                    <button class="rest-btn" id="short-rest-btn" title="Reset Short Rest slots and features">
                        <i class="fa-solid fa-mug-hot"></i> Short Rest
                    </button>
                    <button class="rest-btn" id="long-rest-btn" title="Reset all spell slots, features, and Hit Points">
                        <i class="fa-solid fa-bed"></i> Long Rest
                    </button>
                </div>
            </div>

            <div class="slots-grid" id="slots-and-resources-grid">
                ${renderSpellSlotsAndResources(data)}
            </div>
        </section>

        <section class="tabs-section">
            <div class="tab-nav" role="tablist" aria-label="Character Sheet Views">
                <button class="tab-btn active" role="tab" aria-selected="true" data-tab-target="tab-weapons" id="btn-tab-weapons">
                    <i class="fa-solid fa-khanda"></i> Weapons <span class="tab-count" id="tab-weapons-count">(${data.weapons?.length || 0})</span>
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-spells" id="btn-tab-spells">
                    <i class="fa-solid fa-wand-sparkles"></i> Spells <span class="tab-count" id="tab-spells-count">(${data.spells.length})</span>
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-actions" id="btn-tab-actions">
                    <i class="fa-solid fa-bolt"></i> Actions & Attacks
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-features" id="btn-tab-features">
                    <i class="fa-solid fa-scroll"></i> Features & Traits
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-skills" id="btn-tab-skills">
                    <i class="fa-solid fa-bullseye"></i> Skills & Saves
                </button>
                <button class="tab-btn" role="tab" aria-selected="false" data-tab-target="tab-equipment" id="btn-tab-equipment">
                    <i class="fa-solid fa-shield"></i> Equipment & Proficiencies
                </button>
            </div>

            <div class="tab-pane active" id="tab-weapons" role="tabpanel" aria-labelledby="btn-tab-weapons">
                <div class="weapons-container">
                    <div class="weapons-header-banner">
                        <div class="weapons-header-info">
                            <h3><i class="fa-solid fa-khanda"></i> Weapons & Attack Mastery</h3>
                            <p class="tab-lead-note">Equipped and carried weapons, attack bonuses, damage formulas, weapon properties, and 2024 Weapon Masteries. Click any weapon for full tiered details.</p>
                        </div>
                    </div>
                    <div class="weapons-grid">
                        ${renderWeapons(data)}
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-spells" role="tabpanel" aria-labelledby="btn-tab-spells">
                <div class="spell-filters-bar">
                    <div class="search-box">
                        <i class="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" id="spell-search" placeholder="Search spells by name, school, source, tags..." autocomplete="off" />
                        <button id="spell-search-clear" class="clear-search-btn" title="Clear search" style="display: none;">&times;</button>
                    </div>
                    <div class="filter-chips" id="spell-filter-chips">
                        <button class="filter-chip active" data-filter="all">All (${data.spells.length})</button>
                        ${cantripsCount > 0 ? `<button class="filter-chip" data-filter="cantrip">Cantrips (${cantripsCount})</button>` : ''}
                        ${lvl1Count > 0 ? `<button class="filter-chip" data-filter="lvl-1">1st Level (${lvl1Count})</button>` : ''}
                        ${lvl2Count > 0 ? `<button class="filter-chip" data-filter="lvl-2">2nd Level (${lvl2Count})</button>` : ''}
                        ${lvl3Count > 0 ? `<button class="filter-chip" data-filter="lvl-3">3rd Level (${lvl3Count})</button>` : ''}
                        ${highLevelCount > 0 ? `<button class="filter-chip" data-filter="lvl-high">4th+ Level (${highLevelCount})</button>` : ''}
                        <button class="filter-chip" data-filter="conc">Concentration</button>
                        <button class="filter-chip" data-filter="ritual">Rituals</button>
                    </div>
                    <button class="add-custom-spell-btn" id="open-custom-spell-btn" title="Add a custom spell to this character and database">
                        <i class="fa-solid fa-plus"></i> Add Custom Spell
                    </button>
                </div>

                <div class="spells-click-prompt">
                    <i class="fa-solid fa-circle-info"></i> <em>Click any spell below to load its full description independently (Database &rarr; D&D Beyond &rarr; Open5e).</em>
                </div>

                <div id="spells-grid">
                    ${renderSpellsByLevel(data.spells, data.spellSlots)}
                </div>
                <div id="no-spells-found" class="no-results" style="display: none;">
                    <i class="fa-solid fa-ghost"></i>
                    <p>No spells matched your search filter.</p>
                </div>
            </div>

            <div class="tab-pane" id="tab-actions" role="tabpanel" aria-labelledby="btn-tab-actions">
                <div class="actions-container">
                    ${(data.weapons && data.weapons.length > 0) ? `
                        <div class="actions-weapons-highlight">
                            <h4><i class="fa-solid fa-khanda"></i> Weapon Attacks</h4>
                            <div class="weapons-grid">
                                ${renderWeapons(data)}
                            </div>
                        </div>
                    ` : ''}
                    <h4><i class="fa-solid fa-bolt"></i> Actions & Special Abilities</h4>
                    <p class="tab-lead-note">Common actions, bonus actions, reactions, and offensive cantrips. Spells can be clicked to view their full card.</p>
                    <div class="actions-grid">
                        ${renderActions(data)}
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-features" role="tabpanel" aria-labelledby="btn-tab-features">
                <div class="features-container">
                    <div class="features-grid">
                        ${renderFeatures(data)}
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-skills" role="tabpanel" aria-labelledby="btn-tab-skills">
                <div class="skills-container">
                    <div class="skills-grid">
                        <div class="skills-list">
                            <h3>All Skills</h3>
                            ${renderSkills(data)}
                        </div>
                        <div class="senses-and-training">
                            <h3>Senses & Proficiencies</h3>
                            <div class="sense-card">
                                <h4>Passive Senses</h4>
                                <ul>
                                    <li><strong>Passive Perception:</strong> ${data.vitals.passivePerception}</li>
                                    <li><strong>Passive Investigation:</strong> ${data.vitals.passiveInvestigation}</li>
                                    <li><strong>Passive Insight:</strong> ${data.vitals.passiveInsight}</li>
                                    <li><strong>Blindsight:</strong> ${data.vitals.blindsight || '—'}</li>
                                    <li><strong>Darkvision:</strong> ${data.vitals.darkvision}</li>
                                    <li><strong>Tremorsense:</strong> ${data.vitals.tremorsense || '—'}</li>
                                    <li><strong>Truesight:</strong> ${data.vitals.truesight || '—'}</li>
                                </ul>
                            </div>
                            <div class="sense-card">
                                <h4>Training & Languages</h4>
                                <p><strong>Armor:</strong> ${data.proficiencies.armor.length ? data.proficiencies.armor.join(', ') : 'None'}</p>
                                <p><strong>Weapons:</strong> ${data.proficiencies.weapons.length ? data.proficiencies.weapons.join(', ') : 'None'}</p>
                                <p><strong>Tools & Instruments:</strong> ${data.proficiencies.tools.length ? data.proficiencies.tools.join(', ') : 'None'}</p>
                                <p><strong>Languages:</strong> ${data.proficiencies.languages.length ? data.proficiencies.languages.join(', ') : 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tab-pane" id="tab-equipment" role="tabpanel" aria-labelledby="btn-tab-equipment">
                <div class="equipment-container">
                    <div class="equipment-header-banner">
                        <p class="tab-lead-note">Equipment, inventory items, and magical gear. Click any magic item or equipment to view full tiered details.</p>
                    </div>
                    <div class="equipment-grid">
                        ${renderEquipment(data)}
                    </div>
                </div>
            </div>
        </section>
    `;
}

const characterSheetTemplate = () => html`
    <el-character-sheet>
        <div class="content-slate">
            <section class="character-loader-bar" aria-label="Load D&D Beyond Character">
                <div class="character-loader-header">
                    <h3 class="character-loader-title"><i class="fa-solid fa-dragon"></i> Character Loader</h3>
                    <button type="button" id="character-loader-toggle-btn" class="loader-collapse-btn" aria-expanded="true" aria-controls="character-loader-content" title="Collapse loader">
                        <i class="fa-solid fa-chevron-up"></i>
                    </button>
                </div>
                <div id="character-loader-content" class="character-loader-content">
                    <form id="dndbeyond-load-form" class="load-form">
                        <div class="load-input-wrap">
                            <i class="fa-solid fa-dragon load-icon"></i>
                            <input
                                type="text"
                                id="dndbeyond-id-input"
                                placeholder="Enter D&D Beyond ID/URL or site ID (e.g. tga-abc12345)"
                                value=""
                                autocomplete="off"
                            />
                        </div>
                        <button type="button" id="load-character-btn" class="load-btn">
                            <i class="fa-solid fa-bolt"></i> Load Character
                        </button>
                        <button type="button" id="create-character-btn" class="load-btn secondary hidden" title="Create a brand new site character sheet">
                            <i class="fa-solid fa-user-plus"></i> New Character
                        </button>
                        <button type="button" id="edit-character-fields-btn" class="load-btn secondary hidden" title="Edit character fields in-place">
                            <i class="fa-solid fa-pen"></i> Edit Fields
                        </button>
                        <button type="button" id="save-character-btn" class="load-btn hidden" title="Save this character to your account">
                            <i class="fa-solid fa-floppy-disk"></i> Save Character
                        </button>
                    </form>
                    <label class="rules-preference-toggle" title="Prefer 2024-aligned sources where possible (D&D Beyond and local data before SRD fallbacks)">
                        <input type="checkbox" id="prefer-2024-rules-toggle" checked />
                        <span>Prefer 2024 rules sources</span>
                    </label>
                    <div id="character-status-message" class="status-msg hidden" role="alert"></div>
                    </div>
            </section>

            <div id="character-sheet-dynamic-content" class="sheet-dynamic-content">
            </div>
        </div>

        <div id="spell-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true">
            <div class="spell-modal-dialog" id="spell-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips" id="modal-badges"></div>
                        <h2 id="modal-spell-name" class="modal-spell-title">Spell Name</h2>
                        <div id="modal-spell-type" class="modal-spell-sub">Level • School</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="spell-modal-close-btn" aria-label="Close spell details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-meta-grid">
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-regular fa-clock"></i> CASTING TIME</span>
                        <span class="meta-box-val" id="modal-casting-time">1 Action</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-bullseye"></i> RANGE / AREA</span>
                        <span class="meta-box-val" id="modal-range">60 ft.</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-regular fa-hourglass-half"></i> DURATION</span>
                        <span class="meta-box-val" id="modal-duration">Instantaneous</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-hand-sparkles"></i> COMPONENTS</span>
                        <span class="meta-box-val" id="modal-components">V, S</span>
                    </div>
                </div>

                <div class="spell-modal-body">
                    <div class="modal-image-container hidden" id="modal-spell-image-wrap">
                        <img id="modal-spell-image" class="modal-detail-img" src="" alt="Spell Illustration" />
                    </div>
                    <div id="modal-spell-description">
                    </div>
                </div>

                <footer class="spell-modal-footer">
                    <span id="modal-spell-source" class="modal-footer-source">Source: Bard</span>
                    <button type="button" class="modal-action-btn" id="modal-close-action-btn">Close</button>
                </footer>
            </div>
        </div>

        <!-- ADD CUSTOM SPELL MODAL -->
        <div id="custom-spell-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true">
            <div class="spell-modal-dialog custom-spell-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <h2 class="modal-spell-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Add Custom Spell</h2>
                        <div class="modal-spell-sub">Saves into local database and attaches to active character sheet</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="custom-spell-close-btn" aria-label="Close custom spell modal">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <form id="custom-spell-form" class="custom-spell-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="custom-spell-name">Spell Name *</label>
                            <input type="text" id="custom-spell-name" required placeholder="e.g. Swamptown Smite" />
                        </div>
                        <div class="form-group">
                            <label for="custom-spell-level">Level *</label>
                            <select id="custom-spell-level">
                                <option value="0">Cantrip (0)</option>
                                <option value="1">1st Level</option>
                                <option value="2">2nd Level</option>
                                <option value="3">3rd Level</option>
                                <option value="4">4th Level</option>
                                <option value="5">5th Level</option>
                                <option value="6">6th Level</option>
                                <option value="7">7th Level</option>
                                <option value="8">8th Level</option>
                                <option value="9">9th Level</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="custom-spell-school">School</label>
                            <input type="text" id="custom-spell-school" placeholder="e.g. Evocation, Transmutation" value="Evocation" />
                        </div>
                        <div class="form-group">
                            <label for="custom-spell-time">Casting Time</label>
                            <input type="text" id="custom-spell-time" placeholder="1 Action, 1 Bonus Action..." value="1 Action" />
                        </div>
                        <div class="form-group">
                            <label for="custom-spell-range">Range / Area</label>
                            <input type="text" id="custom-spell-range" placeholder="60 ft., Self, Touch..." value="60 ft." />
                        </div>
                        <div class="form-group">
                            <label for="custom-spell-duration">Duration</label>
                            <input type="text" id="custom-spell-duration" placeholder="Instantaneous, 1 Minute..." value="Instantaneous" />
                        </div>
                        <div class="form-group">
                            <label for="custom-spell-components">Components</label>
                            <input type="text" id="custom-spell-components" placeholder="V, S, M (a pinch of salt)" value="V, S" />
                        </div>
                        <div class="form-group checkboxes-group">
                            <label><input type="checkbox" id="custom-spell-concentration" /> Concentration</label>
                            <label><input type="checkbox" id="custom-spell-ritual" /> Ritual</label>
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label for="custom-spell-description">Description *</label>
                        <textarea id="custom-spell-description" rows="5" required placeholder="Describe the spell's effects, damage, saving throws, and higher-level scaling..."></textarea>
                    </div>
                    <div id="custom-spell-status" class="status-msg hidden"></div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" id="custom-spell-cancel-btn">Cancel</button>
                        <button type="submit" class="save-btn" id="custom-spell-save-btn"><i class="fa-solid fa-floppy-disk"></i> Save Spell to Database</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- ITEM & WEAPON DETAILS MODAL -->
        <div id="item-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-item-name">
            <div class="spell-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <h2 class="modal-spell-title" id="modal-item-name">Item Name</h2>
                        <div class="modal-spell-sub" id="modal-item-type">Weapon / Magic Item</div>
                        <div class="modal-spell-badges" id="modal-item-badges">
                            <!-- Injected badges: Tier, Rarity, Magic, Mastery -->
                        </div>
                    </div>
                    <button type="button" class="spell-modal-close" id="item-modal-close-btn" aria-label="Close item details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-meta-grid" id="modal-item-meta-grid">
                    <div class="meta-box" id="modal-item-meta-combat">
                        <span class="meta-box-label"><i class="fa-solid fa-crosshairs"></i> DAMAGE / EFFECT</span>
                        <span class="meta-box-val" id="modal-item-damage">—</span>
                    </div>
                    <div class="meta-box" id="modal-item-meta-range">
                        <span class="meta-box-label"><i class="fa-solid fa-arrows-left-right"></i> RANGE / REACH</span>
                        <span class="meta-box-val" id="modal-item-range">—</span>
                    </div>
                    <div class="meta-box" id="modal-item-meta-props">
                        <span class="meta-box-label"><i class="fa-solid fa-tags"></i> PROPERTIES</span>
                        <span class="meta-box-val" id="modal-item-properties">—</span>
                    </div>
                    <div class="meta-box" id="modal-item-meta-weight">
                        <span class="meta-box-label"><i class="fa-solid fa-weight-hanging"></i> WEIGHT / COST</span>
                        <span class="meta-box-val" id="modal-item-weight">—</span>
                    </div>
                </div>

                <div class="spell-modal-body">
                    <div class="modal-image-container hidden" id="modal-item-image-wrap">
                        <img id="modal-item-image" class="modal-detail-img" src="" alt="Item Illustration" />
                    </div>
                    <div id="modal-item-description">
                    </div>
                </div>

                <footer class="spell-modal-footer">
                    <span id="modal-item-source" class="modal-footer-source">Source: Database</span>
                    <button type="button" class="modal-action-btn" id="modal-item-close-action-btn">Close</button>
                </footer>
            </div>
        </div>

        <!-- ACTION DETAILS MODAL -->
        <div id="action-modal-container" class="spell-modal-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-action-name">
            <div class="spell-modal-dialog action-modal-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <h2 class="modal-spell-title" id="modal-action-name">Action</h2>
                        <div class="modal-spell-sub" id="modal-action-type">Action</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="action-modal-close-btn" aria-label="Close action details">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="spell-modal-meta-grid action-modal-meta-grid">
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-arrows-left-right"></i> RANGE / REACH</span>
                        <span class="meta-box-val" id="modal-action-range">—</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-dice-d20"></i> HIT / DC</span>
                        <span class="meta-box-val" id="modal-action-hit-dc">—</span>
                    </div>
                    <div class="meta-box">
                        <span class="meta-box-label"><i class="fa-solid fa-burst"></i> DAMAGE / EFFECT</span>
                        <span class="meta-box-val" id="modal-action-damage">—</span>
                    </div>
                </div>

                <div class="spell-modal-body action-modal-body">
                    <div id="modal-action-notes"></div>
                </div>

                <footer class="spell-modal-footer">
                    <span class="modal-footer-source">Action Details</span>
                    <button type="button" class="modal-action-btn" id="modal-action-close-action-btn">Close</button>
                </footer>
            </div>
        </div>

    </el-character-sheet>
`;

export default characterSheetTemplate;
