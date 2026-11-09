import { CLASSES_2024 } from "../../../rules/dnd5e_2024/classes";
import { CharacterData, SpellDefinition } from "../characterData";

export function spellLevelLabel(level: number): string {
    if (level === 0) return "Cantrips";
    const suffix = level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th";
    return `${level}${suffix}-Level Spells`;
}

export function isCharacterSpeciesSpell(spell: SpellDefinition): boolean {
    const src = (spell.source || "").toLowerCase();
    return (
        src.includes("species") ||
        src.includes("race") ||
        src.includes("tiefling") ||
        src.includes("aasimar") ||
        src.includes("elf") ||
        src.includes("gnome")
    );
}

export function isCharacterBonusSpell(spell: SpellDefinition): boolean {
    const src = (spell.source || "").toLowerCase();
    return (
        isCharacterSpeciesSpell(spell) ||
        src.includes("pact of the tome")
    );
}

export function getCharacterPreparedSpellsLimit(data: CharacterData): number {
    if (typeof data.creatorState?.maxPrepared === "number" && data.creatorState.maxPrepared > 0) {
        return data.creatorState.maxPrepared;
    }
    const tracking = data.trackingState as any;
    if (typeof tracking?.maxPrepared === "number" && tracking.maxPrepared > 0) {
        return tracking.maxPrepared;
    }

    let total = 0;
    const thirdCasterSpells = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];

    (data.classes || []).forEach(c => {
        const name = (c.name || "").toLowerCase();
        const sub = (c.subclass || "").toLowerCase();
        const lvl = Math.max(1, Math.min(20, Number(c.level) || 1));
        const lvlIdx = lvl - 1;

        const clsDef = CLASSES_2024.find(cd => cd.id === name || cd.name.toLowerCase() === name);
        if (clsDef?.spellcasting?.preparedSpellsByLevel?.[lvlIdx]) {
            total += clsDef.spellcasting.preparedSpellsByLevel[lvlIdx];
            return;
        }

        if (name === "fighter" && sub.includes("eldritch knight") && lvl >= 3) {
            total += thirdCasterSpells[lvlIdx] || 0;
            return;
        }
        if (name === "rogue" && sub.includes("arcane trickster") && lvl >= 3) {
            total += thirdCasterSpells[lvlIdx] || 0;
            return;
        }

        // Fallback for custom / 2014 classes
        const abilityScore = (abbr: string) => data.abilities?.find(a => a.abbr.toUpperCase() === abbr)?.score ?? 10;
        const abilityMod = (abbr: string) => Math.floor((abilityScore(abbr) - 10) / 2);

        if (name === "wizard") {
            total += Math.max(1, lvl + Math.max(0, abilityMod("INT")));
        } else if (name === "cleric" || name === "druid") {
            total += Math.max(1, lvl + Math.max(0, abilityMod("WIS")));
        } else if (name === "paladin") {
            total += Math.max(1, Math.floor(lvl / 2) + Math.max(0, abilityMod("CHA")));
        } else if (name === "bard") {
            const bardSpellsKnown = [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
            total += bardSpellsKnown[lvlIdx] || 4;
        } else if (name === "sorcerer") {
            const sorcSpellsKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
            total += sorcSpellsKnown[lvlIdx] || 2;
        } else if (name === "warlock") {
            const warlockSpellsKnown = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
            total += warlockSpellsKnown[lvlIdx] || 2;
        } else if (name === "ranger") {
            const rangerSpellsKnown = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11];
            total += rangerSpellsKnown[lvlIdx] || 0;
        }
    });

    if ((data.features || []).some(f => f.name.toLowerCase().includes("magic initiate"))) {
        total += 1;
    }

    return total;
}

export function getCharacterSpellLevelLimits(data: CharacterData): {
    availableLevels: number[];
    allowedByLevel: Record<number, number>;
    currentByLevel: Record<number, SpellDefinition[]>;
    maxCantrips: number;
    currentCantrips: number;
    maxPrepared: number;
    currentPrepared: number;
    isPreparedOverLimit: boolean;
    isCantripsOverLimit: boolean;
} {
    const currentByLevel: Record<number, SpellDefinition[]> = {};
    for (let lvl = 0; lvl <= 9; lvl++) {
        currentByLevel[lvl] = [];
    }
    (data.spells || []).forEach(spell => {
        const lvl = Math.max(0, Math.min(9, Number(spell.level) || 0));
        currentByLevel[lvl].push(spell);
    });
    for (let lvl = 0; lvl <= 9; lvl++) {
        currentByLevel[lvl].sort((a, b) => a.name.localeCompare(b.name));
    }

    const explicitAllowed = {
        ...(data.allowedSpellsByLevel || {}),
        ...(data.trackingState?.allowedSpellsByLevel || {})
    };

    const availableSet = new Set<number>([0]);
    for (let lvl = 1; lvl <= 9; lvl++) {
        const hasStandardSlots = (data.spellSlots?.[`level${lvl}`]?.total || 0) > 0;
        const hasPactAccess = (data.spellSlots?.pact?.level || 0) >= lvl;
        const hasSpellsAtLevel = currentByLevel[lvl].length > 0;
        const hasExplicitLimit = (explicitAllowed[lvl] ?? 0) > 0;
        if (hasStandardSlots || hasPactAccess || hasSpellsAtLevel || hasExplicitLimit) {
            availableSet.add(lvl);
        }
    }
    if (availableSet.size === 1) {
        availableSet.add(1);
    }

    const availableLevels = Array.from(availableSet).sort((a, b) => a - b);
    const allowedByLevel: Record<number, number> = {};

    // Compute default Cantrip (Level 0) allowance from classes + features
    let defaultCantripsAllowed = 0;
    (data.classes || []).forEach(c => {
        const name = (c.name || "").toLowerCase();
        const sub = (c.subclass || "").toLowerCase();
        const lvl = Number(c.level) || 1;
        if (name === "sorcerer") {
            defaultCantripsAllowed += lvl >= 10 ? 6 : lvl >= 4 ? 5 : 4;
        } else if (name === "cleric" || name === "wizard") {
            defaultCantripsAllowed += lvl >= 10 ? 5 : lvl >= 4 ? 4 : 3;
        } else if (name === "bard" || name === "druid" || name === "warlock") {
            defaultCantripsAllowed += lvl >= 10 ? 4 : lvl >= 4 ? 3 : 2;
        } else if (name === "artificer") {
            defaultCantripsAllowed += lvl >= 14 ? 4 : lvl >= 10 ? 3 : 2;
        } else if (sub.includes("eldritch knight") || sub.includes("arcane trickster")) {
            defaultCantripsAllowed += lvl >= 10 ? 3 : 2;
        }
    });
    if ((data.features || []).some(f => f.name.toLowerCase().includes("pact of the tome"))) {
        defaultCantripsAllowed += 3;
    }

    // Add species/racial bonus cantrips (e.g. Tiefling Thaumaturgy/Fire Bolt, Elf, etc.)
    const speciesCantripsCount = (data.spells || []).filter(s => (Number(s.level) || 0) === 0 && isCharacterSpeciesSpell(s)).length;
    defaultCantripsAllowed += speciesCantripsCount;

    const maxCantrips = Math.max(defaultCantripsAllowed, 2);
    const maxPrepared = getCharacterPreparedSpellsLimit(data);
    const currentCantrips = currentByLevel[0]?.length || 0;
    const currentPrepared = (data.spells || []).filter(s => (Number(s.level) || 0) > 0 && !isCharacterBonusSpell(s)).length;

    availableLevels.forEach(lvl => {
        if (explicitAllowed[lvl] !== undefined && explicitAllowed[lvl] >= 0) {
            allowedByLevel[lvl] = Number(explicitAllowed[lvl]);
            return;
        }

        if (lvl === 0) {
            allowedByLevel[0] = maxCantrips;
        } else {
            const standardSlots = data.spellSlots?.[`level${lvl}`]?.total || 0;
            const pactSlots =
                data.spellSlots?.pact?.level === lvl
                    ? data.spellSlots.pact.total || 0
                    : (data.spellSlots?.pact?.level || 0) > lvl
                        ? 2
                        : 0;
            allowedByLevel[lvl] = Math.max(standardSlots + pactSlots, 1);
        }
    });

    return {
        availableLevels,
        allowedByLevel,
        currentByLevel,
        maxCantrips,
        currentCantrips,
        maxPrepared,
        currentPrepared,
        isPreparedOverLimit: maxPrepared > 0 && currentPrepared > maxPrepared,
        isCantripsOverLimit: maxCantrips > 0 && currentCantrips > maxCantrips
    };
}

export function renderSpellCard(spell: SpellDefinition): string {
    const levelText = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
    const concBadge = spell.concentration ? '<span class="badge badge-conc" title="Concentration">Conc</span>' : '';
    const ritBadge = spell.ritual ? '<span class="badge badge-ritual" title="Ritual">Ritual</span>' : '';
    return `
        <div class="spell-card" data-spell-name="${encodeURIComponent(spell.name)}" data-spell-id="${spell.id ?? ''}" tabindex="0" role="button" aria-haspopup="dialog" title="Click to view full spell description">
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

export function renderSpellsByLevel(
    spells: SpellDefinition[],
    spellSlots: CharacterData["spellSlots"],
    characterData?: CharacterData
): string {
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

    const limits = characterData ? getCharacterSpellLevelLimits(characterData) : null;

    return Array.from(grouped.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([level, levelSpells]) => {
            const isCantrip = level === 0;
            const explicitAllowed = limits?.allowedByLevel[level];
            const hasUserConfiguredLimit =
                characterData?.allowedSpellsByLevel?.[level] !== undefined ||
                (characterData?.trackingState as any)?.allowedSpellsByLevel?.[level] !== undefined;

            let countBadgeHtml = "";
            if (isCantrip) {
                const maxC = limits?.maxCantrips ?? (explicitAllowed ?? levelSpells.length);
                const isOver = maxC > 0 && levelSpells.length > maxC;
                countBadgeHtml = `<span class="spells-level-count ${isOver ? 'over-limit' : ''}" title="Cantrips: ${levelSpells.length} current / ${maxC} allowed">${levelSpells.length}/${maxC}</span>`;
            } else if (hasUserConfiguredLimit && explicitAllowed !== undefined && explicitAllowed >= 0) {
                const isOver = levelSpells.length > explicitAllowed;
                countBadgeHtml = `<span class="spells-level-count ${isOver ? 'over-limit' : ''}" title="${spellLevelLabel(level)}: ${levelSpells.length} current / ${explicitAllowed} allowed">${levelSpells.length}/${explicitAllowed}</span>`;
            } else {
                countBadgeHtml = `<span class="spells-level-count" title="${levelSpells.length} spells for ${spellLevelLabel(level)}">${levelSpells.length}</span>`;
            }

            return `
            <section class="spells-level-section" data-spell-level="${level}">
                <header class="spells-level-header">
                    <div class="spells-level-title-row">
                        <h4>${spellLevelLabel(level)}</h4>
                        ${renderLevelSlotMarkers(level, spellSlots)}
                    </div>
                    ${countBadgeHtml}
                </header>
                <div class="spells-grid level-spells-grid">
                    ${levelSpells.map(renderSpellCard).join('')}
                </div>
            </section>
        `;
        })
        .join('');
}
