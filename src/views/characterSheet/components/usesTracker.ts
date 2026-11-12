import { escapeHtml } from "@services/escape";
import { ActionItem, CharacterData, ClassResource } from "../characterData";

/**
 * A row of use pips shown next to the thing that has them (an action or an item). It is a class-resource-tracker, so
 * the sheet persists it, restores it, counts it, and resets it on rests (by data-reset-on) like any other resource.
 * Pips that share a key with a resource tracker mirror it.
 */
export function renderUsesTracker(label: string, key: string, total: number, resetOn: string, resetLabel?: string): string {
    if (total <= 0) return "";
    const resetText = resetLabel || (resetOn === "short" ? "Short or long rest" : resetOn === "long" ? "Long rest" : resetOn === "dawn" ? "Dawn" : "Manually");
    const pips = Array.from({ length: total })
        .map((_, i) => `<button type="button" class="pip active" data-resource-key="${key}" data-reset-on="${resetOn}" data-pip-idx="${i}" aria-label="${escapeHtml(label)} use ${i + 1}"></button>`)
        .join("");
    return `
        <div class="slot-tracker class-resource-tracker inline-uses" data-resource-key="${key}" data-reset-on="${resetOn}">
            <div class="slot-header">
                <span class="slot-name">Uses <span class="inline-uses-reset">(${resetText})</span></span>
                <span class="slot-count" aria-live="polite">${total} / ${total}</span>
            </div>
            <div class="slot-pips" role="group" aria-label="${escapeHtml(label)} uses">${pips}</div>
        </div>`;
}

/** The resources as the sheet lists them (the same list and keys renderSpellSlotsAndResources uses). */
export function sheetResources(data: CharacterData): Array<ClassResource & { key: string }> {
    const list: ClassResource[] = data.classResources && data.classResources.length > 0
        ? data.classResources
        : (data.bardicCount ? [{ name: "Bardic Inspiration (d8)", total: data.bardicCount, resetOn: "short", dieOrType: "d8", key: "bardic" }] : []);
    return list.map((r, i) => ({ ...r, key: r.key || `res-${i}` }));
}

/**
 * The resource an action spends: one with the action's name, or whose name is the part before or after a colon
 * ("Awakened Mind: Clairvoyant Combatant" spends "Clairvoyant Combatant"). Pools too large for pips (> 12) aren't linked.
 */
export function resourceForAction(data: CharacterData, action: ActionItem): (ClassResource & { key: string }) | undefined {
    const name = action.name.toLowerCase().trim();
    const parts = name.split(":").map((p) => p.trim());
    return sheetResources(data).find((r) => {
        const rn = r.name.toLowerCase().trim();
        return r.total > 0 && r.total <= 12 && (rn === name || parts.includes(rn) || rn.split(":")[0].trim() === name);
    });
}

/**
 * Puts the saved use state (trackingState.resourcePips) back on trackers inside `root` after a partial re-render, and
 * updates their counts.
 */
export function restoreUsePips(root: ParentNode, data: CharacterData): void {
    const state = data.trackingState?.resourcePips || {};
    root.querySelectorAll<HTMLElement>(".class-resource-tracker[data-resource-key]").forEach((tracker) => {
        const states = state[tracker.getAttribute("data-resource-key") || ""];
        const pips = tracker.querySelectorAll<HTMLButtonElement>(".pip");
        if (states) pips.forEach((pip, i) => pip.classList.toggle("active", states[i] !== false));
        const count = tracker.querySelector<HTMLElement>(".slot-count");
        if (count && pips.length) count.textContent = `${tracker.querySelectorAll(".pip.active").length} / ${pips.length}`;
    });
}
