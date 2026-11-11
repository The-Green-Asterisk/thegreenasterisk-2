import http from "http";
import cache from "../cache";
import AppDataSource from "../services/database";
import { Item } from "../services/database/entity/Item";
import { isLegacyDndBeyondEntity } from "../services/database/legacyFilter";
import { propagateItemEdit } from "../services/characterCopies";
import { sanitizeItemModifiers, seedItemModifiers } from "../services/database/itemMechanics";
import { differsFrom, ITEM_LOCK_COLUMNS, keepLockedFields, normalizeLockedFields } from "../services/definitionLocks";
import BaseController from "./baseController";
import SessionController from "./sessionController";

function parseModifiers(raw: string | null | undefined): any[] | undefined {
    if (!raw) return undefined;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function cleanHtmlTags(html: string): string {
    return html.replace(/<[^>]*>?/gm, "").trim();
}

function isTruthyQuery(value: unknown): boolean {
    if (typeof value !== "string") return false;
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function isLegacySrdSource(source?: string): boolean {
    const normalized = (source || "").toLowerCase();
    return normalized.includes("open 5e") || normalized.includes("open5e") || normalized.includes("srd") || normalized.includes("5e api");
}

export const MUNDANE_WEAPON_NAMES = new Set([
    "club", "dagger", "greatclub", "handaxe", "javelin", "light hammer", "mace", "quarterstaff", "sickle", "spear",
    "light crossbow", "dart", "shortbow", "sling",
    "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", "lance", "longsword", "maul", "morningstar",
    "pike", "rapier", "scimitar", "shortsword", "trident", "war pick", "warhammer", "whip",
    "blowgun", "heavy crossbow", "hand crossbow", "longbow", "net"
]);

export const MUNDANE_ARMOR_NAMES = new Set([
    "padded armor", "padded", "leather armor", "leather", "studded leather armor", "studded leather",
    "hide armor", "hide", "chain shirt", "scale mail", "breastplate", "half plate armor", "half plate",
    "ring mail", "chain mail", "splint armor", "splint", "plate armor", "plate", "shield"
]);

export const MUNDANE_EQUIPMENT_NAMES = new Set([
    ...MUNDANE_WEAPON_NAMES,
    ...MUNDANE_ARMOR_NAMES,
    "backpack", "bedroll", "bell", "blanket", "block and tackle", "book", "bottle, glass", "bucket", "caltrops",
    "candle", "case, crossbow bolt", "case, map or scroll", "chain", "chalk", "chest", "climber's kit",
    "clothes, common", "clothes, costume", "clothes, fine", "clothes, traveler's", "component pouch", "crowbar",
    "druidic focus", "emblem", "flask or tankard", "grappling hook", "hammer", "hammer, sledge", "healer's kit",
    "holy symbol", "holy water", "hourglass", "hunting trap", "ink", "ink pen", "jug or pitcher", "ladder",
    "lantern, bullseye", "lantern, hooded", "lock", "magnifying glass", "manacles", "mess kit", "mirror, steel",
    "oil", "paper", "parchment", "perfume", "pick, miner's", "piton", "poison, basic", "pole", "pot, iron",
    "pouch", "quiver", "ram, portable", "rations", "robes", "rope, hempen", "rope, silk", "sack", "scale, merchant's",
    "sealing wax", "shovel", "signal whistle", "signet ring", "soap", "spellbook", "spikes, iron", "spyglass",
    "tent, two-person", "tinderbox", "torch", "vial", "waterskin", "whetstone", "lyre", "lute", "flute", "drum",
    "horn", "pan flute", "shawm", "viol", "bagpipes", "dulcimer"
]);

export function isMundaneEquipment(name?: string): boolean {
    if (!name) return false;
    const clean = name.trim().toLowerCase();
    if (/(?:\+|\bplus\s*)[1-3]\b|\b[1-3]\s*\+/i.test(clean)) return false;
    if (/\b(of|flame tongue|frost brand|vicious|sun blade|moonblade|vorpal|luck blade|dragon slayer|giant slayer|defender)\b/i.test(clean)) {
        return false;
    }
    const baseClean = clean.replace(/\s*\([^)]*\)/g, "").replace(/\s*[×x]\d+/g, "").trim();
    return MUNDANE_EQUIPMENT_NAMES.has(baseClean) || MUNDANE_WEAPON_NAMES.has(baseClean) || MUNDANE_ARMOR_NAMES.has(baseClean);
}

export function isPotionOrOil(name?: string, category?: string, filterType?: string): boolean {
    const n = (name || "").toLowerCase();
    const c = (category || "").toLowerCase();
    const f = (filterType || "").toLowerCase();
    return (
        n.includes("potion of") ||
        n.includes("oil of") ||
        n.startsWith("potion ") ||
        n.startsWith("oil ") ||
        c.includes("potion") ||
        c.includes("oil") ||
        f.includes("potion") ||
        f.includes("oil")
    );
}

export function getItemSearchAliases(name: string): string[] {
    const raw = (name || "").trim();
    if (!raw) return [];
    const aliases = new Set<string>();
    aliases.add(raw);

    const potionParenMatch = raw.match(/Potion of Healing\s*\((Greater|Superior|Supreme)\)/i);
    if (potionParenMatch) {
        const tier = potionParenMatch[1].charAt(0).toUpperCase() + potionParenMatch[1].slice(1).toLowerCase();
        aliases.add(`Potion of ${tier} Healing`);
        aliases.add(`Potion of Healing, ${tier}`);
        aliases.add(`Potion of Healing`);
    }

    const potionOrderMatch = raw.match(/Potion of (Greater|Superior|Supreme) Healing/i);
    if (potionOrderMatch) {
        const tier = potionOrderMatch[1].charAt(0).toUpperCase() + potionOrderMatch[1].slice(1).toLowerCase();
        aliases.add(`Potion of Healing (${tier})`);
        aliases.add(`Potion of Healing, ${tier}`);
        aliases.add(`Potion of Healing`);
    }

    return Array.from(aliases);
}

export default class ItemController extends BaseController {
    /**
     * Upserts weapon and equipment definitions that come in with a character pull into the local database.
     * Always prefers character-pull definitions over free online (Open5e / SRD) definitions.
     */
    public static async upsertItemsFromCharacter(weapons: Array<any> = [], equipment: Array<any> = []): Promise<number> {
        if (!AppDataSource.isInitialized) return 0;
        let savedCount = 0;
        try {
            const itemRepo = AppDataSource.getRepository(Item);

            const sanitizedWeapons: any[] = [];
            const sanitizedEquipment: any[] = [...(equipment || [])];

            (weapons || []).forEach(w => {
                const wName = String(w?.name || "").toLowerCase();
                if (wName.includes("potion of") || wName.includes("oil of")) {
                    sanitizedEquipment.push({
                        ...w,
                        type: "Potion",
                        filterType: "Potion",
                        damage: undefined,
                        range: undefined,
                        properties: undefined,
                        mastery: undefined
                    });
                } else {
                    sanitizedWeapons.push(w);
                }
            });

            // Process weapons
            if (Array.isArray(sanitizedWeapons)) {
                for (const rawWep of sanitizedWeapons) {
                    try {
                        if (isLegacyDndBeyondEntity(rawWep)) continue;
                        const name = String(rawWep?.name || "").trim().slice(0, 255);
                        if (!name) continue;
                        const slug = slugify(name).slice(0, 255);
                        if (!slug) continue;

                        const parsedId = Number(rawWep?.id ?? rawWep?.definitionId ?? rawWep?.dndBeyondId);
                        const dndBeyondId = !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : undefined;

                        let existing = await itemRepo.findOne({ where: { slug } });
                        if (!existing && dndBeyondId) {
                            existing = await itemRepo.findOne({ where: { dndBeyondId } });
                        }

                        if (rawWep?.grantedBy && existing) {
                            continue;
                        }

                        const sourceLabel = (rawWep.source
                            ? (String(rawWep.source).toLowerCase().includes("d&d beyond") || String(rawWep.source).toLowerCase().includes("custom")
                                ? String(rawWep.source)
                                : `D&D Beyond (${rawWep.source})`)
                            : "D&D Beyond").slice(0, 255);

                        const category = String(rawWep.category || "Simple Melee").slice(0, 100);
                        const damage = rawWep.damage ? String(rawWep.damage).slice(0, 100) : undefined;
                        const range = rawWep.range ? String(rawWep.range).slice(0, 100) : "5 ft.";
                        const properties = Array.isArray(rawWep.properties)
                            ? rawWep.properties.join(", ").slice(0, 255)
                            : (rawWep.properties ? String(rawWep.properties).slice(0, 255) : undefined);
                        const mastery = rawWep.mastery?.name || (typeof rawWep.mastery === "string" ? rawWep.mastery : undefined);
                        const isMundane = isMundaneEquipment(name);
                        const isMagic = isMundane ? false : !!rawWep.isMagic;
                        const rarity = isMundane ? "Common" : String(rawWep.rarity || (isMagic ? "Uncommon" : "Common")).slice(0, 100);
                        const desc = String(rawWep.description || rawWep.notes || `<p>${name} (${category}).</p>`).trim();
                        const imageUrl = rawWep.imageUrl ? String(rawWep.imageUrl).slice(0, 500) : undefined;
                        const weight = Number(rawWep.weight) || 0;
                        const cost = Number(rawWep.cost) || undefined;

                        if (!existing) {
                            const created = itemRepo.create({
                                slug,
                                name,
                                filterType: "Weapon",
                                rarity,
                                isMagic,
                                requiresAttunement: !!rawWep.requiresAttunement,
                                source: sourceLabel,
                                category,
                                damage,
                                range,
                                properties,
                                mastery: mastery ? String(mastery).slice(0, 100) : undefined,
                                weight,
                                cost,
                                description: desc,
                                imageUrl,
                                dndBeyondId,
                                isCustom: false
                            });
                            const saved = await itemRepo.save(created);
                            cache.set(`item_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            cache.set(`item_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            savedCount++;
                        } else if (!existing.isCustom && (isLegacySrdSource(existing.source) || !existing.description || existing.description === "<p>No description provided.</p>" || isMundane)) {
                            const before = { ...existing };
                            existing.name = name;
                            existing.filterType = "Weapon";
                            existing.rarity = rarity;
                            existing.isMagic = isMagic;
                            existing.source = sourceLabel;
                            existing.category = category || existing.category;
                            existing.damage = damage || existing.damage;
                            existing.range = range || existing.range;
                            existing.properties = properties || existing.properties;
                            if (mastery) existing.mastery = String(mastery).slice(0, 100);
                            if (desc) existing.description = desc;
                            if (imageUrl) existing.imageUrl = imageUrl;
                            if (dndBeyondId) existing.dndBeyondId = dndBeyondId;
                            keepLockedFields(existing, before, ITEM_LOCK_COLUMNS);
                            const saved = await itemRepo.save(existing);
                            cache.set(`item_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            cache.set(`item_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            savedCount++;
                        }
                    } catch (wepErr) {
                        console.warn(`Could not upsert weapon "${rawWep?.name}":`, wepErr);
                    }
                }
            }

            // Process equipment
            if (Array.isArray(equipment)) {
                for (const rawEq of equipment) {
                    try {
                        if (isLegacyDndBeyondEntity(rawEq)) continue;
                        const name = String(rawEq?.name || "").trim().slice(0, 255);
                        if (!name) continue;
                        const slug = slugify(name).slice(0, 255);
                        if (!slug) continue;

                        const parsedId = Number(rawEq?.id ?? rawEq?.definitionId ?? rawEq?.dndBeyondId);
                        const dndBeyondId = !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : undefined;

                        let existing = await itemRepo.findOne({ where: { slug } });
                        if (!existing && dndBeyondId) {
                            existing = await itemRepo.findOne({ where: { dndBeyondId } });
                        }

                        if (rawEq?.grantedBy && existing) {
                            continue;
                        }

                        const sourceLabel = (rawEq.source
                            ? (String(rawEq.source).toLowerCase().includes("d&d beyond") || String(rawEq.source).toLowerCase().includes("custom")
                                ? String(rawEq.source)
                                : `D&D Beyond (${rawEq.source})`)
                            : "D&D Beyond").slice(0, 255);

                        const rawType = String(rawEq.type || "").trim();
                        const isPotion = isPotionOrOil(name, rawType, rawEq.filterType);
                        const isMundane = isPotion ? false : isMundaneEquipment(name);
                        const isMagic = isPotion ? true : (isMundane ? false : !!(rawEq.isMagic || (rawEq.rarity && rawEq.rarity.toLowerCase() !== "common" && rawEq.rarity.toLowerCase() !== "none")));
                        const filterType = isPotion ? "Potion" : (isMundane ? (rawType || "Equipment") : (rawType || (isMagic ? "Magic Item" : "Item")));
                        let rarity = isMundane ? "Common" : String(rawEq.rarity || (isMagic ? "Uncommon" : "Common")).slice(0, 100);
                        if (isPotion) {
                            const nLower = name.toLowerCase();
                            if (nLower.includes("greater")) rarity = "Uncommon";
                            else if (nLower.includes("superior")) rarity = "Rare";
                            else if (nLower.includes("supreme")) rarity = "Very Rare";
                        }
                        const desc = String(rawEq.description || rawEq.notes || `<p>${name} (${filterType}).</p>`).trim();
                        const imageUrl = rawEq.imageUrl ? String(rawEq.imageUrl).slice(0, 500) : undefined;
                        const weight = Number(rawEq.weight) || 0;
                        const cost = Number(rawEq.cost) || undefined;

                        if (!existing) {
                            const created = itemRepo.create({
                                slug,
                                name,
                                filterType: filterType.slice(0, 100),
                                category: isPotion ? "Potion" : undefined,
                                rarity,
                                isMagic,
                                requiresAttunement: isMundane || isPotion ? false : !!(rawEq.attuned || rawEq.requiresAttunement),
                                source: sourceLabel,
                                weight,
                                cost,
                                description: desc,
                                imageUrl,
                                dndBeyondId,
                                isCustom: false
                            });
                            const saved = await itemRepo.save(created);
                            cache.set(`item_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            cache.set(`item_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            savedCount++;
                        } else if (!existing.isCustom && (isPotion || isLegacySrdSource(existing.source) || !existing.description || existing.description === "<p>No description provided.</p>" || isMundane)) {
                            const before = { ...existing };
                            existing.name = name;
                            if (isPotion) {
                                existing.filterType = "Potion";
                                existing.category = "Potion";
                                existing.damage = undefined;
                                existing.range = undefined;
                                existing.properties = undefined;
                                existing.mastery = undefined;
                                existing.isMagic = true;
                                existing.rarity = rarity;
                                existing.requiresAttunement = false;
                            } else {
                                if (filterType && existing.filterType === "Item") existing.filterType = filterType.slice(0, 100);
                                if (isMundane && existing.filterType === "Magic Item") existing.filterType = "Equipment";
                                existing.rarity = rarity;
                                existing.isMagic = isMagic;
                            }
                            existing.source = sourceLabel;
                            if (desc) existing.description = desc;
                            if (imageUrl) existing.imageUrl = imageUrl;
                            if (dndBeyondId) existing.dndBeyondId = dndBeyondId;
                            keepLockedFields(existing, before, ITEM_LOCK_COLUMNS);
                            const saved = await itemRepo.save(existing);
                            cache.set(`item_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            cache.set(`item_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "Database", item: saved }), 3600);
                            savedCount++;
                        }
                    } catch (eqErr) {
                        console.warn(`Could not upsert equipment "${rawEq?.name}":`, eqErr);
                    }
                }
            }
        } catch (err) {
            console.warn("Could not upsert character items into database:", err);
        }
        return savedCount;
    }

    public static async syncCharacterItems(req: http.IncomingMessage, _res: http.ServerResponse) {
        try {
            const body = await BaseController.readBody<{ weapons?: any[]; equipment?: any[] }>(req);
            const weapons = Array.isArray(body?.weapons) ? body.weapons : [];
            const equipment = Array.isArray(body?.equipment) ? body.equipment : [];
            const savedCount = await this.upsertItemsFromCharacter(weapons, equipment);
            return {
                response: JSON.stringify({ success: true, syncedCount: savedCount }),
                header: "application/json",
                status: 200
            };
        } catch (error: any) {
            return {
                response: JSON.stringify({ error: error?.message || "Failed to sync character items." }),
                status: 400
            };
        }
    }

    public static async searchItems(req: http.IncomingMessage, _res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const searchTerm = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
        const typeFilter = typeof query.type === "string" ? query.type.trim().toLowerCase() : "all";
        const limit = Math.min(200, Math.max(1, Number(query.limit) || 100));

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ items: [] }),
                header: "application/json",
                status: 200
            };
        }

        try {
            const itemRepo = AppDataSource.getRepository(Item);
            const allItems = await itemRepo.find({
                order: {
                    name: "ASC"
                }
            });

            // Auto-heal any misclassified potions/oils in the database
            for (const item of allItems) {
                if (isPotionOrOil(item.name, item.category, item.filterType)) {
                    const before = { ...item };
                    let changed = false;
                    if (item.filterType !== "Potion") {
                        item.filterType = "Potion";
                        changed = true;
                    }
                    if (item.category !== "Potion") {
                        item.category = "Potion";
                        changed = true;
                    }
                    if (item.damage) {
                        item.damage = undefined as any;
                        changed = true;
                    }
                    if (item.range) {
                        item.range = undefined as any;
                        changed = true;
                    }
                    if (item.properties) {
                        item.properties = undefined as any;
                        changed = true;
                    }
                    if (item.mastery) {
                        item.mastery = undefined as any;
                        changed = true;
                    }
                    if (!item.isMagic) {
                        item.isMagic = true;
                        changed = true;
                    }
                    const nLower = item.name.toLowerCase();
                    if (nLower.includes("greater") && (!item.rarity || item.rarity === "Common")) {
                        item.rarity = "Uncommon";
                        changed = true;
                    } else if (nLower.includes("superior") && (!item.rarity || item.rarity === "Common" || item.rarity === "Uncommon")) {
                        item.rarity = "Rare";
                        changed = true;
                    } else if (nLower.includes("supreme") && (!item.rarity || item.rarity !== "Very Rare")) {
                        item.rarity = "Very Rare";
                        changed = true;
                    }
                    keepLockedFields(item, before, ITEM_LOCK_COLUMNS);
                    if (changed && differsFrom(item, before)) {
                        await itemRepo.save(item);
                        const slug = item.slug || slugify(item.name);
                        cache.del(`item_detail_${slug}_pref2024`);
                        cache.del(`item_detail_${slug}_mixed`);
                        cache.del(`item_detail_${slug}`);
                    }
                }
            }

            let filtered = allItems.filter(item => {
                const itemIsPotion = isPotionOrOil(item.name, item.category, item.filterType);
                if (typeFilter && typeFilter !== "all") {
                    const fType = (item.filterType || "").toLowerCase();
                    const cat = (item.category || "").toLowerCase();
                    if (typeFilter === "weapon") {
                        if (itemIsPotion) return false;
                        if (!fType.includes("weapon") && !cat.includes("weapon") && !item.damage) return false;
                    } else if (typeFilter === "magic-item") {
                        if (!item.isMagic && (!item.rarity || item.rarity.toLowerCase() === "common") && !fType.includes("magic") && !itemIsPotion) return false;
                    } else if (typeFilter === "armor") {
                        if (itemIsPotion) return false;
                        if (!fType.includes("armor") && !fType.includes("shield") && !cat.includes("armor")) return false;
                    } else if (typeFilter === "potion") {
                        if (!itemIsPotion && !fType.includes("potion") && !cat.includes("potion")) return false;
                    } else if (typeFilter === "wondrous") {
                        if (itemIsPotion) return false;
                        if (!fType.includes("wondrous")) return false;
                    } else if (typeFilter === "gear") {
                        if (fType.includes("weapon") || fType.includes("armor")) return false;
                    }
                }

                if (!searchTerm) return true;
                const haystack = `${item.name} ${item.filterType || ""} ${item.category || ""} ${item.rarity || ""} ${item.properties || ""} ${item.description || ""}`.toLowerCase();
                return haystack.includes(searchTerm);
            }).slice(0, limit);

            let fetchedOnline = false;
            if (filtered.length === 0 && searchTerm.length >= 2) {
                const rawQuery = typeof query.q === "string" ? query.q.trim() : searchTerm;
                const onlineItems = await this.searchAndSaveOnlineItems(rawQuery, typeFilter);
                if (onlineItems.length > 0) {
                    filtered = onlineItems.slice(0, limit);
                    fetchedOnline = true;
                }
            }

            return {
                response: JSON.stringify({ items: filtered, fetchedOnline }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error searching database items:", error);
            return {
                response: JSON.stringify({ items: [] }),
                header: "application/json",
                status: 200
            };
        }
    }

    public static async getItem(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const nameQuery = typeof query.name === "string" ? query.name.trim() : "";
        const idQuery = typeof query.id === "string" ? query.id.trim() : "";
        const typeQuery = typeof query.type === "string" ? query.type.trim() : "";
        const preferRules2024 = isTruthyQuery(query.preferRules2024);
        const dndBeyondId = idQuery && /^\d+$/.test(idQuery) ? parseInt(idQuery) : undefined;

        if (!nameQuery && !dndBeyondId) {
            return {
                response: JSON.stringify({ error: "Item name or ID is required." }),
                status: 400
            };
        }

        const slug = slugify(nameQuery || `item-${dndBeyondId}`);
        const cacheKey = `item_detail_${slug}_${preferRules2024 ? "pref2024" : "mixed"}`;
        const cached = cache.get<string>(cacheKey) || cache.get<string>(`item_detail_${slug}`);
        if (cached) {
            try {
                const parsedCached = JSON.parse(cached);
                const cachedItem = parsedCached?.item || parsedCached;
                const cachedIsPotion = cachedItem && isPotionOrOil(cachedItem.name, cachedItem.category, cachedItem.filterType);
                if (cachedItem && isMundaneEquipment(cachedItem.name) && cachedItem.isMagic) {
                    // Cached item was mistakenly flagged as magic; invalidate and reprocess
                    cache.del(cacheKey);
                    cache.del(`item_detail_${slug}`);
                } else if (cachedIsPotion && (cachedItem.damage || cachedItem.filterType === "Weapon" || String(cachedItem.category || "").toLowerCase().includes("weapon"))) {
                    // Cached potion was mistakenly flagged with weapon attributes; invalidate and reprocess
                    cache.del(cacheKey);
                    cache.del(`item_detail_${slug}`);
                } else if (cachedItem && (cachedItem.slug === "quarterstaff" || cachedItem.name?.toLowerCase() === "quarterstaff") && cachedItem.description && (cachedItem.description.includes("woodlands") || cachedItem.description.includes("can be wielded as a magic"))) {
                    cache.del(cacheKey);
                    cache.del(`item_detail_${slug}`);
                } else {
                    return {
                        response: cached,
                        header: "application/json",
                        status: 200
                    };
                }
            } catch {
                return {
                    response: cached,
                    header: "application/json",
                    status: 200
                };
            }
        }

        let legacyDbItemFallback: Item | null = null;

        // STEP 1: Check Local Database
        try {
            if (AppDataSource.isInitialized) {
                const itemRepo = AppDataSource.getRepository(Item);
                let dbItem: Item | null = null;
                if (slug) {
                    dbItem = await itemRepo.findOne({ where: { slug } });
                }
                if (!dbItem && dndBeyondId) {
                    dbItem = await itemRepo.findOne({ where: { dndBeyondId } });
                }

                if (dbItem) {
                    const before = { ...dbItem };
                    if (isPotionOrOil(dbItem.name, dbItem.category, dbItem.filterType)) {
                        let changed = false;
                        if (dbItem.filterType !== "Potion") {
                            dbItem.filterType = "Potion";
                            changed = true;
                        }
                        if (dbItem.category !== "Potion") {
                            dbItem.category = "Potion";
                            changed = true;
                        }
                        if (dbItem.damage) {
                            dbItem.damage = undefined as any;
                            changed = true;
                        }
                        if (dbItem.range) {
                            dbItem.range = undefined as any;
                            changed = true;
                        }
                        if (dbItem.properties) {
                            dbItem.properties = undefined as any;
                            changed = true;
                        }
                        if (dbItem.mastery) {
                            dbItem.mastery = undefined as any;
                            changed = true;
                        }
                        if (!dbItem.isMagic) {
                            dbItem.isMagic = true;
                            changed = true;
                        }
                        const nLower = dbItem.name.toLowerCase();
                        if (nLower.includes("greater") && (!dbItem.rarity || dbItem.rarity === "Common")) {
                            dbItem.rarity = "Uncommon";
                            changed = true;
                        } else if (nLower.includes("superior") && (!dbItem.rarity || dbItem.rarity === "Common" || dbItem.rarity === "Uncommon")) {
                            dbItem.rarity = "Rare";
                            changed = true;
                        } else if (nLower.includes("supreme") && (!dbItem.rarity || dbItem.rarity !== "Very Rare")) {
                            dbItem.rarity = "Very Rare";
                            changed = true;
                        }
                        keepLockedFields(dbItem, before, ITEM_LOCK_COLUMNS);
                        if (changed && differsFrom(dbItem, before)) {
                            await itemRepo.save(dbItem);
                        }
                    } else if (isMundaneEquipment(dbItem.name) && (dbItem.isMagic || dbItem.filterType === "Magic Item")) {
                        dbItem.isMagic = false;
                        dbItem.rarity = "Common";
                        if (dbItem.filterType === "Magic Item") {
                            dbItem.filterType = dbItem.damage ? "Weapon" : "Equipment";
                        }
                        keepLockedFields(dbItem, before, ITEM_LOCK_COLUMNS);
                        if (differsFrom(dbItem, before)) await itemRepo.save(dbItem);
                    }

                    if (dbItem.slug === "quarterstaff" && dbItem.description && (dbItem.description.includes("woodlands") || dbItem.description.includes("can be wielded as a magic quarterstaff"))) {
                        dbItem.description = "<p>Proficiency with a Quarterstaff allows you to add your proficiency bonus to the attack roll for any attack you make with it.</p><p><strong>Versatile:</strong> This weapon can be used with one or two hands. A damage value in parentheses appears with the property—the damage when the weapon is used with two hands to make a melee attack.</p>";
                        keepLockedFields(dbItem, before, ITEM_LOCK_COLUMNS);
                        if (differsFrom(dbItem, before)) await itemRepo.save(dbItem);
                    }

                    if (preferRules2024 && isLegacySrdSource(dbItem.source)) {
                        legacyDbItemFallback = dbItem;
                    } else {
                        const jsonRes = JSON.stringify({ sourceTier: "Database", item: dbItem });
                        cache.set(cacheKey, jsonRes, 3600);
                        return {
                            response: jsonRes,
                            header: "application/json",
                            status: 200
                        };
                    }
                }
            }
        } catch (dbError) {
            console.error("Local database item lookup error:", dbError);
        }

        // STEP 2: Check D&D Beyond by public web page scraping or ID
        let foundItem: Partial<Item> | null = null;
        if (nameQuery || dndBeyondId) {
            foundItem = await this.fetchFromDndBeyond(nameQuery, dndBeyondId, typeQuery);
        }

        if (!foundItem && legacyDbItemFallback) {
            const jsonRes = JSON.stringify({ sourceTier: "Database Legacy Fallback", item: legacyDbItemFallback });
            cache.set(cacheKey, jsonRes, 3600);
            return {
                response: jsonRes,
                header: "application/json",
                status: 200
            };
        }

        // STEP 3: Fallback to Open5e & D&D 5e API
        if (!foundItem && nameQuery) {
            foundItem = await this.fetchFromOpen5eOr5eApi(nameQuery, typeQuery);
        }

        if (!foundItem) {
            return {
                response: JSON.stringify({ error: `Item "${nameQuery}" not found.` }),
                status: 404
            };
        }

        // Save into local database for subsequent requests
        let savedItem: Item | Partial<Item> = foundItem;
        try {
            if (AppDataSource.isInitialized) {
                const itemRepo = AppDataSource.getRepository(Item);
                const newItem = itemRepo.create({
                    slug: foundItem.slug || slug,
                    name: foundItem.name || nameQuery,
                    filterType: foundItem.filterType || "Item",
                    rarity: foundItem.rarity || "Common",
                    isMagic: !!foundItem.isMagic,
                    requiresAttunement: !!foundItem.requiresAttunement,
                    source: foundItem.source || "D&D Beyond",
                    category: foundItem.category,
                    damage: foundItem.damage,
                    range: foundItem.range,
                    properties: foundItem.properties,
                    mastery: foundItem.mastery,
                    weight: foundItem.weight || 0,
                    cost: foundItem.cost,
                    description: foundItem.description || "<p>No description provided.</p>",
                    imageUrl: foundItem.imageUrl,
                    dndBeyondId: foundItem.dndBeyondId || dndBeyondId,
                    isCustom: false
                });
                savedItem = await itemRepo.save(newItem);
            }
        } catch (saveError) {
            console.warn("Could not persist external item to database:", saveError);
        }

        const itemSource = (foundItem.source || "").toLowerCase();
        const sourceTier = itemSource.includes("d&d beyond")
            ? "D&D Beyond"
            : itemSource.includes("open 5e") || itemSource.includes("open5e") || itemSource.includes("srd") || itemSource.includes("5e api")
                ? (preferRules2024 ? "Legacy SRD Fallback" : "SRD")
                : (foundItem.source || "External");

        const jsonOut = JSON.stringify({ sourceTier, item: savedItem });
        cache.set(cacheKey, jsonOut, 3600);
        return {
            response: jsonOut,
            header: "application/json",
            status: 200
        };
    }

    /** The fields the Add/Edit Custom Weapon and Magic Item dialogs control, normalized the same way for both */
    private static customItemFields(body: Partial<Item>) {
        const cost = body.cost !== undefined && body.cost !== null && String(body.cost).trim() !== "" ? Number(body.cost) : undefined;
        return {
            name: String(body.name || "").trim(),
            filterType: body.filterType?.trim() || "Item",
            rarity: body.rarity?.trim() || "Common",
            isMagic: !!body.isMagic,
            requiresAttunement: !!body.requiresAttunement,
            category: body.category?.trim() || undefined,
            damage: body.damage?.trim() || undefined,
            range: body.range?.trim() || undefined,
            properties: body.properties?.trim() || undefined,
            mastery: body.mastery?.trim() || undefined,
            weight: Number(body.weight) || 0,
            cost: cost !== undefined && !Number.isNaN(cost) ? cost : undefined,
            description: String(body.description || "").trim(),
            imageUrl: body.imageUrl?.trim() || undefined
        };
    }

    private static clearItemCache(slug: string) {
        cache.del([`item_detail_${slug}`, `item_detail_${slug}_pref2024`, `item_detail_${slug}_mixed`]);
    }

    public static async createCustomItem(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify({ error: "Log in to add custom items." }),
                status: 401
            };
        }

        try {
            const body = await BaseController.readBody<Partial<Item>>(req);
            if (!body || !body.name || !body.description) {
                return {
                    response: JSON.stringify({ error: "Name and description are required." }),
                    status: 400
                };
            }

            const rawSlug = slugify(body.name);
            if (!rawSlug) {
                return {
                    response: JSON.stringify({ error: "Invalid item name." }),
                    status: 400
                };
            }

            if (!AppDataSource.isInitialized) {
                return {
                    response: JSON.stringify({ error: "Database not initialized." }),
                    status: 503
                };
            }

            const itemRepo = AppDataSource.getRepository(Item);
            const existing = await itemRepo.findOne({ where: { slug: rawSlug } });
            if (existing) {
                return {
                    response: JSON.stringify({ error: "An item with this name already exists in the database." }),
                    status: 409
                };
            }

            const modifiers = (body as any).modifiers;
            const customItem = itemRepo.create({
                ...this.customItemFields(body),
                ...(Array.isArray(modifiers) ? { modifiersJson: sanitizeItemModifiers(modifiers) ?? undefined } : {}),
                slug: rawSlug,
                source: body.source?.trim() || "Custom / Homebrew",
                isCustom: true,
                createdById: currentUser.id
            });

            const saved = await itemRepo.save(customItem);
            const responseItem = {
                sourceTier: "Custom Database",
                item: saved
            };
            this.clearItemCache(rawSlug);
            cache.set(`item_detail_${rawSlug}`, JSON.stringify(responseItem), 3600);
            // /get-rules carries every item's effects
            if (saved.modifiersJson) cache.del("dnd_rules_all");

            return {
                response: JSON.stringify(responseItem),
                status: 201
            };
        } catch (error: any) {
            console.error("Error creating custom item:", error);
            return {
                response: JSON.stringify({ error: error.message || "Internal server error" }),
                status: 500
            };
        }
    }

    /** Creators can edit their own custom items; admins can edit any item. Source, modifiers, and IDs stay as they were. */
    public static async editCustomItem(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify({ error: "Log in to edit items." }),
                status: 401
            };
        }

        try {
            const body = await BaseController.readBody<Partial<Item>>(req);
            const id = Number(body?.id);
            if (!body || !Number.isInteger(id) || id <= 0) {
                return {
                    response: JSON.stringify({ error: "Item ID is required." }),
                    status: 400
                };
            }
            if (!body.name || !body.description) {
                return {
                    response: JSON.stringify({ error: "Name and description are required." }),
                    status: 400
                };
            }

            const newSlug = slugify(body.name);
            if (!newSlug) {
                return {
                    response: JSON.stringify({ error: "Invalid item name." }),
                    status: 400
                };
            }

            if (!AppDataSource.isInitialized) {
                return {
                    response: JSON.stringify({ error: "Database not initialized." }),
                    status: 503
                };
            }

            const itemRepo = AppDataSource.getRepository(Item);
            const item = await itemRepo.findOne({ where: { id } });
            if (!item) {
                return {
                    response: JSON.stringify({ error: "Item not found." }),
                    status: 404
                };
            }

            if (!BaseController.canEditOwned(currentUser, item.createdById)) {
                return {
                    response: JSON.stringify({ error: "You can only edit items you created." }),
                    status: 403
                };
            }

            const oldSlug = item.slug;
            const oldNameBeforeEdit = item.name;
            // The effects the item had before this edit, to keep on characters' locked copies
            const previousModifiers = parseModifiers(item.modifiersJson) ?? seedItemModifiers(oldNameBeforeEdit) ?? [];
            const modifiersChanged = Array.isArray((body as any).modifiers);
            if (newSlug !== oldSlug) {
                const clash = await itemRepo.findOne({ where: { slug: newSlug } });
                if (clash && clash.id !== item.id) {
                    return {
                        response: JSON.stringify({ error: "An item with this name already exists in the database." }),
                        status: 409
                    };
                }
            }

            Object.assign(item, this.customItemFields(body), { slug: newSlug });
            if ((body as any).lockedFields !== undefined) {
                item.lockedFields = normalizeLockedFields((body as any).lockedFields, ITEM_LOCK_COLUMNS);
            }
            if (modifiersChanged) item.modifiersJson = sanitizeItemModifiers((body as any).modifiers) as string;
            // TypeORM skips undefined on save, so a field the dialog cleared has to become null
            for (const key of ["category", "damage", "range", "properties", "mastery", "cost", "imageUrl"] as const) {
                if (item[key] === undefined || item[key] === "") (item as any)[key] = null;
            }
            const saved = await itemRepo.save(item);

            this.clearItemCache(oldSlug);
            this.clearItemCache(newSlug);
            cache.del("dnd_rules_all");

            const propagation = await propagateItemEdit(saved, oldNameBeforeEdit, modifiersChanged ? { previousModifiers } : undefined).catch((err) => {
                console.error("Could not copy the item edit onto characters:", err);
                return null;
            });

            return {
                response: JSON.stringify({ sourceTier: saved.isCustom ? "Custom Database" : "Database", item: saved, propagation }),
                status: 200
            };
        } catch (error: any) {
            console.error("Error editing item:", error);
            return {
                response: JSON.stringify({ error: error.message || "Internal server error" }),
                status: 500
            };
        }
    }

    private static async fetchFromDndBeyond(name: string, dndBeyondId?: number, typeHint?: string): Promise<Partial<Item> | null> {
        try {
            const slug = slugify(name);
            const candidates: string[] = [];

            const isWeapon = typeHint?.toLowerCase().includes("weapon");
            const isMagic = typeHint?.toLowerCase().includes("magic") || typeHint?.toLowerCase().includes("potion") || typeHint?.toLowerCase().includes("scroll") || typeHint?.toLowerCase().includes("wondrous");

            if (dndBeyondId && slug) {
                if (isMagic) {
                    candidates.push(`https://www.dndbeyond.com/magic-items/${dndBeyondId}-${slug}`);
                }
                candidates.push(`https://www.dndbeyond.com/equipment/${dndBeyondId}-${slug}`);
                candidates.push(`https://www.dndbeyond.com/magic-items/${dndBeyondId}-${slug}`);
            }

            if (slug) {
                if (isMagic) {
                    candidates.push(`https://www.dndbeyond.com/magic-items/${slug}`);
                }
                candidates.push(`https://www.dndbeyond.com/equipment/${slug}`);
                candidates.push(`https://www.dndbeyond.com/magic-items/${slug}`);
            }

            for (const url of candidates) {
                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                    }
                });

                if (response.ok) {
                    const html = await response.text();
                    const parsed = this.parseDndBeyondItemHtml(html, name, slug, dndBeyondId, url);
                    if (parsed) return parsed;
                }
            }
        } catch (err) {
            console.warn("Failed fetching item from D&D Beyond page:", err);
        }
        return null;
    }

    private static parseDndBeyondItemHtml(html: string, fallbackName: string, slug: string, dndBeyondId?: number, sourceUrl?: string): Partial<Item> | null {
        const nameMatch = html.match(/<h1[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
            html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const name = nameMatch ? cleanHtmlTags(nameMatch[1]) : fallbackName;

        // Try extracting specific description containers first
        // Note: D&D Beyond magic items put the description inside <div class="more-info-content">
        // while standard equipment/weapons put it inside <div class="details-container-content-description-text">
        let description = "";
        const moreInfoContentMatch = html.match(/<div[^>]*class=["'][^"']*more-info-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        const detailsContainerMatch = html.match(/<div[^>]*class=["'][^"']*details-container-content-description-text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        const genericDescMatch = html.match(/<div[^>]*class=["'][^"']*(?:item-description|equipment-description|magic-item-description)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

        if (moreInfoContentMatch && moreInfoContentMatch[1].trim()) {
            description = moreInfoContentMatch[1].trim();
        } else if (detailsContainerMatch && detailsContainerMatch[1].trim()) {
            description = detailsContainerMatch[1].trim();
        } else if (genericDescMatch && genericDescMatch[1].trim()) {
            description = genericDescMatch[1].trim();
        }

        if (!description) return null;

        // Extract image URL if present on D&D Beyond page
        let imageUrl: string | undefined;
        const magicItemImgMatch = html.match(/<img[^>]+class=["'][^"']*magic-item-image[^"']*["'][^>]+src=["']([^"']+)["']/i) ||
            html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*magic-item-image[^"']*["']/i);
        if (magicItemImgMatch) {
            imageUrl = magicItemImgMatch[1];
        } else {
            const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
            if (ogImageMatch && !ogImageMatch[1].includes("og-items.png") && !ogImageMatch[1].includes("logo-")) {
                imageUrl = ogImageMatch[1];
            }
        }

        // Check if magic item
        const isPotion = isPotionOrOil(name);
        const isMundane = isPotion ? false : isMundaneEquipment(name);
        const isMagicRoute = sourceUrl ? sourceUrl.includes("/magic-items/") : false;
        const detailsContainerLower = (detailsContainerMatch ? detailsContainerMatch[0] : "").toLowerCase();
        const moreInfoLower = (moreInfoContentMatch ? moreInfoContentMatch[0] : "").toLowerCase();

        let isMagic = false;
        if (isPotion) {
            isMagic = true;
        } else if (!isMundane) {
            isMagic = isMagicRoute ||
                detailsContainerLower.includes("magic item") ||
                detailsContainerLower.includes("wondrous item") ||
                moreInfoLower.includes("magic item") ||
                moreInfoLower.includes("wondrous item") ||
                name.toLowerCase().includes("potion of") ||
                name.toLowerCase().includes("scroll of");
        }

        const requiresAttunement = !isMundane && !isPotion && html.toLowerCase().includes("requires attunement");

        // Rarity
        let rarity = "Common";
        if (isMagic) {
            const rarityMatch = html.match(/\b(uncommon|rare|very rare|legendary|artifact)\b/i);
            if (rarityMatch) {
                rarity = rarityMatch[1].charAt(0).toUpperCase() + rarityMatch[1].slice(1).toLowerCase();
            } else if (isPotion) {
                const nLower = name.toLowerCase();
                if (nLower.includes("greater")) rarity = "Uncommon";
                else if (nLower.includes("superior")) rarity = "Rare";
                else if (nLower.includes("supreme")) rarity = "Very Rare";
            } else {
                rarity = "Common";
            }
        }

        // Damage & Properties
        let damage: string | undefined;
        let range: string | undefined;
        let properties: string | undefined;
        let mastery: string | undefined;

        if (!isPotion) {
            const dmgMatch = html.match(/Damage:\s*<[^>]+>([^<]+)<\/[^>]+>\s*<[^>]+>([^<]+)<\/[^>]+>/i) ||
                html.match(/(\d+d\d+)\s+(bludgeoning|piercing|slashing|fire|cold|lightning|thunder|acid|poison|necrotic|radiant|force|psychic)\b/i);
            if (dmgMatch) {
                damage = `${dmgMatch[1]} ${dmgMatch[2]}`;
            }

            const masteryMatch = html.match(/<strong><em>(Nick|Vex|Sap|Slow|Push|Topple|Cleave|Graze)\.<\/em><\/strong>/i);
            if (masteryMatch) {
                mastery = masteryMatch[1];
            }
        }

        return {
            slug,
            name,
            filterType: isPotion ? "Potion" : (isMagic ? "Magic Item" : "Equipment"),
            category: isPotion ? "Potion" : undefined,
            rarity,
            isMagic,
            requiresAttunement,
            source: "D&D Beyond",
            damage,
            range,
            properties,
            mastery,
            description,
            imageUrl,
            dndBeyondId
        };
    }

    private static async fetchFromOpen5eOr5eApi(name: string, typeHint?: string): Promise<Partial<Item> | null> {
        const aliases = getItemSearchAliases(name);
        const isPotion = isPotionOrOil(name) || aliases.some(a => isPotionOrOil(a));

        // 1. D&D 5e API (magic-items or equipment)
        try {
            const urls: string[] = [];
            for (const alias of aliases) {
                const aSlug = slugify(alias);
                urls.push(`https://www.dnd5eapi.co/api/magic-items/${aSlug}`);
                if (!isPotion) {
                    urls.push(`https://www.dnd5eapi.co/api/equipment/${aSlug}`);
                }
            }

            for (const url of urls) {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.name) {
                        const isMundane = isPotion ? false : isMundaneEquipment(data.name || name);
                        const isMagicUrl = url.includes("magic-items");
                        const rarityName = data.rarity?.name || "";
                        const isMagic = isPotion ? true : (!isMundane && (isMagicUrl || (!!data.rarity && rarityName.toLowerCase() !== "common" && rarityName.toLowerCase() !== "none")));
                        let rarity = isMundane ? "Common" : (rarityName || (isMagic ? "Varies" : "Common"));
                        if (isPotion) {
                            const nLower = (data.name || name).toLowerCase();
                            if (nLower.includes("greater")) rarity = "Uncommon";
                            else if (nLower.includes("superior")) rarity = "Rare";
                            else if (nLower.includes("supreme")) rarity = "Very Rare";
                        }
                        const desc = Array.isArray(data.desc) ? data.desc.map((d: string) => `<p>${d}</p>`).join("") : `<p>${data.desc || ""}</p>`;

                        let damage: string | undefined;
                        if (!isPotion && data.damage) {
                            damage = `${data.damage.damage_dice} ${data.damage.damage_type?.name || ""}`.trim();
                        }

                        let range: string | undefined;
                        if (!isPotion && data.range) {
                            range = data.range.long ? `${data.range.normal}/${data.range.long} ft.` : `${data.range.normal} ft.`;
                        }

                        let properties: string | undefined;
                        if (!isPotion && Array.isArray(data.properties)) {
                            properties = data.properties.map((p: any) => p.name).join(", ");
                        }

                        return {
                            slug: slugify(data.name || name),
                            name: data.name,
                            filterType: isPotion ? "Potion" : (isMundane ? "Equipment" : (isMagic ? "Magic Item" : (data.equipment_category?.name || "Equipment"))),
                            rarity,
                            isMagic,
                            requiresAttunement: !isMundane && !isPotion && !!(data.desc && JSON.stringify(data.desc).toLowerCase().includes("requires attunement")),
                            source: "D&D 5e API (SRD)",
                            category: isPotion ? "Potion" : (data.equipment_category?.name || data.gear_category?.name),
                            damage,
                            range,
                            properties,
                            weight: data.weight || 0,
                            cost: data.cost?.quantity,
                            description: desc
                        };
                    }
                }
            }
        } catch (err) {
            console.warn("Failed fetching from dnd5eapi.co:", err);
        }

        // 2. Open5e API (magicitems or weapons)
        try {
            const open5eEndpoints: string[] = [];
            for (const alias of aliases) {
                // For potions/oils, search magicitems ONLY - never query weapons/
                open5eEndpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(alias)}`);
                if (!isPotion) {
                    open5eEndpoints.push(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(alias)}`);
                }
            }

            for (const ep of open5eEndpoints) {
                const res = await fetch(ep);
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.results) && data.results.length > 0) {
                        // Strict alias matching - NEVER fall back to results[0] without matching name
                        const exact = data.results.find((i: any) => {
                            const iName = (i.name || "").toLowerCase().trim();
                            return aliases.some(a => a.toLowerCase().trim() === iName);
                        });
                        if (exact) {
                            const itemIsPotion = isPotion || isPotionOrOil(exact.name, exact.type, exact.category);
                            const isMundane = itemIsPotion ? false : isMundaneEquipment(exact.name || name);
                            const isMagicEp = ep.includes("magicitems");
                            const rawRarity = exact.rarity ? exact.rarity.toLowerCase() : "";
                            const isMagic = itemIsPotion ? true : (!isMundane && (isMagicEp || (!!exact.rarity && rawRarity !== "common" && rawRarity !== "none")));
                            let rarity = isMundane ? "Common" : (exact.rarity ? exact.rarity.charAt(0).toUpperCase() + exact.rarity.slice(1).toLowerCase() : (isMagic ? "Uncommon" : "Common"));
                            if (itemIsPotion) {
                                const nLower = (exact.name || name).toLowerCase();
                                if (nLower.includes("greater")) rarity = "Uncommon";
                                else if (nLower.includes("superior")) rarity = "Rare";
                                else if (nLower.includes("supreme")) rarity = "Very Rare";
                            }
                            const desc = exact.desc ? `<p>${exact.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : "";

                            return {
                                slug: slugify(exact.name || name),
                                name: exact.name,
                                filterType: itemIsPotion ? "Potion" : (isMundane ? "Weapon" : (isMagic ? "Magic Item" : "Weapon")),
                                rarity,
                                isMagic,
                                requiresAttunement: !isMundane && !itemIsPotion && !!(exact.requires_attunement || (exact.desc && exact.desc.toLowerCase().includes("requires attunement"))),
                                source: "Open5e (SRD)",
                                category: itemIsPotion ? "Potion" : exact.category,
                                damage: !itemIsPotion && exact.damage_dice ? `${exact.damage_dice} ${exact.damage_type || ""}`.trim() : undefined,
                                properties: !itemIsPotion && Array.isArray(exact.properties) ? exact.properties.join(", ") : undefined,
                                description: desc
                            };
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("Failed fetching from open5e:", err);
        }

        return null;
    }

    public static async searchAndSaveOnlineItems(rawQuery: string, typeFilter: string = "all"): Promise<Item[]> {
        const candidatesMap = new Map<string, Partial<Item>>();

        try {
            // 1. Direct match check via fetchFromDndBeyond and fetchFromOpen5eOr5eApi
            const [ddbDirect, open5eDirect] = await Promise.all([
                this.fetchFromDndBeyond(rawQuery).catch(() => null),
                this.fetchFromOpen5eOr5eApi(rawQuery).catch(() => null)
            ]);

            if (ddbDirect && ddbDirect.name && ddbDirect.description) {
                const sSlug = (ddbDirect.slug || slugify(ddbDirect.name)).slice(0, 255);
                if (sSlug) candidatesMap.set(sSlug, ddbDirect);
            }
            if (open5eDirect && open5eDirect.name && open5eDirect.description) {
                const sSlug = (open5eDirect.slug || slugify(open5eDirect.name)).slice(0, 255);
                if (sSlug && !candidatesMap.has(sSlug)) {
                    candidatesMap.set(sSlug, open5eDirect);
                }
            }

            // 2. Query Open5e endpoints based on typeFilter
            const endpoints: string[] = [];
            const tf = typeFilter.toLowerCase();
            const queryIsPotion = isPotionOrOil(rawQuery);

            if (queryIsPotion || tf === "potion") {
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=16`);
            } else if (tf === "weapon") {
                endpoints.push(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(rawQuery)}&limit=12`);
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=12`);
            } else if (tf === "magic-item" || tf === "wondrous") {
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=16`);
            } else if (tf === "armor") {
                endpoints.push(`https://api.open5e.com/v1/armor/?search=${encodeURIComponent(rawQuery)}&limit=12`);
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=12`);
            } else {
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=10`);
                endpoints.push(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(rawQuery)}&limit=10`);
                endpoints.push(`https://api.open5e.com/v1/armor/?search=${encodeURIComponent(rawQuery)}&limit=10`);
            }

            for (const ep of endpoints) {
                try {
                    const res = await fetch(ep);
                    if (res.ok) {
                        const data = await res.json();
                        const results = Array.isArray(data?.results) ? data.results : [];
                        for (const match of results) {
                            if (!match?.name) continue;
                            const sSlug = slugify(match.name).slice(0, 255);
                            if (!sSlug || candidatesMap.has(sSlug)) continue;

                            if (ep.includes("weapons")) {
                                if (isPotionOrOil(match.name, match.category, match.type)) continue;
                                const desc = match.desc ? `<p>${match.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : `<p>${match.name} (${match.category || "Weapon"}).</p>`;
                                candidatesMap.set(sSlug, {
                                    slug: sSlug,
                                    name: String(match.name).slice(0, 255),
                                    filterType: "Weapon",
                                    rarity: "Common",
                                    isMagic: false,
                                    requiresAttunement: false,
                                    source: `Open5e (${match.document__title || "SRD"})`.slice(0, 255),
                                    category: String(match.category || "Simple Melee").slice(0, 100),
                                    damage: match.damage_dice ? `${match.damage_dice} ${match.damage_type || ""}`.trim().slice(0, 100) : undefined,
                                    properties: Array.isArray(match.properties) ? match.properties.join(", ").slice(0, 255) : undefined,
                                    weight: Number(match.weight) || 0,
                                    cost: Number(match.cost) || undefined,
                                    description: desc
                                });
                            } else if (ep.includes("armor")) {
                                if (isPotionOrOil(match.name, match.category, match.type)) continue;
                                const desc = match.desc ? `<p>${match.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : `<p>${match.name} (${match.category || "Armor"}). AC: ${match.ac_string || "Standard"}.</p>`;
                                candidatesMap.set(sSlug, {
                                    slug: sSlug,
                                    name: String(match.name).slice(0, 255),
                                    filterType: "Armor",
                                    rarity: "Common",
                                    isMagic: false,
                                    requiresAttunement: false,
                                    source: `Open5e (${match.document__title || "SRD"})`.slice(0, 255),
                                    category: String(match.category || "Armor").slice(0, 100),
                                    weight: Number(match.weight) || 0,
                                    cost: Number(match.cost) || undefined,
                                    description: desc
                                });
                            } else if (ep.includes("magicitems")) {
                                if (isMundaneEquipment(match.name)) {
                                    continue;
                                }
                                const itemIsPotion = isPotionOrOil(match.name, match.type);
                                const isWeapon = !itemIsPotion && (match.type || "").toLowerCase().includes("weapon");
                                const isArmor = !itemIsPotion && ((match.type || "").toLowerCase().includes("armor") || (match.type || "").toLowerCase().includes("shield"));
                                let rarity = match.rarity ? match.rarity.charAt(0).toUpperCase() + match.rarity.slice(1).toLowerCase() : (itemIsPotion ? "Common" : "Rare");
                                if (itemIsPotion) {
                                    const nLower = match.name.toLowerCase();
                                    if (nLower.includes("greater")) rarity = "Uncommon";
                                    else if (nLower.includes("superior")) rarity = "Rare";
                                    else if (nLower.includes("supreme")) rarity = "Very Rare";
                                }
                                const desc = match.desc ? `<p>${match.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : `<p>${match.name} (${match.type || (itemIsPotion ? "Potion" : "Magic Item")}).</p>`;
                                candidatesMap.set(sSlug, {
                                    slug: sSlug,
                                    name: String(match.name).slice(0, 255),
                                    filterType: itemIsPotion ? "Potion" : (isWeapon ? "Weapon" : (isArmor ? "Armor" : String(match.type || "Magic Item").slice(0, 100))),
                                    rarity: rarity.slice(0, 100),
                                    isMagic: true,
                                    requiresAttunement: itemIsPotion ? false : !!(match.requires_attunement || (match.desc && match.desc.toLowerCase().includes("requires attunement"))),
                                    source: `Open5e (${match.document__title || "SRD"})`.slice(0, 255),
                                    category: itemIsPotion ? "Potion" : (match.type ? String(match.type).slice(0, 100) : undefined),
                                    description: desc
                                });
                            }
                        }
                    }
                } catch {
                    // Ignore endpoint error
                }
            }
        } catch (onlineErr) {
            console.warn("Error searching free online item sources:", onlineErr);
        }

        const savedResults: Item[] = [];
        if (candidatesMap.size === 0 || !AppDataSource.isInitialized) {
            return savedResults;
        }

        const itemRepo = AppDataSource.getRepository(Item);
        for (const [slug, candidate] of candidatesMap.entries()) {
            try {
                let dbItem = await itemRepo.findOne({ where: { slug } });
                if (!dbItem) {
                    const created = itemRepo.create({
                        slug: slug.slice(0, 255),
                        name: String(candidate.name || rawQuery).slice(0, 255),
                        filterType: String(candidate.filterType || "Item").slice(0, 100),
                        rarity: String(candidate.rarity || "Common").slice(0, 100),
                        isMagic: !!candidate.isMagic,
                        requiresAttunement: !!candidate.requiresAttunement,
                        source: String(candidate.source || "Open5e (SRD)").slice(0, 255),
                        category: candidate.category ? String(candidate.category).slice(0, 100) : undefined,
                        damage: candidate.damage ? String(candidate.damage).slice(0, 100) : undefined,
                        range: candidate.range ? String(candidate.range).slice(0, 100) : undefined,
                        properties: candidate.properties ? String(candidate.properties).slice(0, 255) : undefined,
                        mastery: candidate.mastery ? String(candidate.mastery).slice(0, 100) : undefined,
                        weight: Number(candidate.weight) || 0,
                        cost: Number(candidate.cost) || undefined,
                        description: candidate.description || "<p>No description provided.</p>",
                        imageUrl: candidate.imageUrl ? String(candidate.imageUrl).slice(0, 500) : undefined,
                        dndBeyondId: candidate.dndBeyondId,
                        isCustom: false
                    });
                    dbItem = await itemRepo.save(created);
                    cache.set(`item_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "Database", item: dbItem }), 3600);
                    cache.set(`item_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "Database", item: dbItem }), 3600);
                }

                savedResults.push(dbItem);
            } catch (saveErr) {
                console.warn(`Could not persist online search item "${candidate.name}":`, saveErr);
            }
        }

        savedResults.sort((a, b) => a.name.localeCompare(b.name));
        return savedResults;
    }
}
