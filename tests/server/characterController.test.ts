import http from 'http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import CharacterController from '../../server/controllers/characterController';
import SessionController from '../../server/controllers/sessionController';
import AppDataSource from '../../server/services/database';

describe('CharacterController', () => {
    let mockReq: Partial<http.IncomingMessage>;
    let mockRes: Partial<http.ServerResponse>;

    beforeEach(() => {
        mockReq = {
            url: '/data/get-dndbeyond-character?id=138310322',
            method: 'GET'
        };
        mockRes = {};
        cache.del('dndbeyond_char_138310322');
    });

    it('returns 400 when id is missing or invalid', async () => {
        mockReq.url = '/data/get-dndbeyond-character';
        const result = await CharacterController.getDndBeyondCharacter(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );
        expect(result.status).toBe(400);
        expect(result.response).toContain('error');
    });

    it('returns cached character when present in cache', async () => {
        const dummyData = JSON.stringify({ id: 138310322, name: 'Darvell Test' });
        cache.set('dndbeyond_char_138310322', dummyData, 600);

        const result = await CharacterController.getDndBeyondCharacter(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(200);
        expect(result.response).toBe(dummyData);
    });

    describe('deleteSavedCharacter', () => {
        it('returns 401 when user is not authenticated', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue(undefined as any);
            const req = { url: '/data/delete-saved-character?id=12', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );
            expect(result.status).toBe(401);
            expect(result.response).toContain('Unauthorized');
        });

        it('returns 400 when character id is missing or invalid', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const req = { url: '/data/delete-saved-character', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );
            expect(result.status).toBe(400);
            expect(result.response).toContain('valid saved character ID');
        });

        it('returns 404 when character is not found for current user', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const mockFindOne = vi.fn().mockResolvedValue(null);
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne
            } as any);

            const req = { url: '/data/delete-saved-character?id=999', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );
            expect(result.status).toBe(404);
            expect(result.response).toContain('not found');
        });

        it('successfully deletes character and cleans up equip state overrides', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const fakeCharacter = {
                id: 12,
                name: 'Gromph Baenre',
                siteCharacterId: 'tga-12345',
                externalCharacterId: '98765'
            };

            const mockRemove = vi.fn().mockResolvedValue(fakeCharacter);
            const mockFindOne = vi.fn().mockResolvedValue(fakeCharacter);
            const mockEquipDelete = vi.fn().mockResolvedValue({ affected: 1 });

            vi.spyOn(AppDataSource, 'getRepository').mockImplementation((entity: any) => {
                if (entity?.name === 'CharacterEquipState' || String(entity).includes('CharacterEquipState')) {
                    return { delete: mockEquipDelete } as any;
                }
                return {
                    findOne: mockFindOne,
                    remove: mockRemove
                } as any;
            });

            const req = { url: '/data/delete-saved-character?id=12', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const parsed = JSON.parse(result.response);
            expect(parsed.success).toBe(true);
            expect(parsed.deletedId).toBe(12);
            expect(mockRemove).toHaveBeenCalledWith(fakeCharacter);
            expect(mockEquipDelete).toHaveBeenCalled();
        });
    });

    describe('relational hydration & sync', () => {
        it('hydrates character data from relational entities when vitals/abilities exist', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const fakeRelationalCharacter = {
                id: 42,
                name: 'San Te',
                siteCharacterId: 'tga-sante001',
                source: 'site',
                level: 3,
                race: 'Elf',
                background: 'Soldier',
                alignment: 'Lawful Good',
                avatarUrl: '/storage/images/sante.png',
                payload: JSON.stringify({ notes: 'Extra note' }),
                vitals: {
                    currentHp: 24,
                    maxHp: 24,
                    tempHp: 0,
                    armorClass: 16,
                    initiative: 3,
                    speed: '30 ft.',
                    proficiencyBonus: 2,
                    passivePerception: 13,
                    passiveInvestigation: 11,
                    passiveInsight: 13,
                    darkvision: 'Darkvision 60 ft.',
                    hitDice: '1d10',
                    heroicInspiration: true,
                    spellSaveDc: 10,
                    spellAttackBonus: 0,
                    spellcastingAbility: 'none',
                    deathSuccesses: 0,
                    deathFailures: 0,
                    isStable: false,
                    savingThrowNotes: JSON.stringify(['Advantage against being charmed'])
                },
                classes: [
                    { name: 'Fighter', level: 3, subclass: 'Battle Master' }
                ],
                abilities: [
                    { name: 'Strength', abbr: 'STR', score: 16, baseScore: 14, bonus: 2, modifier: 3, save: 5, proficientSave: true },
                    { name: 'Dexterity', abbr: 'DEX', score: 14, baseScore: 14, bonus: 0, modifier: 2, save: 2, proficientSave: false }
                ],
                skills: [
                    { name: 'Athletics', stat: 'STR', bonus: 5, proficiency: 'proficient' }
                ],
                inventory: [
                    { name: 'Longsword', quantity: 1, equipped: true, category: 'Martial Melee', damage: '1d8 + 3 Slashing', damageType: 'Slashing', damageDie: '1d8', attackBonus: '+5', toHitModifier: 5, range: '5 ft.', masteryName: 'Sap', masteryUnlocked: true }
                ],
                spells: [],
                features: [
                    { name: 'Second Wind', source: 'Fighter', type: 'Class', description: 'Regain 1d10+3 HP.' }
                ],
                resources: [
                    { name: 'Second Wind', total: 2, currentUsed: 0, resetOn: 'short' }
                ],
                decisions: []
            };

            const mockFindOne = vi.fn().mockResolvedValue(fakeRelationalCharacter);
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne,
                find: vi.fn().mockResolvedValue([])
            } as any);

            const req = { url: '/data/get-saved-character?siteCharacterId=tga-sante001', method: 'GET' };
            const result = await CharacterController.getSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            expect(mockFindOne).toHaveBeenCalledWith(expect.objectContaining({
                relations: { user: true }
            }));
            const body = JSON.parse(result.response);
            expect(body.character.name).toBe('San Te');
            expect(body.character.level).toBe(3);
            expect(body.character.race).toBe('Elf');
            expect(body.character.vitals.currentHp).toBe(24);
            expect(body.character.vitals.armorClass).toBe(16);
            expect(body.character.classes[0].name).toBe('Fighter');
            expect(body.character.classes[0].subclass).toBe('Battle Master');
            expect(body.character.weapons[0].name).toBe('Longsword');
            expect(body.character.weapons[0].mastery.name).toBe('Sap');
            expect(body.character.features[0].name).toBe('Second Wind');
            expect(body.character.savingThrowNotes).toContain('Advantage against being charmed');
        });

        it('auto-heals missing or truncated spell slots for higher-level spellcasters (e.g., Lyra Silverleaf tga-l0x4pabp467d)', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const mockUpdate = vi.fn().mockResolvedValue({ affected: 1 });
            const lyraCharacter = {
                id: 5,
                name: 'Lyra Silverleaf',
                siteCharacterId: 'tga-l0x4pabp467d',
                source: 'site',
                level: 6,
                race: 'Elf',
                background: 'Hermit',
                alignment: 'Neutral Good',
                payload: JSON.stringify({
                    name: 'Lyra Silverleaf',
                    level: 6,
                    classes: [{ name: 'Druid', level: 6, subclass: 'Circle of the Moon' }],
                    spellSlots: {
                        level1: { total: 2, label: '1st Level' }
                    },
                    classResources: [
                        { name: 'Wild Shape', total: 2, resetOn: 'short' }
                    ]
                }),
                vitals: {
                    currentHp: 45,
                    maxHp: 45,
                    tempHp: 0,
                    armorClass: 15,
                    initiative: 2,
                    speed: '30 ft.',
                    proficiencyBonus: 3,
                    passivePerception: 16,
                    passiveInvestigation: 11,
                    passiveInsight: 16,
                    darkvision: 'Darkvision 60 ft.',
                    hitDice: '6d8',
                    heroicInspiration: false,
                    spellSaveDc: 15,
                    spellAttackBonus: 7,
                    spellcastingAbility: 'wis',
                    deathSuccesses: 0,
                    deathFailures: 0,
                    isStable: false
                },
                classes: [{ name: 'Druid', level: 6, subclass: 'Circle of the Moon' }],
                abilities: [{ name: 'Wisdom', abbr: 'WIS', score: 18, baseScore: 17, bonus: 1, modifier: 4, save: 7, proficientSave: true }],
                skills: [],
                inventory: [],
                spells: [
                    { name: 'Produce Flame', level: 0, school: 'Conjuration', source: 'Class', prepared: true, castingTime: 'Bonus Action', range: 'Self (60 feet)', duration: '10 minutes', components: 'V, S', concentration: false, ritual: false, description: 'Make a ranged spell attack.' }
                ],
                features: [
                    { name: 'Wild Shape', source: 'Druid', type: 'Class', description: 'As a Bonus Action, you shape-shift into a Beast.' },
                    { name: 'Starry Form', source: 'Circle of the Stars', type: 'Subclass Feature', description: 'As a Bonus Action, assume a Starry Form.' },
                    { name: '5th-Level Spells', source: 'Druid', type: 'Class', description: 'You can now prepare 5th-level Druid spells.' }
                ],
                resources: [{ name: 'Wild Shape', total: 2, currentUsed: 0, resetOn: 'short' }],
                decisions: []
            };

            const mockFindOne = vi.fn().mockResolvedValue(lyraCharacter);
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne,
                find: vi.fn().mockResolvedValue([]),
                update: mockUpdate
            } as any);

            const req = { url: '/data/get-saved-character?siteCharacterId=tga-l0x4pabp467d', method: 'GET' };
            const result = await CharacterController.getSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const body = JSON.parse(result.response);
            expect(body.character.spellSlots.level1).toEqual({ level: 1, total: 4, label: '1st Level' });
            expect(body.character.spellSlots.level2).toEqual({ level: 2, total: 3, label: '2nd Level' });
            expect(body.character.spellSlots.level3).toEqual({ level: 3, total: 3, label: '3rd Level' });
            expect(body.character.classResources.find((r: any) => r.name === 'Wild Shape')?.total).toBe(3);
            expect(body.character.features.some((f: any) => f.name === '5th-Level Spells')).toBe(false);
            expect(body.character.features.find((f: any) => f.name === 'Starry Form')?.type).toBe('Subclass');
            expect(body.character.features.find((f: any) => f.name === 'Starry Form')?.description).toContain('<p>');
            expect(body.character.actions.some((a: any) => a.name === 'Produce Flame' && a.spellName === 'Produce Flame')).toBe(true);
            expect(body.character.actions.some((a: any) => a.name === 'Wild Shape' && a.type === 'Bonus Action')).toBe(true);
            expect(body.character.actions.some((a: any) => a.name === 'Starry Form' && a.type === 'Bonus Action')).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith(5, expect.objectContaining({
                payload: expect.stringContaining('"level3":{"level":3,"total":3,"label":"3rd Level"}')
            }));
        });
    });

    describe('setCharacterEquipState', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('returns 401 and writes nothing when logged out', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue(undefined as any);
            const readBody = vi.spyOn(CharacterController, 'readBody');
            const getRepository = vi.spyOn(AppDataSource, 'getRepository');
            const result = await CharacterController.setCharacterEquipState(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(result.status).toBe(401);
            expect(JSON.parse(result.response).error).toBe('Log in to save equipped items.');
            expect(readBody).not.toHaveBeenCalled();
            expect(getRepository).not.toHaveBeenCalled();
        });

        it('still validates the body when logged in', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            vi.spyOn(CharacterController, 'readBody').mockResolvedValue({ characterId: '138310322' } as any);
            const result = await CharacterController.setCharacterEquipState(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(result.status).toBe(400);
        });

        const equipBody = { characterId: '138310322', scope: 'weapon', itemName: 'Longsword', equipped: true };

        function mockEquipRepos(ownedRow: unknown) {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });
            const ownerLookup = vi.fn().mockResolvedValue(ownedRow);
            const save = vi.fn(async (row: any) => row);
            vi.spyOn(AppDataSource, 'getRepository').mockImplementation((entity: any) => {
                if (entity?.name === 'SavedCharacter') return { findOne: ownerLookup } as any;
                return { findOne: vi.fn().mockResolvedValue(null), create: (row: any) => row, save } as any;
            });
            vi.spyOn(CharacterController, 'readBody').mockResolvedValue(equipBody as any);
            return { ownerLookup, save };
        }

        it('returns 403 and saves nothing for a user who does not own the character', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 2, isAdmin: false } as any);
            const { ownerLookup, save } = mockEquipRepos(null);
            const result = await CharacterController.setCharacterEquipState(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(result.status).toBe(403);
            expect(JSON.parse(result.response).error).toBe("Only the character's owner or an admin can change its equipped items.");
            expect(ownerLookup).toHaveBeenCalledWith(expect.objectContaining({
                where: [
                    { siteCharacterId: '138310322', user: { id: 2 } },
                    { externalCharacterId: '138310322', user: { id: 2 } }
                ]
            }));
            expect(save).not.toHaveBeenCalled();
        });

        it('saves for the owner', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1, isAdmin: false } as any);
            const { save } = mockEquipRepos({ id: 5 });
            const result = await CharacterController.setCharacterEquipState(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(result.status).toBe(200);
            expect(save).toHaveBeenCalledWith(expect.objectContaining({ characterId: '138310322', itemName: 'Longsword', equipped: true }));
        });

        it('saves for an admin without checking ownership', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 9, isAdmin: true } as any);
            const { ownerLookup, save } = mockEquipRepos(null);
            const result = await CharacterController.setCharacterEquipState(mockReq as http.IncomingMessage, mockRes as http.ServerResponse);
            expect(result.status).toBe(200);
            expect(ownerLookup).not.toHaveBeenCalled();
            expect(save).toHaveBeenCalled();
        });
    });
});
