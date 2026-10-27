import el from "@elements";
import { getData } from "@services/request";
import { currentTheme, followSystemTheme, setTheme, Theme } from "@services/theme";

let navGlobalListenersBound = false;
let lastTouchTapTs = 0;
let lastTouchX = 0;
let lastTouchY = 0;

function isTouchPrimaryInput(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches
        || navigator.maxTouchPoints > 0
        || 'ontouchstart' in window;
}

function hasOpenOverlayModal(): boolean {
    return !!document.querySelector('.spell-modal-backdrop.visible:not(.hidden)');
}

function getNavBarHeight(nav: HTMLElement): number {
    const menu = nav.querySelector('ul');
    // If the mobile menu is open, close it before measuring so body padding
    // matches the fixed top bar height rather than the expanded dropdown.
    menu?.classList.remove('show');
    return Math.ceil(nav.getBoundingClientRect().height || nav.offsetHeight || 0);
}

function ensureNavRevealAsteriskButton(): HTMLButtonElement | null {
    if (typeof document === 'undefined') return null;

    let revealBtn = document.getElementById('nav-reveal-asterisk') as HTMLButtonElement | null;
    if (!revealBtn) {
        revealBtn = document.createElement('button');
        revealBtn.id = 'nav-reveal-asterisk';
        revealBtn.className = 'nav-reveal-asterisk';
        revealBtn.setAttribute('aria-label', 'Show navigation');
        revealBtn.title = 'Show navigation';
        revealBtn.innerHTML = '<img src="/storage/images/BIG-AS.png" alt="" aria-hidden="true" />';
        document.body.appendChild(revealBtn);
    }

    return revealBtn;
}

function syncNavRevealAsterisk() {
    const revealBtn = ensureNavRevealAsteriskButton();
    const nav = el.nav;
    if (!revealBtn || !nav) return;

    const navHidden = nav.style.display === 'none' || window.getComputedStyle(nav).display === 'none';
    revealBtn.classList.toggle('is-visible', navHidden && isTouchPrimaryInput());
}

function toggleNavVisibilityGlobal() {
    const nav = el.nav;
    if (!nav) return;
    const isHidden = nav.style.display === 'none' || window.getComputedStyle(nav).display === 'none';
    nav.style.display = isHidden ? '' : 'none';
    el.body.style.paddingTop = isHidden ? `${getNavBarHeight(nav)}px` : '0px';
    syncNavRevealAsterisk();
}

function bindGlobalNavToggleListeners() {
    if (navGlobalListenersBound) return;
    navGlobalListenersBound = true;

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (hasOpenOverlayModal()) return;
        toggleNavVisibilityGlobal();
    }, { signal: el.signal });

    document.addEventListener('touchend', (e) => {
        if (hasOpenOverlayModal()) return;
        const touch = e.changedTouches?.[0];
        if (!touch) return;

        const now = Date.now();
        const delta = now - lastTouchTapTs;
        const nearTop = touch.clientY <= 120;
        const nearLastTap = Math.abs(touch.clientX - lastTouchX) <= 40 && Math.abs(touch.clientY - lastTouchY) <= 40;

        if (nearTop && delta > 0 && delta < 320 && nearLastTap) {
            toggleNavVisibilityGlobal();
            lastTouchTapTs = 0;
            return;
        }

        lastTouchTapTs = now;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
    }, { passive: true, signal: el.signal });

    window.addEventListener('resize', () => {
        syncNavRevealAsterisk();
    }, { signal: el.signal });
}

export default function nav(showNav: boolean = true) {
    bindGlobalNavToggleListeners();

    if (!showNav && el.nav) {
        el.nav.style.display = "none";
        el.body.style.paddingTop = `0px`;
        syncNavRevealAsterisk();
        return;
    }
    const discordLoginButton = el.buttons?.id('discord_login');
    if (discordLoginButton)
        discordLoginButton.addEventListener('click', async () => {
            if (el.isAuth) {
                window.location.href = '/logout';
            } else {
                type DiscordCreds = { client_id: string, redirect_url: string, scope: string };
                const originatingUrl = location.pathname;
                const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const { client_id, redirect_url, scope } = await getData<DiscordCreds>('/get-discord-creds', { state, originatingUrl });
                window.location.href = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(client_id)}&response_type=code&redirect_uri=${encodeURIComponent(redirect_url)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
            }
        }, { signal: el.signal });

    const themeToggle = el.buttons?.id('theme-toggle');
    if (themeToggle) {
        // Replaced rather than re-classed: the Font Awesome kit may have swapped the <i> for an <svg>
        const showTheme = (theme: Theme) => {
            themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            themeToggle.innerHTML = `<i class="fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
        };
        themeToggle.addEventListener('click', () => {
            setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
            showTheme(currentTheme());
        }, { signal: el.signal });
        followSystemTheme(showTheme);
    }

    const menuButton = el.divs?.id('menu')
    if (menuButton)
        menuButton.addEventListener('click', () => {
            const menu = menuButton.querySelector('ul');
            if (menu) {
                menu.classList.contains('show') ? menu.classList.remove('show') : menu.classList.add('show');
            }
            document.body.addEventListener('click', (event) => {
                if (event.target !== menuButton && !menuButton.contains(event.target as Node)) {
                    const menu = menuButton.querySelector('ul');
                    if (menu) {
                        menu.classList.remove('show');
                    }
                }
            }, { signal: el.signal });
        }, { signal: el.signal });

    const navHeight = el.nav ? getNavBarHeight(el.nav) : 0;
    el.body.style.paddingTop = `${navHeight}px`;

    const revealBtn = ensureNavRevealAsteriskButton();
    revealBtn?.addEventListener('click', () => {
        const nav = el.nav;
        if (!nav) return;
        const isHidden = nav.style.display === 'none' || window.getComputedStyle(nav).display === 'none';
        if (!isHidden) return;
        nav.style.display = '';
        el.body.style.paddingTop = `${getNavBarHeight(nav)}px`;
        syncNavRevealAsterisk();
    }, { signal: el.signal });

    syncNavRevealAsterisk();
}