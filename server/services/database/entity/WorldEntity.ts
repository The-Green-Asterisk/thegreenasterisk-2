import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Tag } from "./Tag"
import { World } from "./World"
import { Category } from "./Category"
import { Stat } from "./Stat"
import { Segment } from "./Segment"

@Entity()
export class WorldEntity {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column()
    public description!: string

    @Column()
    public shortDescription!: string

    @ManyToMany(() => World, { eager: true, cascade: true })
    @JoinTable()
    public worlds!: World[]

    @ManyToMany(() => Category, { eager: true, cascade: true })
    @JoinTable()
    public categories!: Category[]

    @ManyToMany(() => Stat, { eager: true, cascade: true })
    @JoinTable()
    public stats!: Stat[]

    @ManyToMany(() => Segment, { eager: true, cascade: true })
    @JoinTable()
    public segments!: Segment[]
    
    @ManyToMany(() => Tag, { eager: true, cascade: true })
    @JoinTable()
    public tags!: Tag[]

}