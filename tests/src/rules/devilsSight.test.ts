import { beforeEach, describe, expect, it } from "vitest";
import { findClassOptionByName } from "../../../src/rules/dnd5e_2024/classOptions";
import { applyProgressionChoiceOption } from "../../../src/rules/dnd5e_2024/statModifierEvaluator";
import { setClassRules } from "../../../src/services/classRules";
import { parseDndBeyondCharacter } from "../../../src/views/characterSheet/characterAdapter";
import { serverRulesClasses } from "../views/serverRulesClasses";

describe("Devil's Sight from the class rules data", () => {
    beforeEach(() => setClassRules(serverRulesClasses()));

    it("gives a creator-built Warlock the Devil's Sight sense, not more darkvision, and takes it away again", () => {
        const option = findClassOptionByName("Devil's Sight")!;
        expect(option).toBeDefined();
        const char: any = { vitals: { darkvision: "60 ft." }, abilities: [], skills: [], features: [], spells: [] };
        applyProgressionChoiceOption(char, option as any, 1);
        expect(char.vitals.devilsSight).toBe("120 ft.");
        expect(char.vitals.darkvision).toBe("60 ft.");
        applyProgressionChoiceOption(char, option as any, -1);
        expect(char.vitals.devilsSight).toBeUndefined();
    });

    it("reads it on import from the invocation alone, curly apostrophe and all", () => {
        expect(findClassOptionByName("Devil’s Sight")?.name).toBe("Devil's Sight");
        const char = parseDndBeyondCharacter({
            id: 2, name: "Test", baseHitPoints: 10,
            stats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: 12 })),
            classes: [{ level: 5, definition: { id: 10, name: "Warlock", hitDice: 8 } }],
            options: { class: [{ componentId: 77, definition: { id: 901, name: "Devil’s Sight" } }] },
            modifiers: {},
            inventory: []
        } as any, "2");
        expect(char.vitals.devilsSight).toBe("120 ft.");
        expect(char.vitals.darkvision).not.toBe("120 ft.");
    });
});
