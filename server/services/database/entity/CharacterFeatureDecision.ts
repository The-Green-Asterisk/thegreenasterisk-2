import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "decisionId"])
export class CharacterFeatureDecision {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.decisions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_decision_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 100 })
    decisionId!: string;

    @Column({ type: "text" })
    selectedValue!: string;
}

export default CharacterFeatureDecision;
