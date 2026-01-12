/**
 * Global Footer Component
 * Provides a unified footer for all pages with commit details
 */

/**
 * Render footer HTML for a specific page
 * @param {string} page - 'shop', 'admin', or 'disclaimer'
 * @returns {string} Footer HTML
 */
export function renderFooter(page = 'shop') {
    const config = {
        shop: {
            year: '© 2026 esel2go - Made with 🫏 in Vienna',
            links: [
                { text: 'ℹ️ Über', href: 'about.html' },
                { text: '⚠️ Disclaimer', href: 'disclaimer.html' },
                { text: '🔧 Admin', href: 'admin.html' }
            ],
            color: 'orange'
        },
        admin: {
            year: '© 2026 esel2go - Admin Panel',
            links: [
                { text: 'ℹ️ Über', href: 'about.html' },
                { text: '⚠️ Disclaimer', href: 'disclaimer.html' },
                { text: '🛍️ Shop', href: 'index.html' }
            ],
            color: 'purple'
        },
        about: {
            year: '© 2026 esel2go - Projekt-Statistiken',
            links: [
                { text: '🛍️ Shop', href: 'index.html' },
                { text: '⚠️ Disclaimer', href: 'disclaimer.html' },
                { text: '🔧 Admin', href: 'admin.html' }
            ],
            color: 'blue'
        },
        disclaimer: {
            year: `© ${new Date().getFullYear()} esel2go - Demo-Projekt`,
            links: [
                { text: 'ℹ️ Über', href: 'about.html' }
            ],
            color: 'orange'
        }
    };

    const cfg = config[page] || config.shop;
    const linksHTML = cfg.links.map((link) => 
        `<a href="${link.href}" class="text-${cfg.color}-500 hover:text-${cfg.color}-600 underline">${link.text}</a>`
    ).join(' ');

    return `
        <footer class="${page === 'disclaimer' ? 'bg-gray-800 text-white' : 'theme-bg-secondary theme-border border-t'} mt-12 py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col gap-4">
                    <div class="${page === 'disclaimer' ? 'text-gray-400' : 'theme-text-light'} text-sm text-center sm:text-left">
                        <p>${cfg.year}</p>
                    </div>
                    ${cfg.links.length > 0 ? `<div class="flex flex-wrap gap-3 text-xs justify-center sm:justify-start">${linksHTML}</div>` : ''}
                    <div class="${page === 'disclaimer' ? 'text-gray-400' : 'theme-text-light'} text-xs text-center sm:text-left">
                        <p class="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                            <span>Letzte Änderung: <span id="updateTimestamp">Loading...</span></span>
                            <button id="commitDetailsBtn" class="text-${cfg.color}-500 hover:text-${cfg.color}-600 transition" title="Commit-Details anzeigen">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </button>
                        </p>
                        <div class="flex flex-wrap gap-3 mt-2 justify-center sm:justify-start">
                            <button id="cachebusterStatusBtn" class="text-${cfg.color}-500 hover:text-${cfg.color}-600 underline flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Cache-Buster Status
                            </button>
                            <button id="debugConsoleToggleBtn" class="text-${cfg.color}-500 hover:text-${cfg.color}-600 underline flex items-center gap-1">
                                🐞 Debug-Konsole
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>

        <!-- Commit Details Modal -->
        <div id="commitDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 z-[100] hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
                <div class="bg-gradient-to-r from-${cfg.color}-500 to-${cfg.color}-600 text-white p-6 flex items-center justify-between">
                    <h3 class="text-2xl font-bold flex items-center gap-3">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        Letzter Commit
                    </h3>
                    <button id="closeCommitDetailsModal" class="text-white hover:bg-white/20 p-2 rounded-lg transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[calc(95vh-88px)]">
                    <div id="commitDetailsContent" class="space-y-6">
                        <div class="text-center text-gray-500 py-8">
                            <svg class="w-12 h-12 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <p>Lade Commit-Details...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize footer (called after DOM insertion)
 */
export async function initializeFooter() {
    // Initialize Commit Details Modal
    initializeCommitDetailsModal();
    
    // Load and display timestamp
    await loadTimestamp();
}

/**
 * Load and display the last commit timestamp
 */
async function loadTimestamp() {
    const timestampElement = document.getElementById('updateTimestamp');
    
    if (!timestampElement) {
        console.warn('Update timestamp element not found');
        return;
    }
    
    const version = Date.now();
    const paths = ['build-info.json', './build-info.json'];
    
    for (const path of paths) {
        try {
            console.log(`Trying to fetch: ${path}`);
            const response = await fetch(`${path}?v=${version}`);
            
            if (!response.ok) {
                console.warn(`Failed to fetch ${path}: ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            console.log('Build info loaded:', data);
            
            if (data.lastCommit) {
                const date = new Date(data.lastCommit);
                const formatted = date.toLocaleString('de-AT', {
                    timeZone: 'Europe/Vienna',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
                timestampElement.textContent = formatted;
                console.log('✓ Footer timestamp displayed:', formatted);
                return;
            }
        } catch (error) {
            console.warn(`Error fetching ${path}:`, error);
        }
    }
    
    // If we get here, all attempts failed
    console.error('All attempts to load build-info.json failed');
    timestampElement.textContent = '(Datum nicht verfügbar)';
}

/**
 * Initialize Commit Details Modal
 */
function initializeCommitDetailsModal() {
    const detailsBtn = document.getElementById('commitDetailsBtn');
    const modal = document.getElementById('commitDetailsModal');
    const closeBtn = document.getElementById('closeCommitDetailsModal');

    if (!detailsBtn || !modal || !closeBtn) return;

    detailsBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        loadCommitDetails();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
}

/**
 * Load and display commit details
 */
async function loadCommitDetails() {
    const content = document.getElementById('commitDetailsContent');
    if (!content) return;

    try {
        // Load local build-info.json
        const version = Date.now();
        const paths = ['build-info.json', './build-info.json'];
        let data = null;
        
        for (const path of paths) {
            try {
                const response = await fetch(`${path}?v=${version}`);
                if (response.ok) {
                    data = await response.json();
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!data) {
            throw new Error('Failed to load build-info.json');
        }
        
        // Try to load additional GitHub API data
        let githubData = null;
        try {
            const githubResponse = await fetch(
                `https://api.github.com/repos/ochtii/Esel2go/commits/${data.hash}`,
                { cache: 'no-cache' }
            );
            if (githubResponse.ok) {
                githubData = await githubResponse.json();
                console.log('GitHub API data loaded:', githubData);
            }
        } catch (error) {
            console.warn('GitHub API not available:', error);
        }
        
        // Prepare file stats
        const files = githubData?.files || data.files || [];
        console.log('Raw files data:', files);
        
        // Normalize file data - ensure consistent structure
        const normalizedFiles = files.map(f => ({
            file: f.file || f.filename,
            insertions: parseInt(f.insertions || f.additions) || 0,
            deletions: parseInt(f.deletions) || 0,
            status: f.status || (f.insertions || f.additions ? 'modified' : null),
            previous_filename: f.previous_filename
        }));
        
        console.log('Normalized files:', normalizedFiles);
        
        const stats = githubData?.stats || {
            additions: normalizedFiles.reduce((sum, f) => sum + f.insertions, 0),
            deletions: normalizedFiles.reduce((sum, f) => sum + f.deletions, 0),
            total: 0
        };
        stats.total = stats.additions + stats.deletions;
        
        // Categorize files
        const addedFiles = normalizedFiles.filter(f => f.status === 'added');
        const modifiedFiles = normalizedFiles.filter(f => f.status === 'modified' || (!f.status && (f.insertions || f.deletions)));
        const deletedFiles = normalizedFiles.filter(f => f.status === 'removed');
        const renamedFiles = normalizedFiles.filter(f => f.status === 'renamed');
        
        const html = `
            <!-- Commit Header -->
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div class="flex items-start gap-4 mb-4">
                    <div class="bg-blue-500 text-white p-3 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-xl font-bold text-gray-800 mb-2">${data.message || githubData?.commit?.message || 'Kein Commit-Titel'}</h4>
                        <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                ${data.author || githubData?.commit?.author?.name || 'Unbekannt'}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                ${data.lastCommit ? new Date(data.lastCommit).toLocaleString('de-AT', { timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short' }) : 'Unbekannt'}
                            </span>
                            <span class="flex items-center gap-1 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                                </svg>normalizedF
                                ${data.shortHash || data.hash?.substring(0, 7)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Stats Summary -->
                <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-300">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-gray-800">${files.length}</div>
                        <div class="text-xs text-gray-600">Dateien</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">+${stats.additions}</div>
                        <div class="text-xs text-gray-600">Hinzugefügt</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">-${stats.deletions}</div>
                        <div class="text-xs text-gray-600">Gelöscht</div>
                    </div>
                </div>
                
                <!-- Overall Progress Bar -->
                ${stats.total > 0 ? `
                <div class="mt-4">
                    <div class="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                        <div class="bg-green-500" style="width: ${(stats.additions / stats.total) * 100}%"></div>
                        <div class="bg-red-500" style="width: ${(stats.deletions / stats.total) * 100}%"></div>
                    </div>
                </div>
                ` : ''}
            </div>

            ${normalizedFiles.length > 0 ? `
            <div class="mt-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Geänderte Dateien (${normalizedFiles.length})
                </h4>
                
                <!-- File Categories -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    ${addedFiles.length > 0 ? `<div class="text-center p-2 bg-green-50 rounded-lg border border-green-200"><div class="text-lg font-bold text-green-600">${addedFiles.length}</div><div class="text-xs text-gray-600">Neu</div></div>` : ''}
                    ${modifiedFiles.length > 0 ? `<div class="text-center p-2 bg-blue-50 rounded-lg border border-blue-200"><div class="text-lg font-bold text-blue-600">${modifiedFiles.length}</div><div class="text-xs text-gray-600">Geändert</div></div>` : ''}
                    ${deletedFiles.length > 0 ? `<div class="text-center p-2 bg-red-50 rounded-lg border border-red-200"><div class="text-lg font-bold text-red-600">${deletedFiles.length}</div><div class="text-xs text-gray-600">Gelöscht</div></div>` : ''}
                    ${renamedFiles.length > 0 ? `<div class="text-center p-2 bg-purple-50 rounded-lg border border-purple-200"><div class="text-lg font-bold text-purple-600">${renamedFiles.length}</div><div class="text-xs text-gray-600">Umbenannt</div></div>` : ''}
                </div>
                
                <div class="space-y-3">
                    ${normalizedFiles.map(file => {
                        const insertions = file.insertions;
                        const deletions = file.deletions;
                        const total = insertions + deletions;
                        const insertPct = total > 0 ? (insertions / total) * 100 : 0;
                        const deletePct = total > 0 ? (deletions / total) * 100 : 0;
                        
                        const statusColors = {
                            added: 'bg-green-50 border-green-300',
                            modified: 'bg-blue-50 border-blue-300',
                            removed: 'bg-red-50 border-red-300',
                            renamed: 'bg-purple-50 border-purple-300'
                        };
                        const statusIcons = {
                            added: '✚',
                            modified: '✎',
                            removed: '✗',
                            renamed: '⤷'
                        };
                        const statusLabels = {
                            added: 'Neu',
                            modified: 'Geändert',
                            removed: 'Gelöscht',
                            renamed: 'Umbenannt'
                        };
                        const statusColor = statusColors[file.status] || 'bg-white border-gray-200';
                        const statusIcon = statusIcons[file.status] || '•';
                        const statusLabel = statusLabels[file.status] || '';
                        
                        return `
                            <div class="${statusColor} rounded-lg p-4 border-2 hover:shadow-md transition-all">
                                <div class="flex items-start justify-between gap-3 mb-2">
                                    <div class="flex items-center gap-2 flex-1">
                                        <span class="text-lg">${statusIcon}</span>
                                        <span class="font-mono text-sm font-semibold text-gray-800 break-all">${file.file}</span>
                                    </div>
                                    ${statusLabel ? `<span class="text-xs bg-white px-2 py-1 rounded font-semibold text-gray-600">${statusLabel}</span>` : ''}
                                </div>
                                ${file.previous_filename ? `<div class="text-xs text-gray-500 mb-2 ml-7">← ${file.previous_filename}</div>` : ''}
                                ${total > 0 ? `
                                <div class="flex items-center gap-2 mb-2 ml-7">
                                    <span class="text-xs text-green-600 font-semibold">+${insertions}</span>
                                    <span class="text-xs text-red-600 font-semibold">-${deletions}</span>
                                    <span class="text-xs text-gray-500">(${total} Zeilen)</span>
                                </div>
                                <div class="h-2 bg-gray-200 rounded-full overflow-hidden flex ml-7">
                                    ${insertions > 0 ? `<div class="bg-green-500" style="width: ${insertPct}%"></div>` : ''}
                                    ${deletions > 0 ? `<div class="bg-red-500" style="width: ${deletePct}%"></div>` : ''}
                                </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : `
            <div class="text-center text-gray-500 py-8">
                <p>Keine Datei-Details verfügbar</p>
            </div>
            `}
            
            ${githubData?.html_url ? `
            <div class="mt-6 text-center">
                <a href="${githubData.html_url}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
                    </svg>
                    Auf GitHub ansehen
                </a>
            </div>
            ` : ''}
        `;
        
        content.innerHTML = html;
    } catch (error) {
        console.error('Failed to load commit details:', error);
        content.innerHTML = `
            <div class="text-center text-red-500 py-8">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>Fehler beim Laden der Commit-Details</p>
            </div>
        `;
    }
}
