import { findClassOption } from "../../../rules/dnd5e_2024/classOptions";
import { featModifiers } from "../../../rules/dnd5e_2024/featRules";
import { formatWeightLb, roundWeightLb } from "../../../rules/dnd5e_2024/itemWeightsAndContainers";
import { activeSpeciesTraits, detectLineage } from "../../../rules/dnd5e_2024/speciesRules";
import { findClassRule, findFeatRule, findSpeciesRule } from "../../../services/classRules";
import { AbilityScore, BonusPart, CharacterData, SkillItem, VitalKey, WeaponItem } from "../characterData";
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
    /** How to write the total: as a bonus (+3), a plain amount (AC 18, HP 44), feet (30 ft.), or weight (240 lbs). */
    totalStyle?: "signed" | "plain" | "feet" | "lbs";
}

export function formatTotal(breakdown: Breakdown): string {
    if (breakdown.totalStyle === "plain") return String(breakdown.total);
    if (breakdown.totalStyle === "feet") return `${breakdown.total} ft.`;
    if (breakdown.totalStyle === "lbs") return formatWeightLb(breakdown.total);
    return signed(breakdown.total);
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

function recordedLines(parts: BonusPart[] | undefined): BreakdownLine[] {
    return (parts || []).map((p) => (p.overriddenBy ? { label: p.label, value: p.value, overridden: p.overriddenBy } : { label: p.label, value: p.value }));
}

function siteItemLines(character: CharacterData, ...targets: string[]): BreakdownLine[] {
    if (!itemsLayeredOnSheet(character)) return [];
    return (character.itemEffectParts || []).filter((p) => targets.includes(p.target)).map((p) => ({ label: p.item, value: p.value }));
}

/** Item bonuses that don't stack (spell DC, spell attack): the best counts, the rest are shown overridden by it. */
function bestItemLine(character: CharacterData, target: string): BreakdownLine[] {
    const lines = siteItemLines(character, target);
    const best = lines.reduce<BreakdownLine | undefined>((top, l) => (!top || l.value > top.value ? l : top), undefined);
    return lines.map((l) => (l === best ? l : { ...l, overridden: best!.label }));
}

const VITAL_TITLES: Record<VitalKey, string> = {
    ac: "Armor Class", initiative: "Initiative", speed: "Walking speed", maxHp: "Hit point maximum",
    carryingCapacity: "Carrying capacity",
    passivePerception: "Passive Perception", passiveInvestigation: "Passive Investigation", passiveInsight: "Passive Insight",
    spellSaveDc: "Spell save DC", spellAttackBonus: "Spell attack bonus"
};
const PASSIVE_SKILL: Partial<Record<VitalKey, string>> = { passivePerception: "Perception", passiveInvestigation: "Investigation", passiveInsight: "Insight" };

/** The spellcasting ability's abbreviation from vitals.spellcastingAbility ("Charisma", "Charisma (+4)", "CHA"). */
function spellAbilityAbbr(character: CharacterData): string {
    const raw = String(character.vitals?.spellcastingAbility || "").trim();
    const abbr = raw.slice(0, 3).toUpperCase();
    return ABBRS.includes(abbr) ? abbr : "CHA";
}

function walkSpeed(character: CharacterData): number {
    const match = String(character.vitals?.speed || "").match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

export function vitalBreakdown(character: CharacterData, key: VitalKey): Breakdown {
    const vitals = character.vitals;
    const pb = Number(vitals?.proficiencyBonus) || 0;
    const recorded = recordedLines(character.vitalParts?.[key]);
    let lines: BreakdownLine[];
    let total: number;
    let shown: string;
    switch (key) {
        case "ac":
            total = Number(vitals?.armorClass) || 0;
            shown = String(total);
            lines = [...recorded, ...siteItemLines(character, "vitals.ac")];
            break;
        case "initiative":
            total = Number(vitals?.initiative) || 0;
            shown = signed(total);
            lines = [...abilityLines(character, "DEX"), ...recorded, ...siteItemLines(character, "vitals.initiative", "checks.all")];
            break;
        case "speed": {
            total = walkSpeed(character);
            shown = `${total} ft.`;
            lines = [...recorded, ...siteItemLines(character, "vitals.speed")];
            const multiplier = itemsLayeredOnSheet(character)
                ? (character.itemEffectParts || []).filter((p) => p.target === "vitals.speedMultiplier").sort((a, b) => b.value - a.value)[0]
                : undefined;
            if (multiplier) {
                const before = counted(lines);
                lines.push({ label: `${multiplier.item} (×${multiplier.value})`, value: before * multiplier.value - before });
            }
            break;
        }
        case "maxHp":
            total = Number(vitals?.maxHp) || 0;
            shown = String(total);
            lines = [...recorded];
            break;
        case "carryingCapacity": {
            const computed = computeCarryingCapacity(character);
            total = character.source === "dndbeyond" && vitals?.carryingCapacity != null
                ? Number(vitals.carryingCapacity)
                : computed.total;
            shown = formatWeightLb(total);
            lines = computed.lines;
            break;
        }
        case "spellSaveDc":
            total = Number(vitals?.spellSaveDc) || 0;
            shown = String(total);
            lines = [{ label: "Base", value: 8 }, { label: "Proficiency", value: pb }, ...abilityLines(character, spellAbilityAbbr(character)), ...recorded, ...bestItemLine(character, "spells.dc")];
            break;
        case "spellAttackBonus":
            total = Number(vitals?.spellAttackBonus) || 0;
            shown = signed(total);
            lines = [{ label: "Proficiency", value: pb }, ...abilityLines(character, spellAbilityAbbr(character)), ...recorded, ...bestItemLine(character, "spells.attack")];
            break;
        default: {
            total = Number(vitals?.[key]) || 0;
            shown = String(total);
            const skillName = PASSIVE_SKILL[key] || "";
            const skill = (character.skills || []).find((s) => s.name === skillName);
            lines = [{ label: "Base", value: 10 }, { label: `${skillName} bonus`, value: Number(skill?.bonus) || 0 }, ...recorded];
        }
    }
    const totalStyle = key === "speed" ? "feet" : key === "carryingCapacity" ? "lbs" : key === "initiative" || key === "spellAttackBonus" ? "signed" : "plain";
    return { title: `${VITAL_TITLES[key]} ${shown}`, total, lines: withRemainder(character, lines, total), totalStyle };
}

function parseMultiplierPart(part: BonusPart): number | null {
    if (typeof part.multiplier === "number" && Number.isFinite(part.multiplier) && part.multiplier > 0) {
        return part.multiplier;
    }
    const m = String(part.label || "").match(/\(×(\d+(?:\.\d+)?)\)\s*$/i);
    return m ? Number(m[1]) : null;
}

/**
 * Fallback carrying capacity modifiers from rules data (species traits, active choices, features, feats)
 * for characters saved before vitalParts.carryingCapacity existed.
 */
export function inferCarryingCapacityRuleParts(character: CharacterData): BonusPart[] {
    const parts: BonusPart[] = [];
    const seen = new Set<string>();
    const addMod = (label: string, m: any) => {
        if (!m || m.target !== "vitals.carryingCapacity") return;
        const norm = `${label.toLowerCase()}|${m.type}|${m.value}`;
        if (seen.has(norm)) return;
        seen.add(norm);
        if (m.type === "multiplier") {
            const mult = Number(m.value) || 1;
            if (mult > 0 && mult !== 1) parts.push({ label: `${label} (×${mult})`, value: 0, multiplier: mult });
        } else if (m.type === "bonus" || m.type === "penalty") {
            const val = Number(m.value) || 0;
            if (val !== 0) parts.push({ label, value: m.type === "penalty" ? -val : val });
        }
    };

    const level = Number(character.level) || 1;
    const sp = findSpeciesRule(character.species || character.race || "");
    if (sp) {
        const lineage = detectLineage(sp, {
            texts: [character.lineage, character.race].filter(Boolean) as string[],
            featureNames: (character.features || []).map((f) => f.name)
        });
        for (const t of activeSpeciesTraits(sp, lineage, level)) {
            for (const m of t.modifiers || []) addMod(t.name, m);
        }
        for (const m of lineage?.modifiers || []) addMod(lineage?.name || sp.name, m);
    }

    const activeChoices: Record<string, string> = {
        ...(character.creatorState?.subclassFeatureChoices || {}),
        ...(character.creatorState?.featureChoices || {}),
        ...(character.subclassFeatureChoices || {}),
        ...(character.featureChoices || {}),
        ...(character.trackingState?.featureChoices || {})
    };
    const classDefs = (character.classes || []).map((c) => ({
        def: findClassRule(c.name),
        level: Number(c.level) || level,
        subclass: c.subclass
    }));
    const findProgressOption = (kind: string, optId: string) => {
        const opt = findClassOption(kind, optId);
        if (opt) return opt;
        for (const { def, level: cLvl, subclass } of classDefs) {
            if (!def) continue;
            const subDef = subclass ? def.subclasses?.find((s) => s.name.toLowerCase() === subclass.toLowerCase() || s.id === subclass.toLowerCase()) : undefined;
            for (const pl of [...(def.progression || []), ...(subDef?.progression || [])]) {
                if ((pl.level || 0) > cLvl) continue;
                for (const ch of pl.choices || []) {
                    const chMeta = ch as { choiceId?: string; featureName?: string; name?: string; label?: string };
                    if (ch.choiceId === kind || chMeta.featureName?.toLowerCase() === kind.toLowerCase() || chMeta.name?.toLowerCase() === kind.toLowerCase() || chMeta.label?.toLowerCase() === kind.toLowerCase()) {
                        const found = ch.options?.find((o: any) => o.id === optId);
                        if (found) return found;
                    }
                }
            }
        }
        return undefined;
    };
    for (const [key, val] of Object.entries(activeChoices)) {
        if (!val || val === "none") continue;
        const [rawKind, rawId] = val.includes(":") ? val.split(":") : [key, val];
        const opt = findProgressOption(rawKind, rawId || rawKind);
        if (opt && Array.isArray(opt.modifiers)) {
            for (const m of opt.modifiers) addMod(opt.name, m);
        }
    }

    for (const f of character.features || []) {
        if (f.type === "Feat") {
            const feat = findFeatRule(f.name);
            for (const m of featModifiers(feat ? [feat] : [], "vitals.carryingCapacity")) addMod(f.name, m);
        } else {
            const afterColon = f.name.includes(":") ? f.name.split(":").slice(1).join(":").trim().toLowerCase() : f.name.toLowerCase().trim();
            for (const { def, level: cLvl, subclass } of classDefs) {
                if (!def) continue;
                const subDef = subclass ? def.subclasses?.find((s) => s.name.toLowerCase() === subclass.toLowerCase() || s.id === subclass.toLowerCase()) : undefined;
                for (const pl of [...(def.progression || []), ...(subDef?.progression || [])]) {
                    if ((pl.level || 0) > cLvl) continue;
                    for (const ch of pl.choices || []) {
                        const opt = ch.options?.find((o: any) => o.name.toLowerCase() === afterColon);
                        if (opt) for (const m of opt.modifiers || []) addMod(opt.name, m);
                    }
                }
            }
        }
    }

    return parts;
}

/** Computes a character's carrying capacity (STR × 15 + additive bonuses, scaled by multipliers). */
export function computeCarryingCapacity(character: CharacterData): { total: number; lines: BreakdownLine[] } {
    const strAbility = findAbility(character, "STR");
    const strScore = Number(strAbility?.score) || 10;
    const lines: BreakdownLine[] = [{ label: `Strength (${strScore} × 15)`, value: roundWeightLb(strScore * 15) }];
    const multipliers: Array<{ label: string; mult: number }> = [];

    const sourceParts = character.vitalParts?.carryingCapacity !== undefined
        ? character.vitalParts.carryingCapacity
        : inferCarryingCapacityRuleParts(character);

    for (const part of sourceParts || []) {
        if (part.overriddenBy) continue;
        const mult = parseMultiplierPart(part);
        if (mult !== null && mult > 0) {
            multipliers.push({ label: part.label, mult });
        } else if (part.value) {
            lines.push({ label: part.label, value: part.value });
        }
    }

    if (itemsLayeredOnSheet(character)) {
        for (const part of (character.itemEffectParts || []).filter((p) => p.target === "vitals.carryingCapacity")) {
            lines.push({ label: part.item, value: part.value });
        }
        for (const part of (character.itemEffectParts || []).filter((p) => p.target === "vitals.carryingCapacityMultiplier")) {
            if (part.value > 0 && part.value !== 1) {
                multipliers.push({ label: `${part.item} (×${part.value})`, mult: part.value });
            }
        }
    }

    for (const m of multipliers) {
        if (!(m.mult > 0) || m.mult === 1) continue;
        const before = counted(lines);
        const delta = roundWeightLb(before * m.mult - before);
        lines.push({ label: m.label, value: delta });
    }

    return { total: roundWeightLb(counted(lines)), lines };
}

/** A weapon's attack bonus: the parts its path recorded (ability, proficiency, magic, fighting styles). */
export function weaponAttackBreakdown(character: CharacterData, weapon: WeaponItem): Breakdown {
    const total = Number(weapon.toHitModifier) || 0;
    const lines = recordedLines(weapon.attackParts);
    return { title: `${weapon.name} attack ${signed(total)}`, total, lines: withRemainder(character, lines, total) };
}

/** An ability score: the base, increases (species, background, feats, ASIs), and on site characters the items. */
export function abilityScoreBreakdown(character: CharacterData, ability: AbilityScore): Breakdown {
    const abbr = String(ability.abbr || "").toUpperCase();
    const total = Number(ability.score) || 0;
    const base = typeof ability.baseScore === "number" ? ability.baseScore : total;
    const increases = typeof ability.bonus === "number" ? ability.bonus : 0;
    const lines: BreakdownLine[] = [{ label: "Base score", value: base }];
    if (increases) lines.push({ label: character.source === "dndbeyond" ? "Increases (D&D Beyond)" : "Increases (species, background, feats)", value: increases });
    if (itemsLayeredOnSheet(character)) {
        const parts = (character.itemEffectParts || []).filter((p) => p.target === `abilities.${abbr}`);
        for (const part of parts.filter((p) => !p.override)) lines.push({ label: part.item, value: part.value });
        const override = parts.filter((p) => p.override).sort((a, b) => b.value - a.value)[0];
        if (override && override.value > counted(lines)) {
            lines.forEach((l) => { l.overridden = override.item; });
            lines.push({ label: `${override.item} (sets ${abbr} ${override.value})`, value: override.value });
        }
    }
    const modifier = modifierOf(total);
    return { title: `${ability.name} ${total} (${signed(modifier)})`, total, lines: withRemainder(character, lines, total), totalStyle: "plain" };
}

const VITAL_KEYS: VitalKey[] = ["ac", "initiative", "speed", "maxHp", "carryingCapacity", "passivePerception", "passiveInvestigation", "passiveInsight", "spellSaveDc", "spellAttackBonus"];

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
    if (kind === "vital" && (VITAL_KEYS as string[]).includes(key)) return vitalBreakdown(character, key as VitalKey);
    if (kind === "weapon") {
        const weapon = (character.weapons || []).find((w) => w.name === key);
        return weapon ? weaponAttackBreakdown(character, weapon) : null;
    }
    if (kind === "ability") {
        const ability = findAbility(character, key);
        return ability ? abilityScoreBreakdown(character, ability) : null;
    }
    return null;
}

/** The breakdown as one sentence, for screen readers. */
export function describeBreakdown(breakdown: Breakdown): string {
    const counted = breakdown.lines.filter((l) => !l.overridden).map((l) => `${l.label} ${signed(l.value)}`);
    const overridden = breakdown.lines.filter((l) => l.overridden).map((l) => `${l.label} ${signed(l.value)} overridden by ${l.overridden}`);
    const text = counted.length > 0 ? `From ${counted.join(", ")}. Total ${formatTotal(breakdown)}.` : "No parts recorded.";
    return overridden.length > 0 ? `${text} ${overridden.join("; ")}.` : text;
}

export { ABBRS as BREAKDOWN_ABILITIES };
