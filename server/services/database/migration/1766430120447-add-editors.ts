import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEditors1766430120447 implements MigrationInterface {
    name = 'AddEditors1766430120447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`world_entity_editors_user\` (\`worldEntityId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_1e68b6125df678e35a3ac631c0\` (\`worldEntityId\`), INDEX \`IDX_8b277735faba3a1f83af3e0063\` (\`userId\`), PRIMARY KEY (\`worldEntityId\`, \`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`world_entity_editors_user\` ADD CONSTRAINT \`FK_1e68b6125df678e35a3ac631c02\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_editors_user\` ADD CONSTRAINT \`FK_8b277735faba3a1f83af3e00638\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`world_entity_editors_user\` DROP FOREIGN KEY \`FK_8b277735faba3a1f83af3e00638\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_editors_user\` DROP FOREIGN KEY \`FK_1e68b6125df678e35a3ac631c02\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b277735faba3a1f83af3e0063\` ON \`world_entity_editors_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_1e68b6125df678e35a3ac631c0\` ON \`world_entity_editors_user\``);
        await queryRunner.query(`DROP TABLE \`world_entity_editors_user\``);
    }

}
