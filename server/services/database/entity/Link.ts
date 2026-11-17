import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { User } from "./User";

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
    primaryType!: boolean;

    @Column()
    sortOrder!: number;

    @ManyToOne("User", { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "userId", foreignKeyConstraintName: "FK_link_user" })
    user?: User | null;

    @Column({ type: "int", nullable: true })
    userId?: number | null;
}