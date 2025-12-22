import { Tag, World, WorldEntity } from "@entities"

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