import { Category, Segment, Stat, Tag, World } from "@entities";

export default class WorldEntity {

    id!: number

    constructor(
        public name: string,
        public description: string,
        public shortDescription: string,
        public entityImgUrl: string,
        public worlds: World[] = [],
        public categories: Category[] = [],
        public stats: Stat[] = [],
        public segments: Segment[] = [],
        public tags: Tag[] = []
    ) {}

}