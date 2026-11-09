import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowBardMagicalSecretsCantrips1792790000000 implements MigrationInterface {
    name = "AllowBardMagicalSecretsCantrips1792790000000";

    private async setAllowCantrips(queryRunner: QueryRunner, allow: boolean): Promise<void> {
        if (!(await queryRunner.hasTable("rule_classes"))) return;
        const rows: any[] = await queryRunner.query("SELECT `id`, `spellcastingJson` FROM `rule_classes` WHERE `slug` = 'bard'");
        for (const row of rows) {
            let spellcasting: any;
            try {
                spellcasting = JSON.parse(row.spellcastingJson || "{}");
            } catch {
                continue;
            }
            if (!Array.isArray(spellcasting.expandedSpellLists)) continue;
            for (const exp of spellcasting.expandedSpellLists) {
                if (exp?.feature === "Magical Secrets") exp.allowCantrips = allow;
            }
            await queryRunner.query("UPDATE `rule_classes` SET `spellcastingJson` = ? WHERE `id` = ?", [JSON.stringify(spellcasting), row.id]);
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.setAllowCantrips(queryRunner, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.setAllowCantrips(queryRunner, false);
    }
}
