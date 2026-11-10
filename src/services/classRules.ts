import { CLASSES_2024 } from "../rules/dnd5e_2024/classes";
import { ClassDefinition } from "../rules/dnd5e_2024/types";
import { getData } from "./request";

let classRules: ClassDefinition[] | null = null;
let loading: Promise<ClassDefinition[]> | null = null;

/**
 * The class rules (rule_classes, as served by /get-rules) once loaded; until then, or if loading failed, the offline
 * copy.
 */
export function getClassRules(): ClassDefinition[] {
    return classRules || CLASSES_2024;
}

export function setClassRules(classes: ClassDefinition[] | null): void {
    classRules = classes && classes.length > 0 ? classes : null;
}

/** Loads the class rules once; later calls reuse the same request. Never rejects. */
export function loadClassRules(): Promise<ClassDefinition[]> {
    if (!loading) {
        loading = getData<any>("/get-rules")
            .then((rules) => {
                if (Array.isArray(rules?.classes)) setClassRules(rules.classes);
                return getClassRules();
            })
            .catch(() => getClassRules());
    }
    return loading;
}

/** Finds a class by id or name. */
export function findClassRule(nameOrId: string): ClassDefinition | undefined {
    const key = (nameOrId || "").trim().toLowerCase();
    return getClassRules().find((c) => c.id === key || c.name.toLowerCase() === key);
}

/** Feature name variants to look up: the whole name, and either side of a "Feature: Option" colon. */
function featureNameKeys(name: string): string[] {
    const raw = String(name || "").trim().toLowerCase();
    const keys = [raw, raw.split(":")[0].trim()];
    if (raw.includes(":")) keys.push(raw.split(":").slice(1).join(":").trim());
    return keys.filter(Boolean);
}

/** The ids of every class whose own (not subclass) features include this feature name. */
export function getCanonicalClassesForFeature(name: string): string[] {
    const keys = featureNameKeys(name);
    return getClassRules()
        .filter((cls) => (cls.features || []).some((f) => keys.includes(String(f.name || "").trim().toLowerCase())))
        .map((cls) => cls.id);
}

/** Every subclass whose features include this feature name. */
export function getCanonicalSubclassesForFeature(name: string): Array<{ classSlug: string; subSlug: string; subName: string }> {
    const keys = featureNameKeys(name);
    const out: Array<{ classSlug: string; subSlug: string; subName: string }> = [];
    for (const cls of getClassRules()) {
        for (const sub of cls.subclasses || []) {
            if ((sub.features || []).some((f) => keys.includes(String(f.name || "").trim().toLowerCase()))) {
                out.push({ classSlug: cls.id, subSlug: sub.id, subName: sub.name });
            }
        }
    }
    return out;
}
