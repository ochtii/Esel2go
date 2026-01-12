/**
 * About Page - Project Statistics and Information
 */

// Stats data
const stats = {
    code: {
        JavaScript: 3966,
        HTML: 1246,
        CSS: 299,
        JSON: 427
    },
    files: {
        '.js': 12,
        '.html': 3,
        '.css': 1,
        '.json': 4
    },
    project: {
        totalFiles: 32,
        projectSize: 3.5, // MB
        avgFileSize: 112 // KB
    }
};

/**
 * Initialize About Page
 */
async function init() {
    console.log('📊 Initializing About page...');
    
    // Load product stats
    await loadProductStats();
    
    // Render code statistics
    renderCodeStats();
    
    // Render file statistics
    renderFileStats();
    
    // Render overall stats
    renderOverallStats();
    
    // Render system info
    renderSystemInfo();
    
    // Load build info
    loadBuildInfo();
    
    console.log('✓ About page initialized');
}

/**
 * Load product statistics
 */
async function loadProductStats() {
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`data/products.json?v=${Date.now()}`),
            fetch(`data/categories.json?v=${Date.now()}`)
        ]);
        
        const products = await productsRes.json();
        const categories = await categoriesRes.json();
        
        const totalProducts = products.length;
        const totalCategories = categories.length;
        const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalCategories').textContent = totalCategories;
        document.getElementById('avgPrice').textContent = `€${avgPrice.toFixed(2)}`;
        
        console.log(`✓ Loaded ${totalProducts} products, ${totalCategories} categories`);
    } catch (error) {
        console.error('Failed to load product stats:', error);
    }
}

/**
 * Render code statistics
 */
function renderCodeStats() {
    const container = document.getElementById('codeLines');
    const total = Object.values(stats.code).reduce((sum, val) => sum + val, 0);
    
    const colors = {
        JavaScript: '#f7df1e',
        HTML: '#e34c26',
        CSS: '#264de4',
        JSON: '#292929'
    };
    
    const html = Object.entries(stats.code).map(([lang, lines]) => {
        const percentage = ((lines / total) * 100).toFixed(1);
        return `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-gray-700">${lang}</span>
                    <span class="text-sm text-gray-500">${lines.toLocaleString()} Zeilen (${percentage}%)</span>
                </div>
                <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-500" style="width: ${percentage}%; background-color: ${colors[lang]}"></div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Create pie chart
    createPieChart('linesChart', 
        Object.keys(stats.code),
        Object.values(stats.code),
        Object.values(colors),
        'Zeilen Code'
    );
}

/**
 * Render file statistics
 */
function renderFileStats() {
    const container = document.getElementById('fileTypes');
    const total = Object.values(stats.files).reduce((sum, val) => sum + val, 0);
    
    const colors = {
        '.js': '#f7df1e',
        '.html': '#e34c26',
        '.css': '#264de4',
        '.json': '#292929'
    };
    
    const html = Object.entries(stats.files).map(([type, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        return `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-gray-700">${type} Dateien</span>
                    <span class="text-sm text-gray-500">${count} Dateien (${percentage}%)</span>
                </div>
                <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-500" style="width: ${percentage}%; background-color: ${colors[type]}"></div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Create pie chart
    createPieChart('filesChart',
        Object.keys(stats.files).map(t => `${t} Dateien`),
        Object.values(stats.files),
        Object.values(colors),
        'Dateien'
    );
}

/**
 * Render overall statistics
 */
function renderOverallStats() {
    const totalLines = Object.values(stats.code).reduce((sum, val) => sum + val, 0);
    
    document.getElementById('totalLines').textContent = totalLines.toLocaleString();
    document.getElementById('totalFiles').textContent = stats.project.totalFiles;
    document.getElementById('projectSize').textContent = `${stats.project.projectSize} MB`;
    document.getElementById('avgFileSize').textContent = `${stats.project.avgFileSize} KB`;
}

/**
 * Render system information
 */
function renderSystemInfo() {
    const container = document.getElementById('systemInfo');
    
    const info = [
        { label: 'Browser', value: navigator.userAgent.split(' ').pop() },
        { label: 'Plattform', value: navigator.platform },
        { label: 'Sprache', value: navigator.language },
        { label: 'Online Status', value: navigator.onLine ? '🟢 Online' : '🔴 Offline' },
        { label: 'Bildschirm', value: `${screen.width}×${screen.height}` },
        { label: 'Viewport', value: `${window.innerWidth}×${window.innerHeight}` },
        { label: 'Device Pixel Ratio', value: window.devicePixelRatio },
        { label: 'Cookies aktiviert', value: navigator.cookieEnabled ? '✓ Ja' : '✗ Nein' },
        { label: 'LocalStorage', value: typeof(Storage) !== "undefined" ? '✓ Verfügbar' : '✗ Nicht verfügbar' }
    ];
    
    const html = info.map(item => `
        <div class="border-b border-gray-200 pb-3">
            <div class="text-sm text-gray-500 mb-1">${item.label}</div>
            <div class="font-semibold text-gray-800 text-sm">${item.value}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

/**
 * Load build information
 */
async function loadBuildInfo() {
    const paths = ['build-info.json', './build-info.json'];
    
    for (const path of paths) {
        try {
            const response = await fetch(`${path}?v=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                if (data.lastCommit) {
                    const date = new Date(data.lastCommit);
                    const formatted = date.toLocaleString('de-AT', {
                        timeZone: 'Europe/Vienna',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    });
                    document.getElementById('lastUpdate').textContent = formatted;
                }
                return;
            }
        } catch (error) {
            continue;
        }
    }
    
    document.getElementById('lastUpdate').textContent = 'Unbekannt';
}

/**
 * Create a pie chart
 */
function createPieChart(canvasId, labels, data, colors, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold',
                        family: "'Inter', sans-serif"
                    },
                    padding: 20
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize on load
init();
