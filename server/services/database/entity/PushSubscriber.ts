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

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_push_subscriber_user' })
    public user!: User;
}
