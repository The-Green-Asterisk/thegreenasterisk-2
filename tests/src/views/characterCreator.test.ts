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
});
