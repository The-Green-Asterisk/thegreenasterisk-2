import {
    AbilityName,
    BASE_ARMOR_2024,
    BASE_WEAPONS_2024,
    checkClassPrerequisite,
    StatModifier
} from "../../../rules/dnd5e_2024";
import { BonusPart } from "../../characterSheet/characterData";
import { featModifierNumber, featModifiers } from "../../../rules/dnd5e_2024/featRules";
import { speciesModifiers } from "../../../rules/dnd5e_2024/speciesRules";
import { AsiChoice, AsiSlot } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";
import { armorRequirementMet, getProgressionModifiers, modifierNumber } from "./progressionModifiers";
import { getCharacterFeats } from "./skillRules";
import { currentLineage, currentSpecies } from "./speciesChoices";

export const STANDARD_ARRAY: number[] = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COSTS: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9
};

export function getProficiencyBonus(ctx: CharacterCreatorContext): number {
    return Math.floor((ctx.state.level - 1) / 4) + 2;
}

export function getPointBuyCost(score: number): number {
    return POINT_BUY_COSTS[score] ?? 0;
}

export function getSpentPoints(ctx: CharacterCreatorContext): number {
    const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
    return stats.reduce((sum, st) => {
        const score = ctx.state.baseAbilities[st];
        return sum + (POINT_BUY_COSTS[score] ?? 0);
    }, 0);
}

export function getAvailablePoints(ctx: CharacterCreatorContext): number {
    return Math.max(0, Math.min(27, 27 - getSpentPoints(ctx)));
}

export function canIncrementPointBuy(ctx: CharacterCreatorContext, stat: AbilityName): boolean {
    const current = ctx.state.baseAbilities[stat] ?? 8;
    if (current >= 15) return false;
    const nextCost = POINT_BUY_COSTS[current + 1] ?? 99;
    const currentCost = POINT_BUY_COSTS[current] ?? 0;
    const diff = nextCost - currentCost;
    return getAvailablePoints(ctx) >= diff;
}

export function canDecrementPointBuy(ctx: CharacterCreatorContext, stat: AbilityName): boolean {
    return (ctx.state.baseAbilities[stat] ?? 8) > 8;
}

export function incrementPointBuy(ctx: CharacterCreatorContext, stat: AbilityName): boolean {
    if (!canIncrementPointBuy(ctx, stat)) return false;
    ctx.state.baseAbilities[stat]++;
    return true;
}

export function decrementPointBuy(ctx: CharacterCreatorContext, stat: AbilityName): boolean {
    if (!canDecrementPointBuy(ctx, stat)) return false;
    ctx.state.baseAbilities[stat]--;
    return true;
}

export function setStandardArrayScore(ctx: CharacterCreatorContext, targetStat: AbilityName, newValue: number): void {
    if (!STANDARD_ARRAY.includes(newValue)) return;
    const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
    const swapStat = stats.find((st) => st !== targetStat && ctx.state.baseAbilities[st] === newValue);
    const oldValue = ctx.state.baseAbilities[targetStat];
    ctx.state.baseAbilities[targetStat] = newValue;
    if (swapStat) {
        ctx.state.baseAbilities[swapStat] = oldValue;
    }
}

/**
 * D&D 2024: Ability Score Improvements are a class feature, earned at each class's own levels, and every class gets
 * an Epic Boon. A Bard 10 / Warlock 10 has four slots (Bard 4, Bard 8, Warlock 4, Warlock 8), not five at total
 * levels 4–19. The levels are class rules data (scalingTraits.asiLevels / epicBoonLevel).
 */
export function getAsiSlots(ctx: CharacterCreatorContext, syncClasses = true): AsiSlot[] {
    // syncStateClassProperties itself cleans up ASI choices, so that cleanup reads slots without syncing again
    if (syncClasses) ctx.syncStateClassProperties();
    const slots: AsiSlot[] = [];
    for (const c of ctx.state.classes || []) {
        const classId = (c.classId || "").toLowerCase();
        const cls = ctx.classes.find((x) => x.id === classId);
        const className = cls?.name || classId;
        // Levels come from the class rules (rule_classes.scalingTraitsJson)
        const asiLevels: number[] = cls?.scalingTraits?.asiLevels || [];
        const epicBoonLevel: number | undefined = cls?.scalingTraits?.epicBoonLevel;
        const levels = [...asiLevels, ...(epicBoonLevel ? [epicBoonLevel] : [])].sort((a, b) => a - b);
        for (const classLevel of levels) {
            if (classLevel > (c.level || 0)) continue;
            slots.push({ key: `${classId}-${classLevel}`, classId, className, classLevel, isEpicBoon: classLevel === epicBoonLevel });
        }
    }
    return slots;
}

/**
 * Moves ASI choices saved before slots were per class (keyed by total character level) onto the per-class slots:
 * a single-class character's levels map directly; a multiclass character's are assigned in order.
 */
export function normalizeAsiChoices(ctx: CharacterCreatorContext, syncClasses = true): void {
    const choices = (ctx.state.asiChoices || {}) as Record<string, AsiChoice>;
    const legacyKeys = Object.keys(choices).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (legacyKeys.length === 0) return;
    const slots = getAsiSlots(ctx, syncClasses);
    const singleClass = (ctx.state.classes || []).length <= 1;
    const free = slots.filter((s) => !choices[s.key]).sort((a, b) => a.classLevel - b.classLevel);
    for (const k of legacyKeys) {
        const choice = choices[k];
        delete choices[k];
        const target = singleClass ? free.find((s) => s.classLevel === Number(k)) : free[0];
        if (!target) continue;
        choices[target.key] = choice;
        free.splice(free.indexOf(target), 1);
    }
    ctx.state.asiChoices = choices;
}

export function ensureAsiChoices(ctx: CharacterCreatorContext): void {
    if (!ctx.state.asiChoices) ctx.state.asiChoices = {};
    normalizeAsiChoices(ctx);
    for (const slot of getAsiSlots(ctx)) {
        if (!ctx.state.asiChoices[slot.key]) {
            const cls = ctx.classes.find((c) => c.id === slot.classId);
            const defaultStat: AbilityName = cls?.savingThrows[0] || "str";
            ctx.state.asiChoices[slot.key] = {
                type: "single",
                statA: defaultStat
            };
        }
    }
}

/** Weapon Mastery picks: each class's scalingTraits.weaponMasteriesByLevel (or a flat weaponMasteryCount). */
export function getMaxWeaponMasteriesCount(ctx: CharacterCreatorContext): number {
    // No class sync here: the class sync's own cleanup calls this
    let count = 0;
    for (const c of ctx.state.classes || []) {
        const cls = ctx.classes.find((x) => x.id === c.classId);
        if (!cls || c.level < 1) continue;
        if (cls.scalingTraits?.weaponMasteriesByLevel) {
            count += cls.scalingTraits.weaponMasteriesByLevel[c.level] || 0;
        } else if (cls.weaponMasteryByLevel) {
            count += cls.weaponMasteryByLevel[c.level] || 0;
        } else {
            count += cls.weaponMasteryCount || 0;
        }
    }
    return count;
}

/** A class- or subclass-level table from scalingTraits (e.g. metamagicByLevel), at that class's level. */
function scalingTraitCount(ctx: CharacterCreatorContext, key: string): number {
    // No class sync here: the class sync's own cleanup calls this
    let count = 0;
    for (const c of ctx.state.classes || []) {
        const cls = ctx.classes.find((x) => x.id === c.classId);
        const sub = cls?.subclasses?.find((s) => s.id === ctx.resolveCanonicalSubclassId(c.classId, c.subclassId));
        for (const table of [cls?.scalingTraits?.[key], (sub as any)?.scalingTraits?.[key]]) {
            if (Array.isArray(table)) count += table[Math.min(c.level, table.length - 1)] || 0;
        }
    }
    return count;
}

/** The level of the class (or subclass) whose scalingTraits define this table, e.g. the Warlock level for invocations. */
export function getScalingTraitClassLevel(ctx: CharacterCreatorContext, key: string): number {
    for (const c of ctx.state.classes || []) {
        const cls = ctx.classes.find((x) => x.id === c.classId);
        const sub = cls?.subclasses?.find((s) => s.id === ctx.resolveCanonicalSubclassId(c.classId, c.subclassId));
        if (cls?.scalingTraits?.[key] || (sub as any)?.scalingTraits?.[key]) return c.level || 0;
    }
    return 0;
}

export function getMaxMetamagicCount(ctx: CharacterCreatorContext): number {
    return scalingTraitCount(ctx, "metamagicByLevel");
}

export function getMaxInvocationsCount(ctx: CharacterCreatorContext): number {
    return scalingTraitCount(ctx, "invocationsByLevel");
}

export function getMaxManeuversCount(ctx: CharacterCreatorContext): number {
    return scalingTraitCount(ctx, "maneuversByLevel");
}

export function getEffectiveAbilityScore(ctx: CharacterCreatorContext, stat: AbilityName): number {
    let score = ctx.state.baseAbilities[stat] || 10;
    // Background bonuses
    if (ctx.state.backgroundOption === "two-and-one") {
        if (ctx.state.bgStatA === stat) score += 2;
        else if (ctx.state.bgStatB === stat) score += 1;
    } else {
        if (ctx.state.bgStatA === stat || ctx.state.bgStatB === stat || ctx.state.bgStatC === stat) {
            score += 1;
        }
    }

    // ASI / Feat bonuses for each class's earned slots
    normalizeAsiChoices(ctx);
    for (const slot of getAsiSlots(ctx)) {
        const choice = ctx.state.asiChoices?.[slot.key];
        if (!choice) continue;
        if (choice.type === "single") {
            if (choice.statA === stat) score += 2;
        } else if (choice.type === "dual") {
            if (choice.statA === stat) score += 1;
            if (choice.statB === stat) score += 1;
        } else if (choice.type === "feat") {
            if (choice.statA === stat) score += 1;
        }
    }

    return score;
}

export function getAbilityModifier(ctx: CharacterCreatorContext, stat: AbilityName): number {
    return Math.floor((getEffectiveAbilityScore(ctx, stat) - 10) / 2);
}

const partsTotal = (parts: BonusPart[]) => parts.filter((p) => !p.overriddenBy).reduce((sum, p) => sum + p.value, 0);
const modifierLabel = (m: StatModifier, fallback: string) => String((m as any).label || (m as any).description || fallback);

/** Max HP as named parts: each class's hit dice, CON per level, feats, species traits, class features. */
export function getMaxHpParts(ctx: CharacterCreatorContext): BonusPart[] {
    ctx.syncStateClassProperties();
    const conMod = getAbilityModifier(ctx, "con");
    const parts: BonusPart[] = [];
    (ctx.state.classes || []).forEach((choice, idx) => {
        const cls = ctx.classes.find((c) => c.id === choice.classId) || ctx.classes[0];
        const hitDie = cls.hitDie;
        const level = choice.level || 1;
        const avgDie = Math.floor(hitDie / 2) + 1;
        if (idx === 0) {
            // First class Level 1: full hit die, then the average for each level after
            parts.push({ label: `${cls.name} hit dice (${hitDie}${level > 1 ? ` + ${avgDie} × ${level - 1}` : ""})`, value: hitDie + (level - 1) * avgDie });
        } else {
            parts.push({ label: `${cls.name} hit dice (${avgDie} × ${level})`, value: level * avgDie });
        }
    });
    const totalLevel = ctx.getTotalLevel();
    parts.push({ label: `CON modifier × ${totalLevel} levels`, value: conMod * totalLevel });
    const pb = getProficiencyBonus(ctx);
    for (const feat of getCharacterFeats(ctx)) {
        for (const m of featModifiers([feat], "vitals.maxHp", "bonus")) parts.push({ label: feat.name, value: featModifierNumber(m, totalLevel, pb) });
    }
    for (const m of speciesModifiers(currentSpecies(ctx), currentLineage(ctx), totalLevel)) {
        if (m.target !== "vitals.maxHp" || m.type !== "bonus") continue;
        parts.push({ label: modifierLabel(m, "Species trait"), value: typeof m.perClassLevel === "number" ? m.perClassLevel * totalLevel : Number(m.value) || 0 });
    }
    for (const m of getProgressionModifiers(ctx)) {
        if (m.target === "vitals.maxHp" && m.type === "bonus") parts.push({ label: m.source, value: modifierNumber(m) });
    }
    return parts;
}

export function getMaxHp(ctx: CharacterCreatorContext): number {
    return Math.max(1, partsTotal(getMaxHpParts(ctx)));
}

/** AC as named parts: the armor or the winning unarmored formula, DEX, shield, and bonuses whose armor condition is met. */
export function getArmorClassParts(ctx: CharacterCreatorContext): BonusPart[] {
    const dexMod = getAbilityModifier(ctx, "dex");
    const armor = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor);
    const parts: BonusPart[] = [];
    if (armor) {
        parts.push({ label: armor.name, value: armor.baseAc });
        if (armor.category === "Light") parts.push({ label: "DEX modifier", value: dexMod });
        else if (armor.category === "Medium") parts.push({ label: "DEX modifier (max 2)", value: Math.min(2, dexMod) });
    } else {
        let best: BonusPart[] = [{ label: "Base", value: 10 }, { label: "DEX modifier", value: dexMod }];
        // Unarmored Defense and similar class features: 10 + the listed abilities' modifiers
        for (const m of getProgressionModifiers(ctx)) {
            if (m.target !== "vitals.ac" || m.type !== "unarmored_ac" || !Array.isArray(m.abilities)) continue;
            if (ctx.state.hasShield && m.allowsShield === false) continue;
            const value = 10 + m.abilities.reduce((sum, ab) => sum + getAbilityModifier(ctx, ab), 0);
            if (value > partsTotal(best)) best = [{ label: `${m.source} (10 + ${m.abilities.map((ab) => ab.toUpperCase()).join(" + ")})`, value }];
        }
        parts.push(...best);
    }
    if (ctx.state.hasShield) parts.push({ label: "Shield", value: 2 });
    // Bonuses to AC (e.g. Defense Fighting Style while wearing armor)
    const armorCategory = armor?.category || null;
    for (const m of getProgressionModifiers(ctx)) {
        if (m.target !== "vitals.ac" || m.type !== "bonus") continue;
        if (!armorRequirementMet(m, armorCategory, !!ctx.state.hasShield)) continue;
        parts.push({ label: m.source, value: modifierNumber(m) });
    }
    return parts;
}

export function getArmorClass(ctx: CharacterCreatorContext): number {
    return partsTotal(getArmorClassParts(ctx));
}

/** What Initiative gets beyond the DEX modifier, named: feats (Alert) and class features (Dread Ambusher). */
export function getInitiativeParts(ctx: CharacterCreatorContext): BonusPart[] {
    const parts: BonusPart[] = [];
    const level = ctx.getTotalLevel() || 1;
    const pb = getProficiencyBonus(ctx);
    for (const feat of getCharacterFeats(ctx)) {
        for (const m of featModifiers([feat], "vitals.initiative", "bonus")) parts.push({ label: feat.name, value: featModifierNumber(m, level, pb) });
    }
    for (const m of getProgressionModifiers(ctx)) {
        if (m.target === "vitals.initiative" && m.type === "ability_mod" && m.abilitySource) {
            parts.push({ label: m.source, value: Math.max(m.minimum ?? -Infinity, getAbilityModifier(ctx, m.abilitySource)) });
        }
    }
    return parts;
}

export function getInitiative(ctx: CharacterCreatorContext): number {
    return getAbilityModifier(ctx, "dex") + partsTotal(getInitiativeParts(ctx));
}

/** Walking speed as named parts: the species' base, lineage, feats, class features, and a heavy armor penalty. */
export function getSpeedParts(ctx: CharacterCreatorContext): BonusPart[] {
    const species = ctx.species.find((s) => s.id === ctx.state.speciesId);
    const parts: BonusPart[] = [{ label: `Base (${species?.name || "species"})`, value: species?.speed || 30 }];
    const lineage = currentLineage(ctx);
    if (Number(lineage?.speedBonus)) parts.push({ label: String(lineage?.name || "Lineage"), value: Number(lineage?.speedBonus) });
    const level = ctx.getTotalLevel() || 1;
    const pb = getProficiencyBonus(ctx);
    for (const feat of getCharacterFeats(ctx)) {
        for (const m of featModifiers([feat], "vitals.speed", "bonus")) parts.push({ label: feat.name, value: featModifierNumber(m, level, pb) });
    }
    // Class and subclass features (e.g. Fast Movement, Unarmored Movement, Roving), when their armor condition is met
    const armorCategory = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor)?.category || null;
    for (const m of getProgressionModifiers(ctx)) {
        if (m.target !== "vitals.speed" || m.type !== "bonus") continue;
        if (!armorRequirementMet(m, armorCategory === "Shield" ? null : armorCategory, !!ctx.state.hasShield)) continue;
        parts.push({ label: m.source, value: modifierNumber(m) });
    }
    // Heavy Armor Strength requirement penalty: -10 ft if Strength is lower than required
    if (ctx.state.selectedArmor && ctx.state.selectedArmor !== "None") {
        const armor = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor);
        if (armor?.strengthRequired && getEffectiveAbilityScore(ctx, "str") < armor.strengthRequired) {
            const before = partsTotal(parts);
            parts.push({ label: `${armor.name} (Strength ${armor.strengthRequired} needed)`, value: Math.max(5, before - 10) - before });
        }
    }
    return parts;
}

export function getSpeed(ctx: CharacterCreatorContext): number {
    return partsTotal(getSpeedParts(ctx));
}

/** Climb / swim / fly speeds from class, subclass, and feat features ("walk" = equal to walking speed). */
export function getSpecialSpeeds(ctx: CharacterCreatorContext): string[] {
    const baseSpeed = getSpeed(ctx);
    const best: Record<string, number> = {};
    const feats = getCharacterFeats(ctx);
    const featMods = ["climb", "swim", "fly", "burrow"].flatMap((k) => [
        ...featModifiers(feats, `vitals.${k}`, "set"),
        ...featModifiers(feats, `speeds.${k}`, "set")
    ]);
    const allMods = [...getProgressionModifiers(ctx), ...featMods];
    for (const m of allMods) {
        const kind = String(m.target || "").replace(/^(vitals|speeds)\./, "");
        if (!["climb", "swim", "fly", "burrow"].includes(kind) || m.type !== "set") continue;
        const value = (m.value === "walk" || m.value === "equal_walk") ? baseSpeed : Number(m.value) || 0;
        best[kind] = Math.max(best[kind] || 0, value);
    }
    const labels: Record<string, string> = { climb: "Climb", swim: "Swim", fly: "Fly", burrow: "Burrow" };
    return ["climb", "swim", "fly", "burrow"].filter((k) => best[k] > 0).map((k) => `${labels[k]} ${best[k]} ft.`);
}

export function getSpeedDisplay(ctx: CharacterCreatorContext): string {
    const base = `${getSpeed(ctx)} ft.`;
    const special = getSpecialSpeeds(ctx);
    if (special.length > 0) {
        return `${base} (${special.join(", ")})`;
    }
    return base;
}

export function canMulticlassInto(
    ctx: CharacterCreatorContext,
    candidateClassId: string,
    classIndex: number
): { allowed: boolean; reason?: string; prereqLabel?: string; currentScoreText?: string } {
    // If candidate class is already taken by another class slot:
    const isDuplicate = ctx.state.classes.some((c, idx) => idx !== classIndex && c.classId === candidateClassId);
    if (isDuplicate) {
        return {
            allowed: false,
            reason: "Already chosen"
        };
    }

    // D&D 2024 Rule: Must meet prerequisites for BOTH existing class(es) and the new class.
    // 1. Check all other existing classes:
    for (let idx = 0; idx < ctx.state.classes.length; idx++) {
        if (idx === classIndex) continue;
        const existing = ctx.state.classes[idx];
        const existingCls = ctx.classes.find((c) => c.id === existing.classId);
        const check = checkClassPrerequisite(existingCls || existing.classId, (stat) => getEffectiveAbilityScore(ctx, stat));
        if (!check.met) {
            const roleName = idx === 0 ? "Primary class" : "Current class";
            return {
                allowed: false,
                reason: `${roleName} (${existingCls?.name || existing.classId}) requires ${check.label} (Current: ${check.currentScoreText}) to multiclass`,
                prereqLabel: check.label,
                currentScoreText: check.currentScoreText
            };
        }
    }

    // 2. Check candidate class prerequisite:
    const candidateCls = ctx.classes.find((c) => c.id === candidateClassId);
    const candidateCheck = checkClassPrerequisite(candidateCls || candidateClassId, (stat) => getEffectiveAbilityScore(ctx, stat));
    if (!candidateCheck.met) {
        return {
            allowed: false,
            reason: `Requires ${candidateCheck.label} (Current: ${candidateCheck.currentScoreText})`,
            prereqLabel: candidateCheck.label,
            currentScoreText: candidateCheck.currentScoreText
        };
    }

    return {
        allowed: true,
        prereqLabel: candidateCheck.label,
        currentScoreText: candidateCheck.currentScoreText
    };
}

/**
 * Armor / weapon training from class and subclass features (e.g. Divine Order Protector: proficiencies.armor.heavy),
 * as proficiency names ("Heavy Armor", "Martial Weapons").
 */
function progressionProficiencies(ctx: CharacterCreatorContext, kind: "armor" | "weapons"): string[] {
    const names: string[] = [];
    for (const m of getProgressionModifiers(ctx)) {
        const target = String(m.target || "");
        if (!target.startsWith(`proficiencies.${kind}.`)) continue;
        const what = target.slice(`proficiencies.${kind}.`.length);
        const label = what.charAt(0).toUpperCase() + what.slice(1);
        names.push(kind === "armor" ? (what === "shields" ? "Shields" : `${label} Armor`) : `${label} Weapons`);
    }
    return names;
}

export function getAllArmorProficiencies(ctx: CharacterCreatorContext): string[] {
    ctx.syncStateClassProperties();
    const profs = new Set<string>();
    const primary = ctx.state.classes[0];
    const primaryId = primary?.classId || ctx.state.classId;
    if (primaryId) {
        const cls = ctx.classes.find((c) => c.id === primaryId);
        cls?.armorProficiencies.forEach((p) => profs.add(p));
    }
    for (let i = 1; i < ctx.state.classes.length; i++) {
        const cc = ctx.state.classes[i];
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        const multi = cls?.multiclassing?.proficiencies;
        multi?.armor.forEach((p) => profs.add(p));
    }
    progressionProficiencies(ctx, "armor").forEach((p) => profs.add(p));
    return Array.from(profs);
}

export function getAllWeaponProficiencies(ctx: CharacterCreatorContext): string[] {
    ctx.syncStateClassProperties();
    const profs = new Set<string>();
    const primary = ctx.state.classes[0];
    const primaryId = primary?.classId || ctx.state.classId;
    if (primaryId) {
        const cls = ctx.classes.find((c) => c.id === primaryId);
        cls?.weaponProficiencies.forEach((p) => profs.add(p));
    }
    for (let i = 1; i < ctx.state.classes.length; i++) {
        const cc = ctx.state.classes[i];
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        const multi = cls?.multiclassing?.proficiencies;
        multi?.weapons.forEach((p) => profs.add(p));
    }
    progressionProficiencies(ctx, "weapons").forEach((p) => profs.add(p));
    return Array.from(profs);
}

export function getAllToolProficiencies(ctx: CharacterCreatorContext): string[] {
    ctx.syncStateClassProperties();
    const tools = new Set<string>();
    if (ctx.state.bgTool) tools.add(ctx.state.bgTool);
    for (let i = 1; i < ctx.state.classes.length; i++) {
        const cc = ctx.state.classes[i];
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        const multi = cls?.multiclassing?.proficiencies;
        multi?.tools.forEach((t) => tools.add(t));
    }
    return Array.from(tools);
}

export function isProficientWithArmor(ctx: CharacterCreatorContext, armorName: string): boolean {
    if (!armorName || armorName === "None") return true;
    const armor = BASE_ARMOR_2024.find((a) => a.name === armorName);
    if (!armor) return true;
    const profs = getAllArmorProficiencies(ctx);
    if (profs.includes("All Armor")) return true;
    return profs.some((p) => p.toLowerCase().includes(armor.category.toLowerCase()));
}

export function isProficientWithShield(ctx: CharacterCreatorContext): boolean {
    const profs = getAllArmorProficiencies(ctx);
    return profs.includes("Shields") || profs.includes("All Armor");
}

export function isProficientWithWeapon(ctx: CharacterCreatorContext, weaponName: string): boolean {
    const weapon = BASE_WEAPONS_2024.find((w) => w.name === weaponName);
    if (!weapon) return true;
    const profs = getAllWeaponProficiencies(ctx);
    if (profs.includes("Martial Weapons") || profs.includes("Simple Weapons, Martial Weapons")) return true;
    if (weapon.category.startsWith("Simple") && profs.some((p) => p.includes("Simple"))) return true;
    // Restricted training, e.g. "Martial Weapons with Finesse or Light" (Rogue), "Martial Weapons with Light property" (Monk)
    for (const p of profs) {
        const m = p.match(/^(Simple|Martial) Weapons with (.+?)(?: propert(?:y|ies))?$/i);
        if (!m || !weapon.category.toLowerCase().startsWith(m[1].toLowerCase())) continue;
        const allowed = m[2].split(/\s*(?:,|\bor\b|\band\b)\s*/i).map((s) => s.trim().toLowerCase()).filter(Boolean);
        if (weapon.properties.some((prop) => allowed.some((a) => prop.toLowerCase().startsWith(a)))) return true;
    }
    return false;
}

export function getWeaponStatRequirement(
    ctx: CharacterCreatorContext,
    weaponName: string
): { stat: "str" | "dex"; required: number; current: number; met: boolean } | null {
    const weapon = BASE_WEAPONS_2024.find((w) => w.name === weaponName);
    if (!weapon || !weapon.properties.includes("Heavy")) return null;
    const isRanged = weapon.category.includes("Ranged");
    const stat: "str" | "dex" = isRanged ? "dex" : "str";
    const current = getEffectiveAbilityScore(ctx, stat);
    return {
        stat,
        required: 13,
        current,
        met: current >= 13
    };
}

export function getArmorStatRequirement(
    ctx: CharacterCreatorContext,
    armorName: string
): { required: number; current: number; met: boolean } | null {
    if (!armorName || armorName === "None") return null;
    const armor = BASE_ARMOR_2024.find((a) => a.name === armorName);
    if (!armor?.strengthRequired) return null;
    const current = getEffectiveAbilityScore(ctx, "str");
    return {
        required: armor.strengthRequired,
        current,
        met: current >= armor.strengthRequired
    };
}

export function initClassDefaultEquipment(ctx: CharacterCreatorContext, cls: any) {
    const effectiveStr = getEffectiveAbilityScore(ctx, "str");
    if (cls.armorProficiencies.length === 0) {
        ctx.state.selectedArmor = "None";
        ctx.state.hasShield = false;
    } else if (cls.armorProficiencies.includes("All Armor")) {
        ctx.state.selectedArmor = effectiveStr >= 13 ? "Chain Mail" : "Scale Mail";
        ctx.state.hasShield = true;
    } else if (cls.armorProficiencies.includes("Medium Armor")) {
        ctx.state.selectedArmor = "Scale Mail";
        ctx.state.hasShield = cls.armorProficiencies.includes("Shields");
    } else if (cls.armorProficiencies.includes("Light Armor")) {
        ctx.state.selectedArmor = "Leather Armor";
        ctx.state.hasShield = false;
    }

    const opt = cls.startingEquipmentOptions?.[0];
    if (opt) {
        const matched = BASE_WEAPONS_2024.filter((w) =>
            opt.items.some((it: string) => it.toLowerCase().includes(w.name.toLowerCase()))
        ).map((w) => w.name);
        if (matched.length > 0) {
            ctx.state.selectedWeapons = matched;
        }
    }
    ctx.state.equippedKitIndex = 0;
}

export function isKitEquipped(ctx: CharacterCreatorContext, idx: number): boolean {
    const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
    const opt = cls.startingEquipmentOptions?.[idx];
    if (!opt) return false;

    if (ctx.state.equippedKitIndex !== undefined) {
        return ctx.state.equippedKitIndex === idx;
    }

    // Fallback: check if the character's current armor & weapons match this kit
    const foundArmor = BASE_ARMOR_2024.find((a) =>
        opt.items.some((it) => it.toLowerCase().includes(a.name.toLowerCase()))
    );
    const expectedArmor = foundArmor ? foundArmor.name : (cls.armorProficiencies.length === 0 ? "None" : "Leather Armor");
    const expectedShield = opt.items.some((it) => it.toLowerCase().includes("shield"));
    const matchedWeapons = BASE_WEAPONS_2024.filter((w) =>
        opt.items.some((it) => it.toLowerCase().includes(w.name.toLowerCase()))
    ).map((w) => w.name);

    if (ctx.state.selectedArmor !== expectedArmor) return false;
    if (ctx.state.hasShield !== expectedShield) return false;
    if (matchedWeapons.length > 0 && !matchedWeapons.every((w) => ctx.state.selectedWeapons.includes(w))) return false;
    return true;
}

export function getTotalLevel(ctx: CharacterCreatorContext): number {
    if (!Array.isArray(ctx.state.classes) || ctx.state.classes.length === 0) {
        return ctx.state.level || 1;
    }
    return ctx.state.classes.reduce((sum, c) => sum + (c.level || 1), 0);
}

