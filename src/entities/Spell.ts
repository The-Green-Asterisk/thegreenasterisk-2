export default class Spell {
    id!: number;
    slug!: string;
    name!: string;
    level!: number;
    school!: string;
    source!: string;
    castingTime!: string;
    range!: string;
    duration!: string;
    components!: string;
    concentration!: boolean;
    ritual!: boolean;
    description!: string;
    damageDice?: string;
    damageType?: string;
    damageModifier?: string;
    damageScaling?: string;
    classes?: string;
    imageUrl?: string;
    dndBeyondId?: number;
    isCustom!: boolean;
    createdAt?: Date;
}
