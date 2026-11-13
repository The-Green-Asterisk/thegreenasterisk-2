import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SEED_ITEM_MECHANICS } from '../../../server/services/database/itemMechanics';
import { applyStatModifier } from '../../../src/rules/dnd5e_2024/statModifierEvaluator';
import { setItemRules } from '../../../src/services/classRules';
import { parseDndBeyondCharacter } from '../../../src/views/characterSheet/characterAdapter';
import { applyMagicalItemBonuses } from '../../../src/views/characterSheet/services/magicItemBonuses';
import { addCustomSkill, carryCustomSkills, checkExtrasFor, customSkillBonus } from '../../../src/views/characterSheet/services/customSkills';

const ABBRS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

/** A site character (PB +3, every score 10) whose untrained rules skills carry Jack of All Trades (+1). */
function siteChar(equipment: any[] = [], checkExtras?: any): any {
    return {
        source: 'site', level: 5, name: 'T',
        abilities: ABBRS.map((abbr) => ({ name: abbr, abbr, score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false })),
        skills: [
            { name: 'Athletics', stat: 'STR', bonus: 1, proficiency: 'none' },
            { name: 'Stealth', stat: 'DEX', bonus: 3, proficiency: 'proficient' },
            { name: 'Perception', stat: 'WIS', bonus: 1, proficiency: 'none' }
        ],
        vitals: { armorClass: 10, initiative: 0, speed: '30 ft.', proficiencyBonus: 3, spellcastingAbility: 'Charisma', spellSaveDc: 11, spellAttackBonus: 3, passivePerception: 11, passiveInvestigation: 10, passiveInsight: 10 },
        weapons: [], actions: [], equipment,
        ...(checkExtras ? { checkExtras } : {})
    };
}
const item = (name: string, extra: any = {}) => ({ name, quantity: 1, equipped: true, type: 'Wondrous item', requiresAttunement: true, attuned: true, ...extra });
const skill = (c: any, name: string) => c.skills.find((s: any) => s.name === name);

describe('skill bonuses react to what the character gains during play', () => {
    beforeEach(() => setItemRules(SEED_ITEM_MECHANICS as any));
    afterEach(() => setItemRules(null));

    it("works out an older character's check extras from its rules skills", () => {
        const c = siteChar();
        c.vitals._itemSkillBonuses = { Athletics: 2 };
        c.skills[0].bonus += 2;
        expect(checkExtrasFor(c).WIS).toEqual({ trained: 0, untrained: 1 });
    });

    it('gives a custom skill Jack of All Trades only while untrained', () => {
        const c = siteChar();
        expect(customSkillBonus(c, 'INT', 'none')).toBe(1);
        expect(customSkillBonus(c, 'INT', 'proficient')).toBe(3);
        expect(customSkillBonus(c, 'INT', 'expertise')).toBe(6);
    });

    it('layers items over a custom skill like any other, and takes them off again', () => {
        const c = siteChar([item('Stone of Good Luck'), item('Belt of Fire Giant Strength')]);
        addCustomSkill(c, 'Arm Wrestling', 'STR');
        applyMagicalItemBonuses(c);
        // STR 25 (+7) from the belt, +1 to every check from the stone, +1 Jack of All Trades
        expect(skill(c, 'Arm Wrestling').bonus).toBe(7 + 1 + 1);
        expect(skill(c, 'Athletics').bonus).toBe(7 + 1 + 1);
        c.equipment.forEach((e: any) => { e.equipped = false; e.attuned = false; });
        applyMagicalItemBonuses(c);
        expect(skill(c, 'Arm Wrestling').bonus).toBe(1);
        expect(skill(c, 'Athletics').bonus).toBe(1);
    });

    it('picks up an item already worn when the skill is added mid-game', () => {
        const c = siteChar([item('Stone of Good Luck')]);
        applyMagicalItemBonuses(c);
        addCustomSkill(c, 'Cooking', 'WIS');
        applyMagicalItemBonuses(c);
        applyMagicalItemBonuses(c);
        expect(skill(c, 'Cooking').bonus).toBe(skill(c, 'Perception').bonus);
    });

    it('keeps Jack of All Trades and item bonuses when a sheet choice raises an ability', () => {
        const c = siteChar([], { STR: { trained: 0, untrained: 1 } });
        addCustomSkill(c, 'Arm Wrestling', 'STR');
        applyStatModifier(c, { target: 'abilities.str', type: 'bonus', value: 2 } as any, 1, 'ASI');
        expect(skill(c, 'Athletics').bonus).toBe(2);
        expect(skill(c, 'Arm Wrestling').bonus).toBe(2);
        applyStatModifier(c, { target: 'abilities.str', type: 'bonus', value: 2 } as any, -1, 'ASI');
        expect(skill(c, 'Athletics').bonus).toBe(1);
    });

    it('applies half proficiency from a sheet choice to every untrained skill, custom ones and later ones included', () => {
        const extras = Object.fromEntries(ABBRS.map((a) => [a, { trained: 0, untrained: 0 }]));
        const c = siteChar([], extras);
        c.skills.forEach((s: any) => { s.bonus -= s.proficiency === 'none' ? 1 : 0; });
        addCustomSkill(c, 'Cooking', 'WIS');
        applyStatModifier(c, { target: 'skills.unproficient', type: 'half_proficiency' } as any, 1, 'Jack of All Trades');
        expect(skill(c, 'Cooking').bonus).toBe(1);
        expect(skill(c, 'Perception').bonus).toBe(1);
        expect(skill(c, 'Stealth').bonus).toBe(3);
        addCustomSkill(c, 'Lore: The Many Worlds', 'INT');
        expect(skill(c, 'Lore: The Many Worlds').bonus).toBe(1);
        applyStatModifier(c, { target: 'skills.unproficient', type: 'half_proficiency' } as any, -1, 'Jack of All Trades');
        expect(skill(c, 'Cooking').bonus).toBe(0);
        expect(c.checkExtras.WIS.untrained).toBe(0);
    });

    it('lets a feature or item aimed at a custom skill reach it by slug', () => {
        const c = siteChar();
        addCustomSkill(c, 'Lore: The Many Worlds', 'INT');
        applyStatModifier(c, { target: 'skills.lore-the-many-worlds', type: 'bonus', value: 2 } as any, 1, 'Sage');
        expect(skill(c, 'Lore: The Many Worlds').bonus).toBe(3);
    });

    it("gives a D&D Beyond character's custom skills its Jack of All Trades and check bonuses", () => {
        const bard = parseDndBeyondCharacter({
            id: 555004, name: 'Darvell', baseHitPoints: 100,
            classes: [{ level: 10, definition: { id: 1, name: 'Bard', hitDice: 8, sources: [{ sourceId: 1 }], classFeatures: [{ id: 10292181, name: 'Jack of All Trades' }] } }],
            stats: [8, 15, 12, 10, 13, 15].map((value, i) => ({ id: i + 1, value })),
            modifiers: {
                class: [{ type: 'half-proficiency', subType: 'ability-checks', componentId: 10292181 }],
                item: [{ type: 'bonus', subType: 'ability-checks', value: 1, componentId: 900 }, { type: 'bonus', subType: 'wisdom-ability-checks', value: 2, componentId: 901 }]
            },
            inventory: [], spells: {}
        } as any, '555004') as any;
        // PB +4 at level 10: half is 2; +1 to all checks; +2 to Wisdom checks
        expect(bard.checkExtras.WIS).toMatchObject({ trained: 3, untrained: 5 });
        expect(bard.checkExtras.STR).toMatchObject({ trained: 1, untrained: 3 });
        expect(bard.checkExtras.WIS.parts).toEqual([
            { label: 'Item', value: 1 }, { label: 'Item', value: 2 }, { label: 'Jack of All Trades', value: 2, untrainedOnly: true }
        ]);
        const before = { skills: [
            { name: 'Cooking', stat: 'WIS', bonus: 0, proficiency: 'none', custom: true },
            { name: 'Haggling', stat: 'CHA', bonus: 0, proficiency: 'proficient', custom: true }
        ] } as any;
        carryCustomSkills(bard, before);
        expect(skill(bard, 'Cooking').bonus).toBe(1 + 5);
        expect(skill(bard, 'Haggling').bonus).toBe(2 + 4 + 1);
        expect(skill(bard, 'Perception').bonus).toBe(skill(bard, 'Cooking').bonus);
    });
});
