import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRepository, mockWebPush } = vi.hoisted(() => ({
    mockRepository: {
        find: vi.fn(),
        delete: vi.fn(),
    },
    mockWebPush: {
        setVapidDetails: vi.fn(),
        sendNotification: vi.fn(),
    }
}));

vi.mock('services/database', () => ({
    default: {
        getRepository: vi.fn(() => mockRepository),
    },
    AppDataSource: {
        getRepository: vi.fn(() => mockRepository),
    }
}));

vi.mock('web-push', () => ({
    default: mockWebPush,
}));

import PushService, { PushNotification } from '../../server/services/push';

describe('PushService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.VAPID_SUBJECT = 'mailto:admin@example.com';
        process.env.VAPID_PUBLIC_KEY = 'public-key';
        process.env.VAPID_PRIVATE_KEY = 'private-key';
    });

    const sampleNotification: PushNotification = {
        title: 'New PR Alert',
        body: 'PR #10 needs review',
        tag: 'pr-10',
        url: '/pr-digest',
        urgency: 'high'
    };

    it('does nothing if notifications array is empty', async () => {
        await PushService.sendToSubscribers('pr-digest', []);
        expect(mockWebPush.sendNotification).not.toHaveBeenCalled();
    });

    it('does nothing if VAPID keys are missing', async () => {
        delete process.env.VAPID_PUBLIC_KEY;
        await PushService.sendToSubscribers('pr-digest', [sampleNotification]);
        expect(mockWebPush.sendNotification).not.toHaveBeenCalled();
    });

    it('sendToAdmins sends only to admin subscribers of pr-digest', async () => {
        mockRepository.find.mockResolvedValueOnce([
            {
                id: 1,
                endpoint: 'https://push1',
                p256dh: 'key1',
                auth: 'auth1',
                type: 'pr-digest',
                user: { isAdmin: true }
            },
            {
                id: 2,
                endpoint: 'https://push2',
                p256dh: 'key2',
                auth: 'auth2',
                type: 'pr-digest',
                user: { isAdmin: false }
            }
        ]);
        mockWebPush.sendNotification.mockResolvedValue(undefined);

        await PushService.sendToAdmins([sampleNotification]);

        expect(mockRepository.find).toHaveBeenCalledWith({
            where: { type: 'pr-digest' },
            relations: { user: true }
        });
        expect(mockWebPush.sendNotification).toHaveBeenCalledTimes(1);
        expect(mockWebPush.sendNotification).toHaveBeenCalledWith(
            { endpoint: 'https://push1', keys: { p256dh: 'key1', auth: 'auth1' } },
            expect.any(String),
            expect.objectContaining({ urgency: 'high' })
        );
    });

    it('sendToType sends to all subscribers of that type regardless of admin status', async () => {
        mockRepository.find.mockResolvedValueOnce([
            {
                id: 1,
                endpoint: 'https://push1',
                p256dh: 'key1',
                auth: 'auth1',
                type: 'episodes',
                user: { isAdmin: true }
            },
            {
                id: 2,
                endpoint: 'https://push2',
                p256dh: 'key2',
                auth: 'auth2',
                type: 'episodes',
                user: null
            }
        ]);
        mockWebPush.sendNotification.mockResolvedValue(undefined);

        await PushService.sendToType('episodes', [sampleNotification]);

        expect(mockRepository.find).toHaveBeenCalledWith({
            where: { type: 'episodes' },
            relations: { user: true }
        });
        expect(mockWebPush.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('sendToUser sends to all devices belonging to the specified user', async () => {
        mockRepository.find.mockResolvedValueOnce([
            {
                id: 1,
                endpoint: 'https://phone',
                p256dh: 'k1',
                auth: 'a1',
                type: 'videos',
                user: { id: 42, isAdmin: false }
            },
            {
                id: 2,
                endpoint: 'https://laptop',
                p256dh: 'k2',
                auth: 'a2',
                type: 'videos',
                user: { id: 42, isAdmin: false }
            }
        ]);
        mockWebPush.sendNotification.mockResolvedValue(undefined);

        await PushService.sendToUser(42, [sampleNotification], 'videos');

        expect(mockRepository.find).toHaveBeenCalledWith({
            where: { user: { id: 42 }, type: 'videos' },
            relations: { user: true }
        });
        expect(mockWebPush.sendNotification).toHaveBeenCalledTimes(2);
        expect(mockWebPush.sendNotification).toHaveBeenCalledWith(
            { endpoint: 'https://phone', keys: { p256dh: 'k1', auth: 'a1' } },
            expect.any(String),
            expect.anything()
        );
        expect(mockWebPush.sendNotification).toHaveBeenCalledWith(
            { endpoint: 'https://laptop', keys: { p256dh: 'k2', auth: 'a2' } },
            expect.any(String),
            expect.anything()
        );
    });

    it('sendToUser without type sends to all devices for that user across all types', async () => {
        mockRepository.find.mockResolvedValueOnce([
            {
                id: 1,
                endpoint: 'https://phone',
                p256dh: 'k1',
                auth: 'a1',
                type: 'videos',
                user: { id: 42, isAdmin: false }
            }
        ]);
        mockWebPush.sendNotification.mockResolvedValue(undefined);

        await PushService.sendToUser(42, [sampleNotification]);

        expect(mockRepository.find).toHaveBeenCalledWith({
            where: { user: { id: 42 } },
            relations: { user: true }
        });
        expect(mockWebPush.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('deletes subscriber if webPush returns 404 or 410', async () => {
        mockRepository.find.mockResolvedValueOnce([
            {
                id: 99,
                endpoint: 'https://push-expired',
                p256dh: 'key',
                auth: 'auth',
                type: 'episodes',
                user: null
            }
        ]);
        mockWebPush.sendNotification.mockRejectedValueOnce({ statusCode: 410 });

        await PushService.sendToType('episodes', [sampleNotification]);

        expect(mockRepository.delete).toHaveBeenCalledWith(99);
    });
});
