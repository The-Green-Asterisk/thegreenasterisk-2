import { resolveRuleClass } from "../classChoiceDecisions";
import { CharacterData } from "../characterData";

export type SheetTab = "weapons" | "spells" | "actions" | "skills" | "equipment" | "features" | "details";

const AFTER_LEAD: SheetTab[] = ["actions", "skills", "equipment", "features", "details"];

/**
 * Whether the sheet leads with Spells: the character's highest-level class (the first listed on a tie) is a full or
 * pact caster in the class rules. Half and third casters and non-casters lead with Weapons.
 */
export function leadsWithSpells(data: Pick<CharacterData, "classes">): boolean {
    const main = (data.classes || []).reduce<CharacterData["classes"][number] | undefined>(
        (best, c) => (!best || (Number(c.level) || 0) > (Number(best.level) || 0) ? c : best),
        undefined
    );
    if (!main) return false;
    const type = resolveRuleClass(main.name, main.subclass).def?.spellcasting?.type;
    return type === "full" || type === "pact";
}

/** The sheet's tab order: Spells or Weapons first, the other second, then Actions, Skills, Equipment, Features, Details. */
export function sheetTabOrder(data: Pick<CharacterData, "classes">): SheetTab[] {
    return [...(leadsWithSpells(data) ? ["spells", "weapons"] as SheetTab[] : ["weapons", "spells"] as SheetTab[]), ...AFTER_LEAD];
}
