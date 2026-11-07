import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "rule_species" })
export class RuleSpecies {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    slug!: string; // e.g. "human", "elf", "dwarf"

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 50, default: "Medium" })
    size!: string;

    @Column({ type: "int", default: 30 })
    speed!: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    darkvision?: string;

    @Column({ type: "longtext" })
    traitsJson!: string; // JSON array of { name, description }

    @Column({ type: "longtext", nullable: true })
    lineagesJson?: string; // JSON array of LineageDefinition

    @Column({ type: "int", default: 0 })
    extraSkillCount!: number;

    @Column({ type: "int", default: 0 })
    extraFeatCount!: number;

    @Column({ type: "varchar", length: 150, default: "2024 Core Rules" })
    source!: string;

    @Column({ type: "int", nullable: true })
    dndBeyondId?: number;

    @Column({ type: "boolean", default: false })
    isCustom!: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}

export default RuleSpecies;
