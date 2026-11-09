import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { MULTICLASS_DATA_2024, CLASS_SCALING_TRAITS_2024 } from "../rulesProgressionBuilder";

export class AddMulticlassingAndScalingTraitsToRuleClasses1792789800000 implements MigrationInterface {
    name = "AddMulticlassingAndScalingTraitsToRuleClasses1792789800000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (hasRuleClasses) {
            const classTable = await queryRunner.getTable("rule_classes");
            if (classTable && !classTable.findColumnByName("multiclassingJson")) {
                await queryRunner.addColumn(
                    "rule_classes",
                    new TableColumn({
                        name: "multiclassingJson",
                        type: "text",
                        isNullable: true
                    })
                );
            }

            if (classTable && !classTable.findColumnByName("scalingTraitsJson")) {
                await queryRunner.addColumn(
                    "rule_classes",
                    new TableColumn({
                        name: "scalingTraitsJson",
                        type: "text",
                        isNullable: true
                    })
                );
            }

            const rows: any[] = await queryRunner.query("SELECT `id`, `slug` FROM `rule_classes`");
            for (const row of rows || []) {
                const slug = String(row.slug || "").toLowerCase();
                const mc = MULTICLASS_DATA_2024[slug];
                const st = CLASS_SCALING_TRAITS_2024[slug];
                await queryRunner.query(
                    "UPDATE `rule_classes` SET `multiclassingJson` = ?, `scalingTraitsJson` = ? WHERE `id` = ?",
                    [mc ? JSON.stringify(mc) : null, st ? JSON.stringify(st) : null, row.id]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (hasRuleClasses) {
            const classTable = await queryRunner.getTable("rule_classes");
            if (classTable && classTable.findColumnByName("multiclassingJson")) {
                await queryRunner.dropColumn("rule_classes", "multiclassingJson");
            }
            if (classTable && classTable.findColumnByName("scalingTraitsJson")) {
                await queryRunner.dropColumn("rule_classes", "scalingTraitsJson");
            }
        }
    }
}
