import http from 'http';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRepository, mockPushService } = vi.hoisted(() => ({
    mockRepository: {
        findOneBy: vi.fn(),
        create: vi.fn((data: any) => data),
        save: vi.fn(),
    },
    mockPushService: {
        sendToAdmins: vi.fn().mockResolvedValue(undefined),
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

vi.mock('services/push', () => ({
    default: mockPushService,
}));

import PrDigestController from '../../server/controllers/prDigestController';
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

describe('PrDigestController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.PR_DIGEST_TOKEN = 'test-token-secret-123';
    });

    describe('getDigest', () => {
        it('returns 401 Unauthorized if user is not an admin', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            const req = createMockRequest({});
            const res = {} as http.ServerResponse;

            const response = await PrDigestController.getDigest(req, res);
            expect(response.status).toBe(401);
            expect(JSON.parse(response.response)).toBe('Unauthorized');
        });

        it('returns 404 if no digest is stored', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            mockRepository.findOneBy.mockResolvedValueOnce(null);

            const req = createMockRequest({});
            const res = {} as http.ServerResponse;

            const response = await PrDigestController.getDigest(req, res);
            expect(response.status).toBe(404);
            expect(JSON.parse(response.response)).toBe('No digest yet');
        });

        it('returns 200 with stored payload when digest exists and user is admin', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            const payload = JSON.stringify({ checkedAt: new Date().toISOString(), prs: [] });
            mockRepository.findOneBy.mockResolvedValueOnce({ id: 1, payload });

            const req = createMockRequest({});
            const res = {} as http.ServerResponse;

            const response = await PrDigestController.getDigest(req, res);
            expect(response.status).toBe(200);
            expect(response.response).toBe(payload);
        });
    });

    describe('saveDigest', () => {
        it('returns 401 Unauthorized if token is missing or incorrect', async () => {
            const req = createMockRequest({
                headers: { 'x-pr-digest-token': 'wrong-token' },
                body: { checkedAt: new Date().toISOString(), prs: [] }
            });
            const res = {} as http.ServerResponse;

            const response = await PrDigestController.saveDigest(req, res);
            expect(response.status).toBe(401);
            expect(JSON.parse(response.response)).toBe('Unauthorized');
        });

        it('returns 400 for invalid digest shape', async () => {
            const req = createMockRequest({
                headers: { 'x-pr-digest-token': 'test-token-secret-123' },
                body: { checkedAt: 'invalid-date', prs: 'not-an-array' }
            });
            const res = {} as http.ServerResponse;

            const response = await PrDigestController.saveDigest(req, res);
            expect(response.status).toBe(400);
            expect(JSON.parse(response.response)).toBe('Invalid digest');
        });

        it('saves valid digest, sends alerts, and returns 200', async () => {
            const validBody = {
                checkedAt: new Date().toISOString(),
                jiraUrl: 'https://jira.example.com',
                prs: [
                    {
                        section: 'red',
                        repo: 'core-repo',
                        number: 42,
                        url: 'https://github.com/org/core-repo/pull/42',
                        tickets: ['PROV-123'],
                        owners: ['AL'],
                        draft: false,
                        status: 'Needs review',
                        events: [
                            {
                                at: new Date().toISOString(),
                                actor: 'BOB',
                                action: 'opened'
                            }
                        ]
                    }
                ]
            };

            const previousPayload = JSON.stringify({
                checkedAt: new Date(Date.now() - 3600_000).toISOString(),
                prs: []
            });
            mockRepository.findOneBy.mockResolvedValueOnce({ id: 1, payload: previousPayload });
            mockRepository.save.mockResolvedValueOnce({ id: 1, payload: JSON.stringify(validBody) });

            const req = createMockRequest({
                headers: { 'x-pr-digest-token': 'test-token-secret-123' },
                body: validBody
            });
            const res = {} as http.ServerResponse;

            const response = await PrDigestController.saveDigest(req, res);
            expect(response.status).toBe(200);
            expect(JSON.parse(response.response)).toBe('Saved');
            expect(mockPushService.sendToAdmins).toHaveBeenCalledTimes(1);
        });
    });
});
