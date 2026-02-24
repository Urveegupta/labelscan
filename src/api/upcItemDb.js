/**
 * UPC ItemDB API integration.
 * Free tier — no API key needed, 100 requests/day.
 *
 * Note: Returns product info (name, brand, images) but NO nutrition data.
 * Useful as a fallback for product identification.
 */

const API_URL = 'https://api.upcitemdb.com/prod/trial/lookup';
const FETCH_TIMEOUT_MS = 4000;

function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fetch product from UPC ItemDB by barcode.
 * Returns normalized product data or null.
 */
export async function fetchFromUpcItemDb(barcode) {
  try {
    const response = await timedFetch(`${API_URL}?upc=${barcode}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.code !== 'OK' || !data.items || data.items.length === 0) return null;

    return normalizeItem(data.items[0], barcode);
  } catch (error) {
    console.warn('UPC ItemDB API error:', error.message);
    return null;
  }
}

/**
 * Normalize UPC ItemDB response to our product schema.
 */
function normalizeItem(item, barcode) {
  return {
    barcode,
    name: item.title || 'Unknown Product',
    brand: item.brand || '',
    category: item.category || '',
    ingredients_text: item.description || '',
    // UPC ItemDB doesn't provide nutrition data
    sugar_100g: null,
    salt_100g: null,
    saturated_fat_100g: null,
    calories_100g: null,
    protein_100g: null,
    carbs_100g: null,
    fat_100g: null,
    fiber_100g: null,
    serving_size: null,
    calories_serving: null,
    protein_serving: null,
    carbs_serving: null,
    fat_serving: null,
    fiber_serving: null,
    sugar_serving: null,
    salt_serving: null,
    saturated_fat_serving: null,
    image_url: item.images?.[0] || null,
    source: 'upcitemdb',
  };
}
