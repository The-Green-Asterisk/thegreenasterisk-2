import { In, IsNull } from "typeorm";
import AppDataSource from "./database";
// Type-only, with repositories looked up by entity name, so loading this doesn't pull in every related entity
import type { CharacterInventoryItem } from "./database/entity/CharacterInventoryItem";
import type { CharacterSpell } from "./database/entity/CharacterSpell";
import type { Item } from "./database/entity/Item";
import type { SavedCharacter } from "./database/entity/SavedCharacter";
import type { Spell } from "./database/entity/Spell";

/**
 * Characters keep their own copy of each spell and item (character_spell / character_inventory_item rows, plus the
 * saved payload). These keep those copies tied to the spell or item they came from, so an edit can reach them.
 */

export type PropagationResult = { updated: number; locked: number };

const lower = (v: unknown) => String(v ?? "").trim().toLowerCase();

/** Character copy columns are narrower than the spell and item columns they copy */
const fit = (v: string | null | undefined, max: number) => (v === null || v === undefined ? v : String(v).slice(0, max));

export function definitionSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** A character's copy is this definition's when it links to it, or (saved before links) carries its old name */
const isCopyOf = (entry: any, idKey: "spellId" | "itemId", id: number, oldName: string) =>
    entry && (Number(entry[idKey]) === id || ((entry[idKey] === undefined || entry[idKey] === null) && lower(entry.name) === lower(oldName)));

function spellCopyFields(spell: Spell) {
    return {
        name: spell.name,
        level: Number(spell.level) || 0,
        school: fit(spell.school, 50) as string,
        castingTime: spell.castingTime,
        range: spell.range,
        duration: spell.duration,
        components: spell.components,
        concentration: !!spell.concentration,
        ritual: !!spell.ritual,
        description: spell.description,
        damageDice: spell.damageDice || null,
        damageType: fit(spell.damageType, 100) || null,
        damageModifier: spell.damageModifier || null,
        damageScaling: spell.damageScaling || null
    };
}

function parseJsonField(raw: unknown): unknown {
    if (typeof raw !== "string") return raw ?? undefined;
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

/** Rewrites each saved character's payload with `apply`, saving only the ones it changed */
async function rewritePayloads(characterIds: number[], apply: (payload: any) => boolean): Promise<void> {
    if (characterIds.length === 0) return;
    const repo = AppDataSource.getRepository<SavedCharacter>("SavedCharacter");
    const records = await repo.find({ where: { id: In(characterIds) }, select: { id: true, payload: true } });
    for (const record of records) {
        let payload: any;
        try {
            payload = JSON.parse(record.payload);
        } catch {
            continue;
        }
        if (payload && typeof payload === "object" && apply(payload)) {
            await repo.update(record.id, { payload: JSON.stringify(payload) });
        }
    }
}

/**
 * Copies an edited spell onto every character that has it, except copies locked on that character.
 * Unlinked copies found by the spell's old name get linked as they're updated.
 */
export async function propagateSpellEdit(spell: Spell, oldName: string): Promise<PropagationResult> {
    const repo = AppDataSource.getRepository<CharacterSpell>("CharacterSpell");
    const rows = await repo.find({
        where: [{ spellId: spell.id }, { spellId: IsNull(), name: oldName }],
        relations: { savedCharacter: true }
    });

    const fields = spellCopyFields(spell);
    const changed: CharacterSpell[] = [];
    const characterIds = new Set<number>();
    let locked = 0;
    for (const row of rows) {
        if (row.locked) {
            locked++;
            continue;
        }
        Object.assign(row, fields, { spellId: spell.id });
        changed.push(row);
        if (row.savedCharacter?.id) characterIds.add(row.savedCharacter.id);
    }
    if (changed.length > 0) await repo.save(changed);

    const payloadFields = { ...fields, damageScaling: parseJsonField(fields.damageScaling), imageUrl: spell.imageUrl || undefined };
    await rewritePayloads([...characterIds], (payload) => {
        let touched = false;
        for (const entry of Array.isArray(payload.spells) ? payload.spells : []) {
            if (!isCopyOf(entry, "spellId", spell.id, oldName) || entry.locked) continue;
            Object.assign(entry, payloadFields, { spellId: spell.id });
            touched = true;
        }
        return touched;
    });

    return { updated: changed.length, locked };
}

const isWeaponRow = (row: Pick<CharacterInventoryItem, "damage" | "category">) =>
    !!row.damage || /melee|ranged/i.test(row.category || "");

/** Damage dice and type from an item's "1d8 Slashing" */
function splitDamage(damage?: string | null): { die?: string; type?: string } {
    const match = String(damage || "").trim().match(/^(.*?)\s+([A-Za-z]+)$/);
    return match ? { die: match[1].trim(), type: match[2] } : { die: damage || undefined };
}

/**
 * Copies an edited item onto every character that has it, except copies locked on that character. Weapons get the
 * combat stats too; attack bonuses stay as the character's sheet worked them out.
 *
 * With `effects` (the edit changed the item's effects): unlocked copies take the new effects, and locked copies
 * that follow the item's effects by name get the old ones written onto them, so they stay exactly as they were.
 */
export async function propagateItemEdit(item: Item, oldName: string, effects?: { previousModifiers: any[] }): Promise<PropagationResult> {
    const repo = AppDataSource.getRepository<CharacterInventoryItem>("CharacterInventoryItem");
    const rows = await repo.find({
        where: [{ itemId: item.id }, { itemId: IsNull(), name: oldName }],
        relations: { savedCharacter: true }
    });

    const { die, type } = splitDamage(item.damage);
    const properties = item.properties ? String(item.properties).split(",").map((p) => p.trim()).filter(Boolean) : [];
    const common = {
        name: item.name,
        isMagic: !!item.isMagic,
        rarity: fit(item.rarity, 50),
        requiresAttunement: !!item.requiresAttunement,
        description: item.description,
        imageUrl: item.imageUrl || null
    };

    const changed: CharacterInventoryItem[] = [];
    const characterIds = new Set<number>();
    let locked = 0;
    for (const row of rows) {
        if (row.locked) {
            locked++;
            if (effects && row.savedCharacter?.id) characterIds.add(row.savedCharacter.id);
            continue;
        }
        if (isWeaponRow(row)) {
            Object.assign(row, common, {
                category: fit(item.category, 100) || row.category,
                damage: fit(item.damage, 50) || row.damage,
                damageDie: fit(die, 20) || row.damageDie,
                damageType: fit(type, 50) || row.damageType,
                range: fit(item.range, 50) || row.range,
                propertiesJson: JSON.stringify(properties),
                masteryName: fit(item.mastery, 50) || null
            });
        } else {
            Object.assign(row, common, { category: fit(item.category || item.filterType, 100) || row.category });
        }
        row.itemId = item.id;
        changed.push(row);
        if (row.savedCharacter?.id) characterIds.add(row.savedCharacter.id);
    }
    if (changed.length > 0) await repo.save(changed);

    const payloadCommon = { ...common, imageUrl: item.imageUrl || undefined, itemId: item.id };
    const newModifiers = parseJsonField(item.modifiersJson);
    /** A locked copy keeps the effects it had; true when that changed the entry */
    const freezeEffects = (entry: any) => {
        if (!effects || entry.modifiers !== undefined) return false;
        entry.modifiers = effects.previousModifiers;
        return true;
    };
    const takeEffects = (entry: any) => {
        if (effects) entry.modifiers = Array.isArray(newModifiers) ? newModifiers : [];
    };
    await rewritePayloads([...characterIds], (payload) => {
        let touched = false;
        for (const entry of Array.isArray(payload.weapons) ? payload.weapons : []) {
            if (!isCopyOf(entry, "itemId", item.id, oldName)) continue;
            if (entry.locked) {
                touched = freezeEffects(entry) || touched;
                continue;
            }
            takeEffects(entry);
            Object.assign(entry, payloadCommon, {
                category: item.category || entry.category,
                damage: item.damage || entry.damage,
                damageDie: die || entry.damageDie,
                damageType: type || entry.damageType,
                range: item.range || entry.range,
                properties,
                mastery: item.mastery ? { ...(entry.mastery || {}), name: item.mastery, unlocked: entry.mastery?.unlocked ?? true } : undefined
            });
            touched = true;
        }
        for (const entry of Array.isArray(payload.equipment) ? payload.equipment : []) {
            if (!isCopyOf(entry, "itemId", item.id, oldName)) continue;
            if (entry.locked) {
                touched = freezeEffects(entry) || touched;
                continue;
            }
            takeEffects(entry);
            Object.assign(entry, payloadCommon, {
                type: item.category || item.filterType || entry.type,
                filterType: item.filterType || entry.filterType
            });
            touched = true;
        }
        return touched;
    });

    return { updated: changed.length, locked };
}

/**
 * Links a character's spells and items to the database rows they're copies of, by name, when the character is
 * saved without the link (imports, and characters saved before links existed).
 */
export async function resolveDefinitionLinks(data: any): Promise<void> {
    if (!AppDataSource.isInitialized || !data || typeof data !== "object") return;

    const unlinkedSpells = (Array.isArray(data.spells) ? data.spells : []).filter((s: any) => s?.name && !s.spellId);
    if (unlinkedSpells.length > 0) {
        const slugs = [...new Set(unlinkedSpells.map((s: any) => definitionSlug(String(s.name))))].filter(Boolean) as string[];
        const found = await AppDataSource.getRepository<Spell>("Spell").find({ where: { slug: In(slugs) }, select: { id: true, slug: true } });
        const bySlug = new Map(found.map((s) => [s.slug, s.id]));
        unlinkedSpells.forEach((s: any) => {
            const id = bySlug.get(definitionSlug(String(s.name)));
            if (id) s.spellId = id;
        });
    }

    const unlinkedItems = [...(Array.isArray(data.weapons) ? data.weapons : []), ...(Array.isArray(data.equipment) ? data.equipment : [])]
        .filter((i: any) => i?.name && !i.itemId);
    if (unlinkedItems.length > 0) {
        const slugs = [...new Set(unlinkedItems.map((i: any) => definitionSlug(String(i.name))))].filter(Boolean) as string[];
        const found = await AppDataSource.getRepository<Item>("Item").find({ where: { slug: In(slugs) }, select: { id: true, slug: true } });
        const bySlug = new Map(found.map((i) => [i.slug, i.id]));
        unlinkedItems.forEach((i: any) => {
            const id = bySlug.get(definitionSlug(String(i.name)));
            if (id) i.itemId = id;
        });
    }
}
