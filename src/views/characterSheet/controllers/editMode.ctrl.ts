import { ensureBaseScoresOnCharacter } from "../characterAdapter";
import { CharacterSheetContext } from "./context";

export function parseClassInputString(str: string): Array<{ name: string; level: number; subclass?: string }> {
    const trimmed = str.trim();
    if (!trimmed) return [{ name: "Adventurer", level: 1 }];

    const parts = trimmed.split(/[/,]/);
    const parsed: Array<{ name: string; level: number; subclass?: string }> = [];

    for (const part of parts) {
        const item = part.trim();
        if (!item) continue;

        // Match optional (subclass) at the end, e.g. "Bard 9 (Glamour)" or "Warlock 10" or "Fighter"
        const subMatch = item.match(/\((.*?)\)/);
        const subclass = subMatch ? subMatch[1].trim() : undefined;
        const mainPart = item.replace(/\(.*?\)/, "").trim();

        // Match class name and optional level: e.g. "Bard 9" or "Bard" or "9 Bard"
        const levelMatch = mainPart.match(/\b(\d+)\b/);
        const level = levelMatch ? Math.max(1, parseInt(levelMatch[1], 10)) : 1;
        const className = mainPart.replace(/\b\d+\b/, "").trim() || "Adventurer";

        parsed.push({
            name: className,
            level,
            subclass
        });
    }

    return parsed.length > 0 ? parsed : [{ name: trimmed, level: 1 }];
}

export function initEditModeController(ctx: CharacterSheetContext) {
    function parsePathSegments(path: string): Array<string | number> {
        const segments: Array<string | number> = [];
        const matcher = /([^.[\]]+)|\[(\d+)\]/g;
        let match: RegExpExecArray | null;
        while ((match = matcher.exec(path)) !== null) {
            if (match[1]) {
                segments.push(match[1]);
            } else if (match[2]) {
                segments.push(Number(match[2]));
            }
        }
        return segments;
    }

    function setValueByPath(target: Record<string, unknown>, path: string, value: unknown) {
        const segments = parsePathSegments(path);
        if (!segments.length) return;

        let cursor: any = target;
        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            if (cursor == null) return;
            cursor = cursor[segment as any];
        }
        const lastSegment = segments[segments.length - 1];
        if (cursor != null) {
            cursor[lastSegment as any] = value;
        }
    }

    function getValueByPath(source: Record<string, unknown>, path: string): unknown {
        const segments = parsePathSegments(path);
        let cursor: unknown = source;
        for (const segment of segments) {
            if (cursor === null || cursor === undefined) return undefined;
            cursor = (cursor as any)[segment as any];
        }
        return cursor;
    }

    function createInlineInput(
        path: string,
        value: unknown,
        numeric = false,
        textAlign: string = "left"
    ): HTMLInputElement {
        const input = document.createElement("input");
        input.className = "card-inline-editor";
        input.type = numeric ? "number" : "text";
        input.value = value === null || value === undefined ? "" : String(value);
        input.style.textAlign = textAlign;
        input.addEventListener("input", () => {
            const activeCharacter = ctx.getCharacter();
            if (!activeCharacter) return;
            const nextValue = numeric ? Number(input.value || 0) : input.value;
            setValueByPath(activeCharacter as unknown as Record<string, unknown>, path, nextValue);
            if (path === "vitals.currentHp") {
                ctx.setCurrentHp(Number(nextValue) || 0);
            }
            if (path === "vitals.maxHp") {
                ctx.setMaxHp(Number(nextValue) || 0);
            }
            if (path === "vitals.tempHp") {
                ctx.setTempHp(Math.max(0, Number(nextValue) || 0));
            }
        });
        return input;
    }

    function swapElementWithInput(element: Element | null, path: string, numeric = false) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !element) return;
        const value = getValueByPath(activeCharacter as unknown as Record<string, unknown>, path);
        const textAlign = window.getComputedStyle(element as HTMLElement).textAlign || "left";
        const input = createInlineInput(path, value, numeric, textAlign);
        (element as HTMLElement).innerHTML = "";
        (element as HTMLElement).appendChild(input);
    }

    function swapTextWithInputKeepingIcon(element: Element | null, path: string, numeric = false) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !element) return;
        const htmlEl = element as HTMLElement;
        const icon = htmlEl.querySelector("i")?.outerHTML || "";
        htmlEl.innerHTML = `${icon} `;
        const value = getValueByPath(activeCharacter as unknown as Record<string, unknown>, path);
        const textAlign = window.getComputedStyle(htmlEl).textAlign || "left";
        const input = createInlineInput(path, value, numeric, textAlign);
        input.classList.add("inline-after-icon");
        htmlEl.appendChild(input);
    }

    function createLockToggleButton(fieldKey: string): HTMLButtonElement {
        const isLocked = ctx.isFieldLocked ? ctx.isFieldLocked(fieldKey) : !!ctx.getCharacter()?.lockedFields?.[fieldKey];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `field-lock-btn ${isLocked ? "is-locked" : ""}`;
        btn.setAttribute("data-lock-key", fieldKey);
        btn.title = isLocked
            ? "Locked: will not be overwritten when refreshed from D&D Beyond"
            : "Unlocked: click to lock field from D&D Beyond refresh";
        btn.innerHTML = `<i class="fa-solid ${isLocked ? "fa-lock" : "fa-lock-open"}"></i>`;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const nextState = ctx.toggleFieldLock ? ctx.toggleFieldLock(fieldKey) : !isLocked;
            btn.classList.toggle("is-locked", nextState);
            btn.title = nextState
                ? "Locked: will not be overwritten when refreshed from D&D Beyond"
                : "Unlocked: click to lock field from D&D Beyond refresh";
            btn.innerHTML = `<i class="fa-solid ${nextState ? "fa-lock" : "fa-lock-open"}"></i>`;
        });

        return btn;
    }

    function enableCardLayoutEditors() {
        const activeCharacter = ctx.getCharacter();
        const dynamicContainer = ctx.dynamicContainer;
        if (!activeCharacter || !dynamicContainer) return;

        ensureBaseScoresOnCharacter(activeCharacter);

        // Core Identity Fields: Name, Species (race), Background, Alignment, Class
        const nameEl = dynamicContainer.querySelector(".character-name");
        if (nameEl) {
            swapElementWithInput(nameEl, "name");
            nameEl.appendChild(createLockToggleButton("name"));
        }

        const raceTag = dynamicContainer.querySelectorAll(".character-tags .tag")[0];
        if (raceTag) {
            swapTextWithInputKeepingIcon(raceTag, "race");
            raceTag.appendChild(createLockToggleButton("race"));
        }

        const bgTag = dynamicContainer.querySelectorAll(".character-tags .tag")[1];
        if (bgTag) {
            swapTextWithInputKeepingIcon(bgTag, "background");
            bgTag.appendChild(createLockToggleButton("background"));
        }

        const alignTag = dynamicContainer.querySelectorAll(".character-tags .tag")[2];
        if (alignTag) {
            swapTextWithInputKeepingIcon(alignTag, "alignment");
            alignTag.appendChild(createLockToggleButton("alignment"));
        }

        // Class and Level editor
        const classEl = dynamicContainer.querySelector(".character-classes");
        if (classEl) {
            const classStr = activeCharacter.classes?.length
                ? activeCharacter.classes
                      .map(c => `${c.name} ${c.level}${c.subclass ? ` (${c.subclass})` : ""}`)
                      .join(" / ")
                : activeCharacter.subtitle || "";
            const classInput = document.createElement("input");
            classInput.className = "card-inline-editor character-class-input";
            classInput.type = "text";
            classInput.value = classStr;
            classInput.placeholder = "e.g. Bard 9 (Glamour) / Warlock 10";
            classInput.title = "Class and Level (e.g. Bard 9 / Warlock 10)";
            classInput.style.width = "100%";
            classInput.style.maxWidth = "420px";

            classInput.addEventListener("input", () => {
                const char = ctx.getCharacter();
                if (!char) return;
                const parsedClasses = parseClassInputString(classInput.value);
                char.classes = parsedClasses;
                const totalLevel = parsedClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;
                char.level = totalLevel;
                char.subtitle = `${parsedClasses.map(c => `${c.name} ${c.level}`).join(" / ")} • Level ${totalLevel}`;

                const newPb = Math.floor((totalLevel - 1) / 4) + 2;
                char.vitals.proficiencyBonus = newPb;

                // Update saving throws, skills, DCs with new PB
                char.abilities.forEach(ab => {
                    ab.save = ab.modifier + (ab.proficientSave ? newPb : 0);
                });
                char.skills.forEach(s => {
                    const ab = char.abilities.find(a => a.abbr === s.stat);
                    const mod = ab ? ab.modifier : 0;
                    if (s.proficiency === "expertise") s.bonus = mod + newPb * 2;
                    else if (s.proficiency === "proficient") s.bonus = mod + newPb;
                    else s.bonus = mod;
                });
                if (char.vitals.spellcastingAbility) {
                    const spellAb = char.abilities.find(
                        a =>
                            a.name.toLowerCase() === char.vitals.spellcastingAbility.toLowerCase() ||
                            a.abbr.toLowerCase() === char.vitals.spellcastingAbility.toLowerCase()
                    );
                    if (spellAb) {
                        char.vitals.spellSaveDc = 8 + newPb + spellAb.modifier;
                        char.vitals.spellAttackBonus = newPb + spellAb.modifier;
                    }
                }

                // Update DOM display elements
                const profVal = dynamicContainer.querySelector<HTMLElement>(".vital-prof .vital-val");
                if (profVal) profVal.textContent = `+${newPb}`;
                const dcVal = dynamicContainer.querySelector<HTMLElement>(".vital-dc .vital-val");
                if (dcVal) dcVal.textContent = String(char.vitals.spellSaveDc);
                const atkVal = dynamicContainer.querySelector<HTMLElement>(".vital-attack .vital-val");
                if (atkVal) atkVal.textContent = `+${char.vitals.spellAttackBonus}`;
                char.abilities.forEach((ab, idx) => {
                    const card = dynamicContainer.querySelectorAll(".ability-card")[idx];
                    const saveEl = card?.querySelector<HTMLElement>(".save-val");
                    if (saveEl) saveEl.textContent = ab.save >= 0 ? `+${ab.save}` : String(ab.save);
                });
            });

            classEl.innerHTML = "";
            classEl.appendChild(classInput);
            classEl.appendChild(createLockToggleButton("classes"));
        }

        // Max HP editor in the HP card
        const hpRatioEl = dynamicContainer.querySelector(".vital-hp #hp-ratio");
        if (hpRatioEl) {
            hpRatioEl.innerHTML = `Max: `;
            const maxHpInput = document.createElement("input");
            maxHpInput.type = "number";
            maxHpInput.className = "card-inline-editor max-hp-input";
            maxHpInput.value = String(activeCharacter.vitals.maxHp);
            maxHpInput.min = "1";
            maxHpInput.title = "Maximum Hit Points";
            maxHpInput.addEventListener("input", () => {
                const nextMax = Math.max(1, Number(maxHpInput.value || 1));
                ctx.setMaxHp(nextMax);
                const hpDisplay = dynamicContainer.querySelector<HTMLInputElement>("#hp-display");
                if (hpDisplay) hpDisplay.max = String(nextMax);
            });
            hpRatioEl.appendChild(maxHpInput);
            hpRatioEl.appendChild(createLockToggleButton("vitals.maxHp"));
        }

        // Vital Stats: Ability Scores (base score inputs with stacked modifier hint and live reactivity)
        dynamicContainer.querySelectorAll(".ability-card").forEach((card, index) => {
            const activeCharacter = ctx.getCharacter();
            if (!activeCharacter) return;
            const ability = activeCharacter.abilities[index];
            if (!ability) return;

            const baseVal = typeof ability.baseScore === "number"
                ? ability.baseScore
                : (ability.score - (ability.bonus || 0));
            const bonusVal = typeof ability.bonus === "number"
                ? ability.bonus
                : (ability.score - baseVal);

            // The score element becomes the base score editor with live modifier stacking
            const scoreEl = card.querySelector<HTMLElement>(".ability-score");
            const modEl = card.querySelector<HTMLElement>(".ability-mod");
            const saveEl = card.querySelector<HTMLElement>(".save-val");

            if (scoreEl) {
                scoreEl.innerHTML = "";
                scoreEl.classList.add("ability-score-editor-container");

                const baseInput = document.createElement("input");
                baseInput.type = "number";
                baseInput.className = "card-inline-editor ability-base-input";
                baseInput.value = String(baseVal);
                baseInput.min = "1";
                baseInput.max = "30";
                baseInput.title = "Base score (modifiers stack on top)";

                const totalHint = document.createElement("span");
                totalHint.className = "ability-total-hint";
                const updateTotalHint = () => {
                    const currentAb = ctx.getCharacter()?.abilities[index];
                    const currentScore = currentAb ? currentAb.score : ability.score;
                    const currentBonus = currentAb
                        ? (currentAb.bonus ?? (currentScore - (currentAb.baseScore ?? baseVal)))
                        : bonusVal;
                    if (currentBonus !== 0) {
                        const sign = currentBonus > 0 ? `+${currentBonus}` : `${currentBonus}`;
                        totalHint.textContent = `Total: ${currentScore} (${sign})`;
                        totalHint.title = `Base ${currentAb?.baseScore ?? baseVal} ${sign} modifier bonus = ${currentScore}`;
                    } else {
                        totalHint.textContent = `Total: ${currentScore}`;
                        totalHint.title = `Total score: ${currentScore}`;
                    }
                };
                updateTotalHint();

                baseInput.addEventListener("input", () => {
                    const nextBase = Number(baseInput.value || 0);
                    ctx.updateAbilityBaseScore(index, nextBase);

                    // Update live ability card elements
                    const updatedChar = ctx.getCharacter();
                    const updatedAb = updatedChar?.abilities[index];
                    if (updatedAb) {
                        if (modEl) {
                            modEl.textContent = updatedAb.modifier >= 0 ? `+${updatedAb.modifier}` : String(updatedAb.modifier);
                        }
                        if (saveEl) {
                            saveEl.textContent = updatedAb.save >= 0 ? `+${updatedAb.save}` : String(updatedAb.save);
                        }
                        updateTotalHint();

                        // Update skill rows in DOM if rendered
                        if (dynamicContainer) {
                            dynamicContainer.querySelectorAll(".skill-row").forEach((row, sIdx) => {
                                const s = updatedChar?.skills[sIdx];
                                if (s && s.stat === updatedAb.abbr) {
                                    const bonusEl = row.querySelector<HTMLElement>(".skill-bonus");
                                    if (bonusEl) {
                                        bonusEl.textContent = s.bonus >= 0 ? `+${s.bonus}` : String(s.bonus);
                                    }
                                }
                            });

                            // Update vitals in DOM
                            const dcVal = dynamicContainer.querySelector<HTMLElement>(".vital-dc .vital-val");
                            if (dcVal && updatedChar) dcVal.textContent = String(updatedChar.vitals.spellSaveDc);
                            const atkVal = dynamicContainer.querySelector<HTMLElement>(".vital-attack .vital-val");
                            if (atkVal && updatedChar) atkVal.textContent = `+${updatedChar.vitals.spellAttackBonus}`;
                            const initVal = dynamicContainer.querySelector<HTMLElement>(".vital-init .vital-val");
                            if (initVal && updatedChar && updatedAb.abbr === "DEX") {
                                initVal.textContent =
                                    updatedChar.vitals.initiative >= 0
                                        ? `+${updatedChar.vitals.initiative}`
                                        : String(updatedChar.vitals.initiative);
                            }
                            const acVal = dynamicContainer.querySelector<HTMLElement>(".vital-ac .vital-val");
                            if (acVal && updatedChar) acVal.textContent = String(updatedChar.vitals.armorClass);
                            const percVal = dynamicContainer.querySelector<HTMLElement>(".vital-passive-perception .vital-val, .sense-passive-perception-val");
                            if (percVal && updatedChar) percVal.textContent = String(updatedChar.vitals.passivePerception);
                            const invVal = dynamicContainer.querySelector<HTMLElement>(".vital-passive-investigation .vital-val, .sense-passive-investigation-val");
                            if (invVal && updatedChar) invVal.textContent = String(updatedChar.vitals.passiveInvestigation);
                            const insVal = dynamicContainer.querySelector<HTMLElement>(".vital-passive-insight .vital-val, .sense-passive-insight-val");
                            if (insVal && updatedChar) insVal.textContent = String(updatedChar.vitals.passiveInsight);
                        }
                    }
                });

                const abKey = `abilities.${ability.abbr}`;
                const abLockBtn = createLockToggleButton(abKey);
                abLockBtn.classList.add("ability-lock-btn");

                scoreEl.appendChild(baseInput);
                scoreEl.appendChild(totalHint);
                scoreEl.appendChild(abLockBtn);
            }
        });
    }

    return {
        enableCardLayoutEditors
    };
}
