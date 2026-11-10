import { AbilityName } from "../../../rules/dnd5e_2024";
import { CharacterCreatorContext } from "../controllers/context";

/**
 * Fields of a character imported from D&D Beyond that keep the creator's value when the character is refreshed from
 * D&D Beyond (CharacterData.lockedFields). Keys match what applyLockedFieldsToRefreshedCharacter reads.
 */
export interface LockGroup {
    key: string;
    label: string;
    /** Creator step the field is edited on */
    step: number;
    /** Changing it rebuilds the character's derived stats, features, and actions from the creator */
    structural?: boolean;
    slice: (ctx: CharacterCreatorContext) => unknown;
}

export const DETAIL_LOCK_FIELDS: Array<{ key: string; label: string }> = [
    { key: "age", label: "Age" }, { key: "height", label: "Height" }, { key: "weight", label: "Weight" },
    { key: "hair", label: "Hair" }, { key: "eyes", label: "Eyes" }, { key: "skin", label: "Skin" },
    { key: "faith", label: "Faith" }, { key: "lifestyle", label: "Lifestyle" }
];

export const NOTE_LOCK_FIELDS: Array<{ key: string; label: string }> = [
    { key: "personalityTraits", label: "Personality Traits" }, { key: "ideals", label: "Ideals" }, { key: "bonds", label: "Bonds" },
    { key: "flaws", label: "Flaws" }, { key: "appearance", label: "Appearance" }, { key: "backstory", label: "Backstory" },
    { key: "allies", label: "Allies" }, { key: "organizations", label: "Organizations" }, { key: "enemies", label: "Enemies" },
    { key: "personalPossessions", label: "Personal Possessions" }, { key: "otherHoldings", label: "Other Holdings" },
    { key: "otherNotes", label: "Other Notes" }
];

const ABILITY_LOCKS: Array<[AbilityName, string, string]> = [
    ["str", "STR", "Strength"], ["dex", "DEX", "Dexterity"], ["con", "CON", "Constitution"],
    ["int", "INT", "Intelligence"], ["wis", "WIS", "Wisdom"], ["cha", "CHA", "Charisma"]
];

const text = (v: unknown) => String(v ?? "").trim();

export const LOCK_GROUPS: LockGroup[] = [
    { key: "name", label: "Character Name", step: 1, slice: (c) => text(c.state.name) },
    { key: "alignment", label: "Alignment", step: 1, slice: (c) => text(c.state.alignment) },
    { key: "details.gender", label: "Gender / Pronouns", step: 1, slice: (c) => text(c.state.gender) },
    { key: "avatarUrl", label: "Character Avatar", step: 1, slice: (c) => text(c.state.avatarUrl) },
    ...DETAIL_LOCK_FIELDS.map((f): LockGroup => ({
        key: `details.${f.key}`, label: f.label, step: 1, slice: (c) => text((c.state.details as Record<string, unknown> | undefined)?.[f.key])
    })),
    ...NOTE_LOCK_FIELDS.map((f): LockGroup => ({
        key: `notes.${f.key}`, label: f.label, step: 1, slice: (c) => text(c.state.notes?.[f.key])
    })),
    {
        key: "race", label: "Species", step: 2, structural: true,
        slice: (c) => [c.state.speciesId, c.state.lineageId, c.state.speciesChoices, c.state.speciesSpellAbility]
    },
    {
        key: "classes", label: "Classes and Levels", step: 3, structural: true,
        slice: (c) => [c.state.classes, c.state.weaponMasteries, c.state.fightingStyle, c.state.divineOrder, c.state.primalOrder,
            c.state.metamagic, c.state.invocations, c.state.maneuvers, c.state.subclassFeatureChoices]
    },
    {
        key: "background", label: "Background", step: 4, structural: true,
        slice: (c) => [c.state.backgroundId, c.state.backgroundOption, c.state.bgStatA, c.state.bgStatB, c.state.bgStatC, c.state.bgTool]
    },
    ...ABILITY_LOCKS.map(([ab, abbr, name]): LockGroup => ({
        key: `abilities.${abbr}`, label: `${name} Score`, step: 5, structural: true, slice: (c) => c.state.baseAbilities?.[ab]
    })),
    {
        key: "feats", label: "Feats and Ability Score Improvements", step: 5, structural: true,
        slice: (c) => [c.state.originFeatId, c.state.featSpellAbility, c.state.asiChoices, c.state.featSkillChoices]
    },
    { key: "vitals.maxHp", label: "Hit Point Maximum", step: 9, slice: (c) => c.getMaxHp() },
    { key: "skills", label: "Skills", step: 6, slice: (c) => [c.state.classSkills, c.state.expertiseSkills, c.state.featSkillChoices] },
    { key: "equipment", label: "Equipment", step: 7, slice: (c) => [c.state.selectedWeapons, c.state.selectedArmor, c.state.hasShield, c.state.equippedKitIndex] },
    {
        key: "spells", label: "Spells", step: 8,
        slice: (c) => [c.state.classSpellSelections, c.state.selectedCantrips, c.state.selectedSpellsLevel1, c.state.featureSpellChoices]
    }
];

export const findLockGroup = (key: string) => LOCK_GROUPS.find((g) => g.key === key);

/** Whether the character in the creator came from D&D Beyond, so its fields can be locked. */
export const isImportedCharacter = (ctx: CharacterCreatorContext) => !!ctx.state.dndBeyondId;

function sliceText(ctx: CharacterCreatorContext, group: LockGroup): string {
    try {
        return JSON.stringify(group.slice(ctx) ?? null);
    } catch {
        return "";
    }
}

/** Records each lockable field's value as loaded, to tell later which ones the player changed. */
export function snapshotLockGroups(ctx: CharacterCreatorContext): void {
    ctx.lockSnapshot = Object.fromEntries(LOCK_GROUPS.map((g) => [g.key, sliceText(ctx, g)]));
}

/** Lock keys whose value differs from when the character was loaded. */
export function changedLockKeys(ctx: CharacterCreatorContext): string[] {
    const snap = ctx.lockSnapshot;
    if (!snap) return [];
    return LOCK_GROUPS.filter((g) => snap[g.key] !== undefined && snap[g.key] !== sliceText(ctx, g)).map((g) => g.key);
}

/**
 * Whether a field is locked: the player's own choice when they made one, else locked when it was locked on load or
 * changed since (so an edit isn't lost on the next D&D Beyond refresh).
 */
export function isLockOn(ctx: CharacterCreatorContext, key: string, changed = changedLockKeys(ctx)): boolean {
    const choice = ctx.state.lockChoices?.[key];
    if (typeof choice === "boolean") return choice;
    return !!ctx.loadedLocks?.[key] || changed.includes(key);
}

/** Every locked field, as CharacterData.lockedFields. */
export function effectiveLocks(ctx: CharacterCreatorContext): Record<string, boolean> {
    const changed = changedLockKeys(ctx);
    const keys = new Set([...Object.keys(ctx.loadedLocks || {}), ...LOCK_GROUPS.map((g) => g.key)]);
    const out: Record<string, boolean> = {};
    keys.forEach((k) => {
        if (isLockOn(ctx, k, changed)) out[k] = true;
    });
    return out;
}

/** A toggle that locks a field against D&D Beyond refreshes; empty for characters not imported from D&D Beyond. */
export function renderLockToggle(ctx: CharacterCreatorContext, key: string): string {
    if (!isImportedCharacter(ctx)) return "";
    const group = findLockGroup(key);
    if (!group) return "";
    const on = isLockOn(ctx, key);
    return `<button type="button" class="creator-lock-btn${on ? " is-locked" : ""}" data-lock-key="${key}" aria-pressed="${on}" aria-label="Lock ${group.label}" title="${on ? "Keeps this through D&amp;D Beyond refreshes" : "D&amp;D Beyond refreshes replace this"}"><i class="fa-solid ${on ? "fa-lock" : "fa-lock-open"}" aria-hidden="true"></i> Lock</button>`;
}

/** The note atop a step explaining locks, for imported characters. */
export function renderLockNote(ctx: CharacterCreatorContext): string {
    if (!isImportedCharacter(ctx)) return "";
    return `<p class="creator-lock-note"><i class="fa-solid fa-lock" aria-hidden="true"></i> Imported from D&amp;D Beyond. Locked fields keep what you set here when the character is refreshed from D&amp;D Beyond; fields you change lock automatically.</p>`;
}

/** Brings every lock toggle on the page up to date (after an edit, or after one is pressed). */
export function refreshLockToggles(ctx: CharacterCreatorContext, root: ParentNode = document): void {
    const changed = changedLockKeys(ctx);
    root.querySelectorAll<HTMLButtonElement>(".creator-lock-btn[data-lock-key]").forEach((btn) => {
        const on = isLockOn(ctx, btn.dataset.lockKey || "", changed);
        btn.classList.toggle("is-locked", on);
        btn.setAttribute("aria-pressed", String(on));
        btn.title = on ? "Keeps this through D&D Beyond refreshes" : "D&D Beyond refreshes replace this";
        const icon = btn.querySelector("i");
        if (icon) icon.className = `fa-solid ${on ? "fa-lock" : "fa-lock-open"}`;
    });
}

let lockEventsBound = false;

/** Lock toggles flip on press; edits anywhere in the creator update them. Bound once. */
export function bindLockEvents(ctx: CharacterCreatorContext): void {
    if (lockEventsBound || typeof document === "undefined") return;
    lockEventsBound = true;
    document.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>(".creator-lock-btn[data-lock-key]");
        if (!btn) {
            if ((e.target as HTMLElement | null)?.closest?.("el-character-creator")) setTimeout(() => refreshLockToggles(ctx), 0);
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const key = btn.dataset.lockKey || "";
        ctx.state.lockChoices = { ...(ctx.state.lockChoices || {}), [key]: !isLockOn(ctx, key) };
        refreshLockToggles(ctx);
    });
    const onEdit = (e: Event) => {
        if ((e.target as HTMLElement | null)?.closest?.("el-character-creator")) setTimeout(() => refreshLockToggles(ctx), 0);
    };
    document.addEventListener("input", onEdit);
    document.addEventListener("change", onEdit);
}

const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/**
 * Keeps what's played at the table (current and temporary HP, death saves, inspiration, conditions, exhaustion, used
 * slots and resources) when an existing character is saved from the creator. Current HP moves with the maximum.
 */
export function keepPlayState(loaded: any, payload: any): void {
    if (!loaded || !payload?.vitals) return;
    const oldMax = Number(loaded.vitals?.maxHp) || 0;
    const newMax = Number(payload.vitals.maxHp) || 0;
    const oldCurrent = Number(loaded.vitals?.currentHp);
    if (Number.isFinite(oldCurrent) && oldMax > 0) {
        payload.vitals.currentHp = Math.max(0, Math.min(newMax, oldCurrent + (newMax - oldMax)));
    }
    if (loaded.vitals?.tempHp !== undefined) payload.vitals.tempHp = Number(loaded.vitals.tempHp) || 0;
    if (loaded.vitals?.deathSaves) payload.vitals.deathSaves = clone(loaded.vitals.deathSaves);
    if (loaded.vitals?.heroicInspiration !== undefined) payload.vitals.heroicInspiration = !!loaded.vitals.heroicInspiration;
    for (const k of ["trackingState", "activeConditions", "exhaustionLevel"]) {
        if (loaded[k] !== undefined) payload[k] = clone(loaded[k]);
    }
}

/**
 * The character to save for one imported from D&D Beyond. When only identity, skills, spells, equipment, or nothing
 * changed, it's the loaded character (everything D&D Beyond gave, homebrew included) with just those changes; when
 * species, class, background, ability scores, or feats changed, it's the creator's character, which rebuilds the
 * stats they feed, keeping D&D Beyond's languages and anything else the creator doesn't make. Either way it stays
 * linked to D&D Beyond and carries the locks.
 */
export function mergeImportedCharacter(ctx: CharacterCreatorContext, built: any): any {
    const loaded = ctx.loadedCharacter;
    const changed = changedLockKeys(ctx);
    const structural = changed.some((k) => findLockGroup(k)?.structural);
    let out: any;
    if (!loaded) {
        out = built;
    } else if (structural) {
        out = built;
        const languages = [...new Set([...(built.proficiencies?.languages || []), ...(loaded.proficiencies?.languages || [])])];
        out.proficiencies = { ...(built.proficiencies || {}), languages };
        for (const k of ["dndBeyondUrl", "customProficiencies", "customDefenses", "customActions", "conditionImmunities"]) {
            if (loaded[k] !== undefined && out[k] === undefined) out[k] = clone(loaded[k]);
        }
        // Gear the player didn't change stays as D&D Beyond had it (homebrew included); weapons are rebuilt for the new math
        if (!changed.includes("equipment") && Array.isArray(loaded.equipment)) out.equipment = clone(loaded.equipment);
        if (loaded.details?.experiencePoints !== undefined) out.details = { ...(out.details || {}), experiencePoints: loaded.details.experiencePoints };
        // D&D Beyond's maximum can differ from the creator's (rolled or set hit points); keep that difference
        const snapMax = Number(ctx.lockSnapshot?.["vitals.maxHp"]);
        const loadedMax = Number(loaded.vitals?.maxHp);
        if (out.vitals && Number.isFinite(snapMax) && Number.isFinite(loadedMax) && loadedMax > 0) {
            out.vitals.maxHp = Math.max(1, loadedMax + (ctx.getMaxHp() - snapMax));
        }
    } else {
        out = clone(loaded);
        const take = (key: string, apply: () => void) => { if (changed.includes(key)) apply(); };
        take("name", () => { out.name = built.name; });
        take("alignment", () => { out.alignment = built.alignment; });
        take("avatarUrl", () => { out.avatarUrl = built.avatarUrl; });
        for (const g of LOCK_GROUPS.filter((x) => x.key.startsWith("details.") || x.key.startsWith("notes."))) {
            const [section, field] = g.key.split(".");
            take(g.key, () => {
                const value = built[section]?.[field];
                out[section] = { ...(out[section] || {}) };
                if (value === undefined || value === "") delete out[section][field];
                else out[section][field] = value;
            });
        }
        take("skills", () => { out.skills = clone(built.skills); });
        take("spells", () => { out.spells = clone(built.spells); });
        take("equipment", () => {
            out.weapons = clone(built.weapons);
            out.equipment = clone(built.equipment);
            if (built.vitals) out.vitals = { ...out.vitals, armorClass: built.vitals.armorClass };
        });
        out.currency = built.currency ?? out.currency;
        out.creatorState = clone(built.creatorState);
    }
    keepPlayState(loaded, out);
    out.source = "dndbeyond";
    out.id = ctx.state.dndBeyondId ? Number(ctx.state.dndBeyondId) || ctx.state.dndBeyondId : out.id;
    const locks = effectiveLocks(ctx);
    if (Object.keys(locks).length > 0) out.lockedFields = locks;
    else delete out.lockedFields;
    return out;
}

/** Identity inputs (by element id) and the lock key each one sets. */
const IDENTITY_LOCK_INPUTS: Record<string, string> = {
    "char-name-input": "name",
    "char-alignment-select": "alignment",
    "char-gender-input": "details.gender",
    ...Object.fromEntries(DETAIL_LOCK_FIELDS.map((f) => [`char-detail-${f.key}`, `details.${f.key}`])),
    ...Object.fromEntries(NOTE_LOCK_FIELDS.map((f) => [`char-note-${f.key}`, `notes.${f.key}`]))
};

/** Step-wide locks shown in the step's header, by step. */
const STEP_HEADER_LOCKS: Record<number, string[]> = {
    2: ["race"], 3: ["classes"], 4: ["background", "feats"], 5: ["feats"], 6: ["skills"], 7: ["equipment"], 8: ["spells"]
};

/**
 * Adds lock toggles to a rendered step for an imported character: beside each identity field, in the step's header,
 * on each ability score, and, on the review step, a list of every lock.
 */
export function decorateStepLocks(ctx: CharacterCreatorContext, step: number, root: ParentNode): void {
    if (!isImportedCharacter(ctx)) return;
    const header = root.querySelector<HTMLElement>(".panel-header");
    header?.insertAdjacentHTML("beforeend", renderLockNote(ctx));
    const headerLocks = STEP_HEADER_LOCKS[step] || [];
    if (header && headerLocks.length > 0) {
        header.insertAdjacentHTML("beforeend", `<div class="creator-lock-row">${headerLocks.map((k) => renderLockToggle(ctx, k)).join("")}</div>`);
    }
    if (step === 1) {
        Object.entries(IDENTITY_LOCK_INPUTS).forEach(([id, key]) => {
            root.querySelector(`label[for="${id}"]`)?.insertAdjacentHTML("afterend", renderLockToggle(ctx, key));
        });
        root.querySelector("#char-avatar-heading")?.insertAdjacentHTML("afterend", renderLockToggle(ctx, "avatarUrl"));
    }
    if (step === 5) {
        root.querySelectorAll<HTMLElement>(".ability-score-card[data-stat-card]").forEach((card) => {
            const abbr = String(card.dataset.statCard || "").toUpperCase();
            card.insertAdjacentHTML("beforeend", renderLockToggle(ctx, `abilities.${abbr}`));
        });
    }
    if (step === 9) {
        const panel = root.querySelector<HTMLElement>(".step-panel") || (root as HTMLElement);
        panel.insertAdjacentHTML("beforeend", `
            <fieldset class="creator-detail-box creator-fieldset creator-lock-list">
                <legend><h4>Locked from D&amp;D Beyond refreshes</h4></legend>
                <ul>${LOCK_GROUPS.map((g) => `<li><span>${g.label}</span>${renderLockToggle(ctx, g.key)}</li>`).join("")}</ul>
            </fieldset>`);
    }
}
