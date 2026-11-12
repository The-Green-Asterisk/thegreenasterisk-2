import el from "@elements";
import { BASE_ARMOR_2024, BASE_WEAPONS_2024 } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "./context";

export function initEquipmentController(ctx: CharacterCreatorContext): void {
    el.creatorCoinInputs.forEach((input) => {
        input.addEventListener("change", () => {
            const coin = input.getAttribute("data-coin") as "cp" | "sp" | "ep" | "gp" | "pp" | null;
            if (!coin) return;
            const value = Math.max(0, Math.floor(Number(input.value) || 0));
            input.value = String(value);
            ctx.state.currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, ...(ctx.state.currency || {}), [coin]: value };
        });
    });

    // Equip starting equipment package buttons
    el.creatorEquipPackageButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = Number(btn.getAttribute("data-package-index"));
            const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
            const opt = cls?.startingEquipmentOptions?.[idx];
            if (opt) {
                ctx.state.equippedKitIndex = idx;
                const foundArmor = BASE_ARMOR_2024.find((a) =>
                    opt.items.some((it) => it.toLowerCase().includes(a.name.toLowerCase()))
                );
                if (foundArmor) {
                    ctx.state.selectedArmor = foundArmor.name;
                } else if (opt.items.some((it) => it.toLowerCase().includes("leather armor"))) {
                    ctx.state.selectedArmor = "Leather Armor";
                } else if (cls.armorProficiencies.length === 0) {
                    ctx.state.selectedArmor = "None";
                }
                ctx.state.hasShield = opt.items.some((it) => it.toLowerCase().includes("shield"));
                const matchedWeapons = BASE_WEAPONS_2024.filter((w) =>
                    opt.items.some((it) => it.toLowerCase().includes(w.name.toLowerCase()))
                ).map((w) => w.name);
                if (matchedWeapons.length > 0) {
                    ctx.state.selectedWeapons = matchedWeapons;
                }
                ctx.renderStep(7);
                ctx.updateLiveSummary();
            }
        });
    });

    el.creatorStartingPackageCards.forEach((card) => {
        card.addEventListener("click", (e) => {
            const btn = card.querySelector(".equip-package-btn");
            if (btn && e.target !== btn && !(btn as HTMLElement).contains(e.target as Node)) {
                (btn as HTMLButtonElement).click();
            }
        });
    });

    const armorSelect = el.creatorArmorSelect as HTMLSelectElement;
    armorSelect?.addEventListener("change", (e) => {
        ctx.state.selectedArmor = (e.target as HTMLSelectElement).value;
        ctx.state.equippedKitIndex = undefined;
        ctx.renderStep(7);
        ctx.updateLiveSummary();
    });

    const shieldCheck = el.creatorShieldCheckbox as HTMLInputElement;
    shieldCheck?.addEventListener("change", (e) => {
        ctx.state.hasShield = (e.target as HTMLInputElement).checked;
        ctx.state.equippedKitIndex = undefined;
        ctx.renderStep(7);
        ctx.updateLiveSummary();
    });

    el.creatorWeaponRows.forEach((row) => {
        row.addEventListener("click", () => {
            const wName = row.getAttribute("data-weapon-name") || "";
            if (ctx.state.selectedWeapons.includes(wName)) {
                ctx.state.selectedWeapons = ctx.state.selectedWeapons.filter((w) => w !== wName);
            } else {
                ctx.state.selectedWeapons.push(wName);
            }
            ctx.state.equippedKitIndex = undefined;
            ctx.renderStep(7);
            ctx.updateLiveSummary();
        });
    });
}
