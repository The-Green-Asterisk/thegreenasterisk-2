import el from "@services/elements";
import views from "@views";
import RoutesBase from "./routes.base";

export default class Routes extends RoutesBase {

    ['about']() {
        el.body.appendChild(views.aboutTemplate());
        views.about();
    }

    ['docs']() {
        if (this.path[1]) {
            this.path.shift();
            new views.DocsRoutes(this.path).view();
        } else {
            el.body.appendChild(views.docsTemplate());
            views.docs();
        }
    }

}