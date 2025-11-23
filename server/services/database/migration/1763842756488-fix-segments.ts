import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSegments1763842756488 implements MigrationInterface {
    name = 'FixSegments1763842756488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category_world_entities_world_entity\` (\`categoryId\` int NOT NULL, \`worldEntityId\` int NOT NULL, INDEX \`IDX_a1bfe838ca0ce1bb2003749dd2\` (\`categoryId\`), INDEX \`IDX_cd3f9672512b6858f43c6d0b28\` (\`worldEntityId\`), PRIMARY KEY (\`categoryId\`, \`worldEntityId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`segment\` ADD \`worldEntityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`segment\` ADD CONSTRAINT \`FK_859b7f346ed04270341c7a26088\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_world_entities_world_entity\` ADD CONSTRAINT \`FK_a1bfe838ca0ce1bb2003749dd2c\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`category_world_entities_world_entity\` ADD CONSTRAINT \`FK_cd3f9672512b6858f43c6d0b28a\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`category_world_entities_world_entity\` DROP FOREIGN KEY \`FK_cd3f9672512b6858f43c6d0b28a\``);
        await queryRunner.query(`ALTER TABLE \`category_world_entities_world_entity\` DROP FOREIGN KEY \`FK_a1bfe838ca0ce1bb2003749dd2c\``);
        await queryRunner.query(`ALTER TABLE \`segment\` DROP FOREIGN KEY \`FK_859b7f346ed04270341c7a26088\``);
        await queryRunner.query(`ALTER TABLE \`segment\` DROP COLUMN \`worldEntityId\``);
        await queryRunner.query(`DROP INDEX \`IDX_cd3f9672512b6858f43c6d0b28\` ON \`category_world_entities_world_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_a1bfe838ca0ce1bb2003749dd2\` ON \`category_world_entities_world_entity\``);
        await queryRunner.query(`DROP TABLE \`category_world_entities_world_entity\``);
    }

}
