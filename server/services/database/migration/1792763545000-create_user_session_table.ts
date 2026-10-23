import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserSessionTable1792763545000 implements MigrationInterface {
    name = 'CreateUserSessionTable1792763545000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_session\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tokenHash\` varchar(64) NOT NULL, \`expiresAt\` timestamp NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`IDX_user_session_tokenHash\` (\`tokenHash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_session\` ADD CONSTRAINT \`FK_user_session_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_session\` DROP FOREIGN KEY \`FK_user_session_user\``);
        await queryRunner.query(`DROP TABLE \`user_session\``);
    }

}
