import * as fs from "fs";
import http from "http";
import path from "path";
import AppDataSource from "services/database";
import { Link } from "services/database/entity/Link";
import { User } from "services/database/entity/User";
import { In } from "typeorm";
import BaseController from "./baseController";
import SessionController from "./sessionController";

const DEFAULT_LINKS_USERNAME = "lord.steve";

export default class LinkController extends BaseController {

    public static async getLinks(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const query = this.parseUrlQuery(req?.url);
            let targetUserId: number | null = null;

            if (query.userId !== undefined && query.userId !== "") {
                const parsedId = Number(query.userId);
                if (isNaN(parsedId) || parsedId <= 0) {
                    return {
                        response: JSON.stringify('Invalid User ID'),
                        status: 400
                    };
                }
                targetUserId = parsedId;
            } else {
                const username = typeof query.username === "string" && query.username.trim()
                    ? query.username.trim()
                    : DEFAULT_LINKS_USERNAME;
                const user = await AppDataSource.getRepository(User).findOneBy({ username });
                if (!user) {
                    return {
                        response: JSON.stringify([]),
                        status: 200
                    };
                }
                targetUserId = user.id;
            }

            const links = (await AppDataSource.getRepository(Link).find({
                where: { userId: targetUserId },
                order: { sortOrder: "ASC" }
            })).toSorted((a, b) => a.sortOrder - b.sortOrder);

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
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody<Partial<Link>>(req);
            if (!body || !body.url || !body.text) {
                return {
                    response: JSON.stringify('URL and text are required'),
                    status: 400
                };
            }

            const targetUserId = body.userId !== undefined && body.userId !== null
                ? Number(body.userId)
                : currentUser.id;
            if (isNaN(targetUserId) || targetUserId <= 0) {
                return {
                    response: JSON.stringify('Invalid User ID'),
                    status: 400
                };
            }
            if (!this.canEditOwned(currentUser, targetUserId)) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                };
            }

            const linkRepository = AppDataSource.getRepository(Link);
            const link = linkRepository.create({
                url: String(body.url).trim(),
                iconClass: String(body.iconClass ?? '').trim(),
                imageUrl: String(body.imageUrl ?? '').trim(),
                text: String(body.text).trim(),
                primaryType: Boolean(body.primaryType),
                sortOrder: Number(body.sortOrder) || 0,
                userId: targetUserId,
            });
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
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody<Array<{ id?: number; sortOrder?: number }>>(req);
            if (!Array.isArray(body) || !body.length) {
                return {
                    response: JSON.stringify('no links to save'),
                    status: 400
                };
            }

            const ids = body.map(item => Number(item.id)).filter(id => Number.isInteger(id) && id > 0);
            if (ids.length !== body.length) {
                return {
                    response: JSON.stringify('Invalid link ID'),
                    status: 400
                };
            }

            const linkRepository = AppDataSource.getRepository(Link);
            const existingLinks = await linkRepository.findBy({ id: In(ids) });
            if (existingLinks.length !== ids.length) {
                return {
                    response: JSON.stringify('Link not found'),
                    status: 404
                };
            }
            if (existingLinks.some(link => !this.canEditOwned(currentUser, link.userId))) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                };
            }

            const orderById = new Map(body.map(item => [Number(item.id), Number(item.sortOrder) || 0]));
            for (const link of existingLinks) {
                link.sortOrder = orderById.get(link.id) ?? link.sortOrder;
            }
            const savedLinks = await linkRepository.save(existingLinks);

            return {
                response: JSON.stringify(savedLinks),
                status: 200
            };
        } catch (error) {
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async editLink(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody<Partial<Link>>(req);
            const linkId = Number(body?.id);
            if (!linkId) {
                return {
                    response: JSON.stringify('Link ID is required'),
                    status: 400
                };
            }
            if (!body.url || !body.text) {
                return {
                    response: JSON.stringify('URL and text are required'),
                    status: 400
                };
            }

            const linkRepository = AppDataSource.getRepository(Link);
            const existingLink = await linkRepository.findOneBy({ id: linkId });

            if (!existingLink) {
                return {
                    response: JSON.stringify('Link not found'),
                    status: 404
                };
            }
            if (!this.canEditOwned(currentUser, existingLink.userId)) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                };
            }

            linkRepository.merge(existingLink, {
                url: String(body.url).trim(),
                iconClass: String(body.iconClass ?? '').trim(),
                imageUrl: String(body.imageUrl ?? '').trim(),
                text: String(body.text).trim(),
                primaryType: Boolean(body.primaryType),
                sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existingLink.sortOrder,
            });
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
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody(req);
            const linkId = Number(body?.id);
            if (!linkId) {
                return {
                    response: JSON.stringify('Link ID is required'),
                    status: 400
                };
            }
            const linkRepository = AppDataSource.getRepository(Link);
            const existingLink = await linkRepository.findOneBy({ id: linkId });
            if (!existingLink) {
                return {
                    response: JSON.stringify('Link not found'),
                    status: 404
                };
            }
            if (!this.canEditOwned(currentUser, existingLink.userId)) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                };
            }
            await linkRepository.delete(linkId);
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
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
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
