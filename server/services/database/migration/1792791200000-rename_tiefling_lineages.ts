import { MigrationInterface, QueryRunner } from "typeorm";

const RENAMES: Array<{ id: string; from: string; to: string }> = [
    { id: "abyssal", from: "Abyssal (Chaotic Evil)", to: "Abyssal Tiefling" },
    { id: "chthonic", from: "Chthonic (Neutral Evil)", to: "Chthonic Tiefling" },
    { id: "infernal", from: "Infernal (Lawful Evil)", to: "Infernal Tiefling" }
];

/**
 * Renames the Tiefling lineages from their old alignment-tagged names ("Infernal (Lawful Evil)") to "Infernal
 * Tiefling" and the like, as the other lineages are named ("Wood Elf"); the 2024 rules tie no alignment to a legacy.
 * Saved characters that took the old name as their race, lineage, or subtitle are renamed too.
 */
export class RenameTieflingLineages1792791200000 implements MigrationInterface {
    name = "RenameTieflingLineages1792791200000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.rename(queryRunner, (r) => [r.from, r.to]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.rename(queryRunner, (r) => [r.to, r.from]);
    }

    private async rename(queryRunner: QueryRunner, pick: (r: typeof RENAMES[number]) => [string, string]): Promise<void> {
        const parse = (json: string | null) => {
            try {
                return json ? JSON.parse(json) : null;
            } catch {
                return null;
            }
        };

        if (await queryRunner.hasTable("rule_species")) {
            const rows: any[] = await queryRunner.query("SELECT `id`, `lineagesJson` FROM `rule_species` WHERE `slug` = 'tiefling'");
            for (const row of rows) {
                const lineages = parse(row.lineagesJson);
                if (!Array.isArray(lineages)) continue;
                let changed = false;
                for (const l of lineages) {
                    const r = RENAMES.find((x) => x.id === l?.id);
                    if (!r) continue;
                    const [from, to] = pick(r);
                    if (l.name === from) {
                        l.name = to;
                        changed = true;
                    }
                }
                if (changed) {
                    await queryRunner.query("UPDATE `rule_species` SET `lineagesJson` = ? WHERE `id` = ?", [JSON.stringify(lineages), row.id]);
                }
            }
        }

        if (await queryRunner.hasTable("saved_character")) {
            for (const r of RENAMES) {
                const [from, to] = pick(r);
                await queryRunner.query("UPDATE `saved_character` SET `race` = ? WHERE `race` = ?", [to, from]);
                const rows: any[] = await queryRunner.query(
                    "SELECT `id`, `payload` FROM `saved_character` WHERE `payload` LIKE ?",
                    [`%${from.replace(/[\\%_]/g, (c) => `\\${c}`)}%`]
                );
                for (const row of rows) {
                    const payload = parse(row.payload);
                    if (!payload || typeof payload !== "object") continue;
                    let changed = false;
                    for (const key of ["race", "lineage", "subrace"]) {
                        if (payload[key] === from) {
                            payload[key] = to;
                            changed = true;
                        }
                    }
                    if (typeof payload.subtitle === "string" && payload.subtitle.includes(from)) {
                        payload.subtitle = payload.subtitle.split(from).join(to);
                        changed = true;
                    }
                    if (changed) {
                        await queryRunner.query("UPDATE `saved_character` SET `payload` = ? WHERE `id` = ?", [JSON.stringify(payload), row.id]);
                    }
                }
            }
        }
    }
}
