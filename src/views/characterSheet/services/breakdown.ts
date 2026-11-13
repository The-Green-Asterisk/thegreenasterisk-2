import { AbilityScore, BonusPart, CharacterData, SkillItem } from "../characterData";
import { checkExtrasFor, trainingMultiplier } from "./customSkills";

/**
 * Where a number on the sheet comes from: every piece with its source, overridden pieces marked. The counted lines
 * always add up to the number shown; anything the sheet can't name yet is one "Other" line, so a breakdown never
 * disagrees with its number.
 */
export interface BreakdownLine {
    label: string;
    value: number;
    /** What replaces this piece; an overridden line is shown but not counted. */
    overridden?: string;
}

export interface Breakdown {
    title: string;
    total: number;
    lines: BreakdownLine[];
}

const ABBRS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export function signed(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

function modifierOf(score: number): number {
    return Math.floor((score - 10) / 2);
}

function itemsLayeredOnSheet(character: Pick<CharacterData, "source">): boolean {
    return character.source !== "dndbeyond";
}

function findAbility(character: Pick<CharacterData, "abilities">, stat: string): AbilityScore | undefined {
    const wanted = String(stat || "").trim().toUpperCase();
    return character.abilities?.find((a) => String(a.abbr || "").toUpperCase() === wanted);
}

/**
 * The ability modifier's lines: the natural modifier and, on site characters, each equipped item that changes the
 * score. A Belt of Giant Strength overrides what came before it.
 */
function abilityLines(character: CharacterData, abbr: string): BreakdownLine[] {
    const ability = findAbility(character, abbr);
    if (!ability) return [];
    const current = `${abbr} modifier (${abbr} ${ability.score})`;
    const itemParts = itemsLayeredOnSheet(character)
        ? (character.itemEffectParts || []).filter((p) => p.target === `abilities.${abbr}`)
        : [];
    if (itemParts.length === 0) return [{ label: current, value: ability.modifier }];

    const natural = typeof ability.baseScore === "number"
        ? ability.baseScore + (typeof ability.bonus === "number" ? ability.bonus : 0)
        : ability.score;
    let score = natural;
    const lines: BreakdownLine[] = [{ label: `${abbr} modifier (${abbr} ${natural})`, value: modifierOf(natural) }];
    for (const part of itemParts.filter((p) => !p.override)) {
        const next = score + part.value;
        lines.push({ label: `${part.item} (${abbr} ${signed(part.value)})`, value: modifierOf(next) - modifierOf(score) });
        score = next;
    }
    const override = itemParts.filter((p) => p.override).sort((a, b) => b.value - a.value)[0];
    if (override && override.value > score) {
        lines.forEach((line) => { line.overridden = override.item; });
        lines.push({ label: `${override.item} (${abbr} ${override.value})`, value: modifierOf(override.value) });
    }
    return lines;
}

function partLines(parts: BonusPart[] | undefined, trained: boolean, trainedBy: string): BreakdownLine[] {
    return (parts || []).map((p) => (p.untrainedOnly && trained ? { label: p.label, value: p.value, overridden: trainedBy } : { label: p.label, value: p.value }));
}

function counted(lines: BreakdownLine[]): number {
    return lines.filter((l) => !l.overridden).reduce((sum, l) => sum + l.value, 0);
}

function withRemainder(character: Pick<CharacterData, "source">, lines: BreakdownLine[], total: number): BreakdownLine[] {
    const remainder = total - counted(lines);
    if (remainder !== 0) lines.push({ label: character.source === "dndbeyond" ? "Other (D&D Beyond)" : "Other", value: remainder });
    return lines;
}

/** For characters saved before check extras were named: the inferred amounts, with generic labels. */
function inferredCheckParts(character: CharacterData, abbr: string): BonusPart[] {
    const extras = checkExtrasFor(character)[abbr];
    if (!extras) return [];
    const parts: BonusPart[] = [];
    if (extras.trained) parts.push({ label: "Bonus to ability checks", value: extras.trained });
    if (extras.untrained - extras.trained) parts.push({ label: "Half proficiency when untrained", value: extras.untrained - extras.trained, untrainedOnly: true });
    return parts;
}

export function skillBreakdown(character: CharacterData, skill: SkillItem): Breakdown {
    const abbr = String(skill.stat || "").toUpperCase();
    const pb = Number(character.vitals?.proficiencyBonus) || 0;
    const mult = trainingMultiplier(skill.proficiency);
    const trainedBy = mult === 2 ? "Expertise" : "Proficiency";
    const lines = abilityLines(character, abbr);
    if (mult === 2) lines.push({ label: `Expertise (2 × proficiency ${signed(pb)})`, value: 2 * pb });
    else if (mult === 1) lines.push({ label: `Proficiency`, value: pb });

    const checkParts = character.checkExtras?.[abbr]?.parts ?? inferredCheckParts(character, abbr);
    lines.push(...partLines(checkParts, mult > 0, trainedBy));
    lines.push(...partLines(character.skillExtras?.[skill.name], mult > 0, trainedBy));
    if (itemsLayeredOnSheet(character)) {
        for (const part of (character.itemEffectParts || []).filter((p) => p.target === "checks.all")) {
            lines.push({ label: part.item, value: part.value });
        }
    }
    const total = Number(skill.bonus) || 0;
    return { title: `${skill.name} (${abbr}) ${signed(total)}`, total, lines: withRemainder(character, lines, total) };
}

export function saveBreakdown(character: CharacterData, ability: AbilityScore): Breakdown {
    const abbr = String(ability.abbr || "").toUpperCase();
    const pb = Number(character.vitals?.proficiencyBonus) || 0;
    const lines = abilityLines(character, abbr);
    if (ability.proficientSave) lines.push({ label: "Proficiency", value: pb });
    lines.push(...partLines(character.saveExtras?.all, !!ability.proficientSave, "Proficiency"));
    lines.push(...partLines(character.saveExtras?.[abbr], !!ability.proficientSave, "Proficiency"));
    if (itemsLayeredOnSheet(character)) {
        for (const part of (character.itemEffectParts || []).filter((p) => p.target === "saves.all" || p.target === `saves.${abbr}`)) {
            lines.push({ label: part.item, value: part.value });
        }
    }
    const total = Number(ability.save) || 0;
    return { title: `${ability.name} saving throw ${signed(total)}`, total, lines: withRemainder(character, lines, total) };
}

/** The breakdown a sheet button asks for, by kind and key, or null when the number isn't there any more. */
export function breakdownFor(character: CharacterData | null | undefined, kind: string, key: string): Breakdown | null {
    if (!character) return null;
    if (kind === "skill") {
        const skill = (character.skills || []).find((s) => s.name === key);
        return skill ? skillBreakdown(character, skill) : null;
    }
    if (kind === "save") {
        const ability = findAbility(character, key);
        return ability ? saveBreakdown(character, ability) : null;
    }
    return null;
}

/** The breakdown as one sentence, for screen readers. */
export function describeBreakdown(breakdown: Breakdown): string {
    const counted = breakdown.lines.filter((l) => !l.overridden).map((l) => `${l.label} ${signed(l.value)}`);
    const overridden = breakdown.lines.filter((l) => l.overridden).map((l) => `${l.label} ${signed(l.value)} overridden by ${l.overridden}`);
    const text = counted.length > 0 ? `From ${counted.join(", ")}.` : "No parts recorded.";
    return overridden.length > 0 ? `${text} ${overridden.join("; ")}.` : text;
}

export { ABBRS as BREAKDOWN_ABILITIES };
