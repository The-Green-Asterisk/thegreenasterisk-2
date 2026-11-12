import el from "@elements";
import { getBucketSelection, syncFlatSpellSelections } from "../services/spellReconciliation";
import { AbilityName } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "./context";

export function initSpellsController(ctx: CharacterCreatorContext): void {
    const featAbility = el.creatorFeatSpellAbilitySelect as HTMLSelectElement | null;
    featAbility?.addEventListener("change", () => {
        ctx.state.featSpellAbility = featAbility.value as AbilityName;
        ctx.renderStep(ctx.state.currentStep);
        ctx.updateLiveSummary();
    }, { signal: el.signal });

    ctx.sanitizeSpellSelections();

    // Spell class filter tabs
    el.creatorSpellClassTabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const c = btn.getAttribute("data-class") || "all";
            ctx.activeSpellClassFilter = c;
            ctx.activeSpellLevelFilter = "all";
            ctx.renderStep(8);
        }, { signal: el.signal });
    });

    // Spell level filter tabs
    el.creatorSpellTabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const lvl = btn.getAttribute("data-level") || "all";
            ctx.activeSpellLevelFilter = lvl === "all" ? "all" : Number(lvl);
            ctx.renderStep(8);
        }, { signal: el.signal });
    });

    // Search filter input
    const searchInput = el.creatorSpellSearchInput as HTMLInputElement;
    searchInput?.addEventListener("input", (e) => {
        const q = (e.target as HTMLInputElement).value.toLowerCase().trim();
        ctx.spellSearchQuery = q;
        el.creatorSpellRows.forEach((row) => {
            const name = (row.getAttribute("data-spell-name") || "").toLowerCase();
            const school = (row.getAttribute("data-spell-school") || "").toLowerCase();
            const desc = (row.querySelector(".item-row-desc")?.textContent || "").toLowerCase();
            const matches = !q || name.includes(q) || school.includes(q) || desc.includes(q);
            (row as HTMLElement).style.display = matches ? "" : "none";
        });
    }, { signal: el.signal });

    // Auto-Fill spells button
    const autoBtn = el.creatorAutoSpellsButton;
    autoBtn?.addEventListener("click", () => {
        const smart = ctx.getSmartAutoFillSpells();
        ctx.state.classSpellSelections = smart.byBucket;
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
    }, { signal: el.signal });

    // Reset spells button
    const clearBtn = el.creatorClearSpellsButton;
    clearBtn?.addEventListener("click", () => {
        ctx.state.selectedCantrips = [];
        ctx.state.selectedSpellsLevel1 = [];
        ctx.state.classSpellSelections = {};
        ctx.state.featureSpellChoices = {};
        ctx.spellsWarningDismissed = false;
        ctx.hideAlert();
        ctx.renderStep(8);
    }, { signal: el.signal });

    // Feature / Progression spell toggles
    el.creatorFeatureSpellRows.forEach((row) => {
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
        }, { signal: el.signal });
    });

    // Cantrip and prepared spell toggles apply to the class whose tab is active
    const activeBucketKey = (): string | undefined => {
        const buckets = ctx.getSpellBuckets();
        return (buckets.find((b) => b.key === ctx.activeSpellClassFilter) || buckets[0])?.key;
    };
    const bindToggle = (selector: string, field: "cantrips" | "prepared") => {
        el.list(selector).forEach((row) => {
            const toggle = () => {
                // Progression-granted spells are bonus spells and cannot be added to the base allotment
                if (row.getAttribute("data-granted") === "true") return;
                const key = activeBucketKey();
                const spName = row.getAttribute("data-spell-name") || "";
                if (!key || !spName) return;
                const sel = getBucketSelection(ctx, key);
                sel[field] = sel[field].includes(spName)
                    ? sel[field].filter((s) => s !== spName)
                    : [...sel[field], spName];
                syncFlatSpellSelections(ctx);
                ctx.spellsWarningDismissed = false;
                ctx.hideAlert();
                ctx.renderStep(8);
                const rows = Array.from(el.list<HTMLElement>(selector));
                rows.find((r) => r.getAttribute("data-spell-name") === spName)?.focus();
            };
            row.addEventListener("click", toggle, { signal: el.signal });
            row.addEventListener("keydown", (e) => {
                const key = (e as KeyboardEvent).key;
                if (key === " " || key === "Enter") {
                    e.preventDefault();
                    toggle();
                }
            }, { signal: el.signal });
        });
    };
    bindToggle(".cantrip-row", "cantrips");
    bindToggle(".spell1-row", "prepared");
}
