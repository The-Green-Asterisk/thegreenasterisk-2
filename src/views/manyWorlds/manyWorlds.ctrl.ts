import el, { html } from '@elements';
import { World } from '@entities';
import { get, post } from '@services/request';
import categoryCtrl from './category.ctrl';
import categoryTemplate from './category.template';
import worldCtrl from './world.ctrl';
import worldTemplate from './world.template';
import worldEntityCtrl from './worldEntity.ctrl';
import worldEntityTemplate from './worldEntity.template';

export default async function manyWorlds(pathParams: Record<string, number>) {
    const { world, category, entity } = pathParams;
    let worldId = world;
    let categoryId = category;
    let entityId = entity;

    el.title.textContent = 'Many Worlds';
    const contentSection = el.sections[0];

    const worlds = await get<World[]>('/data/get-worlds')
    
    const tabsContainer = el.divs.id('tabs-container');
    worlds.forEach(world => {
        const tab = html`<button class="tab">${world.name}</button>`;
        tab.onclick = () => {
            tabsContainer.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            tab.classList.add('active');
            history.pushState({ world: world }, '', `/many-worlds/world/${world.id}`);
            contentSection.replaceChild(worldTemplate(world), el.divs.id('world-content'));
            worldCtrl(world);
            el.title.textContent = `Many Worlds: ${world.name}`;
        };
        tab.classList.toggle('active', world.id === worldId);
        tabsContainer.appendChild(tab);
    });
    if (el.currentUser?.isAdmin) {
        tabsContainer.appendChild(html`
            <button id="new-world" class="tab"><i class="fas fa-plus"></i></button>
        `);
        el.buttons.id('new-world').onclick = () => {
            const worldName = prompt('Enter new world name:')?.trim();
            if (worldName) {
                const newWorld = new World(worldName, '');
                post<World>('/data/create-world', newWorld).then(response => {
                    worlds.push(response);
                    const newTab = html`<button class="tab">${response.name}</button>`;
                    newTab.onclick = () => {
                        tabsContainer.querySelectorAll('.tab').forEach(tab => {
                            tab.classList.remove('active');
                        });
                        newTab.classList.add('active');
                        history.pushState({ world: response }, '', `/many-worlds/world/${response.id}`);
                        contentSection.replaceChild(worldTemplate(response), el.divs.id('world-content'));
                        worldCtrl(response);
                        tabsContainer.insertBefore(newTab, el.buttons.id('new-world'));
                        newTab.click();
                    };
                }).catch(error => {
                    alert('Error creating world: ' + error.message);
                });
            }
        };
    }

    const defaultContent = html`
        <div id="world-content">
            <div id="world-description">
                <p>
                    Select a world tab to view more information about that world, including its characters, locations, items, and key events.
                </p>
            </div>
        </div>
    `;

    if (entityId && categoryId && worldId) {
        contentSection.appendChild(worldEntityTemplate());
        worldEntityCtrl(entityId, categoryId, worldId);
        history.replaceState({ world: worlds.find(w => w.id === worldId) }, '', `/many-worlds/world/${worldId}/category/${categoryId}/entity/${entityId}`);
    } else if (categoryId && worldId) {
        contentSection.appendChild(categoryTemplate());
        categoryCtrl(categoryId, worldId);
        history.replaceState({ world: worlds.find(w => w.id === worldId) }, '', `/many-worlds/world/${worldId}/category/${categoryId}`);
    } else if (worldId) {
        contentSection.appendChild(worldTemplate(worlds.find(w => w.id === worldId)!));
        worldCtrl(worlds.find(w => w.id === worldId)!);
        history.replaceState({ world: worlds.find(w => w.id === worldId) }, '', `/many-worlds/world/${worldId}`);
    } else {
        contentSection.appendChild(defaultContent);
        history.replaceState({}, '', `/many-worlds`);
    }

    window.addEventListener('popstate', event => {
        tabsContainer.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeWorld: World | undefined = event.state?.world;
        const activeTab = Array.from(tabsContainer.children)
            .find(tab => tab.textContent === worlds.find(w => w.id === activeWorld?.id)?.name);
        if (activeTab && activeWorld) {
            activeTab.classList.add('active');
            contentSection.replaceChild(worldTemplate(activeWorld), el.divs.id('world-content'));
            worldCtrl(activeWorld);
        } else {
            contentSection.replaceChild(defaultContent, el.divs.id('world-content'));
        }
    });
}