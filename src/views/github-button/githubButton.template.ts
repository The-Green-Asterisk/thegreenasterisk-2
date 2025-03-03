import { html, htmlstring } from "@services/elements";

const githubButtonTemplate = (url: string, string: boolean = false) => {
    const button = htmlstring`
        <a class="github-button" href="${url}" target="_blank">
            View on GitHub <i class="fa-brands fa-github"></i>
        </a>
    `;
    return string ? button : html`${button}`;
}

export default githubButtonTemplate;