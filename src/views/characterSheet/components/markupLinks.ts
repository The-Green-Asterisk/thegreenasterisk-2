import { CharacterData, DEFAULT_DND55_CONDITIONS } from "../characterData";

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
        rangeOrReach: "5 ft.",
        hitOrDc: "Attack Roll or STR/DEX Save",
        damageOrEffect: "Damage (1 + STR), Grapple, or Shove",
        description: `<p>Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an <strong>Unarmed Strike</strong>—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.</p>`,
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

        // 2. Infer class from well-known class feature/action names
        const classKeywordMap: Array<[RegExp, string]> = [
            [/\b(?:wild shape|circle forms|primal strike|starry form|natural recovery|druidic|moonbeam|elemental fury)\b/i, "Druid"],
            [/\b(?:bardic inspiration|mantle of inspiration|mantle of majesty|unbreakable majesty|beguiling magic|cutting words|countercharm|font of inspiration)\b/i, "Bard"],
            [/\b(?:flurry of blows|patient defense|step of the wind|deflect attack|deflect attacks|deflect energy|slow fall|uncanny metabolism|martial arts|stunning strike|focus point|monk)\b/i, "Monk"],
            [/\b(?:rage|reckless attack|brutal strike|frenzy|mindless rage)\b/i, "Barbarian"],
            [/\b(?:second wind|action surge|indomitable|tactical mind|tactical shift|combat superiority)\b/i, "Fighter"],
            [/\b(?:lay on hands|divine sense|divine smite|aura of protection|sacred weapon)\b/i, "Paladin"],
            [/\b(?:sneak attack|cunning action|cunning strike|uncanny dodge|steady aim)\b/i, "Rogue"],
            [/\b(?:font of magic|metamagic|innate sorcery|sorcery point)\b/i, "Sorcerer"],
            [/\b(?:pact|eldritch|awakened mind|clairvoyant combatant|create thrall|dark one's blessing|magical cunning)\b/i, "Warlock"],
            [/\b(?:arcane recovery|portent|bladesong|sculpt spells)\b/i, "Wizard"],
            [/\b(?:channel divinity|divine intervention|turn undead|sear undead|war priest)\b/i, "Cleric"],
            [/\b(?:favored enemy|deft explorer|tireless|nature's veil|dread ambusher)\b/i, "Ranger"]
        ];
        for (const [pattern, inferredClass] of classKeywordMap) {
            if (pattern.test(entityLower)) {
                const found = matchClassByString(inferredClass);
                if (found) return Number(found.level) || 1;
            }
        }
    }

    return Number(character.classes[0]?.level) || Number(character.level) || 1;
}

function inferScaleValueFromContext(ctx?: TemplatePlaceholderContext): string | undefined {
    if (ctx?.scaleValue) return ctx.scaleValue;
    const char = ctx?.character;
    const nameLower = String(ctx?.entityName || "").toLowerCase();
    const sourceLower = String(ctx?.sourceName || "").toLowerCase();
    const cLvl = getClassLevel(char, ctx?.sourceName, ctx?.entityName);
    const totalLvl = Number(char?.level) || cLvl || 1;
    const profBonus = Number(char?.vitals?.proficiencyBonus) || Math.floor((totalLvl - 1) / 4) + 2;

    // Bardic Inspiration die or Bardic-scaled features (e.g. Mantle of Inspiration, Combat Inspiration, Psychic Blades, Cutting Words)
    if (
        nameLower.includes("bardic inspiration") ||
        nameLower.includes("combat inspiration") ||
        nameLower.includes("cutting words") ||
        sourceLower.includes("bard") ||
        sourceLower.includes("glamour") ||
        sourceLower.includes("lore") ||
        sourceLower.includes("valor") ||
        sourceLower.includes("swords") ||
        sourceLower.includes("dance")
    ) {
        const bardLvl = getClassLevel(char, "Bard");
        if (nameLower.includes("mantle of inspiration")) {
            // 2024 College of Glamour: 2 rolls of Bardic Inspiration die (or temp HP = 2x die / level scaling)
            return bardLvl >= 15 ? "2d12" : bardLvl >= 10 ? "2d10" : bardLvl >= 5 ? "2d8" : "2d6";
        }
        if (nameLower.includes("song of rest")) {
            return bardLvl >= 17 ? "1d12" : bardLvl >= 13 ? "1d10" : bardLvl >= 9 ? "1d8" : "1d6";
        }
        return bardLvl >= 15 ? "1d12" : bardLvl >= 10 ? "1d10" : bardLvl >= 5 ? "1d8" : "1d6";
    }

    // Rogue Sneak Attack
    if (nameLower.includes("sneak attack") || sourceLower.includes("rogue")) {
        const rogueLvl = getClassLevel(char, "Rogue");
        return `${Math.ceil(rogueLvl / 2)}d6`;
    }

    // Monk Martial Arts / Focus / Deflect Attacks
    if (nameLower.includes("martial arts") || nameLower.includes("unarmed") || sourceLower.includes("monk")) {
        const monkLvl = getClassLevel(char, "Monk");
        if (nameLower.includes("unarmored movement")) {
            const bonus = monkLvl >= 18 ? 30 : monkLvl >= 14 ? 25 : monkLvl >= 10 ? 20 : monkLvl >= 6 ? 15 : 10;
            return `+${bonus} ft.`;
        }
        return monkLvl >= 17 ? "1d12" : monkLvl >= 11 ? "1d10" : monkLvl >= 5 ? "1d8" : "1d6";
    }

    // Barbarian Rage Damage / Brutal Strike
    if (nameLower.includes("rage") || sourceLower.includes("barbarian")) {
        const barbLvl = getClassLevel(char, "Barbarian");
        const dmg = barbLvl >= 16 ? 4 : barbLvl >= 9 ? 3 : 2;
        return `+${dmg}`;
    }

    // Fighter Second Wind / Battle Master Superiority Die
    if (nameLower.includes("second wind")) {
        const fighterLvl = getClassLevel(char, "Fighter");
        return `1d10 + ${fighterLvl}`;
    }
    if (nameLower.includes("superiority") || nameLower.includes("combat superiority") || nameLower.includes("maneuver")) {
        const fighterLvl = getClassLevel(char, "Fighter");
        return fighterLvl >= 18 ? "1d12" : fighterLvl >= 10 ? "1d10" : "1d8";
    }

    // Paladin Aura of Protection
    if (nameLower.includes("aura of protection")) {
        const chaMod = Math.max(1, getAbilityMod(char, "CHA"));
        return `+${chaMod}`;
    }

    // Dragonborn Breath Weapon
    if (nameLower.includes("breath weapon")) {
        return totalLvl >= 17 ? "4d10" : totalLvl >= 11 ? "3d10" : totalLvl >= 5 ? "2d10" : "1d10";
    }

    // Warlock Dark One's Blessing / Celestial Healing Light / Awakened Mind
    if (nameLower.includes("dark one") && nameLower.includes("blessing")) {
        const warlockLvl = getClassLevel(char, "Warlock");
        const chaMod = getAbilityMod(char, "CHA");
        return `${ Math.max(1, warlockLvl + chaMod) }`;
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

    if (nameLower.includes("bardic inspiration")) {
        return String(Math.max(1, getAbilityMod(char, "CHA")));
    }
    if (nameLower.includes("rage")) {
        const barbLvl = getClassLevel(char, "Barbarian");
        return String(barbLvl >= 17 ? 6 : barbLvl >= 12 ? 5 : barbLvl >= 6 ? 4 : barbLvl >= 3 ? 3 : 2);
    }
    if (nameLower.includes("channel divinity")) {
        const clericLvl = getClassLevel(char, "Cleric");
        if (clericLvl > 0) return String(clericLvl >= 6 ? 3 : 2);
        return "2";
    }
    if (nameLower.includes("second wind")) {
        const fighterLvl = getClassLevel(char, "Fighter");
        return String(fighterLvl >= 10 ? 4 : fighterLvl >= 4 ? 3 : 2);
    }
    if (nameLower.includes("action surge")) {
        const fighterLvl = getClassLevel(char, "Fighter");
        return String(fighterLvl >= 17 ? 2 : 1);
    }
    if (nameLower.includes("luck") || nameLower.includes("lucky")) {
        return String(profBonus);
    }
    if (
        nameLower.includes("beguiling magic") ||
        nameLower.includes("mantle of majesty") ||
        nameLower.includes("unbreakable majesty") ||
        nameLower.includes("fey touched") ||
        nameLower.includes("shadow touched") ||
        nameLower.includes("magic initiate") ||
        nameLower.includes("misty step") ||
        nameLower.includes("clairvoyant combatant") ||
        nameLower.includes("thought shield") ||
        nameLower.includes("create thrall") ||
        nameLower.includes("eldritch hex")
    ) {
        return "1";
    }
    if (sourceLower.includes("warlock") || sourceLower.includes("bard")) {
        return String(Math.max(1, getAbilityMod(char, "CHA")));
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
        if (cleanExpr === "scalevalue" || cleanExpr.startsWith("scalevalue")) {
            const sv = inferScaleValueFromContext(ctx) || `+${profBonus}`;
            const numericSv = Number(sv);
            if (Number.isFinite(numericSv) && (wantsUnsigned || wantsSigned || minVal !== undefined || maxVal !== undefined)) {
                return formatNumber(numericSv, sv.startsWith("+"));
            }
            return sv;
        }

        if (cleanExpr === "limiteduse" || cleanExpr.startsWith("limiteduse")) {
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

        // 3a. savedc:stat1,stat2 or standalone savedc
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

        // 3e. Scalar character tokens: classlevel, characterlevel, proficiency, maxhp, speed, passiveperception
        mathExpr = mathExpr
            .replace(/\bclasslevel\b/gi, `(${cLvl})`)
            .replace(/\bcharacterlevel\b/gi, `(${totalLvl})`)
            .replace(/\bproficiency\b/gi, `(${profBonus})`)
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
