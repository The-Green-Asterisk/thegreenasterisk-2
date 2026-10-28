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
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void ctx.openItemModal(weaponName, weaponId || undefined, weaponType);
            }
        });
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
        });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        });
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
        });

        btn.addEventListener("keydown", (e) => {
            e.stopPropagation();
        });
    });
}
