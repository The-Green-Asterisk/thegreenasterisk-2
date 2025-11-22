import Category from "./Category"
import Tag from "./Tag"

export default class World {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public categories: Category[] = [],
        public tags: Tag[] = []
    ) {}

}