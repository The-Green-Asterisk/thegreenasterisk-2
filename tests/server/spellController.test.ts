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
});
