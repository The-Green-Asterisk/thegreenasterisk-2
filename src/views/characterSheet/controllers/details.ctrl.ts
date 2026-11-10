import { CharacterSheetContext } from "./context";

/** Currency on the Details & Notes tab: edits save to the character (coins change in play, like hit points). */
export function initDetailsController(ctx: CharacterSheetContext) {
    ctx.sheet.querySelectorAll<HTMLInputElement>(".currency-input").forEach(input => {
        input.addEventListener("change", () => {
            const character = ctx.getCharacter();
            const coin = input.getAttribute("data-coin") as "cp" | "sp" | "ep" | "gp" | "pp" | null;
            if (!character || !coin) return;
            const value = Math.max(0, Math.floor(Number(input.value) || 0));
            input.value = String(value);
            character.currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, ...(character.currency || {}), [coin]: value };
            ctx.scheduleDebouncedAutoSave();
        });
    });
}
