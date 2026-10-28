import { CharacterData } from "../characterData";

export function renderFeatures(data: CharacterData): string {
    return data.features.map(f => {
        return `
            <div class="feature-card">
                <div class="feature-top">
                    <h4 class="feature-name">${f.name}</h4>
                    <span class="feature-badge ${f.type.toLowerCase()}">${f.source}</span>
                </div>
                <p class="feature-desc">${f.description}</p>
            </div>
        `;
    }).join('');
}
