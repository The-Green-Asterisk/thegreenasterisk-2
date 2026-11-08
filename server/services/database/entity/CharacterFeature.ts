import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "name"])
export class CharacterFeature {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.features, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_feature_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 100 })
    source!: string; // "Class", "Species", "Feat", "Background"

    @Column({ type: "varchar", length: 50, default: "Class" })
    type!: "Class" | "Subclass" | "Invocation" | "Feat" | "Species";

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    scaleValue?: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    limitedUse?: string;
}

export default CharacterFeature;
