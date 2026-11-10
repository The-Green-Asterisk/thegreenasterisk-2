import { ClassDefinition, ProgressionChoice, ProgressionChoiceOption, ProgressionLevel, SpellPick, StatModifier } from "../../../rules/dnd5e_2024";
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

/** Where the creator stores a progression choice: "<classId>-<level>-<choice id>". */
export function choiceStorageKey(classId: string, level: number, choice: ProgressionChoice): string {
    return `${classId}-${level}-${choice.id}`;
}

/**
 * Keys a choice may be stored under, newest first: the storage key, then keys older saves used
 * ("<classId>-<level>-<subclass id>", "<classId>-<level>", the choice's own id, and its declared legacyKeys).
 */
function candidateKeys(classId: string, subclassId: string, level: number, choice: ProgressionChoice, isSubclass: boolean): string[] {
    return [
        choiceStorageKey(classId, level, choice),
        choice.choiceId ? `${classId}-${level}-${choice.choiceId}` : "",
        isSubclass && subclassId ? `${classId}-${level}-${subclassId}` : "",
        `${classId}-${level}`,
        ...(choice.legacyKeys || []),
        choice.choiceId || "",
        choice.id
    ].filter(Boolean);
}

/**
 * The options the player chose for a progression choice (several for chooseCount > 1, stored comma-separated),
 * mapped from any legacy option ids.
 */
export function chosenOptionIds(
    ctx: CharacterCreatorContext,
    classId: string,
    subclassId: string,
    level: number,
    choice: ProgressionChoice,
    isSubclass = false
): string[] {
    const stored = ctx.state.subclassFeatureChoices || {};
    let raw: string | undefined;
    for (const key of candidateKeys(classId, subclassId, level, choice, isSubclass)) {
        if (stored[key]) {
            raw = stored[key];
            break;
        }
    }
    if (!raw) {
        const field = CHOICE_STATE_FIELDS[choice.id] || (choice.choiceId ? CHOICE_STATE_FIELDS[choice.choiceId] : undefined);
        const value = field ? ctx.state[field] : undefined;
        if (typeof value === "string" && value) raw = value;
    }
    if (!raw) return [];
    return raw.split(",").map((id) => id.trim()).filter(Boolean).map((id) => {
        const opt = choice.options?.find((o) => o.id === id || (o.legacyIds || []).includes(id));
        return opt ? opt.id : id;
    });
}

/** Back-compat single-option form of chosenOptionIds. */
export function chosenOptionId(
    ctx: CharacterCreatorContext,
    classId: string,
    subclassId: string,
    level: number,
    choice: ProgressionChoice
): string | undefined {
    return chosenOptionIds(ctx, classId, subclassId, level, choice)[0];
}

/** A progression choice for one of the character's classes, with what the player chose. */
export interface ProgressionChoiceEntry {
    classId: string;
    classIndex: number;
    subclassId: string;
    /** Class or subclass name the choice comes from */
    sourceName: string;
    isSubclass: boolean;
    level: number;
    unlocked: boolean;
    choice: ProgressionChoice;
    key: string;
    selectedIds: string[];
    selectedOptions: ProgressionChoiceOption[];
}

/**
 * Every single/limited progression choice (not pick lists like invocations) the character's classes and subclasses
 * offer, at all levels; unlocked when the class has reached the level.
 */
export function getProgressionChoices(ctx: CharacterCreatorContext): ProgressionChoiceEntry[] {
    const entries: ProgressionChoiceEntry[] = [];
    (ctx.state.classes || []).forEach((cc, classIndex) => {
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        if (!cls) return;
        const subclassId = ctx.resolveCanonicalSubclassId(cc.classId, cc.subclassId);
        entries.push(...progressionChoicesForClass(ctx, cls, subclassId, classIndex, cc.level || 0));
    });
    return entries;
}

/** The progression choices one class (with a given subclass) offers, at all levels. */
export function progressionChoicesForClass(
    ctx: CharacterCreatorContext,
    cls: ClassDefinition,
    subclassId: string,
    classIndex: number,
    classLevel: number
): ProgressionChoiceEntry[] {
    const entries: ProgressionChoiceEntry[] = [];
    const sub = subclassId ? cls.subclasses?.find((s) => s.id === subclassId) : undefined;
    const sets: Array<{ levels: ProgressionLevel[]; sourceName: string; isSubclass: boolean }> = [
        { levels: cls.progression || [], sourceName: cls.name, isSubclass: false },
        { levels: sub?.progression || [], sourceName: sub?.name || cls.name, isSubclass: true }
    ];
    for (const { levels, sourceName, isSubclass } of sets) {
        for (const pl of levels) {
            for (const choice of pl.choices || []) {
                if (choice.pool) continue;
                const selectedIds = chosenOptionIds(ctx, cls.id, subclassId, pl.level, choice, isSubclass);
                entries.push({
                    classId: cls.id,
                    classIndex,
                    subclassId,
                    sourceName,
                    isSubclass,
                    level: pl.level,
                    unlocked: pl.level <= classLevel,
                    choice,
                    key: choiceStorageKey(cls.id, pl.level, choice),
                    selectedIds,
                    selectedOptions: selectedIds
                        .map((id) => choice.options?.find((o) => o.id === id))
                        .filter((o): o is ProgressionChoiceOption => !!o)
                });
            }
        }
    }
    return entries;
}

/** Whether a choice is kept in its own creator state field (Fighting Style, Divine Order, Primal Order). */
export function isStateFieldChoice(choice: ProgressionChoice): boolean {
    return !!(CHOICE_STATE_FIELDS[choice.id] || (choice.choiceId && CHOICE_STATE_FIELDS[choice.choiceId]));
}

/** Every key a stored choice may be found under (its storage key and older saves' keys). */
export function choiceKeysFor(entry: ProgressionChoiceEntry): string[] {
    return candidateKeys(entry.classId, entry.subclassId, entry.level, entry.choice, entry.isSubclass);
}

/** Stores a choice under its storage key, clearing keys older saves used for it (and its state field, if any). */
export function setProgressionChoice(ctx: CharacterCreatorContext, entry: ProgressionChoiceEntry, optionIds: string[]): void {
    ctx.state.subclassFeatureChoices = ctx.state.subclassFeatureChoices || {};
    for (const key of candidateKeys(entry.classId, entry.subclassId, entry.level, entry.choice, entry.isSubclass)) {
        delete ctx.state.subclassFeatureChoices[key];
    }
    if (optionIds.length > 0) ctx.state.subclassFeatureChoices[entry.key] = optionIds.join(",");
    const field = CHOICE_STATE_FIELDS[entry.choice.id];
    if (field) (ctx.state as any)[field] = optionIds[0] || "";
}

/** Each class with its subclass, and the progression levels both have unlocked at the class's level. */
function unlockedProgression(ctx: CharacterCreatorContext) {
    const result: Array<{ classId: string; subclassId: string; classLevel: number; level: ProgressionLevel; isSubclass: boolean }> = [];
    for (const cc of ctx.state.classes || []) {
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        if (!cls) continue;
        const subclassId = ctx.resolveCanonicalSubclassId(cc.classId, cc.subclassId);
        const sub = cls.subclasses?.find((s) => s.id === subclassId);
        for (const [levels, isSubclass] of [[cls.progression || [], false], [sub?.progression || [], true]] as Array<[ProgressionLevel[], boolean]>) {
            for (const pl of levels) {
                if (pl.level <= (cc.level || 0)) result.push({ classId: cc.classId, subclassId, classLevel: cc.level || 0, level: pl, isSubclass });
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
    for (const { classId, subclassId, classLevel, level, isSubclass } of unlockedProgression(ctx)) {
        for (const f of level.features || []) {
            for (const m of f.modifiers || []) result.push({ ...m, source: f.name, classId, classLevel });
        }
        for (const choice of level.choices || []) {
            for (const optId of chosenOptionIds(ctx, classId, subclassId, level.level, choice, isSubclass)) {
                const opt = choice.options?.find((o) => o.id === optId);
                if (!opt) continue;
                const source = opt.name === choice.name ? opt.name : `${choice.name}: ${opt.name}`;
                for (const m of opt.modifiers || []) result.push({ ...m, source, classId, classLevel });
            }
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

/** A spell pick from a class/subclass feature, chosen option, or pick-list entry, with the class that grants it. */
export interface ActiveSpellPick extends SpellPick {
    classId: string;
    classLevel: number;
    /** Where it comes from (option or feature name), for "pick these on Step 8" notes */
    grantedBy: string;
    /** Progression level of the feature/choice that grants it */
    level: number;
}

/**
 * Every spell pick the character currently has: from unlocked features, chosen options (including choices kept in
 * their own state fields), and chosen pick-list entries (state[pool], e.g. state.invocations).
 */
export function getActiveSpellPicks(ctx: CharacterCreatorContext): ActiveSpellPick[] {
    const picks: ActiveSpellPick[] = [];
    const add = (list: SpellPick[] | undefined, classId: string, classLevel: number, grantedBy: string, level: number) => {
        for (const p of list || []) {
            if (!picks.some((x) => x.id === p.id)) picks.push({ ...p, classId, classLevel, grantedBy, level });
        }
    };
    for (const { classId, subclassId, classLevel, level, isSubclass } of unlockedProgression(ctx)) {
        for (const f of level.features || []) add(f.spellPicks, classId, classLevel, f.name, level.level);
        for (const choice of level.choices || []) {
            const selected = choice.pool
                ? (Array.isArray((ctx.state as any)[choice.pool]) ? ((ctx.state as any)[choice.pool] as string[]) : [])
                : chosenOptionIds(ctx, classId, subclassId, level.level, choice, isSubclass);
            for (const id of selected) {
                const opt = choice.options?.find((o) => o.id === id);
                if (opt) add(opt.spellPicks, classId, classLevel, opt.name, level.level);
            }
        }
    }
    return picks;
}

/** A pick list (pool) a class or subclass offers, e.g. Eldritch Invocations; picks are kept in state[pool]. */
export interface ProgressionPool {
    pool: string;
    name: string;
    prompt: string;
    classId: string;
    classIndex: number;
    classLevel: number;
    sourceName: string;
    isSubclass: boolean;
    /** First level the pick list appears at */
    level: number;
    options: ProgressionChoiceOption[];
    /** From scalingTraits["<pool>ByLevel"] at the class's level */
    max: number;
}

/** Options available at a class level: those without a minLevel, or whose minLevel the class has reached. */
export function optionAvailableAt(opt: ProgressionChoiceOption, classLevel: number): boolean {
    const minLevel = Number((opt as any).minLevel) || 0;
    return classLevel >= minLevel;
}

/** The pick lists each of the character's classes (and their subclasses) offer. */
export function getProgressionPools(ctx: CharacterCreatorContext): ProgressionPool[] {
    const pools: ProgressionPool[] = [];
    (ctx.state.classes || []).forEach((cc, classIndex) => {
        const cls = ctx.classes.find((c) => c.id === cc.classId);
        if (!cls) return;
        const subclassId = ctx.resolveCanonicalSubclassId(cc.classId, cc.subclassId);
        const sub = subclassId ? cls.subclasses?.find((s) => s.id === subclassId) : undefined;
        pools.push(...progressionPoolsForClass(cls, sub, classIndex, cc.level || 0));
    });
    return pools;
}

/** The pick lists one class (with a given subclass) offers. */
export function progressionPoolsForClass(
    cls: ClassDefinition,
    sub: ClassDefinition["subclasses"][number] | undefined,
    classIndex: number,
    classLevel: number
): ProgressionPool[] {
    const pools: ProgressionPool[] = [];
    const sets: Array<{ levels: ProgressionLevel[]; owner: any; sourceName: string; isSubclass: boolean }> = [
        { levels: cls.progression || [], owner: cls, sourceName: cls.name, isSubclass: false },
        { levels: (sub?.progression || []) as ProgressionLevel[], owner: sub, sourceName: sub?.name || cls.name, isSubclass: true }
    ];
    for (const { levels, owner, sourceName, isSubclass } of sets) {
        for (const pl of [...levels].sort((a, b) => a.level - b.level)) {
            for (const choice of pl.choices || []) {
                if (!choice.pool) continue;
                const existing = pools.find((p) => p.pool === choice.pool);
                if (existing) {
                    for (const opt of choice.options || []) {
                        if (!existing.options.some((o) => o.id === opt.id)) existing.options.push(opt);
                    }
                    continue;
                }
                const table: number[] | undefined = owner?.scalingTraits?.[`${choice.pool}ByLevel`];
                pools.push({
                    pool: choice.pool,
                    name: choice.name,
                    prompt: choice.description || choice.prompt || "",
                    classId: cls.id,
                    classIndex,
                    classLevel,
                    sourceName,
                    isSubclass,
                    level: pl.level,
                    options: [...(choice.options || [])],
                    max: Array.isArray(table) ? (table[Math.min(classLevel, table.length - 1)] || 0) : (choice.chooseCount || 0)
                });
            }
        }
    }
    return pools;
}

/** A pick list's singular label, e.g. "Eldritch Invocations" -> "Eldritch Invocation", "Maneuvers" -> "Maneuver". */
export function poolSingular(name: string): string {
    return name.replace(/s$/i, "");
}
