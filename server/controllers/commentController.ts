import http from "http";
import AppDataSource from "services/database";
import { Comment, CommentModel } from "services/database/entity/Comment";
import { User } from "services/database/entity/User";
import EmailService from "services/email";
import BaseController from "./baseController";
import SessionController from "./sessionController";

export default class CommentController extends BaseController {
    constructor() {
        super();
    }

    public static async addComment(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }

        const comment = await this.readBody<CommentModel>(req);

        if (!comment.content) {
            return {
                response: JSON.stringify('Comment content is required'),
                status: 400
            }
        }

        if (!comment.commentableId || !comment.commentableType) {
            return {
                response: JSON.stringify('Commentable ID and Type are required'),
                status: 400
            }
        }

        try {
            comment.content = comment.content.replace(/\n/g, '<br/>');
            const commentRepository = AppDataSource.getRepository(Comment);
            const newComment = commentRepository.create(comment);

            const userRepository = AppDataSource.getRepository(User);
            const author = await userRepository.findOneBy({ id: currentUser.id });

            if (!author) {
                return {
                    response: JSON.stringify('Author not found'),
                    status: 400
                }
            }

            newComment.author = author;

            const savedComment = await commentRepository.save(newComment);

            EmailService.sendEmail('steve@mail.thegreenasterisk.com', 'New Comment!', `${author.username} has posted new comment: ${savedComment.content}`)
            return {
                response: JSON.stringify(savedComment),
                status: 201
            };
        } catch (error) {
            console.error("Error adding comment:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }

    public static async getComments(req: http.IncomingMessage, res: http.ServerResponse) {
        const { commentableType, commentableId } = this.parseUrlQuery(req.url);
        if (!commentableType || !commentableId) {
            return {
                response: JSON.stringify('Commentable Type and ID are required'),
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
                status: 200
            };
        } catch (error) {
            console.error("Error fetching comments:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }

    public static async editComment(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }

        const commentModel = await this.readBody<CommentModel>(req);
        if (!commentModel.id) {
            return {
                response: JSON.stringify('Comment ID is required'),
                status: 400
            }
        }

        try {
            const commentRepository = AppDataSource.getRepository(Comment);
            const comment = await commentRepository.findOne({
                where: { id: commentModel.id },
                relations: ['author']
            });

            if (!comment) {
                return {
                    response: JSON.stringify('Comment not found'),
                    status: 404
                }
            }

            if (!currentUser.isAdmin && comment.author?.id !== currentUser.id) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                };
            }

            comment.content = commentModel.content || comment.content;

            await commentRepository.save(comment);
            return {
                response: JSON.stringify(comment),
                status: 200
            };
        } catch (error) {
            console.error("Error editing comment:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }

    public static async deleteComment(req: http.IncomingMessage, res: http.ServerResponse) {
        const currentUser = SessionController.getUser(req);
        if (!currentUser) {
            return {
                response: JSON.stringify('Unauthorized'),
                status: 401
            };
        }

        const { commentId } = await this.readBody(req);
        if (!commentId) {
            return {
                response: JSON.stringify('Comment ID is required'),
                status: 400
            }
        }
        try {
            const commentRepository = AppDataSource.getRepository(Comment);
            const comment = await commentRepository.findOne({
                where: { id: parseInt(commentId as string) },
                relations: ['author']
            });
            if (!comment) {
                return {
                    response: JSON.stringify('Comment not found'),
                    status: 404
                }
            }

            if (!currentUser.isAdmin && comment.author?.id !== currentUser.id) {
                return {
                    response: JSON.stringify('Forbidden'),
                    status: 403
                };
            }

            await commentRepository.remove(comment);
            return {
                response: JSON.stringify('Comment deleted successfully'),
                status: 200
            };
        } catch (error) {
            console.error("Error deleting comment:", error);
            return {
                response: JSON.stringify('Internal Server Error'),
                status: 500
            }
        }
    }
}