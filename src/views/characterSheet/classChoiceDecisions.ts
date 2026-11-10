import { findClassRule, getClassRules } from "../../services/classRules";
import { AbilityName, ClassDefinition, ProgressionChoice, ProgressionChoiceOption, ProgressionLevel } from "../../rules/dnd5e_2024/types";
import { FeatureChoiceOption } from "./characterData";

const ABILITY_IDS: Record<AbilityName, number> = { str: 1, dex: 2, con: 3, int: 4, wis: 5, cha: 6 };

const slug = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const norm = (s: string) => String(s || "").toLowerCase().replace(/<[^>]*>/g, " ").replace(/[^a-z0-9]+/g, " ").trim();

/** A class's rules and the subclass named on the character (matched loosely, since D&D Beyond names vary). */
export function resolveRuleClass(name: string, subclassName?: string): { def?: ClassDefinition; subclass?: ClassDefinition["subclasses"][number] } {
    const def = findClassRule(String(name || ""));
    const subName = slug(subclassName || "");
    const subclass = subName
        ? def?.subclasses?.find((s) => slug(s.name) === subName || subName.includes(slug(s.name)) || slug(s.name).includes(subName) || s.id === subName)
        : undefined;
    return { def, subclass };
}

/**
 * The single-pick class and subclass choices (not pick lists) the character's class levels have unlocked, from the
 * class rules.
 */
export function unlockedClassChoices(classes: Array<{ name: string; level: number; subclass?: string }>): ProgressionChoice[] {
    const seen = new Set<string>();
    const out: ProgressionChoice[] = [];
    for (const c of classes || []) {
        const { def, subclass } = resolveRuleClass(c.name, c.subclass);
        const level = Number(c.level) || 1;
        const levels = [...(def?.progression || []), ...(((subclass as any)?.progression || []) as ProgressionLevel[])];
        for (const pl of levels.filter((l) => l.level <= level)) {
            for (const choice of pl.choices || []) {
                if (choice.pool || (choice.options || []).length < 2) continue;
                const key = `${choice.id}|${choice.name}`;
                if (seen.has(key)) continue;
                seen.add(key);
                out.push(choice);
            }
        }
    }
    return out;
}

/** Every single-pick choice in the class rules, one per name (for features of a class that doesn't have the choice). */
export function allRuleClassChoices(): ProgressionChoice[] {
    const seen = new Set<string>();
    const out: ProgressionChoice[] = [];
    for (const cls of getClassRules()) {
        const levels = [...(cls.progression || []), ...(cls.subclasses || []).flatMap((sub) => ((sub as any).progression || []) as ProgressionLevel[])];
        for (const pl of levels) {
            for (const choice of pl.choices || []) {
                if (choice.pool || (choice.options || []).length < 2 || seen.has(choice.name.toLowerCase())) continue;
                seen.add(choice.name.toLowerCase());
                out.push(choice);
            }
        }
    }
    return out;
}

/**
 * The class choice a feature is about, matched by the choice's name ("Aspect of the Beast", "Divine Order") or, when
 * no feature carries that name, by D&D Beyond listing the chosen option as its own feature ("Thaumaturge"). The
 * option named in the feature, if any, is the default.
 */
export function matchClassChoice(
    featureName: string,
    choices: ProgressionChoice[],
    allFeatureNames: string[]
): { choice: ProgressionChoice; option?: ProgressionChoiceOption } | undefined {
    const n = norm(featureName);
    if (!n) return undefined;
    for (const choice of choices) {
        const cn = norm(choice.name);
        if (n === cn || n.startsWith(`${cn} `)) {
            const rest = n.slice(cn.length);
            return { choice, option: (choice.options || []).find((o) => rest.includes(norm(o.name))) };
        }
    }
    const names = allFeatureNames.map(norm);
    for (const choice of choices) {
        const cn = norm(choice.name);
        if (names.some((f) => f === cn || f.startsWith(`${cn} `))) continue;
        const option = (choice.options || []).find((o) => norm(o.name) === n);
        if (option) return { choice, option };
    }
    return undefined;
}

export function classChoiceOptions(choice: ProgressionChoice): FeatureChoiceOption[] {
    return (choice.options || []).map((o) => ({ value: `${choice.id}:${o.id}`, label: o.name }));
}

/** The decision ids a choice may be saved under: its own id, then older keys (choice.legacyKeys). */
export function classChoiceDecisionIds(prefix: string, choice: ProgressionChoice): string[] {
    return [choice.id, ...(choice.legacyKeys || [])].map((k) => `${prefix}:${k}:0`);
}

/** Finds the option a saved value ("kind:id", a bare id, an older id, or the option's name) refers to. */
export function findChoiceOption(choice: ProgressionChoice, saved?: string): ProgressionChoiceOption | undefined {
    if (!saved || saved === "none") return undefined;
    const id = (saved.includes(":") ? saved.split(":").slice(1).join(":") : saved).toLowerCase();
    return (choice.options || []).find((o) =>
        [o.id, ...(o.legacyIds || [])].some((x) => x.toLowerCase() === id) || norm(o.name) === norm(id)
    );
}

/** Modifier targets (class rules) and the D&D Beyond modifier subType each one shows up as. */
const COMBAT_TARGETS: Record<string, string | ((m: { condition?: string }) => string)> = {
    "attacks.ranged": "ranged-weapon-attacks",
    "vitals.ac": (m) => (/armor/i.test(String(m.condition || "")) ? "armored-armor-class" : "armor-class"),
    "damage.melee_one_handed": "one-handed-melee-attacks",
    "damage.thrown": "thrown-weapon-damage",
    "vitals.blindsight": "blindsight"
};

/**
 * D&D Beyond-style modifiers for a chosen option's skill effects (add an ability modifier to a skill, proficiency,
 * Expertise) and damage resistances, so the sheet can swap them when the choice changes.
 */
export function classChoiceModifiers(option: ProgressionChoiceOption | undefined, sourceKey: string): any[] {
    const mods: any[] = [];
    for (const m of option?.modifiers || []) {
        const target = String(m.target || "");
        if (target === "defenses.resistance" && typeof m.value === "string") {
            const dmg = m.value.toLowerCase();
            mods.push({ type: "resistance", subType: dmg, friendlySubtypeName: dmg.charAt(0).toUpperCase() + dmg.slice(1), isGranted: true, _sourceKey: sourceKey });
            continue;
        }
        // Combat targets and the D&D Beyond modifier each corresponds to (e.g. a Fighting Style's bonus)
        const combat = COMBAT_TARGETS[target];
        if (combat && (m.type === "bonus" || m.type === "set")) {
            const n = typeof m.value === "number" ? m.value : parseInt(String(m.value), 10);
            if (!Number.isFinite(n)) continue;
            const subType = typeof combat === "string" ? combat : combat(m);
            mods.push({ type: m.type === "set" ? "set-base" : "bonus", subType, value: n, fixedValue: n, isGranted: true, _sourceKey: sourceKey });
            continue;
        }
        if (!target.startsWith("skills.") || target === "skills.unproficient") continue;
        const subType = target.slice("skills.".length).replace(/_/g, "-");
        if (m.type === "ability_mod" && m.abilitySource) {
            mods.push({ type: "bonus", subType, statId: ABILITY_IDS[m.abilitySource], value: 0, isGranted: true, _sourceKey: sourceKey });
        } else if (m.type === "proficiency_tier") {
            mods.push({ type: m.value === "expertise" ? "expertise" : "proficiency", subType, isGranted: true, _sourceKey: sourceKey });
        }
    }
    return mods;
}
