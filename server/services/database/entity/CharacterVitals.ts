import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
export class CharacterVitals {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => SavedCharacter, (char) => char.vitals, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_vitals_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "int", default: 10 })
    currentHp!: number;

    @Column({ type: "int", default: 10 })
    maxHp!: number;

    @Column({ type: "int", default: 0 })
    tempHp!: number;

    @Column({ type: "int", default: 10 })
    armorClass!: number;

    @Column({ type: "int", default: 0 })
    initiative!: number;

    @Column({ type: "varchar", length: 50, default: "30 ft." })
    speed!: string;

    @Column({ type: "int", default: 2 })
    proficiencyBonus!: number;

    @Column({ type: "int", default: 10 })
    passivePerception!: number;

    @Column({ type: "int", default: 10 })
    passiveInvestigation!: number;

    @Column({ type: "int", default: 10 })
    passiveInsight!: number;

    @Column({ type: "varchar", length: 50, default: "None" })
    darkvision!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    blindsight?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    truesight?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    tremorsense?: string;

    @Column({ type: "varchar", length: 50, default: "1d8" })
    hitDice!: string;

    @Column({ type: "boolean", default: false })
    heroicInspiration!: boolean;

    @Column({ type: "int", default: 10 })
    spellSaveDc!: number;

    @Column({ type: "int", default: 0 })
    spellAttackBonus!: number;

    @Column({ type: "varchar", length: 20, default: "none" })
    spellcastingAbility!: string;

    @Column({ type: "int", default: 0 })
    deathSuccesses!: number;

    @Column({ type: "int", default: 0 })
    deathFailures!: number;

    @Column({ type: "boolean", default: false })
    isStable!: boolean;

    @Column({ type: "text", nullable: true })
    savingThrowNotes?: string;
}

export default CharacterVitals;
