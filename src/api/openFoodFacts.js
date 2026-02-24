/**
 * Open Food Facts API integration.
 * Primary data source for product lookups.
 */

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';
const FETCH_TIMEOUT_MS = 4000;

function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fetch product from Open Food Facts by barcode.
 * Returns normalized product data or null if not found.
 */
export async function fetchFromOpenFoodFacts(barcode) {
  try {
    const response = await timedFetch(`${BASE_URL}/${barcode}.json`, {
      headers: {
        'User-Agent': 'BiteCheck - Indian Food Scanner - Version 1.0',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;

    return normalizeProduct(p, barcode);
  } catch (error) {
    console.warn('Open Food Facts API error:', error.message);
    return null;
  }
}

/**
 * Normalize Open Food Facts response to our product schema.
 */
function normalizeProduct(p, barcode) {
  const nutriments = p.nutriments || {};

  return {
    barcode: barcode,
    name: p.product_name || p.product_name_en || 'Unknown Product',
    brand: p.brands || '',
    category: p.categories_tags?.[0]?.replace('en:', '') || p.pnns_groups_1 || '',
    ingredients_text: p.ingredients_text || p.ingredients_text_en || '',
    // Per-100g values (used for scoring thresholds)
    sugar_100g: nutriments.sugars_100g ?? null,
    salt_100g: nutriments.salt_100g ?? null,
    saturated_fat_100g: nutriments['saturated-fat_100g'] ?? null,
    calories_100g: nutriments['energy-kcal_100g'] ?? null,
    protein_100g: nutriments.proteins_100g ?? null,
    carbs_100g: nutriments.carbohydrates_100g ?? null,
    fat_100g: nutriments.fat_100g ?? null,
    fiber_100g: nutriments.fiber_100g ?? null,
    // Per-serving values (used for display — matches what users see on the package)
    serving_size: p.serving_size || null,
    calories_serving: nutriments['energy-kcal_serving'] ?? null,
    protein_serving: nutriments.proteins_serving ?? null,
    carbs_serving: nutriments.carbohydrates_serving ?? null,
    fat_serving: nutriments.fat_serving ?? null,
    fiber_serving: nutriments.fiber_serving ?? null,
    sugar_serving: nutriments.sugars_serving ?? null,
    salt_serving: nutriments.salt_serving ?? null,
    saturated_fat_serving: nutriments['saturated-fat_serving'] ?? null,
    image_url: p.image_front_url || p.image_url || null,
    source: 'api',
    // Extra fields from OFF (not stored in DB but useful for display)
    _extra: {
      nutriscore_grade: p.nutriscore_grade || null,
      nova_group: p.nova_group || null,
      additives_tags: p.additives_tags || [],
      allergens: p.allergens || '',
      quantity: p.quantity || '',
      packaging: p.packaging || '',
      countries: p.countries || '',
    },
  };
}
