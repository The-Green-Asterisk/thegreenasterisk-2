import { describe, expect, it } from "vitest";
import { mergeVitals } from "../../server/services/characterVitals";

describe("mergeVitals", () => {
    it("keeps vitals the row has no column for, such as Devil's Sight, and lets the row's columns win", () => {
        const merged = mergeVitals(
            { darkvision: "120 ft.", currentHp: 40 },
            { darkvision: "60 ft.", currentHp: 10, devilsSight: "120 ft.", damageResistances: ["Fire"] }
        );
        expect(merged).toEqual({ darkvision: "120 ft.", currentHp: 40, devilsSight: "120 ft.", damageResistances: ["Fire"] });
    });

    it("uses the payload's vitals when there is no row", () => {
        expect(mergeVitals(undefined, { devilsSight: "120 ft." })).toEqual({ devilsSight: "120 ft." });
    });
});

import { mergeRowItems } from "../../server/services/characterItems";

describe("mergeRowItems", () => {
    it("keeps item fields the inventory rows have no column for, pairing duplicates in order", () => {
        const merged = mergeRowItems(
            [{ name: "Goggles of Night", equipped: false, notes: undefined }, { name: "Dagger", quantity: 1 }, { name: "Dagger", quantity: 2 }],
            [
                { name: "Dagger", quantity: 1, definitionId: 1 },
                { name: "Goggles of Night", equipped: true, notes: "old", modifiers: [{ target: "senses.darkvision", type: "set", value: 60 }] },
                { name: "Dagger", quantity: 2, definitionId: 2 }
            ]
        );
        expect(merged[0]).toEqual({ name: "Goggles of Night", equipped: false, notes: "old", modifiers: [{ target: "senses.darkvision", type: "set", value: 60 }] });
        expect(merged[1].definitionId).toBe(1);
        expect(merged[2].definitionId).toBe(2);
    });
});
