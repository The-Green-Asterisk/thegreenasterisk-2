import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRequest } = vi.hoisted(() => ({
    mockRequest: {
        getData: vi.fn(),
        postData: vi.fn(),
        delData: vi.fn(),
    }
}));

vi.mock('../../../src/services/request', () => ({
    getData: mockRequest.getData,
    postData: mockRequest.postData,
    delData: mockRequest.delData,
}));

import PushService from '../../../src/services/pushService';

describe('Frontend PushService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('isSupported', () => {
        it('returns true when serviceWorker, PushManager, and Notification exist in environment', () => {
            const originalSW = navigator.serviceWorker;
            const originalPush = (window as any).PushManager;
            const originalNotification = (window as any).Notification;

            Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true });
            (window as any).PushManager = function () { };
            (window as any).Notification = function () { };

            expect(PushService.isSupported()).toBe(true);

            Object.defineProperty(navigator, 'serviceWorker', { value: originalSW, configurable: true });
            (window as any).PushManager = originalPush;
            (window as any).Notification = originalNotification;
        });

        it('returns false when Notification is missing', () => {
            const originalNotification = (window as any).Notification;
            delete (window as any).Notification;

            expect(PushService.isSupported()).toBe(false);

            (window as any).Notification = originalNotification;
        });
    });

    describe('isIos', () => {
        it('detects iPhone/iPad from userAgent', () => {
            const originalUA = navigator.userAgent;
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
                configurable: true
            });

            expect(PushService.isIos()).toBe(true);

            Object.defineProperty(navigator, 'userAgent', { value: originalUA, configurable: true });
        });

        it('detects iPadOS with MacIntel and multi-touch points', () => {
            const originalUA = navigator.userAgent;
            const originalPlatform = navigator.platform;
            const originalTouch = navigator.maxTouchPoints;

            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true });
            Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true });

            expect(PushService.isIos()).toBe(true);

            Object.defineProperty(navigator, 'userAgent', { value: originalUA, configurable: true });
            Object.defineProperty(navigator, 'platform', { value: originalPlatform, configurable: true });
            Object.defineProperty(navigator, 'maxTouchPoints', { value: originalTouch, configurable: true });
        });

        it('returns false for standard desktop userAgent', () => {
            const originalUA = navigator.userAgent;
            const originalPlatform = navigator.platform;

            Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', configurable: true });
            Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true });

            expect(PushService.isIos()).toBe(false);

            Object.defineProperty(navigator, 'userAgent', { value: originalUA, configurable: true });
            Object.defineProperty(navigator, 'platform', { value: originalPlatform, configurable: true });
        });
    });

    describe('base64UrlToBytes', () => {
        it('decodes base64url string to Uint8Array', () => {
            // 'Hello' in base64 is 'SGVsbG8=' and in base64url is 'SGVsbG8'
            const bytes = PushService.base64UrlToBytes('SGVsbG8');
            const str = new TextDecoder().decode(bytes);
            expect(str).toBe('Hello');
        });
    });

    describe('getPushKey', () => {
        it('calls getData /get-push-key', async () => {
            mockRequest.getData.mockResolvedValueOnce('mock-public-key');
            const key = await PushService.getPushKey();
            expect(mockRequest.getData).toHaveBeenCalledWith('/get-push-key');
            expect(key).toBe('mock-public-key');
        });
    });

    describe('saveSubscription', () => {
        it('posts subscription details and type to /save-push-subscription', async () => {
            const mockSubscription = {
                endpoint: 'https://push.example.com/sub/1',
                toJSON: () => ({
                    endpoint: 'https://push.example.com/sub/1',
                    keys: { p256dh: 'p256', auth: 'authkey' }
                })
            } as unknown as PushSubscription;

            mockRequest.postData.mockResolvedValueOnce('Saved');

            await PushService.saveSubscription(mockSubscription, 'episodes');

            expect(mockRequest.postData).toHaveBeenCalledWith('/save-push-subscription', {
                endpoint: 'https://push.example.com/sub/1',
                keys: { p256dh: 'p256', auth: 'authkey' },
                type: 'episodes'
            });
        });
    });

    describe('deleteSubscription', () => {
        it('calls delData with endpoint and optional type', async () => {
            mockRequest.delData.mockResolvedValueOnce('Deleted');

            await PushService.deleteSubscription('https://push.example.com/sub/1', 'pr-digest');

            expect(mockRequest.delData).toHaveBeenCalledWith('/delete-push-subscription', {
                endpoint: 'https://push.example.com/sub/1',
                type: 'pr-digest'
            });
        });
    });

    describe('subscribe', () => {
        it('fetches push key, calls pushManager.subscribe, and saves subscription', async () => {
            mockRequest.getData.mockResolvedValueOnce('SGVsbG8');
            mockRequest.postData.mockResolvedValueOnce('Saved');

            const mockSubscription = {
                endpoint: 'https://push.example.com/sub/1',
                toJSON: () => ({
                    endpoint: 'https://push.example.com/sub/1',
                    keys: { p256dh: 'p256', auth: 'authkey' }
                })
            };

            const mockRegistration = {
                pushManager: {
                    subscribe: vi.fn().mockResolvedValueOnce(mockSubscription)
                }
            } as unknown as ServiceWorkerRegistration;

            const result = await PushService.subscribe(mockRegistration, 'episodes');

            expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith({
                userVisibleOnly: true,
                applicationServerKey: expect.any(Uint8Array)
            });
            expect(mockRequest.postData).toHaveBeenCalledWith('/save-push-subscription', {
                endpoint: 'https://push.example.com/sub/1',
                keys: { p256dh: 'p256', auth: 'authkey' },
                type: 'episodes'
            });
            expect(result).toBe(mockSubscription);
        });
    });

    describe('unsubscribe', () => {
        it('deletes subscription on backend and calls subscription.unsubscribe', async () => {
            mockRequest.delData.mockResolvedValueOnce('Deleted');

            const mockSubscription = {
                endpoint: 'https://push.example.com/sub/1',
                unsubscribe: vi.fn().mockResolvedValueOnce(true)
            } as unknown as PushSubscription;

            const res = await PushService.unsubscribe(mockSubscription, 'pr-digest');

            expect(mockRequest.delData).toHaveBeenCalledWith('/delete-push-subscription', {
                endpoint: 'https://push.example.com/sub/1',
                type: 'pr-digest'
            });
            expect(mockSubscription.unsubscribe).toHaveBeenCalled();
            expect(res).toBe(true);
        });
    });
});
