import { CharacterSheetContext } from "./context";

export function initResourcesController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

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

    // One delegated handler for every pip (re-rendered tabs bring new pips). A resource's pip and the same pip shown
    // beside an action that spends it share data-resource-key and data-pip-idx, so they change together.
    if (ctx.sheet.dataset.pipHandler !== "on") {
        ctx.sheet.dataset.pipHandler = "on";
        ctx.sheet.addEventListener("click", (e) => {
            const pip = (e.target as HTMLElement).closest<HTMLButtonElement>(".pip");
            if (!pip || !ctx.sheet.contains(pip)) return;
            const active = !pip.classList.contains("active");
            const key = pip.getAttribute("data-resource-key");
            const idx = pip.getAttribute("data-pip-idx");
            const twins = key && idx !== null
                ? Array.from(ctx.sheet.querySelectorAll<HTMLButtonElement>(`.pip[data-resource-key="${key}"][data-pip-idx="${idx}"]`))
                : [pip];
            twins.forEach(p => p.classList.toggle("active", active));
            ctx.updateSlotCounters();
            ctx.persistTrackerSnapshot();
        });
    }

    // Short Rest - resets Pact Magic and all features marked resetOn = 'short'
    ctx.sheet.querySelector<HTMLButtonElement>("#short-rest-btn")?.addEventListener("click", () => {
        ctx.sheet.querySelectorAll<HTMLButtonElement>("#pips-lvl-pact .pip").forEach(p => p.classList.add("active"));
        ctx.sheet.querySelectorAll<HTMLButtonElement>('.class-resource-tracker[data-reset-on="short"] .pip').forEach(p => p.classList.add("active"));
        ctx.updateSlotCounters();
        ctx.persistTrackerSnapshot();
    });

    // Long Rest - resets all spell slots, all class resources, hit points, and heroic inspiration
    ctx.sheet.querySelector<HTMLButtonElement>("#long-rest-btn")?.addEventListener("click", () => {
        // Everything but item charges that come back at dawn or by hand
        ctx.sheet.querySelectorAll<HTMLButtonElement>(".pip").forEach(p => {
            const reset = p.getAttribute("data-reset-on") || p.closest("[data-reset-on]")?.getAttribute("data-reset-on");
            if (reset !== "dawn" && reset !== "manual") p.classList.add("active");
        });
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
