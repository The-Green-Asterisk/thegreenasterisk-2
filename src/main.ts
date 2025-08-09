import el from '@services/elements';
import { initLoader } from '@services/request';
import views from '@views';
import Routes from './routes';

initLoader();
el.establishAuth();

const path = location.pathname.split('/');
path.shift();

el.body.appendChild(views.navTemplate());
views.nav();
el.body.appendChild(views.cookieBannerTemplate());
views.cookieBanner();
new Routes(path).view();
new el();