import http from 'http';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLinkRepo = {
    find: vi.fn(),
    findBy: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn((data) => data),
    merge: vi.fn((target, source) => Object.assign(target, source)),
    save: vi.fn((data) => Array.isArray(data) ? data : ({ id: 1, ...data })),
    delete: vi.fn(),
};

const mockUserRepo = {
    findOneBy: vi.fn(),
};

vi.mock('services/database', () => ({
    default: {
        getRepository: vi.fn((entity: any) => {
            if (entity?.name === 'User') return mockUserRepo;
            return mockLinkRepo;
        }),
    },
    AppDataSource: {
        getRepository: vi.fn((entity: any) => {
            if (entity?.name === 'User') return mockUserRepo;
            return mockLinkRepo;
        }),
    }
}));

import LinkController from '../../server/controllers/linkController';
import SessionController from '../../server/controllers/sessionController';

function createMockReq(body?: any, url = '/data/get-links'): http.IncomingMessage {
    const stream = new Readable();
    if (body !== undefined) {
        stream.push(JSON.stringify(body));
    }
    stream.push(null);
    (stream as any).url = url;
    return stream as unknown as http.IncomingMessage;
}

describe('LinkController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLinks', () => {
        it('defaults to lord.steve and returns links sorted by sortOrder', async () => {
            mockUserRepo.findOneBy.mockResolvedValueOnce({ id: 7, username: 'lord.steve' });
            const rawLinks = [
                { id: 1, text: 'Second', url: 'https://b.com', sortOrder: 2, userId: 7 },
                { id: 2, text: 'First', url: 'https://a.com', sortOrder: 1, userId: 7 },
            ];
            mockLinkRepo.find.mockResolvedValueOnce(rawLinks);

            const res = await LinkController.getLinks({ url: '/data/get-links' } as any, {} as any);
            expect(res.status).toBe(200);
            expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ username: 'lord.steve' });
            expect(mockLinkRepo.find).toHaveBeenCalledWith({ where: { userId: 7 }, order: { sortOrder: 'ASC' } });
            const parsed = JSON.parse(res.response);
            expect(parsed[0].sortOrder).toBe(1);
            expect(parsed[1].sortOrder).toBe(2);
        });

        it('fetches links by userId query parameter', async () => {
            mockLinkRepo.find.mockResolvedValueOnce([
                { id: 3, text: 'User Link', url: 'https://u.com', sortOrder: 1, userId: 12 },
            ]);

            const res = await LinkController.getLinks({ url: '/data/get-links?userId=12' } as any, {} as any);
            expect(res.status).toBe(200);
            expect(mockUserRepo.findOneBy).not.toHaveBeenCalled();
            expect(mockLinkRepo.find).toHaveBeenCalledWith({ where: { userId: 12 }, order: { sortOrder: 'ASC' } });
        });

        it('fetches links by username query parameter and returns empty array if user not found', async () => {
            mockUserRepo.findOneBy.mockResolvedValueOnce(null);

            const res = await LinkController.getLinks({ url: '/data/get-links?username=nobody' } as any, {} as any);
            expect(res.status).toBe(200);
            expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ username: 'nobody' });
            expect(JSON.parse(res.response)).toEqual([]);
        });

        it('returns 400 when userId is invalid', async () => {
            const res = await LinkController.getLinks({ url: '/data/get-links?userId=abc' } as any, {} as any);
            expect(res.status).toBe(400);
        });
    });

    describe('saveLink', () => {
        it('returns 401 if user is not logged in', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            const req = createMockReq({ url: 'https://example.com', text: 'Example' });

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(401);
        });

        it('returns 403 if non-admin tries to save a link for another user', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            const req = createMockReq({ url: 'https://example.com', text: 'Example', userId: 99 });

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(403);
        });

        it('returns 400 if url or text is missing', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            const req = createMockReq({ url: '' });

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(400);
        });

        it('saves and returns 201 when user saves their own link', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            const linkData = { url: 'https://tga.com', text: 'TGA', sortOrder: 1 };
            const req = createMockReq(linkData);

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(201);
            expect(mockLinkRepo.create).toHaveBeenCalledWith(expect.objectContaining({
                url: 'https://tga.com',
                text: 'TGA',
                userId: 5,
            }));
            expect(mockLinkRepo.save).toHaveBeenCalled();
        });

        it('allows admin to save a link for another user', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 1, isAdmin: true } as any);
            const linkData = { url: 'https://tga.com', text: 'TGA', sortOrder: 1, userId: 42 };
            const req = createMockReq(linkData);

            const res = await LinkController.saveLink(req, {} as any);
            expect(res.status).toBe(201);
            expect(mockLinkRepo.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 42 }));
        });
    });

    describe('editLink', () => {
        it('returns 403 when non-admin edits another user link', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockLinkRepo.findOneBy.mockResolvedValueOnce({ id: 10, userId: 99, url: 'https://a.com', text: 'A' });
            const req = createMockReq({ id: 10, url: 'https://b.com', text: 'B' });

            const res = await LinkController.editLink(req, {} as any);
            expect(res.status).toBe(403);
        });

        it('updates and returns 200 when owner edits their link', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockLinkRepo.findOneBy.mockResolvedValueOnce({ id: 10, userId: 5, url: 'https://a.com', text: 'A', sortOrder: 1 });
            const req = createMockReq({ id: 10, url: 'https://b.com', text: 'B' });

            const res = await LinkController.editLink(req, {} as any);
            expect(res.status).toBe(200);
            expect(mockLinkRepo.save).toHaveBeenCalled();
        });
    });

    describe('deleteLink', () => {
        it('returns 403 when non-admin deletes another user link', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockLinkRepo.findOneBy.mockResolvedValueOnce({ id: 10, userId: 99 });
            const req = createMockReq({ id: 10 });

            const res = await LinkController.deleteLink(req, {} as any);
            expect(res.status).toBe(403);
            expect(mockLinkRepo.delete).not.toHaveBeenCalled();
        });

        it('deletes and returns 200 when owner deletes their link', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockLinkRepo.findOneBy.mockResolvedValueOnce({ id: 10, userId: 5 });
            const req = createMockReq({ id: 10 });

            const res = await LinkController.deleteLink(req, {} as any);
            expect(res.status).toBe(200);
            expect(mockLinkRepo.delete).toHaveBeenCalledWith(10);
        });
    });

    describe('saveLinks', () => {
        it('returns 403 when reordering links owned by another user', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockLinkRepo.findBy.mockResolvedValueOnce([
                { id: 1, userId: 5, sortOrder: 1 },
                { id: 2, userId: 99, sortOrder: 2 },
            ]);
            const req = createMockReq([{ id: 1, sortOrder: 2 }, { id: 2, sortOrder: 1 }]);

            const res = await LinkController.saveLinks(req, {} as any);
            expect(res.status).toBe(403);
        });

        it('updates sortOrder when owner reorders their own links', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ id: 5, isAdmin: false } as any);
            mockLinkRepo.findBy.mockResolvedValueOnce([
                { id: 1, userId: 5, sortOrder: 1 },
                { id: 2, userId: 5, sortOrder: 2 },
            ]);
            const req = createMockReq([{ id: 1, sortOrder: 2 }, { id: 2, sortOrder: 1 }]);

            const res = await LinkController.saveLinks(req, {} as any);
            expect(res.status).toBe(200);
            expect(mockLinkRepo.save).toHaveBeenCalled();
        });
    });
});
