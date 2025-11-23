import Category from "./Category";
import { Segment } from "./Segment";
import Stat from "./Stat";
import Tag from "./Tag";
import World from "./World";

export class WorldEntity {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public shortDescription: string,
        public worlds: World[] = [],
        public categories: Category[] = [],
        public stats: Stat[] = [],
        public segments: Segment[] = [],
        public tags: Tag[] = []
    ) {}

}