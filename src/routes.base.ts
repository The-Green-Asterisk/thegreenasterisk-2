import el from "@elements";
import CookieJar from "@services/cookieJar";
import request, { get, getHtml } from "@services/request";
import views from "@views";
import User from "./entities/User";

export default class RoutesBase {
    query: {[key: string]: any} = {};
    constructor(
        public path: string[]
    ) {
        for (const [key, value] of new URLSearchParams(location.search).entries()) {
            this.query[key] = isNaN(Number(value))
                ? value.toLowerCase() == 'true' || value.toLowerCase() == 'false'
                    ? Boolean(value.toLowerCase())
                    : value
                : Number(value);
        }

        if (!!this.query.sessionKey) {
            CookieJar.set('sessionKey', this.query.sessionKey, new Date(Date.now() + 86400000).toUTCString());
            get('/data/check-auth');
        }
    }

    ['']() {
        el.body.appendChild(views.homeTemplate());
        views.home();
    }

    ['start']() {
        const url = this.query.url;
        const uid = this.query.uid;
        request('GET', '/data/start', { uid }, false)
        .then((response) => {
            if (response.ok) {
                const sessionKey = response.headers.get('Authorization');
                if (!sessionKey) throw new Error('No session key returned');
                CookieJar.set('sessionKey', sessionKey, new Date(Date.now() + 86400000).toUTCString());
                el.sessionKey = sessionKey;
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        .then((user: User | undefined) => {
            if (!user) throw new Error('No user returned');
            CookieJar.set('currentUser', user, new Date(Date.now() + 86400000).toUTCString());
            el.currentUser = user;
            window.location.href = url;
        })
        .catch((error) => {
            console.error(error.message ?? error);
            window.location.href = url;
        });
    }

    ['logout']() {
        CookieJar.delete('sessionKey');
        CookieJar.delete('currentUser');
        request('GET', '/data/logout');
        window.location.href = '/';
    }

    view() {
        const view = this[this.path[0]]?.bind(this);
        if (typeof view !== 'function') {
            getHtml(location.pathname)
            .then((page) => {
                if (page instanceof HTMLElement) {
                    el.body.appendChild(page);
                } else if (page instanceof NodeList) {
                    page.forEach((element) => {
                        el.body.appendChild(element);
                    });
                }

                if (el.nav?.nextElementSibling === null) {
                    el.body.appendChild(views.errorPage(404));
                    views.home();
                }
            });
        } else {
            view();
        }
    }
    [key: string]: any;
}