import { CharacterData } from "../characterData";

export function renderSpellSlotsAndResources(data: CharacterData): string {
    const slotTrackers: string[] = [];

    for (let lvl = 1; lvl <= 9; lvl++) {
        const slot = data.spellSlots[`level${lvl}`];
        if (slot && slot.total > 0) {
            const pips = Array.from({ length: slot.total })
                .map((_, i) => `<button class="pip active" data-pip-lvl="${lvl}" data-pip-idx="${i}" aria-label="Level ${lvl} slot ${i + 1}"></button>`)
                .join('');
            slotTrackers.push(`
                <div class="slot-tracker" data-slot-level="${lvl}">
                    <div class="slot-header">
                        <span class="slot-name">${slot.label || `Level ${lvl}`}</span>
                        <span class="slot-count" id="count-lvl-${lvl}">${slot.total} / ${slot.total}</span>
                    </div>
                    <div class="slot-pips" id="pips-lvl-${lvl}">
                        ${pips}
                    </div>
                </div>
            `);
        }
    }

    if (data.spellSlots.pact && data.spellSlots.pact.total > 0) {
        const pact = data.spellSlots.pact;
        const pips = Array.from({ length: pact.total })
            .map((_, i) => `<button class="pip active pact-pip" data-pip-lvl="pact" data-pip-idx="${i}" aria-label="Pact slot ${i + 1}"></button>`)
            .join('');
        slotTrackers.push(`
            <div class="slot-tracker pact-magic" data-slot-level="pact">
                <div class="slot-header">
                    <span class="slot-name">${pact.label || 'Pact Magic'}</span>
                    <span class="slot-count" id="count-lvl-pact">${pact.total} / ${pact.total}</span>
                </div>
                <div class="slot-pips" id="pips-lvl-pact">
                    ${pips}
                </div>
            </div>
        `);
    }

    const resources = data.classResources && data.classResources.length > 0
        ? data.classResources
        : (data.bardicCount ? [{
            name: "Bardic Inspiration (d8)",
            total: data.bardicCount,
            resetOn: "short" as const,
            dieOrType: "d8",
            key: "bardic"
        }] : []);

    resources.forEach((res, resIdx) => {
        const resKey = res.key || `res-${resIdx}`;
        const isCounterOnly = res.total > 12;
        let pipsHtml = "";
        if (!isCounterOnly) {
            pipsHtml = Array.from({ length: res.total })
                .map((_, i) => `<button class="pip active bardic-pip" data-resource-key="${resKey}" data-reset-on="${res.resetOn}" data-pip-idx="${i}" aria-label="${res.name} ${i + 1}"></button>`)
                .join('');
        } else {
            pipsHtml = `<div class="resource-counter-pill"><span class="res-pool-value">${res.total} Points Available</span> <span class="res-reset-badge">Resets on ${res.resetOn} rest</span></div>`;
        }

        slotTrackers.push(`
            <div class="slot-tracker class-resource-tracker" data-resource-key="${resKey}" data-reset-on="${res.resetOn}">
                <div class="slot-header">
                    <span class="slot-name">${res.name}</span>
                    <span class="slot-count" id="count-${resKey}">${res.total} / ${res.total}</span>
                </div>
                <div class="slot-pips" id="pips-${resKey}">
                    ${pipsHtml}
                </div>
            </div>
        `);
    });

    if (slotTrackers.length === 0) {
        return `
            <div class="no-resources-note">
                <p><i class="fa-solid fa-feather"></i> This adventurer has no tracked spell slots or expendable daily resources.</p>
            </div>
        `;
    }

    return slotTrackers.join('');
}
