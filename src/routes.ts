import el from "@elements";
import views from "@views";
import RoutesBase from "./routes.base";

export default class Routes extends RoutesBase {

    ['about']() {
        el.body.appendChild(views.aboutTemplate());
        views.about();
    }

    ['many-worlds']() {
        this.path.shift();
        // build path params by taking next segment and making it a key and the next segment a value
        let pathParams: Record<string, number> = {};
        for (let i = 0; i < this.path.length; i += 2) {
            let key = this.path[i];
            let value = this.path[i + 1];
            if (key && value) {
                pathParams[key] = Number(value);
            }
        }
        el.body.appendChild(views.manyWorldsTemplate());
        views.manyWorlds(pathParams);
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