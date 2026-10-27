import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSpellTable1792770000000 implements MigrationInterface {
    name = 'CreateSpellTable1792770000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`spell\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`level\` int NOT NULL DEFAULT 0,
                \`school\` varchar(100) NOT NULL DEFAULT 'Universal',
                \`source\` varchar(100) NOT NULL DEFAULT 'Custom',
                \`castingTime\` varchar(100) NOT NULL DEFAULT '1 Action',
                \`range\` varchar(100) NOT NULL DEFAULT 'Self',
                \`duration\` varchar(100) NOT NULL DEFAULT 'Instantaneous',
                \`components\` varchar(255) NOT NULL DEFAULT 'V, S',
                \`concentration\` tinyint NOT NULL DEFAULT 0,
                \`ritual\` tinyint NOT NULL DEFAULT 0,
                \`description\` text NOT NULL,
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_spell_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`spell\``);
    }
}
