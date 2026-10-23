import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePrDigestTable1792761659000 implements MigrationInterface {
    name = 'CreatePrDigestTable1792761659000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`pr_digest\` (\`id\` int NOT NULL AUTO_INCREMENT, \`payload\` longtext NOT NULL, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`pr_digest\``);
    }

}
