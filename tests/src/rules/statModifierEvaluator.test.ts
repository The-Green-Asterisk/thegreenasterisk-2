import { describe, expect, it } from "vitest";
import { applyProgressionChoiceOption, applyStatModifier } from "../../../src/rules/dnd5e_2024/statModifierEvaluator";
import { CharacterData } from "../../../src/views/characterSheet/characterData";

function createMockCharacter(): CharacterData {
    return {
        id: "test-char",
        name: "Valeros",
        subtitle: "Level 1 Fighter",
        level: 1,
        classes: [{ name: "Fighter", level: 1 }],
        race: "Human",
        background: "Soldier",
        alignment: "Neutral Good",
        avatarUrl: "",
        dndBeyondUrl: "",
        vitals: {
            currentHp: 12,
            maxHp: 12,
            tempHp: 0,
            armorClass: 16,
            initiative: 2,
            speed: "30 ft.",
            proficiencyBonus: 2,
            passivePerception: 11,
            passiveInvestigation: 10,
            passiveInsight: 11,
            darkvision: "0 ft.",
            hitDice: "1d10",
            heroicInspiration: false,
            spellSaveDc: 10,
            spellAttackBonus: 2,
            spellcastingAbility: "str"
        },
        abilities: [
            { name: "Strength", abbr: "STR", score: 16, modifier: 3, save: 5, proficientSave: true },
            { name: "Dexterity", abbr: "DEX", score: 14, modifier: 2, save: 2, proficientSave: false },
            { name: "Constitution", abbr: "CON", score: 14, modifier: 2, save: 4, proficientSave: true },
            { name: "Intelligence", abbr: "INT", score: 10, modifier: 0, save: 0, proficientSave: false },
            { name: "Wisdom", abbr: "WIS", score: 12, modifier: 1, save: 1, proficientSave: false },
            { name: "Charisma", abbr: "CHA", score: 8, modifier: -1, save: -1, proficientSave: false }
        ],
        skills: [
            { name: "Athletics", stat: "STR", bonus: 5, proficiency: "proficient" },
            { name: "Acrobatics", stat: "DEX", bonus: 2, proficiency: "none" },
            { name: "Arcana", stat: "INT", bonus: 0, proficiency: "none" },
            { name: "Religion", stat: "INT", bonus: 0, proficiency: "none" },
            { name: "Perception", stat: "WIS", bonus: 1, proficiency: "none" },
            { name: "Stealth", stat: "DEX", bonus: 2, proficiency: "none" }
        ],
        spellSlots: {},
        actions: [],
        features: [],
        equipment: [],
        weapons: [],
        resources: [],
        proficiencies: {
            armor: ["Light Armor", "Medium Armor", "Shields"],
            weapons: ["Simple Weapons"],
            tools: [],
            languages: ["Common"],
            defenses: []
        }
    } as any;
}

describe("StatModifierEvaluator", () => {
    describe("applyStatModifier", () => {
        it("modifies AC with bonus and reverts it", () => {
            const char = createMockCharacter();
            expect(char.vitals.armorClass).toBe(16);

            // Apply Defense fighting style (+1 AC)
            applyStatModifier(char, { target: "vitals.ac", type: "bonus", value: 1 }, 1);
            expect(char.vitals.armorClass).toBe(17);

            // Revert
            applyStatModifier(char, { target: "vitals.ac", type: "bonus", value: 1 }, -1);
            expect(char.vitals.armorClass).toBe(16);
        });

        it("modifies walking speed and reverts it", () => {
            const char = createMockCharacter();
            expect(char.vitals.speed).toBe("30 ft.");

            // Apply Fast Movement (+10 ft.)
            applyStatModifier(char, { target: "vitals.speed", type: "bonus", value: 10 }, 1);
            expect(char.vitals.speed).toBe("40 ft.");

            // Revert
            applyStatModifier(char, { target: "vitals.speed", type: "bonus", value: 10 }, -1);
            expect(char.vitals.speed).toBe("30 ft.");
        });

        it("sets blindsight and resets to None on revert", () => {
            const char = createMockCharacter();
            expect(char.vitals.blindsight).toBeUndefined();

            // Apply Blind Fighting (10 ft.)
            applyStatModifier(char, { target: "vitals.blindsight", type: "set", value: "10 ft." }, 1);
            expect(char.vitals.blindsight).toBe("10 ft.");

            // Revert
            applyStatModifier(char, { target: "vitals.blindsight", type: "set", value: "10 ft." }, -1);
            expect(char.vitals.blindsight).toBe("None");
        });

        it("modifies maxHp and currentHp proportionately", () => {
            const char = createMockCharacter();
            expect(char.vitals.maxHp).toBe(12);
            expect(char.vitals.currentHp).toBe(12);

            // Apply Draconic Resilience (+1 HP)
            applyStatModifier(char, { target: "vitals.maxHp", type: "bonus", value: 1 }, 1);
            expect(char.vitals.maxHp).toBe(13);
            expect(char.vitals.currentHp).toBe(13);

            // Revert
            applyStatModifier(char, { target: "vitals.maxHp", type: "bonus", value: 1 }, -1);
            expect(char.vitals.maxHp).toBe(12);
            expect(char.vitals.currentHp).toBe(12);
        });

        it("modifies ability scores and recalculates modifiers and saving throws", () => {
            const char = createMockCharacter();
            const strAbility = char.abilities.find(a => a.abbr === "STR")!;
            expect(strAbility.score).toBe(16);
            expect(strAbility.modifier).toBe(3);
            expect(strAbility.save).toBe(5); // 3 mod + 2 PB

            // Apply Primal Champion (+4 STR)
            applyStatModifier(char, { target: "abilities.str", type: "bonus", value: 4 }, 1);
            expect(strAbility.score).toBe(20);
            expect(strAbility.modifier).toBe(5);
            expect(strAbility.save).toBe(7); // 5 mod + 2 PB

            // Revert
            applyStatModifier(char, { target: "abilities.str", type: "bonus", value: 4 }, -1);
            expect(strAbility.score).toBe(16);
            expect(strAbility.modifier).toBe(3);
            expect(strAbility.save).toBe(5);
        });

        it("adds ability modifier to skills (e.g. Thaumaturge adding WIS to Arcana)", () => {
            const char = createMockCharacter();
            const arcana = char.skills.find(s => s.name === "Arcana")!;
            expect(arcana.bonus).toBe(0);

            // Apply Thaumaturge (+WIS modifier to Arcana, WIS mod is 1)
            applyStatModifier(char, { target: "skills.arcana", type: "ability_mod", abilitySource: "wis" }, 1);
            expect(arcana.bonus).toBe(1);

            // Revert
            applyStatModifier(char, { target: "skills.arcana", type: "ability_mod", abilitySource: "wis" }, -1);
            expect(arcana.bonus).toBe(0);
        });

        it("upgrades skill to expertise and recalculates bonus", () => {
            const char = createMockCharacter();
            const stealth = char.skills.find(s => s.name === "Stealth")!;
            expect(stealth.proficiency).toBe("none");
            expect(stealth.bonus).toBe(2); // DEX mod 2

            // Apply Expertise
            applyStatModifier(char, { target: "skills.stealth", type: "proficiency_tier", value: "expertise" }, 1);
            expect(stealth.proficiency).toBe("expertise");
            expect(stealth.bonus).toBe(6); // 2 DEX + 2*2 PB

            // Revert
            applyStatModifier(char, { target: "skills.stealth", type: "proficiency_tier", value: "expertise" }, -1);
            expect(stealth.proficiency).toBe("none");
            expect(stealth.bonus).toBe(2);
        });

        it("adds and removes damage resistance in defenses", () => {
            const char = createMockCharacter();
            expect(char.vitals.damageResistances).toBeUndefined();

            // Apply Draconic Ancestor (Fire Resistance)
            applyStatModifier(char, { target: "defenses.resistance", type: "set", value: "fire" }, 1);
            expect(char.vitals.damageResistances).toContain("Fire (Resistance)");

            // Revert
            applyStatModifier(char, { target: "defenses.resistance", type: "set", value: "fire" }, -1);
            expect(char.vitals.damageResistances).not.toContain("Fire (Resistance)");
        });

        it("grants armor and weapon proficiencies (e.g. Protector Divine Order)", () => {
            const char = createMockCharacter();
            expect(char.proficiencies.armor).not.toContain("Heavy Armor");
            expect(char.proficiencies.weapons).not.toContain("Martial Weapons");

            // Protector gives Heavy Armor and Martial Weapons
            applyStatModifier(char, { target: "proficiencies.armor.heavy", type: "bonus", value: 1 }, 1);
            applyStatModifier(char, { target: "proficiencies.weapons.martial", type: "bonus", value: 1 }, 1);
            expect(char.proficiencies.armor).toContain("Heavy Armor");
            expect(char.proficiencies.weapons).toContain("Martial Weapons");

            // Revert
            applyStatModifier(char, { target: "proficiencies.armor.heavy", type: "bonus", value: 1 }, -1);
            applyStatModifier(char, { target: "proficiencies.weapons.martial", type: "bonus", value: 1 }, -1);
            expect(char.proficiencies.armor).not.toContain("Heavy Armor");
            expect(char.proficiencies.weapons).not.toContain("Martial Weapons");
        });
    });

    describe("applyProgressionChoiceOption", () => {
        it("applies multiple modifiers defined on a choice option and reverts them cleanly", () => {
            const char = createMockCharacter();
            const protectorOption = {
                id: "protector",
                name: "Protector",
                description: "Training with Heavy armor and Martial weapons",
                modifiers: [
                    { target: "proficiencies.armor.heavy", type: "bonus" as const, value: 1 },
                    { target: "proficiencies.weapons.martial", type: "bonus" as const, value: 1 }
                ]
            };

            applyProgressionChoiceOption(char, protectorOption, 1);
            expect(char.proficiencies.armor).toContain("Heavy Armor");
            expect(char.proficiencies.weapons).toContain("Martial Weapons");

            applyProgressionChoiceOption(char, protectorOption, -1);
            expect(char.proficiencies.armor).not.toContain("Heavy Armor");
            expect(char.proficiencies.weapons).not.toContain("Martial Weapons");
        });
    });
});
