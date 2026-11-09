import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_SPELLS } from "../spellsSeed";

export class AddClassesAndSeedSpells1792789900000 implements MigrationInterface {
    name = 'AddClassesAndSeedSpells1792789900000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add classes column if not present
        const hasColumn = await queryRunner.hasColumn("spell", "classes");
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE \`spell\` ADD COLUMN \`classes\` text NULL;`);
        }

        // Seed or update all 2024 spells
        for (const sp of SEED_SPELLS) {
            await queryRunner.query(`
                INSERT INTO \`spell\`
                (\`slug\`, \`name\`, \`level\`, \`school\`, \`source\`, \`castingTime\`, \`range\`, \`duration\`, \`components\`, \`concentration\`, \`ritual\`, \`description\`, \`classes\`, \`isCustom\`)
                VALUES (?, ?, ?, ?, '2024 Core Rules', ?, ?, ?, ?, ?, ?, ?, ?, 0)
                ON DUPLICATE KEY UPDATE
                    \`classes\` = VALUES(\`classes\`),
                    \`level\` = VALUES(\`level\`),
                    \`school\` = VALUES(\`school\`),
                    \`source\` = IF(\`source\` LIKE '%Custom%', \`source\`, VALUES(\`source\`)),
                    \`castingTime\` = VALUES(\`castingTime\`),
                    \`range\` = VALUES(\`range\`),
                    \`duration\` = VALUES(\`duration\`),
                    \`components\` = VALUES(\`components\`),
                    \`concentration\` = VALUES(\`concentration\`),
                    \`ritual\` = VALUES(\`ritual\`),
                    \`description\` = IF(LENGTH(\`description\`) > 10, \`description\`, VALUES(\`description\`))
            `, [
                sp.id,
                sp.name,
                sp.level,
                sp.school,
                sp.castingTime,
                sp.range,
                sp.duration,
                sp.components,
                sp.concentration ? 1 : 0,
                sp.ritual ? 1 : 0,
                sp.description,
                JSON.stringify(sp.classes || [])
            ]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasColumn = await queryRunner.hasColumn("spell", "classes");
        if (hasColumn) {
            await queryRunner.query(`ALTER TABLE \`spell\` DROP COLUMN \`classes\`;`);
        }
    }
}
