/**
 * Admin Module - Modern Table-Based Product Management
 * Features: Inline editing, bulk operations, quick actions, advanced filtering
 */

let products = [];
let categories = [];
let selectedProducts = new Set();
let currentSort = 'id';

// DOM Elements
let productsList;
let searchInput;
let filterCategory;
let sortBy;
let catalogGrid;
let catalogSearch;
let catalogFilter;

/**
 * Initialize Admin Panel
 */
async function init() {
    // Get DOM elements
    productsList = document.getElementById('productsList');
    searchInput = document.getElementById('searchProducts');
    filterCategory = document.getElementById('filterCategory');
    sortBy = document.getElementById('sortBy');
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
    searchInput?.addEventListener('input', renderProducts);
    filterCategory?.addEventListener('input', renderProducts);
    sortBy?.addEventListener('input', () => {
        currentSort = sortBy.value;
        renderProducts();
    });
    catalogSearch?.addEventListener('input', renderCatalog);
    catalogFilter?.addEventListener('input', renderCatalog);
    
    // Bulk action listeners
    document.getElementById('selectAllCheckbox')?.addEventListener('change', handleSelectAll);
    document.getElementById('selectAll')?.addEventListener('click', selectAllProducts);
    document.getElementById('deselectAll')?.addEventListener('click', deselectAllProducts);
    document.getElementById('bulkDelete')?.addEventListener('click', handleBulkDelete);
    document.getElementById('addNewProduct')?.addEventListener('click', handleAddNewProduct);
    document.getElementById('downloadJson')?.addEventListener('click', downloadJSON);
    
    // Tab switching
    document.getElementById('catalogTab')?.addEventListener('click', () => switchTab('catalog'));
    document.getElementById('managerTab')?.addEventListener('click', () => switchTab('manager'));
    
    // Initialize with manager view
    switchTab('manager');
    
    // Initialize Cache-Buster Status
    initializeCachebusterStatus();
    
    console.log('✨ Modern Admin panel initialized');
    showToast('✓ Admin Panel geladen', 'success');
}

/**
 * Switch between tabs
 */
function switchTab(tab) {
    const catalogTab = document.getElementById('catalogTab');
    const managerTab = document.getElementById('managerTab');
    const catalogView = document.getElementById('catalogView');
    const managerView = document.getElementById('managerView');
    
    if (tab === 'catalog') {
        catalogTab?.classList.add('active', 'border-purple-500', 'text-purple-600');
        catalogTab?.classList.remove('border-transparent');
        managerTab?.classList.remove('active', 'border-purple-500', 'text-purple-600');
        managerTab?.classList.add('border-transparent');
        catalogView?.classList.remove('hidden');
        managerView?.classList.add('hidden');
    } else {
        managerTab?.classList.add('active', 'border-purple-500', 'text-purple-600');
        managerTab?.classList.remove('border-transparent');
        catalogTab?.classList.remove('active', 'border-purple-500', 'text-purple-600');
        catalogTab?.classList.add('border-transparent');
        managerView?.classList.remove('hidden');
        catalogView?.classList.add('hidden');
    }
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
        document.getElementById('filterCategory'),
        document.getElementById('catalogFilter')
    ];
    
    selects.forEach((select, index) => {
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">Alle Kategorien</option>';
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
        
        if (currentValue) select.value = currentValue;
    });
}

/**
 * Render products in table view
 */
function renderProducts() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const selectedCategory = filterCategory?.value || '';
    
    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.description.toLowerCase().includes(searchTerm) ||
                            p.id.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    // Apply sorting
    filtered = sortProducts(filtered, currentSort);
    
    // Update counts
    const displayedEl = document.getElementById('displayedCount');
    const totalEl = document.getElementById('totalProductsCount');
    if (displayedEl) displayedEl.textContent = filtered.length;
    if (totalEl) totalEl.textContent = products.length;
    
    if (filtered.length === 0) {
        productsList.innerHTML = `
            <tr>
                <td colspan="9" class="p-12 text-center text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="font-semibold text-lg">Keine Produkte gefunden</p>
                    <p class="text-sm mt-2">Versuche einen anderen Suchbegriff oder Filter</p>
                </td>
            </tr>
        `;
        return;
    }
    
    productsList.innerHTML = filtered.map(product => renderProductRow(product)).join('');
    
    // Add event listeners
    attachProductEventListeners();
}

/**
 * Sort products
 */
function sortProducts(prods, sortType) {
    const sorted = [...prods];
    switch(sortType) {
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'age':
            return sorted.sort((a, b) => b.age - a.age);
        default: // 'id'
            return sorted.sort((a, b) => a.id.localeCompare(b.id));
    }
}

/**
 * Render single product row
 */
function renderProductRow(product) {
    const category = categories.find(c => c.id === product.categoryId);
    const categoryName = category ? category.name : 'Unbekannt';
    const categoryColor = getCategoryColor(product.categoryId);
    const isSelected = selectedProducts.has(product.id);
    
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    const safeName = escapeHtml(product.name);
    const safeDescription = escapeHtml(product.description);
    const safeOrigin = escapeHtml(product.origin);
    
    return `
        <tr class="hover:bg-gray-50 transition-colors ${isSelected ? 'bg-purple-50' : ''}" data-product-id="${product.id}">
            <td class="p-4">
                <input type="checkbox" class="product-checkbox w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                    data-id="${product.id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td class="p-4">
                <img src="${product.image}" alt="${safeName}" 
                    class="w-16 h-16 rounded-lg object-cover shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    onclick="viewImage('${product.image}')">
            </td>
            <td class="p-4">
                <span class="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">${product.id}</span>
            </td>
            <td class="p-4">
                <div class="font-semibold text-gray-800">${safeName}</div>
                <div class="text-xs text-gray-500 mt-1 line-clamp-1">${safeDescription}</div>
            </td>
            <td class="p-4">
                <span class="text-xs px-3 py-1 ${categoryColor} rounded-full font-semibold">${categoryName}</span>
            </td>
            <td class="p-4">
                <span class="font-bold text-purple-600">€${product.price.toFixed(2)}</span>
            </td>
            <td class="p-4">
                <span class="text-gray-700">${product.age} Jahre</span>
            </td>
            <td class="p-4">
                <span class="text-gray-600 text-sm">${safeOrigin}</span>
            </td>
            <td class="p-4">
                <div class="flex items-center justify-center gap-2">
                    <button class="view-btn p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                        data-id="${product.id}" title="Ansehen">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                    <button class="edit-btn p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                        data-id="${product.id}" title="Bearbeiten">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="duplicate-btn p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" 
                        data-id="${product.id}" title="Duplizieren">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                        data-id="${product.id}" title="Löschen">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Attach event listeners to product table rows
 */
function attachProductEventListeners() {
    // Checkboxes
    document.querySelectorAll('.product-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            if (e.target.checked) {
                selectedProducts.add(id);
            } else {
                selectedProducts.delete(id);
            }
            updateBulkActions();
        });
    });
    
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewProduct(btn.dataset.id));
    });
    
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    
    // Duplicate buttons
    document.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', () => duplicateProduct(btn.dataset.id));
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
}

/**
 * View product in modal
 */
function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const category = categories.find(c => c.id === product.categoryId);
    
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="viewModal">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">${product.name}</h3>
                        <button onclick="document.getElementById('viewModal').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover rounded-xl mb-4">
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span class="text-sm text-gray-500">ID</span>
                            <p class="font-mono font-semibold">${product.id}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">Kategorie</span>
                            <p class="font-semibold">${category?.name || 'Unbekannt'}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">Preis</span>
                            <p class="font-bold text-purple-600">€${product.price.toFixed(2)}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-500">Alter</span>
                            <p class="font-semibold">${product.age} Jahre</p>
                        </div>
                        <div class="col-span-2">
                            <span class="text-sm text-gray-500">Herkunft</span>
                            <p class="font-semibold">${product.origin}</p>
                        </div>
                    </div>
                    
                    <div>
                        <span class="text-sm text-gray-500">Beschreibung</span>
                        <p class="mt-1 text-gray-700">${product.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
}

/**
 * Edit product in modal
 */
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const categoryOptions = categories.map(cat => 
        `<option value="${cat.id}" ${cat.id === product.categoryId ? 'selected' : ''}>${cat.name}</option>`
    ).join('');
    
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="editModal">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Produkt bearbeiten</h3>
                        <button onclick="document.getElementById('editModal').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="editProductForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-1">ID</label>
                            <input type="text" value="${product.id}" disabled class="w-full px-4 py-2 border rounded-lg bg-gray-100">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Name</label>
                            <input type="text" id="editName" value="${product.name}" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Kategorie</label>
                            <select id="editCategory" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                                ${categoryOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Bild-URL</label>
                            <input type="url" id="editImage" value="${product.image}" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Beschreibung</label>
                            <textarea id="editDescription" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="3" required>${product.description}</textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold mb-1">Preis (€)</label>
                                <input type="number" id="editPrice" value="${product.price}" step="0.01" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-1">Alter (Jahre)</label>
                                <input type="number" id="editAge" value="${product.age}" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Herkunft</label>
                            <input type="text" id="editOrigin" value="${product.origin}" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button type="submit" class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                                Speichern
                            </button>
                            <button type="button" onclick="document.getElementById('editModal').remove()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                                Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    document.getElementById('editProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const index = products.findIndex(p => p.id === id);
        products[index] = {
            ...products[index],
            name: document.getElementById('editName').value,
            categoryId: document.getElementById('editCategory').value,
            image: document.getElementById('editImage').value,
            description: document.getElementById('editDescription').value,
            price: parseFloat(document.getElementById('editPrice').value),
            age: parseInt(document.getElementById('editAge').value),
            origin: document.getElementById('editOrigin').value
        };
        
        renderProducts();
        updateStats();
        document.getElementById('editModal').remove();
        showToast('✓ Produkt aktualisiert', 'success');
    });
}

/**
 * Duplicate product
 */
function duplicateProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Find next available ID
    const maxId = Math.max(...products.map(p => parseInt(p.id.replace('p', ''))));
    const newId = `p${maxId + 1}`;
    
    const newProduct = {
        ...product,
        id: newId,
        name: `${product.name} (Kopie)`
    };
    
    products.push(newProduct);
    renderProducts();
    updateStats();
    showToast(`✓ Produkt dupliziert als ${newId}`, 'success');
}

/**
 * Delete product
 */
function deleteProduct(id) {
    if (!confirm(`Produkt "${id}" wirklich löschen?`)) return;
    
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        selectedProducts.delete(id);
        renderProducts();
        updateStats();
        updateBulkActions();
        showToast('✓ Produkt gelöscht', 'success');
    }
}

/**
 * Add new product
 */
function handleAddNewProduct() {
    const maxId = Math.max(...products.map(p => parseInt(p.id.replace('p', ''))), 0);
    const newId = `p${maxId + 1}`;
    
    const categoryOptions = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" id="newProductModal">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Neues Produkt erstellen</h3>
                        <button onclick="document.getElementById('newProductModal').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="newProductForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold mb-1">ID</label>
                            <input type="text" value="${newId}" disabled class="w-full px-4 py-2 border rounded-lg bg-gray-100">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Name</label>
                            <input type="text" id="newName" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Kategorie</label>
                            <select id="newCategory" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                                <option value="">-- Kategorie wählen --</option>
                                ${categoryOptions}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Bild-URL</label>
                            <input type="url" id="newImage" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="https://..." required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Beschreibung</label>
                            <textarea id="newDescription" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" rows="3" required></textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold mb-1">Preis (€)</label>
                                <input type="number" id="newPrice" step="0.01" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold mb-1">Alter (Jahre)</label>
                                <input type="number" id="newAge" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1">Herkunft</label>
                            <input type="text" id="newOrigin" class="w-full px-4 py-2 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200" required>
                        </div>
                        <div class="flex gap-3 pt-4">
                            <button type="submit" class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                                Erstellen
                            </button>
                            <button type="button" onclick="document.getElementById('newProductModal').remove()" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                                Abbrechen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    
    document.getElementById('newProductForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newProduct = {
            id: newId,
            name: document.getElementById('newName').value,
            categoryId: document.getElementById('newCategory').value,
            image: document.getElementById('newImage').value,
            description: document.getElementById('newDescription').value,
            price: parseFloat(document.getElementById('newPrice').value),
            age: parseInt(document.getElementById('newAge').value),
            origin: document.getElementById('newOrigin').value
        };
        
        products.push(newProduct);
        renderProducts();
        updateStats();
        document.getElementById('newProductModal').remove();
        showToast(`✓ Produkt ${newId} erstellt`, 'success');
    });
}

/**
 * Bulk operations
 */
function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
        const id = cb.dataset.id;
        if (e.target.checked) {
            selectedProducts.add(id);
        } else {
            selectedProducts.delete(id);
        }
    });
    updateBulkActions();
}

function selectAllProducts() {
    products.forEach(p => selectedProducts.add(p.id));
    renderProducts();
    updateBulkActions();
}

function deselectAllProducts() {
    selectedProducts.clear();
    renderProducts();
    updateBulkActions();
}

function handleBulkDelete() {
    if (selectedProducts.size === 0) return;
    
    if (!confirm(`${selectedProducts.size} Produkte wirklich löschen?`)) return;
    
    products = products.filter(p => !selectedProducts.has(p.id));
    selectedProducts.clear();
    renderProducts();
    updateStats();
    updateBulkActions();
    showToast(`✓ ${selectedProducts.size} Produkte gelöscht`, 'success');
}

function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (selectedProducts.size > 0) {
        bulkActions?.classList.remove('hidden');
        if (selectedCount) selectedCount.textContent = `${selectedProducts.size} ausgewählt`;
    } else {
        bulkActions?.classList.add('hidden');
    }
}

/**
 * View image in modal
 */
function viewImage(url) {
    const modal = `
        <div class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" id="imageModal" onclick="this.remove()">
            <img src="${url}" class="max-w-full max-h-full rounded-lg shadow-2xl" onclick="event.stopPropagation()">
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modal);
}

/**
 * Render catalog view
 */
function renderCatalog() {
    const searchTerm = catalogSearch?.value.toLowerCase() || '';
    const selectedCategory = catalogFilter?.value || '';
    
    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                            p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    if (!catalogGrid) return;
    
    catalogGrid.innerHTML = filtered.map(product => renderCatalogCard(product)).join('');    
    
    // Add event listeners
    document.querySelectorAll('.catalog-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            switchTab('manager');
            setTimeout(() => editProduct(btn.dataset.id), 100);
        });
    });
    
    document.querySelectorAll('.catalog-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProduct(btn.dataset.id);
        });
    });
}

/**
 * Render catalog card
 */
function renderCatalogCard(product) {
    const category = categories.find(c => c.id === product.categoryId);
    const categoryName = category ? category.name : 'Unbekannt';
    const categoryColor = getCategoryColor(product.categoryId);
    const isPremium = product.price >= 100;
    
    return `
        <div class="product-card group bg-white rounded-xl shadow-md hover:shadow-2xl border-2 border-gray-100 hover:border-purple-300 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            <div class="relative h-48 bg-gradient-to-br from-purple-50 to-pink-50">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                ${isPremium ? '<span class="absolute top-3 right-3 text-xs px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow-lg">💎 Premium</span>' : ''}
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-mono text-white/90 bg-white/20 backdrop-blur-sm px-2 py-1 rounded">${product.id}</span>
                        <span class="text-xs px-3 py-1 ${categoryColor} rounded-full font-semibold shadow-sm">${categoryName}</span>
                    </div>
                </div>
            </div>
            
            <div class="p-5">
                <h3 class="font-bold text-lg text-gray-800 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">${product.description}</p>
                
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <div class="text-2xl font-bold text-purple-600">€${product.price.toFixed(2)}</div>
                        <div class="text-xs text-gray-500">${product.age} Jahre • ${product.origin}</div>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <button class="catalog-edit-btn flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold" data-id="${product.id}">
                        ✏️ Bearbeiten
                    </button>
                    <button class="catalog-delete-btn px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition text-sm font-semibold" data-id="${product.id}">
                        🗑️
                    </button>
                </div>
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
 * Update statistics
 */
function updateStats() {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const avgPrice = products.length > 0 
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
        : 0;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    
    // Desktop stats
    const totalEl = document.getElementById('totalProducts');
    const catEl = document.getElementById('totalCategories');
    const avgEl = document.getElementById('avgPrice');
    const valueEl = document.getElementById('totalValue');
    
    if (totalEl) totalEl.textContent = totalProducts;
    if (catEl) catEl.textContent = totalCategories;
    if (avgEl) avgEl.textContent = `€${avgPrice.toFixed(2)}`;
    if (valueEl) valueEl.textContent = `€${totalValue.toFixed(2)}`;
    
    // Mobile stats
    const totalMobile = document.getElementById('totalProducts-mobile');
    const catMobile = document.getElementById('totalCategories-mobile');
    const avgMobile = document.getElementById('avgPrice-mobile');
    const valueMobile = document.getElementById('totalValue-mobile');
    
    if (totalMobile) totalMobile.textContent = totalProducts;
    if (catMobile) catMobile.textContent = totalCategories;
    if (avgMobile) avgMobile.textContent = `€${avgPrice.toFixed(2)}`;
    if (valueMobile) valueMobile.textContent = `€${totalValue.toFixed(2)}`;
}

/**
 * Download JSON
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
    showToast('✓ JSON exportiert', 'success');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastMessage) return;
    
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ'
    };
    
    if (toastIcon) toastIcon.textContent = icons[type] || icons.info;
    toastMessage.textContent = message;
    
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

/**
 * Initialize Cache-Buster Status
 */
function initializeCachebusterStatus() {
    // Implementation from footer.js
    console.log('Cache-buster status initialized');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
