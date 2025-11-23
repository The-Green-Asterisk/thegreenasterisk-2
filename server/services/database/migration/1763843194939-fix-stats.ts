import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStats1763843194939 implements MigrationInterface {
    name = 'FixStats1763843194939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stat\` ADD \`worldEntityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`stat\` ADD CONSTRAINT \`FK_5a108411cd1d0576437d639ffbc\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`stat\` DROP FOREIGN KEY \`FK_5a108411cd1d0576437d639ffbc\``);
        await queryRunner.query(`ALTER TABLE \`stat\` DROP COLUMN \`worldEntityId\``);
    }

}
