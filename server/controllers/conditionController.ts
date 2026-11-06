import http from "http";
import AppDataSource from "services/database";
import Condition from "services/database/entity/Condition";
import BaseController from "./baseController";

export interface ConditionRecord {
    id: number;
    slug: string;
    name: string;
    summary: string;
    description: string;
    icon: string;
    hasLevels: boolean;
    maxLevel: number;
}

export const DEFAULT_DND55_CONDITIONS: ConditionRecord[] = [
    {
        id: 1,
        slug: "blinded",
        name: "Blinded",
        summary: "Can't see; auto-fail sight checks; attacks against you have Advantage, your attacks have Disadvantage.",
        description: "<p>While you have the Blinded condition, you experience the following effects.</p><ul><li><strong>Can't See.</strong> You can't see and automatically fail any ability check that requires sight.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.</li></ul>",
        icon: "fa-solid fa-eye-slash",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 2,
        slug: "charmed",
        name: "Charmed",
        summary: "Can't attack or target the charmer with harmful effects; charmer has Advantage on social checks with you.",
        description: "<p>While you have the Charmed condition, you experience the following effects.</p><ul><li><strong>Can't Harm the Charmer.</strong> You can't attack the charmer or target the charmer with damaging abilities or magical effects.</li><li><strong>Social Advantage.</strong> The charmer has Advantage on any ability check to interact with you socially.</li></ul>",
        icon: "fa-solid fa-heart",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 3,
        slug: "deafened",
        name: "Deafened",
        summary: "Can't hear and automatically fail any ability check that requires hearing.",
        description: "<p>While you have the Deafened condition, you experience the following effect.</p><ul><li><strong>Can't Hear.</strong> You can't hear and automatically fail any ability check that requires hearing.</li></ul>",
        icon: "fa-solid fa-ear-deaf",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 4,
        slug: "exhaustion",
        name: "Exhaustion",
        summary: "Cumulative levels 1–6: D20 Tests reduced by 2 × level, Speed reduced by 5 ft. × level; Level 6 is death.",
        description: "<p>While you have the Exhaustion condition, you experience the following effects.</p><ul><li><strong>Exhaustion Levels.</strong> This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.</li><li><strong>D20 Tests Affected.</strong> When you make a D20 Test (an ability check, attack roll, or saving throw), the roll is reduced by 2 times your Exhaustion level.</li><li><strong>Speed Reduced.</strong> Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.</li><li><strong>Removing Exhaustion Levels.</strong> Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.</li></ul>",
        icon: "fa-solid fa-battery-quarter",
        hasLevels: true,
        maxLevel: 6
    },
    {
        id: 5,
        slug: "frightened",
        name: "Frightened",
        summary: "Disadvantage on ability checks and attacks while source of fear is in line of sight; can't willingly move closer.",
        description: "<p>While you have the Frightened condition, you experience the following effects.</p><ul><li><strong>Ability Checks and Attacks Affected.</strong> You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.</li><li><strong>Can't Approach.</strong> You can't willingly move closer to the source of fear.</li></ul>",
        icon: "fa-solid fa-ghost",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 6,
        slug: "grappled",
        name: "Grappled",
        summary: "Speed 0; Disadvantage on attacks against targets other than the grappler; grappler can drag or carry you.",
        description: "<p>While you have the Grappled condition, you experience the following effects.</p><ul><li><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</li><li><strong>Attacks Affected.</strong> You have Disadvantage on attack rolls against any target other than the grappler.</li><li><strong>Movable.</strong> The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.</li></ul>",
        icon: "fa-solid fa-hand-fist",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 7,
        slug: "incapacitated",
        name: "Incapacitated",
        summary: "Can't take actions, Bonus Actions, or Reactions; Concentration is broken; can't speak.",
        description: "<p>While you have the Incapacitated condition, you experience the following effects.</p><ul><li><strong>Inactive.</strong> You can't take any action, Bonus Action, or Reaction.</li><li><strong>No Concentration.</strong> Your Concentration is broken.</li><li><strong>Speechless.</strong> You can't speak.</li><li><strong>Surprised.</strong> If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll.</li></ul>",
        icon: "fa-solid fa-ban",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 8,
        slug: "invisible",
        name: "Invisible",
        summary: "Advantage on Initiative; concealed from sight; your attacks have Advantage and attacks against you have Disadvantage.",
        description: "<p>While you have the Invisible condition, you experience the following effects.</p><ul><li><strong>Surprise.</strong> If you're Invisible when you roll Initiative, you have Advantage on the roll.</li><li><strong>Concealed.</strong> You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature.</li></ul>",
        icon: "fa-solid fa-user-ninja",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 9,
        slug: "paralyzed",
        name: "Paralyzed",
        summary: "Incapacitated; Speed 0; auto-fail STR/DEX saves; attacks against you have Advantage and crit within 5 ft.",
        description: "<p>While you have the Paralyzed condition, you experience the following effects.</p><ul><li><strong>Incapacitated.</strong> You have the Incapacitated condition.</li><li><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li><li><strong>Automatic Critical Hits.</strong> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</li></ul>",
        icon: "fa-solid fa-bolt-lightning",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 10,
        slug: "petrified",
        name: "Petrified",
        summary: "Turned to stone; Incapacitated; Speed 0; auto-fail STR/DEX saves; Resistance to all damage; Immune to Poison.",
        description: "<p>While you have the Petrified condition, you experience the following effects.</p><ul><li><strong>Turned to Inanimate Substance.</strong> You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.</li><li><strong>Incapacitated.</strong> You have the Incapacitated condition.</li><li><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Resist Damage.</strong> You have Resistance to all damage.</li><li><strong>Poison Immunity.</strong> You have Immunity to the Poisoned condition.</li></ul>",
        icon: "fa-solid fa-monument",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 11,
        slug: "poisoned",
        name: "Poisoned",
        summary: "Disadvantage on attack rolls and ability checks.",
        description: "<p>While you have the Poisoned condition, you experience the following effect.</p><ul><li><strong>Ability Checks and Attacks Affected.</strong> You have Disadvantage on attack rolls and ability checks.</li></ul>",
        icon: "fa-solid fa-skull-crossbones",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 12,
        slug: "prone",
        name: "Prone",
        summary: "Crawl or spend half Speed to stand; Disadvantage on attacks; melee attacks within 5 ft. have Advantage against you.",
        description: "<p>While you have the Prone condition, you experience the following effects.</p><ul><li><strong>Restricted Movement.</strong> Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can't right yourself.</li><li><strong>Attacks Affected.</strong> You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.</li></ul>",
        icon: "fa-solid fa-person-falling",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 13,
        slug: "restrained",
        name: "Restrained",
        summary: "Speed 0; attacks against you have Advantage, your attacks have Disadvantage; Disadvantage on DEX saves.",
        description: "<p>While you have the Restrained condition, you experience the following effects.</p><ul><li><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.</li><li><strong>Saving Throws Affected.</strong> You have Disadvantage on Dexterity saving throws.</li></ul>",
        icon: "fa-solid fa-link",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 14,
        slug: "stunned",
        name: "Stunned",
        summary: "Incapacitated; auto-fail STR/DEX saves; attack rolls against you have Advantage.",
        description: "<p>While you have the Stunned condition, you experience the following effects.</p><ul><li><strong>Incapacitated.</strong> You have the Incapacitated condition.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li></ul>",
        icon: "fa-solid fa-dizzy",
        hasLevels: false,
        maxLevel: 0
    },
    {
        id: 15,
        slug: "unconscious",
        name: "Unconscious",
        summary: "Incapacitated & Prone; drop held items; Speed 0; auto-fail STR/DEX saves; attacks within 5 ft. auto-crit; unaware.",
        description: "<p>While you have the Unconscious condition, you experience the following effects.</p><ul><li><strong>Inert.</strong> You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone.</li><li><strong>Speed 0.</strong> Your Speed is 0 and can't increase.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Automatic Critical Hits.</strong> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</li><li><strong>Unaware.</strong> You're unaware of your surroundings.</li></ul>",
        icon: "fa-solid fa-bed-pulse",
        hasLevels: false,
        maxLevel: 0
    }
];

export default class ConditionController extends BaseController {
    public static async getConditions(_req: http.IncomingMessage, _res: http.ServerResponse) {
        if (!AppDataSource.isInitialized) {
            return {
                response: JSON.stringify({ conditions: DEFAULT_DND55_CONDITIONS }),
                header: "application/json",
                status: 200
            };
        }

        try {
            const repo = AppDataSource.getRepository(Condition);
            const rows = await repo.find({ order: { name: "ASC" } });
            if (!rows.length) {
                return {
                    response: JSON.stringify({ conditions: DEFAULT_DND55_CONDITIONS }),
                    header: "application/json",
                    status: 200
                };
            }

            return {
                response: JSON.stringify({
                    conditions: rows.map(r => ({
                        id: r.id,
                        slug: r.slug,
                        name: r.name,
                        summary: r.summary,
                        description: r.description,
                        icon: r.icon,
                        hasLevels: !!r.hasLevels,
                        maxLevel: Number(r.maxLevel) || 0
                    }))
                }),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.warn("Condition table query failed, returning fallback D&D 5.5 conditions:", error);
            return {
                response: JSON.stringify({ conditions: DEFAULT_DND55_CONDITIONS }),
                header: "application/json",
                status: 200
            };
        }
    }
}
