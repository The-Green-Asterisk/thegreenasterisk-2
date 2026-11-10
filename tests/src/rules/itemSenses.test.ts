import { afterEach, describe, expect, it } from "vitest";
import { setItemRules } from "../../../src/services/classRules";
import { parseDndBeyondCharacter } from "../../../src/views/characterSheet/characterAdapter";
import { applyItemSensesToCharacter } from "../../../src/views/characterSheet/services/magicItemBonuses";
import { serverRulesClasses } from "../views/serverRulesClasses";

const GOGGLES = { name: "Goggles of Night", modifiers: [{ target: "vitals.darkvision", type: "bonus" as const, value: 60 }] };

describe("special senses from magic items", () => {
    afterEach(() => setItemRules(null));

    it("applies an equipped item's senses from the item rules, and takes them away when unequipped", () => {
        setItemRules([GOGGLES]);
        const goggles: any = { name: "Goggles of Night", quantity: 1, equipped: true, type: "Wondrous item" };
        const char: any = { vitals: { darkvision: "60 ft." }, baseSenses: { darkvision: 60 }, senseGrants: [], equipment: [goggles], weapons: [] };
        applyItemSensesToCharacter(char);
        expect(char.vitals.darkvision).toBe("120 ft.");
        goggles.equipped = false;
        applyItemSensesToCharacter(char);
        expect(char.vitals.darkvision).toBe("60 ft.");
    });

    it("uses a custom item's own modifiers, including a new sense", () => {
        const char: any = {
            vitals: { darkvision: "None" }, baseSenses: {}, senseGrants: [], weapons: [],
            equipment: [{ name: "Bat Pendant", quantity: 1, equipped: true, type: "Wondrous item", modifiers: [{ target: "senses.echolocation", type: "set", value: 30, label: "Echolocation" }] }]
        };
        applyItemSensesToCharacter(char);
        expect(char.vitals.otherSenses).toEqual([{ key: "echolocation", label: "Echolocation", range: "30 ft." }]);
    });

    it("leaves characters without a recorded base alone, so an item isn't counted twice", () => {
        setItemRules([GOGGLES]);
        const char: any = { vitals: { darkvision: "120 ft." }, equipment: [{ name: "Goggles of Night", quantity: 1, equipped: true, type: "Wondrous item" }], weapons: [] };
        applyItemSensesToCharacter(char);
        expect(char.vitals.darkvision).toBe("120 ft.");
    });

    it("moves a D&D Beyond item's sense onto the item, counted only while it's equipped", () => {
        const raw = (equipped: boolean) => ({
            id: 5, name: "Test", baseHitPoints: 10,
            race: { fullName: "Human", baseName: "Human", racialTraits: [] },
            stats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: 12 })),
            classes: [{ level: 1, definition: { id: 10, name: "Fighter", hitDice: 10 } }],
            modifiers: { item: [{ type: "sense", subType: "darkvision", value: 60, componentId: 700 }] },
            inventory: [{
                id: 1, equipped, quantity: 1,
                definition: { id: 700, name: "Goggles of Night", filterType: "Wondrous item", grantedModifiers: [{ type: "sense", subType: "darkvision", value: 60, friendlySubtypeName: "Darkvision" }] }
            }]
        });
        const on = parseDndBeyondCharacter(raw(true) as any, "5");
        expect(on.vitals.darkvision).toBe("60 ft.");
        expect(on.equipment.find((e) => e.name === "Goggles of Night")?.modifiers?.[0]).toMatchObject({ target: "senses.darkvision", value: 60 });
        expect(on.baseSenses?.darkvision).toBeUndefined();
        const off = parseDndBeyondCharacter(raw(false) as any, "5");
        expect(off.vitals.darkvision).toBe("None");
    });

    it("has the Diviner's Third Eye give Darkvision 120 ft.", () => {
        const wizard = serverRulesClasses().find((c) => c.id === "wizard")!;
        const diviner: any = wizard.subclasses.find((s: any) => s.id === "diviner" || /divin/i.test(s.name));
        const options = (diviner.progression || []).flatMap((l: any) => (l.choices || []).flatMap((c: any) => c.options || []));
        expect(options.find((o: any) => o.id === "darkvision")?.modifiers?.[0]).toMatchObject({ target: "vitals.darkvision", type: "set", value: 120 });
    });
});
