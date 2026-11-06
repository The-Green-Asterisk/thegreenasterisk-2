import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "conditions" })
export class Condition {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, unique: true })
    slug!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 500, default: "" })
    summary!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 100, default: "fa-solid fa-circle-exclamation" })
    icon!: string;

    @Column({ type: "boolean", default: false })
    hasLevels!: boolean;

    @Column({ type: "int", default: 0 })
    maxLevel!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}

export default Condition;
