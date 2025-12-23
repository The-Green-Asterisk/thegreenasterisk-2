import el, { html } from "@elements";
import { Category, Comment, World } from "@entities";
import { get, post, put } from "@services/request";
import commentSection from "@views/commentSection/commentSection.ctrl";

export default async function world(world: World) {
    el.title.textContent = `Many Worlds: ${world.name}`;
    const commentSect = commentSection('world', world.id);

    if (el.currentUser?.isAdmin) {
        const editDescriptionBtn = html`<i class="fas fa-pencil edit-world-description" title="Edit Description"></i>`;
        editDescriptionBtn.onclick = () => {
            const newDescription = prompt('Enter new world description:', world.description) || world.description;
            if (!!newDescription && newDescription !== world.description) {
                world.description = newDescription.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
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

    const categories = await get<Category[]>('/data/get-categories', { worldId: world.id });
    const categoriesContainer = el.divs.id('world-categories');
    
    if (categories?.length > 0) {
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryDiv = html`
                <div class="category-container">
                    <a href="/many-worlds/world/${world.id}/category/${category.id}"><h2>${category.name}</h2></a>
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

    if (el.currentUser?.isAdmin) {
        const addCategoryBtn = html`<button id="add-category-btn">Add Category</button>`;
        addCategoryBtn.onclick = () => {
            const categoryName = prompt('Enter new category name:')?.trim().replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
            if (categoryName) {
                const newCategory = new Category(categoryName, '', [world]);
                post<Category>('/data/create-category', newCategory).then(response => {
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
        };
        categoriesContainer.appendChild(addCategoryBtn);
    }
}