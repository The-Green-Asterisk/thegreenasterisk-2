import http from "http";
import AppDataSource from "services/database";
import { PushSubscriber } from "services/database/entity/PushSubscriber";
import { User } from "services/database/entity/User";
import PushService from "services/push";
import BaseController from "./baseController";
import SessionController from "./sessionController";

type SubscriptionBody = {
    endpoint?: string,
    keys?: { p256dh?: string, auth?: string },
    type?: string
};

export default class PushController extends BaseController {

    public static readonly ADMIN_ONLY_TYPES = ['pr-digest'];

    public static isAdminOnlyType(type: string): boolean {
        return this.ADMIN_ONLY_TYPES.includes(type);
    }

    public static async getPushKey(req: http.IncomingMessage, res: http.ServerResponse) {
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
        try {
            const body = await this.readBody<SubscriptionBody>(req);
            const { endpoint } = body ?? {};
            const { p256dh, auth } = body?.keys ?? {};
            const type = body?.type || 'pr-digest';

            if (!this.isEndpoint(endpoint) || !this.isKey(p256dh) || !this.isKey(auth) || !this.isType(type)) {
                return {
                    response: JSON.stringify('Invalid subscription'),
                    status: 400
                };
            }

            if (this.isAdminOnlyType(type) && !currentUser?.isAdmin) {
                return {
                    response: JSON.stringify('Unauthorized'),
                    status: 401
                };
            }

            // The page re-saves its subscription on every visit, so update in place per type
            const repository = AppDataSource.getRepository(PushSubscriber);
            const existing = await repository.findOneBy({ endpoint, type });
            await repository.save(repository.create({
                id: existing?.id,
                endpoint,
                p256dh,
                auth,
                type,
                user: currentUser ? ({ id: currentUser.id } as User) : null
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
        try {
            const body = await this.readBody<SubscriptionBody>(req);
            const endpoint = body?.endpoint;
            const type = body?.type;

            if (!this.isEndpoint(endpoint)) {
                return {
                    response: JSON.stringify('Invalid subscription'),
                    status: 400
                };
            }

            if (type !== undefined && !this.isType(type)) {
                return {
                    response: JSON.stringify('Invalid subscription'),
                    status: 400
                };
            }

            if (type && this.isAdminOnlyType(type) && !currentUser?.isAdmin) {
                return {
                    response: JSON.stringify('Unauthorized'),
                    status: 401
                };
            }

            const repository = AppDataSource.getRepository(PushSubscriber);
            if (type) {
                await repository.delete({ endpoint, type });
            } else if (currentUser?.isAdmin) {
                await repository.delete({ endpoint });
            } else {
                const existing = await repository.findBy({ endpoint });
                const nonAdminIds = existing
                    .filter(sub => !this.isAdminOnlyType(sub.type))
                    .map(sub => sub.id);
                if (nonAdminIds.length > 0) {
                    await repository.delete(nonAdminIds);
                }
            }

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

    private static isType(value: any): value is string {
        return typeof value === 'string' && /^[\w-]{1,50}$/.test(value);
    }
}
