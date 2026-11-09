import http from "http";
import AppDataSource from "services/database";
import CharacterAbility from "services/database/entity/CharacterAbility";
import CharacterClass from "services/database/entity/CharacterClass";
import CharacterEquipState from "services/database/entity/CharacterEquipState";
import CharacterFeature from "services/database/entity/CharacterFeature";
import CharacterFeatureDecision from "services/database/entity/CharacterFeatureDecision";
import CharacterInventoryItem from "services/database/entity/CharacterInventoryItem";
import CharacterResource from "services/database/entity/CharacterResource";
import CharacterSkill from "services/database/entity/CharacterSkill";
import CharacterSpell from "services/database/entity/CharacterSpell";
import CharacterVitals from "services/database/entity/CharacterVitals";
import SavedCharacter from "services/database/entity/SavedCharacter";
import cache from "../cache";
import BaseController from "./baseController";
import ItemController from "./itemController";
import RulesController from "./rulesController";
import SessionController, { ReqAndUser } from "./sessionController";
import SpellController from "./spellController";

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
        const isFresh = query.fresh === "true" || query.refresh === "true" || query.force === "true";
        if (isFresh) {
            cache.del(cacheKey);
        }

        const cached = cache.get<string>(cacheKey);
        if (cached) {
            // Even if cached, ensure any new rules (classes, subclasses, species, backgrounds, feats) are saved to DB
            try {
                const parsed = JSON.parse(cached);
                const charData = (parsed as any)?.data || parsed;
                void RulesController.upsertRulesFromDndBeyond(charData).catch(err => {
                    console.warn("Could not upsert rules from cached D&D Beyond character load:", err);
                });
                void SpellController.upsertSpellsFromDndBeyond(charData).catch(err => {
                    console.warn("Could not upsert spells from cached D&D Beyond character load:", err);
                });
            } catch { }

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

            // Dynamically capture rules (classes, subclasses, species, backgrounds, feats, spells) from D&D Beyond loads
            try {
                const charData = (data as any)?.data || data;
                await RulesController.upsertRulesFromDndBeyond(charData);
                await SpellController.upsertSpellsFromDndBeyond(charData);
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

            let autoHealedPayload = false;

            // Auto-heal missing or truncated spell slots for spellcasting characters
            if (character && Array.isArray(character.classes) && character.classes.length > 0) {
                const expectedSpellSlots = this.computeExpectedSpellSlots(character.classes, character.features);
                if (Object.keys(expectedSpellSlots).length > 0) {
                    if (!character.spellSlots || typeof character.spellSlots !== "object") {
                        character.spellSlots = {};
                    }
                    const rawSlots = parsed?.spellSlots && typeof parsed.spellSlots === "object" ? parsed.spellSlots : {};
                    for (const [slotKey, expectedSlot] of Object.entries(expectedSpellSlots)) {
                        const currentSlot = character.spellSlots[slotKey];
                        const rawSlot = rawSlots[slotKey];
                        if (
                            !currentSlot ||
                            typeof currentSlot.total !== "number" ||
                            currentSlot.total < expectedSlot.total ||
                            (slotKey === "pact" && currentSlot.level !== expectedSlot.level)
                        ) {
                            character.spellSlots[slotKey] = { ...expectedSlot };
                        }
                        if (
                            !rawSlot ||
                            typeof rawSlot.total !== "number" ||
                            rawSlot.total < expectedSlot.total ||
                            (slotKey === "pact" && rawSlot.level !== expectedSlot.level)
                        ) {
                            autoHealedPayload = true;
                        }
                    }
                }
            }

            // Auto-heal Wild Shape uses for Druids saved under outdated formulas
            if (character && Array.isArray(character.classes) && Array.isArray(character.classResources)) {
                const druid = character.classes.find((c: any) => c?.name?.toLowerCase() === "druid");
                if (druid && druid.level >= 2) {
                    const expectedUses = druid.level >= 20 ? 99 : druid.level >= 17 ? 4 : druid.level >= 6 ? 3 : 2;
                    const ws = character.classResources.find((r: any) => r?.name?.toLowerCase() === "wild shape");
                    if (ws && typeof ws.total === "number" && ws.total < expectedUses) {
                        ws.total = expectedUses;
                        autoHealedPayload = true;
                    }
                }
            }

            // Auto-heal features and actions on site-created characters to match D&D Beyond's structure
            if (character && record.source === "site") {
                const normFeatures = this.normalizeCharacterFeatures(character.features || [], character.creatorState || parsed?.creatorState);
                if (normFeatures.changed) {
                    character.features = normFeatures.features;
                    autoHealedPayload = true;
                }
                const normActions = this.buildCompleteCharacterActions(
                    character.actions,
                    character.weapons || [],
                    character.spells || [],
                    character.features || [],
                    character.abilities || [],
                    character.vitals,
                    record.source
                );
                if (normActions.changed) {
                    character.actions = normActions.actions;
                    autoHealedPayload = true;
                }
                const ddbApplied = await RulesController.applyDndBeyondDefinitionsToSiteCharacter(character);
                if (ddbApplied) {
                    autoHealedPayload = true;
                }
            }

            // Ingest/sync any new rules (classes, subclasses, species, backgrounds, feats) from the saved character
            if (character) {
                void RulesController.upsertRulesFromCharacter(character, character).catch(err => {
                    console.warn("Could not upsert rules from loaded saved character:", err);
                });
            }

            if (autoHealedPayload) {
                record.payload = JSON.stringify(character);
                void repo.update(record.id, { payload: record.payload }).catch(err => console.warn("Could not auto-heal character payload:", err));
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

            if (source === "site") {
                await RulesController.applyDndBeyondDefinitionsToSiteCharacter(payloadToSave);
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

    private static getOrdinalSuffix(n: number): string {
        if (n === 1) return "st";
        if (n === 2) return "nd";
        if (n === 3) return "rd";
        return "th";
    }

    private static computeExpectedSpellSlots(
        classes: Array<{ name?: string; level?: number; subclass?: string }>,
        features?: Array<{ name?: string }>
    ): Record<string, { level?: number; total: number; label: string }> {
        const FULL_CASTER_SLOTS: number[][] = [
            [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
            [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
            [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
            [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
            [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
            [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
            [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
            [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
            [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
            [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
            [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
            [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
            [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
            [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
            [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
            [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
            [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
            [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
            [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
            [4, 3, 3, 3, 3, 2, 2, 1, 1]  // 20
        ];

        const WARLOCK_PACT_SLOTS: Array<{ count: number; level: number }> = [
            { count: 1, level: 1 }, // 1
            { count: 2, level: 1 }, // 2
            { count: 2, level: 2 }, // 3
            { count: 2, level: 2 }, // 4
            { count: 2, level: 3 }, // 5
            { count: 2, level: 3 }, // 6
            { count: 2, level: 4 }, // 7
            { count: 2, level: 4 }, // 8
            { count: 2, level: 5 }, // 9
            { count: 2, level: 5 }, // 10
            { count: 3, level: 5 }, // 11
            { count: 3, level: 5 }, // 12
            { count: 3, level: 5 }, // 13
            { count: 3, level: 5 }, // 14
            { count: 3, level: 5 }, // 15
            { count: 3, level: 5 }, // 16
            { count: 4, level: 5 }, // 17
            { count: 4, level: 5 }, // 18
            { count: 4, level: 5 }, // 19
            { count: 4, level: 5 }  // 20
        ];

        let effectiveCasterLevel = 0;
        let warlockLevel = 0;

        for (const cls of classes || []) {
            const cName = String(cls?.name || "").toLowerCase().trim();
            const cSub = String(cls?.subclass || "").toLowerCase().trim();
            const cLvl = Math.max(1, Math.min(20, Number(cls?.level) || 1));

            if (["bard", "cleric", "druid", "sorcerer", "wizard"].includes(cName)) {
                effectiveCasterLevel += cLvl;
            } else if (["paladin", "ranger", "artificer"].includes(cName)) {
                effectiveCasterLevel += Math.ceil(cLvl / 2);
            } else if (
                (cName === "fighter" && cSub.includes("eldritch knight")) ||
                (cName === "rogue" && cSub.includes("arcane trickster"))
            ) {
                if (cLvl >= 3) {
                    effectiveCasterLevel += Math.ceil(cLvl / 3);
                }
            } else if (cName === "warlock") {
                warlockLevel += cLvl;
            }
        }

        const result: Record<string, { level?: number; total: number; label: string }> = {};

        if (effectiveCasterLevel > 0) {
            const idx = Math.max(0, Math.min(19, effectiveCasterLevel - 1));
            const row = FULL_CASTER_SLOTS[idx] || [];
            row.forEach((total, i) => {
                if (total > 0) {
                    const slotLvl = i + 1;
                    result[`level${slotLvl}`] = {
                        level: slotLvl,
                        total,
                        label: `${slotLvl}${this.getOrdinalSuffix(slotLvl)} Level`
                    };
                }
            });
        } else if (Array.isArray(features) && features.some(f => String(f?.name || "").toLowerCase().includes("magic initiate"))) {
            result.level1 = {
                level: 1,
                total: 1,
                label: "1st Level"
            };
        }

        if (warlockLevel > 0) {
            const wIdx = Math.max(0, Math.min(19, warlockLevel - 1));
            const pact = WARLOCK_PACT_SLOTS[wIdx];
            if (pact && pact.count > 0) {
                result.pact = {
                    level: pact.level,
                    total: pact.count,
                    label: `Pact Magic (${pact.level}${this.getOrdinalSuffix(pact.level)} Level)`
                };
            }
        }

        return result;
    }

    private static wrapHtmlParagraph(text: string): string {
        const trimmed = (text || "").trim();
        if (!trimmed) return "";
        if (/^<\s*(?:p|div|ul|ol|table|h\d)[\s>]/i.test(trimmed)) return trimmed;
        return `<p>${trimmed}</p>`;
    }

    private static stripHtmlTags(text: string): string {
        return (text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }

    private static normalizeCharacterFeatures(rawFeatures: any[], creatorState?: any): { features: any[]; changed: boolean } {
        if (!Array.isArray(rawFeatures) || rawFeatures.length === 0) {
            return { features: [], changed: false };
        }

        let changed = false;
        const hasSpecificSubclassFeatures = rawFeatures.some((f) => {
            const t = String(f?.type || "").toLowerCase();
            const n = String(f?.name || "").toLowerCase();
            return (t.includes("subclass") && !n.startsWith("subclass:")) || (!n.startsWith("subclass:") && t === "subclass");
        });

        const featsList: any[] = [];
        const invocationList: any[] = [];
        const classList: any[] = [];
        const subclassList: any[] = [];
        const speciesList: any[] = [];

        const asiLevels = [4, 8, 12, 16, 19];
        let asiCounter = 0;

        const primaryClassId = String(creatorState?.classId || "").toLowerCase();
        for (const f of rawFeatures) {
            if (!f || !f.name) continue;
            const nameStr = String(f.name).trim();
            const lowerName = nameStr.toLowerCase();
            const rawType = String(f.type || "Class").trim();
            const lowerType = rawType.toLowerCase();
            const rawSource = String(f.source || "Class").trim();

            // Omit redundant spell slot progression rows ("3rd-Level Spells", "5th-Level Spells", "6th-Level Spells", etc.)
            if (/\b\d+(?:st|nd|rd|th)-level spells\b/i.test(lowerName)) {
                changed = true;
                continue;
            }

            // Omit bogus default Fighting Style on non-Fighter/Paladin/Ranger classes
            if (
                lowerName.startsWith("fighting style:") &&
                primaryClassId &&
                !["fighter", "paladin", "ranger"].includes(primaryClassId)
            ) {
                changed = true;
                continue;
            }

            // Omit generic "Subclass: ..." summary card when individual subclass features exist
            if (lowerName.startsWith("subclass:") && hasSpecificSubclassFeatures) {
                changed = true;
                continue;
            }

            // Convert generic Class "Ability Score Improvement" entries into D&D Beyond-style Feat entries ("4: Ability Score Improvement", etc.) if not already a feat
            if (lowerName === "ability score improvement" && lowerType === "class") {
                const lvl = asiLevels[asiCounter] || 4;
                asiCounter++;
                const asiChoice = creatorState?.asiChoices?.[lvl];
                if (asiChoice?.type === "feat" && asiChoice?.featId) {
                    changed = true;
                    continue;
                }
                changed = true;
                featsList.push({
                    ...f,
                    name: `${lvl}: Ability Score Improvement`,
                    source: "Feat",
                    type: "Feat",
                    description: this.wrapHtmlParagraph(f.description || "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1, to a maximum of 20.")
                });
                continue;
            }

            let normalizedType: "Feat" | "Invocation" | "Class" | "Subclass" | "Species" = "Class";
            let normalizedSource = rawSource;

            if (lowerType === "feat" || rawSource === "Background" || rawSource === "General Feat" || rawSource === "Epic Boon") {
                normalizedType = "Feat";
                normalizedSource = "Feat";
            } else if (
                lowerType === "invocation" ||
                rawSource.startsWith("Class Option") ||
                lowerName.startsWith("primal order:") ||
                lowerName.startsWith("divine order:") ||
                lowerName.startsWith("fighting style:") ||
                lowerName.startsWith("eldritch invocation:") ||
                lowerName.startsWith("metamagic:") ||
                lowerName.startsWith("maneuver:")
            ) {
                normalizedType = "Invocation";
                if (!rawSource.startsWith("Class Option")) {
                    normalizedSource = "Class Option / Invocation";
                }
            } else if (lowerType.includes("subclass")) {
                normalizedType = "Subclass";
            } else if (lowerType.includes("species") || lowerType.includes("race")) {
                normalizedType = "Species";
            } else {
                normalizedType = "Class";
            }

            const wrappedDesc = this.wrapHtmlParagraph(f.description || "");
            if (normalizedType !== rawType || normalizedSource !== rawSource || wrappedDesc !== (f.description || "")) {
                changed = true;
            }

            const item = {
                ...f,
                name: nameStr,
                source: normalizedSource,
                type: normalizedType,
                description: wrappedDesc
            };

            if (normalizedType === "Feat") featsList.push(item);
            else if (normalizedType === "Invocation") invocationList.push(item);
            else if (normalizedType === "Class") classList.push(item);
            else if (normalizedType === "Subclass") subclassList.push(item);
            else speciesList.push(item);
        }

        const ordered = [
            ...featsList,
            ...invocationList,
            ...classList,
            ...subclassList,
            ...speciesList
        ];

        if (ordered.length !== rawFeatures.length) {
            changed = true;
        } else {
            for (let i = 0; i < ordered.length; i++) {
                if (ordered[i].name !== rawFeatures[i]?.name || ordered[i].type !== rawFeatures[i]?.type || ordered[i].source !== rawFeatures[i]?.source) {
                    changed = true;
                    break;
                }
            }
        }

        return { features: ordered, changed };
    }

    private static inferFeatureActionType(name: string, desc: string): "Action" | "Bonus Action" | "Reaction" | null {
        const n = (name || "").toLowerCase().trim();
        const d = this.stripHtmlTags(desc || "").toLowerCase();
        if (
            n.includes("ability score improvement") ||
            n === "spellcasting" ||
            n === "pact magic" ||
            n === "druidic" ||
            n.includes("level spells") ||
            n.startsWith("subclass:") ||
            n === "extra attack" ||
            n === "two extra attacks" ||
            n === "three extra attacks" ||
            n.includes("swim form") ||
            n.includes("fly form") ||
            n === "keen senses" ||
            n === "fey ancestry" ||
            n === "darkvision" ||
            n === "trance" ||
            n === "elven lineage" ||
            n === "unarmored defense" ||
            n === "unarmored movement" ||
            n === "fast movement" ||
            n === "expertise" ||
            n === "jack of all trades" ||
            n === "evasion" ||
            n === "danger sense" ||
            n.startsWith("fighting style:") ||
            n === "primal order" ||
            n.startsWith("primal order:") ||
            n === "divine order" ||
            n.startsWith("divine order:") ||
            n === "elemental fury" ||
            n === "blessed strikes" ||
            n === "alert"
        ) {
            return null;
        }
        if (n.includes("cosmic omen")) {
            return "Reaction";
        }
        if (/\bas a bonus action\b|\btake a bonus action\b|\bbonus action to\b|\bbonus action when\b/i.test(d)) {
            return "Bonus Action";
        }
        if (/\bas a reaction\b|\btake a reaction\b|\breaction when\b|\buse your reaction\b/i.test(d)) {
            return "Reaction";
        }
        if (
            /\bas a magic action\b|\btake a magic action\b|\bas an action\b|\btake an action\b|\bonce on each of your turns\b|\bonce per turn\b|\bwhen you hit\b|\bexpend a spell slot\b|\bexpend one use\b|\bexpend a use\b|\byou can cast\b/i.test(d) ||
            n.includes("wild shape") ||
            n.includes("wild companion") ||
            n.includes("wild resurgence") ||
            n.includes("starry form") ||
            n.includes("star map") ||
            n.includes("twinkling constellations") ||
            n.includes("channel divinity") ||
            n.includes("bardic inspiration") ||
            n.includes("second wind") ||
            n.includes("action surge") ||
            n.includes("flurry of blows") ||
            n.includes("patient defense") ||
            n.includes("step of the wind") ||
            n.includes("stunning strike") ||
            n.includes("lay on hands") ||
            n.includes("divine smite") ||
            n.includes("sneak attack") ||
            n.includes("cunning action") ||
            n.includes("cunning strike") ||
            n.includes("uncanny dodge") ||
            n.includes("innate sorcery") ||
            n.includes("font of magic") ||
            n.includes("arcane recovery")
        ) {
            if (d.includes("bonus action")) return "Bonus Action";
            if (d.includes("reaction")) return "Reaction";
            return "Action";
        }
        return null;
    }

    private static buildCompleteCharacterActions(
        existingActions: any[] | undefined,
        weapons: any[],
        spells: any[],
        features: any[],
        abilities: any[],
        vitals: any,
        source?: string
    ): { actions: any[]; changed: boolean } {
        const current = Array.isArray(existingActions) ? existingActions : [];
        // If D&D Beyond character already has full actions (cantrips or class actions), preserve as-is
        const cantripSpells = Array.isArray(spells) ? spells.filter((sp) => Number(sp?.level) === 0) : [];
        const hasCantripActions = current.some((a) => Boolean(a?.spellName));
        const hasFeatureActions = current.length > (weapons.length + 1 + cantripSpells.length);

        if (source === "dndbeyond" && current.length > 0) {
            return { actions: current, changed: false };
        }
        if (current.length > 0 && (cantripSpells.length === 0 || hasCantripActions) && hasFeatureActions) {
            return { actions: current, changed: false };
        }

        const spellAttackBonus = Number(vitals?.spellAttackBonus) || 0;
        const spellSaveDc = Number(vitals?.spellSaveDc) || 10;
        const strMod = Number(abilities?.find((a: any) => a?.abbr === "STR")?.modifier) || 0;
        const pb = Number(vitals?.proficiencyBonus) || 2;
        const chaMod = Number(abilities?.find((a: any) => a?.abbr === "CHA")?.modifier) || 0;
        const hasAgonizingBlast = Array.isArray(features) && features.some((f) => String(f?.name || "").toLowerCase().includes("agonizing blast"));

        const cantripActions = cantripSpells.map((sp: any) => {
            const descLower = (sp.description || "").toLowerCase();
            let hitOrDc = `${spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus} to hit`;
            if (descLower.includes("saving throw") || descLower.includes("save")) {
                hitOrDc = `DC ${spellSaveDc} Save`;
            }
            let damageOrEffect = "Spell Effect";
            if (String(sp.name || "").toLowerCase() === "eldritch blast" && hasAgonizingBlast) {
                damageOrEffect = `1d10 ${chaMod >= 0 ? `+ ${chaMod}` : `- ${Math.abs(chaMod)}`} Force`;
            }
            const castLower = String(sp.castingTime || "").toLowerCase();
            return {
                name: sp.name,
                type: castLower.includes("bonus")
                    ? "Bonus Action"
                    : castLower.includes("reaction")
                        ? "Reaction"
                        : "Action",
                rangeOrReach: sp.range || "Self",
                hitOrDc,
                damageOrEffect,
                notes: `${sp.school || "Evocation"} cantrip. Click to view full details.`,
                spellName: sp.name
            };
        });

        const weaponActions = (Array.isArray(weapons) ? weapons : []).map((w: any) => ({
            name: w.name,
            type: "Action" as const,
            rangeOrReach: w.range || "Reach 5 ft.",
            hitOrDc: `${w.attackBonus || "+0"} to hit`,
            damageOrEffect: w.damage || "1d4",
            notes: w.mastery?.unlocked && w.mastery?.name
                ? `Mastery: ${w.mastery.name}`
                : (Array.isArray(w.properties) && w.properties.length > 0 ? w.properties.join(", ") : "Weapon")
        }));

        const unarmedAction = {
            name: "Unarmed Strike",
            type: "Action" as const,
            rangeOrReach: "Reach 5 ft.",
            hitOrDc: "Special",
            damageOrEffect: "You make a melee attack to damage, grapple, or shove a target within 5 ft. of you.\r\n\r\n<strong><em>Damage.</em></strong> You make an attack roll against the target. <em>To Hit:</em> {{modifier:str+proficiency}}. <em>On a Hit:</em> {{1+modifier:str#unsigned}} Bludgeoning damage.\r\n\r\n<strong><em>Grapple.</em></strong> The target must succeed on a <strong>DC {{savedc:str}}</strong> Str. or Dex. save (it chooses which), or it has the Grappled condition. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.\r\n\r\n<strong><em>Shove.</em></strong> The target must succeed on a <strong>DC {{savedc:str}}</strong> Str. or Dex. save (it chooses which), or you either push it 5 ft. away or cause it to have the Prone condition. This shove is possible only if the target is no more than one size larger than you.",
            notes: "<p>Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an [rules]Unarmed Strike[/rules]—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.</p>"
        };

        const featureActions: any[] = [];
        const seenNames = new Set<string>([
            ...cantripActions.map((a) => String(a.name).toLowerCase()),
            ...weaponActions.map((a) => String(a.name).toLowerCase()),
            "unarmed strike"
        ]);

        for (const feat of Array.isArray(features) ? features : []) {
            if (!feat?.name) continue;
            const actType = this.inferFeatureActionType(feat.name, feat.description || "");
            if (!actType) continue;
            const key = String(feat.name).toLowerCase();
            if (seenNames.has(key)) continue;
            seenNames.add(key);

            const plainDesc = this.stripHtmlTags(feat.description || "");
            const rangeMatch = plainDesc.match(/within\s+(\d+\s*(?:feet|ft\.?))/i);
            const rangeOrReach = rangeMatch ? rangeMatch[1].replace(/feet/i, "ft.") : "Special";
            const forcesSave = /\bmust (?:succeed on|make) a [a-z]+ saving throw\b|\bfailed save\b/i.test(plainDesc);
            const hitOrDc = forcesSave && spellSaveDc > 0
                ? `DC ${spellSaveDc}`
                : "Special";

            featureActions.push({
                name: feat.name,
                type: actType,
                rangeOrReach,
                hitOrDc,
                damageOrEffect: plainDesc || "Class Feature",
                notes: this.wrapHtmlParagraph(feat.description || "")
            });
        }

        const built = [
            ...cantripActions,
            ...weaponActions,
            unarmedAction,
            ...featureActions
        ];

        return { actions: built, changed: true };
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

        const rawFeatures = record.features && record.features.length > 0
            ? record.features.map(f => ({
                name: f.name,
                source: f.source,
                type: f.type,
                description: f.description,
                scaleValue: f.scaleValue,
                limitedUse: f.limitedUse
            }))
            : (fallbackPayload?.features || []);

        const features = record.source === "site"
            ? this.normalizeCharacterFeatures(rawFeatures, fallbackPayload?.creatorState).features
            : rawFeatures;

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

        const actions = this.buildCompleteCharacterActions(
            fallbackPayload?.actions,
            weapons,
            spells,
            features,
            abilities,
            vitals,
            record.source
        ).actions;

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

        const expectedSpellSlots = this.computeExpectedSpellSlots(classes, features);
        const mergedSpellSlots: Record<string, any> = {
            ...(fallbackPayload?.spellSlots && typeof fallbackPayload.spellSlots === "object" ? fallbackPayload.spellSlots : {})
        };
        for (const [slotKey, expectedSlot] of Object.entries(expectedSpellSlots)) {
            const existingSlot = mergedSpellSlots[slotKey];
            if (
                !existingSlot ||
                typeof existingSlot.total !== "number" ||
                existingSlot.total < expectedSlot.total ||
                (slotKey === "pact" && existingSlot.level !== expectedSlot.level)
            ) {
                mergedSpellSlots[slotKey] = { ...expectedSlot };
            }
        }

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
            spellSlots: mergedSpellSlots,
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
