import el from '@elements';
import { delData, getData, postData } from '@services/request';
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
    digestSection = el.prDigest?.querySelector('.digest');
    if (!el.checkAdmin()) {
        notFound();
        return;
    }

    setUpPush();
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

async function setUpPush() {
    const box = el.prDigest?.querySelector<HTMLElement>('.push');
    if (!box) return;

    // iOS only allows push from the site added to the Home Screen
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        box.replaceChildren(make('p', isIos
            ? 'For notifications on iPhone or iPad, tap Share, then Add to Home Screen. Open The Green Asterisk from there and pick PR Digest from the menu.'
            : "This browser can't show push notifications."));
        return;
    }

    try {
        await renderPush(box, await navigator.serviceWorker.register('/sw.js'));
    } catch (error) {
        console.error('Error setting up notifications:', error);
        box.replaceChildren(make('p', "Notifications couldn't be set up in this browser."));
    }
}

async function renderPush(box: HTMLElement, registration: ServiceWorkerRegistration) {
    const subscription = await registration.pushManager.getSubscription();

    if (subscription && Notification.permission === 'granted') {
        // Re-saved on every visit in case the server dropped it
        postData('/save-push-subscription', subscription.toJSON()).catch(() => { });
        const button = make('button', 'Turn off');
        button.addEventListener('click', async () => {
            await delData('/delete-push-subscription', { endpoint: subscription.endpoint }).catch(() => { });
            await subscription.unsubscribe();
            await renderPush(box, registration);
        }, { signal: el.signal });
        box.replaceChildren(make('span', 'Notifications are on for Red and Yellow Alerts.'), button);
    } else if (Notification.permission === 'denied') {
        box.replaceChildren(make('p', 'Notifications are blocked for this site in your browser settings.'));
    } else {
        const button = make('button', 'Turn on notifications');
        button.addEventListener('click', async () => {
            try {
                if (await Notification.requestPermission() === 'granted') {
                    const key = await getData<string>('/get-push-key');
                    const newSubscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: base64UrlToBytes(key)
                    });
                    await postData('/save-push-subscription', newSubscription.toJSON());
                }
                await renderPush(box, registration);
            } catch (error) {
                console.error('Error turning on notifications:', error);
                box.replaceChildren(make('p', "Notifications couldn't be turned on. Try again later."));
            }
        }, { signal: el.signal });
        box.replaceChildren(button);
    }
}

function base64UrlToBytes(base64Url: string) {
    const base64 = (base64Url + '='.repeat((4 - base64Url.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
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
        group.append(make('h2', heading), ...prs.map(pr => buildPr(pr, digest.jiraUrl)));
        digestSection.append(group);
    }
    if (!digest.prs.length) digestSection.append(make('p', 'No open PRs.'));
}

function buildPr(pr: PrDigestPr, jiraUrl?: string) {
    const card = make('article', '', 'pr');

    const link = make('a', `${pr.repo} #${pr.number}`) as HTMLAnchorElement;
    if (pr.url.startsWith('https://github.com/')) link.href = pr.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const title = make('span', '', 'pr-title');
    title.append(link);
    // Digests saved before owners were sent have none
    if (pr.owners?.length) {
        const owners = make('span', pr.owners.join(', '), 'owners');
        owners.title = 'Owner';
        title.append(owners);
    }
    if (pr.draft) title.append(make('span', 'draft', 'draft'));
    const heading = make('div', '', 'pr-heading');
    heading.append(title);
    if (pr.tickets.length) {
        // Jira's URL comes with the digest, since this code is public
        const tickets = make('span', '', 'tickets');
        pr.tickets.forEach((ticket, i) => {
            if (i > 0) tickets.append(', ');
            if (jiraUrl && /^PROV-\d+$/.test(ticket)) {
                const ticketLink = make('a', ticket) as HTMLAnchorElement;
                ticketLink.href = `${jiraUrl}/browse/${ticket}`;
                ticketLink.target = '_blank';
                ticketLink.rel = 'noopener noreferrer';
                tickets.append(ticketLink);
            } else {
                tickets.append(ticket);
            }
        });
        heading.append(tickets);
    }

    const events = make('ul', '', 'events');
    events.append(...pr.events.map(event => {
        const item = make('li', ` ${event.actor ? `${event.actor} ` : ''}${event.action}`);
        item.prepend(make('time', formatTime(new Date(event.at))));
        return item;
    }));

    // The draft badge says it, so the status doesn't need to
    const status = pr.draft ? pr.status.replace(/, draft$/, '') : pr.status;
    card.append(heading, make('p', status, 'status'), events);
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
