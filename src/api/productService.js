/**
 * Unified product lookup service.
 * Tries Open Food Facts API first, then falls back to local SQLite database.
 */

import { fetchFromOpenFoodFacts } from './openFoodFacts';
import { getProductByBarcode, cacheProduct } from '../database/database';
import { scoreProduct } from '../engine/scoringEngine';

/**
 * Look up a product by barcode.
 * Strategy: API first → local DB fallback → not found.
 *
 * @param {string} barcode
 * @returns {Object} { product, score, source } or { product: null }
 */
export async function lookupProduct(barcode) {
  // 1. Try Open Food Facts API
  try {
    const apiProduct = await fetchFromOpenFoodFacts(barcode);
    if (apiProduct && apiProduct.name !== 'Unknown Product') {
      // Cache in local DB for offline access
      await cacheProduct(apiProduct);

      const score = scoreProduct(apiProduct);
      return {
        product: apiProduct,
        score,
        source: 'api',
      };
    }
  } catch (err) {
    console.warn('API lookup failed, trying local DB:', err.message);
  }

  // 2. Fallback to local database
  try {
    const localProduct = await getProductByBarcode(barcode);
    if (localProduct) {
      const score = scoreProduct(localProduct);
      return {
        product: localProduct,
        score,
        source: localProduct.source || 'local',
      };
    }
  } catch (err) {
    console.warn('Local DB lookup failed:', err.message);
  }

  // 3. Not found
  return { product: null, score: null, source: null };
}
