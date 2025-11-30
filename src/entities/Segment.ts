import { WorldEntity } from "@entities";

export default class Segment {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public displayOrder: number,
        public isActive: boolean = true
    ) {}
}