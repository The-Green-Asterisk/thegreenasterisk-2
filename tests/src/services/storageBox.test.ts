import { beforeEach, describe, expect, it } from 'vitest';
import StorageBox from '../../../src/services/storageBox';

describe('StorageBox Service', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns null for missing keys', () => {
        expect(StorageBox.get('missing-key')).toBeNull();
    });

    it('stores and retrieves strings', () => {
        StorageBox.set('str-key', 'campaign-name');
        expect(StorageBox.get<string>('str-key')).toBe('campaign-name');
    });

    it('stores and retrieves booleans', () => {
        StorageBox.set('bool-true', true);
        expect(StorageBox.get<boolean>('bool-true')).toBe(true);
    });

    it('stores and retrieves numbers', () => {
        StorageBox.set('num-key', 42);
        expect(StorageBox.get<number>('num-key')).toBe(42);
    });

    it('stores and retrieves JSON objects', () => {
        const payload = { id: 1, name: 'Dragon', stats: { hp: 120, ac: 18 } };
        StorageBox.set('dragon', payload);
        expect(StorageBox.get<typeof payload>('dragon')).toEqual(payload);
    });

    it('removes keys correctly', () => {
        StorageBox.set('to-remove', 'temp');
        expect(StorageBox.get('to-remove')).toBe('temp');
        StorageBox.remove('to-remove');
        expect(StorageBox.get('to-remove')).toBeNull();
    });

    it('clears all storage items', () => {
        StorageBox.set('k1', 'v1');
        StorageBox.set('k2', 'v2');
        StorageBox.clear();
        expect(StorageBox.get('k1')).toBeNull();
        expect(StorageBox.get('k2')).toBeNull();
    });
});
