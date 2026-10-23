export type PrDigestSection = 'red' | 'yellow' | 'green';

export type PrDigestEvent = {
    at: string,
    actor: string | null,
    action: string
}

export type PrDigestPr = {
    section: PrDigestSection,
    repo: string,
    number: number,
    url: string,
    tickets: string[],
    owners?: string[],
    draft?: boolean,
    status: string,
    events: PrDigestEvent[]
}

export default class PrDigest {

    constructor(
        public checkedAt: string,
        public prs: PrDigestPr[],
        public jiraUrl?: string
    ) { }

}
