import {
    AbilityName,
    BASE_ARMOR_2024,
    BASE_WEAPONS_2024,
    MULTICLASS_PROFICIENCIES_2024,
    checkClassPrerequisite
} from "../../../rules/dnd5e_2024";
import { ALL_SKILLS, AsiChoice, AsiSlot } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

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

export function getMaxWeaponMasteriesCount(ctx: CharacterCreatorContext): number {
    let count = 0;
    if (Array.isArray(ctx.state.classes) && ctx.state.classes.length > 0) {
        for (const c of ctx.state.classes) {
            const cls = ctx.classes.find((x) => x.id === c.classId);
            if (!cls || c.level < 1) continue;
            let mCount = 0;
            if (cls.scalingTraits?.weaponMasteriesByLevel) {
                mCount = cls.scalingTraits.weaponMasteriesByLevel[c.level] || 0;
            } else if (cls.weaponMasteryByLevel) {
                mCount = cls.weaponMasteryByLevel[c.level] || 0;
            } else if (cls.weaponMasteryCount) {
                mCount = cls.weaponMasteryCount;
                if (cls.id === "fighter") {
                    if (c.level >= 16) mCount = 6;
                    else if (c.level >= 10) mCount = 5;
                    else if (c.level >= 4) mCount = 4;
                    else mCount = 3;
                } else if (cls.id === "barbarian") {
                    if (c.level >= 10) mCount = 4;
                    else if (c.level >= 4) mCount = 3;
                    else mCount = 2;
                }
            }
            count += mCount;
        }
    }
    if (count === 0) {
        const primaryCls = ctx.classes.find((x) => x.id === ctx.state.classId);
        if (primaryCls) {
            const lvl = ctx.state.level || 1;
            if (primaryCls.scalingTraits?.weaponMasteriesByLevel) {
                count = primaryCls.scalingTraits.weaponMasteriesByLevel[lvl] || 0;
            } else if (primaryCls.weaponMasteryByLevel) {
                count = primaryCls.weaponMasteryByLevel[lvl] || 0;
            } else if (primaryCls.weaponMasteryCount) {
                let mCount = primaryCls.weaponMasteryCount;
                if (primaryCls.id === "fighter") {
                    if (lvl >= 16) mCount = 6;
                    else if (lvl >= 10) mCount = 5;
                    else if (lvl >= 4) mCount = 4;
                    else mCount = 3;
                } else if (primaryCls.id === "barbarian") {
                    if (lvl >= 10) mCount = 4;
                    else if (lvl >= 4) mCount = 3;
                    else mCount = 2;
                }
                count = mCount;
            }
        }
    }
    return count;
}

export function getMaxMetamagicCount(ctx: CharacterCreatorContext): number {
    for (const c of (ctx.state.classes || [])) {
        const cls = ctx.classes.find((x) => x.id === c.classId);
        if (cls?.scalingTraits?.metamagicByLevel) {
            return cls.scalingTraits.metamagicByLevel[c.level] || 0;
        }
    }
    const isSorc = ctx.state.classId === "sorcerer" || ctx.state.classes?.some((c) => c.classId === "sorcerer");
    if (!isSorc) return 0;
    const sorcClass = ctx.state.classes?.find((c) => c.classId === "sorcerer");
    const lvl = ctx.state.classId === "sorcerer" ? (ctx.state.level || 0) : (sorcClass?.level || 0);
    if (lvl < 2) return 0;
    if (lvl >= 17) return 4;
    if (lvl >= 10) return 3;
    return 2;
}

export function getMaxInvocationsCount(ctx: CharacterCreatorContext): number {
    for (const c of (ctx.state.classes || [])) {
        const cls = ctx.classes.find((x) => x.id === c.classId);
        if (cls?.scalingTraits?.invocationsByLevel) {
            return cls.scalingTraits.invocationsByLevel[c.level] || 0;
        }
    }
    const isWarlock = ctx.state.classId === "warlock" || ctx.state.classes?.some((c) => c.classId === "warlock");
    if (!isWarlock) return 0;
    const warlockClass = ctx.state.classes?.find((c) => c.classId === "warlock");
    const lvl = ctx.state.classId === "warlock" ? (ctx.state.level || 0) : (warlockClass?.level || 0);
    if (lvl < 1) return 0;
    if (lvl >= 18) return 10;
    if (lvl >= 15) return 9;
    if (lvl >= 12) return 8;
    if (lvl >= 9) return 7;
    if (lvl >= 7) return 6;
    if (lvl >= 5) return 5;
    if (lvl >= 2) return 3;
    return 1;
}

export function getMaxManeuversCount(ctx: CharacterCreatorContext): number {
    for (const c of (ctx.state.classes || [])) {
        const cls = ctx.classes.find((x) => x.id === c.classId);
        const sub = cls?.subclasses?.find((s) => s.id === c.subclassId);
        if ((sub as any)?.scalingTraits?.maneuversByLevel) {
            return (sub as any).scalingTraits.maneuversByLevel[c.level] || 0;
        }
    }
    const isBattleMaster = ctx.state.subclassId === "battle-master" || ctx.state.classes?.some((c) => c.classId === "fighter" && c.subclassId === "battle-master");
    if (!isBattleMaster) return 0;
    const fighterClass = ctx.state.classes?.find((c) => c.classId === "fighter");
    const lvl = ctx.state.classId === "fighter" ? (ctx.state.level || 0) : (fighterClass?.level || 0);
    if (lvl < 3) return 0;
    if (lvl >= 15) return 9;
    if (lvl >= 10) return 7;
    if (lvl >= 7) return 5;
    return 3;
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

export function getMaxHp(ctx: CharacterCreatorContext): number {
    ctx.syncStateClassProperties();
    const conMod = getAbilityModifier(ctx, "con");
    const classChoices = (ctx.state.classes && ctx.state.classes.length > 0)
        ? ctx.state.classes
        : [{ classId: ctx.state.classId || "fighter", level: ctx.state.level || 1 }];

    let hp = 0;
    classChoices.forEach((choice, idx) => {
        const cls = ctx.classes.find((c) => c.id === choice.classId) || ctx.classes[0];
        const hitDie = cls.hitDie;
        const level = choice.level || 1;
        const avgDie = Math.floor(hitDie / 2) + 1;

        if (idx === 0) {
            // First class Level 1: full hit die + Con mod
            hp += hitDie + conMod;
            if (level > 1) {
                hp += (level - 1) * (avgDie + conMod);
            }
        } else {
            // Additional classes: average hit die + Con mod for each level
            hp += level * (avgDie + conMod);
        }
    });

    const totalLevel = ctx.getTotalLevel();
    // Tough feat bonus (+2 HP per level)
    if (ctx.state.originFeatId === "tough" || (ctx.state.speciesId === "human" && ctx.state.humanExtraFeatId === "tough")) {
        hp += 2 * totalLevel;
    }

    // Dwarven Toughness (+1 HP per level)
    if (ctx.state.speciesId === "dwarf") {
        hp += totalLevel;
    }

    // Draconic Sorcerer (+1 HP per level starting at level 3)
    const sorcererChoice = classChoices.find((c) => c.classId === "sorcerer");
    if (sorcererChoice && (sorcererChoice.subclassId === "draconic" || ctx.state.subclassId === "draconic") && sorcererChoice.level >= 3) {
        hp += sorcererChoice.level;
    }

    return Math.max(1, hp);
}

export function getArmorClass(ctx: CharacterCreatorContext): number {
    const dexMod = getAbilityModifier(ctx, "dex");
    const armor = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor);
    let ac = 10 + dexMod;

    if (armor) {
        if (armor.category === "Light") {
            ac = armor.baseAc + dexMod;
        } else if (armor.category === "Medium") {
            ac = armor.baseAc + Math.min(2, dexMod);
        } else if (armor.category === "Heavy") {
            ac = armor.baseAc;
        }
    } else {
        // Unarmored Defense for Barbarian or Monk
        if (ctx.state.classId === "barbarian") {
            ac = 10 + dexMod + getAbilityModifier(ctx, "con");
        } else if (ctx.state.classId === "monk") {
            ac = 10 + dexMod + getAbilityModifier(ctx, "wis");
        } else if (ctx.state.classId === "sorcerer" && ctx.state.subclassId === "draconic" && ctx.state.level >= 3) {
            ac = 10 + dexMod + getAbilityModifier(ctx, "cha");
        } else if (ctx.state.classId === "druid" && ctx.state.subclassId === "moon" && ctx.state.level >= 6) {
            ac = Math.max(ac, 13 + getAbilityModifier(ctx, "wis"));
        }
    }

    if (ctx.state.hasShield) {
        ac += 2;
    }

    return ac;
}

export function getInitiative(ctx: CharacterCreatorContext): number {
    let init = getAbilityModifier(ctx, "dex");
    // Alert origin feat adds proficiency bonus
    if (ctx.state.originFeatId === "alert" || (ctx.state.speciesId === "human" && ctx.state.humanExtraFeatId === "alert")) {
        init += getProficiencyBonus(ctx);
    }
    return init;
}

export function getSpeed(ctx: CharacterCreatorContext): number {
    const species = ctx.species.find((s) => s.id === ctx.state.speciesId);
    let speed = species?.speed || 30;
    if (ctx.state.speciesId === "elf" && ctx.state.lineageId === "wood-elf") {
        speed += 5;
    }
    if ((ctx.state.classId === "barbarian" || ctx.state.classId === "monk") && ctx.state.level >= 5) {
        speed += 10;
    }
    // Ranger Roving (Level 6+)
    if (ctx.state.classId === "ranger" && ctx.state.level >= 6) {
        speed += 10;
    }
    // Heavy Armor Strength requirement penalty: -10 ft if Strength is lower than required
    if (ctx.state.selectedArmor && ctx.state.selectedArmor !== "None") {
        const armor = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor);
        if (armor?.strengthRequired) {
            const effectiveStr = getEffectiveAbilityScore(ctx, "str");
            if (effectiveStr < armor.strengthRequired) {
                speed = Math.max(5, speed - 10);
            }
        }
    }
    return speed;
}

export function getSpecialSpeeds(ctx: CharacterCreatorContext): string[] {
    const special: string[] = [];
    const baseSpeed = getSpeed(ctx);
    // Sea Druid Level 6+ Aquatic Affinity
    if (ctx.state.classId === "druid" && ctx.state.subclassId === "sea" && ctx.state.level >= 6) {
        special.push(`Swim ${baseSpeed} ft.`);
    }
    // Barbarian Wild Heart Aspect of the Spider (Level 6+)
    if (
        ctx.state.classId === "barbarian" &&
        ctx.state.subclassId === "wild-heart" &&
        ctx.state.level >= 6 &&
        ctx.state.subclassFeatureChoices?.["barbarian-6-wild-heart"] === "spider"
    ) {
        special.push(`Climb ${baseSpeed} ft.`);
    }
    // Ranger Level 6+ (Roving: Climbing and Swimming speed)
    if (ctx.state.classId === "ranger" && ctx.state.level >= 6) {
        special.push(`Climb ${baseSpeed} ft.`, `Swim ${baseSpeed} ft.`);
    }
    return special;
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
        const multi = cls?.multiclassing?.proficiencies || MULTICLASS_PROFICIENCIES_2024[cc.classId.toLowerCase()];
        multi?.armor.forEach((p) => profs.add(p));
    }
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
        const multi = cls?.multiclassing?.proficiencies || MULTICLASS_PROFICIENCIES_2024[cc.classId.toLowerCase()];
        multi?.weapons.forEach((p) => profs.add(p));
    }
    return Array.from(profs);
}

export function getAllToolProficiencies(ctx: CharacterCreatorContext): string[] {
    ctx.syncStateClassProperties();
    const tools = new Set<string>();
    if (ctx.state.bgTool) tools.add(ctx.state.bgTool);
    for (let i = 1; i < ctx.state.classes.length; i++) {
        const cc = ctx.state.classes[i];
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        const multi = cls?.multiclassing?.proficiencies || MULTICLASS_PROFICIENCIES_2024[cc.classId.toLowerCase()];
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
    const hasRogue = ctx.state.classes.some((c) => c.classId === "rogue");
    if (hasRogue && (weapon.properties.includes("Finesse") || weapon.properties.includes("Light"))) return true;
    const hasMonk = ctx.state.classes.some((c) => c.classId === "monk");
    if (hasMonk && weapon.properties.includes("Light")) return true;
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

