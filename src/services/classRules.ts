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
