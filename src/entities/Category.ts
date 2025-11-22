import Tag from "./Tag"
import World from "./World"

export default class Category {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public worlds: World[] = [],
        public tags: Tag[] = []
    ) {}

}