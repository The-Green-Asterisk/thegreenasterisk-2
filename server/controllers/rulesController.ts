import http from "http";
import cache from "../cache";
import AppDataSource from "../services/database";
import RuleBackground from "../services/database/entity/RuleBackground";
import RuleClass from "../services/database/entity/RuleClass";
import RuleFeat from "../services/database/entity/RuleFeat";
import RuleSpecies from "../services/database/entity/RuleSpecies";
import {
    SEED_BACKGROUNDS,
    SEED_CLASSES,
    SEED_GENERAL_FEATS,
    SEED_ORIGIN_FEATS,
    SEED_SPECIES
} from "../services/database/rulesSeed";
import BaseController from "./baseController";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function cleanHtmlTags(html: string): string {
    return html.replace(/<[^>]*>?/gm, "").trim();
}

export default class RulesController extends BaseController {
    /**
     * Seeds the default rules into the database if the tables are empty.
     */
    public static async seedDefaultRulesIfEmpty(): Promise<void> {
        if (!AppDataSource.isInitialized) return;

        try {
            const classRepo = AppDataSource.getRepository(RuleClass);
            const speciesRepo = AppDataSource.getRepository(RuleSpecies);
            const bgRepo = AppDataSource.getRepository(RuleBackground);
            const featRepo = AppDataSource.getRepository(RuleFeat);

            const classCount = await classRepo.count();
            if (classCount === 0) {
                const classEntities = SEED_CLASSES.map((cls) => classRepo.create({
                    slug: cls.id,
                    name: cls.name,
                    description: cls.description,
                    hitDie: cls.hitDie,
                    primaryAbilitiesJson: JSON.stringify(cls.primaryAbilities),
                    savingThrowsJson: JSON.stringify(cls.savingThrows),
                    armorProficienciesJson: JSON.stringify(cls.armorProficiencies),
                    weaponProficienciesJson: JSON.stringify(cls.weaponProficiencies),
                    weaponMasteryCount: cls.weaponMasteryCount || 0,
                    skillChoicesJson: JSON.stringify(cls.skillChoices),
                    spellcastingJson: cls.spellcasting ? JSON.stringify(cls.spellcasting) : undefined,
                    featuresJson: JSON.stringify(cls.features || []),
                    subclassesJson: JSON.stringify(cls.subclasses || []),
                    startingEquipmentJson: cls.startingEquipmentOptions ? JSON.stringify(cls.startingEquipmentOptions) : undefined,
                    source: "2024 Core Rules"
                }));
                await classRepo.save(classEntities);
            }

            const speciesCount = await speciesRepo.count();
            if (speciesCount === 0) {
                const speciesEntities = SEED_SPECIES.map((sp) => speciesRepo.create({
                    slug: sp.id,
                    name: sp.name,
                    description: sp.description,
                    size: sp.size,
                    speed: sp.speed,
                    darkvision: sp.darkvision,
                    traitsJson: JSON.stringify(sp.traits || []),
                    lineagesJson: sp.lineages ? JSON.stringify(sp.lineages) : undefined,
                    extraSkillCount: sp.extraSkillCount || 0,
                    extraFeatCount: sp.extraFeatCount || 0,
                    source: "2024 Core Rules"
                }));
                await speciesRepo.save(speciesEntities);
            }

            const bgCount = await bgRepo.count();
            if (bgCount === 0) {
                const bgEntities = SEED_BACKGROUNDS.map((bg) => bgRepo.create({
                    slug: bg.id,
                    name: bg.name,
                    description: bg.description,
                    allowedAbilitiesJson: JSON.stringify(bg.allowedAbilities),
                    skillsJson: JSON.stringify(bg.skills),
                    tool: bg.tool || "",
                    originFeatId: bg.originFeatId || "",
                    equipmentSummary: bg.equipmentSummary || "",
                    source: "2024 Core Rules"
                }));
                await bgRepo.save(bgEntities);
            }

            const featCount = await featRepo.count();
            if (featCount === 0) {
                const originEntities = SEED_ORIGIN_FEATS.map((ofeat) => featRepo.create({
                    slug: ofeat.id,
                    name: ofeat.name,
                    description: ofeat.description,
                    category: "origin",
                    benefitsJson: JSON.stringify(ofeat.benefits || []),
                    statOptionsJson: (ofeat as any).spellcastingAbilityOptions ? JSON.stringify((ofeat as any).spellcastingAbilityOptions) : undefined,
                    isEpicBoon: false,
                    source: "2024 Core Rules"
                }));
                const generalEntities = SEED_GENERAL_FEATS.map((gfeat: any) => featRepo.create({
                    slug: gfeat.id,
                    name: gfeat.name,
                    description: gfeat.description,
                    category: gfeat.category || (gfeat.isEpicBoon ? "epic-boon" : "general"),
                    prerequisite: gfeat.prerequisite || undefined,
                    benefitsJson: JSON.stringify(gfeat.benefits || []),
                    statOptionsJson: JSON.stringify(gfeat.allowedStats || gfeat.statOptions || []),
                    isEpicBoon: !!gfeat.isEpicBoon,
                    source: "2024 Core Rules"
                }));
                await featRepo.save([...originEntities, ...generalEntities]);
            }
        } catch (err) {
            console.warn("Rules auto-seed check encountered an issue:", err);
        }
    }

    /**
     * GET /get-rules
     * Returns all active rules: classes, species, backgrounds, originFeats, generalFeats.
     */
    public static async getRules(_req: http.IncomingMessage, _res: http.ServerResponse) {
        const cacheKey = "dnd_rules_all";
        const cached = cache.get(cacheKey);
        if (cached) {
            return {
                response: cached,
                header: "application/json",
                status: 200
            };
        }

        if (!AppDataSource.isInitialized) {
            const fallback = JSON.stringify({
                classes: SEED_CLASSES,
                species: SEED_SPECIES,
                backgrounds: SEED_BACKGROUNDS,
                originFeats: SEED_ORIGIN_FEATS,
                generalFeats: SEED_GENERAL_FEATS
            });
            return {
                response: fallback,
                header: "application/json",
                status: 200
            };
        }

        try {
            await this.seedDefaultRulesIfEmpty();

            const classRepo = AppDataSource.getRepository(RuleClass);
            const speciesRepo = AppDataSource.getRepository(RuleSpecies);
            const bgRepo = AppDataSource.getRepository(RuleBackground);
            const featRepo = AppDataSource.getRepository(RuleFeat);

            const [dbClasses, dbSpecies, dbBackgrounds, dbFeats] = await Promise.all([
                classRepo.find({ order: { name: "ASC" } }),
                speciesRepo.find({ order: { name: "ASC" } }),
                bgRepo.find({ order: { name: "ASC" } }),
                featRepo.find({ order: { name: "ASC" } })
            ]);

            const classes = dbClasses.map((rc) => ({
                id: rc.slug,
                name: rc.name,
                description: rc.description,
                hitDie: rc.hitDie,
                primaryAbilities: this.safeParse(rc.primaryAbilitiesJson, []),
                savingThrows: this.safeParse(rc.savingThrowsJson, []),
                armorProficiencies: this.safeParse(rc.armorProficienciesJson, []),
                weaponProficiencies: this.safeParse(rc.weaponProficienciesJson, []),
                weaponMasteryCount: rc.weaponMasteryCount,
                skillChoices: this.safeParse(rc.skillChoicesJson, { count: 2, from: [] }),
                spellcasting: rc.spellcastingJson ? this.safeParse(rc.spellcastingJson, undefined) : undefined,
                features: this.safeParse(rc.featuresJson, []),
                subclasses: this.safeParse(rc.subclassesJson, []),
                startingEquipmentOptions: rc.startingEquipmentJson ? this.safeParse(rc.startingEquipmentJson, []) : []
            }));

            const species = dbSpecies.map((rs) => ({
                id: rs.slug,
                name: rs.name,
                description: rs.description,
                size: rs.size,
                speed: rs.speed,
                darkvision: rs.darkvision || undefined,
                traits: this.safeParse(rs.traitsJson, []),
                lineages: rs.lineagesJson ? this.safeParse(rs.lineagesJson, undefined) : undefined,
                extraSkillCount: rs.extraSkillCount,
                extraFeatCount: rs.extraFeatCount
            }));

            const backgrounds = dbBackgrounds.map((rb) => ({
                id: rb.slug,
                name: rb.name,
                description: rb.description,
                allowedAbilities: this.safeParse(rb.allowedAbilitiesJson, []),
                skills: this.safeParse(rb.skillsJson, []),
                tool: rb.tool,
                originFeatId: rb.originFeatId,
                equipmentSummary: rb.equipmentSummary
            }));

            const originFeats = dbFeats
                .filter((rf) => rf.category === "origin")
                .map((rf) => ({
                    id: rf.slug,
                    name: rf.name,
                    description: rf.description,
                    benefits: this.safeParse(rf.benefitsJson, [])
                }));

            const generalFeats = dbFeats
                .filter((rf) => rf.category !== "origin")
                .map((rf) => ({
                    id: rf.slug,
                    name: rf.name,
                    description: rf.description,
                    category: rf.category,
                    prerequisite: rf.prerequisite || undefined,
                    benefits: this.safeParse(rf.benefitsJson, []),
                    allowedStats: this.safeParse(rf.statOptionsJson, ["str", "dex", "con", "int", "wis", "cha"]),
                    isEpicBoon: rf.isEpicBoon
                }));

            const payload = JSON.stringify({
                classes: classes.length > 0 ? classes : SEED_CLASSES,
                species: species.length > 0 ? species : SEED_SPECIES,
                backgrounds: backgrounds.length > 0 ? backgrounds : SEED_BACKGROUNDS,
                originFeats: originFeats.length > 0 ? originFeats : SEED_ORIGIN_FEATS,
                generalFeats: generalFeats.length > 0 ? generalFeats : SEED_GENERAL_FEATS
            });

            // Cache rules in memory for 10 minutes
            cache.set(cacheKey, payload, 600);

            return {
                response: payload,
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.warn("Error fetching rules from database, using seed fallback:", error);
            const fallback = JSON.stringify({
                classes: SEED_CLASSES,
                species: SEED_SPECIES,
                backgrounds: SEED_BACKGROUNDS,
                originFeats: SEED_ORIGIN_FEATS,
                generalFeats: SEED_GENERAL_FEATS
            });
            return {
                response: fallback,
                header: "application/json",
                status: 200
            };
        }
    }

    /**
     * Upserts rules (classes, species, backgrounds, feats) from raw D&D Beyond character data.
     */
    public static async upsertRulesFromDndBeyond(rawCharacter: any): Promise<number> {
        if (!rawCharacter || !AppDataSource.isInitialized) return 0;
        let count = 0;

        try {
            const classRepo = AppDataSource.getRepository(RuleClass);
            const speciesRepo = AppDataSource.getRepository(RuleSpecies);
            const bgRepo = AppDataSource.getRepository(RuleBackground);
            const featRepo = AppDataSource.getRepository(RuleFeat);

            // 1. Classes & Subclasses & Class Features
            if (Array.isArray(rawCharacter.classes)) {
                for (const c of rawCharacter.classes) {
                    const def = c.definition;
                    if (!def || !def.name) continue;
                    const className = String(def.name).trim();
                    const slug = slugify(className);
                    if (!slug) continue;

                    const subDef = c.subclassDefinition;
                    const classFeatures: any[] = Array.isArray(c.classFeatures) ? c.classFeatures : [];

                    const extractedFeatures: Array<{ level: number; name: string; description: string }> = [];
                    for (const cf of classFeatures) {
                        const fDef = cf.definition;
                        if (fDef && fDef.name) {
                            extractedFeatures.push({
                                level: Number(fDef.requiredLevel) || 1,
                                name: String(fDef.name).trim(),
                                description: cleanHtmlTags(fDef.description || "")
                            });
                        }
                    }

                    let ruleClass = await classRepo.findOne({ where: { slug } });
                    if (ruleClass) {
                        let subclasses: any[] = this.safeParse(ruleClass.subclassesJson, []);
                        if (subDef && subDef.name) {
                            const subSlug = slugify(subDef.name);
                            if (!subclasses.some((s: any) => s.id === subSlug || s.name.toLowerCase() === subDef.name.toLowerCase())) {
                                subclasses.push({
                                    id: subSlug,
                                    name: subDef.name,
                                    description: cleanHtmlTags(subDef.description || ""),
                                    features: []
                                });
                                ruleClass.subclassesJson = JSON.stringify(subclasses);
                                count++;
                            }
                        }

                        let existingFeatures: any[] = this.safeParse(ruleClass.featuresJson, []);
                        let featuresChanged = false;
                        for (const ef of extractedFeatures) {
                            if (!existingFeatures.some((f: any) => f.name.toLowerCase() === ef.name.toLowerCase())) {
                                existingFeatures.push(ef);
                                featuresChanged = true;
                                count++;
                            }
                        }
                        if (featuresChanged) {
                            existingFeatures.sort((a, b) => a.level - b.level);
                            ruleClass.featuresJson = JSON.stringify(existingFeatures);
                        }

                        await classRepo.save(ruleClass);
                    } else {
                        const subclasses: any[] = [];
                        if (subDef && subDef.name) {
                            subclasses.push({
                                id: slugify(subDef.name),
                                name: subDef.name,
                                description: cleanHtmlTags(subDef.description || ""),
                                features: []
                            });
                        }

                        const newClass = classRepo.create({
                            slug,
                            name: className,
                            description: cleanHtmlTags(def.description || `The ${className} class.`),
                            hitDie: Number(def.hitDice) || 8,
                            primaryAbilitiesJson: JSON.stringify(["str", "dex"]),
                            savingThrowsJson: JSON.stringify(["con", "wis"]),
                            armorProficienciesJson: JSON.stringify(["Light Armor"]),
                            weaponProficienciesJson: JSON.stringify(["Simple Weapons"]),
                            weaponMasteryCount: 0,
                            skillChoicesJson: JSON.stringify({ count: 2, from: ["Athletics", "Perception", "Insight"] }),
                            featuresJson: JSON.stringify(extractedFeatures),
                            subclassesJson: JSON.stringify(subclasses),
                            source: "D&D Beyond",
                            dndBeyondId: def.id ? Number(def.id) : undefined,
                            isCustom: false
                        });
                        await classRepo.save(newClass);
                        count++;
                    }
                }
            }

            // 2. Species / Race & Traits
            if (rawCharacter.race) {
                const race = rawCharacter.race;
                const raceName = String(race.baseRaceName || race.fullName || "").trim();
                if (raceName) {
                    const slug = slugify(raceName);
                    if (slug) {
                        const racialTraits: any[] = Array.isArray(race.racialTraits) ? race.racialTraits : [];
                        const extractedTraits: Array<{ name: string; description: string }> = [];
                        for (const rt of racialTraits) {
                            const tDef = rt.definition;
                            if (tDef && tDef.name) {
                                extractedTraits.push({
                                    name: String(tDef.name).trim(),
                                    description: cleanHtmlTags(tDef.description || "")
                                });
                            }
                        }

                        let ruleSpecies = await speciesRepo.findOne({ where: { slug } });
                        if (ruleSpecies) {
                            let existingTraits: any[] = this.safeParse(ruleSpecies.traitsJson, []);
                            let changed = false;
                            for (const et of extractedTraits) {
                                if (!existingTraits.some((t: any) => t.name.toLowerCase() === et.name.toLowerCase())) {
                                    existingTraits.push(et);
                                    changed = true;
                                    count++;
                                }
                            }
                            if (changed) {
                                ruleSpecies.traitsJson = JSON.stringify(existingTraits);
                                await speciesRepo.save(ruleSpecies);
                            }
                        } else {
                            const newSpecies = speciesRepo.create({
                                slug,
                                name: raceName,
                                description: cleanHtmlTags(race.description || `The ${raceName} species.`),
                                size: "Medium",
                                speed: Number(race.weightSpeeds?.normal?.walk) || 30,
                                traitsJson: JSON.stringify(extractedTraits),
                                source: "D&D Beyond",
                                dndBeyondId: race.id ? Number(race.id) : undefined,
                                isCustom: false
                            });
                            await speciesRepo.save(newSpecies);
                            count++;
                        }
                    }
                }
            }

            // 3. Background
            if (rawCharacter.background && rawCharacter.background.definition) {
                const bgDef = rawCharacter.background.definition;
                const bgName = String(bgDef.name || "").trim();
                if (bgName) {
                    const slug = slugify(bgName);
                    if (slug) {
                        let ruleBg = await bgRepo.findOne({ where: { slug } });
                        if (!ruleBg) {
                            ruleBg = bgRepo.create({
                                slug,
                                name: bgName,
                                description: cleanHtmlTags(bgDef.description || `The ${bgName} background.`),
                                allowedAbilitiesJson: JSON.stringify(["str", "dex", "con"]),
                                skillsJson: JSON.stringify([]),
                                tool: "",
                                originFeatId: "",
                                equipmentSummary: "",
                                source: "D&D Beyond",
                                dndBeyondId: bgDef.id ? Number(bgDef.id) : undefined,
                                isCustom: false
                            });
                            await bgRepo.save(ruleBg);
                            count++;
                        }
                    }
                }
            }

            // 4. Feats
            if (Array.isArray(rawCharacter.feats)) {
                for (const f of rawCharacter.feats) {
                    const fDef = f.definition;
                    if (!fDef || !fDef.name) continue;
                    const featName = String(fDef.name).trim();
                    const slug = slugify(featName);
                    if (!slug) continue;

                    let ruleFeat = await featRepo.findOne({ where: { slug } });
                    if (!ruleFeat) {
                        ruleFeat = featRepo.create({
                            slug,
                            name: featName,
                            description: cleanHtmlTags(fDef.description || ""),
                            category: "general",
                            benefitsJson: JSON.stringify([cleanHtmlTags(fDef.description || "")]),
                            source: "D&D Beyond",
                            dndBeyondId: fDef.id ? Number(fDef.id) : undefined,
                            isCustom: false
                        });
                        await featRepo.save(ruleFeat);
                        count++;
                    }
                }
            }

            if (count > 0) {
                // Invalidate rules cache
                cache.del("dnd_rules_all");
            }
        } catch (err) {
            console.error("Error upserting rules from D&D Beyond character:", err);
        }

        return count;
    }

    /**
     * Upserts rules from an imported or saved character payload.
     */
    public static async upsertRulesFromCharacter(inputCharacter: any, payloadToSave: any): Promise<number> {
        let count = 0;
        // If raw D&D Beyond structure is present, extract rich definitions
        if (inputCharacter && (inputCharacter.classes || inputCharacter.race || inputCharacter.background || inputCharacter.feats)) {
            count += await this.upsertRulesFromDndBeyond(inputCharacter);
        }

        if (!AppDataSource.isInitialized || !payloadToSave) return count;

        try {
            const classRepo = AppDataSource.getRepository(RuleClass);
            const speciesRepo = AppDataSource.getRepository(RuleSpecies);
            const bgRepo = AppDataSource.getRepository(RuleBackground);

            // Classes from saved payload
            if (Array.isArray(payloadToSave.classes)) {
                for (const cls of payloadToSave.classes) {
                    const name = String(cls.name || "").trim();
                    const slug = slugify(name);
                    if (!slug) continue;

                    let ruleClass = await classRepo.findOne({ where: { slug } });
                    if (!ruleClass) {
                        ruleClass = classRepo.create({
                            slug,
                            name,
                            description: `The ${name} class.`,
                            hitDie: Number(cls.hitDie) || 8,
                            primaryAbilitiesJson: JSON.stringify(["str", "dex"]),
                            savingThrowsJson: JSON.stringify(["con", "wis"]),
                            armorProficienciesJson: JSON.stringify(["Light Armor"]),
                            weaponProficienciesJson: JSON.stringify(["Simple Weapons"]),
                            weaponMasteryCount: 0,
                            skillChoicesJson: JSON.stringify({ count: 2, from: ["Athletics", "Perception"] }),
                            featuresJson: JSON.stringify([]),
                            subclassesJson: JSON.stringify(cls.subclass ? [{ id: slugify(cls.subclass), name: cls.subclass, description: "", features: [] }] : []),
                            source: "Imported Character"
                        });
                        await classRepo.save(ruleClass);
                        count++;
                    } else if (cls.subclass) {
                        let subs: any[] = this.safeParse(ruleClass.subclassesJson, []);
                        const subSlug = slugify(cls.subclass);
                        if (!subs.some((s: any) => s.id === subSlug || s.name.toLowerCase() === cls.subclass.toLowerCase())) {
                            subs.push({ id: subSlug, name: cls.subclass, description: "", features: [] });
                            ruleClass.subclassesJson = JSON.stringify(subs);
                            await classRepo.save(ruleClass);
                            count++;
                        }
                    }
                }
            }

            // Species from saved payload
            if (payloadToSave.race) {
                const raceName = String(payloadToSave.race).trim();
                const slug = slugify(raceName);
                if (slug) {
                    const existing = await speciesRepo.findOne({ where: { slug } });
                    if (!existing) {
                        const newSpecies = speciesRepo.create({
                            slug,
                            name: raceName,
                            description: `The ${raceName} species.`,
                            size: "Medium",
                            speed: 30,
                            traitsJson: JSON.stringify([]),
                            source: "Imported Character"
                        });
                        await speciesRepo.save(newSpecies);
                        count++;
                    }
                }
            }

            // Background from saved payload
            if (payloadToSave.background) {
                const bgName = String(payloadToSave.background).trim();
                const slug = slugify(bgName);
                if (slug) {
                    const existing = await bgRepo.findOne({ where: { slug } });
                    if (!existing) {
                        const newBg = bgRepo.create({
                            slug,
                            name: bgName,
                            description: `The ${bgName} background.`,
                            allowedAbilitiesJson: JSON.stringify(["str", "dex", "con"]),
                            skillsJson: JSON.stringify([]),
                            tool: "",
                            originFeatId: "",
                            equipmentSummary: "",
                            source: "Imported Character"
                        });
                        await bgRepo.save(newBg);
                        count++;
                    }
                }
            }

            if (count > 0) {
                cache.del("dnd_rules_all");
            }
        } catch (err) {
            console.error("Error upserting rules from character payload:", err);
        }

        return count;
    }

    private static safeParse(json: string | null | undefined, fallback: any): any {
        if (!json) return fallback;
        try {
            return JSON.parse(json);
        } catch {
            return fallback;
        }
    }
}
