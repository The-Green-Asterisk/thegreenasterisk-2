import sanitizeHtml from "sanitize-html";

/**
 * Cleans text that users write (comments, profiles, custom spells and items, and the character copies of spells,
 * items, and features) so it can't run script when the browser renders it. Rich fields keep a formatting allowlist; plain
 * fields lose all tags; URL fields must be http(s) or root-relative. Placeholders like {{savedc:cha}} and markup
 * tags like [spell]Fireball[/spell] are plain text to the sanitizer and pass through unchanged.
 */

const RICH_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        "p", "br", "hr", "div", "span", "strong", "b", "em", "i", "u", "s", "strike", "del", "ins", "sub", "sup",
        "small", "mark", "code", "pre", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "dl",
        "dt", "dd", "table", "caption", "thead", "tbody", "tfoot", "tr", "th", "td", "a", "img", "abbr", "cite", "q"
    ],
    allowedAttributes: {
        "*": ["class", "title"],
        a: ["href", "target", "rel"],
        img: ["src", "alt", "width", "height"],
        th: ["colspan", "rowspan", "scope"],
        td: ["colspan", "rowspan", "scope"],
        ol: ["start", "type"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    disallowedTagsMode: "discard"
};

/**
 * Allowlisted HTML. The sanitizer escapes every bare &, <, and > in text; & and > are turned back so the edit
 * dialogs, which show the stored HTML as source, don't fill up with &amp;. Neither can start a tag. < stays escaped.
 */
export function sanitizeRichText<T extends string | null | undefined>(value: T): T {
    if (typeof value !== "string" || !value.includes("<")) return value;
    return sanitizeHtml(value, RICH_OPTIONS).replace(/&amp;/g, "&").replace(/&gt;/g, ">") as T;
}

/** No markup at all: every tag goes, and so does any < left without a closing >. */
export function sanitizePlainText<T extends string | null | undefined>(value: T): T {
    if (typeof value !== "string" || !value.includes("<")) return value;
    return value.replace(/<[^>]*>?/g, "") as T;
}

const SAFE_URL = /^(?:https?:\/\/|\/)[^\s"'<>`]*$/i;

/**
 * http(s) or root-relative, with nothing that can close an attribute. Anything else becomes "", which also fits
 * the NOT NULL columns (profilePicture).
 */
export function sanitizeUrl<T extends string | null | undefined>(value: T): T | "" {
    if (typeof value !== "string" || value === "") return value;
    return SAFE_URL.test(value) ? value : "";
}

const PAYLOAD_RICH_KEYS = new Set(["description", "notes", "masteryDescription"]);
const PAYLOAD_PLAIN_KEYS = new Set(["name", "source", "school", "castingTime", "range", "duration", "components",
    "category", "damage", "damageType", "rarity", "properties", "mastery", "masteryName", "grantedBy"]);

function sanitizePayloadValue(value: unknown, depth: number): unknown {
    if (depth > 20 || !value || typeof value !== "object") return value;
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) value[i] = sanitizePayloadValue(value[i], depth + 1);
        return value;
    }
    const obj = value as Record<string, unknown>;
    for (const [key, v] of Object.entries(obj)) {
        if (typeof v === "string") {
            if (PAYLOAD_RICH_KEYS.has(key)) obj[key] = sanitizeRichText(v);
            else if (PAYLOAD_PLAIN_KEYS.has(key)) obj[key] = sanitizePlainText(v);
        } else {
            obj[key] = sanitizePayloadValue(v, depth + 1);
        }
    }
    return obj;
}

/**
 * A saved character's JSON payload holds its own copies of spells, items, and features, and the sheet renders it
 * when the rows are missing. Cleans the fields those copies share with the spell and item rows, at any depth.
 * Anything that isn't JSON is returned as is.
 */
export function sanitizeCharacterPayload<T extends string | null | undefined>(payload: T): T {
    if (typeof payload !== "string" || !payload.includes("<")) return payload;
    let parsed: unknown;
    try {
        parsed = JSON.parse(payload);
    } catch {
        return payload;
    }
    return JSON.stringify(sanitizePayloadValue(parsed, 0)) as T;
}

interface FieldRules {
    rich?: string[];
    plain?: string[];
    url?: string[];
    characterPayload?: string[];
}

/** Keyed by entity class name. JSON payload columns and lock lists are left alone. */
export const USER_CONTENT_FIELDS: Record<string, FieldRules> = {
    Comment: { rich: ["content"] },
    Spell: {
        rich: ["description"],
        plain: ["name", "school", "source", "castingTime", "range", "duration", "components", "damageDice",
            "damageType", "damageModifier", "damageScaling", "classes"],
        url: ["imageUrl"]
    },
    Item: {
        rich: ["description"],
        plain: ["name", "filterType", "rarity", "source", "category", "damage", "range", "properties", "mastery"],
        url: ["imageUrl"]
    },
    CharacterSpell: {
        rich: ["description"],
        plain: ["name", "school", "source", "viaFeature", "castingTime", "range", "duration", "components",
            "damageDice", "damageType", "damageModifier", "damageScaling"]
    },
    CharacterInventoryItem: {
        rich: ["description", "notes", "masteryDescription"],
        plain: ["name", "category", "damage", "damageType", "damageDie", "attackBonus", "range", "propertiesJson",
            "masteryName", "rarity", "grantedBy"],
        url: ["imageUrl"]
    },
    CharacterFeature: {
        rich: ["description"],
        plain: ["name", "source", "scaleValue", "limitedUse"]
    },
    SavedCharacter: { characterPayload: ["payload"] },
    User: { plain: ["firstName", "lastName", "username"], url: ["profilePicture"] }
};

/** Cleans the listed fields of one row in place. Returns whether anything changed. */
export function sanitizeUserContent(entityName: string, row: Record<string, unknown> | null | undefined): boolean {
    const rules = USER_CONTENT_FIELDS[entityName];
    if (!rules || !row || typeof row !== "object") return false;
    let changed = false;
    const apply = (fields: string[] | undefined, clean: (v: string) => string) => {
        for (const field of fields ?? []) {
            const value = row[field];
            if (typeof value !== "string") continue;
            const cleaned = clean(value);
            if (cleaned !== value) {
                row[field] = cleaned;
                changed = true;
            }
        }
    };
    apply(rules.rich, sanitizeRichText);
    apply(rules.plain, sanitizePlainText);
    apply(rules.url, sanitizeUrl);
    apply(rules.characterPayload, sanitizeCharacterPayload);
    return changed;
}
