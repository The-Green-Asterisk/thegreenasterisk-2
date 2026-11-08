import { CharacterData } from "../../views/characterSheet/characterData";
import { AbilityName, StatModifier } from "./types";

export function applyStatModifier(character: CharacterData, mod: StatModifier, sign: 1 | -1): void {
    if (!character || !mod) return;

    const target = mod.target;
    const type = mod.type;
    const numVal = typeof mod.value === "number" ? mod.value : Number(mod.value) || 0;

    // AC
    if (target === "vitals.ac" || target === "vitals.armorClass") {
        character.vitals.armorClass = (character.vitals.armorClass || 10) + sign * (numVal || 1);
    }
    // Max HP
    else if (target === "vitals.maxHp") {
        const hpDelta = sign * (numVal || 1);
        character.vitals.maxHp = Math.max(1, (character.vitals.maxHp || 10) + hpDelta);
        character.vitals.currentHp = Math.max(0, Math.min(character.vitals.maxHp, (character.vitals.currentHp || character.vitals.maxHp) + hpDelta));
    }
    // Speed
    else if (target === "vitals.speed") {
        const currentSpeedMatch = String(character.vitals.speed || "30 ft.").match(/\d+/);
        const currentSpeed = currentSpeedMatch ? parseInt(currentSpeedMatch[0], 10) : 30;
        const newSpeed = Math.max(0, currentSpeed + sign * numVal);
        character.vitals.speed = `${newSpeed} ft.`;
    }
    // Initiative
    else if (target === "vitals.initiative") {
        if (type === "bonus") {
            character.vitals.initiative = (character.vitals.initiative || 0) + sign * numVal;
        } else if (type === "advantage") {
            const note = "Initiative (Advantage)";
            const notes = character.savingThrowNotes || (character.savingThrowNotes = []);
            if (sign === 1 && !notes.includes(note)) {
                notes.push(note);
            } else if (sign === -1) {
                const idx = notes.indexOf(note);
                if (idx !== -1) notes.splice(idx, 1);
            }
        }
    }
    // Blindsight
    else if (target === "vitals.blindsight") {
        if (sign === 1) {
            character.vitals.blindsight = String(mod.value || "10 ft.");
        } else {
            character.vitals.blindsight = "None";
        }
    }
    // Darkvision
    else if (target === "vitals.darkvision") {
        if (sign === 1) {
            const cur = parseInt(String(character.vitals.darkvision || "0 ft.").match(/\d+/)?.[0] || "0", 10);
            const added = numVal || 60;
            character.vitals.darkvision = `${Math.max(cur, added)} ft.`;
        }
    }
    // Abilities
    else if (target.startsWith("abilities.")) {
        const abilityKey = target.split(".")[1]?.toLowerCase();
        const ability = character.abilities.find(a => a.abbr.toLowerCase() === abilityKey || a.name.toLowerCase() === abilityKey);
        if (ability) {
            ability.score += sign * (numVal || 1);
            ability.modifier = Math.floor((ability.score - 10) / 2);
            ability.save = ability.modifier + (ability.proficientSave ? (character.vitals.proficiencyBonus || 2) : 0);
        }
    }
    // Saving Throws
    else if (target.startsWith("saves.")) {
        const saveKey = target.split(".")[1]?.toLowerCase();
        if (saveKey === "all") {
            if (type === "ability_mod" && mod.abilitySource) {
                const srcMod = character.abilities.find(a => a.abbr.toLowerCase() === mod.abilitySource?.toLowerCase())?.modifier || 0;
                character.abilities.forEach(a => {
                    a.save += sign * srcMod;
                });
            }
        } else {
            const ability = character.abilities.find(a => a.abbr.toLowerCase() === saveKey);
            if (ability) {
                if (type === "proficiency_tier") {
                    ability.proficientSave = sign === 1;
                    ability.save = ability.modifier + (ability.proficientSave ? (character.vitals.proficiencyBonus || 2) : 0);
                } else if (type === "bonus") {
                    ability.save += sign * numVal;
                }
            }
        }
    }
    // Skills
    else if (target.startsWith("skills.")) {
        const skillKey = target.split(".")[1]?.toLowerCase().replace(/-/g, " ");
        const skill = character.skills.find(s => s.name.toLowerCase() === skillKey || s.name.toLowerCase().replace(/-/g, " ") === skillKey);
        if (skill) {
            const pb = character.vitals.proficiencyBonus || 2;
            if (type === "proficiency_tier") {
                if (sign === 1) {
                    skill.proficiency = mod.value === "expertise" ? "expertise" : "proficient";
                } else {
                    skill.proficiency = "none";
                }
                const statObj = character.abilities.find(a => a.abbr.toUpperCase() === skill.stat.toUpperCase());
                const statMod = statObj ? statObj.modifier : 0;
                const mult = skill.proficiency === "expertise" ? 2 : skill.proficiency === "proficient" ? 1 : 0;
                skill.bonus = statMod + mult * pb;
            } else if (type === "ability_mod" && mod.abilitySource) {
                const srcMod = character.abilities.find(a => a.abbr.toLowerCase() === mod.abilitySource?.toLowerCase())?.modifier || 0;
                skill.bonus += sign * srcMod;
            } else if (type === "bonus") {
                skill.bonus += sign * numVal;
            }
        }
    }
    // Damage Resistance
    else if (target === "defenses.resistance") {
        const resType = String(mod.value || "").trim();
        if (resType) {
            const label = `${resType.charAt(0).toUpperCase() + resType.slice(1)} (Resistance)`;
            const resistances = character.vitals.damageResistances || (character.vitals.damageResistances = []);
            if (sign === 1 && !resistances.includes(label)) {
                resistances.push(label);
            } else if (sign === -1) {
                const idx = resistances.indexOf(label);
                if (idx !== -1) resistances.splice(idx, 1);
            }
        }
    }
    // Proficiencies: Armor & Weapons
    else if (target.startsWith("proficiencies.armor")) {
        const armorType = target.split(".")[2] || String(mod.value || "");
        if (armorType && (character as any).proficiencies) {
            const curArmor = (character as any).proficiencies.armor || ((character as any).proficiencies.armor = []);
            const label = armorType.charAt(0).toUpperCase() + armorType.slice(1) + " Armor";
            if (sign === 1 && !curArmor.includes(label)) {
                curArmor.push(label);
            } else if (sign === -1) {
                const idx = curArmor.indexOf(label);
                if (idx !== -1) curArmor.splice(idx, 1);
            }
        }
    } else if (target.startsWith("proficiencies.weapons")) {
        const wepType = target.split(".")[2] || String(mod.value || "");
        if (wepType && (character as any).proficiencies) {
            const curWeps = (character as any).proficiencies.weapons || ((character as any).proficiencies.weapons = []);
            const label = wepType.charAt(0).toUpperCase() + wepType.slice(1) + " Weapons";
            if (sign === 1 && !curWeps.includes(label)) {
                curWeps.push(label);
            } else if (sign === -1) {
                const idx = curWeps.indexOf(label);
                if (idx !== -1) curWeps.splice(idx, 1);
            }
        }
    }
    // Grant Spell
    else if (type === "grant_spell" || target === "spells.grant" || target === "spells.alwaysPrepared" || target === "spells.atWill") {
        const spellName = String(mod.value || "").trim();
        if (spellName) {
            if (!Array.isArray(character.spells)) {
                character.spells = [];
            }
            if (sign === 1) {
                if (!character.spells.some(s => s.name.toLowerCase() === spellName.toLowerCase())) {
                    character.spells.push({
                        id: `granted-${spellName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                        name: spellName,
                        level: typeof mod.condition === "number" ? mod.condition : 0,
                        school: "Evocation",
                        source: mod.description || "Class Feature",
                        castingTime: "1 Action",
                        range: "Self",
                        duration: "Instantaneous",
                        components: "V, S",
                        concentration: false,
                        ritual: false,
                        description: mod.description || `Granted by progression.`
                    });
                }
            } else {
                const idx = character.spells.findIndex(
                    s => s.name.toLowerCase() === spellName.toLowerCase() && String(s.id || "").startsWith("granted-")
                );
                if (idx !== -1) {
                    character.spells.splice(idx, 1);
                }
            }
        }
    }
    // Grant Feature
    else if (type === "grant_feature" || target === "features.grant") {
        const featName = String(mod.value || "").trim();
        if (featName) {
            if (!Array.isArray(character.features)) {
                character.features = [];
            }
            if (sign === 1) {
                if (!character.features.some(f => f.name.toLowerCase() === featName.toLowerCase())) {
                    character.features.push({
                        name: featName,
                        source: mod.description || "Class",
                        type: "Class",
                        description: mod.description || `Granted by progression.`
                    });
                }
            } else {
                const idx = character.features.findIndex(f => f.name.toLowerCase() === featName.toLowerCase());
                if (idx !== -1) {
                    character.features.splice(idx, 1);
                }
            }
        }
    }
}

export function applyProgressionChoiceOption(
    character: CharacterData,
    option: {
        id: string;
        name: string;
        description: string;
        modifiers?: StatModifier[];
        grantedSpells?: Array<any>;
        grantedFeatures?: Array<any>;
    },
    sign: 1 | -1
): void {
    if (!character || !option) return;

    if (Array.isArray(option.modifiers)) {
        for (const mod of option.modifiers) {
            applyStatModifier(character, mod, sign);
        }
    }

    if (Array.isArray(option.grantedSpells)) {
        if (!Array.isArray(character.spells)) character.spells = [];
        for (const sp of option.grantedSpells) {
            const spellName = typeof sp === "string" ? sp : sp.name;
            const spellLvl = typeof sp === "string" ? 0 : (sp.level ?? 0);
            if (!spellName) continue;
            if (sign === 1) {
                if (!character.spells.some(s => s.name.toLowerCase() === spellName.toLowerCase())) {
                    character.spells.push({
                        id: `prog-${option.id}-${spellName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                        name: spellName,
                        level: spellLvl,
                        school: "Evocation",
                        source: (typeof sp === "object" && sp.source) || option.name,
                        castingTime: "1 Action",
                        range: "Self",
                        duration: "Instantaneous",
                        components: "V, S",
                        concentration: false,
                        ritual: false,
                        description: (typeof sp === "object" && (sp.notes || sp.description)) || `Granted by ${option.name}.`
                    });
                }
            } else {
                const idx = character.spells.findIndex(
                    s => s.name.toLowerCase() === spellName.toLowerCase() && String(s.id || "").startsWith(`prog-${option.id}-`)
                );
                if (idx !== -1) {
                    character.spells.splice(idx, 1);
                }
            }
        }
    }

    if (Array.isArray(option.grantedFeatures)) {
        if (!Array.isArray(character.features)) character.features = [];
        for (const gf of option.grantedFeatures) {
            const featName = typeof gf === "string" ? gf : gf.name;
            const featDesc = typeof gf === "string" ? "" : gf.description;
            const featType = typeof gf === "string" ? "Class" : (gf.type || "Class");
            const featSource = typeof gf === "string" ? option.name : (gf.source || option.name);
            if (!featName) continue;
            if (sign === 1) {
                if (!character.features.some(f => f.name.toLowerCase() === featName.toLowerCase())) {
                    character.features.push({
                        name: featName,
                        source: featSource,
                        type: featType,
                        description: featDesc || `Granted by ${option.name}.`
                    });
                }
            } else {
                const idx = character.features.findIndex(f => f.name.toLowerCase() === featName.toLowerCase());
                if (idx !== -1) {
                    character.features.splice(idx, 1);
                }
            }
        }
    }
}

export function applyProgressionFeature(
    character: CharacterData,
    feature: {
        id: string;
        name: string;
        description: string;
        modifiers?: StatModifier[];
        grantedSpells?: Array<any>;
        grantedFeatures?: Array<any>;
    },
    sign: 1 | -1
): void {
    applyProgressionChoiceOption(character, feature, sign);
}
