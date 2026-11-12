import { escapeHtml } from "@services/escape";
import { CharacterData, DEFAULT_DND55_CONDITIONS } from "../characterData";

export function renderActiveConditionsListHtml(data: CharacterData): string {
    const rawConditions = data.trackingState?.activeConditions ?? data.activeConditions ?? [];
    const exhaustionLevel = Math.max(
        0,
        Math.min(6, Number(data.trackingState?.exhaustionLevel ?? data.exhaustionLevel ?? 0) || 0)
    );

    const normalizedActive = new Set<string>(
        rawConditions
            .map(c => String(c || "").trim())
            .filter(Boolean)
    );

    if (exhaustionLevel > 0) {
        normalizedActive.add("Exhaustion");
    } else {
        // If exhaustionLevel is 0, remove Exhaustion from active set unless explicitly kept
        Array.from(normalizedActive).forEach(c => {
            if (c.toLowerCase() === "exhaustion") {
                normalizedActive.delete(c);
            }
        });
    }

    if (normalizedActive.size === 0) {
        return `<span class="no-conditions-placeholder">None — Click to view or add</span>`;
    }

    const pills: string[] = [];

    if (exhaustionLevel > 0) {
        const d20Penalty = exhaustionLevel * 2;
        const speedPenalty = exhaustionLevel * 5;
        const tooltip =
            exhaustionLevel >= 6
                ? `Exhaustion Level 6: Death (-${d20Penalty} D20 Tests, -${speedPenalty} ft. Speed)`
                : `Exhaustion Level ${exhaustionLevel}: -${d20Penalty} to D20 Tests, -${speedPenalty} ft. Speed`;
        pills.push(`
            <span class="condition-pill condition-pill-exhaustion ${exhaustionLevel >= 6 ? 'deadly' : ''}" title="${tooltip}">
                <i class="fa-solid fa-battery-quarter"></i>
                <span>Exhaustion ${exhaustionLevel}</span>
            </span>
        `);
    }

    Array.from(normalizedActive)
        .filter(name => name.toLowerCase() !== "exhaustion")
        .sort((a, b) => a.localeCompare(b))
        .forEach(condName => {
            const def = DEFAULT_DND55_CONDITIONS.find(
                c => c.name.toLowerCase() === condName.toLowerCase() || c.slug === condName.toLowerCase()
            );
            const icon = def?.icon || "fa-solid fa-circle-exclamation";
            const displayName = def?.name || condName;
            const summary = escapeHtml(def?.summary || displayName);
            pills.push(`
                <span class="condition-pill" title="${summary}">
                    <i class="${icon}"></i>
                    <span>${displayName}</span>
                </span>
            `);
        });

    return pills.join("");
}

export function renderHeroSection(data: CharacterData): string {
    const classText = data.classes
        .map(c => `<strong>${escapeHtml(c.name)} ${c.level}</strong>${c.subclass ? ` (${c.subclass})` : ''}`)
        .join(' / ');

    const isDndBeyond = data.source === "dndbeyond";
    const nameLockBadge = isDndBeyond && data.lockedFields?.["name"]
        ? '<span class="field-locked-indicator" title="Name is locked from D&D Beyond refresh"><i class="fa-solid fa-lock"></i></span>'
        : '';
    const classLockBadge = isDndBeyond && data.lockedFields?.["classes"]
        ? '<span class="field-locked-indicator" title="Class is locked from D&D Beyond refresh"><i class="fa-solid fa-lock"></i></span>'
        : '';
    const raceLockBadge = isDndBeyond && data.lockedFields?.["race"]
        ? ' <i class="fa-solid fa-lock field-locked-indicator" title="Species is locked from D&D Beyond refresh"></i>'
        : '';
    const bgLockBadge = isDndBeyond && data.lockedFields?.["background"]
        ? ' <i class="fa-solid fa-lock field-locked-indicator" title="Background is locked from D&D Beyond refresh"></i>'
        : '';
    const alignLockBadge = isDndBeyond && data.lockedFields?.["alignment"]
        ? ' <i class="fa-solid fa-lock field-locked-indicator" title="Alignment is locked from D&D Beyond refresh"></i>'
        : '';

    const conditionsHtml = renderActiveConditionsListHtml(data);
    const hasActiveConditions = !conditionsHtml.includes("no-conditions-placeholder");

    return `
        <section class="sheet-hero">
            <div class="sheet-identity">
                <div class="avatar-wrap">
                    <img src="${data.avatarUrl}" alt="${escapeHtml(data.name)}" class="character-avatar" />
                    <span class="level-pill">LVL ${data.level}</span>
                </div>
                <div class="identity-info">
                    <div class="title-row">
                        <h1 class="character-name">${escapeHtml(data.name)}${nameLockBadge}</h1>
                        <button type="button" class="inspiration-badge ${data.vitals.heroicInspiration ? 'active' : ''}" id="inspiration-toggle" aria-pressed="${data.vitals.heroicInspiration ? 'true' : 'false'}" title="Heroic Inspiration (Click to toggle)">
                            <i class="fa-solid fa-star" aria-hidden="true"></i>
                            <span>Heroic Inspiration</span>
                        </button>
                    </div>
                    <p class="character-classes">
                        ${classText}${classLockBadge}
                    </p>
                    <div class="character-tags">
                        <span class="tag"><i class="fa-solid fa-dna"></i> ${escapeHtml(data.race)}${raceLockBadge}</span>
                        <span class="tag"><i class="fa-solid fa-masks-theater"></i> ${escapeHtml(data.background)}${bgLockBadge}</span>
                        <span class="tag"><i class="fa-solid fa-scale-balanced"></i> ${escapeHtml(data.alignment)}${alignLockBadge}</span>
                        ${isDndBeyond && data.dndBeyondUrl ? `
                            <a href="${data.dndBeyondUrl}" target="_blank" rel="noopener noreferrer" class="tag tag-link">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> D&D Beyond
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>

            <div class="active-conditions-box ${hasActiveConditions ? 'has-conditions' : ''}" id="active-conditions-box" role="button" tabindex="0" aria-label="Active Conditions (Click to open conditions and exhaustion modal)" title="Click to view D&D 5.5 conditions and manage active conditions">
                <div class="active-conditions-header">
                    <span class="active-conditions-title">
                        <i class="fa-solid fa-skull-crossbones"></i> Active Conditions
                    </span>
                    <span class="active-conditions-manage">
                        <i class="fa-solid fa-sliders"></i> Manage
                    </span>
                </div>
                <div class="active-conditions-list" id="hero-active-conditions-list">
                    ${conditionsHtml}
                </div>
            </div>
        </section>
    `;
}
