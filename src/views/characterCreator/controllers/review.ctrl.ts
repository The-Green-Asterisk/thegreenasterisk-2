import { CharacterCreatorContext } from "./context";

export function initReviewController(ctx: CharacterCreatorContext): void {
    const submitBtn = document.getElementById("creator-submit-btn");
    submitBtn?.addEventListener("click", () => {
        ctx.submitCharacter();
    });
}
