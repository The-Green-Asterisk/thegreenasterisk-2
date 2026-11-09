import { ProgressionChoice, ProgressionLevel, StatModifier } from "../../../rules/dnd5e_2024";
import { CreatorState } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

/** A modifier from a class/subclass progression feature or chosen option, with what granted it. */
export interface ProgressionModifier extends StatModifier {
    source: string;
    classId: string;
    /** The granting class's level, for valueByLevel / perClassLevel */
    classLevel: number;
}

// Older creator state keeps a few progression choices in their own fields rather than subclassFeatureChoices
const CHOICE_STATE_FIELDS: Record<string, keyof CreatorState> = {
    "divine-order": "divineOrder",
    "primal-order": "primalOrder",
    "fighting-style": "fightingStyle"
};

/**
 * The option the player chose for a progression choice. The Class step stores choices under
 * "<classId>-<level>-<choice id>" or "<classId>-<level>-<subclass id>", or under the choice id itself.
 */
export function chosenOptionId(
    ctx: CharacterCreatorContext,
    classId: string,
    subclassId: string,
    level: number,
    choice: ProgressionChoice
): string | undefined {
    const stored = ctx.state.subclassFeatureChoices || {};
    const keys = [
        `${classId}-${level}-${choice.id}`,
        choice.choiceId ? `${classId}-${level}-${choice.choiceId}` : "",
        subclassId ? `${classId}-${level}-${subclassId}` : "",
        choice.choiceId || "",
        choice.id
    ];
    for (const key of keys) {
        if (key && stored[key]) return stored[key];
    }
    const field = CHOICE_STATE_FIELDS[choice.id] || (choice.choiceId ? CHOICE_STATE_FIELDS[choice.choiceId] : undefined);
    const value = field ? ctx.state[field] : undefined;
    return typeof value === "string" && value ? value : undefined;
}

/** Each class with its subclass, and the progression levels both have unlocked at the class's level. */
function unlockedProgression(ctx: CharacterCreatorContext) {
    const result: Array<{ classId: string; subclassId: string; classLevel: number; level: ProgressionLevel }> = [];
    for (const cc of ctx.state.classes || []) {
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        if (!cls) continue;
        const subclassId = ctx.resolveCanonicalSubclassId(cc.classId, cc.subclassId);
        const sub = cls.subclasses?.find((s) => s.id === subclassId);
        for (const levels of [cls.progression || [], sub?.progression || []]) {
            for (const pl of levels) {
                if (pl.level <= (cc.level || 0)) result.push({ classId: cc.classId, subclassId, classLevel: cc.level || 0, level: pl });
            }
        }
    }
    return result;
}

/**
 * Every modifier the character's class and subclass progressions grant up to each class's level: from features and
 * from the options chosen in progression choices.
 */
export function getProgressionModifiers(ctx: CharacterCreatorContext): ProgressionModifier[] {
    const result: ProgressionModifier[] = [];
    for (const { classId, subclassId, classLevel, level } of unlockedProgression(ctx)) {
        for (const f of level.features || []) {
            for (const m of f.modifiers || []) result.push({ ...m, source: f.name, classId, classLevel });
        }
        for (const choice of level.choices || []) {
            const optId = chosenOptionId(ctx, classId, subclassId, level.level, choice);
            const opt = choice.options?.find((o) => o.id === optId);
            if (!opt) continue;
            const source = opt.name === choice.name ? opt.name : `${choice.name}: ${opt.name}`;
            for (const m of opt.modifiers || []) result.push({ ...m, source, classId, classLevel });
        }
    }
    return result;
}

/** Whether a progression choice with this id is unlocked for any of the character's classes. */
export function hasUnlockedProgressionChoice(ctx: CharacterCreatorContext, choiceId: string): boolean {
    return unlockedProgression(ctx).some(({ level }) => (level.choices || []).some((c) => c.id === choiceId || c.choiceId === choiceId));
}

/** A numeric modifier's value: fixed, by the granting class's level, or per class level. */
export function modifierNumber(m: ProgressionModifier): number {
    if (Array.isArray(m.valueByLevel)) return Number(m.valueByLevel[Math.min(m.classLevel, m.valueByLevel.length - 1)]) || 0;
    if (typeof m.perClassLevel === "number") return m.perClassLevel * m.classLevel;
    return typeof m.value === "number" ? m.value : Number(m.value) || 0;
}

/** Whether a modifier's armor requirement is met. */
export function armorRequirementMet(m: StatModifier, armorCategory: string | null, hasShield: boolean): boolean {
    if (m.requires === "no-armor") return !armorCategory;
    if (m.requires === "no-heavy-armor") return armorCategory !== "Heavy";
    if (m.requires === "no-armor-or-shield") return !armorCategory && !hasShield;
    return true;
}
