import { WorldEntity } from "./WorldEntity";

export class Segment {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public isActive: boolean,
        public worldEntity: WorldEntity
    ) {}
}