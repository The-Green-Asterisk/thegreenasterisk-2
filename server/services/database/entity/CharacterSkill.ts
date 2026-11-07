import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "name"])
export class CharacterSkill {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.skills, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_skill_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 100 })
    name!: string; // e.g. "Stealth", "Perception"

    @Column({ type: "varchar", length: 10 })
    stat!: string; // "DEX", "WIS", etc.

    @Column({ type: "int", default: 0 })
    bonus!: number;

    @Column({ type: "varchar", length: 20, default: "none" })
    proficiency!: "none" | "proficient" | "expertise";
}

export default CharacterSkill;
