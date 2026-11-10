import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_SPECIES } from "../rulesSeed";

/**
 * Adds spellcastingAbilityOptions to the species data: Elf, Gnome, and Tiefling lineages (and the Tiefling's
 * Otherworldly Presence) cast their spells with Intelligence, Wisdom, or Charisma, chosen with the lineage; the
 * Aasimar's Light Bearer uses Charisma. Merged into stored traits and lineages by name and id; other stored values,
 * including descriptions synced from D&D Beyond, are kept.
 */
export class SeedSpeciesSpellAbility1792791100000 implements MigrationInterface {
    name = "SeedSpeciesSpellAbility1792791100000";

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
        const withOptions = (stored: any[], seed: any[]) => (Array.isArray(stored) ? stored : []).map((t: any) => {
            const st = (seed || []).find((x: any) => String(x?.name || "").toLowerCase() === String(t?.name || "").toLowerCase());
            return st?.spellcastingAbilityOptions ? { ...t, spellcastingAbilityOptions: st.spellcastingAbilityOptions } : t;
        });
        for (const row of rows) {
            if (row.isCustom) continue;
            const seed: any = (SEED_SPECIES as any[]).find((s) => s.id === String(row.slug || "").toLowerCase());
            if (!seed) continue;
            const traits = withOptions(parse(row.traitsJson, []), seed.traits);
            const lineages = parse(row.lineagesJson, null);
            const nextLineages = Array.isArray(lineages)
                ? lineages.map((l: any) => {
                    const sl = (seed.lineages || []).find((x: any) => x.id === l?.id);
                    if (!sl) return l;
                    return {
                        ...l,
                        ...(sl.spellcastingAbilityOptions ? { spellcastingAbilityOptions: sl.spellcastingAbilityOptions } : {}),
                        traits: withOptions(l.traits, sl.traits)
                    };
                })
                : lineages;
            await queryRunner.query(
                "UPDATE `rule_species` SET `traitsJson` = ?, `lineagesJson` = ? WHERE `id` = ?",
                [JSON.stringify(traits), nextLineages ? JSON.stringify(nextLineages) : null, row.id]
            );
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Data re-seed: the previous values aren't kept
    }
}
