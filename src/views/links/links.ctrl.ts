import el from '@elements';
import Helpers from '@services/helpers';
import { delData, getData, postData } from '@services/request';
import { buildModalFromUrl } from '@views/modal/modal.ctrl';
import nav from '@views/nav/nav.ctrl';
import Link from '../../entities/Link';
const html = Helpers.html;

export default async function links() {
    if (el.title) el.title.innerText = "Lord Steve's Links";
    nav(false); //take away nav
    const linksSection = el.links?.querySelector('section');

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

    const linkList: { link: Link, element: HTMLElement }[] = [];

    const links = await getData<Link[]>('/get-links');
    links.forEach(link => linkList.push({ link, element: buildLink(link) }));
    linkList.forEach(link => linksSection?.appendChild(link.element));

    el.checkAdmin(() => {
        const ctrlBtns = (link: Link, element: HTMLElement) => {
            const buttons = html`
                <div class="ctrlBtns">
                    <button class="delete">
                        <i class="fa fa-trash"></i>
                    </button>
                    <button class="edit">
                        <i class="fa fa-pencil"></i>
                    </button>
                </div>
            `
            buttons.getElementsByClassName('delete').item(0)?.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (confirm('Are you sure you want to delete this link?')) {
                    delData('/delete-link', link).then(() => {
                        element.remove();
                    })
                }
            });

            buttons.getElementsByClassName('edit').item(0)?.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("I'll get there, just wait.");
            })
            return buttons
        }
        linkList.forEach(l => l.element.appendChild(
            html`<i class="fa fa-grip-lines" style="cursor: grab;margin-right: 5px;"></i>`
        ));
        linkList.forEach(l => l.element.appendChild(ctrlBtns(l.link, l.element)))

        const addLinkModel: Link = {
            url: "#",
            primaryType: true,
            imageUrl: "",
            iconClass: "fa-solid fa-link",
            text: "Create New Link",
            sortOrder: 0
        }

        const newLinkButton = buildLink(addLinkModel, false, true);
        newLinkButton.addEventListener('click', (e) => {
            e.preventDefault();
            buildModalFromUrl('create-link').then(modal => {
                const linkForm = modal?.querySelector('form');
                const imageUrlInput = linkForm?.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                const iconClassInput = linkForm?.querySelector('input[name="iconClass"]') as HTMLInputElement;

                if (imageUrlInput && iconClassInput) {
                    imageUrlInput.addEventListener('input', () => {
                        if (!imageUrlInput.value && !iconClassInput.value) {
                            imageUrlInput.required = true;
                            iconClassInput.required = true;
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

                linkForm?.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(linkForm);
                    const link = new Link(
                        String(formData.get('url') ?? ''),
                        String(formData.get('iconClass') ?? ''),
                        String(formData.get('imageUrl') ?? ''),
                        String(formData.get('text') ?? ''),
                        formData.get('primaryType') === 'on',
                        Number(formData.get('sortOrder') ?? 0)
                    );
                    postData<Link>('/save-link', link).then((savedLink) => {
                        const savedLinkButton = buildLink(savedLink);
                        linksSection?.appendChild(savedLinkButton);
                    });
                });
            });
        }, { signal: el.signal });

        if (linksSection) linksSection.appendChild(newLinkButton);
        const linksToSave = linkList.map(m => m.link);

        if (linksSection) {
            Helpers.enableDragReorder({
                items: linkList.map(l => l.element),
                container: linksSection,
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
        }
    })
}
