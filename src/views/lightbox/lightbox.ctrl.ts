export default function lightbox() {
    const lightboxAbort = new AbortController();

    const closeButton = document.getElementById('close-lightbox');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            closeButton.parentElement?.remove();
            lightboxAbort.abort();
        }, { signal: lightboxAbort.signal });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const lightboxElement = document.querySelector('el-lightbox');
            lightboxElement?.remove();
            lightboxAbort.abort();
        }
    }, { signal: lightboxAbort.signal });

    const lightboxElement = document.querySelector('el-lightbox');
    if (lightboxElement) {
        lightboxElement.addEventListener('click', (event) => {
            if (event.target === lightboxElement) {
                lightboxElement.remove();
                lightboxAbort.abort();
            }
        }, { signal: lightboxAbort.signal });
    }
}