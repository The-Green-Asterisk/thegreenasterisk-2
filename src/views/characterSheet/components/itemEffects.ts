import { StatModifier } from "../../../rules/dnd5e_2024/types";

/**
 * The item effects the Edit Weapon / Magic Item dialogs offer: exactly the StatModifier targets and types the sheet
 * reads for items (magicItemBonuses.ts#extractItemMagicBonuses, senses.ts). See docs/character-rules-data.md.
 */
export type EffectValueKind = "number" | "score" | "feet";
export type EffectTypeOption = { type: StatModifier["type"]; label: string; value?: EffectValueKind };
export type EffectTargetOption = { target: string; label: string; group: string; types: EffectTypeOption[]; armorState?: boolean };

const BONUS: EffectTypeOption = { type: "bonus", label: "Bonus (+N)", value: "number" };
const ADVANTAGE: EffectTypeOption = { type: "advantage", label: "Advantage" };
const DISADVANTAGE: EffectTypeOption = { type: "disadvantage", label: "Disadvantage" };

const ABILITIES: Array<[string, string]> = [["str", "Strength"], ["dex", "Dexterity"], ["con", "Constitution"], ["int", "Intelligence"], ["wis", "Wisdom"], ["cha", "Charisma"]];
const SKILLS = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation",
    "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"];
const SENSES: Array<[string, string]> = [["darkvision", "Darkvision"], ["blindsight", "Blindsight"], ["tremorsense", "Tremorsense"], ["truesight", "Truesight"]];
const SENSE_TYPES: EffectTypeOption[] = [
    { type: "set", label: "Reaches at least (ft.)", value: "feet" },
    { type: "bonus", label: "Reaches farther by (ft.)", value: "feet" }
];

const skillSlug = (skill: string) => skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const ITEM_EFFECT_TARGETS: EffectTargetOption[] = [
    ...ABILITIES.map(([ab, name]): EffectTargetOption => ({
        target: `abilities.${ab}`, label: name, group: "Ability Scores",
        types: [{ type: "set", label: "Score becomes at least", value: "score" }, { type: "bonus", label: "Score increases by", value: "number" }]
    })),
    { target: "vitals.ac", label: "Armor Class", group: "Defense", types: [BONUS], armorState: true },
    { target: "saves.all", label: "All saving throws", group: "Defense", types: [BONUS, ADVANTAGE, DISADVANTAGE] },
    ...ABILITIES.map(([ab, name]): EffectTargetOption => ({ target: `saves.${ab}`, label: `${name} saving throws`, group: "Defense", types: [ADVANTAGE, DISADVANTAGE] })),
    { target: "checks.all", label: "All ability checks", group: "Checks and Skills", types: [BONUS] },
    ...SKILLS.map((skill): EffectTargetOption => ({ target: `skills.${skillSlug(skill)}`, label: `${skill} checks`, group: "Checks and Skills", types: [ADVANTAGE, DISADVANTAGE] })),
    { target: "spells.attack", label: "Spell attack bonus", group: "Spellcasting", types: [BONUS] },
    { target: "spells.dc", label: "Spell save DC", group: "Spellcasting", types: [BONUS] },
    { target: "vitals.initiative", label: "Initiative", group: "Combat and Movement", types: [BONUS, ADVANTAGE] },
    { target: "vitals.speed", label: "Speed", group: "Combat and Movement", types: [{ type: "bonus", label: "Faster by (ft.)", value: "feet" }] },
    { target: "item.plus", label: "This item's +N (attack and damage, or AC)", group: "Combat and Movement", types: [{ type: "set", label: "Is", value: "number" }] },
    ...SENSES.map(([key, name]): EffectTargetOption => ({ target: `senses.${key}`, label: name, group: "Senses", types: SENSE_TYPES }))
];

export const ARMOR_STATES: Array<[string, string]> = [
    ["", "Always"],
    ["no-armor-or-shield", "Not wearing armor or a shield"],
    ["no-armor", "Not wearing armor"],
    ["no-heavy-armor", "Not wearing heavy armor"],
    ["armor", "Wearing armor"]
];

/** The catalog entry for a modifier's target; older sense targets ("vitals.darkvision") count as their senses.* entry */
export function effectTargetOption(target: string): EffectTargetOption | undefined {
    const normalized = /^vitals\.(darkvision|blindsight|tremorsense|truesight)$/.test(target) ? `senses.${target.slice(7)}` : target;
    return ITEM_EFFECT_TARGETS.find(t => t.target === normalized);
}

/** Whether the dialog can edit a modifier; anything else is kept as is and shown as "Other effect" */
export function isEditableEffect(mod: StatModifier): boolean {
    const option = effectTargetOption(String(mod?.target || ""));
    return !!option && option.types.some(t => t.type === mod.type);
}

/** "Strength: Score becomes at least 19" for effects the dialog can't edit, or a readable fallback */
export function describeEffect(mod: StatModifier): string {
    const option = effectTargetOption(String(mod.target || ""));
    const type = option?.types.find(t => t.type === mod.type)?.label || mod.type;
    const value = mod.value !== undefined ? ` ${mod.value}` : "";
    return mod.description || `${option?.label || mod.target}: ${type}${value}`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function targetOptions(selected: string): string {
    const groups = [...new Set(ITEM_EFFECT_TARGETS.map(t => t.group))];
    return `<option value="">Choose a stat</option>` + groups.map(group => `<optgroup label="${esc(group)}">${ITEM_EFFECT_TARGETS.filter(t => t.group === group)
        .map(t => `<option value="${t.target}"${t.target === selected ? " selected" : ""}>${esc(t.label)}</option>`).join("")}</optgroup>`).join("");
}

/** One effect: what it changes, how, by how much, and (for AC) in which armor state */
export function renderEffectRow(index: number, mod?: StatModifier): string {
    const n = index + 1;
    if (mod && !isEditableEffect(mod)) {
        return `
            <li class="item-effect-row is-other" data-effect-other="${index}">
                <span class="item-effect-other-text"><strong>Other effect:</strong> ${esc(describeEffect(mod))}</span>
                <button type="button" class="effect-remove-btn" aria-label="Remove effect ${n}"><i class="fa-solid fa-trash" aria-hidden="true"></i> Remove</button>
            </li>`;
    }
    const option = mod ? effectTargetOption(String(mod.target)) : undefined;
    return `
            <li class="item-effect-row">
                <fieldset class="item-effect-fieldset">
                    <legend class="visually-hidden">Effect ${n}</legend>
                    <label class="form-field">
                        <span class="form-label">Stat</span>
                        <select class="effect-target" required>${targetOptions(option?.target || "")}</select>
                    </label>
                    <label class="form-field">
                        <span class="form-label">Effect</span>
                        <select class="effect-type"></select>
                    </label>
                    <label class="form-field effect-value-field">
                        <span class="form-label">Value</span>
                        <input type="number" class="effect-value" step="1" inputmode="numeric" />
                    </label>
                    <label class="effect-plus-field">
                        <input type="checkbox" class="effect-plus" />
                        <span>Use the item's +N</span>
                    </label>
                    <label class="form-field effect-requires-field">
                        <span class="form-label">Only when</span>
                        <select class="effect-requires">${ARMOR_STATES.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select>
                    </label>
                    <button type="button" class="effect-remove-btn" aria-label="Remove effect ${n}"><i class="fa-solid fa-trash" aria-hidden="true"></i> Remove</button>
                </fieldset>
            </li>`;
}

/** The dialog section that holds the effects list */
export function renderItemEffectsSection(prefix: string): string {
    return `
                        <div class="form-section item-effects-section">
                            <div class="form-section-header">
                                <span class="form-section-title" id="${prefix}-effects-title"><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Effects on the Character (Optional)</span>
                            </div>
                            <p class="form-field-hint" id="${prefix}-effects-hint">These apply while the item is equipped.</p>
                            <p class="form-field-hint">Characters imported from D&amp;D Beyond take ability scores, AC, saves, and other numbers from D&amp;D Beyond, so for them only senses and a weapon's +N come from here.</p>
                            <ul class="item-effects-list" id="${prefix}-effects-list" aria-labelledby="${prefix}-effects-title"></ul>
                            <button type="button" class="scaling-action-btn" id="${prefix}-effects-add-btn">
                                <i class="fa-solid fa-plus" aria-hidden="true"></i> Add Effect
                            </button>
                        </div>`;
}
