import { CharacterData, FeatureItem } from "../characterData";
import { escapeText } from "./details";
import { linkifyConditionAndSpellTags } from "./markupLinks";

/** Feature text longer than this (as plain text) shows an excerpt and a "Click for more details" button. */
export const FEATURE_EXCERPT_LENGTH = 320;

/** A feature's text with its placeholders filled and markup removed. */
function featurePlainText(description: string, data: CharacterData, f: FeatureItem): string {
    const html = linkifyConditionAndSpellTags(description || "", {
        character: data, entityName: f.name, sourceName: f.source, scaleValue: f.scaleValue, limitedUse: f.limitedUse
    });
    const el = typeof document !== "undefined" ? document.createElement("div") : null;
    if (el) {
        el.innerHTML = html;
        return (el.textContent || "").replace(/\s+/g, " ").trim();
    }
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** The start of the text, cut at a word boundary. */
function excerpt(text: string): string {
    const cut = text.slice(0, FEATURE_EXCERPT_LENGTH);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > FEATURE_EXCERPT_LENGTH * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, "")}…`;
}

export function renderFeatures(data: CharacterData): string {
    return (data.features || [])
        .map((f, index) => {
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

            // Long text shows a plain excerpt and a button to the full, linked text (so no hidden part holds links)
            const plain = featurePlainText(f.description, data, f);
            const isLong = plain.length > FEATURE_EXCERPT_LENGTH;
            const body = isLong
                ? `<p class="feature-desc feature-desc-excerpt">${escapeText(excerpt(plain))}</p>
                   <button type="button" class="feature-more-btn" data-feature-index="${index}" aria-haspopup="dialog" aria-label="Click for more details about ${escapeText(f.name)}">
                       <i class="fa-solid fa-expand" aria-hidden="true"></i> Click for more details
                   </button>`
                : `<div class="feature-desc">${linkifyConditionAndSpellTags(f.description, {
                    character: data,
                    entityName: f.name,
                    sourceName: f.source,
                    scaleValue: f.scaleValue,
                    limitedUse: f.limitedUse
                })}</div>`;

            return `
            <div class="feature-card">
                <div class="feature-top">
                    <h4 class="feature-name">${f.name}</h4>
                    <span class="feature-badge ${badgeClass}">${f.source}</span>
                </div>
                ${body}
            </div>
        `;
        })
        .join("");
}
