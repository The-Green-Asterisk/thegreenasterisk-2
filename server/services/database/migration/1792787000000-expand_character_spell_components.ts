import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandCharacterSpellComponents1792787000000 implements MigrationInterface {
    name = 'ExpandCharacterSpellComponents1792787000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`components\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`castingTime\` varchar(255) NOT NULL DEFAULT '1 Action'`);
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`range\` varchar(255) NOT NULL DEFAULT 'Touch'`);
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`duration\` varchar(255) NOT NULL DEFAULT 'Instantaneous'`);

        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`components\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`castingTime\` varchar(255) NOT NULL DEFAULT '1 Action'`);
        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`range\` varchar(255) NOT NULL DEFAULT 'Self'`);
        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`duration\` varchar(255) NOT NULL DEFAULT 'Instantaneous'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`components\` varchar(50) NOT NULL DEFAULT 'V, S'`);
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`castingTime\` varchar(50) NOT NULL DEFAULT '1 Action'`);
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`range\` varchar(50) NOT NULL DEFAULT 'Touch'`);
        await queryRunner.query(`ALTER TABLE \`character_spell\` MODIFY COLUMN \`duration\` varchar(100) NOT NULL DEFAULT 'Instantaneous'`);

        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`components\` varchar(255) NOT NULL DEFAULT 'V, S'`);
        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`castingTime\` varchar(150) NOT NULL DEFAULT '1 Action'`);
        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`range\` varchar(150) NOT NULL DEFAULT 'Self'`);
        await queryRunner.query(`ALTER TABLE \`spell\` MODIFY COLUMN \`duration\` varchar(150) NOT NULL DEFAULT 'Instantaneous'`);
    }
}
