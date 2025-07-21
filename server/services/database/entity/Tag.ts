import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Tag {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    public name!: string

    @Column({ nullable: true })
    public description?: string

    @Column()
    public code!: string

    @Column({ default: true })
    public isActive!: boolean

}