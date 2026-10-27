import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSiteCharacterIdToSavedCharacter1792783000000 implements MigrationInterface {
    name = 'AddSiteCharacterIdToSavedCharacter1792783000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('saved_character');
        if (!table) return;

        const hasSiteCharacterId = !!table.findColumnByName('siteCharacterId');
        const hasSource = !!table.findColumnByName('source');

        if (!hasSiteCharacterId) {
            await queryRunner.query("ALTER TABLE `saved_character` ADD `siteCharacterId` varchar(32) NULL");
            await queryRunner.query("UPDATE `saved_character` SET `siteCharacterId` = CONCAT('tga-', LOWER(SUBSTRING(MD5(CONCAT('saved-', `id`)), 1, 12))) WHERE `siteCharacterId` IS NULL OR `siteCharacterId` = ''");
            await queryRunner.query("ALTER TABLE `saved_character` MODIFY `siteCharacterId` varchar(32) NOT NULL");
            await queryRunner.query("CREATE UNIQUE INDEX `IDX_saved_character_siteCharacterId` ON `saved_character` (`siteCharacterId`)");
        }

        if (!hasSource) {
            await queryRunner.query("ALTER TABLE `saved_character` ADD `source` varchar(20) NOT NULL DEFAULT 'site'");
            await queryRunner.query("UPDATE `saved_character` SET `source` = CASE WHEN `externalCharacterId` IS NOT NULL AND `externalCharacterId` <> '' THEN 'dndbeyond' ELSE 'site' END");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('saved_character');
        if (!table) return;

        if (table.findColumnByName('source')) {
            await queryRunner.query("ALTER TABLE `saved_character` DROP COLUMN `source`");
        }

        if (table.findColumnByName('siteCharacterId')) {
            const index = table.indices.find(i => i.name === 'IDX_saved_character_siteCharacterId');
            if (index) {
                await queryRunner.query("DROP INDEX `IDX_saved_character_siteCharacterId` ON `saved_character`");
            }
            await queryRunner.query("ALTER TABLE `saved_character` DROP COLUMN `siteCharacterId`");
        }
    }
}
