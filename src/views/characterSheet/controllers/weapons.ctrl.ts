import el from "@elements";
import { CharacterSheetContext } from "./context";

export function initWeaponsController(ctx: CharacterSheetContext) {
    const character = ctx.getCharacter();
    if (!character) return;

    // Weapon cards click to open modal
    const weaponCards = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
    weaponCards.forEach(card => {
        const weaponName = card.getAttribute("data-weapon-name");
        const weaponId = card.getAttribute("data-weapon-id");
        const weaponType = card.getAttribute("data-weapon-type") || "Weapon";
        if (!weaponName) return;

        card.addEventListener("click", () => {
            void ctx.openItemModal(weaponName, weaponId || undefined, weaponType);
        }, { signal: el.signal });
    });

    // Weapon equip toggle buttons
    const weaponEquipButtons = ctx.sheet.querySelectorAll<HTMLButtonElement>('.equip-toggle-btn[data-equip-scope="weapon"]');
    weaponEquipButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const encodedWeaponName = btn.getAttribute("data-weapon-name") || "";
            const rawWeaponId = btn.getAttribute("data-weapon-id");
            if (!encodedWeaponName) return;
            const weaponName = decodeURIComponent(encodedWeaponName).toLowerCase();
            const nextState = btn.getAttribute("aria-pressed") !== "true";

            (character.weapons || []).forEach(w => {
                if (w.name.toLowerCase() === weaponName) {
                    w.equipped = nextState;
                }
            });

            const affectedWeaponCards = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
            affectedWeaponCards.forEach(card => {
                const cardWeaponName = decodeURIComponent(card.getAttribute("data-weapon-name") || "").toLowerCase();
                if (cardWeaponName !== weaponName) return;

                card.classList.toggle("is-equipped", nextState);
                const toggleBtn = card.querySelector<HTMLButtonElement>(".weapon-badge.equip-toggle-btn");
                if (toggleBtn) {
                    toggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                    toggleBtn.classList.toggle("equipped", nextState);
                    toggleBtn.classList.toggle("unequipped", !nextState);
                    toggleBtn.innerHTML = `<i class="fa-solid ${nextState ? 'fa-check' : 'fa-minus'}"></i> ${nextState ? 'Equipped' : 'Unequipped'}`;
                }
            });

            void ctx.persistEquipState("weapon", encodedWeaponName, rawWeaponId, nextState);
            ctx.syncSheetStats();
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Weapon attune toggle buttons
    const weaponAttuneButtons = ctx.sheet.querySelectorAll<HTMLButtonElement>('.attune-toggle-btn[data-attune-scope="weapon"]');
    weaponAttuneButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const encodedWeaponName = btn.getAttribute("data-weapon-name") || "";
            const rawWeaponId = btn.getAttribute("data-weapon-id");
            if (!encodedWeaponName) return;
            const weaponName = decodeURIComponent(encodedWeaponName).toLowerCase();
            const nextState = btn.getAttribute("aria-pressed") !== "true";

            (character.weapons || []).forEach(w => {
                if (w.name.toLowerCase() === weaponName) {
                    w.attuned = nextState;
                }
            });

            const affectedWeaponCards = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
            affectedWeaponCards.forEach(card => {
                const cardWeaponName = decodeURIComponent(card.getAttribute("data-weapon-name") || "").toLowerCase();
                if (cardWeaponName !== weaponName) return;

                const toggleBtn = card.querySelector<HTMLButtonElement>(".weapon-badge.attune-toggle-btn");
                if (toggleBtn) {
                    toggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                    toggleBtn.classList.toggle("attuned", nextState);
                    toggleBtn.classList.toggle("unattuned", !nextState);
                    toggleBtn.setAttribute("title", `Toggle attunement (Click to ${nextState ? 'unattune' : 'attune'})`);
                    toggleBtn.innerHTML = `<i class="fa-solid ${nextState ? 'fa-link' : 'fa-link-slash'}"></i> ${nextState ? 'Attuned' : 'Unattuned'}`;
                }
            });

            void ctx.persistEquipState("attunement", encodedWeaponName, rawWeaponId, nextState);
            ctx.syncSheetStats();
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Weapon mastery toggle buttons
    const masteryButtons = ctx.sheet.querySelectorAll<HTMLButtonElement>('.equip-toggle-btn[data-equip-scope="weapon-mastery"]');
    masteryButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const encodedWeaponName = btn.getAttribute("data-weapon-name") || "";
            const encodedMasteryName = btn.getAttribute("data-mastery-name") || "";
            const rawWeaponId = btn.getAttribute("data-weapon-id");
            if (!encodedWeaponName || !encodedMasteryName) return;

            const weaponName = decodeURIComponent(encodedWeaponName).toLowerCase();
            const masteryName = decodeURIComponent(encodedMasteryName).toLowerCase();
            const nextState = btn.getAttribute("aria-pressed") !== "true";

            (character.weapons || []).forEach(w => {
                if (w.name.toLowerCase() === weaponName && w.mastery?.name?.toLowerCase() === masteryName) {
                    w.mastery.unlocked = nextState;
                }
            });

            const affectedWeaponCards = ctx.sheet.querySelectorAll<HTMLElement>(".clickable-weapon-card");
            affectedWeaponCards.forEach(card => {
                const cardWeaponName = decodeURIComponent(card.getAttribute("data-weapon-name") || "").toLowerCase();
                if (cardWeaponName !== weaponName) return;

                const masteryToggleBtn =
                    card.querySelector<HTMLButtonElement>(
                        `.weapon-mastery-badge.mastery-toggle-btn[data-mastery-name="${encodeURIComponent(decodeURIComponent(encodedMasteryName))}"]`
                    ) || card.querySelector<HTMLButtonElement>(".weapon-mastery-badge.mastery-toggle-btn");
                if (masteryToggleBtn) {
                    masteryToggleBtn.setAttribute("aria-pressed", nextState ? "true" : "false");
                    masteryToggleBtn.classList.toggle("unlocked", nextState);
                    masteryToggleBtn.classList.toggle("locked", !nextState);
                    masteryToggleBtn.innerHTML = `<i class="fa-solid fa-burst"></i> Mastery: ${decodeURIComponent(encodedMasteryName)}${nextState ? ' (Active)' : ''}`;
                }
            });

            const encodedPersistenceName = encodeURIComponent(
                `${decodeURIComponent(encodedWeaponName)}::${decodeURIComponent(encodedMasteryName)}`
            );
            void ctx.persistEquipState("weapon-mastery", encodedPersistenceName, rawWeaponId, nextState);
        }, { signal: el.signal });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });
    });

    // Open Manage Weapons/Items modal
    const openManageWeaponsBtn = ctx.sheet.querySelector<HTMLButtonElement>("#open-manage-weapons-btn");
    openManageWeaponsBtn?.addEventListener("click", () => {
        void ctx.openManageItemsModal("weapon");
    }, { signal: el.signal });

    ctx.sheet.querySelector<HTMLButtonElement>("#open-custom-weapon-btn")?.addEventListener("click", () => {
        ctx.openCustomItemModal("weapon");
    }, { signal: el.signal });

    // Weapon quantity steppers & inputs
    const weaponQtySteppers = ctx.sheet.querySelectorAll<HTMLElement>('.weapon-card .item-qty-stepper');
    weaponQtySteppers.forEach(stepper => {
        const encodedName = stepper.getAttribute("data-weapon-name");
        if (!encodedName) return;
        const decodedName = decodeURIComponent(encodedName);

        const input = stepper.querySelector<HTMLInputElement>(".item-qty-input");
        const decBtn = stepper.querySelector<HTMLButtonElement>(".qty-dec");
        const incBtn = stepper.querySelector<HTMLButtonElement>(".qty-inc");

        stepper.addEventListener("click", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        decBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = Number(input?.value || "1");
            const next = Math.max(0, current - 1);
            if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, next, "weapon");
        }, { signal: el.signal });

        incBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = Number(input?.value || "1");
            const next = current + 1;
            if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, next, "weapon");
        }, { signal: el.signal });

        input?.addEventListener("click", (e) => {
            e.stopPropagation();
        }, { signal: el.signal });

        input?.addEventListener("input", (e) => {
            e.stopPropagation();
            const val = parseInt(input.value, 10);
            if (!Number.isNaN(val) && val >= 0) {
                if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, val, "weapon");
            }
        }, { signal: el.signal });

        input?.addEventListener("blur", () => {
            if (input.value === "" || isNaN(Number(input.value)) || Number(input.value) < 0) {
                input.value = "0";
                if (ctx.setItemQuantity) ctx.setItemQuantity(decodedName, 0, "weapon");
            }
        }, { signal: el.signal });
    });
}
