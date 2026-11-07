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

export const WILD_HEART_RAGES: FeatureOption[] = [
    {
        id: "bear",
        name: "Bear Heart",
        description: "While raging, you have resistance to all damage types except Psychic damage."
    },
    {
        id: "eagle",
        name: "Eagle Heart",
        description: "While raging, you can take the Dash and Disengage actions as a Bonus Action on your turn, and opportunity attacks against you have Disadvantage."
    },
    {
        id: "wolf",
        name: "Wolf Heart",
        description: "While raging, your allies have Advantage on melee attack rolls against any enemy within 5 feet of you."
    }
];

export const WILD_HEART_TOTEMIC_ATTUNEMENTS: FeatureOption[] = [
    {
        id: "falcon",
        name: "Falcon",
        description: "While raging, you gain a Flying Speed equal to your Walking Speed if you aren't wearing armor."
    },
    {
        id: "lion",
        name: "Lion",
        description: "While raging, whenever an enemy within 5 feet of you makes an attack against a target other than you, you can use your Reaction to make a melee attack roll against that enemy."
    },
    {
        id: "ram",
        name: "Ram",
        description: "While raging, whenever you hit a Large or smaller creature with a melee weapon attack on your turn, you can knock the creature Prone."
    }
];

export const ZEALOT_DIVINE_FURIES: FeatureOption[] = [
    {
        id: "radiant",
        name: "Radiant Fury",
        description: "The first creature you hit on each of your turns with a weapon attack takes extra damage equal to 1d6 + half your Barbarian level as Radiant damage."
    },
    {
        id: "necrotic",
        name: "Necrotic Fury",
        description: "The first creature you hit on each of your turns with a weapon attack takes extra damage equal to 1d6 + half your Barbarian level as Necrotic damage."
    }
];

export const BRUTAL_STRIKE_OPTIONS: FeatureOption[] = [
    {
        id: "forceful-blow",
        name: "Forceful Blow",
        description: "The target is pushed up to 15 feet straight away from you, and you can move up to half your walking speed toward it without provoking opportunity attacks."
    },
    {
        id: "hamstring-blow",
        name: "Hamstring Blow",
        description: "The target's speed is reduced by 15 feet until the start of your next turn."
    }
];

export const TACTICAL_MASTER_PROPERTIES: FeatureOption[] = [
    {
        id: "push",
        name: "Push",
        description: "You can push a target you hit up to 10 feet away from you (substituting for weapon's mastery property)."
    },
    {
        id: "sap",
        name: "Sap",
        description: "The target has Disadvantage on its next attack roll before the start of your next turn."
    },
    {
        id: "slow",
        name: "Slow",
        description: "The target's speed is reduced by 10 feet until the start of your next turn."
    }
];

export const ELEMENTS_ATTUNEMENT_DAMAGE_TYPES: FeatureOption[] = [
    {
        id: "acid",
        name: "Acid Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Acid damage."
    },
    {
        id: "cold",
        name: "Cold Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Cold damage."
    },
    {
        id: "fire",
        name: "Fire Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Fire damage."
    },
    {
        id: "lightning",
        name: "Lightning Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Lightning damage."
    },
    {
        id: "thunder",
        name: "Thunder Attunement",
        description: "Your unarmed strikes reach an extra 10 feet and can deal Thunder damage."
    }
];

export const HUNTER_PREY_OPTIONS: FeatureOption[] = [
    {
        id: "colossus-slayer",
        name: "Colossus Slayer",
        description: "Once per turn when you hit a creature with a weapon attack, it takes an extra 1d8 damage if it's below its maximum hit points."
    },
    {
        id: "horde-breaker",
        name: "Horde Breaker",
        description: "Once on each of your turns when you make a weapon attack, you can make another attack with the same weapon against a different creature that is within 5 feet of the original target."
    }
];

export const PRIMAL_COMPANION_TYPES: FeatureOption[] = [
    {
        id: "land",
        name: "Beast of the Land",
        description: "A medium predatory beast with Maul (charge damage and knockdown prone) and 40 ft. walking + 40 ft. climbing speed."
    },
    {
        id: "sea",
        name: "Beast of the Sea",
        description: "An amphibious beast with Binding Strike (grapples on hit) and 60 ft. swimming speed + water breathing."
    },
    {
        id: "sky",
        name: "Beast of the Sky",
        description: "A small flying avian beast with Flyby and 60 ft. flying speed for scouting and aerial strikes."
    }
];

export const ROGUE_CUNNING_STRIKES: FeatureOption[] = [
    {
        id: "poison",
        name: "Poison (Cost: 1d6)",
        description: "The target must succeed on a Con saving throw or be Poisoned for 1 minute."
    },
    {
        id: "trip",
        name: "Trip (Cost: 1d6)",
        description: "If the target is Large or smaller, it must succeed on a Dex saving throw or fall Prone."
    },
    {
        id: "withdraw",
        name: "Withdraw (Cost: 1d6)",
        description: "Immediately after the attack, you can move up to half your walking speed without provoking opportunity attacks."
    }
];

export const ROGUE_DEVIOUS_STRIKES: FeatureOption[] = [
    {
        id: "daze",
        name: "Daze (Cost: 2d6)",
        description: "The target must succeed on a Con saving throw or can only take an action or bonus action on its next turn."
    },
    {
        id: "knock-out",
        name: "Knock Out (Cost: 6d6)",
        description: "The target must succeed on a Con saving throw or fall Unconscious for 1 minute or until it takes damage."
    },
    {
        id: "obscure",
        name: "Obscure (Cost: 3d6)",
        description: "The target is blinded until the end of its next turn unless it succeeds on a Dex saving throw."
    }
];

export const DRACONIC_ANCESTOR_ELEMENTS: FeatureOption[] = [
    { id: "black", name: "Black (Acid)", description: "Dragon ancestor attuned to Acid. Resistance to Acid at level 6 and bonus damage with acid spells." },
    { id: "blue", name: "Blue (Lightning)", description: "Dragon ancestor attuned to Lightning. Resistance to Lightning at level 6 and bonus damage with lightning spells." },
    { id: "brass", name: "Brass (Fire)", description: "Dragon ancestor attuned to Fire. Resistance to Fire at level 6 and bonus damage with fire spells." },
    { id: "bronze", name: "Bronze (Lightning)", description: "Dragon ancestor attuned to Lightning. Resistance to Lightning at level 6 and bonus damage with lightning spells." },
    { id: "copper", name: "Copper (Acid)", description: "Dragon ancestor attuned to Acid. Resistance to Acid at level 6 and bonus damage with acid spells." },
    { id: "gold", name: "Gold (Fire)", description: "Dragon ancestor attuned to Fire. Resistance to Fire at level 6 and bonus damage with fire spells." },
    { id: "green", name: "Green (Poison)", description: "Dragon ancestor attuned to Poison. Resistance to Poison at level 6 and bonus damage with poison spells." },
    { id: "red", name: "Red (Fire)", description: "Dragon ancestor attuned to Fire. Resistance to Fire at level 6 and bonus damage with fire spells." },
    { id: "silver", name: "Silver (Cold)", description: "Dragon ancestor attuned to Cold. Resistance to Cold at level 6 and bonus damage with cold spells." },
    { id: "white", name: "White (Cold)", description: "Dragon ancestor attuned to Cold. Resistance to Cold at level 6 and bonus damage with cold spells." }
];

export const FIENDISH_RESILIENCE_DAMAGE_TYPES: FeatureOption[] = [
    { id: "acid", name: "Acid", description: "Gain resistance to Acid damage until you finish a Short or Long Rest." },
    { id: "bludgeoning", name: "Bludgeoning", description: "Gain resistance to Bludgeoning damage until you finish a Short or Long Rest." },
    { id: "cold", name: "Cold", description: "Gain resistance to Cold damage until you finish a Short or Long Rest." },
    { id: "fire", name: "Fire", description: "Gain resistance to Fire damage until you finish a Short or Long Rest." },
    { id: "force", name: "Force", description: "Gain resistance to Force damage until you finish a Short or Long Rest." },
    { id: "lightning", name: "Lightning", description: "Gain resistance to Lightning damage until you finish a Short or Long Rest." },
    { id: "necrotic", name: "Necrotic", description: "Gain resistance to Necrotic damage until you finish a Short or Long Rest." },
    { id: "piercing", name: "Piercing", description: "Gain resistance to Piercing damage until you finish a Short or Long Rest." },
    { id: "poison", name: "Poison", description: "Gain resistance to Poison damage until you finish a Short or Long Rest." },
    { id: "psychic", name: "Psychic", description: "Gain resistance to Psychic damage until you finish a Short or Long Rest." },
    { id: "radiant", name: "Radiant", description: "Gain resistance to Radiant damage until you finish a Short or Long Rest." },
    { id: "slashing", name: "Slashing", description: "Gain resistance to Slashing damage until you finish a Short or Long Rest." },
    { id: "thunder", name: "Thunder", description: "Gain resistance to Thunder damage until you finish a Short or Long Rest." }
];

export const WIZARD_SCHOLAR_SKILLS: FeatureOption[] = [
    { id: "arcana", name: "Arcana (Expertise)", description: "Double proficiency bonus on Intelligence (Arcana) checks." },
    { id: "history", name: "History (Expertise)", description: "Double proficiency bonus on Intelligence (History) checks." },
    { id: "investigation", name: "Investigation (Expertise)", description: "Double proficiency bonus on Intelligence (Investigation) checks." },
    { id: "nature", name: "Nature (Expertise)", description: "Double proficiency bonus on Intelligence (Nature) checks." },
    { id: "religion", name: "Religion (Expertise)", description: "Double proficiency bonus on Intelligence (Religion) checks." }
];
