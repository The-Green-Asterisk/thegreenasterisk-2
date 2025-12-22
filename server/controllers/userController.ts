import http from "http";
import AppDataSource from "services/database";
import { User } from "services/database/entity/User";
import BaseController from "./baseController";
import SessionController from "./sessionController";

export default class UserController extends BaseController {
    constructor() {
        super();
    }

    public static async getAllUsers(req: http.IncomingMessage, res: http.ServerResponse) {
        if (!SessionController.currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                header: 'application/json',
                status: 401
            }
        }
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();
            return {
                response: JSON.stringify(users),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching users:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            }
        }
    }
}