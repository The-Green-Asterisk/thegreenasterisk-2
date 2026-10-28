import { CharacterData } from "../characterData";

export function renderVitalsSection(data: CharacterData): string {
    return `
        <div class="vitals-grid">
            <div class="vital-card vital-hp">
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

            <div class="vital-card vital-ac">
                <div class="vital-icon"><i class="fa-solid fa-shield-halved"></i></div>
                <div class="vital-val">${data.vitals.armorClass}</div>
                <div class="vital-label">ARMOR CLASS</div>
                <div class="vital-subnote">Armor & DEX</div>
            </div>

            <div class="vital-card vital-init">
                <div class="vital-icon"><i class="fa-solid fa-bolt"></i></div>
                <div class="vital-val">${data.vitals.initiative >= 0 ? `+${data.vitals.initiative}` : data.vitals.initiative}</div>
                <div class="vital-label">INITIATIVE</div>
                <div class="vital-subnote">DEX Modifier</div>
            </div>

            <div class="vital-card vital-speed">
                <div class="vital-icon"><i class="fa-solid fa-person-running"></i></div>
                <div class="vital-val">${data.vitals.speed}</div>
                <div class="vital-label">WALKING SPEED</div>
                <div class="vital-subnote">Base Speed</div>
            </div>

            <div class="vital-card vital-dc">
                <div class="vital-icon"><i class="fa-solid fa-wand-magic"></i></div>
                <div class="vital-val">${data.vitals.spellSaveDc}</div>
                <div class="vital-label">SPELL SAVE DC</div>
                <div class="vital-subnote">${data.vitals.spellcastingAbility}</div>
            </div>

            <div class="vital-card vital-attack">
                <div class="vital-icon"><i class="fa-solid fa-crosshairs"></i></div>
                <div class="vital-val">+${data.vitals.spellAttackBonus}</div>
                <div class="vital-label">SPELL ATTACK</div>
                <div class="vital-subnote">Prof + Ability</div>
            </div>

            <div class="vital-card vital-prof">
                <div class="vital-icon"><i class="fa-solid fa-award"></i></div>
                <div class="vital-val">+${data.vitals.proficiencyBonus}</div>
                <div class="vital-label">PROFICIENCY</div>
                <div class="vital-subnote">Level ${data.level} Tier</div>
            </div>

            <div class="vital-card vital-passive-perception">
                <div class="vital-icon"><i class="fa-solid fa-eye"></i></div>
                <div class="vital-val">${data.vitals.passivePerception}</div>
                <div class="vital-label">PASSIVE PERCEPTION</div>
                <div class="vital-subnote">Awareness</div>
            </div>

            <div class="vital-card vital-passive-investigation">
                <div class="vital-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                <div class="vital-val">${data.vitals.passiveInvestigation}</div>
                <div class="vital-label">PASSIVE INVESTIGATION</div>
                <div class="vital-subnote">Clues & details</div>
            </div>

            <div class="vital-card vital-passive-insight">
                <div class="vital-icon"><i class="fa-solid fa-brain"></i></div>
                <div class="vital-val">${data.vitals.passiveInsight}</div>
                <div class="vital-label">PASSIVE INSIGHT</div>
                <div class="vital-subnote">Read people</div>
            </div>

            <div class="vital-card vital-special-senses">
                <div class="vital-icon"><i class="fa-solid fa-eye"></i></div>
                <div class="vital-label">SPECIAL SENSES</div>
                <div class="special-senses-list">
                    <div class="special-sense-row"><span>Blindsight</span><strong class="sense-blindsight-val">${data.vitals.blindsight || '—'}</strong></div>
                    <div class="special-sense-row"><span>Darkvision</span><strong class="sense-darkvision-val">${data.vitals.darkvision || '—'}</strong></div>
                    <div class="special-sense-row"><span>Tremorsense</span><strong class="sense-tremorsense-val">${data.vitals.tremorsense || '—'}</strong></div>
                    <div class="special-sense-row"><span>Truesight</span><strong class="sense-truesight-val">${data.vitals.truesight || '—'}</strong></div>
                </div>
            </div>
        </div>
    `;
}
