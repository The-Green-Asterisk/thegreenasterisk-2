import el from "@elements";
import { CharacterCreatorContext } from "./context";

import {
    getClassSkillMatch,
    getClassSkillSources,
    getExpertiseMatch,
    getExpertiseSources,
    getFeatSkillSections,
    getUnmetProgressionExpertise
} from "../services/skillRules";

/**
 * Skill picks left unmade or over a source's limit, phrased for the step's warning.
 */
export function getSkillStepProblems(ctx: CharacterCreatorContext): string[] {
    const problems: string[] = [];
    const classSources = getClassSkillSources(ctx);
    const classMatch = getClassSkillMatch(ctx);
    for (const s of classSources) {
        const used = Array.from(classMatch.assigned.values()).filter((k) => k === s.key).length;
        if (used < s.count) problems.push(`${s.label}: ${used} of ${s.count} skills chosen`);
    }
    if (classMatch.unassigned.length > 0) {
        problems.push(`${classMatch.unassigned.join(", ")} ${classMatch.unassigned.length === 1 ? "isn't" : "aren't"} covered by any class's skill choices`);
    }
    for (const sec of getFeatSkillSections(ctx)) {
        const chosen = (ctx.state.featSkillChoices?.[sec.key] || []).length;
        if (chosen < sec.count && sec.count === 1) problems.push(`${sec.label}: no skill chosen`);
    }
    const expMatch = getExpertiseMatch(ctx);
    for (const s of getExpertiseSources(ctx)) {
        const used = Array.from(expMatch.assigned.values()).filter((k) => k === s.key).length;
        if (used < s.count) problems.push(`${s.label} Expertise: ${used} of ${s.count} chosen`);
    }
    if (expMatch.unassigned.length > 0) problems.push(`Expertise in ${expMatch.unassigned.join(", ")} is over the limit`);
    for (const u of getUnmetProgressionExpertise(ctx)) {
        problems.push(`${u.source} gives Expertise in ${u.skill}, but you aren't proficient in it, so it gives nothing`);
    }
    return problems;
}

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
        case 6: {
            ctx.sanitizeSkillSelections();
            if (ctx.skillsWarningDismissed) {
                ctx.skillsWarningDismissed = false;
                return true;
            }
            const problems = getSkillStepProblems(ctx);
            if (problems.length > 0) {
                showAlert(`Warning: ${problems.join("; ")}. Click Next again to proceed anyway, or adjust your selections below.`, "warning");
                ctx.skillsWarningDismissed = true;
                return false;
            }
            return true;
        }
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

                // D&D 2024 multiclassing: each class has its own cantrip and prepared spell allotment
                const buckets = ctx.getSpellBuckets();
                const overages: string[] = [];
                for (const b of buckets) {
                    const sel = ctx.state.classSpellSelections?.[b.key] || { cantrips: [], prepared: [] };
                    const c = sel.cantrips.length;
                    const p = sel.prepared.length;
                    const cOver = b.maxCantrips > 0 ? c > b.maxCantrips : c > 0;
                    const pOver = b.maxPrepared > 0 ? p > b.maxPrepared : p > 0;
                    if (buckets.length === 1) {
                        if (cOver && pOver) {
                            overages.push(`more spells than your allotment (${c}/${b.maxCantrips} cantrips, ${p}/${b.maxPrepared} prepared spells)`);
                        } else if (cOver) {
                            overages.push(`more cantrips (${c}) than your allotment (${b.maxCantrips})`);
                        } else if (pOver) {
                            overages.push(`more prepared spells (${p}) than your allotment (${b.maxPrepared})`);
                        }
                    } else {
                        if (cOver) overages.push(`${c}/${b.maxCantrips} ${b.label} cantrips`);
                        if (pOver) overages.push(`${p}/${b.maxPrepared} ${b.label} prepared spells`);
                    }
                }

                if (overages.length > 0) {
                    const warnMsg = buckets.length === 1
                        ? `Warning: You have selected ${overages[0]}. Click Next again to proceed anyway, or adjust your selections below.`
                        : `Warning: You have selected more spells than a class allows (${overages.join(", ")}). Each class prepares spells separately. Click Next again to proceed anyway, or adjust your selections below.`;
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

const STEP_NAMES = ["Identity", "Species", "Class", "Background", "Abilities", "Skills", "Equipment", "Spells", "Review"];

/**
 * The page title for the creator's current step (WCAG 2.4.2), e.g. "Step 2 of 9: Species — Character Creator | The
 * Green Asterisk", naming the character when editing a saved one.
 */
export function updateCreatorTitle(ctx: CharacterCreatorContext, renderedStep?: number): void {
    const step = Math.min(Math.max(renderedStep || ctx.state.currentStep || 1, 1), STEP_NAMES.length);
    const name = (ctx.state.name || "").trim();
    const what = ctx.state.savedId ? `Editing ${name || "Character"}` : "Character Creator";
    try {
        el.title.textContent = `Step ${step} of ${STEP_NAMES.length}: ${STEP_NAMES[step - 1]} — ${what} | The Green Asterisk`;
    } catch { }
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
        if (stepNum === step) el.setAttribute("aria-current", "step");
        else el.removeAttribute("aria-current");
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

let keyboardActivationBound = false;

/**
 * Enter or Space activates option cards marked data-kbd-activate (role radio/checkbox), as a click would; focus
 * returns to the same option after the step re-renders.
 */
function activateOptionFromKeyboard(e: KeyboardEvent): void {
    if ((e.key !== "Enter" && e.key !== " ") || e.defaultPrevented) return;
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-kbd-activate]");
    if (!el || el !== e.target || el.getAttribute("aria-disabled") === "true") return;
    e.preventDefault();
    const kind = Array.from(el.classList).find((c) => c.endsWith("-card") || c.endsWith("-row")) || "";
    const ids = Array.from(el.attributes).filter((a) => a.name.startsWith("data-") && a.name !== "data-kbd-activate");
    el.click();
    if (!document.contains(el)) {
        const selector = `.${kind}${ids.map((a) => `[${a.name}="${CSS.escape(a.value)}"]`).join("")}`;
        document.querySelector<HTMLElement>(selector)?.focus();
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
        const siteNav = document.querySelector("#site-nav");
        if (siteNav) {
            navObserver.observe(siteNav, { attributes: true, attributeFilter: ["style", "class"] });
        }
        if (typeof document !== "undefined" && document.body) {
            navObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
        }
    }

    if (!keyboardActivationBound) {
        keyboardActivationBound = true;
        document.addEventListener("keydown", activateOptionFromKeyboard);
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
