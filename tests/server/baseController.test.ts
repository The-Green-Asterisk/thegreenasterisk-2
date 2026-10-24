import http from 'http';
import { Readable } from 'stream';
import { describe, expect, it } from 'vitest';
import BaseController from '../../server/controllers/baseController';

function createMockRequest(bodyContent: string | Buffer): http.IncomingMessage {
    const stream = new Readable();
    stream.push(bodyContent);
    stream.push(null);
    return stream as unknown as http.IncomingMessage;
}

describe('BaseController', () => {
    describe('readBody', () => {
        it('parses JSON bodies correctly', async () => {
            const req = createMockRequest(JSON.stringify({ hello: 'world', count: 42 }));
            const parsed = await BaseController.readBody<{ hello: string; count: number }>(req);
            expect(parsed).toEqual({ hello: 'world', count: 42 });
        });

        it('returns buffer when parse is set to false', async () => {
            const req = createMockRequest('raw text');
            const result = await BaseController.readBody<Buffer>(req, false);
            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe('raw text');
        });

        it('rejects with "Invalid JSON" for malformed JSON strings', async () => {
            const req = createMockRequest('{"unclosed: json');
            await expect(BaseController.readBody(req)).rejects.toBe('Invalid JSON');
        });
    });

    describe('parseUrlQuery', () => {
        it('returns empty object when url is undefined or empty', () => {
            expect(BaseController.parseUrlQuery(undefined)).toEqual({});
            expect(BaseController.parseUrlQuery('')).toEqual({});
        });

        it('parses search parameters from query string correctly', () => {
            const query = BaseController.parseUrlQuery('/test?foo=bar&num=123&flag=true');
            expect(query).toEqual({
                foo: 'bar',
                num: '123',
                flag: 'true'
            });
        });
    });

    describe('getData', () => {
        it('returns default 200 response with text/plain', async () => {
            const mockReq = {} as http.IncomingMessage;
            const mockRes = {} as http.ServerResponse;
            const res = await BaseController.getData(mockReq, mockRes);
            expect(res).toEqual({
                response: 'Data Got!',
                header: 'text/plain',
                status: 200
            });
        });
    });

    describe('checkAndMakeChanges', () => {
        it('updates existing keys and returns true when differences exist', () => {
            const target = { a: 1, b: 'old' };
            const source = { a: 1, b: 'new' };

            const changed = BaseController.checkAndMakeChanges(target, source);
            expect(changed).toBe(true);
            expect(target).toEqual({ a: 1, b: 'new' });
        });

        it('returns false and does not mutate when no differences exist', () => {
            const target = { a: 1, b: 'same' };
            const source = { a: 1, b: 'same' };

            const changed = BaseController.checkAndMakeChanges(target, source);
            expect(changed).toBe(false);
            expect(target).toEqual({ a: 1, b: 'same' });
        });

        it('ignores keys that do not exist in target when onlyExistingKeys is true', () => {
            const target = { a: 1 };
            const source = { a: 1, extra: 'value' };

            const changed = BaseController.checkAndMakeChanges(target, source, { onlyExistingKeys: true, handleFalsy: false });
            expect(changed).toBe(false);
            expect(target).toEqual({ a: 1 });
        });

        it('adds keys that do not exist when onlyExistingKeys is false', () => {
            const target: Record<string, any> = { a: 1 };
            const source = { a: 1, extra: 'value' };

            const changed = BaseController.checkAndMakeChanges(target, source, { onlyExistingKeys: false, handleFalsy: false });
            expect(changed).toBe(true);
            expect(target).toEqual({ a: 1, extra: 'value' });
        });

        it('handles falsy updates when handleFalsy is true', () => {
            const target: Record<string, any> = { a: 'truthy', b: 10 };
            const source: Record<string, any> = { a: '', b: 0 };

            const changed = BaseController.checkAndMakeChanges(target, source, { onlyExistingKeys: true, handleFalsy: true });
            expect(changed).toBe(true);
            expect(target.a).toBe('');
            expect(target.b).toBe(0);
        });
    });
});
