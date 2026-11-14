import { MigrationInterface, QueryRunner } from "typeorm";
import { parseLockedFields } from "../../definitionLocks";
import { lookupContainerDefaults, lookupItemWeightLb, parseWeightLb, roundWeightLb } from "../../itemWeightsAndContainers";

interface ItemMigrationRow {
    id: number;
    name: string;
    category: string | null;
    filterType: string | null;
    weight: number | null;
    isContainer: number | boolean | null;
    capacityWeight: number | null;
    lockedFields: string | null;
}

interface CharacterInvMigrationRow {
    id: number;
    itemId: number | null;
    locked: number | boolean | null;
    name: string;
    category: string | null;
    weight: number | null;
    isContainer: number | boolean | null;
    capacityWeight: number | null;
}

function scrubPayloadItems(
    items: unknown,
    itemByName: Map<string, { weight: number; isContainer: boolean; capacityWeight: number | null }>
): boolean {
    if (!Array.isArray(items)) return false;
    let changed = false;

    for (const raw of items) {
        if (!raw || typeof raw !== "object") continue;
        const entry = raw as Record<string, unknown>;
        if (entry.locked === true) continue;

        const name = typeof entry.name === "string" ? entry.name : "";
        if (!name.trim()) continue;
        const dbMatch = itemByName.get(name.trim().toLowerCase());
        const category = (typeof entry.category === "string" ? entry.category : undefined)
            || (typeof entry.filterType === "string" ? entry.filterType : undefined);

        const parsedCurrent = parseWeightLb(entry.weight);
        if (typeof entry.weight !== "number" && parsedCurrent !== null) {
            entry.weight = parsedCurrent;
            changed = true;
        }
        const currentWeight = typeof entry.weight === "number" && !Number.isNaN(entry.weight) ? entry.weight : (parsedCurrent ?? 0);
        if (currentWeight <= 0) {
            const candidate = (dbMatch && dbMatch.weight > 0 ? dbMatch.weight : null)
                ?? lookupItemWeightLb(name, category);
            if (candidate !== null && candidate > 0) {
                entry.weight = roundWeightLb(candidate);
                changed = true;
            }
        }

        const defaults = lookupContainerDefaults(name);
        if (entry.isContainer === undefined) {
            const nextIsContainer = dbMatch ? dbMatch.isContainer : Boolean(defaults?.isContainer);
            if (nextIsContainer) {
                entry.isContainer = true;
                changed = true;
            }
        }
        if ((entry.isContainer === true || defaults?.isContainer) && (entry.capacityWeight === undefined || entry.capacityWeight === null)) {
            const nextCap = dbMatch?.capacityWeight ?? defaults?.capacityWeight ?? null;
            if (nextCap !== null) {
                entry.capacityWeight = nextCap;
                changed = true;
            }
        }
    }

    return changed;
}

export class AddItemContainersAndScrubWeights1792792200000 implements MigrationInterface {
    name = "AddItemContainersAndScrubWeights1792792200000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable("item")) {
            if (!(await queryRunner.hasColumn("item", "isContainer"))) {
                await queryRunner.query("ALTER TABLE `item` ADD `isContainer` tinyint(1) NOT NULL DEFAULT 0");
            }
            if (!(await queryRunner.hasColumn("item", "capacityWeight"))) {
                await queryRunner.query("ALTER TABLE `item` ADD `capacityWeight` float NULL");
            }
        }

        if (await queryRunner.hasTable("character_inventory_item")) {
            if (!(await queryRunner.hasColumn("character_inventory_item", "weight"))) {
                await queryRunner.query("ALTER TABLE `character_inventory_item` ADD `weight` float NOT NULL DEFAULT 0");
            }
            if (!(await queryRunner.hasColumn("character_inventory_item", "isContainer"))) {
                await queryRunner.query("ALTER TABLE `character_inventory_item` ADD `isContainer` tinyint(1) NOT NULL DEFAULT 0");
            }
            if (!(await queryRunner.hasColumn("character_inventory_item", "capacityWeight"))) {
                await queryRunner.query("ALTER TABLE `character_inventory_item` ADD `capacityWeight` float NULL");
            }
            if (!(await queryRunner.hasColumn("character_inventory_item", "containerId"))) {
                await queryRunner.query("ALTER TABLE `character_inventory_item` ADD `containerId` varchar(100) NULL");
            }
        }

        const itemById = new Map<number, { weight: number; isContainer: boolean; capacityWeight: number | null }>();
        const itemByName = new Map<string, { weight: number; isContainer: boolean; capacityWeight: number | null }>();

        if (await queryRunner.hasTable("item")) {
            const items = await queryRunner.query(
                "SELECT id, name, category, filterType, weight, isContainer, capacityWeight, lockedFields FROM item"
            ) as ItemMigrationRow[];

            for (const row of items) {
                const locks = parseLockedFields(row.lockedFields);
                let nextWeight = typeof row.weight === "number" && !Number.isNaN(row.weight) ? row.weight : 0;
                let nextIsContainer = Boolean(row.isContainer);
                let nextCapacity = row.capacityWeight !== null && row.capacityWeight !== undefined && !Number.isNaN(Number(row.capacityWeight))
                    ? Number(row.capacityWeight)
                    : null;
                let rowChanged = false;

                if (!locks.weight && nextWeight <= 0) {
                    const lookedUp = lookupItemWeightLb(row.name, row.category || row.filterType);
                    if (lookedUp !== null && lookedUp > 0) {
                        nextWeight = roundWeightLb(lookedUp);
                        rowChanged = true;
                    }
                }

                const containerDefaults = lookupContainerDefaults(row.name);
                if (containerDefaults) {
                    if (!locks.isContainer && !nextIsContainer && containerDefaults.isContainer) {
                        nextIsContainer = true;
                        rowChanged = true;
                    }
                    if (!locks.capacityWeight && nextCapacity === null && containerDefaults.capacityWeight !== null) {
                        nextCapacity = containerDefaults.capacityWeight;
                        rowChanged = true;
                    }
                }

                if (rowChanged) {
                    await queryRunner.query(
                        "UPDATE item SET weight = ?, isContainer = ?, capacityWeight = ? WHERE id = ?",
                        [nextWeight, nextIsContainer ? 1 : 0, nextCapacity, row.id]
                    );
                }

                const snapshot = { weight: nextWeight, isContainer: nextIsContainer, capacityWeight: nextCapacity };
                itemById.set(row.id, snapshot);
                if (row.name) {
                    itemByName.set(row.name.trim().toLowerCase(), snapshot);
                }
            }
        }

        if (await queryRunner.hasTable("character_inventory_item")) {
            const invRows = await queryRunner.query(
                "SELECT id, itemId, locked, name, category, weight, isContainer, capacityWeight FROM character_inventory_item"
            ) as CharacterInvMigrationRow[];

            for (const row of invRows) {
                if (Boolean(row.locked)) continue;

                const linked = (row.itemId ? itemById.get(row.itemId) : undefined)
                    || (row.name ? itemByName.get(row.name.trim().toLowerCase()) : undefined);
                const defaults = lookupContainerDefaults(row.name);

                let nextWeight = typeof row.weight === "number" && !Number.isNaN(row.weight) ? row.weight : 0;
                let nextIsContainer = Boolean(row.isContainer);
                let nextCapacity = row.capacityWeight !== null && row.capacityWeight !== undefined && !Number.isNaN(Number(row.capacityWeight))
                    ? Number(row.capacityWeight)
                    : null;
                let rowChanged = false;

                if (nextWeight <= 0) {
                    const candidate = (linked && linked.weight > 0 ? linked.weight : null)
                        ?? lookupItemWeightLb(row.name, row.category);
                    if (candidate !== null && candidate > 0) {
                        nextWeight = roundWeightLb(candidate);
                        rowChanged = true;
                    }
                }

                if (!nextIsContainer && (linked?.isContainer || defaults?.isContainer)) {
                    nextIsContainer = true;
                    rowChanged = true;
                }

                if (nextIsContainer && nextCapacity === null) {
                    const candidateCap = linked?.capacityWeight ?? defaults?.capacityWeight ?? null;
                    if (candidateCap !== null) {
                        nextCapacity = candidateCap;
                        rowChanged = true;
                    }
                }

                if (rowChanged) {
                    await queryRunner.query(
                        "UPDATE character_inventory_item SET weight = ?, isContainer = ?, capacityWeight = ? WHERE id = ?",
                        [nextWeight, nextIsContainer ? 1 : 0, nextCapacity, row.id]
                    );
                }
            }
        }

        if (await queryRunner.hasTable("saved_character")) {
            const charRows = await queryRunner.query(
                "SELECT id, payload FROM saved_character"
            ) as Array<{ id: number; payload: string }>;

            for (const charRow of charRows) {
                if (!charRow.payload) continue;
                try {
                    const payload = JSON.parse(charRow.payload) as Record<string, unknown>;
                    const weaponsChanged = scrubPayloadItems(payload.weapons, itemByName);
                    const equipmentChanged = scrubPayloadItems(payload.equipment, itemByName);
                    if (weaponsChanged || equipmentChanged) {
                        await queryRunner.query(
                            "UPDATE saved_character SET payload = ? WHERE id = ?",
                            [JSON.stringify(payload), charRow.id]
                        );
                    }
                } catch {
                    // Leave malformed JSON payloads untouched.
                }
            }
        }

        if (await queryRunner.hasTable("rule_species")) {
            const speciesRows = await queryRunner.query(
                "SELECT id, slug, traitsJson, isCustom FROM rule_species WHERE LOWER(slug) IN ('orc', 'goliath')"
            ) as Array<{ id: number; slug: string; traitsJson: string; isCustom: number | boolean }>;

            for (const sp of speciesRows) {
                if (Boolean(sp.isCustom) || !sp.traitsJson) continue;
                try {
                    const traits = JSON.parse(sp.traitsJson) as Array<{
                        name?: string;
                        modifiers?: Array<{ target?: string; type?: string; value?: number }>;
                    }>;
                    if (!Array.isArray(traits)) continue;
                    let changed = false;
                    for (const trait of traits) {
                        if (String(trait?.name || "").trim().toLowerCase() !== "powerful build") continue;
                        if (!Array.isArray(trait.modifiers)) trait.modifiers = [];
                        if (!trait.modifiers.some((m) => m?.target === "vitals.carryingCapacity")) {
                            trait.modifiers.push({ target: "vitals.carryingCapacity", type: "multiplier", value: 2 });
                            changed = true;
                        }
                    }
                    if (changed) {
                        await queryRunner.query(
                            "UPDATE rule_species SET traitsJson = ? WHERE id = ?",
                            [JSON.stringify(traits), sp.id]
                        );
                    }
                } catch {
                    // Ignore malformed species JSON.
                }
            }
        }

        if (await queryRunner.hasTable("rule_subclasses")) {
            const subclassRows = await queryRunner.query(
                "SELECT id, classSlug, slug, progressionJson, isCustom FROM rule_subclasses WHERE LOWER(classSlug) = 'barbarian' AND LOWER(slug) LIKE '%wild-heart%'"
            ) as Array<{ id: number; classSlug: string; slug: string; progressionJson: string; isCustom: number | boolean }>;

            for (const sub of subclassRows) {
                if (Boolean(sub.isCustom) || !sub.progressionJson) continue;
                try {
                    const progression = JSON.parse(sub.progressionJson) as Array<{
                        choices?: Array<{
                            options?: Array<{
                                id?: string;
                                name?: string;
                                modifiers?: Array<{ target?: string; type?: string; value?: number; description?: string }>;
                            }>;
                        }>;
                    }>;
                    if (!Array.isArray(progression)) continue;
                    let changed = false;
                    for (const lvl of progression) {
                        if (!Array.isArray(lvl?.choices)) continue;
                        for (const choice of lvl.choices) {
                            if (!Array.isArray(choice?.options)) continue;
                            for (const opt of choice.options) {
                                const id = String(opt?.id || "").trim().toLowerCase();
                                const name = String(opt?.name || "").trim().toLowerCase();
                                if (id !== "elephant" && name !== "elephant") continue;
                                if (!Array.isArray(opt.modifiers)) opt.modifiers = [];
                                if (!opt.modifiers.some((m) => m?.target === "vitals.carryingCapacity")) {
                                    opt.modifiers.push({
                                        target: "vitals.carryingCapacity",
                                        type: "multiplier",
                                        value: 2,
                                        description: "Carrying capacity doubled"
                                    });
                                    changed = true;
                                }
                            }
                        }
                    }
                    if (changed) {
                        await queryRunner.query(
                            "UPDATE rule_subclasses SET progressionJson = ? WHERE id = ?",
                            [JSON.stringify(progression), sub.id]
                        );
                    }
                } catch {
                    // Ignore malformed subclass JSON.
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable("character_inventory_item")) {
            for (const col of ["containerId", "capacityWeight", "isContainer", "weight"]) {
                if (await queryRunner.hasColumn("character_inventory_item", col)) {
                    await queryRunner.query(`ALTER TABLE \`character_inventory_item\` DROP COLUMN \`${col}\``);
                }
            }
        }

        if (await queryRunner.hasTable("item")) {
            for (const col of ["capacityWeight", "isContainer"]) {
                if (await queryRunner.hasColumn("item", col)) {
                    await queryRunner.query(`ALTER TABLE \`item\` DROP COLUMN \`${col}\``);
                }
            }
        }
    }
}
