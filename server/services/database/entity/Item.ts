import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { User } from "./User";

@Entity()
export class Item {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, unique: true })
    slug!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 100, default: "Item" })
    filterType!: string; // "Weapon", "Potion", "Armor", "Wondrous item", "Gear", etc.

    @Column({ type: "varchar", length: 100, default: "Common" })
    rarity!: string;

    @Column({ type: "boolean", default: false })
    isMagic!: boolean;

    @Column({ type: "boolean", default: false })
    requiresAttunement!: boolean;

    @Column({ type: "varchar", length: 255, default: "Standard" })
    source!: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    category?: string; // e.g. "Simple Melee", "Martial Ranged", "Potion"

    @Column({ type: "varchar", length: 100, nullable: true })
    damage?: string; // e.g. "1d4 Piercing"

    @Column({ type: "varchar", length: 100, nullable: true })
    range?: string; // e.g. "20/60 ft."

    @Column({ type: "varchar", length: 255, nullable: true })
    properties?: string; // e.g. "Finesse, Light, Thrown, Nick"

    @Column({ type: "varchar", length: 100, nullable: true })
    mastery?: string; // e.g. "Nick"

    @Column({ type: "float", default: 0 })
    weight!: number;

    @Column({ type: "float", nullable: true })
    cost?: number;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "varchar", length: 500, nullable: true })
    imageUrl?: string;

    @Column({ type: "int", nullable: true })
    dndBeyondId?: number;

    @Column({ type: "boolean", default: false })
    isCustom!: boolean;

    /** Rules modifiers while equipped (and attuned), as JSON (e.g. senses); see itemMechanics.ts */
    @Column({ type: "text", nullable: true })
    modifiersJson?: string;

    /** Who made it through the Add Custom dialog; null for pulled, seeded, and pre-existing rows */
    @ManyToOne("User", { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "createdById", foreignKeyConstraintName: "FK_item_created_by_user" })
    createdBy?: User | null;

    @Column({ type: "int", nullable: true })
    createdById?: number | null;

    /** Fields an edit locked against D&D Beyond reloads and auto-fixes, as a JSON object of lock key → true; see definitionLocks.ts */
    @Column({ type: "text", nullable: true })
    lockedFields?: string | null;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}
export default Item;
