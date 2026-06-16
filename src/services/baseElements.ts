import StorageBox from "@services/storageBox";
import { lightbox, lightboxTemplate } from "@views";
import User from "../entities/User";
import Helpers from "./helpers";

type FormValues = { [key: string]: string };
declare global {
    interface NodeListOf<TNode extends Node> extends NodeList {
        /**
         * Returns a single element from the node list that matches the id 
         */
        id(id: string): TNode | undefined;
    }

    interface String {
        stripScripts(): string;
        doubleBreakDivs(): string;
    }
}

String.prototype.stripScripts = function (): string {
    return this.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
};

String.prototype.doubleBreakDivs = function (): string {
    // find divs with brs in them, remove them and replace them with double brs
    return this.replace(/<div[^>]*>([\s\S]*?)<\/div>/gmi, (match, p1) => {
        if (p1.includes('<br')) {
            return p1.replace(/<br[^>]*>/gmi, '<br><br>');
        } else {
            return match;
        }
    }) // remove all other div tags
        .replace(/<div[^>]*>([\s\S]*?)<\/div>/gmi, '$1');
};

export default class BaseEl {
    public static getElement = <T extends HTMLElement = HTMLElement>(selector: string): T | null => {
        let el = document.querySelector<T>(selector);
        return el;
    }
    public static getElements = <T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> | null => {
        let els = document.querySelectorAll<T>(selector);
        if (!els || els.length == 0) {
            console.error(`Nodes with selector "${selector}" not found!`);
            return null;
        } else {
            els.id = (id: string): T | undefined => {
                const el = [...els].find(el => el.id === id);
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

    /**
     * Checks if the current user is authenticated.
     * @param input Optional parameter or function to execute if the user is authenticated.
     * @param silent Set to true to suppress the boolean return.
     * @returns The result of the function or the passed through parameter if provided and the user is authenticated, otherwise true if no function is provided, or false if the user is not authenticated. A function receives the current user as an argument.
     */
    public static checkAuth<T>(input?: T | ((user: User) => T), silent = false) {
        if (this.isAuth) {
            return typeof input === 'function' ? (input as (user: User) => T)(this.currentUser!) : input ?? true;
        } else {
            return silent ? void 0 : false;
        }
    }

    /**
     * Checks if the current user is an admin.
     * @param input Optional parameter or function to execute if the user is an admin.
     * @param silent Set to true to suppress the boolean return.
     * @returns The result of the function or the passed through parameter if provided and the user is an admin, otherwise true if no function is provided, or false if the user is not an admin. A function receives the current user as an argument.
     */
    public static checkAdmin<T>(input?: T | ((user: User) => T), silent = false) {
        if (this.currentUser?.isAdmin) {
            return typeof input === 'function' ? (input as (user: User) => T)(this.currentUser) : input ?? true;
        } else {
            return silent ? void 0 : false;
        }
    }

    public static currentUser: User | undefined = undefined;

    public static sessionKey: string = '';

    public static establishAuth() {
        this.currentUser = sessionStorage.getItem('currentUser')
            ? JSON.parse(sessionStorage.getItem('currentUser')!)
            : undefined;
        this.sessionKey = sessionStorage.getItem('sessionKey') ?? '';
    }

    public static logout() {
        if (this.currentUser) {
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('sessionKey');
            delete this.currentUser;
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
        return this.getElements<HTMLInputElement>('input') ?? ([] as unknown as NodeListOf<HTMLInputElement>);
    } set inputs(inputs: NodeListOf<HTMLInputElement>) {
        this.inputs = inputs;
    }
    public static get textareas() {
        return this.getElements<HTMLTextAreaElement>('textarea') ?? ([] as unknown as NodeListOf<HTMLTextAreaElement>);
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
            // If multiple loaders end up being created, keep track of them and remove them as necessary
            loader.remove = ((oldRemove) => {
                return () => {
                    this.loaderCount--;
                    this.loaderCount--; // there needs to be two because ++ gets called again when loader does
                    if (this.loaderCount <= 0) oldRemove.call(loader);
                };
            })(loader.remove);
            document.body.appendChild(loader);
        }
        this.loaderCount++
        return loader;
    } set loader(loader: HTMLElement) {
        this.loader = loader;
    }
    public static loaderCount = 0;
    public static get selectors() {
        return this.getElements<HTMLSelectElement>('select') ?? ([] as unknown as NodeListOf<HTMLSelectElement>);
    } set selectors(selectors: NodeListOf<HTMLSelectElement>) {
        this.selectors = selectors;
    }
    public static get buttons() {
        return this.getElements<HTMLButtonElement>('button') ?? ([] as unknown as NodeListOf<HTMLButtonElement>);
    } set buttons(buttons: NodeListOf<HTMLButtonElement>) {
        this.buttons = buttons;
    }
    public static get divs() {
        return this.getElements<HTMLDivElement>('div') ?? ([] as unknown as NodeListOf<HTMLDivElement>);
    } set divs(divs: NodeListOf<HTMLDivElement>) {
        this.divs = divs;
    }
    public static get paragraphs() {
        return this.getElements<HTMLParagraphElement>('p') ?? ([] as unknown as NodeListOf<HTMLParagraphElement>);
    } set paragraphs(paragraphs: NodeListOf<HTMLParagraphElement>) {
        this.paragraphs = paragraphs;
    }
    public static get forms() {
        return this.getElements<HTMLFormElement>('form') ?? ([] as unknown as NodeListOf<HTMLFormElement>);
    } set forms(forms: NodeListOf<HTMLFormElement>) {
        this.forms = forms;
    }
    public static get imgs() {
        return this.getElements<HTMLImageElement>('img') ?? ([] as unknown as NodeListOf<HTMLImageElement>);
    } set imgs(imgs: NodeListOf<HTMLImageElement>) {
        this.imgs = imgs;
    }
    public static get sections() {
        return this.getElements<HTMLElement>('section') ?? ([] as unknown as NodeListOf<HTMLElement>);
    } set sections(sections: NodeListOf<HTMLElement>) {
        this.sections = sections;
    }
    public static get formInputs() {
        return this.getElements<HTMLInputElement | HTMLTextAreaElement>('form input, form textarea') ?? ([] as unknown as NodeListOf<HTMLInputElement | HTMLTextAreaElement>);
    } set formInputs(formInputs: NodeListOf<HTMLInputElement | HTMLTextAreaElement>) {
        this.formInputs = formInputs;
    }
    public static get submitButton() {
        return this.getElement<HTMLButtonElement>('button[type="submit"]');
    } set submitButton(submitButton: HTMLButtonElement) {
        this.submitButton = submitButton;
    }
    public static get cookieBanner() {
        return this.getElement<HTMLElement>('el-cookie-banner');
    } set cookieBanner(cookieBanner: HTMLElement) {
        this.cookieBanner = cookieBanner;
    }
    public static get textEditor() {
        return this.getElement<HTMLElement>('el-text-editor');
    }

    constructor(private submitted = false) {
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
    }
};

setTimeout(() => {
    // these functions will run after the page is built and displayed so that
    // any programmatic changes can be made in the page's controller

    let ids = new Set<string>();
    document.querySelectorAll('[id]').forEach((el) => {
        // this will check for duplicate IDs and warn you when one is found.
        // unique IDs are necessary for certain aspects of the way Elemental is set up.
        if (ids.has(el.id)) {
            console.warn(`Duplicate id "${el.id}" found!`);
        } else {
            ids.add(el.id);
        }
    });

    document.querySelectorAll('[light-box]').forEach(el => {
        // this will create the lightBox attribute and use it to set the element's onclick event
        (el as HTMLElement).onclick = () => {
            const srcUrl = el.getAttribute('src') ?? el.getAttribute('light-box');
            let type = el.tagName.toLowerCase() as 'img' | 'video' | 'iframe';
            if (type !== 'img' && type !== 'video' && type !== 'iframe' && el.hasAttribute('light-box-type')) {
                type = el.getAttribute('light-box-type') as 'img' | 'video' | 'iframe';
            }
            if (srcUrl) {
                document.querySelector('body')?.appendChild(lightboxTemplate(srcUrl, type));
                lightbox();
            }
        };
    });

    document.querySelectorAll('[bg]').forEach(el => {
        // this will create the bg attribute and use it to set the element's background image
        (el as HTMLElement).style.backgroundImage = `url(${el.getAttribute('bg')})`;
    });

    document.querySelectorAll<HTMLElement>('[title]').forEach(el => {
        // this will display the title of the element when it is tapped
        el.addEventListener('touchstart', Helpers.displayTitleOnTap);
    });
}, 1000);