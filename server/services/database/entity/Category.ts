import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Tag } from "./Tag"
import { World } from "./World"

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column()
    public description!: string

    @ManyToMany(() => World, { eager: true, cascade: true })
    @JoinTable()
    public worlds!: World[]
    
    @ManyToMany(() => Tag, { eager: true, cascade: true })
    @JoinTable()
    public tags!: Tag[]

}