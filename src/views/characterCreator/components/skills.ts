import { escapeHtml } from "@services/escape";
import { ALL_SKILLS } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";
import {
    SkillSource,
    canAddPick,
    getClassSkillMatch,
    getClassSkillSources,
    getExpertiseMatch,
    getExpertiseSources,
    getGrantedExpertiseSkills,
    getFeatSkillSections,
    getGrantedSkills,
    getProficientSkills,
    getUnmetProgressionExpertise
} from "../services/skillRules";

interface CardOptions {
    cardClass: string;
    name: string;
    stat: string;
    checked: boolean;
    locked?: boolean;
    disabled?: boolean;
    badge: string;
    title?: string;
    attrs?: string;
}

function renderCard(o: CardOptions): string {
    const inert = o.locked || o.disabled;
    return `
        <div class="skill-checkbox-card ${o.cardClass} ${o.checked ? "selected" : ""} ${o.locked ? "locked" : ""} ${o.disabled ? "disabled" : ""}"
             role="checkbox" tabindex="${inert ? "-1" : "0"}" aria-checked="${o.checked}"${inert ? ' aria-disabled="true"' : ""}
             data-skill-name="${escapeHtml(o.name)}"${o.attrs ? ` ${o.attrs}` : ""}${o.title ? ` title="${o.title}"` : ""}>
            <div class="skill-info">
                <span class="card-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                <span class="skill-name">${escapeHtml(o.name)}</span>
                <span class="sr-only"> (${o.stat})${o.badge && o.badge !== o.stat ? `, ${escapeHtml(o.badge)}` : ""}</span>
            </div>
            <span class="skill-stat-badge" aria-hidden="true">${escapeHtml(o.badge)}</span>
        </div>
    `;
}

function sourceCounts(sources: SkillSource[], assigned: Map<string, string>): string {
    return sources.map((s) => {
        const used = Array.from(assigned.values()).filter((k) => k === s.key).length;
        return `<span class="spell-count-badge ${used === s.count ? "maxed" : "info"}">${escapeHtml(s.label)} ${used}/${s.count}</span>`;
    }).join(" ");
}

export function renderStep6Skills(ctx: CharacterCreatorContext): string {
    ctx.sanitizeSkillSelections();
    const granted = getGrantedSkills(ctx);
    const classSources = getClassSkillSources(ctx);
    const classMatch = getClassSkillMatch(ctx);
    const featSections = getFeatSkillSections(ctx);
    const featPicks = new Map<string, string>();
    for (const sec of featSections) {
        for (const s of ctx.state.featSkillChoices?.[sec.key] || []) {
            if (sec.mode === "proficiency") featPicks.set(s, sec.label);
        }
    }
    const sourceLabel = new Map(classSources.map((s) => [s.key, s.label.replace(" (multiclass)", "")]));
    const maxClassCount = classSources.reduce((sum, s) => sum + s.count, 0);
    const classOver = classMatch.unassigned.length > 0;

    const expertiseSources = getExpertiseSources(ctx);
    const expertiseMatch = getExpertiseMatch(ctx);
    const featExpertise = getGrantedExpertiseSkills(ctx);
    const proficient = getProficientSkills(ctx);
    const unmetExpertise = getUnmetProgressionExpertise(ctx);

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Skills & Proficiencies</h3>
                <p class="panel-desc">Choose ${maxClassCount} skills from your class list${classSources.length > 1 ? "s; each class's picks come from its own list" : ""}. Background and species skills are granted automatically.</p>
            </div>

            <div class="box-header-with-badge" style="margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.4rem; justify-content: flex-start;">
                ${sourceCounts(classSources, classMatch.assigned)}
                ${classOver ? `<span class="spell-count-badge over-limit"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ${classMatch.unassigned.join(", ")}: no class skill choice left</span>` : ""}
            </div>

            <div class="skills-select-grid" role="group" aria-label="Class skills">
                ${ALL_SKILLS.map((sk) => {
                    const grantedBy = granted.get(sk.name) || featPicks.get(sk.name);
                    if (grantedBy) {
                        return renderCard({ cardClass: "class-skill-card", name: sk.name, stat: sk.stat.toUpperCase(), checked: true, locked: true, badge: grantedBy.replace(/ \(.*\)$/, "") });
                    }
                    const isPicked = ctx.state.classSkills.includes(sk.name);
                    const assignedTo = classMatch.assigned.get(sk.name);
                    const canAdd = !isPicked && canAddPick(ctx.state.classSkills, sk.name, classSources);
                    return renderCard({
                        cardClass: "class-skill-card",
                        name: sk.name,
                        stat: sk.stat.toUpperCase(),
                        checked: isPicked,
                        disabled: !isPicked && !canAdd,
                        badge: isPicked ? (assignedTo ? sourceLabel.get(assignedTo) || sk.stat.toUpperCase() : "Over limit") : sk.stat.toUpperCase(),
                        title: !isPicked && !canAdd ? "Not available: no class skill choice left that can take this skill" : undefined
                    });
                }).join("")}
            </div>

            ${featSections.map((sec) => {
                const chosen = ctx.state.featSkillChoices?.[sec.key] || [];
                const options = sec.from || ALL_SKILLS.map((s) => s.name);
                return `
                    <div class="creator-detail-box" style="margin-top: 1.5rem;">
                        <div class="box-header-with-badge">
                            <h4>${escapeHtml(sec.label)}</h4>
                            <span class="spell-count-badge ${chosen.length === sec.count ? "maxed" : "info"}">${chosen.length} / ${sec.count} Chosen</span>
                        </div>
                        <p class="card-body">${sec.mode === "proficiency-or-expertise"
                            ? "Gain proficiency in one of these skills, or Expertise if you're already proficient."
                            : sec.count > 1 ? `Gain proficiency in ${sec.count} skills of your choice. (The feat also allows tools; choose fewer skills here for each tool.)` : "Gain proficiency in one skill of your choice."}</p>
                        <div class="skills-select-grid" role="group" aria-label="${escapeHtml(sec.label)} skills">
                            ${options.map((name) => {
                                const sk = ALL_SKILLS.find((s) => s.name === name)!;
                                const isChosen = chosen.includes(name);
                                const alreadyHave = sec.mode === "proficiency" && !isChosen &&
                                    (granted.has(name) || ctx.state.classSkills.includes(name) || (featPicks.has(name) && featPicks.get(name) !== sec.label));
                                const full = !isChosen && chosen.length >= sec.count && sec.count > 1;
                                return renderCard({
                                    cardClass: "feat-skill-card",
                                    name,
                                    stat: sk.stat.toUpperCase(),
                                    checked: isChosen,
                                    disabled: alreadyHave || full,
                                    badge: isChosen && featExpertise.has(name) ? "Expertise" : alreadyHave ? "Proficient" : sk.stat.toUpperCase(),
                                    title: alreadyHave ? "Already proficient" : undefined,
                                    attrs: `data-feat-section="${sec.key}"`
                                });
                            }).join("")}
                        </div>
                    </div>
                `;
            }).join("")}

            ${expertiseSources.length > 0 || featExpertise.size > 0 || unmetExpertise.length > 0 ? `
                <div class="creator-detail-box" style="margin-top: 1.5rem;">
                    <div class="box-header-with-badge" style="flex-wrap: wrap; gap: 0.4rem;">
                        <h4><i class="fa-solid fa-star" aria-hidden="true"></i> Expertise</h4>
                        <span>${sourceCounts(expertiseSources, expertiseMatch.assigned)}</span>
                    </div>
                    <p class="card-body">Your Proficiency Bonus is doubled for ability checks with the chosen skills.${unmetExpertise.map((u) => ` ${escapeHtml(u.source)} gives Expertise in ${escapeHtml(u.skill)} only once you're proficient in it.`).join("")}</p>
                    <div class="skills-select-grid" role="group" aria-label="Expertise">
                        ${ALL_SKILLS.filter((sk) => proficient.has(sk.name)).map((sk) => {
                            const fromFeat = featExpertise.get(sk.name);
                            if (fromFeat) {
                                return renderCard({ cardClass: "expertise-skill-card", name: sk.name, stat: sk.stat.toUpperCase(), checked: true, locked: true, badge: fromFeat });
                            }
                            const isExpert = ctx.state.expertiseSkills.includes(sk.name);
                            const assignedTo = expertiseMatch.assigned.get(sk.name);
                            const canAdd = !isExpert && canAddPick(ctx.state.expertiseSkills, sk.name, expertiseSources);
                            const label = expertiseSources.find((s) => s.key === assignedTo)?.label;
                            return renderCard({
                                cardClass: "expertise-skill-card",
                                name: sk.name,
                                stat: sk.stat.toUpperCase(),
                                checked: isExpert,
                                disabled: !isExpert && !canAdd,
                                badge: isExpert ? (label || "Over limit") : sk.stat.toUpperCase()
                            });
                        }).join("")}
                    </div>
                </div>
            ` : ""}
        </div>
    `;
}
