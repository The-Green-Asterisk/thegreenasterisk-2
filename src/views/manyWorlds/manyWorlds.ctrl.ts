import el, { html } from '@elements';
import { World } from '@entities';
import worldTemplate from './world.template';

export default function manyWorlds(pathParams: Record<string, string>) {
    const { world } = pathParams;
    let worldId = Number(world);
    el.title.textContent = 'Many Worlds';
    const contentSection = el.sections[0];

    const worlds = [
        new World(
            'Cronus',
            '',
        ),
        new World(
            'Elysium',
            '',
        ),
        new World(
            'The Abyss',
            '',
        )
    ];
    worlds.forEach((world, index) => {
        world.id = index + 1;
    });
    
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
        };
        tab.classList.toggle('active', world.id === worldId);
        tabsContainer.appendChild(tab);
    });
    if (el.currentUser?.isAdmin) {
        tabsContainer.appendChild(html`
            <button id="new-world" class="tab"><i class="fas fa-plus"></i></button>
        `);
        el.buttons.id('new-world').onclick = () => {
            alert('Feature coming soon!');
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
    contentSection.appendChild(worldId ? worldTemplate(worlds.find(w => w.id === worldId)!) : defaultContent);
    
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
        } else {
            contentSection.replaceChild(defaultContent, el.divs.id('world-content'));
        }
    });
}