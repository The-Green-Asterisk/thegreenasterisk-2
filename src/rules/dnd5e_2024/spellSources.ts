import { ClassDefinition, ProgressionLevel, SpellPick } from "./types";

/** Every spell pick in the class rules: from features and from choice options (pick lists included). */
export function allClassSpellPicks(classes: ClassDefinition[]): SpellPick[] {
    const levels: ProgressionLevel[] = classes.flatMap((c) => [
        ...(c.progression || []),
        ...(c.subclasses || []).flatMap((s) => ((s as any).progression || []) as ProgressionLevel[])
    ]);
    return levels.flatMap((pl) => [
        ...(pl.features || []).flatMap((f) => f.spellPicks || []),
        ...(pl.choices || []).flatMap((ch) => (ch.options || []).flatMap((o) => o.spellPicks || []))
    ]);
}

/**
 * Lower-case spell sources (pick sourceLabel and sourceAliases) for class spell picks that don't use the class's
 * cantrip or prepared numbers (countsAgainstLimit not set), e.g. "warlock / pact of the tome".
 */
export function uncountedClassSpellSources(classes: ClassDefinition[]): string[] {
    const out = new Set<string>();
    for (const p of allClassSpellPicks(classes)) {
        if (p.countsAgainstLimit) continue;
        [p.sourceLabel, ...(p.sourceAliases || [])].filter(Boolean).forEach((s) => out.add(s.toLowerCase()));
    }
    return Array.from(out);
}
