import { describe, expect, it } from "vitest";
import { applyFeatureDecisionOnCharacterData, ensureFeatureDecisionsOnCharacterData } from "../../../src/views/characterSheet/featureDecisions";
import { CharacterData } from "../../../src/views/characterSheet/characterData";

function createMockCharacter(): CharacterData {
    return {
        id: "char-1",
        name: "Darvell",
        subtitle: "Level 6 Cleric",
        level: 6,
        classes: [{ name: "Cleric", level: 6 }],
        race: "Human",
        background: "Acolyte",
        alignment: "Neutral",
        avatarUrl: "",
        dndBeyondUrl: "",
        vitals: {
            currentHp: 38,
            maxHp: 38,
            tempHp: 0,
            armorClass: 15,
            initiative: 1,
            speed: "30 ft.",
            proficiencyBonus: 3,
            passivePerception: 14,
            passiveInvestigation: 10,
            passiveInsight: 14,
            darkvision: "0 ft.",
            hitDice: "6d8",
            heroicInspiration: false,
            spellSaveDc: 14,
            spellAttackBonus: 6,
            spellcastingAbility: "Wisdom (+3)",
            damageResistances: []
        },
        abilities: [
            { name: "Strength", abbr: "STR", score: 14, modifier: 2, save: 2, proficientSave: false },
            { name: "Dexterity", abbr: "DEX", score: 12, modifier: 1, save: 1, proficientSave: false },
            { name: "Constitution", abbr: "CON", score: 14, modifier: 2, save: 2, proficientSave: false },
            { name: "Intelligence", abbr: "INT", score: 10, modifier: 0, save: 0, proficientSave: false },
            { name: "Wisdom", abbr: "WIS", score: 16, modifier: 3, save: 6, proficientSave: true },
            { name: "Charisma", abbr: "CHA", score: 10, modifier: 0, save: 3, proficientSave: true }
        ],
        skills: [
            { name: "Arcana", stat: "INT", bonus: 0, proficiency: "none" },
            { name: "Religion", stat: "INT", bonus: 0, proficiency: "none" },
            { name: "Perception", stat: "WIS", bonus: 3, proficiency: "none" },
            { name: "Insight", stat: "WIS", bonus: 6, proficiency: "proficient" }
        ],
        spellSlots: {
            level1: { total: 4, label: "1st" },
            level2: { total: 3, label: "2nd" },
            level3: { total: 3, label: "3rd" }
        },
        actions: [],
        features: [
            {
                name: "Divine Order",
                source: "Cleric",
                type: "Class",
                description: "Choose your Divine Order.",
                decisions: [
                    {
                        id: "cleric-divine-order",
                        label: "Divine Order",
                        selectedValue: "divine-order:protector",
                        options: [
                            { value: "divine-order:protector", label: "Protector" },
                            { value: "divine-order:thaumaturge", label: "Thaumaturge" }
                        ]
                    }
                ]
            },
            {
                name: "Fighting Style",
                source: "Fighter",
                type: "Class",
                description: "Choose a Fighting Style.",
                decisions: [
                    {
                        id: "fighter-style",
                        label: "Fighting Style",
                        selectedValue: "none",
                        options: [
                            { value: "none", label: "None" },
                            { value: "fighting-style:defense", label: "Defense" },
                            { value: "fighting-style:archery", label: "Archery" }
                        ]
                    }
                ]
            },
            {
                name: "Circle of the Land Biome",
                source: "Druid",
                type: "Subclass",
                description: "Choose your land biome.",
                decisions: [
                    {
                        id: "land-biome",
                        label: "Land Biome",
                        selectedValue: "none",
                        options: [
                            { value: "none", label: "None" },
                            { value: "land-biome:arid", label: "Arid" },
                            { value: "land-biome:polar", label: "Polar" }
                        ]
                    }
                ]
            }
        ],
        equipment: [],
        weapons: [],
        proficiencies: {
            armor: ["Light Armor", "Medium Armor", "Shields"],
            weapons: ["Simple Weapons"],
            tools: [],
            languages: ["Common"],
            defenses: []
        },
        spells: []
    };
}

describe("Feature Decisions Progression Choice Integration", () => {
    it("dynamically grants spells and modifies stats when switching Divine Order", () => {
        const char = createMockCharacter();

        // Initially on protector: switch to thaumaturge
        applyFeatureDecisionOnCharacterData(char, "cleric-divine-order", "divine-order:thaumaturge");

        // Should grant Sacred Flame spell
        const sacredFlame = char.spells.find(s => s.name.toLowerCase() === "sacred flame");
        expect(sacredFlame).toBeDefined();

        // Should add WIS mod (+3) to Arcana and Religion
        const arcana = char.skills.find(s => s.name === "Arcana");
        const religion = char.skills.find(s => s.name === "Religion");
        expect(arcana?.bonus).toBe(3);
        expect(religion?.bonus).toBe(3);

        // Now switch back to protector
        applyFeatureDecisionOnCharacterData(char, "cleric-divine-order", "divine-order:protector");

        // Sacred flame granted spell should be reverted
        const removedSacredFlame = char.spells.find(s => s.name.toLowerCase() === "sacred flame");
        expect(removedSacredFlame).toBeUndefined();

        // Skill bonuses should revert
        expect(char.skills.find(s => s.name === "Arcana")?.bonus).toBe(0);
        expect(char.skills.find(s => s.name === "Religion")?.bonus).toBe(0);

        // Heavy armor and martial weapon proficiencies should be added
        expect(char.proficiencies.armor).toContain("Heavy Armor");
        expect(char.proficiencies.weapons).toContain("Martial Weapons");
    });

    it("dynamically modifies AC and switches Fighting Style", () => {
        const char = createMockCharacter();
        const baseAc = char.vitals.armorClass;

        // Apply defense style
        applyFeatureDecisionOnCharacterData(char, "fighter-style", "fighting-style:defense");
        expect(char.vitals.armorClass).toBe(baseAc + 1);

        // Switch to archery: reverts AC +1
        applyFeatureDecisionOnCharacterData(char, "fighter-style", "fighting-style:archery");
        expect(char.vitals.armorClass).toBe(baseAc);
    });

    it("dynamically grants and reverts spells and resistances when switching Land Biome", () => {
        const char = createMockCharacter();

        // Switch to arid: grants Fire resistance and spells Blur & Fireball
        applyFeatureDecisionOnCharacterData(char, "land-biome", "land-biome:arid");
        expect(char.vitals.damageResistances).toContain("Fire (Resistance)");
        expect(char.spells.some(s => s.name === "Blur")).toBe(true);
        expect(char.spells.some(s => s.name === "Fireball")).toBe(true);

        // Switch to polar: reverts Fire, adds Cold resistance, removes Blur/Fireball, adds Hold Person/Ice Storm
        applyFeatureDecisionOnCharacterData(char, "land-biome", "land-biome:polar");
        expect(char.vitals.damageResistances).not.toContain("Fire (Resistance)");
        expect(char.vitals.damageResistances).toContain("Cold (Resistance)");
        expect(char.spells.some(s => s.name === "Blur")).toBe(false);
        expect(char.spells.some(s => s.name === "Fireball")).toBe(false);
        expect(char.spells.some(s => s.name === "Hold Person")).toBe(true);
        expect(char.spells.some(s => s.name === "Ice Storm")).toBe(true);
    });

    it("ensureFeatureDecisionsOnCharacterData attaches decisions to features lacking them", () => {
        const char = createMockCharacter();
        // Remove pre-existing decisions
        char.features.forEach(f => {
            delete f.decisions;
        });

        ensureFeatureDecisionsOnCharacterData(char);

        const divineOrderFeat = char.features.find(f => f.name === "Divine Order");
        expect(divineOrderFeat?.decisions).toBeDefined();
        expect(divineOrderFeat?.decisions?.length).toBeGreaterThan(0);
        expect(divineOrderFeat?.decisions?.[0].options.some(o => o.value === "divine-order:protector")).toBe(true);

        const fightingStyleFeat = char.features.find(f => f.name === "Fighting Style");
        expect(fightingStyleFeat?.decisions).toBeDefined();
        expect(fightingStyleFeat?.decisions?.[0].options.some(o => o.value === "fighting-style:defense")).toBe(true);
    });

    it("applies dynamic progression choice changes and modifies character sheet stats", () => {
        const char = createMockCharacter();
        const customOption = {
            id: "iron-soul",
            name: "Iron Soul",
            description: "+1 AC and +1 to all saves",
            modifiers: [
                { target: "vitals.ac", type: "bonus" as const, value: 1 },
                { target: "saves.all", type: "bonus" as const, value: 1 }
            ]
        };

        char.features.push({
            name: "Custom Transcendence",
            source: "CustomClass",
            type: "Class",
            description: "Transcendent boon",
            decisions: [
                {
                    id: "custom-transcendence",
                    label: "Transcendence",
                    selectedValue: "none",
                    options: [
                        { value: "none", label: "None" },
                        { value: "custom-transcendence:iron-soul", label: "Iron Soul" }
                    ]
                }
            ]
        });

        // Attach dynamic progression choice onto character classes
        (char.classes as any)[0].progression = [
            {
                level: 1,
                choices: [
                    {
                        choiceId: "custom-transcendence",
                        featureName: "Transcendence",
                        prompt: "Choose transcendence",
                        options: [customOption]
                    }
                ]
            }
        ];

        const initialAc = char.vitals.armorClass;
        const initialStrSave = char.abilities.find(a => a.abbr === "STR")!.save;

        applyFeatureDecisionOnCharacterData(char, "custom-transcendence", "custom-transcendence:iron-soul");

        expect(char.vitals.armorClass).toBe(initialAc + 1);
        expect(char.abilities.find(a => a.abbr === "STR")!.save).toBe(initialStrSave + 1);

        // Revert by setting to none
        applyFeatureDecisionOnCharacterData(char, "custom-transcendence", "none");
        expect(char.vitals.armorClass).toBe(initialAc);
        expect(char.abilities.find(a => a.abbr === "STR")!.save).toBe(initialStrSave);
    });
});
