import http from "http";
import AppDataSource from "services/database";
import { World } from "services/database/entity/World";
import BaseController from "./baseController";

export default class WorldController extends BaseController {
    constructor() {
        super();
    }

    public static async createWorld(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const newWorld = await this.readBody<World>(req);
            if (!newWorld || !newWorld.name) {
                return {
                    response: JSON.stringify({ error: 'World name is required' }),
                    header: 'application/json',
                    status: 400
                };
            }

            if (!newWorld.description) {
                newWorld.description = '';
            }

            const worldRepository = AppDataSource.getRepository(World);
            const createdWorld = worldRepository.create(newWorld);
            const savedWorld = await worldRepository.save(createdWorld);
            return {
                response: JSON.stringify(savedWorld),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error creating world:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getWorlds(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const worldRepository = AppDataSource.getRepository(World);
            const worlds = await worldRepository.find();
            return {
                response: JSON.stringify(worlds),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching worlds:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async editWorld(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const updatedWorld = await this.readBody<World>(req);
            if (!updatedWorld || !updatedWorld.id) {
                return {
                    response: JSON.stringify({ error: 'World ID is required' }),
                    header: 'application/json',
                    status: 400
                };
            }
            const worldRepository = AppDataSource.getRepository(World);
            const existingWorld = await worldRepository.findOneBy({ id: updatedWorld.id });
            if (!existingWorld) {
                return {
                    response: JSON.stringify({ error: 'World not found' }),
                    header: 'application/json',
                    status: 404
                };
            }
            const mergedWorld = worldRepository.merge(existingWorld, updatedWorld);
            const savedWorld = await worldRepository.save(mergedWorld);
            return {
                response: JSON.stringify(savedWorld),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error editing world:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }

}