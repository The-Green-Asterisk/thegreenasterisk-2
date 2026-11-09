import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "name"])
export class CharacterSpell {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.spells, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_spell_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "int", default: 0 })
    level!: number;

    @Column({ type: "varchar", length: 50, default: "Evocation" })
    school!: string;

    @Column({ type: "varchar", length: 100, default: "Class" })
    source!: string; // "Class", "Species", "Origin Feat", etc.

    @Column({ type: "boolean", default: false })
    prepared!: boolean;

    @Column({ type: "boolean", default: false })
    alwaysPrepared!: boolean;

    @Column({ type: "varchar", length: 100, nullable: true })
    viaFeature?: string | null; // feature that put the spell on a class it isn't normally on, e.g. "Magical Secrets"

    @Column({ type: "varchar", length: 255, default: "1 Action" })
    castingTime!: string;

    @Column({ type: "varchar", length: 255, default: "Touch" })
    range!: string;

    @Column({ type: "varchar", length: 255, default: "Instantaneous" })
    duration!: string;

    @Column({ type: "text", nullable: true })
    components?: string;

    @Column({ type: "boolean", default: false })
    concentration!: boolean;

    @Column({ type: "boolean", default: false })
    ritual!: boolean;

    @Column({ type: "text", nullable: true })
    description?: string;
}

export default CharacterSpell;
