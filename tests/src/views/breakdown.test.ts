import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEED_ITEM_MECHANICS } from '../../../server/services/database/itemMechanics';
import { applyStatModifier } from '../../../src/rules/dnd5e_2024/statModifierEvaluator';
import { setItemRules } from '../../../src/services/classRules';
import { breakdownFor, describeBreakdown, saveBreakdown, skillBreakdown } from '../../../src/views/characterSheet/services/breakdown';
import { addCustomSkill } from '../../../src/views/characterSheet/services/customSkills';
import { applyMagicalItemBonuses } from '../../../src/views/characterSheet/services/magicItemBonuses';

const ABBRS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const NAMES: Record<string, string> = { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' };

function siteChar(equipment: any[] = []): any {
    return {
        source: 'site', level: 5, name: 'T',
        abilities: ABBRS.map((abbr) => ({ name: NAMES[abbr], abbr, score: 10, baseScore: 10, bonus: 0, modifier: 0, save: abbr === 'DEX' ? 3 : 0, proficientSave: abbr === 'DEX' })),
        skills: [
            { name: 'Athletics', stat: 'STR', bonus: 1, proficiency: 'none' },
            { name: 'Stealth', stat: 'DEX', bonus: 3, proficiency: 'proficient' }
        ],
        checkExtras: Object.fromEntries(ABBRS.map((a) => [a, { trained: 0, untrained: 1, parts: [{ label: 'Jack of All Trades', value: 1, untrainedOnly: true }] }])),
        vitals: { armorClass: 10, initiative: 0, speed: '30 ft.', proficiencyBonus: 3, spellcastingAbility: 'Charisma', spellSaveDc: 11, spellAttackBonus: 3, passivePerception: 11, passiveInvestigation: 10, passiveInsight: 10 },
        weapons: [], actions: [], equipment
    };
}
const item = (name: string, extra: any = {}) => ({ name, quantity: 1, equipped: true, type: 'Wondrous item', requiresAttunement: true, attuned: true, ...extra });
const skill = (c: any, name: string) => c.skills.find((s: any) => s.name === name);
const counted = (lines: any[]) => lines.filter((l) => !l.overridden).reduce((sum, l) => sum + l.value, 0);

describe('breakdowns', () => {
    beforeEach(() => setItemRules(SEED_ITEM_MECHANICS as any));
    afterEach(() => setItemRules(null));

    it('lists ability, proficiency, and named parts, and always adds up to the number', () => {
        const c = siteChar();
        const stealth = skillBreakdown(c, skill(c, 'Stealth'));
        expect(stealth.title).toBe('Stealth (DEX) +3');
        expect(stealth.lines).toEqual([
            { label: 'DEX modifier (DEX 10)', value: 0 },
            { label: 'Proficiency', value: 3 },
            { label: 'Jack of All Trades', value: 1, overridden: 'Proficiency' }
        ]);
        expect(counted(stealth.lines)).toBe(3);
        const athletics = skillBreakdown(c, skill(c, 'Athletics'));
        expect(athletics.lines).toEqual([{ label: 'STR modifier (STR 10)', value: 0 }, { label: 'Jack of All Trades', value: 1 }]);
    });

    it('puts what it cannot name on an Other line so the total still matches', () => {
        const c = siteChar();
        skill(c, 'Athletics').bonus = 4;
        const lines = skillBreakdown(c, skill(c, 'Athletics')).lines;
        expect(lines.at(-1)).toEqual({ label: 'Other', value: 3 });
        c.source = 'dndbeyond';
        expect(skillBreakdown(c, skill(c, 'Athletics')).lines.at(-1)).toEqual({ label: 'Other (D&D Beyond)', value: 3 });
        // Saved before the parts were named: the amounts are inferred from the rules skills, with generic labels
        delete c.checkExtras;
        expect(skillBreakdown(c, skill(c, 'Athletics')).lines).toEqual([
            { label: 'STR modifier (STR 10)', value: 0 }, { label: 'Half proficiency when untrained', value: 4 }
        ]);
    });

    it('shows items by name, and a giant strength belt overriding the natural score', () => {
        const c = siteChar([item('Stone of Good Luck'), item('Belt of Fire Giant Strength')]);
        addCustomSkill(c, 'Arm Wrestling', 'STR');
        applyMagicalItemBonuses(c);
        const b = skillBreakdown(c, skill(c, 'Arm Wrestling'));
        expect(b.total).toBe(skill(c, 'Arm Wrestling').bonus);
        expect(b.lines).toEqual([
            { label: 'STR modifier (STR 10)', value: 0, overridden: 'Belt of Fire Giant Strength' },
            { label: 'Belt of Fire Giant Strength (STR 25)', value: 7 },
            { label: 'Jack of All Trades', value: 1 },
            { label: 'Stone of Good Luck', value: 1 }
        ]);
        expect(counted(b.lines)).toBe(b.total);
        const save = saveBreakdown(c, c.abilities[1]);
        expect(save.title).toBe('Dexterity saving throw +4');
        expect(save.lines).toEqual([{ label: 'DEX modifier (DEX 10)', value: 0 }, { label: 'Proficiency', value: 3 }, { label: 'Stone of Good Luck', value: 1 }]);
    });

    it('names sheet choices that add to a skill or a save, and forgets them when undone', () => {
        const c = siteChar();
        applyStatModifier(c, { target: 'skills.stealth', type: 'bonus', value: 2 } as any, 1, 'Cunning');
        applyStatModifier(c, { target: 'saves.all', type: 'ability_mod', abilitySource: 'cha' } as any, 1, 'Aura of Protection');
        applyStatModifier(c, { target: 'saves.wis', type: 'bonus', value: 1 } as any, 1, 'Iron Mind');
        expect(skillBreakdown(c, skill(c, 'Stealth')).lines).toContainEqual({ label: 'Cunning', value: 2 });
        expect(saveBreakdown(c, c.abilities[4]).lines).toEqual([
            { label: 'WIS modifier (WIS 10)', value: 0 }, { label: 'Aura of Protection', value: 0 }, { label: 'Iron Mind', value: 1 }
        ]);
        applyStatModifier(c, { target: 'skills.stealth', type: 'bonus', value: 2 } as any, -1, 'Cunning');
        applyStatModifier(c, { target: 'saves.wis', type: 'bonus', value: 1 } as any, -1, 'Iron Mind');
        expect(c.skillExtras.Stealth).toEqual([]);
        expect(c.saveExtras.WIS).toEqual([]);
        expect(skill(c, 'Stealth').bonus).toBe(3);
    });

    it('finds a number by kind and key, and reads as one sentence', () => {
        const c = siteChar();
        expect(breakdownFor(c, 'save', 'dex')?.total).toBe(3);
        expect(breakdownFor(c, 'skill', 'Nope')).toBeNull();
        expect(breakdownFor(null, 'skill', 'Stealth')).toBeNull();
        expect(describeBreakdown(skillBreakdown(c, skill(c, 'Stealth')))).toBe('From DEX modifier (DEX 10) +0, Proficiency +3. Total +3. Jack of All Trades +1 overridden by Proficiency.');
    });
});

describe('breakdown pop-up', () => {
    let ctx: any;
    let c: any;

    beforeEach(async () => {
        vi.useFakeTimers();
        const { renderSkills } = await import('../../../src/views/characterSheet/components/skills');
        const { renderAbilityCards } = await import('../../../src/views/characterSheet/components/abilities');
        const { initBreakdownController } = await import('../../../src/views/characterSheet/controllers/breakdown.ctrl');
        c = siteChar();
        document.body.innerHTML = `<div id="sheet"><div class="abilities-container">${renderAbilityCards(c)}</div><div id="tab-skills"><div class="skills-container">${renderSkills(c)}</div></div></div>`;
        ctx = { sheet: document.getElementById('sheet'), getCharacter: () => c, scheduleDebouncedAutoSave: vi.fn() };
        initBreakdownController(ctx);
    });
    afterEach(() => {
        vi.useRealTimers();
        document.querySelector('.stat-breakdown')?.remove();
    });

    const button = (kind: string, key: string) => document.querySelector<HTMLButtonElement>(`.stat-breakdown-btn[data-breakdown-kind="${kind}"][data-breakdown-key="${key}"]`)!;
    const popover = () => document.querySelector<HTMLElement>('.stat-breakdown');

    it('describes each number for screen readers without any gesture', () => {
        const btn = button('skill', 'Stealth');
        expect(btn.getAttribute('aria-label')).toBe('Stealth bonus +3');
        const desc = document.getElementById(btn.getAttribute('aria-describedby')!)!;
        expect(desc.textContent).toContain('From DEX modifier (DEX 10) +0, Proficiency +3.');
        expect(button('save', 'DEX').getAttribute('aria-label')).toBe('Dexterity saving throw +3');
    });

    it('opens after a second of hovering and closes when the pointer leaves', () => {
        const btn = button('skill', 'Stealth');
        btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        vi.advanceTimersByTime(999);
        expect(popover()).toBeNull();
        vi.advanceTimersByTime(1);
        expect(popover()?.querySelector('.stat-breakdown-title')?.textContent).toBe('Stealth (DEX) +3');
        expect(popover()?.querySelectorAll('tbody tr').length).toBe(3);
        expect(popover()?.querySelector('tr.is-overridden .stat-breakdown-note')?.textContent).toBe('overridden by Proficiency');
        btn.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
        vi.advanceTimersByTime(250);
        expect(popover()).toBeNull();
    });

    it('opens on keyboard focus and closes on Escape, keeping focus on the number', () => {
        const btn = button('save', 'DEX');
        btn.focus();
        btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        vi.advanceTimersByTime(1000);
        expect(popover()?.querySelector('.stat-breakdown-title')?.textContent).toBe('Dexterity saving throw +3');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(popover()).toBeNull();
        expect(document.activeElement).toBe(btn);
    });

    it('opens on press and hold, swallows the tap that ends it, and leaves a plain tap alone', () => {
        const btn = button('skill', 'Athletics');
        const clicks = vi.fn();
        btn.addEventListener('click', clicks);
        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', clientX: 10, clientY: 10 }));
        vi.advanceTimersByTime(500);
        expect(popover()).not.toBeNull();
        btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(clicks).not.toHaveBeenCalled();
        document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
        expect(popover()).toBeNull();

        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', clientX: 10, clientY: 10 }));
        vi.advanceTimersByTime(200);
        btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch' }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        vi.advanceTimersByTime(1000);
        expect(popover()).toBeNull();
        expect(clicks).toHaveBeenCalledTimes(1);
    });
});
