import { describe, expect, it } from 'vitest';
import characterSheet from '../../../src/views/characterSheet/characterSheet.ctrl';
import characterSheetTemplate from '../../../src/views/characterSheet/characterSheet.template';
import contactTemplate from '../../../src/views/contact/contact.template';
import cookieBannerTemplate from '../../../src/views/cookieBanner/cookieBanner.template';
import errorPage from '../../../src/views/errorPage/errorPage.template';
import footerTemplate from '../../../src/views/footer/footer.template';
import homeTemplate from '../../../src/views/home/home.template';

describe('Frontend View Templates', () => {
    it('renders homeTemplate with expected hero content', () => {
        const element = homeTemplate();
        expect(element.tagName.toLowerCase()).toBe('el-home');
        expect(element.querySelector('h1')?.textContent).toContain('Do You D&D?');
        expect(element.querySelector('.hero-slate')).not.toBeNull();
    });

    it('renders cookieBannerTemplate with accept button', () => {
        const element = cookieBannerTemplate();
        expect(element.tagName.toLowerCase()).toBe('el-cookie-banner');
        const button = element.querySelector('button');
        expect(button).not.toBeNull();
        expect(button?.textContent).toBe('Accept Cookies');
    });

    it('renders errorPage with status code', () => {
        const error404 = errorPage(404);
        expect(error404.textContent).toContain('404');

        const error500 = errorPage(500);
        expect(error500.textContent).toContain('500');
    });

    it('renders footerTemplate with copyright and links', () => {
        const footer = footerTemplate();
        expect(footer.tagName.toLowerCase()).toBe('el-footer');
        expect(footer.querySelector('a')).not.toBeNull();
    });

    it('renders contactTemplate with contact form inputs', () => {
        const contact = contactTemplate();
        expect(contact.tagName.toLowerCase()).toBe('el-contact');
        expect(contact.querySelector('input[name="name"]')).not.toBeNull();
        expect(contact.querySelector('input[name="email"]')).not.toBeNull();
        expect(contact.querySelector('textarea[name="message"]')).not.toBeNull();
    });

    it('renders characterSheetTemplate with empty sheet before any ID is loaded', () => {
        const sheet = characterSheetTemplate();
        expect(sheet.tagName.toLowerCase()).toBe('el-character-sheet');

        // Loader input should be blank and no character body should be pre-rendered
        const idInput = sheet.querySelector<HTMLInputElement>('#dndbeyond-id-input');
        expect(idInput?.value).toBe('');
        expect(sheet.querySelector('.character-name')).toBeNull();
        expect(sheet.querySelectorAll('.spell-card').length).toBe(0);

        // Spell modal elements exist
        const modal = sheet.querySelector('#spell-modal-container');
        expect(modal).not.toBeNull();
        expect(modal?.classList.contains('hidden')).toBe(true);
        expect(sheet.querySelector('#modal-spell-name')).not.toBeNull();
        expect(sheet.querySelector('#modal-spell-description')).not.toBeNull();
    });

    it('does not show spell cards before a character ID is loaded', () => {
        const sheet = characterSheetTemplate();
        document.body.appendChild(sheet);

        characterSheet();

        const spellCards = document.querySelectorAll('.spell-card');
        expect(spellCards.length).toBe(0);

        document.body.removeChild(sheet);
    });

    it('adapts and renders character data across different classes and levels', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');

        // Test Level 20 Barbarian (Non-caster with Rage and d12 Hit Dice)
        const barbarianPayload = {
            id: 999001,
            name: 'Kragthor',
            classes: [
                {
                    level: 20,
                    definition: { name: 'Barbarian', hitDice: 12 },
                    subclassDefinition: { name: 'Path of the Berserker' }
                }
            ],
            baseHitPoints: 205,
            stats: [
                { id: 1, value: 24 }, // STR
                { id: 2, value: 14 }, // DEX
                { id: 3, value: 20 }, // CON
                { id: 4, value: 10 }, // INT
                { id: 5, value: 12 }, // WIS
                { id: 6, value: 8 }   // CHA
            ],
            modifiers: {},
            inventory: [],
            spells: {}
        };

        const barbChar = parseDndBeyondCharacter(barbarianPayload);
        expect(barbChar.name).toBe('Kragthor');
        expect(barbChar.level).toBe(20);
        expect(barbChar.vitals.hitDice).toContain('20d12');
        expect(barbChar.classResources?.some(r => r.name === 'Rage')).toBe(true);

        const barbHtml = renderSheetContent(barbChar);
        expect(barbHtml).toContain('Kragthor');
        expect(barbHtml).toContain('Rage');

        // Test Level 17 Wizard (Full caster with 9th-level slots)
        const wizardPayload = {
            id: 999002,
            name: 'Elminster Clone',
            classes: [
                {
                    level: 17,
                    definition: { name: 'Wizard', hitDice: 6, canCastSpells: true, spellCastingAbilityId: 4 },
                    subclassDefinition: { name: 'School of Evocation' }
                }
            ],
            baseHitPoints: 80,
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 14 },
                { id: 3, value: 16 },
                { id: 4, value: 20 }, // INT
                { id: 5, value: 14 },
                { id: 6, value: 10 }
            ],
            modifiers: {},
            inventory: [],
            spells: {}
        };

        const wizardChar = parseDndBeyondCharacter(wizardPayload);
        expect(wizardChar.level).toBe(17);
        expect(wizardChar.vitals.hitDice).toContain('17d6');
        expect(wizardChar.spellSlots.level1?.total).toBe(4);
        expect(wizardChar.spellSlots.level9?.total).toBe(1);

        const wizardHtml = renderSheetContent(wizardChar);
        expect(wizardHtml).toContain('Elminster Clone');
        expect(wizardHtml).toContain('9th Level');
    });

    it('parses and renders weapons with mastery and attack stats', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');

        // Test Rogue with Dagger, Shortbow, Shortsword with 2024 Weapon Mastery
        const roguePayload = {
            id: 144236081,
            name: 'Google (2024)',
            classes: [
                {
                    level: 5,
                    definition: { name: 'Rogue', hitDice: 8 },
                    subclassDefinition: { name: 'Thief' }
                }
            ],
            baseHitPoints: 33,
            stats: [
                { id: 1, value: 8 },  // STR -1
                { id: 2, value: 18 }, // DEX +4
                { id: 3, value: 12 }, // CON +1
                { id: 4, value: 14 }, // INT +2
                { id: 5, value: 12 }, // WIS +1
                { id: 6, value: 14 }  // CHA +2
            ],
            modifiers: {
                class: [
                    { type: 'proficiency', subType: 'simple-weapons' },
                    { type: 'weapon-mastery', subType: 'nick-dagger' },
                    { type: 'weapon-mastery', subType: 'vex-dart' }
                ]
            },
            inventory: [
                {
                    id: 101,
                    equipped: true,
                    quantity: 4,
                    definition: {
                        name: 'Dagger',
                        filterType: 'Weapon',
                        attackType: 1,
                        categoryId: 1,
                        damage: { diceString: '1d4' },
                        damageType: 'Piercing',
                        range: 20,
                        longRange: 60,
                        properties: [
                            { name: 'Finesse' },
                            { name: 'Light' },
                            { name: 'Thrown' },
                            { name: 'Nick' }
                        ]
                    }
                },
                {
                    id: 102,
                    equipped: true,
                    quantity: 1,
                    definition: {
                        name: 'Shortbow',
                        filterType: 'Weapon',
                        attackType: 2,
                        categoryId: 1,
                        damage: { diceString: '1d6' },
                        damageType: 'Piercing',
                        range: 80,
                        longRange: 320,
                        properties: [
                            { name: 'Ammunition' },
                            { name: 'Range' },
                            { name: 'Two-Handed' },
                            { name: 'Vex' }
                        ]
                    }
                }
            ],
            spells: {}
        };

        const rogueChar = parseDndBeyondCharacter(roguePayload);
        expect(rogueChar.weapons).toBeDefined();
        expect(rogueChar.weapons?.length).toBe(2);

        const dagger = rogueChar.weapons?.find(w => w.name === 'Dagger');
        expect(dagger).toBeDefined();
        // Level 5 Prof bonus = 3, DEX mod = 4 -> attack bonus = +7
        expect(dagger?.attackBonus).toBe('+7');
        expect(dagger?.damage).toBe('1d4 + 4 Piercing');
        expect(dagger?.range).toBe('20/60 ft.');
        expect(dagger?.equipped).toBe(true);
        expect(dagger?.mastery?.name).toBe('Nick');
        expect(dagger?.mastery?.unlocked).toBe(true);

        const rendered = renderSheetContent(rogueChar);
        expect(rendered).toContain('Weapons & Attack Mastery');
        expect(rendered).toContain('Dagger');
        expect(rendered).toContain('+7');
        expect(rendered).toContain('1d4 + 4 Piercing');
        expect(rendered).toContain('Mastery: Nick (Active)');
        expect(rendered).toContain('Shortbow');
    });

    it('does not show weapon cards before a character ID is loaded', () => {
        const sheet = characterSheetTemplate();
        document.body.appendChild(sheet);

        characterSheet();

        const weaponCards = document.querySelectorAll('.clickable-weapon-card');
        expect(weaponCards.length).toBe(0);

        document.body.removeChild(sheet);
    });

    it('correctly extracts and renders Darkvision and Devil\'s Sight in special senses', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');

        const warlockPayload = {
            id: 138310322,
            name: 'Darvell (2024)',
            classes: [
                {
                    level: 6,
                    definition: { name: 'Bard', hitDice: 8, canCastSpells: true, spellCastingAbilityId: 6 },
                    subclassDefinition: { name: 'College of Glamour' }
                },
                {
                    level: 6,
                    definition: { name: 'Warlock', hitDice: 8, canCastSpells: true, spellCastingAbilityId: 6 },
                    subclassDefinition: { name: 'The Great Old One' }
                }
            ],
            race: {
                fullName: 'Tiefling',
                racialTraits: [
                    { definition: { name: 'Darkvision', snippet: 'You can see in dim light within 60 feet...' } }
                ]
            },
            baseHitPoints: 75,
            stats: [
                { id: 1, value: 8 },
                { id: 2, value: 15 },
                { id: 3, value: 12 },
                { id: 4, value: 10 },
                { id: 5, value: 13 },
                { id: 6, value: 19 }
            ],
            modifiers: {
                race: [
                    {
                        type: 'set-base',
                        subType: 'darkvision',
                        friendlySubtypeName: 'Darkvision',
                        value: 60,
                        fixedValue: 60,
                        restriction: ''
                    }
                ],
                class: [
                    {
                        type: 'set-base',
                        subType: 'darkvision',
                        friendlySubtypeName: 'Darkvision',
                        value: 120,
                        fixedValue: 120,
                        restriction: 'You can see normally in darkness, both magical and nonmagical'
                    }
                ]
            },
            options: {
                class: [
                    { definition: { name: 'Devil’s Sight', snippet: 'You can see normally in darkness...' } }
                ]
            },
            inventory: [],
            spells: {}
        };

        const char = parseDndBeyondCharacter(warlockPayload);
        expect(char.vitals.darkvision).toBe('120 ft.');
        expect(char.vitals.devilsSight).toBe('120 ft.');

        const html = renderSheetContent(char);
        expect(html).toContain('Darkvision');
        expect(html).toContain('120 ft.');
        expect(html).toContain('Devil\'s Sight');
        expect(html).toContain('120 ft.');
    });
});
