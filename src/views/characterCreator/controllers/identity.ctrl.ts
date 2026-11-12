import el from "@elements";
import FileService from "@services/fileService";
import { CharacterCreatorContext } from "./context";

export function initIdentityController(ctx: CharacterCreatorContext): void {
    const nameInput = el.creatorNameInput as HTMLInputElement;
    nameInput?.addEventListener("input", (e) => {
        ctx.state.name = (e.target as HTMLInputElement).value;
        ctx.updateLiveSummary();
    });

    const alignSelect = el.creatorAlignmentSelect as HTMLSelectElement;
    alignSelect?.addEventListener("change", (e) => {
        ctx.state.alignment = (e.target as HTMLSelectElement).value;
    });

    el.creatorDetailInputs.forEach((input) => {
        const update = () => {
            const key = input.getAttribute("data-detail");
            if (key) ctx.state.details = { ...(ctx.state.details || {}), [key]: input.value };
        };
        input.addEventListener("input", update);
        input.addEventListener("change", update);
    });
    el.creatorNoteInputs.forEach((input) => {
        input.addEventListener("input", () => {
            const key = input.getAttribute("data-note");
            if (key) ctx.state.notes = { ...(ctx.state.notes || {}), [key]: input.value };
        });
    });

    const genderInput = el.creatorGenderInput as HTMLInputElement;
    genderInput?.addEventListener("input", (e) => {
        ctx.state.gender = (e.target as HTMLInputElement).value;
    });

    const avatarInput = el.creatorAvatarInput as HTMLInputElement;
    const previewImg = el.creatorAvatarPreview as HTMLImageElement;
    const uploadBtn = el.creatorAvatarUploadButton as HTMLButtonElement;
    const fileInput = el.creatorAvatarFileInput as HTMLInputElement;
    const uploadStatus = el.creatorAvatarUploadStatus;

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
