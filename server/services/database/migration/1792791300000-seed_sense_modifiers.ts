import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression, buildSubclassProgression } from "../rulesProgressionBuilder";
import { SEED_CLASSES } from "../rulesSeed";

/**
 * Re-seeds class and subclass progression for special senses read from rules data: the Devil's Sight invocation sets
 * the Devil's Sight sense (vitals.devilsSight) instead of adding darkvision, and the Diviner's Third Eye darkvision
 * sets a range ("set") rather than extending one ("bonus" now means farther, as with Umbral Sight).
 */
export class SeedSenseModifiers1792791300000 implements MigrationInterface {
    name = "SeedSenseModifiers1792791300000";

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
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: the previous values aren't kept
    }
}
