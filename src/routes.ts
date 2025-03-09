import el from "@elements";
import views from "@views";
import RoutesBase from "./routes.base";

export default class Routes extends RoutesBase {

    ['about']() {
        el.body.appendChild(views.aboutTemplate());
        views.about();
    }

}