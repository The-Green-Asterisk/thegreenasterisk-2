import { CharacterSheetContext } from "./context";

export function initTabsController(ctx: CharacterSheetContext) {
    const tabButtons = ctx.sheet.querySelectorAll<HTMLButtonElement>(".tab-btn");
    const tabPanes = ctx.sheet.querySelectorAll<HTMLElement>(".tab-pane");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab-target");
            if (!targetId) return;

            tabButtons.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            tabPanes.forEach(p => {
                p.classList.remove("active");
            });

            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            const targetPane = ctx.sheet.querySelector<HTMLElement>(`#${targetId}`);
            if (targetPane) {
                targetPane.classList.add("active");
            }
        });
    });
}
