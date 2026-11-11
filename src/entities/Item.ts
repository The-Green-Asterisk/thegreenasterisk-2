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
    /** Effects on the character while equipped (and attuned), as JSON StatModifier[]; null follows the seed list */
    modifiersJson?: string | null;
    /** Charges, as JSON { max, resetOn, resetLabel? } */
    chargesJson?: string | null;
    /** Who made it through an Add Custom dialog; null for everything else */
    createdById?: number | null;
    /** Fields locked against D&D Beyond reloads, as JSON ({ "description": true, ... }) */
    lockedFields?: string | null;
    createdAt?: Date;
}
