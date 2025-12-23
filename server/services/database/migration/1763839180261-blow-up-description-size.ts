import { MigrationInterface, QueryRunner } from "typeorm";

export class BlowUpDescriptionSize1763839180261 implements MigrationInterface {
    name = 'BlowUpDescriptionSize1763839180261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`world\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`world\` ADD \`description\` longtext NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`world\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`world\` ADD \`description\` varchar(255) NOT NULL`);
    }

}
