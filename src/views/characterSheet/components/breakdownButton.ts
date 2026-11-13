import { escapeHtml } from "@services/escape";
import { Breakdown, describeBreakdown } from "../services/breakdown";

const slug = (value: string) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * A number on the sheet that can show where it comes from. Hover, press and hold, or rest keyboard focus on it
 * (see breakdown.ctrl.ts); a click stays free for rolling. Screen readers get the breakdown as the button's
 * description, so they need no gesture.
 */
export function renderBreakdownButton(kind: string, key: string, display: string, label: string, breakdown: Breakdown): string {
    const id = `bd-${kind}-${slug(key)}`;
    return `<button type="button" class="stat-breakdown-btn" data-breakdown-kind="${escapeHtml(kind)}" data-breakdown-key="${escapeHtml(key)}" aria-label="${escapeHtml(label)}" aria-describedby="${id}">${escapeHtml(display)}</button><span class="stat-breakdown-desc" id="${id}">${escapeHtml(describeBreakdown(breakdown))}</span>`;
}
