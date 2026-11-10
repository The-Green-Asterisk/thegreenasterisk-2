import { beforeEach, describe, expect, it } from "vitest";
import { setClassRules } from "../../../src/services/classRules";
import { resolveDescriptionPlaceholders } from "../../../src/views/characterSheet/components/markupLinks";
import { serverRulesClasses } from "./serverRulesClasses";

function character(classes: Array<{ name: string; level: number; subclass?: string }>, cha = 16): any {
    const level = classes.reduce((sum, c) => sum + c.level, 0);
    return {
        level,
        classes,
        vitals: { proficiencyBonus: Math.floor((level - 1) / 4) + 2 },
        abilities: [
            { name: "Strength", abbr: "STR", score: 10, modifier: 0 },
            { name: "Dexterity", abbr: "DEX", score: 14, modifier: 2 },
            { name: "Constitution", abbr: "CON", score: 14, modifier: 2 },
            { name: "Intelligence", abbr: "INT", score: 10, modifier: 0 },
            { name: "Wisdom", abbr: "WIS", score: 14, modifier: 2 },
            { name: "Charisma", abbr: "CHA", score: cha, modifier: Math.floor((cha - 10) / 2) }
        ]
    };
}

const scale = (char: any, entityName: string) => resolveDescriptionPlaceholders("{{scalevalue}}", { character: char, entityName });
const uses = (char: any, entityName: string) => resolveDescriptionPlaceholders("{{limiteduse}}", { character: char, entityName });

describe("markup placeholders from the class rules", () => {
    beforeEach(() => setClassRules(serverRulesClasses()));

    it("fills scale values from resource dice, dice totals, badges, and feature data", () => {
        const bard = character([{ name: "Bard", level: 5, subclass: "College of Lore" }]);
        expect(scale(bard, "Bardic Inspiration")).toBe("1d8");
        expect(scale(bard, "Cutting Words")).toBe("1d8");

        expect(scale(character([{ name: "Rogue", level: 5 }]), "Sneak Attack")).toBe("3d6");

        const monk = character([{ name: "Monk", level: 6 }]);
        expect(scale(monk, "Martial Arts")).toBe("1d8");
        expect(scale(monk, "Unarmored Movement")).toBe("+15 ft.");

        expect(scale(character([{ name: "Barbarian", level: 9 }]), "Rage")).toBe("+3");
        expect(scale(character([{ name: "Paladin", level: 6 }]), "Aura of Protection")).toBe("+3");
        expect(scale(character([{ name: "Warlock", level: 5, subclass: "Fiend Patron" }]), "Dark One's Blessing")).toBe("8");

        const battleMaster = character([{ name: "Fighter", level: 10, subclass: "Battle Master" }]);
        expect(scale(battleMaster, "Maneuvers: Trip Attack")).toBe("1d10");
    });

    it("fills limited uses from class and subclass resources", () => {
        expect(uses(character([{ name: "Barbarian", level: 9 }]), "Rage")).toBe("4");
        expect(uses(character([{ name: "Fighter", level: 10, subclass: "Battle Master" }]), "Combat Superiority")).toBe("5");
        expect(uses(character([{ name: "Bard", level: 6, subclass: "College of Glamour" }]), "Mantle of Majesty")).toBe("1");
    });

    it("takes the class level from the class whose rules have the feature", () => {
        const darvell = character([{ name: "Warlock", level: 3 }, { name: "Bard", level: 5 }]);
        expect(resolveDescriptionPlaceholders("{{classlevel}}", { character: darvell, entityName: "Bardic Inspiration" })).toBe("5");
        expect(resolveDescriptionPlaceholders("{{classlevel}}", { character: darvell, entityName: "Eldritch Invocations" })).toBe("3");
    });
});
