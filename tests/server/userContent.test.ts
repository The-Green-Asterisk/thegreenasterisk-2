import { describe, expect, it } from 'vitest';
import { UserContentSubscriber } from '../../server/services/database/userContentSubscriber';
import {
    sanitizeCharacterPayload,
    sanitizePlainText,
    sanitizeRichText,
    sanitizeUrl,
    sanitizeUserContent
} from '../../server/services/userContent';

const ATTACK = '<img src=x onerror=alert(1)><script>alert(2)</script><a href="javascript:alert(3)">x</a><p onclick="alert(4)">y</p><svg onload=alert(5)></svg><iframe src="/"></iframe>';

describe('sanitizeRichText', () => {
    it('leaves description placeholders and markup tags exactly as written', () => {
        const text = '<p>DC {{savedc:cha}}, {{(classlevel/2)@rounddown}}, {{((classlevel-1)/7)@rounddown,min:1}}, '
            + '{{(13+modifier:wis)#unsigned}}, {{modifier:str+proficiency}}</p>'
            + '<p>Target falls [condition]Prone[/condition]; cast [spell]Fireball[/spell] with [rule]Advantage[/rule], '
            + '[item]Rope, Hempen (50 feet)[/item], [feat]Alert[/feat], [action]Dash[/action], [custom-tag]x[/custom-tag]</p>';
        expect(sanitizeRichText(text)).toBe(text);
    });

    it('keeps formatting, classes, tables, and D&D Beyond links', () => {
        const text = '<p><strong class="legacy-badge">[Legacy]</strong> <em>pre-2024</em></p>'
            + '<table><thead><tr><th colspan="2">Level</th></tr></thead><tbody><tr><td>1</td><td>2d6</td></tr></tbody></table>'
            + '<ul><li><b>a</b></li></ul><a href="https://www.dndbeyond.com/spells/fireball" class="tooltip-hover">Fireball</a>'
            + '<a href="/spells/fireball">fireball</a><h3>Heading</h3>';
        expect(sanitizeRichText(text)).toBe(text);
        expect(sanitizeRichText('<p>a<br>b</p>')).toBe('<p>a<br />b</p>');
    });

    it('removes scripts, handlers, script URLs, and unlisted tags', () => {
        const out = sanitizeRichText(ATTACK);
        expect(out).not.toMatch(/onerror|onclick|onload|<script|javascript:|<svg|<iframe|alert\(2\)/i);
        expect(out).toContain('<p>y</p>');
    });

    it("doesn't turn & or > into entities, so the edit dialogs show what was typed", () => {
        expect(sanitizeRichText('<p>Sword & Board, HP > 0</p>')).toBe('<p>Sword & Board, HP > 0</p>');
    });

    it('keeps a bare < escaped so it cannot start a tag', () => {
        expect(sanitizeRichText('<p>1 < 2</p>')).toBe('<p>1 &lt; 2</p>');
        expect(sanitizeRichText('x<<script>a</script>p onmouseover=1>z')).not.toMatch(/<p onmouseover/);
    });

    it('is stable when run again', () => {
        const once = sanitizeRichText(`<p>A & B &amp; C &lt; D</p>${ATTACK}`);
        expect(sanitizeRichText(once)).toBe(once);
    });

    it('returns text without < and non-strings untouched', () => {
        expect(sanitizeRichText('plain & simple {{scalevalue}}')).toBe('plain & simple {{scalevalue}}');
        expect(sanitizeRichText(null)).toBeNull();
        expect(sanitizeRichText(undefined)).toBeUndefined();
    });
});

describe('sanitizePlainText', () => {
    it('removes every tag, including an unclosed one', () => {
        expect(sanitizePlainText('Fire<b>ball</b>')).toBe('Fireball');
        expect(sanitizePlainText('<em onmouseover=1>Homebrew</em>')).toBe('Homebrew');
        expect(sanitizePlainText('Homebrew<img src=x onerror=alert(1)')).toBe('Homebrew');
    });

    it('leaves &, quotes, and dice text alone', () => {
        expect(sanitizePlainText(`Tenser's "Floating" Disk & 1d8 + 3`)).toBe(`Tenser's "Floating" Disk & 1d8 + 3`);
    });
});

describe('sanitizeUrl', () => {
    it('keeps http(s) and root-relative URLs', () => {
        expect(sanitizeUrl('https://res.cloudinary.com/x/image/upload/v1/spells/a.png')).toBe('https://res.cloudinary.com/x/image/upload/v1/spells/a.png');
        expect(sanitizeUrl('https://cdn.discordapp.com/avatars/1/abc.png')).toBe('https://cdn.discordapp.com/avatars/1/abc.png');
        expect(sanitizeUrl('/storage/images/a.png')).toBe('/storage/images/a.png');
    });

    it('blanks script URLs and anything that could close an attribute', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBe('');
        expect(sanitizeUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBe('');
        expect(sanitizeUrl('https://x.test/a.png" onerror="alert(1)')).toBe('');
        expect(sanitizeUrl('')).toBe('');
        expect(sanitizeUrl(null)).toBeNull();
    });
});

describe('sanitizeCharacterPayload', () => {
    it('cleans copied spell, item, and feature fields at any depth and keeps the rest', () => {
        const payload = JSON.stringify({
            name: 'Hero<script>x</script>',
            spells: [{ name: 'Fire<b>ball</b>', source: '<i onclick=1>Wizard</i>', description: `<p>DC {{savedc:int}}</p>${ATTACK}` }],
            inventory: { weapons: [{ name: 'Sword', notes: '<p onclick="x">sharp</p>', damage: '1d8 + 3' }] },
            features: [{ description: '<p>[condition]Prone[/condition]</p>' }],
            vitals: { currentHp: 12 }
        });
        const out = JSON.parse(sanitizeCharacterPayload(payload));
        expect(out.name).toBe('Herox');
        expect(out.spells[0].name).toBe('Fireball');
        expect(out.spells[0].source).toBe('Wizard');
        expect(out.spells[0].description).toContain('<p>DC {{savedc:int}}</p>');
        expect(out.spells[0].description).not.toMatch(/onerror|<script/);
        expect(out.inventory.weapons[0].notes).toBe('<p>sharp</p>');
        expect(out.inventory.weapons[0].damage).toBe('1d8 + 3');
        expect(out.features[0].description).toBe('<p>[condition]Prone[/condition]</p>');
        expect(out.vitals.currentHp).toBe(12);
    });

    it('returns payloads without < and payloads that are not JSON unchanged', () => {
        const clean = '{"name": "Hero",  "spells": []}';
        expect(sanitizeCharacterPayload(clean)).toBe(clean);
        expect(sanitizeCharacterPayload('not json <b>')).toBe('not json <b>');
    });
});

describe('sanitizeUserContent', () => {
    it('applies each entity\'s rules and reports whether anything changed', () => {
        const spell: Record<string, unknown> = {
            name: 'Fire<b>ball</b>', source: '<em onmouseover=1>Homebrew</em>', description: ATTACK,
            imageUrl: 'javascript:alert(1)', lockedFields: '["<keep>"]', level: 3
        };
        expect(sanitizeUserContent('Spell', spell)).toBe(true);
        expect(spell.name).toBe('Fireball');
        expect(spell.source).toBe('Homebrew');
        expect(spell.description).not.toMatch(/onerror|<script/);
        expect(spell.imageUrl).toBe('');
        expect(spell.lockedFields).toBe('["<keep>"]');
        expect(spell.level).toBe(3);
        expect(sanitizeUserContent('Spell', spell)).toBe(false);
    });

    it('covers comments, profiles, items, and character copies', () => {
        const comment: Record<string, unknown> = { content: `<b>hi</b>${ATTACK}` };
        const user: Record<string, unknown> = { firstName: '<img src=x onerror=1>Ann', lastName: 'Lee', profilePicture: 'x" onerror="1' };
        const item: Record<string, unknown> = { name: 'Rope<script>', description: ATTACK, imageUrl: 'https://x.test/r.png' };
        const copy: Record<string, unknown> = { masteryDescription: ATTACK, attackBonus: '+5' };
        sanitizeUserContent('Comment', comment);
        sanitizeUserContent('User', user);
        sanitizeUserContent('Item', item);
        sanitizeUserContent('CharacterInventoryItem', copy);
        expect(comment.content).toMatch(/^<b>hi<\/b>/);
        expect(comment.content).not.toMatch(/onerror/);
        expect(user).toEqual({ firstName: 'Ann', lastName: 'Lee', profilePicture: '' });
        expect(item.name).toBe('Rope');
        expect(item.imageUrl).toBe('https://x.test/r.png');
        expect(copy.masteryDescription).not.toMatch(/onerror/);
        expect(copy.attackBonus).toBe('+5');
    });

    it('ignores entities it has no rules for and empty rows', () => {
        const link = { text: '<b>admin link</b>' };
        expect(sanitizeUserContent('Link', link)).toBe(false);
        expect(link.text).toBe('<b>admin link</b>');
        expect(sanitizeUserContent('Spell', undefined)).toBe(false);
    });
});

describe('UserContentSubscriber', () => {
    const subscriber = new UserContentSubscriber();
    const metadata = (targetName: string) => ({ targetName }) as any;

    it('cleans rows before insert and update', () => {
        const inserted = { content: ATTACK };
        subscriber.beforeInsert({ metadata: metadata('Comment'), entity: inserted } as any);
        expect(inserted.content).not.toMatch(/onerror|<script/);

        const updated = { description: ATTACK };
        subscriber.beforeUpdate({ metadata: metadata('Spell'), entity: updated } as any);
        expect(updated.description).not.toMatch(/onerror|<script/);

        expect(() => subscriber.beforeUpdate({ metadata: metadata('Spell'), entity: undefined } as any)).not.toThrow();
    });

    it('cleans rows as they load, by event metadata or by class name', () => {
        const loaded = { content: ATTACK };
        subscriber.afterLoad(loaded, { metadata: metadata('Comment') });
        expect(loaded.content).not.toMatch(/onerror|<script/);

        class Comment { content = ATTACK; }
        const instance = new Comment();
        subscriber.afterLoad(instance);
        expect(instance.content).not.toMatch(/onerror|<script/);
    });
});
