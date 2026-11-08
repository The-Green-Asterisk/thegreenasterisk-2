import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "rule_backgrounds" })
export class RuleBackground {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    slug!: string; // e.g. "soldier", "acolyte"

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "text" })
    allowedAbilitiesJson!: string; // JSON array of string: ["str", "dex", "con"]

    @Column({ type: "text" })
    skillsJson!: string; // JSON array of string: ["Athletics", "Intimidation"]

    @Column({ type: "varchar", length: 150, default: "" })
    tool!: string;

    @Column({ type: "varchar", length: 100, default: "" })
    originFeatId!: string;

    @Column({ type: "text", default: "" })
    equipmentSummary!: string;

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

export default RuleBackground;
