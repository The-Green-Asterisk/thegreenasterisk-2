import { beforeEach, describe, expect, it } from 'vitest';
import { setClassRules } from '../../../src/services/classRules';
import { serverRulesClasses } from './serverRulesClasses';
import characterCreatorTemplate from '../../../src/views/characterCreator/characterCreator.template';
import characterSheet from '../../../src/views/characterSheet/characterSheet.ctrl';
import characterSheetTemplate from '../../../src/views/characterSheet/characterSheet.template';
import contactTemplate from '../../../src/views/contact/contact.template';
import cookieBannerTemplate from '../../../src/views/cookieBanner/cookieBanner.template';
import errorPage from '../../../src/views/errorPage/errorPage.template';
import footerTemplate from '../../../src/views/footer/footer.template';
import homeTemplate from '../../../src/views/home/home.template';

describe('Frontend View Templates', () => {
    // The sheet reads class rules served from rule_classes; use the same seeded data here
    beforeEach(() => {
        setClassRules(serverRulesClasses());
    });

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

    it('renders characterCreatorTemplate with wizard structure and stepper', () => {
        const creator = characterCreatorTemplate();
        expect(creator.tagName.toLowerCase()).toBe('el-character-creator');
        expect(creator.querySelector('.creator-title')?.textContent).toContain('Character Creator');
        expect(creator.querySelectorAll('.stepper-item').length).toBe(9);
        expect(creator.querySelector('#creator-prev-btn')).not.toBeNull();
        expect(creator.querySelector('#creator-next-btn')).not.toBeNull();
        expect(creator.querySelector('#creator-submit-btn')).not.toBeNull();
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

        // Conditions modal elements exist
        const conditionsModal = sheet.querySelector('#conditions-modal-container');
        expect(conditionsModal).not.toBeNull();
        expect(conditionsModal?.classList.contains('hidden')).toBe(true);
        expect(sheet.querySelector('#exhaustion-levels-row')).not.toBeNull();
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

    it('labels Pact of the Tome spells with Warlock, not the first listed class, on a Bard/Warlock', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const payload = {
            id: 138310322,
            name: 'Darvell (2024)',
            classes: [
                {
                    id: 1,
                    level: 6,
                    definition: { id: 10, name: 'Bard', hitDice: 8, canCastSpells: true, spellCastingAbilityId: 6 },
                    classFeatures: [{ definition: { id: 100, name: 'Bardic Inspiration' } }]
                },
                {
                    id: 2,
                    level: 6,
                    definition: { id: 20, name: 'Warlock', hitDice: 8, canCastSpells: true, spellCastingAbilityId: 6 },
                    classFeatures: [{ definition: { id: 200, name: 'Eldritch Invocations' } }]
                }
            ],
            race: { fullName: 'Tiefling', racialTraits: [] },
            baseHitPoints: 75,
            stats: [
                { id: 1, value: 8 },
                { id: 2, value: 15 },
                { id: 3, value: 12 },
                { id: 4, value: 10 },
                { id: 5, value: 13 },
                { id: 6, value: 19 }
            ],
            modifiers: {},
            options: {
                class: [{ componentId: 200, definition: { id: 300, name: 'Pact of the Tome' } }]
            },
            inventory: [],
            spells: {
                class: [{ componentId: 300, definition: { name: 'Acid Splash', level: 0, school: 'Evocation' } }]
            }
        };

        const char = parseDndBeyondCharacter(payload);
        const acidSplash = char.spells.find(s => s.name === 'Acid Splash');
        expect(acidSplash?.source).toBe('Warlock / Pact of the Tome');
    });

    it('calculates Monk Unarmored Defense, Unarmored Movement, Martial Arts, Diamond Soul, and Bracers of Defense', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const monkPayload = {
            id: 555001,
            name: 'Master Shen',
            classes: [
                {
                    level: 14,
                    definition: { name: 'Monk', hitDice: 8 }
                }
            ],
            race: {
                fullName: 'Human',
                weightSpeeds: { normal: { walk: 30 } }
            },
            baseHitPoints: 90,
            stats: [
                { id: 1, value: 10 }, // STR +0
                { id: 2, value: 20 }, // DEX +5
                { id: 3, value: 14 }, // CON +2
                { id: 4, value: 11 }, // INT +0
                { id: 5, value: 18 }, // WIS +4
                { id: 6, value: 10 }  // CHA +0
            ],
            modifiers: {
                class: [
                    { type: 'set', subType: 'unarmored-armor-class', statId: 5, value: null },
                    { type: 'bonus', subType: 'unarmored-movement', fixedValue: 25 },
                    { type: 'proficiency', subType: 'saving-throws' }
                ],
                item: [
                    // Equipped & attuned Bracers of Defense (+2 unarmored AC)
                    { id: 'mod-bracers', componentId: 201, type: 'bonus', subType: 'unarmored-armor-class', fixedValue: 2 },
                    // Unequipped Ring of Protection (+1 AC) -> should be ignored!
                    { id: 'mod-ring', componentId: 202, type: 'bonus', subType: 'armor-class', fixedValue: 1 }
                ]
            },
            inventory: [
                {
                    id: 1,
                    equipped: true,
                    isAttuned: true,
                    definition: {
                        id: 201,
                        name: 'Bracers of Defense',
                        filterType: 'Wondrous item',
                        canEquip: true,
                        canAttune: true
                    }
                },
                {
                    id: 2,
                    equipped: false,
                    isAttuned: false,
                    definition: {
                        id: 202,
                        name: 'Ring of Protection',
                        filterType: 'Ring',
                        canEquip: true,
                        canAttune: true
                    }
                },
                {
                    id: 3,
                    equipped: true,
                    quantity: 1,
                    definition: {
                        id: 203,
                        name: 'Quarterstaff',
                        filterType: 'Weapon',
                        attackType: 1,
                        categoryId: 1, // Simple melee -> Monk weapon
                        damage: { diceString: '1d6' },
                        damageType: 'Bludgeoning',
                        properties: [{ name: 'Versatile' }]
                    }
                }
            ],
            spells: {}
        };

        const monk = parseDndBeyondCharacter(monkPayload);
        // AC = 10 + DEX (+5) + WIS (+4) + Bracers (+2) = 21 (unequipped Ring ignored)
        expect(monk.vitals.armorClass).toBe(21);
        // Speed = 30 + 25 (Unarmored Movement) = 55 ft.
        expect(monk.vitals.speed).toBe('55 ft.');
        // Diamond Soul: all 6 saving throws are proficient (profBonus at Lv 14 is +5)
        expect(monk.abilities.every(a => a.proficientSave)).toBe(true);
        expect(monk.abilities.find(a => a.abbr === 'WIS')?.save).toBe(4 + 5);
        // Quarterstaff uses DEX (+5) instead of STR (+0) via Martial Arts, and upgrades die from 1d6 to Lv 14 Martial Arts die (1d10)
        const staff = monk.weapons?.find(w => w.name === 'Quarterstaff');
        expect(staff?.toHitModifier).toBe(5 + 5); // DEX (+5) + Prof (+5) = +10
        expect(staff?.damageDie).toBe('1d10');
        expect(staff?.damage).toBe('1d10 + 5 Bludgeoning');
    });

    it('calculates Barbarian Unarmored Defense with Shield, Tough feat HP, Set Ability Score items, and Magic Weapon bonuses', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const barbPayload = {
            id: 555002,
            name: 'Grog Strongjaw',
            classes: [
                {
                    level: 10,
                    definition: { name: 'Barbarian', hitDice: 12 }
                }
            ],
            baseHitPoints: 75,
            stats: [
                { id: 1, value: 16 }, // STR 16 -> overridden to 23 (+6) by Belt of Stone Giant Strength
                { id: 2, value: 14 }, // DEX 14 (+2)
                { id: 3, value: 18 }, // CON 18 (+4)
                { id: 4, value: 8 },
                { id: 5, value: 12 },
                { id: 6, value: 10 }
            ],
            modifiers: {
                class: [
                    { type: 'set', subType: 'unarmored-armor-class', statId: 3 },
                    { type: 'bonus', subType: 'unarmored-movement', fixedValue: 10 },
                    { type: 'proficiency', subType: 'martial-weapons' }
                ],
                feat: [
                    { type: 'bonus', subType: 'hit-points-per-level', fixedValue: 2 } // Tough feat (+20 HP at Lv 10)
                ],
                item: [
                    { id: 'belt-str', componentId: 301, type: 'set', subType: 'strength-score', fixedValue: 23 },
                    { id: 'shield-magic', componentId: 302, type: 'bonus', subType: 'armor-class', fixedValue: 1 }
                ]
            },
            inventory: [
                {
                    id: 10,
                    equipped: true,
                    isAttuned: true,
                    definition: {
                        id: 301,
                        name: 'Belt of Stone Giant Strength',
                        filterType: 'Wondrous item',
                        canEquip: true,
                        canAttune: true
                    }
                },
                {
                    id: 11,
                    equipped: true,
                    definition: {
                        id: 302,
                        name: 'Shield, +1',
                        filterType: 'Armor', // DDB represents Shields with filterType: Armor and armorTypeId: 4
                        armorTypeId: 4,
                        armorClass: 2,
                        magic: true
                    }
                },
                {
                    id: 12,
                    equipped: true,
                    quantity: 1,
                    definition: {
                        id: 303,
                        name: 'Greataxe, +2',
                        filterType: 'Weapon',
                        attackType: 1,
                        categoryId: 2,
                        magic: true,
                        damage: { diceString: '1d12' },
                        damageType: 'Slashing',
                        grantedModifiers: [
                            { type: 'bonus', subType: 'magic', fixedValue: 2 },
                            { type: 'damage', subType: 'fire', friendlySubtypeName: 'Fire', dice: { diceString: '1d6' } }
                        ]
                    }
                }
            ],
            spells: {}
        };

        const barb = parseDndBeyondCharacter(barbPayload);
        // STR set to 23 (+6)
        const strAbility = barb.abilities.find(a => a.abbr === 'STR');
        expect(strAbility?.score).toBe(23);
        expect(strAbility?.modifier).toBe(6);
        // AC = 10 + DEX (+2) + CON (+4) + Shield base (+2) + Shield magic (+1) = 19
        expect(barb.vitals.armorClass).toBe(19);
        // Max HP = 75 (base) + 40 (CON +4 * 10) + 20 (Tough +2 * 10) = 135
        expect(barb.vitals.maxHp).toBe(135);
        // Greataxe +2: STR (+6) + Prof (+4 at Lv 10) + Magic (+2) = +12 to hit; 1d12 + 8 Slashing + 1d6 Fire
        const axe = barb.weapons?.find(w => w.name === 'Greataxe, +2');
        expect(axe?.toHitModifier).toBe(12);
        expect(axe?.damage).toBe('1d12 + 8 Slashing + 1d6 Fire');
    });

    it('calculates Initiative, Saving Throws, Skills, Passive Perception, and Spell DC/Attack modifiers', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const paladinBardPayload = {
            id: 555003,
            name: 'Sir Dorian',
            classes: [
                {
                    level: 6,
                    definition: { name: 'Paladin', hitDice: 10, canCastSpells: true, spellCastingAbilityId: 6 }
                },
                {
                    level: 4,
                    definition: { name: 'Bard', hitDice: 8, canCastSpells: true, spellCastingAbilityId: 6 }
                }
            ],
            baseHitPoints: 64,
            stats: [
                { id: 1, value: 16 }, // STR +3
                { id: 2, value: 14 }, // DEX +2
                { id: 3, value: 14 }, // CON +2
                { id: 4, value: 10 }, // INT +0
                { id: 5, value: 12 }, // WIS +1
                { id: 6, value: 18 }  // CHA +4
            ],
            modifiers: {
                class: [
                    { type: 'half-proficiency', subType: 'ability-checks' }, // Jack of All Trades (+2 at Lv 10, profBonus = 4)
                    { type: 'bonus', subType: 'armored-armor-class', fixedValue: 1 }, // Defense Fighting Style
                    { type: 'bonus', subType: 'one-handed-melee-attacks', fixedValue: 2 } // Dueling Fighting Style
                ],
                feat: [
                    { type: 'proficiency', subType: 'initiative' }, // 2024 Alert feat (+4 profBonus)
                    { type: 'bonus', subType: 'passive-perception', fixedValue: 5 } // Observant feat (+5 passive perception)
                ],
                item: [
                    { type: 'bonus', subType: 'saving-throws', fixedValue: 1 }, // Cloak of Protection (+1 all saves)
                    { type: 'bonus', subType: 'armor-class', fixedValue: 1 }, // Cloak of Protection (+1 AC)
                    { type: 'bonus', subType: 'spell-save-dc', fixedValue: 2 }, // Amulet of the Devout (+2 Spell DC)
                    { type: 'bonus', subType: 'spell-attacks', fixedValue: 2 }, // Amulet of the Devout (+2 Spell Attack)
                    { type: 'advantage', subType: 'perception', restriction: '' } // Sentinel Shield (advantage on Perception -> +5 passive)
                ]
            },
            inventory: [
                {
                    id: 21,
                    equipped: true,
                    definition: {
                        id: 401,
                        name: 'Half Plate',
                        filterType: 'Armor',
                        armorTypeId: 2, // Medium armor (max +2 DEX)
                        armorClass: 15
                    }
                },
                {
                    id: 22,
                    equipped: true,
                    quantity: 1,
                    definition: {
                        id: 402,
                        name: 'Longsword',
                        filterType: 'Weapon',
                        attackType: 1,
                        categoryId: 2,
                        damage: { diceString: '1d8' },
                        damageType: 'Slashing',
                        properties: [{ name: 'Versatile' }]
                    }
                }
            ],
            spells: {}
        };

        const char = parseDndBeyondCharacter(paladinBardPayload);
        // Prof bonus at total level 10 = +4
        expect(char.vitals.proficiencyBonus).toBe(4);
        // AC = Half Plate (15) + DEX (+2) + Defense (+1) + Cloak (+1) = 19
        expect(char.vitals.armorClass).toBe(19);
        // Initiative = DEX (+2) + Alert Proficiency (+4) = +6
        expect(char.vitals.initiative).toBe(6);
        // Saving Throws include Paladin Lv 6 Aura of Protection (+4 CHA) + Cloak of Protection (+1)
        // WIS save (non-proficient) = WIS (+1) + Aura (+4) + Cloak (+1) = +6
        expect(char.abilities.find(a => a.abbr === 'WIS')?.save).toBe(6);
        // Non-proficient Perception skill gets Jack of All Trades (+2 half-prof): WIS (+1) + 2 = +3
        const percSkill = char.skills.find(s => s.name === 'Perception');
        expect(percSkill?.bonus).toBe(3);
        // Passive Perception = 10 + Perception (+3) + Observant (+5) + Advantage (+5) = 23
        expect(char.vitals.passivePerception).toBe(23);
        // Spell Save DC = 8 + Prof (+4) + CHA (+4) + Amulet (+2) = 18; Spell Attack = 4 + 4 + 2 = +10
        expect(char.vitals.spellSaveDc).toBe(18);
        expect(char.vitals.spellAttackBonus).toBe(10);
        // Longsword with Dueling (+2 damage): 1d8 + (3 STR + 2 Dueling) = 1d8 + 5 Slashing
        const sword = char.weapons?.find(w => w.name === 'Longsword');
        expect(sword?.damage).toBe('1d8 + 5 Slashing');
    });

    it('seeds all 15 D&D 5.5 conditions in migration and renders Active Conditions box & Exhaustion tracker', async () => {
        const { CreateConditionsTable1792784000000 } = await import(
            '../../../server/services/database/migration/1792784000000-create_conditions_table'
        );
        const { DEFAULT_DND55_CONDITIONS } = await import('../../../src/views/characterSheet/characterData');
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderHeroSection } = await import('../../../src/views/characterSheet/components/hero');

        expect(DEFAULT_DND55_CONDITIONS).toHaveLength(15);
        const exhaustionDef = DEFAULT_DND55_CONDITIONS.find(c => c.slug === 'exhaustion');
        expect(exhaustionDef).toBeDefined();
        expect(exhaustionDef?.hasLevels).toBe(true);
        expect(exhaustionDef?.maxLevel).toBe(6);
        expect(exhaustionDef?.description).toContain('2 times your Exhaustion level');
        expect(exhaustionDef?.description).toContain('5 times your Exhaustion level');

        // Verify migration SQL creates "conditions" table and inserts all 15 conditions
        const queries: string[] = [];
        const mockQueryRunner = {
            query: async (sql: string) => {
                queries.push(sql);
            }
        } as any;
        const migration = new CreateConditionsTable1792784000000();
        await migration.up(mockQueryRunner);

        expect(queries.some(q => q.includes('CREATE TABLE IF NOT EXISTS `conditions`'))).toBe(true);
        const insertSql = queries.find(q => q.includes('INSERT INTO `conditions`')) || '';
        for (const cond of DEFAULT_DND55_CONDITIONS) {
            expect(insertSql).toContain(`'${cond.slug}'`);
            expect(insertSql).toContain(`'${cond.name}'`);
        }

        // Verify D&D Beyond condition parsing (Poisoned = 11, Exhaustion = 4 with level 3)
        const charWithConditions = parseDndBeyondCharacter({
            id: 777001,
            name: 'Condition Tester',
            classes: [{ level: 5, definition: { name: 'Fighter', hitDice: 10 } }],
            baseHitPoints: 44,
            stats: [
                { id: 1, value: 16 },
                { id: 2, value: 14 },
                { id: 3, value: 14 },
                { id: 4, value: 10 },
                { id: 5, value: 12 },
                { id: 6, value: 10 }
            ],
            conditions: [
                { id: 11, level: null }, // Poisoned
                { id: 4, level: 3 }      // Exhaustion Level 3
            ],
            modifiers: {},
            inventory: [],
            spells: {}
        });

        expect(charWithConditions.exhaustionLevel).toBe(3);
        expect(charWithConditions.activeConditions).toContain('Poisoned');
        expect(charWithConditions.activeConditions).toContain('Exhaustion');

        const heroHtml = renderHeroSection(charWithConditions);
        expect(heroHtml).toContain('active-conditions-box');
        expect(heroHtml).toContain('Active Conditions');
        expect(heroHtml).toContain('Exhaustion 3');
        expect(heroHtml).toContain('Poisoned');
    });

    it('renders Manage Spells button, modal, and [current]/[allowed] spell level ratios', async () => {
        const { getCharacterSpellLevelLimits, renderSpellsByLevel } = await import('../../../src/views/characterSheet/components/spells');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');
        const { renderModals } = await import('../../../src/views/characterSheet/components/modals');
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const charData = parseDndBeyondCharacter({
            id: 9012,
            name: 'Spellcaster Hero',
            classes: [{ level: 5, definition: { name: 'Wizard', hitDice: 6 } }],
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 14 },
                { id: 3, value: 14 },
                { id: 4, value: 18 },
                { id: 5, value: 12 },
                { id: 6, value: 10 }
            ],
            modifiers: {},
            inventory: [],
            spells: {
                class: [
                    { definition: { name: 'Fire Bolt', level: 0, school: 'Evocation', description: '<p>Character Pull Fire Bolt</p>' } },
                    { definition: { name: 'Prestidigitation', level: 0, school: 'Transmutation', description: '<p>Character Pull Prestidigitation</p>' } },
                    { definition: { name: 'Magic Missile', level: 1, school: 'Evocation', description: '<p>Character Pull Magic Missile</p>' } },
                    { definition: { name: 'Shield', level: 1, school: 'Abjuration', description: '<p>Character Pull Shield</p>' } },
                    { definition: { name: 'Fireball', level: 3, school: 'Evocation', description: '<p>Character Pull Fireball</p>' } }
                ]
            }
        });

        charData.spellSlots = [
            { level: 1, total: 4, used: 1 },
            { level: 2, total: 3, used: 0 },
            { level: 3, total: 2, used: 0 }
        ];
        charData.allowedSpellsByLevel = { 0: 4, 1: 4, 2: 3, 3: 2 };

        const limits = getCharacterSpellLevelLimits(charData);
        expect(limits.availableLevels).toEqual([0, 1, 2, 3]);
        expect(limits.currentByLevel[0].length).toBe(2);
        expect(limits.allowedByLevel[0]).toBe(4);
        expect(limits.currentByLevel[1].length).toBe(2);
        expect(limits.allowedByLevel[1]).toBe(4);
        expect(limits.currentByLevel[2].length).toBe(0);
        expect(limits.allowedByLevel[2]).toBe(3);
        expect(limits.currentByLevel[3].length).toBe(1);
        expect(limits.allowedByLevel[3]).toBe(2);

        const spellsHtml = renderSpellsByLevel(charData.spells, charData.spellSlots, charData);
        expect(spellsHtml).toContain('2/4');
        expect(spellsHtml).toContain('1/2');

        const dynamicHtml = renderSheetContent(charData);
        expect(dynamicHtml).toContain('id="open-manage-spells-btn"');
        expect(dynamicHtml).toContain('Manage Spells');

        const modalsHtml = renderModals();
        expect(modalsHtml).toContain('id="manage-spells-modal-container"');
        expect(modalsHtml).toContain('id="manage-spells-search-input"');
        expect(modalsHtml).toContain('id="manage-spells-db-results"');
        expect(modalsHtml).toContain('id="manage-spells-current-levels"');
    });

    it('manages leveled spells as a shared pool across all spell levels on character sheet without artificial per-level slot limits', async () => {
        const { getCharacterSpellLevelLimits, renderSpellsByLevel } = await import('../../../src/views/characterSheet/components/spells');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');

        const limits = getCharacterSpellLevelLimits(darvellData);

        // Darvell is Bard 6 / Warlock 6: Bard prepares 10 spells, Warlock prepares 7 spells -> Total pool: 17
        expect(limits.maxPrepared).toBe(17);
        // Darvell has 17 prepared class spells (excluding species Hellish Rebuke/Darkness and Tome rituals Charm Person/Mirror Image)
        expect(limits.currentPrepared).toBe(17);
        expect(limits.isPreparedOverLimit).toBe(false);

        // Each class prepares its own spells (2024 multiclassing): Bard 6 -> 10, Warlock 6 -> 7
        expect(limits.byClass.map(c => [c.name, c.currentPrepared, c.maxPrepared])).toEqual([
            ["Bard", 10, 10],
            ["Warlock", 7, 7]
        ]);

        // Class cantrips (Bard 3 + Warlock 3); Tome (3) and Tiefling (2) cantrips are bonus and don't count
        expect(limits.maxCantrips).toBe(6);
        expect(limits.currentCantrips).toBe(6);
        expect(limits.bonusCantrips).toBe(5);
        expect(limits.isCantripsOverLimit).toBe(false);

        // Spells HTML should NOT show "8/4" or "over-limit" for 1st-level spells (he has 8 1st-level spells on sheet with 4 slots)
        const spellsHtml = renderSpellsByLevel(darvellData.spells, darvellData.spellSlots, darvellData);
        expect(spellsHtml).not.toContain('8/4');
        expect(spellsHtml).not.toContain('over-limit');

        // Dynamic sheet content renders the prepared spells pool badge
        const sheetHtml = renderSheetContent(darvellData);
        expect(sheetHtml).toContain('Prepared: <strong>17/17</strong>');
        expect(sheetHtml).toContain('Bard 10/10 • Warlock 7/7');
    });

    it('counts prepared spells per class for multiclass characters (2024 rules)', async () => {
        const { getCharacterSpellLevelLimits } = await import('../../../src/views/characterSheet/components/spells');
        const spell = (name: string, level: number, source: string, alwaysPrepared?: boolean) =>
            ({ id: name, name, level, school: 'Evocation', source, castingTime: '', range: '', duration: '', components: '', concentration: false, ritual: false, description: '', alwaysPrepared });

        // Wizard 1 / Cleric 3: Wizard prepares 4 (up to level 1), Cleric prepares 6 (up to level 2)
        const charData: any = {
            classes: [{ name: 'Wizard', level: 1 }, { name: 'Cleric', level: 3, subclass: 'Life Domain' }],
            spellSlots: { level1: { total: 4 }, level2: { total: 3 } },
            features: [],
            spells: [
                spell('Fire Bolt', 0, 'Wizard'),
                spell('Sacred Flame', 0, 'Cleric'),
                spell('Shield', 1, 'Wizard'),
                spell('Magic Missile', 1, 'Wizard'),
                spell('Sleep', 1, 'Wizard'),
                spell('Detect Magic', 1, 'Wizard'),
                spell('Mage Armor', 1, 'Wizard'),
                spell('Bless', 1, 'Cleric'),
                spell('Aid', 2, 'Cleric'),
                spell('Lesser Restoration', 2, 'Life Domain', true),
                spell('Light', 0, 'Elf Species')
            ]
        };

        const limits = getCharacterSpellLevelLimits(charData);
        // Total (7 of 10) is under the combined limit, but the Wizard has 5 of its 4
        expect(limits.maxPrepared).toBe(10);
        expect(limits.currentPrepared).toBe(7);
        expect(limits.byClass.find(c => c.name === 'Wizard')).toMatchObject({ currentPrepared: 5, maxPrepared: 4, isPreparedOverLimit: true });
        expect(limits.byClass.find(c => c.name === 'Cleric')).toMatchObject({ currentPrepared: 2, maxPrepared: 6, isPreparedOverLimit: false });
        expect(limits.isPreparedOverLimit).toBe(true);
        // Always-prepared domain spell and species cantrip don't count
        expect(limits.bonusPrepared).toBe(1);
        expect(limits.maxCantrips).toBe(3 + 3);
        expect(limits.currentCantrips).toBe(2);

        // A Wizard spell above what a 1st-level Wizard can prepare is flagged even with room in the total
        charData.spells = charData.spells.filter((s: any) => s.name !== 'Mage Armor');
        charData.spells.push(spell('Misty Step', 2, 'Wizard'));
        const limits2 = getCharacterSpellLevelLimits(charData);
        expect(limits2.byClass.find(c => c.name === 'Wizard')).toMatchObject({ currentPrepared: 5, aboveMaxLevel: ['Misty Step'] });
    });

    it('gives Eldritch Knights and Arcane Tricksters their 2024 cantrip and prepared counts on the sheet, from the class rules', async () => {
        const { getCharacterSpellLevelLimits } = await import('../../../src/views/characterSheet/components/spells');
        const { setClassRules } = await import('../../../src/services/classRules');
        const { serverRulesClasses } = await import('./serverRulesClasses');
        // Without the subclass spellcasting data, a Fighter/Rogue isn't a caster
        setClassRules(null);
        expect(getCharacterSpellLevelLimits({ classes: [{ name: 'Fighter', level: 10, subclass: 'Eldritch Knight' }], spellSlots: {}, features: [], spells: [] } as any).byClass).toEqual([]);
        setClassRules(serverRulesClasses());
        const limits = getCharacterSpellLevelLimits({
            classes: [{ name: 'Rogue', level: 3, subclass: 'Arcane Trickster' }, { name: 'Fighter', level: 10, subclass: 'Eldritch Knight' }],
            spellSlots: {},
            features: [],
            spells: []
        } as any);
        expect(limits.byClass.map(c => [c.name, c.maxCantrips, c.maxPrepared])).toEqual([
            ['Rogue', 3, 3],
            ['Fighter', 3, 7]
        ]);
        setClassRules(null);
    });

    it('shows the feature that put a spell on a class on its spell card', async () => {
        const { renderSpellCard } = await import('../../../src/views/characterSheet/components/spells');
        const base = { id: 'g', name: 'Guidance', level: 0, school: 'Divination', source: 'Bard', castingTime: '', range: '', duration: '', components: '', concentration: false, ritual: false, description: '' };
        expect(renderSpellCard({ ...base, viaFeature: 'Magical Secrets' })).toContain('Magical Secrets');
        expect(renderSpellCard(base)).not.toContain('Magical Secrets');
    });

    it('does not count a spell picked as a regular spell when a feature already keeps it prepared, and reports duplicates', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { getCharacterSpellLevelLimits, describeDuplicateSpells } = await import('../../../src/views/characterSheet/components/spells');
        const def = (name: string, level: number) => ({ name, level, school: 'Transmutation', description: `<p>${name}</p>` });
        const charData = parseDndBeyondCharacter({
            id: 4242,
            name: 'Darvell',
            classes: [{ id: 7, level: 9, definition: { id: 2190885, name: 'Warlock', hitDice: 8 }, subclassDefinition: { id: 99, name: 'Great Old One Patron', classFeatures: [{ id: 555, name: 'Great Old One Spells' }] } }],
            stats: [{ id: 1, value: 10 }, { id: 2, value: 10 }, { id: 3, value: 10 }, { id: 4, value: 10 }, { id: 5, value: 10 }, { id: 6, value: 16 }],
            modifiers: {},
            inventory: [],
            classSpells: [{ characterClassId: 7, spells: [
                { definition: def('Telekinesis', 5), countsAsKnownSpell: true, alwaysPrepared: false, spellListId: null },
                { definition: def('Misty Step', 2), countsAsKnownSpell: true, alwaysPrepared: false, spellListId: null }
            ] }],
            spells: { class: [
                { definition: def('Telekinesis', 5), componentId: 555, countsAsKnownSpell: false, alwaysPrepared: true },
                { definition: def('Speak with Dead', 3), componentId: 777, countsAsKnownSpell: false, alwaysPrepared: false },
                // Feature-only duplicate (free daily cast plus slot casting): not the player's pick, so not reported
                { definition: def('Contact Other Plane', 5), componentId: 555, countsAsKnownSpell: false, alwaysPrepared: false },
                { definition: def('Contact Other Plane', 5), componentId: 555, countsAsKnownSpell: false, alwaysPrepared: false }
            ] }
        });

        expect(charData.spells.find(s => s.name === 'Telekinesis')).toMatchObject({ source: 'Warlock', alwaysPrepared: true });
        expect(charData.duplicateSpells).toEqual([
            { name: 'Telekinesis', copies: ['prepared as a Warlock spell', 'always prepared by Great Old One Patron'], wastedPicks: 1 }
        ]);
        const warlock = getCharacterSpellLevelLimits(charData).byClass.find(c => c.name === 'Warlock')!;
        expect(warlock.currentPrepared).toBe(1);

        expect(describeDuplicateSpells(charData)).toBe(
            "1 spell is duplicated in Darvell's spell list: Telekinesis (prepared as a Warlock spell; always prepared by Great Old One Patron). " +
            "Remove the extra copy on D&D Beyond. That frees up a prepared spell."
        );
        // Any duplicate counts, not just picks of an always-prepared spell
        expect(describeDuplicateSpells({
            name: 'Ulfgar Moss',
            duplicateSpells: [
                { name: 'Darkness', copies: ['granted by Race (2 times)'], wastedPicks: 0 },
                { name: 'Shield', copies: ['prepared as a Sorcerer spell', 'prepared as a Wizard spell'], wastedPicks: 0 }
            ]
        })).toBe(
            "2 spells are duplicated in Ulfgar Moss' spell list: Darkness (granted by Race (2 times)), Shield (prepared as a Sorcerer spell; prepared as a Wizard spell). " +
            "Remove the extra copies on D&D Beyond."
        );
        expect(describeDuplicateSpells({ name: 'Nobody', duplicateSpells: undefined })).toBe('');
    });

    it('computes sheet spell slots from the class rules (third casters round down; Pact Magic from the Warlock table)', async () => {
        const { computeSpellSlotsFromRules } = await import('../../../src/views/characterSheet/characterAdapter');
        const { setClassRules } = await import('../../../src/services/classRules');
        const { serverRulesClasses } = await import('./serverRulesClasses');
        setClassRules(serverRulesClasses());
        // Eldritch Knight 4 (4/3 rounded down = 1) + Wizard 1 = caster level 2: three 1st-level slots
        expect(computeSpellSlotsFromRules([
            { name: 'Fighter', level: 4, subclass: 'Eldritch Knight' },
            { name: 'Wizard', level: 1 }
        ]).standard).toEqual([3, 0, 0, 0, 0, 0, 0, 0, 0]);
        // A lone Eldritch Knight uses its own table
        expect(computeSpellSlotsFromRules([{ name: 'Fighter', level: 7, subclass: 'Eldritch Knight' }]).standard.slice(0, 2)).toEqual([4, 2]);
        // Pact Magic comes from the Warlock's own slot table
        expect(computeSpellSlotsFromRules([{ name: 'Warlock', level: 11 }]).pact).toEqual({ count: 3, level: 5 });
        // Without a spellcasting subclass, a Fighter has no slots
        expect(computeSpellSlotsFromRules([{ name: 'Fighter', level: 7, subclass: 'Champion' }]).standard.every(v => v === 0)).toBe(true);
        setClassRules(null);
    });

    it('does not give non-casters a cantrip allotment', async () => {
        const { getCharacterSpellLevelLimits } = await import('../../../src/views/characterSheet/components/spells');
        const limits = getCharacterSpellLevelLimits({
            classes: [{ name: 'Fighter', level: 5, subclass: 'Champion' }],
            spellSlots: {},
            features: [],
            spells: []
        } as any);
        expect(limits.maxCantrips).toBe(0);
        expect(limits.maxPrepared).toBe(0);
    });

    it('renders feat and trait decision dropdowns and updates character stats when choices change', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderFeatures } = await import('../../../src/views/characterSheet/components/features');
        const { applyFeatureDecisionOnCharacterData } = await import('../../../src/views/characterSheet/featureDecisions');

        const rawPayload = {
            id: 445566,
            name: 'Decision Hero',
            classes: [
                {
                    level: 5,
                    definition: {
                        name: 'Bard',
                        hitDice: 8,
                        spellRules: { multiClassSpellSlotDivisor: 1 },
                        spellCastingAbilityId: 6,
                        classFeatures: [
                            {
                                id: 301,
                                name: 'Expertise',
                                requiredLevel: 2,
                                description: '<p>Choose two of your skill proficiencies to gain Expertise.</p>'
                            },
                            {
                                id: 302,
                                name: 'Fighting Style',
                                requiredLevel: 2,
                                description: '<p>You adopt a particular style of fighting as your specialty.</p>'
                            }
                        ]
                    }
                }
            ],
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 14 },
                { id: 3, value: 13 },
                { id: 4, value: 10 },
                { id: 5, value: 13 },
                { id: 6, value: 17 }
            ],
            feats: [
                {
                    definition: {
                        id: 101,
                        name: 'War Caster',
                        description: '<p>Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.</p>'
                    }
                },
                {
                    definition: {
                        id: 102,
                        name: 'Resilient',
                        description: '<p>Increase one ability score of your choice by 1. You gain proficiency in saving throws using the chosen ability.</p>'
                    }
                }
            ],
            modifiers: {
                feat: [
                    { id: 'm-wc', componentId: 101, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: true },
                    { id: 'm-res-asi', componentId: 102, type: 'bonus', subType: 'constitution-score', value: 1, isGranted: true },
                    { id: 'm-res-save', componentId: 102, type: 'proficiency', subType: 'constitution-saving-throws', isGranted: true }
                ],
                class: [
                    { id: 'm-exp-1', componentId: 301, type: 'expertise', subType: 'deception', isGranted: true },
                    { id: 'm-exp-2', componentId: 301, type: 'expertise', subType: 'performance', isGranted: true },
                    { id: 'm-fs', componentId: 302, type: 'bonus', subType: 'armored-armor-class', value: 1, isGranted: true }
                ]
            },
            inventory: [],
            spells: {}
        };

        const initialChar = parseDndBeyondCharacter(rawPayload);

        // Verify initial stats: CHA = 17 + 1 (War Caster) = 18 (+4), CON = 13 + 1 (Resilient) = 14 (+2, proficient save = +5)
        const chaInitial = initialChar.abilities.find(a => a.abbr === 'CHA')!;
        const wisInitial = initialChar.abilities.find(a => a.abbr === 'WIS')!;
        const conInitial = initialChar.abilities.find(a => a.abbr === 'CON')!;
        expect(chaInitial.score).toBe(18);
        expect(chaInitial.modifier).toBe(4);
        expect(wisInitial.score).toBe(13);
        expect(wisInitial.modifier).toBe(1);
        expect(conInitial.score).toBe(14);
        expect(conInitial.proficientSave).toBe(true);
        expect(initialChar.vitals.armorClass).toBe(12); // 10 + 2 (DEX); Defense's +1 needs armor, and this character has none

        // Verify features HTML renders feature cards without sheet-level decision dropdowns
        const featuresHtml = renderFeatures(initialChar);
        expect(featuresHtml).not.toContain('feature-decision-select');
        expect(featuresHtml).toContain('War Caster');
        expect(featuresHtml).toContain('Resilient');
        expect(featuresHtml).toContain('Expertise');
        expect(featuresHtml).toContain('Fighting Style');

        // Now change decisions:
        // 1) War Caster ASI from Charisma (+1 CHA) -> Wisdom (+1 WIS)
        // 2) Resilient from Constitution -> Wisdom (+1 WIS & WIS Save Proficiency)
        // 3) Expertise #1 from Deception -> Perception
        // 4) Fighting Style from Defense (+1 AC) -> Blind Fighting (10 ft. Blindsight)
        const updatedChar = parseDndBeyondCharacter(rawPayload, undefined, undefined, {
            'feat:war-caster:0:asi:0': 'ability:5:1',
            'feat:resilient:1:resilient:0': 'resilient:5',
            'class:bard:expertise:2:skill-exp:0': 'skill-exp:perception',
            'class:bard:fighting-style:2:fighting-style:0': 'fighting-style:blind-fighting'
        });

        const chaUpdated = updatedChar.abilities.find(a => a.abbr === 'CHA')!;
        const wisUpdated = updatedChar.abilities.find(a => a.abbr === 'WIS')!;
        const conUpdated = updatedChar.abilities.find(a => a.abbr === 'CON')!;

        expect(chaUpdated.score).toBe(17); // 18 -> 17 (+3)
        expect(chaUpdated.modifier).toBe(3);
        expect(wisUpdated.score).toBe(15); // 13 + 1 (War Caster) + 1 (Resilient) = 15 (+2)
        expect(wisUpdated.modifier).toBe(2);
        expect(wisUpdated.proficientSave).toBe(true);
        expect(conUpdated.score).toBe(13); // 14 -> 13 (+1)
        expect(conUpdated.proficientSave).toBe(false);

        const perceptionSkill = updatedChar.skills.find(s => s.name === 'Perception')!;
        expect(perceptionSkill.proficiency).toBe('expertise');
        expect(perceptionSkill.bonus).toBe(2 + 3 * 2); // WIS (+2) + 2 * PB (6) = +8
        expect(updatedChar.vitals.passivePerception).toBe(18);
        expect(updatedChar.vitals.armorClass).toBe(12);
        expect(updatedChar.features.find(f => f.name === 'Fighting Style')!.decisions![0].selectedValue).toBe('fighting-style:blind-fighting');
        expect(updatedChar.vitals.blindsight).toBe('10 ft.');

        // Also verify in-place CharacterData helper works without raw payload
        applyFeatureDecisionOnCharacterData(initialChar, 'feat:war-caster:0:asi:0', 'ability:5:1');
        expect(initialChar.abilities.find(a => a.abbr === 'WIS')!.score).toBe(14);
        expect(initialChar.abilities.find(a => a.abbr === 'CHA')!.score).toBe(17);

        // Verify unlinked Ability Score Improvement decisions start at 'none' and increase ability scores when chosen
        const asiPayload = {
            ...rawPayload,
            feats: [
                {
                    definition: {
                        id: 201,
                        name: 'Ability Score Improvement',
                        description: '<p>Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1.</p>'
                    }
                }
            ],
            modifiers: { feat: [], class: [] }
        };
        const asiChar = parseDndBeyondCharacter(asiPayload);
        expect(asiChar.abilities.find(a => a.abbr === 'CHA')!.score).toBe(17);
        applyFeatureDecisionOnCharacterData(asiChar, 'feat:ability-score-improvement:0:asi:0', 'ability:6:1');
        expect(asiChar.abilities.find(a => a.abbr === 'CHA')!.score).toBe(18);
        applyFeatureDecisionOnCharacterData(asiChar, 'feat:ability-score-improvement:0:asi:1', 'ability:6:1');
        expect(asiChar.abilities.find(a => a.abbr === 'CHA')!.score).toBe(19);
    });

    it('extractFeaturesAndApplyDecisions separates subclass features accurately for multiclass characters', async () => {
        const { extractFeaturesAndApplyDecisions } = await import('../../../src/views/characterSheet/featureDecisions');

        const multiclassRaw = {
            classes: [
                {
                    level: 6,
                    definition: { id: 1, name: 'Bard', classFeatures: [{ id: 101, name: 'Bardic Inspiration', requiredLevel: 1 }] },
                    subclassDefinition: {
                        id: 757,
                        name: 'College of Glamour',
                        classFeatures: [
                            { id: 102, name: 'Mantle of Inspiration', requiredLevel: 3 },
                            { id: 103, name: 'Beguiling Magic', requiredLevel: 3 }
                        ]
                    },
                    classFeatures: [
                        { id: 101, definition: { id: 101, classId: 1, name: 'Bardic Inspiration', requiredLevel: 1 } },
                        { id: 102, definition: { id: 102, classId: 757, name: 'Mantle of Inspiration', requiredLevel: 3 } },
                        // Leaked runtime object from other class in D&D Beyond:
                        { id: 202, definition: { id: 202, classId: 800, name: 'Awakened Mind', requiredLevel: 3, isSubclassFeature: true } }
                    ]
                },
                {
                    level: 6,
                    definition: { id: 7, name: 'Warlock', classFeatures: [{ id: 201, name: 'Pact Magic', requiredLevel: 1 }] },
                    subclassDefinition: {
                        id: 800,
                        name: 'Great Old One Patron',
                        classFeatures: [
                            { id: 202, name: 'Awakened Mind', requiredLevel: 3 },
                            { id: 203, name: 'Psychic Spells', requiredLevel: 3 }
                        ]
                    },
                    classFeatures: [
                        { id: 201, definition: { id: 201, classId: 7, name: 'Pact Magic', requiredLevel: 1 } },
                        { id: 202, definition: { id: 202, classId: 800, name: 'Awakened Mind', requiredLevel: 3 } },
                        // Leaked runtime object from other class in D&D Beyond:
                        { id: 102, definition: { id: 102, classId: 757, name: 'Mantle of Inspiration', requiredLevel: 3, isSubclassFeature: true } }
                    ]
                }
            ],
            modifiers: { class: [], feat: [], race: [], background: [] },
            characterValues: []
        };

        const res = extractFeaturesAndApplyDecisions(multiclassRaw, []);
        const features = res.features;

        const glamourFeatures = features.filter(f => f.source === 'College of Glamour');
        const gooFeatures = features.filter(f => f.source === 'Great Old One Patron');

        expect(glamourFeatures.some(f => f.name === 'Mantle of Inspiration')).toBe(true);
        expect(glamourFeatures.some(f => f.name === 'Awakened Mind')).toBe(false);

        expect(gooFeatures.some(f => f.name === 'Awakened Mind')).toBe(true);
        expect(gooFeatures.some(f => f.name === 'Mantle of Inspiration')).toBe(false);
    });

    it('replaces exact case-sensitive condition names and [condition] blocks with condition definition modal links', async () => {
        const { linkifyConditionAndSpellTags } = await import('../../../src/views/characterSheet/components/markupLinks');

        const input = '<p>The target has the Charmed condition and [condition]Frightened[/condition], while charmed or blinded in lowercase stays plain text.</p>';
        const output = linkifyConditionAndSpellTags(input);

        // Capitalized "Charmed" and tagged "Frightened" become inline condition links
        expect(output).toContain('class="inline-condition-link" data-condition-link="Charmed"');
        expect(output).toContain('class="inline-condition-link" data-condition-link="Frightened"');

        // Lowercase "charmed" and "blinded" are not linked
        expect(output).toContain('while charmed or blinded in lowercase');
        expect(output).not.toContain('data-condition-link="blinded"');

        // [rules]...[/rules] blocks become links to D&D Beyond 2024 Basic Rules
        const rulesInput = '<p>Make a [rules]D20 Test[/rules] or take the [rules]Magic[/rules] action.</p>';
        const rulesOutput = linkifyConditionAndSpellTags(rulesInput);
        expect(rulesOutput).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game#D20Tests"');
        expect(rulesOutput).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Magic');

        // [action]...[/action] blocks become interactive action links with D&D Beyond 2024 Rules Glossary URLs
        const actionInput = '<p>Take the [action]Magic[/action] action or [action]Study[/action] action, without provoking [action]Opportunity Attack;Opportunity Attacks[/action].</p>';
        const actionOutput = linkifyConditionAndSpellTags(actionInput);
        expect(actionOutput).toContain('class="inline-action-link" data-action-link="Magic"');
        expect(actionOutput).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#MagicAction"');
        expect(actionOutput).toContain('class="inline-action-link" data-action-link="Study"');
        expect(actionOutput).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#StudyAction"');

        // Semicolon syntax [action]Target;Display[/action] resolves display text and links to the specific action definition
        expect(actionOutput).toContain('data-action-link="Opportunity%20Attack"');
        expect(actionOutput).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game#OpportunityAttacks"');
        expect(actionOutput).toContain('> Opportunity Attacks</a>');
        expect(actionOutput).not.toContain('Opportunity Attack;Opportunity Attacks');

        const { findStandardActionDefinition } = await import('../../../src/views/characterSheet/components/markupLinks');
        const oppDef = findStandardActionDefinition('Opportunity Attack;Opportunity Attacks');
        expect(oppDef?.name).toBe('Opportunity Attack');
        expect(oppDef?.type).toContain('Reaction');

        const oppPluralDef = findStandardActionDefinition('Opportunity Attacks');
        expect(oppPluralDef?.name).toBe('Opportunity Attack');

        const attackDef = findStandardActionDefinition('Attack');
        expect(attackDef?.name).toBe('Attack');

        // {{scalevalue}}, {{limiteduse}}, {{savedc:cha}}, {{modifier:cha}} placeholders resolve against character context
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');
        const templateInput = 'Roll {{scalevalue}} up to {{limiteduse}} times (DC {{savedc:cha}}, bonus {{modifier:cha#signed}}).';
        const resolved = linkifyConditionAndSpellTags(templateInput, {
            character: darvellData,
            entityName: 'Bardic Inspiration',
            sourceName: 'Bard',
            scaleValue: '1d8',
            limitedUse: '4'
        });
        expect(resolved).toContain('Roll 1d8 up to 4 times (DC 16, bonus +4).');

        // Wild Shape, Circle Forms, Primal Strike, Leave Druidic Message, and Monk arithmetic / bracketed permutations
        const druidMonkCharacter: any = {
            ...darvellData,
            level: 11,
            classes: [
                { name: 'Fighter', level: 1 },
                { name: 'Druid', subclass: 'Circle of the Moon', level: 11 },
                { name: 'Monk', level: 10 }
            ],
            vitals: {
                ...darvellData.vitals,
                proficiencyBonus: 4
            },
            abilities: [
                { name: 'Strength', abbr: 'STR', score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: 'Dexterity', abbr: 'DEX', score: 18, modifier: 4, save: 8, proficientSave: true },
                { name: 'Constitution', abbr: 'CON', score: 14, modifier: 2, save: 2, proficientSave: false },
                { name: 'Intelligence', abbr: 'INT', score: 12, modifier: 1, save: 1, proficientSave: false },
                { name: 'Wisdom', abbr: 'WIS', score: 20, modifier: 5, save: 9, proficientSave: true },
                { name: 'Charisma', abbr: 'CHA', score: 8, modifier: -1, save: -1, proficientSave: false }
            ],
            features: [
                { name: 'Wild Shape', source: 'Druid', type: 'Class Feature', description: '' }
            ]
        };

        // 1. Wild Shape (inferred Druid class level 11 even when sourceName is omitted on action cards)
        const wildShapeEffect = linkifyConditionAndSpellTags(
            'Stay in [rules]shape-shifting;shape-shift[/rules] form for {{(classlevel/2)@rounddown}} hours; Temp HP {{classlevel#unsigned}}.',
            { character: druidMonkCharacter, entityName: 'Wild Shape' }
        );
        expect(wildShapeEffect).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#ShapeShifting"');
        expect(wildShapeEffect).toContain('> shape-shift</a>');
        expect(wildShapeEffect).toContain('for 5 hours; Temp HP 11.');

        // 2. Wild Shape: Circle Forms
        const circleFormsEffect = linkifyConditionAndSpellTags(
            'Max CR {{(classlevel/3)@rounddown}} • AC {{(13+modifier:wis)#unsigned}} or {{13+modifier:wis#unsigned}} • Temp HP {{3*classlevel}}',
            { character: druidMonkCharacter, entityName: 'Wild Shape: Circle Forms' }
        );
        expect(circleFormsEffect).toBe('Max CR 3 • AC 18 or 18 • Temp HP 33');

        // 3. Primal Strike (nested parens + comma-separated min modifier)
        const primalStrikeEffect = linkifyConditionAndSpellTags(
            'Extra {{((classlevel-1)/7)@rounddown,min:1}}d8 damage (or at level 3: {{((3-1)/7)@rounddown,min:1}}d8)',
            { character: druidMonkCharacter, entityName: 'Primal Strike' }
        );
        expect(primalStrikeEffect).toBe('Extra 1d8 damage (or at level 3: 1d8)');

        // 4. Leave Druidic Message ([skill] tag) & [sense] tag
        const druidicNotes = linkifyConditionAndSpellTags(
            'DC 15 Intelligence ([skill]Investigation[/skill]) check with [sense]Darkvision[/sense].',
            { character: druidMonkCharacter, entityName: 'Leave Druidic Message' }
        );
        expect(druidicNotes).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game#Skills"');
        expect(druidicNotes).toContain('> Investigation</a>');
        expect(druidicNotes).toContain('href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Darkvision"');
        expect(druidicNotes).toContain('> Darkvision</a>');

        // 5. Monk compound arithmetic & @min:1 clamping
        const monkActionEffect = linkifyConditionAndSpellTags(
            'Hit {{modifier:str+proficiency}} or {{modifier:dex+proficiency}}, Dmg {{1+modifier:str#unsigned}}, Reduce {{(modifier:dex+classlevel)#signed}}, Slow Fall {{5*classlevel#unsigned}}, Min CHA {{modifier:cha@min:1#unsigned}}',
            { character: druidMonkCharacter, entityName: 'Deflect Attacks' }
        );
        expect(monkActionEffect).toBe('Hit +4 or +8, Dmg 1, Reduce +14, Slow Fall 50, Min CHA 1');
    });

    it('renders non-intrusive full-screen toggle buttons and handles fullscreen events', async () => {
        const sheet = characterSheetTemplate();
        expect(sheet.tagName.toLowerCase()).toBe('el-character-sheet');

        const headerBtn = sheet.querySelector<HTMLButtonElement>('#character-loader-fullscreen-btn');
        const floatingBtn = sheet.querySelector<HTMLButtonElement>('#sheet-fullscreen-floating-btn');

        expect(headerBtn).not.toBeNull();
        expect(floatingBtn).not.toBeNull();

        expect(headerBtn?.getAttribute('aria-label')).toBe('Enter full screen');
        expect(headerBtn?.title).toBe('Enter full screen');
        expect(headerBtn?.querySelector('i')?.className).toContain('fa-expand');

        expect(floatingBtn?.getAttribute('aria-label')).toBe('Enter full screen');
        expect(floatingBtn?.title).toBe('Enter full screen');
        expect(floatingBtn?.querySelector('i')?.className).toContain('fa-expand');

        const { initFullscreenController, syncFullscreenButtons } = await import('../../../src/views/characterSheet/controllers/fullscreen.ctrl');
        const ctrl = initFullscreenController(sheet);

        // Before fullscreen
        expect(sheet.classList.contains('is-fullscreen')).toBe(false);
        expect(headerBtn?.getAttribute('aria-pressed')).toBe('false');

        // Simulate document entering fullscreen
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            writable: true,
            value: sheet
        });

        document.dispatchEvent(new Event('fullscreenchange'));

        expect(sheet.classList.contains('is-fullscreen')).toBe(true);
        expect(headerBtn?.getAttribute('aria-pressed')).toBe('true');
        expect(headerBtn?.getAttribute('aria-label')).toBe('Exit full screen');
        expect(headerBtn?.querySelector('i')?.className).toContain('fa-compress');

        expect(floatingBtn?.getAttribute('aria-pressed')).toBe('true');
        expect(floatingBtn?.getAttribute('aria-label')).toBe('Exit full screen');
        expect(floatingBtn?.querySelector('i')?.className).toContain('fa-compress');

        // Simulate document exiting fullscreen
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            writable: true,
            value: null
        });

        document.dispatchEvent(new Event('fullscreenchange'));

        expect(sheet.classList.contains('is-fullscreen')).toBe(false);
        expect(headerBtn?.getAttribute('aria-pressed')).toBe('false');
        expect(headerBtn?.getAttribute('aria-label')).toBe('Enter full screen');
        expect(headerBtn?.querySelector('i')?.className).toContain('fa-expand');

        ctrl.destroy();
    });

    it('correctly calculates Darvell abilities including feat and choice modifiers', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const darvellPayload = {
            id: 138310322,
            name: 'Darvell',
            classes: [
                { level: 9, definition: { name: 'Bard', spellCastingAbilityId: 6 }, subclassDefinition: { name: 'College of Glamour' } },
                { level: 10, definition: { name: 'Warlock', spellCastingAbilityId: 6 }, subclassDefinition: { name: 'The Great Old One' } }
            ],
            stats: [
                { id: 1, value: 8 },  // STR
                { id: 2, value: 14 }, // DEX
                { id: 3, value: 12 }, // CON
                { id: 4, value: 10 }, // INT
                { id: 5, value: 13 }, // WIS
                { id: 6, value: 15 }  // CHA
            ],
            bonusStats: [],
            overrideStats: [],
            characterValues: [],
            feats: [
                { definition: { id: 1789100, name: 'Actor' } },
                { definition: { id: 1789101, name: 'Alert' } },
                { definition: { id: 1789112, name: 'Boon of Fate' } },
                { definition: { id: 1789139, name: 'Entertainer Ability Score Improvements' } },
                { definition: { id: 1789172, name: 'Musician' } },
                { definition: { id: 1789209, name: 'War Caster' } }
            ],
            modifiers: {
                race: [
                    { id: 'r1', type: 'set-base', subType: 'darkvision', value: 60, isGranted: true }
                ],
                class: [
                    { id: 'c1', type: 'proficiency', subType: 'charisma-saving-throws', isGranted: true },
                    { id: 'c2', type: 'proficiency', subType: 'dexterity-saving-throws', isGranted: true },
                    { id: 'c3', type: 'proficiency', subType: 'arcana', isGranted: false },
                    { id: 'c4', type: 'expertise', subType: 'deception', isGranted: false }
                ],
                feat: [
                    { id: 'f1', componentId: 1789100, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: true },  // Actor
                    { id: 'f2', componentId: 1789112, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: false }, // Boon of Fate
                    { id: 'f3', componentId: 1789209, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: false }, // War Caster
                    { id: 'f4', componentId: 1789139, type: 'bonus', subType: 'charisma-score', value: 2, isGranted: false }, // Entertainer ASI
                    { id: 'f5', componentId: 1789139, type: 'bonus', subType: 'dexterity-score', value: 1, isGranted: false }  // Entertainer ASI
                ]
            },
            inventory: [],
            spells: {}
        };

        const darvell = parseDndBeyondCharacter(darvellPayload);

        const cha = darvell.abilities.find(a => a.abbr === 'CHA')!;
        const dex = darvell.abilities.find(a => a.abbr === 'DEX')!;
        expect(cha.score).toBe(20);
        expect(cha.modifier).toBe(5);
        expect(dex.score).toBe(15);
        expect(dex.modifier).toBe(2);

        // Spellcasting DC and attack bonus with CHA +5 and PB +6 (level 19: Bard 9 / Warlock 10)
        expect(darvell.vitals.spellSaveDc).toBe(19); // 8 + 6 (PB) + 5 (CHA) = 19
        expect(darvell.vitals.spellAttackBonus).toBe(11); // 6 (PB) + 5 (CHA) = 11
        expect(cha.save).toBe(11); // 5 (CHA) + 6 (PB) = 11
        expect(cha.proficientSave).toBe(true);

        // Choice proficiencies with isGranted: false are retained
        const arcanaSkill = darvell.skills.find(s => s.name === 'Arcana')!;
        expect(arcanaSkill.proficiency).toBe('proficient');
        expect(arcanaSkill.bonus).toBe(0 + 6); // INT (0) + PB (6) = 6

        const deceptionSkill = darvell.skills.find(s => s.name === 'Deception')!;
        expect(deceptionSkill.proficiency).toBe('expertise');
        expect(deceptionSkill.bonus).toBe(5 + 6 * 2); // CHA (5) + 2 * PB (12) = 17

        expect(cha.baseScore).toBe(15);
        expect(cha.bonus).toBe(5);
        expect(dex.baseScore).toBe(14);
        expect(dex.bonus).toBe(1);
    });

    it('only edits the base score in edit mode and stacks all modifiers on top', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');
        const { initEditModeController } = await import('../../../src/views/characterSheet/controllers/editMode.ctrl');

        const rawPayload = {
            id: 138310322,
            name: 'Darvell',
            classes: [
                { level: 9, definition: { name: 'Bard', spellCastingAbilityId: 6 }, subclassDefinition: { name: 'College of Glamour' } },
                { level: 10, definition: { name: 'Warlock', spellCastingAbilityId: 6 }, subclassDefinition: { name: 'The Great Old One' } }
            ],
            stats: [
                { id: 1, value: 8 },
                { id: 2, value: 14 },
                { id: 3, value: 12 },
                { id: 4, value: 10 },
                { id: 5, value: 13 },
                { id: 6, value: 15 }
            ],
            modifiers: {
                class: [
                    { id: 'c1', type: 'proficiency', subType: 'charisma-saving-throws', isGranted: true }
                ],
                feat: [
                    { id: 'f1', componentId: 1789100, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: true },
                    { id: 'f2', componentId: 1789112, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: false },
                    { id: 'f3', componentId: 1789209, type: 'bonus', subType: 'charisma-score', value: 1, isGranted: false },
                    { id: 'f4', componentId: 1789139, type: 'bonus', subType: 'charisma-score', value: 2, isGranted: false }
                ]
            },
            inventory: [],
            spells: {}
        };

        let activeCharacter = parseDndBeyondCharacter(rawPayload);
        const container = document.createElement('div');
        container.innerHTML = renderSheetContent(activeCharacter);

        const ctx: any = {
            sheet: container,
            dynamicContainer: container,
            getCharacter: () => activeCharacter,
            setCharacter: (c: any) => { activeCharacter = c; },
            updateAbilityBaseScore: (abilityIndex: number, newBaseScore: number) => {
                const statId = abilityIndex + 1;
                const statObj = rawPayload.stats.find(s => s.id === statId);
                if (statObj) statObj.value = newBaseScore;
                activeCharacter = parseDndBeyondCharacter(rawPayload);
            }
        };

        const editCtrl = initEditModeController(ctx);
        editCtrl.enableCardLayoutEditors();

        // Charisma is index 5
        const cards = container.querySelectorAll('.ability-card');
        const chaCard = cards[5];
        const chaInput = chaCard.querySelector<HTMLInputElement>('.ability-base-input')!;
        const chaModEl = chaCard.querySelector<HTMLElement>('.ability-mod')!;
        const chaSaveEl = chaCard.querySelector<HTMLElement>('.save-val')!;
        const totalHintEl = chaCard.querySelector<HTMLElement>('.ability-total-hint')!;

        // Value in input is the BASE score (15), hint displays Total: 20 (+5)
        expect(chaInput.value).toBe('15');
        expect(totalHintEl.textContent).toContain('Total: 20 (+5)');
        expect(chaModEl.textContent).toBe('+5');
        expect(chaSaveEl.textContent).toBe('+11');

        // Edit base score to 14: total should become 14 + 5 = 19, modifier should become +4, save +10
        chaInput.value = '14';
        chaInput.dispatchEvent(new Event('input'));

        expect(activeCharacter.abilities[5].baseScore).toBe(14);
        expect(activeCharacter.abilities[5].score).toBe(19);
        expect(activeCharacter.abilities[5].modifier).toBe(4);
        expect(chaModEl.textContent).toBe('+4');
        expect(chaSaveEl.textContent).toBe('+10');
        expect(totalHintEl.textContent).toContain('Total: 19 (+5)');

        // Edit base score to 16: total should become 16 + 5 = 21, modifier should become +5, save +11
        chaInput.value = '16';
        chaInput.dispatchEvent(new Event('input'));

        expect(activeCharacter.abilities[5].baseScore).toBe(16);
        expect(activeCharacter.abilities[5].score).toBe(21);
        expect(activeCharacter.abilities[5].modifier).toBe(5);
        expect(chaModEl.textContent).toBe('+5');
        expect(chaSaveEl.textContent).toBe('+11');
        expect(totalHintEl.textContent).toContain('Total: 21 (+5)');
    });

    it('properly restores baseScore and bonus on a saved character where baseScore was not originally saved', async () => {
        const { ensureBaseScoresOnCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');
        const { initEditModeController } = await import('../../../src/views/characterSheet/controllers/editMode.ctrl');

        // Character object simulating old saved character in DB (no baseScore, no bonus)
        const savedCharFromDb: any = {
            id: 138310322,
            name: 'Darvell',
            source: 'dndbeyond',
            level: 19,
            classes: [{ name: 'Bard', level: 9 }, { name: 'Warlock', level: 10 }],
            vitals: {
                currentHp: 150,
                maxHp: 150,
                armorClass: 15,
                initiative: 2,
                speed: '30 ft.',
                proficiencyBonus: 6,
                spellSaveDc: 19,
                spellAttackBonus: 11
            },
            abilities: [
                { name: 'Strength', abbr: 'STR', score: 8, modifier: -1, save: -1, proficientSave: false },
                { name: 'Dexterity', abbr: 'DEX', score: 15, modifier: 2, save: 8, proficientSave: true },
                { name: 'Constitution', abbr: 'CON', score: 12, modifier: 1, save: 1, proficientSave: false },
                { name: 'Intelligence', abbr: 'INT', score: 10, modifier: 0, save: 0, proficientSave: false },
                { name: 'Wisdom', abbr: 'WIS', score: 13, modifier: 1, save: 1, proficientSave: false },
                { name: 'Charisma', abbr: 'CHA', score: 20, modifier: 5, save: 11, proficientSave: true }
            ],
            skills: [
                { name: 'Deception', stat: 'CHA', bonus: 17, proficiency: 'expertise' }
            ],
            spellSlots: {},
            features: [
                { name: 'Actor', type: 'Feat', description: 'Your Charisma score increases by 1.' },
                { name: 'Boon of Fate', type: 'Feat', description: 'Increase one ability score by 1 (Charisma).' },
                { name: 'War Caster', type: 'Feat', description: 'Increase your Charisma score by 1.' },
                { name: 'Entertainer Ability Score Improvements', type: 'Feat', description: '+2 Charisma, +1 Dexterity' }
            ],
            actions: [],
            spells: [],
            equipment: [],
            weapons: [],
            proficiencies: { armor: [], weapons: [], tools: [], languages: [] }
        };

        // Before ensureBaseScores, baseScore is undefined
        expect(savedCharFromDb.abilities[5].baseScore).toBeUndefined();

        // ensureBaseScoresOnCharacter restores baseScore=15, bonus=5 for CHA, and baseScore=14, bonus=1 for DEX
        ensureBaseScoresOnCharacter(savedCharFromDb);
        expect(savedCharFromDb.abilities[5].baseScore).toBe(15);
        expect(savedCharFromDb.abilities[5].bonus).toBe(5);
        expect(savedCharFromDb.abilities[1].baseScore).toBe(14);
        expect(savedCharFromDb.abilities[1].bonus).toBe(1);

        const container = document.createElement('div');
        container.innerHTML = renderSheetContent(savedCharFromDb);

        const ctx: any = {
            sheet: container,
            dynamicContainer: container,
            getCharacter: () => savedCharFromDb,
            setCharacter: (c: any) => { },
            updateAbilityBaseScore: (abilityIndex: number, newBaseScore: number) => {
                const ab = savedCharFromDb.abilities[abilityIndex];
                ab.baseScore = newBaseScore;
                ab.score = newBaseScore + ab.bonus;
                ab.modifier = Math.floor((ab.score - 10) / 2);
                ab.save = ab.modifier + (ab.proficientSave ? 6 : 0);
            }
        };

        const editCtrl = initEditModeController(ctx);
        editCtrl.enableCardLayoutEditors();

        const cards = container.querySelectorAll('.ability-card');
        const chaCard = cards[5];
        const chaInput = chaCard.querySelector<HTMLInputElement>('.ability-base-input')!;
        const totalHintEl = chaCard.querySelector<HTMLElement>('.ability-total-hint')!;

        // The input MUST display the base score (15), NOT the total score (20)
        expect(chaInput.value).toBe('15');
        expect(totalHintEl.textContent).toContain('Total: 20 (+5)');

        // Editing base to 16 updates total to 21 (+5)
        chaInput.value = '16';
        chaInput.dispatchEvent(new Event('input'));
        expect(savedCharFromDb.abilities[5].baseScore).toBe(16);
        expect(savedCharFromDb.abilities[5].score).toBe(21);
        expect(totalHintEl.textContent).toContain('Total: 21 (+5)');

        // Only core stats, name, species, background, alignment, class, and ability base scores should be editable
        const nameInput = container.querySelector<HTMLInputElement>('.character-name input');
        const classInput = container.querySelector<HTMLInputElement>('.character-class-input');
        expect(nameInput).not.toBeNull();
        expect(nameInput?.value).toBe('Darvell');
        expect(classInput).not.toBeNull();
        expect(classInput?.value).toBe('Bard 9 / Warlock 10');

        // Derived stats must NOT have inputs
        expect(container.querySelector('.vital-ac input')).toBeNull();
        expect(container.querySelector('.vital-init input')).toBeNull();
        expect(container.querySelector('.vital-dc input')).toBeNull();
        expect(container.querySelector('.vital-attack input')).toBeNull();
        expect(container.querySelector('.skill-bonus input')).toBeNull();
    });

    it('allows locking editable fields so that refreshing from D&D Beyond does not overwrite them', async () => {
        const { parseDndBeyondCharacter, applyLockedFieldsToRefreshedCharacter } = await import(
            '../../../src/views/characterSheet/characterAdapter'
        );
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');
        const { initEditModeController } = await import('../../../src/views/characterSheet/controllers/editMode.ctrl');

        // Initial character with custom/edited values and locked fields
        const localChar: any = {
            id: 138310322,
            name: 'Custom Darvell Name',
            source: 'dndbeyond',
            level: 20,
            classes: [{ name: 'Bard', level: 10 }, { name: 'Warlock', level: 10 }],
            subtitle: 'Bard 10 / Warlock 10 • Level 20',
            race: 'Aasimar',
            background: 'Custom Entertainer',
            alignment: 'Neutral Good',
            vitals: {
                currentHp: 160,
                maxHp: 160,
                armorClass: 15,
                initiative: 2,
                speed: '30 ft.',
                proficiencyBonus: 6,
                spellSaveDc: 19,
                spellAttackBonus: 11
            },
            abilities: [
                { name: 'Strength', abbr: 'STR', score: 8, baseScore: 8, bonus: 0, modifier: -1, save: -1, proficientSave: false },
                { name: 'Dexterity', abbr: 'DEX', score: 15, baseScore: 14, bonus: 1, modifier: 2, save: 8, proficientSave: true },
                { name: 'Constitution', abbr: 'CON', score: 12, baseScore: 12, bonus: 0, modifier: 1, save: 1, proficientSave: false },
                { name: 'Intelligence', abbr: 'INT', score: 10, baseScore: 10, bonus: 0, modifier: 0, save: 0, proficientSave: false },
                { name: 'Wisdom', abbr: 'WIS', score: 13, baseScore: 13, bonus: 0, modifier: 1, save: 1, proficientSave: false },
                { name: 'Charisma', abbr: 'CHA', score: 22, baseScore: 17, bonus: 5, modifier: 6, save: 12, proficientSave: true }
            ],
            skills: [
                { name: 'Deception', stat: 'CHA', bonus: 18, proficiency: 'expertise' }
            ],
            spellSlots: {},
            features: [],
            actions: [],
            spells: [],
            equipment: [],
            weapons: [],
            proficiencies: { armor: [], weapons: [], tools: [], languages: [] },
            lockedFields: {
                name: true,
                classes: true,
                race: true,
                'vitals.maxHp': true,
                'abilities.CHA': true
            }
        };

        const container = document.createElement('div');
        container.innerHTML = renderSheetContent(localChar);

        const ctx: any = {
            sheet: container,
            dynamicContainer: container,
            getCharacter: () => localChar,
            setCharacter: (c: any) => { },
            isFieldLocked: (k: string) => !!localChar.lockedFields[k],
            toggleFieldLock: (k: string) => {
                localChar.lockedFields[k] = !localChar.lockedFields[k];
                return localChar.lockedFields[k];
            },
            updateAbilityBaseScore: () => { }
        };

        const editCtrl = initEditModeController(ctx);
        editCtrl.enableCardLayoutEditors();

        // Check lock button presence and state on editable fields
        const nameLockBtn = container.querySelector<HTMLButtonElement>('.character-name .field-lock-btn');
        const classLockBtn = container.querySelector<HTMLButtonElement>('.character-classes .field-lock-btn');
        const chaLockBtn = container.querySelector<HTMLButtonElement>('.ability-card .ability-lock-btn[data-lock-key="abilities.CHA"]');
        const maxHpLockBtn = container.querySelector<HTMLButtonElement>('.vital-hp .field-lock-btn[data-lock-key="vitals.maxHp"]');

        expect(nameLockBtn).not.toBeNull();
        expect(nameLockBtn?.classList.contains('is-locked')).toBe(true);
        expect(classLockBtn?.classList.contains('is-locked')).toBe(true);
        expect(chaLockBtn?.classList.contains('is-locked')).toBe(true);
        expect(maxHpLockBtn?.classList.contains('is-locked')).toBe(true);

        // Clicking toggle unlocks the field
        nameLockBtn?.click();
        expect(localChar.lockedFields.name).toBe(false);
        expect(nameLockBtn?.classList.contains('is-locked')).toBe(false);

        // Clicking toggle again locks the field
        nameLockBtn?.click();
        expect(localChar.lockedFields.name).toBe(true);
        expect(nameLockBtn?.classList.contains('is-locked')).toBe(true);

        // Simulate a fresh D&D Beyond re-pull payload
        const freshDndBeyondPayload = {
            id: 138310322,
            name: 'Original Darvell on D&D Beyond',
            classes: [
                { level: 9, definition: { name: 'Bard' } },
                { level: 10, definition: { name: 'Warlock' } }
            ],
            race: { fullName: 'Elf' },
            background: { definition: { name: 'Entertainer' } },
            alignmentId: 4,
            baseHitPoints: 120,
            stats: [
                { id: 1, value: 8 },
                { id: 2, value: 14 },
                { id: 3, value: 12 },
                { id: 4, value: 10 },
                { id: 5, value: 13 },
                { id: 6, value: 15 } // base 15 on D&D Beyond
            ],
            modifiers: {
                feat: [
                    { componentId: 1, type: 'bonus', subType: 'charisma-score', value: 5, isGranted: true }
                ]
            },
            inventory: [],
            spells: {}
        };

        const refreshed = parseDndBeyondCharacter(freshDndBeyondPayload);
        // Before applying locks, refreshed character has upstream D&D Beyond values
        expect(refreshed.name).toBe('Original Darvell on D&D Beyond');
        expect(refreshed.abilities[5].score).toBe(20); // 15 + 5
        expect(refreshed.race).toBe('Elf');

        // Apply locks from localChar
        applyLockedFieldsToRefreshedCharacter(refreshed, localChar);

        // Locked fields are PRESERVED!
        expect(refreshed.name).toBe('Custom Darvell Name'); // preserved
        expect(refreshed.classes.length).toBe(2);
        expect(refreshed.classes[0].level).toBe(10); // preserved custom level 10
        expect(refreshed.race).toBe('Aasimar'); // preserved
        expect(refreshed.vitals.maxHp).toBe(160); // preserved custom max HP
        expect(refreshed.abilities[5].baseScore).toBe(17); // preserved custom base score
        expect(refreshed.abilities[5].score).toBe(22); // 17 + 5 bonus = 22

        // Non-locked fields ARE updated from upstream D&D Beyond
        expect(refreshed.background).toBe('Entertainer'); // updated from D&D Beyond
        expect(refreshed.alignment).toBe('Lawful Neutral'); // updated from D&D Beyond
    });

    it('generates black & white outline PDF pages with fillable HP boxes and spell slot bubbles', async () => {
        const { generatePdfHtmlPages, getPdfStyles } = await import(
            '../../../src/views/characterSheet/services/pdfExport'
        );
        const { renderLoaderBar } = await import('../../../src/views/characterSheet/components/loaderBar');

        // Check loader bar button
        const loaderHtml = renderLoaderBar();
        expect(loaderHtml).toContain('id="export-pdf-sheet-btn"');
        expect(loaderHtml).toContain('Export B&W PDF');

        // Check PDF styles have black & white outlines
        const styles = getPdfStyles();
        expect(styles).toContain('background: #ffffff !important');
        expect(styles).toContain('color: #000000 !important');
        expect(styles).toContain('border: 1.5px solid #000000');

        const mockCharacter: any = {
            name: 'Darvell',
            level: 19,
            classes: [{ name: 'Bard', level: 9 }, { name: 'Warlock', level: 10 }],
            race: 'Aasimar',
            background: 'Entertainer',
            alignment: 'Lawful Neutral',
            vitals: {
                maxHp: 120,
                currentHp: 120,
                tempHp: 0,
                armorClass: 15,
                initiative: 2,
                speed: '30 ft.',
                proficiencyBonus: 6,
                spellSaveDc: 19,
                spellAttackBonus: 11,
                spellcastingAbility: 'Charisma',
                passivePerception: 11,
                passiveInvestigation: 10,
                passiveInsight: 11,
                darkvision: '60 ft.'
            },
            abilities: [
                { name: 'Strength', abbr: 'STR', score: 8, baseScore: 8, modifier: -1, save: -1, proficientSave: false },
                { name: 'Dexterity', abbr: 'DEX', score: 14, baseScore: 14, modifier: 2, save: 8, proficientSave: true },
                { name: 'Constitution', abbr: 'CON', score: 12, baseScore: 12, modifier: 1, save: 1, proficientSave: false },
                { name: 'Intelligence', abbr: 'INT', score: 10, baseScore: 10, modifier: 0, save: 0, proficientSave: false },
                { name: 'Wisdom', abbr: 'WIS', score: 13, baseScore: 13, modifier: 1, save: 1, proficientSave: false },
                { name: 'Charisma', abbr: 'CHA', score: 20, baseScore: 15, modifier: 5, save: 11, proficientSave: true }
            ],
            skills: [
                { name: 'Acrobatics', stat: 'DEX', bonus: 8, proficiency: 'proficient' },
                { name: 'Deception', stat: 'CHA', bonus: 17, proficiency: 'expertise' }
            ],
            spellSlots: {
                level1: { total: 4, label: '1st Level' },
                level2: { total: 3, label: '2nd Level' },
                level3: { total: 3, label: '3rd Level' },
                level4: { total: 3, label: '4th Level' },
                level5: { total: 1, label: '5th Level' },
                pact: { total: 2, level: 5, label: 'Pact Magic' }
            },
            weapons: [
                { name: 'Rapier', attackBonus: '+8', damage: '1d8+2', damageType: 'Piercing', properties: ['Finesse'] }
            ],
            features: [
                { name: 'Bardic Inspiration', source: 'Bard', type: 'Class', description: 'Inspire allies with 1d10 die.' }
            ],
            equipment: [
                { name: 'Leather Armor', quantity: 1, type: 'Armor' }
            ],
            proficiencies: {
                armor: ['Light Armor'],
                weapons: ['Simple Weapons', 'Rapiers'],
                tools: ['Disguise Kit'],
                languages: ['Common', 'Elvish']
            },
            spells: [
                { name: 'Vicious Mockery', level: 0, castingTime: '1 Action', range: '60 ft.' },
                { name: 'Healing Word', level: 1, castingTime: '1 Bonus Action', range: '60 ft.' }
            ]
        };

        const pages = generatePdfHtmlPages(mockCharacter);
        expect(pages.length).toBe(3);

        // Page 1: Core Stats, Outlines, Fillable HP
        expect(pages[0]).toContain('Darvell');
        expect(pages[0]).toContain('pdf-abilities-col');
        expect(pages[0]).toContain('CURRENT HIT POINTS');
        expect(pages[0]).toContain('TEMPORARY HIT POINTS');
        expect(pages[0]).toContain('pdf-hp-box-blank');
        expect(pages[0]).toContain('Hit Point Maximum:');
        expect(pages[0]).toContain('120');
        expect(pages[0]).toContain('DEATH SAVES');
        expect(pages[0]).toContain('◯ ◯ ◯');

        // Page 2: Features, Traits, Equipment
        expect(pages[1]).toContain('FEATURES &amp; TRAITS');
        expect(pages[1]).toContain('Bardic Inspiration');
        expect(pages[1]).toContain('EQUIPMENT &amp; CURRENCY');

        // Page 3: Spellcasting & Fillable Spell Slots
        expect(pages[2]).toContain('Spellcasting &amp; Spell Slots');
        expect(pages[2]).toContain('PACT MAGIC (Level 5)');
        expect(pages[2]).toContain('1ST LEVEL');
        expect(pages[2]).toContain('pdf-slot-bubbles');
        expect(pages[2]).toContain('pdf-bubble');

        // Test reMarkable 3:4 e-reader format option
        const remarkablePages = generatePdfHtmlPages(mockCharacter, 'remarkable');
        expect(remarkablePages.length).toBe(3);
        expect(remarkablePages[0]).toContain('pdf-format-remarkable');
        const remarkableStyles = getPdfStyles('remarkable');
        expect(remarkableStyles).toContain('width: 792px');
        expect(remarkableStyles).toContain('height: 1056px');

        const letterStyles = getPdfStyles('letter');
        expect(letterStyles).toContain('width: 816px');
        expect(letterStyles).toContain('height: 1056px');
    });

    it('renders export PDF format selection modal in character sheet template', () => {
        const sheet = characterSheetTemplate();
        const exportModal = sheet.querySelector('#export-pdf-modal-container');
        expect(exportModal).not.toBeNull();
        expect(exportModal?.classList.contains('hidden')).toBe(true);

        const letterRadio = sheet.querySelector<HTMLInputElement>('#pdf-format-letter');
        const remarkableRadio = sheet.querySelector<HTMLInputElement>('#pdf-format-remarkable');
        const confirmBtn = sheet.querySelector<HTMLButtonElement>('#export-pdf-confirm-btn');
        const cancelBtn = sheet.querySelector<HTMLButtonElement>('#export-pdf-cancel-btn');

        expect(letterRadio).not.toBeNull();
        expect(letterRadio?.value).toBe('letter');
        expect(letterRadio?.checked).toBe(true);

        expect(remarkableRadio).not.toBeNull();
        expect(remarkableRadio?.value).toBe('remarkable');

        expect(confirmBtn).not.toBeNull();
        expect(cancelBtn).not.toBeNull();
    });

    it('switches between normal HP mode and death saving throw mechanism when HP is 0', async () => {
        const { renderVitalsSection } = await import('../../../src/views/characterSheet/components/vitals');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');

        // Test normal HP (> 0)
        const livingChar = {
            ...darvellData,
            vitals: {
                ...darvellData.vitals,
                currentHp: 45,
                maxHp: 80
            }
        };
        const livingHtml = renderVitalsSection(livingChar);
        expect(livingHtml).toContain('id="hp-normal-mode"');
        expect(livingHtml).toContain('id="hp-death-saves-mode"');
        expect(livingHtml).toContain('id="hp-death-saves-mode" class="hp-mode-container death-saves-container hidden"');

        // Test HP at 0 (Dying)
        const dyingChar = {
            ...darvellData,
            vitals: {
                ...darvellData.vitals,
                currentHp: 0,
                maxHp: 80,
                deathSaves: { successes: 1, failures: 2, isStable: false }
            }
        };
        const dyingHtml = renderVitalsSection(dyingChar);
        expect(dyingHtml).toContain('vital-card vital-hp is-dying');
        expect(dyingHtml).toContain('id="hp-normal-mode" class="hp-mode-container hidden"');
        expect(dyingHtml).toContain('id="hp-death-saves-mode" class="hp-mode-container death-saves-container "');
        expect(dyingHtml).toContain('DEATH SAVES');
        expect(dyingHtml).toContain('id="death-save-roll-btn"');
        expect(dyingHtml).toContain('id="death-status-badge"');
        expect(dyingHtml).toContain('DYING (0 HP)');
    });

    it('renders action details modal with dedicated full-width damage/effect meta box', async () => {
        const { renderModals } = await import('../../../src/views/characterSheet/components/modals');
        const modalsHtml = renderModals();
        expect(modalsHtml).toContain('id="action-modal-container"');
        expect(modalsHtml).toContain('action-modal-meta-grid');
        expect(modalsHtml).toContain('id="modal-action-range"');
        expect(modalsHtml).toContain('id="modal-action-hit-dc"');
        expect(modalsHtml).toContain('class="meta-box meta-box-damage"');
        expect(modalsHtml).toContain('id="modal-action-damage"');
    });

    it('renders manage weapons & items modal markup and manage buttons', async () => {
        const { renderModals } = await import('../../../src/views/characterSheet/components/modals');
        const modalsHtml = renderModals();
        expect(modalsHtml).toContain('id="manage-items-modal-container"');
        expect(modalsHtml).toContain('id="manage-items-search-input"');
        expect(modalsHtml).toContain('id="manage-items-type-select"');
        expect(modalsHtml).toContain('id="manage-items-db-results"');
        expect(modalsHtml).toContain('id="manage-items-current-list"');
        expect(modalsHtml).toContain('id="manage-items-close-btn"');
        expect(modalsHtml).toContain('id="manage-items-done-btn"');

        const { renderSheetContent } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');
        const sheetHtml = renderSheetContent(darvellData);
        expect(sheetHtml).toContain('id="open-manage-weapons-btn"');
        expect(sheetHtml).toContain('id="open-manage-equipment-btn"');
    });

    it('applies magical weapon and item bonuses to character stats accurately', async () => {
        const { applyMagicalItemBonuses } = await import('../../../src/views/characterSheet/services/magicItemBonuses');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');

        const testChar = JSON.parse(JSON.stringify(darvellData));
        testChar.abilities = [
            { name: "Strength", abbr: "STR", score: 14, modifier: 2, save: 2, proficientSave: false, baseScore: 14, bonus: 0 },
            { name: "Dexterity", abbr: "DEX", score: 14, modifier: 2, save: 2, proficientSave: false, baseScore: 14, bonus: 0 },
            { name: "Constitution", abbr: "CON", score: 14, modifier: 2, save: 5, proficientSave: true, baseScore: 14, bonus: 0 },
            { name: "Intelligence", abbr: "INT", score: 10, modifier: 0, save: 0, proficientSave: false, baseScore: 10, bonus: 0 },
            { name: "Wisdom", abbr: "WIS", score: 12, modifier: 1, save: 1, proficientSave: false, baseScore: 12, bonus: 0 },
            { name: "Charisma", abbr: "CHA", score: 18, modifier: 4, save: 7, proficientSave: true, baseScore: 16, bonus: 2 }
        ];
        testChar.vitals = {
            currentHp: 40,
            maxHp: 40,
            tempHp: 0,
            armorClass: 16,
            initiative: 2,
            speed: "30 ft.",
            proficiencyBonus: 3,
            passivePerception: 11,
            passiveInvestigation: 10,
            passiveInsight: 11,
            hitDice: "5d8",
            heroicInspiration: false,
            spellSaveDc: 15,
            spellAttackBonus: 7,
            spellcastingAbility: "Charisma (+4)"
        };
        testChar.skills = [
            { name: "Athletics", stat: "STR", bonus: 5, proficiency: "proficient" },
            { name: "Arcana", stat: "INT", bonus: 0, proficiency: "none" }
        ];
        testChar.weapons = [
            {
                name: "Longsword, +1",
                quantity: 1,
                equipped: true,
                category: "Martial Melee",
                damage: "1d8 + 2 Slashing",
                damageType: "Slashing",
                damageDie: "1d8",
                attackBonus: "+5",
                toHitModifier: 5,
                range: "Reach 5 ft.",
                properties: ["Versatile"]
            }
        ];
        testChar.equipment = [
            {
                name: "Gauntlets of Ogre Power",
                quantity: 1,
                equipped: true,
                type: "Wondrous Item",
                isMagic: true,
                description: "Your Strength score is 19 while you wear these gauntlets."
            },
            {
                name: "Cloak of Protection",
                quantity: 1,
                equipped: true,
                type: "Wondrous Item",
                isMagic: true,
                description: "You gain a +1 bonus to AC and saving throws while you wear this cloak."
            },
            {
                name: "Rod of the Pact Keeper, +2",
                quantity: 1,
                equipped: true,
                type: "Rod",
                isMagic: true,
                description: "You gain a +2 bonus to spell attack rolls and to the saving throw DCs of your warlock spells."
            }
        ];

        applyMagicalItemBonuses(testChar);

        // 1. Gauntlets of Ogre Power should override STR to 19 (+4 modifier)
        const strAbility = testChar.abilities.find((a: any) => a.abbr === "STR");
        expect(strAbility?.score).toBe(19);
        expect(strAbility?.modifier).toBe(4);
        // Save should be STR mod (4) + Cloak of Protection (+1) = 5
        expect(strAbility?.save).toBe(5);

        // 2. Athletics skill should update: STR mod (4) + proficiency (3) = 7
        const athletics = testChar.skills.find((s: any) => s.name === "Athletics");
        expect(athletics?.bonus).toBe(7);

        // 3. Cloak of Protection should add +1 to AC: 16 + 1 = 17
        expect(testChar.vitals.armorClass).toBe(17);

        // 4. Rod of the Pact Keeper +2 should add +2 to Spell Save DC (15 + 2 = 17) and Spell Attack (7 + 2 = 9)
        expect(testChar.vitals.spellSaveDc).toBe(17);
        expect(testChar.vitals.spellAttackBonus).toBe(9);

        // 5. Longsword, +1 should incorporate STR mod (+4) + prof (+3) + magic bonus (+1) = +8 to hit
        const longsword = testChar.weapons[0];
        expect(longsword.toHitModifier).toBe(8);
        expect(longsword.attackBonus).toBe("+8");
        // Damage: 1d8 + (STR mod 4 + magic 1 = 5) Slashing
        expect(longsword.damage).toContain("+ 5");

        // 6. Unequipping Gauntlets of Ogre Power should restore natural STR 14 (+2 mod)
        testChar.equipment[0].equipped = false;
        applyMagicalItemBonuses(testChar);

        const restoredStr = testChar.abilities.find((a: any) => a.abbr === "STR");
        expect(restoredStr?.score).toBe(14);
        expect(restoredStr?.modifier).toBe(2);
        // Save: STR mod (2) + Cloak of Protection (+1) = 3
        expect(restoredStr?.save).toBe(3);
        // Athletics: STR mod (2) + prof (3) = 5
        expect(testChar.skills.find((s: any) => s.name === "Athletics")?.bonus).toBe(5);
        // Longsword: STR mod (2) + prof (3) + magic (1) = +6 to hit
        expect(testChar.weapons[0].toHitModifier).toBe(6);
        expect(testChar.weapons[0].attackBonus).toBe("+6");
    });

    it('ensures mundane weapons like Darvell dagger are not marked as magic and render no magic badge', async () => {
        const { isMundaneEquipment, applyMagicalItemBonuses } = await import('../../../src/views/characterSheet/services/magicItemBonuses');
        const { renderWeapons } = await import('../../../src/views/characterSheet/components/weapons');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');

        expect(isMundaneEquipment('Dagger')).toBe(true);
        expect(isMundaneEquipment('Dagger (Melee/Ranged)')).toBe(true);
        expect(isMundaneEquipment('Leather Armor')).toBe(true);
        expect(isMundaneEquipment('+1 Dagger')).toBe(false);
        expect(isMundaneEquipment('Dagger of Venom')).toBe(false);

        const charClone = JSON.parse(JSON.stringify(darvellData));
        applyMagicalItemBonuses(charClone);

        const dagger = charClone.weapons?.find((w: any) => w.name === 'Dagger');
        expect(dagger).toBeDefined();
        expect(dagger.isMagic).toBe(false);

        const renderedWeaponsHtml = renderWeapons(charClone);
        expect(renderedWeaponsHtml).toContain('Dagger');
        expect(renderedWeaponsHtml).not.toContain('weapon-badge magic');
        expect(renderedWeaponsHtml).not.toContain('Magic</span>');
    });

    it('renders and toggles attunement buttons for items and weapons requiring attunement', async () => {
        const { checkItemRequiresAttunement, applyMagicalItemBonuses } = await import('../../../src/views/characterSheet/services/magicItemBonuses');
        const { renderEquipment } = await import('../../../src/views/characterSheet/components/equipment');
        const { renderWeapons } = await import('../../../src/views/characterSheet/components/weapons');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');

        // Check attunement detection
        expect(checkItemRequiresAttunement({ name: 'Ring of Protection', description: 'Requires attunement' })).toBe(true);
        expect(checkItemRequiresAttunement({ name: 'Backpack', attuned: false })).toBe(false);
        expect(checkItemRequiresAttunement({ name: 'Custom Ring', requiresAttunement: true })).toBe(true);

        const charClone = JSON.parse(JSON.stringify(darvellData));
        // Give character an attuned Cloak of Protection (+1 AC, +1 Saves, requires attunement)
        charClone.equipment.push({
            id: 9991,
            name: 'Cloak of Protection',
            type: 'Wondrous item',
            quantity: 1,
            equipped: true,
            attuned: true,
            requiresAttunement: true,
            description: 'Requires attunement. You gain a +1 bonus to AC and saving throws.'
        });

        // And an unattuned Ring of Protection
        charClone.equipment.push({
            id: 9992,
            name: 'Ring of Protection',
            type: 'Ring',
            quantity: 1,
            equipped: true,
            attuned: false,
            requiresAttunement: true,
            description: 'Requires attunement. You gain a +1 bonus to AC and saving throws.'
        });

        // And a non-attunement Wand of Magic Missiles
        charClone.equipment.push({
            id: 9993,
            name: 'Wand of Magic Missiles',
            type: 'Wand',
            quantity: 1,
            equipped: true,
            attuned: false,
            requiresAttunement: false,
            description: 'This wand has 7 charges.'
        });

        const equipHtml = renderEquipment(charClone);
        // Cloak of Protection should have attuned button
        expect(equipHtml).toContain('data-item-name="Cloak%20of%20Protection"');
        expect(equipHtml).toContain('attune-toggle-btn attuned');
        expect(equipHtml).toContain('Attuned');

        // Ring of Protection should have unattuned button
        expect(equipHtml).toContain('data-item-name="Ring%20of%20Protection"');
        expect(equipHtml).toContain('attune-toggle-btn unattuned');
        expect(equipHtml).toContain('Unattuned');

        // Wand of Magic Missiles should NOT have attune toggle button
        expect(equipHtml).not.toContain('data-item-name="Wand%20of%20Magic%20Missiles" class="item-badge attune-toggle-btn');

        // Test weapons attunement rendering
        charClone.weapons = [
            {
                id: 8881,
                name: 'Moonblade',
                category: 'Martial Weapon (Melee)',
                damage: '1d8 + 3',
                damageType: 'Slashing',
                damageDie: '1d8',
                attackBonus: '+5',
                range: 'Reach 5 ft.',
                properties: ['Finesse', 'Versatile'],
                equipped: true,
                attuned: true,
                requiresAttunement: true,
                description: 'Requires attunement by an elf or half-elf of neutral good alignment.'
            },
            {
                id: 8882,
                name: 'Dagger',
                category: 'Simple Weapon (Melee)',
                damage: '1d4 + 2',
                damageType: 'Piercing',
                damageDie: '1d4',
                attackBonus: '+4',
                range: '20/60 ft.',
                properties: ['Finesse', 'Light', 'Thrown'],
                equipped: true,
                attuned: false,
                requiresAttunement: false
            }
        ];

        const wepHtml = renderWeapons(charClone);
        expect(wepHtml).toContain('data-weapon-name="Moonblade"');
        expect(wepHtml).toContain('attune-toggle-btn attuned');
        expect(wepHtml).not.toContain('data-weapon-name="Dagger" class="weapon-badge attune-toggle-btn');

        // Check bonus application when attuned vs unattuned
        const baseAc = charClone.vitals.armorClass;
        applyMagicalItemBonuses(charClone);
        // Cloak of Protection is attuned (+1 AC), Ring of Protection is unattuned (+0 AC)
        expect(charClone.vitals.armorClass).toBe(baseAc + 1);

        // Now unattune the Cloak and re-apply bonuses
        charClone.equipment.find((i: any) => i.name === 'Cloak of Protection').attuned = false;
        charClone.vitals.armorClass = baseAc;
        applyMagicalItemBonuses(charClone);
        expect(charClone.vitals.armorClass).toBe(baseAc);
    });

    it('renders editable quantity steppers for equipment and weapons and in item modal', async () => {
        const { renderEquipment } = await import('../../../src/views/characterSheet/components/equipment');
        const { renderWeapons } = await import('../../../src/views/characterSheet/components/weapons');
        const { renderModals } = await import('../../../src/views/characterSheet/components/modals');
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');

        const charClone = JSON.parse(JSON.stringify(darvellData));
        charClone.equipment.push({
            id: 701,
            name: 'Potion of Healing',
            type: 'Potion',
            quantity: 5,
            equipped: false,
            attuned: false
        });

        // Test equipment list renders quantity stepper
        const equipHtml = renderEquipment(charClone);
        expect(equipHtml).toContain('class="item-qty-stepper"');
        expect(equipHtml).toContain('class="item-qty-input"');
        expect(equipHtml).toContain('value="5"');
        expect(equipHtml).toContain('data-item-name="Potion%20of%20Healing"');

        // Test weapons list renders quantity stepper
        const wepHtml = renderWeapons(charClone);
        expect(wepHtml).toContain('class="item-qty-stepper weapon-qty-stepper"');
        expect(wepHtml).toContain('class="item-qty-input"');

        // Test item modal renders quantity stepper
        const modalHtml = renderModals();
        expect(modalHtml).toContain('id="modal-item-qty-stepper"');
        expect(modalHtml).toContain('id="modal-item-qty-dec"');
        expect(modalHtml).toContain('id="modal-item-qty-inc"');
        expect(modalHtml).toContain('id="modal-item-quantity-input"');
    });

    it('renders delete button for saved characters in loader bar', async () => {
        const { initLoaderBarController } = await import('../../../src/views/characterSheet/controllers/loaderBar.ctrl');
        const container = document.createElement('div');
        const dynamicContainer = document.createElement('div');
        container.appendChild(dynamicContainer);

        const mockDeleteSavedCharacter = vi.fn().mockResolvedValue(true);
        const mockSavedChars = [
            {
                id: 42,
                name: 'Elminster',
                subtitle: 'Level 20 Wizard',
                updatedAt: new Date().toISOString()
            }
        ];

        const mockCtx: any = {
            sheet: container,
            dynamicContainer,
            prefer2024Rules: { value: true },
            getSavedCharacters: () => mockSavedChars,
            loadSavedCharacter: vi.fn(),
            deleteSavedCharacter: mockDeleteSavedCharacter
        };

        const { default: el } = await import('../../../src/services/elements');
        const authSpy = vi.spyOn(el, 'isAuth', 'get').mockReturnValue(true);

        const ctrl = initLoaderBarController(mockCtx);
        ctrl.renderSavedCharacterList();

        const deleteBtn = dynamicContainer.querySelector<HTMLButtonElement>('.saved-character-delete-btn');
        expect(deleteBtn).not.toBeNull();
        expect(deleteBtn?.getAttribute('data-delete-character-id')).toBe('42');
        expect(deleteBtn?.getAttribute('title')).toBe('Delete Elminster');

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        deleteBtn?.click();
        expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Elminster'));
        expect(mockDeleteSavedCharacter).toHaveBeenCalledWith(42);
        confirmSpy.mockRestore();
        authSpy.mockRestore();
    });

    it('resets locked fields when loading a completely different character', async () => {
        const { applyLockedFieldsToRefreshedCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        // Character A (Darvell) with custom locked edits
        const charA: any = {
            id: 138310322,
            name: 'Darvell Custom Name',
            abilities: [
                { abbr: 'STR', score: 18, baseScore: 18, modifier: 4, save: 4 },
                { abbr: 'DEX', score: 14, baseScore: 14, modifier: 2, save: 2 }
            ],
            vitals: { maxHp: 50 },
            lockedFields: {
                name: true,
                'abilities.STR': true
            }
        };

        // Character B (Elminster) newly loaded from D&D Beyond
        const charB: any = {
            id: 99999999,
            name: 'Elminster',
            abilities: [
                { abbr: 'STR', score: 10, baseScore: 10, modifier: 0, save: 0 },
                { abbr: 'DEX', score: 12, baseScore: 12, modifier: 1, save: 1 }
            ],
            vitals: { maxHp: 30 }
        };

        const isSameCharacter = String(charA.id) === String(charB.id);
        expect(isSameCharacter).toBe(false);

        // When switching to a different character, locks must reset
        if (isSameCharacter && charA.lockedFields) {
            applyLockedFieldsToRefreshedCharacter(charB, charA);
        } else {
            delete charB.lockedFields;
        }

        expect(charB.lockedFields).toBeUndefined();
        expect(charB.name).toBe('Elminster');
        expect(charB.abilities[0].score).toBe(10);
    });

    it('grants an equipped Quarterstaff (+2) when Staff of the Woodlands is equipped and attuned', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { applyMagicalItemBonuses } = await import('../../../src/views/characterSheet/services/magicItemBonuses');

        const druidPayload = {
            id: 777001,
            name: 'Druid of the Circle',
            classes: [
                {
                    level: 5,
                    definition: { name: 'Druid', hitDice: 8, canCastSpells: true, spellCastingAbilityId: 5 }
                }
            ],
            baseHitPoints: 38,
            stats: [
                { id: 1, value: 14 }, // STR +2
                { id: 2, value: 12 }, // DEX +1
                { id: 3, value: 14 }, // CON +2
                { id: 4, value: 10 }, // INT +0
                { id: 5, value: 16 }, // WIS +3
                { id: 6, value: 10 }  // CHA +0
            ],
            modifiers: {},
            inventory: [
                {
                    id: 991,
                    equipped: true,
                    isAttuned: true,
                    quantity: 1,
                    definition: {
                        id: 4762,
                        name: 'Staff of the Woodlands',
                        filterType: 'Staff',
                        canAttune: true,
                        magic: true,
                        rarity: 'Rare',
                        description: '<p>This staff can be wielded as a magic <a href="/equipment/quarterstaff">Quarterstaff</a> that grants a +2 bonus to attack and damage rolls made with it. While holding it, you have a +2 bonus to spell attack rolls.</p>'
                    }
                }
            ],
            spells: {}
        };

        const char = parseDndBeyondCharacter(druidPayload);
        // Prof = +3 at level 5; STR mod = +2; Magic bonus = +2
        // To-hit = STR (+2) + Prof (+3) + Magic (+2) = +7
        // Damage = 1d6 + 4 Bludgeoning (STR +2 + Magic +2)
        const grantedWeapon = char.weapons?.find(w => w.name === 'Quarterstaff');
        expect(grantedWeapon).toBeDefined();
        expect(grantedWeapon?.equipped).toBe(true);
        expect(grantedWeapon?.isMagic).toBe(true);
        expect(grantedWeapon?.toHitModifier).toBe(7);
        expect(grantedWeapon?.attackBonus).toBe('+7');
        expect(grantedWeapon?.damage).toBe('1d6 + 4 Bludgeoning');
        expect(grantedWeapon?.category).toBe('Simple Weapon (Melee)');
        expect(grantedWeapon?.properties).toContain('Versatile (1d8)');
        expect(grantedWeapon?.grantedBy).toBe('Staff of the Woodlands');
        // Must show the description of a Quarterstaff, NOT Staff of the Woodlands
        expect(grantedWeapon?.description).toContain('Proficiency with a Quarterstaff');
        expect(grantedWeapon?.description).not.toContain('Staff of the Woodlands');

        // Corresponding weapon attack in actions tab
        const action = char.actions?.find(a => a.name === 'Quarterstaff');
        expect(action).toBeDefined();
        expect(action?.hitOrDc).toBe('+7 to hit');
        expect(action?.damageOrEffect).toBe('1d6 + 4 Bludgeoning');

        // Unequipping Staff of the Woodlands removes the granted weapon and action
        const staffItem = char.equipment.find(e => e.name === 'Staff of the Woodlands');
        expect(staffItem).toBeDefined();
        staffItem!.equipped = false;
        applyMagicalItemBonuses(char);

        const unequippedGranted = char.weapons?.find(w => w.name === 'Quarterstaff');
        expect(unequippedGranted).toBeUndefined();
        const unequippedAction = char.actions?.find(a => a.name === 'Quarterstaff');
        expect(unequippedAction).toBeUndefined();

        // Re-equipping adds it back
        staffItem!.equipped = true;
        applyMagicalItemBonuses(char);
        expect(char.weapons?.find(w => w.name === 'Quarterstaff')?.equipped).toBe(true);

        // Unattuning also removes it
        staffItem!.attuned = false;
        applyMagicalItemBonuses(char);
        expect(char.weapons?.find(w => w.name === 'Quarterstaff')).toBeUndefined();
    });

    it('supports granting other weapon types (e.g. Mace, Rapier, Dagger) from equipment', async () => {
        const { applyMagicalItemBonuses } = await import('../../../src/views/characterSheet/services/magicItemBonuses');

        const testChar: any = {
            id: 888001,
            name: 'Hero',
            level: 5,
            vitals: { proficiencyBonus: 3, armorClass: 10, speed: '30 ft.' },
            abilities: [
                { abbr: 'STR', score: 10, modifier: 0, save: 0 },
                { abbr: 'DEX', score: 16, modifier: 3, save: 3 }
            ],
            equipment: [
                {
                    name: 'Scepter of Smiting',
                    equipped: true,
                    attuned: true,
                    requiresAttunement: false,
                    description: 'This golden rod can be wielded as a magic mace.'
                },
                {
                    name: 'Duellist Cloakpin',
                    equipped: true,
                    attuned: true,
                    requiresAttunement: false,
                    description: 'Functions as a +1 rapier that grants +1 to attack and damage rolls.'
                }
            ],
            weapons: [],
            actions: []
        };

        applyMagicalItemBonuses(testChar);

        // Mace: Simple Melee (STR mod = 0, prof = 3) -> +3 to hit, 1d6 + 0 Bludgeoning
        const mace = testChar.weapons.find((w: any) => w.name === 'Mace');
        expect(mace).toBeDefined();
        expect(mace.equipped).toBe(true);
        expect(mace.isMagic).toBe(true);
        expect(mace.toHitModifier).toBe(3);
        expect(mace.damage).toBe('1d6 + 0 Bludgeoning');

        // Rapier: Finesse (uses DEX mod = 3, prof = 3, magic = 1) -> +7 to hit, 1d8 + 4 Piercing
        const rapier = testChar.weapons.find((w: any) => w.name === 'Rapier');
        expect(rapier).toBeDefined();
        expect(rapier.equipped).toBe(true);
        expect(rapier.toHitModifier).toBe(7);
        expect(rapier.damage).toBe('1d8 + 4 Piercing');
    });

    it('transforms item and spell links in descriptions to modal-triggering buttons', async () => {
        const { linkifyConditionAndSpellTags } = await import('../../../src/views/characterSheet/components/markupLinks');

        const htmlWithItemLink = '<p>This staff can be wielded as a magic <a href="/equipment/quarterstaff">Quarterstaff</a> that grants a +2 bonus.</p>';
        const resultA = linkifyConditionAndSpellTags(htmlWithItemLink);
        expect(resultA).toContain('class="inline-item-link"');
        expect(resultA).toContain('data-item-name="Quarterstaff"');
        expect(resultA).toContain('Quarterstaff');
        expect(resultA).not.toContain('href="/equipment/quarterstaff"');

        const htmlWithDndbItemLink = '<p>Functions as a <a href="https://www.dndbeyond.com/equipment/18-quarterstaff" class="tooltip">Quarterstaff</a>.</p>';
        const resultB = linkifyConditionAndSpellTags(htmlWithDndbItemLink);
        expect(resultB).toContain('class="inline-item-link"');
        expect(resultB).toContain('data-item-name="Quarterstaff"');

        const tagItem = 'You can summon a [item]Quarterstaff[/item] into your hand.';
        const resultC = linkifyConditionAndSpellTags(tagItem);
        expect(resultC).toContain('class="inline-item-link"');
        expect(resultC).toContain('data-item-name="Quarterstaff"');

        const spellLink = 'You can cast <a href="/spells/pass-without-trace">Pass without Trace</a> at will.';
        const resultD = linkifyConditionAndSpellTags(spellLink);
        expect(resultD).toContain('class="action-spell-link inline-spell-link"');
        expect(resultD).toContain('data-spell-name="Pass%20without%20Trace"');

        const htmlWithRelativeIdLink = '<p>This staff can be wielded as a magic <a href="/equipment/12-quarterstaff">Quarterstaff</a> that grants a +2 bonus.</p>';
        const resultE = linkifyConditionAndSpellTags(htmlWithRelativeIdLink);
        expect(resultE).toContain('class="inline-item-link"');
        expect(resultE).toContain('data-item-name="Quarterstaff"');

        const plainTextPhrase = '<p>This staff can be wielded as a magic quarterstaff that grants a +2 bonus.</p>';
        const resultF = linkifyConditionAndSpellTags(plainTextPhrase);
        expect(resultF).toContain('class="inline-item-link"');
        expect(resultF).toContain('data-item-name="Quarterstaff"');
    });

    it('correctly calculates Wild Shape uses for 2024 Druids and respects D&D Beyond limitedUse', async () => {
        const { parseDndBeyondCharacter, ensureClassResourcesOnCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        // Test 1: Level 9 Druid with 2024 rules (sourceId: 145) and action limitedUse (maxUses: 3)
        const mockRaw2024Druid = {
            id: 172604675,
            name: 'The nameless Firbolg',
            classes: [
                {
                    level: 9,
                    definition: {
                        name: 'Druid',
                        sources: [{ sourceId: 145 }]
                    }
                }
            ],
            actions: {
                class: [
                    {
                        name: 'Wild Shape',
                        limitedUse: {
                            maxUses: 3,
                            numberUsed: 2
                        }
                    }
                ]
            },
            modifiers: {},
            inventory: [],
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 14 },
                { id: 3, value: 14 },
                { id: 4, value: 10 },
                { id: 5, value: 16 },
                { id: 6, value: 10 }
            ]
        };

        const charA = parseDndBeyondCharacter(mockRaw2024Druid, '172604675');
        const wildShapeA = charA.classResources?.find((r: any) => r.name === 'Wild Shape');
        expect(wildShapeA).toBeDefined();
        expect(wildShapeA?.total).toBe(3);

        // Test 2: Level 9 Druid fallback without explicit action limitedUse (still gets 3 via 2024 scaling)
        const mockRawLevel9Fallback = {
            id: 999999,
            name: 'Druid Level 9',
            classes: [
                {
                    level: 9,
                    definition: {
                        name: 'Druid',
                        sources: [{ sourceId: 145 }]
                    }
                }
            ],
            actions: {},
            modifiers: {},
            inventory: [],
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 14 },
                { id: 3, value: 14 },
                { id: 4, value: 10 },
                { id: 5, value: 16 },
                { id: 6, value: 10 }
            ]
        };

        const charB = parseDndBeyondCharacter(mockRawLevel9Fallback, '999999');
        const wildShapeB = charB.classResources?.find((r: any) => r.name === 'Wild Shape');
        expect(wildShapeB).toBeDefined();
        expect(wildShapeB?.total).toBe(3);

        // Test 3: ensureClassResourcesOnCharacter heals a saved character with outdated total: 2
        const outdatedSavedChar: any = {
            name: 'The nameless Firbolg',
            classes: [{ name: 'Druid', level: 9 }],
            classResources: [{ name: 'Wild Shape', total: 2, resetOn: 'short' }]
        };
        ensureClassResourcesOnCharacter(outdatedSavedChar);
        expect(outdatedSavedChar.classResources[0].total).toBe(3);
    });

    it('does not add healing potion dice modifiers to Maximum Hit Points', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');

        const mockCharacterWithPotions = {
            id: 145444938,
            name: 'San Te',
            baseHitPoints: 48,
            bonusHitPoints: null,
            overrideHitPoints: null,
            removedHitPoints: 0,
            temporaryHitPoints: 0,
            classes: [
                {
                    level: 9,
                    definition: { name: 'Monk', hitDice: 8 }
                }
            ],
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 16 },
                { id: 3, value: 13 }, // CON 13 base + 1 feat bonus = 14 (+2 mod)
                { id: 4, value: 10 },
                { id: 5, value: 16 },
                { id: 6, value: 10 }
            ],
            modifiers: {
                feat: [
                    {
                        type: 'bonus',
                        subType: 'constitution-score',
                        value: 1,
                        fixedValue: 1
                    }
                ],
                item: [
                    {
                        id: '443',
                        type: 'bonus',
                        subType: 'hit-points',
                        fixedValue: 4,
                        dice: { diceCount: 4, diceValue: 4, fixedValue: 4, diceString: '4d4 + 4' },
                        componentId: 5133
                    },
                    {
                        id: '62627295',
                        type: 'bonus',
                        subType: 'hit-points',
                        fixedValue: 2,
                        dice: { diceCount: 2, diceValue: 4, fixedValue: 2, diceString: '2d4 + 2' },
                        componentId: 8960641
                    }
                ]
            },
            inventory: [
                {
                    id: 854458643,
                    definition: { id: 5133, name: 'Potion of Healing (Greater)', filterType: 'Potion', canEquip: false },
                    equipped: false,
                    isAttuned: false
                },
                {
                    id: 892846179,
                    definition: { id: 8960641, name: 'Potion of Healing', filterType: 'Potion', canEquip: false },
                    equipped: false,
                    isAttuned: false
                }
            ]
        };

        const char = parseDndBeyondCharacter(mockCharacterWithPotions, '145444938');
        // Base 48 + CON mod (+2) * Level 9 = 48 + 18 = 66
        // Must NOT include the +4 and +2 from potions!
        expect(char.vitals.maxHp).toBe(66);
        expect(char.vitals.currentHp).toBe(66);
    });

    it('displays general saving throw notes once in its own row underneath vital stats', async () => {
        const { parseDndBeyondCharacter, ensureSavingThrowNotesOnCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');

        const mockCharacterWithSaveAdv = {
            id: 145444938,
            name: 'San Te',
            baseHitPoints: 48,
            classes: [{ level: 9, definition: { name: 'Monk' } }],
            stats: [
                { id: 1, value: 10 },
                { id: 2, value: 16 },
                { id: 3, value: 14 },
                { id: 4, value: 10 },
                { id: 5, value: 16 },
                { id: 6, value: 10 }
            ],
            modifiers: {
                race: [
                    {
                        type: 'advantage',
                        subType: 'saving-throws',
                        restriction: 'against being charmed, and magic can’t put you to sleep'
                    }
                ]
            },
            inventory: []
        };

        const char = parseDndBeyondCharacter(mockCharacterWithSaveAdv, '145444938');
        expect(char.savingThrowNotes).toBeDefined();
        expect(char.savingThrowNotes).toContain('Advantage (against being charmed, and magic can’t put you to sleep)');

        // Individual ability cards must NOT repeat the general saving throw advantage
        char.abilities.forEach(ability => {
            expect(ability.notes).toBeUndefined();
        });

        // In rendered HTML, the note must appear exactly once in .saving-throw-notes-row directly under abilities-container
        const html = renderSheetContent(char);
        expect(html).toContain('saving-throw-notes-row');
        expect(html).toContain('Advantage (against being charmed, and magic can’t put you to sleep)');
        const occurrences = (html.match(/Advantage \(against being charmed, and magic can’t put you to sleep\)/g) || []).length;
        expect(occurrences).toBe(1);
        expect(html.indexOf('abilities-container')).toBeLessThan(html.indexOf('saving-throw-notes-row'));
        expect(html.indexOf('saving-throw-notes-row')).toBeLessThan(html.indexOf('vitals-grid'));

        // ensureSavingThrowNotesOnCharacter heals legacy payload with duplicate notes on abilities
        const legacyChar: any = {
            name: 'San Te',
            abilities: [
                { abbr: 'STR', notes: 'Advantage (against being charmed, and magic can’t put you to sleep)' },
                { abbr: 'DEX', notes: 'Advantage (against being charmed, and magic can’t put you to sleep)' },
                { abbr: 'CON', notes: 'Advantage (against being charmed, and magic can’t put you to sleep)' },
                { abbr: 'INT', notes: 'Advantage (against being charmed, and magic can’t put you to sleep)' },
                { abbr: 'WIS', notes: 'Advantage (against being charmed, and magic can’t put you to sleep)' },
                { abbr: 'CHA', notes: 'Advantage (against being charmed, and magic can’t put you to sleep)' }
            ]
        };
        ensureSavingThrowNotesOnCharacter(legacyChar);
        expect(legacyChar.savingThrowNotes).toContain('Advantage (against being charmed, and magic can’t put you to sleep)');
        legacyChar.abilities.forEach((a: any) => {
            expect(a.notes).toBeUndefined();
        });
    });

    it('accounts for 2024 species and feat actions, expendable resources, and damage resistances', async () => {
        const { parseDndBeyondCharacter, ensureClassResourcesOnCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/components/characterSheetDynamicContent');

        const mockDragonbornFighter = {
            id: 888123,
            name: 'Balthazar Flametongue',
            baseHitPoints: 44,
            stats: [
                { id: 1, value: 16 },
                { id: 2, value: 14 },
                { id: 3, value: 16 },
                { id: 4, value: 10 },
                { id: 5, value: 12 },
                { id: 6, value: 8 }
            ],
            bonusStats: [],
            overrideStats: [],
            classes: [
                {
                    level: 5,
                    definition: { name: 'Fighter' }
                }
            ],
            race: {
                fullName: 'Dragonborn',
                weightSpeeds: { normal: { walk: 30 } }
            },
            modifiers: {
                race: [
                    { type: 'resistance', subType: 'fire', isGranted: true }
                ],
                class: [],
                feat: [],
                item: []
            },
            actions: {
                race: [
                    {
                        name: 'Breath Weapon',
                        activation: { activationType: 1 },
                        range: { rangeValue: 15 },
                        snippet: 'Exhale energy in a 15-foot cone.',
                        limitedUse: { maxUses: 3, resetType: 2 }
                    }
                ],
                class: [
                    {
                        name: 'Second Wind',
                        activation: { activationType: 3 },
                        snippet: 'Regain 1d10 + level HP.',
                        limitedUse: { maxUses: 3, resetType: 1 }
                    }
                ],
                feat: [
                    {
                        name: 'Tavern Brawler: Furniture Blow',
                        activation: { activationType: 1 },
                        snippet: 'Hit with improvised weapon.',
                        limitedUse: null
                    }
                ]
            },
            inventory: []
        };

        const char = parseDndBeyondCharacter(mockDragonbornFighter, '888123');

        // 1. Actions include species action (Breath Weapon) and feat action (Tavern Brawler) alongside class action (Second Wind)
        const actionNames = char.actions.map(a => a.name);
        expect(actionNames).toContain('Breath Weapon');
        expect(actionNames).toContain('Second Wind');
        expect(actionNames).toContain('Tavern Brawler: Furniture Blow');

        const breathAction = char.actions.find(a => a.name === 'Breath Weapon');
        expect(breathAction?.type).toBe('Action');
        expect(breathAction?.rangeOrReach).toBe('15 ft.');

        const secondWindAction = char.actions.find(a => a.name === 'Second Wind');
        expect(secondWindAction?.type).toBe('Bonus Action');

        // 2. Class resources include species resources (Breath Weapon PB uses, Draconic Flight at lvl 5)
        const resourceNames = char.classResources.map(r => r.name);
        expect(resourceNames).toContain('Second Wind');
        expect(resourceNames).toContain('Breath Weapon');
        expect(resourceNames).toContain('Draconic Flight');

        const bwRes = char.classResources.find(r => r.name === 'Breath Weapon');
        expect(bwRes?.total).toBe(3);
        expect(bwRes?.resetOn).toBe('long');

        // 3. Damage resistances extracted and rendered
        expect(char.damageResistances).toContain('Fire');
        expect(char.vitals.damageResistances).toContain('Fire');

        const html = renderSheetContent(char);
        expect(html).toContain('damage-resistances-row');
        expect(html).toContain('Resistances:');
        expect(html).toContain('Fire');

        // 4. ensureClassResourcesOnCharacter heals species resources on legacy characters
        const legacyOrc: any = {
            name: 'Grom',
            race: 'Orc',
            level: 4,
            vitals: { proficiencyBonus: 2 },
            classResources: []
        };
        ensureClassResourcesOnCharacter(legacyOrc);
        const orcResNames = legacyOrc.classResources.map((r: any) => r.name);
        expect(orcResNames).toContain('Adrenaline Rush');
        expect(orcResNames).toContain('Relentless Endurance');
    });

    it('derives class stat fallbacks from the class rules when D&D Beyond sends no modifiers', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const stats = [
            { id: 1, value: 10 }, { id: 2, value: 16 }, { id: 3, value: 14 },
            { id: 4, value: 10 }, { id: 5, value: 14 }, { id: 6, value: 16 }
        ];
        const make = (name: string, level: number, sub?: string) => parseDndBeyondCharacter({
            id: 1, name: 'Probe', stats, modifiers: {}, inventory: [], spells: {},
            classes: [{ level, definition: { name }, subclassDefinition: sub ? { name: sub } : undefined }]
        });

        // Monk 14: Unarmored Defense 10 + DEX + WIS, Unarmored Movement +25, Disciplined Survivor saves
        const monk = make('Monk', 14);
        expect(monk.vitals.armorClass).toBe(15);
        expect(monk.vitals.speed).toBe('55 ft.');
        expect(monk.abilities.every((a: any) => a.proficientSave)).toBe(true);

        // College of Dance: Dazzling Footwork 10 + DEX + CHA
        expect(make('Bard', 3, 'College of Dance').vitals.armorClass).toBe(16);

        // Gloom Stalker: Dread Ambusher adds WIS to Initiative
        expect(make('Ranger', 3, 'Gloom Stalker').vitals.initiative).toBe(3 + 2);

        // Paladin 6: Aura of Protection adds CHA to every save
        const paladin = make('Paladin', 6);
        expect(paladin.abilities.find((a: any) => a.abbr === 'STR')!.save).toBe(0 + 3);

        // Circle of the Stars 6: Cosmic Omen reaction
        const druid = make('Druid', 6, 'Circle of the Stars');
        expect(druid.actions.some((a: any) => a.name === 'Cosmic Omen' && a.type === 'Reaction')).toBe(true);
        expect(make('Druid', 5, 'Circle of the Stars').actions.some((a: any) => a.name === 'Cosmic Omen')).toBe(false);
    });

    it('derives species uses and lineage from the species rules', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const char = parseDndBeyondCharacter({
            id: 2, name: 'Drakon', modifiers: {}, inventory: [], spells: {},
            stats: [1, 2, 3, 4, 5, 6].map(id => ({ id, value: 12 })),
            race: { fullName: 'Dragonborn', baseName: 'Dragonborn', racialTraits: [{ definition: { name: 'Draconic Ancestry' } }] },
            options: { race: [{ definition: { name: 'Silver Dragon' } }] },
            classes: [{ level: 5, definition: { name: 'Fighter' } }]
        });
        expect(char.species).toBe('Dragonborn');
        expect(char.lineage).toBe('Silver Dragon');
        const names = (char.classResources || []).map((r: any) => `${r.name}:${r.total}`);
        expect(names).toContain('Breath Weapon:3');
        expect(names).toContain('Draconic Flight:1');
    });

    it('applies feat fallbacks from the feat data when D&D Beyond sends no modifiers', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const char = parseDndBeyondCharacter({
            id: 3, name: 'Feats', modifiers: {}, inventory: [], spells: {},
            stats: [1, 2, 3, 4, 5, 6].map(id => ({ id, value: 10 })),
            race: { fullName: 'Human', baseName: 'Human', weightSpeeds: { normal: { walk: 30 } } },
            classes: [{ level: 4, definition: { name: 'Fighter' } }],
            feats: ['Speedy', 'Skulker', 'War Caster', 'Lucky', 'Tough'].map((name, i) => ({ definition: { id: 900 + i, name } }))
        });
        expect(char.vitals.speed).toBe('40 ft.');
        expect(char.vitals.blindsight).toBe('10 ft.');
        expect(char.savingThrowNotes?.some((n: string) => /concentration/i.test(n))).toBe(true);
        expect(char.classResources?.find((r: any) => r.name === 'Luck Points')?.total).toBe(2);
    });

    it('counts Pact of the Tome spells as uncounted from the class rules, not by name', async () => {
        const { isCharacterBonusSpell } = await import('../../../src/views/characterSheet/components/spells');
        expect(isCharacterBonusSpell({ name: 'Guidance', level: 0, source: 'Warlock / Pact of the Tome' } as any)).toBe(true);
        expect(isCharacterBonusSpell({ name: 'Shield', level: 1, source: 'Wizard' } as any)).toBe(false);
    });

    it('reads details, notes, currency, campaign, companions, custom entries, and usage from D&D Beyond', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const char = parseDndBeyondCharacter({
            id: 4, name: 'Everything', modifiers: {}, inventory: [], spells: {},
            stats: [1, 2, 3, 4, 5, 6].map(id => ({ id, value: 12 })),
            classes: [{ level: 3, definition: { name: 'Wizard' } }],
            gender: 'Nonbinary', faith: 'The Lady', age: '120', height: "5'2\"", lifestyleId: 5, currentXp: 900,
            traits: { personalityTraits: 'Curious', ideals: '', bonds: 'My spellbook', flaws: null, appearance: 'Ink-stained' },
            notes: { backstory: 'Raised in a library', allies: null, otherNotes: 'Owes a favor' },
            currencies: { cp: 3, sp: 0, gp: 42, ep: 1, pp: 2 },
            campaign: { name: 'Curse of the Library', dmUsername: 'not-kept', characters: [{ username: 'not-kept' }] },
            creatures: [{ name: 'Pip', isActive: true, removedHitPoints: 0, definition: { name: 'Owl', armorClass: 11, averageHitPoints: 1 } }],
            customProficiencies: [{ name: 'Glassblower Tools', type: 2 }, { name: 'Sylvan', type: 3 }],
            customDefenseAdjustments: [{ type: 1, adjustmentId: 9 }],
            customActions: [{ name: 'Inkblot', snippet: 'Blind a creature for a moment', activation: { activationType: 3 } }],
            customItems: [{ name: 'Lucky Quill', quantity: 1, description: 'Writes by itself' }],
            spellSlots: [{ level: 1, used: 3 }, { level: 2, used: 1 }],
            pactMagic: [],
            deathSaves: { successCount: 1, failCount: 2, isStabilized: false },
            actions: { class: [{ name: 'Arcane Recovery', limitedUse: { maxUses: 1, numberUsed: 1, resetType: 2 } }] }
        });

        expect(char.details).toEqual({ gender: 'Nonbinary', faith: 'The Lady', age: '120', height: "5'2\"", lifestyle: 'Comfortable', experiencePoints: 900 });
        expect(char.notes).toEqual({ personalityTraits: 'Curious', bonds: 'My spellbook', appearance: 'Ink-stained', backstory: 'Raised in a library', otherNotes: 'Owes a favor' });
        expect(char.currency).toEqual({ cp: 3, sp: 0, ep: 1, gp: 42, pp: 2 });
        expect(char.campaign).toEqual({ name: 'Curse of the Library' });
        expect(char.companions).toEqual([{ name: 'Pip', type: 'Owl', armorClass: 11, maxHp: 1, currentHp: 1, notes: undefined }]);
        expect(char.proficiencies.tools).toContain('Glassblower Tools');
        expect(char.proficiencies.languages).toContain('Sylvan');
        expect(char.damageResistances).toContain('Fire');
        expect(char.actions.find(a => a.name === 'Inkblot')?.type).toBe('Bonus Action');
        expect(char.equipment.some(e => e.name === 'Lucky Quill')).toBe(true);

        // Usage: 3 of 4 first-level slots and 1 of 2 second-level slots spent, Arcane Recovery used, death saves
        expect(char.trackingState?.slotPips?.level1).toEqual([true, false, false, false]);
        expect(char.trackingState?.slotPips?.level2).toEqual([true, false]);
        const arIdx = (char.classResources || []).findIndex(r => r.name === 'Arcane Recovery');
        expect(arIdx).toBeGreaterThan(-1);
        expect(char.trackingState?.resourcePips?.[`res-${arIdx}`]).toEqual([false]);
        expect(char.vitals.deathSaves).toEqual({ successes: 1, failures: 2, isStable: false });
    });

    it('shows details, notes, currency, companions, and uses on the sheet, without the campaign', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');
        const { initResourcesController } = await import('../../../src/views/characterSheet/controllers/resources.ctrl');
        const { initDetailsController } = await import('../../../src/views/characterSheet/controllers/details.ctrl');
        const char = parseDndBeyondCharacter({
            id: 5, name: 'Shown', modifiers: {}, spells: {},
            stats: [1, 2, 3, 4, 5, 6].map(id => ({ id, value: 12 })),
            classes: [{ level: 3, definition: { name: 'Wizard' } }],
            faith: 'The <b>Lady</b>', lifestyleId: 4,
            traits: { bonds: 'My spellbook\nAnd my cat' },
            notes: { backstory: 'Raised in a library' },
            currencies: { cp: 1, sp: 2, ep: 0, gp: 30, pp: 0 },
            campaign: { name: 'Secret Campaign Name' },
            creatures: [{ name: 'Pip', isActive: true, definition: { name: 'Owl', armorClass: 11, averageHitPoints: 1 } }],
            inventory: [{ id: 801, quantity: 1, equipped: false, definition: { id: 9001, name: 'Wand of Magic Missiles', filterType: 'Wand', magic: true }, limitedUse: { maxUses: 7, numberUsed: 3, resetType: 'Dawn', resetTypeDescription: 'Regains 1d6+1 charges at dawn' } }],
            actions: { class: [{ name: 'Arcane Recovery', limitedUse: { maxUses: 1, numberUsed: 0, resetType: 2 } }] }
        });
        const html = renderSheetContent(char);
        const sheet = document.createElement('div');
        sheet.innerHTML = html;

        // Details & Notes tab: escaped text, line breaks kept, coins editable, companion listed, no campaign
        const pane = sheet.querySelector('#tab-details')!;
        expect(sheet.querySelector('#btn-tab-details')?.getAttribute('role')).toBe('tab');
        expect(pane.innerHTML).toContain('The &lt;b&gt;Lady&lt;/b&gt;');
        expect(pane.textContent).toContain('Modest');
        expect(pane.innerHTML).toContain('My spellbook<br>And my cat');
        expect(pane.textContent).toContain('Raised in a library');
        expect((pane.querySelector('#currency-gp') as HTMLInputElement).value).toBe('30');
        expect(pane.querySelector('label[for="currency-gp"]')).toBeTruthy();
        expect(pane.textContent).toContain('Pip');
        expect(sheet.textContent).not.toContain('Secret Campaign Name');

        // Item charges beside the item, outside its button card; 3 of 7 spent
        const wandUses = sheet.querySelector('.equipment-grid .card-with-uses .inline-uses') as HTMLElement;
        expect(wandUses).toBeTruthy();
        expect(wandUses.closest('[role="button"]')).toBeNull();
        expect(wandUses.querySelectorAll('.pip').length).toBe(7);
        expect(char.trackingState?.resourcePips?.['item-801']).toEqual([true, true, true, true, false, false, false]);

        // The action's uses mirror the resource's pips
        const arIdx = (char.classResources || []).findIndex(r => r.name === 'Arcane Recovery');
        const key = `res-${arIdx}`;
        const actionUses = sheet.querySelector(`.actions-grid .inline-uses[data-resource-key="${key}"]`);
        expect(actionUses).toBeTruthy();

        const ctx: any = {
            sheet, getCharacter: () => char, updateSlotCounters: () => { }, persistTrackerSnapshot: () => { },
            setCurrentHp: () => { }, setTempHp: () => { }, getMaxHp: () => 1, updateHpDisplay: () => { },
            scheduleDebouncedAutoSave: () => { }
        };
        initResourcesController(ctx);
        (actionUses!.querySelector('.pip') as HTMLButtonElement).click();
        const twins = sheet.querySelectorAll(`.pip[data-resource-key="${key}"][data-pip-idx="0"]`);
        expect(twins.length).toBe(2);
        twins.forEach(p => expect(p.classList.contains('active')).toBe(false));

        // A long rest restores the action but not the wand's dawn charges
        sheet.querySelectorAll('.inline-uses[data-resource-key="item-801"] .pip').forEach(p => p.classList.remove('active'));
        (sheet.querySelector('#long-rest-btn') as HTMLButtonElement).click();
        twins.forEach(p => expect(p.classList.contains('active')).toBe(true));
        expect(sheet.querySelectorAll('.inline-uses[data-resource-key="item-801"] .pip.active').length).toBe(0);

        // Coins edited on the sheet save to the character
        initDetailsController(ctx);
        const gp = sheet.querySelector('#currency-gp') as HTMLInputElement;
        gp.value = '12';
        gp.dispatchEvent(new Event('change'));
        expect(char.currency?.gp).toBe(12);
    });

    it('prints details, notes, uses, coins, and species spellcasting in the PDF, and notes species spellcasting on the sheet', async () => {
        const { parseDndBeyondCharacter } = await import('../../../src/views/characterSheet/characterAdapter');
        const { generatePdfHtmlPages } = await import('../../../src/views/characterSheet/services/pdfExport');
        const { renderSheetContent } = await import('../../../src/views/characterSheet/characterSheet.template');
        const char = parseDndBeyondCharacter({
            id: 6, name: 'Printed', modifiers: {}, inventory: [
                { id: 802, quantity: 1, equipped: false, definition: { id: 9002, name: 'Wand of Web', filterType: 'Wand', magic: true }, limitedUse: { maxUses: 7, numberUsed: 0, resetType: 'Dawn' } }
            ],
            stats: [1, 2, 3, 4, 5, 6].map(id => ({ id, value: id === 4 ? 16 : 10 })),
            classes: [{ level: 1, definition: { name: 'Fighter' } }],
            race: { fullName: 'Infernal Tiefling', baseName: 'Tiefling' },
            spells: { race: [{ definition: { name: 'Thaumaturgy', level: 0 } }] },
            choices: {
                choiceDefinitions: [{ id: '2-3', options: [{ id: 1, label: 'Intelligence' }, { id: 2, label: 'Charisma' }] }],
                race: [{ componentTypeId: 2, type: 3, optionValue: 1, label: 'Choose a Level 1 Option' }]
            },
            traits: { flaws: 'Too <curious>\nand nosy' },
            currencies: { cp: 0, sp: 4, ep: 0, gp: 10, pp: 0 }
        });

        // D&D Beyond's pick, among the Tiefling legacy's options
        expect(char.speciesSpellAbility).toBe('int');

        const pages = generatePdfHtmlPages(char);
        const last = pages[pages.length - 1];
        expect(last).toContain('LIMITED USES');
        expect(last).toContain('Wand of Web');
        expect(last).toContain('Too &lt;curious&gt;<br>and nosy');
        expect(last).toContain('SPECIES SPELLCASTING');
        expect(last).toContain('use Intelligence: save DC 13, spell attack +5');
        expect(pages[1]).toContain('<span class="pdf-curr-lbl">GP</span><span class="pdf-curr-val">10</span>');
        expect(pages[1]).toContain('(7 charges)');

        const sheet = document.createElement('div');
        sheet.innerHTML = renderSheetContent(char);
        expect(sheet.querySelector('.species-spellcasting-note')?.textContent).toContain('Intelligence');
    });

    it('shows an excerpt and "Click for more details" for long features, opening the full text', async () => {
        const { renderFeatures } = await import('../../../src/views/characterSheet/components/features');
        const { renderModals } = await import('../../../src/views/characterSheet/components/modals');
        const { initFeaturesController } = await import('../../../src/views/characterSheet/controllers/features.ctrl');
        const { initModalsController } = await import('../../../src/views/characterSheet/controllers/modals.ctrl');
        const longText = `<p>${'Your patron grants you uncanny insight. '.repeat(20)}You can cast <em>Hex</em> once per long rest.</p>`;
        const char: any = {
            name: 'Feat Tester', level: 3, classes: [], abilities: [], skills: [], actions: [], equipment: [], spells: [],
            vitals: { proficiencyBonus: 2 }, spellSlots: {},
            features: [
                { name: 'Short Trait', source: 'Species', type: 'Species', description: '<p>You see in the dark.</p>' },
                { name: 'Long Feature', source: 'Warlock', type: 'Class', description: longText }
            ]
        };
        const sheet = document.createElement('div');
        sheet.innerHTML = `<div class="features-grid">${renderFeatures(char)}</div>${renderModals()}`;
        document.body.appendChild(sheet);

        const cards = sheet.querySelectorAll('.feature-card');
        expect(cards[0].querySelector('.feature-more-btn')).toBeNull();
        expect(cards[0].textContent).toContain('You see in the dark.');
        const btn = cards[1].querySelector('.feature-more-btn') as HTMLButtonElement;
        expect(btn.textContent).toContain('Click for more details');
        expect(btn.getAttribute('aria-label')).toBe('Click for more details about Long Feature');
        const excerptText = cards[1].querySelector('.feature-desc-excerpt')!.textContent!;
        expect(excerptText.endsWith('…')).toBe(true);
        expect(excerptText).not.toContain('Hex');
        // The excerpt holds no links (nothing focusable is hidden in cut-off text)
        expect(cards[1].querySelectorAll('a, button:not(.feature-more-btn)').length).toBe(0);

        const ctx: any = { sheet, dynamicContainer: sheet, getCharacter: () => char, setCharacter: () => { } };
        initModalsController(ctx);
        initFeaturesController(ctx);
        btn.focus();
        btn.click();
        const dialog = sheet.querySelector('#action-modal-container') as HTMLElement;
        expect(dialog.getAttribute('aria-hidden')).toBe('false');
        expect(sheet.querySelector('#modal-action-name')!.textContent).toBe('Long Feature');
        expect((sheet.querySelector('#modal-action-meta') as HTMLElement).hidden).toBe(true);
        expect(sheet.querySelector('#modal-action-notes')!.textContent).toContain('once per long rest');
        expect(sheet.querySelector('#modal-action-footer-source')!.textContent).toBe('Feature Details');

        (sheet.querySelector('#action-modal-close-btn') as HTMLButtonElement).click();
        expect(dialog.getAttribute('aria-hidden')).toBe('true');
        expect(document.activeElement).toBe(btn);
        sheet.remove();
    });
});
