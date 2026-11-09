import { MigrationInterface, QueryRunner } from "typeorm";

export class AddViaFeatureToCharacterSpell1792790100000 implements MigrationInterface {
    name = "AddViaFeatureToCharacterSpell1792790100000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `character_spell` ADD COLUMN `viaFeature` varchar(100) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `character_spell` DROP COLUMN `viaFeature`");
    }
}
