/**
 * Cachebuster Init - Early Initialization
 * Runs before app initialization to set up cache busting
 */

(function() {
    const CACHEBUSTER_ENABLED_KEY = 'cachebuster_enabled';
    const CACHEBUSTER_VERSION_KEY = 'cachebuster_version';
    
    // Always generate a new version on page load to ensure fresh assets
    const version = Date.now().toString();
    localStorage.setItem(CACHEBUSTER_VERSION_KEY, version);
    
    // Check if enabled (default true)
    let enabled = localStorage.getItem(CACHEBUSTER_ENABLED_KEY);
    if (enabled === null) {
        localStorage.setItem(CACHEBUSTER_ENABLED_KEY, 'true');
        enabled = 'true';
    }
    
    // Store in window for later use
    window._cachebusterVersion = version;
    window._cachebusterEnabled = enabled === 'true';
    
    console.log(`[Cachebuster Init] ${enabled === 'true' ? 'enabled' : 'disabled'} (v${version.slice(-6)})`);
})();
