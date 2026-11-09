import { beforeEach, describe, expect, it, vi } from "vitest";
import { CLASSES_2024 } from "../../../src/rules/dnd5e_2024";
import { CharacterCreatorController } from "../../../src/views/characterCreator/characterCreator.ctrl";

describe("CharacterCreatorController", () => {
    let ctrl: CharacterCreatorController;

    beforeEach(() => {
        ctrl = new CharacterCreatorController();
    });

    it("initializes with default starting state", () => {
        expect(ctrl.state.currentStep).toBe(1);
        expect(ctrl.state.level).toBe(1);
        expect(ctrl.state.speciesId).toBe("human");
        expect(ctrl.state.classId).toBe("fighter");
        expect(ctrl.state.backgroundId).toBe("soldier");
    });

    it("calculates proficiency bonus correctly by level", () => {
        ctrl.state.level = 1;
        expect(ctrl.getProficiencyBonus()).toBe(2);

        ctrl.state.level = 5;
        expect(ctrl.getProficiencyBonus()).toBe(3);

        ctrl.state.level = 9;
        expect(ctrl.getProficiencyBonus()).toBe(4);

        ctrl.state.level = 13;
        expect(ctrl.getProficiencyBonus()).toBe(5);

        ctrl.state.level = 17;
        expect(ctrl.getProficiencyBonus()).toBe(6);
    });

    it("applies background ability score increases correctly", () => {
        // Option 'two-and-one': +2 to bgStatA, +1 to bgStatB
        ctrl.state.baseAbilities.str = 15;
        ctrl.state.baseAbilities.con = 13;
        ctrl.state.backgroundOption = "two-and-one";
        ctrl.state.bgStatA = "str";
        ctrl.state.bgStatB = "con";

        expect(ctrl.getEffectiveAbilityScore("str")).toBe(17);
        expect(ctrl.getAbilityModifier("str")).toBe(3);

        expect(ctrl.getEffectiveAbilityScore("con")).toBe(14);
        expect(ctrl.getAbilityModifier("con")).toBe(2);

        // Option 'three-ones': +1 to statA, statB, statC
        ctrl.state.backgroundOption = "three-ones";
        ctrl.state.bgStatA = "str";
        ctrl.state.bgStatB = "con";
        ctrl.state.bgStatC = "dex";
        ctrl.state.baseAbilities.dex = 14;

        expect(ctrl.getEffectiveAbilityScore("str")).toBe(16);
        expect(ctrl.getEffectiveAbilityScore("con")).toBe(14);
        expect(ctrl.getEffectiveAbilityScore("dex")).toBe(15);
    });

    it("calculates Max HP accurately with class hit die, Con modifier, and Tough feat", () => {
        ctrl.state.classId = "fighter"; // d10
        ctrl.state.level = 1;
        ctrl.state.baseAbilities.con = 14; // +2 mod (with no BG)
        ctrl.state.bgStatA = "str";
        ctrl.state.bgStatB = "dex";
        ctrl.state.originFeatId = "alert";

        // Level 1: 10 + 2 = 12
        expect(ctrl.getMaxHp()).toBe(12);

        // With Tough feat at level 1: 12 + 2 = 14
        ctrl.state.originFeatId = "tough";
        expect(ctrl.getMaxHp()).toBe(14);

        // At Level 5: 12 + 4 * (6 + 2) = 44 without Tough
        ctrl.state.level = 5;
        ctrl.state.originFeatId = "savage-attacker";
        ctrl.state.speciesId = "elf";
        expect(ctrl.getMaxHp()).toBe(44);

        // At Level 5 with Tough (+10 HP): 44 + 10 = 54
        ctrl.state.originFeatId = "tough";
        expect(ctrl.getMaxHp()).toBe(54);
    });

    it("calculates Armor Class accurately for heavy, light, and unarmored", () => {
        ctrl.state.baseAbilities.dex = 14; // +2 mod
        ctrl.state.baseAbilities.con = 16; // +3 mod
        ctrl.state.bgStatA = "str";
        ctrl.state.bgStatB = "int";

        // Chain Mail (Heavy, AC 16) + Shield (+2) = 18
        ctrl.state.selectedArmor = "Chain Mail";
        ctrl.state.hasShield = true;
        expect(ctrl.getArmorClass()).toBe(18);

        // Leather Armor (Light, 11 + Dex(2)) without Shield = 13
        ctrl.state.selectedArmor = "Leather Armor";
        ctrl.state.hasShield = false;
        expect(ctrl.getArmorClass()).toBe(13);

        // Barbarian Unarmored: 10 + Dex(2) + Con(3) = 15
        ctrl.state.selectedArmor = "None";
        ctrl.state.classId = "barbarian";
        expect(ctrl.getArmorClass()).toBe(15);
    });

    it("calculates Initiative with Alert feat bonus", () => {
        ctrl.state.speciesId = "elf";
        ctrl.state.baseAbilities.dex = 14; // +2
        ctrl.state.bgStatA = "str";
        ctrl.state.bgStatB = "con";
        ctrl.state.level = 1; // PB = 2

        ctrl.state.originFeatId = "savage-attacker";
        expect(ctrl.getInitiative()).toBe(2);

        // Alert feat adds PB
        ctrl.state.originFeatId = "alert";
        expect(ctrl.getInitiative()).toBe(4);
    });

    it("validates required fields on step progression", () => {
        ctrl.state.currentStep = 1;
        ctrl.state.name = "";
        expect(ctrl.validateCurrentStep()).toBe(false);

        ctrl.state.name = "Gromph";
        expect(ctrl.validateCurrentStep()).toBe(true);
    });

    it("warns spellcasting classes before passing spells screen if no spells selected", () => {
        const alertEl = document.createElement("div");
        alertEl.id = "creator-validation-alert";
        alertEl.className = "creator-alert hidden";
        document.body.appendChild(alertEl);

        // Spellcaster (Wizard) on Step 8 with 0 spells
        ctrl.state.classId = "wizard";
        ctrl.state.currentStep = 8;
        ctrl.state.selectedCantrips = [];
        ctrl.state.selectedSpellsLevel1 = [];
        ctrl.spellsWarningDismissed = false;

        // First attempt to advance: fails validation, shows warning
        const firstAttempt = ctrl.validateCurrentStep();
        expect(firstAttempt).toBe(false);
        expect(ctrl.spellsWarningDismissed).toBe(true);
        expect(alertEl.classList.contains("warning")).toBe(true);
        expect(alertEl.textContent).toContain("uses spells, but you haven't selected any spells");

        // Second attempt to advance: user acknowledges warning, proceeds
        const secondAttempt = ctrl.validateCurrentStep();
        expect(secondAttempt).toBe(true);
        expect(ctrl.spellsWarningDismissed).toBe(false);

        // If Wizard has spells selected, advances without warning
        ctrl.state.selectedCantrips = ["Light"];
        ctrl.state.selectedSpellsLevel1 = ["Magic Missile"];
        ctrl.spellsWarningDismissed = false;
        expect(ctrl.validateCurrentStep()).toBe(true);
        expect(ctrl.spellsWarningDismissed).toBe(false);

        // Non-spellcaster (Fighter) on Step 8 with 0 spells passes directly
        ctrl.state.classId = "fighter";
        ctrl.state.selectedCantrips = [];
        ctrl.state.selectedSpellsLevel1 = [];
        ctrl.spellsWarningDismissed = false;
        expect(ctrl.validateCurrentStep()).toBe(true);
        expect(ctrl.spellsWarningDismissed).toBe(false);

        document.body.removeChild(alertEl);
    });

    it("manages Standard Array assignment by swapping numbers cleanly without editing", () => {
        // Initial standard array: str 15, dex 14, con 13, int 12, wis 10, cha 8
        expect(ctrl.state.baseAbilities.str).toBe(15);
        expect(ctrl.state.baseAbilities.dex).toBe(14);

        // Assign 15 to dex: str should swap to 14
        ctrl.setStandardArrayScore("dex", 15);
        expect(ctrl.state.baseAbilities.dex).toBe(15);
        expect(ctrl.state.baseAbilities.str).toBe(14);

        // Assign 8 to str: cha (which was 8) should swap to 14
        ctrl.setStandardArrayScore("str", 8);
        expect(ctrl.state.baseAbilities.str).toBe(8);
        expect(ctrl.state.baseAbilities.cha).toBe(14);

        // All 6 numbers from the array are preserved
        const sorted = Object.values(ctrl.state.baseAbilities).sort((a, b) => b - a);
        expect(sorted).toEqual([15, 14, 13, 12, 10, 8]);
    });

    it("manages Point Buy: tracking available points (0-27) and enforcing cost scaling", () => {
        // Reset to all 8s (base minimum in Point Buy)
        ctrl.state.baseAbilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
        expect(ctrl.getSpentPoints()).toBe(0);
        expect(ctrl.getAvailablePoints()).toBe(27);

        // Decrement below 8 is blocked
        expect(ctrl.canDecrementPointBuy("str")).toBe(false);
        expect(ctrl.decrementPointBuy("str")).toBe(false);

        // Increase str to 13 (costs 1 point per increase from 8 to 13: 5 points total)
        for (let i = 8; i < 13; i++) {
            expect(ctrl.incrementPointBuy("str")).toBe(true);
        }
        expect(ctrl.state.baseAbilities.str).toBe(13);
        expect(ctrl.getSpentPoints()).toBe(5);
        expect(ctrl.getAvailablePoints()).toBe(22);

        // Increasing to 14 costs 2 points (total cost for 14 is 7 pts)
        expect(ctrl.incrementPointBuy("str")).toBe(true);
        expect(ctrl.state.baseAbilities.str).toBe(14);
        expect(ctrl.getSpentPoints()).toBe(7);
        expect(ctrl.getAvailablePoints()).toBe(20);

        // Increasing to 15 costs 2 points (total cost for 15 is 9 pts)
        expect(ctrl.incrementPointBuy("str")).toBe(true);
        expect(ctrl.state.baseAbilities.str).toBe(15);
        expect(ctrl.getSpentPoints()).toBe(9);
        expect(ctrl.getAvailablePoints()).toBe(18);

        // Cannot increase beyond 15
        expect(ctrl.canIncrementPointBuy("str")).toBe(false);
        expect(ctrl.incrementPointBuy("str")).toBe(false);
        expect(ctrl.state.baseAbilities.str).toBe(15);

        // Decrementing str refunds points: 15 -> 14 refunds 2 points
        expect(ctrl.decrementPointBuy("str")).toBe(true);
        expect(ctrl.state.baseAbilities.str).toBe(14);
        expect(ctrl.getSpentPoints()).toBe(7);
        expect(ctrl.getAvailablePoints()).toBe(20);

        // Spend all 27 points: 15 (9), 15 (9), 15 (9), 8, 8, 8 = 27 points
        ctrl.state.baseAbilities = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 };
        expect(ctrl.getSpentPoints()).toBe(27);
        expect(ctrl.getAvailablePoints()).toBe(0);

        // When points are exhausted, increment is blocked for all stats
        expect(ctrl.canIncrementPointBuy("int")).toBe(false);
        expect(ctrl.incrementPointBuy("int")).toBe(false);
        expect(ctrl.state.baseAbilities.int).toBe(8);
        expect(ctrl.getAvailablePoints()).toBe(0);
    });

    it("enforces Strength requirements on armor and reduces speed by 10 ft when unmet", () => {
        ctrl.state.speciesId = "human"; // base speed 30 ft
        ctrl.state.selectedArmor = "None";
        ctrl.state.baseAbilities.str = 10;
        ctrl.state.bgStatA = "dex";
        ctrl.state.bgStatB = "con";
        expect(ctrl.getEffectiveAbilityScore("str")).toBe(10);
        expect(ctrl.getSpeed()).toBe(30);

        // Chain Mail requires STR 13
        ctrl.state.selectedArmor = "Chain Mail";
        const req = ctrl.getArmorStatRequirement("Chain Mail");
        expect(req).toEqual({
            required: 13,
            current: 10,
            met: false
        });
        // Speed is reduced by 10 ft
        expect(ctrl.getSpeed()).toBe(20);

        // If Strength increases to 13 (via base stat)
        ctrl.state.baseAbilities.str = 13;
        expect(ctrl.getArmorStatRequirement("Chain Mail")?.met).toBe(true);
        expect(ctrl.getSpeed()).toBe(30);

        // Splint Armor requires STR 15: STR 13 should fail
        ctrl.state.selectedArmor = "Splint Armor";
        expect(ctrl.getArmorStatRequirement("Splint Armor")?.met).toBe(false);
        expect(ctrl.getSpeed()).toBe(20);

        // Leather Armor has no strength requirement
        ctrl.state.selectedArmor = "Leather Armor";
        expect(ctrl.getArmorStatRequirement("Leather Armor")).toBeNull();
        expect(ctrl.getSpeed()).toBe(30);
    });

    it("evaluates 2024 Heavy weapon stat requirements (STR 13 for melee, DEX 13 for ranged)", () => {
        ctrl.state.baseAbilities.str = 12;
        ctrl.state.baseAbilities.dex = 14;
        ctrl.state.bgStatA = "con";
        ctrl.state.bgStatB = "wis";

        // Greatsword is Melee Heavy -> requires STR 13
        const gsReq = ctrl.getWeaponStatRequirement("Greatsword");
        expect(gsReq).toEqual({
            stat: "str",
            required: 13,
            current: 12,
            met: false
        });

        // Longbow is Ranged Heavy -> requires DEX 13
        const lbReq = ctrl.getWeaponStatRequirement("Longbow");
        expect(lbReq).toEqual({
            stat: "dex",
            required: 13,
            current: 14,
            met: true
        });

        // Heavy Crossbow is Ranged Heavy -> requires DEX 13
        const hxbReq = ctrl.getWeaponStatRequirement("Heavy Crossbow");
        expect(hxbReq?.stat).toBe("dex");
        expect(hxbReq?.met).toBe(true);

        // Non-heavy weapon (Shortsword) has no heavy stat requirement
        expect(ctrl.getWeaponStatRequirement("Shortsword")).toBeNull();
        expect(ctrl.getWeaponStatRequirement("Dagger")).toBeNull();
    });

    it("correctly identifies armor, shield, and weapon proficiencies by class", () => {
        // Fighter has All Armor, Shields, and Martial Weapons
        ctrl.state.classId = "fighter";
        expect(ctrl.isProficientWithArmor("Chain Mail")).toBe(true);
        expect(ctrl.isProficientWithArmor("Leather Armor")).toBe(true);
        expect(ctrl.isProficientWithShield()).toBe(true);
        expect(ctrl.isProficientWithWeapon("Greatsword")).toBe(true);
        expect(ctrl.isProficientWithWeapon("Dagger")).toBe(true);

        // Wizard has no armor proficiencies and only simple weapons
        ctrl.state.classId = "wizard";
        expect(ctrl.isProficientWithArmor("Chain Mail")).toBe(false);
        expect(ctrl.isProficientWithArmor("Leather Armor")).toBe(false);
        expect(ctrl.isProficientWithShield()).toBe(false);
        expect(ctrl.isProficientWithWeapon("Greatsword")).toBe(false);
        expect(ctrl.isProficientWithWeapon("Dagger")).toBe(true); // Simple Melee
    });

    it("enforces class and level limitations for cantrips and prepared spells", () => {
        // Level 1 Wizard: 3 cantrips, 4 prepared spells
        ctrl.state.classId = "wizard";
        ctrl.state.level = 1;
        ctrl.state.originFeatId = "alert";
        expect(ctrl.getMaxCantrips()).toBe(3);
        expect(ctrl.getMaxPreparedSpells()).toBe(4);

        // Level 1 Sorcerer: 4 cantrips, 2 prepared spells
        ctrl.state.classId = "sorcerer";
        expect(ctrl.getMaxCantrips()).toBe(4);
        expect(ctrl.getMaxPreparedSpells()).toBe(2);

        // Level 1 Paladin: 0 cantrips, 2 prepared spells (2024 half caster rules)
        ctrl.state.classId = "paladin";
        expect(ctrl.getMaxCantrips()).toBe(0);
        expect(ctrl.getMaxPreparedSpells()).toBe(2);

        // Level 1 Fighter (non-caster): 0 cantrips, 0 prepared spells
        ctrl.state.classId = "fighter";
        expect(ctrl.getMaxCantrips()).toBe(0);
        expect(ctrl.getMaxPreparedSpells()).toBe(0);

        // Level scaling: Level 4 Wizard has 4 cantrips, 7 prepared spells
        ctrl.state.classId = "wizard";
        ctrl.state.level = 4;
        expect(ctrl.getMaxCantrips()).toBe(4);
        expect(ctrl.getMaxPreparedSpells()).toBe(7);

        // Subclass: Level 3 Fighter Eldritch Knight gains 2 cantrips and 3 prepared spells
        ctrl.state.classId = "fighter";
        ctrl.state.level = 3;
        ctrl.state.subclassId = "eldritch-knight";
        expect(ctrl.getMaxCantrips()).toBe(2);
        expect(ctrl.getMaxPreparedSpells()).toBe(3);

        // Feat bonus: Magic Initiate grants +2 cantrips and +1 prepared spell
        ctrl.state.classId = "fighter";
        ctrl.state.subclassId = "champion";
        ctrl.state.level = 1;
        ctrl.state.originFeatId = "magic-initiate-wizard";
        expect(ctrl.getMaxCantrips()).toBe(2);
        expect(ctrl.getMaxPreparedSpells()).toBe(1);
    });

    it("sanitizes invalid spell selections when class changes while preserving extra selections for allotment warnings", () => {
        // As a Level 1 Sorcerer, select 4 cantrips
        ctrl.state.classId = "sorcerer";
        ctrl.state.level = 1;
        ctrl.state.originFeatId = "alert";
        ctrl.state.selectedCantrips = ["Fire Bolt", "Light", "Minor Illusion", "Prestidigitation"];
        ctrl.state.selectedSpellsLevel1 = ["Shield", "Magic Missile"];

        // Switch to Bard (max 2 cantrips at Level 1, Fire Bolt is not on Bard list)
        ctrl.state.classId = "bard";
        ctrl.sanitizeSpellSelections();

        expect(ctrl.state.selectedCantrips.includes("Fire Bolt")).toBe(false); // Not on Bard list
        // Valid bard cantrips are preserved even if exceeding allotment (3 > 2), so wizard can warn on advance
        expect(ctrl.state.selectedCantrips).toEqual(["Light", "Minor Illusion", "Prestidigitation"]);

        // Switch to non-caster Fighter without feat -> spells cleared to empty
        ctrl.state.classId = "fighter";
        ctrl.sanitizeSpellSelections();
        expect(ctrl.state.selectedCantrips).toEqual([]);
        expect(ctrl.state.selectedSpellsLevel1).toEqual([]);
    });

    it("calculates spell save DC and attack bonus correctly", () => {
        ctrl.state.classId = "wizard"; // Int based
        ctrl.state.level = 1; // PB = +2
        ctrl.state.baseAbilities.int = 16; // +3 mod
        ctrl.state.bgStatA = "int"; // +2 from background = 18 Int (+4 mod)
        ctrl.state.bgStatB = "con";

        expect(ctrl.getEffectiveAbilityScore("int")).toBe(18);
        expect(ctrl.getAbilityModifier("int")).toBe(4);
        expect(ctrl.getSpellcastingAbility()).toBe("int");

        // Save DC = 8 + PB(2) + Int Mod(4) = 14
        expect(ctrl.getSpellSaveDc()).toBe(14);

        // Attack Bonus = PB(2) + Int Mod(4) = +6
        expect(ctrl.getSpellAttackModifier()).toBe(6);
    });

    it("calculates maximum unlocked spell level and filters available spells by starting level", () => {
        // Full caster: Wizard
        ctrl.state.classId = "wizard";
        ctrl.state.level = 1;
        expect(ctrl.getMaxSpellLevel()).toBe(1);

        ctrl.state.level = 3;
        expect(ctrl.getMaxSpellLevel()).toBe(2);

        ctrl.state.level = 5;
        expect(ctrl.getMaxSpellLevel()).toBe(3);

        ctrl.state.level = 9;
        expect(ctrl.getMaxSpellLevel()).toBe(5);

        ctrl.state.level = 17;
        expect(ctrl.getMaxSpellLevel()).toBe(9);

        // Half caster: Paladin
        ctrl.state.classId = "paladin";
        ctrl.state.level = 1;
        expect(ctrl.getMaxSpellLevel()).toBe(1);

        ctrl.state.level = 5;
        expect(ctrl.getMaxSpellLevel()).toBe(2);

        ctrl.state.level = 9;
        expect(ctrl.getMaxSpellLevel()).toBe(3);

        // Non caster: Fighter
        ctrl.state.classId = "fighter";
        ctrl.state.subclassId = "champion";
        ctrl.state.level = 1;
        expect(ctrl.getMaxSpellLevel()).toBe(0);

        // Third caster: Eldritch Knight
        ctrl.state.subclassId = "eldritch-knight";
        ctrl.state.level = 3;
        expect(ctrl.getMaxSpellLevel()).toBe(1);

        ctrl.state.level = 7;
        expect(ctrl.getMaxSpellLevel()).toBe(2);

        // Verify available spell list filtering at Level 5 Wizard:
        ctrl.state.classId = "wizard";
        ctrl.state.level = 5;
        const availableLvl5 = ctrl.getAvailableSpells();
        const availableNames = availableLvl5.leveledSpells.map((s) => s.name);

        // Can access Level 1, 2, and 3 spells:
        expect(availableNames).toContain("Magic Missile"); // Level 1
        expect(availableNames).toContain("Misty Step");    // Level 2
        expect(availableNames).toContain("Fireball");      // Level 3

        // Cannot access Level 4+ spells:
        expect(availableNames).not.toContain("Dimension Door"); // Level 4
        expect(availableNames).not.toContain("Chain Lightning"); // Level 6

        // If character selects a Level 3 spell (Fireball) and level drops to 1:
        ctrl.state.selectedSpellsLevel1 = ["Magic Missile", "Fireball"];
        ctrl.state.level = 1;
        ctrl.sanitizeSpellSelections();

        // Fireball must be pruned because Level 1 Wizard only has 1st-level spell slots
        expect(ctrl.state.selectedSpellsLevel1).toContain("Magic Missile");
        expect(ctrl.state.selectedSpellsLevel1).not.toContain("Fireball");
    });

    it("calculates ASI milestone levels accurately by class and current level", () => {
        // Standard class (e.g. Wizard)
        ctrl.state.classId = "wizard";
        ctrl.state.level = 1;
        expect(ctrl.getAsiLevels()).toEqual([]);

        ctrl.state.level = 4;
        expect(ctrl.getAsiLevels()).toEqual([4]);

        ctrl.state.level = 12;
        expect(ctrl.getAsiLevels()).toEqual([4, 8, 12]);

        ctrl.state.level = 20;
        expect(ctrl.getAsiLevels()).toEqual([4, 8, 12, 16, 19]);

        // Fighter gains extra ASIs at 6 and 14
        ctrl.state.classId = "fighter";
        ctrl.state.level = 6;
        expect(ctrl.getAsiLevels()).toEqual([4, 6]);

        ctrl.state.level = 14;
        expect(ctrl.getAsiLevels()).toEqual([4, 6, 8, 12, 14]);

        ctrl.state.level = 20;
        expect(ctrl.getAsiLevels()).toEqual([4, 6, 8, 12, 14, 16, 19]);

        // Rogue gains extra ASI at 10
        ctrl.state.classId = "rogue";
        ctrl.state.level = 10;
        expect(ctrl.getAsiLevels()).toEqual([4, 8, 10]);

        ctrl.state.level = 20;
        expect(ctrl.getAsiLevels()).toEqual([4, 8, 10, 12, 16, 19]);
    });

    it("applies ASI choices (single +2, dual +1/+1, and feat +1) to effective ability scores", () => {
        ctrl.state.classId = "fighter";
        ctrl.state.level = 8;
        ctrl.state.baseAbilities = { str: 15, dex: 14, con: 13, int: 10, wis: 10, cha: 8 };
        ctrl.state.backgroundOption = "two-and-one";
        ctrl.state.bgStatA = "str"; // +2 => 17
        ctrl.state.bgStatB = "con"; // +1 => 14

        // Level 4: +2 STR
        // Level 6: +1 DEX, +1 CON
        // Level 8: Feat (Heavy Armor Master: +1 STR)
        ctrl.state.asiChoices = {
            4: { type: "single", statA: "str" },
            6: { type: "dual", statA: "dex", statB: "con" },
            8: { type: "feat", featId: "heavy-armor-master", statA: "str" }
        };

        // STR: base 15 + 2 (BG) + 2 (Lvl 4) + 1 (Lvl 8 Feat) = 20
        expect(ctrl.getEffectiveAbilityScore("str")).toBe(20);
        expect(ctrl.getAbilityModifier("str")).toBe(5);

        // DEX: base 14 + 1 (Lvl 6) = 15
        expect(ctrl.getEffectiveAbilityScore("dex")).toBe(15);
        expect(ctrl.getAbilityModifier("dex")).toBe(2);

        // CON: base 13 + 1 (BG) + 1 (Lvl 6) = 15
        expect(ctrl.getEffectiveAbilityScore("con")).toBe(15);
        expect(ctrl.getAbilityModifier("con")).toBe(2);
    });

    it("computes progression feature limits accurately across levels", () => {
        // Metamagic (Sorcerer)
        ctrl.state.classId = "sorcerer";
        ctrl.state.level = 1;
        expect(ctrl.getMaxMetamagicCount()).toBe(0);
        ctrl.state.level = 2;
        expect(ctrl.getMaxMetamagicCount()).toBe(2);
        ctrl.state.level = 10;
        expect(ctrl.getMaxMetamagicCount()).toBe(3);
        ctrl.state.level = 17;
        expect(ctrl.getMaxMetamagicCount()).toBe(4);

        // Eldritch Invocations (Warlock)
        ctrl.state.classId = "warlock";
        ctrl.state.level = 1;
        expect(ctrl.getMaxInvocationsCount()).toBe(1);
        ctrl.state.level = 2;
        expect(ctrl.getMaxInvocationsCount()).toBe(3);
        ctrl.state.level = 5;
        expect(ctrl.getMaxInvocationsCount()).toBe(5);
        ctrl.state.level = 9;
        expect(ctrl.getMaxInvocationsCount()).toBe(7);
        ctrl.state.level = 18;
        expect(ctrl.getMaxInvocationsCount()).toBe(10);

        // Battle Master Maneuvers (Fighter)
        ctrl.state.classId = "fighter";
        ctrl.state.subclassId = "battle-master";
        ctrl.state.level = 1;
        expect(ctrl.getMaxManeuversCount()).toBe(0);
        ctrl.state.level = 3;
        expect(ctrl.getMaxManeuversCount()).toBe(3);
        ctrl.state.level = 7;
        expect(ctrl.getMaxManeuversCount()).toBe(5);
        ctrl.state.level = 10;
        expect(ctrl.getMaxManeuversCount()).toBe(7);
        ctrl.state.level = 15;
        expect(ctrl.getMaxManeuversCount()).toBe(9);

        // Expertise (Rogue, Bard, Ranger)
        ctrl.state.classId = "rogue";
        ctrl.state.level = 1;
        expect(ctrl.getMaxExpertiseCount()).toBe(2);
        ctrl.state.level = 6;
        expect(ctrl.getMaxExpertiseCount()).toBe(4);

        ctrl.state.classId = "bard";
        ctrl.state.level = 1;
        expect(ctrl.getMaxExpertiseCount()).toBe(0);
        ctrl.state.level = 2;
        expect(ctrl.getMaxExpertiseCount()).toBe(2);
        ctrl.state.level = 9;
        expect(ctrl.getMaxExpertiseCount()).toBe(4);

        ctrl.state.classId = "ranger";
        ctrl.state.level = 1;
        expect(ctrl.getMaxExpertiseCount()).toBe(0);
        ctrl.state.level = 2;
        expect(ctrl.getMaxExpertiseCount()).toBe(1);
        ctrl.state.level = 9;
        expect(ctrl.getMaxExpertiseCount()).toBe(2);
    });

    it("renders class level progression (levels 1-20) in Step 3", () => {
        // Document body mock for step rendering
        document.body.innerHTML = '<div id="creator-step-panels"></div>';

        ctrl.state.classId = "fighter";
        ctrl.state.level = 5;
        ctrl.renderStep(3);

        const container = document.getElementById("creator-step-panels")!;
        expect(container.innerHTML).toContain("class-progression-box");
        expect(container.innerHTML).toContain("Fighter Level Progression (Levels 1–20)");

        // Unlocked up to level 5, locked for levels 6 to 20
        const unlockedRows = container.querySelectorAll(".progression-row.unlocked");
        expect(unlockedRows.length).toBe(5);

        const lockedRows = container.querySelectorAll(".progression-row.locked");
        expect(lockedRows.length).toBe(15);

        // Contains Level 1 Second Wind, Level 5 Extra Attack, Level 20 Three Extra Attacks
        expect(container.innerHTML).toContain("Second Wind");
        expect(container.innerHTML).toContain("Extra Attack");
        expect(container.innerHTML).toContain("Three Extra Attacks");

        // Filter to unlocked only
        ctrl.progressionFilter = "unlocked";
        ctrl.renderStep(3);
        const filteredRows = container.querySelectorAll(".progression-row");
        expect(filteredRows.length).toBe(5);

        // Switch to Wizard
        ctrl.state.classId = "wizard";
        ctrl.progressionFilter = "all";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        expect(container.innerHTML).toContain("Wizard Level Progression (Levels 1–20)");
        expect(container.innerHTML).toContain("Spellbook");
        expect(container.innerHTML).toContain("Arcane Recovery");
        expect(container.innerHTML).toContain("Signature Spells");
    });

    it("displays Subclass Selection (Level 3) rather than the character's current level", () => {
        const ctrl = new CharacterCreatorController();
        ctrl.state.classId = "fighter";
        ctrl.state.level = 10;
        ctrl.renderStep(3);

        const container = document.getElementById("creator-step-panels")!;
        expect(container.innerHTML).toContain("Subclass Selection (Level 3)");
        expect(container.innerHTML).not.toContain("Subclass Selection (Level 10)");
    });

    it("renders level boxes for all levels including abilities without player choices", () => {
        const ctrl = new CharacterCreatorController();
        ctrl.state.classId = "fighter";
        ctrl.state.level = 5;
        ctrl.renderStep(3);

        const container = document.getElementById("creator-step-panels")!;

        // Level 2 box has no player choices, but displays Action Surge and Tactical Mind
        const lvl2Box = container.querySelector('.level-progression-box[data-level="2"]');
        expect(lvl2Box).not.toBeNull();
        expect(lvl2Box!.innerHTML).toContain("Action Surge");
        expect(lvl2Box!.innerHTML).toContain("Tactical Mind");

        // Level 5 box displays Extra Attack and Tactical Shift
        const lvl5Box = container.querySelector('.level-progression-box[data-level="5"]');
        expect(lvl5Box).not.toBeNull();
        expect(lvl5Box!.innerHTML).toContain("Extra Attack");
        expect(lvl5Box!.innerHTML).toContain("Tactical Shift");

        // Level 1 box displays abilities and Weapon Masteries choice box
        const lvl1Box = container.querySelector('.level-progression-box[data-level="1"]');
        expect(lvl1Box).not.toBeNull();
        expect(lvl1Box!.innerHTML).toContain("Second Wind");
        expect(lvl1Box!.innerHTML).toContain("Weapon Masteries");

        // Level 3 box contains Subclass Selection
        const lvl3Box = container.querySelector('.level-progression-box[data-level="3"]');
        expect(lvl3Box).not.toBeNull();
        expect(lvl3Box!.innerHTML).toContain("Subclass Selection (Level 3)");

        // No scrolling list container
        expect(container.querySelector(".progression-timeline")).toBeNull();
    });

    it("makes each level progression collapsible and supports toggle all", () => {
        const ctrl = new CharacterCreatorController();
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';

        ctrl.state.classId = "fighter";
        ctrl.state.level = 3;
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const container = document.getElementById("creator-step-panels")!;
        const lvl1Box = container.querySelector('.level-progression-box[data-level="1"]') as HTMLElement;
        const lvl1Header = lvl1Box.querySelector(".level-card-header") as HTMLElement;
        const lvl1Body = lvl1Box.querySelector(".level-progression-body") as HTMLElement;
        const lvl1CollapseBtn = lvl1Box.querySelector(".level-collapse-btn") as HTMLElement;

        expect(lvl1Box).not.toBeNull();
        expect(lvl1Header).not.toBeNull();
        expect(lvl1Body).not.toBeNull();
        expect(lvl1CollapseBtn).not.toBeNull();
        expect(lvl1Box.classList.contains("is-collapsed")).toBe(false);

        // Click header to collapse
        lvl1Header.click();
        expect(lvl1Box.classList.contains("is-collapsed")).toBe(true);
        expect(lvl1Body.style.display).toBe("none");
        expect(lvl1CollapseBtn.getAttribute("aria-expanded")).toBe("false");
        expect(ctrl.collapsedProgressionLevels.has("0-1")).toBe(true);

        // Click header again to expand
        lvl1Header.click();
        expect(lvl1Box.classList.contains("is-collapsed")).toBe(false);
        expect(lvl1Body.style.display).toBe("");
        expect(lvl1CollapseBtn.getAttribute("aria-expanded")).toBe("true");
        expect(ctrl.collapsedProgressionLevels.has("0-1")).toBe(false);

        // Clicking the badge does NOT collapse the box
        const lvl1Badge = lvl1Box.querySelector('.progression-lvl-badge[data-level="1"]') as HTMLElement;
        lvl1Badge.click();
        expect(lvl1Box.classList.contains("is-collapsed")).toBe(false);

        // Collapse All button collapses all 20 levels
        const collapseAllBtn = container.querySelector('.progression-toggle-all-btn[data-action="collapse-all"]') as HTMLElement;
        expect(collapseAllBtn).not.toBeNull();
        collapseAllBtn.click();

        const allBoxes = container.querySelectorAll(".level-progression-box");
        expect(Array.from(allBoxes).every((b) => b.classList.contains("is-collapsed"))).toBe(true);
        expect(ctrl.collapsedProgressionLevels.size).toBe(20);

        // Expand All button expands all levels
        const expandAllBtn = container.querySelector('.progression-toggle-all-btn[data-action="expand-all"]') as HTMLElement;
        expect(expandAllBtn).not.toBeNull();
        expandAllBtn.click();

        expect(Array.from(allBoxes).every((b) => !b.classList.contains("is-collapsed"))).toBe(true);
        expect(ctrl.collapsedProgressionLevels.size).toBe(0);
    });

    it("unlocks levels by clicking the progression-lvl-badge and supports adding multiclass with navigation buttons", () => {
        const ctrl = new CharacterCreatorController();
        document.body.innerHTML = '<div id="creator-step-panels"></div>';

        // Fighter at level 3
        ctrl.state.classId = "fighter";
        ctrl.state.level = 3;
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const container = document.getElementById("creator-step-panels")!;

        // Load more / show less link should NOT exist
        expect(container.querySelector("#progression-load-more-link")).toBeNull();
        expect(container.querySelector(".progression-load-more-container")).toBeNull();

        // Unlocked rows: Levels 1, 2, 3
        const unlockedRows = container.querySelectorAll(".progression-row.unlocked");
        expect(unlockedRows.length).toBe(3);

        // Locked rows: Levels 4 to 20
        const lockedRows = container.querySelectorAll(".progression-row.locked");
        expect(lockedRows.length).toBe(17);

        // Level is determined by clicking progression-lvl-badge to unlock that level
        const lvl6Badge = container.querySelector('.progression-lvl-badge[data-level="6"]') as HTMLElement;
        expect(lvl6Badge).not.toBeNull();
        lvl6Badge.click();

        expect(ctrl.state.classes[0].level).toBe(6);
        expect(ctrl.state.level).toBe(6);
        expect(container.querySelectorAll(".progression-row.unlocked").length).toBe(6);
        expect(container.querySelectorAll(".progression-row.locked").length).toBe(14);

        // Bottom bar contains "+ Add Class" button
        const addClassBtn = container.querySelector("#add-class-btn") as HTMLButtonElement;
        expect(addClassBtn).not.toBeNull();
        expect(addClassBtn.textContent).toContain("Add Class");

        // Mock scrollIntoView
        const scrollIntoViewMock = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

        // Click "+ Add Class" button
        addClassBtn.click();

        // Now has 2 classes
        expect(ctrl.state.classes.length).toBe(2);
        expect(document.getElementById("class-section-0")).not.toBeNull();
        expect(document.getElementById("class-section-1")).not.toBeNull();

        // A navigation button showing the name of that class appears in the bottom nav
        const bottomNav = document.getElementById("multiclass-bottom-nav")!;
        const navBtn = bottomNav.querySelector(".nav-to-class-btn") as HTMLButtonElement;
        expect(navBtn).not.toBeNull();
        const secondClass = ctrl.classes.find((c) => c.id === ctrl.state.classes[1].classId);
        expect(navBtn.textContent).toContain(secondClass?.name);

        // Clicking the class button scrolls to the new class
        navBtn.click();
        expect(scrollIntoViewMock).toHaveBeenCalled();

        // Verify total level sums both classes
        ctrl.state.classes[1].level = 4;
        expect(ctrl.getTotalLevel()).toBe(10);
    });

    it("allows selecting class, subclass, and feature choices on the primary class", () => {
        const ctrl = new CharacterCreatorController();
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';

        ctrl.renderStep(3);
        const container = document.getElementById("creator-step-panels")!;

        // Primary class is initially Fighter
        expect(ctrl.state.classId).toBe("fighter");

        // Click Rogue class card on primary class
        const rogueCard = container.querySelector('.class-card[data-class-id="rogue"][data-class-index="0"]') as HTMLElement;
        expect(rogueCard).not.toBeNull();
        rogueCard.click();

        expect(ctrl.state.classes[0].classId).toBe("rogue");
        expect(ctrl.state.classId).toBe("rogue");

        // Unlock Level 3 for Rogue so subclasses are shown
        const lvl3Badge = container.querySelector('.progression-lvl-badge[data-level="3"][data-class-index="0"]') as HTMLElement;
        expect(lvl3Badge).not.toBeNull();
        lvl3Badge.click();

        expect(ctrl.state.classes[0].level).toBe(3);
        expect(ctrl.state.level).toBe(3);

        // Select Thief subclass
        const thiefCard = container.querySelector('.subclass-card[data-subclass-id="thief"][data-class-index="0"]') as HTMLElement;
        expect(thiefCard).not.toBeNull();
        thiefCard.click();

        expect(ctrl.state.classes[0].subclassId).toBe("thief");
        expect(ctrl.state.subclassId).toBe("thief");
    });

    it("clearly indicates when a starting equipment kit is equipped", () => {
        const ctrl = new CharacterCreatorController();
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';

        ctrl.state.classId = "fighter";
        ctrl.renderStep(7);

        const container = document.getElementById("creator-step-panels")!;
        const packageCards = container.querySelectorAll(".starting-package-card");
        expect(packageCards.length).toBeGreaterThanOrEqual(2);

        // Initially Option A is equipped for Fighter
        expect(ctrl.isKitEquipped(0)).toBe(true);
        expect(packageCards[0].classList.contains("equipped")).toBe(true);
        expect(packageCards[0].querySelector(".package-equipped-badge")?.textContent).toContain("Equipped");
        const btnA = packageCards[0].querySelector(".equip-package-btn") as HTMLButtonElement;
        expect(btnA.textContent).toContain("Equipped");
        expect(btnA.classList.contains("equipped")).toBe(true);

        // Option B is not equipped
        expect(ctrl.isKitEquipped(1)).toBe(false);
        expect(packageCards[1].classList.contains("equipped")).toBe(false);
        const btnB = packageCards[1].querySelector(".equip-package-btn") as HTMLButtonElement;
        expect(btnB.textContent).toContain("Equip Kit");
        expect(btnB.classList.contains("equipped")).toBe(false);

        // Banner indicates Option A is equipped
        const banner = container.querySelector(".kit-equipped-banner");
        expect(banner).not.toBeNull();
        expect(banner!.textContent).toContain("Option A");

        // Click Option B to equip it
        btnB.click();

        // Now Option B is equipped and Option A is not
        expect(ctrl.isKitEquipped(1)).toBe(true);
        expect(ctrl.isKitEquipped(0)).toBe(false);

        const updatedCards = container.querySelectorAll(".starting-package-card");
        expect(updatedCards[1].classList.contains("equipped")).toBe(true);
        expect(updatedCards[1].querySelector(".equip-package-btn")?.textContent).toContain("Equipped");
        expect(updatedCards[0].classList.contains("equipped")).toBe(false);
        expect(updatedCards[0].querySelector(".equip-package-btn")?.textContent).toContain("Equip Kit");

        // Equipment state updated to Option B
        expect(ctrl.state.selectedArmor).toBe("Leather Armor");
        expect(ctrl.state.hasShield).toBe(false);
        expect(ctrl.state.selectedWeapons).toContain("Longbow");

        // Banner now indicates Option B is equipped
        const updatedBanner = container.querySelector(".kit-equipped-banner");
        expect(updatedBanner!.textContent).toContain("Option B");
    });

    it("smart auto-fills curated class staples and distributes across available spell levels", () => {
        const ctrl = new CharacterCreatorController();

        // Level 1 Wizard
        ctrl.state.classId = "wizard";
        ctrl.state.level = 1;
        const wiz1 = ctrl.getSmartAutoFillSpells();
        expect(wiz1.cantrips.length).toBe(ctrl.getMaxCantrips()); // 3
        expect(wiz1.cantrips).toEqual(["Fire Bolt", "Mage Hand", "Minor Illusion"]);
        expect(wiz1.prepared.length).toBe(ctrl.getMaxPreparedSpells()); // 4
        expect(wiz1.prepared).toContain("Shield");
        expect(wiz1.prepared).toContain("Mage Armor");
        expect(wiz1.prepared).toContain("Magic Missile");

        // Level 5 Wizard (access to levels 1, 2, and 3)
        ctrl.state.level = 5;
        const wiz5 = ctrl.getSmartAutoFillSpells();
        expect(wiz5.cantrips.length).toBe(ctrl.getMaxCantrips()); // 4
        expect(wiz5.prepared.length).toBe(ctrl.getMaxPreparedSpells()); // 9
        // Must contain high-level staples (Level 3)
        expect(wiz5.prepared).toContain("Counterspell");
        expect(wiz5.prepared).toContain("Fireball");
        // Must contain mid-level staples (Level 2)
        expect(wiz5.prepared).toContain("Misty Step");
        // Must contain low-level staples (Level 1)
        expect(wiz5.prepared).toContain("Shield");

        // Level 1 Cleric
        ctrl.state.classId = "cleric";
        ctrl.state.level = 1;
        const cleric1 = ctrl.getSmartAutoFillSpells();
        expect(cleric1.cantrips).toContain("Sacred Flame");
        expect(cleric1.cantrips).toContain("Guidance");
        expect(cleric1.prepared).toContain("Healing Word");
        expect(cleric1.prepared).toContain("Bless");

        // Level 1 Warlock
        ctrl.state.classId = "warlock";
        ctrl.state.level = 1;
        const warlock1 = ctrl.getSmartAutoFillSpells();
        expect(warlock1.cantrips).toContain("Eldritch Blast");
        expect(warlock1.prepared).toContain("Hellish Rebuke");
    });

    it("renders class and subclass feature choices at level 6 and 7", () => {
        const ctrl = new CharacterCreatorController();

        // Level 6 Druid - Circle of the Land
        ctrl.state.classId = "druid";
        ctrl.state.subclassId = "land";
        ctrl.state.level = 6;
        const druidCls = ctrl.classes.find((c) => c.id === "druid")!;
        const lvl6Choices = (ctrl as any).renderLevelChoices(druidCls, 6);
        expect(lvl6Choices).toContain("Circle of the Land Biome Affinity");
        expect(lvl6Choices).toContain("Arid");
        expect(lvl6Choices).toContain("Polar");
        expect(lvl6Choices).toContain("Temperate");
        expect(lvl6Choices).toContain("Tropical");

        // Level 7 Druid - Elemental Fury
        ctrl.state.level = 7;
        const lvl7Choices = (ctrl as any).renderLevelChoices(druidCls, 7);
        expect(lvl7Choices).toContain("Elemental Fury");
        expect(lvl7Choices).toContain("Primal Strike");
        expect(lvl7Choices).toContain("Potent Spellcasting");

        // Level 6 Barbarian - Path of the Wild Heart
        ctrl.state.classId = "barbarian";
        ctrl.state.subclassId = "wild-heart";
        ctrl.state.level = 6;
        const barbCls = ctrl.classes.find((c) => c.id === "barbarian")!;
        const barbLvl6 = (ctrl as any).renderLevelChoices(barbCls, 6);
        expect(barbLvl6).toContain("Aspect of the Beast");
        expect(barbLvl6).toContain("Aspect of the Elephant");
        expect(barbLvl6).toContain("Aspect of the Spider");

        // Level 6 Ranger - Hunter
        ctrl.state.classId = "ranger";
        ctrl.state.subclassId = "hunter";
        ctrl.state.level = 6;
        const rangerCls = ctrl.classes.find((c) => c.id === "ranger")!;
        const rangerLvl6 = (ctrl as any).renderLevelChoices(rangerCls, 6);
        expect(rangerLvl6).toContain("Defensive Tactics");
        expect(rangerLvl6).toContain("Multiattack Defense");
        expect(rangerLvl6).toContain("Escape the Horde");

        // Level 7 Cleric - Blessed Strikes
        ctrl.state.classId = "cleric";
        ctrl.state.level = 7;
        const clericCls = ctrl.classes.find((c) => c.id === "cleric")!;
        const clericLvl7 = (ctrl as any).renderLevelChoices(clericCls, 7);
        expect(clericLvl7).toContain("Blessed Strikes");
        expect(clericLvl7).toContain("Divine Strike");
        expect(clericLvl7).toContain("Potent Spellcasting");
    });

    it("factors class and subclass features into AC, HP, and special speeds", () => {
        const ctrl = new CharacterCreatorController();

        // 1. Moon Druid AC at level 6+ (Improved Circle Forms: 13 + Wis when unarmored)
        ctrl.state.classId = "druid";
        ctrl.state.subclassId = "moon";
        ctrl.state.level = 6;
        ctrl.state.selectedArmor = "None";
        ctrl.state.hasShield = false;
        ctrl.state.baseAbilities.dex = 12; // +1 mod (normal unarmored AC would be 10 + 1 = 11)
        ctrl.state.baseAbilities.wis = 16; // +3 mod
        ctrl.state.bgStatA = "wis";
        ctrl.state.bgStatB = "con";
        ctrl.state.backgroundOption = "two-and-one"; // Wis becomes 18 (+4 mod)
        // 13 + 4 = 17 AC
        expect(ctrl.getArmorClass()).toBe(17);

        // With shield: 17 + 2 = 19 AC
        ctrl.state.hasShield = true;
        expect(ctrl.getArmorClass()).toBe(19);

        // 2. Sea Druid Swim Speed at level 6+ (Aquatic Affinity)
        ctrl.state.subclassId = "sea";
        ctrl.state.level = 6;
        const seaSpecialSpeeds = ctrl.getSpecialSpeeds();
        expect(seaSpecialSpeeds).toContain("Swim 30 ft.");
        expect(ctrl.getSpeedDisplay()).toContain("Swim 30 ft.");

        // 3. Barbarian Aspect of the Spider Climb Speed at level 6+
        ctrl.state.classId = "barbarian";
        ctrl.state.subclassId = "wild-heart";
        ctrl.state.level = 6;
        ctrl.state.subclassFeatureChoices["barbarian-6-wild-heart"] = "spider";
        const barbSpeeds = ctrl.getSpecialSpeeds();
        // Walking speed for barbarian at lvl 6 is 30 + 10 (Fast Movement lvl 5) = 40 ft.
        expect(ctrl.getSpeed()).toBe(40);
        expect(barbSpeeds).toContain("Climb 40 ft.");
        expect(ctrl.getSpeedDisplay()).toContain("Climb 40 ft.");

        // 4. Draconic Sorcerer AC (10 + Dex + Cha) and HP (+1 per level at lvl 3+)
        ctrl.state.classId = "sorcerer";
        ctrl.state.subclassId = "draconic";
        ctrl.state.level = 4;
        ctrl.state.selectedArmor = "None";
        ctrl.state.hasShield = false;
        ctrl.state.baseAbilities.dex = 14; // +2 mod
        ctrl.state.baseAbilities.cha = 16; // +3 mod
        ctrl.state.baseAbilities.con = 12; // +1 mod
        ctrl.state.bgStatA = "cha";
        ctrl.state.bgStatB = "con";
        ctrl.state.backgroundOption = "two-and-one"; // Cha 18 (+4 mod), Con 13 (+1 mod)
        // Draconic unarmored AC: 10 + 2 (Dex) + 4 (Cha) = 16
        expect(ctrl.getArmorClass()).toBe(16);
        // HP: Hit die 6 + 1(Con) + 3*(4+1) + 4(Draconic Resilience) = 7 + 15 + 4 = 26 HP
        expect(ctrl.getMaxHp()).toBe(26);
    });

    it("verifies all 12 classes have populated subclass features for all 48 subclasses", () => {
        expect(CLASSES_2024.length).toBe(12);
        let totalSubclasses = 0;
        CLASSES_2024.forEach((cls) => {
            expect(cls.subclasses.length).toBe(4);
            cls.subclasses.forEach((sub) => {
                totalSubclasses++;
                expect(sub.features.length).toBeGreaterThanOrEqual(4);
                sub.features.forEach((f) => {
                    expect(f.name).toBeTruthy();
                    expect(f.description).toBeTruthy();
                    expect(f.level).toBeGreaterThanOrEqual(3);
                });
            });
        });
        expect(totalSubclasses).toBe(48);
    });

    it("renders and selects branching class and subclass feature choices across classes and levels", () => {
        const ctrl = new CharacterCreatorController();
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
        const root = document.getElementById("creator-step-panels")!;

        // 1. Wizard Scholar at Level 2
        ctrl.state.classId = "wizard";
        ctrl.state.level = 2;
        ctrl.renderStep(3);
        let scholarCard = root.querySelector('.subclass-feature-card[data-feature-key="wizard-2-scholar"][data-feature-choice="history"]') as HTMLElement;
        expect(scholarCard).toBeTruthy();
        scholarCard.click();
        expect(ctrl.state.subclassFeatureChoices["wizard-2-scholar"]).toBe("history");

        // 2. Barbarian Wild Heart Rage of the Wilds at Level 3
        ctrl.state.classId = "barbarian";
        ctrl.state.subclassId = "wild-heart";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let rageCard = root.querySelector('.subclass-feature-card[data-feature-key="barbarian-3-wild-heart"][data-feature-choice="eagle"]') as HTMLElement;
        expect(rageCard).toBeTruthy();
        rageCard.click();
        expect(ctrl.state.subclassFeatureChoices["barbarian-3-wild-heart"]).toBe("eagle");

        // 3. Barbarian Zealot Divine Fury at Level 3
        ctrl.state.subclassId = "zealot";
        ctrl.renderStep(3);
        let zealotCard = root.querySelector('.subclass-feature-card[data-feature-key="barbarian-3-zealot"][data-feature-choice="necrotic"]') as HTMLElement;
        expect(zealotCard).toBeTruthy();
        zealotCard.click();
        expect(ctrl.state.subclassFeatureChoices["barbarian-3-zealot"]).toBe("necrotic");

        // 4. Monk Warrior of Elements Attunement at Level 3
        ctrl.state.classId = "monk";
        ctrl.state.subclassId = "elements";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let elemCard = root.querySelector('.subclass-feature-card[data-feature-key="monk-3-elements"][data-feature-choice="cold"]') as HTMLElement;
        expect(elemCard).toBeTruthy();
        elemCard.click();
        expect(ctrl.state.subclassFeatureChoices["monk-3-elements"]).toBe("cold");

        // 5. Ranger Beast Master Primal Companion at Level 3
        ctrl.state.classId = "ranger";
        ctrl.state.subclassId = "beast-master";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let compCard = root.querySelector('.subclass-feature-card[data-feature-key="ranger-3-beast-master"][data-feature-choice="sky"]') as HTMLElement;
        expect(compCard).toBeTruthy();
        compCard.click();
        expect(ctrl.state.subclassFeatureChoices["ranger-3-beast-master"]).toBe("sky");

        // 6. Ranger Hunter Hunter's Prey at Level 3
        ctrl.state.subclassId = "hunter";
        ctrl.renderStep(3);
        let preyCard = root.querySelector('.subclass-feature-card[data-feature-key="ranger-3-hunter"][data-feature-choice="horde-breaker"]') as HTMLElement;
        expect(preyCard).toBeTruthy();
        preyCard.click();
        expect(ctrl.state.subclassFeatureChoices["ranger-3-hunter"]).toBe("horde-breaker");

        // 7. Sorcerer Draconic Ancestor at Level 3
        ctrl.state.classId = "sorcerer";
        ctrl.state.subclassId = "draconic";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let dragonCard = root.querySelector('.subclass-feature-card[data-feature-key="sorcerer-3-draconic"][data-feature-choice="silver"]') as HTMLElement;
        expect(dragonCard).toBeTruthy();
        dragonCard.click();
        expect(ctrl.state.subclassFeatureChoices["sorcerer-3-draconic"]).toBe("silver");

        // 8. Rogue Cunning Strike at Level 5
        ctrl.state.classId = "rogue";
        ctrl.state.level = 5;
        ctrl.renderStep(3);
        let cunningCard = root.querySelector('.subclass-feature-card[data-feature-key="rogue-5-cunning-strike"][data-feature-choice="poison"]') as HTMLElement;
        expect(cunningCard).toBeTruthy();
        cunningCard.click();
        expect(ctrl.state.subclassFeatureChoices["rogue-5-cunning-strike"]).toBe("poison");

        // 9. Barbarian Brutal Strike at Level 9
        ctrl.state.classId = "barbarian";
        ctrl.state.level = 9;
        ctrl.renderStep(3);
        let brutalCard = root.querySelector('.subclass-feature-card[data-feature-key="barbarian-9-brutal-strike"][data-feature-choice="hamstring-blow"]') as HTMLElement;
        expect(brutalCard).toBeTruthy();
        brutalCard.click();
        expect(ctrl.state.subclassFeatureChoices["barbarian-9-brutal-strike"]).toBe("hamstring-blow");

        // 10. Fighter Tactical Master at Level 9
        ctrl.state.classId = "fighter";
        ctrl.state.level = 9;
        ctrl.renderStep(3);
        let tacticalCard = root.querySelector('.subclass-feature-card[data-feature-key="fighter-9-tactical-master"][data-feature-choice="slow"]') as HTMLElement;
        expect(tacticalCard).toBeTruthy();
        tacticalCard.click();
        expect(ctrl.state.subclassFeatureChoices["fighter-9-tactical-master"]).toBe("slow");

        // 11. Warlock Fiendish Resilience at Level 10
        ctrl.state.classId = "warlock";
        ctrl.state.subclassId = "fiend";
        ctrl.state.level = 10;
        ctrl.renderStep(3);
        let fiendCard = root.querySelector('.subclass-feature-card[data-feature-key="warlock-10-fiend"][data-feature-choice="radiant"]') as HTMLElement;
        expect(fiendCard).toBeTruthy();
        fiendCard.click();
        expect(ctrl.state.subclassFeatureChoices["warlock-10-fiend"]).toBe("radiant");

        // 12. Barbarian Totemic Attunement at Level 14
        ctrl.state.classId = "barbarian";
        ctrl.state.subclassId = "wild-heart";
        ctrl.state.level = 14;
        ctrl.renderStep(3);
        let totemCard = root.querySelector('.subclass-feature-card[data-feature-key="barbarian-14-wild-heart"][data-feature-choice="lion"]') as HTMLElement;
        expect(totemCard).toBeTruthy();
        totemCard.click();
        expect(ctrl.state.subclassFeatureChoices["barbarian-14-wild-heart"]).toBe("lion");

        // 13. Rogue Devious Strike at Level 14
        ctrl.state.classId = "rogue";
        ctrl.state.level = 14;
        ctrl.renderStep(3);
        let deviousCard = root.querySelector('.subclass-feature-card[data-feature-key="rogue-14-devious-strike"][data-feature-choice="daze"]') as HTMLElement;
        expect(deviousCard).toBeTruthy();
        deviousCard.click();
        expect(ctrl.state.subclassFeatureChoices["rogue-14-devious-strike"]).toBe("daze");

        // 14. Druid Circle of the Stars (Level 3 Starry Form, Cosmic Omen has no level-up choice)
        ctrl.state.classId = "druid";
        ctrl.state.subclassId = "stars";
        ctrl.state.level = 6;
        ctrl.renderStep(3);
        let starryCard = root.querySelector('.subclass-feature-card[data-feature-key="druid-3-stars"][data-feature-choice="dragon"]') as HTMLElement;
        expect(starryCard).toBeTruthy();
        starryCard.click();
        expect(ctrl.state.subclassFeatureChoices["druid-3-stars"]).toBe("dragon");

        let omenCard = root.querySelector('.subclass-feature-card[data-feature-key="druid-6-stars"]');
        expect(omenCard).toBeNull();

        // 15. Druid Circle of the Sea (Level 3 Wrath of the Sea)
        ctrl.state.subclassId = "sea";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let seaCard = root.querySelector('.subclass-feature-card[data-feature-key="druid-3-sea"][data-feature-choice="thunder"]') as HTMLElement;
        expect(seaCard).toBeTruthy();
        seaCard.click();
        expect(ctrl.state.subclassFeatureChoices["druid-3-sea"]).toBe("thunder");

        // 16. Druid Circle of the Moon (Level 3 Circle Forms Strike)
        ctrl.state.subclassId = "moon";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let moonCard = root.querySelector('.subclass-feature-card[data-feature-key="druid-3-moon"][data-feature-choice="physical"]') as HTMLElement;
        expect(moonCard).toBeTruthy();
        moonCard.click();
        expect(ctrl.state.subclassFeatureChoices["druid-3-moon"]).toBe("physical");

        // 17. Fighter Battle Master Student of War (Level 3)
        ctrl.state.classId = "fighter";
        ctrl.state.subclassId = "battle-master";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let studentCard = root.querySelector('.subclass-feature-card[data-feature-key="fighter-3-battle-master-student"][data-feature-choice="Insight"]') as HTMLElement;
        expect(studentCard).toBeTruthy();
        studentCard.click();
        expect(ctrl.state.subclassFeatureChoices["fighter-3-battle-master-student"]).toBe("Insight");

        // 18. Monk Warrior of Open Hand (Level 3 Open Hand Technique)
        ctrl.state.classId = "monk";
        ctrl.state.subclassId = "open-hand";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let openHandCard = root.querySelector('.subclass-feature-card[data-feature-key="monk-3-open-hand"][data-feature-choice="topple"]') as HTMLElement;
        expect(openHandCard).toBeTruthy();
        openHandCard.click();
        expect(ctrl.state.subclassFeatureChoices["monk-3-open-hand"]).toBe("topple");

        // 19. Ranger Fey Wanderer Otherworldly Glamour (Level 3)
        ctrl.state.classId = "ranger";
        ctrl.state.subclassId = "fey-wanderer";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let glamCard = root.querySelector('.subclass-feature-card[data-feature-key="ranger-3-fey-wanderer"][data-feature-choice="Performance"]') as HTMLElement;
        expect(glamCard).toBeTruthy();
        glamCard.click();
        expect(ctrl.state.subclassFeatureChoices["ranger-3-fey-wanderer"]).toBe("Performance");

        // 20. Warlock Archfey Steps of the Fey (Level 3)
        ctrl.state.classId = "warlock";
        ctrl.state.subclassId = "archfey";
        ctrl.state.level = 3;
        ctrl.renderStep(3);
        let stepCard = root.querySelector('.subclass-feature-card[data-feature-key="warlock-3-archfey"][data-feature-choice="refreshing-step"]') as HTMLElement;
        expect(stepCard).toBeTruthy();
        stepCard.click();
        expect(ctrl.state.subclassFeatureChoices["warlock-3-archfey"]).toBe("refreshing-step");

        // 21. Cleric War Domain War God's Blessing (Level 6)
        ctrl.state.classId = "cleric";
        ctrl.state.subclassId = "war";
        ctrl.state.level = 6;
        ctrl.renderStep(3);
        let warCard = root.querySelector('.subclass-feature-card[data-feature-key="cleric-6-war"][data-feature-choice="spiritual-weapon"]') as HTMLElement;
        expect(warCard).toBeTruthy();
        warCard.click();
        expect(ctrl.state.subclassFeatureChoices["cleric-6-war"]).toBe("spiritual-weapon");

        // 22. Fighter Champion Additional Fighting Style (Level 7)
        ctrl.state.classId = "fighter";
        ctrl.state.subclassId = "champion";
        ctrl.state.level = 7;
        ctrl.renderStep(3);
        let champCard = root.querySelector('.subclass-feature-card[data-feature-key="fighter-7-champion"][data-feature-choice="dueling"]') as HTMLElement;
        expect(champCard).toBeTruthy();
        champCard.click();
        expect(ctrl.state.subclassFeatureChoices["fighter-7-champion"]).toBe("dueling");

        // 23. Fighter Psi Warrior Telekinetic Thrust (Level 7)
        ctrl.state.subclassId = "psi-warrior";
        ctrl.state.level = 7;
        ctrl.renderStep(3);
        let psiCard = root.querySelector('.subclass-feature-card[data-feature-key="fighter-7-psi-warrior"][data-feature-choice="topple"]') as HTMLElement;
        expect(psiCard).toBeTruthy();
        psiCard.click();
        expect(ctrl.state.subclassFeatureChoices["fighter-7-psi-warrior"]).toBe("topple");

        // 24. Barbarian Path of the World Tree Battering Roots (Level 10)
        ctrl.state.classId = "barbarian";
        ctrl.state.subclassId = "world-tree";
        ctrl.state.level = 10;
        ctrl.renderStep(3);
        let rootCard = root.querySelector('.subclass-feature-card[data-feature-key="barbarian-10-world-tree"][data-feature-choice="topple"]') as HTMLElement;
        expect(rootCard).toBeTruthy();
        rootCard.click();
        expect(ctrl.state.subclassFeatureChoices["barbarian-10-world-tree"]).toBe("topple");

        // 25. Wizard Diviner The Third Eye (Level 10)
        ctrl.state.classId = "wizard";
        ctrl.state.subclassId = "diviner";
        ctrl.state.level = 10;
        ctrl.renderStep(3);
        let eyeCard = root.querySelector('.subclass-feature-card[data-feature-key="wizard-10-diviner"][data-feature-choice="see-invisibility"]') as HTMLElement;
        expect(eyeCard).toBeTruthy();
        eyeCard.click();
        expect(ctrl.state.subclassFeatureChoices["wizard-10-diviner"]).toBe("see-invisibility");

        // 26. Barbarian Improved Brutal Strike (Level 13)
        ctrl.state.classId = "barbarian";
        ctrl.state.level = 13;
        ctrl.renderStep(3);
        let impBrutalCard = root.querySelector('.subclass-feature-card[data-feature-key="barbarian-13-brutal-strike"][data-feature-choice="sundering-blow"]') as HTMLElement;
        expect(impBrutalCard).toBeTruthy();
        impBrutalCard.click();
        expect(ctrl.state.subclassFeatureChoices["barbarian-13-brutal-strike"]).toBe("sundering-blow");

        // 27. Sorcerer Aberrant Sorcery Revelation in Flesh (Level 14)
        ctrl.state.classId = "sorcerer";
        ctrl.state.subclassId = "aberrant";
        ctrl.state.level = 14;
        ctrl.renderStep(3);
        let aberrantCard = root.querySelector('.subclass-feature-card[data-feature-key="sorcerer-14-aberrant"][data-feature-choice="viscous-body"]') as HTMLElement;
        expect(aberrantCard).toBeTruthy();
        aberrantCard.click();
        expect(ctrl.state.subclassFeatureChoices["sorcerer-14-aberrant"]).toBe("viscous-body");

        // 28. Ranger Hunter Superior Hunter's Defense (Level 15)
        ctrl.state.classId = "ranger";
        ctrl.state.subclassId = "hunter";
        ctrl.state.level = 15;
        ctrl.renderStep(3);
        let defenseCard = root.querySelector('.subclass-feature-card[data-feature-key="ranger-15-hunter"][data-feature-choice="uncanny-dodge"]') as HTMLElement;
        expect(defenseCard).toBeTruthy();
        defenseCard.click();
        expect(ctrl.state.subclassFeatureChoices["ranger-15-hunter"]).toBe("uncanny-dodge");
    });

    it("replaces generic Subclass Feature placeholders with concrete subclass features across all 12 classes and 48 subclasses", () => {
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
        const root = document.getElementById("creator-step-panels")!;
        ctrl.state.level = 20;
        ctrl.progressionExpanded = true;

        // First specifically verify Druid Circle of the Moon at Level 6
        ctrl.state.classId = "druid";
        ctrl.state.subclassId = "moon";
        ctrl.renderStep(3);
        const lvl6Row = root.querySelector('.progression-row[data-level="6"]') as HTMLElement;
        expect(lvl6Row).toBeTruthy();
        expect(lvl6Row.textContent).toContain("Improved Circle Forms (Circle of the Moon)");
        expect(lvl6Row.textContent).toContain("Moonlight Step (Circle of the Moon)");
        expect(lvl6Row.textContent).not.toContain("Gain a feature granted by your chosen Druid circle");
        expect(lvl6Row.textContent).not.toContain("Subclass Feature");

        // Verify across all 12 classes and 48 subclasses that no generic placeholder remains
        for (const cls of ctrl.classes) {
            ctrl.state.classId = cls.id;
            for (const sub of cls.subclasses) {
                ctrl.state.subclassId = sub.id;
                ctrl.renderStep(3);
                const progText = root.textContent || "";
                expect(progText).not.toContain("Gain a feature granted by");
                expect(progText).not.toContain("Gain a subclass feature");
                expect(progText).not.toContain("Gain your sacred oath capstone");
                for (const sf of sub.features || []) {
                    const row = root.querySelector(`.progression-row[data-level="${sf.level}"]`) as HTMLElement;
                    expect(row).toBeTruthy();
                    expect(row.textContent).toContain(`${sf.name} (${sub.name})`);
                }
            }
        }

        // Also verify fallback when DB classes lack sub.features
        ctrl.classes = ctrl.classes.map((c: any) => ({
            ...c,
            subclasses: c.subclasses.map((s: any) => ({ id: s.id, name: s.name, description: s.description }))
        }));
        ctrl.state.classId = "druid";
        ctrl.state.subclassId = "moon";
        ctrl.renderStep(3);
        const strippedLvl6Row = root.querySelector('.progression-row[data-level="6"]') as HTMLElement;
        expect(strippedLvl6Row.textContent).toContain("Improved Circle Forms (Circle of the Moon)");
        expect(strippedLvl6Row.textContent).toContain("Moonlight Step (Circle of the Moon)");
        expect(strippedLvl6Row.textContent).not.toContain("Gain a feature granted by");
    });

    it("uses POST /create-character for new characters and PUT /save-character when updating an existing character", async () => {
        const requestModule = await import("../../../src/services/request");
        const postSpy = vi.spyOn(requestModule, "postData").mockResolvedValue({
            savedCharacter: { id: 101, siteCharacterId: "tga-newchar1" }
        } as any);
        const putSpy = vi.spyOn(requestModule, "putData").mockResolvedValue({
            savedCharacter: { id: 101, siteCharacterId: "tga-newchar1" }
        } as any);

        // New character -> POST /create-character
        ctrl.state.name = "Lyra Moonwhisper";
        ctrl.state.savedId = undefined;
        ctrl.state.siteCharacterId = undefined;
        await ctrl.submitCharacter();
        expect(postSpy).toHaveBeenCalledWith("/create-character", expect.objectContaining({
            name: "Lyra Moonwhisper"
        }));
        expect(putSpy).not.toHaveBeenCalled();

        postSpy.mockClear();
        putSpy.mockClear();

        // Existing character -> PUT /save-character
        ctrl.state.savedId = 101;
        ctrl.state.siteCharacterId = "tga-newchar1";
        await ctrl.submitCharacter();
        expect(putSpy).toHaveBeenCalledWith("/save-character", expect.objectContaining({
            name: "Lyra Moonwhisper",
            savedId: 101,
            siteCharacterId: "tga-newchar1"
        }));
        expect(postSpy).not.toHaveBeenCalled();

        postSpy.mockRestore();
        putSpy.mockRestore();
    });

    it("correctly grants 2024 background skills and species lineage traits/spells upon creation", async () => {
        const requestModule = await import("../../../src/services/request");
        let capturedPayload: any = null;
        const postSpy = vi.spyOn(requestModule, "postData").mockImplementation(async (_url: string, payload: any) => {
            capturedPayload = payload;
            return { savedCharacter: { id: 999, siteCharacterId: "tga-test-origins" } } as any;
        });

        // Setup character with 2024 Sailor background and High Elf lineage
        ctrl.state.name = "Aelion Stargazer";
        ctrl.state.level = 5;
        ctrl.state.speciesId = "elf";
        ctrl.state.lineageId = "high-elf";
        ctrl.state.elfKeenSkill = "Insight";
        ctrl.state.backgroundId = "sailor";
        ctrl.state.classId = "wizard";
        ctrl.state.classSkills = ["Arcana", "History"];

        // Verify Step 2 renders Elf Keen Senses choice
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
        ctrl.renderStep(2);
        const elfSelect = document.getElementById("elf-skill-select") as HTMLSelectElement;
        expect(elfSelect).toBeTruthy();
        expect(elfSelect.value).toBe("Insight");

        // Verify Step 6 locks Sailor skills (Acrobatics, Perception) and Elf Keen skill (Insight)
        ctrl.renderStep(6);
        const acrobaticsCard = document.querySelector('.skill-checkbox-card[data-skill-name="Acrobatics"]') as HTMLElement;
        const perceptionCard = document.querySelector('.skill-checkbox-card[data-skill-name="Perception"]') as HTMLElement;
        const insightCard = document.querySelector('.skill-checkbox-card[data-skill-name="Insight"]') as HTMLElement;
        expect(acrobaticsCard.classList.contains("selected")).toBe(true);
        expect(perceptionCard.classList.contains("selected")).toBe(true);
        expect(insightCard.classList.contains("selected")).toBe(true);
        expect(acrobaticsCard.textContent).toContain("Background");
        expect(perceptionCard.textContent).toContain("Background");
        expect(insightCard.textContent).toContain("Elf");

        // Submit character and verify built payload
        await ctrl.submitCharacter();
        expect(capturedPayload).toBeTruthy();
        const char = capturedPayload.character || capturedPayload;

        // 1. Sailor background skills in payload
        const profSkills = char.skills.filter((s: any) => s.proficiency === "proficient").map((s: any) => s.name);
        expect(profSkills).toContain("Acrobatics");
        expect(profSkills).toContain("Perception");
        expect(profSkills).toContain("Insight");

        // 2. High Elf lineage traits in features
        const speciesFeatures = char.features.filter((f: any) => f.type === "Species").map((f: any) => f.name);
        expect(speciesFeatures).toContain("Fey Ancestry");
        expect(speciesFeatures).toContain("Keen Senses");
        expect(speciesFeatures).toContain("Trance");
        expect(speciesFeatures).toContain("High Elf Magic");

        // 3. Innate High Elf spells at level 5 (Prestidigitation, Detect Magic, Misty Step)
        const innateSpells = char.spells.filter((s: any) => s.source === "Species").map((s: any) => s.name);
        expect(innateSpells).toContain("Prestidigitation");
        expect(innateSpells).toContain("Detect Magic");
        expect(innateSpells).toContain("Misty Step");

        // 4. Lineage label
        expect(char.race).toBe("High Elf");
        expect(char.species).toBe("Elf");

        postSpy.mockRestore();
    });

    it("correctly sets Drow Superior Darkvision and Dragonborn breath weapon resource & damage resistance", async () => {
        const requestModule = await import("../../../src/services/request");
        let capturedPayload: any = null;
        const postSpy = vi.spyOn(requestModule, "postData").mockImplementation(async (_url: string, payload: any) => {
            capturedPayload = payload;
            return { savedCharacter: { id: 1000, siteCharacterId: "tga-test-drow" } } as any;
        });

        // 1. Drow Elf at level 3
        ctrl.state.name = "Viconia";
        ctrl.state.level = 3;
        ctrl.state.speciesId = "elf";
        ctrl.state.lineageId = "drow";
        ctrl.state.classId = "cleric";
        await ctrl.submitCharacter();

        let char = capturedPayload.character || capturedPayload;
        expect(char.race).toBe("Drow");
        expect(char.vitals.darkvision).toBe("Darkvision 120 ft.");

        // 2. Dragonborn at level 5
        postSpy.mockClear();
        ctrl.state.name = "Drakon";
        ctrl.state.level = 5;
        ctrl.state.speciesId = "dragonborn";
        ctrl.state.lineageId = "red";
        ctrl.state.classId = "fighter";
        await ctrl.submitCharacter();

        char = capturedPayload.character || capturedPayload;
        expect(char.damageResistances).toContain("Fire");
        const bwRes = char.classResources.find((r: any) => r.name === "Breath Weapon");
        expect(bwRes).toBeDefined();
        expect(bwRes.total).toBe(3); // PB at lvl 5 is 3
        const dfRes = char.classResources.find((r: any) => r.name === "Draconic Flight");
        expect(dfRes).toBeDefined();

        postSpy.mockRestore();
    });

    it("allows selecting weapon masteries when barbarian is chosen as a secondary multiclass", () => {
        document.body.innerHTML = `<div id="creator-step-panels"></div>`;

        // Start with Bard level 3 as primary class (0 weapon masteries)
        ctrl.state.classId = "bard";
        ctrl.state.classes = [
            { classId: "bard", level: 3, subclassId: "lore" },
            { classId: "barbarian", level: 1, subclassId: "berserker" }
        ];
        ctrl.state.weaponMasteries = [];
        ctrl.syncStateClassProperties();

        // Total weapon masteries count should be 2 (from Barbarian)
        expect(ctrl.getMaxWeaponMasteriesCount()).toBe(2);

        // Render step 3
        ctrl.renderStep(3);

        const greataxeCard = document.querySelector('.mastery-card[data-weapon-name="Greataxe"]') as HTMLElement;
        const handaxeCard = document.querySelector('.mastery-card[data-weapon-name="Handaxe"]') as HTMLElement;
        const daggerCard = document.querySelector('.mastery-card[data-weapon-name="Dagger"]') as HTMLElement;

        expect(greataxeCard).not.toBeNull();
        expect(handaxeCard).not.toBeNull();

        // Click Greataxe
        greataxeCard.click();
        expect(ctrl.state.weaponMasteries).toContain("Greataxe");
        expect(ctrl.state.weaponMasteries.length).toBe(1);

        // Click Handaxe
        const updatedHandaxe = document.querySelector('.mastery-card[data-weapon-name="Handaxe"]') as HTMLElement;
        updatedHandaxe.click();
        expect(ctrl.state.weaponMasteries).toContain("Handaxe");
        expect(ctrl.state.weaponMasteries.length).toBe(2);

        // Click Dagger - should not add because limit is 2
        const updatedDagger = document.querySelector('.mastery-card[data-weapon-name="Dagger"]') as HTMLElement;
        updatedDagger.click();
        expect(ctrl.state.weaponMasteries.length).toBe(2);
        expect(ctrl.state.weaponMasteries).not.toContain("Dagger");

        // Now test multiclass Fighter (3) + Barbarian (2) = 5
        ctrl.state.classes = [
            { classId: "fighter", level: 1, subclassId: "champion" },
            { classId: "barbarian", level: 1, subclassId: "berserker" }
        ];
        ctrl.syncStateClassProperties();
        expect(ctrl.getMaxWeaponMasteriesCount()).toBe(5);
    });

    it("calculates multiclass capacities correctly for metamagic, invocations, and maneuvers", () => {
        // Bard 5 / Sorcerer 3 / Warlock 2 / Fighter (Battle Master) 3
        ctrl.state.classes = [
            { classId: "bard", level: 5, subclassId: "lore" },
            { classId: "sorcerer", level: 3, subclassId: "draconic" },
            { classId: "warlock", level: 2, subclassId: "fiend" },
            { classId: "fighter", level: 3, subclassId: "battle-master" }
        ];
        ctrl.syncStateClassProperties();

        expect(ctrl.getMaxMetamagicCount()).toBe(2);
        expect(ctrl.getMaxInvocationsCount()).toBe(3);
        expect(ctrl.getMaxManeuversCount()).toBe(3);
    });

    it("positions multiclass-top-bar directly at the bottom of the site nav bar when visible, and at 0px when hidden", () => {
        document.body.innerHTML = `
            <nav style="height: 70px;"></nav>
            <div id="creator-step-panels"></div>
        `;

        ctrl.state.classes = [
            { classId: "fighter", level: 5, subclassId: "champion" },
            { classId: "barbarian", level: 1, subclassId: "berserker" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const nav = document.querySelector("nav") as HTMLElement;
        const topBar = document.getElementById("multiclass-top-bar") as HTMLElement;
        expect(topBar).not.toBeNull();

        // Visible nav bar: bottom should be at 70px
        expect(ctrl.getNavBottom()).toBe(70);
        ctrl.updateMulticlassBarPositions();
        expect(topBar.style.top).toBe("70px");

        // Hidden nav bar (style.display = 'none')
        nav.style.display = "none";
        expect(ctrl.getNavBottom()).toBe(0);
        ctrl.updateMulticlassBarPositions();
        expect(topBar.style.top).toBe("0px");

        // Nav bar removed
        nav.remove();
        expect(ctrl.getNavBottom()).toBe(0);
        ctrl.updateMulticlassBarPositions();
        expect(topBar.style.top).toBe("0px");
    });

    it("provides scroll to bottom buttons and docks multiclass bottom bar when scrolled to bottom", () => {
        document.body.innerHTML = `
            <div id="creator-step-panels"></div>
        `;

        ctrl.state.classes = [
            { classId: "fighter", level: 5, subclassId: "champion" },
            { classId: "barbarian", level: 1, subclassId: "berserker" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const primaryScrollBtn = document.getElementById("primary-class-scroll-bottom-btn");
        const topBarScrollBtn = document.getElementById("top-bar-scroll-bottom-btn");
        const floatingScrollBtn = document.getElementById("floating-scroll-bottom-btn");
        const bottomBar = document.getElementById("multiclass-bottom-bar") as HTMLElement;
        const panel = document.querySelector(".multiclass-step-panel") as HTMLElement;

        expect(primaryScrollBtn).not.toBeNull();
        expect(topBarScrollBtn).not.toBeNull();
        expect(floatingScrollBtn).not.toBeNull();
        expect(bottomBar).not.toBeNull();

        let scrolledToTop = -1;
        let scrolledBehavior = "";
        window.scrollTo = ((options: any) => {
            scrolledToTop = options.top;
            scrolledBehavior = options.behavior;
        }) as any;

        primaryScrollBtn?.click();
        expect(scrolledToTop).toBeGreaterThanOrEqual(0);
        expect(scrolledBehavior).toBe("smooth");

        // When panel bottom is below viewport, bottom bar is fixed to viewport (not docked)
        vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
            bottom: 1200,
            top: 100,
            left: 0,
            right: 1000,
            width: 1000,
            height: 1100,
            x: 0,
            y: 100,
            toJSON: () => { }
        });
        ctrl.updateMulticlassBarPositions();
        expect(bottomBar.classList.contains("docked")).toBe(false);
        expect(bottomBar.style.bottom).toBe("0px");

        // When panel bottom reaches or enters viewport (scrolled all the way to bottom)
        vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
            bottom: 750, // <= viewport height 800
            top: -350,
            left: 0,
            right: 1000,
            width: 1000,
            height: 1100,
            x: 0,
            y: -350,
            toJSON: () => { }
        });
        ctrl.updateMulticlassBarPositions();
        expect(bottomBar.classList.contains("docked")).toBe(true);
    });

    it("disables selections within locked levels and enables them when unlocked", () => {
        document.body.innerHTML = `
            <div id="creator-step-panels"></div>
        `;

        // Fighter at level 1 (levels 2-20 are locked)
        ctrl.state.classes = [
            { classId: "fighter", level: 1, subclassId: "" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const lvl3Box = document.querySelector('.level-progression-box[data-level="3"]') as HTMLElement;
        expect(lvl3Box).not.toBeNull();
        expect(lvl3Box.classList.contains("locked")).toBe(true);

        const battleMasterCard = lvl3Box.querySelector('.subclass-card[data-subclass-id="battle-master"]') as HTMLElement;
        expect(battleMasterCard).not.toBeNull();

        // Clicking battle master card in locked level 3 should do nothing
        battleMasterCard.click();
        expect(ctrl.state.classes[0].subclassId).toBe("");

        // Now unlock level 3 by clicking the level 3 badge
        const lvl3Badge = lvl3Box.querySelector('.progression-lvl-badge[data-level="3"]') as HTMLElement;
        expect(lvl3Badge).not.toBeNull();
        lvl3Badge.click();

        expect(ctrl.state.classes[0].level).toBe(3);
        const updatedLvl3Box = document.querySelector('.level-progression-box[data-level="3"]') as HTMLElement;
        expect(updatedLvl3Box.classList.contains("unlocked")).toBe(true);

        // Clicking battle master card in unlocked level 3 now selects it
        const unlockedBattleMasterCard = updatedLvl3Box.querySelector('.subclass-card[data-subclass-id="battle-master"]') as HTMLElement;
        unlockedBattleMasterCard.click();
        expect(ctrl.state.classes[0].subclassId).toBe("battle-master");
    });

    it("unselects selections within a level when that level is re-locked", () => {
        document.body.innerHTML = `
            <div id="creator-step-panels"></div>
        `;

        // Fighter unlocked to level 3 with Battle Master and maneuvers selected
        ctrl.state.classId = "fighter";
        ctrl.state.level = 3;
        ctrl.state.classes = [
            { classId: "fighter", level: 3, subclassId: "" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        // Select Battle Master subclass
        const bmCard = document.querySelector('.subclass-card[data-subclass-id="battle-master"]') as HTMLElement;
        expect(bmCard).not.toBeNull();
        bmCard.click();
        expect(ctrl.state.classes[0].subclassId).toBe("battle-master");

        // Select a maneuver
        const manCard = document.querySelector('.maneuver-card[data-maneuver-id="trip-attack"]') as HTMLElement;
        if (manCard) manCard.click();
        expect(ctrl.state.maneuvers).toContain("trip-attack");

        // Select Student of War skill choice (fighter-3-battle-master-student)
        const studentCard = document.querySelector('.subclass-feature-card[data-feature-key="fighter-3-battle-master-student"][data-feature-choice="History"]') as HTMLElement;
        if (studentCard) studentCard.click();
        expect(ctrl.state.subclassFeatureChoices["fighter-3-battle-master-student"]).toBe("History");

        // Now re-lock level 3 by clicking the level 3 badge
        const lvl3Badge = document.querySelector('.progression-lvl-badge[data-level="3"]') as HTMLElement;
        expect(lvl3Badge).not.toBeNull();
        lvl3Badge.click();

        // Level should drop to 2 (level 3 re-locked)
        expect(ctrl.state.classes[0].level).toBe(2);
        // Level 3 selections are unselected as though they had never been made
        expect(ctrl.state.classes[0].subclassId).toBe("");
        expect(ctrl.state.subclassId).toBe("");
        expect(ctrl.state.maneuvers).toEqual([]);
        expect(ctrl.state.subclassFeatureChoices["fighter-3-battle-master-student"]).toBeUndefined();

        // Re-unlock level 3: selections remain unselected
        const reUnlockBadge = document.querySelector('.progression-lvl-badge[data-level="3"]') as HTMLElement;
        reUnlockBadge.click();
        expect(ctrl.state.classes[0].level).toBe(3);
        expect(ctrl.state.classes[0].subclassId).toBe("");
        expect(ctrl.state.maneuvers).toEqual([]);
        expect(ctrl.state.subclassFeatureChoices["fighter-3-battle-master-student"]).toBeUndefined();
    });

    it("unselects feature choices when jumping down multiple levels or re-locking higher levels", () => {
        document.body.innerHTML = `
            <div id="creator-step-panels"></div>
        `;

        // Rogue at level 5 with Cunning Strike selected
        ctrl.state.classId = "rogue";
        ctrl.state.level = 5;
        ctrl.state.classes = [
            { classId: "rogue", level: 5, subclassId: "" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const tripCard = document.querySelector('.subclass-feature-card[data-feature-key="rogue-5-cunning-strike"][data-feature-choice="trip"]') as HTMLElement;
        expect(tripCard).not.toBeNull();
        tripCard.click();
        expect(ctrl.state.subclassFeatureChoices["rogue-5-cunning-strike"]).toBe("trip");

        // Click level 4 badge to set level to 4 (locking level 5)
        const lvl4Badge = document.querySelector('.progression-lvl-badge[data-level="4"]') as HTMLElement;
        expect(lvl4Badge).not.toBeNull();
        lvl4Badge.click();

        expect(ctrl.state.classes[0].level).toBe(4);
        expect(ctrl.state.subclassFeatureChoices["rogue-5-cunning-strike"]).toBeUndefined();
    });

    it("evaluates D&D 2024 multiclass prerequisites accurately for both current and target classes", () => {
        // Standard setup: Fighter with Str 17, Dex 14, Con 14, Int 12, Wis 10, Cha 8
        expect(ctrl.state.classes[0].classId).toBe("fighter");
        expect(ctrl.getEffectiveAbilityScore("str")).toBe(17);
        expect(ctrl.getEffectiveAbilityScore("dex")).toBe(14);
        expect(ctrl.getEffectiveAbilityScore("int")).toBe(12);
        expect(ctrl.getEffectiveAbilityScore("wis")).toBe(10);
        expect(ctrl.getEffectiveAbilityScore("cha")).toBe(8);

        // Can multiclass into Barbarian (requires Str 13+)
        const barbCheck = ctrl.canMulticlassInto("barbarian", 1);
        expect(barbCheck.allowed).toBe(true);

        // Can multiclass into Rogue (requires Dex 13+)
        const rogueCheck = ctrl.canMulticlassInto("rogue", 1);
        expect(rogueCheck.allowed).toBe(true);

        // Cannot multiclass into Wizard (requires Int 13+, current is 12)
        const wizCheck = ctrl.canMulticlassInto("wizard", 1);
        expect(wizCheck.allowed).toBe(false);
        expect(wizCheck.reason).toContain("Requires Int 13+");

        // Cannot multiclass into Monk (requires Dex 13+ & Wis 13+, Dex is 14 but Wis is 10)
        const monkCheck = ctrl.canMulticlassInto("monk", 1);
        expect(monkCheck.allowed).toBe(false);
        expect(monkCheck.reason).toContain("Requires Dex 13+ & Wis 13+");

        // Cannot multiclass into Fighter (already chosen as primary)
        const fighterCheck = ctrl.canMulticlassInto("fighter", 1);
        expect(fighterCheck.allowed).toBe(false);
        expect(fighterCheck.reason).toBe("Already chosen");

        // If primary class does not meet prerequisites (e.g. Str 10, Dex 10)
        ctrl.state.baseAbilities.str = 8;
        ctrl.state.bgStatA = "int"; // move background bonus away from str
        ctrl.state.baseAbilities.dex = 10;
        expect(ctrl.getEffectiveAbilityScore("str")).toBe(8);
        expect(ctrl.getEffectiveAbilityScore("dex")).toBe(10);

        // Even though Barbarian requires Str 13+, multiclassing into ANY class is blocked because primary class fails
        const barbBlocked = ctrl.canMulticlassInto("barbarian", 1);
        expect(barbBlocked.allowed).toBe(false);
        expect(barbBlocked.reason).toContain("Primary class (Fighter) requires Str 13+ or Dex 13+");
        expect(barbBlocked.reason).toContain("to multiclass");
    });

    it("disables secondary class cards in UI when prerequisites are not met and prevents selecting them", () => {
        document.body.innerHTML = `
            <div id="creator-step-panels"></div>
        `;

        // Fighter primary (Str 17, Dex 14, Int 12) + Barbarian secondary (Level 1)
        ctrl.state.classes = [
            { classId: "fighter", level: 3, subclassId: "battle-master" },
            { classId: "barbarian", level: 1, subclassId: "" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const secSection = document.getElementById("class-section-1")!;
        expect(secSection).not.toBeNull();

        // Wizard card in secondary section should be disabled because Int < 13
        const wizCard = secSection.querySelector('.class-card[data-class-id="wizard"]') as HTMLElement;
        expect(wizCard).not.toBeNull();
        expect(wizCard.classList.contains("disabled")).toBe(true);
        expect(wizCard.getAttribute("aria-disabled")).toBe("true");
        expect(wizCard.innerHTML).toContain("class-prereq-badge locked");
        expect(wizCard.innerHTML).toContain("Requires Int 13+");

        // Clicking the disabled wizard card should NOT change the secondary class
        wizCard.click();
        expect(ctrl.state.classes[1].classId).toBe("barbarian");

        // Rogue card in secondary section should be enabled (Dex 14 >= 13)
        const rogueCard = secSection.querySelector('.class-card[data-class-id="rogue"]') as HTMLElement;
        expect(rogueCard).not.toBeNull();
        expect(rogueCard.classList.contains("disabled")).toBe(false);
        expect(rogueCard.innerHTML).toContain("class-prereq-badge met");

        // Clicking the eligible rogue card successfully changes the secondary class
        rogueCard.click();
        expect(ctrl.state.classes[1].classId).toBe("rogue");
    });

    it("correctly grants multiclass proficiencies and skills per D&D 2024 rules", () => {
        // Rogue primary (Light armor, simple weapons, hand crossbows, rapiers, shortswords)
        ctrl.state.classId = "rogue";
        ctrl.state.classes = [
            { classId: "rogue", level: 3, subclassId: "thief" }
        ];
        ctrl.syncStateClassProperties();

        // Single class Rogue lacks medium armor and martial weapons (e.g. Greatsword)
        expect(ctrl.isProficientWithArmor("Chain Shirt")).toBe(false);
        expect(ctrl.isProficientWithShield()).toBe(false);
        expect(ctrl.isProficientWithWeapon("Greatsword")).toBe(false);
        expect(ctrl.getMaxClassSkillCount()).toBe(4); // Rogue base is 4 skills

        // Multiclass into Fighter (grants Light, Medium, Shields, Martial Weapons)
        ctrl.state.classes.push({ classId: "fighter", level: 1, subclassId: "" });
        ctrl.syncStateClassProperties();

        expect(ctrl.getAllArmorProficiencies()).toContain("Medium Armor");
        expect(ctrl.getAllArmorProficiencies()).toContain("Shields");
        expect(ctrl.getAllWeaponProficiencies()).toContain("Martial Weapons");
        expect(ctrl.isProficientWithArmor("Chain Shirt")).toBe(true);
        expect(ctrl.isProficientWithShield()).toBe(true);
        expect(ctrl.isProficientWithWeapon("Greatsword")).toBe(true);

        // Multiclass into Bard (grants 1 additional skill of choice, musical instrument)
        ctrl.state.classes.push({ classId: "bard", level: 1, subclassId: "" });
        ctrl.syncStateClassProperties();

        expect(ctrl.getMaxClassSkillCount()).toBe(5); // 4 + 1
        expect(ctrl.getAllToolProficiencies()).toContain("Musical Instrument");
    });

    it("+ Add Class button picks an eligible class and disables when no class can be added", () => {
        document.body.innerHTML = `
            <div id="creator-step-panels"></div>
        `;

        // Fighter with Str 17, Dex 14
        ctrl.state.classes = [
            { classId: "fighter", level: 3, subclassId: "" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const addBtn = document.getElementById("add-class-btn") as HTMLButtonElement;
        expect(addBtn).not.toBeNull();
        expect(addBtn.disabled).toBe(false);

        // Clicking Add Class should add Barbarian (Str 17 >= 13, first eligible class)
        addBtn.click();
        expect(ctrl.state.classes.length).toBe(2);
        expect(ctrl.state.classes[1].classId).toBe("barbarian");

        // When primary class does not meet multiclass prerequisites:
        ctrl.state.baseAbilities = { str: 8, dex: 8, con: 10, int: 8, wis: 8, cha: 8 };
        ctrl.state.bgStatA = "con";
        ctrl.state.bgStatB = "con";
        ctrl.state.classes = [
            { classId: "fighter", level: 3, subclassId: "" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.renderStep(3);

        const addBtnDisabled = document.getElementById("add-class-btn") as HTMLButtonElement;
        expect(addBtnDisabled.disabled).toBe(true);
        expect(addBtnDisabled.classList.contains("disabled")).toBe(true);

        // Clicking disabled button does not add a class
        addBtnDisabled.click();
        expect(ctrl.state.classes.length).toBe(1);
    });

    it("warns player when attempting to advance beyond Step 8 (Spells) with more spells than allotment", () => {
        document.body.innerHTML = `
            <div id="creator-validation-alert" class="hidden"></div>
            <div id="creator-step-panels"></div>
        `;

        // Level 1 Wizard: max 3 cantrips, max 4 prepared spells
        ctrl.state.classId = "wizard";
        ctrl.state.level = 1;
        ctrl.state.classes = [{ classId: "wizard", level: 1, subclassId: "" }];
        ctrl.syncStateClassProperties();
        ctrl.state.currentStep = 8;

        const maxCantrips = ctrl.getMaxCantrips();
        const maxPrepared = ctrl.getMaxPreparedSpells();
        expect(maxCantrips).toBe(3);
        expect(maxPrepared).toBe(4);

        // Select 4 cantrips (1 more than allotment)
        ctrl.state.selectedCantrips = ["Light", "Mage Hand", "Prestidigitation", "Minor Illusion"];
        ctrl.state.selectedSpellsLevel1 = ["Shield", "Magic Missile"];

        // Attempting to advance beyond step 8 without dismissing warning should block and show warning
        const canAdvance = ctrl.validateCurrentStep();
        expect(canAdvance).toBe(false);
        const alertBox = document.getElementById("creator-validation-alert")!;
        expect(alertBox.classList.contains("hidden")).toBe(false);
        expect(alertBox.classList.contains("warning")).toBe(true);
        expect(alertBox.textContent).toContain("Warning: You have selected more cantrips (4) than your allotment (3)");
        expect(alertBox.textContent).toContain("Click Next again to proceed anyway");

        // Clicking Next a second time acknowledges warning and allows advancing
        const canAdvanceSecondAttempt = ctrl.validateCurrentStep();
        expect(canAdvanceSecondAttempt).toBe(true);

        // If player deselects back to allotment (3 cantrips), advance succeeds immediately
        ctrl.state.selectedCantrips = ["Light", "Mage Hand", "Prestidigitation"];
        ctrl.spellsWarningDismissed = false;
        expect(ctrl.validateCurrentStep()).toBe(true);
    });

    it("does not allow the Allowed number of spells to change when chosen spells exceed allotment in Character Sheet", async () => {
        const { getCharacterSpellLevelLimits } = await import("../../../src/views/characterSheet/components/spells");

        // Character with 3 default cantrips and 2 level 1 slots
        const charData: any = {
            level: 1,
            classes: [{ name: "Wizard", level: 1 }],
            spellSlots: {
                level1: { total: 2, used: 0 }
            },
            spells: [
                // 5 cantrips chosen (allotment is 3)
                { name: "Light", level: 0 },
                { name: "Mage Hand", level: 0 },
                { name: "Minor Illusion", level: 0 },
                { name: "Prestidigitation", level: 0 },
                { name: "Ray of Frost", level: 0 },
                // 4 level 1 spells chosen (allotment is 2)
                { name: "Shield", level: 1 },
                { name: "Magic Missile", level: 1 },
                { name: "Find Familiar", level: 1 },
                { name: "Detect Magic", level: 1 }
            ]
        };

        const limits = getCharacterSpellLevelLimits(charData);

        // The allowed numbers must NOT change to 5 and 4! They must remain at their actual allotment (3 and 2)
        expect(limits.currentByLevel[0].length).toBe(5);
        expect(limits.allowedByLevel[0]).toBe(3); // strictly allotment, not 5

        expect(limits.currentByLevel[1].length).toBe(4);
        expect(limits.allowedByLevel[1]).toBe(2); // strictly allotment, not 4
    });

    it("correctly handles multiclass spellcasting limits and spell availability", () => {
        // Cleric 2 / Wizard 1
        ctrl.state.classes = [
            { classId: "cleric", level: 2, subclassId: "life" },
            { classId: "wizard", level: 1, subclassId: "evoker" }
        ];
        ctrl.syncStateClassProperties();

        // Cantrips: Cleric 2 (3) + Wizard 1 (3) = 6 cantrips
        expect(ctrl.getMaxCantrips()).toBe(6);

        // Prepared spells: Cleric 2 (5) + Wizard 1 (4) = 9 prepared spells
        expect(ctrl.getMaxPreparedSpells()).toBe(9);

        // Combined Multiclass Spell Slots:
        // Cleric 2 + Wizard 1 = Effective Caster Level 3 -> 4 x Lvl 1, 2 x Lvl 2
        expect(ctrl.getSpellSlotsSummary()).toBe("4 × Lvl 1, 2 × Lvl 2");

        // Allowed spell classes include both Cleric and Wizard
        expect(ctrl.getAllowedSpellClasses()).toEqual(expect.arrayContaining(["Cleric", "Wizard"]));

        // Available spells:
        // Cleric max spell level is 1; Wizard max spell level is 1
        // Even though combined slots have 2nd-level slots, neither class can prepare 2nd-level spells
        const available = ctrl.getAvailableSpells();
        const availableNames = available.leveledSpells.map((s) => s.name);

        // 1st level spells available
        expect(availableNames).toContain("Cure Wounds"); // Cleric 1
        expect(availableNames).toContain("Bless"); // Cleric 1
        expect(availableNames).toContain("Shield"); // Wizard 1
        expect(availableNames).toContain("Magic Missile"); // Wizard 1

        // 2nd level spells NOT available for Cleric 2 / Wizard 1
        expect(availableNames).not.toContain("Spiritual Weapon"); // Cleric 2
        expect(availableNames).not.toContain("Aid"); // Cleric 2
        expect(availableNames).not.toContain("Misty Step"); // Wizard 2
        expect(availableNames).not.toContain("Scorching Ray"); // Wizard 2
    });

    it("splits spell selection per class for multiclass characters (2024 rules)", () => {
        document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div><div id="creator-validation-alert" class="hidden"></div>';
        const root = document.getElementById("creator-step-panels")!;

        // Wizard 1 / Cleric 3
        ctrl.state.classes = [
            { classId: "wizard", level: 1, subclassId: "" },
            { classId: "cleric", level: 3, subclassId: "life" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.state.originFeatId = "alert";

        const buckets = ctrl.getSpellBuckets();
        expect(buckets.map((b) => [b.key, b.maxCantrips, b.maxPrepared, b.maxSpellLevel])).toEqual([
            ["wizard", 3, 4, 1],
            ["cleric", 3, 6, 2]
        ]);
        // Each class only offers its own list, up to its own max spell level
        const wiz = buckets[0];
        expect(wiz.preparedPool.some((s) => s.name === "Shield")).toBe(true);
        expect(wiz.preparedPool.some((s) => s.name === "Bless")).toBe(false);
        expect(wiz.preparedPool.some((s) => s.name === "Misty Step")).toBe(false);
        expect(buckets[1].preparedPool.some((s) => s.name === "Aid")).toBe(true);

        // Picking Wizard spells in the Wizard tab only fills the Wizard allotment
        ctrl.activeSpellClassFilter = "wizard";
        ctrl.renderStep(8);
        expect(root.querySelectorAll(".spell-class-tab-btn").length).toBe(2);
        for (const name of ["Shield", "Magic Missile", "Sleep", "Detect Magic", "Mage Armor"]) {
            (root.querySelector(`.spell1-row[data-spell-name="${name}"]`) as HTMLElement).click();
        }
        expect(ctrl.state.classSpellSelections!.wizard.prepared).toHaveLength(5);
        expect(ctrl.state.classSpellSelections!.cleric.prepared).toHaveLength(0);
        expect(ctrl.state.selectedSpellsLevel1).toHaveLength(5);

        // 5 of 10 total, but 5 of 4 for the Wizard: blocked with a per-class warning
        ctrl.state.currentStep = 8;
        ctrl.spellsWarningDismissed = false;
        expect(ctrl.validateCurrentStep()).toBe(false);
        expect(document.getElementById("creator-validation-alert")!.textContent).toContain("5/4 Wizard prepared spells");

        // Keyboard toggling works on spell rows
        const mageArmor = root.querySelector('.spell1-row[data-spell-name="Mage Armor"]') as HTMLElement;
        expect(mageArmor.getAttribute("role")).toBe("checkbox");
        mageArmor.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
        expect(ctrl.state.classSpellSelections!.wizard.prepared).not.toContain("Mage Armor");

        // Saved spells carry their class as the source
        ctrl.state.classSpellSelections!.cleric = { cantrips: [], prepared: ["Aid"] };
        ctrl.state.selectedSpellsLevel1.push("Aid");
        const payload = ctrl.buildPayload();
        expect(payload.spells.find((s: any) => s.name === "Shield").source).toBe("Wizard");
        expect(payload.spells.find((s: any) => s.name === "Aid").source).toBe("Cleric");
    });

    it("assigns unattributed spells to a class that can prepare them and auto-fills each class separately", () => {
        // Cleric 3 / Wizard 1, with a flat (pre-split) selection
        ctrl.state.classes = [
            { classId: "cleric", level: 3, subclassId: "life" },
            { classId: "wizard", level: 1, subclassId: "evoker" }
        ];
        ctrl.syncStateClassProperties();
        ctrl.state.originFeatId = "alert";
        ctrl.state.classSpellSelections = {};
        ctrl.state.selectedSpellsLevel1 = ["Aid", "Shield", "Bless"];
        ctrl.sanitizeSpellSelections();
        expect(ctrl.state.classSpellSelections!.cleric.prepared).toEqual(["Aid", "Bless"]);
        expect(ctrl.state.classSpellSelections!.wizard.prepared).toEqual(["Shield"]);

        const smart = ctrl.getSmartAutoFillSpells();
        expect(smart.byBucket.cleric.prepared).toHaveLength(6);
        expect(smart.byBucket.wizard.prepared).toHaveLength(4);
        expect(smart.byBucket.wizard.cantrips).toHaveLength(3);
        expect(smart.byBucket.cleric.cantrips).toHaveLength(3);
        // Wizard picks stay level 1 and come from the Wizard list
        for (const name of smart.byBucket.wizard.prepared) {
            const sp = ctrl.getSpell(name)!;
            expect(sp.level).toBe(1);
            expect(sp.classes).toContain("Wizard");
        }
    });

    it("keeps Magic Initiate spells in their own pool", () => {
        ctrl.state.classId = "wizard";
        ctrl.state.level = 1;
        ctrl.state.classes = [{ classId: "wizard", level: 1, subclassId: "" }];
        ctrl.syncStateClassProperties();
        ctrl.state.originFeatId = "magic-initiate-cleric";
        const buckets = ctrl.getSpellBuckets();
        expect(buckets.map((b) => [b.key, b.maxCantrips, b.maxPrepared])).toEqual([
            ["wizard", 3, 4],
            ["magic-initiate", 2, 1]
        ]);
        ctrl.state.classSpellSelections = { "magic-initiate": { cantrips: ["Guidance"], prepared: ["Bless"] } };
        ctrl.state.selectedCantrips = ["Guidance"];
        ctrl.state.selectedSpellsLevel1 = ["Bless"];
        const payload = ctrl.buildPayload();
        const bless = payload.spells.find((s: any) => s.name === "Bless");
        expect(bless.source).toBe("Magic Initiate (Cleric)");
        expect(bless.alwaysPrepared).toBe(true);
    });

    it("allows higher-level prepared spells only for classes that qualify by class level", () => {
        // Cleric 3 / Wizard 1
        ctrl.state.classes = [
            { classId: "cleric", level: 3, subclassId: "life" },
            { classId: "wizard", level: 1, subclassId: "evoker" }
        ];
        ctrl.syncStateClassProperties();

        // Cleric 3 (WIS) max spell level = 2; Wizard 1 (INT) max spell level = 1
        expect(ctrl.getMaxCantrips()).toBe(3 + 3); // 6
        expect(ctrl.getMaxPreparedSpells()).toBe(6 + 4); // 10

        const available = ctrl.getAvailableSpells();
        const availableNames = available.leveledSpells.map((s) => s.name);

        // 2nd-level Cleric spells ARE available because Cleric level is 3
        expect(availableNames).toContain("Spiritual Weapon");
        expect(availableNames).toContain("Aid");

        // 2nd-level Wizard spells are NOT available because Wizard level is only 1
        expect(availableNames).not.toContain("Misty Step");
        expect(availableNames).not.toContain("Scorching Ray");

        // 1st-level Wizard spells ARE available
        expect(availableNames).toContain("Shield");
    });

    it("activates Step 8 Spells when a secondary class is a spellcaster even if primary is not", () => {
        // Fighter 3 (Champion) / Wizard 2 (Evoker)
        ctrl.state.classes = [
            { classId: "fighter", level: 3, subclassId: "champion" },
            { classId: "wizard", level: 2, subclassId: "evoker" }
        ];
        ctrl.syncStateClassProperties();

        // Wizard 2 grants 3 cantrips and 5 prepared spells
        expect(ctrl.getMaxCantrips()).toBe(3);
        expect(ctrl.getMaxPreparedSpells()).toBe(5);
        expect(ctrl.getMaxSpellLevel()).toBe(1);
        expect(ctrl.getSpellSlotsSummary()).toBe("3 × Lvl 1");

        // Step 8 renders with spellcasting interface, not the "No Spellcasting" notice
        const html = ctrl["renderStep8Spells"]();
        expect(html).toContain("Cantrips (Level 0)");
        expect(html).toContain("Prepared Spells");
        expect(html).not.toContain("No Spellcasting");
    });

    it("correctly separates and combines Pact Magic and Standard Spellcasting slots", () => {
        // Paladin 2 (half caster) / Warlock 2 (pact caster)
        ctrl.state.classes = [
            { classId: "paladin", level: 2, subclassId: "devotion" },
            { classId: "warlock", level: 2, subclassId: "fiend" }
        ];
        ctrl.syncStateClassProperties();

        // Paladin 2: 0 cantrips, 3 prepared spells, 2 x Lvl 1 standard slots
        // Warlock 2: 2 cantrips, 3 prepared spells, 2 x Lvl 1 pact slots
        expect(ctrl.getMaxCantrips()).toBe(2);
        expect(ctrl.getMaxPreparedSpells()).toBe(6);
        expect(ctrl.getSpellSlotsSummary()).toBe("2 × Lvl 1; 2 × Lvl 1 (Pact Magic)");
    });

    describe("dynamic progression & granted spells integration", () => {
        it("displays progression-granted spells in level progression and includes them in buildPayload", () => {
            const cleric = ctrl.classes.find((c) => c.id === "cleric");
            expect(cleric).toBeDefined();

            const lifeSub = cleric!.subclasses.find((s) => s.id === "life");
            expect(lifeSub).toBeDefined();

            lifeSub!.progression = [
                {
                    level: 3,
                    features: [{ name: "Disciple of Life", description: "Healing spells are more effective." }],
                    grantedSpells: [
                        { spellId: "bless", name: "Bless", alwaysPrepared: true },
                        { spellId: "cure-wounds", name: "Cure Wounds", alwaysPrepared: true }
                    ]
                }
            ];

            ctrl.state.classId = "cleric";
            ctrl.state.subclassId = "life";
            ctrl.state.level = 3;
            ctrl.state.classes = [{ classId: "cleric", level: 3, subclassId: "life" }];
            ctrl.syncStateClassProperties();

            const html = ctrl["renderClassProgression"](cleric!, 3, 0, "life");
            expect(html).toContain("Bless (Granted Spell)");
            expect(html).toContain("Cure Wounds (Granted Spell)");
            expect(html).toContain("Always Prepared");

            const payload = ctrl["buildPayload"]();
            const payloadSpells = payload.spells.map((s: any) => s.name);
            expect(payloadSpells).toContain("Bless");
            expect(payloadSpells).toContain("Cure Wounds");

            const bless = payload.spells.find((s: any) => s.name === "Bless");
            expect(bless.alwaysPrepared).toBe(true);
            expect(bless.prepared).toBe(true);
        });

        it("dynamically renders custom progression choices and includes selected choices in buildPayload", () => {
            const cleric = ctrl.classes.find((c) => c.id === "cleric");
            expect(cleric).toBeDefined();

            const lifeSub = cleric!.subclasses.find((s) => s.id === "life");
            expect(lifeSub).toBeDefined();

            lifeSub!.progression = [
                {
                    level: 3,
                    features: [],
                    choices: [
                        {
                            id: "custom-divine-rite",
                            choiceId: "custom-divine-rite",
                            name: "Rite of Devotion",
                            prompt: "Select your sacred rite.",
                            chooseCount: 1,
                            options: [
                                { id: "rite-of-dawn", name: "Dawn Radiance", description: "Infuses spells with solar radiance." },
                                { id: "rite-of-dusk", name: "Dusk Shroud", description: "Infuses spells with twilight warding." }
                            ]
                        }
                    ]
                }
            ];

            ctrl.state.classId = "cleric";
            ctrl.state.subclassId = "life";
            ctrl.state.level = 3;
            ctrl.state.classes = [{ classId: "cleric", level: 3, subclassId: "life" }];
            ctrl.syncStateClassProperties();

            const html = ctrl["renderClassProgression"](cleric!, 3, 0, "life");
            expect(html).toContain("Rite of Devotion");
            expect(html).toContain("Dawn Radiance");
            expect(html).toContain("Dusk Shroud");

            ctrl.state.subclassFeatureChoices["custom-divine-rite"] = "rite-of-dawn";

            const payload = ctrl["buildPayload"]();
            const choiceFeature = payload.features.find((f: any) => f.name.includes("Dawn Radiance"));
            expect(choiceFeature).toBeDefined();
            expect(choiceFeature.description).toContain("solar radiance");
        });
    });

    describe("lineage and species resolution on character load", () => {
        it("automatically selects Infernal lineage when loading Darvell by ID or site ID", async () => {
            const requestModule = await import("../../../src/services/request");
            vi.spyOn(requestModule, "getData").mockResolvedValue({ character: null });

            await ctrl.loadCharacter("138310322");

            expect(ctrl.state.speciesId).toBe("tiefling");
            expect(ctrl.state.lineageId).toBe("infernal");

            // Darvell's Pact of the Tome spell choices should be correctly populated
            expect(ctrl.state.featureSpellChoices["pact-of-the-tome-cantrips"]).toEqual(
                expect.arrayContaining(["Eldritch Blast", "Produce Flame", "Ray of Frost"])
            );
            expect(ctrl.state.featureSpellChoices["pact-of-the-tome-rituals"]).toEqual(
                expect.arrayContaining(["Charm Person", "Mirror Image"])
            );

            // Darvell's prepared spells should match his full allotment (17/17: Bard 6 gives 10 + Warlock 6 gives 7)
            expect(ctrl.getMaxPreparedSpells()).toBe(17);
            expect(ctrl.state.selectedSpellsLevel1.length).toBe(17);

            const step8Html = ctrl["renderStep8Spells"]();
            expect(step8Html).toContain('id="feature-spell-choices-section"');
            expect(step8Html).toContain('data-feature-section-id="pact-of-the-tome-cantrips"');
            expect(step8Html).toContain('data-feature-section-id="pact-of-the-tome-rituals"');

            const step2Html = ctrl["renderStep2Species"]();
            expect(step2Html).toContain('data-lineage-id="infernal"');
            expect(step2Html).toMatch(/class="[^"]*lineage-card[^"]*selected[^"]*"[^>]*data-lineage-id="infernal"/);
        });

        it("automatically resolves Infernal lineage for a tiefling with fire resistance and Hellish Resistance", async () => {
            const requestModule = await import("../../../src/services/request");
            vi.spyOn(requestModule, "getData").mockResolvedValue({
                character: {
                    id: "custom-tiefling-id",
                    name: "Ignis",
                    race: "Tiefling",
                    damageResistances: ["fire"],
                    features: [{ name: "Hellish Resistance", description: "Resistance to fire damage." }]
                }
            });

            await ctrl.loadCharacter("custom-tiefling-id");

            expect(ctrl.state.speciesId).toBe("tiefling");
            expect(ctrl.state.lineageId).toBe("infernal");

            const step2Html = ctrl["renderStep2Species"]();
            expect(step2Html).toMatch(/class="[^"]*lineage-card[^"]*selected[^"]*"[^>]*data-lineage-id="infernal"/);
        });

        it("automatically resolves Wood Elf lineage for an elf with wood elf features", async () => {
            const requestModule = await import("../../../src/services/request");
            vi.spyOn(requestModule, "getData").mockResolvedValue({
                character: {
                    id: "custom-elf-id",
                    name: "Legolas",
                    race: "Elf",
                    features: [{ name: "Fleet of Foot", description: "Speed increased by 5 ft." }]
                }
            });

            await ctrl.loadCharacter("custom-elf-id");

            expect(ctrl.state.speciesId).toBe("elf");
            expect(ctrl.state.lineageId).toBe("wood-elf");

            const step2Html = ctrl["renderStep2Species"]();
            expect(step2Html).toMatch(/class="[^"]*lineage-card[^"]*selected[^"]*"[^>]*data-lineage-id="wood-elf"/);
        });

        it("automatically resolves Eldritch Invocations when loading Darvell", async () => {
            const requestModule = await import("../../../src/services/request");
            vi.spyOn(requestModule, "getData").mockResolvedValue({ character: null });

            await ctrl.loadCharacter("138310322");

            expect(ctrl.state.invocations.length).toBeGreaterThan(0);
            expect(ctrl.state.invocations).toContain("agonizing-blast");
            expect(ctrl.state.invocations).toContain("devils-sight");
            expect(ctrl.state.invocations).toContain("pact-of-the-tome");
            expect(ctrl.state.invocations).toContain("beguiling-influence");
            expect(ctrl.state.invocations).toContain("eyes-of-the-rune-keeper");

            const step3Html = ctrl["renderStep3Class"]();
            expect(step3Html).toMatch(/class="[^"]*invocation-card[^"]*selected[^"]*"[^>]*data-invocation-id="agonizing-blast"/);
            expect(step3Html).toMatch(/class="[^"]*invocation-card[^"]*selected[^"]*"[^>]*data-invocation-id="devils-sight"/);
            expect(step3Html).toMatch(/class="[^"]*invocation-card[^"]*selected[^"]*"[^>]*data-invocation-id="pact-of-the-tome"/);
        });

        it("resolves Eldritch Invocations with parenthetical names and curly quotes from character features", async () => {
            const requestModule = await import("../../../src/services/request");
            vi.spyOn(requestModule, "getData").mockResolvedValue({
                character: {
                    id: "custom-warlock-id",
                    name: "Warlock Test",
                    level: 9,
                    classes: [{ name: "Warlock", level: 9, subclass: "The Fiend" }],
                    features: [
                        { name: "Agonizing Blast (Eldritch Blast)", type: "Invocation", source: "Class Option / Invocation" },
                        { name: "Devil’s Sight", type: "Invocation", source: "Class Option / Invocation" },
                        { name: "Eldritch Mind", type: "Invocation", source: "Class Option / Invocation" },
                        { name: "Whispers of the Grave", type: "Invocation", source: "Class Option / Invocation" }
                    ]
                }
            });

            await ctrl.loadCharacter("custom-warlock-id");

            expect(ctrl.state.invocations).toContain("agonizing-blast");
            expect(ctrl.state.invocations).toContain("devils-sight");
            expect(ctrl.state.invocations).toContain("eldritch-mind");
            expect(ctrl.state.invocations).toContain("whispers-of-the-grave");

            const step3Html = ctrl["renderStep3Class"]();
            expect(step3Html).toMatch(/class="[^"]*invocation-card[^"]*selected[^"]*"[^>]*data-invocation-id="whispers-of-the-grave"/);
        });

        it("places feature descriptions inside level-choice-box under level-choice-title and avoids duplicate ability-feature-cards across all classes and subclasses", () => {
            document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
            const root = document.getElementById("creator-step-panels")!;
            ctrl.state.level = 20;

            // 1. Specifically check Warlock: 0 ability-feature-card divs for Eldritch Invocations, 1 level-choice-box with description under level-choice-title
            ctrl.state.classId = "warlock";
            ctrl.state.subclassId = "fiend";
            ctrl.renderStep(3);

            const warlockAbilityCards = Array.from(root.querySelectorAll(".ability-feature-card .card-title")).map((el) => el.textContent?.trim() || "");
            expect(warlockAbilityCards.filter((t) => t.toLowerCase().includes("eldritch invocation"))).toHaveLength(0);
            expect(warlockAbilityCards.filter((t) => t.toLowerCase().includes("fiendish resilience"))).toHaveLength(0);

            const warlockChoiceBoxes = Array.from(root.querySelectorAll(".level-choice-box"));
            const invocationChoiceBoxes = warlockChoiceBoxes.filter((box) =>
                box.querySelector(".level-choice-title")?.textContent?.includes("Eldritch Invocations")
            );
            expect(invocationChoiceBoxes).toHaveLength(1);
            const invTitle = invocationChoiceBoxes[0].querySelector(".level-choice-title");
            const invDesc = invTitle?.nextElementSibling;
            expect(invDesc?.tagName.toLowerCase()).toBe("p");
            expect(invDesc?.classList.contains("card-body")).toBe(true);
            expect(invDesc?.textContent).toContain("Eldritch Invocations");

            // 2. Specifically check Sorcerer: 0 ability-feature-card divs for Metamagic, 1 level-choice-box with description under level-choice-title
            ctrl.state.classId = "sorcerer";
            ctrl.state.subclassId = "draconic";
            ctrl.renderStep(3);

            const sorcererAbilityCards = Array.from(root.querySelectorAll(".ability-feature-card .card-title")).map((el) => el.textContent?.trim() || "");
            expect(sorcererAbilityCards.filter((t) => t.toLowerCase().includes("metamagic"))).toHaveLength(0);
            expect(sorcererAbilityCards.filter((t) => t.toLowerCase().includes("draconic ancestor"))).toHaveLength(0);

            // 3. Check across all 12 classes and 48 subclasses that every .level-choice-box has a p.card-body directly beneath h5.level-choice-title
            for (const cls of ctrl.classes) {
                ctrl.state.classId = cls.id;
                for (const sub of cls.subclasses) {
                    ctrl.state.subclassId = sub.id;
                    ctrl.renderStep(3);
                    const choiceBoxes = Array.from(root.querySelectorAll(".level-choice-box"));
                    expect(choiceBoxes.length).toBeGreaterThan(0);
                    for (const box of choiceBoxes) {
                        const titleEl = box.querySelector(".level-choice-title");
                        expect(titleEl).toBeTruthy();
                        const bodyEl = titleEl?.nextElementSibling as HTMLElement | null;
                        expect(bodyEl?.tagName.toLowerCase()).toBe("p");
                        expect(bodyEl?.classList.contains("card-body")).toBe(true);
                        expect((bodyEl?.textContent || "").trim().length).toBeGreaterThan(10);
                    }
                }
            }
        });

        it("renders only one Great Old One Patron box in Warlock Subclass Selection even when duplicate aliases are present", () => {
            document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
            const root = document.getElementById("creator-step-panels")!;

            const warlockCls = ctrl.classes.find((c) => c.id === "warlock")!;
            warlockCls.subclasses = [
                ...warlockCls.subclasses,
                {
                    id: "great-old-one-patron",
                    name: "Great Old One Patron",
                    description: "Awakened Mind (telepathic connection), Psychic Spells, Clairvoyant Combatant, Eldritch Hex, Thought Shield, Create Thrall.",
                    features: []
                },
                {
                    id: "the-great-old-one",
                    name: "The Great Old One",
                    description: "",
                    features: []
                }
            ];

            ctrl.state.classId = "warlock";
            ctrl.state.level = 3;
            ctrl.state.subclassId = "the-great-old-one";
            ctrl.state.classes = [{ classId: "warlock", level: 3, subclassId: "the-great-old-one" }];
            ctrl.renderStep(3);

            expect(ctrl.state.subclassId).toBe("great-old-one");
            expect(ctrl.state.classes[0].subclassId).toBe("great-old-one");

            const subclassCards = Array.from(root.querySelectorAll(".subclass-card"));
            expect(subclassCards).toHaveLength(4);

            const gooCards = subclassCards.filter((card) =>
                (card.querySelector(".card-title")?.textContent || "").toLowerCase().includes("great old one")
            );
            expect(gooCards).toHaveLength(1);
            expect(gooCards[0].getAttribute("data-subclass-id")).toBe("great-old-one");
            expect(gooCards[0].classList.contains("selected")).toBe(true);
        });

        it("only displays subclasses belonging to the selected class and filters out subclasses from other classes", () => {
            document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
            const root = document.getElementById("creator-step-panels")!;

            const fighterCls = ctrl.classes.find((c) => c.id === "fighter")!;
            fighterCls.subclasses = [
                ...fighterCls.subclasses,
                { id: "berserker", name: "Path of the Berserker", classSlug: "barbarian", features: [] } as any,
                { id: "life", name: "Life Domain", classSlug: "cleric", features: [] } as any,
                { id: "abjurer", name: "School of Abjuration", classSlug: "wizard", features: [] } as any
            ];

            ctrl.state.classId = "fighter";
            ctrl.state.level = 3;
            ctrl.state.subclassId = "champion";
            ctrl.state.classes = [{ classId: "fighter", level: 3, subclassId: "champion" }];
            ctrl.renderStep(3);

            const subclassCards = Array.from(root.querySelectorAll(".subclass-card"));
            expect(subclassCards).toHaveLength(4);
            const cardIds = subclassCards.map((c) => c.getAttribute("data-subclass-id"));
            expect(cardIds).toContain("champion");
            expect(cardIds).toContain("battle-master");
            expect(cardIds).toContain("eldritch-knight");
            expect(cardIds).toContain("psi-warrior");
            expect(cardIds).not.toContain("berserker");
            expect(cardIds).not.toContain("life");
            expect(cardIds).not.toContain("abjurer");
        });

        it("renders a referral note in Step 3 choice boxes and a dedicated progression spell selection section in Step 8 (e.g., Pact of the Tome, Thaumaturge, Blessed Warrior, Magical Secrets, Mystic Arcanum)", () => {
            document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
            const root = document.getElementById("creator-step-panels")!;

            // 1. Warlock Level 12 with Pact of the Tome: check Step 3 referral notes on Eldritch Invocations and Mystic Arcanum
            ctrl.state.classId = "warlock";
            ctrl.state.level = 12;
            ctrl.state.subclassId = "great-old-one";
            ctrl.state.classes = [{ classId: "warlock", level: 12, subclassId: "great-old-one" }];
            ctrl.state.invocations = ["pact-of-the-tome"];
            ctrl.renderStep(3);

            const referralNotes = Array.from(root.querySelectorAll(".choice-spells-referral-note"));
            expect(referralNotes.length).toBeGreaterThanOrEqual(2);
            expect(referralNotes.some((n) => (n.textContent || "").includes("Pact of the Tome"))).toBe(true);
            expect(referralNotes.some((n) => (n.textContent || "").includes("Step 8: Spells"))).toBe(true);

            // 2. Render Step 8 (Spells) for Warlock with Pact of the Tome + Level 11 Mystic Arcanum
            ctrl.renderStep(8);
            const featureSection = root.querySelector("#feature-spell-choices-section");
            expect(featureSection).toBeTruthy();

            const tomeCantripsBox = root.querySelector('.feature-spell-choice-box[data-feature-section-id="pact-of-the-tome-cantrips"]');
            const tomeRitualsBox = root.querySelector('.feature-spell-choice-box[data-feature-section-id="pact-of-the-tome-rituals"]');
            const arcanum6Box = root.querySelector('.feature-spell-choice-box[data-feature-section-id="warlock-11-mystic-arcanum"]');
            expect(tomeCantripsBox).toBeTruthy();
            expect(tomeRitualsBox).toBeTruthy();
            expect(arcanum6Box).toBeTruthy();

            // Select 3 cantrips from any class (including non-Warlock cantrips like Guidance, Sacred Flame, Starry Wisp)
            const clickFeatureSpell = (secId: string, spellName: string) => {
                const row = root.querySelector(`.feature-spell-row[data-feature-section-id="${secId}"][data-spell-name="${spellName}"]`) as HTMLElement | null;
                expect(row).toBeTruthy();
                row!.click();
            };

            clickFeatureSpell("pact-of-the-tome-cantrips", "Guidance");
            clickFeatureSpell("pact-of-the-tome-cantrips", "Produce Flame");
            clickFeatureSpell("pact-of-the-tome-cantrips", "Ray of Frost");
            expect(ctrl.state.featureSpellChoices["pact-of-the-tome-cantrips"]).toEqual([
                "Guidance",
                "Produce Flame",
                "Ray of Frost"
            ]);

            // Select 2 Level 1 Ritual spells for Pact of the Tome
            clickFeatureSpell("pact-of-the-tome-rituals", "Detect Magic");
            clickFeatureSpell("pact-of-the-tome-rituals", "Find Familiar");
            expect(ctrl.state.featureSpellChoices["pact-of-the-tome-rituals"]).toEqual([
                "Detect Magic",
                "Find Familiar"
            ]);

            // Verify buildPayload includes the chosen progression spells with their sourceLabel
            const payload = ctrl.buildPayload();
            const guidanceSpell = payload.spells.find((s: any) => s.name === "Guidance");
            expect(guidanceSpell).toBeDefined();
            expect(guidanceSpell.source).toBe("Warlock / Pact of the Tome");
            expect(guidanceSpell.alwaysPrepared).toBe(true);

            const findFamiliarSpell = payload.spells.find((s: any) => s.name === "Find Familiar");
            expect(findFamiliarSpell).toBeDefined();
            expect(findFamiliarSpell.source).toBe("Warlock / Pact of the Tome");
            expect(findFamiliarSpell.ritual).toBe(true);

            // 3. Fighter Level 1 (non-spellcaster class) with Blessed Warrior Fighting Style gets access to Step 8 progression spell picker
            ctrl.state.classId = "fighter";
            ctrl.state.level = 1;
            ctrl.state.subclassId = "";
            ctrl.state.classes = [{ classId: "fighter", level: 1, subclassId: "" }];
            ctrl.state.fightingStyle = "blessed-warrior";
            ctrl.state.invocations = [];
            ctrl.state.featureSpellChoices = {};

            ctrl.renderStep(3);
            expect(root.querySelector(".choice-spells-referral-note")?.textContent).toContain("Blessed Warrior");

            ctrl.renderStep(8);
            const blessedWarriorBox = root.querySelector('.feature-spell-choice-box[data-feature-section-id="fighting-style-blessed-warrior"]');
            expect(blessedWarriorBox).toBeTruthy();
            clickFeatureSpell("fighting-style-blessed-warrior", "Thaumaturgy");
            clickFeatureSpell("fighting-style-blessed-warrior", "Toll the Dead");
            expect(ctrl.state.featureSpellChoices["fighting-style-blessed-warrior"]).toEqual([
                "Thaumaturgy",
                "Toll the Dead"
            ]);

            const fighterPayload = ctrl.buildPayload();
            expect(fighterPayload.spells.map((s: any) => s.name)).toContain("Thaumaturgy");
            expect(fighterPayload.spells.map((s: any) => s.name)).toContain("Toll the Dead");
            expect(fighterPayload.spells.map((s: any) => s.name)).not.toContain("Sacred Flame");
        });

        it("does not count Class & Subclass Progression spells against the base cantrip/prepared allotment", () => {
            document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
            const root = document.getElementById("creator-step-panels")!;

            ctrl.state.classId = "warlock";
            ctrl.state.level = 3;
            ctrl.state.subclassId = "great-old-one";
            ctrl.state.classes = [{ classId: "warlock", level: 3, subclassId: "great-old-one" }];
            ctrl.state.invocations = ["pact-of-the-tome"];
            ctrl.state.originFeatId = "alert";

            // Player had these in base selections, and also chose them via Pact of the Tome
            ctrl.state.selectedCantrips = ["Eldritch Blast", "Minor Illusion"];
            ctrl.state.selectedSpellsLevel1 = ["Charm Person", "Find Familiar"];
            ctrl.state.featureSpellChoices = {
                "pact-of-the-tome-cantrips": ["Minor Illusion"],
                "pact-of-the-tome-rituals": ["Find Familiar"]
            };

            ctrl.renderStep(8);

            // Progression spells are removed from the base allotment
            expect(ctrl.state.selectedCantrips).toEqual(["Eldritch Blast"]);
            expect(ctrl.state.selectedSpellsLevel1).toEqual(["Charm Person"]);

            // Granted rows are displayed as locked and clicking them does not add them to the base allotment
            const grantedRow = root.querySelector('.cantrip-row[data-spell-name="Minor Illusion"]') as HTMLElement | null;
            expect(grantedRow?.getAttribute("data-granted")).toBe("true");
            grantedRow!.click();
            expect(ctrl.state.selectedCantrips).not.toContain("Minor Illusion");

            // Payload: progression spells are saved as always-prepared bonus spells, base spells under their class
            const payload = ctrl.buildPayload();
            const illusion = payload.spells.find((s: any) => s.name === "Minor Illusion");
            expect(illusion.source).toBe("Warlock / Pact of the Tome");
            expect(illusion.alwaysPrepared).toBe(true);
            const charm = payload.spells.find((s: any) => s.name === "Charm Person");
            expect(charm.source).toBe("Warlock");
        });

        it("Bard Magical Secrets at Level 10 expands prepared spells to Cleric, Druid, and Wizard lists without a separate 2-spell picker", () => {
            document.body.innerHTML = '<div id="creator-step-panels"></div><div id="creator-live-summary"></div>';
            const root = document.getElementById("creator-step-panels")!;

            // 1. Level 9 Bard: available leveled spells should only be Bard spells
            ctrl.state.classId = "bard";
            ctrl.state.level = 9;
            ctrl.state.subclassId = "lore";
            ctrl.state.classes = [{ classId: "bard", level: 9, subclassId: "lore" }];
            ctrl.state.originFeatId = "alert";

            const lvl9Spells = ctrl.getAvailableSpells();
            expect(lvl9Spells.leveledSpells.some((s) => s.name === "Fireball")).toBe(false);
            expect(lvl9Spells.leveledSpells.some((s) => s.name === "Revivify")).toBe(false);
            expect(lvl9Spells.leveledSpells.some((s) => s.name === "Dissonant Whispers")).toBe(true);

            // 2. Level 10 Bard: Step 3 renders Magical Secrets as a standard ability feature card, NOT a choice box
            ctrl.state.level = 10;
            ctrl.state.classes[0].level = 10;
            ctrl.renderStep(3);

            const magicalSecretsChoiceBox = root.querySelector('.level-choice-box .level-choice-title');
            const allChoiceTitles = Array.from(root.querySelectorAll('.level-choice-title')).map((t) => t.textContent || "");
            expect(allChoiceTitles.some((t) => t.toLowerCase().includes("magical secrets"))).toBe(false);

            const allFeatureCardTitles = Array.from(root.querySelectorAll('.ability-feature-card .card-title')).map((t) => t.textContent || "");
            expect(allFeatureCardTitles.some((t) => t.toLowerCase().includes("magical secrets"))).toBe(true);

            // 3. Step 8: getFeatureSpellChoiceSections does NOT contain bard-10-magical-secrets
            ctrl.renderStep(8);
            const featureSections = ctrl.getFeatureSpellChoiceSections();
            expect(featureSections.some((s) => s.id === "bard-10-magical-secrets")).toBe(false);

            // 4. Step 8: getAvailableSpells expands leveled spells to include Cleric, Druid, and Wizard spells up to 5th level
            const lvl10Spells = ctrl.getAvailableSpells();
            // Fireball is Wizard, Revivify is Cleric, Pass without Trace is Druid
            expect(lvl10Spells.leveledSpells.some((s) => s.name === "Fireball")).toBe(true);
            expect(lvl10Spells.leveledSpells.some((s) => s.name === "Revivify")).toBe(true);
            expect(lvl10Spells.leveledSpells.some((s) => s.name === "Pass without Trace")).toBe(true);
            // Cantrips for Bard should still only be Bard cantrips
            expect(lvl10Spells.cantrips.some((s) => s.name === "Vicious Mockery")).toBe(true);
            expect(lvl10Spells.cantrips.some((s) => s.name === "Sacred Flame")).toBe(false);

            // 5. Preparing Fireball & Revivify in normal prepared spells works and saves with the Bard as source
            ctrl.state.selectedSpellsLevel1 = ["Fireball", "Revivify", "Dissonant Whispers"];
            const payload = ctrl.buildPayload();
            const fireball = payload.spells.find((s: any) => s.name === "Fireball");
            const revivify = payload.spells.find((s: any) => s.name === "Revivify");
            expect(fireball).toBeDefined();
            expect(fireball.source).toBe("Bard");
            expect(fireball.prepared).toBe(true);
            expect(revivify).toBeDefined();
            expect(revivify.source).toBe("Bard");
            expect(revivify.prepared).toBe(true);
        });
    });
});
