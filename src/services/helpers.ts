export default class Helpers {
    /**
    * Creates an HTMLElement from a template string
    * @param html The template string
    * @param values The values to be inserted into the template string
    * @returns The HTMLElement
    * @example
    * const el = html`<div>${'Hello World!'}</div>`;
    * document.body.appendChild(el);
    */
    public static html(html: TemplateStringsArray, ...values: any[]): HTMLElement {
        let string: string = '';
        html.forEach((str, i) => string += str + (values[i] ?? ''));
        const template = document.createElement('template');
        template.innerHTML = string.trim();
    return template.content.firstChild as HTMLElement;
    }

    public static escapeHtml(html: TemplateStringsArray, ...values: any[]): string {
        let string: string = '';
        html.forEach((str, i) => string += str + (values[i] ?? ''));
    return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&#96;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
    }
}