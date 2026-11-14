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

    it('hides the add-a-skill form inside the table footer until the + button is clicked', async () => {
        await mount();
        const form = document.querySelector('.skills-table tfoot .custom-skill-form') as HTMLFormElement;
        const toggleBtn = document.getElementById('custom-skill-toggle-btn') as HTMLButtonElement;
        expect(form).not.toBeNull();
        expect(form.hidden).toBe(true);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');

        toggleBtn.click();
        expect(form.hidden).toBe(false);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement?.id).toBe('custom-skill-name');

        toggleBtn.click();
        expect(form.hidden).toBe(true);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('adds a skill from the form, announces it, and moves focus to its training', async () => {
        const { c, save } = await mount();
        (document.getElementById('custom-skill-toggle-btn') as HTMLButtonElement).click();
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Cooking <b>';
        (document.getElementById('custom-skill-ability') as HTMLSelectElement).value = 'WIS';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        expect(c.skills.at(-1)).toMatchObject({ name: 'Cooking <b>', stat: 'WIS', custom: true });
        expect(document.getElementById('custom-skill-status')!.textContent).toBe('Added Cooking <b> (WIS).');
        expect((document.querySelector('.custom-skill-form') as HTMLFormElement).hidden).toBe(true);
        expect(document.querySelector('.skill-row-custom .skill-name')!.textContent).toBe('Cooking <b>');
        expect((document.activeElement as HTMLElement).getAttribute('data-skill-index')).toBe('18');
        expect(save).toHaveBeenCalled();
    });

    it('explains a rejected name without changing the skills', async () => {
        const { c, save } = await mount();
        (document.getElementById('custom-skill-toggle-btn') as HTMLButtonElement).click();
        const nameInput = document.getElementById('custom-skill-name') as HTMLInputElement;
        nameInput.value = 'Stealth';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        expect(c.skills).toHaveLength(18);
        expect((document.querySelector('.custom-skill-form') as HTMLFormElement).hidden).toBe(false);
        expect(document.getElementById('custom-skill-status')!.textContent).toBe('Stealth is already on this sheet.');
        expect(nameInput.getAttribute('aria-invalid')).toBe('true');
        expect(save).not.toHaveBeenCalled();

        nameInput.value = 'Cooking';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        expect(nameInput.hasAttribute('aria-invalid')).toBe(false);
    });

    it('removes a custom skill with its button and offers none for the rules skills', async () => {
        const { c } = await mount();
        expect(document.querySelectorAll('.skill-remove-btn')).toHaveLength(0);
        (document.getElementById('custom-skill-toggle-btn') as HTMLButtonElement).click();
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Cooking';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));
        const remove = document.querySelector<HTMLButtonElement>('.skill-remove-btn')!;
        expect(remove.getAttribute('aria-label')).toBe('Remove Cooking');
        remove.click();
        expect(c.skills.some((s: any) => s.name === 'Cooking')).toBe(false);
        expect(document.getElementById('custom-skill-status')!.textContent).toBe('Removed Cooking.');
        expect(document.activeElement?.id).toBe('custom-skill-toggle-btn');
    });

    it('preserves All Skills heading and Senses & Proficiencies when adding or removing a skill', async () => {
        const { renderSkills } = await import('../../../src/views/characterSheet/components/skills');
        const { renderSensesAndTraining } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');
        const { initSkillsController } = await import('../../../src/views/characterSheet/controllers/skills.ctrl');
        const c = character({
            vitals: {
                proficiencyBonus: 3,
                passivePerception: 13,
                passiveInvestigation: 10,
                passiveInsight: 13,
                darkvision: '60 ft.'
            },
            proficiencies: {
                armor: ['Light Armor'],
                weapons: ['Simple Weapons'],
                tools: ['Cook\'s Utensils'],
                languages: ['Common']
            }
        });
        document.body.innerHTML = `
            <div id="sheet">
                <div id="tab-skills">
                    <div class="skills-container">
                        <div class="skills-grid">
                            <div class="skills-list">
                                <h3>All Skills</h3>
                                ${renderSkills(c)}
                            </div>
                            <div class="senses-and-training">
                                ${renderSensesAndTraining(c)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const ctx: any = { sheet: document.getElementById('sheet'), getCharacter: () => c, scheduleDebouncedAutoSave: vi.fn() };
        initSkillsController(ctx);

        (document.getElementById('custom-skill-toggle-btn') as HTMLButtonElement).click();
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Cooking';
        (document.getElementById('custom-skill-ability') as HTMLSelectElement).value = 'WIS';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));

        expect(document.querySelector('#tab-skills .skills-list h3')?.textContent).toBe('All Skills');
        expect(document.querySelector('#tab-skills .senses-and-training h3')?.textContent).toBe('Senses & Proficiencies');
        expect(document.querySelector('#tab-skills .senses-and-training')?.textContent).toContain('Passive Perception: 13');
        expect(document.querySelector('#tab-skills .senses-and-training')?.textContent).toContain('Light Armor');

        (document.querySelector('.skill-remove-btn[data-remove-skill="Cooking"]') as HTMLButtonElement).click();
        expect(document.querySelector('#tab-skills .skills-list h3')?.textContent).toBe('All Skills');
        expect(document.querySelector('#tab-skills .senses-and-training h3')?.textContent).toBe('Senses & Proficiencies');
        expect(document.querySelector('#tab-skills .senses-and-training')?.textContent).toContain('Common');
    });

    it('removes a newly added skill from the table even if the character reference was replaced after saving', async () => {
        const { renderSkills } = await import('../../../src/views/characterSheet/components/skills');
        const { initSkillsController } = await import('../../../src/views/characterSheet/controllers/skills.ctrl');
        let current = character();
        document.body.innerHTML = `
            <div id="sheet">
                <div id="tab-skills">
                    <div class="skills-container">
                        <div class="skills-list">
                            <h3>All Skills</h3>
                            ${renderSkills(current)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        const ctx: any = {
            sheet: document.getElementById('sheet'),
            getCharacter: () => current,
            scheduleDebouncedAutoSave: vi.fn(),
            syncSheetStats: () => {
                const list = document.querySelector<HTMLElement>('#tab-skills .skills-list')!;
                list.innerHTML = `<h3>All Skills</h3>${renderSkills(current)}`;
                initSkillsController(ctx);
            }
        };
        initSkillsController(ctx);

        (document.getElementById('custom-skill-toggle-btn') as HTMLButtonElement).click();
        (document.getElementById('custom-skill-name') as HTMLInputElement).value = 'Cooking';
        (document.getElementById('custom-skill-ability') as HTMLSelectElement).value = 'WIS';
        document.querySelector('.custom-skill-form')!.dispatchEvent(new Event('submit', { cancelable: true }));

        expect(current.skills.some((s: any) => s.name === 'Cooking')).toBe(true);
        expect(document.querySelector('.skill-remove-btn[data-remove-skill="Cooking"]')).not.toBeNull();

        // Simulate a background auto-save replacing the active character reference without rebinding
        current = JSON.parse(JSON.stringify(current));

        (document.querySelector('.skill-remove-btn[data-remove-skill="Cooking"]') as HTMLButtonElement).click();
        expect(current.skills.some((s: any) => s.name === 'Cooking')).toBe(false);
        expect(document.querySelector('.skill-remove-btn[data-remove-skill="Cooking"]')).toBeNull();
        expect(document.querySelector('.skill-row-custom')).toBeNull();
        expect(document.querySelector('#tab-skills .skills-table tbody')?.textContent).not.toContain('Cooking');
        expect(document.getElementById('custom-skill-status')?.textContent).toBe('Removed Cooking.');
    });
});
