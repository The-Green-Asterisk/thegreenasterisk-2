import http from "http";
import cache from "../cache";
import AppDataSource from "../services/database";
import { Spell } from "../services/database/entity/Spell";
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

export default class SpellController extends BaseController {
    public static async getSpell(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const nameQuery = typeof query.name === "string" ? query.name.trim() : "";
        const idQuery = typeof query.id === "string" ? query.id.trim() : "";
        const preferRules2024 = isTruthyQuery(query.preferRules2024);
        const dndBeyondId = idQuery && /^\d+$/.test(idQuery) ? parseInt(idQuery) : undefined;

        if (!nameQuery && !dndBeyondId) {
            return {
                response: JSON.stringify({ error: "Spell name or ID is required." }),
                status: 400
            };
        }

        const slug = slugify(nameQuery || `spell-${dndBeyondId}`);
        const cacheKey = `spell_detail_${slug}_${preferRules2024 ? "pref2024" : "mixed"}`;
        const cached = cache.get<string>(cacheKey);
        if (cached) {
            return {
                response: cached,
                header: "application/json",
                status: 200
            };
        }

        let legacyDbSpellFallback: Spell | null = null;

        // STEP 1: Check Local Database
        try {
            if (AppDataSource.isInitialized) {
                const spellRepo = AppDataSource.getRepository(Spell);
                let dbSpell: Spell | null = null;
                if (slug) {
                    dbSpell = await spellRepo.findOne({ where: { slug } });
                }
                if (!dbSpell && dndBeyondId) {
                    dbSpell = await spellRepo.findOne({ where: { dndBeyondId } });
                }

                if (dbSpell) {
                    if (preferRules2024 && isLegacySrdSource(dbSpell.source)) {
                        legacyDbSpellFallback = dbSpell;
                    } else {
                        const jsonRes = JSON.stringify({ sourceTier: "database", spell: dbSpell });
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
            console.error("Local database spell lookup error:", dbError);
        }

        // STEP 2: Check D&D Beyond by public web page scraping or slug
        let foundSpell: Partial<Spell> | null = null;
        if (nameQuery || dndBeyondId) {
            foundSpell = await this.fetchFromDndBeyond(nameQuery, dndBeyondId);
        }

        if (!foundSpell && legacyDbSpellFallback) {
            const jsonRes = JSON.stringify({ sourceTier: "database-legacy-fallback", spell: legacyDbSpellFallback });
            cache.set(cacheKey, jsonRes, 3600);
            return {
                response: jsonRes,
                header: "application/json",
                status: 200
            };
        }

        // STEP 3: Fallback to Open5e / D&D 5e API
        if (!foundSpell && nameQuery) {
            foundSpell = await this.fetchFromOpen5e(nameQuery);
        }

        if (!foundSpell) {
            return {
                response: JSON.stringify({ error: `Spell "${nameQuery}" not found.` }),
                status: 404
            };
        }

        // Save into local database for subsequent requests
        let savedSpell: Spell | Partial<Spell> = foundSpell;
        try {
            if (AppDataSource.isInitialized) {
                const spellRepo = AppDataSource.getRepository(Spell);
                const newSpell = spellRepo.create({
                    slug: foundSpell.slug || slug,
                    name: foundSpell.name || nameQuery,
                    level: foundSpell.level ?? 0,
                    school: foundSpell.school || "Universal",
                    source: foundSpell.source || "D&D Beyond",
                    castingTime: foundSpell.castingTime || "1 Action",
                    range: foundSpell.range || "Self",
                    duration: foundSpell.duration || "Instantaneous",
                    components: foundSpell.components || "V, S",
                    concentration: !!foundSpell.concentration,
                    ritual: !!foundSpell.ritual,
                    description: foundSpell.description || "<p>No description provided.</p>",
                    imageUrl: foundSpell.imageUrl,
                    dndBeyondId: foundSpell.dndBeyondId || dndBeyondId,
                    isCustom: false
                });
                savedSpell = await spellRepo.save(newSpell);
            }
        } catch (saveError) {
            console.warn("Could not persist external spell to database:", saveError);
        }

        const spellSource = (foundSpell.source || "").toLowerCase();
        const sourceTier = spellSource.includes("d&d beyond")
            ? "dndbeyond"
            : spellSource.includes("open 5e") || spellSource.includes("open5e") || spellSource.includes("srd") || spellSource.includes("5e api")
                ? (preferRules2024 ? "legacy-srd-fallback" : "srd")
                : (foundSpell.source || "external");

        const jsonOut = JSON.stringify({ sourceTier, spell: savedSpell });
        cache.set(cacheKey, jsonOut, 3600);
        return {
            response: jsonOut,
            header: "application/json",
            status: 200
        };
    }

    public static async createCustomSpell(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await BaseController.readBody<Partial<Spell>>(req);
            if (!body || !body.name || !body.description) {
                return {
                    response: JSON.stringify({ error: "Name and description are required." }),
                    status: 400
                };
            }

            const rawSlug = slugify(body.name);
            if (!rawSlug) {
                return {
                    response: JSON.stringify({ error: "Invalid spell name." }),
                    status: 400
                };
            }

            if (!AppDataSource.isInitialized) {
                return {
                    response: JSON.stringify({ error: "Database not initialized." }),
                    status: 503
                };
            }

            const spellRepo = AppDataSource.getRepository(Spell);
            const existing = await spellRepo.findOne({ where: { slug: rawSlug } });
            if (existing) {
                return {
                    response: JSON.stringify({ error: "A spell with this name already exists in the database." }),
                    status: 409
                };
            }

            const customSpell = spellRepo.create({
                slug: rawSlug,
                name: body.name.trim(),
                level: Number(body.level) || 0,
                school: body.school?.trim() || "Universal",
                source: body.source?.trim() || "Custom / Homebrew",
                castingTime: body.castingTime?.trim() || "1 Action",
                range: body.range?.trim() || "Self",
                duration: body.duration?.trim() || "Instantaneous",
                components: body.components?.trim() || "V, S",
                concentration: !!body.concentration,
                ritual: !!body.ritual,
                description: body.description.trim(),
                imageUrl: body.imageUrl?.trim(),
                isCustom: true
            });

            const saved = await spellRepo.save(customSpell);
            const responseSpell = {
                ...saved,
                sourceTier: "Custom Database"
            };
            cache.set(`spell_detail_${rawSlug}`, JSON.stringify(responseSpell), 3600);

            return {
                response: JSON.stringify(responseSpell),
                status: 201
            };
        } catch (error: any) {
            console.error("Error creating custom spell:", error);
            return {
                response: JSON.stringify({ error: error.message || "Internal server error" }),
                status: 500
            };
        }
    }

    private static async fetchFromDndBeyond(name: string, dndBeyondId?: number): Promise<Partial<Spell> | null> {
        try {
            const slug = slugify(name);
            const candidates = [];
            if (dndBeyondId && slug) {
                candidates.push(`https://www.dndbeyond.com/spells/${dndBeyondId}-${slug}`);
            }
            if (slug) {
                candidates.push(`https://www.dndbeyond.com/spells/${slug}`);
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
                    const parsed = this.parseDndBeyondSpellHtml(html, name, slug, dndBeyondId);
                    if (parsed) return parsed;
                }
            }
        } catch (err) {
            console.warn("Failed fetching from D&D Beyond page:", err);
        }
        return null;
    }

    private static parseDndBeyondSpellHtml(html: string, fallbackName: string, slug: string, dndBeyondId?: number): Partial<Spell> | null {
        // Extract title
        const nameMatch = html.match(/<h1[^>]*class=["'][^"']*page-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
            html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const name = nameMatch ? cleanHtmlTags(nameMatch[1]) : fallbackName;

        // Extract description
        const descMatch = html.match(/<div[^>]*class=["'][^"']*more-info-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/<div[^>]*class=["'][^"']*details-more-info[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/<div[^>]*class=["'][^"']*spell-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        const description = descMatch ? descMatch[1].trim() : "";
        if (!description) return null;

        // Extract stats/meta
        const levelMatch = html.match(/class=["'][^"']*spell-level[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
            html.match(/Level:\s*<[^>]+>(\d+)/i);
        let level = 0;
        if (levelMatch) {
            const num = levelMatch[1].match(/\d+/);
            if (num) level = parseInt(num[0]);
        }

        const schoolMatch = html.match(/class=["'][^"']*spell-school[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        const school = schoolMatch ? cleanHtmlTags(schoolMatch[1]) : "Universal";

        const castingTimeMatch = html.match(/Casting Time:[\s\S]*?<span[^>]*class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
            html.match(/Casting Time:[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
        const castingTime = castingTimeMatch ? cleanHtmlTags(castingTimeMatch[1]) : "1 Action";

        const rangeMatch = html.match(/Range\/Area:[\s\S]*?<span[^>]*class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
            html.match(/Range:[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
        const range = rangeMatch ? cleanHtmlTags(rangeMatch[1]) : "Self";

        const durationMatch = html.match(/Duration:[\s\S]*?<span[^>]*class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
            html.match(/Duration:[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
        const duration = durationMatch ? cleanHtmlTags(durationMatch[1]) : "Instantaneous";

        const compMatch = html.match(/Components:[\s\S]*?<span[^>]*class=["'][^"']*value[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
            html.match(/Components:[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
        const components = compMatch ? cleanHtmlTags(compMatch[1]) : "V, S";

        const concentration = /concentration/i.test(duration) || /concentration/i.test(html.slice(0, 10000));
        const ritual = /ritual/i.test(castingTime) || /ritual/i.test(html.slice(0, 10000));

        // Extract image if available
        let imageUrl: string | undefined;
        const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogImageMatch && !ogImageMatch[1].includes("og-spells.png") && !ogImageMatch[1].includes("logo-")) {
            imageUrl = ogImageMatch[1];
        }

        return {
            slug,
            name,
            level,
            school,
            source: "D&D Beyond",
            castingTime,
            range,
            duration,
            components,
            concentration,
            ritual,
            description,
            imageUrl,
            dndBeyondId
        };
    }

    private static async fetchFromOpen5e(name: string): Promise<Partial<Spell> | null> {
        try {
            const slug = slugify(name);
            // First try official dnd5eapi.co
            const dnd5eRes = await fetch(`https://www.dnd5eapi.co/api/spells/${slug}`);
            if (dnd5eRes.ok) {
                const data = await dnd5eRes.json();
                const desc = Array.isArray(data.desc) ? data.desc.map((p: string) => `<p>${p}</p>`).join("") : `<p>${data.desc || ""}</p>`;
                const higherLevel = Array.isArray(data.higher_level) && data.higher_level.length
                    ? `<p><strong>At Higher Levels.</strong> ${data.higher_level.join(" ")}</p>`
                    : "";

                return {
                    slug,
                    name: data.name || name,
                    level: Number(data.level) || 0,
                    school: data.school?.name || "Universal",
                    source: "Open 5e (SRD)",
                    castingTime: data.casting_time || "1 Action",
                    range: data.range || "Self",
                    duration: data.duration || "Instantaneous",
                    components: Array.isArray(data.components) ? data.components.join(", ") : "V, S",
                    concentration: !!data.concentration,
                    ritual: !!data.ritual,
                    description: desc + higherLevel
                };
            }

            // Fallback to open5e.com
            const open5eRes = await fetch(`https://api.open5e.com/v1/spells/?search=${encodeURIComponent(name)}`);
            if (open5eRes.ok) {
                const data = await open5eRes.json();
                const match = (data.results || []).find((s: any) => slugify(s.name) === slug) || data.results?.[0];
                if (match) {
                    let descHtml = `<p>${(match.desc || "").replace(/\n\n/g, "</p><p>")}</p>`;
                    if (match.higher_level) {
                        descHtml += `<p><strong>At Higher Levels.</strong> ${match.higher_level}</p>`;
                    }
                    return {
                        slug,
                        name: match.name,
                        level: Number(match.level_int ?? match.level) || 0,
                        school: match.school || "Universal",
                        source: `Open 5e (${match.document__title || "SRD"})`,
                        castingTime: match.casting_time || "1 Action",
                        range: match.range || "Self",
                        duration: match.duration || "Instantaneous",
                        components: match.components || "V, S",
                        concentration: match.concentration === "yes" || match.concentration === true,
                        ritual: match.ritual === "yes" || match.ritual === true,
                        description: descHtml
                    };
                }
            }
        } catch (err) {
            console.warn("Failed fetching from Open 5e APIs:", err);
        }
        return null;
    }
}
