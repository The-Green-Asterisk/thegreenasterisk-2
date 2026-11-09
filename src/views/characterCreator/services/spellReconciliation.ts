import {
    AbilityName,
    CLASS_SPELL_PRIORITIES,
    CLASSES_2024,
    ClassDefinition,
    MulticlassCasterClassInfo,
    RuleSpellDefinition,
    SPELLS_2024,
    calculateMulticlassSpellSlots,
    getMulticlassCasterInfo
} from "../../../rules/dnd5e_2024";
import { FeatureSpellChoiceSection } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

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

    const cantrips = SPELLS_2024.filter((sp) => {
        if (sp.level !== 0) return false;
        return sp.classes.some((c) => cantripClasses.includes(c));
    });

    const leveledSpells = SPELLS_2024.filter((sp) => {
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

    // 1. Warlock — Pact of the Tome (3 cantrips from any class + 2 Level 1 Ritual spells from any class)
    if (getClassLevel("warlock") >= 1 && Array.isArray(ctx.state.invocations) && ctx.state.invocations.includes("pact-of-the-tome")) {
        sections.push({
            id: "pact-of-the-tome-cantrips",
            title: "Pact of the Tome: Book of Shadows — Cantrips",
            sourceLabel: "Warlock / Pact of the Tome",
            description: "While the Book of Shadows is on your person, you have three chosen cantrips prepared from any class's spell list, and they function as Warlock spells for you.",
            chooseCount: 3,
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 0),
            ability: "cha"
        });
        const currentTomeRitualNames = new Set(ctx.state.featureSpellChoices?.["pact-of-the-tome-rituals"] || []);
        const availableRituals = SPELLS_2024.filter((sp) =>
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 0 && sp.classes.includes("Cleric")),
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 0 && sp.classes.includes("Druid")),
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 0 && sp.classes.includes("Cleric")),
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 0 && sp.classes.includes("Druid")),
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level <= bardMaxSpellLvl && sp.classes.some((c) => c === "Cleric" || c === "Druid" || c === "Wizard")),
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
                availableSpells: SPELLS_2024.filter((sp) => sp.level === tier.spellLvl && sp.classes.includes("Warlock")),
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 1 && sp.classes.includes("Wizard")),
            ability: "int"
        });
        sections.push({
            id: "wizard-18-spell-mastery-2",
            title: "Spell Mastery — Level 2 Wizard Spell",
            sourceLabel: "Wizard / Spell Mastery",
            description: "Choose one Level 2 Wizard spell that has a casting time of an action. You always have it prepared and can cast it at its lowest level without expending a spell slot.",
            chooseCount: 1,
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 2 && sp.classes.includes("Wizard")),
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
            availableSpells: SPELLS_2024.filter((sp) => sp.level === 3 && sp.classes.includes("Wizard")),
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
                        ? SPELLS_2024.filter((sp) => optNames.has(sp.name.toLowerCase()) || optNames.has(sp.id.toLowerCase()))
                        : SPELLS_2024;
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
        return;
    }
    const available = getAvailableSpells(ctx);
    const validCantripNames = new Set(available.cantrips.map((c) => c.name));
    const validLeveledNames = new Set(available.leveledSpells.map((s) => s.name));

    ctx.state.selectedCantrips = ctx.state.selectedCantrips.filter((s) => validCantripNames.has(s));
    ctx.state.selectedSpellsLevel1 = ctx.state.selectedSpellsLevel1.filter((s) => validLeveledNames.has(s));
}

export function getSmartAutoFillSpells(ctx: CharacterCreatorContext): { cantrips: string[]; prepared: string[] } {
    const available = getAvailableSpells(ctx);
    const maxCantrips = getMaxCantrips(ctx);
    const maxPrepared = getMaxPreparedSpells(ctx);
    const maxLevel = getMaxSpellLevel(ctx);

    const infos = getSpellcasterInfos(ctx);
    const activeClassKeys = infos.map((i) => i.type === "third" ? "wizard" : i.classId.toLowerCase());
    if (activeClassKeys.length === 0) {
        activeClassKeys.push((ctx.state.classId || "wizard").toLowerCase());
    }

    const combinedPriorities = {
        cantrips: [] as string[],
        leveled: [] as string[]
    };
    for (const ck of activeClassKeys) {
        const p = CLASS_SPELL_PRIORITIES[ck];
        if (p) {
            p.cantrips.forEach((name) => {
                if (!combinedPriorities.cantrips.includes(name)) combinedPriorities.cantrips.push(name);
            });
            p.leveled.forEach((name) => {
                if (!combinedPriorities.leveled.includes(name)) combinedPriorities.leveled.push(name);
            });
        }
    }

    // 1. Smart Cantrips: rank by class priorities, then alphabetical
    const cantripRank = (sp: RuleSpellDefinition) => {
        const idx = combinedPriorities.cantrips.indexOf(sp.name);
        return idx >= 0 ? idx : 999;
    };
    const sortedCantrips = [...available.cantrips].sort((a, b) => {
        const rA = cantripRank(a);
        const rB = cantripRank(b);
        if (rA !== rB) return rA - rB;
        return a.name.localeCompare(b.name);
    });
    const selectedCantrips = sortedCantrips.slice(0, maxCantrips).map((c) => c.name);

    // 2. Smart Prepared Spells: ensure coverage across available spell levels, prioritizing staples
    const leveledRank = (sp: RuleSpellDefinition) => {
        const idx = combinedPriorities.leveled.indexOf(sp.name);
        return idx >= 0 ? idx : 999;
    };

    // Group available leveled spells by level
    const byLevel: Record<number, RuleSpellDefinition[]> = {};
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
        byLevel[lvl] = available.leveledSpells
            .filter((s) => s.level === lvl)
            .sort((a, b) => {
                const rA = leveledRank(a);
                const rB = leveledRank(b);
                if (rA !== rB) return rA - rB;
                return a.name.localeCompare(b.name);
            });
    }

    const selectedPreparedSet = new Set<string>();

    if (maxLevel <= 1) {
        // Level 1 only: take top priorities
        const topLvl1 = (byLevel[1] || []).slice(0, maxPrepared);
        topLvl1.forEach((s) => selectedPreparedSet.add(s.name));
    } else {
        // Multi-level: distribute across levels from maxLevel down to 1
        for (let lvl = maxLevel; lvl >= 1; lvl--) {
            const spellsAtLvl = byLevel[lvl] || [];
            const quota = lvl === maxLevel ? 2 : 1;
            for (let i = 0; i < Math.min(quota, spellsAtLvl.length); i++) {
                if (selectedPreparedSet.size < maxPrepared) {
                    selectedPreparedSet.add(spellsAtLvl[i].name);
                }
            }
        }

        // Pass 2: Round-robin fill starting from highest levels down to 1
        let addedInPass = true;
        while (selectedPreparedSet.size < maxPrepared && addedInPass) {
            addedInPass = false;
            for (let lvl = maxLevel; lvl >= 1; lvl--) {
                const spellsAtLvl = byLevel[lvl] || [];
                for (const s of spellsAtLvl) {
                    if (!selectedPreparedSet.has(s.name) && selectedPreparedSet.size < maxPrepared) {
                        selectedPreparedSet.add(s.name);
                        addedInPass = true;
                        break;
                    }
                }
                if (selectedPreparedSet.size >= maxPrepared) break;
            }
        }
    }

    // If still under maxPrepared, fill with any remaining available spells
    if (selectedPreparedSet.size < maxPrepared) {
        const allSorted = [...available.leveledSpells].sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            const rA = leveledRank(a);
            const rB = leveledRank(b);
            if (rA !== rB) return rA - rB;
            return a.name.localeCompare(b.name);
        });
        for (const s of allSorted) {
            if (!selectedPreparedSet.has(s.name) && selectedPreparedSet.size < maxPrepared) {
                selectedPreparedSet.add(s.name);
            }
        }
    }

    return {
        cantrips: selectedCantrips,
        prepared: Array.from(selectedPreparedSet)
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
