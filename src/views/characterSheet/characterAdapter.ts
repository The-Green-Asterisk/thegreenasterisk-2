import {
    AbilityScore,
    ActionItem,
    CharacterData,
    ClassResource,
    EquipmentItem,
    FeatureItem,
    SkillItem,
    SpellDefinition,
    WeaponItem
} from "./characterData";

const ABILITY_NAMES: Record<number, { name: string; abbr: string; key: string }> = {
    1: { name: "Strength", abbr: "STR", key: "strength" },
    2: { name: "Dexterity", abbr: "DEX", key: "dexterity" },
    3: { name: "Constitution", abbr: "CON", key: "constitution" },
    4: { name: "Intelligence", abbr: "INT", key: "intelligence" },
    5: { name: "Wisdom", abbr: "WIS", key: "wisdom" },
    6: { name: "Charisma", abbr: "CHA", key: "charisma" }
};

const SKILL_DEFINITIONS: Array<{ name: string; stat: string; key: string }> = [
    { name: "Acrobatics", stat: "DEX", key: "acrobatics" },
    { name: "Animal Handling", stat: "WIS", key: "animal-handling" },
    { name: "Arcana", stat: "INT", key: "arcana" },
    { name: "Athletics", stat: "STR", key: "athletics" },
    { name: "Deception", stat: "CHA", key: "deception" },
    { name: "History", stat: "INT", key: "history" },
    { name: "Insight", stat: "WIS", key: "insight" },
    { name: "Intimidation", stat: "CHA", key: "intimidation" },
    { name: "Investigation", stat: "INT", key: "investigation" },
    { name: "Medicine", stat: "WIS", key: "medicine" },
    { name: "Nature", stat: "INT", key: "nature" },
    { name: "Perception", stat: "WIS", key: "perception" },
    { name: "Performance", stat: "CHA", key: "performance" },
    { name: "Persuasion", stat: "CHA", key: "persuasion" },
    { name: "Religion", stat: "INT", key: "religion" },
    { name: "Sleight of Hand", stat: "DEX", key: "sleight-of-hand" },
    { name: "Stealth", stat: "DEX", key: "stealth" },
    { name: "Survival", stat: "WIS", key: "survival" }
];

const SCHOOL_MAP: Record<string, string> = {
    1: "Abjuration",
    2: "Conjuration",
    3: "Divination",
    4: "Enchantment",
    5: "Evocation",
    6: "Illusion",
    7: "Necromancy",
    8: "Transmutation"
};

const ACTIVATION_MAP: Record<number, string> = {
    1: "1 Action",
    3: "1 Bonus Action",
    4: "1 Reaction",
    6: "1 Minute",
    7: "10 Minutes",
    8: "1 Hour",
    11: "Special"
};

const ALIGNMENT_NAMES: Record<number, string> = {
    1: "Lawful Good",
    2: "Neutral Good",
    3: "Chaotic Good",
    4: "Lawful Neutral",
    5: "True Neutral",
    6: "Chaotic Neutral",
    7: "Lawful Evil",
    8: "Neutral Evil",
    9: "Chaotic Evil"
};

export function parseDndBeyondCharacter(payload: any, originalUrlOrId?: string): CharacterData {
    const raw = payload?.data || payload;
    if (!raw || !raw.name) {
        throw new Error("Invalid character data received from D&D Beyond.");
    }

    // 1. Calculate Total Level & Classes
    const classes = (raw.classes || []).map((c: any) => ({
        name: c.definition?.name || "Adventurer",
        level: Number(c.level) || 1,
        subclass: c.subclassDefinition?.name || undefined
    }));
    const totalLevel = classes.reduce((sum: number, c: any) => sum + c.level, 0) || 1;
    const profBonus = Math.floor((totalLevel - 1) / 4) + 2;

    // 2. Modifiers Flattening
    const allMods: any[] = [];
    if (raw.modifiers) {
        for (const key of Object.keys(raw.modifiers)) {
            const list = raw.modifiers[key];
            if (Array.isArray(list)) allMods.push(...list);
        }
    }

    // 3. Ability Scores
    const statsArray = raw.stats || [];
    const bonusStats = raw.bonusStats || [];
    const overrideStats = raw.overrideStats || [];

    const abilityScoresMap: Record<number, number> = {};
    for (let id = 1; id <= 6; id++) {
        const base = statsArray.find((s: any) => s.id === id)?.value || 10;
        const bonus = bonusStats.find((s: any) => s.id === id)?.value || 0;
        const override = overrideStats.find((s: any) => s.id === id)?.value;

        // Sum modifier bonuses for this stat
        const statKey = ABILITY_NAMES[id]?.key;
        const modBonuses = allMods
            .filter(m => m.type === "bonus" && (m.subType === `${statKey}-score`))
            .reduce((sum, m) => sum + (Number(m.value) || 0), 0);

        abilityScoresMap[id] = override !== null && override !== undefined ? override : (base + bonus + modBonuses);
    }

    // Saving throws proficiency check (from class or feats)
    // Primary class grants saving throws
    const primaryClass = raw.classes?.[0];
    const primaryClassSaves = primaryClass?.definition?.classFeatures
        ?.filter((f: any) => f.name?.toLowerCase().includes("saving throw")) || [];

    const proficientSaveKeys = new Set<string>();
    allMods.forEach(m => {
        if (m.type === "proficiency" && m.subType?.endsWith("-saving-throws")) {
            proficientSaveKeys.add(m.subType.replace("-saving-throws", ""));
        }
    });

    const abilities: AbilityScore[] = [];
    for (let id = 1; id <= 6; id++) {
        const meta = ABILITY_NAMES[id];
        const score = abilityScoresMap[id];
        const modifier = Math.floor((score - 10) / 2);
        const isProf = proficientSaveKeys.has(meta.key);
        const save = modifier + (isProf ? profBonus : 0);

        let notes: string | undefined = undefined;
        if (meta.abbr === "CON" && allMods.some(m => m.friendlySubtypeName?.includes("Concentration") || m.subType?.includes("concentration"))) {
            notes = "Advantage on Concentration";
        }

        abilities.push({
            name: meta.name,
            abbr: meta.abbr,
            score,
            modifier,
            save,
            proficientSave: isProf,
            notes
        });
    }

    const dexMod = abilities.find(a => a.abbr === "DEX")?.modifier ?? 0;
    const conMod = abilities.find(a => a.abbr === "CON")?.modifier ?? 0;
    const wisMod = abilities.find(a => a.abbr === "WIS")?.modifier ?? 0;
    const intMod = abilities.find(a => a.abbr === "INT")?.modifier ?? 0;
    const chaMod = abilities.find(a => a.abbr === "CHA")?.modifier ?? 0;

    // 4. Hit Points
    const baseHp = Number(raw.baseHitPoints) || 10;
    const bonusHp = Number(raw.bonusHitPoints) || 0;
    const overrideHp = Number(raw.overrideHitPoints);
    const removedHp = Number(raw.removedHitPoints) || 0;
    const tempHp = Number(raw.temporaryHitPoints) || 0;

    // In D&D Beyond baseHitPoints doesn't include CON modifier for each level in the raw field
    const calculatedMaxHp = overrideHp || (baseHp + (conMod * totalLevel) + bonusHp);
    const currentHp = Math.max(0, calculatedMaxHp - removedHp);

    // Hit Dice string dynamically computed per class
    const hitDiceStr = (raw.classes || []).map((c: any) => {
        const hitDice = c.definition?.hitDice || 8;
        return `${c.level}d${hitDice}${c.definition?.name ? ` (${c.definition.name})` : ''}`;
    }).join(" + ") || `${totalLevel}d8`;

    // 5. Armor Class
    let armorBase = 10;
    let addDexToAc = true;
    let maxDexBonus = Infinity;
    let shieldBonus = 0;

    const inventory = raw.inventory || [];
    const equippedItems = inventory.filter((i: any) => i.equipped);

    equippedItems.forEach((item: any) => {
        const def = item.definition;
        if (!def) return;
        if (def.armorClass) {
            if (def.filterType === "Armor") {
                armorBase = def.armorClass;
                if (def.armorTypeId === 1) { // Light
                    addDexToAc = true;
                    maxDexBonus = Infinity;
                } else if (def.armorTypeId === 2) { // Medium
                    addDexToAc = true;
                    maxDexBonus = 2;
                } else if (def.armorTypeId === 3) { // Heavy
                    addDexToAc = false;
                }
            } else if (def.filterType === "Shield") {
                shieldBonus += def.armorClass;
            }
        }
    });

    const acDex = addDexToAc ? Math.min(dexMod, maxDexBonus) : 0;
    const armorClass = armorBase + acDex + shieldBonus;

    // 6. Speed & Senses
    const walkSpeed = raw.race?.weightSpeeds?.normal?.walk || 30;

    // Detect Devil's Sight (Eldritch Invocation / magical darkness sight)
    const devilsSightMod = allMods.find(m =>
        (m.type === "sense" || m.type === "set-base") &&
        String(m.subType || "").toLowerCase().includes("darkvision") &&
        String(m.restriction || "").toLowerCase().includes("magical")
    );
    const hasDevilsSightFeature =
        !!devilsSightMod ||
        (raw.options?.class || []).some((o: any) => /devil[’']s sight/i.test(o.definition?.name || "")) ||
        allMods.some(m => /devil[’']s sight/i.test(m.friendlySubtypeName || ""));
    const devilsSightSense = hasDevilsSightFeature
        ? (Number(devilsSightMod?.value ?? devilsSightMod?.fixedValue) > 0
            ? `${Number(devilsSightMod?.value ?? devilsSightMod?.fixedValue)} ft.`
            : "120 ft.")
        : undefined;

    // Senses parser supporting "sense" and "set-base" modifiers, custom senses, and racial traits
    const getSenseRange = (senseName: string, fallback = "None") => {
        // 1. Check custom senses from character sheet overrides
        const customMap: Record<string, number> = { blindsight: 1, darkvision: 2, tremorsense: 3, truesight: 4 };
        const customId = customMap[senseName];
        if (customId && Array.isArray(raw.customSenses)) {
            const cs = raw.customSenses.find((s: any) => s.senseId === customId && Number(s.distance) > 0);
            if (cs) return `${cs.distance} ft.`;
        }

        // 2. Modifiers: filter matches by subType or friendlySubtypeName
        const senseMatches = allMods.filter(m =>
            (m.type === "sense" || m.type === "set-base") &&
            (String(m.subType || "").toLowerCase().includes(senseName) || String(m.friendlySubtypeName || "").toLowerCase().includes(senseName))
        );

        if (senseMatches.length > 0) {
            // Check all matching modifiers and take the maximum range (e.g. 120 ft overrides 60 ft)
            let maxRange = 0;
            for (const match of senseMatches) {
                const num = Number(match.value ?? match.fixedValue);
                if (Number.isFinite(num) && num > maxRange) {
                    maxRange = num;
                } else {
                    const text = `${match.snippet || ""} ${match.description || ""}`;
                    const textMatch = text.match(/(\d+)\s*(?:ft|feet)/i);
                    if (textMatch && Number(textMatch[1]) > maxRange) {
                        maxRange = Number(textMatch[1]);
                    }
                }
            }
            if (maxRange > 0) return `${maxRange} ft.`;
            if (senseName === "darkvision") return "60 ft.";
        }

        // 3. Racial traits fallback (e.g. Tiefling, Elf, Dwarf, etc.)
        if (senseName === "darkvision" && raw.race?.racialTraits) {
            const darkvisionTrait = raw.race.racialTraits.find((rt: any) =>
                /darkvision/i.test(rt.definition?.name || "")
            );
            if (darkvisionTrait) {
                const text = `${darkvisionTrait.definition?.snippet || ""} ${darkvisionTrait.definition?.description || ""}`;
                if (text.includes("120")) return "120 ft.";
                return "60 ft.";
            }
        }

        return fallback;
    };
    const darkvisionSense = getSenseRange("darkvision");
    const blindsightSense = getSenseRange("blindsight");
    const tremorsenseSense = getSenseRange("tremorsense");
    const truesightSense = getSenseRange("truesight");

    // 7. Skills
    const proficientSkills = new Set<string>();
    const expertiseSkills = new Set<string>();

    allMods.forEach(m => {
        if (m.type === "proficiency") {
            proficientSkills.add(m.subType);
        } else if (m.type === "expertise") {
            expertiseSkills.add(m.subType);
        }
    });

    const skills: SkillItem[] = SKILL_DEFINITIONS.map(def => {
        const ability = abilities.find(a => a.abbr === def.stat);
        const mod = ability ? ability.modifier : 0;
        let proficiency: "none" | "proficient" | "expertise" = "none";
        let bonus = mod;

        if (expertiseSkills.has(def.key)) {
            proficiency = "expertise";
            bonus += profBonus * 2;
        } else if (proficientSkills.has(def.key)) {
            proficiency = "proficient";
            bonus += profBonus;
        }

        return {
            name: def.name,
            stat: def.stat,
            bonus,
            proficiency
        };
    });

    const perceptionSkill = skills.find(s => s.name === "Perception");
    const investigationSkill = skills.find(s => s.name === "Investigation");
    const insightSkill = skills.find(s => s.name === "Insight");

    const passivePerception = 10 + (perceptionSkill?.bonus ?? wisMod);
    const passiveInvestigation = 10 + (investigationSkill?.bonus ?? intMod);
    const passiveInsight = 10 + (insightSkill?.bonus ?? wisMod);

    // 8. Spellcasting ability and DC
    // Find spellcasting ability of the highest level or primary class
    let spellcastingAbilityId = 6; // default CHA
    for (const cl of raw.classes || []) {
        if (cl.definition?.canCastSpells && cl.definition.spellCastingAbilityId) {
            spellcastingAbilityId = cl.definition.spellCastingAbilityId;
            break;
        }
    }
    const spellAbbr = ABILITY_NAMES[spellcastingAbilityId]?.abbr || "CHA";
    const spellMod = abilities.find(a => a.abbr === spellAbbr)?.modifier || 0;
    const spellSaveDc = 8 + profBonus + spellMod;
    const spellAttackBonus = profBonus + spellMod;

    // 9. Spells Collection
    const spellsMap = new Map<string, SpellDefinition>();

    function addSpell(s: any, sourceName: string) {
        const def = s.definition;
        if (!def || !def.name) return;

        const school = typeof def.school === "string" ? def.school : (SCHOOL_MAP[def.school] || "Universal");
        const activationTime = def.activation?.activationTime || 1;
        const activationType = ACTIVATION_MAP[def.activation?.activationType] || "1 Action";
        const castingTime = def.castingTimeDescription || (def.activation?.activationTime > 1 ? `${def.activation.activationTime} Actions` : activationType);

        let rangeStr = "Self";
        if (def.range) {
            if (def.range.rangeValue) {
                rangeStr = `${def.range.rangeValue} ft.`;
            } else if (def.range.origin) {
                rangeStr = def.range.origin;
            }
        }

        let durationStr = "Instantaneous";
        if (def.duration) {
            if (def.duration.durationInterval) {
                durationStr = `${def.duration.durationInterval} ${def.duration.durationUnit || "Minute"}`;
            } else if (def.duration.durationType) {
                durationStr = def.duration.durationType;
            }
        }
        if (def.concentration && !durationStr.toLowerCase().includes("concentration")) {
            durationStr = `Concentration, up to ${durationStr}`;
        }

        const compList: string[] = [];
        if (Array.isArray(def.components)) {
            if (def.components.includes(1)) compList.push("V");
            if (def.components.includes(2)) compList.push("S");
            if (def.components.includes(3)) {
                compList.push(def.componentsDescription ? `M (${def.componentsDescription})` : "M");
            }
        }
        const componentsStr = compList.join(", ") || "None";

        const spellDef: SpellDefinition = {
            id: def.id,
            name: def.name,
            level: Number(def.level) || 0,
            school,
            source: sourceName,
            castingTime,
            range: rangeStr,
            duration: durationStr,
            components: componentsStr,
            concentration: !!def.concentration,
            ritual: !!def.ritual,
            description: def.description || def.snippet || "<p>No description provided.</p>",
            imageUrl: def.avatarUrl || def.largeAvatarUrl || undefined
        };

        spellsMap.set(def.name.toLowerCase(), spellDef);
    }

    if (raw.classSpells) {
        raw.classSpells.forEach((cs: any) => {
            const classObj = raw.classes?.find((c: any) => c.id === cs.characterClassId);
            const className = classObj?.definition?.name || "Class";
            (cs.spells || []).forEach((s: any) => addSpell(s, className));
        });
    }

    ["race", "class", "background", "item", "feat"].forEach(key => {
        (raw.spells?.[key] || []).forEach((s: any) => {
            const source = key.charAt(0).toUpperCase() + key.slice(1);
            addSpell(s, source);
        });
    });

    const spellsList = Array.from(spellsMap.values()).sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    // 10. Actions & Attacks
    const actions: ActionItem[] = [];

    // Cantrip attack actions (like Eldritch Blast, Fire Bolt, etc.)
    spellsList.forEach(spell => {
        if (spell.level === 0) {
            let hitOrDc = `+${spellAttackBonus} to hit`;
            if (spell.description.includes("saving throw")) {
                hitOrDc = `DC ${spellSaveDc} Save`;
            }
            actions.push({
                name: spell.name,
                type: spell.castingTime.toLowerCase().includes("bonus") ? "Bonus Action" : (spell.castingTime.toLowerCase().includes("reaction") ? "Reaction" : "Action"),
                rangeOrReach: spell.range,
                hitOrDc,
                damageOrEffect: "Spell Effect",
                notes: `${spell.school} cantrip. Click to view full details.`,
                spellName: spell.name
            });
        }
    });

    // Weapon attacks
    equippedItems.forEach((item: any) => {
        const def = item.definition;
        if (def && def.filterType === "Weapon") {
            const isFinesse = def.properties?.some((p: any) => p.name?.toLowerCase() === "finesse");
            const atkMod = isFinesse ? Math.max(dexMod, abilities[0].modifier) : abilities[0].modifier;
            const hitBonus = profBonus + atkMod;
            const hitStr = hitBonus >= 0 ? `+${hitBonus} to hit` : `${hitBonus} to hit`;
            const dmgDie = def.damage?.diceString || "1d4";
            const dmgType = def.damageType || "Physical";
            const dmgBonus = atkMod >= 0 ? `+ ${atkMod}` : `- ${Math.abs(atkMod)}`;

            actions.push({
                name: def.name,
                type: "Action",
                rangeOrReach: def.range ? `${def.range} ft.` : "Reach 5 ft.",
                hitOrDc: hitStr,
                damageOrEffect: `${dmgDie} ${dmgBonus} ${dmgType}`,
                notes: def.properties?.map((p: any) => p.name).join(", ") || "Weapon"
            });
        }
    });

    // Class specific actions
    const classActions = raw.actions?.class || [];
    classActions.forEach((a: any) => {
        const type: "Action" | "Bonus Action" | "Reaction" | "Special" =
            a.activation?.activationType === 3 ? "Bonus Action" : (a.activation?.activationType === 4 ? "Reaction" : "Action");
        actions.push({
            name: a.name,
            type,
            rangeOrReach: a.range?.rangeValue ? `${a.range.rangeValue} ft.` : "Special",
            hitOrDc: a.saveDcAbilityId ? `DC ${spellSaveDc}` : "Special",
            damageOrEffect: a.snippet || "Class Feature",
            notes: a.description || a.snippet || ""
        });
    });

    // 11. Features & Invocations & Feats
    const features: FeatureItem[] = [];

    (raw.feats || []).forEach((f: any) => {
        if (f.definition?.name) {
            features.push({
                name: f.definition.name,
                source: "Feat",
                type: "Feat",
                description: f.definition.description || f.definition.snippet || ""
            });
        }
    });

    (raw.options?.class || []).forEach((o: any) => {
        if (o.definition?.name) {
            features.push({
                name: o.definition.name,
                source: "Eldritch Invocations",
                type: "Invocation",
                description: o.definition.description || o.definition.snippet || ""
            });
        }
    });

    // Subclass and class traits
    (raw.classes || []).forEach((cl: any) => {
        if (cl.subclassDefinition?.classFeatures) {
            cl.subclassDefinition.classFeatures.forEach((cf: any) => {
                if (cf.requiredLevel <= cl.level) {
                    features.push({
                        name: cf.name,
                        source: cl.subclassDefinition.name,
                        type: "Subclass",
                        description: cf.description || cf.snippet || ""
                    });
                }
            });
        }
    });

    // Species / Race traits
    if (raw.race?.racialTraits) {
        raw.race.racialTraits.forEach((rt: any) => {
            if (rt.definition?.name) {
                features.push({
                    name: rt.definition.name,
                    source: raw.race.fullName || "Species",
                    type: "Species",
                    description: rt.definition.description || rt.definition.snippet || ""
                });
            }
        });
    }

    // 12. Equipment & Weapons
    const equipment: EquipmentItem[] = inventory.map((i: any) => {
        const def = i.definition;
        return {
            id: i.id,
            definitionId: def?.id,
            name: def?.name || "Item",
            quantity: Number(i.quantity) || 1,
            equipped: !!i.equipped,
            attuned: !!i.isAttuned,
            type: def?.filterType || "Gear",
            filterType: def?.filterType || "Gear",
            rarity: def?.rarity || "Common",
            isMagic: !!def?.magic,
            description: def?.description || def?.snippet || undefined,
            imageUrl: def?.largeAvatarUrl || def?.avatarUrl || undefined,
            notes: def?.snippet || def?.description ? (def.snippet || "") : undefined
        };
    });

    // Weapon masteries set
    const masteredWeaponKeys = new Set<string>();
    allMods.forEach(m => {
        if (m.type === "weapon-mastery" && m.subType) {
            masteredWeaponKeys.add(m.subType.toLowerCase());
        }
    });

    // Parse weapons
    const rawWeapons = inventory.filter((i: any) => i.definition?.filterType === "Weapon");
    const aggregatedWeapons = new Map<string, { item: any; count: number; equipped: boolean }>();
    rawWeapons.forEach((w: any) => {
        const wName = w.definition.name;
        if (!aggregatedWeapons.has(wName)) {
            aggregatedWeapons.set(wName, { item: w, count: Number(w.quantity) || 1, equipped: !!w.equipped });
        } else {
            const entry = aggregatedWeapons.get(wName)!;
            entry.count += Number(w.quantity) || 1;
            if (w.equipped) entry.equipped = true;
        }
    });

    const weapons: WeaponItem[] = Array.from(aggregatedWeapons.values()).map(({ item, count, equipped }) => {
        const def = item.definition;
        const props = (def.properties || []).map((p: any) => p.name as string);
        const isFinesse = props.some((p: string) => p.toLowerCase() === "finesse");
        const isRanged = def.attackType === 2; // 1 = Melee, 2 = Ranged

        // Attack modifier: Ranged uses DEX; Finesse uses max(DEX, STR); Melee uses STR
        const strMod = abilities.find(a => a.abbr === "STR")?.modifier ?? 0;
        const atkAbilityMod = isRanged ? dexMod : (isFinesse ? Math.max(dexMod, strMod) : strMod);

        // Check weapon proficiency
        const wTypeLower = (def.type || def.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
        const isProficient = profBonus > 0 && (
            proficientSkills.has("simple-weapons") || // general check
            allMods.some(m => m.type === "proficiency" && (
                m.subType === "simple-weapons" ||
                m.subType === "martial-weapons" ||
                m.subType === wTypeLower ||
                m.subType === (def.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-")
            ))
        );

        const toHitModifier = atkAbilityMod + (isProficient ? profBonus : 0);
        const attackBonus = toHitModifier >= 0 ? `+${toHitModifier}` : `${toHitModifier}`;

        const dmgDie = def.damage?.diceString || "1d4";
        const dmgType = def.damageType || "Piercing";
        const dmgModStr = atkAbilityMod >= 0 ? `+ ${atkAbilityMod}` : `- ${Math.abs(atkAbilityMod)}`;
        const damage = `${dmgDie} ${dmgModStr} ${dmgType}`;

        let rangeStr = "Reach 5 ft.";
        if (def.range) {
            rangeStr = def.longRange && def.longRange !== def.range ? `${def.range}/${def.longRange} ft.` : `${def.range} ft.`;
        }

        // Category label
        const categoryId = def.categoryId;
        let category = categoryId === 1 ? "Simple Weapon" : (categoryId === 2 ? "Martial Weapon" : "Weapon");
        if (isRanged) category += " (Ranged)";
        else category += " (Melee)";

        // Weapon Mastery (2024 rules: Nick, Vex, Sap, Slow, Push, Topple, Cleave, Graze)
        const masteryProp = (def.properties || []).find((p: any) =>
            ["nick", "vex", "sap", "slow", "push", "topple", "cleave", "graze"].includes((p.name || "").toLowerCase())
        );

        let mastery: WeaponItem["mastery"] = undefined;
        if (masteryProp) {
            const mName = masteryProp.name;
            const wSlug = (def.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-");
            const hasMasteryUnlocked = Array.from(masteredWeaponKeys).some(k => k.includes(mName.toLowerCase()) && (k.includes(wSlug) || k.includes(wTypeLower)));
            mastery = {
                name: mName,
                description: masteryProp.description ? masteryProp.description.replace(/<[^>]*>/g, "").trim() : undefined,
                unlocked: hasMasteryUnlocked
            };
        }

        return {
            id: item.id,
            definitionId: def.id,
            name: def.name,
            quantity: count,
            equipped,
            category,
            damage,
            damageType: dmgType,
            damageDie: dmgDie,
            attackBonus,
            toHitModifier,
            range: rangeStr,
            properties: props,
            isMagic: !!def.magic,
            rarity: def.rarity || "Common",
            description: def.description || def.snippet || undefined,
            imageUrl: def.largeAvatarUrl || def.avatarUrl || undefined,
            mastery,
            notes: def.snippet || def.description ? def.snippet : undefined
        };
    });

    // 13. Dynamic Spell Slots calculation across all classes (Levels 1-20, Full/Half/Third/Pact)
    const FULL_CASTER_SLOTS: Record<number, number[]> = {
        1: [2],
        2: [3],
        3: [4, 2],
        4: [4, 3],
        5: [4, 3, 2],
        6: [4, 3, 3],
        7: [4, 3, 3, 1],
        8: [4, 3, 3, 2],
        9: [4, 3, 3, 3, 1],
        10: [4, 3, 3, 3, 2],
        11: [4, 3, 3, 3, 2, 1],
        12: [4, 3, 3, 3, 2, 1],
        13: [4, 3, 3, 3, 2, 1, 1],
        14: [4, 3, 3, 3, 2, 1, 1],
        15: [4, 3, 3, 3, 2, 1, 1, 1],
        16: [4, 3, 3, 3, 2, 1, 1, 1],
        17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
        18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
        19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
        20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
    };

    const PACT_MAGIC_SLOTS: Record<number, { count: number; level: number }> = {
        1: { count: 1, level: 1 },
        2: { count: 2, level: 1 },
        3: { count: 2, level: 2 },
        4: { count: 2, level: 2 },
        5: { count: 2, level: 3 },
        6: { count: 2, level: 3 },
        7: { count: 2, level: 4 },
        8: { count: 2, level: 4 },
        9: { count: 2, level: 5 },
        10: { count: 2, level: 5 },
        11: { count: 3, level: 5 },
        12: { count: 3, level: 5 },
        13: { count: 3, level: 5 },
        14: { count: 3, level: 5 },
        15: { count: 3, level: 5 },
        16: { count: 3, level: 5 },
        17: { count: 4, level: 5 },
        18: { count: 4, level: 5 },
        19: { count: 4, level: 5 },
        20: { count: 4, level: 5 }
    };

    let effectiveCasterLevel = 0;
    let warlockLevel = 0;

    (raw.classes || []).forEach((c: any) => {
        const cName = (c.definition?.name || "").toLowerCase();
        const subName = (c.subclassDefinition?.name || "").toLowerCase();
        const lvl = Number(c.level) || 0;

        if (cName === "warlock") {
            warlockLevel += lvl;
        } else if (["bard", "cleric", "druid", "sorcerer", "wizard"].includes(cName)) {
            effectiveCasterLevel += lvl;
        } else if (["paladin", "ranger"].includes(cName)) {
            effectiveCasterLevel += Math.floor(lvl / 2);
        } else if (cName === "artificer") {
            effectiveCasterLevel += Math.ceil(lvl / 2);
        } else if (subName.includes("eldritch knight") || subName.includes("arcane trickster")) {
            effectiveCasterLevel += Math.floor(lvl / 3);
        }
    });

    const spellSlots: CharacterData["spellSlots"] = {};

    // Standard Spellcasting Slots
    if (effectiveCasterLevel > 0) {
        const boundedLvl = Math.min(20, Math.max(1, effectiveCasterLevel));
        const slotCounts = FULL_CASTER_SLOTS[boundedLvl] || [];
        const ordinals = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
        slotCounts.forEach((total, idx) => {
            if (total > 0) {
                const lvlNum = idx + 1;
                spellSlots[`level${lvlNum}`] = {
                    total,
                    level: lvlNum,
                    label: `${ordinals[idx]} Level`
                };
            }
        });
    }

    // Warlock Pact Magic Slots
    if (warlockLevel > 0) {
        const boundedWarlock = Math.min(20, Math.max(1, warlockLevel));
        const pact = PACT_MAGIC_SLOTS[boundedWarlock] || { count: 2, level: 3 };
        spellSlots.pact = {
            total: pact.count,
            level: pact.level,
            label: `Pact Magic (Lvl ${pact.level})`
        };
    }

    // 14. Class-Specific Resources across all classes
    const classResources: ClassResource[] = [];

    // Check Barbarian Rage
    const barb = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "barbarian");
    if (barb) {
        const bLvl = barb.level || 1;
        const rages = bLvl >= 20 ? 99 : (bLvl >= 17 ? 6 : (bLvl >= 12 ? 5 : (bLvl >= 6 ? 4 : (bLvl >= 3 ? 3 : 2))));
        classResources.push({
            name: "Rage",
            total: rages,
            resetOn: "long",
            dieOrType: bLvl >= 20 ? "Unlimited" : undefined
        });
    }

    // Check Bard Inspiration
    const bard = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "bard");
    if (bard) {
        const bLvl = bard.level || 1;
        const die = bLvl >= 15 ? "d12" : (bLvl >= 10 ? "d10" : (bLvl >= 5 ? "d8" : "d6"));
        classResources.push({
            name: `Bardic Inspiration (${die})`,
            total: Math.max(1, chaMod),
            resetOn: bLvl >= 5 ? "short" : "long",
            dieOrType: die,
            key: "bardic"
        });
    }

    // Check Cleric / Paladin Channel Divinity
    const cleric = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "cleric");
    const paladin = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "paladin");
    if (cleric) {
        const cLvl = cleric.level || 1;
        const uses = cLvl >= 18 ? 3 : (cLvl >= 6 ? 2 : 1);
        classResources.push({
            name: "Channel Divinity",
            total: uses,
            resetOn: "short"
        });
    } else if (paladin && paladin.level >= 3) {
        classResources.push({
            name: "Channel Divinity",
            total: paladin.level >= 11 ? 2 : 1,
            resetOn: "short"
        });
    }

    // Check Druid Wild Shape
    const druid = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "druid");
    if (druid && druid.level >= 2) {
        classResources.push({
            name: "Wild Shape",
            total: druid.level >= 20 ? 99 : 2,
            resetOn: "short"
        });
    }

    // Check Fighter Action Surge & Second Wind
    const fighter = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "fighter");
    if (fighter) {
        const fLvl = fighter.level || 1;
        classResources.push({
            name: "Second Wind",
            total: 1,
            resetOn: "short",
            dieOrType: `1d10+${fLvl}`
        });
        if (fLvl >= 2) {
            classResources.push({
                name: "Action Surge",
                total: fLvl >= 17 ? 2 : 1,
                resetOn: "short"
            });
        }
        if (fLvl >= 9) {
            classResources.push({
                name: "Indomitable",
                total: fLvl >= 17 ? 3 : (fLvl >= 13 ? 2 : 1),
                resetOn: "long"
            });
        }
    }

    // Check Monk Ki / Focus Points
    const monk = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "monk");
    if (monk && monk.level >= 2) {
        classResources.push({
            name: "Ki / Focus Points",
            total: monk.level,
            resetOn: "short"
        });
    }

    // Check Paladin Lay on Hands
    if (paladin) {
        classResources.push({
            name: "Lay on Hands (Pool)",
            total: paladin.level * 5,
            resetOn: "long"
        });
    }

    // Check Sorcerer Sorcery Points
    const sorcerer = (raw.classes || []).find((c: any) => c.definition?.name?.toLowerCase() === "sorcerer");
    if (sorcerer && sorcerer.level >= 2) {
        classResources.push({
            name: "Sorcery Points",
            total: sorcerer.level,
            resetOn: "long"
        });
    }

    const bardicCount = Math.max(1, chaMod);

    const characterId = raw.id || originalUrlOrId;
    const dndBeyondUrl = `https://www.dndbeyond.com/characters/${characterId}`;
    const avatarUrl = raw.decorations?.avatarUrl || "https://www.dndbeyond.com/avatars/10/92/636339382508535391.png";

    const classSubtitle = classes.map((c: any) => `${c.name} ${c.level}${c.subclass ? ` (${c.subclass})` : ''}`).join(' / ');
    const subtitle = `${raw.race?.fullName || 'Adventurer'} • ${classSubtitle} • Level ${totalLevel}`;

    return {
        id: characterId,
        name: raw.name || "Adventurer",
        subtitle,
        level: totalLevel,
        classes,
        race: raw.race?.fullName || "Custom Species",
        background: raw.background?.definition?.name || "Custom Background",
        alignment: ALIGNMENT_NAMES[raw.alignmentId] || "Neutral",
        avatarUrl,
        dndBeyondUrl,
        vitals: {
            currentHp,
            maxHp: calculatedMaxHp,
            tempHp,
            armorClass,
            initiative: dexMod,
            speed: `${walkSpeed} ft.`,
            proficiencyBonus: profBonus,
            passivePerception,
            passiveInvestigation,
            passiveInsight,
            blindsight: blindsightSense,
            darkvision: darkvisionSense,
            tremorsense: tremorsenseSense,
            truesight: truesightSense,
            devilsSight: devilsSightSense,
            hitDice: hitDiceStr,
            heroicInspiration: !!raw.inspiration,
            spellSaveDc,
            spellAttackBonus,
            spellcastingAbility: `${ABILITY_NAMES[spellcastingAbilityId]?.name || 'Charisma'} (+${spellMod})`
        },
        abilities,
        skills,
        spellSlots,
        classResources,
        bardicCount,
        actions,
        features,
        equipment,
        weapons,
        proficiencies: {
            armor: allMods.filter(m => m.type === "proficiency" && m.subType?.includes("armor")).map(m => m.friendlySubtypeName || m.subType),
            weapons: allMods.filter(m => m.type === "proficiency" && m.subType?.includes("weapon")).map(m => m.friendlySubtypeName || m.subType),
            tools: allMods.filter(m => m.type === "proficiency" && m.subType?.includes("tool")).map(m => m.friendlySubtypeName || m.subType),
            languages: allMods.filter(m => m.type === "language").map(m => m.friendlySubtypeName || m.subType)
        },
        spells: spellsList
    };
}
