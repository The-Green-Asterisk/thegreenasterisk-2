import {
    AbilityName,
    CLASSES_2024,
    CLASS_SPELL_PRIORITIES,
    MulticlassCasterClassInfo,
    RuleSpellDefinition,
    SPELLS_2024,
    calculateMulticlassSpellSlots,
    getMulticlassCasterInfo
} from "../../../rules/dnd5e_2024";
import { FeatureSpellChoiceSection, SpellBucket, SpellBucketSelection } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

function getAllSpells(ctx: CharacterCreatorContext): RuleSpellDefinition[] {
    return (ctx.spells && ctx.spells.length > 0) ? ctx.spells : SPELLS_2024;
}

export function getSpellcasterInfos(ctx: CharacterCreatorContext): MulticlassCasterClassInfo[] {
    ctx.syncStateClassProperties();
    if (Array.isArray(ctx.state.classes) && ctx.state.classes.length === 1) {
        if (ctx.state.classId && ctx.state.classes[0].classId !== ctx.state.classId) {
            ctx.state.classes[0].classId = ctx.state.classId;
        }
        if (ctx.state.subclassId !== undefined && ctx.state.classes[0].subclassId !== ctx.state.subclassId) {
            ctx.state.classes[0].subclassId = ctx.state.subclassId;
        }
        if (ctx.state.level && ctx.state.classes[0].level !== ctx.state.level) {
            ctx.state.classes[0].level = ctx.state.level;
        }
    }
    const infos: MulticlassCasterClassInfo[] = [];
    for (const cc of ctx.state.classes || []) {
        const classDef = ctx.classes.find((x) => x.id === (cc.classId || "").toLowerCase());
        const info = getMulticlassCasterInfo(cc, classDef);
        if (info) {
            infos.push(info);
        }
    }
    return infos;
}

export function getMaxCantrips(ctx: CharacterCreatorContext): number {
    const infos = getSpellcasterInfos(ctx);
    let count = 0;
    for (const info of infos) {
        count += info.maxCantrips;
    }

    // Origin Feat bonus: Magic Initiate grants 2 cantrips
    if (ctx.state.originFeatId.startsWith("magic-initiate")) {
        count += 2;
    }

    return count;
}

export function getMaxPreparedSpells(ctx: CharacterCreatorContext): number {
    const infos = getSpellcasterInfos(ctx);
    let count = 0;
    for (const info of infos) {
        count += info.maxPrepared;
    }

    // Origin Feat bonus: Magic Initiate grants 1 prepared 1st-level spell
    if (ctx.state.originFeatId.startsWith("magic-initiate")) {
        count += 1;
    }

    return count;
}

export function getAllowedSpellClasses(ctx: CharacterCreatorContext): string[] {
    const list: string[] = [];
    const infos = getSpellcasterInfos(ctx);
    for (const info of infos) {
        if (info.type === "third") {
            if (!list.includes("Wizard")) list.push("Wizard");
        } else if (!list.includes(info.className)) {
            list.push(info.className);
        }

        // Expanded spell lists (e.g. Bard's Magical Secrets at Level 10)
        const cc = ctx.state.classes?.find((c) => c.classId.toLowerCase() === info.className.toLowerCase());
        const clsDef = ctx.classes.find((c) => c.id === cc?.classId || c.slug === cc?.classId) || CLASSES_2024.find((c) => c.id === info.className.toLowerCase());
        const expLists = clsDef?.spellcasting?.expandedSpellLists;
        if (Array.isArray(expLists)) {
            for (const exp of expLists) {
                if ((info.level || cc?.level || 1) >= exp.level) {
                    for (const expCls of exp.classes) {
                        if (!list.includes(expCls)) {
                            list.push(expCls);
                        }
                    }
                }
            }
        }
    }
    if (ctx.state.originFeatId === "magic-initiate-cleric" && !list.includes("Cleric")) list.push("Cleric");
    if (ctx.state.originFeatId === "magic-initiate-druid" && !list.includes("Druid")) list.push("Druid");
    if (ctx.state.originFeatId === "magic-initiate-wizard" && !list.includes("Wizard")) list.push("Wizard");
    return list;
}

export function getMaxSpellLevel(ctx: CharacterCreatorContext): number {
    const infos = getSpellcasterInfos(ctx);
    if (infos.length === 0) {
        if (ctx.state.originFeatId.startsWith("magic-initiate")) return 1;
        return 0;
    }
    let maxLvl = Math.max(...infos.map((i) => i.maxSpellLevel), 0);
    if (ctx.state.originFeatId.startsWith("magic-initiate") && maxLvl < 1) {
        maxLvl = 1;
    }
    return maxLvl;
}

export function getAvailableSpells(ctx: CharacterCreatorContext): {
    cantrips: RuleSpellDefinition[];
    leveledSpells: RuleSpellDefinition[];
    spellsLvl1: RuleSpellDefinition[];
} {
    const allowed = getAllowedSpellClasses(ctx);
    if (allowed.length === 0) {
        return { cantrips: [], leveledSpells: [], spellsLvl1: [] };
    }
    const infos = getSpellcasterInfos(ctx);
    const hasMagicInitiate = ctx.state.originFeatId.startsWith("magic-initiate");
    const miClass = ctx.state.originFeatId === "magic-initiate-cleric"
        ? "Cleric"
        : ctx.state.originFeatId === "magic-initiate-druid"
            ? "Druid"
            : ctx.state.originFeatId === "magic-initiate-wizard"
                ? "Wizard"
                : "";

    // Base caster classes that provide cantrips (unless an expanded spell list explicitly enables cantrips)
    const cantripClasses: string[] = [];
    for (const info of infos) {
        if (info.type === "third") {
            if (!cantripClasses.includes("Wizard")) cantripClasses.push("Wizard");
        } else if (!cantripClasses.includes(info.className)) {
            cantripClasses.push(info.className);
        }
        const cc = ctx.state.classes?.find((c) => c.classId.toLowerCase() === info.className.toLowerCase());
        const clsDef = ctx.classes.find((c) => c.id === cc?.classId || c.slug === cc?.classId) || CLASSES_2024.find((c) => c.id === info.className.toLowerCase());
        const expLists = clsDef?.spellcasting?.expandedSpellLists;
        if (Array.isArray(expLists)) {
            for (const exp of expLists) {
                if (exp.allowCantrips && (info.level || cc?.level || 1) >= exp.level) {
                    for (const expCls of exp.classes) {
                        if (!cantripClasses.includes(expCls)) {
                            cantripClasses.push(expCls);
                        }
                    }
                }
            }
        }
    }
    if (miClass && !cantripClasses.includes(miClass)) {
        cantripClasses.push(miClass);
    }

    const allSpells = getAllSpells(ctx);

    const cantrips = allSpells.filter((sp) => {
        if (sp.level !== 0) return false;
        return sp.classes.some((c) => cantripClasses.includes(c));
    });

    const leveledSpells = allSpells.filter((sp) => {
        if (sp.level < 1) return false;
        // D&D 2024 Multiclassing: prepare spells individually per class, up to that class's max spell level
        const canPrepareFromClass = infos.some((info) => {
            const cc = ctx.state.classes?.find((c) => c.classId.toLowerCase() === info.className.toLowerCase());
            const clsDef = ctx.classes.find((c) => c.id === cc?.classId || c.slug === cc?.classId) || CLASSES_2024.find((c) => c.id === info.className.toLowerCase());
            const expLists = clsDef?.spellcasting?.expandedSpellLists;
            if (Array.isArray(expLists)) {
                for (const exp of expLists) {
                    if ((info.level || cc?.level || 1) >= exp.level) {
                        if (sp.classes.some((c) => exp.classes.includes(c)) && sp.level <= info.maxSpellLevel) {
                            return true;
                        }
                    }
                }
            }
            const targetClassName = info.type === "third" ? "Wizard" : info.className;
            return sp.classes.includes(targetClassName) && sp.level <= info.maxSpellLevel;
        });
        if (canPrepareFromClass) return true;

        // Granted by Magic Initiate (1st-level spell from selected spell list)
        if (hasMagicInitiate && sp.level === 1 && miClass && sp.classes.includes(miClass)) {
            return true;
        }

        return false;
    });

    return { cantrips, leveledSpells, spellsLvl1: leveledSpells };
}

export function getFeatureSpellChoiceSections(ctx: CharacterCreatorContext): FeatureSpellChoiceSection[] {
    ctx.syncStateClassProperties();
    if (Array.isArray(ctx.state.classes) && ctx.state.classes.length === 1) {
        if (ctx.state.classId && ctx.state.classes[0].classId !== ctx.state.classId) {
            ctx.state.classes[0].classId = ctx.state.classId;
        }
        if (ctx.state.subclassId !== undefined && ctx.state.classes[0].subclassId !== ctx.state.subclassId) {
            ctx.state.classes[0].subclassId = ctx.state.subclassId;
        }
        if (ctx.state.level && ctx.state.classes[0].level !== ctx.state.level) {
            ctx.state.classes[0].level = ctx.state.level;
        }
    }
    ctx.state.featureSpellChoices = ctx.state.featureSpellChoices || {};

    const getClassLevel = (cid: string): number => {
        const found = (ctx.state.classes || []).find((c) => (c.classId || "").toLowerCase() === cid.toLowerCase());
        return found ? (found.level || 0) : 0;
    };
    const getClassSubclass = (cid: string): string => {
        const found = (ctx.state.classes || []).find((c) => (c.classId || "").toLowerCase() === cid.toLowerCase());
        const raw = found ? (found.subclassId || "") : "";
        return ctx.resolveCanonicalSubclassId(cid, raw);
    };

    const sections: FeatureSpellChoiceSection[] = [];
    const allSpells = getAllSpells(ctx);

    // 1. Warlock — Pact of the Tome (3 cantrips from any class + 2 Level 1 Ritual spells from any class)
    if (getClassLevel("warlock") >= 1 && Array.isArray(ctx.state.invocations) && ctx.state.invocations.includes("pact-of-the-tome")) {
        sections.push({
            id: "pact-of-the-tome-cantrips",
            title: "Pact of the Tome: Book of Shadows — Cantrips",
            sourceLabel: "Warlock / Pact of the Tome",
            description: "While the Book of Shadows is on your person, you have three chosen cantrips prepared from any class's spell list, and they function as Warlock spells for you.",
            chooseCount: 3,
            availableSpells: allSpells.filter((sp) => sp.level === 0),
            ability: "cha"
        });
        const currentTomeRitualNames = new Set(ctx.state.featureSpellChoices?.["pact-of-the-tome-rituals"] || []);
        const availableRituals = allSpells.filter((sp) =>
            (sp.level === 1) ||
            sp.ritual ||
            sp.name === "Mirror Image" ||
            currentTomeRitualNames.has(sp.name)
        );
        sections.push({
            id: "pact-of-the-tome-rituals",
            title: "Pact of the Tome: Book of Shadows — 1st-Level Rituals & Bonus Spells",
            sourceLabel: "Warlock / Pact of the Tome",
            description: "Choose two 1st-level spells that have the Ritual tag (or bonus spells granted by your Book of Shadows) from any class's spell list. While the book is on your person, you have the chosen spells prepared, and they function as Warlock spells for you.",
            chooseCount: 2,
            availableSpells: availableRituals,
            ability: "cha"
        });
    }

    // 2. Cleric — Divine Order: Thaumaturge (1 extra Cleric cantrip)
    if (getClassLevel("cleric") >= 1 && ctx.state.divineOrder === "thaumaturge") {
        sections.push({
            id: "divine-order-thaumaturge",
            title: "Divine Order: Thaumaturge — Bonus Cleric Cantrip",
            sourceLabel: "Cleric / Divine Order (Thaumaturge)",
            description: "You know one extra cantrip of your choice from the Cleric spell list.",
            chooseCount: 1,
            availableSpells: allSpells.filter((sp) => sp.level === 0 && sp.classes.includes("Cleric")),
            ability: "wis"
        });
    }

    // 3. Druid — Primal Order: Magician (1 extra Druid cantrip)
    if (getClassLevel("druid") >= 1 && ctx.state.primalOrder === "magician") {
        sections.push({
            id: "primal-order-magician",
            title: "Primal Order: Magician — Bonus Druid Cantrip",
            sourceLabel: "Druid / Primal Order (Magician)",
            description: "You know one extra cantrip of your choice from the Druid spell list.",
            chooseCount: 1,
            availableSpells: allSpells.filter((sp) => sp.level === 0 && sp.classes.includes("Druid")),
            ability: "wis"
        });
    }

    // 4. Fighting Style — Blessed Warrior (2 Cleric cantrips)
    const hasFightingStyleClass = getClassLevel("fighter") >= 1 || getClassLevel("paladin") >= 2 || getClassLevel("ranger") >= 2;
    const hasChampionAdditionalFs = getClassLevel("fighter") >= 7 && getClassSubclass("fighter") === "champion";
    if (
        (hasFightingStyleClass && ctx.state.fightingStyle === "blessed-warrior") ||
        (hasChampionAdditionalFs && ctx.state.subclassFeatureChoices?.["fighter-7-champion"] === "blessed-warrior")
    ) {
        sections.push({
            id: "fighting-style-blessed-warrior",
            title: "Fighting Style: Blessed Warrior — Cleric Cantrips",
            sourceLabel: "Fighting Style (Blessed Warrior)",
            description: "You learn two Cleric cantrips of your choice. They count as class spells for you, and Charisma is your spellcasting ability for them.",
            chooseCount: 2,
            availableSpells: allSpells.filter((sp) => sp.level === 0 && sp.classes.includes("Cleric")),
            ability: "cha"
        });
    }

    // 5. Fighting Style — Druidic Warrior (2 Druid cantrips)
    if (
        (hasFightingStyleClass && ctx.state.fightingStyle === "druidic-warrior") ||
        (hasChampionAdditionalFs && ctx.state.subclassFeatureChoices?.["fighter-7-champion"] === "druidic-warrior")
    ) {
        sections.push({
            id: "fighting-style-druidic-warrior",
            title: "Fighting Style: Druidic Warrior — Druid Cantrips",
            sourceLabel: "Fighting Style (Druidic Warrior)",
            description: "You learn two Druid cantrips of your choice. They count as class spells for you, and Wisdom is your spellcasting ability for them.",
            chooseCount: 2,
            availableSpells: allSpells.filter((sp) => sp.level === 0 && sp.classes.includes("Druid")),
            ability: "wis"
        });
    }

    // 6. Bard — College of Lore: Magical Discoveries (Level 6+: 2 spells from Cleric, Druid, or Wizard)
    const bardLvl = getClassLevel("bard");
    if (bardLvl >= 6 && getClassSubclass("bard") === "lore") {
        const bardMaxSpellLvl = Math.min(9, Math.ceil(bardLvl / 2));
        sections.push({
            id: "bard-6-magical-discoveries",
            title: "Magical Discoveries (College of Lore) — Bonus Spells",
            sourceLabel: "Bard / Magical Discoveries",
            description: "You learn two spells of your choice from the Cleric, Druid, or Wizard spell list (cantrip or a spell of a level you can cast). You always have the chosen spells prepared.",
            chooseCount: 2,
            availableSpells: allSpells.filter((sp) => sp.level <= bardMaxSpellLvl && sp.classes.some((c) => c === "Cleric" || c === "Druid" || c === "Wizard")),
            ability: "cha"
        });
    }

    // 7. Warlock — Mystic Arcanum (Levels 11, 13, 15, 17: 6th, 7th, 8th, 9th level Warlock spell)
    const warlockLvl = getClassLevel("warlock");
    const arcanumTiers = [
        { minLvl: 11, spellLvl: 6, label: "6th" },
        { minLvl: 13, spellLvl: 7, label: "7th" },
        { minLvl: 15, spellLvl: 8, label: "8th" },
        { minLvl: 17, spellLvl: 9, label: "9th" }
    ];
    for (const tier of arcanumTiers) {
        if (warlockLvl >= tier.minLvl) {
            sections.push({
                id: `warlock-${tier.minLvl}-mystic-arcanum`,
                title: `Mystic Arcanum (${tier.label} Level)`,
                sourceLabel: `Warlock / Mystic Arcanum (${tier.label} Level)`,
                description: `Your patron grants you a magical secret called an arcanum. Choose one ${tier.label}-level Warlock spell as this arcanum. You can cast it once without expending a spell slot per Long Rest.`,
                chooseCount: 1,
                availableSpells: allSpells.filter((sp) => sp.level === tier.spellLvl && sp.classes.includes("Warlock")),
                ability: "cha"
            });
        }
    }

    // 9. Wizard — Spell Mastery (Level 18+: 1 Level 1 Wizard spell and 1 Level 2 Wizard spell) & Signature Spells (Level 20: 2 Level 3 Wizard spells)
    const wizardLvl = getClassLevel("wizard");
    if (wizardLvl >= 18) {
        sections.push({
            id: "wizard-18-spell-mastery-1",
            title: "Spell Mastery — Level 1 Wizard Spell",
            sourceLabel: "Wizard / Spell Mastery",
            description: "Choose one Level 1 Wizard spell that has a casting time of an action. You always have it prepared and can cast it at its lowest level without expending a spell slot.",
            chooseCount: 1,
            availableSpells: allSpells.filter((sp) => sp.level === 1 && sp.classes.includes("Wizard")),
            ability: "int"
        });
        sections.push({
            id: "wizard-18-spell-mastery-2",
            title: "Spell Mastery — Level 2 Wizard Spell",
            sourceLabel: "Wizard / Spell Mastery",
            description: "Choose one Level 2 Wizard spell that has a casting time of an action. You always have it prepared and can cast it at its lowest level without expending a spell slot.",
            chooseCount: 1,
            availableSpells: allSpells.filter((sp) => sp.level === 2 && sp.classes.includes("Wizard")),
            ability: "int"
        });
    }
    if (wizardLvl >= 20) {
        sections.push({
            id: "wizard-20-signature-spells",
            title: "Signature Spells — Level 3 Wizard Spells",
            sourceLabel: "Wizard / Signature Spells",
            description: "Choose two Level 3 Wizard spells in your spellbook as your signature spells. You always have these spells prepared and can cast each of them once at 3rd level without expending a spell slot per Short or Long Rest.",
            chooseCount: 2,
            availableSpells: allSpells.filter((sp) => sp.level === 3 && sp.classes.includes("Wizard")),
            ability: "int"
        });
    }

    // 10. Dynamic progression choices with choiceType === "spell"
    for (const c of ctx.state.classes || []) {
        const clsDef = ctx.classes.find((x) => x.id === c.classId);
        const subDef = clsDef?.subclasses?.find((s) => s.id === ctx.resolveCanonicalSubclassId(c.classId, c.subclassId));
        const progList = [
            ...(clsDef?.progression || []).map((p) => ({ ...p, src: clsDef?.name || c.classId })),
            ...(subDef?.progression || []).map((p) => ({ ...p, src: `${clsDef?.name || c.classId} / ${subDef?.name || c.subclassId}` }))
        ];
        for (const pl of progList) {
            if (pl.level > (c.level || 0)) continue;
            for (const ch of pl.choices || []) {
                if (ch.choiceType === "spell") {
                    const secId = ch.choiceId || ch.id || `dynamic-spell-${c.classId}-${pl.level}`;
                    if (sections.some((s) => s.id === secId)) continue;
                    const optNames = new Set((ch.options || []).map((o: any) => String(o.name || o.id || "").toLowerCase()));
                    const pool = optNames.size > 0
                        ? allSpells.filter((sp) => optNames.has(sp.name.toLowerCase()) || optNames.has(sp.id.toLowerCase()))
                        : allSpells;
                    sections.push({
                        id: secId,
                        title: ch.name || "Bonus Spell Selection",
                        sourceLabel: `${pl.src} / ${ch.name || "Bonus Spell"}`,
                        description: ch.description || ch.prompt || "Select your bonus spell(s) granted by this progression feature.",
                        chooseCount: ch.chooseCount || 1,
                        availableSpells: pool
                    });
                }
            }
        }
    }

    return sections;
}

/**
 * Returns the (lower-cased) names of every spell granted by class or subclass progression:
 *  - spells chosen in the "Class & Subclass Progression Spells" sections (featureSpellChoices)
 *  - always-prepared spells listed in unlocked class/subclass progression levels (grantedSpells)
 * These are bonus spells and must never count against the base cantrip/prepared spell allotment.
 */
export function getProgressionGrantedSpellNames(ctx: CharacterCreatorContext): Set<string> {
    const names = new Set<string>();
    const allSpells = getAllSpells(ctx);
    for (const list of Object.values(ctx.state.featureSpellChoices || {})) {
        if (Array.isArray(list)) list.forEach((n) => names.add(String(n).toLowerCase()));
    }
    const addGranted = (sp: any) => {
        const raw = typeof sp === "string" ? sp : (sp?.name || sp?.spellId || "");
        if (!raw) return;
        const rawLower = String(raw).toLowerCase();
        const def = (ctx.getSpell ? ctx.getSpell(raw) : undefined) || allSpells.find((s) => s.name.toLowerCase() === rawLower || s.id.toLowerCase() === rawLower);
        names.add((def ? def.name : String(raw)).toLowerCase());
    };
    for (const c of ctx.state.classes || []) {
        const clsDef = ctx.classes.find((x) => x.id === c.classId);
        const subDef = clsDef?.subclasses?.find((s) => s.id === ctx.resolveCanonicalSubclassId(c.classId, c.subclassId));
        const unlocked = c.level || 1;
        for (const pl of [...(clsDef?.progression || []), ...(subDef?.progression || [])]) {
            if (pl.level <= unlocked && Array.isArray(pl.grantedSpells)) {
                pl.grantedSpells.forEach(addGranted);
            }
        }
    }
    return names;
}

export const MAGIC_INITIATE_BUCKET_KEY = "magic-initiate";

function getMagicInitiateClass(ctx: CharacterCreatorContext): string {
    if (ctx.state.originFeatId === "magic-initiate-cleric") return "Cleric";
    if (ctx.state.originFeatId === "magic-initiate-druid") return "Druid";
    if (ctx.state.originFeatId === "magic-initiate-wizard") return "Wizard";
    return "";
}

function getClassSpellLists(ctx: CharacterCreatorContext, info: MulticlassCasterClassInfo): {
    base: string;
    cantripLists: Array<{ list: string; feature?: string }>;
    leveledLists: Array<{ list: string; feature?: string }>;
} {
    const base = info.type === "third" ? "Wizard" : info.className;
    const cantripLists: Array<{ list: string; feature?: string }> = [{ list: base }];
    const leveledLists: Array<{ list: string; feature?: string }> = [{ list: base }];
    const cc = ctx.state.classes?.find((c) => c.classId.toLowerCase() === info.classId);
    const clsDef = ctx.classes.find((c) => c.id === cc?.classId || c.slug === cc?.classId) || CLASSES_2024.find((c) => c.id === info.classId);
    const subId = cc ? ctx.resolveCanonicalSubclassId(cc.classId, cc.subclassId) : "";
    const subDef = clsDef?.subclasses?.find((s) => s.id === subId);
    const expanded = [...(clsDef?.spellcasting?.expandedSpellLists || []), ...(subDef?.expandedSpellLists || [])];
    for (const exp of expanded) {
        if (info.level < exp.level) continue;
        for (const expCls of exp.classes) {
            if (!leveledLists.some((l) => l.list === expCls)) leveledLists.push({ list: expCls, feature: exp.feature });
            if (exp.allowCantrips && !cantripLists.some((l) => l.list === expCls)) cantripLists.push({ list: expCls, feature: exp.feature });
        }
    }
    return { base, cantripLists, leveledLists };
}

/**
 * Builds one class's spell pool. A spell on the class's own list needs no note; one reachable only through a feature
 * such as Magical Secrets is noted with that feature; one D&D Beyond put on this class that the spell database can't
 * place on any of these lists is kept and noted as coming from D&D Beyond (or the class's expanded-list feature).
 */
function buildClassPool(
    allSpells: RuleSpellDefinition[],
    lists: Array<{ list: string; feature?: string }>,
    fits: (sp: RuleSpellDefinition) => boolean,
    imported: string[],
    importedNote: string,
    via: Record<string, string>
): RuleSpellDefinition[] {
    const pool: RuleSpellDefinition[] = [];
    for (const sp of allSpells) {
        if (!fits(sp)) continue;
        const matches = lists.filter((l) => sp.classes.includes(l.list));
        if (matches.length === 0) continue;
        pool.push(sp);
        if (!matches.some((m) => !m.feature)) via[sp.name] = matches[0].feature || "";
    }
    for (const name of imported) {
        if (pool.some((sp) => sp.name === name)) continue;
        const sp = allSpells.find((s) => s.name === name);
        if (!sp || !fits(sp)) continue;
        pool.push(sp);
        via[sp.name] = importedNote;
    }
    return pool;
}

/**
 * D&D 2024 multiclassing: each class prepares its own spells from its own list, using its own class level for the
 * number of cantrips/prepared spells and the highest spell level it can prepare. Magic Initiate is its own pool.
 */
export function getSpellBuckets(ctx: CharacterCreatorContext): SpellBucket[] {
    const allSpells = getAllSpells(ctx);
    const buckets: SpellBucket[] = [];
    for (const info of getSpellcasterInfos(ctx)) {
        if (buckets.some((b) => b.key === info.classId)) continue;
        const { base, cantripLists, leveledLists } = getClassSpellLists(ctx, info);
        const imported = ctx.state.importedClassSpells?.[info.classId] || [];
        const expandedFeature = leveledLists.find((l) => l.feature)?.feature;
        const importedNote = expandedFeature || "Added on D&D Beyond";
        const via: Record<string, string> = {};
        buckets.push({
            key: info.classId,
            kind: "class",
            label: info.className,
            sourceLabel: info.className,
            level: info.level,
            ability: info.ability,
            maxCantrips: info.maxCantrips,
            maxPrepared: info.maxPrepared,
            maxSpellLevel: info.maxSpellLevel,
            priorityKey: info.type === "third" ? "wizard" : info.classId,
            baseList: base,
            cantripPool: info.maxCantrips > 0
                ? buildClassPool(allSpells, cantripLists, (sp) => sp.level === 0, imported, importedNote, via)
                : [],
            preparedPool: info.maxPrepared > 0
                ? buildClassPool(allSpells, leveledLists, (sp) => sp.level >= 1 && sp.level <= info.maxSpellLevel, imported, importedNote, via)
                : [],
            via
        });
    }
    const miClass = getMagicInitiateClass(ctx);
    if (miClass) {
        buckets.push({
            key: MAGIC_INITIATE_BUCKET_KEY,
            kind: "feat",
            label: `Magic Initiate (${miClass})`,
            sourceLabel: `Magic Initiate (${miClass})`,
            level: 0,
            ability: miClass === "Wizard" ? "int" : "wis",
            maxCantrips: 2,
            maxPrepared: 1,
            maxSpellLevel: 1,
            priorityKey: miClass.toLowerCase(),
            baseList: miClass,
            cantripPool: allSpells.filter((sp) => sp.level === 0 && sp.classes.includes(miClass)),
            preparedPool: allSpells.filter((sp) => sp.level === 1 && sp.classes.includes(miClass)),
            via: {}
        });
    }
    return buckets;
}

/**
 * Resolves a saved spell's source (a class name, or a Magic Initiate label) to its spell bucket key.
 */
export function resolveSpellBucketKey(ctx: CharacterCreatorContext, source: string): string | null {
    const src = String(source || "").trim().toLowerCase();
    if (!src) return null;
    if (src.startsWith("magic initiate")) return MAGIC_INITIATE_BUCKET_KEY;
    for (const c of ctx.state.classes || []) {
        const def = ctx.classes.find((x) => x.id === c.classId);
        if (src === c.classId.toLowerCase() || src === (def?.name || "").toLowerCase()) return c.classId;
    }
    return null;
}

function uniq(names: string[]): string[] {
    return Array.from(new Set(names));
}

export function getBucketSelection(ctx: CharacterCreatorContext, key: string): SpellBucketSelection {
    ctx.state.classSpellSelections = ctx.state.classSpellSelections || {};
    const sel = ctx.state.classSpellSelections[key] || { cantrips: [], prepared: [] };
    ctx.state.classSpellSelections[key] = sel;
    return sel;
}

/**
 * Rebuilds the flat selectedCantrips / selectedSpellsLevel1 lists from the per-class selections, keeping the
 * existing order and appending anything new.
 */
export function syncFlatSpellSelections(ctx: CharacterCreatorContext): void {
    const sels = Object.values(ctx.state.classSpellSelections || {});
    const cantrips = uniq(sels.flatMap((s) => s.cantrips));
    const prepared = uniq(sels.flatMap((s) => s.prepared));
    ctx.state.selectedCantrips = uniq([...ctx.state.selectedCantrips.filter((n) => cantrips.includes(n)), ...cantrips]);
    ctx.state.selectedSpellsLevel1 = uniq([...ctx.state.selectedSpellsLevel1.filter((n) => prepared.includes(n)), ...prepared]);
}

/**
 * Keeps the per-class selections consistent with the flat selection lists: drops picks a class can no longer make,
 * and assigns any unattributed pick to a class that can take it.
 */
function reconcileSpellBuckets(ctx: CharacterCreatorContext): void {
    const buckets = getSpellBuckets(ctx);
    const prev = ctx.state.classSpellSelections || {};
    const next: Record<string, SpellBucketSelection> = {};
    const cantripSet = new Set(ctx.state.selectedCantrips);
    const preparedSet = new Set(ctx.state.selectedSpellsLevel1);

    for (const b of buckets) {
        const old = prev[b.key] || { cantrips: [], prepared: [] };
        const cantripNames = new Set(b.cantripPool.map((s) => s.name));
        const preparedNames = new Set(b.preparedPool.map((s) => s.name));
        next[b.key] = {
            cantrips: uniq((old.cantrips || []).filter((n) => cantripSet.has(n) && cantripNames.has(n))),
            prepared: uniq((old.prepared || []).filter((n) => preparedSet.has(n) && preparedNames.has(n)))
        };
    }

    // Most-constrained first: a spell only one class can take goes there before shared spells claim the room.
    // A shared spell then goes to a class with room whose own list has it (e.g. Misty Step to the Warlock rather than
    // to a Bard's Magical Secrets), then to any class with room, then to the first class that can take it.
    const assignAll = (names: string[], field: "cantrips" | "prepared"): Set<string> => {
        const poolOf = (b: SpellBucket) => (field === "cantrips" ? b.cantripPool : b.preparedPool);
        const maxOf = (b: SpellBucket) => (field === "cantrips" ? b.maxCantrips : b.maxPrepared);
        const hasRoom = (b: SpellBucket) => next[b.key][field].length < maxOf(b);
        const placed = new Set<string>();
        const pending: Array<{ name: string; eligible: SpellBucket[] }> = [];
        for (const name of names) {
            if (buckets.some((b) => next[b.key][field].includes(name))) {
                placed.add(name);
                continue;
            }
            const eligible = buckets.filter((b) => poolOf(b).some((s) => s.name === name));
            if (eligible.length > 0) pending.push({ name, eligible });
        }
        pending.sort((a, b) => a.eligible.length - b.eligible.length);
        for (const { name, eligible } of pending) {
            const onOwnList = (b: SpellBucket) => (ctx.getSpell(name)?.classes || []).includes(b.baseList);
            const target = eligible.find((b) => hasRoom(b) && onOwnList(b))
                || eligible.find(hasRoom)
                || eligible.find(onOwnList)
                || eligible[0];
            next[target.key][field].push(name);
            placed.add(name);
        }
        return placed;
    };

    const placedCantrips = assignAll(ctx.state.selectedCantrips, "cantrips");
    const placedPrepared = assignAll(ctx.state.selectedSpellsLevel1, "prepared");
    ctx.state.selectedCantrips = ctx.state.selectedCantrips.filter((n) => placedCantrips.has(n));
    ctx.state.selectedSpellsLevel1 = ctx.state.selectedSpellsLevel1.filter((n) => placedPrepared.has(n));
    ctx.state.classSpellSelections = next;
}

export function sanitizeSpellSelections(ctx: CharacterCreatorContext): void {
    ctx.state.featureSpellChoices = ctx.state.featureSpellChoices || {};
    const activeFeatureSections = getFeatureSpellChoiceSections(ctx);
    const activeSectionMap = new Map(activeFeatureSections.map((s) => [s.id, s]));

    for (const key of Object.keys(ctx.state.featureSpellChoices)) {
        const sec = activeSectionMap.get(key);
        if (!sec) {
            delete ctx.state.featureSpellChoices[key];
            continue;
        }
        const validNames = new Set(sec.availableSpells.map((sp) => sp.name));
        const current = Array.isArray(ctx.state.featureSpellChoices[key]) ? ctx.state.featureSpellChoices[key] : [];
        ctx.state.featureSpellChoices[key] = current.filter((name) => validNames.has(name)).slice(0, sec.chooseCount);
    }

    const allowed = getAllowedSpellClasses(ctx);
    if (allowed.length === 0) {
        ctx.state.selectedCantrips = [];
        ctx.state.selectedSpellsLevel1 = [];
        ctx.state.classSpellSelections = {};
        return;
    }
    const buckets = getSpellBuckets(ctx);
    const validCantripNames = new Set(buckets.flatMap((b) => b.cantripPool.map((s) => s.name)));
    const validLeveledNames = new Set(buckets.flatMap((b) => b.preparedPool.map((s) => s.name)));

    // Progression-granted spells are bonus spells: strip them from the base allotment so they are never double-counted
    const granted = getProgressionGrantedSpellNames(ctx);
    ctx.state.selectedCantrips = ctx.state.selectedCantrips.filter((s) => validCantripNames.has(s) && !granted.has(s.toLowerCase()));
    ctx.state.selectedSpellsLevel1 = ctx.state.selectedSpellsLevel1.filter((s) => validLeveledNames.has(s) && !granted.has(s.toLowerCase()));

    reconcileSpellBuckets(ctx);
}

function autoFillBucket(
    bucket: SpellBucket,
    exclude: Set<string>
): SpellBucketSelection {
    const priorities = CLASS_SPELL_PRIORITIES[bucket.priorityKey] || { cantrips: [], leveled: [] };
    const rank = (list: string[], sp: RuleSpellDefinition) => {
        const idx = list.indexOf(sp.name);
        return idx >= 0 ? idx : 999;
    };
    const byRank = (list: string[]) => (a: RuleSpellDefinition, b: RuleSpellDefinition) => {
        const rA = rank(list, a);
        const rB = rank(list, b);
        if (rA !== rB) return rA - rB;
        return a.name.localeCompare(b.name);
    };

    // 1. Smart Cantrips: rank by class priorities, then alphabetical
    const cantrips = bucket.cantripPool
        .filter((s) => !exclude.has(s.name.toLowerCase()))
        .sort(byRank(priorities.cantrips))
        .slice(0, bucket.maxCantrips)
        .map((c) => c.name);

    // 2. Smart Prepared Spells: ensure coverage across available spell levels, prioritizing staples
    const leveled = bucket.preparedPool.filter((s) => !exclude.has(s.name.toLowerCase()));
    const maxPrepared = bucket.maxPrepared;
    const maxLevel = bucket.maxSpellLevel;
    const byLevel: Record<number, RuleSpellDefinition[]> = {};
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
        byLevel[lvl] = leveled.filter((s) => s.level === lvl).sort(byRank(priorities.leveled));
    }

    const selected = new Set<string>();
    if (maxLevel <= 1) {
        (byLevel[1] || []).slice(0, maxPrepared).forEach((s) => selected.add(s.name));
    } else {
        // Multi-level: distribute across levels from maxLevel down to 1
        for (let lvl = maxLevel; lvl >= 1; lvl--) {
            const spellsAtLvl = byLevel[lvl] || [];
            const quota = lvl === maxLevel ? 2 : 1;
            for (let i = 0; i < Math.min(quota, spellsAtLvl.length); i++) {
                if (selected.size < maxPrepared) selected.add(spellsAtLvl[i].name);
            }
        }

        // Round-robin fill starting from highest levels down to 1
        let addedInPass = true;
        while (selected.size < maxPrepared && addedInPass) {
            addedInPass = false;
            for (let lvl = maxLevel; lvl >= 1; lvl--) {
                const next = (byLevel[lvl] || []).find((s) => !selected.has(s.name));
                if (next && selected.size < maxPrepared) {
                    selected.add(next.name);
                    addedInPass = true;
                }
                if (selected.size >= maxPrepared) break;
            }
        }
    }

    return { cantrips, prepared: Array.from(selected) };
}

/**
 * Auto-fills every spell bucket from its own class list and limits, never picking the same spell for two classes.
 */
export function getSmartAutoFillSpells(ctx: CharacterCreatorContext): {
    cantrips: string[];
    prepared: string[];
    byBucket: Record<string, SpellBucketSelection>;
} {
    // Don't spend base allotment on spells already granted by class/subclass progression
    const used = new Set(getProgressionGrantedSpellNames(ctx));
    const byBucket: Record<string, SpellBucketSelection> = {};
    for (const bucket of getSpellBuckets(ctx)) {
        const sel = autoFillBucket(bucket, used);
        [...sel.cantrips, ...sel.prepared].forEach((n) => used.add(n.toLowerCase()));
        byBucket[bucket.key] = sel;
    }
    const sels = Object.values(byBucket);
    return {
        cantrips: uniq(sels.flatMap((s) => s.cantrips)),
        prepared: uniq(sels.flatMap((s) => s.prepared)),
        byBucket
    };
}

export function getSpellcastingAbility(ctx: CharacterCreatorContext): AbilityName | null {
    const infos = getSpellcasterInfos(ctx);
    if (infos.length > 0) {
        const primary = infos.find((i) => i.classId === ctx.state.classId);
        if (primary) return primary.ability;
        return infos[0].ability;
    }
    if (ctx.state.originFeatId === "magic-initiate-wizard") return "int";
    if (ctx.state.originFeatId === "magic-initiate-cleric" || ctx.state.originFeatId === "magic-initiate-druid") return "wis";
    return null;
}

export function getSpellSaveDc(ctx: CharacterCreatorContext, abilityOverride?: AbilityName): number | null {
    const ability = abilityOverride || getSpellcastingAbility(ctx);
    if (!ability) return null;
    return 8 + ctx.getProficiencyBonus() + ctx.getAbilityModifier(ability);
}

export function getSpellAttackModifier(ctx: CharacterCreatorContext, abilityOverride?: AbilityName): number | null {
    const ability = abilityOverride || getSpellcastingAbility(ctx);
    if (!ability) return null;
    return ctx.getProficiencyBonus() + ctx.getAbilityModifier(ability);
}

export function getSpellSlotsSummary(ctx: CharacterCreatorContext): string {
    ctx.syncStateClassProperties();
    const slotsResult = calculateMulticlassSpellSlots(ctx.state.classes, ctx.classes);
    const parts: string[] = [];

    const standardPairs: string[] = [];
    slotsResult.standardSlots.forEach((c, idx) => {
        if (c > 0) standardPairs.push(`${c} × Lvl ${idx + 1}`);
    });

    if (standardPairs.length > 0) {
        parts.push(standardPairs.join(", "));
    }

    if (slotsResult.pactSlotCount > 0) {
        parts.push(`${slotsResult.pactSlotCount} × Lvl ${slotsResult.pactSlotLevel} (Pact Magic)`);
    }

    if (parts.length === 0 && ctx.state.originFeatId.startsWith("magic-initiate")) {
        return "1 × Lvl 1 (1/Long Rest from Feat)";
    }

    return parts.join("; ") || "None";
}

export function getSpellcasterStatsList(ctx: CharacterCreatorContext): Array<{
    classId: string;
    className: string;
    level: number;
    ability: AbilityName;
    abilityMod: number;
    saveDc: number;
    attackMod: number;
    maxCantrips: number;
    maxPrepared: number;
    maxSpellLevel: number;
}> {
    const infos = getSpellcasterInfos(ctx);
    return infos.map((info) => {
        const mod = ctx.getAbilityModifier(info.ability);
        return {
            classId: info.classId,
            className: info.className,
            level: info.level,
            ability: info.ability,
            abilityMod: mod,
            saveDc: 8 + ctx.getProficiencyBonus() + mod,
            attackMod: ctx.getProficiencyBonus() + mod,
            maxCantrips: info.maxCantrips,
            maxPrepared: info.maxPrepared,
            maxSpellLevel: info.maxSpellLevel
        };
    });
}
