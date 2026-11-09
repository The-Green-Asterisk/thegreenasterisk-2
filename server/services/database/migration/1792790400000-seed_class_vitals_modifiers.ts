import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression, buildSubclassProgression } from "../rulesProgressionBuilder";
import { SEED_CLASSES } from "../rulesSeed";

/**
 * Re-seeds class and subclass progression with the modifiers the creator now reads instead of hard-coding classes:
 * Unarmored Defense per class (Barbarian DEX+CON with a shield, Monk DEX+WIS without), Fast Movement, Monk Unarmored
 * Movement, Ranger Roving, Draconic Resilience (AC and HP), Sea Druid Aquatic Affinity, and the Wild Heart spider
 * aspect's climb speed. Adds subclass scalingTraits (Battle Master maneuversByLevel) to the class's subclassesJson.
 */
export class SeedClassVitalsModifiers1792790400000 implements MigrationInterface {
    name = "SeedClassVitalsModifiers1792790400000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable("rule_classes")) {
            const rows: any[] = await queryRunner.query("SELECT `id`, `slug`, `isCustom`, `featuresJson`, `subclassesJson` FROM `rule_classes`");
            for (const row of rows) {
                if (row.isCustom) continue;
                const seed: any = (SEED_CLASSES as any[]).find((c) => c.id === String(row.slug || "").toLowerCase());
                if (!seed) continue;
                let features: any[] = [];
                let subs: any[] = [];
                try {
                    features = JSON.parse(row.featuresJson || "[]");
                } catch {
                    features = [];
                }
                try {
                    subs = JSON.parse(row.subclassesJson || "[]");
                } catch {
                    subs = [];
                }
                for (const sub of Array.isArray(subs) ? subs : []) {
                    const seedSub = (seed.subclasses || []).find((s: any) => s.id === sub?.id);
                    if (seedSub?.scalingTraits) sub.scalingTraits = seedSub.scalingTraits;
                }
                await queryRunner.query(
                    "UPDATE `rule_classes` SET `progressionJson` = ?, `subclassesJson` = ? WHERE `id` = ?",
                    [JSON.stringify(buildClassProgression(seed.id, Array.isArray(features) ? features : [])), JSON.stringify(subs), row.id]
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
