import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConditionsTable1792784000000 implements MigrationInterface {
    name = 'CreateConditionsTable1792784000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`conditions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`summary\` varchar(500) NOT NULL DEFAULT '',
                \`description\` text NOT NULL,
                \`icon\` varchar(100) NOT NULL DEFAULT 'fa-solid fa-circle-exclamation',
                \`hasLevels\` tinyint NOT NULL DEFAULT 0,
                \`maxLevel\` int NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_conditions_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        await queryRunner.query(`
            INSERT INTO \`conditions\` (\`slug\`, \`name\`, \`summary\`, \`description\`, \`icon\`, \`hasLevels\`, \`maxLevel\`)
            VALUES
            (
                'blinded',
                'Blinded',
                'Can''t see; auto-fail sight checks; attacks against you have Advantage, your attacks have Disadvantage.',
                '<p>While you have the Blinded condition, you experience the following effects.</p><ul><li><strong>Can''t See.</strong> You can''t see and automatically fail any ability check that requires sight.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.</li></ul>',
                'fa-solid fa-eye-slash',
                0,
                0
            ),
            (
                'charmed',
                'Charmed',
                'Can''t attack or target the charmer with harmful effects; charmer has Advantage on social checks with you.',
                '<p>While you have the Charmed condition, you experience the following effects.</p><ul><li><strong>Can''t Harm the Charmer.</strong> You can''t attack the charmer or target the charmer with damaging abilities or magical effects.</li><li><strong>Social Advantage.</strong> The charmer has Advantage on any ability check to interact with you socially.</li></ul>',
                'fa-solid fa-heart',
                0,
                0
            ),
            (
                'deafened',
                'Deafened',
                'Can''t hear and automatically fail any ability check that requires hearing.',
                '<p>While you have the Deafened condition, you experience the following effect.</p><ul><li><strong>Can''t Hear.</strong> You can''t hear and automatically fail any ability check that requires hearing.</li></ul>',
                'fa-solid fa-ear-deaf',
                0,
                0
            ),
            (
                'exhaustion',
                'Exhaustion',
                'Cumulative levels 1–6: D20 Tests reduced by 2 × level, Speed reduced by 5 ft. × level; Level 6 is death.',
                '<p>While you have the Exhaustion condition, you experience the following effects.</p><ul><li><strong>Exhaustion Levels.</strong> This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.</li><li><strong>D20 Tests Affected.</strong> When you make a D20 Test (an ability check, attack roll, or saving throw), the roll is reduced by 2 times your Exhaustion level.</li><li><strong>Speed Reduced.</strong> Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.</li><li><strong>Removing Exhaustion Levels.</strong> Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.</li></ul>',
                'fa-solid fa-battery-quarter',
                1,
                6
            ),
            (
                'frightened',
                'Frightened',
                'Disadvantage on ability checks and attacks while source of fear is in line of sight; can''t willingly move closer.',
                '<p>While you have the Frightened condition, you experience the following effects.</p><ul><li><strong>Ability Checks and Attacks Affected.</strong> You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.</li><li><strong>Can''t Approach.</strong> You can''t willingly move closer to the source of fear.</li></ul>',
                'fa-solid fa-ghost',
                0,
                0
            ),
            (
                'grappled',
                'Grappled',
                'Speed 0; Disadvantage on attacks against targets other than the grappler; grappler can drag or carry you.',
                '<p>While you have the Grappled condition, you experience the following effects.</p><ul><li><strong>Speed 0.</strong> Your Speed is 0 and can''t increase.</li><li><strong>Attacks Affected.</strong> You have Disadvantage on attack rolls against any target other than the grappler.</li><li><strong>Movable.</strong> The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.</li></ul>',
                'fa-solid fa-hand-fist',
                0,
                0
            ),
            (
                'incapacitated',
                'Incapacitated',
                'Can''t take actions, Bonus Actions, or Reactions; Concentration is broken; can''t speak.',
                '<p>While you have the Incapacitated condition, you experience the following effects.</p><ul><li><strong>Inactive.</strong> You can''t take any action, Bonus Action, or Reaction.</li><li><strong>No Concentration.</strong> Your Concentration is broken.</li><li><strong>Speechless.</strong> You can''t speak.</li><li><strong>Surprised.</strong> If you''re Incapacitated when you roll Initiative, you have Disadvantage on the roll.</li></ul>',
                'fa-solid fa-ban',
                0,
                0
            ),
            (
                'invisible',
                'Invisible',
                'Advantage on Initiative; concealed from sight; your attacks have Advantage and attacks against you have Disadvantage.',
                '<p>While you have the Invisible condition, you experience the following effects.</p><ul><li><strong>Surprise.</strong> If you''re Invisible when you roll Initiative, you have Advantage on the roll.</li><li><strong>Concealed.</strong> You aren''t affected by any effect that requires its target to be seen unless the effect''s creator can somehow see you. Any equipment you are wearing or carrying is also concealed.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don''t gain this benefit against that creature.</li></ul>',
                'fa-solid fa-user-ninja',
                0,
                0
            ),
            (
                'paralyzed',
                'Paralyzed',
                'Incapacitated; Speed 0; auto-fail STR/DEX saves; attacks against you have Advantage and crit within 5 ft.',
                '<p>While you have the Paralyzed condition, you experience the following effects.</p><ul><li><strong>Incapacitated.</strong> You have the Incapacitated condition.</li><li><strong>Speed 0.</strong> Your Speed is 0 and can''t increase.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li><li><strong>Automatic Critical Hits.</strong> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</li></ul>',
                'fa-solid fa-bolt-lightning',
                0,
                0
            ),
            (
                'petrified',
                'Petrified',
                'Turned to stone; Incapacitated; Speed 0; auto-fail STR/DEX saves; Resistance to all damage; Immune to Poison.',
                '<p>While you have the Petrified condition, you experience the following effects.</p><ul><li><strong>Turned to Inanimate Substance.</strong> You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.</li><li><strong>Incapacitated.</strong> You have the Incapacitated condition.</li><li><strong>Speed 0.</strong> Your Speed is 0 and can''t increase.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Resist Damage.</strong> You have Resistance to all damage.</li><li><strong>Poison Immunity.</strong> You have Immunity to the Poisoned condition.</li></ul>',
                'fa-solid fa-monument',
                0,
                0
            ),
            (
                'poisoned',
                'Poisoned',
                'Disadvantage on attack rolls and ability checks.',
                '<p>While you have the Poisoned condition, you experience the following effect.</p><ul><li><strong>Ability Checks and Attacks Affected.</strong> You have Disadvantage on attack rolls and ability checks.</li></ul>',
                'fa-solid fa-skull-crossbones',
                0,
                0
            ),
            (
                'prone',
                'Prone',
                'Crawl or spend half Speed to stand; Disadvantage on attacks; melee attacks within 5 ft. have Advantage against you.',
                '<p>While you have the Prone condition, you experience the following effects.</p><ul><li><strong>Restricted Movement.</strong> Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can''t right yourself.</li><li><strong>Attacks Affected.</strong> You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.</li></ul>',
                'fa-solid fa-person-falling',
                0,
                0
            ),
            (
                'restrained',
                'Restrained',
                'Speed 0; attacks against you have Advantage, your attacks have Disadvantage; Disadvantage on DEX saves.',
                '<p>While you have the Restrained condition, you experience the following effects.</p><ul><li><strong>Speed 0.</strong> Your Speed is 0 and can''t increase.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage, and your attack rolls have Disadvantage.</li><li><strong>Saving Throws Affected.</strong> You have Disadvantage on Dexterity saving throws.</li></ul>',
                'fa-solid fa-link',
                0,
                0
            ),
            (
                'stunned',
                'Stunned',
                'Incapacitated; auto-fail STR/DEX saves; attack rolls against you have Advantage.',
                '<p>While you have the Stunned condition, you experience the following effects.</p><ul><li><strong>Incapacitated.</strong> You have the Incapacitated condition.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li></ul>',
                'fa-solid fa-dizzy',
                0,
                0
            ),
            (
                'unconscious',
                'Unconscious',
                'Incapacitated & Prone; drop held items; Speed 0; auto-fail STR/DEX saves; attacks within 5 ft. auto-crit; unaware.',
                '<p>While you have the Unconscious condition, you experience the following effects.</p><ul><li><strong>Inert.</strong> You have the Incapacitated and Prone conditions, and you drop whatever you''re holding. When this condition ends, you remain Prone.</li><li><strong>Speed 0.</strong> Your Speed is 0 and can''t increase.</li><li><strong>Attacks Affected.</strong> Attack rolls against you have Advantage.</li><li><strong>Saving Throws Affected.</strong> You automatically fail Strength and Dexterity saving throws.</li><li><strong>Automatic Critical Hits.</strong> Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.</li><li><strong>Unaware.</strong> You''re unaware of your surroundings.</li></ul>',
                'fa-solid fa-bed-pulse',
                0,
                0
            )
            ON DUPLICATE KEY UPDATE
                \`name\` = VALUES(\`name\`),
                \`summary\` = VALUES(\`summary\`),
                \`description\` = VALUES(\`description\`),
                \`icon\` = VALUES(\`icon\`),
                \`hasLevels\` = VALUES(\`hasLevels\`),
                \`maxLevel\` = VALUES(\`maxLevel\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`conditions\``);
    }
}
