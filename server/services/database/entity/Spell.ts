import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Spell {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, unique: true })
    slug!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "int", default: 0 })
    level!: number;

    @Column({ type: "varchar", length: 100, default: "Universal" })
    school!: string;

    @Column({ type: "varchar", length: 255, default: "Custom" })
    source!: string;

    @Column({ type: "varchar", length: 150, default: "1 Action" })
    castingTime!: string;

    @Column({ type: "varchar", length: 150, default: "Self" })
    range!: string;

    @Column({ type: "varchar", length: 150, default: "Instantaneous" })
    duration!: string;

    @Column({ type: "varchar", length: 255, default: "V, S" })
    components!: string;

    @Column({ type: "boolean", default: false })
    concentration!: boolean;

    @Column({ type: "boolean", default: false })
    ritual!: boolean;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    imageUrl?: string;

    @Column({ type: "int", nullable: true })
    dndBeyondId?: number;

    @Column({ type: "boolean", default: false })
    isCustom!: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}
export default Spell;
