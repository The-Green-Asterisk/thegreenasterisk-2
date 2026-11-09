import { CLASSES_2024, ClassDefinition } from "../../../src/rules/dnd5e_2024";
import {
    CLASS_SCALING_TRAITS_2024,
    MULTICLASS_DATA_2024,
    buildClassProgression,
    buildSubclassProgression
} from "../../../server/services/database/rulesProgressionBuilder";
import { SEED_CLASSES } from "../../../server/services/database/rulesSeed";

/**
 * The classes as /get-rules serves them from rule_classes: the offline class list enriched with the seeded class
 * rules (skill choices, progression with modifiers and choices, multiclassing, scaling traits).
 */
export function serverRulesClasses(): ClassDefinition[] {
    return CLASSES_2024.map((cls) => {
        const seed: any = SEED_CLASSES.find((s: any) => s.id === cls.id);
        return {
            ...cls,
            skillChoices: seed?.skillChoices || cls.skillChoices,
            progression: buildClassProgression(cls.id, seed?.features || cls.features) as any,
            multiclassing: MULTICLASS_DATA_2024[cls.id] as any,
            scalingTraits: CLASS_SCALING_TRAITS_2024[cls.id],
            subclasses: cls.subclasses.map((s) => {
                const seedSub: any = (seed?.subclasses || []).find((ss: any) => ss.id === s.id);
                return {
                    ...s,
                    spellcastingOverride: seedSub?.spellcastingOverride,
                    progression: s.progression && s.progression.length > 0 ? s.progression : (buildSubclassProgression(cls.id, s as any) as any)
                };
            })
        };
    });
}
