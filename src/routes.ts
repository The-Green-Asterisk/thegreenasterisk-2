import el from "@elements";
import views from "@views";
import RoutesBase from "./routes.base";

export default class Routes extends RoutesBase {

    ['about']() {
        el.body.appendChild(views.aboutTemplate());
        views.about();
    }

    ['many-worlds']() {
        el.body.appendChild(views.manyWorldsTemplate());
        views.manyWorlds();
    }

    ['current-games']() {
        if (this.path[1]) {
            this.path.shift();
            new views.CurrentGamesRoutes(this.path).view();
        } else {
            el.body.appendChild(views.currentGamesTemplate());
            views.currentGames();
        }
    }

    ['home']() {
        el.body.appendChild(views.homeTemplate());
        views.home();
    }

    ['store']() {
        el.body.appendChild(views.storeTemplate());
        views.store();
    }

    ['profile']() {
        el.body.appendChild(views.profileTemplate());
        views.profile(this.query);
    }

}