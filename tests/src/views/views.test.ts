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
                    { id: 'm-fs', componentId: 302, type: 'bonus', subType: 'armor-class', value: 1, isGranted: true }
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
        expect(initialChar.vitals.armorClass).toBe(13); // 10 + 2 (DEX) + 1 (Defense Fighting Style)

        // Verify dropdowns render in features HTML
        const featuresHtml = renderFeatures(initialChar);
        expect(featuresHtml).toContain('feature-decision-select');
        expect(featuresHtml).toContain('data-feature-decision-id="feat:war-caster:0:asi:0"');
        expect(featuresHtml).toContain('data-feature-decision-id="feat:resilient:1:resilient:0"');
        expect(featuresHtml).toContain('data-feature-decision-id="class:bard:expertise:2:skill-exp:0"');
        expect(featuresHtml).toContain('data-feature-decision-id="class:bard:fighting-style:2:fighting-style:0"');

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
        expect(updatedChar.vitals.armorClass).toBe(12); // Defense (+1 AC) removed
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
    });
});
