import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToItemAndSpell1792780000000 implements MigrationInterface {
    name = 'AddImageUrlToItemAndSpell1792780000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add imageUrl to item if not exists
        const itemColumns = await queryRunner.getTable('item');
        if (itemColumns && !itemColumns.findColumnByName('imageUrl')) {
            await queryRunner.query(`ALTER TABLE \`item\` ADD \`imageUrl\` varchar(500) NULL`);
        }

        // Add imageUrl to spell if not exists
        const spellColumns = await queryRunner.getTable('spell');
        if (spellColumns && !spellColumns.findColumnByName('imageUrl')) {
            await queryRunner.query(`ALTER TABLE \`spell\` ADD \`imageUrl\` varchar(500) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const itemColumns = await queryRunner.getTable('item');
        if (itemColumns && itemColumns.findColumnByName('imageUrl')) {
            await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`imageUrl\``);
        }

        const spellColumns = await queryRunner.getTable('spell');
        if (spellColumns && spellColumns.findColumnByName('imageUrl')) {
            await queryRunner.query(`ALTER TABLE \`spell\` DROP COLUMN \`imageUrl\``);
        }
    }
}
