import el from '@elements';
import { postData } from '@services/request';

export default function contact() {
    el.title.textContent = 'Contact Us';

    const form = el.forms.id('contact-form');
    if (!form) return;
    const status = form.querySelector<HTMLElement>('.contact-status');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (status) status.textContent = '';
        postData<string>('/send-contact', {
            name: value('name'),
            email: value('email'),
            message: value('message'),
            // the hidden honeypot field; people leave it empty
            website: value('_website')
        }).then(reply => {
            if (status) status.textContent = reply;
            form.reset();
            if (button) button.textContent = 'Sent';
        }).catch(error => {
            if (status) status.textContent = typeof error === 'string' ? error : "Your message couldn't be sent. Please try again later.";
            if (button) {
                button.disabled = false;
                button.textContent = 'Send';
            }
        });
    }, { signal: el.signal });
}
