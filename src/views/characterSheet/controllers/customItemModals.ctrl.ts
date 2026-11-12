import el from "@elements";
import FileService from "@services/fileService";
import { postData, putData } from "@services/request";
import { CUSTOM_WEAPON_CATEGORIES, CUSTOM_WEAPON_DAMAGE_TYPES, CustomItemKind, customItemNoun, customItemPrefix } from "../components/customItemModal";
import { CharacterSheetContext } from "./context";
import { createLockPanel, LockField } from "./definitionLockPanel";
import { findItemRule, upsertItemRule } from "../../../services/classRules";
import { StatModifier } from "../../../rules/dnd5e_2024/types";
import { applyItemEditToCopies, ChargesDefinition, chargesFromDb, EffectsEdit } from "../services/characterCopies";
import { createItemEffectsEditor } from "./itemEffectsEditor";
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

/** A database item's own effects (modifiersJson), or undefined when it has none and follows the seed list */
function parseModifiers(raw: unknown): StatModifier[] | undefined {
    if (typeof raw !== "string" || !raw) return undefined;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}
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

    const effectsEditors: Record<CustomItemKind, ReturnType<typeof createItemEffectsEditor>> = Object.fromEntries(KINDS.map(kind => [kind,
        createItemEffectsEditor({
            list: q(kind, "effects-list"),
            addButton: q<HTMLButtonElement>(kind, "effects-add-btn"),
            hint: q(kind, "effects-hint"),
            attunement: input(kind, "attunement")
        })])) as any;
    // True while the dialog shows effects the item follows by name (the seed list) rather than its own
    const effectsFromRule: Record<CustomItemKind, boolean> = { "weapon": false, "magic-item": false };

    const markupGuideOpen = () => {
        const guide = sheet.querySelector<HTMLElement>("#markup-guide-modal-container");
        return !!guide && !guide.classList.contains("hidden");
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
        const charges = chargesFromDb(item.chargesJson);
        input(kind, "charges-max")!.value = charges ? String(charges.max) : "";
        setSelectValue(select(kind, "charges-reset"), charges?.resetOn || "long");
        input(kind, "charges-label")!.value = charges?.resetLabel || "";

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
        const own = parseModifiers(item?.modifiersJson);
        effectsFromRule[kind] = !own;
        effectsEditors[kind].load(own ?? (item ? findItemRule(item.name)?.modifiers : undefined) ?? []);

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
        if (markupGuideOpen()) ctx.closeMarkupGuideModal();
        modal.classList.remove("visible");
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        q<HTMLFormElement>(kind, "form")?.reset();
        hideUploadStatus(kind);
        updateImagePreview(kind, "");
        editing[kind] = null;
        lockPanels[kind].stop();
        effectsEditors[kind].load([]);
        releaseBodyScrollIfNoDialogOpen(sheet);
        restoreFocusAfterClose(openers[kind], sheet);
        openers[kind] = null;
    }

    /** The dialog's charges, null for none, or undefined when the count isn't a whole number from 0 to 99 */
    function readCharges(kind: CustomItemKind): ChargesDefinition | null | undefined {
        const raw = input(kind, "charges-max")?.value.trim() || "";
        const max = raw === "" ? 0 : Number(raw);
        if (!Number.isInteger(max) || max < 0 || max > 99) return undefined;
        if (max === 0) return null;
        const resetOn = (select(kind, "charges-reset")?.value || "long") as ChargesDefinition["resetOn"];
        const resetLabel = input(kind, "charges-label")?.value.trim();
        return resetLabel ? { max, resetOn, resetLabel } : { max, resetOn };
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
            charges: readCharges(kind),
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
    function applyEditToCharacter(oldName: string, item: DbItem, effects?: EffectsEdit) {
        const result = applyItemEditToCopies(ctx.getCharacter(), oldName, item, effects, chargesFromDb(item.chargesJson) ?? null);
        if (result.updated === 0 && !effects) return;
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

        if (payload.charges === undefined) {
            showStatus(kind, "Charges must be a whole number from 0 to 99.", true);
            input(kind, "charges-max")?.focus();
            return;
        }

        const effects = effectsEditors[kind].read();
        if (effects.invalid) {
            showStatus(kind, effects.problem || "Finish or remove the incomplete effect.", true);
            effects.invalid.focus();
            return;
        }

        const original = editing[kind];
        const renamed = !!original && original.name.trim().toLowerCase() !== payload.name.trim().toLowerCase();
        // Send effects only when they changed, so items following the seed list keep following it; a renamed one
        // takes its effects along, since the seed list matches by name
        const sendEffects = original
            ? effectsEditors[kind].isDirty() || (effectsFromRule[kind] && renamed && effects.modifiers.length > 0)
            : effects.modifiers.length > 0;
        if (sendEffects) payload.modifiers = effects.modifiers;
        const submitBtn = q<HTMLButtonElement>(kind, "submit-btn");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Saving...';
        }
        showStatus(kind, `Saving ${noun.toLowerCase()} to the database...`);

        try {
            if (original) {
                const previousModifiers = parseModifiers(original.modifiersJson) ?? findItemRule(original.name)?.modifiers ?? [];
                const result = await putData<any>("/edit-custom-item", { ...payload, id: original.id, lockedFields: lockPanels[kind].locks() });
                const saved = result?.item || result;
                if (sendEffects) upsertItemRule(original.name, saved.name, effects.modifiers);
                else if (renamed && !effectsFromRule[kind]) upsertItemRule(original.name, saved.name, previousModifiers);
                applyEditToCharacter(original.name, saved, sendEffects ? { modifiers: effects.modifiers, previousModifiers } : undefined);
                showStatus(kind, `${noun} "${saved.name}" updated.${describePropagation(result?.propagation)}`);
            } else {
                const result = await postData<any>("/create-custom-item", payload);
                const saved = result?.item || result;
                if (sendEffects) upsertItemRule(undefined, saved.name, effects.modifiers);
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

        q(kind, "close-btn")?.addEventListener("click", () => close(kind), { signal: el.signal });
        q<HTMLButtonElement>(kind, "guide-btn")?.addEventListener("click", () => ctx.openMarkupGuideModal(), { signal: el.signal });
        q(kind, "cancel-btn")?.addEventListener("click", () => close(kind), { signal: el.signal });
        modal.addEventListener("click", (event) => {
            if (event.target === modal) close(kind);
        }, { signal: el.signal });
        q<HTMLFormElement>(kind, "form")?.addEventListener("submit", (event) => void submit(kind, event as SubmitEvent), { signal: el.signal });

        const imageInput = input(kind, "image");
        const fileInput = input(kind, "file-input");
        const uploadBtn = q<HTMLButtonElement>(kind, "upload-trigger-btn");
        const uploadStatus = q(kind, "upload-status");

        imageInput?.addEventListener("input", () => {
            updateImagePreview(kind, imageInput.value);
            hideUploadStatus(kind);
        }, { signal: el.signal });
        q(kind, "image-clear-btn")?.addEventListener("click", () => {
            if (imageInput) imageInput.value = "";
            updateImagePreview(kind, "");
            hideUploadStatus(kind);
            imageInput?.focus();
        }, { signal: el.signal });
        uploadBtn?.addEventListener("click", () => fileInput?.click(), { signal: el.signal });
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
        }, { signal: el.signal });
    }

    document.addEventListener("keydown", (event) => {
        // With the guide open over the dialog, Escape closes just the guide (the sheet's own handler does that)
        if (event.key !== "Escape" || markupGuideOpen()) return;
        const openKind = KINDS.find(isOpen);
        if (openKind) close(openKind);
    }, { signal: el.signal });

    return { open, close };
}
