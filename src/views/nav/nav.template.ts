import views from "@views";
import { html } from "@services/elements";

const navTemplate = () => html`
    <nav>${views.githubButtonTemplate('https://github.com/lordsteve/elemental', true)}
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/docs">Docs</a></li>
        </ul>
    </nav>
`;

export default navTemplate;