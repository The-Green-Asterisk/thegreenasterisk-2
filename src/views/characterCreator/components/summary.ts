import { CharacterCreatorContext } from "../controllers/context";

export function getNavBottom(): number {
    const siteNav = document.querySelector("#site-nav") as HTMLElement;
    if (!siteNav) return 0;
    const isHidden = siteNav.style.display === "none"
        || (typeof window !== "undefined" && window.getComputedStyle(siteNav).display === "none");
    if (isHidden) return 0;
    const navRect = siteNav.getBoundingClientRect();
    return Math.round(navRect.bottom || siteNav.offsetHeight || 70);
}

export function updateMulticlassBarPositions(ctx: CharacterCreatorContext): void {
    const bottomBar = document.getElementById("multiclass-bottom-bar");
    const topBar = document.getElementById("multiclass-top-bar");
    const panel = document.querySelector(".multiclass-step-panel") as HTMLElement;
    if (!panel) return;

    const panelRect = panel.getBoundingClientRect();
    const viewportHeight = typeof window !== "undefined" ? (window.innerHeight || document.documentElement.clientHeight || 800) : 800;

    if (bottomBar) {
        if (panelRect.bottom <= viewportHeight) {
            bottomBar.classList.add("docked");
            bottomBar.style.bottom = "";
        } else {
            bottomBar.classList.remove("docked");
            bottomBar.style.bottom = "0px";
        }
    }

    if (topBar) {
        const navBottom = ctx.getNavBottom();
        topBar.style.top = `${navBottom}px`;
    }

    const floatingBtn = document.getElementById("floating-scroll-bottom-btn");
    if (floatingBtn && typeof window !== "undefined") {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const scrollHeight = document.documentElement.scrollHeight || 1000;
        const isNearBottom = (viewportHeight + scrollY) >= (scrollHeight - 160);
        if (isNearBottom) {
            floatingBtn.classList.add("hidden");
        } else {
            floatingBtn.classList.remove("hidden");
        }
    }
}

export function updateMulticlassNavBars(ctx: CharacterCreatorContext): void {
    const topNavContainer = document.getElementById("multiclass-top-nav-buttons");
    const topBar = document.getElementById("multiclass-top-bar");
    const bottomNavContainer = document.getElementById("multiclass-bottom-nav");
    if (!bottomNavContainer || !Array.isArray(ctx.state.classes)) return;

    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const topBarHeight = topBar?.offsetHeight || 60;
    const navBottom = ctx.getNavBottom();
    const topThreshold = navBottom + topBarHeight;

    const aboveButtons: Array<{ idx: number; name: string }> = [];
    const belowButtons: Array<{ idx: number; name: string }> = [];

    const allZero = ctx.state.classes.every((_, i) => {
        const el = document.getElementById(`class-section-${i}`);
        if (!el) return true;
        const r = el.getBoundingClientRect();
        return r.top === 0 && r.bottom === 0;
    });

    ctx.state.classes.forEach((c, idx) => {
        const el = document.getElementById(`class-section-${idx}`);
        if (!el) return;
        const clsDef = ctx.classes.find((x) => x.id === c.classId);
        const name = clsDef?.name || c.classId;

        if (allZero) {
            if (idx > 0) {
                belowButtons.push({ idx, name });
            }
            return;
        }

        const rect = el.getBoundingClientRect();
        if (rect.bottom < topThreshold) {
            aboveButtons.push({ idx, name });
        } else if (rect.top > viewportHeight - 100) {
            belowButtons.push({ idx, name });
        }
    });

    if (topNavContainer && topBar) {
        if (aboveButtons.length > 0) {
            topBar.classList.remove("hidden");
            topNavContainer.innerHTML = aboveButtons.map((b) => `
                <button type="button" class="creator-btn nav-to-class-btn top-nav-btn" data-target-class="${b.idx}">
                    <i class="fa-solid fa-arrow-up"></i> ${b.name}
                </button>
            `).join("");
        } else {
            topBar.classList.add("hidden");
            topNavContainer.innerHTML = "";
        }
    }

    bottomNavContainer.innerHTML = belowButtons.map((b) => `
        <button type="button" class="creator-btn nav-to-class-btn bottom-nav-btn" data-target-class="${b.idx}">
            <i class="fa-solid fa-arrow-down"></i> ${b.name}
        </button>
    `).join("");

    const navButtons = document.querySelectorAll(".nav-to-class-btn[data-target-class]");
    navButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const targetIdx = Number((e.currentTarget as HTMLElement).getAttribute("data-target-class"));
            const targetEl = document.getElementById(`class-section-${targetIdx}`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

export function updateLiveSummary(ctx: CharacterCreatorContext): void {
    const nameEl = document.getElementById("summary-name");
    const metaEl = document.getElementById("summary-meta");
    const hpEl = document.getElementById("summary-hp");
    const acEl = document.getElementById("summary-ac");
    const initEl = document.getElementById("summary-init");
    const speedEl = document.getElementById("summary-speed");
    const avatarEl = document.getElementById("summary-avatar-img") as HTMLImageElement;

    const species = ctx.species.find((s) => s.id === ctx.state.speciesId)?.name || "Species";
    const cls = ctx.classes.find((c) => c.id === ctx.state.classId)?.name || "Class";

    if (nameEl) nameEl.textContent = ctx.state.name || "Unnamed Hero";
    if (metaEl) metaEl.textContent = `Level ${ctx.state.level} • ${species} • ${cls}`;
    if (hpEl) hpEl.textContent = String(ctx.getMaxHp());
    if (acEl) acEl.textContent = String(ctx.getArmorClass());
    if (initEl) {
        const initVal = ctx.getInitiative();
        initEl.textContent = (initVal >= 0 ? "+" : "") + initVal;
    }
    if (speedEl) speedEl.textContent = ctx.getSpeedDisplay();
    if (avatarEl) avatarEl.src = ctx.state.avatarUrl || "/storage/images/default-avatar.png";
}
