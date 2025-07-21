import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Tag } from "./Tag"

@Entity()
export class YouTubeVideo {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public title!: string

    @Column()
    public description!: string

    @Column()
    public episodeNum!: number

    @Column()
    public videoId!: string

    @Column()
    public embedUrl!: string

    @Column()
    public url!: string
    
    @ManyToMany(() => Tag, { eager: true, cascade: true })
    @JoinTable()
    public tags!: Tag[]

}