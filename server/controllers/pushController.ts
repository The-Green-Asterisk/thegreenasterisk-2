import http from "http";
import AppDataSource from "services/database";
import { PushSubscriber } from "services/database/entity/PushSubscriber";
import PushService from "services/push";
import BaseController from "./baseController";
import SessionController from "./sessionController";

type SubscriptionBody = {
    endpoint?: string,
    keys?: { p256dh?: string, auth?: string }
};

export default class PushController extends BaseController {

    public static async getPushKey(req: http.IncomingMessage, res: http.ServerResponse) {
        if (!SessionController.getUser(req)?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        if (!PushService.publicKey) {
            return {
                response: JSON.stringify('Push notifications are not configured'),
                status: 503
            };
        }
        return {
            response: JSON.stringify(PushService.publicKey),
            status: 200
        };
    }

    public static async saveSubscription(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody<SubscriptionBody>(req);
            const { endpoint } = body ?? {};
            const { p256dh, auth } = body?.keys ?? {};
            if (!this.isEndpoint(endpoint) || !this.isKey(p256dh) || !this.isKey(auth)) {
                return {
                    response: JSON.stringify('Invalid subscription'),
                    status: 400
                };
            }

            // The page re-saves its subscription on every visit, so update in place
            const repository = AppDataSource.getRepository(PushSubscriber);
            const existing = await repository.findOneBy({ endpoint });
            await repository.save(repository.create({
                id: existing?.id,
                endpoint,
                p256dh,
                auth,
                user: { id: currentUser.id }
            }));
            return {
                response: JSON.stringify('Saved'),
                status: 200
            };
        } catch (error) {
            console.error("Error saving push subscription:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async deleteSubscription(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const { endpoint } = await this.readBody<SubscriptionBody>(req) ?? {};
            if (!this.isEndpoint(endpoint)) {
                return {
                    response: JSON.stringify('Invalid subscription'),
                    status: 400
                };
            }
            await AppDataSource.getRepository(PushSubscriber).delete({ endpoint, user: { id: currentUser.id } });
            return {
                response: JSON.stringify('Deleted'),
                status: 200
            };
        } catch (error) {
            console.error("Error deleting push subscription:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    private static isEndpoint(value: any): value is string {
        return typeof value === 'string' && value.length <= 2000 && value.startsWith('https://');
    }

    private static isKey(value: any): value is string {
        return typeof value === 'string' && /^[\w-]{1,255}$/.test(value);
    }
}
