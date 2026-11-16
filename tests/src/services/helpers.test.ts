import { afterEach, describe, expect, it, vi } from 'vitest';
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

    describe('displayTitleOnTap', () => {
        afterEach(() => {
            document.body.innerHTML = '';
            vi.restoreAllMocks();
            vi.useRealTimers();
        });

        it('centers the tooltip on the tap and clamps it within viewport bounds', () => {
            vi.useFakeTimers();
            vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(360);
            vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(120);

            const target = document.createElement('button');
            target.title = 'Tooltip text';
            vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
                bottom: 40,
            } as DOMRect);

            // Tap near the right edge: 350 - 60 = 290, clamped to 360 - 120 - 8 = 232
            const rightTap = { touches: [{ clientX: 350 }] } as unknown as TouchEvent;
            Helpers.displayTitleOnTap.call(target, rightTap);

            const tooltip = document.body.lastElementChild as HTMLElement;
            expect(tooltip).not.toBeNull();
            expect(tooltip.textContent).toBe('Tooltip text');
            expect(tooltip.style.position).toBe('fixed');
            expect(tooltip.style.left).toBe('232px');
            expect(tooltip.style.top).toBe('45px');

            // Tap near the left edge: 20 - 60 = -40, clamped to 8
            const leftTap = { touches: [{ clientX: 20 }] } as unknown as TouchEvent;
            Helpers.displayTitleOnTap.call(target, leftTap);

            const leftTooltip = document.body.lastElementChild as HTMLElement;
            expect(leftTooltip.style.left).toBe('8px');

            vi.advanceTimersByTime(3000);
            expect(document.body.children.length).toBe(0);
        });
    });
});
