import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_GENERAL_FEATS, SEED_ORIGIN_FEATS } from "../rulesSeed";

/**
 * Adds rule_feats.skillPicksJson (the skills a feat lets the player choose: count, allowed skills, proficiency or
 * Expertise) and seeds it for Skilled, Skill Expert, Keen Mind, and Observant, which the creator and sheet used to
 * hard-code.
 */
export class AddFeatSkillPicks1792790700000 implements MigrationInterface {
    name = "AddFeatSkillPicks1792790700000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("rule_feats"))) return;
        if (!(await queryRunner.hasColumn("rule_feats", "skillPicksJson"))) {
            await queryRunner.query("ALTER TABLE `rule_feats` ADD `skillPicksJson` text NULL");
        }
        for (const feat of [...SEED_ORIGIN_FEATS, ...SEED_GENERAL_FEATS] as any[]) {
            if (!Array.isArray(feat.skillPicks)) continue;
            await queryRunner.query(
                "UPDATE `rule_feats` SET `skillPicksJson` = ? WHERE `slug` = ? AND `isCustom` = 0",
                [JSON.stringify(feat.skillPicks), feat.id]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("rule_feats", "skillPicksJson")) {
            await queryRunner.query("ALTER TABLE `rule_feats` DROP COLUMN `skillPicksJson`");
        }
    }
}
