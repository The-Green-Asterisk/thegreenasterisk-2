import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Link {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    url!: string;

    @Column()
    iconClass!: string;

    @Column()
    imageUrl!: string;

    @Column()
    text!: string;

    @Column()
    primaryType!: boolean

    @Column()
    sortOrder!: number
}