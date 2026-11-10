import { describe, expect, it } from "vitest";
import { RenameTieflingLineages1792791200000 } from "../../server/services/database/migration/1792791200000-rename_tiefling_lineages";

function fakeRunner() {
    const species = [{ id: 1, lineagesJson: JSON.stringify([{ id: "infernal", name: "Infernal (Lawful Evil)", traits: [] }, { id: "abyssal", name: "Abyssal (Chaotic Evil)" }]) }];
    const chars = [
        { id: 7, race: "Infernal (Lawful Evil)", payload: JSON.stringify({ race: "Infernal (Lawful Evil)", lineage: "Infernal (Lawful Evil)", subtitle: "Level 3 Infernal (Lawful Evil) Bard", name: "X" }) },
        { id: 8, race: "Wood Elf", payload: JSON.stringify({ race: "Wood Elf" }) }
    ];
    const query = async (sql: string, params: any[] = []) => {
        if (sql.startsWith("SELECT `id`, `lineagesJson`")) return species;
        if (sql.startsWith("UPDATE `rule_species`")) { species.find(s => s.id === params[1])!.lineagesJson = params[0]; return; }
        if (sql.startsWith("UPDATE `saved_character` SET `race`")) { chars.filter(c => c.race === params[1]).forEach(c => { c.race = params[0]; }); return; }
        if (sql.startsWith("SELECT `id`, `payload`")) {
            const needle = String(params[0]).slice(1, -1).replace(/\\(.)/g, "$1");
            return chars.filter(c => c.payload.includes(needle));
        }
        if (sql.startsWith("UPDATE `saved_character` SET `payload`")) { chars.find(c => c.id === params[1])!.payload = params[0]; return; }
        throw new Error(`unexpected: ${sql}`);
    };
    return { species, chars, runner: { hasTable: async () => true, query } as any };
}

describe("RenameTieflingLineages migration", () => {
    it("renames the lineages and saved characters that use them, and back", async () => {
        const { species, chars, runner } = fakeRunner();
        const m = new RenameTieflingLineages1792791200000();
        await m.up(runner);
        expect(JSON.parse(species[0].lineagesJson).map((l: any) => l.name)).toEqual(["Infernal Tiefling", "Abyssal Tiefling"]);
        expect(chars[0].race).toBe("Infernal Tiefling");
        expect(JSON.parse(chars[0].payload)).toMatchObject({ race: "Infernal Tiefling", lineage: "Infernal Tiefling", subtitle: "Level 3 Infernal Tiefling Bard", name: "X" });
        expect(chars[1].race).toBe("Wood Elf");
        await m.down(runner);
        expect(chars[0].race).toBe("Infernal (Lawful Evil)");
        expect(JSON.parse(species[0].lineagesJson)[1].name).toBe("Abyssal (Chaotic Evil)");
    });
});
