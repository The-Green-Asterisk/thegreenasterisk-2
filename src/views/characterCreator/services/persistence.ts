import { getData, postData, putData } from "@services/request";
import {
    resolveClassResources,
    AbilityName,
    BASE_ARMOR_2024,
    BASE_WEAPONS_2024,
    calculateMulticlassSpellSlots,
    CLASSES_2024,
    RuleSpellDefinition,
    SPELLS_2024,
    WEAPON_MASTERIES
} from "../../../rules/dnd5e_2024";
import { ALL_SKILLS } from "../characterCreator.types";
import { getOrdinalSuffix } from "../components/class";
import { applyDndBeyondAbilityChoices } from "./dndBeyondAbilityChoices";
import { getProgressionChoices, getProgressionModifiers, getProgressionPools, isStateFieldChoice, optionAvailableAt, poolSingular, setProgressionChoice } from "./progressionModifiers";
import { distributeImportedSkills, getGrantedExpertiseSkills, getProficientSkills, getSkillBonusExtras, sanitizeSkillSelections } from "./skillRules";
import { CharacterCreatorContext } from "../controllers/context";
import { MAGIC_INITIATE_BUCKET_KEY, getProgressionGrantedSpellNames, resolveSpellBucketKey } from "./spellReconciliation";

function getSpellDef(ctx: CharacterCreatorContext, spNameOrId: string): RuleSpellDefinition | undefined {
    if (!spNameOrId) return undefined;
    const lower = spNameOrId.toLowerCase().trim();
    if (ctx.getSpell) {
        const found = ctx.getSpell(lower);
        if (found) return found;
    }
    const list = (ctx.spells && ctx.spells.length > 0) ? ctx.spells : SPELLS_2024;
    return list.find((s) => s.name.toLowerCase() === lower || s.id.toLowerCase() === lower);
}

function applyProgressionChoiceOption(characterPayload: any, opt: any, level: number) {
    if (!characterPayload || !opt) return;

    if (Array.isArray(opt.grantedSpells) && opt.grantedSpells.length > 0) {
        if (!characterPayload.spells) characterPayload.spells = {};
        if (!Array.isArray(characterPayload.spells.alwaysPrepared)) characterPayload.spells.alwaysPrepared = [];
        for (const sp of opt.grantedSpells) {
            const spellName = typeof sp === "string" ? sp : (sp.name || sp.spellId);
            if (spellName && !characterPayload.spells.alwaysPrepared.includes(spellName)) {
                characterPayload.spells.alwaysPrepared.push(spellName);
            }
        }
    }

    if (Array.isArray(opt.grantedWeapons) && opt.grantedWeapons.length > 0) {
        if (!Array.isArray(characterPayload.weaponProficiencies)) characterPayload.weaponProficiencies = [];
        for (const w of opt.grantedWeapons) {
            if (!characterPayload.weaponProficiencies.includes(w)) {
                characterPayload.weaponProficiencies.push(w);
            }
        }
    }

    if (Array.isArray(opt.grantedArmor) && opt.grantedArmor.length > 0) {
        if (!Array.isArray(characterPayload.armorProficiencies)) characterPayload.armorProficiencies = [];
        for (const a of opt.grantedArmor) {
            if (!characterPayload.armorProficiencies.includes(a)) {
                characterPayload.armorProficiencies.push(a);
            }
        }
    }

    if (Array.isArray(opt.grantedSkills) && opt.grantedSkills.length > 0) {
        if (!Array.isArray(characterPayload.skills)) characterPayload.skills = [];
        for (const sk of opt.grantedSkills) {
            const existing = characterPayload.skills.find((s: any) => s.name === sk);
            if (existing) {
                existing.proficient = true;
            }
        }
    }

    if (Array.isArray(opt.grantedFeatures) && opt.grantedFeatures.length > 0) {
        if (!Array.isArray(characterPayload.features)) characterPayload.features = [];
        for (const f of opt.grantedFeatures) {
            characterPayload.features.push({
                name: f.name || opt.name,
                source: f.source || opt.name,
                level: level,
                description: f.description || opt.description
            });
        }
    }
}

/**
 * Puts saved spells whose source names one of the character's classes (or Magic Initiate) into that class's list.
 */
function seedClassSpellSelections(ctx: CharacterCreatorContext, spells: any[]): Record<string, { cantrips: string[]; prepared: string[] }> {
    const seeded: Record<string, { cantrips: string[]; prepared: string[] }> = {};
    for (const s of spells) {
        if (s?.alwaysPrepared && resolveSpellBucketKey(ctx, s?.source) !== MAGIC_INITIATE_BUCKET_KEY) continue;
        const key = resolveSpellBucketKey(ctx, s?.source);
        if (!key || !s?.name) continue;
        const sel = seeded[key] || { cantrips: [], prepared: [] };
        (Number(s.level) === 0 ? sel.cantrips : sel.prepared).push(s.name);
        seeded[key] = sel;
    }
    if (Object.keys(seeded).length > 0) {
        ctx.state.importedClassSpells = Object.fromEntries(
            Object.entries(seeded)
                .filter(([key]) => key !== MAGIC_INITIATE_BUCKET_KEY)
                .map(([key, sel]) => [key, [...sel.cantrips, ...sel.prepared]])
        );
    }
    return seeded;
}

/**
 * Whether a progression choice stored as "<classId>-<classLevel>-<choice>" (e.g. "wizard-2-scholar") is unlocked by the
 * character's level in that class, wherever the class sits in a multiclass.
 */
function isChoiceUnlocked(ctx: CharacterCreatorContext, key: string): boolean {
    for (const c of ctx.state.classes || []) {
        const prefix = `${c.classId}-`;
        if (!key.startsWith(prefix)) continue;
        const level = Number(key.slice(prefix.length).split("-")[0]);
        if (!Number.isNaN(level) && (c.level || 0) >= level) return true;
    }
    return false;
}

export async function loadCharacter(ctx: CharacterCreatorContext, targetId: string | number): Promise<void> {
    try {
        const queryParam = typeof targetId === "number" || /^\d+$/.test(String(targetId))
            ? `id=${targetId}`
            : `siteCharacterId=${encodeURIComponent(targetId)}`;
        const response = await getData<{
            character?: any;
            savedCharacter?: any;
        }>(`/get-saved-character?${queryParam}`);

        let char = response?.character;
        let savedId = response?.savedCharacter?.id || char?.savedCharacterId;
        let siteCharacterId = response?.savedCharacter?.siteCharacterId || char?.siteCharacterId;

        if (!char) {
            if (String(targetId).toLowerCase() === "darvell" || String(targetId) === "138310322") {
                const { darvellData } = await import("../../characterSheet/characterData");
                char = JSON.parse(JSON.stringify(darvellData));
            }
        }

        if (!char) {
            console.warn("Could not load character:", targetId);
            return;
        }

        if (savedId) {
            ctx.state.savedId = Number(savedId);
        }
        if (siteCharacterId) {
            ctx.state.siteCharacterId = String(siteCharacterId);
        }

        const isDndBeyond = (response?.savedCharacter?.source || char.source) === "dndbeyond";
        const externalId: string | undefined = response?.savedCharacter?.externalCharacterId
            || (isDndBeyond && /^\d+$/.test(String(char.id || "")) ? String(char.id) : undefined);

        if (char.creatorState && typeof char.creatorState === "object") {
            Object.assign(ctx.state, char.creatorState);
            if (isDndBeyond && externalId) ctx.state.dndBeyondId = String(externalId);
            if (savedId) ctx.state.savedId = Number(savedId);
            if (siteCharacterId) ctx.state.siteCharacterId = String(siteCharacterId);
            if (!Array.isArray(ctx.state.classes) || ctx.state.classes.length === 0) {
                if (Array.isArray(char.classes) && char.classes.length > 0) {
                    ctx.state.classes = char.classes.map((c: any) => {
                        const clsName = (c.name || "").toLowerCase();
                        const matchedCls = ctx.classes.find((x) => x.name.toLowerCase() === clsName || x.id === clsName);
                        const classId = matchedCls?.id || (c.id ? String(c.id).toLowerCase() : "fighter");
                        let subclassId = "";
                        if (c.subclass && matchedCls) {
                            const subName = String(c.subclass).toLowerCase().trim();
                            const cleanSubName = subName.replace(/\s+patron$/i, "").replace(/^the\s+/i, "");
                            const matchedSub = matchedCls.subclasses.find((s) => {
                                const sName = s.name.toLowerCase();
                                const cleanSName = sName.replace(/^the\s+/i, "");
                                return sName === subName || s.id === subName || cleanSName === cleanSubName || subName.includes(s.id);
                            });
                            if (matchedSub) subclassId = matchedSub.id;
                        }
                        return {
                            classId,
                            level: Number(c.level) || 1,
                            subclassId
                        };
                    });
                    if (ctx.state.classes.length > 0) {
                        ctx.state.classId = ctx.state.classes[0].classId;
                        ctx.state.subclassId = ctx.state.classes[0].subclassId || "";
                        ctx.state.level = ctx.state.classes.reduce((sum, c) => sum + (c.level || 0), 0);
                    }
                }
            }
            ctx.syncStateClassProperties();
            const hasSplit = Object.values(ctx.state.classSpellSelections || {}).some((s: any) => (s?.cantrips?.length || 0) + (s?.prepared?.length || 0) > 0);
            if (!hasSplit && Array.isArray(char.spells)) {
                ctx.state.classSpellSelections = seedClassSpellSelections(ctx, char.spells);
            }
        } else {
            if (char.name) ctx.state.name = char.name;
            if (char.level) ctx.state.level = Number(char.level);
            if (char.alignment) ctx.state.alignment = char.alignment;
            if (char.gender) ctx.state.gender = char.gender || "";
            if (char.avatarUrl) ctx.state.avatarUrl = char.avatarUrl;

            const spName = (char.species || char.race || "").toLowerCase();
            let matchedSp = ctx.species.find((s) => s.name.toLowerCase() === spName || s.id === spName);
            if (!matchedSp) {
                matchedSp = ctx.species.find((s) => spName.includes(s.name.toLowerCase()) || spName.includes(s.id));
            }
            if (matchedSp) ctx.state.speciesId = matchedSp.id;

            if (Array.isArray(char.classes) && char.classes.length > 0) {
                ctx.state.classes = char.classes.map((c: any) => {
                    const clsName = (c.name || "").toLowerCase();
                    const matchedCls = ctx.classes.find((x) => x.name.toLowerCase() === clsName || x.id === clsName);
                    const classId = matchedCls?.id || (c.id ? String(c.id).toLowerCase() : "fighter");
                    let subclassId = "";
                    if (c.subclass && matchedCls) {
                        const subName = String(c.subclass).toLowerCase().trim();
                        const cleanSubName = subName.replace(/\s+patron$/i, "").replace(/^the\s+/i, "");
                        const matchedSub = matchedCls.subclasses.find((s) => {
                            const sName = s.name.toLowerCase();
                            const cleanSName = sName.replace(/^the\s+/i, "");
                            return sName === subName || s.id === subName || cleanSName === cleanSubName || subName.includes(s.id);
                        });
                        if (matchedSub) subclassId = matchedSub.id;
                    }
                    return {
                        classId,
                        level: Number(c.level) || 1,
                        subclassId
                    };
                });
                if (ctx.state.classes.length > 0) {
                    ctx.state.classId = ctx.state.classes[0].classId;
                    ctx.state.subclassId = ctx.state.classes[0].subclassId || "";
                    ctx.state.level = ctx.state.classes.reduce((sum, c) => sum + (c.level || 0), 0);
                }
                ctx.syncStateClassProperties();
            } else {
                ctx.state.classes = [{ classId: "fighter", level: Number(char.level) || 1, subclassId: "" }];
                ctx.syncStateClassProperties();
            }

            if (char.background) {
                const bgName = char.background.toLowerCase();
                const matchedBg = ctx.backgrounds.find((b) => b.name.toLowerCase() === bgName || b.id === bgName);
                if (matchedBg) ctx.state.backgroundId = matchedBg.id;
            }

            if (Array.isArray(char.abilities)) {
                for (const ab of char.abilities) {
                    const abbr = (ab.abbr || "").toLowerCase() as AbilityName;
                    if (abbr && ctx.state.baseAbilities[abbr] !== undefined) {
                        ctx.state.baseAbilities[abbr] = ab.baseScore ?? ab.score ?? 10;
                    }
                }
            }

            // D&D Beyond imports: the saved sheet keeps final scores and feat names but not which class level granted
            // each feat, so read base scores, background bonuses, origin feats and ASI/feat choices from D&D Beyond
            if (isDndBeyond && externalId) {
                ctx.state.dndBeyondId = String(externalId);
                try {
                    const raw = await getData<any>(`/get-dndbeyond-character?id=${externalId}`);
                    if (raw) applyDndBeyondAbilityChoices(ctx, raw);
                } catch (err) {
                    console.warn("Could not read ability score choices from D&D Beyond:", err);
                }
            }

            if (Array.isArray(char.skills)) {
                // Background and species skills are granted, not class picks; feat skills go to their feats
                const proficientNames = char.skills
                    .filter((s: any) => s.proficiency === "proficient" || s.proficiency === "expertise")
                    .map((s: any) => s.name);
                distributeImportedSkills(ctx, proficientNames);
                ctx.state.expertiseSkills = char.skills
                    .filter((s: any) => s.proficiency === "expertise")
                    .map((s: any) => s.name);
                sanitizeSkillSelections(ctx);
            }

            if (Array.isArray(char.weapons)) {
                ctx.state.selectedWeapons = char.weapons.map((w: any) => w.name);
                ctx.state.weaponMasteries = char.weapons
                    .filter((w: any) => w.mastery?.unlocked)
                    .map((w: any) => w.name);
            }
            if (Array.isArray(char.equipment)) {
                const armor = char.equipment.find((e: any) => e.type === "Armor" && e.name !== "Shield");
                if (armor) ctx.state.selectedArmor = armor.name;
                ctx.state.hasShield = char.equipment.some((e: any) => e.name === "Shield" && e.equipped);
            }

            if (Array.isArray(char.spells)) {
                // Always-prepared spells come from class/subclass progression, species, or feats; they are bonus
                // spells and must not be loaded into the base cantrip/prepared allotment.
                // Magic Initiate spells are always prepared but are still chosen in the spells step, in their own pool.
                const baseSpells = char.spells.filter((s: any) => !s?.alwaysPrepared || resolveSpellBucketKey(ctx, s?.source) === MAGIC_INITIATE_BUCKET_KEY);
                ctx.state.selectedCantrips = baseSpells.filter((s: any) => s.level === 0).map((s: any) => s.name);
                ctx.state.selectedSpellsLevel1 = baseSpells.filter((s: any) => s.level > 0).map((s: any) => s.name);
                // Multiclass: spells saved with a class name as their source go back to that class's list; the rest
                // (e.g. older saves with a generic "Class" source) are assigned when selections are sanitized.
                ctx.state.classSpellSelections = seedClassSpellSelections(ctx, baseSpells);
            }
        }

        // Robustly resolve speciesId if missing, custom, or subrace-formatted
        const rawSpeciesName = String(char.species || char.race || "").toLowerCase().trim();
        if (!ctx.state.speciesId) {
            let matchedSp = ctx.species.find((s) => s.name.toLowerCase() === rawSpeciesName || s.id === rawSpeciesName);
            if (!matchedSp) {
                matchedSp = ctx.species.find((s) => rawSpeciesName.includes(s.name.toLowerCase()) || rawSpeciesName.includes(s.id));
            }
            if (matchedSp) {
                ctx.state.speciesId = matchedSp.id;
            }
        }

        // Robustly resolve lineageId for species that have lineages/heritages
        const activeSpecies = ctx.species.find((s) => s.id === ctx.state.speciesId);
        if (activeSpecies && Array.isArray(activeSpecies.lineages) && activeSpecies.lineages.length > 0) {
            const validLineage = activeSpecies.lineages.some((l) => l.id === ctx.state.lineageId);
            if (!validLineage) {
                let matchedLin: any = undefined;

                const lineageText: string = String(char.lineage || char.subrace || "").toLowerCase().trim();
                const raceText: string = String(char.race || "").toLowerCase().trim();
                const featNames: string[] = Array.isArray(char.features) ? char.features.map((f: any) => String(f?.name || "").toLowerCase()) : [];
                const featDescs: string[] = Array.isArray(char.features) ? char.features.map((f: any) => String(f?.description || "").toLowerCase()) : [];
                const resistances: string[] = [
                    ...(Array.isArray(char.damageResistances) ? char.damageResistances : []),
                    ...(Array.isArray(char.vitals?.damageResistances) ? char.vitals.damageResistances : [])
                ].map((r: any) => String(r || "").toLowerCase());
                const spellNames: string[] = Array.isArray(char.spells) ? char.spells.map((s: any) => String(s?.name || "").toLowerCase()) : [];

                // 1. Match from char.lineage or char.subrace
                if (lineageText) {
                    matchedLin = activeSpecies.lineages.find((l) =>
                        l.id === lineageText ||
                        l.name.toLowerCase() === lineageText ||
                        lineageText.includes(l.id) ||
                        lineageText.includes(l.name.toLowerCase().split(" ")[0])
                    );
                }

                // 2. Match from char.race (e.g. "Infernal Tiefling", "Wood Elf")
                if (!matchedLin && raceText) {
                    matchedLin = activeSpecies.lineages.find((l) =>
                        raceText.includes(l.id) ||
                        raceText.includes(l.name.toLowerCase().split(" ")[0])
                    );
                }

                // 3. Species-specific heuristics
                if (!matchedLin) {
                    if (activeSpecies.id === "tiefling") {
                        const isInfernal =
                            featNames.some((n: string) => n.includes("infernal") || n.includes("hellish resistance")) ||
                            featDescs.some((d: string) => d.includes("resistance to fire") || d.includes("hellish resistance")) ||
                            resistances.includes("fire") ||
                            spellNames.includes("fire bolt") ||
                            spellNames.includes("hellish rebuke");
                        const isAbyssal =
                            featNames.some((n: string) => n.includes("abyssal")) ||
                            featDescs.some((d: string) => d.includes("resistance to poison")) ||
                            resistances.includes("poison") ||
                            spellNames.includes("poison spray");
                        const isChthonic =
                            featNames.some((n: string) => n.includes("chthonic")) ||
                            featDescs.some((d: string) => d.includes("resistance to necrotic")) ||
                            resistances.includes("necrotic") ||
                            spellNames.includes("chill touch");

                        if (isInfernal) matchedLin = activeSpecies.lineages.find(l => l.id === "infernal");
                        else if (isAbyssal) matchedLin = activeSpecies.lineages.find(l => l.id === "abyssal");
                        else if (isChthonic) matchedLin = activeSpecies.lineages.find(l => l.id === "chthonic");
                    } else if (activeSpecies.id === "elf") {
                        const isWood = featNames.some((n: string) => n.includes("wood elf") || n.includes("fleet of foot") || n.includes("mask of the wild"));
                        const isDrow = featNames.some((n: string) => n.includes("drow") || n.includes("superior darkvision"));
                        const isHigh = featNames.some((n: string) => n.includes("high elf") || n.includes("cantrip"));

                        if (isWood) matchedLin = activeSpecies.lineages.find(l => l.id === "wood-elf");
                        else if (isDrow) matchedLin = activeSpecies.lineages.find(l => l.id === "drow");
                        else if (isHigh) matchedLin = activeSpecies.lineages.find(l => l.id === "high-elf");
                    } else if (activeSpecies.id === "dragonborn") {
                        matchedLin = activeSpecies.lineages.find(l =>
                            raceText.includes(l.id) || featNames.some((n: string) => n.includes(l.id))
                        );
                    } else if (activeSpecies.id === "goliath") {
                        matchedLin = activeSpecies.lineages.find(l =>
                            raceText.includes(l.id.replace("-giant", "")) ||
                            featNames.some((n: string) => n.includes(l.id.replace("-giant", "")))
                        );
                    } else if (activeSpecies.id === "gnome") {
                        if (raceText.includes("forest") || featNames.some((n: string) => n.includes("forest"))) {
                            matchedLin = activeSpecies.lineages.find(l => l.id === "forest-gnome");
                        } else if (raceText.includes("rock") || featNames.some((n: string) => n.includes("rock") || n.includes("tinker"))) {
                            matchedLin = activeSpecies.lineages.find(l => l.id === "rock-gnome");
                        }
                    }
                }

                ctx.state.lineageId = matchedLin?.id || activeSpecies.lineages[0].id;
            }
        }

        // Restore pick lists (Eldritch Invocations, Metamagic, Maneuvers…) from saved state and from the features a pull
        // or save produced: "<List>: <Option>", an Invocation-type feature, or a feature named exactly the option
        for (const pool of getProgressionPools(ctx)) {
            const saved = [
                ...(Array.isArray((ctx.state as any)[pool.pool]) ? (ctx.state as any)[pool.pool] : []),
                ...(Array.isArray(char[pool.pool]) ? char[pool.pool] : []),
                ...(Array.isArray(char.creatorState?.[pool.pool]) ? char.creatorState[pool.pool] : [])
            ];
            const ids: string[] = saved.filter((id: string) => pool.options.some((o) => o.id === id));
            const singular = poolSingular(pool.name).toLowerCase();
            const norm = (s: string) => s.replace(/['’]/g, "'").toLowerCase().trim();
            for (const feat of Array.isArray(char.features) ? char.features : []) {
                const fName = norm(String(feat?.name || ""));
                const fromList = String(feat?.type || "").toLowerCase() === "invocation" || fName.startsWith(`${singular}:`);
                const clean = fName.replace(new RegExp(`^${singular}:\\s*`), "").replace(/\s*\(.*?\)\s*$/g, "").trim();
                const opt = pool.options.find((o) => {
                    const oName = norm(o.name);
                    return o.id === clean || oName === clean || (fromList && (clean.includes(oName) || oName.includes(clean)));
                });
                if (opt && !ids.includes(opt.id)) ids.push(opt.id);
            }
            (ctx.state as any)[pool.pool] = ids
                .filter((id) => {
                    const opt = pool.options.find((o) => o.id === id);
                    return !!opt && optionAvailableAt(opt, pool.classLevel);
                })
                .slice(0, pool.max);
        }

        // Restore progression choices (Fighting Style, Divine Order, subclass options…) from the saved features:
        // "<Choice>: <Option>", a feature naming both, or a feature named exactly the option
        if (Array.isArray(char.features)) {
            const featureNames = char.features.map((f: any) => String(f?.name || "").toLowerCase().trim()).filter(Boolean);
            for (const entry of getProgressionChoices(ctx).filter((e) => e.unlocked && e.selectedIds.length === 0)) {
                const choiceName = entry.choice.name.toLowerCase();
                const matches = (entry.choice.options || []).filter((opt) => {
                    const optName = opt.name.toLowerCase();
                    return featureNames.some((n: string) => n === `${choiceName}: ${optName}` || n === optName || (n.includes(choiceName) && n.includes(optName)));
                });
                if (matches.length > 0) setProgressionChoice(ctx, entry, matches.slice(0, entry.choice.chooseCount || 1).map((o) => o.id));
            }
        }

        ctx.syncStateClassProperties();
        ctx.state.featureSpellChoices = ctx.state.featureSpellChoices || {};

        // Reconcile progression-chosen spells (e.g. Pact of the Tome, Magical Discoveries, Mystic Arcanum, etc.)
        const activeFeatureSections = ctx.getFeatureSpellChoiceSections();
        if (Array.isArray(char.spells) && activeFeatureSections.length > 0) {
            for (const sec of activeFeatureSections) {
                const existing = Array.isArray(ctx.state.featureSpellChoices[sec.id])
                    ? [...ctx.state.featureSpellChoices[sec.id]]
                    : [];
                if (existing.length < sec.chooseCount) {
                    for (const rawSpell of char.spells) {
                        if (existing.length >= sec.chooseCount) break;
                        const spName = String(rawSpell?.name || "").trim();
                        const spSource = String(rawSpell?.source || "").toLowerCase();
                        const spLvl = Number(rawSpell?.level ?? -1);
                        // A spell whose saved source names this section is kept even if it's outside the section's picks
                        // (e.g. imported from D&D Beyond), so imports don't lose spells
                        let matchedDef = sec.availableSpells.find((a) => a.name.toLowerCase() === spName.toLowerCase());
                        if (!matchedDef) {
                            const outside = ctx.getSpell(spName);
                            const offeredElsewhere = outside && activeFeatureSections.some((other) =>
                                other.id !== sec.id && other.availableSpells.some((a) => a.name === outside.name));
                            const sameLevelOffered = outside && sec.availableSpells.some((a) => (a.level === 0) === (outside.level === 0));
                            if (outside && !offeredElsewhere && sameLevelOffered) matchedDef = outside;
                        }
                        if (!matchedDef || existing.includes(matchedDef.name)) continue;

                        const isSourceMatch =
                            spSource === sec.sourceLabel.toLowerCase() ||
                            spSource === sec.title.toLowerCase() ||
                            (sec.sourceAliases || []).some((alias) => spSource.includes(alias));

                        if (isSourceMatch) {
                            existing.push(matchedDef.name);
                        }
                    }
                }
                // Older saves gave some of these spells a generic source ("Class", a class name): a saved spell that fits
                // this section and that no class could have picked normally belongs here
                if (existing.length < sec.chooseCount) {
                    const classPickable = new Set(ctx.getSpellBuckets().flatMap((b) => [...b.cantripPool, ...b.preparedPool].map((sp) => sp.name)));
                    for (const rawSpell of char.spells) {
                        if (existing.length >= sec.chooseCount) break;
                        const spName = String(rawSpell?.name || "").trim();
                        const matchedDef = sec.availableSpells.find((a) => a.name.toLowerCase() === spName.toLowerCase());
                        if (!matchedDef || existing.includes(matchedDef.name) || classPickable.has(matchedDef.name)) continue;
                        existing.push(matchedDef.name);
                    }
                }
                if (existing.length > 0) {
                    ctx.state.featureSpellChoices[sec.id] = existing.slice(0, sec.chooseCount);
                }
            }

            // Remove any feature-selected or species-innate spells from regular class cantrip/prepared pools
            // so they are not double-counted against class cantrip/prepared spell limits
            const featureChosenSet = new Set<string>();
            for (const list of Object.values(ctx.state.featureSpellChoices)) {
                if (Array.isArray(list)) {
                    list.forEach((n) => featureChosenSet.add(n.toLowerCase()));
                }
            }
            const nonClassSpellNames = new Set<string>(
                char.spells
                    .filter((s: any) => {
                        const src = String(s?.source || "").toLowerCase();
                        return (
                            src.includes("species") ||
                            src.includes("race") ||
                            src.includes("tiefling") ||
                            src.includes("aasimar") ||
                            src.includes("elf") ||
                            src.includes("gnome") ||
                            src.includes("pact of the tome")
                        );
                    })
                    .map((s: any) => String(s?.name || "").toLowerCase())
            );
            ctx.state.selectedCantrips = (ctx.state.selectedCantrips || []).filter(
                (n) => !featureChosenSet.has(n.toLowerCase()) && !nonClassSpellNames.has(n.toLowerCase())
            );
            ctx.state.selectedSpellsLevel1 = (ctx.state.selectedSpellsLevel1 || []).filter(
                (n) => !featureChosenSet.has(n.toLowerCase()) && !nonClassSpellNames.has(n.toLowerCase())
            );
        }

        // Ensure class/subclass progression spells never occupy the base cantrip/prepared allotment
        ctx.sanitizeSpellSelections();

        const submitBtn = document.getElementById("creator-submit-btn");
        if (submitBtn) {
            submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Changes`;
        }
    } catch (err) {
        console.error("Failed to load character for editing:", err);
    }
}

export function buildPayload(ctx: CharacterCreatorContext): any {
    const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
    const species = ctx.species.find((s) => s.id === ctx.state.speciesId) || ctx.species[0];
    const bg = ctx.backgrounds.find((b) => b.id === ctx.state.backgroundId) || ctx.backgrounds[0];
    const pb = ctx.getProficiencyBonus();

    const abilityNames: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
    const abilityTitles: Record<AbilityName, string> = {
        str: "Strength", dex: "Dexterity", con: "Constitution",
        int: "Intelligence", wis: "Wisdom", cha: "Charisma"
    };

    // Class features that grant save proficiency (e.g. Disciplined Survivor) or add to every save (e.g. Aura of Protection)
    const progressionMods = getProgressionModifiers(ctx);
    const saveBonusAll = progressionMods
        .filter((m) => m.target === "saves.all" && m.type === "ability_mod" && m.abilitySource)
        .reduce((sum, m) => sum + Math.max(m.minimum ?? -Infinity, ctx.getAbilityModifier(m.abilitySource!)), 0);
    const abilitiesPayload = abilityNames.map((st) => {
        const total = ctx.getEffectiveAbilityScore(st);
        const mod = ctx.getAbilityModifier(st);
        const isProfSave = cls.savingThrows.includes(st) ||
            progressionMods.some((m) => m.type === "proficiency_tier" && (m.target === "saves.all" || m.target === `saves.${st}`));
        return {
            name: abilityTitles[st],
            abbr: st.toUpperCase(),
            score: total,
            baseScore: ctx.state.baseAbilities[st],
            bonus: total - ctx.state.baseAbilities[st],
            modifier: mod,
            save: mod + (isProfSave ? pb : 0) + saveBonusAll,
            proficientSave: isProfSave
        };
    });

    // Skills: proficiency from every source, Expertise chosen or granted by feats, plus Jack of All Trades and
    // Divine/Primal Order bonuses
    sanitizeSkillSelections(ctx);
    const proficientSkills = getProficientSkills(ctx);
    const expertSkills = new Set<string>([...ctx.state.expertiseSkills, ...getGrantedExpertiseSkills(ctx).keys()]);

    const skillsPayload = ALL_SKILLS.map((sk) => {
        const isProf = proficientSkills.has(sk.name);
        const isExpert = isProf && expertSkills.has(sk.name);
        const mod = ctx.getAbilityModifier(sk.stat);
        const bonus = mod + (isExpert ? 2 * pb : isProf ? pb : 0) + getSkillBonusExtras(ctx, sk.name, isProf, pb);
        return {
            name: sk.name,
            stat: sk.stat.toUpperCase(),
            bonus,
            proficiency: isExpert ? "expertise" : isProf ? "proficient" : "none"
        };
    });

    // Weapons
    const weaponsPayload = ctx.state.selectedWeapons.map((wName) => {
        const baseW = BASE_WEAPONS_2024.find((b) => b.name === wName);
        const isFinesse = baseW?.properties.some((p) => p.includes("Finesse"));
        const isRanged = baseW?.category.includes("Ranged");
        const statToUse: AbilityName = (isRanged || (isFinesse && ctx.getAbilityModifier("dex") > ctx.getAbilityModifier("str"))) ? "dex" : "str";
        const attackMod = ctx.getAbilityModifier(statToUse) + pb;
        const damageMod = ctx.getAbilityModifier(statToUse);
        const masteryUnlocked = ctx.state.weaponMasteries.includes(wName);

        return {
            name: wName,
            quantity: 1,
            equipped: true,
            category: baseW?.category || "Simple Melee",
            damage: `${baseW?.damageDie || "1d6"} + ${damageMod} ${baseW?.damageType || "Slashing"}`,
            damageType: baseW?.damageType || "Slashing",
            damageDie: baseW?.damageDie || "1d6",
            attackBonus: (attackMod >= 0 ? "+" : "") + attackMod,
            toHitModifier: attackMod,
            range: baseW?.range || "5 ft.",
            properties: baseW?.properties || [],
            mastery: {
                name: baseW?.mastery || "Vex",
                description: WEAPON_MASTERIES.find((m) => m.name === baseW?.mastery)?.description,
                unlocked: masteryUnlocked
            }
        };
    });

    // Equipment (Armor + Shield + Starter gear)
    const equipmentPayload: any[] = [];
    if (ctx.state.selectedArmor && ctx.state.selectedArmor !== "None") {
        const armorDef = BASE_ARMOR_2024.find((a) => a.name === ctx.state.selectedArmor);
        equipmentPayload.push({
            name: ctx.state.selectedArmor,
            quantity: 1,
            equipped: true,
            type: "Armor",
            filterType: "Armor",
            description: armorDef ? `${armorDef.category} Armor, AC ${armorDef.baseAc}` : ""
        });
    }
    if (ctx.state.hasShield) {
        equipmentPayload.push({
            name: "Shield",
            quantity: 1,
            equipped: true,
            type: "Shield",
            filterType: "Armor",
            description: "Shield (+2 AC)"
        });
    }
    equipmentPayload.push({
        name: "Explorer's Pack",
        quantity: 1,
        equipped: false,
        type: "Gear",
        description: "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft rope."
    });

    // Spells
    const spellsPayload: any[] = [];
    ctx.sanitizeSpellSelections();
    const progressionGrantedNames = getProgressionGrantedSpellNames(ctx);
    // Each class's spells are saved with that class as the source, so the sheet can count them per class
    const bucketSpells = ctx.getSpellBuckets().flatMap((b) => {
        const sel = ctx.state.classSpellSelections?.[b.key] || { cantrips: [], prepared: [] };
        return [...sel.cantrips, ...sel.prepared].map((name) => ({ name, bucket: b }));
    });
    for (const { name: spName, bucket } of bucketSpells) {
        // Progression-granted spells are emitted below as always-prepared bonus spells, not base class spells
        if (progressionGrantedNames.has(spName.toLowerCase())) continue;
        const spDef = getSpellDef(ctx, spName);
        if (spDef) {
            spellsPayload.push({
                name: spDef.name,
                level: spDef.level,
                school: spDef.school,
                source: bucket.sourceLabel,
                prepared: true,
                ...(bucket.kind === "feat" ? { alwaysPrepared: true } : {}),
                ...(bucket.via[spDef.name] ? { viaFeature: bucket.via[spDef.name] } : {}),
                castingTime: spDef.castingTime,
                range: spDef.range,
                duration: spDef.duration,
                components: spDef.components,
                concentration: spDef.concentration,
                ritual: spDef.ritual,
                description: spDef.description
            });
        }
    }

    // Feature / Progression chosen spells (e.g., Pact of the Tome, Thaumaturge, Magician, Blessed Warrior, Magical Secrets, Mystic Arcanum)
    const featureSections = ctx.getFeatureSpellChoiceSections();
    for (const sec of featureSections) {
        const chosenNames = ctx.state.featureSpellChoices[sec.id] || [];
        for (const spName of chosenNames) {
            const spDef = getSpellDef(ctx, spName);
            if (!spDef) continue;
            const existing = spellsPayload.find((s) => s.name.toLowerCase() === spDef.name.toLowerCase());
            if (!existing) {
                spellsPayload.push({
                    name: spDef.name,
                    level: spDef.level,
                    school: spDef.school,
                    source: sec.sourceLabel,
                    prepared: true,
                    alwaysPrepared: true,
                    castingTime: spDef.castingTime,
                    range: spDef.range,
                    duration: spDef.duration,
                    components: spDef.components,
                    concentration: spDef.concentration,
                    ritual: spDef.ritual,
                    description: spDef.description
                });
            }
        }
    }

    // Species and Lineage innate spells
    const selectedLineage = species.lineages?.find((l) => l.id === ctx.state.lineageId);
    const speciesSpells: Array<{ name: string; level: number }> = [];
    if (species.id === "aasimar") {
        speciesSpells.push({ name: "Light", level: 0 });
    }
    if (species.id === "tiefling") {
        speciesSpells.push({ name: "Thaumaturgy", level: 0 });
    }
    if (selectedLineage && Array.isArray(selectedLineage.spellsGranted)) {
        selectedLineage.spellsGranted.forEach((sg: any) => {
            if (ctx.state.level >= sg.level) {
                const spDef = getSpellDef(ctx, sg.spellName);
                speciesSpells.push({
                    name: sg.spellName,
                    level: spDef ? spDef.level : (sg.level === 1 ? 0 : 1)
                });
            }
        });
    }
    for (const spItem of speciesSpells) {
        if (!spellsPayload.some((s) => s.name.toLowerCase() === spItem.name.toLowerCase())) {
            const spDef = getSpellDef(ctx, spItem.name);
            spellsPayload.push({
                name: spItem.name,
                level: spDef ? spDef.level : spItem.level,
                school: spDef?.school || "Evocation",
                source: "Species",
                prepared: true,
                castingTime: spDef?.castingTime || "1 Action",
                range: spDef?.range || "Self",
                duration: spDef?.duration || "Instantaneous",
                components: spDef?.components || "V, S",
                concentration: spDef?.concentration || false,
                ritual: spDef?.ritual || false,
                description: spDef?.description || `Granted by ${species.name} traits.`
            });
        }
    }

    // Progression-granted spells from selected class and subclass options
    const selectedProgressionOptions: any[] = [];
    // Options chosen in unlocked class/subclass progression choices
    for (const entry of getProgressionChoices(ctx).filter((e) => e.unlocked)) {
        selectedProgressionOptions.push(...entry.selectedOptions);
    }
    // Entries chosen from pick lists (e.g. state.invocations)
    for (const pool of getProgressionPools(ctx)) {
        const picked: string[] = ((ctx.state as any)[pool.pool] as string[] | undefined) || [];
        selectedProgressionOptions.push(...pool.options.filter((o) => picked.includes(o.id)));
    }


    for (const opt of selectedProgressionOptions) {
        if (Array.isArray(opt.grantedSpells)) {
            for (const sp of opt.grantedSpells) {
                const spName = typeof sp === "string" ? sp : (sp.name || sp.spellId);
                const spLevel = typeof sp === "string" ? 0 : (sp.level ?? 0);
                if (!spName) continue;
                if (!spellsPayload.some((s) => s.name.toLowerCase() === spName.toLowerCase())) {
                    const spDef = getSpellDef(ctx, spName);
                    spellsPayload.push({
                        name: spDef ? spDef.name : spName,
                        level: spDef ? spDef.level : spLevel,
                        school: spDef?.school || "Evocation",
                        source: (typeof sp === "object" && sp.source) || opt.name || "Class",
                        prepared: true,
                        alwaysPrepared: true,
                        castingTime: spDef?.castingTime || "1 Action",
                        range: spDef?.range || "Self",
                        duration: spDef?.duration || "Instantaneous",
                        components: spDef?.components || "V, S",
                        concentration: spDef?.concentration || false,
                        ritual: (typeof sp === "object" && sp.ritual) || spDef?.ritual || false,
                        description: (typeof sp === "object" && (sp.notes || sp.description)) || spDef?.description || `Granted by ${opt.name}.`
                    });
                }
            }
        }
    }

    // Collect progression-granted spells from cls.progression and sub.progression for unlocked levels
    for (const charCls of ctx.state.classes) {
        const clsDef = ctx.classes.find((c) => c.id === charCls.classId);
        const subId = charCls.subclassId || (charCls === ctx.state.classes[0] ? ctx.state.subclassId : "");
        const subDef = clsDef?.subclasses?.find((s) => s.id === subId);
        const unlockedLevel = charCls.level || 1;

        const addProgGrantedSpell = (sp: any, defaultSource: string) => {
            const spName = typeof sp === "string" ? sp : (sp.name || sp.spellId);
            if (!spName) return;
            const spDef = getSpellDef(ctx, spName);
            const finalName = spDef ? spDef.name : spName;
            if (!spellsPayload.some((s) => s.name.toLowerCase() === finalName.toLowerCase())) {
                spellsPayload.push({
                    name: finalName,
                    level: spDef ? spDef.level : (typeof sp === "object" ? (sp.level ?? 1) : 1),
                    school: spDef?.school || "Evocation",
                    source: (typeof sp === "object" && sp.source) || defaultSource,
                    prepared: true,
                    alwaysPrepared: true,
                    castingTime: spDef?.castingTime || "1 Action",
                    range: spDef?.range || "Self",
                    duration: spDef?.duration || "Instantaneous",
                    components: spDef?.components || "V, S",
                    concentration: spDef?.concentration || false,
                    ritual: (typeof sp === "object" && sp.ritual) || spDef?.ritual || false,
                    description: (typeof sp === "object" && (sp.notes || sp.description)) || spDef?.description || `Granted by ${defaultSource}.`
                });
            }
        };

        // From class progression
        if (Array.isArray(clsDef?.progression)) {
            for (const pl of clsDef.progression) {
                if (pl.level <= unlockedLevel && Array.isArray(pl.grantedSpells)) {
                    for (const sp of pl.grantedSpells) {
                        addProgGrantedSpell(sp, clsDef.name);
                    }
                }
            }
        }

        // From subclass progression
        if (Array.isArray(subDef?.progression)) {
            for (const pl of subDef.progression) {
                if (pl.level <= unlockedLevel && Array.isArray(pl.grantedSpells)) {
                    for (const sp of pl.grantedSpells) {
                        addProgGrantedSpell(sp, subDef.name);
                    }
                }
            }
        }
    }

    const wrapHtmlParagraph = (text: string): string => {
        const trimmed = (text || "").trim();
        if (!trimmed) return "";
        if (/^<\s*p[\s>]/i.test(trimmed)) return trimmed;
        return `<p>${trimmed}</p>`;
    };
    const stripHtmlTags = (text: string): string => {
        return (text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    };

    // Features (matching D&D Beyond order & shape: 1. Feats, 2. Class Options / Invocations, 3. Class Features, 4. Subclass Features, 5. Species Traits)
    const featsList: any[] = [];
    const originFeat = ctx.originFeats.find((f) => f.id === ctx.state.originFeatId);
    if (originFeat) {
        featsList.push({
            name: originFeat.name,
            source: "Feat",
            type: "Feat",
            description: wrapHtmlParagraph(originFeat.benefits.join(" "))
        });
    }
    if (ctx.state.speciesId === "human" && ctx.state.humanExtraFeatId) {
        const extraOriginFeat = ctx.originFeats.find((f) => f.id === ctx.state.humanExtraFeatId);
        if (extraOriginFeat && extraOriginFeat.id !== originFeat?.id) {
            featsList.push({
                name: extraOriginFeat.name,
                source: "Feat",
                type: "Feat",
                description: wrapHtmlParagraph(extraOriginFeat.benefits.join(" "))
            });
        }
    }

    const isMulticlassAsi = ctx.state.classes.length > 1;
    for (const slot of ctx.getAsiSlots()) {
        const choice = ctx.state.asiChoices[slot.key];
        if (choice?.type === "feat" && choice.featId) {
            const featDef = ctx.generalFeats.find((f) => f.id === choice.featId);
            if (featDef) {
                featsList.push({
                    name: featDef.name,
                    source: "Feat",
                    type: "Feat",
                    description: wrapHtmlParagraph(featDef.benefits.join(" "))
                });
            }
        } else {
            featsList.push({
                name: isMulticlassAsi ? `${slot.className} ${slot.classLevel}: Ability Score Improvement` : `${slot.classLevel}: Ability Score Improvement`,
                source: "Feat",
                type: "Feat",
                description: wrapHtmlParagraph(
                    "Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1, to a maximum of 20."
                )
            });
        }
    }

    const classOptionsList: any[] = [];
    const classFeaturesList: any[] = [];
    const subclassFeaturesList: any[] = [];
    const speciesTraitsList: any[] = [];

    species.traits.forEach((t) => {
        speciesTraitsList.push({
            name: t.name,
            source: species.name,
            type: "Species",
            description: wrapHtmlParagraph(t.description)
        });
    });

    if (selectedLineage) {
        if (selectedLineage.traits && selectedLineage.traits.length > 0) {
            selectedLineage.traits.forEach((t) => {
                speciesTraitsList.push({
                    name: t.name,
                    source: `${species.name} (${selectedLineage.name})`,
                    type: "Species",
                    description: wrapHtmlParagraph(t.description)
                });
            });
        } else if (selectedLineage.description) {
            speciesTraitsList.push({
                name: selectedLineage.name,
                source: species.name,
                type: "Species",
                description: wrapHtmlParagraph(selectedLineage.description)
            });
        }
    }

    ctx.state.classes.forEach((cc) => {
        const cDef = ctx.classes.find((c) => c.id === cc.classId) || ctx.classes[0];
        const fbCls = CLASSES_2024.find((c) => c.id === cDef.id);
        const resolvedFeatures = (cDef.features && cDef.features.length > 0) ? cDef.features : (fbCls?.features || []);
        resolvedFeatures.filter((f) => {
            if (f.level > cc.level) return false;
            const lowerName = f.name.toLowerCase().trim();
            if (/\b\d+(?:st|nd|rd|th)-level spells\b/i.test(lowerName)) return false;
            if (lowerName === "ability score improvement" || lowerName === "epic boon") return false;
            if (cc.subclassId && cc.level >= 3) {
                if (lowerName === "subclass feature" || lowerName === "subclass capstone" || lowerName.endsWith(" subclass")) {
                    return false;
                }
            }
            return true;
        }).forEach((f) => {
            classFeaturesList.push({
                name: f.name,
                source: cDef.name,
                type: "Class",
                description: wrapHtmlParagraph(f.description)
            });
        });

        // Subclass features
        if (cc.subclassId) {
            const sub = cDef.subclasses?.find((s) => s.id === cc.subclassId) || fbCls?.subclasses?.find((s) => s.id === cc.subclassId);
            const fallbackSub = fbCls?.subclasses?.find((s) => s.id === cc.subclassId);
            if (sub) {
                const subFeatures = (sub.features && sub.features.length > 0) ? sub.features : (fallbackSub?.features || []);
                if (subFeatures.length > 0) {
                    subFeatures
                        .filter((sf: any) => sf.level <= cc.level)
                        .forEach((sf: any) => {
                            subclassFeaturesList.push({
                                name: sf.name,
                                source: sub.name,
                                type: "Subclass",
                                level: sf.level,
                                description: wrapHtmlParagraph(sf.description)
                            });
                        });
                } else {
                    subclassFeaturesList.push({
                        name: sub.name,
                        source: sub.name,
                        type: "Subclass",
                        description: wrapHtmlParagraph(sub.description)
                    });
                }
            }
        }
    });

    const featuresPayload: any[] = [];

    // Progression choices (class and subclass), as "<Choice>: <Option>" features. Choices kept in their own state
    // fields (Fighting Style, Divine/Primal Order) keep their "Class Option" format.
    for (const entry of getProgressionChoices(ctx).filter((e) => e.unlocked)) {
        for (const opt of entry.selectedOptions) {
            const name = `${entry.choice.name}: ${opt.name}`;
            if (featuresPayload.some((f) => f.name === name)) continue;
            const ownField = isStateFieldChoice(entry.choice);
            featuresPayload.push({
                name,
                source: ownField ? `Class Option / ${entry.choice.name}` : entry.sourceName,
                type: ownField ? "Invocation" : entry.isSubclass ? "Subclass" : "Class",
                level: entry.level,
                description: opt.description
            });
        }
    }

    // Pick lists (Eldritch Invocations, Metamagic, Maneuvers…), as "<List>: <Option>" class option features
    for (const pool of getProgressionPools(ctx)) {
        const singular = poolSingular(pool.name);
        const picked: string[] = Array.isArray((ctx.state as any)[pool.pool]) ? (ctx.state as any)[pool.pool] : [];
        for (const id of picked) {
            const opt = pool.options.find((o) => o.id === id);
            if (!opt || featuresPayload.some((f) => f.name === `${singular}: ${opt.name}`)) continue;
            featuresPayload.push({
                name: `${singular}: ${opt.name}`,
                source: `Class Option / ${singular.split(" ").pop()}`,
                type: "Invocation",
                description: opt.description
            });
        }
    }

    // Assemble featuresPayload in D&D Beyond order:
    // 1. Feats, 2. Class Options / Invocations, 3. Class Features, 4. Subclass Features, 5. Species Traits
    const extraChoiceFeatures = featuresPayload.map((f) => ({
        ...f,
        description: wrapHtmlParagraph(f.description || "")
    }));
    const invocationExtras = extraChoiceFeatures.filter((f) => f.type === "Invocation");
    const classChoiceExtras = extraChoiceFeatures.filter((f) => f.type === "Class");
    const subclassChoiceExtras = extraChoiceFeatures.filter((f) => f.type === "Subclass");

    featuresPayload.length = 0;
    featuresPayload.push(
        ...featsList,
        ...classOptionsList,
        ...invocationExtras,
        ...classFeaturesList,
        ...classChoiceExtras,
        ...subclassFeaturesList,
        ...subclassChoiceExtras,
        ...speciesTraitsList
    );

    // Class Resources: each class's and subclass's resourceUpdates at its own level (class rules data)
    const resourcesPayload: any[] = resolveClassResources(
        (ctx.state.classes || []).map((cc) => {
            const def = ctx.classes.find((c) => c.id === cc.classId);
            const subclass = def?.subclasses?.find((s) => s.id === ctx.resolveCanonicalSubclassId(cc.classId, cc.subclassId));
            return { def, subclass, level: cc.level || 0 };
        }),
        (ability) => ctx.getAbilityModifier(ability),
        pb
    ).map(({ classId: _classId, aliases: _aliases, dieOrType, ...r }) => ({ ...r, ...(dieOrType ? { dieOrType } : {}), currentUsed: 0 }));

    // Species & Origin Feat expendable resources
    if (ctx.state.speciesId === "dragonborn") {
        resourcesPayload.push({ name: "Breath Weapon", total: pb, resetOn: "long", currentUsed: 0 });
        if (ctx.state.level >= 5) {
            resourcesPayload.push({ name: "Draconic Flight", total: 1, resetOn: "long", currentUsed: 0 });
        }
    } else if (ctx.state.speciesId === "dwarf") {
        resourcesPayload.push({ name: "Stonecunning", total: pb, resetOn: "long", currentUsed: 0 });
    } else if (ctx.state.speciesId === "orc") {
        resourcesPayload.push({ name: "Adrenaline Rush", total: pb, resetOn: "short", currentUsed: 0 });
        resourcesPayload.push({ name: "Relentless Endurance", total: 1, resetOn: "long", currentUsed: 0 });
    } else if (ctx.state.speciesId === "goliath") {
        resourcesPayload.push({ name: "Giant Ancestry", total: pb, resetOn: "long", currentUsed: 0 });
        if (ctx.state.level >= 5) {
            resourcesPayload.push({ name: "Large Form", total: 1, resetOn: "long", currentUsed: 0 });
        }
    } else if (ctx.state.speciesId === "aasimar") {
        resourcesPayload.push({ name: "Healing Hands", total: 1, resetOn: "long", currentUsed: 0 });
        if (ctx.state.level >= 3) {
            resourcesPayload.push({ name: "Celestial Revelation", total: 1, resetOn: "long", currentUsed: 0 });
        }
    }

    if (ctx.state.originFeatId === "lucky" || (ctx.state.speciesId === "human" && ctx.state.humanExtraFeatId === "lucky")) {
        resourcesPayload.push({ name: "Luck Points", total: pb, resetOn: "long", currentUsed: 0 });
    }

    // Passive scores
    const percSkill = skillsPayload.find((s) => s.name === "Perception");
    const invSkill = skillsPayload.find((s) => s.name === "Investigation");
    const insSkill = skillsPayload.find((s) => s.name === "Insight");

    const casterStats = ctx.getSpellcasterStatsList();
    const defaultSpellAttackMod = ctx.getSpellAttackModifier() ?? 0;
    const defaultSpellSaveDcVal = ctx.getSpellSaveDc() ?? 10;
    const cantripActions: any[] = spellsPayload
        .filter((sp) => sp.level === 0)
        .map((sp) => {
            const spDef = getSpellDef(ctx, sp.name);
            const grantingCaster = casterStats.find((cs) => spDef?.classes.includes(cs.className)) || casterStats[0];
            const spellAttackMod = grantingCaster ? grantingCaster.attackMod : defaultSpellAttackMod;
            const spellSaveDcVal = grantingCaster ? grantingCaster.saveDc : defaultSpellSaveDcVal;
            const descLower = (sp.description || "").toLowerCase();
            let hitOrDc = `${spellAttackMod >= 0 ? `+${spellAttackMod}` : spellAttackMod} to hit`;
            if (descLower.includes("saving throw") || descLower.includes("save")) {
                hitOrDc = `DC ${spellSaveDcVal} Save`;
            }
            let damageOrEffect = "Spell Effect";
            if (sp.name.toLowerCase() === "eldritch blast" && ctx.state.invocations.includes("agonizing-blast")) {
                const chaMod = ctx.getAbilityModifier("cha");
                damageOrEffect = `1d10 ${chaMod >= 0 ? `+ ${chaMod}` : `- ${Math.abs(chaMod)}`} Force`;
            }
            return {
                name: sp.name,
                type: (sp.castingTime || "").toLowerCase().includes("bonus")
                    ? "Bonus Action"
                    : (sp.castingTime || "").toLowerCase().includes("reaction")
                        ? "Reaction"
                        : "Action",
                rangeOrReach: sp.range || "Self",
                hitOrDc,
                damageOrEffect,
                notes: `${sp.school} cantrip. Click to view full details.`,
                spellName: sp.name
            };
        });

    const inferFeatureActionType = (name: string, desc: string): "Action" | "Bonus Action" | "Reaction" | null => {
        const n = (name || "").toLowerCase();
        const d = (desc || "").toLowerCase();
        if (
            n.includes("ability score improvement") ||
            n === "spellcasting" ||
            n === "pact magic" ||
            n.includes("level spells") ||
            n.startsWith("subclass:") ||
            n === "extra attack" ||
            n === "two extra attacks" ||
            n === "three extra attacks" ||
            n.includes("swim form") ||
            n.includes("fly form") ||
            n === "keen senses" ||
            n === "fey ancestry" ||
            n === "darkvision" ||
            n === "trance" ||
            n === "unarmored defense" ||
            n === "unarmored movement" ||
            n === "fast movement" ||
            n === "expertise" ||
            n === "jack of all trades" ||
            n === "evasion" ||
            n === "danger sense" ||
            n.startsWith("fighting style:") ||
            n.startsWith("primal order") ||
            n.startsWith("divine order") ||
            n === "elemental fury" ||
            n === "blessed strikes" ||
            n === "alert"
        ) {
            return null;
        }
        if (/\bas a bonus action\b|\btake a bonus action\b|\bbonus action to\b|\bbonus action when\b/i.test(d)) {
            return "Bonus Action";
        }
        if (/\bas a reaction\b|\btake a reaction\b|\breaction when\b|\buse your reaction\b/i.test(d)) {
            return "Reaction";
        }
        if (
            /\bas a magic action\b|\btake a magic action\b|\bas an action\b|\btake an action\b|\bonce on each of your turns\b|\bonce per turn\b|\bwhen you hit\b|\bexpend a spell slot\b|\bexpend one use\b|\bexpend a use\b/i.test(d) ||
            n.includes("wild shape") ||
            n.includes("wild companion") ||
            n.includes("wild resurgence") ||
            n.includes("starry form") ||
            n.includes("star map") ||
            n.includes("channel divinity") ||
            n.includes("bardic inspiration") ||
            n.includes("second wind") ||
            n.includes("action surge") ||
            n.includes("flurry of blows") ||
            n.includes("patient defense") ||
            n.includes("step of the wind") ||
            n.includes("stunning strike") ||
            n.includes("lay on hands") ||
            n.includes("divine smite") ||
            n.includes("sneak attack") ||
            n.includes("cunning action") ||
            n.includes("cunning strike") ||
            n.includes("uncanny dodge") ||
            n.includes("innate sorcery") ||
            n.includes("font of magic") ||
            n.includes("arcane recovery")
        ) {
            if (d.includes("bonus action")) return "Bonus Action";
            if (d.includes("reaction")) return "Reaction";
            return "Action";
        }
        return null;
    };

    const featureActions: any[] = [];
    const seenActionNames = new Set<string>();
    for (const feat of featuresPayload) {
        const actType = inferFeatureActionType(feat.name, feat.description);
        if (!actType) continue;
        const key = feat.name.toLowerCase();
        if (seenActionNames.has(key)) continue;
        seenActionNames.add(key);
        const plainDesc = stripHtmlTags(feat.description || "");
        const rangeMatch = plainDesc.match(/within\s+(\d+\s*(?:feet|ft\.?))/i);
        const rangeOrReach = rangeMatch ? rangeMatch[1].replace(/feet/i, "ft.") : "Special";
        const forcesSave = /\bmust (?:succeed on|make) a [a-z]+ saving throw\b|\bfailed save\b/i.test(plainDesc);
        const hitOrDc = forcesSave && (ctx.getSpellSaveDc() !== null)
            ? `DC ${ctx.getSpellSaveDc() ?? 10}`
            : "Special";
        featureActions.push({
            name: feat.name,
            type: actType,
            rangeOrReach,
            hitOrDc,
            damageOrEffect: plainDesc || "Class Feature",
            notes: wrapHtmlParagraph(feat.description || "")
        });
    }

    const actionsPayload: any[] = [
        ...cantripActions,
        ...weaponsPayload.map((w) => ({
            name: w.name,
            type: "Action",
            rangeOrReach: w.range || "5 ft.",
            hitOrDc: `${w.attackBonus} to hit`,
            damageOrEffect: w.damage,
            notes: w.mastery?.unlocked ? `Mastery: ${w.mastery.name}` : (w.properties || []).join(", ")
        })),
        {
            name: "Unarmed Strike",
            type: "Action",
            rangeOrReach: "Reach 5 ft.",
            hitOrDc: "Special",
            damageOrEffect: "You make a melee attack to damage, grapple, or shove a target within 5 ft. of you.\r\n\r\n<strong><em>Damage.</em></strong> You make an attack roll against the target. <em>To Hit:</em> {{modifier:str+proficiency}}. <em>On a Hit:</em> {{1+modifier:str#unsigned}} Bludgeoning damage.\r\n\r\n<strong><em>Grapple.</em></strong> The target must succeed on a <strong>DC {{savedc:str}}</strong> Str. or Dex. save (it chooses which), or it has the Grappled condition. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.\r\n\r\n<strong><em>Shove.</em></strong> The target must succeed on a <strong>DC {{savedc:str}}</strong> Str. or Dex. save (it chooses which), or you either push it 5 ft. away or cause it to have the Prone condition. This shove is possible only if the target is no more than one size larger than you.",
            notes: "<p>Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an [rules]Unarmed Strike[/rules]—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.</p>"
        },
        ...featureActions
    ];

    const spellSlotsPayload: Record<string, any> = {};
    const slotsResult = calculateMulticlassSpellSlots(ctx.state.classes, ctx.classes);
    slotsResult.standardSlots.forEach((total, idx) => {
        if (total > 0) {
            const slotLvl = idx + 1;
            spellSlotsPayload[`level${slotLvl}`] = {
                level: slotLvl,
                total,
                label: `${slotLvl}${getOrdinalSuffix(slotLvl)} Level`
            };
        }
    });
    if (slotsResult.pactSlotCount > 0) {
        spellSlotsPayload.pact = {
            level: slotsResult.pactSlotLevel,
            total: slotsResult.pactSlotCount,
            label: `Pact Magic (${slotsResult.pactSlotLevel}${getOrdinalSuffix(slotsResult.pactSlotLevel)} Level)`
        };
    }
    if (Object.keys(spellSlotsPayload).length === 0 && ctx.state.originFeatId.startsWith("magic-initiate")) {
        spellSlotsPayload.level1 = {
            level: 1,
            total: 1,
            label: "1st Level"
        };
    }

    const chosenLineage = species.lineages?.find((l) => l.id === ctx.state.lineageId);
    const raceLabel = chosenLineage ? chosenLineage.name : species.name;

    const damageResistances: string[] = [];
    if (ctx.state.speciesId === "dragonborn") {
        const ancestryChoice = (ctx.state.lineageId || "red").toLowerCase();
        const ancestryMap: Record<string, string> = {
            black: "Acid", copper: "Acid",
            blue: "Lightning", bronze: "Lightning",
            brass: "Fire", gold: "Fire", red: "Fire",
            green: "Poison",
            silver: "Cold", white: "Cold"
        };
        const dmg = ancestryMap[ancestryChoice] || "Fire";
        damageResistances.push(dmg);
    } else if (ctx.state.speciesId === "dwarf") {
        damageResistances.push("Poison");
    } else if (ctx.state.speciesId === "aasimar") {
        damageResistances.push("Necrotic", "Radiant");
    } else if (ctx.state.speciesId === "tiefling") {
        if (ctx.state.lineageId === "abyssal") damageResistances.push("Poison");
        else if (ctx.state.lineageId === "chthonic") damageResistances.push("Necrotic");
        else damageResistances.push("Fire");
    }

    const maxHp = ctx.getMaxHp();
    const classSummaries = ctx.state.classes.map((cc) => {
        const cDef = ctx.classes.find((c) => c.id === cc.classId);
        return `${cDef?.name || cc.classId} ${cc.level}`;
    }).join(" / ");

    const classesPayload = ctx.state.classes.map((cc) => {
        const cDef = ctx.classes.find((c) => c.id === cc.classId);
        const subDef = cc.subclassId ? cDef?.subclasses?.find((s) => s.id === cc.subclassId) : undefined;
        return {
            name: cDef?.name || cc.classId,
            level: cc.level,
            subclass: subDef?.name
        };
    });

    const hitDiceStr = ctx.state.classes.map((cc) => {
        const cDef = ctx.classes.find((c) => c.id === cc.classId);
        return `${cc.level}d${cDef?.hitDie || 8}`;
    }).join(" + ");

    const characterPayload: any = {
        name: ctx.state.name,
        subtitle: `Level ${ctx.state.level} ${raceLabel} ${classSummaries}`,
        level: ctx.state.level,
        race: raceLabel,
        species: species.name,
        lineage: chosenLineage ? chosenLineage.name : undefined,
        background: bg.name,
        alignment: ctx.state.alignment,
        avatarUrl: ctx.state.avatarUrl,
        source: "site",
        classes: classesPayload,
        damageResistances,
        vitals: {
            currentHp: maxHp,
            maxHp: maxHp,
            tempHp: 0,
            armorClass: ctx.getArmorClass(),
            initiative: ctx.getInitiative(),
            speed: ctx.getSpeedDisplay(),
            proficiencyBonus: pb,
            passivePerception: 10 + (percSkill?.bonus || 0),
            passiveInvestigation: 10 + (invSkill?.bonus || 0),
            passiveInsight: 10 + (insSkill?.bonus || 0),
            darkvision: chosenLineage?.darkvision || species.darkvision || "None",
            hitDice: hitDiceStr,
            heroicInspiration: false,
            spellSaveDc: ctx.getSpellSaveDc() ?? 10,
            spellAttackBonus: ctx.getSpellAttackModifier() ?? 0,
            spellcastingAbility: ctx.getSpellcastingAbility() ?? "none",
            deathSaves: { successes: 0, failures: 0, isStable: false },
            damageResistances
        },
        abilities: abilitiesPayload,
        skills: skillsPayload,
        weapons: weaponsPayload,
        equipment: equipmentPayload,
        spells: spellsPayload,
        features: featuresPayload,
        actions: actionsPayload,
        proficiencies: {
            armor: ctx.getAllArmorProficiencies(),
            weapons: ctx.getAllWeaponProficiencies(),
            tools: ctx.getAllToolProficiencies(),
            languages: ["Common"]
        },
        classResources: resourcesPayload,
        spellSlots: spellSlotsPayload,
        creatorState: {
            ...ctx.state
        },
        featureChoices: Object.fromEntries(
            Object.entries(ctx.state.subclassFeatureChoices || {}).filter(([key]) => {
                const parts = key.split("-");
                const clsPrefix = parts[0];
                const reqLvl = Number(parts[1]);
                if (clsPrefix !== ctx.state.classId) return false;
                if (!Number.isNaN(reqLvl) && reqLvl > ctx.state.level) return false;
                return true;
            })
        ),
        subclassFeatureChoices: Object.fromEntries(
            Object.entries(ctx.state.subclassFeatureChoices || {}).filter(([key]) => {
                const parts = key.split("-");
                const clsPrefix = parts[0];
                const reqLvl = Number(parts[1]);
                if (clsPrefix !== ctx.state.classId) return false;
                if (!Number.isNaN(reqLvl) && reqLvl > ctx.state.level) return false;
                return true;
            })
        )
    };

    for (const opt of selectedProgressionOptions) {
        applyProgressionChoiceOption(characterPayload, opt, 1);
    }

    return characterPayload;
}

export async function submitCharacter(ctx: CharacterCreatorContext): Promise<void> {
    if (!ctx.state.name.trim()) {
        ctx.goToStep(1);
        ctx.showAlert("Please enter a character name.");
        return;
    }

    const submitBtn = document.getElementById("creator-submit-btn") as HTMLButtonElement;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = ctx.state.savedId
            ? `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`
            : `<i class="fa-solid fa-spinner fa-spin"></i> Creating...`;
    }

    try {
        const characterPayload = ctx.buildPayload();
        const saveBody: any = {
            name: ctx.state.name,
            source: "site",
            character: characterPayload
        };
        const isUpdatingExisting = Boolean(ctx.state.savedId || ctx.state.siteCharacterId);
        if (ctx.state.savedId) {
            saveBody.savedId = ctx.state.savedId;
            characterPayload.savedCharacterId = ctx.state.savedId;
        }
        if (ctx.state.siteCharacterId) {
            saveBody.siteCharacterId = ctx.state.siteCharacterId;
            characterPayload.siteCharacterId = ctx.state.siteCharacterId;
        }

        const response = isUpdatingExisting
            ? await putData<any>("/save-character", saveBody)
            : await postData<any>("/create-character", saveBody);

        if (response && response.savedCharacter?.siteCharacterId) {
            window.location.href = `/character-sheet/${response.savedCharacter.siteCharacterId}`;
        } else if (response && response.character?.siteCharacterId) {
            window.location.href = `/character-sheet/${response.character.siteCharacterId}`;
        } else if (ctx.state.savedId) {
            window.location.href = `/character-sheet/${ctx.state.savedId}`;
        } else {
            window.location.href = "/character-sheet";
        }
    } catch (err: any) {
        console.error("Error creating/saving character:", err);
        ctx.showAlert("Failed to save character. Please verify your connection or login status.");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = ctx.state.savedId
                ? `<i class="fa-solid fa-floppy-disk"></i> Save Changes`
                : `<i class="fa-solid fa-check"></i> Create Character`;
        }
    }
}
