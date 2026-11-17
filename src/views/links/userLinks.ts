import { escapeHtml } from "@services/escape";
import el from "@elements";
import Helpers from "@services/helpers";
import { delData, getData, postData, putData } from "@services/request";
import { buildModalFromUrl } from "@views/modal/modal.ctrl";
import Link from "../../entities/Link";

const html = Helpers.html;

export interface RenderUserLinksOptions {
    container: HTMLElement;
    userId?: number;
    username?: string;
    canEdit: boolean;
    emptyText?: string;
}

const iconOrImg = (linkModel: Link) =>
    linkModel.imageUrl
        ? `<img src="${escapeHtml(linkModel.imageUrl)}" alt="${escapeHtml(linkModel.text)}">`
        : `<span class="${escapeHtml(linkModel.iconClass || 'fa-solid fa-link')}"></span>`;

const buildLink = (linkModel: Link, draggable: boolean = true, stay: boolean = false) => html`
    <a 
        id="link${linkModel.id ?? ''}"
        class="link"
        target="${stay ? '_self' : '_blank'}"
        href="${escapeHtml(linkModel.url)}"
        data-draggable="${draggable ? 'true' : 'false'}"
    >
        <div class="link-image ${linkModel.primaryType ? 'primary' : ''}">
            ${iconOrImg(linkModel)}
        </div>
        <div class="link-text">
            ${escapeHtml(linkModel.text)}
        </div>
    </a>
`;

export async function renderUserLinks(options: RenderUserLinksOptions): Promise<void> {
    const { container, userId, username, canEdit, emptyText } = options;

    container.innerHTML = '';
    container.classList.add('user-links-list');

    const query: Record<string, string | number> = {};
    if (userId !== undefined) {
        query.userId = userId;
    } else if (username) {
        query.username = username;
    }

    const fetchedLinks = await getData<Link[]>('/get-links', Object.keys(query).length ? query : undefined);
    const linkList: { link: Link; element: HTMLElement }[] = fetchedLinks.map(link => ({
        link,
        element: buildLink(link, canEdit)
    }));

    linkList.forEach(item => container.appendChild(item.element));

    if (linkList.length === 0 && !canEdit && emptyText) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'links-empty';
        emptyMsg.textContent = emptyText;
        container.appendChild(emptyMsg);
    }

    if (!canEdit) {
        return;
    }

    const openEditModal = (editLink?: Link) => (e: Event) => {
        e.preventDefault();
        buildModalFromUrl('create-link').then(modal => {
            const linkForm = modal?.querySelector('form');
            const urlInput = linkForm?.querySelector('input[name="url"]') as HTMLInputElement;
            const textInput = linkForm?.querySelector('input[name="text"]') as HTMLInputElement;
            const imageUrlInput = linkForm?.querySelector('input[name="imageUrl"]') as HTMLInputElement;
            const iconClassInput = linkForm?.querySelector('input[name="iconClass"]') as HTMLInputElement;
            const primaryCheckbox = linkForm?.querySelector('input[name="primaryType"]') as HTMLInputElement;

            if (editLink) {
                urlInput.value = editLink.url;
                textInput.value = editLink.text;
                imageUrlInput.value = editLink.imageUrl;
                iconClassInput.value = editLink.iconClass;
                primaryCheckbox.checked = editLink.primaryType;

                if (imageUrlInput.value) {
                    iconClassInput.disabled = true;
                    iconClassInput.value = '';
                    imageUrlInput.required = true;
                } else if (iconClassInput.value) {
                    imageUrlInput.disabled = true;
                    imageUrlInput.value = '';
                    iconClassInput.required = true;
                }
            }

            if (imageUrlInput && iconClassInput) {
                imageUrlInput.addEventListener('input', () => {
                    if (!imageUrlInput.value && !iconClassInput.value) {
                        imageUrlInput.required = true;
                        iconClassInput.required = true;
                        imageUrlInput.disabled = false;
                        iconClassInput.disabled = false;
                    } else if (imageUrlInput.value) {
                        iconClassInput.value = '';
                        iconClassInput.disabled = true;
                        imageUrlInput.required = true;
                    } else {
                        iconClassInput.disabled = false;
                        imageUrlInput.required = false;
                    }
                }, { signal: el.signal });
                iconClassInput.addEventListener('input', () => {
                    if (!imageUrlInput.value && !iconClassInput.value) {
                        imageUrlInput.required = true;
                        iconClassInput.required = true;
                        imageUrlInput.disabled = false;
                        iconClassInput.disabled = false;
                    } else if (iconClassInput.value) {
                        imageUrlInput.value = '';
                        imageUrlInput.disabled = true;
                        imageUrlInput.required = false;
                    } else {
                        imageUrlInput.disabled = false;
                        imageUrlInput.required = false;
                    }
                }, { signal: el.signal });
            }

            linkForm?.addEventListener('submit', async (submitEvent) => {
                submitEvent.preventDefault();
                const formData = new FormData(linkForm);
                const sortOrder = editLink ? editLink.sortOrder : linkList.length + 1;
                const link = new Link(
                    String(formData.get('url') ?? ''),
                    String(formData.get('iconClass') ?? ''),
                    String(formData.get('imageUrl') ?? ''),
                    String(formData.get('text') ?? ''),
                    formData.get('primaryType') === 'on',
                    sortOrder,
                    editLink?.userId ?? userId ?? el.currentUser?.id
                );

                if (editLink) {
                    link.id = editLink.id;
                    await putData<Link>('/edit-link', link);
                } else {
                    await postData<Link>('/save-link', link);
                }

                await renderUserLinks(options);
                if (el.modal) document.body.removeChild(el.modal);
            }, { signal: el.signal });
        });
    };

    const ctrlBtns = (link: Link) => {
        const buttons = html`
            <div class="ctrlBtns">
                <button class="delete" type="button" aria-label="Delete link">
                    <i class="fa fa-trash"></i>
                </button>
                <button class="edit" type="button" aria-label="Edit link">
                    <i class="fa fa-pencil"></i>
                </button>
            </div>
        `;
        buttons.getElementsByClassName('delete').item(0)?.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (confirm('Are you sure you want to delete this link?')) {
                await delData('/delete-link', { id: link.id });
                await renderUserLinks(options);
            }
        }, { signal: el.signal });

        buttons.getElementsByClassName('edit').item(0)?.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openEditModal(link)(e);
        }, { signal: el.signal });
        return buttons;
    };

    linkList.forEach(item => {
        item.element.appendChild(
            html`<i class="fa fa-grip-lines" style="cursor: grab;margin-right: 5px;"></i>`
        );
        item.element.appendChild(ctrlBtns(item.link));
    });

    const addLinkModel: Link = {
        url: "#",
        primaryType: true,
        imageUrl: "",
        iconClass: "fa-solid fa-link",
        text: "Create New Link",
        sortOrder: 0
    };

    const newLinkButton = buildLink(addLinkModel, false, true);
    newLinkButton.addEventListener('click', openEditModal(), { signal: el.signal });
    container.appendChild(newLinkButton);

    const linksToSave = linkList.map(m => m.link);
    Helpers.enableDragReorder({
        items: linkList.map(l => l.element),
        container,
        itemSelector: '.link[data-draggable="true"]',
        dragHandleSelector: '.fa-grip-lines',
        pinnedElement: newLinkButton,
        onReorder: async () => {
            const linkElements = container.querySelectorAll('.link[data-draggable="true"]');
            Array.from(linkElements).forEach((linkEl, i) => {
                const linkIdAttr = linkEl.id.slice(4);
                const linkToSave = linksToSave.find(l => l.id === Number(linkIdAttr));
                if (linkToSave) {
                    linkToSave.sortOrder = i + 1;
                }
            });
            if (linksToSave.length) {
                await postData('/save-links', linksToSave.map(l => ({ id: l.id, sortOrder: l.sortOrder })));
            }
        }
    });
}
