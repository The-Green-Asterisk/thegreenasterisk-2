import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

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

}