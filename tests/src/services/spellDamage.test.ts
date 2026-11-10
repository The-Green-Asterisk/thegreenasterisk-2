import { describe, expect, it } from "vitest";
import {
    extractSpellDamageInfo,
    getSpellDamageDisplay,
    resolveActionSpellDamage
} from "../../../src/services/spellDamage";
import { CharacterData, SpellDefinition } from "../../../src/views/characterSheet/characterData";
import { renderActions } from "../../../src/views/characterSheet/components/actions";
import { renderSpellCard, renderSpellsByLevel } from "../../../src/views/characterSheet/components/spells";

describe("spellDamage service", () => {
    it("extracts base damage and higher level scaling from standard 5e description", () => {
        const fireball = {
            name: "Fireball",
            level: 3,
            description: "A bright streak flashes from your finger... Each creature in a 20-foot-radius sphere must make a Dexterity saving throw, taking 8d6 fire damage on a failed save. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each slot level above 3rd."
        };

        const info = extractSpellDamageInfo(fireball);
        expect(info.damageDice).toBe("8d6");
        expect(info.damageType).toBe("Fire");
        expect(info.damageScaling).toBeDefined();
        expect(info.damageScaling?.length).toBe(7); // Levels 3 through 9

        expect(info.damageScaling?.[0]).toEqual({
            level: 3,
            label: "Level 3",
            dice: "8d6",
            modifier: ""
        });
        expect(info.damageScaling?.[1]).toEqual({
            level: 4,
            label: "Level 4",
            dice: "9d6",
            modifier: ""
        });
        expect(info.damageScaling?.[2]).toEqual({
            level: 5,
            label: "Level 5",
            dice: "10d6",
            modifier: ""
        });
    });

    it("extracts cantrip damage and scales across character tiers", () => {
        const fireBolt = {
            name: "Fire Bolt",
            level: 0,
            description: "You hurl a mote of fire. On a hit, the target takes 1d10 fire damage. The damage increases by 1d10 when you reach levels 5, 11, and 17."
        };

        const info = extractSpellDamageInfo(fireBolt);
        expect(info.damageDice).toBe("1d10");
        expect(info.damageType).toBe("Fire");
        expect(info.damageScaling?.length).toBe(4);
        expect(info.damageScaling?.[0].dice).toBe("1d10");
        expect(info.damageScaling?.[1].dice).toBe("2d10");
        expect(info.damageScaling?.[2].dice).toBe("3d10");
        expect(info.damageScaling?.[3].dice).toBe("4d10");
    });

    it("extracts healing from spells like Cure Wounds", () => {
        const cureWounds = {
            name: "Cure Wounds",
            level: 1,
            description: "A creature you touch regains Hit Points equal to 2d8 + your spellcasting ability modifier."
        };

        const info = extractSpellDamageInfo(cureWounds);
        expect(info.damageDice).toBe("2d8");
        expect(info.damageType).toBe("Healing");
        expect(info.damageModifier).toBe("+MOD");
    });

    it("parses embedded custom spell damage HTML block", () => {
        const customSpell = {
            name: "Swamp Bolt",
            level: 1,
            description: `<p>A bolt of swamp magic.</p>
<div class="custom-spell-damage-block">
    <table class="custom-spell-damage-table">
        <tbody>
            <tr><td>Level 1</td><td>2d8</td><td>Acid</td><td>+2</td></tr>
            <tr><td>Level 2</td><td>3d8</td><td>Acid</td><td>+2</td></tr>
            <tr><td>Level 3</td><td>4d8</td><td>Acid</td><td>+2</td></tr>
        </tbody>
    </table>
</div>`
        };

        const info = extractSpellDamageInfo(customSpell);
        expect(info.damageDice).toBe("2d8");
        expect(info.damageType).toBe("Acid");
        expect(info.damageModifier).toBe("+2");
        expect(info.damageScaling?.length).toBe(3);
        expect(info.damageScaling?.[1].dice).toBe("3d8");
    });

    it("parses embedded Markdown damage table", () => {
        const customSpell = {
            name: "Frost Smite",
            level: 1,
            description: `A weapon smite of frost.

| Level | Damage Dice | Damage Type | Modifier |
| --- | --- | --- | --- |
| Level 1 | 1d8 | Cold | |
| Level 2 | 2d8 | Cold | |`
        };

        const info = extractSpellDamageInfo(customSpell);
        expect(info.damageDice).toBe("1d8");
        expect(info.damageType).toBe("Cold");
        expect(info.damageScaling?.length).toBe(2);
        expect(info.damageScaling?.[1].dice).toBe("2d8");
    });

    it("formats spell damage display for base level and upcast levels", () => {
        const spell = {
            damageDice: "8d6",
            damageType: "Fire",
            damageScaling: [
                { level: 3, label: "Level 3", dice: "8d6", modifier: "" },
                { level: 4, label: "Level 4", dice: "9d6", modifier: "" },
                { level: 5, label: "Level 5", dice: "10d6", modifier: "" }
            ]
        };

        expect(getSpellDamageDisplay(spell, 3)).toBe("8d6 Fire");
        expect(getSpellDamageDisplay(spell, 4)).toBe("9d6 Fire");
        expect(getSpellDamageDisplay(spell, 5)).toBe("10d6 Fire");
    });

    it("scales cantrip damage (e.g. Acid Splash) according to character level", () => {
        const acidSplash = {
            name: "Acid Splash",
            level: 0,
            description: "You hurl a bubble of acid. A target takes 1d6 acid damage on a failed save. This spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)."
        };

        const info = extractSpellDamageInfo(acidSplash);
        expect(info.damageDice).toBe("1d6");
        expect(info.damageType).toBe("Acid");

        const spellWithDamage = {
            ...acidSplash,
            damageDice: info.damageDice,
            damageType: info.damageType,
            damageScaling: info.damageScaling
        };

        // Character Level 1-4: 1d6
        expect(getSpellDamageDisplay(spellWithDamage, 0, 1)).toBe("1d6 Acid");
        expect(getSpellDamageDisplay(spellWithDamage, 0, 4)).toBe("1d6 Acid");

        // Character Level 5-10: 2d6
        expect(getSpellDamageDisplay(spellWithDamage, 0, 5)).toBe("2d6 Acid");
        expect(getSpellDamageDisplay(spellWithDamage, 0, 10)).toBe("2d6 Acid");

        // Character Level 11-16 (Darvell at Lv 12): 3d6
        expect(getSpellDamageDisplay(spellWithDamage, 0, 11)).toBe("3d6 Acid");
        expect(getSpellDamageDisplay(spellWithDamage, 0, 12)).toBe("3d6 Acid");

        // Character Level 17-20: 4d6
        expect(getSpellDamageDisplay(spellWithDamage, 0, 17)).toBe("4d6 Acid");
        expect(getSpellDamageDisplay(spellWithDamage, 0, 20)).toBe("4d6 Acid");
    });

    it("extracts damage and scaling from D&D Beyond structured modifiers array", () => {
        const ddbSpell = {
            name: "Ray of Frost",
            level: 0,
            description: "A frigid beam of blue-white light streaks toward a creature within range.",
            modifiers: [
                {
                    type: "damage",
                    subType: "cold",
                    die: { diceCount: 1, diceValue: 8, diceString: "1d8" },
                    atHigherLevels: {
                        higherLevelDefinitions: [
                            { level: 1, dice: { diceCount: 1, diceValue: 8, diceString: "1d8" } },
                            { level: 5, dice: { diceCount: 2, diceValue: 8, diceString: "2d8" } },
                            { level: 11, dice: { diceCount: 3, diceValue: 8, diceString: "3d8" } },
                            { level: 17, dice: { diceCount: 4, diceValue: 8, diceString: "4d8" } }
                        ]
                    }
                }
            ]
        };

        const info = extractSpellDamageInfo(ddbSpell);
        expect(info.damageDice).toBe("1d8");
        expect(info.damageType).toBe("Cold");
        expect(info.damageScaling?.length).toBe(4);
        expect(info.damageScaling?.[0].dice).toBe("1d8");
        expect(info.damageScaling?.[1].dice).toBe("2d8");
        expect(info.damageScaling?.[2].dice).toBe("3d8");
        expect(info.damageScaling?.[3].dice).toBe("4d8");
    });
});

describe("renderSpellCard & renderSpellsByLevel", () => {
    const mockAcidSplash: SpellDefinition = {
        id: 1,
        name: "Acid Splash",
        level: 0,
        school: "Conjuration",
        source: "Sorcerer",
        castingTime: "1 Action",
        range: "60 ft.",
        duration: "Instantaneous",
        components: "V, S",
        concentration: false,
        ritual: false,
        description: "You hurl a bubble of acid. A target takes 1d6 acid damage. Damage increases by 1d6 at 5th level, 11th level, and 17th level.",
        damageDice: "1d6",
        damageType: "Acid",
        damageScaling: [
            { level: 1, label: "Cantrip (Level 1–4)", dice: "1d6", modifier: "" },
            { level: 5, label: "5th Level (Level 5–10)", dice: "2d6", modifier: "" },
            { level: 11, label: "11th Level (Level 11–16)", dice: "3d6", modifier: "" },
            { level: 17, label: "17th Level (Level 17–20)", dice: "4d6", modifier: "" }
        ]
    };
    const mockSpell: SpellDefinition = {
        id: 2,
        name: "Fireball",
        level: 3,
        school: "Evocation",
        source: "Wizard",
        castingTime: "1 Action",
        range: "150 ft.",
        duration: "Instantaneous",
        components: "V, S, M",
        concentration: false,
        ritual: false,
        description: "Each creature takes 8d6 fire damage. Using a Higher-Level Spell Slot. Increases by 1d6 for each slot level above 3rd.",
        damageDice: "8d6",
        damageType: "Fire",
        damageScaling: [
            { level: 3, label: "Level 3", dice: "8d6", modifier: "" },
            { level: 4, label: "Level 4", dice: "9d6", modifier: "" },
            { level: 5, label: "Level 5", dice: "10d6", modifier: "" }
        ]
    };

    it("displays damage dice and type on spell cards", () => {
        const cardHtml = renderSpellCard(mockSpell);
        expect(cardHtml).toContain('class="badge badge-damage"');
        expect(cardHtml).toContain("8d6 Fire");
        expect(cardHtml).toContain('class="meta-item meta-damage"');
    });

    it("displays upcast badge and level when rendered as an upcast spell", () => {
        const upcastSpell: SpellDefinition = {
            ...mockSpell,
            castAtLevel: 4
        };

        const cardHtml = renderSpellCard(upcastSpell);
        expect(cardHtml).toContain("spell-card-upcast");
        expect(cardHtml).toContain('badge-upcast');
        expect(cardHtml).toContain("Level 4 (Base: Level 3)");
        expect(cardHtml).toContain("9d6 Fire");
    });

    it("repeats spells at higher levels with updated damage dice when character has available slots", () => {
        const characterData = {
            classes: [{ name: "Wizard", level: 9 }],
            spellSlots: {
                level3: { total: 3, label: "3rd Level" },
                level4: { total: 3, label: "4th Level" },
                level5: { total: 1, label: "5th Level" }
            },
            spells: [mockSpell]
        } as unknown as CharacterData;

        const rendered = renderSpellsByLevel([mockSpell], characterData.spellSlots, characterData);

        // Should render 3rd-Level Spells section with 8d6 Fire
        expect(rendered).toContain('data-spell-level="3"');
        expect(rendered).toContain("8d6 Fire");

        // Should repeat in 4th-Level Spells section with 9d6 Fire and Upcast badge
        expect(rendered).toContain('data-spell-level="4"');
        expect(rendered).toContain("9d6 Fire");

        // Should repeat in 5th-Level Spells section with 10d6 Fire and Upcast badge
        expect(rendered).toContain('data-spell-level="5"');
        expect(rendered).toContain("10d6 Fire");
    });

    it("renders cantrips like Acid Splash scaled to the character level", () => {
        // Level 1 character
        const lowLevelChar = {
            classes: [{ name: "Sorcerer", level: 1 }],
            spellSlots: {},
            spells: [mockAcidSplash]
        } as unknown as CharacterData;

        const renderedLow = renderSpellsByLevel([mockAcidSplash], {}, lowLevelChar);
        expect(renderedLow).toContain("1d6 Acid");
        expect(renderedLow).not.toContain("3d6 Acid");

        // Level 12 character (Darvell)
        const darvell = {
            classes: [{ name: "Sorcerer", level: 12 }],
            spellSlots: {},
            spells: [mockAcidSplash]
        } as unknown as CharacterData;

        const renderedDarvell = renderSpellsByLevel([mockAcidSplash], {}, darvell);
        expect(renderedDarvell).toContain("3d6 Acid");

        // Direct renderSpellCard with character level
        const cardLv1 = renderSpellCard(mockAcidSplash, 1);
        expect(cardLv1).toContain("1d6 Acid");

        const cardLv5 = renderSpellCard(mockAcidSplash, 5);
        expect(cardLv5).toContain("2d6 Acid");

        const cardLv12 = renderSpellCard(mockAcidSplash, 12);
        expect(cardLv12).toContain("3d6 Acid");

        const cardLv17 = renderSpellCard(mockAcidSplash, 17);
        expect(cardLv17).toContain("4d6 Acid");
    });

    it("scales spell damage in the Actions & Attacks tab based on character level", () => {
        const acidSplashSpell: SpellDefinition = {
            id: 10,
            name: "Acid Splash",
            level: 0,
            school: "Conjuration",
            source: "Sorcerer",
            castingTime: "1 Action",
            range: "60 ft.",
            duration: "Instantaneous",
            components: "V, S",
            concentration: false,
            ritual: false,
            description: "You hurl a bubble of acid. A target takes 1d6 acid damage. Damage increases by 1d6 at 5th level, 11th level, and 17th level.",
            damageDice: "1d6",
            damageType: "Acid",
            damageScaling: [
                { level: 1, label: "Cantrip (Level 1–4)", dice: "1d6", modifier: "" },
                { level: 5, label: "5th Level (Level 5–10)", dice: "2d6", modifier: "" },
                { level: 11, label: "11th Level (Level 11–16)", dice: "3d6", modifier: "" },
                { level: 17, label: "17th Level (Level 17–20)", dice: "4d6", modifier: "" }
            ]
        };

        const eldritchBlastSpell: SpellDefinition = {
            id: 11,
            name: "Eldritch Blast",
            level: 0,
            school: "Evocation",
            source: "Warlock",
            castingTime: "1 Action",
            range: "120 ft.",
            duration: "Instantaneous",
            components: "V, S",
            concentration: false,
            ritual: false,
            description: "A beam of crackling energy streaks toward a creature within range. Two beams at 5th level, three at 11th level, four at 17th level.",
            damageDice: "1d10",
            damageType: "Force",
            damageModifier: "+4"
        };

        const level1Char = {
            level: 1,
            classes: [{ name: "Sorcerer", level: 1 }],
            spells: [acidSplashSpell, eldritchBlastSpell],
            actions: [
                {
                    name: "Acid Splash",
                    type: "Action",
                    rangeOrReach: "60 ft.",
                    hitOrDc: "DC 13 Dex Save",
                    damageOrEffect: "1d6 Acid",
                    notes: "Conjuration cantrip. Click to view full details.",
                    spellName: "Acid Splash"
                },
                {
                    name: "Eldritch Blast",
                    type: "Action",
                    rangeOrReach: "120 ft.",
                    hitOrDc: "+5 to hit",
                    damageOrEffect: "1d10 + 4 Force",
                    notes: "Evocation cantrip. Click to view full details.",
                    spellName: "Eldritch Blast"
                }
            ]
        } as unknown as CharacterData;

        // Level 1: unscaled base damage
        const resLv1Acid = resolveActionSpellDamage(level1Char.actions[0], level1Char);
        expect(resLv1Acid.damageOrEffect).toBe("1d6 Acid");
        expect(resLv1Acid.isScaled).toBe(false);

        const resLv1Eb = resolveActionSpellDamage(level1Char.actions[1], level1Char);
        expect(resLv1Eb.damageOrEffect).toBe("1d10 + 4 Force");
        expect(resLv1Eb.isScaled).toBe(false);

        const renderedLv1 = renderActions(level1Char);
        expect(renderedLv1).toContain("1d6 Acid");
        expect(renderedLv1).toContain("1d10 + 4 Force");
        expect(renderedLv1).not.toContain("action-scaling-badge");

        // Level 12 character (Darvell): 3d6 Acid and 3 beams Eldritch Blast
        const level12Char = {
            level: 12,
            classes: [{ name: "Warlock", level: 12 }],
            spells: [acidSplashSpell, eldritchBlastSpell],
            actions: [
                {
                    name: "Acid Splash",
                    type: "Action",
                    rangeOrReach: "60 ft.",
                    hitOrDc: "DC 16 Dex Save",
                    damageOrEffect: "1d6 Acid",
                    notes: "Conjuration cantrip. Click to view full details.",
                    spellName: "Acid Splash"
                },
                {
                    name: "Eldritch Blast",
                    type: "Action",
                    rangeOrReach: "120 ft.",
                    hitOrDc: "+8 to hit",
                    damageOrEffect: "1d10 + 4 Force",
                    notes: "Agonizing Blast adds CHA modifier to each beam.",
                    spellName: "Eldritch Blast"
                }
            ]
        } as unknown as CharacterData;

        const resLv12Acid = resolveActionSpellDamage(level12Char.actions[0], level12Char);
        expect(resLv12Acid.damageOrEffect).toBe("3d6 Acid");
        expect(resLv12Acid.isScaled).toBe(true);
        expect(resLv12Acid.scaledTierLabel).toBe("Level 11–16");

        const resLv12Eb = resolveActionSpellDamage(level12Char.actions[1], level12Char);
        expect(resLv12Eb.damageOrEffect).toBe("3 beams • 1d10 + 4 Force each");
        expect(resLv12Eb.isScaled).toBe(true);
        expect(resLv12Eb.scaledTierLabel).toBe("Level 11–16 (3 Beams)");

        const renderedLv12 = renderActions(level12Char);
        expect(renderedLv12).toContain("3d6 Acid");
        expect(renderedLv12).toContain("3 beams • 1d10 + 4 Force each");
        expect(renderedLv12).toContain('class="action-scaling-badge"');
        expect(renderedLv12).toContain("Level 11–16");

        // Level 17 character: 4d6 Acid and 4 beams Eldritch Blast
        const level17Char = {
            level: 17,
            classes: [{ name: "Warlock", level: 17 }],
            spells: [acidSplashSpell, eldritchBlastSpell],
            actions: level1Char.actions
        } as unknown as CharacterData;

        const resLv17Acid = resolveActionSpellDamage(level17Char.actions[0], level17Char);
        expect(resLv17Acid.damageOrEffect).toBe("4d6 Acid");
        expect(resLv17Acid.scaledTierLabel).toBe("Level 17–20");

        const resLv17Eb = resolveActionSpellDamage(level17Char.actions[1], level17Char);
        expect(resLv17Eb.damageOrEffect).toBe("4 beams • 1d10 + 4 Force each");
        expect(resLv17Eb.scaledTierLabel).toBe("Level 17–20 (4 Beams)");

        const renderedLv17 = renderActions(level17Char);
        expect(renderedLv17).toContain("4d6 Acid");
        expect(renderedLv17).toContain("4 beams • 1d10 + 4 Force each");
    });
});
