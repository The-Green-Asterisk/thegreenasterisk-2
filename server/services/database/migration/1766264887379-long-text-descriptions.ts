import { MigrationInterface, QueryRunner } from "typeorm";

export class LongTextDescriptions1766264887379 implements MigrationInterface {
    name = 'LongTextDescriptions1766264887379'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`segment\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`segment\` ADD \`description\` longtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`world_entity\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`world_entity\` ADD \`description\` longtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`content\` longtext NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`content\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`world_entity\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`world_entity\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`segment\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`segment\` ADD \`description\` varchar(255) NOT NULL`);
    }

}
