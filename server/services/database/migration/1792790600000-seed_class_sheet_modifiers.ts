import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression, buildSubclassProgression, CLASS_SCALING_TRAITS_2024 } from "../rulesProgressionBuilder";
import { SEED_CLASSES } from "../rulesSeed";

/**
 * Re-seeds class and subclass progression with the data the character sheet now reads instead of hard-coding
 * classes: Disciplined Survivor save proficiency, Aura of Protection's +1 minimum, Dazzling Footwork AC, Dread
 * Ambusher Initiative, the Cosmic Omen reaction and resource, Second Wind's healing die, Battle Master Superiority
 * Dice, Glamour and Great Old One once-per-rest uses, resource aliases and feature scale values (Cutting Words uses the
 * Bardic Inspiration die, Dark One's Blessing), and the keys and option ids
 * the sheet saved choices under before reading them from the class rules (legacyKeys, legacyIds). Merges the Monk's
 * martialArtsDieByLevel into scalingTraitsJson.
 */
export class SeedClassSheetModifiers1792790600000 implements MigrationInterface {
    name = "SeedClassSheetModifiers1792790600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable("rule_classes")) {
            const rows: any[] = await queryRunner.query("SELECT `id`, `slug`, `isCustom`, `featuresJson`, `scalingTraitsJson` FROM `rule_classes`");
            for (const row of rows) {
                if (row.isCustom) continue;
                const seed: any = (SEED_CLASSES as any[]).find((c) => c.id === String(row.slug || "").toLowerCase());
                if (!seed) continue;
                let features: any[] = [];
                let scaling: any = {};
                try {
                    features = JSON.parse(row.featuresJson || "[]");
                } catch {
                    features = [];
                }
                try {
                    scaling = JSON.parse(row.scalingTraitsJson || "{}") || {};
                } catch {
                    scaling = {};
                }
                const martialArtsDieByLevel = CLASS_SCALING_TRAITS_2024[seed.id]?.martialArtsDieByLevel;
                if (martialArtsDieByLevel) scaling.martialArtsDieByLevel = martialArtsDieByLevel;
                await queryRunner.query(
                    "UPDATE `rule_classes` SET `progressionJson` = ?, `scalingTraitsJson` = ? WHERE `id` = ?",
                    [JSON.stringify(buildClassProgression(seed.id, Array.isArray(features) ? features : [])), JSON.stringify(scaling), row.id]
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
