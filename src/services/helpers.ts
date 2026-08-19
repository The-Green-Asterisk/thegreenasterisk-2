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

    public static enableDragReorder({
        items,
        container,
        itemSelector = '[data-draggable="true"]',
        onReorder,
        pinnedElement
    }: {
        items: HTMLElement[],
        container: HTMLElement,
        itemSelector: string,
        onReorder: () => void | Promise<void>,
        pinnedElement?: HTMLElement | null
    }) {
        const getDragAfterElement = (y: number, x: number) => {
            const draggableElements = [
                ...container.querySelectorAll<HTMLElement>(`${itemSelector}:not(.dragging)`)
            ];

            return draggableElements.reduce<{ offset: number; element: HTMLElement | null }>(
                (closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = (y - (box.top + box.height / 2));

                    if (offset < 0 && offset > closest.offset) {
                        return { offset, element: child };
                    } else {
                        return closest;
                    }
                },
                { offset: Number.NEGATIVE_INFINITY, element: null }
            ).element;
        };

        let isDragging = false;
        let draggingElement: HTMLElement | null = null;
        let placeholder: HTMLElement | null = null;
        let offsetX = 0;
        let offsetY = 0;

        items.forEach((element) => {
            element.addEventListener('dragstart', (e) => e.preventDefault());

            element.addEventListener('pointerdown', (e) => {
                if (element.dataset.draggable === 'false') return;
                if ((e.target as HTMLElement).closest('button')) return;

                e.preventDefault();

                element.setPointerCapture(e.pointerId);
                isDragging = true;
                draggingElement = element;

                const rect = element.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                placeholder = element.cloneNode(true) as HTMLElement;
                placeholder.style.visibility = 'hidden';
                placeholder.classList.add('placeholder');
                element.parentElement?.insertBefore(placeholder, element);

                element.style.position = 'fixed';
                element.style.zIndex = '1000';
                element.style.width = `${rect.width}px`;
                element.style.height = `${rect.height}px`;
                element.style.margin = '0';
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
                element.style.pointerEvents = 'none';

                element.classList.add('dragging');
                document.body.classList.add('is-dragging');
            });

            element.addEventListener('pointermove', (e) => {
                if (!isDragging || !draggingElement || draggingElement !== element) return;

                draggingElement.style.left = `${e.clientX - offsetX}px`;
                draggingElement.style.top = `${e.clientY - offsetY}px`;

                if (placeholder) {
                    const afterElement = getDragAfterElement(e.clientY, e.clientX);
                    if (afterElement) {
                        container.insertBefore(placeholder, afterElement);
                    } else {
                        if (pinnedElement && pinnedElement.parentElement === container) {
                            container.insertBefore(placeholder, pinnedElement);
                        } else {
                            container.appendChild(placeholder);
                        }
                    }
                }
            });

            const endDrag = async (e: PointerEvent) => {
                if (!isDragging || !draggingElement || draggingElement !== element) return;

                try {
                    element.releasePointerCapture(e.pointerId);
                } catch (err) { }

                isDragging = false;

                element.style.position = '';
                element.style.zIndex = '';
                element.style.width = '';
                element.style.height = '';
                element.style.margin = '';
                element.style.left = '';
                element.style.top = '';
                element.style.pointerEvents = '';

                if (placeholder && placeholder.parentElement) {
                    placeholder.parentElement.insertBefore(element, placeholder);
                    placeholder.remove();
                }

                element.classList.remove('dragging');
                document.body.classList.remove('is-dragging');
                draggingElement = null;
                placeholder = null;

                await onReorder();
            };

            element.addEventListener('pointerup', endDrag);
            element.addEventListener('pointercancel', endDrag);
        });
    }
}