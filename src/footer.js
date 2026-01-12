/**
 * Footer Module - Display last update timestamp
 * Simple timestamp display using localStorage
 */

/**
 * Format date to human-readable format (Vienna timezone)
 */
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Vienna'
    };
    try {
        return new Intl.DateTimeFormat('de-DE', options).format(date);
    } catch (error) {
        console.warn('Date formatting error:', error);
        return date.toLocaleString('de-DE');
    }
}

/**
 * Get last update timestamp from build/deploy time
 * Falls back to current time
 */
function getLastUpdateTime() {
    // Try to get from localStorage (persists across page reloads)
    const stored = localStorage.getItem('esel2go-load-time');
    if (stored) {
        try {
            const date = new Date(stored);
            if (date instanceof Date && !isNaN(date)) {
                return formatDate(date);
            }
        } catch (error) {
            console.warn('Error parsing stored timestamp:', error);
        }
    }
    
    // Fallback: Store and return current time
    const now = new Date();
    localStorage.setItem('esel2go-load-time', now.toISOString());
    return formatDate(now);
}

/**
 * Try to fetch actual last commit from GitHub (non-blocking)
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
            throw new Error(`GitHub API responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0 && data[0].commit?.committer?.date) {
            const commitDate = new Date(data[0].commit.committer.date);
            return formatDate(commitDate);
        }
    } catch (error) {
        console.log('GitHub API not available (normal in offline/sandboxed environments):', error.message);
    }
    
    return null;
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
    
    // Show default timestamp immediately
    const defaultTimestamp = getLastUpdateTime();
    timestampElement.textContent = defaultTimestamp;
    console.log('Footer initialized with timestamp:', defaultTimestamp);
    
    // Try to update with GitHub commit time in background (non-blocking)
    try {
        const githubTimestamp = await fetchGitHubCommitTime();
        if (githubTimestamp) {
            timestampElement.textContent = githubTimestamp;
            console.log('Footer updated with GitHub commit time:', githubTimestamp);
        }
    } catch (error) {
        console.log('Background GitHub fetch failed (this is okay):', error.message);
    }
}
/**
 * Update the footer timestamp manually
 */
export function updateFooterTimestamp() {
    const timestampElement = document.getElementById('updateTimestamp');
    if (timestampElement) {
        const now = new Date();
        localStorage.setItem('esel2go-load-time', now.toISOString());
        timestampElement.textContent = formatDate(now);
    }
}
