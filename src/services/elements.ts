import BaseEl from "./baseElements";

export default class el extends BaseEl {
    public static get cookieBanner() {
        return this.getElement<HTMLElement>('el-cookie-banner');
    }
    public static get cookieBannerButton() {
        return this.getElement<HTMLButtonElement>('el-cookie-banner button');
    }
    public static get home() {
        return this.getElement<HTMLElement>('el-home');
    }
    public static get profile() {
        return this.getElement<HTMLElement>('el-profile');
    }
    public static get currentGames() {
        return this.getElement<HTMLElement>('el-current-games');
    }
    public static get survivors() {
        return this.getElement<HTMLElement>('el-survivors');
    }
    public static get manyWorlds() {
        return this.getElement<HTMLElement>('el-many-worlds');
    }
    public static get links() {
        return this.getElement<HTMLElement>('el-links');
    }
    public static get contact() {
        return this.getElement<HTMLElement>('el-contact');
    }
    public static get prDigest() {
        return this.getElement<HTMLElement>('el-pr-digest');
    }
    public static get characterSheet() {
        return this.getElement<HTMLElement>('el-character-sheet');
    }
    public static list<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
        return this.getElements<T>(selector) ?? ([] as unknown as NodeListOf<T>);
    }
    public static creatorClassSection(index: number | string) {
        return this.getElement<HTMLElement>(`#class-section-${index}`);
    }
    public static creatorLevelProgressionBoxes(classIndex: number | string) {
        return this.list<HTMLElement>(`.level-progression-box[data-class-index="${classIndex}"]`);
    }
    public static get creatorAbilityTabButtons() {
        return this.list<HTMLElement>('.tab-btn');
    }
    public static get creatorAddClassButton() {
        return this.getElement<HTMLElement>('#add-class-btn');
    }
    public static get creatorAlignmentSelect() {
        return this.getElement<HTMLElement>('#char-alignment-select');
    }
    public static get creatorArmorSelect() {
        return this.getElement<HTMLElement>('#char-armor-select');
    }
    public static get creatorAsiFeatSelects() {
        return this.list<HTMLElement>('.asi-feat-select');
    }
    public static get creatorAsiStatSelects() {
        return this.list<HTMLElement>('.asi-stat-select');
    }
    public static get creatorAsiTypeRadios() {
        return this.list<HTMLElement>('.asi-type-radio');
    }
    public static get creatorAutoSpellsButton() {
        return this.getElement<HTMLElement>('.auto-spells-btn');
    }
    public static get creatorAvatarFileInput() {
        return this.getElement<HTMLElement>('#char-avatar-file-input');
    }
    public static get creatorAvatarInput() {
        return this.getElement<HTMLElement>('#char-avatar-input');
    }
    public static get creatorAvatarPreview() {
        return this.getElement<HTMLElement>('#char-avatar-preview-img');
    }
    public static get creatorAvatarUploadButton() {
        return this.getElement<HTMLElement>('#char-avatar-upload-btn');
    }
    public static get creatorAvatarUploadStatus() {
        return this.getElement<HTMLElement>('#char-avatar-upload-status');
    }
    public static get creatorBackgroundCards() {
        return this.list<HTMLElement>('.background-card');
    }
    public static get creatorBackgroundOptionInputs() {
        return this.list<HTMLInputElement>('input[name="bg-option"]');
    }
    public static get creatorBackgroundStatA() {
        return this.getElement<HTMLElement>('#bg-stat-a');
    }
    public static get creatorBackgroundStatB() {
        return this.getElement<HTMLElement>('#bg-stat-b');
    }
    public static get creatorClassCards() {
        return this.list<HTMLElement>('.class-card');
    }
    public static get creatorClearSpellsButton() {
        return this.getElement<HTMLElement>('.clear-spells-btn');
    }
    public static get creatorCoinInputs() {
        return this.list<HTMLInputElement>('.char-coin-input');
    }
    public static get creatorDdbRereadButton() {
        return this.getElement<HTMLButtonElement>('.ddb-reread-btn');
    }
    public static get creatorDdbRereadCancelButton() {
        return this.getElement<HTMLElement>('.ddb-reread-cancel-btn');
    }
    public static get creatorDdbRereadConfirm() {
        return this.getElement<HTMLElement>('#ddb-reread-confirm');
    }
    public static get creatorDdbRereadConfirmButton() {
        return this.getElement<HTMLButtonElement>('.ddb-reread-confirm-btn');
    }
    public static get creatorDdbRereadStatus() {
        return this.getElement<HTMLElement>('.ddb-reread-status');
    }
    public static get creatorDetailInputs() {
        return this.list<HTMLInputElement | HTMLSelectElement>('.char-detail-input');
    }
    public static get creatorEquipPackageButtons() {
        return this.list<HTMLElement>('.equip-package-btn');
    }
    public static get creatorExitLink() {
        return this.getElement<HTMLAnchorElement>('#creator-exit-btn, .creator-cancel-btn');
    }
    public static get creatorFeatSpellAbilitySelect() {
        return this.getElement<HTMLElement>('#feat-spell-ability-select');
    }
    public static get creatorFeatureSpellRows() {
        return this.list<HTMLElement>('.feature-spell-row');
    }
    public static get creatorGenderInput() {
        return this.getElement<HTMLElement>('#char-gender-input');
    }
    public static get creatorLevelCardHeaders() {
        return this.list<HTMLElement>('.level-card-header');
    }
    public static get creatorLineageCards() {
        return this.list<HTMLElement>('.lineage-card');
    }
    public static get creatorMasteryCards() {
        return this.list<HTMLElement>('.mastery-card');
    }
    public static get creatorMulticlassBottomBar() {
        return this.getElement<HTMLElement>('#multiclass-bottom-bar');
    }
    public static get creatorMulticlassBottomNav() {
        return this.getElement<HTMLElement>('#multiclass-bottom-nav');
    }
    public static get creatorMulticlassStepPanel() {
        return this.getElement<HTMLElement>('.multiclass-step-panel');
    }
    public static get creatorMulticlassTopBar() {
        return this.getElement<HTMLElement>('#multiclass-top-bar');
    }
    public static get creatorMulticlassTopNavButtons() {
        return this.getElement<HTMLElement>('#multiclass-top-nav-buttons');
    }
    public static get creatorNameInput() {
        return this.getElement<HTMLElement>('#char-name-input');
    }
    public static get creatorNavToClassButtons() {
        return this.list<HTMLElement>('.nav-to-class-btn[data-target-class]');
    }
    public static get creatorNextButton() {
        return this.getElement<HTMLElement>('#creator-next-btn');
    }
    public static get creatorNoteInputs() {
        return this.list<HTMLTextAreaElement>('.char-note-input');
    }
    public static get creatorPointBuyDecButtons() {
        return this.list<HTMLElement>('.point-buy-dec-btn');
    }
    public static get creatorPointBuyIncButtons() {
        return this.list<HTMLElement>('.point-buy-inc-btn');
    }
    public static get creatorPoolCards() {
        return this.list<HTMLElement>('.pool-card');
    }
    public static get creatorPrevButton() {
        return this.getElement<HTMLElement>('#creator-prev-btn');
    }
    public static get creatorProgressionFilterButtons() {
        return this.list<HTMLElement>('.prog-filter-btn');
    }
    public static get creatorProgressionLevelBadges() {
        return this.list<HTMLElement>('.progression-lvl-badge');
    }
    public static get creatorProgressionToggleAllButtons() {
        return this.list<HTMLElement>('.progression-toggle-all-btn');
    }
    public static get creatorRemoveClassButtons() {
        return this.list<HTMLElement>('.remove-class-btn');
    }
    public static get creatorRollAllButton() {
        return this.getElement<HTMLElement>('#roll-all-stats-btn');
    }
    public static get creatorScoreDecButtons() {
        return this.list<HTMLElement>('.score-dec-btn');
    }
    public static get creatorScoreIncButtons() {
        return this.list<HTMLElement>('.score-inc-btn');
    }
    public static get creatorScoreInputs() {
        return this.list<HTMLElement>('.score-num-input');
    }
    public static get creatorScrollBottomButton() {
        return this.getElement<HTMLElement>('#floating-scroll-bottom-btn');
    }
    public static get creatorScrollToBottomButtons() {
        return this.list<HTMLElement>('.scroll-to-bottom-btn');
    }
    public static get creatorShieldCheckbox() {
        return this.getElement<HTMLElement>('#char-shield-checkbox');
    }
    public static get creatorSpeciesCards() {
        return this.list<HTMLElement>('.species-card');
    }
    public static get creatorSpeciesPickSelects() {
        return this.list<HTMLSelectElement>('.species-pick-select');
    }
    public static get creatorSpeciesSpellAbilitySelect() {
        return this.getElement<HTMLElement>('#species-spell-ability-select');
    }
    public static get creatorSpellClassTabButtons() {
        return this.list<HTMLElement>('.spell-class-tab-btn');
    }
    public static get creatorSpellRows() {
        return this.list<HTMLElement>('.spell1-row, .feature-spell-row');
    }
    public static get creatorSpellSearchInput() {
        return this.getElement<HTMLElement>('#spell-search-input');
    }
    public static get creatorSpellTabButtons() {
        return this.list<HTMLElement>('.spell-tab-btn');
    }
    public static get creatorStandardArraySelects() {
        return this.list<HTMLElement>('.standard-array-select');
    }
    public static get creatorStartingPackageCards() {
        return this.list<HTMLElement>('.starting-package-card');
    }
    public static get creatorStepIndicator() {
        return this.getElement<HTMLElement>('#creator-step-indicator');
    }
    public static get creatorStepPanels() {
        return this.getElement<HTMLElement>('#creator-step-panels');
    }
    public static get creatorStepperItems() {
        return this.list<HTMLElement>('.stepper-item');
    }
    public static get creatorSubclassCards() {
        return this.list<HTMLElement>('.subclass-card');
    }
    public static get creatorSubclassFeatureCards() {
        return this.list<HTMLElement>('.subclass-feature-card');
    }
    public static get creatorSubmitButton() {
        return this.getElement<HTMLElement>('#creator-submit-btn');
    }
    public static get creatorSummaryAc() {
        return this.getElement<HTMLElement>('#summary-ac');
    }
    public static get creatorSummaryAvatar() {
        return this.getElement<HTMLElement>('#summary-avatar-img');
    }
    public static get creatorSummaryHp() {
        return this.getElement<HTMLElement>('#summary-hp');
    }
    public static get creatorSummaryInit() {
        return this.getElement<HTMLElement>('#summary-init');
    }
    public static get creatorSummaryMeta() {
        return this.getElement<HTMLElement>('#summary-meta');
    }
    public static get creatorSummaryName() {
        return this.getElement<HTMLElement>('#summary-name');
    }
    public static get creatorSummarySpeed() {
        return this.getElement<HTMLElement>('#summary-speed');
    }
    public static get creatorValidationAlert() {
        return this.getElement<HTMLElement>('#creator-validation-alert');
    }
    public static get creatorWeaponRows() {
        return this.list<HTMLElement>('.weapon-row');
    }
    public static get exportPdfModal() {
        return this.getElement<HTMLElement>('#export-pdf-modal-container');
    }
    public static get navRevealButton() {
        return this.getElement<HTMLElement>('#nav-reveal-asterisk');
    }
    public static get openSheetModalBackdrop() {
        return this.getElement<HTMLElement>('.spell-modal-backdrop.visible:not(.hidden)');
    }
};
