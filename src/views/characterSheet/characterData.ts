export interface SpellDefinition {
    id: string | number;
    name: string;
    level: number;
    school: string;
    source: string;
    castingTime: string;
    range: string;
    duration: string;
    components: string;
    concentration: boolean;
    ritual: boolean;
    description: string;
    imageUrl?: string;
}

export interface AbilityScore {
    name: string;
    abbr: string;
    score: number;
    modifier: number;
    save: number;
    proficientSave: boolean;
    notes?: string;
}

export interface SkillItem {
    name: string;
    stat: string;
    bonus: number;
    proficiency: "none" | "proficient" | "expertise";
}

export interface ActionItem {
    name: string;
    type: "Action" | "Bonus Action" | "Reaction" | "Special";
    rangeOrReach: string;
    hitOrDc: string;
    damageOrEffect: string;
    notes: string;
    spellName?: string;
}

export interface FeatureItem {
    name: string;
    source: string;
    type: "Class" | "Subclass" | "Invocation" | "Feat" | "Species";
    description: string;
}

export interface EquipmentItem {
    id?: number;
    definitionId?: number;
    name: string;
    quantity: number;
    equipped: boolean;
    attuned?: boolean;
    type: string;
    filterType?: string;
    rarity?: string;
    isMagic?: boolean;
    description?: string;
    imageUrl?: string;
    notes?: string;
}

export interface WeaponItem {
    id?: number;
    definitionId?: number;
    name: string;
    quantity: number;
    equipped: boolean;
    category: string; // e.g. "Simple Melee", "Martial Ranged", etc.
    damage: string; // e.g. "1d4 + 3 Piercing"
    damageType: string; // e.g. "Piercing"
    damageDie: string; // e.g. "1d4"
    attackBonus: string; // e.g. "+5"
    toHitModifier: number; // e.g. 5
    range: string; // e.g. "Reach 5 ft." or "20/60 ft."
    properties: string[]; // e.g. ["Finesse", "Light", "Thrown"]
    isMagic?: boolean;
    rarity?: string;
    description?: string;
    imageUrl?: string;
    mastery?: {
        name: string; // e.g. "Nick"
        description?: string;
        unlocked: boolean; // whether character has mastery unlocked for this weapon
    };
    notes?: string;
}

export interface SpellSlotTier {
    level: number;
    total: number;
    label: string;
}

export interface ClassResource {
    name: string;
    total: number;
    resetOn: "short" | "long";
    dieOrType?: string;
    key?: string;
}

export interface CharacterData {
    savedCharacterId?: number;
    siteCharacterId?: string;
    source?: "site" | "dndbeyond";
    trackingState?: {
        slotPips?: Record<string, boolean[]>;
        resourcePips?: Record<string, boolean[]>;
        heroicInspiration?: boolean;
    };
    id?: string | number;
    name: string;
    subtitle: string;
    level: number;
    classes: Array<{ name: string; level: number; subclass?: string }>;
    race: string;
    background: string;
    alignment: string;
    avatarUrl: string;
    dndBeyondUrl: string;
    vitals: {
        currentHp: number;
        maxHp: number;
        tempHp: number;
        armorClass: number;
        initiative: number;
        speed: string;
        proficiencyBonus: number;
        passivePerception: number;
        passiveInvestigation: number;
        passiveInsight: number;
        blindsight?: string;
        darkvision: string;
        tremorsense?: string;
        truesight?: string;
        hitDice: string;
        heroicInspiration: boolean;
        spellSaveDc: number;
        spellAttackBonus: number;
        spellcastingAbility: string;
    };
    abilities: AbilityScore[];
    skills: SkillItem[];
    spellSlots: {
        [key: string]: { total: number; label: string; level?: number } | undefined;
        level1?: { total: number; label: string; level?: number };
        level2?: { total: number; label: string; level?: number };
        level3?: { total: number; label: string; level?: number };
        level4?: { total: number; label: string; level?: number };
        level5?: { total: number; label: string; level?: number };
        level6?: { total: number; label: string; level?: number };
        level7?: { total: number; label: string; level?: number };
        level8?: { total: number; label: string; level?: number };
        level9?: { total: number; label: string; level?: number };
        pact?: { total: number; level: number; label: string };
    };
    classResources?: ClassResource[];
    bardicCount?: number;
    actions: ActionItem[];
    features: FeatureItem[];
    equipment: EquipmentItem[];
    weapons?: WeaponItem[];
    proficiencies: {
        armor: string[];
        weapons: string[];
        tools: string[];
        languages: string[];
    };
    spells: SpellDefinition[];
}

export const darvellData: CharacterData = {
    name: "Darvell",
    subtitle: "Tiefling • Bard 6 (College of Glamour) / Warlock 6 (The Great Old One) • Level 12",
    level: 12,
    classes: [
        { name: "Bard", level: 6, subclass: "College of Glamour" },
        { name: "Warlock", level: 6, subclass: "The Great Old One" }
    ],
    race: "Tiefling",
    background: "Entertainer",
    alignment: "Chaotic Good",
    avatarUrl: "https://www.dndbeyond.com/avatars/10/92/636339382508535391.png?width=150&height=150&fit=crop&quality=95&auto=webp",
    dndBeyondUrl: "https://www.dndbeyond.com/characters/138310322",
    vitals: {
        currentHp: 75,
        maxHp: 75,
        tempHp: 0,
        armorClass: 13,
        initiative: 2,
        speed: "30 ft.",
        proficiencyBonus: 4,
        passivePerception: 13,
        passiveInvestigation: 12,
        passiveInsight: 13,
        blindsight: "None",
        darkvision: "60 ft.",
        tremorsense: "None",
        truesight: "None",
        hitDice: "12d8 (6d8 Bard + 6d8 Warlock)",
        heroicInspiration: true,
        spellSaveDc: 16,
        spellAttackBonus: 8,
        spellcastingAbility: "Charisma (+4)"
    },
    abilities: [
        { name: "Strength", abbr: "STR", score: 8, modifier: -1, save: -1, proficientSave: false },
        { name: "Dexterity", abbr: "DEX", score: 15, modifier: 2, save: 6, proficientSave: true },
        { name: "Constitution", abbr: "CON", score: 12, modifier: 1, save: 1, proficientSave: false, notes: "Advantage on Concentration (War Caster)" },
        { name: "Intelligence", abbr: "INT", score: 10, modifier: 0, save: 0, proficientSave: false },
        { name: "Wisdom", abbr: "WIS", score: 13, modifier: 1, save: 1, proficientSave: false },
        { name: "Charisma", abbr: "CHA", score: 19, modifier: 4, save: 8, proficientSave: true }
    ] as AbilityScore[],
    skills: [
        { name: "Acrobatics", stat: "DEX", bonus: 6, proficiency: "proficient" },
        { name: "Animal Handling", stat: "WIS", bonus: 1, proficiency: "none" },
        { name: "Arcana", stat: "INT", bonus: 4, proficiency: "proficient" },
        { name: "Athletics", stat: "STR", bonus: 3, proficiency: "proficient" },
        { name: "Deception", stat: "CHA", bonus: 12, proficiency: "expertise" },
        { name: "History", stat: "INT", bonus: 0, proficiency: "none" },
        { name: "Insight", stat: "WIS", bonus: 1, proficiency: "none" },
        { name: "Intimidation", stat: "CHA", bonus: 4, proficiency: "none" },
        { name: "Investigation", stat: "INT", bonus: 0, proficiency: "none" },
        { name: "Medicine", stat: "WIS", bonus: 1, proficiency: "none" },
        { name: "Nature", stat: "INT", bonus: 0, proficiency: "none" },
        { name: "Perception", stat: "WIS", bonus: 1, proficiency: "none" },
        { name: "Performance", stat: "CHA", bonus: 12, proficiency: "expertise" },
        { name: "Persuasion", stat: "CHA", bonus: 8, proficiency: "proficient" },
        { name: "Religion", stat: "INT", bonus: 0, proficiency: "none" },
        { name: "Sleight of Hand", stat: "DEX", bonus: 6, proficiency: "proficient" },
        { name: "Stealth", stat: "DEX", bonus: 2, proficiency: "none" },
        { name: "Survival", stat: "WIS", bonus: 1, proficiency: "none" }
    ] as SkillItem[],
    spellSlots: {
        level1: { total: 4, label: "1st Level (Bard)" },
        level2: { total: 3, label: "2nd Level (Bard)" },
        level3: { total: 3, label: "3rd Level (Bard)" },
        pact: { total: 2, level: 3, label: "Pact Magic Level 3 (Warlock)" }
    },
    actions: [
        {
            name: "Eldritch Blast",
            type: "Action",
            rangeOrReach: "120 ft.",
            hitOrDc: "+8 to hit",
            damageOrEffect: "3 beams • 1d10 + 4 Force each",
            notes: "Agonizing Blast adds CHA modifier to damage of each beam.",
            spellName: "Eldritch Blast"
        },
        {
            name: "Vicious Mockery",
            type: "Action",
            rangeOrReach: "60 ft.",
            hitOrDc: "DC 16 Wis Save",
            damageOrEffect: "3d6 Psychic + Disadvantage",
            notes: "Target has disadvantage on next attack roll before end of its next turn.",
            spellName: "Vicious Mockery"
        },
        {
            name: "Dagger (Melee/Ranged)",
            type: "Action",
            rangeOrReach: "Reach 5 ft. / Range 20/60 ft.",
            hitOrDc: "+6 to hit",
            damageOrEffect: "1d4 + 2 Piercing",
            notes: "Finesse, Light, Thrown."
        },
        {
            name: "Mantle of Inspiration",
            type: "Bonus Action",
            rangeOrReach: "60 ft.",
            hitOrDc: "Expend Bardic Inspiration",
            damageOrEffect: "11 Temp HP to 4 allies",
            notes: "Allies can immediately use their reaction to move up to full speed without provoking opportunity attacks."
        },
        {
            name: "Bardic Inspiration",
            type: "Bonus Action",
            rangeOrReach: "60 ft.",
            hitOrDc: "4 uses / Short Rest",
            damageOrEffect: "d8 die to ally",
            notes: "Add d8 to one d20 roll (attack, ability check, saving throw) within 10 minutes."
        },
        {
            name: "Clairvoyant Combatant",
            type: "Bonus Action",
            rangeOrReach: "30 ft.",
            hitOrDc: "Telepathic link",
            damageOrEffect: "Advantage for you / Disadv for enemy",
            notes: "Great Old One feature. Linked target has disadvantage on attacks against you, and you have advantage on attacks against it."
        },
        {
            name: "Misty Step",
            type: "Bonus Action",
            rangeOrReach: "Self",
            hitOrDc: "2nd-Level Spell",
            damageOrEffect: "Teleport 30 ft.",
            notes: "Teleport up to 30 feet to an unoccupied space you can see.",
            spellName: "Misty Step"
        },
        {
            name: "Hellish Rebuke",
            type: "Reaction",
            rangeOrReach: "60 ft.",
            hitOrDc: "DC 16 Dex Save",
            damageOrEffect: "2d10 Fire damage",
            notes: "When damaged by a creature within 60 feet. Half damage on save.",
            spellName: "Hellish Rebuke"
        },
        {
            name: "Counterspell",
            type: "Reaction",
            rangeOrReach: "60 ft.",
            hitOrDc: "Automatic (≤3rd) / +4 check",
            damageOrEffect: "Interrupt spellcasting",
            notes: "Interrupt a creature within 60 ft that is casting a spell.",
            spellName: "Counterspell"
        },
        {
            name: "War Caster Opportunity Attack",
            type: "Reaction",
            rangeOrReach: "Creature reach",
            hitOrDc: "Cast 1 Action spell",
            damageOrEffect: "Single target spell",
            notes: "When creature provokes opportunity attack, can cast a spell with 1 action casting time targeting only that creature."
        }
    ] as ActionItem[],
    features: [
        {
            name: "Mantle of Inspiration",
            source: "College of Glamour",
            type: "Subclass",
            description: "As a Bonus Action, spend 1 Bardic Inspiration die to give up to 4 allies within 60 ft 11 temporary HP. Each target can immediately use its reaction to move up to its speed without provoking opportunity attacks."
        },
        {
            name: "Enthralling Performance",
            source: "College of Glamour",
            type: "Subclass",
            description: "If you perform for at least 1 minute, you can attempt to inspire wonder in up to 4 humanoids within 60 feet who must succeed on a DC 16 Wisdom saving throw or be charmed for 1 hour."
        },
        {
            name: "Mantle of Majesty",
            source: "College of Glamour",
            type: "Subclass",
            description: "For 1 minute, you can cast Command as a bonus action on each of your turns without expending a spell slot. Any creature charmed by you automatically fails its saving throw against the spell."
        },
        {
            name: "Beguiling Magic",
            source: "College of Glamour",
            type: "Subclass",
            description: "Immediately after you cast an Enchantment or Illusion spell using a spell slot, you can cause a creature within 60 feet to make a Wisdom saving throw or be Charmed or Frightened for 1 minute."
        },
        {
            name: "Awakened Mind",
            source: "The Great Old One",
            type: "Subclass",
            description: "You can telepathically speak to any creature you can see within 30 feet of you. The creature understands you if it knows at least one language."
        },
        {
            name: "Psychic Spells",
            source: "The Great Old One",
            type: "Subclass",
            description: "When you cast a warlock spell that deals damage, you can change the damage type to Psychic damage. Additionally, you can cast Enchantment and Illusion spells without verbal or somatic components."
        },
        {
            name: "Clairvoyant Combatant",
            source: "The Great Old One",
            type: "Subclass",
            description: "When you use Awakened Mind to form a telepathic connection, you can empower it as a Bonus Action. For the duration, the creature has disadvantage on attack rolls against you, and you have advantage on attack rolls against it."
        },
        {
            name: "Agonizing Blast",
            source: "Eldritch Invocations",
            type: "Invocation",
            description: "When you cast Eldritch Blast, add your Charisma modifier (+4) to the damage it deals on a hit for each beam."
        },
        {
            name: "Beguiling Influence",
            source: "Eldritch Invocations",
            type: "Invocation",
            description: "You gain proficiency in the Deception and Persuasion skills."
        },
        {
            name: "Eyes of the Rune Keeper",
            source: "Eldritch Invocations",
            type: "Invocation",
            description: "You can read all writing, regardless of the language or script."
        },
        {
            name: "Pact of the Tome",
            source: "Eldritch Invocations",
            type: "Invocation",
            description: "A grimoire containing three cantrips of your choice from any class list, plus ritual spellcasting."
        },
        {
            name: "War Caster",
            source: "Feat",
            type: "Feat",
            description: "Advantage on Constitution saving throws to maintain concentration. Can perform somatic components even with weapons/shields in hand. Can cast a 1-action spell as a reaction when a hostile creature provokes an opportunity attack."
        },
        {
            name: "Actor",
            source: "Feat",
            type: "Feat",
            description: "Advantage on Charisma (Deception) and Charisma (Performance) checks when trying to pass yourself off as a different person. Can mimic the speech of another person or sounds made by other creatures heard for at least 1 minute."
        },
        {
            name: "Musician",
            source: "Feat",
            type: "Feat",
            description: "After finishing a Short or Long Rest, play an instrument to grant Heroic Inspiration to allies equal to your proficiency bonus (4 allies)."
        },
        {
            name: "Hellish Resistance",
            source: "Tiefling Species",
            type: "Species",
            description: "You have resistance to Fire damage."
        },
        {
            name: "Darkvision",
            source: "Tiefling Species",
            type: "Species",
            description: "Accustomed to the dark, you have superior vision in dark and dim conditions out to a distance of 60 feet."
        }
    ] as FeatureItem[],
    equipment: [
        { name: "Ring of Mind Shielding", quantity: 1, equipped: true, attuned: true, type: "Wondrous Item", notes: "Immune to telepathic mind reading; soul enters ring if slain." },
        { name: "Leather Armor", quantity: 1, equipped: true, type: "Light Armor", notes: "AC 11 + Dex modifier (+2) = 13 AC." },
        { name: "Dagger", quantity: 2, equipped: true, type: "Weapon", notes: "1d4 Piercing, Finesse, Light, Thrown (20/60)." },
        { name: "Lyre", quantity: 1, equipped: false, type: "Musical Instrument", notes: "Spellcasting focus and instrument for Musician feat." },
        { name: "Potion of Healing (Greater)", quantity: 1, equipped: false, type: "Potion", notes: "Regains 4d4 + 4 hit points." },
        { name: "Potion of Healing", quantity: 1, equipped: false, type: "Potion", notes: "Regains 2d4 + 2 hit points." },
        { name: "Backpack & Explorer Gear", quantity: 1, equipped: false, type: "Gear", notes: "Bedroll, Lantern, Rations, Waterskin, Mirror, Bell, Tinderbox, Costume." }
    ] as EquipmentItem[],
    weapons: [
        {
            name: "Dagger",
            quantity: 2,
            equipped: true,
            category: "Simple Melee",
            damage: "1d4 + 2 Piercing",
            damageDie: "1d4",
            damageType: "Piercing",
            attackBonus: "+6 to hit",
            toHitModifier: 6,
            range: "20/60 ft. (Reach 5 ft.)",
            properties: ["Finesse", "Light", "Thrown"],
            notes: "Finesse (DEX used for attack & damage). Thrown range 20/60 ft."
        }
    ],
    proficiencies: {
        armor: ["Light Armor"],
        weapons: ["Simple Weapons"],
        tools: ["Bagpipes", "Drum", "Fiddle", "Hand Drum", "Horn", "Lute", "Lyre"],
        languages: ["Common", "Draconic", "Elvish"]
    },
    spells: [
        {
            "id": 2619161,
            "name": "Eldritch Blast",
            "level": 0,
            "school": "Evocation",
            "source": "Warlock / Pact of the Tome",
            "castingTime": "1 Action",
            "range": "120 ft.",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>You hurl a beam of crackling energy. Make a ranged spell attack against one creature or object in range. On a hit, the target takes 1d10 Force damage.</p>\r\n<p><strong><em>Cantrip Upgrade.</em></strong> The spell creates two beams at level 5, three beams at level 11, and four beams at level 17. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam.</p>"
        },
        {
            "id": 2618890,
            "name": "Fire Bolt",
            "level": 0,
            "school": "Evocation",
            "source": "Tiefling Legacy",
            "castingTime": "1 Action",
            "range": "120 ft.",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn’t being worn or carried.</p>\r\n<p><strong><em>Cantrip Upgrade.</em></strong> The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).</p>"
        },
        {
            "id": 14878,
            "name": "Infestation",
            "level": 0,
            "school": "Conjuration",
            "source": "Warlock",
            "castingTime": "1 Action",
            "range": "30 ft.",
            "duration": "Instantaneous",
            "components": "V, S, M (a living flea)",
            "concentration": false,
            "ritual": false,
            "description": "<p class=\"Core-Styles_Core-Body\">You cause a cloud of mites, fleas, and other parasites to appear momentarily on one creature you can see within range. The target must succeed on a Constitution saving throw, or it takes 1d6 poison damage and moves 5 feet in a random direction if it can move and its speed is at least 5 feet. Roll a d4 for the direction: 1, north; 2, south; 3, east; or 4, west. This movement doesn’t provoke opportunity attacks, and if the direction rolled is blocked, the target doesn’t move.</p>\r\n<p class=\"Core-Styles_Core-Body\">The spell’s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).</p>"
        },
        {
            "id": 2619008,
            "name": "Mage Hand",
            "level": 0,
            "school": "Conjuration",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "30 ft.",
            "duration": "1 Minute",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again.</p>\r\n<p>When you cast the spell, you can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.</p>\r\n<p>As a Magic action on your later turns, you can control the hand thus again. As part of that action, you can move the hand up to 30 feet.</p>\r\n<p>The hand can’t attack, activate magic items, or carry more than 10 pounds.</p>"
        },
        {
            "id": 2618893,
            "name": "Prestidigitation",
            "level": 0,
            "school": "Transmutation",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "10 ft.",
            "duration": "1 Hour",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>You create a magical effect within range. Choose the effect from the options below. If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time.</p>\r\n<p><strong><em>Sensory Effect.</em></strong> You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor.</p>\r\n<p><strong><em>Fire Play.</em></strong> You instantaneously light or snuff out a candle, a torch, or a small campfire.</p>\r\n<p><strong><em>Clean or Soil.</em></strong> You instantaneously clean or soil an object no larger than 1 cubic foot.</p>\r\n<p><strong><em>Minor Sensation.</em></strong> You chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour.</p>\r\n<p><strong><em>Magic Mark.</em></strong> You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour.</p>\r\n<p><strong><em>Minor Creation.</em></strong> You create a nonmagical trinket or an illusory image that can fit in your hand. It lasts until the end of your next turn. A trinket can deal no damage and has no monetary worth.</p>"
        },
        {
            "id": 2618901,
            "name": "Produce Flame",
            "level": 0,
            "school": "Conjuration",
            "source": "Warlock / Pact of the Tome",
            "castingTime": "1 Bonus Action",
            "range": "Self",
            "duration": "10 Minute",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>A flickering flame appears in your hand and remains there for the duration. While there, the flame emits no heat and ignites nothing, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The spell ends if you cast it again.</p>\r\n<p>Until the spell ends, you can take a Magic action to hurl fire at a creature or an object within 60 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 Fire damage.</p>\r\n<p><strong><em>Cantrip Upgrade.</em></strong> The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8).</p>"
        },
        {
            "id": 2618930,
            "name": "Ray of Frost",
            "level": 0,
            "school": "Evocation",
            "source": "Warlock / Pact of the Tome",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 Cold damage, and its Speed is reduced by 10 feet until the start of your next turn.</p>\r\n<p><strong><em>Cantrip Upgrade.</em></strong> The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8).</p>"
        },
        {
            "id": 2413,
            "name": "Sword Burst",
            "level": 0,
            "school": "Conjuration",
            "source": "Warlock",
            "castingTime": "1 Action",
            "range": "5 ft.",
            "duration": "Instantaneous",
            "components": "V",
            "concentration": false,
            "ritual": false,
            "description": "<p>You create a momentary circle of spectral blades that sweep around you. All other creatures within 5 feet of you must succeed on a Dexterity saving throw or take 1d6 force damage.</p>\r\n<p>This spell’s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).</p>"
        },
        {
            "id": 2619174,
            "name": "Thaumaturgy",
            "level": 0,
            "school": "Transmutation",
            "source": "Tiefling Legacy",
            "castingTime": "1 Action",
            "range": "30 ft.",
            "duration": "1 Minute",
            "components": "V",
            "concentration": false,
            "ritual": false,
            "description": "<p>You manifest a minor wonder within range. You create one of the effects below within range. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time.</p>\r\n<p><strong><em>Altered Eyes.</em></strong> You alter the appearance of your eyes for 1 minute.</p>\r\n<p><strong><em>Booming Voice.</em></strong> Your voice booms up to three times as loud as normal for 1 minute. For the duration, you have Advantage on Charisma (Intimidation) checks.</p>\r\n<p><strong><em>Fire Play.</em></strong> You cause flames to flicker, brighten, dim, or change color for 1 minute.</p>\r\n<p><strong><em>Invisible Hand.</em></strong> You instantaneously cause an unlocked door or window to fly open or slam shut.</p>\r\n<p><strong><em>Phantom Sound.</em></strong> You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers.</p>\r\n<p><strong><em>Tremors.</em></strong> You cause harmless tremors in the ground for 1 minute.</p>"
        },
        {
            "id": 2619188,
            "name": "Toll the Dead",
            "level": 0,
            "school": "Necromancy",
            "source": "Warlock",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>You point at one creature you can see within range, and the single chime of a dolorous bell is audible within 10 feet of the target. The target must succeed on a Wisdom saving throw or take 1d8 Necrotic damage. If the target is missing any of its Hit Points, it instead takes 1d12 Necrotic damage.</p>\r\n<p><strong><em>Cantrip Upgrade.</em></strong> The damage increases by one die when you reach levels 5 (2d8 or 2d12), 11 (3d8 or 3d12), and 17 (4d8 or 4d12).</p>"
        },
        {
            "id": 2619216,
            "name": "Vicious Mockery",
            "level": 0,
            "school": "Enchantment",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V",
            "concentration": false,
            "ritual": false,
            "description": "<p>You unleash a string of insults laced with subtle enchantments at one creature you can see or hear within range. The target must succeed on a Wisdom saving throw or take 1d6 Psychic damage and have Disadvantage on the next attack roll it makes before the end of its next turn.</p>\r\n<p><strong><em>Cantrip Upgrade.</em></strong> The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6).</p>"
        },
        {
            "id": 2618871,
            "name": "Arms of Hadar",
            "level": 1,
            "school": "Conjuration",
            "source": "Warlock",
            "castingTime": "1 Action",
            "range": "Self",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>Invoking Hadar, you cause tendrils to erupt from yourself. Each creature in a 10-foot Emanation originating from you makes a Strength saving throw. On a failed save, a target takes 2d6 Necrotic damage and can’t take Reactions until the start of its next turn. On a successful save, a target takes half as much damage only.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The damage increases by 1d6 for each spell slot level above 1.</p>"
        },
        {
            "id": 2618964,
            "name": "Charm Person",
            "level": 1,
            "school": "Enchantment",
            "source": "Warlock / Pact of the Tome",
            "castingTime": "1 Action",
            "range": "30 ft.",
            "duration": "1 Hour",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> You can target one additional creature for each spell slot level above 1.</p>"
        },
        {
            "id": 2618985,
            "name": "Command",
            "level": 1,
            "school": "Enchantment",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V",
            "concentration": false,
            "ritual": false,
            "description": "<p>You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. Choose the command from these options:</p>\r\n<p><strong>Approach.</strong> The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you.</p>\r\n<p><strong>Drop.</strong> The target drops whatever it is holding and then ends its turn.</p>\r\n<p><strong>Flee.</strong> The target spends its turn moving away from you by the fastest available means.</p>\r\n<p><strong>Grovel.</strong> The target has the Prone condition and then ends its turn.</p>\r\n<p><strong>Halt.</strong> On its turn, the target doesn’t move and takes no action or Bonus Action.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> You can affect one additional creature for each spell slot level above 1.</p>"
        },
        {
            "id": 2619079,
            "name": "Cure Wounds",
            "level": 1,
            "school": "Abjuration",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "Touch",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>A creature you touch regains a number of Hit Points equal to 2d8 plus your spellcasting ability modifier.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The healing increases by 2d8 for each spell slot level above 1.</p>"
        },
        {
            "id": 2619104,
            "name": "Dissonant Whispers",
            "level": 1,
            "school": "Enchantment",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V",
            "concentration": false,
            "ritual": false,
            "description": "<p>One creature of your choice that you can see within range hears a discordant melody in its mind. The target makes a Wisdom saving throw. On a failed save, it takes 3d6 Psychic damage and must immediately use its Reaction, if available, to move as far away from you as it can, using the safest route. On a successful save, the target takes half as much damage only.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The damage increases by 1d6 for each spell slot level above 1.</p>"
        },
        {
            "id": 2619149,
            "name": "Hellish Rebuke",
            "level": 1,
            "school": "Evocation",
            "source": "Tiefling Legacy",
            "castingTime": "1 Reaction",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>The creature that damaged you is momentarily surrounded by green flames. It makes a Dexterity saving throw, taking 2d10 Fire damage on a failed save or half as much damage on a successful one.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The damage increases by 1d10 for each spell slot level above 1.</p>"
        },
        {
            "id": 2619132,
            "name": "Tasha's Hideous Laughter",
            "level": 1,
            "school": "Enchantment",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "30 ft.",
            "duration": "Concentration, up to 1 Minute",
            "components": "V, S, M (a tart and a feather)",
            "concentration": true,
            "ritual": false,
            "description": "<p>One creature of your choice that you can see within range makes a Wisdom saving throw. On a failed save, it has the Prone and Incapacitated conditions for the duration. During that time, it laughs uncontrollably if it’s capable of laughter, and it can’t end the Prone condition on itself.</p>\r\n<p>At the end of each of its turns and each time it takes damage, it makes another Wisdom saving throw. The target has Advantage on the save if the save is triggered by damage. On a successful save, the spell ends.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> You can target one additional creature for each spell slot level above 1.</p>"
        },
        {
            "id": 2619215,
            "name": "Witch Bolt",
            "level": 1,
            "school": "Evocation",
            "source": "Warlock",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Concentration, up to 1 Minute",
            "components": "V, S, M (a twig struck by lightning)",
            "concentration": true,
            "ritual": false,
            "description": "<p>A beam of crackling energy lances toward a creature within range, forming a sustained arc of lightning between you and the target. Make a ranged spell attack against it. On a hit, the target takes 2d12 Lightning damage.</p>\r\n<p>On each of your subsequent turns, you can take a Bonus Action to deal 1d12 Lightning damage to the target automatically, even if the first attack missed.</p>\r\n<p>The spell ends if the target is ever outside the spell’s range or if it has Total Cover from you.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The initial damage increases by 1d12 for each spell slot level above 1.</p>"
        },
        {
            "id": 2618974,
            "name": "Cloud of Daggers",
            "level": 2,
            "school": "Conjuration",
            "source": "Warlock",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Concentration, up to 1 Minute",
            "components": "V, S, M (a sliver of glass)",
            "concentration": true,
            "ritual": false,
            "description": "<p>You conjure spinning daggers in a 5-foot Cube centered on a point within range. Each creature in that area takes 4d4 Slashing damage. A creature also takes this damage if it enters the Cube or ends its turn there or if the Cube moves into its space. A creature takes this damage only once per turn.</p>\r\n<p>On your later turns, you can take a Magic action to teleport the Cube up to 30 feet.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The damage increases by 2d4 for each spell slot level above 2.</p>"
        },
        {
            "id": 2619056,
            "name": "Crown of Madness",
            "level": 2,
            "school": "Enchantment",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "120 ft.",
            "duration": "Concentration, up to 1 Minute",
            "components": "V, S",
            "concentration": true,
            "ritual": false,
            "description": "<p>One creature that you can see within range must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The creature succeeds automatically if it isn’t Humanoid.</p>\r\n<p>A spectral crown appears on the Charmed target's head, and it must use its action before moving on each of its turns to make a melee attack against a creature other than itself that you mentally choose. The target can act normally on its turn if you choose no creature or if no creature is within its reach. The target repeats the save at the end of each of its turns, ending the spell on itself on a success.</p>\r\n<p>On your later turns, you must take the Magic action to maintain control of the target, or the spell ends.</p>"
        },
        {
            "id": 2619080,
            "name": "Darkness",
            "level": 2,
            "school": "Evocation",
            "source": "Tiefling Legacy",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Concentration, up to 10 Minute",
            "components": "V, M (bat fur and a piece of coal)",
            "concentration": true,
            "ritual": false,
            "description": "<p>For the duration, magical Darkness spreads from a point within range and fills a 15-foot-radius Sphere. Darkvision can’t see through it, and nonmagical light can’t illuminate it.</p>\r\n<p>Alternatively, you cast the spell on an object that isn’t being worn or carried, causing the Darkness to fill a 15-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the Darkness.</p>\r\n<p>If any of this spell’s area overlaps with an area of Bright Light or Dim Light created by a spell of level 2 or lower, that other spell is dispelled.</p>"
        },
        {
            "id": 2619116,
            "name": "Invisibility",
            "level": 2,
            "school": "Illusion",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "Touch",
            "duration": "Concentration, up to 1 Hour",
            "components": "V, S, M (an eyelash in gum arabic)",
            "concentration": true,
            "ritual": false,
            "description": "<p>A creature you touch has the Invisible condition until the spell ends. The spell ends early immediately after the target makes an attack roll, deals damage, or casts a spell.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> You can target one additional creature for each spell slot level above 2.</p>"
        },
        {
            "id": 2619060,
            "name": "Mirror Image",
            "level": 2,
            "school": "Illusion",
            "source": "Warlock / Pact of the Tome",
            "castingTime": "1 Action",
            "range": "Self",
            "duration": "1 Minute",
            "components": "V, S",
            "concentration": false,
            "ritual": false,
            "description": "<p>Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it’s impossible to track which image is real.</p>\r\n<p>Each time a creature hits you with an attack roll during the spell’s duration, roll a d6 for each of your remaining duplicates. If any of the d6s rolls a 3 or higher, one of the duplicates is hit instead of you, and the duplicate is destroyed. The duplicates otherwise ignore all other damage and effects. The spell ends when all three duplicates are destroyed.</p>\r\n<p>A creature is unaffected by this spell if it has the Blinded condition, Blindsight, or Truesight.</p>"
        },
        {
            "id": 2619133,
            "name": "Misty Step",
            "level": 2,
            "school": "Conjuration",
            "source": "Warlock",
            "castingTime": "1 Bonus Action",
            "range": "Self",
            "duration": "Instantaneous",
            "components": "V",
            "concentration": false,
            "ritual": false,
            "description": "<p>Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see.</p>"
        },
        {
            "id": 14595,
            "name": "Shadow Blade",
            "level": 2,
            "school": "Illusion",
            "source": "Warlock",
            "castingTime": "1 Bonus Action",
            "range": "Self",
            "duration": "Concentration, up to 1 Minute",
            "components": "V, S",
            "concentration": true,
            "ritual": false,
            "description": "<p>You weave together threads of shadow to create a sword of solidified gloom in your hand. This magic sword lasts until the spell ends. It counts as a simple melee weapon with which you are proficient. It deals 2d8 psychic damage on a hit and has the finesse, light, and thrown properties (range 20/60). In addition, when you use the sword to attack a target that is in dim light or darkness, you make the attack roll with advantage.</p>\r\n<p>If you drop the weapon or throw it, it dissipates at the end of the turn. Thereafter, while the spell persists, you can use a bonus action to cause the sword to reappear in your hand.</p>\r\n<p><em><strong>At Higher Levels.</strong></em> When you cast this spell using a 3rd- or 4th-level spell slot, the damage increases to 3d8. When you cast it using a 5th- or 6th-level spell slot, the damage increases to 4d8. When you cast it using a spell slot of 7th level or higher, the damage increases to 5d8.</p>"
        },
        {
            "id": 2619017,
            "name": "Shatter",
            "level": 2,
            "school": "Evocation",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "V, S, M (a chip of mica)",
            "concentration": false,
            "ritual": false,
            "description": "<p>A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius Sphere centered there makes a Constitution saving throw, taking 3d8 Thunder damage on a failed save or half as much damage on a successful one. A Construct has Disadvantage on the save.</p>\r\n<p>A nonmagical object that isn’t being worn or carried also takes the damage if it’s in the spell’s area.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The damage increases by 1d8 for each spell slot level above 2.</p>"
        },
        {
            "id": 2619072,
            "name": "Counterspell",
            "level": 3,
            "school": "Abjuration",
            "source": "Warlock",
            "castingTime": "1 Reaction",
            "range": "60 ft.",
            "duration": "Instantaneous",
            "components": "S",
            "concentration": false,
            "ritual": false,
            "description": "<p>You attempt to interrupt a creature in the process of casting a spell. The creature makes a Constitution saving throw. On a failed save, the spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn’t expended.</p>"
        },
        {
            "id": 2619168,
            "name": "Hypnotic Pattern",
            "level": 3,
            "school": "Illusion",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "120 ft.",
            "duration": "Concentration, up to 1 Minute",
            "components": "S, M (a pinch of confetti)",
            "concentration": true,
            "ritual": false,
            "description": "<p>You create a twisting pattern of colors in a 30-foot Cube within range. The pattern appears for a moment and vanishes. Each creature in the area who can see the pattern must succeed on a Wisdom saving throw or have the Charmed condition for the duration. While Charmed, the creature has the Incapacitated condition and a Speed of 0.</p>\r\n<p>The spell ends for an affected creature if it takes any damage or if someone else uses an action to shake the creature out of its stupor.</p>"
        },
        {
            "id": 2619018,
            "name": "Magic Circle",
            "level": 3,
            "school": "Abjuration",
            "source": "Warlock",
            "castingTime": "1 Hours",
            "range": "10 ft.",
            "duration": "1 Hour",
            "components": "V, S, M (salt and powdered silver worth 100+ GP, which the spell consumes)",
            "concentration": false,
            "ritual": false,
            "description": "<p>You create a 10-foot-radius, 20-foot-tall Cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the Cylinder intersects with the floor or other surface.</p>\r\n<p>Choose one or more of the following types of creatures: Celestials, Elementals, Fey, Fiends, or Undead. The circle affects a creature of the chosen type in the following ways:</p>\r\n<ul>\r\n<li>The creature can’t willingly enter the Cylinder by nonmagical means. If the creature tries to use teleportation or interplanar travel to do so, it must first succeed on a Charisma saving throw.</li>\r\n<li>The creature has Disadvantage on attack rolls against targets within the Cylinder.</li>\r\n<li>Targets within the Cylinder can’t be possessed by or gain the Charmed or Frightened condition from the creature.</li>\r\n</ul>\r\n<p>Each time you cast this spell, you can cause its magic to operate in the reverse direction, preventing a creature of the specified type from leaving the Cylinder and protecting targets outside it.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The duration increases by 1 hour for each spell slot level above 3.</p>"
        },
        {
            "id": 2619025,
            "name": "Major Image",
            "level": 3,
            "school": "Illusion",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "120 ft.",
            "duration": "Concentration, up to 10 Minute",
            "components": "V, S, M (a bit of fleece)",
            "concentration": true,
            "ritual": false,
            "description": "<p>You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot Cube. The image appears at a spot that you can see within range and lasts for the duration. It seems real, including sounds, smells, and temperature appropriate to the thing depicted, but it can’t deal damage or cause conditions.</p>\r\n<p>If you are within range of the illusion, you can take a Magic action to cause the image to move to any other spot within range. As the image changes location, you can alter its appearance so that its movements appear natural for the image. For example, if you create an image of a creature and move it, you can alter the image so that it appears to be walking. Similarly, you can cause the illusion to make different sounds at different times, even making it carry on a conversation, for example.</p>\r\n<p>Physical interaction with the image reveals it to be an illusion, for things can pass through it. A creature that takes a Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and its other sensory qualities become faint to the creature.</p>\r\n<p><strong><em>Using a Higher-Level Spell Slot.</em></strong> The spell lasts until dispelled, without requiring Concentration, if cast with a level 4+ spell slot.</p>"
        },
        {
            "id": 2619068,
            "name": "Speak with Dead",
            "level": 3,
            "school": "Necromancy",
            "source": "Bard",
            "castingTime": "1 Action",
            "range": "10 ft.",
            "duration": "10 Minute",
            "components": "V, S, M (burning incense)",
            "concentration": false,
            "ritual": false,
            "description": "<p>You grant the semblance of life to a corpse of your choice within range, allowing it to answer questions you pose. The corpse must have a mouth, and this spell fails if the deceased creature was Undead when it died. The spell also fails if the corpse was the target of this spell within the past 10 days.</p>\r\n<p>Until the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are antagonistic toward it or it recognizes you as an enemy. This spell doesn’t return the creature’s soul to its body, only its animating spirit. Thus, the corpse can’t learn new information, doesn’t comprehend anything that has happened since it died, and can’t speculate about future events.</p>"
        }
    ] as SpellDefinition[]
};
