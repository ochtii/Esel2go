/**
 * Theme Module - Theme Management & Switching
 * Handles light, dark, and esel-oida themes
 */

const THEMES = {
    'light': {
        name: 'Light',
        colors: {
            primary: '#0ea5e9',      // Sky Blue
            primaryDark: '#0284c7',
            accent: '#f97316',       // Orange
            text: '#1f2937',         // Dark Gray
            textLight: '#6b7280',    // Medium Gray
            bg: '#ffffff',           // White
            bgSecondary: '#f9fafb',  // Light Gray
            border: '#e5e7eb',       // Border Gray
        }
    },
    'dark': {
        name: 'Dark',
        colors: {
            primary: '#06b6d4',      // Cyan
            primaryDark: '#0891b2',
            accent: '#84cc16',       // Lime
            text: '#f3f4f6',         // Light Gray
            textLight: '#d1d5db',    // Medium Light Gray
            bg: '#0f172a',           // Dark Slate
            bgSecondary: '#1e293b',  // Dark Gray
            border: '#334155',       // Dark Border
        }
    },
    'esel-oida': {
        name: 'Esel Oida',
        colors: {
            primary: '#f97316',      // Burnt Orange
            primaryDark: '#ea580c',
            accent: '#7c2d12',       // Deep Burgundy
            text: '#44280c',         // Rustic Brown
            textLight: '#78350f',    // Medium Brown
            bg: '#fef3c7',           // Cream
            bgSecondary: '#fcd34d',  // Golden
            border: '#d97706',       // Dark Orange
        }
    }
};

let currentTheme = 'light';

/**
 * Initialize theme from localStorage
 */
export function initializeTheme() {
    const savedTheme = localStorage.getItem('esel2go-theme');
    if (savedTheme && THEMES[savedTheme]) {
        currentTheme = savedTheme;
    }
    applyTheme(currentTheme);
    return currentTheme;
}

/**
 * Apply theme to document
 */
function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return false;
    
    currentTheme = themeName;
    localStorage.setItem('esel2go-theme', themeName);
    
    // Set CSS variables for Tailwind/Custom CSS
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-primary-dark', theme.colors.primaryDark);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-light', theme.colors.textLight);
    root.style.setProperty('--theme-bg', theme.colors.bg);
    root.style.setProperty('--theme-bg-secondary', theme.colors.bgSecondary);
    root.style.setProperty('--theme-border', theme.colors.border);
    
    // Add theme class to body for CSS selectors
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark', 'theme-esel-oida');
    body.classList.add(`theme-${themeName}`);
    
    console.log('Theme applied:', themeName);
    return true;
}

/**
 * Set current theme
 */
export function setTheme(themeName) {
    if (THEMES[themeName]) {
        applyTheme(themeName);
        return true;
    }
    return false;
}

/**
 * Get current theme name
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Get all available themes
 */
export function getAvailableThemes() {
    return Object.keys(THEMES);
}

/**
 * Get theme display names
 */
export function getThemeNames() {
    const names = {};
    Object.keys(THEMES).forEach(key => {
        names[key] = THEMES[key].name;
    });
    return names;
}

/**
 * Get theme colors
 */
export function getThemeColors(themeName = currentTheme) {
    const theme = THEMES[themeName];
    return theme ? theme.colors : null;
}

/**
 * Cycle through themes
 */
export function cycleTheme() {
    const themes = getAvailableThemes();
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    return themes[nextIndex];
}
