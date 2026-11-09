import { ALL_SKILLS } from "../characterCreator.types";
import { CharacterCreatorContext } from "../controllers/context";

export function renderStep6Skills(ctx: CharacterCreatorContext): string {
    const cls = ctx.classes.find((c) => c.id === ctx.state.classId) || ctx.classes[0];
    const bg = ctx.backgrounds.find((b) => b.id === ctx.state.backgroundId) || ctx.backgrounds[0];
    const bgSkills = bg?.skills || [];
    const classAllowed = ctx.getAllowedClassSkills();
    const maxClassCount = ctx.getMaxClassSkillCount();

    return `
        <div class="step-panel active">
            <div class="panel-header">
                <h3 class="panel-title">Skills & Proficiencies</h3>
                <p class="panel-desc">Choose ${maxClassCount} skills from your class list(s). Background skills are granted automatically.</p>
            </div>

            <div class="skills-select-grid">
                ${ALL_SKILLS.map((sk) => {
                    const isBgSkill = bgSkills.includes(sk.name);
                    const isHumanExtra = ctx.state.speciesId === "human" && ctx.state.humanExtraSkill === sk.name;
                    const isElfKeen = ctx.state.speciesId === "elf" && (ctx.state.elfKeenSkill || "Perception") === sk.name;
                    const isClassSkill = ctx.state.classSkills.includes(sk.name);
                    const isAllowedByClass = classAllowed.includes(sk.name);
                    const isSelected = isBgSkill || isHumanExtra || isElfKeen || isClassSkill;
                    const isLocked = isBgSkill || isHumanExtra || isElfKeen;

                    return `
                        <div class="skill-checkbox-card ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}" data-skill-name="${sk.name}" data-allowed="${isAllowedByClass}">
                            <div class="skill-info">
                                <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                <span class="skill-name">${sk.name}</span>
                            </div>
                            <span class="skill-stat-badge">
                                ${isBgSkill ? "Background" : isHumanExtra ? "Human" : isElfKeen ? "Elf" : sk.stat.toUpperCase()}
                            </span>
                        </div>
                    `;
                }).join("")}
            </div>

            ${ctx.getMaxExpertiseCount() > 0 ? `
                <div class="creator-detail-box" style="margin-top: 1.5rem;">
                    <h4><i class="fa-solid fa-star"></i> Expertise (Choose up to ${ctx.getMaxExpertiseCount()})</h4>
                    <p class="card-body">Your proficiency bonus is doubled for any ability check you make that uses the chosen proficiencies.</p>
                    <div class="skills-select-grid">
                        ${ALL_SKILLS.filter((sk) => {
                            const isBgSkill = bgSkills.includes(sk.name);
                            const isHumanExtra = ctx.state.speciesId === "human" && ctx.state.humanExtraSkill === sk.name;
                            const isElfKeen = ctx.state.speciesId === "elf" && (ctx.state.elfKeenSkill || "Perception") === sk.name;
                            const isClassSkill = ctx.state.classSkills.includes(sk.name);
                            return isBgSkill || isHumanExtra || isElfKeen || isClassSkill;
                        }).map((sk) => {
                            const isExpert = ctx.state.expertiseSkills.includes(sk.name);
                            return `
                                <div class="skill-checkbox-card expertise-skill-card ${isExpert ? "selected" : ""}" data-skill-name="${sk.name}">
                                    <div class="skill-info">
                                        <span class="card-check"><i class="fa-solid fa-check"></i></span>
                                        <span class="skill-name">${sk.name}</span>
                                    </div>
                                    <span class="skill-stat-badge">${sk.stat.toUpperCase()}</span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            ` : ""}
        </div>
    `;
}
