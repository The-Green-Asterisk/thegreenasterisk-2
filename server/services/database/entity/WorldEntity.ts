import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Tag } from "./Tag"
import { World } from "./World"
import { Category } from "./Category"
import { Stat } from "./Stat"
import { Segment } from "./Segment"
import { User } from "./User"

@Entity()
export class WorldEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column({ type: 'longtext'})
    public description!: string

    @Column()
    public shortDescription!: string

    @Column()
    public entityImgUrl!: string

    @ManyToMany(() => World, { eager: true })
    @JoinTable()
    public worlds!: World[]

    @ManyToMany(() => Category, { eager: true })
    @JoinTable()
    public categories!: Category[]

    @OneToMany(() => Stat, stat => stat.worldEntity, { eager: true, cascade: true })
    @JoinTable()
    public stats!: Stat[]

    @OneToMany(() => Segment, segment => segment.worldEntity, { eager: true, cascade: true })
    @JoinTable()
    public segments!: Segment[]
    
    @ManyToMany(() => Tag, { eager: true })
    @JoinTable()
    public tags!: Tag[]
    
    @ManyToMany(() => User, { eager: false})
    @JoinTable()
    public editors!: User[]

}