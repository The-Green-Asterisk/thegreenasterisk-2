import http from 'http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import BaseController from '../../server/controllers/baseController';
import ItemController from '../../server/controllers/itemController';
import SessionController from '../../server/controllers/sessionController';
import SpellController from '../../server/controllers/spellController';
import AppDataSource from '../../server/services/database';

const OWNER = { id: 7, isAdmin: false };
const STRANGER = { id: 8, isAdmin: false };
const ADMIN = { id: 1, isAdmin: true };

const req = (url: string, method: string) => ({ url, method }) as http.IncomingMessage;
const res = {} as http.ServerResponse;

function mockRepo(rows: Array<Record<string, any>>) {
    const save = vi.fn().mockImplementation(async (entity) => ({ id: 99, ...entity }));
    const findOne = vi.fn().mockImplementation(async ({ where }) =>
        rows.find(r => Object.entries(where).every(([k, v]) => r[k] === v)) ?? null);
    vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
        findOne,
        save,
        // Characters holding copies (none here) and their payloads
        find: vi.fn(async () => []),
        update: vi.fn(),
        create: vi.fn().mockImplementation((entity) => ({ ...entity }))
    } as any);
    return { save, findOne };
}

function loginAs(user: typeof OWNER | undefined) {
    vi.spyOn(SessionController, 'getUser').mockReturnValue(user as any);
}

function sendBody(body: Record<string, any>) {
    vi.spyOn(BaseController, 'readBody').mockResolvedValue(body);
}

beforeEach(() => {
    Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('BaseController.canEditOwned', () => {
    it('lets the creator and admins edit, and nobody else', () => {
        expect(BaseController.canEditOwned(OWNER, 7)).toBe(true);
        expect(BaseController.canEditOwned(STRANGER, 7)).toBe(false);
        expect(BaseController.canEditOwned(ADMIN, 7)).toBe(true);
        expect(BaseController.canEditOwned(undefined, 7)).toBe(false);
    });

    it('treats rows with no creator as admin-only', () => {
        expect(BaseController.canEditOwned(OWNER, null)).toBe(false);
        expect(BaseController.canEditOwned(OWNER, undefined)).toBe(false);
        expect(BaseController.canEditOwned(ADMIN, null)).toBe(true);
    });
});

describe('custom spells', () => {
    const ownSpell = () => ({
        id: 5, slug: 'swamp-bolt', name: 'Swamp Bolt', level: 1, school: 'Evocation', source: 'Custom Homebrew',
        description: 'Old text', isCustom: true, createdById: 7, imageUrl: 'https://img/old.png', damageDice: '2d6', damageType: 'Acid'
    });

    it('requires a login to create one', async () => {
        loginAs(undefined);
        sendBody({ name: 'Swamp Bolt', description: 'Zap' });
        const result = await SpellController.createCustomSpell(req('/data/create-custom-spell', 'POST'), res);
        expect(result.status).toBe(401);
    });

    it('records who created it', async () => {
        loginAs(OWNER);
        const { save } = mockRepo([]);
        sendBody({ name: 'Swamp Bolt', description: 'Zap' });
        const result = await SpellController.createCustomSpell(req('/data/create-custom-spell', 'POST'), res);
        expect(result.status).toBe(201);
        expect(save.mock.calls[0][0].createdById).toBe(7);
        expect(JSON.parse(result.response).createdById).toBe(7);
    });

    it('requires a login to edit one', async () => {
        loginAs(undefined);
        sendBody({ id: 5, name: 'Swamp Bolt', description: 'New text' });
        const result = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(result.status).toBe(401);
    });

    it('lets the creator edit it, keeping its source and owner', async () => {
        loginAs(OWNER);
        const { save } = mockRepo([ownSpell()]);
        sendBody({ id: 5, name: 'Swamp Bolt', level: 2, school: 'Conjuration', description: 'New text', source: 'Something Else', createdById: 8 });
        const result = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(result.status).toBe(200);
        const saved = save.mock.calls[0][0];
        expect(saved.description).toBe('New text');
        expect(saved.level).toBe(2);
        expect(saved.school).toBe('Conjuration');
        expect(saved.source).toBe('Custom Homebrew');
        expect(saved.createdById).toBe(7);
    });

    it('nulls the image and damage the dialog cleared, so the save actually removes them', async () => {
        loginAs(OWNER);
        const { save } = mockRepo([ownSpell()]);
        sendBody({ id: 5, name: 'Swamp Bolt', description: 'No damage now' });
        await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        const saved = save.mock.calls[0][0];
        expect(saved.imageUrl).toBeNull();
        expect(saved.damageDice).toBeNull();
        expect(saved.damageType).toBeNull();
    });

    it("refuses someone else's spell", async () => {
        loginAs(STRANGER);
        const { save } = mockRepo([ownSpell()]);
        sendBody({ id: 5, name: 'Swamp Bolt', description: 'Mine now' });
        const result = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(result.status).toBe(403);
        expect(save).not.toHaveBeenCalled();
    });

    it('lets admins edit any spell, including ones nobody created through the dialog', async () => {
        loginAs(ADMIN);
        const { save } = mockRepo([{ ...ownSpell(), isCustom: false, createdById: null, source: 'D&D Beyond' }]);
        sendBody({ id: 5, name: 'Swamp Bolt', description: 'Admin fix' });
        const result = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(result.status).toBe(200);
        expect(save.mock.calls[0][0].description).toBe('Admin fix');
        expect(save.mock.calls[0][0].source).toBe('D&D Beyond');
    });

    it('returns 404 for a spell that does not exist', async () => {
        loginAs(ADMIN);
        mockRepo([]);
        sendBody({ id: 404, name: 'Ghost', description: 'Boo' });
        const result = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(result.status).toBe(404);
    });

    it('refuses a rename onto another spell, and moves the slug on a free one', async () => {
        loginAs(OWNER);
        mockRepo([ownSpell(), { id: 6, slug: 'fire-bolt', name: 'Fire Bolt' }]);
        sendBody({ id: 5, name: 'Fire Bolt', description: 'Clash' });
        const clash = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(clash.status).toBe(409);

        const { save } = mockRepo([ownSpell()]);
        sendBody({ id: 5, name: 'Bayou Bolt', description: 'Renamed' });
        const renamed = await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(renamed.status).toBe(200);
        expect(save.mock.calls[0][0].slug).toBe('bayou-bolt');
    });

    it('drops cached details for the old name so get-spell serves the edit', async () => {
        loginAs(OWNER);
        mockRepo([ownSpell()]);
        cache.set('spell_detail_swamp-bolt_mixed', '{"stale":true}', 60);
        cache.set('spell_detail_swamp-bolt', '{"stale":true}', 60);
        sendBody({ id: 5, name: 'Bayou Bolt', description: 'Renamed' });
        await SpellController.editCustomSpell(req('/data/edit-custom-spell', 'PUT'), res);
        expect(cache.get('spell_detail_swamp-bolt_mixed')).toBeUndefined();
        expect(cache.get('spell_detail_swamp-bolt')).toBeUndefined();
    });
});

describe('custom items', () => {
    const ownItem = () => ({
        id: 12, slug: 'swamp-cleaver', name: 'Swamp Cleaver', filterType: 'Weapon', category: 'Martial Melee',
        damage: '1d10 Slashing', mastery: 'Cleave', source: 'Custom Homebrew', description: 'Old', isCustom: true, createdById: 7
    });

    it('requires a login to create one', async () => {
        loginAs(undefined);
        sendBody({ name: 'Swamp Cleaver', description: 'Chop' });
        const result = await ItemController.createCustomItem(req('/data/create-custom-item', 'POST'), res);
        expect(result.status).toBe(401);
    });

    it('records who created it', async () => {
        loginAs(OWNER);
        const { save } = mockRepo([]);
        sendBody({ name: 'Lantern of the Bayou', filterType: 'Wondrous item', isMagic: true, rarity: 'Rare', description: 'Glows' });
        const result = await ItemController.createCustomItem(req('/data/create-custom-item', 'POST'), res);
        expect(result.status).toBe(201);
        expect(save.mock.calls[0][0].createdById).toBe(7);
        expect(JSON.parse(result.response).item.createdById).toBe(7);
    });

    it('lets the creator edit it and clears fields the dialog emptied', async () => {
        loginAs(OWNER);
        const { save } = mockRepo([ownItem()]);
        sendBody({ id: 12, name: 'Swamp Cleaver', filterType: 'Weapon', category: 'Martial Melee', damage: '2d6 Slashing', description: 'New', isMagic: true, rarity: 'Rare' });
        const result = await ItemController.editCustomItem(req('/data/edit-custom-item', 'PUT'), res);
        expect(result.status).toBe(200);
        const saved = save.mock.calls[0][0];
        expect(saved.damage).toBe('2d6 Slashing');
        expect(saved.isMagic).toBe(true);
        expect(saved.mastery).toBeNull();
        expect(saved.source).toBe('Custom Homebrew');
        expect(saved.createdById).toBe(7);
    });

    it("refuses someone else's item", async () => {
        loginAs(STRANGER);
        const { save } = mockRepo([ownItem()]);
        sendBody({ id: 12, name: 'Swamp Cleaver', description: 'Mine now' });
        const result = await ItemController.editCustomItem(req('/data/edit-custom-item', 'PUT'), res);
        expect(result.status).toBe(403);
        expect(save).not.toHaveBeenCalled();
    });

    it('lets admins edit any item', async () => {
        loginAs(ADMIN);
        const { save } = mockRepo([{ ...ownItem(), isCustom: false, createdById: null }]);
        sendBody({ id: 12, name: 'Swamp Cleaver', description: 'Admin fix' });
        const result = await ItemController.editCustomItem(req('/data/edit-custom-item', 'PUT'), res);
        expect(result.status).toBe(200);
        expect(save.mock.calls[0][0].description).toBe('Admin fix');
    });

    it('requires an ID to edit', async () => {
        loginAs(OWNER);
        sendBody({ name: 'Swamp Cleaver', description: 'No id' });
        const result = await ItemController.editCustomItem(req('/data/edit-custom-item', 'PUT'), res);
        expect(result.status).toBe(400);
    });
});
