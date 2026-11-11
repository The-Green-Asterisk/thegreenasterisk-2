import { MigrationInterface, QueryRunner } from "typeorm";

// MySQL indexes each foreign key under the key's own name, which TypeORM expects, so there's no separate index
const TABLES = [
    { table: "spell", fk: "FK_spell_created_by_user" },
    { table: "item", fk: "FK_item_created_by_user" }
];

/**
 * Tracks who made a spell or item through the Add Custom dialogs, so they can edit it later.
 * Rows that already exist keep a null creator, which leaves them editable by admins only.
 */
export class AddCreatedByToSpellAndItem1792791900000 implements MigrationInterface {
    name = 'AddCreatedByToSpellAndItem1792791900000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const { table, fk } of TABLES) {
            const existing = await queryRunner.getTable(table);
            if (!existing || existing.findColumnByName("createdById")) continue;
            await queryRunner.query(`ALTER TABLE \`${table}\` ADD \`createdById\` int NULL`);
            await queryRunner.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${fk}\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        for (const { table, fk } of TABLES) {
            const existing = await queryRunner.getTable(table);
            if (!existing || !existing.findColumnByName("createdById")) continue;
            await queryRunner.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk}\``);
            await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`createdById\``);
        }
    }
}
