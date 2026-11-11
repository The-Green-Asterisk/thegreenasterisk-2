import http from 'http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import BaseController from '../../server/controllers/baseController';
import ItemController from '../../server/controllers/itemController';
import SessionController from '../../server/controllers/sessionController';
import * as copies from '../../server/services/characterCopies';
import { propagateItemEdit } from '../../server/services/characterCopies';
import AppDataSource from '../../server/services/database';
import { itemMechanicsRules, sanitizeItemModifiers, seedItemModifiers } from '../../server/services/database/itemMechanics';

const res = {} as http.ServerResponse;

function mockRepos(repos: Record<string, Record<string, any>>) {
    vi.spyOn(AppDataSource, 'getRepository').mockImplementation(((target: any) => {
        const name = typeof target === 'string' ? target : target?.name;
        return repos[name] ?? {};
    }) as any);
}

beforeEach(() => {
    Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('item effects data', () => {
    it('keeps well-formed modifiers with the fields items use, and drops the rest', () => {
        const stored = sanitizeItemModifiers([
            { target: 'abilities.str', type: 'set', value: 19, junk: true },
            { target: 'vitals.ac', type: 'bonus', value: 2, requires: 'no-armor-or-shield' },
            { target: 'spells.dc', type: 'bonus', value: '{{plus}}' },
            { target: 'vitals.ac', type: 'explode', value: 1 },
            { type: 'bonus', value: 1 },
            'nonsense',
            { target: 'senses.darkvision', type: 'set', value: 60, requires: 'underwater', description: 'Sees in the dark' }
        ]);
        expect(JSON.parse(stored!)).toEqual([
            { target: 'abilities.str', type: 'set', value: 19 },
            { target: 'vitals.ac', type: 'bonus', value: 2, requires: 'no-armor-or-shield' },
            { target: 'spells.dc', type: 'bonus', value: '{{plus}}' },
            { target: 'senses.darkvision', type: 'set', value: 60, description: 'Sees in the dark' }
        ]);
    });

    it('stores an empty list as "no effects" and anything else as nothing', () => {
        expect(sanitizeItemModifiers([])).toBe('[]');
        expect(sanitizeItemModifiers(undefined)).toBeNull();
        expect(sanitizeItemModifiers({ target: 'vitals.ac' })).toBeNull();
    });

    it("lets an item's own empty list override the seed list, while a null one still uses it", () => {
        const rules = itemMechanicsRules([
            { name: 'Cloak of Protection', modifiersJson: '[]' },
            { name: 'Ring of Protection', modifiersJson: null }
        ]);
        expect(rules.find(r => r.name === 'Cloak of Protection')?.modifiers).toEqual([]);
        expect(rules.find(r => r.name === 'Ring of Protection')?.modifiers).toHaveLength(2);
    });

    it('finds seed effects for "+N" variants by their base name', () => {
        expect(seedItemModifiers('Rod of the Pact Keeper, +2')?.[0]).toMatchObject({ target: 'spells.attack', value: '{{plus}}' });
        expect(seedItemModifiers('Something Unseeded')).toBeUndefined();
    });
});

describe('editing an item\'s effects', () => {
    const editReq = () => ({ url: '/data/edit-custom-item', method: 'PUT' }) as http.IncomingMessage;

    it('saves the effects, clears the rules cache, and hands propagation the seed effects it had', async () => {
        vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1, isAdmin: true } as any);
        const row: any = { id: 4, slug: 'cloak-of-protection', name: 'Cloak of Protection', description: 'Old', isCustom: false, modifiersJson: null };
        mockRepos({ Item: { findOne: vi.fn(async ({ where }) => (where.id === 4 || where.slug === row.slug ? row : null)), save: vi.fn(async (r) => r) } });
        const propagate = vi.spyOn(copies, 'propagateItemEdit').mockResolvedValue({ updated: 0, locked: 0 });
        cache.set('dnd_rules_all', 'stale', 60);

        vi.spyOn(BaseController, 'readBody').mockResolvedValue({
            id: 4, name: 'Cloak of Protection', description: 'New', modifiers: [{ target: 'vitals.ac', type: 'bonus', value: 2 }]
        });
        const result = await ItemController.editCustomItem(editReq(), res);

        expect(result.status).toBe(200);
        expect(JSON.parse(row.modifiersJson)).toEqual([{ target: 'vitals.ac', type: 'bonus', value: 2 }]);
        expect(cache.get('dnd_rules_all')).toBeUndefined();
        const options = propagate.mock.calls[0][2];
        expect(options?.effects?.previousModifiers).toEqual(seedItemModifiers('Cloak of Protection'));
        expect(options?.charges).toBe(false);
    });

    it('leaves the effects alone when the dialog sent none', async () => {
        vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1, isAdmin: true } as any);
        const row: any = { id: 4, slug: 'lantern', name: 'Lantern', description: 'Old', isCustom: true, createdById: 1, modifiersJson: '[{"target":"checks.all","type":"bonus","value":1}]' };
        mockRepos({ Item: { findOne: vi.fn(async ({ where }) => (where.id === 4 || where.slug === row.slug ? row : null)), save: vi.fn(async (r) => r) } });
        const propagate = vi.spyOn(copies, 'propagateItemEdit').mockResolvedValue({ updated: 0, locked: 0 });

        vi.spyOn(BaseController, 'readBody').mockResolvedValue({ id: 4, name: 'Lantern', description: 'New' });
        await ItemController.editCustomItem(editReq(), res);

        expect(row.modifiersJson).toBe('[{"target":"checks.all","type":"bonus","value":1}]');
        expect(propagate.mock.calls[0][2]?.effects).toBeUndefined();
    });
});

describe('effects reach characters', () => {
    it('gives unlocked copies the new effects and freezes the old ones onto locked copies without their own', async () => {
        const item: any = { id: 9, name: 'Belt of Might', filterType: 'Wondrous item', modifiersJson: '[{"target":"abilities.str","type":"set","value":23}]', description: 'x' };
        const previous = [{ target: 'abilities.str', type: 'set', value: 21 }];
        const update = vi.fn(async () => undefined);
        mockRepos({
            CharacterInventoryItem: {
                find: vi.fn(async () => [
                    { name: 'Belt of Might', itemId: 9, locked: false, category: 'Wondrous item', savedCharacter: { id: 1 } },
                    { name: 'Belt of Might', itemId: 9, locked: true, category: 'Wondrous item', savedCharacter: { id: 2 } }
                ]),
                save: vi.fn(async (r) => r)
            },
            SavedCharacter: {
                find: vi.fn(async () => [
                    { id: 1, payload: JSON.stringify({ equipment: [{ name: 'Belt of Might', itemId: 9 }] }) },
                    { id: 2, payload: JSON.stringify({ equipment: [{ name: 'Belt of Might', itemId: 9, locked: true }, { name: 'Belt of Might', itemId: 9, locked: true, modifiers: [] }] }) }
                ]),
                update
            }
        });

        await propagateItemEdit(item, 'Belt of Might', { effects: { previousModifiers: previous } });

        const written = Object.fromEntries((update.mock.calls as any[]).map(([id, { payload }]) => [id, JSON.parse(payload)]));
        expect(written[1].equipment[0].modifiers).toEqual([{ target: 'abilities.str', type: 'set', value: 23 }]);
        expect(written[2].equipment[0].modifiers).toEqual(previous);
        expect(written[2].equipment[1].modifiers).toEqual([]);
    });
});

describe('item charges', () => {
    it('stores a whole number of charges with a known reset, and nothing otherwise', async () => {
        const { sanitizeItemCharges } = await import('../../server/services/database/itemMechanics');
        expect(JSON.parse(sanitizeItemCharges({ max: 7, resetOn: 'dawn', resetLabel: ' 1d6 + 1 at dawn ', used: 3 })!)).toEqual({ max: 7, resetOn: 'dawn', resetLabel: '1d6 + 1 at dawn' });
        expect(JSON.parse(sanitizeItemCharges({ max: 3, resetOn: 'whenever' })!)).toEqual({ max: 3, resetOn: 'long' });
        expect(sanitizeItemCharges({ max: 0 })).toBeNull();
        expect(sanitizeItemCharges({ max: 2.5 })).toBeNull();
        expect(sanitizeItemCharges({ max: 100 })).toBeNull();
        expect(sanitizeItemCharges(null)).toBeNull();
    });

    it('saves charges from the dialog, clears them when it sends none, and tells propagation', async () => {
        vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1, isAdmin: true } as any);
        const row: any = { id: 7, slug: 'wand-of-mud', name: 'Wand of Mud', description: 'x', isCustom: true, createdById: 1, chargesJson: null };
        mockRepos({ Item: { findOne: vi.fn(async ({ where }) => (where.id === 7 || where.slug === row.slug ? row : null)), save: vi.fn(async (r) => r) } });
        const propagate = vi.spyOn(copies, 'propagateItemEdit').mockResolvedValue({ updated: 0, locked: 0 });

        vi.spyOn(BaseController, 'readBody').mockResolvedValueOnce({ id: 7, name: 'Wand of Mud', description: 'x', charges: { max: 7, resetOn: 'dawn' } });
        await ItemController.editCustomItem({ url: '/data/edit-custom-item', method: 'PUT' } as http.IncomingMessage, res);
        expect(JSON.parse(row.chargesJson)).toEqual({ max: 7, resetOn: 'dawn' });
        expect(propagate.mock.calls[0][2]?.charges).toBe(true);

        vi.spyOn(BaseController, 'readBody').mockResolvedValueOnce({ id: 7, name: 'Wand of Mud', description: 'x', charges: null });
        await ItemController.editCustomItem({ url: '/data/edit-custom-item', method: 'PUT' } as http.IncomingMessage, res);
        expect(row.chargesJson).toBeNull();
    });

    it('fills in charges from a D&D Beyond pull only where the item has none', async () => {
        const rows: Record<string, any> = {
            'wand-of-web': { id: 1, slug: 'wand-of-web', name: 'Wand of Web', description: 'Webs', source: 'D&D Beyond', isCustom: false, chargesJson: null },
            'wand-of-mud': { id: 2, slug: 'wand-of-mud', name: 'Wand of Mud', description: 'Mud', source: 'D&D Beyond', isCustom: false, chargesJson: '{"max":3,"resetOn":"long"}' }
        };
        const save = vi.fn(async (r) => r);
        mockRepos({ Item: { findOne: vi.fn(async ({ where }) => rows[where.slug] ?? null), save, create: vi.fn((e) => ({ ...e })) } });

        await ItemController.upsertItemsFromCharacter([], [
            { name: 'Wand of Web', type: 'Wand', isMagic: true, rarity: 'Uncommon', charges: { max: 7, used: 2, resetOn: 'dawn' } },
            { name: 'Wand of Mud', type: 'Wand', isMagic: true, rarity: 'Uncommon', charges: { max: 7, used: 0, resetOn: 'dawn' } },
            { name: 'Wand of Fog', type: 'Wand', isMagic: true, rarity: 'Uncommon', charges: { max: 5, used: 0, resetOn: 'dawn' } }
        ]);

        expect(JSON.parse(rows['wand-of-web'].chargesJson)).toEqual({ max: 7, resetOn: 'dawn' });
        expect(JSON.parse(rows['wand-of-mud'].chargesJson)).toEqual({ max: 3, resetOn: 'long' });
        const created = save.mock.calls.map((c: any[]) => c[0]).find((r: any) => r.name === 'Wand of Fog');
        expect(JSON.parse(created.chargesJson)).toEqual({ max: 5, resetOn: 'dawn' });
    });

    it('gives unlocked copies the new charges, keeping what they spent, and skips a weapon\'s equipment twin', async () => {
        const update = vi.fn(async () => undefined);
        mockRepos({
            CharacterInventoryItem: { find: vi.fn(async () => [{ name: 'Staff of Bogs', itemId: 3, locked: false, damage: '1d6 Bludgeoning', savedCharacter: { id: 1 } }]), save: vi.fn(async (r) => r) },
            SavedCharacter: {
                find: vi.fn(async () => [{ id: 1, payload: JSON.stringify({
                    weapons: [{ name: 'Staff of Bogs', itemId: 3, charges: { max: 10, used: 8, resetOn: 'dawn' } }],
                    equipment: [{ name: 'Staff of Bogs', itemId: 3 }]
                }) }]),
                update
            }
        });
        await propagateItemEdit({ id: 3, name: 'Staff of Bogs', damage: '1d6 Bludgeoning', chargesJson: '{"max":6,"resetOn":"dawn","resetLabel":"1d6 at dawn"}', description: 'x' } as any, 'Staff of Bogs', { charges: true });
        const written = JSON.parse((update.mock.calls[0] as any[])[1].payload);
        expect(written.weapons[0].charges).toEqual({ max: 6, resetOn: 'dawn', resetLabel: '1d6 at dawn', used: 6 });
        expect(written.equipment[0].charges).toBeUndefined();
    });
});
