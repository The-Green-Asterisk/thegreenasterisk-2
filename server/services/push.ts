import AppDataSource from 'services/database';
import { PushSubscriber } from 'services/database/entity/PushSubscriber';
import webPush from 'web-push';

export type PushNotification = {
    title: string,
    body: string,
    tag: string,
    url: string,
    urgency: 'high' | 'normal'
};

export default class PushService {
    static get publicKey(): string | undefined {
        return process.env.VAPID_PUBLIC_KEY;
    }

    /**
     * Sends each notification to every subscriber of the given type.
     * If options.adminOnly is true, only sends to subscribers who are admins.
     * A subscription the push service reports as gone (404/410) is deleted.
     */
    static async sendToSubscribers(
        type: string,
        notifications: PushNotification[],
        options: { adminOnly?: boolean } = {}
    ) {
        if (!notifications.length) return;
        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
            console.error('Push not sent: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT must be set');
            return;
        }
        webPush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

        const repository = AppDataSource.getRepository(PushSubscriber);
        const allSubscribers = await repository.find({
            where: { type },
            relations: { user: true }
        });
        const subscribers = options.adminOnly
            ? allSubscribers.filter(subscriber => subscriber.user?.isAdmin)
            : allSubscribers;

        for (const subscriber of subscribers) {
            for (const { urgency, ...notification } of notifications) {
                try {
                    await webPush.sendNotification(
                        { endpoint: subscriber.endpoint, keys: { p256dh: subscriber.p256dh, auth: subscriber.auth } },
                        JSON.stringify(notification),
                        {
                            TTL: 6 * 60 * 60,
                            urgency,
                            // a newer push for the same PR replaces one still queued
                            topic: notification.tag.replace(/[^\w-]/g, '-').slice(0, 32)
                        }
                    );
                } catch (error: any) {
                    if (error?.statusCode === 404 || error?.statusCode === 410) {
                        await repository.delete(subscriber.id);
                        break;
                    }
                    console.error('Error sending push notification:', error?.statusCode ?? error);
                }
            }
        }
    }

    /**
     * Sends each notification to all subscribers of the given type.
     */
    static async sendToType(type: string, notifications: PushNotification[]) {
        return this.sendToSubscribers(type, notifications);
    }

    /**
     * Sends each notification to all subscribed devices belonging to a specific user.
     * Optionally filtered by subscription type (e.g. 'videos', 'pr-digest').
     */
    static async sendToUser(
        userId: number,
        notifications: PushNotification[],
        type?: string
    ) {
        if (!notifications.length) return;
        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
            console.error('Push not sent: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT must be set');
            return;
        }
        webPush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

        const repository = AppDataSource.getRepository(PushSubscriber);
        const whereClause: any = { user: { id: userId } };
        if (type) {
            whereClause.type = type;
        }

        const subscribers = await repository.find({
            where: whereClause,
            relations: { user: true }
        });

        for (const subscriber of subscribers) {
            for (const { urgency, ...notification } of notifications) {
                try {
                    await webPush.sendNotification(
                        { endpoint: subscriber.endpoint, keys: { p256dh: subscriber.p256dh, auth: subscriber.auth } },
                        JSON.stringify(notification),
                        {
                            TTL: 6 * 60 * 60,
                            urgency,
                            topic: notification.tag.replace(/[^\w-]/g, '-').slice(0, 32)
                        }
                    );
                } catch (error: any) {
                    if (error?.statusCode === 404 || error?.statusCode === 410) {
                        await repository.delete(subscriber.id);
                        break;
                    }
                    console.error('Error sending push notification:', error?.statusCode ?? error);
                }
            }
        }
    }

    /**
     * Sends each notification to every admin's subscribed browsers for the given type
     * (defaults to 'pr-digest'). A subscription the push service reports as gone
     * (404/410) is deleted.
     */
    static async sendToAdmins(notifications: PushNotification[], type: string = 'pr-digest') {
        return this.sendToSubscribers(type, notifications, { adminOnly: true });
    }
}
