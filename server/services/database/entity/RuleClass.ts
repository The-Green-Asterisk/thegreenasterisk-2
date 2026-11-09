import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { RuleSubclass } from "./RuleSubclass";

@Entity({ name: "rule_classes" })
export class RuleClass {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    slug!: string; // e.g. "barbarian", "fighter", "artificer"

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "text" })
    description!: string;

    @Column({ type: "int", default: 8 })
    hitDie!: number;

    @Column({ type: "text" })
    primaryAbilitiesJson!: string; // JSON array of string: ["str", "con"]

    @Column({ type: "text" })
    savingThrowsJson!: string; // JSON array of string: ["str", "con"]

    @Column({ type: "text" })
    armorProficienciesJson!: string; // JSON array of string

    @Column({ type: "text" })
    weaponProficienciesJson!: string; // JSON array of string

    @Column({ type: "int", default: 0 })
    weaponMasteryCount!: number;

    @Column({ type: "text" })
    skillChoicesJson!: string; // JSON { count: 2, from: [...] }

    @Column({ type: "text", nullable: true })
    spellcastingJson?: string; // JSON spellcasting details

    @Column({ type: "text", nullable: true })
    multiclassingJson?: string; // JSON { prerequisites: ..., proficiencies: ... }

    @Column({ type: "text", nullable: true })
    scalingTraitsJson?: string; // JSON { weaponMasteriesByLevel: [...], ... }

    @Column({ type: "longtext" })
    featuresJson!: string; // JSON array of { level, name, description }

    @Column({ type: "longtext", nullable: true })
    progressionJson?: string; // JSON array of ProgressionLevel

    @Column({ type: "longtext" })
    subclassesJson!: string; // JSON array of { id, name, description, features }

    @OneToMany("RuleSubclass", "classEntity")
    subclassEntities?: RuleSubclass[];

    @Column({ type: "text", nullable: true })
    startingEquipmentJson?: string; // JSON array of equipment options

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

export default RuleClass;
