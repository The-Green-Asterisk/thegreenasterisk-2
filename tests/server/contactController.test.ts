import http from 'http';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';

const { mockEmailService } = vi.hoisted(() => ({
    mockEmailService: {
        sendEmail: vi.fn(),
    }
}));

vi.mock('services/email', () => ({
    default: mockEmailService,
}));

import ContactController from '../../server/controllers/contactController';

function createMockReq(body: any, headers: Record<string, string> = {}): http.IncomingMessage {
    const stream = new Readable();
    stream.push(typeof body === 'string' ? body : JSON.stringify(body));
    stream.push(null);
    const req = stream as unknown as http.IncomingMessage;
    req.headers = headers;
    (req as any).socket = { remoteAddress: '127.0.0.1' };
    return req;
}

describe('ContactController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cache.flushAll();
    });

    it('silently ignores honeypot submissions with 200 response', async () => {
        const req = createMockReq({
            name: 'Spam Bot',
            email: 'bot@spam.com',
            message: 'Buy our product',
            website: 'http://spam.com'
        });

        const res = await ContactController.sendContact(req, {} as any);
        expect(res.status).toBe(200);
        expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('returns 400 when name, email, or message is missing or invalid', async () => {
        const reqInvalidEmail = createMockReq({
            name: 'John Doe',
            email: 'not-an-email',
            message: 'Hello'
        });

        const res = await ContactController.sendContact(reqInvalidEmail, {} as any);
        expect(res.status).toBe(400);
        expect(JSON.parse(res.response)).toContain('Please fill in your name');
    });

    it('sends email successfully and returns 200 for valid submission', async () => {
        mockEmailService.sendEmail.mockResolvedValueOnce(true);
        const req = createMockReq({
            name: 'Adventurer',
            email: 'adventurer@dnd.org',
            message: 'Looking for a campaign in Tampa!'
        });

        const res = await ContactController.sendContact(req, {} as any);
        expect(res.status).toBe(200);
        expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it('returns 502 if email service fails to deliver', async () => {
        mockEmailService.sendEmail.mockResolvedValueOnce(false);
        const req = createMockReq({
            name: 'Adventurer',
            email: 'adventurer@dnd.org',
            message: 'Hello world'
        });

        const res = await ContactController.sendContact(req, {} as any);
        expect(res.status).toBe(502);
    });

    it('enforces rate limiting (429) after limit is exceeded', async () => {
        mockEmailService.sendEmail.mockResolvedValue(true);
        const makeReq = () => createMockReq({
            name: 'Adventurer',
            email: 'adventurer@dnd.org',
            message: 'Testing rate limit'
        }, { 'x-forwarded-for': '192.168.1.50' });

        // 3 requests allowed
        await ContactController.sendContact(makeReq(), {} as any);
        await ContactController.sendContact(makeReq(), {} as any);
        await ContactController.sendContact(makeReq(), {} as any);

        // 4th request rate-limited
        const fourth = await ContactController.sendContact(makeReq(), {} as any);
        expect(fourth.status).toBe(429);
    });
});
