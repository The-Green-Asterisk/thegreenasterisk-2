import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSavedCharacterTable1792782000000 implements MigrationInterface {
    name = 'CreateSavedCharacterTable1792782000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`saved_character\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`externalCharacterId\` varchar(40) NULL,
                \`payload\` longtext NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX \`IDX_saved_character_user_name\` (\`userId\`, \`name\`),
                CONSTRAINT \`FK_saved_character_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS \`saved_character\`');
    }
}
