import http from 'http';
import { beforeEach, describe, expect, it } from 'vitest';
import cache from '../../server/cache';
import CharacterController from '../../server/controllers/characterController';

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
});
