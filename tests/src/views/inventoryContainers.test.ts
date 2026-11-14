import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as clientWeights from "../../../src/rules/dnd5e_2024/itemWeightsAndContainers";
import * as serverWeights from "../../../server/services/itemWeightsAndContainers";
import { renderEquipment } from "../../../src/views/characterSheet/components/equipment";
import { initEquipmentController } from "../../../src/views/characterSheet/controllers/equipment.ctrl";
import {
    canPutInContainer,
    ensureInventoryItemsSynced,
    getCharacterWeightSummary,
    getContainerSummary,
    getInventoryKey,
    setItemEquippedWithContainerUnstow,
    stowItem
} from "../../../src/views/characterSheet/services/inventoryContainers";

let abortController: AbortController;
vi.mock("@elements", () => ({
    default: {
        get signal() { return abortController.signal; },
        get isAuth() { return false; },
        get currentUser() { return null; }
    }
}));

function makeCharacter(overrides: Record<string, any> = {}): any {
    return {
        id: "tga-test1",
        source: "site",
        name: "Tarin",
        level: 5,
        species: "Human",
        abilities: [
            { name: "Strength", abbr: "STR", score: 12, baseScore: 12, bonus: 0, modifier: 1, save: 1, proficientSave: false },
            { name: "Dexterity", abbr: "DEX", score: 14, baseScore: 14, bonus: 0, modifier: 2, save: 2, proficientSave: false },
            { name: "Constitution", abbr: "CON", score: 12, baseScore: 12, bonus: 0, modifier: 1, save: 1, proficientSave: false },
            { name: "Intelligence", abbr: "INT", score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false },
            { name: "Wisdom", abbr: "WIS", score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false },
            { name: "Charisma", abbr: "CHA", score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false }
        ],
        skills: [],
        vitals: {
            armorClass: 15,
            initiative: 2,
            speed: "30 ft.",
            maxHp: 35,
            currentHp: 35,
            proficiencyBonus: 3,
            spellSaveDc: 11,
            spellAttackBonus: 3,
            passivePerception: 10,
            passiveInvestigation: 10,
            passiveInsight: 10
        },
        weapons: [],
        equipment: [],
        spells: [],
        actions: [],
        features: [],
        ...overrides
    };
}

beforeEach(() => {
    abortController = new AbortController();
});

afterEach(() => {
    abortController.abort();
    document.body.innerHTML = "";
});

describe("client/server weight & container helper parity", () => {
    it("parses weights, formats labels, and resolves standard containers identically", () => {
        for (const raw of ["5 lb.", "1/4 lb", "1,500 lbs", 15, "0.5", null]) {
            expect(clientWeights.parseWeightLb(raw as any)).toBe(serverWeights.parseWeightLb(raw as any));
        }
        expect([0, 0.5, 1, 8, 40].map((val) => clientWeights.formatWeightLb(val))).toEqual([
            "0 lbs",
            "0.5 lbs",
            "1 lb",
            "8 lbs",
            "40 lbs"
        ]);
        for (const name of ["Longsword", "+1 Longsword", "Backpack", "Bag of Holding", "Plate Armor", "Potion of Healing", "Unknown Relic"]) {
            expect(clientWeights.lookupItemWeightLb(name)).toBe(serverWeights.lookupItemWeightLb(name));
            expect(clientWeights.lookupContainerDefaults(name)).toEqual(serverWeights.lookupContainerDefaults(name));
            expect(clientWeights.isExtradimensionalContainerName(name)).toBe(serverWeights.isExtradimensionalContainerName(name));
        }

        expect(clientWeights.lookupItemWeightLb("Longsword")).toBe(3);
        expect(clientWeights.lookupItemWeightLb("+2 Greatsword")).toBe(6);
        expect(clientWeights.lookupContainerDefaults("Backpack")).toMatchObject({ isContainer: true, capacityWeight: 30 });
        expect(clientWeights.isExtradimensionalContainerName("Backpack")).toBe(false);
        expect(clientWeights.isExtradimensionalContainerName("Bag of Holding")).toBe(true);
        expect(clientWeights.lookupContainerDefaults("Bag of Holding")).toMatchObject({ isContainer: true, capacityWeight: 500, extradimensional: true });
    });
});

describe("inventory containers, recursive weights, and weapon sync", () => {
    it("mirrors weapons into equipment, fills missing weights/container defaults, and enforces unequipped when stowed", () => {
        const char = makeCharacter({
            weapons: [
                { id: 10, name: "Longsword", quantity: 1, equipped: true, category: "Martial Melee", damage: "1d8 Slashing", containerId: "id:1" }
            ],
            equipment: [
                { id: 1, name: "Backpack", quantity: 1, equipped: true, type: "Adventuring Gear" },
                { id: 2, name: "Torch", quantity: 3, equipped: false, type: "Adventuring Gear" }
            ]
        });

        ensureInventoryItemsSynced(char);

        expect(char.equipment[0].weight).toBe(5);
        expect(char.equipment[0].isContainer).toBe(true);
        expect(char.equipment[0].capacityWeight).toBe(30);
        expect(char.equipment[1].weight).toBe(1);

        const swordEquip = char.equipment.find((e: any) => e.name === "Longsword");
        expect(swordEquip).toBeDefined();
        expect(swordEquip.weight).toBe(3);
        expect(swordEquip.containerId).toBe("id:1");
        expect(swordEquip.equipped).toBe(false);
        expect(char.weapons[0].equipped).toBe(false);
    });

    it("computes recursive container weight (including container weight + nested containers + extradimensional contents) and total quantity", () => {
        const char = makeCharacter({
            equipment: [
                { id: 1, name: "Backpack", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 30, weight: 5 },
                { id: 2, name: "Pouch", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 6, weight: 1, containerId: "id:1" },
                { id: 3, name: "Arrow", quantity: 20, equipped: false, type: "Ammunition", weight: 0.05, containerId: "id:2" },
                { id: 4, name: "Rations (1 day)", quantity: 4, equipped: false, type: "Gear", weight: 2, containerId: "id:1" },
                { id: 5, name: "Bag of Holding", quantity: 1, equipped: true, type: "Wondrous item", isContainer: true, capacityWeight: 500, weight: 15 },
                { id: 6, name: "Chest", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 300, weight: 25, containerId: "id:5" },
                { id: 7, name: "Plate Armor", quantity: 2, equipped: false, type: "Heavy Armor", weight: 65, containerId: "id:6" }
            ]
        });

        ensureInventoryItemsSynced(char);

        const backpackSummary = getContainerSummary(char, "id:1")!;
        expect(backpackSummary.ownWeight).toBe(5);
        // Pouch (1) + 20 Arrows (1) + 4 Rations (8) = 10 contents; + Backpack (5) = 15
        expect(backpackSummary.contentsWeight).toBe(10);
        expect(backpackSummary.totalWeight).toBe(15);
        expect(backpackSummary.capacityWeight).toBe(30);
        expect(backpackSummary.isOverCapacity).toBe(false);
        // Pouch (1) + Arrows (20) + Rations (4) = 25 total quantity
        expect(backpackSummary.totalQuantity).toBe(25);

        const bohSummary = getContainerSummary(char, "id:5")!;
        // BoH own weight (15) + Chest (25) + 2x Plate Armor (130) = 170 lbs!
        expect(bohSummary.extradimensional).toBe(true);
        expect(bohSummary.totalWeight).toBe(170);
        expect(bohSummary.capacityWeight).toBe(500);
        expect(bohSummary.isOverCapacity).toBe(false);
        expect(bohSummary.totalQuantity).toBe(3);

        // Character carry load includes Backpack (15) + Bag of Holding's OWN weight (15) = 30 lbs (excludes Chest + Plate inside BoH)
        const charSummary = getCharacterWeightSummary(char);
        expect(charSummary.carriedWeight).toBe(30);
        expect(charSummary.carryingCapacity).toBe(180); // STR 12 * 15
        expect(charSummary.isEncumbered).toBe(false);
    });

    it("flags over-capacity containers and encumbered characters, and rejects cyclic nesting", () => {
        const char = makeCharacter({
            abilities: [{ name: "Strength", abbr: "STR", score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false }],
            equipment: [
                { id: 1, name: "Backpack", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 30, weight: 5 },
                { id: 2, name: "Belt Pouch", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 6, weight: 1, containerId: "id:1" },
                { id: 3, name: "Iron Pot", quantity: 3, equipped: false, type: "Gear", weight: 10, containerId: "id:2" },
                { id: 4, name: "Anvil", quantity: 1, equipped: false, type: "Gear", weight: 130 }
            ]
        });
        ensureInventoryItemsSynced(char);

        // Belt Pouch: 1 + 30 = 31 > 6
        expect(getContainerSummary(char, "id:2")!.isOverCapacity).toBe(true);
        // Backpack: 5 + 31 = 36 > 30
        expect(getContainerSummary(char, "id:1")!.isOverCapacity).toBe(true);

        // Reject putting Backpack into itself or into Belt Pouch (its child)
        expect(canPutInContainer(char, "id:1", "id:1")).toBe(false);
        expect(canPutInContainer(char, "id:1", "id:2")).toBe(false);
        expect(stowItem(char, "id:1", "id:2")).toBe(false);

        // Carried: 36 + 130 = 166 > STR 10 * 15 (150)
        const charSummary = getCharacterWeightSummary(char);
        expect(charSummary.carriedWeight).toBe(166);
        expect(charSummary.carryingCapacity).toBe(150);
        expect(charSummary.isEncumbered).toBe(true);
    });

    it("stows weapons & items with auto-unequip and automatically unstows them when equipped", () => {
        const char = makeCharacter({
            weapons: [
                { id: 20, name: "Rapier", quantity: 1, equipped: true, category: "Martial Melee", damage: "1d8 Piercing", weight: 2 }
            ],
            equipment: [
                { id: 10, name: "Backpack", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 30, weight: 5 }
            ]
        });

        ensureInventoryItemsSynced(char);
        const rapierEquip = char.equipment.find((e: any) => e.name === "Rapier")!;
        const rapierKey = getInventoryKey(rapierEquip, char.equipment);

        expect(stowItem(char, rapierKey, "id:10")).toBe(true);
        expect(rapierEquip.containerId).toBe("id:10");
        expect(rapierEquip.equipped).toBe(false);
        expect(char.weapons[0].containerId).toBe("id:10");
        expect(char.weapons[0].equipped).toBe(false);

        // Equipping from weapons takes both weapon and equipment twin out of the container
        setItemEquippedWithContainerUnstow(char, char.weapons[0], true);
        expect(char.weapons[0].equipped).toBe(true);
        expect(char.weapons[0].containerId).toBeUndefined();
        expect(rapierEquip.equipped).toBe(true);
        expect(rapierEquip.containerId).toBeUndefined();
    });
});

describe("inventory UI rendering & controller interactions", () => {
    it("renders weight banner, capacity breakdown trigger, nested container hierarchy, collapse toggle, stow select, and equip unstow", () => {
        const char = makeCharacter({
            weapons: [
                { id: 30, name: "Longsword", quantity: 1, equipped: true, category: "Martial Melee", damage: "1d8 Slashing", weight: 3 }
            ],
            equipment: [
                { id: 1, name: "Backpack", quantity: 1, equipped: false, type: "Container", isContainer: true, capacityWeight: 30, weight: 5 },
                { id: 2, name: "Rations (1 day)", quantity: 5, equipped: false, type: "Gear", weight: 2, containerId: "id:1" },
                { id: 3, name: "Plate Armor", quantity: 2, equipped: false, type: "Heavy Armor", weight: 65 },
                { id: 4, name: "Barrel", quantity: 1, equipped: false, type: "Gear", weight: 70 }
            ]
        });

        const sheet = document.createElement("div");
        sheet.innerHTML = `<div class="equipment-grid">${renderEquipment(char)}</div>`;
        document.body.appendChild(sheet);

        // 5 + 10 + 130 + 70 + 3 (Longsword) = 218 > 180 -> encumbered warning + breakdown button
        const banner = sheet.querySelector<HTMLElement>(".inventory-weight-banner")!;
        expect(banner.classList.contains("is-encumbered")).toBe(true);
        expect(banner.textContent).toContain("218");
        expect(banner.textContent).toContain("180");
        expect(banner.querySelector(".weight-warning-badge")).not.toBeNull();
        const capBtn = banner.querySelector<HTMLButtonElement>('[data-breakdown-kind="vital"][data-breakdown-key="carryingCapacity"]');
        expect(capBtn).not.toBeNull();

        // Container badge shows combined weight (5 + 10 = 15 / 30) and total quantity ("5 items")
        const backpackRow = sheet.querySelector<HTMLElement>('.equipment-row[data-item-key="id:1"]')!;
        expect(backpackRow.textContent).toContain("15");
        expect(backpackRow.textContent).toContain("30");
        expect(backpackRow.querySelector(".container-count-badge")?.textContent).toBe("5 items");

        const contents = sheet.querySelector<HTMLElement>('.container-contents[data-parent-key="id:1"]')!;
        expect(contents.querySelector('.equipment-row[data-item-key="id:2"]')).not.toBeNull();

        const persistEquipState = vi.fn(async () => {});
        const syncSheetStats = vi.fn();
        const inventoryChangedSpy = vi.fn();
        sheet.addEventListener("tga:inventory-changed", inventoryChangedSpy);

        initEquipmentController({
            sheet,
            getCharacter: () => char,
            openItemModal: vi.fn(async () => {}),
            persistEquipState,
            syncSheetStats,
            openManageItemsModal: vi.fn(async () => {}),
            openCustomItemModal: vi.fn(),
            setItemQuantity: vi.fn()
        } as any);

        // Collapse container -> hides .container-contents, retains combined weight & item count
        const collapseBtn = sheet.querySelector<HTMLButtonElement>('.container-collapse-btn[data-container-key="id:1"]')!;
        collapseBtn.click();
        expect(char.trackingState?.collapsedContainers?.["id:1"]).toBe(true);
        expect(sheet.querySelector('.container-contents[data-parent-key="id:1"]')).toBeNull();
        expect(sheet.querySelector('.equipment-row[data-item-key="id:1"] .container-count-badge')?.textContent).toBe("5 items");
        expect(inventoryChangedSpy).toHaveBeenCalled();

        // Expand container back
        sheet.querySelector<HTMLButtonElement>('.container-collapse-btn[data-container-key="id:1"]')!.click();
        expect(sheet.querySelector('.container-contents[data-parent-key="id:1"]')).not.toBeNull();

        // Stow equipped Longsword into Backpack -> unequipped & moved into .container-contents
        const swordSelect = sheet.querySelector<HTMLSelectElement>('.item-container-select[data-item-key="id:30"]')!;
        swordSelect.value = "id:1";
        swordSelect.dispatchEvent(new Event("change", { bubbles: true }));
        expect(char.weapons[0].equipped).toBe(false);
        expect(char.weapons[0].containerId).toBe("id:1");
        expect(persistEquipState).toHaveBeenCalledWith("item", encodeURIComponent("Longsword"), expect.any(String), false);
        expect(sheet.querySelector('.container-contents[data-parent-key="id:1"] .equipment-row[data-item-key="id:30"]')).not.toBeNull();
        expect(sheet.querySelector('.equipment-row[data-item-key="id:1"] .container-count-badge')?.textContent).toBe("6 items");

        // Click Equip on stowed Longsword -> automatically takes it out of Backpack
        const stowedEquipBtn = sheet.querySelector<HTMLButtonElement>('.equipment-row[data-item-key="id:30"] .equip-toggle-btn')!;
        stowedEquipBtn.click();
        expect(char.weapons[0].equipped).toBe(true);
        expect(char.weapons[0].containerId).toBeUndefined();
        expect(sheet.querySelector('.container-contents[data-parent-key="id:1"] .equipment-row[data-item-key="id:30"]')).toBeNull();
    });
});
