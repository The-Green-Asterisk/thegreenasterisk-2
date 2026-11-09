import { CharacterClassChoice } from "../characterCreator.types";
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

    document.querySelectorAll(".fighting-style-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            ctx.state.fightingStyle = card.getAttribute("data-fighting-style-id") || "";
            ctx.renderStep(3);
        });
    });

    document.querySelectorAll(".divine-order-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            ctx.state.divineOrder = card.getAttribute("data-divine-order-id") || "";
            ctx.renderStep(3);
        });
    });

    document.querySelectorAll(".primal-order-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            ctx.state.primalOrder = card.getAttribute("data-primal-order-id") || "";
            ctx.renderStep(3);
        });
    });

    document.querySelectorAll(".metamagic-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const metaId = card.getAttribute("data-metamagic-id") || "";
            const maxCount = ctx.getMaxMetamagicCount();
            if (ctx.state.metamagic.includes(metaId)) {
                ctx.state.metamagic = ctx.state.metamagic.filter((m) => m !== metaId);
            } else if (ctx.state.metamagic.length < maxCount) {
                ctx.state.metamagic.push(metaId);
            }
            ctx.renderStep(3);
        });
    });

    document.querySelectorAll(".invocation-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const invId = card.getAttribute("data-invocation-id") || "";
            const maxCount = ctx.getMaxInvocationsCount();
            if (ctx.state.invocations.includes(invId)) {
                ctx.state.invocations = ctx.state.invocations.filter((i) => i !== invId);
            } else if (ctx.state.invocations.length < maxCount) {
                ctx.state.invocations.push(invId);
            }
            ctx.renderStep(3);
        });
    });

    document.querySelectorAll(".maneuver-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const manId = card.getAttribute("data-maneuver-id") || "";
            const maxCount = ctx.getMaxManeuversCount();
            if (ctx.state.maneuvers.includes(manId)) {
                ctx.state.maneuvers = ctx.state.maneuvers.filter((m) => m !== manId);
            } else if (ctx.state.maneuvers.length < maxCount) {
                ctx.state.maneuvers.push(manId);
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

    document.querySelectorAll(".subclass-feature-card").forEach((card) => {
        card.addEventListener("click", () => {
            if (card.closest(".level-progression-box.locked") || card.closest(".locked-choice") || card.classList.contains("disabled")) return;
            const key = card.getAttribute("data-feature-key");
            const choice = card.getAttribute("data-feature-choice");
            if (key && choice) {
                if (!ctx.state.subclassFeatureChoices) {
                    ctx.state.subclassFeatureChoices = {};
                }
                ctx.state.subclassFeatureChoices[key] = choice;
                ctx.renderStep(3);
                ctx.updateLiveSummary();
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
