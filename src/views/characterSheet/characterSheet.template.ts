import Helpers from "@services/helpers";
import {
    renderAbilityCards,
    renderActions,
    renderEditableSheetContent,
    renderEquipment,
    renderFeatures,
    renderHeroSection,
    renderLoaderBar,
    renderModals,
    renderSheetContent,
    renderSkills,
    renderSpellCard,
    renderSpellSlotsAndResources,
    renderSpellsByLevel,
    renderVitalsSection,
    renderWeapons
} from "./components/index";

const html = Helpers.html;

const characterSheetTemplate = () => html`
    <el-character-sheet>
        <div class="content-slate">
            ${renderLoaderBar()}
            <div id="dnd-beyond-note" class="hidden">
                Note that none of the changes you make here will be reflected on D&D Beyond.
            </div>

            <div id="character-sheet-dynamic-content" class="sheet-dynamic-content">
            </div>
        </div>

        ${renderModals()}

        <button type="button" id="sheet-fullscreen-floating-btn" class="sheet-fullscreen-floating-btn sheet-fullscreen-btn" aria-label="Enter full screen" title="Enter full screen">
            <i class="fa-solid fa-expand"></i>
        </button>
    </el-character-sheet>
`;

// Re-export modular renderers for direct access or controller usage
export {
    renderAbilityCards,
    renderActions,
    renderEditableSheetContent,
    renderEquipment,
    renderFeatures,
    renderHeroSection,
    renderLoaderBar,
    renderModals,
    renderSheetContent,
    renderSkills,
    renderSpellCard,
    renderSpellSlotsAndResources,
    renderSpellsByLevel,
    renderVitalsSection,
    renderWeapons
};

export default characterSheetTemplate;
