import { MigrationInterface, QueryRunner } from "typeorm";
import { featMechanicsJson } from "../featMechanics";
import { SEED_GENERAL_FEATS, SEED_ORIGIN_FEATS } from "../rulesSeed";

/**
 * Re-seeds rule_feats.mechanicsJson from the seed feats, picking up feat choices with no stat effect (Elemental
 * Adept's damage type) that the sheet used to treat as a damage resistance.
 */
export class ReseedFeatMechanics1792791000000 implements MigrationInterface {
    name = "ReseedFeatMechanics1792791000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("rule_feats")) || !(await queryRunner.hasColumn("rule_feats", "mechanicsJson"))) return;
        for (const feat of [...SEED_ORIGIN_FEATS, ...SEED_GENERAL_FEATS] as any[]) {
            const json = featMechanicsJson(feat);
            if (!json) continue;
            await queryRunner.query("UPDATE `rule_feats` SET `mechanicsJson` = ? WHERE `slug` = ? AND `isCustom` = 0", [json, feat.id]);
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: the previous values aren't kept
    }
}
