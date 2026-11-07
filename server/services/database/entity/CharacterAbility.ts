import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "abbr"])
export class CharacterAbility {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.abilities, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_ability_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 50 })
    name!: string; // e.g. "Strength", "Dexterity"

    @Column({ type: "varchar", length: 10 })
    abbr!: string; // "STR", "DEX", etc.

    @Column({ type: "int" })
    score!: number;

    @Column({ type: "int" })
    baseScore!: number;

    @Column({ type: "int", default: 0 })
    bonus!: number;

    @Column({ type: "int" })
    modifier!: number;

    @Column({ type: "int" })
    save!: number;

    @Column({ type: "boolean", default: false })
    proficientSave!: boolean;

    @Column({ type: "text", nullable: true })
    notes?: string;
}

export default CharacterAbility;
