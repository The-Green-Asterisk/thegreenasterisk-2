import { CharacterSheetContext } from "./context";

export function initResourcesController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    const allPips = ctx.sheet.querySelectorAll<HTMLButtonElement>(".pip");
    const headerSlotMarkers = ctx.sheet.querySelectorAll<HTMLButtonElement>(".header-slot-marker-btn");

    headerSlotMarkers.forEach(marker => {
        marker.addEventListener("click", () => {
            const level = marker.getAttribute("data-header-slot-level");
            const idx = Number(marker.getAttribute("data-header-slot-idx") || "0");
            const selector = level === "pact"
                ? "#pips-lvl-pact .pip"
                : `#pips-lvl-${level} .pip`;
            const matchingPips = ctx.sheet.querySelectorAll<HTMLButtonElement>(selector);
            const targetPip = matchingPips[idx];
            if (!targetPip) return;
            targetPip.classList.toggle("active");
            ctx.updateSlotCounters();
            ctx.persistTrackerSnapshot();
        });
    });

    allPips.forEach(pip => {
        pip.addEventListener("click", () => {
            pip.classList.toggle("active");
            ctx.updateSlotCounters();
            ctx.persistTrackerSnapshot();
        });
    });

    // Short Rest - resets Pact Magic and all features marked resetOn = 'short'
    ctx.sheet.querySelector<HTMLButtonElement>("#short-rest-btn")?.addEventListener("click", () => {
        ctx.sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip").forEach(p => p.classList.add("active"));
        ctx.sheet.querySelectorAll<HTMLButtonElement>('.class-resource-tracker[data-reset-on="short"] .pip').forEach(p => p.classList.add("active"));
        ctx.updateSlotCounters();
        ctx.persistTrackerSnapshot();
    });

    // Long Rest - resets all spell slots, all class resources, hit points, and heroic inspiration
    ctx.sheet.querySelector<HTMLButtonElement>("#long-rest-btn")?.addEventListener("click", () => {
        allPips.forEach(p => p.classList.add("active"));
        ctx.sheet.querySelectorAll<HTMLButtonElement>(".class-resource-tracker .pip").forEach(p => p.classList.add("active"));
        ctx.setCurrentHp(ctx.getMaxHp());
        ctx.setTempHp(0);
        ctx.updateHpDisplay();
        ctx.updateSlotCounters();
        const inspirationToggle = ctx.sheet.querySelector<HTMLElement>("#inspiration-toggle");
        inspirationToggle?.classList.add("active");
        if (character) {
            character.vitals.heroicInspiration = true;
        }
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });
}
