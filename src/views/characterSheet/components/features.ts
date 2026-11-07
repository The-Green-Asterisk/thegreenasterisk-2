import { CharacterData } from "../characterData";
import { linkifyConditionAndSpellTags } from "./markupLinks";

export function renderFeatures(data: CharacterData): string {
    return (data.features || [])
        .map((f) => {
            const rawType = (f.type || "Class").toLowerCase();
            const badgeClass = rawType.startsWith("subclass")
                ? "subclass"
                : rawType.startsWith("class")
                  ? "class"
                  : rawType.startsWith("feat")
                    ? "feat"
                    : rawType.startsWith("species")
                      ? "species"
                      : rawType.startsWith("invocation")
                        ? "invocation"
                        : rawType.replace(/[^a-z0-9]+/g, "-");

            return `
            <div class="feature-card">
                <div class="feature-top">
                    <h4 class="feature-name">${f.name}</h4>
                    <span class="feature-badge ${badgeClass}">${f.source}</span>
                </div>
                <div class="feature-desc">${linkifyConditionAndSpellTags(f.description, {
                    character: data,
                    entityName: f.name,
                    sourceName: f.source,
                    scaleValue: f.scaleValue,
                    limitedUse: f.limitedUse
                })}</div>
            </div>
        `;
        })
        .join("");
}
