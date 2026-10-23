import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Site-wide values an admin can change without a deploy, keyed by name
 * (e.g. survivors.currentSeason).
 */
@Entity()
export class Setting {
    @PrimaryColumn({ length: 100 })
    public name!: string;

    @Column()
    public value!: string;
}
