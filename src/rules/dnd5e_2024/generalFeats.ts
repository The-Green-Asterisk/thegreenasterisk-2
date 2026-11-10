import { GeneralFeatDefinition } from "./types";

export { GeneralFeatDefinition };

export const GENERAL_FEATS_2024: GeneralFeatDefinition[] = [
    // --- General Feats (Level 4+) ---
    {
        id: "ability-score-improvement",
        name: "Ability Score Improvement",
        description: "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can't increase an ability score above 20. Repeatable.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1.",
            "You cannot increase an ability score above 20 with this feat.",
            "Repeatable: You can take this feat more than once."
        ]
    },
    {
        id: "actor",
        name: "Actor",
        description: "Skilled at mimicry and dramatics, you gain advantage on deception and performance to maintain a disguise.",
        category: "general",
        prerequisite: "Level 4+, Charisma 13+",
        allowedStats: ["cha"],
        benefits: [
            "Ability Score Increase: Increase your Charisma score by 1, to a maximum of 20.",
            "Disguise Advantage: You have Advantage on Charisma (Deception) and Charisma (Performance) checks to pass yourself off as a different person.",
            "Mimicry: You can mimic the speech of another person or the sounds of other creatures you have heard for at least 1 minute. A listener determines success by an Insight check contested by your Deception or Performance check."
        ]
    },
    {
        id: "athlete",
        name: "Athlete",
        description: "You have undergone extensive physical training to gain exceptional agility and endurance.",
        category: "general",
        prerequisite: "Level 4+, Strength or Dexterity 13+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Climb Speed: You gain a Climb Speed equal to your Speed.",
            "Quick Stand: Standing from Prone costs only 5 feet of movement.",
            "Running Jumps: You can make running high and long jumps after moving only 5 feet."
        ]
    },
    {
        id: "charger",
        name: "Charger",
        description: "You can charge forward to slam into foes or push through defenses.",
        category: "general",
        prerequisite: "Level 4+, Strength or Dexterity 13+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Enhanced Dash: When you take the Dash action, your Speed increases by 10 feet for that action.",
            "Charge Attack: If you move at least 10 feet in a straight line toward a target and hit it with an attack roll, you can either deal 1d8 extra damage or push the target up to 10 feet away."
        ]
    },
    {
        id: "chef",
        name: "Chef",
        description: "Time and effort spent crafting food and drink has granted you culinary expertise.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["con", "wis"],
        benefits: [
            "Ability Score Increase: Increase your Constitution or Wisdom score by 1, to a maximum of 20.",
            "Cook's Utensils: You gain proficiency with Cook's Utensils.",
            "Restorative Food: During a Short Rest, you can cook special food that restores an extra 1d8 HP to creatures that spend Hit Point Dice.",
            "Treats: As part of a Long Rest, you can prepare treats equal to your Proficiency Bonus. A creature can eat a treat as a Bonus Action to gain Temporary Hit Points equal to your Proficiency Bonus."
        ]
    },
    {
        id: "crossbow-expert",
        name: "Crossbow Expert",
        description: "Extensive training with crossbows grants supernatural firing rate and point-blank accuracy.",
        category: "general",
        prerequisite: "Level 4+, Dexterity 13+",
        allowedStats: ["dex"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Ignore Loading: You ignore the Loading property of crossbows.",
            "Firing in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged attack rolls with crossbows.",
            "Dual Wielding Crossbows: When you make an attack with a one-handed weapon, you can use a Bonus Action to attack with a Hand Crossbow."
        ]
    },
    {
        id: "crusher",
        name: "Crusher",
        description: "You are practiced in the art of crushing your enemies with bludgeoning weapons.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "con"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Constitution score by 1, to a maximum of 20.",
            "Push: Once per turn when you deal Bludgeoning damage to a creature, you can move it 5 feet to an unoccupied space (size Large or smaller).",
            "Critical Impact: When you score a Critical Hit with Bludgeoning damage, attack rolls against that target have Advantage until the start of your next turn."
        ]
    },
    {
        id: "defensive-duelist",
        name: "Defensive Duelist",
        description: "When wielding a Finesse weapon, you can parry incoming strikes.",
        category: "general",
        prerequisite: "Level 4+, Dexterity 13+",
        allowedStats: ["dex"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Parry: When you are wielding a Finesse weapon and hit by a melee attack, you can use your Reaction to add your Proficiency Bonus to your AC for that attack."
        ]
    },
    {
        id: "dual-wielder",
        name: "Dual Wielder",
        description: "You master fighting with two weapons, even when neither weapon has the Light property.",
        category: "general",
        prerequisite: "Level 4+, Strength or Dexterity 13+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Enhanced Dual Wielding: When you take the Attack action and attack with a weapon that has the Light property, you can make one extra attack with a different weapon in your other hand as a Bonus Action even if that weapon isn't Light.",
            "Quick Stow/Draw: You can draw or stow two weapons when you would normally be able to draw or stow only one."
        ]
    },
    {
        id: "dungeon-delver",
        name: "Dungeon Delver",
        description: "Alert to the hidden traps and secret doors found in dungeons.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["int", "wis"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
            "Advantage on Perception and Investigation checks to detect secret doors and traps.",
            "Advantage on saving throws made to avoid or resist traps.",
            "Resistance to the damage dealt by traps.",
            "Traveling at a fast pace doesn't impose the normal -5 penalty on your passive Perception."
        ]
    },
    {
        id: "durable",
        name: "Durable",
        description: "Hardy and resilient, you regain hit points with greater vigor.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["con"],
        benefits: [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 20.",
            "Advantage on Death Saving Throws.",
            "Speedy Recovery: As a Bonus Action, you can expend one Hit Point Die to regain Hit Points equal to the roll plus your Constitution modifier."
        ]
    },
    {
        id: "elemental-adept",
        choices: [{ id: "damage-type", name: "Damage Type", options: ["Acid", "Cold", "Fire", "Lightning", "Thunder"] }],
        name: "Elemental Adept",
        description: "Spells you cast ignore resistance to a chosen damage type (Acid, Cold, Fire, Lightning, or Thunder).",
        category: "general",
        prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Ignore Resistance: Spells you cast ignore Resistance to your chosen damage type (Acid, Cold, Fire, Lightning, or Thunder).",
            "Minimum Damage: When you roll damage for a spell of that type, any roll of 1 on a damage die is treated as a 2."
        ]
    },
    {
        id: "fey-touched",
        limitedUse: 1,
        name: "Fey Touched",
        description: "Your exposure to the Feywild has granted you misty step and an additional spell.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Misty Step: You learn the Misty Step spell and can cast it once without a spell slot per Long Rest.",
            "1st-Level Spell: You learn one 1st-level Divination or Enchantment spell and can cast it once without a spell slot per Long Rest."
        ]
    },
    {
        id: "grappler",
        name: "Grappler",
        description: "You have developed skills to wrestle and subdue enemies in close quarters.",
        category: "general",
        prerequisite: "Level 4+, Strength or Dexterity 13+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Punch and Grab: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage and grapple the target simultaneously (once per turn).",
            "Attack Advantage: You have Advantage on attack rolls against a creature Grappled by you.",
            "Fast Wrestler: Your Speed is not halved when moving a creature Grappled by you, provided the creature is your size or smaller."
        ]
    },
    {
        id: "great-weapon-master",
        name: "Great Weapon Master",
        description: "You learn to put the tremendous weight of a heavy weapon to maximum lethal effect.",
        category: "general",
        prerequisite: "Level 4+, Strength 13+",
        allowedStats: ["str"],
        benefits: [
            "Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.",
            "Hew: Immediately after you score a Critical Hit with a melee weapon or reduce a creature to 0 HP, you can make one melee weapon attack as a Bonus Action.",
            "Heavy Weapon Mastery: When you hit a creature with a Heavy weapon as part of the Attack action on your turn, you can add your Proficiency Bonus to the damage roll."
        ]
    },
    {
        id: "heavy-armor-master",
        name: "Heavy Armor Master",
        description: "You can use your heavy armor to deflect and absorb crushing blows.",
        category: "general",
        prerequisite: "Level 4+, Heavy Armor Training",
        allowedStats: ["str", "con"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Constitution score by 1, to a maximum of 20.",
            "Damage Reduction: While wearing Heavy Armor, bludgeoning, piercing, and slashing damage that you take from nonmagical attacks is reduced by an amount equal to your Proficiency Bonus."
        ]
    },
    {
        id: "heavily-armored",
        name: "Heavily Armored",
        description: "You have trained to master the use of heavy armor.",
        category: "general",
        prerequisite: "Level 4+, Medium Armor Training",
        allowedStats: ["str", "con"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Constitution score by 1, to a maximum of 20.",
            "Heavy Armor Training: You gain proficiency with Heavy Armor."
        ]
    },
    {
        id: "inspiring-leader",
        name: "Inspiring Leader",
        description: "You spend 10 minutes inspiring your companions, bolstering their resolve with temporary hit points.",
        category: "general",
        prerequisite: "Level 4+, Wisdom or Charisma 13+",
        allowedStats: ["wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Wisdom or Charisma score by 1, to a maximum of 20.",
            "Inspiring Speech: Over the course of 10 minutes, you can inspire up to six friendly creatures within 30 feet. Each creature gains Temporary Hit Points equal to your level + your Wisdom or Charisma modifier."
        ]
    },
    {
        id: "keen-mind",
        skillPicks: [{ count: 1, from: ["Arcana", "History", "Investigation", "Nature", "Religion"], mode: "proficiency-or-expertise" }],
        name: "Keen Mind",
        description: "You have a mind that can track time, direction, and detail with pinpoint precision.",
        category: "general",
        prerequisite: "Level 4+, Intelligence 13+",
        allowedStats: ["int"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence score by 1, to a maximum of 20.",
            "Study Bonus: You can take the Study action as a Bonus Action.",
            "Quick Lore: You gain proficiency in Arcana, History, Investigation, Nature, or Religion. If you are already proficient, you gain Expertise."
        ]
    },
    {
        id: "lightly-armored",
        name: "Lightly Armored",
        description: "You train to master the protective arts of light armor and shields.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Light Armor Training: You gain proficiency with Light Armor and Shields."
        ]
    },
    {
        id: "mage-slayer",
        name: "Mage Slayer",
        description: "Practiced in techniques to hunt and disrupt spellcasters in close combat.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Concentration Breaker: When you damage a creature concentrating on a spell, that creature has Disadvantage on the saving throw to maintain concentration.",
            "Guarded Mind: If you fail a saving throw against an effect that targets Intelligence, Wisdom, or Charisma, you can turn the failure into a success (once per Short or Long Rest)."
        ]
    },
    {
        id: "medium-armor-master",
        modifiers: [{ target: "vitals.ac.mediumArmorMaxDex", type: "set", value: 3, description: "Add up to +3 Dexterity to AC in Medium armor" }],
        name: "Medium Armor Master",
        description: "You have practiced moving stealthily and swiftly in medium armor.",
        category: "general",
        prerequisite: "Level 4+, Medium Armor Training",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Dexterity Bonus: When you wear Medium Armor, you can add 3, rather than 2, to your AC if you have a Dexterity of 16 or higher.",
            "No Stealth Disadvantage: Wearing Medium Armor doesn't impose Disadvantage on your Dexterity (Stealth) checks."
        ]
    },
    {
        id: "moderately-armored",
        name: "Moderately Armored",
        description: "You have trained to use medium armor and shields for battlefield survival.",
        category: "general",
        prerequisite: "Level 4+, Light Armor Training",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Armor Proficiency: You gain proficiency with Medium Armor and Shields."
        ]
    },
    {
        id: "mounted-combatant",
        name: "Mounted Combatant",
        description: "You are a dangerous foe to face while mounted.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex", "wis"],
        benefits: [
            "Ability Score Increase: Increase your Strength, Dexterity, or Wisdom score by 1, to a maximum of 20.",
            "Mount Advantage: You have Advantage on melee attack rolls against unmounted creatures smaller than your mount.",
            "Mount Protection: You can force an attack aimed at your mount to target you instead.",
            "Evasion: If your mount is subjected to an effect that allows a Dexterity save for half damage, it takes no damage on success and half on failure."
        ]
    },
    {
        id: "observant",
        skillPicks: [{ count: 1, from: ["Insight", "Investigation", "Perception"], mode: "proficiency-or-expertise" }],
        name: "Observant",
        description: "Quick to notice details in your environment, enhancing investigation and perception.",
        category: "general",
        prerequisite: "Level 4+, Intelligence or Wisdom 13+",
        allowedStats: ["int", "wis"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence or Wisdom score by 1, to a maximum of 20.",
            "Quick Search: You can take the Search action as a Bonus Action.",
            "Keen Senses: You gain proficiency in Insight, Investigation, or Perception. If you are already proficient, you gain Expertise."
        ]
    },
    {
        id: "piercer",
        name: "Piercer",
        description: "You have achieved deadly precision with piercing weapons.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Reroll Piercing Damage: Once per turn when you hit a creature with Piercing damage, you can reroll one of the damage dice and must use the new roll.",
            "Critical Puncture: When you score a Critical Hit with Piercing damage, you roll one additional damage die."
        ]
    },
    {
        id: "poisoner",
        name: "Poisoner",
        description: "You master the preparation and application of lethal poisons.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["dex", "int"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity or Intelligence score by 1, to a maximum of 20.",
            "Ignore Resistance: When you make a damage roll, you ignore Resistance to Poison damage.",
            "Fast Application: You can apply poison to a weapon or piece of ammunition as a Bonus Action.",
            "Potent Brew: You can craft potent poisons using a Poisoner's Kit that impose the Poisoned condition."
        ]
    },
    {
        id: "polearm-master",
        name: "Polearm Master",
        description: "You can keep your distance with pole weapons and strike with the haft.",
        category: "general",
        prerequisite: "Level 4+, Strength or Dexterity 13+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Haft Strike: Immediately after you take the Attack action and attack with a Glaive, Halberd, Pike, Quarterstaff, or Spear, you can use a Bonus Action to make a melee attack with the opposite end (1d4 bludgeoning).",
            "Reactive Strike: While wielding a Glaive, Halberd, Pike, Quarterstaff, or Spear, you can use your Reaction to make an Opportunity Attack against a creature that enters your reach."
        ]
    },
    {
        id: "resilient-str",
        name: "Resilient (Strength)",
        description: "Gain saving throw proficiency in Strength and +1 Strength.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str"],
        benefits: [
            "Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Strength saving throws."
        ]
    },
    {
        id: "resilient-dex",
        name: "Resilient (Dexterity)",
        description: "Gain saving throw proficiency in Dexterity and +1 Dexterity.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["dex"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Dexterity saving throws."
        ]
    },
    {
        id: "resilient-con",
        name: "Resilient (Constitution)",
        description: "Gain saving throw proficiency in Constitution and +1 Constitution.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["con"],
        benefits: [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Constitution saving throws."
        ]
    },
    {
        id: "resilient-int",
        name: "Resilient (Intelligence)",
        description: "Gain saving throw proficiency in Intelligence and +1 Intelligence.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["int"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Intelligence saving throws."
        ]
    },
    {
        id: "resilient-wis",
        name: "Resilient (Wisdom)",
        description: "Gain saving throw proficiency in Wisdom and +1 Wisdom.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["wis"],
        benefits: [
            "Ability Score Increase: Increase your Wisdom score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Wisdom saving throws."
        ]
    },
    {
        id: "resilient-cha",
        name: "Resilient (Charisma)",
        description: "Gain saving throw proficiency in Charisma and +1 Charisma.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["cha"],
        benefits: [
            "Ability Score Increase: Increase your Charisma score by 1, to a maximum of 20.",
            "Saving Throw Proficiency: You gain proficiency in Charisma saving throws."
        ]
    },
    {
        id: "ritual-caster",
        name: "Ritual Caster",
        description: "You have learned to cast useful spells as rituals, broadening your magical repertoire.",
        category: "general",
        prerequisite: "Level 4+, Intelligence, Wisdom, or Charisma 13+",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Ritual Spells: You acquire a ritual book holding two 1st-level spells with the ritual tag from a chosen class list.",
            "Quick Ritual: Once per Long Rest, you can cast one of your ritual spells using its normal casting time rather than adding 10 minutes."
        ]
    },
    {
        id: "sentinel",
        name: "Sentinel",
        description: "You have mastered techniques to lock down enemies and protect your allies.",
        category: "general",
        prerequisite: "Level 4+, Strength or Dexterity 13+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Halt: When you hit a creature with an Opportunity Attack, its Speed becomes 0 for the rest of the current turn.",
            "Guardian: When a creature within 5 feet makes an attack against a target other than you, you can use your Reaction to make an Opportunity Attack against that attacking creature."
        ]
    },
    {
        id: "shadow-touched",
        limitedUse: 1,
        name: "Shadow Touched",
        description: "Your exposure to the Shadowfell has granted you invisibility and an additional spell.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Invisibility: You learn the Invisibility spell and can cast it once without a spell slot per Long Rest.",
            "1st-Level Spell: You learn one 1st-level Illusion or Necromancy spell and can cast it once without a spell slot per Long Rest."
        ]
    },
    {
        id: "sharpshooter",
        name: "Sharpshooter",
        description: "You have mastered ranged weapons and can make shots that others find impossible.",
        category: "general",
        prerequisite: "Level 4+, Dexterity 13+",
        allowedStats: ["dex"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Long Shots: Attacking at long range doesn't impose Disadvantage on your ranged weapon attack rolls.",
            "Bypass Cover: Your ranged weapon attacks ignore Half Cover and Three-Quarters Cover.",
            "Close-Quarters Shooting: Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged attack rolls."
        ]
    },
    {
        id: "shield-master",
        name: "Shield Master",
        description: "You use your shield not just for protection, but as an aggressive offensive tool.",
        category: "general",
        prerequisite: "Level 4+, Shield Training",
        allowedStats: ["str"],
        benefits: [
            "Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.",
            "Shield Bash: If you take the Attack action on your turn and hit with a melee weapon, you can use a Bonus Action to bash with your shield to push the target 5 feet or knock it Prone.",
            "Interpose Shield: If you are subjected to an effect that allows a Dexterity save for half damage, you can take a Reaction to take no damage instead if you succeed."
        ]
    },
    {
        id: "skill-expert",
        skillPicks: [{ count: 1, mode: "proficiency" }, { count: 1, mode: "expertise" }],
        name: "Skill Expert",
        description: "Your focused study grants you broad skill proficiency and peerless expertise.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 20.",
            "Skill Proficiency: You gain proficiency in one skill of your choice.",
            "Skill Expertise: Choose one skill in which you have proficiency; you gain Expertise in that skill."
        ]
    },
    {
        id: "skulker",
        modifiers: [{ target: "vitals.blindsight", type: "set", value: 10, description: "Blindsight 10 ft." }],
        name: "Skulker",
        description: "You are expert at slinking through shadows and striking unseen.",
        category: "general",
        prerequisite: "Level 4+, Dexterity 13+",
        allowedStats: ["dex"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.",
            "Fog of War: You can make a Hide action even when lightly obscured.",
            "Sniper: When you are hidden from a creature and miss with a ranged weapon attack, making the attack doesn't reveal your position.",
            "Blindsight: You have Blindsight with a range of 10 feet."
        ]
    },
    {
        id: "slasher",
        name: "Slasher",
        description: "You have mastered techniques for slashing weapons to hamper enemy movement.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Hamstring: Once per turn when you deal Slashing damage to a creature, you can reduce its Speed by 10 feet until the start of your next turn.",
            "Grievous Wound: When you score a Critical Hit with Slashing damage, the target has Disadvantage on all attack rolls until the start of your next turn."
        ]
    },
    {
        id: "speedy",
        modifiers: [{ target: "vitals.speed", type: "bonus", value: 10, description: "+10 ft. Speed" }],
        name: "Speedy",
        description: "You are exceptionally swift and agile, dodging through enemy lines.",
        category: "general",
        prerequisite: "Level 4+, Dexterity or Constitution 13+",
        allowedStats: ["dex", "con"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity or Constitution score by 1, to a maximum of 20.",
            "Speed Increase: Your Speed increases by 10 feet.",
            "Dash Through Difficult Terrain: When you take the Dash action, Difficult Terrain doesn't cost extra movement for that turn.",
            "Agile Movement: Opportunity Attacks made against you have Disadvantage."
        ]
    },
    {
        id: "spell-sniper",
        name: "Spell Sniper",
        description: "You have learned techniques to enhance your ranged spell attacks.",
        category: "general",
        prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Double Range: When you cast a spell that requires an attack roll and has a range of at least 10 feet, the range is doubled.",
            "Bypass Cover: Your ranged spell attacks ignore Half Cover and Three-Quarters Cover.",
            "Casting in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on your ranged spell attack rolls."
        ]
    },
    {
        id: "telekinetic",
        name: "Telekinetic",
        description: "You learn to move things with your mind, manipulating foes and objects.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Mage Hand: You learn the Mage Hand cantrip and can cast it without verbal or somatic components; its range is increased by 30 feet.",
            "Telekinetic Shove: As a Bonus Action, you can attempt to telekinetically shove one creature within 30 feet 5 feet toward or away from you (Strength save vs. spell save DC)."
        ]
    },
    {
        id: "telepathic",
        name: "Telepathic",
        description: "You awaken the ability to communicate with and read the minds of others.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Telepathy: You can speak telepathically to any creature within 60 feet that you can see.",
            "Detect Thoughts: You learn Detect Thoughts and can cast it once without a spell slot per Long Rest."
        ]
    },
    {
        id: "war-caster",
        modifiers: [{ target: "saves.con", type: "advantage", condition: "concentration", description: "Advantage on Constitution saves to maintain Concentration" }],
        name: "War Caster",
        description: "You have practiced casting spells in the midst of combat.",
        category: "general",
        prerequisite: "Level 4+, Spellcasting or Pact Magic Feature",
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.",
            "Concentration Advantage: You have Advantage on Constitution saving throws made to maintain concentration on a spell when you take damage.",
            "Somatic Components: You can perform somatic components of spells even when holding weapons or a shield in both hands.",
            "Reactive Spell: When a hostile creature's movement provokes an Opportunity Attack from you, you can use your Reaction to cast a 1-Action spell at that creature."
        ]
    },
    {
        id: "weapon-master",
        name: "Weapon Master",
        description: "You practice extensively with diverse weapons, unlocking their masteries.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.",
            "Mastery Properties: You gain the Weapon Mastery property for one weapon of your choice in which you have proficiency."
        ]
    },

    // --- Fighting Style Feats (Prerequisite: Fighting Style Feature) ---
    {
        id: "fighting-style-archery",
        name: "Archery",
        description: "You gain a +2 bonus to attack rolls you make with Ranged weapons.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "You gain a +2 bonus to attack rolls you make with Ranged weapons."
        ]
    },
    {
        id: "fighting-style-blind-fighting",
        name: "Blind Fighting",
        description: "You have Blindsight with a range of 10 feet.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "You have Blindsight with a range of 10 feet. Within that range, you can effectively see anything that isn't behind total cover, even if you are blinded or in darkness."
        ]
    },
    {
        id: "fighting-style-defense",
        name: "Defense",
        description: "While you are wearing armor, you gain a +1 bonus to Armor Class.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "While you are wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class."
        ]
    },
    {
        id: "fighting-style-dueling",
        name: "Dueling",
        description: "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon."
        ]
    },
    {
        id: "fighting-style-great-weapon-fighting",
        name: "Great Weapon Fighting",
        description: "When you roll damage for an attack with a two-handed melee weapon, you can treat any 1 or 2 on a damage die as a 3.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit."
        ]
    },
    {
        id: "fighting-style-interception",
        name: "Interception",
        description: "When a creature you can see hits an ally within 5 feet with an attack roll, you can use your Reaction to reduce the damage.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "When a creature you can see hits a target within 5 feet of you with an attack roll, you can use your Reaction to reduce the damage the target takes by 1d10 + your Proficiency Bonus (must be wielding a Shield or Simple/Martial weapon)."
        ]
    },
    {
        id: "fighting-style-protection",
        name: "Protection",
        description: "When a creature you can see attacks an ally within 5 feet, you can use your Reaction to impose Disadvantage.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "When a creature you can see attacks a target within 5 feet of you other than yourself, you can use your Reaction to impose Disadvantage on the attack roll (must be wielding a Shield)."
        ]
    },
    {
        id: "fighting-style-superior-technique",
        name: "Superior Technique",
        description: "You learn one maneuver of your choice from the Battle Master archetype.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "You learn one maneuver of your choice from the Battle Master archetype and gain one Superiority Die (d6), which is expended when used and regained on a Short or Long Rest."
        ]
    },
    {
        id: "fighting-style-thrown-weapon-fighting",
        name: "Thrown Weapon Fighting",
        description: "You can draw a weapon with the Thrown property as part of the attack and gain +2 to damage rolls.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "You can draw a weapon that has the Thrown property as part of the attack you make with the weapon.",
            "When you hit with a ranged attack using a thrown weapon, you gain a +2 bonus to the damage roll."
        ]
    },
    {
        id: "fighting-style-two-weapon-fighting",
        name: "Two-Weapon Fighting",
        description: "When making an extra attack using a Light weapon, you can add your ability modifier to the damage.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren't already adding it."
        ]
    },
    {
        id: "fighting-style-unarmed-fighting",
        name: "Unarmed Fighting",
        description: "Your Unarmed Strikes deal 1d6 (or 1d8) damage, and you deal extra damage to grappled targets.",
        category: "fighting-style",
        prerequisite: "Fighting Style Feature",
        allowedStats: [],
        benefits: [
            "Your Unarmed Strikes deal 1d6 + Strength modifier bludgeoning damage (or 1d8 + Strength modifier if you aren't wielding weapons or a shield).",
            "At the start of each of your turns, you can deal 1d4 bludgeoning damage to one creature grappled by you."
        ]
    },

    // --- Epic Boon Feats (Level 19+, Ability score max increases up to 30) ---
    {
        id: "boon-of-combat-prowess",
        name: "Boon of Combat Prowess",
        description: "Your combat prowess is peerless. When you miss with an attack roll, you can hit instead.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Peerless Aim: When you miss with an attack roll, you can hit instead. Once you use this benefit, you can't use it again until the start of your next turn."
        ]
    },
    {
        id: "boon-of-dimensional-travel",
        name: "Boon of Dimensional Travel",
        description: "Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Blink Steps: Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see."
        ]
    },
    {
        id: "boon-of-energy-evasion",
        name: "Boon of Energy Evasion",
        description: "You gain energy absorption and defense against elemental damage.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["dex", "con"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity or Constitution score by 1, to a maximum of 30.",
            "Energy Resistance: When you finish a Long Rest, choose two damage types from Acid, Cold, Fire, Lightning, Poison, or Thunder. You have Resistance to those damage types until your next Long Rest.",
            "Energy Redirection: When you take damage of either chosen type, you can use your Reaction to deal that amount of damage to a creature within 60 feet."
        ]
    },
    {
        id: "boon-of-fate",
        name: "Boon of Fate",
        description: "When you or a creature within 60 feet succeeds or fails a D20 Test, you can add or subtract 2d4.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Improve Fate: When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll (usable once per Short/Long Rest or rolling Initiative)."
        ]
    },
    {
        id: "boon-of-fortitude",
        name: "Boon of Fortitude",
        description: "Your Hit Point maximum increases by 40, and you gain rapid physical healing.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["con"],
        benefits: [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 30.",
            "Fortified Life: Your Hit Point maximum increases by 40.",
            "Health Recovery: Whenever you regain Hit Points, you regain additional Hit Points equal to your Constitution modifier."
        ]
    },
    {
        id: "boon-of-irresistible-offense",
        name: "Boon of Irresistible Offense",
        description: "The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex"],
        benefits: [
            "Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 30.",
            "Overcome Defenses: The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance.",
            "Overwhelming Strike: When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat."
        ]
    },
    {
        id: "boon-of-recovery",
        name: "Boon of Recovery",
        description: "You have advantage on Death Saving Throws and can bounce back from death's door.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["con"],
        benefits: [
            "Ability Score Increase: Increase your Constitution score by 1, to a maximum of 30.",
            "Unfailing Vitality: You have Advantage on Death Saving Throws.",
            "Lasting Recovery: When you drop to 0 Hit Points, you can regain Hit Points equal to half your Hit Point maximum instead (once per Long Rest)."
        ]
    },
    {
        id: "boon-of-skill-proficiency",
        name: "Boon of Skill Proficiency",
        description: "You gain proficiency in all skills and expertise in one skill.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Universal Knowledge: You gain proficiency in all skills.",
            "Master of Skills: Choose one skill in which you have proficiency; you gain Expertise in that skill."
        ]
    },
    {
        id: "boon-of-speed",
        modifiers: [{ target: "vitals.speed", type: "bonus", value: 30, description: "+30 ft. Speed" }],
        name: "Boon of Speed",
        description: "Your Speed increases by 30 feet, and you can Disengage as a Bonus Action.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["dex", "con"],
        benefits: [
            "Ability Score Increase: Increase your Dexterity or Constitution score by 1, to a maximum of 30.",
            "Quickness: Your Speed increases by 30 feet.",
            "Escape Artist: As a Bonus Action, you can take the Disengage action, which also ends the Grappled condition on you."
        ]
    },
    {
        id: "boon-of-spell-recall",
        name: "Boon of Spell Recall",
        description: "Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If matching the slot level, the slot isn't expended.",
        category: "epic-boon",
        prerequisite: "Level 19+, Spellcasting Feature",
        isEpicBoon: true,
        allowedStats: ["int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30.",
            "Free Casting: Whenever you cast a spell with a level 1-4 spell slot, roll 1d4. If the number you roll is the same as the slot's level, the slot isn't expended."
        ]
    },
    {
        id: "boon-of-the-night-spirit",
        name: "Boon of the Night Spirit",
        description: "While within Dim Light or Darkness, you can become Invisible as a Bonus Action and resist damage.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Merge with Shadows: While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action.",
            "Shadowy Form: While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant."
        ]
    },
    {
        id: "boon-of-truesight",
        modifiers: [{ target: "vitals.truesight", type: "set", value: 60, description: "Truesight 60 ft." }],
        name: "Boon of Truesight",
        description: "You gain Truesight with a range of 60 feet.",
        category: "epic-boon",
        prerequisite: "Level 19+",
        isEpicBoon: true,
        allowedStats: ["str", "dex", "con", "int", "wis", "cha"],
        benefits: [
            "Ability Score Increase: Increase one ability score of your choice by 1, to a maximum of 30.",
            "Truesight: You have Truesight with a range of 60 feet."
        ]
    },

    // --- Legacy / Backwards Compatibility Aliases ---
    {
        id: "alert-general",
        name: "Alert",
        description: "Always on the lookout for danger, gaining swift reflexes and awareness.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["dex", "int", "wis"],
        benefits: [
            "Add Proficiency Bonus to Initiative rolls.",
            "Swap Initiative with a willing ally in combat."
        ]
    },
    {
        id: "speedster",
        name: "Speedster (Mobile)",
        description: "You are exceptionally speedy and agile in combat.",
        category: "general",
        prerequisite: "Level 4+, Dexterity or Constitution 13+",
        allowedStats: ["dex", "con"],
        benefits: [
            "Your speed increases by 10 feet.",
            "When you take the Dash action, difficult terrain doesn't cost extra movement.",
            "Opportunity Attacks against you have Disadvantage."
        ]
    },
    {
        id: "tough-general",
        name: "Tough",
        description: "Your hit point maximum increases drastically.",
        category: "general",
        prerequisite: "Level 4+",
        allowedStats: ["con"],
        benefits: [
            "Your Hit Point maximum increases by twice your character level, and +2 each level thereafter."
        ]
    },
    {
        id: "epic-boon-combat-prowess",
        name: "Epic Boon of Combat Prowess",
        description: "Your combat prowess is legendary. Once per turn, when you miss with an attack, you can hit instead.",
        category: "epic-boon",
        prerequisite: "Level 19+",
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
        category: "epic-boon",
        prerequisite: "Level 19+",
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
        category: "epic-boon",
        prerequisite: "Level 19+",
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
        category: "epic-boon",
        prerequisite: "Level 19+",
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
        category: "epic-boon",
        prerequisite: "Level 19+, Spellcasting Feature",
        allowedStats: ["int", "wis", "cha"],
        isEpicBoon: true,
        benefits: [
            "Whenever you cast a spell of level 1 through 4 using a spell slot, roll a d4. If matching the slot level, the slot isn't expended."
        ]
    }
];
