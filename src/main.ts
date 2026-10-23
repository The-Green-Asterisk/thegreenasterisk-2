import el from '@elements';
import CookieJar from '@services/cookieJar';
import { initLoader, getData } from '@services/request';
import views from '@views';
import Routes from './routes';

initLoader();
el.establishAuth();
if (el.sessionKey) {
    // Sessions last three months on the server; drop one it no longer knows
    getData<boolean>('/check-auth').then(isAuth => {
        if (!isAuth) {
            localStorage.removeItem('sessionKey');
            localStorage.removeItem('currentUser');
            location.reload();
        }
    }).catch(() => { });
}

const path = location.pathname.split('/');
path.shift();

el.body.prepend(views.footerTemplate());
el.body.appendChild(views.navTemplate());
views.nav();
if (!CookieJar.get<boolean>('cookies-are-cool')) {
    el.body.appendChild(views.cookieBannerTemplate());
    views.cookieBanner();
}
new Routes(path).view();
new el();