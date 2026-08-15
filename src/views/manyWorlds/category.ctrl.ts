import el from "@elements";
import { Category, World, WorldEntity } from "@entities";
import Helpers from "@services/helpers";
import { getData, postData } from "@services/request";
import commentSection from "@views/commentSection/commentSection.ctrl";

const html = Helpers.html;

export default async function categoryCtrl(category: Category, world: World) {
    el.title.textContent = `Many Worlds: ${world.name} -- ${category.name}`;
    commentSection('category', category.id);

    const entitiesContainer = el.divs.id('category-entities')!;

    // --- Organization / Helper Functions ---

    const renderEntities = async () => {
        const entities = await getData<WorldEntity[][]>('/get-entities', { categoryId: category.id }).catch(() => Array<Array<WorldEntity>>());

        if (entities?.length > 0) {
            entitiesContainer.innerHTML = '';
            entities.forEach((letter, i) => {
                if (letter.length === 0) return;
                // find letter by the array's index
                const letterHeading = html`
                    <div class="letter-box">
                        <h3 class="entity-letter">${String.fromCharCode(65 + i)}</h3>
                        <ul></ul>
                    </div>
                `;
                entitiesContainer.appendChild(letterHeading);
                const letterBox = entitiesContainer.querySelector('.letter-box:last-child ul')!;
                letter.forEach((entity: WorldEntity) => {
                    const entityItem = html`
                        <li class="entity-list-item">
                            <a href="/many-worlds/world/${world.id}/category/${category.id}/entity/${entity.id}">
                                <span class="name">${entity.name}</span>
                            </a>
                            <p class="description">${entity.shortDescription}</p>
                        </li>
                    `;
                    letterBox.appendChild(entityItem);
                });
            });
        }
    };

    const setupAdminCreateEntity = () => {
        el.checkAdmin(() => {
            const newEntityBtn = html`<button id="new-entity-btn">Add New ${Helpers.singularize(category.name)}</button>`;
            newEntityBtn.addEventListener('click', () => {
                const entityName = prompt(`Enter new ${Helpers.singularize(category.name)} name:`)?.trim().stripScripts();
                if (entityName) {
                    const newEntity = new WorldEntity(entityName, '', '', '', [world], [category]);
                    postData<WorldEntity>('/create-entity', newEntity).then(response => {
                        location.href = `/many-worlds/world/${world.id}/category/${category.id}/entity/${response.id}`;
                    }).catch(error => {
                        alert(`Error creating new ${Helpers.singularize(category.name)}: ` + error.message);
                    });
                }
            }, { signal: el.signal });
            entitiesContainer.appendChild(newEntityBtn);
        });
    };

    // --- Execution ---
    await renderEntities();
    setupAdminCreateEntity();
}