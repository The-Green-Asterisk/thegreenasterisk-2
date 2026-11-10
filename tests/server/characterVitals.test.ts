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
