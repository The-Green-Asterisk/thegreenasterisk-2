import el from '@elements';
import Helpers from '@services/helpers';
import { getHtml } from '@services/request';
import Link from '../../entities/Link';
import nav from '@views/nav/nav.ctrl';
const html = Helpers.html;

export default function links() {
    if (el.title) el.title.innerText = "Lord Steve's Links";
    nav(false); //take away nav

    const addLinkModel: Link = {
        url: "#",
        primaryType: true,
        imageUrl: "/storage/images/link.png",
        iconClass: "",
        text: "Create New Link"
    }

    const buildLink = (linkModel: Link, stay: boolean = false) => html`
        <a class="link" target="${stay ? '_self' : '_blank'}" href="${linkModel.url}">
            <div class="link-image ${linkModel.primaryType ? 'primary' : ''}">
                ${linkModel.imageUrl
            ? `<img src="${linkModel.imageUrl}" alt="${linkModel.text}">`
            : `<span class="fab ${linkModel.iconClass}"></span>`
        }
            </div>
            <div class="link-text">
                ${linkModel.text}
            </div>
        </a>
    `;

    const newLinkButton = buildLink(addLinkModel, true);
    newLinkButton.addEventListener('click', (e) => {
        e.preventDefault();
        getHtml<HTMLElement>('data/create-link').then(response => {
            el.body.appendChild(response);
        });
    });
    const linksSection = el.links?.querySelector('section');
    if (linksSection) {
        linksSection.appendChild(newLinkButton);
    }
}