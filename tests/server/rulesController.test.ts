import http from "http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import cache from "../../server/cache";
import RulesController from "../../server/controllers/rulesController";
import AppDataSource from "../../server/services/database";
import RuleBackground from "../../server/services/database/entity/RuleBackground";
import RuleClass from "../../server/services/database/entity/RuleClass";
import RuleFeat from "../../server/services/database/entity/RuleFeat";
import RuleSpecies from "../../server/services/database/entity/RuleSpecies";

describe("RulesController", () => {
    let mockReq: Partial<http.IncomingMessage>;
    let mockRes: Partial<http.ServerResponse>;

    beforeEach(() => {
        mockReq = {
            url: "/get-rules",
            method: "GET"
        };
        mockRes = {};
        cache.del("dnd_rules_all");
        vi.restoreAllMocks();
    });

    describe("getRules", () => {
        it("returns fallback rules when database is uninitialized", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: false, configurable: true });

            const result = await RulesController.getRules(
                mockReq as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const data = JSON.parse(result.response);
            expect(data.classes).toBeDefined();
            expect(data.classes.length).toBeGreaterThan(0);
            expect(data.species).toBeDefined();
            expect(data.backgrounds).toBeDefined();
            expect(data.originFeats).toBeDefined();
            expect(data.generalFeats).toBeDefined();
        });

        it("returns cached rules when cache is primed", async () => {
            const cachedPayload = {
                classes: [{ id: "artificer", name: "Artificer" }],
                species: [],
                backgrounds: [],
                originFeats: [],
                generalFeats: []
            };
            cache.set("dnd_rules_all", JSON.stringify(cachedPayload), 60);

            const result = await RulesController.getRules(
                mockReq as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const data = JSON.parse(result.response);
            expect(data.classes[0].name).toBe("Artificer");
        });

        it("queries database and returns mapped entities when database is initialized", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const mockClassRepo = {
                count: vi.fn().mockResolvedValue(1),
                find: vi.fn().mockResolvedValue([
                    {
                        slug: "fighter",
                        name: "Fighter",
                        description: "A warrior",
                        hitDie: 10,
                        primaryAbilitiesJson: JSON.stringify(["str", "dex"]),
                        savingThrowsJson: JSON.stringify(["str", "con"]),
                        armorProficienciesJson: JSON.stringify(["All Armor"]),
                        weaponProficienciesJson: JSON.stringify(["Simple Weapons", "Martial Weapons"]),
                        weaponMasteryCount: 3,
                        skillChoicesJson: JSON.stringify({ count: 2, from: ["Athletics"] }),
                        subclassesJson: JSON.stringify([{ id: "champion", name: "Champion" }]),
                        featuresJson: JSON.stringify([{ name: "Second Wind", level: 1, description: "Heal" }]),
                        startingEquipmentOptionsJson: JSON.stringify([])
                    }
                ])
            };

            const mockSpeciesRepo = {
                count: vi.fn().mockResolvedValue(1),
                find: vi.fn().mockResolvedValue([
                    {
                        slug: "human",
                        name: "Human",
                        description: "Versatile beings",
                        size: "Medium",
                        speed: 30,
                        traitsJson: JSON.stringify([{ name: "Resourceful", description: "Inspiration" }]),
                        lineagesJson: JSON.stringify([]),
                        extraSkillCount: 1,
                        extraFeatCount: 1
                    }
                ])
            };

            const mockBgRepo = {
                count: vi.fn().mockResolvedValue(1),
                find: vi.fn().mockResolvedValue([
                    {
                        slug: "soldier",
                        name: "Soldier",
                        description: "Military veteran",
                        allowedAbilitiesJson: JSON.stringify(["str", "dex", "con"]),
                        skillsJson: JSON.stringify(["Athletics", "Intimidation"]),
                        tool: "Gaming Set",
                        originFeatId: "savage-attacker",
                        equipmentSummary: "Spear"
                    }
                ])
            };

            const mockFeatRepo = {
                count: vi.fn().mockResolvedValue(2),
                find: vi.fn().mockResolvedValue([
                    {
                        slug: "alert",
                        name: "Alert",
                        description: "Always vigilant",
                        category: "origin",
                        benefitsJson: JSON.stringify(["+PB to init"]),
                        isEpicBoon: false
                    },
                    {
                        slug: "heavy-armor-master",
                        name: "Heavy Armor Master",
                        description: "Mastery of heavy plating",
                        category: "general",
                        benefitsJson: JSON.stringify(["Damage reduction"]),
                        statOptionsJson: JSON.stringify(["str"]),
                        isEpicBoon: false
                    }
                ])
            };

            vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
                if (entity === RuleClass) return mockClassRepo as any;
                if (entity === RuleSpecies) return mockSpeciesRepo as any;
                if (entity === RuleBackground) return mockBgRepo as any;
                if (entity === RuleFeat) return mockFeatRepo as any;
                return {} as any;
            });

            const result = await RulesController.getRules(
                mockReq as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const data = JSON.parse(result.response);
            expect(data.classes[0].name).toBe("Fighter");
            expect(data.species[0].name).toBe("Human");
            expect(data.backgrounds[0].name).toBe("Soldier");
            expect(data.originFeats.find((f: any) => f.id === "alert")).toBeDefined();
            expect(data.generalFeats.find((f: any) => f.id === "heavy-armor-master")).toBeDefined();
        });
    });

    describe("upsertRulesFromDndBeyond", () => {
        it("upserts classes, subclasses, species, background, and feats", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const savedClasses: any[] = [];
            const savedSpecies: any[] = [];
            const savedBgs: any[] = [];
            const savedFeats: any[] = [];

            const mockClassRepo = {
                findOne: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    savedClasses.push(e);
                    return e;
                })
            };

            const mockSpeciesRepo = {
                findOne: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    savedSpecies.push(e);
                    return e;
                })
            };

            const mockBgRepo = {
                findOne: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    savedBgs.push(e);
                    return e;
                })
            };

            const mockFeatRepo = {
                findOne: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    savedFeats.push(e);
                    return e;
                })
            };

            vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
                if (entity === RuleClass) return mockClassRepo as any;
                if (entity === RuleSpecies) return mockSpeciesRepo as any;
                if (entity === RuleBackground) return mockBgRepo as any;
                if (entity === RuleFeat) return mockFeatRepo as any;
                return {} as any;
            });

            const rawCharacter = {
                classes: [
                    {
                        definition: {
                            name: "Blood Hunter",
                            description: "Master of hemocraft",
                            hitDice: 10,
                            classFeatures: [
                                { name: "Hunter's Bane", requiredLevel: 1, description: "Gain blood magic" }
                            ]
                        },
                        subclassDefinition: {
                            name: "Order of the Ghostslayer",
                            description: "Slays undead",
                            classFeatures: [
                                { name: "Rite of the Dawn", requiredLevel: 3, description: "Radiant damage" }
                            ]
                        }
                    }
                ],
                race: {
                    fullName: "Goliath",
                    description: "Mountain dwellers",
                    weightSpeeds: { normal: { walk: 35 } },
                    racialTraits: [
                        { definition: { name: "Stone's Endurance", description: "Shrug off damage" } }
                    ]
                },
                background: {
                    definition: {
                        name: "Gladiator",
                        description: "Arena fighter",
                        featureName: "By Popular Demand",
                        featureDescription: "Crowd favorite"
                    }
                },
                feats: [
                    {
                        definition: {
                            name: "Great Weapon Master",
                            description: "Heavy hits"
                        }
                    }
                ]
            };

            const count = await RulesController.upsertRulesFromDndBeyond(rawCharacter);
            expect(count).toBeGreaterThan(0);
            expect(savedClasses.some((c) => c.name === "Blood Hunter")).toBe(true);
            expect(savedSpecies.some((s) => s.name === "Goliath")).toBe(true);
            expect(savedBgs.some((b) => b.name === "Gladiator")).toBe(true);
            expect(savedFeats.some((f) => f.name === "Great Weapon Master")).toBe(true);
        });
    });

    describe("upsertRulesFromCharacter", () => {
        it("captures classes, subclasses, and custom rules from character save payload", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const savedClasses: any[] = [];
            const mockClassRepo = {
                findOne: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    savedClasses.push(e);
                    return e;
                })
            };

            vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
                if (entity === RuleClass) return mockClassRepo as any;
                return {
                    findOne: vi.fn().mockResolvedValue(null),
                    create: vi.fn().mockImplementation((e) => e),
                    save: vi.fn().mockResolvedValue({})
                } as any;
            });

            const inputCharacter = {
                classes: [
                    {
                        name: "Witch",
                        subclass: "Hedge Witch"
                    }
                ],
                features: [
                    {
                        name: "Cauldron Brew",
                        source: "Witch",
                        type: "Class",
                        description: "Brew powerful potions"
                    }
                ]
            };

            const count = await RulesController.upsertRulesFromCharacter(inputCharacter, { classes: inputCharacter.classes });
            expect(count).toBeGreaterThan(0);
            expect(savedClasses.some((c) => c.name === "Witch")).toBe(true);
        });
    });
});
