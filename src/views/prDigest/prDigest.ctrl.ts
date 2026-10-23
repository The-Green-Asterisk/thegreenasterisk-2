import el from '@elements';
import { getData } from '@services/request';
import errorPage from '@views/errorPage/errorPage.template';
import PrDigest, { PrDigestPr, PrDigestSection } from '../../entities/PrDigest';

const SECTIONS: [PrDigestSection, string][] = [
    ['red', 'Red Alert'],
    ['yellow', 'Yellow Alert'],
    ['green', 'Green Alert']
];
// pr-watch pushes at least hourly while the laptop is awake
const STALE_MINUTES = 65;
let digestSection: HTMLElement | null | undefined = null;

export default async function prDigest() {
    el.title.textContent = 'PR Digest';
    digestSection = el.prDigest?.querySelector('section');
    if (!el.checkAdmin()) {
        notFound();
        return;
    }

    await renderDigest();
    setInterval(() => {
        if (document.visibilityState === 'visible') renderDigest();
    }, 60_000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') renderDigest();
    }, { signal: el.signal });
}

function notFound() {
    el.prDigest?.replaceWith(errorPage(404));
}

async function renderDigest() {
    if (!digestSection) return;

    let digest: PrDigest;
    try {
        digest = await getData<PrDigest>('/get-pr-digest');
    } catch (error) {
        if (error === 'Unauthorized') {
            notFound();
        } else {
            digestSection.replaceChildren(make('h1', 'PR Digest'), make('p', 'No digest has been pushed yet.'));
        }
        return;
    }

    // Everything in the digest is set as text, never parsed as HTML
    const checkedAt = new Date(digest.checkedAt);
    const minutesAgo = Math.round((Date.now() - checkedAt.getTime()) / 60_000);
    const checked = make('p', `Checked ${formatTime(checkedAt)} (${minutesAgo < 1 ? 'just now' : `${minutesAgo} min ago`})`, 'checked');
    if (minutesAgo > STALE_MINUTES) {
        checked.classList.add('stale');
        checked.append(make('span', 'The laptop may be asleep, so this could be out of date.'));
    }

    digestSection.replaceChildren(make('h1', 'PR Digest'), checked);
    for (const [key, heading] of SECTIONS) {
        const prs = digest.prs.filter(pr => pr.section === key);
        if (!prs.length) continue;
        const group = make('div', '', `alert ${key}`);
        group.append(make('h2', heading), ...prs.map(buildPr));
        digestSection.append(group);
    }
    if (!digest.prs.length) digestSection.append(make('p', 'No open PRs.'));
}

function buildPr(pr: PrDigestPr) {
    const card = make('article', '', 'pr');

    const link = make('a', `${pr.repo} #${pr.number}`) as HTMLAnchorElement;
    if (pr.url.startsWith('https://github.com/')) link.href = pr.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const heading = make('div', '', 'pr-heading');
    heading.append(link);
    if (pr.tickets.length) heading.append(make('span', pr.tickets.join(', '), 'tickets'));

    const events = make('ul', '', 'events');
    events.append(...pr.events.map(event => {
        const item = make('li', ` ${event.actor ? `${event.actor} ` : ''}${event.action}`);
        item.prepend(make('time', formatTime(new Date(event.at))));
        return item;
    }));

    card.append(heading, make('p', pr.status, 'status'), events);
    return card;
}

function make(tag: string, text = '', className = '') {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
}

function formatTime(date: Date) {
    return date.toLocaleString([], { month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit' });
}
