import http from "http";
import AppDataSource from "services/database";
import { Comment, CommentModel } from "services/database/entity/Comment";
import { User } from "services/database/entity/User";
import BaseController from "./baseController";

export default class CommentController extends BaseController {
    constructor() {
        super();
    }
    
    public static async addComment(req: http.IncomingMessage, res: http.ServerResponse) {
        const comment = await this.readBody<CommentModel>(req);

        if (!comment.content) {
            return {
                response: JSON.stringify({ error: 'Comment content is required' }),
                header: 'application/json',
                status: 400
            }
        }

        if (!comment.authorId) {
            return {
                response: JSON.stringify({ error: 'Author ID is required' }),
                header: 'application/json',
                status: 400
            }
        }

        if (!comment.commentableId || !comment.commentableType) {
            return {
                response: JSON.stringify({ error: 'Commentable ID and Type are required' }),
                header: 'application/json',
                status: 400
            }
        }
        
        try {
            const commentRepository = AppDataSource.getRepository(Comment);
            const newComment = commentRepository.create(comment);

            const userRepository = AppDataSource.getRepository(User);
            const author = await userRepository.findOneBy({ id: comment.authorId });

            if (!author) {
                return {
                    response: JSON.stringify({ error: 'Author not found' }),
                    header: 'application/json',
                    status: 400
                }
            }

            newComment.author = author;

            const savedComment = await commentRepository.save(newComment);
            return {
                response: JSON.stringify(savedComment),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error adding comment:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            }
        }
    }

    public static async getComments(req: http.IncomingMessage, res: http.ServerResponse) {
        const { commentableType, commentableId } = this.parseUrlQuery(req.url);
        if (!commentableType || !commentableId) {
            return {
                response: JSON.stringify({ error: 'Commentable Type and ID are required' }),
                header: 'application/json',
                status: 400
            }
        }

        try {
            const commentRepository = AppDataSource.getRepository(Comment);
            const comments = await commentRepository.find({
                where: {
                    commentableType: commentableType as string,
                    commentableId: parseInt(commentableId as string)
                },
                relations: ['author']
            });
            return {
                response: JSON.stringify(comments),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching comments:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            }
        }
    }

    public static async editComment(req: http.IncomingMessage, res: http.ServerResponse) {
        const commentModel = await this.readBody<CommentModel>(req);
        if (!commentModel.id) {
            return {
                response: JSON.stringify({ error: 'Comment ID is required' }),
                header: 'application/json',
                status: 400
            }
        }

        try {
            const commentRepository = AppDataSource.getRepository(Comment);
            const comment = await commentRepository.findOneBy({ id: commentModel.id });

            if (!comment) {
                return {
                    response: JSON.stringify({ error: 'Comment not found' }),
                    header: 'application/json',
                    status: 404
                }
            }

            comment.content = commentModel.content || comment.content;

            await commentRepository.save(comment);
            return {
                response: JSON.stringify(comment),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error editing comment:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            }
        }
    }

    public static async deleteComment(req: http.IncomingMessage, res: http.ServerResponse) {
        const { commentId } = await this.readBody(req);
        if (!commentId) {
            return {
                response: JSON.stringify({ error: 'Comment ID is required' }),
                header: 'application/json',
                status: 400
            }
        }
        try {
            const commentRepository = AppDataSource.getRepository(Comment);
            const comment = await commentRepository.findOneBy({ id: parseInt(commentId as string) });
            if (!comment) {
                return {
                    response: JSON.stringify({ error: 'Comment not found' }),
                    header: 'application/json',
                    status: 404
                }
            }
            await commentRepository.remove(comment);
            return {
                response: JSON.stringify({ message: 'Comment deleted successfully' }),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error deleting comment:", error);
            return {
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            }
        }
    }
}