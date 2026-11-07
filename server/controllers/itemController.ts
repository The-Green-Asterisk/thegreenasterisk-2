import http from "http";
import cache from "../cache";
import AppDataSource from "../services/database";
import { Item } from "../services/database/entity/Item";
import BaseController from "./baseController";

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

            // Process weapons
            if (Array.isArray(weapons)) {
                for (const rawWep of weapons) {
                    try {
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
                        } else if (isLegacySrdSource(existing.source) || !existing.description || existing.description === "<p>No description provided.</p>" || isMundane) {
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

                        const sourceLabel = (rawEq.source
                            ? (String(rawEq.source).toLowerCase().includes("d&d beyond") || String(rawEq.source).toLowerCase().includes("custom")
                                ? String(rawEq.source)
                                : `D&D Beyond (${rawEq.source})`)
                            : "D&D Beyond").slice(0, 255);

                        const rawType = String(rawEq.type || "").trim();
                        const isMundane = isMundaneEquipment(name);
                        const isMagic = isMundane ? false : !!(rawEq.isMagic || (rawEq.rarity && rawEq.rarity.toLowerCase() !== "common" && rawEq.rarity.toLowerCase() !== "none"));
                        const filterType = isMundane ? (rawType || "Equipment") : (rawType || (isMagic ? "Magic Item" : "Item"));
                        const rarity = isMundane ? "Common" : String(rawEq.rarity || (isMagic ? "Uncommon" : "Common")).slice(0, 100);
                        const desc = String(rawEq.description || rawEq.notes || `<p>${name} (${filterType}).</p>`).trim();
                        const imageUrl = rawEq.imageUrl ? String(rawEq.imageUrl).slice(0, 500) : undefined;
                        const weight = Number(rawEq.weight) || 0;
                        const cost = Number(rawEq.cost) || undefined;

                        if (!existing) {
                            const created = itemRepo.create({
                                slug,
                                name,
                                filterType: filterType.slice(0, 100),
                                rarity,
                                isMagic,
                                requiresAttunement: isMundane ? false : !!(rawEq.attuned || rawEq.requiresAttunement),
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
                        } else if (isLegacySrdSource(existing.source) || !existing.description || existing.description === "<p>No description provided.</p>" || isMundane) {
                            existing.name = name;
                            if (filterType && existing.filterType === "Item") existing.filterType = filterType.slice(0, 100);
                            if (isMundane && existing.filterType === "Magic Item") existing.filterType = "Equipment";
                            existing.rarity = rarity;
                            existing.isMagic = isMagic;
                            existing.source = sourceLabel;
                            if (desc) existing.description = desc;
                            if (imageUrl) existing.imageUrl = imageUrl;
                            if (dndBeyondId) existing.dndBeyondId = dndBeyondId;
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

            let filtered = allItems.filter(item => {
                if (typeFilter && typeFilter !== "all") {
                    const fType = (item.filterType || "").toLowerCase();
                    const cat = (item.category || "").toLowerCase();
                    if (typeFilter === "weapon") {
                        if (!fType.includes("weapon") && !cat.includes("weapon") && !item.damage) return false;
                    } else if (typeFilter === "magic-item") {
                        if (!item.isMagic && (!item.rarity || item.rarity.toLowerCase() === "common") && !fType.includes("magic")) return false;
                    } else if (typeFilter === "armor") {
                        if (!fType.includes("armor") && !fType.includes("shield") && !cat.includes("armor")) return false;
                    } else if (typeFilter === "potion") {
                        if (!fType.includes("potion") && !cat.includes("potion")) return false;
                    } else if (typeFilter === "wondrous") {
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
                if (cachedItem && isMundaneEquipment(cachedItem.name) && cachedItem.isMagic) {
                    // Cached item was mistakenly flagged as magic; invalidate and reprocess
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
                    if (isMundaneEquipment(dbItem.name) && (dbItem.isMagic || dbItem.filterType === "Magic Item")) {
                        dbItem.isMagic = false;
                        dbItem.rarity = "Common";
                        if (dbItem.filterType === "Magic Item") {
                            dbItem.filterType = dbItem.damage ? "Weapon" : "Equipment";
                        }
                        await itemRepo.save(dbItem);
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

    public static async createCustomItem(req: http.IncomingMessage, res: http.ServerResponse) {
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

            const customItem = itemRepo.create({
                slug: rawSlug,
                name: body.name.trim(),
                filterType: body.filterType?.trim() || "Item",
                rarity: body.rarity?.trim() || "Common",
                isMagic: !!body.isMagic,
                requiresAttunement: !!body.requiresAttunement,
                source: body.source?.trim() || "Custom / Homebrew",
                category: body.category?.trim(),
                damage: body.damage?.trim(),
                range: body.range?.trim(),
                properties: body.properties?.trim(),
                mastery: body.mastery?.trim(),
                weight: Number(body.weight) || 0,
                cost: body.cost !== undefined ? Number(body.cost) : undefined,
                description: body.description.trim(),
                imageUrl: body.imageUrl?.trim(),
                isCustom: true
            });

            const saved = await itemRepo.save(customItem);
            const responseItem = {
                sourceTier: "Custom Database",
                item: saved
            };
            cache.set(`item_detail_${rawSlug}`, JSON.stringify(responseItem), 3600);

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
        const isMundane = isMundaneEquipment(name);
        const isMagicRoute = sourceUrl ? sourceUrl.includes("/magic-items/") : false;
        const detailsContainerLower = (detailsContainerMatch ? detailsContainerMatch[0] : "").toLowerCase();
        const moreInfoLower = (moreInfoContentMatch ? moreInfoContentMatch[0] : "").toLowerCase();

        let isMagic = false;
        if (!isMundane) {
            isMagic = isMagicRoute ||
                detailsContainerLower.includes("magic item") ||
                detailsContainerLower.includes("wondrous item") ||
                moreInfoLower.includes("magic item") ||
                moreInfoLower.includes("wondrous item") ||
                name.toLowerCase().includes("potion of") ||
                name.toLowerCase().includes("scroll of");
        }

        const requiresAttunement = !isMundane && html.toLowerCase().includes("requires attunement");

        // Rarity
        let rarity = "Common";
        if (isMagic) {
            const rarityMatch = html.match(/\b(uncommon|rare|very rare|legendary|artifact)\b/i);
            if (rarityMatch) {
                rarity = rarityMatch[1].charAt(0).toUpperCase() + rarityMatch[1].slice(1).toLowerCase();
            } else {
                rarity = "Common";
            }
        }

        // Damage & Properties
        let damage: string | undefined;
        let range: string | undefined;
        let properties: string | undefined;
        let mastery: string | undefined;

        const dmgMatch = html.match(/Damage:\s*<[^>]+>([^<]+)<\/[^>]+>\s*<[^>]+>([^<]+)<\/[^>]+>/i) ||
            html.match(/(\d+d\d+)\s+([A-Za-z]+)/i);
        if (dmgMatch) {
            damage = `${dmgMatch[1]} ${dmgMatch[2]}`;
        }

        const masteryMatch = html.match(/<strong><em>(Nick|Vex|Sap|Slow|Push|Topple|Cleave|Graze)\.<\/em><\/strong>/i);
        if (masteryMatch) {
            mastery = masteryMatch[1];
        }

        return {
            slug,
            name,
            filterType: isMagic ? "Magic Item" : "Equipment",
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
        const slug = slugify(name);

        // 1. D&D 5e API (magic-items or equipment)
        try {
            const urls = [
                `https://www.dnd5eapi.co/api/magic-items/${slug}`,
                `https://www.dnd5eapi.co/api/equipment/${slug}`
            ];

            for (const url of urls) {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.name) {
                        const isMundane = isMundaneEquipment(data.name || name);
                        const isMagicUrl = url.includes("magic-items");
                        const rarityName = data.rarity?.name || "";
                        const isMagic = !isMundane && (isMagicUrl || (!!data.rarity && rarityName.toLowerCase() !== "common" && rarityName.toLowerCase() !== "none"));
                        const rarity = isMundane ? "Common" : (rarityName || (isMagic ? "Varies" : "Common"));
                        const desc = Array.isArray(data.desc) ? data.desc.map((d: string) => `<p>${d}</p>`).join("") : `<p>${data.desc || ""}</p>`;

                        let damage: string | undefined;
                        if (data.damage) {
                            damage = `${data.damage.damage_dice} ${data.damage.damage_type?.name || ""}`.trim();
                        }

                        let range: string | undefined;
                        if (data.range) {
                            range = data.range.long ? `${data.range.normal}/${data.range.long} ft.` : `${data.range.normal} ft.`;
                        }

                        let properties: string | undefined;
                        if (Array.isArray(data.properties)) {
                            properties = data.properties.map((p: any) => p.name).join(", ");
                        }

                        return {
                            slug,
                            name: data.name,
                            filterType: isMundane ? "Equipment" : (isMagic ? "Magic Item" : (data.equipment_category?.name || "Equipment")),
                            rarity,
                            isMagic,
                            requiresAttunement: !isMundane && !!(data.desc && JSON.stringify(data.desc).toLowerCase().includes("requires attunement")),
                            source: "D&D 5e API (SRD)",
                            category: data.equipment_category?.name || data.gear_category?.name,
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

        // 2. Open5e API (weapons or magicitems)
        try {
            const open5eEndpoints = [
                `https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(name)}`,
                `https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(name)}`
            ];

            for (const ep of open5eEndpoints) {
                const res = await fetch(ep);
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.results) && data.results.length > 0) {
                        const exact = data.results.find((i: any) => i.name.toLowerCase() === name.toLowerCase()) || data.results[0];
                        if (exact) {
                            const isMundane = isMundaneEquipment(exact.name || name);
                            const isMagicEp = ep.includes("magicitems");
                            const rawRarity = exact.rarity ? exact.rarity.toLowerCase() : "";
                            const isMagic = !isMundane && (isMagicEp || (!!exact.rarity && rawRarity !== "common" && rawRarity !== "none"));
                            const rarity = isMundane ? "Common" : (exact.rarity ? exact.rarity.charAt(0).toUpperCase() + exact.rarity.slice(1).toLowerCase() : (isMagic ? "Uncommon" : "Common"));
                            const desc = exact.desc ? `<p>${exact.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : "";

                            return {
                                slug,
                                name: exact.name,
                                filterType: isMundane ? "Weapon" : (isMagic ? "Magic Item" : "Weapon"),
                                rarity,
                                isMagic,
                                requiresAttunement: !isMundane && !!(exact.requires_attunement || (exact.desc && exact.desc.toLowerCase().includes("requires attunement"))),
                                source: "Open5e (SRD)",
                                category: exact.category,
                                damage: exact.damage_dice ? `${exact.damage_dice} ${exact.damage_type || ""}`.trim() : undefined,
                                properties: Array.isArray(exact.properties) ? exact.properties.join(", ") : undefined,
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
            if (tf === "weapon") {
                endpoints.push(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(rawQuery)}&limit=12`);
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=12`);
            } else if (tf === "magic-item" || tf === "wondrous" || tf === "potion") {
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=16`);
            } else if (tf === "armor") {
                endpoints.push(`https://api.open5e.com/v1/armor/?search=${encodeURIComponent(rawQuery)}&limit=12`);
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=12`);
            } else {
                endpoints.push(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(rawQuery)}&limit=10`);
                endpoints.push(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(rawQuery)}&limit=10`);
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
                                const isWeapon = (match.type || "").toLowerCase().includes("weapon");
                                const isArmor = (match.type || "").toLowerCase().includes("armor") || (match.type || "").toLowerCase().includes("shield");
                                const rarity = match.rarity ? match.rarity.charAt(0).toUpperCase() + match.rarity.slice(1).toLowerCase() : "Rare";
                                const desc = match.desc ? `<p>${match.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : `<p>${match.name} (${match.type || "Magic Item"}).</p>`;
                                candidatesMap.set(sSlug, {
                                    slug: sSlug,
                                    name: String(match.name).slice(0, 255),
                                    filterType: isWeapon ? "Weapon" : (isArmor ? "Armor" : String(match.type || "Magic Item").slice(0, 100)),
                                    rarity: rarity.slice(0, 100),
                                    isMagic: true,
                                    requiresAttunement: !!(match.requires_attunement || (match.desc && match.desc.toLowerCase().includes("requires attunement"))),
                                    source: `Open5e (${match.document__title || "SRD"})`.slice(0, 255),
                                    category: match.type ? String(match.type).slice(0, 100) : undefined,
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
