import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { WorldEntity } from "./WorldEntity"

@Entity()
export class Stat {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column()
    public value!: string

    @Column({ default: true })
    public isActive!: boolean

    @ManyToOne(() => WorldEntity, (worldEntity) => worldEntity.stats)
    public worldEntity!: WorldEntity

}