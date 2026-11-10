import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_ITEM_MECHANICS } from "../itemMechanics";

/**
 * Adds item.modifiersJson (rules modifiers an item gives while equipped, e.g. special senses) and fills it for the
 * stored items the seed list covers (Goggles of Night, Robe of Eyes) that don't have their own.
 */
export class AddItemModifiers1792791500000 implements MigrationInterface {
    name = "AddItemModifiers1792791500000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("item"))) return;
        if (!(await queryRunner.hasColumn("item", "modifiersJson"))) {
            await queryRunner.query("ALTER TABLE `item` ADD `modifiersJson` text NULL");
        }
        for (const seed of SEED_ITEM_MECHANICS) {
            await queryRunner.query(
                "UPDATE `item` SET `modifiersJson` = ? WHERE LOWER(`name`) = LOWER(?) AND `modifiersJson` IS NULL",
                [JSON.stringify(seed.modifiers), seed.name]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if ((await queryRunner.hasTable("item")) && (await queryRunner.hasColumn("item", "modifiersJson"))) {
            await queryRunner.query("ALTER TABLE `item` DROP COLUMN `modifiersJson`");
        }
    }
}
