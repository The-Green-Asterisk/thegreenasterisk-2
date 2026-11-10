import { afterEach, describe, expect, it } from "vitest";
import { applyStatModifier } from "../../../src/rules/dnd5e_2024/statModifierEvaluator";
import { GENERAL_FEATS_2024, ORIGIN_FEATS_2024 } from "../../../src/rules/dnd5e_2024";
import { listSenses, resolveSenses, senseGrantsFrom } from "../../../src/rules/dnd5e_2024/senses";
import { speciesSenseGrants, speciesSenseSummary } from "../../../src/rules/dnd5e_2024/speciesRules";
import { SPECIES_2024 } from "../../../src/rules/dnd5e_2024";
import { setFeatRules } from "../../../src/services/classRules";
import { CharacterCreatorController } from "../../../src/views/characterCreator/characterCreator.ctrl";
import { parseDndBeyondCharacter } from "../../../src/views/characterSheet/characterAdapter";
import { renderSheetContent } from "../../../src/views/characterSheet/characterSheet.template";
import { serverRulesClasses } from "../views/serverRulesClasses";

/** A homebrew feat that adds a sense the sheet doesn't know and extends darkvision. */
const BAT_SENSE: any = {
    id: "bat-sense", name: "Bat Sense", category: "General", prerequisite: "", benefits: ["Echolocation 30 ft.; darkvision +30 ft."],
    modifiers: [
        { target: "senses.echolocation", type: "set", value: 30, label: "Echolocation" },
        { target: "vitals.darkvision", type: "bonus", value: 30 }
    ]
};

function gloomStalker(speciesId: string) {
    const ctrl = new CharacterCreatorController();
    ctrl.classes = serverRulesClasses();
    Object.assign(ctrl.state, {
        name: "Stalker", speciesId, lineageId: "", classId: "ranger", subclassId: "gloom-stalker",
        classes: [{ classId: "ranger", level: 3, subclassId: "gloom-stalker" }], level: 3
    });
    ctrl.syncStateClassProperties();
    return ctrl.buildPayload();
}

describe("special senses from rules data", () => {
    afterEach(() => setFeatRules(null));

    it("sets a sense to at least its range, and a bonus extends it or grants it", () => {
        const grants = senseGrantsFrom([
            { name: "A", modifiers: [{ target: "vitals.darkvision", type: "set", value: 60 }] },
            { name: "B", modifiers: [{ target: "vitals.darkvision", type: "bonus", value: 60 }, { target: "senses.tremorsense", type: "bonus", value: 10 }] }
        ]);
        expect(resolveSenses({ darkvision: 120 }, grants)).toEqual({ darkvision: 180, tremorsense: 10 });
        expect(resolveSenses({}, grants)).toEqual({ darkvision: 120, tremorsense: 10 });
    });

    it("gives a creator-built Gloom Stalker Umbral Sight on top of species darkvision, or as darkvision", () => {
        expect(gloomStalker("dwarf").vitals.darkvision).toBe("180 ft.");
        expect(gloomStalker("human").vitals.darkvision).toBe("60 ft.");
    });

    it("lets a feat add a sense the sheet doesn't know yet, and taking it away restores the senses", () => {
        const char: any = { vitals: { darkvision: "60 ft." }, abilities: [], skills: [] };
        for (const m of BAT_SENSE.modifiers) applyStatModifier(char, m, 1, "Bat Sense");
        expect(char.vitals.darkvision).toBe("90 ft.");
        expect(char.vitals.otherSenses).toEqual([{ key: "echolocation", label: "Echolocation", range: "30 ft." }]);
        expect(listSenses(char.vitals).map((s) => `${s.label} ${s.range}`)).toEqual(["Darkvision 90 ft.", "Echolocation 30 ft."]);
        for (const m of BAT_SENSE.modifiers) applyStatModifier(char, m, -1, "Bat Sense");
        expect(char.vitals.darkvision).toBe("60 ft.");
        expect(char.vitals.otherSenses).toBeUndefined();
    });

    it("reads a feat's senses on import and shows the new one on the sheet", () => {
        setFeatRules([...ORIGIN_FEATS_2024, ...GENERAL_FEATS_2024, BAT_SENSE]);
        const char = parseDndBeyondCharacter({
            id: 3, name: "Test", baseHitPoints: 10,
            stats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: 12 })),
            classes: [{ level: 4, definition: { id: 10, name: "Fighter", hitDice: 10 } }],
            feats: [{ definition: { id: 950, name: "Bat Sense" } }],
            modifiers: {},
            inventory: []
        } as any, "3");
        expect(char.vitals.darkvision).toBe("30 ft.");
        expect(char.vitals.otherSenses).toEqual([{ key: "echolocation", label: "Echolocation", range: "30 ft." }]);
        expect(renderSheetContent(char)).toMatch(/<span>Echolocation<\/span><strong>30 ft\.<\/strong>/);
    });

    it("takes species senses from the species data: darkvision, lineages, and level-gated trait senses", () => {
        const elf = SPECIES_2024.find((x) => x.id === "elf")!;
        const drow = elf.lineages!.find((l) => l.id === "drow");
        expect(resolveSenses({}, speciesSenseGrants(elf, undefined, 1))).toEqual({ darkvision: 60 });
        expect(resolveSenses({}, speciesSenseGrants(elf, drow, 1))).toEqual({ darkvision: 120 });

        const burrower: any = {
            id: "burrower", name: "Burrower", description: "", size: "Small", speed: 30, darkvision: "Darkvision 60 ft.",
            traits: [
                { name: "Earth Sense (Level 5)", description: "", minLevel: 5, modifiers: [{ target: "senses.tremorsense", type: "set", value: 30 }] },
                { name: "Deep Eyes", description: "", modifiers: [{ target: "vitals.darkvision", type: "bonus", value: 30 }] }
            ]
        };
        expect(resolveSenses({}, speciesSenseGrants(burrower, undefined, 1))).toEqual({ darkvision: 90 });
        expect(resolveSenses({}, speciesSenseGrants(burrower, undefined, 5))).toEqual({ darkvision: 90, tremorsense: 30 });
        expect(speciesSenseSummary(burrower)).toEqual(["Darkvision 90 ft."]);
    });

    it("gives an imported character its species' darkvision when D&D Beyond sent no sense", () => {
        const char = parseDndBeyondCharacter({
            id: 4, name: "Test", baseHitPoints: 10,
            race: { fullName: "Dwarf", baseName: "Dwarf", racialTraits: [] },
            stats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: 12 })),
            classes: [{ level: 1, definition: { id: 10, name: "Fighter", hitDice: 10 } }],
            modifiers: {},
            inventory: []
        } as any, "4");
        expect(char.vitals.darkvision).toBe("120 ft.");
    });
});
