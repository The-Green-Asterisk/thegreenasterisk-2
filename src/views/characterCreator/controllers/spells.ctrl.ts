import { CharacterCreatorContext } from "./context";

export function initSpellsController(ctx: CharacterCreatorContext): void {
    ctx.sanitizeSpellSelections();

    // Spell class filter tabs
    document.querySelectorAll(".spell-class-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const c = btn.getAttribute("data-class") || "all";
            ctx.activeSpellClassFilter = c;
            ctx.renderStep(8);
        });
    });

    // Spell level filter tabs
    document.querySelectorAll(".spell-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const lvl = btn.getAttribute("data-level") || "all";
            ctx.activeSpellLevelFilter = lvl === "all" ? "all" : Number(lvl);
            ctx.renderStep(8);
        });
    });

    // Search filter input
    const searchInput = document.getElementById("spell-search-input") as HTMLInputElement;
    searchInput?.addEventListener("input", (e) => {
        const q = (e.target as HTMLInputElement).value.toLowerCase().trim();
        ctx.spellSearchQuery = q;
        document.querySelectorAll(".spell1-row, .feature-spell-row").forEach((row) => {
            const name = (row.getAttribute("data-spell-name") || "").toLowerCase();
            const school = (row.getAttribute("data-spell-school") || "").toLowerCase();
            const desc = (row.querySelector(".item-row-desc")?.textContent || "").toLowerCase();
            const matches = !q || name.includes(q) || school.includes(q) || desc.includes(q);
            (row as HTMLElement).style.display = matches ? "" : "none";
        });
    });

    // Auto-Fill spells button
    const autoBtn = document.querySelector(".auto-spells-btn");
    autoBtn?.addEventListener("click", () => {
        const smart = ctx.getSmartAutoFillSpells();
        ctx.state.selectedCantrips = smart.cantrips;
        ctx.state.selectedSpellsLevel1 = smart.prepared;
        const usedNames = new Set([...smart.cantrips, ...smart.prepared]);
        for (const sec of ctx.getFeatureSpellChoiceSections()) {
            const preferred = sec.availableSpells.filter((sp) => !usedNames.has(sp.name));
            const pool = preferred.length >= sec.chooseCount ? preferred : sec.availableSpells;
            const chosen = pool.slice(0, sec.chooseCount).map((sp) => sp.name);
            ctx.state.featureSpellChoices[sec.id] = chosen;
            chosen.forEach((n) => usedNames.add(n));
        }
        ctx.spellsWarningDismissed = false;
        ctx.hideAlert();
        ctx.renderStep(8);
    });

    // Reset spells button
    const clearBtn = document.querySelector(".clear-spells-btn");
    clearBtn?.addEventListener("click", () => {
        ctx.state.selectedCantrips = [];
        ctx.state.selectedSpellsLevel1 = [];
        ctx.state.featureSpellChoices = {};
        ctx.spellsWarningDismissed = false;
        ctx.hideAlert();
        ctx.renderStep(8);
    });

    // Feature / Progression spell toggles
    document.querySelectorAll(".feature-spell-row").forEach((row) => {
        row.addEventListener("click", () => {
            const secId = row.getAttribute("data-feature-section-id") || "";
            const spName = row.getAttribute("data-spell-name") || "";
            if (!secId || !spName) return;
            const sec = ctx.getFeatureSpellChoiceSections().find((s) => s.id === secId);
            const maxCount = sec?.chooseCount ?? 1;
            const current = Array.isArray(ctx.state.featureSpellChoices[secId])
                ? [...ctx.state.featureSpellChoices[secId]]
                : [];
            if (current.includes(spName)) {
                ctx.state.featureSpellChoices[secId] = current.filter((n) => n !== spName);
            } else if (current.length < maxCount) {
                ctx.state.featureSpellChoices[secId] = [...current, spName];
            } else if (maxCount === 1) {
                ctx.state.featureSpellChoices[secId] = [spName];
            }
            ctx.spellsWarningDismissed = false;
            ctx.hideAlert();
            ctx.renderStep(8);
        });
    });

    // Cantrip toggles
    document.querySelectorAll(".cantrip-row").forEach((row) => {
        row.addEventListener("click", () => {
            const spName = row.getAttribute("data-spell-name") || "";
            if (ctx.state.selectedCantrips.includes(spName)) {
                ctx.state.selectedCantrips = ctx.state.selectedCantrips.filter((s) => s !== spName);
            } else {
                ctx.state.selectedCantrips.push(spName);
            }
            ctx.spellsWarningDismissed = false;
            ctx.hideAlert();
            ctx.renderStep(8);
        });
    });

    // Prepared spell toggles
    document.querySelectorAll(".spell1-row").forEach((row) => {
        row.addEventListener("click", () => {
            const spName = row.getAttribute("data-spell-name") || "";
            if (ctx.state.selectedSpellsLevel1.includes(spName)) {
                ctx.state.selectedSpellsLevel1 = ctx.state.selectedSpellsLevel1.filter((s) => s !== spName);
            } else {
                ctx.state.selectedSpellsLevel1.push(spName);
            }
            ctx.spellsWarningDismissed = false;
            ctx.hideAlert();
            ctx.renderStep(8);
        });
    });
}
