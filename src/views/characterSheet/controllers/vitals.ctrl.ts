import { CharacterSheetContext } from "./context";

export function initVitalsController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    const hpDisplay = ctx.sheet.querySelector<HTMLInputElement>("#hp-display");
    const tempHpDisplay = ctx.sheet.querySelector<HTMLInputElement>("#temp-hp-display");

    hpDisplay?.addEventListener("input", () => {
        const maxHp = ctx.getMaxHp();
        const next = Number(hpDisplay.value);
        const resolved = Number.isFinite(next) ? Math.max(0, Math.min(maxHp, Math.round(next))) : 0;
        ctx.setCurrentHp(resolved);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    tempHpDisplay?.addEventListener("input", () => {
        const next = Number(tempHpDisplay.value);
        const resolved = Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0;
        ctx.setTempHp(resolved);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    ctx.sheet.querySelectorAll<HTMLButtonElement>("[data-hp-delta]").forEach(btn => {
        btn.addEventListener("click", () => {
            const delta = Number(btn.getAttribute("data-hp-delta"));
            if (isNaN(delta)) return;
            ctx.applyHpDelta(delta);
            ctx.updateHpDisplay();
            ctx.persistTrackerSnapshot();
            ctx.scheduleDebouncedAutoSave();
        });
    });
}
