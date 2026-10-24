import { beforeEach, describe, expect, it } from 'vitest';
import CookieJar from '../../../src/services/cookieJar';

describe('CookieJar Service', () => {
    beforeEach(() => {
        // Clear document cookies
        document.cookie.split(';').forEach((c) => {
            const eqPos = c.indexOf('=');
            const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        });
    });

    it('sets and retrieves string cookie value', () => {
        const future = new Date(Date.now() + 86400_000).toUTCString();
        CookieJar.set('test-cookie', 'hello-world', future);
        expect(CookieJar.get<string>('testCookie')).toBe('hello-world');
    });

    it('sets and retrieves boolean cookie value', () => {
        const future = new Date(Date.now() + 86400_000).toUTCString();
        CookieJar.set('cookies-are-cool', true, future);
        expect(CookieJar.get<boolean>('cookiesAreCool')).toBe(true);
    });

    it('sets and retrieves number cookie value', () => {
        const future = new Date(Date.now() + 86400_000).toUTCString();
        CookieJar.set('visit-count', 42, future);
        expect(CookieJar.get<number>('visitCount')).toBe(42);
    });
});
