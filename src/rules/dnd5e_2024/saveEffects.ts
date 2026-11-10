import { DEFAULT_DND55_CONDITIONS } from "../../views/characterSheet/characterData";
import { AbilityName } from "./types";

/**
 * Something that changes a character's saving throws beyond the number on the card: advantage, disadvantage, or a
 * bonus that only applies sometimes. One per ability, effect, and what it's against, naming every source that gives it
 * (War Caster and Eldritch Mind both give advantage on Constitution saves to maintain concentration).
 */
export interface SaveEffect {
    /** The ability whose saves it changes; none for all saving throws */
    ability?: AbilityName;
    effect: "advantage" | "disadvantage" | "bonus";
    /** For bonuses */
    value?: number;
    /** What it applies to: "concentration", a condition ("charmed"), "spells", several joined by " or ", or the source's own words */
    against?: string;
    /** Features, feats, traits, and items that give it */
    sources: string[];
}

const ABILITIES: Record<AbilityName, { name: string; abbr: string }> = {
    str: { name: "Strength", abbr: "STR" }, dex: { name: "Dexterity", abbr: "DEX" }, con: { name: "Constitution", abbr: "CON" },
    int: { name: "Intelligence", abbr: "INT" }, wis: { name: "Wisdom", abbr: "WIS" }, cha: { name: "Charisma", abbr: "CHA" }
};

/** The ability with this key, name, or abbreviation ("con", "Constitution", "CON"). */
export function abilityKey(text: unknown): AbilityName | undefined {
    const t = String(text ?? "").trim().toLowerCase();
    return (Object.keys(ABILITIES) as AbilityName[]).find((k) => k === t || ABILITIES[k].name.toLowerCase() === t || ABILITIES[k].abbr.toLowerCase() === t);
}

/** Game terms a save effect can be against: the conditions, plus concentration and spells. */
function againstTerms(): string[] {
    return ["concentration", "spells", ...DEFAULT_DND55_CONDITIONS.map((c) => c.slug.toLowerCase())];
}

/** Words that only frame what a save is against ("saving throws that you make to maintain ..."). */
const FILLER = new Set(("a an the and or of on for to vs against being be you your make made makes saving save saves throw throws " +
    "that which maintain avoid end ending condition conditions effect effects any with by").split(" "));

/**
 * What a source's wording applies to, as a key: "to maintain Concentration." and "saving throws that you make to
 * maintain Concentration" are both "concentration"; "against being Charmed or Frightened" is "charmed or frightened".
 * Wording that says more than the terms it names ("against being charmed, and magic can't put you to sleep") is kept
 * as written, without a closing period.
 */
export function normalizeAgainst(text: unknown): string | undefined {
    const raw = String(text ?? "").trim().replace(/[.\s]+$/, "");
    if (!raw) return undefined;
    const lower = raw.toLowerCase();
    const matches = againstTerms()
        .map((term) => ({ term, re: new RegExp(`\\b${term.replace(/s$/, "")}s?\\b`, "g") }))
        .map((x) => ({ ...x, at: lower.search(x.re) }))
        .filter((x) => x.at >= 0)
        .sort((a, b) => a.at - b.at);
    if (matches.length === 0) return raw;
    let rest = lower;
    matches.forEach((x) => { rest = rest.replace(x.re, " "); });
    const leftover = rest.split(/[^a-z']+/).filter((w) => w && !FILLER.has(w));
    return leftover.length === 0 ? [...new Set(matches.map((x) => x.term))].join(" or ") : raw;
}

const effectKey = (e: SaveEffect) => [e.ability || "all", e.effect, e.effect === "bonus" ? e.value ?? 0 : "", (e.against || "").toLowerCase()].join("|");

/** One effect per ability, effect, value, and what it's against, with every source named once. */
export function mergeSaveEffects(effects: Array<SaveEffect | undefined>): SaveEffect[] {
    const byKey = new Map<string, SaveEffect>();
    for (const e of effects) {
        if (!e) continue;
        const key = effectKey(e);
        const existing = byKey.get(key);
        const sources = (e.sources || []).map((s) => String(s || "").trim()).filter(Boolean);
        if (existing) {
            sources.forEach((s) => { if (!existing.sources.includes(s)) existing.sources.push(s); });
        } else {
            byKey.set(key, { ...e, sources: [...new Set(sources)] });
        }
    }
    return [...byKey.values()];
}

/** Adds an effect from a source (merging), or with `remove`, takes that source off it and drops it when none are left. */
export function applySaveEffect(list: SaveEffect[] | undefined, effect: SaveEffect, remove = false): SaveEffect[] {
    const current = list || [];
    if (!remove) return mergeSaveEffects([...current, effect]);
    const key = effectKey(effect);
    const out: SaveEffect[] = [];
    for (const e of current) {
        if (effectKey(e) !== key) {
            out.push(e);
            continue;
        }
        // Without a named source the whole effect goes; otherwise only that source, and the effect once none are left
        if (effect.sources.length === 0) continue;
        const sources = e.sources.filter((s) => !effect.sources.includes(s));
        if (sources.length > 0) out.push({ ...e, sources });
    }
    return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** How the "against" reads after the effect: "to maintain Concentration", "against Charmed or Frightened", "against spells". */
function againstPhrase(against?: string): string {
    if (!against) return "";
    const terms = againstTerms();
    const parts = against.split(" or ");
    if (parts.every((p) => terms.includes(p))) {
        if (parts.length === 1 && parts[0] === "concentration") return "to maintain Concentration";
        return `against ${parts.map((p) => (p === "spells" ? "spells" : cap(p))).join(" or ")}`;
    }
    return /^(against|to|when|while|vs\b)/i.test(against) ? against : `(${against})`;
}

/** The short form on an ability's card: "Advantage: Concentration", "+2: against spells". */
export function cardText(e: SaveEffect): string {
    const what = e.effect === "bonus" ? `${(e.value ?? 0) >= 0 ? "+" : ""}${e.value ?? 0}` : cap(e.effect);
    if (!e.against) return what;
    const parts = e.against.split(" or ");
    const terms = againstTerms();
    const label = parts.every((p) => terms.includes(p)) ? parts.map((p) => (p === "spells" ? "Spells" : cap(p))).join(" or ") : e.against;
    return `${what}: ${label}`;
}

/** The full form in the Saving Throws row: "Advantage on saving throws against spells". */
export function rowText(e: SaveEffect): string {
    const whose = e.ability ? `${ABILITIES[e.ability].name} saving throws` : "saving throws";
    const what = e.effect === "bonus" ? `${(e.value ?? 0) >= 0 ? "+" : ""}${e.value ?? 0} on ${whose}` : `${cap(e.effect)} on ${whose}`;
    const against = againstPhrase(e.against);
    return against ? `${what} ${against}` : what;
}

/** Effects on one ability's saves (shown on that card). */
export const effectsForAbility = (effects: SaveEffect[] | undefined, ability: AbilityName) => (effects || []).filter((e) => e.ability === ability);

/** Effects on every saving throw (shown in the Saving Throws row). */
export const effectsForAllSaves = (effects: SaveEffect[] | undefined) => (effects || []).filter((e) => !e.ability);

const LEGACY_ROW = /^(advantage|disadvantage) on (?:(\w+) )?(?:saves|saving throws)(?: \((.+)\))?$/i;
const LEGACY_CARD = /^(advantage|disadvantage)(?: on saves)?(?: \((.+)\))?$/i;
const LEGACY_BONUS = /^([+-]\d+) on saving throws(?: \((.+)\))?$/i;

/**
 * Reads the save effects out of notes saved as sentences before effects existed (ability card notes and the Saving
 * Throws row), leaving the notes that aren't about saves (initiative, skill checks, attacks).
 */
export function effectsFromLegacyNotes(abilityNotes: Array<{ abbr: string; notes?: string }>, rowNotes: string[]): { effects: SaveEffect[]; otherNotes: string[] } {
    const effects: SaveEffect[] = [];
    for (const a of abilityNotes) {
        const ability = abilityKey(a.abbr);
        for (const part of String(a.notes || "").split(";").map((p) => p.trim()).filter(Boolean)) {
            if (/^advantage on concentration$/i.test(part)) {
                effects.push({ ability: "con", effect: "advantage", against: "concentration", sources: [] });
                continue;
            }
            const m = part.match(LEGACY_CARD);
            if (m && ability) effects.push({ ability, effect: m[1].toLowerCase() as SaveEffect["effect"], against: normalizeAgainst(m[2]), sources: [] });
        }
    }
    // Older saves copied an effect on every saving throw onto all six cards
    const cardEffects = mergeSaveEffects(effects);
    effects.length = 0;
    const groups = new Map<string, SaveEffect[]>();
    cardEffects.forEach((e) => {
        const k = `${e.effect}|${e.against || ""}`;
        groups.set(k, [...(groups.get(k) || []), e]);
    });
    groups.forEach((list) => {
        if (new Set(list.map((e) => e.ability)).size === 6) effects.push({ ...list[0], ability: undefined });
        else effects.push(...list);
    });
    const otherNotes: string[] = [];
    for (const note of rowNotes || []) {
        const row = note.match(LEGACY_ROW);
        const bonus = note.match(LEGACY_BONUS);
        if (row && (!row[2] || row[2].toLowerCase() === "all" || abilityKey(row[2]))) {
            const ability = row[2] && row[2].toLowerCase() !== "all" ? abilityKey(row[2]) : undefined;
            effects.push({ ability, effect: row[1].toLowerCase() as SaveEffect["effect"], against: normalizeAgainst(row[3]), sources: [] });
        } else if (bonus) {
            effects.push({ effect: "bonus", value: Number(bonus[1]), against: normalizeAgainst(bonus[2]), sources: [] });
        } else if (/^advantage on concentration$/i.test(note)) {
            effects.push({ ability: "con", effect: "advantage", against: "concentration", sources: [] });
        } else {
            otherNotes.push(note);
        }
    }
    return { effects: mergeSaveEffects(effects), otherNotes };
}

/** The save effects in rules modifiers (feats, class features, species traits), each named by what grants it. */
export function saveEffectsFromRules(sources: Array<{ name?: string; modifiers?: Array<{ target?: string; type?: string; condition?: string }> }>): SaveEffect[] {
    const out: SaveEffect[] = [];
    for (const src of sources) {
        for (const m of src.modifiers || []) {
            if (!String(m.target || "").startsWith("saves.") || (m.type !== "advantage" && m.type !== "disadvantage")) continue;
            const key = String(m.target).split(".")[1];
            out.push({
                ability: key === "all" ? undefined : abilityKey(key),
                effect: m.type,
                against: normalizeAgainst(m.condition),
                sources: src.name ? [src.name] : []
            });
        }
    }
    return mergeSaveEffects(out);
}
