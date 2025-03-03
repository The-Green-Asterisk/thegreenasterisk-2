import el from '@services/elements';
import views from '@views';
import Routes from '@routes';

export default class DocsRoutes extends Routes {

    ['getting-started']() {
        el.body.appendChild(
            views.docsTemplate.gettingStarted()
        );
        views.docs();
    }

    ['elements']() {
        el.body.appendChild(
            views.docsTemplate.elementsTemplate()
        );
        views.docs();
    }

    ['routes']() {
        el.body.appendChild(
            views.docsTemplate.routesTemplate()
        );
        views.docs();
    }

    ['views']() {
        el.body.appendChild(
            views.docsTemplate.viewsTemplate()
        );
        views.docs();
    }

    ['request-service']() {
        el.body.appendChild(
            views.docsTemplate.requestServiceTemplate()
        );
        views.docs();
    }

    ['the-server']() {
        el.body.appendChild(
            views.docsTemplate.theServer()
        );
        views.docs();
    }

    ['faq']() {
        el.body.appendChild(
            views.docsTemplate.faqTemplate()
        );
        views.docs();
    }
}