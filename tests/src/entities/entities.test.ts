import { describe, expect, it } from 'vitest';
import entities, {
    Category,
    Comment,
    Segment,
    Stat,
    Tag,
    User,
    World,
    WorldEntity,
    YouTubeVideo
} from '../../../src/entities';
import Link from '../../../src/entities/Link';
import PrDigest from '../../../src/entities/PrDigest';

describe('Frontend Entities', () => {
    it('exports all entity classes in default entities map', () => {
        expect(entities.User).toBe(User);
        expect(entities.Tag).toBe(Tag);
        expect(entities.YouTubeVideo).toBe(YouTubeVideo);
        expect(entities.Category).toBe(Category);
        expect(entities.World).toBe(World);
        expect(entities.WorldEntity).toBe(WorldEntity);
        expect(entities.Segment).toBe(Segment);
        expect(entities.Comment).toBe(Comment);
        expect(entities.Stat).toBe(Stat);
    });

    it('instantiates PrDigest with structured alerts', () => {
        const digest = new PrDigest(
            '2026-10-23T12:00:00Z',
            [
                {
                    section: 'red',
                    repo: 'core-app',
                    number: 101,
                    url: 'https://github.com/org/core-app/pull/101',
                    tickets: ['PROV-999'],
                    owners: ['ABC'],
                    draft: false,
                    status: 'Changes requested',
                    events: [
                        {
                            at: '2026-10-23T11:50:00Z',
                            actor: 'XYZ',
                            action: 'requested changes'
                        }
                    ]
                }
            ],
            'https://jira.org'
        );

        expect(digest.checkedAt).toBe('2026-10-23T12:00:00Z');
        expect(digest.prs).toHaveLength(1);
        expect(digest.prs[0].section).toBe('red');
        expect(digest.jiraUrl).toBe('https://jira.org');
    });

    it('instantiates and populates User and Link models', () => {
        const user = new User();
        user.id = 1;
        user.username = 'dm';
        user.firstName = 'Dungeon';
        user.lastName = 'Master';
        user.isAdmin = true;

        expect(user.id).toBe(1);
        expect(user.username).toBe('dm');
        expect(user.isAdmin).toBe(true);

        const link = new Link(
            'https://discord.gg/example',
            'fab fa-discord',
            '/storage/images/discord.png',
            'Discord',
            true,
            1
        );

        expect(link.url).toBe('https://discord.gg/example');
        expect(link.text).toBe('Discord');
        expect(link.sortOrder).toBe(1);
    });
});
