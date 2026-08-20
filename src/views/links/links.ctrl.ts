import el from '@elements';
import Helpers from '@services/helpers';
import { delData, getData, postData, putData } from '@services/request';
import { buildModalFromUrl } from '@views/modal/modal.ctrl';
import nav from '@views/nav/nav.ctrl';
import Link from '../../entities/Link';
const html = Helpers.html;
let linksSection: HTMLElement | null | undefined = null;
let linkList: { link: Link, element: HTMLElement }[] = [];

export default async function links() {
    if (el.title) el.title.innerText = "Lord Steve's Links";
    nav(false); //take away nav
    linksSection = el.links?.querySelector('section');
    await renderLinks();
}

async function renderLinks() {
    if (!linksSection) return;

    // Clear out the existing DOM elements and the active list array
    linksSection.innerHTML = '';
    linksSection.appendChild(
        html`
            <h1>Lord Steve's Links</h1>
            <p>You succeeded in your investigation roll. You now know where to find Lord Steve. Use this knowledge cautiously.</p>
        `
    )
    linkList = [];

    const fetchedLinks = await getData<Link[]>('/get-links');
    fetchedLinks.forEach(link => linkList.push({ link, element: buildLink(link) }));
    linkList.forEach(link => linksSection?.appendChild(link.element));

    el.checkAdmin(() => {
        const ctrlBtns = (link: Link) => {
            const buttons = html`
                <div class="ctrlBtns">
                    <button class="delete">
                        <i class="fa fa-trash"></i>
                    </button>
                    <button class="edit">
                        <i class="fa fa-pencil"></i>
                    </button>
                </div>
            `;
            buttons.getElementsByClassName('delete').item(0)?.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (confirm('Are you sure you want to delete this link?')) {
                    await delData('/delete-link', link);
                    await renderLinks(); // Re-render after deletion
                }
            });

            buttons.getElementsByClassName('edit').item(0)?.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                createEditModal(link)(e);
            });
            return buttons;
        };

        linkList.forEach(l => l.element.appendChild(
            html`<i class="fa fa-grip-lines" style="cursor: grab;margin-right: 5px;"></i>`
        ));
        linkList.forEach(l => l.element.appendChild(ctrlBtns(l.link)));

        const addLinkModel: Link = {
            url: "#",
            primaryType: true,
            imageUrl: "",
            iconClass: "fa-solid fa-link",
            text: "Create New Link",
            sortOrder: 0
        };

        const newLinkButton = buildLink(addLinkModel, false, true);
        newLinkButton.addEventListener('click', createEditModal(), { signal: el.signal });

        linksSection?.appendChild(newLinkButton);
        const linksToSave = linkList.map(m => m.link);

        Helpers.enableDragReorder({
            items: linkList.map(l => l.element),
            container: linksSection!,
            itemSelector: '.link[data-draggable="true"]',
            pinnedElement: newLinkButton,
            onReorder: async () => {
                const linkElements = document.getElementsByClassName('link');
                Array.from(linkElements).forEach((el, i) => {
                    const linkIdAttr = el.id.slice(4);
                    const linkToSave = linksToSave.find(l => l.id === Number(linkIdAttr));
                    if (linkToSave) {
                        linkToSave.sortOrder = i + 1;
                    }
                });
                await postData('/save-links', linksToSave);
            }
        });
    });
}

const iconOrImg = (linkModel: Link) =>
    linkModel.imageUrl
        ? `<img src="${linkModel.imageUrl}" alt="${linkModel.text}">`
        : `<span class="${linkModel.iconClass}"></span>`;

const buildLink = (linkModel: Link, draggable: boolean = true, stay: boolean = false) => html`
    <a 
        id="link${linkModel.id}"
        class="link"
        target="${stay ? '_self' : '_blank'}"
        href="${linkModel.url}"
        data-draggable="${draggable ? 'true' : 'false'}"
    >
        <div class="link-image ${linkModel.primaryType ? 'primary' : ''}">
            ${iconOrImg(linkModel)}
        </div>
        <div class="link-text">
            ${linkModel.text}
        </div>
    </a>
`;

const createEditModal = (editLink?: Link) => (e: Event) => {
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

        linkForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(linkForm);
            const sortOrder = editLink ? editLink.sortOrder : linkList.length + 1;
            const link = new Link(
                String(formData.get('url') ?? ''),
                String(formData.get('iconClass') ?? ''),
                String(formData.get('imageUrl') ?? ''),
                String(formData.get('text') ?? ''),
                formData.get('primaryType') === 'on',
                sortOrder
            );

            if (editLink) {
                link.id = editLink.id;
                await putData<Link>('/edit-link', link);
            } else {
                await postData<Link>('/save-link', link);
            }

            // Re-render links and close out the modal on submit
            await renderLinks();
            if (el.modal) document.body.removeChild(el.modal);
        });
    });
}