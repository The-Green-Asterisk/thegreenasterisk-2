import { World } from "@entities";
import { html } from "@services/elements";

const worldTemplate = (world: World) => html`
    <div id="world-content">
        <div id="world-description">
            <p>
                ${world.description || 'No description available for this world.'}
            </p>
        </div>
        <div id="world-categories">
            <p id="no-categories">No categories available for this world.</p>
        </div>
    </div>
`;

export default worldTemplate;