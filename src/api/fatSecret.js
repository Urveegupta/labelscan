/**
 * FatSecret Platform API integration.
 * Secondary data source — strong Indian product coverage.
 *
 * Uses OAuth 2.0 Client Credentials flow.
 * Get your free API key at: https://platform.fatsecret.com/api/
 *
 * Set your credentials below or via environment variables.
 */

const CLIENT_ID = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET || '';

const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const API_URL = 'https://platform.fatsecret.com/rest';
const FETCH_TIMEOUT_MS = 4000;

let cachedToken = null;
let tokenExpiry = 0;

/** fetch with AbortController timeout so requests can't hang forever. */
function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Check if FatSecret credentials are configured.
 */
export function isFatSecretConfigured() {
  return CLIENT_ID.length > 0 && CLIENT_SECRET.length > 0;
}

/**
 * Get an OAuth 2.0 access token (cached until expiry).
 */
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await timedFetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`,
  });

  if (!response.ok) {
    throw new Error(`FatSecret token error: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Expire 60s early to avoid edge cases
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

/**
 * Call a FatSecret API method.
 */
async function apiCall(method, params = {}) {
  const token = await getAccessToken();

  const query = new URLSearchParams({ method, format: 'json', ...params });
  const response = await timedFetch(`${API_URL}/server.api?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json();
}

/**
 * Fetch product from FatSecret by barcode.
 * Returns normalized product data or null.
 */
export async function fetchFromFatSecret(barcode) {
  if (!isFatSecretConfigured()) return null;

  try {
    // Step 1: Find food ID by barcode
    const barcodeResult = await apiCall('food.find_id_for_barcode', { barcode });
    const foodId = barcodeResult?.food_id?.value;
    if (!foodId) return null;

    // Step 2: Get full food details
    const foodResult = await apiCall('food.get.v4', { food_id: foodId });
    const food = foodResult?.food;
    if (!food) return null;

    return normalizeFood(food, barcode);
  } catch (error) {
    console.warn('FatSecret API error:', error.message);
    return null;
  }
}

/**
 * Normalize FatSecret response to our product schema.
 */
function normalizeFood(food, barcode) {
  // FatSecret returns servings as an array; pick the per-100g or default serving
  const servings = food.servings?.serving;
  const servingList = Array.isArray(servings) ? servings : servings ? [servings] : [];

  // Prefer "per 100g" serving, fall back to first serving
  const per100g = servingList.find(
    (s) => s.metric_serving_unit === 'g' && parseFloat(s.metric_serving_amount) === 100
  );
  const defaultServing = servingList[0];
  const serving = per100g || defaultServing;

  if (!serving) {
    // No nutrition data at all — return basic product info
    return {
      barcode,
      name: food.food_name || 'Unknown Product',
      brand: food.brand_name || '',
      category: food.food_type || '',
      ingredients_text: '',
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
      image_url: null,
      source: 'fatsecret',
    };
  }

  // If we have a per-100g serving, use it directly for _100g fields.
  // Otherwise, scale from the serving's metric amount.
  const metricAmount = parseFloat(serving.metric_serving_amount) || 0;
  const scale = per100g ? 1 : metricAmount > 0 ? 100 / metricAmount : null;

  function scaled(val) {
    const n = parseFloat(val);
    if (isNaN(n) || scale == null) return null;
    return Math.round(n * scale * 10) / 10;
  }

  function direct(val) {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  // Per-serving values from the default (first) serving
  const ds = defaultServing || serving;

  return {
    barcode,
    name: food.food_name || 'Unknown Product',
    brand: food.brand_name || '',
    category: food.food_type || '',
    ingredients_text: '',
    // Per 100g (scaled if needed)
    sugar_100g: scaled(serving.sugar),
    salt_100g: scaled(serving.sodium) != null ? Math.round((scaled(serving.sodium) / 1000) * 2.5 * 10) / 10 : null, // mg sodium → g salt
    saturated_fat_100g: scaled(serving.saturated_fat),
    calories_100g: scaled(serving.calories),
    protein_100g: scaled(serving.protein),
    carbs_100g: scaled(serving.carbohydrate),
    fat_100g: scaled(serving.fat),
    fiber_100g: scaled(serving.fiber),
    // Per serving
    serving_size: ds.serving_description || null,
    calories_serving: direct(ds.calories),
    protein_serving: direct(ds.protein),
    carbs_serving: direct(ds.carbohydrate),
    fat_serving: direct(ds.fat),
    fiber_serving: direct(ds.fiber),
    sugar_serving: direct(ds.sugar),
    salt_serving: direct(ds.sodium) != null ? Math.round((direct(ds.sodium) / 1000) * 2.5 * 10) / 10 : null,
    saturated_fat_serving: direct(ds.saturated_fat),
    image_url: null,
    source: 'fatsecret',
  };
}
