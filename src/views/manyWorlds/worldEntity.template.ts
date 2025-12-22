import { html } from "@elements";
import { Category, World, WorldEntity } from "@entities";

const worldEntityTemplate = (entity: WorldEntity, category: Category, world: World) => html`
    <div id="world-content">
        <a style="margin-left: 10px" href="/many-worlds/world/${world.id}/category/${category.id}">&larr; Back to ${category.name}</a>
        <div id="entity-details">
            <div id="img-and-stats">
                <img src="http://picsum.photos/300" alt="Entity Thumbnail" id="entity-thumbnail"/>
                <div id="entity-stats">
                    <h3>Stats</h3>
                    <ul>
                        <li>This Entity Has No Stats</li>
                    </ul>
                </div>
            </div>
            <h2 id="entity-name">${entity.name}</h2>
            <div id="entity-description">
                <p>
                    ${entity.description || 'No description available for this entity.'}
                </p>
            </div>
            <div id="entity-segments">
            </div>
        </div>
    </div>
`;

export default worldEntityTemplate;