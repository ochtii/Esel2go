/**
 * i18n Module - Internationalization & Language Management
 * Handles translation switching between German and English
 */

let currentLanguage = 'de';
let translations = {};

/**
 * Initialize translations from the data file
 */
export async function initializeI18n() {
    try {
        const version = window._cachebusterVersion || Date.now();
        const response = await fetch(`./data/translations.json?v=${version}`);
        translations = await response.json();
        
        // Check for saved language preference
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && translations[savedLanguage]) {
            currentLanguage = savedLanguage;
        }
        
        return true;
    } catch (error) {
        console.error('Failed to load translations:', error);
        return false;
    }
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Set current language
 */
export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        return true;
    }
    return false;
}

/**
 * Translate a key
 * @param {string} key - The translation key (e.g., 'appTitle')
 * @param {*} fallback - Fallback value if key not found
 * @returns {string} Translated string or fallback
 */
export function t(key, fallback = key) {
    const lang = translations[currentLanguage];
    if (!lang) return fallback;
    return lang[key] || fallback;
}

/**
 * Get all translations for current language
 */
export function getTranslations() {
    return translations[currentLanguage] || {};
}

/**
 * Get available languages
 */
export function getAvailableLanguages() {
    return Object.keys(translations);
}
