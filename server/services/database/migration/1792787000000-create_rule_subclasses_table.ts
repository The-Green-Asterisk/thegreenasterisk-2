import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class CreateRuleSubclassesTable1792787000000 implements MigrationInterface {
    name = 'CreateRuleSubclassesTable1792787000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add progressionJson column to rule_classes if not already present
        const classTable = await queryRunner.getTable("rule_classes");
        if (classTable && !classTable.findColumnByName("progressionJson")) {
            await queryRunner.addColumn(
                "rule_classes",
                new TableColumn({
                    name: "progressionJson",
                    type: "longtext",
                    isNullable: true
                })
            );
        }

        // 2. Create rule_subclasses table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`rule_subclasses\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`classId\` int NOT NULL,
                \`classSlug\` varchar(100) NOT NULL,
                \`slug\` varchar(100) NOT NULL,
                \`name\` varchar(150) NOT NULL,
                \`description\` text NOT NULL,
                \`spellcastingOverrideJson\` text NULL,
                \`progressionJson\` longtext NOT NULL,
                \`source\` varchar(150) NOT NULL DEFAULT '2024 Core Rules',
                \`dndBeyondId\` int NULL,
                \`isCustom\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE INDEX \`IDX_rule_subclasses_class_slug\` (\`classSlug\`, \`slug\`),
                INDEX \`IDX_rule_subclasses_classId\` (\`classId\`),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_rule_subclasses_classId\` FOREIGN KEY (\`classId\`) REFERENCES \`rule_classes\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE IF EXISTS `rule_subclasses`");

        const classTable = await queryRunner.getTable("rule_classes");
        if (classTable && classTable.findColumnByName("progressionJson")) {
            await queryRunner.dropColumn("rule_classes", "progressionJson");
        }
    }
}
