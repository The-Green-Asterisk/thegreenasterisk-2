import el from "@elements";
/**
 * Keyboard focus for the sheet's dialogs (WCAG 2.1.2, 2.4.3): while one is open, Tab and Shift+Tab cycle within it;
 * when it closes, focus goes back to what had it before the dialog opened. A dialog is open when it's shown (no
 * "hidden" class) and not aria-hidden.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const isOpen = (d: HTMLElement) => !d.classList.contains("hidden") && d.getAttribute("aria-hidden") !== "true";

export function initDialogFocus(root: HTMLElement): void {
    if (root.dataset.dialogFocus === "on") return;
    root.dataset.dialogFocus = "on";

    const dialogs = () => Array.from(root.querySelectorAll<HTMLElement>('[role="dialog"]'));
    const openStack: HTMLElement[] = [];
    const returnTo = new Map<HTMLElement, HTMLElement | null>();
    let lastFocusOutside: HTMLElement | null = null;

    document.addEventListener("focusin", (e) => {
        const t = e.target as HTMLElement;
        if (t && !t.closest('[role="dialog"]')) lastFocusOutside = t;
    }, { signal: el.signal });

    const observer = new MutationObserver(() => {
        for (const d of dialogs()) {
            const idx = openStack.indexOf(d);
            if (isOpen(d) && idx === -1) {
                openStack.push(d);
                returnTo.set(d, lastFocusOutside);
            } else if (!isOpen(d) && idx !== -1) {
                openStack.splice(idx, 1);
                const target = returnTo.get(d);
                returnTo.delete(d);
                const active = document.activeElement as HTMLElement | null;
                const focusLost = !active || active === document.body || d.contains(active);
                if (focusLost && openStack.length === 0 && target && document.contains(target)) target.focus({ preventScroll: true });
            }
        }
    });
    for (const d of dialogs()) observer.observe(d, { attributes: true, attributeFilter: ["class", "aria-hidden"] });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Tab" || openStack.length === 0) return;
        const top = openStack[openStack.length - 1];
        const items = Array.from(top.querySelectorAll<HTMLElement>(FOCUSABLE))
            .filter((el) => !el.closest('.hidden, [hidden], [aria-hidden="true"]') && getComputedStyle(el).display !== "none");
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!active || !top.contains(active)) {
            e.preventDefault();
            first.focus();
        } else if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    }, { signal: el.signal });
}
