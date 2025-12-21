import Tag from "./Tag"
import World from "./World"
import WorldEntity from "./WorldEntity"

export default class Category {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public worlds: World[] = [],
        public worldEntities: WorldEntity[] = [],
        public tags: Tag[] = []
    ) {}

}