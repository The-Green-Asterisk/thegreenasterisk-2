import { MigrationInterface, QueryRunner } from "typeorm";
import { featMechanicsJson } from "../featMechanics";
import { SEED_GENERAL_FEATS, SEED_ORIGIN_FEATS } from "../rulesSeed";

/**
 * Adds rule_feats.mechanicsJson (modifiers, resource, display-only uses, spell list and default ability) and seeds it
 * for the feats the creator and sheet used to key on by name: Alert, Tough, Lucky, Magic Initiate, Speedy, Boon of
 * Speed, Boon of Truesight, Skulker, Medium Armor Master, War Caster, Fey Touched, and Shadow Touched.
 */
export class AddFeatMechanics1792790900000 implements MigrationInterface {
    name = "AddFeatMechanics1792790900000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("rule_feats"))) return;
        if (!(await queryRunner.hasColumn("rule_feats", "mechanicsJson"))) {
            await queryRunner.query("ALTER TABLE `rule_feats` ADD `mechanicsJson` text NULL");
        }
        for (const feat of [...SEED_ORIGIN_FEATS, ...SEED_GENERAL_FEATS] as any[]) {
            const json = featMechanicsJson(feat);
            if (!json) continue;
            await queryRunner.query("UPDATE `rule_feats` SET `mechanicsJson` = ? WHERE `slug` = ? AND `isCustom` = 0", [json, feat.id]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("rule_feats", "mechanicsJson")) {
            await queryRunner.query("ALTER TABLE `rule_feats` DROP COLUMN `mechanicsJson`");
        }
    }
}
