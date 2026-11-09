import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBardMagicalSecretsSchema1792789700000 implements MigrationInterface {
    name = "UpdateBardMagicalSecretsSchema1792789700000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (hasRuleClasses) {
            const bardRows: any[] = await queryRunner.query(
                "SELECT * FROM `rule_classes` WHERE `slug` = 'bard' LIMIT 1"
            );

            if (bardRows && bardRows.length > 0) {
                const bardRow = bardRows[0];
                let spellcasting: any = {};
                try {
                    spellcasting = JSON.parse(bardRow.spellcastingJson || "{}");
                } catch {
                    spellcasting = {};
                }

                spellcasting.expandedSpellLists = [
                    {
                        level: 10,
                        feature: "Magical Secrets",
                        classes: ["Cleric", "Druid", "Wizard"]
                    }
                ];

                await queryRunner.query(
                    "UPDATE `rule_classes` SET `spellcastingJson` = ? WHERE `id` = ?",
                    [JSON.stringify(spellcasting), bardRow.id]
                );
            }
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Safe no-op
    }
}
