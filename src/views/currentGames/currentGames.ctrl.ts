import el from '@elements';
import survivors from './survivors/survivors.ctrl';

export default function currentGames() {
    if (el.currentGames) {
        el.title.textContent = 'Current Games';
    }
    return {
        survivors
    };
}