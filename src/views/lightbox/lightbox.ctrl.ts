import el from '@elements';

export default function lightbox() {
    el.title.textContent = 'Lightbox';
    const closeButton = document.getElementById('close-lightbox');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            closeButton.parentElement?.remove();
        });
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const lightboxElement = document.querySelector('el-lightbox');
            lightboxElement?.remove();
        }
    });
    const lightboxElement = document.querySelector('el-lightbox');
    if (lightboxElement) {
        lightboxElement.addEventListener('click', (event) => {
            if (event.target === lightboxElement) {
                lightboxElement.remove();
            }
        });
    }
}