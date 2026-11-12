import el from "@elements";
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

    // Sticky vitals bar HP input listeners
    const stickyHpDisplay = ctx.sheet.querySelector<HTMLInputElement>("#sticky-hp-display");
    const stickyTempHpDisplay = ctx.sheet.querySelector<HTMLInputElement>("#sticky-temp-hp-display");

    stickyHpDisplay?.addEventListener("input", (e) => {
        e.stopPropagation();
        const maxHp = ctx.getMaxHp();
        const next = Number(stickyHpDisplay.value);
        const resolved = Number.isFinite(next) ? Math.max(0, Math.min(maxHp, Math.round(next))) : 0;
        ctx.setCurrentHp(resolved);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    stickyTempHpDisplay?.addEventListener("input", (e) => {
        e.stopPropagation();
        const next = Number(stickyTempHpDisplay.value);
        const resolved = Number.isFinite(next) ? Math.max(0, Math.round(next)) : 0;
        ctx.setTempHp(resolved);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    ctx.sheet.querySelectorAll<HTMLButtonElement>("[data-hp-delta]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const delta = Number(btn.getAttribute("data-hp-delta"));
            if (isNaN(delta)) return;
            ctx.applyHpDelta(delta);
            ctx.updateHpDisplay();
            ctx.persistTrackerSnapshot();
            ctx.scheduleDebouncedAutoSave();
        });
    });

    // Sticky vitals bar scroll-to-top on click, preserving input/button interaction
    const stickyBar = ctx.sheet.querySelector<HTMLElement>("#sticky-vitals-bar");
    stickyBar?.querySelectorAll<HTMLElement>("input, label, button").forEach(el => {
        el.addEventListener("click", (e) => e.stopPropagation());
    });

    stickyBar?.addEventListener("click", (e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest("button, input, label")) {
            return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Sticky bar scroll detection: morph into sticky bar when scrolling past the vitals section
    function getNavBottom(): number {
        const nav = el.nav;
        if (!nav) return 0;
        const isHidden = nav.style.display === "none" || window.getComputedStyle(nav).display === "none";
        if (isHidden) return 0;
        const rect = nav.getBoundingClientRect();
        return rect.bottom > 0 ? Math.ceil(rect.bottom) : 0;
    }

    function checkStickyVitals() {
        const bar = ctx.sheet.querySelector<HTMLElement>("#sticky-vitals-bar");
        const vitalsSection = ctx.sheet.querySelector<HTMLElement>(".vitals-section");
        if (!bar || !vitalsSection) return;

        const navBottom = getNavBottom();
        bar.style.top = `${navBottom}px`;

        const vitalsRect = vitalsSection.getBoundingClientRect();
        // Morphs into sticky bar when the sheet scrolls past the vitals section
        const isPast = vitalsRect.bottom <= navBottom;
        bar.classList.toggle("is-sticky", isPast);
    }

    const sheetWithScroll = ctx.sheet as HTMLElement & { _stickyVitalsScrollHandler?: () => void };
    if (sheetWithScroll._stickyVitalsScrollHandler) {
        window.removeEventListener("scroll", sheetWithScroll._stickyVitalsScrollHandler);
        window.removeEventListener("resize", sheetWithScroll._stickyVitalsScrollHandler);
        document.removeEventListener("fullscreenchange", sheetWithScroll._stickyVitalsScrollHandler);
    }
    sheetWithScroll._stickyVitalsScrollHandler = checkStickyVitals;
    window.addEventListener("scroll", checkStickyVitals, { passive: true });
    window.addEventListener("resize", checkStickyVitals, { passive: true });
    document.addEventListener("fullscreenchange", checkStickyVitals, { passive: true });

    checkStickyVitals();

    // Death Saves Mechanism
    const rollBtn = ctx.sheet.querySelector<HTMLButtonElement>("#death-save-roll-btn");
    const deathLog = ctx.sheet.querySelector<HTMLElement>("#death-save-log");

    rollBtn?.addEventListener("click", () => {
        const char = ctx.getCharacter();
        if (!char) return;
        if (!char.vitals.deathSaves) {
            char.vitals.deathSaves = { successes: 0, failures: 0, isStable: false };
        }
        const ds = char.vitals.deathSaves;
        if ((ds.failures || 0) >= 3 || ds.isStable || (ds.successes || 0) >= 3) {
            return;
        }

        const roll = Math.floor(Math.random() * 20) + 1;
        let message = "";

        if (roll === 20) {
            // Natural 20: Immediately regain 1 HP and consciousness!
            ctx.setCurrentHp(1);
            ds.successes = 0;
            ds.failures = 0;
            ds.isStable = false;
            message = "Natural 20! You regain 1 HP and consciousness!";
            ctx.showStatus(message, false);
            ctx.updateHpDisplay();
        } else if (roll === 1) {
            // Natural 1: Two failures!
            ds.failures = Math.min(3, (ds.failures || 0) + 2);
            if (ds.failures >= 3) {
                message = "Natural 1! Suffered 2 failures (3/3) — Character has died!";
                ctx.showStatus(message, true);
            } else {
                message = `Natural 1! Suffered 2 failures (${ds.failures}/3).`;
                ctx.showStatus(message, true);
            }
            ctx.updateHpDisplay();
        } else if (roll >= 10) {
            // Success
            ds.successes = Math.min(3, (ds.successes || 0) + 1);
            if (ds.successes >= 3) {
                ds.isStable = true;
                message = `Rolled ${roll}: Success (3/3) — Character is STABILIZED!`;
                ctx.showStatus(message, false);
            } else {
                message = `Rolled ${roll}: Success! (${ds.successes}/3 successes).`;
            }
            ctx.updateHpDisplay();
        } else {
            // Failure (< 10)
            ds.failures = Math.min(3, (ds.failures || 0) + 1);
            if (ds.failures >= 3) {
                message = `Rolled ${roll}: Failure (3/3) — Character has died!`;
                ctx.showStatus(message, true);
            } else {
                message = `Rolled ${roll}: Failure (${ds.failures}/3 failures).`;
            }
            ctx.updateHpDisplay();
        }

        if (deathLog) {
            deathLog.textContent = message;
            deathLog.dataset.customMessage = "true";
            setTimeout(() => {
                if (deathLog) delete deathLog.dataset.customMessage;
            }, 6000);
        }

        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    // Manual pip toggle
    ctx.sheet.querySelectorAll<HTMLButtonElement>(".death-pip").forEach(pip => {
        pip.addEventListener("click", () => {
            const char = ctx.getCharacter();
            if (!char) return;
            if (!char.vitals.deathSaves) {
                char.vitals.deathSaves = { successes: 0, failures: 0, isStable: false };
            }
            const ds = char.vitals.deathSaves;
            const type = pip.getAttribute("data-type");
            const index = Number(pip.getAttribute("data-index") || "0");

            if (type === "success") {
                const current = ds.successes || 0;
                if (current === index + 1) {
                    ds.successes = index;
                } else {
                    ds.successes = index + 1;
                }
                ds.isStable = ds.successes >= 3;
            } else if (type === "failure") {
                const current = ds.failures || 0;
                if (current === index + 1) {
                    ds.failures = index;
                } else {
                    ds.failures = index + 1;
                }
            }

            ctx.updateHpDisplay();
            ctx.persistTrackerSnapshot();
            ctx.scheduleDebouncedAutoSave();
        });
    });

    // Stabilize button
    ctx.sheet.querySelector<HTMLButtonElement>("#death-save-stabilize-btn")?.addEventListener("click", () => {
        const char = ctx.getCharacter();
        if (!char) return;
        if (!char.vitals.deathSaves) {
            char.vitals.deathSaves = { successes: 0, failures: 0, isStable: false };
        }
        char.vitals.deathSaves.successes = 3;
        char.vitals.deathSaves.isStable = true;
        ctx.showStatus("Character stabilized at 0 HP.", false);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    // Reset button
    ctx.sheet.querySelector<HTMLButtonElement>("#death-save-reset-btn")?.addEventListener("click", () => {
        const char = ctx.getCharacter();
        if (!char) return;
        if (!char.vitals.deathSaves) {
            char.vitals.deathSaves = { successes: 0, failures: 0, isStable: false };
        }
        char.vitals.deathSaves.successes = 0;
        char.vitals.deathSaves.failures = 0;
        char.vitals.deathSaves.isStable = false;
        ctx.showStatus("Death saves reset.", false);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });

    // Healing buttons while at 0 HP
    ctx.sheet.querySelectorAll<HTMLButtonElement>("[data-death-heal]").forEach(btn => {
        btn.addEventListener("click", () => {
            const amount = Number(btn.getAttribute("data-death-heal"));
            if (isNaN(amount) || amount <= 0) return;
            ctx.setCurrentHp(amount);
            const char = ctx.getCharacter();
            if (char?.vitals.deathSaves) {
                char.vitals.deathSaves.successes = 0;
                char.vitals.deathSaves.failures = 0;
                char.vitals.deathSaves.isStable = false;
            }
            ctx.showStatus(`Regained ${amount} HP — Character revived!`, false);
            ctx.updateHpDisplay();
            ctx.persistTrackerSnapshot();
            ctx.scheduleDebouncedAutoSave();
        });
    });

    const reviveInput = ctx.sheet.querySelector<HTMLInputElement>("#death-revive-hp-input");
    reviveInput?.addEventListener("change", () => {
        const val = Number(reviveInput.value);
        if (!Number.isFinite(val) || val <= 0) return;
        const maxHp = ctx.getMaxHp();
        const resolved = Math.min(maxHp, Math.round(val));
        ctx.setCurrentHp(resolved);
        const char = ctx.getCharacter();
        if (char?.vitals.deathSaves) {
            char.vitals.deathSaves.successes = 0;
            char.vitals.deathSaves.failures = 0;
            char.vitals.deathSaves.isStable = false;
        }
        ctx.showStatus(`Regained ${resolved} HP — Character revived!`, false);
        ctx.updateHpDisplay();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    });
}
