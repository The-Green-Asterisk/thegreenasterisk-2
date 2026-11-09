import { describe, expect, it } from "vitest";
import { flattenDndBeyondSpellDefinition, mergeSpellClasses } from "../../server/services/dndBeyondSpell";

describe("flattenDndBeyondSpellDefinition", () => {
    it("turns D&D Beyond range, duration, activation and components into display strings", () => {
        expect(flattenDndBeyondSpellDefinition({
            activation: { activationTime: 1, activationType: 1 },
            range: { origin: "Ranged", rangeValue: 30, aoeType: null, aoeValue: null },
            duration: { durationInterval: 0, durationUnit: null, durationType: "Instantaneous" },
            components: [1, 2],
            componentsDescription: ""
        })).toEqual({ castingTime: "1 Action", range: "30 ft.", duration: "Instantaneous", components: "V, S" });
    });

    it("handles self/touch ranges, concentration, longer casting times and material components", () => {
        expect(flattenDndBeyondSpellDefinition({
            activation: { activationTime: 10, activationType: 6 },
            range: { origin: "Self", rangeValue: null },
            duration: { durationInterval: 1, durationUnit: "Hour", durationType: "Concentration" },
            concentration: true,
            components: [1, 2, 3],
            componentsDescription: "a feather"
        })).toEqual({ castingTime: "10 Minutes", range: "Self", duration: "Concentration, up to 1 Hour", components: "V, S, M (a feather)" });
    });

    it("passes strings through unchanged", () => {
        expect(flattenDndBeyondSpellDefinition({ range: "60 feet", duration: "1 round", components: "V" }))
            .toMatchObject({ range: "60 feet", duration: "1 round", components: "V" });
    });
});

describe("mergeSpellClasses", () => {
    it("adds classes a spell list proves and leaves the stored value alone when nothing changes", () => {
        expect(mergeSpellClasses(undefined, ["Druid"])).toBe('["Druid"]');
        expect(mergeSpellClasses('["Druid"]', ["Wizard"])).toBe('["Druid","Wizard"]');
        expect(mergeSpellClasses('["Druid","Wizard"]', ["Wizard"])).toBe('["Druid","Wizard"]');
        expect(mergeSpellClasses("Druid, Wizard", [])).toBe('["Druid","Wizard"]');
    });

    it("removes a class the spell was taken onto from another list (e.g. Magical Secrets), and nothing else", () => {
        expect(mergeSpellClasses('["Bard"]', [], "Bard")).toBe("[]");
        expect(mergeSpellClasses('["Bard","Druid","Sorcerer","Wizard"]', [], "Bard")).toBe('["Druid","Sorcerer","Wizard"]');
        expect(mergeSpellClasses(undefined, [], "Bard")).toBeUndefined();
    });
});
