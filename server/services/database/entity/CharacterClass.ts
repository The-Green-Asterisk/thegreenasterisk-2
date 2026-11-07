import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "name"])
export class CharacterClass {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.classes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_class_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "int", default: 1 })
    level!: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    subclass?: string;

    @Column({ type: "boolean", default: true })
    isStartingClass!: boolean;
}

export default CharacterClass;
