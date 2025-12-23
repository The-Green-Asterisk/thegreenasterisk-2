import el from '@elements';
import CookieJar from './cookieJar';

export function initLoader() {
    el.loader;
    window.fetch = ((oldFetch: typeof window.fetch, input: RequestInfo | URL = '', init?: RequestInit | undefined) => {
        return async (url: RequestInfo | URL = input, options: RequestInit | undefined = init) => {
            el.loader;
            if (options && options.method !== 'GET') {
                el.csrfToken = await oldFetch('/csrf-token').then(response => response.text());
                options.headers
                    ? options.headers['X-CSRF-TOKEN' as keyof HeadersInit] = el.csrfToken
                    : Object.assign(options, { headers: { 'X-CSRF-TOKEN': el.csrfToken } });
            }
            if (options && options.headers) Object.assign(options.headers, { 'X-Requested-With': 'Elemental' });
            if (!options) options = { headers: { 'X-Requested-With': 'Elemental' } } as RequestInit;
            if (!options.headers) options.headers = { 'X-Requested-With': 'Elemental' } as HeadersInit;
            return oldFetch(url, options).then((resp) => {
                el.loader.remove();
                if (!resp.ok) return resp.json().then(err => {throw err;});
                return resp;
            });
        }
    })(window.fetch);
    window.addEventListener('load', () => el.loader.remove());
}

export default async function request<T = Response>(
    method: Method,
    path: string,
    data: RequestData | object | null = null,
    evalResult = true,
 ): Promise<T extends Response ? Response : T> {
    let payLoad!: RequestInit;
    let sessionKey = CookieJar.get<string>('sessionKey');

    if (sessionKey) payLoad = {
        headers: {
            'Authorization': sessionKey
        } as HeadersInit
    };

    if (method !== 'GET') payLoad = Object.assign(payLoad ?? {}, {
        method,
        headers: data instanceof FormData ? undefined : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        } as HeadersInit,
        body: data instanceof FormData ? data : JSON.stringify(data) as BodyInit,
    });

    const routePostfix = getPostfix(method, data);

    const response = await fetch(`${path}${routePostfix}`, payLoad);

    return evalResult
        ? await response.json().then((obj: T extends Response ? Response : T) => obj)
        : response as T extends Response ? Response : T;
}

function getPostfix(method: string, data: RequestData | object | null = null) {
    let postfix = '';
    if (data && method === 'GET') {
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => {
            params.append(key, (data as RequestData)[key].toString());
        });
        postfix = `?${params.toString()}`;
    }
    return postfix;
}

export async function get<T = Response>(path: string, data: RequestData | null = null) {
    return await request<T>('GET', path, data);
}

/**
 * An HTML view could come in as either one HTMLElement
 * or a NodeList of HTMLElements. If you do not specificy
 * one or the other, the type will be inferred as
 * HTMLElement | NodeListOf<HTMLElement> and your code
 * will have to account for both cases. HTMLElement
 * subclasses such as HTMLDivElement, HTMLSpanElement,
 * etc. are also valid types.
 */
export async function getHtml<T extends HTMLElement | NodeListOf<HTMLElement>>(path: string, data: RequestData | null = null) {
    return await request('GET', path, data, false)
        .then(response => response.text())
        .then(html => { 
            const ele = new DOMParser().parseFromString(html, 'text/html').body.childNodes;
            var result = ele.length === 1 ? ele[0] as T : ele as NodeList;
            return result as T;
        });
}

export async function post<T = Response>(path: string, data: RequestData | object | null = null) {
    return await request<T>('POST', path, data);
}

export async function put<T = Response>(path: string, data: RequestData | object | null = null) {
    return await request<T>('PUT', path, data);
}

export async function del<T = Response>(path: string, data: RequestData | object | null = null) {
    return await request<T>('DELETE', path, data, false);
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
class RequestData { [key: string]: string | boolean | number };