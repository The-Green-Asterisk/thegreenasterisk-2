import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfilePic1743359843258 implements MigrationInterface {
    name = 'AddProfilePic1743359843258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`profilePicture\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`profilePicture\``);
    }

}
