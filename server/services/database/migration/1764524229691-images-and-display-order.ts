import { MigrationInterface, QueryRunner } from "typeorm";

export class ImagesAndDisplayOrder1764524229691 implements MigrationInterface {
    name = 'ImagesAndDisplayOrder1764524229691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`segment\` ADD \`displayOrder\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`world_entity\` ADD \`entityImgUrl\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`world_entity\` DROP COLUMN \`entityImgUrl\``);
        await queryRunner.query(`ALTER TABLE \`segment\` DROP COLUMN \`displayOrder\``);
    }

}
