import el from "@elements";
import FileService from "@services/fileService";
import { postData, putData } from "@services/request";
import { CUSTOM_WEAPON_CATEGORIES, CUSTOM_WEAPON_DAMAGE_TYPES, CustomItemKind, customItemNoun, customItemPrefix } from "../components/customItemModal";
import { CharacterSheetContext } from "./context";
import { createLockPanel, LockField } from "./definitionLockPanel";
import { applyItemEditToCopies } from "../services/characterCopies";
import { describePropagation, describeRequestError, releaseBodyScrollIfNoDialogOpen, restoreFocusAfterClose, setSelectValue } from "./customContentAccess";

type DbItem = Record<string, any>;

type CustomItemDeps = {
    /** Puts a saved item on the active sheet as a weapon and/or equipment, the way Manage Weapons/Items does */
    addItemToCharacter: (item: DbItem) => void;
    refreshSheetItemsView: () => void;
    /** After a save, so lists showing database items (Manage Weapons/Items) can refresh */
    onSaved?: () => void;
};

const KINDS: CustomItemKind[] = ["weapon", "magic-item"];
const DICE_PATTERN = /^\d*d\d+(\s*[+-]\s*\d+)?$/i;

/** Which dialog edits a database item: weapons get the one with combat stats, everything else the magic item one */
export function customItemKindFor(item: DbItem): CustomItemKind {
    const filterType = String(item.filterType || "").toLowerCase();
    const category = String(item.category || "");
    if (filterType === "weapon" || /weapon/i.test(category) || CUSTOM_WEAPON_CATEGORIES.includes(category)) return "weapon";
    return "magic-item";
}

/** "1d8 Slashing" → dice "1d8", type "Slashing"; anything without a known type stays all dice */
export function splitWeaponDamage(damage: string | undefined): { dice: string; type?: string } {
    const text = String(damage || "").trim();
    const match = text.match(/^(.*?)\s+([A-Za-z]+)$/);
    const type = match ? CUSTOM_WEAPON_DAMAGE_TYPES.find(t => t.toLowerCase() === match[2].toLowerCase()) : undefined;
    return type ? { dice: match![1].trim(), type } : { dice: text };
}

export function initCustomItemModals(ctx: CharacterSheetContext, deps: CustomItemDeps) {
    const sheet = ctx.sheet;
    const editing: Record<CustomItemKind, DbItem | null> = { "weapon": null, "magic-item": null };
    const openers: Record<CustomItemKind, HTMLElement | null> = { "weapon": null, "magic-item": null };

    const q = <T extends HTMLElement = HTMLElement>(kind: CustomItemKind, suffix: string) =>
        sheet.querySelector<T>(`#${customItemPrefix(kind)}-${suffix}`);
    const input = (kind: CustomItemKind, suffix: string) => q<HTMLInputElement>(kind, suffix);
    const select = (kind: CustomItemKind, suffix: string) => q<HTMLSelectElement>(kind, suffix);
    const fieldValue = (kind: CustomItemKind, suffix: string) => {
        const field = q<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(kind, suffix);
        if (!field) return "";
        return field instanceof HTMLInputElement && field.type === "checkbox" ? String(field.checked) : field.value.trim();
    };
    const lockField = (kind: CustomItemKind, key: string, label: string, ...suffixes: string[]): LockField =>
        ({ key, label, read: () => suffixes.map(sfx => fieldValue(kind, sfx)).join("|") });
    const commonLocks = (kind: CustomItemKind) => [
        lockField(kind, "name", "Name", "name"),
        lockField(kind, "rarity", "Rarity", "rarity"),
        lockField(kind, "weight", "Weight", "weight"),
        lockField(kind, "cost", "Cost", "cost"),
        lockField(kind, "isMagic", "Magic Item", "is-magic"),
        lockField(kind, "requiresAttunement", "Attunement", "attunement")
    ];
    const tailLocks = (kind: CustomItemKind) => [
        lockField(kind, "description", "Description", "description"),
        lockField(kind, "imageUrl", "Illustration", "image")
    ];
    const lockPanels: Record<CustomItemKind, ReturnType<typeof createLockPanel>> = {
        "weapon": createLockPanel(q("weapon", "locks"), q<HTMLFormElement>("weapon", "form"), [
            ...commonLocks("weapon"),
            lockField("weapon", "category", "Category", "category"),
            lockField("weapon", "damage", "Damage", "damage-dice", "damage-type"),
            lockField("weapon", "range", "Range", "range"),
            lockField("weapon", "properties", "Properties", "properties"),
            lockField("weapon", "mastery", "Mastery", "mastery"),
            ...tailLocks("weapon")
        ]),
        "magic-item": createLockPanel(q("magic-item", "locks"), q<HTMLFormElement>("magic-item", "form"), [
            ...commonLocks("magic-item"),
            lockField("magic-item", "filterType", "Item Type", "item-type"),
            ...tailLocks("magic-item")
        ])
    };

    const isOpen = (kind: CustomItemKind) => {
        const modal = q(kind, "modal-container");
        return !!modal && !modal.classList.contains("hidden");
    };

    function showStatus(kind: CustomItemKind, message: string, isError = false) {
        const status = q(kind, "status");
        if (!status) return;
        status.textContent = message;
        status.className = `status-msg ${isError ? "error" : "success"}`;
    }

    function updateImagePreview(kind: CustomItemKind, url: string) {
        const wrap = q(kind, "image-preview-wrap");
        const img = q<HTMLImageElement>(kind, "image-preview");
        if (!wrap || !img) return;
        const clean = url.trim();
        img.src = clean;
        wrap.classList.toggle("hidden", !clean);
    }

    function hideUploadStatus(kind: CustomItemKind) {
        const status = q(kind, "upload-status");
        if (!status) return;
        status.className = "custom-spell-upload-status hidden";
        status.textContent = "";
    }

    function setMode(kind: CustomItemKind, item: DbItem | null) {
        const noun = customItemNoun(kind);
        const title = q(kind, "title");
        const subtitle = q(kind, "subtitle");
        const submit = q<HTMLButtonElement>(kind, "submit-btn");
        if (title) title.textContent = item ? `Edit ${noun}` : `Add Custom ${noun}`;
        if (subtitle) subtitle.textContent = item
            ? `Update ${item.name} in the local database`
            : `Save a custom ${noun.toLowerCase()} to your local database and add it to your active sheet`;
        if (submit) submit.innerHTML = `<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> ${item ? "Save Changes" : `Save ${noun}`}`;
    }

    function fillForm(kind: CustomItemKind, item: DbItem) {
        input(kind, "name")!.value = item.name || "";
        setSelectValue(select(kind, "rarity"), item.rarity || "Common");
        input(kind, "weight")!.value = item.weight ? String(item.weight) : "";
        input(kind, "cost")!.value = item.cost !== undefined && item.cost !== null ? String(item.cost) : "";
        input(kind, "is-magic")!.checked = !!item.isMagic;
        input(kind, "attunement")!.checked = !!item.requiresAttunement;
        q<HTMLTextAreaElement>(kind, "description")!.value = item.description || "";
        input(kind, "image")!.value = item.imageUrl || "";
        updateImagePreview(kind, item.imageUrl || "");

        if (kind === "weapon") {
            setSelectValue(select(kind, "category"), item.category || "Simple Melee");
            const { dice, type } = splitWeaponDamage(item.damage);
            input(kind, "damage-dice")!.value = dice;
            setSelectValue(select(kind, "damage-type"), type || "Slashing");
            input(kind, "range")!.value = item.range || "";
            input(kind, "properties")!.value = item.properties || "";
            setSelectValue(select(kind, "mastery"), item.mastery || "");
        } else {
            setSelectValue(select(kind, "item-type"), item.filterType || "Wondrous item");
        }
    }

    function open(kind: CustomItemKind, item?: DbItem) {
        const modal = q(kind, "modal-container");
        if (!modal) return;
        openers[kind] = document.activeElement as HTMLElement | null;
        q<HTMLFormElement>(kind, "form")?.reset();
        hideUploadStatus(kind);
        updateImagePreview(kind, "");
        const status = q(kind, "status");
        if (status) {
            status.className = "status-msg hidden";
            status.textContent = "";
        }

        editing[kind] = item ?? null;
        setMode(kind, editing[kind]);
        if (item) {
            fillForm(kind, item);
            lockPanels[kind].start(item.lockedFields, !item.isCustom);
        } else {
            lockPanels[kind].stop();
        }

        modal.classList.remove("hidden");
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        input(kind, "name")?.focus();

        if (!el.isAuth) showStatus(kind, `Log in to save custom ${customItemNoun(kind).toLowerCase()}s.`, true);
    }

    function close(kind: CustomItemKind) {
        const modal = q(kind, "modal-container");
        if (!modal) return;
        modal.classList.remove("visible");
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        q<HTMLFormElement>(kind, "form")?.reset();
        hideUploadStatus(kind);
        updateImagePreview(kind, "");
        editing[kind] = null;
        lockPanels[kind].stop();
        releaseBodyScrollIfNoDialogOpen(sheet);
        restoreFocusAfterClose(openers[kind], sheet);
        openers[kind] = null;
    }

    function buildPayload(kind: CustomItemKind): DbItem {
        const original = editing[kind];
        const weight = input(kind, "weight")?.value.trim();
        const cost = input(kind, "cost")?.value.trim();
        const common = {
            name: input(kind, "name")?.value.trim() || "",
            rarity: select(kind, "rarity")?.value || "Common",
            isMagic: !!input(kind, "is-magic")?.checked,
            requiresAttunement: !!input(kind, "attunement")?.checked,
            weight: weight ? Number(weight) : 0,
            cost: cost ? Number(cost) : undefined,
            description: q<HTMLTextAreaElement>(kind, "description")?.value.trim() || "",
            imageUrl: input(kind, "image")?.value.trim() || undefined,
            source: "Custom Homebrew"
        };

        if (kind === "weapon") {
            const dice = input(kind, "damage-dice")?.value.trim() || "";
            const damageType = select(kind, "damage-type")?.value || "Slashing";
            return {
                ...common,
                filterType: "Weapon",
                category: select(kind, "category")?.value || "Simple Melee",
                damage: `${dice} ${damageType}`.trim(),
                damageDie: dice,
                damageType,
                range: input(kind, "range")?.value.trim() || undefined,
                properties: input(kind, "properties")?.value.split(",").map(p => p.trim()).filter(Boolean).join(", ") || undefined,
                mastery: select(kind, "mastery")?.value || undefined
            };
        }

        const itemType = select(kind, "item-type")?.value || "Wondrous item";
        return {
            ...common,
            filterType: itemType,
            // The magic item dialog has no combat fields, so editing keeps whatever the row already had
            category: original ? original.category : itemType,
            damage: original?.damage,
            range: original?.range,
            properties: original?.properties,
            mastery: original?.mastery
        };
    }

    /** Copies an edit onto the active sheet's unlocked copies of the item (the server does every other character) */
    function applyEditToCharacter(oldName: string, item: DbItem) {
        const result = applyItemEditToCopies(ctx.getCharacter(), oldName, item);
        if (result.updated === 0) return;
        deps.refreshSheetItemsView();
        ctx.syncSheetStats();
        ctx.persistTrackerSnapshot();
        ctx.scheduleDebouncedAutoSave();
    }

    async function submit(kind: CustomItemKind, event: SubmitEvent) {
        event.preventDefault();
        const noun = customItemNoun(kind);
        if (!el.isAuth) {
            showStatus(kind, `Log in to save custom ${noun.toLowerCase()}s.`, true);
            return;
        }

        const payload = buildPayload(kind);
        if (!payload.name || !payload.description) {
            showStatus(kind, `${noun} Name and Description are required.`, true);
            return;
        }
        if (kind === "weapon" && !DICE_PATTERN.test(String(payload.damageDie))) {
            showStatus(kind, "Damage Dice must look like 1d8 or 2d6 + 1.", true);
            input(kind, "damage-dice")?.focus();
            return;
        }

        const original = editing[kind];
        const submitBtn = q<HTMLButtonElement>(kind, "submit-btn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Saving...';
        }
        showStatus(kind, `Saving ${noun.toLowerCase()} to the database...`);

        try {
            if (original) {
                const result = await putData<any>("/edit-custom-item", { ...payload, id: original.id, lockedFields: lockPanels[kind].locks() });
                const saved = result?.item || result;
                applyEditToCharacter(original.name, saved);
                showStatus(kind, `${noun} "${saved.name}" updated.${describePropagation(result?.propagation)}`);
            } else {
                const result = await postData<any>("/create-custom-item", payload);
                const saved = result?.item || result;
                if (ctx.getCharacter()) deps.addItemToCharacter(saved);
                showStatus(kind, `${noun} "${saved.name}" saved to the database${ctx.getCharacter() ? " and added to your sheet" : ""}.`);
            }
            deps.onSaved?.();
            setTimeout(() => close(kind), 800);
        } catch (error) {
            console.error(`Failed to save custom ${noun.toLowerCase()}:`, error);
            showStatus(kind, `Could not save ${noun.toLowerCase()}: ${describeRequestError(error)}`, true);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            setMode(kind, editing[kind]);
        }
    }

    for (const kind of KINDS) {
        const modal = q(kind, "modal-container");
        if (!modal) continue;

        q(kind, "close-btn")?.addEventListener("click", () => close(kind));
        q(kind, "cancel-btn")?.addEventListener("click", () => close(kind));
        modal.addEventListener("click", (event) => {
            if (event.target === modal) close(kind);
        });
        q<HTMLFormElement>(kind, "form")?.addEventListener("submit", (event) => void submit(kind, event as SubmitEvent));

        const imageInput = input(kind, "image");
        const fileInput = input(kind, "file-input");
        const uploadBtn = q<HTMLButtonElement>(kind, "upload-trigger-btn");
        const uploadStatus = q(kind, "upload-status");

        imageInput?.addEventListener("input", () => {
            updateImagePreview(kind, imageInput.value);
            hideUploadStatus(kind);
        });
        q(kind, "image-clear-btn")?.addEventListener("click", () => {
            if (imageInput) imageInput.value = "";
            updateImagePreview(kind, "");
            hideUploadStatus(kind);
            imageInput?.focus();
        });
        uploadBtn?.addEventListener("click", () => fileInput?.click());
        fileInput?.addEventListener("change", async () => {
            const file = fileInput.files?.[0];
            if (!file || !uploadStatus) return;
            uploadStatus.classList.remove("hidden");
            if (!el.isAuth) {
                uploadStatus.className = "custom-spell-upload-status is-error";
                uploadStatus.textContent = "Log in to upload files directly, or paste an external image URL.";
                return;
            }
            if (uploadBtn) uploadBtn.disabled = true;
            uploadStatus.className = "custom-spell-upload-status is-loading";
            uploadStatus.textContent = "Uploading image...";
            try {
                const filePath = await FileService.uploadFile(file, "items");
                if (imageInput) imageInput.value = filePath;
                updateImagePreview(kind, filePath);
                uploadStatus.className = "custom-spell-upload-status is-success";
                uploadStatus.textContent = "Image uploaded!";
            } catch (err: any) {
                uploadStatus.className = "custom-spell-upload-status is-error";
                uploadStatus.textContent = err?.message || "Failed to upload image.";
            } finally {
                if (uploadBtn) uploadBtn.disabled = false;
                fileInput.value = "";
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const openKind = KINDS.find(isOpen);
        if (openKind) close(openKind);
    });

    return { open, close };
}
