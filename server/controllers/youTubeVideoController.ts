import http from "http";
import AppDataSource from "services/database";
import { Setting } from "services/database/entity/Setting";
import { Tag } from "services/database/entity/Tag";
import { YouTubeVideo } from "services/database/entity/YouTubeVideo";
import { In } from "typeorm";
import BaseController from "./baseController";
import SessionController from "./sessionController";

// The Survivors season new videos go into, and the one shown open
const CURRENT_SEASON = 'survivors.currentSeason';

export default class YouTubeVideoController extends BaseController {
    constructor() {
        super();
    }

    public static async getVideos(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const query = this.parseUrlQuery(req.url);
            const tagIds = query.tagIds
                ? query.tagIds.split(',').map(Number)
                : [];
            const videos = await AppDataSource.getRepository(YouTubeVideo).find({
                relations: ["tags"],
                where: tagIds.length > 0 ? { tags: { id: In(tagIds) } } : {},
            });
            return {
                response: JSON.stringify(videos.sort((a, b) => a.episodeNum - b.episodeNum)),
                status: 200
            };
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async getCurrentSeason(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const setting = await AppDataSource.getRepository(Setting).findOneBy({ name: CURRENT_SEASON });
            return {
                response: JSON.stringify(Number(setting?.value ?? 1)),
                status: 200
            };
        } catch (error) {
            console.error("Error fetching current season:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async setCurrentSeason(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const { season } = await this.readBody<{ season: number }>(req);
            if (!Number.isInteger(season) || season < 1) {
                return {
                    response: JSON.stringify('Season must be a whole number of at least 1'),
                    status: 400
                };
            }
            await AppDataSource.getRepository(Setting).save({ name: CURRENT_SEASON, value: String(season) });
            return {
                response: JSON.stringify(season),
                status: 200
            };
        } catch (error) {
            console.error("Error saving current season:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async saveVideo(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody<YouTubeVideo>(req);
            if (!body || !body.title || !body.url) {
                return {
                    response: JSON.stringify('Title and URL are required'),
                    status: 400
                };
            }
            if (body.tags) {
                const tagRepository = AppDataSource.getRepository(Tag);
                const existingTags = await tagRepository.findBy({ name: In(body.tags.map((tag: Tag) => tag.name)) });
                const newTags = body.tags.filter((tag: Tag) => !existingTags.some((existingTag: Tag) => existingTag.name === tag.name));
                if (newTags.length > 0) {
                    const createdTags = tagRepository.create(newTags);
                    body.tags = existingTags.concat(await tagRepository.save(createdTags));
                } else {
                    body.tags = existingTags;
                }
            }
            const videoRepository = AppDataSource.getRepository(YouTubeVideo);
            const video = videoRepository.create(body);
            const savedVideo = await videoRepository.save(video);
            return {
                response: JSON.stringify(savedVideo),
                status: 201
            };
        } catch (error) {
            console.error("Error saving YouTube video:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }

    public static async removeVideo(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser?.isAdmin) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }
        try {
            const body = await this.readBody(req);
            const videoId = Number(body.id);
            if (!videoId) {
                return {
                    response: JSON.stringify('Video ID is required'),
                    status: 400
                };
            }
            const videoRepository = AppDataSource.getRepository(YouTubeVideo);
            const result = await videoRepository.delete(videoId);
            if (result.affected === 0) {
                return {
                    response: JSON.stringify('Video not found'),
                    status: 404
                };
            }
            return {
                response: JSON.stringify('Video deleted successfully'),
                status: 200
            };
        } catch (error) {
            console.error("Error removing YouTube video:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            };
        }
    }
}