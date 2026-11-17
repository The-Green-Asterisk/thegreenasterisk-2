import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Associates links with a user and assigns all existing links to username 'lord.steve'.
 */
export class AddUserToLink1792792300000 implements MigrationInterface {
    name = 'AddUserToLink1792792300000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("link");
        if (!table) return;

        if (!table.findColumnByName("userId")) {
            await queryRunner.query("ALTER TABLE `link` ADD `userId` int NULL");
            await queryRunner.query("ALTER TABLE `link` ADD CONSTRAINT `FK_link_user` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        }

        await queryRunner.query(
            "UPDATE `link` SET `userId` = (SELECT `id` FROM `user` WHERE `username` = 'lord.steve' LIMIT 1) WHERE `userId` IS NULL"
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("link");
        if (!table || !table.findColumnByName("userId")) return;

        await queryRunner.query("ALTER TABLE `link` DROP FOREIGN KEY `FK_link_user`");
        await queryRunner.query("ALTER TABLE `link` DROP COLUMN `userId`");
    }
}
