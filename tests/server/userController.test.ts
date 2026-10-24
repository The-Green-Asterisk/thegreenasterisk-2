import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUserRepo } = vi.hoisted(() => ({
    mockUserRepo: {
        find: vi.fn(),
    }
}));

vi.mock('services/database', () => ({
    default: {
        getRepository: vi.fn(() => mockUserRepo),
    },
    AppDataSource: {
        getRepository: vi.fn(() => mockUserRepo),
    }
}));

import SessionController from '../../server/controllers/sessionController';
import UserController from '../../server/controllers/userController';

describe('UserController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('returns 401 Unauthorized if user is not admin', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce(undefined);
            const res = await UserController.getAllUsers({} as any, {} as any);
            expect(res.status).toBe(401);
            expect(JSON.parse(res.response)).toBe('Unauthorized');
        });

        it('returns users list when requested by an admin', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            const sampleUsers = [{ id: 1, username: 'admin' }, { id: 2, username: 'player' }];
            mockUserRepo.find.mockResolvedValueOnce(sampleUsers);

            const res = await UserController.getAllUsers({} as any, {} as any);
            expect(res.status).toBe(200);
            expect(JSON.parse(res.response)).toEqual(sampleUsers);
        });

        it('returns 500 if database query throws an error', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValueOnce({ isAdmin: true } as any);
            mockUserRepo.find.mockRejectedValueOnce(new Error('DB failure'));

            const res = await UserController.getAllUsers({} as any, {} as any);
            expect(res.status).toBe(500);
            expect(JSON.parse(res.response)).toBe('Internal Server Error');
        });
    });
});
