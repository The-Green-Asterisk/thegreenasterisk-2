import el from '@services/elements';
import { initLoader } from '@services/request';
import views from '@views';
import Routes from './routes';

initLoader();
new el();

const path = location.pathname.split('/');
path.shift();

el.body.appendChild(views.navTemplate());
views.nav();
new Routes(path).view();