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
});
