import { resolveClassResources, resolveClassScaleValues } from "../../../rules/dnd5e_2024/classResources";
import { activeSpeciesTraits, detectLineage, resolveSpeciesResources, speciesScaleValue, traitBaseName } from "../../../rules/dnd5e_2024/speciesRules";
import { AbilityName, ClassDefinition, ProgressionLevel } from "../../../rules/dnd5e_2024/types";
import { findFeatRule, findSpeciesRule } from "../../../services/classRules";
import { CharacterData, DEFAULT_DND55_CONDITIONS } from "../characterData";
import { resolveRuleClass } from "../classChoiceDecisions";

const EXACT_CONDITION_NAMES: string[] = DEFAULT_DND55_CONDITIONS.map(c => c.name);
const CONDITION_WORD_REGEX = new RegExp(`\\b(${EXACT_CONDITION_NAMES.join("|")})\\b`, "g");

const DND_BEYOND_BR_2024_BASE = "https://www.dndbeyond.com/sources/dnd/br-2024";

const RULE_LINK_MAP: Record<string, string> = {
    // Playing the Game
    "d20 test": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#D20Tests`,
    "d20 tests": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#D20Tests`,
    "ability check": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#AbilityChecks`,
    "ability checks": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#AbilityChecks`,
    "saving throw": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#SavingThrows`,
    "saving throws": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#SavingThrows`,
    "attack roll": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#AttackRolls`,
    "attack rolls": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#AttackRolls`,
    "advantage": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#AdvantageandDisadvantage`,
    "disadvantage": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#AdvantageandDisadvantage`,
    "proficiency": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Proficiency`,
    "proficiency bonus": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Proficiency`,
    "skill": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "skills": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "heroic inspiration": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#HeroicInspiration`,
    // Combat & Damage
    "combat": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Combat`,
    "initiative": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Combat`,
    "surprise": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Combat`,
    "movement": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#MovementandPosition`,
    "difficult terrain": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#MovementandPosition`,
    "making an attack": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#MakinganAttack`,
    "unseen attackers and targets": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#MakinganAttack`,
    "ranged attacks": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#RangedAttacks`,
    "melee attacks": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#MeleeAttacks`,
    "opportunity attack": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#OpportunityAttacks`,
    "opportunity attacks": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#OpportunityAttacks`,
    "two-weapon fighting": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#TwoWeaponFighting`,
    "mounted combat": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#MountedCombat`,
    "underwater combat": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#UnderwaterCombat`,
    "cover": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Cover`,
    "half cover": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Cover`,
    "three-quarters cover": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Cover`,
    "total cover": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Cover`,
    "damage and healing": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#DamageandHealing`,
    "hit points": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#HitPoints`,
    "damage rolls": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#DamageRolls`,
    "critical hit": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#CriticalHits`,
    "critical hits": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#CriticalHits`,
    "damage types": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#DamageTypes`,
    "resistance": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#ResistanceandVulnerability`,
    "vulnerability": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#ResistanceandVulnerability`,
    "immunity": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Immunity`,
    "healing": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Healing`,
    "dropping to 0 hit points": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Droppingto0HitPoints`,
    "death saving throw": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#DeathSavingThrows`,
    "death saving throws": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#DeathSavingThrows`,
    "temporary hit points": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#TemporaryHitPoints`,
    // Spells
    "spellcasting": `${DND_BEYOND_BR_2024_BASE}/spells`,
    "casting a spell": `${DND_BEYOND_BR_2024_BASE}/spells#CastingSpells`,
    "casting time": `${DND_BEYOND_BR_2024_BASE}/spells#CastingTime`,
    "range": `${DND_BEYOND_BR_2024_BASE}/spells#Range`,
    "components": `${DND_BEYOND_BR_2024_BASE}/spells#Components`,
    "duration": `${DND_BEYOND_BR_2024_BASE}/spells#Duration`,
    "areas of effect": `${DND_BEYOND_BR_2024_BASE}/spells#AreasofEffect`,
    // Equipment
    "weapons": `${DND_BEYOND_BR_2024_BASE}/equipment#Weapons`,
    "armor": `${DND_BEYOND_BR_2024_BASE}/equipment#Armor`,
    "weapon mastery": `${DND_BEYOND_BR_2024_BASE}/equipment#MasteryProperties`,
    "mastery properties": `${DND_BEYOND_BR_2024_BASE}/equipment#MasteryProperties`,
    // Standard 2024 Actions
    "attack": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#AttackAction`,
    "attack action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#AttackAction`,
    "dash": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DashAction`,
    "dash action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DashAction`,
    "disengage": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DisengageAction`,
    "disengage action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DisengageAction`,
    "dodge": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DodgeAction`,
    "dodge action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DodgeAction`,
    "help": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#HelpAction`,
    "help action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#HelpAction`,
    "hide": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#HideAction`,
    "hide action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#HideAction`,
    "influence": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#InfluenceAction`,
    "influence action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#InfluenceAction`,
    "magic": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#MagicAction`,
    "magic action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#MagicAction`,
    "ready": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ReadyAction`,
    "ready action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ReadyAction`,
    "search": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#SearchAction`,
    "search action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#SearchAction`,
    "study": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#StudyAction`,
    "study action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#StudyAction`,
    "utilize": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UtilizeAction`,
    "utilize action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UtilizeAction`,
    // Additional Glossary Rules, Rests, Senses & Skills
    "shape-shifting": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ShapeShifting`,
    "shape-shift": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ShapeShifting`,
    "shapeshifting": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ShapeShifting`,
    "short rest": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ShortRest`,
    "long rest": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#LongRest`,
    "concentration": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Concentration`,
    "unarmed strike": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UnarmedStrike`,
    "bonus action": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#BonusAction`,
    "reaction": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Reaction`,
    "ritual": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Ritual`,
    "darkvision": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Darkvision`,
    "blindsight": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Blindsight`,
    "tremorsense": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Tremorsense`,
    "truesight": `${DND_BEYOND_BR_2024_BASE}/rules-glossary#Truesight`,
    // Skills
    "acrobatics": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "animal handling": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "arcana": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "athletics": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "deception": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "history": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "insight": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "intimidation": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "investigation": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "medicine": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "nature": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "perception": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "performance": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "persuasion": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "religion": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "sleight of hand": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "stealth": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`,
    "survival": `${DND_BEYOND_BR_2024_BASE}/playing-the-game#Skills`
};

export interface StandardActionDefinition {
    name: string;
    type: string;
    rangeOrReach: string;
    hitOrDc: string;
    damageOrEffect: string;
    description: string;
    url: string;
}

export const DEFAULT_DND55_ACTIONS: StandardActionDefinition[] = [
    {
        name: "Attack",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Weapon Reach or Range",
        hitOrDc: "Attack Roll vs. AC",
        damageOrEffect: "Weapon or Unarmed Strike",
        description: `<p>When you take the <strong>Attack</strong> action, you can make one attack roll with a weapon or an Unarmed Strike.</p><p><strong>Equipping and Unequipping Weapons.</strong> You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack.</p><p><strong>Moving between Attacks.</strong> If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#AttackAction`
    },
    {
        name: "Dash",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Self",
        hitOrDc: "None",
        damageOrEffect: "+Speed movement this turn",
        description: `<p>When you take the <strong>Dash</strong> action, you gain extra movement for the current turn. The increase equals your Speed after applying any modifiers. With a Speed of 30 feet, for example, you can move up to 60 feet on your turn if you Dash. If your Speed of 30 feet is reduced to 15 feet, you can move up to 30 feet this turn if you Dash.</p><p>If you have a special speed, such as a Fly Speed or Swim Speed, you can use that speed instead of your Speed when you take this action. You choose which speed to use each time you take it.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DashAction`
    },
    {
        name: "Disengage",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Self",
        hitOrDc: "None",
        damageOrEffect: "No Opportunity Attacks",
        description: `<p>If you take the <strong>Disengage</strong> action, your movement doesn't provoke Opportunity Attacks for the rest of the current turn.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DisengageAction`
    },
    {
        name: "Dodge",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Self",
        hitOrDc: "None",
        damageOrEffect: "Disadvantage on attacks vs. you; Advantage on DEX saves",
        description: `<p>If you take the <strong>Dodge</strong> action, you gain the following benefits until the start of your next turn: any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage.</p><p>You lose these benefits if you have the Incapacitated condition or if your Speed is 0.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#DodgeAction`
    },
    {
        name: "Help",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "5 ft. (or Skill Range)",
        hitOrDc: "None",
        damageOrEffect: "Grant Advantage to an ally",
        description: `<p>When you take the <strong>Help</strong> action, you do one of the following:</p><p><strong>Assist an Ability Check.</strong> Choose one of your skill or tool proficiencies and one ally who is near enough for you to assist verbally or physically when they make an ability check. That ally has Advantage on the next ability check they make with the chosen skill or tool. This benefit expires if the ally doesn't use it before the start of your next turn.</p><p><strong>Assist an Attack Roll.</strong> You momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#HelpAction`
    },
    {
        name: "Hide",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Self (Heavily Obscured / Cover)",
        hitOrDc: "DC 15 Dexterity (Stealth)",
        damageOrEffect: "Gain Invisible condition while hidden",
        description: `<p>With the <strong>Hide</strong> action, you try to conceal yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you're Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy's line of sight; if you can see a creature, you can discern whether it can see you.</p><p>On a successful check, you have the Invisible condition. Make note of your check's total, which is the DC for a creature to find you with a Wisdom (Perception) check.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#HideAction`
    },
    {
        name: "Influence",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Social Interaction",
        hitOrDc: "DC 15 or Monster's INT/WIS",
        damageOrEffect: "Alter a creature's willingness",
        description: `<p>With the <strong>Influence</strong> action, you urge a monster to do something. Describe or roleplay how you're communicating with the monster. Are you trying to deceive, intimidate, amuse, or gently persuade? The DM then determines whether the monster feels willing, unwilling, or hesitant due to your interaction.</p><p>If the monster is hesitant, you make a Charisma check (Deception, Intimidation, Performance, or Persuasion) or Wisdom (Animal Handling) check; the default DC equals 15 or the monster's Intelligence score, whichever is higher.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#InfluenceAction`
    },
    {
        name: "Magic",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Varies by Spell / Feature",
        hitOrDc: "Spell Attack / Save DC",
        damageOrEffect: "Cast a spell or use magical feature",
        description: `<p>When you take the <strong>Magic</strong> action, you cast a spell that has a casting time of an action or use a feature or magic item that requires a Magic action to be activated.</p><p>If you cast a spell that has a casting time of 1 minute or longer, you must take the Magic action on each turn of that casting, and you must maintain Concentration while you do so.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#MagicAction`
    },
    {
        name: "Ready",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Self (Trigger-based)",
        hitOrDc: "Reaction on Trigger",
        damageOrEffect: "Prepare an Action or Movement",
        description: `<p>You take the <strong>Ready</strong> action to wait for a particular circumstance before you act. First, you decide what perceivable circumstance will trigger your Reaction. Then, you choose the action you will take in response to that trigger, or you choose to move up to your Speed in response to it.</p><p>When the trigger occurs, you can either take your Reaction right after the trigger finishes or ignore the trigger. When you Ready a spell, you cast it as normal (expending a spell slot) and hold its energy with Concentration until the trigger occurs.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#ReadyAction`
    },
    {
        name: "Search",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Sensory Range",
        hitOrDc: "Wisdom Check",
        damageOrEffect: "Discern something not obvious",
        description: `<p>When you take the <strong>Search</strong> action, you make a Wisdom check to discern something that isn't obvious. Check with the DM to determine which skill applies: Insight, Medicine, Perception, or Survival.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#SearchAction`
    },
    {
        name: "Study",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Observation / Memory",
        hitOrDc: "Intelligence Check",
        damageOrEffect: "Recall lore or analyze a clue",
        description: `<p>When you take the <strong>Study</strong> action, you make an Intelligence check to study your memory, a book, a clue, or another source of knowledge and call to mind an important piece of information about it.</p><p>Skills applicable to Study include Arcana, History, Investigation, Nature, and Religion.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#StudyAction`
    },
    {
        name: "Utilize",
        type: "Action • D&D 5.5 (2024 Rules)",
        rangeOrReach: "5 ft. / Object in Reach",
        hitOrDc: "Varies by Object",
        damageOrEffect: "Use a nonmagical object",
        description: `<p>You normally interact with an object while doing something else, such as when you draw a sword as part of the Attack action. When an object requires an action for its use, you take the <strong>Utilize</strong> action.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UtilizeAction`
    },
    {
        name: "Opportunity Attack",
        type: "Reaction • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Melee Reach",
        hitOrDc: "Melee Attack vs. AC",
        damageOrEffect: "One melee attack",
        description: `<p>You can make an <strong>Opportunity Attack</strong> when a creature that you can see leaves your reach using its action, its Bonus Action, its Reaction, or one of its speeds. To make the Opportunity Attack, take a Reaction to make one melee attack with a weapon or an Unarmed Strike against the provoking creature. The attack occurs right before the creature leaves your reach.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/playing-the-game#OpportunityAttacks`
    },
    {
        name: "Grapple",
        type: "Unarmed Strike Option • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Unarmed Reach (5 ft.)",
        hitOrDc: "STR/DEX Save (DC 8 + STR + PB)",
        damageOrEffect: "Target has Grappled condition",
        description: `<p>As part of an <strong>Unarmed Strike</strong>, you can use the <strong>Grapple</strong> option. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or it has the Grappled condition. The DC for the saving throw and any escape attempts equals 8 plus your Strength modifier and Proficiency Bonus. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UnarmedStrike`
    },
    {
        name: "Shove",
        type: "Unarmed Strike Option • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Unarmed Reach (5 ft.)",
        hitOrDc: "STR/DEX Save (DC 8 + STR + PB)",
        damageOrEffect: "Push 5 ft. or knock Prone",
        description: `<p>As part of an <strong>Unarmed Strike</strong>, you can use the <strong>Shove</strong> option. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. The DC for the saving throw equals 8 plus your Strength modifier and Proficiency Bonus. This shove is possible only if the target is no more than one size larger than you.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UnarmedStrike`
    },
    {
        name: "Unarmed Strike",
        type: "Melee Attack • D&D 5.5 (2024 Rules)",
        rangeOrReach: "Reach 5 ft.",
        hitOrDc: "Attack Roll or STR/DEX Save",
        damageOrEffect: "Damage (1 + STR), Grapple, or Shove",
        description: `<p>Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an <strong>Unarmed Strike</strong>—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.</p><p>Whenever you use your Unarmed Strike, choose one of the following options:</p><p><strong><em>Damage.</em></strong> You make an attack roll against the target. On a hit, the target takes Bludgeoning damage equal to 1 plus your Strength modifier.</p><p><strong><em>Grapple.</em></strong> The target must succeed on a Strength or Dexterity saving throw (it chooses which), or it has the Grappled condition. The DC for the saving throw and any escape attempts equals 8 plus your Strength modifier and Proficiency Bonus. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.</p><p><strong><em>Shove.</em></strong> The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. This shove is possible only if the target is no more than one size larger than you.</p>`,
        url: `${DND_BEYOND_BR_2024_BASE}/rules-glossary#UnarmedStrike`
    }
];

function normalizeActionQuery(nameRaw: string): { primary: string; singular: string } {
    let raw = decodeURIComponent(nameRaw || "")
        .replace(/<[^>]*>/g, "")
        .trim();
    if (raw.includes(";")) {
        raw = raw.split(";")[0].trim();
    }
    const cleaned = raw
        .replace(/\bactions?\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    const singular = cleaned.endsWith("s") ? cleaned.slice(0, -1).trim() : cleaned;
    return { primary: cleaned, singular };
}

export function findStandardActionDefinition(nameRaw: string): StandardActionDefinition | undefined {
    const { primary, singular } = normalizeActionQuery(nameRaw);
    if (!primary && !singular) return undefined;

    // 1. Exact match (primary or singular or with "action")
    const exact = DEFAULT_DND55_ACTIONS.find(a => {
        const aLower = a.name.toLowerCase();
        return (
            aLower === primary ||
            aLower === singular ||
            `${aLower} action` === primary ||
            `${aLower} action` === singular ||
            `${aLower} actions` === primary ||
            `${aLower} actions` === singular
        );
    });
    if (exact) return exact;

    // 2. Prioritize longer action names first to avoid substring false-positives
    // (e.g. "Opportunity Attack" [len 18] must match before "Attack" [len 6])
    const sorted = [...DEFAULT_DND55_ACTIONS].sort((a, b) => b.name.length - a.name.length);

    // 2a. Word boundary match
    const tokenMatch = sorted.find(a => {
        const aLower = a.name.toLowerCase();
        const aSingular = aLower.endsWith("s") ? aLower.slice(0, -1) : aLower;
        const escapedA = aLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedSingular = aSingular.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b${escapedA}\\b`, "i");
        const regexSingular = new RegExp(`\\b${escapedSingular}\\b`, "i");
        return regex.test(primary) || regexSingular.test(primary) || regex.test(singular);
    });
    if (tokenMatch) return tokenMatch;

    // 2b. Substring match fallback (longer first!)
    return sorted.find(a => {
        const aLower = a.name.toLowerCase();
        return primary.includes(aLower) || singular.includes(aLower) || aLower.includes(primary) || aLower.includes(singular);
    });
}

export function resolveDndBeyondActionUrl(actionNameRaw: string): string {
    const std = findStandardActionDefinition(actionNameRaw);
    if (std) return std.url;
    const { primary, singular } = normalizeActionQuery(actionNameRaw);
    if (RULE_LINK_MAP[primary]) return RULE_LINK_MAP[primary];
    if (RULE_LINK_MAP[singular]) return RULE_LINK_MAP[singular];
    if (RULE_LINK_MAP[`${primary} action`]) return RULE_LINK_MAP[`${primary} action`];
    const cleaned = (actionNameRaw || "").replace(/<[^>]*>/g, "").split(";")[0].trim();
    const pascalAnchor = cleaned
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    const suffix = /action$/i.test(pascalAnchor) ? "" : "Action";
    return `${DND_BEYOND_BR_2024_BASE}/rules-glossary#${(pascalAnchor || "Attack") + suffix}`;
}

export interface TemplatePlaceholderContext {
    character?: CharacterData | null;
    entityName?: string;
    sourceName?: string;
    scaleValue?: string;
    limitedUse?: string;
}

export function resolveDndBeyondRuleUrl(ruleTextRaw: string): string {
    const cleaned = (ruleTextRaw || "").replace(/<[^>]*>/g, "").trim();
    const lower = cleaned.toLowerCase().replace(/\s+/g, " ");
    if (RULE_LINK_MAP[lower]) {
        return RULE_LINK_MAP[lower];
    }

    // PascalCase anchor in rules-glossary (D&D Beyond 2024 Basic Rules convention)
    const pascalAnchor = cleaned
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    return `${DND_BEYOND_BR_2024_BASE}/rules-glossary#${pascalAnchor || "RulesGlossary"}`;
}

export function resolveDndBeyondFeatUrl(featTextRaw: string): string {
    const cleaned = (featTextRaw || "").replace(/<[^>]*>/g, "").trim();
    const pascalAnchor = cleaned
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    return `${DND_BEYOND_BR_2024_BASE}/feats#${pascalAnchor || "Feats"}`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const ABILITY_TOKEN_TO_ABBR: Record<string, string> = {
    str: "STR",
    strength: "STR",
    dex: "DEX",
    dexterity: "DEX",
    con: "CON",
    constitution: "CON",
    int: "INT",
    intelligence: "INT",
    wis: "WIS",
    wisdom: "WIS",
    cha: "CHA",
    charisma: "CHA"
};

function normalizeAbilityAbbr(token: string): string {
    const clean = String(token || "").trim().toLowerCase();
    return ABILITY_TOKEN_TO_ABBR[clean] || clean.toUpperCase();
}

function getAbilityMod(character: CharacterData | null | undefined, abbr: string): number {
    if (!character || !Array.isArray(character.abilities)) return 0;
    const targetAbbr = normalizeAbilityAbbr(abbr);
    const found = character.abilities.find(
        a => a.abbr.toUpperCase() === targetAbbr || a.name.toLowerCase() === String(abbr || "").trim().toLowerCase()
    );
    return found ? Number(found.modifier) || 0 : 0;
}

function getAbilityScore(character: CharacterData | null | undefined, abbr: string): number {
    if (!character || !Array.isArray(character.abilities)) return 10;
    const targetAbbr = normalizeAbilityAbbr(abbr);
    const found = character.abilities.find(
        a => a.abbr.toUpperCase() === targetAbbr || a.name.toLowerCase() === String(abbr || "").trim().toLowerCase()
    );
    return found ? Number(found.score) || 10 : 10;
}

const normName = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Whether an entity name ("Bardic Inspiration", "Maneuvers: Trip Attack", "Rage") refers to a class-data name. */
function entityMatchesName(entity: string, name: string): boolean {
    const e = normName(entity);
    const prefix = normName(String(entity || "").split(":")[0]);
    const n = normName(name);
    if (!e || !n) return false;
    return e === n || prefix === n || e.startsWith(`${n} `) || (e.length >= 4 && n.startsWith(`${e} `));
}

/** The character's species and lineage in the species rules. */
function characterSpecies(character: CharacterData | null | undefined) {
    const species = findSpeciesRule(String(character?.species || character?.race || ""));
    return { species, lineage: detectLineage(species, { texts: [character?.lineage || "", character?.race || ""] }) };
}

/** The character's classes with their class rules (rule_classes, via /get-rules). */
function characterRuleClasses(character: CharacterData | null | undefined) {
    return (character?.classes || []).map(c => ({ ...resolveRuleClass(c.name, c.subclass), level: Number(c.level) || 1, name: c.name }));
}

const ABILITY_ABBR: Record<AbilityName, string> = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };

/** Every name a class's unlocked data uses: features, subclass features, resources and what else they're called, badges. */
function classDataNames(def: ClassDefinition | undefined, subclass: any, level: number): string[] {
    if (!def) return [];
    const levels = [...(def.progression || []), ...((subclass?.progression || []) as ProgressionLevel[])].filter(pl => pl.level <= level);
    return [
        ...(def.features || []).filter(f => (f.level || 1) <= level).map(f => f.name),
        ...((subclass?.features || []) as Array<{ name: string; level?: number }>).filter(f => (f.level || 3) <= level).map(f => f.name),
        ...levels.flatMap(pl => (pl.features || []).map(f => f.name)),
        ...levels.flatMap(pl => (pl.resourceUpdates || []).flatMap(r => [r.name, ...(r.aliases || [])])),
        ...levels.flatMap(pl => (pl.badges || []).map(b => b.replace(/\s+[+-]?\d.*$/, "")))
    ].filter(Boolean);
}

function getClassLevel(character: CharacterData | null | undefined, className?: string, entityName?: string): number {
    if (!character || !Array.isArray(character.classes) || character.classes.length === 0) {
        return Number(character?.level) || 1;
    }

    const matchClassByString = (candidate: string) => {
        const lower = candidate.toLowerCase();
        return character.classes.find(
            c =>
                c.name.toLowerCase() === lower ||
                lower.includes(c.name.toLowerCase()) ||
                (c.subclass && lower.includes(c.subclass.toLowerCase()))
        );
    };

    if (className) {
        const found = matchClassByString(className);
        if (found) return Number(found.level) || 1;
    }

    if (entityName) {
        const entityLower = entityName.toLowerCase().trim();
        const entityPrefix = entityLower.split(":")[0].trim();

        // 1. Check if character has a matching feature with a known source class/subclass
        if (Array.isArray(character.features)) {
            const matchingFeature = character.features.find(f => {
                const fLower = String(f.name || "").toLowerCase().trim();
                return (
                    fLower === entityLower ||
                    fLower === entityPrefix ||
                    entityLower.startsWith(`${fLower}:`) ||
                    fLower.startsWith(`${entityPrefix}:`)
                );
            });
            if (matchingFeature?.source) {
                const foundFromFeature = matchClassByString(matchingFeature.source);
                if (foundFromFeature) return Number(foundFromFeature.level) || 1;
            }
        }

        // 2. The class whose rules have a feature, resource, or badge by that name (only when exactly one does)
        const owners = characterRuleClasses(character).filter(rc => classDataNames(rc.def, rc.subclass, rc.level).some(n => entityMatchesName(entityName, n)));
        if (owners.length === 1) return owners[0].level;
    }

    return Number(character.classes[0]?.level) || Number(character.level) || 1;
}

function inferScaleValueFromContext(ctx?: TemplatePlaceholderContext, rawText?: string): string | undefined {
    if (ctx?.scaleValue) return ctx.scaleValue;
    const char = ctx?.character;
    const nameLower = String(ctx?.entityName || "").toLowerCase();
    const cLvl = getClassLevel(char, ctx?.sourceName, ctx?.entityName);
    const totalLvl = Number(char?.level) || cLvl || 1;
    const profBonus = Number(char?.vitals?.proficiencyBonus) || Math.floor((totalLvl - 1) / 4) + 2;

    // Magical Cunning or Pact Magic scale value: maximum Pact Magic spell slots
    if (
        nameLower.includes("magical cunning") ||
        (rawText && (rawText.toLowerCase().includes("pact magic spell slot") || rawText.toLowerCase().includes("pact spell slot")))
    ) {
        const warlockClass = char?.classes?.find(c => c.name.toLowerCase() === "warlock");
        const wLvl = warlockClass ? Number(warlockClass.level) || 0 : cLvl;
        const pactSlots = Number(char?.spellSlots?.pact?.total) > 0
            ? Number(char?.spellSlots?.pact?.total)
            : (wLvl >= 17 ? 4 : wLvl >= 11 ? 3 : wLvl >= 2 ? 2 : 2);
        return String(pactSlots);
    }

    // Class data: resource dice, level badges, feature scale values and modifiers (class rules)
    const abilityMod = (ab: AbilityName) => getAbilityMod(char, ABILITY_ABBR[ab]);
    const scale = resolveClassScaleValues(characterRuleClasses(char), abilityMod, profBonus)
        .find(v => v.names.some(n => entityMatchesName(nameLower, n)));
    if (scale) return scale.value;

    // Species trait scale values (e.g. Breath Weapon dice by character level)
    const { species, lineage } = characterSpecies(char);
    for (const t of activeSpeciesTraits(species, lineage, totalLvl)) {
        const value = speciesScaleValue(t, totalLvl);
        if (value && [traitBaseName(t.name), ...(t.aliases || [])].some(n => entityMatchesName(nameLower, n))) return value;
    }

    return `+${profBonus}`;
}

function inferLimitedUseFromContext(ctx?: TemplatePlaceholderContext): string {
    const char = ctx?.character;
    const totalLvl = Number(char?.level) || 1;
    const profBonus = Number(char?.vitals?.proficiencyBonus) || Math.floor((totalLvl - 1) / 4) + 2;

    if (ctx?.limitedUse) {
        if (ctx.limitedUse === "proficiency") {
            return String(profBonus);
        }
        if (ctx.limitedUse.startsWith("stat:")) {
            const parts = ctx.limitedUse.split(":");
            const statId = Number(parts[1]);
            const flat = Number(parts[2]) || 0;
            const abbrMap: Record<number, string> = { 1: "STR", 2: "DEX", 3: "CON", 4: "INT", 5: "WIS", 6: "CHA" };
            const mod = getAbilityMod(char, abbrMap[statId] || "CHA");
            return String(Math.max(1, mod + flat));
        }
        return ctx.limitedUse;
    }

    const nameLower = String(ctx?.entityName || "").toLowerCase();
    const sourceLower = String(ctx?.sourceName || "").toLowerCase();

    // Class and subclass resources (class rules), by name or a name that uses them
    const ruleClasses = characterRuleClasses(char);
    const resource = resolveClassResources(ruleClasses, ab => getAbilityMod(char, ABILITY_ABBR[ab]), profBonus)
        .find(r => [r.name, ...(r.aliases || [])].some(n => entityMatchesName(nameLower, n)));
    if (resource) return String(resource.total);
    // Species and lineage limited uses (species data)
    const sp = characterSpecies(char);
    const speciesResource = resolveSpeciesResources(sp.species, sp.lineage, totalLvl, profBonus, ab => getAbilityMod(char, ab))
        .find(r => [r.name, ...r.aliases].some(n => entityMatchesName(nameLower, n)));
    if (speciesResource) return String(speciesResource.total);
    // Feats (feat data): a tracked resource (e.g. Lucky) or a use count (e.g. Fey Touched's free casting), by the
    // entity's name or its source's (a spell a feat grants)
    const feat = findFeatRule(String(ctx?.entityName || "")) || findFeatRule(String(ctx?.entityName || "").split(":")[0]) ||
        findFeatRule(String(ctx?.sourceName || ""));
    if (feat?.resource) {
        const total = String(feat.resource.total).replace(/\{\{pb\}\}/gi, String(profBonus)).replace(/\{\{level\}\}/gi, String(totalLvl));
        if (Number(total) > 0) return total;
    }
    if (feat?.limitedUse !== undefined) {
        return String(feat.limitedUse).replace(/\{\{pb\}\}/gi, String(profBonus));
    }
    // A feature of a spellcasting class: its spellcasting ability modifier (minimum 1)
    const sourceClass = ruleClasses.find(rc =>
        rc.def && (sourceLower.includes(rc.name.toLowerCase()) || (!!rc.subclass && sourceLower.includes(rc.subclass.name.toLowerCase())))
    );
    const castingAbility = sourceClass?.def?.spellcasting?.ability || sourceClass?.subclass?.spellcastingOverride?.ability;
    if (castingAbility) {
        return String(Math.max(1, getAbilityMod(char, ABILITY_ABBR[castingAbility as AbilityName])));
    }

    return String(profBonus);
}

/**
 * Safe recursive-descent arithmetic evaluator for numeric expressions containing
 * `+`, `-`, `*`, `/`, unary `+`/`-`, and parentheses `(...)`.
 */
function evaluateArithmeticExpression(expr: string): number | null {
    const src = expr.replace(/\s+/g, "");
    if (!src || !/^[\d.+\-*/()]+$/.test(src)) return null;

    let pos = 0;

    function parseExpression(): number | null {
        let left = parseTerm();
        if (left === null) return null;
        while (pos < src.length && (src[pos] === "+" || src[pos] === "-")) {
            const op = src[pos++];
            const right = parseTerm();
            if (right === null) return null;
            left = op === "+" ? left + right : left - right;
        }
        return left;
    }

    function parseTerm(): number | null {
        let left = parseFactor();
        if (left === null) return null;
        while (pos < src.length && (src[pos] === "*" || src[pos] === "/")) {
            const op = src[pos++];
            const right = parseFactor();
            if (right === null) return null;
            if (op === "/") {
                if (right === 0) return null;
                left = left / right;
            } else {
                left = left * right;
            }
        }
        return left;
    }

    function parseFactor(): number | null {
        if (pos >= src.length) return null;
        if (src[pos] === "+") {
            pos++;
            return parseFactor();
        }
        if (src[pos] === "-") {
            pos++;
            const val = parseFactor();
            return val === null ? null : -val;
        }
        if (src[pos] === "(") {
            pos++;
            const val = parseExpression();
            if (val === null || src[pos] !== ")") return null;
            pos++;
            return val;
        }
        const start = pos;
        while (pos < src.length && (/[\d.]/.test(src[pos]))) {
            pos++;
        }
        if (start === pos) return null;
        const num = Number(src.slice(start, pos));
        return Number.isFinite(num) ? num : null;
    }

    const result = parseExpression();
    if (result === null || pos !== src.length || !Number.isFinite(result)) {
        return null;
    }
    return result;
}

/**
 * Resolves D&D Beyond snippet/description Mustache-style placeholders such as:
 * `{{scalevalue}}`, `{{limiteduse}}`, `{{proficiency}}`, `{{savedc:cha}}`,
 * `{{modifier:cha}}`, `{{classlevel}}`, `{{characterlevel}}`, `{{spellattack:cha}}`,
 * `{{(classlevel/2)@rounddown}}`, `{{((classlevel-1)/7)@rounddown,min:1}}`,
 * `{{(13+modifier:wis)#unsigned}}`, `{{modifier:str+proficiency}}`, etc.
 */
export function resolveDescriptionPlaceholders(rawText: string, ctx?: TemplatePlaceholderContext): string {
    if (!rawText || !rawText.includes("{{")) return rawText;

    const char = ctx?.character;
    const totalLvl = Number(char?.level) || 1;
    const profBonus = Number(char?.vitals?.proficiencyBonus) || Math.floor((totalLvl - 1) / 4) + 2;
    const cLvl = getClassLevel(char, ctx?.sourceName, ctx?.entityName);

    const warlockClass = char?.classes?.find(c => c.name.toLowerCase() === "warlock");
    const isWarlockContext =
        ctx?.sourceName?.toLowerCase() === "warlock" ||
        String(ctx?.entityName || "").toLowerCase().includes("magical cunning") ||
        String(ctx?.entityName || "").toLowerCase().includes("pact");
    const warlockLevel = warlockClass
        ? Number(warlockClass.level) || 0
        : (isWarlockContext ? getClassLevel(char, "Warlock", ctx?.entityName) : 0);

    const pactSlots = Number(char?.spellSlots?.pact?.total) > 0
        ? Number(char?.spellSlots?.pact?.total)
        : (warlockLevel >= 17 ? 4 : warlockLevel >= 11 ? 3 : warlockLevel >= 2 ? 2 : warlockLevel >= 1 ? 1 : 0);

    const pactSlotLvl = Number(char?.spellSlots?.pact?.level) > 0
        ? Number(char?.spellSlots?.pact?.level)
        : (warlockLevel >= 9 ? 5 : warlockLevel >= 7 ? 4 : warlockLevel >= 5 ? 3 : warlockLevel >= 3 ? 2 : warlockLevel >= 1 ? 1 : 0);

    const ABILITY_KEY_PATTERN =
        "(?:strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha)";

    return rawText.replace(/\{\{([^{}]+)\}\}/gi, (_fullMatch, innerRaw: string) => {
        const rawExpr = String(innerRaw || "").trim();
        if (!rawExpr) return "";

        // 1. Parse display & math flags (#signed, #unsigned, @rounddown, @roundup, @round, @min:N, ,min:N, @max:N, ,max:N)
        const wantsSigned = /#signed\b/i.test(rawExpr);
        const wantsUnsigned = /#unsigned\b/i.test(rawExpr);

        let roundMode: "down" | "up" | "nearest" | undefined;
        if (/(?:[@#,])rounddown\b/i.test(rawExpr)) {
            roundMode = "down";
        } else if (/(?:[@#,])roundup\b/i.test(rawExpr)) {
            roundMode = "up";
        } else if (/(?:[@#,])round\b/i.test(rawExpr)) {
            roundMode = "nearest";
        }

        const minMatch = rawExpr.match(/(?:@|,)min:(-?\d+(?:\.\d+)?)/i);
        const minVal = minMatch ? Number(minMatch[1]) : undefined;
        const maxMatch = rawExpr.match(/(?:@|,)max:(-?\d+(?:\.\d+)?)/i);
        const maxVal = maxMatch ? Number(maxMatch[1]) : undefined;

        // Strip flags while preserving commas used in multi-ability expressions (e.g. savedc:dex,str)
        const cleanExpr = rawExpr
            .replace(/#[a-z0-9_:-]+/gi, "")
            .replace(/@[a-z0-9_:-]+/gi, "")
            .replace(/,(?:min|max):-?\d+(?:\.\d+)?/gi, "")
            .replace(/,round(?:down|up)?\b/gi, "")
            .trim()
            .toLowerCase();

        const formatNumber = (n: number, defaultSigned = false): string => {
            let val = n;
            if (roundMode === "down") val = Math.floor(val);
            else if (roundMode === "up") val = Math.ceil(val);
            else if (roundMode === "nearest") val = Math.round(val);
            else if (!Number.isInteger(val)) val = Math.floor(val);

            if (minVal !== undefined) val = Math.max(minVal, val);
            if (maxVal !== undefined) val = Math.min(maxVal, val);
            if (Object.is(val, -0)) val = 0;

            if (wantsUnsigned) return String(Math.abs(val));
            if (wantsSigned || defaultSigned) return val >= 0 ? `+${val}` : `${val}`;
            return String(val);
        };

        // 2. Standalone {{scalevalue}} and {{limiteduse}}
        if (/^scalevalue(?::[a-z0-9_-]+)?$/i.test(cleanExpr)) {
            const sv = inferScaleValueFromContext(ctx, rawText) || `+${profBonus}`;
            const numericSv = Number(sv);
            if (Number.isFinite(numericSv) && (wantsUnsigned || wantsSigned || minVal !== undefined || maxVal !== undefined)) {
                return formatNumber(numericSv, sv.startsWith("+"));
            }
            return sv;
        }

        if (/^limiteduse(?::[a-z0-9_-]+)?$/i.test(cleanExpr)) {
            const lu = inferLimitedUseFromContext(ctx);
            const numericLu = Number(lu);
            if (Number.isFinite(numericLu) && (wantsUnsigned || wantsSigned || minVal !== undefined || maxVal !== undefined)) {
                return formatNumber(numericLu, false);
            }
            return lu;
        }

        // 3. Substitute D&D Beyond variables into cleanExpr and evaluate arithmetic
        let defaultSigned = false;

        // Detect attack roll / spell attack expressions (e.g. spellattack:cha or modifier:str+proficiency)
        const bareNoParens = cleanExpr.replace(/[()\s]+/g, "");
        if (
            cleanExpr.includes("spellattack") ||
            new RegExp(`^modifier:${ABILITY_KEY_PATTERN}(?:,${ABILITY_KEY_PATTERN})*\\+proficiency$`, "i").test(bareNoParens) ||
            new RegExp(`^proficiency\\+modifier:${ABILITY_KEY_PATTERN}(?:,${ABILITY_KEY_PATTERN})*$`, "i").test(bareNoParens)
        ) {
            defaultSigned = true;
        }

        let mathExpr = cleanExpr;

        // 3a. Substitute scalevalue and limiteduse in math expressions
        mathExpr = mathExpr
            .replace(/\bscalevalue\b/gi, () => {
                const sv = inferScaleValueFromContext(ctx, rawText) || `${profBonus}`;
                const num = parseFloat(String(sv));
                return Number.isFinite(num) ? `(${num})` : `(${profBonus})`;
            })
            .replace(/\blimiteduse\b/gi, () => {
                const lu = inferLimitedUseFromContext(ctx) || `${profBonus}`;
                const num = parseFloat(String(lu));
                return Number.isFinite(num) ? `(${num})` : `(${profBonus})`;
            });

        // 3b. savedc:stat1,stat2 or standalone savedc
        mathExpr = mathExpr.replace(
            new RegExp(`savedc:${ABILITY_KEY_PATTERN}(?:,${ABILITY_KEY_PATTERN})*`, "gi"),
            match => {
                const afterColon = match.slice("savedc:".length);
                const stats = afterColon.split(",").map(s => s.trim()).filter(Boolean);
                const bestMod = Math.max(...stats.map(st => getAbilityMod(char, st)));
                return `(${8 + profBonus + bestMod})`;
            }
        );
        mathExpr = mathExpr.replace(/\bsavedc\b/gi, () => {
            return `(${Number(char?.vitals?.spellSaveDc) || 8 + profBonus})`;
        });

        // 3b. spellattack:stat1,stat2 or standalone spellattack
        mathExpr = mathExpr.replace(
            new RegExp(`spellattack:${ABILITY_KEY_PATTERN}(?:,${ABILITY_KEY_PATTERN})*`, "gi"),
            match => {
                const afterColon = match.slice("spellattack:".length);
                const stats = afterColon.split(",").map(s => s.trim()).filter(Boolean);
                const bestMod = Math.max(...stats.map(st => getAbilityMod(char, st)));
                return `(${profBonus + bestMod})`;
            }
        );
        mathExpr = mathExpr.replace(/\bspellattack\b/gi, () => {
            return `(${Number(char?.vitals?.spellAttackBonus) || profBonus})`;
        });

        // 3c. modifier:stat1,stat2
        mathExpr = mathExpr.replace(
            new RegExp(`modifier:${ABILITY_KEY_PATTERN}(?:,${ABILITY_KEY_PATTERN})*`, "gi"),
            match => {
                const afterColon = match.slice("modifier:".length);
                const stats = afterColon.split(",").map(s => s.trim()).filter(Boolean);
                const bestMod = Math.max(...stats.map(st => getAbilityMod(char, st)));
                return `(${bestMod})`;
            }
        );

        // 3d. score:stat1,stat2
        mathExpr = mathExpr.replace(
            new RegExp(`score:${ABILITY_KEY_PATTERN}(?:,${ABILITY_KEY_PATTERN})*`, "gi"),
            match => {
                const afterColon = match.slice("score:".length);
                const stats = afterColon.split(",").map(s => s.trim()).filter(Boolean);
                const bestScore = Math.max(...stats.map(st => getAbilityScore(char, st)));
                return `(${bestScore})`;
            }
        );

        // 3e. Scalar character tokens: classlevel, characterlevel, proficiency, maxhp, speed, passiveperception, pactslots, etc.
        mathExpr = mathExpr
            .replace(/\b(?:pact(?:_?magic)?_?(?:slot)?_?levels?|pactlevel)\b/gi, `(${pactSlotLvl})`)
            .replace(/\b(?:max_?)?pact(?:_?magic)?(?:_?slots?)?\b/gi, `(${pactSlots})`)
            .replace(/\bspellslotlevels?:pact\b/gi, `(${pactSlotLvl})`)
            .replace(/\bspellslots?:pact\b/gi, `(${pactSlots})`)
            .replace(/\bspellslots?:(?:level)?([1-9])\b/gi, (_, lvl) => {
                const slotCount = Number(char?.spellSlots?.[`level${lvl}`]?.total) || 0;
                return `(${slotCount})`;
            })
            .replace(/\bclasslevel\b/gi, `(${cLvl})`)
            .replace(/\bcharacterlevel\b/gi, `(${totalLvl})`)
            .replace(/\b(?:proficiency|pb)\b/gi, `(${profBonus})`)
            .replace(/\blevel\b/gi, `(${totalLvl})`)
            .replace(/\bmaxhp\b/gi, `(${Number(char?.vitals?.maxHp) || 1})`)
            .replace(/\b(?:walk)?speed\b/gi, `(${parseInt(String(char?.vitals?.speed || "30"), 10) || 30})`)
            .replace(/\bpassiveperception\b/gi, `(${Number(char?.vitals?.passivePerception) || 10 + getAbilityMod(char, "WIS")})`);

        const evaluated = evaluateArithmeticExpression(mathExpr);
        if (evaluated !== null) {
            return formatNumber(evaluated, defaultSigned);
        }

        return _fullMatch;
    });
}

export function parseTagTargetAndLabel(raw: string): { target: string; label: string } {
    const cleaned = (raw || "").replace(/<[^>]*>/g, "").trim();
    if (!cleaned) return { target: "", label: "" };
    if (cleaned.includes(";")) {
        const parts = cleaned.split(";").map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
            // D&D Beyond convention: [tag]lookup_key;display_text[/tag]
            return { target: parts[0], label: parts[1] };
        }
        if (parts.length === 1) {
            return { target: parts[0], label: parts[0] };
        }
    }
    return { target: cleaned, label: cleaned };
}

function renderConditionButtonHtml(conditionName: string, labelText?: string): string {
    const encodedName = encodeURIComponent(conditionName);
    const escapedLabel = escapeHtml(labelText || conditionName);
    return `<button type="button" class="inline-condition-link" data-condition-link="${encodedName}" title="Click to view ${escapedLabel} condition details"><i class="fa-solid fa-circle-exclamation"></i> ${escapedLabel}</button>`;
}

function renderSpellButtonHtml(spellName: string, labelText?: string): string {
    const encodedSpellName = encodeURIComponent(spellName);
    const escapedLabel = escapeHtml(labelText || spellName);
    return `<button type="button" class="action-spell-link inline-spell-link" data-spell-name="${encodedSpellName}" title="Click to view spell details"><i class="fa-solid fa-wand-magic-sparkles"></i> ${escapedLabel}</button>`;
}

function renderRuleLinkHtml(ruleName: string, labelText?: string): string {
    const url = resolveDndBeyondRuleUrl(ruleName);
    const escapedLabel = escapeHtml(labelText || ruleName);
    return `<a href="${url}" class="inline-rule-link" target="_blank" rel="noopener noreferrer" title="View ${escapedLabel} rule on D&amp;D Beyond"><i class="fa-solid fa-book"></i> ${escapedLabel}</a>`;
}

function renderActionLinkHtml(actionName: string, labelText?: string): string {
    const encodedName = encodeURIComponent(actionName);
    const escapedLabel = escapeHtml(labelText || actionName);
    const url = resolveDndBeyondActionUrl(actionName);
    return `<a href="${url}" class="inline-action-link" data-action-link="${encodedName}" target="_blank" rel="noopener noreferrer" title="Click to view ${escapedLabel} action details"><i class="fa-solid fa-bolt"></i> ${escapedLabel}</a>`;
}

function renderFeatLinkHtml(featName: string, labelText?: string): string {
    const encodedName = encodeURIComponent(featName);
    const escapedLabel = escapeHtml(labelText || featName);
    const url = resolveDndBeyondFeatUrl(featName);
    return `<a href="${url}" class="inline-feat-link" data-feat-link="${encodedName}" target="_blank" rel="noopener noreferrer" title="Click to view ${escapedLabel} feat details on D&amp;D Beyond"><i class="fa-solid fa-medal"></i> ${escapedLabel}</a>`;
}

export function renderItemButtonHtml(itemName: string, labelText?: string): string {
    const encodedName = encodeURIComponent(itemName);
    const escapedLabel = escapeHtml(labelText || itemName);
    return `<button type="button" class="inline-item-link" data-item-name="${encodedName}" title="Click to view ${escapedLabel} details"><i class="fa-solid fa-shield-halved"></i> ${escapedLabel}</button>`;
}

export function linkifyConditionAndSpellTags(value?: string, ctx?: TemplatePlaceholderContext): string {
    if (!value) return "";

    const replacedBlocks: string[] = [];
    const storeBlock = (htmlSnippet: string): string => {
        const token = `__INLINE_MARKUP_TOKEN_${replacedBlocks.length}__`;
        replacedBlocks.push(htmlSnippet);
        return token;
    };

    // 0. Resolve any D&D Beyond {{scalevalue}}, {{limiteduse}}, {{savedc:...}}, {{modifier:...}} placeholders first
    let working = resolveDescriptionPlaceholders(value, ctx);

    // 1. Replace explicit [condition], [spell], [item], [rules], [action], [skill], [sense], [weaponprop] tags
    //    Support D&D Beyond's [tag]target;display_label[/tag] semicolon syntax
    working = working
        .replace(/\[conditions?\]([\s\S]*?)\[\/conditions?\]/gi, (_match, rawConditionName: string) => {
            const { target, label } = parseTagTargetAndLabel(rawConditionName);
            if (!target) return "";
            return storeBlock(renderConditionButtonHtml(target, label));
        })
        .replace(/\[spells?\]([\s\S]*?)\[\/spells?\]/gi, (_match, rawSpellName: string) => {
            const { target, label } = parseTagTargetAndLabel(rawSpellName);
            if (!target) return "";
            return storeBlock(renderSpellButtonHtml(target, label));
        })
        .replace(/\[(?:items?|magicitems?|equipments?|weapons?|armors?|wondrousitems?)\]([\s\S]*?)\[\/(?:items?|magicitems?|equipments?|weapons?|armors?|wondrousitems?)\]/gi, (_match, rawItemName: string) => {
            const { target, label } = parseTagTargetAndLabel(rawItemName);
            if (!target) return "";
            const cleanTarget = target.replace(/^\d+-/, "").replace(/-/g, " ").trim();
            return storeBlock(renderItemButtonHtml(cleanTarget, label));
        })
        .replace(/\[(?:rules?|skills?|senses?|weaponprops?|weaponproperties|mastery|masteries)\]([\s\S]*?)\[\/(?:rules?|skills?|senses?|weaponprops?|weaponproperties|mastery|masteries)\]/gi, (_match, rawRuleName: string) => {
            const { target, label } = parseTagTargetAndLabel(rawRuleName);
            if (!target) return "";
            return storeBlock(renderRuleLinkHtml(target, label));
        })
        .replace(/\[actions?\]([\s\S]*?)\[\/actions?\]/gi, (_match, rawActionName: string) => {
            const { target, label } = parseTagTargetAndLabel(rawActionName);
            if (!target) return "";
            return storeBlock(renderActionLinkHtml(target, label));
        })
        .replace(/\[(?:feats?|boons?)\]([\s\S]*?)\[\/(?:feats?|boons?)\]/gi, (_match, rawFeatName: string) => {
            const { target, label } = parseTagTargetAndLabel(rawFeatName);
            if (!target) return "";
            const cleanTarget = target.replace(/^\d+-/, "").replace(/-/g, " ").trim();
            return storeBlock(renderFeatLinkHtml(cleanTarget, label));
        })
        .replace(/\[([a-z][a-z0-9_-]*)\]([\s\S]*?)\[\/\1\]/gi, (_match, _tagName: string, rawInner: string) => {
            const { label } = parseTagTargetAndLabel(rawInner);
            return label || "";
        });

    // 1.5. Intercept D&D Beyond HTML anchor tags pointing to /equipment/, /magic-items/, /weapons/, /items/, or /spells/
    working = working
        .replace(/<a\b[^>]*\bhref=["'](?:https?:\/\/(?:[a-z0-9_-]+\.)*dndbeyond\.com)?\/(?:equipment|magic-items|weapons|items)\/([^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, slug, linkText) => {
            const rawLabel = linkText.replace(/<[^>]*>/g, "").trim();
            const cleanSlug = decodeURIComponent(slug).replace(/^\d+-/, "").replace(/-/g, " ").trim();
            const rawName = rawLabel || cleanSlug;
            const itemName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            return storeBlock(renderItemButtonHtml(itemName, rawLabel || itemName));
        })
        .replace(/<a\b[^>]*\bhref=["'](?:https?:\/\/(?:[a-z0-9_-]+\.)*dndbeyond\.com)?\/spells\/([^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, slug, linkText) => {
            const rawLabel = linkText.replace(/<[^>]*>/g, "").trim();
            const cleanSlug = decodeURIComponent(slug).replace(/^\d+-/, "").replace(/-/g, " ").trim();
            const spellName = rawLabel || cleanSlug;
            return storeBlock(renderSpellButtonHtml(spellName, rawLabel || spellName));
        })
        .replace(/<a\b[^>]*\bhref=["'](?:https?:\/\/(?:[a-z0-9_-]+\.)*dndbeyond\.com)?\/feats\/([^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_match, slug, linkText) => {
            const rawLabel = linkText.replace(/<[^>]*>/g, "").trim();
            const cleanSlug = decodeURIComponent(slug).replace(/^\d+-/, "").replace(/-/g, " ").trim();
            const featName = rawLabel || cleanSlug;
            return storeBlock(renderFeatLinkHtml(featName, rawLabel || featName));
        });

    // 1.6. Intercept plain-text weapon grant mentions e.g. "can be wielded as a magic quarterstaff"
    const standardWeaponNames = [
        "quarterstaff", "dagger", "club", "mace", "spear", "greatclub", "handaxe", "javelin", "light hammer", "sickle",
        "light crossbow", "dart", "shortbow", "sling",
        "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", "lance", "longsword", "maul", "morningstar",
        "pike", "rapier", "scimitar", "shortsword", "trident", "war pick", "warhammer", "whip",
        "blowgun", "hand crossbow", "heavy crossbow", "longbow", "net"
    ];
    const plainWeaponRegex = new RegExp(
        `((?:can be wielded as|can be used as|functions as|acts as|serves as)\\s+(?:an?|the)?\\s*(?:magic\\s+)?(?:\\+[1-3]\\s+)?)\\b(${standardWeaponNames.join("|")})\\b`,
        "gi"
    );
    working = working.replace(plainWeaponRegex, (_m, prefix: string, weaponMatch: string) => {
        const canonicalName = weaponMatch.charAt(0).toUpperCase() + weaponMatch.slice(1);
        return `${prefix}${storeBlock(renderItemButtonHtml(canonicalName, weaponMatch))}`;
    });

    // 2. Replace exact case-sensitive condition names (e.g. "Charmed", "Incapacitated", "Prone")
    //    outside of HTML tags so attributes are never corrupted.
    working = working
        .split(/(<[^>]*>)/g)
        .map(segment => {
            if (segment.startsWith("<") && segment.endsWith(">")) {
                return segment;
            }
            return segment.replace(CONDITION_WORD_REGEX, matchedCondition => {
                return storeBlock(renderConditionButtonHtml(matchedCondition));
            });
        })
        .join("");

    // 3. Restore all tokenized elements
    replacedBlocks.forEach((htmlSnippet, idx) => {
        working = working.replaceAll(`__INLINE_MARKUP_TOKEN_${idx}__`, htmlSnippet);
    });

    return working;
}
