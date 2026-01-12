/**
 * Admin Module - Product Management
 * Modern interactive CRUD operations for products
 */

let products = [];
let categories = [];
let editingId = null;

// DOM Elements
let productForm;
let productsList;
let searchInput;
let filterCategory;
let imagePreview;
let charCount;

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
    
    // Live preview listeners
    document.getElementById('productImage').addEventListener('input', updateImagePreview);
    document.getElementById('productDescription').addEventListener('input', updateCharCount);
    
    console.log('✨ Modern Admin panel initialized');
    showToast('✓ Admin Panel geladen', 'success');
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
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalCategories').textContent = categories.length;
    
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    document.getElementById('totalValue').textContent = `€${totalValue.toFixed(2)}`;
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
document.head.appendChild(style);   setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
