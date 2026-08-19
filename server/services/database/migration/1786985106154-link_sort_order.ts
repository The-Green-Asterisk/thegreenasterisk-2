import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkSortOrder1786985106154 implements MigrationInterface {
    name = 'LinkSortOrder1786985106154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`link\` ADD \`sortOrder\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`link\` DROP COLUMN \`sortOrder\``);
    }

}
