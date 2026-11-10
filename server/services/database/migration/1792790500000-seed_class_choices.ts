import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression, buildSubclassProgression } from "../rulesProgressionBuilder";
import { SEED_CLASSES } from "../rulesSeed";

/**
 * Re-seeds class and subclass progression with what the creator now reads from data instead of hard-coding classes:
 *  - choices: per-class Fighting Style lists (Blessed Warrior Paladin-only, Druidic Warrior Ranger-only, Thrown and
 *    Unarmed for all), Champion's full Additional Fighting Style list (with legacy option ids), Tactical Master
 *    (Fighter 9), Improved Brutal Strike (Barbarian 13), Devious Strike (Rogue 14), Battering Roots (World Tree 10),
 *    Hunter's Defensive Tactics at level 7, no War God's Blessing for Psi Warriors, legacy storage keys for older saves
 *  - pick lists marked with their pool (invocations, metamagic, maneuvers); Eldritch Invocation minimum levels
 *  - spell picks: Pact of the Tome, Thaumaturge / Magician (a chosen cantrip instead of a fixed one), Blessed /
 *    Druidic Warrior, Magical Discoveries, Mystic Arcanum, Spell Mastery, Signature Spells
 *  - resources: 2024 Cleric Channel Divinity (3 at 6), Fighter Indomitable, Sorcerer Innate Sorcery, "Lay on Hands";
 *    per-level badges (Rage Damage, Fighter attacks, Monk Martial Arts die)
 */
export class SeedClassChoices1792790500000 implements MigrationInterface {
    name = "SeedClassChoices1792790500000";

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
