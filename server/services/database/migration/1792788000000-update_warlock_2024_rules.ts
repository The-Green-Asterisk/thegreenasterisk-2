import { MigrationInterface, QueryRunner } from "typeorm";
import { buildClassProgression, buildSubclassProgression } from "../rulesProgressionBuilder";

export class UpdateWarlock2024Rules1792788000000 implements MigrationInterface {
    name = "UpdateWarlock2024Rules1792788000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 2024 Great Old One Patron subclass definition
        const updatedGoo = {
            id: "great-old-one",
            name: "Great Old One Patron",
            description: "Awakened Mind (telepathic connection), Psychic Spells, Clairvoyant Combatant, Eldritch Hex, Thought Shield, Create Thrall.",
            features: [
                {
                    level: 3,
                    name: "Awakened Mind",
                    description: "You can form a telepathic connection between your mind and the mind of another. As a Bonus Action, choose one creature you can see within 30 feet of yourself. You and the chosen creature can communicate telepathically with each other while within a number of miles equal to your Charisma modifier (minimum of 1 mile). To understand each other, you each must mentally use a language the other knows. The connection lasts for a number of minutes equal to your Warlock level, ending early if you connect with a different creature."
                },
                {
                    level: 3,
                    name: "Great Old One Spells",
                    description: "The magic of your patron ensures you always have certain spells ready; when you reach a Warlock level specified in the Great Old One Spells table, you thereafter always have that spell prepared: 3rd (Detect Thoughts, Dissonant Whispers, Phantasmal Force, Tasha's Hideous Laughter), 5th (Clairvoyance, Hunger of Hadar), 7th (Confusion, Summon Aberration), 9th (Modify Memory, Telekinesis)."
                },
                {
                    level: 3,
                    name: "Psychic Spells",
                    description: "When you cast a Warlock spell that deals damage, you can change the damage type to Psychic. In addition, when you cast a Warlock spell that belongs to the Enchantment or Illusion school, you can cast it without Verbal or Somatic components."
                },
                {
                    level: 6,
                    name: "Clairvoyant Combatant",
                    description: "You learn to read the attacks of minds you touch. When you form a telepathic bond with a creature using your Awakened Mind, you can force that creature to make a Wisdom saving throw against your spell save DC. On a failed save, the creature has Disadvantage on attack rolls against you, and you have Advantage on attack rolls against that creature for the duration of the bond. Once you use this feature, you can't use it again until you finish a Short or Long Rest unless you expend a Pact Magic spell slot (no action required) to restore your use of it."
                },
                {
                    level: 10,
                    name: "Eldritch Hex",
                    description: "Your alien patron grants you a powerful curse. You always have the Hex spell prepared. When you cast Hex and choose an ability, the target also has Disadvantage on saving throws of the chosen ability for the duration of the spell."
                },
                {
                    level: 10,
                    name: "Thought Shield",
                    description: "Your thoughts can't be read by telepathy or other means unless you allow it. You also have Resistance to Psychic damage, and whenever a creature deals Psychic damage to you, that creature takes the same amount of damage that you take."
                },
                {
                    level: 14,
                    name: "Create Thrall",
                    description: "When you cast Summon Aberration, you can modify it so that it doesn't require Concentration. If you do so, the spell's duration becomes 1 minute for that casting, and when summoned, the Aberration has a number of Temporary Hit Points equal to your Warlock level plus your Charisma modifier. In addition, the first time each turn the Aberration hits a creature under the effect of your Hex, the Aberration deals extra Psychic damage to the target equal to the bonus damage of your Hex."
                }
            ]
        };

        const gooProgressionJson = JSON.stringify(buildSubclassProgression("warlock", updatedGoo));

        // 1. Update rule_classes table if present
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (hasRuleClasses) {
            const warlockRows: any[] = await queryRunner.query(
                "SELECT * FROM `rule_classes` WHERE `slug` = 'warlock' LIMIT 1"
            );

            if (warlockRows && warlockRows.length > 0) {
                const warlockRow = warlockRows[0];
                let subclasses: any[] = [];
                try {
                    subclasses = JSON.parse(warlockRow.subclassesJson || "[]");
                } catch {
                    subclasses = [];
                }

                const gooIdx = subclasses.findIndex((s: any) =>
                    s.id === "great-old-one" ||
                    s.id === "great-old-one-patron" ||
                    String(s.name || "").toLowerCase().includes("great old one")
                );

                if (gooIdx >= 0) {
                    subclasses[gooIdx] = {
                        ...subclasses[gooIdx],
                        ...updatedGoo
                    };
                } else {
                    subclasses.push(updatedGoo);
                }

                let baseFeatures: any[] = [];
                try {
                    baseFeatures = JSON.parse(warlockRow.featuresJson || "[]");
                } catch {
                    baseFeatures = [];
                }

                const updatedClassProgressionJson = JSON.stringify(buildClassProgression("warlock", baseFeatures));

                await queryRunner.query(
                    "UPDATE `rule_classes` SET `subclassesJson` = ?, `progressionJson` = ? WHERE `id` = ?",
                    [JSON.stringify(subclasses), updatedClassProgressionJson, warlockRow.id]
                );
            }
        }

        // 2. Update rule_subclasses table if present
        const hasRuleSubclasses = await queryRunner.hasTable("rule_subclasses");
        if (hasRuleSubclasses) {
            const existingSub: any[] = await queryRunner.query(
                "SELECT * FROM `rule_subclasses` WHERE `classSlug` = 'warlock' AND (`slug` = 'great-old-one' OR `slug` = 'great-old-one-patron' OR LOWER(`name`) LIKE '%great old one%') LIMIT 1"
            );

            if (existingSub && existingSub.length > 0) {
                await queryRunner.query(
                    "UPDATE `rule_subclasses` SET `name` = ?, `slug` = ?, `description` = ?, `progressionJson` = ?, `source` = ? WHERE `id` = ?",
                    [
                        updatedGoo.name,
                        "great-old-one-patron",
                        updatedGoo.description,
                        gooProgressionJson,
                        "2024 Core Rules",
                        existingSub[0].id
                    ]
                );
            } else if (hasRuleClasses) {
                const warlockRows: any[] = await queryRunner.query(
                    "SELECT `id` FROM `rule_classes` WHERE `slug` = 'warlock' LIMIT 1"
                );
                if (warlockRows && warlockRows.length > 0) {
                    await queryRunner.query(
                        "INSERT INTO `rule_subclasses` (`classId`, `classSlug`, `slug`, `name`, `description`, `progressionJson`, `source`, `isCustom`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            warlockRows[0].id,
                            "warlock",
                            "great-old-one-patron",
                            updatedGoo.name,
                            updatedGoo.description,
                            gooProgressionJson,
                            "2024 Core Rules",
                            0
                        ]
                    );
                }
            }
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Rollback is a safe no-op to retain corrected 2024 rules definitions
    }
}
