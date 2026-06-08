import el from "@elements";
import request, { getData, getHtml } from "@services/request";
import views from "@views";
import User from "./entities/User";

export default class RoutesBase {
    query: { [key: string]: boolean | number | string } = {};
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
            sessionStorage.setItem('sessionKey', this.query.sessionKey as string);
            getData('/check-auth');
        }
    }

    ['']() {
        el.body.appendChild(views.homeTemplate());
        views.home();
    }

    ['start']() {
        const url = this.query.url as string;
        const uid = this.query.uid;
        request('GET', '/data/start', { uid }, false)
            .then((response) => {
                if (response.ok) {
                    const sessionKey = response.headers.get('Authorization');
                    if (!sessionKey) throw new Error('No session key returned');
                    sessionStorage.setItem('sessionKey', sessionKey);
                    el.sessionKey = sessionKey;
                    return response.json();
                } else {
                    throw new Error(response.statusText);
                }
            })
            .then((user: User | undefined) => {
                if (!user) throw new Error('No user returned');
                delete user.password;
                delete user.email;
                delete user.discord_id;
                delete user.age;
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                el.currentUser = user;
                window.location.href = url;
            })
            .catch((error) => {
                console.error(error.message ?? error);
                window.location.href = url;
            });
    }

    ['logout']() {
        sessionStorage.removeItem('sessionKey');
        sessionStorage.removeItem('currentUser');
        request('GET', '/data/logout').then(() => {
            window.history.back();
        });
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

                    if (!el.nav?.nextElementSibling) {
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