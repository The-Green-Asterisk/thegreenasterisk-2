import http from "http";
import AppDataSource from "services/database";
import CharacterEquipState from "services/database/entity/CharacterEquipState";
import SavedCharacter from "services/database/entity/SavedCharacter";
import cache from "../cache";
import BaseController from "./baseController";
import SessionController, { ReqAndUser } from "./sessionController";

export default class CharacterController extends BaseController {
    public static async getDndBeyondCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const rawId = query.id || query.characterId;

        if (!rawId || typeof rawId !== 'string') {
            return {
                response: JSON.stringify({ error: "A character ID or URL is required." }),
                status: 400
            };
        }

        // Support full URLs (e.g. https://www.dndbeyond.com/characters/138310322) or plain IDs
        const matchedId = rawId.match(/(\d+)/);
        if (!matchedId) {
            return {
                response: JSON.stringify({ error: "Invalid D&D Beyond character ID." }),
                status: 400
            };
        }

        const characterId = matchedId[1];
        const cacheKey = `dndbeyond_char_${characterId}`;
        const cached = cache.get<string>(cacheKey);
        if (cached) {
            return {
                response: cached,
                header: "application/json",
                status: 200
            };
        }

        try {
            const upstreamUrl = `https://character-service.dndbeyond.com/character/v5/character/${characterId}`;
            const response = await fetch(upstreamUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                return {
                    response: JSON.stringify({
                        error: `D&D Beyond returned status ${response.status}: ${response.statusText}. Ensure the character is set to Public.`
                    }),
                    status: response.status >= 400 && response.status < 500 ? response.status : 502
                };
            }

            const data = await response.json();
            const payload = JSON.stringify(data);

            // Cache for 10 minutes (600 seconds)
            cache.set(cacheKey, payload, 600);

            return {
                response: payload,
                header: "application/json",
                status: 200
            };
        } catch (error: any) {
            console.error(`Error fetching D&D Beyond character ${characterId}:`, error);
            return {
                response: JSON.stringify({ error: "Failed to connect to D&D Beyond character service." }),
                status: 500
            };
        }
    }

    public static async getCharacterEquipStates(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const rawId = query.id || query.characterId;
        const characterId = this.normalizeCharacterId(rawId);

        if (!characterId) {
            return {
                response: JSON.stringify({ error: "A valid character ID is required." }),
                status: 400
            };
        }

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ error: "Database not initialized." }),
                status: 503
            };
        }

        try {
            const repo = AppDataSource.getRepository(CharacterEquipState);
            const states = await repo.find({ where: { characterId } });
            return {
                response: JSON.stringify({
                    characterId,
                    states: states.map(s => ({
                        scope: s.scope,
                        itemName: s.itemName,
                        definitionId: s.definitionId,
                        equipped: !!s.equipped
                    }))
                }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error(`Error fetching equip states for character ${characterId}:`, error);
            return {
                response: JSON.stringify({ error: "Failed to fetch character equip states." }),
                status: 500
            };
        }
    }

    public static async setCharacterEquipState(req: http.IncomingMessage, res: http.ServerResponse) {
        let body: any;
        try {
            body = await this.readBody(req);
        } catch {
            return {
                response: JSON.stringify({ error: "Invalid JSON body." }),
                status: 400
            };
        }

        const characterId = this.normalizeCharacterId(body?.characterId);
        const scope = body?.scope;
        const itemName = (body?.itemName || "").toString().trim();
        const equipped = body?.equipped;

        if (!characterId || !itemName || (scope !== "item" && scope !== "weapon" && scope !== "weapon-mastery") || typeof equipped !== "boolean") {
            return {
                response: JSON.stringify({ error: "characterId, scope ('item' | 'weapon' | 'weapon-mastery'), itemName, and equipped (boolean) are required." }),
                status: 400
            };
        }

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ error: "Database not initialized." }),
                status: 503
            };
        }

        const parsedDefinitionId = body?.definitionId !== undefined && body?.definitionId !== null && `${body.definitionId}` !== ""
            ? Number(body.definitionId)
            : undefined;
        const definitionId = Number.isNaN(parsedDefinitionId) ? undefined : parsedDefinitionId;

        try {
            const repo = AppDataSource.getRepository(CharacterEquipState);
            let state = await repo.findOne({
                where: { characterId, scope, itemName }
            });

            if (!state) {
                state = repo.create({
                    characterId,
                    scope,
                    itemName,
                    definitionId,
                    equipped
                });
            } else {
                state.equipped = equipped;
                if (definitionId !== undefined) state.definitionId = definitionId;
            }

            const saved = await repo.save(state);
            return {
                response: JSON.stringify({
                    success: true,
                    state: {
                        characterId: saved.characterId,
                        scope: saved.scope,
                        itemName: saved.itemName,
                        definitionId: saved.definitionId,
                        equipped: !!saved.equipped
                    }
                }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error(`Error saving equip state for character ${characterId}:`, error);
            return {
                response: JSON.stringify({ error: "Failed to save character equip state." }),
                status: 500
            };
        }
    }

    public static async getSavedCharacters(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req as ReqAndUser);
        if (!currentUser) {
            return {
                response: JSON.stringify({ error: "Unauthorized" }),
                status: 401
            };
        }

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ error: "Database not initialized." }),
                status: 503
            };
        }

        try {
            const repo = AppDataSource.getRepository(SavedCharacter);
            const savedCharacters = await repo.find({
                where: { user: { id: currentUser.id } },
                order: { updatedAt: "DESC" }
            });

            const list = savedCharacters.map((record) => {
                const parsed = this.tryParsePayload(record.payload);
                return {
                    id: record.id,
                    siteCharacterId: record.siteCharacterId,
                    source: record.source,
                    name: record.name,
                    externalCharacterId: record.externalCharacterId,
                    updatedAt: record.updatedAt,
                    createdAt: record.createdAt,
                    level: typeof parsed?.level === "number" ? parsed.level : undefined,
                    subtitle: typeof parsed?.subtitle === "string" ? parsed.subtitle : undefined,
                    avatarUrl: typeof parsed?.avatarUrl === "string" ? parsed.avatarUrl : undefined
                };
            });

            return {
                response: JSON.stringify({ characters: list }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error fetching saved characters:", error);
            return {
                response: JSON.stringify({ error: "Failed to fetch saved characters." }),
                status: 500
            };
        }
    }

    public static async getSavedCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req as ReqAndUser);
        if (!currentUser) {
            return {
                response: JSON.stringify({ error: "Unauthorized" }),
                status: 401
            };
        }

        const query = this.parseUrlQuery(req.url);
        const savedId = Number(query.id || query.savedCharacterId);
        const siteCharacterId = this.normalizeSiteCharacterId(query.siteCharacterId || query.characterId || query.id);
        const externalCharacterId = this.normalizeDndBeyondCharacterId(query.externalCharacterId || query.dndBeyondCharacterId || query.characterId || query.id);
        if ((!savedId || Number.isNaN(savedId)) && !siteCharacterId && !externalCharacterId) {
            return {
                response: JSON.stringify({ error: "A valid saved character ID, site character ID, or D&D Beyond character ID is required." }),
                status: 400
            };
        }

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ error: "Database not initialized." }),
                status: 503
            };
        }

        try {
            const repo = AppDataSource.getRepository(SavedCharacter);
            const record = siteCharacterId
                ? await repo.findOne({
                    where: { siteCharacterId, user: { id: currentUser.id } },
                    relations: { user: true }
                })
                : externalCharacterId
                    ? await repo.findOne({
                        where: { externalCharacterId, user: { id: currentUser.id } },
                        order: { updatedAt: "DESC" },
                        relations: { user: true }
                    })
                    : await repo.findOne({
                        where: { id: savedId, user: { id: currentUser.id } },
                        relations: { user: true }
                    });

            if (!record) {
                return {
                    response: JSON.stringify({ error: "Saved character not found." }),
                    status: 404
                };
            }

            const parsed = this.tryParsePayload(record.payload);
            const character = {
                ...(parsed && typeof parsed === "object" ? parsed : {}),
                savedCharacterId: record.id
            };

            return {
                response: JSON.stringify({
                    savedCharacter: {
                        id: record.id,
                        siteCharacterId: record.siteCharacterId,
                        source: record.source,
                        name: record.name,
                        externalCharacterId: record.externalCharacterId,
                        updatedAt: record.updatedAt,
                        createdAt: record.createdAt
                    },
                    character
                }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error(`Error fetching saved character ${siteCharacterId || externalCharacterId || savedId}:`, error);
            return {
                response: JSON.stringify({ error: "Failed to fetch saved character." }),
                status: 500
            };
        }
    }

    public static async saveCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req as ReqAndUser);
        if (!currentUser) {
            return {
                response: JSON.stringify({ error: "Unauthorized" }),
                status: 401
            };
        }

        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ error: "Database not initialized." }),
                status: 503
            };
        }

        let body: any;
        try {
            body = await this.readBody(req);
        } catch {
            return {
                response: JSON.stringify({ error: "Invalid JSON body." }),
                status: 400
            };
        }

        const inputCharacter = typeof body?.character === "string"
            ? this.tryParsePayload(body.character)
            : body?.character;

        if (!inputCharacter || typeof inputCharacter !== "object") {
            return {
                response: JSON.stringify({ error: "A character payload is required." }),
                status: 400
            };
        }

        const name = String(body?.name || inputCharacter?.name || "").trim();
        if (!name) {
            return {
                response: JSON.stringify({ error: "Character name is required." }),
                status: 400
            };
        }

        const savedId = body?.savedId !== undefined && body?.savedId !== null
            ? Number(body.savedId)
            : undefined;
        const source = this.normalizeSource(body?.source || inputCharacter?.source);
        const siteCharacterIdFromBody = this.normalizeSiteCharacterId(body?.siteCharacterId || inputCharacter?.siteCharacterId);
        const externalCharacterId = source === "dndbeyond"
            ? this.normalizeDndBeyondCharacterId(String(body?.externalCharacterId || inputCharacter?.id || ""))
            : undefined;

        try {
            const repo = AppDataSource.getRepository(SavedCharacter);
            let record: SavedCharacter | null = null;

            if (savedId && !Number.isNaN(savedId)) {
                record = await repo.findOne({
                    where: { id: savedId, user: { id: currentUser.id } },
                    relations: { user: true }
                });
            }

            if (!record && siteCharacterIdFromBody) {
                record = await repo.findOne({
                    where: { user: { id: currentUser.id }, siteCharacterId: siteCharacterIdFromBody },
                    relations: { user: true }
                });
            }

            if (!record && externalCharacterId) {
                record = await repo.findOne({
                    where: { user: { id: currentUser.id }, externalCharacterId },
                    order: { updatedAt: "DESC" },
                    relations: { user: true }
                });
            }

            if (!record) {
                record = repo.create({
                    user: currentUser,
                    name,
                    siteCharacterId: siteCharacterIdFromBody || this.generateSiteCharacterId(),
                    source,
                    externalCharacterId,
                    payload: "{}"
                });
            }

            const payloadToSave = {
                ...(inputCharacter as Record<string, unknown>),
                savedCharacterId: record.id || savedId,
                siteCharacterId: record.siteCharacterId || siteCharacterIdFromBody,
                source
            };

            record.user = currentUser;
            record.name = name;
            record.siteCharacterId = siteCharacterIdFromBody || record.siteCharacterId || this.generateSiteCharacterId();
            record.source = source;
            record.externalCharacterId = externalCharacterId;
            record.payload = JSON.stringify(payloadToSave);

            const saved = await repo.save(record);
            const parsed = this.tryParsePayload(saved.payload) || payloadToSave;

            return {
                response: JSON.stringify({
                    success: true,
                    savedCharacter: {
                        id: saved.id,
                        siteCharacterId: saved.siteCharacterId,
                        source: saved.source,
                        name: saved.name,
                        externalCharacterId: saved.externalCharacterId,
                        updatedAt: saved.updatedAt,
                        createdAt: saved.createdAt
                    },
                    character: {
                        ...(parsed && typeof parsed === "object" ? parsed : {}),
                        savedCharacterId: saved.id,
                        siteCharacterId: saved.siteCharacterId,
                        source: saved.source
                    }
                }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error saving character:", error);
            return {
                response: JSON.stringify({ error: "Failed to save character." }),
                status: 500
            };
        }
    }

    private static tryParsePayload(payload: string): any | undefined {
        try {
            return JSON.parse(payload);
        } catch {
            return undefined;
        }
    }

    private static generateSiteCharacterId(): string {
        return `tga-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    }

    private static normalizeSource(raw: unknown): "site" | "dndbeyond" {
        const value = String(raw || "").toLowerCase();
        return value === "dndbeyond" ? "dndbeyond" : "site";
    }

    private static normalizeSiteCharacterId(rawId: unknown): string | undefined {
        if (typeof rawId !== "string") return undefined;
        const value = rawId.trim().toLowerCase();
        if (!value) return undefined;
        return /^tga-[a-z0-9]{8,20}$/.test(value) ? value : undefined;
    }

    private static normalizeDndBeyondCharacterId(rawId: unknown): string | undefined {
        if (typeof rawId !== "string") return undefined;
        const matched = rawId.match(/(\d{3,})/);
        return matched ? matched[1] : undefined;
    }

    private static normalizeCharacterId(rawId: unknown): string | undefined {
        if (typeof rawId !== "string") return undefined;
        const siteId = this.normalizeSiteCharacterId(rawId);
        if (siteId) return siteId;
        return this.normalizeDndBeyondCharacterId(rawId);
    }
}
