/**
 * Footer Module - Display last update timestamp
 * Fetches the latest commit info from GitHub API
 */

/**
 * Format date to human-readable format
 */
function formatDate(date) {
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
}

/**
 * Get last commit timestamp from GitHub API
 */
async function fetchLastCommitTime() {
    try {
        // Timeout nach 3 Sekunden
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        // GitHub API endpoint for latest commits
        const response = await fetch(
            'https://api.github.com/repos/ochtii/Esel2go/commits?per_page=1',
            { signal: controller.signal }
        );
        
        clearTimeout(timeout);
        
        if (!response.ok) {
            throw new Error('GitHub API error');
        }
        
        const data = await response.json();
        
        if (data.length > 0) {
            const commitDate = new Date(data[0].commit.committer.date);
            return formatDate(commitDate);
        }
    } catch (error) {
        console.warn('Failed to fetch commit timestamp from GitHub:', error.message);
    }
    
    return null;
}

/**
 * Get last update from localStorage (fallback)
 */
function getLocalLastUpdate() {
    const lastUpdate = localStorage.getItem('esel2go-last-update');
    if (lastUpdate) {
        try {
            const date = new Date(lastUpdate);
            return formatDate(date);
        } catch (error) {
            console.warn('Invalid stored timestamp:', error);
        }
    }
    return null;
}

/**
 * Store current timestamp in localStorage
 */
function storeCurrentUpdate() {
    localStorage.setItem('esel2go-last-update', new Date().toISOString());
}

/**
 * Initialize footer with timestamp
 */
export async function initializeFooter() {
    const timestampElement = document.getElementById('updateTimestamp');
    
    if (!timestampElement) {
        console.warn('Update timestamp element not found');
        return;
    }
    
    // Try to fetch from GitHub API first
    let timestamp = await fetchLastCommitTime();
    
    // Fall back to local storage if GitHub API fails
    if (!timestamp) {
        timestamp = getLocalLastUpdate();
    }
    
    // Fall back to current time if nothing else works
    if (!timestamp) {
        storeCurrentUpdate();
        timestamp = formatDate(new Date());
    }
    
    // Always update the display
    timestampElement.textContent = timestamp;
    console.log('Footer timestamp updated:', timestamp);
}

/**
 * Update the footer timestamp (for manual updates)
 */
export function updateFooterTimestamp() {
    storeCurrentUpdate();
    const timestampElement = document.getElementById('updateTimestamp');
    if (timestampElement) {
        timestampElement.textContent = formatDate(new Date());
    }
}
