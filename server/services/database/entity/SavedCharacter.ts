import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { CharacterVitals } from "./CharacterVitals";
import { CharacterClass } from "./CharacterClass";
import { CharacterAbility } from "./CharacterAbility";
import { CharacterSkill } from "./CharacterSkill";
import { CharacterInventoryItem } from "./CharacterInventoryItem";
import { CharacterSpell } from "./CharacterSpell";
import { CharacterFeature } from "./CharacterFeature";
import { CharacterResource } from "./CharacterResource";
import { CharacterFeatureDecision } from "./CharacterFeatureDecision";

@Entity()
@Index(["user", "name"])
@Index(["siteCharacterId"], { unique: true })
export class SavedCharacter {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId", foreignKeyConstraintName: "FK_saved_character_user" })
    user!: User;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 32, unique: true })
    siteCharacterId!: string;

    @Column({ type: "varchar", length: 40, nullable: true })
    externalCharacterId?: string;

    @Column({ type: "varchar", length: 20, default: "site" })
    source!: "site" | "dndbeyond";

    @Column({ type: "int", default: 1 })
    level!: number;

    @Column({ type: "varchar", length: 100, nullable: true })
    race?: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    background?: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    alignment?: string;

    @Column({ type: "text", nullable: true })
    avatarUrl?: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    dndBeyondUrl?: string;

    @Column({ type: "longtext" })
    payload!: string;

    @OneToOne(() => CharacterVitals, (vitals) => vitals.savedCharacter, { cascade: true })
    vitals?: CharacterVitals;

    @OneToMany(() => CharacterClass, (cls) => cls.savedCharacter, { cascade: true })
    classes?: CharacterClass[];

    @OneToMany(() => CharacterAbility, (ability) => ability.savedCharacter, { cascade: true })
    abilities?: CharacterAbility[];

    @OneToMany(() => CharacterSkill, (skill) => skill.savedCharacter, { cascade: true })
    skills?: CharacterSkill[];

    @OneToMany(() => CharacterInventoryItem, (item) => item.savedCharacter, { cascade: true })
    inventory?: CharacterInventoryItem[];

    @OneToMany(() => CharacterSpell, (spell) => spell.savedCharacter, { cascade: true })
    spells?: CharacterSpell[];

    @OneToMany(() => CharacterFeature, (feat) => feat.savedCharacter, { cascade: true })
    features?: CharacterFeature[];

    @OneToMany(() => CharacterResource, (res) => res.savedCharacter, { cascade: true })
    resources?: CharacterResource[];

    @OneToMany(() => CharacterFeatureDecision, (decision) => decision.savedCharacter, { cascade: true })
    decisions?: CharacterFeatureDecision[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}

export default SavedCharacter;
