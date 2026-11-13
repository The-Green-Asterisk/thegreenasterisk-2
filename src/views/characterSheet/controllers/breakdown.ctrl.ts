import el from "@elements";
import { Breakdown, breakdownFor, formatTotal, signed } from "../services/breakdown";
import { CharacterSheetContext } from "./context";

export const BREAKDOWN_HOVER_DELAY_MS = 1000;
export const BREAKDOWN_HOLD_DELAY_MS = 500;
const LEAVE_DELAY_MS = 250;
const HOLD_MOVE_TOLERANCE_PX = 10;

/**
 * Opens a breakdown pop-up for the sheet's .stat-breakdown-btn numbers: after a second of hovering or keyboard focus,
 * or after half a second of pressing on a touch screen. A click or tap stays free for rolling. Escape, moving away,
 * tapping elsewhere, or scrolling closes it. One set of listeners on the sheet covers every re-render.
 */
export function initBreakdownController(ctx: CharacterSheetContext) {
    const sheet = ctx.sheet;
    let popover: HTMLElement | null = null;
    let openFor: HTMLElement | null = null;
    let openTimer: number | undefined;
    let closeTimer: number | undefined;
    let holdTimer: number | undefined;
    let holdStart: { x: number; y: number } | null = null;
    let suppressNextClick = false;

    const buttonOf = (target: EventTarget | null): HTMLElement | null =>
        target instanceof Element ? target.closest<HTMLElement>(".stat-breakdown-btn") : null;

    const clearOpen = () => { window.clearTimeout(openTimer); openTimer = undefined; };
    const clearClose = () => { window.clearTimeout(closeTimer); closeTimer = undefined; };
    const clearHold = () => { window.clearTimeout(holdTimer); holdTimer = undefined; holdStart = null; };

    function build(breakdown: Breakdown): HTMLElement {
        const box = document.createElement("div");
        box.className = "stat-breakdown";
        box.setAttribute("aria-hidden", "true");
        const title = document.createElement("div");
        title.className = "stat-breakdown-title";
        title.textContent = breakdown.title;
        box.appendChild(title);

        const table = document.createElement("table");
        const body = document.createElement("tbody");
        for (const line of breakdown.lines) {
            const row = document.createElement("tr");
            const name = document.createElement("th");
            name.scope = "row";
            name.textContent = line.label;
            const value = document.createElement("td");
            value.textContent = signed(line.value);
            if (line.overridden) {
                row.className = "is-overridden";
                const note = document.createElement("span");
                note.className = "stat-breakdown-note";
                note.textContent = `overridden by ${line.overridden}`;
                name.appendChild(note);
            }
            row.append(name, value);
            body.appendChild(row);
        }
        table.appendChild(body);
        const foot = document.createElement("tfoot");
        const totalRow = document.createElement("tr");
        const totalName = document.createElement("th");
        totalName.scope = "row";
        totalName.textContent = "Total";
        const totalValue = document.createElement("td");
        totalValue.textContent = formatTotal(breakdown);
        totalRow.append(totalName, totalValue);
        foot.appendChild(totalRow);
        table.appendChild(foot);
        box.appendChild(table);
        return box;
    }

    function place(button: HTMLElement) {
        if (!popover) return;
        const rect = button.getBoundingClientRect();
        const gap = 4;
        const width = popover.offsetWidth;
        const height = popover.offsetHeight;
        let left = rect.left;
        if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width);
        let top = rect.bottom + gap;
        if (top + height > window.innerHeight - 8 && rect.top - gap - height >= 8) top = rect.top - gap - height;
        popover.style.left = `${Math.round(left)}px`;
        popover.style.top = `${Math.round(top)}px`;
    }

    function close() {
        clearOpen();
        clearClose();
        popover?.remove();
        popover = null;
        openFor = null;
    }

    function open(button: HTMLElement) {
        clearOpen();
        clearClose();
        if (openFor === button && popover) return;
        close();
        const kind = button.getAttribute("data-breakdown-kind") || "";
        const key = button.getAttribute("data-breakdown-key") || "";
        const breakdown = breakdownFor(ctx.getCharacter(), kind, key);
        if (!breakdown) return;
        popover = build(breakdown);
        popover.addEventListener("mouseenter", clearClose, { signal: el.signal });
        popover.addEventListener("mouseleave", scheduleClose, { signal: el.signal });
        document.body.appendChild(popover);
        place(button);
        openFor = button;
    }

    function scheduleOpen(button: HTMLElement, delay: number) {
        clearOpen();
        openTimer = window.setTimeout(() => open(button), delay);
    }

    function scheduleClose() {
        clearClose();
        closeTimer = window.setTimeout(close, LEAVE_DELAY_MS);
    }

    // Mouse: hover for a second; moving into the pop-up keeps it open
    sheet.addEventListener("mouseover", (event) => {
        const button = buttonOf(event.target);
        if (!button) return;
        if (openFor === button) { clearClose(); return; }
        scheduleOpen(button, BREAKDOWN_HOVER_DELAY_MS);
    }, { signal: el.signal });
    sheet.addEventListener("mouseout", (event) => {
        const button = buttonOf(event.target);
        if (!button) return;
        const to = event.relatedTarget;
        if (to instanceof Node && button.contains(to)) return;
        clearOpen();
        if (openFor === button) scheduleClose();
    }, { signal: el.signal });

    // Keyboard: resting focus for a second, so tabbing past doesn't flash pop-ups
    sheet.addEventListener("focusin", (event) => {
        const button = buttonOf(event.target);
        if (button) scheduleOpen(button, BREAKDOWN_HOVER_DELAY_MS);
    }, { signal: el.signal });
    sheet.addEventListener("focusout", (event) => {
        const button = buttonOf(event.target);
        if (!button) return;
        clearOpen();
        if (openFor === button) close();
    }, { signal: el.signal });

    // Touch and pen: press and hold; the tap that ends it must not count as a click
    sheet.addEventListener("pointerdown", (event) => {
        suppressNextClick = false;
        if (event.pointerType === "mouse") return;
        const button = buttonOf(event.target);
        if (!button) return;
        clearHold();
        holdStart = { x: event.clientX, y: event.clientY };
        holdTimer = window.setTimeout(() => {
            holdTimer = undefined;
            holdStart = null;
            suppressNextClick = true;
            open(button);
        }, BREAKDOWN_HOLD_DELAY_MS);
    }, { signal: el.signal });
    sheet.addEventListener("pointerup", clearHold, { signal: el.signal });
    sheet.addEventListener("pointercancel", clearHold, { signal: el.signal });
    sheet.addEventListener("pointermove", (event) => {
        if (holdStart && (Math.abs(event.clientX - holdStart.x) > HOLD_MOVE_TOLERANCE_PX || Math.abs(event.clientY - holdStart.y) > HOLD_MOVE_TOLERANCE_PX)) clearHold();
    }, { signal: el.signal });
    sheet.addEventListener("contextmenu", (event) => {
        if (buttonOf(event.target)) event.preventDefault();
    }, { signal: el.signal });
    // Capture phase, so the tap that ends a press-and-hold never reaches a listener on the button itself (rolling)
    sheet.addEventListener("click", (event) => {
        if (!buttonOf(event.target) || !suppressNextClick) return;
        suppressNextClick = false;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, { capture: true, signal: el.signal });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !openFor) return;
        const button = openFor;
        close();
        button.focus();
    }, { signal: el.signal });
    document.addEventListener("pointerdown", (event) => {
        if (!popover) return;
        const target = event.target;
        if (target instanceof Node && (popover.contains(target) || openFor?.contains(target))) return;
        close();
    }, { signal: el.signal });
    window.addEventListener("scroll", () => { if (popover) close(); }, { passive: true, signal: el.signal });
    window.addEventListener("resize", () => { if (popover) close(); }, { signal: el.signal });

    // A re-render replaces the button the pop-up belongs to
    const observer = new MutationObserver(() => {
        if (openFor && !document.contains(openFor)) close();
    });
    observer.observe(sheet, { childList: true, subtree: true });
    el.signal.addEventListener("abort", () => observer.disconnect(), { once: true });
}
