import { beforeEach, describe, expect, it, vi } from "vitest";
import cache from "../../server/cache";
import AppDataSource from "../../server/services/database";
import RuleClass from "../../server/services/database/entity/RuleClass";
import RuleSubclass from "../../server/services/database/entity/RuleSubclass";
import { buildClassProgression, buildSubclassProgression } from "../../server/services/database/rulesProgressionBuilder";
import { SEED_CLASSES } from "../../server/services/database/rulesSeed";
import {
    classFeatureUsage,
    expectedClassResourceTotals,
    findServerClassRule,
    loadClassRulesData
} from "../../server/services/classRulesData";

describe("classRulesData", () => {
    beforeEach(async () => {
        cache.del("class_rules_data");
        vi.restoreAllMocks();
        const classRows = (SEED_CLASSES as any[]).map((c) => ({
            slug: c.id,
            name: c.name,
            featuresJson: JSON.stringify(c.features || []),
            progressionJson: JSON.stringify(buildClassProgression(c.id, c.features || []))
        }));
        const subRows = (SEED_CLASSES as any[]).flatMap((c) => (c.subclasses || []).map((s: any) => ({
            classSlug: c.id,
            slug: s.id,
            name: s.name,
            progressionJson: JSON.stringify(buildSubclassProgression(c.id, s))
        })));
        Object.defineProperty(AppDataSource, "isInitialized", { value: true, configurable: true });
        vi.spyOn(AppDataSource, "getRepository").mockImplementation(((entity: any) => ({
            find: async () => (entity === RuleClass ? classRows : entity === RuleSubclass ? subRows : [])
        })) as any);
        await loadClassRulesData();
    });

    it("raises resource totals from the class and subclass rules at each class level", () => {
        const totals = expectedClassResourceTotals(
            [{ name: "Druid", level: 6 }, { name: "Fighter", level: 10, subclass: "Battle Master" }],
            (ab) => (ab === "wis" ? 3 : 0),
            4
        );
        expect(totals.get("wild shape")).toBe(3);
        expect(totals.get("superiority dice")).toBe(5);
        expect(totals.get("second wind")).toBe(4);
    });

    it("knows which class features are spent or granted actions and which are picks", () => {
        const usage = classFeatureUsage();
        expect(usage.active.has("wild shape")).toBe(true);
        expect(usage.active.has("cutting words")).toBe(true);
        expect(usage.grantTypes.get("cosmic omen")).toBe("Reaction");
        expect(usage.passive.has("divine order")).toBe(true);
        expect(usage.passive.has("unarmored defense")).toBe(true);
    });

    it("lists class features with their levels", () => {
        const druid = findServerClassRule("Druid")!;
        expect(druid.features.find((f) => f.name === "Druidic")?.level).toBe(1);
        expect(findServerClassRule("fighter")!.featureNames).toContain("Fighting Style");
        expect(findServerClassRule("wizard")!.featureNames).not.toContain("Fighting Style");
    });
});
