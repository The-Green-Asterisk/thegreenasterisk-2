import { describe, expect, it } from 'vitest';
import contactTemplate from '../../../src/views/contact/contact.template';
import cookieBannerTemplate from '../../../src/views/cookieBanner/cookieBanner.template';
import errorPage from '../../../src/views/errorPage/errorPage.template';
import footerTemplate from '../../../src/views/footer/footer.template';
import homeTemplate from '../../../src/views/home/home.template';

describe('Frontend View Templates', () => {
    it('renders homeTemplate with expected hero content', () => {
        const element = homeTemplate();
        expect(element.tagName.toLowerCase()).toBe('el-home');
        expect(element.querySelector('h1')?.textContent).toContain('Do You D&D?');
        expect(element.querySelector('.hero-slate')).not.toBeNull();
    });

    it('renders cookieBannerTemplate with accept button', () => {
        const element = cookieBannerTemplate();
        expect(element.tagName.toLowerCase()).toBe('el-cookie-banner');
        const button = element.querySelector('button');
        expect(button).not.toBeNull();
        expect(button?.textContent).toBe('Accept Cookies');
    });

    it('renders errorPage with status code', () => {
        const error404 = errorPage(404);
        expect(error404.textContent).toContain('404');

        const error500 = errorPage(500);
        expect(error500.textContent).toContain('500');
    });

    it('renders footerTemplate with copyright and links', () => {
        const footer = footerTemplate();
        expect(footer.tagName.toLowerCase()).toBe('el-footer');
        expect(footer.querySelector('a')).not.toBeNull();
    });

    it('renders contactTemplate with contact form inputs', () => {
        const contact = contactTemplate();
        expect(contact.tagName.toLowerCase()).toBe('el-contact');
        expect(contact.querySelector('input[name="name"]')).not.toBeNull();
        expect(contact.querySelector('input[name="email"]')).not.toBeNull();
        expect(contact.querySelector('textarea[name="message"]')).not.toBeNull();
    });
});
