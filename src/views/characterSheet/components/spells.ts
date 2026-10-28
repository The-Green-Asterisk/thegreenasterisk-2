import { CharacterData, SpellDefinition } from "../characterData";

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
