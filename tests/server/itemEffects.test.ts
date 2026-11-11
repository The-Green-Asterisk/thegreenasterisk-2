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
        const effects = propagate.mock.calls[0][2];
        expect(effects?.previousModifiers).toEqual(seedItemModifiers('Cloak of Protection'));
    });

    it('leaves the effects alone when the dialog sent none', async () => {
        vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1, isAdmin: true } as any);
        const row: any = { id: 4, slug: 'lantern', name: 'Lantern', description: 'Old', isCustom: true, createdById: 1, modifiersJson: '[{"target":"checks.all","type":"bonus","value":1}]' };
        mockRepos({ Item: { findOne: vi.fn(async ({ where }) => (where.id === 4 || where.slug === row.slug ? row : null)), save: vi.fn(async (r) => r) } });
        const propagate = vi.spyOn(copies, 'propagateItemEdit').mockResolvedValue({ updated: 0, locked: 0 });

        vi.spyOn(BaseController, 'readBody').mockResolvedValue({ id: 4, name: 'Lantern', description: 'New' });
        await ItemController.editCustomItem(editReq(), res);

        expect(row.modifiersJson).toBe('[{"target":"checks.all","type":"bonus","value":1}]');
        expect(propagate.mock.calls[0][2]).toBeUndefined();
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

        await propagateItemEdit(item, 'Belt of Might', { previousModifiers: previous });

        const written = Object.fromEntries((update.mock.calls as any[]).map(([id, { payload }]) => [id, JSON.parse(payload)]));
        expect(written[1].equipment[0].modifiers).toEqual([{ target: 'abilities.str', type: 'set', value: 23 }]);
        expect(written[2].equipment[0].modifiers).toEqual(previous);
        expect(written[2].equipment[1].modifiers).toEqual([]);
    });
});
