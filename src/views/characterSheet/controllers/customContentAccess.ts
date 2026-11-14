import el from "@elements";

/**
 * Mirrors the server's rule for the Edit buttons: admins can edit any database spell or item,
 * everyone else only what they made through an Add Custom dialog. The server checks again on save.
 */
export function canEditDbEntry(entry: { id?: unknown; createdById?: unknown } | null | undefined): boolean {
    if (!entry || !Number.isInteger(Number(entry.id)) || Number(entry.id) <= 0) return false;
    const user = el.currentUser;
    if (!el.isAuth || !user) return false;
    if (user.isAdmin) return true;
    return entry.createdById !== null && entry.createdById !== undefined && Number(entry.createdById) === Number(user.id);
}

/** Selects a value, adding it as an option first when a database row carries one the dialog doesn't list. */
export function setSelectValue(select: HTMLSelectElement | null, value: string | undefined | null) {
    if (!select || value === undefined || value === null) return;
    if (!Array.from(select.options).some(o => o.value === value)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.add(option);
    }
    select.value = value;
}

/** The body only unlocks scrolling once no sheet dialog is left open. */
export function releaseBodyScrollIfNoDialogOpen(root: HTMLElement) {
    const anyOpen = Array.from(root.querySelectorAll<HTMLElement>('[role="dialog"]'))
        .some(d => !d.classList.contains("hidden") && d.getAttribute("aria-hidden") !== "true");
    if (!anyOpen) document.body.style.overflow = "";
}

/** The server sends `{ error }` bodies, which the request wrapper throws as-is. */
export function describeRequestError(error: any): string {
    return error?.error || error?.message || (typeof error === "string" ? error : "Something went wrong.");
}

/** " Also updated on 3 saved copies; 1 locked copy left as it was." from an edit's propagation counts */
export function describePropagation(propagation: { updated?: number; locked?: number } | null | undefined): string {
    if (!propagation) return "";
    const updated = Number(propagation.updated) || 0;
    const locked = Number(propagation.locked) || 0;
    const parts: string[] = [];
    if (updated > 0) parts.push(`updated on ${updated} saved ${updated === 1 ? "copy" : "copies"}`);
    if (locked > 0) parts.push(`${locked} locked ${locked === 1 ? "copy" : "copies"} left as ${locked === 1 ? "it was" : "they were"}`);
    return parts.length > 0 ? ` Also ${parts.join("; ")}.` : "";
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Where focus goes when an edit dialog closes over another dialog (Manage Spells, Manage Weapons/Items), which the
 * sheet's dialog focus handling leaves alone: back to the control that opened it, or, when a refresh replaced that
 * control, into the dialog still open. With no dialog left open, the sheet's own handling takes over.
 */
export function restoreFocusAfterClose(opener: HTMLElement | null, root: HTMLElement) {
    setTimeout(() => {
        if (opener && opener.isConnected && opener.getClientRects().length > 0) {
            opener.focus({ preventScroll: true });
            return;
        }
        const open = Array.from(root.querySelectorAll<HTMLElement>('[role="dialog"]'))
            .filter(d => !d.classList.contains("hidden") && d.getAttribute("aria-hidden") !== "true");
        open[open.length - 1]?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    }, 0);
}
