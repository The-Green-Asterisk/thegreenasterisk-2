import { CharacterData } from "../characterData";

/** Escapes text the player wrote (D&D Beyond notes, traits) for HTML; keeps their line breaks. */
export function escapeText(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\r?\n/g, "<br>");
}

const DETAIL_LABELS: Array<[keyof NonNullable<CharacterData["details"]>, string]> = [
    ["gender", "Gender"], ["age", "Age"], ["height", "Height"], ["weight", "Weight"], ["hair", "Hair"], ["eyes", "Eyes"],
    ["skin", "Skin"], ["faith", "Faith"], ["lifestyle", "Lifestyle"], ["experiencePoints", "Experience Points"]
];

const PERSONALITY_LABELS: Array<[keyof NonNullable<CharacterData["notes"]>, string]> = [
    ["personalityTraits", "Personality Traits"], ["ideals", "Ideals"], ["bonds", "Bonds"], ["flaws", "Flaws"], ["appearance", "Appearance"]
];

const NOTE_LABELS: Array<[keyof NonNullable<CharacterData["notes"]>, string]> = [
    ["backstory", "Backstory"], ["allies", "Allies"], ["organizations", "Organizations"], ["enemies", "Enemies"],
    ["personalPossessions", "Personal Possessions"], ["otherHoldings", "Other Holdings"], ["otherNotes", "Other Notes"]
];

export const COINS: Array<{ key: "pp" | "gp" | "ep" | "sp" | "cp"; label: string }> = [
    { key: "pp", label: "Platinum (pp)" },
    { key: "gp", label: "Gold (gp)" },
    { key: "ep", label: "Electrum (ep)" },
    { key: "sp", label: "Silver (sp)" },
    { key: "cp", label: "Copper (cp)" }
];

function textBlocks(entries: Array<[string, string | undefined]>, emptyText: string): string {
    const filled = entries.filter(([, v]) => v && String(v).trim());
    if (filled.length === 0) return `<p class="details-empty">${emptyText}</p>`;
    return filled.map(([label, v]) => `
        <div class="details-text-block">
            <h5>${label}</h5>
            <p>${escapeText(v)}</p>
        </div>`).join("");
}

/**
 * The Details & Notes tab: character details, personality, notes, currency (editable, it changes in play), and
 * companions. Campaign information isn't shown.
 */
export function renderDetailsAndNotes(data: CharacterData): string {
    const details = data.details || {};
    const notes = data.notes || {};
    const currency = data.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    const detailRows = DETAIL_LABELS
        .filter(([k]) => details[k] !== undefined && String(details[k]).trim() !== "")
        .map(([k, label]) => `<div class="details-fact"><dt>${label}</dt><dd>${escapeText(k === "experiencePoints" ? Number(details[k]).toLocaleString() : details[k])}</dd></div>`)
        .join("");

    const companions = (data.companions || []).map((c) => `
        <li class="companion-card">
            <h5>${escapeText(c.name)}${c.type && c.type !== c.name ? ` <span class="companion-type">(${escapeText(c.type)})</span>` : ""}</h5>
            <dl class="companion-stats">
                ${c.armorClass !== undefined ? `<div><dt>AC</dt><dd>${c.armorClass}</dd></div>` : ""}
                ${c.maxHp !== undefined ? `<div><dt>HP</dt><dd>${c.currentHp ?? c.maxHp} / ${c.maxHp}</dd></div>` : ""}
            </dl>
            ${c.notes ? `<p>${escapeText(c.notes)}</p>` : ""}
        </li>`).join("");

    return `
        <div class="details-notes-container">
            <section class="sense-card details-section" aria-labelledby="details-heading">
                <h4 id="details-heading"><i class="fa-solid fa-id-card" aria-hidden="true"></i> Character Details</h4>
                ${detailRows ? `<dl class="details-facts">${detailRows}</dl>` : `<p class="details-empty">No details recorded.</p>`}
            </section>

            <section class="sense-card details-section" aria-labelledby="currency-heading">
                <h4 id="currency-heading"><i class="fa-solid fa-coins" aria-hidden="true"></i> Currency</h4>
                <div class="currency-grid">
                    ${COINS.map((coin) => `
                        <div class="currency-field">
                            <label for="currency-${coin.key}">${coin.label}</label>
                            <input type="number" id="currency-${coin.key}" class="currency-input" data-coin="${coin.key}" min="0" step="1" inputmode="numeric" value="${Math.max(0, Number(currency[coin.key]) || 0)}">
                        </div>`).join("")}
                </div>
            </section>

            <section class="sense-card details-section" aria-labelledby="personality-heading">
                <h4 id="personality-heading"><i class="fa-solid fa-masks-theater" aria-hidden="true"></i> Personality</h4>
                ${textBlocks(PERSONALITY_LABELS.map(([k, l]) => [l, notes[k]]), "No personality recorded.")}
            </section>

            <section class="sense-card details-section" aria-labelledby="notes-heading">
                <h4 id="notes-heading"><i class="fa-solid fa-book-open" aria-hidden="true"></i> Backstory & Notes</h4>
                ${textBlocks(NOTE_LABELS.map(([k, l]) => [l, notes[k]]), "No notes recorded.")}
            </section>

            ${companions ? `
                <section class="sense-card details-section" aria-labelledby="companions-heading">
                    <h4 id="companions-heading"><i class="fa-solid fa-paw" aria-hidden="true"></i> Companions</h4>
                    <ul class="companion-list">${companions}</ul>
                </section>` : ""}
        </div>`;
}
