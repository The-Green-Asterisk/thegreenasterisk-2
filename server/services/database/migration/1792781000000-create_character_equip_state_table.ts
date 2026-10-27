import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCharacterEquipStateTable1792781000000 implements MigrationInterface {
    name = 'CreateCharacterEquipStateTable1792781000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`character_equip_state\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`characterId\` varchar(40) NOT NULL,
                \`scope\` varchar(20) NOT NULL,
                \`itemName\` varchar(255) NOT NULL,
                \`definitionId\` int NULL,
                \`equipped\` tinyint NOT NULL DEFAULT 0,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_character_equip_state_unique\` (\`characterId\`, \`scope\`, \`itemName\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS \`character_equip_state\`');
    }
}
