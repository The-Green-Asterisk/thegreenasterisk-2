import { html } from '@services/elements';
import elementsTemplate from './elements/elements.template';
import gettingStartedTemplate from './gettingStarted/gettingStarted.template';
import requestServiceTemplate from './requestService/requestService.template';
import routesTemplate from './routes/routes.template';
import theServer from './theServer/theServer.template';
import viewsTemplate from './views/views.template';
import faqTemplate from './faq/faq.template';

const docsTemplate = () => html`
        <el-docs>
            <div class="content-slate">
                <section>
                    <h1>Documentation</h1>
                    <p>
                        Elemental was created with the purpose of using as few different languages as possible for a full-stack application development platform. It needed to have all the functionality given by JavaScript, HTML and CSS implenetation, and a fully functional backend. For this reason I've decided to use TypeScript with a NodeJS backend. With TypeScript we can build a fully functional server with type checking and use the same syntax and functionality in the front end.
                    </p>
                    <p>
                        This documentation will cover the basics of how Elemental works and how to use it to build your own applications. We will cover the basics of the Elemental framework, the services that come with it, and how to build and implent different views.
                    </p>
                    <a href="/docs/getting-started">Getting Started</a>
                </section>
            </div>
        </el-docs>
    `;
docsTemplate.gettingStarted = gettingStartedTemplate;
docsTemplate.elementsTemplate = elementsTemplate;
docsTemplate.viewsTemplate = viewsTemplate;
docsTemplate.routesTemplate = routesTemplate;
docsTemplate.requestServiceTemplate = requestServiceTemplate;
docsTemplate.theServer = theServer;
docsTemplate.faqTemplate = faqTemplate;
export default docsTemplate;