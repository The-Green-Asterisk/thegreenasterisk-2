import http from "http";
import AppDataSource from "services/database";
import { User } from "services/database/entity/User";
import BaseController from "./baseController";

export default class ProfileController extends BaseController {
    constructor() {
        super();
    }

    public static async getUserProfile(req: http.IncomingMessage, res: http.ServerResponse) {
        const query = this.parseUrlQuery(req.url);
        const userId = Number(query.id);
        if (!userId) {
            return {
                response: JSON.stringify('User ID is required'),
                status: 400
            }
        }
        if (isNaN(userId) || userId <= 0) {
            return {
                response: JSON.stringify('Invalid User ID'),
                status: 400
            }
        }
        try {
            const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
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
        try {
            const body = await this.readBody(req);
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: body.id });
            if (!user) {
                return {
                    response: JSON.stringify('User not found'),
                    status: 404
                }
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