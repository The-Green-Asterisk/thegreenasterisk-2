import { CharacterData } from "../../views/characterSheet/characterData";
import { findClassOption } from "./classOptions";
import { abilityKey, applySaveEffect, normalizeAgainst, SaveEffect } from "./saveEffects";
import { applySenseGrants, senseGrantsFrom, senseKeyOfTarget } from "./senses";
import { StatModifier } from "./types";

function syncCharacterNote(character: CharacterData, note: string, add: boolean): void {
    if (!character) return;
    if (!Array.isArray(character.savingThrowNotes)) {
        character.savingThrowNotes = [];
    }
    if (!character.vitals) {
        character.vitals = {} as any;
    }
    if (!Array.isArray(character.vitals.savingThrowNotes)) {
        character.vitals.savingThrowNotes = character.savingThrowNotes;
    }

    if (add) {
        if (!character.savingThrowNotes.includes(note)) {
            character.savingThrowNotes.push(note);
        }
        if (!character.vitals.savingThrowNotes.includes(note)) {
            character.vitals.savingThrowNotes.push(note);
        }
    } else {
        const idx = character.savingThrowNotes.indexOf(note);
        if (idx !== -1) {
            character.savingThrowNotes.splice(idx, 1);
        }
        const vIdx = character.vitals.savingThrowNotes.indexOf(note);
        if (vIdx !== -1) {
            character.vitals.savingThrowNotes.splice(vIdx, 1);
        }
    }
}

/** Adds or removes a save effect from a source on the character. */
function syncSaveEffect(character: CharacterData, effect: SaveEffect, add: boolean): void {
    character.saveEffects = applySaveEffect(character.saveEffects, effect, !add);
}

/** Applies (sign 1) or undoes (sign -1) a modifier; `source` names what grants it, for save effects. */
export function applyStatModifier(character: CharacterData, mod: StatModifier, sign: 1 | -1, source?: string): void {
    if (!character || !mod) return;

    const target = mod.target;
    const type = mod.type;
    const numVal = typeof mod.value === "number" ? mod.value : Number(mod.value) || 0;
    const delta = type === "penalty" ? -Math.abs(numVal) : numVal;

    // AC
    if (target === "vitals.ac" || target === "vitals.armorClass") {
        if (mod.requires === "armor") {
            const dexMod = character.abilities?.find(a => a.abbr === "DEX")?.modifier ?? 0;
            const hasExplicitArmor = (character.equipment || []).some(i => {
                if (!i.equipped) return false;
                const type = (i.type || i.filterType || "").toLowerCase();
                const name = (i.name || "").toLowerCase();
                return (type === "armor" || name.includes("armor") || name.includes("mail") || name.includes("plate") || name.includes("leather")) && !name.includes("shield");
            }) || (!!character.creatorState?.armor && character.creatorState.armor !== "none");
            const isArmored = hasExplicitArmor || (!character.equipment?.length && !character.creatorState?.armor && (character.vitals?.armorClass ?? 0) > 10 + dexMod);
            if (!isArmored) return;
        }
        character.vitals.armorClass = (character.vitals.armorClass || 10) + sign * (delta || 1);
    }
    // Max HP
    else if (target === "vitals.maxHp" || target === "vitals.hp") {
        const hpDelta = sign * (delta || 1);
        character.vitals.maxHp = Math.max(1, (character.vitals.maxHp || 10) + hpDelta);
        character.vitals.currentHp = Math.max(0, Math.min(character.vitals.maxHp, (character.vitals.currentHp || character.vitals.maxHp) + hpDelta));
    }
    // Speed
    else if (target === "vitals.speed" || target === "vitals.walkingSpeed") {
        const currentSpeedMatch = String(character.vitals.speed || "30 ft.").match(/\d+/);
        const currentSpeed = currentSpeedMatch ? parseInt(currentSpeedMatch[0], 10) : 30;
        const newSpeed = Math.max(0, currentSpeed + sign * delta);
        const currentParen = String(character.vitals.speed || "").match(/\s*(\([^)]+\))/);
        character.vitals.speed = `${newSpeed} ft.${currentParen ? currentParen[0] : ""}`;
    }
    // Special Speeds: climb, swim, fly, burrow
    else if (
        target === "vitals.climb" || target === "vitals.swim" || target === "vitals.fly" ||
        target === "speeds.fly" || target === "speeds.swim" || target === "speeds.climb" ||
        target === "vitals.burrow" || target === "speeds.burrow"
    ) {
        const kind = target.replace(/^(vitals|speeds)\./, "").toLowerCase();
        const walkSpeedMatch = String(character.vitals.speed || "30 ft.").match(/\d+/);
        const walkSpeed = walkSpeedMatch ? parseInt(walkSpeedMatch[0], 10) : 30;
        const speedVal = (mod.value === "walk" || mod.value === "equal_walk") ? walkSpeed : Number(mod.value) || walkSpeed;
        const label = kind.charAt(0).toUpperCase() + kind.slice(1);
        const speedStr = `${label} ${speedVal} ft.`;
        const currentParen = String(character.vitals.speed || "").match(/\(([^)]+)\)/);
        let specialSpeeds = currentParen ? currentParen[1].split(/,\s*/).map(s => s.trim()).filter(Boolean) : [];
        if (sign === 1) {
            specialSpeeds = specialSpeeds.filter(s => !s.toLowerCase().startsWith(kind));
            specialSpeeds.push(speedStr);
        } else {
            specialSpeeds = specialSpeeds.filter(s => !s.toLowerCase().startsWith(kind));
        }
        const baseWalk = `${walkSpeed} ft.`;
        character.vitals.speed = specialSpeeds.length > 0 ? `${baseWalk} (${specialSpeeds.join(", ")})` : baseWalk;
    }
    // Initiative
    else if (target === "vitals.initiative") {
        if (type === "bonus" || type === "penalty") {
            character.vitals.initiative = (character.vitals.initiative || 0) + sign * delta;
        } else if (type === "advantage" || type === "disadvantage") {
            const note = `Initiative (${type === "advantage" ? "Advantage" : "Disadvantage"})`;
            syncCharacterNote(character, note, sign === 1);
        }
    }
    // Passive Perception / Investigation / Insight
    else if (target === "vitals.passivePerception" || target === "vitals.passiveInsight" || target === "vitals.passiveInvestigation") {
        const prop = target.split(".")[1] as "passivePerception" | "passiveInsight" | "passiveInvestigation";
        if (type === "bonus" || type === "penalty") {
            character.vitals[prop] = (character.vitals[prop] || 10) + sign * delta;
        } else if (type === "advantage") {
            character.vitals[prop] = (character.vitals[prop] || 10) + sign * 5;
        } else if (type === "disadvantage") {
            character.vitals[prop] = (character.vitals[prop] || 10) - sign * 5;
        }
    }
    // Spell Save DC
    else if (target === "vitals.spellSaveDc" || target === "spells.dc") {
        character.vitals.spellSaveDc = (character.vitals.spellSaveDc || 10) + sign * delta;
    }
    // Spell Attack Bonus
    else if (target === "vitals.spellAttackBonus" || target === "spells.attack") {
        character.vitals.spellAttackBonus = (character.vitals.spellAttackBonus || 0) + sign * delta;
    }
    // Special senses (darkvision, blindsight, ..., Devil's Sight, and any senses.<key>), undone exactly by source
    else if (senseKeyOfTarget(target)) {
        applySenseGrants(character, senseGrantsFrom([{ name: source, modifiers: [mod] }]), sign === -1);
    }
    // Abilities
    else if (target.startsWith("abilities.")) {
        const abilityKey = target.split(".")[1]?.toLowerCase();
        const ability = character.abilities.find(a => a.abbr.toLowerCase() === abilityKey || a.name.toLowerCase() === abilityKey);
        if (ability) {
            const oldModifier = ability.modifier;
            ability.score += sign * (delta || 1);
            ability.modifier = Math.floor((ability.score - 10) / 2);
            ability.save = ability.modifier + (ability.proficientSave ? (character.vitals.proficiencyBonus || 2) : 0);

            // Skills with this ability move by the change in modifier and keep their other bonuses (Jack of All
            // Trades, items, features)
            const change = ability.modifier - oldModifier;
            character.skills.forEach(sk => {
                if (sk.stat.toLowerCase() === ability.abbr.toLowerCase()) sk.bonus += change;
            });
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
            } else if (type === "bonus" || type === "penalty") {
                character.abilities.forEach(a => {
                    a.save += sign * delta;
                });
            } else if (type === "advantage" || type === "disadvantage") {
                syncSaveEffect(character, { effect: type, against: normalizeAgainst(mod.condition), sources: source ? [source] : [] }, sign === 1);
            }
        } else {
            const ability = character.abilities.find(a => a.abbr.toLowerCase() === saveKey);
            if (ability) {
                if (type === "proficiency_tier") {
                    ability.proficientSave = sign === 1;
                    ability.save = ability.modifier + (ability.proficientSave ? (character.vitals.proficiencyBonus || 2) : 0);
                } else if (type === "bonus" || type === "penalty") {
                    ability.save += sign * delta;
                } else if (type === "advantage" || type === "disadvantage") {
                    syncSaveEffect(character, {
                        ability: abilityKey(ability.abbr),
                        effect: type,
                        against: normalizeAgainst(mod.condition),
                        sources: source ? [source] : []
                    }, sign === 1);
                }
            }
        }
    }
    // Half proficiency on every check the character isn't proficient in (Jack of All Trades): untrained skills,
    // and the record skills a player adds take their bonus from
    else if (target === "skills.unproficient") {
        if (type === "half_proficiency") {
            const half = sign * Math.floor((character.vitals.proficiencyBonus || 2) / 2);
            character.skills.forEach(sk => {
                if (!sk.proficiency || sk.proficiency === "none") sk.bonus += half;
            });
            if (character.checkExtras) {
                for (const extras of Object.values(character.checkExtras)) {
                    if (extras) extras.untrained += half;
                }
            }
        }
    }
    // Skills (the rules' skills by key, and a player's own by the same kind of slug)
    else if (target.startsWith("skills.")) {
        const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        const skillKey = slug(target.slice("skills.".length));
        const skill = character.skills.find(s => slug(s.name) === skillKey);
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
            } else if (type === "bonus" || type === "penalty") {
                skill.bonus += sign * delta;
            } else if (type === "advantage" || type === "disadvantage") {
                const advText = type === "advantage" ? "Advantage" : "Disadvantage";
                const note = `${advText} on ${skill.name} checks${mod.condition ? ` (${mod.condition})` : ""}`;
                syncCharacterNote(character, note, sign === 1);

                // Advantage/Disadvantage modifies passive checks by +/- 5
                const passiveDelta = (type === "advantage" ? 5 : -5) * sign;
                if (skill.name.toLowerCase() === "perception" && character.vitals.passivePerception !== undefined) {
                    character.vitals.passivePerception += passiveDelta;
                } else if (skill.name.toLowerCase() === "insight" && character.vitals.passiveInsight !== undefined) {
                    character.vitals.passiveInsight += passiveDelta;
                } else if (skill.name.toLowerCase() === "investigation" && character.vitals.passiveInvestigation !== undefined) {
                    character.vitals.passiveInvestigation += passiveDelta;
                }
            }
        }
    }
    // Great Weapon Fighting damage floor
    else if (target === "attacks.two_handed_damage_floor") {
        const note = "GWF (min 3 on damage dice)";
        if (Array.isArray(character.weapons)) {
            character.weapons.forEach(w => {
                const isTwoHanded = Array.isArray(w.properties) && w.properties.some((p: string) => p.toLowerCase().includes("two-handed"));
                if (isTwoHanded) {
                    if (sign === 1 && !w.properties.includes(note)) {
                        w.properties.push(note);
                    } else if (sign === -1) {
                        const idx = w.properties.indexOf(note);
                        if (idx !== -1) w.properties.splice(idx, 1);
                    }
                }
            });
        }
        syncCharacterNote(character, "Great Weapon Fighting: damage die roll of 1 or 2 is treated as a 3 on two-handed melee weapons", sign === 1);
    }
    // Two-Weapon Fighting off-hand damage
    else if (target === "damage.offhand_ability_mod") {
        const note = "TWF (adds ability mod to off-hand damage)";
        if (Array.isArray(character.weapons)) {
            character.weapons.forEach(w => {
                const isLight = Array.isArray(w.properties) && w.properties.some((p: string) => p.toLowerCase().includes("light"));
                if (isLight) {
                    if (sign === 1 && !w.properties.includes(note)) {
                        w.properties.push(note);
                    } else if (sign === -1) {
                        const idx = w.properties.indexOf(note);
                        if (idx !== -1) w.properties.splice(idx, 1);
                    }
                }
            });
        }
        syncCharacterNote(character, "Two-Weapon Fighting: add ability modifier to off-hand attack damage", sign === 1);
    }
    // Cantrip damage modifiers (e.g. Potent Spellcasting, Agonizing Blast)
    else if (target === "damage.cantrips" || target === "damage.eldritch_blast") {
        const isEbOnly = target === "damage.eldritch_blast";
        let bonus = delta;
        if (type === "ability_mod" && mod.abilitySource) {
            const ab = character.abilities.find(a => a.abbr.toLowerCase() === mod.abilitySource?.toLowerCase());
            bonus = ab ? ab.modifier : 0;
        }
        if (Array.isArray(character.actions)) {
            character.actions.forEach(a => {
                const isCantrip = !!a.spellName || (character.spells || []).some(s => s.level === 0 && s.name.toLowerCase() === a.name.toLowerCase());
                if (!isCantrip) return;
                if (isEbOnly && a.name.toLowerCase() !== "eldritch blast") return;

                if (a.damageOrEffect && a.damageOrEffect !== "Spell Effect") {
                    const match = a.damageOrEffect.match(/^(\d+d\d+)(?:\s*([+-]\s*\d+))?\s*(.*)$/);
                    if (match) {
                        const die = match[1];
                        const curBonus = match[2] ? parseInt(match[2].replace(/\s+/g, ""), 10) : 0;
                        const typeStr = match[3] || "";
                        const newBonus = curBonus + sign * bonus;
                        const bonusPart = newBonus !== 0 ? (newBonus > 0 ? ` + ${newBonus}` : ` - ${Math.abs(newBonus)}`) : "";
                        a.damageOrEffect = `${die}${bonusPart} ${typeStr}`.trim();
                    }
                } else if (bonus !== 0 && sign === 1) {
                    a.damageOrEffect = `+${bonus} Damage`;
                } else if (sign === -1 && a.damageOrEffect === `+${bonus} Damage`) {
                    a.damageOrEffect = "Spell Effect";
                }
            });
        }
    }
    // Weapon Attacks
    else if (target.startsWith("attacks.")) {
        const attackScope = target.split(".")[1]?.toLowerCase() || "all";
        if (type === "bonus" || type === "penalty") {
            if (Array.isArray(character.weapons)) {
                character.weapons.forEach(w => {
                    const isRanged = String(w.category || "").toLowerCase().includes("ranged") || (Array.isArray(w.properties) && w.properties.some((p: string) => p.toLowerCase().includes("range")));
                    const isMelee = String(w.category || "").toLowerCase().includes("melee") || !isRanged;
                    const matches = attackScope === "all" || (attackScope === "ranged" && isRanged) || (attackScope === "melee" && isMelee);
                    if (matches) {
                        w.toHitModifier = (Number(w.toHitModifier) || 0) + sign * delta;
                        w.attackBonus = (w.toHitModifier >= 0 ? "+" : "") + w.toHitModifier;
                    }
                });
            }
        } else if (type === "advantage" || type === "disadvantage") {
            const advText = type === "advantage" ? "Advantage" : "Disadvantage";
            const note = `${advText} on ${attackScope} weapon attacks${mod.condition ? ` (${mod.condition})` : ""}`;
            syncCharacterNote(character, note, sign === 1);
        }
    }
    // Damage Resistance & Defenses
    else if (target === "defenses.resistance" || target === "defenses.immunity" || target === "defenses.vulnerability") {
        const resType = String(mod.value || "").trim();
        if (resType) {
            const defLabel = target === "defenses.immunity" ? "Immunity" : target === "defenses.vulnerability" ? "Vulnerability" : "Resistance";
            const label = `${resType.charAt(0).toUpperCase() + resType.slice(1)} (${defLabel})`;
            const resistances = character.vitals.damageResistances || (character.vitals.damageResistances = []);
            if (sign === 1 && !resistances.includes(label)) {
                resistances.push(label);
            } else if (sign === -1) {
                const idx = resistances.indexOf(label);
                if (idx !== -1) resistances.splice(idx, 1);
            }

            if (character.proficiencies) {
                const currentDefs = Array.isArray(character.proficiencies.defenses)
                    ? [...character.proficiencies.defenses]
                    : [];
                if (sign === 1 && !currentDefs.includes(label)) {
                    currentDefs.push(label);
                } else if (sign === -1) {
                    const idx = currentDefs.indexOf(label);
                    if (idx !== -1) currentDefs.splice(idx, 1);
                }
                character.proficiencies.defenses = currentDefs;
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
    // Grant Action / Reaction
    else if (type === "grant_action" || target.startsWith("actions.") || target.startsWith("reactions.")) {
        const rawActionName = String(mod.value || "").trim() || (target.startsWith("reactions.") ? target.replace(/^reactions\./, "") : target.replace(/^actions\./, ""));
        const actionName = rawActionName.charAt(0).toUpperCase() + rawActionName.slice(1);
        if (actionName) {
            if (!Array.isArray(character.actions)) {
                character.actions = [];
            }
            const actionType = target.startsWith("reactions.") ? "Reaction" : target.includes("bonus") ? "Bonus Action" : "Action";
            if (sign === 1) {
                if (!character.actions.some(a => a.name.toLowerCase() === actionName.toLowerCase())) {
                    character.actions.push({
                        name: actionName,
                        type: actionType,
                        rangeOrReach: "Special",
                        hitOrDc: "Special",
                        damageOrEffect: mod.description || actionName,
                        notes: mod.description || `Granted by progression.`
                    });
                }
            } else {
                const idx = character.actions.findIndex(a => a.name.toLowerCase() === actionName.toLowerCase());
                if (idx !== -1) {
                    character.actions.splice(idx, 1);
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
        actionGrant?: {
            name: string;
            type?: string;
            range?: string;
            notes?: string;
            effect?: string;
        };
    },
    sign: 1 | -1
): void {
    if (!character || !option) return;

    if (Array.isArray(option.modifiers)) {
        for (const mod of option.modifiers) {
            applyStatModifier(character, mod, sign, option.name);
        }
    }

    if (option.actionGrant) {
        if (!Array.isArray(character.actions)) character.actions = [];
        const grant = option.actionGrant;
        if (sign === 1) {
            if (!character.actions.some(a => a.name.toLowerCase() === grant.name.toLowerCase())) {
                character.actions.push({
                    name: grant.name,
                    type: (grant.type as any) || "Reaction",
                    rangeOrReach: grant.range || "5 ft.",
                    hitOrDc: "Special",
                    damageOrEffect: grant.notes || option.description,
                    notes: grant.notes || `Granted by ${option.name}.`
                });
            }
        } else {
            const idx = character.actions.findIndex(a => a.name.toLowerCase() === grant.name.toLowerCase());
            if (idx !== -1) character.actions.splice(idx, 1);
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

export function evaluateCharacterStatModifiers(
    character: CharacterData,
    rules?: { classes?: any[]; subclasses?: any[] }
): void {
    if (!character) return;

    // Collect all active choices from character and creator state
    const activeChoices: Record<string, string> = {
        ...(character.creatorState?.subclassFeatureChoices || {}),
        ...(character.creatorState?.featureChoices || {}),
        ...(character.subclassFeatureChoices || {}),
        ...(character.featureChoices || {}),
        ...(character.trackingState?.featureChoices || {})
    };

    // Also collect fightingStyle, divineOrder, primalOrder, invocations if saved as top-level properties
    if (character.creatorState?.fightingStyle && !activeChoices["fighting-style"]) {
        activeChoices["fighting-style"] = character.creatorState.fightingStyle;
    }
    if (character.creatorState?.divineOrder && !activeChoices["divine-order"]) {
        activeChoices["divine-order"] = character.creatorState.divineOrder;
    }
    if (character.creatorState?.primalOrder && !activeChoices["primal-order"]) {
        activeChoices["primal-order"] = character.creatorState.primalOrder;
    }
    if (Array.isArray(character.creatorState?.invocations)) {
        character.creatorState.invocations.forEach((invId: string, idx: number) => {
            if (!activeChoices[`invocation-${idx}`]) {
                activeChoices[`invocation-${idx}`] = invId;
            }
        });
    }

    const appliedOptionIds = new Set<string>();

    for (const [key, val] of Object.entries(activeChoices)) {
        if (!val || val === "none") continue;
        const parts = val.includes(":") ? val.split(":") : [key, val];
        const kind = parts[0];
        const optId = parts[1] || parts[0];

        // 1. Look up via findClassOption
        let option = findClassOption(kind, optId);

        // 2. Look up via dynamic class/subclass progressions if rules passed or on character
        if (!option && rules?.classes) {
            for (const cls of rules.classes) {
                for (const pl of cls.progression || []) {
                    for (const ch of pl.choices || []) {
                        if (ch.choiceId === key || ch.choiceId === kind || ch.featureName?.toLowerCase() === kind.toLowerCase()) {
                            const found = ch.options?.find((o: any) => o.id === optId || o.id === val);
                            if (found) {
                                option = found;
                                break;
                            }
                        }
                    }
                    if (option) break;
                }
                if (option) break;
            }
        }
        if (!option && rules?.subclasses) {
            for (const sub of rules.subclasses) {
                for (const pl of sub.progression || []) {
                    for (const ch of pl.choices || []) {
                        if (ch.choiceId === key || ch.choiceId === kind || ch.featureName?.toLowerCase() === kind.toLowerCase()) {
                            const found = ch.options?.find((o: any) => o.id === optId || o.id === val);
                            if (found) {
                                option = found;
                                break;
                            }
                        }
                    }
                    if (option) break;
                }
                if (option) break;
            }
        }

        if (option && !appliedOptionIds.has(option.id)) {
            appliedOptionIds.add(option.id);
            applyProgressionChoiceOption(character, option, 1);
        }
    }
}
