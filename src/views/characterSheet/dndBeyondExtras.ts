import { ActionItem, CharacterData, ClassResource, EquipmentItem, ItemCharges } from "./characterData";

/**
 * Reads the parts of a D&D Beyond character that aren't stats: character details, personality and notes, currency,
 * campaign, companions, custom proficiencies, defenses, actions and items, and what the player has already used
 * (spell slots, limited-use features, death saves).
 */

const text = (v: unknown): string | undefined => {
    const s = typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";
    return s ? s : undefined;
};

/** Drops undefined values; returns undefined when nothing is left. */
function compact<T extends Record<string, unknown>>(obj: T): T | undefined {
    const out = Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
    return Object.keys(out).length > 0 ? out : undefined;
}

// D&D Beyond lifestyle ids
const LIFESTYLES: Record<number, string> = {
    1: "Wretched", 2: "Squalid", 3: "Poor", 4: "Modest", 5: "Comfortable", 6: "Wealthy", 7: "Aristocratic"
};

export function readDetails(raw: any): CharacterData["details"] {
    return compact({
        gender: text(raw?.gender),
        faith: text(raw?.faith),
        age: text(raw?.age),
        hair: text(raw?.hair),
        eyes: text(raw?.eyes),
        skin: text(raw?.skin),
        height: text(raw?.height),
        weight: text(raw?.weight),
        lifestyle: text(raw?.lifestyle?.name) || LIFESTYLES[Number(raw?.lifestyleId)],
        experiencePoints: Number(raw?.currentXp) > 0 ? Number(raw.currentXp) : undefined
    });
}

export function readNotes(raw: any): CharacterData["notes"] {
    const t = raw?.traits || {};
    const n = raw?.notes || {};
    return compact({
        personalityTraits: text(t.personalityTraits),
        ideals: text(t.ideals),
        bonds: text(t.bonds),
        flaws: text(t.flaws),
        appearance: text(t.appearance),
        backstory: text(n.backstory),
        allies: text(n.allies),
        organizations: text(n.organizations),
        enemies: text(n.enemies),
        personalPossessions: text(n.personalPossessions),
        otherHoldings: text(n.otherHoldings),
        otherNotes: text(n.otherNotes)
    });
}

export function readCurrency(raw: any): CharacterData["currency"] {
    const c = raw?.currencies;
    if (!c || typeof c !== "object") return undefined;
    const coin = (k: string) => Math.max(0, Number(c[k]) || 0);
    return { cp: coin("cp"), sp: coin("sp"), ep: coin("ep"), gp: coin("gp"), pp: coin("pp") };
}

/** The campaign's name only (its DM and other players aren't kept). */
export function readCampaign(raw: any): CharacterData["campaign"] {
    const name = text(raw?.campaign?.name);
    return name ? { name } : undefined;
}

/** Familiars, companions, and other creatures (D&D Beyond "creatures"). */
export function readCompanions(raw: any): CharacterData["companions"] {
    const list = (Array.isArray(raw?.creatures) ? raw.creatures : [])
        .filter((c: any) => c && c.isActive !== false)
        .map((c: any) => {
            const def = c.definition || {};
            const maxHp = Number(c.overrideHitPoints ?? def.averageHitPoints) || undefined;
            return {
                name: text(c.name) || text(def.name) || "Companion",
                type: text(def.name),
                armorClass: Number(def.armorClass) || undefined,
                maxHp,
                currentHp: maxHp !== undefined ? Math.max(0, maxHp - (Number(c.removedHitPoints) || 0)) : undefined,
                notes: text(c.description)
            };
        });
    return list.length > 0 ? list : undefined;
}

// D&D Beyond custom proficiency types [likely ids: 1 skill, 2 tool, 3 language, 4 armor, 5 weapon]
const CUSTOM_PROFICIENCY_LISTS: Record<number, "tools" | "languages" | "armor" | "weapons"> = {
    2: "tools", 3: "languages", 4: "armor", 5: "weapons"
};

/** Custom tool, language, armor, and weapon proficiencies the player added on D&D Beyond. */
export function readCustomProficiencies(raw: any): Partial<Record<"tools" | "languages" | "armor" | "weapons", string[]>> {
    const out: Partial<Record<"tools" | "languages" | "armor" | "weapons", string[]>> = {};
    for (const p of Array.isArray(raw?.customProficiencies) ? raw.customProficiencies : []) {
        const list = CUSTOM_PROFICIENCY_LISTS[Number(p?.type)];
        const name = text(p?.name);
        if (!list || !name) continue;
        (out[list] = out[list] || []).push(name);
    }
    return out;
}

// D&D Beyond damage type ids, for custom defense adjustments
const DAMAGE_TYPES: Record<number, string> = {
    1: "Bludgeoning", 2: "Piercing", 3: "Slashing", 4: "Lightning", 5: "Thunder", 6: "Poison", 7: "Cold",
    8: "Radiant", 9: "Fire", 10: "Necrotic", 11: "Acid", 12: "Psychic", 13: "Force"
};

/** Custom resistances, immunities, and vulnerabilities (D&D Beyond customDefenseAdjustments). */
export function readCustomDefenses(raw: any): { resistances: string[]; immunities: string[]; vulnerabilities: string[] } {
    const out = { resistances: [] as string[], immunities: [] as string[], vulnerabilities: [] as string[] };
    for (const d of Array.isArray(raw?.customDefenseAdjustments) ? raw.customDefenseAdjustments : []) {
        const name = DAMAGE_TYPES[Number(d?.adjustmentId)] || text(d?.name);
        if (!name) continue;
        const type = Number(d?.type);
        const list = type === 2 ? out.immunities : type === 3 ? out.vulnerabilities : out.resistances;
        if (!list.includes(name)) list.push(name);
    }
    return out;
}

/** Actions the player wrote on D&D Beyond (customActions). */
export function readCustomActions(raw: any): ActionItem[] {
    return (Array.isArray(raw?.customActions) ? raw.customActions : [])
        .filter((a: any) => text(a?.name))
        .map((a: any) => ({
            name: a.name,
            type: a.activation?.activationType === 3 || a.actionType === 3 ? "Bonus Action"
                : a.activation?.activationType === 4 || a.actionType === 4 ? "Reaction" : "Action",
            rangeOrReach: a.range?.rangeValue ? `${a.range.rangeValue} ft.` : "Special",
            hitOrDc: "Special",
            damageOrEffect: text(a.snippet) || "Custom action",
            notes: text(a.description) || text(a.snippet) || ""
        }));
}

/** Items the player wrote on D&D Beyond (customItems). */
export function readCustomItems(raw: any): EquipmentItem[] {
    return (Array.isArray(raw?.customItems) ? raw.customItems : [])
        .filter((i: any) => text(i?.name))
        .map((i: any) => ({
            name: i.name,
            quantity: Math.max(1, Number(i.quantity) || 1),
            equipped: false,
            type: "Custom Item",
            description: text(i.description),
            notes: text(i.notes)
        }));
}

/** Pips for a pool of `total` uses with `used` spent: the first total - used are available. */
const pips = (total: number, used: number) => Array.from({ length: Math.max(0, total) }, (_, i) => i < total - Math.max(0, used));

/**
 * What the player has already used on D&D Beyond, as the sheet's tracking state: spell slot and Pact Magic pips,
 * limited-use resource pips (each resource's uses from the actions D&D Beyond lists by that name), and death saves.
 */
export function readTrackingState(
    raw: any,
    spellSlots: CharacterData["spellSlots"],
    classResources: ClassResource[]
): NonNullable<CharacterData["trackingState"]> {
    const slotPips: Record<string, boolean[]> = {};
    for (const s of Array.isArray(raw?.spellSlots) ? raw.spellSlots : []) {
        const slot = spellSlots[`level${s.level}`];
        if (slot && slot.total > 0) slotPips[`level${s.level}`] = pips(slot.total, Number(s.used) || 0);
    }
    if (spellSlots.pact && spellSlots.pact.total > 0) {
        const pact = (Array.isArray(raw?.pactMagic) ? raw.pactMagic : []).find((p: any) => Number(p.level) === spellSlots.pact!.level);
        slotPips.pact = pips(spellSlots.pact.total, Number(pact?.used) || 0);
    }

    // Every limited use D&D Beyond lists (actions of any source, and class features), with how many are spent
    const used: Array<{ name: string; numberUsed: number }> = [];
    for (const list of Object.values(raw?.actions || {})) {
        for (const a of Array.isArray(list) ? list : []) {
            if (a?.name && a.limitedUse) used.push({ name: String(a.name), numberUsed: Number(a.limitedUse.numberUsed) || 0 });
        }
    }
    for (const c of Array.isArray(raw?.classes) ? raw.classes : []) {
        for (const cf of c?.classFeatures || []) {
            const lu = cf?.limitedUse || cf?.definition?.limitedUse;
            const name = cf?.definition?.name || cf?.name;
            const first = Array.isArray(lu) ? lu[0] : lu;
            if (name && first && typeof first === "object") used.push({ name: String(name), numberUsed: Number(first.numberUsed) || 0 });
        }
    }
    const resourcePips: Record<string, boolean[]> = {};
    classResources.forEach((res, idx) => {
        const key = res.key || `res-${idx}`;
        const resName = res.name.toLowerCase();
        const spent = used
            .filter((u) => {
                const n = u.name.toLowerCase();
                return n === resName || n.startsWith(`${resName}:`) || resName.startsWith(`${n}:`);
            })
            .reduce((max, u) => Math.max(max, u.numberUsed), 0);
        if (spent > 0) resourcePips[key] = pips(res.total, Math.min(spent, res.total));
    });

    const ds = raw?.deathSaves || {};
    const deathSaves = {
        successes: Math.max(0, Math.min(3, Number(ds.successCount) || 0)),
        failures: Math.max(0, Math.min(3, Number(ds.failCount) || 0)),
        isStable: !!ds.isStabilized
    };

    return { slotPips, resourcePips, deathSaves, heroicInspiration: !!raw?.inspiration };
}

/** Pips for items' charges spent on D&D Beyond, by itemChargesKey. */
export function readItemChargePips(items: Array<{ id?: number; name: string; charges?: ItemCharges }>): Record<string, boolean[]> {
    const out: Record<string, boolean[]> = {};
    for (const item of items) {
        if (item.charges && item.charges.used > 0) out[itemChargesKey(item)] = pips(item.charges.max, item.charges.used);
    }
    return out;
}

/**
 * An inventory item's limited uses from D&D Beyond (limitedUse, chargesUsed), or undefined for none and for single-use
 * consumables (a potion's one use is its quantity).
 */
export function readItemCharges(inv: any): ItemCharges | undefined {
    const raw = inv?.limitedUse || (Array.isArray(inv?.definition?.limitedUse) ? inv.definition.limitedUse[0] : inv?.definition?.limitedUse);
    const max = Number(raw?.maxUses) || 0;
    const resetType = String(raw?.resetType || "").replace(/\s+/g, "").toLowerCase();
    if (max <= 0 || (resetType === "consumable" && max <= 1)) return undefined;
    const resetOn: ItemCharges["resetOn"] = resetType.includes("short") ? "short"
        : resetType.includes("long") ? "long"
            : resetType.includes("dawn") ? "dawn" : "manual";
    return {
        max,
        used: Math.min(max, Math.max(Number(raw?.numberUsed) || 0, Number(inv?.chargesUsed) || 0)),
        resetOn,
        resetLabel: text(raw?.resetTypeDescription)
    };
}

/** The tracking key for an item's charges: by its D&D Beyond id, else its name. */
export function itemChargesKey(item: { id?: number; name: string }): string {
    return `item-${item.id ?? String(item.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const ABILITY_WORDS: Record<string, string> = {
    str: "strength", dex: "dexterity", con: "constitution", int: "intelligence", wis: "wisdom", cha: "charisma"
};

/**
 * The ability D&D Beyond records for the species' spells: a species (race) choice whose picked option names one of the
 * allowed abilities ("Charisma", "Charisma Score"). Undefined when there's no such pick.
 */
export function readSpeciesSpellAbility(raw: any, options: string[]): string | undefined {
    if (options.length === 0) return undefined;
    const defs = new Map<string, Map<number, string>>();
    for (const cd of raw?.choices?.choiceDefinitions || []) {
        if (cd?.id && Array.isArray(cd.options)) defs.set(String(cd.id), new Map(cd.options.map((o: any) => [Number(o.id), String(o.label || "")])));
    }
    for (const c of raw?.choices?.race || []) {
        const picked = defs.get(`${c?.componentTypeId}-${c?.type}`)?.get(Number(c?.optionValue))?.toLowerCase().trim();
        if (!picked) continue;
        const ab = options.find((o) => picked === ABILITY_WORDS[o] || picked === `${ABILITY_WORDS[o]} score`);
        if (ab) return ab;
    }
    return undefined;
}
