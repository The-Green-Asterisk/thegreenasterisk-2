import { describe, expect, it } from "vitest";
import {
    BACKGROUNDS_2024,
    BASE_ARMOR_2024,
    BASE_WEAPONS_2024,
    CLASSES_2024,
    ORIGIN_FEATS_2024,
    SPECIES_2024,
    SPELLS_2024,
    WEAPON_MASTERIES
} from "../../../src/rules/dnd5e_2024";

describe("5.5e (2024 Revision) Rules Datasets", () => {
    it("defines the 10 core species with traits and lineages", () => {
        expect(SPECIES_2024.length).toBe(10);
        const names = SPECIES_2024.map((s) => s.name);
        expect(names).toContain("Human");
        expect(names).toContain("Elf");
        expect(names).toContain("Dwarf");
        expect(names).toContain("Halfling");
        expect(names).toContain("Gnome");
        expect(names).toContain("Dragonborn");
        expect(names).toContain("Tiefling");
        expect(names).toContain("Orc");
        expect(names).toContain("Goliath");
        expect(names).toContain("Aasimar");

        const elf = SPECIES_2024.find((s) => s.id === "elf");
        expect(elf?.lineages?.length).toBe(3); // High Elf, Wood Elf, Drow
        expect(elf?.traits.some((t) => t.name.includes("Fey Ancestry"))).toBe(true);

        const dwarf = SPECIES_2024.find((s) => s.id === "dwarf");
        expect(dwarf?.darkvision).toBe("Darkvision 120 ft.");
        expect(dwarf?.traits.some((t) => t.name.includes("Dwarven Toughness"))).toBe(true);
    });

    it("defines 2024 backgrounds with allowed ability scores, skills, tool, and origin feats", () => {
        expect(BACKGROUNDS_2024.length).toBeGreaterThanOrEqual(16);
        const soldier = BACKGROUNDS_2024.find((b) => b.id === "soldier");
        expect(soldier).toBeDefined();
        expect(soldier?.skills).toContain("Athletics");
        expect(soldier?.skills).toContain("Intimidation");
        expect(soldier?.originFeatId).toBe("savage-attacker");
        expect(soldier?.allowedAbilities).toEqual(["str", "dex", "con"]);

        const criminal = BACKGROUNDS_2024.find((b) => b.id === "criminal");
        expect(criminal?.originFeatId).toBe("alert");
        expect(criminal?.tool).toBe("Thieves' Tools");
    });

    it("defines the 10 Origin Feats", () => {
        expect(ORIGIN_FEATS_2024.length).toBeGreaterThanOrEqual(10);
        const alertFeat = ORIGIN_FEATS_2024.find((f) => f.id === "alert");
        expect(alertFeat).toBeDefined();
        expect(alertFeat?.benefits.some((b) => b.includes("Initiative Proficiency"))).toBe(true);

        const toughFeat = ORIGIN_FEATS_2024.find((f) => f.id === "tough");
        expect(toughFeat).toBeDefined();
    });

    it("defines all 12 core classes with progression and weapon mastery allocations", () => {
        expect(CLASSES_2024.length).toBe(12);

        const fighter = CLASSES_2024.find((c) => c.id === "fighter");
        expect(fighter?.hitDie).toBe(10);
        expect(fighter?.weaponMasteryCount).toBe(3);
        expect(fighter?.savingThrows).toEqual(["str", "con"]);

        const rogue = CLASSES_2024.find((c) => c.id === "rogue");
        expect(rogue?.hitDie).toBe(8);
        expect(rogue?.weaponMasteryCount).toBe(2);
        expect(rogue?.skillChoices.count).toBe(4);

        const wizard = CLASSES_2024.find((c) => c.id === "wizard");
        expect(wizard?.spellcasting?.ability).toBe("int");
        expect(wizard?.spellcasting?.type).toBe("full");

        const paladin = CLASSES_2024.find((c) => c.id === "paladin");
        expect(paladin?.spellcasting?.ability).toBe("cha");
        expect(paladin?.spellcasting?.type).toBe("half");

        // Verify all 12 classes have level 1 to 20 progression features
        for (const cls of CLASSES_2024) {
            expect(cls.features.length).toBeGreaterThanOrEqual(15);
            expect(cls.features.some((f) => f.level === 1)).toBe(true);
            expect(cls.features.some((f) => f.level === 20)).toBe(true);
            const missingLevels: number[] = [];
            for (let lvl = 1; lvl <= 20; lvl++) {
                if (!cls.features.some((f) => f.level === lvl)) {
                    missingLevels.push(lvl);
                }
            }
            expect(missingLevels, `${cls.name} missing features for levels: ${missingLevels.join(", ")}`).toEqual([]);
        }
    });

    it("defines the 8 Weapon Mastery properties and weapon catalogue", () => {
        expect(WEAPON_MASTERIES.length).toBe(8);
        const masteryNames = WEAPON_MASTERIES.map((m) => m.name);
        expect(masteryNames).toEqual(
            expect.arrayContaining(["Cleave", "Graze", "Nick", "Push", "Sap", "Slow", "Topple", "Vex"])
        );

        const dagger = BASE_WEAPONS_2024.find((w) => w.name === "Dagger");
        expect(dagger?.mastery).toBe("Nick");
        expect(dagger?.properties).toContain("Finesse");

        const greatsword = BASE_WEAPONS_2024.find((w) => w.name === "Greatsword");
        expect(greatsword?.mastery).toBe("Graze");
        expect(greatsword?.damageDie).toBe("2d6");
    });

    it("defines base armors and shields", () => {
        expect(BASE_ARMOR_2024.length).toBeGreaterThanOrEqual(10);
        const plate = BASE_ARMOR_2024.find((a) => a.name === "Plate Armor");
        expect(plate?.baseAc).toBe(18);
        expect(plate?.category).toBe("Heavy");

        const shield = BASE_ARMOR_2024.find((a) => a.name === "Shield");
        expect(shield?.baseAc).toBe(2);
    });

    it("defines 2024 cantrips and level 1 spells", () => {
        expect(SPELLS_2024.length).toBeGreaterThanOrEqual(20);
        const cureWounds = SPELLS_2024.find((s) => s.name === "Cure Wounds");
        expect(cureWounds?.level).toBe(1);
        expect(cureWounds?.description).toContain("2d8"); // 2024 revision buff

        const healingWord = SPELLS_2024.find((s) => s.name === "Healing Word");
        expect(healingWord?.level).toBe(1);
        expect(healingWord?.description).toContain("2d4"); // 2024 revision buff
    });
});
