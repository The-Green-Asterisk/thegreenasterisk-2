import { MigrationInterface, QueryRunner } from "typeorm";
import {
    SEED_BACKGROUNDS,
    SEED_CLASSES,
    SEED_GENERAL_FEATS,
    SEED_ORIGIN_FEATS,
    SEED_SPECIES
} from "../rulesSeed";

export class CreateRulesTables1792786000000 implements MigrationInterface {
    name = 'CreateRulesTables1792786000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. rule_classes table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`rule_classes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(100) NOT NULL,
                \`name\` varchar(150) NOT NULL,
                \`description\` text NOT NULL,
                \`hitDie\` int NOT NULL DEFAULT 8,
                \`primaryAbilitiesJson\` text NOT NULL,
                \`savingThrowsJson\` text NOT NULL,
                \`armorProficienciesJson\` text NOT NULL,
                \`weaponProficienciesJson\` text NOT NULL,
                \`weaponMasteryCount\` int NOT NULL DEFAULT 0,
                \`skillChoicesJson\` text NOT NULL,
                \`spellcastingJson\` text NULL,
                \`featuresJson\` longtext NOT NULL,
                \`subclassesJson\` longtext NOT NULL,
                \`startingEquipmentJson\` text NULL,
                \`source\` varchar(150) NOT NULL DEFAULT '2024 Core Rules',
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_rule_classes_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 2. rule_species table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`rule_species\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(100) NOT NULL,
                \`name\` varchar(150) NOT NULL,
                \`description\` text NOT NULL,
                \`size\` varchar(50) NOT NULL DEFAULT 'Medium',
                \`speed\` int NOT NULL DEFAULT 30,
                \`darkvision\` varchar(100) NULL,
                \`traitsJson\` longtext NOT NULL,
                \`lineagesJson\` longtext NULL,
                \`extraSkillCount\` int NOT NULL DEFAULT 0,
                \`extraFeatCount\` int NOT NULL DEFAULT 0,
                \`source\` varchar(150) NOT NULL DEFAULT '2024 Core Rules',
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_rule_species_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 3. rule_backgrounds table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`rule_backgrounds\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(100) NOT NULL,
                \`name\` varchar(150) NOT NULL,
                \`description\` text NOT NULL,
                \`allowedAbilitiesJson\` text NOT NULL,
                \`skillsJson\` text NOT NULL,
                \`tool\` varchar(150) NOT NULL DEFAULT '',
                \`originFeatId\` varchar(100) NOT NULL DEFAULT '',
                \`equipmentSummary\` text NOT NULL,
                \`source\` varchar(150) NOT NULL DEFAULT '2024 Core Rules',
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_rule_backgrounds_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 4. rule_feats table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`rule_feats\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(100) NOT NULL,
                \`name\` varchar(150) NOT NULL,
                \`description\` text NOT NULL,
                \`category\` varchar(50) NOT NULL DEFAULT 'general',
                \`prerequisite\` varchar(255) NULL,
                \`benefitsJson\` text NOT NULL,
                \`statOptionsJson\` text NULL,
                \`isEpicBoon\` tinyint NOT NULL DEFAULT 0,
                \`source\` varchar(150) NOT NULL DEFAULT '2024 Core Rules',
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_rule_feats_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Seed rule_classes
        for (const cls of SEED_CLASSES) {
            await queryRunner.query(`
                INSERT IGNORE INTO \`rule_classes\`
                (\`slug\`, \`name\`, \`description\`, \`hitDie\`, \`primaryAbilitiesJson\`, \`savingThrowsJson\`, \`armorProficienciesJson\`, \`weaponProficienciesJson\`, \`weaponMasteryCount\`, \`skillChoicesJson\`, \`spellcastingJson\`, \`featuresJson\`, \`subclassesJson\`, \`startingEquipmentJson\`, \`source\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2024 Core Rules')
            `, [
                cls.id,
                cls.name,
                cls.description,
                cls.hitDie,
                JSON.stringify(cls.primaryAbilities),
                JSON.stringify(cls.savingThrows),
                JSON.stringify(cls.armorProficiencies),
                JSON.stringify(cls.weaponProficiencies),
                cls.weaponMasteryCount || 0,
                JSON.stringify(cls.skillChoices),
                cls.spellcasting ? JSON.stringify(cls.spellcasting) : null,
                JSON.stringify(cls.features || []),
                JSON.stringify(cls.subclasses || []),
                cls.startingEquipmentOptions ? JSON.stringify(cls.startingEquipmentOptions) : null
            ]);
        }

        // Seed rule_species
        for (const sp of SEED_SPECIES) {
            await queryRunner.query(`
                INSERT IGNORE INTO \`rule_species\`
                (\`slug\`, \`name\`, \`description\`, \`size\`, \`speed\`, \`darkvision\`, \`traitsJson\`, \`lineagesJson\`, \`extraSkillCount\`, \`extraFeatCount\`, \`source\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2024 Core Rules')
            `, [
                sp.id,
                sp.name,
                sp.description,
                sp.size,
                sp.speed,
                sp.darkvision || null,
                JSON.stringify(sp.traits || []),
                sp.lineages ? JSON.stringify(sp.lineages) : null,
                sp.extraSkillCount || 0,
                sp.extraFeatCount || 0
            ]);
        }

        // Seed rule_backgrounds
        for (const bg of SEED_BACKGROUNDS) {
            await queryRunner.query(`
                INSERT IGNORE INTO \`rule_backgrounds\`
                (\`slug\`, \`name\`, \`description\`, \`allowedAbilitiesJson\`, \`skillsJson\`, \`tool\`, \`originFeatId\`, \`equipmentSummary\`, \`source\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2024 Core Rules')
            `, [
                bg.id,
                bg.name,
                bg.description,
                JSON.stringify(bg.allowedAbilities),
                JSON.stringify(bg.skills),
                bg.tool || "",
                bg.originFeatId || "",
                bg.equipmentSummary || ""
            ]);
        }

        // Seed origin feats
        for (const ofeat of SEED_ORIGIN_FEATS) {
            await queryRunner.query(`
                INSERT IGNORE INTO \`rule_feats\`
                (\`slug\`, \`name\`, \`description\`, \`category\`, \`prerequisite\`, \`benefitsJson\`, \`statOptionsJson\`, \`isEpicBoon\`, \`source\`)
                VALUES (?, ?, ?, 'origin', NULL, ?, ?, 0, '2024 Core Rules')
            `, [
                ofeat.id,
                ofeat.name,
                ofeat.description,
                JSON.stringify(ofeat.benefits || []),
                (ofeat as any).spellcastingAbilityOptions ? JSON.stringify((ofeat as any).spellcastingAbilityOptions) : null
            ]);
        }

        // Seed general feats
        for (const gfeat of SEED_GENERAL_FEATS) {
            await queryRunner.query(`
                INSERT IGNORE INTO \`rule_feats\`
                (\`slug\`, \`name\`, \`description\`, \`category\`, \`prerequisite\`, \`benefitsJson\`, \`statOptionsJson\`, \`isEpicBoon\`, \`source\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, '2024 Core Rules')
            `, [
                gfeat.id,
                gfeat.name,
                gfeat.description,
                (gfeat as any).category || (gfeat.isEpicBoon ? "epic-boon" : "general"),
                (gfeat as any).prerequisite || null,
                JSON.stringify(gfeat.benefits || []),
                JSON.stringify((gfeat as any).allowedStats || (gfeat as any).statOptions || []),
                gfeat.isEpicBoon ? 1 : 0
            ]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`rule_feats\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`rule_backgrounds\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`rule_species\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`rule_classes\``);
    }
}
