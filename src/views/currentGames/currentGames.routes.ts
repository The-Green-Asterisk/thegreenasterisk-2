import el from '@elements';
import Routes from '@routes';
import views from '@views';

export default class CurrentGamesRoutes extends Routes {
    ['survivors']() {
        el.body.appendChild(views.currentGamesTemplate.survivorsTemplate());
        views.currentGames().survivors();
    }

    ['darvell']() {
        el.body.appendChild(views.characterSheetTemplate());
        views.characterSheet();
    }

    ['character-sheet']() {
        el.body.appendChild(views.characterSheetTemplate());
        views.characterSheet();
    }
}