import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideo1752639088552 implements MigrationInterface {
    name = 'AddVideo1752639088552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`you_tube_video\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`videoId\` varchar(255) NOT NULL, \`embedUrl\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`you_tube_video\``);
    }

}
