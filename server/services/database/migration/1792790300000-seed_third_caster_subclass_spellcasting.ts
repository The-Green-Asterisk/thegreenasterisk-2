import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_CLASSES } from "../rulesSeed";

/**
 * Seeds the spellcasting subclasses grant to classes without their own (Eldritch Knight, Arcane Trickster): ability,
 * caster type, spell list, and cantrip / prepared spell / spell slot tables, in both rule_subclasses and the class's
 * subclassesJson. The creator and sheet read these instead of hard-coding the subclasses.
 */
export class SeedThirdCasterSubclassSpellcasting1792790300000 implements MigrationInterface {
    name = "SeedThirdCasterSubclassSpellcasting1792790300000";

    private seedOverrides(): Array<{ classSlug: string; subSlug: string; override: any }> {
        const list: Array<{ classSlug: string; subSlug: string; override: any }> = [];
        for (const cls of SEED_CLASSES as any[]) {
            for (const sub of cls.subclasses || []) {
                if (sub.spellcastingOverride) list.push({ classSlug: cls.id, subSlug: sub.id, override: sub.spellcastingOverride });
            }
        }
        return list;
    }

    private async apply(queryRunner: QueryRunner, withOverride: boolean): Promise<void> {
        const overrides = this.seedOverrides();
        if (await queryRunner.hasTable("rule_subclasses")) {
            for (const o of overrides) {
                await queryRunner.query(
                    "UPDATE `rule_subclasses` SET `spellcastingOverrideJson` = ? WHERE `slug` = ? AND `classSlug` = ?",
                    [withOverride ? JSON.stringify(o.override) : null, o.subSlug, o.classSlug]
                );
            }
        }
        if (await queryRunner.hasTable("rule_classes")) {
            for (const classSlug of Array.from(new Set(overrides.map((o) => o.classSlug)))) {
                const rows: any[] = await queryRunner.query("SELECT `id`, `subclassesJson` FROM `rule_classes` WHERE `slug` = ?", [classSlug]);
                for (const row of rows) {
                    let subs: any[] = [];
                    try {
                        subs = JSON.parse(row.subclassesJson || "[]");
                    } catch {
                        continue;
                    }
                    for (const sub of subs) {
                        const o = overrides.find((x) => x.classSlug === classSlug && x.subSlug === sub?.id);
                        if (!o) continue;
                        if (withOverride) sub.spellcastingOverride = o.override;
                        else delete sub.spellcastingOverride;
                    }
                    await queryRunner.query("UPDATE `rule_classes` SET `subclassesJson` = ? WHERE `id` = ?", [JSON.stringify(subs), row.id]);
                }
            }
        }
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.apply(queryRunner, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.apply(queryRunner, false);
    }
}
