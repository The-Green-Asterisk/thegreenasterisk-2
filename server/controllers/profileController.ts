import http from "http";
import AppDataSource from "services/database";
import { User } from "services/database/entity/User";
import BaseController from "./baseController";
import SessionController from "./sessionController";

export default class ProfileController extends BaseController {
    constructor() {
        super();
    }

    public static async getUserProfile(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const hasId = query.id !== undefined && query.id !== '';
        const username = typeof query.username === 'string' ? query.username.trim() : '';

        if (!hasId && !username) {
            return {
                response: JSON.stringify('User ID or username is required'),
                status: 400
            }
        }

        const userId = hasId ? Number(query.id) : 0;
        if (hasId && (isNaN(userId) || userId <= 0)) {
            return {
                response: JSON.stringify('Invalid User ID'),
                status: 400
            }
        }

        try {
            const user = hasId
                ? await AppDataSource.getRepository(User).findOneBy({ id: userId })
                : await AppDataSource.getRepository(User).findOneBy({ username });
            if (!user) {
                return {
                    response: JSON.stringify('User not found'),
                    status: 404
                }
            }
            return {
                response: JSON.stringify(user),
                status: 200
            };
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }

    public static async updateUserProfile(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            }
        }
        try {
            const body = await this.readBody(req);
            const targetId = Number(body?.id);
            if (!targetId || (targetId !== currentUser.id && !currentUser.isAdmin)) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                }
            }
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: targetId });
            if (!user) {
                return {
                    response: JSON.stringify('User not found'),
                    status: 404
                }
            }
            delete body.password;
            delete body.discord_id;
            if (!currentUser.isAdmin) {
                delete body.isAdmin;
            }
            if (body.linksTitle !== undefined) {
                body.linksTitle = typeof body.linksTitle === 'string' && body.linksTitle.trim()
                    ? body.linksTitle.trim().slice(0, 255)
                    : null;
            }
            if (body.linksDescription !== undefined) {
                body.linksDescription = typeof body.linksDescription === 'string' && body.linksDescription.trim()
                    ? body.linksDescription.trim()
                    : null;
            }
            Object.assign(user, body);
            await userRepository.save(user);
            return {
                response: JSON.stringify(user),
                status: 200
            };
        } catch (error) {
            console.error("Error updating user profile:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }
}