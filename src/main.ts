import el from '@elements';
import CookieJar from '@services/cookieJar';
import { initLoader } from '@services/request';
import views from '@views';
import Routes from './routes';

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