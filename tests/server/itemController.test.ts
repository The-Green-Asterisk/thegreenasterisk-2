import http from 'http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import BaseController from '../../server/controllers/baseController';
import ItemController, { getItemSearchAliases, isPotionOrOil } from '../../server/controllers/itemController';
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

    it('correctly identifies mundane weapons and does not classify Dagger as magic even if page contains navbar magic links', async () => {
        const fakeDaggerHtml = `
            <html>
                <nav class="site-nav"><a href="/magic-items">Magic Items</a><a href="/equipment">Equipment</a></nav>
                <h1 class="page-title">Dagger</h1>
                <div class="details-container-content-description-text">
                    <p>Finesse, Light, Thrown (range 20/60). Damage: 1d4 piercing.</p>
                </div>
            </html>
        `;

        const parsed = (ItemController as any).parseDndBeyondItemHtml(
            fakeDaggerHtml,
            'Dagger',
            'dagger',
            undefined,
            'https://www.dndbeyond.com/equipment/dagger'
        );
        expect(parsed).toBeDefined();
        expect(parsed.name).toBe('Dagger');
        expect(parsed.isMagic).toBe(false);
        expect(parsed.rarity).toBe('Common');
        expect(parsed.filterType).toBe('Equipment');
    });

    it('identifies potions and oils correctly with isPotionOrOil', () => {
        expect(isPotionOrOil('Potion of Healing (Greater)')).toBe(true);
        expect(isPotionOrOil('Potion of Greater Healing')).toBe(true);
        expect(isPotionOrOil('Potion of Superior Healing')).toBe(true);
        expect(isPotionOrOil('Oil of Slipperiness')).toBe(true);
        expect(isPotionOrOil('Dagger')).toBe(false);
        expect(isPotionOrOil('Greatsword')).toBe(false);
    });

    it('generates proper aliases for Potion of Healing (Greater)', () => {
        const aliases = getItemSearchAliases('Potion of Healing (Greater)');
        expect(aliases).toContain('Potion of Greater Healing');
        expect(aliases).toContain('Potion of Healing, Greater');
        expect(aliases).toContain('Potion of Healing');
    });

    it('never assigns weapon damage or weapon filterType to Potion of Healing (Greater) in D&D Beyond html parser', () => {
        const fakeGreaterPotionHtml = `
            <html>
                <h1 class="page-title">Potion of Healing (Greater)</h1>
                <div class="more-info details-more-info">
                    <div class="more-info-content">
                        <p>You regain 4d4 + 4 hit points when you drink this potion.</p>
                    </div>
                </div>
            </html>
        `;

        const parsed = (ItemController as any).parseDndBeyondItemHtml(
            fakeGreaterPotionHtml,
            'Potion of Healing (Greater)',
            'potion-of-healing-greater',
            undefined,
            'https://www.dndbeyond.com/magic-items/potion-of-healing-greater'
        );

        expect(parsed).toBeDefined();
        expect(parsed.name).toBe('Potion of Healing (Greater)');
        expect(parsed.filterType).toBe('Potion');
        expect(parsed.category).toBe('Potion');
        expect(parsed.damage).toBeUndefined();
        expect(parsed.range).toBeUndefined();
        expect(parsed.properties).toBeUndefined();
        expect(parsed.isMagic).toBe(true);
        expect(parsed.rarity).toBe('Uncommon');
    });

    it('auto-heals misclassified potion database records on searchItems', async () => {
        Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

        const misclassifiedPotion = {
            id: 99,
            slug: 'potion-of-healing-greater',
            name: 'Potion of Healing (Greater)',
            filterType: 'Weapon',
            category: 'Simple Melee',
            damage: '4d4 hit',
            range: 'Reach 5 ft.',
            properties: 'Finesse',
            mastery: 'Nick',
            rarity: 'Common',
            isMagic: false,
            description: '<p>You regain 4d4 + 4 hit points.</p>'
        };

        const mockSave = vi.fn().mockImplementation(async (item) => item);
        const mockFind = vi.fn().mockResolvedValue([misclassifiedPotion]);

        vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
            find: mockFind,
            save: mockSave,
        } as any);

        const searchReq: Partial<http.IncomingMessage> = {
            url: '/data/search-items?q=potion&type=all',
            method: 'GET'
        };

        const result = await ItemController.searchItems(
            searchReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(200);
        expect(mockSave).toHaveBeenCalled();
        expect(misclassifiedPotion.filterType).toBe('Potion');
        expect(misclassifiedPotion.category).toBe('Potion');
        expect(misclassifiedPotion.damage).toBeUndefined();
        expect(misclassifiedPotion.range).toBeUndefined();
        expect(misclassifiedPotion.properties).toBeUndefined();
        expect(misclassifiedPotion.mastery).toBeUndefined();
        expect(misclassifiedPotion.isMagic).toBe(true);
        expect(misclassifiedPotion.rarity).toBe('Uncommon');
    });

    it('filters out legacy pre-2024 weapons and equipment during upsertItemsFromCharacter', async () => {
        Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

        const savedItems: any[] = [];
        const mockSave = vi.fn().mockImplementation(async (item) => {
            savedItems.push(item);
            return { id: savedItems.length, ...item };
        });
        const mockCreate = vi.fn().mockImplementation((item) => ({ ...item }));
        const mockFindOne = vi.fn().mockResolvedValue(null);

        vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
            findOne: mockFindOne,
            create: mockCreate,
            save: mockSave,
        } as any);

        const weapons = [
            {
                name: 'Longsword (2014)',
                isLegacy: true,
                sourceId: 1,
                damage: '1d8 Slashing'
            },
            {
                name: 'Greatsword',
                sourceId: 145,
                isLegacy: false,
                damage: '2d6 Slashing'
            }
        ];

        const equipment = [
            {
                name: 'Healing Potion (Legacy)',
                isLegacy: true,
                sourceId: 1,
                type: 'Potion'
            },
            {
                name: 'Plate Armor',
                sourceId: 145,
                isLegacy: false,
                type: 'Armor'
            }
        ];

        const savedCount = await ItemController.upsertItemsFromCharacter(weapons, equipment);

        expect(savedCount).toBe(2);
        expect(savedItems.some((i) => i.name.includes('(2014)'))).toBe(false);
        expect(savedItems.some((i) => i.name.includes('(Legacy)'))).toBe(false);
        expect(savedItems.some((i) => i.name === 'Greatsword')).toBe(true);
        expect(savedItems.some((i) => i.name === 'Plate Armor')).toBe(true);
    });
});
