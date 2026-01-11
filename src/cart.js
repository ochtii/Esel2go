/**
 * Cart Module - Shopping Cart Logic & Business Rules
 * Manages cart items, calculations, and special promotions
 */

// Cart state
let cartItems = [];

// Business constants
const STANDARD_SHIPPING_COST = 9.90;
const FREE_SHIPPING_THRESHOLD = 420;
const BONUS_ITEM_THRESHOLD = 1000;
const BONUS_ITEM = {
    id: 'bonus-seminar',
    name: 'Gratis Seminar: Kamel abwixxen Einsteigerkurs',
    price: 0,
    isBonus: true
};

/**
 * Load cart from localStorage
 */
export function loadCart() {
    const saved = localStorage.getItem('esel2go-cart');
    if (saved) {
        try {
            cartItems = JSON.parse(saved);
        } catch (error) {
            console.error('Failed to load cart:', error);
            cartItems = [];
        }
    }
    return cartItems;
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('esel2go-cart', JSON.stringify(cartItems));
}

/**
 * Add item to cart
 * @param {Object} product - Product object with id, name, price, etc.
 * @param {number} quantity - Quantity to add (default: 1)
 */
export function addToCart(product, quantity = 1) {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartItems.push({
            ...product,
            quantity: quantity
        });
    }
    
    saveCart();
    return cartItems;
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 */
export function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCart();
    return cartItems;
}

/**
 * Update item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export function updateQuantity(productId, quantity) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
        }
    }
    return cartItems;
}

/**
 * Clear entire cart
 */
export function clearCart() {
    cartItems = [];
    saveCart();
    return cartItems;
}

/**
 * Get all cart items
 */
export function getCartItems() {
    return cartItems;
}

/**
 * Calculate subtotal (without shipping)
 */
export function calculateSubtotal() {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate shipping cost based on subtotal
 */
export function calculateShippingCost() {
    const subtotal = calculateSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

/**
 * Check if free shipping applies
 */
export function hasFreeShipping() {
    return calculateShippingCost() === 0;
}

/**
 * Check if bonus item should be added
 */
export function shouldAddBonusItem() {
    const subtotal = calculateSubtotal();
    return subtotal >= BONUS_ITEM_THRESHOLD;
}

/**
 * Get or add bonus item
 */
export function updateBonusItem() {
    const hasBonusItem = cartItems.some(item => item.isBonus);
    const shouldAdd = shouldAddBonusItem();
    
    if (shouldAdd && !hasBonusItem) {
        // Add bonus item
        cartItems.push({
            ...BONUS_ITEM,
            quantity: 1
        });
        saveCart();
        return true;
    } else if (!shouldAdd && hasBonusItem) {
        // Remove bonus item
        cartItems = cartItems.filter(item => !item.isBonus);
        saveCart();
        return false;
    }
    
    return hasBonusItem;
}

/**
 * Calculate total (subtotal + shipping - bonus items)
 * Note: Bonus items are free, so they don't affect total
 */
export function calculateTotal() {
    const subtotal = calculateSubtotal();
    const shipping = calculateShippingCost();
    return subtotal + shipping;
}

/**
 * Get cart summary object
 */
export function getCartSummary() {
    const subtotal = calculateSubtotal();
    const shippingCost = calculateShippingCost();
    const total = calculateTotal();
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const hasBonusItem = shouldAddBonusItem();
    
    return {
        itemCount,
        subtotal,
        shippingCost,
        total,
        hasFreeShipping: hasFreeShipping(),
        hasBonusItem,
        items: cartItems
    };
}

/**
 * Check if cart is empty
 */
export function isCartEmpty() {
    return cartItems.length === 0;
}

/**
 * Get cart item count
 */
export function getCartItemCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}
