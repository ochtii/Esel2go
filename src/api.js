/**
 * API Module - Data Fetching & Management
 * Handles fetching categories and products from JSON files
 */

let cachedCategories = null;
let cachedProducts = null;

/**
 * Fetch all categories
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories() {
    if (cachedCategories) {
        return cachedCategories;
    }
    
    try {
        const response = await fetch('./data/categories.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        cachedCategories = await response.json();
        return cachedCategories;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
}

/**
 * Fetch all products
 * @returns {Promise<Array>} Array of product objects
 */
export async function fetchProducts() {
    if (cachedProducts) {
        return cachedProducts;
    }
    
    try {
        const response = await fetch('./data/products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        cachedProducts = await response.json();
        return cachedProducts;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

/**
 * Get a product by ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object|null>} Product object or null
 */
export async function getProductById(productId) {
    const products = await fetchProducts();
    return products.find(p => p.id === productId) || null;
}

/**
 * Get products filtered by category
 * @param {string} categoryId - The category ID (or null for all)
 * @returns {Promise<Array>} Filtered product array
 */
export async function getProductsByCategory(categoryId) {
    const products = await fetchProducts();
    if (!categoryId || categoryId === 'all') {
        return products;
    }
    return products.filter(p => p.categoryId === categoryId);
}

/**
 * Get a category by ID
 * @param {string} categoryId - The category ID
 * @returns {Promise<Object|null>} Category object or null
 */
export async function getCategoryById(categoryId) {
    const categories = await fetchCategories();
    return categories.find(c => c.id === categoryId) || null;
}

/**
 * Clear cache (useful for testing or forced refresh)
 */
export function clearCache() {
    cachedCategories = null;
    cachedProducts = null;
}
