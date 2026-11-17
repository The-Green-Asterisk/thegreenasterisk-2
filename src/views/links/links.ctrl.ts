import el from '@elements';
import { getData } from '@services/request';
import nav from '@views/nav/nav.ctrl';
import User from '../../entities/User';
import { renderUserLinks } from './userLinks';

export default async function links(pathUsername?: string, query: { [key: string]: any } = {}) {
    nav(false); //take away nav
    const linksSection = el.links?.querySelector('section');
    if (!linksSection) return;

    const requestedUserId = query.userId ? Number(query.userId) : undefined;
    const requestedUsername = pathUsername
        ? decodeURIComponent(pathUsername)
        : (typeof query.username === 'string' && query.username.trim() ? query.username.trim() : 'lord.steve');

    let targetUser: User | null = null;
    try {
        targetUser = requestedUserId
            ? await getData<User>('/profile', { id: requestedUserId })
            : await getData<User>('/profile', { username: requestedUsername });
    } catch {
        targetUser = null;
    }

    const displayName = targetUser
        ? (targetUser.username === 'lord.steve'
            ? 'Lord Steve'
            : (`${targetUser.firstName ?? ''} ${targetUser.lastName ?? ''}`.trim() || targetUser.username))
        : requestedUsername;

    const defaultTitle = `${displayName}'s Links`;
    const pageTitle = targetUser?.linksTitle?.trim() || defaultTitle;

    if (el.title) el.title.innerText = pageTitle;

    linksSection.innerHTML = '';
    const heading = document.createElement('h1');
    heading.textContent = pageTitle;
    linksSection.appendChild(heading);

    if (!targetUser) {
        const notFound = document.createElement('p');
        notFound.textContent = 'No user found with those link details.';
        linksSection.appendChild(notFound);
        return;
    }

    const pageDescription = targetUser.linksDescription?.trim()
        || (targetUser.username === 'lord.steve'
            ? 'You succeeded in your investigation roll. You now know where to find Lord Steve. Use this knowledge cautiously.'
            : '');
    if (pageDescription) {
        const subtitle = document.createElement('p');
        subtitle.textContent = pageDescription;
        linksSection.appendChild(subtitle);
    }

    const listContainer = document.createElement('div');
    listContainer.className = 'user-links-list';
    linksSection.appendChild(listContainer);

    const canEdit = Boolean(
        el.isAuth && el.currentUser && (el.currentUser.isAdmin || el.currentUser.id === targetUser.id)
    );

    await renderUserLinks({
        container: listContainer,
        userId: targetUser.id,
        canEdit,
        emptyText: `${displayName} hasn't added any links yet.`
    });
}
