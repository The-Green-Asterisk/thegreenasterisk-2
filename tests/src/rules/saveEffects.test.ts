import { describe, expect, it } from "vitest";
import { cardText, effectsFromLegacyNotes, normalizeAgainst, rowText } from "../../../src/rules/dnd5e_2024/saveEffects";
import { parseDndBeyondCharacter } from "../../../src/views/characterSheet/characterAdapter";
import { renderSheetContent } from "../../../src/views/characterSheet/characterSheet.template";

describe("save effects", () => {
    it("reads different wordings of the same thing as one key, and keeps wording that says more", () => {
        expect(normalizeAgainst("to maintain Concentration.")).toBe("concentration");
        expect(normalizeAgainst("saving throws that you make to maintain Concentration.")).toBe("concentration");
        expect(normalizeAgainst("against being Charmed or Frightened")).toBe("charmed or frightened");
        expect(normalizeAgainst("you make to avoid or end the Poisoned condition")).toBe("poisoned");
        expect(normalizeAgainst("against spells")).toBe("spells");
        expect(normalizeAgainst("against being charmed, and magic can't put you to sleep")).toBe("against being charmed, and magic can't put you to sleep");
        expect(normalizeAgainst("")).toBeUndefined();
    });

    it("words effects for the card and the row", () => {
        expect(cardText({ ability: "con", effect: "advantage", against: "concentration", sources: [] })).toBe("Advantage: Concentration");
        expect(rowText({ effect: "advantage", against: "charmed or frightened", sources: [] })).toBe("Advantage on saving throws against Charmed or Frightened");
        expect(rowText({ ability: "con", effect: "advantage", against: "concentration", sources: [] })).toBe("Advantage on Constitution saving throws to maintain Concentration");
        expect(rowText({ effect: "bonus", value: 2, against: "spells", sources: [] })).toBe("+2 on saving throws against spells");
    });

    it("merges War Caster and Eldritch Mind from D&D Beyond into one note on the CON card, not in the row", () => {
        const char = parseDndBeyondCharacter({
            id: 1, name: "Test", baseHitPoints: 10,
            stats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: 12 })),
            classes: [{ level: 5, definition: { id: 10, name: "Warlock", hitDice: 8 } }],
            feats: [{ definition: { id: 900, name: "War Caster" } }],
            options: { class: [{ componentId: 77, definition: { id: 901, name: "Eldritch Mind" } }] },
            modifiers: {
                feat: [{ type: "advantage", subType: "constitution-saving-throws", restriction: "to maintain Concentration.", componentId: 900 }],
                class: [{ type: "advantage", subType: "constitution-saving-throws", restriction: "saving throws that you make to maintain Concentration.", componentId: 901 }]
            },
            inventory: []
        } as any, "1");
        const con = (char.saveEffects || []).filter((e) => e.ability === "con");
        expect(con).toHaveLength(1);
        expect(con[0].against).toBe("concentration");
        expect(con[0].sources).toEqual(expect.arrayContaining(["War Caster", "Eldritch Mind"]));

        const html = renderSheetContent(char);
        expect((html.match(/Advantage: Concentration/g) || []).length).toBe(1);
        expect(html).not.toMatch(/saving-throw-notes-text">[^<]*Concentration/);
    });

    it("turns the old three-way concentration notes into one effect", () => {
        const { effects, otherNotes } = effectsFromLegacyNotes(
            [{ abbr: "CON", notes: "Advantage on Concentration; Advantage (to maintain Concentration.); Advantage (saving throws that you make to maintain Concentration.)" }],
            ["Advantage on Constitution saves (to maintain Concentration.)", "Advantage on Constitution saves (saving throws that you make to maintain Concentration.)", "Initiative (Advantage)"]
        );
        expect(effects).toEqual([{ ability: "con", effect: "advantage", against: "concentration", sources: [] }]);
        expect(otherNotes).toEqual(["Initiative (Advantage)"]);
    });
});
