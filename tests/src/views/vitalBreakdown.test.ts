import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SEED_ITEM_MECHANICS } from '../../../server/services/database/itemMechanics';
import { applyStatModifier } from '../../../src/rules/dnd5e_2024/statModifierEvaluator';
import { setItemRules } from '../../../src/services/classRules';
import { parseDndBeyondCharacter } from '../../../src/views/characterSheet/characterAdapter';
import { breakdownFor, vitalBreakdown } from '../../../src/views/characterSheet/services/breakdown';
import { applyMagicalItemBonuses } from '../../../src/views/characterSheet/services/magicItemBonuses';

const ABBRS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const NAMES: Record<string, string> = { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' };

function siteChar(equipment: any[] = []): any {
    return {
        source: 'site', level: 5, name: 'T',
        abilities: ABBRS.map((abbr) => ({ name: NAMES[abbr], abbr, score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false })),
        skills: [{ name: 'Perception', stat: 'WIS', bonus: 3, proficiency: 'proficient' }, { name: 'Insight', stat: 'WIS', bonus: 0, proficiency: 'none' }, { name: 'Investigation', stat: 'INT', bonus: 0, proficiency: 'none' }],
        vitals: {
            armorClass: 18, initiative: 3, speed: '30 ft.', maxHp: 44, currentHp: 44, proficiencyBonus: 3, spellcastingAbility: 'Charisma',
            spellSaveDc: 11, spellAttackBonus: 3, passivePerception: 18, passiveInvestigation: 10, passiveInsight: 10
        },
        vitalParts: {
            ac: [{ label: 'Chain Mail', value: 16 }, { label: 'Shield', value: 2 }],
            initiative: [{ label: 'Alert', value: 3 }],
            speed: [{ label: 'Base (Human)', value: 30 }],
            maxHp: [{ label: 'Fighter hit dice (10 + 6 × 4)', value: 34 }, { label: 'CON modifier × 5 levels', value: 0 }, { label: 'Tough', value: 10 }],
            passivePerception: [{ label: 'Observant', value: 5 }]
        },
        weapons: [], actions: [], equipment
    };
}
const item = (name: string, extra: any = {}) => ({ name, quantity: 1, equipped: true, type: 'Wondrous item', requiresAttunement: true, attuned: true, ...extra });
const counted = (lines: any[]) => lines.filter((l) => !l.overridden).reduce((sum, l) => sum + l.value, 0);

describe('vital breakdowns', () => {
    beforeEach(() => setItemRules(SEED_ITEM_MECHANICS as any));
    afterEach(() => setItemRules(null));

    it('lists the recorded parts and the items worn on the sheet, adding up to each number', () => {
        const c = siteChar([item('Cloak of Protection'), item('Stone of Good Luck')]);
        applyMagicalItemBonuses(c);
        const ac = vitalBreakdown(c, 'ac');
        expect(ac.title).toBe(`Armor Class ${c.vitals.armorClass}`);
        expect(ac.lines).toEqual([{ label: 'Chain Mail', value: 16 }, { label: 'Shield', value: 2 }, { label: 'Cloak of Protection', value: 1 }]);
        expect(counted(ac.lines)).toBe(c.vitals.armorClass);
        const init = vitalBreakdown(c, 'initiative');
        expect(init.lines).toEqual([{ label: 'DEX modifier (DEX 10)', value: 0 }, { label: 'Alert', value: 3 }, { label: 'Stone of Good Luck', value: 1 }]);
        expect(counted(init.lines)).toBe(c.vitals.initiative);
        const hp = vitalBreakdown(c, 'maxHp');
        expect(hp.title).toBe('Hit point maximum 44');
        expect(counted(hp.lines)).toBe(44);
        const perception = vitalBreakdown(c, 'passivePerception');
        expect(perception.lines.slice(0, 3)).toEqual([{ label: 'Base', value: 10 }, { label: 'Perception bonus', value: c.skills[0].bonus }, { label: 'Observant', value: 5 }]);
        expect(counted(perception.lines)).toBe(c.vitals.passivePerception);
    });

    it('builds spell numbers from base, proficiency, and ability, and counts only the best non-stacking item', () => {
        const c = siteChar();
        c.vitals.spellSaveDc = 13;
        c.itemEffectParts = [{ item: 'Rod of the Pact Keeper, +2', target: 'spells.dc', value: 2 }, { item: 'Wand of the War Mage, +1', target: 'spells.dc', value: 1 }];
        const dc = vitalBreakdown(c, 'spellSaveDc');
        expect(dc.lines).toEqual([
            { label: 'Base', value: 8 }, { label: 'Proficiency', value: 3 }, { label: 'CHA modifier (CHA 10)', value: 0 },
            { label: 'Rod of the Pact Keeper, +2', value: 2 }, { label: 'Wand of the War Mage, +1', value: 1, overridden: 'Rod of the Pact Keeper, +2' }
        ]);
        expect(counted(dc.lines)).toBe(13);
        expect(vitalBreakdown(c, 'spellAttackBonus').lines[0]).toEqual({ label: 'Proficiency', value: 3 });
    });

    it('shows a speed multiplier as the feet it adds, and overridden recorded parts struck out', () => {
        const c = siteChar();
        c.vitals.speed = '80 ft. (Fly 60 ft.)';
        c.itemEffectParts = [{ item: 'Boots of Striding', target: 'vitals.speed', value: 10 }, { item: 'Boots of Speed', target: 'vitals.speedMultiplier', value: 2 }];
        const speed = vitalBreakdown(c, 'speed');
        expect(speed.title).toBe('Walking speed 80 ft.');
        expect(speed.lines).toEqual([{ label: 'Base (Human)', value: 30 }, { label: 'Boots of Striding', value: 10 }, { label: 'Boots of Speed (×2)', value: 40 }]);
        c.vitalParts.maxHp = [{ label: 'Hit dice', value: 30, overriddenBy: 'Hit point override (D&D Beyond)' }, { label: 'Hit point override (D&D Beyond)', value: 44 }];
        expect(vitalBreakdown(c, 'maxHp').lines).toEqual([{ label: 'Hit dice', value: 30, overridden: 'Hit point override (D&D Beyond)' }, { label: 'Hit point override (D&D Beyond)', value: 44 }]);
    });

    it('names sheet choices that change a vital, and forgets them when undone', () => {
        const c = siteChar();
        applyStatModifier(c, { target: 'vitals.ac', type: 'bonus', value: 1 } as any, 1, 'Defense');
        applyStatModifier(c, { target: 'vitals.passivePerception', type: 'advantage' } as any, 1, 'Keen Senses');
        applyStatModifier(c, { target: 'vitals.speed', type: 'bonus', value: 10 } as any, 1, 'Fast Movement');
        applyStatModifier(c, { target: 'spells.dc', type: 'bonus', value: 1 } as any, 1, 'Spell Sniper');
        expect(c.vitalParts.ac).toContainEqual({ label: 'Defense', value: 1 });
        expect(c.vitalParts.passivePerception).toContainEqual({ label: 'Keen Senses: Advantage', value: 5 });
        expect(c.vitalParts.speed).toContainEqual({ label: 'Fast Movement', value: 10 });
        expect(counted(vitalBreakdown(c, 'speed').lines)).toBe(40);
        expect(vitalBreakdown(c, 'spellSaveDc').lines).toContainEqual({ label: 'Spell Sniper', value: 1 });
        applyStatModifier(c, { target: 'vitals.ac', type: 'bonus', value: 1 } as any, -1, 'Defense');
        applyStatModifier(c, { target: 'vitals.passivePerception', type: 'advantage' } as any, -1, 'Keen Senses');
        expect(c.vitalParts.ac).toEqual([{ label: 'Chain Mail', value: 16 }, { label: 'Shield', value: 2 }]);
        expect(c.vitalParts.passivePerception).toEqual([{ label: 'Observant', value: 5 }]);
        expect(c.vitals.armorClass).toBe(18);
    });

    it("names an imported character's armor, shield, cloak, feats, and hit dice", () => {
        const c = parseDndBeyondCharacter({
            id: 777, name: 'Vale', baseHitPoints: 44,
            classes: [{ level: 5, definition: { id: 1, name: 'Fighter', hitDice: 10, sources: [{ sourceId: 145 }], classFeatures: [] } }],
            stats: [16, 14, 14, 10, 12, 8].map((value, i) => ({ id: i + 1, value })),
            feats: [{ definition: { id: 501, name: 'Alert' } }, { definition: { id: 502, name: 'Observant' } }, { definition: { id: 503, name: 'Tough' } }],
            modifiers: {
                feat: [
                    { type: 'proficiency', subType: 'initiative', componentId: 501 },
                    { type: 'bonus', subType: 'passive-perception', value: 5, componentId: 502 },
                    { type: 'bonus', subType: 'hit-points-per-level', value: 2, componentId: 503 }
                ],
                item: [{ type: 'bonus', subType: 'armor-class', value: 1, componentId: 900 }, { type: 'bonus', subType: 'saving-throws', value: 1, componentId: 900 }]
            },
            inventory: [
                { id: 1, equipped: true, quantity: 1, definition: { id: 800, name: 'Chain Mail', filterType: 'Armor', armorClass: 16, armorTypeId: 3 } },
                { id: 2, equipped: true, quantity: 1, definition: { id: 801, name: 'Shield', filterType: 'Armor', armorClass: 2, armorTypeId: 4 } },
                { id: 3, equipped: true, isAttuned: true, quantity: 1, definition: { id: 900, name: 'Cloak of Protection', filterType: 'Wondrous item', canAttune: true } }
            ],
            spells: {}
        } as any, '777') as any;
        expect(c.vitals.armorClass).toBe(19);
        expect(c.vitalParts.ac).toEqual([{ label: 'Chain Mail', value: 16 }, { label: 'Shield', value: 2 }, { label: 'Cloak of Protection', value: 1 }]);
        expect(c.vitalParts.initiative).toEqual([{ label: 'Alert (proficiency)', value: 3 }]);
        expect(c.vitalParts.passivePerception).toEqual([{ label: 'Observant', value: 5 }]);
        expect(c.vitalParts.maxHp).toEqual([
            { label: 'Hit dice (D&D Beyond)', value: 44 }, { label: 'CON modifier × 5 levels', value: 10 }, { label: 'Tough (+2 × 5)', value: 10 }
        ]);
        expect(c.saveExtras.all).toEqual([{ label: 'Cloak of Protection', value: 1 }]);
        for (const key of ['ac', 'initiative', 'speed', 'maxHp', 'passivePerception', 'passiveInsight', 'passiveInvestigation', 'spellSaveDc', 'spellAttackBonus']) {
            const b = breakdownFor(c, 'vital', key)!;
            expect(b.lines.some((l) => l.label.startsWith('Other'))).toBe(false);
            expect(counted(b.lines)).toBe(b.total);
        }
    });

    it('renders each vital as a breakdown button that the sync re-renders', async () => {
        const { renderVitalNumber, renderVitalsSection } = await import('../../../src/views/characterSheet/components/vitals');
        const c = siteChar();
        const html = renderVitalsSection(c);
        for (const key of ['ac', 'initiative', 'speed', 'spellSaveDc', 'spellAttackBonus', 'passivePerception', 'passiveInvestigation', 'passiveInsight', 'maxHp']) {
            expect(html).toContain(`data-breakdown-kind="vital" data-breakdown-key="${key}"`);
        }
        expect(renderVitalNumber(c, 'speed')).toContain('>30 ft.</button>');
        expect(renderVitalNumber(c, 'initiative')).toContain('>+3</button>');
        expect(renderVitalNumber(c, 'ac')).toContain('aria-label="Armor Class 18"');
        const { describeBreakdown, formatTotal, vitalBreakdown: vb } = await import('../../../src/views/characterSheet/services/breakdown');
        expect(formatTotal(vb(c, 'ac'))).toBe('18');
        expect(formatTotal(vb(c, 'speed'))).toBe('30 ft.');
        expect(formatTotal(vb(c, 'initiative'))).toBe('+3');
        expect(describeBreakdown(vb(c, 'maxHp'))).toContain('Total 44.');
    });

    it("breaks down weapon attacks on both paths, and ability scores with items", async () => {
        const { abilityScoreBreakdown, weaponAttackBreakdown } = await import('../../../src/views/characterSheet/services/breakdown');
        const site = siteChar([item('Belt of Fire Giant Strength'), item('Longsword +1', { type: 'Weapon', requiresAttunement: false })]);
        site.weapons = [{ name: '+1 Longsword', quantity: 1, equipped: true, category: 'Martial Melee', damage: '1d8 Slashing', damageType: 'Slashing', damageDie: '1d8', attackBonus: '+0', toHitModifier: 0, range: 'Reach 5 ft.', properties: ['Versatile'] }];
        applyMagicalItemBonuses(site);
        const atk = weaponAttackBreakdown(site, site.weapons[0]);
        expect(atk.total).toBe(site.weapons[0].toHitModifier);
        expect(atk.lines.find((l: any) => l.label === 'STR modifier')?.value).toBe(7);
        expect(atk.lines).toContainEqual({ label: 'Proficiency', value: 3 });
        expect(counted(atk.lines)).toBe(atk.total);
        const str = abilityScoreBreakdown(site, site.abilities[0]);
        expect(str.title).toBe('Strength 25 (+7)');
        expect(str.lines).toEqual([
            { label: 'Base score', value: 10, overridden: 'Belt of Fire Giant Strength' },
            { label: 'Belt of Fire Giant Strength (sets STR 25)', value: 25 }
        ]);

        const imported = parseDndBeyondCharacter({
            id: 778, name: 'Arrow', baseHitPoints: 10,
            classes: [{ level: 1, definition: { id: 1, name: 'Fighter', hitDice: 10, sources: [{ sourceId: 145 }], classFeatures: [{ id: 610, name: 'Fighting Style' }] } }],
            stats: [10, 16, 10, 10, 10, 10].map((value, i) => ({ id: i + 1, value })),
            modifiers: { class: [
                { type: 'proficiency', subType: 'martial-weapons', componentId: 610 },
                { type: 'bonus', subType: 'ranged-weapon-attacks', value: 2, componentId: 611 }
            ] },
            options: { class: [{ definition: { id: 611, name: 'Archery' } }] },
            inventory: [{ id: 5, equipped: true, quantity: 1, definition: { id: 700, name: 'Longbow', filterType: 'Weapon', attackType: 2, categoryId: 2, range: 150, longRange: 600, damage: { diceString: '1d8' }, damageType: 'Piercing', properties: [{ name: 'Ammunition' }, { name: 'Heavy' }, { name: 'Two-Handed' }] } }],
            spells: {}
        } as any, '778') as any;
        const bow = imported.weapons.find((w: any) => w.name === 'Longbow');
        expect(bow.toHitModifier).toBe(3 + 2 + 2);
        expect(bow.attackParts).toEqual([{ label: 'DEX modifier', value: 3 }, { label: 'Proficiency', value: 2 }, { label: 'Archery', value: 2 }]);
        expect(breakdownFor(imported, 'weapon', 'Longbow')?.lines.some((l) => l.label.startsWith('Other'))).toBe(false);
        expect(breakdownFor(imported, 'ability', 'dex')?.title).toBe('Dexterity 16 (+3)');
    });

    it("keeps an imported weapon's D&D Beyond attack through the item pass, and a sheet fighting style through it on site characters", async () => {
        const imported = parseDndBeyondCharacter({
            id: 779, name: 'Arrow', baseHitPoints: 10,
            classes: [{ level: 1, definition: { id: 1, name: 'Fighter', hitDice: 10, sources: [{ sourceId: 145 }], classFeatures: [{ id: 610, name: 'Fighting Style' }] } }],
            stats: [10, 16, 10, 10, 10, 10].map((value, i) => ({ id: i + 1, value })),
            modifiers: { class: [{ type: 'proficiency', subType: 'martial-weapons', componentId: 610 }, { type: 'bonus', subType: 'ranged-weapon-attacks', value: 2, componentId: 611 }] },
            options: { class: [{ definition: { id: 611, name: 'Archery' } }] },
            inventory: [{ id: 5, equipped: true, quantity: 1, definition: { id: 700, name: 'Longbow', filterType: 'Weapon', attackType: 2, categoryId: 2, range: 150, longRange: 600, damage: { diceString: '1d8' }, damageType: 'Piercing', properties: [{ name: 'Ammunition' }] } }],
            spells: {}
        } as any, '779') as any;
        applyMagicalItemBonuses(imported);
        applyMagicalItemBonuses(imported);
        expect(imported.weapons[0].toHitModifier).toBe(7);
        expect(imported.weapons[0].attackParts).toContainEqual({ label: 'Archery', value: 2 });

        const site = siteChar();
        site.abilities[1] = { ...site.abilities[1], score: 16, baseScore: 16, modifier: 3 };
        site.weapons = [{ name: 'Longbow', quantity: 1, equipped: true, category: 'Martial Ranged', damage: '1d8 + 3 Piercing', damageType: 'Piercing', damageDie: '1d8', attackBonus: '+6', toHitModifier: 6, range: '150/600 ft.', properties: ['Ammunition'] }];
        applyStatModifier(site, { target: 'attacks.ranged', type: 'bonus', value: 2 } as any, 1, 'Fighting Style: Archery');
        applyMagicalItemBonuses(site);
        applyMagicalItemBonuses(site);
        expect(site.weapons[0].toHitModifier).toBe(3 + 3 + 2);
        expect(site.weapons[0].attackParts).toEqual([{ label: 'DEX modifier', value: 3 }, { label: 'Proficiency', value: 3 }, { label: 'Fighting Style: Archery', value: 2 }]);
        applyStatModifier(site, { target: 'attacks.ranged', type: 'bonus', value: 2 } as any, -1, 'Fighting Style: Archery');
        applyMagicalItemBonuses(site);
        expect(site.weapons[0].toHitModifier).toBe(6);
    });
});

