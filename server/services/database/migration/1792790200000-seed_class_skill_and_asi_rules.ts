import { MigrationInterface, QueryRunner } from "typeorm";
import { CLASS_SCALING_TRAITS_2024, DND_BEYOND_2024_CLASS_IDS, buildClassProgression } from "../rulesProgressionBuilder";
import { SEED_CLASSES } from "../rulesSeed";

/**
 * Re-seeds the class rules the creator now reads instead of hard-coding:
 *  - scalingTraitsJson: asiLevels, epicBoonLevel, expertiseByLevel (merged over what's stored)
 *  - skillChoicesJson: seed skill lists (adds Persuasion to Fighter)
 *  - progressionJson: rebuilt, picking up the Jack of All Trades modifier, the +1 minimum on Thaumaturge / Magician,
 *    and Medicine as a Wizard Scholar option
 *  - dndBeyondId: D&D Beyond's 2024 class ids, used to fetch class spell lists
 */
export class SeedClassSkillAndAsiRules1792790200000 implements MigrationInterface {
    name = "SeedClassSkillAndAsiRules1792790200000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("rule_classes"))) return;
        const rows: any[] = await queryRunner.query(
            "SELECT `id`, `slug`, `isCustom`, `featuresJson`, `scalingTraitsJson` FROM `rule_classes`"
        );
        for (const row of rows) {
            if (row.isCustom) continue;
            const slug = String(row.slug || "").toLowerCase();
            const seed = SEED_CLASSES.find((c) => c.id === slug);
            if (!seed) continue;

            let scaling: Record<string, any> = {};
            try {
                scaling = JSON.parse(row.scalingTraitsJson || "{}") || {};
            } catch {
                scaling = {};
            }
            const mergedScaling = { ...scaling, ...(CLASS_SCALING_TRAITS_2024[slug] || {}) };

            let features: any[] = [];
            try {
                features = JSON.parse(row.featuresJson || "[]");
            } catch {
                features = [];
            }
            const progression = buildClassProgression(slug, Array.isArray(features) ? features : []);

            await queryRunner.query(
                "UPDATE `rule_classes` SET `scalingTraitsJson` = ?, `skillChoicesJson` = ?, `progressionJson` = ?, `dndBeyondId` = ? WHERE `id` = ?",
                [
                    JSON.stringify(mergedScaling),
                    JSON.stringify(seed.skillChoices),
                    JSON.stringify(progression),
                    DND_BEYOND_2024_CLASS_IDS[slug] ?? null,
                    row.id
                ]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: nothing to undo structurally, and the previous values aren't kept
    }
}
