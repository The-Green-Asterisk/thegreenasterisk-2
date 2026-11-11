import { describe, expect, it, vi } from "vitest";
import { createLockPanel, renderLockPanel } from "../../../src/views/characterSheet/controllers/definitionLockPanel";
import { applyItemEditToCopies, applySpellEditToCopies, carryLockedCopiesAndLinks, databaseId } from "../../../src/views/characterSheet/services/characterCopies";

const character = (over: any = {}): any => ({ spells: [], weapons: [], equipment: [], ...over });

describe("database IDs", () => {
    it("accepts only positive whole numbers", () => {
        expect(databaseId(5)).toBe(5);
        expect(databaseId("7")).toBe(7);
        expect(databaseId("fire-bolt")).toBeUndefined();
        expect(databaseId(0)).toBeUndefined();
    });
});

describe("applying an edit to the open sheet", () => {
    it("updates linked and same-named unlinked spells, links them, and skips locked ones", () => {
        const char = character({
            spells: [
                { name: "Swamp Bolt", spellId: 5, source: "Class", description: "Old" },
                { name: "swamp bolt", source: "Feat", description: "Old" },
                { name: "Swamp Bolt", spellId: 5, locked: true, description: "Mine" },
                { name: "Swamp Bolt", spellId: 6, description: "A different spell with the same name" }
            ]
        });
        const result = applySpellEditToCopies(char, "Swamp Bolt", { id: 5, name: "Bayou Bolt", level: 2, description: "New", damageScaling: '[{"level":2,"dice":"3d6"}]' });
        expect(result).toEqual({ updated: 2, locked: 1 });
        expect(char.spells[0]).toMatchObject({ name: "Bayou Bolt", description: "New", source: "Class", spellId: 5 });
        expect(char.spells[0].damageScaling[0]).toMatchObject({ level: 2, dice: "3d6", label: "Level 2" });
        expect(char.spells[1]).toMatchObject({ name: "Bayou Bolt", spellId: 5, source: "Feat" });
        expect(char.spells[2]).toMatchObject({ name: "Swamp Bolt", description: "Mine" });
        expect(char.spells[3].description).toBe("A different spell with the same name");
    });

    it("updates weapons and gear, keeping a weapon's mastery progress", () => {
        const char = character({
            weapons: [{ name: "Swamp Cleaver", itemId: 9, damage: "1d10 Slashing", mastery: { name: "Cleave", unlocked: false } }],
            equipment: [{ name: "Swamp Cleaver", itemId: 9, type: "Martial Melee" }, { name: "Swamp Cleaver", itemId: 9, locked: true, type: "Keep" }]
        });
        const result = applyItemEditToCopies(char, "Swamp Cleaver", { id: 9, name: "Bayou Cleaver", damage: "2d6 Slashing", properties: "Heavy", mastery: "Cleave", category: "Martial Melee" });
        expect(result).toEqual({ updated: 2, locked: 1 });
        expect(char.weapons[0]).toMatchObject({ name: "Bayou Cleaver", damageDie: "2d6", damageType: "Slashing", properties: ["Heavy"], mastery: { name: "Cleave", unlocked: false } });
        expect(char.equipment[0].name).toBe("Bayou Cleaver");
        expect(char.equipment[1]).toMatchObject({ name: "Swamp Cleaver", type: "Keep" });
    });
});

describe("refreshing from D&D Beyond", () => {
    it("brings back locked copies exactly, keeps locked ones D&D Beyond dropped, and carries links", () => {
        const before = character({
            spells: [
                { name: "Fireball", spellId: 3, locked: true, description: "House rules" },
                { name: "Shield", spellId: 4, description: "Old" },
                { name: "Homebrew Hex", spellId: 8, locked: true, description: "Ours" }
            ],
            weapons: [{ name: "Longsword", itemId: 9, locked: true, damage: "1d8 + 1 Slashing" }]
        });
        const refreshed = character({
            spells: [{ name: "Fireball", description: "Official" }, { name: "Shield", description: "Official" }],
            weapons: [{ name: "Longsword", damage: "1d8 Slashing" }]
        });
        carryLockedCopiesAndLinks(refreshed, before);
        expect(refreshed.spells[0]).toEqual(before.spells[0]);
        expect(refreshed.spells[0]).not.toBe(before.spells[0]);
        expect(refreshed.spells[1]).toEqual({ name: "Shield", description: "Official", spellId: 4 });
        expect(refreshed.spells[2].name).toBe("Homebrew Hex");
        expect(refreshed.weapons[0].damage).toBe("1d8 + 1 Slashing");
    });
});

describe("field lock panel", () => {
    function setup() {
        document.body.innerHTML = `<form id="f">${renderLockPanel("locks")}<input id="name" value="Fireball" /><textarea id="desc">Old</textarea></form>`;
        const form = document.getElementById("f") as HTMLFormElement;
        const container = document.getElementById("locks") as HTMLElement;
        const name = document.getElementById("name") as HTMLInputElement;
        const desc = document.getElementById("desc") as HTMLTextAreaElement;
        const panel = createLockPanel(container, form, [
            { key: "name", label: "Name", read: () => name.value },
            { key: "description", label: "Description", read: () => desc.value }
        ]);
        const button = (key: string) => container.querySelector<HTMLButtonElement>(`[data-def-lock-key="${key}"]`)!;
        return { panel, container, name, desc, button };
    }

    it("stays out of the way for homebrew", () => {
        const { panel, container } = setup();
        panel.start(null, false);
        expect(container.classList.contains("hidden")).toBe(true);
        expect(panel.locks()).toBeUndefined();
    });

    it("keeps saved locks, locks a field once it changes, and lets the player override either way", () => {
        vi.useFakeTimers();
        const { panel, container, desc, button } = setup();
        panel.start('{"name":true}', true);
        expect(container.classList.contains("hidden")).toBe(false);
        expect(button("name").getAttribute("aria-pressed")).toBe("true");
        expect(button("description").getAttribute("aria-label")).toBe("Lock Description");
        expect(panel.locks()).toEqual({ name: true });

        desc.value = "Edited";
        desc.dispatchEvent(new Event("input", { bubbles: true }));
        vi.runAllTimers();
        expect(button("description").getAttribute("aria-pressed")).toBe("true");
        expect(panel.locks()).toEqual({ name: true, description: true });

        button("description").click();
        button("name").click();
        expect(panel.locks()).toEqual({});
        vi.useRealTimers();
    });
});
