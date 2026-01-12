/**
 * Main Module - Application Initialization & Orchestration
 * Entry point for the esel2go application
 */

import * as i18n from './i18n.js';
import * as cart from './cart.js';
import * as ui from './ui.js';
import * as footer from './footer.js';

/**
 * Initialize the entire application
 */
async function initializeApp() {
    try {
        // 1. Load translations
        console.log('Loading translations...');
        const translationsLoaded = await i18n.initializeI18n();
        if (!translationsLoaded) {
            console.error('Failed to load translations, continuing with defaults');
        }
        
        // 2. Load cart from localStorage
        console.log('Loading cart...');
        cart.loadCart();
        
        // 3. Initialize UI
        console.log('Initializing UI...');
        await ui.initializeUI();
        
        // 4. Initialize Footer
        console.log('Initializing Footer...');
        await footer.initializeFooter();
        
        console.log('✓ esel2go app initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
