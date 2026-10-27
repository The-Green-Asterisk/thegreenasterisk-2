import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(["characterId", "scope", "itemName"], { unique: true })
export class CharacterEquipState {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 40 })
    characterId!: string;

    @Column({ type: "varchar", length: 20 })
    scope!: "item" | "weapon" | "weapon-mastery";

    @Column({ type: "varchar", length: 255 })
    itemName!: string;

    @Column({ type: "int", nullable: true })
    definitionId?: number;

    @Column({ type: "boolean", default: false })
    equipped!: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}

export default CharacterEquipState;
