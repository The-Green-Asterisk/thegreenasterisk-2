import { CharacterData } from "../characterData";

export function renderHeroSection(data: CharacterData): string {
    const classText = data.classes
        .map(c => `<strong>${c.name} ${c.level}</strong>${c.subclass ? ` (${c.subclass})` : ''}`)
        .join(' / ');

    return `
        <section class="sheet-hero">
            <div class="sheet-identity">
                <div class="avatar-wrap">
                    <img src="${data.avatarUrl}" alt="${data.name}" class="character-avatar" />
                    <span class="level-pill">LVL ${data.level}</span>
                </div>
                <div class="identity-info">
                    <div class="title-row">
                        <h1 class="character-name">${data.name}</h1>
                        <div class="inspiration-badge ${data.vitals.heroicInspiration ? 'active' : ''}" id="inspiration-toggle" title="Heroic Inspiration (Click to toggle)">
                            <i class="fa-solid fa-star"></i>
                            <span>Heroic Inspiration</span>
                        </div>
                    </div>
                    <p class="character-classes">
                        ${classText}
                    </p>
                    <div class="character-tags">
                        <span class="tag"><i class="fa-solid fa-dna"></i> ${data.race}</span>
                        <span class="tag"><i class="fa-solid fa-masks-theater"></i> ${data.background}</span>
                        <span class="tag"><i class="fa-solid fa-scale-balanced"></i> ${data.alignment}</span>
                        <a href="${data.dndBeyondUrl}" target="_blank" rel="noopener noreferrer" class="tag tag-link">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> D&D Beyond
                        </a>
                    </div>
                </div>
            </div>
        </section>
    `;
}
