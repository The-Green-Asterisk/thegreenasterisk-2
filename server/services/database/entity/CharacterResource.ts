import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "name"])
export class CharacterResource {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.resources, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_resource_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "int" })
    total!: number;

    @Column({ type: "int", default: 0 })
    currentUsed!: number;

    @Column({ type: "varchar", length: 20, default: "long" })
    resetOn!: "short" | "long";

    @Column({ type: "varchar", length: 50, nullable: true })
    dieOrType?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    resourceKey?: string;
}

export default CharacterResource;
