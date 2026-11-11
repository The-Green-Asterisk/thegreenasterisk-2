import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Lets spell and item edits reach the characters that have them, and lets those edits survive D&D Beyond:
 * - character_spell.spellId / character_inventory_item.itemId link each character's copy to its spell or item,
 *   backfilled by name for the copies saved before this
 * - character_spell.locked / character_inventory_item.locked keep one character's copy exactly as it is
 * - spell.lockedFields / item.lockedFields hold the fields an edit locked against D&D Beyond reloads
 */
const LINKS = [
    { table: "character_spell", column: "spellId", target: "spell", fk: "FK_character_spell_spell" },
    { table: "character_inventory_item", column: "itemId", target: "item", fk: "FK_character_item_item" }
];

export class LinkCharacterCopiesAndLocks1792792000000 implements MigrationInterface {
    name = 'LinkCharacterCopiesAndLocks1792792000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const table of ["spell", "item"]) {
            const existing = await queryRunner.getTable(table);
            if (existing && !existing.findColumnByName("lockedFields")) {
                await queryRunner.query(`ALTER TABLE \`${table}\` ADD \`lockedFields\` text NULL`);
            }
        }

        for (const { table, column, target, fk } of LINKS) {
            const existing = await queryRunner.getTable(table);
            if (!existing) continue;
            if (!existing.findColumnByName("locked")) {
                await queryRunner.query(`ALTER TABLE \`${table}\` ADD \`locked\` tinyint NOT NULL DEFAULT 0`);
            }
            if (!existing.findColumnByName(column)) {
                await queryRunner.query(`ALTER TABLE \`${table}\` ADD \`${column}\` int NULL`);
                await queryRunner.query(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${fk}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${target}\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
                await queryRunner.query(`UPDATE \`${table}\` c JOIN \`${target}\` d ON d.\`name\` = c.\`name\` SET c.\`${column}\` = d.\`id\` WHERE c.\`${column}\` IS NULL`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        for (const { table, column, fk } of LINKS) {
            const existing = await queryRunner.getTable(table);
            if (!existing) continue;
            if (existing.findColumnByName(column)) {
                await queryRunner.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk}\``);
                await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
            }
            if (existing.findColumnByName("locked")) {
                await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`locked\``);
            }
        }

        for (const table of ["spell", "item"]) {
            const existing = await queryRunner.getTable(table);
            if (existing?.findColumnByName("lockedFields")) {
                await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`lockedFields\``);
            }
        }
    }
}
