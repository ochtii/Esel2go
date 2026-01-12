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
                { text: '⚠️ Disclaimer', href: 'disclaimer.html' },
                { text: '🔧 Admin', href: 'admin.html' }
            ],
            color: 'orange'
        },
        admin: {
            year: '© 2026 esel2go - Admin Panel',
            links: [
                { text: '⚠️ Disclaimer', href: 'disclaimer.html' },
                { text: '🛍️ Shop', href: 'index.html' }
            ],
            color: 'purple'
        },
        disclaimer: {
            year: `© ${new Date().getFullYear()} esel2go - Demo-Projekt`,
            links: [],
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
                        <button id="cachebusterStatusBtn" class="text-${cfg.color}-500 hover:text-${cfg.color}-600 underline mt-2 flex items-center gap-1 mx-auto sm:mx-0">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Cache-Buster Status
                        </button>
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
        const version = Date.now();
        const response = await fetch(`./build-info.json?v=${version}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        const html = `
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div class="flex items-start gap-4 mb-4">
                    <div class="bg-blue-500 text-white p-3 rounded-lg">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-xl font-bold text-gray-800 mb-1">${data.message || 'Kein Commit-Titel'}</h4>
                        <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                ${data.author || 'Unbekannt'}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                ${data.lastCommit ? new Date(data.lastCommit).toLocaleString('de-AT', { timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short' }) : 'Unbekannt'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            ${data.files && data.files.length > 0 ? `
            <div class="mt-6">
                <h4 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Geänderte Dateien (${data.files.length})
                </h4>
                <div class="space-y-3">
                    ${data.files.map(file => {
                        const insertions = parseInt(file.insertions) || 0;
                        const deletions = parseInt(file.deletions) || 0;
                        const total = insertions + deletions;
                        const insertPct = total > 0 ? (insertions / total) * 100 : 0;
                        const deletePct = total > 0 ? (deletions / total) * 100 : 0;
                        
                        return `
                            <div class="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all">
                                <div class="flex items-start justify-between gap-3 mb-2">
                                    <span class="font-mono text-sm font-semibold text-gray-800 break-all flex-1">${file.file}</span>
                                    <span class="text-xs text-gray-500 whitespace-nowrap ml-4">
                                        ${total} Änderung${total !== 1 ? 'en' : ''}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-xs text-green-600 font-semibold">+${insertions}</span>
                                    <span class="text-xs text-red-600 font-semibold">-${deletions}</span>
                                </div>
                                <div class="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                    ${insertions > 0 ? `<div class="bg-green-500" style="width: ${insertPct}%"></div>` : ''}
                                    ${deletions > 0 ? `<div class="bg-red-500" style="width: ${deletePct}%"></div>` : ''}
                                </div>
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
