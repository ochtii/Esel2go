/**
 * Admin Module - Product Management
 * Modern interactive CRUD operations for products
 */

let products = [];
let categories = [];
let editingId = null;
let currentTab = 'manager'; // 'catalog' or 'manager'

// DOM Elements
let productForm;
let productsList;
let searchInput;
let filterCategory;
let imagePreview;
let charCount;
let catalogGrid;
let catalogSearch;
let catalogFilter;

/**
 * Initialize Admin Panel
 */
async function init() {
    // Get DOM elements
    productForm = document.getElementById('productForm');
    productsList = document.getElementById('productsList');
    searchInput = document.getElementById('searchProducts');
    filterCategory = document.getElementById('filterCategory');
    imagePreview = document.getElementById('imagePreview');
    charCount = document.getElementById('charCount');
    catalogGrid = document.getElementById('catalogGrid');
    catalogSearch = document.getElementById('catalogSearch');
    catalogFilter = document.getElementById('catalogFilter');
    
    // Load data
    await loadData();
    
    // Populate categories dropdown
    populateCategoryDropdowns();
    
    // Render products
    renderProducts();
    renderCatalog();
    
    // Update stats
    updateStats();
    
    // Event listeners
    productForm.addEventListener('submit', handleSubmit);
    document.getElementById('cancelEdit').addEventListener('click', cancelEdit);
    document.getElementById('downloadJson').addEventListener('click', downloadJSON);
    searchInput.addEventListener('input', renderProducts);
    filterCategory.addEventListener('input', renderProducts);
    catalogSearch.addEventListener('input', renderCatalog);
    catalogFilter.addEventListener('input', renderCatalog);
    
    // Live preview listeners
    document.getElementById('productImage').addEventListener('input', updateImagePreview);
    document.getElementById('productDescription').addEventListener('input', updateCharCount);
    
    // Initialize with manager view
    switchTab('manager');
    
    // Initialize Cache-Buster Status if button exists
    initializeCachebusterStatus();
    
    console.log('✨ Modern Admin panel initialized');
    showToast('✓ Admin Panel geladen', 'success');
}

/**
 * Switch between tabs
 */
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.getElementById('catalogTab').classList.toggle('active', tab === 'catalog');
    document.getElementById('managerTab').classList.toggle('active', tab === 'manager');
    document.getElementById('catalogTab').classList.toggle('border-transparent', tab !== 'catalog');
    document.getElementById('managerTab').classList.toggle('border-transparent', tab !== 'manager');
    document.getElementById('catalogTab').classList.toggle('border-purple-500', tab === 'catalog');
    document.getElementById('managerTab').classList.toggle('border-purple-500', tab === 'manager');
    document.getElementById('catalogTab').classList.toggle('text-purple-600', tab === 'catalog');
    document.getElementById('managerTab').classList.toggle('text-purple-600', tab === 'manager');
    
    // Update views
    document.getElementById('catalogView').classList.toggle('hidden', tab !== 'catalog');
    document.getElementById('managerView').classList.toggle('hidden', tab !== 'manager');
}

/**
 * Update image preview
 */
function updateImagePreview() {
    const url = document.getElementById('productImage').value;
    if (url) {
        imagePreview.src = url;
        imagePreview.onerror = () => {
            imagePreview.src = 'https://via.placeholder.com/400x400?text=Ungültige+URL';
        };
    }
}

/**
 * Update character count
 */
function updateCharCount() {
    const text = document.getElementById('productDescription').value;
    charCount.textContent = `${text.length} Zeichen`;
}

/**
 * Load products and categories
 */
async function loadData() {
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`data/products.json?v=${Date.now()}`),
            fetch(`data/categories.json?v=${Date.now()}`)
        ]);
        
        products = await productsRes.json();
        categories = await categoriesRes.json();
        
        console.log(`Loaded ${products.length} products and ${categories.length} categories`);
    } catch (error) {
        console.error('Failed to load data:', error);
        showToast('Fehler beim Laden der Daten', 'error');
    }
}

/**
 * Populate category dropdowns
 */
function populateCategoryDropdowns() {
    const selects = [
        document.getElementById('productCategory'),
        document.getElementById('filterCategory'),
        document.getElementById('catalogFilter')
    ];
    
    selects.forEach((select, index) => {
        const currentValue = select.value;
        
        // Clear existing options (except first one for main select)
        if (index === 0) {
            select.innerHTML = '<option value="">-- Wählen --</option>';
        } else {
            select.innerHTML = '<option value="">Alle Kategorien</option>';
        }
        
        // Add category options
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
        
        // Restore selection
        if (currentValue) select.value = currentValue;
    });
}

/**
 * Render catalog view (read-only)
 */
function renderCatalog() {
    const searchTerm = catalogSearch.value.toLowerCase();
    const selectedCategory = catalogFilter.value;
    
    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    catalogGrid.innerHTML = filtered.map(product => renderCatalogCard(product)).join('');
}

/**
 * Render catalog card (simplified view)
 */
function renderCatalogCard(product) {
    const category = categories.find(c => c.id === product.categoryId);
    const categoryName = category ? category.name : 'Unbekannt';
    const categoryColor = getCategoryColor(product.categoryId);
    
    return `
        <div class="catalog-card bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-purple-200">
            <div class="relative h-56 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                <div class="absolute top-3 right-3">
                    <span class="text-xs px-3 py-1 ${categoryColor} rounded-full font-semibold shadow-lg">
                        ${categoryName}
                    </span>
                </div>
                ${product.price >= 100 ? '<div class="absolute top-3 left-3"><span class="text-xs px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow-lg">💎 Premium</span></div>' : ''}
            </div>
            <div class="p-5">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-bold text-xl text-gray-800 flex-1">${product.name}</h3>
                    <span class="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded ml-2">${product.id}</span>
                </div>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between border-t pt-4 mt-4">
                    <div class="text-2xl font-bold text-purple-600">€${product.price.toFixed(2)}</div>
                    <div class="text-sm text-gray-500 space-y-1">
                        <div>⏰ ${product.age} Jahre</div>
                        <div>📍 ${product.origin}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render products list (manager view)
 */
function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;
    
    // Filter products
    let filtered = products.filter(p => {
        const matchesSearch = !searchTerm || 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm) ||
            p.id.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort by ID
    filtered.sort((a, b) => {
        const numA = parseInt(a.id.replace('p', ''));
        const numB = parseInt(b.id.replace('p', ''));
        return numA - numB;
    });
    
    // Render
    productsList.innerHTML = filtered.length === 0 
        ? '<div class="text-center text-gray-400 py-8">Keine Produkte gefunden</div>'
        : filtered.map(product => renderProductCard(product)).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
}

/**
 * Render single product card
 */
function renderProductCard(product) {
    const category = categories.find(c => c.id === product.categoryId);
    const categoryName = category ? category.name : 'Unbekannt';
    const categoryColor = getCategoryColor(product.categoryId);
    
    return `
        <div class="product-card flex flex-col md:flex-row items-start md:items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-purple-200 bg-gradient-to-r from-white to-gray-50 animate-slide-in">
            <div class="relative group flex-shrink-0">
                <img src="${product.image}" alt="${product.name}" class="w-24 h-24 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow">
                <div class="absolute inset-0 bg-purple-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all"></div>
            </div>
            
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">${product.id}</span>
                    <span class="text-xs px-3 py-1 ${categoryColor} rounded-full font-semibold">${categoryName}</span>
                    ${product.price >= 100 ? '<span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">💎 Premium</span>' : ''}
                </div>
                <h3 class="font-bold text-lg text-gray-800 truncate mb-1">${product.name}</h3>
                <p class="text-sm text-gray-600 line-clamp-2 mb-3">${product.description}</p>
                <div class="flex flex-wrap gap-4 text-sm">
                    <span class="text-purple-600 font-bold">€${product.price.toFixed(2)}</span>
                    <span class="text-gray-500">⏰ ${product.age} Jahre</span>
                    <span class="text-gray-500">📍 ${product.origin}</span>
                </div>
            </div>
            
            <div class="flex md:flex-col gap-2 w-full md:w-auto">
                <button class="edit-btn flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm flex items-center justify-center gap-2" data-id="${product.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Bearbeiten
                </button>
                <button class="delete-btn flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm flex items-center justify-center gap-2" data-id="${product.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Löschen
                </button>
            </div>
        </div>
    `;
}

/**
 * Get category color
 */
function getCategoryColor(categoryId) {
    const colors = {
        'fettn': 'bg-orange-100 text-orange-700',
        'begattungsgut': 'bg-pink-100 text-pink-700',
        'zubehoer': 'bg-blue-100 text-blue-700'
    };
    return colors[categoryId] || 'bg-gray-100 text-gray-700';
}

/**
 * Handle form submit
 */
function handleSubmit(e) {
    e.preventDefault();
    
    const product = {
        id: document.getElementById('productId').value.trim(),
        categoryId: document.getElementById('productCategory').value,
        name: document.getElementById('productName').value.trim(),
        image: document.getElementById('productImage').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        price: parseFloat(document.getElementById('productPrice').value),
        age: parseInt(document.getElementById('productAge').value),
        origin: document.getElementById('productOrigin').value.trim()
    };
    
    if (editingId) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            products[index] = product;
            showToast('Produkt aktualisiert', 'success');
        }
    } else {
        // Check if ID already exists
        if (products.find(p => p.id === product.id)) {
            showToast('Produkt-ID existiert bereits!', 'error');
            return;
        }
        
        // Add new product
        products.push(product);
        showToast('Produkt hinzugefügt', 'success');
    }
    
    // Reset form
    cancelEdit();
    renderProducts();
    updateStats();
}

/**
 * Edit product
 */
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    editingId = id;
    document.getElementById('editingId').value = id;
    document.getElementById('formTitle').innerHTML = '<span class="inline-block">✏️</span> Produkt bearbeiten';
    document.getElementById('cancelEdit').classList.remove('hidden');
    
    // Fill form
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.categoryId;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productAge').value = product.age;
    document.getElementById('productOrigin').value = product.origin;
    
    // Update previews
    updateImagePreview();
    updateCharCount();
    
    // Scroll to form with smooth animation
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showToast('✏️ Bearbeitungsmodus aktiv', 'info');
}

/**
 * Delete product
 */
function deleteProduct(id) {
    if (!confirm(`Produkt "${id}" wirklich löschen?`)) return;
    
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        showToast('Produkt gelöscht', 'success');
        renderProducts();
        updateStats();
    }
}

/**
 * Cancel edit mode
 */
function cancelEdit() {
    editingId = null;
    document.getElementById('editingId').value = '';
    document.getElementById('formTitle').innerHTML = '<span class="inline-block">✨</span> Neues Produkt';
    document.getElementById('cancelEdit').classList.add('hidden');
    productForm.reset();
    imagePreview.src = 'https://via.placeholder.com/400x400?text=Bild+Preview';
    charCount.textContent = '0 Zeichen';
    showToast('✓ Formular zurückgesetzt', 'info');
}

/**
 * Download products.json
 */
function downloadJSON() {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('JSON heruntergeladen', 'success');
}

/**
 * Update statistics
 */
function updateStats() {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts || 0;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    
    // Desktop stats
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalValue').textContent = `€${totalValue.toFixed(2)}`;
    
    // Mobile stats (kompakte Ansicht)
    const mobileProductsEl = document.getElementById('totalProducts-mobile');
    const mobileCategoriesEl = document.getElementById('totalCategories-mobile');
    const mobileAvgPriceEl = document.getElementById('avgPrice-mobile');
    const mobileTotalValueEl = document.getElementById('totalValue-mobile');
    
    if (mobileProductsEl) mobileProductsEl.textContent = totalProducts;
    if (mobileCategoriesEl) mobileCategoriesEl.textContent = totalCategories;
    if (mobileAvgPriceEl) mobileAvgPriceEl.textContent = `€${avgPrice.toFixed(2)}`;
    if (mobileTotalValueEl) mobileTotalValueEl.textContent = `€${totalValue.toFixed(2)}`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    const colors = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-600',
        error: 'bg-gradient-to-r from-red-500 to-red-600',
        info: 'bg-gradient-to-r from-blue-500 to-blue-600',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    };
    
    toastIcon.textContent = icons[type] || icons.info;
    toastMessage.textContent = message;
    toast.className = `fixed bottom-4 left-1/2 -translate-x-1/2 ${colors[type] || colors.info} text-white px-8 py-4 rounded-2xl shadow-2xl transition-all transform`;
    
    toast.classList.remove('hidden');
    toast.style.animation = 'slideUp 0.3s ease-out';
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease-out';
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
    }
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Import cachebuster status functions from footer.js
async function initializeCachebusterStatus() {
    const statusBtn = document.getElementById('cachebusterStatusBtn');
    const modal = document.getElementById('cachebusterModal');
    const closeBtn = document.getElementById('closeCachebusterModal');
    
    if (!statusBtn || !modal || !closeBtn) return;
    
    // Open modal
    statusBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        loadCachebusterStatusAdmin();
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

// Load cachebuster status for admin
function loadCachebusterStatusAdmin() {
    const content = document.getElementById('cachebusterStatusContent');
    if (!content) return;
    
    const version = window._cachebusterVersion || 'N/A';
    const enabled = localStorage.getItem('cachebuster_enabled') !== 'false';
    
    const scripts = document.querySelectorAll('script[src]').length;
    const css = document.querySelectorAll('link[rel="stylesheet"]').length;
    const withCachebuster = Array.from(document.querySelectorAll('script[src], link[rel="stylesheet"]'))
        .filter(el => (el.src || el.href).includes('?v=')).length;
    
    content.innerHTML = `
        <div class="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 mb-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="bg-purple-600 text-white p-3 rounded-lg">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-gray-800">Cache-Buster ${enabled ? 'Aktiv ✓' : 'Deaktiviert'}</h3>
                    <p class="text-sm text-gray-600">Version: ${version}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg p-3 text-center shadow">
                    <div class="text-2xl font-bold text-purple-600">${scripts + css + 4}</div>
                    <div class="text-xs text-gray-500">Geladene Dateien</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center shadow">
                    <div class="text-2xl font-bold text-green-600">${withCachebuster + 4}</div>
                    <div class="text-xs text-gray-500">Mit Cache-Buster</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center shadow">
                    <div class="text-2xl font-bold text-blue-600">2</div>
                    <div class="text-xs text-gray-500">JSON Dateien</div>
                </div>
                <div class="bg-white rounded-lg p-3 text-center shadow">
                    <div class="text-2xl font-bold text-orange-600">${scripts}</div>
                    <div class="text-xs text-gray-500">JavaScript</div>
                </div>
            </div>
        </div>
        
        <div class="space-y-4">
            <h4 class="font-bold text-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Admin Panel Ressourcen
            </h4>
            <div class="space-y-2">
                <div class="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="flex-1">
                        <span class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">JavaScript</span>
                        <span class="ml-2 text-sm font-medium">admin.js</span>
                        <div class="text-xs text-green-600 font-mono">✓ Cache-Buster aktiv</div>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="flex-1">
                        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">CSS</span>
                        <span class="ml-2 text-sm font-medium">style.css</span>
                        <div class="text-xs text-green-600 font-mono">✓ Cache-Buster aktiv</div>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="flex-1">
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">JSON Data</span>
                        <span class="ml-2 text-sm font-medium">products.json</span>
                        <div class="text-xs text-green-600 font-mono">✓ Cache-Buster aktiv (Dynamic)</div>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-purple-300 transition">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="flex-1">
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">JSON Data</span>
                        <span class="ml-2 text-sm font-medium">categories.json</span>
                        <div class="text-xs text-green-600 font-mono">✓ Cache-Buster aktiv (Dynamic)</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 class="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Was bedeutet das?
            </h4>
            <p class="text-sm text-gray-700">
                Der Cache-Buster sorgt dafür, dass alle Dateien mit einer eindeutigen Version geladen werden.
                So werden Änderungen sofort sichtbar, ohne den Browser-Cache manuell löschen zu müssen.
            </p>
        </div>
    `;
}

// Make switchTab globally accessible
window.switchTab = switchTab;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
