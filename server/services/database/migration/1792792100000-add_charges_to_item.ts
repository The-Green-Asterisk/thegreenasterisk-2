import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds item.chargesJson: how many charges an item has and when they come back ({ max, resetOn, resetLabel? }), set
 * from the Edit Weapon / Magic Item dialogs and filled in from D&D Beyond pulls. Characters keep the charges they've
 * spent on their own copies.
 */
export class AddChargesToItem1792792100000 implements MigrationInterface {
    name = 'AddChargesToItem1792792100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        if ((await queryRunner.hasTable("item")) && !(await queryRunner.hasColumn("item", "chargesJson"))) {
            await queryRunner.query("ALTER TABLE `item` ADD `chargesJson` text NULL");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if ((await queryRunner.hasTable("item")) && (await queryRunner.hasColumn("item", "chargesJson"))) {
            await queryRunner.query("ALTER TABLE `item` DROP COLUMN `chargesJson`");
        }
    }
}
