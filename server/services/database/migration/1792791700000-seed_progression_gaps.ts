import { MigrationInterface, QueryRunner } from "typeorm";
import { featMechanicsJson } from "../featMechanics";
import { buildClassProgression, buildSubclassProgression } from "../rulesProgressionBuilder";
import { SEED_CLASSES, SEED_GENERAL_FEATS } from "../rulesSeed";

/**
 * Re-seeds class and subclass progression for progression gaps: Defense fighting style's vitals.ac bonus
 * gains requires: "armor", Barbarian aspects gain Panther and Pike climb/swim speeds, and Athlete feat gains
 * vitals.climb speed mechanics.
 */
export class SeedProgressionGaps1792791700000 implements MigrationInterface {
    name = "SeedProgressionGaps1792791700000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable("rule_classes")) {
            const rows: any[] = await queryRunner.query("SELECT `id`, `slug`, `isCustom`, `featuresJson` FROM `rule_classes`");
            for (const row of rows) {
                if (row.isCustom) continue;
                const seed: any = (SEED_CLASSES as any[]).find((c) => c.id === String(row.slug || "").toLowerCase());
                if (!seed) continue;
                let features: any[] = [];
                try {
                    features = JSON.parse(row.featuresJson || "[]");
                } catch {
                    features = [];
                }
                await queryRunner.query(
                    "UPDATE `rule_classes` SET `progressionJson` = ? WHERE `id` = ?",
                    [JSON.stringify(buildClassProgression(seed.id, Array.isArray(features) ? features : [])), row.id]
                );
            }
        }
        if (await queryRunner.hasTable("rule_subclasses")) {
            for (const cls of SEED_CLASSES as any[]) {
                for (const sub of cls.subclasses || []) {
                    await queryRunner.query(
                        "UPDATE `rule_subclasses` SET `progressionJson` = ? WHERE `slug` = ? AND `classSlug` = ? AND `isCustom` = 0",
                        [JSON.stringify(buildSubclassProgression(cls.id, sub)), sub.id, cls.id]
                    );
                }
            }
        }
        if ((await queryRunner.hasTable("rule_feats")) && (await queryRunner.hasColumn("rule_feats", "mechanicsJson"))) {
            const athlete = (SEED_GENERAL_FEATS as any[]).find((f) => f.id === "athlete");
            if (athlete) {
                const json = featMechanicsJson(athlete);
                if (json) {
                    await queryRunner.query(
                        "UPDATE `rule_feats` SET `mechanicsJson` = ? WHERE `slug` = 'athlete' AND `isCustom` = 0",
                        [json]
                    );
                }
            }
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: previous values aren't kept
    }
}
