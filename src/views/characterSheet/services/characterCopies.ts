import { StatModifier } from "../../../rules/dnd5e_2024/types";
import { CharacterData, EquipmentItem, ItemCharges, SpellDefinition, WeaponItem } from "../characterData";

/**
 * A character's spells and items are its own copies of database rows (linked by spellId / itemId). These mirror
 * server/services/characterCopies.ts for the open sheet, which saves its copy back over the server's.
 */

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const lower = (v: unknown) => String(v ?? "").trim().toLowerCase();

/** A database row ID, or undefined for anything else (D&D Beyond IDs on search results, slugs) */
export function databaseId(value: unknown): number | undefined {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : undefined;
}

/** A copy belongs to a row when it links to it, or (saved before links) carries the row's old name */
function isCopyOf(entry: { name: string; spellId?: number; itemId?: number }, key: "spellId" | "itemId", id: number, oldName: string): boolean {
    const linked = entry[key];
    return linked !== undefined && linked !== null ? Number(linked) === id : lower(entry.name) === lower(oldName);
}

export type CopyUpdateResult = { updated: number; locked: number };

type ScalingRow = NonNullable<SpellDefinition["damageScaling"]>[number];

function parseScaling(raw: unknown): ScalingRow[] | undefined {
    let rows: unknown = raw;
    if (typeof raw === "string") {
        try {
            rows = JSON.parse(raw);
        } catch {
            return undefined;
        }
    }
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return rows.map((r: any) => ({
        level: Number(r?.level),
        label: String(r?.label || `Level ${r?.level}`),
        dice: String(r?.dice || ""),
        modifier: String(r?.modifier || ""),
        effect: r?.effect ? String(r.effect) : undefined
    }));
}

/** Copies an edited spell onto the character's unlocked copies of it */
export function applySpellEditToCopies(character: CharacterData | null, oldName: string, spell: any): CopyUpdateResult {
    const result = { updated: 0, locked: 0 };
    const id = databaseId(spell?.id);
    if (!character || !id) return result;
    for (const sp of character.spells || []) {
        if (!isCopyOf(sp, "spellId", id, oldName)) continue;
        if (sp.locked) {
            result.locked++;
            continue;
        }
        Object.assign(sp, {
            spellId: id,
            name: spell.name,
            level: Number(spell.level) || 0,
            school: spell.school,
            castingTime: spell.castingTime,
            range: spell.range,
            duration: spell.duration,
            components: spell.components,
            concentration: !!spell.concentration,
            ritual: !!spell.ritual,
            description: spell.description,
            imageUrl: spell.imageUrl || undefined,
            damageDice: spell.damageDice || undefined,
            damageType: spell.damageType || undefined,
            damageModifier: spell.damageModifier || undefined,
            damageScaling: parseScaling(spell.damageScaling)
        });
        result.updated++;
    }
    return result;
}

/** An item's charges as stored on its database row (chargesJson), without the spent count, or undefined for none */
export type ChargesDefinition = Omit<ItemCharges, "used">;

export function chargesFromDb(raw: unknown): ChargesDefinition | undefined {
    let parsed: any = raw;
    if (typeof raw === "string") {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return undefined;
        }
    }
    const max = Number(parsed?.max);
    if (!parsed || !Number.isInteger(max) || max < 1) return undefined;
    const resetOn = ["short", "long", "dawn", "manual"].includes(parsed.resetOn) ? parsed.resetOn : "long";
    return parsed.resetLabel ? { max, resetOn, resetLabel: String(parsed.resetLabel) } : { max, resetOn };
}

/** A copy's charges after its item's charges change: the new count and reset, keeping what it spent up to the new count */
function nextCharges(current: ItemCharges | undefined, charges: ChargesDefinition | null): ItemCharges | undefined {
    return charges ? { ...charges, used: Math.min(current?.used || 0, charges.max) } : undefined;
}

/** "1d8 Slashing" → dice "1d8", type "Slashing" */
function splitDamage(damage: unknown): { dice?: string; type?: string } {
    const match = String(damage || "").trim().match(/^(.*?)\s+([A-Za-z]+)$/);
    return match ? { dice: match[1].trim(), type: match[2] } : { dice: damage ? String(damage) : undefined };
}

/**
 * Effects an edit changed: unlocked copies take `modifiers`; locked copies that follow the item's effects by name
 * (no effects of their own) get `previousModifiers`, so they stay exactly as they were.
 */
export type EffectsEdit = { modifiers: StatModifier[]; previousModifiers: StatModifier[] };

/** Copies an edited item onto the character's unlocked weapon and equipment copies of it */
export function applyItemEditToCopies(
    character: CharacterData | null,
    oldName: string,
    item: any,
    effects?: EffectsEdit,
    /** The item's new charges (null: none); leave out when the edit didn't touch them */
    charges?: ChargesDefinition | null
): CopyUpdateResult {
    const result = { updated: 0, locked: 0 };
    const id = databaseId(item?.id);
    if (!character || !id) return result;
    const properties = item.properties ? String(item.properties).split(",").map((p: string) => p.trim()).filter(Boolean) : [];
    const { dice, type } = splitDamage(item.damage);

    (character.weapons || []).forEach((w: WeaponItem) => {
        if (!isCopyOf(w, "itemId", id, oldName)) return;
        if (w.locked) {
            if (effects && w.modifiers === undefined) w.modifiers = clone(effects.previousModifiers);
            result.locked++;
            return;
        }
        if (effects) w.modifiers = clone(effects.modifiers);
        if (charges !== undefined) w.charges = nextCharges(w.charges, charges);
        Object.assign(w, {
            itemId: id,
            name: item.name,
            category: item.category || w.category,
            damage: item.damage || w.damage,
            damageDie: dice || w.damageDie,
            damageType: type || w.damageType,
            range: item.range || w.range,
            properties,
            isMagic: !!item.isMagic,
            rarity: item.rarity,
            requiresAttunement: !!item.requiresAttunement,
            description: item.description,
            imageUrl: item.imageUrl || undefined,
            mastery: item.mastery ? { ...(w.mastery || {}), name: item.mastery, unlocked: w.mastery?.unlocked ?? true } : undefined
        });
        result.updated++;
    });

    const hasWeaponTwin = (character.weapons || []).some((w: WeaponItem) => isCopyOf(w, "itemId", id, oldName));
    (character.equipment || []).forEach((e: EquipmentItem) => {
        if (!isCopyOf(e, "itemId", id, oldName)) return;
        if (e.locked) {
            if (effects && e.modifiers === undefined) e.modifiers = clone(effects.previousModifiers);
            result.locked++;
            return;
        }
        if (effects) e.modifiers = clone(effects.modifiers);
        // A weapon's charges show on its weapon card; its equipment twin doesn't get a second set
        if (charges !== undefined && !hasWeaponTwin) e.charges = nextCharges(e.charges, charges);
        Object.assign(e, {
            itemId: id,
            name: item.name,
            type: item.category || item.filterType || e.type,
            filterType: item.filterType || e.filterType,
            isMagic: !!item.isMagic,
            rarity: item.rarity,
            requiresAttunement: !!item.requiresAttunement,
            description: item.description,
            imageUrl: item.imageUrl || undefined
        });
        result.updated++;
    });
    return result;
}

/**
 * After a D&D Beyond refresh: copies locked on the character come back exactly as they were (even ones D&D Beyond
 * no longer lists), and the rest keep their links to the database.
 */
export function carryLockedCopiesAndLinks(target: CharacterData, source: CharacterData | null): void {
    if (!target || !source) return;
    carry(target, source, "spells", "spellId");
    carry(target, source, "weapons", "itemId");
    carry(target, source, "equipment", "itemId");
}

function carry(target: any, source: any, list: "spells" | "weapons" | "equipment", key: "spellId" | "itemId") {
    const before: any[] = Array.isArray(source[list]) ? source[list] : [];
    if (before.length === 0) return;
    const after: any[] = Array.isArray(target[list]) ? target[list] : [];
    const byName = new Map(before.map((entry) => [lower(entry.name), entry]));

    const out = after.map((entry) => {
        const old = byName.get(lower(entry.name));
        if (!old) return entry;
        if (old.locked) return clone(old);
        if (old[key] && !entry[key]) entry[key] = old[key];
        return entry;
    });
    const present = new Set(out.map((entry) => lower(entry.name)));
    before.filter((old) => old.locked && !present.has(lower(old.name))).forEach((old) => out.push(clone(old)));
    target[list] = out;
}
