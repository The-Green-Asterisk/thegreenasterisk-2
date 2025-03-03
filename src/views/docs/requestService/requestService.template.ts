import { escapeHtml, html } from "@services/elements";

const requestService = () => html`
    <el-docs>
        <div class="content-slate">
            <section>
                <h1>Request Service</h1>
                <p>
                    The request service is a simple service that allows you to make HTTP requests from your application. It's built on top of the Fetch API and provides a simple interface for making requests. This will be your primary way of communicating with the server, but it can also be used to make requests to other APIs.
                </p>
                <h4>initLoader</h4>
                <p>
                    The <code class="language-typescript">initLoader</code> function is included in the request service to activate the special <code class="language-typescript">loader</code> element in the Elements service. It displays a special loader image when a request is being made, but it also adds a few different security measures to requests. Here's what it looks like:
                </p>
                <pre>
                    <code class="language-typescript">
export function initLoader() {
    window.fetch = ((oldFetch: typeof window.fetch, input: RequestInfo | URL = '', init?: RequestInit | undefined) => {
        return async (url: RequestInfo | URL = input, options: RequestInit | undefined = init) => {
            el.loader;
            if (options && options.method !== 'GET') {
el.csrfToken = await oldFetch('/csrf-token').then(response => response.text());
options.headers
    ? options.headers['X-CSRF-TOKEN' as keyof HeadersInit] = el.csrfToken
    : options = {
        ...options,
        headers: {
            'X-CSRF-TOKEN': el.csrfToken
        }
    };
            }
            if (options && options.headers) options.headers['X-Requested-With' as keyof HeadersInit] = 'Elemental';
            if (!options) options = { headers: { 'X-Requested-With': 'Elemental' } };
            if (!options.headers) options.headers = { 'X-Requested-With': 'Elemental' };
            const response = await oldFetch(url, options);
            el.loader.remove();
            return response;
        }
    })(window.fetch);

    window.onload = ((oldLoad: typeof window.onload | undefined) => {
        el.loader;
        return (e) => {
            if (!!oldLoad) oldLoad.call(window, e);
            el.loader.remove();
        }
    })(window.onload?.bind(window));
}
                    </code>
                </pre>
                <p>
                    There's a little bit of fancy syntax going on here, but the basic idea is that it takes the <code class="language-typescript">fetch</code> function and wraps it in a new function that adds some extra functionality. It checks if the request is a GET request, and if it's not, it fetches a CSRF token from the server and adds it to the request headers. It also adds a special header to the request to identify it as an Elemental request. Finally, it removes the loader element when the request is complete. With the combination of the CSRF token and the Elemental tag, the server will be able to identify the request as coming from your application and not from a malicious source.
                </p>
                <p>
                    We round it out with a bit of code that adds the loader element to the page when the window loads, and removes it when the window is done loading.
                </p>
                <p>
                    This function is called in the <code class="language-plaintext">main.ts</code> file first thing so that the fetch function is ready for everything else you wanna do with it.
                </p>
                <h4>Making Requests</h4>
                <p>
                    The <code class="language-typescript">request</code> function is the basic way to make requests from your application. It's a simple wrapper around the fetch function that adds some extra functionality. Here's what it looks like:
                </p>
                <pre>
                    <code class="language-typescript">
export default async function request<T = Response>(
    method: Method,
    path: string,
    data: RequestData | object | null = null,
    evalResult = true,
): Promise<T extends Response ? Response : T> {
    let payLoad: RequestInit | undefined = undefined;

    if (method !== 'GET') payLoad = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        } as HeadersInit,
        body: JSON.stringify(data) as BodyInit,
    };

    const routePostfix = await getPostfix(method, data as RequestData | null);

    ${escapeHtml`const response = await fetch(\`$\{path}$\{routePostfix}\`, payLoad);`}

    return evalResult
        ? response.json().then(obj => obj as T extends Response ? Response : T)
        : response as T extends Response ? Response : T;
}
                    </code>
                </pre>
                <p>
                    This takes a method, a path, some data, and an optional flag to evaluate the result. Depending on the method, the data should be built as a RequestData object or a plain object. If the method is GET, the data will be appended to the path as query parameters. If the method is POST, PUT, or DELETE, the data will be sent as JSON in the request. The <code class="language-typescript">evalResult</code> flag is used to determine if the response should be evaluated as JSON or returned as is.
                </p>
                <p>
                    This is just the basic request, though. There are other functions in the request service that can be used to make more specific requests. The <code class="language-typescript">get()</code>, <code class="language-typescript">post()</code>, <code class="language-typescript">put()</code>, and <code class="language-typescript">delete()</code> functions are all wrappers around the <code class="language-typescript">request()</code> function that just automatically choose the corresponding method and return an evaulated response. So, most of the time when you see a request being made in a controller, it'll look something like this: <code class="language-typescript">const data = await get('/data/path');</code> or this: <code class="language-typescript">const response = await post('/data/path', { key: 'value' });</code>
                </p>
                <p>
                    Another unique thing about making requests has to do with how the server handles them. There are three different URI directories that the server will respond to: <code class="language-plaintext">/views/</code>, <code class="language-plaintext">/storage/</code>, and <code class="language-plaintext">/data/</code>. The <code class="language-plaintext">/views/</code> directory is used to serve HTML files (useful for serving modals on top of a page that's already being served). The <code class="language-plaintext">/storage/</code> directory is used to serve files from the <code class="language-plaintext">www/storage</code> directory (things like pictures and downloadables). The <code class="language-plaintext">/data/</code> directory is used to serve data from a database.
                </p>
                <p>
                    So, if you want to serve a file from the <code class="language-plaintext">www/storage</code> directory, you would make a request like this: <code class="language-typescript">const file = await get('/storage/path/to/file');</code>. If you want to serve a view from the <code class="language-plaintext">www/views</code> directory, you would make a request like this: <code class="language-typescript">const view = await getHtml('/views/path/to/view');</code>. And if you want to serve data from the server, you would make a request like this: <code class="language-typescript">const data = await get('/data/path/to/data');</code>.
                </p>
                <p>
                    You'll notice the <code class="language-typescript">getHtml</code> function in there. This is a special function that's used to serve HTML views. It's a little different from the other request functions because it can return either a single <code class="language-typescript">HTMLElement</code> or a <code class="language-typescript">NodeListOf&lt;HTMLElement&gt;</code>. This is useful for serving modals or other views that need to be added to the page.
                </p>
            </section>
        </div>
    </el-docs>
`;

export default requestService;