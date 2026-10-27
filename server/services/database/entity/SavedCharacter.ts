import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
@Index(["user", "name"])
@Index(["siteCharacterId"], { unique: true })
export class SavedCharacter {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId", foreignKeyConstraintName: "FK_saved_character_user" })
    user!: User;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 32, unique: true })
    siteCharacterId!: string;

    @Column({ type: "varchar", length: 40, nullable: true })
    externalCharacterId?: string;

    @Column({ type: "varchar", length: 20, default: "site" })
    source!: "site" | "dndbeyond";

    @Column({ type: "longtext" })
    payload!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}

export default SavedCharacter;