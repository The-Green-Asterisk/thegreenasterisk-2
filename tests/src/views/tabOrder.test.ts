import { describe, expect, it } from 'vitest';
import { leadsWithSpells, sheetTabOrder } from '../../../src/views/characterSheet/components/tabOrder';

const classes = (...list: Array<[string, number, string?]>) => ({ classes: list.map(([name, level, subclass]) => ({ name, level, subclass })) });

describe('sheet tab order', () => {
    it('leads with Spells for full and pact casters', () => {
        expect(leadsWithSpells(classes(['Wizard', 5]))).toBe(true);
        expect(leadsWithSpells(classes(['Cleric', 1]))).toBe(true);
        expect(leadsWithSpells(classes(['Warlock', 3]))).toBe(true);
    });

    it('leads with Weapons for half casters, third casters, and non-casters', () => {
        expect(leadsWithSpells(classes(['Paladin', 5]))).toBe(false);
        expect(leadsWithSpells(classes(['Ranger', 5]))).toBe(false);
        expect(leadsWithSpells(classes(['Fighter', 7, 'Eldritch Knight']))).toBe(false);
        expect(leadsWithSpells(classes(['Rogue', 7, 'Arcane Trickster']))).toBe(false);
        expect(leadsWithSpells(classes(['Barbarian', 3]))).toBe(false);
        expect(leadsWithSpells({ classes: [] })).toBe(false);
    });

    it('goes by the highest-level class, and the first listed on a tie', () => {
        expect(leadsWithSpells(classes(['Bard', 9], ['Warlock', 10]))).toBe(true);
        expect(leadsWithSpells(classes(['Fighter', 5], ['Wizard', 3]))).toBe(false);
        expect(leadsWithSpells(classes(['Paladin', 4], ['Sorcerer', 4]))).toBe(false);
        expect(leadsWithSpells(classes(['Sorcerer', 4], ['Paladin', 4]))).toBe(true);
    });

    it('puts the rest in the order from the issue', () => {
        expect(sheetTabOrder(classes(['Wizard', 5]))).toEqual(['spells', 'weapons', 'actions', 'skills', 'equipment', 'features', 'details']);
        expect(sheetTabOrder(classes(['Fighter', 5]))).toEqual(['weapons', 'spells', 'actions', 'skills', 'equipment', 'features', 'details']);
    });

    it('renders the tabs in that order with the first one active', async () => {
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');
        for (const [cls, first] of [['Wizard', 'spells'], ['Paladin', 'weapons']] as const) {
            const c: any = { ...JSON.parse(JSON.stringify(darvellData)), classes: [{ name: cls, level: 5 }] };
            const doc = new DOMParser().parseFromString(`<div>${renderSheetContent(c)}</div>`, 'text/html');
            const buttons = Array.from(doc.querySelectorAll('.tab-nav .tab-btn'));
            expect(buttons.map((b) => b.id)).toEqual(sheetTabOrder(c).map((t) => `btn-tab-${t}`));
            expect(buttons.filter((b) => b.classList.contains('active')).map((b) => b.id)).toEqual([`btn-tab-${first}`]);
            expect(buttons[0].getAttribute('aria-selected')).toBe('true');
            expect(Array.from(doc.querySelectorAll('.tab-pane.active')).map((p) => p.id)).toEqual([`tab-${first}`]);
            expect(doc.querySelectorAll('.tab-pane').length).toBe(7);
        }
    });
});
