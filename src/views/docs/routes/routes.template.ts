import { escapeHtml, html } from "@services/elements";

const routesTemplate = () => html`
    <el-docs>
        <div class="content-slate">
            <section>
                <h1>Routes</h1>
                <p>
                    Elemental is a very front-end focused framework and, as such, it serves its pages based on whatever URL is passed into a front-end Routes class. There is also a Routes class for the backend, and it works very similarly, but it has a few more options for handling requests and responses. I'll cover that in the section for the server. The basic idea here, though, is that, in <code class="language-typescript">main.ts</code>, you split the URL path into an array divided by the <code>/</code>, call <code class="language-typescript">new Routes</code> and pass in the path into it like this: <code class="language-typescript">new Routes(path)</code>. This will create a new instance of the Routes class, and then you call <code class="language-typescript">.view()</code> on it to serve the page. Easy peasy, right? Let's get into the nitty-gritty.
                </p>
                <h4>Creating a New Route</h4>
                <p>
                    So, <code class="language-plaintext">main.ts</code> looks like this, right?:
                </p>
                <pre><code class="language-typescript">
import el from '@services/elements';<br>
import { initLoader } from '@services/request';<br>
import views from '@views';<br>
import Routes from './routes';<br>
<br>
initLoader();<br>
<br>
const path = window.location.pathname.split('/');<br>
path.shift();<br>
<br>
el.body.appendChild(views.navTemplate());<br>
views.nav();<br>
new Routes(path).view();
                </code></pre>
                <p>
                    Note that <code class="language-typescript">el.body.appendChild(views.navTemplate()); views.nav();</code> is optional. It's just there to add the navigation bar to every single page you load. You can remove it if you don't want it.
                </p>
                <p>
                    <code class="language-typescript">path.shift();</code> is there to remove the first element of the array, which is always an empty string, because the URL always starts with a <code>/</code>. So, what happens when you pass the path into the Routes class?
                </p>
                <p>
                    The Routes class is set up like this:
                </p>
                <pre><code class="language-typescript">
import el from "@services/elements";<br>
import views from "@views";<br>
import RoutesBase from "./routes.base";<br>
<br>
export default class Routes extends RoutesBase {<br>
<br>
    ['about']() {<br>
        el.body.appendChild(views.aboutTemplate());<br>
        views.about();<br>
    }<br>
<br>
    ['docs']() {<br>
        if (this.path[1]) {<br>
            this.path.shift();<br>
            new views.DocsRoutes(this.path).view();<br>
        } else {<br>
            el.body.appendChild(views.docsTemplate());<br>
            views.docs();<br>
        }<br>
    }<br>
<br>
}<br>
                </code></pre>
                <p>
                    But the really important part is in the <code class="language-typescript">RoutesBase</code> class, which is set up like this:
                </p>
                <pre><code class="language-typescript">
import el from "@services/elements";<br>
import { getHtml } from "@services/request";<br>
import views from "@views";<br>
<br>
export default class RoutesBase {<br>
    query: {[key: string]: any} = {};<br>
    constructor(<br>
        public path: string[]<br>
    ) {<br>
        for (const [key, value] of new URLSearchParams(location.search).entries()) {<br>
            this.query[key] = isNaN(Number(value))<br>
                ? value.toLowerCase() == 'true' || value.toLowerCase() == 'false'<br>
                    ? Boolean(value.toLowerCase())<br>
                    : value<br>
                : Number(value);<br>
        }<br>
    }<br>
<br>
    ['']() {<br>
        el.body.appendChild(views.homeTemplate(<br>
            "It's Elemental",<br>
            "A boilerplate framework for TypeScript web development."<br>
        ));<br>
        views.home();<br>
    }<br>
<br>
    view() {<br>
        const view = this[this.path[0]].bind(this);<br>
        if (typeof view !== 'function') {<br>
            getHtml(location.pathname)<br>
            .then((page) => {<br>
                if (page instanceof HTMLElement) {<br>
                    el.body.appendChild(page);<br>
                } else if (page instanceof NodeList) {<br>
                    page.forEach((element) => {<br>
                        el.body.appendChild(element);<br>
                    });<br>
                }<br>
<br>
                if (el.nav.nextElementSibling === null) {<br>
                    el.body.appendChild(views.homeTemplate('404', 'Page Not Found'));<br>
                    views.home();<br>
                }<br>
            }<br>
        });<br>
        } else {<br>
            view();<br>
        }<br>
    }<br>
    [key: string]: any;<br>
}<br>
                </code></pre>
                <p>
                    <code class="language-typescript">RoutesBase</code> looks complicated so that <code class="language-typescript">Routes</code> can be simple.
                </p>
                <p>
                    As you know, the path is being passed in as an array. So, what the <code class="language-typescript">view()</code> function does is call whatever function corresponds to the first string in the array. If there's no function that corresponds to that string, it defaults to the server first, and if that returns nothing, it serves a 404 page.
                </p>
                <p>
                    If the URL is just <code>/</code>, then the first string in the array will be blank (even after shifting it in <code class="language-plaintext">main.ts</code>). So, the <code class="language-typescript">['']()</code> function is called, which serves the home page. See what I did there? The Routes class is an object with functions that are indexed by the strings of the paths in the array. So, when <code class="language-typescript">view()</code> sees that the string is blank, it calls <code class="language-typescript">['']()</code> which, in turn, calls up <code class="language-typescript">el.body</code> and appends the home page to it. Which, in this case, takes two arguments: a title and a subtitle. Then, it calls <code class="language-typescript">views.home()</code> which is the controller for the home page.
                </p>
                <p>
                    So, that means if you want to add a new page, all you have to do is add a new function indexed by the string of the path you want to serve. For example, if you want to add a page at <code class="language-plaintext">/about</code>, you would add a function like this:
                </p>
                <pre><code class="language-typescript">
['about']() {<br>
&nbsp;&nbsp;el.body.appendChild(views.aboutTemplate());<br>
&nbsp;&nbsp;views.about();<br>
}
                </code></pre>
                <p>
                    If you want to add a view that has sub-views, you'll have to check if there are any further strings in the path array. For example, if you want to add a page at <code class="language-plaintext">/docs</code> that has sub-views for <code class="language-plaintext">/getting-started</code>, <code class="language-plaintext">/elements</code>, <code class="language-plaintext">/routes</code>, <code class="language-plaintext">/views</code>, and <code class="language-plaintext">/faq</code>, you would add a function like this:
                </p>
                <pre><code class="language-typescript">
['docs']() {<br>
&nbsp;&nbsp;if (this.path[1]) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;this.path.shift();<br>
&nbsp;&nbsp;&nbsp;&nbsp;new views.DocsRoutes(this.path).view();<br>
&nbsp;&nbsp;} else {<br>
&nbsp;&nbsp;&nbsp;&nbsp;el.body.appendChild(views.docsTemplate());<br>
&nbsp;&nbsp;&nbsp;&nbsp;views.docs();<br>
&nbsp;&nbsp;}<br>
}
                </code></pre>
                <p>
                    Oh, look! There's a new routes class in there! I'll get to that in a second, but first, I should explain that this function is checking if there's a second string in the array, and if there is, it knocks off the first string and passes the rest. If there's not, it'll just serve the docs page.
                </p>
                <p>
                    So, now I should explain what's up with the <code class="language-typescript">DocsRoutes</code> class.
                </p>
                <h4>Sub-Routes</h4>
                <p>
                    The <code class="language-typescript">DocsRoutes</code> class is set up like this:
                </p>
                <pre><code class="language-typescript">
import el, { html } from '@services/elements';<br>
import views from '@views';<br>
import Routes from '@routes';<br>
<br>
export default class DocsRoutes extends Routes {<br>
<br>
&nbsp;&nbsp;['getting-started']() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;el.body.appendChild(<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;views.docsTemplate.gettingStarted()<br>
&nbsp;&nbsp;&nbsp;&nbsp;);<br>
&nbsp;&nbsp;&nbsp;&nbsp;views.docs();<br>
&nbsp;&nbsp;}<br>
<br>
&nbsp;&nbsp;['elements']() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;el.body.appendChild(<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;views.docsTemplate.elementsTemplate()<br>
&nbsp;&nbsp;&nbsp;&nbsp;);<br>
&nbsp;&nbsp;&nbsp;&nbsp;views.docs();<br>
&nbsp;&nbsp;}<br>
<br>
&nbsp;&nbsp;['routes']() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;el.body.appendChild(<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;views.docsTemplate.routesTemplate()<br>
&nbsp;&nbsp;&nbsp;&nbsp;);<br>
&nbsp;&nbsp;&nbsp;&nbsp;views.docs();<br>
&nbsp;&nbsp;}<br>
<br>
&nbsp;&nbsp;['views']() {<br>
&nbsp;&nbsp;&nbsp;&nbsp;el.body.appendChild(<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;views.docsTemplate.viewsTemplate()<br>
&nbsp;&nbsp;&nbsp;&nbsp;);<br>
&nbsp;&nbsp;&nbsp;&nbsp;views.docs();<br>
&nbsp;&nbsp;}<br>
}
                </code></pre>
                <p>
                    So, the <code class="language-typescript">DocsRoutes</code> class is just an extension of the <code class="language-typescript">Routes</code> class. It's set up the same way, but it has functions for each of the sub-views of the <code class="language-plaintext">/docs</code> page. So, if you want to add a new sub-view, you just add a new function indexed by the string of the path you want to serve. For example, if you want to add a page at <code class="language-plaintext">/docs/faq</code>, you would add a function like this:
                </p>
                <pre><code class="language-typescript">
['faq']() {<br>
&nbsp;&nbsp;el.body.appendChild(<br>
&nbsp;&nbsp;&nbsp;&nbsp;views.docsTemplate.faqTemplate<br>
&nbsp;&nbsp;);<br>
&nbsp;&nbsp;views.docs();<br>
}
                </code></pre>
                <p>
                    This sub-route file will already have the <code class="language-typescript">view()</code> function and <code class="language-typescript">query</code> property from the <code class="language-typescript">RoutesBase</code> class, so you don't have to worry about those. (Don't worry, I'll get to the <code class="language-typescript">query</code> property!) Just add the function for the sub-view you want to serve.
                </p>
                <p>
                    The sub-route file should be saved in the same directory as the view file it's serving. So, if you're adding a sub-view for the <code class="language-plaintext">/docs</code> page, you should save the file as <code class="language-plaintext">docs.routes.ts</code> in the <code class="language-plaintext">docs</code> directory. Then it should be imported and exported in the <code class="language-plaintext">views/index.ts</code> file like this:
                </p>
                <pre><code class="language-typescript">
...<br>
import DocsRoutes from './docs/docs.routes';<br>
<br>
...<br>
export { default as DocsRoutes } from './docs/docs.routes';<br>
<br>
const views = {<br>
&nbsp;&nbsp;...<br>
&nbsp;&nbsp;DocsRoutes<br>
}<br>
export default views;
                </code></pre>
                <p>
                    Now the <code class="language-typescript">DocsRoutes</code> class is available to be used in the <code class="language-plaintext">routes.ts</code> file. And now, as promised:
                </p>
                <h4>The Query Property</h4>
                <p>
                    The <code class="language-typescript">query</code> property is a property of the <code class="language-typescript">Routes</code> class that is an object with all the query parameters from the URL. It's set up in the constructor like this:
                </p>
                <pre><code class="language-typescript">
for (const [key, value] of new URLSearchParams(location.search).entries()) {<br>
    this.query[key] = isNaN(Number(value))<br>
        ? value.toLowerCase() == 'true' || value.toLowerCase() == 'false'<br>
            ? Boolean(value.toLowerCase())<br>
            : value<br>
        : Number(value);<br>
}
                </code></pre>
                <p>
                    So, as you can see, it's just taking the query parameters from the URL and adding them to the <code class="language-typescript">query</code> object. If the query parameter is a number, it adds it as a number. If it's a boolean, it adds it as a boolean. Otherwise, it adds it as a string. So, if you have a URL like <code class="language-plaintext">/about?name=John&age=30&isCool=true</code>, the <code class="language-typescript">query</code> object will look like this:
                </p>
                <pre><code class="language-typescript">
{<br>
&nbsp;&nbsp;name: 'John',<br>
&nbsp;&nbsp;age: 30,<br>
&nbsp;&nbsp;isCool: true<br>
}
                </code></pre>
                <p>
                    So, if you want to use the query parameters in your view, you can just pass the query into the view template or controller like this:
                </p>
                <pre><code class="language-typescript">
['about']() {<br>
&nbsp;&nbsp;el.body.appendChild(views.aboutTemplate(this.query));<br>
&nbsp;&nbsp;views.about(this.query);<br>
}
                </code></pre>
                <p>
                    And then you can use the query parameters in your view like this:
                </p>
                <pre><code class="language-typescript">
import el from "@services/elements";<br>
import { escapeHtml, html } from "@services/elements";<br>
<br>
const aboutTemplate = (query: {[key: string]: any}) => html${escapeHtml`\``}<br>
${escapeHtml`  <h1>About $\{query.name}</h1>`}<br>
${escapeHtml`\`;`}<br>
<br>
export default aboutTemplate;
                </code></pre>
                <p>
                    And the query parameter will be available in all your sub-route files, too, so just pass it in and use it as needed.
                </p>
            </section>
        </div>
    </el-docs>
`;

export default routesTemplate;