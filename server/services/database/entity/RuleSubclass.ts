import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { RuleClass } from "./RuleClass";

@Entity({ name: "rule_subclasses" })
@Unique(["classSlug", "slug"])
export class RuleSubclass {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    classId!: number;

    @Column({ type: "varchar", length: 100 })
    classSlug!: string; // e.g. "fighter", "cleric", "barbarian"

    @Column({ type: "varchar", length: 100 })
    slug!: string; // e.g. "battle-master", "life", "berserker"

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "text", nullable: true })
    spellcastingOverrideJson?: string; // For third-casters or altered spellcasting

    @Column({ type: "longtext" })
    progressionJson!: string; // JSON array of ProgressionLevel (levels 3, 6, 10, 14, etc.)

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

    @ManyToOne(() => RuleClass, (cls) => cls.subclassEntities, { onDelete: "CASCADE" })
    @JoinColumn({ name: "classId" })
    classEntity?: RuleClass;
}

export default RuleSubclass;
