import http from 'http';
import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSettingRepo, mockVideoRepo } = vi.hoisted(() => ({
    mockSettingRepo: {
        findOneBy: vi.fn(),
        save: vi.fn(),
    },
    mockVideoRepo: {
        find: vi.fn(),
        create: vi.fn((data: any) => data),
        save: vi.fn((data: any) => ({ id: 1, ...data })),
    }
}));

vi.mock('services/database', () => ({
    default: {
        getRepository: vi.fn((entity: any) => {
            if (entity?.name === 'Setting') return mockSettingRepo;
            return mockVideoRepo;
        }),
    },
    AppDataSource: {
        getRepository: vi.fn((entity: any) => {
            if (entity?.name === 'Setting') return mockSettingRepo;
            return mockVideoRepo;
        }),
    }
}));

import SessionController from '../../server/controllers/sessionController';
import YouTubeVideoController from '../../server/controllers/youTubeVideoController';

function createMockReq(body: any): http.IncomingMessage {
    const stream = new Readable();
    stream.push(JSON.stringify(body));
    stream.push(null);
    return stream as unknown as http.IncomingMessage;
}

describe('YouTubeVideoController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCurrentSeason', () => {
        it('returns stored season number if set', async () => {
            mockSettingRepo.findOneBy.mockResolvedValueOnce({ name: 'survivors.currentSeason', value: '3' });
            const res = await YouTubeVideoController.getCurrentSeason({} as any, {} as any);
            expect(res.status).toBe(200);
            expect(JSON.parse(res.response)).toBe(3);
        });

        it('defaults to season 1 if not set', async () => {
            mockSettingRepo.findOneBy.mockResolvedValueOnce(null);
            const res = await YouTubeVideoController.getCurrentSeason({} as any, {} as any);
            expect(res.status).toBe(200);
            expect(JSON.parse(res.response)).toBe(1);
        });
    });

    describe('setCurrentSeason', () => {
        it('returns 401 Unauthorized if user is not admin', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            const req = createMockReq({ season: 2 });
            const res = await YouTubeVideoController.setCurrentSeason(req, {} as any);
            expect(res.status).toBe(401);
        });

        it('returns 400 for non-positive or non-integer season', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            const req = createMockReq({ season: 0 });
            const res = await YouTubeVideoController.setCurrentSeason(req, {} as any);
            expect(res.status).toBe(400);
        });

        it('updates season setting and returns 200 on success', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            const req = createMockReq({ season: 4 });
            const res = await YouTubeVideoController.setCurrentSeason(req, {} as any);
            expect(res.status).toBe(200);
            expect(mockSettingRepo.save).toHaveBeenCalledWith({
                name: 'survivors.currentSeason',
                value: '4'
            });
        });
    });

    describe('getVideos', () => {
        it('sorts videos by episodeNum in ascending order', async () => {
            const list = [
                { id: 2, episodeNum: 10, title: 'Ep 10' },
                { id: 1, episodeNum: 2, title: 'Ep 2' }
            ];
            mockVideoRepo.find.mockResolvedValueOnce(list);
            const req = { url: '/get-youtube-videos' } as http.IncomingMessage;

            const res = await YouTubeVideoController.getVideos(req, {} as any);
            expect(res.status).toBe(200);
            const videos = JSON.parse(res.response);
            expect(videos[0].episodeNum).toBe(2);
            expect(videos[1].episodeNum).toBe(10);
        });
    });
});
