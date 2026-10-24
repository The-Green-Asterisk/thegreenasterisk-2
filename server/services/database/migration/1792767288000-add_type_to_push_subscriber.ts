import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTypeToPushSubscriber1792767288000 implements MigrationInterface {
    name = 'AddTypeToPushSubscriber1792767288000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`push_subscriber\` ADD \`type\` varchar(50) NOT NULL DEFAULT 'pr-digest'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`push_subscriber\` DROP COLUMN \`type\``);
    }
}
