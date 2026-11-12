import { describe, expect, it, vi } from 'vitest';
import { findSkill, SKILLS } from '../../../src/rules/dnd5e_2024/skills';
import { addCustomSkill, carryCustomSkills, customSkillBonus, removeCustomSkill } from '../../../src/views/characterSheet/services/customSkills';

function character(overrides: any = {}): any {
    return {
        abilities: [
            { abbr: 'STR', modifier: -1 }, { abbr: 'DEX', modifier: 2 }, { abbr: 'CON', modifier: 1 },
            { abbr: 'INT', modifier: 0 }, { abbr: 'WIS', modifier: 3 }, { abbr: 'CHA', modifier: 4 }
        ],
        vitals: { proficiencyBonus: 3 },
        skills: SKILLS.map((s) => ({ name: s.name, stat: s.ability.toUpperCase(), bonus: 0, proficiency: 'none' })),
        ...overrides
    };
}

describe('the skill list', () => {
    it('has the 18 rules skills, and every derived list matches it', async () => {
        expect(SKILLS).toHaveLength(18);
        const { ALL_SKILLS } = await import('../../../src/views/characterCreator/characterCreator.types');
        const { SKILL_META } = await import('../../../src/views/characterSheet/featureDecisions');
        expect(ALL_SKILLS.map((s) => `${s.name}:${s.stat}`)).toEqual(SKILLS.map((s) => `${s.name}:${s.ability}`));
        expect(SKILL_META.find((s) => s.key === 'sleight-of-hand')).toEqual({ name: 'Sleight of Hand', stat: 'DEX', statId: 2, key: 'sleight-of-hand' });
        expect(findSkill('  animal   handling ')?.key).toBe('animal-handling');
        expect(findSkill('Cooking')).toBeUndefined();
    });
});

describe('custom skills', () => {
    it('adds a skill with its bonus from the chosen ability and training', () => {
        const c = character();
        const added = addCustomSkill(c, '  Cooking  ', 'wis');
        expect(added).toEqual({ name: 'Cooking', stat: 'WIS', proficiency: 'none', bonus: 3, custom: true });
        expect(c.skills.at(-1)).toBe(added);
        expect(customSkillBonus(c, 'CHA', 'expertise')).toBe(4 + 6);
    });

    it('refuses empty, too long, unknown-ability, and duplicate names', () => {
        const c = character();
        expect(addCustomSkill(c, '   ', 'WIS')).toBe('Enter a name for the skill.');
        expect(addCustomSkill(c, 'x'.repeat(61), 'WIS')).toMatch(/up to 60/);
        expect(addCustomSkill(c, 'Cooking', 'LUCK')).toBe('Choose the ability the skill uses.');
        expect(addCustomSkill(c, 'stealth', 'DEX')).toBe('stealth is already on this sheet.');
        addCustomSkill(c, 'Cooking', 'WIS');
        expect(addCustomSkill(c, 'COOKING', 'INT')).toBe('COOKING is already on this sheet.');
        expect(c.skills).toHaveLength(19);
    });

    it("removes only the character's own skills", () => {
        const c = character();
        addCustomSkill(c, 'Cooking', 'WIS');
        expect(removeCustomSkill(c, 'Stealth')).toBe(false);
        expect(removeCustomSkill(c, 'Cooking')).toBe(true);
        expect(c.skills).toHaveLength(18);
    });

    it('carries own skills onto a rebuilt character with bonuses from its abilities', () => {
        const before = character();
        addCustomSkill(before, 'Cooking', 'WIS', 'proficient');
        const rebuilt = character({ abilities: [{ abbr: 'WIS', modifier: 5 }], vitals: { proficiencyBonus: 4 } });
        carryCustomSkills(rebuilt, before);
        carryCustomSkills(rebuilt, before);
        expect(rebuilt.skills.filter((s: any) => s.custom)).toEqual([{ name: 'Cooking', stat: 'WIS', proficiency: 'proficient', bonus: 9, custom: true }]);
    });
});

describe('custom skills on the sheet', () => {
    function mount() {
        return import('../../../src/views/characterSheet/components/skills').then(async ({ renderSkills }) => {
            const { initSkillsController } = await import('../../../src/views/characterSheet/controllers/skills.ctrl');
            const c = character();
            document.body.innerHTML = `<div id="sheet"><div id="tab-skills"><div class="skills-container">${renderSkills(c)}</div></div></div>`;
            const save = vi.fn();
            const ctx: any = { sheet: document.getElementById('sheet'), getCharacter: () => c, scheduleDebouncedAutoSave: save };
            initSkillsController(ctx);
            return { c, save };
        });
    }

    it('adds a skill from the form, announces it, and moves focus to its training', async () => {
        const { c, save } = await mount();
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Cooking <b>';
        (document.getElementById('custom-skill-ability') as HTMLSelectElement).value = 'WIS';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        expect(c.skills.at(-1)).toMatchObject({ name: 'Cooking <b>', stat: 'WIS', custom: true });
        expect(document.getElementById('custom-skill-status')!.textContent).toBe('Added Cooking <b> (WIS).');
        expect(document.querySelector('.skill-row-custom .skill-name')!.textContent).toBe('Cooking <b>');
        expect((document.activeElement as HTMLElement).getAttribute('data-skill-index')).toBe('18');
        expect(save).toHaveBeenCalled();
    });

    it('explains a rejected name without changing the skills', async () => {
        const { c, save } = await mount();
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Stealth';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        expect(c.skills).toHaveLength(18);
        expect(document.getElementById('custom-skill-status')!.textContent).toBe('Stealth is already on this sheet.');
        expect(document.getElementById('custom-skill-name')!.getAttribute('aria-invalid')).toBe('true');
        expect(save).not.toHaveBeenCalled();
    });

    it('removes a custom skill with its button and offers none for the rules skills', async () => {
        const { c } = await mount();
        expect(document.querySelectorAll('.skill-remove-btn')).toHaveLength(0);
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Cooking';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        const remove = document.querySelector<HTMLButtonElement>('.skill-remove-btn')!;
        expect(remove.getAttribute('aria-label')).toBe('Remove Cooking');
        remove.click();
        expect(c.skills.some((s: any) => s.name === 'Cooking')).toBe(false);
        expect(document.getElementById('custom-skill-status')!.textContent).toBe('Removed Cooking.');
        expect(document.activeElement?.id).toBe('custom-skill-name');
    });
});
