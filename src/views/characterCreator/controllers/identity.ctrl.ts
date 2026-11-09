import el from "@elements";
import FileService from "@services/fileService";
import { CharacterCreatorContext } from "./context";

export function initIdentityController(ctx: CharacterCreatorContext): void {
    const nameInput = document.getElementById("char-name-input") as HTMLInputElement;
    nameInput?.addEventListener("input", (e) => {
        ctx.state.name = (e.target as HTMLInputElement).value;
        ctx.updateLiveSummary();
    });

    const alignSelect = document.getElementById("char-alignment-select") as HTMLSelectElement;
    alignSelect?.addEventListener("change", (e) => {
        ctx.state.alignment = (e.target as HTMLSelectElement).value;
    });

    const genderInput = document.getElementById("char-gender-input") as HTMLInputElement;
    genderInput?.addEventListener("input", (e) => {
        ctx.state.gender = (e.target as HTMLInputElement).value;
    });

    const avatarInput = document.getElementById("char-avatar-input") as HTMLInputElement;
    const previewImg = document.getElementById("char-avatar-preview-img") as HTMLImageElement;
    const uploadBtn = document.getElementById("char-avatar-upload-btn") as HTMLButtonElement;
    const fileInput = document.getElementById("char-avatar-file-input") as HTMLInputElement;
    const uploadStatus = document.getElementById("char-avatar-upload-status");

    avatarInput?.addEventListener("input", (e) => {
        const url = (e.target as HTMLInputElement).value.trim();
        ctx.state.avatarUrl = url || "/storage/images/default-avatar.png";
        if (previewImg) previewImg.src = ctx.state.avatarUrl;
        ctx.updateLiveSummary();
    });

    uploadBtn?.addEventListener("click", () => {
        fileInput?.click();
    });

    fileInput?.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        if (!el.isAuth) {
            if (uploadStatus) {
                uploadStatus.className = "creator-upload-status is-error";
                uploadStatus.textContent = "Please log in to upload files directly, or paste an image URL below.";
            }
            return;
        }

        if (uploadBtn) uploadBtn.disabled = true;
        if (uploadStatus) {
            uploadStatus.className = "creator-upload-status";
            const safeName = file.name.replace(/[&<>"']/g, (m) => {
                switch (m) {
                    case "&": return "&amp;";
                    case "<": return "&lt;";
                    case ">": return "&gt;";
                    case '"': return "&quot;";
                    case "'": return "&#039;";
                    default: return m;
                }
            });
            uploadStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${safeName}...`;
        }

        try {
            const filePath = await FileService.uploadFile(file, "avatars");
            ctx.state.avatarUrl = filePath;
            if (avatarInput) avatarInput.value = filePath;
            if (previewImg) previewImg.src = filePath;
            if (uploadStatus) {
                uploadStatus.className = "creator-upload-status is-success";
                uploadStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Uploaded successfully!`;
            }
            ctx.updateLiveSummary();
        } catch (err: any) {
            if (uploadStatus) {
                uploadStatus.className = "creator-upload-status is-error";
                uploadStatus.textContent = err.message || "Failed to upload avatar.";
            }
        } finally {
            if (uploadBtn) uploadBtn.disabled = false;
            fileInput.value = "";
        }
    });
}
