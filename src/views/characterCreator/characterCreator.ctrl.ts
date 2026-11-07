import el from "@elements";
import FileService from "@services/fileService";
import { getData, postData, putData } from "@services/request";
import {
    AbilityName,
    BACKGROUNDS_2024,
    BARBARIAN_ASPECTS,
    BASE_ARMOR_2024,
    BASE_WEAPONS_2024,
    BATTLE_MASTER_MANEUVERS,
    BackgroundDefinition,
    BLESSED_STRIKES_OPTIONS,
    BRUTAL_STRIKE_OPTIONS,
    CLASS_SPELL_PRIORITIES,
    CLASSES_2024,
    ClassDefinition,
    ClassLevelFeature,
    DIVINE_ORDERS,
    DRACONIC_ANCESTOR_ELEMENTS,
    DRUID_LAND_BIOMES,
    ELDRITCH_INVOCATIONS,
    ELEMENTAL_FURY_OPTIONS,
    ELEMENTS_ATTUNEMENT_DAMAGE_TYPES,
    FIENDISH_RESILIENCE_DAMAGE_TYPES,
    FIGHTING_STYLES,
    GENERAL_FEATS_2024,
    GeneralFeatDefinition,
    HUNTER_DEFENSIVE_TACTICS,
    HUNTER_PREY_OPTIONS,
    METAMAGIC_OPTIONS,
    ORIGIN_FEATS_2024,
    OriginFeatDefinition,
    PRIMAL_COMPANION_TYPES,
    PRIMAL_ORDERS,
    ROGUE_CUNNING_STRIKES,
    ROGUE_DEVIOUS_STRIKES,
    RuleSpellDefinition,
    SPECIES_2024,
    SpeciesDefinition,
    SPELLS_2024,
    TACTICAL_MASTER_PROPERTIES,
    WEAPON_MASTERIES,
    WILD_HEART_RAGES,
    WILD_HEART_TOTEMIC_ATTUNEMENTS,
    WIZARD_SCHOLAR_SKILLS,
    ZEALOT_DIVINE_FURIES,
    STARRY_FORM_CONSTELLATIONS,
    COSMIC_OMEN_OPTIONS,
    SEA_WRATH_DAMAGE_TYPES,
    MOON_CIRCLE_FORMS_STRIKES,
    DIVINER_THIRD_EYE_OPTIONS,
    CHAMPION_ADDITIONAL_FIGHTING_STYLES,
    STUDENT_OF_WAR_SKILLS,
    PSI_WARRIOR_THRUST_OPTIONS,
    BATTERING_ROOTS_OPTIONS,
    IMPROVED_BRUTAL_STRIKE_OPTIONS,
    OPEN_HAND_TECHNIQUES,
    WAR_GOD_BLESSING_OPTIONS,
    STEPS_OF_THE_FEY_OPTIONS,
    FEY_WANDERER_GLAMOUR_SKILLS,
    HUNTER_SUPERIOR_DEFENSE_OPTIONS,
    ABERRANT_REVELATION_OPTIONS
} from "../../rules/dnd5e_2024";

export interface AsiChoice {
    type: "single" | "dual" | "feat";
    statA?: AbilityName;
    statB?: AbilityName;
    featId?: string;
}

export interface CreatorState {
    currentStep: number;
    savedId?: number;
    siteCharacterId?: string;
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
    // Class-specific progression choices:
    fightingStyle?: string;
    divineOrder?: string;
    primalOrder?: string;
    metamagic: string[];
    invocations: string[];
    maneuvers: string[];
    subclassFeatureChoices: Record<string, string>;
    backgroundId: string;
    backgroundOption: "two-and-one" | "three-ones";
    bgStatA: AbilityName;
    bgStatB: AbilityName;
    bgStatC: AbilityName;
    bgTool: string;
    originFeatId: string;
    abilityMode: "standard" | "pointbuy" | "roll" | "manual";
    baseAbilities: Record<AbilityName, number>;
    asiChoices: Record<number, AsiChoice>;
    classSkills: string[];
    expertiseSkills: string[];
    selectedWeapons: string[];
    selectedArmor: string;
    hasShield: boolean;
    equippedKitIndex?: number;
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
        asiChoices: {},
        fightingStyle: "defense",
        divineOrder: "protector",
        primalOrder: "warden",
        metamagic: [],
        invocations: [],
        maneuvers: [],
        subclassFeatureChoices: {
            "wizard-2-scholar": "arcana",
            "barbarian-3-wild-heart": "bear",
            "barbarian-3-zealot": "radiant",
            "monk-3-elements": "fire",
            "monk-3-open-hand": "addle",
            "ranger-3-hunter": "colossus-slayer",
            "ranger-3-beast-master": "land",
            "ranger-3-fey-wanderer": "Deception",
            "sorcerer-3-draconic": "gold",
            "warlock-3-archfey": "taunting-step",
            "druid-3-stars": "archer",
            "druid-3-sea": "cold",
            "druid-3-moon": "radiant",
            "fighter-3-battle-master-student": "History",
            "rogue-5-cunning-strike": "trip",
            "druid-6-land": "arid",
            "druid-6-stars": "weal",
            "cleric-6-war": "shield-of-faith",
            "barbarian-6-wild-heart": "elephant",
            "ranger-6-hunter": "multiattack-defense",
            "druid-7": "potent-spellcasting",
            "cleric-7": "potent-spellcasting",
            "fighter-7-champion": "defense",
            "fighter-7-psi-warrior": "push",
            "barbarian-9-brutal-strike": "forceful-blow",
            "fighter-9-tactical-master": "push",
            "barbarian-10-world-tree": "push",
            "warlock-10-fiend": "fire",
            "wizard-10-diviner": "darkvision",
            "barbarian-13-brutal-strike": "staggering-blow",
            "barbarian-14-wild-heart": "falcon",
            "rogue-14-devious-strike": "knock-out",
            "sorcerer-14-aberrant": "flight",
            "ranger-15-hunter": "evasion"
        },
        classSkills: ["Athletics", "Perception"],
        expertiseSkills: [],
        selectedWeapons: ["Longsword", "Light Crossbow"],
        selectedArmor: "Chain Mail",
        hasShield: true,
        equippedKitIndex: 0,
        selectedCantrips: [],
        selectedSpellsLevel1: []
    };

    public classes: ClassDefinition[] = [...CLASSES_2024];
    public species: SpeciesDefinition[] = [...SPECIES_2024];
    public backgrounds: BackgroundDefinition[] = [...BACKGROUNDS_2024];
    public originFeats: OriginFeatDefinition[] = [...ORIGIN_FEATS_2024];
    public generalFeats: GeneralFeatDefinition[] = [...GENERAL_FEATS_2024];

    public activeSpellLevelFilter: number | "all" = "all";
    public spellSearchQuery: string = "";
    public progressionExpanded: boolean = false;
    public progressionFilter: "all" | "unlocked" = "all";
    public spellsWarningDismissed: boolean = false;

    public async init(query?: any) {
        this.bindEvents();
        try {
            const rules = await getData<any>("/get-rules");
            if (rules) {
                if (Array.isArray(rules.classes) && rules.classes.length > 0) {
                    this.classes = rules.classes.map((rc: any) => {
                        const fallbackCls = CLASSES_2024.find((c) => c.id === rc.id || c.name === rc.name);
                        const rawSubs =
                            Array.isArray(rc.subclasses) && rc.subclasses.length > 0
                                ? rc.subclasses
                                : (fallbackCls?.subclasses || []);
                        const enrichedSubs = rawSubs.map((sub: any) => {
                            const fallbackSub = fallbackCls?.subclasses?.find(
                                (s) => s.id === sub.id || s.name === sub.name
                            );
                            return {
                                ...sub,
                                features:
                                    Array.isArray(sub.features) && sub.features.length > 0
                                        ? sub.features
                                        : (fallbackSub?.features || [])
                            };
                        });
                        return {
                            ...rc,
                            features:
                                fallbackCls?.features && fallbackCls.features.length > 0
                                    ? fallbackCls.features
                                    : (rc.features || []),
                            subclasses: enrichedSubs
                        };
                    });
                }
                if (Array.isArray(rules.species) && rules.species.length > 0) this.species = rules.species;
                if (Array.isArray(rules.backgrounds) && rules.backgrounds.length > 0) this.backgrounds = rules.backgrounds;
                if (Array.isArray(rules.originFeats) && rules.originFeats.length > 0) this.originFeats = rules.originFeats;
                if (Array.isArray(rules.generalFeats) && rules.generalFeats.length > 0) this.generalFeats = rules.generalFeats;
            }
        } catch (e) {
            console.warn("Using offline / fallback rules:", e);
        }
        const targetId = query?.id || query?.savedId || query?.characterId || query?.siteCharacterId;
        if (targetId) {
            await this.loadCharacter(targetId);
        }
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

    public showAlert(msg: string, type: "error" | "warning" = "error") {
        const alertBox = document.getElementById("creator-validation-alert");
        if (alertBox) {
            alertBox.innerHTML = `${type === "warning" ? '<i class="fa-solid fa-triangle-exclamation"></i> ' : '<i class="fa-solid fa-circle-exclamation"></i> '}${msg}`;
            alertBox.classList.remove("hidden");
            alertBox.classList.toggle("warning", type === "warning");
        }
    }

    public hideAlert() {
        const alertBox = document.getElementById("creator-validation-alert");
        if (alertBox) {
            alertBox.textContent = "";
            alertBox.classList.add("hidden");
            alertBox.classList.remove("warning");
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
            case 8: {
                const maxCantrips = this.getMaxCantrips();
                const maxPrepared = this.getMaxPreparedSpells();
                const hasSpellcasting = maxCantrips > 0 || maxPrepared > 0;

                if (hasSpellcasting && !this.spellsWarningDismissed) {
                    const cantripCount = this.state.selectedCantrips.length;
                    const spellCount = this.state.selectedSpellsLevel1.length;
                    const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
                    const className = cls?.name || "Spellcaster";

                    if (cantripCount === 0 && spellCount === 0) {
                        this.showAlert(
                            `Warning: As a ${className}, your class uses spells, but you haven't selected any spells. Click Next again to proceed without spells, or choose your spells below.`,
                            "warning"
                        );
                        this.spellsWarningDismissed = true;
                        return false;
                    } else if (maxPrepared > 0 && spellCount === 0) {
                        this.showAlert(
                            `Warning: As a ${className}, you can prepare up to ${maxPrepared} spells, but haven't selected any. Click Next again to proceed, or choose your spells below.`,
                            "warning"
                        );
                        this.spellsWarningDismissed = true;
                        return false;
                    } else if (maxCantrips > 0 && cantripCount === 0) {
                        this.showAlert(
                            `Warning: As a ${className}, you can select up to ${maxCantrips} cantrips, but haven't selected any. Click Next again to proceed, or choose your cantrips below.`,
                            "warning"
                        );
                        this.spellsWarningDismissed = true;
                        return false;
                    }
                }
                this.spellsWarningDismissed = false;
                return true;
            }
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
        this.spellsWarningDismissed = false;
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

        this.renderStep(step, false);
        this.updateLiveSummary();
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
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

    public getAsiLevels(): number[] {
        const lvls = [4, 8, 12, 16, 19];
        if (this.state.classId === "fighter") {
            lvls.push(6, 14);
        } else if (this.state.classId === "rogue") {
            lvls.push(10);
        }
        return lvls.sort((a, b) => a - b).filter((l) => l <= this.state.level);
    }

    public ensureAsiChoices(): void {
        const asiLevels = this.getAsiLevels();
        if (!this.state.asiChoices) this.state.asiChoices = {};
        for (const lvl of asiLevels) {
            if (!this.state.asiChoices[lvl]) {
                const cls = this.classes.find((c) => c.id === this.state.classId);
                const defaultStat: AbilityName = cls?.savingThrows[0] || "str";
                this.state.asiChoices[lvl] = {
                    type: "single",
                    statA: defaultStat
                };
            }
        }
    }

    public getMaxMetamagicCount(): number {
        if (this.state.classId !== "sorcerer" || this.state.level < 2) return 0;
        if (this.state.level >= 17) return 4;
        if (this.state.level >= 10) return 3;
        return 2;
    }

    public getMaxInvocationsCount(): number {
        if (this.state.classId !== "warlock") return 0;
        const lvl = this.state.level;
        if (lvl >= 18) return 10;
        if (lvl >= 15) return 9;
        if (lvl >= 12) return 8;
        if (lvl >= 9) return 7;
        if (lvl >= 7) return 6;
        if (lvl >= 5) return 5;
        if (lvl >= 2) return 3;
        return 1;
    }

    public getMaxManeuversCount(): number {
        if (this.state.classId !== "fighter" || this.state.subclassId !== "battle-master" || this.state.level < 3) return 0;
        const lvl = this.state.level;
        if (lvl >= 15) return 9;
        if (lvl >= 10) return 7;
        if (lvl >= 7) return 5;
        return 3;
    }

    public getMaxExpertiseCount(): number {
        const { classId, level } = this.state;
        if (classId === "rogue") {
            return level >= 6 ? 4 : 2;
        }
        if (classId === "bard") {
            if (level >= 9) return 4;
            if (level >= 2) return 2;
            return 0;
        }
        if (classId === "ranger") {
            if (level >= 9) return 2;
            if (level >= 2) return 1;
            return 0;
        }
        return 0;
    }

    public async loadCharacter(targetId: string | number) {
        try {
            const queryParam = typeof targetId === "number" || /^\d+$/.test(String(targetId))
                ? `id=${targetId}`
                : `siteCharacterId=${encodeURIComponent(targetId)}`;
            const response = await getData<{
                character?: any;
                savedCharacter?: any;
            }>(`/get-saved-character?${queryParam}`);

            if (!response?.character) {
                console.warn("Could not load character:", targetId);
                return;
            }

            const char = response.character;
            const savedId = response.savedCharacter?.id || char.savedCharacterId;
            const siteCharacterId = response.savedCharacter?.siteCharacterId || char.siteCharacterId;
            if (savedId) {
                this.state.savedId = Number(savedId);
            }
            if (siteCharacterId) {
                this.state.siteCharacterId = String(siteCharacterId);
            }

            if (char.creatorState && typeof char.creatorState === "object") {
                Object.assign(this.state, char.creatorState);
                if (savedId) this.state.savedId = Number(savedId);
                if (siteCharacterId) this.state.siteCharacterId = String(siteCharacterId);
            } else {
                if (char.name) this.state.name = char.name;
                if (char.level) this.state.level = Number(char.level);
                if (char.alignment) this.state.alignment = char.alignment;
                if (char.gender) this.state.gender = char.gender || "";
                if (char.avatarUrl) this.state.avatarUrl = char.avatarUrl;

                const spName = (char.species || char.race || "").toLowerCase();
                const matchedSp = this.species.find((s) => s.name.toLowerCase() === spName || s.id === spName);
                if (matchedSp) this.state.speciesId = matchedSp.id;

                if (Array.isArray(char.classes) && char.classes.length > 0) {
                    const primaryClass = char.classes[0];
                    const clsName = (primaryClass.name || "").toLowerCase();
                    const matchedCls = this.classes.find((c) => c.name.toLowerCase() === clsName || c.id === clsName);
                    if (matchedCls) {
                        this.state.classId = matchedCls.id;
                        if (primaryClass.subclass) {
                            const subName = primaryClass.subclass.toLowerCase();
                            const matchedSub = matchedCls.subclasses.find((s) => s.name.toLowerCase() === subName || s.id === subName);
                            if (matchedSub) this.state.subclassId = matchedSub.id;
                        }
                    }
                }

                if (char.background) {
                    const bgName = char.background.toLowerCase();
                    const matchedBg = this.backgrounds.find((b) => b.name.toLowerCase() === bgName || b.id === bgName);
                    if (matchedBg) this.state.backgroundId = matchedBg.id;
                }

                if (Array.isArray(char.abilities)) {
                    for (const ab of char.abilities) {
                        const abbr = (ab.abbr || "").toLowerCase() as AbilityName;
                        if (abbr && this.state.baseAbilities[abbr] !== undefined) {
                            this.state.baseAbilities[abbr] = ab.baseScore ?? ab.score ?? 10;
                        }
                    }
                }

                if (Array.isArray(char.skills)) {
                    this.state.classSkills = char.skills
                        .filter((s: any) => s.proficiency === "proficient")
                        .map((s: any) => s.name);
                    this.state.expertiseSkills = char.skills
                        .filter((s: any) => s.proficiency === "expertise")
                        .map((s: any) => s.name);
                }

                if (Array.isArray(char.weapons)) {
                    this.state.selectedWeapons = char.weapons.map((w: any) => w.name);
                    this.state.weaponMasteries = char.weapons
                        .filter((w: any) => w.mastery?.unlocked)
                        .map((w: any) => w.name);
                }
                if (Array.isArray(char.equipment)) {
                    const armor = char.equipment.find((e: any) => e.type === "Armor" && e.name !== "Shield");
                    if (armor) this.state.selectedArmor = armor.name;
                    this.state.hasShield = char.equipment.some((e: any) => e.name === "Shield" && e.equipped);
                }

                if (Array.isArray(char.spells)) {
                    this.state.selectedCantrips = char.spells.filter((s: any) => s.level === 0).map((s: any) => s.name);
                    this.state.selectedSpellsLevel1 = char.spells.filter((s: any) => s.level > 0).map((s: any) => s.name);
                }
            }

            const submitBtn = document.getElementById("creator-submit-btn");
            if (submitBtn) {
                submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Changes`;
            }
        } catch (err) {
            console.error("Failed to load character for editing:", err);
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

        // ASI / Feat bonuses up to current level
        const asiLevels = this.getAsiLevels();
        for (const lvl of asiLevels) {
            const choice = this.state.asiChoices?.[lvl];
            if (!choice) continue;
            if (choice.type === "single") {
                if (choice.statA === stat) score += 2;
            } else if (choice.type === "dual") {
                if (choice.statA === stat) score += 1;
                if (choice.statB === stat) score += 1;
            } else if (choice.type === "feat") {
                if (choice.statA === stat) score += 1;
            }
        }

        return score;
    }

    public getAbilityModifier(stat: AbilityName): number {
        return Math.floor((this.getEffectiveAbilityScore(stat) - 10) / 2);
    }

    public getMaxHp(): number {
        const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
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

        // Draconic Sorcerer (+1 HP per level starting at level 3)
        if (this.state.classId === "sorcerer" && this.state.subclassId === "draconic" && level >= 3) {
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
            } else if (this.state.classId === "sorcerer" && this.state.subclassId === "draconic" && this.state.level >= 3) {
                ac = 10 + dexMod + this.getAbilityModifier("cha");
            } else if (this.state.classId === "druid" && this.state.subclassId === "moon" && this.state.level >= 6) {
                ac = Math.max(ac, 13 + this.getAbilityModifier("wis"));
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
        const species = this.species.find((s) => s.id === this.state.speciesId);
        let speed = species?.speed || 30;
        if (this.state.speciesId === "elf" && this.state.lineageId === "wood-elf") {
            speed += 5;
        }
        if ((this.state.classId === "barbarian" || this.state.classId === "monk") && this.state.level >= 5) {
            speed += 10;
        }
        // Ranger Roving (Level 6+)
        if (this.state.classId === "ranger" && this.state.level >= 6) {
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

    public getSpecialSpeeds(): string[] {
        const special: string[] = [];
        const baseSpeed = this.getSpeed();
        // Sea Druid Level 6+ Aquatic Affinity
        if (this.state.classId === "druid" && this.state.subclassId === "sea" && this.state.level >= 6) {
            special.push(`Swim ${baseSpeed} ft.`);
        }
        // Barbarian Wild Heart Aspect of the Spider (Level 6+)
        if (
            this.state.classId === "barbarian" &&
            this.state.subclassId === "wild-heart" &&
            this.state.level >= 6 &&
            this.state.subclassFeatureChoices?.["barbarian-6-wild-heart"] === "spider"
        ) {
            special.push(`Climb ${baseSpeed} ft.`);
        }
        // Ranger Level 6+ (Roving: Climbing and Swimming speed)
        if (this.state.classId === "ranger" && this.state.level >= 6) {
            special.push(`Climb ${baseSpeed} ft.`, `Swim ${baseSpeed} ft.`);
        }
        return special;
    }

    public getSpeedDisplay(): string {
        const base = `${this.getSpeed()} ft.`;
        const special = this.getSpecialSpeeds();
        if (special.length > 0) {
            return `${base} (${special.join(", ")})`;
        }
        return base;
    }

    public isProficientWithArmor(armorName: string): boolean {
        if (!armorName || armorName === "None") return true;
        const armor = BASE_ARMOR_2024.find((a) => a.name === armorName);
        if (!armor) return true;
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (!cls) return true;
        const profs = cls.armorProficiencies;
        if (profs.includes("All Armor")) return true;
        return profs.some((p) => p.toLowerCase().includes(armor.category.toLowerCase()));
    }

    public isProficientWithShield(): boolean {
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (!cls) return true;
        return cls.armorProficiencies.includes("Shields") || cls.armorProficiencies.includes("All Armor");
    }

    public isProficientWithWeapon(weaponName: string): boolean {
        const weapon = BASE_WEAPONS_2024.find((w) => w.name === weaponName);
        if (!weapon) return true;
        const cls = this.classes.find((c) => c.id === this.state.classId);
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
        this.state.equippedKitIndex = 0;
    }

    public isKitEquipped(idx: number): boolean {
        const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
        const opt = cls.startingEquipmentOptions?.[idx];
        if (!opt) return false;

        if (this.state.equippedKitIndex !== undefined) {
            return this.state.equippedKitIndex === idx;
        }

        // Fallback: check if the character's current armor & weapons match this kit
        const foundArmor = BASE_ARMOR_2024.find((a) =>
            opt.items.some((it) => it.toLowerCase().includes(a.name.toLowerCase()))
        );
        const expectedArmor = foundArmor ? foundArmor.name : (cls.armorProficiencies.length === 0 ? "None" : "Leather Armor");
        const expectedShield = opt.items.some((it) => it.toLowerCase().includes("shield"));
        const matchedWeapons = BASE_WEAPONS_2024.filter((w) =>
            opt.items.some((it) => it.toLowerCase().includes(w.name.toLowerCase()))
        ).map((w) => w.name);

        if (this.state.selectedArmor !== expectedArmor) return false;
        if (this.state.hasShield !== expectedShield) return false;
        if (matchedWeapons.length > 0 && !matchedWeapons.every((w) => this.state.selectedWeapons.includes(w))) return false;
        return true;
    }

    public getMaxCantrips(): number {
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (!cls) return 0;
        const lvlIdx = Math.max(0, Math.min(19, this.state.level - 1));
        let count = cls.spellcasting?.cantripsKnownByLevel?.[lvlIdx] || 0;

        // Subclass third-casters at level 3+
        if (this.state.level >= 3) {
            if (this.state.classId === "fighter" && this.state.subclassId === "eldritch-knight") {
                count += (this.state.level >= 10 ? 3 : 2);
            } else if (this.state.classId === "rogue" && this.state.subclassId === "arcane-trickster") {
                count += (this.state.level >= 10 ? 4 : 3);
            }
        }

        // Origin Feat bonus: Magic Initiate grants 2 cantrips
        if (this.state.originFeatId.startsWith("magic-initiate")) {
            count += 2;
        }

        return count;
    }

    public getMaxPreparedSpells(): number {
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (!cls) return 0;
        const lvlIdx = Math.max(0, Math.min(19, this.state.level - 1));
        let count = cls.spellcasting?.preparedSpellsByLevel?.[lvlIdx] || 0;

        // Subclass third-casters at level 3+
        if (this.state.level >= 3) {
            const thirdCasterSpells = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13];
            if (this.state.classId === "fighter" && this.state.subclassId === "eldritch-knight") {
                count += thirdCasterSpells[lvlIdx];
            } else if (this.state.classId === "rogue" && this.state.subclassId === "arcane-trickster") {
                count += thirdCasterSpells[lvlIdx];
            }
        }

        // Origin Feat bonus: Magic Initiate grants 1 prepared 1st-level spell
        if (this.state.originFeatId.startsWith("magic-initiate")) {
            count += 1;
        }

        return count;
    }

    public getAllowedSpellClasses(): string[] {
        const list: string[] = [];
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (cls?.spellcasting) {
            list.push(cls.name);
        }
        if (this.state.level >= 3 && (this.state.subclassId === "eldritch-knight" || this.state.subclassId === "arcane-trickster")) {
            if (!list.includes("Wizard")) list.push("Wizard");
        }
        if (this.state.originFeatId === "magic-initiate-cleric" && !list.includes("Cleric")) list.push("Cleric");
        if (this.state.originFeatId === "magic-initiate-druid" && !list.includes("Druid")) list.push("Druid");
        if (this.state.originFeatId === "magic-initiate-wizard" && !list.includes("Wizard")) list.push("Wizard");
        return list;
    }

    public getMaxSpellLevel(): number {
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (!cls?.spellcasting) {
            if (this.state.level >= 3 && (this.state.subclassId === "eldritch-knight" || this.state.subclassId === "arcane-trickster")) {
                if (this.state.level >= 19) return 4;
                if (this.state.level >= 13) return 3;
                if (this.state.level >= 7) return 2;
                return 1;
            }
            if (this.state.originFeatId.startsWith("magic-initiate")) return 1;
            return 0;
        }
        const lvlIdx = Math.max(0, Math.min(19, this.state.level - 1));
        const slotsRow = cls.spellcasting.spellSlotsByLevel[lvlIdx];
        for (let i = slotsRow.length - 1; i >= 0; i--) {
            if (slotsRow[i] > 0) return i + 1;
        }
        return 1;
    }

    public getAvailableSpells(): { cantrips: RuleSpellDefinition[]; leveledSpells: RuleSpellDefinition[]; spellsLvl1: RuleSpellDefinition[] } {
        const allowed = this.getAllowedSpellClasses();
        if (allowed.length === 0) {
            return { cantrips: [], leveledSpells: [], spellsLvl1: [] };
        }
        const maxLevel = this.getMaxSpellLevel();
        const cantrips = SPELLS_2024.filter((sp) => sp.level === 0 && sp.classes.some((c) => allowed.includes(c)));
        const leveledSpells = SPELLS_2024.filter((sp) => sp.level >= 1 && sp.level <= maxLevel && sp.classes.some((c) => allowed.includes(c)));
        return { cantrips, leveledSpells, spellsLvl1: leveledSpells };
    }

    public sanitizeSpellSelections() {
        const allowed = this.getAllowedSpellClasses();
        if (allowed.length === 0) {
            this.state.selectedCantrips = [];
            this.state.selectedSpellsLevel1 = [];
            return;
        }
        const available = this.getAvailableSpells();
        const validCantripNames = new Set(available.cantrips.map((c) => c.name));
        const validLeveledNames = new Set(available.leveledSpells.map((s) => s.name));

        this.state.selectedCantrips = this.state.selectedCantrips.filter((s) => validCantripNames.has(s));
        this.state.selectedSpellsLevel1 = this.state.selectedSpellsLevel1.filter((s) => validLeveledNames.has(s));

        const maxCantrips = this.getMaxCantrips();
        if (this.state.selectedCantrips.length > maxCantrips) {
            this.state.selectedCantrips = this.state.selectedCantrips.slice(0, maxCantrips);
        }

        const maxPrepared = this.getMaxPreparedSpells();
        if (this.state.selectedSpellsLevel1.length > maxPrepared) {
            this.state.selectedSpellsLevel1 = this.state.selectedSpellsLevel1.slice(0, maxPrepared);
        }
    }

    public getSmartAutoFillSpells(): { cantrips: string[]; prepared: string[] } {
        const available = this.getAvailableSpells();
        const maxCantrips = this.getMaxCantrips();
        const maxPrepared = this.getMaxPreparedSpells();
        const maxLevel = this.getMaxSpellLevel();

        let classKey = (this.state.classId || "wizard").toLowerCase();
        if (this.state.subclassId === "eldritch-knight" || this.state.subclassId === "arcane-trickster") {
            classKey = "wizard";
        }
        const priorities = CLASS_SPELL_PRIORITIES[classKey] || CLASS_SPELL_PRIORITIES["wizard"];

        // 1. Smart Cantrips: rank by class priorities, then alphabetical
        const cantripRank = (sp: RuleSpellDefinition) => {
            const idx = priorities.cantrips.indexOf(sp.name);
            return idx >= 0 ? idx : 999;
        };
        const sortedCantrips = [...available.cantrips].sort((a, b) => {
            const rA = cantripRank(a);
            const rB = cantripRank(b);
            if (rA !== rB) return rA - rB;
            return a.name.localeCompare(b.name);
        });
        const selectedCantrips = sortedCantrips.slice(0, maxCantrips).map((c) => c.name);

        // 2. Smart Prepared Spells: ensure coverage across available spell levels, prioritizing staples
        const leveledRank = (sp: RuleSpellDefinition) => {
            const idx = priorities.leveled.indexOf(sp.name);
            return idx >= 0 ? idx : 999;
        };

        // Group available leveled spells by level
        const byLevel: Record<number, RuleSpellDefinition[]> = {};
        for (let lvl = 1; lvl <= maxLevel; lvl++) {
            byLevel[lvl] = available.leveledSpells
                .filter((s) => s.level === lvl)
                .sort((a, b) => {
                    const rA = leveledRank(a);
                    const rB = leveledRank(b);
                    if (rA !== rB) return rA - rB;
                    return a.name.localeCompare(b.name);
                });
        }

        const selectedPreparedSet = new Set<string>();

        if (maxLevel === 1) {
            // Level 1 only: take top priorities
            const topLvl1 = (byLevel[1] || []).slice(0, maxPrepared);
            topLvl1.forEach((s) => selectedPreparedSet.add(s.name));
        } else {
            // Multi-level: distribute across levels from maxLevel down to 1
            // Pass 1: Ensure top staples from each spell level (favoring highest levels)
            for (let lvl = maxLevel; lvl >= 1; lvl--) {
                const spellsAtLvl = byLevel[lvl] || [];
                const quota = lvl === maxLevel ? 2 : 1;
                for (let i = 0; i < Math.min(quota, spellsAtLvl.length); i++) {
                    if (selectedPreparedSet.size < maxPrepared) {
                        selectedPreparedSet.add(spellsAtLvl[i].name);
                    }
                }
            }

            // Pass 2: Round-robin fill starting from highest levels down to 1
            let addedInPass = true;
            while (selectedPreparedSet.size < maxPrepared && addedInPass) {
                addedInPass = false;
                for (let lvl = maxLevel; lvl >= 1; lvl--) {
                    const spellsAtLvl = byLevel[lvl] || [];
                    for (const s of spellsAtLvl) {
                        if (!selectedPreparedSet.has(s.name) && selectedPreparedSet.size < maxPrepared) {
                            selectedPreparedSet.add(s.name);
                            addedInPass = true;
                            break;
                        }
                    }
                    if (selectedPreparedSet.size >= maxPrepared) break;
                }
            }
        }

        // If still under maxPrepared, fill with any remaining available spells
        if (selectedPreparedSet.size < maxPrepared) {
            const allSorted = [...available.leveledSpells].sort((a, b) => {
                if (b.level !== a.level) return b.level - a.level;
                const rA = leveledRank(a);
                const rB = leveledRank(b);
                if (rA !== rB) return rA - rB;
                return a.name.localeCompare(b.name);
            });
            for (const s of allSorted) {
                if (!selectedPreparedSet.has(s.name) && selectedPreparedSet.size < maxPrepared) {
                    selectedPreparedSet.add(s.name);
                }
            }
        }

        return {
            cantrips: selectedCantrips,
            prepared: Array.from(selectedPreparedSet)
        };
    }

    public getSpellcastingAbility(): AbilityName | null {
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (cls?.spellcasting) return cls.spellcasting.ability;
        if (this.state.subclassId === "eldritch-knight" || this.state.subclassId === "arcane-trickster") return "int";
        if (this.state.originFeatId === "magic-initiate-wizard") return "int";
        if (this.state.originFeatId === "magic-initiate-cleric" || this.state.originFeatId === "magic-initiate-druid") return "wis";
        return null;
    }

    public getSpellSaveDc(): number | null {
        const ability = this.getSpellcastingAbility();
        if (!ability) return null;
        return 8 + this.getProficiencyBonus() + this.getAbilityModifier(ability);
    }

    public getSpellAttackModifier(): number | null {
        const ability = this.getSpellcastingAbility();
        if (!ability) return null;
        return this.getProficiencyBonus() + this.getAbilityModifier(ability);
    }

    public getSpellSlotsSummary(): string {
        const cls = this.classes.find((c) => c.id === this.state.classId);
        if (cls?.spellcasting) {
            const lvlIdx = Math.max(0, Math.min(19, this.state.level - 1));
            const slotsRow = cls.spellcasting.spellSlotsByLevel[lvlIdx];
            if (cls.spellcasting.type === "pact") {
                const count = slotsRow.find((s) => s > 0) || 1;
                const pactLvl = slotsRow.findIndex((s) => s > 0) + 1;
                return `${count} x Lvl ${pactLvl} (Pact Magic)`;
            }
            const pairs: string[] = [];
            slotsRow.forEach((c, idx) => {
                if (c > 0) pairs.push(`${c} × Lvl ${idx + 1}`);
            });
            return pairs.join(", ") || "None";
        }
        if (this.state.originFeatId.startsWith("magic-initiate")) {
            return "1 × Lvl 1 (1/Long Rest from Feat)";
        }
        return "None";
    }

    public updateLiveSummary() {
        const nameEl = document.getElementById("summary-name");
        const metaEl = document.getElementById("summary-meta");
        const hpEl = document.getElementById("summary-hp");
        const acEl = document.getElementById("summary-ac");
        const initEl = document.getElementById("summary-init");
        const speedEl = document.getElementById("summary-speed");
        const avatarEl = document.getElementById("summary-avatar-img") as HTMLImageElement;

        const species = this.species.find((s) => s.id === this.state.speciesId)?.name || "Species";
        const cls = this.classes.find((c) => c.id === this.state.classId)?.name || "Class";

        if (nameEl) nameEl.textContent = this.state.name || "Unnamed Hero";
        if (metaEl) metaEl.textContent = `Level ${this.state.level} • ${species} • ${cls}`;
        if (hpEl) hpEl.textContent = String(this.getMaxHp());
        if (acEl) acEl.textContent = String(this.getArmorClass());
        if (initEl) {
            const initVal = this.getInitiative();
            initEl.textContent = (initVal >= 0 ? "+" : "") + initVal;
        }
        if (speedEl) speedEl.textContent = this.getSpeedDisplay();
        if (avatarEl) avatarEl.src = this.state.avatarUrl || "/storage/images/default-avatar.png";
    }

    // Step Renderers
    public renderStep(step: number, preserveScroll: boolean = true) {
        const panelsContainer = document.getElementById("creator-step-panels");
        if (!panelsContainer) return;
        const prevScrollY = typeof window !== "undefined" ? window.scrollY : 0;

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

        if (preserveScroll && typeof window !== "undefined" && window.scrollY !== prevScrollY) {
            window.scrollTo({ top: prevScrollY, behavior: "instant" as any });
        }
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
        const currentSpecies = this.species.find((s) => s.id === this.state.speciesId) || this.species[0];
        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Choose Species</h3>
                    <p class="panel-desc">Select your species from the 10 core options in 5.5e. In the 2024 revision, ability score increases are tied to your background.</p>
                </div>
                <div class="card-select-grid">
                    ${this.species.map((sp) => `
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
                                    ${this.originFeats.map((f) => `<option value="${f.id}" ${this.state.humanExtraFeatId === f.id ? "selected" : ""}>${f.name}</option>`).join("")}
                                </select>
                            </div>
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    private renderStep3Class(): string {
        const currentClass = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Choose Class</h3>
                    <p class="panel-desc">Select your character's class. Classes grant Hit Dice, proficiencies, weapon masteries, and starting features.</p>
                </div>
                <div class="card-select-grid">
                    ${this.classes.map((cls) => `
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

                ${this.renderClassProgression(currentClass)}
            </div>
        `;
    }

    private getClassLevelStatBadge(cls: ClassDefinition, lvl: number): string {
        const parts: string[] = [];
        if (cls.id === "barbarian") {
            const rages = lvl >= 17 ? "6 Rages" : lvl >= 12 ? "5 Rages" : lvl >= 6 ? "4 Rages" : lvl >= 3 ? "3 Rages" : "2 Rages";
            const rageDmg = lvl >= 16 ? "+4" : lvl >= 9 ? "+3" : "+2";
            parts.push(`${rages} • Rage Dmg ${rageDmg}`);
        } else if (cls.id === "fighter") {
            const attacks = lvl >= 20 ? "4 Attacks" : lvl >= 11 ? "3 Attacks" : lvl >= 5 ? "2 Attacks" : "1 Attack";
            const masteries = lvl >= 16 ? "6 Masteries" : lvl >= 10 ? "5 Masteries" : lvl >= 4 ? "4 Masteries" : "3 Masteries";
            parts.push(`${attacks} • ${masteries}`);
        } else if (cls.id === "rogue") {
            const sneakDice = Math.ceil(lvl / 2);
            parts.push(`Sneak Attack ${sneakDice}d6`);
        } else if (cls.id === "monk") {
            const artsDie = lvl >= 17 ? "1d12" : lvl >= 11 ? "1d10" : lvl >= 5 ? "1d8" : "1d6";
            const speed = lvl >= 18 ? "+30 ft" : lvl >= 14 ? "+25 ft" : lvl >= 10 ? "+20 ft" : lvl >= 6 ? "+15 ft" : lvl >= 2 ? "+10 ft" : "+0 ft";
            parts.push(`${lvl} Focus Pts • Martial Arts ${artsDie} • Speed ${speed}`);
        }

        if (cls.spellcasting) {
            const slots = cls.spellcasting.spellSlotsByLevel[lvl - 1];
            if (cls.spellcasting.type === "pact") {
                const totalSlots = slots ? slots.find((s: number) => s > 0) || 0 : 0;
                const slotLvl = slots ? slots.findIndex((s: number) => s > 0) + 1 : 0;
                if (totalSlots > 0) {
                    parts.push(`${totalSlots} × ${slotLvl}${this.getOrdinalSuffix(slotLvl)}-Level Slot${totalSlots > 1 ? "s" : ""}`);
                }
            } else if (slots) {
                const nonZero = slots
                    .map((count: number, idx: number) => (count > 0 ? `${count} × ${idx + 1}${this.getOrdinalSuffix(idx + 1)}` : null))
                    .filter(Boolean);
                if (nonZero.length > 0) {
                    parts.push(`Slots: ${nonZero.join(", ")}`);
                }
            }
        }

        return parts.length > 0 ? parts.join(" | ") : "";
    }

    private getOrdinalSuffix(n: number): string {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    private getFeatureTagHtml(featureName: string, level: number, isSubclassFeature = false): string {
        const lower = featureName.toLowerCase();
        if (lower.includes("ability score improvement")) {
            return `<span class="progression-feature-tag asi"><i class="fa-solid fa-arrow-up-right-dots"></i> ASI / Feat</span>`;
        }
        if (isSubclassFeature || lower.includes("subclass")) {
            return `<span class="progression-feature-tag subclass"><i class="fa-solid fa-shield-halved"></i> Subclass</span>`;
        }
        if (lower.includes("epic boon")) {
            return `<span class="progression-feature-tag epic"><i class="fa-solid fa-crown"></i> Epic Boon</span>`;
        }
        if (level === 20 || lower.includes("capstone")) {
            return `<span class="progression-feature-tag capstone"><i class="fa-solid fa-star"></i> Capstone</span>`;
        }
        if (lower.includes("spell") || lower.includes("secrets") || lower.includes("arcanum")) {
            return `<span class="progression-feature-tag magic"><i class="fa-solid fa-wand-magic-sparkles"></i> Magic</span>`;
        }
        return "";
    }

    private renderLevelChoices(cls: ClassDefinition, lvl: number): string {
        const choices: string[] = [];

        // Level 1 choices
        if (lvl === 1) {
            // Weapon Masteries
            if (cls.weaponMasteryCount > 0) {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-crosshairs"></i> Weapon Masteries (Choose up to ${cls.weaponMasteryCount})</h5>
                        <p class="card-body">Your martial training unlocks tactical weapon mastery properties (Push, Vex, Nick, Topple, Cleave, Graze, Sap, Slow).</p>
                        <div class="skills-select-grid">
                            ${BASE_WEAPONS_2024.filter((w) => cls.weaponProficiencies.some((p) => p.includes("Martial") || w.category.includes("Simple"))).map((w) => {
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
                `);
            }

            // Fighting Style for Fighter
            if (cls.id === "fighter") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Fighting Style (Choose 1)</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FIGHTING_STYLES.map((fs) => `
                                <div class="select-card fighting-style-card ${this.state.fightingStyle === fs.id ? "selected" : ""}" data-fighting-style-id="${fs.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${fs.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${fs.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Divine Order for Cleric
            if (cls.id === "cleric") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Divine Order</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${DIVINE_ORDERS.map((ord) => `
                                <div class="select-card divine-order-card ${this.state.divineOrder === ord.id ? "selected" : ""}" data-divine-order-id="${ord.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${ord.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${ord.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Primal Order for Druid
            if (cls.id === "druid") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-leaf"></i> Primal Order</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${PRIMAL_ORDERS.map((ord) => `
                                <div class="select-card primal-order-card ${this.state.primalOrder === ord.id ? "selected" : ""}" data-primal-order-id="${ord.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${ord.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${ord.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 2 choices
        if (lvl === 2) {
            // Fighting Style for Paladin & Ranger
            if (cls.id === "paladin" || cls.id === "ranger") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Fighting Style (Choose 1)</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FIGHTING_STYLES.map((fs) => `
                                <div class="select-card fighting-style-card ${this.state.fightingStyle === fs.id ? "selected" : ""}" data-fighting-style-id="${fs.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${fs.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${fs.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Metamagic for Sorcerer
            if (cls.id === "sorcerer") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-wand-sparkles"></i> Metamagic (Choose up to ${this.getMaxMetamagicCount()})</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${METAMAGIC_OPTIONS.map((meta) => {
                                const isSelected = this.state.metamagic.includes(meta.id);
                                return `
                                    <div class="select-card metamagic-card ${isSelected ? "selected" : ""}" data-metamagic-id="${meta.id}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${meta.name}</h5>
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        </div>
                                        <p class="card-body">${meta.description}</p>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `);
            }

            // Eldritch Invocations for Warlock
            if (cls.id === "warlock") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-eye"></i> Eldritch Invocations (Choose up to ${this.getMaxInvocationsCount()})</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ELDRITCH_INVOCATIONS.filter((inv) => !inv.minLevel || this.state.level >= inv.minLevel).map((inv) => {
                                const isSelected = this.state.invocations.includes(inv.id);
                                return `
                                    <div class="select-card invocation-card ${isSelected ? "selected" : ""}" data-invocation-id="${inv.id}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${inv.name}</h5>
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        </div>
                                        ${inv.minLevel ? `<span class="card-tag">Min Level: ${inv.minLevel}</span>` : ""}
                                        <p class="card-body">${inv.description}</p>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `);
            }

            // Wizard Scholar (Level 2)
            if (cls.id === "wizard") {
                const currentChoice = this.state.subclassFeatureChoices?.["wizard-2-scholar"] || "arcana";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-graduation-cap"></i> Scholar Academic Skill</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WIZARD_SCHOLAR_SKILLS.map((sk) => `
                                <div class="select-card subclass-feature-card ${currentChoice === sk.id ? "selected" : ""}" data-feature-key="wizard-2-scholar" data-feature-choice="${sk.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sk.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sk.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 3 choices
        if (lvl === 3) {
            // Subclass Selection
            if (cls.subclasses && cls.subclasses.length > 0) {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-halved"></i> Subclass Selection (Level 3)</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                            ${cls.subclasses.map((sub) => `
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
                `);
            }

            // Battle Master Maneuvers
            if (cls.id === "fighter" && this.state.subclassId === "battle-master") {
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-dice-d20"></i> Battle Master Maneuvers (Choose up to ${this.getMaxManeuversCount()})</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${BATTLE_MASTER_MANEUVERS.map((man) => {
                                const isSelected = this.state.maneuvers.includes(man.id);
                                return `
                                    <div class="select-card maneuver-card ${isSelected ? "selected" : ""}" data-maneuver-id="${man.id}">
                                        <div class="card-title-row">
                                            <h5 class="card-title" style="font-size: 0.95rem;">${man.name}</h5>
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        </div>
                                        <p class="card-body">${man.description}</p>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Wild Heart: Rage of the Wilds
            if (cls.id === "barbarian" && this.state.subclassId === "wild-heart") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-3-wild-heart"] || "bear";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-paw"></i> Rage of the Wilds</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WILD_HEART_RAGES.map((r) => `
                                <div class="select-card subclass-feature-card ${currentChoice === r.id ? "selected" : ""}" data-feature-key="barbarian-3-wild-heart" data-feature-choice="${r.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${r.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${r.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Zealot: Divine Fury
            if (cls.id === "barbarian" && this.state.subclassId === "zealot") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-3-zealot"] || "radiant";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Divine Fury Energy</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ZEALOT_DIVINE_FURIES.map((z) => `
                                <div class="select-card subclass-feature-card ${currentChoice === z.id ? "selected" : ""}" data-feature-key="barbarian-3-zealot" data-feature-choice="${z.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${z.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${z.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Monk Warrior of Elements: Elemental Attunement
            if (cls.id === "monk" && this.state.subclassId === "elements") {
                const currentChoice = this.state.subclassFeatureChoices?.["monk-3-elements"] || "fire";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-fire"></i> Elemental Attunement</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ELEMENTS_ATTUNEMENT_DAMAGE_TYPES.map((e) => `
                                <div class="select-card subclass-feature-card ${currentChoice === e.id ? "selected" : ""}" data-feature-key="monk-3-elements" data-feature-choice="${e.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${e.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${e.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Beast Master: Primal Companion
            if (cls.id === "ranger" && this.state.subclassId === "beast-master") {
                const currentChoice = this.state.subclassFeatureChoices?.["ranger-3-beast-master"] || "land";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-paw"></i> Primal Companion</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${PRIMAL_COMPANION_TYPES.map((p) => `
                                <div class="select-card subclass-feature-card ${currentChoice === p.id ? "selected" : ""}" data-feature-key="ranger-3-beast-master" data-feature-choice="${p.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${p.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${p.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Hunter: Hunter's Prey
            if (cls.id === "ranger" && this.state.subclassId === "hunter") {
                const currentChoice = this.state.subclassFeatureChoices?.["ranger-3-hunter"] || "colossus-slayer";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-crosshairs"></i> Hunter's Prey</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${HUNTER_PREY_OPTIONS.map((h) => `
                                <div class="select-card subclass-feature-card ${currentChoice === h.id ? "selected" : ""}" data-feature-key="ranger-3-hunter" data-feature-choice="${h.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${h.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${h.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Sorcerer Draconic: Draconic Ancestor
            if (cls.id === "sorcerer" && this.state.subclassId === "draconic") {
                const currentChoice = this.state.subclassFeatureChoices?.["sorcerer-3-draconic"] || "gold";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-dragon"></i> Draconic Ancestor</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${DRACONIC_ANCESTOR_ELEMENTS.map((d) => `
                                <div class="select-card subclass-feature-card ${currentChoice === d.id ? "selected" : ""}" data-feature-key="sorcerer-3-draconic" data-feature-choice="${d.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${d.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${d.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Battle Master: Student of War
            if (cls.id === "fighter" && this.state.subclassId === "battle-master") {
                const currentChoice = this.state.subclassFeatureChoices?.["fighter-3-battle-master-student"] || "History";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-graduation-cap"></i> Student of War Bonus Skill</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${STUDENT_OF_WAR_SKILLS.map((sk) => `
                                <div class="select-card subclass-feature-card ${currentChoice === sk.id ? "selected" : ""}" data-feature-key="fighter-3-battle-master-student" data-feature-choice="${sk.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sk.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sk.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Monk Open Hand: Open Hand Technique
            if (cls.id === "monk" && this.state.subclassId === "open-hand") {
                const currentChoice = this.state.subclassFeatureChoices?.["monk-3-open-hand"] || "addle";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-hand-fist"></i> Open Hand Technique Primary Tactic</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${OPEN_HAND_TECHNIQUES.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="monk-3-open-hand" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Fey Wanderer: Otherworldly Glamour
            if (cls.id === "ranger" && this.state.subclassId === "fey-wanderer") {
                const currentChoice = this.state.subclassFeatureChoices?.["ranger-3-fey-wanderer"] || "Deception";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Otherworldly Glamour Skill</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FEY_WANDERER_GLAMOUR_SKILLS.map((sk) => `
                                <div class="select-card subclass-feature-card ${currentChoice === sk.id ? "selected" : ""}" data-feature-key="ranger-3-fey-wanderer" data-feature-choice="${sk.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${sk.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${sk.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Warlock Archfey: Steps of the Fey
            if (cls.id === "warlock" && this.state.subclassId === "archfey") {
                const currentChoice = this.state.subclassFeatureChoices?.["warlock-3-archfey"] || "taunting-step";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shoe-prints"></i> Steps of the Fey Teleport Effect</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${STEPS_OF_THE_FEY_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="warlock-3-archfey" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Stars: Starry Form
            if (cls.id === "druid" && this.state.subclassId === "stars") {
                const currentChoice = this.state.subclassFeatureChoices?.["druid-3-stars"] || "archer";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-star"></i> Starry Form Primary Constellation</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${STARRY_FORM_CONSTELLATIONS.map((c) => `
                                <div class="select-card subclass-feature-card ${currentChoice === c.id ? "selected" : ""}" data-feature-key="druid-3-stars" data-feature-choice="${c.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${c.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${c.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Sea: Wrath of the Sea
            if (cls.id === "druid" && this.state.subclassId === "sea") {
                const currentChoice = this.state.subclassFeatureChoices?.["druid-3-sea"] || "cold";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-water"></i> Wrath of the Sea Damage Manifestation</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${SEA_WRATH_DAMAGE_TYPES.map((w) => `
                                <div class="select-card subclass-feature-card ${currentChoice === w.id ? "selected" : ""}" data-feature-key="druid-3-sea" data-feature-choice="${w.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${w.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${w.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Moon: Circle Forms Strike
            if (cls.id === "druid" && this.state.subclassId === "moon") {
                const currentChoice = this.state.subclassFeatureChoices?.["druid-3-moon"] || "radiant";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-moon"></i> Circle Forms Natural Attack Damage</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${MOON_CIRCLE_FORMS_STRIKES.map((m) => `
                                <div class="select-card subclass-feature-card ${currentChoice === m.id ? "selected" : ""}" data-feature-key="druid-3-moon" data-feature-choice="${m.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${m.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${m.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 5 choices
        if (lvl === 5) {
            // Rogue Cunning Strike
            if (cls.id === "rogue") {
                const currentChoice = this.state.subclassFeatureChoices?.["rogue-5-cunning-strike"] || "trip";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-bolt"></i> Cunning Strike Primary Focus</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ROGUE_CUNNING_STRIKES.map((c) => `
                                <div class="select-card subclass-feature-card ${currentChoice === c.id ? "selected" : ""}" data-feature-key="rogue-5-cunning-strike" data-feature-choice="${c.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${c.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${c.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 6 choices
        if (lvl === 6) {
            // Druid Circle of the Land: Biome Affinity
            if (cls.id === "druid" && this.state.subclassId === "land") {
                const currentChoice = this.state.subclassFeatureChoices?.["druid-6-land"] || "arid";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-tree"></i> Circle of the Land Biome Affinity</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${DRUID_LAND_BIOMES.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="druid-6-land" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Path of the Wild Heart: Aspect of the Beast
            if (cls.id === "barbarian" && this.state.subclassId === "wild-heart") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-6-wild-heart"] || "elephant";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-paw"></i> Aspect of the Beast</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${BARBARIAN_ASPECTS.map((a) => `
                                <div class="select-card subclass-feature-card ${currentChoice === a.id ? "selected" : ""}" data-feature-key="barbarian-6-wild-heart" data-feature-choice="${a.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${a.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${a.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Ranger Hunter: Defensive Tactics
            if (cls.id === "ranger" && this.state.subclassId === "hunter") {
                const currentChoice = this.state.subclassFeatureChoices?.["ranger-6-hunter"] || "multiattack-defense";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Defensive Tactics</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${HUNTER_DEFENSIVE_TACTICS.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="ranger-6-hunter" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Druid Circle of the Stars: Cosmic Omen
            if (cls.id === "druid" && this.state.subclassId === "stars") {
                const currentChoice = this.state.subclassFeatureChoices?.["druid-6-stars"] || "weal";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Cosmic Omen Starting Focus</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${COSMIC_OMEN_OPTIONS.map((o) => `
                                <div class="select-card subclass-feature-card ${currentChoice === o.id ? "selected" : ""}" data-feature-key="druid-6-stars" data-feature-choice="${o.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${o.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${o.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Cleric War Domain: War God's Blessing
            if (cls.id === "cleric" && this.state.subclassId === "war") {
                const currentChoice = this.state.subclassFeatureChoices?.["cleric-6-war"] || "shield-of-faith";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-halved"></i> War God's Blessing Preferred Spell</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WAR_GOD_BLESSING_OPTIONS.map((w) => `
                                <div class="select-card subclass-feature-card ${currentChoice === w.id ? "selected" : ""}" data-feature-key="cleric-6-war" data-feature-choice="${w.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${w.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${w.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 7 choices
        if (lvl === 7) {
            // Druid Elemental Fury
            if (cls.id === "druid") {
                const currentChoice = this.state.subclassFeatureChoices?.["druid-7"] || "potent-spellcasting";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-bolt"></i> Elemental Fury</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${ELEMENTAL_FURY_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="druid-7" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Cleric Blessed Strikes
            if (cls.id === "cleric") {
                const currentChoice = this.state.subclassFeatureChoices?.["cleric-7"] || "potent-spellcasting";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-sun"></i> Blessed Strikes</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
                            ${BLESSED_STRIKES_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="cleric-7" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Champion: Additional Fighting Style
            if (cls.id === "fighter" && this.state.subclassId === "champion") {
                const currentChoice = this.state.subclassFeatureChoices?.["fighter-7-champion"] || "defense";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-heart"></i> Additional Fighting Style</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${CHAMPION_ADDITIONAL_FIGHTING_STYLES.map((s) => `
                                <div class="select-card subclass-feature-card ${currentChoice === s.id ? "selected" : ""}" data-feature-key="fighter-7-champion" data-feature-choice="${s.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${s.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${s.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Psi Warrior: Telekinetic Thrust
            if (cls.id === "fighter" && this.state.subclassId === "psi-warrior") {
                const currentChoice = this.state.subclassFeatureChoices?.["fighter-7-psi-warrior"] || "push";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-hand"></i> Telekinetic Thrust Preferred Maneuver</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${PSI_WARRIOR_THRUST_OPTIONS.map((p) => `
                                <div class="select-card subclass-feature-card ${currentChoice === p.id ? "selected" : ""}" data-feature-key="fighter-7-psi-warrior" data-feature-choice="${p.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${p.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${p.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 9 choices
        if (lvl === 9) {
            // Barbarian Brutal Strike
            if (cls.id === "barbarian") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-9-brutal-strike"] || "forceful-blow";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-gavel"></i> Brutal Strike Primary Tactic</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${BRUTAL_STRIKE_OPTIONS.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="barbarian-9-brutal-strike" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Fighter Tactical Master
            if (cls.id === "fighter") {
                const currentChoice = this.state.subclassFeatureChoices?.["fighter-9-tactical-master"] || "push";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-crosshairs"></i> Tactical Master Primary Swap</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${TACTICAL_MASTER_PROPERTIES.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="fighter-9-tactical-master" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 10 choices
        if (lvl === 10) {
            // Warlock Fiend Patron: Fiendish Resilience
            if (cls.id === "warlock" && this.state.subclassId === "fiend") {
                const currentChoice = this.state.subclassFeatureChoices?.["warlock-10-fiend"] || "fire";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield-virus"></i> Fiendish Resilience Damage Resistance</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
                            ${FIENDISH_RESILIENCE_DAMAGE_TYPES.map((f) => `
                                <div class="select-card subclass-feature-card ${currentChoice === f.id ? "selected" : ""}" data-feature-key="warlock-10-fiend" data-feature-choice="${f.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${f.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${f.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Barbarian Path of the World Tree: Battering Roots
            if (cls.id === "barbarian" && this.state.subclassId === "world-tree") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-10-world-tree"] || "push";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-tree"></i> Battering Roots Mastery Option</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${BATTERING_ROOTS_OPTIONS.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="barbarian-10-world-tree" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Wizard Diviner: The Third Eye
            if (cls.id === "wizard" && this.state.subclassId === "diviner") {
                const currentChoice = this.state.subclassFeatureChoices?.["wizard-10-diviner"] || "darkvision";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-eye"></i> The Third Eye Primary Benefit</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${DIVINER_THIRD_EYE_OPTIONS.map((o) => `
                                <div class="select-card subclass-feature-card ${currentChoice === o.id ? "selected" : ""}" data-feature-key="wizard-10-diviner" data-feature-choice="${o.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${o.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${o.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 13 choices
        if (lvl === 13) {
            // Barbarian Improved Brutal Strike
            if (cls.id === "barbarian") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-13-brutal-strike"] || "staggering-blow";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-hammer"></i> Improved Brutal Strike Mastery</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${IMPROVED_BRUTAL_STRIKE_OPTIONS.map((b) => `
                                <div class="select-card subclass-feature-card ${currentChoice === b.id ? "selected" : ""}" data-feature-key="barbarian-13-brutal-strike" data-feature-choice="${b.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${b.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${b.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 14 choices
        if (lvl === 14) {
            // Barbarian Wild Heart: Totemic Attunement
            if (cls.id === "barbarian" && this.state.subclassId === "wild-heart") {
                const currentChoice = this.state.subclassFeatureChoices?.["barbarian-14-wild-heart"] || "falcon";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-feather"></i> Totemic Attunement</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${WILD_HEART_TOTEMIC_ATTUNEMENTS.map((t) => `
                                <div class="select-card subclass-feature-card ${currentChoice === t.id ? "selected" : ""}" data-feature-key="barbarian-14-wild-heart" data-feature-choice="${t.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${t.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${t.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Rogue Devious Strikes
            if (cls.id === "rogue") {
                const currentChoice = this.state.subclassFeatureChoices?.["rogue-14-devious-strike"] || "knock-out";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-skull"></i> Devious Strike Primary Focus</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ROGUE_DEVIOUS_STRIKES.map((d) => `
                                <div class="select-card subclass-feature-card ${currentChoice === d.id ? "selected" : ""}" data-feature-key="rogue-14-devious-strike" data-feature-choice="${d.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${d.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${d.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }

            // Sorcerer Aberrant: Revelation in Flesh
            if (cls.id === "sorcerer" && this.state.subclassId === "aberrant") {
                const currentChoice = this.state.subclassFeatureChoices?.["sorcerer-14-aberrant"] || "flight";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-dna"></i> Revelation in Flesh Primary Adaptation</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${ABERRANT_REVELATION_OPTIONS.map((a) => `
                                <div class="select-card subclass-feature-card ${currentChoice === a.id ? "selected" : ""}" data-feature-key="sorcerer-14-aberrant" data-feature-choice="${a.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${a.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${a.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // Level 15 choices
        if (lvl === 15) {
            // Ranger Hunter: Superior Hunter's Defense
            if (cls.id === "ranger" && this.state.subclassId === "hunter") {
                const currentChoice = this.state.subclassFeatureChoices?.["ranger-15-hunter"] || "evasion";
                choices.push(`
                    <div class="level-choice-box">
                        <h5 class="level-choice-title"><i class="fa-solid fa-shield"></i> Superior Hunter's Defense</h5>
                        <div class="card-select-grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
                            ${HUNTER_SUPERIOR_DEFENSE_OPTIONS.map((opt) => `
                                <div class="select-card subclass-feature-card ${currentChoice === opt.id ? "selected" : ""}" data-feature-key="ranger-15-hunter" data-feature-choice="${opt.id}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${opt.name}</h5>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                    <p class="card-body">${opt.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `);
            }
        }

        // ASI / Feat levels note
        const asiLevels = [4, 8, 12, 16, 19];
        if (cls.id === "fighter") asiLevels.push(6, 14);
        if (cls.id === "rogue") asiLevels.push(10);
        if (asiLevels.includes(lvl)) {
            choices.push(`
                <div class="level-info-note">
                    <i class="fa-solid fa-circle-info"></i> Ability Score Improvements and Feats for Level ${lvl} are customized on <strong>Step 5: Ability Scores</strong>.
                </div>
            `);
        }

        return choices.join("");
    }

    private renderClassProgression(cls: ClassDefinition): string {
        const charLevel = this.state.level;
        const unlockedBoxes: string[] = [];
        const lockedBoxes: string[] = [];

        const fallbackCls = CLASSES_2024.find((c) => c.id === cls.id);
        const activeSubId = this.state.subclassId || cls.subclasses?.[0]?.id || fallbackCls?.subclasses?.[0]?.id || "";
        const sub = activeSubId
            ? (cls.subclasses?.find((s: any) => s.id === activeSubId) || fallbackCls?.subclasses?.find((s) => s.id === activeSubId))
            : undefined;
        const fallbackSub = activeSubId ? fallbackCls?.subclasses?.find((s) => s.id === activeSubId) : undefined;
        const resolvedSubFeatures = (sub?.features && sub.features.length > 0) ? sub.features : (fallbackSub?.features || []);
        const resolvedClsFeatures = (cls.features && cls.features.length > 0) ? cls.features : (fallbackCls?.features || []);

        const isSubclassPlaceholder = (f: ClassLevelFeature): boolean => {
            const lowerName = f.name.toLowerCase();
            const lowerDesc = (f.description || "").toLowerCase();
            return (
                lowerName === "subclass feature" ||
                lowerName === "subclass capstone" ||
                lowerName.endsWith(" subclass") ||
                lowerDesc.startsWith("gain a feature granted by") ||
                lowerDesc.startsWith("gain a subclass") ||
                lowerDesc.startsWith("gain your sacred oath")
            );
        };

        for (let lvl = 1; lvl <= 20; lvl++) {
            if (this.progressionFilter === "unlocked" && lvl > charLevel) {
                continue;
            }

            const isUnlocked = lvl <= charLevel;
            const isHidden = !isUnlocked && !this.progressionExpanded;
            let featuresAtLvl: Array<ClassLevelFeature & { isSubclassFeature?: boolean }> = resolvedClsFeatures
                .filter((f: ClassLevelFeature) => f.level === lvl)
                .map((f: ClassLevelFeature) => ({ ...f }));
            const pb = Math.floor((lvl - 1) / 4) + 2;
            const statBadge = this.getClassLevelStatBadge(cls, lvl);

            let subAnnotation = "";
            if (sub && featuresAtLvl.some((f) => f.name.toLowerCase().includes("subclass"))) {
                subAnnotation = ` (${sub.name})`;
            }

            const subFeaturesAtLvl = resolvedSubFeatures.filter((f: any) => f.level === lvl);
            if (subFeaturesAtLvl.length > 0) {
                const subFeatureCards = subFeaturesAtLvl.map((sf: any) => ({
                    level: sf.level,
                    name: sub ? `${sf.name} (${sub.name})` : sf.name,
                    description: sf.description,
                    isSubclassFeature: true
                }));
                featuresAtLvl = [
                    ...featuresAtLvl.filter((f) => !isSubclassPlaceholder(f)),
                    ...subFeatureCards
                ];
            }

            const choicesHtml = this.renderLevelChoices(cls, lvl);

            const boxHtml = `
                <div class="creator-detail-box level-progression-box progression-row ${isUnlocked ? "unlocked" : "locked"}${isHidden ? " hidden" : ""}" data-level="${lvl}">
                    <div class="level-card-header">
                        <div class="level-header-title">
                            <span class="progression-lvl-badge ${isUnlocked ? "badge-unlocked" : "badge-locked"}">
                                ${isUnlocked ? `<i class="fa-solid fa-check"></i>` : `<i class="fa-solid fa-lock"></i>`} Level ${lvl}
                            </span>
                            <h4 class="level-title-text">${cls.name} Level ${lvl} Abilities</h4>
                        </div>
                        <div class="level-header-meta">
                            <span class="progression-pb-tag">PB +${pb}</span>
                            ${statBadge ? `<span class="progression-stat-badge"><i class="fa-solid fa-bolt"></i> ${statBadge}</span>` : ""}
                            <span class="progression-status-pill ${isUnlocked ? "status-unlocked" : "status-locked"}">
                                ${isUnlocked ? `<i class="fa-solid fa-circle-check"></i> Active` : `<i class="fa-solid fa-lock"></i> Unlocks at Level ${lvl}`}
                            </span>
                        </div>
                    </div>

                    ${featuresAtLvl.length > 0 ? `
                        <div class="level-abilities-grid">
                            ${featuresAtLvl.map((f) => `
                                <div class="select-card ability-feature-card ${isUnlocked ? "active" : "locked"}">
                                    <div class="card-title-row">
                                        <h5 class="card-title" style="font-size: 0.95rem;">${f.name}${!f.isSubclassFeature && f.name.toLowerCase().includes("subclass") ? subAnnotation : ""}</h5>
                                        ${this.getFeatureTagHtml(f.name, lvl, Boolean(f.isSubclassFeature))}
                                    </div>
                                    <p class="card-body">${f.description}</p>
                                </div>
                            `).join("")}
                        </div>
                    ` : ""}

                    ${choicesHtml}
                </div>
            `;

            if (isUnlocked) {
                unlockedBoxes.push(boxHtml);
            } else {
                lockedBoxes.push(boxHtml);
            }
        }

        const hasLocked = lockedBoxes.length > 0;
        let toggleLinkTop = "";
        let toggleLinkBottom = "";

        if (hasLocked) {
            if (!this.progressionExpanded) {
                toggleLinkTop = `
                    <div class="progression-load-more-container">
                        <a href="javascript:void(0)" class="progression-toggle-link load-more" id="progression-load-more-link" role="button">
                            <i class="fa-solid fa-chevron-down"></i> Load more
                        </a>
                    </div>
                `;
            } else {
                toggleLinkTop = `
                    <div class="progression-load-more-container">
                        <a href="javascript:void(0)" class="progression-toggle-link show-less" id="progression-load-more-link" role="button">
                            <i class="fa-solid fa-chevron-up"></i> Show less
                        </a>
                    </div>
                `;
                toggleLinkBottom = `
                    <div class="progression-load-more-container progression-load-more-bottom">
                        <a href="javascript:void(0)" class="progression-toggle-link show-less" id="progression-show-less-bottom-link" role="button">
                            <i class="fa-solid fa-chevron-up"></i> Show less
                        </a>
                    </div>
                `;
            }
        }

        return `
            <div class="creator-detail-box class-progression-box progression-main-header">
                <div class="progression-box-header" style="margin: 0;">
                    <div class="progression-header-text">
                        <h4 style="margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--text);">
                            <i class="fa-solid fa-layer-group"></i> ${cls.name} Level Progression (Levels 1–20)
                        </h4>
                        <p class="card-body" style="margin: 0.25rem 0 0;">
                            New abilities, features, and choices gained at each level for the ${cls.name} class. Features active at your current level (Level ${charLevel}) are marked Active.
                        </p>
                    </div>
                </div>
            </div>

            ${unlockedBoxes.join("")}
            ${toggleLinkTop}
            ${lockedBoxes.join("")}
            ${toggleLinkBottom}
        `;
    }

    private renderStep4Background(): string {
        const currentBg = this.backgrounds.find((b) => b.id === this.state.backgroundId) || this.backgrounds[0];
        const feat = this.originFeats.find((f) => f.id === currentBg.originFeatId) || this.originFeats[0];
        const allowed = currentBg.allowedAbilities;

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">Choose Background & Origin Feat</h3>
                    <p class="panel-desc">In 5.5e, your background determines your Ability Score Increases (+2/+1 or +1/+1/+1), 2 skill proficiencies, 1 tool, and 1 Origin Feat.</p>
                </div>
                <div class="card-select-grid">
                    ${this.backgrounds.map((bg) => `
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

                ${this.getAsiLevels().length > 0 ? `
                    <div class="creator-detail-box asi-section" style="margin-top: 1.5rem;">
                        <h4><i class="fa-solid fa-arrow-up-right-dots"></i> Ability Score Improvements & Feats</h4>
                        <p class="card-body">Your character has reached levels that grant an Ability Score Improvement or Feat. Choose how to distribute your increases.</p>
                        <div class="asi-milestones-container">
                            ${this.getAsiLevels().map((lvl) => this.renderAsiMilestoneCard(lvl)).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    private renderAsiMilestoneCard(lvl: number): string {
        this.ensureAsiChoices();
        const choice = this.state.asiChoices[lvl] || { type: "single", statA: "str" };
        const stats: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
        const labels: Record<AbilityName, string> = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };
        const isEpicLevel = lvl >= 19;
        const availableFeats = isEpicLevel
            ? this.generalFeats
            : this.generalFeats.filter((f) => !f.isEpicBoon);

        const currentFeat = availableFeats.find((f) => f.id === choice.featId) || availableFeats[0];
        const allowedFeatStats = currentFeat?.allowedStats || stats;

        return `
            <div class="asi-milestone-card" data-asi-level="${lvl}">
                <div class="asi-card-header">
                    <span class="asi-level-badge">Level ${lvl} Improvement</span>
                    <div class="asi-type-selector">
                        <label class="asi-type-radio-label">
                            <input type="radio" class="asi-type-radio" name="asi-type-${lvl}" data-asi-level="${lvl}" value="single" ${choice.type === "single" ? "checked" : ""} />
                            <span>+2 to One Stat</span>
                        </label>
                        <label class="asi-type-radio-label">
                            <input type="radio" class="asi-type-radio" name="asi-type-${lvl}" data-asi-level="${lvl}" value="dual" ${choice.type === "dual" ? "checked" : ""} />
                            <span>+1 to Two Stats</span>
                        </label>
                        <label class="asi-type-radio-label">
                            <input type="radio" class="asi-type-radio" name="asi-type-${lvl}" data-asi-level="${lvl}" value="feat" ${choice.type === "feat" ? "checked" : ""} />
                            <span>${isEpicLevel ? "Epic Boon / Feat" : "General Feat (+1 Stat)"}</span>
                        </label>
                    </div>
                </div>

                <div class="asi-inputs-row">
                    ${choice.type === "single" ? `
                        <div class="asi-select-wrap">
                            <label class="asi-select-label">Select Ability (+2):</label>
                            <select class="creator-select asi-stat-select" data-asi-field="statA" data-asi-level="${lvl}">
                                ${stats.map((st) => `
                                    <option value="${st}" ${choice.statA === st ? "selected" : ""}>${labels[st]} (Current: ${this.getEffectiveAbilityScore(st)})</option>
                                `).join("")}
                            </select>
                        </div>
                    ` : choice.type === "dual" ? `
                        <div class="asi-select-wrap">
                            <label class="asi-select-label">First Ability (+1):</label>
                            <select class="creator-select asi-stat-select" data-asi-field="statA" data-asi-level="${lvl}">
                                ${stats.map((st) => `
                                    <option value="${st}" ${choice.statA === st ? "selected" : ""}>${labels[st]} (Current: ${this.getEffectiveAbilityScore(st)})</option>
                                `).join("")}
                            </select>
                        </div>
                        <div class="asi-select-wrap">
                            <label class="asi-select-label">Second Ability (+1):</label>
                            <select class="creator-select asi-stat-select" data-asi-field="statB" data-asi-level="${lvl}">
                                ${stats.map((st) => `
                                    <option value="${st}" ${(choice.statB || "dex") === st ? "selected" : ""}>${labels[st]} (Current: ${this.getEffectiveAbilityScore(st)})</option>
                                `).join("")}
                            </select>
                        </div>
                    ` : `
                        <div class="asi-select-wrap" style="flex: 2;">
                            <label class="asi-select-label">Choose Feat:</label>
                            <select class="creator-select asi-feat-select" data-asi-level="${lvl}">
                                ${availableFeats.map((f) => `
                                    <option value="${f.id}" ${choice.featId === f.id ? "selected" : ""}>${f.name}${f.isEpicBoon ? " (Epic Boon)" : ""}</option>
                                `).join("")}
                            </select>
                            <p class="asi-feat-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem;">${currentFeat?.description}</p>
                        </div>
                        <div class="asi-select-wrap" style="flex: 1;">
                            <label class="asi-select-label">Feat Ability (+1):</label>
                            <select class="creator-select asi-stat-select" data-asi-field="statA" data-asi-level="${lvl}">
                                ${allowedFeatStats.map((st) => `
                                    <option value="${st}" ${choice.statA === st ? "selected" : ""}>${labels[st]} (Current: ${this.getEffectiveAbilityScore(st)})</option>
                                `).join("")}
                            </select>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    private renderStep6Skills(): string {
        const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
        const bg = this.backgrounds.find((b) => b.id === this.state.backgroundId) || this.backgrounds[0];
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

                ${this.getMaxExpertiseCount() > 0 ? `
                    <div class="creator-detail-box" style="margin-top: 1.5rem;">
                        <h4><i class="fa-solid fa-star"></i> Expertise (Choose up to ${this.getMaxExpertiseCount()})</h4>
                        <p class="card-body">Your proficiency bonus is doubled for any ability check you make that uses the chosen proficiencies.</p>
                        <div class="skills-select-grid">
                            ${ALL_SKILLS.filter((sk) => {
                                const isBgSkill = bgSkills.includes(sk.name);
                                const isHumanExtra = this.state.speciesId === "human" && this.state.humanExtraSkill === sk.name;
                                const isClassSkill = this.state.classSkills.includes(sk.name);
                                return isBgSkill || isHumanExtra || isClassSkill;
                            }).map((sk) => {
                                const isExpert = this.state.expertiseSkills.includes(sk.name);
                                return `
                                    <div class="skill-checkbox-card expertise-skill-card ${isExpert ? "selected" : ""}" data-skill-name="${sk.name}">
                                        <div class="skill-info">
                                            <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                            <span class="skill-name">${sk.name}</span>
                                        </div>
                                        <span class="skill-stat-badge">${sk.stat.toUpperCase()}</span>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>
                ` : ""}
            </div>
        `;
    }

    private renderStep7Equipment(): string {
        const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
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
                        <div class="starting-packages-header-row">
                            <h4 class="starting-packages-title"><i class="fa-solid fa-box-open"></i> ${cls.name} Starting Equipment Kits</h4>
                            ${(() => {
                                const eqIdx = cls.startingEquipmentOptions.findIndex((_, i) => this.isKitEquipped(i));
                                if (eqIdx >= 0) {
                                    const eqOpt = cls.startingEquipmentOptions[eqIdx];
                                    return `
                                        <div class="kit-equipped-banner">
                                            <i class="fa-solid fa-circle-check"></i>
                                            <span><strong>Option ${String.fromCharCode(65 + eqIdx)}: ${eqOpt.name}</strong> is equipped</span>
                                        </div>
                                    `;
                                }
                                return "";
                            })()}
                        </div>
                        <div class="starting-packages-grid">
                            ${cls.startingEquipmentOptions.map((opt, idx) => {
                                const isEquipped = this.isKitEquipped(idx);
                                return `
                                    <div class="starting-package-card ${isEquipped ? "equipped" : ""}" data-package-index="${idx}">
                                        <div class="package-card-header">
                                            <div class="package-card-title-group">
                                                <strong>Option ${String.fromCharCode(65 + idx)}: ${opt.name}</strong>
                                                ${isEquipped ? `<span class="package-equipped-badge"><i class="fa-solid fa-check"></i> Equipped</span>` : ""}
                                            </div>
                                            <button type="button" class="creator-nav-btn secondary-btn equip-package-btn ${isEquipped ? "equipped" : ""}" data-package-index="${idx}">
                                                ${isEquipped ? `<i class="fa-solid fa-circle-check"></i> Equipped` : `<i class="fa-solid fa-wand-magic-sparkles"></i> Equip Kit`}
                                            </button>
                                        </div>
                                        <ul class="package-items-list">
                                            ${opt.items.map((it) => `<li>${it}</li>`).join("")}
                                        </ul>
                                    </div>
                                `;
                            }).join("")}
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
        this.sanitizeSpellSelections();

        const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
        const maxCantrips = this.getMaxCantrips();
        const maxPrepared = this.getMaxPreparedSpells();
        const maxSpellLevel = this.getMaxSpellLevel();
        const hasSpellcasting = maxCantrips > 0 || maxPrepared > 0;

        if (!hasSpellcasting) {
            return `
                <div class="step-panel active">
                    <div class="panel-header">
                        <h3 class="panel-title">Spells & Magic (${cls.name})</h3>
                        <p class="panel-desc">Your class does not have spellcasting features at Level ${this.state.level}.</p>
                    </div>
                    <div class="equipment-stat-alert warning">
                        <i class="fa-solid fa-circle-info"></i>
                        <div>
                            <strong>No Spellcasting:</strong> As a Level ${this.state.level} ${cls.name}, your character does not learn cantrips or prepare spell slots.
                            <div style="margin-top: 0.35rem; font-size: 0.8rem; color: var(--text-muted);">
                                You may proceed to Step 9 (Review), or choose an Origin Feat like <em>Magic Initiate</em> in Step 4 to gain bonus spells.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const available = this.getAvailableSpells();
        const ability = this.getSpellcastingAbility();
        const abilityMod = ability ? this.getAbilityModifier(ability) : 0;
        const saveDc = this.getSpellSaveDc();
        const attackMod = this.getSpellAttackModifier();
        const slotsSummary = this.getSpellSlotsSummary();

        const cantripsChosen = this.state.selectedCantrips.length;
        const spellsChosen = this.state.selectedSpellsLevel1.length;

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <div class="spells-header-row">
                        <div>
                            <h3 class="panel-title">Spells (${cls.name})</h3>
                            <p class="panel-desc">Select cantrips and prepared spells according to your class limits at Level ${this.state.level}.</p>
                        </div>
                        <div class="spells-actions-row">
                            <button type="button" class="creator-nav-btn secondary-btn auto-spells-btn">
                                <i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Fill
                            </button>
                            <button type="button" class="creator-nav-btn secondary-btn clear-spells-btn">
                                <i class="fa-solid fa-rotate-left"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div class="spellcaster-stats-banner">
                    ${ability ? `
                        <div class="stat-badge">
                            <span class="label">Spell Ability</span>
                            <strong>${ability.toUpperCase()} (${abilityMod >= 0 ? "+" : ""}${abilityMod})</strong>
                        </div>
                    ` : ""}
                    ${saveDc != null ? `
                        <div class="stat-badge">
                            <span class="label">Spell Save DC</span>
                            <strong>${saveDc}</strong>
                        </div>
                    ` : ""}
                    ${attackMod != null ? `
                        <div class="stat-badge">
                            <span class="label">Spell Attack</span>
                            <strong>${attackMod >= 0 ? "+" : ""}${attackMod}</strong>
                        </div>
                    ` : ""}
                    <div class="stat-badge">
                        <span class="label">Spell Slots</span>
                        <strong>${slotsSummary}</strong>
                    </div>
                </div>

                <div class="creator-detail-box">
                    <div class="box-header-with-badge">
                        <h4>Cantrips (Level 0)</h4>
                        ${maxCantrips > 0 ? `
                            <span class="spell-count-badge ${cantripsChosen === maxCantrips ? "maxed" : "info"}">
                                <i class="fa-solid ${cantripsChosen === maxCantrips ? "fa-check" : "fa-sparkles"}"></i>
                                ${cantripsChosen} / ${maxCantrips} Chosen
                            </span>
                        ` : `
                            <span class="spell-count-badge zero">
                                <i class="fa-solid fa-ban"></i> 0 Cantrips for ${cls.name}
                            </span>
                        `}
                    </div>

                    ${maxCantrips === 0 ? `
                        <p class="creator-empty-notice">
                            <i class="fa-solid fa-circle-info"></i>
                            ${cls.name} does not prepare cantrips at Level ${this.state.level}.
                        </p>
                    ` : `
                        <div class="item-select-list">
                            ${available.cantrips.map((sp) => {
                                const isSelected = this.state.selectedCantrips.includes(sp.name);
                                const isLimitReached = !isSelected && cantripsChosen >= maxCantrips;
                                return `
                                    <div class="item-check-row cantrip-row ${isSelected ? "selected" : ""} ${isLimitReached ? "limit-reached" : ""}" 
                                         data-spell-name="${sp.name}"
                                         ${isLimitReached ? 'title="Cantrip limit reached. Deselect one to choose this cantrip."' : ""}>
                                        <div class="item-row-left">
                                            <div class="item-row-title">
                                                ${sp.name} (${sp.school})
                                                ${isLimitReached ? '<span class="stat-req-pill unmet"><i class="fa-solid fa-lock"></i> Allotment Full</span>' : ""}
                                            </div>
                                            <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                            <div class="item-row-desc">${sp.description}</div>
                                        </div>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    `}
                </div>

                <div class="creator-detail-box" style="margin-top: 1rem;">
                    <div class="box-header-with-badge">
                        <h4>Prepared Spells ${maxSpellLevel > 1 ? `(Levels 1–${maxSpellLevel})` : "(Level 1)"}</h4>
                        ${maxPrepared > 0 ? `
                            <span class="spell-count-badge ${spellsChosen === maxPrepared ? "maxed" : "info"}">
                                <i class="fa-solid ${spellsChosen === maxPrepared ? "fa-check" : "fa-book"}"></i>
                                ${spellsChosen} / ${maxPrepared} Prepared
                            </span>
                        ` : `
                            <span class="spell-count-badge zero">
                                <i class="fa-solid fa-ban"></i> 0 Spells for ${cls.name}
                            </span>
                        `}
                    </div>

                    ${maxPrepared === 0 ? `
                        <p class="creator-empty-notice">
                            <i class="fa-solid fa-circle-info"></i>
                            ${cls.name} does not prepare spells at Level ${this.state.level}.
                        </p>
                    ` : `
                        <div class="spells-filter-bar">
                            <div class="spell-search-box">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" id="spell-search-input" class="creator-input" placeholder="Search spells by name or school..." value="${this.spellSearchQuery}" />
                            </div>
                            ${maxSpellLevel > 1 ? `
                                <div class="spell-level-tabs">
                                    <button type="button" class="spell-tab-btn ${this.activeSpellLevelFilter === "all" ? "active" : ""}" data-level="all">
                                        All (${available.leveledSpells.length})
                                    </button>
                                    ${Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map((lvl) => {
                                        const count = available.leveledSpells.filter((s) => s.level === lvl).length;
                                        if (count === 0) return "";
                                        const prepCount = this.state.selectedSpellsLevel1.filter((name) => {
                                            const s = SPELLS_2024.find((sp) => sp.name === name);
                                            return s?.level === lvl;
                                        }).length;
                                        return `
                                            <button type="button" class="spell-tab-btn ${this.activeSpellLevelFilter === lvl ? "active" : ""}" data-level="${lvl}">
                                                Lvl ${lvl} (${prepCount > 0 ? `${prepCount}/` : ""}${count})
                                            </button>
                                        `;
                                    }).join("")}
                                </div>
                            ` : ""}
                        </div>

                        <div class="item-select-list">
                            ${(this.activeSpellLevelFilter === "all" ? available.leveledSpells : available.leveledSpells.filter((s) => s.level === this.activeSpellLevelFilter)).map((sp) => {
                                const isSelected = this.state.selectedSpellsLevel1.includes(sp.name);
                                const isLimitReached = !isSelected && spellsChosen >= maxPrepared;
                                return `
                                    <div class="item-check-row spell1-row ${isSelected ? "selected" : ""} ${isLimitReached ? "limit-reached" : ""}" 
                                         data-spell-name="${sp.name}"
                                         data-spell-school="${sp.school}"
                                         data-spell-level="${sp.level}"
                                         ${isLimitReached ? 'title="Prepared spell limit reached. Deselect one to prepare this spell."' : ""}>
                                        <div class="item-row-left">
                                            <div class="item-row-title">
                                                <span>${sp.name}</span>
                                                <span class="stat-req-pill met">Lvl ${sp.level}</span>
                                                <span class="stat-req-pill">${sp.school}</span>
                                                ${sp.ritual ? '<span class="stat-req-pill met"><i class="fa-solid fa-scroll"></i> Ritual</span>' : ""}
                                                ${sp.concentration ? '<span class="stat-req-pill unmet"><i class="fa-solid fa-brain"></i> Conc.</span>' : ""}
                                                ${isLimitReached ? '<span class="stat-req-pill unmet"><i class="fa-solid fa-lock"></i> Allotment Full</span>' : ""}
                                            </div>
                                            <div class="item-row-meta">${sp.castingTime} • ${sp.range} • ${sp.duration}</div>
                                            <div class="item-row-desc">${sp.description}</div>
                                        </div>
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    private renderStep9Review(): string {
        const species = this.species.find((s) => s.id === this.state.speciesId)?.name || "";
        const currentClsDef = this.classes.find((c) => c.id === this.state.classId);
        const cls = currentClsDef?.name || "";
        const bg = this.backgrounds.find((b) => b.id === this.state.backgroundId)?.name || "";
        const feat = this.originFeats.find((f) => f.id === this.state.originFeatId)?.name || "";
        const spellAbility = this.getSpellcastingAbility();

        return `
            <div class="step-panel active">
                <div class="panel-header">
                    <h3 class="panel-title">${this.state.savedId ? "Review & Save Character Changes" : "Review & Finalize Character"}</h3>
                    <p class="panel-desc">Inspect your completed character profile before saving to the database.</p>
                </div>

                <div class="review-card-layout">
                    <div class="review-section">
                        <h4>Hero Overview</h4>
                        <div class="review-row"><span class="label">Name:</span><strong>${this.state.name}</strong></div>
                        <div class="review-row"><span class="label">Class & Level:</span><strong>${cls} (Level ${this.state.level})</strong></div>
                        ${this.state.subclassId ? `<div class="review-row"><span class="label">Subclass:</span><strong>${currentClsDef?.subclasses.find((s) => s.id === this.state.subclassId)?.name || this.state.subclassId}</strong></div>` : ""}
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
                        <div class="review-row"><span class="label">Speed:</span><strong>${this.getSpeedDisplay()}</strong></div>
                        <div class="review-row"><span class="label">Proficiency Bonus:</span><strong>+${this.getProficiencyBonus()}</strong></div>
                    </div>

                    <div class="review-section">
                        <h4>Class & Progression Features</h4>
                        ${this.state.fightingStyle ? `<div class="review-row"><span class="label">Fighting Style:</span><strong>${FIGHTING_STYLES.find((f) => f.id === this.state.fightingStyle)?.name || this.state.fightingStyle}</strong></div>` : ""}
                        ${this.state.divineOrder ? `<div class="review-row"><span class="label">Divine Order:</span><strong>${DIVINE_ORDERS.find((o) => o.id === this.state.divineOrder)?.name || this.state.divineOrder}</strong></div>` : ""}
                        ${this.state.primalOrder ? `<div class="review-row"><span class="label">Primal Order:</span><strong>${PRIMAL_ORDERS.find((o) => o.id === this.state.primalOrder)?.name || this.state.primalOrder}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["wizard-2-scholar"] && this.state.classId === "wizard" && this.state.level >= 2 ? `<div class="review-row"><span class="label">Scholar:</span><strong>${WIZARD_SCHOLAR_SKILLS.find((s) => s.id === this.state.subclassFeatureChoices["wizard-2-scholar"])?.name || this.state.subclassFeatureChoices["wizard-2-scholar"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-3-wild-heart"] && this.state.classId === "barbarian" && this.state.subclassId === "wild-heart" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Rage of the Wilds:</span><strong>${WILD_HEART_RAGES.find((r) => r.id === this.state.subclassFeatureChoices["barbarian-3-wild-heart"])?.name || this.state.subclassFeatureChoices["barbarian-3-wild-heart"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-3-zealot"] && this.state.classId === "barbarian" && this.state.subclassId === "zealot" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Divine Fury:</span><strong>${ZEALOT_DIVINE_FURIES.find((z) => z.id === this.state.subclassFeatureChoices["barbarian-3-zealot"])?.name || this.state.subclassFeatureChoices["barbarian-3-zealot"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["monk-3-elements"] && this.state.classId === "monk" && this.state.subclassId === "elements" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Elemental Attunement:</span><strong>${ELEMENTS_ATTUNEMENT_DAMAGE_TYPES.find((e) => e.id === this.state.subclassFeatureChoices["monk-3-elements"])?.name || this.state.subclassFeatureChoices["monk-3-elements"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["ranger-3-beast-master"] && this.state.classId === "ranger" && this.state.subclassId === "beast-master" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Primal Companion:</span><strong>${PRIMAL_COMPANION_TYPES.find((p) => p.id === this.state.subclassFeatureChoices["ranger-3-beast-master"])?.name || this.state.subclassFeatureChoices["ranger-3-beast-master"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["ranger-3-hunter"] && this.state.classId === "ranger" && this.state.subclassId === "hunter" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Hunter's Prey:</span><strong>${HUNTER_PREY_OPTIONS.find((h) => h.id === this.state.subclassFeatureChoices["ranger-3-hunter"])?.name || this.state.subclassFeatureChoices["ranger-3-hunter"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["fighter-3-battle-master-student"] && this.state.classId === "fighter" && this.state.subclassId === "battle-master" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Student of War:</span><strong>${STUDENT_OF_WAR_SKILLS.find((s) => s.id === this.state.subclassFeatureChoices["fighter-3-battle-master-student"])?.name || this.state.subclassFeatureChoices["fighter-3-battle-master-student"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["monk-3-open-hand"] && this.state.classId === "monk" && this.state.subclassId === "open-hand" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Open Hand Technique:</span><strong>${OPEN_HAND_TECHNIQUES.find((t) => t.id === this.state.subclassFeatureChoices["monk-3-open-hand"])?.name || this.state.subclassFeatureChoices["monk-3-open-hand"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["ranger-3-fey-wanderer"] && this.state.classId === "ranger" && this.state.subclassId === "fey-wanderer" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Otherworldly Glamour:</span><strong>${FEY_WANDERER_GLAMOUR_SKILLS.find((s) => s.id === this.state.subclassFeatureChoices["ranger-3-fey-wanderer"])?.name || this.state.subclassFeatureChoices["ranger-3-fey-wanderer"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["warlock-3-archfey"] && this.state.classId === "warlock" && this.state.subclassId === "archfey" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Steps of the Fey:</span><strong>${STEPS_OF_THE_FEY_OPTIONS.find((s) => s.id === this.state.subclassFeatureChoices["warlock-3-archfey"])?.name || this.state.subclassFeatureChoices["warlock-3-archfey"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["druid-3-stars"] && this.state.classId === "druid" && this.state.subclassId === "stars" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Starry Form:</span><strong>${STARRY_FORM_CONSTELLATIONS.find((c) => c.id === this.state.subclassFeatureChoices["druid-3-stars"])?.name || this.state.subclassFeatureChoices["druid-3-stars"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["druid-3-sea"] && this.state.classId === "druid" && this.state.subclassId === "sea" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Wrath of the Sea:</span><strong>${SEA_WRATH_DAMAGE_TYPES.find((w) => w.id === this.state.subclassFeatureChoices["druid-3-sea"])?.name || this.state.subclassFeatureChoices["druid-3-sea"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["druid-3-moon"] && this.state.classId === "druid" && this.state.subclassId === "moon" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Circle Forms Strike:</span><strong>${MOON_CIRCLE_FORMS_STRIKES.find((m) => m.id === this.state.subclassFeatureChoices["druid-3-moon"])?.name || this.state.subclassFeatureChoices["druid-3-moon"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["sorcerer-3-draconic"] && this.state.classId === "sorcerer" && this.state.subclassId === "draconic" && this.state.level >= 3 ? `<div class="review-row"><span class="label">Draconic Ancestor:</span><strong>${DRACONIC_ANCESTOR_ELEMENTS.find((d) => d.id === this.state.subclassFeatureChoices["sorcerer-3-draconic"])?.name || this.state.subclassFeatureChoices["sorcerer-3-draconic"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["rogue-5-cunning-strike"] && this.state.classId === "rogue" && this.state.level >= 5 ? `<div class="review-row"><span class="label">Cunning Strike:</span><strong>${ROGUE_CUNNING_STRIKES.find((c) => c.id === this.state.subclassFeatureChoices["rogue-5-cunning-strike"])?.name || this.state.subclassFeatureChoices["rogue-5-cunning-strike"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["druid-6-land"] && this.state.classId === "druid" && this.state.subclassId === "land" && this.state.level >= 6 ? `<div class="review-row"><span class="label">Land Biome:</span><strong>${DRUID_LAND_BIOMES.find((b) => b.id === this.state.subclassFeatureChoices["druid-6-land"])?.name || this.state.subclassFeatureChoices["druid-6-land"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["druid-6-stars"] && this.state.classId === "druid" && this.state.subclassId === "stars" && this.state.level >= 6 ? `<div class="review-row"><span class="label">Cosmic Omen:</span><strong>${COSMIC_OMEN_OPTIONS.find((o) => o.id === this.state.subclassFeatureChoices["druid-6-stars"])?.name || this.state.subclassFeatureChoices["druid-6-stars"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["cleric-6-war"] && this.state.classId === "cleric" && this.state.subclassId === "war" && this.state.level >= 6 ? `<div class="review-row"><span class="label">War God's Blessing:</span><strong>${WAR_GOD_BLESSING_OPTIONS.find((w) => w.id === this.state.subclassFeatureChoices["cleric-6-war"])?.name || this.state.subclassFeatureChoices["cleric-6-war"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-6-wild-heart"] && this.state.classId === "barbarian" && this.state.subclassId === "wild-heart" && this.state.level >= 6 ? `<div class="review-row"><span class="label">Aspect of the Beast:</span><strong>${BARBARIAN_ASPECTS.find((a) => a.id === this.state.subclassFeatureChoices["barbarian-6-wild-heart"])?.name || this.state.subclassFeatureChoices["barbarian-6-wild-heart"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["ranger-6-hunter"] && this.state.classId === "ranger" && this.state.subclassId === "hunter" && this.state.level >= 6 ? `<div class="review-row"><span class="label">Defensive Tactics:</span><strong>${HUNTER_DEFENSIVE_TACTICS.find((t) => t.id === this.state.subclassFeatureChoices["ranger-6-hunter"])?.name || this.state.subclassFeatureChoices["ranger-6-hunter"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["druid-7"] && this.state.classId === "druid" && this.state.level >= 7 ? `<div class="review-row"><span class="label">Elemental Fury:</span><strong>${ELEMENTAL_FURY_OPTIONS.find((o) => o.id === this.state.subclassFeatureChoices["druid-7"])?.name || this.state.subclassFeatureChoices["druid-7"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["cleric-7"] && this.state.classId === "cleric" && this.state.level >= 7 ? `<div class="review-row"><span class="label">Blessed Strikes:</span><strong>${BLESSED_STRIKES_OPTIONS.find((o) => o.id === this.state.subclassFeatureChoices["cleric-7"])?.name || this.state.subclassFeatureChoices["cleric-7"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["fighter-7-champion"] && this.state.classId === "fighter" && this.state.subclassId === "champion" && this.state.level >= 7 ? `<div class="review-row"><span class="label">Additional Fighting Style:</span><strong>${CHAMPION_ADDITIONAL_FIGHTING_STYLES.find((s) => s.id === this.state.subclassFeatureChoices["fighter-7-champion"])?.name || this.state.subclassFeatureChoices["fighter-7-champion"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["fighter-7-psi-warrior"] && this.state.classId === "fighter" && this.state.subclassId === "psi-warrior" && this.state.level >= 7 ? `<div class="review-row"><span class="label">Telekinetic Thrust:</span><strong>${PSI_WARRIOR_THRUST_OPTIONS.find((p) => p.id === this.state.subclassFeatureChoices["fighter-7-psi-warrior"])?.name || this.state.subclassFeatureChoices["fighter-7-psi-warrior"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-9-brutal-strike"] && this.state.classId === "barbarian" && this.state.level >= 9 ? `<div class="review-row"><span class="label">Brutal Strike:</span><strong>${BRUTAL_STRIKE_OPTIONS.find((b) => b.id === this.state.subclassFeatureChoices["barbarian-9-brutal-strike"])?.name || this.state.subclassFeatureChoices["barbarian-9-brutal-strike"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["fighter-9-tactical-master"] && this.state.classId === "fighter" && this.state.level >= 9 ? `<div class="review-row"><span class="label">Tactical Master:</span><strong>${TACTICAL_MASTER_PROPERTIES.find((t) => t.id === this.state.subclassFeatureChoices["fighter-9-tactical-master"])?.name || this.state.subclassFeatureChoices["fighter-9-tactical-master"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-10-world-tree"] && this.state.classId === "barbarian" && this.state.subclassId === "world-tree" && this.state.level >= 10 ? `<div class="review-row"><span class="label">Battering Roots:</span><strong>${BATTERING_ROOTS_OPTIONS.find((b) => b.id === this.state.subclassFeatureChoices["barbarian-10-world-tree"])?.name || this.state.subclassFeatureChoices["barbarian-10-world-tree"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["warlock-10-fiend"] && this.state.classId === "warlock" && this.state.subclassId === "fiend" && this.state.level >= 10 ? `<div class="review-row"><span class="label">Fiendish Resilience:</span><strong>${FIENDISH_RESILIENCE_DAMAGE_TYPES.find((f) => f.id === this.state.subclassFeatureChoices["warlock-10-fiend"])?.name || this.state.subclassFeatureChoices["warlock-10-fiend"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["wizard-10-diviner"] && this.state.classId === "wizard" && this.state.subclassId === "diviner" && this.state.level >= 10 ? `<div class="review-row"><span class="label">The Third Eye:</span><strong>${DIVINER_THIRD_EYE_OPTIONS.find((o) => o.id === this.state.subclassFeatureChoices["wizard-10-diviner"])?.name || this.state.subclassFeatureChoices["wizard-10-diviner"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-13-brutal-strike"] && this.state.classId === "barbarian" && this.state.level >= 13 ? `<div class="review-row"><span class="label">Improved Brutal Strike:</span><strong>${IMPROVED_BRUTAL_STRIKE_OPTIONS.find((b) => b.id === this.state.subclassFeatureChoices["barbarian-13-brutal-strike"])?.name || this.state.subclassFeatureChoices["barbarian-13-brutal-strike"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["barbarian-14-wild-heart"] && this.state.classId === "barbarian" && this.state.subclassId === "wild-heart" && this.state.level >= 14 ? `<div class="review-row"><span class="label">Totemic Attunement:</span><strong>${WILD_HEART_TOTEMIC_ATTUNEMENTS.find((t) => t.id === this.state.subclassFeatureChoices["barbarian-14-wild-heart"])?.name || this.state.subclassFeatureChoices["barbarian-14-wild-heart"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["rogue-14-devious-strike"] && this.state.classId === "rogue" && this.state.level >= 14 ? `<div class="review-row"><span class="label">Devious Strike:</span><strong>${ROGUE_DEVIOUS_STRIKES.find((d) => d.id === this.state.subclassFeatureChoices["rogue-14-devious-strike"])?.name || this.state.subclassFeatureChoices["rogue-14-devious-strike"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["sorcerer-14-aberrant"] && this.state.classId === "sorcerer" && this.state.subclassId === "aberrant" && this.state.level >= 14 ? `<div class="review-row"><span class="label">Revelation in Flesh:</span><strong>${ABERRANT_REVELATION_OPTIONS.find((a) => a.id === this.state.subclassFeatureChoices["sorcerer-14-aberrant"])?.name || this.state.subclassFeatureChoices["sorcerer-14-aberrant"]}</strong></div>` : ""}
                        ${this.state.subclassFeatureChoices?.["ranger-15-hunter"] && this.state.classId === "ranger" && this.state.subclassId === "hunter" && this.state.level >= 15 ? `<div class="review-row"><span class="label">Superior Hunter's Defense:</span><strong>${HUNTER_SUPERIOR_DEFENSE_OPTIONS.find((o) => o.id === this.state.subclassFeatureChoices["ranger-15-hunter"])?.name || this.state.subclassFeatureChoices["ranger-15-hunter"]}</strong></div>` : ""}
                        ${this.state.metamagic.length > 0 ? `<div class="review-row"><span class="label">Metamagic:</span><strong>${this.state.metamagic.map((m) => METAMAGIC_OPTIONS.find((o) => o.id === m)?.name || m).join(", ")}</strong></div>` : ""}
                        ${this.state.invocations.length > 0 ? `<div class="review-row"><span class="label">Invocations:</span><strong>${this.state.invocations.map((i) => ELDRITCH_INVOCATIONS.find((o) => o.id === i)?.name || i).join(", ")}</strong></div>` : ""}
                        ${this.state.maneuvers.length > 0 ? `<div class="review-row"><span class="label">Maneuvers:</span><strong>${this.state.maneuvers.map((m) => BATTLE_MASTER_MANEUVERS.find((o) => o.id === m)?.name || m).join(", ")}</strong></div>` : ""}
                        ${this.state.expertiseSkills.length > 0 ? `<div class="review-row"><span class="label">Expertise Skills:</span><strong>${this.state.expertiseSkills.join(", ")}</strong></div>` : ""}
                        ${this.getAsiLevels().length > 0 ? `
                            <div class="review-row" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                                <span class="label">Ability Improvements & Feats:</span>
                                ${this.getAsiLevels().map((lvl) => {
                                    const ch = this.state.asiChoices[lvl];
                                    if (!ch) return `<div>• Level ${lvl}: Standard Increase</div>`;
                                    if (ch.type === "single") return `<div>• Level ${lvl}: +2 ${ch.statA?.toUpperCase()}</div>`;
                                    if (ch.type === "dual") return `<div>• Level ${lvl}: +1 ${ch.statA?.toUpperCase()}, +1 ${ch.statB?.toUpperCase()}</div>`;
                                    const fDef = this.generalFeats.find((f) => f.id === ch.featId);
                                    return `<div>• Level ${lvl}: Feat (${fDef?.name || ch.featId}) [+1 ${ch.statA?.toUpperCase()}]</div>`;
                                }).join("")}
                            </div>
                        ` : ""}
                    </div>

                    <div class="review-section" style="grid-column: 1 / -1;">
                        <h4>Magic & Spells</h4>
                        <div class="review-row"><span class="label">Cantrips (${this.state.selectedCantrips.length}/${this.getMaxCantrips()}):</span><strong>${this.state.selectedCantrips.join(", ") || "None"}</strong></div>
                        <div class="review-row"><span class="label">Prepared Spells (${this.state.selectedSpellsLevel1.length}/${this.getMaxPreparedSpells()}):</span><strong>${this.state.selectedSpellsLevel1.map((name) => {
                            const sp = SPELLS_2024.find((s) => s.name === name);
                            return sp ? `${name} (Lvl ${sp.level})` : name;
                        }).join(", ") || "None"}</strong></div>
                        ${spellAbility ? `
                            <div class="review-row"><span class="label">Spellcasting:</span><strong>${spellAbility.toUpperCase()} (Save DC: ${this.getSpellSaveDc()}, Attack: +${this.getSpellAttackModifier()}, Max Slot Level: ${this.getMaxSpellLevel()}, Slots: ${this.getSpellSlotsSummary()})</strong></div>
                        ` : ""}
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
                this.sanitizeSpellSelections();
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
                    const sp = this.species.find((s) => s.id === spId);
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
                    const cls = this.classes.find((c) => c.id === cId);
                    this.state.subclassId = cls?.subclasses?.[0]?.id || "";
                    this.state.weaponMasteries = [];
                    if (cls) {
                        this.initClassDefaultEquipment(cls);
                    }
                    this.sanitizeSpellSelections();
                    this.renderStep(3);
                    this.updateLiveSummary();
                });
            });

            document.querySelectorAll(".subclass-card").forEach((card) => {
                card.addEventListener("click", () => {
                    this.state.subclassId = card.getAttribute("data-subclass-id") || "";
                    this.sanitizeSpellSelections();
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".mastery-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const wName = card.getAttribute("data-weapon-name") || "";
                    const cls = this.classes.find((c) => c.id === this.state.classId);
                    const maxM = cls?.weaponMasteryCount || 0;
                    if (this.state.weaponMasteries.includes(wName)) {
                        this.state.weaponMasteries = this.state.weaponMasteries.filter((w) => w !== wName);
                    } else if (this.state.weaponMasteries.length < maxM) {
                        this.state.weaponMasteries.push(wName);
                    }
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".fighting-style-card").forEach((card) => {
                card.addEventListener("click", () => {
                    this.state.fightingStyle = card.getAttribute("data-fighting-style-id") || "";
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".divine-order-card").forEach((card) => {
                card.addEventListener("click", () => {
                    this.state.divineOrder = card.getAttribute("data-divine-order-id") || "";
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".primal-order-card").forEach((card) => {
                card.addEventListener("click", () => {
                    this.state.primalOrder = card.getAttribute("data-primal-order-id") || "";
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".metamagic-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const metaId = card.getAttribute("data-metamagic-id") || "";
                    const maxCount = this.getMaxMetamagicCount();
                    if (this.state.metamagic.includes(metaId)) {
                        this.state.metamagic = this.state.metamagic.filter((m) => m !== metaId);
                    } else if (this.state.metamagic.length < maxCount) {
                        this.state.metamagic.push(metaId);
                    }
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".invocation-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const invId = card.getAttribute("data-invocation-id") || "";
                    const maxCount = this.getMaxInvocationsCount();
                    if (this.state.invocations.includes(invId)) {
                        this.state.invocations = this.state.invocations.filter((i) => i !== invId);
                    } else if (this.state.invocations.length < maxCount) {
                        this.state.invocations.push(invId);
                    }
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".maneuver-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const manId = card.getAttribute("data-maneuver-id") || "";
                    const maxCount = this.getMaxManeuversCount();
                    if (this.state.maneuvers.includes(manId)) {
                        this.state.maneuvers = this.state.maneuvers.filter((m) => m !== manId);
                    } else if (this.state.maneuvers.length < maxCount) {
                        this.state.maneuvers.push(manId);
                    }
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".prog-filter-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const filter = (btn.getAttribute("data-prog-filter") || "all") as "all" | "unlocked";
                    this.progressionFilter = filter;
                    this.renderStep(3);
                });
            });

            document.querySelectorAll(".progression-toggle-link").forEach((link) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const wasExpanded = this.progressionExpanded;
                    this.progressionExpanded = !this.progressionExpanded;
                    this.renderStep(3);
                    if (wasExpanded) {
                        const toggleLink = document.getElementById("progression-load-more-link");
                        if (toggleLink && typeof toggleLink.scrollIntoView === "function") {
                            toggleLink.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }
                    }
                });
            });

            const expandBtn = document.getElementById("progression-toggle-expand-btn");
            expandBtn?.addEventListener("click", () => {
                this.progressionExpanded = !this.progressionExpanded;
                this.renderStep(3);
            });

            document.querySelectorAll(".subclass-feature-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const key = card.getAttribute("data-feature-key");
                    const choice = card.getAttribute("data-feature-choice");
                    if (key && choice) {
                        if (!this.state.subclassFeatureChoices) {
                            this.state.subclassFeatureChoices = {};
                        }
                        this.state.subclassFeatureChoices[key] = choice;
                        this.renderStep(3);
                        this.updateLiveSummary();
                    }
                });
            });
        } else if (step === 4) {
            document.querySelectorAll(".background-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const bgId = card.getAttribute("data-background-id") || "";
                    this.state.backgroundId = bgId;
                    const bg = this.backgrounds.find((b) => b.id === bgId);
                    if (bg) {
                        this.state.originFeatId = bg.originFeatId;
                        this.state.bgStatA = bg.allowedAbilities[0];
                        this.state.bgStatB = bg.allowedAbilities[1];
                        this.state.bgStatC = bg.allowedAbilities[2] || bg.allowedAbilities[0];
                    }
                    this.sanitizeSpellSelections();
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

            // ASI / Feats controls
            document.querySelectorAll(".asi-type-radio").forEach((radio) => {
                radio.addEventListener("change", (e) => {
                    const target = e.target as HTMLInputElement;
                    const lvl = Number(target.getAttribute("data-asi-level"));
                    const newType = target.value as "single" | "dual" | "feat";
                    this.ensureAsiChoices();
                    if (this.state.asiChoices[lvl]) {
                        this.state.asiChoices[lvl].type = newType;
                        if (newType === "feat" && !this.state.asiChoices[lvl].featId) {
                            const isEpic = lvl >= 19;
                            const feats = isEpic ? this.generalFeats : this.generalFeats.filter((f) => !f.isEpicBoon);
                            const defaultFeat = feats[0];
                            this.state.asiChoices[lvl].featId = defaultFeat?.id || "alert-general";
                            this.state.asiChoices[lvl].statA = defaultFeat?.allowedStats[0] || "str";
                        }
                    }
                    this.renderStep(5);
                    this.updateLiveSummary();
                });
            });

            document.querySelectorAll(".asi-stat-select").forEach((select) => {
                select.addEventListener("change", (e) => {
                    const target = e.target as HTMLSelectElement;
                    const lvl = Number(target.getAttribute("data-asi-level"));
                    const field = target.getAttribute("data-asi-field") as "statA" | "statB";
                    this.ensureAsiChoices();
                    if (this.state.asiChoices[lvl] && field) {
                        this.state.asiChoices[lvl][field] = target.value as AbilityName;
                    }
                    this.renderStep(5);
                    this.updateLiveSummary();
                });
            });

            document.querySelectorAll(".asi-feat-select").forEach((select) => {
                select.addEventListener("change", (e) => {
                    const target = e.target as HTMLSelectElement;
                    const lvl = Number(target.getAttribute("data-asi-level"));
                    const featId = target.value;
                    this.ensureAsiChoices();
                    if (this.state.asiChoices[lvl]) {
                        this.state.asiChoices[lvl].featId = featId;
                        const featDef = this.generalFeats.find((f) => f.id === featId);
                        if (featDef && (!this.state.asiChoices[lvl].statA || !featDef.allowedStats.includes(this.state.asiChoices[lvl].statA!))) {
                            this.state.asiChoices[lvl].statA = featDef.allowedStats[0];
                        }
                    }
                    this.renderStep(5);
                    this.updateLiveSummary();
                });
            });
        } else if (step === 6) {
            document.querySelectorAll(".skill-checkbox-card:not(.locked)").forEach((card) => {
                card.addEventListener("click", () => {
                    const skName = card.getAttribute("data-skill-name") || "";
                    const cls = this.classes.find((c) => c.id === this.state.classId);
                    const maxCount = cls?.skillChoices.count || 2;
                    if (this.state.classSkills.includes(skName)) {
                        this.state.classSkills = this.state.classSkills.filter((s) => s !== skName);
                    } else if (this.state.classSkills.length < maxCount) {
                        this.state.classSkills.push(skName);
                    }
                    this.renderStep(6);
                });
            });

            document.querySelectorAll(".expertise-skill-card").forEach((card) => {
                card.addEventListener("click", () => {
                    const skName = card.getAttribute("data-skill-name") || "";
                    const maxCount = this.getMaxExpertiseCount();
                    if (this.state.expertiseSkills.includes(skName)) {
                        this.state.expertiseSkills = this.state.expertiseSkills.filter((s) => s !== skName);
                    } else if (this.state.expertiseSkills.length < maxCount) {
                        this.state.expertiseSkills.push(skName);
                    }
                    this.renderStep(6);
                });
            });
        } else if (step === 7) {
            // Equip starting equipment package buttons
            document.querySelectorAll(".equip-package-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const idx = Number(btn.getAttribute("data-package-index"));
                    const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
                    const opt = cls.startingEquipmentOptions[idx];
                    if (opt) {
                        this.state.equippedKitIndex = idx;
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

            document.querySelectorAll(".starting-package-card").forEach((card) => {
                card.addEventListener("click", (e) => {
                    const btn = card.querySelector(".equip-package-btn");
                    if (btn && e.target !== btn && !(btn as HTMLElement).contains(e.target as Node)) {
                        (btn as HTMLButtonElement).click();
                    }
                });
            });

            const armorSelect = document.getElementById("char-armor-select") as HTMLSelectElement;
            armorSelect?.addEventListener("change", (e) => {
                this.state.selectedArmor = (e.target as HTMLSelectElement).value;
                this.state.equippedKitIndex = undefined;
                this.renderStep(7);
                this.updateLiveSummary();
            });

            const shieldCheck = document.getElementById("char-shield-checkbox") as HTMLInputElement;
            shieldCheck?.addEventListener("change", (e) => {
                this.state.hasShield = (e.target as HTMLInputElement).checked;
                this.state.equippedKitIndex = undefined;
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
                    this.state.equippedKitIndex = undefined;
                    this.renderStep(7);
                    this.updateLiveSummary();
                });
            });
        } else if (step === 8) {
            this.sanitizeSpellSelections();

            // Spell level filter tabs
            document.querySelectorAll(".spell-tab-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const lvl = btn.getAttribute("data-level") || "all";
                    this.activeSpellLevelFilter = lvl === "all" ? "all" : Number(lvl);
                    this.renderStep(8);
                });
            });

            // Search filter input
            const searchInput = document.getElementById("spell-search-input") as HTMLInputElement;
            searchInput?.addEventListener("input", (e) => {
                const q = (e.target as HTMLInputElement).value.toLowerCase().trim();
                this.spellSearchQuery = q;
                document.querySelectorAll(".spell1-row").forEach((row) => {
                    const name = (row.getAttribute("data-spell-name") || "").toLowerCase();
                    const school = (row.getAttribute("data-spell-school") || "").toLowerCase();
                    const desc = (row.querySelector(".item-row-desc")?.textContent || "").toLowerCase();
                    const matches = !q || name.includes(q) || school.includes(q) || desc.includes(q);
                    (row as HTMLElement).style.display = matches ? "" : "none";
                });
            });

            // Auto-Fill spells button
            const autoBtn = document.querySelector(".auto-spells-btn");
            autoBtn?.addEventListener("click", () => {
                const smart = this.getSmartAutoFillSpells();
                this.state.selectedCantrips = smart.cantrips;
                this.state.selectedSpellsLevel1 = smart.prepared;
                this.spellsWarningDismissed = false;
                this.hideAlert();
                this.renderStep(8);
            });

            // Reset spells button
            const clearBtn = document.querySelector(".clear-spells-btn");
            clearBtn?.addEventListener("click", () => {
                this.state.selectedCantrips = [];
                this.state.selectedSpellsLevel1 = [];
                this.spellsWarningDismissed = false;
                this.hideAlert();
                this.renderStep(8);
            });

            // Cantrip toggles with strict limit enforcement
            document.querySelectorAll(".cantrip-row").forEach((row) => {
                row.addEventListener("click", () => {
                    const spName = row.getAttribute("data-spell-name") || "";
                    const maxCantrips = this.getMaxCantrips();
                    if (this.state.selectedCantrips.includes(spName)) {
                        this.state.selectedCantrips = this.state.selectedCantrips.filter((s) => s !== spName);
                        this.spellsWarningDismissed = false;
                        this.hideAlert();
                    } else {
                        if (this.state.selectedCantrips.length >= maxCantrips) {
                            this.showAlert(`You can only choose ${maxCantrips} cantrip${maxCantrips === 1 ? "" : "s"} at Level ${this.state.level}. Deselect one first to switch.`);
                            return;
                        }
                        this.state.selectedCantrips.push(spName);
                        this.spellsWarningDismissed = false;
                        this.hideAlert();
                    }
                    this.renderStep(8);
                });
            });

            // Prepared spell toggles with strict limit enforcement
            document.querySelectorAll(".spell1-row").forEach((row) => {
                row.addEventListener("click", () => {
                    const spName = row.getAttribute("data-spell-name") || "";
                    const maxPrepared = this.getMaxPreparedSpells();
                    if (this.state.selectedSpellsLevel1.includes(spName)) {
                        this.state.selectedSpellsLevel1 = this.state.selectedSpellsLevel1.filter((s) => s !== spName);
                        this.spellsWarningDismissed = false;
                        this.hideAlert();
                    } else {
                        if (this.state.selectedSpellsLevel1.length >= maxPrepared) {
                            this.showAlert(`You can only prepare ${maxPrepared} spell${maxPrepared === 1 ? "" : "s"} at Level ${this.state.level}. Deselect one first to switch.`);
                            return;
                        }
                        this.state.selectedSpellsLevel1.push(spName);
                        this.spellsWarningDismissed = false;
                        this.hideAlert();
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
            submitBtn.innerHTML = this.state.savedId
                ? `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`
                : `<i class="fa-solid fa-spinner fa-spin"></i> Creating...`;
        }

        try {
            const cls = this.classes.find((c) => c.id === this.state.classId) || this.classes[0];
            const species = this.species.find((s) => s.id === this.state.speciesId) || this.species[0];
            const bg = this.backgrounds.find((b) => b.id === this.state.backgroundId) || this.backgrounds[0];
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

            // Features (Species traits + Class Level features + Origin Feat + Progression choices)
            const featuresPayload: any[] = [];
            species.traits.forEach((t) => {
                featuresPayload.push({
                    name: t.name,
                    source: species.name,
                    type: "Species",
                    description: t.description
                });
            });
            const fallbackCls = CLASSES_2024.find((c) => c.id === cls.id);
            const resolvedClsFeatures = (cls.features && cls.features.length > 0) ? cls.features : (fallbackCls?.features || []);
            resolvedClsFeatures.filter((f) => {
                if (f.level > this.state.level) return false;
                if (this.state.subclassId && this.state.level >= 3) {
                    const lowerName = f.name.toLowerCase();
                    if (lowerName === "subclass feature" || lowerName === "subclass capstone" || lowerName.endsWith(" subclass")) {
                        return false;
                    }
                }
                return true;
            }).forEach((f) => {
                featuresPayload.push({
                    name: f.name,
                    source: cls.name,
                    type: "Class",
                    description: f.description
                });
            });
            const originFeat = this.originFeats.find((f) => f.id === this.state.originFeatId);
            if (originFeat) {
                featuresPayload.push({
                    name: originFeat.name,
                    source: "Background",
                    type: "Feat",
                    description: originFeat.benefits.join(" ")
                });
            }

            // Subclass features
            if (this.state.subclassId) {
                const sub = cls.subclasses.find((s) => s.id === this.state.subclassId) || fallbackCls?.subclasses.find((s) => s.id === this.state.subclassId);
                const fallbackSub = fallbackCls?.subclasses.find((s) => s.id === this.state.subclassId);
                if (sub) {
                    featuresPayload.push({
                        name: `Subclass: ${sub.name}`,
                        source: cls.name,
                        type: "Subclass",
                        description: sub.description
                    });
                    const subFeatures = (sub.features && sub.features.length > 0) ? sub.features : (fallbackSub?.features || []);
                    if (subFeatures.length > 0) {
                        subFeatures
                            .filter((sf) => sf.level <= this.state.level)
                            .forEach((sf) => {
                                featuresPayload.push({
                                    name: sf.name,
                                    source: sub.name,
                                    type: "Subclass Feature",
                                    level: sf.level,
                                    description: sf.description
                                });
                            });
                    }
                }
            }

            // Subclass Feature Choices
            if (this.state.subclassFeatureChoices) {
                for (const [key, val] of Object.entries(this.state.subclassFeatureChoices)) {
                    if (key === "druid-6-land" && this.state.classId === "druid" && this.state.subclassId === "land" && this.state.level >= 6) {
                        const opt = DRUID_LAND_BIOMES.find((b) => b.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Land Biome: ${opt.name}`,
                                source: "Circle of the Land",
                                type: "Subclass Choice",
                                level: 6,
                                description: opt.description
                            });
                        }
                    } else if (key === "druid-7" && this.state.classId === "druid" && this.state.level >= 7) {
                        const opt = ELEMENTAL_FURY_OPTIONS.find((o) => o.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Elemental Fury: ${opt.name}`,
                                source: "Druid",
                                type: "Class Choice",
                                level: 7,
                                description: opt.description
                            });
                        }
                    } else if (key === "cleric-7" && this.state.classId === "cleric" && this.state.level >= 7) {
                        const opt = BLESSED_STRIKES_OPTIONS.find((o) => o.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Blessed Strikes: ${opt.name}`,
                                source: "Cleric",
                                type: "Class Choice",
                                level: 7,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-6-wild-heart" && this.state.classId === "barbarian" && this.state.subclassId === "wild-heart" && this.state.level >= 6) {
                        const opt = BARBARIAN_ASPECTS.find((a) => a.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Aspect of the Beast: ${opt.name}`,
                                source: "Path of the Wild Heart",
                                type: "Subclass Choice",
                                level: 6,
                                description: opt.description
                            });
                        }
                    } else if (key === "ranger-6-hunter" && this.state.classId === "ranger" && this.state.subclassId === "hunter" && this.state.level >= 6) {
                        const opt = HUNTER_DEFENSIVE_TACTICS.find((t) => t.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Defensive Tactics: ${opt.name}`,
                                source: "Hunter",
                                type: "Subclass Choice",
                                level: 6,
                                description: opt.description
                            });
                        }
                    } else if (key === "wizard-2-scholar" && this.state.classId === "wizard" && this.state.level >= 2) {
                        const opt = WIZARD_SCHOLAR_SKILLS.find((s) => s.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Scholar: ${opt.name}`,
                                source: "Wizard",
                                type: "Class Choice",
                                level: 2,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-3-wild-heart" && this.state.classId === "barbarian" && this.state.subclassId === "wild-heart" && this.state.level >= 3) {
                        const opt = WILD_HEART_RAGES.find((r) => r.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Rage of the Wilds: ${opt.name}`,
                                source: "Path of the Wild Heart",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-3-zealot" && this.state.classId === "barbarian" && this.state.subclassId === "zealot" && this.state.level >= 3) {
                        const opt = ZEALOT_DIVINE_FURIES.find((z) => z.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Divine Fury: ${opt.name}`,
                                source: "Path of the Zealot",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "monk-3-elements" && this.state.classId === "monk" && this.state.subclassId === "elements" && this.state.level >= 3) {
                        const opt = ELEMENTS_ATTUNEMENT_DAMAGE_TYPES.find((e) => e.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Elemental Attunement: ${opt.name}`,
                                source: "Warrior of the Elements",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "ranger-3-beast-master" && this.state.classId === "ranger" && this.state.subclassId === "beast-master" && this.state.level >= 3) {
                        const opt = PRIMAL_COMPANION_TYPES.find((p) => p.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Primal Companion: ${opt.name}`,
                                source: "Beast Master",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "ranger-3-hunter" && this.state.classId === "ranger" && this.state.subclassId === "hunter" && this.state.level >= 3) {
                        const opt = HUNTER_PREY_OPTIONS.find((h) => h.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Hunter's Prey: ${opt.name}`,
                                source: "Hunter",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "sorcerer-3-draconic" && this.state.classId === "sorcerer" && this.state.subclassId === "draconic" && this.state.level >= 3) {
                        const opt = DRACONIC_ANCESTOR_ELEMENTS.find((d) => d.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Draconic Ancestor: ${opt.name}`,
                                source: "Draconic Sorcery",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "rogue-5-cunning-strike" && this.state.classId === "rogue" && this.state.level >= 5) {
                        const opt = ROGUE_CUNNING_STRIKES.find((c) => c.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Cunning Strike: ${opt.name}`,
                                source: "Rogue",
                                type: "Class Choice",
                                level: 5,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-9-brutal-strike" && this.state.classId === "barbarian" && this.state.level >= 9) {
                        const opt = BRUTAL_STRIKE_OPTIONS.find((b) => b.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Brutal Strike: ${opt.name}`,
                                source: "Barbarian",
                                type: "Class Choice",
                                level: 9,
                                description: opt.description
                            });
                        }
                    } else if (key === "fighter-9-tactical-master" && this.state.classId === "fighter" && this.state.level >= 9) {
                        const opt = TACTICAL_MASTER_PROPERTIES.find((t) => t.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Tactical Master: ${opt.name}`,
                                source: "Fighter",
                                type: "Class Choice",
                                level: 9,
                                description: opt.description
                            });
                        }
                    } else if (key === "warlock-10-fiend" && this.state.classId === "warlock" && this.state.subclassId === "fiend" && this.state.level >= 10) {
                        const opt = FIENDISH_RESILIENCE_DAMAGE_TYPES.find((f) => f.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Fiendish Resilience: ${opt.name}`,
                                source: "Fiend Patron",
                                type: "Subclass Choice",
                                level: 10,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-14-wild-heart" && this.state.classId === "barbarian" && this.state.subclassId === "wild-heart" && this.state.level >= 14) {
                        const opt = WILD_HEART_TOTEMIC_ATTUNEMENTS.find((t) => t.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Totemic Attunement: ${opt.name}`,
                                source: "Path of the Wild Heart",
                                type: "Subclass Choice",
                                level: 14,
                                description: opt.description
                            });
                        }
                    } else if (key === "rogue-14-devious-strike" && this.state.classId === "rogue" && this.state.level >= 14) {
                        const opt = ROGUE_DEVIOUS_STRIKES.find((d) => d.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Devious Strike: ${opt.name}`,
                                source: "Rogue",
                                type: "Class Choice",
                                level: 14,
                                description: opt.description
                            });
                        }
                    } else if (key === "fighter-3-battle-master-student" && this.state.classId === "fighter" && this.state.subclassId === "battle-master" && this.state.level >= 3) {
                        const opt = STUDENT_OF_WAR_SKILLS.find((s) => s.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Student of War: ${opt.name}`,
                                source: "Battle Master",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "monk-3-open-hand" && this.state.classId === "monk" && this.state.subclassId === "open-hand" && this.state.level >= 3) {
                        const opt = OPEN_HAND_TECHNIQUES.find((t) => t.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Open Hand Technique: ${opt.name}`,
                                source: "Warrior of the Open Hand",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "ranger-3-fey-wanderer" && this.state.classId === "ranger" && this.state.subclassId === "fey-wanderer" && this.state.level >= 3) {
                        const opt = FEY_WANDERER_GLAMOUR_SKILLS.find((s) => s.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Otherworldly Glamour: ${opt.name}`,
                                source: "Fey Wanderer",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "warlock-3-archfey" && this.state.classId === "warlock" && this.state.subclassId === "archfey" && this.state.level >= 3) {
                        const opt = STEPS_OF_THE_FEY_OPTIONS.find((s) => s.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Steps of the Fey: ${opt.name}`,
                                source: "Archfey Patron",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "druid-3-stars" && this.state.classId === "druid" && this.state.subclassId === "stars" && this.state.level >= 3) {
                        const opt = STARRY_FORM_CONSTELLATIONS.find((c) => c.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Starry Form: ${opt.name}`,
                                source: "Circle of the Stars",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "druid-3-sea" && this.state.classId === "druid" && this.state.subclassId === "sea" && this.state.level >= 3) {
                        const opt = SEA_WRATH_DAMAGE_TYPES.find((w) => w.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Wrath of the Sea: ${opt.name}`,
                                source: "Circle of the Sea",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "druid-3-moon" && this.state.classId === "druid" && this.state.subclassId === "moon" && this.state.level >= 3) {
                        const opt = MOON_CIRCLE_FORMS_STRIKES.find((m) => m.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Circle Forms Strike: ${opt.name}`,
                                source: "Circle of the Moon",
                                type: "Subclass Choice",
                                level: 3,
                                description: opt.description
                            });
                        }
                    } else if (key === "druid-6-stars" && this.state.classId === "druid" && this.state.subclassId === "stars" && this.state.level >= 6) {
                        const opt = COSMIC_OMEN_OPTIONS.find((o) => o.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Cosmic Omen: ${opt.name}`,
                                source: "Circle of the Stars",
                                type: "Subclass Choice",
                                level: 6,
                                description: opt.description
                            });
                        }
                    } else if (key === "cleric-6-war" && this.state.classId === "cleric" && this.state.subclassId === "war" && this.state.level >= 6) {
                        const opt = WAR_GOD_BLESSING_OPTIONS.find((w) => w.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `War God's Blessing: ${opt.name}`,
                                source: "War Domain",
                                type: "Subclass Choice",
                                level: 6,
                                description: opt.description
                            });
                        }
                    } else if (key === "fighter-7-champion" && this.state.classId === "fighter" && this.state.subclassId === "champion" && this.state.level >= 7) {
                        const opt = CHAMPION_ADDITIONAL_FIGHTING_STYLES.find((s) => s.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Additional Fighting Style: ${opt.name}`,
                                source: "Champion",
                                type: "Subclass Choice",
                                level: 7,
                                description: opt.description
                            });
                        }
                    } else if (key === "fighter-7-psi-warrior" && this.state.classId === "fighter" && this.state.subclassId === "psi-warrior" && this.state.level >= 7) {
                        const opt = PSI_WARRIOR_THRUST_OPTIONS.find((p) => p.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Telekinetic Thrust: ${opt.name}`,
                                source: "Psi Warrior",
                                type: "Subclass Choice",
                                level: 7,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-10-world-tree" && this.state.classId === "barbarian" && this.state.subclassId === "world-tree" && this.state.level >= 10) {
                        const opt = BATTERING_ROOTS_OPTIONS.find((b) => b.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Battering Roots: ${opt.name}`,
                                source: "Path of the World Tree",
                                type: "Subclass Choice",
                                level: 10,
                                description: opt.description
                            });
                        }
                    } else if (key === "wizard-10-diviner" && this.state.classId === "wizard" && this.state.subclassId === "diviner" && this.state.level >= 10) {
                        const opt = DIVINER_THIRD_EYE_OPTIONS.find((o) => o.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `The Third Eye: ${opt.name}`,
                                source: "Diviner",
                                type: "Subclass Choice",
                                level: 10,
                                description: opt.description
                            });
                        }
                    } else if (key === "barbarian-13-brutal-strike" && this.state.classId === "barbarian" && this.state.level >= 13) {
                        const opt = IMPROVED_BRUTAL_STRIKE_OPTIONS.find((b) => b.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Improved Brutal Strike: ${opt.name}`,
                                source: "Barbarian",
                                type: "Class Choice",
                                level: 13,
                                description: opt.description
                            });
                        }
                    } else if (key === "sorcerer-14-aberrant" && this.state.classId === "sorcerer" && this.state.subclassId === "aberrant" && this.state.level >= 14) {
                        const opt = ABERRANT_REVELATION_OPTIONS.find((a) => a.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Revelation in Flesh: ${opt.name}`,
                                source: "Aberrant Sorcery",
                                type: "Subclass Choice",
                                level: 14,
                                description: opt.description
                            });
                        }
                    } else if (key === "ranger-15-hunter" && this.state.classId === "ranger" && this.state.subclassId === "hunter" && this.state.level >= 15) {
                        const opt = HUNTER_SUPERIOR_DEFENSE_OPTIONS.find((o) => o.id === val);
                        if (opt) {
                            featuresPayload.push({
                                name: `Superior Hunter's Defense: ${opt.name}`,
                                source: "Hunter",
                                type: "Subclass Choice",
                                level: 15,
                                description: opt.description
                            });
                        }
                    }
                }
            }

            // Fighting Style
            if (this.state.fightingStyle) {
                const fs = FIGHTING_STYLES.find((f) => f.id === this.state.fightingStyle);
                if (fs) {
                    featuresPayload.push({
                        name: `Fighting Style: ${fs.name}`,
                        source: cls.name,
                        type: "Class",
                        description: fs.description
                    });
                }
            }

            // Divine Order / Primal Order
            if (this.state.divineOrder && this.state.classId === "cleric") {
                const ord = DIVINE_ORDERS.find((o) => o.id === this.state.divineOrder);
                if (ord) {
                    featuresPayload.push({
                        name: `Divine Order: ${ord.name}`,
                        source: cls.name,
                        type: "Class",
                        description: ord.description
                    });
                }
            }
            if (this.state.primalOrder && this.state.classId === "druid") {
                const ord = PRIMAL_ORDERS.find((o) => o.id === this.state.primalOrder);
                if (ord) {
                    featuresPayload.push({
                        name: `Primal Order: ${ord.name}`,
                        source: cls.name,
                        type: "Class",
                        description: ord.description
                    });
                }
            }

            // Metamagic
            if (this.state.metamagic.length > 0) {
                this.state.metamagic.forEach((mId) => {
                    const meta = METAMAGIC_OPTIONS.find((m) => m.id === mId);
                    if (meta) {
                        featuresPayload.push({
                            name: `Metamagic: ${meta.name}`,
                            source: cls.name,
                            type: "Class",
                            description: meta.description
                        });
                    }
                });
            }

            // Invocations
            if (this.state.invocations.length > 0) {
                this.state.invocations.forEach((invId) => {
                    const inv = ELDRITCH_INVOCATIONS.find((i) => i.id === invId);
                    if (inv) {
                        featuresPayload.push({
                            name: `Eldritch Invocation: ${inv.name}`,
                            source: cls.name,
                            type: "Class",
                            description: inv.description
                        });
                    }
                });
            }

            // Maneuvers
            if (this.state.maneuvers.length > 0) {
                this.state.maneuvers.forEach((mId) => {
                    const man = BATTLE_MASTER_MANEUVERS.find((m) => m.id === mId);
                    if (man) {
                        featuresPayload.push({
                            name: `Maneuver: ${man.name}`,
                            source: cls.name,
                            type: "Subclass",
                            description: man.description
                        });
                    }
                });
            }

            // ASI Feats
            const asiLevels = this.getAsiLevels();
            for (const lvl of asiLevels) {
                const choice = this.state.asiChoices[lvl];
                if (choice?.type === "feat" && choice.featId) {
                    const featDef = this.generalFeats.find((f) => f.id === choice.featId);
                    if (featDef) {
                        featuresPayload.push({
                            name: featDef.name,
                            source: featDef.isEpicBoon ? "Epic Boon" : "General Feat",
                            type: "Feat",
                            description: featDef.benefits.join(" ")
                        });
                    }
                }
            }

            // Class Resources
            const resourcesPayload: any[] = [];
            if (cls.id === "barbarian") {
                const rageTotal = this.state.level >= 17 ? 6 : this.state.level >= 12 ? 5 : this.state.level >= 6 ? 4 : this.state.level >= 3 ? 3 : 2;
                resourcesPayload.push({ name: "Rage", total: rageTotal, resetOn: "long", currentUsed: 0 });
            } else if (cls.id === "bard") {
                const bardicDie = this.state.level >= 15 ? "d12" : this.state.level >= 10 ? "d10" : this.state.level >= 5 ? "d8" : "d6";
                const bardicReset = this.state.level >= 5 ? "short" : "long";
                resourcesPayload.push({ name: `Bardic Inspiration (${bardicDie})`, total: Math.max(1, this.getAbilityModifier("cha")), resetOn: bardicReset, dieOrType: bardicDie, currentUsed: 0 });
            } else if (cls.id === "cleric" && this.state.level >= 2) {
                const cdTotal = this.state.level >= 18 ? 4 : this.state.level >= 6 ? 3 : 2;
                resourcesPayload.push({ name: "Channel Divinity", total: cdTotal, resetOn: "short", currentUsed: 0 });
            } else if (cls.id === "druid" && this.state.level >= 2) {
                const wsTotal = this.state.level >= 20 ? 99 : this.state.level >= 17 ? 4 : this.state.level >= 6 ? 3 : 2;
                resourcesPayload.push({ name: "Wild Shape", total: wsTotal, resetOn: "short", currentUsed: 0 });
            } else if (cls.id === "fighter") {
                const swTotal = this.state.level >= 10 ? 4 : this.state.level >= 4 ? 3 : 2;
                resourcesPayload.push({ name: "Second Wind", total: swTotal, resetOn: "short", dieOrType: "1d10", currentUsed: 0 });
                if (this.state.level >= 2) {
                    resourcesPayload.push({ name: "Action Surge", total: this.state.level >= 17 ? 2 : 1, resetOn: "short", currentUsed: 0 });
                }
                if (this.state.level >= 9) {
                    const indomTotal = this.state.level >= 17 ? 3 : this.state.level >= 13 ? 2 : 1;
                    resourcesPayload.push({ name: "Indomitable", total: indomTotal, resetOn: "long", currentUsed: 0 });
                }
            } else if (cls.id === "monk" && this.state.level >= 2) {
                resourcesPayload.push({ name: "Focus Points", total: this.state.level, resetOn: "short", currentUsed: 0 });
            } else if (cls.id === "paladin") {
                resourcesPayload.push({ name: "Lay on Hands", total: 5 * this.state.level, resetOn: "long", currentUsed: 0 });
                if (this.state.level >= 3) {
                    resourcesPayload.push({ name: "Channel Divinity", total: this.state.level >= 11 ? 3 : 2, resetOn: "short", currentUsed: 0 });
                }
            } else if (cls.id === "sorcerer") {
                resourcesPayload.push({ name: "Innate Sorcery", total: 2, resetOn: "long", currentUsed: 0 });
                if (this.state.level >= 2) {
                    resourcesPayload.push({ name: "Sorcery Points", total: this.state.level, resetOn: "long", currentUsed: 0 });
                }
            }

            // Passive scores
            const percSkill = skillsPayload.find((s) => s.name === "Perception");
            const invSkill = skillsPayload.find((s) => s.name === "Investigation");
            const insSkill = skillsPayload.find((s) => s.name === "Insight");

            const actionsPayload: any[] = [
                ...weaponsPayload.map((w) => ({
                    name: w.name,
                    type: "Action",
                    rangeOrReach: w.range || "5 ft.",
                    hitOrDc: `${w.attackBonus} to hit`,
                    damageOrEffect: w.damage,
                    notes: w.mastery?.unlocked ? `Mastery: ${w.mastery.name}` : (w.properties || []).join(", ")
                })),
                {
                    name: "Unarmed Strike",
                    type: "Action",
                    rangeOrReach: "Reach 5 ft.",
                    hitOrDc: `+${this.getAbilityModifier("str") + pb} to hit`,
                    damageOrEffect: `${Math.max(1, 1 + this.getAbilityModifier("str"))} Bludgeoning`,
                    notes: `Damage, Grapple, or Shove (DC ${8 + this.getAbilityModifier("str") + pb})`
                }
            ];

            const spellSlotsPayload: Record<string, any> = {};
            if (cls.spellcasting) {
                const lvlIdx = Math.max(0, Math.min(19, this.state.level - 1));
                const slotsRow = cls.spellcasting.spellSlotsByLevel?.[lvlIdx] || [];
                if (cls.spellcasting.type === "pact") {
                    const count = slotsRow.find((s: number) => s > 0) || 0;
                    const pactLvl = slotsRow.findIndex((s: number) => s > 0) + 1;
                    if (count > 0 && pactLvl > 0) {
                        spellSlotsPayload.pact = {
                            level: pactLvl,
                            total: count,
                            label: `Pact Magic (${pactLvl}${this.getOrdinalSuffix(pactLvl)} Level)`
                        };
                    }
                } else {
                    slotsRow.forEach((total: number, idx: number) => {
                        if (total > 0) {
                            const slotLvl = idx + 1;
                            spellSlotsPayload[`level${slotLvl}`] = {
                                level: slotLvl,
                                total,
                                label: `${slotLvl}${this.getOrdinalSuffix(slotLvl)} Level`
                            };
                        }
                    });
                }
            } else if (this.state.level >= 3 && (this.state.subclassId === "eldritch-knight" || this.state.subclassId === "arcane-trickster")) {
                const thirdCasterEffLvl = Math.ceil(this.state.level / 3);
                const wizardDef = this.classes.find((c) => c.id === "wizard");
                const slotsRow = wizardDef?.spellcasting?.spellSlotsByLevel?.[Math.max(0, Math.min(19, thirdCasterEffLvl - 1))] || [];
                slotsRow.forEach((total: number, idx: number) => {
                    if (total > 0) {
                        const slotLvl = idx + 1;
                        spellSlotsPayload[`level${slotLvl}`] = {
                            level: slotLvl,
                            total,
                            label: `${slotLvl}${this.getOrdinalSuffix(slotLvl)} Level`
                        };
                    }
                });
            } else if (this.state.originFeatId.startsWith("magic-initiate")) {
                spellSlotsPayload.level1 = {
                    level: 1,
                    total: 1,
                    label: "1st Level"
                };
            }

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
                    speed: this.getSpeedDisplay(),
                    proficiencyBonus: pb,
                    passivePerception: 10 + (percSkill?.bonus || 0),
                    passiveInvestigation: 10 + (invSkill?.bonus || 0),
                    passiveInsight: 10 + (insSkill?.bonus || 0),
                    darkvision: species.darkvision || "None",
                    hitDice: `${this.state.level}d${cls.hitDie}`,
                    heroicInspiration: false,
                    spellSaveDc: this.getSpellSaveDc() ?? 10,
                    spellAttackBonus: this.getSpellAttackModifier() ?? 0,
                    spellcastingAbility: this.getSpellcastingAbility() ?? "none",
                    deathSaves: { successes: 0, failures: 0, isStable: false }
                },
                abilities: abilitiesPayload,
                skills: skillsPayload,
                weapons: weaponsPayload,
                equipment: equipmentPayload,
                spells: spellsPayload,
                features: featuresPayload,
                actions: actionsPayload,
                proficiencies: {
                    armor: cls.armorProficiencies || [],
                    weapons: cls.weaponProficiencies || [],
                    tools: this.state.bgTool ? [this.state.bgTool] : [],
                    languages: ["Common"]
                },
                classResources: resourcesPayload,
                spellSlots: spellSlotsPayload,
                creatorState: {
                    ...this.state
                },
                featureChoices: Object.fromEntries(
                    Object.entries(this.state.subclassFeatureChoices || {}).filter(([key]) => {
                        const parts = key.split("-");
                        const clsPrefix = parts[0];
                        const reqLvl = Number(parts[1]);
                        if (clsPrefix !== this.state.classId) return false;
                        if (!Number.isNaN(reqLvl) && reqLvl > this.state.level) return false;
                        return true;
                    })
                ),
                subclassFeatureChoices: Object.fromEntries(
                    Object.entries(this.state.subclassFeatureChoices || {}).filter(([key]) => {
                        const parts = key.split("-");
                        const clsPrefix = parts[0];
                        const reqLvl = Number(parts[1]);
                        if (clsPrefix !== this.state.classId) return false;
                        if (!Number.isNaN(reqLvl) && reqLvl > this.state.level) return false;
                        return true;
                    })
                )
            };

            const saveBody: any = {
                name: this.state.name,
                source: "site",
                character: characterPayload
            };
            const isUpdatingExisting = Boolean(this.state.savedId || this.state.siteCharacterId);
            if (this.state.savedId) {
                saveBody.savedId = this.state.savedId;
                characterPayload.savedCharacterId = this.state.savedId;
            }
            if (this.state.siteCharacterId) {
                saveBody.siteCharacterId = this.state.siteCharacterId;
                characterPayload.siteCharacterId = this.state.siteCharacterId;
            }

            const response = isUpdatingExisting
                ? await putData<any>("/save-character", saveBody)
                : await postData<any>("/create-character", saveBody);

            if (response && response.savedCharacter?.siteCharacterId) {
                window.location.href = `/character-sheet/${response.savedCharacter.siteCharacterId}`;
            } else if (response && response.character?.siteCharacterId) {
                window.location.href = `/character-sheet/${response.character.siteCharacterId}`;
            } else if (this.state.savedId) {
                window.location.href = `/character-sheet/${this.state.savedId}`;
            } else {
                window.location.href = "/character-sheet";
            }
        } catch (err: any) {
            console.error("Error creating/saving character:", err);
            this.showAlert("Failed to save character. Please verify your connection or login status.");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = this.state.savedId
                    ? `<i class="fa-solid fa-floppy-disk"></i> Save Changes`
                    : `<i class="fa-solid fa-check"></i> Create Character`;
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
