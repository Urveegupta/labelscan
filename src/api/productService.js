/**
 * Unified product lookup service.
 * Fallback chain: OFF → FatSecret → UPC ItemDB → Edamam → local cache → not found.
 *
 * Tries multiple data sources in sequence for maximum barcode coverage,
 * especially for Indian products which are poorly represented in any single database.
 */

import { fetchFromOpenFoodFacts } from './openFoodFacts';
import { fetchFromFatSecret } from './fatSecret';
import { fetchFromUpcItemDb } from './upcItemDb';
import { fetchFromEdamam } from './edamam';
import { getProductByBarcode, cacheProduct } from '../database/database';
import { scoreProduct } from '../engine/scoringEngine';

/** Per-source timeout — if a source doesn't respond in 5s, skip it. */
const SOURCE_TIMEOUT_MS = 5000;

/**
 * Data sources tried in order. Each entry:
 *   fetch — async function(barcode) → product | null
 *   source — label stored alongside the product
 *   name — human-readable, for console warnings
 */
const SOURCES = [
  { fetch: fetchFromOpenFoodFacts, source: 'api', name: 'Open Food Facts' },
  { fetch: fetchFromFatSecret, source: 'fatsecret', name: 'FatSecret' },
  { fetch: fetchFromUpcItemDb, source: 'upcitemdb', name: 'UPC ItemDB' },
  { fetch: fetchFromEdamam, source: 'edamam', name: 'Edamam' },
];

/**
 * Race a fetch against a timeout so no single source can stall the chain.
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}

/**
 * Look up a product by barcode.
 * Strategy: Try each remote source in order → local cache → not found.
 *
 * @param {string} barcode
 * @returns {Object} { product, score, source } or { product: null }
 */
export async function lookupProduct(barcode) {
  // 1. Try each remote data source in sequence (with timeout per source)
  for (const { fetch: fetchFn, source, name } of SOURCES) {
    try {
      const product = await withTimeout(fetchFn(barcode), SOURCE_TIMEOUT_MS);
      if (product) {
        await cacheProduct(product);
        const score = scoreProduct(product);
        return { product, score, source };
      }
    } catch (err) {
      console.warn(`${name} lookup failed:`, err.message);
    }
  }

  // 2. Fallback to local database cache
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

  // 3. Not found in any source
  return { product: null, score: null, source: null };
}
