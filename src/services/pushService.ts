import { delData, getData, postData } from './request';

export default class PushService {
    /**
     * Checks if push notifications and service workers are supported in the current environment.
     */
    public static isSupported(): boolean {
        return typeof navigator !== 'undefined'
            && typeof window !== 'undefined'
            && 'serviceWorker' in navigator
            && 'PushManager' in window
            && 'Notification' in window;
    }

    /**
     * Detects if the current client is on iOS (iPhone, iPad, iPod) or iPadOS.
     */
    public static isIos(): boolean {
        if (typeof navigator === 'undefined') return false;
        return /iPad|iPhone|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    /**
     * Registers the service worker (defaults to '/sw.js').
     */
    public static async registerServiceWorker(swPath: string = '/sw.js'): Promise<ServiceWorkerRegistration> {
        return navigator.serviceWorker.register(swPath);
    }

    /**
     * Retrieves the current push subscription, or null if none exists.
     */
    public static async getSubscription(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
        return registration.pushManager.getSubscription();
    }

    /**
     * Requests notification permissions from the user.
     */
    public static async requestPermission(): Promise<NotificationPermission> {
        return Notification.requestPermission();
    }

    /**
     * Fetches the server's public VAPID application key.
     */
    public static async getPushKey(): Promise<string> {
        return getData<string>('/get-push-key');
    }

    /**
     * Converts a base64url-encoded VAPID key to a Uint8Array for PushManager.
     */
    public static base64UrlToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
        const base64 = (base64Url + '='.repeat((4 - base64Url.length % 4) % 4))
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const raw = atob(base64);
        const buffer = new ArrayBuffer(raw.length);
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < raw.length; i++) {
            bytes[i] = raw.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * Subscribes the current client with the PushManager and saves the subscription to the backend.
     */
    public static async subscribe(
        registration: ServiceWorkerRegistration,
        type: string = 'pr-digest'
    ): Promise<PushSubscription> {
        const key = await this.getPushKey();
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.base64UrlToBytes(key)
        });
        await this.saveSubscription(subscription, type);
        return subscription;
    }

    /**
     * Unsubscribes locally and removes the subscription record from the backend.
     */
    public static async unsubscribe(
        subscription: PushSubscription,
        type?: string
    ): Promise<boolean> {
        await this.deleteSubscription(subscription.endpoint, type).catch(() => { });
        return subscription.unsubscribe();
    }

    /**
     * Saves or refreshes the subscription record on the backend for the specified type.
     */
    public static async saveSubscription(subscription: PushSubscription, type: string = 'pr-digest'): Promise<any> {
        return postData('/save-push-subscription', {
            ...subscription.toJSON(),
            type
        });
    }

    /**
     * Deletes the subscription record on the backend for the endpoint and optional type.
     */
    public static async deleteSubscription(endpoint: string, type?: string): Promise<any> {
        return delData('/delete-push-subscription', {
            endpoint,
            ...(type ? { type } : {})
        });
    }
}
