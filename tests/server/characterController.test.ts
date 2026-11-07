import http from 'http';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import cache from '../../server/cache';
import CharacterController from '../../server/controllers/characterController';
import SessionController from '../../server/controllers/sessionController';
import AppDataSource from '../../server/services/database';

describe('CharacterController', () => {
    let mockReq: Partial<http.IncomingMessage>;
    let mockRes: Partial<http.ServerResponse>;

    beforeEach(() => {
        mockReq = {
            url: '/data/get-dndbeyond-character?id=138310322',
            method: 'GET'
        };
        mockRes = {};
        cache.del('dndbeyond_char_138310322');
    });

    it('returns 400 when id is missing or invalid', async () => {
        mockReq.url = '/data/get-dndbeyond-character';
        const result = await CharacterController.getDndBeyondCharacter(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );
        expect(result.status).toBe(400);
        expect(result.response).toContain('error');
    });

    it('returns cached character when present in cache', async () => {
        const dummyData = JSON.stringify({ id: 138310322, name: 'Darvell Test' });
        cache.set('dndbeyond_char_138310322', dummyData, 600);

        const result = await CharacterController.getDndBeyondCharacter(
            mockReq as http.IncomingMessage,
            mockRes as http.ServerResponse
        );

        expect(result.status).toBe(200);
        expect(result.response).toBe(dummyData);
    });

    describe('deleteSavedCharacter', () => {
        it('returns 401 when user is not authenticated', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue(undefined as any);
            const req = { url: '/data/delete-saved-character?id=12', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );
            expect(result.status).toBe(401);
            expect(result.response).toContain('Unauthorized');
        });

        it('returns 400 when character id is missing or invalid', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const req = { url: '/data/delete-saved-character', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );
            expect(result.status).toBe(400);
            expect(result.response).toContain('valid saved character ID');
        });

        it('returns 404 when character is not found for current user', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const mockFindOne = vi.fn().mockResolvedValue(null);
            vi.spyOn(AppDataSource, 'getRepository').mockReturnValue({
                findOne: mockFindOne
            } as any);

            const req = { url: '/data/delete-saved-character?id=999', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );
            expect(result.status).toBe(404);
            expect(result.response).toContain('not found');
        });

        it('successfully deletes character and cleans up equip state overrides', async () => {
            vi.spyOn(SessionController, 'getUser').mockReturnValue({ id: 1 } as any);
            Object.defineProperty(AppDataSource, 'isInitialized', { value: true, configurable: true });

            const fakeCharacter = {
                id: 12,
                name: 'Gromph Baenre',
                siteCharacterId: 'tga-12345',
                externalCharacterId: '98765'
            };

            const mockRemove = vi.fn().mockResolvedValue(fakeCharacter);
            const mockFindOne = vi.fn().mockResolvedValue(fakeCharacter);
            const mockEquipDelete = vi.fn().mockResolvedValue({ affected: 1 });

            vi.spyOn(AppDataSource, 'getRepository').mockImplementation((entity: any) => {
                if (entity?.name === 'CharacterEquipState' || String(entity).includes('CharacterEquipState')) {
                    return { delete: mockEquipDelete } as any;
                }
                return {
                    findOne: mockFindOne,
                    remove: mockRemove
                } as any;
            });

            const req = { url: '/data/delete-saved-character?id=12', method: 'DELETE' };
            const result = await CharacterController.deleteSavedCharacter(
                req as http.IncomingMessage,
                mockRes as http.ServerResponse
            );

            expect(result.status).toBe(200);
            const parsed = JSON.parse(result.response);
            expect(parsed.success).toBe(true);
            expect(parsed.deletedId).toBe(12);
            expect(mockRemove).toHaveBeenCalledWith(fakeCharacter);
            expect(mockEquipDelete).toHaveBeenCalled();
        });
    });
});
