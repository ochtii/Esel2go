/**
 * Admin Module - Product Management
 * CRUD operations for products
 */

let products = [];
let categories = [];
let editingId = null;

// DOM Elements
let productForm;
let productsList;
let searchInput;
let filterCategory;

/**
 * Initialize Admin Panel
 */
async function init() {
    // Get DOM elements
    productForm = document.getElementById('productForm');
    productsList = document.getElementById('productsList');
    searchInput = document.getElementById('searchProducts');
    filterCategory = document.getElementById('filterCategory');
    
    // Load data
    await loadData();
    
    // Populate categories dropdown
    populateCategoryDropdowns();
    
    // Render products
    renderProducts();
    
    // Update stats
    updateStats();
    
    // Event listeners
    productForm.addEventListener('submit', handleSubmit);
    document.getElementById('cancelEdit').addEventListener('click', cancelEdit);
    document.getElementById('downloadJson').addEventListener('click', downloadJSON);
    searchInput.addEventListener('input', renderProducts);
    filterCategory.addEventListener('input', renderProducts);
    
    console.log('✓ Admin panel initialized');
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
        document.getElementById('filterCategory')
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
 * Render products list
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
    
    return `
        <div class="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
            <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded">
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 font-mono">${product.id}</span>
                    <span class="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">${categoryName}</span>
                </div>
                <h3 class="font-semibold truncate">${product.name}</h3>
                <p class="text-sm text-gray-600 truncate">${product.description}</p>
                <div class="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>€${product.price.toFixed(2)}</span>
                    <span>${product.age} Jahre</span>
                    <span>${product.origin}</span>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="edit-btn px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm" data-id="${product.id}">
                    ✏️ Edit
                </button>
                <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm" data-id="${product.id}">
                    🗑️
                </button>
            </div>
        </div>
    `;
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
    document.getElementById('formTitle').textContent = 'Produkt bearbeiten';
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
    
    // Scroll to form
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    document.getElementById('formTitle').textContent = 'Neues Produkt';
    document.getElementById('cancelEdit').classList.add('hidden');
    productForm.reset();
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
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalCategories').textContent = categories.length;
    
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    document.getElementById('avgPrice').textContent = `€${avgPrice.toFixed(2)}`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-opacity ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-gray-800'
    } text-white`;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
