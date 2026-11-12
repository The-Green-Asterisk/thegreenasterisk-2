import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../../../src/services/escape';

const HOSTILE = '<img src=x onerror="alert(1)">';
const RAW = /<img src=x onerror/;

describe('escapeHtml', () => {
    it('escapes everything that can start a tag or close an attribute', () => {
        expect(escapeHtml(`a & b <i>"q" 'p'</i>`)).toBe('a &amp; b &lt;i&gt;&quot;q&quot; &#39;p&#39;&lt;/i&gt;');
    });

    it('turns null and undefined into an empty string and stringifies numbers', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
        expect(escapeHtml(3)).toBe('3');
    });
});

describe('sheet templates escape plain text', () => {
    async function hostileCharacter() {
        const { darvellData } = await import('../../../src/views/characterSheet/characterData');
        const c: any = JSON.parse(JSON.stringify(darvellData));
        c.name = `Darvell ${HOSTILE}`;
        c.race = `Elf ${HOSTILE}`;
        if (c.weapons?.[0]) c.weapons[0].name = `Dagger ${HOSTILE}`;
        if (c.equipment?.[0]) c.equipment[0].name = `Rope ${HOSTILE}`;
        if (c.spells?.[0]) { c.spells[0].name = `Shield ${HOSTILE}`; c.spells[0].school = `Abjuration ${HOSTILE}`; }
        return c;
    }

    it('weapons, equipment, and the hero header show hostile names as text', async () => {
        const c = await hostileCharacter();
        const { renderWeapons } = await import('../../../src/views/characterSheet/components/weapons');
        const { renderEquipment } = await import('../../../src/views/characterSheet/components/equipment');
        const { renderHeroSection } = await import('../../../src/views/characterSheet/components/hero');
        for (const html of [renderWeapons(c), renderEquipment(c), renderHeroSection(c)]) {
            expect(html).not.toMatch(RAW);
        }
        expect(renderWeapons(c)).toContain('Dagger &lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
        expect(renderHeroSection(c)).toContain('&lt;img src=x');
    });

    it('spell cards show hostile names and schools as text', async () => {
        const c = await hostileCharacter();
        const { renderSpellsByLevel } = await import('../../../src/views/characterSheet/components/spells');
        const html = renderSpellsByLevel(c.spells, c.spellSlots, c);
        expect(html).not.toMatch(RAW);
        expect(html).toContain('Shield &lt;img');
    });

    it('uses trackers escape their label in aria-labels', async () => {
        const { renderUsesTracker } = await import('../../../src/views/characterSheet/components/usesTracker');
        const html = renderUsesTracker(`Wand ${HOSTILE}`, 'k', 2, 'long');
        expect(html).not.toMatch(RAW);
        expect(html).toContain('aria-label="Wand &lt;img src=x onerror=&quot;alert(1)&quot;&gt; uses"');
    });
});
