import { beforeEach, describe, expect, it, vi } from 'vitest';
import { delData, getData, postData } from '../../../src/services/request';

describe('Request Service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('makes GET request with query params and parses JSON response', async () => {
        const fakeData = { id: 1, name: 'Dragon Quest' };
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => fakeData,
        } as Response);

        const result = await getData<{ id: number; name: string }>('/campaign', { page: 2 });
        expect(fetchSpy).toHaveBeenCalledWith(
            '/data/campaign?page=2',
            undefined
        );
        expect(result).toEqual(fakeData);
    });

    it('makes POST request sending JSON stringified body', async () => {
        const postPayload = { title: 'New Quest' };
        const responseData = { success: true };
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => responseData,
        } as Response);

        const result = await postData<typeof responseData>('/quests', postPayload);
        expect(fetchSpy).toHaveBeenCalledWith('/data/quests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(postPayload)
        });
        expect(result).toEqual(responseData);
    });

    it('delData issues DELETE request with evalResult=false', async () => {
        const mockResponse = { ok: true, status: 200 } as Response;
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

        const result = await delData('/remove/1');
        expect(fetchSpy).toHaveBeenCalledWith('/data/remove/1', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: 'null'
        });
        expect(result).toBe(mockResponse);
    });
});
