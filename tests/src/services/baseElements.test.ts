import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@views', () => ({
    lightbox: vi.fn(),
    lightboxTemplate: vi.fn(),
}));

import User from '../../../src/entities/User';
import BaseEl from '../../../src/services/baseElements';

describe('BaseElements and String extensions', () => {
    beforeEach(() => {
        localStorage.clear();
        BaseEl.currentUser = undefined;
        BaseEl.sessionKey = '';
    });

    describe('String prototype helpers', () => {
        it('stripScripts removes script tags and their content', () => {
            const raw = '<div>Hello <script>console.log("bad")</script>World</div>';
            expect(raw.stripScripts()).toBe('<div>Hello World</div>');
        });

        it('doubleBreakDivs replaces div tags and inner breaks appropriately', () => {
            const input = '<div>Line 1<br>Line 2</div>';
            expect(input.doubleBreakDivs()).toBe('Line 1<br><br>Line 2');
        });
    });

    describe('Auth state management', () => {
        it('reports not authenticated when sessionKey or user is missing', () => {
            expect(BaseEl.isAuth).toBe(false);
            expect(BaseEl.checkAuth()).toBe(false);
            expect(BaseEl.checkAdmin()).toBe(false);
        });

        it('establishes auth from localStorage correctly', () => {
            const user = new User();
            user.id = 5;
            user.username = 'hero';
            user.isAdmin = true;

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('sessionKey', 'auth_secret%5');

            BaseEl.establishAuth();

            expect(BaseEl.currentUser?.id).toBe(5);
            expect(BaseEl.sessionKey).toBe('auth_secret%5');
            expect(BaseEl.isAuth).toBe(true);
            expect(BaseEl.checkAuth()).toBe(true);
            expect(BaseEl.checkAdmin()).toBe(true);
        });

        it('checkAuth passes currentUser into function argument when authenticated', () => {
            const user = new User();
            user.id = 7;
            user.username = 'paladin';
            user.isAdmin = false;

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('sessionKey', 'key%7');
            BaseEl.establishAuth();

            const result = BaseEl.checkAuth((u) => `User: ${u.username}`);
            expect(result).toBe('User: paladin');
        });

        it('logout clears state and localStorage', () => {
            const user = new User();
            user.id = 1;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('sessionKey', 'key%1');
            BaseEl.establishAuth();

            expect(BaseEl.currentUser).toBeDefined();
            BaseEl.logout();
            expect(BaseEl.currentUser).toBeUndefined();
            expect(BaseEl.sessionKey).toBe('');
            expect(localStorage.getItem('currentUser')).toBeNull();
        });
    });
});
