import el from "@elements";
import { getHtml } from "@services/request";

export async function buildModalFromUrl(url: string) {
    return getHtml<HTMLElement>(`data/${url}`).then(response => {
        el.body.appendChild(response);
        window.addEventListener('click', (e) => {
            if (e.target === response) {
                el.body.removeChild(response);
            }
        }, { once: true });
        response.querySelector('.close-button')?.addEventListener('click', () => {
            el.body.removeChild(response);
        }, { once: true });
        return response.querySelector('el-modal > div')
    });
}