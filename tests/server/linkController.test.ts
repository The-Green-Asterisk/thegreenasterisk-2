import http from 'http';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLinkRepo = {
    find: vi.fn(),
    create: vi.fn((data) => data),
    save: vi.fn((data) => ({ id: 1, ...data })),
};

vi.mock('services/database', () => ({
    default: {
        getRepository: vi.fn(() => mockLinkRepo),
    },
    AppDataSource: {
        getRepository: vi.fn(() => mockLinkRepo),
    }
}));

import LinkController from '../../server/controllers/linkController';
import SessionController from '../../server/controllers/sessionController';

function createMockReq(body: any): http.IncomingMessage {
    const stream = new Readable();
    stream.push(JSON.stringify(body));
    stream.push(null);
    return stream as unknown as http.IncomingMessage;
}

describe('LinkController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLinks', () => {
        it('returns links sorted by sortOrder', async () => {
            const rawLinks = [
                { id: 1, text: 'Second', url: 'https://b.com', sortOrder: 2 },
                { id: 2, text: 'First', url: 'https://a.com', sortOrder: 1 },
            ];
            mockLinkRepo.find.mockResolvedValueOnce(rawLinks);

            const res = await LinkController.getLinks({} as any, {} as any);
            expect(res.status).toBe(200);
            const parsed = JSON.parse(res.response);
            expect(parsed[0].sortOrder).toBe(1);
            expect(parsed[1].sortOrder).toBe(2);
        });
    });

    describe('saveLink', () => {
        it('returns 401 if user is not admin', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            const req = createMockReq({ url: 'https://example.com', text: 'Example' });

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(401);
        });

        it('returns 400 if url or text is missing', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            const req = createMockReq({ url: '' });

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(400);
        });

        it('saves and returns 201 when user is admin and payload is valid', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            const linkData = { url: 'https://tga.com', text: 'TGA', sortOrder: 1 };
            const req = createMockReq(linkData);

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(201);
            expect(mockLinkRepo.save).toHaveBeenCalled();
        });
    });
});
