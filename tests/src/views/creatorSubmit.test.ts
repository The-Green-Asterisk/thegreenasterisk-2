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

    it("keeps skills the player added on the sheet when the character is saved again", async () => {
        // The save in flight from the test above never settles; fresh modules start without it
        vi.resetModules();
        putData.mockClear();
        const { CharacterCreatorController } = await import("../../../src/views/characterCreator/characterCreator.ctrl");
        const { characterCreatorTemplate } = await import("../../../src/views/characterCreator/characterCreator.template");
        const { bindNavigationEvents } = await import("../../../src/views/characterCreator/controllers/navigation.ctrl");
        const { serverRulesClasses } = await import("./serverRulesClasses");
        document.body.innerHTML = "";
        document.body.appendChild(characterCreatorTemplate());
        const ctrl = new CharacterCreatorController();
        ctrl.classes = serverRulesClasses();
        ctrl.state.name = "Keeps Cooking";
        ctrl.state.savedId = 6;
        ctrl.loadedCharacter = { skills: [
            { name: "Stealth", stat: "DEX", bonus: 9, proficiency: "expertise" },
            { name: "Cooking", stat: "WIS", bonus: 99, proficiency: "proficient", custom: true }
        ] };
        bindNavigationEvents(ctrl);
        ctrl.renderStep(9);
        (document.getElementById("creator-submit-btn") as HTMLButtonElement).click();
        await Promise.resolve();
        expect(putData).toHaveBeenCalledTimes(1);
        const body: any = (putData.mock.calls[0] as any[])[1];
        const skills: any[] = (body.character || body.payload || body).skills;
        expect(skills).toHaveLength(19);
        const cooking = skills.find((s) => s.name === "Cooking");
        const pb = Number((body.character || body.payload || body).vitals?.proficiencyBonus) || 2;
        expect(cooking).toEqual({ name: "Cooking", stat: "WIS", proficiency: "proficient", custom: true, bonus: ctrl.getAbilityModifier("wis") + pb });
        expect(skills.filter((s) => s.name === "Stealth")).toHaveLength(1);
    });

    it("counts a chosen fighting style in the weapon's attack bonus, named", async () => {
        vi.resetModules();
        putData.mockClear();
        const { CharacterCreatorController } = await import("../../../src/views/characterCreator/characterCreator.ctrl");
        const { characterCreatorTemplate } = await import("../../../src/views/characterCreator/characterCreator.template");
        const { bindNavigationEvents } = await import("../../../src/views/characterCreator/controllers/navigation.ctrl");
        const { serverRulesClasses } = await import("./serverRulesClasses");
        document.body.innerHTML = "";
        document.body.appendChild(characterCreatorTemplate());
        const ctrl = new CharacterCreatorController();
        ctrl.classes = serverRulesClasses();
        ctrl.state.name = "Arrow";
        ctrl.state.savedId = 7;
        bindNavigationEvents(ctrl);
        ctrl.renderStep(9);
        // Rendering fills in a default class; the fighter and the style go in after
        ctrl.state.classes = [{ classId: "fighter", level: 1, subclassId: "" } as any];
        ctrl.state.subclassFeatureChoices = { "fighter-1-fighting-style": "archery" };
        ctrl.state.selectedWeapons = ["Longbow", "Longsword"];
        (document.getElementById("creator-submit-btn") as HTMLButtonElement).click();
        await Promise.resolve();
        const body: any = (putData.mock.calls[0] as any[])[1];
        const character = body.character || body.payload || body;
        const bow = character.weapons.find((w: any) => w.name === "Longbow");
        const sword = character.weapons.find((w: any) => w.name === "Longsword");
        const dex = ctrl.getAbilityModifier("dex");
        const str = ctrl.getAbilityModifier("str");
        const pb = character.vitals.proficiencyBonus;
        expect(character.attackExtras.ranged).toEqual([{ label: expect.stringContaining("Archery"), value: 2 }]);
        expect(bow.toHitModifier).toBe(dex + pb + 2);
        expect(bow.attackParts.map((p: any) => p.value)).toEqual([dex, pb, 2]);
        expect(sword.toHitModifier).toBe(Math.max(str, str) + pb);
    });
});

