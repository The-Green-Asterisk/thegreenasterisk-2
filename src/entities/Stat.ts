import { WorldEntity } from "@entities";

export default class Stat {
    id!: number

    constructor(
        public name: string,
        public value: string,
        public isActive: boolean = true,
        public worldEntity: WorldEntity
    ) {}
}