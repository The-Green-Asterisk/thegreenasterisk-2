import { escapeHtml } from "@services/escape";
import el from "@elements";
import { StatModifier } from "../../../rules/dnd5e_2024/types";
import { effectTargetOption, renderEffectRow } from "../components/itemEffects";

type EffectsEditorElements = {
    list: HTMLElement | null;
    addButton: HTMLButtonElement | null;
    hint: HTMLElement | null;
    /** The dialog's Requires Attunement toggle: effects apply while equipped, and attuned when it's on */
    attunement: HTMLInputElement | null;
};

export type EffectsReadResult = { modifiers: StatModifier[]; invalid?: HTMLElement; problem?: string };

/**
 * The effects list in the Edit Weapon / Magic Item dialogs. Each row's controls follow its stat: the effect types it
 * takes, a value when the type needs one, and an armor state for AC. Effects the dialog can't edit are kept as is.
 */
export function createItemEffectsEditor(els: EffectsEditorElements) {
    // The modifier each row was loaded from, to keep fields the dialog doesn't show (description, label, ...)
    let originals: Array<StatModifier | undefined> = [];
    let snapshot = "[]";

    const rows = () => Array.from(els.list?.querySelectorAll<HTMLElement>(".item-effect-row") || []);

    function syncRow(row: HTMLElement, mod?: StatModifier) {
        const targetSelect = row.querySelector<HTMLSelectElement>(".effect-target");
        const typeSelect = row.querySelector<HTMLSelectElement>(".effect-type");
        const valueField = row.querySelector<HTMLElement>(".effect-value-field");
        const valueInput = row.querySelector<HTMLInputElement>(".effect-value");
        const plusField = row.querySelector<HTMLElement>(".effect-plus-field");
        const plusBox = row.querySelector<HTMLInputElement>(".effect-plus");
        const requiresField = row.querySelector<HTMLElement>(".effect-requires-field");
        const requiresSelect = row.querySelector<HTMLSelectElement>(".effect-requires");
        if (!targetSelect || !typeSelect || !valueInput || !plusBox) return;

        const loaded = mod ? effectTargetOption(String(mod.target)) : undefined;
        if (loaded) targetSelect.value = loaded.target;
        const option = effectTargetOption(targetSelect.value);
        const previousType = mod?.type || typeSelect.value;
        typeSelect.innerHTML = (option?.types || []).map(t => `<option value="${t.type}">${escapeHtml(t.label)}</option>`).join("");
        typeSelect.disabled = !option;
        if (option?.types.some(t => t.type === previousType)) typeSelect.value = previousType;

        const typeOption = option?.types.find(t => t.type === typeSelect.value);
        const needsValue = !!typeOption?.value;
        valueField?.classList.toggle("hidden", !needsValue);
        plusField?.classList.toggle("hidden", typeOption?.value !== "number");
        requiresField?.classList.toggle("hidden", !option?.armorState);
        valueInput.min = typeOption?.value === "number" ? "" : "0";

        if (mod) {
            plusBox.checked = mod.value === "{{plus}}";
            valueInput.value = typeof mod.value === "number" ? String(mod.value) : "";
            if (requiresSelect) requiresSelect.value = mod.requires || "";
        }
        if (typeOption?.value !== "number") plusBox.checked = false;
        valueInput.disabled = plusBox.checked;
    }

    function renumber() {
        rows().forEach((row, i) => {
            const legend = row.querySelector("legend");
            if (legend) legend.textContent = `Effect ${i + 1}`;
            row.querySelector(".effect-remove-btn")?.setAttribute("aria-label", `Remove effect ${i + 1}`);
        });
    }

    function render(mods: StatModifier[]) {
        if (!els.list) return;
        originals = [...mods];
        els.list.innerHTML = mods.map((m, i) => renderEffectRow(i, m)).join("");
        rows().forEach((row, i) => {
            if (!row.classList.contains("is-other")) syncRow(row, mods[i]);
        });
    }

    function updateHint() {
        if (els.hint) {
            els.hint.textContent = els.attunement?.checked
                ? "These apply while the item is equipped and attuned."
                : "These apply while the item is equipped.";
        }
    }

    function read(): EffectsReadResult {
        const modifiers: StatModifier[] = [];
        for (const [i, row] of rows().entries()) {
            const original = originals[i];
            if (row.classList.contains("is-other")) {
                if (original) modifiers.push(original);
                continue;
            }
            const targetSelect = row.querySelector<HTMLSelectElement>(".effect-target")!;
            const option = effectTargetOption(targetSelect.value);
            if (!option) return { modifiers, invalid: targetSelect, problem: `Choose a stat for effect ${i + 1}.` };
            const typeOption = option.types.find(t => t.type === row.querySelector<HTMLSelectElement>(".effect-type")?.value) || option.types[0];

            // Fields the dialog doesn't show carry over while the effect is still the same kind of effect
            const sameKind = original && effectTargetOption(String(original.target))?.target === option.target && original.type === typeOption.type;
            // (an older target such as "vitals.darkvision" stays as written, so an untouched effect isn't a change)
            const mod: StatModifier = sameKind ? { ...original! } : { target: option.target, type: typeOption.type };
            delete mod.value;
            delete mod.requires;

            if (typeOption.value) {
                const plus = row.querySelector<HTMLInputElement>(".effect-plus");
                const input = row.querySelector<HTMLInputElement>(".effect-value")!;
                if (plus?.checked && typeOption.value === "number") {
                    mod.value = "{{plus}}";
                } else {
                    const n = Number(input.value);
                    if (input.value.trim() === "" || !Number.isInteger(n) || (typeOption.value !== "number" && n <= 0)) {
                        return { modifiers, invalid: input, problem: `Enter a whole number for effect ${i + 1} (${option.label}).` };
                    }
                    mod.value = n;
                }
            }
            if (option.armorState) {
                const requires = row.querySelector<HTMLSelectElement>(".effect-requires")?.value;
                if (requires) mod.requires = requires as StatModifier["requires"];
            }
            modifiers.push(mod);
        }
        return { modifiers };
    }

    els.list?.addEventListener("change", (event) => {
        const target = event.target as HTMLElement;
        const row = target.closest<HTMLElement>(".item-effect-row");
        if (!row) return;
        if (target.classList.contains("effect-target") || target.classList.contains("effect-type") || target.classList.contains("effect-plus")) {
            syncRow(row);
        }
    }, { signal: el.signal });
    els.list?.addEventListener("click", (event) => {
        const remove = (event.target as HTMLElement).closest<HTMLButtonElement>(".effect-remove-btn");
        if (!remove) return;
        const row = remove.closest<HTMLElement>(".item-effect-row");
        if (!row) return;
        const index = rows().indexOf(row);
        const next = rows()[index + 1] || rows()[index - 1];
        originals.splice(index, 1);
        row.remove();
        renumber();
        (next?.querySelector<HTMLElement>("select, button") || els.addButton)?.focus();
    }, { signal: el.signal });
    els.addButton?.addEventListener("click", () => {
        if (!els.list) return;
        const index = rows().length;
        originals.push(undefined);
        els.list.insertAdjacentHTML("beforeend", renderEffectRow(index));
        const row = rows()[index];
        syncRow(row);
        row.querySelector<HTMLSelectElement>(".effect-target")?.focus();
    }, { signal: el.signal });
    els.attunement?.addEventListener("change", updateHint, { signal: el.signal });

    return {
        /** Shows these effects; what's shown now counts as unchanged */
        load(mods: StatModifier[] | undefined) {
            render(Array.isArray(mods) ? mods : []);
            updateHint();
            snapshot = JSON.stringify(read().modifiers);
        },
        read,
        isDirty(): boolean {
            const { modifiers, invalid } = read();
            return !!invalid || JSON.stringify(modifiers) !== snapshot;
        }
    };
}
