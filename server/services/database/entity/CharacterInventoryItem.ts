import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SavedCharacter } from "./SavedCharacter";

@Entity()
@Index(["savedCharacter", "name"])
export class CharacterInventoryItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => SavedCharacter, (char) => char.inventory, { onDelete: "CASCADE" })
    @JoinColumn({ name: "savedCharacterId", foreignKeyConstraintName: "FK_character_item_saved_character" })
    savedCharacter!: SavedCharacter;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "int", default: 1 })
    quantity!: number;

    @Column({ type: "boolean", default: false })
    equipped!: boolean;

    @Column({ type: "boolean", default: false })
    attuned!: boolean;

    @Column({ type: "boolean", default: false })
    requiresAttunement!: boolean;

    @Column({ type: "varchar", length: 100, default: "Gear" })
    category!: string; // "Simple Melee", "Martial Ranged", "Light Armor", "Gear", etc.

    @Column({ type: "varchar", length: 50, nullable: true })
    damage?: string; // "1d8 + 3 Slashing"

    @Column({ type: "varchar", length: 50, nullable: true })
    damageType?: string; // "Slashing"

    @Column({ type: "varchar", length: 20, nullable: true })
    damageDie?: string; // "1d8"

    @Column({ type: "varchar", length: 20, nullable: true })
    attackBonus?: string; // "+5"

    @Column({ type: "int", nullable: true })
    toHitModifier?: number;

    @Column({ type: "varchar", length: 50, nullable: true })
    range?: string;

    @Column({ type: "text", nullable: true })
    propertiesJson?: string; // JSON array of string properties

    @Column({ type: "varchar", length: 50, nullable: true })
    masteryName?: string; // e.g. "Vex", "Nick"

    @Column({ type: "boolean", nullable: true })
    masteryUnlocked?: boolean;

    @Column({ type: "text", nullable: true })
    masteryDescription?: string;

    @Column({ type: "boolean", default: false })
    isMagic!: boolean;

    @Column({ type: "varchar", length: 50, nullable: true })
    rarity?: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({ type: "text", nullable: true })
    notes?: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    grantedBy?: string;

    @Column({ type: "text", nullable: true })
    imageUrl?: string;
}

export default CharacterInventoryItem;
