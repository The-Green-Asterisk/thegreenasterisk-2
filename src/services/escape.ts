/**
 * Escapes a value for HTML text or a quoted attribute. Use it for plain text going into a template (names, labels,
 * sources); rich descriptions the server has already sanitized go in as they are.
 */
export function escapeHtml(value: unknown): string {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
