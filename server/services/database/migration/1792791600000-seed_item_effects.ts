import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_ITEM_MECHANICS } from "../itemMechanics";

/**
 * Fills item.modifiersJson for the stored items the seed list now covers (ability score items, protection items,
 * spellcasting foci, Luckstone, staves, Weapon of Warning, Sentinel Shield) that don't have their own. Their effects
 * used to be matched by name in the sheet's code.
 */
export class SeedItemEffects1792791600000 implements MigrationInterface {
    name = "SeedItemEffects1792791600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("item")) || !(await queryRunner.hasColumn("item", "modifiersJson"))) return;
        for (const seed of SEED_ITEM_MECHANICS) {
            await queryRunner.query(
                "UPDATE `item` SET `modifiersJson` = ? WHERE LOWER(`name`) = LOWER(?) AND `modifiersJson` IS NULL",
                [JSON.stringify(seed.modifiers), seed.name]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data seed: the previous (empty) values aren't kept
    }
}
