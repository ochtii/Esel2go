/**
 * Cache Buster Module - Manages cache busting for static assets
 * Auto-clears browser cache, Service Workers, and adds query parameters to assets
 */

const CACHEBUSTER_ENABLED_KEY = 'cachebuster_enabled';
const CACHEBUSTER_VERSION_KEY = 'cachebuster_version';

// Initialize with timestamp on first load
function getVersion() {
    let version = localStorage.getItem(CACHEBUSTER_VERSION_KEY);
    if (!version) {
        version = Date.now().toString();
        localStorage.setItem(CACHEBUSTER_VERSION_KEY, version);
    }
    return version;
}

/**
 * Check if cachebuster is enabled
 */
export function isCachebuserEnabled() {
    const stored = localStorage.getItem(CACHEBUSTER_ENABLED_KEY);
    // Default to enabled
    if (stored === null) {
        localStorage.setItem(CACHEBUSTER_ENABLED_KEY, 'true');
        return true;
    }
    return stored === 'true';
}

/**
 * Toggle cachebuster on/off
 */
export function toggleCachebuster() {
    const current = isCachebuserEnabled();
    localStorage.setItem(CACHEBUSTER_ENABLED_KEY, String(!current));
    return !current;
}

/**
 * Force refresh cache by updating version
 */
export function forceRefresh() {
    const newVersion = Date.now().toString();
    localStorage.setItem(CACHEBUSTER_VERSION_KEY, newVersion);
    return newVersion;
}

/**
 * Get asset URL with cache-busting query parameter
 */
export function getCacheBustedUrl(url) {
    if (!isCachebuserEnabled()) {
        return url;
    }
    
    const version = getVersion();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${version}`;
}

/**
 * Clear all caches and service workers
 */
export async function clearAllCaches() {
    try {
        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log('Clearing caches:', cacheNames);
            
            for (const cacheName of cacheNames) {
                await caches.delete(cacheName);
                console.log(`Cleared cache: ${cacheName}`);
            }
        }
        
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('Unregistering service workers:', registrations.length);
            
            for (const registration of registrations) {
                await registration.unregister();
                console.log('Unregistered service worker');
            }
        }
        
        console.log('✓ All caches and service workers cleared');
    } catch (error) {
        console.error('Error clearing caches:', error);
    }
}

/**
 * Initialize cachebuster - clear caches on startup
 */
export async function initializeCachebuster() {
    console.log('Initializing cachebuster...');
    
    // Check if this is a new page load (not from cache)
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD ||
        performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD) {
        console.log('Page reload detected - clearing caches');
        await clearAllCaches();
    }
    
    // Force refresh version on every load
    if (isCachebuserEnabled()) {
        forceRefresh();
        console.log('✓ Cachebuster enabled with forced refresh');
    } else {
        console.log('Cachebuster disabled');
    }
}

/**
 * Get cache status for UI display
 */
export function getCacheStatus() {
    return {
        enabled: isCachebuserEnabled(),
        version: getVersion(),
        message: isCachebuserEnabled() 
            ? `Cachebuster aktiv (v${getVersion().slice(-6)})`
            : 'Cachebuster deaktiviert'
    };
}
