import el, { html } from "@elements";
import { World } from "@entities";
import { put } from "@services/request";

export default function world(world: World) {
    if (el.currentUser?.isAdmin) {
        const editDescriptionBtn = html`<i class="fas fa-pen-alt edit-world-description" title="Edit Description"></i>`;
        editDescriptionBtn.onclick = () => {
            const newDescription = prompt('Enter new world description:', world.description) || world.description;
            if (!!newDescription && newDescription !== world.description) {
                world.description = newDescription;
                put<World>('/data/edit-world', world).then((res) => {
                    world = res;
                    const descriptionPara = el.divs.id('world-description').querySelector('p')!;
                    descriptionPara.textContent = world.description || 'No description available for this world.';
                }).catch(error => {
                    alert('Error updating world description: ' + error.message);
                });
            }
        };
        el.divs.id('world-description').appendChild(editDescriptionBtn);
    }
}