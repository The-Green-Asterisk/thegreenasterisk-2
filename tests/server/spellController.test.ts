import http from 'http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import BaseController from '../../server/controllers/baseController';
import SpellController from '../../server/controllers/spellController';
import AppDataSource from '../../server/services/database';

describe('SpellController', () => {
    let mockReq: Partial<http.IncomingMessage>;
    let mockRes: Partial<http.ServerResponse>;

    beforeEach(() => {
        mockReq = {
            url: '/data/get-spell?name=Vicious%20Mockery',
            method: 'GET'
        };
        mockRes = {};
        cache.del('spell_detail_vicious-mockery');
    });

    it('returns 400 when name is missing', async () => {
        mockReq.url = '/data/get-spell';
        const result = await SpellController.getSpell(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );
        expect(result.status).toBe(400);
        expect(result.response).toContain('error');
    });

    it('returns cached spell when present in cache', async () => {
        const dummySpell = {
            slug: 'vicious-mockery',
            name: 'Vicious Mockery',
            level: 0,
            school: 'Enchantment',
            sourceTier: 'In-Memory Cache'
        };
        cache.set('spell_detail_vicious-mockery', JSON.stringify(dummySpell), 60);

        const result = await SpellController.getSpell(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(200);
        const parsed = JSON.parse(result.response);
        expect(parsed.name).toBe('Vicious Mockery');
        expect(parsed.sourceTier).toBe('In-Memory Cache');
    });

    it('creates a custom spell successfully', async () => {
        // Mock AppDataSource.isInitialized
        Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

        // Mock DB repository for Spell
        const mockSave = vi.fn().mockImplementation(async (entity) => ({ id: 42, ...entity }));
        const mockCreate = vi.fn().mockImplementation((entity) => ({ ...entity }));
        const mockFindOne = vi.fn().mockResolvedValue(null);
        vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
            findOne: mockFindOne,
            create: mockCreate,
            save: mockSave,
        } as any);

        const customSpellBody = {
            name: 'Swamptown Smite',
            level: 1,
            school: 'Evocation',
            castingTime: '1 Bonus Action',
            range: 'Self',
            duration: 'Concentration, up to 1 minute',
            components: 'V',
            concentration: true,
            ritual: false,
            description: 'The next time you hit a creature with a weapon attack, your weapon pulses with swamp fire.',
        };

        vi.spyOn(BaseController, 'readBody').mockResolvedValue(customSpellBody);

        const postReq: Partial<http.IncomingMessage> = {
            url: '/data/create-custom-spell',
            method: 'POST'
        };

        const result = await SpellController.createCustomSpell(
            postReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(201);
        const parsed = JSON.parse(result.response);
        expect(parsed.name).toBe('Swamptown Smite');
        expect(parsed.isCustom).toBe(true);
        expect(parsed.sourceTier).toBe('Custom Database');
    });

    it('validates required fields when creating a custom spell', async () => {
        vi.spyOn(BaseController, 'readBody').mockResolvedValue({ school: 'Evocation' });

        const postReq: Partial<http.IncomingMessage> = {
            url: '/data/create-custom-spell',
            method: 'POST'
        };

        const result = await SpellController.createCustomSpell(
            postReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(400);
        expect(result.response).toContain('Name and description are required');
    });

    describe('upsertSpellsFromCharacter', () => {
        it('saves legacy spells with [Legacy] tag and badge', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const savedSpells: any[] = [];
            const mockSave = vi.fn().mockImplementation(async (spell) => {
                savedSpells.push(spell);
                return { id: savedSpells.length, ...spell };
            });
            const mockCreate = vi.fn().mockImplementation((spell) => ({ ...spell }));
            const mockFindOne = vi.fn().mockResolvedValue(null);

            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne,
                create: mockCreate,
                save: mockSave,
            } as any);

            const spells = [
                {
                    name: 'Eldritch Blast',
                    level: 0,
                    school: 'Evocation',
                    description: '<p>A beam of crackling energy streaks toward a creature within range.</p>',
                    isLegacy: true,
                    sourceId: 1
                }
            ];

            const count = await SpellController.upsertSpellsFromCharacter(spells);
            expect(count).toBe(1);
            expect(savedSpells.length).toBe(1);
            expect(savedSpells[0].source).toContain('[Legacy]');
            expect(savedSpells[0].description).toContain('<strong class="legacy-badge">[Legacy]</strong>');
        });

        it('does not downgrade an existing 2024 spell with a legacy version', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const existing2024Spell = {
                id: 1,
                slug: 'cure-wounds',
                name: 'Cure Wounds',
                level: 1,
                school: 'Abjuration',
                source: "Player's Handbook (2024)",
                description: '<p>A creature you touch regains a number of hit points equal to 2d8 + your spellcasting ability modifier.</p>'
            };

            const mockSave = vi.fn().mockImplementation(async (s) => s);
            const mockFindOne = vi.fn().mockResolvedValue(existing2024Spell);

            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne,
                save: mockSave,
            } as any);

            const legacyImport = [
                {
                    name: 'Cure Wounds',
                    level: 1,
                    school: 'Evocation',
                    description: '<p>A creature you touch regains 1d8 + modifier.</p>',
                    isLegacy: true,
                    sourceId: 1
                }
            ];

            const count = await SpellController.upsertSpellsFromCharacter(legacyImport);
            expect(count).toBe(0);
            expect(mockSave).not.toHaveBeenCalled();
            expect(existing2024Spell.source).toBe("Player's Handbook (2024)");
            expect(existing2024Spell.description).toContain('2d8');
        });

        it('upgrades an existing legacy spell when a 2024 version is imported', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const existingLegacySpell = {
                id: 2,
                slug: 'healing-word',
                name: 'Healing Word',
                level: 1,
                school: 'Evocation',
                source: 'D&D Beyond [Legacy]',
                description: '<p><strong class="legacy-badge">[Legacy]</strong> <em>This spell uses pre-2024 rules.</em></p>\n<p>1d4 healing.</p>'
            };

            const mockSave = vi.fn().mockImplementation(async (s) => s);
            const mockFindOne = vi.fn().mockResolvedValue(existingLegacySpell);

            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne,
                save: mockSave,
            } as any);

            const modernImport = [
                {
                    name: 'Healing Word',
                    level: 1,
                    school: 'Abjuration',
                    description: '<p>A creature of your choice that you can see within range regains hit points equal to 2d4 + spellcasting ability modifier.</p>',
                    source: "Player's Handbook (2024)",
                    sourceId: 145,
                    isLegacy: false
                }
            ];

            const count = await SpellController.upsertSpellsFromCharacter(modernImport);
            expect(count).toBe(1);
            expect(mockSave).toHaveBeenCalled();
            expect(existingLegacySpell.source).not.toContain('[Legacy]');
            expect(existingLegacySpell.description).toContain('2d4');
            expect(existingLegacySpell.description).not.toContain('<strong class="legacy-badge">[Legacy]</strong>');
        });
    });

    describe('getSpells', () => {
        it('returns all spells from database when initialized', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });
            const mockSpells = [
                { id: 1, name: 'Acid Splash', level: 0, school: 'Evocation' },
                { id: 2, name: 'Fireball', level: 3, school: 'Evocation' }
            ];
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                find: vi.fn().mockResolvedValue(mockSpells),
                count: vi.fn().mockResolvedValue(200),
                findOne: vi.fn().mockResolvedValue(null)
            } as any);

            const result = await SpellController.getSpells(
                { url: '/data/get-spells', method: 'GET' } as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const parsed = JSON.parse(result.response);
            expect(parsed.spells).toHaveLength(2);
            expect(parsed.spells[0].name).toBe('Acid Splash');
        });

        it('falls back to seed spells when DB is uninitialized', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: false, configurable: true });

            const result = await SpellController.getSpells(
                { url: '/data/get-spells', method: 'GET' } as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const parsed = JSON.parse(result.response);
            expect(parsed.spells.length).toBeGreaterThan(100);
            expect(parsed.spells.some((s: any) => s.name === 'Fireball')).toBe(true);
        });
    });

    describe('seedDefaultSpellsIfEmpty', () => {
        it('seeds 2024 spells when table is empty', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });
            const mockSave = vi.fn().mockImplementation(async (entities) => entities);
            const mockCreate = vi.fn().mockImplementation((entity) => entity);
            const mockFindOne = vi.fn().mockResolvedValue(null);
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                count: vi.fn().mockResolvedValue(0),
                findOne: mockFindOne,
                create: mockCreate,
                save: mockSave
            } as any);

            await SpellController.seedDefaultSpellsIfEmpty();
            expect(mockSave).toHaveBeenCalled();
        });
    });

    describe('upsertSpellsFromDndBeyond', () => {
        it('extracts classSpells and custom spells from raw D&D Beyond payload', async () => {
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });
            const mockSave = vi.fn().mockImplementation(async (entities) => entities);
            const mockFindOne = vi.fn().mockResolvedValue(null);
            const mockCreate = vi.fn().mockImplementation((entity) => entity);
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne,
                create: mockCreate,
                save: mockSave
            } as any);

            const rawCharacter = {
                classSpells: [
                    {
                        characterClassId: 101,
                        spells: [
                            {
                                definition: {
                                    id: 9999,
                                    name: 'Emergence Blast',
                                    level: 2,
                                    school: 'Evocation',
                                    description: 'A powerful surge of green energy.'
                                }
                            }
                        ]
                    }
                ],
                classes: [
                    {
                        id: 101,
                        definition: { name: 'Sorcerer' }
                    }
                ]
            };

            const count = await SpellController.upsertSpellsFromDndBeyond(rawCharacter);
            expect(count).toBe(1);
            expect(mockSave).toHaveBeenCalled();
        });
    });
});
