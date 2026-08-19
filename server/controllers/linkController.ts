import * as fs from "fs";
import http from "http";
import path from "path";
import AppDataSource from "services/database";
import { Link } from "services/database/entity/Link";
import BaseController from "./baseController";

export default class LinkController extends BaseController {

    public static async getLinks(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const links = (await AppDataSource.getRepository(Link).find())
                .toSorted((a, b) => a.sortOrder - b.sortOrder);
            return {
                response: JSON.stringify(links),
                status: 200
            };
        } catch (error) {
            console.error("Error fetching links:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async saveLink(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody<Link>(req);
            if (!body || !body.url || !body.text) {
                return {
                    response: JSON.stringify('URL and text are required'),
                    status: 400
                };
            }

            const linkRepository = AppDataSource.getRepository(Link);
            const link = linkRepository.create(body);
            const savedLink = await linkRepository.save(link);
            return {
                response: JSON.stringify(savedLink),
                status: 201
            };
        } catch (error) {
            console.error("Error saving link:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async saveLinks(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody<Link[]>(req);
            if (!body || !body.length) {
                return {
                    response: JSON.stringify('no links to save'),
                    status: 400
                }
            }

            const linkRepository = AppDataSource.getRepository(Link);
            const links = linkRepository.create(body);
            const savedLinks = await linkRepository.save(links);

            return {
                response: JSON.stringify(savedLinks),
                status: 200
            }
        } catch (error) {
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }

    public static async editLink(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody<Link>(req);
            if (!body || !body.id) {
                return {
                    response: JSON.stringify('Link ID is required'),
                    status: 400
                };
            }

            const linkRepository = AppDataSource.getRepository(Link);
            const existingLink = await linkRepository.findOneBy({ id: body.id });

            if (!existingLink) {
                return {
                    response: JSON.stringify('Link not found'),
                    status: 404
                };
            }

            linkRepository.merge(existingLink, body);
            const updatedLink = await linkRepository.save(existingLink);

            return {
                response: JSON.stringify(updatedLink),
                status: 200
            };
        } catch (error) {
            console.error("Error editing link:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async deleteLink(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody(req);
            const linkId = Number(body.id);
            if (!linkId) {
                return {
                    response: JSON.stringify('Link ID is required'),
                    status: 400
                };
            }
            const linkRepository = AppDataSource.getRepository(Link);
            const result = await linkRepository.delete(linkId);
            if (result.affected === 0) {
                return {
                    response: JSON.stringify('Link not found'),
                    status: 404
                };
            }
            return {
                response: JSON.stringify('Link deleted successfully'),
                status: 200
            };
        } catch (error) {
            console.error("Error deleting link:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async createLink(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const modalView = await fs.promises.readFile(path.join(__dirname, '../modalViews/createLink.html'), 'utf-8');

            return {
                response: modalView,
                status: 200
            };
        } catch (error) {
            console.error("Error creating link modal:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }
}