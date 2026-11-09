import { AbilityName } from "../../../rules/dnd5e_2024";
import { STANDARD_ARRAY } from "../services/rulesCalculations";
import { AsiSlot } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

export function renderAsiMilestoneCard(ctx: CharacterCreatorContext, slot: AsiSlot): string {
    ctx.ensureAsiChoices();
    const key = slot.key;
    const choice = ctx.state.asiChoices[key] || { type: "single", statA: "str" };
    const isMulticlass = (ctx.state.classes || []).length > 1;
    // Imported characters can have an empty slot on D&D Beyond; show it as unchosen rather than a stat
    const notChosen = (val?: string) => (val ? "" : `<option value="" disabled selected>Not chosen</option>`);
    const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
    const labels: Record<AbilityName, string> = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
    const isEpicLevel = slot.isEpicBoon;
    // Epic Boons are offered at 19; one already chosen elsewhere (e.g. imported from D&D Beyond) stays selectable
    const availableFeats = isEpicLevel
        ? ctx.generalFeats
        : ctx.generalFeats.filter((f) => !f.isEpicBoon || f.id === choice.featId);

    const currentFeat = availableFeats.find((f) => f.id === choice.featId) || availableFeats[0];
    const allowedFeatStats = currentFeat?.allowedStats || stats;

    return `
        <div class="asi-milestone-card" data-asi-key="${key}">
            <div class="asi-card-header">
                <span class="asi-level-badge">${isMulticlass ? `${slot.className} ${slot.classLevel}` : `Level ${slot.classLevel}`} ${slot.isEpicBoon ? "Epic Boon" : "Improvement"}</span>
                <div class="asi-type-selector">
                    <label class="asi-type-radio-label">
                        <input type="radio" class="asi-type-radio" name="asi-type-${key}" data-asi-key="${key}" value="single" ${choice.type === "single" ? "checked" : ""} />
                        <span>+2 to One Stat</span>
                    </label>
                    <label class="asi-type-radio-label">
                        <input type="radio" class="asi-type-radio" name="asi-type-${key}" data-asi-key="${key}" value="dual" ${choice.type === "dual" ? "checked" : ""} />
                        <span>+1 to Two Stats</span>
                    </label>
                    <label class="asi-type-radio-label">
                        <input type="radio" class="asi-type-radio" name="asi-type-${key}" data-asi-key="${key}" value="feat" ${choice.type === "feat" ? "checked" : ""} />
                        <span>${isEpicLevel ? "Epic Boon / Feat" : "General Feat (+1 Stat)"}</span>
                    </label>
                </div>
            </div>

            <div class="asi-inputs-row">
                ${choice.type === "single" ? `
                    <div class="asi-select-wrap">
                        <label class="asi-select-label" for="asi-${key}-single">Select Ability (+2):</label>
                        <select id="asi-${key}-single" class="creator-select asi-stat-select" data-asi-field="statA" data-asi-key="${key}">
                            ${notChosen(choice.statA)}
                            ${stats.map((st) => `
                                <option value="${st}" ${choice.statA === st ? "selected" : ""}>${labels[st]} (Current: ${ctx.getEffectiveAbilityScore(st)})</option>
                            `).join("")}
                        </select>
                    </div>
                ` : choice.type === "dual" ? `
                    <div class="asi-select-wrap">
                        <label class="asi-select-label" for="asi-${key}-dual-a">First Ability (+1):</label>
                        <select id="asi-${key}-dual-a" class="creator-select asi-stat-select" data-asi-field="statA" data-asi-key="${key}">
                            ${notChosen(choice.statA)}
                            ${stats.map((st) => `
                                <option value="${st}" ${choice.statA === st ? "selected" : ""}>${labels[st]} (Current: ${ctx.getEffectiveAbilityScore(st)})</option>
                            `).join("")}
                        </select>
                    </div>
                    <div class="asi-select-wrap">
                        <label class="asi-select-label" for="asi-${key}-dual-b">Second Ability (+1):</label>
                        <select id="asi-${key}-dual-b" class="creator-select asi-stat-select" data-asi-field="statB" data-asi-key="${key}">
                            ${stats.map((st) => `
                                <option value="${st}" ${(choice.statB || "dex") === st ? "selected" : ""}>${labels[st]} (Current: ${ctx.getEffectiveAbilityScore(st)})</option>
                            `).join("")}
                        </select>
                    </div>
                ` : `
                    <div class="asi-select-wrap" style="flex: 2;">
                        <label class="asi-select-label" for="asi-${key}-feat">Choose Feat:</label>
                        <select id="asi-${key}-feat" class="creator-select asi-feat-select" data-asi-key="${key}">
                            ${availableFeats.map((f) => `
                                <option value="${f.id}" ${choice.featId === f.id ? "selected" : ""}>${f.name}${f.isEpicBoon ? " (Epic Boon)" : ""}</option>
                            `).join("")}
                        </select>
                        <p class="asi-feat-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">${currentFeat?.description}</p>
                    </div>
                    <div class="asi-select-wrap" style="flex: 1;">
                        <label class="asi-select-label" for="asi-${key}-feat-stat">Feat Ability (+1):</label>
                        <select id="asi-${key}-feat-stat" class="creator-select asi-stat-select" data-asi-field="statA" data-asi-key="${key}">
                            ${notChosen(choice.statA)}
                            ${allowedFeatStats.map((st) => `
                                <option value="${st}" ${choice.statA === st ? "selected" : ""}>${labels[st]} (Current: ${ctx.getEffectiveAbilityScore(st)})</option>
                            `).join("")}
                        </select>
                    </div>
                `}
            </div>
        </div>
    `;
}

export function renderStep5Abilities(ctx: CharacterCreatorContext): string {
    const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
    const labels: Record<AbilityName, string> = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
    const mode = ctx.state.abilityMode;
    const availablePoints = ctx.getAvailablePoints();

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Ability Scores</h3>
                <p class="panel-desc">Configure your base ability scores. Background bonuses are added automatically.</p>
            </div>

            ${ctx.state.dndBeyondId ? `
                <div class="creator-detail-box ddb-reread-box" style="margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                        <p class="card-body" style="margin: 0; flex: 1; min-width: 14rem;">
                            Imported from D&amp;D Beyond. Changed this character's ability scores or feats there?
                        </p>
                        <button type="button" class="creator-nav-btn secondary-btn ddb-reread-btn" aria-expanded="false" aria-controls="ddb-reread-confirm">
                            <i class="fa-solid fa-rotate" aria-hidden="true"></i> Re-read from D&amp;D Beyond
                        </button>
                    </div>
                    <div id="ddb-reread-confirm" class="ddb-reread-confirm" hidden style="margin-top: 0.75rem;">
                        <p class="card-body" style="margin: 0 0 0.5rem;">
                            This replaces the base scores, background bonuses, origin feat, and every Ability Score Improvement and feat choice here with what's on D&amp;D Beyond.
                        </p>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button type="button" class="creator-nav-btn ddb-reread-confirm-btn">Replace with D&amp;D Beyond's</button>
                            <button type="button" class="creator-nav-btn secondary-btn ddb-reread-cancel-btn">Cancel</button>
                        </div>
                    </div>
                    <p class="ddb-reread-status card-body" role="status" style="margin: 0.5rem 0 0;"></p>
                </div>
            ` : ""}

            <div class="ability-modes-tabs">
                <button type="button" class="tab-btn ${mode === "standard" ? "active" : ""}" data-mode="standard">Standard Array</button>
                <button type="button" class="tab-btn ${mode === "pointbuy" ? "active" : ""}" data-mode="pointbuy">Point Buy (27)</button>
                <button type="button" class="tab-btn ${mode === "roll" ? "active" : ""}" data-mode="roll">Roll 4d6 Drop Lowest</button>
                <button type="button" class="tab-btn ${mode === "manual" ? "active" : ""}" data-mode="manual">Manual Entry</button>
            </div>

            ${mode === "standard" ? `
                <div class="ability-mode-info-banner">
                    <span class="ability-info-title"><i class="fa-solid fa-list-ol"></i> Standard Array: 15, 14, 13, 12, 10, 8</span>
                    <p class="ability-info-desc">Assign numbers from the array to specific abilities. Choosing an already-assigned value automatically swaps with that ability.</p>
                </div>
            ` : ""}

            ${mode === "pointbuy" ? `
                <div class="point-buy-banner">
                    <div class="point-buy-header">
                        <span class="point-buy-title"><i class="fa-solid fa-scale-balanced"></i> Point Buy</span>
                        <div class="point-buy-counter ${availablePoints === 0 ? "is-spent" : ""}">
                            <span class="counter-label">Available Points:</span>
                            <strong class="counter-val" id="point-buy-available-val">${availablePoints} / 27</strong>
                        </div>
                    </div>
                    <p class="point-buy-desc">Base scores range from 8 (0 pts) to 15 (9 pts). Point costs: 9 (1 pt), 10 (2 pts), 11 (3 pts), 12 (4 pts), 13 (5 pts), 14 (7 pts), 15 (9 pts). Available points never exceed 27 or drop below 0.</p>
                </div>
            ` : ""}

            <div class="ability-scores-grid" style="margin-top: 1rem;">
                ${stats.map((stat) => {
                    const base = ctx.state.baseAbilities[stat] ?? 10;
                    const total = ctx.getEffectiveAbilityScore(stat);
                    const mod = ctx.getAbilityModifier(stat);
                    const modStr = (mod >= 0 ? "+" : "") + mod;
                    const bgBonus = total - base;

                    return `
                        <div class="ability-score-card" data-stat-card="${stat}">
                            <span class="ability-abbr">${labels[stat]}</span>
                            <div class="ability-score-display">${total}</div>
                            <span class="ability-mod-display">${modStr}</span>

                            ${mode === "standard" ? `
                                <div class="ability-inputs standard-array-inputs" style="width: 100%;">
                                    <select class="standard-array-select" data-stat="${stat}" aria-label="${labels[stat]} base score">
                                        ${STANDARD_ARRAY.map((val) => `
                                            <option value="${val}" ${base === val ? "selected" : ""}>Base: ${val}</option>
                                        `).join("")}
                                    </select>
                                </div>
                                <span class="ability-breakdown">${bgBonus > 0 ? `(+${bgBonus} from Background)` : "No BG bonus"}</span>
                            ` : mode === "pointbuy" ? `
                                <div class="ability-inputs point-buy-inputs">
                                    <button type="button" class="score-control-btn point-buy-dec-btn" data-stat="${stat}" ${!ctx.canDecrementPointBuy(stat) ? "disabled" : ""} title="Decrease ${labels[stat]} score">-</button>
                                    <span class="point-buy-score-display">${base}</span>
                                    <button type="button" class="score-control-btn point-buy-inc-btn" data-stat="${stat}" ${!ctx.canIncrementPointBuy(stat) ? "disabled" : ""} title="Increase ${labels[stat]} score">+</button>
                                </div>
                                <span class="point-buy-cost-breakdown">Cost: ${ctx.getPointBuyCost(base)} pts ${bgBonus > 0 ? `(+${bgBonus} BG)` : ""}</span>
                            ` : `
                                <div class="ability-inputs">
                                    <button type="button" class="score-control-btn score-dec-btn" data-stat="${stat}">-</button>
                                    <input type="number" class="score-num-input" data-stat="${stat}" min="3" max="20" value="${base}" />
                                    <button type="button" class="score-control-btn score-inc-btn" data-stat="${stat}">+</button>
                                </div>
                                <span class="ability-breakdown">Base: ${base} ${bgBonus > 0 ? `(+${bgBonus} BG)` : ""}</span>
                            `}
                        </div>
                    `;
                }).join("")}
            </div>

            ${mode === "roll" ? `
                <div style="margin-top: 1rem;">
                    <button type="button" id="roll-all-stats-btn" class="creator-nav-btn secondary-btn">
                        <i class="fa-solid fa-dice-d20"></i> Roll All Stats (4d6 Drop Lowest)
                    </button>
                </div>
            ` : ""}

            ${ctx.getAsiSlots().length > 0 ? `
                <div class="creator-detail-box asi-section" style="margin-top: 1.5rem;">
                    <h4><i class="fa-solid fa-arrow-up-right-dots"></i> Ability Score Improvements & Feats</h4>
                    <p class="card-body">Your character has reached levels that grant an Ability Score Improvement or Feat. Choose how to distribute your increases.</p>
                    <div class="asi-milestones-container">
                        ${ctx.getAsiSlots().map((slot) => renderAsiMilestoneCard(ctx, slot)).join("")}
                    </div>
                </div>
            ` : ""}
        </div>
    `;
}
