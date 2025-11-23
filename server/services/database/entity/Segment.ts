import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { WorldEntity } from "./WorldEntity"

@Entity()
export class Segment {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column()
    public description!: string

    @Column({ default: true })
    public isActive!: boolean

    @ManyToOne(() => WorldEntity, (worldEntity) => worldEntity.segments)
    public worldEntity!: WorldEntity

}