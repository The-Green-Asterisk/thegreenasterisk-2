import { getData } from "@services/request";
import {
    AbilityName,
    BACKGROUNDS_2024,
    BackgroundDefinition,
    CLASSES_2024,
    ClassDefinition,
    ELDRITCH_INVOCATIONS,
    GENERAL_FEATS_2024,
    GeneralFeatDefinition,
    MulticlassCasterClassInfo,
    ORIGIN_FEATS_2024,
    OriginFeatDefinition,
    RuleSpellDefinition,
    SPECIES_2024,
    SpeciesDefinition
} from "../../rules/dnd5e_2024";
import {
    ALL_SKILLS,
    AsiChoice,
    CharacterClassChoice,
    CreatorState,
    FeatureSpellChoiceSection
} from "./characterCreator.types";
import {
    getNavBottom,
    renderClassProgression,
    renderLevelChoices,
    renderStep1Identity,
    renderStep2Species,
    renderStep3Class,
    renderStep4Background,
    renderStep5Abilities,
    renderStep6Skills,
    renderStep7Equipment,
    renderStep8Spells,
    renderStep9Review,
    updateLiveSummary,
    updateMulticlassBarPositions,
    updateMulticlassNavBars
} from "./components";
import {
    bindNavigationEvents,
    CharacterCreatorContext,
    goToStep,
    hideAlert,
    initAbilitiesController,
    initBackgroundController,
    initClassController,
    initEquipmentController,
    initIdentityController,
    initReviewController,
    initSkillsController,
    initSpeciesController,
    initSpellsController,
    showAlert,
    validateAndAdvance,
    validateCurrentStep
} from "./controllers";
import * as persistService from "./services/persistence";
import * as rulesCalc from "./services/rulesCalculations";
import * as spellCalc from "./services/spellReconciliation";

export { ALL_SKILLS, AsiChoice, CharacterClassChoice, CreatorState, FeatureSpellChoiceSection };

export class CharacterCreatorController implements CharacterCreatorContext {
    public static readonly STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
    public static readonly POINT_BUY_COSTS: Record<number, number> = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };

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
        elfKeenSkill: "Perception",
        classId: "fighter",
        subclassId: "",
        classes: [
            { classId: "fighter", level: 1, subclassId: "" }
        ],
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
        subclassFeatureChoices: {},
        classSkills: ["Athletics", "Perception"],
        expertiseSkills: [],
        selectedWeapons: ["Longsword", "Light Crossbow"],
        selectedArmor: "Chain Mail",
        hasShield: true,
        equippedKitIndex: 0,
        selectedCantrips: [],
        selectedSpellsLevel1: [],
        featureSpellChoices: {}
    };

    public classes: ClassDefinition[] = [...CLASSES_2024];
    public species: SpeciesDefinition[] = [...SPECIES_2024];
    public backgrounds: BackgroundDefinition[] = [...BACKGROUNDS_2024];
    public originFeats: OriginFeatDefinition[] = [...ORIGIN_FEATS_2024];
    public generalFeats: GeneralFeatDefinition[] = [...GENERAL_FEATS_2024];

    public activeSpellLevelFilter: number | "all" = "all";
    public activeSpellClassFilter: string = "all";
    public spellSearchQuery: string = "";
    public progressionExpanded: boolean = false;
    public collapsedProgressionLevels: Set<string> = new Set<string>();
    public progressionFilter: "all" | "unlocked" = "all";
    public spellsWarningDismissed: boolean = false;

    // View & Navigation delegates
    public getNavBottom(): number {
        return getNavBottom();
    }

    public updateMulticlassBarPositions(): void {
        updateMulticlassBarPositions(this);
    }

    public updateMulticlassNavBars(): void {
        updateMulticlassNavBars(this);
    }

    public updateLiveSummary(): void {
        updateLiveSummary(this);
    }

    public showAlert(msg: string, type: "error" | "warning" = "error"): void {
        showAlert(msg, type);
    }

    public hideAlert(): void {
        hideAlert();
    }

    public validateCurrentStep(): boolean {
        return validateCurrentStep(this);
    }

    public validateAndAdvance(): void {
        validateAndAdvance(this);
    }

    public goToStep(step: number): void {
        goToStep(this, step);
    }

    private bindEvents(): void {
        bindNavigationEvents(this);
    }

    public async init(query?: any): Promise<void> {
        this.bindEvents();
        try {
            const rules = await getData<any>("/get-rules");
            if (rules) {
                if (Array.isArray(rules.classes) && rules.classes.length > 0) {
                    this.classes = rules.classes.map((rc: any) => {
                        const fallbackCls = CLASSES_2024.find((c) => c.id === rc.id || c.slug === rc.slug || c.name === rc.name);
                        const classSlug = (typeof rc.slug === "string" && rc.slug) || (typeof rc.id === "string" && isNaN(Number(rc.id)) ? rc.id : "") || fallbackCls?.id || "";
                        const rawSubs =
                            Array.isArray(rc.subclasses) && rc.subclasses.length > 0
                                ? [...rc.subclasses]
                                : [...(fallbackCls?.subclasses || [])];
                        if (Array.isArray(rules.subclasses)) {
                            for (const gs of rules.subclasses) {
                                const matchesSlug = Boolean(gs.classSlug && classSlug && gs.classSlug.toLowerCase() === classSlug.toLowerCase());
                                const matchesId = Boolean(gs.classId && rc.id && String(gs.classId) === String(rc.id));
                                if (matchesSlug || matchesId) {
                                    rawSubs.push(gs);
                                }
                            }
                        }
                        if (fallbackCls?.subclasses) {
                            for (const fs of fallbackCls.subclasses) {
                                rawSubs.push(fs);
                            }
                        }
                        const enrichedSubs = this.deduplicateClassSubclasses(classSlug, rawSubs);
                        return {
                            ...rc,
                            id: classSlug || rc.id,
                            slug: classSlug,
                            features:
                                Array.isArray(rc.features) && rc.features.length > 0
                                    ? rc.features
                                    : (fallbackCls?.features || []),
                            subclasses: enrichedSubs,
                            progression: rc.progression || fallbackCls?.progression
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

    // Subclass and Class Progression Deduplication & Sync
    public static normalizeSubclassKey(value: string): string {
        if (!value) return "";
        return String(value)
            .toLowerCase()
            .replace(/\s*\([^)]+\)\s*$/g, "")
            .replace(/^(the|path-of-the|path-of|circle-of-the|circle-of|college-of-the|college-of|oath-of-the|oath-of|warrior-of-the|warrior-of|way-of-the|way-of|school-of)[\s-]+/g, "")
            .replace(/[\s-]+(patron|domain|sorcery|magic|oath|circle|college|path|school)$/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    public resolveCanonicalSubclassId(classId: string, subIdOrName?: string): string {
        if (!subIdOrName) return "";
        const raw = String(subIdOrName).trim();
        if (!raw) return "";
        const normKey = CharacterCreatorController.normalizeSubclassKey(raw);
        const classSlug = (typeof classId === "string" && isNaN(Number(classId))) ? classId.toLowerCase() : "";
        const fallbackCls = CLASSES_2024.find((c) =>
            (classSlug && c.id.toLowerCase() === classSlug) ||
            c.name.toLowerCase() === String(classId).toLowerCase()
        ) || (typeof classId === "string" ? CLASSES_2024.find((c) => c.id === classId) : undefined);
        const canonSub = fallbackCls?.subclasses?.find((s) =>
            s.id === raw ||
            s.name.toLowerCase() === raw.toLowerCase() ||
            CharacterCreatorController.normalizeSubclassKey(s.id) === normKey ||
            CharacterCreatorController.normalizeSubclassKey(s.name) === normKey
        );
        if (canonSub) return canonSub.id;
        const activeCls = this.classes.find((c) =>
            (classSlug && (c.id === classSlug || c.slug === classSlug)) ||
            c.name.toLowerCase() === String(classId).toLowerCase()
        );
        const matchedSub = activeCls?.subclasses?.find((s) =>
            s.id === raw ||
            s.name?.toLowerCase() === raw.toLowerCase() ||
            CharacterCreatorController.normalizeSubclassKey(s.id || s.name || "") === normKey
        );
        return matchedSub ? matchedSub.id : raw;
    }

    public deduplicateClassSubclasses(classId: string, rawSubs: any[]): any[] {
        const classSlug = (typeof classId === "string" && isNaN(Number(classId))) ? classId.toLowerCase() : "";
        const fallbackCls = CLASSES_2024.find((c) =>
            (classSlug && c.id.toLowerCase() === classSlug) ||
            c.name.toLowerCase() === String(classId).toLowerCase()
        ) || (typeof classId === "string" ? CLASSES_2024.find((c) => c.id === classId) : undefined);
        const resolvedClassId = fallbackCls?.id || classSlug;
        const byKey = new Map<string, any>();

        for (const sub of rawSubs || []) {
            if (!sub) continue;
            // 1. If the subclass specifies a classSlug that belongs to another class, reject it
            if (sub.classSlug && resolvedClassId && sub.classSlug.toLowerCase() !== resolvedClassId.toLowerCase()) {
                continue;
            }

            const rawId = (typeof sub.slug === "string" && sub.slug) || (typeof sub.id === "string" && isNaN(Number(sub.id)) ? sub.id : "");
            const rawName = sub.name || "";
            const normKey = CharacterCreatorController.normalizeSubclassKey(rawName || rawId || (sub.slug || sub.id || ""));
            if (!normKey) continue;

            // 2. Reject if this subclass canonically belongs to another D&D 2024 class
            const canonicalOwnerClass = CLASSES_2024.find((c) =>
                c.subclasses.some((s) =>
                    (rawId && s.id === rawId) ||
                    (rawName && s.name.toLowerCase() === rawName.toLowerCase()) ||
                    CharacterCreatorController.normalizeSubclassKey(s.id) === normKey ||
                    CharacterCreatorController.normalizeSubclassKey(s.name) === normKey
                )
            );

            if (canonicalOwnerClass && resolvedClassId && canonicalOwnerClass.id.toLowerCase() !== resolvedClassId.toLowerCase()) {
                continue;
            }

            const fallbackSub = fallbackCls?.subclasses?.find((s) =>
                (rawId && s.id === rawId) ||
                (rawName && s.name.toLowerCase() === rawName.toLowerCase()) ||
                CharacterCreatorController.normalizeSubclassKey(s.id) === normKey ||
                CharacterCreatorController.normalizeSubclassKey(s.name) === normKey
            );

            // 3. For canonical classes, reject anything not in fallbackSub unless explicitly tagged as a custom subclass for this class
            if (fallbackCls && !fallbackSub && (!sub.classSlug || sub.classSlug.toLowerCase() !== resolvedClassId.toLowerCase()) && !sub.isCustom) {
                continue;
            }

            const canonicalId = fallbackSub ? fallbackSub.id : (rawId || normKey);
            const canonicalName = fallbackSub ? fallbackSub.name : (rawName || rawId || normKey);
            const canonKey = CharacterCreatorController.normalizeSubclassKey(canonicalId || canonicalName || normKey);

            const normalizedSub = {
                ...sub,
                id: canonicalId,
                slug: canonicalId,
                classSlug: resolvedClassId,
                name: canonicalName,
                description: sub.description || fallbackSub?.description || "",
                features: Array.isArray(sub.features) && sub.features.length > 0
                    ? sub.features
                    : (fallbackSub?.features || []),
                progression: sub.progression && sub.progression.length > 0
                    ? sub.progression
                    : fallbackSub?.progression
            };

            const existing = byKey.get(canonKey);
            if (!existing) {
                byKey.set(canonKey, normalizedSub);
            } else {
                if (!existing.description && normalizedSub.description) {
                    existing.description = normalizedSub.description;
                }
                if ((!existing.features || existing.features.length === 0) && normalizedSub.features?.length > 0) {
                    existing.features = normalizedSub.features;
                }
                if ((!existing.progression || existing.progression.length === 0) && normalizedSub.progression?.length > 0) {
                    existing.progression = normalizedSub.progression;
                }
            }
        }

        return Array.from(byKey.values());
    }

    public sanitizeClassProgressionSelections(): void {
        if (!Array.isArray(this.state.classes) || this.state.classes.length === 0) return;

        // 1. Subclasses: Subclass unlocks at Level 3 in D&D 2024; normalize alias IDs to canonical IDs
        for (let i = 0; i < this.state.classes.length; i++) {
            const cc = this.state.classes[i];
            if ((cc.level || 1) < 3) {
                cc.subclassId = "";
                if (i === 0) {
                    this.state.subclassId = "";
                }
            } else if (cc.subclassId) {
                const resolvedId = this.resolveCanonicalSubclassId(cc.classId, cc.subclassId);
                cc.subclassId = resolvedId;
                if (i === 0) {
                    this.state.subclassId = resolvedId;
                }
            }
        }

        // 2. Fighting Style:
        const hasFightingStyle = this.state.classes.some((c) => {
            if (c.classId === "fighter" && (c.level || 1) >= 1) return true;
            if (c.classId === "paladin" && (c.level || 1) >= 2) return true;
            if (c.classId === "ranger" && (c.level || 1) >= 2) return true;
            return false;
        });
        if (!hasFightingStyle) {
            this.state.fightingStyle = "";
        }

        // 3. Divine Order: Requires Cleric (lvl >= 1)
        const hasCleric = this.state.classes.some((c) => c.classId === "cleric" && (c.level || 1) >= 1);
        if (!hasCleric) {
            this.state.divineOrder = "";
        }

        // 4. Primal Order: Requires Druid (lvl >= 1)
        const hasDruid = this.state.classes.some((c) => c.classId === "druid" && (c.level || 1) >= 1);
        if (!hasDruid) {
            this.state.primalOrder = "";
        }

        // 5. Metamagic: Requires Sorcerer (lvl >= 2)
        const maxMetamagic = this.getMaxMetamagicCount();
        if (maxMetamagic <= 0) {
            this.state.metamagic = [];
        } else if (this.state.metamagic && this.state.metamagic.length > maxMetamagic) {
            this.state.metamagic = this.state.metamagic.slice(0, maxMetamagic);
        }

        // 6. Invocations: Requires Warlock (lvl >= 1)
        const warlock = this.state.classes.find((c) => c.classId === "warlock");
        const warlockLvl = warlock ? (warlock.level || 1) : 0;
        const maxInvocations = this.getMaxInvocationsCount();
        if (warlockLvl <= 0 || maxInvocations <= 0) {
            this.state.invocations = [];
        } else if (this.state.invocations) {
            this.state.invocations = this.state.invocations.filter((id) => {
                const invDef = ELDRITCH_INVOCATIONS.find((inv) => inv.id === id);
                return !invDef?.minLevel || warlockLvl >= invDef.minLevel;
            });
            if (this.state.invocations.length > maxInvocations) {
                this.state.invocations = this.state.invocations.slice(0, maxInvocations);
            }
        }

        // 7. Battle Master Maneuvers: Requires Fighter Battle Master (lvl >= 3)
        const maxManeuvers = this.getMaxManeuversCount();
        if (maxManeuvers <= 0) {
            this.state.maneuvers = [];
        } else if (this.state.maneuvers && this.state.maneuvers.length > maxManeuvers) {
            this.state.maneuvers = this.state.maneuvers.slice(0, maxManeuvers);
        }

        // 8. Weapon Masteries:
        const maxWM = this.getMaxWeaponMasteriesCount();
        if (this.state.weaponMasteries && this.state.weaponMasteries.length > maxWM) {
            this.state.weaponMasteries = this.state.weaponMasteries.slice(0, maxWM);
        }

        // 9. Subclass Feature Choices (subclassFeatureChoices)
        if (this.state.subclassFeatureChoices) {
            for (const key of Object.keys(this.state.subclassFeatureChoices)) {
                const isDynamicChoiceActive = this.state.classes.some((cc) => {
                    const clsDef = this.classes.find((x) => x.id === cc.classId);
                    const subDef = clsDef?.subclasses?.find((s) => s.id === cc.subclassId);
                    const maxLvl = cc.level || 1;
                    const inClassProg = (clsDef?.progression || []).some(
                        (pl) => pl.level <= maxLvl && (pl.choices || []).some((ch) => (ch.choiceId || ch.id) === key)
                    );
                    const inSubProg = (subDef?.progression || []).some(
                        (pl) => pl.level <= maxLvl && (pl.choices || []).some((ch) => (ch.choiceId || ch.id) === key)
                    );
                    return inClassProg || inSubProg;
                });
                if (isDynamicChoiceActive) {
                    continue;
                }

                const parts = key.split("-");
                const classId = parts[0];
                const choiceLvl = parseInt(parts[1], 10);
                const classChoice = this.state.classes.find((c) => c.classId === classId);

                if (!classChoice || isNaN(choiceLvl) || (classChoice.level || 1) < choiceLvl) {
                    delete this.state.subclassFeatureChoices[key];
                    continue;
                }

                const clsDef = this.classes.find((x) => x.id === classId);
                const subDef = clsDef?.subclasses?.find((s) => key.includes(`-${s.id}`));
                if (subDef) {
                    if (classChoice.subclassId !== subDef.id) {
                        delete this.state.subclassFeatureChoices[key];
                    }
                }
            }
        }

        // 10. ASI Choices:
        if (this.state.asiChoices) {
            const asiLevels = this.getAsiLevels();
            for (const lvlStr of Object.keys(this.state.asiChoices)) {
                const lvlNum = parseInt(lvlStr, 10);
                if (!asiLevels.includes(lvlNum) || lvlNum > this.state.level) {
                    delete this.state.asiChoices[lvlNum];
                }
            }
        }
    }

    public syncStateClassProperties(): void {
        if (!Array.isArray(this.state.classes) || this.state.classes.length === 0) {
            this.state.classes = [{
                classId: this.state.classId || "fighter",
                level: this.state.level || 1,
                subclassId: this.state.subclassId || ""
            }];
        }
        const primary = this.state.classes[0];
        if (this.state.classes.length === 1) {
            if (this.state.classId && this.state.classId !== primary.classId) {
                primary.classId = this.state.classId;
            } else {
                this.state.classId = primary.classId;
            }

            if (this.state.subclassId !== undefined && this.state.subclassId !== primary.subclassId) {
                primary.subclassId = this.state.subclassId;
            } else {
                this.state.subclassId = primary.subclassId || "";
            }

            if (this.state.level && this.state.level !== primary.level) {
                primary.level = this.state.level;
            }
        } else {
            this.state.classId = primary.classId;
            this.state.subclassId = primary.subclassId || "";
        }

        this.state.level = this.getTotalLevel();
        this.sanitizeClassProgressionSelections();
    }

    // Rules & Stat Calculations delegates
    public getProficiencyBonus(): number {
        return rulesCalc.getProficiencyBonus(this);
    }

    public getEffectiveAbilityScore(stat: AbilityName): number {
        return rulesCalc.getEffectiveAbilityScore(this, stat);
    }

    public getAbilityModifier(stat: AbilityName): number {
        return rulesCalc.getAbilityModifier(this, stat);
    }

    public getMaxHp(): number {
        return rulesCalc.getMaxHp(this);
    }

    public getArmorClass(): number {
        return rulesCalc.getArmorClass(this);
    }

    public getInitiative(): number {
        return rulesCalc.getInitiative(this);
    }

    public getSpeed(): number {
        return rulesCalc.getSpeed(this);
    }

    public getSpecialSpeeds(): string[] {
        return rulesCalc.getSpecialSpeeds(this);
    }

    public getSpeedDisplay(): string {
        return rulesCalc.getSpeedDisplay(this);
    }

    public getTotalLevel(): number {
        return rulesCalc.getTotalLevel(this);
    }

    public canMulticlassInto(candidateClassId: string, classIndex: number): {
        allowed: boolean;
        reason?: string;
        prereqLabel?: string;
        currentScoreText?: string;
    } {
        return rulesCalc.canMulticlassInto(this, candidateClassId, classIndex);
    }

    public getAllArmorProficiencies(): string[] {
        return rulesCalc.getAllArmorProficiencies(this);
    }

    public getAllWeaponProficiencies(): string[] {
        return rulesCalc.getAllWeaponProficiencies(this);
    }

    public getAllToolProficiencies(): string[] {
        return rulesCalc.getAllToolProficiencies(this);
    }

    public getMaxClassSkillCount(): number {
        return rulesCalc.getMaxClassSkillCount(this);
    }

    public getAllowedClassSkills(): string[] {
        return rulesCalc.getAllowedClassSkills(this);
    }

    public isProficientWithArmor(armorName: string): boolean {
        return rulesCalc.isProficientWithArmor(this, armorName);
    }

    public isProficientWithShield(): boolean {
        return rulesCalc.isProficientWithShield(this);
    }

    public isProficientWithWeapon(weaponName: string): boolean {
        return rulesCalc.isProficientWithWeapon(this, weaponName);
    }

    public getWeaponStatRequirement(weaponName: string): { stat: "str" | "dex"; required: number; current: number; met: boolean } | null {
        return rulesCalc.getWeaponStatRequirement(this, weaponName);
    }

    public getArmorStatRequirement(armorName: string): { required: number; current: number; met: boolean } | null {
        return rulesCalc.getArmorStatRequirement(this, armorName);
    }

    public initClassDefaultEquipment(cls: any): void {
        rulesCalc.initClassDefaultEquipment(this, cls);
    }

    public isKitEquipped(idx: number): boolean {
        return rulesCalc.isKitEquipped(this, idx);
    }

    public getPointBuyCost(score: number): number {
        return rulesCalc.getPointBuyCost(score);
    }

    public getSpentPoints(): number {
        return rulesCalc.getSpentPoints(this);
    }

    public getAvailablePoints(): number {
        return rulesCalc.getAvailablePoints(this);
    }

    public canIncrementPointBuy(stat: AbilityName): boolean {
        return rulesCalc.canIncrementPointBuy(this, stat);
    }

    public canDecrementPointBuy(stat: AbilityName): boolean {
        return rulesCalc.canDecrementPointBuy(this, stat);
    }

    public incrementPointBuy(stat: AbilityName): boolean {
        return rulesCalc.incrementPointBuy(this, stat);
    }

    public decrementPointBuy(stat: AbilityName): boolean {
        return rulesCalc.decrementPointBuy(this, stat);
    }

    public setStandardArrayScore(targetStat: AbilityName, newValue: number): void {
        rulesCalc.setStandardArrayScore(this, targetStat, newValue);
    }

    public getAsiLevels(): number[] {
        return rulesCalc.getAsiLevels(this);
    }

    public ensureAsiChoices(): void {
        rulesCalc.ensureAsiChoices(this);
    }

    public getMaxWeaponMasteriesCount(): number {
        return rulesCalc.getMaxWeaponMasteriesCount(this);
    }

    public getMaxMetamagicCount(): number {
        return rulesCalc.getMaxMetamagicCount(this);
    }

    public getMaxInvocationsCount(): number {
        return rulesCalc.getMaxInvocationsCount(this);
    }

    public getMaxManeuversCount(): number {
        return rulesCalc.getMaxManeuversCount(this);
    }

    public getMaxExpertiseCount(): number {
        return rulesCalc.getMaxExpertiseCount(this);
    }

    // Spellcasting delegates
    public getSpellcasterInfos(): MulticlassCasterClassInfo[] {
        return spellCalc.getSpellcasterInfos(this);
    }

    public getMaxCantrips(): number {
        return spellCalc.getMaxCantrips(this);
    }

    public getMaxPreparedSpells(): number {
        return spellCalc.getMaxPreparedSpells(this);
    }

    public getAllowedSpellClasses(): string[] {
        return spellCalc.getAllowedSpellClasses(this);
    }

    public getMaxSpellLevel(): number {
        return spellCalc.getMaxSpellLevel(this);
    }

    public getAvailableSpells(): { cantrips: RuleSpellDefinition[]; leveledSpells: RuleSpellDefinition[]; spellsLvl1: RuleSpellDefinition[] } {
        return spellCalc.getAvailableSpells(this);
    }

    public getFeatureSpellChoiceSections(): FeatureSpellChoiceSection[] {
        return spellCalc.getFeatureSpellChoiceSections(this);
    }

    public sanitizeSpellSelections(): void {
        spellCalc.sanitizeSpellSelections(this);
    }

    public getSmartAutoFillSpells(): { cantrips: string[]; prepared: string[] } {
        return spellCalc.getSmartAutoFillSpells(this);
    }

    public getSpellcastingAbility(): AbilityName | null {
        return spellCalc.getSpellcastingAbility(this);
    }

    public getSpellSaveDc(abilityOverride?: AbilityName): number | null {
        return spellCalc.getSpellSaveDc(this, abilityOverride);
    }

    public getSpellAttackModifier(abilityOverride?: AbilityName): number | null {
        return spellCalc.getSpellAttackModifier(this, abilityOverride);
    }

    public getSpellSlotsSummary(): string {
        return spellCalc.getSpellSlotsSummary(this);
    }

    public getSpellcasterStatsList(): Array<{
        classId: string;
        className: string;
        level: number;
        ability: AbilityName;
        abilityMod: number;
        saveDc: number;
        attackMod: number;
        maxCantrips: number;
        maxPrepared: number;
        maxSpellLevel: number;
    }> {
        return spellCalc.getSpellcasterStatsList(this);
    }

    // Persistence delegates
    public buildPayload(): any {
        return persistService.buildPayload(this);
    }

    public async submitCharacter(): Promise<void> {
        return persistService.submitCharacter(this);
    }

    public async loadCharacter(targetId: string | number): Promise<void> {
        return persistService.loadCharacter(this, targetId);
    }

    // Step Rendering methods
    public renderStep(step: number, preserveScroll: boolean = true): void {
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

        if (preserveScroll && typeof window !== "undefined") {
            window.scrollTo({ top: prevScrollY, behavior: "instant" as any });
        }
    }

    public renderStep1Identity(): string {
        return renderStep1Identity(this);
    }

    public renderStep2Species(): string {
        return renderStep2Species(this);
    }

    public renderStep3Class(): string {
        return renderStep3Class(this);
    }

    public renderClassProgression(cls: ClassDefinition, classLevel: number = 1, classIdx: number = 0, activeSubId?: string): string {
        return renderClassProgression(this, cls, classLevel, classIdx, activeSubId);
    }

    public renderLevelChoices(cls: ClassDefinition, lvl: number, classIndex: number = 0): string {
        return renderLevelChoices(this, cls, lvl, classIndex);
    }

    public renderStep4Background(): string {
        return renderStep4Background(this);
    }

    public renderStep5Abilities(): string {
        return renderStep5Abilities(this);
    }

    public renderStep6Skills(): string {
        return renderStep6Skills(this);
    }

    public renderStep7Equipment(): string {
        return renderStep7Equipment(this);
    }

    public renderStep8Spells(): string {
        return renderStep8Spells(this);
    }

    public renderStep9Review(): string {
        return renderStep9Review(this);
    }

    // Event Attachment delegates
    public attachStepEvents(step: number): void {
        switch (step) {
            case 1:
                initIdentityController(this);
                break;
            case 2:
                initSpeciesController(this);
                break;
            case 3:
                initClassController(this);
                break;
            case 4:
                initBackgroundController(this);
                break;
            case 5:
                initAbilitiesController(this);
                break;
            case 6:
                initSkillsController(this);
                break;
            case 7:
                initEquipmentController(this);
                break;
            case 8:
                initSpellsController(this);
                break;
            case 9:
                initReviewController(this);
                break;
        }
    }

    public escape(str: string): string {
        return (str || "").replace(/"/g, "&quot;");
    }
}

export default function characterCreator(query?: any) {
    const ctrl = new CharacterCreatorController();
    ctrl.init(query);
    return ctrl;
}
