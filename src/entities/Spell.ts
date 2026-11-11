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
    /** Who made it through the Add Custom Spell dialog; null for everything else */
    createdById?: number | null;
    /** Fields locked against D&D Beyond reloads, as JSON ({ "description": true, ... }) */
    lockedFields?: string | null;
    createdAt?: Date;
}
