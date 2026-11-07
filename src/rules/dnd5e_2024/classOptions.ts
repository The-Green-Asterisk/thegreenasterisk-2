export interface FeatureOption {
    id: string;
    name: string;
    description: string;
    prerequisite?: string;
    minLevel?: number;
}

export const FIGHTING_STYLES: FeatureOption[] = [
    {
        id: "archery",
        name: "Archery",
        description: "You gain a +2 bonus to attack rolls you make with ranged weapons."
    },
    {
        id: "defense",
        name: "Defense",
        description: "While you are wearing armor, you gain a +1 bonus to Armor Class."
    },
    {
        id: "dueling",
        name: "Dueling",
        description: "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon."
    },
    {
        id: "great-weapon-fighting",
        name: "Great Weapon Fighting",
        description: "When you roll a 1 or 2 on a damage die for an attack with a two-handed or versatile melee weapon, you can treat it as a 3."
    },
    {
        id: "protection",
        name: "Protection",
        description: "When a creature you can see attacks a target other than you within 5 feet of you, you can use your reaction to impose Disadvantage on the attack roll if you are wielding a shield."
    },
    {
        id: "two-weapon-fighting",
        name: "Two-Weapon Fighting",
        description: "When you make the extra attack from dual wielding, you can add your ability modifier to the damage of that attack."
    },
    {
        id: "blessed-warrior",
        name: "Blessed Warrior",
        description: "You learn two Cleric cantrips of your choice (such as Sacred Flame and Guidance). Wisdom/Charisma is your spellcasting ability for them."
    },
    {
        id: "blind-fighting",
        name: "Blind Fighting",
        description: "You have blindsight with a range of 10 feet. Within that range, you can effectively see anything that isn't behind total cover."
    },
    {
        id: "interception",
        name: "Interception",
        description: "When a creature within 5 feet of you takes damage from an attack, you can use your Reaction to reduce the damage by 1d10 + your Proficiency Bonus (requires a shield or simple/martial weapon)."
    }
];

export const DIVINE_ORDERS: FeatureOption[] = [
    {
        id: "protector",
        name: "Protector",
        description: "You gain proficiency with Martial weapons and training with Heavy armor."
    },
    {
        id: "thaumaturge",
        name: "Thaumaturge",
        description: "You know one extra cantrip from the Cleric spell list, and you add your Wisdom modifier to your Intelligence (Arcana or Religion) checks."
    }
];

export const PRIMAL_ORDERS: FeatureOption[] = [
    {
        id: "magician",
        name: "Magician",
        description: "You know one extra cantrip from the Druid spell list, and you add your Wisdom modifier to your Intelligence (Arcana or Nature) checks."
    },
    {
        id: "warden",
        name: "Warden",
        description: "You gain proficiency with Martial weapons and training with Medium armor."
    }
];

export const METAMAGIC_OPTIONS: FeatureOption[] = [
    {
        id: "careful-spell",
        name: "Careful Spell",
        description: "Cost: 1 Sorcery Point. Protect allies from area-of-effect spells: chosen creatures automatically succeed on saving throws against the spell."
    },
    {
        id: "distant-spell",
        name: "Distant Spell",
        description: "Cost: 1 Sorcery Point. Double the range of a spell of 5 feet or greater, or make a Touch spell have a range of 30 feet."
    },
    {
        id: "empowered-spell",
        name: "Empowered Spell",
        description: "Cost: 1 Sorcery Point. Reroll up to your Charisma modifier of damage dice on a spell, and you must use the new rolls."
    },
    {
        id: "extended-spell",
        name: "Extended Spell",
        description: "Cost: 1 Sorcery Point. Double the duration of a spell with a duration of 1 minute or longer, up to a maximum of 24 hours."
    },
    {
        id: "heightened-spell",
        name: "Heightened Spell",
        description: "Cost: 2 Sorcery Points. One target of the spell has Disadvantage on the first saving throw made against the spell."
    },
    {
        id: "quickened-spell",
        name: "Quickened Spell",
        description: "Cost: 2 Sorcery Points. Change the casting time of a 1-Action spell to 1 Bonus Action."
    },
    {
        id: "seeking-spell",
        name: "Seeking Spell",
        description: "Cost: 1 Sorcery Point. Reroll a missed spell attack roll to try hitting again."
    },
    {
        id: "subtle-spell",
        name: "Subtle Spell",
        description: "Cost: 1 Sorcery Point. Cast a spell without any verbal, somatic, or non-costly material components."
    },
    {
        id: "transmuted-spell",
        name: "Transmuted Spell",
        description: "Cost: 1 Sorcery Point. Change the damage type of a spell from acid, cold, fire, lightning, poison, or thunder to another of those types."
    },
    {
        id: "twinned-spell",
        name: "Twinned Spell",
        description: "Cost: 1-5 Sorcery Points (equal to spell level). Upcast a single-target spell to affect two targets simultaneously."
    }
];

export const ELDRITCH_INVOCATIONS: FeatureOption[] = [
    {
        id: "pact-of-the-blade",
        name: "Pact of the Blade",
        description: "Bonus action to conjure a pact melee weapon or bond with a weapon. You can use your Charisma modifier for attack and damage rolls."
    },
    {
        id: "pact-of-the-tome",
        name: "Pact of the Tome",
        description: "Conjure a Book of Shadows granting three cantrips from any class list and two 1st-level ritual spells."
    },
    {
        id: "pact-of-the-chain",
        name: "Pact of the Chain",
        description: "Cast Find Familiar as a ritual to summon an enhanced familiar (Imp, Quasit, Sprite, Pseudodragon, or Skeleton)."
    },
    {
        id: "agonizing-blast",
        name: "Agonizing Blast",
        description: "Prerequisite: Eldritch Blast cantrip. Add your Charisma modifier to the damage dealt by Eldritch Blast."
    },
    {
        id: "armor-of-shadows",
        name: "Armor of Shadows",
        description: "You can cast Mage Armor on yourself at will, without expending a spell slot or material components."
    },
    {
        id: "devils-sight",
        name: "Devil's Sight",
        description: "You can see normally in darkness, both magical and nonmagical, to a distance of 120 feet."
    },
    {
        id: "eldritch-mind",
        name: "Eldritch Mind",
        description: "You have Advantage on Constitution saving throws that you make to maintain concentration on a spell."
    },
    {
        id: "eldritch-spear",
        name: "Eldritch Spear",
        description: "Prerequisite: Eldritch Blast. The range of your Eldritch Blast increases to 300 feet."
    },
    {
        id: "fiendish-vigor",
        name: "Fiendish Vigor",
        description: "You can cast False Life on yourself at will as a 1st-level spell without expending a spell slot."
    },
    {
        id: "mask-of-many-faces",
        name: "Mask of Many Faces",
        description: "You can cast Disguise Self at will, without expending a spell slot."
    },
    {
        id: "misty-visions",
        name: "Misty Visions",
        description: "You can cast Silent Image at will, without expending a spell slot or material components."
    },
    {
        id: "repelling-blast",
        name: "Repelling Blast",
        description: "Prerequisite: Eldritch Blast. When you hit a creature with Eldritch Blast, you can push it up to 10 feet away from you in a straight line."
    },
    {
        id: "thirsting-blade",
        name: "Thirsting Blade",
        description: "Prerequisite: Level 5, Pact of the Blade. You can attack twice instead of once whenever you take the Attack action on your turn with your pact weapon.",
        minLevel: 5
    },
    {
        id: "lifedrinker",
        name: "Lifedrinker",
        description: "Prerequisite: Level 9, Pact of the Blade. Hit with pact weapon deals 1d6 extra Necrotic, Psychic, or Radiant damage, and you can expend a hit die to heal.",
        minLevel: 9
    },
    {
        id: "whispers-of-the-grave",
        name: "Whispers of the Grave",
        description: "Prerequisite: Level 9. You can cast Speak with Dead at will, without expending a spell slot.",
        minLevel: 9
    }
];

export const BATTLE_MASTER_MANEUVERS: FeatureOption[] = [
    {
        id: "riposte",
        name: "Riposte",
        description: "When a creature misses you with a melee attack, use your Reaction to spend a superiority die to make a melee weapon attack against it; on hit, add the die to damage."
    },
    {
        id: "precision-attack",
        name: "Precision Attack",
        description: "When you make a weapon attack roll, you can spend a superiority die and add it to the attack roll before or after rolling."
    },
    {
        id: "menacing-attack",
        name: "Menacing Attack",
        description: "When you hit with a weapon attack, spend a superiority die to add damage and force a Wisdom saving throw; on a failure, the target is Frightened of you until the end of your next turn."
    },
    {
        id: "trip-attack",
        name: "Trip Attack",
        description: "When you hit with a weapon attack, spend a superiority die to add damage and force a Strength saving throw; on a failure, you knock the target Prone if it is Large or smaller."
    },
    {
        id: "disarming-attack",
        name: "Disarming Attack",
        description: "When you hit with a weapon attack, spend a superiority die to add damage and force a Strength saving throw; on a failure, the target drops one object of your choice it is holding."
    },
    {
        id: "rally",
        name: "Rally",
        description: "As a Bonus Action, spend a superiority die to bolster a friendly creature with temporary hit points equal to the die roll + your Charisma modifier."
    },
    {
        id: "ambush",
        name: "Ambush",
        description: "When you make a Dexterity (Stealth) check or an Initiative roll, you can expend one superiority die and add it to the roll."
    },
    {
        id: "bait-and-switch",
        name: "Bait and Switch",
        description: "When within 5 feet of a willing ally, spend a superiority die to swap places; both of you gain an AC bonus equal to the die roll until your next turn."
    }
];

export const DRUID_LAND_BIOMES: FeatureOption[] = [
    {
        id: "arid",
        name: "Arid (Desert / Plains)",
        description: "Affinity with scorched sands and blistering heat. Gain Fire Resistance and Land's Aid spells Blur and Fireball."
    },
    {
        id: "polar",
        name: "Polar (Tundra / Ice)",
        description: "Affinity with biting frost and deep glaciers. Gain Cold Resistance and Land's Aid spells Hold Person and Ice Storm."
    },
    {
        id: "temperate",
        name: "Temperate (Forest / Grassland)",
        description: "Affinity with lush woodlands and rolling hills. Gain Lightning/Poison affinity and Land's Aid spells Misty Step and Lightning Bolt."
    },
    {
        id: "tropical",
        name: "Tropical (Rainforest / Swamp)",
        description: "Affinity with humid jungles and toxic fens. Gain Poison Resistance and Land's Aid spells Web and Polymorph."
    }
];

export const ELEMENTAL_FURY_OPTIONS: FeatureOption[] = [
    {
        id: "primal-strike",
        name: "Primal Strike",
        description: "Once on each of your turns when you hit with a weapon attack or a Beast attack in Wild Shape, deal an extra 1d8 Cold, Fire, Lightning, or Thunder damage."
    },
    {
        id: "potent-spellcasting",
        name: "Potent Spellcasting",
        description: "Add your Wisdom modifier to the damage you deal with any Druid cantrip."
    }
];

export const BLESSED_STRIKES_OPTIONS: FeatureOption[] = [
    {
        id: "divine-strike",
        name: "Divine Strike",
        description: "Once on each of your turns when you hit a creature with a weapon attack, cause the attack to deal an extra 1d8 Radiant or Necrotic damage."
    },
    {
        id: "potent-spellcasting",
        name: "Potent Spellcasting",
        description: "Add your Wisdom modifier to the damage you deal with any Cleric cantrip."
    }
];

export const BARBARIAN_ASPECTS: FeatureOption[] = [
    {
        id: "elephant",
        name: "Aspect of the Elephant",
        description: "You gain Advantage on Athletics checks and your carrying capacity is doubled."
    },
    {
        id: "owl",
        name: "Aspect of the Owl",
        description: "You gain Darkvision with a range of 60 feet (or extend it by 60 feet) and gain Advantage on Perception checks."
    },
    {
        id: "spider",
        name: "Aspect of the Spider",
        description: "You gain a Climbing Speed equal to your Walking Speed, and can climb difficult surfaces without making an ability check."
    },
    {
        id: "wolf",
        name: "Aspect of the Wolf",
        description: "You can track other creatures while traveling at a fast pace, and you can move stealthily at a normal pace."
    }
];

export const HUNTER_DEFENSIVE_TACTICS: FeatureOption[] = [
    {
        id: "escape-the-horde",
        name: "Escape the Horde",
        description: "Opportunity attacks made against you have Disadvantage."
    },
    {
        id: "multiattack-defense",
        name: "Multiattack Defense",
        description: "When a creature hits you with an attack roll, that creature has Disadvantage on all other attack rolls against you for the rest of the turn."
    }
];
