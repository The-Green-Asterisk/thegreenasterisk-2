import http from "http";
import AppDataSource from "services/database";
import { Tag } from "services/database/entity/Tag";
import { YouTubeVideo } from "services/database/entity/YouTubeVideo";
import { In } from "typeorm";
import BaseController from "./baseController";

export default class YouTubeVideoController extends BaseController {
    constructor() {
        super();
    }

    public static async getVideos(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const query = this.parseUrlQuery(req.url);
            const tagIds = query.tagIds 
                ? typeof query.tagIds === 'string' 
                    ? query.tagIds.split(',').map(Number) 
                    : query.tagIds.map(Number) 
                : [];
            const videos = await AppDataSource.getRepository(YouTubeVideo).find({
                relations: ["tags"],
                where: tagIds.length > 0 ? { tags: { id: In(tagIds) } } : {},
            });
            return {
                response: JSON.stringify(videos.sort((a, b) => a.episodeNum - b.episodeNum)),
                header: "application/json",
                status: 200
            };
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async saveVideo(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody<YouTubeVideo>(req);
            if (!body || !body.title || !body.url) {
                return {
                    response: JSON.stringify({ error: 'Title and URL are required' }),
                    header: 'application/json',
                    status: 400
                };
            }
            if (body.tags) {
                const tagRepository = AppDataSource.getRepository(Tag);
                const existingTags = await tagRepository.findBy({ name: In(body.tags.map((tag: Tag) => tag.name)) });
                const newTags = body.tags.filter((tag: Tag) => !existingTags.some((existingTag: Tag) => existingTag.name === tag.name));
                if (newTags.length > 0) {
                    const createdTags = tagRepository.create(newTags);
                    body.tags = [...existingTags, ...await tagRepository.save(createdTags)];
                } else {
                    body.tags = existingTags;
                }
            }
            const videoRepository = AppDataSource.getRepository(YouTubeVideo);
            const video = videoRepository.create(body);
            const savedVideo = await videoRepository.save(video);
            return {
                response: JSON.stringify(savedVideo),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error saving YouTube video:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async removeVideo(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const body = await this.readBody(req);
            const videoId = Number(body.id);
            if (!videoId) {
                return {
                    response: JSON.stringify({ error: 'Video ID is required' }),
                    header: 'application/json',
                    status: 400
                };
            }
            const videoRepository = AppDataSource.getRepository(YouTubeVideo);
            const result = await videoRepository.delete(videoId);
            if (result.affected === 0) {
                return {
                    response: JSON.stringify({ error: 'Video not found' }),
                    header: 'application/json',
                    status: 404
                };
            }
            return {
                response: JSON.stringify({ message: 'Video deleted successfully' }),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error removing YouTube video:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }
}