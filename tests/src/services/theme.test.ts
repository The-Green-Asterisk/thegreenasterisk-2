import { beforeEach, describe, expect, it } from 'vitest';
import { currentTheme, savedTheme, setTheme } from '../../../src/services/theme';

describe('Theme Service', () => {
    beforeEach(() => {
        localStorage.clear();
        delete document.documentElement.dataset.theme;
    });

    it('returns null when no theme has been saved in localStorage', () => {
        expect(savedTheme()).toBeNull();
    });

    it('sets and retrieves light theme correctly', () => {
        setTheme('light');
        expect(savedTheme()).toBe('light');
        expect(currentTheme()).toBe('light');
        expect(document.documentElement.dataset.theme).toBe('light');
    });

    it('sets and retrieves dark theme correctly', () => {
        setTheme('dark');
        expect(savedTheme()).toBe('dark');
        expect(currentTheme()).toBe('dark');
        expect(document.documentElement.dataset.theme).toBe('dark');
    });
});
