import { CharacterData } from "../characterData";

export function renderFeatures(data: CharacterData): string {
    return data.features
        .map((f, fIdx) => {
            const decisionsHtml =
                Array.isArray(f.decisions) && f.decisions.length > 0
                    ? `
                <div class="feature-decisions" aria-label="${f.name} Choices">
                    ${f.decisions
                        .map((dec, dIdx) => {
                            const selectId = `feature-decision-${fIdx}-${dIdx}`;
                            return `
                        <div class="feature-decision-row">
                            <label class="feature-decision-label" for="${selectId}">
                                <i class="fa-solid fa-sliders"></i> ${dec.label}
                            </label>
                            <select
                                class="feature-decision-select"
                                id="${selectId}"
                                data-feature-decision-id="${dec.id}"
                                data-feature-name="${encodeURIComponent(f.name)}"
                                aria-label="${f.name} — ${dec.label}"
                            >
                                ${dec.options
                                    .map(
                                        opt => `
                                    <option value="${opt.value}" ${opt.value === dec.selectedValue ? "selected" : ""}>
                                        ${opt.label}
                                    </option>
                                `
                                    )
                                    .join("")}
                            </select>
                        </div>
                    `;
                        })
                        .join("")}
                </div>
            `
                    : "";

            return `
            <div class="feature-card ${f.decisions?.length ? "has-decisions" : ""}">
                <div class="feature-top">
                    <h4 class="feature-name">${f.name}</h4>
                    <span class="feature-badge ${f.type.toLowerCase()}">${f.source}</span>
                </div>
                ${decisionsHtml}
                <div class="feature-desc">${f.description}</div>
            </div>
        `;
        })
        .join("");
}
