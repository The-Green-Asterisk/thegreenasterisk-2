import http from 'http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BaseController from '../../server/controllers/baseController';
import SessionController from '../../server/controllers/sessionController';
import SpellController from '../../server/controllers/spellController';
import { propagateItemEdit, propagateSpellEdit, resolveDefinitionLinks } from '../../server/services/characterCopies';
import AppDataSource from '../../server/services/database';
import { differsFrom, ITEM_LOCK_COLUMNS, keepLockedFields, normalizeLockedFields, parseLockedFields, SPELL_LOCK_COLUMNS } from '../../server/services/definitionLocks';

const res = {} as http.ServerResponse;

/** getRepository by entity name (the service) or class (the controllers), each with its own mocks */
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

describe('definition field locks', () => {
    it('reads only keys that are on, and treats bad JSON as none', () => {
        expect(parseLockedFields('{"description":true,"name":false}')).toEqual({ description: true });
        expect(parseLockedFields('not json')).toEqual({});
        expect(parseLockedFields(null)).toEqual({});
    });

    it('stores known keys only, and nothing when none are on', () => {
        expect(normalizeLockedFields({ description: true, bogus: true }, SPELL_LOCK_COLUMNS)).toBe('{"description":true}');
        expect(normalizeLockedFields({ description: false }, SPELL_LOCK_COLUMNS)).toBeNull();
        expect(normalizeLockedFields({ mastery: true }, ITEM_LOCK_COLUMNS)).toBe('{"mastery":true}');
    });

    it('puts every column of a locked field back after a rewrite', () => {
        const row: any = { name: 'Fireball', description: 'Mine', damageDice: '9d6', damageType: 'Fire', lockedFields: '{"damage":true}' };
        const before = { ...row };
        row.description = 'From D&D Beyond';
        row.damageDice = '8d6';
        row.damageType = 'Cold';
        keepLockedFields(row, before, SPELL_LOCK_COLUMNS);
        expect(row.description).toBe('From D&D Beyond');
        expect(row.damageDice).toBe('9d6');
        expect(row.damageType).toBe('Fire');
        expect(differsFrom(row, before)).toBe(true);

        const onlyLocked: any = { damageDice: '9d6', lockedFields: '{"damage":true}' };
        const snap = { ...onlyLocked };
        onlyLocked.damageDice = '1d4';
        keepLockedFields(onlyLocked, snap, SPELL_LOCK_COLUMNS);
        expect(differsFrom(onlyLocked, snap)).toBe(false);
    });
});

describe('D&D Beyond reloads keep locked spell fields', () => {
    it('upgrades a legacy spell from a character pull but leaves its locked description alone', async () => {
        const existing: any = {
            id: 3, slug: 'fireball', name: 'Fireball', level: 3, school: 'Evocation', source: 'Open5e SRD',
            castingTime: '1 Action', range: '150 feet', duration: 'Instantaneous', components: 'V, S, M',
            description: 'House-ruled text', lockedFields: '{"description":true}', isCustom: false
        };
        const save = vi.fn(async (row) => row);
        mockRepos({ Spell: { findOne: vi.fn(async () => existing), save } });

        await SpellController.upsertSpellsFromCharacter([{ name: 'Fireball', level: 3, school: 'Evocation', range: '150 feet', description: 'Official 2024 text', source: 'PHB' }]);

        expect(save).toHaveBeenCalled();
        expect(existing.description).toBe('House-ruled text');
        expect(existing.source).toContain('D&D Beyond');
    });
});

describe('editing a spell saves its field locks', () => {
    it('stores the locks the dialog sent, and keeps the old ones when it sent none', async () => {
        vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1, isAdmin: true } as any);
        const row: any = { id: 3, slug: 'fireball', name: 'Fireball', description: 'Old', isCustom: false, lockedFields: '{"name":true}' };
        const save = vi.fn(async (r) => r);
        mockRepos({
            Spell: { findOne: vi.fn(async ({ where }) => (where.id === 3 || where.slug === 'fireball' ? row : null)), save },
            CharacterSpell: { find: vi.fn(async () => []), save: vi.fn() },
            SavedCharacter: { find: vi.fn(async () => []), update: vi.fn() }
        });

        vi.spyOn(BaseController, 'readBody').mockResolvedValueOnce({ id: 3, name: 'Fireball', description: 'New', lockedFields: { description: true, nope: true } });
        await SpellController.editCustomSpell({ url: '/data/edit-custom-spell', method: 'PUT' } as http.IncomingMessage, res);
        expect(row.lockedFields).toBe('{"description":true}');

        vi.spyOn(BaseController, 'readBody').mockResolvedValueOnce({ id: 3, name: 'Fireball', description: 'Newer' });
        await SpellController.editCustomSpell({ url: '/data/edit-custom-spell', method: 'PUT' } as http.IncomingMessage, res);
        expect(row.lockedFields).toBe('{"description":true}');
    });
});

describe('spell edits reach characters', () => {
    const spell: any = {
        id: 5, name: 'Bayou Bolt', level: 2, school: 'Evocation', castingTime: '1 Action', range: '60 feet', duration: 'Instantaneous',
        components: 'V, S', concentration: false, ritual: false, description: 'New text', damageDice: '3d6', damageType: 'Acid',
        damageScaling: '[{"level":2,"label":"2nd","dice":"3d6","modifier":""}]', imageUrl: 'https://img/new.png'
    };

    it('updates unlocked rows and payload copies, links them, and leaves locked ones alone', async () => {
        const unlockedRow: any = { id: 1, name: 'Swamp Bolt', spellId: 5, locked: false, source: 'Class', savedCharacter: { id: 10 } };
        const unlinkedRow: any = { id: 2, name: 'Swamp Bolt', spellId: null, locked: false, source: 'Class', savedCharacter: { id: 11 } };
        const lockedRow: any = { id: 3, name: 'Swamp Bolt', spellId: 5, locked: true, description: 'Mine', savedCharacter: { id: 12 } };
        const rowSave = vi.fn(async (rows) => rows);
        const payloadUpdate = vi.fn(async () => undefined);
        const payloads: Record<number, any> = {
            10: { spells: [{ name: 'Swamp Bolt', spellId: 5, description: 'Old' }, { name: 'Fire Bolt', description: 'Untouched' }] },
            11: { spells: [{ name: 'swamp bolt', description: 'Old' }] }
        };
        mockRepos({
            CharacterSpell: { find: vi.fn(async () => [unlockedRow, unlinkedRow, lockedRow]), save: rowSave },
            SavedCharacter: {
                find: vi.fn(async () => Object.entries(payloads).map(([id, p]) => ({ id: Number(id), payload: JSON.stringify(p) }))),
                update: payloadUpdate
            }
        });

        const result = await propagateSpellEdit(spell, 'Swamp Bolt');

        expect(result).toEqual({ updated: 2, locked: 1 });
        expect(rowSave.mock.calls[0][0]).toEqual([unlockedRow, unlinkedRow]);
        expect(unlockedRow).toMatchObject({ name: 'Bayou Bolt', description: 'New text', damageDice: '3d6', source: 'Class' });
        expect(unlinkedRow.spellId).toBe(5);
        expect(lockedRow).toMatchObject({ name: 'Swamp Bolt', description: 'Mine' });

        const written = Object.fromEntries((payloadUpdate.mock.calls as any[]).map(([id, { payload }]) => [id, JSON.parse(payload)]));
        expect(written[10].spells[0]).toMatchObject({ name: 'Bayou Bolt', spellId: 5, description: 'New text', imageUrl: 'https://img/new.png' });
        expect(written[10].spells[0].damageScaling[0].dice).toBe('3d6');
        expect(written[10].spells[1]).toEqual({ name: 'Fire Bolt', description: 'Untouched' });
        expect(written[11].spells[0]).toMatchObject({ name: 'Bayou Bolt', spellId: 5 });
        expect(payloadUpdate).toHaveBeenCalledTimes(2);
    });
});

describe('item edits reach characters', () => {
    it('updates weapon rows with combat stats, gear rows without, and skips locked ones', async () => {
        const item: any = { id: 9, name: 'Bayou Cleaver', filterType: 'Weapon', category: 'Martial Melee', damage: '2d6 Slashing', range: '5 ft.', properties: 'Heavy, Two-Handed', mastery: 'Cleave', rarity: 'Rare', isMagic: true, description: 'New' };
        const weaponRow: any = { name: 'Swamp Cleaver', itemId: 9, locked: false, category: 'Martial Melee', damage: '1d10 Slashing', attackBonus: '+5', savedCharacter: { id: 1 } };
        const gearRow: any = { name: 'Swamp Cleaver', itemId: 9, locked: false, category: 'Gear', savedCharacter: { id: 1 } };
        const lockedRow: any = { name: 'Swamp Cleaver', itemId: 9, locked: true, damage: '1d10 Slashing', savedCharacter: { id: 2 } };
        const payloadUpdate = vi.fn(async () => undefined);
        mockRepos({
            CharacterInventoryItem: { find: vi.fn(async () => [weaponRow, gearRow, lockedRow]), save: vi.fn(async (r) => r) },
            SavedCharacter: {
                find: vi.fn(async () => [{ id: 1, payload: JSON.stringify({ weapons: [{ name: 'Swamp Cleaver', itemId: 9, mastery: { name: 'Cleave', unlocked: false } }], equipment: [{ name: 'Swamp Cleaver', itemId: 9, locked: true }] }) }]),
                update: payloadUpdate
            }
        });

        const result = await propagateItemEdit(item, 'Swamp Cleaver');

        expect(result).toEqual({ updated: 2, locked: 1 });
        expect(weaponRow).toMatchObject({ name: 'Bayou Cleaver', damage: '2d6 Slashing', damageDie: '2d6', damageType: 'Slashing', masteryName: 'Cleave', attackBonus: '+5', propertiesJson: '["Heavy","Two-Handed"]' });
        expect(gearRow).toMatchObject({ name: 'Bayou Cleaver', category: 'Martial Melee', isMagic: true });
        expect(gearRow.damage).toBeUndefined();
        expect(lockedRow.name).toBe('Swamp Cleaver');

        const written = JSON.parse((payloadUpdate.mock.calls[0] as any[])[1].payload);
        expect(written.weapons[0]).toMatchObject({ name: 'Bayou Cleaver', properties: ['Heavy', 'Two-Handed'], mastery: { name: 'Cleave', unlocked: false } });
        expect(written.equipment[0]).toEqual({ name: 'Swamp Cleaver', itemId: 9, locked: true });
    });

    it('fits values into the narrower character columns', async () => {
        const row: any = { name: 'Long', itemId: 9, locked: false, damage: '1d4 Piercing', savedCharacter: { id: 1 } };
        mockRepos({
            CharacterInventoryItem: { find: vi.fn(async () => [row]), save: vi.fn(async (r) => r) },
            SavedCharacter: { find: vi.fn(async () => []), update: vi.fn() }
        });
        await propagateItemEdit({ id: 9, name: 'Long', damage: `${'1d4+'.repeat(20)}1 Piercing`, range: 'x'.repeat(80) } as any, 'Long');
        expect(row.damage.length).toBeLessThanOrEqual(50);
        expect(row.range.length).toBeLessThanOrEqual(50);
    });
});

describe('saving a character links its spells and items', () => {
    it('fills in missing spellId / itemId by slug, and keeps links it already has', async () => {
        mockRepos({
            Spell: { find: vi.fn(async () => [{ id: 3, slug: 'fireball' }]) },
            Item: { find: vi.fn(async () => [{ id: 9, slug: 'longsword' }]) }
        });
        const data: any = {
            spells: [{ name: 'Fireball' }, { name: 'Shield', spellId: 4 }, { name: 'Unknown Spell' }],
            weapons: [{ name: 'Longsword' }],
            equipment: [{ name: 'Rope' }]
        };
        await resolveDefinitionLinks(data);
        expect(data.spells.map((s: any) => s.spellId)).toEqual([3, 4, undefined]);
        expect(data.weapons[0].itemId).toBe(9);
        expect(data.equipment[0].itemId).toBeUndefined();
    });
});
