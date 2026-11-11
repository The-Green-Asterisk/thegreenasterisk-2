import { describe, expect, it } from "vitest";
import {
    extractSpellDamageInfo,
    getSpellDamageDisplay,
    getSpellDamageType,
    getSpellEffectDisplay,
    getSpellcastingModifier,
    hasScalingEffect,
    isHealingSpell,
    replaceModInString,
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
        expect(cardHtml).toContain('badge badge-damage');
        expect(cardHtml).toContain('damage-type-fire');
        expect(cardHtml).toContain("8d6 Fire");
        expect(cardHtml).toContain('meta-item meta-damage');
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

    it("correctly identifies damage types and healing spells", () => {
        expect(getSpellDamageType({ damageType: "Fire" })).toBe("Fire");
        expect(isHealingSpell({ damageType: "Fire" })).toBe(false);

        expect(getSpellDamageType({ damageType: "Healing" })).toBe("Healing");
        expect(isHealingSpell({ damageType: "Healing" })).toBe(true);

        expect(getSpellDamageType(null, "2d8+MOD Healing")).toBe("Healing");
        expect(isHealingSpell(null, "2d8+MOD Healing")).toBe(true);

        expect(getSpellDamageType(null, "8d6 Fire")).toBe("Fire");
        expect(isHealingSpell(null, "8d6 Fire")).toBe(false);

        expect(getSpellDamageType(null, "1d10 Force")).toBe("Force");
        expect(isHealingSpell(null, "1d10 Force")).toBe(false);

        const cureWounds = {
            name: "Cure Wounds",
            level: 1,
            description: "A creature you touch regains Hit Points equal to 2d8 plus your spellcasting ability modifier."
        };
        expect(getSpellDamageType(cureWounds)).toBe("Healing");
        expect(isHealingSpell(cureWounds)).toBe(true);
    });

    it("color-codes damage badges and changes icon to a heart for healing spells", () => {
        const healingSpell: SpellDefinition = {
            id: 20,
            name: "Cure Wounds",
            level: 1,
            school: "Abjuration",
            source: "Cleric",
            castingTime: "1 Action",
            range: "Touch",
            duration: "Instantaneous",
            components: "V, S",
            concentration: false,
            ritual: false,
            description: "A creature you touch regains Hit Points equal to 2d8 plus your spellcasting ability modifier.",
            damageDice: "2d8",
            damageModifier: "+MOD",
            damageType: "Healing"
        };

        const cardHtml = renderSpellCard(healingSpell);
        expect(cardHtml).toContain("badge-damage damage-type-healing");
        expect(cardHtml).toContain("meta-damage damage-type-healing");
        expect(cardHtml).toContain("damage-dice-value damage-type-healing");
        expect(cardHtml).toContain("fa-solid fa-heart");
        expect(cardHtml).not.toContain("fa-burst");
        expect(cardHtml).toContain('title="Healing: 2d8+MOD Healing"');
        expect(cardHtml).toContain('<span class="meta-label">Healing:</span>');
    });

    it("color-codes damage badges with damage-type class and burst icon for standard damage", () => {
        const fireCard = renderSpellCard(mockSpell);
        expect(fireCard).toContain("badge-damage damage-type-fire");
        expect(fireCard).toContain("meta-damage damage-type-fire");
        expect(fireCard).toContain("damage-dice-value damage-type-fire");
        expect(fireCard).toContain("fa-solid fa-burst");
        expect(fireCard).not.toContain("fa-heart");
        expect(fireCard).toContain('title="Damage: 8d6 Fire"');

        const acidCard = renderSpellCard(mockAcidSplash, 1);
        expect(acidCard).toContain("badge-damage damage-type-acid");
        expect(acidCard).toContain("meta-damage damage-type-acid");
        expect(acidCard).toContain("fa-solid fa-burst");
    });

    it("replaces +MOD with spellcasting modifier number in getSpellDamageDisplay", () => {
        const cureWounds: SpellDefinition = {
            id: 20,
            name: "Cure Wounds",
            level: 1,
            school: "Abjuration",
            source: "Cleric",
            castingTime: "1 Action",
            range: "Touch",
            duration: "Instantaneous",
            components: "V, S",
            concentration: false,
            ritual: false,
            description: "A creature you touch regains Hit Points equal to 2d8 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. Increases by 1d8 for each slot level above 1st.",
            damageDice: "2d8",
            damageModifier: "+MOD",
            damageType: "Healing",
            damageScaling: [
                { level: 1, label: "Level 1", dice: "2d8", modifier: "+MOD" },
                { level: 2, label: "Level 2", dice: "3d8", modifier: "+MOD" },
                { level: 3, label: "Level 3", dice: "4d8", modifier: "+MOD" }
            ]
        };

        // Positive modifier (+4)
        expect(getSpellDamageDisplay(cureWounds, 1, 1, 4)).toBe("2d8+4 Healing");
        // Zero modifier (+0)
        expect(getSpellDamageDisplay(cureWounds, 1, 1, 0)).toBe("2d8+0 Healing");
        // Negative modifier (-1)
        expect(getSpellDamageDisplay(cureWounds, 1, 1, -1)).toBe("2d8-1 Healing");
        // Upcast with modifier
        expect(getSpellDamageDisplay(cureWounds, 2, 1, 4)).toBe("3d8+4 Healing");
        expect(getSpellDamageDisplay(cureWounds, 3, 1, 4)).toBe("4d8+4 Healing");
        // Fallback without modifier retains +MOD
        expect(getSpellDamageDisplay(cureWounds)).toBe("2d8+MOD Healing");
    });

    it("extracts spellcasting modifier from character data and replaces +MOD on spell cards", () => {
        const cureWounds: SpellDefinition = {
            id: 20,
            name: "Cure Wounds",
            level: 1,
            school: "Abjuration",
            source: "Cleric",
            castingTime: "1 Action",
            range: "Touch",
            duration: "Instantaneous",
            components: "V, S",
            concentration: false,
            ritual: false,
            description: "A creature you touch regains Hit Points equal to 2d8 plus your spellcasting ability modifier.",
            damageDice: "2d8",
            damageModifier: "+MOD",
            damageType: "Healing"
        };

        const clericChar = {
            level: 5,
            classes: [{ name: "Cleric", level: 5 }],
            abilities: [
                { name: "Wisdom", abbr: "WIS", score: 18, modifier: 4 },
                { name: "Charisma", abbr: "CHA", score: 10, modifier: 0 }
            ],
            vitals: {
                spellcastingAbility: "Wisdom (+4)",
                spellAttackBonus: 7,
                proficiencyBonus: 3
            },
            spellSlots: {
                level1: { total: 4, label: "1st Level" },
                level2: { total: 3, label: "2nd Level" }
            },
            spells: [cureWounds]
        } as unknown as CharacterData;

        expect(getSpellcastingModifier(clericChar, cureWounds)).toBe(4);

        // Rendering spell card directly with character
        const cardHtml = renderSpellCard(cureWounds, 5, clericChar);
        expect(cardHtml).toContain("2d8+4 Healing");
        expect(cardHtml).not.toContain("+MOD");
        expect(cardHtml).toContain("fa-heart");

        // Rendering spell card with explicit modifier number
        const cardWithMod = renderSpellCard(cureWounds, 5, 5);
        expect(cardWithMod).toContain("2d8+5 Healing");

        // Rendering in renderSpellsByLevel replaces +MOD with the character's modifier
        const renderedSpells = renderSpellsByLevel([cureWounds], clericChar.spellSlots, clericChar);
        expect(renderedSpells).toContain("2d8+4 Healing");
        expect(renderedSpells).not.toContain("+MOD");
    });

    it("replaces MOD in replaceModInString for various formats and signs", () => {
        expect(replaceModInString("+MOD", 4)).toBe("+4");
        expect(replaceModInString("+ MOD", 4)).toBe("+ 4");
        expect(replaceModInString("-MOD", 4)).toBe("-4");
        expect(replaceModInString("-MOD", -2)).toBe("+2");
        expect(replaceModInString("+MOD", -2)).toBe("-2");
        expect(replaceModInString("+MOD", 0)).toBe("+0");
        expect(replaceModInString("MOD", 3)).toBe("+3");
        expect(replaceModInString("2d8 + MOD Healing", 4)).toBe("2d8 + 4 Healing");
        expect(replaceModInString("1d4+MOD", 5)).toBe("1d4+5");
    });

    it("extracts scaling effect for extra targets from Tasha's Hideous Laughter", () => {
        const tashas = {
            name: "Tasha's Hideous Laughter",
            level: 1,
            description: "A creature of your choice within range perceives everything as humorously comical and must succeed on a Wisdom saving throw or fall Prone, becoming Incapacitated with laughter for the duration.\n\nUsing a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1. The creatures must be within 30 feet of each other when you target them."
        };

        const info = extractSpellDamageInfo(tashas);
        expect(info.damageScaling).toBeDefined();
        expect(info.damageScaling?.length).toBe(9); // Level 1 through 9
        expect(info.damageScaling?.[0]).toEqual({
            level: 1,
            label: "Level 1",
            dice: "",
            modifier: "",
            effect: "1 target"
        });
        expect(info.damageScaling?.[1]).toEqual({
            level: 2,
            label: "Level 2",
            dice: "",
            modifier: "",
            effect: "2 targets"
        });
        expect(info.damageScaling?.[2]).toEqual({
            level: 3,
            label: "Level 3",
            dice: "",
            modifier: "",
            effect: "3 targets"
        });

        expect(hasScalingEffect(tashas)).toBe(true);
        expect(getSpellEffectDisplay(tashas, 1)).toBe("1 target");
        expect(getSpellEffectDisplay(tashas, 2)).toBe("2 targets");
        expect(getSpellEffectDisplay(tashas, 4)).toBe("4 targets");
    });

    it("extracts scaling effect for radius increase from Confusion", () => {
        const confusion = {
            name: "Confusion",
            level: 4,
            description: "This spell assaults and warps creatures' minds, spawning delusions and uncontrolled actions. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it.\n\nUsing a Higher-Level Spell Slot. When you cast this spell using a spell slot of 5th level or higher, the radius of the sphere increases by 5 feet for each slot level above 4th."
        };

        const info = extractSpellDamageInfo(confusion);
        expect(info.damageScaling).toBeDefined();
        expect(info.damageScaling?.length).toBe(6); // Levels 4 through 9
        expect(info.damageScaling?.[0].effect).toBe("10 ft. radius");
        expect(info.damageScaling?.[1].effect).toBe("15 ft. radius");
        expect(info.damageScaling?.[2].effect).toBe("20 ft. radius");

        expect(hasScalingEffect(confusion)).toBe(true);
        expect(getSpellEffectDisplay(confusion, 4)).toBe("10 ft. radius");
        expect(getSpellEffectDisplay(confusion, 5)).toBe("15 ft. radius");
        expect(getSpellEffectDisplay(confusion, 6)).toBe("20 ft. radius");
    });

    it("renders effect badges in renderSpellCard and duplicates upcast cards in renderSpellsByLevel", () => {
        const tashas: SpellDefinition = {
            name: "Tasha's Hideous Laughter",
            level: 1,
            school: "Enchantment",
            castingTime: "1 action",
            range: "30 feet",
            duration: "Concentration, up to 1 minute",
            components: "V, S, M",
            concentration: true,
            ritual: false,
            description: "A creature of your choice within range perceives everything as humorously comical and must succeed on a Wisdom saving throw or fall Prone, becoming Incapacitated with laughter for the duration.\n\nUsing a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1. The creatures must be within 30 feet of each other when you target them.",
            damageScaling: [
                { level: 1, label: "Level 1", dice: "", modifier: "", effect: "1 target" },
                { level: 2, label: "Level 2", dice: "", modifier: "", effect: "2 targets" },
                { level: 3, label: "Level 3", dice: "", modifier: "", effect: "3 targets" }
            ]
        };

        const cardLevel1 = renderSpellCard({ ...tashas, castAtLevel: 1 }, 5);
        expect(cardLevel1).toContain("badge-effect");
        expect(cardLevel1).toContain("1 target");
        expect(cardLevel1).toContain("meta-effect");

        const cardLevel2 = renderSpellCard({ ...tashas, castAtLevel: 2 }, 5);
        expect(cardLevel2).toContain("badge-effect");
        expect(cardLevel2).toContain("2 targets");

        const mockSlots = {
            level1: { total: 4, label: "1st Level" },
            level2: { total: 3, label: "2nd Level" }
        };

        const groupedHtml = renderSpellsByLevel([tashas], mockSlots);
        // Should appear under 1st Level with 1 target and under 2nd Level with 2 targets
        expect(groupedHtml).toContain("1st-Level Spells");
        expect(groupedHtml).toContain("2nd-Level Spells");
        expect(groupedHtml).toContain("1 target");
        expect(groupedHtml).toContain("2 targets");
    });

    it("parses embedded custom spell scaling block with effects", () => {
        const customSpell = {
            name: "Binding Shackle",
            level: 2,
            description: `<p>A chain of psychic energy.</p>
<div class="spell-damage-scaling-block">
    <div class="spell-scaling-table-container">
        <table class="spell-scaling-table">
            <thead>
                <tr><th>Casting Level</th><th>Damage Dice</th><th>Modifier</th><th>Scaling Effect</th><th>Total Damage</th></tr>
            </thead>
            <tbody>
                <tr><td>Level 2</td><td>2d6</td><td>+0</td><td>1 creature</td><td>2d6 Force</td></tr>
                <tr><td>Level 3</td><td>2d6</td><td>+0</td><td>2 creatures</td><td>2d6 Force</td></tr>
                <tr><td>Level 4</td><td>2d6</td><td>+0</td><td>3 creatures</td><td>2d6 Force</td></tr>
            </tbody>
        </table>
    </div>
</div>`
        };

        const info = extractSpellDamageInfo(customSpell);
        expect(info.damageDice).toBe("2d6");
        expect(info.damageScaling?.length).toBe(3);
        expect(info.damageScaling?.[0].effect).toBe("1 creature");
        expect(info.damageScaling?.[1].effect).toBe("2 creatures");
        expect(info.damageScaling?.[2].effect).toBe("3 creatures");
        expect(getSpellEffectDisplay(customSpell, 3)).toBe("2 creatures");
    });
});
