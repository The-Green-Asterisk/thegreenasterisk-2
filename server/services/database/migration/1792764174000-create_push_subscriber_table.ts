import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePushSubscriberTable1792764174000 implements MigrationInterface {
    name = 'CreatePushSubscriberTable1792764174000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`push_subscriber\` (\`id\` int NOT NULL AUTO_INCREMENT, \`endpoint\` text NOT NULL, \`p256dh\` varchar(255) NOT NULL, \`auth\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`push_subscriber\` ADD CONSTRAINT \`FK_push_subscriber_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`push_subscriber\` DROP FOREIGN KEY \`FK_push_subscriber_user\``);
        await queryRunner.query(`DROP TABLE \`push_subscriber\``);
    }

}
