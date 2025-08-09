import el from '@elements';
import CookieJar from '@services/cookieJar';

export default function cookieBanner() {
    if (el.cookieBanner) {
        if (CookieJar.get<boolean>('cookies-are-cool')) {
            el.cookieBanner.remove();
        }
    };

    if (el.cookieBannerButton) {
        el.cookieBannerButton.onclick = () => {
            CookieJar.set('cookies-are-cool', true, new Date(new Date().getFullYear() + 999, 0).toUTCString());
            if (el.cookieBanner)
                el.cookieBanner.remove();
        };
    }
}