import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEpNum1753055671669 implements MigrationInterface {
    name = 'AddEpNum1753055671669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`you_tube_video\` ADD \`episodeNum\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tag\` CHANGE \`isActive\` \`isActive\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tag\` CHANGE \`isActive\` \`isActive\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`you_tube_video\` DROP COLUMN \`episodeNum\``);
    }

}
