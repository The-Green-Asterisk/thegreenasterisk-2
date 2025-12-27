import el, { html } from "@elements";
import { Category, World, WorldEntity } from "@entities";
import { get, post } from "@services/request";
import commentSection from "@views/commentSection/commentSection.ctrl";

export default async function categoryCtrl(category: Category, world: World) {
    el.title.textContent = `Many Worlds: ${world.name} -- ${category.name}`;
    const commentSect = commentSection('category', category.id);

    const entities = await get<any[]>('/data/get-entities', { categoryId: category.id }).catch(() => []);
    const entitiesContainer = el.divs.id('category-entities')!;
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

    if (el.currentUser?.isAdmin) {
        const newEntityBtn = html`<button id="new-entity-btn">Add New ${singularize(category.name)}</button>`;
        newEntityBtn.onclick = () => {
            const entityName = prompt('Enter new entity name:')?.trim().replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
            if (entityName) {
                const newEntity = new WorldEntity(entityName, '', '', '', [world], [category]);
                post<WorldEntity>('/data/create-entity', newEntity).then(response => {
                    location.href = `/many-worlds/world/${world.id}/category/${category.id}/entity/${response.id}`;
                }).catch(error => {
                    alert('Error creating new entity: ' + error.message);
                });
            }
        };
        entitiesContainer.appendChild(newEntityBtn);
    }
}

const singularize = (word: string) => {
    const endings: { [string: string]: string } = {
      ves: 'f',
      ivies: 'ivy', // handles exceptions like 'ivies' -> 'ivy'
      ies: 'y',
      i: 'us', // Latin plurals like 'cacti' -> 'cactus'
      ea: 'eum', // Latin plurals like 'data' -> 'datum' (often treated as uncountable in modern English)
      zes: 'ze',
      ses: 's',
      es: 'e',
      s: ''
    };
  
    // Sort endings by length in descending order to match the longest suffix first
    const sortedEndings = Object.keys(endings).sort((a, b) => b.length - a.length);
  
    for (const ending of sortedEndings) {
      const regex = new RegExp(`${ending}$`);
      if (regex.test(word)) {
        // Handle 'lives' -> 'life' exception correctly with 'f'
        if (ending === 'ves' && word !== 'lives') {
            return word.replace(regex, endings[ending] + 'e'); // e.g., 'knives' -> 'knife'
        }
        return word.replace(regex, endings[ending]);
      }
    }
    return word; // return original word if no rule matches
};