import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateItemTable1792775000000 implements MigrationInterface {
    name = 'CreateItemTable1792775000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`item\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`slug\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`filterType\` varchar(100) NOT NULL DEFAULT 'Item',
                \`rarity\` varchar(100) NOT NULL DEFAULT 'Common',
                \`isMagic\` tinyint NOT NULL DEFAULT 0,
                \`requiresAttunement\` tinyint NOT NULL DEFAULT 0,
                \`source\` varchar(255) NOT NULL DEFAULT 'Standard',
                \`category\` varchar(100) NULL,
                \`damage\` varchar(100) NULL,
                \`range\` varchar(100) NULL,
                \`properties\` varchar(255) NULL,
                \`mastery\` varchar(100) NULL,
                \`weight\` float NOT NULL DEFAULT 0,
                \`cost\` float NULL,
                \`description\` text NOT NULL,
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_item_slug\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`item\``);
    }
}
