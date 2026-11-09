const DDB_ACTIVATION: Record<number, string> = {
    1: "1 Action",
    3: "1 Bonus Action",
    4: "1 Reaction",
    6: "1 Minute",
    7: "10 Minutes",
    8: "1 Hour",
    11: "Special"
};

/**
 * D&D Beyond spell definitions carry range, duration, casting time and components as objects/arrays; flattens them
 * into the same strings the character sheet shows (characterAdapter's addSpell).
 */
export function flattenDndBeyondSpellDefinition(def: any): { castingTime: string; range: string; duration: string; components: string } {
    const activation = DDB_ACTIVATION[def?.activation?.activationType] || "1 Action";
    const castingTime = def?.activation?.activationTime > 1
        ? `${def.activation.activationTime} ${activation.replace(/^1\s+/, "")}s`
        : activation;

    let range = "Self";
    if (def?.range && typeof def.range === "object") {
        if (def.range.rangeValue) range = `${def.range.rangeValue} ft.`;
        else if (def.range.origin) range = String(def.range.origin);
    } else if (typeof def?.range === "string") {
        range = def.range;
    }

    let duration = "Instantaneous";
    if (def?.duration && typeof def.duration === "object") {
        if (def.duration.durationInterval) duration = `${def.duration.durationInterval} ${def.duration.durationUnit || "Minute"}`;
        else if (def.duration.durationType) duration = String(def.duration.durationType);
    } else if (typeof def?.duration === "string") {
        duration = def.duration;
    }
    if (def?.concentration && !duration.toLowerCase().includes("concentration")) {
        duration = `Concentration, up to ${duration}`;
    }

    let components = "V, S";
    if (Array.isArray(def?.components)) {
        const list: string[] = [];
        if (def.components.includes(1)) list.push("V");
        if (def.components.includes(2)) list.push("S");
        if (def.components.includes(3)) list.push(def.componentsDescription ? `M (${def.componentsDescription})` : "M");
        components = list.join(", ") || "None";
    } else if (typeof def?.components === "string") {
        components = def.components;
    }

    return { castingTime, range, duration, components };
}

function parseSpellClasses(val?: string | null): string[] {
    if (!val) return [];
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(String);
    } catch { /* comma-separated */ }
    return String(val).split(",").map((c) => c.trim()).filter(Boolean);
}

/**
 * Merges what an import learned about a spell's class lists into what the database has: adds classes the import
 * proves (a class spell list that contains the spell), and removes a class the import proves wrong (the spell was
 * taken from another class's list). Returns the stored JSON value, unchanged when nothing changed.
 */
export function mergeSpellClasses(existing: string | null | undefined, add: string[] = [], removeClass?: string): string | null | undefined {
    let merged = parseSpellClasses(existing);
    for (const c of add) {
        if (!merged.includes(c)) merged.push(c);
    }
    if (removeClass) merged = merged.filter((c) => c !== removeClass);
    const next = JSON.stringify(merged);
    if (merged.length === 0 && !existing) return existing;
    return next === existing ? existing : next;
}
