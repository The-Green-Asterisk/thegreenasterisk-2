import { Category, Tag } from "@entities";

export default class World {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public categories: Category[] = [],
        public tags: Tag[] = []
    ) {}

}