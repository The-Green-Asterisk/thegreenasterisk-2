import { Tag } from './Tag'
export class YouTubeVideo {
    id!: number
    constructor(
        public title: string,
        public description: string,
        public episodeNum: number,
        public videoId: string,
        public embedUrl: string,
        public url: string,
        public tags: Tag[] = []
    ) {}
}