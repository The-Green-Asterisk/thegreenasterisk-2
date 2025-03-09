import el from '@elements';
import CookieJar from '@services/cookieJar';
import Helpers from '@services/helpers';

export default function home() {
    el.title.textContent = 'Welcome to The Green Asterisk!';

    const section = el.sections ? el.sections[0] : null;
    if (section) {
        Helpers.centerSection(section);
        window.addEventListener('resize', () => Helpers.centerSection(section));
    }

    el.buttons?.id('check_auth')?.addEventListener('click', () => {
        console.log('Checking auth...', el.isAuth);
    });
}