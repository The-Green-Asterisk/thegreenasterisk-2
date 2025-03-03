import el from '@services/elements';
import Helpers from '@services/helpers';

export default function about() {
    el.title.textContent = 'About Elemental';
    
    const section = el.sections ? el.sections[0] : null;
    if (section) {
        Helpers.centerSection(section);
        window.addEventListener('resize', () => Helpers.centerSection(section));
    }
}