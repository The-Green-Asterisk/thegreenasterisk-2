import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds customizable links page title and description columns to user,
 * and populates the existing defaults for username 'lord.steve'.
 */
export class AddLinksHeaderToUser1792792400000 implements MigrationInterface {
    name = 'AddLinksHeaderToUser1792792400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("user");
        if (!table) return;

        if (!table.findColumnByName("linksTitle")) {
            await queryRunner.query("ALTER TABLE `user` ADD `linksTitle` varchar(255) NULL");
        }
        if (!table.findColumnByName("linksDescription")) {
            await queryRunner.query("ALTER TABLE `user` ADD `linksDescription` text NULL");
        }

        await queryRunner.query(
            "UPDATE `user` SET `linksTitle` = ?, `linksDescription` = ? WHERE `username` = 'lord.steve' AND `linksTitle` IS NULL AND `linksDescription` IS NULL",
            [
                "Lord Steve's Links",
                "You succeeded in your investigation roll. You now know where to find Lord Steve. Use this knowledge cautiously."
            ]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("user");
        if (!table) return;

        if (table.findColumnByName("linksDescription")) {
            await queryRunner.query("ALTER TABLE `user` DROP COLUMN `linksDescription`");
        }
        if (table.findColumnByName("linksTitle")) {
            await queryRunner.query("ALTER TABLE `user` DROP COLUMN `linksTitle`");
        }
    }
}
