import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDamageToSpellAndCharacterSpell1792791200000 implements MigrationInterface {
    name = "AddDamageToSpellAndCharacterSpell1792791200000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `spell` ADD COLUMN `damageDice` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `spell` ADD COLUMN `damageType` varchar(100) NULL");
        await queryRunner.query("ALTER TABLE `spell` ADD COLUMN `damageModifier` varchar(100) NULL");
        await queryRunner.query("ALTER TABLE `spell` ADD COLUMN `damageScaling` text NULL");

        await queryRunner.query("ALTER TABLE `character_spell` ADD COLUMN `damageDice` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `character_spell` ADD COLUMN `damageType` varchar(100) NULL");
        await queryRunner.query("ALTER TABLE `character_spell` ADD COLUMN `damageModifier` varchar(100) NULL");
        await queryRunner.query("ALTER TABLE `character_spell` ADD COLUMN `damageScaling` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `spell` DROP COLUMN `damageDice`");
        await queryRunner.query("ALTER TABLE `spell` DROP COLUMN `damageType`");
        await queryRunner.query("ALTER TABLE `spell` DROP COLUMN `damageModifier`");
        await queryRunner.query("ALTER TABLE `spell` DROP COLUMN `damageScaling`");

        await queryRunner.query("ALTER TABLE `character_spell` DROP COLUMN `damageDice`");
        await queryRunner.query("ALTER TABLE `character_spell` DROP COLUMN `damageType`");
        await queryRunner.query("ALTER TABLE `character_spell` DROP COLUMN `damageModifier`");
        await queryRunner.query("ALTER TABLE `character_spell` DROP COLUMN `damageScaling`");
    }
}
