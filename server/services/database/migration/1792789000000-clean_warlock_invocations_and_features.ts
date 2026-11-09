import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression } from "../rulesProgressionBuilder";

export class CleanWarlockInvocationsAndFeatures1792789000000 implements MigrationInterface {
    name = "CleanWarlockInvocationsAndFeatures1792789000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (!hasRuleClasses) return;

        const warlockRows: any[] = await queryRunner.query(
            "SELECT * FROM `rule_classes` WHERE `slug` = 'warlock' LIMIT 1"
        );

        if (warlockRows && warlockRows.length > 0) {
            const warlockRow = warlockRows[0];
            let features: any[] = [];
            try {
                features = JSON.parse(warlockRow.featuresJson || "[]");
            } catch {
                features = [];
            }

            const canonicalInvocationDesc = "You have unearthed Eldritch Invocations, pieces of forbidden knowledge that imbue you with an abiding magical ability or other lessons. You gain one invocation of your choice, such as Pact of the Tome.\r\nPrerequisites. If an invocation has a prerequisite, you must meet it to learn that invocation. For example, if an invocation requires you to be a level 5+ Warlock, you can select the invocation once you reach Warlock level 5.\r\nReplacing and Gaining Invocations. Whenever you gain a Warlock level, you can replace one of your invocations with another one for which you qualify. You can’t replace an invocation if it’s a prerequisite for another invocation that you have.\r\nWhen you gain certain Warlock levels, you gain more invocations of your choice, as shown in the Invocations column of the Warlock Features table.\r\nYou can’t pick the same invocation more than once unless its description says otherwise.";
            const canonicalInvocationHtml = "<p>You have unearthed Eldritch Invocations, pieces of forbidden knowledge that imbue you with an abiding magical ability or other lessons. You gain one invocation of your choice, such as Pact of the Tome.</p>\r\n<p><strong><em>Prerequisites.</em></strong> If an invocation has a prerequisite, you must meet it to learn that invocation. For example, if an invocation requires you to be a level 5+ Warlock, you can select the invocation once you reach Warlock level 5.</p>\r\n<p><strong><em>Replacing and Gaining Invocations.</em></strong> Whenever you gain a Warlock level, you can replace one of your invocations with another one for which you qualify. You can’t replace an invocation if it’s a prerequisite for another invocation that you have.</p>\r\n<p>When you gain certain Warlock levels, you gain more invocations of your choice, as shown in the Invocations column of the Warlock Features table.</p>\r\n<p>You can’t pick the same invocation more than once unless its description says otherwise.</p>";

            // Filter out boilerplate text, duplicate invocations, and pre-2024 legacy features
            let cleanedFeatures = features.filter((f: any) => {
                const lower = (f.name || "").trim().toLowerCase();
                // Remove boilerplate non-feature section extracted from D&D Beyond
                if (lower === "eldritch invocation options") return false;
                // Remove legacy 2014 level 1 patron (subclass is level 3 in 2024 rules)
                if (lower === "otherworldly patron" && f.level === 1) return false;
                // Remove legacy 2014 level 3 pact boon (boons are invocations in 2024 rules)
                if (lower === "pact boon" && f.level === 3) return false;
                // Remove legacy duplicate level 11 mystic arcanum
                if (lower === "mystic arcanum" && f.level === 11) return false;
                // Remove extra level-by-level invocation features to leave one canonical entry
                if (lower.startsWith("eldritch invocation")) return false;
                return true;
            });

            // Ensure single canonical Eldritch Invocations feature at level 1
            cleanedFeatures.push({
                level: 1,
                name: "Eldritch Invocations",
                description: canonicalInvocationDesc,
                htmlDescription: canonicalInvocationHtml,
                fromDndBeyond: true
            });

            // Clean up Mystic Arcanum levels if corrupted with duplicates
            cleanedFeatures = cleanedFeatures.filter((f: any) => !f.name.toLowerCase().startsWith("mystic arcanum"));
            cleanedFeatures.push(
                {
                    level: 11,
                    name: "Mystic Arcanum (6th Level)",
                    description: "Choose one 6th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.",
                    htmlDescription: "<p>Choose one 6th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.</p>",
                    fromDndBeyond: true
                },
                {
                    level: 13,
                    name: "Mystic Arcanum (7th Level)",
                    description: "Choose one 7th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.",
                    htmlDescription: "<p>Choose one 7th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.</p>",
                    fromDndBeyond: true
                },
                {
                    level: 15,
                    name: "Mystic Arcanum (8th Level)",
                    description: "Choose one 8th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.",
                    htmlDescription: "<p>Choose one 8th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.</p>",
                    fromDndBeyond: true
                },
                {
                    level: 17,
                    name: "Mystic Arcanum (9th Level)",
                    description: "Choose one 9th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.",
                    htmlDescription: "<p>Choose one 9th-level Warlock spell. You can cast it once per Long Rest without expending a spell slot.</p>",
                    fromDndBeyond: true
                }
            );

            cleanedFeatures.sort((a: any, b: any) => a.level - b.level);

            const updatedProgressionJson = JSON.stringify(buildClassProgression("warlock", cleanedFeatures));

            await queryRunner.query(
                "UPDATE `rule_classes` SET `featuresJson` = ?, `progressionJson` = ? WHERE `id` = ?",
                [JSON.stringify(cleanedFeatures), updatedProgressionJson, warlockRow.id]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Safe no-op to retain clean 2024 rules state
    }
}
