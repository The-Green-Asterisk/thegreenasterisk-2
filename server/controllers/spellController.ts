import http from "http";
import cache from "../cache";
import AppDataSource from "../services/database";
import { Spell } from "../services/database/entity/Spell";
import { isLegacyDndBeyondEntity } from "../services/database/legacyFilter";
import { SEED_SPELLS } from "../services/database/spellsSeed";
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
    /**
     * Upserts spell definitions that come in with a character pull into the local database.
     * Always prefers character-pull definitions over free online (Open5e / SRD) definitions.
     */
    public static async upsertSpellsFromCharacter(spells: Array<any>): Promise<number> {
        if (!Array.isArray(spells) || spells.length === 0 || !AppDataSource.isInitialized) {
            return 0;
        }

        let savedCount = 0;
        const normalizeCastingTime = (val: unknown): string => {
            const raw = String(val || "1 Action").trim();
            if (/^which you take/i.test(raw)) {
                return "1 Reaction";
            }
            return raw.slice(0, 100);
        };

        try {
            const spellRepo = AppDataSource.getRepository(Spell);

            for (const rawSpell of spells) {
                try {
                    const name = String(rawSpell?.name || "").trim().slice(0, 255);
                    const description = String(rawSpell?.description || "").trim();
                    if (!name || !description || description === "<p>No description provided.</p>") {
                        continue;
                    }

                    const slug = slugify(name).slice(0, 255);
                    if (!slug) continue;

                    const parsedId = Number(rawSpell?.id ?? rawSpell?.dndBeyondId);
                    const dndBeyondId = !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : undefined;

                    let existing = await spellRepo.findOne({ where: { slug } });
                    if (!existing && dndBeyondId) {
                        existing = await spellRepo.findOne({ where: { dndBeyondId } });
                    }

                    const isLegacy = isLegacyDndBeyondEntity(rawSpell);
                    let sourceLabel = (rawSpell.source
                        ? (String(rawSpell.source).toLowerCase().includes("d&d beyond") || String(rawSpell.source).toLowerCase().includes("custom")
                            ? String(rawSpell.source)
                            : `D&D Beyond (${rawSpell.source})`)
                        : "D&D Beyond").slice(0, 100);

                    if (isLegacy && !sourceLabel.includes("[Legacy]")) {
                        sourceLabel = `${sourceLabel} [Legacy]`.slice(0, 100);
                    }

                    const finalDescription = isLegacy && !description.includes("[Legacy]")
                        ? `<p><strong class="legacy-badge">[Legacy]</strong> <em>This spell uses pre-2024 rules.</em></p>\n${description}`
                        : description;

                    const school = String(rawSpell.school || "Universal").slice(0, 100);
                    const castingTime = normalizeCastingTime(rawSpell.castingTime);
                    const range = String(rawSpell.range || "Self").slice(0, 100);
                    const duration = String(rawSpell.duration || "Instantaneous").slice(0, 100);
                    const components = String(rawSpell.components || "V, S");
                    const imageUrl = rawSpell.imageUrl ? String(rawSpell.imageUrl).slice(0, 500) : undefined;
                    const classesVal = Array.isArray(rawSpell.classes)
                        ? JSON.stringify(rawSpell.classes)
                        : (typeof rawSpell.classes === "string" ? rawSpell.classes : undefined);

                    if (!existing) {
                        const created = spellRepo.create({
                            slug,
                            name,
                            level: Number(rawSpell.level) || 0,
                            school,
                            source: sourceLabel,
                            castingTime,
                            range,
                            duration,
                            components,
                            concentration: !!rawSpell.concentration,
                            ritual: !!rawSpell.ritual,
                            description: finalDescription,
                            classes: classesVal,
                            imageUrl,
                            dndBeyondId,
                            isCustom: false
                        });
                        const saved = await spellRepo.save(created);
                        cache.set(`spell_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "database", spell: saved }), 3600);
                        cache.set(`spell_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "database", spell: saved }), 3600);
                        savedCount++;
                    } else {
                        const existingIsLegacy = existing.source.includes("[Legacy]") || isLegacySrdSource(existing.source);
                        // Do not downgrade an existing 2024 spell with a legacy version
                        if (!existingIsLegacy && isLegacy) {
                            continue;
                        }

                        if (classesVal && !existing.classes) {
                            existing.classes = classesVal;
                        }

                        if (existingIsLegacy || !existing.description || existing.description === "<p>No description provided.</p>") {
                            // Prefer the definition from the character pull over free online sources, or upgrade legacy to 2024
                            existing.name = name;
                            existing.level = Number(rawSpell.level) ?? existing.level;
                            existing.school = school || existing.school || "Universal";
                            existing.source = sourceLabel;
                            existing.castingTime = normalizeCastingTime(rawSpell.castingTime || existing.castingTime);
                            existing.range = range || existing.range || "Self";
                            existing.duration = duration || existing.duration || "Instantaneous";
                            existing.components = components || existing.components || "V, S";
                            existing.concentration = !!rawSpell.concentration;
                            existing.ritual = !!rawSpell.ritual;
                            existing.description = finalDescription;
                            if (classesVal) existing.classes = classesVal;
                            if (imageUrl) existing.imageUrl = imageUrl;
                            if (dndBeyondId) existing.dndBeyondId = dndBeyondId;

                            const saved = await spellRepo.save(existing);
                            cache.set(`spell_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "database", spell: saved }), 3600);
                            cache.set(`spell_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "database", spell: saved }), 3600);
                            savedCount++;
                        } else if (classesVal && !existing.classes) {
                            await spellRepo.save(existing);
                        }
                    }
                } catch (spellErr) {
                    console.warn(`Could not upsert spell "${rawSpell?.name || "unknown"}":`, spellErr);
                }
            }
        } catch (err) {
            console.warn("Could not upsert character spells into database:", err);
        }

        return savedCount;
    }

    public static async seedDefaultSpellsIfEmpty(): Promise<void> {
        if (!AppDataSource.isInitialized) return;
        try {
            const spellRepo = AppDataSource.getRepository(Spell);
            const count = await spellRepo.count();
            if (count >= SEED_SPELLS.length) return;

            for (const sp of SEED_SPELLS) {
                const slug = (sp.id || slugify(sp.name)).slice(0, 255);
                let existing = await spellRepo.findOne({ where: { slug } });
                const classesJson = JSON.stringify(sp.classes || []);
                if (!existing) {
                    const created = spellRepo.create({
                        slug,
                        name: sp.name,
                        level: sp.level,
                        school: sp.school,
                        source: "2024 Core Rules",
                        castingTime: sp.castingTime,
                        range: sp.range,
                        duration: sp.duration,
                        components: sp.components,
                        concentration: !!sp.concentration,
                        ritual: !!sp.ritual,
                        description: sp.description,
                        classes: classesJson,
                        isCustom: false
                    });
                    await spellRepo.save(created);
                } else if (!existing.classes) {
                    existing.classes = classesJson;
                    await spellRepo.save(existing);
                }
            }
        } catch (err) {
            console.warn("Could not seed default spells:", err);
        }
    }

    public static async upsertSpellsFromDndBeyond(rawCharacter: any): Promise<number> {
        if (!rawCharacter || typeof rawCharacter !== "object") return 0;
        const spellsToUpsert: any[] = [];
        const classes = Array.isArray(rawCharacter.classes) ? rawCharacter.classes : [];

        // 1. Class spells
        if (Array.isArray(rawCharacter.classSpells)) {
            for (const cs of rawCharacter.classSpells) {
                const classObj = classes.find((c: any) => c.id === cs.characterClassId);
                const className = classObj?.definition?.name || "Class";
                for (const s of (cs.spells || [])) {
                    if (s.definition) {
                        spellsToUpsert.push({
                            ...s.definition,
                            classes: [className],
                            source: className
                        });
                    }
                }
            }
        }

        // 2. Feature / race / feat / item spells
        if (rawCharacter.spells && typeof rawCharacter.spells === "object") {
            for (const [key, list] of Object.entries(rawCharacter.spells)) {
                if (Array.isArray(list)) {
                    for (const s of list as any[]) {
                        if (s.definition) {
                            spellsToUpsert.push({
                                ...s.definition,
                                source: key
                            });
                        }
                    }
                }
            }
        }

        if (spellsToUpsert.length === 0) return 0;
        return this.upsertSpellsFromCharacter(spellsToUpsert);
    }

    public static async getSpells(_req: http.IncomingMessage, _res: http.ServerResponse) {
        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ spells: SEED_SPELLS }),
                header: "application/json",
                status: 200
            };
        }
        try {
            await this.seedDefaultSpellsIfEmpty();
            const spellRepo = AppDataSource.getRepository(Spell);
            const dbSpells = await spellRepo.find({
                order: {
                    level: "ASC",
                    name: "ASC"
                }
            });
            const mapped = dbSpells.map((s) => {
                let classes: string[] = [];
                if (s.classes) {
                    try {
                        const parsed = JSON.parse(s.classes);
                        if (Array.isArray(parsed)) classes = parsed;
                        else if (typeof s.classes === "string") classes = s.classes.split(",").map((c: string) => c.trim()).filter(Boolean);
                    } catch {
                        classes = String(s.classes).split(",").map((c: string) => c.trim()).filter(Boolean);
                    }
                }
                return {
                    id: s.slug || String(s.id),
                    slug: s.slug,
                    name: s.name,
                    level: Number(s.level) || 0,
                    school: s.school,
                    classes,
                    castingTime: s.castingTime,
                    range: s.range,
                    duration: s.duration,
                    components: s.components || "V, S",
                    concentration: Boolean(s.concentration),
                    ritual: Boolean(s.ritual),
                    description: s.description,
                    imageUrl: s.imageUrl,
                    source: s.source
                };
            });
            return {
                response: JSON.stringify({ spells: mapped }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error fetching database spells:", error);
            return {
                response: JSON.stringify({ spells: SEED_SPELLS }),
                header: "application/json",
                status: 200
            };
        }
    }

    public static async syncCharacterSpells(req: http.IncomingMessage, _res: http.ServerResponse) {
        try {
            const body = await BaseController.readBody<{ spells?: any[] }>(req);
            const spells = Array.isArray(body?.spells) ? body.spells : [];
            const savedCount = await this.upsertSpellsFromCharacter(spells);
            return {
                response: JSON.stringify({ success: true, syncedCount: savedCount }),
                header: "application/json",
                status: 200
            };
        } catch (error: any) {
            return {
                response: JSON.stringify({ error: error?.message || "Failed to sync character spells." }),
                status: 400
            };
        }
    }

    public static async searchSpells(req: http.IncomingMessage, _res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const searchTerm = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
        const levelParam = typeof query.level === "string" ? query.level.trim() : "";
        const levelFilter = levelParam !== "" && levelParam !== "all" && !Number.isNaN(Number(levelParam))
            ? Number(levelParam)
            : undefined;
        const limit = Math.min(200, Math.max(1, Number(query.limit) || 100));

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ spells: [] }),
                header: "application/json",
                status: 200
            };
        }

        try {
            await this.seedDefaultSpellsIfEmpty();
            const spellRepo = AppDataSource.getRepository(Spell);
            const allSpells = await spellRepo.find({
                order: {
                    level: "ASC",
                    name: "ASC"
                }
            });

            let filtered = allSpells
                .filter(spell => {
                    if (levelFilter !== undefined && Number(spell.level) !== levelFilter) {
                        return false;
                    }
                    if (!searchTerm) return true;
                    const haystack = `${spell.name} ${spell.school} ${spell.source || ""} ${spell.description || ""}`.toLowerCase();
                    return haystack.includes(searchTerm);
                })
                .slice(0, limit);

            let fetchedOnline = false;
            if (filtered.length === 0 && searchTerm.length >= 2) {
                const rawQuery = typeof query.q === "string" ? query.q.trim() : searchTerm;
                const onlineSpells = await this.searchAndSaveOnlineSpells(rawQuery, levelFilter);
                if (onlineSpells.length > 0) {
                    filtered = onlineSpells.slice(0, limit);
                    fetchedOnline = true;
                }
            }

            return {
                response: JSON.stringify({ spells: filtered, fetchedOnline }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error searching database spells:", error);
            return {
                response: JSON.stringify({ spells: [] }),
                header: "application/json",
                status: 200
            };
        }
    }

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
        const cached = cache.get<string>(cacheKey) || cache.get<string>(`spell_detail_${slug}`);
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
                await this.seedDefaultSpellsIfEmpty();
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

    /**
     * When a database search returns 0 results, branches out to free online sources
     * (D&D Beyond public spell pages, dnd5eapi.co, and api.open5e.com), saves any
     * discovered spells to the database, and returns the matching spells.
     */
    private static async searchAndSaveOnlineSpells(rawQuery: string, levelFilter?: number): Promise<Spell[]> {
        const candidatesMap = new Map<string, Partial<Spell>>();

        try {
            // 1. Try direct D&D Beyond public spell page and dnd5eapi.co by exact/slug name
            const [ddbDirect, open5eDirect] = await Promise.all([
                this.fetchFromDndBeyond(rawQuery).catch(() => null),
                this.fetchFromOpen5e(rawQuery).catch(() => null)
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

            // 2. Also query Open5e search endpoint for partial/keyword spell matches
            const open5eRes = await fetch(`https://api.open5e.com/v1/spells/?search=${encodeURIComponent(rawQuery)}&limit=12`);
            if (open5eRes.ok) {
                const data = await open5eRes.json();
                const results = Array.isArray(data?.results) ? data.results : [];
                for (const match of results) {
                    if (!match?.name) continue;
                    const sSlug = slugify(match.name).slice(0, 255);
                    if (!sSlug || candidatesMap.has(sSlug)) continue;

                    let descHtml = `<p>${String(match.desc || "").replace(/\n\n/g, "</p><p>")}</p>`;
                    if (match.higher_level) {
                        descHtml += `<p><strong>At Higher Levels.</strong> ${match.higher_level}</p>`;
                    }
                    candidatesMap.set(sSlug, {
                        slug: sSlug,
                        name: String(match.name).slice(0, 255),
                        level: Number(match.level_int ?? match.level) || 0,
                        school: String(match.school || "Universal").slice(0, 100),
                        source: `Open 5e (${match.document__title || "SRD"})`.slice(0, 100),
                        castingTime: String(match.casting_time || "1 Action").slice(0, 100),
                        range: String(match.range || "Self").slice(0, 100),
                        duration: String(match.duration || "Instantaneous").slice(0, 100),
                        components: String(match.components || "V, S"),
                        concentration: match.concentration === "yes" || match.concentration === true,
                        ritual: match.ritual === "yes" || match.ritual === true,
                        description: descHtml
                    });
                }
            }
        } catch (onlineErr) {
            console.warn("Error searching free online spell sources:", onlineErr);
        }

        const savedResults: Spell[] = [];
        if (candidatesMap.size === 0 || !AppDataSource.isInitialized) {
            return savedResults;
        }

        const spellRepo = AppDataSource.getRepository(Spell);
        for (const [slug, candidate] of candidatesMap.entries()) {
            try {
                let dbSpell = await spellRepo.findOne({ where: { slug } });
                if (!dbSpell) {
                    const created = spellRepo.create({
                        slug: slug.slice(0, 255),
                        name: String(candidate.name || rawQuery).slice(0, 255),
                        level: Number(candidate.level) || 0,
                        school: String(candidate.school || "Universal").slice(0, 100),
                        source: String(candidate.source || "Open 5e (SRD)").slice(0, 100),
                        castingTime: String(candidate.castingTime || "1 Action").slice(0, 100),
                        range: String(candidate.range || "Self").slice(0, 100),
                        duration: String(candidate.duration || "Instantaneous").slice(0, 100),
                        components: String(candidate.components || "V, S"),
                        concentration: !!candidate.concentration,
                        ritual: !!candidate.ritual,
                        description: candidate.description || "<p>No description provided.</p>",
                        imageUrl: candidate.imageUrl ? String(candidate.imageUrl).slice(0, 500) : undefined,
                        dndBeyondId: candidate.dndBeyondId,
                        isCustom: false
                    });
                    dbSpell = await spellRepo.save(created);
                    cache.set(`spell_detail_${slug}_pref2024`, JSON.stringify({ sourceTier: "database", spell: dbSpell }), 3600);
                    cache.set(`spell_detail_${slug}_mixed`, JSON.stringify({ sourceTier: "database", spell: dbSpell }), 3600);
                }

                if (levelFilter === undefined || Number(dbSpell.level) === levelFilter) {
                    savedResults.push(dbSpell);
                }
            } catch (saveErr) {
                console.warn(`Could not persist online search spell "${candidate.name}":`, saveErr);
            }
        }

        savedResults.sort((a, b) => (a.level !== b.level ? a.level - b.level : a.name.localeCompare(b.name)));
        return savedResults;
    }
}
