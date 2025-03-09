export default class Helpers {
    static centerSection(section: HTMLElement) {
        // this is to compensate for some weird css flex behavior
        const parent = section.parentElement;
        if (!parent) return;
        const rect = section.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        const distance = rect.bottom - parentRect.bottom;
        const screenWidth = window.innerWidth;
        if (distance < 0 && screenWidth > 768) {
            section.classList.remove('flex-align-center');
        } else {
            section.classList.add('flex-align-center');
        }
    }
}