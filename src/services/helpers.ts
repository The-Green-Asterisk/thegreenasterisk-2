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

    public static displayTitleOnTap(this: HTMLElement, event: TouchEvent) {
        if (this.title) {
            const titleDisplay = document.createElement('div');
            titleDisplay.textContent = this.title;
            titleDisplay.style.position = 'absolute';

            const rect = this.getBoundingClientRect();
            titleDisplay.style.left = (event.touches[0].clientX - (titleDisplay.offsetWidth / 2)) + 'px';
            titleDisplay.style.top = (rect.bottom + 5) + 'px';

            titleDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            titleDisplay.style.color = 'white';
            titleDisplay.style.padding = '5px';
            titleDisplay.style.borderRadius = '3px';
            titleDisplay.style.zIndex = '1000';
            document.body.appendChild(titleDisplay);

            setTimeout(function () {
                if (document.body.contains(titleDisplay)) {
                    document.body.removeChild(titleDisplay);
                }
            }, 3000);
        }
    }

    public static singularize(word: string) {
        const endings: { [string: string]: string } = {
            ves: 'f',
            ivies: 'ivy', // handles exceptions like 'ivies' -> 'ivy'
            ies: 'y',
            i: 'us', // Latin plurals like 'cacti' -> 'cactus'
            ea: 'eum', // Latin plurals like 'data' -> 'datum' (often treated as uncountable in modern English)
            zes: 'ze',
            ses: 's',
            es: 'e',
            s: ''
        };

        // Sort endings by length in descending order to match the longest suffix first
        const sortedEndings = Object.keys(endings).sort((a, b) => b.length - a.length);

        for (const ending of sortedEndings) {
            const regex = new RegExp(`${ending}$`);
            if (regex.test(word)) {
                // Handle 'lives' -> 'life' exception correctly with 'f'
                if (ending === 'ves' && word !== 'lives') {
                    return word.replace(regex, endings[ending] + 'e'); // e.g., 'knives' -> 'knife'
                }
                return word.replace(regex, endings[ending]);
            }
        }
        return word; // return original word if no rule matches
    };
}