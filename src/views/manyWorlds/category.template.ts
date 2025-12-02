import { html } from "@elements";
import { Category, World } from "@entities";

const categoryTemplate = (category: Category, world: World) => html`
    <div id="world-content">
        <a style="margin-left: 10px" href="/many-worlds/world/${world.id}">&larr; Back to World</a>
        <h2 id="category-title">${category.name}</h2>
        <div id="category-entities">
            <p id="no-entities">No entities available for this category.</p>
        </div>
    </div>
`;

export default categoryTemplate;