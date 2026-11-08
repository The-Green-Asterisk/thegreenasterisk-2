import http from "http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import cache from "../../server/cache";
import RulesController from "../../server/controllers/rulesController";
import AppDataSource from "../../server/services/database";
import RuleBackground from "../../server/services/database/entity/RuleBackground";
import RuleClass from "../../server/services/database/entity/RuleClass";
import RuleFeat from "../../server/services/database/entity/RuleFeat";
import RuleSpecies from "../../server/services/database/entity/RuleSpecies";
import RuleSubclass from "../../server/services/database/entity/RuleSubclass";

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
            expect(data.subclasses).toBeDefined();
            expect(data.subclasses.length).toBeGreaterThan(0);
            expect(data.classes[0].progression).toBeDefined();
            expect(data.classes[0].progression.length).toBe(20);
            expect(data.subclasses[0].progression).toBeDefined();
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
            const bh = savedClasses.find((c) => c.name === "Blood Hunter");
            const bhSubs = JSON.parse(bh.subclassesJson);
            expect(bhSubs[0].name).toBe("Order of the Ghostslayer");
            expect(bhSubs[0].features.some((f: any) => f.name === "Rite of the Dawn")).toBe(true);
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
                    },
                    {
                        name: "Hedge Charm",
                        source: "Hedge Witch",
                        type: "Subclass Feature",
                        description: "Weave protective ward"
                    }
                ]
            };

            const count = await RulesController.upsertRulesFromCharacter(inputCharacter, {
                classes: inputCharacter.classes,
                features: inputCharacter.features
            });
            expect(count).toBeGreaterThan(0);
            expect(savedClasses.some((c) => c.name === "Witch")).toBe(true);
            const witch = savedClasses.find((c) => c.name === "Witch");
            const witchFeatures = JSON.parse(witch.featuresJson);
            const witchSubs = JSON.parse(witch.subclassesJson);
            expect(witchFeatures.some((f: any) => f.name === "Cauldron Brew")).toBe(true);
            expect(witchSubs[0].name).toBe("Hedge Witch");
            expect(witchSubs[0].features.some((f: any) => f.name === "Hedge Charm")).toBe(true);
        });
    });

    describe("applyDndBeyondDefinitionsToSiteCharacter", () => {
        it("updates site-created character features and actions with canonical D&D Beyond definitions", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const mockClassRepo = {
                find: vi.fn().mockResolvedValue([
                    {
                        slug: "druid",
                        name: "Druid",
                        featuresJson: JSON.stringify([
                            {
                                name: "Wild Shape",
                                level: 2,
                                description: "<p>Canonical D&D Beyond Wild Shape HTML</p>",
                                htmlDescription: "<p>Canonical D&D Beyond Wild Shape HTML</p>",
                                fromDndBeyond: true
                            }
                        ]),
                        subclassesJson: JSON.stringify([])
                    }
                ])
            };

            const mockSavedCharRepo = {
                find: vi.fn().mockResolvedValue([
                    {
                        source: "dndbeyond",
                        payload: JSON.stringify({
                            classes: [{ name: "Druid", level: 7 }],
                            features: [
                                {
                                    name: "Wild Resurgence",
                                    source: "Druid",
                                    type: "Class",
                                    description: "<p>Canonical D&D Beyond Wild Resurgence HTML</p>"
                                },
                                {
                                    name: "Druidic",
                                    source: "Druid",
                                    type: "Class",
                                    description: "<p>Canonical D&D Beyond Druidic HTML</p>"
                                }
                            ],
                            actions: [
                                {
                                    name: "Wild Shape",
                                    type: "Bonus Action",
                                    rangeOrReach: "Special",
                                    hitOrDc: "Special",
                                    damageOrEffect: "Beast Shape",
                                    notes: "You assume the form of a Beast that you have seen before"
                                },
                                {
                                    name: "Wild Resurgence: Regain Wild Shape",
                                    type: "Action",
                                    rangeOrReach: "Self",
                                    hitOrDc: "Special",
                                    damageOrEffect: "1 Wild Shape Use",
                                    notes: "Expend a spell slot to regain one use of Wild Shape"
                                },
                                {
                                    name: "Wild Resurgence: Regain Spell Slot",
                                    type: "Action",
                                    rangeOrReach: "Self",
                                    hitOrDc: "Special",
                                    damageOrEffect: "1st-Level Spell Slot",
                                    notes: "Give up one use of Wild Shape to give yourself a level 1 spell slot"
                                },
                                {
                                    name: "Leave Druidic Message",
                                    type: "Action",
                                    rangeOrReach: "Self",
                                    hitOrDc: "DC 15",
                                    damageOrEffect: "Hidden Message",
                                    notes: "Leave a hidden Druidic message"
                                }
                            ]
                        })
                    }
                ])
            };

            vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
                if (entity === RuleClass) return mockClassRepo as any;
                if (entity === "SavedCharacter" || entity?.name === "SavedCharacter") return mockSavedCharRepo as any;
                return {
                    find: vi.fn().mockResolvedValue([])
                } as any;
            });

            const siteCharacter: any = {
                source: "site",
                classes: [{ name: "Druid", level: 6 }],
                features: [
                    {
                        name: "Druidic",
                        source: "Druid",
                        type: "Class",
                        description: "Seed Druidic description"
                    },
                    {
                        name: "Wild Shape",
                        source: "Druid",
                        type: "Class",
                        description: "Seed Wild Shape description"
                    },
                    {
                        name: "Wild Resurgence",
                        source: "Druid",
                        type: "Class",
                        description: "Seed Wild Resurgence description"
                    }
                ],
                actions: [
                    {
                        name: "Unarmed Strike",
                        type: "Action",
                        isCustom: false,
                        description: "Melee attack"
                    },
                    {
                        name: "Wild Shape",
                        type: "Bonus Action",
                        isCustom: false,
                        description: "Seed Wild Shape action"
                    },
                    {
                        name: "Wild Resurgence",
                        type: "Action",
                        isCustom: false,
                        description: "Seed Wild Resurgence action"
                    }
                ]
            };

            const changed = await RulesController.applyDndBeyondDefinitionsToSiteCharacter(siteCharacter);
            expect(changed).toBe(true);

            const wildShapeFeature = siteCharacter.features.find((f: any) => f.name === "Wild Shape");
            expect(wildShapeFeature.description).toBe("<p>Canonical D&D Beyond Wild Shape HTML</p>");

            const wildResurgenceFeature = siteCharacter.features.find((f: any) => f.name === "Wild Resurgence");
            expect(wildResurgenceFeature.description).toBe("<p>Canonical D&D Beyond Wild Resurgence HTML</p>");

            const actionNames = siteCharacter.actions.map((a: any) => a.name);
            expect(actionNames).toContain("Wild Shape");
            expect(actionNames).toContain("Wild Resurgence: Regain Wild Shape");
            expect(actionNames).toContain("Wild Resurgence: Regain Spell Slot");
            expect(actionNames).toContain("Leave Druidic Message");
            expect(actionNames).not.toContain("Wild Resurgence");

            const wildShapeAction = siteCharacter.actions.find((a: any) => a.name === "Wild Shape");
            expect(wildShapeAction.notes).toBe("You assume the form of a Beast that you have seen before");
        });
    });

    describe("getClasses and getSubclasses endpoints", () => {
        it("returns class and subclass arrays with progression", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: false, configurable: true });

            const classesRes = await RulesController.getClasses(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(classesRes.status).toBe(200);
            const classes = JSON.parse(classesRes.response);
            expect(Array.isArray(classes)).toBe(true);
            expect(classes.length).toBe(12);
            expect(classes[0].progression).toBeDefined();
            expect(classes[0].progression.length).toBe(20);

            const subsRes = await RulesController.getSubclasses(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(subsRes.status).toBe(200);
            const subclasses = JSON.parse(subsRes.response);
            expect(Array.isArray(subclasses)).toBe(true);
            expect(subclasses.length).toBeGreaterThanOrEqual(48);
            expect(subclasses[0].progression).toBeDefined();
            expect(subclasses[0].classSlug).toBeDefined();
        });
    });

    describe("multiclass feature separation and cross-class contamination prevention", () => {
        it("does not leak Bard features into Warlock (Great Old One) or Warlock features into Bard (Glamour) during upsertRulesFromDndBeyond", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const savedClasses: any[] = [];
            const mockClassRepo = {
                findOne: vi.fn().mockImplementation(async ({ where }: any) => {
                    return savedClasses.find((c) => c.slug === where.slug) || null;
                }),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    const idx = savedClasses.findIndex((c) => c.slug === e.slug);
                    if (idx >= 0) savedClasses[idx] = e;
                    else savedClasses.push(e);
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

            const multiclassCharacter = {
                classes: [
                    {
                        definition: {
                            id: 1,
                            name: "Bard",
                            classFeatures: [
                                { definition: { id: 101, name: "Bardic Inspiration", requiredLevel: 1 } }
                            ]
                        },
                        subclassDefinition: {
                            id: 757,
                            name: "College of Glamour",
                            classFeatures: [
                                { definition: { id: 102, name: "Mantle of Inspiration", requiredLevel: 3 } },
                                { definition: { id: 103, name: "Beguiling Magic", requiredLevel: 3 } }
                            ]
                        },
                        classFeatures: [
                            { definition: { id: 101, classId: 1, name: "Bardic Inspiration", requiredLevel: 1 } },
                            { definition: { id: 102, classId: 757, name: "Mantle of Inspiration", requiredLevel: 3 } },
                            // Cross-class feature from Warlock on character:
                            { definition: { id: 202, classId: 800, name: "Awakened Mind", requiredLevel: 3, isSubclassFeature: true } }
                        ]
                    },
                    {
                        definition: {
                            id: 7,
                            name: "Warlock",
                            classFeatures: [
                                { definition: { id: 201, name: "Pact Magic", requiredLevel: 1 } }
                            ]
                        },
                        subclassDefinition: {
                            id: 800,
                            name: "Great Old One Patron",
                            classFeatures: [
                                { definition: { id: 202, name: "Awakened Mind", requiredLevel: 3 } },
                                { definition: { id: 203, name: "Psychic Spells", requiredLevel: 3 } }
                            ]
                        },
                        classFeatures: [
                            { definition: { id: 201, classId: 7, name: "Pact Magic", requiredLevel: 1 } },
                            { definition: { id: 202, classId: 800, name: "Awakened Mind", requiredLevel: 3 } },
                            // Cross-class feature from Bard on character:
                            { definition: { id: 102, classId: 757, name: "Mantle of Inspiration", requiredLevel: 3, isSubclassFeature: true } }
                        ]
                    }
                ]
            };

            await RulesController.upsertRulesFromDndBeyond(multiclassCharacter);

            const bard = savedClasses.find((c) => c.slug === "bard");
            const warlock = savedClasses.find((c) => c.slug === "warlock");

            expect(bard).toBeDefined();
            expect(warlock).toBeDefined();

            const bardSubs = JSON.parse(bard.subclassesJson);
            const glamour = bardSubs.find((s: any) => s.id === "college-of-glamour" || s.name === "College of Glamour");
            expect(glamour).toBeDefined();
            const glamourFeatNames = glamour.features.map((f: any) => f.name);
            expect(glamourFeatNames).toContain("Mantle of Inspiration");
            expect(glamourFeatNames).not.toContain("Awakened Mind");
            expect(glamourFeatNames).not.toContain("Psychic Spells");

            const warlockSubs = JSON.parse(warlock.subclassesJson);
            const goo = warlockSubs.find((s: any) => s.id === "great-old-one-patron" || s.name === "Great Old One Patron");
            expect(goo).toBeDefined();
            const gooFeatNames = goo.features.map((f: any) => f.name);
            expect(gooFeatNames).toContain("Awakened Mind");
            expect(gooFeatNames).not.toContain("Mantle of Inspiration");
            expect(gooFeatNames).not.toContain("Beguiling Magic");
        });

        it("separates subclass features when saving a multiclass character payload", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const savedClasses: any[] = [];
            const mockClassRepo = {
                findOne: vi.fn().mockImplementation(async ({ where }: any) => {
                    return savedClasses.find((c) => c.slug === where.slug) || null;
                }),
                create: vi.fn().mockImplementation((e) => e),
                save: vi.fn().mockImplementation(async (e) => {
                    const idx = savedClasses.findIndex((c) => c.slug === e.slug);
                    if (idx >= 0) savedClasses[idx] = e;
                    else savedClasses.push(e);
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

            const payload = {
                classes: [
                    { name: "Bard", subclass: "College of Glamour" },
                    { name: "Warlock", subclass: "Great Old One Patron" }
                ],
                features: [
                    { name: "Bardic Inspiration", source: "Bard", type: "Class" },
                    { name: "Mantle of Inspiration", source: "College of Glamour", type: "Subclass Feature" },
                    { name: "Pact Magic", source: "Warlock", type: "Class" },
                    { name: "Awakened Mind", source: "Great Old One Patron", type: "Subclass Feature" }
                ]
            };

            await RulesController.upsertRulesFromCharacter(null, payload);

            const bard = savedClasses.find((c) => c.slug === "bard");
            const warlock = savedClasses.find((c) => c.slug === "warlock");

            const bardSubs = JSON.parse(bard.subclassesJson);
            const glamour = bardSubs.find((s: any) => s.name === "College of Glamour");
            expect(glamour.features.map((f: any) => f.name)).toContain("Mantle of Inspiration");
            expect(glamour.features.map((f: any) => f.name)).not.toContain("Awakened Mind");

            const warlockSubs = JSON.parse(warlock.subclassesJson);
            const goo = warlockSubs.find((s: any) => s.name === "Great Old One Patron");
            expect(goo.features.map((f: any) => f.name)).toContain("Awakened Mind");
            expect(goo.features.map((f: any) => f.name)).not.toContain("Mantle of Inspiration");
        });

        it("attributes actions only to their owning class on multiclass characters", async () => {
            Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });

            const mockSavedRepo = {
                find: vi.fn().mockResolvedValue([
                    {
                        source: "dndbeyond",
                        payload: JSON.stringify({
                            classes: [{ name: "Bard" }, { name: "Warlock" }],
                            features: [
                                { name: "Mantle of Inspiration", source: "College of Glamour" },
                                { name: "Awakened Mind", source: "Great Old One Patron" }
                            ],
                            actions: [
                                { name: "Mantle of Inspiration", type: "Bonus Action" },
                                { name: "Clairvoyant Combat", type: "Special" }
                            ]
                        })
                    }
                ])
            };

            vi.spyOn(AppDataSource, "getRepository").mockImplementation((entity: any) => {
                if (entity === "SavedCharacter" || entity?.name === "SavedCharacter") return mockSavedRepo as any;
                return { find: vi.fn().mockResolvedValue([]) } as any;
            });

            const { actionsByClassAndFeature } = await RulesController.collectDndBeyondCanonicalDefinitions();

            expect(actionsByClassAndFeature.has("bard::mantle of inspiration")).toBe(true);
            expect(actionsByClassAndFeature.has("warlock::mantle of inspiration")).toBe(false);

            expect(actionsByClassAndFeature.has("warlock::clairvoyant combat")).toBe(true);
            expect(actionsByClassAndFeature.has("bard::clairvoyant combat")).toBe(false);
        });
    });
});
