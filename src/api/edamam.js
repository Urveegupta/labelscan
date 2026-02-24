/**
 * Edamam Food Database API integration.
 * Free Developer tier — 200 API calls/day.
 *
 * Has 680K+ UPC codes with full nutrition data (150+ nutrients).
 * Get your free API key at: https://developer.edamam.com/
 *
 * Set your credentials below or via environment variables.
 */

const APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID || '';
const APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY || '';

const API_URL = 'https://api.edamam.com/api/food-database/v2/parser';
const FETCH_TIMEOUT_MS = 4000;

function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Check if Edamam credentials are configured.
 */
export function isEdamamConfigured() {
  return APP_ID.length > 0 && APP_KEY.length > 0;
}

/**
 * Fetch product from Edamam by barcode (UPC/EAN).
 * Returns normalized product data or null.
 */
export async function fetchFromEdamam(barcode) {
  if (!isEdamamConfigured()) return null;

  try {
    const response = await timedFetch(
      `${API_URL}?upc=${barcode}&app_id=${encodeURIComponent(APP_ID)}&app_key=${encodeURIComponent(APP_KEY)}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Edamam returns hints array with food matches
    const food = data.hints?.[0]?.food;
    if (!food) return null;

    return normalizeFood(food, barcode);
  } catch (error) {
    console.warn('Edamam API error:', error.message);
    return null;
  }
}

/**
 * Normalize Edamam response to our product schema.
 */
function normalizeFood(food, barcode) {
  const n = food.nutrients || {};

  // Edamam returns nutrients per 100g by default
  const calories = n.ENERC_KCAL ?? null;
  const protein = n.PROCNT ?? null;
  const fat = n.FAT ?? null;
  const carbs = n.CHOCDF ?? null;
  const fiber = n.FIBTG ?? null;
  const sugar = n.SUGAR ?? null;
  const saturatedFat = n.FASAT ?? null;
  // Edamam provides sodium in mg; convert to salt in g (salt = sodium * 2.5 / 1000)
  const sodiumMg = n.NA ?? null;
  const salt = sodiumMg != null ? Math.round((sodiumMg / 1000) * 2.5 * 10) / 10 : null;

  return {
    barcode,
    name: food.label || food.knownAs || 'Unknown Product',
    brand: food.brand || '',
    category: food.category || '',
    ingredients_text: '',
    // Per 100g
    sugar_100g: sugar,
    salt_100g: salt,
    saturated_fat_100g: saturatedFat,
    calories_100g: calories,
    protein_100g: protein,
    carbs_100g: carbs,
    fat_100g: fat,
    fiber_100g: fiber,
    // Per serving (Edamam doesn't provide per-serving in barcode lookup)
    serving_size: null,
    calories_serving: null,
    protein_serving: null,
    carbs_serving: null,
    fat_serving: null,
    fiber_serving: null,
    sugar_serving: null,
    salt_serving: null,
    saturated_fat_serving: null,
    image_url: food.image || null,
    source: 'edamam',
  };
}
