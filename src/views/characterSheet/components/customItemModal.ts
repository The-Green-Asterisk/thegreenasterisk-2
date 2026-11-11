import { renderLockPanel } from "../controllers/definitionLockPanel";
import { renderItemEffectsSection } from "./itemEffects";

export type CustomItemKind = "weapon" | "magic-item";

export const CUSTOM_ITEM_RARITIES = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];
export const CUSTOM_WEAPON_CATEGORIES = ["Simple Melee", "Simple Ranged", "Martial Melee", "Martial Ranged"];
export const CUSTOM_WEAPON_DAMAGE_TYPES = ["Bludgeoning", "Piercing", "Slashing", "Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Poison", "Psychic", "Radiant", "Thunder"];
export const CUSTOM_WEAPON_MASTERIES = ["Cleave", "Graze", "Nick", "Push", "Sap", "Slow", "Topple", "Vex"];
export const CUSTOM_MAGIC_ITEM_TYPES = ["Wondrous item", "Armor", "Potion", "Ring", "Rod", "Scroll", "Staff", "Wand"];

export const customItemPrefix = (kind: CustomItemKind) => kind === "weapon" ? "custom-weapon" : "custom-magic-item";
export const customItemNoun = (kind: CustomItemKind) => kind === "weapon" ? "Weapon" : "Magic Item";

const options = (values: string[], selected?: string) =>
    values.map(v => `<option value="${v}"${v === selected ? " selected" : ""}>${v}</option>`).join("");

/** The Add/Edit Custom Weapon and Magic Item dialogs share one layout; the weapon one adds combat stats. */
export function renderCustomItemModal(kind: CustomItemKind): string {
    const p = customItemPrefix(kind);
    const noun = customItemNoun(kind);
    const isWeapon = kind === "weapon";

    const weaponSection = `
                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-burst" aria-hidden="true"></i> Combat Stats</span>
                            </div>
                            <div class="form-grid">
                                <label class="form-field">
                                    <span class="form-label">Weapon Category <span class="required-star">*</span></span>
                                    <select id="${p}-category" required>${options(CUSTOM_WEAPON_CATEGORIES, "Simple Melee")}</select>
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Damage Dice <span class="required-star">*</span></span>
                                    <input type="text" id="${p}-damage-dice" required placeholder="e.g. 1d8" autocomplete="off" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Damage Type <span class="required-star">*</span></span>
                                    <select id="${p}-damage-type" required>${options(CUSTOM_WEAPON_DAMAGE_TYPES, "Slashing")}</select>
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Range</span>
                                    <input type="text" id="${p}-range" placeholder="e.g. 5 ft. or 80/320 ft." autocomplete="off" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Properties</span>
                                    <input type="text" id="${p}-properties" placeholder="e.g. Finesse, Light, Thrown" autocomplete="off" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Mastery</span>
                                    <select id="${p}-mastery"><option value="">None</option>${options(CUSTOM_WEAPON_MASTERIES)}</select>
                                </label>
                            </div>
                        </div>`;

    return `
        <!-- ADD / EDIT CUSTOM ${noun.toUpperCase()} MODAL -->
        <div id="${p}-modal-container" class="spell-modal-backdrop custom-item-backdrop hidden" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="${p}-title">
            <div class="spell-modal-dialog custom-spell-dialog">
                <header class="spell-modal-header">
                    <div class="spell-modal-title-group">
                        <div class="modal-type-chips">
                            <span class="modal-badge school-badge"><i class="fa-solid ${isWeapon ? "fa-khanda" : "fa-wand-sparkles"}" aria-hidden="true"></i> Homebrew</span>
                            <span class="modal-badge source-badge">Local Database</span>
                        </div>
                        <h2 class="modal-spell-title" id="${p}-title">Add Custom ${noun}</h2>
                        <div class="modal-spell-sub" id="${p}-subtitle">Save a custom ${noun.toLowerCase()} to your local database and add it to your active sheet</div>
                    </div>
                    <button type="button" class="spell-modal-close" id="${p}-close-btn" aria-label="Close custom ${noun.toLowerCase()} dialog">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </header>

                <div id="${p}-status" class="status-msg hidden" role="status" aria-live="polite"></div>

                <form id="${p}-form" class="custom-spell-form">
                    <div class="custom-spell-form-body">
                        ${renderLockPanel(`${p}-locks`)}
                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-sparkles" aria-hidden="true"></i> Basic Information</span>
                            </div>
                            <div class="form-grid">
                                <label class="form-field full-width">
                                    <span class="form-label">${noun} Name <span class="required-star">*</span></span>
                                    <input type="text" id="${p}-name" required placeholder="${isWeapon ? "e.g. Swamptown Cleaver" : "e.g. Lantern of the Bayou"}" autocomplete="off" />
                                </label>
                                ${isWeapon ? "" : `
                                <label class="form-field">
                                    <span class="form-label">Item Type <span class="required-star">*</span></span>
                                    <select id="${p}-item-type" required>${options(CUSTOM_MAGIC_ITEM_TYPES, "Wondrous item")}</select>
                                </label>`}
                                <label class="form-field">
                                    <span class="form-label">Rarity</span>
                                    <select id="${p}-rarity">${options(CUSTOM_ITEM_RARITIES, isWeapon ? "Common" : "Uncommon")}</select>
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Weight (lb.)</span>
                                    <input type="number" id="${p}-weight" min="0" step="any" inputmode="decimal" placeholder="0" />
                                </label>
                                <label class="form-field">
                                    <span class="form-label">Cost (gp)</span>
                                    <input type="number" id="${p}-cost" min="0" step="any" inputmode="decimal" placeholder="Optional" />
                                </label>
                                <div class="form-checkboxes full-width">
                                    <label class="form-toggle-pill" for="${p}-is-magic">
                                        <input type="checkbox" id="${p}-is-magic"${isWeapon ? "" : " checked"} />
                                        <span class="toggle-pill-ui">
                                            <i class="fa-solid fa-wand-sparkles" aria-hidden="true"></i>
                                            <span>Magic Item</span>
                                        </span>
                                    </label>
                                    <label class="form-toggle-pill" for="${p}-attunement">
                                        <input type="checkbox" id="${p}-attunement" />
                                        <span class="toggle-pill-ui">
                                            <i class="fa-solid fa-link" aria-hidden="true"></i>
                                            <span>Requires Attunement</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        ${isWeapon ? weaponSection : ""}
                        ${renderItemEffectsSection(p)}

                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-feather-pointed" aria-hidden="true"></i> Description <span class="required-star">*</span></span>
                            </div>
                            <p class="form-field-hint" id="${p}-description-hint">
                                Dynamic placeholders (like <code>{{modifier:str}}</code>) and tags (like <code>[condition]Prone[/condition]</code>) are supported.
                            </p>
                            <label class="form-field full-width">
                                <span class="visually-hidden">${noun} Description</span>
                                <textarea id="${p}-description" rows="6" required aria-describedby="${p}-description-hint" placeholder="Describe what it does, its charges, and any special properties..."></textarea>
                            </label>
                        </div>

                        <div class="form-section">
                            <div class="form-section-header">
                                <span class="form-section-title"><i class="fa-solid fa-image" aria-hidden="true"></i> Illustration (Optional)</span>
                            </div>
                            <div class="form-field full-width">
                                <label class="form-label" for="${p}-image">${noun} Artwork URL</label>
                                <p class="form-field-hint">Upload an image file from your device or paste an external image URL.</p>
                                <div class="custom-spell-image-controls">
                                    <div class="custom-spell-image-input-wrap">
                                        <input type="url" id="${p}-image" placeholder="Paste image URL (https://...)" autocomplete="off" />
                                        <button type="button" class="custom-spell-upload-btn" id="${p}-upload-trigger-btn">
                                            <i class="fa-solid fa-upload" aria-hidden="true"></i> Upload Image
                                        </button>
                                        <input type="file" id="${p}-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden />
                                    </div>
                                    <div id="${p}-upload-status" class="custom-spell-upload-status hidden" role="status"></div>
                                    <div id="${p}-image-preview-wrap" class="custom-spell-image-preview-wrap hidden">
                                        <img id="${p}-image-preview" src="" alt="${noun} illustration preview" />
                                        <button type="button" id="${p}-image-clear-btn" class="custom-spell-image-clear-btn">
                                            <i class="fa-solid fa-xmark" aria-hidden="true"></i> Clear Image
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer class="spell-modal-footer form-footer">
                        <button type="button" class="modal-action-btn secondary" id="${p}-cancel-btn">Cancel</button>
                        <button type="submit" class="modal-action-btn primary" id="${p}-submit-btn">
                            <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Save ${noun}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    `;
}
