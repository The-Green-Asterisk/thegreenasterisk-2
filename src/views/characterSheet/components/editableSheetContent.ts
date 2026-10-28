import { CharacterData } from "../characterData";

type EditableField = {
    path: string;
    label: string;
    type: "text" | "number" | "checkbox";
    value: string | number | boolean;
};

function collectEditableFields(value: unknown, path = "", fields: EditableField[] = []): EditableField[] {
    if (value === null || value === undefined) {
        return fields;
    }

    if (typeof value === "string") {
        fields.push({ path, label: path || "value", type: "text", value });
        return fields;
    }
    if (typeof value === "number") {
        fields.push({ path, label: path || "value", type: "number", value });
        return fields;
    }
    if (typeof value === "boolean") {
        fields.push({ path, label: path || "value", type: "checkbox", value });
        return fields;
    }

    if (Array.isArray(value)) {
        value.forEach((entry, index) => {
            const entryPath = path ? `${path}[${index}]` : `[${index}]`;
            collectEditableFields(entry, entryPath, fields);
        });
        return fields;
    }

    if (typeof value === "object") {
        Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
            const entryPath = path ? `${path}.${key}` : key;
            collectEditableFields(entry, entryPath, fields);
        });
    }
    return fields;
}

export function renderEditableSheetContent(data: CharacterData): string {
    const fields = collectEditableFields(data)
        .filter(field => field.path !== "savedCharacterId")
        .sort((a, b) => a.path.localeCompare(b.path));

    const rows = fields.map(field => {
        const label = field.label
            .replace(/\.(\w+)/g, " › $1")
            .replace(/\[(\d+)\]/g, " #$1");

        if (field.type === "checkbox") {
            return `
                <label class="inline-edit-row checkbox-row">
                    <span class="inline-edit-label">${label}</span>
                    <input type="checkbox" class="inline-edit-input" data-field-path="${field.path}" ${field.value ? "checked" : ""} />
                </label>
            `;
        }

        const asText = String(field.value ?? "");
        const isLongText = field.type === "text" && (asText.length > 120 || asText.includes("\n"));
        return `
            <label class="inline-edit-row">
                <span class="inline-edit-label">${label}</span>
                ${isLongText
                ? `<textarea class="inline-edit-input inline-edit-textarea" data-field-path="${field.path}">${asText}</textarea>`
                : `<input type="${field.type}" class="inline-edit-input" data-field-path="${field.path}" value="${asText.replace(/"/g, '&quot;')}" />`}
            </label>
        `;
    }).join("");

    return `
        <section class="sheet-edit-mode">
            <div class="sheet-edit-mode-header">
                <h3><i class="fa-solid fa-pen-to-square"></i> Edit Character Fields</h3>
                <p>All text and numeric fields are editable below. Click <strong>Done Editing</strong> when finished.</p>
            </div>
            <div class="inline-edit-grid">
                ${rows}
            </div>
        </section>
    `;
}
