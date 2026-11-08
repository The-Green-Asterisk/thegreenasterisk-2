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
    public static inferFeatureLevel(name: string, description: string, explicitLevel?: number): number {
        const raw = Number(explicitLevel);
        if (!Number.isNaN(raw) && raw >= 1 && raw <= 20 && raw !== 3) {
            return raw;
        }
        const text = description || "";
        const match = text.match(/\b(?:starting at|beginning at|at|gain(?:s)? at)\s+(\d+)(?:st|nd|rd|th)?\s+level\b/i) ||
                      text.match(/\b(\d+)(?:st|nd|rd|th)\s+level\b/i);
        if (match) {
            const parsed = parseInt(match[1], 10);
            if (parsed >= 1 && parsed <= 20) {
                return parsed;
            }
        }
        if (!Number.isNaN(raw) && raw >= 1 && raw <= 20) {
            return raw;
        }
        return 3;
    }

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
            } else if (typeof classRepo.find === "function" && typeof classRepo.save === "function") {
                const existingClasses = await classRepo.find();
                const toUpdate: RuleClass[] = [];
                for (const rc of existingClasses) {
                    if (rc.isCustom) continue;
                    const seedCls = SEED_CLASSES.find((sc) => sc.id === rc.slug);
                    if (!seedCls) continue;

                    const currentFeatures: any[] = this.safeParse(rc.featuresJson, []);
                    const mergedFeatures = (seedCls.features || []).map((sf) => {
                        const existingDdb = currentFeatures.find(
                            (cf) => cf?.fromDndBeyond && String(cf.name || "").toLowerCase() === sf.name.toLowerCase()
                        );
                        return existingDdb || sf;
                    });
                    for (const cf of currentFeatures) {
                        if (cf?.fromDndBeyond && !mergedFeatures.some((mf) => String(mf.name || "").toLowerCase() === String(cf.name || "").toLowerCase())) {
                            mergedFeatures.push(cf);
                        }
                    }

                    const currentSubs: any[] = this.safeParse(rc.subclassesJson, []);
                    const mergedSubs = (seedCls.subclasses || []).map((ss) => {
                        const existingSub = currentSubs.find(
                            (cs) => cs?.id === ss.id || String(cs?.name || "").toLowerCase() === ss.name.toLowerCase()
                        );
                        if (!existingSub) return ss;
                        const existingSubFeatures: any[] = Array.isArray(existingSub.features) ? existingSub.features : [];
                        const mergedSubFeatures = (ss.features || []).map((ssf) => {
                            const ddbSubFeat = existingSubFeatures.find(
                                (esf) => esf?.fromDndBeyond && String(esf.name || "").toLowerCase() === ssf.name.toLowerCase()
                            );
                            if (!ddbSubFeat) return ssf;
                            return {
                                ...ssf,
                                ...ddbSubFeat,
                                level: ssf.level || this.inferFeatureLevel(ssf.name, ddbSubFeat.description || ssf.description, ddbSubFeat.level)
                            };
                        });
                        for (const esf of existingSubFeatures) {
                            if (esf?.fromDndBeyond && !mergedSubFeatures.some((msf) => String(msf.name || "").toLowerCase() === String(esf.name || "").toLowerCase())) {
                                mergedSubFeatures.push({
                                    ...esf,
                                    level: this.inferFeatureLevel(esf.name, esf.description, esf.level)
                                });
                            }
                        }
                        return {
                            ...ss,
                            description: existingSub.fromDndBeyond && existingSub.description ? existingSub.description : ss.description,
                            fromDndBeyond: existingSub.fromDndBeyond || false,
                            dndBeyondActions: existingSub.dndBeyondActions || undefined,
                            features: mergedSubFeatures
                        };
                    });

                    for (const cs of currentSubs) {
                        if (cs && !mergedSubs.some((ms) => ms.id === cs.id || String(ms.name || "").toLowerCase() === String(cs.name || "").toLowerCase())) {
                            mergedSubs.push(cs);
                        }
                    }

                    const desiredSubclassesJson = JSON.stringify(mergedSubs);
                    const desiredFeaturesJson = JSON.stringify(mergedFeatures);
                    if (rc.subclassesJson !== desiredSubclassesJson || rc.featuresJson !== desiredFeaturesJson) {
                        rc.subclassesJson = desiredSubclassesJson;
                        rc.featuresJson = desiredFeaturesJson;
                        toUpdate.push(rc);
                    }
                }
                if (toUpdate.length > 0) {
                    await classRepo.save(toUpdate);
                }
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

            const classes = dbClasses.map((rc) => {
                const seedCls = SEED_CLASSES.find((sc) => sc.id === rc.slug);
                const rawSubs = this.safeParse(rc.subclassesJson, []);
                const baseFeats = new Set((seedCls?.features || []).map((f: any) => String(f.name || "").toLowerCase()));
                const subclasses = Array.isArray(rawSubs)
                    ? rawSubs.map((sub: any) => {
                          const seedSub = seedCls?.subclasses?.find((ss: any) => ss.id === sub.id || ss.name === sub.name);
                          const feats = (Array.isArray(sub.features) && sub.features.length > 0)
                              ? sub.features
                                    .filter((f: any) => !baseFeats.has(String(f.name || "").toLowerCase()))
                                    .map((f: any) => {
                                        const seedFeat = seedSub?.features?.find((sf: any) => sf.name.toLowerCase() === f.name.toLowerCase());
                                        return {
                                            ...f,
                                            level: seedFeat?.level || this.inferFeatureLevel(f.name, f.description, f.level)
                                        };
                                    })
                              : (seedSub?.features || []);
                          feats.sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
                          return {
                              ...sub,
                              features: feats
                          };
                      })
                    : (seedCls?.subclasses ? [...seedCls.subclasses] : []);

                if (seedCls?.subclasses) {
                    for (const ss of seedCls.subclasses) {
                        if (!subclasses.some((s: any) => s.id === ss.id || s.name.toLowerCase() === ss.name.toLowerCase())) {
                            subclasses.push(ss);
                        }
                    }
                }
                return {
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
                    subclasses,
                    startingEquipmentOptions: rc.startingEquipmentJson ? this.safeParse(rc.startingEquipmentJson, []) : []
                };
            });

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

                    // Extract base class features from def.classFeatures and c.classFeatures
                    const extractedFeatures: Array<{ level: number; name: string; description: string; htmlDescription: string; fromDndBeyond: boolean }> = [];
                    const defClassFeatures: any[] = Array.isArray(def.classFeatures) ? def.classFeatures : [];
                    const seedClsForFiltering = SEED_CLASSES.find((sc) => sc.id === slug);
                    const baseFeatureNames = new Set<string>([
                        ...defClassFeatures.map((f: any) => String(f.definition?.name || f.name || "").trim().toLowerCase()),
                        ...(seedClsForFiltering?.features || []).map((f: any) => String(f.name || "").trim().toLowerCase())
                    ].filter(Boolean));

                    for (const cf of [...defClassFeatures, ...classFeatures]) {
                        const fDef = cf.definition || cf;
                        if (fDef && fDef.name) {
                            const isSub = (subDef?.id && (fDef.classId === subDef.id || fDef.subclassId === subDef.id)) ||
                                fDef.isSubclassFeature === true ||
                                (subDef?.name && String(fDef.source || "").toLowerCase() === subDef.name.toLowerCase());
                            if (!isSub) {
                                const fName = String(fDef.name).trim();
                                baseFeatureNames.add(fName.toLowerCase());
                                const rawHtml = String(fDef.description || fDef.snippet || "").trim();
                                if (!extractedFeatures.some((f) => f.name.toLowerCase() === fName.toLowerCase())) {
                                    extractedFeatures.push({
                                        level: Number(fDef.requiredLevel || fDef.level) || 1,
                                        name: fName,
                                        description: cleanHtmlTags(rawHtml),
                                        htmlDescription: rawHtml,
                                        fromDndBeyond: true
                                    });
                                }
                            }
                        }
                    }

                    // Extract subclass features from subDef.classFeatures and c.classFeatures
                    const extractedSubclassFeatures: Array<{ level: number; name: string; description: string; htmlDescription: string; fromDndBeyond: boolean }> = [];
                    if (subDef && subDef.name) {
                        const rawSubName = String(subDef.name).trim();
                        const cleanSubName = rawSubName.replace(/\s*\([^)]+\)\s*$/, "").trim();
                        const subFeaturesList = Array.isArray(subDef.classFeatures) ? subDef.classFeatures : [];
                        for (const scf of subFeaturesList) {
                            const fDef = scf.definition || scf;
                            if (fDef && fDef.name) {
                                const fName = String(fDef.name).trim();
                                // Avoid base class features leaking into subclass features
                                if (baseFeatureNames.has(fName.toLowerCase())) continue;
                                const rawHtml = String(fDef.description || fDef.snippet || "").trim();
                                if (!extractedSubclassFeatures.some((f) => f.name.toLowerCase() === fName.toLowerCase())) {
                                    extractedSubclassFeatures.push({
                                        level: this.inferFeatureLevel(fName, rawHtml, Number(fDef.requiredLevel || fDef.level || scf.requiredLevel || scf.level)),
                                        name: fName,
                                        description: cleanHtmlTags(rawHtml),
                                        htmlDescription: rawHtml,
                                        fromDndBeyond: true
                                    });
                                }
                            }
                        }
                        for (const cf of classFeatures) {
                            const fDef = cf.definition || cf;
                            if (fDef && fDef.name) {
                                const fName = String(fDef.name).trim();
                                if (baseFeatureNames.has(fName.toLowerCase())) continue;
                                const isSub = (subDef.id && (fDef.classId === subDef.id || fDef.subclassId === subDef.id)) ||
                                    fDef.isSubclassFeature === true ||
                                    (def.id && fDef.classId && fDef.classId !== def.id) ||
                                    (fDef.source && (String(fDef.source).toLowerCase() === rawSubName.toLowerCase() || String(fDef.source).toLowerCase() === cleanSubName.toLowerCase()));
                                if (isSub) {
                                    const rawHtml = String(fDef.description || fDef.snippet || "").trim();
                                    if (!extractedSubclassFeatures.some((f) => f.name.toLowerCase() === fName.toLowerCase())) {
                                        extractedSubclassFeatures.push({
                                            level: this.inferFeatureLevel(fName, rawHtml, Number(fDef.requiredLevel || fDef.level || cf.requiredLevel || cf.level)),
                                            name: fName,
                                            description: cleanHtmlTags(rawHtml),
                                            htmlDescription: rawHtml,
                                            fromDndBeyond: true
                                        });
                                    }
                                }
                            }
                        }
                    }

                    let ruleClass = await classRepo.findOne({ where: { slug } });
                    if (ruleClass) {
                        let subclasses: any[] = this.safeParse(ruleClass.subclassesJson, []);
                        if (subDef && subDef.name) {
                            const rawSubName = String(subDef.name).trim();
                            const cleanSubName = rawSubName.replace(/\s*\([^)]+\)\s*$/, "").trim();
                            const subSlug = slugify(cleanSubName);
                            const rawSubSlug = slugify(rawSubName);
                            let targetSub = subclasses.find((s: any) =>
                                s.id === subSlug ||
                                s.id === rawSubSlug ||
                                s.name.toLowerCase() === cleanSubName.toLowerCase() ||
                                s.name.toLowerCase() === rawSubName.toLowerCase()
                            );
                            if (!targetSub) {
                                targetSub = {
                                    id: subSlug,
                                    name: cleanSubName,
                                    description: cleanHtmlTags(subDef.description || ""),
                                    fromDndBeyond: true,
                                    features: extractedSubclassFeatures
                                };
                                subclasses.push(targetSub);
                                count++;
                            } else {
                                targetSub.name = cleanSubName;
                                if (!Array.isArray(targetSub.features)) targetSub.features = [];
                                let subFeatsChanged = false;
                                for (const sf of extractedSubclassFeatures) {
                                    const existingIdx = targetSub.features.findIndex((f: any) => f.name.toLowerCase() === sf.name.toLowerCase());
                                    if (existingIdx === -1) {
                                        targetSub.features.push(sf);
                                        subFeatsChanged = true;
                                        count++;
                                    } else {
                                        const existing = targetSub.features[existingIdx];
                                        const newLevel = sf.level || this.inferFeatureLevel(sf.name, sf.description || existing.description, existing.level);
                                        if (existing.level !== newLevel || (sf.htmlDescription && existing.htmlDescription !== sf.htmlDescription)) {
                                            targetSub.features[existingIdx] = {
                                                ...existing,
                                                level: newLevel,
                                                description: sf.description || existing.description,
                                                htmlDescription: sf.htmlDescription || existing.htmlDescription,
                                                fromDndBeyond: true
                                            };
                                            subFeatsChanged = true;
                                            count++;
                                        }
                                    }
                                }
                                targetSub.features = targetSub.features.filter((f: any) => !baseFeatureNames.has(String(f.name || "").toLowerCase()));
                                targetSub.features.sort((a: any, b: any) => a.level - b.level);
                            }
                            ruleClass.subclassesJson = JSON.stringify(subclasses);
                        }

                        let existingFeatures: any[] = this.safeParse(ruleClass.featuresJson, []);
                        let featuresChanged = false;
                        for (const ef of extractedFeatures) {
                            const existingIdx = existingFeatures.findIndex((f: any) => f.name.toLowerCase() === ef.name.toLowerCase());
                            if (existingIdx === -1) {
                                existingFeatures.push(ef);
                                featuresChanged = true;
                                count++;
                            } else if (ef.htmlDescription && existingFeatures[existingIdx].htmlDescription !== ef.htmlDescription) {
                                existingFeatures[existingIdx] = {
                                    ...existingFeatures[existingIdx],
                                    description: ef.description || existingFeatures[existingIdx].description,
                                    htmlDescription: ef.htmlDescription,
                                    fromDndBeyond: true
                                };
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
                            const rawSubName = String(subDef.name).trim();
                            const cleanSubName = rawSubName.replace(/\s*\([^)]+\)\s*$/, "").trim();
                            subclasses.push({
                                id: slugify(cleanSubName),
                                name: cleanSubName,
                                description: cleanHtmlTags(subDef.description || ""),
                                features: extractedSubclassFeatures
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
                        const extractedTraits: Array<{ name: string; description: string; htmlDescription: string; fromDndBeyond: boolean }> = [];
                        for (const rt of racialTraits) {
                            const tDef = rt.definition;
                            if (tDef && tDef.name) {
                                const rawHtml = String(tDef.description || tDef.snippet || "").trim();
                                extractedTraits.push({
                                    name: String(tDef.name).trim(),
                                    description: cleanHtmlTags(rawHtml),
                                    htmlDescription: rawHtml,
                                    fromDndBeyond: true
                                });
                            }
                        }

                        let ruleSpecies = await speciesRepo.findOne({ where: { slug } });
                        if (ruleSpecies) {
                            let existingTraits: any[] = this.safeParse(ruleSpecies.traitsJson, []);
                            let changed = false;
                            for (const et of extractedTraits) {
                                const existingIdx = existingTraits.findIndex((t: any) => t.name.toLowerCase() === et.name.toLowerCase());
                                if (existingIdx === -1) {
                                    existingTraits.push(et);
                                    changed = true;
                                    count++;
                                } else if (et.htmlDescription && existingTraits[existingIdx].htmlDescription !== et.htmlDescription) {
                                    existingTraits[existingIdx] = {
                                        ...existingTraits[existingIdx],
                                        description: et.description || existingTraits[existingIdx].description,
                                        htmlDescription: et.htmlDescription,
                                        fromDndBeyond: true
                                    };
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
                    const rawHtml = String(fDef.description || fDef.snippet || "").trim();

                    let ruleFeat = await featRepo.findOne({ where: { slug } });
                    if (!ruleFeat) {
                        ruleFeat = featRepo.create({
                            slug,
                            name: featName,
                            description: rawHtml || cleanHtmlTags(rawHtml),
                            category: "general",
                            benefitsJson: JSON.stringify([cleanHtmlTags(rawHtml)]),
                            source: "D&D Beyond",
                            dndBeyondId: fDef.id ? Number(fDef.id) : undefined,
                            isCustom: false
                        });
                        await featRepo.save(ruleFeat);
                        count++;
                    } else if (rawHtml && ruleFeat.source !== "D&D Beyond") {
                        ruleFeat.description = rawHtml;
                        ruleFeat.source = "D&D Beyond";
                        if (fDef.id) ruleFeat.dndBeyondId = Number(fDef.id);
                        await featRepo.save(ruleFeat);
                        count++;
                    }
                }
            }

            if (count > 0) {
                // Invalidate rules cache
                cache.del("dnd_rules_all");
                await this.syncSiteCharactersWithDndBeyondDefinitions();
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
            const isDndBeyondPayload = Boolean(payloadToSave.dndBeyondUrl || inputCharacter?.dndBeyondUrl || payloadToSave.source === "dndbeyond");

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
                        if (typeof classRepo.save === "function") {
                            await classRepo.save(ruleClass);
                        }
                        count++;
                    }

                    // Populate/merge features from payloadToSave.features
                    if (Array.isArray(payloadToSave.features)) {
                        let existingClassFeatures: any[] = this.safeParse(ruleClass.featuresJson, []);
                        let existingSubclasses: any[] = this.safeParse(ruleClass.subclassesJson, []);
                        let subsChanged = false;
                        let featsChanged = false;

                        let targetSub: any = null;
                        if (cls.subclass) {
                            const rawSubName = String(cls.subclass).trim();
                            const cleanSubName = rawSubName.replace(/\s*\([^)]+\)\s*$/, "").trim();
                            const subSlug = slugify(cleanSubName);
                            const rawSubSlug = slugify(rawSubName);
                            targetSub = existingSubclasses.find((s: any) =>
                                s.id === subSlug ||
                                s.id === rawSubSlug ||
                                s.name.toLowerCase() === cleanSubName.toLowerCase() ||
                                s.name.toLowerCase() === rawSubName.toLowerCase()
                            );
                            if (!targetSub) {
                                targetSub = { id: subSlug, name: cleanSubName, description: "", features: [] };
                                existingSubclasses.push(targetSub);
                                subsChanged = true;
                                count++;
                            } else {
                                targetSub.name = cleanSubName;
                            }
                            if (!Array.isArray(targetSub.features)) targetSub.features = [];
                        }

                        const seedClsForFiltering = SEED_CLASSES.find((sc) => sc.id === ruleClass.slug || sc.name.toLowerCase() === name.toLowerCase());
                        const baseFeatureNames = new Set<string>([
                            ...(seedClsForFiltering?.features || []).map((f: any) => String(f.name || "").trim().toLowerCase()),
                            ...existingClassFeatures.map((f: any) => String(f.name || "").trim().toLowerCase())
                        ].filter(Boolean));

                        for (const feat of payloadToSave.features) {
                            if (!feat || !feat.name) continue;
                            const featType = String(feat.type || "").toLowerCase();
                            const featSource = String(feat.source || "").toLowerCase();
                            const featName = String(feat.name).trim();
                            const rawHtml = String(feat.description || "").trim();
                            const rawSubName = cls.subclass ? String(cls.subclass).trim().toLowerCase() : "";
                            const cleanSubName = cls.subclass ? String(cls.subclass).replace(/\s*\([^)]+\)\s*$/, "").trim().toLowerCase() : "";
                            const isBaseClassFeature = baseFeatureNames.has(featName.toLowerCase());

                            if (targetSub && !isBaseClassFeature && (featType.includes("subclass") || featSource === rawSubName || featSource === cleanSubName || (targetSub.name && featSource === targetSub.name.toLowerCase()))) {
                                const existingIdx = targetSub.features.findIndex((f: any) => f.name.toLowerCase() === featName.toLowerCase());
                                const featLvl = RulesController.inferFeatureLevel(featName, rawHtml, feat.level);
                                if (existingIdx === -1) {
                                    targetSub.features.push({
                                        level: featLvl,
                                        name: featName,
                                        description: cleanHtmlTags(rawHtml),
                                        htmlDescription: isDndBeyondPayload ? rawHtml : undefined,
                                        fromDndBeyond: isDndBeyondPayload
                                    });
                                    subsChanged = true;
                                    count++;
                                } else {
                                    const curr = targetSub.features[existingIdx];
                                    const needsDescUpdate = isDndBeyondPayload && rawHtml && curr.htmlDescription !== rawHtml;
                                    const newLvl = (feat.level && feat.level >= 1 && feat.level <= 20) ? feat.level : (featLvl !== 3 ? featLvl : (curr.level || 3));
                                    const needsLvlUpdate = curr.level !== newLvl;
                                    if (needsDescUpdate || needsLvlUpdate) {
                                        targetSub.features[existingIdx] = {
                                            ...curr,
                                            level: newLvl,
                                            description: (needsDescUpdate ? cleanHtmlTags(rawHtml) : undefined) || curr.description,
                                            htmlDescription: needsDescUpdate ? rawHtml : curr.htmlDescription,
                                            fromDndBeyond: isDndBeyondPayload || curr.fromDndBeyond
                                        };
                                        subsChanged = true;
                                        count++;
                                    }
                                }
                            } else if (featType === "class" || featSource === name.toLowerCase() || isBaseClassFeature) {
                                const existingIdx = existingClassFeatures.findIndex((f: any) => f.name.toLowerCase() === featName.toLowerCase());
                                const featLvl = RulesController.inferFeatureLevel(featName, rawHtml, feat.level || 1);
                                if (existingIdx === -1) {
                                    existingClassFeatures.push({
                                        level: featLvl,
                                        name: featName,
                                        description: cleanHtmlTags(rawHtml),
                                        htmlDescription: isDndBeyondPayload ? rawHtml : undefined,
                                        fromDndBeyond: isDndBeyondPayload
                                    });
                                    featsChanged = true;
                                    count++;
                                } else {
                                    const curr = existingClassFeatures[existingIdx];
                                    const needsDescUpdate = isDndBeyondPayload && rawHtml && curr.htmlDescription !== rawHtml;
                                    const newLvl = (feat.level && feat.level >= 1 && feat.level <= 20) ? feat.level : (featLvl !== 1 ? featLvl : (curr.level || 1));
                                    const needsLvlUpdate = curr.level !== newLvl;
                                    if (needsDescUpdate || needsLvlUpdate) {
                                        existingClassFeatures[existingIdx] = {
                                            ...curr,
                                            level: newLvl,
                                            description: (needsDescUpdate ? cleanHtmlTags(rawHtml) : undefined) || curr.description,
                                            htmlDescription: needsDescUpdate ? rawHtml : curr.htmlDescription,
                                            fromDndBeyond: isDndBeyondPayload || curr.fromDndBeyond
                                        };
                                        featsChanged = true;
                                        count++;
                                    }
                                }
                            }
                        }

                        if (targetSub && Array.isArray(targetSub.features)) {
                            const originalLen = targetSub.features.length;
                            targetSub.features = targetSub.features.filter((f: any) => !baseFeatureNames.has(String(f.name || "").toLowerCase()));
                            if (targetSub.features.length !== originalLen) {
                                subsChanged = true;
                            }
                        }

                        if (subsChanged) {
                            if (targetSub?.features) targetSub.features.sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
                            ruleClass.subclassesJson = JSON.stringify(existingSubclasses);
                        }
                        if (featsChanged) {
                            existingClassFeatures.sort((a: any, b: any) => (a.level || 0) - (b.level || 0));
                            ruleClass.featuresJson = JSON.stringify(existingClassFeatures);
                        }
                        if ((subsChanged || featsChanged) && typeof classRepo.save === "function") {
                            await classRepo.save(ruleClass);
                        }
                    } else if (cls.subclass) {
                        let subs: any[] = this.safeParse(ruleClass.subclassesJson, []);
                        const rawSubName = String(cls.subclass).trim();
                        const cleanSubName = rawSubName.replace(/\s*\([^)]+\)\s*$/, "").trim();
                        const subSlug = slugify(cleanSubName);
                        const rawSubSlug = slugify(rawSubName);
                        const existingSub = subs.find((s: any) =>
                            s.id === subSlug ||
                            s.id === rawSubSlug ||
                            s.name.toLowerCase() === cleanSubName.toLowerCase() ||
                            s.name.toLowerCase() === rawSubName.toLowerCase()
                        );
                        if (!existingSub) {
                            subs.push({ id: subSlug, name: cleanSubName, description: "", features: [] });
                            ruleClass.subclassesJson = JSON.stringify(subs);
                            if (typeof classRepo.save === "function") {
                                await classRepo.save(ruleClass);
                            }
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
                if (isDndBeyondPayload) {
                    await this.syncSiteCharactersWithDndBeyondDefinitions();
                }
            }
        } catch (err) {
            console.error("Error upserting rules from character payload:", err);
        }

        return count;
    }

    /**
     * POST /sync-character-rules
     * Ingests a loaded character's rules (classes, subclasses, species, backgrounds, feats) into the database.
     */
    public static async syncCharacterRules(req: http.IncomingMessage, _res: http.ServerResponse) {
        try {
            const body = await this.readBody(req);
            let count = 0;
            if (body?.rawCharacter) {
                count += await this.upsertRulesFromDndBeyond(body.rawCharacter);
            }
            if (body?.character) {
                count += await this.upsertRulesFromCharacter(body.character, body.character);
            }
            if (count > 0) {
                cache.del("dnd_rules_all");
            }
            return {
                response: JSON.stringify({ success: true, count }),
                header: "application/json",
                status: 200
            };
        } catch (err: any) {
            return {
                response: JSON.stringify({ error: err?.message || "Failed to sync character rules." }),
                status: 500
            };
        }
    }

    /**
     * Collects all canonical D&D Beyond feature definitions and class/subclass actions from:
     * 1) `SavedCharacter` records with `source === 'dndbeyond'`
     * 2) `RuleClass`, `RuleSpecies`, `RuleFeat` entries with `fromDndBeyond` or `source === 'D&D Beyond'`
     */
    public static async collectDndBeyondCanonicalDefinitions(): Promise<{
        featuresByKey: Map<string, { description: string; scaleValue?: string; limitedUse?: any }>;
        actionsByClassAndFeature: Map<string, any[]>;
    }> {
        const featuresByKey = new Map<string, { description: string; scaleValue?: string; limitedUse?: any }>();
        const actionsByClassAndFeature = new Map<string, any[]>();

        if (!AppDataSource.isInitialized) {
            return { featuresByKey, actionsByClassAndFeature };
        }

        try {
            // 1. From RuleClass, RuleSpecies, RuleFeat
            const classRepo = AppDataSource.getRepository(RuleClass);
            const speciesRepo = AppDataSource.getRepository(RuleSpecies);
            const featRepo = AppDataSource.getRepository(RuleFeat);

            const [dbClasses, dbSpecies, dbFeats] = await Promise.all([
                typeof classRepo.find === "function" ? classRepo.find() : Promise.resolve([]),
                typeof speciesRepo.find === "function" ? speciesRepo.find() : Promise.resolve([]),
                typeof featRepo.find === "function" ? featRepo.find() : Promise.resolve([])
            ]);

            for (const rc of dbClasses) {
                const cNameLower = String(rc.name || "").toLowerCase();
                const cFeats: any[] = this.safeParse(rc.featuresJson, []);
                for (const cf of cFeats) {
                    if (cf?.fromDndBeyond && (cf.htmlDescription || cf.description)) {
                        const desc = cf.htmlDescription || `<p>${cf.description}</p>`;
                        featuresByKey.set(`${cNameLower}::${String(cf.name).toLowerCase()}`, { description: desc });
                        featuresByKey.set(`any::${String(cf.name).toLowerCase()}`, { description: desc });
                    }
                }
                const subs: any[] = this.safeParse(rc.subclassesJson, []);
                for (const sub of subs) {
                    const sNameLower = String(sub?.name || "").toLowerCase();
                    for (const sf of Array.isArray(sub?.features) ? sub.features : []) {
                        if (sf?.fromDndBeyond && (sf.htmlDescription || sf.description)) {
                            const desc = sf.htmlDescription || `<p>${sf.description}</p>`;
                            featuresByKey.set(`${sNameLower}::${String(sf.name).toLowerCase()}`, { description: desc });
                            featuresByKey.set(`any::${String(sf.name).toLowerCase()}`, { description: desc });
                        }
                    }
                }
            }

            for (const rs of dbSpecies) {
                const sNameLower = String(rs.name || "").toLowerCase();
                const traits: any[] = this.safeParse(rs.traitsJson, []);
                for (const t of traits) {
                    if (t?.fromDndBeyond && (t.htmlDescription || t.description)) {
                        const desc = t.htmlDescription || `<p>${t.description}</p>`;
                        featuresByKey.set(`${sNameLower}::${String(t.name).toLowerCase()}`, { description: desc });
                        featuresByKey.set(`any::${String(t.name).toLowerCase()}`, { description: desc });
                    }
                }
            }

            for (const rf of dbFeats) {
                if (rf.source === "D&D Beyond" && rf.description) {
                    const desc = /^<\s*p[\s>]/i.test(rf.description.trim()) ? rf.description.trim() : `<p>${rf.description.trim()}</p>`;
                    featuresByKey.set(`feat::${String(rf.name).toLowerCase()}`, { description: desc });
                    featuresByKey.set(`any::${String(rf.name).toLowerCase()}`, { description: desc });
                }
            }

            // 2. From SavedCharacter records with source = 'dndbeyond'
            const savedRepo = AppDataSource.getRepository("SavedCharacter" as any);
            if (typeof savedRepo.find === "function") {
                const ddbCharacters = await savedRepo.find({ where: { source: "dndbeyond" } });
                for (const ddbRecord of ddbCharacters) {
                    const parsed = this.safeParse(ddbRecord.payload, null);
                    if (!parsed || typeof parsed !== "object") continue;

                    for (const f of Array.isArray(parsed.features) ? parsed.features : []) {
                        if (!f?.name || !f?.description) continue;
                        const srcLower = String(f.source || "").toLowerCase().trim();
                        const nameLower = String(f.name || "").toLowerCase().trim();
                        const entry = {
                            description: f.description,
                            scaleValue: f.scaleValue,
                            limitedUse: f.limitedUse
                        };
                        featuresByKey.set(`${srcLower}::${nameLower}`, entry);
                        if (!featuresByKey.has(`any::${nameLower}`)) {
                            featuresByKey.set(`any::${nameLower}`, entry);
                        }
                    }

                    // Collect canonical D&D Beyond class/subclass actions grouped by base feature name
                    const weaponNames = new Set(
                        (Array.isArray(parsed.weapons) ? parsed.weapons : []).map((w: any) => String(w?.name || "").toLowerCase())
                    );
                    const charClasses: string[] = (Array.isArray(parsed.classes) ? parsed.classes : []).map((c: any) =>
                        String(c?.name || "").toLowerCase()
                    );
                    const seenActionByClassKey = new Set<string>();

                    for (const a of Array.isArray(parsed.actions) ? parsed.actions : []) {
                        if (!a?.name || a.spellName) continue;
                        const aNameLower = String(a.name).toLowerCase().trim();
                        if (weaponNames.has(aNameLower)) continue;
                        if (aNameLower.startsWith("circle spell:") || aNameLower === "initiate a circle spell") continue;

                        // Map action to its governing feature key (e.g., "Wild Resurgence: Regain Wild Shape" -> "wild resurgence", "Wild Shape: Circle Forms" -> "circle forms", "Leave Druidic Message" -> "druidic")
                        let featureTriggerKey = aNameLower.split(":")[0].trim();
                        const afterColon = aNameLower.includes(":") ? aNameLower.split(":").slice(1).join(":").trim() : "";
                        const parsedFeatureNames = new Set(
                            (Array.isArray(parsed.features) ? parsed.features : []).map((f: any) => String(f?.name || "").toLowerCase().trim())
                        );
                        if (afterColon && parsedFeatureNames.has(afterColon)) {
                            featureTriggerKey = afterColon;
                        } else if (aNameLower === "leave druidic message") {
                            featureTriggerKey = "druidic";
                        } else if (aNameLower === "regain bardic inspiration") {
                            featureTriggerKey = "font of inspiration";
                        }

                        for (const clsLower of charClasses) {
                            const mapKey = `${clsLower}::${featureTriggerKey}`;
                            const dedupeKey = `${mapKey}::${aNameLower}`;
                            if (seenActionByClassKey.has(dedupeKey)) continue;
                            seenActionByClassKey.add(dedupeKey);

                            const list = actionsByClassAndFeature.get(mapKey) || [];
                            list.push({
                                name: a.name,
                                type: a.type,
                                rangeOrReach: a.rangeOrReach || "Special",
                                hitOrDc: a.hitOrDc || "Special",
                                damageOrEffect: a.damageOrEffect || "Class Feature",
                                notes: a.notes || ""
                            });
                            actionsByClassAndFeature.set(mapKey, list);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("Could not collect D&D Beyond canonical definitions:", err);
        }

        return { featuresByKey, actionsByClassAndFeature };
    }

    /**
     * Applies any available D&D Beyond-provided feature descriptions and class/subclass actions
     * onto a site-created character object in place. Returns true if any definition was updated.
     */
    public static async applyDndBeyondDefinitionsToSiteCharacter(character: any): Promise<boolean> {
        if (!character || typeof character !== "object") return false;
        const { featuresByKey, actionsByClassAndFeature } = await this.collectDndBeyondCanonicalDefinitions();
        if (featuresByKey.size === 0 && actionsByClassAndFeature.size === 0) return false;

        let changed = false;

        // 1. Upgrade matching feature descriptions with canonical D&D Beyond HTML descriptions
        if (Array.isArray(character.features)) {
            for (const f of character.features) {
                if (!f?.name) continue;
                const srcLower = String(f.source || "").toLowerCase().trim();
                const nameLower = String(f.name || "").toLowerCase().trim();
                const shortOptionName = nameLower.includes(":") ? nameLower.split(":").slice(1).join(":").trim() : "";

                const match =
                    featuresByKey.get(`${srcLower}::${nameLower}`) ||
                    (f.type === "Feat" ? featuresByKey.get(`feat::${nameLower}`) : undefined) ||
                    featuresByKey.get(`any::${nameLower}`) ||
                    (shortOptionName ? featuresByKey.get(`${srcLower}::${shortOptionName}`) || featuresByKey.get(`any::${shortOptionName}`) : undefined);

                if (match && match.description && f.description !== match.description) {
                    f.description = match.description;
                    if (match.scaleValue && !f.scaleValue) f.scaleValue = match.scaleValue;
                    if (match.limitedUse && !f.limitedUse) f.limitedUse = match.limitedUse;
                    changed = true;
                }
            }
        }

        // 1.5. Upgrade Unarmed Strike with the robust D&D Beyond 2024 definition (Damage, Grapple, and Shove)
        if (Array.isArray(character.actions)) {
            for (const act of character.actions) {
                if (String(act?.name || "").toLowerCase().trim() === "unarmed strike") {
                    const needsUpgrade = !act.damageOrEffect || !act.damageOrEffect.includes("Grapple") || !act.damageOrEffect.includes("{{savedc:str}}");
                    if (needsUpgrade) {
                        act.rangeOrReach = "Reach 5 ft.";
                        act.hitOrDc = "Special";
                        act.damageOrEffect = "You make a melee attack to damage, grapple, or shove a target within 5 ft. of you.\r\n\r\n<strong><em>Damage.</em></strong> You make an attack roll against the target. <em>To Hit:</em> {{modifier:str+proficiency}}. <em>On a Hit:</em> {{1+modifier:str#unsigned}} Bludgeoning damage.\r\n\r\n<strong><em>Grapple.</em></strong> The target must succeed on a <strong>DC {{savedc:str}}</strong> Str. or Dex. save (it chooses which), or it has the Grappled condition. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.\r\n\r\n<strong><em>Shove.</em></strong> The target must succeed on a <strong>DC {{savedc:str}}</strong> Str. or Dex. save (it chooses which), or you either push it 5 ft. away or cause it to have the Prone condition. This shove is possible only if the target is no more than one size larger than you.";
                        act.notes = "<p>Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an [rules]Unarmed Strike[/rules]—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.</p>";
                        changed = true;
                    }
                }
            }
        }

        // 2. Replace synthesized class/subclass feature actions with canonical D&D Beyond actions where available
        if (Array.isArray(character.actions) && Array.isArray(character.classes) && Array.isArray(character.features)) {
            const charClasses = character.classes.map((c: any) => String(c?.name || "").toLowerCase().trim());
            const charFeaturesLower = new Set<string>(
                character.features.map((f: any) => String(f?.name || "").toLowerCase().trim())
            );
            // If a character has Spellcasting for Druid, they also have Druidic at level 1
            if (charClasses.includes("druid")) {
                charFeaturesLower.add("druidic");
            }

            const canonicalReplacements = new Map<string, any[]>();
            for (const clsLower of charClasses) {
                for (const featLower of charFeaturesLower) {
                    const key = `${clsLower}::${featLower}`;
                    const ddbActs = actionsByClassAndFeature.get(key);
                    if (ddbActs && ddbActs.length > 0) {
                        canonicalReplacements.set(featLower, ddbActs);
                    }
                }
            }

            if (canonicalReplacements.size > 0) {
                const updatedActions: any[] = [];
                const handledFeatures = new Set<string>();

                for (const act of character.actions) {
                    const actNameLower = String(act?.name || "").toLowerCase().trim();
                    const baseFeatKey = actNameLower === "leave druidic message"
                        ? "druidic"
                        : actNameLower.split(":")[0].trim();

                    if (!act?.spellName && canonicalReplacements.has(baseFeatKey)) {
                        if (!handledFeatures.has(baseFeatKey)) {
                            handledFeatures.add(baseFeatKey);
                            updatedActions.push(...canonicalReplacements.get(baseFeatKey)!);
                        }
                    } else {
                        updatedActions.push(act);
                    }
                }

                // Append any canonical actions whose base feature (like "druidic" -> "Leave Druidic Message") had no prior action card
                for (const [featKey, ddbActs] of canonicalReplacements.entries()) {
                    if (!handledFeatures.has(featKey)) {
                        handledFeatures.add(featKey);
                        updatedActions.push(...ddbActs);
                    }
                }

                if (JSON.stringify(updatedActions) !== JSON.stringify(character.actions)) {
                    character.actions = updatedActions;
                    changed = true;
                }
            }
        }

        return changed;
    }

    /**
     * Propagates all D&D Beyond-provided definitions onto all saved `source = 'site'` characters in the database.
     */
    public static async syncSiteCharactersWithDndBeyondDefinitions(): Promise<number> {
        if (!AppDataSource.isInitialized) return 0;
        let updatedCount = 0;

        try {
            const savedRepo = AppDataSource.getRepository("SavedCharacter" as any);
            const featureRepo = AppDataSource.getRepository("CharacterFeature" as any);
            if (typeof savedRepo.find !== "function") return 0;

            const siteCharacters = await savedRepo.find({ where: { source: "site" } });
            for (const record of siteCharacters) {
                const parsed = this.safeParse(record.payload, null);
                if (!parsed || typeof parsed !== "object") continue;

                const changed = await this.applyDndBeyondDefinitionsToSiteCharacter(parsed);
                if (changed) {
                    record.payload = JSON.stringify(parsed);
                    await savedRepo.update(record.id, { payload: record.payload });

                    if (Array.isArray(parsed.features) && typeof featureRepo.delete === "function" && typeof featureRepo.save === "function") {
                        await featureRepo.delete({ savedCharacter: { id: record.id } });
                        const charRef = { id: record.id } as any;
                        const featureEntities = parsed.features.map((f: any) =>
                            featureRepo.create({
                                savedCharacter: charRef,
                                name: f.name,
                                source: f.source || "Class",
                                type: f.type || "Class",
                                description: f.description || "",
                                scaleValue: f.scaleValue || undefined,
                                limitedUse: f.limitedUse || undefined
                            })
                        );
                        if (featureEntities.length > 0) {
                            await featureRepo.save(featureEntities);
                        }
                    }
                    updatedCount++;
                }
            }
        } catch (err) {
            console.warn("Could not sync site characters with D&D Beyond definitions:", err);
        }

        return updatedCount;
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
