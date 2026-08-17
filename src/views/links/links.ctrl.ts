import el from '@elements';
import Helpers from '@services/helpers';
import { getData, postData } from '@services/request';
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

    const buildLink = (linkModel: Link, stay: boolean = false) => html`
        <a 
            id="link${linkModel.id}"
            class="link"
            target="${stay ? '_self' : '_blank'}"
            href="${linkModel.url}"
            draggable="true"
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
        const addLinkModel: Link = {
            url: "#",
            primaryType: true,
            imageUrl: "",
            iconClass: "fa-solid fa-link",
            text: "Create New Link",
            sortOrder: 0
        }

        const newLinkButton = buildLink(addLinkModel, true);
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

        linkList.forEach(({ element }) => {
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer?.setData('text/plain', element.id);
            });

            element.addEventListener('dragover', (e) => {
                e.preventDefault(); // Required to allow drop
            });

            element.addEventListener('drop', async (e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer?.getData('text/plain');
                const draggedEl = document.getElementById(draggedId!);
                if (draggedEl && draggedEl !== element) {
                    linksSection?.insertBefore(draggedEl, element);
                }
                const linkElements = document.getElementsByClassName('link');
                Array.from(linkElements).forEach((element, i) => {
                    const linkToSave = linksToSave.find(l => l.id === Number(element.id.slice(4)));
                    if (linkToSave) {
                        linkToSave.sortOrder = i + 1;
                    }
                })
                await postData('/save-links', linksToSave);
            });
        });
    })
}
