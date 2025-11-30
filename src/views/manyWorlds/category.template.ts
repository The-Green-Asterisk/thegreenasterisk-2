import { html } from "@elements";
import { Category } from "@entities";

const categoryTemplate = (category: Category) => html`
    <div id="world-content">
        <h2 id="category-title">${category.name}</h2>
        <div id="category-entities">
            <p id="no-entities">No entities available for this category.</p>
        </div>
    </div>
`;

export default categoryTemplate;