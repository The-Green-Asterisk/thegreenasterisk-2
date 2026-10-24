import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PushSubscriber {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    public endpoint!: string;

    @Column()
    public p256dh!: string;

    @Column()
    public auth!: string;

    @Column({ length: 50, default: 'pr-digest' })
    public type!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_push_subscriber_user' })
    public user?: User | null;
}
