import http from 'http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
                findOne: mockFindOne
            } as any);

            const req = { url: '/data/get-saved-character?siteCharacterId=tga-sante001', method: 'GET' };
            const result = await CharacterController.getSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            expect(mockFindOne).toHaveBeenCalledWith(expect.objectContaining({
                relationLoadStrategy: 'query'
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
    });
});
