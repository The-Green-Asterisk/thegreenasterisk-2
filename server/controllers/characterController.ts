import http from "http";
import AppDataSource from "services/database";
import CharacterEquipState from "services/database/entity/CharacterEquipState";
import SavedCharacter from "services/database/entity/SavedCharacter";
import CharacterVitals from "services/database/entity/CharacterVitals";
import CharacterClass from "services/database/entity/CharacterClass";
import CharacterAbility from "services/database/entity/CharacterAbility";
import CharacterSkill from "services/database/entity/CharacterSkill";
import CharacterInventoryItem from "services/database/entity/CharacterInventoryItem";
import CharacterSpell from "services/database/entity/CharacterSpell";
import CharacterFeature from "services/database/entity/CharacterFeature";
import CharacterResource from "services/database/entity/CharacterResource";
import CharacterFeatureDecision from "services/database/entity/CharacterFeatureDecision";
import cache from "../cache";
import BaseController from "./baseController";
import SessionController, { ReqAndUser } from "./sessionController";
import SpellController from "./spellController";
import ItemController from "./itemController";
import RulesController from "./rulesController";

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

            // Dynamically capture rules (classes, subclasses, species, backgrounds, feats) from D&D Beyond loads
            try {
                const charData = (data as any)?.data || data;
                await RulesController.upsertRulesFromDndBeyond(charData);
            } catch (ruleErr) {
                console.warn("Could not upsert rules from D&D Beyond character load:", ruleErr);
            }

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

        if (!characterId || !itemName || (scope !== "item" && scope !== "weapon" && scope !== "weapon-mastery" && scope !== "attunement") || typeof equipped !== "boolean") {
            return {
                response: JSON.stringify({ error: "characterId, scope ('item' | 'weapon' | 'weapon-mastery' | 'attunement'), itemName, and equipped (boolean) are required." }),
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
                    level: record.level || (typeof parsed?.level === "number" ? parsed.level : undefined),
                    race: record.race || parsed?.race || parsed?.species || undefined,
                    background: record.background || parsed?.background || undefined,
                    subtitle: typeof parsed?.subtitle === "string" ? parsed.subtitle : undefined,
                    avatarUrl: record.avatarUrl || (typeof parsed?.avatarUrl === "string" ? parsed.avatarUrl : undefined)
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

            if (record.vitals === undefined && record.abilities === undefined) {
                const whereSavedChar = { savedCharacter: { id: record.id } };
                const [vitals, classes, abilities, skills, inventory, spells, features, resources, decisions] = await Promise.all([
                    AppDataSource.getRepository(CharacterVitals).findOne({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterClass).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterAbility).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterSkill).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterInventoryItem).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterSpell).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterFeature).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterResource).find({ where: whereSavedChar }),
                    AppDataSource.getRepository(CharacterFeatureDecision).find({ where: whereSavedChar })
                ]);
                record.vitals = vitals || undefined;
                record.classes = classes;
                record.abilities = abilities;
                record.skills = skills;
                record.inventory = inventory;
                record.spells = spells;
                record.features = features;
                record.resources = resources;
                record.decisions = decisions;
            }

            const parsed = this.tryParsePayload(record.payload);
            const character = (record.vitals || (record.abilities && record.abilities.length > 0))
                ? this.hydrateFromRelationalEntities(record, parsed)
                : {
                    ...(parsed && typeof parsed === "object" ? parsed : {}),
                    savedCharacterId: record.id
                };

            // Auto-heal Wild Shape uses for Druids saved under outdated formulas
            if (character && Array.isArray(character.classes) && Array.isArray(character.classResources)) {
                const druid = character.classes.find((c: any) => c?.name?.toLowerCase() === "druid");
                if (druid && druid.level >= 2) {
                    const expectedUses = druid.level >= 20 ? 99 : druid.level >= 17 ? 4 : druid.level >= 6 ? 3 : 2;
                    const ws = character.classResources.find((r: any) => r?.name?.toLowerCase() === "wild shape");
                    if (ws && typeof ws.total === "number" && ws.total < expectedUses) {
                        ws.total = expectedUses;
                        record.payload = JSON.stringify(character);
                        void repo.update(record.id, { payload: record.payload }).catch(err => console.warn("Could not auto-heal character payload:", err));
                    }
                }
            }

            // Auto-heal saving throw notes so they appear once rather than duplicated under every ability card
            if (character && Array.isArray(character.abilities)) {
                const noteCounts = new Map<string, number>();
                character.abilities.forEach((a: any) => {
                    if (a?.notes) noteCounts.set(a.notes, (noteCounts.get(a.notes) || 0) + 1);
                });
                let changedNotes = false;
                noteCounts.forEach((count, note) => {
                    if (count >= 2 || note.toLowerCase().includes("charmed") || note.toLowerCase().includes("saving throw") || note.toLowerCase().includes("saves")) {
                        if (!Array.isArray(character.savingThrowNotes)) character.savingThrowNotes = [];
                        if (!character.savingThrowNotes.includes(note)) character.savingThrowNotes.push(note);
                        character.abilities.forEach((a: any) => {
                            if (a.notes === note) {
                                delete a.notes;
                                changedNotes = true;
                            }
                        });
                    }
                });
                if (changedNotes) {
                    if (character.vitals) character.vitals.savingThrowNotes = character.savingThrowNotes;
                    record.payload = JSON.stringify(character);
                    void repo.update(record.id, { payload: record.payload }).catch(err => console.warn("Could not auto-heal character saving throws:", err));
                }
            }

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

    public static async deleteSavedCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
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

        const query = this.parseUrlQuery(req.url);
        let body: any = null;
        try {
            body = await this.readBody(req);
        } catch {
            // body may be empty on DELETE
        }

        const rawSavedId = query.id || body?.id || body?.savedId;
        const savedId = rawSavedId !== undefined && rawSavedId !== null ? Number(rawSavedId) : undefined;
        const siteCharacterId = typeof query.siteCharacterId === "string"
            ? query.siteCharacterId.trim()
            : (typeof body?.siteCharacterId === "string" ? body.siteCharacterId.trim() : undefined);

        if ((savedId === undefined || Number.isNaN(savedId) || savedId <= 0) && !siteCharacterId) {
            return {
                response: JSON.stringify({ error: "A valid saved character ID or site character ID is required." }),
                status: 400
            };
        }

        try {
            const repo = AppDataSource.getRepository(SavedCharacter);
            const record = siteCharacterId
                ? await repo.findOne({
                    where: { siteCharacterId, user: { id: currentUser.id } },
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

            // Clean up any CharacterEquipState records for this character
            try {
                const equipRepo = AppDataSource.getRepository(CharacterEquipState);
                const idsToClean = [String(record.id), record.siteCharacterId, record.externalCharacterId].filter(Boolean) as string[];
                for (const cId of idsToClean) {
                    await equipRepo.delete({ characterId: cId });
                }
            } catch (equipErr) {
                console.warn("Could not clean up CharacterEquipState records for deleted character:", equipErr);
            }

            await repo.remove(record);

            return {
                response: JSON.stringify({ success: true, deletedId: record.id }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error deleting saved character:", error);
            return {
                response: JSON.stringify({ error: "Failed to delete saved character." }),
                status: 500
            };
        }
    }

    public static async createCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
        return this.persistCharacter(req, res, "create");
    }

    public static async updateCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
        return this.persistCharacter(req, res, "update");
    }

    public static async saveCharacter(req: http.IncomingMessage, res: http.ServerResponse) {
        return this.persistCharacter(req, res, "update");
    }

    private static async persistCharacter(
        req: http.IncomingMessage,
        _res: http.ServerResponse,
        mode: "create" | "update"
    ) {
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

            if (mode === "update") {
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
            } else {
                // In create mode, if importing from D&D Beyond, check if externalCharacterId already exists for this user
                if (externalCharacterId) {
                    record = await repo.findOne({
                        where: { user: { id: currentUser.id }, externalCharacterId },
                        order: { updatedAt: "DESC" },
                        relations: { user: true }
                    });
                }
            }

            if (!record) {
                record = repo.create({
                    user: currentUser,
                    name,
                    siteCharacterId: (mode === "update" && siteCharacterIdFromBody) ? siteCharacterIdFromBody : this.generateSiteCharacterId(),
                    source,
                    externalCharacterId,
                    payload: "{}"
                });
            }

            const payloadToSave: any = {
                ...(inputCharacter as Record<string, unknown>),
                savedCharacterId: record.id || savedId,
                siteCharacterId: record.siteCharacterId || siteCharacterIdFromBody,
                source
            };

            // Sanitize weapons: ensure no potions or oils are ever stored as weapons in character payload
            if (Array.isArray(payloadToSave.weapons)) {
                const cleanedWeapons: any[] = [];
                const extraEquipment: any[] = [];
                for (const w of payloadToSave.weapons) {
                    const wName = String(w?.name || "").toLowerCase();
                    if (wName.includes("potion of") || wName.includes("oil of") || wName.startsWith("potion ") || wName.startsWith("oil ")) {
                        extraEquipment.push({
                            id: w.id || w.definitionId,
                            definitionId: w.definitionId || w.id,
                            name: w.name,
                            quantity: Number(w.quantity) || 1,
                            equipped: false,
                            attuned: false,
                            requiresAttunement: false,
                            type: "Potion",
                            filterType: "Potion",
                            rarity: wName.includes("greater") ? "Uncommon" : (wName.includes("superior") ? "Rare" : (wName.includes("supreme") ? "Very Rare" : "Common")),
                            isMagic: true,
                            description: w.description || `<p>${w.name}.</p>`
                        });
                    } else {
                        cleanedWeapons.push(w);
                    }
                }
                payloadToSave.weapons = cleanedWeapons;
                if (extraEquipment.length > 0) {
                    const eqList = Array.isArray(payloadToSave.equipment) ? payloadToSave.equipment : [];
                    for (const extra of extraEquipment) {
                        const exists = eqList.some((e: any) => String(e.name || "").toLowerCase() === extra.name.toLowerCase());
                        if (!exists) {
                            eqList.push(extra);
                        }
                    }
                    payloadToSave.equipment = eqList;
                }
            }

            record.user = currentUser;
            record.name = name;
            record.siteCharacterId = siteCharacterIdFromBody || record.siteCharacterId || this.generateSiteCharacterId();
            record.source = source;
            record.externalCharacterId = externalCharacterId;
            record.level = Number(payloadToSave.level) || (Array.isArray(payloadToSave.classes) && payloadToSave.classes[0]?.level) || 1;
            record.race = payloadToSave.race || payloadToSave.species || null;
            record.background = payloadToSave.background || null;
            record.alignment = payloadToSave.alignment || null;
            record.avatarUrl = payloadToSave.avatarUrl || null;
            record.dndBeyondUrl = payloadToSave.dndBeyondUrl || null;
            record.payload = JSON.stringify(payloadToSave);

            const saved = await repo.save(record);
            await this.syncCharacterRelationalEntities(saved, payloadToSave);
            const parsed = this.tryParsePayload(saved.payload) || payloadToSave;

            if (Array.isArray((inputCharacter as any).spells) && (inputCharacter as any).spells.length > 0) {
                await SpellController.upsertSpellsFromCharacter((inputCharacter as any).spells);
            }

            if (Array.isArray(payloadToSave.weapons) || Array.isArray(payloadToSave.equipment)) {
                await ItemController.upsertItemsFromCharacter(
                    payloadToSave.weapons || [],
                    payloadToSave.equipment || []
                );
            }

            try {
                await RulesController.upsertRulesFromCharacter(inputCharacter, payloadToSave);
            } catch (ruleErr) {
                console.warn("Could not upsert rules from character save:", ruleErr);
            }

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
            const parsed = JSON.parse(payload);
            if (parsed && Array.isArray(parsed.weapons)) {
                const potionWeapons = parsed.weapons.filter((w: any) => {
                    const name = String(w?.name || "").toLowerCase();
                    return name.includes("potion of") || name.includes("oil of") || name.startsWith("potion ") || name.startsWith("oil ");
                });
                if (potionWeapons.length > 0) {
                    parsed.weapons = parsed.weapons.filter((w: any) => {
                        const name = String(w?.name || "").toLowerCase();
                        return !name.includes("potion of") && !name.includes("oil of") && !name.startsWith("potion ") && !name.startsWith("oil ");
                    });
                    if (!Array.isArray(parsed.equipment)) parsed.equipment = [];
                    for (const pw of potionWeapons) {
                        const exists = parsed.equipment.some((e: any) => String(e.name || "").toLowerCase() === String(pw.name || "").toLowerCase());
                        if (!exists) {
                            const pwName = String(pw.name || "").toLowerCase();
                            parsed.equipment.push({
                                id: pw.id || pw.definitionId,
                                definitionId: pw.definitionId || pw.id,
                                name: pw.name,
                                quantity: Number(pw.quantity) || 1,
                                equipped: false,
                                attuned: false,
                                requiresAttunement: false,
                                type: "Potion",
                                filterType: "Potion",
                                rarity: pwName.includes("greater") ? "Uncommon" : (pwName.includes("superior") ? "Rare" : (pwName.includes("supreme") ? "Very Rare" : "Common")),
                                isMagic: true,
                                description: pw.description || `<p>${pw.name}.</p>`
                            });
                        }
                    }
                }
            }
            return parsed;
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

    private static tryParseJson(str: string): any {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    private static hydrateFromRelationalEntities(record: SavedCharacter, fallbackPayload: any): any {
        const vitals = record.vitals ? {
            currentHp: record.vitals.currentHp,
            maxHp: record.vitals.maxHp,
            tempHp: record.vitals.tempHp,
            armorClass: record.vitals.armorClass,
            initiative: record.vitals.initiative,
            speed: record.vitals.speed,
            proficiencyBonus: record.vitals.proficiencyBonus,
            passivePerception: record.vitals.passivePerception,
            passiveInvestigation: record.vitals.passiveInvestigation,
            passiveInsight: record.vitals.passiveInsight,
            darkvision: record.vitals.darkvision,
            blindsight: record.vitals.blindsight,
            truesight: record.vitals.truesight,
            tremorsense: record.vitals.tremorsense,
            hitDice: record.vitals.hitDice,
            heroicInspiration: record.vitals.heroicInspiration,
            spellSaveDc: record.vitals.spellSaveDc,
            spellAttackBonus: record.vitals.spellAttackBonus,
            spellcastingAbility: record.vitals.spellcastingAbility,
            deathSaves: {
                successes: record.vitals.deathSuccesses,
                failures: record.vitals.deathFailures,
                isStable: record.vitals.isStable
            },
            savingThrowNotes: record.vitals.savingThrowNotes ? this.tryParseJson(record.vitals.savingThrowNotes) || [] : []
        } : fallbackPayload?.vitals;

        const classes = record.classes && record.classes.length > 0
            ? record.classes.map(c => ({ name: c.name, level: c.level, subclass: c.subclass }))
            : (fallbackPayload?.classes || []);

        const abilities = record.abilities && record.abilities.length > 0
            ? record.abilities.map(a => ({
                name: a.name,
                abbr: a.abbr,
                score: a.score,
                baseScore: a.baseScore,
                bonus: a.bonus,
                modifier: a.modifier,
                save: a.save,
                proficientSave: a.proficientSave,
                notes: a.notes
            }))
            : (fallbackPayload?.abilities || []);

        const skills = record.skills && record.skills.length > 0
            ? record.skills.map(s => ({
                name: s.name,
                stat: s.stat,
                bonus: s.bonus,
                proficiency: s.proficiency
            }))
            : (fallbackPayload?.skills || []);

        const weapons = record.inventory && record.inventory.length > 0
            ? record.inventory
                .filter(i => i.damage || i.category?.toLowerCase().includes("melee") || i.category?.toLowerCase().includes("ranged"))
                .map(w => ({
                    id: w.id,
                    name: w.name,
                    quantity: w.quantity,
                    equipped: w.equipped,
                    attuned: w.attuned,
                    requiresAttunement: w.requiresAttunement,
                    category: w.category,
                    damage: w.damage || "",
                    damageType: w.damageType || "",
                    damageDie: w.damageDie || "",
                    attackBonus: w.attackBonus || "",
                    toHitModifier: w.toHitModifier ?? 0,
                    range: w.range || "5 ft.",
                    properties: w.propertiesJson ? this.tryParseJson(w.propertiesJson) || [] : [],
                    mastery: w.masteryName ? {
                        name: w.masteryName,
                        description: w.masteryDescription,
                        unlocked: w.masteryUnlocked ?? false
                    } : undefined,
                    isMagic: w.isMagic,
                    rarity: w.rarity,
                    description: w.description,
                    notes: w.notes,
                    grantedBy: w.grantedBy,
                    imageUrl: w.imageUrl
                }))
            : (fallbackPayload?.weapons || []);

        const equipment = record.inventory && record.inventory.length > 0
            ? record.inventory
                .filter(i => !(i.damage || i.category?.toLowerCase().includes("melee") || i.category?.toLowerCase().includes("ranged")))
                .map(e => ({
                    id: e.id,
                    name: e.name,
                    quantity: e.quantity,
                    equipped: e.equipped,
                    attuned: e.attuned,
                    requiresAttunement: e.requiresAttunement,
                    type: e.category,
                    filterType: e.category,
                    isMagic: e.isMagic,
                    rarity: e.rarity,
                    description: e.description,
                    notes: e.notes,
                    grantedBy: e.grantedBy,
                    imageUrl: e.imageUrl
                }))
            : (fallbackPayload?.equipment || []);

        const spells = record.spells && record.spells.length > 0
            ? record.spells.map(sp => ({
                id: sp.id,
                name: sp.name,
                level: sp.level,
                school: sp.school,
                source: sp.source,
                prepared: sp.prepared,
                alwaysPrepared: sp.alwaysPrepared,
                castingTime: sp.castingTime,
                range: sp.range,
                duration: sp.duration,
                components: sp.components,
                concentration: sp.concentration,
                ritual: sp.ritual,
                description: sp.description || ""
            }))
            : (fallbackPayload?.spells || []);

        const features = record.features && record.features.length > 0
            ? record.features.map(f => ({
                name: f.name,
                source: f.source,
                type: f.type,
                description: f.description,
                scaleValue: f.scaleValue,
                limitedUse: f.limitedUse
            }))
            : (fallbackPayload?.features || []);

        const classResources = record.resources && record.resources.length > 0
            ? record.resources.map(r => ({
                name: r.name,
                total: r.total,
                currentUsed: r.currentUsed,
                resetOn: r.resetOn,
                dieOrType: r.dieOrType,
                key: r.resourceKey
            }))
            : (fallbackPayload?.classResources || []);

        const featureChoices = record.decisions && record.decisions.length > 0
            ? record.decisions.reduce((acc, d) => {
                acc[d.decisionId] = d.selectedValue;
                return acc;
            }, {} as Record<string, string>)
            : (fallbackPayload?.featureChoices || {});

        const actions = Array.isArray(fallbackPayload?.actions) && fallbackPayload.actions.length > 0
            ? fallbackPayload.actions
            : [
                ...weapons.map((w: any) => ({
                    name: w.name,
                    type: "Action" as const,
                    rangeOrReach: w.range || "5 ft.",
                    hitOrDc: `${w.attackBonus || "+0"} to hit`,
                    damageOrEffect: w.damage || "1d4",
                    notes: w.mastery?.name ? `Mastery: ${w.mastery.name}` : (Array.isArray(w.properties) ? w.properties.join(", ") : "")
                })),
                {
                    name: "Unarmed Strike",
                    type: "Action" as const,
                    rangeOrReach: "Reach 5 ft.",
                    hitOrDc: `+${(abilities.find((a: any) => a.abbr === "STR")?.modifier ?? 0) + (vitals?.proficiencyBonus ?? 2)} to hit`,
                    damageOrEffect: `${Math.max(1, 1 + (abilities.find((a: any) => a.abbr === "STR")?.modifier ?? 0))} Bludgeoning`,
                    notes: "Damage, Grapple, or Shove (DC " + (8 + (abilities.find((a: any) => a.abbr === "STR")?.modifier ?? 0) + (vitals?.proficiencyBonus ?? 2)) + ")"
                }
            ];

        const proficiencies = fallbackPayload?.proficiencies && typeof fallbackPayload.proficiencies === "object"
            ? {
                armor: Array.isArray(fallbackPayload.proficiencies.armor) ? fallbackPayload.proficiencies.armor : [],
                weapons: Array.isArray(fallbackPayload.proficiencies.weapons) ? fallbackPayload.proficiencies.weapons : [],
                tools: Array.isArray(fallbackPayload.proficiencies.tools) ? fallbackPayload.proficiencies.tools : [],
                languages: Array.isArray(fallbackPayload.proficiencies.languages) ? fallbackPayload.proficiencies.languages : ["Common"]
            }
            : {
                armor: [],
                weapons: [],
                tools: fallbackPayload?.creatorState?.bgTool ? [fallbackPayload.creatorState.bgTool] : [],
                languages: ["Common"]
            };

        return {
            ...(fallbackPayload && typeof fallbackPayload === "object" ? fallbackPayload : {}),
            name: record.name,
            level: record.level || fallbackPayload?.level || 1,
            race: record.race || fallbackPayload?.race || fallbackPayload?.species || "",
            background: record.background || fallbackPayload?.background || "",
            alignment: record.alignment || fallbackPayload?.alignment || "",
            avatarUrl: record.avatarUrl || fallbackPayload?.avatarUrl || "",
            dndBeyondUrl: record.dndBeyondUrl || fallbackPayload?.dndBeyondUrl || "",
            vitals,
            savingThrowNotes: vitals?.savingThrowNotes || fallbackPayload?.savingThrowNotes || [],
            classes,
            abilities,
            skills,
            weapons,
            equipment,
            spells,
            features,
            actions,
            proficiencies,
            spellSlots: fallbackPayload?.spellSlots || {},
            classResources,
            featureChoices
        };
    }

    private static async syncCharacterRelationalEntities(savedCharacter: SavedCharacter, data: any) {
        if (!AppDataSource.isInitialized || !savedCharacter?.id) return;
        try {
            const charRef = { id: savedCharacter.id } as SavedCharacter;

            // 1. Character Vitals
            if (data.vitals) {
                const vitalsRepo = AppDataSource.getRepository(CharacterVitals);
                let vitals = await vitalsRepo.findOne({ where: { savedCharacter: { id: savedCharacter.id } } });
                if (!vitals) {
                    vitals = vitalsRepo.create({ savedCharacter: charRef });
                }
                vitals.currentHp = Number(data.vitals.currentHp) || 10;
                vitals.maxHp = Number(data.vitals.maxHp) || 10;
                vitals.tempHp = Number(data.vitals.tempHp) || 0;
                vitals.armorClass = Number(data.vitals.armorClass) || 10;
                vitals.initiative = Number(data.vitals.initiative) || 0;
                vitals.speed = String(data.vitals.speed || "30 ft.");
                vitals.proficiencyBonus = Number(data.vitals.proficiencyBonus) || 2;
                vitals.passivePerception = Number(data.vitals.passivePerception) || 10;
                vitals.passiveInvestigation = Number(data.vitals.passiveInvestigation) || 10;
                vitals.passiveInsight = Number(data.vitals.passiveInsight) || 10;
                vitals.darkvision = String(data.vitals.darkvision || "None");
                vitals.blindsight = data.vitals.blindsight;
                vitals.truesight = data.vitals.truesight;
                vitals.tremorsense = data.vitals.tremorsense;
                vitals.hitDice = String(data.vitals.hitDice || "1d8");
                vitals.heroicInspiration = Boolean(data.vitals.heroicInspiration);
                vitals.spellSaveDc = Number(data.vitals.spellSaveDc) || 10;
                vitals.spellAttackBonus = Number(data.vitals.spellAttackBonus) || 0;
                vitals.spellcastingAbility = String(data.vitals.spellcastingAbility || "none");
                vitals.deathSuccesses = Number(data.vitals.deathSaves?.successes) || 0;
                vitals.deathFailures = Number(data.vitals.deathSaves?.failures) || 0;
                vitals.isStable = Boolean(data.vitals.deathSaves?.isStable);
                vitals.savingThrowNotes = data.savingThrowNotes ? JSON.stringify(data.savingThrowNotes) : (data.vitals.savingThrowNotes ? JSON.stringify(data.vitals.savingThrowNotes) : undefined);
                await vitalsRepo.save(vitals);
            }

            // 3. Classes
            if (Array.isArray(data.classes)) {
                const classRepo = AppDataSource.getRepository(CharacterClass);
                await classRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const classEntities = data.classes.map((c: any, idx: number) => classRepo.create({
                    savedCharacter: charRef,
                    name: c.name || "Adventurer",
                    level: Number(c.level) || 1,
                    subclass: c.subclass || undefined,
                    isStartingClass: idx === 0
                }));
                if (classEntities.length > 0) await classRepo.save(classEntities);
            }

            // 4. Abilities
            if (Array.isArray(data.abilities)) {
                const abilityRepo = AppDataSource.getRepository(CharacterAbility);
                await abilityRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const abilityEntities = data.abilities.map((a: any) => abilityRepo.create({
                    savedCharacter: charRef,
                    name: a.name || a.abbr,
                    abbr: a.abbr || a.name,
                    score: Number(a.score) || 10,
                    baseScore: Number(a.baseScore ?? a.score) || 10,
                    bonus: Number(a.bonus) || 0,
                    modifier: Number(a.modifier) || 0,
                    save: Number(a.save) || 0,
                    proficientSave: Boolean(a.proficientSave),
                    notes: a.notes || undefined
                }));
                if (abilityEntities.length > 0) await abilityRepo.save(abilityEntities);
            }

            // 5. Skills
            if (Array.isArray(data.skills)) {
                const skillRepo = AppDataSource.getRepository(CharacterSkill);
                await skillRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const skillEntities = data.skills.map((s: any) => skillRepo.create({
                    savedCharacter: charRef,
                    name: s.name,
                    stat: s.stat || "DEX",
                    bonus: Number(s.bonus) || 0,
                    proficiency: s.proficiency || "none"
                }));
                if (skillEntities.length > 0) await skillRepo.save(skillEntities);
            }

            // 6. Inventory Items (Weapons & Equipment)
            const itemRepo = AppDataSource.getRepository(CharacterInventoryItem);
            await itemRepo.delete({ savedCharacter: { id: savedCharacter.id } });
            const itemsToSave: any[] = [];
            if (Array.isArray(data.weapons)) {
                for (const w of data.weapons) {
                    itemsToSave.push(itemRepo.create({
                        savedCharacter: charRef,
                        name: w.name,
                        quantity: Number(w.quantity) || 1,
                        equipped: Boolean(w.equipped),
                        attuned: Boolean(w.attuned),
                        requiresAttunement: Boolean(w.requiresAttunement),
                        category: w.category || "Simple Melee",
                        damage: w.damage || undefined,
                        damageType: w.damageType || undefined,
                        damageDie: w.damageDie || undefined,
                        attackBonus: w.attackBonus || undefined,
                        toHitModifier: w.toHitModifier !== undefined ? Number(w.toHitModifier) : undefined,
                        range: w.range || undefined,
                        propertiesJson: w.properties ? JSON.stringify(w.properties) : undefined,
                        masteryName: w.mastery?.name || undefined,
                        masteryUnlocked: w.mastery?.unlocked !== undefined ? Boolean(w.mastery.unlocked) : undefined,
                        masteryDescription: w.mastery?.description || undefined,
                        isMagic: Boolean(w.isMagic),
                        rarity: w.rarity || undefined,
                        description: w.description || undefined,
                        notes: w.notes || undefined,
                        grantedBy: w.grantedBy || undefined,
                        imageUrl: w.imageUrl || undefined
                    }));
                }
            }
            if (Array.isArray(data.equipment)) {
                for (const e of data.equipment) {
                    itemsToSave.push(itemRepo.create({
                        savedCharacter: charRef,
                        name: e.name,
                        quantity: Number(e.quantity) || 1,
                        equipped: Boolean(e.equipped),
                        attuned: Boolean(e.attuned),
                        requiresAttunement: Boolean(e.requiresAttunement),
                        category: e.type || e.filterType || "Gear",
                        isMagic: Boolean(e.isMagic),
                        rarity: e.rarity || undefined,
                        description: e.description || undefined,
                        notes: e.notes || undefined,
                        grantedBy: e.grantedBy || undefined,
                        imageUrl: e.imageUrl || undefined
                    }));
                }
            }
            if (itemsToSave.length > 0) await itemRepo.save(itemsToSave);

            // 7. Spells
            if (Array.isArray(data.spells)) {
                const spellRepo = AppDataSource.getRepository(CharacterSpell);
                await spellRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const spellEntities = data.spells.map((sp: any) => spellRepo.create({
                    savedCharacter: charRef,
                    name: sp.name,
                    level: Number(sp.level) || 0,
                    school: sp.school || "Evocation",
                    source: sp.source || "Class",
                    prepared: Boolean(sp.prepared),
                    alwaysPrepared: Boolean(sp.alwaysPrepared),
                    castingTime: sp.castingTime || "1 Action",
                    range: sp.range || "Touch",
                    duration: sp.duration || "Instantaneous",
                    components: sp.components || "V, S",
                    concentration: Boolean(sp.concentration),
                    ritual: Boolean(sp.ritual),
                    description: sp.description || undefined
                }));
                if (spellEntities.length > 0) await spellRepo.save(spellEntities);
            }

            // 8. Features
            if (Array.isArray(data.features)) {
                const featureRepo = AppDataSource.getRepository(CharacterFeature);
                await featureRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const featureEntities = data.features.map((f: any) => featureRepo.create({
                    savedCharacter: charRef,
                    name: f.name,
                    source: f.source || "Class",
                    type: f.type || "Class",
                    description: f.description || "",
                    scaleValue: f.scaleValue || undefined,
                    limitedUse: f.limitedUse || undefined
                }));
                if (featureEntities.length > 0) await featureRepo.save(featureEntities);
            }

            // 9. Resources
            if (Array.isArray(data.classResources)) {
                const resourceRepo = AppDataSource.getRepository(CharacterResource);
                await resourceRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const resourceEntities = data.classResources.map((r: any) => resourceRepo.create({
                    savedCharacter: charRef,
                    name: r.name,
                    total: Number(r.total) || 0,
                    currentUsed: Number(r.currentUsed) || 0,
                    resetOn: r.resetOn || "long",
                    dieOrType: r.dieOrType || undefined,
                    resourceKey: r.key || r.resourceKey || undefined
                }));
                if (resourceEntities.length > 0) await resourceRepo.save(resourceEntities);
            }

            // 10. Decisions
            const choicesMap = (data.featureChoices && typeof data.featureChoices === "object")
                ? data.featureChoices
                : (data.subclassFeatureChoices && typeof data.subclassFeatureChoices === "object")
                    ? data.subclassFeatureChoices
                    : (data.creatorState?.subclassFeatureChoices && typeof data.creatorState?.subclassFeatureChoices === "object")
                        ? data.creatorState.subclassFeatureChoices
                        : null;

            if (choicesMap) {
                const decisionRepo = AppDataSource.getRepository(CharacterFeatureDecision);
                await decisionRepo.delete({ savedCharacter: { id: savedCharacter.id } });
                const classNames = Array.isArray(data.classes)
                    ? data.classes.map((c: any) => String(c.name || "").toLowerCase())
                    : [];
                const knownClassPrefixes = ["barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"];
                const decisionEntities = Object.entries(choicesMap)
                    .filter(([decisionId]) => {
                        const prefix = decisionId.split("-")[0]?.toLowerCase();
                        if (prefix && knownClassPrefixes.includes(prefix) && classNames.length > 0) {
                            return classNames.includes(prefix);
                        }
                        return true;
                    })
                    .map(([decisionId, val]) => decisionRepo.create({
                        savedCharacter: charRef,
                        decisionId,
                        selectedValue: String(val)
                    }));
                if (decisionEntities.length > 0) await decisionRepo.save(decisionEntities);
            }
        } catch (err) {
            console.warn("Could not sync relational character entities:", err);
        }
    }
}
