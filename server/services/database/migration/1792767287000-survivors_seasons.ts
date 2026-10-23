import { MigrationInterface, QueryRunner } from "typeorm";

export class SurvivorsSeasons1792767287000 implements MigrationInterface {
    name = 'SurvivorsSeasons1792767287000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`you_tube_video\` ADD \`season\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`UPDATE \`you_tube_video\` SET \`season\` = 0 WHERE \`episodeNum\` = 0`);
        await queryRunner.query(`CREATE TABLE \`setting\` (\`name\` varchar(100) NOT NULL, \`value\` varchar(255) NOT NULL, PRIMARY KEY (\`name\`)) ENGINE=InnoDB`);
        await queryRunner.query(`INSERT INTO \`setting\` (\`name\`, \`value\`) VALUES ('survivors.currentSeason', '2')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`setting\``);
        await queryRunner.query(`ALTER TABLE \`you_tube_video\` DROP COLUMN \`season\``);
    }

}
