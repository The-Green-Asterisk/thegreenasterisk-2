import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Category } from "./Category"
import { Tag } from "./Tag"

@Entity()
export class World {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column()
    public description!: string

    @ManyToMany(() => Category, { eager: true, cascade: true })
    @JoinTable()
    public categories!: Category[]
    
    @ManyToMany(() => Tag, { eager: true, cascade: true })
    @JoinTable()
    public tags!: Tag[]

}