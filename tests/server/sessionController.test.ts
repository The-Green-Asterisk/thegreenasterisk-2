import http from 'http';
import { beforeEach, describe, expect, it } from 'vitest';
import cache from '../../server/cache';
import SessionController, { ReqAndUser } from '../../server/controllers/sessionController';
import { User } from '../../server/services/database/entity/User';

describe('SessionController', () => {
    beforeEach(() => {
        cache.flushAll();
    });

    describe('getSessionKey', () => {
        it('extracts authorization header string', () => {
            const req = {
                headers: { authorization: 'Bearer session-token-123' }
            } as unknown as http.IncomingMessage;
            expect(SessionController.getSessionKey(req)).toBe('Bearer session-token-123');
        });

        it('returns undefined when authorization header is missing or empty', () => {
            const req1 = { headers: {} } as unknown as http.IncomingMessage;
            expect(SessionController.getSessionKey(req1)).toBeUndefined();

            const req2 = { headers: { authorization: '' } } as unknown as http.IncomingMessage;
            expect(SessionController.getSessionKey(req2)).toBeUndefined();
        });
    });

    describe('getUser and checkAuth', () => {
        it('returns cached user for valid session key', () => {
            const token = 'my-valid-token';
            const user = { id: 10, username: 'tester', isAdmin: false } as User;

            // SessionController caches under 'session-' + sha256(token)
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(token).digest('hex');
            cache.set('session-' + hash, user);

            const req = {
                headers: { authorization: token }
            } as ReqAndUser;

            const resolvedUser = SessionController.getUser(req);
            expect(resolvedUser).toEqual(user);
            expect(req.currentUser).toEqual(user);
            expect(SessionController.checkAuth(req)).toBe(true);
        });

        it('returns undefined and false if session is missing or expired', () => {
            const req = {
                headers: { authorization: 'non-existent' }
            } as ReqAndUser;

            expect(SessionController.getUser(req)).toBeUndefined();
            expect(SessionController.checkAuth(req)).toBe(false);
        });

        it('returns currentUser directly if already set on request', () => {
            const presetUser = { id: 99, username: 'cached-user' } as User;
            const req = {
                headers: {},
                currentUser: presetUser
            } as ReqAndUser;

            expect(SessionController.getUser(req)).toBe(presetUser);
        });
    });
});
