import { describe, expect, it, vi } from "vitest";

const putData = vi.fn(() => new Promise(() => { }));
vi.mock("@services/request", () => ({
    getData: vi.fn(async () => undefined),
    postData: vi.fn(() => new Promise(() => { })),
    putData
}));

describe("creator save", () => {
    it("sends one save per click however many times the Review step was drawn", async () => {
        const { CharacterCreatorController } = await import("../../../src/views/characterCreator/characterCreator.ctrl");
        const { characterCreatorTemplate } = await import("../../../src/views/characterCreator/characterCreator.template");
        const { bindNavigationEvents } = await import("../../../src/views/characterCreator/controllers/navigation.ctrl");
        const { serverRulesClasses } = await import("./serverRulesClasses");
        document.body.innerHTML = "";
        document.body.appendChild(characterCreatorTemplate());
        const ctrl = new CharacterCreatorController();
        ctrl.classes = serverRulesClasses();
        ctrl.state.name = "Once Only";
        ctrl.state.savedId = 5;
        bindNavigationEvents(ctrl);
        ctrl.renderStep(9);
        ctrl.renderStep(9);
        ctrl.renderStep(9);
        const btn = document.getElementById("creator-submit-btn") as HTMLButtonElement;
        btn.click();
        btn.disabled = false;
        btn.click();
        await Promise.resolve();
        expect(putData).toHaveBeenCalledTimes(1);
    });
});
