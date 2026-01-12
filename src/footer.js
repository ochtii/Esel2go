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
            second: '2-digit',
            timeZone: 'Europe/Vienna'
        };
        return new Intl.DateTimeFormat('de-DE', options).format(date);
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
        const response = await fetch('./build-info.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        
        if (data.lastCommit) {
            console.log('✓ Build info loaded with commit time:', data.lastCommit);
            return formatDate(data.lastCommit);
        }
    } catch (error) {
        console.warn('Failed to load build-info.json:', error.message);
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
}
