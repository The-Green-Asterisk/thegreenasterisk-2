import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "rule_feats" })
export class RuleFeat {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    slug!: string; // e.g. "alert", "tough", "great-weapon-master"

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 50, default: "general" }) // "origin", "general", "epic-boon"
    category!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    prerequisite?: string;

    @Column({ type: "text" }) // JSON array of string benefits
    benefitsJson!: string;

    @Column({ type: "text", nullable: true }) // JSON array of string stat options: ["str", "dex"]
    statOptionsJson?: string;

    @Column({ type: "boolean", default: false })
    isEpicBoon!: boolean;

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

export default RuleFeat;
