import { beforeEach, describe, expect, it } from "vitest";
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

    it("sanitizes and truncates excess or invalid spell selections when class or level changes", () => {
        // As a Level 1 Sorcerer, select 4 cantrips
        ctrl.state.classId = "sorcerer";
        ctrl.state.level = 1;
        ctrl.state.originFeatId = "alert";
        ctrl.state.selectedCantrips = ["Fire Bolt", "Light", "Minor Illusion", "Prestidigitation"];
        ctrl.state.selectedSpellsLevel1 = ["Shield", "Magic Missile"];

        // Switch to Bard (max 2 cantrips at Level 1, Fire Bolt is not on Bard list)
        ctrl.state.classId = "bard";
        ctrl.sanitizeSpellSelections();

        expect(ctrl.state.selectedCantrips.length).toBeLessThanOrEqual(ctrl.getMaxCantrips());
        expect(ctrl.state.selectedCantrips.includes("Fire Bolt")).toBe(false); // Not on Bard list

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

    it("hides locked higher levels under a load more link and reveals them with show less link", () => {
        const ctrl = new CharacterCreatorController();
        document.body.innerHTML = '<div id="creator-step-panels"></div>';

        // Fighter at level 3
        ctrl.state.classId = "fighter";
        ctrl.state.level = 3;
        ctrl.progressionExpanded = false;
        ctrl.renderStep(3);

        const container = document.getElementById("creator-step-panels")!;

        // Unlocked rows: Levels 1, 2, 3
        const unlockedRows = container.querySelectorAll(".progression-row.unlocked");
        expect(unlockedRows.length).toBe(3);
        unlockedRows.forEach((row) => {
            expect(row.classList.contains("hidden")).toBe(false);
        });

        // Locked rows: Levels 4 to 20 should be hidden by default
        const lockedRows = container.querySelectorAll(".progression-row.locked");
        expect(lockedRows.length).toBe(17);
        const hiddenLockedRows = container.querySelectorAll(".progression-row.locked.hidden");
        expect(hiddenLockedRows.length).toBe(17);

        // Load more link should be present with "Load more"
        const loadMoreLink = container.querySelector("#progression-load-more-link") as HTMLAnchorElement;
        expect(loadMoreLink).not.toBeNull();
        expect(loadMoreLink.textContent).toContain("Load more");

        // Click the load more link
        loadMoreLink.click();

        // Now progression should be expanded
        expect(ctrl.progressionExpanded).toBe(true);
        const visibleLockedRows = container.querySelectorAll(".progression-row.locked:not(.hidden)");
        expect(visibleLockedRows.length).toBe(17);

        // Link should now display "Show less"
        const showLessLink = container.querySelector("#progression-load-more-link") as HTMLAnchorElement;
        expect(showLessLink).not.toBeNull();
        expect(showLessLink.textContent).toContain("Show less");

        // Bottom show less link should also be present when expanded
        const bottomShowLess = container.querySelector("#progression-show-less-bottom-link") as HTMLAnchorElement;
        expect(bottomShowLess).not.toBeNull();
        expect(bottomShowLess.textContent).toContain("Show less");

        // Click show less
        showLessLink.click();

        // Locked rows should be re-hidden and link returns to "Load more"
        expect(ctrl.progressionExpanded).toBe(false);
        const rehiddenLockedRows = container.querySelectorAll(".progression-row.locked.hidden");
        expect(rehiddenLockedRows.length).toBe(17);
        const reloadedLink = container.querySelector("#progression-load-more-link") as HTMLAnchorElement;
        expect(reloadedLink.textContent).toContain("Load more");

        // If character level is 20, all levels unlocked, no load more link rendered
        ctrl.state.level = 20;
        ctrl.renderStep(3);
        expect(container.querySelector("#progression-load-more-link")).toBeNull();
        expect(container.querySelectorAll(".progression-row.unlocked").length).toBe(20);
        expect(container.querySelectorAll(".progression-row.locked").length).toBe(0);
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
});
