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

            <div id="character-sheet-dynamic-content" class="sheet-dynamic-content">
            </div>
        </div>

        ${renderModals()}

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
