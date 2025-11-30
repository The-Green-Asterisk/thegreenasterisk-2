import { html } from "@elements";
import { WorldEntity } from "@entities";

const worldEntityTemplate = (entity: WorldEntity) => html`
    <div id="world-content">
        <div id="entity-details">
            <h2 id="entity-name">${entity.name}</h2>
            <div id="entity-description">
                <p>
                    ${entity.description || 'No description available for this entity.'}
                </p>
            </div>
        </div>
        <div id="entity-segments">
        </div>
    </div>
`;

export default worldEntityTemplate;