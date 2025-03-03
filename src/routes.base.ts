import el from "@services/elements";
import { getHtml } from "@services/request";
import views from "@views";

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
    }

    ['']() {
        el.body.appendChild(views.homeTemplate(
            "It's Elemental",
            "A boilerplate framework for TypeScript web development."
        ));
        views.home();
    }

    view() {
        const view = this[this.path[0]].bind(this);
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

                if (el.nav.nextElementSibling === null) {
                    el.body.appendChild(views.homeTemplate('404', 'Page Not Found'));
                    views.home();
                }
            });
        } else {
            view();
        }
    }
    [key: string]: any;
}