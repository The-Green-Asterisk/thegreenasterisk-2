import el from "@elements";
import { AbilityName } from "../../../rules/dnd5e_2024";
import { rereadDndBeyondAbilityChoices } from "../services/dndBeyondAbilityChoices";
import { CharacterCreatorContext } from "./context";

// Shown once after the step re-renders following a re-read
let lastRereadMessage = "";

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export function initAbilitiesController(ctx: CharacterCreatorContext): void {
    el.creatorAbilityTabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const newMode = btn.getAttribute("data-mode") as any;
            ctx.state.abilityMode = newMode;
            if (newMode === "standard") {
                const currentValues = Object.values(ctx.state.baseAbilities).slice().sort((a, b) => b - a);
                const isMatch = STANDARD_ARRAY.every((v, i) => currentValues[i] === v);
                if (!isMatch) {
                    ctx.state.baseAbilities = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
                }
            } else if (newMode === "pointbuy") {
                const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
                const allInRange = stats.every((st) => ctx.state.baseAbilities[st] >= 8 && ctx.state.baseAbilities[st] <= 15);
                if (!allInRange || ctx.getSpentPoints() > 27) {
                    ctx.state.baseAbilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
                }
            }
            ctx.renderStep(5);
            ctx.updateLiveSummary();
        });
    });

    // Standard array selection: swapping values without editing
    el.creatorStandardArraySelects.forEach((select) => {
        select.addEventListener("change", (e) => {
            const stat = (e.target as HTMLSelectElement).getAttribute("data-stat") as AbilityName;
            const val = Number((e.target as HTMLSelectElement).value);
            if (stat && val) {
                ctx.setStandardArrayScore(stat, val);
                ctx.renderStep(5);
                ctx.updateLiveSummary();
            }
        });
    });

    // Point buy decrement
    el.creatorPointBuyDecButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const stat = btn.getAttribute("data-stat") as AbilityName;
            if (stat && ctx.decrementPointBuy(stat)) {
                ctx.renderStep(5);
                ctx.updateLiveSummary();
            }
        });
    });

    // Point buy increment
    el.creatorPointBuyIncButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const stat = btn.getAttribute("data-stat") as AbilityName;
            if (stat && ctx.incrementPointBuy(stat)) {
                ctx.renderStep(5);
                ctx.updateLiveSummary();
            }
        });
    });

    // Manual / Roll score controls
    el.creatorScoreDecButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const stat = btn.getAttribute("data-stat") as AbilityName;
            if (stat && ctx.state.baseAbilities[stat] > 3) {
                ctx.state.baseAbilities[stat]--;
                ctx.renderStep(5);
                ctx.updateLiveSummary();
            }
        });
    });

    el.creatorScoreIncButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const stat = btn.getAttribute("data-stat") as AbilityName;
            if (stat && ctx.state.baseAbilities[stat] < 20) {
                ctx.state.baseAbilities[stat]++;
                ctx.renderStep(5);
                ctx.updateLiveSummary();
            }
        });
    });

    el.creatorScoreInputs.forEach((input) => {
        input.addEventListener("input", (e) => {
            const stat = (e.target as HTMLElement).getAttribute("data-stat") as AbilityName;
            const val = Math.max(3, Math.min(20, Number((e.target as HTMLInputElement).value) || 10));
            if (stat) {
                ctx.state.baseAbilities[stat] = val;
                ctx.updateLiveSummary();
            }
        });
    });

    const rollBtn = el.creatorRollAllButton;
    rollBtn?.addEventListener("click", () => {
        const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
        for (const st of stats) {
            const rolls = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            rolls.sort((a, b) => a - b);
            const total = rolls[1] + rolls[2] + rolls[3];
            ctx.state.baseAbilities[st] = total;
        }
        ctx.renderStep(5);
        ctx.updateLiveSummary();
    });

    // Re-read ability scores, background bonuses and feats from D&D Beyond (asks first: it replaces creator choices)
    const rereadBtn = el.creatorDdbRereadButton;
    const rereadConfirm = el.creatorDdbRereadConfirm;
    const rereadStatus = el.creatorDdbRereadStatus;
    if (rereadStatus && lastRereadMessage) {
        rereadStatus.textContent = lastRereadMessage;
        lastRereadMessage = "";
    }
    rereadBtn?.addEventListener("click", () => {
        if (!rereadConfirm) return;
        rereadConfirm.hidden = false;
        rereadBtn.setAttribute("aria-expanded", "true");
        el.creatorDdbRereadConfirmButton?.focus();
    });
    el.creatorDdbRereadCancelButton?.addEventListener("click", () => {
        if (rereadConfirm) rereadConfirm.hidden = true;
        rereadBtn?.setAttribute("aria-expanded", "false");
        rereadBtn?.focus();
    });
    el.creatorDdbRereadConfirmButton?.addEventListener("click", async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = "Reading from D&D Beyond…";
        try {
            await rereadDndBeyondAbilityChoices(ctx);
            lastRereadMessage = "Ability scores, background bonuses, and feats now match D&D Beyond.";
        } catch (err: any) {
            lastRereadMessage = `Couldn't read from D&D Beyond: ${err?.message || "request failed"}`;
        }
        ctx.renderStep(5);
        ctx.updateLiveSummary();
        el.creatorDdbRereadButton?.focus();
    });

    // ASI / Feats controls
    el.creatorAsiTypeRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement;
            const lvl = target.getAttribute("data-asi-key") || "";
            const newType = target.value as "single" | "dual" | "feat";
            ctx.ensureAsiChoices();
            if (ctx.state.asiChoices[lvl]) {
                ctx.state.asiChoices[lvl].type = newType;
                if (newType === "feat" && !ctx.state.asiChoices[lvl].featId) {
                    const isEpic = ctx.getAsiSlots().find((s) => s.key === lvl)?.isEpicBoon ?? false;
                    const feats = isEpic ? ctx.generalFeats : ctx.generalFeats.filter((f) => !f.isEpicBoon);
                    const defaultFeat = feats[0];
                    ctx.state.asiChoices[lvl].featId = defaultFeat?.id || "alert-general";
                    ctx.state.asiChoices[lvl].statA = defaultFeat?.allowedStats[0] || "str";
                }
            }
            ctx.renderStep(5);
            ctx.updateLiveSummary();
        });
    });

    el.creatorAsiStatSelects.forEach((select) => {
        select.addEventListener("change", (e) => {
            const target = e.target as HTMLSelectElement;
            const lvl = target.getAttribute("data-asi-key") || "";
            const field = target.getAttribute("data-asi-field") as "statA" | "statB";
            ctx.ensureAsiChoices();
            if (ctx.state.asiChoices[lvl] && field) {
                ctx.state.asiChoices[lvl][field] = target.value as AbilityName;
            }
            ctx.renderStep(5);
            ctx.updateLiveSummary();
        });
    });

    el.creatorAsiFeatSelects.forEach((select) => {
        select.addEventListener("change", (e) => {
            const target = e.target as HTMLSelectElement;
            const lvl = target.getAttribute("data-asi-key") || "";
            const featId = target.value;
            ctx.ensureAsiChoices();
            if (ctx.state.asiChoices[lvl]) {
                ctx.state.asiChoices[lvl].featId = featId;
                const featDef = ctx.generalFeats.find((f) => f.id === featId);
                if (featDef && (!ctx.state.asiChoices[lvl].statA || !featDef.allowedStats.includes(ctx.state.asiChoices[lvl].statA!))) {
                    ctx.state.asiChoices[lvl].statA = featDef.allowedStats[0];
                }
            }
            ctx.renderStep(5);
            ctx.updateLiveSummary();
        });
    });
}
