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

    // 0 for videos outside any season, like Episode Zero
    @Column({ default: 1 })
    public season!: number

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