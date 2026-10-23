import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

/**
 * Persists sessions so a dyno restart doesn't log everyone out. Only the
 * SHA-256 of the session key is stored, so a database leak can't be used
 * to sign in.
 */
@Entity()
export class UserSession {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index('IDX_user_session_tokenHash', { unique: true })
    @Column({ length: 64 })
    public tokenHash!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_user_session_user' })
    public user!: User;

    @Column({ type: 'timestamp' })
    public expiresAt!: Date;
}
