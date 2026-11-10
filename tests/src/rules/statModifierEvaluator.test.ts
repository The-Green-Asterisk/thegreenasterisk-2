import { beforeEach, describe, expect, it } from "vitest";
import { applyProgressionChoiceOption, applyStatModifier, evaluateCharacterStatModifiers } from "../../../src/rules/dnd5e_2024/statModifierEvaluator";
import { setClassRules } from "../../../src/services/classRules";
import { CharacterData } from "../../../src/views/characterSheet/characterData";
import { serverRulesClasses } from "../views/serverRulesClasses";

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
    beforeEach(() => setClassRules(serverRulesClasses()));

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

        it("grants spells from progression choice options and reverts them cleanly", () => {
            const char = createMockCharacter();
            char.spells = [];

            const armorOfShadowsOption = {
                id: "armor-of-shadows",
                name: "Armor of Shadows",
                description: "Cast Mage Armor at will without expending a spell slot.",
                grantedSpells: [
                    {
                        name: "Mage Armor",
                        level: 1,
                        atWill: true,
                        alwaysPrepared: true,
                        notes: "Cast at will without expending a spell slot"
                    }
                ]
            };

            applyProgressionChoiceOption(char, armorOfShadowsOption, 1);
            expect(char.spells.some(s => s.name === "Mage Armor")).toBe(true);

            // Revert
            applyProgressionChoiceOption(char, armorOfShadowsOption, -1);
            expect(char.spells.some(s => s.name === "Mage Armor")).toBe(false);
        });

        it("grants features from progression choice options and reverts them cleanly", () => {
            const char = createMockCharacter();
            char.features = [];

            const metamagicOption = {
                id: "quickened-spell",
                name: "Quickened Spell",
                description: "Cast a spell with casting time of 1 action as a bonus action.",
                grantedFeatures: [
                    {
                        id: "metamagic-quickened",
                        name: "Metamagic: Quickened Spell",
                        description: "Cast a 1-action spell as a bonus action.",
                        type: "Class" as const
                    }
                ]
            };

            applyProgressionChoiceOption(char, metamagicOption, 1);
            expect(char.features.some(f => f.name === "Metamagic: Quickened Spell")).toBe(true);

            // Revert
            applyProgressionChoiceOption(char, metamagicOption, -1);
            expect(char.features.some(f => f.name === "Metamagic: Quickened Spell")).toBe(false);
        });
    });

    describe("grant_spell and grant_feature modifiers", () => {
        it("grants and reverts spells via grant_spell modifier", () => {
            const char = createMockCharacter();
            char.spells = [];

            applyStatModifier(char, { target: "spells.grant", type: "grant_spell", value: "Sacred Flame" }, 1);
            expect(char.spells.some(s => s.name === "Sacred Flame")).toBe(true);

            applyStatModifier(char, { target: "spells.grant", type: "grant_spell", value: "Sacred Flame" }, -1);
            expect(char.spells.some(s => s.name === "Sacred Flame")).toBe(false);
        });

        it("grants and reverts features via grant_feature modifier", () => {
            const char = createMockCharacter();
            char.features = [];

            applyStatModifier(char, { target: "features.grant", type: "grant_feature", value: "Divine Spark" }, 1);
            expect(char.features.some(f => f.name === "Divine Spark")).toBe(true);

            applyStatModifier(char, { target: "features.grant", type: "grant_feature", value: "Divine Spark" }, -1);
            expect(char.features.some(f => f.name === "Divine Spark")).toBe(false);
        });
    });

    describe("Advantage, Disadvantage, and +N/-N Modifiers", () => {
        it("applies advantage and disadvantage to saving throws as save effects named by their source", () => {
            const char = createMockCharacter();
            expect(char.saveEffects).toBeUndefined();

            applyStatModifier(char, { target: "saves.con", type: "advantage", condition: "to maintain Concentration" }, 1, "War Caster");
            applyStatModifier(char, { target: "saves.con", type: "advantage", condition: "concentration" }, 1, "Eldritch Mind");
            expect(char.saveEffects).toEqual([{ ability: "con", effect: "advantage", against: "concentration", sources: ["War Caster", "Eldritch Mind"] }]);

            applyStatModifier(char, { target: "saves.all", type: "disadvantage", condition: "while poisoned" }, 1, "Curse");
            expect(char.saveEffects).toContainEqual({ ability: undefined, effect: "disadvantage", against: "while poisoned", sources: ["Curse"] });

            // Undoing one source keeps the effect while another still grants it
            applyStatModifier(char, { target: "saves.con", type: "advantage", condition: "to maintain Concentration" }, -1, "War Caster");
            expect(char.saveEffects?.find((e) => e.ability === "con")?.sources).toEqual(["Eldritch Mind"]);
            applyStatModifier(char, { target: "saves.con", type: "advantage", condition: "concentration" }, -1, "Eldritch Mind");
            expect(char.saveEffects?.some((e) => e.ability === "con")).toBe(false);
            expect(char.savingThrowNotes || []).toEqual([]);
        });

        it("applies advantage and disadvantage to skills and adjusts passive perception by +/-5", () => {
            const char = createMockCharacter();
            expect(char.vitals.passivePerception).toBe(11);

            // Advantage on Perception checks (e.g. Aspect of Owl)
            applyStatModifier(char, { target: "skills.perception", type: "advantage" }, 1);
            expect(char.savingThrowNotes).toContain("Advantage on Perception checks");
            expect(char.vitals.passivePerception).toBe(16); // 11 + 5

            // Revert
            applyStatModifier(char, { target: "skills.perception", type: "advantage" }, -1);
            expect(char.savingThrowNotes).not.toContain("Advantage on Perception checks");
            expect(char.vitals.passivePerception).toBe(11);
        });

        it("applies positive and negative modifiers to spell save DC and spell attack bonus", () => {
            const char = createMockCharacter();
            expect(char.vitals.spellSaveDc).toBe(10);
            expect(char.vitals.spellAttackBonus).toBe(2);

            // +2 bonus
            applyStatModifier(char, { target: "vitals.spellSaveDc", type: "bonus", value: 2 }, 1);
            applyStatModifier(char, { target: "vitals.spellAttackBonus", type: "bonus", value: 2 }, 1);
            expect(char.vitals.spellSaveDc).toBe(12);
            expect(char.vitals.spellAttackBonus).toBe(4);

            // -1 penalty
            applyStatModifier(char, { target: "vitals.spellSaveDc", type: "penalty", value: 1 }, 1);
            applyStatModifier(char, { target: "vitals.spellAttackBonus", type: "penalty", value: 1 }, 1);
            expect(char.vitals.spellSaveDc).toBe(11);
            expect(char.vitals.spellAttackBonus).toBe(3);

            // Revert penalty
            applyStatModifier(char, { target: "vitals.spellSaveDc", type: "penalty", value: 1 }, -1);
            expect(char.vitals.spellSaveDc).toBe(12);
        });

        it("applies weapon attack bonuses and advantage to attacks", () => {
            const char = createMockCharacter();
            char.weapons = [
                { name: "Longbow", category: "Martial Ranged", toHitModifier: 5, attackBonus: "+5" } as any,
                { name: "Longsword", category: "Martial Melee", toHitModifier: 5, attackBonus: "+5" } as any
            ];

            // Archery fighting style: +2 to ranged weapon attacks
            applyStatModifier(char, { target: "attacks.ranged", type: "bonus", value: 2 }, 1);
            expect(char.weapons[0].toHitModifier).toBe(7);
            expect(char.weapons[0].attackBonus).toBe("+7");
            expect(char.weapons[1].toHitModifier).toBe(5);

            // Advantage on ranged weapon attacks
            applyStatModifier(char, { target: "attacks.ranged", type: "advantage" }, 1);
            expect(char.savingThrowNotes).toContain("Advantage on ranged weapon attacks");

            // Revert bonus
            applyStatModifier(char, { target: "attacks.ranged", type: "bonus", value: 2 }, -1);
            expect(char.weapons[0].toHitModifier).toBe(5);
            expect(char.weapons[0].attackBonus).toBe("+5");
        });
    });

    describe("evaluateCharacterStatModifiers", () => {
        it("evaluates choices from creatorState and applies stat modifiers, granted spells, and features", () => {
            const char = createMockCharacter();
            char.creatorState = {
                fightingStyle: "defense",
                subclassFeatureChoices: {
                    "barbarian-6-wild-heart": "owl"
                }
            } as any;

            expect(char.vitals.armorClass).toBe(16);
            expect(char.vitals.darkvision).toBe("0 ft.");

            evaluateCharacterStatModifiers(char);

            // Defense gives +1 AC
            expect(char.vitals.armorClass).toBe(17);
            // Aspect of Owl gives Darkvision 60 ft and Advantage on Perception checks (+5 to passive perception)
            expect(char.vitals.darkvision).toBe("60 ft.");
            expect(char.savingThrowNotes).toContain("Advantage on Perception checks");
            expect(char.vitals.passivePerception).toBe(16);
        });

        it("evaluates dynamic progression choices defined in custom class rules", () => {
            const char = createMockCharacter();
            char.subclassFeatureChoices = {
                "custom-choice-1": "custom-opt-iron-hide"
            };

            const customRules = {
                classes: [
                    {
                        name: "CustomClass",
                        progression: [
                            {
                                level: 1,
                                choices: [
                                    {
                                        choiceId: "custom-choice-1",
                                        featureName: "Custom Boon",
                                        prompt: "Choose your boon",
                                        options: [
                                            {
                                                id: "custom-opt-iron-hide",
                                                name: "Iron Hide",
                                                description: "+2 AC and +10 ft speed",
                                                modifiers: [
                                                    { target: "vitals.ac", type: "bonus" as const, value: 2 },
                                                    { target: "vitals.speed", type: "bonus" as const, value: 10 }
                                                ],
                                                grantedSpells: [
                                                    { name: "Shield", level: 1 }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            expect(char.vitals.armorClass).toBe(16);
            expect(char.vitals.speed).toBe("30 ft.");

            evaluateCharacterStatModifiers(char, customRules);

            expect(char.vitals.armorClass).toBe(18);
            expect(char.vitals.speed).toBe("40 ft.");
            expect(char.spells.some(s => s.name === "Shield")).toBe(true);
        });

        it("applies and reverts special speeds (climb, swim, fly)", () => {
            const char = createMockCharacter();
            expect(char.vitals.speed).toBe("30 ft.");

            // Climb speed = walk speed
            applyStatModifier(char, { target: "vitals.climb", type: "set", value: "walk" }, 1);
            expect(char.vitals.speed).toBe("30 ft. (Climb 30 ft.)");

            // Swim speed = 20 ft.
            applyStatModifier(char, { target: "vitals.swim", type: "set", value: 20 }, 1);
            expect(char.vitals.speed).toBe("30 ft. (Climb 30 ft., Swim 20 ft.)");

            // Fly speed = 60 ft.
            applyStatModifier(char, { target: "speeds.fly", type: "set", value: 60 }, 1);
            expect(char.vitals.speed).toBe("30 ft. (Climb 30 ft., Swim 20 ft., Fly 60 ft.)");

            // Revert climb
            applyStatModifier(char, { target: "vitals.climb", type: "set", value: "walk" }, -1);
            expect(char.vitals.speed).toBe("30 ft. (Swim 20 ft., Fly 60 ft.)");

            // Revert all
            applyStatModifier(char, { target: "vitals.swim", type: "set", value: 20 }, -1);
            applyStatModifier(char, { target: "speeds.fly", type: "set", value: 60 }, -1);
            expect(char.vitals.speed).toBe("30 ft.");
        });

        it("applies and reverts GWF damage floor and TWF off-hand ability mod", () => {
            const char = createMockCharacter();
            char.weapons = [
                { name: "Greatsword", category: "Martial Melee", properties: ["Two-Handed", "Heavy"], damage: "2d6+3 Slashing" } as any,
                { name: "Shortsword", category: "Martial Melee", properties: ["Light", "Finesse"], damage: "1d6 Piercing" } as any
            ];

            // GWF floor: treat 1 or 2 as 3
            applyStatModifier(char, { target: "attacks.two_handed_damage_floor", type: "bonus", value: 3 }, 1);
            expect(char.weapons[0].properties).toContain("GWF (min 3 on damage dice)");

            // TWF: off-hand ability mod
            applyStatModifier(char, { target: "damage.offhand_ability_mod", type: "bonus", value: 1 }, 1);
            expect(char.weapons[1].properties).toContain("TWF (adds ability mod to off-hand damage)");

            // Revert
            applyStatModifier(char, { target: "attacks.two_handed_damage_floor", type: "bonus", value: 3 }, -1);
            expect(char.weapons[0].properties).not.toContain("GWF (min 3 on damage dice)");

            applyStatModifier(char, { target: "damage.offhand_ability_mod", type: "bonus", value: 1 }, -1);
            expect(char.weapons[1].properties).not.toContain("TWF (adds ability mod to off-hand damage)");
        });

        it("applies and reverts cantrip damage bonus and action grants", () => {
            const char = createMockCharacter();
            char.actions = [
                { name: "Sacred Flame", spellName: "Sacred Flame", type: "Action", rangeOrReach: "60 ft.", hitOrDc: "DC 14", damageOrEffect: "1d8 Radiant", notes: "" }
            ];

            // Potent Spellcasting adds WIS (+1) to cantrip damage
            applyStatModifier(char, { target: "damage.cantrips", type: "bonus", value: 1 }, 1);
            expect(char.actions[0].damageOrEffect).toBe("1d8 + 1 Radiant");

            // Revert cantrip damage
            applyStatModifier(char, { target: "damage.cantrips", type: "bonus", value: 1 }, -1);
            expect(char.actions[0].damageOrEffect).toBe("1d8 Radiant");

            // Action grant (Protection reaction)
            applyProgressionChoiceOption(char, {
                id: "protection",
                name: "Protection",
                description: "Impose disadvantage on attack against target within 5 ft.",
                actionGrant: {
                    name: "Protection",
                    type: "Reaction",
                    range: "5 ft.",
                    notes: "Impose disadvantage on attack roll against target within 5 ft."
                }
            }, 1);
            expect(char.actions.some(a => a.name === "Protection" && a.type === "Reaction")).toBe(true);

            // Revert action grant
            applyProgressionChoiceOption(char, {
                id: "protection",
                name: "Protection",
                description: "Impose disadvantage on attack against target within 5 ft.",
                actionGrant: {
                    name: "Protection",
                    type: "Reaction"
                }
            }, -1);
            expect(char.actions.some(a => a.name === "Protection")).toBe(false);
        });
    });
});
