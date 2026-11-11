export interface SpellDamageScalingRow {
    level: number | string;
    label: string;
    dice: string;
    modifier: string;
    effect?: string;
}

export interface SpellDamageInfo {
    damageDice?: string;
    damageType?: string;
    damageModifier?: string;
    damageScaling?: SpellDamageScalingRow[];
}

export const DAMAGE_TYPES = [
    "Acid",
    "Bludgeoning",
    "Cold",
    "Fire",
    "Force",
    "Lightning",
    "Necrotic",
    "Piercing",
    "Poison",
    "Psychic",
    "Radiant",
    "Slashing",
    "Thunder",
    "Healing"
];

const CLASS_SPELLCASTING_ABILITY: Record<string, string> = {
    artificer: "INT",
    bard: "CHA",
    cleric: "WIS",
    druid: "WIS",
    paladin: "CHA",
    ranger: "WIS",
    sorcerer: "CHA",
    warlock: "CHA",
    wizard: "INT"
};

const ABILITY_ID_TO_ABBR: Record<number, string> = {
    1: "STR",
    2: "DEX",
    3: "CON",
    4: "INT",
    5: "WIS",
    6: "CHA"
};

export function getSpellcastingModifier(
    character?: any,
    spell?: { source?: string } | null
): number | undefined {
    if (typeof character === "number") {
        return character;
    }
    if (!character || typeof character !== "object") {
        return undefined;
    }

    const findModForAbbr = (abbr?: string): number | undefined => {
        if (!abbr) return undefined;
        const cleanAbbr = abbr.trim().toUpperCase();
        if (Array.isArray(character.abilities)) {
            const found = character.abilities.find((a: any) =>
                a && (String(a.abbr || "").toUpperCase() === cleanAbbr || String(a.name || "").toLowerCase() === abbr.toLowerCase())
            );
            if (found && typeof found.modifier === "number") {
                return found.modifier;
            }
        }
        if (Array.isArray(character.stats)) {
            const found = character.stats.find((s: any) =>
                s && (String(s.abbr || "").toUpperCase() === cleanAbbr || String(s.name || "").toLowerCase() === abbr.toLowerCase())
            );
            if (found) {
                if (typeof found.modifier === "number") return found.modifier;
                if (typeof found.score === "number") return Math.floor((found.score - 10) / 2);
            }
        }
        return undefined;
    };

    // 1. If spell has a specific source class, try to match it against character's classes or standard rules
    const sourceLower = String(spell?.source || "").trim().toLowerCase();
    if (sourceLower && Array.isArray(character.classes)) {
        const matchingClass = character.classes.find((c: any) => {
            const cName = String(c.name || c.definition?.name || "").toLowerCase();
            const subName = String(c.subclass || c.subclassDefinition?.name || "").toLowerCase();
            return cName === sourceLower || subName === sourceLower || sourceLower.includes(cName);
        });
        if (matchingClass) {
            const abilityId = Number(matchingClass.definition?.spellCastingAbilityId || matchingClass.subclassDefinition?.spellCastingAbilityId);
            if (abilityId && ABILITY_ID_TO_ABBR[abilityId]) {
                const mod = findModForAbbr(ABILITY_ID_TO_ABBR[abilityId]);
                if (mod !== undefined) return mod;
            }
            const mappedAbbr = CLASS_SPELLCASTING_ABILITY[matchingClass.name?.toLowerCase()];
            if (mappedAbbr) {
                const mod = findModForAbbr(mappedAbbr);
                if (mod !== undefined) return mod;
            }
        }
    }

    // 2. If source matches a standard spellcasting class name directly
    if (sourceLower && CLASS_SPELLCASTING_ABILITY[sourceLower]) {
        const mod = findModForAbbr(CLASS_SPELLCASTING_ABILITY[sourceLower]);
        if (mod !== undefined) return mod;
    }

    // 3. Inspect character.vitals.spellcastingAbility (e.g. "Charisma (+4)", "Wisdom (+3)", "CHA")
    const scAbility = String(character.vitals?.spellcastingAbility || "").trim();
    if (scAbility && scAbility.toLowerCase() !== "none") {
        const parenMatch = scAbility.match(/\(([+-]?\d+)\)/);
        if (parenMatch) {
            return parseInt(parenMatch[1], 10);
        }
        const wordMatch = scAbility.match(/^[a-zA-Z]+/);
        if (wordMatch) {
            const mod = findModForAbbr(wordMatch[0]);
            if (mod !== undefined) return mod;
        }
    }

    // 4. Fallback to spellAttackBonus - proficiencyBonus if present
    if (
        typeof character.vitals?.spellAttackBonus === "number" &&
        typeof character.vitals?.proficiencyBonus === "number"
    ) {
        return character.vitals.spellAttackBonus - character.vitals.proficiencyBonus;
    }

    // 5. Check character.classes for any spellcaster class
    if (Array.isArray(character.classes)) {
        for (const c of character.classes) {
            const cName = String(c.name || c.definition?.name || "").toLowerCase();
            const mappedAbbr = CLASS_SPELLCASTING_ABILITY[cName];
            if (mappedAbbr) {
                const mod = findModForAbbr(mappedAbbr);
                if (mod !== undefined) return mod;
            }
        }
    }

    // 6. Highest mental stat (INT, WIS, CHA) if abilities present
    if (Array.isArray(character.abilities) && character.abilities.length > 0) {
        const mentalAbbrs = ["CHA", "WIS", "INT"];
        const mods = mentalAbbrs
            .map(abbr => findModForAbbr(abbr))
            .filter((m): m is number => m !== undefined);
        if (mods.length > 0) {
            return Math.max(...mods);
        }
    }

    return undefined;
}

export function replaceModInString(str: string, modNumber: number): string {
    if (!str || typeof str !== "string") return str;

    return str.replace(/([+-])?(\s*)MOD\b/gi, (_match, sign, space) => {
        let val = modNumber;
        if (sign === "-") {
            val = -val;
        }
        const signStr = val >= 0 ? "+" : "-";
        const absVal = Math.abs(val);
        if (space) {
            return `${signStr}${space}${absVal}`;
        }
        return val >= 0 ? `+${val}` : `${val}`;
    });
}

export function getSpellDamageType(
    spell?: { damageType?: string; description?: string; damageScaling?: unknown } | null,
    damageText?: string
): string | undefined {
    if (spell?.damageType && typeof spell.damageType === "string" && spell.damageType.trim()) {
        return spell.damageType.trim();
    }
    if (damageText) {
        for (const dt of DAMAGE_TYPES) {
            const regex = new RegExp(`\\b${dt}\\b`, "i");
            if (regex.test(damageText)) {
                return dt;
            }
        }
    }
    if (spell) {
        const extracted = extractSpellDamageInfo(spell);
        if (extracted.damageType) {
            return extracted.damageType;
        }
    }
    if (spell?.description && /\b(regains?\s+(?:hit\s+points|hp)|healing\b|heals?\s+\d+d\d+)/i.test(spell.description)) {
        return "Healing";
    }
    return undefined;
}

export function isHealingSpell(
    spell?: { damageType?: string; description?: string; damageScaling?: unknown } | null,
    damageTextOrType?: string
): boolean {
    const type = getSpellDamageType(spell, damageTextOrType) || damageTextOrType;
    if (!type) return false;
    const lower = type.toLowerCase();
    return lower === "healing" || lower === "heal" || lower.includes("heal");
}

function capitalize(s: string): string {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function isDamageType(val: string): boolean {
    if (!val) return false;
    const clean = val.trim().toLowerCase();
    return DAMAGE_TYPES.some(t => t.toLowerCase() === clean);
}

export function parseDamageScalingString(raw: unknown): SpellDamageScalingRow[] | undefined {
    if (!raw) return undefined;
    if (Array.isArray(raw)) {
        return raw.filter(r => r && typeof r === "object" && ("level" in r || "dice" in r || "effect" in r));
    }
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.filter(r => r && typeof r === "object" && ("level" in r || "dice" in r || "effect" in r));
            }
        } catch {
            return undefined;
        }
    }
    return undefined;
}

function wordToNum(w?: string): number {
    if (!w) return 1;
    const map: Record<string, number> = {
        one: 1, two: 2, three: 3, four: 4, five: 5,
        six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    return map[w.toLowerCase()] || parseInt(w, 10) || 1;
}

export function parseScalingEffect(desc: string, baseLevel: number): {
    type: string;
    aboveLvl: number;
    generate: (lvl: number) => string;
} | null {
    if (!desc) return null;
    const upcastMatch = /(?:Using a Higher-Level Spell Slot|At Higher Levels)[.:]?\s*([^\n\r]+)/i.exec(desc);
    if (!upcastMatch) return null;
    const upcastText = upcastMatch[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&ndash;/g, "–").trim();

    // 1. Target scaling (e.g. Tasha's Hideous Laughter, Charm Person, Command, Invisibility, Hold Person, Fly, Banishment, etc.)
    const targetMatch = /(?:You can target|You can affect|target)\s+(?:up to\s+)?(one|two|three|\d+)?\s*(?:additional\s+)?(?:willing\s+)?([a-zA-Z]+)(?:\s+\([^)]+\))?\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText)
        || /target\s+(one|two|three|\d+)\s+additional target for each slot level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (targetMatch) {
        const isTargetWord = targetMatch[0].includes("additional target for each slot");
        const addCount = isTargetWord ? wordToNum(targetMatch[1]) : (targetMatch[1] ? wordToNum(targetMatch[1]) : 1);
        const aboveLvl = isTargetWord ? Number(targetMatch[2]) : Number(targetMatch[3]);
        const noun = isTargetWord ? "target" : (targetMatch[2] ? targetMatch[2].toLowerCase() : "target");

        let baseCount = 1;
        if (/up to three creatures/i.test(desc) || /three willing creatures/i.test(desc)) baseCount = 3;
        else if (/up to two creatures/i.test(desc) || /two creatures/i.test(desc)) baseCount = 2;

        return {
            type: "target",
            aboveLvl,
            generate: (lvl: number) => {
                const count = baseCount + Math.max(0, lvl - aboveLvl) * addCount;
                const nounStr = (noun === "beast" || noun === "humanoid") ? (count === 1 ? noun : noun + "s") : (count === 1 ? "target" : "targets");
                return `${count} ${nounStr}`;
            }
        };
    }

    // 2. Radius / Area scaling (e.g. Confusion, Fog Cloud)
    const radiusMatch = /(?:radius(?:\s+of\s+the\s+[a-zA-Z]+)?)\s+increases by\s+(\d+)\s+feet\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (radiusMatch) {
        const incFeet = Number(radiusMatch[1]);
        const aboveLvl = Number(radiusMatch[2]);
        const baseRadiusMatch = /(\d+)-foot-radius/i.exec(desc);
        const baseRadius = baseRadiusMatch ? Number(baseRadiusMatch[1]) : incFeet;
        return {
            type: "radius",
            aboveLvl,
            generate: (lvl: number) => {
                const rad = baseRadius + Math.max(0, lvl - aboveLvl) * incFeet;
                return `${rad} ft. radius`;
            }
        };
    }

    // 3. Cube size scaling (e.g. Creation, Mordenkainen's Private Sanctum)
    const cubeMatch = /(?:size of the Cube|Cube)\s+increases by\s+(\d+)\s+feet\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText)
        || /increase the size of the Cube by\s+(\d+)\s+feet\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (cubeMatch) {
        const incFeet = Number(cubeMatch[1]);
        const aboveLvl = Number(cubeMatch[2]);
        const baseCubeMatch = /(\d+)-foot\s+cube/i.exec(desc);
        const baseCube = baseCubeMatch ? Number(baseCubeMatch[1]) : incFeet;
        return {
            type: "cube",
            aboveLvl,
            generate: (lvl: number) => {
                const size = baseCube + Math.max(0, lvl - aboveLvl) * incFeet;
                return `${size} ft. Cube`;
            }
        };
    }

    // 3b. Hillock (High Ground)
    if (/increase the width of the hillock by 5 feet or the length by 10 feet for each slot above 3rd/i.test(upcastText)) {
        return {
            type: "hillock",
            aboveLvl: 3,
            generate: (lvl: number) => `+${(lvl - 3) * 5} ft. width or +${(lvl - 3) * 10} ft. length`
        };
    }

    // 4. Duration per level (e.g. Magic Circle, Animal Messenger)
    const durMatch = /duration increases by\s+(\d+)\s+(hour|hours|day|days)\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (durMatch) {
        const incVal = Number(durMatch[1]);
        const unit = durMatch[2];
        const aboveLvl = Number(durMatch[3]);
        let baseDur = unit.startsWith("hour") ? (incVal === 48 ? 24 : 1) : 1;
        return {
            type: "duration",
            aboveLvl,
            generate: (lvl: number) => {
                const val = baseDur + Math.max(0, lvl - aboveLvl) * incVal;
                return `${val} ${val === 1 ? unit.replace(/s$/, "") : (unit.endsWith("s") ? unit : unit + "s")}`;
            }
        };
    }

    // 5. Tiered duration / concentration (Hex, Dominate Person, Dominate Beast, Bestow Curse, Major Image, Planar Binding, Mass Suggestion)
    if (/with a spell slot of level 2 \(up to 4 hours\), 3–4 \(up to 8 hours\), or 5\+ \(24 hours\)/i.test(upcastText)) {
        return {
            type: "tiered-duration",
            aboveLvl: 1,
            generate: (lvl: number) => {
                if (lvl === 1) return "Up to 1 hour";
                if (lvl === 2) return "Up to 4 hours";
                if (lvl <= 4) return "Up to 8 hours";
                return "Up to 24 hours";
            }
        };
    }
    if (/Concentration can last longer with a spell slot of level 6 \(up to 10 minutes\), 7 \(up to 1 hour\), or 8\+ \(up to 8 hours\)/i.test(upcastText)) {
        return {
            type: "tiered-duration",
            aboveLvl: 5,
            generate: (lvl: number) => {
                if (lvl <= 5) return "Up to 1 minute";
                if (lvl === 6) return "Up to 10 minutes";
                if (lvl === 7) return "Up to 1 hour";
                return "Up to 8 hours";
            }
        };
    }
    if (/Concentration can last longer with a spell slot of level 5 \(up to 10 minutes\), 6 \(up to 1 hour\), or 7\+ \(up to 8 hours\)/i.test(upcastText)) {
        return {
            type: "tiered-duration",
            aboveLvl: 4,
            generate: (lvl: number) => {
                if (lvl <= 4) return "Up to 1 minute";
                if (lvl === 5) return "Up to 10 minutes";
                if (lvl === 6) return "Up to 1 hour";
                return "Up to 8 hours";
            }
        };
    }
    if (/Major Image/i.test(desc) || /spell lasts until dispelled, without requiring Concentration, if cast with a level 4\+/i.test(upcastText)) {
        return {
            type: "tiered-duration",
            aboveLvl: 3,
            generate: (lvl: number) => {
                if (lvl <= 3) return "10 min (Conc)";
                return "Until dispelled (no Conc)";
            }
        };
    }
    if (/Bestow Curse/i.test(desc) || /level 4 spell slot, you can maintain Concentration on it for up to 10 minutes/i.test(upcastText)) {
        return {
            type: "tiered-duration",
            aboveLvl: 3,
            generate: (lvl: number) => {
                if (lvl <= 3) return "1 min (Conc)";
                if (lvl === 4) return "10 min (Conc)";
                if (lvl <= 6) return "8 hours (no Conc)";
                if (lvl <= 8) return "24 hours (no Conc)";
                return "Until dispelled (no Conc)";
            }
        };
    }
    if (/Modify Memory/i.test(desc) || /alter the target’s memories of an event that took place up to 7 days ago/i.test(upcastText)) {
        return {
            type: "memory",
            aboveLvl: 5,
            generate: (lvl: number) => {
                if (lvl <= 5) return "Up to 24 hours ago";
                if (lvl === 6) return "Up to 7 days ago";
                if (lvl === 7) return "Up to 30 days ago";
                if (lvl === 8) return "Up to 365 days ago";
                return "Any time in past";
            }
        };
    }
    if (/Planar Binding/i.test(desc) || /duration increases with a spell slot of level 6 \(10 days\)/i.test(upcastText)) {
        return {
            type: "binding",
            aboveLvl: 5,
            generate: (lvl: number) => {
                if (lvl <= 5) return "24 hours";
                if (lvl === 6) return "10 days";
                if (lvl === 7) return "30 days";
                if (lvl === 8) return "180 days";
                return "366 days";
            }
        };
    }
    if (/Mass Suggestion/i.test(desc) || /duration is longer with a spell slot of level 7 \(10 days\)/i.test(upcastText)) {
        return {
            type: "suggestion",
            aboveLvl: 6,
            generate: (lvl: number) => {
                if (lvl <= 6) return "24 hours";
                if (lvl === 7) return "10 days";
                if (lvl === 8) return "30 days";
                return "366 days";
            }
        };
    }
    if (/Create Undead/i.test(desc) || /animate or reassert control over four Ghouls/i.test(upcastText)) {
        return {
            type: "undead",
            aboveLvl: 6,
            generate: (lvl: number) => {
                if (lvl <= 6) return "3 Ghouls";
                if (lvl === 7) return "4 Ghouls";
                if (lvl === 8) return "5 Ghouls or 2 Ghasts/Wights";
                return "6 Ghouls, 3 Ghasts/Wights, or 2 Mummies";
            }
        };
    }
    if (/Magic Weapon/i.test(desc) || /bonus increases to \+2 with a level 3–5 spell slot/i.test(upcastText)) {
        return {
            type: "bonus",
            aboveLvl: 2,
            generate: (lvl: number) => {
                if (lvl <= 2) return "+1 bonus";
                if (lvl <= 5) return "+2 bonus";
                return "+3 bonus";
            }
        };
    }
    if (/Globe of Invulnerability/i.test(desc) || /barrier blocks spells of 1 level higher for each spell slot level above 6/i.test(upcastText)) {
        return {
            type: "barrier",
            aboveLvl: 6,
            generate: (lvl: number) => {
                const blk = 5 + (lvl - 6);
                return `Blocks spells ≤ lvl ${blk}`;
            }
        };
    }
    if (/Dispel Magic/i.test(desc) || /automatically end a spell on the target if the spell’s level is equal to or less than the level of the spell slot/i.test(upcastText)) {
        return {
            type: "dispel",
            aboveLvl: 3,
            generate: (lvl: number) => `Auto-ends ≤ lvl ${lvl}`
        };
    }

    // 6. Stat block summons
    if (/Use the spell slot’s level for the spell’s level in the stat block/i.test(upcastText)) {
        return {
            type: "stat-block",
            aboveLvl: baseLevel,
            generate: (lvl: number) => `Slot lvl ${lvl} in stat block`
        };
    }

    // 7. Temporary HP / Healing / Max HP scaling
    if (/gain (\d+) additional Temporary Hit Points for each spell slot level above (\d+)/i.test(upcastText)) {
        const m = /gain (\d+) additional Temporary Hit Points for each spell slot level above (\d+)/i.exec(upcastText);
        const incThp = Number(m?.[1] || "5");
        const aboveLvl = Number(m?.[2] || "1");
        return {
            type: "thp",
            aboveLvl,
            generate: (lvl: number) => `+${(lvl - aboveLvl) * incThp} Temp HP`
        };
    }
    if (/Each target(?:'s|’s) Hit Point maximum and current Hit Points increase by (\d+) for each spell slot level above (\d+)/i.test(upcastText)) {
        const m = /Each target(?:'s|’s) Hit Point maximum and current Hit Points increase by (\d+) for each spell slot level above (\d+)/i.exec(upcastText);
        const incHp = Number(m?.[1] || "5");
        const aboveLvl = Number(m?.[2] || "2");
        return {
            type: "aid",
            aboveLvl,
            generate: (lvl: number) => `+${5 + (lvl - aboveLvl) * incHp} Max HP`
        };
    }

    // 8. Ammunition / Meteors
    if (/ammunition you can affect with this spell increases by two for each slot level above (\d+)/i.test(upcastText)) {
        const aboveLvl = 3;
        return {
            type: "ammo",
            aboveLvl,
            generate: (lvl: number) => `${12 + (lvl - aboveLvl) * 2} arrows`
        };
    }
    if (/number of meteors created increases by two for each slot level above (\d+)/i.test(upcastText)) {
        const aboveLvl = 3;
        return {
            type: "meteors",
            aboveLvl,
            generate: (lvl: number) => `${6 + (lvl - aboveLvl) * 2} meteors`
        };
    }

    // 9. Weight (Catapult)
    if (/maximum weight of objects that you can target with this spell increases by (\d+) pounds/i.test(upcastText)) {
        const aboveLvl = 1;
        return {
            type: "weight",
            aboveLvl,
            generate: (lvl: number) => `Up to ${5 + (lvl - aboveLvl) * 5} lbs`
        };
    }

    return null;
}

export function extractSpellDamageInfo(spell: {
    name?: string;
    level?: number;
    description?: string;
    damageDice?: string;
    damageType?: string;
    damageModifier?: string;
    damageScaling?: unknown;
    modifiers?: any[];
}): SpellDamageInfo {
    const baseLevel = Number(spell.level) || 0;
    const desc = spell.description || "";
    const cleanDesc = desc.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&ndash;/gi, "–");
    const isDiceLike = (str: string) => /^\d*d\d+/i.test(str.trim()) || /^[-+]?\d+$/.test(str.trim()) || str.trim() === "—";

    let damageDice = spell.damageDice ? String(spell.damageDice).trim() : undefined;
    if (damageDice && !isDiceLike(damageDice)) {
        damageDice = undefined;
    }

    let damageType = spell.damageType ? capitalize(String(spell.damageType).trim()) : undefined;
    let damageModifier = spell.damageModifier !== undefined && spell.damageModifier !== null
        ? String(spell.damageModifier).trim()
        : undefined;
    let damageScaling = parseDamageScalingString(spell.damageScaling);

    if (damageScaling && Array.isArray(damageScaling)) {
        const hasInvalidLevels = baseLevel > 0 && damageScaling.some(r => Number(r.level) < baseLevel);
        const hasGarbageDice = damageScaling.some(r => r.dice && !isDiceLike(String(r.dice || "")));
        if (hasInvalidLevels || hasGarbageDice) {
            damageScaling = undefined;
        }
    }

    // Special cases by spell name
    const spellName = String(spell.name || "").trim();
    if (spellName === "True Strike") {
        return {
            damageDice: "—",
            damageType: "Radiant",
            damageModifier: undefined,
            damageScaling: [
                { level: 1, label: "Level 1–4", dice: "—", modifier: "" },
                { level: 5, label: "Level 5–10", dice: "1d6", modifier: "" },
                { level: 11, label: "Level 11–16", dice: "2d6", modifier: "" },
                { level: 17, label: "Level 17–20", dice: "3d6", modifier: "" }
            ]
        };
    }
    if (spellName === "Toll the Dead") {
        return {
            damageDice: "1d8 (or 1d12)",
            damageType: "Necrotic",
            damageModifier: undefined,
            damageScaling: [
                { level: 1, label: "Level 1–4", dice: "1d8 (or 1d12)", modifier: "" },
                { level: 5, label: "Level 5–10", dice: "2d8 (or 2d12)", modifier: "" },
                { level: 11, label: "Level 11–16", dice: "3d8 (or 3d12)", modifier: "" },
                { level: 17, label: "Level 17–20", dice: "4d8 (or 4d12)", modifier: "" }
            ]
        };
    }
    if (spellName === "Shillelagh") {
        return {
            damageDice: "1d8",
            damageType: "Force",
            damageModifier: undefined,
            damageScaling: [
                { level: 1, label: "Level 1–4", dice: "1d8", modifier: "" },
                { level: 5, label: "Level 5–10", dice: "1d10", modifier: "" },
                { level: 11, label: "Level 11–16", dice: "1d12", modifier: "" },
                { level: 17, label: "Level 17–20", dice: "2d6", modifier: "" }
            ]
        };
    }
    if (spellName === "Shadow Blade") {
        return {
            damageDice: "2d8",
            damageType: "Psychic",
            damageModifier: undefined,
            damageScaling: [
                { level: 2, label: "Level 2", dice: "2d8", modifier: "" },
                { level: 3, label: "Level 3", dice: "3d8", modifier: "" },
                { level: 4, label: "Level 4", dice: "3d8", modifier: "" },
                { level: 5, label: "Level 5", dice: "4d8", modifier: "" },
                { level: 6, label: "Level 6", dice: "4d8", modifier: "" },
                { level: 7, label: "Level 7", dice: "5d8", modifier: "" },
                { level: 8, label: "Level 8", dice: "5d8", modifier: "" },
                { level: 9, label: "Level 9", dice: "5d8", modifier: "" }
            ]
        };
    }
    if (spellName === "False Life") {
        return {
            damageDice: "2d4",
            damageType: "Healing",
            damageModifier: "+4",
            damageScaling: [
                { level: 1, label: "Level 1", dice: "2d4", modifier: "+4" },
                { level: 2, label: "Level 2", dice: "2d4", modifier: "+9" },
                { level: 3, label: "Level 3", dice: "2d4", modifier: "+14" },
                { level: 4, label: "Level 4", dice: "2d4", modifier: "+19" },
                { level: 5, label: "Level 5", dice: "2d4", modifier: "+24" },
                { level: 6, label: "Level 6", dice: "2d4", modifier: "+29" },
                { level: 7, label: "Level 7", dice: "2d4", modifier: "+34" },
                { level: 8, label: "Level 8", dice: "2d4", modifier: "+39" },
                { level: 9, label: "Level 9", dice: "2d4", modifier: "+44" }
            ]
        };
    }

    // 1. Check embedded HTML or Markdown damage blocks in description if fields are missing
    if ((!damageDice || !damageScaling || damageScaling.length === 0) && desc) {
        // Look for HTML table inside .spell-damage-scaling-block or .custom-spell-damage-block or similar
        const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        const htmlRows: SpellDamageScalingRow[] = [];
        let trMatch: RegExpExecArray | null;
        while ((trMatch = trRegex.exec(desc)) !== null) {
            const trContent = trMatch[1];
            const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
            const cells: string[] = [];
            let tdMatch: RegExpExecArray | null;
            while ((tdMatch = tdRegex.exec(trContent)) !== null) {
                cells.push(tdMatch[1].replace(/<[^>]*>/g, "").trim());
            }

            if (cells.length < 4) continue;

            const col1 = cells[0] || "";
            const dice = cells[1] || "";
            const mod = cells[2] || "";
            const effect = cells.length >= 5 ? cells[3] : undefined;
            const total = cells.length >= 5 ? cells[4] : cells[3];

            // Ignore header row
            if (dice.toLowerCase().includes("damage dice") || dice.toLowerCase().includes("healing dice") || col1.toLowerCase().includes("level") || col1.toLowerCase().includes("slot")) {
                if (dice.toLowerCase().includes("damage dice") || dice.toLowerCase().includes("healing dice")) continue;
            }

            const lvlMatch = /(?:Level\s*(\d+)|Cantrip|(\d+)(?:st|nd|rd|th)?\s*Level)/i.exec(col1);
            const numMatch = /(\d+)/.exec(col1);
            let lvl = 0;
            if (lvlMatch) {
                lvl = lvlMatch[1] ? Number(lvlMatch[1]) : (lvlMatch[2] ? Number(lvlMatch[2]) : (baseLevel === 0 ? 1 : 0));
            } else if (numMatch) {
                lvl = Number(numMatch[1]);
            }

            let cleanMod = mod === "—" || mod === "-" ? "" : mod;
            if (!damageType) {
                if (mod && isDamageType(mod)) {
                    damageType = capitalize(mod);
                    cleanMod = total === "—" || total === "-" ? "" : total;
                } else if (total) {
                    const typeMatch = total.match(/[a-zA-Z]+/g);
                    const candidate = typeMatch?.[typeMatch.length - 1];
                    if (candidate && candidate.toLowerCase() !== "damage" && isDamageType(candidate)) {
                        damageType = capitalize(candidate);
                    }
                }
            }
            const cleanDice = dice === "—" || dice === "-" ? "" : dice;
            const cleanEffect = effect && effect !== "—" && effect !== "-" ? effect : undefined;
            if ((cleanDice && isDiceLike(cleanDice)) || cleanEffect) {
                htmlRows.push({
                    level: lvl,
                    label: col1,
                    dice: cleanDice,
                    modifier: cleanMod,
                    effect: cleanEffect
                });
            }
        }
        if (htmlRows.length > 0) {
            damageScaling = htmlRows;
            if (!damageDice && htmlRows[0]?.dice) {
                damageDice = htmlRows[0].dice;
            }
            if (!damageModifier && htmlRows[0]?.modifier) {
                damageModifier = htmlRows[0].modifier;
            }
        }
    }

    if ((!damageDice || !damageScaling || damageScaling.length === 0) && desc) {
        const mdRows: SpellDamageScalingRow[] = [];
        const lines = desc.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
            const cells = trimmed.slice(1, -1).split("|").map(c => c.trim());
            if (cells.length < 3) continue;

            const col1 = cells[0];
            const dice = cells[1];
            const col3 = cells[2] || "";
            const col4 = cells[3] || "";
            const col5 = cells[4];

            if (dice.toLowerCase().includes("damage dice") || dice.toLowerCase().includes("healing dice") || col1.includes("---")) continue;

            const mod = col3;
            const effect = col5 !== undefined ? col4 : undefined;
            const total = col5 !== undefined ? col5 : col4;

            const lvlMatch = /(?:Level\s*(\d+)|Cantrip|(\d+)(?:st|nd|rd|th)?\s*Level)/i.exec(col1);
            const numMatch = /(\d+)/.exec(col1);
            let lvl = 0;
            if (lvlMatch) {
                lvl = lvlMatch[1] ? Number(lvlMatch[1]) : (lvlMatch[2] ? Number(lvlMatch[2]) : (baseLevel === 0 ? 1 : 0));
            } else if (numMatch) {
                lvl = Number(numMatch[1]);
            }

            let cleanMod = mod === "—" || mod === "-" ? "" : mod;
            if (!damageType) {
                if (mod && isDamageType(mod)) {
                    damageType = capitalize(mod);
                    cleanMod = total === "—" || total === "-" ? "" : total;
                } else if (total && isDamageType(total)) {
                    damageType = capitalize(total);
                }
            }

            const cleanDice = dice === "—" || dice === "-" ? "" : dice;
            const cleanEffect = effect && effect !== "—" && effect !== "-" ? effect : undefined;
            if ((cleanDice && cleanDice.toLowerCase() !== "damage dice" && isDiceLike(cleanDice)) || cleanEffect) {
                mdRows.push({
                    level: lvl,
                    label: col1,
                    dice: cleanDice,
                    modifier: cleanMod,
                    effect: cleanEffect
                });
            }
        }
        if (mdRows.length > 0) {
            damageScaling = mdRows;
            if (!damageDice && mdRows[0]?.dice) {
                damageDice = mdRows[0].dice;
            }
            if (!damageModifier && mdRows[0]?.modifier) {
                damageModifier = mdRows[0].modifier;
            }
        }
    }

    // 2. Parse base damage dice & type from standard 5e / D&D Beyond description if not set
    if (!damageDice && desc) {
        const rollableMatch = /\[rollable\](\d+d\d+(?:\s*[+-]\s*\d+)?);(?:[^\]]*?"rollType"\s*:\s*"damage"[^\]]*?)\[\/rollable\]\s*([a-zA-Z]+)?/i.exec(desc)
            || /\[damage\](\d+d\d+(?:\s*[+-]\s*\d+)?)\[\/damage\]\s*([a-zA-Z]+)?/i.exec(desc);
        if (rollableMatch) {
            damageDice = rollableMatch[1].trim();
            if (rollableMatch[2] && !damageType) {
                damageType = capitalize(rollableMatch[2]);
            }
        }

        if (!damageDice) {
            const damageTypePattern = DAMAGE_TYPES.join("|");
            const stdMatch = new RegExp(`\\b(\\d+d\\d+(?:\\s*[+-]\\s*(?:\\d+|\\{\\{[^}]+\\}\\}))?)\\s*(${damageTypePattern})\\s+damage\\b`, "i").exec(desc)
                || new RegExp(`\\b(?:takes?|dealing|deals?|taking)\\s+(\\d+d\\d+(?:\\s*[+-]\\s*(?:\\d+|\\{\\{[^}]+\\}\\}))?)\\s*(?:extra\\s+)?(${damageTypePattern})\\b`, "i").exec(desc)
                || new RegExp(`\\b(${damageTypePattern})\\s+damage\\s+(?:equal to\\s+)?(\\d+d\\d+(?:\\s*[+-]\\s*(?:\\d+|\\{\\{[^}]+\\}\\}))?)\\b`, "i").exec(desc)
                || new RegExp(`\\bbase damage is\\s+(\\d+d\\d+)\\b`, "i").exec(desc);

            if (stdMatch) {
                if (/\d+d\d+/i.test(stdMatch[1])) {
                    damageDice = stdMatch[1].trim();
                    if (!damageType && stdMatch[2]) damageType = capitalize(stdMatch[2]);
                } else if (/\d+d\d+/i.test(stdMatch[2])) {
                    damageDice = stdMatch[2].trim();
                    if (!damageType && stdMatch[1]) damageType = capitalize(stdMatch[1]);
                }
            }
        }

        if (!damageDice) {
            const healMatch = /\bregains?\s+(?:a\s+number\s+of\s+)?(?:Hit Points equal to\s+)?(\d+d\d+(?:\s*(?:plus|\+)\s*(?:\d+|\{\{[^}]+\}\}|your\s+spellcasting\s+ability\s+modifier))?)\b/i.exec(desc)
                || /\bheals?\s+(?:for\s+)?(\d+d\d+(?:\s*[+-]\s*(?:\d+|\{\{[^}]+\}\}))?)\b/i.exec(desc)
                || /\brestores?\s+(\d+d\d+)\s+(?:hit points|Hit Points|HP)/i.exec(desc);
            if (healMatch && healMatch[1]) {
                damageDice = healMatch[1].replace(/(?:plus|\+)?\s*your\s+spellcasting\s+ability\s+modifier/i, "").trim();
                damageType = "Healing";
                if (!damageModifier && /(?:plus|\+)\s*your\s+spellcasting\s+ability\s+modifier/i.test(healMatch[1])) {
                    damageModifier = "+MOD";
                }
            }
        }

        if (damageDice) {
            const modSplit = /^(\d+d\d+)\s*([+-]\s*\d+)$/i.exec(damageDice);
            if (modSplit) {
                damageDice = modSplit[1];
                if (!damageModifier) damageModifier = modSplit[2].replace(/\s+/g, "");
            }
        }
    }

    // 2b. Check D&D Beyond structured modifiers array if damage is not yet found from description
    if (!damageDice && Array.isArray(spell.modifiers)) {
        for (const mod of spell.modifiers) {
            const modType = String(mod?.type || "").toLowerCase();
            if (modType === "damage" || modType === "healing") {
                const die = mod.die || {};
                const diceStr = die.diceString || (die.diceCount && die.diceValue ? `${die.diceCount}d${die.diceValue}` : undefined);
                if (diceStr) {
                    damageDice = diceStr;
                    if (!damageType && mod.subType) {
                        damageType = capitalize(mod.subType);
                    } else if (!damageType && modType === "healing") {
                        damageType = "Healing";
                    }
                    if (!damageModifier && mod.useStatModifier) {
                        damageModifier = "+MOD";
                    } else if (!damageModifier && mod.fixedValue) {
                        damageModifier = mod.fixedValue > 0 ? `+${mod.fixedValue}` : String(mod.fixedValue);
                    }

                    if ((!damageScaling || damageScaling.length === 0) && mod.atHigherLevels?.higherLevelDefinitions && Array.isArray(mod.atHigherLevels.higherLevelDefinitions)) {
                        const rows: SpellDamageScalingRow[] = [];
                        for (const hld of mod.atHigherLevels.higherLevelDefinitions) {
                            const hLvl = Number(hld.level);
                            const hDice = hld.dice?.diceString || (hld.dice?.diceCount && hld.dice?.diceValue ? `${hld.dice.diceCount}d${hld.dice.diceValue}` : damageDice);
                            rows.push({
                                level: hLvl,
                                label: baseLevel === 0 ? `Level ${hLvl}` : `Level ${hLvl}`,
                                dice: hDice,
                                modifier: damageModifier || ""
                            });
                        }
                        if (rows.length > 0) {
                            damageScaling = rows;
                        }
                    }
                    break;
                }
            }
        }
    }

    // 3. Generate scaling rows if missing and spell has damage dice
    if (damageDice && (!damageScaling || damageScaling.length <= 1)) {
        const baseDiceMatch = /^(\d+)d(\d+)/i.exec(damageDice);
        if (baseDiceMatch) {
            const baseCount = Number(baseDiceMatch[1]);
            const dieSize = Number(baseDiceMatch[2]);
            const modStr = damageModifier || "";

            if (baseLevel === 0) {
                // Cantrips scale by character level at levels 1, 5, 11, and 17 (e.g. Acid Splash, Fire Bolt)
                const cantripUpgradeMatch = /(?:increases by|extra|additional|\+)\s*(\d+)d(\d+)\s*(?:damage|healing)?\s*when you reach\s*(?:levels?\s*)?5/i.exec(cleanDesc)
                    || /when you reach\s*(?:levels?\s*)?5(?:th)?\s*(?:level\s*)?\((?:level\s*)?(\d+)d(\d+)\)/i.exec(cleanDesc)
                    || /creates two beams at level 5/i.exec(cleanDesc);

                let incCount = 1;
                let incDie = dieSize;
                if (cantripUpgradeMatch) {
                    if (/when you reach/i.test(cantripUpgradeMatch[0]) && cantripUpgradeMatch[0].includes("(") && cantripUpgradeMatch[1]) {
                        incCount = Math.max(1, Number(cantripUpgradeMatch[1]) - baseCount);
                        incDie = Number(cantripUpgradeMatch[2]) || dieSize;
                    } else if (cantripUpgradeMatch[1]) {
                        incCount = Number(cantripUpgradeMatch[1]) || 1;
                        incDie = Number(cantripUpgradeMatch[2]) || dieSize;
                    }
                }

                damageScaling = [
                    { level: 1, label: "Level 1–4", dice: `${baseCount}d${dieSize}`, modifier: modStr },
                    { level: 5, label: "Level 5–10", dice: `${baseCount + incCount}d${incDie}`, modifier: modStr },
                    { level: 11, label: "Level 11–16", dice: `${baseCount + 2 * incCount}d${incDie}`, modifier: modStr },
                    { level: 17, label: "Level 17–20", dice: `${baseCount + 3 * incCount}d${incDie}`, modifier: modStr }
                ];
            } else {
                const incMatch = /(?:increases?(?:\s+for\s+[^.]+?)?\s+by|extra|additional|\+)\s*(\d+)d(\d+)[^.]*?(?:for each|per)\s*(?:(?:spell\s+)?slot\s+)?(?:level\s+)?above\s*(\d+)(?:st|nd|rd|th)?/i.exec(cleanDesc)
                    || /(?:\+?(\d+)d(\d+)\s+(?:damage\s+)?per\s+(?:spell\s+)?slot\s+(?:level\s+)?above\s*(\d+)(?:st|nd|rd|th)?)/i.exec(cleanDesc)
                    || /(?:damage|healing)\s+increases?\s+by\s*(\d+)d(\d+)[^.]*?(?:for each|per)\s*(?:(?:spell\s+)?slot\s+)?(?:level\s+)?above\s*(\d+)(?:st|nd|rd|th)?/i.exec(cleanDesc);

                if (incMatch) {
                    const incCount = Number(incMatch[1]) || 1;
                    const incDie = Number(incMatch[2]) || dieSize;
                    const aboveLevel = Number(incMatch[3]) || baseLevel;

                    const rows: SpellDamageScalingRow[] = [];
                    for (let lvl = baseLevel; lvl <= 9; lvl++) {
                        const diff = Math.max(0, lvl - aboveLevel);
                        const totalDice = baseCount + diff * incCount;
                        rows.push({
                            level: lvl,
                            label: `Level ${lvl}`,
                            dice: `${totalDice}d${incDie}`,
                            modifier: modStr
                        });
                    }
                    damageScaling = rows;
                } else if (damageScaling && damageScaling.length === 1) {
                    // Single base row already present
                } else {
                    damageScaling = [
                        { level: baseLevel, label: `Level ${baseLevel}`, dice: damageDice, modifier: modStr }
                    ];
                }
            }
        }
    }

    // 4. Generate or enrich scaling rows for effect scaling if present in description
    if (baseLevel >= 1 && desc) {
        const scalingEffect = parseScalingEffect(desc, baseLevel);
        if (scalingEffect) {
            if (damageScaling && damageScaling.length > 1) {
                // Enrich existing damage scaling rows with their effect
                damageScaling = damageScaling.map(r => {
                    const lvl = Number(r.level);
                    if (!isNaN(lvl)) {
                        return {
                            ...r,
                            effect: r.effect || scalingEffect.generate(lvl)
                        };
                    }
                    return r;
                });
            } else {
                // Build scaling rows for levels baseLevel..9
                const rows: SpellDamageScalingRow[] = [];
                for (let lvl = baseLevel; lvl <= 9; lvl++) {
                    rows.push({
                        level: lvl,
                        label: `Level ${lvl}`,
                        dice: damageDice || "",
                        modifier: damageModifier || "",
                        effect: scalingEffect.generate(lvl)
                    });
                }
                damageScaling = rows;
            }
        }
    }

    return {
        damageDice: damageDice || undefined,
        damageType: damageType || undefined,
        damageModifier: damageModifier || undefined,
        damageScaling: damageScaling && damageScaling.length > 0 ? damageScaling : undefined
    };
}

export function getSpellDamageDisplay(
    spell: {
        level?: number;
        damageDice?: string;
        damageType?: string;
        damageModifier?: string;
        damageScaling?: SpellDamageScalingRow[] | unknown;
        source?: string;
        description?: string;
    },
    castAtLevelOrOptions?: number | { castAtLevel?: number; characterLevel?: number; spellcastingMod?: number; character?: any },
    characterLevelArg?: number,
    spellcastingModOrCharacterArg?: number | any
): string {
    let castAtLevel: number | undefined;
    let characterLevel: number | undefined;
    let spellcastingMod: number | undefined;

    if (typeof castAtLevelOrOptions === "object" && castAtLevelOrOptions !== null) {
        castAtLevel = castAtLevelOrOptions.castAtLevel;
        characterLevel = castAtLevelOrOptions.characterLevel;
        if (typeof castAtLevelOrOptions.spellcastingMod === "number") {
            spellcastingMod = castAtLevelOrOptions.spellcastingMod;
        } else if (castAtLevelOrOptions.character) {
            spellcastingMod = getSpellcastingModifier(castAtLevelOrOptions.character, spell);
        }
    } else if (typeof castAtLevelOrOptions === "number") {
        castAtLevel = castAtLevelOrOptions;
        characterLevel = characterLevelArg;
    } else {
        characterLevel = characterLevelArg;
    }

    if (spellcastingMod === undefined && spellcastingModOrCharacterArg !== undefined) {
        if (typeof spellcastingModOrCharacterArg === "number") {
            spellcastingMod = spellcastingModOrCharacterArg;
        } else if (typeof spellcastingModOrCharacterArg === "object" && spellcastingModOrCharacterArg !== null) {
            spellcastingMod = getSpellcastingModifier(spellcastingModOrCharacterArg, spell);
        }
    }

    const hasExplicitLevel = spell.level !== undefined && spell.level !== null;
    let scaling = parseDamageScalingString(spell.damageScaling);
    let extractedType: string | undefined;
    let extractedMod: string | undefined;
    if (!scaling || scaling.length === 0 || !spell.damageType || !spell.damageModifier) {
        const extracted = extractSpellDamageInfo(spell);
        if (!scaling || scaling.length === 0) {
            scaling = extracted.damageScaling;
        }
        if (!spell.damageType) {
            extractedType = extracted.damageType;
        }
        if (!spell.damageModifier && extracted.damageModifier) {
            extractedMod = extracted.damageModifier;
        }
    }
    const baseLevel = hasExplicitLevel ? Number(spell.level) : (scaling?.[0]?.level ?? 1);

    let dice = spell.damageDice || "";
    let mod = spell.damageModifier || extractedMod || "";

    if (scaling && scaling.length > 0) {
        const isCharacterScaling = (hasExplicitLevel && baseLevel === 0) || scaling.some(r => {
            const lbl = String(r.label || "").toLowerCase();
            return lbl.includes("cantrip") || lbl.includes("character") || lbl.includes("1–4") || lbl.includes("1-4") || lbl.includes("5–10");
        });

        if (isCharacterScaling) {
            const effectiveCharLevel = characterLevel !== undefined && characterLevel > 0 ? characterLevel : 1;
            const sortedRows = [...scaling].sort((a, b) => Number(a.level) - Number(b.level));
            let matchedRow = sortedRows[0];
            for (const r of sortedRows) {
                if (Number(r.level) <= effectiveCharLevel) {
                    matchedRow = r;
                }
            }
            if (matchedRow && matchedRow.dice) {
                dice = matchedRow.dice;
                if (matchedRow.modifier !== undefined && matchedRow.modifier !== null && String(matchedRow.modifier).trim() !== "") {
                    mod = String(matchedRow.modifier);
                }
            }
        } else if (castAtLevel !== undefined) {
            const row = scaling.find(r => Number(r.level) === Number(castAtLevel));
            if (row && row.dice) {
                dice = row.dice;
                if (row.modifier !== undefined && row.modifier !== null) {
                    mod = String(row.modifier);
                }
            }
        } else if (scaling[0]?.dice) {
            dice = scaling[0].dice;
            if (scaling[0].modifier !== undefined && scaling[0].modifier !== null && String(scaling[0].modifier).trim() !== "") {
                mod = String(scaling[0].modifier);
            }
        }
    }

    if (typeof spellcastingMod === "number") {
        mod = replaceModInString(mod, spellcastingMod);
        dice = replaceModInString(dice, spellcastingMod);
    }

    if (!dice && !mod) return "";

    const cleanMod = mod.trim();
    const formattedMod = cleanMod
        ? (cleanMod.startsWith("+") || cleanMod.startsWith("-") ? cleanMod : `+${cleanMod}`)
        : "";

    const resolvedType = spell.damageType || extractedType;
    const typeStr = resolvedType ? ` ${resolvedType}` : "";
    return `${dice}${formattedMod}${typeStr}`.trim();
}

export function getSpellEffectDisplay(
    spell: {
        level?: number;
        damageScaling?: SpellDamageScalingRow[] | unknown;
        description?: string;
    },
    castAtLevelOrOptions?: number | { castAtLevel?: number; characterLevel?: number },
    characterLevelArg?: number
): string {
    let castAtLevel: number | undefined;
    let characterLevel: number | undefined;

    if (typeof castAtLevelOrOptions === "object" && castAtLevelOrOptions !== null) {
        castAtLevel = castAtLevelOrOptions.castAtLevel;
        characterLevel = castAtLevelOrOptions.characterLevel;
    } else if (typeof castAtLevelOrOptions === "number") {
        castAtLevel = castAtLevelOrOptions;
        characterLevel = characterLevelArg;
    } else {
        characterLevel = characterLevelArg;
    }

    let scaling = parseDamageScalingString(spell.damageScaling);
    if (!scaling || scaling.length === 0 || !scaling.some(r => r.effect)) {
        const extracted = extractSpellDamageInfo(spell);
        if (extracted.damageScaling && extracted.damageScaling.some(r => r.effect)) {
            scaling = extracted.damageScaling;
        }
    }

    if (!scaling || scaling.length === 0) return "";

    const hasExplicitLevel = spell.level !== undefined && spell.level !== null;
    const baseLevel = hasExplicitLevel ? Number(spell.level) : (Number(scaling[0]?.level) || 1);

    const isCharacterScaling = (hasExplicitLevel && baseLevel === 0) || scaling.some(r => {
        const lbl = String(r.label || "").toLowerCase();
        return lbl.includes("cantrip") || lbl.includes("character") || lbl.includes("1–4") || lbl.includes("1-4") || lbl.includes("5–10");
    });

    if (isCharacterScaling) {
        const effectiveCharLevel = characterLevel !== undefined && characterLevel > 0 ? characterLevel : 1;
        const sortedRows = [...scaling].sort((a, b) => Number(a.level) - Number(b.level));
        let matchedRow = sortedRows[0];
        for (const r of sortedRows) {
            if (Number(r.level) <= effectiveCharLevel) {
                matchedRow = r;
            }
        }
        return matchedRow?.effect || "";
    }

    if (castAtLevel !== undefined) {
        const row = scaling.find(r => Number(r.level) === Number(castAtLevel));
        if (row?.effect) return row.effect;
    }

    const baseRow = scaling.find(r => Number(r.level) === baseLevel) || scaling[0];
    return baseRow?.effect || "";
}

export function hasScalingEffect(spell: { level?: number; damageScaling?: unknown; description?: string }): boolean {
    const baseLevel = Number(spell.level) || 0;
    const baseEffect = getSpellEffectDisplay(spell, baseLevel);
    if (!baseEffect) return false;
    for (let lvl = baseLevel + 1; lvl <= 9; lvl++) {
        const eff = getSpellEffectDisplay(spell, lvl);
        if (eff && eff !== baseEffect) return true;
    }
    return false;
}

export function resolveActionSpellDamage(
    action: { name: string; damageOrEffect?: string; spellName?: string; notes?: string },
    character?: { level?: number; classes?: Array<{ level?: number }>; spells?: Array<any>; spellSlots?: any; abilities?: any[]; vitals?: any }
): { damageOrEffect: string; isScaled: boolean; scaledTierLabel?: string } {
    const spellName = action.spellName || action.name;
    const spell = (character?.spells || []).find(s => s && s.name && s.name.toLowerCase() === spellName.toLowerCase());
    const spellcastingMod = character ? getSpellcastingModifier(character, spell) : undefined;

    let fallback = action.damageOrEffect || "—";
    if (spellcastingMod !== undefined && fallback && fallback.includes("MOD")) {
        fallback = replaceModInString(fallback, spellcastingMod);
    }
    if (!character) {
        return { damageOrEffect: fallback, isScaled: false };
    }

    if (!spell) {
        return { damageOrEffect: fallback, isScaled: false };
    }

    const charLevel = Number(character.level) || (character.classes || []).reduce((sum, c) => sum + (Number(c.level) || 0), 0) || 1;
    const isCantrip = Number(spell.level) === 0;

    if (isCantrip) {
        const isEb = spell.name.toLowerCase() === "eldritch blast";
        if (isEb) {
            const beamCount = charLevel >= 17 ? 4 : charLevel >= 11 ? 3 : charLevel >= 5 ? 2 : 1;
            const bonusMatch = (action.damageOrEffect || "").match(/([+-]\s*\d+)/);
            const bonusStr = bonusMatch
                ? ` ${bonusMatch[1].replace(/\s+/g, " ")}`
                : (spell.damageModifier ? (spell.damageModifier.startsWith("+") || spell.damageModifier.startsWith("-") ? ` ${spell.damageModifier}` : ` +${spell.damageModifier}`) : "");

            const damageStr = beamCount > 1
                ? `${beamCount} beams • 1d10${bonusStr} Force each`
                : `1d10${bonusStr} Force`.trim();

            const isScaled = beamCount > 1;
            const tierLabel = charLevel >= 17 ? "Level 17–20 (4 Beams)" : charLevel >= 11 ? "Level 11–16 (3 Beams)" : charLevel >= 5 ? "Level 5–10 (2 Beams)" : "Level 1–4";
            return {
                damageOrEffect: spellcastingMod !== undefined ? replaceModInString(damageStr, spellcastingMod) : damageStr,
                isScaled,
                scaledTierLabel: isScaled ? tierLabel : undefined
            };
        }

        const scaledDisplay = getSpellDamageDisplay(spell, undefined, charLevel, spellcastingMod);
        const baseDisplay = getSpellDamageDisplay(spell, undefined, 1, spellcastingMod);
        const isScaled = charLevel >= 5 && !!scaledDisplay && scaledDisplay !== baseDisplay;
        const tierLabel = charLevel >= 17 ? "Level 17–20" : charLevel >= 11 ? "Level 11–16" : charLevel >= 5 ? "Level 5–10" : "Level 1–4";

        if (scaledDisplay) {
            const scaledDiceMatch = scaledDisplay.match(/^(\d+d\d+)/);
            const scaledDice = scaledDiceMatch ? scaledDiceMatch[1] : "";
            const currentDiceMatch = (action.damageOrEffect || "").match(/(\d+d\d+)/);

            if (scaledDice && currentDiceMatch) {
                let updated = action.damageOrEffect!.replace(currentDiceMatch[1], scaledDice);
                if (spellcastingMod !== undefined && updated.includes("MOD")) {
                    updated = replaceModInString(updated, spellcastingMod);
                }
                return {
                    damageOrEffect: updated,
                    isScaled,
                    scaledTierLabel: isScaled ? tierLabel : undefined
                };
            }

            if (!action.damageOrEffect || action.damageOrEffect === "Spell Effect") {
                return {
                    damageOrEffect: scaledDisplay,
                    isScaled,
                    scaledTierLabel: isScaled ? tierLabel : undefined
                };
            }
        }

        return {
            damageOrEffect: fallback,
            isScaled: false
        };
    }

    const pactSlotLevel = character.spellSlots?.pact?.level;
    const notesLower = (action.notes || "").toLowerCase();
    const isPactMagic = pactSlotLevel && (notesLower.includes("pact magic") || (spell.source || "").toLowerCase().includes("warlock"));
    const slotLevelMatch = /(?:cast at|slot level|level)\s*(\d+)(?:st|nd|rd|th)?/i.exec(action.notes || "")
        || /(?:level\s*)(\d+)/i.exec(action.name || "");
    const castLevel = isPactMagic ? pactSlotLevel : (slotLevelMatch ? Number(slotLevelMatch[1]) : undefined);

    if (castLevel && castLevel > Number(spell.level)) {
        const scaledDisplay = getSpellDamageDisplay(spell, castLevel, undefined, spellcastingMod);
        const baseDisplay = getSpellDamageDisplay(spell, Number(spell.level), undefined, spellcastingMod);

        if (scaledDisplay && scaledDisplay !== baseDisplay) {
            const scaledDiceMatch = scaledDisplay.match(/^(\d+d\d+)/);
            const scaledDice = scaledDiceMatch ? scaledDiceMatch[1] : "";
            const currentDiceMatch = (action.damageOrEffect || "").match(/(\d+d\d+)/);

            if (scaledDice && currentDiceMatch) {
                let updated = action.damageOrEffect!.replace(currentDiceMatch[1], scaledDice);
                if (spellcastingMod !== undefined && updated.includes("MOD")) {
                    updated = replaceModInString(updated, spellcastingMod);
                }
                return {
                    damageOrEffect: updated,
                    isScaled: true,
                    scaledTierLabel: `Slot Level ${castLevel}`
                };
            }

            return {
                damageOrEffect: scaledDisplay,
                isScaled: true,
                scaledTierLabel: `Slot Level ${castLevel}`
            };
        }
    }

    let defaultDisplay = getSpellDamageDisplay(spell, undefined, undefined, spellcastingMod);
    if (defaultDisplay) {
        if (!action.damageOrEffect || action.damageOrEffect === "Spell Effect") {
            return {
                damageOrEffect: defaultDisplay,
                isScaled: false
            };
        }
    }

    return {
        damageOrEffect: fallback,
        isScaled: false
    };

    return {
        damageOrEffect: fallback,
        isScaled: false
    };
}
