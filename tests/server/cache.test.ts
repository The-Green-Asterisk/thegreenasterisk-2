import { beforeEach, describe, expect, it } from 'vitest';
import cache from '../../server/cache';

describe('Server Cache', () => {
    beforeEach(() => {
        cache.flushAll();
    });

    it('sets and gets cache items', () => {
        cache.set('test-key', { foo: 'bar' });
        expect(cache.get('test-key')).toEqual({ foo: 'bar' });
    });

    it('returns undefined for non-existent items', () => {
        expect(cache.get('non-existent')).toBeUndefined();
    });

    it('deletes cache items', () => {
        cache.set('to-delete', 123);
        expect(cache.get('to-delete')).toBe(123);
        cache.del('to-delete');
        expect(cache.get('to-delete')).toBeUndefined();
    });
});
