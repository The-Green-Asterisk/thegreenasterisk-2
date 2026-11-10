import { getClassRules } from "../../services/classRules";
import { ClassDefinition, ProgressionChoice, ProgressionChoiceOption, ProgressionLevel } from "./types";

export interface FeatureOption extends ProgressionChoiceOption {
    minLevel?: number;
}

interface ChoiceSource {
    classId: string;
    subclassId?: string;
    level: number;
    choice: ProgressionChoice;
}

/** Every progression choice (pick lists included) in the class rules, with where it comes from. */
function allChoiceSources(classes: ClassDefinition[]): ChoiceSource[] {
    const sources: ChoiceSource[] = [];
    const add = (classId: string, subclassId: string | undefined, progression: ProgressionLevel[] | undefined) => {
        for (const pl of progression || []) {
            for (const choice of pl.choices || []) sources.push({ classId, subclassId, level: pl.level, choice });
        }
    };
    for (const cls of classes) {
        add(cls.id, undefined, cls.progression);
        for (const sub of cls.subclasses || []) add(cls.id, sub.id, (sub as any).progression);
    }
    return sources;
}

/** Whether a stored choice kind names this choice: its id, pick list, older storage key, or "<class>-<level>-<subclass>". */
function kindMatches(src: ChoiceSource, kind: string): boolean {
    const k = kind.replace(/-\d+$/, "");
    const { choice } = src;
    if (choice.id === kind || choice.id === k) return true;
    if (choice.pool && (choice.pool === k || choice.pool.replace(/s$/, "") === k)) return true;
    if ((choice.legacyKeys || []).some((lk) => lk === kind || lk === k)) return true;
    if (src.subclassId && `${src.classId}-${src.level}-${src.subclassId}` === kind) return true;
    return `${src.classId}-${src.level}` === kind || `${src.classId}-${choice.id}` === kind;
}

function optionMatches(o: ProgressionChoiceOption, id: string): boolean {
    const ids = [o.id, ...(o.legacyIds || [])].map((x) => x.toLowerCase());
    return ids.some((x) => x === id || x.endsWith(`-${id}`) || x === `pact-of-the-${id}`);
}

/**
 * Finds a class or subclass choice option in the class rules (rule_classes, via /get-rules) by the kind it was
 * stored under and its id ("kind:id" in either argument works). Falls back to any choice with that option id.
 */
export function findClassOption(kind: string, optId: string, customOptions?: FeatureOption[]): FeatureOption | undefined {
    let targetKind = kind;
    let targetId = optId;

    if (!targetId && targetKind && targetKind.includes(":")) {
        const parts = targetKind.split(":");
        targetKind = parts[0];
        targetId = parts[1];
    } else if (targetId && targetId.includes(":")) {
        const parts = targetId.split(":");
        if (!targetKind) targetKind = parts[0];
        targetId = parts[1];
    }

    if (!targetId) return undefined;

    const normKind = (targetKind || "").toLowerCase().trim();
    const normId = targetId.toLowerCase().trim();

    if (Array.isArray(customOptions)) {
        const match = customOptions.find((o) => optionMatches(o, normId));
        if (match) return match;
    }

    const sources = allChoiceSources(getClassRules());
    for (const src of sources.filter((s) => kindMatches(s, normKind))) {
        const found = (src.choice.options || []).find((o) => optionMatches(o, normId));
        if (found) return found;
    }
    for (const src of sources) {
        const found = (src.choice.options || []).find((o) => optionMatches(o, normId));
        if (found) return found;
    }
    return undefined;
}
