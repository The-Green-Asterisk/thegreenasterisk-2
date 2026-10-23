export type Theme = 'light' | 'dark';

const systemDark = matchMedia('(prefers-color-scheme: dark)');

/**
 * The theme picked with the nav toggle, or null to follow the device.
 * index.html applies it before first paint; this keeps it in sync after.
 */
export function savedTheme(): Theme | null {
    try {
        const theme = localStorage.getItem('theme');
        return theme === 'light' || theme === 'dark' ? theme : null;
    } catch {
        return null;
    }
}

export function currentTheme(): Theme {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem('theme', theme);
    } catch { }
}

/** Follows the device's light/dark setting until a theme is picked. */
export function followSystemTheme(onChange: (theme: Theme) => void) {
    systemDark.addEventListener('change', event => {
        if (savedTheme()) return;
        document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
        onChange(currentTheme());
    });
}
