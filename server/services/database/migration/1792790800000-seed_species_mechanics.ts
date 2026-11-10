import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_SPECIES } from "../rulesSeed";

/**
 * Adds the mechanics the creator and sheet now read from species data instead of species names: trait modifiers
 * (resistances, Dwarven Toughness), limited uses (Breath Weapon, Stonecunning, Healing Hands, ...), granted spells
 * (Light, Thaumaturgy), skill and feat picks (Skillful, Versatile, Keen Senses), minimum levels, Breath Weapon dice,
 * and lineage resistances (Dragonborn ancestries, Tiefling legacies). Merged into the stored traits and lineages by
 * name and id, so descriptions synced from D&D Beyond are kept.
 */
export class SeedSpeciesMechanics1792790800000 implements MigrationInterface {
    name = "SeedSpeciesMechanics1792790800000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("rule_species"))) return;
        const rows: any[] = await queryRunner.query("SELECT `id`, `slug`, `isCustom`, `traitsJson`, `lineagesJson` FROM `rule_species`");
        const parse = (json: string | null, fallback: any) => {
            try {
                return json ? JSON.parse(json) ?? fallback : fallback;
            } catch {
                return fallback;
            }
        };
        const mergeTraits = (stored: any[], seed: any[]) => {
            const out = Array.isArray(stored) ? [...stored] : [];
            for (const st of seed || []) {
                const i = out.findIndex((t) => String(t?.name || "").toLowerCase() === String(st.name).toLowerCase());
                if (i === -1) out.push(st);
                else out[i] = { ...st, ...out[i], ...Object.fromEntries(Object.entries(st).filter(([k]) => k !== "name" && k !== "description")) };
            }
            return out;
        };
        for (const row of rows) {
            if (row.isCustom) continue;
            const seed: any = (SEED_SPECIES as any[]).find((s) => s.id === String(row.slug || "").toLowerCase());
            if (!seed) continue;
            const traits = mergeTraits(parse(row.traitsJson, []), seed.traits);
            let lineages = parse(row.lineagesJson, null);
            if (Array.isArray(seed.lineages)) {
                lineages = Array.isArray(lineages) ? lineages : [];
                for (const sl of seed.lineages) {
                    const i = lineages.findIndex((l: any) => l?.id === sl.id);
                    if (i === -1) lineages.push(sl);
                    else lineages[i] = { ...lineages[i], ...(sl.modifiers ? { modifiers: sl.modifiers } : {}), traits: mergeTraits(lineages[i].traits, sl.traits) };
                }
            }
            await queryRunner.query(
                "UPDATE `rule_species` SET `traitsJson` = ?, `lineagesJson` = ? WHERE `id` = ?",
                [JSON.stringify(traits), lineages ? JSON.stringify(lineages) : null, row.id]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: the previous values aren't kept
    }
}
