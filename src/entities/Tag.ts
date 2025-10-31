export default class Tag {
    id!: number
    constructor(
        public name: string,
        public code: string,
        public isActive: boolean,
        public description?: string,
    ) {}
}