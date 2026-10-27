export default class Item {
    id!: number;
    slug!: string;
    name!: string;
    filterType!: string;
    rarity!: string;
    isMagic!: boolean;
    requiresAttunement!: boolean;
    source!: string;
    category?: string;
    damage?: string;
    range?: string;
    properties?: string;
    mastery?: string;
    weight!: number;
    cost?: number;
    description!: string;
    imageUrl?: string;
    dndBeyondId?: number;
    isCustom!: boolean;
    createdAt?: Date;
}
