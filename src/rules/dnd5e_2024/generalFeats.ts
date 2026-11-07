import { AbilityName } from "./types";

export interface GeneralFeatDefinition {
    id: string;
    name: string;
    description: string;
    allowedStats: AbilityName[];
    isEpicBoon?: boolean;
    benefits: string[];
}

export const GENERAL_FEATS_2024: GeneralFeatDefinition[] = [
    {
        id: "alert-general",
        name: "Alert",
        description: "Always on the lookout for danger, gaining swift reflexes and awareness.",
        allowedStats: ["dex", "int", "wis"],
        benefits: [
            "Add Proficiency Bonus to Initiative rolls.",
            "Swap Initiative with a willing ally in combat."
        ]
    },
    {
        id: "athlete",
        name: "Athlete",
        description: "You have undergone extensive physical training to gain exceptional agility and endurance.",
        allowedStats: ["str", "dex"],
        benefits: [
            "Climbing doesn't cost extra movement.",
            "Standing from prone costs only 5 feet of movement.",
            "Make running jumps after moving only 5 feet."
        ]
    },
    {
        id: "charger",
        name: "Charger",
        description: "You can charge forward to slam into foes or push through defenses.",
        allowedStats: ["str", "dex"],
        benefits: [
            "Dash as a Bonus Action.",
            "Moving 10+ feet in a straight line before an attack deals +1d8 damage or pushes target 10 feet."
        ]
    },
    {
        id: "crossbow-expert",
        name: "Crossbow Expert",
        description: "Extensive training with crossbows grants supernatural firing rate and point-blank accuracy.",
        allowedStats: ["dex"],
        benefits: [
            "Ignore the Loading property of crossbows.",
            "Being within 5 feet of a hostile creature doesn't impose Disadvantage on ranged attack rolls.",
            "Bonus Action attack with a Hand Crossbow after attacking with a one-handed weapon."
        ]
    },
    {
        id: "crusher",
        name: "Crusher",
        description: "You are practiced in the art of crushing your enemies with bludgeoning weapons.",
        allowedStats: ["str", "con"],
        benefits: [
            "Once per turn on bludgeoning hit, move target 5 feet to an unoccupied space.",
            "Critical hits grant Advantage on all attack rolls against the target until your next turn."
        ]
    },
    {
        id: "defensive-duelist",
        name: "Defensive Duelist",
        description: "When wielding a Finesse weapon, you can parry incoming strikes.",
        allowedStats: ["dex"],
        benefits: [
            "Reaction when hit by a melee attack: add your Proficiency Bonus to your AC for that attack."
        ]
    },
    {
        id: "dual-wielder",
        name: "Dual Wielder",
        description: "You master fighting with two weapons, even when neither weapon has the Light property.",
        allowedStats: ["str", "dex"],
        benefits: [
            "+1 bonus to AC while wielding separate melee weapons in each hand.",
            "Use two-weapon fighting even when your one-handed melee weapons aren't Light.",
            "Draw or stow two weapons at once."
        ]
    },
    {
        id: "great-weapon-master",
        name: "Great Weapon Master",
        description: "You learn to put the tremendous weight of a heavy weapon to maximum lethal effect.",
        allowedStats: ["str"],
        benefits: [
            "Bonus Action attack after scoring a critical hit or reducing a creature to 0 HP.",
            "Add your Proficiency Bonus to damage rolls made with Heavy weapons on your turn."
        ]
    },
    {
        id: "heavy-armor-master",
        name: "Heavy Armor Master",
        description: "You can use your heavy armor to deflect and absorb crushing blows.",
        allowedStats: ["str"],
        benefits: [
            "While wearing heavy armor, reduce bludgeoning, piercing, and slashing damage taken by your Proficiency Bonus."
        ]
    },
    {
        id: "mage-slayer",
        name: "Mage Slayer",
        description: "Practiced in techniques to hunt and disrupt spellcasters in close combat.",
        allowedStats: ["str", "dex"],
        benefits: [
            "Reaction attack when a creature within 5 feet casts a spell.",
            "Damaging a concentrating caster imposes Disadvantage on the concentration check.",
            "Once per rest, automatically succeed on a failed Intelligence, Wisdom, or Charisma saving throw."
        ]
    },
    {
        id: "polearm-master",
        name: "Polearm Master",
        description: "You can keep your distance with pole weapons and strike with the haft.",
        allowedStats: ["str", "dex"],
        benefits: [
            "Bonus Action strike with the haft dealing 1d4 bludgeoning damage (Glaive, Halberd, Pike, Quarterstaff, Spear).",
            "Opportunity attack when a creature enters your reach."
        ]
    },
    {
        id: "resilient-str",
        name: "Resilient (Strength)",
        description: "Gain saving throw proficiency in Strength and +1 Strength.",
        allowedStats: ["str"],
        benefits: ["You gain proficiency in Strength saving throws."]
    },
    {
        id: "resilient-dex",
        name: "Resilient (Dexterity)",
        description: "Gain saving throw proficiency in Dexterity and +1 Dexterity.",
        allowedStats: ["dex"],
        benefits: ["You gain proficiency in Dexterity saving throws."]
    },
    {
        id: "resilient-con",
        name: "Resilient (Constitution)",
        description: "Gain saving throw proficiency in Constitution and +1 Constitution.",
        allowedStats: ["con"],
        benefits: ["You gain proficiency in Constitution saving throws."]
    },
    {
        id: "resilient-wis",
        name: "Resilient (Wisdom)",
        description: "Gain saving throw proficiency in Wisdom and +1 Wisdom.",
        allowedStats: ["wis"],
        benefits: ["You gain proficiency in Wisdom saving throws."]
    },
    {
        id: "sentinel",
        name: "Sentinel",
        description: "You have mastered techniques to lock down enemies and protect your allies.",
        allowedStats: ["str", "dex"],
        benefits: [
            "Opportunity attack hits reduce target's speed to 0 for the rest of the turn.",
            "Creatures within 5 feet provoke opportunity attacks even if they take Disengage.",
            "Reaction attack against an enemy within 5 feet that attacks someone else."
        ]
    },
    {
        id: "sharpshooter",
        name: "Sharpshooter",
        description: "You have mastered ranged weapons and can make shots that others find impossible.",
        allowedStats: ["dex"],
        benefits: [
            "Attacking at long range doesn't impose Disadvantage on ranged weapon attack rolls.",
            "Your ranged weapon attacks ignore Half Cover and Three-Quarters Cover.",
            "Being within 5 feet of an enemy doesn't impose Disadvantage on ranged attacks."
        ]
    },
    {
        id: "shield-master",
        name: "Shield Master",
        description: "You use your shield not just for protection, but as an aggressive offensive tool.",
        allowedStats: ["str"],
        benefits: [
            "Bonus Action shield bash to push a creature 5 feet or knock it Prone.",
            "Add shield's AC bonus to Dexterity saving throws against effects targeting only you.",
            "Reaction to take no damage on a successful Dexterity save that normally deals half damage."
        ]
    },
    {
        id: "speedster",
        name: "Speedster (Mobile)",
        description: "You are exceptionally speedy and agile in combat.",
        allowedStats: ["dex", "con"],
        benefits: [
            "Your speed increases by 10 feet.",
            "When you take the Dash action, difficult terrain doesn't cost extra movement.",
            "Attacking a creature prevents it from making opportunity attacks against you for the rest of your turn."
        ]
    },
    {
        id: "tough-general",
        name: "Tough",
        description: "Your hit point maximum increases drastically.",
        allowedStats: ["con"],
        benefits: [
            "Your Hit Point maximum increases by twice your character level, and +2 each level thereafter."
        ]
    },
    {
        id: "war-caster",
        name: "War Caster",
        description: "You have practiced casting spells in the midst of combat.",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Advantage on Constitution saving throws made to maintain concentration on a spell.",
            "Perform somatic components even when holding weapons or a shield in both hands.",
            "Cast a 1-Action spell targeting only the provoking creature as an opportunity attack."
        ]
    },

    // Epic Boons (Level 19+)
    {
        id: "epic-boon-combat-prowess",
        name: "Epic Boon of Combat Prowess",
        description: "Your combat prowess is legendary. Once per turn, when you miss with an attack, you can hit instead.",
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        isEpicBoon: true,
        benefits: [
            "Once on each of your turns when you miss with an attack roll, you can choose to hit instead."
        ]
    },
    {
        id: "epic-boon-dimensional-travel",
        name: "Epic Boon of Dimensional Travel",
        description: "You can slip through the planes at a moment's notice.",
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        isEpicBoon: true,
        benefits: [
            "Immediately after you take the Attack action or cast a spell, you can teleport up to 30 feet to an unoccupied space you can see."
        ]
    },
    {
        id: "epic-boon-fortitude",
        name: "Epic Boon of Fortitude",
        description: "Your health and vitality rival demigods.",
        allowedStats: ["con"],
        isEpicBoon: true,
        benefits: [
            "Your Hit Point maximum increases by 40.",
            "Whenever you receive healing, you regain additional hit points equal to your Constitution modifier."
        ]
    },
    {
        id: "epic-boon-recovery",
        name: "Epic Boon of Recovery",
        description: "You are extraordinarily difficult to kill.",
        allowedStats: ["con"],
        isEpicBoon: true,
        benefits: [
            "When reduced to 0 Hit Points, you can drop to half your Hit Point maximum instead once per Long Rest."
        ]
    },
    {
        id: "epic-boon-spell-recall",
        name: "Epic Boon of Spell Recall",
        description: "You retain magical energy after casting spells.",
        allowedStats: ["int", "wis", "cha"],
        isEpicBoon: true,
        benefits: [
            "Whenever you cast a spell of level 1 through 4 using a spell slot, roll a d4. On a 4, the slot isn't expended."
        ]
    }
];
