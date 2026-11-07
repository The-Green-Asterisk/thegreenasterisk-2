import el from "@elements";
import FileService from "@services/fileService";
import { postData } from "@services/request";
import {
    AbilityName,
    BACKGROUNDS_2024,
    BASE_ARMOR_2024,
    BASE_WEAPONS_2024,
    CLASSES_2024,
    ORIGIN_FEATS_2024,
    SPECIES_2024,
    SPELLS_2024,
    WEAPON_MASTERIES
} from "../../rules/dnd5e_2024";

export interface CreatorState {
    currentStep: number;
    name: string;
    level: number;
    alignment: string;
    gender: string;
    avatarUrl: string;
    speciesId: string;
    lineageId: string;
    humanExtraSkill: string;
    humanExtraFeatId: string;
    classId: string;
    subclassId: string;
    weaponMasteries: string[];
    backgroundId: string;
    backgroundOption: "two-and-one" | "three-ones";
    bgStatA: AbilityName;
    bgStatB: AbilityName;
    bgStatC: AbilityName;
    bgTool: string;
    originFeatId: string;
    abilityMode: "standard" | "pointbuy" | "roll" | "manual";
    baseAbilities: Record<AbilityName, number>;
    classSkills: string[];
    expertiseSkills: string[];
    selectedWeapons: string[];
    selectedArmor: string;
    hasShield: boolean;
    selectedCantrips: string[];
    selectedSpellsLevel1: string[];
}

const ALL_SKILLS: Array<{ name: string; stat: AbilityName }> = [
    { name: "Acrobatics", stat: "dex" },
    { name: "Animal Handling", stat: "wis" },
    { name: "Arcana", stat: "int" },
    { name: "Athletics", stat: "str" },
    { name: "Deception", stat: "cha" },
    { name: "History", stat: "int" },
    { name: "Insight", stat: "wis" },
    { name: "Intimidation", stat: "cha" },
    { name: "Investigation", stat: "int" },
    { name: "Medicine", stat: "wis" },
    { name: "Nature", stat: "int" },
    { name: "Perception", stat: "wis" },
    { name: "Performance", stat: "cha" },
    { name: "Persuasion", stat: "cha" },
    { name: "Religion", stat: "int" },
    { name: "Sleight of Hand", stat: "dex" },
    { name: "Stealth", stat: "dex" },
    { name: "Survival", stat: "wis" }
];

export class CharacterCreatorController {
    public state: CreatorState = {
        currentStep: 1,
        name: "",
        level: 1,
        alignment: "Neutral Good",
        gender: "",
        avatarUrl: "/storage/images/default-avatar.png",
        speciesId: "human",
        lineageId: "",
        humanExtraSkill: "Perception",
        humanExtraFeatId: "alert",
        classId: "fighter",
        subclassId: "",
        weaponMasteries: ["Longsword", "Greatsword", "Shortbow"],
        backgroundId: "soldier",
        backgroundOption: "two-and-one",
        bgStatA: "str",
        bgStatB: "con",
        bgStatC: "dex",
        bgTool: "Gaming Set",
        originFeatId: "savage-attacker",
        abilityMode: "standard",
        baseAbilities: {
            str: 15,
            dex: 14,
            con: 13,
            int: 12,
            wis: 10,
            cha: 8
        },
        classSkills: ["Athletics", "Perception"],
        expertiseSkills: [],
        selectedWeapons: ["Longsword", "Light Crossbow"],
        selectedArmor: "Chain Mail",
        hasShield: true,
        selectedCantrips: [],
        selectedSpellsLevel1: []
    };

    public init(query?: any) {
        this.bindEvents();
        this.renderStep(1);
        this.updateLiveSummary();
    }

    private bindEvents() {
        const prevBtn = document.getElementById("creator-prev-btn");
        const nextBtn = document.getElementById("creator-next-btn");
        const submitBtn = document.getElementById("creator-submit-btn");

        prevBtn?.addEventListener("click", () => this.goToStep(this.state.currentStep - 1));
        nextBtn?.addEventListener("click", () => this.validateAndAdvance());
        submitBtn?.addEventListener("click", () => this.submitCharacter());

        // Stepper pills click
        const stepperItems = document.querySelectorAll(".stepper-item");
        stepperItems.forEach((item) => {
            item.addEventListener("click", () => {
                const step = Number(item.getAttribute("data-step"));
                if (step < this.state.currentStep) {
                    this.goToStep(step);
                } else if (step > this.state.currentStep) {
                    if (this.validateCurrentStep()) {
                        this.goToStep(step);
                    }
                }
            });
        });
    }

    private showAlert(msg: string) {
        const alertBox = document.getElementById("creator-validation-alert");
        if (alertBox) {
            alertBox.textContent = msg;
            alertBox.classList.remove("hidden");
        }
    }

    private hideAlert() {
        const alertBox = document.getElementById("creator-validation-alert");
        if (alertBox) {
            alertBox.textContent = "";
            alertBox.classList.add("hidden");
        }
    }

    public validateCurrentStep(): boolean {
        this.hideAlert();
        switch (this.state.currentStep) {
            case 1:
                if (!this.state.name.trim()) {
                    this.showAlert("Please enter a character name to proceed.");
                    return false;
                }
                return true;
            case 2:
                if (!this.state.speciesId) {
                    this.showAlert("Please select a species.");
                    return false;
                }
                return true;
            case 3:
                if (!this.state.classId) {
                    this.showAlert("Please select a class.");
                    return false;
                }
                return true;
            case 4:
                if (!this.state.backgroundId) {
                    this.showAlert("Please select a background.");
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    private validateAndAdvance() {
        if (!this.validateCurrentStep()) return;
        this.goToStep(this.state.currentStep + 1);
    }

    public goToStep(step: number) {
        if (step < 1 || step > 9) return;
        this.hideAlert();
        this.state.currentStep = step;

        // Update stepper UI
        document.querySelectorAll(".stepper-item").forEach((el) => {
            const stepNum = Number(el.getAttribute("data-step"));
            el.classList.toggle("active", stepNum === step);
            el.classList.toggle("completed", stepNum < step);
        });

        // Update step counter text
        const counter = document.getElementById("creator-step-indicator");
        if (counter) counter.textContent = `Step ${step} of 9`;

        // Update button states
        const prevBtn = document.getElementById("creator-prev-btn") as HTMLButtonElement;
        const nextBtn = document.getElementById("creator-next-btn") as HTMLButtonElement;
        const submitBtn = document.getElementById("creator-submit-btn") as HTMLButtonElement;

        if (prevBtn) prevBtn.disabled = step === 1;
        if (nextBtn) {
            nextBtn.classList.toggle("hidden", step === 9);
        }
        if (submitBtn) {
            submitBtn.classList.toggle("hidden", step !== 9);
        }

        this.renderStep(step);
        this.updateLiveSummary();
    }

    // Calculations
    public getProficiencyBonus(): number {
        return Math.floor((this.state.level - 1) / 4) + 2;
    }

    public static readonly STANDARD_ARRAY: number[] = [15, 14, 13, 12, 10, 8];

    public static readonly POINT_BUY_COSTS: Record<number, number> = {
        8: 0,
        9: 1,
        10: 2,
        11: 3,
        12: 4,
        13: 5,
        14: 7,
        15: 9
    };

    public getPointBuyCost(score: number): number {
        return CharacterCreatorController.POINT_BUY_COSTS[score] ?? 0;
    }

    public getSpentPoints(): number {
        const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
        return stats.reduce((sum, st) => {
            const score = this.state.baseAbilities[st];
            return sum + (CharacterCreatorController.POINT_BUY_COSTS[score] ?? 0);
        }, 0);
    }

    public getAvailablePoints(): number {
        return Math.max(0, Math.min(27, 27 - this.getSpentPoints()));
    }

    public canIncrementPointBuy(stat: AbilityName): boolean {
        const current = this.state.baseAbilities[stat] ?? 8;
        if (current >= 15) return false;
        const nextCost = CharacterCreatorController.POINT_BUY_COSTS[current + 1] ?? 99;
        const currentCost = CharacterCreatorController.POINT_BUY_COSTS[current] ?? 0;
        const diff = nextCost - currentCost;
        return this.getAvailablePoints() >= diff;
    }

    public canDecrementPointBuy(stat: AbilityName): boolean {
        return (this.state.baseAbilities[stat] ?? 8) > 8;
    }

    public incrementPointBuy(stat: AbilityName): boolean {
        if (!this.canIncrementPointBuy(stat)) return false;
        this.state.baseAbilities[stat]++;
        return true;
    }

    public decrementPointBuy(stat: AbilityName): boolean {
        if (!this.canDecrementPointBuy(stat)) return false;
        this.state.baseAbilities[stat]--;
        return true;
    }

    public setStandardArrayScore(targetStat: AbilityName, newValue: number): void {
        if (!CharacterCreatorController.STANDARD_ARRAY.includes(newValue)) return;
        const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
        const swapStat = stats.find((st) => st !== targetStat && this.state.baseAbilities[st] === newValue);
        const oldValue = this.state.baseAbilities[targetStat];
        this.state.baseAbilities[targetStat] = newValue;
        if (swapStat) {
            this.state.baseAbilities[swapStat] = oldValue;
        }
    }

    public getEffectiveAbilityScore(stat: AbilityName): number {
        let score = this.state.baseAbilities[stat] || 10;
        // Background bonuses
        if (this.state.backgroundOption === "two-and-one") {
            if (this.state.bgStatA === stat) score += 2;
            else if (this.state.bgStatB === stat) score += 1;
        } else {
            if (this.state.bgStatA === stat || this.state.bgStatB === stat || this.state.bgStatC === stat) {
                score += 1;
            }
        }
        return score;
    }

    public getAbilityModifier(stat: AbilityName): number {
        return Math.floor((this.getEffectiveAbilityScore(stat) - 10) / 2);
    }

    public getMaxHp(): number {
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
        const conMod = this.getAbilityModifier("con");
        const hitDie = cls.hitDie;
        const level = this.state.level;

        // Level 1: max hit die + Con mod
        let hp = hitDie + conMod;
        // Higher levels: average die + Con mod per level
        if (level > 1) {
            const avgDie = Math.floor(hitDie / 2) + 1;
            hp += (level - 1) * (avgDie + conMod);
        }

        // Tough feat bonus (+2 HP per level)
        if (this.state.originFeatId === "tough" || (this.state.speciesId === "human" && this.state.humanExtraFeatId === "tough")) {
            hp += 2 * level;
        }

        // Dwarven Toughness (+1 HP per level)
        if (this.state.speciesId === "dwarf") {
            hp += level;
        }

        return Math.max(1, hp);
    }

    public getArmorClass(): number {
        const dexMod = this.getAbilityModifier("dex");
        const armor = BASE_ARMOR_2024.find((a) => a.name === this.state.selectedArmor);
        let ac = 10 + dexMod;

        if (armor) {
            if (armor.category === "Light") {
                ac = armor.baseAc + dexMod;
            } else if (armor.category === "Medium") {
                ac = armor.baseAc + Math.min(2, dexMod);
            } else if (armor.category === "Heavy") {
                ac = armor.baseAc;
            }
        } else {
            // Unarmored Defense for Barbarian or Monk
            if (this.state.classId === "barbarian") {
                ac = 10 + dexMod + this.getAbilityModifier("con");
            } else if (this.state.classId === "monk") {
                ac = 10 + dexMod + this.getAbilityModifier("wis");
            }
        }

        if (this.state.hasShield) {
            ac += 2;
        }

        return ac;
    }

    public getInitiative(): number {
        let init = this.getAbilityModifier("dex");
        // Alert origin feat adds proficiency bonus
        if (this.state.originFeatId === "alert" || (this.state.speciesId === "human" && this.state.humanExtraFeatId === "alert")) {
            init += this.getProficiencyBonus();
        }
        return init;
    }

    public getSpeed(): number {
        const species = SPECIES_2024.find((s) => s.id === this.state.speciesId);
        let speed = species?.speed || 30;
        if (this.state.speciesId === "elf" && this.state.lineageId === "wood-elf") {
            speed += 5;
        }
        if ((this.state.classId === "barbarian" || this.state.classId === "monk") && this.state.level >= 5) {
            speed += 10;
        }
        // Heavy Armor Strength requirement penalty: -10 ft if Strength is lower than required
        if (this.state.selectedArmor && this.state.selectedArmor !== "None") {
            const armor = BASE_ARMOR_2024.find((a) => a.name === this.state.selectedArmor);
            if (armor?.strengthRequired) {
                const effectiveStr = this.getEffectiveAbilityScore("str");
                if (effectiveStr < armor.strengthRequired) {
                    speed = Math.max(5, speed - 10);
                }
            }
        }
        return speed;
    }

    public isProficientWithArmor(armorName: string): boolean {
        if (!armorName || armorName === "None") return true;
        const armor = BASE_ARMOR_2024.find((a) => a.name === armorName);
        if (!armor) return true;
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId);
        if (!cls) return true;
        const profs = cls.armorProficiencies;
        if (profs.includes("All Armor")) return true;
        return profs.some((p) => p.toLowerCase().includes(armor.category.toLowerCase()));
    }

    public isProficientWithShield(): boolean {
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId);
        if (!cls) return true;
        return cls.armorProficiencies.includes("Shields") || cls.armorProficiencies.includes("All Armor");
    }

    public isProficientWithWeapon(weaponName: string): boolean {
        const weapon = BASE_WEAPONS_2024.find((w) => w.name === weaponName);
        if (!weapon) return true;
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId);
        if (!cls) return true;
        const profs = cls.weaponProficiencies;
        if (profs.includes("Martial Weapons") || profs.includes("Simple Weapons, Martial Weapons")) return true;
        if (weapon.category.startsWith("Simple") && profs.some((p) => p.includes("Simple"))) return true;
        if (cls.id === "rogue" && (weapon.properties.includes("Finesse") || weapon.properties.includes("Light"))) return true;
        if (cls.id === "monk" && weapon.properties.includes("Light")) return true;
        return false;
    }

    public getWeaponStatRequirement(weaponName: string): { stat: "str" | "dex"; required: number; current: number; met: boolean } | null {
        const weapon = BASE_WEAPONS_2024.find((w) => w.name === weaponName);
        if (!weapon || !weapon.properties.includes("Heavy")) return null;
        const isRanged = weapon.category.includes("Ranged");
        const stat: "str" | "dex" = isRanged ? "dex" : "str";
        const current = this.getEffectiveAbilityScore(stat);
        return {
            stat,
            required: 13,
            current,
            met: current >= 13
        };
    }

    public getArmorStatRequirement(armorName: string): { required: number; current: number; met: boolean } | null {
        if (!armorName || armorName === "None") return null;
        const armor = BASE_ARMOR_2024.find((a) => a.name === armorName);
        if (!armor?.strengthRequired) return null;
        const current = this.getEffectiveAbilityScore("str");
        return {
            required: armor.strengthRequired,
            current,
            met: current >= armor.strengthRequired
        };
    }

    public initClassDefaultEquipment(cls: any) {
        const effectiveStr = this.getEffectiveAbilityScore("str");
        if (cls.armorProficiencies.length === 0) {
            this.state.selectedArmor = "None";
            this.state.hasShield = false;
        } else if (cls.armorProficiencies.includes("All Armor")) {
            this.state.selectedArmor = effectiveStr >= 13 ? "Chain Mail" : "Scale Mail";
            this.state.hasShield = true;
        } else if (cls.armorProficiencies.includes("Medium Armor")) {
            this.state.selectedArmor = "Scale Mail";
            this.state.hasShield = cls.armorProficiencies.includes("Shields");
        } else if (cls.armorProficiencies.includes("Light Armor")) {
            this.state.selectedArmor = "Leather Armor";
            this.state.hasShield = false;
        }

        const opt = cls.startingEquipmentOptions?.[0];
        if (opt) {
            const matched = BASE_WEAPONS_2024.filter((w) => opt.items.some((it: string) => it.toLowerCase().includes(w.name.toLowerCase()))).map((w) => w.name);
            if (matched.length > 0) {
                this.state.selectedWeapons = matched;
            }
        }
    }

    public updateLiveSummary() {
        const nameEl = document.getElementById("summary-name");
        const metaEl = document.getElementById("summary-meta");
        const hpEl = document.getElementById("summary-hp");
        const acEl = document.getElementById("summary-ac");
        const initEl = document.getElementById("summary-init");
        const speedEl = document.getElementById("summary-speed");
        const avatarEl = document.getElementById("summary-avatar-img") as HTMLImageElement;

        const species = SPECIES_2024.find((s) => s.id === this.state.speciesId)?.name || "Species";
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId)?.name || "Class";

        if (nameEl) nameEl.textContent = this.state.name || "Unnamed Hero";
        if (metaEl) metaEl.textContent = `Level ${this.state.level} • ${species} • ${cls}`;
        if (hpEl) hpEl.textContent = String(this.getMaxHp());
        if (acEl) acEl.textContent = String(this.getArmorClass());
        if (initEl) {
            const initVal = this.getInitiative();
            initEl.textContent = (initVal >= 0 ? "+" : "") + initVal;
        }
        if (speedEl) speedEl.textContent = `${this.getSpeed()} ft.`;
        if (avatarEl) avatarEl.src = this.state.avatarUrl || "/storage/images/default-avatar.png";
    }

    // Step Renderers
    public renderStep(step: number) {
        const panelsContainer = document.getElementById("creator-step-panels");
        if (!panelsContainer) return;
        panelsContainer.innerHTML = "";

        let panelHtml = "";
        switch (step) {
            case 1:
                panelHtml = this.renderStep1Identity();
                break;
            case 2:
                panelHtml = this.renderStep2Species();
                break;
            case 3:
                panelHtml = this.renderStep3Class();
                break;
            case 4:
                panelHtml = this.renderStep4Background();
                break;
            case 5:
                panelHtml = this.renderStep5Abilities();
                break;
            case 6:
                panelHtml = this.renderStep6Skills();
                break;
            case 7:
                panelHtml = this.renderStep7Equipment();
                break;
            case 8:
                panelHtml = this.renderStep8Spells();
                break;
            case 9:
                panelHtml = this.renderStep9Review();
                break;
        }

        panelsContainer.innerHTML = panelHtml;
        this.attachStepEvents(step);
    }

    private renderStep1Identity(): string {
        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Character Identity & Basics</h3>
                    <p class="panel-desc">Give your hero a name, starting level, alignment, and appearance.</p>
                </div>
                <div class="creator-form-grid">
                    <div class="creator-form-group">
                        <label class="creator-label" for="char-name-input">Character Name *</label>
                        <input type="text" id="char-name-input" class="creator-input" placeholder="e.g. San Te, Lyra Silverleaf" value="${this.escape(this.state.name)}" required />
                    </div>
                    <div class="creator-form-group">
                        <label class="creator-label" for="char-level-input">Starting Level (1 - 20)</label>
                        <input type="number" id="char-level-input" class="creator-input" min="1" max="20" value="${this.state.level}" />
                    </div>
                    <div class="creator-form-group">
                        <label class="creator-label" for="char-alignment-select">Alignment</label>
                        <select id="char-alignment-select" class="creator-select">
                            ${[
                                "Lawful Good", "Neutral Good", "Chaotic Good",
                                "Lawful Neutral", "True Neutral", "Chaotic Neutral",
                                "Lawful Evil", "Neutral Evil", "Chaotic Evil", "Unaligned"
                            ].map((a) => `<option value="${a}" ${this.state.alignment === a ? "selected" : ""}>${a}</option>`).join("")}
                        </select>
                    </div>
                    <div class="creator-form-group">
                        <label class="creator-label" for="char-gender-input">Gender / Pronouns</label>
                        <input type="text" id="char-gender-input" class="creator-input" placeholder="e.g. Female (She/Her)" value="${this.escape(this.state.gender)}" />
                    </div>
                    <div class="creator-form-group" style="grid-column: 1 / -1;">
                        <label class="creator-label">Character Avatar</label>
                        <div class="creator-avatar-picker">
                            <div class="creator-avatar-preview">
                                <img id="char-avatar-preview-img" src="${this.escape(this.state.avatarUrl || '/storage/images/default-avatar.png')}" alt="Avatar Preview" />
                            </div>
                            <div class="creator-avatar-controls">
                                <div class="creator-avatar-upload-row">
                                    <input type="file" id="char-avatar-file-input" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" style="display: none;" />
                                    <button type="button" id="char-avatar-upload-btn" class="creator-nav-btn secondary-btn">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Image File
                                    </button>
                                    <span id="char-avatar-upload-status" class="creator-upload-status">PNG, JPG, WebP, GIF (Max 10MB)</span>
                                </div>
                                <div class="creator-avatar-divider"><span>OR PROVIDE IMAGE URL</span></div>
                                <div class="creator-avatar-url-row">
                                    <input type="text" id="char-avatar-input" class="creator-input" placeholder="https://example.com/character-portrait.png" value="${this.escape(this.state.avatarUrl)}" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderStep2Species(): string {
        const currentSpecies = SPECIES_2024.find((s) => s.id === this.state.speciesId) || SPECIES_2024[0];
        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Choose Species</h3>
                    <p class="panel-desc">Select your species from the 10 core options in 5.5e. In the 2024 revision, ability score increases are tied to your background.</p>
                </div>
                <div class="card-select-grid">
                    ${SPECIES_2024.map((sp) => `
                        <div class="select-card species-card ${this.state.speciesId === sp.id ? "selected" : ""}" data-species-id="${sp.id}">
                            <div class="card-title-row">
                                <h4 class="card-title">${sp.name}</h4>
                                <span class="card-check"><i class="fa-solid fa-check"></i></span>
                            </div>
                            <span class="card-tag">${sp.size} • ${sp.speed} ft. ${sp.darkvision ? `• ${sp.darkvision}` : ""}</span>
                            <p class="card-body">${sp.description}</p>
                        </div>
                    `).join("")}
                </div>

                ${currentSpecies.lineages && currentSpecies.lineages.length > 0 ? `
                    <div class="creator-detail-box">
                        <h4>${currentSpecies.name} Lineage / Heritage</h4>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                            ${currentSpecies.lineages.map((lin) => `
                                <div class="select-card lineage-card ${this.state.lineageId === lin.id ? "selected" : ""}" data-lineage-id="${lin.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${lin.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${lin.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                ${currentSpecies.id === "human" ? `
                    <div class="creator-detail-box">
                        <h4>Human Versatility</h4>
                        <div class="creator-form-grid">
                            <div class="creator-form-group">
                                <label class="creator-label">Skillful (Choose 1 Extra Skill)</label>
                                <select id="human-skill-select" class="creator-select">
                                    ${ALL_SKILLS.map((sk) => `<option value="${sk.name}" ${this.state.humanExtraSkill === sk.name ? "selected" : ""}>${sk.name} (${sk.stat.toUpperCase()})</option>`).join("")}
                                </select>
                            </div>
                            <div class="creator-form-group">
                                <label class="creator-label">Versatile (Choose 1 Extra Origin Feat)</label>
                                <select id="human-feat-select" class="creator-select">
                                    ${ORIGIN_FEATS_2024.map((f) => `<option value="${f.id}" ${this.state.humanExtraFeatId === f.id ? "selected" : ""}>${f.name}</option>`).join("")}
                                </select>
                            </div>
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    private renderStep3Class(): string {
        const currentClass = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Choose Class</h3>
                    <p class="panel-desc">Select your character's class. Classes grant Hit Dice, proficiencies, weapon masteries, and starting features.</p>
                </div>
                <div class="card-select-grid">
                    ${CLASSES_2024.map((cls) => `
                        <div class="select-card class-card ${this.state.classId === cls.id ? "selected" : ""}" data-class-id="${cls.id}">
                            <div class="card-title-row">
                                <h4 class="card-title">${cls.name}</h4>
                                <span class="card-check"><i class="fa-solid fa-check"></i></span>
                            </div>
                            <span class="card-tag">Hit Die: d${cls.hitDie} • Saves: ${cls.savingThrows.map((s) => s.toUpperCase()).join(", ")}</span>
                            <p class="card-body">${cls.description}</p>
                        </div>
                    `).join("")}
                </div>

                ${currentClass.weaponMasteryCount > 0 ? `
                    <div class="creator-detail-box">
                        <h4>Weapon Masteries (Choose up to ${currentClass.weaponMasteryCount})</h4>
                        <p class="card-body">Your martial training unlocks tactical weapon mastery properties (Push, Vex, Nick, Topple, Cleave, Graze, Sap, Slow).</p>
                        <div class="skills-select-grid">
                            ${BASE_WEAPONS_2024.filter((w) => currentClass.weaponProficiencies.some((p) => p.includes("Martial") || w.category.includes("Simple"))).map((w) => {
                                const isSelected = this.state.weaponMasteries.includes(w.name);
                                return `
                                    <div class="skill-checkbox-card mastery-card ${isSelected ? "selected" : ""}" data-weapon-name="${w.name}">
                                        <div class="skill-info">
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                            <span class="skill-name">${w.name}</span>
                                        </div>
                                        <span class="skill-stat-badge" style="color: var(--ui-text);">${w.mastery}</span>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                ` : ""}

                ${this.state.level >= 3 && currentClass.subclasses.length > 0 ? `
                    <div class="creator-detail-box">
                        <h4>Subclass Selection (Level ${this.state.level})</h4>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                            ${currentClass.subclasses.map((sub) => `
                                <div class="select-card subclass-card ${this.state.subclassId === sub.id ? "selected" : ""}" data-subclass-id="${sub.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sub.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sub.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    private renderStep4Background(): string {
        const currentBg = BACKGROUNDS_2024.find((b) => b.id === this.state.backgroundId) || BACKGROUNDS_2024[0];
        const feat = ORIGIN_FEATS_2024.find((f) => f.id === currentBg.originFeatId) || ORIGIN_FEATS_2024[0];
        const allowed = currentBg.allowedAbilities;

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Choose Background & Origin Feat</h3>
                    <p class="panel-desc">In 5.5e, your background determines your Ability Score Increases (+2/+1 or +1/+1/+1), 2 skill proficiencies, 1 tool, and 1 Origin Feat.</p>
                </div>
                <div class="card-select-grid">
                    ${BACKGROUNDS_2024.map((bg) => `
                        <div class="select-card background-card ${this.state.backgroundId === bg.id ? "selected" : ""}" data-background-id="${bg.id}">
                            <div class="card-title-row">
                                <h4 class="card-title">${bg.name}</h4>
                                <span class="card-check"><i class="fa-solid fa-check"></i></span>
                            </div>
                            <span class="card-tag">Abilities: ${bg.allowedAbilities.map((a) => a.toUpperCase()).join(", ")}</span>
                            <p class="card-body">${bg.description}</p>
                        </div>
                    `).join("")}
                </div>

                <div class="creator-detail-box">
                    <h4>${currentBg.name} Configuration</h4>
                    <div class="creator-form-grid">
                        <div class="creator-form-group">
                            <label class="creator-label">Ability Score Distribution</label>
                            <div style="display: flex; gap: 1rem; margin-top: 0.25rem;">
                                <label><input type="radio" name="bg-option" value="two-and-one" ${this.state.backgroundOption === "two-and-one" ? "checked" : ""} /> +2 to one, +1 to another</label>
                                <label><input type="radio" name="bg-option" value="three-ones" ${this.state.backgroundOption === "three-ones" ? "checked" : ""} /> +1 to all three stats</label>
                            </div>
                        </div>

                        ${this.state.backgroundOption === "two-and-one" ? `
                            <div class="creator-form-group">
                                <label class="creator-label">+2 Ability Score</label>
                                <select id="bg-stat-a" class="creator-select">
                                    ${allowed.map((s) => `<option value="${s}" ${this.state.bgStatA === s ? "selected" : ""}>${s.toUpperCase()}</option>`).join("")}
                                </select>
                            </div>
                            <div class="creator-form-group">
                                <label class="creator-label">+1 Ability Score</label>
                                <select id="bg-stat-b" class="creator-select">
                                    ${allowed.filter((s) => s !== this.state.bgStatA).map((s) => `<option value="${s}" ${this.state.bgStatB === s ? "selected" : ""}>${s.toUpperCase()}</option>`).join("")}
                                </select>
                            </div>
                        ` : `
                            <div class="creator-form-group">
                                <label class="creator-label">+1 to Three Stats</label>
                                <p class="card-body" style="margin-top: 0.4rem;"><strong>${allowed.map((s) => s.toUpperCase()).join(", ")}</strong> all receive +1.</p>
                            </div>
                        `}

                        <div class="creator-form-group">
                            <label class="creator-label">Tool Proficiency Granted</label>
                            <input type="text" class="creator-input" value="${currentBg.tool}" readonly />
                        </div>
                        <div class="creator-form-group">
                            <label class="creator-label">Origin Feat Granted</label>
                            <input type="text" class="creator-input" value="${feat.name}" readonly />
                        </div>
                    </div>

                    <div style="margin-top: 0.5rem; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius);">
                        <strong style="color: var(--ui-text); font-size: 0.95rem;">${feat.name}:</strong>
                        <p style="font-size: 0.85rem; margin: 0.25rem 0 0 0; color: var(--text-muted);">${feat.description}</p>
                        <ul style="margin: 0.35rem 0 0 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--text);">
                            ${feat.benefits.map((b) => `<li>${b}</li>`).join("")}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    private renderStep5Abilities(): string {
        const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
        const labels: Record<AbilityName, string> = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
        const mode = this.state.abilityMode;
        const availablePoints = this.getAvailablePoints();

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Ability Scores</h3>
                    <p class="panel-desc">Configure your base ability scores. Background bonuses are added automatically.</p>
                </div>

                <div class="ability-modes-tabs">
                    <button type="button" class="tab-btn ${mode === "standard" ? "active" : ""}" data-mode="standard">Standard Array</button>
                    <button type="button" class="tab-btn ${mode === "pointbuy" ? "active" : ""}" data-mode="pointbuy">Point Buy (27)</button>
                    <button type="button" class="tab-btn ${mode === "roll" ? "active" : ""}" data-mode="roll">Roll 4d6 Drop Lowest</button>
                    <button type="button" class="tab-btn ${mode === "manual" ? "active" : ""}" data-mode="manual">Manual Entry</button>
                </div>

                ${mode === "standard" ? `
                    <div class="ability-mode-info-banner">
                        <span class="ability-info-title"><i class="fa-solid fa-list-ol"></i> Standard Array: 15, 14, 13, 12, 10, 8</span>
                        <p class="ability-info-desc">Assign numbers from the array to specific abilities. Choosing an already-assigned value automatically swaps with that ability.</p>
                    </div>
                ` : ""}

                ${mode === "pointbuy" ? `
                    <div class="point-buy-banner">
                        <div class="point-buy-header">
                            <span class="point-buy-title"><i class="fa-solid fa-scale-balanced"></i> Point Buy</span>
                            <div class="point-buy-counter ${availablePoints === 0 ? "is-spent" : ""}">
                                <span class="counter-label">Available Points:</span>
                                <strong class="counter-val" id="point-buy-available-val">${availablePoints} / 27</strong>
                            </div>
                        </div>
                        <p class="point-buy-desc">Base scores range from 8 (0 pts) to 15 (9 pts). Point costs: 9 (1 pt), 10 (2 pts), 11 (3 pts), 12 (4 pts), 13 (5 pts), 14 (7 pts), 15 (9 pts). Available points never exceed 27 or drop below 0.</p>
                    </div>
                ` : ""}

                <div class="ability-scores-grid" style="margin-top: 1rem;">
                    ${stats.map((stat) => {
                        const base = this.state.baseAbilities[stat] ?? 10;
                        const total = this.getEffectiveAbilityScore(stat);
                        const mod = this.getAbilityModifier(stat);
                        const modStr = (mod >= 0 ? "+" : "") + mod;
                        const bgBonus = total - base;

                        return `
                            <div class="ability-score-card" data-stat-card="${stat}">
                                <span class="ability-abbr">${labels[stat]}</span>
                                <div class="ability-score-display">${total}</div>
                                <span class="ability-mod-display">${modStr}</span>

                                ${mode === "standard" ? `
                                    <div class="ability-inputs standard-array-inputs" style="width: 100%;">
                                        <select class="standard-array-select" data-stat="${stat}" aria-label="${labels[stat]} base score">
                                            ${CharacterCreatorController.STANDARD_ARRAY.map((val) => `
                                                <option value="${val}" ${base === val ? "selected" : ""}>Base: ${val}</option>
                                            `).join("")}
                                        </select>
                                    </div>
                                    <span class="ability-breakdown">${bgBonus > 0 ? `(+${bgBonus} from Background)` : "No BG bonus"}</span>
                                ` : mode === "pointbuy" ? `
                                    <div class="ability-inputs point-buy-inputs">
                                        <button type="button" class="score-control-btn point-buy-dec-btn" data-stat="${stat}" ${!this.canDecrementPointBuy(stat) ? "disabled" : ""} title="Decrease ${labels[stat]} score">-</button>
                                        <span class="point-buy-score-display">${base}</span>
                                        <button type="button" class="score-control-btn point-buy-inc-btn" data-stat="${stat}" ${!this.canIncrementPointBuy(stat) ? "disabled" : ""} title="Increase ${labels[stat]} score">+</button>
                                    </div>
                                    <span class="point-buy-cost-breakdown">Cost: ${this.getPointBuyCost(base)} pts ${bgBonus > 0 ? `(+${bgBonus} BG)` : ""}</span>
                                ` : `
                                    <div class="ability-inputs">
                                        <button type="button" class="score-control-btn score-dec-btn" data-stat="${stat}">-</button>
                                        <input type="number" class="score-num-input" data-stat="${stat}" min="3" max="20" value="${base}" />
                                        <button type="button" class="score-control-btn score-inc-btn" data-stat="${stat}">+</button>
                                    </div>
                                    <span class="ability-breakdown">Base: ${base} ${bgBonus > 0 ? `(+${bgBonus} BG)` : ""}</span>
                                `}
                            </div>
                        `;
                    }).join("")}
                </div>

                ${mode === "roll" ? `
                    <div style="margin-top: 1rem;">
                        <button type="button" id="roll-all-stats-btn" class="creator-nav-btn secondary-btn">
                            <i class="fa-solid fa-dice-d20"></i> Roll All Stats (4d6 Drop Lowest)
                        </button>
                    </div>
                ` : ""}
            </div>
        `;
    }

    private renderStep6Skills(): string {
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
        const bg = BACKGROUNDS_2024.find((b) => b.id === this.state.backgroundId) || BACKGROUNDS_2024[0];
        const bgSkills = bg.skills;
        const classAllowed = cls.skillChoices.from;
        const maxClassCount = cls.skillChoices.count;

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Skills & Proficiencies</h3>
                    <p class="panel-desc">Choose ${maxClassCount} skills from your class list. Background skills are granted automatically.</p>
                </div>

                <div class="skills-select-grid">
                    ${ALL_SKILLS.map((sk) => {
                        const isBgSkill = bgSkills.includes(sk.name);
                        const isHumanExtra = this.state.speciesId === "human" && this.state.humanExtraSkill === sk.name;
                        const isClassSkill = this.state.classSkills.includes(sk.name);
                        const isAllowedByClass = classAllowed.includes(sk.name);
                        const isSelected = isBgSkill || isHumanExtra || isClassSkill;
                        const isLocked = isBgSkill || isHumanExtra;

                        return `
                            <div class="skill-checkbox-card ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}" data-skill-name="${sk.name}" data-allowed="${isAllowedByClass}">
                                <div class="skill-info">
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    <span class="skill-name">${sk.name}</span>
                                </div>
                                <span class="skill-stat-badge">
                                    ${isBgSkill ? "Background" : isHumanExtra ? "Human" : sk.stat.toUpperCase()}
                                </span>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    private renderStep7Equipment(): string {
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
        const effectiveStr = this.getEffectiveAbilityScore("str");
        const effectiveDex = this.getEffectiveAbilityScore("dex");
        const selectedArmorDef = BASE_ARMOR_2024.find((a) => a.name === this.state.selectedArmor);
        const armorStatReq = this.getArmorStatRequirement(this.state.selectedArmor);
        const isArmorProficient = this.isProficientWithArmor(this.state.selectedArmor);
        const isShieldProficient = this.isProficientWithShield();

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Starting Equipment & Armor</h3>
                    <p class="panel-desc">Select starting weapons, armor, and gear. Stat requirements and class proficiencies are evaluated live.</p>
                </div>

                ${cls.startingEquipmentOptions.length > 0 ? `
                    <div class="starting-packages-section">
                        <h4 class="starting-packages-title"><i class="fa-solid fa-box-open"></i> ${cls.name} Starting Equipment Kits</h4>
                        <div class="starting-packages-grid">
                            ${cls.startingEquipmentOptions.map((opt, idx) => `
                                <div class="starting-package-card">
                                    <div class="package-card-header">
                                        <strong>Option ${String.fromCharCode(65 + idx)}: ${opt.name}</strong>
                                        <button type="button" class="creator-nav-btn secondary-btn equip-package-btn" data-package-index="${idx}">
                                            <i class="fa-solid fa-wand-magic-sparkles"></i> Equip Kit
                                        </button>
                                    </div>
                                    <ul class="package-items-list">
                                        ${opt.items.map((it) => `<li>${it}</li>`).join("")}
                                    </ul>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                ` : ""}

                <div class="creator-form-grid">
                    <div class="creator-form-group">
                        <label class="creator-label" for="char-armor-select">Armor</label>
                        <select id="char-armor-select" class="creator-select">
                            <option value="None" ${this.state.selectedArmor === "None" ? "selected" : ""}>None (Unarmored: 10 + Dex)</option>
                            ${BASE_ARMOR_2024.map((a) => {
                                const reqStr = a.strengthRequired ? ` • Req STR ${a.strengthRequired}` : "";
                                const reqWarning = a.strengthRequired && effectiveStr < a.strengthRequired ? " [⚠️ -10ft Speed]" : "";
                                const profWarning = !this.isProficientWithArmor(a.name) ? " [⚠️ Non-Proficient]" : "";
                                return `
                                    <option value="${a.name}" ${this.state.selectedArmor === a.name ? "selected" : ""}>
                                        ${a.name} (${a.category}, AC ${a.baseAc}${reqStr})${reqWarning}${profWarning}
                                    </option>
                                `;
                            }).join("")}
                        </select>
                        ${armorStatReq && !armorStatReq.met ? `
                            <div class="equipment-stat-alert warning">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                <div>
                                    <strong>Strength Requirement Not Met:</strong> ${this.state.selectedArmor} requires <strong>Strength ${armorStatReq.required}</strong>, but your Strength is <strong>${armorStatReq.current}</strong>. Your movement speed is reduced by 10 ft (current Speed: <strong>${this.getSpeed()} ft.</strong>).
                                </div>
                            </div>
                        ` : armorStatReq && armorStatReq.met ? `
                            <div class="equipment-stat-alert success">
                                <i class="fa-solid fa-circle-check"></i>
                                <div>Meets Strength requirement (STR ${armorStatReq.current} ≥ ${armorStatReq.required}).</div>
                            </div>
                        ` : ""}
                        ${!isArmorProficient ? `
                            <div class="equipment-stat-alert danger">
                                <i class="fa-solid fa-shield-halved"></i>
                                <div><strong>Non-Proficient Armor:</strong> ${cls.name} lacks proficiency with ${selectedArmorDef?.category} armor. (Imposes Disadvantage on STR/DEX rolls and blocks spellcasting).</div>
                            </div>
                        ` : ""}
                    </div>

                    <div class="creator-form-group" style="justify-content: flex-start;">
                        <label class="creator-label">Shield</label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding-top: 0.5rem;">
                            <input type="checkbox" id="char-shield-checkbox" ${this.state.hasShield ? "checked" : ""} />
                            <strong>Equip Shield (+2 AC)</strong>
                        </label>
                        ${this.state.hasShield && !isShieldProficient ? `
                            <div class="equipment-stat-alert danger">
                                <i class="fa-solid fa-shield"></i>
                                <div><strong>Non-Proficient Shield:</strong> ${cls.name} lacks shield proficiency.</div>
                            </div>
                        ` : ""}
                    </div>
                </div>

                <div class="creator-detail-box" style="margin-top: 1rem;">
                    <h4>Select Weapons</h4>
                    <p style="margin: 0.25rem 0 0.85rem 0; font-size: 0.84rem; color: var(--text-muted);">
                        In 2024 D&D rules, Heavy melee weapons require STR 13 and Heavy ranged weapons require DEX 13; lacking the required score imposes Disadvantage on attack rolls.
                    </p>
                    <div class="item-select-list">
                        ${BASE_WEAPONS_2024.map((w) => {
                            const isSelected = this.state.selectedWeapons.includes(w.name);
                            const statReq = this.getWeaponStatRequirement(w.name);
                            const isProf = this.isProficientWithWeapon(w.name);

                            return `
                                <div class="item-check-row weapon-row ${isSelected ? "selected" : ""}" data-weapon-name="${w.name}">
                                    <div class="item-row-left">
                                        <div class="item-row-title">
                                            ${w.name} (${w.category})
                                            ${statReq ? (
                                                statReq.met
                                                    ? `<span class="stat-req-pill met"><i class="fa-solid fa-check"></i> Req: ${statReq.stat.toUpperCase()} 13 ✓</span>`
                                                    : `<span class="stat-req-pill unmet" title="Attacks made with Disadvantage without ${statReq.stat.toUpperCase()} 13"><i class="fa-solid fa-triangle-exclamation"></i> Req: ${statReq.stat.toUpperCase()} 13 (Disadvantage: you have ${statReq.current})</span>`
                                            ) : ""}
                                            ${!isProf ? `<span class="stat-req-pill non-prof"><i class="fa-solid fa-ban"></i> Non-Proficient</span>` : ""}
                                        </div>
                                        <div class="item-row-meta">Damage: ${w.damageDie} ${w.damageType} • Mastery: ${w.mastery}</div>
                                        <div class="item-row-desc">${w.properties.join(", ") || "None"}</div>
                                    </div>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    private renderStep8Spells(): string {
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
        const isCaster = !!cls.spellcasting;
        const cantrips = SPELLS_2024.filter((sp) => sp.level === 0 && (!isCaster || sp.classes.includes(cls.name)));
        const spellsLvl1 = SPELLS_2024.filter((sp) => sp.level === 1 && (!isCaster || sp.classes.includes(cls.name)));

        if (!isCaster) {
            return `
                <div class="step-panel active">
                    <div class="panel-header">
                        <h3 class="panel-title">Spells & Magic</h3>
                        <p class="panel-desc">Your class (${cls.name}) does not have innate spellcasting at level 1.</p>
                    </div>
                    <p class="card-body">You may continue to the Review step, or pick spells if granted by your Origin Feat (e.g. Magic Initiate) or racial lineages.</p>
                </div>
            `;
        }

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Spells (${cls.name})</h3>
                    <p class="panel-desc">Select cantrips and prepared 1st-level spells for your spellcaster.</p>
                </div>

                <div class="creator-detail-box">
                    <h4>Cantrips (Level 0)</h4>
                    <div class="item-select-list">
                        ${cantrips.map((sp) => {
                            const isSelected = this.state.selectedCantrips.includes(sp.name);
                            return `
                                <div class="item-check-row cantrip-row ${isSelected ? "selected" : ""}" data-spell-name="${sp.name}">
                                    <div class="item-row-left">
                                        <div class="item-row-title">${sp.name} (${sp.school})</div>
                                        <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                        <div class="item-row-desc">${sp.description}</div>
                                    </div>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>

                <div class="creator-detail-box">
                    <h4>1st-Level Spells</h4>
                    <div class="item-select-list">
                        ${spellsLvl1.map((sp) => {
                            const isSelected = this.state.selectedSpellsLevel1.includes(sp.name);
                            return `
                                <div class="item-check-row spell1-row ${isSelected ? "selected" : ""}" data-spell-name="${sp.name}">
                                    <div class="item-row-left">
                                        <div class="item-row-title">${sp.name} (${sp.school})</div>
                                        <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration} ${sp.concentration ? "• Concentration" : ""}</div>
                                        <div class="item-row-desc">${sp.description}</div>
                                    </div>
                                    <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    private renderStep9Review(): string {
        const species = SPECIES_2024.find((s) => s.id === this.state.speciesId)?.name || "";
        const cls = CLASSES_2024.find((c) => c.id === this.state.classId)?.name || "";
        const bg = BACKGROUNDS_2024.find((b) => b.id === this.state.backgroundId)?.name || "";
        const feat = ORIGIN_FEATS_2024.find((f) => f.id === this.state.originFeatId)?.name || "";

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Review & Finalize Character</h3>
                    <p class="panel-desc">Inspect your completed character profile before saving to the database.</p>
                </div>

                <div class="review-card-layout">
                    <div class="review-section">
                        <h4>Hero Overview</h4>
                        <div class="review-row"><span class="label">Name:</span><strong>${this.state.name}</strong></div>
                        <div class="review-row"><span class="label">Class & Level:</span><strong>${cls} (Level ${this.state.level})</strong></div>
                        <div class="review-row"><span class="label">Species:</span><strong>${species}</strong></div>
                        <div class="review-row"><span class="label">Background:</span><strong>${bg}</strong></div>
                        <div class="review-row"><span class="label">Origin Feat:</span><strong>${feat}</strong></div>
                        <div class="review-row"><span class="label">Alignment:</span><strong>${this.state.alignment}</strong></div>
                        <div class="review-row"><span class="label">Armor & Shield:</span><strong>${this.state.selectedArmor} ${this.state.hasShield ? "+ Shield" : ""}</strong></div>
                        <div class="review-row"><span class="label">Mastered Weapons:</span><strong>${this.state.weaponMasteries.join(", ") || "None"}</strong></div>
                    </div>

                    <div class="review-section">
                        <h4>Combat Vitals</h4>
                        <div class="review-row"><span class="label">Hit Points:</span><strong>${this.getMaxHp()} Max HP</strong></div>
                        <div class="review-row"><span class="label">Armor Class:</span><strong>${this.getArmorClass()} AC</strong></div>
                        <div class="review-row"><span class="label">Initiative:</span><strong>${(this.getInitiative() >= 0 ? "+" : "") + this.getInitiative()}</strong></div>
                        <div class="review-row"><span class="label">Speed:</span><strong>${this.getSpeed()} ft.</strong></div>
                        <div class="review-row"><span class="label">Proficiency Bonus:</span><strong>+${this.getProficiencyBonus()}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }

    private attachStepEvents(step: number) {
        if (step === 1) {
            const nameInput = document.getElementById("char-name-input") as HTMLInputElement;
            nameInput?.addEventListener("input", (e) => {
                this.state.name = (e.target as HTMLInputElement).value;
                this.updateLiveSummary();
            });

            const levelInput = document.getElementById("char-level-input") as HTMLInputElement;
            levelInput?.addEventListener("input", (e) => {
                const val = Math.max(1, Math.min(20, Number((e.target as HTMLInputElement).value) || 1));
                this.state.level = val;
                this.updateLiveSummary();
            });

            const alignSelect = document.getElementById("char-alignment-select") as HTMLSelectElement;
            alignSelect?.addEventListener("change", (e) => {
                this.state.alignment = (e.target as HTMLSelectElement).value;
            });

            const genderInput = document.getElementById("char-gender-input") as HTMLInputElement;
            genderInput?.addEventListener("input", (e) => {
                this.state.gender = (e.target as HTMLInputElement).value;
            });

            const avatarInput = document.getElementById("char-avatar-input") as HTMLInputElement;
            const previewImg = document.getElementById("char-avatar-preview-img") as HTMLImageElement;
            const uploadBtn = document.getElementById("char-avatar-upload-btn") as HTMLButtonElement;
            const fileInput = document.getElementById("char-avatar-file-input") as HTMLInputElement;
            const uploadStatus = document.getElementById("char-avatar-upload-status");

            avatarInput?.addEventListener("input", (e) => {
                const url = (e.target as HTMLInputElement).value.trim();
                this.state.avatarUrl = url || "/storage/images/default-avatar.png";
                if (previewImg) previewImg.src = this.state.avatarUrl;
                this.updateLiveSummary();
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
                    uploadStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${this.escape(file.name)}...`;
                }

                try {
                    const filePath = await FileService.uploadFile(file, "avatars");
                    this.state.avatarUrl = filePath;
                    if (avatarInput) avatarInput.value = filePath;
                    if (previewImg) previewImg.src = filePath;
                    if (uploadStatus) {
                        uploadStatus.className = "creator-upload-status is-success";
                        uploadStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Uploaded successfully!`;
                    }
                    this.updateLiveSummary();
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
        } else if (step === 2) {
            document.querySelectorAll(".species-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const spId = card.getAttribute("data-species-id") || "";
                    this.state.speciesId = spId;
                    const sp = SPECIES_2024.find((s) => s.id === spId);
                    this.state.lineageId = sp?.lineages?.[0]?.id || "";
                    this.renderStep(2);
                    this.updateLiveSummary();
                });
            });

            document.querySelectorAll(".lineage-card").forEach((card) => {
                card.addEventListener("click", () => {
                    this.state.lineageId = card.getAttribute("data-lineage-id") || "";
                    this.renderStep(2);
                    this.updateLiveSummary();
                });
            });

            const humanSkill = document.getElementById("human-skill-select") as HTMLSelectElement;
            humanSkill?.addEventListener("change", (e) => {
                this.state.humanExtraSkill = (e.target as HTMLSelectElement).value;
            });

            const humanFeat = document.getElementById("human-feat-select") as HTMLSelectElement;
            humanFeat?.addEventListener("change", (e) => {
                this.state.humanExtraFeatId = (e.target as HTMLSelectElement).value;
                this.updateLiveSummary();
            });
        } else if (step === 3) {
            document.querySelectorAll(".class-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const cId = card.getAttribute("data-class-id") || "";
                    this.state.classId = cId;
                    const cls = CLASSES_2024.find((c) => c.id === cId);
                    this.state.subclassId = cls?.subclasses?.[0]?.id || "";
                    this.state.weaponMasteries = [];
                    if (cls) {
                        this.initClassDefaultEquipment(cls);
                    }
                    this.renderStep(3);
                    this.updateLiveSummary();
                });
            });

            document.querySelectorAll(".subclass-card").forEach((card) => {
                card.addEventListener("click", () => {
                    this.state.subclassId = card.getAttribute("data-subclass-id") || "";
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".mastery-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const wName = card.getAttribute("data-weapon-name") || "";
                    const cls = CLASSES_2024.find((c) => c.id === this.state.classId);
                    const maxM = cls?.weaponMasteryCount || 0;
                    if (this.state.weaponMasteries.includes(wName)) {
                        this.state.weaponMasteries = this.state.weaponMasteries.filter((w) => w !== wName);
                    } else if (this.state.weaponMasteries.length < maxM) {
                        this.state.weaponMasteries.push(wName);
                    }
                    this.renderStep(3);
                });
            });
        } else if (step === 4) {
            document.querySelectorAll(".background-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const bgId = card.getAttribute("data-background-id") || "";
                    this.state.backgroundId = bgId;
                    const bg = BACKGROUNDS_2024.find((b) => b.id === bgId);
                    if (bg) {
                        this.state.originFeatId = bg.originFeatId;
                        this.state.bgStatA = bg.allowedAbilities[0];
                        this.state.bgStatB = bg.allowedAbilities[1];
                        this.state.bgStatC = bg.allowedAbilities[2] || bg.allowedAbilities[0];
                    }
                    this.renderStep(4);
                    this.updateLiveSummary();
                });
            });

            document.querySelectorAll("input[name='bg-option']").forEach((radio) => {
                radio.addEventListener("change", (e) => {
                    this.state.backgroundOption = (e.target as HTMLInputElement).value as any;
                    this.renderStep(4);
                    this.updateLiveSummary();
                });
            });

            const statA = document.getElementById("bg-stat-a") as HTMLSelectElement;
            statA?.addEventListener("change", (e) => {
                this.state.bgStatA = (e.target as HTMLSelectElement).value as AbilityName;
                this.renderStep(4);
                this.updateLiveSummary();
            });

            const statB = document.getElementById("bg-stat-b") as HTMLSelectElement;
            statB?.addEventListener("change", (e) => {
                this.state.bgStatB = (e.target as HTMLSelectElement).value as AbilityName;
                this.renderStep(4);
                this.updateLiveSummary();
            });
        } else if (step === 5) {
            document.querySelectorAll(".tab-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const newMode = btn.getAttribute("data-mode") as any;
                    this.state.abilityMode = newMode;
                    if (newMode === "standard") {
                        const currentValues = Object.values(this.state.baseAbilities).slice().sort((a, b) => b - a);
                        const isMatch = CharacterCreatorController.STANDARD_ARRAY.every((v, i) => currentValues[i] === v);
                        if (!isMatch) {
                            this.state.baseAbilities = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
                        }
                    } else if (newMode === "pointbuy") {
                        const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
                        const allInRange = stats.every((st) => this.state.baseAbilities[st] >= 8 && this.state.baseAbilities[st] <= 15);
                        if (!allInRange || this.getSpentPoints() > 27) {
                            this.state.baseAbilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
                        }
                    }
                    this.renderStep(5);
                    this.updateLiveSummary();
                });
            });

            // Standard array selection: swapping values without editing
            document.querySelectorAll(".standard-array-select").forEach((select) => {
                select.addEventListener("change", (e) => {
                    const stat = (e.target as HTMLSelectElement).getAttribute("data-stat") as AbilityName;
                    const val = Number((e.target as HTMLSelectElement).value);
                    if (stat && val) {
                        this.setStandardArrayScore(stat, val);
                        this.renderStep(5);
                        this.updateLiveSummary();
                    }
                });
            });

            // Point buy decrement
            document.querySelectorAll(".point-buy-dec-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const stat = btn.getAttribute("data-stat") as AbilityName;
                    if (stat && this.decrementPointBuy(stat)) {
                        this.renderStep(5);
                        this.updateLiveSummary();
                    }
                });
            });

            // Point buy increment
            document.querySelectorAll(".point-buy-inc-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const stat = btn.getAttribute("data-stat") as AbilityName;
                    if (stat && this.incrementPointBuy(stat)) {
                        this.renderStep(5);
                        this.updateLiveSummary();
                    }
                });
            });

            // Manual / Roll score controls
            document.querySelectorAll(".score-dec-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const stat = btn.getAttribute("data-stat") as AbilityName;
                    if (stat && this.state.baseAbilities[stat] > 3) {
                        this.state.baseAbilities[stat]--;
                        this.renderStep(5);
                        this.updateLiveSummary();
                    }
                });
            });

            document.querySelectorAll(".score-inc-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const stat = btn.getAttribute("data-stat") as AbilityName;
                    if (stat && this.state.baseAbilities[stat] < 20) {
                        this.state.baseAbilities[stat]++;
                        this.renderStep(5);
                        this.updateLiveSummary();
                    }
                });
            });

            document.querySelectorAll(".score-num-input").forEach((input) => {
                input.addEventListener("input", (e) => {
                    const stat = (e.target as HTMLElement).getAttribute("data-stat") as AbilityName;
                    const val = Math.max(3, Math.min(20, Number((e.target as HTMLInputElement).value) || 10));
                    if (stat) {
                        this.state.baseAbilities[stat] = val;
                        this.updateLiveSummary();
                    }
                });
            });

            const rollBtn = document.getElementById("roll-all-stats-btn");
            rollBtn?.addEventListener("click", () => {
                const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
                for (const st of stats) {
                    const rolls = [
                        Math.floor(Math.random() * 6) + 1,
                        Math.floor(Math.random() * 6) + 1,
                        Math.floor(Math.random() * 6) + 1,
                        Math.floor(Math.random() * 6) + 1
                    ];
                    rolls.sort((a, b) => a - b);
                    const total = rolls[1] + rolls[2] + rolls[3];
                    this.state.baseAbilities[st] = total;
                }
                this.renderStep(5);
                this.updateLiveSummary();
            });
        } else if (step === 6) {
            document.querySelectorAll(".skill-checkbox-card:not(.locked)").forEach((card) => {
                card.addEventListener("click", () => {
                    const skName = card.getAttribute("data-skill-name") || "";
                    const cls = CLASSES_2024.find((c) => c.id === this.state.classId);
                    const maxCount = cls?.skillChoices.count || 2;
                    if (this.state.classSkills.includes(skName)) {
                        this.state.classSkills = this.state.classSkills.filter((s) => s !== skName);
                    } else if (this.state.classSkills.length < maxCount) {
                        this.state.classSkills.push(skName);
                    }
                    this.renderStep(6);
                });
            });
        } else if (step === 7) {
            // Equip starting equipment package buttons
            document.querySelectorAll(".equip-package-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const idx = Number(btn.getAttribute("data-package-index"));
                    const cls = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
                    const opt = cls.startingEquipmentOptions[idx];
                    if (opt) {
                        const foundArmor = BASE_ARMOR_2024.find((a) =>
                            opt.items.some((it) => it.toLowerCase().includes(a.name.toLowerCase()))
                        );
                        if (foundArmor) {
                            this.state.selectedArmor = foundArmor.name;
                        } else if (opt.items.some((it) => it.toLowerCase().includes("leather armor"))) {
                            this.state.selectedArmor = "Leather Armor";
                        } else if (cls.armorProficiencies.length === 0) {
                            this.state.selectedArmor = "None";
                        }
                        this.state.hasShield = opt.items.some((it) => it.toLowerCase().includes("shield"));
                        const matchedWeapons = BASE_WEAPONS_2024.filter((w) =>
                            opt.items.some((it) => it.toLowerCase().includes(w.name.toLowerCase()))
                        ).map((w) => w.name);
                        if (matchedWeapons.length > 0) {
                            this.state.selectedWeapons = matchedWeapons;
                        }
                        this.renderStep(7);
                        this.updateLiveSummary();
                    }
                });
            });

            const armorSelect = document.getElementById("char-armor-select") as HTMLSelectElement;
            armorSelect?.addEventListener("change", (e) => {
                this.state.selectedArmor = (e.target as HTMLSelectElement).value;
                this.renderStep(7);
                this.updateLiveSummary();
            });

            const shieldCheck = document.getElementById("char-shield-checkbox") as HTMLInputElement;
            shieldCheck?.addEventListener("change", (e) => {
                this.state.hasShield = (e.target as HTMLInputElement).checked;
                this.renderStep(7);
                this.updateLiveSummary();
            });

            document.querySelectorAll(".weapon-row").forEach((row) => {
                row.addEventListener("click", () => {
                    const wName = row.getAttribute("data-weapon-name") || "";
                    if (this.state.selectedWeapons.includes(wName)) {
                        this.state.selectedWeapons = this.state.selectedWeapons.filter((w) => w !== wName);
                    } else {
                        this.state.selectedWeapons.push(wName);
                    }
                    this.renderStep(7);
                });
            });
        } else if (step === 8) {
            document.querySelectorAll(".cantrip-row").forEach((row) => {
                row.addEventListener("click", () => {
                    const spName = row.getAttribute("data-spell-name") || "";
                    if (this.state.selectedCantrips.includes(spName)) {
                        this.state.selectedCantrips = this.state.selectedCantrips.filter((s) => s !== spName);
                    } else {
                        this.state.selectedCantrips.push(spName);
                    }
                    this.renderStep(8);
                });
            });

            document.querySelectorAll(".spell1-row").forEach((row) => {
                row.addEventListener("click", () => {
                    const spName = row.getAttribute("data-spell-name") || "";
                    if (this.state.selectedSpellsLevel1.includes(spName)) {
                        this.state.selectedSpellsLevel1 = this.state.selectedSpellsLevel1.filter((s) => s !== spName);
                    } else {
                        this.state.selectedSpellsLevel1.push(spName);
                    }
                    this.renderStep(8);
                });
            });
        }
    }

    // Submission to API
    public async submitCharacter() {
        if (!this.state.name.trim()) {
            this.goToStep(1);
            this.showAlert("Please enter a character name.");
            return;
        }

        const submitBtn = document.getElementById("creator-submit-btn") as HTMLButtonElement;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating...`;
        }

        try {
            const cls = CLASSES_2024.find((c) => c.id === this.state.classId) || CLASSES_2024[0];
            const species = SPECIES_2024.find((s) => s.id === this.state.speciesId) || SPECIES_2024[0];
            const bg = BACKGROUNDS_2024.find((b) => b.id === this.state.backgroundId) || BACKGROUNDS_2024[0];
            const pb = this.getProficiencyBonus();

            const abilityNames: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
            const abilityTitles: Record<AbilityName, string> = {
                str: "Strength", dex: "Dexterity", con: "Constitution",
                int: "Intelligence", wis: "Wisdom", cha: "Charisma"
            };

            const abilitiesPayload = abilityNames.map((st) => {
                const total = this.getEffectiveAbilityScore(st);
                const mod = this.getAbilityModifier(st);
                const isProfSave = cls.savingThrows.includes(st);
                return {
                    name: abilityTitles[st],
                    abbr: st.toUpperCase(),
                    score: total,
                    baseScore: this.state.baseAbilities[st],
                    bonus: total - this.state.baseAbilities[st],
                    modifier: mod,
                    save: mod + (isProfSave ? pb : 0),
                    proficientSave: isProfSave
                };
            });

            // Skills
            const bgSkills = bg.skills;
            const humanExtra = this.state.speciesId === "human" ? [this.state.humanExtraSkill] : [];
            const allProfSkills = Array.from(new Set([...this.state.classSkills, ...bgSkills, ...humanExtra]));

            const skillsPayload = ALL_SKILLS.map((sk) => {
                const isProf = allProfSkills.includes(sk.name);
                const isExpert = this.state.expertiseSkills.includes(sk.name);
                const mod = this.getAbilityModifier(sk.stat);
                const bonus = mod + (isExpert ? 2 * pb : isProf ? pb : 0);
                return {
                    name: sk.name,
                    stat: sk.stat.toUpperCase(),
                    bonus,
                    proficiency: isExpert ? "expertise" : isProf ? "proficient" : "none"
                };
            });

            // Weapons
            const weaponsPayload = this.state.selectedWeapons.map((wName) => {
                const baseW = BASE_WEAPONS_2024.find((b) => b.name === wName);
                const isFinesse = baseW?.properties.some((p) => p.includes("Finesse"));
                const isRanged = baseW?.category.includes("Ranged");
                const statToUse: AbilityName = (isRanged || (isFinesse && this.getAbilityModifier("dex") > this.getAbilityModifier("str"))) ? "dex" : "str";
                const attackMod = this.getAbilityModifier(statToUse) + pb;
                const damageMod = this.getAbilityModifier(statToUse);
                const masteryUnlocked = this.state.weaponMasteries.includes(wName);

                return {
                    name: wName,
                    quantity: 1,
                    equipped: true,
                    category: baseW?.category || "Simple Melee",
                    damage: `${baseW?.damageDie || "1d6"} + ${damageMod} ${baseW?.damageType || "Slashing"}`,
                    damageType: baseW?.damageType || "Slashing",
                    damageDie: baseW?.damageDie || "1d6",
                    attackBonus: (attackMod >= 0 ? "+" : "") + attackMod,
                    toHitModifier: attackMod,
                    range: baseW?.range || "5 ft.",
                    properties: baseW?.properties || [],
                    mastery: {
                        name: baseW?.mastery || "Vex",
                        description: WEAPON_MASTERIES.find((m) => m.name === baseW?.mastery)?.description,
                        unlocked: masteryUnlocked
                    }
                };
            });

            // Equipment (Armor + Shield + Starter gear)
            const equipmentPayload: any[] = [];
            if (this.state.selectedArmor && this.state.selectedArmor !== "None") {
                const armorDef = BASE_ARMOR_2024.find((a) => a.name === this.state.selectedArmor);
                equipmentPayload.push({
                    name: this.state.selectedArmor,
                    quantity: 1,
                    equipped: true,
                    type: "Armor",
                    filterType: "Armor",
                    description: armorDef ? `${armorDef.category} Armor, AC ${armorDef.baseAc}` : ""
                });
            }
            if (this.state.hasShield) {
                equipmentPayload.push({
                    name: "Shield",
                    quantity: 1,
                    equipped: true,
                    type: "Shield",
                    filterType: "Armor",
                    description: "Shield (+2 AC)"
                });
            }
            // Add backpack / adventuring gear
            equipmentPayload.push({
                name: "Explorer's Pack",
                quantity: 1,
                equipped: false,
                type: "Gear",
                description: "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft rope."
            });

            // Spells
            const spellsPayload: any[] = [];
            for (const spName of [...this.state.selectedCantrips, ...this.state.selectedSpellsLevel1]) {
                const spDef = SPELLS_2024.find((s) => s.name === spName);
                if (spDef) {
                    spellsPayload.push({
                        name: spDef.name,
                        level: spDef.level,
                        school: spDef.school,
                        source: "Class",
                        prepared: true,
                        castingTime: spDef.castingTime,
                        range: spDef.range,
                        duration: spDef.duration,
                        components: spDef.components,
                        concentration: spDef.concentration,
                        ritual: spDef.ritual,
                        description: spDef.description
                    });
                }
            }

            // Features (Species traits + Class Level 1 features + Origin Feat)
            const featuresPayload: any[] = [];
            species.traits.forEach((t) => {
                featuresPayload.push({
                    name: t.name,
                    source: species.name,
                    type: "Species",
                    description: t.description
                });
            });
            cls.features.filter((f) => f.level <= this.state.level).forEach((f) => {
                featuresPayload.push({
                    name: f.name,
                    source: cls.name,
                    type: "Class",
                    description: f.description
                });
            });
            const originFeat = ORIGIN_FEATS_2024.find((f) => f.id === this.state.originFeatId);
            if (originFeat) {
                featuresPayload.push({
                    name: originFeat.name,
                    source: "Background",
                    type: "Feat",
                    description: originFeat.benefits.join(" ")
                });
            }

            // Class Resources
            const resourcesPayload: any[] = [];
            if (cls.id === "barbarian") {
                resourcesPayload.push({ name: "Rage", total: 2, resetOn: "long", currentUsed: 0 });
            } else if (cls.id === "bard") {
                resourcesPayload.push({ name: "Bardic Inspiration", total: Math.max(1, this.getAbilityModifier("cha")), resetOn: "long", dieOrType: "d6", currentUsed: 0 });
            } else if (cls.id === "cleric") {
                resourcesPayload.push({ name: "Channel Divinity", total: 2, resetOn: "short", currentUsed: 0 });
            } else if (cls.id === "druid") {
                resourcesPayload.push({ name: "Wild Shape", total: 2, resetOn: "short", currentUsed: 0 });
            } else if (cls.id === "fighter") {
                resourcesPayload.push({ name: "Second Wind", total: 2, resetOn: "short", dieOrType: "1d10", currentUsed: 0 });
            } else if (cls.id === "monk") {
                resourcesPayload.push({ name: "Focus Points", total: this.state.level, resetOn: "short", currentUsed: 0 });
            } else if (cls.id === "paladin") {
                resourcesPayload.push({ name: "Lay on Hands", total: 5 * this.state.level, resetOn: "long", currentUsed: 0 });
            } else if (cls.id === "sorcerer") {
                resourcesPayload.push({ name: "Innate Sorcery", total: 2, resetOn: "long", currentUsed: 0 });
            }

            // Passive scores
            const percSkill = skillsPayload.find((s) => s.name === "Perception");
            const invSkill = skillsPayload.find((s) => s.name === "Investigation");
            const insSkill = skillsPayload.find((s) => s.name === "Insight");

            const maxHp = this.getMaxHp();
            const characterPayload: any = {
                name: this.state.name,
                subtitle: `Level ${this.state.level} ${species.name} ${cls.name}`,
                level: this.state.level,
                race: species.name,
                species: species.name,
                background: bg.name,
                alignment: this.state.alignment,
                avatarUrl: this.state.avatarUrl,
                source: "site",
                classes: [{
                    name: cls.name,
                    level: this.state.level,
                    subclass: this.state.subclassId ? cls.subclasses.find((s) => s.id === this.state.subclassId)?.name : undefined
                }],
                vitals: {
                    currentHp: maxHp,
                    maxHp: maxHp,
                    tempHp: 0,
                    armorClass: this.getArmorClass(),
                    initiative: this.getInitiative(),
                    speed: `${this.getSpeed()} ft.`,
                    proficiencyBonus: pb,
                    passivePerception: 10 + (percSkill?.bonus || 0),
                    passiveInvestigation: 10 + (invSkill?.bonus || 0),
                    passiveInsight: 10 + (insSkill?.bonus || 0),
                    darkvision: species.darkvision || "None",
                    hitDice: `1d${cls.hitDie}`,
                    heroicInspiration: false,
                    spellSaveDc: cls.spellcasting ? 8 + pb + this.getAbilityModifier(cls.spellcasting.ability) : 10,
                    spellAttackBonus: cls.spellcasting ? pb + this.getAbilityModifier(cls.spellcasting.ability) : 0,
                    spellcastingAbility: cls.spellcasting ? cls.spellcasting.ability : "none",
                    deathSaves: { successes: 0, failures: 0, isStable: false }
                },
                abilities: abilitiesPayload,
                skills: skillsPayload,
                weapons: weaponsPayload,
                equipment: equipmentPayload,
                spells: spellsPayload,
                features: featuresPayload,
                classResources: resourcesPayload,
                spellSlots: cls.spellcasting ? {
                    level1: { total: 2, label: "1st Level" }
                } : {}
            };

            const response = await postData<any>("/save-character", {
                name: this.state.name,
                source: "site",
                character: characterPayload
            });

            if (response && response.savedCharacter?.siteCharacterId) {
                window.location.href = `/character-sheet/${response.savedCharacter.siteCharacterId}`;
            } else if (response && response.character?.siteCharacterId) {
                window.location.href = `/character-sheet/${response.character.siteCharacterId}`;
            } else {
                window.location.href = "/character-sheet";
            }
        } catch (err: any) {
            console.error("Error creating character:", err);
            this.showAlert("Failed to save character. Please verify your connection or login status.");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Create Character`;
            }
        }
    }

    private escape(str: string): string {
        return (str || "").replace(/"/g, "&quot;");
    }
}

export default function characterCreator(query?: any) {
    const ctrl = new CharacterCreatorController();
    ctrl.init(query);
    return ctrl;
}
