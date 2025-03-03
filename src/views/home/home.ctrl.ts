import el from '@services/elements';
import Helpers from '@services/helpers';

export default function home() {
    el.title.textContent = 'Welcome to Elemental!';

    const section = el.sections ? el.sections[0] : null;
    if (section) {
        Helpers.centerSection(section);
        window.addEventListener('resize', () => Helpers.centerSection(section));
    }
}