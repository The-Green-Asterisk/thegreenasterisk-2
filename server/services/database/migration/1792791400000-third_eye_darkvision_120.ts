import { MigrationInterface, QueryRunner } from "typeorm";
import { buildSubclassProgression } from "../rulesProgressionBuilder";
import { SEED_CLASSES } from "../rulesSeed";

/** Re-seeds the Wizard's subclasses: the Diviner's Third Eye gives Darkvision with a range of 120 feet (2024 rules). */
export class ThirdEyeDarkvision1201792791400000 implements MigrationInterface {
    name = "ThirdEyeDarkvision1201792791400000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("rule_subclasses"))) return;
        const wizard: any = (SEED_CLASSES as any[]).find((c) => c.id === "wizard");
        for (const sub of wizard?.subclasses || []) {
            await queryRunner.query(
                "UPDATE `rule_subclasses` SET `progressionJson` = ? WHERE `slug` = ? AND `classSlug` = 'wizard' AND `isCustom` = 0",
                [JSON.stringify(buildSubclassProgression("wizard", sub)), sub.id]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: the previous values aren't kept
    }
}
