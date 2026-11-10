import { beforeEach, describe, expect, it } from "vitest";
import { CharacterCreatorController } from "../../../src/views/characterCreator/characterCreator.ctrl";
import {
    changedLockKeys,
    decorateStepLocks,
    effectiveLocks,
    keepPlayState,
    mergeImportedCharacter,
    snapshotLockGroups
} from "../../../src/views/characterCreator/services/importLocks";
import { serverRulesClasses } from "./serverRulesClasses";

describe("creator locks for characters imported from D&D Beyond", () => {
    let ctrl: CharacterCreatorController;

    beforeEach(() => {
        ctrl = new CharacterCreatorController();
        ctrl.classes = serverRulesClasses();
        ctrl.state.classId = "fighter";
        ctrl.state.classes = [{ classId: "fighter", level: 3, subclassId: "" }];
        ctrl.state.level = 3;
        ctrl.state.name = "Imported Hero";
        ctrl.state.dndBeyondId = "4242";
        ctrl.state.savedId = 9;
        const built = ctrl.buildPayload();
        ctrl.loadedCharacter = {
            ...JSON.parse(JSON.stringify(built)),
            id: 4242,
            source: "dndbeyond",
            equipment: [{ name: "Homebrew Lute of Doom", quantity: 1, equipped: true }],
            proficiencies: { ...built.proficiencies, languages: ["Common", "Elvish"] },
            vitals: { ...built.vitals, maxHp: built.vitals.maxHp + 5, currentHp: 10, tempHp: 4 },
            trackingState: { heroicInspiration: true }
        };
        ctrl.loadedLocks = { background: true };
        ctrl.state.lockChoices = {};
        snapshotLockGroups(ctrl);
    });

    it("locks changed fields automatically, keeps locks from load, and lets the player unlock", () => {
        expect(changedLockKeys(ctrl)).toEqual([]);
        ctrl.state.name = "Renamed Hero";
        ctrl.state.details = { age: "40" };
        expect(changedLockKeys(ctrl)).toEqual(["name", "details.age"]);
        expect(effectiveLocks(ctrl)).toEqual({ name: true, "details.age": true, background: true });
        ctrl.state.lockChoices = { name: false, spells: true };
        expect(effectiveLocks(ctrl)).toEqual({ "details.age": true, background: true, spells: true });
    });

    it("saves only identity changes onto the loaded character, keeping what the creator doesn't make", () => {
        ctrl.state.name = "Renamed Hero";
        const out = mergeImportedCharacter(ctrl, ctrl.buildPayload());
        expect(out.name).toBe("Renamed Hero");
        expect(out.equipment.map((e: any) => e.name)).toEqual(["Homebrew Lute of Doom"]);
        expect(out.proficiencies.languages).toEqual(["Common", "Elvish"]);
        expect(out.source).toBe("dndbeyond");
        expect(out.id).toBe(4242);
        expect(out.lockedFields).toEqual({ name: true, background: true });
        expect(out.vitals.currentHp).toBe(10);
        expect(out.vitals.tempHp).toBe(4);
        expect(out.trackingState).toEqual({ heroicInspiration: true });
    });

    it("rebuilds from the creator when the class changes, keeping languages and D&D Beyond's hit point difference", () => {
        const before = ctrl.getMaxHp();
        ctrl.state.classes = [{ classId: "fighter", level: 4, subclassId: "" }];
        ctrl.state.level = 4;
        const loadedMax = ctrl.loadedCharacter.vitals.maxHp;
        const out = mergeImportedCharacter(ctrl, ctrl.buildPayload());
        expect(out.level).toBe(4);
        expect(out.proficiencies.languages).toEqual(expect.arrayContaining(["Common", "Elvish"]));
        expect(ctrl.getMaxHp()).toBeGreaterThan(before);
        expect(out.vitals.maxHp).toBe(loadedMax + (ctrl.getMaxHp() - before));
        expect(out.lockedFields.classes).toBe(true);
        expect(out.equipment.map((e: any) => e.name)).toEqual(["Homebrew Lute of Doom"]);
        expect(out.source).toBe("dndbeyond");
    });

    it("moves current hit points with the maximum when saving an existing character", () => {
        const payload: any = { vitals: { maxHp: 30, currentHp: 30, tempHp: 0 } };
        keepPlayState({ vitals: { maxHp: 25, currentHp: 12, tempHp: 3 }, activeConditions: ["Prone"] }, payload);
        expect(payload.vitals.currentHp).toBe(17);
        expect(payload.vitals.tempHp).toBe(3);
        expect(payload.activeConditions).toEqual(["Prone"]);
    });

    it("shows lock toggles only for imported characters", () => {
        const root = document.createElement("div");
        root.innerHTML = ctrl.renderStep1Identity();
        decorateStepLocks(ctrl, 1, root);
        const name = root.querySelector<HTMLButtonElement>('.creator-lock-btn[data-lock-key="name"]');
        expect(name?.getAttribute("aria-label")).toBe("Lock Character Name");
        expect(name?.getAttribute("aria-pressed")).toBe("false");
        expect(root.querySelector('.creator-lock-btn[data-lock-key="notes.backstory"]')).not.toBeNull();

        ctrl.state.dndBeyondId = undefined;
        const plain = document.createElement("div");
        plain.innerHTML = ctrl.renderStep1Identity();
        decorateStepLocks(ctrl, 1, plain);
        expect(plain.querySelector(".creator-lock-btn")).toBeNull();
    });
});
