/**
 * Footer Module - Display last update timestamp
 * Loads the actual last commit datetime from build-info.json
 */

/**
 * Format ISO date to human-readable format (Vienna timezone)
 */
function formatDate(isoString) {
    try {
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Vienna',
            timeZoneName: 'short'
        };
        return new Intl.DateTimeFormat('de-AT', options).format(date);
    } catch (error) {
        console.warn('Date formatting error:', error);
        return isoString;
    }
}

/**
 * Fetch build info with last commit timestamp
 */
async function fetchBuildInfo() {
    try {
        const version = Date.now();
        console.log('Loading build-info.json from: ./build-info.json');
        const response = await fetch(`./build-info.json?v=${version}`);
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        console.log('Build info data:', data);
        
        if (data.lastCommit) {
            console.log('✓ Build info loaded with commit time:', data.lastCommit);
            return formatDate(data.lastCommit);
        }
    } catch (error) {
        console.error('Failed to load build-info.json:', error.message, error);
    }
    
    return null;
}

/**
 * Fetch from GitHub API as secondary source
 */
async function fetchGitHubCommitTime() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(
            'https://api.github.com/repos/ochtii/Esel2go/commits?per_page=1',
            { 
                signal: controller.signal,
                cache: 'no-cache'
            }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`GitHub API ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0 && data[0].commit?.committer?.date) {
            console.log('✓ GitHub API loaded commit time:', data[0].commit.committer.date);
            return formatDate(data[0].commit.committer.date);
        }
    } catch (error) {
        console.log('GitHub API unavailable:', error.message);
    }
    
    return null;
}

/**
 * Initialize footer with last commit timestamp
 */
export async function initializeFooter() {
    const timestampElement = document.getElementById('updateTimestamp');
    
    if (!timestampElement) {
        console.warn('Update timestamp element not found');
        return;
    }
    
    // Try to load from build-info.json (most reliable)
    console.log('Fetching last commit timestamp...');
    let timestamp = await fetchBuildInfo();
    
    // If build-info fails, try GitHub API
    if (!timestamp) {
        console.log('build-info.json not found, trying GitHub API...');
        timestamp = await fetchGitHubCommitTime();
    }
    
    // Show result
    if (timestamp) {
        timestampElement.textContent = timestamp;
        console.log('✓ Footer timestamp displayed:', timestamp);
    } else {
        timestampElement.textContent = '(Datum nicht verfügbar)';
        console.warn('⚠ Could not fetch last commit time');
    }
    
    // Initialize Cache-Buster Status Modal
    initializeCachebusterStatus();
}

/**
 * Initialize Cache-Buster Status Modal
 */
function initializeCachebusterStatus() {
    const statusBtn = document.getElementById('cachebusterStatusBtn');
    const modal = document.getElementById('cachebusterModal');
    const closeBtn = document.getElementById('closeCachebusterModal');
    
    if (!statusBtn || !modal || !closeBtn) return;
    
    // Open modal
    statusBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        loadCachebusterStatus();
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

/**
 * Load and display Cache-Buster Status
 */
async function loadCachebusterStatus() {
    const content = document.getElementById('cachebusterStatusContent');
    if (!content) return;
    
    const version = window._cachebusterVersion || 'N/A';
    const enabled = localStorage.getItem('cachebuster_enabled') !== 'false';
    
    // Collect all loaded resources
    const resources = collectLoadedResources();
    
    const html = `
        <div class="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 mb-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="bg-orange-500 text-white p-3 rounded-lg">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-800">Cache-Buster ${enabled ? 'Aktiv' : 'Deaktiviert'}</h3>
                    <p class="text-sm text-gray-600">Version: ${version}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-orange-600">${resources.total}</div>
                    <div class="text-xs text-gray-500">Geladene Dateien</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-green-600">${resources.withCachebuster}</div>
                    <div class="text-xs text-gray-500">Mit Cache-Buster</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-blue-600">${resources.json}</div>
                    <div class="text-xs text-gray-500">JSON Dateien</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center">
                    <div class="text-2xl font-bold text-purple-600">${resources.scripts}</div>
                    <div class="text-xs text-gray-500">JavaScript</div>
                </div>
            </div>
        </div>
        
        <div class="space-y-4">
            <h4 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Geladene Ressourcen
            </h4>
            ${generateResourceTable(resources.list)}
        </div>
        
        <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Cache-Buster Info
            </h4>
            <p class="text-sm text-gray-600">
                Der Cache-Buster fügt automatisch Versions-Parameter zu allen Ressourcen hinzu, 
                um sicherzustellen, dass Browser immer die neueste Version laden. 
                Version wird bei jedem Deployment aktualisiert.
            </p>
        </div>
    `;
    
    content.innerHTML = html;
}

/**
 * Collect information about loaded resources
 */
function collectLoadedResources() {
    const resources = {
        total: 0,
        withCachebuster: 0,
        json: 0,
        scripts: 0,
        css: 0,
        list: []
    };
    
    // Get all script tags
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.src;
        const hasCachebuster = src.includes('?v=');
        resources.total++;
        resources.scripts++;
        if (hasCachebuster) resources.withCachebuster++;
        
        resources.list.push({
            type: 'JavaScript',
            url: src,
            cachebuster: hasCachebuster,
            version: hasCachebuster ? extractVersion(src) : 'N/A'
        });
    });
    
    // Get all stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.href;
        const hasCachebuster = href.includes('?v=');
        resources.total++;
        resources.css++;
        if (hasCachebuster) resources.withCachebuster++;
        
        resources.list.push({
            type: 'CSS',
            url: href,
            cachebuster: hasCachebuster,
            version: hasCachebuster ? extractVersion(href) : 'N/A'
        });
    });
    
    // Track known JSON files (from API calls)
    const knownJsonFiles = [
        { name: 'products.json', loaded: true },
        { name: 'categories.json', loaded: true },
        { name: 'translations.json', loaded: true },
        { name: 'build-info.json', loaded: true }
    ];
    
    knownJsonFiles.forEach(file => {
        resources.total++;
        resources.json++;
        resources.withCachebuster++;
        
        resources.list.push({
            type: 'JSON Data',
            url: `data/${file.name}`,
            cachebuster: true,
            version: window._cachebusterVersion || 'Dynamic'
        });
    });
    
    return resources;
}

/**
 * Extract version from URL
 */
function extractVersion(url) {
    const match = url.match(/[?&]v=([^&]+)/);
    if (match) {
        const version = match[1];
        // If it's a timestamp, convert to readable date
        if (/^\d{13}$/.test(version)) {
            const date = new Date(parseInt(version));
            return date.toLocaleString('de-AT', { 
                timeZone: 'Europe/Vienna',
                dateStyle: 'short',
                timeStyle: 'short'
            });
        }
        return version;
    }
    return 'N/A';
}

/**
 * Generate resource table HTML
 */
function generateResourceTable(resources) {
    if (resources.length === 0) {
        return '<p class="text-gray-500 text-sm">Keine Ressourcen gefunden</p>';
    }
    
    const rows = resources.map((resource, index) => {
        const statusIcon = resource.cachebuster 
            ? '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
            : '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
        
        const typeColor = {
            'JavaScript': 'bg-yellow-100 text-yellow-700',
            'CSS': 'bg-blue-100 text-blue-700',
            'JSON Data': 'bg-green-100 text-green-700'
        }[resource.type] || 'bg-gray-100 text-gray-700';
        
        // Extract filename from URL
        const filename = resource.url.split('/').pop().split('?')[0];
        
        return `
            <div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition">
                <div class="flex-shrink-0">${statusIcon}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs px-2 py-1 ${typeColor} rounded-full font-semibold">${resource.type}</span>
                        <span class="text-sm font-medium text-gray-800 truncate">${filename}</span>
                    </div>
                    <div class="text-xs text-gray-500 flex items-center gap-2">
                        <span class="font-mono ${resource.cachebuster ? 'text-green-600' : 'text-red-600'}">
                            ${resource.cachebuster ? '✓ Cache-Buster' : '✗ Kein Cache-Buster'}
                        </span>
                        ${resource.cachebuster ? `<span class="text-gray-400">|</span><span>v${resource.version}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    return `<div class="space-y-2">${rows}</div>`;
}
