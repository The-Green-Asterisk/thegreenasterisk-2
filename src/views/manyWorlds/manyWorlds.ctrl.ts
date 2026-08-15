import el from '@elements';
import { Category, World, WorldEntity } from '@entities';
import Helpers from "@services/helpers";
import { getData, postData } from '@services/request';
import categoryCtrl from './category.ctrl';
import categoryTemplate from './category.template';
import worldCtrl from './world.ctrl';
import worldTemplate from './world.template';
import worldEntityCtrl from './worldEntity.ctrl';
import worldEntityTemplate from './worldEntity.template';

const html = Helpers.html;

export default async function manyWorlds(pathParams: Record<string, number>) {
    const { world: worldId, category: categoryId, entity: entityId } = pathParams;

    el.title.textContent = 'Many Worlds';
    const contentSection = el.sections[0];
    const tabsContainer = el.divs.id('tabs-container')!;
    const worlds = await getData<World[]>('/get-worlds');

    const defaultContent = html`
        <div id="world-content">
            <div id="world-description">
                <p>Welcome to the Many Worlds app! Select a world tab above to view details about that world and the elements within it.</p>
            </div>
        </div>
    `;

    // --- Organization / Helper Functions ---

    const overrideTab = (worldId?: number) => {
        tabsContainer.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        if (worldId) {
            const world = worlds.find(w => w.id === worldId);
            if (world) {
                const activeTab = Array.from(tabsContainer.children).find(t => t.textContent === world.name);
                activeTab?.classList.add('active');
            }
        }
    };

    const renderWorld = (world: World) => {
        overrideTab(world.id);
        const currentContent = el.divs.id('world-content');
        if (currentContent) contentSection.replaceChild(worldTemplate(world), currentContent);
        else contentSection.appendChild(worldTemplate(world));

        worldCtrl(world);
        el.title.textContent = `Many Worlds: ${world.name}`;
    };

    const buildTabs = () => {
        worlds.forEach(world => {
            const tab = html`<button class="tab">${world.name}</button>`;
            tab.addEventListener('click', () => {
                history.pushState({ world }, '', `/many-worlds/world/${world.id}`);
                renderWorld(world);
            }, { signal: el.signal });

            tab.classList.toggle('active', world.id === worldId);
            tabsContainer.appendChild(tab);
        });
    };

    const setupAdmin = () => {
        el.checkAdmin(() => {
            tabsContainer.appendChild(
                html`<button id="new-world" class="tab"><i class="fas fa-plus"></i></button>`
            );

            el.buttons.id('new-world')!.addEventListener('click', async () => {
                const worldName = prompt('Enter new world name:')?.trim().stripScripts();
                if (!worldName) return;

                try {
                    const newWorld = new World(worldName, '');
                    const response = await postData<World>('/create-world', newWorld);
                    worlds.push(response);

                    const newTab = html`<button class="tab">${response.name}</button>`;
                    newTab.addEventListener('click', () => {
                        history.pushState({ world: response }, '', `/many-worlds/world/${response.id}`);
                        renderWorld(response);
                    }, { signal: el.signal });

                    tabsContainer.insertBefore(newTab, el.buttons.id('new-world')!);
                    newTab.click(); // Automatically switch to new tab
                } catch (error: any) {
                    alert('Error creating world: ' + error.message);
                }
            }, { signal: el.signal });
        });
    };

    const renderInitialContent = async () => {
        if (entityId && categoryId && worldId) {
            const entity = await getData<WorldEntity>('/get-world-entity', { entityId, categoryId, worldId });
            const category = await getData<Category>('/get-category', { categoryId, worldId });
            const world = worlds.find(w => w.id === worldId);

            if (entity && category && world) {
                contentSection.appendChild(worldEntityTemplate(entity, category, world));
                worldEntityCtrl(entity, category, world);
                history.replaceState({ world }, '', `/many-worlds/world/${worldId}/category/${categoryId}/entity/${entityId}`);
                return;
            }
        }

        if (categoryId && worldId) {
            const category = await getData<Category>('/get-category', { categoryId, worldId });
            const world = worlds.find(w => w.id === worldId);

            if (category && world) {
                contentSection.appendChild(categoryTemplate(category, world));
                categoryCtrl(category, world);
                history.replaceState({ world }, '', `/many-worlds/world/${worldId}/category/${categoryId}`);
                return;
            }
        }

        if (worldId) {
            const world = worlds.find(w => w.id === worldId);
            if (world) {
                contentSection.appendChild(worldTemplate(world));
                worldCtrl(world);
                history.replaceState({ world }, '', `/many-worlds/world/${worldId}`);
                return;
            }
        }

        // Default Fallback
        contentSection.appendChild(defaultContent);
        history.replaceState({}, '', `/many-worlds`);
    };

    const setupHistorySync = () => {
        window.addEventListener('popstate', event => {
            const activeWorld: World | undefined = event.state?.world;
            if (activeWorld) {
                renderWorld(activeWorld);
            } else {
                overrideTab(); // clear active tab visual
                contentSection.replaceChild(defaultContent, el.divs.id('world-content')!);
            }
        }, { signal: el.signal });
    };

    // --- Execution ---
    buildTabs();
    setupAdmin();
    await renderInitialContent();
    setupHistorySync();
}