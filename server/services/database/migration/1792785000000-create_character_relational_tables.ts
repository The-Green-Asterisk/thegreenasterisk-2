import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCharacterRelationalTables1792785000000 implements MigrationInterface {
    name = 'CreateCharacterRelationalTables1792785000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add character metadata columns to saved_character if they do not exist
        const hasLevel = await queryRunner.hasColumn("saved_character", "level");
        if (!hasLevel) {
            await queryRunner.query(`ALTER TABLE \`saved_character\` ADD \`level\` int NOT NULL DEFAULT 1`);
        }
        const hasRace = await queryRunner.hasColumn("saved_character", "race");
        if (!hasRace) {
            await queryRunner.query(`ALTER TABLE \`saved_character\` ADD \`race\` varchar(100) NULL`);
        }
        const hasBackground = await queryRunner.hasColumn("saved_character", "background");
        if (!hasBackground) {
            await queryRunner.query(`ALTER TABLE \`saved_character\` ADD \`background\` varchar(100) NULL`);
        }
        const hasAlignment = await queryRunner.hasColumn("saved_character", "alignment");
        if (!hasAlignment) {
            await queryRunner.query(`ALTER TABLE \`saved_character\` ADD \`alignment\` varchar(50) NULL`);
        }
        const hasAvatarUrl = await queryRunner.hasColumn("saved_character", "avatarUrl");
        if (!hasAvatarUrl) {
            await queryRunner.query(`ALTER TABLE \`saved_character\` ADD \`avatarUrl\` text NULL`);
        }
        const hasDndBeyondUrl = await queryRunner.hasColumn("saved_character", "dndBeyondUrl");
        if (!hasDndBeyondUrl) {
            await queryRunner.query(`ALTER TABLE \`saved_character\` ADD \`dndBeyondUrl\` varchar(255) NULL`);
        }

        // 1. Character Vitals
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_vitals\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`currentHp\` int NOT NULL DEFAULT 10,
                \`maxHp\` int NOT NULL DEFAULT 10,
                \`tempHp\` int NOT NULL DEFAULT 0,
                \`armorClass\` int NOT NULL DEFAULT 10,
                \`initiative\` int NOT NULL DEFAULT 0,
                \`speed\` varchar(50) NOT NULL DEFAULT '30 ft.',
                \`proficiencyBonus\` int NOT NULL DEFAULT 2,
                \`passivePerception\` int NOT NULL DEFAULT 10,
                \`passiveInvestigation\` int NOT NULL DEFAULT 10,
                \`passiveInsight\` int NOT NULL DEFAULT 10,
                \`darkvision\` varchar(50) NOT NULL DEFAULT 'None',
                \`blindsight\` varchar(50) NULL,
                \`truesight\` varchar(50) NULL,
                \`tremorsense\` varchar(50) NULL,
                \`hitDice\` varchar(50) NOT NULL DEFAULT '1d8',
                \`heroicInspiration\` tinyint(1) NOT NULL DEFAULT 0,
                \`spellSaveDc\` int NOT NULL DEFAULT 10,
                \`spellAttackBonus\` int NOT NULL DEFAULT 0,
                \`spellcastingAbility\` varchar(20) NOT NULL DEFAULT 'none',
                \`deathSuccesses\` int NOT NULL DEFAULT 0,
                \`deathFailures\` int NOT NULL DEFAULT 0,
                \`isStable\` tinyint(1) NOT NULL DEFAULT 0,
                \`savingThrowNotes\` text NULL,
                UNIQUE INDEX \`REL_character_vitals_saved_character\` (\`savedCharacterId\`),
                CONSTRAINT \`FK_character_vitals_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 2. Character Class
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_class\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`level\` int NOT NULL DEFAULT 1,
                \`subclass\` varchar(100) NULL,
                \`isStartingClass\` tinyint(1) NOT NULL DEFAULT 1,
                INDEX \`IDX_character_class_saved_character_name\` (\`savedCharacterId\`, \`name\`),
                CONSTRAINT \`FK_character_class_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 3. Character Ability
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_ability\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(50) NOT NULL,
                \`abbr\` varchar(10) NOT NULL,
                \`score\` int NOT NULL,
                \`baseScore\` int NOT NULL,
                \`bonus\` int NOT NULL DEFAULT 0,
                \`modifier\` int NOT NULL,
                \`save\` int NOT NULL,
                \`proficientSave\` tinyint(1) NOT NULL DEFAULT 0,
                \`notes\` text NULL,
                INDEX \`IDX_character_ability_saved_character_abbr\` (\`savedCharacterId\`, \`abbr\`),
                CONSTRAINT \`FK_character_ability_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 4. Character Skill
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_skill\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`stat\` varchar(10) NOT NULL,
                \`bonus\` int NOT NULL DEFAULT 0,
                \`proficiency\` varchar(20) NOT NULL DEFAULT 'none',
                INDEX \`IDX_character_skill_saved_character_name\` (\`savedCharacterId\`, \`name\`),
                CONSTRAINT \`FK_character_skill_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 5. Character Inventory Item
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_inventory_item\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`quantity\` int NOT NULL DEFAULT 1,
                \`equipped\` tinyint(1) NOT NULL DEFAULT 0,
                \`attuned\` tinyint(1) NOT NULL DEFAULT 0,
                \`requiresAttunement\` tinyint(1) NOT NULL DEFAULT 0,
                \`category\` varchar(100) NOT NULL DEFAULT 'Gear',
                \`damage\` varchar(50) NULL,
                \`damageType\` varchar(50) NULL,
                \`damageDie\` varchar(20) NULL,
                \`attackBonus\` varchar(20) NULL,
                \`toHitModifier\` int NULL,
                \`range\` varchar(50) NULL,
                \`propertiesJson\` text NULL,
                \`masteryName\` varchar(50) NULL,
                \`masteryUnlocked\` tinyint(1) NULL,
                \`masteryDescription\` text NULL,
                \`isMagic\` tinyint(1) NOT NULL DEFAULT 0,
                \`rarity\` varchar(50) NULL,
                \`description\` text NULL,
                \`notes\` text NULL,
                \`grantedBy\` varchar(255) NULL,
                \`imageUrl\` text NULL,
                INDEX \`IDX_character_item_saved_character_name\` (\`savedCharacterId\`, \`name\`),
                CONSTRAINT \`FK_character_item_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 6. Character Spell
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_spell\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`level\` int NOT NULL DEFAULT 0,
                \`school\` varchar(50) NOT NULL DEFAULT 'Evocation',
                \`source\` varchar(100) NOT NULL DEFAULT 'Class',
                \`prepared\` tinyint(1) NOT NULL DEFAULT 0,
                \`alwaysPrepared\` tinyint(1) NOT NULL DEFAULT 0,
                \`castingTime\` varchar(50) NOT NULL DEFAULT '1 Action',
                \`range\` varchar(50) NOT NULL DEFAULT 'Touch',
                \`duration\` varchar(100) NOT NULL DEFAULT 'Instantaneous',
                \`components\` varchar(50) NOT NULL DEFAULT 'V, S',
                \`concentration\` tinyint(1) NOT NULL DEFAULT 0,
                \`ritual\` tinyint(1) NOT NULL DEFAULT 0,
                \`description\` text NULL,
                INDEX \`IDX_character_spell_saved_character_name\` (\`savedCharacterId\`, \`name\`),
                CONSTRAINT \`FK_character_spell_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 7. Character Feature
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_feature\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`source\` varchar(100) NOT NULL,
                \`type\` varchar(50) NOT NULL DEFAULT 'Class',
                \`description\` text NOT NULL,
                \`scaleValue\` varchar(100) NULL,
                \`limitedUse\` varchar(100) NULL,
                INDEX \`IDX_character_feature_saved_character_name\` (\`savedCharacterId\`, \`name\`),
                CONSTRAINT \`FK_character_feature_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 8. Character Resource
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_resource\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`total\` int NOT NULL,
                \`currentUsed\` int NOT NULL DEFAULT 0,
                \`resetOn\` varchar(20) NOT NULL DEFAULT 'long',
                \`dieOrType\` varchar(50) NULL,
                \`resourceKey\` varchar(50) NULL,
                INDEX \`IDX_character_resource_saved_character_name\` (\`savedCharacterId\`, \`name\`),
                CONSTRAINT \`FK_character_resource_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 9. Character Feature Decision
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_feature_decision\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`savedCharacterId\` int NOT NULL,
                \`decisionId\` varchar(100) NOT NULL,
                \`selectedValue\` text NOT NULL,
                INDEX \`IDX_character_decision_saved_character\` (\`savedCharacterId\`, \`decisionId\`),
                CONSTRAINT \`FK_character_decision_saved_character\` FOREIGN KEY (\`savedCharacterId\`) REFERENCES \`saved_character\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS \`character_feature_decision\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_resource\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_feature\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_spell\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_inventory_item\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_skill\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_ability\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_class\`');
        await queryRunner.query('DROP TABLE IF EXISTS \`character_vitals\`');
    }
}
