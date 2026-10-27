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

export default class ItemController extends BaseController {
    public static async getItem(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const nameQuery = typeof query.name === "string" ? query.name.trim() : "";
        const idQuery = typeof query.id === "string" ? query.id.trim() : "";
        const typeQuery = typeof query.type === "string" ? query.type.trim() : "";
        const dndBeyondId = idQuery && /^\d+$/.test(idQuery) ? parseInt(idQuery) : undefined;

        if (!nameQuery && !dndBeyondId) {
            return {
                response: JSON.stringify({ error: "Item name or ID is required." }),
                status: 400
            };
        }

        const slug = slugify(nameQuery || `item-${dndBeyondId}`);
        const cacheKey = `item_detail_${slug}`;
        const cached = cache.get<string>(cacheKey);
        if (cached) {
            return {
                response: cached,
                header: "application/json",
                status: 200
            };
        }

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
                    const jsonRes = JSON.stringify({ sourceTier: "Database", item: dbItem });
                    cache.set(cacheKey, jsonRes, 3600);
                    return {
                        response: jsonRes,
                        header: "application/json",
                        status: 200
                    };
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

        const jsonOut = JSON.stringify({ sourceTier: foundItem.source || "External", item: savedItem });
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
                    const parsed = this.parseDndBeyondItemHtml(html, name, slug, dndBeyondId);
                    if (parsed) return parsed;
                }
            }
        } catch (err) {
            console.warn("Failed fetching item from D&D Beyond page:", err);
        }
        return null;
    }

    private static parseDndBeyondItemHtml(html: string, fallbackName: string, slug: string, dndBeyondId?: number): Partial<Item> | null {
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
        const isMagic = html.toLowerCase().includes("magic item") || html.toLowerCase().includes("wondrous item") || html.toLowerCase().includes("potion");
        const requiresAttunement = html.toLowerCase().includes("requires attunement");

        // Rarity
        let rarity = "Common";
        const rarityMatch = html.match(/(common|uncommon|rare|very rare|legendary|artifact)/i);
        if (rarityMatch) {
            rarity = rarityMatch[1].charAt(0).toUpperCase() + rarityMatch[1].slice(1).toLowerCase();
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
                        const isMagic = !!data.rarity || url.includes("magic-items");
                        const rarity = data.rarity?.name || (isMagic ? "Varies" : "Common");
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
                            filterType: isMagic ? "Magic Item" : (data.equipment_category?.name || "Equipment"),
                            rarity,
                            isMagic,
                            requiresAttunement: !!(data.desc && JSON.stringify(data.desc).toLowerCase().includes("requires attunement")),
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
                            const isMagic = !!exact.rarity || ep.includes("magicitems");
                            const rarity = exact.rarity ? exact.rarity.charAt(0).toUpperCase() + exact.rarity.slice(1).toLowerCase() : "Common";
                            const desc = exact.desc ? `<p>${exact.desc.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : "";

                            return {
                                slug,
                                name: exact.name,
                                filterType: isMagic ? "Magic Item" : "Weapon",
                                rarity,
                                isMagic,
                                requiresAttunement: !!(exact.requires_attunement || (exact.desc && exact.desc.toLowerCase().includes("requires attunement"))),
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
}
