import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

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

}