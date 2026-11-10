import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SEED_ITEM_MECHANICS } from "../../../server/services/database/itemMechanics";
import { setItemRules } from "../../../src/services/classRules";
import { parseDndBeyondCharacter } from "../../../src/views/characterSheet/characterAdapter";
import { renderSavingThrowNotes } from "../../../src/views/characterSheet/components/vitals";
import { applyMagicalItemBonuses, extractPlusBonus } from "../../../src/views/characterSheet/services/magicItemBonuses";

function siteChar(equipment: any[]): any {
    return {
        source: "site", level: 5, name: "T",
        abilities: ["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((abbr) => ({ name: abbr, abbr, score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false })),
        skills: [{ name: "Perception", stat: "WIS", bonus: 0, proficiency: "none" }],
        vitals: { armorClass: 10, initiative: 0, speed: "30 ft.", proficiencyBonus: 3, spellcastingAbility: "Charisma", spellSaveDc: 11, spellAttackBonus: 3, passivePerception: 10, passiveInvestigation: 10, passiveInsight: 10 },
        weapons: [], actions: [], equipment
    };
}
const item = (name: string, extra: any = {}) => ({ name, quantity: 1, equipped: true, type: "Wondrous item", ...extra });

describe("magic item effects from data", () => {
    beforeEach(() => setItemRules(SEED_ITEM_MECHANICS as any));
    afterEach(() => setItemRules(null));

    it("doesn't count an imported character's Cloak of Protection twice", () => {
        const c = parseDndBeyondCharacter({
            id: 9, name: "P", baseHitPoints: 10, race: { fullName: "Human", baseName: "Human", racialTraits: [] },
            stats: [1, 2, 3, 4, 5, 6].map((id) => ({ id, value: 10 })),
            classes: [{ level: 1, definition: { id: 10, name: "Wizard", hitDice: 6 } }],
            modifiers: { item: [{ type: "bonus", subType: "armor-class", value: 1, componentId: 800 }, { type: "bonus", subType: "saving-throws", value: 1, componentId: 800 }] },
            inventory: [{ id: 2, equipped: true, isAttuned: true, quantity: 1, definition: { id: 800, name: "Cloak of Protection", filterType: "Wondrous item", canAttune: true } }]
        } as any, "9");
        expect(c.vitals.armorClass).toBe(11);
        applyMagicalItemBonuses(c);
        applyMagicalItemBonuses(c);
        expect(c.vitals.armorClass).toBe(11);
    });

    it("gives a +N spellcasting focus its variant's bonus, and the war wand only attack", () => {
        const c = siteChar([item("Rod of the Pact Keeper, +2", { requiresAttunement: true, attuned: true })]);
        applyMagicalItemBonuses(c);
        expect(c.vitals.spellAttackBonus).toBe(3 + 0 + 2);
        expect(c.vitals.spellSaveDc).toBe(8 + 3 + 0 + 2);
        const w = siteChar([item("+1 Wand of the War Mage", { requiresAttunement: true, attuned: true })]);
        applyMagicalItemBonuses(w);
        expect(w.vitals.spellAttackBonus).toBe(4);
        expect(w.vitals.spellSaveDc).toBe(11);
    });

    it("applies Bracers of Defense only without armor or a shield, and stat items from data", () => {
        const bare = siteChar([item("Bracers of Defense", { requiresAttunement: true, attuned: true }), item("Belt of Fire Giant Strength", { requiresAttunement: true, attuned: true })]);
        applyMagicalItemBonuses(bare);
        expect(bare.vitals.armorClass).toBe(12);
        expect(bare.abilities[0].score).toBe(25);
        const armored = siteChar([item("Bracers of Defense", { requiresAttunement: true, attuned: true }), item("Chain Mail", { type: "Armor", filterType: "Armor" })]);
        applyMagicalItemBonuses(armored);
        expect(armored.vitals.armorClass).toBe(10);
    });

    it("notes Weapon of Warning's advantage on initiative instead of a made-up +2", () => {
        const c = siteChar([item("Weapon of Warning", { requiresAttunement: true, attuned: true })]);
        applyMagicalItemBonuses(c);
        expect(c.vitals.initiative).toBe(0);
        expect(c.itemRollNotes).toEqual(["Advantage on Initiative (Weapon of Warning)"]);
        expect(renderSavingThrowNotes(c)).toContain("Advantage on Initiative (Weapon of Warning)");
    });

    it("uses a custom item's own modifiers and ignores what an unknown item's description says", () => {
        const custom = siteChar([item("Ring of Warding", { modifiers: [{ target: "vitals.ac", type: "bonus", value: 2 }] })]);
        applyMagicalItemBonuses(custom);
        expect(custom.vitals.armorClass).toBe(12);
        const unknown = siteChar([item("Mystery Brooch", { description: "You gain a +1 bonus to AC and saving throws." })]);
        applyMagicalItemBonuses(unknown);
        expect(unknown.vitals.armorClass).toBe(10);
        expect(extractPlusBonus("Holy Avenger")).toBe(3);
    });
});
