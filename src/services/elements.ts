import CookieJar from "@services/cookieJar";
import StorageBox from "@services/storageBox";
import User from "../entities/User";

type FormValues = { [key: string]: string };
declare global {
    interface NodeListOf<TNode extends Node> extends NodeList {
        /**
         * Returns a single element from the node list that matches the id 
         */
        id(id: string): TNode;
    }
}

export default class El {
    private static getElement = <T extends HTMLElement = HTMLElement>(selector: string): T | null=> {
        let el = document.querySelector<T>(selector);
        return el;
    }
    private static getElements = <T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> | null => {
        let els = document.querySelectorAll<T>(selector);
        if (!els || els.length == 0) {
            console.error(`Nodes with selector "${selector}" not found!`);
            return null;
        } else {
            els.id = (id: string): T => {
                const el = [...els].find(el => el.id === id);
                if (!el) throw new Error(`Element with id "${id}" not found.`);
                return el;
            }
            return els;
        }
    }

    public static get isAuth(): boolean {
        return this.sessionKey && this.sessionKey !== ''
            ? Number(this.sessionKey.substring(this.sessionKey.indexOf('%') + 1)) === this.currentUser?.id
            : false;
    };

    public static currentUser: User | undefined;

    public static sessionKey: string = '';

    public static establishAuth() {
        this.currentUser = CookieJar.get<User>('currentUser');
        this.sessionKey = CookieJar.get<string>('sessionKey');
    }

    public static logout() {
        if (this.currentUser) {
            CookieJar.delete('currentUser');
            CookieJar.delete('sessionKey');
            this.currentUser = undefined;
            this.sessionKey = '';
        }
    }

    public static get root() {
        const el = this.getElement<HTMLElement>(':root');
        if (!el) {
            throw new Error('Root element not found!');
        }
        return el;
    } set root(root: HTMLElement) {
        this.root = root;
    }
    public static get body() {
        const el = this.getElement<HTMLBodyElement>('body');
        if (!el) {
            throw new Error('Body element not found!');
        }
        return el;
    } set body(body: HTMLBodyElement) {
        this.body = body;
    }
    public static get title() {
        const el = this.getElement<HTMLTitleElement>('title');
        if (!el) {
            throw new Error('Title element not found!');
        }
        return el;
    } set title(title: HTMLTitleElement) {
        this.title = title;
    }
    public static get inputs() {
        return this.getElements<HTMLInputElement>('input');
    } set inputs(inputs: NodeListOf<HTMLInputElement>) {
        this.inputs = inputs;
    }
    public static get textareas() {
        return this.getElements<HTMLTextAreaElement>('textarea');
    } set textareas(textareas: NodeListOf<HTMLTextAreaElement>) {
        this.textareas = textareas;
    }
    public static get nav() {
        return this.getElement<HTMLElement>('nav');
    } set nav(nav: HTMLElement) {
        this.nav = nav;
    }
    public static csrfToken: string = '';
    public static get modal() {
        return this.getElement<HTMLDivElement>('#modal');
    } set modal(modal: HTMLDivElement) {
        this.modal = modal;
    }
    public static get loader() {
        // The loader is a special element that will be created if it is not found
        let loader = document.querySelector('loader');
        if (!loader) {
            let spinner = document.createElement('spinner');
            loader = document.createElement('loader') as HTMLElement;
            loader.appendChild(spinner);
            document.body.appendChild(loader);
        }
        return loader;
    } set loader(loader: HTMLElement) {
        this.loader = loader;
    }
    public static get selectors() {
        return this.getElements<HTMLSelectElement>('select');
    } set selectors(selectors: NodeListOf<HTMLSelectElement>) {
        this.selectors = selectors;
    }
    public static get buttons() {
        return this.getElements<HTMLButtonElement>('button');
    } set buttons(buttons: NodeListOf<HTMLButtonElement>) {
        this.buttons = buttons;
    }
    public static get divs() {
        return this.getElements<HTMLDivElement>('div');
    } set divs(divs: NodeListOf<HTMLDivElement>) {
        this.divs = divs;
    }
    public static get paragraphs() {
        return this.getElements<HTMLParagraphElement>('p');
    } set paragraphs(paragraphs: NodeListOf<HTMLParagraphElement>) {
        this.paragraphs = paragraphs;
    }
    public static get forms() {
        return this.getElements<HTMLFormElement>('form');
    } set forms(forms: NodeListOf<HTMLFormElement>) {
        this.forms = forms;
    }
    public static get imgs() {
        return this.getElements<HTMLImageElement>('img');
    } set imgs(imgs: NodeListOf<HTMLImageElement>) {
        this.imgs = imgs;
    }
    public static get sections() {
        return this.getElements<HTMLElement>('section');
    } set sections(sections: NodeListOf<HTMLElement>) {
        this.sections = sections;
    }
    public static get formInputs() {
        return this.getElements<HTMLInputElement | HTMLTextAreaElement>('form input, form textarea');
    } set formInputs(formInputs: NodeListOf<HTMLInputElement | HTMLTextAreaElement>) {
        this.formInputs = formInputs;
    }
    public static get submitButton() {
        return this.getElement<HTMLButtonElement>('button[type="submit"]');
    } set submitButton(submitButton: HTMLButtonElement) {
        this.submitButton = submitButton;
    }
    public static get cookieBanner() {
        return this.getElement<HTMLElement>('cookie-banner');
    } set cookieBanner(cookieBanner: HTMLElement) {
        this.cookieBanner = cookieBanner;
    }
    public static get cookieBannerButton() {
        return this.getElement<HTMLButtonElement>('cookie-banner button');
    } set cookieBannerButton(cookieBannerButton: HTMLButtonElement) {
        this.cookieBannerButton = cookieBannerButton;
    }
    public static get home() {
        return this.getElement<HTMLElement>('el-home');
    } set home(home: HTMLElement) {
        this.home = home;
    }
    public static get profile() {
        return this.getElement<HTMLElement>('el-profile');
    } set profile(profile: HTMLElement) {
        this.profile = profile;
    }
    public static get currentGames() {
        return this.getElement<HTMLElement>('el-current-games');
    } set currentGames(currentGames: HTMLElement) {
        this.currentGames = currentGames;
    }
    public static get survivors() {
        return this.getElement<HTMLElement>('el-survivors');
    } set survivors(survivors: HTMLElement) {
        this.survivors = survivors;
    }

    constructor(private submitted = false) {
        document.querySelectorAll('[bg]').forEach(el => {
            // this will create the bg attribute and use it to set the element's background image
            (el as HTMLElement).style.backgroundImage = `url(${el.getAttribute('bg')})`;
        });

        if (this.selectors && this.selectors.length > 0) {
            // this will make selector options toggle on mousedown
            // which is not the default behavior. This can be deleted
            // if the default behavior is desired.
            this.selectors.forEach(selector => {
                selector.onclick = (e) => {
                    e.preventDefault();
                    selector.focus();
                };
                [...selector.options].forEach(option => {
                    option.onmousedown = (e) => {
                        e.preventDefault();
                        if (option.value === (e.target as HTMLOptionElement)?.value) {
                            option.selected = !option.selected;
                        }
                    };
                });
            });
        }

        if (this.formInputs && this.submitButton) {
            // This will disable the submit button if any required inputs are empty
            let requiredInputs = [...this.formInputs].filter(input => input.required);
            let disableSubmitButton = () => {
                if (this.submitButton)
                    this.submitButton.disabled = !requiredInputs.every(input => input.value.trim().length > 0);
            };
            setTimeout(disableSubmitButton, 1000);
            requiredInputs.forEach(input => {
                input.oninput = ((oldOnInput: typeof input.oninput | undefined) => {
                    return (e) => {
                        if (oldOnInput) oldOnInput.call(input, e);
                        disableSubmitButton();
                    };
                })(input.oninput?.bind(input));
            });

            // This will disable the submit button and change its text to a spinner when form is submitted
            this.forms.forEach(form => {
                form.onsubmit = ((oldOnSubmit: typeof form.onsubmit | undefined) => {
                    form.submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
                    return (e) => {
                        if (oldOnSubmit) oldOnSubmit.call(form, e);
                        form.submitButton.disabled = true;
                        form.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        this.submitted = true;
                    }
                })(form.onsubmit?.bind(form));
            });
        }

        window.onbeforeunload = ((oldBeforeUnload: typeof window.onbeforeunload | undefined) => {
            // this will save form values to local storage before the page is unloaded
            return (e) => {
                if (oldBeforeUnload) oldBeforeUnload.call(window, e);
                if (this.formInputs && this.formInputs.length == 0) return;
                if (this.submitted) {
                    StorageBox.clear();
                    return;
                }

                let values: {
                    [index: string]: string
                } = {};
                this.formInputs?.forEach(input => {
                    if (input && input.name && !input.name.startsWith('_') && input.type !== 'file')
                        values[input.name] = input.value;
                });

                StorageBox.set('formValues', values);
            }
        })(window.onbeforeunload?.bind(window));
        window.onload = ((oldLoad: typeof window.onload | undefined) => {
            // this will load form values from local storage when the page is loaded
            return (e) => {
                if (oldLoad) oldLoad.call(window, e);
                if (this.formInputs?.length == 0) return;

                let values = StorageBox.get<FormValues>('formValues');

                this.formInputs?.forEach(input => {
                    if (input && input.name
                        && !input.name.startsWith('_')
                        && input.type !== 'file'
                        && values && values[input.name]
                    ) input.value = values[input.name];
                });

                StorageBox.remove('formValues');
            }
        })(window.onload?.bind(window));

        // These will eventually have to move to their own view template
        if (this.cookieBanner) {
            if (CookieJar.get<boolean>('cookies-are-cool')) {
                this.cookieBanner.remove();
            }
        };

        if (this.cookieBannerButton) {
            this.cookieBannerButton.onclick = () => {
                CookieJar.set('cookies-are-cool', true, new Date(new Date().getFullYear() + 999, 0).toUTCString());
                if (this.cookieBanner)
                    this.cookieBanner.remove();
            };
        }
    }
};

/**
* Creates an HTMLElement from a template string
* @param html The template string
* @param values The values to be inserted into the template string
* @returns The HTMLElement
* @example
* const el = html`<div>${'Hello World!'}</div>`;
* document.body.appendChild(el);
*/
export function html(html: TemplateStringsArray, ...values: any[]): HTMLElement {
   let string: string = '';
   html.forEach((str, i) => string += str + (values[i] ?? ''));
   const template = document.createElement('template');
   template.innerHTML = string.trim();
   return template.content.firstChild as HTMLElement;
}

/**
 * Creates an HTML string from a template string that can be used within
 * another template string
 * @param html The template string
 * @param values The values to be inserted into the template string
 * @returns The HTML string
 * @example
 * const el = html`<div>Hello World! ${ goodbye ? htmlstring`<span>Goodbye World!</span>` : '' }</div>`;
 * document.body.appendChild(el);
 **/
export function htmlstring(html: TemplateStringsArray, ...values: any[]): string {
   let string: string = '';
   html.forEach((str, i) => string += str + (values[i] ?? ''));
   return string;
}

export function escapeHtml(html: TemplateStringsArray, ...values: any[]): string {
   let string: string = '';
   html.forEach((str, i) => string += str + (values[i] ?? ''));
   return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&#96;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
}

setTimeout(() => {
    let ids = new Set<string>();
    document.querySelectorAll('[id]').forEach((el) => {
         if (ids.has(el.id)) {
              console.warn(`Duplicate id "${el.id}" found!`);
         } else {
              ids.add(el.id);
         }
    });
}, 1000);