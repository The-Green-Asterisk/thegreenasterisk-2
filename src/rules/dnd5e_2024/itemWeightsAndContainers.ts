import { BASE_ARMOR_2024, BASE_WEAPONS_2024, STANDARD_PACKS } from "./equipment";

export interface ContainerDefaults {
    isContainer: true;
    capacityWeight: number | null;
    extradimensional?: boolean;
}

/** Round a weight in pounds to avoid IEEE-754 floating point noise (keeps up to 4 decimals). */
export function roundWeightLb(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 10000) / 10000;
}

/** Format a weight in pounds for compact display (e.g. "8 lbs", "1 lb", "0.25 lbs", "0 lbs"). */
export function formatWeightLb(value: number): string {
    const rounded = Math.round((Number(value) || 0) * 100) / 100;
    const abs = Math.abs(rounded);
    const numText = Number.isInteger(rounded) ? String(rounded) : String(rounded);
    return `${numText} ${abs === 1 ? "lb" : "lbs"}`;
}

/**
 * Parse a D&D weight value (number or string like "2 lb.", "1/4 lb.", "1 1/2 lbs", "8 oz.") into pounds.
 * Returns null when the input is blank or unparseable.
 */
export function parseWeightLb(raw: unknown): number | null {
    if (typeof raw === "number") {
        return Number.isFinite(raw) && raw >= 0 ? roundWeightLb(raw) : null;
    }
    if (typeof raw !== "string") return null;
    const cleaned = raw.trim().toLowerCase().replace(/,/g, "");
    if (!cleaned || cleaned === "-" || cleaned === "--" || cleaned === "—" || cleaned === "n/a") {
        return null;
    }
    const unitMatch = cleaned.match(/\b(oz|ounce|ounces|lb|lbs|pound|pounds)\b/);
    const isOunces = unitMatch ? unitMatch[1].startsWith("oz") || unitMatch[1].startsWith("ounce") : false;
    const numPart = cleaned.replace(/\(.*?\)/g, "").replace(/\b(oz|ounce|ounces|lb|lbs|pound|pounds)\.?/g, "").trim();
    if (!numPart) return null;

    let pounds: number | null = null;
    const mixed = numPart.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) {
        const den = Number(mixed[3]);
        if (den > 0) pounds = Number(mixed[1]) + Number(mixed[2]) / den;
    } else {
        const frac = numPart.match(/^(\d+)\s*\/\s*(\d+)$/);
        if (frac) {
            const den = Number(frac[2]);
            if (den > 0) pounds = Number(frac[1]) / den;
        } else if (/^\d+(?:\.\d+)?$/.test(numPart)) {
            pounds = Number(numPart);
        }
    }

    if (pounds === null || !Number.isFinite(pounds) || pounds < 0) return null;
    if (isOunces) pounds = pounds / 16;
    return roundWeightLb(pounds);
}

/** Standard D&D 2024 / 5e carrying containers and their capacities (in lbs; null = volume/count-limited). */
export const STANDARD_CONTAINERS: Record<string, ContainerDefaults> = {
    "backpack": { isContainer: true, capacityWeight: 30 },
    "bag of holding": { isContainer: true, capacityWeight: 500, extradimensional: true },
    "handy haversack": { isContainer: true, capacityWeight: 120, extradimensional: true },
    "heward's handy haversack": { isContainer: true, capacityWeight: 120, extradimensional: true },
    "efficient quiver": { isContainer: true, capacityWeight: null, extradimensional: true },
    "quiver of ehlonna": { isContainer: true, capacityWeight: null, extradimensional: true },
    "portable hole": { isContainer: true, capacityWeight: null, extradimensional: true },
    "pouch": { isContainer: true, capacityWeight: 6 },
    "belt pouch": { isContainer: true, capacityWeight: 6 },
    "sack": { isContainer: true, capacityWeight: 30 },
    "chest": { isContainer: true, capacityWeight: 300 },
    "barrel": { isContainer: true, capacityWeight: 300 },
    "basket": { isContainer: true, capacityWeight: 40 },
    "saddlebags": { isContainer: true, capacityWeight: 60 },
    "quiver": { isContainer: true, capacityWeight: 5 },
    "case, crossbow bolt": { isContainer: true, capacityWeight: 3 },
    "crossbow bolt case": { isContainer: true, capacityWeight: 3 },
    "case, map or scroll": { isContainer: true, capacityWeight: 2 },
    "map or scroll case": { isContainer: true, capacityWeight: 2 },
    "component pouch": { isContainer: true, capacityWeight: 6 }
};

function buildStandardWeightsMap(): Record<string, number> {
    const map: Record<string, number> = {
        // Adventuring Gear & Containers (2024 PHB / 5e SRD)
        "abacus": 2,
        "acid": 1,
        "acid (vial)": 1,
        "alchemist's fire": 1,
        "alchemist's fire (flask)": 1,
        "amulet": 1,
        "antitoxin": 0,
        "antitoxin (vial)": 0,
        "arcane focus": 1,
        "arrow": 0.05,
        "arrows": 1,
        "arrows (20)": 1,
        "backpack": 5,
        "bag of holding": 15,
        "ball bearings": 2,
        "ball bearings (bag of 1,000)": 2,
        "barrel": 70,
        "basket": 2,
        "bedroll": 7,
        "bell": 0,
        "blanket": 3,
        "block and tackle": 5,
        "blowgun needle": 0.02,
        "blowgun needles": 1,
        "blowgun needles (50)": 1,
        "book": 5,
        "bottle, glass": 2,
        "glass bottle": 2,
        "bucket": 2,
        "bullseye lantern": 2,
        "caltrops": 2,
        "caltrops (bag of 20)": 2,
        "candle": 0,
        "case, crossbow bolt": 1,
        "crossbow bolt case": 1,
        "case, map or scroll": 1,
        "map or scroll case": 1,
        "chain": 10,
        "chain (10 feet)": 10,
        "chest": 25,
        "climber's kit": 12,
        "clothes, common": 3,
        "common clothes": 3,
        "clothes, costume": 4,
        "costume clothes": 4,
        "clothes, fine": 6,
        "fine clothes": 6,
        "clothes, traveler's": 4,
        "traveler's clothes": 4,
        "clothes, vestments": 4,
        "component pouch": 2,
        "costume": 4,
        "crossbow bolt": 0.075,
        "crossbow bolts": 1.5,
        "crossbow bolts (20)": 1.5,
        "crowbar": 5,
        "crystal": 1,
        "druidic focus": 1,
        "emblem": 0,
        "fishing tackle": 4,
        "flask": 1,
        "flask or tankard": 1,
        "tankard": 1,
        "grappling hook": 4,
        "hammer": 3,
        "hammer, sledge": 10,
        "sledgehammer": 10,
        "healer's kit": 3,
        "holy symbol": 1,
        "holy water": 1,
        "holy water (flask)": 1,
        "hooded lantern": 2,
        "hourglass": 1,
        "hunting trap": 25,
        "ink": 0,
        "ink (1 ounce bottle)": 0,
        "ink pen": 0,
        "jug": 4,
        "jug or pitcher": 4,
        "pitcher": 4,
        "ladder": 25,
        "ladder (10-foot)": 25,
        "lamp": 1,
        "lantern, bullseye": 2,
        "lantern, hooded": 2,
        "lock": 1,
        "magnifying glass": 0,
        "manacles": 6,
        "mess kit": 1,
        "mirror": 0.5,
        "mirror, steel": 0.5,
        "steel mirror": 0.5,
        "oil": 1,
        "oil (flask)": 1,
        "orb": 3,
        "paper": 0,
        "paper (one sheet)": 0,
        "parchment": 0,
        "parchment (one sheet)": 0,
        "perfume": 0,
        "perfume (vial)": 0,
        "pick, miner's": 10,
        "miner's pick": 10,
        "piton": 0.25,
        "poison, basic": 0,
        "poison, basic (vial)": 0,
        "pole": 7,
        "pole (10-foot)": 7,
        "pot, iron": 10,
        "iron pot": 10,
        "potion of healing": 0.5,
        "pouch": 1,
        "belt pouch": 1,
        "quiver": 1,
        "ram, portable": 35,
        "portable ram": 35,
        "rations": 2,
        "rations (1 day)": 2,
        "reliquary": 2,
        "robe": 4,
        "robes": 4,
        "rod": 2,
        "rope": 5,
        "rope, hempen": 10,
        "rope, hempen (50 feet)": 10,
        "hempen rope": 10,
        "rope, silk": 5,
        "rope, silk (50 feet)": 5,
        "silk rope": 5,
        "saddlebags": 8,
        "sack": 0.5,
        "scale, merchant's": 3,
        "merchant's scale": 3,
        "sealing wax": 0,
        "shovel": 5,
        "signal whistle": 0,
        "signet ring": 0,
        "sling bullet": 0.075,
        "sling bullets": 1.5,
        "sling bullets (20)": 1.5,
        "firearm bullet": 0.2,
        "firearm bullets": 2,
        "firearm bullets (10)": 2,
        "soap": 0,
        "spellbook": 3,
        "spell scroll": 0,
        "spikes, iron": 5,
        "spikes, iron (10)": 5,
        "iron spikes": 5,
        "sprig of mistletoe": 0,
        "spyglass": 1,
        "staff": 4,
        "string": 0,
        "tent": 20,
        "tent, two-person": 20,
        "two-person tent": 20,
        "tinderbox": 1,
        "torch": 1,
        "totem": 0,
        "vial": 0,
        "wand": 1,
        "waterskin": 5,
        "waterskin (full)": 5,
        "whetstone": 1,
        "wooden staff": 4,
        "yew wand": 1,

        // Artisan's Tools, Kits & Musical Instruments
        "alchemist's supplies": 8,
        "brewer's supplies": 9,
        "calligrapher's supplies": 5,
        "carpenter's tools": 6,
        "cartographer's tools": 6,
        "cobbler's tools": 5,
        "cook's utensils": 8,
        "glassblower's tools": 5,
        "jeweler's tools": 2,
        "leatherworker's tools": 5,
        "mason's tools": 8,
        "painter's supplies": 5,
        "potter's tools": 3,
        "smith's tools": 8,
        "tinker's tools": 10,
        "weaver's tools": 5,
        "woodcarver's tools": 5,
        "disguise kit": 3,
        "forgery kit": 5,
        "gaming set": 0.5,
        "dice set": 0,
        "dragonchess set": 0.5,
        "playing card set": 0,
        "playing cards": 0,
        "three-dragon ante set": 0,
        "herbalism kit": 3,
        "navigator's tools": 2,
        "poisoner's kit": 2,
        "thieves' tools": 1,
        "bagpipes": 6,
        "drum": 3,
        "dulcimer": 10,
        "flute": 1,
        "horn": 2,
        "lute": 2,
        "lyre": 2,
        "pan flute": 2,
        "shawm": 1,
        "viol": 1,

        // Common Wondrous & Magic Items
        "amulet of health": 1,
        "amulet of proof against detection and location": 0,
        "belt of dwarvenkind": 1,
        "boots of elvenkind": 1,
        "boots of levitation": 1,
        "boots of speed": 1,
        "boots of striding and springing": 1,
        "boots of the winterlands": 1,
        "bracers of archery": 1,
        "bracers of defense": 1,
        "brooch of shielding": 0,
        "broom of flying": 3,
        "cape of the mountebank": 1,
        "carpet of flying": 8,
        "cloak of arachnida": 1,
        "cloak of displacement": 1,
        "cloak of elvenkind": 1,
        "cloak of protection": 1,
        "cloak of the bat": 1,
        "cloak of the manta ray": 1,
        "decanter of endless water": 2,
        "driftglobe": 1,
        "efficient quiver": 2,
        "folding boat": 4,
        "gauntlets of ogre power": 1,
        "gloves of missile snaring": 0,
        "gloves of swimming and climbing": 0,
        "gloves of thievery": 0,
        "goggles of night": 0,
        "handy haversack": 5,
        "headband of intellect": 1,
        "helm of comprehending languages": 3,
        "helm of telepathy": 3,
        "helm of teleportation": 3,
        "heward's handy haversack": 5,
        "immovable rod": 2,
        "lantern of revealing": 2,
        "necklace of fireballs": 0,
        "pearl of power": 0,
        "periapt of health": 0,
        "periapt of proof against poison": 0,
        "periapt of wound closure": 0,
        "portable hole": 0,
        "quiver of ehlonna": 2,
        "rope of climbing": 3,
        "rope of entanglement": 3,
        "slippers of spider climbing": 0.5,
        "winged boots": 1,
        "wings of flying": 1
    };

    for (const weapon of BASE_WEAPONS_2024) {
        const w = parseWeightLb(weapon.weight);
        if (w !== null) map[weapon.name.toLowerCase()] = w;
    }

    for (const armor of BASE_ARMOR_2024) {
        const w = parseWeightLb(armor.weight);
        if (w !== null) {
            const lower = armor.name.toLowerCase();
            map[lower] = w;
            if (!lower.endsWith(" armor") && lower !== "shield" && !lower.endsWith(" mail") && !lower.endsWith(" shirt") && lower !== "breastplate") {
                map[`${lower} armor`] = w;
            }
        }
    }

    for (const pack of STANDARD_PACKS) {
        const w = parseWeightLb((pack as { weight?: string | number }).weight);
        if (w !== null) map[pack.name.toLowerCase()] = w;
    }

    return map;
}

/** Lookup map of lowercase normalized D&D 2024/5e item names -> weight in lbs. */
export const STANDARD_ITEM_WEIGHTS: Record<string, number> = buildStandardWeightsMap();

function normalizeLookupName(name: string): string {
    return String(name || "")
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/\s*\(\+\d+\)\s*$/g, "")
        .replace(/,\s*\+\d+\s*$/g, "")
        .replace(/^\+\d+\s+/g, "")
        .replace(/\s+\+\d+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/** Look up default container flags & capacity for a known D&D container by name. */
export function lookupContainerDefaults(name?: string | null): ContainerDefaults | null {
    const raw = String(name || "").trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
    if (!raw) return null;
    if (STANDARD_CONTAINERS[raw]) return STANDARD_CONTAINERS[raw];
    const normalized = normalizeLookupName(raw);
    if (STANDARD_CONTAINERS[normalized]) return STANDARD_CONTAINERS[normalized];
    const noParens = normalized.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
    if (STANDARD_CONTAINERS[noParens]) return STANDARD_CONTAINERS[noParens];
    return null;
}

/** Whether a named item is an extradimensional container whose contents don't add to character carry weight. */
export function isExtradimensionalContainerName(name?: string | null, description?: string | null): boolean {
    const defaults = lookupContainerDefaults(name);
    if (defaults?.extradimensional) return true;
    const desc = String(description || "").toLowerCase();
    return desc.includes("extradimensional space") || desc.includes("regardless of its contents");
}

/** Look up the standard D&D weight in lbs for an item by name (supports "+1/+2/+3" and prefix/suffix variants). */
export function lookupItemWeightLb(name?: string | null, categoryOrFilterType?: string | null): number | null {
    const raw = String(name || "").trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
    if (!raw) return null;
    if (Object.prototype.hasOwnProperty.call(STANDARD_ITEM_WEIGHTS, raw)) {
        return STANDARD_ITEM_WEIGHTS[raw];
    }

    const normalized = normalizeLookupName(raw);
    if (Object.prototype.hasOwnProperty.call(STANDARD_ITEM_WEIGHTS, normalized)) {
        return STANDARD_ITEM_WEIGHTS[normalized];
    }

    const noParens = normalized.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
    if (Object.prototype.hasOwnProperty.call(STANDARD_ITEM_WEIGHTS, noParens)) {
        return STANDARD_ITEM_WEIGHTS[noParens];
    }

    // Prefix / pattern fallbacks for magic variants
    if (noParens.startsWith("potion of ") || noParens.startsWith("elixir of ") || noParens.startsWith("oil of ") || noParens.startsWith("philter of ")) {
        return 0.5;
    }
    if (noParens.startsWith("spell scroll") || noParens.startsWith("scroll of ")) return 0;
    if (noParens.startsWith("ring of ")) return 0;
    if (noParens.startsWith("belt of ")) return 1;
    if (noParens.startsWith("wand of ") || noParens.startsWith("wand ")) return 1;
    if (noParens.startsWith("rod of ") || noParens.startsWith("rod ")) return 2;
    if (noParens.startsWith("staff of ") || noParens.startsWith("staff ")) return 4;
    if (noParens.startsWith("ioun stone")) return 0;

    // Named magic weapons/armor (e.g. "Flame Tongue Longsword", "Dwarven Plate", "Mithral Half Plate")
    for (const armor of BASE_ARMOR_2024) {
        const lower = armor.name.toLowerCase();
        if (lower !== "shield" && noParens.includes(lower)) {
            return parseWeightLb(armor.weight);
        }
    }
    for (const weapon of BASE_WEAPONS_2024) {
        const lower = weapon.name.toLowerCase();
        if (noParens.endsWith(` ${lower}`) || noParens.startsWith(`${lower},`) || noParens.startsWith(`${lower} of `)) {
            return parseWeightLb(weapon.weight);
        }
    }

    const cat = String(categoryOrFilterType || "").toLowerCase();
    if (cat.includes("potion")) return 0.5;
    if (cat.includes("ring")) return 0;
    if (cat.includes("scroll")) return 0;
    if (cat.includes("shield") && !noParens.includes("arrow")) return 6;

    return null;
}
