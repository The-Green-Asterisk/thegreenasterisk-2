export function isFullscreenActive(): boolean {
    if (typeof document === "undefined") return false;
    const doc = document as any;
    return Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
    );
}

export async function toggleFullscreen(targetElement?: HTMLElement | null): Promise<void> {
    if (typeof document === "undefined") return;
    const doc = document as any;
    try {
        if (isFullscreenActive()) {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (doc.webkitExitFullscreen) {
                await doc.webkitExitFullscreen();
            } else if (doc.mozCancelFullScreen) {
                await doc.mozCancelFullScreen();
            } else if (doc.msExitFullscreen) {
                await doc.msExitFullscreen();
            }
        } else {
            const target: any = targetElement || document.documentElement;
            if (target.requestFullscreen) {
                await target.requestFullscreen();
            } else if (target.webkitRequestFullscreen) {
                await target.webkitRequestFullscreen();
            } else if (target.mozRequestFullScreen) {
                await target.mozRequestFullScreen();
            } else if (target.msRequestFullscreen) {
                await target.msRequestFullscreen();
            }
        }
    } catch (err) {
        console.warn("Fullscreen toggle failed or was denied:", err);
    }
}

export function syncFullscreenButtons(root: ParentNode) {
    const isFs = isFullscreenActive();
    const btns = root.querySelectorAll<HTMLButtonElement>(".sheet-fullscreen-btn");
    btns.forEach(btn => {
        btn.setAttribute("aria-pressed", isFs ? "true" : "false");
        btn.setAttribute("aria-label", isFs ? "Exit full screen" : "Enter full screen");
        btn.title = isFs ? "Exit full screen" : "Enter full screen";
        const icon = btn.querySelector("i");
        if (icon) {
            if (isFs) {
                icon.className = "fa-solid fa-compress";
            } else {
                icon.className = "fa-solid fa-expand";
            }
        }
    });
}

export function initFullscreenController(sheet: HTMLElement) {
    const update = () => {
        const isFs = isFullscreenActive();
        sheet.classList.toggle("is-fullscreen", isFs);
        if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.classList.toggle("sheet-is-fullscreen", isFs);
        }
        syncFullscreenButtons(sheet);
    };

    const handleBtnClick = async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleFullscreen(document.documentElement);
    };

    const btns = sheet.querySelectorAll<HTMLButtonElement>(".sheet-fullscreen-btn");
    btns.forEach(btn => {
        btn.addEventListener("click", handleBtnClick);
    });

    const onFullscreenChange = () => {
        update();
    };

    if (typeof document !== "undefined") {
        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("webkitfullscreenchange", onFullscreenChange);
        document.addEventListener("mozfullscreenchange", onFullscreenChange);
        document.addEventListener("MSFullscreenChange", onFullscreenChange);
    }

    // Initial sync
    update();

    return {
        update,
        destroy: () => {
            if (typeof document !== "undefined") {
                document.removeEventListener("fullscreenchange", onFullscreenChange);
                document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
                document.removeEventListener("mozfullscreenchange", onFullscreenChange);
                document.removeEventListener("MSFullscreenChange", onFullscreenChange);
            }
            btns.forEach(btn => btn.removeEventListener("click", handleBtnClick));
        }
    };
}
