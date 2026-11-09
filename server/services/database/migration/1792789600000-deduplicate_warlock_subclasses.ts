import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_CLASSES } from "../rulesSeed";
import { buildSubclassProgression } from "../rulesProgressionBuilder";

function normalizeSubclassKey(value: string): string {
    if (!value) return "";
    return String(value)
        .toLowerCase()
        .replace(/\s*\([^)]+\)\s*$/g, "")
        .replace(/^(the|path-of-the|path-of|circle-of-the|circle-of|college-of-the|college-of|oath-of-the|oath-of|warrior-of-the|warrior-of|way-of-the|way-of|school-of)[\s-]+/g, "")
        .replace(/[\s-]+(patron|domain|sorcery|magic|oath|circle|college|path|school)$/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function findCanonicalSeedSubclass(classSlug: string, subIdOrName?: string, subName?: string) {
    const seedCls = SEED_CLASSES.find((sc) => sc.id === classSlug || sc.name.toLowerCase() === classSlug.toLowerCase());
    if (!seedCls || !Array.isArray(seedCls.subclasses)) return undefined;

    const rawId = String(subIdOrName || "").trim();
    const rawName = String(subName || subIdOrName || "").trim();
    const normId = normalizeSubclassKey(rawId);
    const normName = normalizeSubclassKey(rawName);

    return seedCls.subclasses.find((ss: any) => {
        if (rawId && (ss.id === rawId || ss.id === rawId.toLowerCase())) return true;
        if (rawName && ss.name.toLowerCase() === rawName.toLowerCase()) return true;
        const ssNormId = normalizeSubclassKey(ss.id);
        const ssNormName = normalizeSubclassKey(ss.name);
        return (
            (normId && (ssNormId === normId || ssNormName === normId)) ||
            (normName && (ssNormId === normName || ssNormName === normName))
        );
    });
}

export class DeduplicateWarlockSubclasses1792789600000 implements MigrationInterface {
    name = "DeduplicateWarlockSubclasses1792789600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasRuleClasses = await queryRunner.hasTable("rule_classes");
        if (hasRuleClasses) {
            const classRows: any[] = await queryRunner.query("SELECT * FROM `rule_classes`");
            for (const row of classRows || []) {
                const classSlug = String(row.slug || "").toLowerCase();
                let rawSubs: any[] = [];
                try {
                    rawSubs = JSON.parse(row.subclassesJson || "[]");
                } catch {
                    rawSubs = [];
                }

                const byKey = new Map<string, any>();
                for (const sub of rawSubs) {
                    if (!sub) continue;
                    const canonSub = findCanonicalSeedSubclass(classSlug, sub.id || sub.slug, sub.name);
                    const normalizedSub = {
                        ...sub,
                        id: canonSub ? canonSub.id : (sub.id || sub.slug || ""),
                        name: canonSub ? canonSub.name : (sub.name || ""),
                        description: sub.description || canonSub?.description || "",
                        features: Array.isArray(sub.features) && sub.features.length > 0
                            ? sub.features
                            : (canonSub?.features || [])
                    };
                    const key = normalizeSubclassKey(normalizedSub.id || normalizedSub.name);
                    if (!key) continue;

                    const existing = byKey.get(key);
                    if (!existing) {
                        byKey.set(key, normalizedSub);
                    } else {
                        if (!existing.description && normalizedSub.description) {
                            existing.description = normalizedSub.description;
                        }
                        if ((!existing.features || existing.features.length === 0) && normalizedSub.features?.length > 0) {
                            existing.features = normalizedSub.features;
                        }
                    }
                }

                const deduplicatedSubs = Array.from(byKey.values());
                const newJson = JSON.stringify(deduplicatedSubs);
                if (newJson !== row.subclassesJson) {
                    await queryRunner.query(
                        "UPDATE `rule_classes` SET `subclassesJson` = ? WHERE `id` = ?",
                        [newJson, row.id]
                    );
                }
            }
        }

        const hasRuleSubclasses = await queryRunner.hasTable("rule_subclasses");
        if (hasRuleSubclasses) {
            const subRows: any[] = await queryRunner.query("SELECT * FROM `rule_subclasses` ORDER BY `id` ASC");
            const keptByClassAndKey = new Map<string, any>();

            for (const row of subRows || []) {
                const classSlug = String(row.classSlug || "").toLowerCase();
                const canonSub = findCanonicalSeedSubclass(classSlug, row.slug, row.name);
                const canonicalSlug = canonSub ? canonSub.id : String(row.slug || "");
                const canonicalName = canonSub ? canonSub.name : String(row.name || "");
                const key = `${classSlug}::${normalizeSubclassKey(canonicalSlug || canonicalName)}`;

                const existing = keptByClassAndKey.get(key);
                if (!existing) {
                    keptByClassAndKey.set(key, row);
                    const updatedDesc = row.description || canonSub?.description || "";
                    const updatedProg = canonSub
                        ? JSON.stringify(buildSubclassProgression(classSlug, canonSub))
                        : row.progressionJson;
                    if (
                        row.slug !== canonicalSlug ||
                        row.name !== canonicalName ||
                        row.description !== updatedDesc ||
                        row.progressionJson !== updatedProg
                    ) {
                        await queryRunner.query(
                            "UPDATE `rule_subclasses` SET `slug` = ?, `name` = ?, `description` = ?, `progressionJson` = ? WHERE `id` = ?",
                            [canonicalSlug, canonicalName, updatedDesc, updatedProg, row.id]
                        );
                    }
                } else {
                    // Delete duplicate row
                    await queryRunner.query("DELETE FROM `rule_subclasses` WHERE `id` = ?", [row.id]);
                }
            }
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Safe no-op
    }
}
