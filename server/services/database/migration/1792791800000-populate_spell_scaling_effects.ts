import { MigrationInterface, QueryRunner } from "typeorm";
import { SEED_SPELLS } from "../spellsSeed";

interface SpellScalingRow {
    level: number | string;
    label: string;
    dice: string;
    modifier: string;
    effect?: string;
}

function wordToNum(w?: string): number {
    if (!w) return 1;
    const map: Record<string, number> = {
        one: 1, two: 2, three: 3, four: 4, five: 5,
        six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    return map[w.toLowerCase()] || parseInt(w, 10) || 1;
}

function parseScalingEffect(desc: string): {
    aboveLvl: number;
    generate: (lvl: number) => string;
} | null {
    if (!desc) return null;
    const upcastMatch = /(?:Using a Higher-Level Spell Slot|At Higher Levels)[.:]?\s*([^\n\r]+)/i.exec(desc);
    if (!upcastMatch) return null;
    const upcastText = upcastMatch[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&ndash;/g, "–").trim();

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
            aboveLvl,
            generate: (lvl: number) => {
                const count = baseCount + Math.max(0, lvl - aboveLvl) * addCount;
                const nounStr = (noun === "beast" || noun === "humanoid") ? (count === 1 ? noun : noun + "s") : (count === 1 ? "target" : "targets");
                return `${count} ${nounStr}`;
            }
        };
    }

    const radiusMatch = /(?:radius(?:\s+of\s+the\s+[a-zA-Z]+)?)\s+increases by\s+(\d+)\s+feet\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (radiusMatch) {
        const incFeet = Number(radiusMatch[1]);
        const aboveLvl = Number(radiusMatch[2]);
        const baseRadiusMatch = /(\d+)-foot-radius/i.exec(desc);
        const baseRadius = baseRadiusMatch ? Number(baseRadiusMatch[1]) : incFeet;
        return {
            aboveLvl,
            generate: (lvl: number) => `${baseRadius + Math.max(0, lvl - aboveLvl) * incFeet} ft. radius`
        };
    }

    const cubeMatch = /(?:size of the Cube|Cube)\s+increases by\s+(\d+)\s+feet\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText)
        || /increase the size of the Cube by\s+(\d+)\s+feet\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (cubeMatch) {
        const incFeet = Number(cubeMatch[1]);
        const aboveLvl = Number(cubeMatch[2]);
        const baseCubeMatch = /(\d+)-foot\s+cube/i.exec(desc);
        const baseCube = baseCubeMatch ? Number(baseCubeMatch[1]) : incFeet;
        return {
            aboveLvl,
            generate: (lvl: number) => `${baseCube + Math.max(0, lvl - aboveLvl) * incFeet} ft. Cube`
        };
    }

    if (/increase the width of the hillock by 5 feet or the length by 10 feet for each slot above 3rd/i.test(upcastText)) {
        return {
            aboveLvl: 3,
            generate: (lvl: number) => `+${(lvl - 3) * 5} ft. width or +${(lvl - 3) * 10} ft. length`
        };
    }

    const durMatch = /duration increases by\s+(\d+)\s+(hour|hours|day|days)\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (durMatch) {
        const incVal = Number(durMatch[1]);
        const unit = durMatch[2];
        const aboveLvl = Number(durMatch[3]);
        let baseDur = unit.startsWith("hour") ? (incVal === 48 ? 24 : 1) : 1;
        return {
            aboveLvl,
            generate: (lvl: number) => {
                const total = baseDur + Math.max(0, lvl - aboveLvl) * incVal;
                return `${total} ${unit.startsWith("hour") ? (total === 1 ? "hour" : "hours") : (total === 1 ? "day" : "days")}`;
            }
        };
    }

    const tierDurMatch = /spell'?s duration is\s+([^,.]+),\s+provided you use a spell slot of level\s+(\d+)\s+or higher/i.exec(upcastText)
        || /duration is\s+([^,.]+)\s+with a\s+(\d+)(?:st|nd|rd|th)?-level\s+spell slot/i.exec(upcastText);
    if (tierDurMatch) {
        const durText = tierDurMatch[1].trim();
        const minLvl = Number(tierDurMatch[2]);
        return {
            aboveLvl: minLvl - 1,
            generate: (lvl: number) => lvl >= minLvl ? durText : "Base Duration"
        };
    }

    const summonMatch = /(?:creature'?s stat block uses the spell'?s level|uses the spell slot level)/i.exec(upcastText);
    if (summonMatch) {
        return {
            aboveLvl: 0,
            generate: (lvl: number) => `Slot Level ${lvl} Stat Block`
        };
    }

    const poolMatch = /(?:maximum hit points|temporary hit points)\s+increases? by\s+(\d+)\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (poolMatch) {
        const incHp = Number(poolMatch[1]);
        const aboveLvl = Number(poolMatch[2]);
        let baseHpMatch = /(\d+)\s+(?:temporary\s+)?hit\s+points/i.exec(desc);
        const baseHp = baseHpMatch ? Number(baseHpMatch[1]) : incHp;
        return {
            aboveLvl,
            generate: (lvl: number) => `+${baseHp + Math.max(0, lvl - aboveLvl) * incHp} HP`
        };
    }

    const ammoMatch = /number of\s+([a-zA-Z]+)\s+increases by\s+(\d+)\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(upcastText);
    if (ammoMatch) {
        const noun = ammoMatch[1].toLowerCase();
        const incAmmo = Number(ammoMatch[2]);
        const aboveLvl = Number(ammoMatch[3]);
        return {
            aboveLvl,
            generate: (lvl: number) => {
                const count = incAmmo + Math.max(0, lvl - aboveLvl) * incAmmo;
                return `${count} ${noun}`;
            }
        };
    }

    return null;
}

function extractSpellDamageInfo(spell: {
    level?: number;
    description?: string;
    damageDice?: string;
    damageType?: string;
    damageModifier?: string;
    damageScaling?: unknown;
}) {
    const desc = spell.description || "";
    let baseLevel = Number(spell.level);
    if (isNaN(baseLevel)) baseLevel = 0;

    let damageDice = spell.damageDice || "";
    let damageType = spell.damageType || "";
    let damageModifier = spell.damageModifier || "";
    let damageScaling: SpellScalingRow[] | undefined;

    if (spell.damageScaling) {
        if (Array.isArray(spell.damageScaling)) {
            damageScaling = spell.damageScaling as SpellScalingRow[];
        } else if (typeof spell.damageScaling === "string") {
            try {
                damageScaling = JSON.parse(spell.damageScaling);
            } catch { }
        }
    }

    if (!damageDice && desc) {
        const rollableMatch = /\[rollable\](\d+d\d+(?:\s*[+-]\s*\d+)?);(?:[^\]]*?"rollType"\s*:\s*"damage"[^\]]*?)\[\/rollable\]\s*([a-zA-Z]+)?/i.exec(desc)
            || /\[damage\](\d+d\d+(?:\s*[+-]\s*\d+)?)\[\/damage\]\s*([a-zA-Z]+)?/i.exec(desc)
            || /(\d+d\d+)\s+([a-zA-Z]+)\s+damage/i.exec(desc);
        if (rollableMatch) {
            damageDice = rollableMatch[1].trim();
            if (rollableMatch[2] && !damageType) {
                damageType = rollableMatch[2].charAt(0).toUpperCase() + rollableMatch[2].slice(1).toLowerCase();
            }
        }
    }

    const scalingEffectInfo = parseScalingEffect(desc);

    if (!damageScaling && desc) {
        const upcastDiceMatch = /(?:Using a Higher-Level Spell Slot|At Higher Levels)[.:]?\s*.*?damage increases by\s+(\d+d\d+)\s+for each\s+(?:spell\s+)?slot\s+level above\s+(\d+)(?:st|nd|rd|th)?/i.exec(desc);

        if (baseLevel === 0 && damageDice) {
            const countMatch = /(\d+)d(\d+)/i.exec(damageDice);
            if (countMatch) {
                const baseCount = Number(countMatch[1]);
                const dieSides = countMatch[2];
                damageScaling = [
                    { level: 1, label: "Level 1", dice: `${baseCount}d${dieSides}`, modifier: damageModifier },
                    { level: 5, label: "Level 5", dice: `${baseCount + 1}d${dieSides}`, modifier: damageModifier },
                    { level: 11, label: "Level 11", dice: `${baseCount + 2}d${dieSides}`, modifier: damageModifier },
                    { level: 17, label: "Level 17", dice: `${baseCount + 3}d${dieSides}`, modifier: damageModifier }
                ];
            }
        } else if (upcastDiceMatch) {
            const incDiceStr = upcastDiceMatch[1];
            const aboveLvl = Number(upcastDiceMatch[2]);
            const baseDiceMatch = /(\d+)d(\d+)/i.exec(damageDice);
            const incMatch = /(\d+)d(\d+)/i.exec(incDiceStr);

            if (baseDiceMatch && incMatch && baseDiceMatch[2] === incMatch[2]) {
                const baseCount = Number(baseDiceMatch[1]);
                const incCount = Number(incMatch[1]);
                const dieSides = baseDiceMatch[2];

                damageScaling = [];
                for (let lvl = baseLevel; lvl <= 9; lvl++) {
                    const extra = Math.max(0, lvl - aboveLvl);
                    const diceCount = baseCount + extra * incCount;
                    const effectStr = scalingEffectInfo ? scalingEffectInfo.generate(lvl) : undefined;
                    damageScaling.push({
                        level: lvl,
                        label: `Level ${lvl}`,
                        dice: `${diceCount}d${dieSides}`,
                        modifier: damageModifier,
                        effect: effectStr
                    });
                }
            }
        } else if (scalingEffectInfo) {
            damageScaling = [];
            for (let lvl = baseLevel; lvl <= 9; lvl++) {
                damageScaling.push({
                    level: lvl,
                    label: `Level ${lvl}`,
                    dice: damageDice || "",
                    modifier: damageModifier || "",
                    effect: scalingEffectInfo.generate(lvl)
                });
            }
        }
    } else if (damageScaling && scalingEffectInfo) {
        damageScaling = damageScaling.map(row => {
            const lvl = typeof row.level === "number" ? row.level : parseInt(String(row.level), 10);
            if (!isNaN(lvl)) {
                return {
                    ...row,
                    effect: row.effect || scalingEffectInfo.generate(lvl)
                };
            }
            return row;
        });
    }

    return {
        damageDice,
        damageType,
        damageModifier,
        damageScaling
    };
}

export class PopulateSpellScalingEffects1792791800000 implements MigrationInterface {
    name = "PopulateSpellScalingEffects1792791800000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Seed or update all SEED_SPELLS in `spell` table, including updated descriptions and extracted damageScaling
        for (const sp of SEED_SPELLS) {
            const damageInfo = extractSpellDamageInfo(sp);
            const damageScalingVal = damageInfo.damageScaling && damageInfo.damageScaling.length > 0
                ? JSON.stringify(damageInfo.damageScaling)
                : null;

            await queryRunner.query(`
                INSERT INTO \`spell\`
                (\`slug\`, \`name\`, \`level\`, \`school\`, \`source\`, \`castingTime\`, \`range\`, \`duration\`, \`components\`, \`concentration\`, \`ritual\`, \`description\`, \`classes\`, \`isCustom\`, \`damageDice\`, \`damageType\`, \`damageModifier\`, \`damageScaling\`)
                VALUES (?, ?, ?, ?, '2024 Core Rules', ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    \`classes\` = VALUES(\`classes\`),
                    \`level\` = VALUES(\`level\`),
                    \`school\` = VALUES(\`school\`),
                    \`castingTime\` = VALUES(\`castingTime\`),
                    \`range\` = VALUES(\`range\`),
                    \`duration\` = VALUES(\`duration\`),
                    \`components\` = VALUES(\`components\`),
                    \`concentration\` = VALUES(\`concentration\`),
                    \`ritual\` = VALUES(\`ritual\`),
                    \`description\` = VALUES(\`description\`),
                    \`damageDice\` = COALESCE(VALUES(\`damageDice\`), \`damageDice\`),
                    \`damageType\` = COALESCE(VALUES(\`damageType\`), \`damageType\`),
                    \`damageModifier\` = COALESCE(VALUES(\`damageModifier\`), \`damageModifier\`),
                    \`damageScaling\` = COALESCE(VALUES(\`damageScaling\`), \`damageScaling\`)
            `, [
                sp.id,
                sp.name,
                sp.level,
                sp.school,
                sp.castingTime,
                sp.range,
                sp.duration,
                sp.components,
                sp.concentration ? 1 : 0,
                sp.ritual ? 1 : 0,
                sp.description,
                JSON.stringify(sp.classes || []),
                damageInfo.damageDice || null,
                damageInfo.damageType || null,
                damageInfo.damageModifier || null,
                damageScalingVal
            ]);
        }

        // 2. Scan ALL spells in the `spell` table and populate damageScaling if missing or outdated
        const allDbSpells: Array<{
            id: number;
            name: string;
            level: number;
            description: string;
            damageDice?: string;
            damageType?: string;
            damageModifier?: string;
            damageScaling?: string;
        }> = await queryRunner.query("SELECT `id`, `name`, `level`, `description`, `damageDice`, `damageType`, `damageModifier`, `damageScaling` FROM `spell`");

        for (const dbSpell of allDbSpells) {
            const damageInfo = extractSpellDamageInfo(dbSpell);
            if (damageInfo.damageScaling && damageInfo.damageScaling.length > 0) {
                const scalingJson = JSON.stringify(damageInfo.damageScaling);
                await queryRunner.query(
                    "UPDATE `spell` SET `damageScaling` = ?, `damageDice` = COALESCE(`damageDice`, ?), `damageType` = COALESCE(`damageType`, ?) WHERE `id` = ?",
                    [scalingJson, damageInfo.damageDice || null, damageInfo.damageType || null, dbSpell.id]
                );
            }
        }

        // 3. Scan ALL character spells in `character_spell` table and update descriptions/damageScaling where applicable
        const allCharSpells: Array<{
            id: number;
            name: string;
            level: number;
            description: string;
            damageDice?: string;
            damageType?: string;
            damageModifier?: string;
            damageScaling?: string;
        }> = await queryRunner.query("SELECT `id`, `name`, `level`, `description`, `damageDice`, `damageType`, `damageModifier`, `damageScaling` FROM `character_spell`");

        // Map seed spells by lowercase name for description enrichment
        const seedSpellMap = new Map<string, typeof SEED_SPELLS[0]>();
        for (const sp of SEED_SPELLS) {
            seedSpellMap.set(sp.name.toLowerCase(), sp);
        }

        for (const charSpell of allCharSpells) {
            let desc = charSpell.description || "";
            const matchingSeed = seedSpellMap.get(charSpell.name.toLowerCase());
            if (matchingSeed && matchingSeed.description.length > desc.length && matchingSeed.description.includes("Higher-Level Spell Slot")) {
                desc = matchingSeed.description;
                await queryRunner.query("UPDATE `character_spell` SET `description` = ? WHERE `id` = ?", [desc, charSpell.id]);
            }

            const damageInfo = extractSpellDamageInfo({
                ...charSpell,
                description: desc
            });

            if (damageInfo.damageScaling && damageInfo.damageScaling.length > 0) {
                const scalingJson = JSON.stringify(damageInfo.damageScaling);
                await queryRunner.query(
                    "UPDATE `character_spell` SET `damageScaling` = ?, `damageDice` = COALESCE(`damageDice`, ?), `damageType` = COALESCE(`damageType`, ?) WHERE `id` = ?",
                    [scalingJson, damageInfo.damageDice || null, damageInfo.damageType || null, charSpell.id]
                );
            }
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // No schema rollback required (data-only migration)
    }
}
