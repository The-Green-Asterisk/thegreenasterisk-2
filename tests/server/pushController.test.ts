import http from 'http';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRepository } = vi.hoisted(() => ({
    mockRepository: {
        findOneBy: vi.fn(),
        findBy: vi.fn(),
        create: vi.fn((data: any) => data),
        save: vi.fn(),
        delete: vi.fn(),
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

import PushController from '../../server/controllers/pushController';
import SessionController from '../../server/controllers/sessionController';

function createMockRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
}): http.IncomingMessage {
    const stream = new Readable();
    if (options.body !== undefined) {
        stream.push(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    stream.push(null);
    const req = stream as unknown as http.IncomingMessage;
    req.method = options.method || 'GET';
    req.url = options.url || '/';
    req.headers = options.headers || {};
    return req;
}

describe('PushController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.VAPID_PUBLIC_KEY;
    });

    describe('getPushKey', () => {
        it('returns 503 if push notifications are not configured', async () => {
            const req = createMockRequest({});
            const res = {} as http.ServerResponse;

            const response = await PushController.getPushKey(req, res);
            expect(response.status).toBe(503);
            expect(JSON.parse(response.response)).toBe('Push notifications are not configured');
        });

        it('returns 200 with public key for non-admin users when configured', async () => {
            process.env.VAPID_PUBLIC_KEY = 'test-vapid-public-key-123';
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);

            const req = createMockRequest({});
            const res = {} as http.ServerResponse;

            const response = await PushController.getPushKey(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('test-vapid-public-key-123');
        });
    });

    describe('saveSubscription', () => {
        const validSubscription = {
            endpoint: 'https://fcm.googleapis.com/fcm/send/sample-token',
            keys: {
                p256dh: 'sample-p256dh-key',
                auth: 'sample-auth-key'
            }
        };

        it('returns 400 for invalid subscription shape', async () => {
            const req = createMockRequest({
                body: { endpoint: 'not-an-https-url', keys: {} }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(400);
            expect(JSON.parse(response.response)).toBe('Invalid subscription');
        });

        it('returns 400 for invalid subscription type', async () => {
            const req = createMockRequest({
                body: {
                    ...validSubscription,
                    type: 'invalid type with spaces!'
                }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(400);
            expect(JSON.parse(response.response)).toBe('Invalid subscription');
        });

        it('returns 401 when non-admin subscribes to PR Digest', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 2, isAdmin: false } as any);
            const req = createMockRequest({
                body: { ...validSubscription, type: 'pr-digest' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(401);
            expect(JSON.parse(response.response)).toBe('Unauthorized');
        });

        it('returns 401 when unauthenticated user subscribes to default (pr-digest) subscription', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            const req = createMockRequest({
                body: validSubscription
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(401);
            expect(JSON.parse(response.response)).toBe('Unauthorized');
        });

        it('allows admin to save PR Digest subscription and updates existing record', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 1, isAdmin: true } as any);
            mockRepository.findOneBy.mockResolvedValueOnce({ id: 10, endpoint: validSubscription.endpoint, type: 'pr-digest' });
            mockRepository.save.mockResolvedValueOnce({});

            const req = createMockRequest({
                body: { ...validSubscription, type: 'pr-digest' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Saved');
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({
                endpoint: validSubscription.endpoint,
                type: 'pr-digest'
            });
            expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: 10,
                endpoint: validSubscription.endpoint,
                type: 'pr-digest',
                user: { id: 1 }
            }));
        });

        it('allows non-admin to save episode notifications subscription', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockRepository.findOneBy.mockResolvedValueOnce(null);
            mockRepository.save.mockResolvedValueOnce({});

            const req = createMockRequest({
                body: { ...validSubscription, type: 'episodes' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Saved');
            expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                id: undefined,
                endpoint: validSubscription.endpoint,
                type: 'episodes',
                user: { id: 5 }
            }));
        });

        it('allows unauthenticated guest to save episode notifications subscription', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            mockRepository.findOneBy.mockResolvedValueOnce(null);
            mockRepository.save.mockResolvedValueOnce({});

            const req = createMockRequest({
                body: { ...validSubscription, type: 'episodes' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.saveSubscription(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Saved');
            expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                endpoint: validSubscription.endpoint,
                type: 'episodes',
                user: null
            }));
        });
    });

    describe('deleteSubscription', () => {
        const validEndpoint = 'https://fcm.googleapis.com/fcm/send/sample-token';

        it('returns 400 for invalid endpoint', async () => {
            const req = createMockRequest({
                body: { endpoint: 'not-valid' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.deleteSubscription(req, res);
            expect(response.status).toBe(400);
            expect(JSON.parse(response.response)).toBe('Invalid subscription');
        });

        it('returns 401 when non-admin attempts to delete PR Digest subscription', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 2, isAdmin: false } as any);
            const req = createMockRequest({
                body: { endpoint: validEndpoint, type: 'pr-digest' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.deleteSubscription(req, res);
            expect(response.status).toBe(401);
            expect(JSON.parse(response.response)).toBe('Unauthorized');
        });

        it('allows admin to delete PR Digest subscription by type', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 1, isAdmin: true } as any);
            mockRepository.delete.mockResolvedValueOnce({});

            const req = createMockRequest({
                body: { endpoint: validEndpoint, type: 'pr-digest' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.deleteSubscription(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Deleted');
            expect(mockRepository.delete).toHaveBeenCalledWith({
                endpoint: validEndpoint,
                type: 'pr-digest'
            });
        });

        it('allows non-admin to delete episode subscription by type', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 3, isAdmin: false } as any);
            mockRepository.delete.mockResolvedValueOnce({});

            const req = createMockRequest({
                body: { endpoint: validEndpoint, type: 'episodes' }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.deleteSubscription(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Deleted');
            expect(mockRepository.delete).toHaveBeenCalledWith({
                endpoint: validEndpoint,
                type: 'episodes'
            });
        });

        it('non-admin deleting without type only deletes non-admin subscriptions', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 3, isAdmin: false } as any);
            mockRepository.findBy.mockResolvedValueOnce([
                { id: 1, type: 'pr-digest' },
                { id: 2, type: 'episodes' }
            ]);
            mockRepository.delete.mockResolvedValueOnce({});

            const req = createMockRequest({
                body: { endpoint: validEndpoint }
            });
            const res = {} as http.ServerResponse;

            const response = await PushController.deleteSubscription(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Deleted');
            expect(mockRepository.delete).toHaveBeenCalledWith([2]);
        });
    });
});
