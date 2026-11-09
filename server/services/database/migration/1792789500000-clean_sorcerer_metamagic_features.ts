import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression } from "../rulesProgressionBuilder";

export class CleanSorcererMetamagicFeatures1792789500000 implements MigrationInterface {
    name = "CleanSorcererMetamagicFeatures1792789500000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (!hasRuleClasses) return;

        const sorcererRows: any[] = await queryRunner.query(
            "SELECT * FROM `rule_classes` WHERE `slug` = 'sorcerer' LIMIT 1"
        );

        if (sorcererRows && sorcererRows.length > 0) {
            const sorcererRow = sorcererRows[0];
            let features: any[] = [];
            try {
                features = JSON.parse(sorcererRow.featuresJson || "[]");
            } catch {
                features = [];
            }

            const cleanedFeatures = features.filter((f: any) => {
                const lower = String(f.name || "").trim().toLowerCase();
                if (lower === "metamagic (additional option)" || lower === "metamagic options") {
                    return false;
                }
                return true;
            });

            const updatedProgressionJson = JSON.stringify(buildClassProgression("sorcerer", cleanedFeatures));

            await queryRunner.query(
                "UPDATE `rule_classes` SET `featuresJson` = ?, `progressionJson` = ? WHERE `id` = ?",
                [JSON.stringify(cleanedFeatures), updatedProgressionJson, sorcererRow.id]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Safe no-op
    }
}
