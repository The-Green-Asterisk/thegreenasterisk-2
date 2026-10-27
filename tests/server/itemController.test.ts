import http from 'http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import BaseController from '../../server/controllers/baseController';
import ItemController from '../../server/controllers/itemController';
import AppDataSource from '../../server/services/database';

describe('ItemController', () => {
    let mockReq: Partial<http.IncomingMessage>;
    let mockRes: Partial<http.ServerResponse>;

    beforeEach(() => {
        mockReq = {
            url: '/data/get-item?name=Dagger',
            method: 'GET'
        };
        mockRes = {};
        cache.del('item_detail_dagger');
        cache.del('item_detail_potion-of-healing');
    });

    it('returns 400 when name is missing', async () => {
        mockReq.url = '/data/get-item';
        const result = await ItemController.getItem(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );
        expect(result.status).toBe(400);
        expect(result.response).toContain('error');
    });

    it('returns cached item when present in cache', async () => {
        const dummyItem = {
            sourceTier: 'In-Memory Cache',
            item: {
                slug: 'dagger',
                name: 'Dagger',
                filterType: 'Weapon',
                category: 'Simple Melee',
                damage: '1d4 Piercing'
            }
        };
        cache.set('item_detail_dagger', JSON.stringify(dummyItem), 60);

        const result = await ItemController.getItem(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(200);
        const parsed = JSON.parse(result.response);
        expect(parsed.item.name).toBe('Dagger');
        expect(parsed.sourceTier).toBe('In-Memory Cache');
    });

    it('creates a custom item successfully', async () => {
        Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

        const mockSave = vi.fn().mockImplementation(async (entity) => ({ id: 77, ...entity }));
        const mockCreate = vi.fn().mockImplementation((entity) => ({ ...entity }));
        const mockFindOne = vi.fn().mockResolvedValue(null);
        vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
            findOne: mockFindOne,
            create: mockCreate,
            save: mockSave,
        } as any);

        const customItemBody = {
            name: 'Moonlight Dagger',
            filterType: 'Weapon',
            rarity: 'Rare',
            isMagic: true,
            requiresAttunement: true,
            category: 'Simple Melee',
            damage: '1d4 + 1 Piercing',
            range: '20/60 ft.',
            properties: 'Finesse, Light, Thrown',
            mastery: 'Nick',
            description: 'This finely forged dagger glows faintly in the dark and deals additional radiant damage under the night sky.',
        };

        vi.spyOn(BaseController, 'readBody').mockResolvedValue(customItemBody);

        const postReq: Partial<http.IncomingMessage> = {
            url: '/data/create-custom-item',
            method: 'POST'
        };

        const result = await ItemController.createCustomItem(
            postReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(201);
        const parsed = JSON.parse(result.response);
        expect(parsed.item.name).toBe('Moonlight Dagger');
        expect(parsed.item.isCustom).toBe(true);
        expect(parsed.sourceTier).toBe('Custom Database');
    });

    it('validates required fields when creating a custom item', async () => {
        vi.spyOn(BaseController, 'readBody').mockResolvedValue({ rarity: 'Rare' });

        const postReq: Partial<http.IncomingMessage> = {
            url: '/data/create-custom-item',
            method: 'POST'
        };

        const result = await ItemController.createCustomItem(
            postReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(400);
        expect(result.response).toContain('Name and description are required');
    });

    it('correctly parses D&D Beyond html with more-info-content and magic-item-image', async () => {
        const fakeHtml = `
            <html>
                <h1 class="page-title">Potion of Healing</h1>
                <div class="more-info details-more-info">
                    <div class="detail-content">
                        <div class="image">
                            <img src="https://www.dndbeyond.com/avatars/magic-item.png" class="magic-item-image" alt="Potion of Healing" />
                        </div>
                        <div class="more-info-content">
                            <p>You regain 2d4 + 2 hit points when you drink this potion.</p>
                        </div>
                    </div>
                </div>
            </html>
        `;

        // Test static method directly
        const parsed = (ItemController as any).parseDndBeyondItemHtml(fakeHtml, 'Potion of Healing', 'potion-of-healing', 8960641);
        expect(parsed).toBeDefined();
        expect(parsed.name).toBe('Potion of Healing');
        expect(parsed.description).toContain('You regain 2d4 + 2 hit points when you drink this potion.');
        expect(parsed.description).not.toContain('<div class="image">');
        expect(parsed.imageUrl).toBe('https://www.dndbeyond.com/avatars/magic-item.png');
        expect(parsed.isMagic).toBe(true);
    });
});
