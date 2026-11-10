import { CharacterClassChoice } from "../characterCreator.types";
import { getProgressionChoices, getProgressionPools, setProgressionChoice } from "../services/progressionModifiers";
import { CharacterCreatorContext } from "./context";

export function initClassController(ctx: CharacterCreatorContext): void {
    document.querySelectorAll(".class-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.classList.contains("disabled") || card.getAttribute("aria-disabled") === "true") return;
            const cIdx = parseInt(card.getAttribute("data-class-index") || "0", 10);
            const cId = card.getAttribute("data-class-id") || "";
            if (cIdx > 0) {
                const check = ctx.canMulticlassInto(cId, cIdx);
                if (!check.allowed) return;
            }
            if (ctx.state.classes[cIdx]) {
                ctx.state.classes[cIdx].classId = cId;
                const cls = ctx.classes.find((c) => c.id === cId);
                const newSubId = cls?.subclasses?.[0]?.id || "";
                ctx.state.classes[cIdx].subclassId = newSubId;
                if (cIdx === 0) {
                    ctx.state.classId = cId;
                    ctx.state.subclassId = newSubId;
                    ctx.state.weaponMasteries = [];
                    if (cls) {
                        ctx.initClassDefaultEquipment(cls);
                    }
                }
                ctx.syncStateClassProperties();
                ctx.sanitizeSpellSelections();
                ctx.renderStep(3);
                ctx.updateLiveSummary();
            }
        });
    });

    document.querySelectorAll(".subclass-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const cIdx = parseInt(card.getAttribute("data-class-index") || "0", 10);
            const subId = card.getAttribute("data-subclass-id") || "";
            if (ctx.state.classes[cIdx]) {
                ctx.state.classes[cIdx].subclassId = subId;
                if (cIdx === 0) {
                    ctx.state.subclassId = subId;
                }
                ctx.syncStateClassProperties();
                ctx.sanitizeSpellSelections();
                ctx.renderStep(3);
            }
        });
    });

    // Collapsible Level Progression
    const toggleBoxCollapse = (box: HTMLElement) => {
        const cIdx = box.getAttribute("data-class-index") || "0";
        const lvl = box.getAttribute("data-level") || "1";
        const key = `${cIdx}-${lvl}`;
        const isCollapsed = box.classList.toggle("is-collapsed");
        if (isCollapsed) {
            ctx.collapsedProgressionLevels.add(key);
        } else {
            ctx.collapsedProgressionLevels.delete(key);
        }
        const body = box.querySelector(".level-progression-body") as HTMLElement | null;
        if (body) {
            body.style.display = isCollapsed ? "none" : "";
        }
        const btn = box.querySelector(".level-collapse-btn") as HTMLElement | null;
        if (btn) {
            btn.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
        }
        const header = box.querySelector(".level-card-header") as HTMLElement | null;
        if (header) {
            header.setAttribute("title", `Click to ${isCollapsed ? "expand" : "collapse"} Level ${lvl} details`);
        }
    };

    document.querySelectorAll(".level-card-header").forEach((header) => {
        header.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            // The level badge handles itself; the collapse button (keyboard path) and the rest of the header toggle
            if (target.closest(".progression-lvl-badge")) return;
            const box = header.closest(".level-progression-box") as HTMLElement | null;
            if (box) toggleBoxCollapse(box);
        });
    });

    document.querySelectorAll(".progression-toggle-all-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const action = btn.getAttribute("data-action");
            const cIdx = btn.getAttribute("data-class-index") || "0";
            const boxes = Array.from(document.querySelectorAll(`.level-progression-box[data-class-index="${cIdx}"]`)) as HTMLElement[];
            if (action === "collapse-all") {
                boxes.forEach((box) => {
                    const lvl = box.getAttribute("data-level") || "1";
                    ctx.collapsedProgressionLevels.add(`${cIdx}-${lvl}`);
                    box.classList.add("is-collapsed");
                    const body = box.querySelector(".level-progression-body") as HTMLElement | null;
                    if (body) body.style.display = "none";
                    const collapseBtn = box.querySelector(".level-collapse-btn") as HTMLElement | null;
                    if (collapseBtn) collapseBtn.setAttribute("aria-expanded", "false");
                });
            } else if (action === "expand-all") {
                boxes.forEach((box) => {
                    const lvl = box.getAttribute("data-level") || "1";
                    ctx.collapsedProgressionLevels.delete(`${cIdx}-${lvl}`);
                    box.classList.remove("is-collapsed");
                    const body = box.querySelector(".level-progression-body") as HTMLElement | null;
                    if (body) body.style.display = "";
                    const collapseBtn = box.querySelector(".level-collapse-btn") as HTMLElement | null;
                    if (collapseBtn) collapseBtn.setAttribute("aria-expanded", "true");
                });
            }
        });
    });

    document.querySelectorAll(".progression-lvl-badge").forEach((badge) => {
        badge.addEventListener("click", (e) => {
            e.stopPropagation();
            const cIdx = parseInt(badge.getAttribute("data-class-index") || "0", 10);
            let targetLvl = parseInt(badge.getAttribute("data-level") || "1", 10);
            if (ctx.state.classes[cIdx]) {
                const currentLvl = ctx.state.classes[cIdx].level || 1;
                if (targetLvl === currentLvl) {
                    targetLvl = Math.max(1, currentLvl - 1);
                }
                ctx.state.classes[cIdx].level = targetLvl;
                if (cIdx === 0) {
                    ctx.state.level = targetLvl;
                }
                ctx.state.level = ctx.getTotalLevel();
                // Ensure the clicked level is expanded so user sees its features
                ctx.collapsedProgressionLevels.delete(`${cIdx}-${targetLvl}`);
                ctx.syncStateClassProperties();
                ctx.sanitizeSpellSelections();
                ctx.updateLiveSummary();
                ctx.renderStep(3);
            }
        });
    });

    const addClassBtn = document.getElementById("add-class-btn") as HTMLButtonElement | null;
    addClassBtn?.addEventListener("click", () => {
        if (addClassBtn.disabled || addClassBtn.classList.contains("disabled")) return;
        const nextIdx = ctx.state.classes.length;
        const availableCls = ctx.classes.find((c) => ctx.canMulticlassInto(c.id, nextIdx).allowed);
        if (!availableCls) return;
        const newClassChoice: CharacterClassChoice = {
            classId: availableCls.id,
            level: 1,
            subclassId: ""
        };
        ctx.state.classes.push(newClassChoice);
        ctx.syncStateClassProperties();
        ctx.updateLiveSummary();
        ctx.renderStep(3);
        ctx.updateMulticlassBarPositions();
        ctx.updateMulticlassNavBars();
    });

    document.querySelectorAll(".remove-class-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const cIdx = parseInt(btn.getAttribute("data-class-index") || "0", 10);
            if (cIdx > 0 && ctx.state.classes.length > 1) {
                ctx.state.classes.splice(cIdx, 1);
                ctx.syncStateClassProperties();
                ctx.sanitizeSpellSelections();
                ctx.updateLiveSummary();
                ctx.renderStep(3);
                ctx.updateMulticlassBarPositions();
                ctx.updateMulticlassNavBars();
            }
        });
    });

    document.querySelectorAll(".mastery-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const wName = card.getAttribute("data-weapon-name") || "";
            const maxM = ctx.getMaxWeaponMasteriesCount();
            if (ctx.state.weaponMasteries.includes(wName)) {
                ctx.state.weaponMasteries = ctx.state.weaponMasteries.filter((w) => w !== wName);
            } else if (ctx.state.weaponMasteries.length < maxM) {
                ctx.state.weaponMasteries.push(wName);
            }
            ctx.renderStep(3);
        });
    });

    document.querySelectorAll(".prog-filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const filter = (btn.getAttribute("data-prog-filter") || "all") as "all" | "unlocked";
            ctx.progressionFilter = filter;
            ctx.renderStep(3);
        });
    });

    // Pick lists (Eldritch Invocations, Metamagic, Maneuvers…): state[pool], up to the class's scalingTraits limit
    document.querySelectorAll<HTMLElement>(".pool-card").forEach((card) => {
        const toggle = () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const poolName = card.getAttribute("data-pool") || "";
            const optionId = card.getAttribute("data-option-id") || "";
            const classIndex = Number(card.getAttribute("data-class-index") || 0);
            const pool = getProgressionPools(ctx).find((p) => p.pool === poolName && p.classIndex === classIndex);
            if (!pool || !optionId) return;
            const current: string[] = Array.isArray((ctx.state as any)[poolName]) ? [...(ctx.state as any)[poolName]] : [];
            if (current.includes(optionId)) {
                (ctx.state as any)[poolName] = current.filter((id) => id !== optionId);
            } else if (current.length < pool.max) {
                (ctx.state as any)[poolName] = [...current, optionId];
            }
            ctx.renderStep(3, true);
            ctx.updateLiveSummary();
            Array.from(document.querySelectorAll<HTMLElement>(".pool-card"))
                .find((c) => c.getAttribute("data-pool") === poolName && c.getAttribute("data-option-id") === optionId)
                ?.focus();
        };
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle();
            }
        });
    });

    // Progression choices (class and subclass): stored by the engine under their storage key
    document.querySelectorAll<HTMLElement>(".subclass-feature-card").forEach((card) => {
        const toggle = () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const key = card.getAttribute("data-feature-key");
            const optionId = card.getAttribute("data-feature-choice");
            const classIndex = Number(card.getAttribute("data-class-index") || 0);
            if (!key || !optionId) return;
            const entry = getProgressionChoices(ctx).find((e) => e.key === key && e.classIndex === classIndex)
                || getProgressionChoices(ctx).find((e) => e.key === key);
            if (!entry) return;
            const count = entry.choice.chooseCount || 1;
            let next: string[];
            if (entry.selectedIds.includes(optionId)) {
                next = count > 1 ? entry.selectedIds.filter((id) => id !== optionId) : entry.selectedIds;
            } else {
                next = count > 1 ? [...entry.selectedIds, optionId].slice(-count) : [optionId];
            }
            setProgressionChoice(ctx, entry, next);
            ctx.renderStep(3, true);
            ctx.updateLiveSummary();
            Array.from(document.querySelectorAll<HTMLElement>(".subclass-feature-card"))
                .find((c) => c.getAttribute("data-feature-key") === key && c.getAttribute("data-feature-choice") === optionId)
                ?.focus();
        };
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", (e) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                toggle();
            }
        });
    });

    document.querySelectorAll(".scroll-to-bottom-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (typeof window !== "undefined") {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "smooth"
                });
            }
        });
    });

    ctx.updateMulticlassBarPositions();
    ctx.updateMulticlassNavBars();
}
