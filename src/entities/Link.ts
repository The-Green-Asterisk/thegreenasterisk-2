export default class Link {

    id?: number

    constructor(
        public url: string,
        public iconClass: string,
        public imageUrl: string,
        public text: string,
        public primaryType: boolean
    ) { }

}