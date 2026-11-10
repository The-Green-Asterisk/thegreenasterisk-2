import { getMulticlassCasterInfo } from "../../../rules/dnd5e_2024/multiclass";
import { findClassRule, getClassRules, getFeatRules, getSpeciesRules } from "../../../services/classRules";
import { uncountedClassSpellSources } from "../../../rules/dnd5e_2024/spellSources";
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
        // a species or lineage name (species data)
        getSpeciesRules().some(sp => src.includes(sp.name.toLowerCase()) ||
            (sp.lineages || []).some(l => src.includes(l.name.toLowerCase().split(/[ (]/)[0])))
    );
}

export function isCharacterBonusSpell(spell: SpellDefinition): boolean {
    const src = (spell.source || "").toLowerCase();
    return (
        isCharacterSpeciesSpell(spell) ||
        // a class spell pick that doesn't use the class's numbers (class rules, e.g. Pact of the Tome)
        uncountedClassSpellSources(getClassRules()).some(label => src.includes(label))
    );
}

export interface SheetSpellcastingClass {
    name: string;
    level: number;
    maxCantrips: number;
    maxPrepared: number;
    maxSpellLevel: number;
    currentCantrips: number;
    currentPrepared: number;
    aboveMaxLevel: string[];
    isCantripsOverLimit: boolean;
    isPreparedOverLimit: boolean;
}

export interface SheetSpellcastingBreakdown {
    classes: SheetSpellcastingClass[];
    unassignedCantrips: number;
    unassignedPrepared: number;
    bonusCantrips: number;
    bonusPrepared: number;
    legacyMagicInitiate: boolean;
}

/**
 * Spells that never count against a class's cantrip or prepared spell limits: always-prepared spells (subclass,
 * feature, and feat spells), species spells, and class spell picks that don't use the class's numbers (class rules).
 */
export function isCharacterUncountedSpell(spell: SpellDefinition): boolean {
    if (spell.alwaysPrepared === true || isCharacterBonusSpell(spell)) return true;
    const src = (spell.source || "").toLowerCase().trim();
    return (
        src.includes(" / ") ||
        src.includes("feat") ||
        // a feat's name (feat data, e.g. Magic Initiate)
        getFeatRules().some(f => src.startsWith(f.name.toLowerCase().split(" (")[0])) ||
        src === "item" ||
        src === "background"
    );
}

/**
 * D&D 2024 multiclassing: each class prepares its own spells, as if single-classed, using its own class level for
 * how many cantrips and prepared spells it gets and how high a spell level it can prepare. Spells are attributed to
 * a class by their source; spells with a generic source (older saves, spells added from the database) can't be
 * attributed and only count against the combined total.
 */
export function getCharacterSpellcastingBreakdown(data: CharacterData): SheetSpellcastingBreakdown {
    const classes: SheetSpellcastingClass[] = [];
    const sourceToClass = new Map<string, SheetSpellcastingClass>();

    (data.classes || []).forEach(c => {
        const rawName = (c.name || "").trim();
        const name = rawName.toLowerCase();
        const lvl = Math.max(1, Math.min(20, Number(c.level) || 1));
        // Spellcasting comes from the class rules: the class's own, or its subclass's (e.g. Eldritch Knight)
        const clsDef = findClassRule(name);
        const info = getMulticlassCasterInfo({ classId: clsDef?.id || name, level: lvl, subclassId: c.subclass || "" }, clsDef);
        if (!info) return;

        const entry: SheetSpellcastingClass = {
            name: clsDef?.name || rawName,
            level: lvl,
            maxCantrips: info.maxCantrips,
            maxPrepared: info.maxPrepared,
            maxSpellLevel: info.maxSpellLevel,
            currentCantrips: 0,
            currentPrepared: 0,
            aboveMaxLevel: [],
            isCantripsOverLimit: false,
            isPreparedOverLimit: false
        };
        if (entry.maxCantrips === 0 && entry.maxPrepared === 0) return;
        classes.push(entry);
        sourceToClass.set(name, entry);
        if (clsDef) sourceToClass.set(clsDef.name.toLowerCase(), entry);
    });

    let unassignedCantrips = 0;
    let unassignedPrepared = 0;
    let bonusCantrips = 0;
    let bonusPrepared = 0;
    (data.spells || []).forEach(spell => {
        const isCantrip = (Number(spell.level) || 0) === 0;
        if (isCharacterUncountedSpell(spell)) {
            if (isCantrip) bonusCantrips++;
            else bonusPrepared++;
            return;
        }
        const owner = sourceToClass.get((spell.source || "").toLowerCase().trim());
        if (!owner) {
            if (isCantrip) unassignedCantrips++;
            else unassignedPrepared++;
            return;
        }
        if (isCantrip) {
            owner.currentCantrips++;
        } else {
            owner.currentPrepared++;
            if ((Number(spell.level) || 0) > owner.maxSpellLevel) owner.aboveMaxLevel.push(spell.name);
        }
    });

    classes.forEach(c => {
        c.isCantripsOverLimit = c.currentCantrips > c.maxCantrips;
        c.isPreparedOverLimit = c.currentPrepared > c.maxPrepared || c.aboveMaxLevel.length > 0;
    });

    // Characters saved before spell-granting feats' spells (feat data spellList, e.g. Magic Initiate) had their own
    // source stored them as generic class spells
    const spellFeatNames = getFeatRules().filter(f => f.spellList).map(f => f.name.toLowerCase().split(" (")[0]);
    const hasMagicInitiateFeat = (data.features || []).some(f => spellFeatNames.some(n => f.name.toLowerCase().includes(n)));
    const hasMagicInitiateSpells = (data.spells || []).some(s => spellFeatNames.some(n => (s.source || "").toLowerCase().startsWith(n)));

    return {
        classes,
        unassignedCantrips,
        unassignedPrepared,
        bonusCantrips,
        bonusPrepared,
        legacyMagicInitiate: hasMagicInitiateFeat && !hasMagicInitiateSpells
    };
}

export function getCharacterPreparedSpellsLimit(data: CharacterData): number {
    if (typeof data.creatorState?.maxPrepared === "number" && data.creatorState.maxPrepared > 0) {
        return data.creatorState.maxPrepared;
    }
    const tracking = data.trackingState as any;
    if (typeof tracking?.maxPrepared === "number" && tracking.maxPrepared > 0) {
        return tracking.maxPrepared;
    }

    const breakdown = getCharacterSpellcastingBreakdown(data);
    const total = breakdown.classes.reduce((sum, c) => sum + c.maxPrepared, 0);
    return total + (breakdown.legacyMagicInitiate ? 1 : 0);
}

export function getCharacterSpellLevelLimits(data: CharacterData): {
    availableLevels: number[];
    allowedByLevel: Record<number, number>;
    currentByLevel: Record<number, SpellDefinition[]>;
    maxCantrips: number;
    currentCantrips: number;
    maxPrepared: number;
    currentPrepared: number;
    bonusCantrips: number;
    bonusPrepared: number;
    byClass: SheetSpellcastingClass[];
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

    // Cantrips and prepared spells count per class (D&D 2024 multiclassing); bonus spells never count
    const breakdown = getCharacterSpellcastingBreakdown(data);
    const maxCantrips = breakdown.classes.reduce((sum, c) => sum + c.maxCantrips, 0) + (breakdown.legacyMagicInitiate ? 2 : 0);
    const maxPrepared = getCharacterPreparedSpellsLimit(data);
    const currentCantrips = breakdown.classes.reduce((sum, c) => sum + c.currentCantrips, 0) + breakdown.unassignedCantrips;
    const currentPrepared = breakdown.classes.reduce((sum, c) => sum + c.currentPrepared, 0) + breakdown.unassignedPrepared;

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
        bonusCantrips: breakdown.bonusCantrips,
        bonusPrepared: breakdown.bonusPrepared,
        byClass: breakdown.classes,
        isPreparedOverLimit: (maxPrepared > 0 && currentPrepared > maxPrepared) || breakdown.classes.some(c => c.isPreparedOverLimit),
        isCantripsOverLimit: (maxCantrips > 0 && currentCantrips > maxCantrips) || breakdown.classes.some(c => c.isCantripsOverLimit)
    };
}

/**
 * "Bard 10/10 • Warlock 7/7" style summary of prepared spells per class, for multiclass characters.
 */
export function describePreparedByClass(limits: ReturnType<typeof getCharacterSpellLevelLimits>): string {
    const parts = limits.byClass
        .filter(c => c.maxPrepared > 0)
        .map(c => `${c.name} ${c.currentPrepared}/${c.maxPrepared}${c.aboveMaxLevel.length > 0 ? ` (${c.aboveMaxLevel.join(", ")} above level ${c.maxSpellLevel})` : ''}`);
    const unassigned = limits.currentPrepared - limits.byClass.reduce((sum, c) => sum + c.currentPrepared, 0);
    if (unassigned > 0) parts.push(`${unassigned} not assigned to a class`);
    return parts.join(" • ");
}

/**
 * "2 spells are duplicated in Darvell's spell list: …" for a D&D Beyond import, or "" when no picked spell is listed twice.
 */
export function describeDuplicateSpells(data: Pick<CharacterData, "name" | "duplicateSpells">): string {
    const dupes = data.duplicateSpells || [];
    if (dupes.length === 0) return "";
    const name = (data.name || "This character").trim();
    const possessive = /s$/i.test(name) ? `${name}'` : `${name}'s`;
    const one = dupes.length === 1;
    const details = dupes.map(d => `${d.name} (${d.copies.join("; ")})`).join(", ");
    const wasted = dupes.reduce((sum, d) => sum + d.wastedPicks, 0);
    const freed = wasted === 0 ? "" : ` That frees up ${wasted === 1 ? "a prepared spell" : `${wasted} prepared spells`}.`;
    return `${dupes.length} ${one ? "spell is" : "spells are"} duplicated in ${possessive} spell list: ${details}. ` +
        `Remove the extra ${dupes.length === 1 && dupes[0].copies.length <= 2 ? "copy" : "copies"} on D&D Beyond.${freed}`;
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
                    ${spell.viaFeature ? `<span class="badge badge-source" title="Not on the ${spell.source} spell list; available through ${spell.viaFeature}">${spell.viaFeature}</span>` : ''}
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
            if (isCantrip && limits && limits.maxCantrips > 0) {
                const bonusNote = limits.bonusCantrips > 0 ? ` (+${limits.bonusCantrips} bonus)` : '';
                const title = `Cantrips: ${limits.currentCantrips} current / ${limits.maxCantrips} allowed${limits.bonusCantrips > 0 ? `; ${limits.bonusCantrips} bonus cantrips from species, feats, and class features don't count` : ''}`;
                countBadgeHtml = `<span class="spells-level-count ${limits.isCantripsOverLimit ? 'over-limit' : ''}" title="${title}">${limits.currentCantrips}/${limits.maxCantrips}${bonusNote}</span>`;
            } else if (isCantrip) {
                countBadgeHtml = `<span class="spells-level-count" title="${levelSpells.length} cantrips">${levelSpells.length}</span>`;
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
