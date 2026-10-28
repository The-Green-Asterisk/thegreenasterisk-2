import { CharacterData } from "../characterData";


interface BadgeSvgConfig {
    id: string;
    viewBox?: string;
    outerPath: string;
    innerPath?: string;
    strokeGradient?: [string, string, string];
    fillGradient?: [string, string, string];
    innerStrokeColor?: string;
}

function renderBadgeSvg(config: BadgeSvgConfig): string {
    const viewBox = config.viewBox || "0 0 100 120";
    const bgGradId = `svg-grad-${config.id}-bg`;
    const strokeGradId = `svg-grad-${config.id}-stroke`;

    // Using CSS custom properties var(--badge-*-0/1/2) set per theme ensures
    // instant, theme-responsive contrast without recreating DOM nodes.
    const fill0 = config.fillGradient ? config.fillGradient[0] : `var(--badge-${config.id}-fill-0)`;
    const fill1 = config.fillGradient ? config.fillGradient[1] : `var(--badge-${config.id}-fill-1)`;
    const fill2 = config.fillGradient ? config.fillGradient[2] : `var(--badge-${config.id}-fill-2)`;

    const stroke0 = config.strokeGradient ? config.strokeGradient[0] : `var(--badge-${config.id}-stroke-0)`;
    const stroke1 = config.strokeGradient ? config.strokeGradient[1] : `var(--badge-${config.id}-stroke-1)`;
    const stroke2 = config.strokeGradient ? config.strokeGradient[2] : `var(--badge-${config.id}-stroke-2)`;

    const innerStroke = config.innerStrokeColor || `var(--badge-${config.id}-inner-stroke, var(--badge-${config.id}-stroke-1))`;

    return `
        <svg class="vital-badge-svg" viewBox="${viewBox}" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${fill0}" />
                    <stop offset="55%" stop-color="${fill1}" />
                    <stop offset="100%" stop-color="${fill2}" />
                </linearGradient>
                <linearGradient id="${strokeGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${stroke0}" />
                    <stop offset="50%" stop-color="${stroke1}" />
                    <stop offset="100%" stop-color="${stroke2}" />
                </linearGradient>
            </defs>
            <path class="vital-svg-fill" d="${config.outerPath}" fill="url(#${bgGradId})" />
            ${config.innerPath ? `<path class="vital-svg-inner" d="${config.innerPath}" fill="none" stroke="${innerStroke}" stroke-width="1" vector-effect="non-scaling-stroke" />` : ''}
            <path class="vital-svg-stroke" d="${config.outerPath}" fill="none" stroke="url(#${strokeGradId})" stroke-width="2.2" vector-effect="non-scaling-stroke" />
        </svg>
    `;
}

function formatSense(val?: string): string {
    if (!val || val === "None" || val === "none" || val === "—") return "—";
    return val;
}

export function renderVitalsSection(data: CharacterData): string {
    const acSvg = renderBadgeSvg({
        id: "ac",
        outerPath: "M 50,3 C 78,3 96,3 96,18 C 96,72 74,104 50,117 C 26,104 4,72 4,18 C 4,3 22,3 50,3 Z",
        innerPath: "M 50,9 C 74,9 90,9 90,21 C 90,67 71,97 50,109 C 29,97 10,67 10,21 C 10,9 26,9 50,9 Z"
    });

    const initSvg = renderBadgeSvg({
        id: "init",
        outerPath: "M 50,3 L 96,22 L 96,98 L 50,117 L 4,98 L 4,22 Z",
        innerPath: "M 50,9 L 90,25 L 90,93 L 50,110 L 10,93 L 10,25 Z"
    });

    const speedSvg = renderBadgeSvg({
        id: "speed",
        outerPath: "M 8,6 C 50,12 50,12 92,6 C 98,22 96,70 50,117 C 4,70 2,22 8,6 Z",
        innerPath: "M 14,12 C 50,17 50,17 86,12 C 91,25 89,66 50,109 C 11,66 9,25 14,12 Z"
    });

    const dcSvg = renderBadgeSvg({
        id: "dc",
        outerPath: "M 6,117 L 6,44 C 6,14 26,3 50,3 C 74,3 94,14 94,44 L 94,117 Z",
        innerPath: "M 12,112 L 12,45 C 12,19 29,9 50,9 C 71,9 88,19 88,45 L 88,112 Z"
    });

    const attackSvg = renderBadgeSvg({
        id: "attack",
        outerPath: "M 26,3 L 74,3 L 97,26 L 97,94 L 74,117 L 26,117 L 3,94 L 3,26 Z",
        innerPath: "M 28,8 L 72,8 L 92,28 L 92,92 L 72,112 L 28,112 L 8,92 L 8,28 Z"
    });

    const profSvg = renderBadgeSvg({
        id: "prof",
        outerPath: "M 14,3 L 86,3 C 94,3 97,8 97,20 L 97,117 L 50,103 L 3,117 L 3,20 C 3,8 6,3 14,3 Z",
        innerPath: "M 16,8 L 84,8 C 90,8 92,12 92,22 L 92,108 L 50,96 L 8,108 L 8,22 C 8,12 10,8 16,8 Z"
    });

    const passiveEyeSvg = (id: string) => renderBadgeSvg({
        id,
        outerPath: "M 3,60 C 22,12 78,12 97,60 C 78,108 22,108 3,60 Z",
        innerPath: "M 9,60 C 26,19 74,19 91,60 C 74,101 26,101 9,60 Z"
    });

    const sensesSvg = renderBadgeSvg({
        id: "senses",
        outerPath: "M 3,16 L 16,3 L 84,3 L 97,16 L 97,104 L 84,117 L 16,117 L 3,104 Z",
        innerPath: "M 7,18 L 18,7 L 82,7 L 93,18 L 93,102 L 82,113 L 18,113 L 7,102 Z"
    });

    const hpSvg = renderBadgeSvg({
        id: "hp",
        viewBox: "0 0 200 100",
        outerPath: "M 3,14 L 14,3 L 186,3 L 197,14 L 197,86 L 186,97 L 14,97 L 3,86 Z",
        innerPath: "M 7,16 L 16,7 L 184,7 L 193,16 L 193,84 L 184,93 L 16,93 L 7,84 Z"
    });

    return `
        <div class="vitals-grid">
            <div class="vital-card vital-hp">
                ${hpSvg}
                <div class="vital-card-inner">
                    <div class="vital-header">
                        <span class="vital-title"><i class="fa-solid fa-heart-pulse"></i> HIT POINTS</span>
                        <span class="vital-sub" id="hp-ratio">${data.vitals.currentHp} / ${data.vitals.maxHp} Max</span>
                    </div>
                    <div class="hp-gauge">
                        <div class="hp-bar-fill" id="hp-bar-fill" style="width: ${Math.round((data.vitals.currentHp / data.vitals.maxHp) * 100)}%;"></div>
                    </div>
                    <div class="hp-controls">
                        <button class="hp-btn" data-hp-delta="-5">-5</button>
                        <button class="hp-btn" data-hp-delta="-1">-1</button>
                        <div class="hp-input-cluster">
                            <label class="hp-input-wrap" title="Current hit points">
                                <span class="hp-input-label">HP</span>
                                <input id="hp-display" class="hp-value-input hp-current-input" type="number" min="0" max="${data.vitals.maxHp}" step="1" value="${data.vitals.currentHp}" aria-label="Current hit points" />
                            </label>
                            <label class="hp-input-wrap" title="Temporary hit points">
                                <span class="hp-input-label">Temp</span>
                                <input id="temp-hp-display" class="hp-value-input temp-hp-input" type="number" min="0" step="1" value="${data.vitals.tempHp ?? 0}" aria-label="Temporary hit points" />
                            </label>
                        </div>
                        <button class="hp-btn" data-hp-delta="1">+1</button>
                        <button class="hp-btn" data-hp-delta="5">+5</button>
                    </div>
                    <div class="vital-footer-note">Hit Dice: ${data.vitals.hitDice}</div>
                </div>
            </div>

            <div class="vital-card vital-ac">
                ${acSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-shield-halved"></i></div>
                    <div class="vital-val">${data.vitals.armorClass}</div>
                    <div class="vital-label">ARMOR CLASS</div>
                    <div class="vital-subnote">Armor & DEX</div>
                </div>
            </div>

            <div class="vital-card vital-init">
                ${initSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-bolt"></i></div>
                    <div class="vital-val">${data.vitals.initiative >= 0 ? `+${data.vitals.initiative}` : data.vitals.initiative}</div>
                    <div class="vital-label">INITIATIVE</div>
                    <div class="vital-subnote">DEX Modifier</div>
                </div>
            </div>

            <div class="vital-card vital-speed">
                ${speedSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-person-running"></i></div>
                    <div class="vital-val">${data.vitals.speed}</div>
                    <div class="vital-label">WALKING SPEED</div>
                    <div class="vital-subnote">Base Speed</div>
                </div>
            </div>

            <div class="vital-card vital-dc">
                ${dcSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                    <div class="vital-val">${data.vitals.spellSaveDc}</div>
                    <div class="vital-label">SPELL SAVE DC</div>
                    <div class="vital-subnote"><span class="vital-ability-pill">${data.vitals.spellcastingAbility}</span></div>
                </div>
            </div>

            <div class="vital-card vital-attack">
                ${attackSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-crosshairs"></i></div>
                    <div class="vital-val">+${data.vitals.spellAttackBonus}</div>
                    <div class="vital-label">SPELL ATTACK</div>
                    <div class="vital-subnote">Prof + Ability</div>
                </div>
            </div>

            <div class="vital-card vital-prof">
                ${profSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-award"></i></div>
                    <div class="vital-val">+${data.vitals.proficiencyBonus}</div>
                    <div class="vital-label">PROFICIENCY</div>
                    <div class="vital-subnote">Level ${data.level} Tier</div>
                </div>
            </div>

            <div class="vital-card vital-passive-perception">
                ${passiveEyeSvg("perc")}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-eye"></i></div>
                    <div class="vital-val">${data.vitals.passivePerception}</div>
                    <div class="vital-label">PASSIVE PERCEPTION</div>
                    <div class="vital-subnote">Awareness</div>
                </div>
            </div>

            <div class="vital-card vital-passive-investigation">
                ${passiveEyeSvg("inv")}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <div class="vital-val">${data.vitals.passiveInvestigation}</div>
                    <div class="vital-label">PASSIVE INVESTIGATION</div>
                    <div class="vital-subnote">Clues & details</div>
                </div>
            </div>

            <div class="vital-card vital-passive-insight">
                ${passiveEyeSvg("ins")}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-brain"></i></div>
                    <div class="vital-val">${data.vitals.passiveInsight}</div>
                    <div class="vital-label">PASSIVE INSIGHT</div>
                    <div class="vital-subnote">Read people</div>
                </div>
            </div>

            <div class="vital-card vital-special-senses">
                ${sensesSvg}
                <div class="vital-card-inner">
                    <div class="vital-icon"><i class="fa-solid fa-binoculars"></i></div>
                    <div class="vital-label">SPECIAL SENSES</div>
                    <div class="special-senses-list">
                        <div class="special-sense-row"><span>Darkvision</span><strong class="sense-darkvision-val">${formatSense(data.vitals.darkvision)}</strong></div>
                        ${data.vitals.devilsSight && data.vitals.devilsSight !== 'None' ? `
                        <div class="special-sense-row dev-sight-row" title="Sees normally in darkness, both magical and nonmagical"><span>Devil's Sight</span><strong class="sense-devils-sight-val">${formatSense(data.vitals.devilsSight)}</strong></div>
                        ` : ''}
                        <div class="special-sense-row"><span>Blindsight</span><strong class="sense-blindsight-val">${formatSense(data.vitals.blindsight)}</strong></div>
                        <div class="special-sense-row"><span>Tremorsense</span><strong class="sense-tremorsense-val">${formatSense(data.vitals.tremorsense)}</strong></div>
                        <div class="special-sense-row"><span>Truesight</span><strong class="sense-truesight-val">${formatSense(data.vitals.truesight)}</strong></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
