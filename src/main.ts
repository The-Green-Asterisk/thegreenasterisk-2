import el from '@services/elements';
import { initLoader } from '@services/request';
import views from '@views';
import Routes from './routes';
import CookieJar from '@services/cookieJar';

initLoader();
el.establishAuth();

const path = location.pathname.split('/');
path.shift();

el.body.appendChild(views.navTemplate());
views.nav();
if (!CookieJar.get<boolean>('cookies-are-cool')) {
    el.body.appendChild(views.cookieBannerTemplate());
    views.cookieBanner();
}
new Routes(path).view();
new el();