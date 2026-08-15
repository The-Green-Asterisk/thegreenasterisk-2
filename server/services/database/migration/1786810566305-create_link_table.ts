import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLinkTable1786810566305 implements MigrationInterface {
    name = 'CreateLinkTable1786810566305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`link\` (\`id\` int NOT NULL AUTO_INCREMENT, \`url\` varchar(255) NOT NULL, \`iconClass\` varchar(255) NOT NULL, \`imageUrl\` varchar(255) NOT NULL, \`text\` varchar(255) NOT NULL, \`primaryType\` tinyint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`link\``);
    }

}
