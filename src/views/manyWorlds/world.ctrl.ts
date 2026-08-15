import el from "@elements";
import { Category, World } from "@entities";
import Helpers from "@services/helpers";
import { getData, postData, putData } from "@services/request";
import commentSection from "@views/commentSection/commentSection.ctrl";

const html = Helpers.html;

export default async function world(world: World) {
    el.title.textContent = `Many Worlds: ${world.name}`;
    commentSection('world', world.id);

    const categoriesContainer = el.divs.id('world-categories')!;

    // --- Organization / Helper Functions ---

    const setupAdminDescription = () => {
        el.checkAdmin(() => {
            const editDescriptionBtn = html`<i class="fas fa-pencil edit-world-description" title="Edit Description"></i>`;
            editDescriptionBtn.addEventListener('click', () => {
                const newDescription = prompt('Enter new world description:', world.description) || world.description;
                if (!!newDescription && newDescription !== world.description) {
                    world.description = newDescription.stripScripts();
                    putData<World>('/edit-world', world).then((res) => {
                        world = res;
                        const descriptionPara = el.divs.id('world-description')!.querySelector('p')!;
                        descriptionPara.textContent = world.description || 'No description available for this world.';
                    }).catch(error => {
                        alert('Error updating world description: ' + error.message);
                    });
                }
            }, { signal: el.signal });
            el.divs.id('world-description')!.appendChild(editDescriptionBtn);
        });
    };

    const renderCategories = async () => {
        const categories = await getData<Category[]>('/get-categories', { worldId: world.id });

        if (categories?.length > 0) {
            categoriesContainer.innerHTML = '';
            categories.forEach(category => {
                const categoryDiv = html`
                    <div class="category-container">
                        <a href="/many-worlds/world/${world.id}/category/${category.id}"><h2>${category.name}</h2></a>
                        <small style="text-align: center;display: block;width: 100%;">
                            <i>random selection of ${category.worldEntities.length} entries in this category</i>
                        </small>
                        <ul class="entity-list"></ul>
                    </div>
                `;
                const entityList = categoryDiv.querySelector('.entity-list')!;
                if (category.worldEntities.length === 0) {
                    const noEntitiesMsg = html`<p>No entities available in this category.</p>`;
                    categoryDiv.replaceChild(noEntitiesMsg, entityList);
                } else {
                    category.worldEntities.forEach(entity => {
                        const entityItem = html`<li><a href="/many-worlds/world/${world.id}/category/${category.id}/entity/${entity.id}">${entity.name}</a>: ${entity.shortDescription}</li>`;
                        entityList.appendChild(entityItem);
                    });
                }
                categoriesContainer.appendChild(categoryDiv);
            });
        }
    };

    const setupAdminCategories = () => {
        el.checkAdmin(() => {
            const addCategoryBtn = html`<button id="add-category-btn">Add Category</button>`;
            addCategoryBtn.addEventListener('click', () => {
                const categoryName = prompt('Enter new category name:')?.trim().stripScripts();
                if (categoryName) {
                    const newCategory = new Category(categoryName, '', [world]);
                    postData<Category>('/create-category', newCategory).then(response => {
                        const noCatsMsg = el.paragraphs.id('no-categories');
                        if (noCatsMsg) noCatsMsg.remove();
                        const categoryDiv = html`
                            <div class="category-container">
                                <a href="/many-worlds/world/${world.id}/category/${response.id}"><h2>${response.name}</h2></a>
                                <p>No entities available in this category.</p>
                            </div>
                        `;
                        categoriesContainer.appendChild(categoryDiv);
                    }).catch(error => {
                        alert('Error creating category: ' + error.message);
                    });
                }
            }, { signal: el.signal });
            categoriesContainer.appendChild(addCategoryBtn);
        });
    };

    // --- Execution ---
    setupAdminDescription();
    await renderCategories();
    setupAdminCategories();
}