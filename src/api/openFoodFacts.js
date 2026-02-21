/**
 * Open Food Facts API integration.
 * Primary data source for product lookups.
 */

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

/**
 * Fetch product from Open Food Facts by barcode.
 * Returns normalized product data or null if not found.
 */
export async function fetchFromOpenFoodFacts(barcode) {
  try {
    const response = await fetch(`${BASE_URL}/${barcode}.json`, {
      headers: {
        'User-Agent': 'LabelScan - Indian Food Scanner - Version 1.0',
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
    sugar_100g: nutriments.sugars_100g ?? nutriments.sugars ?? null,
    salt_100g: nutriments.salt_100g ?? nutriments.salt ?? null,
    saturated_fat_100g: nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'] ?? null,
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
