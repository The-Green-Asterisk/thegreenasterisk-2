import { beforeEach, describe, expect, it, vi } from "vitest";

const postData = vi.fn(async (_path: string, body: any) => ({ item: { id: 50, ...body } }));
const putData = vi.fn(async (_path: string, body: any) => ({ item: { ...body } }));
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
