import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Comment {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'longtext'})
    public content!: string;

    @ManyToOne(() => User, (user) => user.comments)
    public author!: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    public createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    public updatedAt!: Date;

    @Column()
    public commentableType!: string;

    @Column()
    public commentableId!: number;
}


export class CommentModel {
    id?: number;
    content!: string;
    authorId!: number;
    commentableType!: string;
    commentableId!: number;
}