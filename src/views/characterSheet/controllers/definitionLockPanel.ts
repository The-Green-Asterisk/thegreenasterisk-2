/**
 * The "Keep through D&D Beyond reloads" panel in the Edit Spell / Weapon / Magic Item dialogs: one toggle per
 * field, like the character creator's locks. A field locks itself once it's changed from what was loaded, stays
 * locked if it was locked before, and the player's own toggle overrides either. Lock keys match the server's
 * SPELL_LOCK_COLUMNS / ITEM_LOCK_COLUMNS (server/services/definitionLocks.ts).
 */
export type LockField = { key: string; label: string; read: () => string };

export const DEFINITION_LOCK_NOTE = "D&amp;D Beyond reloads replace unlocked fields. Locked fields keep what you set here; fields you change lock automatically.";

export function renderLockPanel(id: string): string {
    return `
                        <fieldset class="form-section def-lock-section hidden" id="${id}">
                            <legend class="form-section-title"><i class="fa-solid fa-lock" aria-hidden="true"></i> Keep Through D&amp;D Beyond Reloads</legend>
                            <p class="form-field-hint">${DEFINITION_LOCK_NOTE}</p>
                            <ul class="def-lock-list"></ul>
                        </fieldset>`;
}

function parseLocks(raw: unknown): Record<string, boolean> {
    let parsed: unknown = raw;
    if (typeof raw === "string") {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return {};
        }
    }
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(Object.entries(parsed as Record<string, unknown>).filter(([, v]) => v === true).map(([k]) => [k, true]));
}

export function createLockPanel(container: HTMLElement | null, form: HTMLFormElement | null, fields: LockField[]) {
    let active = false;
    let loaded: Record<string, boolean> = {};
    let choices: Record<string, boolean> = {};
    let snapshot: Record<string, string> = {};
    const list = container?.querySelector<HTMLElement>(".def-lock-list") ?? null;

    const fieldFor = (key: string) => fields.find(f => f.key === key);
    const changed = (key: string) => snapshot[key] !== undefined && snapshot[key] !== fieldFor(key)?.read();
    const isOn = (key: string) => (typeof choices[key] === "boolean" ? choices[key] : !!loaded[key] || changed(key));

    function paint(button: HTMLButtonElement) {
        const on = isOn(button.dataset.defLockKey || "");
        button.classList.toggle("is-locked", on);
        button.setAttribute("aria-pressed", String(on));
        const icon = button.querySelector("i");
        if (icon) icon.className = `fa-solid ${on ? "fa-lock" : "fa-lock-open"}`;
    }

    function refresh() {
        if (!active || !list) return;
        list.querySelectorAll<HTMLButtonElement>(".def-lock-btn").forEach(paint);
    }

    container?.addEventListener("click", (event) => {
        const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(".def-lock-btn");
        if (!button) return;
        const key = button.dataset.defLockKey || "";
        choices[key] = !isOn(key);
        paint(button);
    });
    // Editing a field can lock it, so repaint after every change (the toggles' own clicks aren't edits)
    const onEdit = (event: Event) => {
        if (!(event.target as HTMLElement | null)?.closest?.(".def-lock-section")) setTimeout(refresh, 0);
    };
    form?.addEventListener("input", onEdit);
    form?.addEventListener("change", onEdit);
    form?.addEventListener("click", onEdit);

    return {
        /** Call once the form holds the row's values; `enabled` is false for homebrew, which D&D Beyond never reloads */
        start(lockedFields: unknown, enabled: boolean) {
            active = enabled;
            loaded = parseLocks(lockedFields);
            choices = {};
            snapshot = Object.fromEntries(fields.map(f => [f.key, f.read()]));
            container?.classList.toggle("hidden", !enabled);
            if (!enabled || !list) return;
            list.innerHTML = fields.map(f => `
                <li><button type="button" class="def-lock-btn" data-def-lock-key="${f.key}" aria-pressed="false" aria-label="Lock ${f.label}"><i class="fa-solid fa-lock-open" aria-hidden="true"></i> ${f.label}</button></li>`).join("");
            refresh();
        },
        stop() {
            active = false;
            container?.classList.add("hidden");
        },
        /** The locks to save, or undefined when the panel isn't in use (the server then keeps what it had) */
        locks(): Record<string, boolean> | undefined {
            if (!active) return undefined;
            return Object.fromEntries(fields.filter(f => isOn(f.key)).map(f => [f.key, true]));
        }
    };
}
