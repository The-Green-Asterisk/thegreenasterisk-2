import { describe, expect, it } from 'vitest';
import Helpers from '../../../src/services/helpers';

describe('Frontend Helpers Service', () => {
    describe('html tagged template', () => {
        it('creates an HTMLElement from a template string with interpolated values', () => {
            const headingText = 'Welcome Adventurer';
            const count = 5;
            const element = Helpers.html`
                <div class="test-container" data-count="${count}">
                    <h1>${headingText}</h1>
                    <p>Subtext</p>
                </div>
            `;

            expect(element).toBeInstanceOf(HTMLElement);
            expect(element.tagName.toLowerCase()).toBe('div');
            expect(element.className).toBe('test-container');
            expect(element.dataset.count).toBe('5');
            expect(element.querySelector('h1')?.textContent).toBe('Welcome Adventurer');
            expect(element.querySelector('p')?.textContent).toBe('Subtext');
        });
    });

    describe('escapeHtml', () => {
        it('escapes html entities, backticks, spaces, and linebreaks', () => {
            const raw = '<script>alert("x")</script>';
            const escaped = Helpers.escapeHtml`${raw}`;
            expect(escaped).toContain('&lt;script&gt;');
            expect(escaped).toContain('&lt;/script&gt;');
        });

        it('replaces linebreaks with <br>', () => {
            const escaped = Helpers.escapeHtml`line 1\nline 2`;
            expect(escaped).toContain('<br>');
        });
    });

    describe('singularize', () => {
        it('handles standard plural forms', () => {
            expect(Helpers.singularize('cats')).toBe('cat');
            expect(Helpers.singularize('dogs')).toBe('dog');
            expect(Helpers.singularize('boxes')).toBe('boxe');
            expect(Helpers.singularize('witches')).toBe('witche');
        });

        it('handles irregular and latin plural endings', () => {
            expect(Helpers.singularize('cacti')).toBe('cactus');
            expect(Helpers.singularize('ivies')).toBe('ivy');
            expect(Helpers.singularize('knives')).toBe('knife');
            expect(Helpers.singularize('wolves')).toBe('wolfe');
            expect(Helpers.singularize('lives')).toBe('lif');
        });

        it('returns original word if no plural rule matches', () => {
            expect(Helpers.singularize('fish')).toBe('fish');
            expect(Helpers.singularize('sword')).toBe('sword');
        });
    });
});
