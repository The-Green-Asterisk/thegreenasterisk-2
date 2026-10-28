import { CharacterSheetContext } from "./context";

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

    function enableCardLayoutEditors() {
        const activeCharacter = ctx.getCharacter();
        const dynamicContainer = ctx.dynamicContainer;
        if (!activeCharacter || !dynamicContainer) return;

        swapElementWithInput(dynamicContainer.querySelector(".character-name"), "name");
        swapTextWithInputKeepingIcon(dynamicContainer.querySelectorAll(".character-tags .tag")[0], "race");
        swapTextWithInputKeepingIcon(dynamicContainer.querySelectorAll(".character-tags .tag")[1], "background");
        swapTextWithInputKeepingIcon(dynamicContainer.querySelectorAll(".character-tags .tag")[2], "alignment");

        swapElementWithInput(dynamicContainer.querySelector(".vital-ac .vital-val"), "vitals.armorClass", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-init .vital-val"), "vitals.initiative", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-speed .vital-val"), "vitals.speed");
        swapElementWithInput(dynamicContainer.querySelector(".vital-dc .vital-val"), "vitals.spellSaveDc", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-attack .vital-val"), "vitals.spellAttackBonus", true);
        swapElementWithInput(dynamicContainer.querySelector(".vital-prof .vital-val"), "vitals.proficiencyBonus", true);
        swapElementWithInput(
            dynamicContainer.querySelector(".vital-passive-perception .vital-val"),
            "vitals.passivePerception",
            true
        );
        swapElementWithInput(
            dynamicContainer.querySelector(".vital-passive-investigation .vital-val"),
            "vitals.passiveInvestigation",
            true
        );
        swapElementWithInput(
            dynamicContainer.querySelector(".vital-passive-insight .vital-val"),
            "vitals.passiveInsight",
            true
        );
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-blindsight-val"), "vitals.blindsight");
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-darkvision-val"), "vitals.darkvision");
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-tremorsense-val"), "vitals.tremorsense");
        swapElementWithInput(dynamicContainer.querySelector(".vital-special-senses .sense-truesight-val"), "vitals.truesight");

        dynamicContainer.querySelectorAll(".ability-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".ability-header"), `abilities[${index}].abbr`);
            swapElementWithInput(card.querySelector(".ability-mod"), `abilities[${index}].modifier`, true);
            swapElementWithInput(card.querySelector(".ability-score"), `abilities[${index}].score`, true);
            swapElementWithInput(card.querySelector(".save-val"), `abilities[${index}].save`, true);
            const noteEl = card.querySelector(".ability-note");
            if (noteEl) {
                swapElementWithInput(noteEl, `abilities[${index}].notes`);
            }
        });

        dynamicContainer.querySelectorAll(".skill-row").forEach((row, index) => {
            swapElementWithInput(row.querySelector(".skill-name"), `skills[${index}].name`);
            swapElementWithInput(row.querySelector(".skill-stat"), `skills[${index}].stat`);
            swapElementWithInput(row.querySelector(".skill-bonus"), `skills[${index}].bonus`, true);
        });

        dynamicContainer.querySelectorAll(".action-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".action-name"), `actions[${index}].name`);
            swapElementWithInput(card.querySelector(".action-badge"), `actions[${index}].type`);
            const stats = card.querySelectorAll(".action-stat strong");
            swapElementWithInput(stats[0], `actions[${index}].rangeOrReach`);
            swapElementWithInput(stats[1], `actions[${index}].hitOrDc`);
            swapElementWithInput(stats[2], `actions[${index}].damageOrEffect`);
            swapElementWithInput(card.querySelector(".action-notes"), `actions[${index}].notes`);
        });

        dynamicContainer.querySelectorAll(".feature-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".feature-name"), `features[${index}].name`);
            swapElementWithInput(card.querySelector(".feature-badge"), `features[${index}].source`);
            swapElementWithInput(card.querySelector(".feature-desc"), `features[${index}].description`);
        });

        dynamicContainer.querySelectorAll(".spell-card").forEach((card, index) => {
            swapElementWithInput(card.querySelector(".spell-title"), `spells[${index}].name`);
            swapElementWithInput(card.querySelector(".spell-school-level"), `spells[${index}].school`);
            const metaValues = card.querySelectorAll(".meta-value");
            swapElementWithInput(metaValues[0], `spells[${index}].castingTime`);
            swapElementWithInput(metaValues[1], `spells[${index}].range`);
            swapElementWithInput(metaValues[2], `spells[${index}].duration`);
        });

        dynamicContainer.querySelectorAll(".equipment-row").forEach((row, index) => {
            swapTextWithInputKeepingIcon(row.querySelector(".item-name"), `equipment[${index}].name`);
            swapElementWithInput(row.querySelector(".item-type"), `equipment[${index}].type`);
            const notes = row.querySelector(".item-notes");
            if (notes) swapElementWithInput(notes, `equipment[${index}].notes`);
        });

        dynamicContainer.querySelectorAll(".weapon-card").forEach((card, index) => {
            swapTextWithInputKeepingIcon(card.querySelector(".weapon-name"), `weapons[${index}].name`);
            swapElementWithInput(card.querySelector(".weapon-category"), `weapons[${index}].category`);
            const stats = card.querySelectorAll(".wstat-val");
            swapElementWithInput(stats[0], `weapons[${index}].attackBonus`);
            swapElementWithInput(stats[1], `weapons[${index}].damage`);
            swapElementWithInput(stats[2], `weapons[${index}].range`);
            const notes = card.querySelector(".weapon-notes");
            if (notes) swapElementWithInput(notes, `weapons[${index}].notes`);
        });

        const firstSenseList = dynamicContainer.querySelectorAll(".sense-card ul li");
        swapElementWithInput(firstSenseList[0]?.querySelector("strong")?.parentElement || null, "vitals.passivePerception", true);
        swapElementWithInput(firstSenseList[1]?.querySelector("strong")?.parentElement || null, "vitals.passiveInvestigation", true);
        swapElementWithInput(firstSenseList[2]?.querySelector("strong")?.parentElement || null, "vitals.passiveInsight", true);
        swapElementWithInput(firstSenseList[3]?.querySelector("strong")?.parentElement || null, "vitals.darkvision");
    }

    return {
        enableCardLayoutEditors
    };
}
