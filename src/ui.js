/**
 * UI Module - DOM Manipulation & Event Handling
 * Manages rendering and user interaction
 */

import * as api from './api.js';
import * as cart from './cart.js';
import * as i18n from './i18n.js';
import * as theme from './theme.js';
import * as cachebuster from './cachebuster.js';
// DOM Elements
const categoryFilter = document.getElementById('categoryFilter');
const productsGrid = document.getElementById('productsGrid');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsList = document.getElementById('cartItemsList');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartSummary = document.getElementById('cartSummary');
const cartBadge = document.getElementById('cartBadge');
const themeCycle = document.getElementById('themeCycle');
const themeIcon = document.getElementById('themeIcon');
const navMenu = document.getElementById('navMenu');
const mobileNav = document.getElementById('mobileNav');
const mobileNavMenu = document.getElementById('mobileNavMenu');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let currentFilter = 'all';

/**
 * Close mobile menus
 */
function closeMenus() {
    mobileNav.classList.add('hidden');
}

/**
 * Update navigation button states
 */
function updateNavigation() {
    // Update all nav buttons
    document.querySelectorAll('.nav-link').forEach(btn => {
        const isActive = btn.dataset.category === currentFilter;
        btn.classList.remove('theme-primary-bg', 'theme-text');
        if (isActive) {
            btn.classList.add('theme-primary-bg');
        } else {
            btn.classList.add('theme-text');
        }
    });
}

/**
 * Render category navigation menu
 */
export async function renderNavigation() {
    const categories = await api.fetchCategories();
    
    // Clear existing nav buttons (except "All" button)
    const existingButtons = navMenu.querySelectorAll('.nav-link[data-category]:not(#navAll)');
    existingButtons.forEach(btn => btn.remove());
    
    const mobileBtns = mobileNavMenu.querySelectorAll('.nav-link[data-category]:not(#mobileNavAll)');
    mobileBtns.forEach(btn => btn.remove());
    
    // Get the "All" buttons
    const navAll = document.getElementById('navAll');
    const mobileNavAll = document.getElementById('mobileNavAll');
    
    // Add category buttons to desktop nav
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'nav-link px-4 py-2 rounded-lg text-sm font-medium transition';
        button.textContent = category.name;
        button.dataset.category = category.id;
        button.addEventListener('click', () => {
            filterByCategory(category.id);
            updateNavigation();
        });
        navMenu.appendChild(button);
    });
    
    // Add category buttons to mobile nav
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'nav-link w-full px-4 py-2 rounded-lg text-sm font-medium transition text-left';
        button.textContent = category.name;
        button.dataset.category = category.id;
        button.addEventListener('click', () => {
            filterByCategory(category.id);
            closeMenus();
            updateNavigation();
        });
        mobileNavMenu.appendChild(button);
    });
    
    updateNavigation();
}

/**
 * Render category filter buttons (legacy - kept for products rendering)
 */
export async function renderCategories() {
    // Navigation is now handled by renderNavigation()
}

/**
 * Filter products by category
 */
async function filterByCategory(categoryId) {
    currentFilter = categoryId;
    await renderProducts();
}

/**
 * Render product grid
 */
export async function renderProducts() {
    const products = await api.getProductsByCategory(currentFilter);
    
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 text-lg">Keine Produkte gefunden</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'theme-bg theme-border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition';
        
        productCard.innerHTML = `
            <div class="aspect-square overflow-hidden theme-bg-secondary">
                <img src="${product.image}" alt="${product.name}" 
                    class="w-full h-full object-cover hover:scale-105 transition">
            </div>
            <div class="p-4">
                <h3 class="font-semibold theme-text text-lg mb-1">${product.name}</h3>
                <p class="theme-text-light text-sm mb-3 line-clamp-2">${product.description}</p>
                
                <div class="flex items-center justify-between mb-4">
                    <span class="text-2xl font-bold theme-accent">€ ${product.price.toFixed(2)}</span>
                    <span class="text-xs theme-bg-secondary theme-text px-2 py-1 rounded">
                        ${product.origin}
                    </span>
                </div>
                
                <button class="add-to-cart-btn w-full theme-primary-dark-bg hover:opacity-90 font-semibold py-2 rounded-lg transition"
                    data-product-id="${product.id}">
                    ${i18n.t('addToCart', 'In den Warenkorb')}
                </button>
            </div>
        `;
        
        // Add to cart button event listener
        productCard.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
            cart.addToCart(product, 1);
            updateCartUI();
            showToast(`${product.name} hinzugefügt!`);
        });
        
        productsGrid.appendChild(productCard);
    });
}

/**
 * Render cart items list
 */
export function renderCartItems() {
    const cartItemsData = cart.getCartItems();
    const cartItemsContainer = cartItemsList;
    
    cartItemsContainer.innerHTML = '';
    
    if (cartItemsData.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartSummary.classList.add('hidden');
        return;
    }
    
    emptyCartMessage.classList.add('hidden');
    cartSummary.classList.remove('hidden');
    
    cartItemsData.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = `flex justify-between items-center pb-4 theme-border border-b ${
            item.isBonus ? 'theme-bg-secondary p-3 rounded border' : ''
        }`;
        
        const itemName = item.isBonus 
            ? `<span class="theme-text font-semibold">✓ ${item.name}</span>`
            : `<span class="font-medium theme-text">${item.name}</span>`;
        
        cartItem.innerHTML = `
            <div class="flex-1">
                ${itemName}
                <div class="text-sm theme-text-light">
                    €${item.price.toFixed(2)} x ${item.quantity}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-semibold theme-text">€${(item.price * item.quantity).toFixed(2)}</span>
                ${!item.isBonus ? `
                    <button class="remove-item theme-accent hover:opacity-70 transition p-1" 
                        data-product-id="${item.id}">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
        
        // Remove button event listener
        if (!item.isBonus) {
            cartItem.querySelector('.remove-item').addEventListener('click', () => {
                cart.removeFromCart(item.id);
                updateCartUI();
                showToast(`${item.name} entfernt`);
            });
        }
        
        cartItemsContainer.appendChild(cartItem);
    });
}

/**
 * Update cart summary display
 */
export function updateCartSummary() {
    // Update bonus item
    const hadBonus = cart.shouldAddBonusItem();
    cart.updateBonusItem();
    
    const summary = cart.getCartSummary();
    
    // Format amounts
    const subtotalEl = document.getElementById('subtotal');
    const shippingCostEl = document.getElementById('shippingCost');
    const totalEl = document.getElementById('total');
    const bonusSection = document.getElementById('bonusSection');
    const shippingLabel = document.getElementById('shippingLabel');
    
    subtotalEl.textContent = `€ ${summary.subtotal.toFixed(2)}`;
    totalEl.textContent = `€ ${summary.total.toFixed(2)}`;
    
    // Handle free shipping
    if (summary.hasFreeShipping) {
        shippingCostEl.textContent = i18n.t('freeShipping', 'Gratis Lieferung! Leiwand!');
        shippingCostEl.classList.add('theme-text', 'font-semibold');
        shippingLabel.textContent = '';
    } else {
        shippingCostEl.textContent = `€ ${summary.shippingCost.toFixed(2)}`;
        shippingCostEl.classList.remove('theme-text', 'font-semibold');
        shippingLabel.textContent = i18n.t('shippingCost', 'Versandkosten:');
    }
    
    // Handle bonus item section
    if (summary.hasBonusItem) {
        bonusSection.classList.remove('hidden');
    } else {
        bonusSection.classList.add('hidden');
    }
}

/**
 * Update entire cart UI
 */
export function updateCartUI() {
    renderCartItems();
    updateCartSummary();
    updateCartBadge();
    updateTranslations();
}

/**
 * Update cart badge count
 */
function updateCartBadge() {
    const count = cart.getCartItemCount();
    if (count > 0) {
        cartBadge.textContent = count;
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }
}

/**
 * Toggle cart sidebar visibility
 */
export function toggleCart() {
    cartSidebar.classList.toggle('translate-x-full');
    cartOverlay.classList.toggle('hidden');
    
    if (!cartSidebar.classList.contains('translate-x-full')) {
        updateCartUI();
    }
}

/**
 * Close cart sidebar
 */
function closeCart() {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
}

/**
 * Show toast notification
 */
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

/**
 * Update UI text translations
 */
function updateTranslations() {
    document.getElementById('cartTitle').textContent = i18n.t('cartTitle', 'Dein Sackl');
    document.getElementById('totalLabel').textContent = i18n.t('total', 'Gesamt:');
    document.getElementById('checkoutBtn').textContent = i18n.t('checkout', 'Zur Kassa, Oida');
}

/**
 * Set up event listeners
 */
export function setupEventListeners() {
    cartToggle.addEventListener('click', toggleCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    
    // Navigation "All" buttons
    const navAll = document.getElementById('navAll');
    const mobileNavAll = document.getElementById('mobileNavAll');
    
    if (navAll) {
        navAll.addEventListener('click', () => {
            filterByCategory('all');
            updateNavigation();
        });
    }
    
    if (mobileNavAll) {
        mobileNavAll.addEventListener('click', () => {
            filterByCategory('all');
            closeMenus();
            updateNavigation();
        });
    }
    
    // Theme cycling
    if (themeCycle) {
        themeCycle.addEventListener('click', () => {
            const nextTheme = theme.cycleTheme();
            updateThemeIcon(nextTheme);
            showToast(`Theme: ${theme.getThemeNames()[nextTheme]}`);
        });
    }
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
            console.log('Mobile menu toggle clicked');
            mobileNav.classList.toggle('hidden');
            console.log('Mobile nav hidden class:', mobileNav.classList.contains('hidden'));
        });
    } else {
        console.warn('Mobile menu toggle button not found');
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            alert('Checkout würde hier passieren! 🎉');
            console.log('Cart Summary:', cart.getCartSummary());
        });
    }
    
    // Cachebuster controls (debug mode)
    const debugControls = document.getElementById('debugControls');
    const cachebusterToggle = document.getElementById('cachebusterToggle');
    const cachebusterClear = document.getElementById('cachebusterClear');
    
    if (cachebusterToggle) {
        cachebusterToggle.addEventListener('click', async () => {
            await toggleCachebusterUI();
        });
    }
    
    if (cachebusterClear) {
        cachebusterClear.addEventListener('click', async () => {
            await clearCachesUI();
        });
    }
    
    // Enable debug mode with keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (debugControls) {
                debugControls.classList.toggle('hidden');
                showToast(debugControls.classList.contains('hidden') ? 'Debug Mode OFF' : 'Debug Mode ON');
            }
        }
    });
}

/**
 * Update theme select dropdown and icon
 */
function updateThemeIcon(themeName) {
    const icons = {
        'light': '🌞',
        'dark': '🌙',
        'esel-oida': '🫏'
    };
    themeIcon.textContent = icons[themeName] || '🌞';
}

/**
 * Initialize UI
 */
export async function initializeUI() {
    theme.initializeTheme();
    updateThemeIcon(theme.getCurrentTheme());
    updateTranslations();
    await renderNavigation();
    await renderProducts();
    setupEventListeners();
    updateCartUI();
}
/**
 * Show cachebuster status in toast
 */
export function showCachebusterStatus() {
    const status = cachebuster.getCacheStatus();
    showToast(status.message, 'info');
}

/**
 * Toggle cachebuster and show status
 */
export async function toggleCachebusterUI() {
    const newState = cachebuster.toggleCachebuster();
    
    if (newState) {
        showToast('Cachebuster aktiviert - Seite neuladen');
    } else {
        showToast('Cachebuster deaktiviert');
    }
    
    console.log(`Cachebuster toggled to: ${newState}`);
}

/**
 * Clear all caches from UI
 */
export async function clearCachesUI() {
    try {
        await cachebuster.clearAllCaches();
        showToast('Cache und Service Worker geleert', 'success');
        
        // Reload page after a short delay
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        showToast('Fehler beim Leeren des Cache', 'error');
        console.error('Error clearing caches:', error);
    }
}