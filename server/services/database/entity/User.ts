import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Comment } from "./Comment"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public firstName!: string

    @Column()
    public lastName!: string

    @Column()
    public profilePicture!: string

    @Column()
    public username!: string

    @Column()
    public discord_id!: string

    @Column()
    public age!: number

    @Column()
    public email!: string

    @Column()
    public password!: string

    @Column()
    public isAdmin!: boolean

    @OneToMany(() => Comment, (comment) => comment.author)
    public comments!: Comment[]

}
