import { describe, expect, it } from "vitest";
import {
    SPECIES_2024,
    detectLineage,
    resolveSpeciesResources,
    speciesGrantedSpells,
    speciesMaxHpBonus,
    speciesResistances,
    speciesScaleValue
} from "../../../src/rules/dnd5e_2024";

const sp = (id: string) => SPECIES_2024.find((s) => s.id === id)!;
const lin = (id: string, lid: string) => sp(id).lineages!.find((l) => l.id === lid);

describe("species rules from species data", () => {
    it("resolves limited uses at the character's level", () => {
        const at = (id: string, level: number, pb: number, lineage?: string) =>
            resolveSpeciesResources(sp(id), lineage ? lin(id, lineage) : undefined, level, pb, () => 0).map((r) => `${r.name}:${r.total}:${r.resetOn}`);
        expect(at("dragonborn", 4, 2, "red")).toEqual(["Breath Weapon:2:long"]);
        expect(at("dragonborn", 5, 3, "red")).toEqual(["Breath Weapon:3:long", "Draconic Flight:1:long"]);
        expect(at("orc", 1, 2)).toEqual(["Adrenaline Rush:2:short", "Relentless Endurance:1:long"]);
        expect(at("aasimar", 2, 2)).toEqual(["Healing Hands:1:long"]);
        expect(at("aasimar", 3, 2)).toContain("Celestial Revelation:1:long");
        expect(at("human", 5, 3)).toEqual([]);
    });

    it("resolves resistances, hit points, spells, and scaling dice", () => {
        expect(speciesResistances(sp("dragonborn"), lin("dragonborn", "silver"), 1)).toEqual(["Cold"]);
        expect(speciesResistances(sp("tiefling"), lin("tiefling", "chthonic"), 1)).toEqual(["Necrotic"]);
        expect(speciesResistances(sp("aasimar"), undefined, 1)).toEqual(["Necrotic", "Radiant"]);
        expect(speciesMaxHpBonus(sp("dwarf"), undefined, 7)).toBe(7);
        expect(speciesGrantedSpells(sp("tiefling"), lin("tiefling", "infernal"), 3).map((g) => g.spellName)).toEqual(["Thaumaturgy", "Fire Bolt", "Hellish Rebuke"]);
        const breath = sp("dragonborn").traits.find((t) => t.name === "Breath Weapon")!;
        expect(speciesScaleValue(breath, 4)).toBe("1d10");
        expect(speciesScaleValue(breath, 11)).toBe("3d10");
    });

    it("picks the lineage the evidence fits from the lineage data", () => {
        expect(detectLineage(sp("tiefling"), { resistances: ["fire"], spellNames: ["hellish rebuke"] })?.id).toBe("infernal");
        expect(detectLineage(sp("elf"), { featureNames: ["Fleet of Foot"] })?.id).toBe("wood-elf");
        expect(detectLineage(sp("gnome"), { texts: ["Rock Gnome"] })?.id).toBe("rock-gnome");
        expect(detectLineage(sp("dragonborn"), { texts: ["Blue Dragonborn"] })?.id).toBe("blue");
        expect(detectLineage(sp("elf"), {})).toBeUndefined();
    });
});
