import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PrDigest {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'longtext' })
    public payload!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    public updatedAt!: Date;
}
