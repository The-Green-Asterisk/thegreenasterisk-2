import http from 'http';
import { describe, expect, it, vi } from 'vitest';
import CharacterController from '../../server/controllers/characterController';
import SessionController from '../../server/controllers/sessionController';
import Routes from '../../server/routes';

describe('Server Routes Dispatcher', () => {
    it('returns 404 for unknown endpoints', async () => {
        const req = {
            url: '/data/non-existent-route',
            method: 'GET'
        } as http.IncomingMessage;
        const res = {} as http.ServerResponse;

        const router = new Routes(req, res);
        const result = await router.response;
        expect(result.status).toBe(404);
        expect(result.response).toBe('404 Not Found');
    });

    it('returns 405 when HTTP method does not match route decorator', async () => {
        const req = {
            url: '/data/check-auth',
            method: 'POST'
        } as http.IncomingMessage;
        const res = {} as http.ServerResponse;

        const router = new Routes(req, res);
        const result = await router.response;
        expect(result.status).toBe(405);
        expect(result.response).toBe('405 Method Not Allowed');
    });

    it('handles /check-auth successfully with GET method', async () => {
        vi.spyOn(SessionController, 'checkAuth').mockReturnValueOnce(true);
        const req = {
            url: '/data/check-auth',
            method: 'GET'
        } as http.IncomingMessage;
        const res = {} as http.ServerResponse;

        const router = new Routes(req, res);
        const result = await router.response;
        expect(result.status).toBe(200);
        expect(result.response).toBe('true');
    });

    it('handles /logout route', async () => {
        const logoutSpy = vi.spyOn(SessionController, 'logout').mockReturnValueOnce(undefined);
        const req = {
            url: '/data/logout',
            method: 'GET'
        } as http.IncomingMessage;
        const res = {} as http.ServerResponse;

        const router = new Routes(req, res);
        const result = await router.response;
        expect(logoutSpy).toHaveBeenCalledWith(req);
        expect(result.status).toBe(200);
        expect(JSON.parse(result.response)).toBe('Logged out');
    });

    it('routes POST /create-character to CharacterController.createCharacter and PUT /save-character to CharacterController.saveCharacter', async () => {
        const createSpy = vi.spyOn(CharacterController, 'createCharacter').mockResolvedValueOnce({
            response: JSON.stringify({ success: true }),
            status: 200
        });
        const saveSpy = vi.spyOn(CharacterController, 'saveCharacter').mockResolvedValueOnce({
            response: JSON.stringify({ success: true }),
            status: 200
        });

        const createReq = { url: '/data/create-character', method: 'POST' } as http.IncomingMessage;
        const createRes = {} as http.ServerResponse;
        const createResult = await new Routes(createReq, createRes).response;
        expect(createSpy).toHaveBeenCalledWith(createReq, createRes);
        expect(createResult.status).toBe(200);

        const saveReq = { url: '/data/save-character', method: 'PUT' } as http.IncomingMessage;
        const saveRes = {} as http.ServerResponse;
        const saveResult = await new Routes(saveReq, saveRes).response;
        expect(saveSpy).toHaveBeenCalledWith(saveReq, saveRes);
        expect(saveResult.status).toBe(200);
    });
});
