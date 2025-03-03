import { html } from "@services/elements";
import sidebarTemplate from "@views/sidebar/sidebar.template";

const about = () => {
    const sidebar = sidebarTemplate({
        '/':'Home',
        '/about':'About',
        '/docs':'Docs'
    }).outerHTML;

    return html`
        <el-about>
        ${sidebar}
        <div class="content-slate">
            <section>
                <h1>About Elemental</h1>
                <p>
                    The purpose of Elemental is to provide an easy-to-use template for working with TypeScript. You will find Typescript from the back end to the front end and even providing the HTML structure. If you are using VS Code, I recommend using <a href="https://marketplace.visualstudio.com/items?itemName=lehwark.htmx-literals" target="_blank">htmx-literals</a> for syntax highlighting.
                </p>
                <p>
                    The concept of Elemental is to use TypeScript to directly manipulate the DOM without the need for learning the syntax of a new framework like Angular or JQuery. Everything you see here will be a native function of either JavaScript or TypeScript (or CSS, I guess; we let it do its thing). This is a great way to learn how to work with TypeScript and the DOM. You can use Elemental as a starting point for your project or as a learning tool.
                </p>
            </section>
        </div>
        </el-about>
    `;
}

export default about;