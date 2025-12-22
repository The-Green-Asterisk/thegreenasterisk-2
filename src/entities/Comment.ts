import { User } from "@entities"

export default class Comment {
    id!: number
    author!: User
    content!: string
    createdAt!: Date
    updatedAt!: Date
    commentableType!: string
    commentableId!: number
}

export class CommentModel {
    id?: number
    content!: string;
    authorId!: number;
    commentableType!: string;
    commentableId!: number;
}