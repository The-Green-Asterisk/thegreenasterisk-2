import { beforeEach, describe, expect, it, vi } from "vitest";

// Like the server, the saved row comes back with its charges as chargesJson
const asRow = (body: any) => ({ ...body, chargesJson: body.charges ? JSON.stringify(body.charges) : null });
const postData = vi.fn(async (_path: string, body: any) => ({ item: { id: 50, ...asRow(body) } }));
const putData = vi.fn(async (_path: string, body: any) => ({ item: asRow(body) }));
vi.mock("@services/request", () => ({ getData: vi.fn(async () => undefined), postData, putData }));

const auth = { isAuth: true, currentUser: { id: 7, isAdmin: false } as any };
vi.mock("@elements", () => ({
    default: {
        get isAuth() { return auth.isAuth; },
        get currentUser() { return auth.currentUser; }
    }
}));

async function setup(character: any = null) {
    const { renderCustomItemModal } = await import("../../../src/views/characterSheet/components/customItemModal");
    const { initCustomItemModals } = await import("../../../src/views/characterSheet/controllers/customItemModals.ctrl");
    const sheet = document.createElement("div");
    sheet.innerHTML = renderCustomItemModal("weapon") + renderCustomItemModal("magic-item");
    document.body.innerHTML = "";
    document.body.appendChild(sheet);
    const addItemToCharacter = vi.fn();
    const ctx: any = {
        sheet,
        getCharacter: () => character,
        syncSheetStats: vi.fn(),
        persistTrackerSnapshot: vi.fn(),
        scheduleDebouncedAutoSave: vi.fn()
    };
    const modals = initCustomItemModals(ctx, { addItemToCharacter, refreshSheetItemsView: vi.fn() });
    const $ = <T extends HTMLElement = HTMLInputElement>(id: string) => sheet.querySelector<T>(`#${id}`)!;
    const submit = async (kind: string) => {
        $(`${kind}-form`).dispatchEvent(new Event("submit", { cancelable: true }));
        await new Promise(r => setTimeout(r, 0));
    };
    return { modals, $, submit, addItemToCharacter };
}

beforeEach(() => {
    postData.mockClear();
    putData.mockClear();
    auth.isAuth = true;
    auth.currentUser = { id: 7, isAdmin: false };
});

describe("weapon damage parsing", () => {
    it("splits dice from a known damage type, and leaves anything else as dice", async () => {
        const { splitWeaponDamage } = await import("../../../src/views/characterSheet/controllers/customItemModals.ctrl");
        expect(splitWeaponDamage("1d8 Slashing")).toEqual({ dice: "1d8", type: "Slashing" });
        expect(splitWeaponDamage("2d6 + 1 piercing")).toEqual({ dice: "2d6 + 1", type: "Piercing" });
        expect(splitWeaponDamage("1d4")).toEqual({ dice: "1d4" });
    });

    it("sends weapons to the weapon dialog and everything else to the magic item one", async () => {
        const { customItemKindFor } = await import("../../../src/views/characterSheet/controllers/customItemModals.ctrl");
        expect(customItemKindFor({ filterType: "Weapon" })).toBe("weapon");
        expect(customItemKindFor({ filterType: "Item", category: "Martial Ranged" })).toBe("weapon");
        expect(customItemKindFor({ filterType: "Wondrous item" })).toBe("magic-item");
        expect(customItemKindFor({ filterType: "Potion", category: "Potion" })).toBe("magic-item");
    });
});

describe("custom weapon dialog", () => {
    it("adds a new weapon to the database and the sheet", async () => {
        const { modals, $, submit, addItemToCharacter } = await setup({ weapons: [], equipment: [] });
        modals.open("weapon");
        expect($("custom-weapon-title").textContent).toBe("Add Custom Weapon");
        $("custom-weapon-name").value = "Swamp Cleaver";
        $<HTMLSelectElement>("custom-weapon-category").value = "Martial Melee";
        $("custom-weapon-damage-dice").value = "1d10";
        $<HTMLSelectElement>("custom-weapon-damage-type").value = "Slashing";
        $("custom-weapon-properties").value = "Heavy,  Two-Handed";
        $<HTMLTextAreaElement>("custom-weapon-description").value = "Chops reeds and regrets.";
        await submit("custom-weapon");

        expect(postData).toHaveBeenCalledWith("/create-custom-item", expect.objectContaining({
            name: "Swamp Cleaver", filterType: "Weapon", category: "Martial Melee", damage: "1d10 Slashing", properties: "Heavy, Two-Handed"
        }));
        expect(addItemToCharacter).toHaveBeenCalledWith(expect.objectContaining({ id: 50, name: "Swamp Cleaver" }));
    });

    it("rejects damage dice that aren't dice", async () => {
        const { modals, $, submit } = await setup();
        modals.open("weapon");
        $("custom-weapon-name").value = "Bad Stick";
        $("custom-weapon-damage-dice").value = "lots";
        $<HTMLTextAreaElement>("custom-weapon-description").value = "Hmm.";
        await submit("custom-weapon");
        expect(postData).not.toHaveBeenCalled();
        expect($("custom-weapon-status").textContent).toContain("Damage Dice");
    });

    it("fills from the database row when editing, saves with its ID, and updates the sheet's copy", async () => {
        const character = {
            weapons: [{ name: "Swamp Cleaver", category: "Martial Melee", damage: "1d10 Slashing", damageDie: "1d10", damageType: "Slashing", range: "5 ft.", properties: ["Heavy"], mastery: { name: "Cleave", unlocked: false } }],
            equipment: [{ name: "Swamp Cleaver", type: "Martial Melee" }]
        };
        const { modals, $, submit } = await setup(character);
        modals.open("weapon", { id: 12, name: "Swamp Cleaver", filterType: "Weapon", category: "Martial Melee", damage: "1d10 Slashing", mastery: "Cleave", rarity: "Rare", isMagic: true, description: "Old", weight: 7 });

        expect($("custom-weapon-title").textContent).toBe("Edit Weapon");
        expect($("custom-weapon-damage-dice").value).toBe("1d10");
        expect($<HTMLSelectElement>("custom-weapon-mastery").value).toBe("Cleave");
        expect($("custom-weapon-is-magic").checked).toBe(true);

        $("custom-weapon-name").value = "Bayou Cleaver";
        $("custom-weapon-damage-dice").value = "2d6";
        await submit("custom-weapon");

        expect(postData).not.toHaveBeenCalled();
        expect(putData).toHaveBeenCalledWith("/edit-custom-item", expect.objectContaining({ id: 12, name: "Bayou Cleaver", damage: "2d6 Slashing" }));
        expect(character.weapons[0]).toMatchObject({ name: "Bayou Cleaver", damage: "2d6 Slashing", damageDie: "2d6", mastery: { name: "Cleave", unlocked: false } });
        expect(character.equipment[0].name).toBe("Bayou Cleaver");
    });

    it("won't submit while logged out", async () => {
        auth.isAuth = false;
        const { modals, $, submit } = await setup();
        modals.open("weapon");
        expect($("custom-weapon-status").textContent).toContain("Log in");
        $("custom-weapon-name").value = "Swamp Cleaver";
        $("custom-weapon-damage-dice").value = "1d10";
        $<HTMLTextAreaElement>("custom-weapon-description").value = "Chop.";
        await submit("custom-weapon");
        expect(postData).not.toHaveBeenCalled();
    });
});

describe("custom magic item dialog", () => {
    it("keeps the combat fields it doesn't show when editing, and lists an item type it doesn't know", async () => {
        const { modals, $, submit } = await setup();
        modals.open("magic-item", { id: 30, name: "Ring of Mud", filterType: "Gear", category: "Ring", damage: "1d4 Acid", rarity: "Uncommon", isMagic: true, description: "Squelch" });
        expect($<HTMLSelectElement>("custom-magic-item-item-type").value).toBe("Gear");
        await submit("custom-magic-item");
        expect(putData).toHaveBeenCalledWith("/edit-custom-item", expect.objectContaining({ id: 30, filterType: "Gear", category: "Ring", damage: "1d4 Acid" }));
    });

    it("resets back to Add mode after an edit is closed", async () => {
        const { modals, $ } = await setup();
        modals.open("magic-item", { id: 30, name: "Ring of Mud", filterType: "Ring", description: "Squelch" });
        modals.close("magic-item");
        modals.open("magic-item");
        expect($("custom-magic-item-title").textContent).toBe("Add Custom Magic Item");
        expect($("custom-magic-item-name").value).toBe("");
    });
});

describe("edit permission on the client", () => {
    it("matches the server: creator or admin, never logged out, never without a database ID", async () => {
        const { canEditDbEntry } = await import("../../../src/views/characterSheet/controllers/customContentAccess");
        expect(canEditDbEntry({ id: 5, createdById: 7 })).toBe(true);
        expect(canEditDbEntry({ id: 5, createdById: 8 })).toBe(false);
        expect(canEditDbEntry({ id: 5, createdById: null })).toBe(false);
        expect(canEditDbEntry({ id: "fire-bolt", createdById: 7 })).toBe(false);
        auth.currentUser = { id: 1, isAdmin: true };
        expect(canEditDbEntry({ id: 5, createdById: null })).toBe(true);
        auth.isAuth = false;
        expect(canEditDbEntry({ id: 5, createdById: 7 })).toBe(false);
    });
});

describe("item effects in the dialogs", () => {
    const selectEl = (row: Element, cls: string) => row.querySelector<HTMLSelectElement>(`.${cls}`)!;
    const change = (el: HTMLElement) => el.dispatchEvent(new Event("change", { bubbles: true }));

    it("shows the effects an item follows from the seed list, and doesn't send them back unless they change", async () => {
        const { setItemRules, findItemRule } = await import("../../../src/services/classRules");
        setItemRules([{ name: "Cloak of Protection", modifiers: [{ target: "vitals.ac", type: "bonus", value: 1 }, { target: "saves.all", type: "bonus", value: 1 }] as any }]);
        const { modals, $, submit } = await setup();
        modals.open("magic-item", { id: 4, name: "Cloak of Protection", filterType: "Wondrous item", requiresAttunement: true, description: "Warm", isCustom: false, modifiersJson: null });

        const rows = $("custom-magic-item-effects-list").querySelectorAll(".item-effect-row");
        expect(rows).toHaveLength(2);
        expect(selectEl(rows[0], "effect-target").value).toBe("vitals.ac");
        expect(rows[0].querySelector<HTMLInputElement>(".effect-value")!.value).toBe("1");
        expect($("custom-magic-item-effects-hint").textContent).toContain("equipped and attuned");

        await submit("custom-magic-item");
        expect(putData.mock.calls[0][1]).not.toHaveProperty("modifiers");

        modals.open("magic-item", { id: 4, name: "Cloak of Protection", filterType: "Wondrous item", description: "Warm", isCustom: false, modifiersJson: null });
        const value = $("custom-magic-item-effects-list").querySelector<HTMLInputElement>(".effect-value")!;
        value.value = "2";
        await submit("custom-magic-item");
        expect(putData.mock.calls[1][1].modifiers).toEqual([{ target: "vitals.ac", type: "bonus", value: 2 }, { target: "saves.all", type: "bonus", value: 1 }]);
        expect(findItemRule("Cloak of Protection")?.modifiers[0].value).toBe(2);
    });

    it("takes seed effects along when the item is renamed, since the seed matches by name", async () => {
        const { setItemRules, findItemRule } = await import("../../../src/services/classRules");
        setItemRules([{ name: "Ring of Protection", modifiers: [{ target: "vitals.ac", type: "bonus", value: 1 }] as any }]);
        const { modals, $, submit } = await setup();
        modals.open("magic-item", { id: 5, name: "Ring of Protection", filterType: "Ring", description: "Shiny", modifiersJson: null });
        $("custom-magic-item-name").value = "Ring of Warding";
        await submit("custom-magic-item");
        expect(putData.mock.calls[0][1].modifiers).toEqual([{ target: "vitals.ac", type: "bonus", value: 1 }]);
        expect(findItemRule("Ring of Warding")?.modifiers).toHaveLength(1);
        expect(findItemRule("Ring of Protection")).toBeUndefined();
    });

    it("builds effects from the controls: ability set, AC by armor state, the item's +N, and advantage", async () => {
        const { modals, $, submit } = await setup({ weapons: [], equipment: [] });
        modals.open("magic-item");
        const add = $<HTMLButtonElement>("custom-magic-item-effects-add-btn");
        const list = $("custom-magic-item-effects-list");
        const fill = (i: number, target: string, type?: string) => {
            const row = list.querySelectorAll(".item-effect-row")[i];
            selectEl(row, "effect-target").value = target;
            change(selectEl(row, "effect-target"));
            if (type) {
                selectEl(row, "effect-type").value = type;
                change(selectEl(row, "effect-type"));
            }
            return row;
        };
        for (let i = 0; i < 4; i++) add.click();
        fill(0, "abilities.str", "set").querySelector<HTMLInputElement>(".effect-value")!.value = "19";
        const ac = fill(1, "vitals.ac");
        ac.querySelector<HTMLInputElement>(".effect-value")!.value = "2";
        selectEl(ac, "effect-requires").value = "no-armor-or-shield";
        const dc = fill(2, "spells.dc");
        const plus = dc.querySelector<HTMLInputElement>(".effect-plus")!;
        plus.checked = true;
        change(plus);
        const stealth = fill(3, "skills.stealth", "advantage");
        expect(stealth.querySelector(".effect-value-field")!.classList.contains("hidden")).toBe(true);
        expect(ac.querySelector(".effect-requires-field")!.classList.contains("hidden")).toBe(false);

        $("custom-magic-item-name").value = "Bayou Charm";
        $<HTMLTextAreaElement>("custom-magic-item-description").value = "Smells of swamp.";
        await submit("custom-magic-item");
        expect(postData.mock.calls[0][1].modifiers).toEqual([
            { target: "abilities.str", type: "set", value: 19 },
            { target: "vitals.ac", type: "bonus", value: 2, requires: "no-armor-or-shield" },
            { target: "spells.dc", type: "bonus", value: "{{plus}}" },
            { target: "skills.stealth", type: "advantage" }
        ]);
    });

    it("won't save an incomplete effect, and keeps effects it can't edit", async () => {
        const { modals, $, submit } = await setup();
        modals.open("magic-item", {
            id: 6, name: "Odd Idol", filterType: "Wondrous item", description: "Hmm",
            modifiersJson: JSON.stringify([{ target: "defenses.resistance", type: "set", value: "fire", description: "Resistance to fire" }])
        });
        const list = $("custom-magic-item-effects-list");
        expect(list.querySelector(".is-other")!.textContent).toContain("Resistance to fire");

        $<HTMLButtonElement>("custom-magic-item-effects-add-btn").click();
        await submit("custom-magic-item");
        expect(putData).not.toHaveBeenCalled();
        expect($("custom-magic-item-status").textContent).toContain("Choose a stat for effect 2");

        list.querySelectorAll<HTMLButtonElement>(".effect-remove-btn")[1].click();
        $<HTMLTextAreaElement>("custom-magic-item-description").value = "Hmm!";
        await submit("custom-magic-item");
        expect(putData.mock.calls[0][1]).not.toHaveProperty("modifiers");
    });
});

describe("item effects on character copies", () => {
    it("gives unlocked copies the new effects and freezes the old ones on locked copies", async () => {
        const { applyItemEditToCopies } = await import("../../../src/views/characterSheet/services/characterCopies");
        const char: any = { weapons: [], equipment: [{ name: "Belt", itemId: 9 }, { name: "Belt", itemId: 9, locked: true }] };
        applyItemEditToCopies(char, "Belt", { id: 9, name: "Belt" }, {
            modifiers: [{ target: "abilities.str", type: "set", value: 23 }],
            previousModifiers: [{ target: "abilities.str", type: "set", value: 21 }]
        });
        expect(char.equipment[0].modifiers[0].value).toBe(23);
        expect(char.equipment[1].modifiers[0].value).toBe(21);
    });
});

describe("item charges in the dialogs", () => {
    it("fills charges in when editing, sends them on save, and sends none when cleared", async () => {
        const { modals, $, submit } = await setup();
        modals.open("magic-item", { id: 8, name: "Wand of Mud", filterType: "Wand", description: "Squelch", chargesJson: '{"max":7,"resetOn":"dawn","resetLabel":"1d6 + 1 at dawn"}' });
        expect($("custom-magic-item-charges-max").value).toBe("7");
        expect($<HTMLSelectElement>("custom-magic-item-charges-reset").value).toBe("dawn");
        expect($("custom-magic-item-charges-label").value).toBe("1d6 + 1 at dawn");

        $("custom-magic-item-charges-max").value = "5";
        await submit("custom-magic-item");
        expect(putData.mock.calls[0][1].charges).toEqual({ max: 5, resetOn: "dawn", resetLabel: "1d6 + 1 at dawn" });

        modals.open("magic-item", { id: 8, name: "Wand of Mud", filterType: "Wand", description: "Squelch", chargesJson: '{"max":5,"resetOn":"dawn"}' });
        $("custom-magic-item-charges-max").value = "0";
        await submit("custom-magic-item");
        expect(putData.mock.calls[1][1].charges).toBeNull();
    });

    it("won't save a charge count that isn't a whole number from 0 to 99", async () => {
        const { modals, $, submit } = await setup();
        modals.open("magic-item", { id: 8, name: "Wand of Mud", filterType: "Wand", description: "Squelch" });
        $("custom-magic-item-charges-max").value = "2.5";
        await submit("custom-magic-item");
        expect(putData).not.toHaveBeenCalled();
        expect($("custom-magic-item-status").textContent).toContain("whole number from 0 to 99");
    });

    it("updates the open sheet's copies, keeping spent charges up to the new count, and skips a weapon's equipment twin", async () => {
        const character = {
            weapons: [{ name: "Staff of Bogs", itemId: 3, damage: "1d6 Bludgeoning", charges: { max: 10, used: 8, resetOn: "dawn" } }],
            equipment: [{ name: "Staff of Bogs", itemId: 3, type: "Staff" }, { name: "Wand of Mud", itemId: 8, type: "Wand", charges: { max: 7, used: 2, resetOn: "dawn" } }]
        };
        const { modals, $, submit } = await setup(character);
        modals.open("weapon", { id: 3, name: "Staff of Bogs", filterType: "Weapon", category: "Simple Melee", damage: "1d6 Bludgeoning", description: "Boggy", chargesJson: '{"max":10,"resetOn":"dawn"}' });
        $("custom-weapon-charges-max").value = "6";
        await submit("custom-weapon");
        expect(character.weapons[0].charges).toEqual({ max: 6, resetOn: "dawn", used: 6 });
        expect((character.equipment[0] as any).charges).toBeUndefined();

        modals.open("magic-item", { id: 8, name: "Wand of Mud", filterType: "Wand", description: "Squelch", chargesJson: '{"max":7,"resetOn":"dawn"}' });
        $("custom-magic-item-charges-max").value = "0";
        await submit("custom-magic-item");
        expect((character.equipment[1] as any).charges).toBeUndefined();
    });

    it("gives a new item its charges, all unspent", async () => {
        const { modals, $, submit, addItemToCharacter } = await setup({ weapons: [], equipment: [] });
        modals.open("magic-item");
        $("custom-magic-item-name").value = "Wand of Fog";
        $<HTMLTextAreaElement>("custom-magic-item-description").value = "Foggy.";
        $("custom-magic-item-charges-max").value = "3";
        await submit("custom-magic-item");
        expect(postData.mock.calls[0][1].charges).toEqual({ max: 3, resetOn: "long" });
        expect(addItemToCharacter).toHaveBeenCalled();
    });
});
