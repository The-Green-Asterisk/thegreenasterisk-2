import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Tag } from "./Tag"
import { World } from "./World"
import { WorldEntity } from "./WorldEntity"

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column()
    public description!: string

    @ManyToMany(() => World, { eager: false, cascade: true })
    @JoinTable()
    public worlds!: World[]

    @ManyToMany(() => WorldEntity, { eager: false, cascade: true })
    @JoinTable()
    public worldEntities!: WorldEntity[]
    
    @ManyToMany(() => Tag, { eager: true, cascade: true })
    @JoinTable()
    public tags!: Tag[]

}