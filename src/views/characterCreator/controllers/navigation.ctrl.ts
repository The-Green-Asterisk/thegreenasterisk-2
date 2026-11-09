import { CharacterCreatorContext } from "./context";

export function showAlert(msg: string, type: "error" | "warning" = "error"): void {
    const alertBox = document.getElementById("creator-validation-alert");
    if (alertBox) {
        alertBox.innerHTML = `${type === "warning" ? '<i class="fa-solid fa-triangle-exclamation"></i> ' : '<i class="fa-solid fa-circle-exclamation"></i> '}${msg}`;
        alertBox.classList.remove("hidden");
        alertBox.classList.toggle("warning", type === "warning");
    }
}

export function hideAlert(): void {
    const alertBox = document.getElementById("creator-validation-alert");
    if (alertBox) {
        alertBox.textContent = "";
        alertBox.classList.add("hidden");
        alertBox.classList.remove("warning");
    }
}

export function validateCurrentStep(ctx: CharacterCreatorContext): boolean {
    hideAlert();
    switch (ctx.state.currentStep) {
        case 1:
            if (!ctx.state.name.trim()) {
                showAlert("Please enter a character name to proceed.");
                return false;
            }
            return true;
        case 2:
            if (!ctx.state.speciesId) {
                showAlert("Please select a species.");
                return false;
            }
            return true;
        case 3:
            if (!ctx.state.classId) {
                showAlert("Please select a class.");
                return false;
            }
            return true;
        case 4:
            if (!ctx.state.backgroundId) {
                showAlert("Please select a background.");
                return false;
            }
            return true;
        case 8: {
            ctx.sanitizeSpellSelections();
            const maxCantrips = ctx.getMaxCantrips();
            const maxPrepared = ctx.getMaxPreparedSpells();
            const hasSpellcasting = maxCantrips > 0 || maxPrepared > 0;

            if (hasSpellcasting && !ctx.spellsWarningDismissed) {
                const cantripCount = ctx.state.selectedCantrips.length;
                const spellCount = ctx.state.selectedSpellsLevel1.length;
                const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
                const className = cls?.name || "Spellcaster";

                if ((maxCantrips > 0 && cantripCount > maxCantrips) || (maxPrepared > 0 && spellCount > maxPrepared)) {
                    let warnMsg = "";
                    if (cantripCount > maxCantrips && spellCount > maxPrepared) {
                        warnMsg = `Warning: You have selected more spells than your allotment (${cantripCount}/${maxCantrips} cantrips, ${spellCount}/${maxPrepared} prepared spells). Click Next again to proceed anyway, or adjust your selections below.`;
                    } else if (cantripCount > maxCantrips) {
                        warnMsg = `Warning: You have selected more cantrips (${cantripCount}) than your allotment (${maxCantrips}). Click Next again to proceed anyway, or adjust your selections below.`;
                    } else {
                        warnMsg = `Warning: You have selected more prepared spells (${spellCount}) than your allotment (${maxPrepared}). Click Next again to proceed anyway, or adjust your selections below.`;
                    }
                    showAlert(warnMsg, "warning");
                    ctx.spellsWarningDismissed = true;
                    return false;
                }

                if (cantripCount === 0 && spellCount === 0) {
                    showAlert(
                        `Warning: As a ${className}, your class uses spells, but you haven't selected any spells. Click Next again to proceed without spells, or choose your spells below.`,
                        "warning"
                    );
                    ctx.spellsWarningDismissed = true;
                    return false;
                } else if (maxPrepared > 0 && spellCount === 0) {
                    showAlert(
                        `Warning: As a ${className}, you can prepare up to ${maxPrepared} spells, but haven't selected any. Click Next again to proceed, or choose your spells below.`,
                        "warning"
                    );
                    ctx.spellsWarningDismissed = true;
                    return false;
                } else if (maxCantrips > 0 && cantripCount === 0) {
                    showAlert(
                        `Warning: As a ${className}, you can select up to ${maxCantrips} cantrips, but haven't selected any. Click Next again to proceed, or choose your cantrips below.`,
                        "warning"
                    );
                    ctx.spellsWarningDismissed = true;
                    return false;
                }
            }
            ctx.spellsWarningDismissed = false;
            return true;
        }
        default:
            return true;
    }
}

export function validateAndAdvance(ctx: CharacterCreatorContext): void {
    if (!validateCurrentStep(ctx)) return;
    goToStep(ctx, ctx.state.currentStep + 1);
}

export function goToStep(ctx: CharacterCreatorContext, step: number): void {
    if (step < 1 || step > 9) return;
    hideAlert();
    ctx.spellsWarningDismissed = false;
    ctx.state.currentStep = step;

    // Update stepper UI
    document.querySelectorAll(".stepper-item").forEach((el) => {
        const stepNum = Number(el.getAttribute("data-step"));
        el.classList.toggle("active", stepNum === step);
        el.classList.toggle("completed", stepNum < step);
    });

    // Update step counter text
    const counter = document.getElementById("creator-step-indicator");
    if (counter) counter.textContent = `Step ${step} of 9`;

    // Update button states
    const prevBtn = document.getElementById("creator-prev-btn") as HTMLButtonElement;
    const nextBtn = document.getElementById("creator-next-btn") as HTMLButtonElement;
    const submitBtn = document.getElementById("creator-submit-btn") as HTMLButtonElement;

    if (prevBtn) prevBtn.disabled = step === 1;
    if (nextBtn) {
        nextBtn.classList.toggle("hidden", step === 9);
    }
    if (submitBtn) {
        submitBtn.classList.toggle("hidden", step !== 9);
    }

    ctx.renderStep(step, false);
    ctx.updateLiveSummary();
    if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

export function bindNavigationEvents(ctx: CharacterCreatorContext): void {
    const prevBtn = document.getElementById("creator-prev-btn");
    const nextBtn = document.getElementById("creator-next-btn");
    const submitBtn = document.getElementById("creator-submit-btn");

    prevBtn?.addEventListener("click", () => goToStep(ctx, ctx.state.currentStep - 1));
    nextBtn?.addEventListener("click", () => validateAndAdvance(ctx));
    submitBtn?.addEventListener("click", () => ctx.submitCharacter());

    // Stepper pills click
    const stepperItems = document.querySelectorAll(".stepper-item");
    stepperItems.forEach((item) => {
        item.addEventListener("click", () => {
            const step = Number(item.getAttribute("data-step"));
            if (step < ctx.state.currentStep) {
                goToStep(ctx, step);
            } else if (step > ctx.state.currentStep) {
                if (validateCurrentStep(ctx)) {
                    goToStep(ctx, step);
                }
            }
        });
    });

    // Multiclass scroll and resize observer
    window.addEventListener("scroll", () => {
        if (ctx.state.currentStep === 3) {
            ctx.updateMulticlassBarPositions();
            ctx.updateMulticlassNavBars();
        }
    }, { passive: true });

    window.addEventListener("resize", () => {
        if (ctx.state.currentStep === 3) {
            ctx.updateMulticlassBarPositions();
            ctx.updateMulticlassNavBars();
        }
    }, { passive: true });

    // Observe navigation bar visibility changes (e.g. toggled display or body padding)
    if (typeof MutationObserver !== "undefined") {
        const navObserver = new MutationObserver(() => {
            if (ctx.state.currentStep === 3) {
                ctx.updateMulticlassBarPositions();
                ctx.updateMulticlassNavBars();
            }
        });
        const siteNav = document.querySelector("nav");
        if (siteNav) {
            navObserver.observe(siteNav, { attributes: true, attributeFilter: ["style", "class"] });
        }
        if (typeof document !== "undefined" && document.body) {
            navObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
        }
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && ctx.state.currentStep === 3) {
            setTimeout(() => {
                ctx.updateMulticlassBarPositions();
                ctx.updateMulticlassNavBars();
            }, 10);
        }
    });
}
